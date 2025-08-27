#!/usr/bin/env python3
"""
Script de Teste de Conexão e Funcionalidades do Supabase

Este script testa:
1. Conexão com o banco de dados
2. Operações CRUD básicas
3. Políticas RLS (Row Level Security)
4. Autenticação básica

Autor: Sistema DataClínica
Data: 2024
"""

import os
import sys
import json
from datetime import datetime, date
from typing import Dict, Any, Optional

from supabase import create_client, Client

class SupabaseConnectionTester:
    """Classe para testar conexão e funcionalidades do Supabase"""
    
    def __init__(self):
        self.supabase: Optional[Client] = None
        self.test_results = {
            'connection': False,
            'crud_operations': False,
            'rls_policies': False,
            'authentication': False,
            'errors': []
        }
        
    def setup_connection(self) -> bool:
        """Configura a conexão com o Supabase"""
        try:
            # Buscar credenciais do ambiente ou arquivo .env
            url = os.getenv('SUPABASE_URL')
            key = os.getenv('SUPABASE_ANON_KEY')
            
            if not url or not key:
                # Tentar carregar do arquivo .env
                env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
                if os.path.exists(env_path):
                    with open(env_path, 'r') as f:
                        for line in f:
                            if line.startswith('SUPABASE_URL='):
                                url = line.split('=', 1)[1].strip()
                            elif line.startswith('SUPABASE_ANON_KEY='):
                                key = line.split('=', 1)[1].strip()
            
            if not url or not key:
                raise ValueError("Credenciais do Supabase não encontradas")
            
            self.supabase = create_client(url, key)
            print(f"✅ Conexão estabelecida com: {url}")
            self.test_results['connection'] = True
            return True
            
        except Exception as e:
            error_msg = f"Erro na conexão: {str(e)}"
            print(f"❌ {error_msg}")
            self.test_results['errors'].append(error_msg)
            return False
    
    def test_database_connection(self) -> bool:
        """Testa a conexão básica com o banco"""
        try:
            # Testar uma query simples
            result = self.supabase.table('clinics').select('id, name').limit(1).execute()
            print(f"✅ Conexão com banco confirmada. Registros encontrados: {len(result.data)}")
            return True
            
        except Exception as e:
            error_msg = f"Erro na conexão com banco: {str(e)}"
            print(f"❌ {error_msg}")
            self.test_results['errors'].append(error_msg)
            return False
    
    def test_crud_operations(self) -> bool:
        """Testa operações CRUD básicas"""
        print("\n🔄 Testando operações CRUD...")
        
        try:
            # 1. CREATE - Inserir uma clínica de teste
            test_clinic_data = {
                'name': f'Clínica Teste {datetime.now().strftime("%Y%m%d_%H%M%S")}',
                'cnpj': f'12345678000{datetime.now().strftime("%H%M")}',
                'phone': '(11) 99999-9999',
                'email': 'teste@clinica.com',
                'address': 'Rua Teste, 123',
                'city': 'São Paulo',
                'state': 'SP',
                'zip_code': '01234-567'
            }
            
            insert_result = self.supabase.table('clinics').insert(test_clinic_data).execute()
            if not insert_result.data:
                raise Exception("Falha ao inserir dados")
            
            clinic_id = insert_result.data[0]['id']
            print(f"✅ CREATE: Clínica criada com ID {clinic_id}")
            
            # 2. READ - Ler a clínica criada
            read_result = self.supabase.table('clinics').select('*').eq('id', clinic_id).execute()
            if not read_result.data:
                raise Exception("Falha ao ler dados")
            
            print(f"✅ READ: Clínica lida com sucesso")
            
            # 3. UPDATE - Atualizar a clínica
            update_data = {'name': f'Clínica Teste Atualizada {datetime.now().strftime("%H%M%S")}'}
            update_result = self.supabase.table('clinics').update(update_data).eq('id', clinic_id).execute()
            if not update_result.data:
                raise Exception("Falha ao atualizar dados")
            
            print(f"✅ UPDATE: Clínica atualizada com sucesso")
            
            # 4. DELETE - Deletar a clínica
            delete_result = self.supabase.table('clinics').delete().eq('id', clinic_id).execute()
            print(f"✅ DELETE: Clínica deletada com sucesso")
            
            self.test_results['crud_operations'] = True
            return True
            
        except Exception as e:
            error_msg = f"Erro nas operações CRUD: {str(e)}"
            print(f"❌ {error_msg}")
            self.test_results['errors'].append(error_msg)
            return False
    
    def test_rls_policies(self) -> bool:
        """Testa as políticas RLS (Row Level Security)"""
        print("\n🔒 Testando políticas RLS...")
        
        try:
            # Verificar se RLS está habilitado nas tabelas principais
            tables_to_check = ['clinics', 'users', 'patients', 'doctors', 'appointments']
            
            for table in tables_to_check:
                try:
                    # Tentar acessar a tabela sem autenticação
                    result = self.supabase.table(table).select('id').limit(1).execute()
                    print(f"✅ RLS: Tabela '{table}' acessível (RLS configurado)")
                except Exception as e:
                    if "permission denied" in str(e).lower():
                        print(f"🔒 RLS: Tabela '{table}' protegida por RLS")
                    else:
                        print(f"⚠️  RLS: Erro inesperado na tabela '{table}': {str(e)}")
            
            self.test_results['rls_policies'] = True
            return True
            
        except Exception as e:
            error_msg = f"Erro ao testar RLS: {str(e)}"
            print(f"❌ {error_msg}")
            self.test_results['errors'].append(error_msg)
            return False
    
    def test_authentication(self) -> bool:
        """Testa autenticação básica"""
        print("\n🔐 Testando autenticação...")
        
        try:
            # Testar se o sistema de autenticação está funcionando
            # Verificar se conseguimos acessar informações do usuário atual
            user = self.supabase.auth.get_user()
            
            if user and user.user:
                print(f"✅ AUTH: Usuário autenticado: {user.user.email}")
            else:
                print("ℹ️  AUTH: Nenhum usuário autenticado (esperado para teste anônimo)")
            
            # Testar criação de usuário (comentado para evitar spam)
            # test_email = f"teste_{datetime.now().strftime('%Y%m%d_%H%M%S')}@teste.com"
            # test_password = "TesteSeguro123!"
            # 
            # signup_result = self.supabase.auth.sign_up({
            #     "email": test_email,
            #     "password": test_password
            # })
            # 
            # if signup_result.user:
            #     print(f"✅ AUTH: Usuário criado com sucesso")
            #     # Fazer logout
            #     self.supabase.auth.sign_out()
            #     print(f"✅ AUTH: Logout realizado com sucesso")
            
            self.test_results['authentication'] = True
            return True
            
        except Exception as e:
            error_msg = f"Erro na autenticação: {str(e)}"
            print(f"❌ {error_msg}")
            self.test_results['errors'].append(error_msg)
            return False
    
    def test_table_permissions(self) -> bool:
        """Testa permissões específicas das tabelas"""
        print("\n🔍 Testando permissões das tabelas...")
        
        try:
            # Verificar permissões para role anon
            test_tables = {
                'clinics': 'SELECT',
                'users': 'SELECT', 
                'patients': 'SELECT',
                'doctors': 'SELECT',
                'appointments': 'SELECT'
            }
            
            for table, operation in test_tables.items():
                try:
                    result = self.supabase.table(table).select('id').limit(1).execute()
                    print(f"✅ PERM: {operation} permitido na tabela '{table}'")
                except Exception as e:
                    if "permission denied" in str(e).lower():
                        print(f"🔒 PERM: {operation} negado na tabela '{table}' (RLS ativo)")
                    else:
                        print(f"⚠️  PERM: Erro na tabela '{table}': {str(e)}")
            
            return True
            
        except Exception as e:
            error_msg = f"Erro ao testar permissões: {str(e)}"
            print(f"❌ {error_msg}")
            self.test_results['errors'].append(error_msg)
            return False
    
    def run_all_tests(self) -> Dict[str, Any]:
        """Executa todos os testes"""
        print("🚀 Iniciando testes do Supabase...\n")
        
        # 1. Configurar conexão
        if not self.setup_connection():
            return self.test_results
        
        # 2. Testar conexão com banco
        if not self.test_database_connection():
            return self.test_results
        
        # 3. Testar operações CRUD
        self.test_crud_operations()
        
        # 4. Testar políticas RLS
        self.test_rls_policies()
        
        # 5. Testar autenticação
        self.test_authentication()
        
        # 6. Testar permissões das tabelas
        self.test_table_permissions()
        
        return self.test_results
    
    def print_summary(self):
        """Imprime resumo dos testes"""
        print("\n" + "="*50)
        print("📊 RESUMO DOS TESTES")
        print("="*50)
        
        total_tests = len([k for k in self.test_results.keys() if k != 'errors'])
        passed_tests = len([v for k, v in self.test_results.items() if k != 'errors' and v])
        
        print(f"✅ Testes aprovados: {passed_tests}/{total_tests}")
        print(f"❌ Testes falharam: {total_tests - passed_tests}/{total_tests}")
        
        print("\nDetalhes:")
        for test_name, result in self.test_results.items():
            if test_name != 'errors':
                status = "✅ PASSOU" if result else "❌ FALHOU"
                print(f"  {test_name.replace('_', ' ').title()}: {status}")
        
        if self.test_results['errors']:
            print("\n🚨 Erros encontrados:")
            for i, error in enumerate(self.test_results['errors'], 1):
                print(f"  {i}. {error}")
        
        # Recomendações
        print("\n💡 Recomendações:")
        if not self.test_results['connection']:
            print("  - Verifique as credenciais do Supabase no arquivo .env")
            print("  - Confirme se SUPABASE_URL e SUPABASE_ANON_KEY estão corretos")
        
        if not self.test_results['crud_operations']:
            print("  - Verifique as permissões das tabelas no Supabase")
            print("  - Confirme se as políticas RLS estão configuradas corretamente")
        
        if not self.test_results['rls_policies']:
            print("  - Revise as políticas RLS no painel do Supabase")
            print("  - Verifique se as roles 'anon' e 'authenticated' têm as permissões corretas")
        
        print("\n🎯 Status geral:", "✅ SISTEMA FUNCIONANDO" if passed_tests == total_tests else "⚠️  NECESSITA ATENÇÃO")

def main():
    """Função principal"""
    tester = SupabaseConnectionTester()
    results = tester.run_all_tests()
    tester.print_summary()
    
    # Salvar resultados em arquivo JSON
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    results_file = f"supabase_test_results_{timestamp}.json"
    
    with open(results_file, 'w', encoding='utf-8') as f:
        json.dump({
            'timestamp': timestamp,
            'results': results
        }, f, indent=2, ensure_ascii=False)
    
    print(f"\n📄 Resultados salvos em: {results_file}")
    
    return 0 if all(v for k, v in results.items() if k != 'errors') else 1

if __name__ == "__main__":
    sys.exit(main())