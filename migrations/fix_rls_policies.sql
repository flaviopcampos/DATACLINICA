-- Script para corrigir políticas RLS e permitir operações básicas

-- Remover políticas existentes que podem estar muito restritivas
DROP POLICY IF EXISTS "clinic_policy" ON clinics;
DROP POLICY IF EXISTS "user_policy" ON users;
DROP POLICY IF EXISTS "patient_policy" ON patients;
DROP POLICY IF EXISTS "doctor_policy" ON doctors;
DROP POLICY IF EXISTS "appointment_policy" ON appointments;

-- Criar políticas mais permissivas para desenvolvimento
-- Política para clínicas - permitir todas as operações para usuários autenticados
CREATE POLICY "clinics_all_operations" ON clinics
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para usuários - permitir todas as operações para usuários autenticados
CREATE POLICY "users_all_operations" ON users
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para pacientes - permitir todas as operações para usuários autenticados
CREATE POLICY "patients_all_operations" ON patients
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para médicos - permitir todas as operações para usuários autenticados
CREATE POLICY "doctors_all_operations" ON doctors
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para consultas - permitir todas as operações para usuários autenticados
CREATE POLICY "appointments_all_operations" ON appointments
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para prontuários - permitir todas as operações para usuários autenticados
CREATE POLICY "medical_records_all_operations" ON medical_records
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para documentos de pacientes - permitir todas as operações para usuários autenticados
CREATE POLICY "patient_documents_all_operations" ON patient_documents
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para prescrições - permitir todas as operações para usuários autenticados
CREATE POLICY "prescriptions_all_operations" ON prescriptions
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para medicamentos de prescrição - permitir todas as operações para usuários autenticados
CREATE POLICY "prescription_medications_all_operations" ON prescription_medications
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para documentos médicos - permitir todas as operações para usuários autenticados
CREATE POLICY "medical_documents_all_operations" ON medical_documents
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para anamnese - permitir todas as operações para usuários autenticados
CREATE POLICY "anamnesis_all_operations" ON anamnesis
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para exames físicos - permitir todas as operações para usuários autenticados
CREATE POLICY "physical_exams_all_operations" ON physical_exams
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para procedimentos - permitir todas as operações para usuários autenticados
CREATE POLICY "procedures_all_operations" ON procedures
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para medicamentos - permitir todas as operações para usuários autenticados
CREATE POLICY "medications_all_operations" ON medications
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para movimentações de estoque - permitir todas as operações para usuários autenticados
CREATE POLICY "stock_movements_all_operations" ON stock_movements
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para transações financeiras - permitir todas as operações para usuários autenticados
CREATE POLICY "financial_transactions_all_operations" ON financial_transactions
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para fornecedores - permitir todas as operações para usuários autenticados
CREATE POLICY "suppliers_all_operations" ON suppliers
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para categorias de produtos - permitir todas as operações para usuários autenticados
CREATE POLICY "product_categories_all_operations" ON product_categories
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para produtos - permitir todas as operações para usuários autenticados
CREATE POLICY "products_all_operations" ON products
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para templates de prontuário - permitir todas as operações para usuários autenticados
CREATE POLICY "medical_record_templates_all_operations" ON medical_record_templates
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para diagnósticos de prontuário - permitir todas as operações para usuários autenticados
CREATE POLICY "medical_record_diagnosis_all_operations" ON medical_record_diagnosis
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para planos de saúde - permitir todas as operações para usuários autenticados
CREATE POLICY "insurance_plans_all_operations" ON insurance_plans
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Permitir acesso de leitura para role anon em tabelas de referência
CREATE POLICY "cid_diagnosis_read_anon" ON cid_diagnosis
    FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "insurance_plans_read_anon" ON insurance_plans
    FOR SELECT
    TO anon
    USING (true);

-- Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;