#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para criar clínica padrão e associar usuário admin
"""

import sqlite3
from datetime import datetime

def fix_admin_clinic():
    """Cria clínica padrão e associa usuário admin"""
    try:
        # Conecta ao banco
        conn = sqlite3.connect('dataclinica.db')
        cursor = conn.cursor()
        
        # Verifica se já existe uma clínica padrão
        cursor.execute("SELECT id FROM clinics WHERE name = ?", ('Clínica Padrão',))
        clinic = cursor.fetchone()
        
        if not clinic:
            # Cria clínica padrão
            now = datetime.now().isoformat()
            cursor.execute("""
                INSERT INTO clinics (name, cnpj, email, phone, address, city, state, zip_code, is_active, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                'Clínica Padrão',
                '00.000.000/0001-00',
                'admin@dataclinica.com',
                '(11) 99999-9999',
                'Endereço Padrão, 123',
                'São Paulo',
                'SP',
                '01000-000',
                True,
                now,
                now
            ))
            clinic_id = cursor.lastrowid
            print(f"Clínica padrão criada com ID: {clinic_id}")
        else:
            clinic_id = clinic[0]
            print(f"Clínica padrão já existe com ID: {clinic_id}")
        
        # Atualiza o usuário admin para ter clinic_id
        cursor.execute("""
            UPDATE users 
            SET clinic_id = ?
            WHERE email = ?
        """, (clinic_id, 'admin@dataclinica.com'))
        
        if cursor.rowcount > 0:
            print("Usuário admin associado à clínica padrão")
        else:
            print("Usuário admin não encontrado")
        
        conn.commit()
        
        # Verifica o resultado
        cursor.execute("""
            SELECT u.username, u.email, u.clinic_id, c.name 
            FROM users u 
            LEFT JOIN clinics c ON u.clinic_id = c.id 
            WHERE u.email = ?
        """, ('admin@dataclinica.com',))
        
        result = cursor.fetchone()
        if result:
            print(f"Usuário: {result[0]}, Email: {result[1]}, Clínica ID: {result[2]}, Clínica: {result[3]}")
        
        conn.close()
        
    except Exception as e:
        print(f"Erro ao corrigir associação: {e}")

if __name__ == "__main__":
    fix_admin_clinic()