#!/usr/bin/env python3
"""
Script para criar usuário administrador no Supabase usando requests

Este script cria um usuário administrador diretamente na tabela users
usando chamadas HTTP diretas ao Supabase REST API.

Autor: Sistema DataClínica
Data: 2024
"""

import os
import json
import hashlib
from datetime import datetime

try:
    import requests
except ImportError:
    print("❌ Erro: biblioteca requests não encontrada")
    print("Execute: pip install requests")
    exit(1)

# Carregar variáveis de ambiente do arquivo .env
def load_env_file():
    env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key.strip()] = value.strip()

def simple_hash_password(password: str) -> str:
    """Gera um hash simples da senha usando SHA-256"""
    salt = "dataclinica_salt"
    return hashlib.sha256((password + salt).encode()).hexdigest()

def create_admin_user():
    """Cria o usuário administrador no Supabase usando REST API"""
    print("🚀 Iniciando criação do usuário administrador...")
    
    try:
        # Carregar variáveis de ambiente
        load_env_file()
        
        supabase_url = os.getenv('SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        
        print(f"URL: {supabase_url}")
        print(f"Key: {supabase_key[:20]}..." if supabase_key else "Key: None")
        
        if not supabase_url or not supabase_key:
            print("❌ Erro: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não encontrados")
            print("Verifique o arquivo .env")
            return False
        
        # Headers para as requisições
        headers = {
            'apikey': supabase_key,
            'Authorization': f'Bearer {supabase_key}',
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        }
        
        print("✅ Headers configurados")
        
        # Dados do administrador
        admin_email = "admin@dataclinica.com.br"
        admin_username = "admin"
        admin_password = "Admin123!"
        admin_full_name = "Administrador do Sistema"
        admin_role = "admin"
        
        # Hash da senha
        hashed_password = simple_hash_password(admin_password)
        print("🔐 Senha processada com sucesso")
        
        # URL da API REST do Supabase
        api_url = f"{supabase_url}/rest/v1/users"
        
        # Verificar se o usuário já existe
        print("🔍 Verificando se usuário já existe...")
        check_url = f"{api_url}?email=eq.{admin_email}"
        
        response = requests.get(check_url, headers=headers)
        
        if response.status_code != 200:
            print(f"❌ Erro ao verificar usuário existente: {response.status_code}")
            print(f"Resposta: {response.text}")
            return False
        
        existing_users = response.json()
        
        if existing_users:
            print(f"👤 Usuário administrador já existe (ID: {existing_users[0]['id']})")
            print("🔄 Atualizando senha do administrador...")
            
            # Atualizar senha do usuário existente
            update_data = {
                'password_hash': hashed_password
            }
            
            update_url = f"{api_url}?id=eq.{existing_users[0]['id']}"
            response = requests.patch(update_url, headers=headers, json=update_data)
            
            if response.status_code == 200:
                print("✅ Senha do administrador atualizada com sucesso!")
                print(f"📧 Email: {admin_email}")
                print(f"🔑 Nova senha: {admin_password}")
            else:
                print(f"❌ Erro ao atualizar senha: {response.status_code}")
                print(f"Resposta: {response.text}")
                return False
                
        else:
            print("👤 Criando novo usuário administrador...")
            
            # Dados do novo usuário
            user_data = {
                'email': admin_email,
                'password_hash': hashed_password,
                'full_name': admin_full_name,
                'role': admin_role,
                'is_active': True
            }
            
            print(f"Dados do usuário: {json.dumps(user_data, indent=2)}")
            
            # Inserir novo usuário
            response = requests.post(api_url, headers=headers, json=user_data)
            
            if response.status_code == 201:
                new_user = response.json()[0]
                print("✅ Usuário administrador criado com sucesso!")
                print(f"🆔 ID: {new_user['id']}")
                print(f"👤 Username: {admin_username}")
                print(f"📧 Email: {admin_email}")
                print(f"🔑 Senha: {admin_password}")
                print(f"👑 Role: {admin_role}")
            else:
                print(f"❌ Erro ao criar usuário: {response.status_code}")
                print(f"Resposta: {response.text}")
                return False
        
        print("\n🎉 Processo concluído com sucesso!")
        print("\n📋 Credenciais do Administrador:")
        print(f"   Email: {admin_email}")
        print(f"   Senha: {admin_password}")
        print("\n⚠️  IMPORTANTE: Use essas credenciais para fazer login no sistema!")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro durante o processo: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def verify_admin_user():
    """Verifica se o usuário administrador foi criado corretamente"""
    print("\n🔍 Verificando usuário administrador...")
    
    try:
        # Carregar variáveis de ambiente
        load_env_file()
        
        supabase_url = os.getenv('SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        
        if not supabase_url or not supabase_key:
            return False
        
        # Headers para as requisições
        headers = {
            'apikey': supabase_key,
            'Authorization': f'Bearer {supabase_key}',
            'Content-Type': 'application/json'
        }
        
        # URL da API REST do Supabase
        api_url = f"{supabase_url}/rest/v1/users"
        check_url = f"{api_url}?email=eq.admin@dataclinica.com.br"
        
        response = requests.get(check_url, headers=headers)
        
        if response.status_code == 200:
            users = response.json()
            if users:
                user = users[0]
                print("✅ Usuário administrador encontrado:")
                print(f"   ID: {user['id']}")
                print(f"   Username: {user['username']}")
                print(f"   Email: {user['email']}")
                print(f"   Nome: {user['full_name']}")
                print(f"   Role: {user['role']}")
                print(f"   Ativo: {user['is_active']}")
                print(f"   Criado em: {user['created_at']}")
                return True
            else:
                print("❌ Usuário administrador não encontrado")
                return False
        else:
            print(f"❌ Erro ao verificar usuário: {response.status_code}")
            print(f"Resposta: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Erro ao verificar usuário: {str(e)}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("🏥 DATACLINICA - Criação de Usuário Administrador")
    print("=" * 60)
    
    # Criar/atualizar usuário administrador
    success = create_admin_user()
    
    if success:
        # Verificar se foi criado corretamente
        verify_admin_user()
        print("\n✅ Script executado com sucesso!")
    else:
        print("\n❌ Falha na execução do script!")
        exit(1)
    
    print("=" * 60)