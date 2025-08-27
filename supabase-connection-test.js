const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Configurações do Supabase (usando as chaves corretas)
const SUPABASE_URL = 'https://kamsukegzsnvaujtfgek.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthbXN1a2VnenNudmF1anRmZ2VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTA4NjUsImV4cCI6MjA2OTg4Njg2NX0.kVHo2kUi1sWOA-ca_WEu3ZxsrPapzdGVUa653min3fw';

async function testSupabaseConnection() {
  console.log('🔍 TESTE COMPLETO DE CONEXÃO COM SUPABASE');
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

    // Teste 1: Conexão básica - listar todas as tabelas
    console.log('\n1️⃣ Testando conexão básica...');
    results.summary.total++;
    
    try {
      // Usar uma query mais simples
      const { data: allUsers, error: usersError } = await supabase
        .from('users')
        .select('*');
      
      if (usersError) {
        console.log(`❌ Erro ao acessar tabela users: ${usersError.message}`);
        results.tests.basicConnection = { 
          status: 'FALHOU', 
          error: usersError.message,
          code: usersError.code 
        };
        results.summary.failed++;
      } else {
        console.log(`✅ Conexão OK - ${allUsers.length} usuários encontrados`);
        results.tests.basicConnection = { 
          status: 'PASSOU', 
          message: `${allUsers.length} usuários encontrados`,
          data: allUsers
        };
        results.summary.passed++;
      }
    } catch (error) {
      console.log(`❌ Erro na conexão: ${error.message}`);
      results.tests.basicConnection = { status: 'FALHOU', error: error.message };
      results.summary.failed++;
    }

    // Teste 2: Verificar usuário admin
    console.log('\n2️⃣ Verificando usuário admin...');
    results.summary.total++;
    
    try {
      const { data: users, error: adminError } = await supabase
        .from('users')
        .select('*');
      
      if (adminError) {
        console.log(`❌ Erro ao buscar usuários: ${adminError.message}`);
        results.tests.adminUser = { status: 'FALHOU', error: adminError.message };
        results.summary.failed++;
      } else {
        // Procurar admin manualmente nos dados
        const adminByEmail = users.find(u => u.email === 'admin@dataclinica.com');
        const adminByUsername = users.find(u => u.username === 'admin');
        
        if (adminByEmail || adminByUsername) {
          const admin = adminByEmail || adminByUsername;
          console.log(`✅ Usuário admin encontrado:`);
          console.log(`   ID: ${admin.id}`);
          console.log(`   Email: ${admin.email}`);
          console.log(`   Username: ${admin.username}`);
          console.log(`   Role: ${admin.role}`);
          console.log(`   Ativo: ${admin.is_active}`);
          
          results.tests.adminUser = { 
            status: 'PASSOU', 
            admin: {
              id: admin.id,
              email: admin.email,
              username: admin.username,
              role: admin.role,
              is_active: admin.is_active
            }
          };
          results.summary.passed++;
        } else {
          console.log('❌ Usuário admin não encontrado');
          console.log('📋 Usuários existentes:');
          users.forEach(user => {
            console.log(`   - ${user.email} (${user.username}) - Role: ${user.role}`);
          });
          
          results.tests.adminUser = { 
            status: 'FALHOU', 
            message: 'Admin não encontrado',
            existingUsers: users.map(u => ({ email: u.email, username: u.username, role: u.role }))
          };
          results.summary.failed++;
        }
      }
    } catch (error) {
      console.log(`❌ Erro ao verificar admin: ${error.message}`);
      results.tests.adminUser = { status: 'FALHOU', error: error.message };
      results.summary.failed++;
    }

    // Teste 3: Testar outras tabelas importantes
    console.log('\n3️⃣ Testando acesso às tabelas principais...');
    results.summary.total++;
    
    const tables = ['clinics', 'patients', 'doctors', 'appointments', 'medical_records'];
    const tableResults = {};
    let accessibleTables = 0;
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(5);
        
        if (error) {
          console.log(`⚠️ Tabela ${table}: ${error.message}`);
          tableResults[table] = { status: 'ERRO', error: error.message };
        } else {
          console.log(`✅ Tabela ${table}: Acessível (${data.length} registros)`);
          tableResults[table] = { status: 'OK', count: data.length };
          accessibleTables++;
        }
      } catch (error) {
        console.log(`❌ Tabela ${table}: ${error.message}`);
        tableResults[table] = { status: 'ERRO', error: error.message };
      }
    }
    
    results.tests.tableAccess = {
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
    
    console.log(`\n📊 ${accessibleTables}/${tables.length} tabelas acessíveis`);

  } catch (error) {
    console.log(`❌ Erro geral: ${error.message}`);
    results.tests.generalError = { status: 'FALHOU', error: error.message };
    results.summary.failed++;
  }

  // Relatório final
  console.log('\n' + '='.repeat(50));
  console.log('📊 RELATÓRIO FINAL DOS TESTES');
  console.log('='.repeat(50));
  
  const successRate = ((results.summary.passed / results.summary.total) * 100).toFixed(1);
  
  console.log(`🔗 Conexão com Supabase: ${results.tests.basicConnection?.status === 'PASSOU' ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`👤 Usuário Admin: ${results.tests.adminUser?.status === 'PASSOU' ? '✅ ENCONTRADO' : '❌ NÃO ENCONTRADO'}`);
  console.log(`📋 Acesso às Tabelas: ${results.tests.tableAccess?.status === 'PASSOU' ? '✅ OK' : '❌ FALHOU'}`);
  
  console.log(`\n📈 Resultado: ${results.summary.passed}/${results.summary.total} testes passaram (${successRate}%)`);
  
  if (results.summary.failed > 0) {
    console.log('⚠️ Alguns testes falharam. Verifique as configurações.');
  } else {
    console.log('🎉 Todos os testes passaram!');
  }
  
  console.log('\n🔧 INFORMAÇÕES DE CONFIGURAÇÃO:');
  console.log(`URL do Supabase: ${SUPABASE_URL}`);
  console.log(`Chave Anon (primeiros 20 chars): ${SUPABASE_ANON_KEY.substring(0, 20)}...`);
  
  // Salvar relatório
  const reportPath = 'supabase-test-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 Relatório detalhado salvo em: ${reportPath}`);
  
  return results;
}

// Executar o teste
if (require.main === module) {
  testSupabaseConnection()
    .then(() => {
      console.log('\n✅ Teste concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro durante o teste:', error);
      process.exit(1);
    });
}

module.exports = { testSupabaseConnection };