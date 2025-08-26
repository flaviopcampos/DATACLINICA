from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey, Date, Numeric, JSON, Time, UniqueConstraint
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class Clinic(Base):
    __tablename__ = "clinics"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    cnpj = Column(String, unique=True, index=True)
    phone = Column(String)
    email = Column(String)
    address = Column(Text)
    city = Column(String)
    state = Column(String)
    zip_code = Column(String)
    logo_url = Column(String)  # URL do logo da clínica
    theme_color = Column(String, default="#3B82F6")  # Cor do tema
    is_active = Column(Boolean, default=True)
    subscription_plan = Column(String, default="basic")  # basic, premium, enterprise
    max_users = Column(Integer, default=10)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    users = relationship("User", back_populates="clinic")
    patients = relationship("Patient", back_populates="clinic")
    suppliers = relationship("Supplier", back_populates="clinic")
    
# Primeira definição removida - mantendo apenas a definição no final do arquivo

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(String)  # admin, medico, enfermeiro, financeiro
    is_active = Column(Boolean, default=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"))  # Suporte multiempresa
    phone = Column(String)
    cpf = Column(String, unique=True)
    professional_license = Column(String)  # CRM, COREN, etc.
    specialty = Column(String)  # Para médicos e enfermeiros
    last_login = Column(DateTime)
    failed_login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    clinic = relationship("Clinic", back_populates="users")
    audit_logs = relationship("AuditLog", back_populates="user")
    two_factor_auth = relationship("TwoFactorAuth", back_populates="user", uselist=False)
    
class Patient(Base):
    __tablename__ = "patients"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"))  # Suporte multiempresa
    cpf = Column(String, index=True)  # Removido unique para permitir mesmo CPF em clínicas diferentes
    name = Column(String, index=True)
    birth_date = Column(Date)
    gender = Column(String)
    phone = Column(String)
    email = Column(String)
    address = Column(Text)
    city = Column(String)
    state = Column(String)
    zip_code = Column(String)
    emergency_contact = Column(String)
    emergency_phone = Column(String)
    blood_type = Column(String)
    allergies = Column(Text)
    comorbidities = Column(Text)
    insurance_plan_id = Column(Integer, ForeignKey("insurance_plans.id"))
    insurance_number = Column(String)
    # Campos para documentos
    rg_number = Column(String)
    rg_issuer = Column(String)
    mother_name = Column(String)
    father_name = Column(String)
    marital_status = Column(String)
    profession = Column(String)
    # Campos LGPD
    lgpd_consent = Column(Boolean, default=False)
    lgpd_consent_date = Column(DateTime)
    data_sharing_consent = Column(Boolean, default=False)
    marketing_consent = Column(Boolean, default=False)
    # Campos de controle
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    clinic = relationship("Clinic", back_populates="patients")
    insurance_plan = relationship("InsurancePlan", back_populates="patients")
    appointments = relationship("Appointment", back_populates="patient")
    medical_records = relationship("MedicalRecord", back_populates="patient")
    documents = relationship("PatientDocument", back_populates="patient")

class PatientDocument(Base):
    __tablename__ = "patient_documents"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    document_type = Column(String)  # RG, CPF, CNH, exame, foto, etc.
    file_name = Column(String)
    file_path = Column(String)
    file_size = Column(Integer)
    mime_type = Column(String)
    uploaded_by = Column(Integer, ForeignKey("users.id"))
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    patient = relationship("Patient", back_populates="documents")
    uploader = relationship("User")

class Doctor(Base):
    __tablename__ = "doctors"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"))
    user_id = Column(Integer, ForeignKey("users.id"))  # Relaciona com usuário do sistema
    name = Column(String, index=True)
    cpf = Column(String, unique=True)
    crm = Column(String, unique=True, index=True)
    crm_state = Column(String)  # Estado do CRM
    specialty = Column(String)
    subspecialty = Column(String)
    phone = Column(String)
    email = Column(String)
    address = Column(Text)
    birth_date = Column(Date)
    commission_percentage = Column(Numeric(5, 2))  # Percentual de repasse
    pix_key = Column(String)  # Chave PIX para repasses
    bank_account = Column(String)  # Dados bancários
    digital_signature = Column(Text)  # Assinatura digital
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    user = relationship("User")
    appointments = relationship("Appointment", back_populates="doctor")
    medical_records = relationship("MedicalRecord", back_populates="doctor")

# Modelos para prontuário eletrônico (ETAPA 3)
class MedicalRecordTemplate(Base):
    __tablename__ = "medical_record_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"))
    name = Column(String, index=True)
    specialty = Column(String)
    template_type = Column(String)  # anamnese, evolucao, prescricao, atestado
    fields_config = Column(JSON)  # Configuração dos campos personalizáveis
    is_active = Column(Boolean, default=True)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    creator = relationship("User")
    medical_records = relationship("MedicalRecord", back_populates="template")

class CidDiagnosis(Base):
    __tablename__ = "cid_diagnoses"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)  # Código CID-10
    description = Column(Text)
    category = Column(String)
    subcategory = Column(String)
    is_active = Column(Boolean, default=True)
    
    # Relacionamentos
    medical_records = relationship("MedicalRecordDiagnosis", back_populates="diagnosis")

class MedicalRecordDiagnosis(Base):
    __tablename__ = "medical_record_diagnoses"
    
    id = Column(Integer, primary_key=True, index=True)
    medical_record_id = Column(Integer, ForeignKey("medical_records.id"))
    diagnosis_id = Column(Integer, ForeignKey("cid_diagnoses.id"))
    diagnosis_type = Column(String)  # principal, secundario, suspeita
    notes = Column(Text)
    
    # Relacionamentos
    medical_record = relationship("MedicalRecord", back_populates="diagnoses")
    diagnosis = relationship("CidDiagnosis", back_populates="medical_records")

class Prescription(Base):
    __tablename__ = "prescriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    medical_record_id = Column(Integer, ForeignKey("medical_records.id"))
    patient_id = Column(Integer, ForeignKey("patients.id"))
    doctor_id = Column(Integer, ForeignKey("doctors.id"))
    prescription_number = Column(String, unique=True, index=True)
    prescription_type = Column(String)  # receita, atestado, laudo, encaminhamento
    content = Column(Text)
    validity_days = Column(Integer, default=30)
    digital_signature = Column(Text)  # Assinatura digital
    signature_certificate = Column(String)  # Certificado usado
    is_controlled = Column(Boolean, default=False)
    status = Column(String, default="active")  # active, cancelled, expired
    issued_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)
    
    # Relacionamentos
    medical_record = relationship("MedicalRecord", back_populates="prescriptions")
    patient = relationship("Patient")
    doctor = relationship("Doctor")
    medications = relationship("PrescriptionMedication", back_populates="prescription")

class PrescriptionMedication(Base):
    __tablename__ = "prescription_medications"
    
    id = Column(Integer, primary_key=True, index=True)
    prescription_id = Column(Integer, ForeignKey("prescriptions.id"))
    medication_name = Column(String)
    dosage = Column(String)
    frequency = Column(String)
    duration = Column(String)
    quantity = Column(String)
    instructions = Column(Text)
    is_generic = Column(Boolean, default=False)
    
    # Relacionamentos
    prescription = relationship("Prescription", back_populates="medications")

class MedicalDocument(Base):
    __tablename__ = "medical_documents"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    doctor_id = Column(Integer, ForeignKey("doctors.id"))
    medical_record_id = Column(Integer, ForeignKey("medical_records.id"))
    document_type = Column(String)  # atestado, laudo, encaminhamento, exame
    title = Column(String)
    content = Column(Text)
    file_path = Column(String)
    file_name = Column(String)
    file_size = Column(Integer)
    mime_type = Column(String)
    digital_signature = Column(Text)
    signature_certificate = Column(String)
    is_signed = Column(Boolean, default=False)
    status = Column(String, default="draft")  # draft, signed, cancelled
    created_at = Column(DateTime, default=datetime.utcnow)
    signed_at = Column(DateTime)
    
    # Relacionamentos
    patient = relationship("Patient")
    doctor = relationship("Doctor")
    medical_record = relationship("MedicalRecord", back_populates="documents")

class Anamnesis(Base):
    __tablename__ = "anamneses"
    
    id = Column(Integer, primary_key=True, index=True)
    medical_record_id = Column(Integer, ForeignKey("medical_records.id"))
    chief_complaint = Column(Text)  # Queixa principal
    history_present_illness = Column(Text)  # História da doença atual
    past_medical_history = Column(Text)  # Antecedentes pessoais
    family_history = Column(Text)  # Antecedentes familiares
    social_history = Column(Text)  # História social
    medications = Column(Text)  # Medicações em uso
    allergies = Column(Text)  # Alergias
    review_of_systems = Column(JSON)  # Revisão de sistemas (estruturado)
    custom_fields = Column(JSON)  # Campos personalizáveis
    
    # Relacionamentos
    medical_record = relationship("MedicalRecord", back_populates="anamnesis")

class PhysicalExam(Base):
    __tablename__ = "physical_exams"
    
    id = Column(Integer, primary_key=True, index=True)
    medical_record_id = Column(Integer, ForeignKey("medical_records.id"))
    general_appearance = Column(Text)
    vital_signs = Column(JSON)  # PA, FC, FR, Temp, etc
    head_neck = Column(Text)
    cardiovascular = Column(Text)
    respiratory = Column(Text)
    abdomen = Column(Text)
    extremities = Column(Text)
    neurological = Column(Text)
    skin = Column(Text)
    custom_fields = Column(JSON)  # Campos personalizáveis por especialidade
    
    # Relacionamentos
    medical_record = relationship("MedicalRecord", back_populates="physical_exam")

class Appointment(Base):
    __tablename__ = "appointments"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"))
    patient_id = Column(Integer, ForeignKey("patients.id"))
    doctor_id = Column(Integer, ForeignKey("doctors.id"))
    procedure_id = Column(Integer, ForeignKey("tuss_procedures.id"))
    appointment_number = Column(String, unique=True, index=True)
    appointment_date = Column(DateTime)
    duration = Column(Integer)  # em minutos
    appointment_type = Column(String)  # consulta, retorno, urgencia, cirurgia
    status = Column(String)  # agendado, confirmado, em_atendimento, realizado, cancelado, faltou
    arrival_time = Column(DateTime)  # Hora de chegada
    start_time = Column(DateTime)  # Hora de início do atendimento
    end_time = Column(DateTime)  # Hora de fim do atendimento
    room = Column(String)  # Sala de atendimento
    authorization_number = Column(String)  # Número de autorização do convênio
    price = Column(Numeric(10, 2))  # Valor do procedimento
    copayment = Column(Numeric(10, 2))  # Valor da coparticipação
    payment_method = Column(String)  # Forma de pagamento
    payment_status = Column(String, default="pending")  # pending, paid, cancelled
    notes = Column(Text)
    cancellation_reason = Column(Text)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    patient = relationship("Patient")
    doctor = relationship("Doctor", back_populates="appointments")
    procedure = relationship("TussProcedure")
    creator = relationship("User")

class MedicalRecord(Base):
    __tablename__ = "medical_records"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"))
    patient_id = Column(Integer, ForeignKey("patients.id"))
    doctor_id = Column(Integer, ForeignKey("doctors.id"))
    appointment_id = Column(Integer, ForeignKey("appointments.id"))
    template_id = Column(Integer, ForeignKey("medical_record_templates.id"))
    record_number = Column(String, unique=True, index=True)
    record_type = Column(String)  # consulta, retorno, urgencia, cirurgia
    chief_complaint = Column(Text)  # Queixa principal
    history_present_illness = Column(Text)  # História da doença atual
    physical_examination = Column(Text)  # Exame físico
    assessment_plan = Column(Text)
    treatment_plan = Column(Text)  # Plano de tratamento
    notes = Column(Text)  # Observações
    custom_fields = Column(JSON)  # Campos personalizáveis
    status = Column(String, default="active")  # active, archived
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    patient = relationship("Patient", back_populates="medical_records")
    doctor = relationship("Doctor", back_populates="medical_records")
    appointment = relationship("Appointment")
    template = relationship("MedicalRecordTemplate", back_populates="medical_records")
    diagnoses = relationship("MedicalRecordDiagnosis", back_populates="medical_record")
    prescriptions = relationship("Prescription", back_populates="medical_record")
    documents = relationship("MedicalDocument", back_populates="medical_record")
    anamnesis = relationship("Anamnesis", back_populates="medical_record", uselist=False)
    physical_exam = relationship("PhysicalExam", back_populates="medical_record", uselist=False)

class InsurancePlan(Base):
    __tablename__ = "insurance_plans"
    
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("insurance_companies.id"))
    name = Column(String, index=True)
    code = Column(String, unique=True)
    plan_type = Column(String)  # particular, convenio
    coverage_percentage = Column(Numeric(5, 2))
    copayment = Column(Numeric(10, 2))
    ans_code = Column(String)  # Código ANS do plano
    contract_number = Column(String)
    contact_phone = Column(String)
    email = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    company = relationship("InsuranceCompany", back_populates="plans")
    patients = relationship("Patient", back_populates="insurance_plan")
    procedure_prices = relationship("InsuranceProcedurePrice", back_populates="insurance_plan")

class Procedure(Base):
    __tablename__ = "procedures"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)  # Código TUSS
    name = Column(String, index=True)
    description = Column(Text)
    price = Column(Numeric(10, 2))
    category = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Medication(Base):
    __tablename__ = "medications"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    active_ingredient = Column(String)
    dosage = Column(String)
    form = Column(String)  # comprimido, cápsula, xarope, etc.
    manufacturer = Column(String)
    batch_number = Column(String)
    expiry_date = Column(Date)
    quantity_in_stock = Column(Integer, default=0)
    minimum_stock = Column(Integer, default=10)
    unit_price = Column(Numeric(10, 2))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class StockMovement(Base):
    __tablename__ = "stock_movements"
    
    id = Column(Integer, primary_key=True, index=True)
    medication_id = Column(Integer, ForeignKey("medications.id"))
    movement_type = Column(String)  # entrada, saida, ajuste
    quantity = Column(Integer)
    reason = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    medication = relationship("Medication")
    user = relationship("User")

class FinancialTransaction(Base):
    __tablename__ = "financial_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"))
    patient_id = Column(Integer, ForeignKey("patients.id"))
    appointment_id = Column(Integer, ForeignKey("appointments.id"))
    transaction_type = Column(String)  # receita, despesa
    amount = Column(Numeric(10, 2))
    description = Column(String)
    payment_method = Column(String)  # dinheiro, cartao, pix, convenio
    status = Column(String)  # pendente, pago, cancelado
    due_date = Column(Date)
    payment_date = Column(Date)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    patient = relationship("Patient")
    appointment = relationship("Appointment")

# Modelos para controle de estoque ampliado (ETAPA 5B)
class Supplier(Base):
    __tablename__ = "suppliers"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False)
    name = Column(String(200), nullable=False)
    cnpj_cpf = Column(String(20))  # CNPJ ou CPF
    contact_person = Column(String(100))
    phone = Column(String(20))
    email = Column(String(100))
    address = Column(Text)
    category = Column(String(50))  # medicamentos, equipamentos, servicos, limpeza, etc.
    payment_terms = Column(String(100))  # Condições de pagamento
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    clinic = relationship("Clinic", back_populates="suppliers")
    products = relationship("Product", back_populates="supplier")
    purchase_orders = relationship("PurchaseOrder", back_populates="supplier")
    accounts_payable = relationship("AccountsPayable", back_populates="supplier")

class ProductCategory(Base):
    __tablename__ = "product_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"))
    name = Column(String, index=True)
    description = Column(Text)
    category_type = Column(String)  # medicamentos, limpeza, refeitorio, clinicos
    department = Column(String)  # farmacia, almoxarifado, limpeza, refeitorio, enfermagem, manutencao, escritorio
    parent_category_id = Column(Integer, ForeignKey("product_categories.id"))  # Para subcategorias
    category_code = Column(String, unique=True)  # Código único da categoria
    requires_authorization = Column(Boolean, default=False)  # Requer autorização para requisição
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    products = relationship("Product", back_populates="category")
    parent_category = relationship("ProductCategory", remote_side=[id])
    subcategories = relationship("ProductCategory")

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"))
    category_id = Column(Integer, ForeignKey("product_categories.id"))
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    name = Column(String, index=True)
    description = Column(Text)
    code = Column(String, index=True)  # Código interno
    barcode = Column(String)  # Código de barras
    unit_of_measure = Column(String)  # kg, litro, unidade, caixa
    current_stock = Column(Numeric(10, 3), default=0)
    minimum_stock = Column(Numeric(10, 3), default=0)
    maximum_stock = Column(Numeric(10, 3))
    average_cost = Column(Numeric(10, 2), default=0)
    last_purchase_price = Column(Numeric(10, 2))
    storage_location = Column(String)  # almoxarifado, farmacia, refeitorio
    requires_prescription = Column(Boolean, default=False)
    controlled_substance = Column(Boolean, default=False)
    expiry_control = Column(Boolean, default=True)
    
    # Campos expandidos para Etapa 5B - Classificação por Departamento
    product_type = Column(String, default="medicamento")  # medicamento, material_medico, equipamento, produtos_limpeza, insumos_refeitorio, material_escritorio, material_manutencao
    department_category = Column(String)  # farmacia, almoxarifado, limpeza, refeitorio, enfermagem, manutencao, escritorio
    supplier_code = Column(String)  # Código do produto no fornecedor
    ncm_code = Column(String)  # Código NCM para tributação
    requires_batch_control = Column(Boolean, default=True)  # Controle de lote obrigatório
    shelf_life_days = Column(Integer)  # Prazo de validade em dias
    storage_temperature = Column(String)  # ambiente, refrigerado, congelado
    criticality_level = Column(String, default="normal")  # critico, importante, normal
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    category = relationship("ProductCategory", back_populates="products")
    supplier = relationship("Supplier", back_populates="products")
    stock_movements = relationship("ProductStockMovement", back_populates="product")
    batches = relationship("ProductBatch", back_populates="product")

class ProductBatch(Base):
    __tablename__ = "product_batches"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    batch_number = Column(String, index=True)
    expiry_date = Column(Date)
    quantity = Column(Numeric(10, 3))
    purchase_price = Column(Numeric(10, 2))
    purchase_date = Column(Date)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    product = relationship("Product", back_populates="batches")

class ProductStockMovement(Base):
    __tablename__ = "product_stock_movements"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    batch_id = Column(Integer, ForeignKey("product_batches.id"))
    movement_type = Column(String)  # entrada, saida, ajuste, transferencia
    quantity = Column(Numeric(10, 3))
    unit_cost = Column(Numeric(10, 2))
    total_cost = Column(Numeric(10, 2))
    reason = Column(String)
    department = Column(String)  # farmacia, limpeza, refeitorio, enfermagem
    user_id = Column(Integer, ForeignKey("users.id"))
    reference_document = Column(String)  # Número da nota fiscal, requisição, etc.
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    product = relationship("Product", back_populates="stock_movements")
    batch = relationship("ProductBatch")
    user = relationship("User")

class StockRequisition(Base):
    __tablename__ = "stock_requisitions"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"))
    requisition_number = Column(String, unique=True, index=True)
    department = Column(String)  # farmacia, limpeza, refeitorio, enfermagem
    requested_by = Column(Integer, ForeignKey("users.id"))
    approved_by = Column(Integer, ForeignKey("users.id"))
    status = Column(String, default="pendente")  # pendente, aprovada, rejeitada, atendida
    priority = Column(String, default="normal")  # baixa, normal, alta, urgente
    requested_date = Column(DateTime, default=datetime.utcnow)
    approved_date = Column(DateTime)
    fulfilled_date = Column(DateTime)
    notes = Column(Text)
    
    # Relacionamentos
    requester = relationship("User", foreign_keys=[requested_by])
    approver = relationship("User", foreign_keys=[approved_by])
    items = relationship("StockRequisitionItem", back_populates="requisition")

class StockRequisitionItem(Base):
    __tablename__ = "stock_requisition_items"
    
    id = Column(Integer, primary_key=True, index=True)
    requisition_id = Column(Integer, ForeignKey("stock_requisitions.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    requested_quantity = Column(Numeric(10, 3))
    approved_quantity = Column(Numeric(10, 3))
    fulfilled_quantity = Column(Numeric(10, 3))
    unit_cost = Column(Numeric(10, 2))
    total_cost = Column(Numeric(10, 2))
    notes = Column(Text)
    
    # Relacionamentos
    requisition = relationship("StockRequisition", back_populates="items")
    product = relationship("Product")

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"))
    order_number = Column(String, unique=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    status = Column(String, default="draft")  # draft, sent, confirmed, received, cancelled
    order_date = Column(Date)
    expected_delivery = Column(Date)
    actual_delivery = Column(Date)
    total_amount = Column(Numeric(10, 2))
    discount = Column(Numeric(10, 2), default=0)
    tax_amount = Column(Numeric(10, 2), default=0)
    final_amount = Column(Numeric(10, 2))
    payment_terms = Column(String)
    notes = Column(Text)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    supplier = relationship("Supplier", back_populates="purchase_orders")
    creator = relationship("User")
    items = relationship("PurchaseOrderItem", back_populates="purchase_order")

class PurchaseOrderItem(Base):
    __tablename__ = "purchase_order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    purchase_order_id = Column(Integer, ForeignKey("purchase_orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Numeric(10, 3))
    unit_price = Column(Numeric(10, 2))
    total_price = Column(Numeric(10, 2))
    received_quantity = Column(Numeric(10, 3), default=0)
    
    # Relacionamentos
    purchase_order = relationship("PurchaseOrder", back_populates="items")
    product = relationship("Product")

# Modelos adicionais para Estoque Ampliado (ETAPA 5B)
class StockInventory(Base):
    __tablename__ = "stock_inventories"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"))
    inventory_number = Column(String, unique=True, index=True)
    inventory_type = Column(String)  # geral, parcial, ciclico
    department = Column(String)  # farmacia, almoxarifado, limpeza, refeitorio
    status = Column(String, default="planejado")  # planejado, em_andamento, concluido, cancelado
    planned_date = Column(Date)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    responsible_user_id = Column(Integer, ForeignKey("users.id"))
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    responsible = relationship("User")
    counts = relationship("InventoryCount", back_populates="inventory")

class InventoryCount(Base):
    __tablename__ = "inventory_counts"
    
    id = Column(Integer, primary_key=True, index=True)
    inventory_id = Column(Integer, ForeignKey("stock_inventories.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    batch_id = Column(Integer, ForeignKey("product_batches.id"))
    system_quantity = Column(Numeric(10, 3))  # Quantidade no sistema
    counted_quantity = Column(Numeric(10, 3))  # Quantidade contada
    difference = Column(Numeric(10, 3))  # Diferença (contado - sistema)
    unit_cost = Column(Numeric(10, 2))
    total_cost_difference = Column(Numeric(10, 2))
    counted_by = Column(Integer, ForeignKey("users.id"))
    counted_at = Column(DateTime)
    verified_by = Column(Integer, ForeignKey("users.id"))
    verified_at = Column(DateTime)
    status = Column(String, default="pendente")  # pendente, verificado, ajustado
    notes = Column(Text)
    
    # Relacionamentos
    inventory = relationship("StockInventory", back_populates="counts")
    product = relationship("Product")
    batch = relationship("ProductBatch")
    counter = relationship("User", foreign_keys=[counted_by])
    verifier = relationship("User", foreign_keys=[verified_by])

class StockAlert(Base):
    __tablename__ = "stock_alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    batch_id = Column(Integer, ForeignKey("product_batches.id"))
    alert_type = Column(String)  # estoque_baixo, vencimento_proximo, vencido, ruptura
    severity = Column(String)  # baixa, media, alta, critica
    title = Column(String)
    message = Column(Text)
    threshold_value = Column(Numeric(10, 3))  # Valor do limite que gerou o alerta
    current_value = Column(Numeric(10, 3))  # Valor atual
    expiry_date = Column(Date)  # Para alertas de vencimento
    status = Column(String, default="ativo")  # ativo, resolvido, ignorado
    resolved_by = Column(Integer, ForeignKey("users.id"))
    resolved_at = Column(DateTime)
    resolution_notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    product = relationship("Product")
    batch = relationship("ProductBatch")
    resolver = relationship("User")

class StockTransfer(Base):
    __tablename__ = "stock_transfers"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"))
    transfer_number = Column(String, unique=True, index=True)
    from_department = Column(String)  # departamento origem
    to_department = Column(String)  # departamento destino
    status = Column(String, default="pendente")  # pendente, em_transito, recebido, cancelado
    requested_by = Column(Integer, ForeignKey("users.id"))
    approved_by = Column(Integer, ForeignKey("users.id"))
    sent_by = Column(Integer, ForeignKey("users.id"))
    received_by = Column(Integer, ForeignKey("users.id"))
    requested_date = Column(DateTime, default=datetime.utcnow)
    approved_date = Column(DateTime)
    sent_date = Column(DateTime)
    received_date = Column(DateTime)
    priority = Column(String, default="normal")  # baixa, normal, alta, urgente
    notes = Column(Text)
    
    # Relacionamentos
    requester = relationship("User", foreign_keys=[requested_by])
    approver = relationship("User", foreign_keys=[approved_by])
    sender = relationship("User", foreign_keys=[sent_by])
    receiver = relationship("User", foreign_keys=[received_by])
    items = relationship("StockTransferItem", back_populates="transfer")

class StockTransferItem(Base):
    __tablename__ = "stock_transfer_items"
    
    id = Column(Integer, primary_key=True, index=True)
    transfer_id = Column(Integer, ForeignKey("stock_transfers.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    batch_id = Column(Integer, ForeignKey("product_batches.id"))
    requested_quantity = Column(Numeric(10, 3))
    sent_quantity = Column(Numeric(10, 3))
    received_quantity = Column(Numeric(10, 3))
    unit_cost = Column(Numeric(10, 2))
    total_cost = Column(Numeric(10, 2))
    notes = Column(Text)
    
    # Relacionamentos
    transfer = relationship("StockTransfer", back_populates="items")
    product = relationship("Product")
    batch = relationship("ProductBatch")

class StockAdjustment(Base):
    __tablename__ = "stock_adjustments"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"))
    adjustment_number = Column(String, unique=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    batch_id = Column(Integer, ForeignKey("product_batches.id"))
    adjustment_type = Column(String)  # positivo, negativo, correcao
    reason = Column(String)  # inventario, perda, vencimento, erro_sistema, dano
    quantity_before = Column(Numeric(10, 3))
    quantity_adjusted = Column(Numeric(10, 3))
    quantity_after = Column(Numeric(10, 3))
    unit_cost = Column(Numeric(10, 2))
    total_cost_impact = Column(Numeric(10, 2))
    department = Column(String)
    reference_document = Column(String)  # Número do inventário, nota fiscal, etc.
    approved_by = Column(Integer, ForeignKey("users.id"))
    created_by = Column(Integer, ForeignKey("users.id"))
    approved_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text)
    
    # Relacionamentos
    product = relationship("Product")
    batch = relationship("ProductBatch")
    approver = relationship("User", foreign_keys=[approved_by])
    creator = relationship("User", foreign_keys=[created_by])

# Modelos adicionais para Etapa 5B - Funcionalidades Avançadas
class SupplierProductPrice(Base):
    __tablename__ = "supplier_product_prices"
    
    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    price = Column(Numeric(10, 2))
    minimum_quantity = Column(Numeric(10, 3), default=1)
    discount_percentage = Column(Numeric(5, 2), default=0)
    delivery_time_days = Column(Integer)
    valid_from = Column(Date)
    valid_until = Column(Date)
    is_active = Column(Boolean, default=True)
    last_updated = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    supplier = relationship("Supplier")
    product = relationship("Product")

class DepartmentStockLevel(Base):
    __tablename__ = "department_stock_levels"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"))
    department = Column(String)  # farmacia, almoxarifado, limpeza, refeitorio, enfermagem
    product_id = Column(Integer, ForeignKey("products.id"))
    current_stock = Column(Numeric(10, 3), default=0)
    minimum_stock = Column(Numeric(10, 3), default=0)
    maximum_stock = Column(Numeric(10, 3))
    reserved_stock = Column(Numeric(10, 3), default=0)  # Estoque reservado para transferências
    last_movement_date = Column(DateTime)
    average_consumption = Column(Numeric(10, 3), default=0)  # Consumo médio mensal
    
    # Relacionamentos
    product = relationship("Product")

class CategoryAlert(Base):
    __tablename__ = "category_alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"))
    category_id = Column(Integer, ForeignKey("product_categories.id"))
    department = Column(String)
    alert_type = Column(String)  # estoque_baixo_categoria, vencimento_categoria, ruptura_categoria
    severity = Column(String, default="media")  # baixa, media, alta, critica
    threshold_percentage = Column(Numeric(5, 2), default=20)  # % de produtos em situação crítica
    current_percentage = Column(Numeric(5, 2))
    affected_products_count = Column(Integer)
    total_products_count = Column(Integer)
    status = Column(String, default="ativo")  # ativo, resolvido, ignorado
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime)
    
    # Relacionamentos
    category = relationship("ProductCategory")

class AutomaticReorder(Base):
    __tablename__ = "automatic_reorders"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    is_active = Column(Boolean, default=True)
    reorder_point = Column(Numeric(10, 3))  # Ponto de reposição
    reorder_quantity = Column(Numeric(10, 3))  # Quantidade a ser pedida
    lead_time_days = Column(Integer, default=7)  # Tempo de entrega
    safety_stock_days = Column(Integer, default=3)  # Estoque de segurança
    last_order_date = Column(Date)
    next_review_date = Column(Date)
    
    # Relacionamentos
    product = relationship("Product")
    supplier = relationship("Supplier")

# Modelos para faturamento TISS e financeiro (ETAPA 4)
class InsuranceCompany(Base):
    __tablename__ = "insurance_companies"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    cnpj = Column(String)
    ans_code = Column(String)  # Código ANS
    contact_person = Column(String)
    phone = Column(String)
    email = Column(String)
    address = Column(Text)
    payment_terms = Column(String)
    tiss_version = Column(String)  # Versão TISS suportada
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    plans = relationship("InsurancePlan", back_populates="company")
    billing_batches = relationship("BillingBatch", back_populates="insurance_company")

class TussProcedure(Base):
    __tablename__ = "tuss_procedures"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)  # Código TUSS
    description = Column(Text)
    category = Column(String)
    subcategory = Column(String)
    complexity = Column(String)
    default_price = Column(Numeric(10, 2))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    insurance_prices = relationship("InsuranceProcedurePrice", back_populates="procedure")
    billing_items = relationship("BillingItem", back_populates="procedure")

class InsuranceProcedurePrice(Base):
    __tablename__ = "insurance_procedure_prices"
    
    id = Column(Integer, primary_key=True, index=True)
    insurance_plan_id = Column(Integer, ForeignKey("insurance_plans.id"))
    procedure_id = Column(Integer, ForeignKey("tuss_procedures.id"))
    price = Column(Numeric(10, 2))
    copayment = Column(Numeric(10, 2), default=0)
    requires_authorization = Column(Boolean, default=False)
    valid_from = Column(Date)
    valid_until = Column(Date)
    is_active = Column(Boolean, default=True)
    
    # Relacionamentos
    insurance_plan = relationship("InsurancePlan", back_populates="procedure_prices")
    procedure = relationship("TussProcedure", back_populates="insurance_prices")

class BillingBatch(Base):
    __tablename__ = "billing_batches"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"))
    insurance_company_id = Column(Integer, ForeignKey("insurance_companies.id"))
    batch_number = Column(String, unique=True, index=True)
    reference_month = Column(String)  # YYYY-MM
    status = Column(String, default="draft")  # draft, sent, processing, paid, rejected
    total_amount = Column(Numeric(10, 2))
    gloss_amount = Column(Numeric(10, 2), default=0)
    paid_amount = Column(Numeric(10, 2), default=0)
    xml_file_path = Column(String)
    submission_date = Column(DateTime)
    payment_date = Column(DateTime)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    insurance_company = relationship("InsuranceCompany", back_populates="billing_batches")
    creator = relationship("User")
    items = relationship("BillingItem", back_populates="batch")
    glosses = relationship("BillingGloss", back_populates="batch")

# BillingItem removido - definição duplicada, mantida apenas a versão para internação

class BillingGloss(Base):
    __tablename__ = "billing_glosses"
    
    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("billing_batches.id"))
    billing_item_id = Column(Integer, ForeignKey("billing_items.id"))
    gloss_type = Column(String)  # tecnica, administrativa, duplicidade
    gloss_code = Column(String)
    description = Column(Text)
    original_amount = Column(Numeric(10, 2))
    glossed_amount = Column(Numeric(10, 2))
    status = Column(String, default="pending")  # pending, contested, accepted
    contest_date = Column(DateTime)
    contest_reason = Column(Text)
    resolution_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    batch = relationship("BillingBatch", back_populates="glosses")
    billing_item = relationship("BillingItem")

class AccountsReceivable(Base):
    __tablename__ = "accounts_receivable"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"))
    patient_id = Column(Integer, ForeignKey("patients.id"))
    insurance_company_id = Column(Integer, ForeignKey("insurance_companies.id"))
    billing_batch_id = Column(Integer, ForeignKey("billing_batches.id"))
    invoice_number = Column(String, index=True)
    description = Column(Text)
    original_amount = Column(Numeric(10, 2))
    discount_amount = Column(Numeric(10, 2), default=0)
    final_amount = Column(Numeric(10, 2))
    due_date = Column(Date)
    payment_date = Column(Date)
    payment_method = Column(String)
    status = Column(String, default="pending")  # pending, paid, overdue, cancelled
    installment_number = Column(Integer)
    total_installments = Column(Integer)
    late_fee = Column(Numeric(10, 2), default=0)
    interest = Column(Numeric(10, 2), default=0)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    patient = relationship("Patient")
    insurance_company = relationship("InsuranceCompany")
    billing_batch = relationship("BillingBatch")

class AccountsPayable(Base):
    __tablename__ = "accounts_payable"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"))
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    doctor_id = Column(Integer, ForeignKey("doctors.id"))  # Para repasses médicos
    category = Column(String)  # fornecedor, repasse_medico, salario, imposto, etc
    invoice_number = Column(String, index=True)
    description = Column(Text)
    original_amount = Column(Numeric(10, 2))
    discount_amount = Column(Numeric(10, 2), default=0)
    final_amount = Column(Numeric(10, 2))
    due_date = Column(Date)
    payment_date = Column(Date)
    payment_method = Column(String)
    status = Column(String, default="pending")  # pending, paid, overdue, cancelled
    cost_center = Column(String)
    account_code = Column(String)
    installment_number = Column(Integer)
    total_installments = Column(Integer)
    late_fee = Column(Numeric(10, 2), default=0)
    interest = Column(Numeric(10, 2), default=0)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    supplier = relationship("Supplier")
    doctor = relationship("Doctor")

class CashFlow(Base):
    __tablename__ = "cash_flow"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"))
    transaction_date = Column(Date)
    transaction_type = Column(String)  # entrada, saida
    category = Column(String)
    subcategory = Column(String)
    amount = Column(Numeric(10, 2))
    payment_method = Column(String)
    description = Column(Text)
    reference_id = Column(Integer)  # ID da transação original
    reference_table = Column(String)  # Tabela de origem
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    user = relationship("User")

# Novos modelos para gestão financeira completa
class InvoiceNFS(Base):
    __tablename__ = "invoice_nfs"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"))
    patient_id = Column(Integer, ForeignKey("patients.id"))
    appointment_id = Column(Integer, ForeignKey("appointments.id"))
    invoice_number = Column(String, unique=True, index=True)
    series = Column(String)
    issue_date = Column(DateTime, default=datetime.utcnow)
    service_date = Column(Date)
    gross_amount = Column(Numeric(10, 2))
    discount_amount = Column(Numeric(10, 2), default=0)
    net_amount = Column(Numeric(10, 2))
    iss_rate = Column(Numeric(5, 2))  # Alíquota ISS
    iss_amount = Column(Numeric(10, 2))
    pis_rate = Column(Numeric(5, 2))
    pis_amount = Column(Numeric(10, 2))
    cofins_rate = Column(Numeric(5, 2))
    cofins_amount = Column(Numeric(10, 2))
    irrf_rate = Column(Numeric(5, 2))
    irrf_amount = Column(Numeric(10, 2))
    total_taxes = Column(Numeric(10, 2))
    final_amount = Column(Numeric(10, 2))
    status = Column(String, default="draft")  # draft, issued, sent, cancelled
    xml_content = Column(Text)
    pdf_path = Column(String)
    verification_code = Column(String)
    city_code = Column(String)
    service_code = Column(String)
    description = Column(Text)
    notes = Column(Text)
    cancellation_reason = Column(Text)
    cancelled_at = Column(DateTime)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    patient = relationship("Patient")
    appointment = relationship("Appointment")
    creator = relationship("User")

class CostCenter(Base):
    __tablename__ = "cost_centers"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"))
    code = Column(String, unique=True, index=True)
    name = Column(String, index=True)
    description = Column(Text)
    parent_id = Column(Integer, ForeignKey("cost_centers.id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    parent = relationship("CostCenter", remote_side=[id])
    children = relationship("CostCenter")

class TaxConfiguration(Base):
    __tablename__ = "tax_configurations"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"))
    tax_regime = Column(String)  # simples_nacional, lucro_presumido, lucro_real
    iss_rate = Column(Numeric(5, 2))
    pis_rate = Column(Numeric(5, 2))
    cofins_rate = Column(Numeric(5, 2))
    irpj_rate = Column(Numeric(5, 2))
    csll_rate = Column(Numeric(5, 2))
    irrf_rate = Column(Numeric(5, 2))
    city_code = Column(String)
    service_code = Column(String)
    cnae_code = Column(String)
    is_active = Column(Boolean, default=True)
    valid_from = Column(Date)
    valid_until = Column(Date)
    created_at = Column(DateTime, default=datetime.utcnow)

class BankAccount(Base):
    __tablename__ = "bank_accounts"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"))
    bank_code = Column(String)
    bank_name = Column(String)
    agency = Column(String)
    account_number = Column(String)
    account_type = Column(String)  # corrente, poupanca
    account_holder = Column(String)
    initial_balance = Column(Numeric(10, 2), default=0)
    current_balance = Column(Numeric(10, 2), default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class BankReconciliation(Base):
    __tablename__ = "bank_reconciliations"
    
    id = Column(Integer, primary_key=True, index=True)
    bank_account_id = Column(Integer, ForeignKey("bank_accounts.id"))
    reference_date = Column(Date)
    bank_balance = Column(Numeric(10, 2))
    system_balance = Column(Numeric(10, 2))
    difference = Column(Numeric(10, 2))
    status = Column(String, default="pending")  # pending, reconciled
    notes = Column(Text)
    reconciled_by = Column(Integer, ForeignKey("users.id"))
    reconciled_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    bank_account = relationship("BankAccount")
    reconciler = relationship("User")

class DoctorPayment(Base):
    __tablename__ = "doctor_payments"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"))
    doctor_id = Column(Integer, ForeignKey("doctors.id"))
    reference_month = Column(String)  # YYYY-MM
    total_procedures = Column(Integer)
    gross_amount = Column(Numeric(10, 2))
    clinic_percentage = Column(Numeric(5, 2))
    clinic_amount = Column(Numeric(10, 2))
    doctor_percentage = Column(Numeric(5, 2))
    doctor_amount = Column(Numeric(10, 2))
    deductions = Column(Numeric(10, 2), default=0)
    net_amount = Column(Numeric(10, 2))
    payment_date = Column(Date)
    payment_method = Column(String)
    status = Column(String, default="pending")  # pending, paid
    notes = Column(Text)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    doctor = relationship("Doctor")
    creator = relationship("User")

class FinancialKPI(Base):
    __tablename__ = "financial_kpis"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"))
    reference_date = Column(Date)
    kpi_type = Column(String)  # revenue_per_patient, occupancy_rate, etc
    kpi_value = Column(Numeric(10, 2))
    target_value = Column(Numeric(10, 2))
    variance = Column(Numeric(10, 2))
    period_type = Column(String)  # daily, weekly, monthly, yearly
    created_at = Column(DateTime, default=datetime.utcnow)

# AuditLog model for tracking all financial operations
class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String(50), nullable=False)  # CREATE, UPDATE, DELETE
    table_name = Column(String(50), nullable=False)
    record_id = Column(Integer)
    old_values = Column(JSON)  # Valores antes da alteração
    new_values = Column(JSON)  # Valores após a alteração
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    ip_address = Column(String(45))  # IPv4 ou IPv6
    user_agent = Column(Text)
    
    # Relacionamentos
    clinic = relationship("Clinic")
    user = relationship("User")

# ============================================================================
# SISTEMA DE PERMISSÕES GRANULARES
# ============================================================================

class UserRole(Base):
    __tablename__ = "user_roles"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False)
    name = Column(String(100), nullable=False)  # Admin, Médico, Enfermeiro, Recepcionista, etc.
    code = Column(String(50), nullable=False)  # ADMIN, DOCTOR, NURSE, RECEPTIONIST
    description = Column(Text)
    is_system_role = Column(Boolean, default=False)  # Roles do sistema não podem ser deletadas
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    clinic = relationship("Clinic")
    permissions = relationship("RolePermission", back_populates="role")
    user_assignments = relationship("UserRoleAssignment", back_populates="role")

class Module(Base):
    __tablename__ = "modules"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)  # Pacientes, Agendamentos, Financeiro, etc.
    code = Column(String(50), nullable=False, unique=True)  # PATIENTS, APPOINTMENTS, FINANCIAL
    description = Column(Text)
    parent_module_id = Column(Integer, ForeignKey("modules.id"))  # Para submódulos
    icon = Column(String(100))  # Ícone do módulo
    route = Column(String(255))  # Rota no frontend
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    parent_module = relationship("Module", remote_side=[id])
    submodules = relationship("Module")
    permissions = relationship("RolePermission", back_populates="module")

class RolePermission(Base):
    __tablename__ = "role_permissions"
    
    id = Column(Integer, primary_key=True, index=True)
    role_id = Column(Integer, ForeignKey("user_roles.id"), nullable=False)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=False)
    can_view = Column(Boolean, default=False)
    can_create = Column(Boolean, default=False)
    can_edit = Column(Boolean, default=False)
    can_delete = Column(Boolean, default=False)
    can_export = Column(Boolean, default=False)
    can_import = Column(Boolean, default=False)
    custom_permissions = Column(JSON)  # Permissões específicas do módulo
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    role = relationship("UserRole", back_populates="permissions")
    module = relationship("Module", back_populates="permissions")
    
    # Índice único para evitar duplicatas
    __table_args__ = (UniqueConstraint('role_id', 'module_id', name='_role_module_uc'),)

class UserRoleAssignment(Base):
    __tablename__ = "user_role_assignments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role_id = Column(Integer, ForeignKey("user_roles.id"), nullable=False)
    assigned_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)  # Data de expiração da atribuição
    is_active = Column(Boolean, default=True)
    
    # Relacionamentos
    user = relationship("User", foreign_keys=[user_id])
    role = relationship("UserRole", back_populates="user_assignments")
    assigner = relationship("User", foreign_keys=[assigned_by])
    
    # Índice único para evitar duplicatas
    __table_args__ = (UniqueConstraint('user_id', 'role_id', name='_user_role_uc'),)

# ============================================================================
# SISTEMA DE LEITOS E QUARTOS
# ============================================================================

class Room(Base):
    __tablename__ = "rooms"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    room_number = Column(String(20), nullable=False)  # Número do quarto
    room_name = Column(String(100))  # Nome do quarto
    room_type = Column(String(50), nullable=False)  # individual, duplo, enfermaria, isolamento
    gender_restriction = Column(String(20))  # masculino, feminino, misto
    capacity = Column(Integer, nullable=False, default=1)  # Capacidade máxima de leitos
    floor = Column(String(20))  # Andar
    wing = Column(String(50))  # Ala do hospital
    has_bathroom = Column(Boolean, default=True)
    has_air_conditioning = Column(Boolean, default=False)
    has_tv = Column(Boolean, default=False)
    has_wifi = Column(Boolean, default=False)
    accessibility_features = Column(JSON)  # Recursos de acessibilidade
    daily_rate = Column(Numeric(10, 2))  # Diária base do quarto
    is_active = Column(Boolean, default=True)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    clinic = relationship("Clinic")
    department = relationship("Department")
    beds = relationship("Bed", back_populates="room")
    
    # Índice único para número do quarto por clínica
    __table_args__ = (UniqueConstraint('clinic_id', 'room_number', name='_clinic_room_number_uc'),)

class Bed(Base):
    __tablename__ = "beds"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    bed_number = Column(String(20), nullable=False)  # Número do leito
    bed_name = Column(String(100))  # Nome/identificação do leito
    bed_type = Column(String(50), default="standard")  # standard, uti, semi_uti, isolamento
    status = Column(String(50), default="available")  # available, occupied, maintenance, blocked, cleaning
    is_active = Column(Boolean, default=True)
    equipment = Column(JSON)  # Equipamentos disponíveis no leito
    notes = Column(Text)
    last_maintenance = Column(DateTime)
    next_maintenance = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    clinic = relationship("Clinic")
    room = relationship("Room", back_populates="beds")
    status_history = relationship("BedStatusHistory", back_populates="bed")
    admissions = relationship("PatientAdmission", back_populates="bed")
    transfers = relationship("BedTransfer", back_populates="bed")
    
    # Índice único para número do leito por quarto
    __table_args__ = (UniqueConstraint('room_id', 'bed_number', name='_room_bed_number_uc'),)

class BedStatusHistory(Base):
    __tablename__ = "bed_status_history"
    
    id = Column(Integer, primary_key=True, index=True)
    bed_id = Column(Integer, ForeignKey("beds.id"), nullable=False)
    previous_status = Column(String(50))
    new_status = Column(String(50), nullable=False)
    changed_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    change_reason = Column(String(255))
    notes = Column(Text)
    changed_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    bed = relationship("Bed", back_populates="status_history")
    user = relationship("User")

# ============================================================================
# SISTEMA DE INTERNAÇÃO
# ============================================================================

class PatientAdmission(Base):
    __tablename__ = "patient_admissions"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    bed_id = Column(Integer, ForeignKey("beds.id"), nullable=False)
    admission_number = Column(String(50), unique=True, index=True, nullable=False)
    
    # Datas da internação
    admission_date = Column(DateTime, nullable=False)
    expected_discharge_date = Column(DateTime)
    actual_discharge_date = Column(DateTime)
    
    # Informações médicas
    admission_reason = Column(Text, nullable=False)
    admission_diagnosis = Column(Text)
    discharge_diagnosis = Column(Text)
    treatment_plan = Column(Text)
    discharge_summary = Column(Text)
    
    # Status da internação
    status = Column(String(50), default="active")  # active, discharged, transferred, deceased
    admission_type = Column(String(50), nullable=False)  # emergency, elective, transfer
    discharge_type = Column(String(50))  # medical_discharge, transfer, death, evasion
    
    # Responsáveis
    admitting_doctor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    attending_doctor_id = Column(Integer, ForeignKey("users.id"))
    discharging_doctor_id = Column(Integer, ForeignKey("users.id"))
    
    # Informações financeiras
    insurance_plan_id = Column(Integer, ForeignKey("insurance_plans.id"))
    payment_method = Column(String(50))  # particular, convenio, sus
    estimated_cost = Column(Numeric(15, 2))
    total_cost = Column(Numeric(15, 2))
    
    # Observações
    notes = Column(Text)
    family_contact = Column(JSON)  # Informações de contato da família
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    clinic = relationship("Clinic")
    patient = relationship("Patient")
    bed = relationship("Bed", back_populates="admissions")
    admitting_doctor = relationship("User", foreign_keys=[admitting_doctor_id])
    attending_doctor = relationship("User", foreign_keys=[attending_doctor_id])
    discharging_doctor = relationship("User", foreign_keys=[discharging_doctor_id])
    insurance_plan = relationship("InsurancePlan")
    transfers = relationship("BedTransfer", back_populates="admission")
    billing = relationship("AdmissionBilling", back_populates="admission")

class BedTransfer(Base):
    __tablename__ = "bed_transfers"
    
    id = Column(Integer, primary_key=True, index=True)
    admission_id = Column(Integer, ForeignKey("patient_admissions.id"), nullable=False)
    from_bed_id = Column(Integer, ForeignKey("beds.id"), nullable=False)
    to_bed_id = Column(Integer, ForeignKey("beds.id"), nullable=False)
    transfer_date = Column(DateTime, default=datetime.utcnow)
    transfer_reason = Column(String(255), nullable=False)
    notes = Column(Text)
    authorized_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relacionamentos
    admission = relationship("PatientAdmission", back_populates="transfers")
    from_bed = relationship("Bed", foreign_keys=[from_bed_id])
    bed = relationship("Bed", back_populates="transfers", foreign_keys=[to_bed_id])
    authorizer = relationship("User")

class DailyRateConfig(Base):
    __tablename__ = "daily_rate_configs"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False)
    name = Column(String(100), nullable=False)  # Nome da configuração
    description = Column(Text)
    room_type = Column(String(50))  # Tipo de quarto aplicável
    payment_method = Column(String(50))  # Método de pagamento aplicável
    is_active = Column(Boolean, default=True)
    effective_date = Column(Date, nullable=False)
    expiry_date = Column(Date)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    clinic = relationship("Clinic")
    rate_tiers = relationship("DailyRateTier", back_populates="config")

class DailyRateTier(Base):
    __tablename__ = "daily_rate_tiers"
    
    id = Column(Integer, primary_key=True, index=True)
    config_id = Column(Integer, ForeignKey("daily_rate_configs.id"), nullable=False)
    tier_name = Column(String(100), nullable=False)  # Primeira semana, Segunda semana, etc.
    day_from = Column(Integer, nullable=False)  # Dia inicial (1, 8, 15, etc.)
    day_to = Column(Integer)  # Dia final (7, 14, null para ilimitado)
    daily_rate = Column(Numeric(10, 2), nullable=False)  # Valor da diária
    is_weekend_rate = Column(Boolean, default=False)  # Taxa diferenciada para fins de semana
    weekend_rate = Column(Numeric(10, 2))  # Valor da diária no fim de semana
    
    # Relacionamentos
    config = relationship("DailyRateConfig", back_populates="rate_tiers")

class AdmissionBilling(Base):
    __tablename__ = "admission_billing"
    
    id = Column(Integer, primary_key=True, index=True)
    admission_id = Column(Integer, ForeignKey("patient_admissions.id"), nullable=False)
    billing_date = Column(Date, nullable=False)
    
    # Valores calculados
    total_days = Column(Integer, nullable=False)
    daily_rate_amount = Column(Numeric(15, 2), default=0)
    procedures_amount = Column(Numeric(15, 2), default=0)
    medications_amount = Column(Numeric(15, 2), default=0)
    exams_amount = Column(Numeric(15, 2), default=0)
    other_charges = Column(Numeric(15, 2), default=0)
    discounts = Column(Numeric(15, 2), default=0)
    total_amount = Column(Numeric(15, 2), nullable=False)
    
    # Status do faturamento
    status = Column(String(50), default="pending")  # pending, sent, paid, cancelled
    sent_date = Column(Date)
    payment_date = Column(Date)
    
    # Observações
    notes = Column(Text)
    billing_details = Column(JSON)  # Detalhamento dos itens cobrados
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    admission = relationship("PatientAdmission", back_populates="billing")
    billing_items = relationship("BillingItem", back_populates="billing")

class BillingItem(Base):
    __tablename__ = "billing_items"
    
    id = Column(Integer, primary_key=True, index=True)
    billing_id = Column(Integer, ForeignKey("admission_billing.id"), nullable=False)
    item_type = Column(String(50), nullable=False)  # daily_rate, procedure, medication, exam, other
    item_code = Column(String(50))  # Código do item (TUSS, CBHPM, etc.)
    item_description = Column(String(255), nullable=False)
    quantity = Column(Numeric(10, 3), default=1)
    unit_price = Column(Numeric(10, 2), nullable=False)
    total_price = Column(Numeric(15, 2), nullable=False)
    service_date = Column(Date, nullable=False)
    
    # Relacionamentos
    billing = relationship("AdmissionBilling", back_populates="billing_items")

# ============================================================================
# ETAPA 2.4 - GESTÃO DE ACOMPANHANTES E VISITANTES
# ============================================================================

class Companion(Base):
    __tablename__ = "companions"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    name = Column(String(255), nullable=False)
    cpf = Column(String(14), index=True)
    rg = Column(String(20))
    phone = Column(String(20))
    email = Column(String(255))
    relationship_type = Column(String(100))  # pai, mãe, cônjuge, filho, etc.
    is_authorized = Column(Boolean, default=True)
    photo_path = Column(String(500))  # Caminho para foto do acompanhante
    emergency_contact = Column(Boolean, default=False)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    clinic = relationship("Clinic")
    patient = relationship("Patient")
    visits = relationship("VisitorEntry", back_populates="companion")

class Visitor(Base):
    __tablename__ = "visitors"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False)
    name = Column(String(255), nullable=False)
    cpf = Column(String(14), index=True)
    rg = Column(String(20))
    phone = Column(String(20))
    email = Column(String(255))
    photo_path = Column(String(500))  # Caminho para foto do visitante
    is_blacklisted = Column(Boolean, default=False)
    blacklist_reason = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    clinic = relationship("Clinic")
    visits = relationship("VisitorEntry", back_populates="visitor")

class VisitorEntry(Base):
    __tablename__ = "visitor_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False)
    visitor_id = Column(Integer, ForeignKey("visitors.id"))
    companion_id = Column(Integer, ForeignKey("companions.id"))
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    entry_time = Column(DateTime, default=datetime.utcnow)
    exit_time = Column(DateTime)
    visit_purpose = Column(String(255))  # visita, acompanhamento, procedimento
    authorized_by = Column(Integer, ForeignKey("users.id"))
    badge_number = Column(String(50))  # Número do crachá temporário
    badge_returned = Column(Boolean, default=False)
    notes = Column(Text)
    status = Column(String(50), default="active")  # active, completed, cancelled
    
    # Relacionamentos
    clinic = relationship("Clinic")
    visitor = relationship("Visitor", back_populates="visits")
    companion = relationship("Companion", back_populates="visits")
    patient = relationship("Patient")
    authorizer = relationship("User")

class VisitingHours(Base):
    __tablename__ = "visiting_hours"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"))
    day_of_week = Column(Integer, nullable=False)  # 0=Segunda, 6=Domingo
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    max_visitors_per_patient = Column(Integer, default=2)
    max_visit_duration = Column(Integer, default=60)  # em minutos
    is_active = Column(Boolean, default=True)
    special_conditions = Column(Text)  # Condições especiais
    
    # Relacionamentos
    clinic = relationship("Clinic")
    department = relationship("Department")

# ============================================================================
# ETAPA 2.4 - INTEGRAÇÃO COM DISPOSITIVOS MÉDICOS
# ============================================================================

class MedicalDevice(Base):
    __tablename__ = "medical_devices"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False)
    device_name = Column(String(255), nullable=False)
    device_type = Column(String(100), nullable=False)  # oximeter, glucometer, blood_pressure, thermometer, scale
    manufacturer = Column(String(255))
    model = Column(String(255))
    serial_number = Column(String(255), unique=True, index=True)
    mac_address = Column(String(17))  # Para dispositivos com conectividade
    ip_address = Column(String(45))  # Para dispositivos de rede
    connection_type = Column(String(50))  # bluetooth, wifi, usb, serial
    protocol = Column(String(50))  # HL7, DICOM, proprietary
    is_active = Column(Boolean, default=True)
    last_calibration = Column(DateTime)
    next_calibration = Column(DateTime)
    location = Column(String(255))  # Localização física do dispositivo
    responsible_user_id = Column(Integer, ForeignKey("users.id"))
    configuration = Column(JSON)  # Configurações específicas do dispositivo
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    clinic = relationship("Clinic")
    responsible_user = relationship("User")
    readings = relationship("DeviceReading", back_populates="device")
    integrations = relationship("DeviceIntegration", back_populates="device")

class DeviceReading(Base):
    __tablename__ = "device_readings"
    
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("medical_devices.id"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    reading_time = Column(DateTime, default=datetime.utcnow)
    reading_type = Column(String(100), nullable=False)  # blood_pressure, glucose, oxygen_saturation, temperature, weight
    value = Column(String(255), nullable=False)  # Valor da leitura
    unit = Column(String(20), nullable=False)  # Unidade de medida
    additional_data = Column(JSON)  # Dados adicionais específicos do dispositivo
    is_valid = Column(Boolean, default=True)
    validation_notes = Column(Text)
    processed_by = Column(Integer, ForeignKey("users.id"))
    integrated_to_record = Column(Boolean, default=False)
    medical_record_id = Column(Integer, ForeignKey("medical_records.id"))
    
    # Relacionamentos
    device = relationship("MedicalDevice", back_populates="readings")
    patient = relationship("Patient")
    processor = relationship("User")
    medical_record = relationship("MedicalRecord")

class DeviceIntegration(Base):
    __tablename__ = "device_integrations"
    
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("medical_devices.id"), nullable=False)
    integration_name = Column(String(255), nullable=False)
    integration_type = Column(String(100), nullable=False)  # hl7, dicom, api, file_transfer
    endpoint_url = Column(String(500))
    authentication_config = Column(JSON)  # Configurações de autenticação
    mapping_config = Column(JSON)  # Mapeamento de campos
    is_active = Column(Boolean, default=True)
    last_sync = Column(DateTime)
    sync_frequency = Column(Integer, default=300)  # em segundos
    error_count = Column(Integer, default=0)
    last_error = Column(Text)
    
    # Relacionamentos
    device = relationship("MedicalDevice", back_populates="integrations")

# ============================================================================
# ETAPA 2.4 - ANALYTICS E INTELIGÊNCIA ARTIFICIAL
# ============================================================================

class PredictiveModel(Base):
    __tablename__ = "predictive_models"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False)
    model_name = Column(String(255), nullable=False)
    model_type = Column(String(100), nullable=False)  # readmission_risk, diagnosis_suggestion, scheduling_optimization
    description = Column(Text)
    algorithm = Column(String(100))  # random_forest, neural_network, logistic_regression
    version = Column(String(50), default="1.0")
    accuracy_score = Column(Numeric(5, 4))  # Precisão do modelo (0-1)
    training_data_size = Column(Integer)
    last_training = Column(DateTime)
    model_file_path = Column(String(500))  # Caminho para o arquivo do modelo
    feature_config = Column(JSON)  # Configuração das features utilizadas
    is_active = Column(Boolean, default=True)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    clinic = relationship("Clinic")
    creator = relationship("User")
    predictions = relationship("ModelPrediction", back_populates="model")

class ModelPrediction(Base):
    __tablename__ = "model_predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("predictive_models.id"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    prediction_date = Column(DateTime, default=datetime.utcnow)
    prediction_type = Column(String(100), nullable=False)
    prediction_value = Column(JSON, nullable=False)  # Resultado da predição
    confidence_score = Column(Numeric(5, 4))  # Confiança da predição (0-1)
    input_features = Column(JSON)  # Features utilizadas na predição
    is_validated = Column(Boolean, default=False)
    validation_result = Column(Boolean)  # True se a predição se confirmou
    validation_date = Column(DateTime)
    validated_by = Column(Integer, ForeignKey("users.id"))
    notes = Column(Text)
    
    # Relacionamentos
    model = relationship("PredictiveModel", back_populates="predictions")
    patient = relationship("Patient")
    validator = relationship("User")

class PatientSatisfactionSurvey(Base):
    __tablename__ = "patient_satisfaction_surveys"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    appointment_id = Column(Integer, ForeignKey("appointments.id"))
    survey_date = Column(DateTime, default=datetime.utcnow)
    
    # Avaliações (escala 1-5)
    overall_satisfaction = Column(Integer)  # Satisfação geral
    wait_time_rating = Column(Integer)  # Tempo de espera
    staff_courtesy_rating = Column(Integer)  # Cortesia da equipe
    facility_cleanliness_rating = Column(Integer)  # Limpeza das instalações
    doctor_communication_rating = Column(Integer)  # Comunicação do médico
    treatment_explanation_rating = Column(Integer)  # Explicação do tratamento
    
    # Comentários
    positive_feedback = Column(Text)
    negative_feedback = Column(Text)
    suggestions = Column(Text)
    
    # Recomendação
    would_recommend = Column(Boolean)
    likelihood_to_return = Column(Integer)  # Escala 1-10
    
    # Dados de contato para follow-up
    contact_permission = Column(Boolean, default=False)
    
    # Relacionamentos
    clinic = relationship("Clinic")
    patient = relationship("Patient")
    appointment = relationship("Appointment")

class DiagnosticPattern(Base):
    __tablename__ = "diagnostic_patterns"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False)
    pattern_name = Column(String(255), nullable=False)
    symptoms = Column(JSON, nullable=False)  # Lista de sintomas
    suggested_diagnoses = Column(JSON, nullable=False)  # Diagnósticos sugeridos com probabilidades
    confidence_threshold = Column(Numeric(5, 4), default=0.7)
    usage_count = Column(Integer, default=0)
    success_rate = Column(Numeric(5, 4))  # Taxa de acerto
    created_by = Column(Integer, ForeignKey("users.id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    clinic = relationship("Clinic")
    creator = relationship("User")

class SchedulingOptimization(Base):
    __tablename__ = "scheduling_optimizations"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False)
    optimization_date = Column(Date, nullable=False)
    doctor_id = Column(Integer, ForeignKey("users.id"))
    
    # Métricas de otimização
    total_slots = Column(Integer)
    occupied_slots = Column(Integer)
    no_show_predictions = Column(JSON)  # Predições de faltas
    overbooking_suggestions = Column(JSON)  # Sugestões de overbooking
    optimal_schedule = Column(JSON)  # Agenda otimizada sugerida
    
    # Resultados
    efficiency_score = Column(Numeric(5, 4))  # Score de eficiência (0-1)
    predicted_revenue = Column(Numeric(15, 2))
    actual_revenue = Column(Numeric(15, 2))
    
    applied = Column(Boolean, default=False)
    applied_at = Column(DateTime)
    applied_by = Column(Integer, ForeignKey("users.id"))
    
    # Relacionamentos
    clinic = relationship("Clinic")
    doctor = relationship("User", foreign_keys=[doctor_id])
    applier = relationship("User", foreign_keys=[applied_by])

# ============================================================================
# TELEMEDICINA E ATENDIMENTO REMOTO
# ============================================================================

class TelemedicineRoom(Base):
    __tablename__ = "telemedicine_rooms"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False)
    room_code = Column(String(50), unique=True, index=True, nullable=False)
    room_name = Column(String(255), nullable=False)
    room_url = Column(String(500))  # URL da sala virtual
    max_participants = Column(Integer, default=10)
    is_active = Column(Boolean, default=True)
    is_recording_enabled = Column(Boolean, default=False)
    recording_url = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    clinic = relationship("Clinic")
    teleconsultations = relationship("Teleconsultation", back_populates="room")

class Teleconsultation(Base):
    __tablename__ = "teleconsultations"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    room_id = Column(Integer, ForeignKey("telemedicine_rooms.id"), nullable=False)
    appointment_id = Column(Integer, ForeignKey("appointments.id"))
    
    # Informações da Teleconsulta
    consultation_number = Column(String(50), unique=True, index=True)
    scheduled_date = Column(DateTime, nullable=False)
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    duration_minutes = Column(Integer)
    status = Column(String(50), default="scheduled")  # scheduled, in_progress, completed, cancelled, no_show
    
    # Configurações Técnicas
    connection_quality = Column(String(50))  # excellent, good, fair, poor
    technical_issues = Column(Text)
    recording_available = Column(Boolean, default=False)
    recording_path = Column(String(500))
    
    # Informações Clínicas
    chief_complaint = Column(Text)
    consultation_notes = Column(Text)
    diagnosis = Column(Text)
    treatment_plan = Column(Text)
    follow_up_required = Column(Boolean, default=False)
    follow_up_date = Column(DateTime)
    
    # Prescrições e Documentos
    prescription_issued = Column(Boolean, default=False)
    documents_shared = Column(JSON)  # Lista de documentos compartilhados
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    clinic = relationship("Clinic")
    patient = relationship("Patient")
    doctor = relationship("User")
    room = relationship("TelemedicineRoom", back_populates="teleconsultations")
    appointment = relationship("Appointment")
    participants = relationship("TeleconsultationParticipant", back_populates="teleconsultation")
    shared_documents = relationship("SharedDocument", back_populates="teleconsultation")

class TeleconsultationParticipant(Base):
    __tablename__ = "teleconsultation_participants"
    
    id = Column(Integer, primary_key=True, index=True)
    teleconsultation_id = Column(Integer, ForeignKey("teleconsultations.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"))
    patient_id = Column(Integer, ForeignKey("patients.id"))
    participant_type = Column(String(50), nullable=False)  # doctor, patient, nurse, family_member, specialist
    participant_name = Column(String(255), nullable=False)
    participant_email = Column(String(255))
    joined_at = Column(DateTime)
    left_at = Column(DateTime)
    connection_duration = Column(Integer)  # em minutos
    is_host = Column(Boolean, default=False)
    
    # Relacionamentos
    teleconsultation = relationship("Teleconsultation", back_populates="participants")
    user = relationship("User")
    patient = relationship("Patient")

class SharedDocument(Base):
    __tablename__ = "shared_documents"
    
    id = Column(Integer, primary_key=True, index=True)
    teleconsultation_id = Column(Integer, ForeignKey("teleconsultations.id"), nullable=False)
    document_name = Column(String(255), nullable=False)
    document_type = Column(String(100), nullable=False)  # exam_result, prescription, image, report
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer)
    mime_type = Column(String(100))
    shared_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_encrypted = Column(Boolean, default=True)
    access_permissions = Column(JSON)  # Permissões de acesso por usuário
    expiry_date = Column(DateTime)  # Data de expiração do acesso
    download_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    teleconsultation = relationship("Teleconsultation", back_populates="shared_documents")
    shared_by_user = relationship("User")

class RemoteMonitoring(Base):
    __tablename__ = "remote_monitoring"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Configurações do Monitoramento
    monitoring_type = Column(String(100), nullable=False)  # chronic_disease, post_surgery, medication_adherence
    condition_monitored = Column(String(255), nullable=False)  # diabetes, hypertension, heart_disease
    monitoring_frequency = Column(String(50), nullable=False)  # daily, weekly, monthly
    start_date = Column(Date, nullable=False)
    end_date = Column(Date)
    is_active = Column(Boolean, default=True)
    
    # Parâmetros Monitorados
    vital_signs_required = Column(JSON)  # Lista de sinais vitais a serem monitorados
    medication_schedule = Column(JSON)  # Cronograma de medicações
    alert_thresholds = Column(JSON)  # Limites para alertas
    
    # Configurações de Comunicação
    notification_preferences = Column(JSON)  # Preferências de notificação
    emergency_contacts = Column(JSON)  # Contatos de emergência
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    clinic = relationship("Clinic")
    patient = relationship("Patient")
    doctor = relationship("User")
    vital_readings = relationship("VitalSignReading", back_populates="monitoring")
    medication_logs = relationship("MedicationAdherenceLog", back_populates="monitoring")

class VitalSignReading(Base):
    __tablename__ = "vital_sign_readings"
    
    id = Column(Integer, primary_key=True, index=True)
    monitoring_id = Column(Integer, ForeignKey("remote_monitoring.id"), nullable=False)
    reading_date = Column(DateTime, nullable=False)
    vital_sign_type = Column(String(100), nullable=False)  # blood_pressure, heart_rate, temperature, weight, glucose
    value = Column(String(100), nullable=False)  # Valor da leitura
    unit = Column(String(20), nullable=False)  # Unidade de medida
    is_within_normal = Column(Boolean)
    notes = Column(Text)
    device_used = Column(String(255))  # Dispositivo utilizado para a leitura
    location = Column(String(255))  # Local onde foi feita a leitura
    
    # Relacionamentos
    monitoring = relationship("RemoteMonitoring", back_populates="vital_readings")

class MedicationAdherenceLog(Base):
    __tablename__ = "medication_adherence_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    monitoring_id = Column(Integer, ForeignKey("remote_monitoring.id"), nullable=False)
    medication_name = Column(String(255), nullable=False)
    scheduled_time = Column(DateTime, nullable=False)
    taken_time = Column(DateTime)
    was_taken = Column(Boolean, default=False)
    dosage = Column(String(100))
    notes = Column(Text)
    side_effects = Column(Text)
    
    # Relacionamentos
    monitoring = relationship("RemoteMonitoring", back_populates="medication_logs")

class DigitalPrescription(Base):
    __tablename__ = "digital_prescriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    teleconsultation_id = Column(Integer, ForeignKey("teleconsultations.id"))
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Informações da Prescrição
    prescription_number = Column(String(50), unique=True, index=True)
    prescription_date = Column(DateTime, default=datetime.utcnow)
    is_controlled_medication = Column(Boolean, default=False)
    
    # Assinatura Digital
    digital_signature = Column(Text)  # Assinatura digital do médico
    certificate_info = Column(JSON)  # Informações do certificado digital
    is_digitally_signed = Column(Boolean, default=False)
    
    # Validação e Controle
    validation_code = Column(String(100), unique=True)  # Código para validação
    qr_code_data = Column(Text)  # Dados do QR Code
    expiry_date = Column(DateTime)
    is_dispensed = Column(Boolean, default=False)
    dispensed_at = Column(DateTime)
    dispensed_by = Column(String(255))  # Farmácia que dispensou
    
    # Status
    status = Column(String(50), default="active")  # active, expired, cancelled, dispensed
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    teleconsultation = relationship("Teleconsultation")
    clinic = relationship("Clinic")
    patient = relationship("Patient")
    doctor = relationship("User")
    medications = relationship("DigitalPrescriptionMedication", back_populates="prescription")

class DigitalPrescriptionMedication(Base):
    __tablename__ = "digital_prescription_medications"
    
    id = Column(Integer, primary_key=True, index=True)
    prescription_id = Column(Integer, ForeignKey("digital_prescriptions.id"), nullable=False)
    medication_name = Column(String(255), nullable=False)
    active_ingredient = Column(String(255))
    dosage = Column(String(100), nullable=False)
    frequency = Column(String(100), nullable=False)
    duration = Column(String(100), nullable=False)
    quantity = Column(Integer, nullable=False)
    instructions = Column(Text)
    is_generic_allowed = Column(Boolean, default=True)
    is_controlled = Column(Boolean, default=False)
    
    # Relacionamentos
    prescription = relationship("DigitalPrescription", back_populates="medications")

# ============================================================================
# ETAPA 7 - SEGURANÇA E LGPD AVANÇADA
# ============================================================================

class UserSession(Base):
    __tablename__ = "user_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_token = Column(String(255), unique=True, index=True)
    device_info = Column(JSON)  # Informações do dispositivo
    ip_address = Column(String(45))  # IPv4 ou IPv6
    user_agent = Column(Text)
    location = Column(String(255))  # Localização geográfica
    is_active = Column(Boolean, default=True)
    last_activity = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    user = relationship("User")

class SecurityEvent(Base):
    __tablename__ = "security_events"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    event_type = Column(String(100), nullable=False)  # login_success, login_failed, password_change, 2fa_enabled, suspicious_activity
    severity = Column(String(50), default="info")  # info, warning, critical
    ip_address = Column(String(45))
    user_agent = Column(Text)
    details = Column(JSON)  # Detalhes específicos do evento
    is_resolved = Column(Boolean, default=False)
    resolved_by = Column(Integer, ForeignKey("users.id"))
    resolved_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    user = relationship("User", foreign_keys=[user_id])
    resolver = relationship("User", foreign_keys=[resolved_by])

class DataEncryption(Base):
    __tablename__ = "data_encryption"
    
    id = Column(Integer, primary_key=True, index=True)
    table_name = Column(String(100), nullable=False)
    field_name = Column(String(100), nullable=False)
    record_id = Column(Integer, nullable=False)
    encrypted_data = Column(Text, nullable=False)  # Dados criptografados
    encryption_key_id = Column(String(100))  # ID da chave de criptografia
    encryption_algorithm = Column(String(50), default="AES-256")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AccessControl(Base):
    __tablename__ = "access_controls"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    resource_type = Column(String(100), nullable=False)  # patient, appointment, medical_record
    resource_id = Column(Integer, nullable=False)
    permission_type = Column(String(50), nullable=False)  # read, write, delete, admin
    granted_by = Column(Integer, ForeignKey("users.id"))
    granted_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)
    is_active = Column(Boolean, default=True)
    reason = Column(Text)  # Motivo da concessão
    
    # Relacionamentos
    user = relationship("User", foreign_keys=[user_id])
    granter = relationship("User", foreign_keys=[granted_by])

class LoginAttempt(Base):
    __tablename__ = "login_attempts"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), index=True)
    ip_address = Column(String(45))
    user_agent = Column(Text)
    success = Column(Boolean, default=False)
    failure_reason = Column(String(255))  # invalid_credentials, account_locked, 2fa_failed
    attempted_at = Column(DateTime, default=datetime.utcnow)
    
    # Campos para detecção de ataques
    is_suspicious = Column(Boolean, default=False)
    risk_score = Column(Integer, default=0)  # 0-100
    blocked_until = Column(DateTime)  # Bloqueio temporário por IP

class PasswordHistory(Base):
    __tablename__ = "password_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    user = relationship("User")

class ApiKey(Base):
    __tablename__ = "api_keys"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    key_name = Column(String(255), nullable=False)
    key_hash = Column(String(255), unique=True, index=True)
    permissions = Column(JSON)  # Lista de permissões da API
    is_active = Column(Boolean, default=True)
    last_used = Column(DateTime)
    expires_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    user = relationship("User")

# ============================================================================
# ETAPA 7 - AUTENTICAÇÃO MULTIFATOR (2FA)
# ============================================================================

class TwoFactorAuth(Base):
    """Modelo para autenticação de dois fatores"""
    
    __tablename__ = "two_factor_auth"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    # Chave secreta para TOTP
    secret_key = Column(String(32), nullable=False)
    
    # Códigos de backup
    backup_codes = Column(JSON, default=list)
    
    # Status
    is_enabled = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    verified_at = Column(DateTime, nullable=True)
    last_used_at = Column(DateTime, nullable=True)
    disabled_at = Column(DateTime, nullable=True)
    
    # Relacionamento com usuário
    user = relationship("User", back_populates="two_factor_auth")
    
    def __repr__(self):
        return f"<TwoFactorAuth(user_id={self.user_id}, enabled={self.is_enabled})>"
    
    @property
    def backup_codes_remaining(self) -> int:
        """Retorna quantidade de códigos de backup restantes"""
        return len(self.backup_codes) if self.backup_codes else 0
    
    @property
    def is_configured(self) -> bool:
        """Verifica se 2FA está configurado (mesmo que não habilitado)"""
        return bool(self.secret_key)

# ============================================================================
# ETAPA 8 - EXTRAS TÉCNICOS
# ============================================================================

class ExternalIntegration(Base):
    __tablename__ = "external_integrations"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False)
    integration_type = Column(String(100), nullable=False)  # datasus, laboratory, pacs, pharmacy, sms, email
    provider_name = Column(String(255), nullable=False)
    api_endpoint = Column(String(500))
    api_key = Column(String(500))  # Criptografado
    api_secret = Column(String(500))  # Criptografado
    configuration = Column(JSON)  # Configurações específicas da integração
    is_active = Column(Boolean, default=True)
    last_sync = Column(DateTime)
    sync_status = Column(String(50), default="pending")  # pending, success, error
    error_message = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    clinic = relationship("Clinic")
    sync_logs = relationship("IntegrationSyncLog", back_populates="integration")

class IntegrationSyncLog(Base):
    __tablename__ = "integration_sync_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    integration_id = Column(Integer, ForeignKey("external_integrations.id"), nullable=False)
    sync_type = Column(String(100), nullable=False)  # import, export, bidirectional
    status = Column(String(50), nullable=False)  # started, completed, failed
    records_processed = Column(Integer, default=0)
    records_success = Column(Integer, default=0)
    records_error = Column(Integer, default=0)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime)
    error_details = Column(JSON)  # Detalhes dos erros
    
    # Relacionamentos
    integration = relationship("ExternalIntegration", back_populates="sync_logs")

class TenantConfiguration(Base):
    __tablename__ = "tenant_configurations"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False, unique=True)
    
    # Configurações de Recursos
    max_users = Column(Integer, default=10)
    max_patients = Column(Integer, default=1000)
    max_storage_gb = Column(Integer, default=5)
    
    # Módulos Habilitados
    modules_enabled = Column(JSON, default=lambda: {
        "patients": True,
        "appointments": True,
        "medical_records": True,
        "pharmacy": False,
        "billing": False,
        "reports": True,
        "telemedicine": False
    })
    
    # Configurações de Customização
    custom_fields = Column(JSON, default=dict)  # Campos personalizados por módulo
    custom_workflows = Column(JSON, default=dict)  # Fluxos de trabalho personalizados
    branding_config = Column(JSON, default=dict)  # Configurações de marca
    
    # Configurações de Integração
    api_rate_limit = Column(Integer, default=1000)  # Requisições por hora
    webhook_endpoints = Column(JSON, default=list)  # Endpoints para webhooks
    
    # Configurações de Backup
    backup_frequency = Column(String(50), default="daily")  # daily, weekly, monthly
    backup_retention_days = Column(Integer, default=30)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    clinic = relationship("Clinic")

class SystemNotification(Base):
    __tablename__ = "system_notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    notification_type = Column(String(100), nullable=False)  # system_update, maintenance, security_alert, feature_announcement
    priority = Column(String(50), default="normal")  # low, normal, high, critical
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    action_url = Column(String(500))  # URL para ação relacionada
    is_read = Column(Boolean, default=False)
    is_dismissed = Column(Boolean, default=False)
    expires_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    clinic = relationship("Clinic")
    user = relationship("User")

class WebhookEvent(Base):
    __tablename__ = "webhook_events"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False)
    event_type = Column(String(100), nullable=False)  # patient_created, appointment_scheduled, payment_received
    payload = Column(JSON, nullable=False)
    webhook_url = Column(String(500), nullable=False)
    status = Column(String(50), default="pending")  # pending, sent, failed, retrying
    attempts = Column(Integer, default=0)
    max_attempts = Column(Integer, default=3)
    last_attempt = Column(DateTime)
    response_code = Column(Integer)
    response_body = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    clinic = relationship("Clinic")

class FeatureFlag(Base):
    __tablename__ = "feature_flags"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True)
    description = Column(Text)
    is_enabled = Column(Boolean, default=False)
    rollout_percentage = Column(Integer, default=0)  # 0-100
    target_clinics = Column(JSON, default=list)  # Lista de IDs de clínicas
    target_users = Column(JSON, default=list)  # Lista de IDs de usuários
    conditions = Column(JSON, default=dict)  # Condições para ativação
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class SystemMetrics(Base):
    __tablename__ = "system_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    metric_date = Column(Date, nullable=False)
    
    # Métricas de Sistema
    total_clinics = Column(Integer, default=0)
    active_clinics = Column(Integer, default=0)
    total_users = Column(Integer, default=0)
    active_users = Column(Integer, default=0)
    total_patients = Column(Integer, default=0)
    
    # Métricas de Performance
    avg_response_time_ms = Column(Integer, default=0)
    total_requests = Column(Integer, default=0)
    error_rate_percentage = Column(Numeric(5, 2), default=0)
    
    # Métricas de Uso
    storage_used_gb = Column(Numeric(10, 2), default=0)
    bandwidth_used_gb = Column(Numeric(10, 2), default=0)
    api_calls_count = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)

# ============================================================================
# ETAPA 5B - DEPARTAMENTOS
# ============================================================================

class Department(Base):
    __tablename__ = "departments"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False)
    name = Column(String(100), nullable=False)  # Farmácia, Almoxarifado, Limpeza, Refeitório, Enfermagem
    code = Column(String(20), unique=True, index=True)  # FARM, ALM, LIMP, REF, ENF
    description = Column(Text)
    manager_id = Column(Integer, ForeignKey("users.id"))  # Responsável pelo departamento
    location = Column(String(255))  # Localização física
    is_active = Column(Boolean, default=True)
    budget_limit = Column(Numeric(15, 2))  # Limite orçamentário mensal
    cost_center = Column(String(50))  # Centro de custo
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    clinic = relationship("Clinic")
    manager = relationship("User")
    # Relacionamentos removidos pois os campos são String, não FK:
    # stock_movements = relationship("ProductStockMovement", foreign_keys="ProductStockMovement.department")
    # requisitions = relationship("StockRequisition", back_populates="requesting_department")
    # transfers_from = relationship("StockTransfer", foreign_keys="StockTransfer.from_department")
    # transfers_to = relationship("StockTransfer", foreign_keys="StockTransfer.to_department")

# ============================================================================
# ETAPA 6 - RELATÓRIOS E BI
# ============================================================================

class SavedReport(Base):
    __tablename__ = "saved_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    report_type = Column(String(100), nullable=False)  # 'administrative', 'financial', 'clinical', 'bi'
    report_config = Column(JSON, nullable=False)  # Configurações do relatório (filtros, parâmetros)
    is_public = Column(Boolean, default=False)
    is_scheduled = Column(Boolean, default=False)
    schedule_config = Column(JSON)  # Configurações de agendamento
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    clinic = relationship("Clinic")
    user = relationship("User")
    executions = relationship("ReportExecution", back_populates="saved_report")

class ReportExecution(Base):
    __tablename__ = "report_executions"
    
    id = Column(Integer, primary_key=True, index=True)
    saved_report_id = Column(Integer, ForeignKey("saved_reports.id"), nullable=False)
    executed_by = Column(Integer, ForeignKey("users.id"))
    execution_date = Column(DateTime, default=datetime.utcnow)
    parameters = Column(JSON)
    status = Column(String(50), default="pending")  # 'pending', 'running', 'completed', 'failed'
    file_path = Column(String(500))
    file_size = Column(Integer)
    execution_time_ms = Column(Integer)
    error_message = Column(Text)
    
    # Relacionamentos
    saved_report = relationship("SavedReport", back_populates="executions")
    executor = relationship("User")

class CustomDashboard(Base):
    __tablename__ = "custom_dashboards"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    layout_config = Column(JSON, nullable=False)  # Configuração do layout (widgets, posições)
    is_default = Column(Boolean, default=False)
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    clinic = relationship("Clinic")
    user = relationship("User")
    widgets = relationship("DashboardWidget", back_populates="dashboard")

class DashboardWidget(Base):
    __tablename__ = "dashboard_widgets"
    
    id = Column(Integer, primary_key=True, index=True)
    dashboard_id = Column(Integer, ForeignKey("custom_dashboards.id"), nullable=False)
    widget_type = Column(String(100), nullable=False)  # 'chart', 'kpi', 'table', 'gauge'
    title = Column(String(255), nullable=False)
    position_x = Column(Integer, default=0)
    position_y = Column(Integer, default=0)
    width = Column(Integer, default=4)
    height = Column(Integer, default=3)
    config = Column(JSON, nullable=False)  # Configurações específicas do widget
    data_source = Column(String(255))  # Fonte dos dados
    refresh_interval = Column(Integer, default=300)  # Intervalo de atualização em segundos
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    dashboard = relationship("CustomDashboard", back_populates="widgets")

class PerformanceMetric(Base):
    __tablename__ = "performance_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False)
    metric_date = Column(Date, nullable=False)
    metric_type = Column(String(100), nullable=False)  # 'daily', 'weekly', 'monthly'
    
    # Métricas de Atendimento
    total_appointments = Column(Integer, default=0)
    completed_appointments = Column(Integer, default=0)
    cancelled_appointments = Column(Integer, default=0)
    no_show_appointments = Column(Integer, default=0)
    average_wait_time = Column(Integer, default=0)  # em minutos
    average_consultation_time = Column(Integer, default=0)  # em minutos
    
    # Métricas de Pacientes
    new_patients = Column(Integer, default=0)
    returning_patients = Column(Integer, default=0)
    total_active_patients = Column(Integer, default=0)
    
    # Métricas Financeiras
    total_revenue = Column(Numeric(15, 2), default=0)
    total_expenses = Column(Numeric(15, 2), default=0)
    net_profit = Column(Numeric(15, 2), default=0)
    accounts_receivable = Column(Numeric(15, 2), default=0)
    accounts_payable = Column(Numeric(15, 2), default=0)
    
    # Métricas por Convênio
    revenue_by_insurance = Column(JSON)  # {"insurance_name": revenue_amount}
    procedures_by_insurance = Column(JSON)  # {"insurance_name": procedure_count}
    
    # Métricas por Especialidade
    revenue_by_specialty = Column(JSON)  # {"specialty": revenue_amount}
    appointments_by_specialty = Column(JSON)  # {"specialty": appointment_count}
    
    # Métricas por Profissional
    revenue_by_doctor = Column(JSON)  # {"doctor_id": revenue_amount}
    appointments_by_doctor = Column(JSON)  # {"doctor_id": appointment_count}
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    clinic = relationship("Clinic")

class BIAlert(Base):
    __tablename__ = "bi_alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False)
    alert_type = Column(String(100), nullable=False)  # 'performance', 'financial', 'operational'
    severity = Column(String(50), nullable=False)  # 'low', 'medium', 'high', 'critical'
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    metric_value = Column(Numeric(15, 2))
    threshold_value = Column(Numeric(15, 2))
    comparison_operator = Column(String(10))  # '>', '<', '>=', '<=', '=', '!='
    is_active = Column(Boolean, default=True)
    is_resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime)
    resolved_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    clinic = relationship("Clinic")
    resolver = relationship("User")

class AlertConfiguration(Base):
    __tablename__ = "alert_configurations"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    alert_name = Column(String(255), nullable=False)
    metric_type = Column(String(100), nullable=False)
    threshold_value = Column(Numeric(15, 2), nullable=False)
    comparison_operator = Column(String(10), nullable=False)
    notification_method = Column(String(50), default="dashboard")  # 'dashboard', 'email', 'sms'
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    clinic = relationship("Clinic")
    user = relationship("User")