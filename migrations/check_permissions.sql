-- Script para verificar e corrigir permissões das tabelas
-- Execute este script no Supabase SQL Editor

-- 1. Verificar permissões atuais
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- 2. Conceder permissões básicas para role anon (usuários não autenticados)
-- Apenas SELECT para tabelas de referência
GRANT SELECT ON cid_diagnosis TO anon;
GRANT SELECT ON insurance_plans TO anon;
GRANT SELECT ON product_categories TO anon;
GRANT SELECT ON medications TO anon;
GRANT SELECT ON procedures TO anon;

-- 3. Conceder permissões completas para role authenticated (usuários autenticados)
-- Todas as tabelas principais
GRANT ALL PRIVILEGES ON clinics TO authenticated;
GRANT ALL PRIVILEGES ON users TO authenticated;
GRANT ALL PRIVILEGES ON patients TO authenticated;
GRANT ALL PRIVILEGES ON patient_documents TO authenticated;
GRANT ALL PRIVILEGES ON doctors TO authenticated;
GRANT ALL PRIVILEGES ON medical_record_templates TO authenticated;
GRANT ALL PRIVILEGES ON cid_diagnosis TO authenticated;
GRANT ALL PRIVILEGES ON medical_record_diagnosis TO authenticated;
GRANT ALL PRIVILEGES ON prescriptions TO authenticated;
GRANT ALL PRIVILEGES ON prescription_medications TO authenticated;
GRANT ALL PRIVILEGES ON medical_documents TO authenticated;
GRANT ALL PRIVILEGES ON anamnesis TO authenticated;
GRANT ALL PRIVILEGES ON physical_exams TO authenticated;
GRANT ALL PRIVILEGES ON appointments TO authenticated;
GRANT ALL PRIVILEGES ON medical_records TO authenticated;
GRANT ALL PRIVILEGES ON insurance_plans TO authenticated;
GRANT ALL PRIVILEGES ON procedures TO authenticated;
GRANT ALL PRIVILEGES ON medications TO authenticated;
GRANT ALL PRIVILEGES ON stock_movements TO authenticated;
GRANT ALL PRIVILEGES ON financial_transactions TO authenticated;
GRANT ALL PRIVILEGES ON suppliers TO authenticated;
GRANT ALL PRIVILEGES ON product_categories TO authenticated;
GRANT ALL PRIVILEGES ON products TO authenticated;

-- 4. Verificar permissões após a correção
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- 5. Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;