#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from database import SessionLocal

def test_connection():
    db = SessionLocal()
    try:
        # Teste simples de conexão
        result = db.execute(text("SELECT 1 as test"))
        row = result.fetchone()
        print(f"Conexão bem-sucedida! Resultado: {row[0]}")
        return True
    except Exception as e:
        print(f"Erro na conexão: {e}")
        return False
    finally:
        db.close()

if __name__ == "__main__":
    test_connection()