export interface SystemLog {
  id: string
  timestamp: string
  level: LogLevel
  source: LogSource
  category: LogCategory
  message: string
  details?: Record<string, any>
  metadata: LogMetadata
  tags: string[]
  correlationId?: string
  traceId?: string
  spanId?: string
  userId?: string
  sessionId?: string
  requestId?: string
  ip?: string
  userAgent?: string
  duration?: number // ms
  status?: number
  error?: LogError
  context?: LogContext
}

export interface LogMetadata {
  hostname: string
  service: string
  version: string
  environment: 'development' | 'staging' | 'production'
  region?: string
  datacenter?: string
  instance?: string
  process: {
    pid: number
    name: string
    version: string
  }
  thread?: {
    id: number
    name: string
  }
  memory?: {
    used: number
    total: number
  }
  cpu?: {
    usage: number
  }
}

export interface LogError {
  name: string
  message: string
  stack?: string
  code?: string | number
  type: 'application' | 'system' | 'network' | 'database' | 'validation' | 'security'
  severity: 'low' | 'medium' | 'high' | 'critical'
  recoverable: boolean
  retryable: boolean
  cause?: LogError
  context?: Record<string, any>
}

export interface LogContext {
  request?: {
    method: string
    url: string
    headers: Record<string, string>
    query: Record<string, any>
    body?: any
    size: number
  }
  response?: {
    status: number
    headers: Record<string, string>
    body?: any
    size: number
  }
  database?: {
    query: string
    parameters: any[]
    duration: number
    rows: number
    connection: string
  }
  cache?: {
    key: string
    hit: boolean
    ttl: number
    size: number
  }
  external?: {
    service: string
    endpoint: string
    method: string
    duration: number
    status: number
  }
  business?: {
    action: string
    entity: string
    entityId: string
    result: 'success' | 'failure' | 'partial'
  }
}

// Tipos de nível de log
export type LogLevel = 
  | 'trace' 
  | 'debug' 
  | 'info' 
  | 'warn' 
  | 'error' 
  | 'fatal'

// Tipos de fonte de log
export type LogSource = 
  | 'application' 
  | 'system' 
  | 'database' 
  | 'cache' 
  | 'queue' 
  | 'scheduler' 
  | 'auth' 
  | 'api' 
  | 'web' 
  | 'worker' 
  | 'migration' 
  | 'backup' 
  | 'monitoring'

// Tipos de categoria de log
export type LogCategory = 
  | 'security' 
  | 'performance' 
  | 'business' 
  | 'technical' 
  | 'audit' 
  | 'compliance' 
  | 'debug' 
  | 'monitoring' 
  | 'integration' 
  | 'user-activity'

// Interface para filtros de log
export interface LogFilter {
  timeRange?: {
    start: string
    end: string
  }
  levels?: LogLevel[]
  sources?: LogSource[]
  categories?: LogCategory[]
  search?: {
    query: string
    fields: string[]
    caseSensitive: boolean
    regex: boolean
  }
  tags?: string[]
  userId?: string
  sessionId?: string
  correlationId?: string
  traceId?: string
  ip?: string
  status?: number[]
  hasError?: boolean
  duration?: {
    min?: number
    max?: number
  }
  custom?: Record<string, any>
}

// Interface para paginação de logs
export interface LogPagination {
  page: number
  limit: number
  total: number
  hasNext: boolean
  hasPrevious: boolean
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

// Interface para resultado de busca de logs
export interface LogSearchResult {
  logs: SystemLog[]
  pagination: LogPagination
  aggregations?: LogAggregations
  facets?: LogFacets
  suggestions?: string[]
  took: number // tempo de busca em ms
}

// Interface para agregações de logs
export interface LogAggregations {
  byLevel: Record<LogLevel, number>
  bySource: Record<LogSource, number>
  byCategory: Record<LogCategory, number>
  byHour: Array<{
    hour: string
    count: number
  }>
  byDay: Array<{
    day: string
    count: number
  }>
  byStatus: Record<number, number>
  byError: Array<{
    error: string
    count: number
  }>
  byUser: Array<{
    userId: string
    count: number
  }>
  topTags: Array<{
    tag: string
    count: number
  }>
}

// Interface para facetas de logs
export interface LogFacets {
  levels: Array<{
    value: LogLevel
    count: number
    selected: boolean
  }>
  sources: Array<{
    value: LogSource
    count: number
    selected: boolean
  }>
  categories: Array<{
    value: LogCategory
    count: number
    selected: boolean
  }>
  tags: Array<{
    value: string
    count: number
    selected: boolean
  }>
  statuses: Array<{
    value: number
    count: number
    selected: boolean
  }>
}

// Interface para configuração de logs
export interface LogConfiguration {
  collection: {
    enabled: boolean
    levels: LogLevel[]
    sources: LogSource[]
    categories: LogCategory[]
    sampling: {
      enabled: boolean
      rate: number // 0-1
      strategy: 'random' | 'systematic' | 'adaptive'
    }
    buffering: {
      enabled: boolean
      size: number // número de logs
      flushInterval: number // ms
    }
  }
  storage: {
    type: 'file' | 'database' | 'elasticsearch' | 'cloudwatch' | 'splunk'
    retention: {
      days: number
      maxSize: number // MB
      compression: boolean
    }
    rotation: {
      enabled: boolean
      size: number // MB
      interval: 'hourly' | 'daily' | 'weekly'
      maxFiles: number
    }
    indexing: {
      enabled: boolean
      fields: string[]
      fullText: boolean
    }
  }
  processing: {
    enrichment: {
      enabled: boolean
      geoip: boolean
      userAgent: boolean
      sessionInfo: boolean
    }
    parsing: {
      enabled: boolean
      patterns: Array<{
        name: string
        pattern: string
        fields: string[]
      }>
    }
    filtering: {
      enabled: boolean
      rules: Array<{
        name: string
        condition: string
        action: 'include' | 'exclude' | 'transform'
      }>
    }
  }
  alerting: {
    enabled: boolean
    rules: Array<{
      name: string
      condition: {
        level?: LogLevel
        source?: LogSource
        category?: LogCategory
        pattern?: string
        threshold?: {
          count: number
          window: number // minutos
        }
      }
      actions: Array<{
        type: 'email' | 'slack' | 'webhook' | 'sms'
        config: Record<string, any>
      }>
      enabled: boolean
    }>
  }
  privacy: {
    masking: {
      enabled: boolean
      fields: string[]
      pattern: string
    }
    anonymization: {
      enabled: boolean
      fields: string[]
      method: 'hash' | 'encrypt' | 'remove'
    }
    retention: {
      personalData: number // dias
      sensitiveData: number // dias
    }
  }
}

// Interface para estatísticas de logs
export interface LogStatistics {
  overview: {
    total: number
    today: number
    thisWeek: number
    thisMonth: number
    growth: {
      daily: number // porcentagem
      weekly: number // porcentagem
      monthly: number // porcentagem
    }
  }
  distribution: {
    byLevel: Record<LogLevel, number>
    bySource: Record<LogSource, number>
    byCategory: Record<LogCategory, number>
    byHour: Array<{
      hour: number
      count: number
    }>
  }
  errors: {
    total: number
    rate: number // por minuto
    topErrors: Array<{
      message: string
      count: number
      lastSeen: string
    }>
    bySource: Record<LogSource, number>
  }
  performance: {
    averageProcessingTime: number // ms
    throughput: number // logs por segundo
    storage: {
      size: number // bytes
      growth: number // bytes por dia
    }
    indexing: {
      speed: number // logs por segundo
      lag: number // segundos
    }
  }
  users: {
    active: number
    topUsers: Array<{
      userId: string
      count: number
      lastActivity: string
    }>
  }
}

// Interface para exportação de logs
export interface LogExport {
  format: 'json' | 'csv' | 'txt' | 'xml'
  filters: LogFilter
  options: {
    includeMetadata: boolean
    includeContext: boolean
    compression: boolean
    encryption: boolean
    maxRecords: number
  }
  delivery: {
    method: 'download' | 'email' | 's3' | 'ftp'
    config?: Record<string, any>
  }
}

// Interface para análise de logs
export interface LogAnalysis {
  patterns: Array<{
    pattern: string
    frequency: number
    examples: string[]
    significance: 'low' | 'medium' | 'high'
  }>
  anomalies: Array<{
    timestamp: string
    type: 'volume' | 'pattern' | 'error-rate' | 'performance'
    description: string
    severity: 'low' | 'medium' | 'high'
    confidence: number // 0-1
  }>
  trends: Array<{
    metric: string
    direction: 'increasing' | 'decreasing' | 'stable'
    rate: number
    significance: number // 0-1
  }>
  correlations: Array<{
    event1: string
    event2: string
    correlation: number // -1 to 1
    confidence: number // 0-1
  }>
  insights: Array<{
    type: 'performance' | 'security' | 'business' | 'technical'
    title: string
    description: string
    impact: 'low' | 'medium' | 'high'
    actionable: boolean
    recommendations: string[]
  }>
}

// Interface para streaming de logs
export interface LogStream {
  id: string
  name: string
  description?: string
  filters: LogFilter
  realTime: boolean
  bufferSize: number
  subscribers: number
  status: 'active' | 'paused' | 'stopped'
  createdAt: string
  lastActivity: string
}

// Interface para alertas de logs
export interface LogAlert {
  id: string
  name: string
  description?: string
  condition: {
    query: string
    threshold: {
      value: number
      operator: '>' | '<' | '>=' | '<=' | '==' | '!='
      window: number // minutos
    }
    frequency: number // minutos
  }
  severity: 'low' | 'medium' | 'high' | 'critical'
  enabled: boolean
  notifications: {
    channels: string[]
    recipients: string[]
    template?: string
    throttling: {
      enabled: boolean
      interval: number // minutos
    }
  }
  actions: Array<{
    type: 'webhook' | 'script' | 'ticket' | 'escalate'
    config: Record<string, any>
    delay?: number // segundos
  }>
  history: Array<{
    timestamp: string
    triggered: boolean
    value: number
    resolved?: string
    duration?: number // segundos
  }>
  metrics: {
    totalTriggers: number
    falsePositives: number
    averageResolutionTime: number // minutos
    lastTriggered?: string
  }
  createdAt: string
  updatedAt: string
}

// Interface para dashboard de logs
export interface LogDashboard {
  id: string
  name: string
  description?: string
  widgets: Array<{
    id: string
    type: 'chart' | 'table' | 'counter' | 'gauge' | 'heatmap'
    position: {
      x: number
      y: number
      width: number
      height: number
    }
    config: {
      title: string
      query: string
      visualization: {
        type: string
        options: Record<string, any>
      }
      timeRange: string
      refreshInterval: number // segundos
    }
  }>
  filters: Array<{
    name: string
    type: 'select' | 'date' | 'text' | 'range'
    options?: any[]
    default?: any
  }>
  sharing: {
    public: boolean
    users: string[]
    roles: string[]
  }
  createdAt: string
  updatedAt: string
}

// Interface para auditoria de logs
export interface LogAudit {
  id: string
  action: 'view' | 'search' | 'export' | 'delete' | 'modify'
  resource: {
    type: 'log' | 'dashboard' | 'alert' | 'configuration'
    id: string
    name?: string
  }
  user: {
    id: string
    name: string
    role: string
    ip: string
  }
  details: {
    query?: string
    filters?: LogFilter
    results?: number
    changes?: Record<string, any>
  }
  result: 'success' | 'failure' | 'partial'
  reason?: string
  timestamp: string
}

// Interface para métricas de logs
export interface LogMetrics {
  ingestion: {
    rate: number // logs por segundo
    volume: number // logs por dia
    size: number // bytes por segundo
    errors: number // erros por minuto
  }
  processing: {
    latency: {
      p50: number // ms
      p95: number // ms
      p99: number // ms
    }
    throughput: number // logs por segundo
    errors: number // erros por minuto
    backlog: number // logs pendentes
  }
  storage: {
    size: number // bytes
    growth: number // bytes por dia
    utilization: number // porcentagem
    retention: number // dias
  }
  queries: {
    total: number
    rate: number // queries por minuto
    averageTime: number // ms
    slowQueries: number
    errors: number
  }
  alerts: {
    active: number
    triggered: number // nas últimas 24h
    resolved: number // nas últimas 24h
    falsePositives: number // nas últimas 24h
  }
}