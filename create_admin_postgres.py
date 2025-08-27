#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from sqlalchemy import create_engine, text
from passlib.context import CryptContext
from backend.database import DATABASE_URL

# Configuração de senha
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def create_admin_postgres():
    try:
        engine = create_engine(DATABASE_URL)
        
        with engine.connect() as conn:
            # Primeiro, verificar se existe uma clínica
            clinic_result = conn.execute(text("SELECT id FROM clinics LIMIT 1"))
            clinic_row = clinic_result.fetchone()
            
            if not clinic_row:
                # Criar clínica
                conn.execute(text("""
                    INSERT INTO clinics (name, cnpj, email, is_active, created_at, updated_at)
                    VALUES ('DataClínica - Principal', '00.000.000/0001-00', 'contato@dataclinica.com.br', true, NOW(), NOW())
                """))
                conn.commit()
                
                # Buscar o ID da clínica criada
                clinic_result = conn.execute(text("SELECT id FROM clinics WHERE name = 'DataClínica - Principal'"))
                clinic_row = clinic_result.fetchone()
            
            clinic_id = clinic_row[0]
            
            # Verificar se o usuário admin já existe
            user_result = conn.execute(text("SELECT id FROM users WHERE email = 'admin@dataclinica.com.br'"))
            user_row = user_result.fetchone()
            
            if user_row:
                # Atualizar usuário existente
                hashed_password = get_password_hash("Admin123!")
                conn.execute(text("""
                    UPDATE users SET 
                        hashed_password = :password,
                        full_name = 'Administrador DataClínica',
                        role = 'admin',
                        is_active = true,
                        clinic_id = :clinic_id,
                        updated_at = NOW()
                    WHERE email = 'admin@dataclinica.com.br'
                """), {"password": hashed_password, "clinic_id": clinic_id})
                print("✅ Usuário admin atualizado com sucesso!")
            else:
                # Criar novo usuário admin
                hashed_password = get_password_hash("Admin123!")
                conn.execute(text("""
                    INSERT INTO users (
                        username, email, hashed_password, full_name, role, is_active, 
                        clinic_id, failed_login_attempts, created_at, updated_at
                    ) VALUES (
                        'admin', 'admin@dataclinica.com.br', :password, 'Administrador DataClínica', 
                        'admin', true, :clinic_id, 0, NOW(), NOW()
                    )
                """), {"password": hashed_password, "clinic_id": clinic_id})
                print("✅ Usuário admin criado com sucesso!")
            
            conn.commit()
            
            print(f"📧 Email: admin@dataclinica.com.br")
            print(f"🔑 Senha: Admin123!")
            print(f"👤 Nome: Administrador DataClínica")
            print(f"🏥 Clínica ID: {clinic_id}")
            
    except Exception as e:
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    create_admin_postgres()