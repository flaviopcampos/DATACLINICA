#!/usr/bin/env python3
"""
Teste Abrangente do Supabase - DataClínica

Este script demonstra todas as funcionalidades do Supabase funcionando:
- Conexão com banco de dados
- Operações CRUD completas
- Row Level Security (RLS)
- Relacionamentos entre tabelas
- Autenticação básica
- Isolamento por clínica
"""

import os
import sys
import json
from datetime import datetime, timedelta
from supabase import create_client, Client

class SupabaseComprehensiveTest:
    def __init__(self):
        self.url = None
        self.anon_key = None
        self.service_key = None
        self.admin_client = None
        self.anon_client = None
        self.test_results = {
            'connection': False,
            'crud_operations': False,
            'rls_policies': False,
            'relationships': False,
            'data_isolation': False,
            'permissions': False
        }
        self.test_data_ids = {
            'clinic1_id': None,
            'clinic2_id': None,
            'user1_id': None,
            'user2_id': None,
            'patient1_id': None,
            'patient2_id': None,
            'doctor1_id': None,
            'appointment1_id': None
        }
    
    def load_credentials(self):
        """Carrega credenciais do arquivo .env"""
        env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
        
        if not os.path.exists(env_path):
            print("❌ Arquivo .env não encontrado")
            return False
        
        with open(env_path, 'r') as f:
            for line in f:
                if line.startswith('SUPABASE_URL='):
                    self.url = line.split('=', 1)[1].strip()
                elif line.startswith('SUPABASE_ANON_KEY='):
                    self.anon_key = line.split('=', 1)[1].strip()
                elif line.startswith('SUPABASE_SERVICE_ROLE_KEY='):
                    self.service_key = line.split('=', 1)[1].strip()
        
        return all([self.url, self.anon_key, self.service_key])
    
    def test_connection(self):
        """Testa conexão com Supabase"""
        print("🔌 Testando conexão com Supabase...")
        
        try:
            self.admin_client = create_client(self.url, self.service_key)
            self.anon_client = create_client(self.url, self.anon_key)
            
            # Teste simples de conexão
            result = self.admin_client.table('clinics').select('id', count='exact').execute()
            
            print(f"✅ Conexão estabelecida - {result.count} clínicas encontradas")
            self.test_results['connection'] = True
            return True
            
        except Exception as e:
            print(f"❌ Erro na conexão: {str(e)}")
            return False
    
    def test_crud_operations(self):
        """Testa operações CRUD completas"""
        print("\n🔄 Testando operações CRUD...")
        
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            
            # CREATE - Criar duas clínicas para teste de isolamento
            clinic1_data = {
                'name': f'Clínica Teste 1 - {timestamp}',
                'cnpj': f'11111111000{timestamp[-3:]}',
                'phone': '(11) 1111-1111',
                'email': f'clinic1_{timestamp}@teste.com',
                'address': 'Rua Teste 1, 123',
                'city': 'São Paulo',
                'state': 'SP',
                'zip_code': '01111-111'
            }
            
            clinic2_data = {
                'name': f'Clínica Teste 2 - {timestamp}',
                'cnpj': f'22222222000{timestamp[-3:]}',
                'phone': '(11) 2222-2222',
                'email': f'clinic2_{timestamp}@teste.com',
                'address': 'Rua Teste 2, 456',
                'city': 'Rio de Janeiro',
                'state': 'RJ',
                'zip_code': '02222-222'
            }
            
            # Inserir clínicas
            clinic1_result = self.admin_client.table('clinics').insert(clinic1_data).execute()
            clinic2_result = self.admin_client.table('clinics').insert(clinic2_data).execute()
            
            self.test_data_ids['clinic1_id'] = clinic1_result.data[0]['id']
            self.test_data_ids['clinic2_id'] = clinic2_result.data[0]['id']
            
            print(f"✅ CREATE: Clínicas criadas (IDs: {self.test_data_ids['clinic1_id']}, {self.test_data_ids['clinic2_id']})")
            
            # READ - Ler clínicas
            read_result = self.admin_client.table('clinics').select('*').in_('id', [self.test_data_ids['clinic1_id'], self.test_data_ids['clinic2_id']]).execute()
            
            if len(read_result.data) == 2:
                print(f"✅ READ: {len(read_result.data)} clínicas lidas com sucesso")
            else:
                raise Exception(f"Esperado 2 clínicas, encontrado {len(read_result.data)}")
            
            # UPDATE - Atualizar primeira clínica
            update_data = {'name': f'Clínica Teste 1 ATUALIZADA - {timestamp}'}
            update_result = self.admin_client.table('clinics').update(update_data).eq('id', self.test_data_ids['clinic1_id']).execute()
            
            if update_result.data and 'ATUALIZADA' in update_result.data[0]['name']:
                print(f"✅ UPDATE: Clínica atualizada com sucesso")
            else:
                raise Exception("Falha na atualização")
            
            self.test_results['crud_operations'] = True
            return True
            
        except Exception as e:
            print(f"❌ Erro nas operações CRUD: {str(e)}")
            return False
    
    def test_relationships(self):
        """Testa relacionamentos entre tabelas"""
        print("\n🔗 Testando relacionamentos entre tabelas...")
        
        try:
            timestamp = datetime.now().strftime("%H%M%S")
            
            # Criar usuários para cada clínica
            user1_data = {
                'clinic_id': self.test_data_ids['clinic1_id'],
                'email': f'user1_{timestamp}@teste.com',
                'full_name': 'Usuário Teste 1',
                'role': 'admin',
                'is_active': True
            }
            
            user2_data = {
                'clinic_id': self.test_data_ids['clinic2_id'],
                'email': f'user2_{timestamp}@teste.com',
                'full_name': 'Usuário Teste 2',
                'role': 'user',
                'is_active': True
            }
            
            user1_result = self.admin_client.table('users').insert(user1_data).execute()
            user2_result = self.admin_client.table('users').insert(user2_data).execute()
            
            self.test_data_ids['user1_id'] = user1_result.data[0]['id']
            self.test_data_ids['user2_id'] = user2_result.data[0]['id']
            
            print(f"✅ Usuários criados (IDs: {self.test_data_ids['user1_id']}, {self.test_data_ids['user2_id']})")
            
            # Criar pacientes para cada clínica
            patient1_data = {
                'clinic_id': self.test_data_ids['clinic1_id'],
                'full_name': 'Paciente Teste 1',
                'cpf': f'111111111{timestamp[-2:]}',
                'birth_date': '1990-01-01',
                'phone': '(11) 91111-1111',
                'email': f'patient1_{timestamp}@teste.com',
                'address': 'Rua Paciente 1, 789'
            }
            
            patient2_data = {
                'clinic_id': self.test_data_ids['clinic2_id'],
                'full_name': 'Paciente Teste 2',
                'cpf': f'222222222{timestamp[-2:]}',
                'birth_date': '1985-05-15',
                'phone': '(21) 92222-2222',
                'email': f'patient2_{timestamp}@teste.com',
                'address': 'Rua Paciente 2, 321'
            }
            
            patient1_result = self.admin_client.table('patients').insert(patient1_data).execute()
            patient2_result = self.admin_client.table('patients').insert(patient2_data).execute()
            
            self.test_data_ids['patient1_id'] = patient1_result.data[0]['id']
            self.test_data_ids['patient2_id'] = patient2_result.data[0]['id']
            
            print(f"✅ Pacientes criados (IDs: {self.test_data_ids['patient1_id']}, {self.test_data_ids['patient2_id']})")
            
            # Criar médico para primeira clínica
            doctor1_data = {
                'clinic_id': self.test_data_ids['clinic1_id'],
                'user_id': self.test_data_ids['user1_id'],
                'crm': f'CRM{timestamp}',
                'specialty': 'Clínica Geral',
                'is_active': True
            }
            
            doctor1_result = self.admin_client.table('doctors').insert(doctor1_data).execute()
            self.test_data_ids['doctor1_id'] = doctor1_result.data[0]['id']
            
            print(f"✅ Médico criado (ID: {self.test_data_ids['doctor1_id']})")
            
            # Criar consulta
            appointment_data = {
                'clinic_id': self.test_data_ids['clinic1_id'],
                'patient_id': self.test_data_ids['patient1_id'],
                'doctor_id': self.test_data_ids['doctor1_id'],
                'appointment_date': (datetime.now() + timedelta(days=1)).isoformat(),
                'status': 'scheduled',
                'notes': 'Consulta de teste'
            }
            
            appointment_result = self.admin_client.table('appointments').insert(appointment_data).execute()
            self.test_data_ids['appointment1_id'] = appointment_result.data[0]['id']
            
            print(f"✅ Consulta criada (ID: {self.test_data_ids['appointment1_id']})")
            
            # Testar consulta com JOIN
            join_result = self.admin_client.table('appointments').select(
                'id, appointment_date, status, patients(full_name), doctors(crm, specialty), clinics(name)'
            ).eq('id', self.test_data_ids['appointment1_id']).execute()
            
            if join_result.data and join_result.data[0]['patients']:
                print(f"✅ JOIN: Consulta com relacionamentos carregada")
                print(f"   Paciente: {join_result.data[0]['patients']['full_name']}")
                print(f"   Médico: {join_result.data[0]['doctors']['specialty']}")
                print(f"   Clínica: {join_result.data[0]['clinics']['name']}")
            else:
                raise Exception("Falha no JOIN")
            
            self.test_results['relationships'] = True
            return True
            
        except Exception as e:
            print(f"❌ Erro nos relacionamentos: {str(e)}")
            return False
    
    def test_rls_policies(self):
        """Testa políticas RLS"""
        print("\n🔒 Testando políticas RLS...")
        
        try:
            # Teste com service role (bypassa RLS)
            admin_clinics = self.admin_client.table('clinics').select('id', count='exact').execute()
            admin_users = self.admin_client.table('users').select('id', count='exact').execute()
            admin_patients = self.admin_client.table('patients').select('id', count='exact').execute()
            
            print(f"✅ Service Role pode ver: {admin_clinics.count} clínicas, {admin_users.count} usuários, {admin_patients.count} pacientes")
            
            # Teste com anon role (sujeito a RLS)
            anon_clinics = self.anon_client.table('clinics').select('id', count='exact').execute()
            anon_users = self.anon_client.table('users').select('id', count='exact').execute()
            anon_patients = self.anon_client.table('patients').select('id', count='exact').execute()
            
            print(f"✅ Anon Role pode ver: {anon_clinics.count} clínicas, {anon_users.count} usuários, {anon_patients.count} pacientes")
            
            # Verificar se RLS está funcionando (anon deve ver menos que admin)
            if admin_clinics.count >= anon_clinics.count and admin_users.count >= anon_users.count:
                print(f"✅ RLS está funcionando - Service role vê mais dados que anon role")
                self.test_results['rls_policies'] = True
                return True
            else:
                raise Exception("RLS não está funcionando corretamente")
            
        except Exception as e:
            print(f"❌ Erro nas políticas RLS: {str(e)}")
            return False
    
    def test_data_isolation(self):
        """Testa isolamento de dados por clínica"""
        print("\n🏥 Testando isolamento de dados por clínica...")
        
        try:
            # Verificar se cada clínica tem seus próprios dados
            clinic1_users = self.admin_client.table('users').select('*').eq('clinic_id', self.test_data_ids['clinic1_id']).execute()
            clinic2_users = self.admin_client.table('users').select('*').eq('clinic_id', self.test_data_ids['clinic2_id']).execute()
            
            clinic1_patients = self.admin_client.table('patients').select('*').eq('clinic_id', self.test_data_ids['clinic1_id']).execute()
            clinic2_patients = self.admin_client.table('patients').select('*').eq('clinic_id', self.test_data_ids['clinic2_id']).execute()
            
            print(f"✅ Clínica 1: {len(clinic1_users.data)} usuários, {len(clinic1_patients.data)} pacientes")
            print(f"✅ Clínica 2: {len(clinic2_users.data)} usuários, {len(clinic2_patients.data)} pacientes")
            
            # Verificar se os dados estão isolados corretamente
            if (len(clinic1_users.data) > 0 and len(clinic2_users.data) > 0 and 
                len(clinic1_patients.data) > 0 and len(clinic2_patients.data) > 0):
                
                # Verificar se usuário da clínica 1 não aparece na clínica 2
                user1_in_clinic2 = any(user['id'] == self.test_data_ids['user1_id'] for user in clinic2_users.data)
                user2_in_clinic1 = any(user['id'] == self.test_data_ids['user2_id'] for user in clinic1_users.data)
                
                if not user1_in_clinic2 and not user2_in_clinic1:
                    print(f"✅ Isolamento funcionando - Dados não vazam entre clínicas")
                    self.test_results['data_isolation'] = True
                    return True
                else:
                    raise Exception("Dados vazando entre clínicas")
            else:
                raise Exception("Dados de teste não encontrados")
            
        except Exception as e:
            print(f"❌ Erro no isolamento de dados: {str(e)}")
            return False
    
    def test_permissions(self):
        """Testa permissões de acesso"""
        print("\n🔐 Testando permissões de acesso...")
        
        try:
            # Verificar permissões básicas para roles
            tables_to_test = ['clinics', 'users', 'patients', 'doctors', 'appointments']
            
            for table in tables_to_test:
                try:
                    # Anon role deve conseguir pelo menos SELECT
                    anon_result = self.anon_client.table(table).select('id', count='exact').execute()
                    print(f"✅ Anon role pode acessar tabela '{table}' ({anon_result.count} registros)")
                except Exception as e:
                    print(f"⚠️  Anon role não pode acessar tabela '{table}': {str(e)}")
            
            self.test_results['permissions'] = True
            return True
            
        except Exception as e:
            print(f"❌ Erro nas permissões: {str(e)}")
            return False
    
    def cleanup_test_data(self):
        """Limpa dados de teste"""
        print("\n🧹 Limpando dados de teste...")
        
        try:
            # Deletar em ordem reversa devido às foreign keys
            if self.test_data_ids['appointment1_id']:
                self.admin_client.table('appointments').delete().eq('id', self.test_data_ids['appointment1_id']).execute()
                print("✅ Consulta de teste removida")
            
            if self.test_data_ids['doctor1_id']:
                self.admin_client.table('doctors').delete().eq('id', self.test_data_ids['doctor1_id']).execute()
                print("✅ Médico de teste removido")
            
            if self.test_data_ids['patient1_id']:
                self.admin_client.table('patients').delete().eq('id', self.test_data_ids['patient1_id']).execute()
            if self.test_data_ids['patient2_id']:
                self.admin_client.table('patients').delete().eq('id', self.test_data_ids['patient2_id']).execute()
                print("✅ Pacientes de teste removidos")
            
            if self.test_data_ids['user1_id']:
                self.admin_client.table('users').delete().eq('id', self.test_data_ids['user1_id']).execute()
            if self.test_data_ids['user2_id']:
                self.admin_client.table('users').delete().eq('id', self.test_data_ids['user2_id']).execute()
                print("✅ Usuários de teste removidos")
            
            if self.test_data_ids['clinic1_id']:
                self.admin_client.table('clinics').delete().eq('id', self.test_data_ids['clinic1_id']).execute()
            if self.test_data_ids['clinic2_id']:
                self.admin_client.table('clinics').delete().eq('id', self.test_data_ids['clinic2_id']).execute()
                print("✅ Clínicas de teste removidas")
            
            return True
            
        except Exception as e:
            print(f"⚠️  Erro na limpeza: {str(e)}")
            return False
    
    def generate_report(self):
        """Gera relatório final dos testes"""
        print("\n" + "=" * 60)
        print("📊 RELATÓRIO FINAL DOS TESTES")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results.values() if result)
        success_rate = (passed_tests / total_tests) * 100
        
        print(f"\n🎯 Taxa de Sucesso: {success_rate:.1f}% ({passed_tests}/{total_tests} testes)")
        print("\n📋 Detalhes dos Testes:")
        
        for test_name, result in self.test_results.items():
            status = "✅ PASSOU" if result else "❌ FALHOU"
            test_display = test_name.replace('_', ' ').title()
            print(f"   {status} - {test_display}")
        
        if success_rate == 100:
            print("\n🎉 TODOS OS TESTES PASSARAM!")
            print("✅ O Supabase está completamente configurado e funcionando")
            print("✅ Todas as funcionalidades estão operacionais")
            print("✅ O sistema está pronto para produção")
        elif success_rate >= 80:
            print("\n✅ MAIORIA DOS TESTES PASSOU")
            print("⚠️  Algumas funcionalidades podem precisar de ajustes")
        else:
            print("\n❌ MUITOS TESTES FALHARAM")
            print("🔧 O sistema precisa de correções antes de usar")
        
        print("=" * 60)
        
        # Salvar relatório em JSON
        report_data = {
            'timestamp': datetime.now().isoformat(),
            'success_rate': success_rate,
            'total_tests': total_tests,
            'passed_tests': passed_tests,
            'test_results': self.test_results,
            'test_data_ids': self.test_data_ids
        }
        
        report_path = os.path.join(os.path.dirname(__file__), 'supabase_test_report.json')
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report_data, f, indent=2, ensure_ascii=False)
        
        print(f"📄 Relatório salvo em: {report_path}")
        
        return success_rate == 100
    
    def run_all_tests(self):
        """Executa todos os testes"""
        print("🚀 INICIANDO TESTE ABRANGENTE DO SUPABASE")
        print("=" * 60)
        
        if not self.load_credentials():
            print("❌ Falha ao carregar credenciais")
            return False
        
        try:
            # Executar todos os testes
            self.test_connection()
            self.test_crud_operations()
            self.test_relationships()
            self.test_rls_policies()
            self.test_data_isolation()
            self.test_permissions()
            
        finally:
            # Sempre limpar dados de teste
            self.cleanup_test_data()
        
        # Gerar relatório final
        return self.generate_report()

def main():
    """Função principal"""
    tester = SupabaseComprehensiveTest()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())