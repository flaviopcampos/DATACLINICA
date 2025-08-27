export interface SystemMonitoring {
  id: string
  name: string
  description?: string
  status: MonitoringStatus
  health: SystemHealth
  uptime: UptimeMetrics
  performance: PerformanceMonitoring
  resources: ResourceMonitoring
  services: ServiceMonitoring[]
  endpoints: EndpointMonitoring[]
  dependencies: DependencyMonitoring[]
  alerts: MonitoringAlert[]
  incidents: Incident[]
  maintenance: MaintenanceWindow[]
  sla: SLAMetrics
  configuration: MonitoringConfiguration
  createdAt: string
  updatedAt: string
}

export interface SystemHealth {
  overall: HealthStatus
  score: number // 0-100
  components: Array<{
    name: string
    status: HealthStatus
    score: number
    message?: string
    lastCheck: string
    responseTime?: number
    details?: Record<string, any>
  }>
  checks: HealthCheck[]
  history: Array<{
    timestamp: string
    status: HealthStatus
    score: number
    issues?: string[]
  }>
  trends: {
    hourly: number[]
    daily: number[]
    weekly: number[]
  }
}

export interface HealthCheck {
  id: string
  name: string
  type: HealthCheckType
  target: string
  interval: number // segundos
  timeout: number // segundos
  retries: number
  status: HealthStatus
  lastRun: string
  nextRun: string
  responseTime: number // ms
  message?: string
  configuration: {
    method?: string
    headers?: Record<string, string>
    body?: any
    expectedStatus?: number[]
    expectedContent?: string
    ssl?: {
      verify: boolean
      certificate?: string
    }
  }
  thresholds: {
    warning: number // ms
    critical: number // ms
  }
  enabled: boolean
  history: Array<{
    timestamp: string
    status: HealthStatus
    responseTime: number
    message?: string
  }>
}

export interface UptimeMetrics {
  current: {
    status: 'up' | 'down' | 'degraded'
    since: string
    duration: number // segundos
  }
  statistics: {
    today: number // porcentagem
    thisWeek: number // porcentagem
    thisMonth: number // porcentagem
    thisYear: number // porcentagem
    allTime: number // porcentagem
  }
  incidents: {
    total: number
    thisMonth: number
    averageDuration: number // minutos
    mttr: number // mean time to recovery em minutos
    mtbf: number // mean time between failures em horas
  }
  sla: {
    target: number // porcentagem
    current: number // porcentagem
    remaining: number // minutos de downtime permitido
  }
  timeline: Array<{
    date: string
    uptime: number // porcentagem
    incidents: number
    downtime: number // minutos
  }>
}

export interface PerformanceMonitoring {
  responseTime: {
    current: number // ms
    average: number // ms
    p50: number // ms
    p95: number // ms
    p99: number // ms
    trend: 'improving' | 'degrading' | 'stable'
  }
  throughput: {
    current: number // requests per second
    average: number
    peak: number
    trend: 'increasing' | 'decreasing' | 'stable'
  }
  errorRate: {
    current: number // porcentagem
    average: number
    threshold: number
    trend: 'improving' | 'degrading' | 'stable'
  }
  apdex: {
    score: number // 0-1
    target: number // ms
    tolerance: number // ms
    satisfied: number
    tolerating: number
    frustrated: number
  }
  transactions: Array<{
    name: string
    count: number
    averageTime: number
    errorRate: number
    apdex: number
  }>
}

export interface ResourceMonitoring {
  cpu: {
    usage: number // porcentagem
    cores: number
    loadAverage: number[]
    processes: number
    threads: number
    alerts: ResourceAlert[]
    history: TimeSeriesData[]
  }
  memory: {
    total: number // bytes
    used: number // bytes
    free: number // bytes
    cached: number // bytes
    swap: {
      total: number
      used: number
    }
    usage: number // porcentagem
    alerts: ResourceAlert[]
    history: TimeSeriesData[]
  }
  disk: {
    total: number // bytes
    used: number // bytes
    free: number // bytes
    usage: number // porcentagem
    iops: {
      read: number
      write: number
    }
    throughput: {
      read: number // MB/s
      write: number // MB/s
    }
    alerts: ResourceAlert[]
    history: TimeSeriesData[]
  }
  network: {
    bandwidth: {
      inbound: number // MB/s
      outbound: number // MB/s
    }
    packets: {
      received: number
      sent: number
      errors: number
      dropped: number
    }
    connections: {
      active: number
      established: number
      timeWait: number
    }
    alerts: ResourceAlert[]
    history: TimeSeriesData[]
  }
}

export interface ServiceMonitoring {
  id: string
  name: string
  type: ServiceType
  status: ServiceStatus
  health: HealthStatus
  version: string
  uptime: number // segundos
  metrics: {
    requests: {
      total: number
      rate: number // per second
      errors: number
      errorRate: number // porcentagem
    }
    performance: {
      responseTime: number // ms
      throughput: number // requests per second
      cpu: number // porcentagem
      memory: number // bytes
    }
    availability: {
      uptime: number // porcentagem
      incidents: number
      lastIncident?: string
    }
  }
  dependencies: string[]
  configuration: Record<string, any>
  alerts: ServiceAlert[]
  logs: {
    level: string
    count: number
    errors: number
    warnings: number
  }
  lastCheck: string
}

export interface EndpointMonitoring {
  id: string
  name: string
  url: string
  method: string
  status: EndpointStatus
  health: HealthStatus
  responseTime: {
    current: number // ms
    average: number // ms
    p95: number // ms
    p99: number // ms
  }
  availability: {
    uptime: number // porcentagem
    checks: number
    failures: number
  }
  performance: {
    throughput: number // requests per minute
    errorRate: number // porcentagem
    slowRequests: number // > threshold
  }
  ssl: {
    enabled: boolean
    valid: boolean
    expiresAt?: string
    daysUntilExpiry?: number
    issuer?: string
  }
  checks: Array<{
    timestamp: string
    status: number
    responseTime: number
    size: number
    error?: string
  }>
  alerts: EndpointAlert[]
  configuration: {
    interval: number // segundos
    timeout: number // segundos
    retries: number
    expectedStatus: number[]
    expectedContent?: string
    headers?: Record<string, string>
  }
}

export interface DependencyMonitoring {
  id: string
  name: string
  type: DependencyType
  status: DependencyStatus
  health: HealthStatus
  critical: boolean
  connection: {
    host: string
    port?: number
    protocol: string
    timeout: number // ms
  }
  metrics: {
    responseTime: number // ms
    availability: number // porcentagem
    errorRate: number // porcentagem
    throughput: number
  }
  checks: Array<{
    timestamp: string
    status: HealthStatus
    responseTime: number
    error?: string
  }>
  alerts: DependencyAlert[]
  configuration: {
    interval: number // segundos
    timeout: number // segundos
    retries: number
    healthEndpoint?: string
  }
  lastCheck: string
}

export interface MonitoringAlert {
  id: string
  name: string
  type: AlertType
  severity: AlertSeverity
  status: AlertStatus
  condition: {
    metric: string
    operator: '>' | '<' | '>=' | '<=' | '==' | '!='
    threshold: number
    duration: number // segundos
  }
  target: {
    type: 'system' | 'service' | 'endpoint' | 'dependency'
    id?: string
    name: string
  }
  notifications: {
    channels: string[]
    recipients: string[]
    template?: string
    escalation: Array<{
      level: number
      delay: number // minutos
      channels: string[]
      recipients: string[]
    }>
  }
  actions: Array<{
    type: 'webhook' | 'script' | 'restart' | 'scale' | 'ticket'
    config: Record<string, any>
    delay?: number // segundos
  }>
  history: Array<{
    timestamp: string
    status: AlertStatus
    value: number
    message?: string
    acknowledgedBy?: string
    resolvedBy?: string
  }>
  metrics: {
    totalTriggers: number
    falsePositives: number
    averageResolutionTime: number // minutos
    lastTriggered?: string
  }
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export interface Incident {
  id: string
  title: string
  description: string
  severity: IncidentSeverity
  status: IncidentStatus
  impact: IncidentImpact
  priority: IncidentPriority
  category: IncidentCategory
  affected: {
    services: string[]
    endpoints: string[]
    users: number
    regions: string[]
  }
  timeline: Array<{
    timestamp: string
    type: 'created' | 'investigating' | 'identified' | 'monitoring' | 'resolved'
    message: string
    author: string
    public: boolean
  }>
  metrics: {
    detectionTime: number // minutos
    responseTime: number // minutos
    resolutionTime: number // minutos
    mttr: number // minutos
  }
  rootCause: {
    identified: boolean
    category?: string
    description?: string
    preventable: boolean
  }
  postmortem: {
    required: boolean
    completed: boolean
    url?: string
    actionItems: Array<{
      description: string
      assignee: string
      dueDate: string
      status: 'open' | 'in-progress' | 'completed'
    }>
  }
  communication: {
    statusPage: boolean
    notifications: boolean
    channels: string[]
    updates: number
  }
  assignee: string
  team: string
  tags: string[]
  createdAt: string
  resolvedAt?: string
  updatedAt: string
}

export interface MaintenanceWindow {
  id: string
  title: string
  description: string
  type: MaintenanceType
  status: MaintenanceStatus
  impact: MaintenanceImpact
  scheduled: {
    start: string
    end: string
    duration: number // minutos
    timezone: string
  }
  affected: {
    services: string[]
    endpoints: string[]
    regions: string[]
    estimatedUsers: number
  }
  notifications: {
    advance: number[] // dias antes
    channels: string[]
    recipients: string[]
    sent: Array<{
      timestamp: string
      channel: string
      recipients: number
    }>
  }
  checklist: Array<{
    id: string
    task: string
    assignee: string
    status: 'pending' | 'in-progress' | 'completed' | 'skipped'
    completedAt?: string
  }>
  rollback: {
    plan: string
    triggers: string[]
    automated: boolean
  }
  communication: {
    statusPage: boolean
    publicUpdates: boolean
    internalUpdates: boolean
  }
  createdBy: string
  approvedBy?: string
  createdAt: string
  updatedAt: string
}

export interface SLAMetrics {
  targets: Array<{
    name: string
    metric: 'availability' | 'response-time' | 'error-rate' | 'throughput'
    target: number
    current: number
    period: 'monthly' | 'quarterly' | 'yearly'
    status: 'met' | 'at-risk' | 'breached'
  }>
  availability: {
    target: number // porcentagem
    current: number // porcentagem
    monthly: number // porcentagem
    quarterly: number // porcentagem
    yearly: number // porcentagem
    budget: {
      total: number // minutos por mês
      used: number // minutos
      remaining: number // minutos
    }
  }
  performance: {
    responseTime: {
      target: number // ms
      current: number // ms
      p95: number // ms
      p99: number // ms
    }
    throughput: {
      target: number // requests per second
      current: number
      peak: number
    }
  }
  reliability: {
    errorRate: {
      target: number // porcentagem
      current: number
      monthly: number
    }
    mtbf: number // horas
    mttr: number // minutos
  }
  compliance: {
    score: number // porcentagem
    violations: number
    lastAudit: string
    nextAudit: string
  }
}

export interface MonitoringConfiguration {
  general: {
    enabled: boolean
    interval: number // segundos
    timeout: number // segundos
    retries: number
    regions: string[]
  }
  collection: {
    metrics: {
      enabled: boolean
      interval: number // segundos
      retention: number // dias
      aggregation: 'avg' | 'sum' | 'min' | 'max'
    }
    logs: {
      enabled: boolean
      level: string
      retention: number // dias
      sampling: number // porcentagem
    }
    traces: {
      enabled: boolean
      sampling: number // porcentagem
      retention: number // dias
    }
  }
  alerting: {
    enabled: boolean
    channels: Array<{
      type: string
      config: Record<string, any>
      enabled: boolean
    }>
    escalation: {
      enabled: boolean
      levels: number
      delay: number // minutos
    }
    suppression: {
      enabled: boolean
      duration: number // minutos
      similar: boolean
    }
  }
  notifications: {
    statusPage: {
      enabled: boolean
      url?: string
      incidents: boolean
      maintenance: boolean
    }
    email: {
      enabled: boolean
      templates: Record<string, string>
    }
    slack: {
      enabled: boolean
      webhook?: string
      channels: string[]
    }
    webhook: {
      enabled: boolean
      urls: string[]
      retries: number
    }
  }
  thresholds: {
    cpu: {
      warning: number // porcentagem
      critical: number // porcentagem
    }
    memory: {
      warning: number // porcentagem
      critical: number // porcentagem
    }
    disk: {
      warning: number // porcentagem
      critical: number // porcentagem
    }
    responseTime: {
      warning: number // ms
      critical: number // ms
    }
    errorRate: {
      warning: number // porcentagem
      critical: number // porcentagem
    }
  }
}

// Tipos auxiliares
export type MonitoringStatus = 'active' | 'paused' | 'disabled' | 'error'
export type HealthStatus = 'healthy' | 'warning' | 'critical' | 'unknown'
export type HealthCheckType = 'http' | 'tcp' | 'ping' | 'dns' | 'ssl' | 'database' | 'custom'
export type ServiceType = 'web' | 'api' | 'database' | 'cache' | 'queue' | 'worker' | 'scheduler'
export type ServiceStatus = 'running' | 'stopped' | 'starting' | 'stopping' | 'error'
export type EndpointStatus = 'up' | 'down' | 'degraded' | 'maintenance'
export type DependencyType = 'database' | 'cache' | 'api' | 'service' | 'storage' | 'queue'
export type DependencyStatus = 'connected' | 'disconnected' | 'degraded' | 'timeout'
export type AlertType = 'threshold' | 'anomaly' | 'composite' | 'heartbeat'
export type AlertSeverity = 'info' | 'warning' | 'critical' | 'emergency'
export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'suppressed'
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical'
export type IncidentStatus = 'investigating' | 'identified' | 'monitoring' | 'resolved'
export type IncidentImpact = 'none' | 'minor' | 'major' | 'critical'
export type IncidentPriority = 'low' | 'medium' | 'high' | 'urgent'
export type IncidentCategory = 'performance' | 'availability' | 'security' | 'data' | 'infrastructure'
export type MaintenanceType = 'planned' | 'emergency' | 'routine'
export type MaintenanceStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
export type MaintenanceImpact = 'none' | 'partial' | 'full'

// Interfaces auxiliares
export interface TimeSeriesData {
  timestamp: string
  value: number
  tags?: Record<string, string>
}

export interface ResourceAlert {
  type: 'warning' | 'critical'
  threshold: number
  current: number
  triggered: boolean
  since?: string
}

export interface ServiceAlert {
  id: string
  type: string
  severity: AlertSeverity
  message: string
  triggered: boolean
  since?: string
}

export interface EndpointAlert {
  id: string
  type: 'response-time' | 'availability' | 'ssl' | 'content'
  severity: AlertSeverity
  message: string
  triggered: boolean
  since?: string
}

export interface DependencyAlert {
  id: string
  type: 'connection' | 'response-time' | 'availability'
  severity: AlertSeverity
  message: string
  triggered: boolean
  since?: string
}

// Interfaces para dashboards de monitoramento
export interface MonitoringDashboard {
  id: string
  name: string
  description?: string
  type: 'overview' | 'service' | 'infrastructure' | 'business'
  widgets: Array<{
    id: string
    type: 'chart' | 'gauge' | 'counter' | 'status' | 'table' | 'map'
    position: {
      x: number
      y: number
      width: number
      height: number
    }
    config: {
      title: string
      metric?: string
      query?: string
      visualization: Record<string, any>
      thresholds?: Array<{
        value: number
        color: string
        label?: string
      }>
      refreshInterval: number // segundos
    }
  }>
  filters: Array<{
    name: string
    type: 'select' | 'date' | 'text'
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

// Interfaces para relatórios de monitoramento
export interface MonitoringReport {
  id: string
  name: string
  type: 'availability' | 'performance' | 'sla' | 'incident' | 'custom'
  period: {
    start: string
    end: string
    interval: 'hourly' | 'daily' | 'weekly' | 'monthly'
  }
  data: {
    summary: Record<string, any>
    metrics: Array<{
      name: string
      value: number
      unit: string
      trend: 'up' | 'down' | 'stable'
    }>
    charts: Array<{
      title: string
      type: string
      data: any[]
    }>
    incidents: Incident[]
    recommendations: string[]
  }
  format: 'json' | 'pdf' | 'html' | 'csv'
  schedule?: {
    enabled: boolean
    frequency: 'daily' | 'weekly' | 'monthly'
    recipients: string[]
  }
  createdAt: string
}