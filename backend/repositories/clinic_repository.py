"""Repositório para operações com Clínicas no Supabase."""

from typing import List, Optional, Dict, Any
from datetime import datetime
from ..database_supabase import SupabaseRepository, get_supabase_connection

class ClinicRepository(SupabaseRepository):
    """Repositório para gerenciar clínicas."""
    
    def __init__(self):
        super().__init__('clinics', get_supabase_connection())
    
    def create_clinic(self, clinic_data: Dict[str, Any]) -> Dict[str, Any]:
        """Cria uma nova clínica.
        
        Args:
            clinic_data: Dados da clínica
        
        Returns:
            Clínica criada
        """
        # Adicionar timestamps
        clinic_data['created_at'] = datetime.utcnow().isoformat()
        clinic_data['updated_at'] = datetime.utcnow().isoformat()
        
        return self.create(clinic_data)
    
    def get_clinic_by_cnpj(self, cnpj: str) -> Optional[Dict[str, Any]]:
        """Busca clínica por CNPJ.
        
        Args:
            cnpj: CNPJ da clínica
        
        Returns:
            Clínica encontrada ou None
        """
        try:
            result = self.client.table(self.table_name).select('*').eq('cnpj', cnpj).execute()
            if result.data:
                return result.data[0]
            return None
        except Exception as e:
            print(f"Erro ao buscar clínica por CNPJ: {e}")
            raise
    
    def get_active_clinics(self) -> List[Dict[str, Any]]:
        """Busca todas as clínicas ativas.
        
        Returns:
            Lista de clínicas ativas
        """
        return self.get_all({'is_active': True})
    
    def update_clinic(self, clinic_id: str, clinic_data: Dict[str, Any]) -> Dict[str, Any]:
        """Atualiza uma clínica.
        
        Args:
            clinic_id: ID da clínica
            clinic_data: Dados a serem atualizados
        
        Returns:
            Clínica atualizada
        """
        # Adicionar timestamp de atualização
        clinic_data['updated_at'] = datetime.utcnow().isoformat()
        
        return self.update(clinic_id, clinic_data)
    
    def deactivate_clinic(self, clinic_id: str) -> Dict[str, Any]:
        """Desativa uma clínica.
        
        Args:
            clinic_id: ID da clínica
        
        Returns:
            Clínica desativada
        """
        return self.update_clinic(clinic_id, {'is_active': False})
    
    def get_clinic_stats(self, clinic_id: str) -> Dict[str, Any]:
        """Obtém estatísticas da clínica.
        
        Args:
            clinic_id: ID da clínica
        
        Returns:
            Estatísticas da clínica
        """
        try:
            # Contar usuários
            users_result = self.client.table('users').select('id', count='exact').eq('clinic_id', clinic_id).execute()
            users_count = users_result.count or 0
            
            # Contar pacientes
            patients_result = self.client.table('patients').select('id', count='exact').eq('clinic_id', clinic_id).execute()
            patients_count = patients_result.count or 0
            
            # Contar médicos
            doctors_result = self.client.table('doctors').select('id', count='exact').eq('clinic_id', clinic_id).execute()
            doctors_count = doctors_result.count or 0
            
            # Contar consultas do mês atual
            current_month = datetime.utcnow().strftime('%Y-%m')
            appointments_result = self.client.table('appointments').select('id', count='exact').eq('clinic_id', clinic_id).gte('appointment_date', f'{current_month}-01').execute()
            appointments_count = appointments_result.count or 0
            
            return {
                'users_count': users_count,
                'patients_count': patients_count,
                'doctors_count': doctors_count,
                'appointments_this_month': appointments_count
            }
        except Exception as e:
            print(f"Erro ao obter estatísticas da clínica: {e}")
            raise