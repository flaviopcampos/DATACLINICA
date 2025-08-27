# DataClínica - Lista de Tarefas para Finalização 100%

## 1. Visão Geral do Projeto

O DataClínica é um sistema de gestão clínica completo com arquitetura SaaS multiempresa. Atualmente possui um backend robusto em FastAPI/PostgreSQL, mas necessita de migração para Supabase e criação de um frontend moderno.

**Status Atual:**
- ✅ Backend FastAPI completo e funcional
- ✅ Modelos de dados bem estruturados
- ✅ APIs REST implementadas
- ❌ Frontend removido (necessita recriação)
- ❌ Banco PostgreSQL local (necessita migração para Supabase)

## 2. Prioridades de Implementação

### 🔴 ALTA PRIORIDADE - Migração e Infraestrutura

#### 2.1 Migração do Banco de Dados PostgreSQL → Supabase
- [ ] **Configurar projeto Supabase**
  - Criar conta e projeto no Supabase
  - Configurar variáveis de ambiente
  - Obter chaves de API (anon key, service role key)

- [ ] **Migrar estrutura do banco**
  - Analisar modelos existentes em `backend/models.py`
  - Criar tabelas no Supabase:
    - `clinics` (clínicas)
    - `users` (usuários)
    - `patients` (pacientes)
    - `patient_documents` (documentos de pacientes)
    - `doctors` (médicos)
    - `medical_record_templates` (templates de prontuários)
    - `cid_diagnosis` (diagnósticos CID)
    - `medical_record_diagnosis` (diagnósticos de prontuários)
    - `prescriptions` (prescrições)

- [ ] **Configurar Row Level Security (RLS)**
  - Implementar políticas de segurança por clínica
  - Configurar permissões de usuário
  - Testar isolamento de dados entre clínicas

- [ ] **Migrar dados existentes**
  - Exportar dados do PostgreSQL
  - Importar para Supabase
  - Validar integridade dos dados

#### 2.2 Atualizar Backend para Supabase
- [ ] **Substituir dependências**
  - Remover `psycopg2-binary`
  - Adicionar `supabase-py`
  - Atualizar `requirements.txt`

- [ ] **Refatorar conexão de banco**
  - Substituir SQLAlchemy por cliente Supabase
  - Atualizar `backend/database.py`
  - Configurar autenticação Supabase

- [ ] **Atualizar modelos e schemas**
  - Adaptar `backend/models.py` para Supabase
  - Ajustar `backend/schemas.py`
  - Testar compatibilidade

### 🟡 MÉDIA PRIORIDADE - Frontend Moderno

#### 2.3 Criar Frontend Next.js 14
- [ ] **Configuração inicial**
  - Inicializar projeto Next.js 14 com TypeScript
  - Configurar shadcn/ui
  - Instalar TailwindCSS
  - Configurar estrutura de pastas

- [ ] **Componentes base**
  - Layout principal responsivo
  - Sidebar de navegação
  - Header com perfil do usuário
  - Componentes de UI (Button, Input, Modal, Table)
  - Sistema de notificações (toast)

- [ ] **Autenticação**
  - Integrar Supabase Auth
  - Páginas de login/registro
  - Proteção de rotas
  - Gerenciamento de sessão

#### 2.4 Páginas Principais
- [ ] **Dashboard**
  - Métricas principais da clínica
  - Gráficos de performance
  - Atividades recentes
  - Ações rápidas

- [ ] **Gestão de Pacientes**
  - Lista de pacientes com filtros
  - Formulário de cadastro/edição
  - Visualização de prontuário
  - Upload de documentos

- [ ] **Agendamentos**
  - Calendário de consultas
  - Formulário de agendamento
  - Gestão de horários
  - Notificações automáticas

- [ ] **Gestão de Médicos**
  - Cadastro de profissionais
  - Especialidades e horários
  - Agenda pessoal

### 🟢 BAIXA PRIORIDADE - Funcionalidades Avançadas

#### 2.5 Funcionalidades Complementares
- [ ] **Prontuário Eletrônico**
  - Editor de prontuários
  - Templates personalizáveis
  - Histórico médico
  - Prescrições digitais

- [ ] **Relatórios e BI**
  - Dashboard analítico
  - Relatórios financeiros
  - Métricas de atendimento
  - Exportação de dados

- [ ] **Gestão Financeira**
  - Controle de pagamentos
  - Faturamento
  - Relatórios financeiros
  - Integração com meios de pagamento

- [ ] **Configurações Avançadas**
  - Personalização da clínica
  - Gestão de usuários e permissões
  - Configurações de notificação
  - Backup e restauração

## 3. Arquitetura Técnica Proposta

### 3.1 Stack Tecnológica
- **Frontend:** Next.js 14 + TypeScript + shadcn/ui + TailwindCSS
- **Backend:** FastAPI + Python (mantido)
- **Banco de Dados:** Supabase (PostgreSQL + Auth + Storage)
- **Autenticação:** Supabase Auth
- **Deploy:** Vercel (frontend) + Railway/Render (backend)

### 3.2 Estrutura de Pastas Frontend
```
frontend/
├── app/
│   ├── (auth)/
│   ├── dashboard/
│   ├── patients/
│   ├── appointments/
│   └── layout.tsx
├── components/
│   ├── ui/
│   ├── forms/
│   └── layout/
├── lib/
│   ├── supabase.ts
│   ├── utils.ts
│   └── validations.ts
└── types/
    └── database.ts
```

## 4. Cronograma de Implementação

### Semana 1-2: Migração de Dados
- Configurar Supabase
- Migrar estrutura do banco
- Atualizar backend
- Testes de conectividade

### Semana 3-4: Frontend Base
- Configurar Next.js
- Implementar autenticação
- Criar componentes base
- Dashboard inicial

### Semana 5-6: Funcionalidades Core
- Gestão de pacientes
- Sistema de agendamentos
- Integração frontend-backend
- Testes de funcionalidade

### Semana 7-8: Refinamentos
- Funcionalidades avançadas
- Otimizações de performance
- Testes finais
- Deploy em produção

## 5. Considerações Técnicas

### 5.1 Segurança
- Implementar RLS no Supabase
- Validação de dados no frontend e backend
- Sanitização de inputs
- Logs de auditoria

### 5.2 Performance
- Lazy loading de componentes
- Otimização de imagens
- Cache de dados
- Paginação eficiente

### 5.3 Responsividade
- Design mobile-first
- Breakpoints bem definidos
- Componentes adaptativos
- Testes em diferentes dispositivos

## 6. Critérios de Aceitação

### ✅ Migração Completa
- [ ] Todos os dados migrados para Supabase
- [ ] Backend funcionando com Supabase
- [ ] RLS configurado e testado
- [ ] Performance mantida ou melhorada

### ✅ Frontend Funcional
- [ ] Todas as páginas implementadas
- [ ] Responsividade em todos os dispositivos
- [ ] Integração completa com backend
- [ ] Testes de usabilidade aprovados

### ✅ Sistema Completo
- [ ] Autenticação funcionando
- [ ] CRUD completo para todas as entidades
- [ ] Relatórios básicos implementados
- [ ] Deploy em produção realizado

## 7. Próximos Passos Imediatos

1. **Configurar ambiente Supabase**
2. **Analisar e documentar estrutura atual do banco**
3. **Criar script de migração de dados**
4. **Inicializar projeto Next.js**
5. **Configurar integração Supabase no frontend**

---

**Observação:** Este documento serve como guia para finalizar o DataClínica 100%. Cada tarefa deve ser validada e testada antes de prosseguir para a próxima fase.