const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Configurações do Supabase
const SUPABASE_URL = 'https://kamsukegzsnvaujtfgek.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthbXN1a2VnenNudmF1anRmZ2VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTA4NjUsImV4cCI6MjA2OTg4Njg2NX0.kVHo2kUi1sWOA-ca_WEu3ZxsrPapzdGVUa653min3fw';

// Credenciais do admin para teste
const ADMIN_EMAIL = 'L@ura080319';
const ADMIN_PASSWORD = 'Admin123!';

async function testAdminLogin() {
  console.log('🔐 TESTE DE LOGIN DO ADMINISTRADOR');
  console.log('=' .repeat(50));
  
  const results = {
    timestamp: new Date().toISOString(),
    tests: {},
    summary: {
      total: 0,
      passed: 0,
      failed: 0
    }
  };

  try {
    // Criar cliente Supabase
    console.log('\n🔗 Criando cliente Supabase...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Cliente criado com sucesso');
    results.tests.clientCreation = { status: 'PASSOU', message: 'Cliente criado com sucesso' };
    results.summary.passed++;
    results.summary.total++;

    // Teste 1: Tentar fazer login com as credenciais do admin
    console.log('\n1️⃣ Testando login do admin...');
    console.log(`📧 Email: ${ADMIN_EMAIL}`);
    console.log(`🔑 Password: ${ADMIN_PASSWORD.replace(/./g, '*')}`);
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      });
      
      if (authError) {
        console.log(`❌ Erro no login: ${authError.message}`);
        results.tests.adminLogin = { 
          status: 'FALHOU', 
          error: authError.message,
          code: authError.status
        };
        results.summary.failed++;
      } else {
        console.log('✅ Login realizado com sucesso!');
        console.log(`👤 Usuário: ${authData.user.email}`);
        console.log(`🆔 ID: ${authData.user.id}`);
        console.log(`📅 Criado em: ${authData.user.created_at}`);
        
        results.tests.adminLogin = { 
          status: 'PASSOU', 
          user: {
            id: authData.user.id,
            email: authData.user.email,
            created_at: authData.user.created_at,
            last_sign_in_at: authData.user.last_sign_in_at
          },
          session: {
            access_token: authData.session.access_token.substring(0, 20) + '...',
            refresh_token: authData.session.refresh_token.substring(0, 20) + '...',
            expires_at: authData.session.expires_at
          }
        };
        results.summary.passed++;
        
        // Teste 2: Verificar dados do usuário autenticado
        console.log('\n2️⃣ Verificando dados do usuário autenticado...');
        try {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .single();
          
          if (userError) {
            console.log(`❌ Erro ao buscar dados do usuário: ${userError.message}`);
            results.tests.userProfile = { 
              status: 'FALHOU', 
              error: userError.message 
            };
            results.summary.failed++;
          } else {
            console.log('✅ Dados do usuário encontrados:');
            console.log(`   📧 Email: ${userData.email}`);
            console.log(`   👤 Username: ${userData.username}`);
            console.log(`   🎭 Role: ${userData.role}`);
            console.log(`   ✅ Ativo: ${userData.is_active}`);
            
            results.tests.userProfile = { 
              status: 'PASSOU', 
              profile: userData
            };
            results.summary.passed++;
          }
        } catch (error) {
          console.log(`❌ Erro ao verificar perfil: ${error.message}`);
          results.tests.userProfile = { status: 'FALHOU', error: error.message };
          results.summary.failed++;
        }
        results.summary.total++;
        
        // Teste 3: Testar operações com usuário autenticado
        console.log('\n3️⃣ Testando operações com usuário autenticado...');
        const tables = ['clinics', 'patients', 'doctors', 'appointments', 'medical_records'];
        const tableResults = {};
        let accessibleTables = 0;
        
        for (const table of tables) {
          try {
            const { data, error } = await supabase
              .from(table)
              .select('*')
              .limit(3);
            
            if (error) {
              console.log(`⚠️ Tabela ${table}: ${error.message}`);
              tableResults[table] = { status: 'ERRO', error: error.message };
            } else {
              console.log(`✅ Tabela ${table}: Acessível (${data.length} registros)`);
              tableResults[table] = { status: 'OK', count: data.length, sample: data };
              accessibleTables++;
            }
          } catch (error) {
            console.log(`❌ Tabela ${table}: ${error.message}`);
            tableResults[table] = { status: 'ERRO', error: error.message };
          }
        }
        
        results.tests.authenticatedAccess = {
          status: accessibleTables > 0 ? 'PASSOU' : 'FALHOU',
          accessibleTables,
          totalTables: tables.length,
          details: tableResults
        };
        
        if (accessibleTables > 0) {
          results.summary.passed++;
        } else {
          results.summary.failed++;
        }
        results.summary.total++;
        
        console.log(`\n📊 ${accessibleTables}/${tables.length} tabelas acessíveis com usuário autenticado`);
        
        // Fazer logout
        console.log('\n4️⃣ Fazendo logout...');
        const { error: logoutError } = await supabase.auth.signOut();
        if (logoutError) {
          console.log(`⚠️ Erro no logout: ${logoutError.message}`);
        } else {
          console.log('✅ Logout realizado com sucesso');
        }
      }
    } catch (error) {
      console.log(`❌ Erro no processo de login: ${error.message}`);
      results.tests.adminLogin = { status: 'FALHOU', error: error.message };
      results.summary.failed++;
    }
    results.summary.total++;

  } catch (error) {
    console.log(`❌ Erro geral: ${error.message}`);
    results.tests.generalError = { status: 'FALHOU', error: error.message };
    results.summary.failed++;
    results.summary.total++;
  }

  // Relatório final
  console.log('\n' + '='.repeat(50));
  console.log('📊 RELATÓRIO FINAL DO TESTE DE LOGIN');
  console.log('='.repeat(50));
  
  const successRate = results.summary.total > 0 ? ((results.summary.passed / results.summary.total) * 100).toFixed(1) : 0;
  
  console.log(`🔗 Cliente Supabase: ${results.tests.clientCreation?.status === 'PASSOU' ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`🔐 Login Admin: ${results.tests.adminLogin?.status === 'PASSOU' ? '✅ SUCESSO' : '❌ FALHOU'}`);
  console.log(`👤 Perfil Usuário: ${results.tests.userProfile?.status === 'PASSOU' ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`📋 Acesso Autenticado: ${results.tests.authenticatedAccess?.status === 'PASSOU' ? '✅ OK' : '❌ FALHOU'}`);
  
  console.log(`\n📈 Resultado: ${results.summary.passed}/${results.summary.total} testes passaram (${successRate}%)`);
  
  if (results.summary.failed > 0) {
    console.log('⚠️ Alguns testes falharam. Verifique as configurações.');
  } else {
    console.log('🎉 Todos os testes passaram!');
  }
  
  console.log('\n🔧 INFORMAÇÕES DE CONFIGURAÇÃO:');
  console.log(`URL do Supabase: ${SUPABASE_URL}`);
  console.log(`Email Admin: ${ADMIN_EMAIL}`);
  console.log(`Chave Anon (primeiros 20 chars): ${SUPABASE_ANON_KEY.substring(0, 20)}...`);
  
  // Salvar relatório
  const reportPath = 'admin-login-test-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 Relatório detalhado salvo em: ${reportPath}`);
  
  console.log('\n✅ Teste de login concluído!');
  return results;
}

// Executar o teste
testAdminLogin().catch(console.error);