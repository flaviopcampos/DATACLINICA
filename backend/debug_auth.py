#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para debug da autenticação
"""

import sqlite3
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from database import SessionLocal
from models_simple import User

# Configuração de senha (mesma do main_simple.py)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def debug_authentication():
    """Debug completo da autenticação"""
    email = "admin@dataclinica.com"
    password = "admin123"
    
    print("=== DEBUG AUTENTICAÇÃO ===")
    print(f"Email: {email}")
    print(f"Password: {password}")
    print()
    
    # 1. Verificar diretamente no SQLite
    print("1. Verificação direta no SQLite:")
    conn = sqlite3.connect('dataclinica.db')
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, email, hashed_password, full_name, clinic_id FROM users WHERE email = ?", (email,))
    user_data = cursor.fetchone()
    
    if user_data:
        user_id, user_email, hashed_password, full_name, clinic_id = user_data
        print(f"✅ Usuário encontrado no SQLite:")
        print(f"   ID: {user_id}")
        print(f"   Email: {user_email}")
        print(f"   Nome: {full_name}")
        print(f"   Clinic ID: {clinic_id}")
        print(f"   Hash: {hashed_password[:50]}...")
        
        # Verificar senha
        password_valid = pwd_context.verify(password, hashed_password)
        print(f"   Senha válida: {password_valid}")
    else:
        print("❌ Usuário não encontrado no SQLite")
        conn.close()
        return
    
    conn.close()
    print()
    
    # 2. Verificar via SQLAlchemy
    print("2. Verificação via SQLAlchemy:")
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if user:
            print(f"✅ Usuário encontrado via SQLAlchemy:")
            print(f"   ID: {user.id}")
            print(f"   Email: {user.email}")
            print(f"   Nome: {user.full_name}")
            print(f"   Clinic ID: {user.clinic_id}")
            print(f"   Hash: {user.hashed_password[:50]}...")
            
            # Verificar senha
            password_valid = pwd_context.verify(password, user.hashed_password)
            print(f"   Senha válida: {password_valid}")
            
            # Simular authenticate_user
            print()
            print("3. Simulando authenticate_user:")
            if not user:
                print("❌ Usuário não encontrado")
                return False
            if not pwd_context.verify(password, user.hashed_password):
                print("❌ Senha inválida")
                return False
            print("✅ Autenticação bem-sucedida")
            return user
        else:
            print("❌ Usuário não encontrado via SQLAlchemy")
    finally:
        db.close()
    
    print()
    
    # 3. Testar geração de novo hash
    print("4. Testando geração de novo hash:")
    new_hash = pwd_context.hash(password)
    print(f"Novo hash: {new_hash}")
    print(f"Novo hash válido: {pwd_context.verify(password, new_hash)}")
    
    # 4. Comparar hashes
    print()
    print("5. Comparação de hashes:")
    print(f"Hash atual: {hashed_password}")
    print(f"Novo hash:  {new_hash}")
    print(f"São iguais: {hashed_password == new_hash}")

if __name__ == "__main__":
    debug_authentication()