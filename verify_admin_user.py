#!/usr/bin/env python3
"""
Script para verificar se o usuário admin foi criado no Supabase
"""

import os
import sys
from supabase import create_client, Client
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv('.env.supabase')

def verify_admin_user():
    """Verificar se o usuário admin existe no Supabase"""
    
    # Configurações do Supabase
    url = os.getenv('SUPABASE_URL')
    service_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not url or not service_key:
        print("❌ Erro: Variáveis SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não encontradas")
        return False
    
    try:
        # Criar cliente Supabase
        supabase: Client = create_client(url, service_key)
        
        # Buscar o usuário admin
        response = supabase.table('users').select('*').eq('email', 'admin@dataclinica.com.br').execute()
        
        if response.data:
            user = response.data[0]
            print("✅ Usuário admin criado com sucesso!")
            print(f"📧 Email: {user['email']}")
            print(f"👤 Nome: {user['full_name']}")
            print(f"🔑 Role: {user['role']}")
            print(f"✅ Ativo: {user['is_active']}")
            print(f"📅 Criado em: {user['created_at']}")
            print(f"🆔 ID: {user['id']}")
            
            # Documentar as credenciais
            print("\n📋 CREDENCIAIS DO ADMINISTRADOR:")
            print("================================")
            print(f"Email: admin@dataclinica.com.br")
            print(f"Senha: L@ura080319")
            print(f"Role: admin")
            print("================================")
            
            return True
        else:
            print("❌ Usuário admin não encontrado")
            return False
            
    except Exception as e:
        print(f"❌ Erro ao verificar usuário admin: {str(e)}")
        return False

if __name__ == "__main__":
    success = verify_admin_user()
    sys.exit(0 if success else 1)