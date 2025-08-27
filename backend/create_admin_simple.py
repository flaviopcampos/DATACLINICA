#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para criar usuário admin diretamente no banco SQLite
"""

import sqlite3
from passlib.context import CryptContext
from datetime import datetime

def create_admin_user():
    """Cria usuário admin com hash bcrypt"""
    try:
        # Configuração de senha igual ao main_simple.py
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        
        # Conecta ao banco
        conn = sqlite3.connect('dataclinica.db')
        cursor = conn.cursor()
        
        # Verifica se o usuário já existe
        cursor.execute("SELECT id FROM users WHERE email = ?", ('admin@dataclinica.com',))
        if cursor.fetchone():
            print("Usuário admin@dataclinica.com já existe")
            conn.close()
            return
        
        # Cria hash da senha
        hashed_password = pwd_context.hash('admin123')
        now = datetime.now().isoformat()
        
        # Insere o usuário
        cursor.execute("""
            INSERT INTO users (username, email, hashed_password, full_name, role, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            'admin',
            'admin@dataclinica.com',
            hashed_password,
            'Administrador do Sistema',
            'admin',
            True,
            now
        ))
        
        conn.commit()
        user_id = cursor.lastrowid
        
        print(f"Usuário admin criado com ID: {user_id}")
        print("Email: admin@dataclinica.com")
        print("Password: admin123")
        
        conn.close()
        
    except Exception as e:
        print(f"Erro ao criar usuário: {e}")

if __name__ == "__main__":
    create_admin_user()