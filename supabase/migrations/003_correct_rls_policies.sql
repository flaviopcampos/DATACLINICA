-- Correct RLS policies implementation
-- This migration properly handles tables with and without clinic_id

-- Drop existing policies and functions
DROP POLICY IF EXISTS "Users can view stock movements from their clinic" ON stock_movements;
DROP POLICY IF EXISTS "Users can insert stock movements for their clinic" ON stock_movements;
DROP POLICY IF EXISTS "Users can update stock movements from their clinic" ON stock_movements;
DROP POLICY IF EXISTS "Admins can delete stock movements from their clinic" ON stock_movements;
DROP POLICY IF EXISTS "stock_movements_select_clinic" ON stock_movements;
DROP POLICY IF EXISTS "stock_movements_insert_clinic" ON stock_movements;

-- Drop all existing policies to start fresh
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- Drop existing helper functions if they exist
DROP FUNCTION IF EXISTS get_current_user_id();
DROP FUNCTION IF EXISTS get_current_user_clinic_id();
DROP FUNCTION IF EXISTS is_current_user_admin();

-- Create helper functions to get user information from JWT
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

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE anamnesis ENABLE ROW LEVEL SECURITY;
ALTER TABLE physical_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_record_diagnosis ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_record_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE cid_diagnosis ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POLICIES FOR TABLES WITH CLINIC_ID
-- =============================================

-- Users policies
CREATE POLICY "users_select_own_clinic" ON users
    FOR SELECT USING (clinic_id = get_current_user_clinic_id());

CREATE POLICY "users_update_own_clinic" ON users
    FOR UPDATE USING (clinic_id = get_current_user_clinic_id());

CREATE POLICY "admins_insert_users" ON users
    FOR INSERT WITH CHECK (is_current_user_admin() AND clinic_id = get_current_user_clinic_id());

CREATE POLICY "admins_delete_users" ON users
    FOR DELETE USING (is_current_user_admin() AND clinic_id = get_current_user_clinic_id());

-- Clinics policies
CREATE POLICY "clinics_select_own" ON clinics
    FOR SELECT USING (id = get_current_user_clinic_id());

CREATE POLICY "admins_update_clinic" ON clinics
    FOR UPDATE USING (is_current_user_admin() AND id = get_current_user_clinic_id());

-- Patients policies
CREATE POLICY "patients_clinic_access" ON patients
    FOR ALL USING (clinic_id = get_current_user_clinic_id());

-- Doctors policies
CREATE POLICY "doctors_clinic_access" ON doctors
    FOR ALL USING (clinic_id = get_current_user_clinic_id());

-- Appointments policies
CREATE POLICY "appointments_clinic_access" ON appointments
    FOR ALL USING (clinic_id = get_current_user_clinic_id());

-- Medical Records policies
CREATE POLICY "medical_records_clinic_access" ON medical_records
    FOR ALL USING (clinic_id = get_current_user_clinic_id());

-- Medical Documents policies
CREATE POLICY "medical_documents_clinic_access" ON medical_documents
    FOR ALL USING (clinic_id = get_current_user_clinic_id());

-- Prescriptions policies
CREATE POLICY "prescriptions_clinic_access" ON prescriptions
    FOR ALL USING (clinic_id = get_current_user_clinic_id());

-- Medications policies (has clinic_id)
CREATE POLICY "medications_clinic_access" ON medications
    FOR ALL USING (clinic_id = get_current_user_clinic_id());

-- Suppliers policies
CREATE POLICY "suppliers_clinic_access" ON suppliers
    FOR ALL USING (clinic_id = get_current_user_clinic_id());

-- Products policies
CREATE POLICY "products_clinic_access" ON products
    FOR ALL USING (clinic_id = get_current_user_clinic_id());

-- Product Categories policies (has clinic_id)
CREATE POLICY "product_categories_clinic_access" ON product_categories
    FOR ALL USING (clinic_id = get_current_user_clinic_id());

-- Stock Movements policies
CREATE POLICY "stock_movements_clinic_access" ON stock_movements
    FOR ALL USING (clinic_id = get_current_user_clinic_id());

-- Financial Transactions policies
CREATE POLICY "financial_transactions_clinic_access" ON financial_transactions
    FOR ALL USING (clinic_id = get_current_user_clinic_id());

-- Insurance Plans policies
CREATE POLICY "insurance_plans_clinic_access" ON insurance_plans
    FOR ALL USING (clinic_id = get_current_user_clinic_id());

-- Procedures policies
CREATE POLICY "procedures_clinic_access" ON procedures
    FOR ALL USING (clinic_id = get_current_user_clinic_id());

-- Anamnesis policies
CREATE POLICY "anamnesis_clinic_access" ON anamnesis
    FOR ALL USING (clinic_id = get_current_user_clinic_id());

-- Physical Exams policies
CREATE POLICY "physical_exams_clinic_access" ON physical_exams
    FOR ALL USING (clinic_id = get_current_user_clinic_id());

-- Medical Record Templates policies
CREATE POLICY "medical_record_templates_clinic_access" ON medical_record_templates
    FOR ALL USING (clinic_id = get_current_user_clinic_id());

-- =============================================
-- POLICIES FOR JUNCTION/RELATIONSHIP TABLES
-- =============================================

-- Prescription Medications policies (junction table)
CREATE POLICY "prescription_medications_clinic_access" ON prescription_medications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM prescriptions p 
            WHERE p.id = prescription_medications.prescription_id 
            AND p.clinic_id = get_current_user_clinic_id()
        )
    );

-- Medical Record Diagnosis policies (junction table)
CREATE POLICY "medical_record_diagnosis_clinic_access" ON medical_record_diagnosis
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM medical_records mr 
            WHERE mr.id = medical_record_diagnosis.medical_record_id 
            AND mr.clinic_id = get_current_user_clinic_id()
        )
    );

-- Patient Documents policies (related to patients)
CREATE POLICY "patient_documents_clinic_access" ON patient_documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM patients p 
            WHERE p.id = patient_documents.patient_id 
            AND p.clinic_id = get_current_user_clinic_id()
        )
    );

-- =============================================
-- POLICIES FOR REFERENCE TABLES (NO CLINIC_ID)
-- =============================================

-- CID Diagnosis policies (reference table - no clinic_id)
CREATE POLICY "cid_diagnosis_read_all" ON cid_diagnosis
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "admins_manage_cid_diagnosis" ON cid_diagnosis
    FOR INSERT WITH CHECK (is_current_user_admin());

CREATE POLICY "admins_update_cid_diagnosis" ON cid_diagnosis
    FOR UPDATE USING (is_current_user_admin());

CREATE POLICY "admins_delete_cid_diagnosis" ON cid_diagnosis
    FOR DELETE USING (is_current_user_admin());

-- =============================================
-- GRANT PERMISSIONS TO ROLES
-- =============================================

-- Grant basic permissions to anon role (for login)
GRANT SELECT ON users TO anon;
GRANT SELECT ON clinics TO anon;

-- Grant full permissions to authenticated role
GRANT ALL PRIVILEGES ON users TO authenticated;
GRANT ALL PRIVILEGES ON clinics TO authenticated;
GRANT ALL PRIVILEGES ON patients TO authenticated;
GRANT ALL PRIVILEGES ON doctors TO authenticated;
GRANT ALL PRIVILEGES ON appointments TO authenticated;
GRANT ALL PRIVILEGES ON medical_records TO authenticated;
GRANT ALL PRIVILEGES ON medical_documents TO authenticated;
GRANT ALL PRIVILEGES ON prescriptions TO authenticated;
GRANT ALL PRIVILEGES ON prescription_medications TO authenticated;
GRANT ALL PRIVILEGES ON medications TO authenticated;
GRANT ALL PRIVILEGES ON suppliers TO authenticated;
GRANT ALL PRIVILEGES ON products TO authenticated;
GRANT ALL PRIVILEGES ON product_categories TO authenticated;
GRANT ALL PRIVILEGES ON stock_movements TO authenticated;
GRANT ALL PRIVILEGES ON financial_transactions TO authenticated;
GRANT ALL PRIVILEGES ON insurance_plans TO authenticated;
GRANT ALL PRIVILEGES ON procedures TO authenticated;
GRANT ALL PRIVILEGES ON anamnesis TO authenticated;
GRANT ALL PRIVILEGES ON physical_exams TO authenticated;
GRANT ALL PRIVILEGES ON medical_record_diagnosis TO authenticated;
GRANT ALL PRIVILEGES ON medical_record_templates TO authenticated;
GRANT ALL PRIVILEGES ON patient_documents TO authenticated;
GRANT ALL PRIVILEGES ON cid_diagnosis TO authenticated;