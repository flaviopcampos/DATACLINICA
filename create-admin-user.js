const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './frontend/.env' });

async function createAdminUser() {
  console.log('🚀 Iniciando criação do usuário admin...');
  
  // Verificar variáveis de ambiente
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variáveis de ambiente não encontradas!');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Definida' : '❌ Não definida');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Definida' : '❌ Não definida');
    return;
  }
  
  // Criar cliente Supabase com service role (necessário para criar usuários)
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  console.log('✅ Cliente Supabase criado com service role');
  
  const adminEmail = 'admin@dataclinica.com.br';
  const adminPassword = 'L@ura080319';
  
  try {
    // 1. Verificar se o usuário já existe no Auth
    console.log('🔍 Verificando se usuário admin já existe...');
    
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Erro ao listar usuários:', listError.message);
      return;
    }
    
    const existingUser = existingUsers.users.find(user => user.email === adminEmail);
    
    let authUserId;
    
    if (existingUser) {
      console.log('⚠️ Usuário admin já existe no Auth:', existingUser.id);
      authUserId = existingUser.id;
    } else {
      // 2. Criar usuário no Supabase Auth
      console.log('👤 Criando usuário admin no Supabase Auth...');
      
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true // Confirmar email automaticamente
      });
      
      if (authError) {
        console.error('❌ Erro ao criar usuário no Auth:', authError.message);
        return;
      }
      
      console.log('✅ Usuário criado no Auth:', authData.user.id);
      authUserId = authData.user.id;
    }
    
    // 3. Verificar se o usuário já existe na tabela users
    console.log('🔍 Verificando se usuário existe na tabela users...');
    
    const { data: existingUserData, error: selectError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUserId)
      .single();
    
    if (selectError && selectError.code !== 'PGRST116') { // PGRST116 = not found
      console.error('❌ Erro ao verificar usuário na tabela users:', selectError.message);
      return;
    }
    
    if (existingUserData) {
      console.log('⚠️ Usuário admin já existe na tabela users');
      console.log('📋 Dados do usuário:', {
        id: existingUserData.id,
        email: existingUserData.email,
        username: existingUserData.username,
        role: existingUserData.role,
        active: existingUserData.active
      });
    } else {
      // 4. Inserir dados do usuário na tabela users
      console.log('📝 Inserindo dados do usuário na tabela users...');
      
      const { data: userData, error: insertError } = await supabase
        .from('users')
        .insert({
          id: authUserId,
          email: adminEmail,
          username: 'admin',
          full_name: 'Administrador do Sistema',
          role: 'admin',
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('❌ Erro ao inserir usuário na tabela users:', insertError.message);
        return;
      }
      
      console.log('✅ Usuário inserido na tabela users:', userData);
    }
    
    // 5. Testar login do usuário admin
    console.log('🔐 Testando login do usuário admin...');
    
    // Criar cliente com anon key para testar login
    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    const { data: loginData, error: loginError } = await anonClient.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
    });
    
    if (loginError) {
      console.error('❌ Erro no login:', loginError.message);
    } else {
      console.log('✅ Login realizado com sucesso!');
      console.log('👤 Usuário logado:', {
        id: loginData.user.id,
        email: loginData.user.email
      });
      
      // Fazer logout
      await anonClient.auth.signOut();
    }
    
    console.log('\n🎉 Processo de criação do usuário admin concluído!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Senha:', adminPassword);
    console.log('👑 Role: admin');
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

// Executar função
createAdminUser().catch(console.error);