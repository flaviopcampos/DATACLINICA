#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para criar usuário de teste
"""

import sqlite3
import hashlib
from datetime import datetime

def hash_password(password: str) -> str:
    """Hash da senha usando SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def create_test_user():
    """Cria usuário de teste diretamente no banco"""
    try:
        # Conecta ao banco
        conn = sqlite3.connect('dataclinica.db')
        cursor = conn.cursor()
        
        # Verifica se o usuário já existe
        cursor.execute("SELECT id FROM users WHERE username = ?", ('test_user',))
        if cursor.fetchone():
            print("Usuário test_user já existe")
            conn.close()
            return
        
        # Cria o usuário
        hashed_password = hash_password('test_password123')
        now = datetime.now().isoformat()
        
        cursor.execute("""
            INSERT INTO users (username, email, hashed_password, full_name, role, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            'test_user',
            'test@dataclinica.com',
            hashed_password,
            'Usuário de Teste',
            'admin',
            True,
            now
        ))
        
        conn.commit()
        user_id = cursor.lastrowid
        
        print(f"Usuário de teste criado com ID: {user_id}")
        print("Username: test_user")
        print("Password: test_password123")
        print("Email: test@dataclinica.com")
        
        conn.close()
        
    except Exception as e:
        print(f"Erro ao criar usuário: {e}")

if __name__ == "__main__":
    create_test_user()