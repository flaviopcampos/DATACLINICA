// Script para criar usuário no Supabase Auth
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kamsukegzsnvaujtfgek.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthbXN1a2VnenNudmF1anRmZ2VrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMxMDg2NSwiZXhwIjoyMDY5ODg2ODY1fQ.NmHg_JNoM3DOnQRlCubczBaxdxs37JoVfUvogjW-Q5I';

// Criar cliente Supabase com service role key para operações administrativas
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Dados do usuário de teste
const testUser = {
  email: 'teste@dataclinica.com',
  password: 'teste123',
  username: 'teste_user',
  full_name: 'Usuário de Teste DataClinica',
  role: 'admin',
  phone: '(11) 88888-8888',
  is_active: true
};

async function createTestUser() {
  try {
    console.log('🚀 Iniciando criação do usuário de teste...');
    
    let authUser;
    
    // 1. Criar usuário no Supabase Auth
    console.log('📧 Criando usuário no Supabase Auth...');
    const { data: newAuthUser, error: authError } = await supabase.auth.admin.createUser({
      email: testUser.email,
      password: testUser.password,
      email_confirm: true // Confirma o email automaticamente
    });

    if (authError) {
      if (authError.code === 'email_exists' || authError.message.includes('already registered')) {
        console.log('⚠️  Usuário já existe no Auth, buscando...');
        
        // Buscar usuário existente
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsers.users.find(u => u.email === testUser.email);
        
        if (existingUser) {
          console.log('✅ Usuário encontrado no Auth:', existingUser.id);
          authUser = { user: existingUser };
        } else {
          throw new Error('Usuário existe mas não foi encontrado');
        }
      } else {
        throw authError;
      }
    } else {
      console.log('✅ Usuário criado no Auth:', newAuthUser.user.id);
      authUser = newAuthUser;
    }

    // 2. Verificar se usuário já existe na tabela users
    console.log('🔍 Verificando se usuário existe na tabela users...');
    const { data: existingDbUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', testUser.email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingDbUser) {
      console.log('⚠️  Usuário já existe na tabela users, atualizando...');
      
      // Atualizar usuário existente
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          username: testUser.username,
          full_name: testUser.full_name,
          role: testUser.role,
          phone: testUser.phone,
          is_active: testUser.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('email', testUser.email)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }
      
      console.log('✅ Usuário atualizado na tabela users:', updatedUser.id);
    } else {
      // 3. Inserir usuário na tabela users (sem especificar ID, deixa o banco gerar)
      console.log('👤 Inserindo usuário na tabela users...');
      const { data: dbUser, error: dbError } = await supabase
        .from('users')
        .insert({
          email: testUser.email,
          username: testUser.username,
          full_name: testUser.full_name,
          role: testUser.role,
          phone: testUser.phone,
          is_active: testUser.is_active
        })
        .select()
        .single();

      if (dbError) {
        throw dbError;
      }
      
      console.log('✅ Usuário inserido na tabela users:', dbUser.id);
    }

    // 4. Testar autenticação
    console.log('🔐 Testando autenticação...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password
    });

    if (signInError) {
      throw signInError;
    }

    console.log('✅ Autenticação testada com sucesso!');
    console.log('📊 Token de acesso:', signInData.session.access_token.substring(0, 50) + '...');

    // 5. Buscar dados completos do usuário
    console.log('📋 Buscando dados completos do usuário...');
    const { data: fullUserData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', testUser.email)
      .single();

    if (userError) {
      throw userError;
    }

    console.log('✅ Dados do usuário:', {
      id: fullUserData.id,
      email: fullUserData.email,
      username: fullUserData.username,
      full_name: fullUserData.full_name,
      role: fullUserData.role,
      is_active: fullUserData.is_active
    });

    console.log('\n🎉 Usuário de teste criado e testado com sucesso!');
    console.log('📧 Email:', testUser.email);
    console.log('🔑 Senha:', testUser.password);
    console.log('👤 Username:', testUser.username);
    console.log('🏷️  Role:', testUser.role);
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário de teste:', error.message);
    console.error('📋 Detalhes do erro:', error);
    process.exit(1);
  }
}

// Executar o script
if (require.main === module) {
  createTestUser();
}

module.exports = { createTestUser, testUser };