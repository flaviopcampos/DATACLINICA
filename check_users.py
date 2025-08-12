#!/usr/bin/env python3
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

try:
    from backend.database import SessionLocal
    from backend import models
    
    db = SessionLocal()
    users = db.query(models.User).all()
    
    print("=" * 50)
    print("USUÁRIOS NO BANCO DE DADOS")
    print("=" * 50)
    
    if not users:
        print("❌ Nenhum usuário encontrado no banco de dados")
    else:
        for user in users:
            print(f"ID: {user.id}")
            print(f"Email: {user.email}")
            print(f"Username: {getattr(user, 'username', 'N/A')}")
            print(f"Nome: {getattr(user, 'full_name', 'N/A')}")
            print(f"Role: {getattr(user, 'role', 'N/A')}")
            print(f"Ativo: {user.is_active}")
            print("-" * 30)
    
    db.close()
    
except Exception as e:
    print(f"❌ Erro ao consultar banco de dados: {e}")