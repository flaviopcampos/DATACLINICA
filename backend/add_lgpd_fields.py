
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Migração para adicionar campos LGPD
"""

import os
import sqlite3
from datetime import datetime

def add_lgpd_fields():
    """Adiciona campos de consentimento LGPD à tabela users"""
    try:
        # Tenta diferentes caminhos para o banco de dados
        db_paths = ['dataclinica.db', '../dataclinica.db', './dataclinica.db']
        conn = None
        
        for db_path in db_paths:
            if os.path.exists(db_path):
                conn = sqlite3.connect(db_path)
                print(f"Conectado ao banco: {db_path}")
                break
        
        if not conn:
            print("❌ Banco de dados não encontrado")
            return
        cursor = conn.cursor()
        
        # Lista todas as tabelas disponíveis
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [t[0] for t in cursor.fetchall()]
        print(f"Tabelas disponíveis: {tables}")
        
        # Cria uma tabela específica para consentimentos LGPD
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS lgpd_consents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_email VARCHAR(255),
                consent_data_processing BOOLEAN DEFAULT FALSE,
                consent_date DATETIME,
                consent_purpose TEXT,
                ip_address VARCHAR(45),
                user_agent TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("✅ Tabela lgpd_consents criada/verificada")
        
        # Adiciona um registro de exemplo
        cursor.execute("""
            INSERT OR IGNORE INTO lgpd_consents 
            (user_email, consent_data_processing, consent_date, consent_purpose)
            VALUES (?, ?, ?, ?)
        """, (
            'admin@dataclinica.com',
            True,
            datetime.now(),
            'Processamento de dados para funcionamento do sistema médico'
        ))
        print("✅ Registro de exemplo adicionado à tabela lgpd_consents")
        
        conn.commit()
        conn.close()
        
        print("✅ Migração LGPD concluída com sucesso")
        
    except Exception as e:
        print(f"❌ Erro na migração LGPD: {e}")

if __name__ == "__main__":
    add_lgpd_fields()
