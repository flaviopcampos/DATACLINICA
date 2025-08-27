# Sistema de Gestão de Sessões - DataClínica

## Visão Geral

O Sistema de Gestão de Sessões do DataClínica oferece controle completo sobre as sessões de usuário, incluindo monitoramento em tempo real, recursos de segurança avançados e integração com sistemas de 2FA, auditoria e notificações.

## Funcionalidades Principais

### 1. Gestão de Sessões
- **Visualização de Sessões Ativas**: Lista todas as sessões ativas do usuário
- **Detalhes da Sessão**: Informações sobre dispositivo, localização, IP e última atividade
- **Encerramento de Sessões**: Capacidade de encerrar sessões individuais ou todas as outras
- **Histórico de Sessões**: Visualização de sessões encerradas

### 2. Monitoramento de Atividade
- **Atividade em Tempo Real**: Monitoramento das ações do usuário
- **Histórico de Atividades**: Registro detalhado de todas as ações
- **Análise de Comportamento**: Detecção de padrões de uso

### 3. Recursos de Segurança
- **Alertas de Segurança**: Notificações para atividades suspeitas
- **Análise de Risco**: Avaliação automática do nível de risco das sessões
- **Detecção de Anomalias**: Identificação de comportamentos incomuns
- **Bloqueio Automático**: Proteção contra atividades maliciosas

### 4. Integração com Sistemas Existentes
- **2FA**: Validação com autenticação de dois fatores
- **Auditoria**: Registro de eventos para conformidade
- **Notificações**: Alertas por múltiplos canais

## Estrutura do Projeto

```
frontend/src/
├── components/sessions/          # Componentes de sessão
│   ├── SessionCard.tsx          # Card individual de sessão
│   ├── ActiveSessionsList.tsx   # Lista de sessões ativas
│   ├── SessionActivity.tsx      # Atividade da sessão
│   ├── SessionFilters.tsx       # Filtros de sessão
│   ├── SecurityAlerts.tsx       # Alertas de segurança
│   └── SecurityDashboard.tsx    # Dashboard de segurança
├── components/dashboard/         # Componentes do dashboard
│   └── SecurityDashboardIntegrated.tsx # Dashboard integrado
├── hooks/                       # Hooks personalizados
│   ├── useSessions.ts          # Hook de gestão de sessões
│   ├── useSessionActivity.ts   # Hook de atividade
│   ├── useSecurity.ts          # Hook de segurança
│   └── useIntegration.ts       # Hook de integração
├── services/                    # Serviços de API
│   ├── sessionService.ts       # Serviço de sessões
│   ├── securityService.ts      # Serviço de segurança
│   └── integrationService.ts   # Serviço de integração
├── types/                       # Definições de tipos
│   └── session.ts              # Tipos de sessão
├── middleware/                  # Middleware
│   └── sessionMiddleware.ts    # Middleware de sessão
└── tests/                       # Testes
    └── session-system.test.ts  # Testes do sistema
```

## Como Usar

### 1. Hooks Principais

#### useSessions
```typescript
import { useSessions } from '@/hooks/useSessions'

function MyComponent() {
  const {
    sessions,
    isLoading,
    error,
    terminateSession,
    terminateAllOtherSessions,
    refreshSessions
  } = useSessions()

  // Encerrar uma sessão específica
  const handleTerminate = (sessionId: string) => {
    terminateSession.mutate(sessionId)
  }

  // Encerrar todas as outras sessões
  const handleTerminateAll = () => {
    terminateAllOtherSessions.mutate()
  }

  return (
    <div>
      {sessions?.map(session => (
        <div key={session.id}>
          {session.deviceInfo.name}
          <button onClick={() => handleTerminate(session.id)}>
            Encerrar
          </button>
        </div>
      ))}
    </div>
  )
}
```

#### useSessionActivity
```typescript
import { useSessionActivity } from '@/hooks/useSessionActivity'

function SessionDetails({ sessionId }: { sessionId: string }) {
  const {
    activities,
    isLoading,
    recordActivity
  } = useSessionActivity(sessionId)

  // Registrar nova atividade
  const handleAction = () => {
    recordActivity.mutate({
      type: 'button_click',
      description: 'Usuário clicou no botão',
      metadata: { button: 'save' }
    })
  }

  return (
    <div>
      {activities?.map(activity => (
        <div key={activity.id}>
          {activity.description} - {activity.timestamp}
        </div>
      ))}
    </div>
  )
}
```

#### useSecurity
```typescript
import { useSecurity } from '@/hooks/useSecurity'

function SecurityPanel() {
  const {
    alerts,
    securityEvents,
    analyzeSessionSecurity,
    createAlert,
    dismissAlert
  } = useSecurity()

  // Analisar segurança de uma sessão
  const handleAnalyze = (sessionId: string) => {
    analyzeSessionSecurity.mutate(sessionId)
  }

  // Criar alerta de segurança
  const handleCreateAlert = () => {
    createAlert.mutate({
      sessionId: 'session-1',
      userId: 1,
      type: 'suspicious_activity',
      severity: 'high',
      message: 'Atividade suspeita detectada'
    })
  }

  return (
    <div>
      {alerts?.map(alert => (
        <div key={alert.id} className={`alert-${alert.severity}`}>
          {alert.message}
          <button onClick={() => dismissAlert.mutate(alert.id)}>
            Dispensar
          </button>
        </div>
      ))}
    </div>
  )
}
```

### 2. Componentes Prontos

#### ActiveSessionsList
```typescript
import { ActiveSessionsList } from '@/components/sessions'

function SessionsPage() {
  return (
    <div>
      <h1>Minhas Sessões</h1>
      <ActiveSessionsList />
    </div>
  )
}
```

#### SecurityDashboard
```typescript
import { SecurityDashboard } from '@/components/sessions'

function SecurityPage() {
  return (
    <div>
      <h1>Segurança</h1>
      <SecurityDashboard />
    </div>
  )
}
```

#### SecurityDashboardIntegrated
```typescript
import { SecurityDashboardIntegrated } from '@/components/dashboard'

function DashboardPage() {
  return (
    <div>
      <h1>Dashboard de Segurança</h1>
      <SecurityDashboardIntegrated />
    </div>
  )
}
```

### 3. Middleware de Sessão

```typescript
// Em um componente de layout ou página
import { useEffect } from 'react'
import { sessionMiddleware } from '@/middleware/sessionMiddleware'

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Verificar sessão ao carregar
    sessionMiddleware.validateSession()
  }, [])

  return <div>{children}</div>
}
```

## Configuração

### 1. Variáveis de Ambiente

```env
# API Base URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Configurações de Sessão
SESSION_TIMEOUT=3600000  # 1 hora em ms
MAX_CONCURRENT_SESSIONS=5
SECURITY_CHECK_INTERVAL=300000  # 5 minutos
```

### 2. Configuração do React Query

```typescript
// Em _app.tsx ou layout.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
})

function App({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

## Tipos TypeScript

### Session
```typescript
interface Session {
  id: string
  userId: number
  deviceInfo: DeviceInfo
  location: LocationInfo
  status: SessionStatus
  createdAt: string
  lastActivity: string
  expiresAt: string
  ipAddress: string
  userAgent: string
  isCurrentSession: boolean
  riskLevel: RiskLevel
  securityScore: number
}
```

### SessionActivity
```typescript
interface SessionActivity {
  id: string
  sessionId: string
  userId: number
  type: ActivityType
  description: string
  timestamp: string
  metadata?: Record<string, any>
  ipAddress: string
  userAgent: string
}
```

### SecurityAlert
```typescript
interface SecurityAlert {
  id: string
  sessionId: string
  userId: number
  type: AlertType
  severity: AlertSeverity
  message: string
  details?: Record<string, any>
  timestamp: string
  isRead: boolean
  isDismissed?: boolean
}
```

## Recursos de Segurança

### 1. Detecção de Anomalias
- **Localização Incomum**: Detecta logins de localizações não usuais
- **Dispositivo Novo**: Identifica novos dispositivos
- **Horário Incomum**: Detecta atividade fora do horário normal
- **Múltiplas Tentativas**: Monitora tentativas de login falhadas

### 2. Análise de Risco
- **Score de Segurança**: Pontuação de 0-100 baseada em vários fatores
- **Nível de Risco**: Low, Medium, High, Critical
- **Fatores de Risco**: IP suspeito, dispositivo não reconhecido, etc.

### 3. Ações Automáticas
- **Bloqueio de Sessão**: Bloqueia sessões suspeitas automaticamente
- **Logout Forçado**: Encerra sessões em caso de atividade maliciosa
- **Notificações**: Envia alertas por email, SMS ou push
- **Reautenticação**: Solicita nova autenticação quando necessário

## Integração com Sistemas Existentes

### 1. Sistema 2FA
- Validação automática com tokens 2FA
- Verificação de segurança da sessão
- Reautenticação quando necessário

### 2. Sistema de Auditoria
- Registro automático de todas as atividades
- Logs detalhados para conformidade
- Integração com relatórios de auditoria

### 3. Sistema de Notificações
- Alertas por múltiplos canais
- Preferências personalizáveis
- Templates de notificação

## Testes

Para executar os testes:

```bash
# Testes unitários
npm test session-system.test.ts

# Testes com cobertura
npm test -- --coverage

# Testes em modo watch
npm test -- --watch
```

## Troubleshooting

### Problemas Comuns

1. **Sessão não carrega**
   - Verificar se o token de autenticação está válido
   - Confirmar se a API está respondendo
   - Verificar logs do console

2. **Alertas não aparecem**
   - Verificar configurações de notificação
   - Confirmar se o usuário tem permissões adequadas
   - Verificar se o serviço de segurança está ativo

3. **Erro ao encerrar sessão**
   - Verificar se a sessão ainda existe
   - Confirmar permissões do usuário
   - Verificar logs do servidor

### Logs e Debugging

```typescript
// Habilitar logs detalhados
const DEBUG_SESSIONS = process.env.NODE_ENV === 'development'

if (DEBUG_SESSIONS) {
  console.log('Session data:', sessions)
  console.log('Security alerts:', alerts)
}
```

## Roadmap

### Próximas Funcionalidades
- [ ] Análise comportamental avançada
- [ ] Machine Learning para detecção de anomalias
- [ ] Integração com sistemas de threat intelligence
- [ ] Dashboard de analytics avançado
- [ ] API para integrações externas
- [ ] Suporte a SSO (Single Sign-On)
- [ ] Geofencing para controle de acesso
- [ ] Biometria para autenticação

## Contribuição

Para contribuir com o sistema:

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Implemente os testes
4. Faça commit das mudanças
5. Abra um Pull Request

## Suporte

Para suporte técnico:
- Email: suporte@dataclinica.com
- Documentação: [docs.dataclinica.com](https://docs.dataclinica.com)
- Issues: [GitHub Issues](https://github.com/dataclinica/issues)