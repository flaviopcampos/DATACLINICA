#!/usr/bin/env python3
"""
Script de inicialização do sistema de monitoramento DataClinica
Configura automaticamente Grafana, Prometheus e outros componentes
"""

import os
import sys
import time
import json
import requests
import subprocess
from pathlib import Path
from typing import Dict, List, Optional

# Configurações
GRAFANA_URL = os.getenv('GRAFANA_URL', 'http://localhost:3000')
GRAFANA_ADMIN_USER = os.getenv('GRAFANA_ADMIN_USER', 'admin')
GRAFANA_ADMIN_PASSWORD = os.getenv('GRAFANA_ADMIN_PASSWORD', 'admin123')
PROMETHEUS_URL = os.getenv('PROMETHEUS_URL', 'http://localhost:9090')

class MonitoringInitializer:
    def __init__(self):
        self.grafana_session = requests.Session()
        self.grafana_session.auth = (GRAFANA_ADMIN_USER, GRAFANA_ADMIN_PASSWORD)
        self.base_dir = Path(__file__).parent.parent
        
    def wait_for_service(self, url: str, service_name: str, timeout: int = 300) -> bool:
        """Aguarda um serviço ficar disponível"""
        print(f"Aguardando {service_name} ficar disponível em {url}...")
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            try:
                response = requests.get(url, timeout=5)
                if response.status_code == 200:
                    print(f"✓ {service_name} está disponível")
                    return True
            except requests.exceptions.RequestException:
                pass
            
            time.sleep(5)
        
        print(f"✗ Timeout aguardando {service_name}")
        return False
    
    def setup_grafana_datasources(self) -> bool:
        """Configura datasources no Grafana"""
        print("Configurando datasources do Grafana...")
        
        datasources = [
            {
                "name": "Prometheus",
                "type": "prometheus",
                "url": PROMETHEUS_URL,
                "access": "proxy",
                "isDefault": True,
                "basicAuth": False
            },
            {
                "name": "Loki",
                "type": "loki",
                "url": "http://loki:3100",
                "access": "proxy",
                "basicAuth": False
            },
            {
                "name": "Jaeger",
                "type": "jaeger",
                "url": "http://jaeger-query:16686",
                "access": "proxy",
                "basicAuth": False
            }
        ]
        
        for datasource in datasources:
            try:
                # Verifica se já existe
                response = self.grafana_session.get(
                    f"{GRAFANA_URL}/api/datasources/name/{datasource['name']}"
                )
                
                if response.status_code == 200:
                    print(f"  ✓ Datasource {datasource['name']} já existe")
                    continue
                
                # Cria o datasource
                response = self.grafana_session.post(
                    f"{GRAFANA_URL}/api/datasources",
                    json=datasource
                )
                
                if response.status_code == 200:
                    print(f"  ✓ Datasource {datasource['name']} criado")
                else:
                    print(f"  ✗ Erro ao criar datasource {datasource['name']}: {response.text}")
                    return False
                    
            except Exception as e:
                print(f"  ✗ Erro ao configurar datasource {datasource['name']}: {e}")
                return False
        
        return True
    
    def import_dashboards(self) -> bool:
        """Importa dashboards do Grafana"""
        print("Importando dashboards do Grafana...")
        
        dashboards_dir = self.base_dir / "grafana" / "dashboards"
        
        if not dashboards_dir.exists():
            print(f"  ✗ Diretório de dashboards não encontrado: {dashboards_dir}")
            return False
        
        dashboard_files = list(dashboards_dir.glob("*.json"))
        
        for dashboard_file in dashboard_files:
            try:
                with open(dashboard_file, 'r', encoding='utf-8') as f:
                    dashboard_json = json.load(f)
                
                # Prepara o payload para importação
                import_payload = {
                    "dashboard": dashboard_json,
                    "overwrite": True,
                    "inputs": []
                }
                
                response = self.grafana_session.post(
                    f"{GRAFANA_URL}/api/dashboards/db",
                    json=import_payload
                )
                
                if response.status_code == 200:
                    print(f"  ✓ Dashboard {dashboard_file.name} importado")
                else:
                    print(f"  ✗ Erro ao importar dashboard {dashboard_file.name}: {response.text}")
                    
            except Exception as e:
                print(f"  ✗ Erro ao processar dashboard {dashboard_file.name}: {e}")
        
        return True
    
    def setup_grafana_folders(self) -> bool:
        """Cria pastas organizacionais no Grafana"""
        print("Criando pastas no Grafana...")
        
        folders = [
            {"title": "DataClinica", "uid": "dataclinica"},
            {"title": "Infrastructure", "uid": "infrastructure"},
            {"title": "Application", "uid": "application"},
            {"title": "Business", "uid": "business"},
            {"title": "Security", "uid": "security"}
        ]
        
        for folder in folders:
            try:
                response = self.grafana_session.post(
                    f"{GRAFANA_URL}/api/folders",
                    json=folder
                )
                
                if response.status_code == 200:
                    print(f"  ✓ Pasta {folder['title']} criada")
                elif response.status_code == 409:
                    print(f"  ✓ Pasta {folder['title']} já existe")
                else:
                    print(f"  ✗ Erro ao criar pasta {folder['title']}: {response.text}")
                    
            except Exception as e:
                print(f"  ✗ Erro ao criar pasta {folder['title']}: {e}")
        
        return True
    
    def setup_grafana_users(self) -> bool:
        """Cria usuários padrão no Grafana"""
        print("Configurando usuários do Grafana...")
        
        users = [
            {
                "name": "DataClinica Viewer",
                "email": "viewer@dataclinica.com",
                "login": "dataclinica-viewer",
                "password": "viewer123",
                "role": "Viewer"
            },
            {
                "name": "DataClinica Editor",
                "email": "editor@dataclinica.com",
                "login": "dataclinica-editor",
                "password": "editor123",
                "role": "Editor"
            }
        ]
        
        for user in users:
            try:
                response = self.grafana_session.post(
                    f"{GRAFANA_URL}/api/admin/users",
                    json=user
                )
                
                if response.status_code == 200:
                    print(f"  ✓ Usuário {user['login']} criado")
                elif response.status_code == 412:
                    print(f"  ✓ Usuário {user['login']} já existe")
                else:
                    print(f"  ✗ Erro ao criar usuário {user['login']}: {response.text}")
                    
            except Exception as e:
                print(f"  ✗ Erro ao criar usuário {user['login']}: {e}")
        
        return True
    
    def setup_alerting_rules(self) -> bool:
        """Configura regras de alerta no Grafana"""
        print("Configurando regras de alerta...")
        
        # Cria pasta para regras de alerta
        alert_folder = {
            "title": "DataClinica Alerts",
            "uid": "dataclinica-alerts"
        }
        
        try:
            response = self.grafana_session.post(
                f"{GRAFANA_URL}/api/folders",
                json=alert_folder
            )
            
            if response.status_code in [200, 409]:
                print("  ✓ Pasta de alertas configurada")
            else:
                print(f"  ✗ Erro ao criar pasta de alertas: {response.text}")
                return False
                
        except Exception as e:
            print(f"  ✗ Erro ao configurar alertas: {e}")
            return False
        
        return True
    
    def verify_prometheus_targets(self) -> bool:
        """Verifica se os targets do Prometheus estão funcionando"""
        print("Verificando targets do Prometheus...")
        
        try:
            response = requests.get(f"{PROMETHEUS_URL}/api/v1/targets")
            
            if response.status_code == 200:
                data = response.json()
                active_targets = data.get('data', {}).get('activeTargets', [])
                
                healthy_count = 0
                total_count = len(active_targets)
                
                for target in active_targets:
                    if target.get('health') == 'up':
                        healthy_count += 1
                        print(f"  ✓ {target.get('labels', {}).get('job', 'unknown')} - UP")
                    else:
                        print(f"  ✗ {target.get('labels', {}).get('job', 'unknown')} - DOWN")
                
                print(f"  Targets saudáveis: {healthy_count}/{total_count}")
                return healthy_count > 0
                
            else:
                print(f"  ✗ Erro ao verificar targets: {response.text}")
                return False
                
        except Exception as e:
            print(f"  ✗ Erro ao conectar com Prometheus: {e}")
            return False
    
    def create_notification_channels(self) -> bool:
        """Cria canais de notificação no Grafana"""
        print("Configurando canais de notificação...")
        
        # Exemplo de canal Slack (se configurado)
        slack_webhook = os.getenv('SLACK_WEBHOOK_URL')
        if slack_webhook:
            slack_channel = {
                "name": "dataclinica-alerts",
                "type": "slack",
                "settings": {
                    "url": slack_webhook,
                    "channel": "#dataclinica-alerts",
                    "username": "Grafana",
                    "title": "DataClinica Alert",
                    "text": "{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}"
                }
            }
            
            try:
                response = self.grafana_session.post(
                    f"{GRAFANA_URL}/api/alert-notifications",
                    json=slack_channel
                )
                
                if response.status_code == 200:
                    print("  ✓ Canal Slack configurado")
                else:
                    print(f"  ✗ Erro ao configurar Slack: {response.text}")
                    
            except Exception as e:
                print(f"  ✗ Erro ao configurar canal Slack: {e}")
        
        return True
    
    def run_initialization(self) -> bool:
        """Executa todo o processo de inicialização"""
        print("=== Inicializando Sistema de Monitoramento DataClinica ===")
        print()
        
        # Aguarda serviços ficarem disponíveis
        if not self.wait_for_service(GRAFANA_URL, "Grafana"):
            return False
        
        if not self.wait_for_service(PROMETHEUS_URL, "Prometheus"):
            return False
        
        print()
        
        # Executa configurações
        steps = [
            ("Configurar pastas do Grafana", self.setup_grafana_folders),
            ("Configurar datasources", self.setup_grafana_datasources),
            ("Importar dashboards", self.import_dashboards),
            ("Configurar usuários", self.setup_grafana_users),
            ("Configurar alertas", self.setup_alerting_rules),
            ("Configurar notificações", self.create_notification_channels),
            ("Verificar targets Prometheus", self.verify_prometheus_targets)
        ]
        
        success_count = 0
        for step_name, step_func in steps:
            print(f"\n{step_name}...")
            if step_func():
                success_count += 1
            else:
                print(f"✗ Falha em: {step_name}")
        
        print(f"\n=== Inicialização Concluída ===")
        print(f"Passos executados com sucesso: {success_count}/{len(steps)}")
        
        if success_count == len(steps):
            print("\n✓ Sistema de monitoramento configurado com sucesso!")
            print(f"\nAcesse o Grafana em: {GRAFANA_URL}")
            print(f"Usuário: {GRAFANA_ADMIN_USER}")
            print(f"Senha: {GRAFANA_ADMIN_PASSWORD}")
            return True
        else:
            print("\n⚠ Algumas configurações falharam. Verifique os logs acima.")
            return False

def main():
    """Função principal"""
    try:
        initializer = MonitoringInitializer()
        success = initializer.run_initialization()
        sys.exit(0 if success else 1)
        
    except KeyboardInterrupt:
        print("\n\nInicialização cancelada pelo usuário.")
        sys.exit(1)
    except Exception as e:
        print(f"\nErro inesperado: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()