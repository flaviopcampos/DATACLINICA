-- Implementação final das políticas RLS para DataClínica
-- Remove políticas e funções existentes e recria corretamente

-- Remove políticas RLS existentes
DROP POLICY IF EXISTS "Users can view their own clinic data" ON users;
DROP POLICY IF EXISTS "Users can update their own clinic data" ON users;
DROP POLICY IF EXISTS "Users can insert in their clinic" ON users;
DROP POLICY IF EXISTS "Users can delete from their clinic" ON users;

DROP POLICY IF EXISTS "Users can view patients from their clinic" ON patients;
DROP POLICY IF EXISTS "Users can insert patients in their clinic" ON patients;
DROP POLICY IF EXISTS "Users can update patients from their clinic" ON patients;
DROP POLICY IF EXISTS "Users can delete patients from their clinic" ON patients;

DROP POLICY IF EXISTS "Users can view doctors from their clinic" ON doctors;
DROP POLICY IF EXISTS "Users can insert doctors in their clinic" ON doctors;
DROP POLICY IF EXISTS "Users can update doctors from their clinic" ON doctors;
DROP POLICY IF EXISTS "Users can delete doctors from their clinic" ON doctors;

DROP POLICY IF EXISTS "Users can view appointments from their clinic" ON appointments;
DROP POLICY IF EXISTS "Users can insert appointments in their clinic" ON appointments;
DROP POLICY IF EXISTS "Users can update appointments from their clinic" ON appointments;
DROP POLICY IF EXISTS "Users can delete appointments from their clinic" ON appointments;

DROP POLICY IF EXISTS "Users can view medications from their clinic" ON medications;
DROP POLICY IF EXISTS "Users can insert medications in their clinic" ON medications;
DROP POLICY IF EXISTS "Users can update medications from their clinic" ON medications;
DROP POLICY IF EXISTS "Users can delete medications from their clinic" ON medications;

DROP POLICY IF EXISTS "Users can view stock movements from their clinic" ON stock_movements;
DROP POLICY IF EXISTS "Users can insert stock movements in their clinic" ON stock_movements;
DROP POLICY IF EXISTS "Users can update stock movements from their clinic" ON stock_movements;
DROP POLICY IF EXISTS "Users can delete stock movements from their clinic" ON stock_movements;

DROP POLICY IF EXISTS "Users can view suppliers from their clinic" ON suppliers;
DROP POLICY IF EXISTS "Users can insert suppliers in their clinic" ON suppliers;
DROP POLICY IF EXISTS "Users can update suppliers from their clinic" ON suppliers;
DROP POLICY IF EXISTS "Users can delete suppliers from their clinic" ON suppliers;

DROP POLICY IF EXISTS "Users can view products from their clinic" ON products;
DROP POLICY IF EXISTS "Users can insert products in their clinic" ON products;
DROP POLICY IF EXISTS "Users can update products from their clinic" ON products;
DROP POLICY IF EXISTS "Users can delete products from their clinic" ON products;

DROP POLICY IF EXISTS "Users can view financial transactions from their clinic" ON financial_transactions;
DROP POLICY IF EXISTS "Users can insert financial transactions in their clinic" ON financial_transactions;
DROP POLICY IF EXISTS "Users can update financial transactions from their clinic" ON financial_transactions;
DROP POLICY IF EXISTS "Users can delete financial transactions from their clinic" ON financial_transactions;

DROP POLICY IF EXISTS "Users can view procedures from their clinic" ON procedures;
DROP POLICY IF EXISTS "Users can insert procedures in their clinic" ON procedures;
DROP POLICY IF EXISTS "Users can update procedures from their clinic" ON procedures;
DROP POLICY IF EXISTS "Users can delete procedures from their clinic" ON procedures;

DROP POLICY IF EXISTS "Users can view product categories from their clinic" ON product_categories;
DROP POLICY IF EXISTS "Users can insert product categories in their clinic" ON product_categories;
DROP POLICY IF EXISTS "Users can update product categories from their clinic" ON product_categories;
DROP POLICY IF EXISTS "Users can delete product categories from their clinic" ON product_categories;

DROP POLICY IF EXISTS "Users can view clinics" ON clinics;
DROP POLICY IF EXISTS "Admins can manage clinics" ON clinics;

DROP POLICY IF EXISTS "Users can view patient documents from their clinic" ON patient_documents;
DROP POLICY IF EXISTS "Users can insert patient documents in their clinic" ON patient_documents;
DROP POLICY IF EXISTS "Users can update patient documents from their clinic" ON patient_documents;
DROP POLICY IF EXISTS "Users can delete patient documents from their clinic" ON patient_documents;

DROP POLICY IF EXISTS "Users can view medical record templates from their clinic" ON medical_record_templates;
DROP POLICY IF EXISTS "Users can insert medical record templates in their clinic" ON medical_record_templates;
DROP POLICY IF EXISTS "Users can update medical record templates from their clinic" ON medical_record_templates;
DROP POLICY IF EXISTS "Users can delete medical record templates from their clinic" ON medical_record_templates;

-- Políticas para tabelas de referência (sem clinic_id)
DROP POLICY IF EXISTS "Everyone can view CID diagnosis" ON cid_diagnosis;
DROP POLICY IF EXISTS "Authenticated users can view CID diagnosis" ON cid_diagnosis;
DROP POLICY IF EXISTS "Admins can manage CID diagnosis" ON cid_diagnosis;

-- Remove funções auxiliares existentes
DROP FUNCTION IF EXISTS get_current_user_id();
DROP FUNCTION IF EXISTS get_current_user_clinic_id();
DROP FUNCTION IF EXISTS is_current_user_admin();

-- Cria funções auxiliares para obter informações do usuário
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT id 
    FROM users 
    WHERE email = (auth.jwt() ->> 'email')::text
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_current_user_clinic_id()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT clinic_id 
    FROM users 
    WHERE email = (auth.jwt() ->> 'email')::text
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'admin'
    FROM users 
    WHERE email = (auth.jwt() ->> 'email')::text
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Habilita RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_record_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE cid_diagnosis ENABLE ROW LEVEL SECURITY;

-- Políticas para tabelas com clinic_id

-- Users
CREATE POLICY "Users can view their own clinic data" ON users
  FOR SELECT USING (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Users can update their own clinic data" ON users
  FOR UPDATE USING (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Users can insert in their clinic" ON users
  FOR INSERT WITH CHECK (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Admins can delete users" ON users
  FOR DELETE USING (is_current_user_admin());

-- Patients
CREATE POLICY "Users can view patients from their clinic" ON patients
  FOR SELECT USING (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Users can insert patients in their clinic" ON patients
  FOR INSERT WITH CHECK (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Users can update patients from their clinic" ON patients
  FOR UPDATE USING (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Users can delete patients from their clinic" ON patients
  FOR DELETE USING (clinic_id = get_current_user_clinic_id());

-- Doctors
CREATE POLICY "Users can view doctors from their clinic" ON doctors
  FOR SELECT USING (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Users can insert doctors in their clinic" ON doctors
  FOR INSERT WITH CHECK (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Users can update doctors from their clinic" ON doctors
  FOR UPDATE USING (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Users can delete doctors from their clinic" ON doctors
  FOR DELETE USING (clinic_id = get_current_user_clinic_id());

-- Appointments
CREATE POLICY "Users can view appointments from their clinic" ON appointments
  FOR SELECT USING (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Users can insert appointments in their clinic" ON appointments
  FOR INSERT WITH CHECK (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Users can update appointments from their clinic" ON appointments
  FOR UPDATE USING (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Users can delete appointments from their clinic" ON appointments
  FOR DELETE USING (clinic_id = get_current_user_clinic_id());

-- Medications
CREATE POLICY "Users can view medications from their clinic" ON medications
  FOR SELECT USING (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Users can insert medications in their clinic" ON medications
  FOR INSERT WITH CHECK (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Users can update medications from their clinic" ON medications
  FOR UPDATE USING (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Users can delete medications from their clinic" ON medications
  FOR DELETE USING (clinic_id = get_current_user_clinic_id());

-- Stock Movements
CREATE POLICY "Users can view stock movements from their clinic" ON stock_movements
  FOR SELECT USING (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Users can insert stock movements in their clinic" ON stock_movements
  FOR INSERT WITH CHECK (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Users can update stock movements from their clinic" ON stock_movements
  FOR UPDATE USING (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Users can delete stock movements from their clinic" ON stock_movements
  FOR DELETE USING (clinic_id = get_current_user_clinic_id());

-- Suppliers
CREATE POLICY "Users can view suppliers from their clinic" ON suppliers
  FOR SELECT USING (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Users can insert suppliers in their clinic" ON suppliers
  FOR INSERT WITH CHECK (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Users can update suppliers from their clinic" ON suppliers
  FOR UPDATE USING (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Users can delete suppliers from their clinic" ON suppliers
  FOR DELETE USING (clinic_id = get_current_user_clinic_id());

-- Products
CREATE POLICY "Users can view products from their clinic" ON products
  FOR SELECT USING (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Users can insert products in their clinic" ON products
  FOR INSERT WITH CHECK (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Users can update products from their clinic" ON products
  FOR UPDATE USING (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Users can delete products from their clinic" ON products
  FOR DELETE USING (clinic_id = get_current_user_clinic_id());

-- Financial Transactions
CREATE POLICY "Users can view financial transactions from their clinic" ON financial_transactions
  FOR SELECT USING (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Users can insert financial transactions in their clinic" ON financial_transactions
  FOR INSERT WITH CHECK (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Users can update financial transactions from their clinic" ON financial_transactions
  FOR UPDATE USING (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Users can delete financial transactions from their clinic" ON financial_transactions
  FOR DELETE USING (clinic_id = get_current_user_clinic_id());

-- Procedures
CREATE POLICY "Users can view procedures from their clinic" ON procedures
  FOR SELECT USING (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Users can insert procedures in their clinic" ON procedures
  FOR INSERT WITH CHECK (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Users can update procedures from their clinic" ON procedures
  FOR UPDATE USING (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Users can delete procedures from their clinic" ON procedures
  FOR DELETE USING (clinic_id = get_current_user_clinic_id());

-- Product Categories
CREATE POLICY "Users can view product categories from their clinic" ON product_categories
  FOR SELECT USING (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Users can insert product categories in their clinic" ON product_categories
  FOR INSERT WITH CHECK (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Users can update product categories from their clinic" ON product_categories
  FOR UPDATE USING (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Users can delete product categories from their clinic" ON product_categories
  FOR DELETE USING (clinic_id = get_current_user_clinic_id());

-- Patient Documents
CREATE POLICY "Users can view patient documents from their clinic" ON patient_documents
  FOR SELECT USING (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Users can insert patient documents in their clinic" ON patient_documents
  FOR INSERT WITH CHECK (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Users can update patient documents from their clinic" ON patient_documents
  FOR UPDATE USING (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Users can delete patient documents from their clinic" ON patient_documents
  FOR DELETE USING (clinic_id = get_current_user_clinic_id());

-- Medical Record Templates
CREATE POLICY "Users can view medical record templates from their clinic" ON medical_record_templates
  FOR SELECT USING (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Users can insert medical record templates in their clinic" ON medical_record_templates
  FOR INSERT WITH CHECK (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Users can update medical record templates from their clinic" ON medical_record_templates
  FOR UPDATE USING (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Users can delete medical record templates from their clinic" ON medical_record_templates
  FOR DELETE USING (clinic_id = get_current_user_clinic_id());

-- Clinics (políticas especiais)
CREATE POLICY "Users can view their own clinic" ON clinics
  FOR SELECT USING (id = get_current_user_clinic_id());

CREATE POLICY "Admins can manage all clinics" ON clinics
  FOR ALL USING (is_current_user_admin());

-- Políticas para tabelas de referência (sem clinic_id)
-- CID Diagnosis - tabela de referência, todos podem ler
CREATE POLICY "Everyone can view CID diagnosis" ON cid_diagnosis
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage CID diagnosis" ON cid_diagnosis
  FOR ALL USING (is_current_user_admin());

-- Concede permissões para os roles anon e authenticated
GRANT SELECT ON users TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON users TO authenticated;

GRANT SELECT ON patients TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON patients TO authenticated;

GRANT SELECT ON doctors TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON doctors TO authenticated;

GRANT SELECT ON appointments TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON appointments TO authenticated;

GRANT SELECT ON medications TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON medications TO authenticated;

GRANT SELECT ON stock_movements TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON stock_movements TO authenticated;

GRANT SELECT ON suppliers TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON suppliers TO authenticated;

GRANT SELECT ON products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON products TO authenticated;

GRANT SELECT ON financial_transactions TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON financial_transactions TO authenticated;

GRANT SELECT ON procedures TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON procedures TO authenticated;

GRANT SELECT ON product_categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON product_categories TO authenticated;

GRANT SELECT ON clinics TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON clinics TO authenticated;

GRANT SELECT ON patient_documents TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON patient_documents TO authenticated;

GRANT SELECT ON medical_record_templates TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON medical_record_templates TO authenticated;

GRANT SELECT ON cid_diagnosis TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON cid_diagnosis TO authenticated;

-- Concede permissões nas sequências
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;