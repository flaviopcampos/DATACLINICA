export interface BackupSettings {
  id: string
  userId?: string
  general: GeneralBackupSettings
  storage: StorageSettings
  schedule: ScheduleSettings
  retention: RetentionSettings
  encryption: BackupEncryptionSettings
  compression: CompressionSettings
  notification: BackupNotificationSettings
  monitoring: BackupMonitoringSettings
  recovery: RecoverySettings
  createdAt: string
  updatedAt: string
}

export interface GeneralBackupSettings {
  enabled: boolean
  autoBackup: boolean
  backupTypes: BackupType[]
  priority: 'low' | 'normal' | 'high'
  maxConcurrentJobs: number
  timeout: number // em minutos
  retryPolicy: {
    enabled: boolean
    maxRetries: number
    backoffStrategy: 'linear' | 'exponential'
    initialDelay: number // em segundos
  }
  verification: {
    enabled: boolean
    method: 'checksum' | 'restore-test' | 'both'
    percentage: number // porcentagem de backups para verificar
  }
  metadata: {
    includeSystemInfo: boolean
    includeUserInfo: boolean
    includeTimestamp: boolean
    customFields: Record<string, string>
  }
}

export interface StorageSettings {
  primary: StorageProvider
  secondary?: StorageProvider
  replication: {
    enabled: boolean
    strategy: 'sync' | 'async'
    providers: StorageProvider[]
  }
  lifecycle: {
    enabled: boolean
    rules: Array<{
      name: string
      condition: {
        age: number // em dias
        size?: number // em MB
        accessFrequency?: 'never' | 'rare' | 'frequent'
      }
      action: 'archive' | 'delete' | 'move'
      target?: string
    }>
  }
}

export interface StorageProvider {
  type: 'local' | 's3' | 'azure' | 'gcp' | 'ftp' | 'sftp' | 'dropbox' | 'gdrive'
  name: string
  config: {
    // Local
    path?: string
    
    // S3
    bucket?: string
    region?: string
    accessKeyId?: string
    secretAccessKey?: string
    endpoint?: string
    
    // Azure
    accountName?: string
    accountKey?: string
    containerName?: string
    
    // GCP
    projectId?: string
    keyFilename?: string
    bucketName?: string
    
    // FTP/SFTP
    host?: string
    port?: number
    username?: string
    password?: string
    privateKey?: string
    
    // Cloud Storage
    clientId?: string
    clientSecret?: string
    refreshToken?: string
    
    // Common
    prefix?: string
    maxConnections?: number
    timeout?: number
    ssl?: boolean
  }
  enabled: boolean
  testConnection: boolean
  lastTested?: string
  status: 'connected' | 'disconnected' | 'error' | 'testing'
  error?: string
}

export interface ScheduleSettings {
  enabled: boolean
  schedules: Array<{
    id: string
    name: string
    description?: string
    type: BackupType
    frequency: 'manual' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'custom'
    cronExpression?: string
    timezone: string
    enabled: boolean
    nextRun?: string
    lastRun?: string
    options: {
      includeData: boolean
      includeFiles: boolean
      includeConfig: boolean
      includeLogs: boolean
      customPaths?: string[]
    }
  }>
  maintenanceWindow: {
    enabled: boolean
    start: string // HH:mm
    end: string // HH:mm
    timezone: string
    days: number[] // 0-6 (domingo-sábado)
  }
  conflicts: {
    resolution: 'queue' | 'skip' | 'cancel'
    maxQueue: number
  }
}

export interface RetentionSettings {
  enabled: boolean
  policies: Array<{
    id: string
    name: string
    description?: string
    backupType: BackupType
    rules: {
      daily: {
        keep: number // número de backups diários para manter
        after: number // após quantos dias
      }
      weekly: {
        keep: number
        after: number
      }
      monthly: {
        keep: number
        after: number
      }
      yearly: {
        keep: number
        after: number
      }
    }
    maxSize: {
      enabled: boolean
      limit: number // em GB
      action: 'delete-oldest' | 'compress' | 'archive'
    }
    enabled: boolean
  }>
  cleanup: {
    automatic: boolean
    schedule: string // cron expression
    dryRun: boolean
    notifications: boolean
  }
}

export interface BackupEncryptionSettings {
  enabled: boolean
  algorithm: 'AES-256' | 'AES-128' | 'ChaCha20'
  keyDerivation: 'PBKDF2' | 'Argon2' | 'scrypt'
  keyManagement: {
    type: 'password' | 'keyfile' | 'kms' | 'vault'
    password?: string
    keyfile?: string
    kmsConfig?: Record<string, any>
    vaultConfig?: Record<string, any>
  }
  compression: {
    beforeEncryption: boolean
    algorithm: 'gzip' | 'bzip2' | 'lz4' | 'zstd'
  }
  verification: {
    enabled: boolean
    method: 'hmac' | 'signature'
  }
}

export interface CompressionSettings {
  enabled: boolean
  algorithm: 'gzip' | 'bzip2' | 'lz4' | 'zstd' | 'xz'
  level: number // 1-9
  blockSize: number // em KB
  threads: number
  excludePatterns: string[]
  includePatterns: string[]
  estimatedRatio: number // porcentagem estimada de compressão
}

export interface BackupNotificationSettings {
  enabled: boolean
  events: {
    started: boolean
    completed: boolean
    failed: boolean
    warning: boolean
    verified: boolean
  }
  channels: ('email' | 'sms' | 'slack' | 'webhook')[]
  recipients: string[]
  templates: {
    success: string
    failure: string
    warning: string
  }
  throttling: {
    enabled: boolean
    maxPerHour: number
    groupSimilar: boolean
  }
}

export interface BackupMonitoringSettings {
  enabled: boolean
  healthChecks: {
    enabled: boolean
    interval: number // em minutos
    timeout: number // em segundos
    alerts: {
      missedBackups: boolean
      failureRate: boolean
      storageSpace: boolean
      performance: boolean
    }
  }
  metrics: {
    collection: boolean
    retention: number // em dias
    aggregation: 'hourly' | 'daily' | 'weekly'
  }
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error'
    retention: number // em dias
    maxSize: number // em MB
  }
}

export interface RecoverySettings {
  testRestore: {
    enabled: boolean
    frequency: 'weekly' | 'monthly' | 'quarterly'
    percentage: number // porcentagem de backups para testar
    automated: boolean
  }
  pointInTime: {
    enabled: boolean
    granularity: 'minute' | 'hour' | 'day'
    retention: number // em dias
  }
  verification: {
    integrity: boolean
    completeness: boolean
    performance: boolean
  }
  documentation: {
    procedures: boolean
    contacts: string[]
    escalation: Array<{
      level: number
      contacts: string[]
      timeframe: number // em minutos
    }>
  }
}

// Tipos para jobs de backup
export interface BackupJob {
  id: string
  name: string
  type: BackupType
  status: BackupJobStatus
  progress: {
    current: number
    total: number
    percentage: number
    stage: string
    speed?: number // MB/s
    eta?: number // segundos restantes
  }
  statistics: {
    filesProcessed: number
    filesTotal: number
    bytesProcessed: number
    bytesTotal: number
    compressionRatio?: number
    duration?: number // em segundos
  }
  result?: BackupResult
  error?: string
  warnings: string[]
  logs: BackupLog[]
  scheduledAt?: string
  startedAt?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface BackupResult {
  success: boolean
  backupId: string
  size: {
    original: number // em bytes
    compressed: number // em bytes
    ratio: number // porcentagem
  }
  files: {
    total: number
    processed: number
    skipped: number
    errors: number
  }
  duration: number // em segundos
  throughput: number // MB/s
  verification: {
    performed: boolean
    success: boolean
    method: string
    checksum?: string
  }
  storage: {
    provider: string
    location: string
    redundancy: number
  }
}

export interface BackupLog {
  id: string
  jobId: string
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  details?: Record<string, any>
  timestamp: string
}

// Tipos para histórico de backups
export interface BackupHistory {
  id: string
  name: string
  type: BackupType
  status: 'completed' | 'failed' | 'partial'
  size: {
    original: number
    compressed: number
    ratio: number
  }
  duration: number
  files: {
    total: number
    processed: number
    errors: number
  }
  storage: {
    provider: string
    location: string
    available: boolean
  }
  verification: {
    performed: boolean
    success: boolean
    lastChecked?: string
  }
  metadata: {
    version: string
    tags: string[]
    description?: string
    retention?: string
  }
  createdAt: string
  expiresAt?: string
}

// Tipos para estatísticas
export interface BackupStatistics {
  overview: {
    totalBackups: number
    successfulBackups: number
    failedBackups: number
    totalSize: number // em bytes
    averageSize: number // em bytes
    compressionRatio: number // porcentagem média
  }
  performance: {
    averageDuration: number // em segundos
    averageThroughput: number // MB/s
    fastestBackup: number // em segundos
    slowestBackup: number // em segundos
  }
  storage: {
    totalUsed: number // em bytes
    byProvider: Record<string, number>
    growth: Array<{
      date: string
      size: number
    }>
  }
  reliability: {
    successRate: number // porcentagem
    mtbf: number // mean time between failures em horas
    mttr: number // mean time to recovery em horas
    availability: number // porcentagem
  }
  timeline: Array<{
    date: string
    backups: number
    size: number
    duration: number
    failures: number
  }>
}

// Tipos para restauração
export interface RestoreRequest {
  backupId: string
  type: 'full' | 'partial' | 'files'
  target: {
    location: string
    overwrite: boolean
    preservePermissions: boolean
  }
  filters?: {
    paths: string[]
    dateRange?: {
      start: string
      end: string
    }
    fileTypes?: string[]
  }
  options: {
    verify: boolean
    dryRun: boolean
    notifications: boolean
  }
}

export interface CreateRestoreRequest {
  backupId: string
  scope?: RestoreScope
  options?: {
    overwrite?: boolean
    verify?: boolean
    dryRun?: boolean
    notifications?: boolean
  }
}

export interface RestoreScope {
  modules?: string[]
  tables?: string[]
  dateRange?: {
    start: string
    end: string
  }
  filters?: {
    includeData?: boolean
    includeFiles?: boolean
    includeConfig?: boolean
    includeLogs?: boolean
  }
}

export interface RestoreProgress {
  jobId: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  percentage: number
  currentStep: string
  totalSteps: number
  processedItems: number
  totalItems: number
  bytesProcessed: number
  totalBytes: number
  estimatedTimeRemaining?: number
  error?: string
  warnings: string[]
  details: {
    stage: string
    currentFile?: string
    speed?: number // MB/s
    startedAt: string
    lastUpdate: string
  }
}

export interface RestorePreviewResponse {
  backupId: string
  scope: RestoreScope
  estimatedSize: number
  estimatedDuration: number
  conflictingData?: Array<{
    table: string
    records: number
    action: 'overwrite' | 'merge' | 'skip'
  }>
  missingDependencies?: string[]
  warnings: string[]
  summary: {
    tablesAffected: number
    recordsAffected: number
    filesAffected: number
    totalSize: number
  }
}

export interface RestoreJob {
  id: string
  backupId: string
  backup_id?: string // Alias para compatibilidade
  type: 'full' | 'partial' | 'files'
  status: RestoreStatus
  progress?: {
    current: number
    total: number
    percentage: number
    stage: string
    estimated_time_remaining?: number
    current_file?: string
  }
  metadata?: {
    scope?: RestoreScope
    options?: Record<string, any>
    startedBy?: string
  }
  data?: {
    processedItems: number
    totalItems: number
    bytesProcessed: number
    totalBytes: number
  }
  // Propriedades de configuração
  target_path?: string
  selected_modules?: string[]
  overwrite_existing?: boolean
  validate_integrity?: boolean
  create_backup_before_restore?: boolean
  notify_on_completion?: boolean
  
  // Estados e erros
  isLoading?: boolean
  error?: string
  error_message?: string // Alias para compatibilidade
  
  result?: {
    success: boolean
    filesRestored: number
    filesTotal: number
    bytesRestored: number
    duration: number
    errors: string[]
  }
  startedAt?: string
  completedAt?: string
  createdAt: string
}

// Tipos auxiliares
export type BackupType = 
  | 'full' 
  | 'incremental' 
  | 'differential' 
  | 'snapshot' 
  | 'continuous'

export type BackupJobStatus = 
  | 'pending' 
  | 'running' 
  | 'completed' 
  | 'failed' 
  | 'cancelled' 
  | 'paused'

export type RestoreStatus = 
  | 'pending' 
  | 'running' 
  | 'in_progress'
  | 'completed' 
  | 'failed' 
  | 'cancelled' 
  | 'paused'

export type StorageType = 
  | 'local' 
  | 's3' 
  | 'azure' 
  | 'gcp' 
  | 'ftp' 
  | 'sftp' 
  | 'dropbox' 
  | 'gdrive'

// Tipos para atualizações
export interface BackupSettingsUpdate {
  general?: Partial<GeneralBackupSettings>
  storage?: Partial<StorageSettings>
  schedule?: Partial<ScheduleSettings>
  retention?: Partial<RetentionSettings>
  encryption?: Partial<BackupEncryptionSettings>
  compression?: Partial<CompressionSettings>
  notification?: Partial<BackupNotificationSettings>
  monitoring?: Partial<BackupMonitoringSettings>
  recovery?: Partial<RecoverySettings>
}

// Tipos para teste de conexão
export interface ConnectionTest {
  provider: StorageType
  config: Record<string, any>
  timeout?: number
}

export interface ConnectionTestResult {
  success: boolean
  message: string
  details?: {
    latency: number // em ms
    throughput?: number // MB/s
    availableSpace?: number // em bytes
    permissions: string[]
  }
  error?: string
  timestamp: string
}

// Tipos para verificação de integridade
export interface IntegrityCheck {
  backupId: string
  method: 'checksum' | 'restore-test' | 'metadata'
  options?: {
    sampleSize?: number // porcentagem
    deepScan?: boolean
  }
}

export interface IntegrityResult {
  success: boolean
  method: string
  details: {
    filesChecked: number
    filesTotal: number
    errors: Array<{
      file: string
      error: string
      severity: 'low' | 'medium' | 'high'
    }>
    warnings: string[]
  }
  duration: number
  timestamp: string
}

// Tipos para exportação/importação
export interface BackupExport {
  settings: BackupSettings
  schedules: ScheduleSettings['schedules']
  policies: RetentionSettings['policies']
  metadata: {
    exportedAt: string
    exportedBy: string
    version: string
  }
}

export interface BackupImport {
  settings?: Partial<BackupSettings>
  schedules?: ScheduleSettings['schedules']
  policies?: RetentionSettings['policies']
  overwrite: boolean
  validate: boolean
}

// Tipos para diagnósticos
export interface BackupDiagnostics {
  system: {
    diskSpace: {
      available: number
      total: number
      usage: number // porcentagem
    }
    memory: {
      available: number
      total: number
      usage: number
    }
    cpu: {
      usage: number
      cores: number
    }
    network: {
      bandwidth: number
      latency: number
    }
  }
  storage: {
    providers: Array<{
      name: string
      status: 'healthy' | 'warning' | 'error'
      latency: number
      throughput: number
      errors: string[]
    }>
  }
  performance: {
    averageSpeed: number
    bottlenecks: string[]
    recommendations: string[]
  }
  health: {
    score: number // 0-100
    issues: Array<{
      type: 'error' | 'warning' | 'info'
      message: string
      impact: 'low' | 'medium' | 'high'
      solution?: string
    }>
  }
}

// Tipos para agendamento de backup
export interface BackupSchedule {
  id: string
  name: string
  description?: string
  type: BackupType
  frequency: 'manual' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'custom'
  cronExpression?: string
  timezone: string
  enabled: boolean
  nextRun?: string
  lastRun?: string
  options: {
    includeData: boolean
    includeFiles: boolean
    includeConfig: boolean
    includeLogs: boolean
    customPaths?: string[]
  }
  createdAt: string
  updatedAt: string
}

// Tipos para métricas de performance
export interface PerformanceMetrics {
  throughput: {
    current: number // MB/s
    average: number
    peak: number
    timeline: Array<{
      timestamp: string
      value: number
    }>
  }
  latency: {
    current: number // ms
    average: number
    p95: number
    p99: number
  }
  resources: {
    cpu: number // porcentagem
    memory: number // porcentagem
    disk: number // porcentagem
    network: number // porcentagem
  }
  errors: {
    rate: number // por minuto
    types: Record<string, number>
    recent: Array<{
      timestamp: string
      message: string
      type: string
    }>
  }
}