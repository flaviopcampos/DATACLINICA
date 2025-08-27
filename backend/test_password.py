#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para testar verificação de senha
"""

import sqlite3
from passlib.context import CryptContext

def test_password_verification():
    """Testa verificação de senha"""
    try:
        # Configuração de senha igual ao main_simple.py
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        
        # Conecta ao banco
        conn = sqlite3.connect('dataclinica.db')
        cursor = conn.cursor()
        
        # Busca o usuário admin
        cursor.execute("SELECT email, hashed_password FROM users WHERE email = ?", ('admin@dataclinica.com',))
        user = cursor.fetchone()
        
        if user:
            email, hashed_password = user
            print(f"Usuário encontrado: {email}")
            print(f"Hash armazenado: {hashed_password[:50]}...")
            
            # Testa a verificação da senha
            test_password = 'admin123'
            is_valid = pwd_context.verify(test_password, hashed_password)
            
            print(f"Senha testada: {test_password}")
            print(f"Verificação válida: {is_valid}")
            
            if not is_valid:
                # Cria um novo hash e testa
                new_hash = pwd_context.hash(test_password)
                print(f"Novo hash gerado: {new_hash[:50]}...")
                
                # Testa o novo hash
                is_new_valid = pwd_context.verify(test_password, new_hash)
                print(f"Novo hash válido: {is_new_valid}")
                
                # Atualiza no banco
                cursor.execute("UPDATE users SET hashed_password = ? WHERE email = ?", (new_hash, email))
                conn.commit()
                print("Hash atualizado no banco de dados")
        else:
            print("Usuário admin não encontrado")
        
        conn.close()
        
    except Exception as e:
        print(f"Erro no teste: {e}")

if __name__ == "__main__":
    test_password_verification()