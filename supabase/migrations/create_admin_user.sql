-- Criar superusuário admin no DataClínica
-- Data: $(date)
-- Descrição: Criação do usuário administrador principal do sistema

-- Inserir o usuário admin na tabela users
INSERT INTO users (
    email,
    full_name,
    password_hash,
    role,
    is_active,
    created_at,
    updated_at
) VALUES (
    'admin@dataclinica.com.br',
    'Administrador DataClínica',
    crypt('L@ura080319', gen_salt('bf')),
    'admin',
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    password_hash = crypt('L@ura080319', gen_salt('bf')),
    updated_at = NOW();

-- Garantir que o usuário admin tenha todas as permissões
-- Conceder permissões para as tabelas principais
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Verificar se o usuário foi criado com sucesso
SELECT 
    id,
    email,
    full_name,
    role,
    is_active,
    created_at
FROM users 
WHERE email = 'admin@dataclinica.com.br';