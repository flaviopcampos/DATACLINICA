#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from sqlalchemy.orm import Session
from backend.database import SessionLocal, engine
from backend.models_simple import Base, User, Clinic
from passlib.context import CryptContext
import json

# Configuração de senha
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def create_admin_user():
    # Criar tabelas se não existirem
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Verificar se já existe uma clínica
        clinic = db.query(Clinic).first()
        if not clinic:
            # Criar clínica padrão
            clinic = Clinic(
                name="DataClínica - Clínica Principal",
                cnpj="00.000.000/0001-00",
                email="contato@dataclinica.com.br",
                phone="(11) 99999-9999",
                address="Rua Principal, 123",
                city="São Paulo",
                state="SP",
                zip_code="01000-000"
            )
            db.add(clinic)
            db.commit()
            db.refresh(clinic)
            print(f"✅ Clínica criada: {clinic.name}")
        
        # Carregar dados do admin do arquivo JSON
        with open('admin_user.json', 'r', encoding='utf-8') as f:
            admin_data = json.load(f)
        
        # Verificar se o usuário admin já existe
        existing_admin = db.query(User).filter(User.email == admin_data['email']).first()
        
        if existing_admin:
            # Atualizar senha do admin existente
            existing_admin.hashed_password = get_password_hash(admin_data['password'])
            existing_admin.full_name = admin_data['full_name']
            existing_admin.role = admin_data['role']
            existing_admin.username = admin_data['username']
            existing_admin.is_active = True
            db.commit()
            print(f"✅ Usuário admin atualizado: {existing_admin.email}")
        else:
            # Criar novo usuário admin
            admin_user = User(
                username=admin_data['username'],
                email=admin_data['email'],
                hashed_password=get_password_hash(admin_data['password']),
                full_name=admin_data['full_name'],
                role=admin_data['role'],
                clinic_id=clinic.id,
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            print(f"✅ Usuário admin criado: {admin_user.email}")
        
        print("\n🎉 Configuração concluída!")
        print(f"📧 Email: {admin_data['email']}")
        print(f"🔑 Senha: {admin_data['password']}")
        print(f"👤 Nome: {admin_data['full_name']}")
        print(f"🏥 Clínica: {clinic.name}")
        
    except Exception as e:
        print(f"❌ Erro ao criar usuário administrador: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()