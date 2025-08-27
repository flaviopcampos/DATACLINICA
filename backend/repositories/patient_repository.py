"""Repositório para operações com Pacientes no Supabase."""

from typing import List, Optional, Dict, Any
from datetime import datetime, date
from ..database_supabase import SupabaseRepository, get_supabase_connection

class PatientRepository(SupabaseRepository):
    """Repositório para gerenciar pacientes."""
    
    def __init__(self):
        super().__init__('patients', get_supabase_connection())
    
    def create_patient(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """Cria um novo paciente.
        
        Args:
            patient_data: Dados do paciente
        
        Returns:
            Paciente criado
        """
        # Adicionar timestamps
        patient_data['created_at'] = datetime.utcnow().isoformat()
        patient_data['updated_at'] = datetime.utcnow().isoformat()
        
        return self.create(patient_data)
    
    def get_patient_by_cpf(self, cpf: str, clinic_id: str) -> Optional[Dict[str, Any]]:
        """Busca paciente por CPF dentro de uma clínica.
        
        Args:
            cpf: CPF do paciente
            clinic_id: ID da clínica
        
        Returns:
            Paciente encontrado ou None
        """
        try:
            result = self.client.table(self.table_name).select('*').eq('cpf', cpf).eq('clinic_id', clinic_id).execute()
            if result.data:
                return result.data[0]
            return None
        except Exception as e:
            print(f"Erro ao buscar paciente por CPF: {e}")
            raise
    
    def get_by_clinic(self, clinic_id: str, page: int = 1, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Busca pacientes por clínica com paginação
        
        Args:
            clinic_id: ID da clínica
            page: Página (começando em 1)
            limit: Limite de registros por página
            
        Returns:
            Lista de pacientes
        """
        try:
            offset = (page - 1) * limit
            result = self.client.table(self.table_name).select('*').eq('clinic_id', clinic_id).range(offset, offset + limit - 1).execute()
            return result.data or []
        except Exception as e:
            print(f"Erro ao buscar pacientes da clínica: {e}")
            raise
    
    def search_patients(self, clinic_id: str, search_term: str) -> List[Dict[str, Any]]:
        """Busca pacientes por nome ou CPF.
        
        Args:
            clinic_id: ID da clínica
            search_term: Termo de busca
        
        Returns:
            Lista de pacientes encontrados
        """
        try:
            # Buscar por nome (case insensitive)
            name_result = self.client.table(self.table_name).select('*').eq('clinic_id', clinic_id).ilike('full_name', f'%{search_term}%').execute()
            
            # Buscar por CPF
            cpf_result = self.client.table(self.table_name).select('*').eq('clinic_id', clinic_id).ilike('cpf', f'%{search_term}%').execute()
            
            # Combinar resultados e remover duplicatas
            patients = name_result.data + cpf_result.data
            unique_patients = {p['id']: p for p in patients}.values()
            
            return list(unique_patients)
        except Exception as e:
            print(f"Erro ao buscar pacientes: {e}")
            raise
    
    def get_patient_with_documents(self, patient_id: str) -> Optional[Dict[str, Any]]:
        """Busca paciente com seus documentos.
        
        Args:
            patient_id: ID do paciente
        
        Returns:
            Paciente com documentos ou None
        """
        try:
            # Buscar paciente
            patient = self.get_by_id(patient_id)
            if not patient:
                return None
            
            # Buscar documentos do paciente
            documents_result = self.client.table('patient_documents').select('*').eq('patient_id', patient_id).execute()
            patient['documents'] = documents_result.data or []
            
            return patient
        except Exception as e:
            print(f"Erro ao buscar paciente com documentos: {e}")
            raise
    
    def get_patient_appointments(self, patient_id: str, start_date: Optional[date] = None, end_date: Optional[date] = None) -> List[Dict[str, Any]]:
        """Busca consultas de um paciente.
        
        Args:
            patient_id: ID do paciente
            start_date: Data inicial (opcional)
            end_date: Data final (opcional)
        
        Returns:
            Lista de consultas
        """
        try:
            query = self.client.table('appointments').select('*, doctors(full_name, specialty)').eq('patient_id', patient_id)
            
            if start_date:
                query = query.gte('appointment_date', start_date.isoformat())
            if end_date:
                query = query.lte('appointment_date', end_date.isoformat())
            
            result = query.order('appointment_date', desc=True).execute()
            return result.data or []
        except Exception as e:
            print(f"Erro ao buscar consultas do paciente: {e}")
            raise
    
    def get_patient_medical_records(self, patient_id: str) -> List[Dict[str, Any]]:
        """Busca prontuários de um paciente.
        
        Args:
            patient_id: ID do paciente
        
        Returns:
            Lista de prontuários
        """
        try:
            result = self.client.table('medical_records').select('*, doctors(full_name, specialty)').eq('patient_id', patient_id).order('created_at', desc=True).execute()
            return result.data or []
        except Exception as e:
            print(f"Erro ao buscar prontuários do paciente: {e}")
            raise
    
    def update_patient(self, patient_id: str, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """Atualiza um paciente.
        
        Args:
            patient_id: ID do paciente
            patient_data: Dados a serem atualizados
        
        Returns:
            Paciente atualizado
        """
        # Adicionar timestamp de atualização
        patient_data['updated_at'] = datetime.utcnow().isoformat()
        
        return self.update(patient_id, patient_data)
    
    def get_patients_by_age_range(self, clinic_id: str, min_age: int, max_age: int) -> List[Dict[str, Any]]:
        """Busca pacientes por faixa etária.
        
        Args:
            clinic_id: ID da clínica
            min_age: Idade mínima
            max_age: Idade máxima
        
        Returns:
            Lista de pacientes na faixa etária
        """
        try:
            # Calcular datas de nascimento
            current_year = datetime.now().year
            max_birth_year = current_year - min_age
            min_birth_year = current_year - max_age
            
            result = self.client.table(self.table_name).select('*').eq('clinic_id', clinic_id).gte('birth_date', f'{min_birth_year}-01-01').lte('birth_date', f'{max_birth_year}-12-31').execute()
            return result.data or []
        except Exception as e:
            print(f"Erro ao buscar pacientes por faixa etária: {e}")
            raise