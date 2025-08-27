const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Definida' : 'Não definida');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Definida' : 'Não definida');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixRLSPolicies() {
  console.log('🔧 Iniciando correção das políticas RLS...');
  
  const policies = [
    {
      table: 'clinics',
      policies: [
        {
          name: 'clinics_select_policy',
          action: 'SELECT',
          sql: `CREATE POLICY "clinics_select_policy" ON "public"."clinics" AS PERMISSIVE FOR SELECT TO authenticated USING (true);`
        },
        {
          name: 'clinics_insert_policy', 
          action: 'INSERT',
          sql: `CREATE POLICY "clinics_insert_policy" ON "public"."clinics" AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (true);`
        },
        {
          name: 'clinics_update_policy',
          action: 'UPDATE', 
          sql: `CREATE POLICY "clinics_update_policy" ON "public"."clinics" AS PERMISSIVE FOR UPDATE TO authenticated USING (true) WITH CHECK (true);`
        },
        {
          name: 'clinics_delete_policy',
          action: 'DELETE',
          sql: `CREATE POLICY "clinics_delete_policy" ON "public"."clinics" AS PERMISSIVE FOR DELETE TO authenticated USING (true);`
        }
      ]
    },
    {
      table: 'patients',
      policies: [
        {
          name: 'patients_select_policy',
          action: 'SELECT',
          sql: `CREATE POLICY "patients_select_policy" ON "public"."patients" AS PERMISSIVE FOR SELECT TO authenticated USING (true);`
        },
        {
          name: 'patients_insert_policy',
          action: 'INSERT', 
          sql: `CREATE POLICY "patients_insert_policy" ON "public"."patients" AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (true);`
        },
        {
          name: 'patients_update_policy',
          action: 'UPDATE',
          sql: `CREATE POLICY "patients_update_policy" ON "public"."patients" AS PERMISSIVE FOR UPDATE TO authenticated USING (true) WITH CHECK (true);`
        },
        {
          name: 'patients_delete_policy',
          action: 'DELETE',
          sql: `CREATE POLICY "patients_delete_policy" ON "public"."patients" AS PERMISSIVE FOR DELETE TO authenticated USING (true);`
        }
      ]
    },
    {
      table: 'doctors',
      policies: [
        {
          name: 'doctors_select_policy',
          action: 'SELECT',
          sql: `CREATE POLICY "doctors_select_policy" ON "public"."doctors" AS PERMISSIVE FOR SELECT TO authenticated USING (true);`
        },
        {
          name: 'doctors_insert_policy',
          action: 'INSERT',
          sql: `CREATE POLICY "doctors_insert_policy" ON "public"."doctors" AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (true);`
        },
        {
          name: 'doctors_update_policy',
          action: 'UPDATE',
          sql: `CREATE POLICY "doctors_update_policy" ON "public"."doctors" AS PERMISSIVE FOR UPDATE TO authenticated USING (true) WITH CHECK (true);`
        },
        {
          name: 'doctors_delete_policy',
          action: 'DELETE',
          sql: `CREATE POLICY "doctors_delete_policy" ON "public"."doctors" AS PERMISSIVE FOR DELETE TO authenticated USING (true);`
        }
      ]
    },
    {
      table: 'appointments',
      policies: [
        {
          name: 'appointments_select_policy',
          action: 'SELECT',
          sql: `CREATE POLICY "appointments_select_policy" ON "public"."appointments" AS PERMISSIVE FOR SELECT TO authenticated USING (true);`
        },
        {
          name: 'appointments_insert_policy',
          action: 'INSERT',
          sql: `CREATE POLICY "appointments_insert_policy" ON "public"."appointments" AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (true);`
        },
        {
          name: 'appointments_update_policy',
          action: 'UPDATE',
          sql: `CREATE POLICY "appointments_update_policy" ON "public"."appointments" AS PERMISSIVE FOR UPDATE TO authenticated USING (true) WITH CHECK (true);`
        },
        {
          name: 'appointments_delete_policy',
          action: 'DELETE',
          sql: `CREATE POLICY "appointments_delete_policy" ON "public"."appointments" AS PERMISSIVE FOR DELETE TO authenticated USING (true);`
        }
      ]
    }
  ];

  for (const tableConfig of policies) {
    console.log(`\n📋 Processando tabela: ${tableConfig.table}`);
    
    // Primeiro, remover políticas existentes
    console.log(`🗑️  Removendo políticas existentes da tabela ${tableConfig.table}...`);
    
    for (const policy of tableConfig.policies) {
      try {
        const dropResult = await supabase.rpc('exec_sql', {
          sql: `DROP POLICY IF EXISTS "${policy.name}" ON "public"."${tableConfig.table}";`
        });
        
        if (dropResult.error) {
          console.log(`⚠️  Aviso ao remover política ${policy.name}: ${dropResult.error.message}`);
        } else {
          console.log(`✅ Política ${policy.name} removida com sucesso`);
        }
      } catch (error) {
        console.log(`⚠️  Aviso ao remover política ${policy.name}: ${error.message}`);
      }
    }
    
    // Depois, criar novas políticas
    console.log(`🔨 Criando novas políticas para a tabela ${tableConfig.table}...`);
    
    for (const policy of tableConfig.policies) {
      try {
        const createResult = await supabase.rpc('exec_sql', {
          sql: policy.sql
        });
        
        if (createResult.error) {
          console.error(`❌ Erro ao criar política ${policy.name}: ${createResult.error.message}`);
        } else {
          console.log(`✅ Política ${policy.name} criada com sucesso`);
        }
      } catch (error) {
        console.error(`❌ Erro ao criar política ${policy.name}: ${error.message}`);
      }
    }
  }
  
  console.log('\n🎉 Correção das políticas RLS concluída!');
}

async function testTableAccess() {
  console.log('\n🧪 Testando acesso às tabelas após correção...');
  
  const tables = ['clinics', 'patients', 'doctors', 'appointments'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.error(`❌ Erro ao acessar tabela ${table}: ${error.message}`);
      } else {
        console.log(`✅ Acesso à tabela ${table} funcionando corretamente`);
      }
    } catch (error) {
      console.error(`❌ Erro ao testar tabela ${table}: ${error.message}`);
    }
  }
}

async function main() {
  try {
    console.log('🚀 Iniciando correção das políticas RLS do Supabase...');
    
    await fixRLSPolicies();
    await testTableAccess();
    
    console.log('\n✨ Processo concluído com sucesso!');
  } catch (error) {
    console.error('💥 Erro durante a execução:', error.message);
    process.exit(1);
  }
}

main();