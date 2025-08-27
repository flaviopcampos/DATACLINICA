const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(__dirname, 'frontend', '.env.production') });
dotenv.config({ path: path.join(__dirname, 'frontend', '.env') });

// Configurações do Supabase (usando as chaves corretas obtidas)
const SUPABASE_URL = 'https://kamsukegzsnvaujtfgek.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthbXN1a2VnenNudmF1anRmZ2VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTA4NjUsImV4cCI6MjA2OTg4Njg2NX0.kVHo2kUi1sWOA-ca_WEu3ZxsrPapzdGVUa653min3fw';

console.log('🔍 Verificando configuração do Supabase...');
console.log('SUPABASE_URL:', SUPABASE_URL ? '✅ Configurada' : '❌ Não encontrada');
console.log('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ Não encontrada');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Configurações do Supabase não encontradas!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSupabaseConnection() {
  console.log('🔍 Iniciando testes de conexão com Supabase...');
  console.log('=' .repeat(50));
  
  const results = {
    connection: false,
    adminUserExists: false,
    loginTest: false,
    databaseOperations: false
  };

  try {
    // 1. Teste de conexão básica
    console.log('\n1️⃣ Testando conexão básica...');
    const { data: connectionTest, error: connectionError } = await supabase
       .from('users')
       .select('id')
       .limit(1);
    
    if (connectionError) {
      console.error('❌ Erro na conexão:', connectionError.message);
      console.error('Código:', connectionError.code);
      console.error('Detalhes:', connectionError.details);
    } else {
      console.log('✅ Conexão com Supabase estabelecida com sucesso!');
      results.connection = true;
    }

    // 2. Verificar se o usuário admin existe
    console.log('\n2️⃣ Verificando usuário admin...');
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('id, email, username, full_name, role, is_active')
      .eq('email', 'admin@dataclinica.com.br')
      .single();
    
    if (adminError) {
      console.error('❌ Usuário admin não encontrado por email:', adminError.message);
      
      // Tentar buscar por username
      const { data: adminByUsername, error: usernameError } = await supabase
        .from('users')
        .select('id, email, username, full_name, role, is_active')
        .eq('username', 'admin')
        .single();
      
      if (usernameError) {
        console.error('❌ Usuário admin também não encontrado por username:', usernameError.message);
      } else {
        console.log('✅ Usuário admin encontrado por username:', adminByUsername);
        results.adminUserExists = true;
      }
    } else {
      console.log('✅ Usuário admin encontrado por email:', adminUser);
      results.adminUserExists = true;
    }

    // 3. Teste de login (simulado)
    console.log('\n3️⃣ Testando processo de login...');
    try {
      // Primeiro, buscar o email do usuário pelo username
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email, username, full_name, role')
        .eq('username', 'admin')
        .single();

      if (userError || !userData?.email) {
        console.error('❌ Não foi possível encontrar o email do usuário admin');
      } else {
        console.log('✅ Email do usuário admin encontrado:', userData.email);
        
        // Tentar fazer login com Supabase Auth - primeira senha
        console.log('🔐 Testando login com primeira senha...');
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: userData.email,
          password: 'L@ura080319' // Primeira senha do ADMIN_CREDENTIALS.md
        });

        if (authError) {
          console.log('⚠️ Primeira senha falhou:', authError.message);
          console.log('🔐 Testando login com segunda senha...');
          
          // Tentar com a segunda senha
          const { data: authData2, error: authError2 } = await supabase.auth.signInWithPassword({
            email: userData.email,
            password: 'Admin123!' // Segunda senha do admin_user.json
          });

          if (authError2) {
            console.error('❌ Login falhou com ambas as senhas:', authError2.message);
          } else {
            console.log('✅ Login realizado com sucesso com a segunda senha!');
            console.log('👤 Usuário logado:', authData2.user?.email);
            results.loginTest = true;
            
            // Fazer logout
            await supabase.auth.signOut();
            console.log('🚪 Logout realizado');
          }
        } else {
          console.log('✅ Login realizado com sucesso com a primeira senha!');
          console.log('👤 Usuário logado:', authData.user?.email);
          results.loginTest = true;
          
          // Fazer logout
          await supabase.auth.signOut();
          console.log('🚪 Logout realizado');
        }
      }
    } catch (loginError) {
      console.error('❌ Erro durante teste de login:', loginError.message);
    }

    // 4. Teste de operações básicas no banco
    console.log('\n4️⃣ Testando operações básicas no banco...');
    try {
      // Listar algumas tabelas principais
      const tables = ['users', 'clinics', 'patients', 'appointments', 'doctors', 'medical_records'];
      let accessibleTables = 0;
      
      for (const table of tables) {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`⚠️ Tabela ${table}: ${error.message}`);
        } else {
          console.log(`✅ Tabela ${table}: Acessível (${data ? data.length : 0} registros encontrados)`);
          accessibleTables++;
        }
      }
      
      if (accessibleTables > 0) {
        results.databaseOperations = true;
        console.log(`✅ ${accessibleTables}/${tables.length} tabelas acessíveis`);
      }
    } catch (dbError) {
      console.error('❌ Erro nas operações do banco:', dbError.message);
    }

  } catch (error) {
    console.error('❌ Erro geral durante os testes:', error.message);
    console.error('Stack:', error.stack);
  }

  // 5. Relatório final
  console.log('\n' + '=' .repeat(50));
  console.log('📊 RELATÓRIO FINAL DOS TESTES');
  console.log('=' .repeat(50));
  
  console.log(`🔗 Conexão com Supabase: ${results.connection ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`👤 Usuário Admin existe: ${results.adminUserExists ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`🔐 Teste de Login: ${results.loginTest ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`💾 Operações do Banco: ${results.databaseOperations ? '✅ OK' : '❌ FALHOU'}`);
  
  const successCount = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n📈 Resultado: ${successCount}/${totalTests} testes passaram`);
  
  if (successCount === totalTests) {
    console.log('🎉 Todos os testes passaram! O sistema está funcionando corretamente.');
  } else {
    console.log('⚠️ Alguns testes falharam. Verifique as configurações.');
  }
  
  // Informações de configuração
  console.log('\n🔧 INFORMAÇÕES DE CONFIGURAÇÃO:');
  console.log('URL do Supabase:', SUPABASE_URL);
  console.log('Chave Anon (primeiros 20 chars):', SUPABASE_ANON_KEY.substring(0, 20) + '...');
  
  // Salvar relatório em arquivo JSON
  const report = {
    timestamp: new Date().toISOString(),
    results,
    summary: {
      totalTests,
      successCount,
      successRate: (successCount / totalTests * 100).toFixed(1) + '%'
    },
    config: {
      supabaseUrl: SUPABASE_URL,
      anonKeyPrefix: SUPABASE_ANON_KEY.substring(0, 20) + '...'
    }
  };
  
  try {
    fs.writeFileSync('supabase-test-report.json', JSON.stringify(report, null, 2));
    console.log('\n💾 Relatório salvo em: supabase-test-report.json');
  } catch (writeError) {
    console.error('⚠️ Erro ao salvar relatório:', writeError.message);
  }
  
  return results;
}

// Executar os testes
testSupabaseConnection()
  .then((results) => {
    const allPassed = Object.values(results).every(Boolean);
    process.exit(allPassed ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Erro fatal durante os testes:', error);
    process.exit(1);
  });