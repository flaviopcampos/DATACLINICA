# 🚀 Guia Completo de Deploy Manual - DataClínica na Vercel

## 📋 Pré-requisitos

- Conta na Vercel (https://vercel.com)
- Repositório GitHub atualizado
- Variáveis de ambiente do Supabase

## 🎯 Método 1: Deploy via Vercel Dashboard (Recomendado)

### Passo 1: Acessar o Dashboard
1. Acesse https://vercel.com e faça login
2. Clique em "New Project" ou "Add New..."
3. Selecione "Project"

### Passo 2: Conectar Repositório
1. Conecte sua conta GitHub se ainda não estiver conectada
2. Procure pelo repositório `DATACLINICA`
3. Clique em "Import" no repositório correto

### Passo 3: Configurar o Projeto
1. **Project Name**: `dataclinica` (ou nome de sua preferência)
2. **Framework Preset**: Next.js (deve ser detectado automaticamente)
3. **Root Directory**: Deixe em branco ou selecione `frontend`
4. **Build Command**: `cd frontend && npm run build`
5. **Output Directory**: `frontend/.next`
6. **Install Command**: `cd frontend && npm install`

### Passo 4: Configurar Variáveis de Ambiente
Na seção "Environment Variables", adicione:

```
NEXT_PUBLIC_SUPABASE_URL=https://kamsukegzsnvaujttfgek.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthbXN1a2VnenNudmF1anRmZ2VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTA4NjUsImV4cCI6MjA2OTg4Njg2NX0.wJF7qJpKvhfJGhHZvKJQXqJQXqJQXqJQXqJQXqJQXqI
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthbXN1a2VnenNudmF1anRmZ2VrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMxMDg2NSwiZXhwIjoyMDY5ODg2ODY1fQ.NmHg_JNoM3DOnQRlCubczBaxdxs37JoVfUvogjW-Q5I
```

### Passo 5: Deploy
1. Clique em "Deploy"
2. Aguarde o processo de build e deploy
3. Após conclusão, você receberá a URL do projeto

## 🛠️ Método 2: Deploy via Vercel CLI

### Instalação
```bash
npm i -g vercel
```

### Login
```bash
vercel login
```

### Deploy
```bash
# Na raiz do projeto
vercel --prod
```

## 🔧 Configurações Específicas

### vercel.json (Raiz do Projeto)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ]
}
```

### vercel.json (Frontend)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ]
}
```

## 🔐 Variáveis de Ambiente Necessárias

| Variável | Valor | Descrição |
|----------|-------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://kamsukegzsnvaujttfgek.supabase.co` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Chave pública do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Chave de serviço do Supabase |

## 👤 Credenciais de Admin

**Email**: admin@dataclinica.com  
**Senha**: admin123

## 🚨 Troubleshooting

### Erro: "Function Runtimes must have a valid version"
**Solução**: Verifique se o `vercel.json` está configurado corretamente com `@vercel/next`

### Erro: "Module not found"
**Solução**: 
1. Verifique se todas as dependências estão no `package.json`
2. Execute `npm install` localmente
3. Commit e push as alterações

### Erro: "Build failed"
**Solução**:
1. Execute `npm run build` localmente para identificar erros
2. Corrija os erros de TypeScript/ESLint
3. Verifique se todos os imports estão corretos

### Erro: "Environment variables not found"
**Solução**:
1. Verifique se todas as variáveis estão configuradas no dashboard da Vercel
2. Certifique-se de que os nomes estão corretos (case-sensitive)
3. Redeploy após adicionar as variáveis

### Deploy muito lento ou timeout
**Solução**:
1. Verifique o tamanho do repositório
2. Adicione `.vercelignore` para excluir arquivos desnecessários:
   ```
   node_modules
   .next
   .git
   *.log
   backend/
   ```

### Erro de permissão no Supabase
**Solução**:
1. Verifique se as políticas RLS estão configuradas
2. Confirme se as chaves do Supabase estão corretas
3. Teste a conexão localmente primeiro

## 📁 Estrutura de Arquivos Importante

```
DATACLINICA/
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── next.config.js
│   └── vercel.json
├── vercel.json
└── README.md
```

## ✅ Checklist Pré-Deploy

- [ ] Repositório GitHub atualizado
- [ ] Build local funcionando (`npm run build`)
- [ ] Variáveis de ambiente configuradas
- [ ] Dependências instaladas
- [ ] Configuração `vercel.json` correta
- [ ] Supabase funcionando

## 🔄 Atualizações Futuras

Para atualizações futuras:
1. Faça as alterações no código
2. Commit e push para o GitHub
3. A Vercel fará o redeploy automaticamente

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs de build na Vercel
2. Teste localmente primeiro
3. Consulte a documentação da Vercel: https://vercel.com/docs

---

**🎉 Projeto DataClínica está pronto para produção!**

Após o deploy bem-sucedido, você terá:
- ✅ Sistema completo de gestão clínica
- ✅ Autenticação e autorização
- ✅ CRUD completo para todas as entidades
- ✅ Relatórios e dashboards
- ✅ Integração com Supabase
- ✅ Interface responsiva e moderna