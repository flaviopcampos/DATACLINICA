-- ============================================================================
-- MIGRAÇÃO COMPLETA DO DATACLINICA PARA SUPABASE
-- Script de criação de todas as tabelas com RLS e políticas de segurança
-- ============================================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TABELAS PRINCIPAIS
-- ============================================================================

-- Tabela de Clínicas
CREATE TABLE clinics (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) UNIQUE,
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    logo_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    subscription_plan VARCHAR(50) DEFAULT 'basic',
    subscription_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Usuários
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    clinic_id INTEGER REFERENCES clinics(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Pacientes
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    clinic_id INTEGER REFERENCES clinics(id) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    rg VARCHAR(20),
    birth_date DATE,
    gender VARCHAR(10),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    blood_type VARCHAR(5),
    allergies TEXT,
    medical_history TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Documentos do Paciente
CREATE TABLE patient_documents (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER,
    uploaded_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Médicos
CREATE TABLE doctors (
    id SERIAL PRIMARY KEY,
    clinic_id INTEGER REFERENCES clinics(id) NOT NULL,
    user_id INTEGER REFERENCES users(id),
    crm VARCHAR(20) UNIQUE NOT NULL,
    specialty VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255),
    consultation_fee DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Templates de Prontuário
CREATE TABLE medical_record_templates (
    id SERIAL PRIMARY KEY,
    clinic_id INTEGER REFERENCES clinics(id) NOT NULL,
    name VARCHAR(255) NOT NULL,
    specialty VARCHAR(100),
    template_data JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Diagnósticos CID
CREATE TABLE cid_diagnosis (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100)
);

-- Tabela de Diagnósticos do Prontuário
CREATE TABLE medical_record_diagnosis (
    id SERIAL PRIMARY KEY,
    medical_record_id INTEGER NOT NULL,
    cid_diagnosis_id INTEGER REFERENCES cid_diagnosis(id) NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Prescrições
CREATE TABLE prescriptions (
    id SERIAL PRIMARY KEY,
    medical_record_id INTEGER NOT NULL,
    doctor_id INTEGER REFERENCES doctors(id) NOT NULL,
    patient_id INTEGER REFERENCES patients(id) NOT NULL,
    prescription_date DATE NOT NULL,
    instructions TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Medicamentos da Prescrição
CREATE TABLE prescription_medications (
    id SERIAL PRIMARY KEY,
    prescription_id INTEGER REFERENCES prescriptions(id) NOT NULL,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    duration VARCHAR(100),
    instructions TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Documentos Médicos
CREATE TABLE medical_documents (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) NOT NULL,
    doctor_id INTEGER REFERENCES doctors(id),
    document_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    file_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Anamnese
CREATE TABLE anamnesis (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) NOT NULL,
    doctor_id INTEGER REFERENCES doctors(id) NOT NULL,
    chief_complaint TEXT,
    history_present_illness TEXT,
    past_medical_history TEXT,
    family_history TEXT,
    social_history TEXT,
    review_of_systems TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Exame Físico
CREATE TABLE physical_exams (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) NOT NULL,
    doctor_id INTEGER REFERENCES doctors(id) NOT NULL,
    vital_signs JSONB,
    general_appearance TEXT,
    head_neck TEXT,
    cardiovascular TEXT,
    respiratory TEXT,
    abdominal TEXT,
    neurological TEXT,
    musculoskeletal TEXT,
    skin TEXT,
    other_findings TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Consultas
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    clinic_id INTEGER REFERENCES clinics(id) NOT NULL,
    patient_id INTEGER REFERENCES patients(id) NOT NULL,
    doctor_id INTEGER REFERENCES doctors(id) NOT NULL,
    appointment_date TIMESTAMP NOT NULL,
    duration INTEGER DEFAULT 30,
    status VARCHAR(50) DEFAULT 'scheduled',
    appointment_type VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Prontuários Médicos
CREATE TABLE medical_records (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) NOT NULL,
    doctor_id INTEGER REFERENCES doctors(id) NOT NULL,
    appointment_id INTEGER REFERENCES appointments(id),
    record_date DATE NOT NULL,
    chief_complaint TEXT,
    history_present_illness TEXT,
    physical_examination TEXT,
    assessment TEXT,
    plan TEXT,
    follow_up TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Planos de Saúde
CREATE TABLE insurance_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Procedimentos
CREATE TABLE procedures (
    id SERIAL PRIMARY KEY,
    clinic_id INTEGER REFERENCES clinics(id) NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    description TEXT,
    default_price DECIMAL(10,2),
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- MÓDULO DE FARMÁCIA E ESTOQUE
-- ============================================================================

-- Tabela de Medicamentos
CREATE TABLE medications (
    id SERIAL PRIMARY KEY,
    clinic_id INTEGER REFERENCES clinics(id) NOT NULL,
    name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    manufacturer VARCHAR(255),
    dosage_form VARCHAR(100),
    strength VARCHAR(100),
    unit VARCHAR(50),
    barcode VARCHAR(100),
    requires_prescription BOOLEAN DEFAULT true,
    is_controlled BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Movimentações de Estoque
CREATE TABLE stock_movements (
    id SERIAL PRIMARY KEY,
    clinic_id INTEGER REFERENCES clinics(id) NOT NULL,
    medication_id INTEGER REFERENCES medications(id) NOT NULL,
    movement_type VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    batch_number VARCHAR(100),
    expiry_date DATE,
    supplier VARCHAR(255),
    notes TEXT,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Transações Financeiras
CREATE TABLE financial_transactions (
    id SERIAL PRIMARY KEY,
    clinic_id INTEGER REFERENCES clinics(id) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    payment_method VARCHAR(50),
    reference_id INTEGER,
    reference_type VARCHAR(50),
    transaction_date DATE NOT NULL,
    due_date DATE,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Fornecedores
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    clinic_id INTEGER REFERENCES clinics(id) NOT NULL,
    name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18),
    contact_person VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    payment_terms VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Categorias de Produtos
CREATE TABLE product_categories (
    id SERIAL PRIMARY KEY,
    clinic_id INTEGER REFERENCES clinics(id) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_category_id INTEGER REFERENCES product_categories(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Produtos
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    clinic_id INTEGER REFERENCES clinics(id) NOT NULL,
    category_id INTEGER REFERENCES product_categories(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100),
    barcode VARCHAR(100),
    unit VARCHAR(50),
    minimum_stock INTEGER DEFAULT 0,
    maximum_stock INTEGER,
    reorder_point INTEGER DEFAULT 0,
    unit_cost DECIMAL(10,2),
    selling_price DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- CONFIGURAÇÃO DE ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_record_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_record_diagnosis ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE anamnesis ENABLE ROW LEVEL SECURITY;
ALTER TABLE physical_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLÍTICAS DE SEGURANÇA RLS
-- ============================================================================

-- Função para obter clinic_id do usuário autenticado
CREATE OR REPLACE FUNCTION get_user_clinic_id()
RETURNS INTEGER AS $$
BEGIN
    RETURN (auth.jwt() ->> 'clinic_id')::INTEGER;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas para tabela clinics
CREATE POLICY "Users can view their own clinic" ON clinics
    FOR SELECT USING (id = get_user_clinic_id());

CREATE POLICY "Users can update their own clinic" ON clinics
    FOR UPDATE USING (id = get_user_clinic_id());

-- Políticas para tabela users
CREATE POLICY "Users can view users from their clinic" ON users
    FOR SELECT USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can insert users in their clinic" ON users
    FOR INSERT WITH CHECK (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can update users from their clinic" ON users
    FOR UPDATE USING (clinic_id = get_user_clinic_id());

-- Políticas para tabela patients
CREATE POLICY "Users can view patients from their clinic" ON patients
    FOR SELECT USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can insert patients in their clinic" ON patients
    FOR INSERT WITH CHECK (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can update patients from their clinic" ON patients
    FOR UPDATE USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can delete patients from their clinic" ON patients
    FOR DELETE USING (clinic_id = get_user_clinic_id());

-- Políticas para tabela patient_documents
CREATE POLICY "Users can view patient documents from their clinic" ON patient_documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM patients p 
            WHERE p.id = patient_documents.patient_id 
            AND p.clinic_id = get_user_clinic_id()
        )
    );

CREATE POLICY "Users can insert patient documents in their clinic" ON patient_documents
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM patients p 
            WHERE p.id = patient_documents.patient_id 
            AND p.clinic_id = get_user_clinic_id()
        )
    );

-- Políticas para tabela doctors
CREATE POLICY "Users can view doctors from their clinic" ON doctors
    FOR SELECT USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can insert doctors in their clinic" ON doctors
    FOR INSERT WITH CHECK (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can update doctors from their clinic" ON doctors
    FOR UPDATE USING (clinic_id = get_user_clinic_id());

-- Políticas para tabela appointments
CREATE POLICY "Users can view appointments from their clinic" ON appointments
    FOR SELECT USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can insert appointments in their clinic" ON appointments
    FOR INSERT WITH CHECK (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can update appointments from their clinic" ON appointments
    FOR UPDATE USING (clinic_id = get_user_clinic_id());

-- Políticas para tabela medical_records
CREATE POLICY "Users can view medical records from their clinic" ON medical_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM patients p 
            WHERE p.id = medical_records.patient_id 
            AND p.clinic_id = get_user_clinic_id()
        )
    );

CREATE POLICY "Users can insert medical records in their clinic" ON medical_records
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM patients p 
            WHERE p.id = medical_records.patient_id 
            AND p.clinic_id = get_user_clinic_id()
        )
    );

-- Políticas para tabela prescriptions
CREATE POLICY "Users can view prescriptions from their clinic" ON prescriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM patients p 
            WHERE p.id = prescriptions.patient_id 
            AND p.clinic_id = get_user_clinic_id()
        )
    );

CREATE POLICY "Users can insert prescriptions in their clinic" ON prescriptions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM patients p 
            WHERE p.id = prescriptions.patient_id 
            AND p.clinic_id = get_user_clinic_id()
        )
    );

-- Políticas para tabelas de estoque e farmácia
CREATE POLICY "Users can view medications from their clinic" ON medications
    FOR SELECT USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can insert medications in their clinic" ON medications
    FOR INSERT WITH CHECK (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can view stock movements from their clinic" ON stock_movements
    FOR SELECT USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can insert stock movements in their clinic" ON stock_movements
    FOR INSERT WITH CHECK (clinic_id = get_user_clinic_id());

-- Políticas para tabelas financeiras
CREATE POLICY "Users can view financial transactions from their clinic" ON financial_transactions
    FOR SELECT USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can insert financial transactions in their clinic" ON financial_transactions
    FOR INSERT WITH CHECK (clinic_id = get_user_clinic_id());

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Índices principais
CREATE INDEX idx_users_clinic_id ON users(clinic_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_patients_clinic_id ON patients(clinic_id);
CREATE INDEX idx_patients_cpf ON patients(cpf);
CREATE INDEX idx_doctors_clinic_id ON doctors(clinic_id);
CREATE INDEX idx_doctors_crm ON doctors(crm);
CREATE INDEX idx_appointments_clinic_id ON appointments(clinic_id);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX idx_medical_records_doctor_id ON medical_records(doctor_id);
CREATE INDEX idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor_id ON prescriptions(doctor_id);
CREATE INDEX idx_medications_clinic_id ON medications(clinic_id);
CREATE INDEX idx_stock_movements_clinic_id ON stock_movements(clinic_id);
CREATE INDEX idx_stock_movements_medication_id ON stock_movements(medication_id);
CREATE INDEX idx_financial_transactions_clinic_id ON financial_transactions(clinic_id);

-- ============================================================================
-- TRIGGERS PARA UPDATED_AT
-- ============================================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para tabelas com updated_at
CREATE TRIGGER update_clinics_updated_at BEFORE UPDATE ON clinics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON medical_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PERMISSÕES PARA ROLES ANON E AUTHENTICATED
-- ============================================================================

-- Conceder permissões básicas para role anon (usuários não autenticados)
GRANT SELECT ON insurance_plans TO anon;
GRANT SELECT ON cid_diagnosis TO anon;

-- Conceder permissões completas para role authenticated (usuários autenticados)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- DADOS INICIAIS
-- ============================================================================

-- Inserir alguns diagnósticos CID básicos
INSERT INTO cid_diagnosis (code, description, category) VALUES
('Z00.0', 'Exame médico geral', 'Exames'),
('K59.0', 'Constipação', 'Doenças do aparelho digestivo'),
('J06.9', 'Infecção aguda das vias aéreas superiores não especificada', 'Doenças do aparelho respiratório'),
('M79.3', 'Paniculite não especificada', 'Doenças do sistema osteomuscular'),
('R50.9', 'Febre não especificada', 'Sintomas e sinais');

-- Inserir alguns planos de saúde básicos
INSERT INTO insurance_plans (name, code, is_active) VALUES
('Particular', 'PART', true),
('SUS', 'SUS', true),
('Unimed', 'UNIM', true),
('Bradesco Saúde', 'BRAD', true),
('Amil', 'AMIL', true);

COMMIT;