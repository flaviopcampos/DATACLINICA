export interface SystemSettings {
  id: string
  general: GeneralSettings
  appearance: AppearanceSettings
  performance: PerformanceSettings
  maintenance: MaintenanceSettings
  advanced: AdvancedSettings
  createdAt: string
  updatedAt: string
  version: string
}

export interface GeneralSettings {
  siteName: string
  siteDescription: string
  adminEmail: string
  timezone: string
  language: string
  dateFormat: string
  timeFormat: '12h' | '24h'
  currency: string
  maintenanceMode: boolean
  debugMode: boolean
  analyticsEnabled: boolean
  cookieConsent: boolean
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system'
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontFamily: string
  fontSize: 'small' | 'medium' | 'large'
  compactMode: boolean
  animations: boolean
  customCSS?: string
  logo?: {
    url: string
    width: number
    height: number
  }
  favicon?: {
    url: string
  }
}

export interface PerformanceSettings {
  caching: {
    enabled: boolean
    ttl: number // em segundos
    strategy: 'memory' | 'redis' | 'file'
  }
  compression: {
    enabled: boolean
    level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
    types: string[]
  }
  cdn: {
    enabled: boolean
    url?: string
    regions: string[]
  }
  database: {
    poolSize: number
    timeout: number
    retries: number
  }
  api: {
    rateLimit: {
      enabled: boolean
      requests: number
      window: number // em segundos
    }
    timeout: number
    retries: number
  }
}

export interface MaintenanceSettings {
  autoBackup: {
    enabled: boolean
    frequency: 'daily' | 'weekly' | 'monthly'
    time: string // HH:mm
    retention: number // dias
  }
  autoUpdate: {
    enabled: boolean
    channel: 'stable' | 'beta' | 'alpha'
    autoInstall: boolean
    notifyOnly: boolean
  }
  cleanup: {
    enabled: boolean
    frequency: 'daily' | 'weekly' | 'monthly'
    targets: {
      logs: boolean
      cache: boolean
      temp: boolean
      uploads: boolean
    }
    retention: {
      logs: number // dias
      cache: number // dias
      temp: number // dias
      uploads: number // dias
    }
  }
  monitoring: {
    enabled: boolean
    healthChecks: boolean
    performanceMetrics: boolean
    errorTracking: boolean
    uptime: boolean
  }
}

export interface AdvancedSettings {
  api: {
    cors: {
      enabled: boolean
      origins: string[]
      methods: string[]
      headers: string[]
    }
    swagger: {
      enabled: boolean
      path: string
      auth: boolean
    }
    versioning: {
      enabled: boolean
      strategy: 'header' | 'query' | 'path'
      defaultVersion: string
    }
  }
  security: {
    encryption: {
      algorithm: string
      keySize: number
    }
    session: {
      timeout: number // minutos
      secure: boolean
      sameSite: 'strict' | 'lax' | 'none'
    }
    headers: {
      hsts: boolean
      csp: boolean
      xframe: boolean
      xss: boolean
    }
  }
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error'
    format: 'json' | 'text'
    rotation: {
      enabled: boolean
      maxSize: string // ex: '10MB'
      maxFiles: number
    }
    destinations: Array<{
      type: 'file' | 'console' | 'syslog' | 'webhook'
      config: Record<string, any>
    }>
  }
  experimental: {
    features: string[]
    flags: Record<string, boolean>
  }
}

export interface SystemSettingsUpdate {
  general?: Partial<GeneralSettings>
  appearance?: Partial<AppearanceSettings>
  performance?: Partial<PerformanceSettings>
  maintenance?: Partial<MaintenanceSettings>
  advanced?: Partial<AdvancedSettings>
}

export interface SettingsCategory {
  id: string
  name: string
  description: string
  icon: string
  settings: SettingsField[]
}

export interface SettingsField {
  key: string
  label: string
  description?: string
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'color' | 'file' | 'textarea' | 'password' | 'email' | 'url' | 'date' | 'time' | 'datetime'
  value: any
  defaultValue: any
  required: boolean
  validation?: {
    min?: number
    max?: number
    pattern?: string
    custom?: string
  }
  options?: Array<{
    value: any
    label: string
    description?: string
  }>
  dependencies?: Array<{
    field: string
    value: any
    condition: 'equals' | 'not_equals' | 'contains' | 'not_contains'
  }>
  group?: string
  order: number
  readonly?: boolean
  sensitive?: boolean
}

export interface SettingsValidationResult {
  valid: boolean
  errors: Array<{
    field: string
    message: string
    code: string
  }>
  warnings: Array<{
    field: string
    message: string
    code: string
  }>
}

export interface SettingsExport {
  settings: SystemSettings
  metadata: {
    exportedAt: string
    exportedBy: string
    version: string
    checksum: string
  }
  categories: SettingsCategory[]
}

export interface SettingsImport {
  settings: Partial<SystemSettings>
  overwrite: boolean
  categories?: string[]
  dryRun?: boolean
}

export interface SettingsHistory {
  id: string
  userId: string
  userName: string
  action: 'update' | 'reset' | 'import' | 'export'
  category?: string
  changes: Array<{
    field: string
    oldValue: any
    newValue: any
    type: 'create' | 'update' | 'delete'
  }>
  metadata: {
    ipAddress: string
    userAgent: string
    source: 'web' | 'api' | 'cli' | 'system'
  }
  timestamp: string
}

export interface SettingsBackup {
  id: string
  name: string
  description?: string
  settings: SystemSettings
  categories: SettingsCategory[]
  metadata: {
    createdAt: string
    createdBy: string
    version: string
    size: number
    checksum: string
  }
  automatic: boolean
}

export interface SettingsRecommendation {
  id: string
  category: string
  field: string
  currentValue: any
  recommendedValue: any
  reason: string
  impact: 'low' | 'medium' | 'high'
  type: 'performance' | 'security' | 'usability' | 'maintenance'
  applicable: boolean
  autoApply: boolean
}

export interface SettingsUpdate {
  id: string
  version: string
  title: string
  description: string
  changes: Array<{
    category: string
    field: string
    type: 'add' | 'update' | 'remove' | 'rename'
    oldValue?: any
    newValue?: any
    migration?: string
  }>
  breaking: boolean
  releaseDate: string
  applied: boolean
  appliedAt?: string
}

// Tipos para configurações específicas
export interface DatabaseSettings {
  host: string
  port: number
  database: string
  username: string
  password: string
  ssl: boolean
  poolSize: number
  timeout: number
  charset: string
  timezone: string
}

export interface EmailSettings {
  provider: 'smtp' | 'sendgrid' | 'mailgun' | 'ses' | 'postmark'
  host?: string
  port?: number
  username?: string
  password?: string
  apiKey?: string
  from: {
    name: string
    email: string
  }
  replyTo?: {
    name: string
    email: string
  }
  encryption: 'none' | 'tls' | 'ssl'
  testMode: boolean
}

export interface StorageSettings {
  provider: 'local' | 's3' | 'gcs' | 'azure' | 'digitalocean'
  local?: {
    path: string
    maxSize: number
  }
  s3?: {
    bucket: string
    region: string
    accessKey: string
    secretKey: string
    endpoint?: string
  }
  gcs?: {
    bucket: string
    projectId: string
    keyFile: string
  }
  azure?: {
    account: string
    key: string
    container: string
  }
  digitalocean?: {
    bucket: string
    region: string
    accessKey: string
    secretKey: string
  }
  cdn?: {
    enabled: boolean
    url: string
  }
}

export interface PaymentSettings {
  providers: Array<{
    name: 'stripe' | 'paypal' | 'square' | 'mercadopago'
    enabled: boolean
    testMode: boolean
    config: Record<string, any>
  }>
  currency: string
  taxRate: number
  invoicing: {
    enabled: boolean
    prefix: string
    nextNumber: number
    template: string
  }
}

// Tipos para eventos de configuração
export interface SettingsEvent {
  type: 'settings.updated' | 'settings.reset' | 'settings.imported' | 'settings.exported'
  data: {
    category?: string
    fields?: string[]
    userId: string
    timestamp: string
  }
}

// Tipos para validação de configurações
export interface SettingsValidator {
  field: string
  rules: Array<{
    type: 'required' | 'min' | 'max' | 'pattern' | 'custom'
    value?: any
    message: string
    validator?: (value: any) => boolean
  }>
}

// Tipos para migração de configurações
export interface SettingsMigration {
  version: string
  description: string
  up: (settings: any) => any
  down: (settings: any) => any
}