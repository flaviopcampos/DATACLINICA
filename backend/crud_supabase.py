from typing import List, Optional, Dict, Any
from datetime import datetime, date
from passlib.context import CryptContext
from supabase import Client

import schemas
from encryption import field_encryption

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class SupabaseCRUD:
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verificar senha usando bcrypt"""
        return pwd_context.verify(plain_password, hashed_password)
    
    def get_password_hash(self, password: str) -> str:
        """Gerar hash da senha usando bcrypt"""
        return pwd_context.hash(password)
    
    # Clinic CRUD
    def get_clinic(self, clinic_id: int) -> Optional[Dict[str, Any]]:
        """Buscar clínica por ID"""
        try:
            response = self.supabase.table('clinics').select('*').eq('id', clinic_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Erro ao buscar clínica: {e}")
            return None
    
    # Medical Document CRUD
    def get_medical_document(self, document_id: int, clinic_id: int) -> Optional[Dict[str, Any]]:
        """Buscar documento médico por ID (com isolamento por clínica)"""
        try:
            response = self.supabase.table('medical_documents').select('*').eq('id', document_id).eq('clinic_id', clinic_id).execute()
            if response.data:
                # Descriptografar campos sensíveis
                return field_encryption.decrypt_model_data(response.data[0], 'MedicalDocument')
            return None
        except Exception as e:
            print(f"Erro ao buscar documento médico: {e}")
            return None
    
    def get_medical_documents_by_patient(self, patient_id: int, clinic_id: int) -> List[Dict[str, Any]]:
        """Buscar documentos médicos por paciente (com isolamento por clínica)"""
        try:
            response = self.supabase.table('medical_documents').select('*').eq('patient_id', patient_id).eq('clinic_id', clinic_id).execute()
            # Descriptografar campos sensíveis
            return [field_encryption.decrypt_model_data(item, 'MedicalDocument') for item in response.data]
        except Exception as e:
            print(f"Erro ao buscar documentos médicos do paciente: {e}")
            return []
    
    def create_medical_document(self, document: schemas.MedicalDocumentCreate) -> Optional[Dict[str, Any]]:
        """Criar novo documento médico"""
        try:
            document_data = document.dict()
            document_data['created_at'] = datetime.utcnow().isoformat()
            document_data['updated_at'] = datetime.utcnow().isoformat()
            
            # Aplicar criptografia automática nos campos sensíveis
            document_data = field_encryption.encrypt_model_data(document_data, 'MedicalDocument')
            
            response = self.supabase.table('medical_documents').insert(document_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Erro ao criar documento médico: {e}")
            return None
    
    def update_medical_document(self, document_id: int, document: schemas.MedicalDocumentUpdate, clinic_id: int) -> Optional[Dict[str, Any]]:
        """Atualizar documento médico (com isolamento por clínica)"""
        try:
            update_data = document.dict(exclude_unset=True)
            update_data['updated_at'] = datetime.utcnow().isoformat()
            
            # Aplicar criptografia automática nos campos sensíveis
            update_data = field_encryption.encrypt_model_data(update_data, 'MedicalDocument')
            
            response = self.supabase.table('medical_documents').update(update_data).eq('id', document_id).eq('clinic_id', clinic_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Erro ao atualizar documento médico: {e}")
            return None
    
    # Prescription CRUD
    def get_prescription(self, prescription_id: int, clinic_id: int) -> Optional[Dict[str, Any]]:
        """Buscar prescrição por ID (com isolamento por clínica)"""
        try:
            response = self.supabase.table('prescriptions').select('*').eq('id', prescription_id).eq('clinic_id', clinic_id).execute()
            if response.data:
                # Descriptografar campos sensíveis
                return field_encryption.decrypt_model_data(response.data[0], 'Prescription')
            return None
        except Exception as e:
            print(f"Erro ao buscar prescrição: {e}")
            return None
    
    def get_prescriptions_by_patient(self, patient_id: int, clinic_id: int) -> List[Dict[str, Any]]:
        """Buscar prescrições por paciente (com isolamento por clínica)"""
        try:
            response = self.supabase.table('prescriptions').select('*').eq('patient_id', patient_id).eq('clinic_id', clinic_id).execute()
            # Descriptografar campos sensíveis
            return [field_encryption.decrypt_model_data(item, 'Prescription') for item in response.data]
        except Exception as e:
            print(f"Erro ao buscar prescrições do paciente: {e}")
            return []
    
    def create_prescription(self, prescription: schemas.PrescriptionCreate) -> Optional[Dict[str, Any]]:
        """Criar nova prescrição"""
        try:
            prescription_data = prescription.dict()
            prescription_data['created_at'] = datetime.utcnow().isoformat()
            prescription_data['updated_at'] = datetime.utcnow().isoformat()
            
            # Aplicar criptografia automática nos campos sensíveis
            prescription_data = field_encryption.encrypt_model_data(prescription_data, 'Prescription')
            
            response = self.supabase.table('prescriptions').insert(prescription_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Erro ao criar prescrição: {e}")
            return None
    
    def update_prescription(self, prescription_id: int, prescription: schemas.PrescriptionUpdate, clinic_id: int) -> Optional[Dict[str, Any]]:
        """Atualizar prescrição (com isolamento por clínica)"""
        try:
            update_data = prescription.dict(exclude_unset=True)
            update_data['updated_at'] = datetime.utcnow().isoformat()
            
            # Aplicar criptografia automática nos campos sensíveis
            update_data = field_encryption.encrypt_model_data(update_data, 'Prescription')
            
            response = self.supabase.table('prescriptions').update(update_data).eq('id', prescription_id).eq('clinic_id', clinic_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Erro ao atualizar prescrição: {e}")
            return None
    
    # CID Diagnosis CRUD
    def search_cid_diagnosis(self, search_term: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Buscar diagnósticos CID por termo de busca"""
        try:
            # Buscar por código ou descrição
            response = self.supabase.table('cid_diagnosis').select('*').or_(
                f'code.ilike.%{search_term}%,description.ilike.%{search_term}%'
            ).limit(limit).execute()
            return response.data
        except Exception as e:
            print(f"Erro ao buscar diagnósticos CID: {e}")
            return []
    
    def get_cid_diagnosis_by_code(self, code: str) -> Optional[Dict[str, Any]]:
        """Buscar diagnóstico CID por código"""
        try:
            response = self.supabase.table('cid_diagnosis').select('*').eq('code', code).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Erro ao buscar diagnóstico CID por código: {e}")
            return None
    
    # Insurance Company CRUD
    def get_insurance_companies(self, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """Listar empresas de seguro"""
        try:
            response = self.supabase.table('insurance_companies').select('*').range(skip, skip + limit - 1).execute()
            return response.data
        except Exception as e:
            print(f"Erro ao listar empresas de seguro: {e}")
            return []
    
    def get_insurance_company(self, company_id: int) -> Optional[Dict[str, Any]]:
        """Buscar empresa de seguro por ID"""
        try:
            response = self.supabase.table('insurance_companies').select('*').eq('id', company_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Erro ao buscar empresa de seguro: {e}")
            return None
    
    def create_insurance_company(self, company: schemas.InsuranceCompanyCreate) -> Optional[Dict[str, Any]]:
        """Criar nova empresa de seguro"""
        try:
            company_data = company.dict()
            company_data['created_at'] = datetime.utcnow().isoformat()
            company_data['updated_at'] = datetime.utcnow().isoformat()
            
            response = self.supabase.table('insurance_companies').insert(company_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Erro ao criar empresa de seguro: {e}")
            return None
    
    def update_insurance_company(self, company_id: int, company: schemas.InsuranceCompanyUpdate) -> Optional[Dict[str, Any]]:
        """Atualizar empresa de seguro"""
        try:
            update_data = company.dict(exclude_unset=True)
            update_data['updated_at'] = datetime.utcnow().isoformat()
            
            response = self.supabase.table('insurance_companies').update(update_data).eq('id', company_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Erro ao atualizar empresa de seguro: {e}")
            return None
    
    def delete_insurance_company(self, company_id: int) -> bool:
        """Deletar empresa de seguro"""
        try:
            response = self.supabase.table('insurance_companies').delete().eq('id', company_id).execute()
            return len(response.data) > 0
        except Exception as e:
            print(f"Erro ao deletar empresa de seguro: {e}")
            return False

    def get_clinic_by_cnpj(self, cnpj: str) -> Optional[Dict[str, Any]]:
        """Buscar clínica por CNPJ"""
        try:
            response = self.supabase.table('clinics').select('*').eq('cnpj', cnpj).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Erro ao buscar clínica por CNPJ: {e}")
            return None
    
    def get_clinics(self, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """Listar clínicas com paginação"""
        try:
            response = self.supabase.table('clinics').select('*').range(skip, skip + limit - 1).execute()
            return response.data
        except Exception as e:
            print(f"Erro ao listar clínicas: {e}")
            return []


    # Financial Transaction CRUD
    def get_financial_transaction(self, transaction_id: int, clinic_id: int) -> Optional[Dict[str, Any]]:
        """Buscar transação financeira por ID (com isolamento por clínica)"""
        try:
            response = self.supabase.table('financial_transactions').select('*').eq('id', transaction_id).eq('clinic_id', clinic_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Erro ao buscar transação financeira: {e}")
            return None
    
    def get_financial_transactions(self, clinic_id: int, skip: int = 0, limit: int = 100, 
                                  transaction_type: Optional[str] = None, 
                                  start_date: Optional[str] = None, 
                                  end_date: Optional[str] = None) -> List[Dict[str, Any]]:
        """Listar transações financeiras com filtros (com isolamento por clínica)"""
        try:
            query = self.supabase.table('financial_transactions').select('*').eq('clinic_id', clinic_id)
            
            if transaction_type:
                query = query.eq('transaction_type', transaction_type)
            if start_date:
                query = query.gte('transaction_date', start_date)
            if end_date:
                query = query.lte('transaction_date', end_date)
            
            response = query.order('transaction_date', desc=True).range(skip, skip + limit - 1).execute()
            return response.data
        except Exception as e:
            print(f"Erro ao listar transações financeiras: {e}")
            return []
    
    def create_financial_transaction(self, transaction: schemas.FinancialTransactionCreate) -> Optional[Dict[str, Any]]:
        """Criar nova transação financeira"""
        try:
            transaction_data = transaction.dict()
            transaction_data['created_at'] = datetime.utcnow().isoformat()
            transaction_data['updated_at'] = datetime.utcnow().isoformat()
            
            # Aplicar criptografia automática nos campos sensíveis
            transaction_data = field_encryption.encrypt_model_data(transaction_data, 'FinancialTransaction')
            
            response = self.supabase.table('financial_transactions').insert(transaction_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Erro ao criar transação financeira: {e}")
            return None
    
    def update_financial_transaction(self, transaction_id: int, transaction: schemas.FinancialTransactionUpdate, clinic_id: int) -> Optional[Dict[str, Any]]:
        """Atualizar transação financeira (com isolamento por clínica)"""
        try:
            update_data = transaction.dict(exclude_unset=True)
            update_data['updated_at'] = datetime.utcnow().isoformat()
            
            # Aplicar criptografia automática nos campos sensíveis
            update_data = field_encryption.encrypt_model_data(update_data, 'FinancialTransaction')
            
            response = self.supabase.table('financial_transactions').update(update_data).eq('id', transaction_id).eq('clinic_id', clinic_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Erro ao atualizar transação financeira: {e}")
            return None
    
    def delete_financial_transaction(self, transaction_id: int, clinic_id: int) -> bool:
        """Deletar transação financeira (com isolamento por clínica)"""
        try:
            response = self.supabase.table('financial_transactions').delete().eq('id', transaction_id).eq('clinic_id', clinic_id).execute()
            return len(response.data) > 0
        except Exception as e:
            print(f"Erro ao deletar transação financeira: {e}")
            return False
    
    # Anamnesis CRUD
    def get_anamnesis(self, anamnesis_id: int, clinic_id: int) -> Optional[Dict[str, Any]]:
        """Buscar anamnese por ID (com isolamento por clínica)"""
        try:
            response = self.supabase.table('anamnesis').select('*').eq('id', anamnesis_id).eq('clinic_id', clinic_id).execute()
            if response.data:
                # Descriptografar campos sensíveis
                return field_encryption.decrypt_model_data(response.data[0], 'Anamnesis')
            return None
        except Exception as e:
            print(f"Erro ao buscar anamnese: {e}")
            return None
    
    def get_anamnesis_by_patient(self, patient_id: int, clinic_id: int) -> List[Dict[str, Any]]:
        """Buscar anamneses por paciente (com isolamento por clínica)"""
        try:
            response = self.supabase.table('anamnesis').select('*').eq('patient_id', patient_id).eq('clinic_id', clinic_id).execute()
            # Descriptografar campos sensíveis
            return [field_encryption.decrypt_model_data(item, 'Anamnesis') for item in response.data]
        except Exception as e:
            print(f"Erro ao buscar anamneses do paciente: {e}")
            return []
    
    def create_anamnesis(self, anamnesis: schemas.AnamnesisCreate) -> Optional[Dict[str, Any]]:
        """Criar nova anamnese"""
        try:
            anamnesis_data = anamnesis.dict()
            anamnesis_data['created_at'] = datetime.utcnow().isoformat()
            anamnesis_data['updated_at'] = datetime.utcnow().isoformat()
            
            # Aplicar criptografia automática nos campos sensíveis
            anamnesis_data = field_encryption.encrypt_model_data(anamnesis_data, 'Anamnesis')
            
            response = self.supabase.table('anamnesis').insert(anamnesis_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Erro ao criar anamnese: {e}")
            return None
    
    def update_anamnesis(self, anamnesis_id: int, anamnesis: schemas.AnamnesisUpdate, clinic_id: int) -> Optional[Dict[str, Any]]:
        """Atualizar anamnese (com isolamento por clínica)"""
        try:
            update_data = anamnesis.dict(exclude_unset=True)
            update_data['updated_at'] = datetime.utcnow().isoformat()
            
            # Aplicar criptografia automática nos campos sensíveis
            update_data = field_encryption.encrypt_model_data(update_data, 'Anamnesis')
            
            response = self.supabase.table('anamnesis').update(update_data).eq('id', anamnesis_id).eq('clinic_id', clinic_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Erro ao atualizar anamnese: {e}")
            return None
    
    # Physical Exam CRUD
    def get_physical_exam(self, exam_id: int, clinic_id: int) -> Optional[Dict[str, Any]]:
        """Buscar exame físico por ID (com isolamento por clínica)"""
        try:
            response = self.supabase.table('physical_exams').select('*').eq('id', exam_id).eq('clinic_id', clinic_id).execute()
            if response.data:
                # Descriptografar campos sensíveis
                return field_encryption.decrypt_model_data(response.data[0], 'PhysicalExam')
            return None
        except Exception as e:
            print(f"Erro ao buscar exame físico: {e}")
            return None
    
    def get_physical_exams_by_patient(self, patient_id: int, clinic_id: int) -> List[Dict[str, Any]]:
        """Buscar exames físicos por paciente (com isolamento por clínica)"""
        try:
            response = self.supabase.table('physical_exams').select('*').eq('patient_id', patient_id).eq('clinic_id', clinic_id).execute()
            # Descriptografar campos sensíveis
            return [field_encryption.decrypt_model_data(item, 'PhysicalExam') for item in response.data]
        except Exception as e:
            print(f"Erro ao buscar exames físicos do paciente: {e}")
            return []
    
    def create_physical_exam(self, exam: schemas.PhysicalExamCreate) -> Optional[Dict[str, Any]]:
        """Criar novo exame físico"""
        try:
            exam_data = exam.dict()
            exam_data['created_at'] = datetime.utcnow().isoformat()
            exam_data['updated_at'] = datetime.utcnow().isoformat()
            
            # Aplicar criptografia automática nos campos sensíveis
            exam_data = field_encryption.encrypt_model_data(exam_data, 'PhysicalExam')
            
            response = self.supabase.table('physical_exams').insert(exam_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Erro ao criar exame físico: {e}")
            return None
    
    def update_physical_exam(self, exam_id: int, exam: schemas.PhysicalExamUpdate, clinic_id: int) -> Optional[Dict[str, Any]]:
        """Atualizar exame físico (com isolamento por clínica)"""
        try:
            update_data = exam.dict(exclude_unset=True)
            update_data['updated_at'] = datetime.utcnow().isoformat()
            
            # Aplicar criptografia automática nos campos sensíveis
            update_data = field_encryption.encrypt_model_data(update_data, 'PhysicalExam')
            
            response = self.supabase.table('physical_exams').update(update_data).eq('id', exam_id).eq('clinic_id', clinic_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Erro ao atualizar exame físico: {e}")
            return None
    
    def create_clinic(self, clinic: schemas.ClinicCreate) -> Optional[Dict[str, Any]]:
        """Criar nova clínica"""
        try:
            clinic_data = clinic.dict()
            clinic_data['created_at'] = datetime.utcnow().isoformat()
            clinic_data['updated_at'] = datetime.utcnow().isoformat()
            
            response = self.supabase.table('clinics').insert(clinic_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Erro ao criar clínica: {e}")
            return None
    
    def update_clinic(self, clinic_id: int, clinic: schemas.ClinicUpdate) -> Optional[Dict[str, Any]]:
        """Atualizar clínica"""
        try:
            update_data = clinic.dict(exclude_unset=True)
            update_data['updated_at'] = datetime.utcnow().isoformat()
            
            response = self.supabase.table('clinics').update(update_data).eq('id', clinic_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Erro ao atualizar clínica: {e}")
            return None
    
    def delete_clinic(self, clinic_id: int) -> bool:
        """Deletar clínica"""
        try:
            response = self.supabase.table('clinics').delete().eq('id', clinic_id).execute()
            return len(response.data) > 0
        except Exception as e:
            print(f"Erro ao deletar clínica: {e}")
            return False
    
    # Medical Record CRUD
    def get_medical_record(self, record_id: int, clinic_id: int) -> Optional[Dict[str, Any]]:
        """Buscar prontuário por ID (com isolamento por clínica)"""
        try:
            response = self.supabase.table('medical_records').select('*').eq('id', record_id).eq('clinic_id', clinic_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Erro ao buscar prontuário: {e}")
            return None
    
    def get_medical_records(self, clinic_id: int, skip: int = 0, limit: int = 100, 
                           patient_id: Optional[int] = None, doctor_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """Listar prontuários com filtros (com isolamento por clínica)"""
        try:
            query = self.supabase.table('medical_records').select('*').eq('clinic_id', clinic_id)
            
            if patient_id:
                query = query.eq('patient_id', patient_id)
            if doctor_id:
                query = query.eq('doctor_id', doctor_id)
            
            response = query.range(skip, skip + limit - 1).execute()
            return response.data
        except Exception as e:
            print(f"Erro ao listar prontuários: {e}")
            return []
    
    def create_medical_record(self, record: schemas.MedicalRecordCreate) -> Optional[Dict[str, Any]]:
        """Criar novo prontuário"""
        try:
            record_data = record.dict()
            record_data['created_at'] = datetime.utcnow().isoformat()
            record_data['updated_at'] = datetime.utcnow().isoformat()
            
            # Aplicar criptografia automática nos campos sensíveis
            record_data = field_encryption.encrypt_model_data(record_data, 'MedicalRecord')
            
            response = self.supabase.table('medical_records').insert(record_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Erro ao criar prontuário: {e}")
            return None
    
    def update_medical_record(self, record_id: int, record: schemas.MedicalRecordUpdate, clinic_id: int) -> Optional[Dict[str, Any]]:
        """Atualizar prontuário (com isolamento por clínica)"""
        try:
            update_data = record.dict(exclude_unset=True)
            update_data['updated_at'] = datetime.utcnow().isoformat()
            
            # Aplicar criptografia automática nos campos sensíveis
            update_data = field_encryption.encrypt_model_data(update_data, 'MedicalRecord')
            
            response = self.supabase.table('medical_records').update(update_data).eq('id', record_id).eq('clinic_id', clinic_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Erro ao atualizar prontuário: {e}")
            return None
    
    def delete_medical_record(self, record_id: int, clinic_id: int) -> bool:
        """Deletar prontuário (com isolamento por clínica)"""
        try:
            response = self.supabase.table('medical_records').delete().eq('id', record_id).eq('clinic_id', clinic_id).execute()
            return len(response.data) > 0
        except Exception as e:
            print(f"Erro ao deletar prontuário: {e}")
            return False
    
    # Medication CRUD
    def get_medication(self, medication_id: int, clinic_id: int) -> Optional[Dict[str, Any]]:
        """Buscar medicamento por ID (com isolamento por clínica)"""
        try:
            response = self.supabase.table('medications').select('*').eq('id', medication_id).eq('clinic_id', clinic_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Erro ao buscar medicamento: {e}")
            return None
    
    def get_medications(self, clinic_id: int, skip: int = 0, limit: int = 100, 
                      search: Optional[str] = None, low_stock: bool = False) -> List[Dict[str, Any]]:
        """Listar medicamentos com filtros (com isolamento por clínica)"""
        try:
            query = self.supabase.table('medications').select('*').eq('clinic_id', clinic_id)
            
            if search:
                # Buscar por nome do medicamento
                query = query.ilike('name', f'%{search}%')
            
            if low_stock:
                # Supabase não suporta comparação entre colunas diretamente
                # Vamos buscar todos e filtrar no Python por enquanto
                pass
            
            response = query.range(skip, skip + limit - 1).execute()
            
            # Filtrar estoque baixo se necessário
            if low_stock and response.data:
                response.data = [med for med in response.data 
                               if med.get('quantity_in_stock', 0) <= med.get('minimum_stock', 0)]
            
            return response.data
        except Exception as e:
            print(f"Erro ao listar medicamentos: {e}")
            return []
    
    def create_medication(self, medication: schemas.MedicationCreate) -> Optional[Dict[str, Any]]:
        """Criar novo medicamento"""
        try:
            medication_data = medication.dict()
            medication_data['created_at'] = datetime.utcnow().isoformat()
            medication_data['updated_at'] = datetime.utcnow().isoformat()
            
            # Aplicar criptografia automática nos campos sensíveis
            medication_data = field_encryption.encrypt_model_data(medication_data, 'Medication')
            
            response = self.supabase.table('medications').insert(medication_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Erro ao criar medicamento: {e}")
            return None
    
    def update_medication(self, medication_id: int, medication: schemas.MedicationUpdate, clinic_id: int) -> Optional[Dict[str, Any]]:
        """Atualizar medicamento (com isolamento por clínica)"""
        try:
            update_data = medication.dict(exclude_unset=True)
            update_data['updated_at'] = datetime.utcnow().isoformat()
            
            # Aplicar criptografia automática nos campos sensíveis
            update_data = field_encryption.encrypt_model_data(update_data, 'Medication')
            
            response = self.supabase.table('medications').update(update_data).eq('id', medication_id).eq('clinic_id', clinic_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Erro ao atualizar medicamento: {e}")
            return None
    
    def delete_medication(self, medication_id: int, clinic_id: int) -> bool:
        """Deletar medicamento (com isolamento por clínica)"""
        try:
            response = self.supabase.table('medications').delete().eq('id', medication_id).eq('clinic_id', clinic_id).execute()
            return len(response.data) > 0
        except Exception as e:
            print(f"Erro ao deletar medicamento: {e}")
            return False
    
    # Stock Movement CRUD
    def create_stock_movement(self, movement: schemas.StockMovementCreate) -> Optional[Dict[str, Any]]:
        """Criar movimento de estoque e atualizar quantidade do medicamento"""
        try:
            # Primeiro, buscar o medicamento atual
            medication = self.get_medication(movement.medication_id, movement.clinic_id)
            if not medication:
                print(f"Medicamento {movement.medication_id} não encontrado")
                return None
            
            # Calcular nova quantidade
            current_stock = medication.get('quantity_in_stock', 0)
            if movement.movement_type == "entrada":
                new_stock = current_stock + movement.quantity
            elif movement.movement_type == "saida":
                new_stock = current_stock - movement.quantity
            elif movement.movement_type == "ajuste":
                new_stock = movement.quantity
            else:
                new_stock = current_stock
            
            # Criar movimento de estoque
            movement_data = movement.dict()
            movement_data['created_at'] = datetime.utcnow().isoformat()
            
            response = self.supabase.table('stock_movements').insert(movement_data).execute()
            
            if response.data:
                # Atualizar estoque do medicamento
                self.supabase.table('medications').update({
                    'quantity_in_stock': new_stock,
                    'updated_at': datetime.utcnow().isoformat()
                }).eq('id', movement.medication_id).execute()
            
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Erro ao criar movimento de estoque: {e}")
            return None
    
    def get_stock_movements(self, clinic_id: int, skip: int = 0, limit: int = 100, 
                           medication_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """Listar movimentos de estoque (com isolamento por clínica)"""
        try:
            query = self.supabase.table('stock_movements').select('*').eq('clinic_id', clinic_id)
            
            if medication_id:
                query = query.eq('medication_id', medication_id)
            
            response = query.order('created_at', desc=True).range(skip, skip + limit - 1).execute()
            return response.data
        except Exception as e:
            print(f"Erro ao listar movimentos de estoque: {e}")
            return []
    
    # Doctor CRUD
    def get_doctor(self, doctor_id: int, clinic_id: int) -> Optional[Dict[str, Any]]:
        """Buscar médico por ID (com isolamento por clínica)"""
        try:
            response = self.supabase.table('doctors').select('*').eq('id', doctor_id).eq('clinic_id', clinic_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Erro ao buscar médico: {e}")
            return None
    
    def get_doctor_by_crm(self, crm: str, clinic_id: int) -> Optional[Dict[str, Any]]:
        """Buscar médico por CRM (com isolamento por clínica)"""
        try:
            response = self.supabase.table('doctors').select('*').eq('crm', crm).eq('clinic_id', clinic_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Erro ao buscar médico por CRM: {e}")
            return None
    
    def get_doctors(self, clinic_id: int, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """Listar médicos com paginação (com isolamento por clínica)"""
        try:
            response = self.supabase.table('doctors').select('*').eq('clinic_id', clinic_id).range(skip, skip + limit - 1).execute()
            return response.data
        except Exception as e:
            print(f"Erro ao listar médicos: {e}")
            return []
    
    def create_doctor(self, doctor: schemas.DoctorCreate) -> Optional[Dict[str, Any]]:
        """Criar novo médico"""
        try:
            doctor_data = doctor.dict()
            doctor_data['created_at'] = datetime.utcnow().isoformat()
            doctor_data['updated_at'] = datetime.utcnow().isoformat()
            
            # Aplicar criptografia automática nos campos sensíveis
            doctor_data = field_encryption.encrypt_model_data(doctor_data, 'Doctor')
            
            response = self.supabase.table('doctors').insert(doctor_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Erro ao criar médico: {e}")
            return None
    
    def update_doctor(self, doctor_id: int, doctor: schemas.DoctorUpdate, clinic_id: int) -> Optional[Dict[str, Any]]:
        """Atualizar médico (com isolamento por clínica)"""
        try:
            update_data = doctor.dict(exclude_unset=True)
            update_data['updated_at'] = datetime.utcnow().isoformat()
            
            # Aplicar criptografia automática nos campos sensíveis
            update_data = field_encryption.encrypt_model_data(update_data, 'Doctor')
            
            response = self.supabase.table('doctors').update(update_data).eq('id', doctor_id).eq('clinic_id', clinic_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Erro ao atualizar médico: {e}")
            return None
    
    def delete_doctor(self, doctor_id: int, clinic_id: int) -> bool:
        """Deletar médico (com isolamento por clínica)"""
        try:
            response = self.supabase.table('doctors').delete().eq('id', doctor_id).eq('clinic_id', clinic_id).execute()
            return len(response.data) > 0
        except Exception as e:
            print(f"Erro ao deletar médico: {e}")
            return False
    
    # Appointment CRUD
    def get_appointment(self, appointment_id: int, clinic_id: int) -> Optional[Dict[str, Any]]:
        """Buscar consulta por ID (com isolamento por clínica)"""
        try:
            response = self.supabase.table('appointments').select('*').eq('id', appointment_id).eq('clinic_id', clinic_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Erro ao buscar consulta: {e}")
            return None
    
    def get_appointments(self, clinic_id: int, skip: int = 0, limit: int = 100, 
                        patient_id: Optional[int] = None, doctor_id: Optional[int] = None, 
                        date_from: Optional[date] = None, date_to: Optional[date] = None) -> List[Dict[str, Any]]:
        """Listar consultas com filtros (com isolamento por clínica)"""
        try:
            query = self.supabase.table('appointments').select('*').eq('clinic_id', clinic_id)
            
            if patient_id:
                query = query.eq('patient_id', patient_id)
            if doctor_id:
                query = query.eq('doctor_id', doctor_id)
            if date_from:
                query = query.gte('appointment_date', date_from.isoformat())
            if date_to:
                query = query.lte('appointment_date', date_to.isoformat())
            
            response = query.range(skip, skip + limit - 1).execute()
            return response.data
        except Exception as e:
            print(f"Erro ao listar consultas: {e}")
            return []
    
    def create_appointment(self, appointment: schemas.AppointmentCreate) -> Optional[Dict[str, Any]]:
        """Criar nova consulta"""
        try:
            appointment_data = appointment.dict()
            appointment_data['created_at'] = datetime.utcnow().isoformat()
            appointment_data['updated_at'] = datetime.utcnow().isoformat()
            
            # Aplicar criptografia automática nos campos sensíveis
            appointment_data = field_encryption.encrypt_model_data(appointment_data, 'Appointment')
            
            response = self.supabase.table('appointments').insert(appointment_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Erro ao criar consulta: {e}")
            return None
    
    def update_appointment(self, appointment_id: int, appointment: schemas.AppointmentUpdate, clinic_id: int) -> Optional[Dict[str, Any]]:
        """Atualizar consulta (com isolamento por clínica)"""
        try:
            update_data = appointment.dict(exclude_unset=True)
            update_data['updated_at'] = datetime.utcnow().isoformat()
            
            # Aplicar criptografia automática nos campos sensíveis
            update_data = field_encryption.encrypt_model_data(update_data, 'Appointment')
            
            response = self.supabase.table('appointments').update(update_data).eq('id', appointment_id).eq('clinic_id', clinic_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Erro ao atualizar consulta: {e}")
            return None
    
    def delete_appointment(self, appointment_id: int, clinic_id: int) -> bool:
        """Deletar consulta (com isolamento por clínica)"""
        try:
            response = self.supabase.table('appointments').delete().eq('id', appointment_id).eq('clinic_id', clinic_id).execute()
            return len(response.data) > 0
        except Exception as e:
            print(f"Erro ao deletar consulta: {e}")
            return False
    
    # User CRUD
    def get_user(self, user_id: int) -> Optional[Dict[str, Any]]:
        """Buscar usuário por ID"""
        try:
            response = self.supabase.table('users').select('*').eq('id', user_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Erro ao buscar usuário: {e}")
            return None
    
    def get_user_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        """Buscar usuário por username"""
        try:
            response = self.supabase.table('users').select('*').eq('username', username).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Erro ao buscar usuário por username: {e}")
            return None
    
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Buscar usuário por email"""
        try:
            response = self.supabase.table('users').select('*').eq('email', email).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Erro ao buscar usuário por email: {e}")
            return None
    
    def get_users(self, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """Listar usuários com paginação"""
        try:
            response = self.supabase.table('users').select('*').range(skip, skip + limit - 1).execute()
            return response.data
        except Exception as e:
            print(f"Erro ao listar usuários: {e}")
            return []
    
    def create_user(self, user: schemas.UserCreate) -> Optional[Dict[str, Any]]:
        """Criar novo usuário"""
        try:
            hashed_password = self.get_password_hash(user.password)
            user_data = {
                'username': user.username,
                'email': user.email,
                'hashed_password': hashed_password,
                'full_name': user.full_name,
                'role': user.role,
                'is_active': user.is_active,
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }
            
            # Aplicar criptografia automática nos campos sensíveis
            user_data = field_encryption.encrypt_model_data(user_data, 'User')
            
            response = self.supabase.table('users').insert(user_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Erro ao criar usuário: {e}")
            return None
    
    def update_user(self, user_id: int, user: schemas.UserUpdate) -> Optional[Dict[str, Any]]:
        """Atualizar usuário"""
        try:
            update_data = user.dict(exclude_unset=True)
            update_data['updated_at'] = datetime.utcnow().isoformat()
            
            # Aplicar criptografia automática nos campos sensíveis
            update_data = field_encryption.encrypt_model_data(update_data, 'User')
            
            response = self.supabase.table('users').update(update_data).eq('id', user_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Erro ao atualizar usuário: {e}")
            return None
    
    def delete_user(self, user_id: int) -> bool:
        """Deletar usuário"""
        try:
            response = self.supabase.table('users').delete().eq('id', user_id).execute()
            return len(response.data) > 0
        except Exception as e:
            print(f"Erro ao deletar usuário: {e}")
            return False
    
    # Patient CRUD
    def get_patient(self, patient_id: int, clinic_id: int) -> Optional[Dict[str, Any]]:
        """Buscar paciente por ID (com isolamento por clínica)"""
        try:
            response = self.supabase.table('patients').select('*').eq('id', patient_id).eq('clinic_id', clinic_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Erro ao buscar paciente: {e}")
            return None
    
    def get_patient_by_cpf(self, cpf: str, clinic_id: int) -> Optional[Dict[str, Any]]:
        """Buscar paciente por CPF (com isolamento por clínica)"""
        try:
            response = self.supabase.table('patients').select('*').eq('cpf', cpf).eq('clinic_id', clinic_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Erro ao buscar paciente por CPF: {e}")
            return None
    
    def get_patients(self, clinic_id: int, skip: int = 0, limit: int = 100, search: Optional[str] = None) -> List[Dict[str, Any]]:
        """Listar pacientes com paginação e busca (com isolamento por clínica)"""
        try:
            query = self.supabase.table('patients').select('*').eq('clinic_id', clinic_id)
            
            if search:
                # Supabase não suporta OR diretamente, então fazemos múltiplas consultas
                # Por simplicidade, vamos buscar apenas por nome
                query = query.ilike('name', f'%{search}%')
            
            response = query.range(skip, skip + limit - 1).execute()
            return response.data
        except Exception as e:
            print(f"Erro ao listar pacientes: {e}")
            return []
    
    def create_patient(self, patient: schemas.PatientCreate) -> Optional[Dict[str, Any]]:
        """Criar novo paciente"""
        try:
            patient_data = patient.dict()
            patient_data['created_at'] = datetime.utcnow().isoformat()
            patient_data['updated_at'] = datetime.utcnow().isoformat()
            
            # Aplicar criptografia automática nos campos sensíveis
            patient_data = field_encryption.encrypt_model_data(patient_data, 'Patient')
            
            response = self.supabase.table('patients').insert(patient_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Erro ao criar paciente: {e}")
            return None
    
    def update_patient(self, patient_id: int, patient: schemas.PatientUpdate, clinic_id: int) -> Optional[Dict[str, Any]]:
        """Atualizar paciente (com isolamento por clínica)"""
        try:
            update_data = patient.dict(exclude_unset=True)
            update_data['updated_at'] = datetime.utcnow().isoformat()
            
            # Aplicar criptografia automática nos campos sensíveis
            update_data = field_encryption.encrypt_model_data(update_data, 'Patient')
            
            response = self.supabase.table('patients').update(update_data).eq('id', patient_id).eq('clinic_id', clinic_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Erro ao atualizar paciente: {e}")
            return None
    
    def delete_patient(self, patient_id: int, clinic_id: int) -> bool:
        """Deletar paciente (com isolamento por clínica)"""
        try:
            response = self.supabase.table('patients').delete().eq('id', patient_id).eq('clinic_id', clinic_id).execute()
            return len(response.data) > 0
        except Exception as e:
            print(f"Erro ao deletar paciente: {e}")
            return False


# Instância global do CRUD Supabase
from database_supabase import get_supabase
crud_supabase = SupabaseCRUD(get_supabase())