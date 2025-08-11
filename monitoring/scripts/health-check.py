#!/usr/bin/env python3
"""
Script de verificação de saúde do sistema de monitoramento DataClinica
Verifica o status de todos os componentes e gera relatórios
"""

import os
import sys
import json
import time
import datetime
import subprocess
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# Configurações
GRAFANA_URL = os.getenv('GRAFANA_URL', 'http://localhost:3000')
PROMETHEUS_URL = os.getenv('PROMETHEUS_URL', 'http://localhost:9090')
ALERTMANAGER_URL = os.getenv('ALERTMANAGER_URL', 'http://localhost:9093')
LOKI_URL = os.getenv('LOKI_URL', 'http://localhost:3100')
JAEGER_URL = os.getenv('JAEGER_URL', 'http://localhost:16686')
GRAFANA_ADMIN_USER = os.getenv('GRAFANA_ADMIN_USER', 'admin')
GRAFANA_ADMIN_PASSWORD = os.getenv('GRAFANA_ADMIN_PASSWORD', 'admin123')

class HealthChecker:
    def __init__(self):
        self.results = {}
        self.start_time = datetime.datetime.now()
        
    def check_http_service(self, name: str, url: str, expected_status: int = 200, 
                          auth: Tuple[str, str] = None, timeout: int = 10) -> Dict:
        """Verifica saúde de um serviço HTTP"""
        try:
            import requests
            
            session = requests.Session()
            if auth:
                session.auth = auth
            
            start_time = time.time()
            response = session.get(url, timeout=timeout)
            response_time = (time.time() - start_time) * 1000  # em ms
            
            is_healthy = response.status_code == expected_status
            
            return {
                "status": "healthy" if is_healthy else "unhealthy",
                "response_code": response.status_code,
                "response_time_ms": round(response_time, 2),
                "url": url,
                "error": None if is_healthy else f"Expected {expected_status}, got {response.status_code}"
            }
            
        except ImportError:
            subprocess.run([sys.executable, '-m', 'pip', 'install', 'requests'])
            return self.check_http_service(name, url, expected_status, auth, timeout)
        except Exception as e:
            return {
                "status": "unhealthy",
                "response_code": None,
                "response_time_ms": None,
                "url": url,
                "error": str(e)
            }
    
    def check_grafana(self) -> Dict:
        """Verifica saúde do Grafana"""
        print("Verificando Grafana...")
        
        # Verifica API de saúde
        health_result = self.check_http_service(
            "grafana", 
            f"{GRAFANA_URL}/api/health"
        )
        
        if health_result["status"] == "healthy":
            # Verifica login
            login_result = self.check_http_service(
                "grafana_auth",
                f"{GRAFANA_URL}/api/org",
                auth=(GRAFANA_ADMIN_USER, GRAFANA_ADMIN_PASSWORD)
            )
            
            # Verifica dashboards
            dashboards_result = self.check_http_service(
                "grafana_dashboards",
                f"{GRAFANA_URL}/api/search",
                auth=(GRAFANA_ADMIN_USER, GRAFANA_ADMIN_PASSWORD)
            )
            
            # Verifica datasources
            datasources_result = self.check_http_service(
                "grafana_datasources",
                f"{GRAFANA_URL}/api/datasources",
                auth=(GRAFANA_ADMIN_USER, GRAFANA_ADMIN_PASSWORD)
            )
            
            # Conta dashboards e datasources
            dashboard_count = 0
            datasource_count = 0
            
            try:
                import requests
                session = requests.Session()
                session.auth = (GRAFANA_ADMIN_USER, GRAFANA_ADMIN_PASSWORD)
                
                # Conta dashboards
                dash_response = session.get(f"{GRAFANA_URL}/api/search?type=dash-db")
                if dash_response.status_code == 200:
                    dashboard_count = len(dash_response.json())
                
                # Conta datasources
                ds_response = session.get(f"{GRAFANA_URL}/api/datasources")
                if ds_response.status_code == 200:
                    datasource_count = len(ds_response.json())
                    
            except Exception:
                pass
            
            return {
                "status": "healthy" if all(r["status"] == "healthy" for r in [health_result, login_result, dashboards_result, datasources_result]) else "unhealthy",
                "health_check": health_result,
                "authentication": login_result,
                "dashboards": dashboards_result,
                "datasources": datasources_result,
                "dashboard_count": dashboard_count,
                "datasource_count": datasource_count
            }
        else:
            return {
                "status": "unhealthy",
                "health_check": health_result,
                "authentication": None,
                "dashboards": None,
                "datasources": None,
                "dashboard_count": 0,
                "datasource_count": 0
            }
    
    def check_prometheus(self) -> Dict:
        """Verifica saúde do Prometheus"""
        print("Verificando Prometheus...")
        
        # Verifica API de saúde
        health_result = self.check_http_service(
            "prometheus",
            f"{PROMETHEUS_URL}/-/healthy"
        )
        
        if health_result["status"] == "healthy":
            # Verifica API de consulta
            query_result = self.check_http_service(
                "prometheus_query",
                f"{PROMETHEUS_URL}/api/v1/query?query=up"
            )
            
            # Verifica targets
            targets_result = self.check_http_service(
                "prometheus_targets",
                f"{PROMETHEUS_URL}/api/v1/targets"
            )
            
            # Verifica regras
            rules_result = self.check_http_service(
                "prometheus_rules",
                f"{PROMETHEUS_URL}/api/v1/rules"
            )
            
            # Conta targets ativos
            active_targets = 0
            total_targets = 0
            
            try:
                import requests
                response = requests.get(f"{PROMETHEUS_URL}/api/v1/targets")
                if response.status_code == 200:
                    data = response.json()
                    if data.get('status') == 'success':
                        targets = data.get('data', {}).get('activeTargets', [])
                        total_targets = len(targets)
                        active_targets = len([t for t in targets if t.get('health') == 'up'])
            except Exception:
                pass
            
            return {
                "status": "healthy" if all(r["status"] == "healthy" for r in [health_result, query_result, targets_result, rules_result]) else "unhealthy",
                "health_check": health_result,
                "query_api": query_result,
                "targets_api": targets_result,
                "rules_api": rules_result,
                "active_targets": active_targets,
                "total_targets": total_targets
            }
        else:
            return {
                "status": "unhealthy",
                "health_check": health_result,
                "query_api": None,
                "targets_api": None,
                "rules_api": None,
                "active_targets": 0,
                "total_targets": 0
            }
    
    def check_alertmanager(self) -> Dict:
        """Verifica saúde do Alertmanager"""
        print("Verificando Alertmanager...")
        
        # Verifica API de saúde
        health_result = self.check_http_service(
            "alertmanager",
            f"{ALERTMANAGER_URL}/-/healthy"
        )
        
        if health_result["status"] == "healthy":
            # Verifica API de alertas
            alerts_result = self.check_http_service(
                "alertmanager_alerts",
                f"{ALERTMANAGER_URL}/api/v1/alerts"
            )
            
            # Verifica status
            status_result = self.check_http_service(
                "alertmanager_status",
                f"{ALERTMANAGER_URL}/api/v1/status"
            )
            
            # Conta alertas ativos
            active_alerts = 0
            
            try:
                import requests
                response = requests.get(f"{ALERTMANAGER_URL}/api/v1/alerts")
                if response.status_code == 200:
                    alerts = response.json()
                    active_alerts = len(alerts)
            except Exception:
                pass
            
            return {
                "status": "healthy" if all(r["status"] == "healthy" for r in [health_result, alerts_result, status_result]) else "unhealthy",
                "health_check": health_result,
                "alerts_api": alerts_result,
                "status_api": status_result,
                "active_alerts": active_alerts
            }
        else:
            return {
                "status": "unhealthy",
                "health_check": health_result,
                "alerts_api": None,
                "status_api": None,
                "active_alerts": 0
            }
    
    def check_loki(self) -> Dict:
        """Verifica saúde do Loki"""
        print("Verificando Loki...")
        
        # Verifica API de saúde
        health_result = self.check_http_service(
            "loki",
            f"{LOKI_URL}/ready"
        )
        
        if health_result["status"] == "healthy":
            # Verifica API de consulta
            query_result = self.check_http_service(
                "loki_query",
                f"{LOKI_URL}/loki/api/v1/query?query={{job=\"dataclinica\"}}"
            )
            
            # Verifica labels
            labels_result = self.check_http_service(
                "loki_labels",
                f"{LOKI_URL}/loki/api/v1/labels"
            )
            
            return {
                "status": "healthy" if all(r["status"] == "healthy" for r in [health_result, query_result, labels_result]) else "unhealthy",
                "health_check": health_result,
                "query_api": query_result,
                "labels_api": labels_result
            }
        else:
            return {
                "status": "unhealthy",
                "health_check": health_result,
                "query_api": None,
                "labels_api": None
            }
    
    def check_jaeger(self) -> Dict:
        """Verifica saúde do Jaeger"""
        print("Verificando Jaeger...")
        
        # Verifica UI do Jaeger
        ui_result = self.check_http_service(
            "jaeger_ui",
            f"{JAEGER_URL}/"
        )
        
        # Verifica API de serviços
        services_result = self.check_http_service(
            "jaeger_services",
            f"{JAEGER_URL}/api/services"
        )
        
        return {
            "status": "healthy" if all(r["status"] == "healthy" for r in [ui_result, services_result]) else "unhealthy",
            "ui_check": ui_result,
            "services_api": services_result
        }
    
    def check_docker_containers(self) -> Dict:
        """Verifica status dos contêineres Docker"""
        print("Verificando contêineres Docker...")
        
        try:
            # Lista contêineres relacionados ao monitoramento
            result = subprocess.run(
                ['docker', 'ps', '--format', 'json', '--filter', 'name=dataclinica'],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode != 0:
                return {
                    "status": "unhealthy",
                    "error": f"Erro ao executar docker ps: {result.stderr}",
                    "containers": []
                }
            
            containers = []
            for line in result.stdout.strip().split('\n'):
                if line.strip():
                    try:
                        container_info = json.loads(line)
                        containers.append({
                            "name": container_info.get('Names', ''),
                            "status": container_info.get('Status', ''),
                            "image": container_info.get('Image', ''),
                            "ports": container_info.get('Ports', ''),
                            "state": container_info.get('State', '')
                        })
                    except json.JSONDecodeError:
                        continue
            
            # Verifica se todos os contêineres estão rodando
            running_containers = [c for c in containers if 'Up' in c.get('status', '')]
            
            return {
                "status": "healthy" if len(running_containers) == len(containers) and len(containers) > 0 else "unhealthy",
                "total_containers": len(containers),
                "running_containers": len(running_containers),
                "containers": containers,
                "error": None
            }
            
        except subprocess.TimeoutExpired:
            return {
                "status": "unhealthy",
                "error": "Timeout ao verificar contêineres Docker",
                "containers": []
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e),
                "containers": []
            }
    
    def check_disk_space(self) -> Dict:
        """Verifica espaço em disco"""
        print("Verificando espaço em disco...")
        
        try:
            import shutil
            
            # Verifica espaço no diretório atual
            current_dir = Path(__file__).parent.parent
            total, used, free = shutil.disk_usage(current_dir)
            
            # Converte para GB
            total_gb = total / (1024**3)
            used_gb = used / (1024**3)
            free_gb = free / (1024**3)
            usage_percent = (used / total) * 100
            
            # Considera saudável se há mais de 10% de espaço livre
            is_healthy = usage_percent < 90
            
            return {
                "status": "healthy" if is_healthy else "unhealthy",
                "total_gb": round(total_gb, 2),
                "used_gb": round(used_gb, 2),
                "free_gb": round(free_gb, 2),
                "usage_percent": round(usage_percent, 2),
                "path": str(current_dir),
                "warning": "Pouco espaço em disco disponível" if not is_healthy else None
            }
            
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e)
            }
    
    def run_health_check(self) -> Dict:
        """Executa verificação completa de saúde"""
        print("=== Verificação de Saúde do Sistema de Monitoramento ===")
        print(f"Iniciado em: {self.start_time.strftime('%d/%m/%Y %H:%M:%S')}")
        print()
        
        # Lista de verificações
        checks = [
            ("grafana", self.check_grafana),
            ("prometheus", self.check_prometheus),
            ("alertmanager", self.check_alertmanager),
            ("loki", self.check_loki),
            ("jaeger", self.check_jaeger),
            ("docker_containers", self.check_docker_containers),
            ("disk_space", self.check_disk_space)
        ]
        
        results = {}
        healthy_count = 0
        
        for check_name, check_func in checks:
            try:
                result = check_func()
                results[check_name] = result
                
                if result.get("status") == "healthy":
                    healthy_count += 1
                    print(f"  ✓ {check_name.replace('_', ' ').title()}")
                else:
                    print(f"  ✗ {check_name.replace('_', ' ').title()}")
                    if result.get("error"):
                        print(f"    Erro: {result['error']}")
                        
            except Exception as e:
                results[check_name] = {
                    "status": "unhealthy",
                    "error": str(e)
                }
                print(f"  ✗ {check_name.replace('_', ' ').title()} - Erro: {e}")
        
        # Calcula status geral
        overall_status = "healthy" if healthy_count == len(checks) else "unhealthy"
        
        end_time = datetime.datetime.now()
        duration = (end_time - self.start_time).total_seconds()
        
        final_results = {
            "timestamp": self.start_time.isoformat(),
            "duration_seconds": round(duration, 2),
            "overall_status": overall_status,
            "healthy_services": healthy_count,
            "total_services": len(checks),
            "checks": results
        }
        
        print(f"\n=== Resumo ===")
        print(f"Status Geral: {'✓ SAUDÁVEL' if overall_status == 'healthy' else '✗ PROBLEMAS DETECTADOS'}")
        print(f"Serviços Saudáveis: {healthy_count}/{len(checks)}")
        print(f"Duração: {duration:.2f}s")
        
        return final_results
    
    def save_report(self, results: Dict, output_file: str = None) -> str:
        """Salva relatório em arquivo JSON"""
        if not output_file:
            timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
            output_file = f"health_report_{timestamp}.json"
        
        output_path = Path(__file__).parent / output_file
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        print(f"\nRelatório salvo em: {output_path}")
        return str(output_path)
    
    def generate_html_report(self, results: Dict, output_file: str = None) -> str:
        """Gera relatório HTML"""
        if not output_file:
            timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
            output_file = f"health_report_{timestamp}.html"
        
        output_path = Path(__file__).parent / output_file
        
        html_content = f"""
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Saúde - DataClinica Monitoring</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }}
        .container {{ max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
        .header {{ text-align: center; margin-bottom: 30px; }}
        .status-healthy {{ color: #28a745; }}
        .status-unhealthy {{ color: #dc3545; }}
        .summary {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }}
        .summary-card {{ background: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; }}
        .service {{ margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }}
        .service-healthy {{ border-left: 4px solid #28a745; }}
        .service-unhealthy {{ border-left: 4px solid #dc3545; }}
        .service-title {{ font-weight: bold; font-size: 18px; margin-bottom: 10px; }}
        .detail {{ margin: 5px 0; }}
        .error {{ color: #dc3545; font-style: italic; }}
        .timestamp {{ color: #6c757d; font-size: 14px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Relatório de Saúde - Sistema de Monitoramento</h1>
            <p class="timestamp">Gerado em: {datetime.datetime.fromisoformat(results['timestamp']).strftime('%d/%m/%Y %H:%M:%S')}</p>
        </div>
        
        <div class="summary">
            <div class="summary-card">
                <h3 class="{'status-healthy' if results['overall_status'] == 'healthy' else 'status-unhealthy'}">
                    {results['overall_status'].upper()}
                </h3>
                <p>Status Geral</p>
            </div>
            <div class="summary-card">
                <h3>{results['healthy_services']}/{results['total_services']}</h3>
                <p>Serviços Saudáveis</p>
            </div>
            <div class="summary-card">
                <h3>{results['duration_seconds']}s</h3>
                <p>Duração da Verificação</p>
            </div>
        </div>
        
        <div class="services">
"""
        
        # Adiciona detalhes de cada serviço
        for service_name, service_data in results['checks'].items():
            status_class = "service-healthy" if service_data.get('status') == 'healthy' else "service-unhealthy"
            status_text = "✓ SAUDÁVEL" if service_data.get('status') == 'healthy' else "✗ PROBLEMA"
            
            html_content += f"""
            <div class="service {status_class}">
                <div class="service-title">
                    {service_name.replace('_', ' ').title()} - 
                    <span class="{'status-healthy' if service_data.get('status') == 'healthy' else 'status-unhealthy'}">
                        {status_text}
                    </span>
                </div>
"""
            
            # Adiciona detalhes específicos do serviço
            if service_name == 'grafana':
                html_content += f"""
                <div class="detail">Dashboards: {service_data.get('dashboard_count', 0)}</div>
                <div class="detail">Datasources: {service_data.get('datasource_count', 0)}</div>
"""
            elif service_name == 'prometheus':
                html_content += f"""
                <div class="detail">Targets Ativos: {service_data.get('active_targets', 0)}/{service_data.get('total_targets', 0)}</div>
"""
            elif service_name == 'alertmanager':
                html_content += f"""
                <div class="detail">Alertas Ativos: {service_data.get('active_alerts', 0)}</div>
"""
            elif service_name == 'docker_containers':
                html_content += f"""
                <div class="detail">Contêineres Rodando: {service_data.get('running_containers', 0)}/{service_data.get('total_containers', 0)}</div>
"""
            elif service_name == 'disk_space':
                html_content += f"""
                <div class="detail">Espaço Usado: {service_data.get('usage_percent', 0):.1f}%</div>
                <div class="detail">Espaço Livre: {service_data.get('free_gb', 0):.1f} GB</div>
"""
            
            # Adiciona erro se houver
            if service_data.get('error'):
                html_content += f'<div class="detail error">Erro: {service_data["error"]}</div>'
            
            html_content += "</div>"
        
        html_content += """
        </div>
    </div>
</body>
</html>
"""
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        print(f"Relatório HTML salvo em: {output_path}")
        return str(output_path)

def main():
    """Função principal"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Verifica saúde do sistema de monitoramento')
    parser.add_argument('--json', '-j', help='Salva relatório JSON no arquivo especificado')
    parser.add_argument('--html', '-h', help='Salva relatório HTML no arquivo especificado')
    parser.add_argument('--continuous', '-c', type=int, help='Executa verificação contínua (intervalo em segundos)')
    parser.add_argument('--quiet', '-q', action='store_true', help='Modo silencioso (apenas erros)')
    
    args = parser.parse_args()
    
    try:
        checker = HealthChecker()
        
        if args.continuous:
            print(f"Iniciando verificação contínua (intervalo: {args.continuous}s)")
            print("Pressione Ctrl+C para parar")
            
            while True:
                try:
                    if not args.quiet:
                        print(f"\n{'='*60}")
                        print(f"Verificação: {datetime.datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
                        print(f"{'='*60}")
                    
                    results = checker.run_health_check()
                    
                    # Salva relatórios se especificado
                    if args.json:
                        checker.save_report(results, args.json)
                    if args.html:
                        checker.generate_html_report(results, args.html)
                    
                    # Aguarda próxima verificação
                    if not args.quiet:
                        print(f"\nPróxima verificação em {args.continuous}s...")
                    
                    time.sleep(args.continuous)
                    
                except KeyboardInterrupt:
                    print("\n\nVerificação contínua interrompida.")
                    break
        else:
            # Execução única
            results = checker.run_health_check()
            
            # Salva relatórios se especificado
            if args.json:
                checker.save_report(results, args.json)
            if args.html:
                checker.generate_html_report(results, args.html)
            
            # Retorna código de saída baseado no status
            sys.exit(0 if results['overall_status'] == 'healthy' else 1)
            
    except Exception as e:
        print(f"\nErro: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()