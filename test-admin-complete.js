const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

const testResults = {
  timestamp: new Date().toISOString(),
  tests: {
    clientCreation: { success: false, message: '' },
    adminLogin: { success: false, message: '', user: null },
    tableAccess: {
      clinics: { success: false, message: '', count: 0 },
      patients: { success: false, message: '', count: 0 },
      doctors: { success: false, message: '', count: 0 },
      appointments: { success: false, message: '', count: 0 },
      medical_records: { success: false, message: '', count: 0 }
    },
    crudOperations: {
      create: { success: false, message: '' },
      read: { success: false, message: '' },
      update: { success: false, message: '' },
      delete: { success: false, message: '' }
    }
  },
  summary: {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    successRate: 0
  }
};

async function testClientCreation() {
  console.log('🔧 Testando criação do cliente Supabase...');
  try {
    if (supabase) {
      testResults.tests.clientCreation.success = true;
      testResults.tests.clientCreation.message = 'Cliente Supabase criado com sucesso';
      console.log('✅ Cliente Supabase criado com sucesso');
    }
  } catch (error) {
    testResults.tests.clientCreation.message = `Erro: ${error.message}`;
    console.error('❌ Erro ao criar cliente Supabase:', error.message);
  }
}

async function testAdminLogin() {
  console.log('\n🔐 Testando login do admin...');
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@dataclinica.com.br',
      password: 'Admin123!'
    });
    
    if (error) {
      testResults.tests.adminLogin.message = `Erro no login: ${error.message}`;
      console.error('❌ Erro no login do admin:', error.message);
    } else if (data.user) {
      testResults.tests.adminLogin.success = true;
      testResults.tests.adminLogin.message = 'Login do admin realizado com sucesso';
      testResults.tests.adminLogin.user = {
        id: data.user.id,
        email: data.user.email,
        role: data.user.user_metadata?.role || 'N/A'
      };
      console.log('✅ Login do admin realizado com sucesso');
      console.log('👤 Usuário:', data.user.email);
      console.log('🆔 ID:', data.user.id);
    }
  } catch (error) {
    testResults.tests.adminLogin.message = `Erro: ${error.message}`;
    console.error('❌ Erro durante o login:', error.message);
  }
}

async function testTableAccess() {
  console.log('\n📋 Testando acesso às tabelas...');
  
  const tables = ['clinics', 'patients', 'doctors', 'appointments', 'medical_records'];
  
  for (const table of tables) {
    try {
      console.log(`🔍 Testando acesso à tabela: ${table}`);
      
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .limit(5);
      
      if (error) {
        testResults.tests.tableAccess[table].message = `Erro: ${error.message}`;
        console.error(`❌ Erro ao acessar tabela ${table}:`, error.message);
      } else {
        testResults.tests.tableAccess[table].success = true;
        testResults.tests.tableAccess[table].count = count || 0;
        testResults.tests.tableAccess[table].message = `Acesso bem-sucedido. ${count || 0} registros encontrados`;
        console.log(`✅ Tabela ${table}: ${count || 0} registros encontrados`);
      }
    } catch (error) {
      testResults.tests.tableAccess[table].message = `Erro: ${error.message}`;
      console.error(`❌ Erro ao testar tabela ${table}:`, error.message);
    }
  }
}

async function testCrudOperations() {
  console.log('\n🔨 Testando operações CRUD...');
  
  let testRecordId = null;
  
  // Test CREATE
  try {
    console.log('➕ Testando criação de registro...');
    const { data, error } = await supabase
      .from('clinics')
      .insert({
        name: 'Clínica Teste Admin',
        address: 'Endereço Teste',
        phone: '(11) 99999-9999',
        email: 'teste@admin.com'
      })
      .select()
      .single();
    
    if (error) {
      testResults.tests.crudOperations.create.message = `Erro: ${error.message}`;
      console.error('❌ Erro ao criar registro:', error.message);
    } else {
      testResults.tests.crudOperations.create.success = true;
      testResults.tests.crudOperations.create.message = 'Registro criado com sucesso';
      testRecordId = data.id;
      console.log('✅ Registro criado com sucesso. ID:', testRecordId);
    }
  } catch (error) {
    testResults.tests.crudOperations.create.message = `Erro: ${error.message}`;
    console.error('❌ Erro durante criação:', error.message);
  }
  
  // Test READ
  if (testRecordId) {
    try {
      console.log('📖 Testando leitura de registro...');
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', testRecordId)
        .single();
      
      if (error) {
        testResults.tests.crudOperations.read.message = `Erro: ${error.message}`;
        console.error('❌ Erro ao ler registro:', error.message);
      } else {
        testResults.tests.crudOperations.read.success = true;
        testResults.tests.crudOperations.read.message = 'Registro lido com sucesso';
        console.log('✅ Registro lido com sucesso:', data.name);
      }
    } catch (error) {
      testResults.tests.crudOperations.read.message = `Erro: ${error.message}`;
      console.error('❌ Erro durante leitura:', error.message);
    }
    
    // Test UPDATE
    try {
      console.log('✏️ Testando atualização de registro...');
      const { data, error } = await supabase
        .from('clinics')
        .update({ name: 'Clínica Teste Admin - Atualizada' })
        .eq('id', testRecordId)
        .select()
        .single();
      
      if (error) {
        testResults.tests.crudOperations.update.message = `Erro: ${error.message}`;
        console.error('❌ Erro ao atualizar registro:', error.message);
      } else {
        testResults.tests.crudOperations.update.success = true;
        testResults.tests.crudOperations.update.message = 'Registro atualizado com sucesso';
        console.log('✅ Registro atualizado com sucesso:', data.name);
      }
    } catch (error) {
      testResults.tests.crudOperations.update.message = `Erro: ${error.message}`;
      console.error('❌ Erro durante atualização:', error.message);
    }
    
    // Test DELETE
    try {
      console.log('🗑️ Testando exclusão de registro...');
      const { error } = await supabase
        .from('clinics')
        .delete()
        .eq('id', testRecordId);
      
      if (error) {
        testResults.tests.crudOperations.delete.message = `Erro: ${error.message}`;
        console.error('❌ Erro ao excluir registro:', error.message);
      } else {
        testResults.tests.crudOperations.delete.success = true;
        testResults.tests.crudOperations.delete.message = 'Registro excluído com sucesso';
        console.log('✅ Registro excluído com sucesso');
      }
    } catch (error) {
      testResults.tests.crudOperations.delete.message = `Erro: ${error.message}`;
      console.error('❌ Erro durante exclusão:', error.message);
    }
  }
}

function calculateSummary() {
  let totalTests = 0;
  let passedTests = 0;
  
  // Client creation
  totalTests++;
  if (testResults.tests.clientCreation.success) passedTests++;
  
  // Admin login
  totalTests++;
  if (testResults.tests.adminLogin.success) passedTests++;
  
  // Table access
  Object.keys(testResults.tests.tableAccess).forEach(table => {
    totalTests++;
    if (testResults.tests.tableAccess[table].success) passedTests++;
  });
  
  // CRUD operations
  Object.keys(testResults.tests.crudOperations).forEach(operation => {
    totalTests++;
    if (testResults.tests.crudOperations[operation].success) passedTests++;
  });
  
  testResults.summary.totalTests = totalTests;
  testResults.summary.passedTests = passedTests;
  testResults.summary.failedTests = totalTests - passedTests;
  testResults.summary.successRate = Math.round((passedTests / totalTests) * 100);
}

async function generateReport() {
  calculateSummary();
  
  console.log('\n📊 RELATÓRIO DE TESTES COMPLETO');
  console.log('================================');
  console.log(`📅 Data/Hora: ${testResults.timestamp}`);
  console.log(`📈 Taxa de Sucesso: ${testResults.summary.successRate}%`);
  console.log(`✅ Testes Aprovados: ${testResults.summary.passedTests}`);
  console.log(`❌ Testes Falharam: ${testResults.summary.failedTests}`);
  console.log(`📊 Total de Testes: ${testResults.summary.totalTests}`);
  
  // Salvar relatório em arquivo
  try {
    fs.writeFileSync('admin-complete-test-report.json', JSON.stringify(testResults, null, 2));
    console.log('\n💾 Relatório salvo em: admin-complete-test-report.json');
  } catch (error) {
    console.error('❌ Erro ao salvar relatório:', error.message);
  }
}

async function main() {
  console.log('🚀 Iniciando teste completo do admin e sistema...');
  console.log('================================================');
  
  try {
    await testClientCreation();
    await testAdminLogin();
    await testTableAccess();
    await testCrudOperations();
    await generateReport();
    
    console.log('\n🎉 Teste completo finalizado!');
    
    // Fazer logout
    try {
      await supabase.auth.signOut();
      console.log('👋 Logout realizado com sucesso');
    } catch (error) {
      console.log('⚠️ Aviso durante logout:', error.message);
    }
  } catch (error) {
    console.error('💥 Erro durante execução:', error.message);
    process.exit(1);
  }
}

// Executar a função principal
main();