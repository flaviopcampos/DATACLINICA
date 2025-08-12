#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para aplicar correções de segurança no DataClinica
Corrige os problemas identificados durante a validação
"""

import os
import re
import logging
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

class SecurityFixer:
    def __init__(self):
        self.backend_path = "backend"
        self.main_file = os.path.join(self.backend_path, "main_simple.py")
        self.fixes_applied = []
        
    def backup_file(self, filepath):
        """Cria backup do arquivo antes de modificar"""
        backup_path = f"{filepath}.backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        try:
            with open(filepath, 'r', encoding='utf-8') as original:
                with open(backup_path, 'w', encoding='utf-8') as backup:
                    backup.write(original.read())
            logger.info(f"Backup criado: {backup_path}")
            return backup_path
        except Exception as e:
            logger.error(f"Erro ao criar backup: {e}")
            return None
    
    def add_security_headers_middleware(self):
        """Adiciona middleware para headers de segurança"""
        logger.info("Adicionando middleware de headers de segurança...")
        
        security_middleware = '''
# Middleware de Segurança
from fastapi.middleware.base import BaseHTTPMiddleware
from fastapi import Request, Response

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Headers de segurança
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
        
        return response
'''
        
        try:
            with open(self.main_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Adiciona o middleware após os imports
            if "SecurityHeadersMiddleware" not in content:
                # Encontra a linha após os imports
                lines = content.split('\n')
                insert_index = 0
                
                for i, line in enumerate(lines):
                    if line.startswith('from ') or line.startswith('import '):
                        insert_index = i + 1
                    elif line.strip() == '' and insert_index > 0:
                        insert_index = i
                        break
                
                lines.insert(insert_index, security_middleware)
                
                # Adiciona o middleware à aplicação
                app_line_found = False
                for i, line in enumerate(lines):
                    if 'app = FastAPI(' in line and not app_line_found:
                        # Procura o final da definição do app
                        j = i
                        while j < len(lines) and not lines[j].strip().endswith(')'):
                            j += 1
                        j += 1
                        
                        lines.insert(j, '')
                        lines.insert(j + 1, '# Adiciona middleware de segurança')
                        lines.insert(j + 2, 'app.add_middleware(SecurityHeadersMiddleware)')
                        app_line_found = True
                        break
                
                new_content = '\n'.join(lines)
                
                with open(self.main_file, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                
                self.fixes_applied.append("Headers de segurança adicionados")
                logger.info("✅ Headers de segurança adicionados com sucesso")
            else:
                logger.info("Headers de segurança já estão implementados")
                
        except Exception as e:
            logger.error(f"Erro ao adicionar headers de segurança: {e}")
    
    def fix_cors_configuration(self):
        """Corrige configuração CORS para ser mais restritiva"""
        logger.info("Corrigindo configuração CORS...")
        
        try:
            with open(self.main_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Substitui CORS permissivo por configuração mais segura
            cors_patterns = [
                (r'allow_origins=\["\*"\]', 'allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"]'),
                (r'allow_origins=\[\"\*\"\]', 'allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"]'),
                (r'origins=\["\*"\]', 'origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"]')
            ]
            
            cors_fixed = False
            for pattern, replacement in cors_patterns:
                if re.search(pattern, content):
                    content = re.sub(pattern, replacement, content)
                    cors_fixed = True
            
            if cors_fixed:
                with open(self.main_file, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                self.fixes_applied.append("Configuração CORS corrigida")
                logger.info("✅ Configuração CORS corrigida com sucesso")
            else:
                logger.info("Configuração CORS já está segura ou não encontrada")
                
        except Exception as e:
            logger.error(f"Erro ao corrigir CORS: {e}")
    
    def add_rate_limiting(self):
        """Adiciona rate limiting à aplicação"""
        logger.info("Adicionando rate limiting...")
        
        rate_limiting_code = '''
# Rate Limiting
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Configuração do rate limiter
limiter = Limiter(key_func=get_remote_address)
'''
        
        try:
            with open(self.main_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if "slowapi" not in content:
                # Adiciona imports do rate limiting
                lines = content.split('\n')
                insert_index = 0
                
                for i, line in enumerate(lines):
                    if line.startswith('from ') or line.startswith('import '):
                        insert_index = i + 1
                
                lines.insert(insert_index, rate_limiting_code)
                
                # Adiciona rate limiter à aplicação
                for i, line in enumerate(lines):
                    if 'app = FastAPI(' in line:
                        j = i
                        while j < len(lines) and not lines[j].strip().endswith(')'):
                            j += 1
                        j += 1
                        
                        lines.insert(j, '')
                        lines.insert(j + 1, '# Configura rate limiting')
                        lines.insert(j + 2, 'app.state.limiter = limiter')
                        lines.insert(j + 3, 'app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)')
                        break
                
                # Adiciona rate limiting aos endpoints críticos
                for i, line in enumerate(lines):
                    if '@app.post("/token")' in line:
                        lines.insert(i, '@limiter.limit("5/minute")')
                        break
                
                new_content = '\n'.join(lines)
                
                with open(self.main_file, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                
                self.fixes_applied.append("Rate limiting adicionado")
                logger.info("✅ Rate limiting adicionado com sucesso")
                logger.info("⚠️  Instale slowapi: pip install slowapi")
            else:
                logger.info("Rate limiting já está implementado")
                
        except Exception as e:
            logger.error(f"Erro ao adicionar rate limiting: {e}")
    
    def add_lgpd_fields_migration(self):
        """Cria migração para adicionar campos LGPD"""
        logger.info("Criando migração para campos LGPD...")
        
        migration_content = '''
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Migração para adicionar campos LGPD
"""

import sqlite3
from datetime import datetime

def add_lgpd_fields():
    """Adiciona campos de consentimento LGPD à tabela patients"""
    try:
        conn = sqlite3.connect('dataclinica.db')
        cursor = conn.cursor()
        
        # Verifica se os campos já existem
        cursor.execute("PRAGMA table_info(patients)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'consent_data_processing' not in columns:
            cursor.execute("""
                ALTER TABLE patients 
                ADD COLUMN consent_data_processing BOOLEAN DEFAULT FALSE
            """)
            print("✅ Campo consent_data_processing adicionado")
        
        if 'consent_date' not in columns:
            cursor.execute("""
                ALTER TABLE patients 
                ADD COLUMN consent_date DATETIME
            """)
            print("✅ Campo consent_date adicionado")
        
        if 'consent_purpose' not in columns:
            cursor.execute("""
                ALTER TABLE patients 
                ADD COLUMN consent_purpose TEXT
            """)
            print("✅ Campo consent_purpose adicionado")
        
        conn.commit()
        conn.close()
        
        print("✅ Migração LGPD concluída com sucesso")
        
    except Exception as e:
        print(f"❌ Erro na migração LGPD: {e}")

if __name__ == "__main__":
    add_lgpd_fields()
'''
        
        migration_file = os.path.join(self.backend_path, "add_lgpd_fields.py")
        
        try:
            with open(migration_file, 'w', encoding='utf-8') as f:
                f.write(migration_content)
            
            self.fixes_applied.append("Migração LGPD criada")
            logger.info(f"✅ Migração LGPD criada: {migration_file}")
            
        except Exception as e:
            logger.error(f"Erro ao criar migração LGPD: {e}")
    
    def create_requirements_update(self):
        """Atualiza requirements.txt com dependências de segurança"""
        logger.info("Atualizando requirements.txt...")
        
        security_deps = [
            "slowapi>=0.1.9",  # Rate limiting
            "python-multipart>=0.0.6",  # Form data
            "cryptography>=41.0.0",  # Criptografia
        ]
        
        requirements_file = os.path.join(self.backend_path, "requirements.txt")
        
        try:
            # Lê requirements existentes
            existing_deps = set()
            if os.path.exists(requirements_file):
                with open(requirements_file, 'r', encoding='utf-8') as f:
                    existing_deps = set(line.strip() for line in f if line.strip())
            
            # Adiciona novas dependências
            new_deps = []
            for dep in security_deps:
                dep_name = dep.split('>=')[0].split('==')[0]
                if not any(existing.startswith(dep_name) for existing in existing_deps):
                    new_deps.append(dep)
            
            if new_deps:
                with open(requirements_file, 'a', encoding='utf-8') as f:
                    f.write('\n# Dependências de segurança\n')
                    for dep in new_deps:
                        f.write(f"{dep}\n")
                
                self.fixes_applied.append(f"Dependências adicionadas: {', '.join(new_deps)}")
                logger.info(f"✅ Dependências de segurança adicionadas: {', '.join(new_deps)}")
            else:
                logger.info("Todas as dependências de segurança já estão presentes")
                
        except Exception as e:
            logger.error(f"Erro ao atualizar requirements: {e}")
    
    def generate_security_report(self):
        """Gera relatório das correções aplicadas"""
        report = f"""
=== RELATÓRIO DE CORREÇÕES DE SEGURANÇA ===

Data: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

CORREÇÕES APLICADAS:
"""
        
        if self.fixes_applied:
            for i, fix in enumerate(self.fixes_applied, 1):
                report += f"{i}. {fix}\n"
        else:
            report += "Nenhuma correção foi aplicada.\n"
        
        report += f"""

PRÓXIMOS PASSOS:
1. Reiniciar o servidor backend para aplicar as mudanças
2. Instalar novas dependências: pip install -r requirements.txt
3. Executar migração LGPD: python add_lgpd_fields.py
4. Testar as correções de segurança
5. Validar conformidade LGPD

OBSERVAÇÕES:
- Backups dos arquivos originais foram criados
- Teste todas as funcionalidades após aplicar as correções
- Monitore logs para identificar possíveis problemas
"""
        
        report_file = "security_fixes_report.txt"
        
        try:
            with open(report_file, 'w', encoding='utf-8') as f:
                f.write(report)
            
            logger.info(f"\n{report}")
            logger.info(f"✅ Relatório salvo em: {report_file}")
            
        except Exception as e:
            logger.error(f"Erro ao gerar relatório: {e}")
    
    def apply_all_fixes(self):
        """Aplica todas as correções de segurança"""
        logger.info("🔒 Iniciando aplicação de correções de segurança...")
        
        # Cria backup do arquivo principal
        if os.path.exists(self.main_file):
            self.backup_file(self.main_file)
        
        # Aplica correções
        self.add_security_headers_middleware()
        self.fix_cors_configuration()
        self.add_rate_limiting()
        self.add_lgpd_fields_migration()
        self.create_requirements_update()
        
        # Gera relatório
        self.generate_security_report()
        
        logger.info("🔒 Correções de segurança concluídas!")

def main():
    fixer = SecurityFixer()
    fixer.apply_all_fixes()

if __name__ == "__main__":
    main()