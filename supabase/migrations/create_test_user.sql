-- Criar usuário de teste para autenticação
-- Senha: L@ura080319 (hash será gerado pelo bcrypt)

-- Primeiro, vamos verificar se já existe um usuário admin
DO $$
BEGIN
    -- Se não existir usuário admin, criar um
    IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin') THEN
        INSERT INTO users (
            email,
            username,
            full_name,
            role,
            is_active,
            password_hash,
            created_at,
            updated_at
        ) VALUES (
            'admin@dataclinica.com.br',
            'admin',
            'Administrador do Sistema',
            'admin',
            true,
            '$2b$12$LQv3c1yqBw2fnc.eAEjjNOJ3xynGnZR9vYpM5RA2WELhEqZjgHj9O', -- Hash para 'L@ura080319'
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Usuário admin criado com sucesso!';
    ELSE
        RAISE NOTICE 'Usuário admin já existe!';
    END IF;
END $$;

-- Garantir que as permissões estão corretas para a tabela users
GRANT SELECT, INSERT, UPDATE ON users TO anon;
GRANT SELECT, INSERT, UPDATE ON users TO authenticated;

-- Verificar se o usuário foi criado
SELECT id, username, email, full_name, role, is_active 
FROM users 
WHERE username = 'admin';