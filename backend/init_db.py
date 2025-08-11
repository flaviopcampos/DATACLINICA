#!/usr/bin/env python3
"""
Script para inicializar o banco de dados e criar o primeiro usuário admin
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
import crud
import schemas
from passlib.context import CryptContext

def init_database():
    # Criar todas as tabelas
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Verificar se já existe um usuário admin
        existing_admin = db.query(models.User).filter(models.User.role == "admin").first()
        if existing_admin:
            print(f"Usuário admin já existe: {existing_admin.username}")
            return existing_admin
        
        # Criar usuário admin
        admin_data = schemas.UserCreate(
            username="admin",
            email="admin@dataclinica.com",
            password="admin123",
            full_name="Administrador do Sistema",
            role="admin",
            is_active=True
        )
        
        admin_user = crud.create_user(db=db, user=admin_data)
        print(f"Usuário admin criado com sucesso: {admin_user.username}")
        return admin_user
        
    except Exception as e:
        print(f"Erro ao criar usuário admin: {e}")
        db.rollback()
        return None
    finally:
        db.close()

if __name__ == "__main__":
    print("Inicializando banco de dados...")
    user = init_database()
    if user:
        print("\nBanco de dados inicializado com sucesso!")
        print(f"Usuário: {user.username}")
        print(f"Email: {user.email}")
        print("Senha: admin123")
    else:
        print("Falha ao inicializar o banco de dados.")