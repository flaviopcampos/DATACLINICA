-- Adicionar campo username à tabela users
-- Data: 2025-01-14
-- Descrição: Adiciona campo username para permitir login por nome de usuário

-- Adicionar coluna username à tabela users
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(255) UNIQUE;

-- Criar índice para otimizar buscas por username
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Atualizar o usuário admin existente para ter username = 'admin'
UPDATE users 
SET username = 'admin' 
WHERE email = 'admin@dataclinica.com.br' AND role = 'admin';

-- Verificar se a atualização foi bem-sucedida
SELECT 
    id,
    email,
    username,
    full_name,
    role,
    is_active
FROM users 
WHERE email = 'admin@dataclinica.com.br';