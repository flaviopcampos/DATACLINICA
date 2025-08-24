#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.database import SessionLocal
from backend.models_simple import User

def check_admin_user():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == 'admin@dataclinica.com.br').first()
        if user:
            print(f"✅ Usuário encontrado: {user.email}")
            print(f"👤 Nome: {user.full_name}")
            print(f"🔑 Role: {user.role}")
            print(f"✅ Ativo: {user.is_active}")
            print(f"🏥 Clínica ID: {user.clinic_id}")
        else:
            print("❌ Usuário admin não encontrado")
    except Exception as e:
        print(f"❌ Erro ao verificar usuário: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_admin_user()