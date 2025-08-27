const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

// Cliente com service role para operações administrativas
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createOrUpdateAdminUser() {
  console.log('🔧 Verificando/criando usuário admin...');
  
  const adminEmail = 'admin@dataclinica.com.br';
  const adminPassword = 'L@ura080319';
  
  try {
    // Primeiro, tentar listar usuários para ver se o admin já existe
    console.log('🔍 Verificando se o usuário admin já existe...');
    
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Erro ao listar usuários:', listError.message);
      return;
    }
    
    const existingAdmin = users.users.find(user => user.email === adminEmail);
    
    if (existingAdmin) {
      console.log('👤 Usuário admin encontrado:', existingAdmin.id);
      console.log('📧 Email:', existingAdmin.email);
      console.log('✅ Email confirmado:', existingAdmin.email_confirmed_at ? 'Sim' : 'Não');
      
      // Tentar fazer login para verificar se as credenciais estão corretas
      console.log('\n🔐 Testando login com credenciais atuais...');
      
      const supabaseClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      const { data: loginData, error: loginError } = await supabaseClient.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword
      });
      
      if (loginError) {
        console.log('❌ Login falhou:', loginError.message);
        console.log('🔄 Atualizando senha do usuário...');
        
        // Atualizar a senha do usuário existente
        const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          existingAdmin.id,
          {
            password: adminPassword,
            email_confirm: true
          }
        );
        
        if (updateError) {
          console.error('❌ Erro ao atualizar senha:', updateError.message);
        } else {
          console.log('✅ Senha atualizada com sucesso');
          
          // Testar login novamente
          const { data: newLoginData, error: newLoginError } = await supabaseClient.auth.signInWithPassword({
            email: adminEmail,
            password: adminPassword
          });
          
          if (newLoginError) {
            console.error('❌ Login ainda falha após atualização:', newLoginError.message);
          } else {
            console.log('✅ Login bem-sucedido após atualização!');
            await supabaseClient.auth.signOut();
          }
        }
      } else {
        console.log('✅ Login bem-sucedido com credenciais atuais!');
        await supabaseClient.auth.signOut();
      }
    } else {
      console.log('👤 Usuário admin não encontrado. Criando novo usuário...');
      
      // Criar novo usuário admin
      const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: {
          role: 'admin',
          name: 'Administrador'
        }
      });
      
      if (createError) {
        console.error('❌ Erro ao criar usuário admin:', createError.message);
      } else {
        console.log('✅ Usuário admin criado com sucesso!');
        console.log('🆔 ID:', createData.user.id);
        console.log('📧 Email:', createData.user.email);
        
        // Testar login com o novo usuário
        console.log('\n🔐 Testando login com novo usuário...');
        
        const supabaseClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
        const { data: loginData, error: loginError } = await supabaseClient.auth.signInWithPassword({
          email: adminEmail,
          password: adminPassword
        });
        
        if (loginError) {
          console.error('❌ Login falhou com novo usuário:', loginError.message);
        } else {
          console.log('✅ Login bem-sucedido com novo usuário!');
          await supabaseClient.auth.signOut();
        }
      }
    }
  } catch (error) {
    console.error('💥 Erro durante operação:', error.message);
  }
}

async function main() {
  console.log('🚀 Iniciando correção do usuário admin...');
  console.log('==========================================');
  
  await createOrUpdateAdminUser();
  
  console.log('\n🎉 Operação concluída!');
}

main();