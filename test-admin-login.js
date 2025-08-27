const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Erro: Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  console.log('Testando login do admin...');
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@dataclinica.com.br',
      password: 'Admin123!'
    });
    
    if (error) {
      console.log('ERRO:', error.message);
    } else {
      console.log('SUCESSO: Login realizado');
      console.log('User ID:', data.user.id);
      console.log('Email:', data.user.email);
      
      // Fazer logout
      await supabase.auth.signOut();
      console.log('Logout realizado');
    }
  } catch (error) {
    console.log('ERRO EXCEPTION:', error.message);
  }
}

testLogin();