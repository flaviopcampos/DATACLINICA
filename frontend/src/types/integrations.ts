export interface Integration {
  id: string
  name: string
  description?: string
  provider: IntegrationProvider
  type: IntegrationType
  category: IntegrationCategory
  status: IntegrationStatus
  config: IntegrationConfig
  credentials: IntegrationCredentials
  settings: IntegrationSettings
  metadata: IntegrationMetadata
  health: IntegrationHealth
  statistics: IntegrationStatistics
  createdAt: string
  updatedAt: string
  lastSyncAt?: string
}

export interface IntegrationProvider {
  id: string
  name: string
  displayName: string
  description: string
  logo?: string
  website?: string
  documentation?: string
  version: string
  supportedFeatures: string[]
  requiredCredentials: string[]
  optionalCredentials: string[]
  configSchema: Record<string, any>
  webhookSupport: boolean
  rateLimits?: {
    requests: number
    period: string // '1m', '1h', '1d'
  }
  regions?: string[]
}

export interface IntegrationConfig {
  endpoint?: string
  apiVersion?: string
  timeout: number // em segundos
  retries: {
    enabled: boolean
    maxAttempts: number
    backoffStrategy: 'linear' | 'exponential'
    initialDelay: number // em segundos
  }
  rateLimit: {
    enabled: boolean
    requests: number
    period: string
  }
  webhook?: {
    enabled: boolean
    url: string
    secret?: string
    events: string[]
  }
  sync: {
    enabled: boolean
    interval: number // em minutos
    batchSize: number
    direction: 'import' | 'export' | 'bidirectional'
  }
  mapping: {
    fields: Array<{
      source: string
      target: string
      transform?: string
      required: boolean
    }>
    filters: Array<{
      field: string
      operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than'
      value: any
    }>
  }
  customFields: Record<string, any>
}

export interface IntegrationCredentials {
  type: 'api_key' | 'oauth2' | 'basic_auth' | 'bearer_token' | 'custom'
  apiKey?: string
  clientId?: string
  clientSecret?: string
  accessToken?: string
  refreshToken?: string
  tokenExpiry?: string
  username?: string
  password?: string
  customFields?: Record<string, string>
  encrypted: boolean
}

export interface IntegrationSettings {
  enabled: boolean
  autoSync: boolean
  notifications: {
    onSuccess: boolean
    onError: boolean
    onWarning: boolean
    channels: string[]
  }
  logging: {
    enabled: boolean
    level: 'debug' | 'info' | 'warn' | 'error'
    retention: number // em dias
  }
  monitoring: {
    enabled: boolean
    healthCheck: {
      enabled: boolean
      interval: number // em minutos
      timeout: number // em segundos
    }
    alerts: {
      enabled: boolean
      thresholds: {
        errorRate: number // porcentagem
        responseTime: number // em ms
        uptime: number // porcentagem
      }
    }
  }
  security: {
    ipWhitelist: string[]
    allowedDomains: string[]
    requireHttps: boolean
    validateCertificates: boolean
  }
}

export interface IntegrationMetadata {
  createdBy: string
  updatedBy: string
  version: number
  tags: string[]
  environment: 'development' | 'staging' | 'production'
  region?: string
  notes?: string
  customData: Record<string, any>
}

export interface IntegrationHealth {
  status: 'healthy' | 'warning' | 'error' | 'unknown'
  lastCheck: string
  uptime: number // porcentagem
  responseTime: number // em ms
  errorRate: number // porcentagem
  issues: Array<{
    type: 'error' | 'warning' | 'info'
    message: string
    timestamp: string
    resolved: boolean
  }>
  metrics: {
    totalRequests: number
    successfulRequests: number
    failedRequests: number
    averageResponseTime: number
  }
}

export interface IntegrationStatistics {
  totalSyncs: number
  successfulSyncs: number
  failedSyncs: number
  lastSyncDuration: number // em segundos
  averageSyncDuration: number // em segundos
  recordsProcessed: {
    total: number
    created: number
    updated: number
    deleted: number
    errors: number
  }
  dataTransfer: {
    bytesIn: number
    bytesOut: number
    recordsIn: number
    recordsOut: number
  }
  timeline: Array<{
    date: string
    syncs: number
    records: number
    errors: number
    duration: number
  }>
}

export interface IntegrationLog {
  id: string
  integrationId: string
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  details?: Record<string, any>
  operation?: string
  duration?: number
  status?: 'success' | 'error' | 'warning'
  metadata: {
    requestId?: string
    userId?: string
    ip?: string
    userAgent?: string
  }
  timestamp: string
}

export interface IntegrationJob {
  id: string
  integrationId: string
  type: 'sync' | 'import' | 'export' | 'test' | 'health_check'
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  progress: {
    current: number
    total: number
    percentage: number
    stage: string
  }
  result?: {
    recordsProcessed: number
    recordsCreated: number
    recordsUpdated: number
    recordsDeleted: number
    errors: Array<{
      message: string
      record?: any
      timestamp: string
    }>
  }
  error?: string
  startedAt?: string
  completedAt?: string
  duration?: number // em segundos
  scheduledAt?: string
  createdAt: string
}

export interface IntegrationTemplate {
  id: string
  name: string
  description: string
  provider: string
  category: IntegrationCategory
  config: Partial<IntegrationConfig>
  settings: Partial<IntegrationSettings>
  requiredCredentials: string[]
  instructions: string
  examples: Array<{
    name: string
    description: string
    config: Record<string, any>
  }>
  tags: string[]
  popularity: number
  isOfficial: boolean
  createdAt: string
  updatedAt: string
}

export interface IntegrationWebhook {
  id: string
  integrationId: string
  url: string
  events: string[]
  secret?: string
  headers: Record<string, string>
  enabled: boolean
  retries: {
    enabled: boolean
    maxAttempts: number
    backoffStrategy: 'linear' | 'exponential'
  }
  filters: Array<{
    field: string
    operator: string
    value: any
  }>
  statistics: {
    totalDeliveries: number
    successfulDeliveries: number
    failedDeliveries: number
    lastDelivery?: string
    averageResponseTime: number
  }
  createdAt: string
  updatedAt: string
}

export interface IntegrationMapping {
  id: string
  integrationId: string
  name: string
  description?: string
  sourceSchema: Record<string, any>
  targetSchema: Record<string, any>
  fieldMappings: Array<{
    id: string
    sourcePath: string
    targetPath: string
    transform?: {
      type: 'format' | 'calculate' | 'lookup' | 'custom'
      config: Record<string, any>
    }
    required: boolean
    defaultValue?: any
  }>
  filters: Array<{
    field: string
    operator: string
    value: any
  }>
  validation: {
    enabled: boolean
    rules: Array<{
      field: string
      type: 'required' | 'format' | 'range' | 'custom'
      config: Record<string, any>
    }>
  }
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Tipos auxiliares
export type IntegrationType = 
  | 'api' 
  | 'database' 
  | 'file' 
  | 'webhook' 
  | 'messaging' 
  | 'storage' 
  | 'analytics' 
  | 'crm' 
  | 'erp' 
  | 'payment' 
  | 'email' 
  | 'social'

export type IntegrationCategory = 
  | 'healthcare' 
  | 'finance' 
  | 'marketing' 
  | 'sales' 
  | 'support' 
  | 'analytics' 
  | 'communication' 
  | 'storage' 
  | 'security' 
  | 'productivity' 
  | 'development' 
  | 'other'

export type IntegrationStatus = 
  | 'active' 
  | 'inactive' 
  | 'error' 
  | 'warning' 
  | 'syncing' 
  | 'testing' 
  | 'configuring'

export type SyncDirection = 
  | 'import' 
  | 'export' 
  | 'bidirectional'

export type JobStatus = 
  | 'pending' 
  | 'running' 
  | 'completed' 
  | 'failed' 
  | 'cancelled'

// Tipos para atualizações
export interface IntegrationUpdate {
  name?: string
  description?: string
  config?: Partial<IntegrationConfig>
  credentials?: Partial<IntegrationCredentials>
  settings?: Partial<IntegrationSettings>
  metadata?: Partial<IntegrationMetadata>
}

export interface IntegrationTest {
  type: 'connection' | 'authentication' | 'sync' | 'webhook'
  config?: Record<string, any>
}

export interface IntegrationTestResult {
  success: boolean
  message: string
  details?: Record<string, any>
  duration: number
  timestamp: string
}

// Tipos para sincronização
export interface SyncRequest {
  integrationId: string
  type: 'full' | 'incremental' | 'manual'
  direction?: SyncDirection
  filters?: Array<{
    field: string
    operator: string
    value: any
  }>
  options?: {
    batchSize?: number
    timeout?: number
    dryRun?: boolean
  }
}

export interface SyncResult {
  jobId: string
  status: JobStatus
  recordsProcessed: number
  recordsCreated: number
  recordsUpdated: number
  recordsDeleted: number
  errors: Array<{
    message: string
    record?: any
    timestamp: string
  }>
  duration: number
  startedAt: string
  completedAt?: string
}

// Tipos para exportação/importação
export interface IntegrationExport {
  integrations: Integration[]
  templates: IntegrationTemplate[]
  mappings: IntegrationMapping[]
  metadata: {
    exportedAt: string
    exportedBy: string
    version: string
  }
}

export interface IntegrationImport {
  integrations?: Integration[]
  templates?: IntegrationTemplate[]
  mappings?: IntegrationMapping[]
  overwrite: boolean
  validateOnly: boolean
}

// Tipos para métricas
export interface IntegrationMetrics {
  totalIntegrations: number
  activeIntegrations: number
  healthyIntegrations: number
  errorIntegrations: number
  totalSyncs: number
  successfulSyncs: number
  failedSyncs: number
  averageSyncDuration: number
  totalRecordsProcessed: number
  dataTransferVolume: number
  uptimePercentage: number
  errorRate: number
}

// Tipos para configuração de provedores
export interface ProviderConfig {
  id: string
  name: string
  displayName: string
  description: string
  logo?: string
  category: IntegrationCategory
  type: IntegrationType
  version: string
  status: 'active' | 'deprecated' | 'beta'
  features: string[]
  endpoints: Array<{
    name: string
    method: string
    path: string
    description: string
    parameters: Array<{
      name: string
      type: string
      required: boolean
      description: string
    }>
  }>
  authentication: {
    type: string
    fields: Array<{
      name: string
      type: string
      required: boolean
      description: string
      sensitive: boolean
    }>
  }
  configuration: {
    fields: Array<{
      name: string
      type: string
      required: boolean
      description: string
      defaultValue?: any
      options?: Array<{
        label: string
        value: any
      }>
    }>
  }
  documentation: {
    setup: string
    usage: string
    examples: Array<{
      title: string
      description: string
      code: string
    }>
    troubleshooting: Array<{
      issue: string
      solution: string
    }>
  }
}

// Tipos para eventos de integração
export interface IntegrationEvent {
  id: string
  integrationId: string
  type: string
  data: Record<string, any>
  source: string
  timestamp: string
  processed: boolean
  error?: string
}

// Tipos para alertas
export interface IntegrationAlert {
  id: string
  integrationId: string
  type: 'error' | 'warning' | 'info'
  title: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'active' | 'acknowledged' | 'resolved'
  metadata: Record<string, any>
  createdAt: string
  acknowledgedAt?: string
  resolvedAt?: string
}