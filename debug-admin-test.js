const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('=== DIAGNÓSTICO DO SISTEMA DATACLINICA ===');
console.log('Iniciando diagnóstico...');

// Verificar variáveis de ambiente
console.log('\n1. Verificando variáveis de ambiente:');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('SUPABASE_URL:', supabaseUrl ? 'Definida' : 'NÃO DEFINIDA');
console.log('SUPABASE_ANON_KEY:', supabaseKey ? 'Definida' : 'NÃO DEFINIDA');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não configuradas corretamente!');
  process.exit(1);
}

// Criar cliente Supabase
console.log('\n2. Criando cliente Supabase...');
try {
  const supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Cliente Supabase criado com sucesso');
  
  // Testar conexão básica
  console.log('\n3. Testando conexão básica...');
  const { data, error } = await supabase.from('clinics').select('count', { count: 'exact', head: true });
  
  if (error) {
    console.error('❌ Erro na conexão:', error.message);
  } else {
    console.log('✅ Conexão com banco estabelecida');
  }
  
  // Testar login do admin
  console.log('\n4. Testando login do admin...');
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: 'admin@dataclinica.com.br',
    password: 'L@ura080319'
  });
  
  if (loginError) {
    console.error('❌ Erro no login:', loginError.message);
  } else {
    console.log('✅ Login do admin realizado com sucesso');
    console.log('User ID:', loginData.user?.id);
    
    // Logout
    await supabase.auth.signOut();
    console.log('✅ Logout realizado');
  }
  
} catch (error) {
  console.error('❌ Erro geral:', error.message);
  process.exit(1);
}

console.log('\n=== DIAGNÓSTICO CONCLUÍDO ===');