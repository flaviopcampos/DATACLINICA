-- Implementação de Row Level Security (RLS) para todas as tabelas do DataClínica
-- Este arquivo implementa políticas de segurança baseadas em clinic_id e user roles
-- CORRIGIDO: Adaptado para usar integer IDs em vez de UUID

-- =============================================
-- HABILITAR RLS EM TODAS AS TABELAS
-- =============================================

-- Tabelas principais
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_documents ENABLE ROW LEVEL SECURITY;

-- Tabelas de configuração e referência
ALTER TABLE insurance_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE cid_diagnosis ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- Tabelas de relacionamento e detalhes
ALTER TABLE medical_record_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_record_diagnosis ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE anamnesis ENABLE ROW LEVEL SECURITY;
ALTER TABLE physical_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- FUNÇÃO AUXILIAR PARA OBTER USER_ID ATUAL
-- =============================================

-- Criar função para obter o user_id baseado no email do usuário autenticado
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT id FROM users 
        WHERE email = auth.jwt() ->> 'email'
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter clinic_id do usuário atual
CREATE OR REPLACE FUNCTION get_current_user_clinic_id()
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT clinic_id FROM users 
        WHERE email = auth.jwt() ->> 'email'
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se o usuário atual é admin
CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT role = 'admin' FROM users 
        WHERE email = auth.jwt() ->> 'email'
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- POLÍTICAS PARA TABELA USERS
-- =============================================

-- Usuários podem ver apenas seus próprios dados
CREATE POLICY "users_select_own" ON users
    FOR SELECT USING (email = auth.jwt() ->> 'email');

-- Usuários podem atualizar apenas seus próprios dados
CREATE POLICY "users_update_own" ON users
    FOR UPDATE USING (email = auth.jwt() ->> 'email');

-- Admins podem ver todos os usuários da mesma clínica
CREATE POLICY "users_select_clinic_admin" ON users
    FOR SELECT USING (
        clinic_id = get_current_user_clinic_id() AND is_current_user_admin()
    );

-- =============================================
-- POLÍTICAS PARA TABELA CLINICS
-- =============================================

-- Usuários podem ver apenas sua própria clínica
CREATE POLICY "clinics_select_own" ON clinics
    FOR SELECT USING (id = get_current_user_clinic_id());

-- Apenas admins podem atualizar dados da clínica
CREATE POLICY "clinics_update_admin" ON clinics
    FOR UPDATE USING (id = get_current_user_clinic_id() AND is_current_user_admin());

-- =============================================
-- POLÍTICAS PARA TABELA PATIENTS
-- =============================================

-- Usuários podem ver pacientes da mesma clínica
CREATE POLICY "patients_select_clinic" ON patients
    FOR SELECT USING (clinic_id = get_current_user_clinic_id());

-- Usuários podem inserir pacientes na sua clínica
CREATE POLICY "patients_insert_clinic" ON patients
    FOR INSERT WITH CHECK (clinic_id = get_current_user_clinic_id());

-- Usuários podem atualizar pacientes da sua clínica
CREATE POLICY "patients_update_clinic" ON patients
    FOR UPDATE USING (clinic_id = get_current_user_clinic_id());

-- =============================================
-- POLÍTICAS PARA TABELA DOCTORS
-- =============================================

-- Usuários podem ver médicos da mesma clínica
CREATE POLICY "doctors_select_clinic" ON doctors
    FOR SELECT USING (clinic_id = get_current_user_clinic_id());

-- Admins podem gerenciar médicos da clínica
CREATE POLICY "doctors_manage_admin" ON doctors
    FOR ALL USING (clinic_id = get_current_user_clinic_id() AND is_current_user_admin());

-- =============================================
-- POLÍTICAS PARA TABELA APPOINTMENTS
-- =============================================

-- Usuários podem ver consultas da mesma clínica
CREATE POLICY "appointments_select_clinic" ON appointments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM patients p 
            WHERE p.id = appointments.patient_id 
            AND p.clinic_id = get_current_user_clinic_id()
        )
    );

-- Usuários podem inserir consultas para pacientes da sua clínica
CREATE POLICY "appointments_insert_clinic" ON appointments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM patients p 
            WHERE p.id = appointments.patient_id 
            AND p.clinic_id = get_current_user_clinic_id()
        )
    );

-- Usuários podem atualizar consultas da sua clínica
CREATE POLICY "appointments_update_clinic" ON appointments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM patients p 
            WHERE p.id = appointments.patient_id 
            AND p.clinic_id = get_current_user_clinic_id()
        )
    );

-- =============================================
-- POLÍTICAS PARA TABELA MEDICAL_RECORDS
-- =============================================

-- Usuários podem ver prontuários de pacientes da sua clínica
CREATE POLICY "medical_records_select_clinic" ON medical_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM patients p 
            WHERE p.id = medical_records.patient_id 
            AND p.clinic_id = get_current_user_clinic_id()
        )
    );

-- Usuários podem inserir prontuários para pacientes da sua clínica
CREATE POLICY "medical_records_insert_clinic" ON medical_records
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM patients p 
            WHERE p.id = medical_records.patient_id 
            AND p.clinic_id = get_current_user_clinic_id()
        )
    );

-- Usuários podem atualizar prontuários da sua clínica
CREATE POLICY "medical_records_update_clinic" ON medical_records
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM patients p 
            WHERE p.id = medical_records.patient_id 
            AND p.clinic_id = get_current_user_clinic_id()
        )
    );

-- =============================================
-- POLÍTICAS PARA TABELA PRESCRIPTIONS
-- =============================================

-- Usuários podem ver prescrições de pacientes da sua clínica
CREATE POLICY "prescriptions_select_clinic" ON prescriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM patients p 
            WHERE p.id = prescriptions.patient_id 
            AND p.clinic_id = get_current_user_clinic_id()
        )
    );

-- Usuários podem inserir prescrições para pacientes da sua clínica
CREATE POLICY "prescriptions_insert_clinic" ON prescriptions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM patients p 
            WHERE p.id = prescriptions.patient_id 
            AND p.clinic_id = get_current_user_clinic_id()
        )
    );

-- Usuários podem atualizar prescrições da sua clínica
CREATE POLICY "prescriptions_update_clinic" ON prescriptions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM patients p 
            WHERE p.id = prescriptions.patient_id 
            AND p.clinic_id = get_current_user_clinic_id()
        )
    );

-- =============================================
-- POLÍTICAS PARA TABELAS DE REFERÊNCIA
-- =============================================

-- Tabelas de referência (medications, procedures, cid_diagnosis) são públicas para leitura
CREATE POLICY "medications_select_all" ON medications FOR SELECT USING (true);
CREATE POLICY "procedures_select_all" ON procedures FOR SELECT USING (true);
CREATE POLICY "cid_diagnosis_select_all" ON cid_diagnosis FOR SELECT USING (true);

-- Apenas admins podem modificar tabelas de referência
CREATE POLICY "medications_manage_admin" ON medications
    FOR ALL USING (is_current_user_admin());

CREATE POLICY "procedures_manage_admin" ON procedures
    FOR ALL USING (is_current_user_admin());

-- =============================================
-- POLÍTICAS PARA TABELAS DE ESTOQUE
-- =============================================

-- Produtos e categorias por clínica
CREATE POLICY "products_select_clinic" ON products
    FOR SELECT USING (clinic_id = get_current_user_clinic_id());

CREATE POLICY "products_manage_clinic" ON products
    FOR ALL USING (clinic_id = get_current_user_clinic_id());

-- Stock Movements policies (uses medication_id, not product_id)
CREATE POLICY "Users can view stock movements from their clinic" ON stock_movements
    FOR SELECT USING (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Users can insert stock movements for their clinic" ON stock_movements
    FOR INSERT WITH CHECK (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Users can update stock movements from their clinic" ON stock_movements
    FOR UPDATE USING (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Admins can delete stock movements from their clinic" ON stock_movements
    FOR DELETE USING (clinic_id = get_current_user_clinic_id() AND is_current_user_admin());

-- =============================================
-- POLÍTICAS PARA TABELAS FINANCEIRAS
-- =============================================

-- Transações financeiras por clínica
CREATE POLICY "financial_transactions_select_clinic" ON financial_transactions
    FOR SELECT USING (clinic_id = get_current_user_clinic_id());

CREATE POLICY "financial_transactions_manage_clinic" ON financial_transactions
    FOR ALL USING (clinic_id = get_current_user_clinic_id());

-- =============================================
-- POLÍTICAS PARA TABELAS DE RELACIONAMENTO
-- =============================================

-- Diagnósticos de prontuários
CREATE POLICY "medical_record_diagnosis_select_clinic" ON medical_record_diagnosis
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM medical_records mr 
            JOIN patients p ON p.id = mr.patient_id 
            WHERE mr.id = medical_record_diagnosis.medical_record_id 
            AND p.clinic_id = get_current_user_clinic_id()
        )
    );

CREATE POLICY "medical_record_diagnosis_manage_clinic" ON medical_record_diagnosis
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM medical_records mr 
            JOIN patients p ON p.id = mr.patient_id 
            WHERE mr.id = medical_record_diagnosis.medical_record_id 
            AND p.clinic_id = get_current_user_clinic_id()
        )
    );

-- Medicamentos de prescrições
CREATE POLICY "prescription_medications_select_clinic" ON prescription_medications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM prescriptions pr 
            JOIN patients p ON p.id = pr.patient_id 
            WHERE pr.id = prescription_medications.prescription_id 
            AND p.clinic_id = get_current_user_clinic_id()
        )
    );

CREATE POLICY "prescription_medications_manage_clinic" ON prescription_medications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM prescriptions pr 
            JOIN patients p ON p.id = pr.patient_id 
            WHERE pr.id = prescription_medications.prescription_id 
            AND p.clinic_id = get_current_user_clinic_id()
        )
    );

-- =============================================
-- POLÍTICAS PARA DOCUMENTOS E TEMPLATES
-- =============================================

-- Documentos de pacientes
CREATE POLICY "patient_documents_select_clinic" ON patient_documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM patients p 
            WHERE p.id = patient_documents.patient_id 
            AND p.clinic_id = get_current_user_clinic_id()
        )
    );

CREATE POLICY "patient_documents_manage_clinic" ON patient_documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM patients p 
            WHERE p.id = patient_documents.patient_id 
            AND p.clinic_id = get_current_user_clinic_id()
        )
    );

-- Templates de prontuários por clínica
CREATE POLICY "medical_record_templates_select_clinic" ON medical_record_templates
    FOR SELECT USING (clinic_id = get_current_user_clinic_id());

CREATE POLICY "medical_record_templates_manage_clinic" ON medical_record_templates
    FOR ALL USING (clinic_id = get_current_user_clinic_id());

-- =============================================
-- POLÍTICAS PARA EXAMES E ANAMNESE
-- =============================================

-- Anamnese por clínica
CREATE POLICY "anamnesis_select_clinic" ON anamnesis
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM patients p 
            WHERE p.id = anamnesis.patient_id 
            AND p.clinic_id = get_current_user_clinic_id()
        )
    );

CREATE POLICY "anamnesis_manage_clinic" ON anamnesis
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM patients p 
            WHERE p.id = anamnesis.patient_id 
            AND p.clinic_id = get_current_user_clinic_id()
        )
    );

-- Exames físicos por clínica
CREATE POLICY "physical_exams_select_clinic" ON physical_exams
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM patients p 
            WHERE p.id = physical_exams.patient_id 
            AND p.clinic_id = get_current_user_clinic_id()
        )
    );

CREATE POLICY "physical_exams_manage_clinic" ON physical_exams
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM patients p 
            WHERE p.id = physical_exams.patient_id 
            AND p.clinic_id = get_current_user_clinic_id()
        )
    );

-- =============================================
-- POLÍTICAS PARA FORNECEDORES E PLANOS
-- =============================================

-- Fornecedores por clínica
CREATE POLICY "suppliers_select_clinic" ON suppliers
    FOR SELECT USING (clinic_id = get_current_user_clinic_id());

CREATE POLICY "suppliers_manage_clinic" ON suppliers
    FOR ALL USING (clinic_id = get_current_user_clinic_id());

-- Planos de saúde por clínica
CREATE POLICY "insurance_plans_select_clinic" ON insurance_plans
    FOR SELECT USING (clinic_id = get_current_user_clinic_id());

CREATE POLICY "insurance_plans_manage_clinic" ON insurance_plans
    FOR ALL USING (clinic_id = get_current_user_clinic_id());

-- Categorias de produtos por clínica
CREATE POLICY "product_categories_select_clinic" ON product_categories
    FOR SELECT USING (clinic_id = get_current_user_clinic_id());

CREATE POLICY "product_categories_manage_clinic" ON product_categories
    FOR ALL USING (clinic_id = get_current_user_clinic_id());

-- Documentos médicos por clínica
CREATE POLICY "medical_documents_select_clinic" ON medical_documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM patients p 
            WHERE p.id = medical_documents.patient_id 
            AND p.clinic_id = get_current_user_clinic_id()
        )
    );

CREATE POLICY "medical_documents_manage_clinic" ON medical_documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM patients p 
            WHERE p.id = medical_documents.patient_id 
            AND p.clinic_id = get_current_user_clinic_id()
        )
    );

-- =============================================
-- COMENTÁRIOS E OBSERVAÇÕES
-- =============================================

/*
Este arquivo implementa um sistema completo de Row Level Security (RLS) para o DataClínica.

Princípios aplicados:
1. Isolamento por clínica: Usuários só veem dados da sua clínica
2. Controle de roles: Admins têm permissões adicionais
3. Segurança em cascata: Políticas baseadas em relacionamentos
4. Tabelas de referência: Dados públicos para leitura, restritos para escrita

Funções auxiliares criadas:
- get_current_user_id(): Retorna o ID do usuário atual
- get_current_user_clinic_id(): Retorna o clinic_id do usuário atual
- is_current_user_admin(): Verifica se o usuário atual é admin

Todas as políticas seguem o padrão:
- SELECT: Baseado em clinic_id através de funções auxiliares
- INSERT: Verificação de clinic_id no WITH CHECK
- UPDATE/DELETE: Baseado em clinic_id através de funções auxiliares

Para testar as políticas, use:
SELECT * FROM pg_policies WHERE schemaname = 'public';
*/