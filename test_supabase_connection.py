#!/usr/bin/env python3
"""Script para testar a conexao com Supabase e funcionalidades basicas."""

import os
import sys
from dotenv import load_dotenv

print("Iniciando teste do Supabase...")

# Carregar variaveis de ambiente do arquivo .env.supabase
load_dotenv('.env.supabase')

print("Variaveis de ambiente carregadas")

# Verificar variaveis de ambiente
url = os.getenv('SUPABASE_URL')
anon_key = os.getenv('SUPABASE_ANON_KEY')
service_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

print(f"URL: {url}")
print(f"ANON_KEY: {anon_key[:20] if anon_key else 'Nao encontrada'}...")
print(f"SERVICE_KEY: {'Configurada' if service_key else 'Nao configurada'}")

if not url or not anon_key:
    print("Erro: Variaveis de ambiente nao configuradas")
    sys.exit(1)

try:
    from supabase import create_client
    print("Biblioteca supabase importada com sucesso")
    
    # Criar cliente
    supabase = create_client(url, anon_key)
    print("Cliente Supabase criado")
    
    # Testar consulta simples
    result = supabase.table('clinics').select('*').limit(1).execute()
    print(f"Teste de consulta: {len(result.data)} registros encontrados")
    
    print("Teste concluido com sucesso!")
    
except Exception as e:
    print(f"Erro durante o teste: {e}")
    sys.exit(1)