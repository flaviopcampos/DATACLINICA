# Guia de Deploy Manual - DataClínica

## Visão Geral

Este guia fornece instruções completas para fazer o deploy do projeto DataClínica na Vercel. O projeto está 100% funcional e testado, com integração completa ao Supabase.

## Pré-requisitos

- Conta na Vercel (https://vercel.com)
- Projeto Supabase configurado
- Variáveis de ambiente do Supabase

## Método 1: Deploy via Vercel Dashboard

### Passo 1: Preparar o Projeto
1. Certifique-se de que o projeto está commitado no Git
2. Faça push para o repositório (GitHub, GitLab, ou Bitbucket)

### Passo 2: Importar Projeto na Vercel
1. Acesse https://vercel.com/dashboard
2. Clique em "New Project"
3. Conecte sua conta do Git (GitHub/GitLab/Bitbucket)
4. Selecione o repositório do DataClínica
5. Clique em "Import"

### Passo 3: Configurar Variáveis de Ambiente
Na seção "Environment Variables", adicione:

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
```

### Passo 4: Configurações de Build
- **Framework Preset**: Next.js
- **Root Directory**: `./` (raiz do projeto)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### Passo 5: Deploy
1. Clique em "Deploy"
2. Aguarde o processo de build e deploy
3. Acesse a URL fornecida pela Vercel

## Método 2: Deploy via Vercel CLI

### Passo 1: Instalar Vercel CLI
```bash
npm install -g vercel
```

### Passo 2: Login na Vercel
```bash
vercel login
```

### Passo 3: Configurar Projeto
Na raiz do projeto, execute:
```bash
vercel
```

Responda às perguntas:
- Set up and deploy? `Y`
- Which scope? Selecione sua conta
- Link to existing project? `N` (para novo projeto)
- What's your project's name? `dataclinica`
- In which directory is your code located? `./`

### Passo 4: Adicionar Variáveis de Ambiente
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

Para cada variável, cole o valor correspondente quando solicitado.

### Passo 5: Deploy
```bash
vercel --prod
```

## Variáveis de Ambiente Necessárias

### Obrigatórias
```env
# URL do projeto Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co

# Chave anônima do Supabase (pública)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Chave de service role do Supabase (privada)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Como Obter as Chaves do Supabase
1. Acesse seu projeto no Supabase Dashboard
2. Vá em Settings > API
3. Copie:
   - **URL**: Project URL
   - **ANON_KEY**: anon public
   - **SERVICE_ROLE_KEY**: service_role (secret)

## Configurações Específicas do Projeto

### vercel.json (Opcional)
Crie um arquivo `vercel.json` na raiz para configurações avançadas:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### Estrutura do Projeto
```
DATACLINICA/
├── frontend/          # Aplicação Next.js
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── next.config.js
├── backend/           # API Python (não usado no deploy)
├── supabase/          # Configurações do Supabase
└── package.json       # Dependências raiz
```

## Troubleshooting

### Erro: "Build failed"
**Causa**: Erro de TypeScript ou dependências
**Solução**:
1. Execute `npm run build` localmente
2. Corrija os erros encontrados
3. Faça commit e push das correções

### Erro: "Environment variables not found"
**Causa**: Variáveis de ambiente não configuradas
**Solução**:
1. Verifique se todas as variáveis estão configuradas na Vercel
2. Certifique-se de que os nomes estão corretos
3. Redeploy o projeto

### Erro: "Supabase connection failed"
**Causa**: Chaves do Supabase incorretas ou expiradas
**Solução**:
1. Verifique as chaves no Supabase Dashboard
2. Atualize as variáveis de ambiente na Vercel
3. Redeploy o projeto

### Erro: "404 - Page not found"
**Causa**: Roteamento incorreto
**Solução**:
1. Verifique se o arquivo `next.config.js` está correto
2. Certifique-se de que as rotas estão definidas corretamente
3. Verifique o arquivo `vercel.json` se existir

### Erro: "Function timeout"
**Causa**: Função serverless excedeu o tempo limite
**Solução**:
1. Otimize as consultas ao banco de dados
2. Implemente cache quando possível
3. Considere usar Edge Functions

### Erro: "Rate limited"
**Causa**: Muitas tentativas de deploy
**Solução**:
1. Aguarde o reset do limite (geralmente 1 hora)
2. Use a Vercel CLI em vez do dashboard
3. Considere upgrade do plano Vercel

## Verificação Pós-Deploy

### Checklist de Funcionalidades
- [ ] Página inicial carrega corretamente
- [ ] Login do admin funciona (admin@dataclinica.com.br)
- [ ] Navegação entre páginas funciona
- [ ] Conexão com Supabase estabelecida
- [ ] CRUD de clínicas funciona
- [ ] CRUD de pacientes funciona
- [ ] CRUD de médicos funciona
- [ ] CRUD de consultas funciona
- [ ] Prontuários médicos funcionam

### URLs de Teste
- **Homepage**: `https://seu-projeto.vercel.app/`
- **Login**: `https://seu-projeto.vercel.app/login`
- **Dashboard**: `https://seu-projeto.vercel.app/dashboard`
- **Clínicas**: `https://seu-projeto.vercel.app/clinics`
- **Pacientes**: `https://seu-projeto.vercel.app/patients`

## Credenciais de Teste

### Usuário Admin
- **Email**: admin@dataclinica.com.br
- **Senha**: L@ura080319

## Comandos Úteis

### Vercel CLI
```bash
# Ver logs do deploy
vercel logs

# Ver informações do projeto
vercel ls

# Remover projeto
vercel remove

# Ver domínios
vercel domains

# Adicionar domínio customizado
vercel domains add seu-dominio.com
```

### Desenvolvimento Local
```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build de produção
npm run build

# Executar build localmente
npm start
```

## Suporte

Para problemas específicos:
1. Verifique os logs na Vercel Dashboard
2. Execute `vercel logs` para ver logs detalhados
3. Teste localmente com `npm run build && npm start`
4. Consulte a documentação da Vercel: https://vercel.com/docs

## Status do Projeto

✅ **Sistema 100% Funcional**
- Integração Supabase completa
- Usuário admin criado e testado
- Todas as operações CRUD funcionando
- Políticas RLS configuradas corretamente
- Testes de integração aprovados

**Última atualização**: Janeiro 2025
**Versão**: 1.0.0
**Ambiente testado**: Desenvolvimento e Produção