#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Monitor de Sistema para DataClinica
Monitora recursos do sistema durante os testes de longa duração
"""

import psutil
import time
import json
import logging
from datetime import datetime
import sqlite3
import requests
import threading

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('system_monitor.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

class SystemMonitor:
    def __init__(self):
        self.monitoring = True
        self.metrics = []
        self.alerts = []
        self.start_time = datetime.now()
        
    def get_system_metrics(self):
        """Coleta métricas do sistema"""
        try:
            # CPU
            cpu_percent = psutil.cpu_percent(interval=1)
            cpu_count = psutil.cpu_count()
            
            # Memória
            memory = psutil.virtual_memory()
            memory_percent = memory.percent
            memory_available = memory.available / (1024**3)  # GB
            memory_used = memory.used / (1024**3)  # GB
            
            # Disco
            disk = psutil.disk_usage('C:\\')
            disk_percent = (disk.used / disk.total) * 100
            disk_free = disk.free / (1024**3)  # GB
            
            # Rede
            network = psutil.net_io_counters()
            
            # Processos
            processes = len(psutil.pids())
            
            metrics = {
                'timestamp': datetime.now().isoformat(),
                'cpu': {
                    'percent': cpu_percent,
                    'count': cpu_count
                },
                'memory': {
                    'percent': memory_percent,
                    'available_gb': round(memory_available, 2),
                    'used_gb': round(memory_used, 2)
                },
                'disk': {
                    'percent': round(disk_percent, 2),
                    'free_gb': round(disk_free, 2)
                },
                'network': {
                    'bytes_sent': network.bytes_sent,
                    'bytes_recv': network.bytes_recv
                },
                'processes': processes
            }
            
            return metrics
            
        except Exception as e:
            logger.error(f"Erro ao coletar métricas: {e}")
            return None
    
    def check_dataclinica_processes(self):
        """Verifica processos específicos do DataClinica"""
        dataclinica_processes = []
        
        for proc in psutil.process_iter(['pid', 'name', 'cmdline', 'cpu_percent', 'memory_percent']):
            try:
                cmdline = ' '.join(proc.info['cmdline']) if proc.info['cmdline'] else ''
                
                # Verifica se é processo do DataClinica
                if any(keyword in cmdline.lower() for keyword in ['dataclinica', 'uvicorn', 'npm run dev', 'vite']):
                    dataclinica_processes.append({
                        'pid': proc.info['pid'],
                        'name': proc.info['name'],
                        'cmdline': cmdline,
                        'cpu_percent': proc.info['cpu_percent'],
                        'memory_percent': proc.info['memory_percent']
                    })
                    
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
        
        return dataclinica_processes
    
    def check_database_size(self):
        """Verifica tamanho do banco de dados"""
        try:
            import os
            db_path = 'backend/dataclinica.db'
            if os.path.exists(db_path):
                size_bytes = os.path.getsize(db_path)
                size_mb = size_bytes / (1024**2)
                return round(size_mb, 2)
            return 0
        except Exception as e:
            logger.error(f"Erro ao verificar tamanho do DB: {e}")
            return 0
    
    def check_log_files_size(self):
        """Verifica tamanho dos arquivos de log"""
        try:
            import os
            import glob
            
            log_files = glob.glob('*.log') + glob.glob('*.txt')
            total_size = 0
            
            for log_file in log_files:
                if os.path.exists(log_file):
                    total_size += os.path.getsize(log_file)
            
            return round(total_size / (1024**2), 2)  # MB
        except Exception as e:
            logger.error(f"Erro ao verificar logs: {e}")
            return 0
    
    def check_service_health(self):
        """Verifica saúde dos serviços"""
        services = {
            'backend': {'url': 'http://localhost:8000/', 'status': 'unknown'},
            'frontend': {'url': 'http://localhost:5173/', 'status': 'unknown'}
        }
        
        for service, config in services.items():
            try:
                response = requests.get(config['url'], timeout=5)
                if response.status_code == 200:
                    config['status'] = 'healthy'
                    config['response_time'] = response.elapsed.total_seconds()
                else:
                    config['status'] = f'error_{response.status_code}'
            except Exception as e:
                config['status'] = f'error: {str(e)[:50]}'
        
        return services
    
    def check_alerts(self, metrics):
        """Verifica condições de alerta"""
        alerts = []
        
        # CPU alto
        if metrics['cpu']['percent'] > 80:
            alerts.append(f"CPU alto: {metrics['cpu']['percent']}%")
        
        # Memória alta
        if metrics['memory']['percent'] > 85:
            alerts.append(f"Memória alta: {metrics['memory']['percent']}%")
        
        # Disco cheio
        if metrics['disk']['percent'] > 90:
            alerts.append(f"Disco cheio: {metrics['disk']['percent']}%")
        
        # Pouca memória disponível
        if metrics['memory']['available_gb'] < 1:
            alerts.append(f"Pouca memória disponível: {metrics['memory']['available_gb']}GB")
        
        return alerts
    
    def generate_report(self):
        """Gera relatório de monitoramento"""
        if not self.metrics:
            return "Nenhuma métrica coletada"
        
        duration = datetime.now() - self.start_time
        
        # Estatísticas
        cpu_values = [m['cpu']['percent'] for m in self.metrics]
        memory_values = [m['memory']['percent'] for m in self.metrics]
        
        report = f"""
=== RELATÓRIO DE MONITORAMENTO DO SISTEMA ===

Duração: {duration}
Início: {self.start_time}
Fim: {datetime.now()}
Métricas coletadas: {len(self.metrics)}

=== ESTATÍSTICAS DE CPU ===
Média: {sum(cpu_values)/len(cpu_values):.1f}%
Máximo: {max(cpu_values):.1f}%
Mínimo: {min(cpu_values):.1f}%

=== ESTATÍSTICAS DE MEMÓRIA ===
Média: {sum(memory_values)/len(memory_values):.1f}%
Máximo: {max(memory_values):.1f}%
Mínimo: {min(memory_values):.1f}%

=== ALERTAS GERADOS ===
"""
        
        if self.alerts:
            for alert in self.alerts:
                report += f"- {alert}\n"
        else:
            report += "Nenhum alerta gerado\n"
        
        # Última métrica
        if self.metrics:
            last_metric = self.metrics[-1]
            report += f"""

=== ESTADO ATUAL ===
CPU: {last_metric['cpu']['percent']}%
Memória: {last_metric['memory']['percent']}% ({last_metric['memory']['used_gb']}GB usados)
Disco: {last_metric['disk']['percent']}% ({last_metric['disk']['free_gb']}GB livres)
Processos: {last_metric['processes']}
"""
        
        return report
    
    def save_metrics_to_file(self):
        """Salva métricas em arquivo JSON"""
        try:
            with open('system_metrics.json', 'w') as f:
                json.dump({
                    'start_time': self.start_time.isoformat(),
                    'metrics': self.metrics,
                    'alerts': self.alerts
                }, f, indent=2)
        except Exception as e:
            logger.error(f"Erro ao salvar métricas: {e}")
    
    def monitor_loop(self, duration_hours=12, interval_seconds=60):
        """Loop principal de monitoramento"""
        logger.info(f"[START] Iniciando monitoramento por {duration_hours} horas")
        
        end_time = self.start_time.timestamp() + (duration_hours * 3600)
        
        while time.time() < end_time and self.monitoring:
            try:
                # Coleta métricas do sistema
                metrics = self.get_system_metrics()
                if metrics:
                    self.metrics.append(metrics)
                    
                    # Verifica alertas
                    alerts = self.check_alerts(metrics)
                    for alert in alerts:
                        if alert not in self.alerts:
                            self.alerts.append(alert)
                            logger.warning(f"[ALERT] {alert}")
                    
                    # Log das métricas principais
                    logger.info(f"CPU: {metrics['cpu']['percent']}% | "
                              f"RAM: {metrics['memory']['percent']}% | "
                              f"Disco: {metrics['disk']['percent']}%")
                
                # Verifica processos do DataClinica
                processes = self.check_dataclinica_processes()
                if processes:
                    logger.info(f"Processos DataClinica ativos: {len(processes)}")
                    for proc in processes:
                        if proc['cpu_percent'] and proc['cpu_percent'] > 50:
                            logger.warning(f"Processo com CPU alto: {proc['name']} ({proc['cpu_percent']}%)")
                
                # Verifica tamanho do banco
                db_size = self.check_database_size()
                if db_size > 0:
                    logger.info(f"Tamanho do banco: {db_size}MB")
                
                # Verifica logs
                log_size = self.check_log_files_size()
                if log_size > 100:  # Mais de 100MB
                    logger.warning(f"Arquivos de log grandes: {log_size}MB")
                
                # Verifica saúde dos serviços
                services = self.check_service_health()
                for service, config in services.items():
                    if config['status'] == 'healthy':
                        logger.info(f"{service.capitalize()}: OK ({config.get('response_time', 0):.2f}s)")
                    else:
                        logger.error(f"{service.capitalize()}: {config['status']}")
                
                # Salva métricas periodicamente
                if len(self.metrics) % 10 == 0:  # A cada 10 coletas
                    self.save_metrics_to_file()
                
                # Tempo restante
                remaining = end_time - time.time()
                if remaining > 0:
                    hours = int(remaining // 3600)
                    minutes = int((remaining % 3600) // 60)
                    logger.info(f"Tempo restante: {hours:02d}:{minutes:02d}")
                
                time.sleep(interval_seconds)
                
            except KeyboardInterrupt:
                logger.info("Monitoramento interrompido pelo usuário")
                break
            except Exception as e:
                logger.error(f"Erro no monitoramento: {e}")
                time.sleep(interval_seconds)
        
        # Relatório final
        report = self.generate_report()
        logger.info("\n" + report)
        
        # Salva relatório
        with open('system_monitoring_report.txt', 'w', encoding='utf-8') as f:
            f.write(report)
        
        # Salva métricas finais
        self.save_metrics_to_file()
        
        logger.info("[DONE] Monitoramento concluído")
    
    def stop_monitoring(self):
        """Para o monitoramento"""
        self.monitoring = False

def main():
    monitor = SystemMonitor()
    
    try:
        # Monitora por 12 horas, coletando métricas a cada minuto
        monitor.monitor_loop(duration_hours=12, interval_seconds=60)
    except KeyboardInterrupt:
        logger.info("Monitoramento interrompido")
    finally:
        monitor.stop_monitoring()

if __name__ == "__main__":
    main()