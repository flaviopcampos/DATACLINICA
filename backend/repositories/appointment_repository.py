"""Repositório para operações com Consultas no Supabase."""

from typing import List, Optional, Dict, Any
from datetime import datetime, date, time, timedelta
from ..database_supabase import SupabaseRepository, get_supabase_connection

class AppointmentRepository(SupabaseRepository):
    """Repositório para gerenciar consultas."""
    
    def __init__(self):
        super().__init__('appointments', get_supabase_connection())
    
    def create_appointment(self, appointment_data: Dict[str, Any]) -> Dict[str, Any]:
        """Cria uma nova consulta.
        
        Args:
            appointment_data: Dados da consulta
        
        Returns:
            Consulta criada
        """
        # Adicionar timestamps
        appointment_data['created_at'] = datetime.utcnow().isoformat()
        appointment_data['updated_at'] = datetime.utcnow().isoformat()
        
        return self.create(appointment_data)
    
    def get_by_date(self, appointment_date: date) -> List[Dict]:
        """
        Buscar consultas por data
        """
        try:
            # Buscar consultas por data
            result = self.client.table('appointments')\
                .select('*, patients(full_name), doctors(crm, specialty)')\
                .gte('appointment_date', appointment_date.isoformat())\
                .lt('appointment_date', (appointment_date + timedelta(days=1)).isoformat())\
                .order('appointment_date')\
                .execute()
            return result.data or []
        except Exception as e:
            print(f"Erro ao buscar consultas por data: {e}")
            return []
    
    def get_doctor_appointments(self, doctor_id: str, start_date: date, end_date: date) -> List[Dict[str, Any]]:
        """Busca consultas de um médico em um período.
        
        Args:
            doctor_id: ID do médico
            start_date: Data inicial
            end_date: Data final
        
        Returns:
            Lista de consultas
        """
        try:
            result = self.client.table(self.table_name).select(
                '*, patients(full_name, cpf, phone)'
            ).eq('doctor_id', doctor_id).gte('appointment_date', start_date.isoformat()).lte('appointment_date', end_date.isoformat()).order('appointment_date', 'appointment_time').execute()
            return result.data or []
        except Exception as e:
            print(f"Erro ao buscar consultas do médico: {e}")
            raise
    
    def get_patient_appointments(self, patient_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Busca consultas de um paciente.
        
        Args:
            patient_id: ID do paciente
            limit: Limite de registros
        
        Returns:
            Lista de consultas
        """
        try:
            result = self.client.table(self.table_name).select(
                '*, doctors(crm, specialty)'
            ).eq('patient_id', patient_id).order('appointment_date', desc=True).limit(limit).execute()
            return result.data or []
        except Exception as e:
            print(f"Erro ao buscar consultas do paciente: {e}")
            raise
    
    def check_doctor_availability(self, doctor_id: str, appointment_date: date, appointment_time: time, duration_minutes: int = 30) -> bool:
        """Verifica disponibilidade do médico.
        
        Args:
            doctor_id: ID do médico
            appointment_date: Data da consulta
            appointment_time: Horário da consulta
            duration_minutes: Duração em minutos
        
        Returns:
            True se disponível, False caso contrário
        """
        try:
            # Calcular horário de fim
            end_time = (datetime.combine(appointment_date, appointment_time) + 
                       timedelta(minutes=duration_minutes)).time()
            
            # Verificar se há conflito de horário
            start_datetime = datetime.combine(appointment_date, appointment_time)
            end_datetime = start_datetime + timedelta(minutes=duration_minutes)
            
            result = self.client.table(self.table_name).select('id, appointment_date, duration').eq('doctor_id', doctor_id).gte('appointment_date', start_datetime.isoformat()).lt('appointment_date', end_datetime.isoformat()).neq('status', 'cancelled').execute()
            
            return len(result.data or []) == 0
        except Exception as e:
            print(f"Erro ao verificar disponibilidade: {e}")
            raise
    
    def get_appointments_by_status(self, clinic_id: str, status: str) -> List[Dict[str, Any]]:
        """Busca consultas por status.
        
        Args:
            clinic_id: ID da clínica
            status: Status da consulta
        
        Returns:
            Lista de consultas
        """
        try:
            result = self.client.table(self.table_name).select(
                '*, patients(full_name, cpf, phone), doctors(crm, specialty)'
            ).eq('clinic_id', clinic_id).eq('status', status).order('appointment_date').execute()
            return result.data or []
        except Exception as e:
            print(f"Erro ao buscar consultas por status: {e}")
            raise
    
    def update_appointment_status(self, appointment_id: str, status: str, notes: Optional[str] = None) -> Dict[str, Any]:
        """Atualiza status da consulta.
        
        Args:
            appointment_id: ID da consulta
            status: Novo status
            notes: Observações (opcional)
        
        Returns:
            Consulta atualizada
        """
        update_data = {
            'status': status,
            'updated_at': datetime.utcnow().isoformat()
        }
        
        if notes:
            update_data['notes'] = notes
        
        return self.update(appointment_id, update_data)
    
    def get_clinic_schedule(self, clinic_id: str, start_date: date, end_date: date) -> List[Dict[str, Any]]:
        """Busca agenda da clínica em um período.
        
        Args:
            clinic_id: ID da clínica
            start_date: Data inicial
            end_date: Data final
        
        Returns:
            Lista de consultas agendadas
        """
        try:
            result = self.client.table(self.table_name).select(
                '*, patients(full_name), doctors(crm, specialty)'
            ).eq('clinic_id', clinic_id).gte('appointment_date', start_date.isoformat()).lte('appointment_date', end_date.isoformat()).order('appointment_date').execute()
            return result.data or []
        except Exception as e:
            print(f"Erro ao buscar agenda da clínica: {e}")
            raise
    
    def get_appointment_statistics(self, clinic_id: str, start_date: date, end_date: date) -> Dict[str, Any]:
        """Obtém estatísticas de consultas.
        
        Args:
            clinic_id: ID da clínica
            start_date: Data inicial
            end_date: Data final
        
        Returns:
            Estatísticas das consultas
        """
        try:
            # Total de consultas
            total_result = self.client.table(self.table_name).select('id', count='exact').eq('clinic_id', clinic_id).gte('appointment_date', start_date.isoformat()).lte('appointment_date', end_date.isoformat()).execute()
            total_appointments = total_result.count or 0
            
            # Consultas realizadas
            completed_result = self.client.table(self.table_name).select('id', count='exact').eq('clinic_id', clinic_id).eq('status', 'completed').gte('appointment_date', start_date.isoformat()).lte('appointment_date', end_date.isoformat()).execute()
            completed_appointments = completed_result.count or 0
            
            # Consultas canceladas
            cancelled_result = self.client.table(self.table_name).select('id', count='exact').eq('clinic_id', clinic_id).eq('status', 'cancelled').gte('appointment_date', start_date.isoformat()).lte('appointment_date', end_date.isoformat()).execute()
            cancelled_appointments = cancelled_result.count or 0
            
            # Consultas agendadas
            scheduled_result = self.client.table(self.table_name).select('id', count='exact').eq('clinic_id', clinic_id).eq('status', 'scheduled').gte('appointment_date', start_date.isoformat()).lte('appointment_date', end_date.isoformat()).execute()
            scheduled_appointments = scheduled_result.count or 0
            
            return {
                'total_appointments': total_appointments,
                'completed_appointments': completed_appointments,
                'cancelled_appointments': cancelled_appointments,
                'scheduled_appointments': scheduled_appointments,
                'completion_rate': (completed_appointments / total_appointments * 100) if total_appointments > 0 else 0,
                'cancellation_rate': (cancelled_appointments / total_appointments * 100) if total_appointments > 0 else 0
            }
        except Exception as e:
            print(f"Erro ao obter estatísticas de consultas: {e}")
            raise
    
    def reschedule_appointment(self, appointment_id: str, new_date: date, new_time: time) -> Dict[str, Any]:
        """Reagenda uma consulta.
        
        Args:
            appointment_id: ID da consulta
            new_date: Nova data
            new_time: Novo horário
        
        Returns:
            Consulta reagendada
        """
        update_data = {
            'appointment_date': new_date.isoformat(),
            'appointment_time': new_time.isoformat(),
            'status': 'rescheduled',
            'updated_at': datetime.utcnow().isoformat()
        }
        
        return self.update(appointment_id, update_data)