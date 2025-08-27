#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from sqlalchemy import create_engine, text
from passlib.context import CryptContext
from backend.database import engine

# Configuração de senha
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def create_admin_sql():
    try:
        with engine.connect() as conn:
            # Primeiro, criar a clínica se não existir
            clinic_result = conn.execute(text("SELECT id FROM clinics LIMIT 1"))
            clinic_row = clinic_result.fetchone()
            
            if not clinic_row:
                conn.execute(text("""
                    INSERT INTO clinics (name, cnpj, email, is_active, created_at, updated_at)
                    VALUES ('DataClínica - Principal', '00.000.000/0001-00', 'contato@dataclinica.com.br', true, NOW(), NOW())
                """))
                clinic_id = 1
            else:
                clinic_id = clinic_row[0]
            
            # Remover usuário admin existente
            conn.execute(text("DELETE FROM users WHERE email = 'admin@dataclinica.com.br'"))
            
            # Criar hash da senha
            hashed_password = get_password_hash("Admin123!")
            
            # Inserir usuário admin
            conn.execute(text("""
                INSERT INTO users (
                    username, email, hashed_password, full_name, role, is_active, 
                    clinic_id, failed_login_attempts, created_at, updated_at
                ) VALUES (
                    'admin', 'admin@dataclinica.com.br', :password, 'Administrador DataClínica', 
                    'admin', true, :clinic_id, 0, NOW(), NOW()
                )
            """), {"password": hashed_password, "clinic_id": clinic_id})
            
            conn.commit()
            
            print("✅ Usuário admin criado com sucesso!")
            print(f"📧 Email: admin@dataclinica.com.br")
            print(f"🔑 Senha: Admin123!")
            print(f"👤 Nome: Administrador DataClínica")
            
    except Exception as e:
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    create_admin_sql()