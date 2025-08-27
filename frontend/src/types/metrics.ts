export interface SystemMetrics {
  id: string
  timestamp: string
  system: SystemResourceMetrics
  application: ApplicationMetrics
  database: DatabaseMetrics
  network: NetworkMetrics
  storage: StorageMetrics
  performance: PerformanceMetrics
  availability: AvailabilityMetrics
  security: SecurityMetrics
  business: BusinessMetrics
  custom: CustomMetrics
}

export interface SystemResourceMetrics {
  cpu: {
    usage: number // porcentagem
    cores: number
    loadAverage: {
      oneMinute: number
      fiveMinutes: number
      fifteenMinutes: number
    }
    processes: {
      total: number
      running: number
      sleeping: number
      zombie: number
    }
    temperature?: number // Celsius
    frequency?: number // MHz
  }
  memory: {
    total: number // bytes
    used: number // bytes
    free: number // bytes
    available: number // bytes
    cached: number // bytes
    buffers: number // bytes
    swap: {
      total: number
      used: number
      free: number
    }
    usage: number // porcentagem
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
    partitions: Array<{
      name: string
      mountPoint: string
      total: number
      used: number
      free: number
      usage: number
    }>
  }
  network: {
    interfaces: Array<{
      name: string
      bytesReceived: number
      bytesSent: number
      packetsReceived: number
      packetsSent: number
      errors: number
      drops: number
      speed: number // Mbps
      status: 'up' | 'down'
    }>
    totalBandwidth: {
      inbound: number // MB/s
      outbound: number // MB/s
    }
    connections: {
      active: number
      established: number
      timeWait: number
      listening: number
    }
  }
}

export interface ApplicationMetrics {
  uptime: number // segundos
  version: string
  environment: 'development' | 'staging' | 'production'
  processes: Array<{
    pid: number
    name: string
    cpu: number // porcentagem
    memory: number // bytes
    status: 'running' | 'stopped' | 'error'
    startTime: string
  }>
  threads: {
    total: number
    active: number
    idle: number
    blocked: number
  }
  heap: {
    used: number // bytes
    total: number // bytes
    max: number // bytes
    usage: number // porcentagem
  }
  gc: {
    collections: number
    totalTime: number // ms
    averageTime: number // ms
    lastCollection: string
  }
  cache: {
    hitRate: number // porcentagem
    missRate: number // porcentagem
    size: number // bytes
    entries: number
  }
  sessions: {
    active: number
    total: number
    peak: number
    averageDuration: number // segundos
  }
}

export interface DatabaseMetrics {
  connections: {
    active: number
    idle: number
    total: number
    max: number
    usage: number // porcentagem
  }
  queries: {
    total: number
    perSecond: number
    slow: number
    failed: number
    averageTime: number // ms
    longestTime: number // ms
  }
  transactions: {
    total: number
    perSecond: number
    committed: number
    rolledBack: number
    deadlocks: number
  }
  storage: {
    size: number // bytes
    growth: number // bytes per day
    tables: Array<{
      name: string
      size: number
      rows: number
      indexes: number
    }>
  }
  performance: {
    bufferHitRatio: number // porcentagem
    lockWaits: number
    indexUsage: number // porcentagem
    cacheHitRatio: number // porcentagem
  }
  replication: {
    enabled: boolean
    lag: number // segundos
    status: 'healthy' | 'warning' | 'error'
    slaves: Array<{
      id: string
      lag: number
      status: string
    }>
  }
}

export interface NetworkMetrics {
  latency: {
    internal: number // ms
    external: number // ms
    database: number // ms
    cache: number // ms
  }
  throughput: {
    requests: number // per second
    responses: number // per second
    bandwidth: number // MB/s
  }
  errors: {
    rate: number // per minute
    types: Record<string, number>
    recent: Array<{
      timestamp: string
      type: string
      message: string
    }>
  }
  security: {
    blockedIPs: number
    suspiciousActivity: number
    ddosAttempts: number
    rateLimitHits: number
  }
}

export interface StorageMetrics {
  files: {
    total: number
    size: number // bytes
    types: Record<string, number>
    recent: Array<{
      name: string
      size: number
      created: string
      type: string
    }>
  }
  uploads: {
    total: number
    successful: number
    failed: number
    averageSize: number // bytes
    throughput: number // MB/s
  }
  cdn: {
    hits: number
    misses: number
    hitRatio: number // porcentagem
    bandwidth: number // MB
    requests: number
  }
  backup: {
    lastBackup: string
    size: number // bytes
    duration: number // segundos
    status: 'success' | 'failed' | 'running'
  }
}

export interface PerformanceMetrics {
  responseTime: {
    average: number // ms
    p50: number // ms
    p95: number // ms
    p99: number // ms
    max: number // ms
  }
  throughput: {
    requestsPerSecond: number
    requestsPerMinute: number
    requestsPerHour: number
    peakRPS: number
  }
  errors: {
    rate: number // porcentagem
    count: number
    types: Record<string, number>
  }
  apdex: {
    score: number // 0-1
    satisfied: number
    tolerating: number
    frustrated: number
  }
  endpoints: Array<{
    path: string
    method: string
    requests: number
    averageTime: number
    errorRate: number
    p95Time: number
  }>
}

export interface AvailabilityMetrics {
  uptime: {
    percentage: number // porcentagem
    duration: number // segundos
    since: string
  }
  downtime: {
    total: number // segundos
    incidents: number
    mttr: number // mean time to recovery em minutos
    mtbf: number // mean time between failures em horas
  }
  sla: {
    target: number // porcentagem
    current: number // porcentagem
    monthly: number // porcentagem
    yearly: number // porcentagem
  }
  healthChecks: Array<{
    name: string
    status: 'healthy' | 'warning' | 'critical'
    responseTime: number // ms
    lastCheck: string
    uptime: number // porcentagem
  }>
}

export interface SecurityMetrics {
  authentication: {
    attempts: number
    successful: number
    failed: number
    blocked: number
    bruteForce: number
  }
  authorization: {
    accessDenied: number
    privilegeEscalation: number
    suspiciousActivity: number
  }
  vulnerabilities: {
    total: number
    critical: number
    high: number
    medium: number
    low: number
    patched: number
  }
  threats: {
    detected: number
    blocked: number
    malware: number
    phishing: number
    ddos: number
  }
  compliance: {
    score: number // porcentagem
    violations: number
    audits: number
    certifications: string[]
  }
}

export interface BusinessMetrics {
  users: {
    total: number
    active: number
    new: number
    returning: number
    churn: number // porcentagem
  }
  revenue: {
    total: number
    recurring: number
    oneTime: number
    growth: number // porcentagem
  }
  conversion: {
    rate: number // porcentagem
    funnel: Array<{
      stage: string
      users: number
      conversion: number
    }>
  }
  engagement: {
    sessionDuration: number // segundos
    pageViews: number
    bounceRate: number // porcentagem
    retention: {
      day1: number
      day7: number
      day30: number
    }
  }
}

export interface CustomMetrics {
  [key: string]: {
    value: number | string | boolean
    unit?: string
    description?: string
    tags?: Record<string, string>
    timestamp: string
  }
}

// Tipos para agregação de métricas
export interface MetricsAggregation {
  timeRange: {
    start: string
    end: string
    interval: 'minute' | 'hour' | 'day' | 'week' | 'month'
  }
  metrics: Array<{
    name: string
    aggregation: 'avg' | 'sum' | 'min' | 'max' | 'count'
    value: number
    unit?: string
  }>
  groupBy?: string[]
  filters?: Record<string, any>
}

// Tipos para alertas baseados em métricas
export interface MetricAlert {
  id: string
  name: string
  description?: string
  metric: string
  condition: {
    operator: '>' | '<' | '>=' | '<=' | '==' | '!='
    threshold: number
    duration: number // segundos
  }
  severity: 'low' | 'medium' | 'high' | 'critical'
  enabled: boolean
  notifications: {
    channels: string[]
    recipients: string[]
    template?: string
  }
  actions: Array<{
    type: 'webhook' | 'script' | 'restart' | 'scale'
    config: Record<string, any>
  }>
  history: Array<{
    timestamp: string
    triggered: boolean
    value: number
    resolved?: string
  }>
  createdAt: string
  updatedAt: string
}

// Tipos para dashboards de métricas
export interface MetricsDashboard {
  id: string
  name: string
  description?: string
  layout: {
    columns: number
    rows: number
  }
  widgets: Array<{
    id: string
    type: 'chart' | 'gauge' | 'counter' | 'table' | 'text'
    position: {
      x: number
      y: number
      width: number
      height: number
    }
    config: {
      title: string
      metric: string
      chartType?: 'line' | 'bar' | 'pie' | 'area'
      timeRange?: string
      refreshInterval?: number
      thresholds?: Array<{
        value: number
        color: string
        label?: string
      }>
    }
  }>
  filters: Array<{
    name: string
    type: 'select' | 'date' | 'text'
    options?: string[]
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

// Tipos para exportação de métricas
export interface MetricsExport {
  format: 'json' | 'csv' | 'xlsx' | 'pdf'
  timeRange: {
    start: string
    end: string
  }
  metrics: string[]
  filters?: Record<string, any>
  aggregation?: {
    interval: string
    functions: string[]
  }
  options: {
    includeHeaders: boolean
    includeMetadata: boolean
    compression?: 'gzip' | 'zip'
  }
}

// Tipos para configuração de coleta de métricas
export interface MetricsCollection {
  enabled: boolean
  interval: number // segundos
  retention: {
    raw: number // dias
    hourly: number // dias
    daily: number // dias
    monthly: number // dias
  }
  storage: {
    type: 'memory' | 'disk' | 'database' | 'timeseries'
    config: Record<string, any>
  }
  sampling: {
    enabled: boolean
    rate: number // porcentagem
    strategy: 'random' | 'systematic' | 'stratified'
  }
  compression: {
    enabled: boolean
    algorithm: 'gzip' | 'lz4' | 'snappy'
    level: number
  }
}

// Tipos auxiliares
export type MetricType = 
  | 'counter' 
  | 'gauge' 
  | 'histogram' 
  | 'summary' 
  | 'timer'

export type MetricUnit = 
  | 'bytes' 
  | 'seconds' 
  | 'milliseconds' 
  | 'percent' 
  | 'count' 
  | 'rate' 
  | 'ratio'

export type TimeInterval = 
  | '1m' 
  | '5m' 
  | '15m' 
  | '30m' 
  | '1h' 
  | '6h' 
  | '12h' 
  | '1d' 
  | '7d' 
  | '30d'

// Tipos para queries de métricas
export interface MetricsQuery {
  metric: string
  timeRange: {
    start: string
    end: string
  }
  interval?: string
  aggregation?: {
    function: 'avg' | 'sum' | 'min' | 'max' | 'count' | 'rate'
    groupBy?: string[]
  }
  filters?: Array<{
    field: string
    operator: string
    value: any
  }>
  limit?: number
  offset?: number
}

export interface MetricsQueryResult {
  metric: string
  data: Array<{
    timestamp: string
    value: number
    tags?: Record<string, string>
  }>
  metadata: {
    total: number
    interval: string
    aggregation?: string
    unit?: string
  }
}

// Tipos para comparação de métricas
export interface MetricsComparison {
  baseline: {
    timeRange: {
      start: string
      end: string
    }
    value: number
  }
  current: {
    timeRange: {
      start: string
      end: string
    }
    value: number
  }
  change: {
    absolute: number
    percentage: number
    trend: 'up' | 'down' | 'stable'
  }
  significance: {
    statistical: boolean
    practical: boolean
    confidence: number
  }
}

// Tipos para anomalias em métricas
export interface MetricAnomaly {
  id: string
  metric: string
  timestamp: string
  value: number
  expected: number
  deviation: number
  severity: 'low' | 'medium' | 'high'
  type: 'spike' | 'drop' | 'trend' | 'seasonal'
  confidence: number // 0-1
  context: {
    previousValues: number[]
    seasonalPattern?: number[]
    trendDirection?: 'up' | 'down' | 'stable'
  }
  resolved: boolean
  resolvedAt?: string
  notes?: string
}