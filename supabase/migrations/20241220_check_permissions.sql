-- Verificar e corrigir permissões das tabelas no Supabase

-- Verificar permissões atuais
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- Garantir permissões básicas para role anon (apenas SELECT em algumas tabelas)
GRANT SELECT ON clinics TO anon;
GRANT SELECT ON product_categories TO anon;
GRANT SELECT ON medications TO anon;
GRANT SELECT ON procedures TO anon;

-- Garantir permissões completas para role authenticated
GRANT ALL PRIVILEGES ON users TO authenticated;
GRANT ALL PRIVILEGES ON patients TO authenticated;
GRANT ALL PRIVILEGES ON doctors TO authenticated;
GRANT ALL PRIVILEGES ON appointments TO authenticated;
GRANT ALL PRIVILEGES ON medications TO authenticated;
GRANT ALL PRIVILEGES ON stock_movements TO authenticated;
GRANT ALL PRIVILEGES ON suppliers TO authenticated;
GRANT ALL PRIVILEGES ON products TO authenticated;
GRANT ALL PRIVILEGES ON financial_transactions TO authenticated;
GRANT ALL PRIVILEGES ON procedures TO authenticated;
GRANT ALL PRIVILEGES ON product_categories TO authenticated;
GRANT ALL PRIVILEGES ON medical_record_templates TO authenticated;
GRANT ALL PRIVILEGES ON patient_documents TO authenticated;
GRANT SELECT, UPDATE ON clinics TO authenticated;

-- Garantir permissões para tabelas sem clinic_id (acesso geral)
GRANT SELECT ON cid_diagnosis TO anon, authenticated;
GRANT SELECT ON insurance_plans TO anon, authenticated;

-- Garantir permissões para tabelas de relacionamento
GRANT ALL PRIVILEGES ON medical_records TO authenticated;
GRANT ALL PRIVILEGES ON medical_documents TO authenticated;
GRANT ALL PRIVILEGES ON prescriptions TO authenticated;
GRANT ALL PRIVILEGES ON prescription_medications TO authenticated;
GRANT ALL PRIVILEGES ON medical_record_diagnosis TO authenticated;
GRANT ALL PRIVILEGES ON anamnesis TO authenticated;
GRANT ALL PRIVILEGES ON physical_exams TO authenticated;

-- Verificar permissões após aplicação
SELECT 
    'Permissões aplicadas com sucesso' as status,
    COUNT(*) as total_permissions
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND grantee IN ('anon', 'authenticated');