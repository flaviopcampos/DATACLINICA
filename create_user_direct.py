#!/usr/bin/env python3
import sqlite3
import hashlib
from passlib.context import CryptContext

# Configuração de hash de senha
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def create_admin_user():
    db_path = "backend/dataclinica.db"
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Verificar se a tabela users existe
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users';")
        table_exists = cursor.fetchone()
        
        if not table_exists:
            print("❌ Tabela 'users' não encontrada no banco de dados")
            return
        
        # Verificar usuários existentes
        cursor.execute("SELECT id, email, username, full_name, role, is_active FROM users;")
        users = cursor.fetchall()
        
        print("=" * 50)
        print("USUÁRIOS NO BANCO DE DADOS")
        print("=" * 50)
        
        if users:
            for user in users:
                print(f"ID: {user[0]}")
                print(f"Email: {user[1]}")
                print(f"Username: {user[2]}")
                print(f"Nome: {user[3]}")
                print(f"Role: {user[4]}")
                print(f"Ativo: {user[5]}")
                print("-" * 30)
        else:
            print("❌ Nenhum usuário encontrado")
        
        # Verificar se já existe um admin
        cursor.execute("SELECT * FROM users WHERE role = 'admin' OR email = 'admin@dataclinica.com.br';")
        existing_admin = cursor.fetchone()
        
        if existing_admin:
            print("\n✅ Usuário administrador já existe!")
            print(f"📧 Email: {existing_admin[2]}")
            print(f"👤 Nome: {existing_admin[3]}")
            print("\n🔑 Credenciais de acesso:")
            print("📧 Email: admin@dataclinica.com.br")
            print("🔑 Senha: Admin123!")
        else:
            # Criar usuário admin
            hashed_password = get_password_hash("Admin123!")
            
            cursor.execute("""
                INSERT INTO users (username, email, full_name, hashed_password, role, is_active)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                "admin",
                "admin@dataclinica.com.br",
                "Administrador DataClínica",
                hashed_password,
                "admin",
                1
            ))
            
            conn.commit()
            
            print("\n✅ Usuário administrador criado com sucesso!")
            print("📧 Email: admin@dataclinica.com.br")
            print("🔑 Senha: Admin123!")
            print("👤 Nome: Administrador DataClínica")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Erro: {e}")

if __name__ == "__main__":
    print("🏥 DataClínica - Verificação/Criação de Usuário Administrador")
    print("=" * 60)
    create_admin_user()