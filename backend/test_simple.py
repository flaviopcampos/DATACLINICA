#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
from supabase import create_client, Client

def test_connection():
    print("🚀 Testando conexão com Supabase...")
    
    # Carregar credenciais do arquivo .env
    env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
    url = None
    key = None
    
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                if line.startswith('SUPABASE_URL='):
                    url = line.split('=', 1)[1].strip()
                elif line.startswith('SUPABASE_ANON_KEY='):
                    key = line.split('=', 1)[1].strip()
    
    if not url or not key:
        print("❌ Credenciais não encontradas")
        return False
    
    try:
        # Criar cliente Supabase
        supabase = create_client(url, key)
        print(f"✅ Conexão estabelecida com: {url}")
        
        # Testar query simples
        result = supabase.table('clinics').select('id, name').limit(1).execute()
        print(f"✅ Query executada. Registros: {len(result.data)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_connection()
    sys.exit(0 if success else 1)