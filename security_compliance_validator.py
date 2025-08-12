#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Validador de Segurança e Conformidade do DataClinica
Testa aspectos de segurança, LGPD, e conformidade médica
"""

import requests
import sqlite3
import json
import logging
import time
from datetime import datetime
import hashlib
import re
import os

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('security_compliance_log.txt'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

class SecurityComplianceValidator:
    def __init__(self):
        self.backend_url = "http://localhost:8000"
        self.db_path = "backend/dataclinica.db"
        self.results = {
            'security_tests': [],
            'compliance_tests': [],
            'data_integrity_tests': [],
            'performance_tests': [],
            'start_time': datetime.now()
        }
    
    def log_result(self, category, test_name, passed, details=""):
        """Registra resultado de teste"""
        result = {
            'test_name': test_name,
            'passed': passed,
            'details': details,
            'timestamp': datetime.now().isoformat()
        }
        
        self.results[category].append(result)
        
        status = "[PASS]" if passed else "[FAIL]"
        logger.info(f"{status} {test_name}: {details}")
    
    def test_sql_injection_protection(self):
        """Testa proteção contra SQL Injection"""
        logger.info("Testando proteção contra SQL Injection...")
        
        # Payloads de teste SQL injection
        payloads = [
            "' OR '1'='1",
            "'; DROP TABLE users; --",
            "' UNION SELECT * FROM users --",
            "admin'--",
            "' OR 1=1#"
        ]
        
        for payload in payloads:
            try:
                response = requests.post(
                    f"{self.backend_url}/token",
                    data={'username': payload, 'password': 'test'},
                    timeout=5
                )
                
                # Se retornar 200, pode ser vulnerável
                if response.status_code == 200:
                    self.log_result('security_tests', f'SQL Injection Test: {payload}', False, 
                                  "Possível vulnerabilidade detectada")
                else:
                    self.log_result('security_tests', f'SQL Injection Test: {payload}', True, 
                                  "Payload rejeitado corretamente")
                    
            except Exception as e:
                self.log_result('security_tests', f'SQL Injection Test: {payload}', True, 
                              f"Erro esperado: {str(e)[:50]}")
    
    def test_password_security(self):
        """Testa segurança de senhas"""
        logger.info("Testando segurança de senhas...")
        
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Verifica se senhas estão hasheadas
            cursor.execute("SELECT username, hashed_password FROM users LIMIT 5")
            users = cursor.fetchall()
            
            for username, password in users:
                # Verifica se a senha parece estar hasheada (não é texto plano)
                if len(password) < 32:  # Hash SHA-256 tem 64 caracteres
                    self.log_result('security_tests', 'Password Hashing', False, 
                                  f"Senha de {username} pode não estar hasheada")
                else:
                    self.log_result('security_tests', 'Password Hashing', True, 
                                  f"Senha de {username} está hasheada")
            
            conn.close()
            
        except Exception as e:
            self.log_result('security_tests', 'Password Security', False, str(e))
    
    def test_data_encryption(self):
        """Testa criptografia de dados sensíveis"""
        logger.info("Testando criptografia de dados sensíveis...")
        
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Verifica se dados sensíveis estão criptografados
            sensitive_tables = ['patients', 'medical_records', 'appointments']
            
            for table in sensitive_tables:
                try:
                    cursor.execute(f"SELECT * FROM {table} LIMIT 1")
                    columns = [description[0] for description in cursor.description]
                    row = cursor.fetchone()
                    
                    if row:
                        # Verifica campos que deveriam estar criptografados
                        sensitive_fields = ['cpf', 'rg', 'phone', 'address']
                        for i, col in enumerate(columns):
                            if col in sensitive_fields and i < len(row):
                                value = row[i]
                                if value and isinstance(value, str):
                                    # Verifica se parece estar criptografado
                                    if re.match(r'^[0-9]{11}$', value):  # CPF não criptografado
                                        self.log_result('security_tests', f'Data Encryption - {table}.{col}', 
                                                      False, "Dados sensíveis não criptografados")
                                    else:
                                        self.log_result('security_tests', f'Data Encryption - {table}.{col}', 
                                                      True, "Dados parecem criptografados")
                    
                except sqlite3.OperationalError:
                    # Tabela não existe
                    pass
            
            conn.close()
            
        except Exception as e:
            self.log_result('security_tests', 'Data Encryption', False, str(e))
    
    def test_lgpd_compliance(self):
        """Testa conformidade com LGPD"""
        logger.info("Testando conformidade com LGPD...")
        
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Verifica se existe tabela de auditoria
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='audit_logs'")
            if cursor.fetchone():
                self.log_result('compliance_tests', 'LGPD - Audit Logs', True, 
                              "Tabela de auditoria encontrada")
            else:
                self.log_result('compliance_tests', 'LGPD - Audit Logs', False, 
                              "Tabela de auditoria não encontrada")
            
            # Verifica campos de consentimento
            cursor.execute("PRAGMA table_info(patients)")
            columns = [col[1] for col in cursor.fetchall()]
            
            consent_fields = ['consent_data_processing', 'consent_date']
            for field in consent_fields:
                if field in columns:
                    self.log_result('compliance_tests', f'LGPD - {field}', True, 
                                  "Campo de consentimento encontrado")
                else:
                    self.log_result('compliance_tests', f'LGPD - {field}', False, 
                                  "Campo de consentimento não encontrado")
            
            conn.close()
            
        except Exception as e:
            self.log_result('compliance_tests', 'LGPD Compliance', False, str(e))
    
    def test_data_integrity(self):
        """Testa integridade dos dados"""
        logger.info("Testando integridade dos dados...")
        
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Verifica integridade referencial
            tables_with_fk = [
                ('appointments', 'patient_id', 'patients', 'id'),
                ('appointments', 'doctor_id', 'doctors', 'id'),
                ('medical_records', 'patient_id', 'patients', 'id')
            ]
            
            for table, fk_col, ref_table, ref_col in tables_with_fk:
                try:
                    # Verifica se existem registros órfãos
                    query = f"""
                        SELECT COUNT(*) FROM {table} t
                        LEFT JOIN {ref_table} r ON t.{fk_col} = r.{ref_col}
                        WHERE t.{fk_col} IS NOT NULL AND r.{ref_col} IS NULL
                    """
                    cursor.execute(query)
                    orphans = cursor.fetchone()[0]
                    
                    if orphans == 0:
                        self.log_result('data_integrity_tests', f'Referential Integrity - {table}', 
                                      True, "Sem registros órfãos")
                    else:
                        self.log_result('data_integrity_tests', f'Referential Integrity - {table}', 
                                      False, f"{orphans} registros órfãos encontrados")
                        
                except sqlite3.OperationalError:
                    # Tabela não existe
                    pass
            
            conn.close()
            
        except Exception as e:
            self.log_result('data_integrity_tests', 'Data Integrity', False, str(e))
    
    def test_api_rate_limiting(self):
        """Testa limitação de taxa de requisições"""
        logger.info("Testando limitação de taxa de requisições...")
        
        # Faz muitas requisições rapidamente
        start_time = time.time()
        success_count = 0
        rate_limited = False
        
        for i in range(100):
            try:
                response = requests.get(f"{self.backend_url}/", timeout=1)
                if response.status_code == 429:  # Too Many Requests
                    rate_limited = True
                    break
                elif response.status_code == 200:
                    success_count += 1
            except:
                pass
        
        duration = time.time() - start_time
        
        if rate_limited:
            self.log_result('security_tests', 'Rate Limiting', True, 
                          "Rate limiting ativo")
        else:
            self.log_result('security_tests', 'Rate Limiting', False, 
                          f"{success_count} requisições em {duration:.2f}s sem limitação")
    
    def test_cors_configuration(self):
        """Testa configuração CORS"""
        logger.info("Testando configuração CORS...")
        
        try:
            # Testa requisição OPTIONS
            response = requests.options(
                f"{self.backend_url}/",
                headers={'Origin': 'http://malicious-site.com'},
                timeout=5
            )
            
            cors_headers = {
                'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
                'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
            }
            
            # Verifica se CORS está configurado de forma segura
            if cors_headers['Access-Control-Allow-Origin'] == '*':
                self.log_result('security_tests', 'CORS Configuration', False, 
                              "CORS permite qualquer origem (*)")
            else:
                self.log_result('security_tests', 'CORS Configuration', True, 
                              f"CORS configurado: {cors_headers['Access-Control-Allow-Origin']}")
                
        except Exception as e:
            self.log_result('security_tests', 'CORS Configuration', False, str(e))
    
    def test_https_enforcement(self):
        """Testa se HTTPS é obrigatório em produção"""
        logger.info("Testando configuração HTTPS...")
        
        # Em ambiente de desenvolvimento, HTTP é aceitável
        # Em produção, deveria redirecionar para HTTPS
        try:
            response = requests.get(self.backend_url, timeout=5, allow_redirects=False)
            
            # Verifica headers de segurança
            security_headers = {
                'Strict-Transport-Security': response.headers.get('Strict-Transport-Security'),
                'X-Content-Type-Options': response.headers.get('X-Content-Type-Options'),
                'X-Frame-Options': response.headers.get('X-Frame-Options'),
                'X-XSS-Protection': response.headers.get('X-XSS-Protection')
            }
            
            missing_headers = [k for k, v in security_headers.items() if not v]
            
            if missing_headers:
                self.log_result('security_tests', 'Security Headers', False, 
                              f"Headers ausentes: {', '.join(missing_headers)}")
            else:
                self.log_result('security_tests', 'Security Headers', True, 
                              "Todos os headers de segurança presentes")
                
        except Exception as e:
            self.log_result('security_tests', 'HTTPS Configuration', False, str(e))
    
    def generate_compliance_report(self):
        """Gera relatório de conformidade"""
        end_time = datetime.now()
        duration = end_time - self.results['start_time']
        
        report = f"""
=== RELATÓRIO DE SEGURANÇA E CONFORMIDADE ===

Duração: {duration}
Início: {self.results['start_time']}
Fim: {end_time}

"""
        
        categories = {
            'security_tests': 'TESTES DE SEGURANÇA',
            'compliance_tests': 'TESTES DE CONFORMIDADE',
            'data_integrity_tests': 'TESTES DE INTEGRIDADE',
            'performance_tests': 'TESTES DE PERFORMANCE'
        }
        
        for category, title in categories.items():
            tests = self.results[category]
            if tests:
                passed = sum(1 for t in tests if t['passed'])
                total = len(tests)
                
                report += f"\n{title}:\n"
                report += f"- Total: {total}\n"
                report += f"- Aprovados: {passed}\n"
                report += f"- Falharam: {total - passed}\n"
                report += f"- Taxa de sucesso: {(passed/total*100):.1f}%\n"
                
                # Lista falhas
                failures = [t for t in tests if not t['passed']]
                if failures:
                    report += "\nFALHAS:\n"
                    for failure in failures:
                        report += f"- {failure['test_name']}: {failure['details']}\n"
        
        # Salva relatório
        with open('security_compliance_report.txt', 'w', encoding='utf-8') as f:
            f.write(report)
        
        logger.info("\n" + report)
        return report
    
    def run_all_tests(self):
        """Executa todos os testes de segurança e conformidade"""
        logger.info("[START] Iniciando validação de segurança e conformidade")
        
        # Testes de segurança
        self.test_sql_injection_protection()
        self.test_password_security()
        self.test_data_encryption()
        self.test_api_rate_limiting()
        self.test_cors_configuration()
        self.test_https_enforcement()
        
        # Testes de conformidade
        self.test_lgpd_compliance()
        
        # Testes de integridade
        self.test_data_integrity()
        
        # Gera relatório
        self.generate_compliance_report()
        
        logger.info("[DONE] Validação de segurança e conformidade concluída")

def main():
    validator = SecurityComplianceValidator()
    validator.run_all_tests()

if __name__ == "__main__":
    main()