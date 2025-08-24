#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from backend.models_simple import Base, User, Clinic
from backend.database import engine, SessionLocal
from passlib.context import CryptContext

# Configuração de senha
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def create_admin_direct():
    # Criar tabelas
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Criar clínica se não existir
        clinic = db.query(Clinic).first()
        if not clinic:
            clinic = Clinic(
                name="DataClínica - Principal",
                cnpj="00.000.000/0001-00",
                email="contato@dataclinica.com.br"
            )
            db.add(clinic)
            db.flush()  # Para obter o ID
        
        # Remover usuário admin existente se houver
        existing_user = db.query(User).filter(User.email == 'admin@dataclinica.com.br').first()
        if existing_user:
            db.delete(existing_user)
            db.flush()
        
        # Criar usuário admin
        hashed_password = get_password_hash("Admin123!")
        admin_user = User(
            username="admin",
            email="admin@dataclinica.com.br",
            hashed_password=hashed_password,
            full_name="Administrador DataClínica",
            role="admin",
            clinic_id=clinic.id,
            is_active=True
        )
        
        db.add(admin_user)
        db.commit()
        
        print("✅ Usuário admin criado com sucesso!")
        print(f"📧 Email: admin@dataclinica.com.br")
        print(f"🔑 Senha: Admin123!")
        print(f"👤 Nome: Administrador DataClínica")
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_direct()