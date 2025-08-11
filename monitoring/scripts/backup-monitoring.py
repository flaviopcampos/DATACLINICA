#!/usr/bin/env python3
"""
Script de backup do sistema de monitoramento DataClinica
Faz backup das configurações, dashboards e dados importantes
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
RETENTION_DAYS = int(os.getenv('BACKUP_RETENTION_DAYS', '30'))
GRAFANA_URL = os.getenv('GRAFANA_URL', 'http://localhost:3000')
GRAFANA_ADMIN_USER = os.getenv('GRAFANA_ADMIN_USER', 'admin')
GRAFANA_ADMIN_PASSWORD = os.getenv('GRAFANA_ADMIN_PASSWORD', 'admin123')

class MonitoringBackup:
    def __init__(self):
        self.backup_dir = Path(BACKUP_DIR)
        self.backup_dir.mkdir(parents=True, exist_ok=True)
        self.timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
        self.backup_name = f"monitoring_backup_{self.timestamp}"
        self.temp_dir = self.backup_dir / f"temp_{self.timestamp}"
        self.temp_dir.mkdir(exist_ok=True)
        
    def backup_grafana_dashboards(self) -> bool:
        """Faz backup dos dashboards do Grafana via API"""
        print("Fazendo backup dos dashboards do Grafana...")
        
        try:
            import requests
            session = requests.Session()
            session.auth = (GRAFANA_ADMIN_USER, GRAFANA_ADMIN_PASSWORD)
            
            # Lista todos os dashboards
            response = session.get(f"{GRAFANA_URL}/api/search?type=dash-db")
            
            if response.status_code != 200:
                print(f"  ✗ Erro ao listar dashboards: {response.text}")
                return False
            
            dashboards = response.json()
            dashboards_dir = self.temp_dir / "grafana" / "dashboards"
            dashboards_dir.mkdir(parents=True, exist_ok=True)
            
            for dashboard in dashboards:
                uid = dashboard.get('uid')
                if not uid:
                    continue
                
                # Obtém o dashboard completo
                dash_response = session.get(f"{GRAFANA_URL}/api/dashboards/uid/{uid}")
                
                if dash_response.status_code == 200:
                    dash_data = dash_response.json()
                    filename = f"{dashboard.get('title', uid).replace(' ', '_').lower()}.json"
                    
                    with open(dashboards_dir / filename, 'w', encoding='utf-8') as f:
                        json.dump(dash_data['dashboard'], f, indent=2, ensure_ascii=False)
                    
                    print(f"  ✓ Dashboard '{dashboard.get('title')}' salvo")
                else:
                    print(f"  ✗ Erro ao obter dashboard {uid}: {dash_response.text}")
            
            return True
            
        except ImportError:
            print("  ✗ Biblioteca 'requests' não encontrada. Instalando...")
            subprocess.run([sys.executable, '-m', 'pip', 'install', 'requests'])
            return self.backup_grafana_dashboards()
        except Exception as e:
            print(f"  ✗ Erro ao fazer backup dos dashboards: {e}")
            return False
    
    def backup_grafana_datasources(self) -> bool:
        """Faz backup dos datasources do Grafana"""
        print("Fazendo backup dos datasources do Grafana...")
        
        try:
            import requests
            session = requests.Session()
            session.auth = (GRAFANA_ADMIN_USER, GRAFANA_ADMIN_PASSWORD)
            
            response = session.get(f"{GRAFANA_URL}/api/datasources")
            
            if response.status_code != 200:
                print(f"  ✗ Erro ao listar datasources: {response.text}")
                return False
            
            datasources = response.json()
            datasources_dir = self.temp_dir / "grafana" / "datasources"
            datasources_dir.mkdir(parents=True, exist_ok=True)
            
            with open(datasources_dir / "datasources.json", 'w', encoding='utf-8') as f:
                json.dump(datasources, f, indent=2, ensure_ascii=False)
            
            print(f"  ✓ {len(datasources)} datasources salvos")
            return True
            
        except Exception as e:
            print(f"  ✗ Erro ao fazer backup dos datasources: {e}")
            return False
    
    def backup_prometheus_config(self) -> bool:
        """Faz backup das configurações do Prometheus"""
        print("Fazendo backup das configurações do Prometheus...")
        
        try:
            prometheus_dir = self.temp_dir / "prometheus"
            prometheus_dir.mkdir(parents=True, exist_ok=True)
            
            # Caminhos dos arquivos de configuração
            config_files = [
                "/opt/dataclinica/monitoring/prometheus/prometheus.yml",
                "/opt/dataclinica/monitoring/prometheus/rules/*.yml",
                "/opt/dataclinica/monitoring/prometheus/alerts/*.yml"
            ]
            
            base_dir = Path("/opt/dataclinica/monitoring")
            if not base_dir.exists():
                # Tenta o diretório atual
                base_dir = Path(__file__).parent.parent
            
            # Copia arquivos de configuração
            for pattern in config_files:
                if "*" in pattern:
                    # Usa glob para padrões
                    for file_path in base_dir.glob(pattern.replace("/opt/dataclinica/monitoring/", "")):
                        if file_path.is_file():
                            dest_path = prometheus_dir / file_path.name
                            shutil.copy2(file_path, dest_path)
                            print(f"  ✓ {file_path.name} copiado")
                else:
                    file_path = Path(pattern)
                    if not file_path.exists():
                        file_path = base_dir / pattern.replace("/opt/dataclinica/monitoring/", "")
                    
                    if file_path.exists():
                        dest_path = prometheus_dir / file_path.name
                        shutil.copy2(file_path, dest_path)
                        print(f"  ✓ {file_path.name} copiado")
            
            return True
            
        except Exception as e:
            print(f"  ✗ Erro ao fazer backup do Prometheus: {e}")
            return False
    
    def backup_alertmanager_config(self) -> bool:
        """Faz backup das configurações do Alertmanager"""
        print("Fazendo backup das configurações do Alertmanager...")
        
        try:
            alertmanager_dir = self.temp_dir / "alertmanager"
            alertmanager_dir.mkdir(parents=True, exist_ok=True)
            
            base_dir = Path(__file__).parent.parent
            config_file = base_dir / "alertmanager" / "alertmanager.yml"
            
            if config_file.exists():
                shutil.copy2(config_file, alertmanager_dir / "alertmanager.yml")
                print("  ✓ Configuração do Alertmanager copiada")
                return True
            else:
                print("  ⚠ Arquivo de configuração do Alertmanager não encontrado")
                return True
                
        except Exception as e:
            print(f"  ✗ Erro ao fazer backup do Alertmanager: {e}")
            return False
    
    def backup_docker_configs(self) -> bool:
        """Faz backup dos arquivos Docker"""
        print("Fazendo backup das configurações Docker...")
        
        try:
            docker_dir = self.temp_dir / "docker"
            docker_dir.mkdir(parents=True, exist_ok=True)
            
            base_dir = Path(__file__).parent.parent.parent
            
            # Arquivos Docker para backup
            docker_files = [
                "docker-compose.monitoring.yml",
                "docker-compose.prod.yml",
                "docker-compose.dev.yml",
                ".env.example"
            ]
            
            for filename in docker_files:
                file_path = base_dir / filename
                if file_path.exists():
                    shutil.copy2(file_path, docker_dir / filename)
                    print(f"  ✓ {filename} copiado")
            
            return True
            
        except Exception as e:
            print(f"  ✗ Erro ao fazer backup dos arquivos Docker: {e}")
            return False
    
    def backup_loki_config(self) -> bool:
        """Faz backup das configurações do Loki"""
        print("Fazendo backup das configurações do Loki...")
        
        try:
            loki_dir = self.temp_dir / "loki"
            loki_dir.mkdir(parents=True, exist_ok=True)
            
            base_dir = Path(__file__).parent.parent
            config_files = [
                "loki/loki.yml",
                "promtail/promtail.yml"
            ]
            
            for config_file in config_files:
                file_path = base_dir / config_file
                if file_path.exists():
                    dest_dir = loki_dir / Path(config_file).parent
                    dest_dir.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(file_path, dest_dir / Path(config_file).name)
                    print(f"  ✓ {config_file} copiado")
            
            return True
            
        except Exception as e:
            print(f"  ✗ Erro ao fazer backup do Loki: {e}")
            return False
    
    def create_backup_archive(self) -> bool:
        """Cria arquivo compactado do backup"""
        print("Criando arquivo de backup...")
        
        try:
            archive_path = self.backup_dir / f"{self.backup_name}.tar.gz"
            
            with tarfile.open(archive_path, 'w:gz') as tar:
                tar.add(self.temp_dir, arcname=self.backup_name)
            
            # Remove diretório temporário
            shutil.rmtree(self.temp_dir)
            
            # Calcula tamanho do arquivo
            size_mb = archive_path.stat().st_size / (1024 * 1024)
            
            print(f"  ✓ Backup criado: {archive_path}")
            print(f"  ✓ Tamanho: {size_mb:.2f} MB")
            
            return True
            
        except Exception as e:
            print(f"  ✗ Erro ao criar arquivo de backup: {e}")
            return False
    
    def cleanup_old_backups(self) -> bool:
        """Remove backups antigos baseado na retenção configurada"""
        print(f"Limpando backups antigos (retenção: {RETENTION_DAYS} dias)...")
        
        try:
            cutoff_date = datetime.datetime.now() - datetime.timedelta(days=RETENTION_DAYS)
            removed_count = 0
            
            for backup_file in self.backup_dir.glob("monitoring_backup_*.tar.gz"):
                file_time = datetime.datetime.fromtimestamp(backup_file.stat().st_mtime)
                
                if file_time < cutoff_date:
                    backup_file.unlink()
                    removed_count += 1
                    print(f"  ✓ Removido: {backup_file.name}")
            
            if removed_count == 0:
                print("  ✓ Nenhum backup antigo para remover")
            else:
                print(f"  ✓ {removed_count} backups antigos removidos")
            
            return True
            
        except Exception as e:
            print(f"  ✗ Erro na limpeza de backups: {e}")
            return False
    
    def create_backup_info(self) -> bool:
        """Cria arquivo com informações do backup"""
        try:
            info_file = self.backup_dir / f"{self.backup_name}_info.json"
            
            backup_info = {
                "timestamp": self.timestamp,
                "date": datetime.datetime.now().isoformat(),
                "version": "1.0",
                "components": [
                    "grafana_dashboards",
                    "grafana_datasources",
                    "prometheus_config",
                    "alertmanager_config",
                    "docker_configs",
                    "loki_config"
                ],
                "retention_days": RETENTION_DAYS,
                "backup_size_mb": 0  # Será atualizado após criação do arquivo
            }
            
            with open(info_file, 'w', encoding='utf-8') as f:
                json.dump(backup_info, f, indent=2, ensure_ascii=False)
            
            return True
            
        except Exception as e:
            print(f"  ✗ Erro ao criar arquivo de informações: {e}")
            return False
    
    def run_backup(self) -> bool:
        """Executa todo o processo de backup"""
        print("=== Iniciando Backup do Sistema de Monitoramento ===")
        print(f"Timestamp: {self.timestamp}")
        print(f"Diretório de backup: {self.backup_dir}")
        print()
        
        # Lista de operações de backup
        backup_operations = [
            ("Dashboards do Grafana", self.backup_grafana_dashboards),
            ("Datasources do Grafana", self.backup_grafana_datasources),
            ("Configurações do Prometheus", self.backup_prometheus_config),
            ("Configurações do Alertmanager", self.backup_alertmanager_config),
            ("Configurações Docker", self.backup_docker_configs),
            ("Configurações do Loki", self.backup_loki_config),
            ("Informações do backup", self.create_backup_info),
            ("Arquivo de backup", self.create_backup_archive),
            ("Limpeza de backups antigos", self.cleanup_old_backups)
        ]
        
        success_count = 0
        for operation_name, operation_func in backup_operations:
            print(f"\n{operation_name}...")
            if operation_func():
                success_count += 1
            else:
                print(f"✗ Falha em: {operation_name}")
        
        print(f"\n=== Backup Concluído ===")
        print(f"Operações executadas com sucesso: {success_count}/{len(backup_operations)}")
        
        if success_count >= len(backup_operations) - 1:  # Permite 1 falha
            print("\n✓ Backup realizado com sucesso!")
            return True
        else:
            print("\n⚠ Algumas operações de backup falharam. Verifique os logs acima.")
            return False

def main():
    """Função principal"""
    try:
        backup = MonitoringBackup()
        success = backup.run_backup()
        sys.exit(0 if success else 1)
        
    except KeyboardInterrupt:
        print("\n\nBackup cancelado pelo usuário.")
        sys.exit(1)
    except Exception as e:
        print(f"\nErro inesperado: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()