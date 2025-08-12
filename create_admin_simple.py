#!/usr/bin/env python3
"""
Script simples para criar usuário administrador
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from sqlalchemy.orm import Session
from backend.database import SessionLocal, engine
from backend import models, crud, schemas
from passlib.context import CryptContext

# Configuração de hash de senha
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def create_admin_user():
    # Criar todas as tabelas
    models.Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Verificar se já existe um admin
        existing_admin = db.query(models.User).filter(
            models.User.role == "admin"
        ).first()
        
        if existing_admin:
            print(f"✅ Usuário administrador já existe: {existing_admin.email}")
            print(f"📧 Email: {existing_admin.email}")
            print(f"👤 Nome: {existing_admin.full_name}")
            return existing_admin
        
        # Criar usuário admin padrão
        admin_data = schemas.UserCreate(
            username="admin",
            email="admin@dataclinica.com.br",
            full_name="Administrador DataClínica",
            password="Admin123!",
            role="admin"
        )
        
        # Criar o usuário
        hashed_password = get_password_hash(admin_data.password)
        db_user = models.User(
            username=admin_data.username,
            email=admin_data.email,
            full_name=admin_data.full_name,
            hashed_password=hashed_password,
            role="admin",
            is_active=True
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        print("✅ Usuário administrador criado com sucesso!")
        print(f"📧 Email: {db_user.email}")
        print(f"👤 Nome: {db_user.full_name}")
        print(f"🔑 Senha: Admin123!")
        print(f"🆔 ID: {db_user.id}")
        
        return db_user
        
    except Exception as e:
        print(f"❌ Erro ao criar usuário administrador: {e}")
        db.rollback()
        return None
    finally:
        db.close()

if __name__ == "__main__":
    print("🏥 DataClínica - Criação de Usuário Administrador")
    print("=" * 50)
    create_admin_user()