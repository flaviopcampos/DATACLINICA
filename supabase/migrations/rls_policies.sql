-- =====================================================
-- CONFIGURAÇÃO DE ROW LEVEL SECURITY (RLS)
-- Sistema DataClínica - Isolamento por Clínica
-- =====================================================

-- Habilitar RLS em todas as tabelas principais
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_record_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE cid_diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_record_diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE anamneses ENABLE ROW LEVEL SECURITY;
ALTER TABLE physical_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedures ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS PARA TABELA CLINICS
-- =====================================================

-- Política para visualizar clínicas (usuários autenticados podem ver suas clínicas)
CREATE POLICY "Users can view their own clinic" ON clinics
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM users WHERE clinic_id = clinics.id
        )
    );

-- Política para inserir clínicas (apenas super admins)
CREATE POLICY "Only super admins can create clinics" ON clinics
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM users WHERE role = 'super_admin'
        )
    );

-- Política para atualizar clínicas (apenas admins da clínica)
CREATE POLICY "Clinic admins can update their clinic" ON clinics
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM users 
            WHERE clinic_id = clinics.id AND role IN ('admin', 'super_admin')
        )
    );

-- =====================================================
-- POLÍTICAS PARA TABELA USERS
-- =====================================================

-- Política para visualizar usuários (usuários da mesma clínica)
CREATE POLICY "Users can view users from their clinic" ON users
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id FROM users WHERE user_id = auth.uid()
        )
    );

-- Política para inserir usuários (apenas admins)
CREATE POLICY "Admins can create users in their clinic" ON users
    FOR INSERT WITH CHECK (
        clinic_id IN (
            SELECT clinic_id FROM users 
            WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Política para atualizar usuários (admins ou próprio usuário)
CREATE POLICY "Users can update themselves or admins can update users" ON users
    FOR UPDATE USING (
        user_id = auth.uid() OR
        clinic_id IN (
            SELECT clinic_id FROM users 
            WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- =====================================================
-- POLÍTICAS PARA TABELA PATIENTS
-- =====================================================

-- Política para visualizar pacientes (usuários da mesma clínica)
CREATE POLICY "Users can view patients from their clinic" ON patients
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id FROM users WHERE user_id = auth.uid()
        )
    );

-- Política para inserir pacientes (usuários autenticados da clínica)
CREATE POLICY "Users can create patients in their clinic" ON patients
    FOR INSERT WITH CHECK (
        clinic_id IN (
            SELECT clinic_id FROM users WHERE user_id = auth.uid()
        )
    );

-- Política para atualizar pacientes (usuários da mesma clínica)
CREATE POLICY "Users can update patients from their clinic" ON patients
    FOR UPDATE USING (
        clinic_id IN (
            SELECT clinic_id FROM users WHERE user_id = auth.uid()
        )
    );

-- =====================================================
-- POLÍTICAS PARA TABELA DOCTORS
-- =====================================================

-- Política para visualizar médicos (usuários da mesma clínica)
CREATE POLICY "Users can view doctors from their clinic" ON doctors
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id FROM users WHERE user_id = auth.uid()
        )
    );

-- Política para inserir médicos (apenas admins)
CREATE POLICY "Admins can create doctors in their clinic" ON doctors
    FOR INSERT WITH CHECK (
        clinic_id IN (
            SELECT clinic_id FROM users 
            WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Política para atualizar médicos (admins ou próprio médico)
CREATE POLICY "Doctors can update themselves or admins can update doctors" ON doctors
    FOR UPDATE USING (
        user_id = auth.uid() OR
        clinic_id IN (
            SELECT clinic_id FROM users 
            WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- =====================================================
-- POLÍTICAS PARA TABELAS DE DOCUMENTOS E REGISTROS
-- =====================================================

-- Patient Documents
CREATE POLICY "Users can view patient documents from their clinic" ON patient_documents
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM patients WHERE clinic_id IN (
                SELECT clinic_id FROM users WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can manage patient documents from their clinic" ON patient_documents
    FOR ALL USING (
        patient_id IN (
            SELECT id FROM patients WHERE clinic_id IN (
                SELECT clinic_id FROM users WHERE user_id = auth.uid()
            )
        )
    );

-- Medical Records
CREATE POLICY "Users can view medical records from their clinic" ON medical_records
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM patients WHERE clinic_id IN (
                SELECT clinic_id FROM users WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can manage medical records from their clinic" ON medical_records
    FOR ALL USING (
        patient_id IN (
            SELECT id FROM patients WHERE clinic_id IN (
                SELECT clinic_id FROM users WHERE user_id = auth.uid()
            )
        )
    );

-- Appointments
CREATE POLICY "Users can view appointments from their clinic" ON appointments
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM patients WHERE clinic_id IN (
                SELECT clinic_id FROM users WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can manage appointments from their clinic" ON appointments
    FOR ALL USING (
        patient_id IN (
            SELECT id FROM patients WHERE clinic_id IN (
                SELECT clinic_id FROM users WHERE user_id = auth.uid()
            )
        )
    );

-- Prescriptions
CREATE POLICY "Users can view prescriptions from their clinic" ON prescriptions
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM patients WHERE clinic_id IN (
                SELECT clinic_id FROM users WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can manage prescriptions from their clinic" ON prescriptions
    FOR ALL USING (
        patient_id IN (
            SELECT id FROM patients WHERE clinic_id IN (
                SELECT clinic_id FROM users WHERE user_id = auth.uid()
            )
        )
    );

-- =====================================================
-- POLÍTICAS PARA TABELAS DE CONFIGURAÇÃO
-- =====================================================

-- Medical Record Templates
CREATE POLICY "Users can view templates from their clinic" ON medical_record_templates
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id FROM users WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage templates in their clinic" ON medical_record_templates
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM users 
            WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Insurance Plans
CREATE POLICY "Users can view insurance plans from their clinic" ON insurance_plans
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id FROM users WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage insurance plans in their clinic" ON insurance_plans
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM users 
            WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Procedures
CREATE POLICY "Users can view procedures from their clinic" ON procedures
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id FROM users WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage procedures in their clinic" ON procedures
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM users 
            WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- =====================================================
-- POLÍTICAS PARA TABELAS DE RELACIONAMENTO
-- =====================================================

-- CID Diagnoses (tabela global, todos podem visualizar)
CREATE POLICY "All authenticated users can view CID diagnoses" ON cid_diagnoses
    FOR SELECT USING (auth.role() = 'authenticated');

-- Medical Record Diagnoses
CREATE POLICY "Users can view diagnoses from their clinic" ON medical_record_diagnoses
    FOR SELECT USING (
        medical_record_id IN (
            SELECT id FROM medical_records WHERE patient_id IN (
                SELECT id FROM patients WHERE clinic_id IN (
                    SELECT clinic_id FROM users WHERE user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users can manage diagnoses from their clinic" ON medical_record_diagnoses
    FOR ALL USING (
        medical_record_id IN (
            SELECT id FROM medical_records WHERE patient_id IN (
                SELECT id FROM patients WHERE clinic_id IN (
                    SELECT clinic_id FROM users WHERE user_id = auth.uid()
                )
            )
        )
    );

-- Prescription Medications
CREATE POLICY "Users can view prescription medications from their clinic" ON prescription_medications
    FOR SELECT USING (
        prescription_id IN (
            SELECT id FROM prescriptions WHERE patient_id IN (
                SELECT id FROM patients WHERE clinic_id IN (
                    SELECT clinic_id FROM users WHERE user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users can manage prescription medications from their clinic" ON prescription_medications
    FOR ALL USING (
        prescription_id IN (
            SELECT id FROM prescriptions WHERE patient_id IN (
                SELECT id FROM patients WHERE clinic_id IN (
                    SELECT clinic_id FROM users WHERE user_id = auth.uid()
                )
            )
        )
    );

-- Medical Documents
CREATE POLICY "Users can view medical documents from their clinic" ON medical_documents
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM patients WHERE clinic_id IN (
                SELECT clinic_id FROM users WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can manage medical documents from their clinic" ON medical_documents
    FOR ALL USING (
        patient_id IN (
            SELECT id FROM patients WHERE clinic_id IN (
                SELECT clinic_id FROM users WHERE user_id = auth.uid()
            )
        )
    );

-- Anamneses
CREATE POLICY "Users can view anamneses from their clinic" ON anamneses
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM patients WHERE clinic_id IN (
                SELECT clinic_id FROM users WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can manage anamneses from their clinic" ON anamneses
    FOR ALL USING (
        patient_id IN (
            SELECT id FROM patients WHERE clinic_id IN (
                SELECT clinic_id FROM users WHERE user_id = auth.uid()
            )
        )
    );

-- Physical Exams
CREATE POLICY "Users can view physical exams from their clinic" ON physical_exams
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM patients WHERE clinic_id IN (
                SELECT clinic_id FROM users WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can manage physical exams from their clinic" ON physical_exams
    FOR ALL USING (
        patient_id IN (
            SELECT id FROM patients WHERE clinic_id IN (
                SELECT clinic_id FROM users WHERE user_id = auth.uid()
            )
        )
    );

-- =====================================================
-- PERMISSÕES PARA ROLES ANÔNIMOS E AUTENTICADOS
-- =====================================================

-- Conceder permissões básicas para role authenticated
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Conceder permissões limitadas para role anon (apenas leitura em tabelas públicas)
GRANT SELECT ON cid_diagnoses TO anon;

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

-- Este arquivo configura Row Level Security (RLS) para o sistema DataClínica
-- Principais características:
-- 1. Isolamento completo por clínica - usuários só veem dados de sua clínica
-- 2. Controle de acesso baseado em roles (admin, doctor, user)
-- 3. Políticas específicas para cada tipo de operação (SELECT, INSERT, UPDATE, DELETE)
-- 4. Segurança em cascata - documentos e registros seguem a clínica do paciente
-- 5. Tabelas globais (como CID) acessíveis a todos os usuários autenticados

-- Para testar as políticas:
-- 1. Crie usuários com diferentes roles e clínicas
-- 2. Teste operações CRUD com diferentes contextos de usuário
-- 3. Verifique se o isolamento por clínica está funcionando
-- 4. Confirme que apenas admins podem criar/editar configurações da clínica