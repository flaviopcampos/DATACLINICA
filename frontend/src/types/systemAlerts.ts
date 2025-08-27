export interface SystemAlert {
  id: string
  name: string
  description?: string
  type: SystemAlertType
  category: AlertCategory
  severity: AlertSeverity
  priority: AlertPriority
  status: AlertStatus
  source: AlertSource
  target: AlertTarget
  condition: AlertCondition
  trigger: AlertTrigger
  notifications: AlertNotifications
  actions: AlertAction[]
  escalation: AlertEscalation
  suppression: AlertSuppression
  metrics: AlertMetrics
  history: AlertHistory[]
  tags: string[]
  metadata: Record<string, any>
  enabled: boolean
  createdBy: string
  assignedTo?: string
  acknowledgedBy?: string
  resolvedBy?: string
  createdAt: string
  triggeredAt?: string
  acknowledgedAt?: string
  resolvedAt?: string
  updatedAt: string
}

export interface AlertCondition {
  metric: string
  operator: AlertOperator
  threshold: number
  unit?: string
  duration: number // segundos
  evaluation: {
    window: number // segundos
    frequency: number // segundos
    method: 'average' | 'sum' | 'min' | 'max' | 'count'
  }
  filters?: Array<{
    field: string
    operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'regex'
    value: string
  }>
  groupBy?: string[]
  having?: {
    field: string
    operator: AlertOperator
    value: number
  }
}

export interface AlertTrigger {
  type: 'threshold' | 'anomaly' | 'composite' | 'heartbeat' | 'change'
  config: {
    // Para threshold
    value?: number
    comparison?: 'above' | 'below' | 'equals'
    
    // Para anomaly
    sensitivity?: 'low' | 'medium' | 'high'
    seasonality?: 'auto' | 'hourly' | 'daily' | 'weekly'
    
    // Para composite
    expression?: string
    dependencies?: string[]
    
    // Para heartbeat
    interval?: number // segundos
    tolerance?: number // segundos
    
    // Para change
    percentage?: number
    absolute?: number
    direction?: 'increase' | 'decrease' | 'any'
  }
  lastEvaluation?: {
    timestamp: string
    value: number
    result: boolean
    duration: number // ms
  }
}

export interface AlertTarget {
  type: 'system' | 'service' | 'endpoint' | 'database' | 'server' | 'application'
  id?: string
  name: string
  environment?: string
  region?: string
  tags?: Record<string, string>
}

export interface AlertNotifications {
  channels: AlertChannel[]
  recipients: AlertRecipient[]
  template?: string
  throttling: {
    enabled: boolean
    interval: number // minutos
    maxPerInterval: number
  }
  quietHours: {
    enabled: boolean
    start: string // HH:mm
    end: string // HH:mm
    timezone: string
    exceptions: string[] // dias da semana
  }
  customization: {
    subject?: string
    message?: string
    variables?: Record<string, string>
  }
}

export interface AlertChannel {
  id: string
  type: AlertChannelType
  name: string
  enabled: boolean
  config: {
    // Email
    smtp?: {
      host: string
      port: number
      secure: boolean
      auth: {
        user: string
        pass: string
      }
    }
    
    // Slack
    slack?: {
      webhook: string
      channel: string
      username?: string
      iconEmoji?: string
    }
    
    // Discord
    discord?: {
      webhook: string
      username?: string
      avatar?: string
    }
    
    // Teams
    teams?: {
      webhook: string
    }
    
    // Telegram
    telegram?: {
      botToken: string
      chatId: string
    }
    
    // SMS
    sms?: {
      provider: 'twilio' | 'aws-sns' | 'nexmo'
      config: Record<string, any>
    }
    
    // Webhook
    webhook?: {
      url: string
      method: 'GET' | 'POST' | 'PUT'
      headers?: Record<string, string>
      body?: string
      timeout: number // segundos
      retries: number
    }
    
    // PagerDuty
    pagerduty?: {
      integrationKey: string
      severity?: 'info' | 'warning' | 'error' | 'critical'
    }
    
    // Opsgenie
    opsgenie?: {
      apiKey: string
      region: 'us' | 'eu'
      priority?: 'P1' | 'P2' | 'P3' | 'P4' | 'P5'
    }
  }
  filters?: Array<{
    field: string
    operator: string
    value: any
  }>
  formatting: {
    template?: string
    includeMetrics: boolean
    includeGraphs: boolean
    includeRunbook: boolean
  }
}

export interface AlertRecipient {
  id: string
  type: 'user' | 'team' | 'role' | 'external'
  name: string
  contact: {
    email?: string
    phone?: string
    slack?: string
    teams?: string
  }
  preferences: {
    channels: AlertChannelType[]
    severity: AlertSeverity[]
    quietHours: {
      enabled: boolean
      start?: string
      end?: string
      timezone?: string
    }
    escalation: {
      delay: number // minutos
      channels: AlertChannelType[]
    }
  }
  schedule?: {
    timezone: string
    shifts: Array<{
      day: string
      start: string
      end: string
    }>
    overrides: Array<{
      start: string
      end: string
      user: string
    }>
  }
  enabled: boolean
}

export interface AlertAction {
  id: string
  name: string
  type: AlertActionType
  trigger: 'immediate' | 'delayed' | 'escalation'
  delay?: number // segundos
  config: {
    // Webhook
    webhook?: {
      url: string
      method: 'GET' | 'POST' | 'PUT' | 'DELETE'
      headers?: Record<string, string>
      body?: string
      timeout: number
      retries: number
    }
    
    // Script
    script?: {
      command: string
      args?: string[]
      timeout: number
      workingDir?: string
      env?: Record<string, string>
    }
    
    // Service restart
    restart?: {
      service: string
      method: 'systemctl' | 'docker' | 'kubernetes' | 'custom'
      graceful: boolean
      timeout: number
    }
    
    // Auto-scaling
    scale?: {
      target: string
      direction: 'up' | 'down'
      amount: number
      max?: number
      min?: number
    }
    
    // Ticket creation
    ticket?: {
      system: 'jira' | 'servicenow' | 'zendesk' | 'github'
      project?: string
      assignee?: string
      priority?: string
      labels?: string[]
      template?: string
    }
    
    // Runbook
    runbook?: {
      url: string
      steps?: string[]
      automation?: boolean
    }
  }
  conditions?: Array<{
    field: string
    operator: string
    value: any
  }>
  enabled: boolean
}

export interface AlertEscalation {
  enabled: boolean
  levels: Array<{
    level: number
    delay: number // minutos
    recipients: string[]
    channels: AlertChannelType[]
    actions?: string[]
    condition?: {
      field: string
      operator: string
      value: any
    }
  }>
  maxLevel: number
  autoResolve: {
    enabled: boolean
    timeout: number // minutos
  }
  skipWeekends: boolean
  skipHolidays: boolean
}

export interface AlertSuppression {
  enabled: boolean
  rules: Array<{
    id: string
    name: string
    type: 'time' | 'condition' | 'dependency' | 'maintenance'
    config: {
      // Time-based
      schedule?: {
        start: string
        end: string
        timezone: string
        days?: string[]
        recurring?: boolean
      }
      
      // Condition-based
      condition?: {
        field: string
        operator: string
        value: any
      }
      
      // Dependency-based
      dependency?: {
        alert: string
        status: AlertStatus[]
      }
      
      // Maintenance window
      maintenance?: {
        window: string
        autoSuppress: boolean
      }
    }
    priority: number
    enabled: boolean
  }>
  flapping: {
    enabled: boolean
    threshold: number // número de mudanças
    window: number // minutos
    suppressDuration: number // minutos
  }
  similar: {
    enabled: boolean
    fields: string[]
    window: number // minutos
    maxAlerts: number
  }
}

export interface AlertMetrics {
  triggers: {
    total: number
    thisMonth: number
    thisWeek: number
    today: number
  }
  resolution: {
    averageTime: number // minutos
    medianTime: number // minutos
    sla: {
      target: number // minutos
      met: number // porcentagem
    }
  }
  escalations: {
    total: number
    byLevel: Record<number, number>
    avoided: number
  }
  falsePositives: {
    count: number
    rate: number // porcentagem
    lastReview: string
  }
  effectiveness: {
    score: number // 0-100
    factors: {
      accuracy: number
      timeliness: number
      actionability: number
    }
  }
  performance: {
    evaluationTime: number // ms
    notificationTime: number // ms
    actionTime: number // ms
  }
}

export interface AlertHistory {
  id: string
  timestamp: string
  type: AlertHistoryType
  status: AlertStatus
  value?: number
  message?: string
  user?: string
  details?: Record<string, any>
  duration?: number // ms para avaliações
  notifications?: Array<{
    channel: string
    recipient: string
    status: 'sent' | 'failed' | 'delivered'
    timestamp: string
    error?: string
  }>
  actions?: Array<{
    action: string
    status: 'success' | 'failed' | 'timeout'
    timestamp: string
    duration: number // ms
    result?: any
    error?: string
  }>
}

// Tipos auxiliares
export type SystemAlertType = 'metric' | 'log' | 'event' | 'synthetic' | 'composite'
export type AlertCategory = 'infrastructure' | 'application' | 'security' | 'business' | 'custom'
export type AlertSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical' | 'emergency'
export type AlertPriority = 'p1' | 'p2' | 'p3' | 'p4' | 'p5'
export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'suppressed' | 'expired'
export type AlertSource = 'system' | 'application' | 'external' | 'synthetic' | 'user'
export type AlertOperator = '>' | '<' | '>=' | '<=' | '==' | '!=' | 'contains' | 'not_contains'
export type AlertChannelType = 'email' | 'sms' | 'slack' | 'discord' | 'teams' | 'telegram' | 'webhook' | 'pagerduty' | 'opsgenie' | 'push'
export type AlertActionType = 'webhook' | 'script' | 'restart' | 'scale' | 'ticket' | 'runbook' | 'notification'
export type AlertHistoryType = 'triggered' | 'acknowledged' | 'resolved' | 'escalated' | 'suppressed' | 'expired' | 'evaluated'

// Interfaces para configuração de alertas
export interface AlertConfiguration {
  general: {
    enabled: boolean
    defaultSeverity: AlertSeverity
    defaultPriority: AlertPriority
    evaluationInterval: number // segundos
    retentionPeriod: number // dias
  }
  notifications: {
    defaultChannels: AlertChannelType[]
    throttling: {
      enabled: boolean
      window: number // minutos
      maxAlerts: number
    }
    batching: {
      enabled: boolean
      window: number // segundos
      maxSize: number
    }
    formatting: {
      includeMetrics: boolean
      includeGraphs: boolean
      includeContext: boolean
      timezone: string
    }
  }
  escalation: {
    enabled: boolean
    defaultLevels: number
    defaultDelay: number // minutos
    maxEscalations: number
  }
  suppression: {
    enabled: boolean
    flappingThreshold: number
    similarWindow: number // minutos
    maintenanceMode: boolean
  }
  actions: {
    enabled: boolean
    timeout: number // segundos
    retries: number
    parallel: boolean
  }
  metrics: {
    enabled: boolean
    retention: number // dias
    aggregation: 'hourly' | 'daily'
  }
}

// Interfaces para templates de alertas
export interface AlertTemplate {
  id: string
  name: string
  description?: string
  category: AlertCategory
  type: SystemAlertType
  severity: AlertSeverity
  condition: Omit<AlertCondition, 'metric'>
  notifications: Omit<AlertNotifications, 'recipients'>
  actions: Omit<AlertAction, 'id'>[]
  escalation: AlertEscalation
  tags: string[]
  variables: Array<{
    name: string
    type: 'string' | 'number' | 'boolean' | 'select'
    required: boolean
    default?: any
    options?: any[]
    description?: string
  }>
  usage: {
    count: number
    lastUsed?: string
  }
  createdBy: string
  createdAt: string
  updatedAt: string
}

// Interfaces para dashboards de alertas
export interface AlertDashboard {
  id: string
  name: string
  description?: string
  widgets: Array<{
    id: string
    type: 'summary' | 'timeline' | 'heatmap' | 'top-alerts' | 'escalations'
    position: {
      x: number
      y: number
      width: number
      height: number
    }
    config: {
      title: string
      timeRange: string
      filters?: Record<string, any>
      groupBy?: string
      limit?: number
    }
  }>
  filters: Array<{
    name: string
    type: 'select' | 'multiselect' | 'date' | 'text'
    field: string
    options?: any[]
    default?: any
  }>
  sharing: {
    public: boolean
    users: string[]
    roles: string[]
  }
  refreshInterval: number // segundos
  createdAt: string
  updatedAt: string
}

// Interfaces para relatórios de alertas
export interface AlertReport {
  id: string
  name: string
  type: 'summary' | 'detailed' | 'trend' | 'effectiveness'
  period: {
    start: string
    end: string
  }
  filters: {
    severity?: AlertSeverity[]
    category?: AlertCategory[]
    status?: AlertStatus[]
    tags?: string[]
  }
  data: {
    summary: {
      total: number
      byStatus: Record<AlertStatus, number>
      bySeverity: Record<AlertSeverity, number>
      byCategory: Record<AlertCategory, number>
    }
    metrics: {
      averageResolutionTime: number
      escalationRate: number
      falsePositiveRate: number
      effectiveness: number
    }
    trends: Array<{
      date: string
      count: number
      resolved: number
      escalated: number
    }>
    topAlerts: Array<{
      alert: string
      count: number
      averageResolution: number
    }>
    recommendations: string[]
  }
  format: 'json' | 'pdf' | 'csv' | 'html'
  schedule?: {
    enabled: boolean
    frequency: 'daily' | 'weekly' | 'monthly'
    recipients: string[]
  }
  createdAt: string
}

// Interfaces para integração com sistemas externos
export interface AlertIntegration {
  id: string
  name: string
  type: 'monitoring' | 'ticketing' | 'communication' | 'automation'
  provider: string
  config: {
    endpoint?: string
    apiKey?: string
    credentials?: Record<string, string>
    mapping?: Record<string, string>
    filters?: Array<{
      field: string
      operator: string
      value: any
    }>
  }
  sync: {
    enabled: boolean
    direction: 'inbound' | 'outbound' | 'bidirectional'
    frequency: number // segundos
    lastSync?: string
  }
  status: 'active' | 'inactive' | 'error'
  metrics: {
    totalSynced: number
    errors: number
    lastError?: string
  }
  createdAt: string
  updatedAt: string
}