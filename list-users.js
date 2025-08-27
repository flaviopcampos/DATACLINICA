const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Erro: Variáveis de ambiente não encontradas');
  console.log('SUPABASE_URL:', supabaseUrl ? 'OK' : 'MISSING');
  console.log('SERVICE_KEY:', supabaseServiceKey ? 'OK' : 'MISSING');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function listUsers() {
  console.log('Listando usuários no Supabase Auth...');
  
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.log('ERRO:', error.message);
    } else {
      console.log('Total de usuários:', data.users.length);
      
      data.users.forEach((user, index) => {
        console.log(`\nUsuário ${index + 1}:`);
        console.log('  ID:', user.id);
        console.log('  Email:', user.email);
        console.log('  Confirmado:', user.email_confirmed_at ? 'Sim' : 'Não');
        console.log('  Criado em:', user.created_at);
        console.log('  Último login:', user.last_sign_in_at || 'Nunca');
      });
      
      // Procurar especificamente pelo admin
      const adminUser = data.users.find(u => u.email === 'admin@dataclinica.com.br');
      if (adminUser) {
        console.log('\n✅ Usuário admin encontrado!');
        console.log('Status:', adminUser.email_confirmed_at ? 'Confirmado' : 'Não confirmado');
      } else {
        console.log('\n❌ Usuário admin NÃO encontrado!');
      }
    }
  } catch (error) {
    console.log('ERRO EXCEPTION:', error.message);
  }
}

listUsers();