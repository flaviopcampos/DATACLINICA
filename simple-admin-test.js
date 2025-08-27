const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔧 Verificando variáveis de ambiente...');
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Definida' : 'Não definida');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Definida' : 'Não definida');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
console.log('✅ Cliente Supabase criado com sucesso');

async function testBasicConnection() {
  console.log('\n🔍 Testando conexão básica...');
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro na conexão:', error.message);
      return false;
    } else {
      console.log('✅ Conexão básica funcionando');
      return true;
    }
  } catch (error) {
    console.error('❌ Erro durante teste de conexão:', error.message);
    return false;
  }
}

async function testAdminLogin() {
  console.log('\n🔐 Testando login do admin...');
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@dataclinica.com.br',
      password: 'L@ura080319'
    });
    
    if (error) {
      console.error('❌ Erro no login:', error.message);
      console.error('Código do erro:', error.status);
      return false;
    } else if (data.user) {
      console.log('✅ Login realizado com sucesso');
      console.log('👤 Email:', data.user.email);
      console.log('🆔 ID:', data.user.id);
      return true;
    }
  } catch (error) {
    console.error('❌ Erro durante login:', error.message);
    return false;
  }
}

async function testTableAccess() {
  console.log('\n📋 Testando acesso às tabelas...');
  const tables = ['clinics', 'patients', 'doctors', 'appointments'];
  let successCount = 0;
  
  for (const table of tables) {
    try {
      console.log(`🔍 Testando tabela: ${table}`);
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.error(`❌ Erro na tabela ${table}:`, error.message);
      } else {
        console.log(`✅ Tabela ${table}: OK`);
        successCount++;
      }
    } catch (error) {
      console.error(`❌ Erro ao testar tabela ${table}:`, error.message);
    }
  }
  
  console.log(`\n📊 Resultado: ${successCount}/${tables.length} tabelas acessíveis`);
  return successCount;
}

async function main() {
  console.log('🚀 Iniciando teste simples do admin...');
  console.log('=====================================');
  
  const connectionOk = await testBasicConnection();
  if (!connectionOk) {
    console.log('❌ Falha na conexão básica. Encerrando testes.');
    return;
  }
  
  const loginOk = await testAdminLogin();
  if (!loginOk) {
    console.log('❌ Falha no login do admin. Encerrando testes.');
    return;
  }
  
  await testTableAccess();
  
  console.log('\n🎉 Teste simples concluído!');
  
  // Fazer logout
  try {
    await supabase.auth.signOut();
    console.log('👋 Logout realizado');
  } catch (error) {
    console.log('⚠️ Aviso durante logout:', error.message);
  }
}

main().catch(error => {
  console.error('💥 Erro fatal:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
});