#!/usr/bin/env python3
"""
Script de restauração do sistema de monitoramento DataClinica
Restaura configurações, dashboards e dados a partir de backups
"""

import os
import sys
import json
import shutil
import tarfile
import datetime
import subprocess
from pathlib import Path
from typing import Dict, List, Optional

# Configurações
BACKUP_DIR = os.getenv('BACKUP_DIR', '/opt/dataclinica/backups/monitoring')
GRAFANA_URL = os.getenv('GRAFANA_URL', 'http://localhost:3000')
GRAFANA_ADMIN_USER = os.getenv('GRAFANA_ADMIN_USER', 'admin')
GRAFANA_ADMIN_PASSWORD = os.getenv('GRAFANA_ADMIN_PASSWORD', 'admin123')

class MonitoringRestore:
    def __init__(self, backup_file: str = None):
        self.backup_dir = Path(BACKUP_DIR)
        self.backup_file = backup_file
        self.temp_dir = None
        self.restore_dir = None
        
        if not self.backup_dir.exists():
            raise FileNotFoundError(f"Diretório de backup não encontrado: {self.backup_dir}")
    
    def list_available_backups(self) -> List[Dict]:
        """Lista backups disponíveis"""
        backups = []
        
        for backup_file in sorted(self.backup_dir.glob("monitoring_backup_*.tar.gz"), reverse=True):
            # Extrai timestamp do nome do arquivo
            timestamp_str = backup_file.stem.replace("monitoring_backup_", "")
            
            try:
                timestamp = datetime.datetime.strptime(timestamp_str, "%Y%m%d_%H%M%S")
                size_mb = backup_file.stat().st_size / (1024 * 1024)
                
                # Procura arquivo de informações
                info_file = self.backup_dir / f"{backup_file.stem}_info.json"
                info = {}
                if info_file.exists():
                    with open(info_file, 'r', encoding='utf-8') as f:
                        info = json.load(f)
                
                backups.append({
                    "file": str(backup_file),
                    "timestamp": timestamp_str,
                    "date": timestamp.strftime("%d/%m/%Y %H:%M:%S"),
                    "size_mb": round(size_mb, 2),
                    "info": info
                })
                
            except ValueError:
                continue
        
        return backups
    
    def select_backup(self) -> str:
        """Permite ao usuário selecionar um backup"""
        backups = self.list_available_backups()
        
        if not backups:
            raise FileNotFoundError("Nenhum backup encontrado")
        
        print("\n=== Backups Disponíveis ===")
        for i, backup in enumerate(backups, 1):
            print(f"{i:2d}. {backup['date']} - {backup['size_mb']} MB")
            if backup['info']:
                components = ", ".join(backup['info'].get('components', []))
                print(f"     Componentes: {components}")
        
        while True:
            try:
                choice = input("\nSelecione o backup (número): ").strip()
                if choice.lower() in ['q', 'quit', 'sair']:
                    sys.exit(0)
                
                index = int(choice) - 1
                if 0 <= index < len(backups):
                    return backups[index]['file']
                else:
                    print("Número inválido. Tente novamente.")
            except ValueError:
                print("Por favor, digite um número válido.")
    
    def extract_backup(self, backup_file: str) -> bool:
        """Extrai arquivo de backup"""
        print(f"Extraindo backup: {Path(backup_file).name}")
        
        try:
            # Cria diretório temporário
            timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
            self.temp_dir = Path(f"/tmp/restore_{timestamp}")
            self.temp_dir.mkdir(parents=True, exist_ok=True)
            
            # Extrai arquivo
            with tarfile.open(backup_file, 'r:gz') as tar:
                tar.extractall(self.temp_dir)
            
            # Encontra diretório de restauração
            extracted_dirs = [d for d in self.temp_dir.iterdir() if d.is_dir()]
            if not extracted_dirs:
                raise Exception("Nenhum diretório encontrado no backup")
            
            self.restore_dir = extracted_dirs[0]
            print(f"  ✓ Backup extraído em: {self.restore_dir}")
            
            return True
            
        except Exception as e:
            print(f"  ✗ Erro ao extrair backup: {e}")
            return False
    
    def restore_grafana_dashboards(self) -> bool:
        """Restaura dashboards do Grafana"""
        print("Restaurando dashboards do Grafana...")
        
        try:
            import requests
            session = requests.Session()
            session.auth = (GRAFANA_ADMIN_USER, GRAFANA_ADMIN_PASSWORD)
            
            dashboards_dir = self.restore_dir / "grafana" / "dashboards"
            if not dashboards_dir.exists():
                print("  ⚠ Diretório de dashboards não encontrado no backup")
                return True
            
            restored_count = 0
            for dashboard_file in dashboards_dir.glob("*.json"):
                try:
                    with open(dashboard_file, 'r', encoding='utf-8') as f:
                        dashboard_data = json.load(f)
                    
                    # Prepara dados para importação
                    import_data = {
                        "dashboard": dashboard_data,
                        "overwrite": True,
                        "inputs": [],
                        "folderId": 0
                    }
                    
                    # Remove ID para permitir reimportação
                    if 'id' in import_data['dashboard']:
                        del import_data['dashboard']['id']
                    
                    response = session.post(
                        f"{GRAFANA_URL}/api/dashboards/db",
                        json=import_data,
                        headers={'Content-Type': 'application/json'}
                    )
                    
                    if response.status_code in [200, 201]:
                        print(f"  ✓ Dashboard '{dashboard_file.stem}' restaurado")
                        restored_count += 1
                    else:
                        print(f"  ✗ Erro ao restaurar '{dashboard_file.stem}': {response.text}")
                        
                except Exception as e:
                    print(f"  ✗ Erro ao processar '{dashboard_file.name}': {e}")
            
            print(f"  ✓ {restored_count} dashboards restaurados")
            return True
            
        except ImportError:
            print("  ✗ Biblioteca 'requests' não encontrada. Instalando...")
            subprocess.run([sys.executable, '-m', 'pip', 'install', 'requests'])
            return self.restore_grafana_dashboards()
        except Exception as e:
            print(f"  ✗ Erro ao restaurar dashboards: {e}")
            return False
    
    def restore_grafana_datasources(self) -> bool:
        """Restaura datasources do Grafana"""
        print("Restaurando datasources do Grafana...")
        
        try:
            import requests
            session = requests.Session()
            session.auth = (GRAFANA_ADMIN_USER, GRAFANA_ADMIN_PASSWORD)
            
            datasources_file = self.restore_dir / "grafana" / "datasources" / "datasources.json"
            if not datasources_file.exists():
                print("  ⚠ Arquivo de datasources não encontrado no backup")
                return True
            
            with open(datasources_file, 'r', encoding='utf-8') as f:
                datasources = json.load(f)
            
            restored_count = 0
            for datasource in datasources:
                # Remove campos que não devem ser enviados na criação
                datasource_data = datasource.copy()
                for field in ['id', 'orgId', 'version', 'readOnly']:
                    datasource_data.pop(field, None)
                
                response = session.post(
                    f"{GRAFANA_URL}/api/datasources",
                    json=datasource_data,
                    headers={'Content-Type': 'application/json'}
                )
                
                if response.status_code in [200, 201, 409]:  # 409 = já existe
                    print(f"  ✓ Datasource '{datasource.get('name')}' restaurado")
                    restored_count += 1
                else:
                    print(f"  ✗ Erro ao restaurar datasource '{datasource.get('name')}': {response.text}")
            
            print(f"  ✓ {restored_count} datasources processados")
            return True
            
        except Exception as e:
            print(f"  ✗ Erro ao restaurar datasources: {e}")
            return False
    
    def restore_prometheus_config(self) -> bool:
        """Restaura configurações do Prometheus"""
        print("Restaurando configurações do Prometheus...")
        
        try:
            prometheus_backup_dir = self.restore_dir / "prometheus"
            if not prometheus_backup_dir.exists():
                print("  ⚠ Configurações do Prometheus não encontradas no backup")
                return True
            
            # Diretório de destino
            base_dir = Path(__file__).parent.parent
            prometheus_dir = base_dir / "prometheus"
            prometheus_dir.mkdir(exist_ok=True)
            
            # Copia arquivos de configuração
            restored_count = 0
            for config_file in prometheus_backup_dir.glob("*.yml"):
                dest_file = prometheus_dir / config_file.name
                
                # Faz backup do arquivo existente
                if dest_file.exists():
                    backup_name = f"{dest_file.stem}.backup.{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.yml"
                    shutil.copy2(dest_file, dest_file.parent / backup_name)
                
                shutil.copy2(config_file, dest_file)
                print(f"  ✓ {config_file.name} restaurado")
                restored_count += 1
            
            # Restaura regras e alertas se existirem
            for subdir in ['rules', 'alerts']:
                subdir_path = prometheus_backup_dir / subdir
                if subdir_path.exists():
                    dest_subdir = prometheus_dir / subdir
                    dest_subdir.mkdir(exist_ok=True)
                    
                    for rule_file in subdir_path.glob("*.yml"):
                        dest_file = dest_subdir / rule_file.name
                        shutil.copy2(rule_file, dest_file)
                        print(f"  ✓ {subdir}/{rule_file.name} restaurado")
                        restored_count += 1
            
            print(f"  ✓ {restored_count} arquivos do Prometheus restaurados")
            return True
            
        except Exception as e:
            print(f"  ✗ Erro ao restaurar configurações do Prometheus: {e}")
            return False
    
    def restore_alertmanager_config(self) -> bool:
        """Restaura configurações do Alertmanager"""
        print("Restaurando configurações do Alertmanager...")
        
        try:
            alertmanager_backup_dir = self.restore_dir / "alertmanager"
            if not alertmanager_backup_dir.exists():
                print("  ⚠ Configurações do Alertmanager não encontradas no backup")
                return True
            
            base_dir = Path(__file__).parent.parent
            alertmanager_dir = base_dir / "alertmanager"
            alertmanager_dir.mkdir(exist_ok=True)
            
            config_file = alertmanager_backup_dir / "alertmanager.yml"
            if config_file.exists():
                dest_file = alertmanager_dir / "alertmanager.yml"
                
                # Faz backup do arquivo existente
                if dest_file.exists():
                    backup_name = f"alertmanager.backup.{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.yml"
                    shutil.copy2(dest_file, dest_file.parent / backup_name)
                
                shutil.copy2(config_file, dest_file)
                print("  ✓ Configuração do Alertmanager restaurada")
            
            return True
            
        except Exception as e:
            print(f"  ✗ Erro ao restaurar configurações do Alertmanager: {e}")
            return False
    
    def restore_loki_config(self) -> bool:
        """Restaura configurações do Loki"""
        print("Restaurando configurações do Loki...")
        
        try:
            loki_backup_dir = self.restore_dir / "loki"
            if not loki_backup_dir.exists():
                print("  ⚠ Configurações do Loki não encontradas no backup")
                return True
            
            base_dir = Path(__file__).parent.parent
            restored_count = 0
            
            # Restaura configurações do Loki e Promtail
            for component in ['loki', 'promtail']:
                component_dir = loki_backup_dir / component
                if component_dir.exists():
                    dest_dir = base_dir / component
                    dest_dir.mkdir(exist_ok=True)
                    
                    for config_file in component_dir.glob("*.yml"):
                        dest_file = dest_dir / config_file.name
                        
                        # Faz backup do arquivo existente
                        if dest_file.exists():
                            backup_name = f"{dest_file.stem}.backup.{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.yml"
                            shutil.copy2(dest_file, dest_file.parent / backup_name)
                        
                        shutil.copy2(config_file, dest_file)
                        print(f"  ✓ {component}/{config_file.name} restaurado")
                        restored_count += 1
            
            print(f"  ✓ {restored_count} arquivos do Loki restaurados")
            return True
            
        except Exception as e:
            print(f"  ✗ Erro ao restaurar configurações do Loki: {e}")
            return False
    
    def cleanup_temp_files(self) -> bool:
        """Remove arquivos temporários"""
        try:
            if self.temp_dir and self.temp_dir.exists():
                shutil.rmtree(self.temp_dir)
                print("  ✓ Arquivos temporários removidos")
            return True
        except Exception as e:
            print(f"  ✗ Erro ao limpar arquivos temporários: {e}")
            return False
    
    def run_restore(self, backup_file: str = None) -> bool:
        """Executa todo o processo de restauração"""
        print("=== Iniciando Restauração do Sistema de Monitoramento ===")
        
        try:
            # Seleciona arquivo de backup
            if not backup_file:
                backup_file = self.select_backup()
            
            print(f"\nArquivo selecionado: {Path(backup_file).name}")
            
            # Confirma restauração
            confirm = input("\nDeseja continuar com a restauração? (s/N): ").strip().lower()
            if confirm not in ['s', 'sim', 'y', 'yes']:
                print("Restauração cancelada.")
                return False
            
            # Lista de operações de restauração
            restore_operations = [
                ("Extração do backup", lambda: self.extract_backup(backup_file)),
                ("Dashboards do Grafana", self.restore_grafana_dashboards),
                ("Datasources do Grafana", self.restore_grafana_datasources),
                ("Configurações do Prometheus", self.restore_prometheus_config),
                ("Configurações do Alertmanager", self.restore_alertmanager_config),
                ("Configurações do Loki", self.restore_loki_config),
                ("Limpeza de arquivos temporários", self.cleanup_temp_files)
            ]
            
            success_count = 0
            for operation_name, operation_func in restore_operations:
                print(f"\n{operation_name}...")
                if operation_func():
                    success_count += 1
                else:
                    print(f"✗ Falha em: {operation_name}")
            
            print(f"\n=== Restauração Concluída ===")
            print(f"Operações executadas com sucesso: {success_count}/{len(restore_operations)}")
            
            if success_count >= len(restore_operations) - 1:  # Permite 1 falha
                print("\n✓ Restauração realizada com sucesso!")
                print("\n⚠ Lembre-se de reiniciar os serviços de monitoramento para aplicar as configurações.")
                return True
            else:
                print("\n⚠ Algumas operações de restauração falharam. Verifique os logs acima.")
                return False
                
        except KeyboardInterrupt:
            print("\n\nRestauração cancelada pelo usuário.")
            self.cleanup_temp_files()
            return False
        except Exception as e:
            print(f"\nErro inesperado: {e}")
            self.cleanup_temp_files()
            return False

def main():
    """Função principal"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Restaura backup do sistema de monitoramento')
    parser.add_argument('--backup-file', '-f', help='Arquivo de backup específico para restaurar')
    parser.add_argument('--list', '-l', action='store_true', help='Lista backups disponíveis')
    
    args = parser.parse_args()
    
    try:
        restore = MonitoringRestore()
        
        if args.list:
            backups = restore.list_available_backups()
            if not backups:
                print("Nenhum backup encontrado.")
                return
            
            print("\n=== Backups Disponíveis ===")
            for backup in backups:
                print(f"Data: {backup['date']}")
                print(f"Arquivo: {Path(backup['file']).name}")
                print(f"Tamanho: {backup['size_mb']} MB")
                if backup['info']:
                    print(f"Componentes: {', '.join(backup['info'].get('components', []))}")
                print("-" * 50)
            return
        
        success = restore.run_restore(args.backup_file)
        sys.exit(0 if success else 1)
        
    except Exception as e:
        print(f"\nErro: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()