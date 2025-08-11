#!/usr/bin/env python3
"""
Script de Monitoramento de Saúde - DataClinica

Este script monitora a saúde da aplicação DataClinica em produção,
verificando APIs, banco de dados, serviços externos e métricas de performance.

Uso:
    python health_monitor.py [--config config.json] [--alert] [--verbose]

Funcionalidades:
    - Verificação de endpoints da API
    - Teste de conectividade com banco de dados
    - Verificação de APIs externas (Memed, ClickSign, ViaCEP)
    - Monitoramento de métricas de sistema
    - Alertas via email/Slack/webhook
    - Relatório de status em JSON
"""

import os
import sys
import json
import time
import logging
import argparse
import requests
import psutil
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from concurrent.futures import ThreadPoolExecutor, as_completed

try:
    import psycopg2
except ImportError:
    print("Aviso: psycopg2 não instalado. Verificações de DB serão ignoradas.")
    psycopg2 = None

try:
    import redis
except ImportError:
    print("Aviso: redis não instalado. Verificações de Redis serão ignoradas.")
    redis = None

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@dataclass
class HealthCheckResult:
    """Resultado de uma verificação de saúde."""
    service: str
    status: str  # 'healthy', 'warning', 'critical', 'unknown'
    response_time: float
    message: str
    details: Dict[str, Any]
    timestamp: str
    
    def __post_init__(self):
        if not self.timestamp:
            self.timestamp = datetime.now().isoformat()

@dataclass
class SystemMetrics:
    """Métricas do sistema."""
    cpu_percent: float
    memory_percent: float
    disk_percent: float
    load_average: List[float]
    uptime: float
    timestamp: str
    
    def __post_init__(self):
        if not self.timestamp:
            self.timestamp = datetime.now().isoformat()

class HealthMonitor:
    """Monitor de saúde da aplicação."""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.base_url = config.get('base_url', 'http://localhost:8000')
        self.database_url = config.get('database_url') or os.getenv('DATABASE_URL')
        self.redis_url = config.get('redis_url') or os.getenv('REDIS_URL')
        self.timeout = config.get('timeout', 30)
        self.max_workers = config.get('max_workers', 5)
        self.alert_enabled = config.get('alert_enabled', False)
        
        # Configurações de alerta
        self.webhook_url = config.get('webhook_url')
        self.slack_webhook = config.get('slack_webhook')
        self.email_config = config.get('email_config', {})
        
        # Thresholds
        self.thresholds = config.get('thresholds', {
            'response_time_warning': 2.0,
            'response_time_critical': 5.0,
            'cpu_warning': 70.0,
            'cpu_critical': 90.0,
            'memory_warning': 80.0,
            'memory_critical': 95.0,
            'disk_warning': 80.0,
            'disk_critical': 95.0
        })
        
        self.results: List[HealthCheckResult] = []
        self.system_metrics: Optional[SystemMetrics] = None
    
    def check_api_endpoint(self, endpoint: str, expected_status: int = 200) -> HealthCheckResult:
        """Verifica um endpoint da API."""
        url = f"{self.base_url}{endpoint}"
        start_time = time.time()
        
        try:
            response = requests.get(url, timeout=self.timeout)
            response_time = time.time() - start_time
            
            if response.status_code == expected_status:
                status = 'healthy'
                if response_time > self.thresholds['response_time_critical']:
                    status = 'critical'
                elif response_time > self.thresholds['response_time_warning']:
                    status = 'warning'
                
                message = f"Endpoint respondeu com status {response.status_code}"
            else:
                status = 'critical'
                message = f"Status inesperado: {response.status_code}"
            
            details = {
                'url': url,
                'status_code': response.status_code,
                'headers': dict(response.headers),
                'response_size': len(response.content)
            }
            
        except requests.exceptions.Timeout:
            response_time = self.timeout
            status = 'critical'
            message = f"Timeout após {self.timeout}s"
            details = {'url': url, 'error': 'timeout'}
            
        except requests.exceptions.ConnectionError:
            response_time = time.time() - start_time
            status = 'critical'
            message = "Erro de conexão"
            details = {'url': url, 'error': 'connection_error'}
            
        except Exception as e:
            response_time = time.time() - start_time
            status = 'critical'
            message = f"Erro inesperado: {str(e)}"
            details = {'url': url, 'error': str(e)}
        
        return HealthCheckResult(
            service=f"API {endpoint}",
            status=status,
            response_time=response_time,
            message=message,
            details=details,
            timestamp=""
        )
    
    def check_database(self) -> HealthCheckResult:
        """Verifica conectividade com o banco de dados."""
        if not self.database_url or not psycopg2:
            return HealthCheckResult(
                service="PostgreSQL",
                status="unknown",
                response_time=0.0,
                message="Configuração de DB não disponível",
                details={},
                timestamp=""
            )
        
        start_time = time.time()
        
        try:
            conn = psycopg2.connect(self.database_url)
            cursor = conn.cursor()
            
            # Teste simples de query
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            
            # Verificar estatísticas do banco
            cursor.execute("""
                SELECT 
                    count(*) as total_connections,
                    sum(case when state = 'active' then 1 else 0 end) as active_connections
                FROM pg_stat_activity
            """)
            stats = cursor.fetchone()
            
            cursor.close()
            conn.close()
            
            response_time = time.time() - start_time
            
            status = 'healthy'
            if response_time > self.thresholds['response_time_critical']:
                status = 'critical'
            elif response_time > self.thresholds['response_time_warning']:
                status = 'warning'
            
            message = "Banco de dados respondendo normalmente"
            details = {
                'total_connections': stats[0] if stats else 0,
                'active_connections': stats[1] if stats else 0,
                'query_result': result[0] if result else None
            }
            
        except psycopg2.OperationalError as e:
            response_time = time.time() - start_time
            status = 'critical'
            message = f"Erro de conexão com DB: {str(e)}"
            details = {'error': str(e)}
            
        except Exception as e:
            response_time = time.time() - start_time
            status = 'critical'
            message = f"Erro inesperado no DB: {str(e)}"
            details = {'error': str(e)}
        
        return HealthCheckResult(
            service="PostgreSQL",
            status=status,
            response_time=response_time,
            message=message,
            details=details,
            timestamp=""
        )
    
    def check_redis(self) -> HealthCheckResult:
        """Verifica conectividade com Redis."""
        if not self.redis_url or not redis:
            return HealthCheckResult(
                service="Redis",
                status="unknown",
                response_time=0.0,
                message="Redis não configurado",
                details={},
                timestamp=""
            )
        
        start_time = time.time()
        
        try:
            r = redis.from_url(self.redis_url)
            
            # Teste de ping
            ping_result = r.ping()
            
            # Informações do Redis
            info = r.info()
            
            response_time = time.time() - start_time
            
            status = 'healthy' if ping_result else 'critical'
            if response_time > self.thresholds['response_time_warning']:
                status = 'warning'
            
            message = "Redis respondendo normalmente" if ping_result else "Redis não respondeu ao ping"
            details = {
                'ping_result': ping_result,
                'connected_clients': info.get('connected_clients', 0),
                'used_memory_human': info.get('used_memory_human', 'N/A'),
                'uptime_in_seconds': info.get('uptime_in_seconds', 0)
            }
            
        except redis.ConnectionError as e:
            response_time = time.time() - start_time
            status = 'critical'
            message = f"Erro de conexão com Redis: {str(e)}"
            details = {'error': str(e)}
            
        except Exception as e:
            response_time = time.time() - start_time
            status = 'critical'
            message = f"Erro inesperado no Redis: {str(e)}"
            details = {'error': str(e)}
        
        return HealthCheckResult(
            service="Redis",
            status=status,
            response_time=response_time,
            message=message,
            details=details,
            timestamp=""
        )
    
    def check_external_api(self, name: str, url: str, timeout: int = 10) -> HealthCheckResult:
        """Verifica uma API externa."""
        start_time = time.time()
        
        try:
            response = requests.get(url, timeout=timeout)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                status = 'healthy'
                message = f"API {name} respondendo"
            else:
                status = 'warning'
                message = f"API {name} retornou status {response.status_code}"
            
            details = {
                'url': url,
                'status_code': response.status_code,
                'response_size': len(response.content)
            }
            
        except requests.exceptions.Timeout:
            response_time = timeout
            status = 'warning'
            message = f"API {name} com timeout"
            details = {'url': url, 'error': 'timeout'}
            
        except requests.exceptions.ConnectionError:
            response_time = time.time() - start_time
            status = 'warning'
            message = f"API {name} inacessível"
            details = {'url': url, 'error': 'connection_error'}
            
        except Exception as e:
            response_time = time.time() - start_time
            status = 'warning'
            message = f"Erro na API {name}: {str(e)}"
            details = {'url': url, 'error': str(e)}
        
        return HealthCheckResult(
            service=f"External API - {name}",
            status=status,
            response_time=response_time,
            message=message,
            details=details,
            timestamp=""
        )
    
    def collect_system_metrics(self) -> SystemMetrics:
        """Coleta métricas do sistema."""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            load_avg = list(psutil.getloadavg()) if hasattr(psutil, 'getloadavg') else [0, 0, 0]
            uptime = time.time() - psutil.boot_time()
            
            return SystemMetrics(
                cpu_percent=cpu_percent,
                memory_percent=memory.percent,
                disk_percent=disk.percent,
                load_average=load_avg,
                uptime=uptime,
                timestamp=""
            )
            
        except Exception as e:
            logger.error(f"Erro ao coletar métricas do sistema: {e}")
            return SystemMetrics(
                cpu_percent=0.0,
                memory_percent=0.0,
                disk_percent=0.0,
                load_average=[0, 0, 0],
                uptime=0.0,
                timestamp=""
            )
    
    def run_all_checks(self) -> Dict[str, Any]:
        """Executa todas as verificações de saúde."""
        logger.info("Iniciando verificações de saúde...")
        
        # Lista de verificações
        checks = [
            ('health', '/health'),
            ('api_status', '/api/status'),
            ('users', '/api/users/me'),
        ]
        
        # APIs externas
        external_apis = [
            ('ViaCEP', 'https://viacep.com.br/ws/01310-100/json/'),
            ('Memed', 'https://api.memed.com.br/health'),
            ('ClickSign', 'https://api.clicksign.com/health')
        ]
        
        # Executar verificações em paralelo
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            # Verificações da API
            api_futures = {
                executor.submit(self.check_api_endpoint, endpoint): name 
                for name, endpoint in checks
            }
            
            # Verificações de APIs externas
            external_futures = {
                executor.submit(self.check_external_api, name, url): name 
                for name, url in external_apis
            }
            
            # Verificações de infraestrutura
            db_future = executor.submit(self.check_database)
            redis_future = executor.submit(self.check_redis)
            
            # Coletar resultados
            for future in as_completed(api_futures):
                result = future.result()
                self.results.append(result)
            
            for future in as_completed(external_futures):
                result = future.result()
                self.results.append(result)
            
            # Resultados de infraestrutura
            self.results.append(db_future.result())
            self.results.append(redis_future.result())
        
        # Coletar métricas do sistema
        self.system_metrics = self.collect_system_metrics()
        
        # Gerar relatório
        return self.generate_report()
    
    def generate_report(self) -> Dict[str, Any]:
        """Gera relatório de saúde."""
        # Contar status
        status_counts = {
            'healthy': 0,
            'warning': 0,
            'critical': 0,
            'unknown': 0
        }
        
        for result in self.results:
            status_counts[result.status] += 1
        
        # Status geral
        overall_status = 'healthy'
        if status_counts['critical'] > 0:
            overall_status = 'critical'
        elif status_counts['warning'] > 0:
            overall_status = 'warning'
        elif status_counts['unknown'] > 0:
            overall_status = 'unknown'
        
        # Verificar métricas do sistema
        system_status = self.evaluate_system_metrics()
        if system_status == 'critical':
            overall_status = 'critical'
        elif system_status == 'warning' and overall_status == 'healthy':
            overall_status = 'warning'
        
        report = {
            'timestamp': datetime.now().isoformat(),
            'overall_status': overall_status,
            'summary': {
                'total_checks': len(self.results),
                'healthy': status_counts['healthy'],
                'warning': status_counts['warning'],
                'critical': status_counts['critical'],
                'unknown': status_counts['unknown']
            },
            'checks': [asdict(result) for result in self.results],
            'system_metrics': asdict(self.system_metrics) if self.system_metrics else None,
            'system_status': system_status
        }
        
        return report
    
    def evaluate_system_metrics(self) -> str:
        """Avalia as métricas do sistema."""
        if not self.system_metrics:
            return 'unknown'
        
        metrics = self.system_metrics
        
        # Verificar CPU
        if metrics.cpu_percent >= self.thresholds['cpu_critical']:
            return 'critical'
        
        # Verificar memória
        if metrics.memory_percent >= self.thresholds['memory_critical']:
            return 'critical'
        
        # Verificar disco
        if metrics.disk_percent >= self.thresholds['disk_critical']:
            return 'critical'
        
        # Verificar warnings
        if (metrics.cpu_percent >= self.thresholds['cpu_warning'] or
            metrics.memory_percent >= self.thresholds['memory_warning'] or
            metrics.disk_percent >= self.thresholds['disk_warning']):
            return 'warning'
        
        return 'healthy'
    
    def send_alerts(self, report: Dict[str, Any]):
        """Envia alertas se necessário."""
        if not self.alert_enabled or report['overall_status'] == 'healthy':
            return
        
        logger.info(f"Enviando alertas para status: {report['overall_status']}")
        
        # Preparar mensagem
        message = self.format_alert_message(report)
        
        # Enviar via webhook
        if self.webhook_url:
            self.send_webhook_alert(message, report)
        
        # Enviar via Slack
        if self.slack_webhook:
            self.send_slack_alert(message, report)
    
    def format_alert_message(self, report: Dict[str, Any]) -> str:
        """Formata mensagem de alerta."""
        status = report['overall_status'].upper()
        timestamp = report['timestamp']
        summary = report['summary']
        
        message = f"🚨 ALERTA DataClinica - Status: {status}\n"
        message += f"Timestamp: {timestamp}\n\n"
        message += f"Resumo:\n"
        message += f"- Total de verificações: {summary['total_checks']}\n"
        message += f"- Saudáveis: {summary['healthy']}\n"
        message += f"- Avisos: {summary['warning']}\n"
        message += f"- Críticos: {summary['critical']}\n"
        message += f"- Desconhecidos: {summary['unknown']}\n\n"
        
        # Adicionar detalhes dos problemas
        problems = [check for check in report['checks'] 
                   if check['status'] in ['warning', 'critical']]
        
        if problems:
            message += "Problemas detectados:\n"
            for problem in problems:
                message += f"- {problem['service']}: {problem['message']} ({problem['status']})\n"
        
        return message
    
    def send_webhook_alert(self, message: str, report: Dict[str, Any]):
        """Envia alerta via webhook."""
        try:
            payload = {
                'text': message,
                'status': report['overall_status'],
                'timestamp': report['timestamp'],
                'report': report
            }
            
            response = requests.post(
                self.webhook_url,
                json=payload,
                timeout=10
            )
            
            if response.status_code == 200:
                logger.info("Alerta webhook enviado com sucesso")
            else:
                logger.error(f"Erro ao enviar webhook: {response.status_code}")
                
        except Exception as e:
            logger.error(f"Erro ao enviar webhook: {e}")
    
    def send_slack_alert(self, message: str, report: Dict[str, Any]):
        """Envia alerta via Slack."""
        try:
            color = {
                'healthy': 'good',
                'warning': 'warning',
                'critical': 'danger',
                'unknown': '#808080'
            }.get(report['overall_status'], '#808080')
            
            payload = {
                'attachments': [{
                    'color': color,
                    'title': f"DataClinica Health Check - {report['overall_status'].upper()}",
                    'text': message,
                    'ts': int(datetime.now().timestamp())
                }]
            }
            
            response = requests.post(
                self.slack_webhook,
                json=payload,
                timeout=10
            )
            
            if response.status_code == 200:
                logger.info("Alerta Slack enviado com sucesso")
            else:
                logger.error(f"Erro ao enviar Slack: {response.status_code}")
                
        except Exception as e:
            logger.error(f"Erro ao enviar Slack: {e}")

def load_config(config_file: Optional[str] = None) -> Dict[str, Any]:
    """Carrega configuração de arquivo."""
    config = {
        'base_url': os.getenv('HEALTH_CHECK_URL', 'http://localhost:8000'),
        'timeout': int(os.getenv('HEALTH_CHECK_TIMEOUT', '30')),
        'alert_enabled': os.getenv('HEALTH_CHECK_ALERTS', 'false').lower() == 'true',
        'webhook_url': os.getenv('HEALTH_CHECK_WEBHOOK'),
        'slack_webhook': os.getenv('SLACK_WEBHOOK_URL')
    }
    
    if config_file and Path(config_file).exists():
        try:
            with open(config_file, 'r') as f:
                file_config = json.load(f)
                config.update(file_config)
            logger.info(f"Configuração carregada de: {config_file}")
        except Exception as e:
            logger.warning(f"Erro ao carregar configuração: {e}")
    
    return config

def main():
    """Função principal."""
    parser = argparse.ArgumentParser(description='Monitor de saúde DataClinica')
    parser.add_argument('--config', help='Arquivo de configuração JSON')
    parser.add_argument('--alert', action='store_true', help='Habilitar alertas')
    parser.add_argument('--verbose', '-v', action='store_true', help='Saída detalhada')
    parser.add_argument('--output', help='Arquivo de saída para o relatório JSON')
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    try:
        # Carregar configuração
        config = load_config(args.config)
        if args.alert:
            config['alert_enabled'] = True
        
        # Executar monitoramento
        monitor = HealthMonitor(config)
        report = monitor.run_all_checks()
        
        # Enviar alertas se necessário
        monitor.send_alerts(report)
        
        # Salvar relatório
        if args.output:
            with open(args.output, 'w') as f:
                json.dump(report, f, indent=2)
            logger.info(f"Relatório salvo em: {args.output}")
        
        # Imprimir resumo
        print(f"\nStatus Geral: {report['overall_status'].upper()}")
        print(f"Verificações: {report['summary']['total_checks']}")
        print(f"Saudáveis: {report['summary']['healthy']}")
        print(f"Avisos: {report['summary']['warning']}")
        print(f"Críticos: {report['summary']['critical']}")
        
        if args.verbose:
            print("\nDetalhes:")
            for check in report['checks']:
                status_icon = {
                    'healthy': '✅',
                    'warning': '⚠️',
                    'critical': '❌',
                    'unknown': '❓'
                }.get(check['status'], '❓')
                
                print(f"{status_icon} {check['service']}: {check['message']} ({check['response_time']:.2f}s)")
        
        # Exit code baseado no status
        exit_codes = {
            'healthy': 0,
            'warning': 1,
            'critical': 2,
            'unknown': 3
        }
        
        sys.exit(exit_codes.get(report['overall_status'], 3))
        
    except Exception as e:
        logger.error(f"Erro fatal: {e}")
        sys.exit(4)

if __name__ == '__main__':
    main()