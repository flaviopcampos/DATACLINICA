from pydantic import BaseModel, EmailStr
from datetime import datetime, date, time
from typing import Optional, List, Dict, Any
from decimal import Decimal

# Clinic Schemas
class ClinicBase(BaseModel):
    name: str
    cnpj: str
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    logo_url: Optional[str] = None
    theme_color: str = "#3B82F6"
    is_active: bool = True
    subscription_plan: str = "basic"
    max_users: int = 10

class ClinicCreate(ClinicBase):
    pass

class ClinicUpdate(BaseModel):
    name: Optional[str] = None
    cnpj: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    logo_url: Optional[str] = None
    theme_color: Optional[str] = None
    is_active: Optional[bool] = None
    subscription_plan: Optional[str] = None
    max_users: Optional[int] = None

class Clinic(ClinicBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# User Schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    role: str
    is_active: bool = True
    clinic_id: Optional[int] = None
    phone: Optional[str] = None
    cpf: Optional[str] = None
    professional_license: Optional[str] = None
    specialty: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    clinic_id: Optional[int] = None
    phone: Optional[str] = None
    cpf: Optional[str] = None
    professional_license: Optional[str] = None
    specialty: Optional[str] = None

class User(UserBase):
    id: int
    last_login: Optional[datetime] = None
    failed_login_attempts: int = 0
    locked_until: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
    clinic_id: Optional[int] = None
    phone: Optional[str] = None
    cpf: Optional[str] = None
    professional_license: Optional[str] = None
    specialty: Optional[str] = None
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Patient Schemas
class PatientBase(BaseModel):
    clinic_id: Optional[int] = None
    cpf: str
    name: str
    birth_date: date
    gender: str
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None
    blood_type: Optional[str] = None
    allergies: Optional[str] = None
    comorbidities: Optional[str] = None
    insurance_plan: Optional[str] = None
    insurance_number: Optional[str] = None
    # Campos para documentos
    rg_number: Optional[str] = None
    rg_issuer: Optional[str] = None
    mother_name: Optional[str] = None
    father_name: Optional[str] = None
    marital_status: Optional[str] = None
    profession: Optional[str] = None
    # Campos LGPD
    lgpd_consent: bool = False
    lgpd_consent_date: Optional[datetime] = None
    data_sharing_consent: bool = False
    marketing_consent: bool = False
    is_active: bool = True

class PatientCreate(PatientBase):
    pass

class PatientUpdate(BaseModel):
    clinic_id: Optional[int] = None
    cpf: Optional[str] = None
    name: Optional[str] = None
    birth_date: Optional[date] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None
    blood_type: Optional[str] = None
    allergies: Optional[str] = None
    comorbidities: Optional[str] = None
    insurance_plan: Optional[str] = None
    insurance_number: Optional[str] = None
    rg_number: Optional[str] = None
    rg_issuer: Optional[str] = None
    mother_name: Optional[str] = None
    father_name: Optional[str] = None
    marital_status: Optional[str] = None
    profession: Optional[str] = None
    lgpd_consent: Optional[bool] = None
    lgpd_consent_date: Optional[datetime] = None
    data_sharing_consent: Optional[bool] = None
    marketing_consent: Optional[bool] = None
    is_active: Optional[bool] = None

class Patient(PatientBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Doctor Schemas
class DoctorBase(BaseModel):
    clinic_id: Optional[int] = None
    user_id: Optional[int] = None
    name: str
    cpf: str
    crm: str
    crm_state: str
    specialty: str
    subspecialty: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    birth_date: Optional[date] = None
    commission_percentage: Optional[Decimal] = None
    pix_key: Optional[str] = None
    bank_account: Optional[str] = None
    digital_signature: Optional[str] = None
    is_active: bool = True

class DoctorCreate(DoctorBase):
    pass

class DoctorUpdate(BaseModel):
    clinic_id: Optional[int] = None
    user_id: Optional[int] = None
    name: Optional[str] = None
    cpf: Optional[str] = None
    crm: Optional[str] = None
    crm_state: Optional[str] = None
    specialty: Optional[str] = None
    subspecialty: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    birth_date: Optional[date] = None
    commission_percentage: Optional[Decimal] = None
    pix_key: Optional[str] = None
    bank_account: Optional[str] = None
    digital_signature: Optional[str] = None
    is_active: Optional[bool] = None

class Doctor(DoctorBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Appointment Schemas
class AppointmentBase(BaseModel):
    clinic_id: Optional[int] = None
    patient_id: int
    doctor_id: int
    procedure_id: Optional[int] = None
    appointment_number: Optional[str] = None
    appointment_date: datetime
    duration: Optional[int] = None
    appointment_type: Optional[str] = None
    status: str = "agendado"
    arrival_time: Optional[datetime] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    room: Optional[str] = None
    authorization_number: Optional[str] = None
    price: Optional[Decimal] = None
    copayment: Optional[Decimal] = None
    payment_method: Optional[str] = None
    payment_status: str = "pending"
    notes: Optional[str] = None
    cancellation_reason: Optional[str] = None
    created_by: Optional[int] = None

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentUpdate(BaseModel):
    clinic_id: Optional[int] = None
    patient_id: Optional[int] = None
    doctor_id: Optional[int] = None
    procedure_id: Optional[int] = None
    appointment_number: Optional[str] = None
    appointment_date: Optional[datetime] = None
    duration: Optional[int] = None
    appointment_type: Optional[str] = None
    status: Optional[str] = None
    arrival_time: Optional[datetime] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    room: Optional[str] = None
    authorization_number: Optional[str] = None
    price: Optional[Decimal] = None
    copayment: Optional[Decimal] = None
    payment_method: Optional[str] = None
    payment_status: Optional[str] = None
    notes: Optional[str] = None
    cancellation_reason: Optional[str] = None
    created_by: Optional[int] = None

class Appointment(AppointmentBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Medical Record Template Schemas
class MedicalRecordTemplateBase(BaseModel):
    clinic_id: Optional[int] = None
    name: str
    specialty: Optional[str] = None
    template_type: str
    fields_config: Optional[Dict[str, Any]] = None
    is_active: bool = True
    created_by: Optional[int] = None

class MedicalRecordTemplateCreate(MedicalRecordTemplateBase):
    pass

class MedicalRecordTemplateUpdate(BaseModel):
    clinic_id: Optional[int] = None
    name: Optional[str] = None
    specialty: Optional[str] = None
    template_type: Optional[str] = None
    fields_config: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None
    created_by: Optional[int] = None

class MedicalRecordTemplate(MedicalRecordTemplateBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# CID Diagnosis Schemas
class CidDiagnosisBase(BaseModel):
    code: str
    description: str
    category: Optional[str] = None
    subcategory: Optional[str] = None
    is_active: bool = True

class CidDiagnosisCreate(CidDiagnosisBase):
    pass

class CidDiagnosisUpdate(BaseModel):
    code: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    is_active: Optional[bool] = None

class CidDiagnosis(CidDiagnosisBase):
    id: int
    
    class Config:
        from_attributes = True

# Medical Record Diagnosis Schemas
class MedicalRecordDiagnosisBase(BaseModel):
    medical_record_id: int
    diagnosis_id: int
    diagnosis_type: str
    notes: Optional[str] = None

class MedicalRecordDiagnosisCreate(MedicalRecordDiagnosisBase):
    pass

class MedicalRecordDiagnosisUpdate(BaseModel):
    medical_record_id: Optional[int] = None
    diagnosis_id: Optional[int] = None
    diagnosis_type: Optional[str] = None
    notes: Optional[str] = None

class MedicalRecordDiagnosis(MedicalRecordDiagnosisBase):
    id: int
    
    class Config:
        from_attributes = True

# Prescription Schemas
class PrescriptionBase(BaseModel):
    medical_record_id: int
    patient_id: int
    doctor_id: int
    prescription_number: Optional[str] = None
    prescription_type: str
    content: str
    validity_days: int = 30
    digital_signature: Optional[str] = None
    signature_certificate: Optional[str] = None
    is_controlled: bool = False
    status: str = "active"
    expires_at: Optional[datetime] = None

class PrescriptionCreate(PrescriptionBase):
    pass

class PrescriptionUpdate(BaseModel):
    medical_record_id: Optional[int] = None
    patient_id: Optional[int] = None
    doctor_id: Optional[int] = None
    prescription_number: Optional[str] = None
    prescription_type: Optional[str] = None
    content: Optional[str] = None
    validity_days: Optional[int] = None
    digital_signature: Optional[str] = None
    signature_certificate: Optional[str] = None
    is_controlled: Optional[bool] = None
    status: Optional[str] = None
    expires_at: Optional[datetime] = None

class Prescription(PrescriptionBase):
    id: int
    issued_at: datetime
    
    class Config:
        from_attributes = True

# Medical Record Schemas
class MedicalRecordBase(BaseModel):
    clinic_id: Optional[int] = None
    patient_id: int
    doctor_id: int
    appointment_id: Optional[int] = None
    template_id: Optional[int] = None
    record_number: Optional[str] = None
    record_type: str = "consulta"
    chief_complaint: Optional[str] = None
    history_present_illness: Optional[str] = None
    physical_examination: Optional[str] = None
    diagnosis: Optional[str] = None
    cid_10: Optional[str] = None
    assessment_plan: Optional[str] = None
    treatment_plan: Optional[str] = None
    prescription: Optional[str] = None
    notes: Optional[str] = None
    custom_fields: Optional[Dict[str, Any]] = None
    status: str = "draft"

class MedicalRecordCreate(MedicalRecordBase):
    pass

class MedicalRecordUpdate(BaseModel):
    clinic_id: Optional[int] = None
    patient_id: Optional[int] = None
    doctor_id: Optional[int] = None
    appointment_id: Optional[int] = None
    template_id: Optional[int] = None
    record_number: Optional[str] = None
    record_type: Optional[str] = None
    chief_complaint: Optional[str] = None
    history_present_illness: Optional[str] = None
    physical_examination: Optional[str] = None
    diagnosis: Optional[str] = None
    cid_10: Optional[str] = None
    assessment_plan: Optional[str] = None
    treatment_plan: Optional[str] = None
    prescription: Optional[str] = None
    notes: Optional[str] = None
    custom_fields: Optional[Dict[str, Any]] = None
    status: Optional[str] = None

class MedicalRecord(MedicalRecordBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Insurance Plan Schemas
class InsurancePlanBase(BaseModel):
    name: str
    code: str
    contact_phone: Optional[str] = None
    email: Optional[EmailStr] = None
    is_active: bool = True

class InsurancePlanCreate(InsurancePlanBase):
    pass

class InsurancePlanUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    contact_phone: Optional[str] = None
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None

class InsurancePlan(InsurancePlanBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Procedure Schemas
class ProcedureBase(BaseModel):
    code: str
    name: str
    description: Optional[str] = None
    price: Decimal
    category: Optional[str] = None
    is_active: bool = True

class ProcedureCreate(ProcedureBase):
    pass

class ProcedureUpdate(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    category: Optional[str] = None
    is_active: Optional[bool] = None

class Procedure(ProcedureBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Medication Schemas
class MedicationBase(BaseModel):
    name: str
    active_ingredient: Optional[str] = None
    dosage: Optional[str] = None
    form: Optional[str] = None
    manufacturer: Optional[str] = None
    batch_number: Optional[str] = None
    expiry_date: Optional[date] = None
    quantity_in_stock: int = 0
    minimum_stock: int = 10
    unit_price: Optional[Decimal] = None

class MedicationCreate(MedicationBase):
    pass

class MedicationUpdate(BaseModel):
    name: Optional[str] = None
    active_ingredient: Optional[str] = None
    dosage: Optional[str] = None
    form: Optional[str] = None
    manufacturer: Optional[str] = None
    batch_number: Optional[str] = None
    expiry_date: Optional[date] = None
    quantity_in_stock: Optional[int] = None
    minimum_stock: Optional[int] = None
    unit_price: Optional[Decimal] = None

class Medication(MedicationBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Stock Movement Schemas
class StockMovementBase(BaseModel):
    medication_id: int
    movement_type: str
    quantity: int
    reason: Optional[str] = None
    user_id: int

class StockMovementCreate(StockMovementBase):
    pass

class StockMovement(StockMovementBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Financial Transaction Schemas
class FinancialTransactionBase(BaseModel):
    patient_id: Optional[int] = None
    appointment_id: Optional[int] = None
    transaction_type: str
    amount: Decimal
    description: str
    payment_method: str
    status: str = "pendente"
    due_date: Optional[date] = None
    payment_date: Optional[date] = None

class FinancialTransactionCreate(FinancialTransactionBase):
    pass

class FinancialTransactionUpdate(BaseModel):
    transaction_type: Optional[str] = None
    amount: Optional[Decimal] = None
    description: Optional[str] = None
    payment_method: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[date] = None
    payment_date: Optional[date] = None

class FinancialTransaction(FinancialTransactionBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Anamnesis Schemas
class AnamnesisBase(BaseModel):
    medical_record_id: int
    chief_complaint: Optional[str] = None
    history_present_illness: Optional[str] = None
    past_medical_history: Optional[str] = None
    family_history: Optional[str] = None
    social_history: Optional[str] = None
    medications: Optional[str] = None
    allergies: Optional[str] = None
    review_of_systems: Optional[str] = None
    notes: Optional[str] = None

class AnamnesisCreate(AnamnesisBase):
    pass

class AnamnesisUpdate(BaseModel):
    medical_record_id: Optional[int] = None
    chief_complaint: Optional[str] = None
    history_present_illness: Optional[str] = None
    past_medical_history: Optional[str] = None
    family_history: Optional[str] = None
    social_history: Optional[str] = None
    medications: Optional[str] = None
    allergies: Optional[str] = None
    review_of_systems: Optional[str] = None
    notes: Optional[str] = None

class Anamnesis(AnamnesisBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Physical Exam Schemas
class PhysicalExamBase(BaseModel):
    medical_record_id: int
    general_appearance: Optional[str] = None
    vital_signs: Optional[str] = None
    head_neck: Optional[str] = None
    cardiovascular: Optional[str] = None
    respiratory: Optional[str] = None
    abdominal: Optional[str] = None
    neurological: Optional[str] = None
    musculoskeletal: Optional[str] = None
    skin: Optional[str] = None
    other_findings: Optional[str] = None
    notes: Optional[str] = None

class PhysicalExamCreate(PhysicalExamBase):
    pass

class PhysicalExamUpdate(BaseModel):
    medical_record_id: Optional[int] = None
    general_appearance: Optional[str] = None
    vital_signs: Optional[str] = None
    head_neck: Optional[str] = None
    cardiovascular: Optional[str] = None
    respiratory: Optional[str] = None
    abdominal: Optional[str] = None
    neurological: Optional[str] = None
    musculoskeletal: Optional[str] = None
    skin: Optional[str] = None
    other_findings: Optional[str] = None
    notes: Optional[str] = None

class PhysicalExam(PhysicalExamBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Medical Document Schemas
class MedicalDocumentBase(BaseModel):
    medical_record_id: int
    patient_id: int
    doctor_id: int
    document_type: str
    title: str
    content: Optional[str] = None
    file_path: Optional[str] = None
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    is_signed: bool = False
    digital_signature: Optional[str] = None
    signature_date: Optional[datetime] = None
    template_used: Optional[str] = None
    status: str = "draft"

class MedicalDocumentCreate(MedicalDocumentBase):
    pass

class MedicalDocumentUpdate(BaseModel):
    medical_record_id: Optional[int] = None
    patient_id: Optional[int] = None
    doctor_id: Optional[int] = None
    document_type: Optional[str] = None
    title: Optional[str] = None
    content: Optional[str] = None
    file_path: Optional[str] = None
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    is_signed: Optional[bool] = None
    digital_signature: Optional[str] = None
    signature_date: Optional[datetime] = None
    template_used: Optional[str] = None
    status: Optional[str] = None

class MedicalDocument(MedicalDocumentBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Prescription Medication Schemas
class PrescriptionMedicationBase(BaseModel):
    prescription_id: int
    medication_name: str
    dosage: str
    frequency: str
    duration: str
    quantity: Optional[int] = None
    instructions: Optional[str] = None
    is_controlled: bool = False
    generic_allowed: bool = True

class PrescriptionMedicationCreate(PrescriptionMedicationBase):
    pass

class PrescriptionMedicationUpdate(BaseModel):
    prescription_id: Optional[int] = None
    medication_name: Optional[str] = None
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None
    quantity: Optional[int] = None
    instructions: Optional[str] = None
    is_controlled: Optional[bool] = None
    generic_allowed: Optional[bool] = None

class PrescriptionMedication(PrescriptionMedicationBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# ETAPA 4 - Faturamento e Financeiro Schemas

# Insurance Company Schemas
class InsuranceCompanyBase(BaseModel):
    name: str
    cnpj: Optional[str] = None
    ans_code: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    payment_terms: Optional[str] = None
    tiss_version: Optional[str] = None
    is_active: bool = True

class InsuranceCompanyCreate(InsuranceCompanyBase):
    pass

class InsuranceCompanyUpdate(BaseModel):
    name: Optional[str] = None
    cnpj: Optional[str] = None
    ans_code: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    payment_terms: Optional[str] = None
    tiss_version: Optional[str] = None
    is_active: Optional[bool] = None

class InsuranceCompany(InsuranceCompanyBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# TUSS Procedure Schemas
class TussProcedureBase(BaseModel):
    code: str
    description: str
    category: Optional[str] = None
    subcategory: Optional[str] = None
    complexity: Optional[str] = None
    default_price: Optional[Decimal] = None
    is_active: bool = True

class TussProcedureCreate(TussProcedureBase):
    pass

class TussProcedureUpdate(BaseModel):
    code: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    complexity: Optional[str] = None
    default_price: Optional[Decimal] = None
    is_active: Optional[bool] = None

class TussProcedure(TussProcedureBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Billing Batch Schemas
class BillingBatchBase(BaseModel):
    insurance_company_id: int
    batch_number: str
    reference_month: str
    status: str = "draft"
    total_amount: Optional[Decimal] = None
    gloss_amount: Optional[Decimal] = None
    paid_amount: Optional[Decimal] = None
    xml_file_path: Optional[str] = None
    submission_date: Optional[date] = None
    response_date: Optional[date] = None
    notes: Optional[str] = None

class BillingBatchCreate(BillingBatchBase):
    pass

class BillingBatchUpdate(BaseModel):
    insurance_company_id: Optional[int] = None
    batch_number: Optional[str] = None
    reference_month: Optional[str] = None
    status: Optional[str] = None
    total_amount: Optional[Decimal] = None
    gloss_amount: Optional[Decimal] = None
    paid_amount: Optional[Decimal] = None
    xml_file_path: Optional[str] = None
    submission_date: Optional[date] = None
    response_date: Optional[date] = None
    notes: Optional[str] = None

class BillingBatch(BillingBatchBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Billing Item Schemas
class BillingItemBase(BaseModel):
    batch_id: int
    appointment_id: int
    procedure_id: int
    patient_id: int
    doctor_id: int
    service_date: date
    quantity: int = 1
    unit_price: Decimal
    total_amount: Decimal
    authorization_number: Optional[str] = None
    guide_number: Optional[str] = None
    status: str = "pending"
    rejection_reason: Optional[str] = None

class BillingItemCreate(BillingItemBase):
    pass

class BillingItemUpdate(BaseModel):
    batch_id: Optional[int] = None
    appointment_id: Optional[int] = None
    procedure_id: Optional[int] = None
    patient_id: Optional[int] = None
    doctor_id: Optional[int] = None
    service_date: Optional[date] = None
    quantity: Optional[int] = None
    unit_price: Optional[Decimal] = None
    total_amount: Optional[Decimal] = None
    authorization_number: Optional[str] = None
    guide_number: Optional[str] = None
    status: Optional[str] = None
    rejection_reason: Optional[str] = None

class BillingItem(BillingItemBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Accounts Receivable Schemas
class AccountsReceivableBase(BaseModel):
    patient_id: Optional[int] = None
    insurance_company_id: Optional[int] = None
    billing_batch_id: Optional[int] = None
    invoice_number: str
    description: str
    original_amount: Decimal
    discount_amount: Optional[Decimal] = None
    final_amount: Decimal
    due_date: date
    payment_date: Optional[date] = None
    payment_method: Optional[str] = None
    status: str = "pending"
    notes: Optional[str] = None

class AccountsReceivableCreate(AccountsReceivableBase):
    pass

class AccountsReceivableUpdate(BaseModel):
    patient_id: Optional[int] = None
    insurance_company_id: Optional[int] = None
    billing_batch_id: Optional[int] = None
    invoice_number: Optional[str] = None
    description: Optional[str] = None
    original_amount: Optional[Decimal] = None
    discount_amount: Optional[Decimal] = None
    final_amount: Optional[Decimal] = None
    due_date: Optional[date] = None
    payment_date: Optional[date] = None
    payment_method: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class AccountsReceivable(AccountsReceivableBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Accounts Payable Schemas
class AccountsPayableBase(BaseModel):
    supplier_id: Optional[int] = None
    doctor_id: Optional[int] = None
    category: str
    invoice_number: str
    description: str
    original_amount: Decimal
    discount_amount: Optional[Decimal] = None
    final_amount: Decimal
    due_date: date
    payment_date: Optional[date] = None
    payment_method: Optional[str] = None
    status: str = "pending"
    notes: Optional[str] = None

class AccountsPayableCreate(AccountsPayableBase):
    pass

class AccountsPayableUpdate(BaseModel):
    supplier_id: Optional[int] = None
    doctor_id: Optional[int] = None
    category: Optional[str] = None
    invoice_number: Optional[str] = None
    description: Optional[str] = None
    original_amount: Optional[Decimal] = None
    discount_amount: Optional[Decimal] = None
    final_amount: Optional[Decimal] = None
    due_date: Optional[date] = None
    payment_date: Optional[date] = None
    payment_method: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class AccountsPayable(AccountsPayableBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Cash Flow Schemas
class CashFlowBase(BaseModel):
    transaction_date: date
    transaction_type: str
    category: str
    subcategory: Optional[str] = None
    amount: Decimal
    payment_method: Optional[str] = None
    description: str
    reference_id: Optional[int] = None
    reference_type: Optional[str] = None

class CashFlowCreate(CashFlowBase):
    pass

class CashFlowUpdate(BaseModel):
    transaction_date: Optional[date] = None
    transaction_type: Optional[str] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    amount: Optional[Decimal] = None
    payment_method: Optional[str] = None
    description: Optional[str] = None
    reference_id: Optional[int] = None
    reference_type: Optional[str] = None

class CashFlow(CashFlowBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Authentication Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class AuthenticationResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    user_name: str
    clinic_id: int
    clinic_name: str

# Schemas para gestão financeira completa
class InvoiceNFSBase(BaseModel):
    patient_id: int
    appointment_id: Optional[int] = None
    service_date: date
    gross_amount: Decimal
    discount_amount: Optional[Decimal] = 0
    service_code: str
    description: str
    notes: Optional[str] = None

class InvoiceNFSCreate(InvoiceNFSBase):
    pass

class InvoiceNFSUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    cancellation_reason: Optional[str] = None

class InvoiceNFS(InvoiceNFSBase):
    id: int
    clinic_id: int
    invoice_number: str
    series: Optional[str]
    issue_date: datetime
    net_amount: Decimal
    iss_rate: Decimal
    iss_amount: Decimal
    pis_rate: Decimal
    pis_amount: Decimal
    cofins_rate: Decimal
    cofins_amount: Decimal
    irrf_rate: Decimal
    irrf_amount: Decimal
    total_taxes: Decimal
    final_amount: Decimal
    status: str
    verification_code: Optional[str]
    pdf_path: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class CostCenterBase(BaseModel):
    code: str
    name: str
    description: Optional[str] = None
    parent_id: Optional[int] = None

class CostCenterCreate(CostCenterBase):
    pass

class CostCenterUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class CostCenter(CostCenterBase):
    id: int
    clinic_id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class TaxConfigurationBase(BaseModel):
    tax_regime: str
    iss_rate: Decimal
    pis_rate: Decimal
    cofins_rate: Decimal
    irpj_rate: Decimal
    csll_rate: Decimal
    irrf_rate: Decimal
    city_code: str
    service_code: str
    cnae_code: str
    valid_from: date
    valid_until: Optional[date] = None

class TaxConfigurationCreate(TaxConfigurationBase):
    pass

class TaxConfigurationUpdate(BaseModel):
    tax_regime: Optional[str] = None
    iss_rate: Optional[Decimal] = None
    pis_rate: Optional[Decimal] = None
    cofins_rate: Optional[Decimal] = None
    irpj_rate: Optional[Decimal] = None
    csll_rate: Optional[Decimal] = None
    irrf_rate: Optional[Decimal] = None
    is_active: Optional[bool] = None

class TaxConfiguration(TaxConfigurationBase):
    id: int
    clinic_id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class BankAccountBase(BaseModel):
    bank_code: str
    bank_name: str
    agency: str
    account_number: str
    account_type: str
    account_holder: str
    initial_balance: Optional[Decimal] = 0

class BankAccountCreate(BankAccountBase):
    pass

class BankAccountUpdate(BaseModel):
    bank_name: Optional[str] = None
    account_holder: Optional[str] = None
    current_balance: Optional[Decimal] = None
    is_active: Optional[bool] = None

class BankAccount(BankAccountBase):
    id: int
    clinic_id: int
    current_balance: Decimal
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class BankReconciliationBase(BaseModel):
    bank_account_id: int
    reference_date: date
    bank_balance: Decimal
    system_balance: Decimal
    notes: Optional[str] = None

class BankReconciliationCreate(BankReconciliationBase):
    pass

class BankReconciliationUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

class BankReconciliation(BankReconciliationBase):
    id: int
    difference: Decimal
    status: str
    reconciled_at: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True

class DoctorPaymentBase(BaseModel):
    doctor_id: int
    reference_month: str
    clinic_percentage: Decimal
    doctor_percentage: Decimal
    deductions: Optional[Decimal] = 0
    payment_date: Optional[date] = None
    payment_method: Optional[str] = None
    notes: Optional[str] = None

class DoctorPaymentCreate(DoctorPaymentBase):
    pass

class DoctorPaymentUpdate(BaseModel):
    deductions: Optional[Decimal] = None
    payment_date: Optional[date] = None
    payment_method: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class DoctorPayment(DoctorPaymentBase):
    id: int
    clinic_id: int
    total_procedures: int
    gross_amount: Decimal
    clinic_amount: Decimal
    doctor_amount: Decimal
    net_amount: Decimal
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class FinancialKPIBase(BaseModel):
    reference_date: date
    kpi_type: str
    kpi_value: Decimal
    target_value: Optional[Decimal] = None
    period_type: str

class FinancialKPICreate(FinancialKPIBase):
    pass

class FinancialKPI(FinancialKPIBase):
    id: int
    clinic_id: int
    variance: Optional[Decimal]
    created_at: datetime
    
    class Config:
        from_attributes = True

class SupplierBase(BaseModel):
    name: str
    cnpj_cpf: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    category: str
    payment_terms: Optional[str] = None

class SupplierCreate(SupplierBase):
    pass

class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    category: Optional[str] = None
    payment_terms: Optional[str] = None
    is_active: Optional[bool] = None

class Supplier(SupplierBase):
    id: int
    clinic_id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Schemas para relatórios financeiros
class FinancialReportRequest(BaseModel):
    report_type: str  # dre, balance_sheet, cash_flow
    start_date: date
    end_date: date
    cost_center_id: Optional[int] = None

class DREReport(BaseModel):
    period: str
    gross_revenue: Decimal
    deductions: Decimal
    net_revenue: Decimal
    operating_costs: Decimal
    gross_profit: Decimal
    administrative_expenses: Decimal
    financial_expenses: Decimal
    other_expenses: Decimal
    ebitda: Decimal
    depreciation: Decimal
    ebit: Decimal
    taxes: Decimal
    net_profit: Decimal
    profit_margin: Decimal

class BalanceSheetReport(BaseModel):
    reference_date: date
    current_assets: Decimal
    non_current_assets: Decimal
    total_assets: Decimal
    current_liabilities: Decimal
    non_current_liabilities: Decimal
    total_liabilities: Decimal
    equity: Decimal
    retained_earnings: Decimal
    total_equity: Decimal

class CashFlowReport(BaseModel):
    period: str
    opening_balance: Decimal
    operating_inflows: Decimal
    operating_outflows: Decimal
    operating_net_flow: Decimal
    investing_inflows: Decimal
    investing_outflows: Decimal
    investing_net_flow: Decimal
    financing_inflows: Decimal
    financing_outflows: Decimal
    financing_net_flow: Decimal
    net_cash_flow: Decimal
    closing_balance: Decimal

class FinancialDashboard(BaseModel):
    period: str
    total_revenue: Decimal
    total_expenses: Decimal
    net_profit: Decimal
    profit_margin: Decimal
    revenue_per_patient: Decimal
    average_ticket: Decimal
    occupancy_rate: Decimal
    accounts_receivable: Decimal
    accounts_payable: Decimal
    cash_balance: Decimal
    pending_invoices: int
    overdue_accounts: int

# Audit Log Schemas
class AuditLogBase(BaseModel):
    user_id: Optional[int] = None
    action: str
    table_name: str
    record_id: Optional[int] = None
    old_values: Optional[Dict[str, Any]] = None
    new_values: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

class AuditLogCreate(AuditLogBase):
    clinic_id: int

class AuditLog(AuditLogBase):
    id: int
    clinic_id: int
    timestamp: datetime
    
    class Config:
        from_attributes = True

# Schemas para backup e compliance
class BackupRequest(BaseModel):
    backup_type: str  # financial, full, database
    
class BackupInfo(BaseModel):
    backup_id: str
    backup_type: str
    file_path: str
    file_size: int
    created_at: datetime
    clinic_id: int

class ComplianceReport(BaseModel):
    clinic_id: int
    check_date: datetime
    overall_score: int
    issues_found: List[Dict[str, Any]]
    recommendations: List[str]
    last_backup_date: Optional[datetime]
    uncategorized_transactions: int
    pending_invoices: int
    overdue_receivables: int

# Schemas para alertas financeiros
class FinancialAlert(BaseModel):
    alert_type: str
    severity: str  # low, medium, high, critical
    title: str
    description: str
    value: Optional[Decimal] = None
    threshold: Optional[Decimal] = None
    created_at: datetime
    
class FinancialKPICalculation(BaseModel):
    period_start: date
    period_end: date
    revenue_per_patient: Decimal
    average_ticket: Decimal
    default_rate: Decimal
    average_collection_time: int
    cost_per_appointment: Decimal
    occupancy_rate: Decimal
    profit_margin_by_insurance: Dict[str, Decimal]
    roi_per_doctor: Dict[str, Decimal]

# ETAPA 5 - Farmácia e Estoque Schemas

# Product Category Schemas
class ProductCategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True

class ProductCategoryCreate(ProductCategoryBase):
    pass

class ProductCategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class ProductCategory(ProductCategoryBase):
    id: int
    clinic_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Product Schemas
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    category_id: int
    unit_of_measure: str
    minimum_stock: int = 0
    maximum_stock: Optional[int] = None
    current_stock: int = 0
    unit_cost: Decimal
    sale_price: Optional[Decimal] = None
    barcode: Optional[str] = None
    location: Optional[str] = None
    requires_prescription: bool = False
    controlled_substance: bool = False
    is_active: bool = True

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    unit_of_measure: Optional[str] = None
    minimum_stock: Optional[int] = None
    maximum_stock: Optional[int] = None
    current_stock: Optional[int] = None
    unit_cost: Optional[Decimal] = None
    sale_price: Optional[Decimal] = None
    barcode: Optional[str] = None
    location: Optional[str] = None
    requires_prescription: Optional[bool] = None
    controlled_substance: Optional[bool] = None
    is_active: Optional[bool] = None

class Product(ProductBase):
    id: int
    clinic_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Product Batch Schemas
class ProductBatchBase(BaseModel):
    product_id: int
    batch_number: str
    expiry_date: Optional[date] = None
    quantity: int
    unit_cost: Decimal
    supplier_id: Optional[int] = None
    received_date: date
    notes: Optional[str] = None

class ProductBatchCreate(ProductBatchBase):
    pass

class ProductBatchUpdate(BaseModel):
    batch_number: Optional[str] = None
    expiry_date: Optional[date] = None
    quantity: Optional[int] = None
    unit_cost: Optional[Decimal] = None
    supplier_id: Optional[int] = None
    received_date: Optional[date] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None

class ProductBatch(ProductBatchBase):
    id: int
    clinic_id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Product Stock Movement Schemas
class ProductStockMovementBase(BaseModel):
    product_id: int
    batch_id: Optional[int] = None
    movement_type: str  # entrada, saida, ajuste, transferencia
    quantity: Decimal
    unit_cost: Decimal
    total_cost: Decimal
    reason: Optional[str] = None
    department: Optional[str] = None  # farmacia, limpeza, refeitorio, enfermagem
    reference_document: Optional[str] = None

class ProductStockMovementCreate(ProductStockMovementBase):
    pass

class ProductStockMovement(ProductStockMovementBase):
    id: int
    clinic_id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Stock Requisition Schemas
class StockRequisitionBase(BaseModel):
    requisition_number: str
    department: str  # farmacia, limpeza, refeitorio, enfermagem
    priority: str = "normal"  # baixa, normal, alta, urgente
    notes: Optional[str] = None

class StockRequisitionCreate(StockRequisitionBase):
    pass

class StockRequisitionUpdate(BaseModel):
    department: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    approved_by: Optional[int] = None
    approved_at: Optional[datetime] = None
    fulfilled_by: Optional[int] = None
    fulfilled_at: Optional[datetime] = None

class StockRequisition(StockRequisitionBase):
    id: int
    clinic_id: int
    requested_by: int
    approved_by: Optional[int] = None
    fulfilled_by: Optional[int] = None
    status: str
    requested_at: datetime
    approved_at: Optional[datetime] = None
    fulfilled_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Stock Requisition Item Schemas
class StockRequisitionItemBase(BaseModel):
    requisition_id: int
    product_id: int
    requested_quantity: int
    approved_quantity: Optional[int] = None
    fulfilled_quantity: Optional[int] = None
    unit_cost: Optional[Decimal] = None
    notes: Optional[str] = None

class StockRequisitionItemCreate(StockRequisitionItemBase):
    pass

class StockRequisitionItemUpdate(BaseModel):
    requested_quantity: Optional[int] = None
    approved_quantity: Optional[int] = None
    fulfilled_quantity: Optional[int] = None
    unit_cost: Optional[Decimal] = None
    notes: Optional[str] = None

class StockRequisitionItem(StockRequisitionItemBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Purchase Order Schemas
class PurchaseOrderBase(BaseModel):
    supplier_id: int
    order_number: str
    order_date: date
    expected_delivery_date: Optional[date] = None
    total_amount: Decimal
    notes: Optional[str] = None

class PurchaseOrderCreate(PurchaseOrderBase):
    pass

class PurchaseOrderUpdate(BaseModel):
    supplier_id: Optional[int] = None
    expected_delivery_date: Optional[date] = None
    total_amount: Optional[Decimal] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    received_date: Optional[date] = None
    received_by: Optional[int] = None

class PurchaseOrder(PurchaseOrderBase):
    id: int
    clinic_id: int
    created_by: int
    received_by: Optional[int] = None
    status: str
    received_date: Optional[date] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Purchase Order Item Schemas
class PurchaseOrderItemBase(BaseModel):
    purchase_order_id: int
    product_id: int
    quantity: int
    unit_cost: Decimal
    total_cost: Decimal
    received_quantity: Optional[int] = None

class PurchaseOrderItemCreate(PurchaseOrderItemBase):
    pass

class PurchaseOrderItemUpdate(BaseModel):
    quantity: Optional[int] = None
    unit_cost: Optional[Decimal] = None
    total_cost: Optional[Decimal] = None
    received_quantity: Optional[int] = None

class PurchaseOrderItem(PurchaseOrderItemBase):
    id: int
    
    class Config:
        from_attributes = True

# Stock Report Schemas
class StockReportRequest(BaseModel):
    report_type: str  # low_stock, expiring, movement_summary, consumption_by_department
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    department: Optional[str] = None
    category_id: Optional[int] = None

class LowStockItem(BaseModel):
    product_id: int
    product_name: str
    current_stock: int
    minimum_stock: int
    category: str
    location: Optional[str] = None
    last_movement_date: Optional[datetime] = None

class ExpiringItem(BaseModel):
    product_id: int
    product_name: str
    batch_id: int
    batch_number: str
    expiry_date: date
    quantity: int
    days_to_expiry: int
    location: Optional[str] = None

class StockMovementSummary(BaseModel):
    product_id: int
    product_name: str
    category: str
    total_entries: int
    total_exits: int
    net_movement: int
    total_cost: Decimal
    average_cost: Decimal

class DepartmentConsumption(BaseModel):
    department: str
    total_items: int
    total_cost: Decimal
    most_consumed_products: List[Dict[str, Any]]
    consumption_trend: str  # increasing, decreasing, stable

# Department Schemas
class DepartmentBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    manager_id: Optional[int] = None
    location: Optional[str] = None
    is_active: bool = True
    budget_limit: Optional[Decimal] = None
    cost_center: Optional[str] = None

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    manager_id: Optional[int] = None
    location: Optional[str] = None
    is_active: Optional[bool] = None
    budget_limit: Optional[Decimal] = None
    cost_center: Optional[str] = None

class Department(DepartmentBase):
    id: int
    clinic_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# ============================================================================
# ETAPA 6 - RELATÓRIOS E BI
# ============================================================================

# Saved Report Schemas
class SavedReportBase(BaseModel):
    name: str
    description: Optional[str] = None
    report_type: str  # 'administrative', 'financial', 'clinical', 'bi'
    report_config: Dict[str, Any]  # Configurações do relatório (filtros, parâmetros)
    is_public: bool = False
    is_scheduled: bool = False
    schedule_config: Optional[Dict[str, Any]] = None

class SavedReportCreate(SavedReportBase):
    pass

class SavedReportUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    report_type: Optional[str] = None
    report_config: Optional[Dict[str, Any]] = None
    is_public: Optional[bool] = None
    is_scheduled: Optional[bool] = None
    schedule_config: Optional[Dict[str, Any]] = None

class SavedReport(SavedReportBase):
    id: int
    clinic_id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Report Execution Schemas
class ReportExecutionBase(BaseModel):
    saved_report_id: int
    parameters: Optional[Dict[str, Any]] = None

class ReportExecutionCreate(ReportExecutionBase):
    pass

class ReportExecutionUpdate(BaseModel):
    status: Optional[str] = None
    file_path: Optional[str] = None
    file_size: Optional[int] = None
    execution_time_ms: Optional[int] = None
    error_message: Optional[str] = None

class ReportExecution(ReportExecutionBase):
    id: int
    executed_by: Optional[int] = None
    execution_date: datetime
    status: str  # 'pending', 'running', 'completed', 'failed'
    file_path: Optional[str] = None
    file_size: Optional[int] = None
    execution_time_ms: Optional[int] = None
    error_message: Optional[str] = None
    
    class Config:
        from_attributes = True

# Custom Dashboard Schemas
class CustomDashboardBase(BaseModel):
    name: str
    description: Optional[str] = None
    layout_config: Dict[str, Any]  # Configuração do layout (widgets, posições)
    is_default: bool = False
    is_public: bool = False

class CustomDashboardCreate(CustomDashboardBase):
    pass

class CustomDashboardUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    layout_config: Optional[Dict[str, Any]] = None
    is_default: Optional[bool] = None
    is_public: Optional[bool] = None

class CustomDashboard(CustomDashboardBase):
    id: int
    clinic_id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Dashboard Widget Schemas
class DashboardWidgetBase(BaseModel):
    dashboard_id: int
    widget_type: str  # 'chart', 'kpi', 'table', 'gauge'
    title: str
    position_x: int = 0
    position_y: int = 0
    width: int = 4
    height: int = 3
    config: Dict[str, Any]  # Configurações específicas do widget
    data_source: Optional[str] = None
    refresh_interval: int = 300  # Intervalo de atualização em segundos
    is_active: bool = True

class DashboardWidgetCreate(DashboardWidgetBase):
    pass

class DashboardWidgetUpdate(BaseModel):
    widget_type: Optional[str] = None
    title: Optional[str] = None
    position_x: Optional[int] = None
    position_y: Optional[int] = None
    width: Optional[int] = None
    height: Optional[int] = None
    config: Optional[Dict[str, Any]] = None
    data_source: Optional[str] = None
    refresh_interval: Optional[int] = None
    is_active: Optional[bool] = None

class DashboardWidget(DashboardWidgetBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Performance Metric Schemas
class PerformanceMetricBase(BaseModel):
    metric_date: date
    metric_type: str  # 'daily', 'weekly', 'monthly'
    
    # Métricas de Atendimento
    total_appointments: int = 0
    completed_appointments: int = 0
    cancelled_appointments: int = 0
    no_show_appointments: int = 0
    average_wait_time: int = 0  # em minutos
    average_consultation_time: int = 0  # em minutos
    
    # Métricas de Pacientes
    new_patients: int = 0
    returning_patients: int = 0
    total_active_patients: int = 0
    
    # Métricas Financeiras
    total_revenue: Decimal = 0
    total_expenses: Decimal = 0
    net_profit: Decimal = 0
    accounts_receivable: Decimal = 0
    accounts_payable: Decimal = 0
    
    # Métricas por Convênio
    revenue_by_insurance: Optional[Dict[str, float]] = None
    procedures_by_insurance: Optional[Dict[str, int]] = None
    
    # Métricas por Especialidade
    revenue_by_specialty: Optional[Dict[str, float]] = None
    appointments_by_specialty: Optional[Dict[str, int]] = None
    
    # Métricas por Profissional
    revenue_by_doctor: Optional[Dict[str, float]] = None
    appointments_by_doctor: Optional[Dict[str, int]] = None

class PerformanceMetricCreate(PerformanceMetricBase):
    pass

class PerformanceMetricUpdate(BaseModel):
    total_appointments: Optional[int] = None
    completed_appointments: Optional[int] = None
    cancelled_appointments: Optional[int] = None
    no_show_appointments: Optional[int] = None
    average_wait_time: Optional[int] = None
    average_consultation_time: Optional[int] = None
    new_patients: Optional[int] = None
    returning_patients: Optional[int] = None
    total_active_patients: Optional[int] = None
    total_revenue: Optional[Decimal] = None
    total_expenses: Optional[Decimal] = None
    net_profit: Optional[Decimal] = None
    accounts_receivable: Optional[Decimal] = None
    accounts_payable: Optional[Decimal] = None
    revenue_by_insurance: Optional[Dict[str, float]] = None
    procedures_by_insurance: Optional[Dict[str, int]] = None
    revenue_by_specialty: Optional[Dict[str, float]] = None
    appointments_by_specialty: Optional[Dict[str, int]] = None
    revenue_by_doctor: Optional[Dict[str, float]] = None
    appointments_by_doctor: Optional[Dict[str, int]] = None

class PerformanceMetric(PerformanceMetricBase):
    id: int
    clinic_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# BI Alert Schemas
class BIAlertBase(BaseModel):
    alert_type: str  # 'performance', 'financial', 'operational'
    severity: str  # 'low', 'medium', 'high', 'critical'
    title: str
    description: str
    metric_value: Optional[Decimal] = None
    threshold_value: Optional[Decimal] = None
    comparison_operator: Optional[str] = None  # '>', '<', '>=', '<=', '=', '!='
    is_active: bool = True
    is_resolved: bool = False

class BIAlertCreate(BIAlertBase):
    pass

class BIAlertUpdate(BaseModel):
    alert_type: Optional[str] = None
    severity: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    metric_value: Optional[Decimal] = None
    threshold_value: Optional[Decimal] = None
    comparison_operator: Optional[str] = None
    is_active: Optional[bool] = None
    is_resolved: Optional[bool] = None
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[int] = None

class BIAlert(BIAlertBase):
    id: int
    clinic_id: int
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Alert Configuration Schemas
class AlertConfigurationBase(BaseModel):
    alert_name: str
    metric_type: str
    threshold_value: Decimal
    comparison_operator: str
    notification_method: str = "dashboard"  # 'dashboard', 'email', 'sms'
    is_active: bool = True

class AlertConfigurationCreate(AlertConfigurationBase):
    pass

class AlertConfigurationUpdate(BaseModel):
    alert_name: Optional[str] = None
    metric_type: Optional[str] = None
    threshold_value: Optional[Decimal] = None
    comparison_operator: Optional[str] = None
    notification_method: Optional[str] = None
    is_active: Optional[bool] = None

class AlertConfiguration(AlertConfigurationBase):
    id: int
    clinic_id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Report Request Schemas
class ReportRequest(BaseModel):
    report_type: str  # 'administrative', 'financial', 'clinical', 'bi'
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    filters: Optional[Dict[str, Any]] = None
    format: str = "pdf"  # 'pdf', 'excel', 'csv'
    include_charts: bool = True

# Dashboard Data Schemas
class DashboardData(BaseModel):
    widgets: List[Dict[str, Any]]
    last_updated: datetime
    refresh_interval: int = 300

# KPI Schemas
class KPIValue(BaseModel):
    name: str
    value: float
    previous_value: Optional[float] = None
    change_percentage: Optional[float] = None
    trend: str = "stable"  # 'up', 'down', 'stable'
    format_type: str = "number"  # 'number', 'currency', 'percentage'
    color: str = "blue"  # 'green', 'red', 'blue', 'yellow'

class KPICollection(BaseModel):
    kpis: List[KPIValue]
    period: str
    last_updated: datetime

# Chart Data Schemas
class ChartDataPoint(BaseModel):
    label: str
    value: float
    color: Optional[str] = None

class ChartData(BaseModel):
    chart_type: str  # 'line', 'bar', 'pie', 'area', 'gauge'
    title: str
    data: List[ChartDataPoint]
    x_axis_label: Optional[str] = None
    y_axis_label: Optional[str] = None
    colors: Optional[List[str]] = None

# Analytics Schemas
class AnalyticsRequest(BaseModel):
    metric_type: str
    period: str  # 'daily', 'weekly', 'monthly', 'yearly'
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    group_by: Optional[List[str]] = None
    filters: Optional[Dict[str, Any]] = None

class AnalyticsResponse(BaseModel):
    metric_type: str
    period: str
    data: List[Dict[str, Any]]
    summary: Dict[str, Any]
    charts: List[ChartData]
    generated_at: datetime

# ============================================================================
# ETAPA 5B - ESTOQUE AMPLIADO
# ============================================================================

# Stock Inventory Schemas
class StockInventoryBase(BaseModel):
    inventory_date: date
    status: str = "planned"  # planned, in_progress, completed, cancelled
    notes: Optional[str] = None
    total_items_counted: int = 0
    total_discrepancies: int = 0
    total_adjustment_value: Decimal = 0

class StockInventoryCreate(StockInventoryBase):
    pass

class StockInventoryUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    total_items_counted: Optional[int] = None
    total_discrepancies: Optional[int] = None
    total_adjustment_value: Optional[Decimal] = None
    completed_at: Optional[datetime] = None
    completed_by: Optional[int] = None

class StockInventory(StockInventoryBase):
    id: int
    clinic_id: int
    created_by: int
    completed_at: Optional[datetime] = None
    completed_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Inventory Count Schemas
class InventoryCountBase(BaseModel):
    inventory_id: int
    product_id: int
    expected_quantity: Decimal
    counted_quantity: Decimal
    discrepancy: Decimal = 0
    unit_cost: Decimal
    total_cost_impact: Decimal = 0
    notes: Optional[str] = None
    counted_by: Optional[int] = None
    counted_at: Optional[datetime] = None

class InventoryCountCreate(InventoryCountBase):
    pass

class InventoryCountUpdate(BaseModel):
    counted_quantity: Optional[Decimal] = None
    discrepancy: Optional[Decimal] = None
    total_cost_impact: Optional[Decimal] = None
    notes: Optional[str] = None
    counted_by: Optional[int] = None
    counted_at: Optional[datetime] = None

class InventoryCount(InventoryCountBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Stock Alert Schemas
class StockAlertBase(BaseModel):
    product_id: int
    alert_type: str  # low_stock, expiring, expired, overstock
    severity: str = "medium"  # low, medium, high, critical
    message: str
    threshold_value: Optional[Decimal] = None
    current_value: Optional[Decimal] = None
    expiry_date: Optional[date] = None
    is_active: bool = True
    is_resolved: bool = False

class StockAlertCreate(StockAlertBase):
    pass

class StockAlertUpdate(BaseModel):
    severity: Optional[str] = None
    message: Optional[str] = None
    is_active: Optional[bool] = None
    is_resolved: Optional[bool] = None
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[int] = None
    resolution_notes: Optional[str] = None

class StockAlert(StockAlertBase):
    id: int
    clinic_id: int
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[int] = None
    resolution_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Stock Transfer Schemas
class StockTransferBase(BaseModel):
    from_location: str
    to_location: str
    transfer_date: date
    status: str = "pending"  # pending, in_transit, completed, cancelled
    notes: Optional[str] = None
    total_items: int = 0
    total_value: Decimal = 0

class StockTransferCreate(StockTransferBase):
    pass

class StockTransferUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    total_items: Optional[int] = None
    total_value: Optional[Decimal] = None
    completed_at: Optional[datetime] = None
    completed_by: Optional[int] = None

class StockTransfer(StockTransferBase):
    id: int
    clinic_id: int
    created_by: int
    completed_at: Optional[datetime] = None
    completed_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Stock Transfer Item Schemas
class StockTransferItemBase(BaseModel):
    transfer_id: int
    product_id: int
    batch_id: Optional[int] = None
    quantity: Decimal
    unit_cost: Decimal
    total_cost: Decimal
    notes: Optional[str] = None

class StockTransferItemCreate(StockTransferItemBase):
    pass

class StockTransferItemUpdate(BaseModel):
    quantity: Optional[Decimal] = None
    unit_cost: Optional[Decimal] = None
    total_cost: Optional[Decimal] = None
    notes: Optional[str] = None

class StockTransferItem(StockTransferItemBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Stock Adjustment Schemas
class StockAdjustmentBase(BaseModel):
    product_id: int
    batch_id: Optional[int] = None
    adjustment_type: str  # increase, decrease, correction
    reason: str  # damaged, expired, theft, correction, donation, etc.
    quantity_before: Decimal
    quantity_adjusted: Decimal
    quantity_after: Decimal
    unit_cost: Decimal
    total_cost_impact: Decimal
    notes: Optional[str] = None
    reference_document: Optional[str] = None

class StockAdjustmentCreate(StockAdjustmentBase):
    pass

class StockAdjustmentUpdate(BaseModel):
    reason: Optional[str] = None
    notes: Optional[str] = None
    reference_document: Optional[str] = None

class StockAdjustment(StockAdjustmentBase):
    id: int
    clinic_id: int
    created_by: int
    approved_by: Optional[int] = None
    approved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Stock Report Schemas
class StockInventoryReport(BaseModel):
    inventory_id: int
    total_products: int
    total_counted: int
    total_discrepancies: int
    discrepancy_percentage: float
    total_value_impact: Decimal
    items: List[InventoryCount]
    generated_at: datetime

class StockMovementReport(BaseModel):
    start_date: date
    end_date: date
    total_movements: int
    total_inbound: Decimal
    total_outbound: Decimal
    net_movement: Decimal
    movements_by_type: Dict[str, int]
    movements_by_product: List[Dict[str, Any]]
    generated_at: datetime

class StockValuationReport(BaseModel):
    valuation_date: date
    total_products: int
    total_quantity: Decimal
    total_value: Decimal
    average_unit_cost: Decimal
    valuation_by_category: List[Dict[str, Any]]
    valuation_by_location: List[Dict[str, Any]]
    expiring_items: List[Dict[str, Any]]
    generated_at: datetime

class StockAlertSummary(BaseModel):
    total_alerts: int
    active_alerts: int
    critical_alerts: int
    alerts_by_type: Dict[str, int]
    alerts_by_severity: Dict[str, int]
    recent_alerts: List[StockAlert]
    generated_at: datetime

# ============================================================================
# ETAPA 5B - ESTOQUE AMPLIADO - SCHEMAS ADICIONAIS
# ============================================================================

# Supplier Product Price Schemas
class SupplierProductPriceBase(BaseModel):
    supplier_id: int
    product_id: int
    price: Decimal
    minimum_quantity: int = 1
    lead_time_days: int = 7
    is_preferred: bool = False
    valid_from: date
    valid_until: Optional[date] = None
    currency: str = "BRL"
    payment_terms: Optional[str] = None
    notes: Optional[str] = None

class SupplierProductPriceCreate(SupplierProductPriceBase):
    pass

class SupplierProductPriceUpdate(BaseModel):
    price: Optional[Decimal] = None
    minimum_quantity: Optional[int] = None
    lead_time_days: Optional[int] = None
    is_preferred: Optional[bool] = None
    valid_until: Optional[date] = None
    payment_terms: Optional[str] = None
    notes: Optional[str] = None

class SupplierProductPrice(SupplierProductPriceBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Department Stock Level Schemas
class DepartmentStockLevelBase(BaseModel):
    department_id: int
    product_id: int
    current_stock: Decimal = 0
    minimum_stock: Decimal = 0
    maximum_stock: Decimal = 0
    reserved_stock: Decimal = 0
    available_stock: Decimal = 0
    average_consumption: Decimal = 0
    last_movement_date: Optional[datetime] = None

class DepartmentStockLevelCreate(DepartmentStockLevelBase):
    pass

class DepartmentStockLevelUpdate(BaseModel):
    current_stock: Optional[Decimal] = None
    minimum_stock: Optional[Decimal] = None
    maximum_stock: Optional[Decimal] = None
    reserved_stock: Optional[Decimal] = None
    average_consumption: Optional[Decimal] = None

class DepartmentStockLevel(DepartmentStockLevelBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Category Alert Schemas
class CategoryAlertBase(BaseModel):
    category_id: int
    alert_type: str  # low_stock_category, high_consumption, budget_exceeded
    threshold_value: Decimal
    current_value: Decimal
    severity: str = "medium"  # low, medium, high, critical
    message: str
    is_active: bool = True
    auto_resolve: bool = True

class CategoryAlertCreate(CategoryAlertBase):
    pass

class CategoryAlertUpdate(BaseModel):
    threshold_value: Optional[Decimal] = None
    severity: Optional[str] = None
    message: Optional[str] = None
    is_active: Optional[bool] = None
    auto_resolve: Optional[bool] = None

class CategoryAlert(CategoryAlertBase):
    id: int
    clinic_id: int
    resolved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Automatic Reorder Schemas
class AutomaticReorderBase(BaseModel):
    product_id: int
    supplier_id: int
    is_enabled: bool = True
    trigger_level: Decimal  # Nível que dispara o pedido
    order_quantity: Decimal  # Quantidade a ser pedida
    max_order_value: Optional[Decimal] = None
    frequency_days: int = 30  # Frequência máxima de pedidos
    last_order_date: Optional[date] = None
    conditions: Optional[Dict[str, Any]] = None  # Condições adicionais

class AutomaticReorderCreate(AutomaticReorderBase):
    pass

class AutomaticReorderUpdate(BaseModel):
    is_enabled: Optional[bool] = None
    trigger_level: Optional[Decimal] = None
    order_quantity: Optional[Decimal] = None
    max_order_value: Optional[Decimal] = None
    frequency_days: Optional[int] = None
    conditions: Optional[Dict[str, Any]] = None

class AutomaticReorder(AutomaticReorderBase):
    id: int
    clinic_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# ============================================================================
# ETAPA 7 - SEGURANÇA E LGPD - SCHEMAS ADICIONAIS
# ============================================================================

# Two Factor Auth Schemas
class TwoFactorAuthBase(BaseModel):
    user_id: int
    is_enabled: bool = False
    backup_codes: Optional[List[str]] = None

class TwoFactorAuthCreate(TwoFactorAuthBase):
    pass

class TwoFactorAuthUpdate(BaseModel):
    is_enabled: Optional[bool] = None
    backup_codes: Optional[List[str]] = None

class TwoFactorAuth(TwoFactorAuthBase):
    id: int
    secret_key: str
    last_used_at: Optional[datetime] = None
    is_configured: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# User Session Schemas
class UserSessionBase(BaseModel):
    user_id: int
    session_token: str
    ip_address: str
    user_agent: str
    device_info: Optional[Dict[str, Any]] = None
    location: Optional[str] = None
    is_active: bool = True
    expires_at: datetime

class UserSessionCreate(UserSessionBase):
    pass

class UserSessionUpdate(BaseModel):
    is_active: Optional[bool] = None
    last_activity: Optional[datetime] = None

class UserSession(UserSessionBase):
    id: int
    last_activity: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True

# Security Event Schemas
class SecurityEventBase(BaseModel):
    user_id: Optional[int] = None
    event_type: str  # login_success, login_failed, password_changed, etc.
    severity: str = "info"  # info, warning, error, critical
    description: str
    ip_address: str
    user_agent: Optional[str] = None
    additional_data: Optional[Dict[str, Any]] = None

class SecurityEventCreate(SecurityEventBase):
    pass

class SecurityEvent(SecurityEventBase):
    id: int
    clinic_id: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Data Encryption Schemas
class DataEncryptionBase(BaseModel):
    table_name: str
    record_id: int
    field_name: str
    encrypted_value: str
    encryption_algorithm: str = "AES-256"
    key_version: int = 1

class DataEncryptionCreate(DataEncryptionBase):
    pass

class DataEncryption(DataEncryptionBase):
    id: int
    clinic_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Access Control Schemas
class AccessControlBase(BaseModel):
    user_id: int
    resource_type: str  # patient, appointment, medical_record, etc.
    resource_id: int
    permission_level: str  # read, write, delete, admin
    granted_by: int
    expires_at: Optional[datetime] = None
    conditions: Optional[Dict[str, Any]] = None

class AccessControlCreate(AccessControlBase):
    pass

class AccessControlUpdate(BaseModel):
    permission_level: Optional[str] = None
    expires_at: Optional[datetime] = None
    conditions: Optional[Dict[str, Any]] = None

class AccessControl(AccessControlBase):
    id: int
    clinic_id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Login Attempt Schemas
class LoginAttemptBase(BaseModel):
    username: str
    ip_address: str
    user_agent: str
    success: bool
    failure_reason: Optional[str] = None
    location: Optional[str] = None

class LoginAttemptCreate(LoginAttemptBase):
    pass

class LoginAttempt(LoginAttemptBase):
    id: int
    user_id: Optional[int] = None
    clinic_id: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Password History Schemas
class PasswordHistoryBase(BaseModel):
    user_id: int
    password_hash: str
    created_by: Optional[int] = None

class PasswordHistoryCreate(PasswordHistoryBase):
    pass

class PasswordHistory(PasswordHistoryBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# API Key Schemas
class ApiKeyBase(BaseModel):
    user_id: int
    name: str
    key_hash: str
    permissions: List[str]
    rate_limit: int = 1000
    expires_at: Optional[datetime] = None
    is_active: bool = True

class ApiKeyCreate(ApiKeyBase):
    pass

class ApiKeyUpdate(BaseModel):
    name: Optional[str] = None
    permissions: Optional[List[str]] = None
    rate_limit: Optional[int] = None
    expires_at: Optional[datetime] = None
    is_active: Optional[bool] = None

class ApiKey(ApiKeyBase):
    id: int
    clinic_id: int
    last_used_at: Optional[datetime] = None
    usage_count: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# ============================================================================
# ETAPA 8 - EXTRAS TÉCNICOS - SCHEMAS
# ============================================================================

# External Integration Schemas
class ExternalIntegrationBase(BaseModel):
    integration_type: str  # datasus, laboratory, pacs, pharmacy, sms, email
    provider_name: str
    api_endpoint: Optional[str] = None
    configuration: Optional[Dict[str, Any]] = None
    is_active: bool = True

class ExternalIntegrationCreate(ExternalIntegrationBase):
    api_key: Optional[str] = None
    api_secret: Optional[str] = None

class ExternalIntegrationUpdate(BaseModel):
    provider_name: Optional[str] = None
    api_endpoint: Optional[str] = None
    api_key: Optional[str] = None
    api_secret: Optional[str] = None
    configuration: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

class ExternalIntegration(ExternalIntegrationBase):
    id: int
    clinic_id: int
    last_sync: Optional[datetime] = None
    sync_status: str
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Integration Sync Log Schemas
class IntegrationSyncLogBase(BaseModel):
    integration_id: int
    sync_type: str  # import, export, bidirectional
    status: str  # started, completed, failed
    records_processed: int = 0
    records_success: int = 0
    records_error: int = 0
    start_time: datetime
    end_time: Optional[datetime] = None
    error_details: Optional[Dict[str, Any]] = None

class IntegrationSyncLogCreate(IntegrationSyncLogBase):
    pass

class IntegrationSyncLogUpdate(BaseModel):
    status: Optional[str] = None
    records_processed: Optional[int] = None
    records_success: Optional[int] = None
    records_error: Optional[int] = None
    end_time: Optional[datetime] = None
    error_details: Optional[Dict[str, Any]] = None

class IntegrationSyncLog(IntegrationSyncLogBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Tenant Configuration Schemas
class TenantConfigurationBase(BaseModel):
    max_users: int = 10
    max_patients: int = 1000
    max_storage_gb: int = 5
    modules_enabled: Dict[str, bool]
    custom_fields: Optional[Dict[str, Any]] = None
    custom_workflows: Optional[Dict[str, Any]] = None
    branding_config: Optional[Dict[str, Any]] = None
    api_rate_limit: int = 1000
    webhook_endpoints: Optional[List[str]] = None
    backup_frequency: str = "daily"
    backup_retention_days: int = 30

class TenantConfigurationCreate(TenantConfigurationBase):
    pass

class TenantConfigurationUpdate(BaseModel):
    max_users: Optional[int] = None
    max_patients: Optional[int] = None
    max_storage_gb: Optional[int] = None
    modules_enabled: Optional[Dict[str, bool]] = None
    custom_fields: Optional[Dict[str, Any]] = None
    custom_workflows: Optional[Dict[str, Any]] = None
    branding_config: Optional[Dict[str, Any]] = None
    api_rate_limit: Optional[int] = None
    webhook_endpoints: Optional[List[str]] = None
    backup_frequency: Optional[str] = None
    backup_retention_days: Optional[int] = None

class TenantConfiguration(TenantConfigurationBase):
    id: int
    clinic_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# System Notification Schemas
class SystemNotificationBase(BaseModel):
    notification_type: str  # system_update, maintenance, security_alert, feature_announcement
    priority: str = "normal"  # low, normal, high, critical
    title: str
    message: str
    action_url: Optional[str] = None
    expires_at: Optional[datetime] = None

class SystemNotificationCreate(SystemNotificationBase):
    clinic_id: Optional[int] = None
    user_id: Optional[int] = None

class SystemNotificationUpdate(BaseModel):
    is_read: Optional[bool] = None
    is_dismissed: Optional[bool] = None

class SystemNotification(SystemNotificationBase):
    id: int
    clinic_id: Optional[int] = None
    user_id: Optional[int] = None
    is_read: bool
    is_dismissed: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Webhook Event Schemas
class WebhookEventBase(BaseModel):
    event_type: str  # patient_created, appointment_scheduled, payment_received
    payload: Dict[str, Any]
    webhook_url: str
    max_attempts: int = 3

class WebhookEventCreate(WebhookEventBase):
    pass

class WebhookEventUpdate(BaseModel):
    status: Optional[str] = None
    attempts: Optional[int] = None
    response_code: Optional[int] = None
    response_body: Optional[str] = None

class WebhookEvent(WebhookEventBase):
    id: int
    clinic_id: int
    status: str
    attempts: int
    last_attempt: Optional[datetime] = None
    response_code: Optional[int] = None
    response_body: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Feature Flag Schemas
class FeatureFlagBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_enabled: bool = False
    rollout_percentage: int = 0
    target_clinics: Optional[List[int]] = None
    target_users: Optional[List[int]] = None
    conditions: Optional[Dict[str, Any]] = None

class FeatureFlagCreate(FeatureFlagBase):
    pass

class FeatureFlagUpdate(BaseModel):
    description: Optional[str] = None
    is_enabled: Optional[bool] = None
    rollout_percentage: Optional[int] = None
    target_clinics: Optional[List[int]] = None
    target_users: Optional[List[int]] = None
    conditions: Optional[Dict[str, Any]] = None

class FeatureFlag(FeatureFlagBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# System Metrics Schemas
class SystemMetricsBase(BaseModel):
    metric_date: date
    total_clinics: int = 0
    active_clinics: int = 0
    total_users: int = 0
    active_users: int = 0
    total_patients: int = 0
    avg_response_time_ms: int = 0
    total_requests: int = 0
    error_rate_percentage: Decimal = 0
    storage_used_gb: Decimal = 0
    bandwidth_used_gb: Decimal = 0
    api_calls_count: int = 0

class SystemMetricsCreate(SystemMetricsBase):
    pass

class SystemMetricsUpdate(BaseModel):
    total_clinics: Optional[int] = None
    active_clinics: Optional[int] = None
    total_users: Optional[int] = None
    active_users: Optional[int] = None
    total_patients: Optional[int] = None
    avg_response_time_ms: Optional[int] = None
    total_requests: Optional[int] = None
    error_rate_percentage: Optional[Decimal] = None
    storage_used_gb: Optional[Decimal] = None
    bandwidth_used_gb: Optional[Decimal] = None
    api_calls_count: Optional[int] = None

class SystemMetrics(SystemMetricsBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# ============================================================================
# TELEMEDICINA - SCHEMAS
# ============================================================================

# Telemedicine Room Schemas
class TelemedicineRoomBase(BaseModel):
    room_name: str
    room_type: str = "consultation"  # consultation, group_session, training
    max_participants: int = 2
    is_recording_enabled: bool = False
    is_chat_enabled: bool = True
    is_screen_share_enabled: bool = True
    waiting_room_enabled: bool = True
    password_protected: bool = False
    room_password: Optional[str] = None
    scheduled_start: Optional[datetime] = None
    scheduled_end: Optional[datetime] = None
    settings: Optional[Dict[str, Any]] = None

class TelemedicineRoomCreate(TelemedicineRoomBase):
    pass

class TelemedicineRoomUpdate(BaseModel):
    room_name: Optional[str] = None
    max_participants: Optional[int] = None
    is_recording_enabled: Optional[bool] = None
    is_chat_enabled: Optional[bool] = None
    is_screen_share_enabled: Optional[bool] = None
    waiting_room_enabled: Optional[bool] = None
    password_protected: Optional[bool] = None
    room_password: Optional[str] = None
    scheduled_start: Optional[datetime] = None
    scheduled_end: Optional[datetime] = None
    settings: Optional[Dict[str, Any]] = None
    status: Optional[str] = None

class TelemedicineRoom(TelemedicineRoomBase):
    id: int
    clinic_id: int
    room_id: str
    status: str
    created_by: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Teleconsultation Schemas
class TeleconsultationBase(BaseModel):
    patient_id: int
    doctor_id: int
    appointment_id: Optional[int] = None
    consultation_type: str = "video"  # video, audio, chat
    scheduled_datetime: datetime
    duration_minutes: int = 30
    consultation_notes: Optional[str] = None
    diagnosis: Optional[str] = None
    treatment_plan: Optional[str] = None
    follow_up_required: bool = False
    follow_up_date: Optional[datetime] = None
    prescription_issued: bool = False
    recording_url: Optional[str] = None
    chat_transcript: Optional[str] = None

class TeleconsultationCreate(TeleconsultationBase):
    pass

class TeleconsultationUpdate(BaseModel):
    scheduled_datetime: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    consultation_notes: Optional[str] = None
    diagnosis: Optional[str] = None
    treatment_plan: Optional[str] = None
    follow_up_required: Optional[bool] = None
    follow_up_date: Optional[datetime] = None
    prescription_issued: Optional[bool] = None
    recording_url: Optional[str] = None
    chat_transcript: Optional[str] = None
    status: Optional[str] = None
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None

class Teleconsultation(TeleconsultationBase):
    id: int
    clinic_id: int
    room_id: Optional[int] = None
    status: str
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Teleconsultation Participant Schemas
class TeleconsultationParticipantBase(BaseModel):
    user_id: Optional[int] = None
    participant_name: str
    participant_email: Optional[str] = None
    participant_type: str  # doctor, patient, observer, assistant
    join_time: Optional[datetime] = None
    leave_time: Optional[datetime] = None
    connection_quality: Optional[str] = None
    device_info: Optional[Dict[str, Any]] = None

class TeleconsultationParticipantCreate(TeleconsultationParticipantBase):
    teleconsultation_id: int

class TeleconsultationParticipantUpdate(BaseModel):
    join_time: Optional[datetime] = None
    leave_time: Optional[datetime] = None
    connection_quality: Optional[str] = None
    device_info: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

class TeleconsultationParticipant(TeleconsultationParticipantBase):
    id: int
    teleconsultation_id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Shared Document Schemas
class SharedDocumentBase(BaseModel):
    document_name: str
    document_type: str  # pdf, image, video, audio, text
    file_path: str
    file_size: int
    mime_type: str
    description: Optional[str] = None
    is_patient_accessible: bool = True
    access_permissions: Optional[Dict[str, Any]] = None
    expires_at: Optional[datetime] = None

class SharedDocumentCreate(SharedDocumentBase):
    teleconsultation_id: int
    uploaded_by: int

class SharedDocumentUpdate(BaseModel):
    document_name: Optional[str] = None
    description: Optional[str] = None
    is_patient_accessible: Optional[bool] = None
    access_permissions: Optional[Dict[str, Any]] = None
    expires_at: Optional[datetime] = None
    is_active: Optional[bool] = None

class SharedDocument(SharedDocumentBase):
    id: int
    teleconsultation_id: int
    uploaded_by: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Remote Monitoring Schemas
class RemoteMonitoringBase(BaseModel):
    patient_id: int
    monitoring_type: str  # vital_signs, medication_adherence, symptoms, activity
    frequency: str = "daily"  # hourly, daily, weekly, as_needed
    start_date: date
    end_date: Optional[date] = None
    target_values: Optional[Dict[str, Any]] = None
    alert_thresholds: Optional[Dict[str, Any]] = None
    instructions: Optional[str] = None
    device_integration: Optional[Dict[str, Any]] = None

class RemoteMonitoringCreate(RemoteMonitoringBase):
    assigned_by: int

class RemoteMonitoringUpdate(BaseModel):
    frequency: Optional[str] = None
    end_date: Optional[date] = None
    target_values: Optional[Dict[str, Any]] = None
    alert_thresholds: Optional[Dict[str, Any]] = None
    instructions: Optional[str] = None
    device_integration: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

class RemoteMonitoring(RemoteMonitoringBase):
    id: int
    clinic_id: int
    assigned_by: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Vital Sign Reading Schemas
class VitalSignReadingBase(BaseModel):
    reading_type: str  # blood_pressure, heart_rate, temperature, weight, glucose, oxygen_saturation
    value: str
    unit: str
    reading_datetime: datetime
    device_used: Optional[str] = None
    notes: Optional[str] = None
    is_manual_entry: bool = True
    location: Optional[str] = None
    quality_score: Optional[int] = None

class VitalSignReadingCreate(VitalSignReadingBase):
    monitoring_id: int

class VitalSignReadingUpdate(BaseModel):
    value: Optional[str] = None
    notes: Optional[str] = None
    quality_score: Optional[int] = None
    is_verified: Optional[bool] = None

class VitalSignReading(VitalSignReadingBase):
    id: int
    monitoring_id: int
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Medication Adherence Log Schemas
class MedicationAdherenceLogBase(BaseModel):
    medication_name: str
    prescribed_dosage: str
    scheduled_time: datetime
    actual_time: Optional[datetime] = None
    dosage_taken: Optional[str] = None
    adherence_status: str = "pending"  # pending, taken, missed, partial
    notes: Optional[str] = None
    side_effects: Optional[str] = None
    reminder_sent: bool = False

class MedicationAdherenceLogCreate(MedicationAdherenceLogBase):
    monitoring_id: int

class MedicationAdherenceLogUpdate(BaseModel):
    actual_time: Optional[datetime] = None
    dosage_taken: Optional[str] = None
    adherence_status: Optional[str] = None
    notes: Optional[str] = None
    side_effects: Optional[str] = None
    reminder_sent: Optional[bool] = None

class MedicationAdherenceLog(MedicationAdherenceLogBase):
    id: int
    monitoring_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Digital Prescription Schemas
class DigitalPrescriptionBase(BaseModel):
    patient_id: int
    doctor_id: int
    prescription_date: datetime
    diagnosis: str
    instructions: Optional[str] = None
    valid_until: Optional[datetime] = None
    pharmacy_id: Optional[int] = None
    digital_signature: Optional[str] = None
    qr_code: Optional[str] = None
    is_controlled_substance: bool = False
    refills_allowed: int = 0
    refills_used: int = 0

class DigitalPrescriptionCreate(DigitalPrescriptionBase):
    teleconsultation_id: Optional[int] = None

class DigitalPrescriptionUpdate(BaseModel):
    instructions: Optional[str] = None
    valid_until: Optional[datetime] = None
    pharmacy_id: Optional[int] = None
    refills_used: Optional[int] = None
    status: Optional[str] = None
    dispensed_at: Optional[datetime] = None

class DigitalPrescription(DigitalPrescriptionBase):
    id: int
    clinic_id: int
    teleconsultation_id: Optional[int] = None
    prescription_number: str
    status: str
    dispensed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Digital Prescription Medication Schemas
class DigitalPrescriptionMedicationBase(BaseModel):
    medication_name: str
    dosage: str
    frequency: str
    duration: str
    quantity: int
    unit: str
    instructions: Optional[str] = None
    generic_substitution_allowed: bool = True

class DigitalPrescriptionMedicationCreate(DigitalPrescriptionMedicationBase):
    prescription_id: int

class DigitalPrescriptionMedicationUpdate(BaseModel):
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None
    quantity: Optional[int] = None
    instructions: Optional[str] = None
    generic_substitution_allowed: Optional[bool] = None

class DigitalPrescriptionMedication(DigitalPrescriptionMedicationBase):
    id: int
    prescription_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Companion Schemas
class CompanionBase(BaseModel):
    patient_id: int
    name: str
    relationship_type: str  # spouse, parent, child, sibling, friend, caregiver
    phone: Optional[str] = None
    email: Optional[str] = None
    emergency_contact: bool = False
    can_receive_information: bool = False
    can_make_decisions: bool = False
    identification_type: str  # cpf, rg, passport, cnh
    identification_number: str
    birth_date: Optional[date] = None
    address: Optional[str] = None
    notes: Optional[str] = None

class CompanionCreate(CompanionBase):
    pass

class CompanionUpdate(BaseModel):
    name: Optional[str] = None
    relationship_type: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    emergency_contact: Optional[bool] = None
    can_receive_information: Optional[bool] = None
    can_make_decisions: Optional[bool] = None
    identification_type: Optional[str] = None
    identification_number: Optional[str] = None
    birth_date: Optional[date] = None
    address: Optional[str] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None

class Companion(CompanionBase):
    id: int
    clinic_id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Visitor Schemas
class VisitorBase(BaseModel):
    name: str
    identification_type: str  # cpf, rg, passport, cnh
    identification_number: str
    phone: Optional[str] = None
    relationship_to_patient: Optional[str] = None
    photo_path: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    special_needs: Optional[str] = None
    is_frequent_visitor: bool = False

class VisitorCreate(VisitorBase):
    pass

class VisitorUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    relationship_to_patient: Optional[str] = None
    photo_path: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    special_needs: Optional[str] = None
    is_frequent_visitor: Optional[bool] = None
    is_active: Optional[bool] = None

class Visitor(VisitorBase):
    id: int
    clinic_id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Visitor Entry Schemas
class VisitorEntryBase(BaseModel):
    patient_id: int
    purpose: str  # visit, consultation_support, emergency, delivery
    authorized_by: Optional[int] = None  # staff member who authorized
    badge_number: Optional[str] = None
    entry_notes: Optional[str] = None
    exit_notes: Optional[str] = None
    temperature_check: Optional[float] = None
    health_screening_passed: bool = True
    items_brought: Optional[str] = None
    escort_required: bool = False
    escort_staff_id: Optional[int] = None

class VisitorEntryCreate(VisitorEntryBase):
    visitor_id: int

class VisitorEntryUpdate(BaseModel):
    exit_time: Optional[datetime] = None
    exit_notes: Optional[str] = None
    status: Optional[str] = None

class VisitorEntry(VisitorEntryBase):
    id: int
    clinic_id: int
    visitor_id: int
    entry_time: datetime
    exit_time: Optional[datetime] = None
    status: str  # entered, exited, overstayed
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Visiting Hours Schemas
class VisitingHoursBase(BaseModel):
    day_of_week: int  # 0=Monday, 6=Sunday
    start_time: time
    end_time: time
    max_visitors_per_patient: int = 2
    special_restrictions: Optional[str] = None
    applies_to_department: Optional[str] = None
    holiday_schedule: bool = False

class VisitingHoursCreate(VisitingHoursBase):
    pass

class VisitingHoursUpdate(BaseModel):
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    max_visitors_per_patient: Optional[int] = None
    special_restrictions: Optional[str] = None
    applies_to_department: Optional[str] = None
    holiday_schedule: Optional[bool] = None
    is_active: Optional[bool] = None

class VisitingHours(VisitingHoursBase):
    id: int
    clinic_id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Medical Device Schemas
class MedicalDeviceBase(BaseModel):
    device_name: str
    device_type: str  # monitor, pump, ventilator, analyzer, scanner
    manufacturer: str
    model: str
    serial_number: str
    department_id: Optional[int] = None
    location: Optional[str] = None
    installation_date: Optional[date] = None
    last_maintenance: Optional[date] = None
    next_maintenance: Optional[date] = None
    calibration_due: Optional[date] = None
    warranty_expires: Optional[date] = None
    specifications: Optional[Dict[str, Any]] = None
    communication_protocol: Optional[str] = None  # HL7, DICOM, TCP/IP, Serial
    ip_address: Optional[str] = None
    port: Optional[int] = None
    connection_string: Optional[str] = None

class MedicalDeviceCreate(MedicalDeviceBase):
    pass

class MedicalDeviceUpdate(BaseModel):
    device_name: Optional[str] = None
    location: Optional[str] = None
    last_maintenance: Optional[date] = None
    next_maintenance: Optional[date] = None
    calibration_due: Optional[date] = None
    specifications: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    port: Optional[int] = None
    connection_string: Optional[str] = None
    status: Optional[str] = None
    is_active: Optional[bool] = None

class MedicalDevice(MedicalDeviceBase):
    id: int
    clinic_id: int
    status: str  # active, maintenance, offline, error
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Device Reading Schemas
class DeviceReadingBase(BaseModel):
    reading_type: str
    value: str
    unit: str
    reading_timestamp: datetime
    patient_id: Optional[int] = None
    raw_data: Optional[Dict[str, Any]] = None
    quality_indicators: Optional[Dict[str, Any]] = None
    calibration_offset: Optional[float] = None
    environmental_conditions: Optional[Dict[str, Any]] = None
    operator_id: Optional[int] = None
    notes: Optional[str] = None

class DeviceReadingCreate(DeviceReadingBase):
    device_id: int

class DeviceReadingUpdate(BaseModel):
    notes: Optional[str] = None
    is_validated: Optional[bool] = None
    validation_notes: Optional[str] = None

class DeviceReading(DeviceReadingBase):
    id: int
    device_id: int
    is_validated: bool
    validation_notes: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Device Integration Schemas
class DeviceIntegrationBase(BaseModel):
    integration_name: str
    integration_type: str  # hl7, dicom, api, serial, tcp
    endpoint_url: Optional[str] = None
    authentication_method: Optional[str] = None
    credentials: Optional[Dict[str, Any]] = None
    message_format: Optional[str] = None
    polling_interval: Optional[int] = None  # seconds
    retry_attempts: int = 3
    timeout_seconds: int = 30
    data_mapping: Optional[Dict[str, Any]] = None
    filters: Optional[Dict[str, Any]] = None
    transformation_rules: Optional[Dict[str, Any]] = None

class DeviceIntegrationCreate(DeviceIntegrationBase):
    device_id: int

class DeviceIntegrationUpdate(BaseModel):
    endpoint_url: Optional[str] = None
    credentials: Optional[Dict[str, Any]] = None
    polling_interval: Optional[int] = None
    retry_attempts: Optional[int] = None
    timeout_seconds: Optional[int] = None
    data_mapping: Optional[Dict[str, Any]] = None
    filters: Optional[Dict[str, Any]] = None
    transformation_rules: Optional[Dict[str, Any]] = None
    status: Optional[str] = None
    is_active: Optional[bool] = None

class DeviceIntegration(DeviceIntegrationBase):
    id: int
    device_id: int
    status: str  # active, inactive, error, testing
    last_sync: Optional[datetime] = None
    sync_count: int
    error_count: int
    last_error: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Predictive Model Schemas
class PredictiveModelBase(BaseModel):
    model_name: str
    model_type: str  # classification, regression, clustering, time_series
    description: Optional[str] = None
    algorithm: str  # random_forest, neural_network, svm, linear_regression
    target_variable: str
    features: List[str]
    training_data_period: Optional[str] = None
    model_parameters: Optional[Dict[str, Any]] = None
    performance_metrics: Optional[Dict[str, Any]] = None
    validation_method: Optional[str] = None
    last_trained: Optional[datetime] = None
    next_retrain: Optional[datetime] = None
    model_file_path: Optional[str] = None

class PredictiveModelCreate(PredictiveModelBase):
    created_by: int

class PredictiveModelUpdate(BaseModel):
    description: Optional[str] = None
    model_parameters: Optional[Dict[str, Any]] = None
    performance_metrics: Optional[Dict[str, Any]] = None
    last_trained: Optional[datetime] = None
    next_retrain: Optional[datetime] = None
    model_file_path: Optional[str] = None
    status: Optional[str] = None
    is_active: Optional[bool] = None

class PredictiveModel(PredictiveModelBase):
    id: int
    clinic_id: int
    created_by: int
    version: str
    status: str  # training, active, deprecated, error
    accuracy_score: Optional[float] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Model Prediction Schemas
class ModelPredictionBase(BaseModel):
    patient_id: Optional[int] = None
    input_data: Dict[str, Any]
    prediction_result: Dict[str, Any]
    confidence_score: Optional[float] = None
    prediction_date: datetime
    context: Optional[str] = None
    feedback_received: Optional[bool] = None
    actual_outcome: Optional[str] = None
    outcome_date: Optional[datetime] = None

class ModelPredictionCreate(ModelPredictionBase):
    model_id: int
    requested_by: int

class ModelPredictionUpdate(BaseModel):
    feedback_received: Optional[bool] = None
    actual_outcome: Optional[str] = None
    outcome_date: Optional[datetime] = None
    notes: Optional[str] = None

class ModelPrediction(ModelPredictionBase):
    id: int
    model_id: int
    requested_by: int
    notes: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Patient Satisfaction Survey Schemas
class PatientSatisfactionSurveyBase(BaseModel):
    patient_id: int
    survey_type: str  # post_consultation, discharge, general, telemedicine
    survey_date: datetime
    overall_rating: int  # 1-5 scale
    wait_time_rating: Optional[int] = None
    staff_courtesy_rating: Optional[int] = None
    facility_cleanliness_rating: Optional[int] = None
    communication_rating: Optional[int] = None
    treatment_effectiveness_rating: Optional[int] = None
    would_recommend: Optional[bool] = None
    comments: Optional[str] = None
    suggestions: Optional[str] = None
    contact_permission: bool = False
    survey_method: str = "digital"  # digital, paper, phone, in_person

class PatientSatisfactionSurveyCreate(PatientSatisfactionSurveyBase):
    appointment_id: Optional[int] = None

class PatientSatisfactionSurveyUpdate(BaseModel):
    overall_rating: Optional[int] = None
    wait_time_rating: Optional[int] = None
    staff_courtesy_rating: Optional[int] = None
    facility_cleanliness_rating: Optional[int] = None
    communication_rating: Optional[int] = None
    treatment_effectiveness_rating: Optional[int] = None
    would_recommend: Optional[bool] = None
    comments: Optional[str] = None
    suggestions: Optional[str] = None
    contact_permission: Optional[bool] = None

class PatientSatisfactionSurvey(PatientSatisfactionSurveyBase):
    id: int
    clinic_id: int
    appointment_id: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Diagnostic Pattern Schemas
class DiagnosticPatternBase(BaseModel):
    pattern_name: str
    pattern_type: str  # symptom_cluster, lab_pattern, imaging_pattern, temporal_pattern
    description: Optional[str] = None
    conditions: List[str]  # Associated medical conditions
    symptoms: Optional[List[str]] = None
    lab_values: Optional[Dict[str, Any]] = None
    demographic_factors: Optional[Dict[str, Any]] = None
    temporal_factors: Optional[Dict[str, Any]] = None
    confidence_threshold: float = 0.7
    support_count: int = 0  # Number of cases supporting this pattern
    accuracy_rate: Optional[float] = None
    last_validated: Optional[datetime] = None

class DiagnosticPatternCreate(DiagnosticPatternBase):
    discovered_by: int

class DiagnosticPatternUpdate(BaseModel):
    description: Optional[str] = None
    conditions: Optional[List[str]] = None
    symptoms: Optional[List[str]] = None
    lab_values: Optional[Dict[str, Any]] = None
    demographic_factors: Optional[Dict[str, Any]] = None
    temporal_factors: Optional[Dict[str, Any]] = None
    confidence_threshold: Optional[float] = None
    support_count: Optional[int] = None
    accuracy_rate: Optional[float] = None
    last_validated: Optional[datetime] = None
    status: Optional[str] = None
    is_active: Optional[bool] = None

class DiagnosticPattern(DiagnosticPatternBase):
    id: int
    clinic_id: int
    discovered_by: int
    status: str  # discovered, validated, deprecated, under_review
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Scheduling Optimization Schemas
class SchedulingOptimizationBase(BaseModel):
    optimization_type: str  # daily, weekly, monthly, resource_allocation
    target_date: date
    parameters: Dict[str, Any]  # Optimization parameters
    constraints: Optional[Dict[str, Any]] = None
    objectives: List[str]  # minimize_wait_time, maximize_utilization, balance_workload
    current_schedule: Optional[Dict[str, Any]] = None
    optimized_schedule: Optional[Dict[str, Any]] = None
    improvement_metrics: Optional[Dict[str, Any]] = None
    execution_time_seconds: Optional[float] = None
    algorithm_used: Optional[str] = None

class SchedulingOptimizationCreate(SchedulingOptimizationBase):
    requested_by: int

class SchedulingOptimizationUpdate(BaseModel):
    optimized_schedule: Optional[Dict[str, Any]] = None
    improvement_metrics: Optional[Dict[str, Any]] = None
    execution_time_seconds: Optional[float] = None
    status: Optional[str] = None
    applied_at: Optional[datetime] = None

class SchedulingOptimization(SchedulingOptimizationBase):
    id: int
    clinic_id: int
    requested_by: int
    status: str  # pending, running, completed, failed, applied
    applied_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True