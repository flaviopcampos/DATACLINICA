#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para atualizar senha do usuário admin com hash bcrypt
"""

import sqlite3
from passlib.context import CryptContext

def update_admin_password():
    """Atualiza senha do usuário admin com hash bcrypt"""
    try:
        # Configuração de senha igual ao main_simple.py
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        
        # Conecta ao banco
        conn = sqlite3.connect('dataclinica.db')
        cursor = conn.cursor()
        
        # Cria hash da nova senha
        new_password = 'admin123'
        hashed_password = pwd_context.hash(new_password)
        
        # Atualiza a senha do usuário admin
        cursor.execute("""
            UPDATE users 
            SET hashed_password = ?
            WHERE email = ?
        """, (hashed_password, 'admin@dataclinica.com'))
        
        if cursor.rowcount > 0:
            conn.commit()
            print("Senha do usuário admin atualizada com sucesso!")
            print("Email: admin@dataclinica.com")
            print("Password: admin123")
            
            # Verifica se a senha foi atualizada
            cursor.execute("SELECT hashed_password FROM users WHERE email = ?", ('admin@dataclinica.com',))
            result = cursor.fetchone()
            if result:
                print(f"Novo hash: {result[0][:50]}...")
        else:
            print("Usuário admin não encontrado")
        
        conn.close()
        
    except Exception as e:
        print(f"Erro ao atualizar senha: {e}")

if __name__ == "__main__":
    update_admin_password()