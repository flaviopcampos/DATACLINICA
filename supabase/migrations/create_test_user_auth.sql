-- Criar usuário de teste no Supabase Auth e na tabela users
-- Este script deve ser executado no Supabase SQL Editor

-- 1. Primeiro, inserir o usuário na tabela users
INSERT INTO users (
  email,
  username,
  full_name,
  role,
  is_active,
  created_at,
  updated_at
) VALUES (
  'admin@dataclinica.com',
  'admin',
  'Administrador do Sistema',
  'admin',
  true,
  now(),
  now()
) ON CONFLICT (email) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- 2. Garantir permissões para a tabela users
GRANT SELECT, INSERT, UPDATE ON users TO anon;
GRANT SELECT, INSERT, UPDATE ON users TO authenticated;

-- 3. Verificar se o usuário foi criado
SELECT id, email, username, full_name, role, is_active 
FROM users 
WHERE email = 'admin@dataclinica.com';