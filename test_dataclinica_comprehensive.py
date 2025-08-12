#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de Teste Abrangente do DataClinica
Testa todas as funcionalidades por 12 horas
"""

import requests
import time
import json
import logging
import threading
from datetime import datetime, timedelta
import random
import sys
import os

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('dataclinica_test_log.txt'),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

class DataClinicaTester:
    def __init__(self):
        self.backend_url = "http://localhost:8000"
        self.frontend_url = "http://localhost:5173"
        self.test_results = {
            'total_tests': 0,
            'passed_tests': 0,
            'failed_tests': 0,
            'errors': [],
            'performance_metrics': [],
            'start_time': datetime.now(),
            'end_time': None
        }
        self.auth_token = None
        self.test_user = {
            'username': 'test_user',
            'password': 'test_password123',
            'email': 'test@dataclinica.com'
        }
        
    def log_test_result(self, test_name, success, message="", duration=0):
        """Registra resultado de um teste"""
        self.test_results['total_tests'] += 1
        if success:
            self.test_results['passed_tests'] += 1
            logger.info(f"[PASS] {test_name}: PASSOU - {message} ({duration:.2f}s)")
        else:
            self.test_results['failed_tests'] += 1
            self.test_results['errors'].append({
                'test': test_name,
                'message': message,
                'timestamp': datetime.now().isoformat()
            })
            logger.error(f"[FAIL] {test_name}: FALHOU - {message} ({duration:.2f}s)")
    
    def test_backend_health(self):
        """Testa saúde do backend"""
        start_time = time.time()
        try:
            response = requests.get(f"{self.backend_url}/", timeout=10)
            duration = time.time() - start_time
            
            if response.status_code == 200:
                self.log_test_result("Backend Health Check", True, "Backend respondendo", duration)
                return True
            else:
                self.log_test_result("Backend Health Check", False, f"Status: {response.status_code}", duration)
                return False
        except Exception as e:
            duration = time.time() - start_time
            self.log_test_result("Backend Health Check", False, str(e), duration)
            return False
    
    def test_frontend_health(self):
        """Testa saúde do frontend"""
        start_time = time.time()
        try:
            response = requests.get(self.frontend_url, timeout=10)
            duration = time.time() - start_time
            
            if response.status_code == 200:
                self.log_test_result("Frontend Health Check", True, "Frontend respondendo", duration)
                return True
            else:
                self.log_test_result("Frontend Health Check", False, f"Status: {response.status_code}", duration)
                return False
        except Exception as e:
            duration = time.time() - start_time
            self.log_test_result("Frontend Health Check", False, str(e), duration)
            return False
    
    def test_authentication(self):
        """Testa sistema de autenticação"""
        start_time = time.time()
        try:
            # Teste de login
            login_data = {
                'username': self.test_user['username'],
                'password': self.test_user['password']
            }
            
            response = requests.post(
                f"{self.backend_url}/token",
                data=login_data,
                headers={'Content-Type': 'application/x-www-form-urlencoded'},
                timeout=10
            )
            
            duration = time.time() - start_time
            
            if response.status_code == 200:
                token_data = response.json()
                if 'access_token' in token_data:
                    self.auth_token = token_data['access_token']
                    self.log_test_result("Authentication Test", True, "Login bem-sucedido", duration)
                    return True
                else:
                    self.log_test_result("Authentication Test", False, "Token não encontrado na resposta", duration)
                    return False
            else:
                self.log_test_result("Authentication Test", False, f"Status: {response.status_code}", duration)
                return False
                
        except Exception as e:
            duration = time.time() - start_time
            self.log_test_result("Authentication Test", False, str(e), duration)
            return False
    
    def test_api_endpoints(self):
        """Testa endpoints principais da API"""
        if not self.auth_token:
            self.log_test_result("API Endpoints Test", False, "Token de autenticação não disponível")
            return False
        
        headers = {'Authorization': f'Bearer {self.auth_token}'}
        endpoints = [
            ('/users/me', 'GET'),
            ('/clinics/', 'GET'),
            ('/patients/', 'GET'),
            ('/appointments/', 'GET')
        ]
        
        for endpoint, method in endpoints:
            start_time = time.time()
            try:
                if method == 'GET':
                    response = requests.get(f"{self.backend_url}{endpoint}", headers=headers, timeout=10)
                
                duration = time.time() - start_time
                
                if response.status_code in [200, 404]:  # 404 pode ser normal para dados vazios
                    self.log_test_result(f"API {method} {endpoint}", True, f"Status: {response.status_code}", duration)
                else:
                    self.log_test_result(f"API {method} {endpoint}", False, f"Status: {response.status_code}", duration)
                    
            except Exception as e:
                duration = time.time() - start_time
                self.log_test_result(f"API {method} {endpoint}", False, str(e), duration)
    
    def test_performance(self):
        """Testa performance do sistema"""
        logger.info("Iniciando testes de performance...")
        
        # Teste de carga no backend
        def load_test_backend():
            for i in range(50):
                start_time = time.time()
                try:
                    response = requests.get(f"{self.backend_url}/", timeout=5)
                    duration = time.time() - start_time
                    self.test_results['performance_metrics'].append({
                        'endpoint': 'backend_root',
                        'duration': duration,
                        'status': response.status_code,
                        'timestamp': datetime.now().isoformat()
                    })
                except Exception as e:
                    duration = time.time() - start_time
                    self.test_results['performance_metrics'].append({
                        'endpoint': 'backend_root',
                        'duration': duration,
                        'status': 'error',
                        'error': str(e),
                        'timestamp': datetime.now().isoformat()
                    })
                time.sleep(0.1)
        
        # Teste de carga no frontend
        def load_test_frontend():
            for i in range(30):
                start_time = time.time()
                try:
                    response = requests.get(self.frontend_url, timeout=5)
                    duration = time.time() - start_time
                    self.test_results['performance_metrics'].append({
                        'endpoint': 'frontend_root',
                        'duration': duration,
                        'status': response.status_code,
                        'timestamp': datetime.now().isoformat()
                    })
                except Exception as e:
                    duration = time.time() - start_time
                    self.test_results['performance_metrics'].append({
                        'endpoint': 'frontend_root',
                        'duration': duration,
                        'status': 'error',
                        'error': str(e),
                        'timestamp': datetime.now().isoformat()
                    })
                time.sleep(0.2)
        
        # Executa testes em paralelo
        backend_thread = threading.Thread(target=load_test_backend)
        frontend_thread = threading.Thread(target=load_test_frontend)
        
        backend_thread.start()
        frontend_thread.start()
        
        backend_thread.join()
        frontend_thread.join()
        
        # Analisa métricas de performance
        backend_metrics = [m for m in self.test_results['performance_metrics'] if m['endpoint'] == 'backend_root']
        frontend_metrics = [m for m in self.test_results['performance_metrics'] if m['endpoint'] == 'frontend_root']
        
        if backend_metrics:
            avg_backend = sum(m['duration'] for m in backend_metrics if isinstance(m['duration'], (int, float))) / len(backend_metrics)
            self.log_test_result("Backend Performance", avg_backend < 1.0, f"Tempo médio: {avg_backend:.3f}s")
        
        if frontend_metrics:
            avg_frontend = sum(m['duration'] for m in frontend_metrics if isinstance(m['duration'], (int, float))) / len(frontend_metrics)
            self.log_test_result("Frontend Performance", avg_frontend < 2.0, f"Tempo médio: {avg_frontend:.3f}s")
    
    def test_stability(self, duration_hours=1):
        """Testa estabilidade do sistema por um período"""
        logger.info(f"Iniciando teste de estabilidade por {duration_hours} hora(s)...")
        
        end_time = datetime.now() + timedelta(hours=duration_hours)
        test_count = 0
        
        while datetime.now() < end_time:
            test_count += 1
            logger.info(f"Ciclo de estabilidade #{test_count}")
            
            # Testa componentes principais
            self.test_backend_health()
            self.test_frontend_health()
            
            if self.auth_token:
                self.test_api_endpoints()
            
            # Aguarda antes do próximo ciclo
            time.sleep(60)  # 1 minuto entre testes
            
            # Log de progresso
            remaining = end_time - datetime.now()
            logger.info(f"Tempo restante: {remaining}")
    
    def generate_report(self):
        """Gera relatório final dos testes"""
        self.test_results['end_time'] = datetime.now()
        duration = self.test_results['end_time'] - self.test_results['start_time']
        
        report = f"""
=== RELATÓRIO DE TESTES DATACLINICA ===

Duração total: {duration}
Início: {self.test_results['start_time']}
Fim: {self.test_results['end_time']}

RESUMO:
- Total de testes: {self.test_results['total_tests']}
- Testes aprovados: {self.test_results['passed_tests']}
- Testes falharam: {self.test_results['failed_tests']}
- Taxa de sucesso: {(self.test_results['passed_tests']/self.test_results['total_tests']*100):.1f}%

"""
        
        if self.test_results['errors']:
            report += "ERROS ENCONTRADOS:\n"
            for error in self.test_results['errors']:
                report += f"- {error['test']}: {error['message']} ({error['timestamp']})\n"
        
        if self.test_results['performance_metrics']:
            backend_times = [m['duration'] for m in self.test_results['performance_metrics'] 
                           if m['endpoint'] == 'backend_root' and isinstance(m['duration'], (int, float))]
            frontend_times = [m['duration'] for m in self.test_results['performance_metrics'] 
                            if m['endpoint'] == 'frontend_root' and isinstance(m['duration'], (int, float))]
            
            if backend_times:
                report += f"\nPERFORMANCE BACKEND:\n"
                report += f"- Tempo médio: {sum(backend_times)/len(backend_times):.3f}s\n"
                report += f"- Tempo mínimo: {min(backend_times):.3f}s\n"
                report += f"- Tempo máximo: {max(backend_times):.3f}s\n"
            
            if frontend_times:
                report += f"\nPERFORMANCE FRONTEND:\n"
                report += f"- Tempo médio: {sum(frontend_times)/len(frontend_times):.3f}s\n"
                report += f"- Tempo mínimo: {min(frontend_times):.3f}s\n"
                report += f"- Tempo máximo: {max(frontend_times):.3f}s\n"
        
        # Salva relatório
        with open('dataclinica_test_report.txt', 'w', encoding='utf-8') as f:
            f.write(report)
        
        logger.info("\n" + report)
        return report
    
    def run_comprehensive_test(self, duration_hours=12):
        """Executa teste abrangente por 12 horas"""
        logger.info(f"[START] Iniciando teste abrangente do DataClinica por {duration_hours} horas")
        
        # Testes iniciais
        logger.info("=== FASE 1: TESTES INICIAIS ===")
        self.test_backend_health()
        self.test_frontend_health()
        self.test_authentication()
        self.test_api_endpoints()
        
        # Testes de performance
        logger.info("=== FASE 2: TESTES DE PERFORMANCE ===")
        self.test_performance()
        
        # Testes de estabilidade (maior parte do tempo)
        logger.info("=== FASE 3: TESTES DE ESTABILIDADE ===")
        stability_duration = duration_hours - 1  # Reserva 1 hora para outros testes
        self.test_stability(stability_duration)
        
        # Testes finais
        logger.info("=== FASE 4: TESTES FINAIS ===")
        self.test_backend_health()
        self.test_frontend_health()
        self.test_performance()
        
        # Gera relatório
        logger.info("=== GERANDO RELATÓRIO FINAL ===")
        self.generate_report()
        
        logger.info("[DONE] Teste abrangente concluído!")

def main():
    """Função principal"""
    tester = DataClinicaTester()
    
    try:
        # Executa teste de 12 horas
        tester.run_comprehensive_test(12)
    except KeyboardInterrupt:
        logger.info("\n[WARN] Teste interrompido pelo usuário")
        tester.generate_report()
    except Exception as e:
        logger.error(f"[ERROR] Erro durante execução dos testes: {e}")
        tester.generate_report()

if __name__ == "__main__":
    main()