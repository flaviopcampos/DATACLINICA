#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sqlite3
import os

def check_database_tables():
    db_files = ['dataclinica.db', 'backend/dataclinica.db']
    
    for db_file in db_files:
        if os.path.exists(db_file):
            print(f"\n=== Verificando {db_file} ===")
            try:
                conn = sqlite3.connect(db_file)
                cursor = conn.cursor()
                
                # Lista todas as tabelas
                cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
                tables = cursor.fetchall()
                
                if tables:
                    print(f"Tabelas encontradas: {[t[0] for t in tables]}")
                    
                    # Para cada tabela, mostra a estrutura
                    for table in tables:
                        table_name = table[0]
                        print(f"\n--- Estrutura da tabela {table_name} ---")
                        cursor.execute(f"PRAGMA table_info({table_name});")
                        columns = cursor.fetchall()
                        for col in columns:
                            print(f"  {col[1]} ({col[2]})")
                else:
                    print("Nenhuma tabela encontrada")
                
                conn.close()
            except Exception as e:
                print(f"Erro ao verificar {db_file}: {e}")
        else:
            print(f"Arquivo {db_file} não encontrado")

if __name__ == "__main__":
    check_database_tables()