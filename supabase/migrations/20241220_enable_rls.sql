-- Habilitar RLS (Row Level Security) em todas as tabelas com clinic_id

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
ALTER TABLE medical_record_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;

-- Comentário explicativo
COMMENT ON TABLE users IS 'Tabela de usuários com RLS habilitado para isolamento por clínica';
COMMENT ON TABLE patients IS 'Tabela de pacientes com RLS habilitado para isolamento por clínica';
COMMENT ON TABLE doctors IS 'Tabela de médicos com RLS habilitado para isolamento por clínica';
COMMENT ON TABLE appointments IS 'Tabela de consultas com RLS habilitado para isolamento por clínica';
COMMENT ON TABLE medications IS 'Tabela de medicamentos com RLS habilitado para isolamento por clínica';
COMMENT ON TABLE stock_movements IS 'Tabela de movimentações de estoque com RLS habilitado para isolamento por clínica';
COMMENT ON TABLE suppliers IS 'Tabela de fornecedores com RLS habilitado para isolamento por clínica';
COMMENT ON TABLE products IS 'Tabela de produtos com RLS habilitado para isolamento por clínica';
COMMENT ON TABLE financial_transactions IS 'Tabela de transações financeiras com RLS habilitado para isolamento por clínica';
COMMENT ON TABLE procedures IS 'Tabela de procedimentos com RLS habilitado para isolamento por clínica';
COMMENT ON TABLE product_categories IS 'Tabela de categorias de produtos com RLS habilitado para isolamento por clínica';
COMMENT ON TABLE medical_record_templates IS 'Tabela de templates de prontuários com RLS habilitado para isolamento por clínica';
COMMENT ON TABLE patient_documents IS 'Tabela de documentos de pacientes com RLS habilitado para isolamento por clínica';
COMMENT ON TABLE clinics IS 'Tabela de clínicas com RLS habilitado para acesso restrito';