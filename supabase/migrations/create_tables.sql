-- =====================================================
-- MIGRAÇÃO PRINCIPAL - CRIAÇÃO DE TABELAS
-- Sistema DataClínica - Baseado em backend/models.py
-- =====================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABELA: clinics
-- =====================================================
CREATE TABLE IF NOT EXISTS clinics (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) UNIQUE,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: users
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: patients
-- =====================================================
CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    rg VARCHAR(20),
    birth_date DATE,
    gender VARCHAR(10),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    emergency_contact VARCHAR(255),
    emergency_phone VARCHAR(20),
    blood_type VARCHAR(5),
    allergies TEXT,
    medical_history TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: patient_documents
-- =====================================================
CREATE TABLE IF NOT EXISTS patient_documents (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    file_path TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER,
    uploaded_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: doctors
-- =====================================================
CREATE TABLE IF NOT EXISTS doctors (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE,
    crm VARCHAR(20) UNIQUE NOT NULL,
    specialty VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: medical_record_templates
-- =====================================================
CREATE TABLE IF NOT EXISTS medical_record_templates (
    id SERIAL PRIMARY KEY,
    clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    template_data JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: cid_diagnoses
-- =====================================================
CREATE TABLE IF NOT EXISTS cid_diagnoses (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: medical_records
-- =====================================================
CREATE TABLE IF NOT EXISTS medical_records (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id INTEGER REFERENCES doctors(id),
    template_id INTEGER REFERENCES medical_record_templates(id),
    record_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: medical_record_diagnoses
-- =====================================================
CREATE TABLE IF NOT EXISTS medical_record_diagnoses (
    id SERIAL PRIMARY KEY,
    medical_record_id INTEGER REFERENCES medical_records(id) ON DELETE CASCADE,
    cid_diagnosis_id INTEGER REFERENCES cid_diagnoses(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: prescriptions
-- =====================================================
CREATE TABLE IF NOT EXISTS prescriptions (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id INTEGER REFERENCES doctors(id),
    prescription_date DATE NOT NULL,
    instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: prescription_medications
-- =====================================================
CREATE TABLE IF NOT EXISTS prescription_medications (
    id SERIAL PRIMARY KEY,
    prescription_id INTEGER REFERENCES prescriptions(id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    duration VARCHAR(100),
    instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: medical_documents
-- =====================================================
CREATE TABLE IF NOT EXISTS medical_documents (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    file_path TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: anamneses
-- =====================================================
CREATE TABLE IF NOT EXISTS anamneses (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id INTEGER REFERENCES doctors(id),
    chief_complaint TEXT,
    history_present_illness TEXT,
    past_medical_history TEXT,
    family_history TEXT,
    social_history TEXT,
    review_of_systems TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: physical_exams
-- =====================================================
CREATE TABLE IF NOT EXISTS physical_exams (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id INTEGER REFERENCES doctors(id),
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: appointments
-- =====================================================
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id INTEGER REFERENCES doctors(id),
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    status VARCHAR(50) DEFAULT 'scheduled',
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: insurance_plans
-- =====================================================
CREATE TABLE IF NOT EXISTS insurance_plans (
    id SERIAL PRIMARY KEY,
    clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    provider VARCHAR(255),
    coverage_details JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: procedures
-- =====================================================
CREATE TABLE IF NOT EXISTS procedures (
    id SERIAL PRIMARY KEY,
    clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    code VARCHAR(50),
    price DECIMAL(10,2),
    duration_minutes INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para clinic_id (isolamento por clínica)
CREATE INDEX IF NOT EXISTS idx_users_clinic_id ON users(clinic_id);
CREATE INDEX IF NOT EXISTS idx_patients_clinic_id ON patients(clinic_id);
CREATE INDEX IF NOT EXISTS idx_doctors_clinic_id ON doctors(clinic_id);
CREATE INDEX IF NOT EXISTS idx_medical_record_templates_clinic_id ON medical_record_templates(clinic_id);
CREATE INDEX IF NOT EXISTS idx_insurance_plans_clinic_id ON insurance_plans(clinic_id);
CREATE INDEX IF NOT EXISTS idx_procedures_clinic_id ON procedures(clinic_id);

-- Índices para relacionamentos
CREATE INDEX IF NOT EXISTS idx_patient_documents_patient_id ON patient_documents(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_doctor_id ON medical_records(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor_id ON prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);

-- Índices para user_id (autenticação)
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON doctors(user_id);

-- Índices para campos únicos
CREATE INDEX IF NOT EXISTS idx_patients_cpf ON patients(cpf) WHERE cpf IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_doctors_crm ON doctors(crm);
CREATE INDEX IF NOT EXISTS idx_cid_diagnoses_code ON cid_diagnoses(code);

-- =====================================================
-- TRIGGERS PARA UPDATED_AT
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para tabelas com updated_at
CREATE TRIGGER update_clinics_updated_at BEFORE UPDATE ON clinics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medical_record_templates_updated_at BEFORE UPDATE ON medical_record_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON medical_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medical_documents_updated_at BEFORE UPDATE ON medical_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_anamneses_updated_at BEFORE UPDATE ON anamneses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_physical_exams_updated_at BEFORE UPDATE ON physical_exams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_insurance_plans_updated_at BEFORE UPDATE ON insurance_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_procedures_updated_at BEFORE UPDATE ON procedures FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DADOS INICIAIS - CID DIAGNOSES (AMOSTRA)
-- =====================================================

INSERT INTO cid_diagnoses (code, description, category) VALUES
('A00', 'Cólera', 'Doenças infecciosas e parasitárias'),
('A01', 'Febres tifóide e paratifóide', 'Doenças infecciosas e parasitárias'),
('A02', 'Outras infecções por Salmonella', 'Doenças infecciosas e parasitárias'),
('B00', 'Infecções pelo vírus do herpes', 'Doenças infecciosas e parasitárias'),
('C00', 'Neoplasia maligna do lábio', 'Neoplasias'),
('C01', 'Neoplasia maligna da base da língua', 'Neoplasias'),
('D00', 'Carcinoma in situ da cavidade oral', 'Neoplasias'),
('E00', 'Síndrome de deficiência congênita de iodo', 'Doenças endócrinas'),
('E10', 'Diabetes mellitus tipo 1', 'Doenças endócrinas'),
('E11', 'Diabetes mellitus tipo 2', 'Doenças endócrinas'),
('F00', 'Demência na doença de Alzheimer', 'Transtornos mentais'),
('F10', 'Transtornos mentais devido ao uso de álcool', 'Transtornos mentais'),
('G00', 'Meningite bacteriana', 'Doenças do sistema nervoso'),
('H00', 'Hordéolo e calázio', 'Doenças do olho'),
('I00', 'Febre reumática sem menção de complicação cardíaca', 'Doenças do aparelho circulatório'),
('I10', 'Hipertensão essencial', 'Doenças do aparelho circulatório'),
('J00', 'Nasofaringite aguda (resfriado comum)', 'Doenças do aparelho respiratório'),
('K00', 'Distúrbios do desenvolvimento e da erupção dos dentes', 'Doenças do aparelho digestivo'),
('L00', 'Síndrome da pele escaldada estafilocócica', 'Doenças da pele'),
('M00', 'Artrite piogênica', 'Doenças do sistema osteomuscular'),
('N00', 'Síndrome nefrítica aguda', 'Doenças do aparelho geniturinário'),
('O00', 'Gravidez ectópica', 'Gravidez, parto e puerpério'),
('P00', 'Feto e recém-nascido afetados por transtornos maternos', 'Afecções perinatais'),
('Q00', 'Anencefalia e malformações similares', 'Malformações congênitas'),
('R00', 'Anormalidades do batimento cardíaco', 'Sintomas e sinais'),
('S00', 'Traumatismo superficial da cabeça', 'Lesões e envenenamentos'),
('T00', 'Traumatismos superficiais envolvendo múltiplas regiões', 'Lesões e envenenamentos'),
('V00', 'Pedestre traumatizado em acidente de transporte', 'Causas externas'),
('W00', 'Queda no mesmo nível envolvendo gelo e neve', 'Causas externas'),
('X00', 'Exposição a fogo não controlado em edifício', 'Causas externas'),
('Y00', 'Agressão por meio de objeto cortante', 'Causas externas'),
('Z00', 'Exame médico geral', 'Fatores que influenciam o estado de saúde')
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

-- Este arquivo cria toda a estrutura de banco de dados para o sistema DataClínica
-- Baseado no arquivo backend/models.py do projeto original
-- 
-- Principais características:
-- 1. Estrutura multi-tenant com isolamento por clínica
-- 2. Integração com Supabase Auth através de user_id UUID
-- 3. Relacionamentos bem definidos com integridade referencial
-- 4. Índices otimizados para performance
-- 5. Triggers automáticos para updated_at
-- 6. Dados iniciais para diagnósticos CID
-- 
-- Próximos passos:
-- 1. Aplicar políticas RLS (rls_policies.sql)
-- 2. Configurar autenticação
-- 3. Migrar operações CRUD do backend