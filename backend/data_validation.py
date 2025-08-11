#!/usr/bin/env python3
"""
DataClínica - Validação de Dados Sensíveis

Este módulo implementa validações específicas para dados médicos e pessoais
sensíveis, incluindo CPF, RG, CRM, dados de saúde e conformidade com LGPD.
"""

import re
import hashlib
from datetime import datetime, date
from typing import Dict, List, Optional, Union, Any
from pydantic import BaseModel, validator, Field
from enum import Enum

class DocumentType(str, Enum):
    """Tipos de documentos suportados"""
    CPF = "cpf"
    RG = "rg"
    CNS = "cns"  # Cartão Nacional de Saúde
    CRM = "crm"  # Conselho Regional de Medicina
    PASSPORT = "passport"
    DRIVER_LICENSE = "driver_license"

class DataSensitivityLevel(str, Enum):
    """Níveis de sensibilidade dos dados"""
    PUBLIC = "public"
    INTERNAL = "internal"
    CONFIDENTIAL = "confidential"
    RESTRICTED = "restricted"
    TOP_SECRET = "top_secret"

class ValidationError(Exception):
    """Exceção para erros de validação"""
    def __init__(self, field: str, message: str, code: str = None):
        self.field = field
        self.message = message
        self.code = code
        super().__init__(f"{field}: {message}")

class DataValidator:
    """Classe principal para validação de dados sensíveis"""
    
    @staticmethod
    def validate_cpf(cpf: str) -> bool:
        """Valida CPF brasileiro"""
        if not cpf:
            return False
        
        # Remover caracteres não numéricos
        cpf = re.sub(r'\D', '', cpf)
        
        # Verificar se tem 11 dígitos
        if len(cpf) != 11:
            return False
        
        # Verificar se todos os dígitos são iguais
        if cpf == cpf[0] * 11:
            return False
        
        # Calcular primeiro dígito verificador
        sum1 = sum(int(cpf[i]) * (10 - i) for i in range(9))
        digit1 = 11 - (sum1 % 11)
        if digit1 >= 10:
            digit1 = 0
        
        # Calcular segundo dígito verificador
        sum2 = sum(int(cpf[i]) * (11 - i) for i in range(10))
        digit2 = 11 - (sum2 % 11)
        if digit2 >= 10:
            digit2 = 0
        
        # Verificar dígitos
        return cpf[9] == str(digit1) and cpf[10] == str(digit2)
    
    @staticmethod
    def validate_cns(cns: str) -> bool:
        """Valida Cartão Nacional de Saúde"""
        if not cns:
            return False
        
        # Remover caracteres não numéricos
        cns = re.sub(r'\D', '', cns)
        
        # Verificar se tem 15 dígitos
        if len(cns) != 15:
            return False
        
        # Algoritmo de validação do CNS
        if cns.startswith(('1', '2')):
            # CNS definitivo
            pis = cns[:11]
            soma = sum(int(pis[i]) * (15 - i) for i in range(11))
            resto = soma % 11
            
            if resto < 2:
                dv = 0
            else:
                dv = 11 - resto
            
            return cns[11:] == f"{dv:04d}"
        
        elif cns.startswith(('7', '8', '9')):
            # CNS provisório
            soma = sum(int(cns[i]) * (15 - i) for i in range(15))
            return soma % 11 == 0
        
        return False
    
    @staticmethod
    def validate_crm(crm: str, state: str = None) -> bool:
        """Valida CRM (Conselho Regional de Medicina)"""
        if not crm:
            return False
        
        # Remover caracteres não numéricos
        crm_number = re.sub(r'\D', '', crm)
        
        # Verificar se tem entre 4 e 6 dígitos
        if not (4 <= len(crm_number) <= 6):
            return False
        
        # Se estado fornecido, validar formato completo
        if state:
            pattern = rf'^{crm_number}[-/\s]*{state.upper()}$'
            return bool(re.match(pattern, crm.upper()))
        
        return True
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """Valida endereço de e-mail"""
        if not email:
            return False
        
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
    
    @staticmethod
    def validate_phone(phone: str) -> bool:
        """Valida número de telefone brasileiro"""
        if not phone:
            return False
        
        # Remover caracteres não numéricos
        phone = re.sub(r'\D', '', phone)
        
        # Verificar se tem 10 ou 11 dígitos (com DDD)
        if len(phone) not in [10, 11]:
            return False
        
        # Verificar se DDD é válido (11-99)
        ddd = int(phone[:2])
        if not (11 <= ddd <= 99):
            return False
        
        # Para celular (11 dígitos), o terceiro dígito deve ser 9
        if len(phone) == 11 and phone[2] != '9':
            return False
        
        return True
    
    @staticmethod
    def validate_cep(cep: str) -> bool:
        """Valida CEP brasileiro"""
        if not cep:
            return False
        
        # Remover caracteres não numéricos
        cep = re.sub(r'\D', '', cep)
        
        # Verificar se tem 8 dígitos
        return len(cep) == 8 and cep.isdigit()
    
    @staticmethod
    def validate_date_of_birth(birth_date: Union[str, date, datetime]) -> bool:
        """Valida data de nascimento"""
        if not birth_date:
            return False
        
        try:
            if isinstance(birth_date, str):
                # Tentar diferentes formatos
                formats = ['%Y-%m-%d', '%d/%m/%Y', '%d-%m-%Y']
                parsed_date = None
                
                for fmt in formats:
                    try:
                        parsed_date = datetime.strptime(birth_date, fmt).date()
                        break
                    except ValueError:
                        continue
                
                if not parsed_date:
                    return False
                
                birth_date = parsed_date
            
            elif isinstance(birth_date, datetime):
                birth_date = birth_date.date()
            
            # Verificar se a data não é futura
            if birth_date > date.today():
                return False
            
            # Verificar se a pessoa não tem mais de 150 anos
            age = (date.today() - birth_date).days / 365.25
            if age > 150:
                return False
            
            return True
            
        except (ValueError, TypeError):
            return False
    
    @staticmethod
    def sanitize_input(value: str, max_length: int = None) -> str:
        """Sanitiza entrada de dados"""
        if not value:
            return ""
        
        # Remover caracteres de controle
        value = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', value)
        
        # Remover scripts potencialmente perigosos
        value = re.sub(r'<script[^>]*>.*?</script>', '', value, flags=re.IGNORECASE | re.DOTALL)
        value = re.sub(r'javascript:', '', value, flags=re.IGNORECASE)
        value = re.sub(r'on\w+\s*=', '', value, flags=re.IGNORECASE)
        
        # Limitar comprimento
        if max_length:
            value = value[:max_length]
        
        return value.strip()
    
    @staticmethod
    def classify_data_sensitivity(field_name: str, value: Any) -> DataSensitivityLevel:
        """Classifica o nível de sensibilidade dos dados"""
        field_lower = field_name.lower()
        
        # Dados altamente sensíveis
        if any(sensitive in field_lower for sensitive in [
            'cpf', 'rg', 'passport', 'ssn', 'tax_id',
            'medical_record', 'diagnosis', 'treatment',
            'prescription', 'mental_health', 'genetic',
            'biometric', 'password', 'token', 'key'
        ]):
            return DataSensitivityLevel.TOP_SECRET
        
        # Dados confidenciais
        if any(confidential in field_lower for confidential in [
            'phone', 'email', 'address', 'birth_date',
            'salary', 'income', 'bank_account', 'credit_card',
            'health_insurance', 'emergency_contact'
        ]):
            return DataSensitivityLevel.CONFIDENTIAL
        
        # Dados restritos
        if any(restricted in field_lower for restricted in [
            'name', 'surname', 'gender', 'marital_status',
            'occupation', 'education', 'religion'
        ]):
            return DataSensitivityLevel.RESTRICTED
        
        # Dados internos
        if any(internal in field_lower for internal in [
            'id', 'created_at', 'updated_at', 'status',
            'type', 'category', 'department'
        ]):
            return DataSensitivityLevel.INTERNAL
        
        # Dados públicos por padrão
        return DataSensitivityLevel.PUBLIC
    
    @staticmethod
    def validate_medical_data(data: Dict[str, Any]) -> List[ValidationError]:
        """Valida dados médicos específicos"""
        errors = []
        
        # Validar CID (Classificação Internacional de Doenças)
        if 'cid_code' in data:
            cid = data['cid_code']
            if cid and not re.match(r'^[A-Z]\d{2}(\.\d{1,2})?$', cid):
                errors.append(ValidationError(
                    'cid_code',
                    'Código CID deve seguir o formato A00 ou A00.0',
                    'INVALID_CID_FORMAT'
                ))
        
        # Validar dosagem de medicamentos
        if 'dosage' in data:
            dosage = data['dosage']
            if dosage and not re.match(r'^\d+(\.\d+)?\s*(mg|g|ml|l|ui|mcg|%)?(/\w+)?$', dosage.lower()):
                errors.append(ValidationError(
                    'dosage',
                    'Dosagem deve incluir quantidade e unidade (ex: 500mg, 10ml)',
                    'INVALID_DOSAGE_FORMAT'
                ))
        
        # Validar pressão arterial
        if 'blood_pressure' in data:
            bp = data['blood_pressure']
            if bp and not re.match(r'^\d{2,3}/\d{2,3}$', bp):
                errors.append(ValidationError(
                    'blood_pressure',
                    'Pressão arterial deve seguir o formato 120/80',
                    'INVALID_BP_FORMAT'
                ))
        
        # Validar temperatura
        if 'temperature' in data:
            temp = data['temperature']
            if temp:
                try:
                    temp_float = float(temp)
                    if not (30.0 <= temp_float <= 45.0):
                        errors.append(ValidationError(
                            'temperature',
                            'Temperatura deve estar entre 30°C e 45°C',
                            'INVALID_TEMPERATURE_RANGE'
                        ))
                except (ValueError, TypeError):
                    errors.append(ValidationError(
                        'temperature',
                        'Temperatura deve ser um número válido',
                        'INVALID_TEMPERATURE_FORMAT'
                    ))
        
        # Validar peso
        if 'weight' in data:
            weight = data['weight']
            if weight:
                try:
                    weight_float = float(weight)
                    if not (0.5 <= weight_float <= 500.0):
                        errors.append(ValidationError(
                            'weight',
                            'Peso deve estar entre 0.5kg e 500kg',
                            'INVALID_WEIGHT_RANGE'
                        ))
                except (ValueError, TypeError):
                    errors.append(ValidationError(
                        'weight',
                        'Peso deve ser um número válido',
                        'INVALID_WEIGHT_FORMAT'
                    ))
        
        # Validar altura
        if 'height' in data:
            height = data['height']
            if height:
                try:
                    height_float = float(height)
                    if not (0.3 <= height_float <= 3.0):
                        errors.append(ValidationError(
                            'height',
                            'Altura deve estar entre 0.3m e 3.0m',
                            'INVALID_HEIGHT_RANGE'
                        ))
                except (ValueError, TypeError):
                    errors.append(ValidationError(
                        'height',
                        'Altura deve ser um número válido',
                        'INVALID_HEIGHT_FORMAT'
                    ))
        
        return errors
    
    @staticmethod
    def validate_lgpd_compliance(data: Dict[str, Any]) -> List[ValidationError]:
        """Valida conformidade com LGPD"""
        errors = []
        
        # Verificar se dados sensíveis têm consentimento
        sensitive_fields = [
            'cpf', 'rg', 'medical_record', 'health_data',
            'biometric_data', 'genetic_data'
        ]
        
        has_sensitive_data = any(field in data for field in sensitive_fields)
        
        if has_sensitive_data:
            if 'consent_given' not in data or not data['consent_given']:
                errors.append(ValidationError(
                    'consent_given',
                    'Consentimento é obrigatório para dados sensíveis (LGPD)',
                    'LGPD_CONSENT_REQUIRED'
                ))
            
            if 'consent_date' not in data:
                errors.append(ValidationError(
                    'consent_date',
                    'Data do consentimento é obrigatória (LGPD)',
                    'LGPD_CONSENT_DATE_REQUIRED'
                ))
            
            if 'data_purpose' not in data or not data['data_purpose']:
                errors.append(ValidationError(
                    'data_purpose',
                    'Finalidade do tratamento dos dados é obrigatória (LGPD)',
                    'LGPD_PURPOSE_REQUIRED'
                ))
        
        return errors
    
    @staticmethod
    def generate_data_hash(data: str, algorithm: str = 'sha256') -> str:
        """Gera hash dos dados para busca sem exposição"""
        if not data:
            return ""
        
        # Normalizar dados
        normalized = re.sub(r'\D', '', data) if data.isdigit() else data.lower().strip()
        
        # Gerar hash
        if algorithm == 'sha256':
            return hashlib.sha256(normalized.encode()).hexdigest()
        elif algorithm == 'md5':
            return hashlib.md5(normalized.encode()).hexdigest()
        else:
            raise ValueError(f"Algoritmo de hash não suportado: {algorithm}")
    
    @staticmethod
    def mask_sensitive_data(value: str, field_type: str) -> str:
        """Mascara dados sensíveis para exibição"""
        if not value:
            return ""
        
        if field_type == 'cpf':
            # Mostrar apenas os 3 primeiros e 2 últimos dígitos
            clean_cpf = re.sub(r'\D', '', value)
            if len(clean_cpf) == 11:
                return f"{clean_cpf[:3]}.***.**{clean_cpf[-2:]}"
        
        elif field_type == 'email':
            # Mostrar apenas o primeiro caractere e domínio
            if '@' in value:
                local, domain = value.split('@', 1)
                return f"{local[0]}***@{domain}"
        
        elif field_type == 'phone':
            # Mostrar apenas os 2 primeiros e 2 últimos dígitos
            clean_phone = re.sub(r'\D', '', value)
            if len(clean_phone) >= 8:
                return f"{clean_phone[:2]}****{clean_phone[-2:]}"
        
        elif field_type == 'name':
            # Mostrar apenas o primeiro nome
            names = value.split()
            if len(names) > 1:
                return f"{names[0]} ***"
        
        # Mascaramento genérico
        if len(value) <= 3:
            return "***"
        else:
            return f"{value[0]}{'*' * (len(value) - 2)}{value[-1]}"
    
    @staticmethod
    def validate_data_retention(created_date: datetime, data_type: str) -> bool:
        """Valida se os dados ainda estão dentro do período de retenção"""
        from datetime import timedelta
        
        # Períodos de retenção por tipo de dado (em dias)
        retention_periods = {
            'medical_record': 2555,  # 7 anos
            'prescription': 1825,    # 5 anos
            'patient_data': 2555,    # 7 anos
            'financial_data': 1825,  # 5 anos
            'audit_log': 2555,       # 7 anos
            'session_data': 90,      # 3 meses
            'temporary_data': 30,    # 1 mês
            'default': 2555          # 7 anos (padrão)
        }
        
        retention_days = retention_periods.get(data_type, retention_periods['default'])
        expiry_date = created_date + timedelta(days=retention_days)
        
        return datetime.now() <= expiry_date

# Schemas Pydantic para validação

class PatientDataSchema(BaseModel):
    """Schema para validação de dados do paciente"""
    name: str = Field(..., min_length=2, max_length=100)
    cpf: Optional[str] = Field(None, regex=r'^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$')
    rg: Optional[str] = Field(None, max_length=20)
    birth_date: date
    email: Optional[str] = Field(None, regex=r'^[^@]+@[^@]+\.[^@]+$')
    phone: Optional[str] = Field(None, regex=r'^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$')
    address: Optional[str] = Field(None, max_length=200)
    cep: Optional[str] = Field(None, regex=r'^\d{5}-?\d{3}$')
    emergency_contact: Optional[str] = Field(None, max_length=100)
    emergency_phone: Optional[str] = Field(None, regex=r'^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$')
    
    @validator('cpf')
    def validate_cpf(cls, v):
        if v and not DataValidator.validate_cpf(v):
            raise ValueError('CPF inválido')
        return v
    
    @validator('birth_date')
    def validate_birth_date(cls, v):
        if not DataValidator.validate_date_of_birth(v):
            raise ValueError('Data de nascimento inválida')
        return v
    
    @validator('email')
    def validate_email(cls, v):
        if v and not DataValidator.validate_email(v):
            raise ValueError('E-mail inválido')
        return v
    
    @validator('phone', 'emergency_phone')
    def validate_phone(cls, v):
        if v and not DataValidator.validate_phone(v):
            raise ValueError('Telefone inválido')
        return v
    
    @validator('cep')
    def validate_cep(cls, v):
        if v and not DataValidator.validate_cep(v):
            raise ValueError('CEP inválido')
        return v

class DoctorDataSchema(BaseModel):
    """Schema para validação de dados do médico"""
    name: str = Field(..., min_length=2, max_length=100)
    cpf: str = Field(..., regex=r'^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$')
    crm: str = Field(..., min_length=4, max_length=10)
    crm_state: str = Field(..., min_length=2, max_length=2)
    specialty: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., regex=r'^[^@]+@[^@]+\.[^@]+$')
    phone: str = Field(..., regex=r'^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$')
    
    @validator('cpf')
    def validate_cpf(cls, v):
        if not DataValidator.validate_cpf(v):
            raise ValueError('CPF inválido')
        return v
    
    @validator('crm')
    def validate_crm(cls, v, values):
        state = values.get('crm_state')
        if not DataValidator.validate_crm(v, state):
            raise ValueError('CRM inválido')
        return v
    
    @validator('email')
    def validate_email(cls, v):
        if not DataValidator.validate_email(v):
            raise ValueError('E-mail inválido')
        return v
    
    @validator('phone')
    def validate_phone(cls, v):
        if not DataValidator.validate_phone(v):
            raise ValueError('Telefone inválido')
        return v

class MedicalRecordSchema(BaseModel):
    """Schema para validação de prontuário médico"""
    patient_id: int
    doctor_id: int
    date: datetime
    chief_complaint: str = Field(..., min_length=5, max_length=500)
    history_present_illness: Optional[str] = Field(None, max_length=2000)
    physical_examination: Optional[str] = Field(None, max_length=2000)
    diagnosis: Optional[str] = Field(None, max_length=1000)
    cid_code: Optional[str] = Field(None, regex=r'^[A-Z]\d{2}(\.\d{1,2})?$')
    treatment_plan: Optional[str] = Field(None, max_length=2000)
    observations: Optional[str] = Field(None, max_length=1000)
    
    @validator('date')
    def validate_date(cls, v):
        if v > datetime.now():
            raise ValueError('Data não pode ser futura')
        return v
    
    @validator('cid_code')
    def validate_cid(cls, v):
        if v and not re.match(r'^[A-Z]\d{2}(\.\d{1,2})?$', v):
            raise ValueError('Código CID inválido')
        return v

# Função utilitária para validação completa
def validate_sensitive_data(data: Dict[str, Any], schema_type: str = None) -> Dict[str, Any]:
    """Valida dados sensíveis de forma abrangente"""
    validator = DataValidator()
    result = {
        'is_valid': True,
        'errors': [],
        'warnings': [],
        'sanitized_data': {},
        'sensitivity_classification': {}
    }
    
    try:
        # Sanitizar dados
        for key, value in data.items():
            if isinstance(value, str):
                result['sanitized_data'][key] = validator.sanitize_input(value)
            else:
                result['sanitized_data'][key] = value
            
            # Classificar sensibilidade
            result['sensitivity_classification'][key] = validator.classify_data_sensitivity(key, value)
        
        # Validações específicas por tipo
        if schema_type == 'patient':
            try:
                PatientDataSchema(**result['sanitized_data'])
            except Exception as e:
                result['errors'].extend([str(e)])
        
        elif schema_type == 'doctor':
            try:
                DoctorDataSchema(**result['sanitized_data'])
            except Exception as e:
                result['errors'].extend([str(e)])
        
        elif schema_type == 'medical_record':
            try:
                MedicalRecordSchema(**result['sanitized_data'])
            except Exception as e:
                result['errors'].extend([str(e)])
        
        # Validações médicas específicas
        medical_errors = validator.validate_medical_data(result['sanitized_data'])
        result['errors'].extend([str(e) for e in medical_errors])
        
        # Validações LGPD
        lgpd_errors = validator.validate_lgpd_compliance(result['sanitized_data'])
        result['errors'].extend([str(e) for e in lgpd_errors])
        
        # Determinar se é válido
        result['is_valid'] = len(result['errors']) == 0
        
    except Exception as e:
        result['is_valid'] = False
        result['errors'].append(f"Erro na validação: {str(e)}")
    
    return result