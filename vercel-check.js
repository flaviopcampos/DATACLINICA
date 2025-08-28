#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Verificando configurações para deploy na Vercel...');

// Verificar se estamos no diretório correto
const currentDir = process.cwd();
const frontendDir = path.join(currentDir, 'frontend');

if (!fs.existsSync(frontendDir)) {
  console.error('❌ Diretório frontend não encontrado!');
  process.exit(1);
}

console.log('✅ Diretório frontend encontrado');

// Verificar arquivos essenciais
const essentialFiles = [
  'frontend/package.json',
  'frontend/next.config.js',
  'frontend/tsconfig.json',
  'vercel.json'
];

for (const file of essentialFiles) {
  if (!fs.existsSync(path.join(currentDir, file))) {
    console.error(`❌ Arquivo essencial não encontrado: ${file}`);
    process.exit(1);
  }
}

console.log('✅ Todos os arquivos essenciais encontrados');

// Verificar variáveis de ambiente
const envFile = path.join(frontendDir, '.env.local');
if (!fs.existsSync(envFile)) {
  console.error('❌ Arquivo .env.local não encontrado no frontend!');
  process.exit(1);
}

const envContent = fs.readFileSync(envFile, 'utf8');
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_API_URL'
];

for (const envVar of requiredEnvVars) {
  const envRegex = new RegExp(`^${envVar}=(.+)$`, 'm');
  const match = envContent.match(envRegex);
  
  if (!match || !match[1] || match[1].includes('your_') || match[1].trim() === '') {
    console.error(`❌ Variável de ambiente não configurada: ${envVar}`);
    process.exit(1);
  }
}

console.log('✅ Todas as variáveis de ambiente configuradas');

// Verificar dependências
try {
  console.log('🔍 Verificando dependências...');
  execSync('npm list', { cwd: frontendDir, stdio: 'pipe' });
  console.log('✅ Dependências verificadas');
} catch (error) {
  console.log('⚠️  Instalando dependências...');
  try {
    execSync('npm install', { cwd: frontendDir, stdio: 'inherit' });
    console.log('✅ Dependências instaladas');
  } catch (installError) {
    console.error('❌ Erro ao instalar dependências:', installError.message);
    process.exit(1);
  }
}

// Testar build
try {
  console.log('🔍 Testando build do Next.js...');
  execSync('npm run build', { cwd: frontendDir, stdio: 'pipe' });
  console.log('✅ Build executado com sucesso');
} catch (error) {
  console.error('❌ Erro no build:', error.message);
  console.error('Verifique os logs acima para mais detalhes.');
  process.exit(1);
}

// Verificar configuração do Vercel
const vercelConfig = JSON.parse(fs.readFileSync(path.join(currentDir, 'vercel.json'), 'utf8'));
if (!vercelConfig.framework || vercelConfig.framework !== 'nextjs') {
  console.error('❌ Configuração do Vercel incorreta - framework deve ser "nextjs"');
  process.exit(1);
}

console.log('✅ Configuração do Vercel verificada');

console.log('\n🎉 Todas as verificações passaram! O projeto está pronto para deploy na Vercel.');
console.log('\n📋 Próximos passos:');
console.log('1. Faça commit e push das alterações para o GitHub');
console.log('2. Conecte o repositório na Vercel');
console.log('3. Configure as variáveis de ambiente na Vercel:');
console.log('   - NEXT_PUBLIC_SUPABASE_URL');
console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
console.log('   - SUPABASE_SERVICE_ROLE_KEY');
console.log('   - NEXT_PUBLIC_API_URL');
console.log('4. Faça o deploy!');