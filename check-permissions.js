const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const SUPABASE_URL = 'https://kamsukegzsnvaujtfgek.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthbXN1a2VnenNudmF1anRmZ2VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTA4NjUsImV4cCI6MjA2OTg4Njg2NX0.kVHo2kUi1sWOA-ca_WEu3ZxsrPapzdGVUa653min3fw';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthbXN1a2VnenNudmF1anRmZ2VrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMxMDg2NSwiZXhwIjoyMDY5ODg2ODY1fQ.NmHg_JNoM3DOnQRlCubczBaxdxs37JoVfUvogjW-Q5I';

async function checkPermissions() {
  console.log('🔍 VERIFICANDO PERMISSÕES DAS TABELAS');
  console.log('='.repeat(50));
  
  // Criar cliente com service role (admin)
  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  
  try {
    console.log('\n📋 Verificando permissões atuais...');
    
    const { data: permissions, error } = await supabaseAdmin
      .from('information_schema.role_table_grants')
      .select('grantee, table_name, privilege_type')
      .eq('table_schema', 'public')
      .in('grantee', ['anon', 'authenticated'])
      .order('table_name');
    
    if (error) {
      console.log(`❌ Erro ao verificar permissões: ${error.message}`);
      return;
    }
    
    console.log('\n📊 Permissões encontradas:');
    const permissionsByTable = {};
    
    permissions.forEach(perm => {
      if (!permissionsByTable[perm.table_name]) {
        permissionsByTable[perm.table_name] = {};
      }
      if (!permissionsByTable[perm.table_name][perm.grantee]) {
        permissionsByTable[perm.table_name][perm.grantee] = [];
      }
      permissionsByTable[perm.table_name][perm.grantee].push(perm.privilege_type);
    });
    
    Object.keys(permissionsByTable).forEach(table => {
      console.log(`\n🔹 Tabela: ${table}`);
      Object.keys(permissionsByTable[table]).forEach(role => {
        console.log(`   ${role}: ${permissionsByTable[table][role].join(', ')}`);
      });
    });
    
    // Verificar tabelas importantes
    const importantTables = ['users', 'clinics', 'patients', 'doctors', 'appointments', 'medical_records'];
    
    console.log('\n🔧 CORRIGINDO PERMISSÕES...');
    
    for (const table of importantTables) {
      console.log(`\n📝 Configurando permissões para tabela: ${table}`);
      
      try {
        // Conceder permissões SELECT para anon
        const { error: anonError } = await supabaseAdmin.rpc('grant_select_to_anon', {
          table_name: table
        });
        
        if (anonError) {
          console.log(`⚠️ Erro ao conceder SELECT para anon em ${table}: ${anonError.message}`);
          
          // Tentar com SQL direto
          const { error: sqlError } = await supabaseAdmin.rpc('exec_sql', {
            sql: `GRANT SELECT ON ${table} TO anon;`
          });
          
          if (sqlError) {
            console.log(`❌ Erro SQL para ${table}: ${sqlError.message}`);
          } else {
            console.log(`✅ Permissão SELECT concedida para anon em ${table}`);
          }
        } else {
          console.log(`✅ Permissão SELECT concedida para anon em ${table}`);
        }
        
        // Conceder todas as permissões para authenticated
        const { error: authError } = await supabaseAdmin.rpc('grant_all_to_authenticated', {
          table_name: table
        });
        
        if (authError) {
          console.log(`⚠️ Erro ao conceder ALL para authenticated em ${table}: ${authError.message}`);
          
          // Tentar com SQL direto
          const { error: sqlError2 } = await supabaseAdmin.rpc('exec_sql', {
            sql: `GRANT ALL PRIVILEGES ON ${table} TO authenticated;`
          });
          
          if (sqlError2) {
            console.log(`❌ Erro SQL para ${table}: ${sqlError2.message}`);
          } else {
            console.log(`✅ Todas as permissões concedidas para authenticated em ${table}`);
          }
        } else {
          console.log(`✅ Todas as permissões concedidas para authenticated em ${table}`);
        }
        
      } catch (error) {
        console.log(`❌ Erro geral ao configurar ${table}: ${error.message}`);
      }
    }
    
    console.log('\n🧪 TESTANDO ACESSO APÓS CORREÇÕES...');
    
    // Criar cliente anon para testar
    const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    for (const table of importantTables) {
      try {
        const { data, error } = await supabaseAnon
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: Acesso OK`);
        }
      } catch (error) {
        console.log(`❌ ${table}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.log(`❌ Erro geral: ${error.message}`);
  }
}

// Executar verificação
if (require.main === module) {
  checkPermissions()
    .then(() => {
      console.log('\n✅ Verificação concluída!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro durante a verificação:', error);
      process.exit(1);
    });
}

module.exports = { checkPermissions };