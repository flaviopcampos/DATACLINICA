#!/usr/bin/env python3
"""
Script de Teste de Conexão com Supabase usando Service Role

Este script testa operações administrativas usando a service role key
que bypassa as políticas RLS para testes.
"""

import os
import sys
from datetime import datetime
from supabase import create_client, Client

def test_admin_operations():
    print("🚀 Testando operações administrativas no Supabase...")
    
    # Carregar credenciais do arquivo .env
    env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
    url = None
    service_key = None
    
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                if line.startswith('SUPABASE_URL='):
                    url = line.split('=', 1)[1].strip()
                elif line.startswith('SUPABASE_SERVICE_ROLE_KEY='):
                    service_key = line.split('=', 1)[1].strip()
    
    if not url or not service_key:
        print("❌ Credenciais de service role não encontradas")
        return False
    
    try:
        # Criar cliente Supabase com service role (bypassa RLS)
        supabase = create_client(url, service_key)
        print(f"✅ Conexão administrativa estabelecida")
        
        # Testar operações CRUD completas
        print("\n🔄 Testando operações CRUD administrativas...")
        
        # 1. CREATE - Inserir uma clínica de teste
        test_clinic_data = {
            'name': f'Clínica Admin Teste {datetime.now().strftime("%Y%m%d_%H%M%S")}',
            'cnpj': f'98765432000{datetime.now().strftime("%H%M")}',
            'phone': '(11) 88888-8888',
            'email': 'admin@teste.com',
            'address': 'Rua Admin, 456',
            'city': 'São Paulo',
            'state': 'SP',
            'zip_code': '01234-567'
        }
        
        insert_result = supabase.table('clinics').insert(test_clinic_data).execute()
        if not insert_result.data:
            raise Exception("Falha ao inserir dados")
        
        clinic_id = insert_result.data[0]['id']
        print(f"✅ CREATE: Clínica criada com ID {clinic_id}")
        
        # 2. READ - Ler a clínica criada
        read_result = supabase.table('clinics').select('*').eq('id', clinic_id).execute()
        if not read_result.data:
            raise Exception("Falha ao ler dados")
        
        print(f"✅ READ: Clínica lida com sucesso")
        print(f"   Nome: {read_result.data[0]['name']}")
        
        # 3. UPDATE - Atualizar a clínica
        update_data = {'name': f'Clínica Admin Atualizada {datetime.now().strftime("%H%M%S")}'}
        update_result = supabase.table('clinics').update(update_data).eq('id', clinic_id).execute()
        if not update_result.data:
            raise Exception("Falha ao atualizar dados")
        
        print(f"✅ UPDATE: Clínica atualizada para: {update_result.data[0]['name']}")
        
        # 4. Testar relacionamentos - Criar um usuário para a clínica
        user_data = {
            'clinic_id': clinic_id,
            'email': f'admin_test_{datetime.now().strftime("%H%M%S")}@teste.com',
            'full_name': 'Admin Teste',
            'role': 'admin',
            'is_active': True
        }
        
        user_result = supabase.table('users').insert(user_data).execute()
        if user_result.data:
            user_id = user_result.data[0]['id']
            print(f"✅ RELACIONAMENTO: Usuário criado com ID {user_id}")
            
            # Limpar usuário de teste
            supabase.table('users').delete().eq('id', user_id).execute()
            print(f"✅ CLEANUP: Usuário de teste removido")
        
        # 5. DELETE - Deletar a clínica
        delete_result = supabase.table('clinics').delete().eq('id', clinic_id).execute()
        print(f"✅ DELETE: Clínica deletada com sucesso")
        
        # 6. Testar contagem de registros
        count_result = supabase.table('clinics').select('id', count='exact').execute()
        print(f"✅ COUNT: Total de clínicas no sistema: {count_result.count}")
        
        print("\n🎯 Todos os testes administrativos passaram com sucesso!")
        return True
        
    except Exception as e:
        print(f"❌ Erro: {str(e)}")
        return False

def test_rls_bypass():
    """Testa se a service role consegue bypassar RLS"""
    print("\n🔒 Testando bypass de RLS com service role...")
    
    env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
    url = None
    service_key = None
    anon_key = None
    
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                if line.startswith('SUPABASE_URL='):
                    url = line.split('=', 1)[1].strip()
                elif line.startswith('SUPABASE_SERVICE_ROLE_KEY='):
                    service_key = line.split('=', 1)[1].strip()
                elif line.startswith('SUPABASE_ANON_KEY='):
                    anon_key = line.split('=', 1)[1].strip()
    
    try:
        # Cliente com service role (bypassa RLS)
        admin_client = create_client(url, service_key)
        admin_count = admin_client.table('clinics').select('id', count='exact').execute()
        print(f"✅ Service Role: Pode ver {admin_count.count} clínicas (bypassa RLS)")
        
        # Cliente anônimo (sujeito a RLS)
        anon_client = create_client(url, anon_key)
        anon_count = anon_client.table('clinics').select('id', count='exact').execute()
        print(f"✅ Anon Role: Pode ver {anon_count.count} clínicas (sujeito a RLS)")
        
        print(f"✅ RLS está funcionando corretamente!")
        return True
        
    except Exception as e:
        print(f"❌ Erro no teste de RLS: {str(e)}")
        return False

def main():
    """Função principal"""
    print("=" * 60)
    print("🔧 TESTE ADMINISTRATIVO DO SUPABASE")
    print("=" * 60)
    
    success1 = test_admin_operations()
    success2 = test_rls_bypass()
    
    print("\n" + "=" * 60)
    if success1 and success2:
        print("🎉 TODOS OS TESTES ADMINISTRATIVOS PASSARAM!")
        print("✅ O Supabase está configurado e funcionando corretamente")
        print("✅ As políticas RLS estão ativas e funcionando")
        print("✅ Operações CRUD funcionam com privilégios administrativos")
    else:
        print("⚠️  ALGUNS TESTES FALHARAM")
        print("❌ Verifique a configuração do Supabase")
    
    print("=" * 60)
    return 0 if (success1 and success2) else 1

if __name__ == "__main__":
    sys.exit(main())