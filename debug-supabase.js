const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Iniciando teste de debug do Supabase...');

try {
  // Configurações do Supabase
  const SUPABASE_URL = 'https://kamsukegzsnvaujtfgek.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthbXN1a2VnenNudmF1anRmZ2VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTA4NjUsImV4cCI6MjA2OTg4Njg2NX0.kVHo2kUi1sWOA-ca_WEu3ZxsrPapzdGVUa653min3fw';
  
  console.log('✅ Configurações carregadas');
  console.log('URL:', SUPABASE_URL);
  console.log('Key (primeiros 20 chars):', SUPABASE_ANON_KEY.substring(0, 20) + '...');
  
  // Criar cliente
  console.log('\n🔗 Criando cliente Supabase...');
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('✅ Cliente criado com sucesso');
  
  // Teste básico
  console.log('\n📊 Testando conexão básica...');
  
  supabase
    .from('users')
    .select('id')
    .limit(1)
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ Erro na conexão:', error.message);
        console.error('Código:', error.code);
        console.error('Detalhes:', error.details);
        process.exit(1);
      } else {
        console.log('✅ Conexão estabelecida com sucesso!');
        console.log('Dados retornados:', data);
        process.exit(0);
      }
    })
    .catch((err) => {
      console.error('💥 Erro durante a execução:', err.message);
      console.error('Stack:', err.stack);
      process.exit(1);
    });
    
} catch (error) {
  console.error('💥 Erro fatal:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}