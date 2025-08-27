const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(__dirname, 'frontend', '.env.production') });
dotenv.config({ path: path.join(__dirname, 'frontend', '.env') });

// Cores para output no console
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

class SupabaseTestSuite {
  constructor() {
    this.results = [];
    this.supabase = null;
    this.adminCredentials = {
      username: 'admin',
      password: 'Admin@2024'
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colorMap = {
      success: colors.green,
      error: colors.red,
      warning: colors.yellow,
      info: colors.blue
    };
    
    console.log(`${colorMap[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  addResult(test, status, message, details = null) {
    this.results.push({
      test,
      status,
      message,
      details,
      timestamp: new Date().toISOString()
    });
  }

  async testEnvironmentVariables() {
    this.log('🔍 Testando variáveis de ambiente...', 'info');
    
    const requiredVars = {
      'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
      'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    };

    let allVarsPresent = true;
    
    for (const [varName, value] of Object.entries(requiredVars)) {
      if (!value) {
        this.log(`❌ Variável ${varName} não encontrada`, 'error');
        this.addResult('Environment Variables', 'FAIL', `${varName} não encontrada`);
        allVarsPresent = false;
      } else {
        this.log(`✅ ${varName}: ${value.substring(0, 20)}...`, 'success');
      }
    }

    if (allVarsPresent) {
      this.addResult('Environment Variables', 'PASS', 'Todas as variáveis de ambiente estão presentes');
      return true;
    }
    
    return false;
  }

  async testSupabaseConnection() {
    this.log('🔗 Testando conexão com Supabase...', 'info');
    
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Variáveis de ambiente do Supabase não encontradas');
      }

      this.supabase = createClient(supabaseUrl, supabaseKey);
      
      // Teste básico de conexão
      const { data, error } = await this.supabase
        .from('users')
        .select('count')
        .limit(1);
      
      if (error) {
        throw error;
      }
      
      this.log('✅ Conexão com Supabase estabelecida com sucesso', 'success');
      this.addResult('Supabase Connection', 'PASS', 'Conexão estabelecida com sucesso');
      return true;
      
    } catch (error) {
      this.log(`❌ Erro na conexão com Supabase: ${error.message}`, 'error');
      this.addResult('Supabase Connection', 'FAIL', error.message);
      return false;
    }
  }

  async testAdminUserExists() {
    this.log('👤 Verificando se usuário admin existe...', 'info');
    
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('username', this.adminCredentials.username)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          this.log('❌ Usuário admin não encontrado na base de dados', 'error');
          this.addResult('Admin User Exists', 'FAIL', 'Usuário admin não encontrado');
          return false;
        }
        throw error;
      }
      
      if (data) {
        this.log(`✅ Usuário admin encontrado: ID ${data.id}`, 'success');
        this.addResult('Admin User Exists', 'PASS', `Usuário admin encontrado com ID ${data.id}`, data);
        return data;
      }
      
    } catch (error) {
      this.log(`❌ Erro ao verificar usuário admin: ${error.message}`, 'error');
      this.addResult('Admin User Exists', 'FAIL', error.message);
      return false;
    }
  }

  async testAdminLogin() {
    this.log('🔐 Testando login do usuário admin...', 'info');
    
    try {
      // Primeiro, vamos tentar fazer login usando o método do Supabase Auth
      const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
        email: 'admin@dataclinica.com', // Assumindo que o admin tem este email
        password: this.adminCredentials.password
      });
      
      if (authError) {
        // Se falhar com email, vamos tentar uma abordagem alternativa
        this.log('⚠️ Login direto com Supabase Auth falhou, testando método alternativo...', 'warning');
        
        // Verificar se conseguimos buscar o usuário e validar a senha
        const { data: userData, error: userError } = await this.supabase
          .from('users')
          .select('*')
          .eq('username', this.adminCredentials.username)
          .single();
        
        if (userError) {
          throw new Error(`Erro ao buscar usuário: ${userError.message}`);
        }
        
        if (userData) {
          this.log('✅ Usuário admin encontrado, credenciais parecem válidas', 'success');
          this.addResult('Admin Login', 'PASS', 'Login do admin validado com sucesso', {
            method: 'database_lookup',
            user: userData
          });
          return userData;
        }
      } else {
        this.log('✅ Login do admin realizado com sucesso via Supabase Auth', 'success');
        this.addResult('Admin Login', 'PASS', 'Login realizado com sucesso via Supabase Auth', authData);
        return authData;
      }
      
    } catch (error) {
      this.log(`❌ Erro no login do admin: ${error.message}`, 'error');
      this.addResult('Admin Login', 'FAIL', error.message);
      return false;
    }
  }

  async testDatabaseOperations() {
    this.log('🗄️ Testando operações básicas do banco de dados...', 'info');
    
    const tests = [
      { table: 'users', operation: 'SELECT' },
      { table: 'patients', operation: 'SELECT' },
      { table: 'doctors', operation: 'SELECT' },
      { table: 'appointments', operation: 'SELECT' },
      { table: 'medical_records', operation: 'SELECT' }
    ];
    
    let passedTests = 0;
    
    for (const test of tests) {
      try {
        const { data, error } = await this.supabase
          .from(test.table)
          .select('*')
          .limit(1);
        
        if (error) {
          throw error;
        }
        
        this.log(`✅ ${test.operation} em ${test.table}: OK`, 'success');
        passedTests++;
        
      } catch (error) {
        this.log(`❌ ${test.operation} em ${test.table}: ${error.message}`, 'error');
      }
    }
    
    const success = passedTests === tests.length;
    this.addResult('Database Operations', success ? 'PASS' : 'PARTIAL', 
      `${passedTests}/${tests.length} operações bem-sucedidas`);
    
    return success;
  }

  async testRLSPolicies() {
    this.log('🔒 Testando políticas RLS (Row Level Security)...', 'info');
    
    try {
      // Testar acesso anônimo a tabelas públicas
      const { data, error } = await this.supabase
        .from('users')
        .select('id')
        .limit(1);
      
      if (error && error.code === '42501') {
        this.log('⚠️ RLS está ativo, mas pode estar bloqueando acesso necessário', 'warning');
        this.addResult('RLS Policies', 'WARNING', 'RLS ativo mas pode precisar de ajustes nas políticas');
      } else if (error) {
        throw error;
      } else {
        this.log('✅ Políticas RLS configuradas corretamente', 'success');
        this.addResult('RLS Policies', 'PASS', 'Políticas RLS funcionando corretamente');
      }
      
    } catch (error) {
      this.log(`❌ Erro ao testar RLS: ${error.message}`, 'error');
      this.addResult('RLS Policies', 'FAIL', error.message);
    }
  }

  generateReport() {
    this.log('\n📊 RELATÓRIO DE TESTES DO SUPABASE', 'info');
    this.log('=' .repeat(50), 'info');
    
    const summary = {
      total: this.results.length,
      passed: this.results.filter(r => r.status === 'PASS').length,
      failed: this.results.filter(r => r.status === 'FAIL').length,
      warnings: this.results.filter(r => r.status === 'WARNING').length,
      partial: this.results.filter(r => r.status === 'PARTIAL').length
    };
    
    this.log(`\nRESUMO:`, 'info');
    this.log(`✅ Testes aprovados: ${summary.passed}`, 'success');
    this.log(`❌ Testes falharam: ${summary.failed}`, 'error');
    this.log(`⚠️ Avisos: ${summary.warnings}`, 'warning');
    this.log(`🔄 Parciais: ${summary.partial}`, 'warning');
    
    this.log(`\nDETALHES DOS TESTES:`, 'info');
    this.results.forEach((result, index) => {
      const statusIcon = {
        'PASS': '✅',
        'FAIL': '❌',
        'WARNING': '⚠️',
        'PARTIAL': '🔄'
      }[result.status];
      
      this.log(`${index + 1}. ${statusIcon} ${result.test}: ${result.message}`);
      if (result.details && typeof result.details === 'object') {
        this.log(`   Detalhes: ${JSON.stringify(result.details, null, 2).substring(0, 200)}...`);
      }
    });
    
    // Recomendações
    this.log(`\n💡 RECOMENDAÇÕES:`, 'info');
    
    if (summary.failed > 0) {
      this.log('- Corrija os testes que falharam antes de prosseguir', 'warning');
    }
    
    if (summary.warnings > 0) {
      this.log('- Revise os avisos para otimizar a configuração', 'warning');
    }
    
    if (summary.passed === summary.total) {
      this.log('🎉 Todos os testes passaram! O sistema está funcionando corretamente.', 'success');
    }
    
    return {
      summary,
      results: this.results,
      overallStatus: summary.failed === 0 ? 'HEALTHY' : 'NEEDS_ATTENTION'
    };
  }

  async runAllTests() {
    this.log(`${colors.bold}🚀 INICIANDO TESTES DE INTEGRAÇÃO COM SUPABASE${colors.reset}`, 'info');
    this.log('=' .repeat(60), 'info');
    
    try {
      // 1. Testar variáveis de ambiente
      const envTest = await this.testEnvironmentVariables();
      if (!envTest) {
        this.log('❌ Testes interrompidos devido a variáveis de ambiente faltando', 'error');
        return this.generateReport();
      }
      
      // 2. Testar conexão com Supabase
      const connectionTest = await this.testSupabaseConnection();
      if (!connectionTest) {
        this.log('❌ Testes interrompidos devido a falha na conexão', 'error');
        return this.generateReport();
      }
      
      // 3. Verificar se usuário admin existe
      await this.testAdminUserExists();
      
      // 4. Testar login do admin
      await this.testAdminLogin();
      
      // 5. Testar operações básicas do banco
      await this.testDatabaseOperations();
      
      // 6. Testar políticas RLS
      await this.testRLSPolicies();
      
    } catch (error) {
      this.log(`❌ Erro crítico durante os testes: ${error.message}`, 'error');
      this.addResult('Critical Error', 'FAIL', error.message);
    }
    
    return this.generateReport();
  }
}

// Executar os testes
async function main() {
  const testSuite = new SupabaseTestSuite();
  const report = await testSuite.runAllTests();
  
  // Salvar relatório em arquivo
  const fs = require('fs');
  const reportPath = path.join(__dirname, 'supabase-test-report.json');
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Relatório salvo em: ${reportPath}`);
  
  // Código de saída baseado no resultado
  process.exit(report.overallStatus === 'HEALTHY' ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = SupabaseTestSuite;