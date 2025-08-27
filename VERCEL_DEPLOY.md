# Deploy do DataClínica no Vercel

## Pré-requisitos

1. Conta no Vercel (https://vercel.com)
2. Repositório Git com o código do projeto
3. Projeto Supabase configurado

## Configuração de Variáveis de Ambiente

No painel do Vercel, configure as seguintes variáveis de ambiente:

### Supabase
```
NEXT_PUBLIC_SUPABASE_URL=https://kamsukegzsnvaujtfgek.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthbXN1a2VnenNudmF1anRmZ2VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTA4NjUsImV4cCI6MjA2OTg4Njg2NX0.kVHo2kUi1sWOA-ca_WEu3ZxsrPapzdGVUa653min3fw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthbXN1a2VnenNudmF1anRmZ2VrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMxMDg2NSwiZXhwIjoyMDY5ODg2ODY1fQ.NmHg_JNoM3DOnQRlCubczBaxdxs37JoVfUvogjW-Q5I
```

### Ambiente
```
NODE_ENV=production
```

## Configuração no Supabase

### URLs de Redirecionamento
No painel do Supabase, vá em Authentication > URL Configuration e adicione:

**Site URL:**
```
https://seu-projeto.vercel.app
```

**Redirect URLs:**
```
https://seu-projeto.vercel.app/auth/callback
https://seu-projeto.vercel.app/auth/login
https://seu-projeto.vercel.app/dashboard
```

## Passos para Deploy

1. **Conectar Repositório**
   - Acesse o Vercel Dashboard
   - Clique em "New Project"
   - Conecte seu repositório Git

2. **Configurar Build**
   - O Vercel detectará automaticamente que é um projeto Next.js
   - As configurações do `vercel.json` serão aplicadas automaticamente

3. **Adicionar Variáveis de Ambiente**
   - Na seção "Environment Variables"
   - Adicione todas as variáveis listadas acima
   - Certifique-se de marcar para todos os ambientes (Production, Preview, Development)

4. **Deploy**
   - Clique em "Deploy"
   - Aguarde o build completar

## Verificação Pós-Deploy

### Teste de Autenticação
1. Acesse `https://seu-projeto.vercel.app/auth/login`
2. Teste login com: `teste@dataclinica.com` / `teste123`
3. Verifique se o redirecionamento funciona corretamente

### Verificação de Logs
- Monitore os logs no Vercel Dashboard
- Verifique erros no console do navegador

## Troubleshooting

### Erro de CORS
Se houver problemas de CORS, verifique:
- URLs de redirecionamento no Supabase
- Configuração de domínios permitidos

### Erro de Autenticação
- Verifique se as chaves do Supabase estão corretas
- Confirme se as URLs de callback estão configuradas

### Erro de Build
- Verifique se todas as dependências estão no package.json
- Confirme se não há erros de TypeScript

## Comandos Úteis

```bash
# Testar build localmente
cd frontend
npm run build

# Verificar tipos
npm run type-check

# Executar linting
npm run lint
```

## Próximos Passos

1. Configurar domínio customizado
2. Implementar CI/CD com GitHub Actions
3. Configurar monitoramento e analytics
4. Implementar backup automático do banco