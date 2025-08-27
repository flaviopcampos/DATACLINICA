-- Políticas RLS para isolamento de dados por clínica

-- Função para obter o clinic_id do usuário autenticado
CREATE OR REPLACE FUNCTION get_user_clinic_id()
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT clinic_id FROM users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas para tabela users
CREATE POLICY "Users can view own clinic data" ON users
  FOR SELECT USING (clinic_id = get_user_clinic_id() OR clinic_id IS NULL);

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (clinic_id = get_user_clinic_id() OR clinic_id IS NULL);

CREATE POLICY "Users can update own clinic data" ON users
  FOR UPDATE USING (clinic_id = get_user_clinic_id() OR clinic_id IS NULL);

-- Políticas para tabela patients
CREATE POLICY "Patients clinic isolation" ON patients
  FOR ALL USING (clinic_id = get_user_clinic_id());

-- Políticas para tabela doctors
CREATE POLICY "Doctors clinic isolation" ON doctors
  FOR ALL USING (clinic_id = get_user_clinic_id());

-- Políticas para tabela appointments
CREATE POLICY "Appointments clinic isolation" ON appointments
  FOR ALL USING (clinic_id = get_user_clinic_id());

-- Políticas para tabela medications
CREATE POLICY "Medications clinic isolation" ON medications
  FOR ALL USING (clinic_id = get_user_clinic_id());

-- Políticas para tabela stock_movements
CREATE POLICY "Stock movements clinic isolation" ON stock_movements
  FOR ALL USING (clinic_id = get_user_clinic_id());

-- Políticas para tabela suppliers
CREATE POLICY "Suppliers clinic isolation" ON suppliers
  FOR ALL USING (clinic_id = get_user_clinic_id());

-- Políticas para tabela products
CREATE POLICY "Products clinic isolation" ON products
  FOR ALL USING (clinic_id = get_user_clinic_id());

-- Políticas para tabela financial_transactions
CREATE POLICY "Financial transactions clinic isolation" ON financial_transactions
  FOR ALL USING (clinic_id = get_user_clinic_id());

-- Políticas para tabela procedures
CREATE POLICY "Procedures clinic isolation" ON procedures
  FOR ALL USING (clinic_id = get_user_clinic_id());

-- Políticas para tabela product_categories
CREATE POLICY "Product categories clinic isolation" ON product_categories
  FOR ALL USING (clinic_id = get_user_clinic_id());

-- Políticas para tabela medical_record_templates
CREATE POLICY "Medical record templates clinic isolation" ON medical_record_templates
  FOR ALL USING (clinic_id = get_user_clinic_id());

-- Políticas para tabela patient_documents (baseada no patient_id)
CREATE POLICY "Patient documents clinic isolation" ON patient_documents
  FOR ALL USING (
    patient_id IN (
      SELECT id FROM patients WHERE clinic_id = get_user_clinic_id()
    )
  );

-- Políticas para tabela clinics (usuários só podem ver sua própria clínica)
CREATE POLICY "Clinics own data only" ON clinics
  FOR SELECT USING (id = get_user_clinic_id());

CREATE POLICY "Clinics can update own data" ON clinics
  FOR UPDATE USING (id = get_user_clinic_id());

-- Conceder permissões básicas para roles anon e authenticated
GRANT SELECT ON users TO anon, authenticated;
GRANT INSERT, UPDATE ON users TO authenticated;

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

-- Comentário explicativo
COMMENT ON FUNCTION get_user_clinic_id() IS 'Função para obter o clinic_id do usuário autenticado, usada nas políticas RLS';