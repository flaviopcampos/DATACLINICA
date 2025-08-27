"""Exemplo de uso dos repositórios Supabase.

Este arquivo demonstra como usar os repositórios criados para substituir
as operações SQLAlchemy por operações Supabase.
"""

import os
from datetime import datetime, date, time
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv('.env.supabase')

from backend.repositories import ClinicRepository, PatientRepository, AppointmentRepository

def example_clinic_operations():
    """Exemplo de operações com clínicas."""
    print("\n=== OPERAÇÕES COM CLÍNICAS ===")
    
    clinic_repo = ClinicRepository()
    
    # Criar uma clínica
    clinic_data = {
        'name': 'Clínica Exemplo',
        'cnpj': '12.345.678/0001-90',
        'address': 'Rua das Flores, 123',
        'city': 'São Paulo',
        'state': 'SP',
        'zip_code': '01234-567',
        'phone': '(11) 1234-5678',
        'email': 'contato@clinicaexemplo.com.br',
        'is_active': True
    }
    
    try:
        # Verificar se já existe
        existing_clinic = clinic_repo.get_clinic_by_cnpj(clinic_data['cnpj'])
        if existing_clinic:
            print(f"Clínica já existe: {existing_clinic['name']}")
            clinic_id = existing_clinic['id']
        else:
            # Criar nova clínica
            new_clinic = clinic_repo.create_clinic(clinic_data)
            print(f"Clínica criada: {new_clinic['name']}")
            clinic_id = new_clinic['id']
        
        # Buscar clínicas ativas
        active_clinics = clinic_repo.get_active_clinics()
        print(f"Total de clínicas ativas: {len(active_clinics)}")
        
        # Obter estatísticas
        stats = clinic_repo.get_clinic_stats(clinic_id)
        print(f"Estatísticas da clínica: {stats}")
        
        return clinic_id
        
    except Exception as e:
        print(f"Erro nas operações com clínicas: {e}")
        return None

def example_patient_operations(clinic_id: str):
    """Exemplo de operações com pacientes."""
    print("\n=== OPERAÇÕES COM PACIENTES ===")
    
    patient_repo = PatientRepository()
    
    # Criar um paciente
    patient_data = {
        'clinic_id': clinic_id,
        'full_name': 'João da Silva',
        'cpf': '123.456.789-00',
        'birth_date': '1985-05-15',
        'gender': 'M',
        'phone': '(11) 9876-5432',
        'email': 'joao.silva@email.com',
        'address': 'Rua das Palmeiras, 456',
        'city': 'São Paulo',
        'state': 'SP',
        'zip_code': '01234-567'
    }
    
    try:
        # Verificar se já existe
        existing_patient = patient_repo.get_patient_by_cpf(patient_data['cpf'], clinic_id)
        if existing_patient:
            print(f"Paciente já existe: {existing_patient['full_name']}")
            patient_id = existing_patient['id']
        else:
            # Criar novo paciente
            new_patient = patient_repo.create_patient(patient_data)
            print(f"Paciente criado: {new_patient['full_name']}")
            patient_id = new_patient['id']
        
        # Buscar pacientes da clínica
        patients = patient_repo.get_by_clinic(clinic_id, page=1, limit=10)
        print(f"Total de pacientes na clínica: {len(patients)}")
        
        # Buscar pacientes por termo
        search_results = patient_repo.search_patients(clinic_id, 'João')
        print(f"Pacientes encontrados na busca: {len(search_results)}")
        
        # Buscar paciente com documentos
        patient_with_docs = patient_repo.get_patient_with_documents(patient_id)
        if patient_with_docs:
            print(f"Paciente com {len(patient_with_docs.get('documents', []))} documentos")
        
        return patient_id
        
    except Exception as e:
        print(f"Erro nas operações com pacientes: {e}")
        return None

def example_appointment_operations(clinic_id: str, patient_id: str):
    """Exemplo de operações com consultas."""
    print("\n=== OPERAÇÕES COM CONSULTAS ===")
    
    appointment_repo = AppointmentRepository()
    
    # Primeiro, vamos criar um médico para teste
    from backend.database_supabase import get_supabase_client
    client = get_supabase_client()
    
    # Verificar se já existe um médico
    existing_doctor = client.table('doctors').select('*').eq('clinic_id', clinic_id).limit(1).execute()
    
    if existing_doctor.data:
        doctor_id = existing_doctor.data[0]['id']
        print(f"Usando médico existente: ID {doctor_id}")
    else:
        # Criar um médico de exemplo
        doctor_data = {
            'clinic_id': clinic_id,
            'crm': '123456-SP',
            'specialty': 'Clínico Geral',
            'phone': '(11) 9999-8888',
            'email': 'medico@clinica.com',
            'consultation_fee': 150.00,
            'is_active': True
        }
        new_doctor = client.table('doctors').insert(doctor_data).execute()
        doctor_id = new_doctor.data[0]['id']
        print(f"Médico criado: ID {doctor_id}")
    
    # Criar uma consulta
    appointment_data = {
        'clinic_id': clinic_id,
        'patient_id': patient_id,
        'doctor_id': doctor_id,
        'appointment_date': '2024-02-15T14:30:00',
        'duration': 30,
        'status': 'scheduled',
        'appointment_type': 'consultation',
        'notes': 'Consulta de rotina'
    }
    
    try:
        # Verificar disponibilidade do médico
        appointment_date = datetime.now().date()
        appointment_time = datetime.now().time().replace(hour=14, minute=0, second=0, microsecond=0)
        is_available = appointment_repo.check_doctor_availability(
            doctor_id=doctor_id,
            appointment_date=appointment_date,
            appointment_time=appointment_time,
            duration_minutes=30
        )
        print(f"Médico disponível: {is_available}")
        
        if is_available:
            # Criar consulta
            new_appointment = appointment_repo.create_appointment(appointment_data)
            print(f"Consulta criada para {appointment_data['appointment_date']}")
            appointment_id = new_appointment['id']
            
            # Buscar consultas por data
            appointments_by_date = appointment_repo.get_by_date(
                appointment_date=datetime.now().date()
            )
            print(f"Consultas hoje: {len(appointments_by_date)}")
            
            # Atualizar status da consulta
            updated_appointment = appointment_repo.update_appointment_status(
                appointment_id, 'completed', 'Consulta realizada com sucesso'
            )
            print(f"Status atualizado: {updated_appointment['status']}")
            
            # Obter estatísticas
            start_date = date(2024, 2, 1)
            end_date = date(2024, 2, 29)
            stats = appointment_repo.get_appointment_statistics(
                clinic_id, start_date, end_date
            )
            print(f"Estatísticas do mês: {stats}")
        
    except Exception as e:
        print(f"Erro nas operações com consultas: {e}")

def example_advanced_queries(clinic_id: str):
    """Exemplo de consultas avançadas."""
    print("\n=== CONSULTAS AVANÇADAS ===")
    
    patient_repo = PatientRepository()
    appointment_repo = AppointmentRepository()
    
    try:
        # Buscar pacientes por faixa etária
        young_patients = patient_repo.get_patients_by_age_range(clinic_id, 18, 30)
        print(f"Pacientes entre 18-30 anos: {len(young_patients)}")
        
        # Buscar consultas por status
        scheduled_appointments = appointment_repo.get_appointments_by_status(
            clinic_id, 'scheduled'
        )
        print(f"Consultas agendadas: {len(scheduled_appointments)}")
        
        # Buscar agenda da clínica
        start_date = date(2024, 2, 1)
        end_date = date(2024, 2, 29)
        clinic_schedule = appointment_repo.get_clinic_schedule(
            clinic_id, start_date, end_date
        )
        print(f"Agenda do mês: {len(clinic_schedule)} consultas")
        
    except Exception as e:
        print(f"Erro nas consultas avançadas: {e}")

def main():
    """Função principal para demonstrar o uso dos repositórios."""
    print("Iniciando exemplo de uso dos repositórios Supabase...")
    
    try:
        # Operações com clínicas
        clinic_id = example_clinic_operations()
        if not clinic_id:
            print("Erro ao criar/obter clínica. Encerrando exemplo.")
            return
        
        # Operações com pacientes
        patient_id = example_patient_operations(clinic_id)
        if not patient_id:
            print("Erro ao criar/obter paciente. Continuando com outras operações.")
        
        # Operações com consultas (se temos paciente)
        if patient_id:
            example_appointment_operations(clinic_id, patient_id)
        
        # Consultas avançadas
        example_advanced_queries(clinic_id)
        
        print("\n=== EXEMPLO CONCLUÍDO COM SUCESSO ===")
        
    except Exception as e:
        print(f"Erro geral no exemplo: {e}")

if __name__ == "__main__":
    main()