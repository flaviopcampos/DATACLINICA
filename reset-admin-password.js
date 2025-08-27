const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Erro: Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function resetAdminPassword() {
  console.log('Redefinindo senha do usuário admin...');
  
  try {
    // Primeiro, encontrar o usuário admin
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.log('ERRO ao listar usuários:', listError.message);
      return;
    }
    
    const adminUser = users.users.find(u => u.email === 'admin@dataclinica.com.br');
    
    if (!adminUser) {
      console.log('❌ Usuário admin não encontrado!');
      return;
    }
    
    console.log('✅ Usuário admin encontrado:', adminUser.id);
    
    // Redefinir a senha
    const { data, error } = await supabase.auth.admin.updateUserById(
      adminUser.id,
      {
        password: 'Admin123!'
      }
    );
    
    if (error) {
      console.log('ERRO ao redefinir senha:', error.message);
    } else {
      console.log('✅ Senha redefinida com sucesso!');
      console.log('Email:', data.user.email);
      console.log('Nova senha: Admin123!');
      
      // Testar o login imediatamente
      console.log('\nTestando login com nova senha...');
      
      const supabaseClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      
      const { data: loginData, error: loginError } = await supabaseClient.auth.signInWithPassword({
        email: 'admin@dataclinica.com.br',
        password: 'Admin123!'
      });
      
      if (loginError) {
        console.log('❌ Login ainda falhou:', loginError.message);
      } else {
        console.log('✅ Login bem-sucedido!');
        console.log('User ID:', loginData.user.id);
        
        // Fazer logout
        await supabaseClient.auth.signOut();
        console.log('Logout realizado');
      }
    }
  } catch (error) {
    console.log('ERRO EXCEPTION:', error.message);
  }
}

resetAdminPassword();