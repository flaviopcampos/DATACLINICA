export interface SecuritySettings {
  id: string
  userId?: string
  authentication: AuthenticationSettings
  authorization: AuthorizationSettings
  encryption: EncryptionSettings
  audit: AuditSettings
  compliance: ComplianceSettings
  monitoring: SecurityMonitoringSettings
  policies: SecurityPolicies
  alerts: SecurityAlertSettings
  backup: SecurityBackupSettings
  createdAt: string
  updatedAt: string
}

export interface AuthenticationSettings {
  twoFactor: {
    enabled: boolean
    method: 'totp' | 'sms' | 'email' | 'hardware'
    backupCodes: {
      enabled: boolean
      count: number
      used: number
      lastGenerated?: string
    }
    trustedDevices: {
      enabled: boolean
      maxDevices: number
      expiry: number // em dias
    }
  }
  passwordPolicy: {
    minLength: number
    maxLength: number
    requireUppercase: boolean
    requireLowercase: boolean
    requireNumbers: boolean
    requireSymbols: boolean
    preventReuse: number // últimas N senhas
    expiry: number // em dias, 0 = nunca expira
    complexity: 'low' | 'medium' | 'high' | 'custom'
  }
  sessionManagement: {
    timeout: number // em minutos
    maxConcurrentSessions: number
    rememberMe: {
      enabled: boolean
      duration: number // em dias
    }
    ipRestriction: {
      enabled: boolean
      whitelist: string[]
      blacklist: string[]
    }
  }
  loginAttempts: {
    maxAttempts: number
    lockoutDuration: number // em minutos
    resetAfter: number // em horas
    progressiveDelay: boolean
  }
  socialLogin: {
    enabled: boolean
    providers: Array<{
      name: string
      enabled: boolean
      clientId?: string
      scopes: string[]
    }>
  }
}

export interface AuthorizationSettings {
  rbac: {
    enabled: boolean
    strictMode: boolean
    inheritanceEnabled: boolean
  }
  permissions: {
    granular: boolean
    caching: {
      enabled: boolean
      ttl: number // em segundos
    }
    audit: boolean
  }
  apiAccess: {
    rateLimit: {
      enabled: boolean
      requests: number
      window: number // em segundos
      strategy: 'fixed' | 'sliding'
    }
    cors: {
      enabled: boolean
      origins: string[]
      methods: string[]
      headers: string[]
      credentials: boolean
    }
    authentication: {
      required: boolean
      methods: ('bearer' | 'api-key' | 'oauth2' | 'basic')[]
    }
  }
}

export interface EncryptionSettings {
  dataAtRest: {
    enabled: boolean
    algorithm: 'AES-256' | 'AES-128' | 'ChaCha20'
    keyRotation: {
      enabled: boolean
      interval: number // em dias
      automatic: boolean
    }
  }
  dataInTransit: {
    tlsVersion: '1.2' | '1.3'
    cipherSuites: string[]
    hsts: {
      enabled: boolean
      maxAge: number // em segundos
      includeSubdomains: boolean
    }
    certificatePinning: {
      enabled: boolean
      pins: string[]
    }
  }
  fieldLevel: {
    enabled: boolean
    fields: Array<{
      name: string
      algorithm: string
      keyId: string
    }>
  }
  keyManagement: {
    provider: 'internal' | 'aws-kms' | 'azure-kv' | 'hashicorp-vault'
    rotation: {
      automatic: boolean
      interval: number // em dias
    }
    backup: {
      enabled: boolean
      encrypted: boolean
      location: string
    }
  }
}

export interface AuditSettings {
  enabled: boolean
  events: {
    authentication: boolean
    authorization: boolean
    dataAccess: boolean
    dataModification: boolean
    systemChanges: boolean
    apiCalls: boolean
  }
  retention: {
    duration: number // em dias
    compression: boolean
    archiving: {
      enabled: boolean
      location: string
      format: 'json' | 'csv' | 'parquet'
    }
  }
  integrity: {
    signing: boolean
    hashing: boolean
    algorithm: 'SHA-256' | 'SHA-512'
  }
  export: {
    formats: ('json' | 'csv' | 'pdf' | 'xml')[]
    encryption: boolean
    scheduling: {
      enabled: boolean
      frequency: 'daily' | 'weekly' | 'monthly'
      recipients: string[]
    }
  }
}

export interface ComplianceSettings {
  frameworks: Array<{
    name: 'GDPR' | 'HIPAA' | 'SOX' | 'PCI-DSS' | 'ISO-27001' | 'SOC2'
    enabled: boolean
    requirements: Array<{
      id: string
      description: string
      status: 'compliant' | 'non-compliant' | 'partial' | 'not-applicable'
      evidence?: string[]
      lastReview?: string
    }>
  }>
  dataProtection: {
    anonymization: {
      enabled: boolean
      methods: ('masking' | 'pseudonymization' | 'generalization')[]
    }
    retention: {
      policies: Array<{
        dataType: string
        retention: number // em dias
        action: 'delete' | 'archive' | 'anonymize'
      }>
    }
    consent: {
      required: boolean
      granular: boolean
      withdrawal: boolean
      tracking: boolean
    }
  }
  reporting: {
    automated: boolean
    frequency: 'monthly' | 'quarterly' | 'annually'
    recipients: string[]
    format: 'pdf' | 'html' | 'json'
  }
}

export interface SecurityMonitoringSettings {
  realTime: {
    enabled: boolean
    events: string[]
    thresholds: Record<string, number>
  }
  anomalyDetection: {
    enabled: boolean
    sensitivity: 'low' | 'medium' | 'high'
    algorithms: ('statistical' | 'ml' | 'rule-based')[]
    learningPeriod: number // em dias
  }
  threatIntelligence: {
    enabled: boolean
    sources: Array<{
      name: string
      url: string
      apiKey?: string
      enabled: boolean
    }>
    updateFrequency: number // em horas
  }
  vulnerability: {
    scanning: {
      enabled: boolean
      frequency: 'daily' | 'weekly' | 'monthly'
      scope: ('dependencies' | 'code' | 'infrastructure')[]
    }
    assessment: {
      automated: boolean
      manual: boolean
      thirdParty: boolean
    }
  }
}

export interface SecurityPolicies {
  password: {
    complexity: PasswordComplexityPolicy
    history: number
    expiry: number
    lockout: LockoutPolicy
  }
  access: {
    workingHours: {
      enabled: boolean
      start: string // HH:mm
      end: string // HH:mm
      timezone: string
      weekends: boolean
    }
    ipRestriction: {
      enabled: boolean
      mode: 'whitelist' | 'blacklist'
      ranges: string[]
    }
    deviceRestriction: {
      enabled: boolean
      allowedDevices: string[]
      requireRegistration: boolean
    }
  }
  data: {
    classification: {
      enabled: boolean
      levels: Array<{
        name: string
        color: string
        restrictions: string[]
      }>
    }
    sharing: {
      internal: boolean
      external: boolean
      approval: boolean
      tracking: boolean
    }
  }
}

export interface SecurityAlertSettings {
  enabled: boolean
  channels: ('email' | 'sms' | 'slack' | 'webhook')[]
  severity: {
    low: {
      enabled: boolean
      channels: string[]
      throttle: number // em minutos
    }
    medium: {
      enabled: boolean
      channels: string[]
      throttle: number
    }
    high: {
      enabled: boolean
      channels: string[]
      throttle: number
    }
    critical: {
      enabled: boolean
      channels: string[]
      throttle: number
      escalation: {
        enabled: boolean
        delay: number // em minutos
        recipients: string[]
      }
    }
  }
  rules: Array<{
    id: string
    name: string
    description: string
    condition: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    enabled: boolean
    actions: Array<{
      type: 'notify' | 'block' | 'log' | 'quarantine'
      config: Record<string, any>
    }>
  }>
}

export interface SecurityBackupSettings {
  encryption: {
    enabled: boolean
    algorithm: string
    keyRotation: boolean
  }
  integrity: {
    checksums: boolean
    signing: boolean
  }
  access: {
    restricted: boolean
    approvers: string[]
    auditTrail: boolean
  }
}

// Tipos para dispositivos confiáveis
export interface TrustedDevice {
  id: string
  userId: string
  name: string
  type: 'desktop' | 'mobile' | 'tablet'
  os: string
  browser: string
  fingerprint: string
  ipAddress: string
  location?: {
    country: string
    city: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  lastUsed: string
  createdAt: string
  expiresAt?: string
  isActive: boolean
}

// Tipos para eventos de segurança
export interface SecurityEvent {
  id: string
  type: SecurityEventType
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  userId?: string
  ipAddress: string
  userAgent?: string
  location?: {
    country: string
    city: string
  }
  metadata: Record<string, any>
  status: 'new' | 'investigating' | 'resolved' | 'false-positive'
  assignedTo?: string
  resolution?: string
  createdAt: string
  updatedAt: string
  resolvedAt?: string
}

export type SecurityEventType = 
  | 'login_success'
  | 'login_failure'
  | 'login_suspicious'
  | 'password_change'
  | 'password_reset'
  | 'account_locked'
  | 'account_unlocked'
  | 'two_factor_enabled'
  | 'two_factor_disabled'
  | 'device_added'
  | 'device_removed'
  | 'permission_change'
  | 'data_access'
  | 'data_export'
  | 'api_abuse'
  | 'vulnerability_detected'
  | 'malware_detected'
  | 'intrusion_attempt'
  | 'policy_violation'

// Tipos para sessões ativas
export interface ActiveSession {
  id: string
  userId: string
  deviceId?: string
  ipAddress: string
  userAgent: string
  location?: {
    country: string
    city: string
  }
  createdAt: string
  lastActivity: string
  expiresAt: string
  isCurrent: boolean
}

// Tipos para políticas de senha
export interface PasswordComplexityPolicy {
  minLength: number
  maxLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSymbols: boolean
  forbiddenPatterns: string[]
  dictionaryCheck: boolean
  personalInfoCheck: boolean
}

export interface LockoutPolicy {
  maxAttempts: number
  lockoutDuration: number // em minutos
  resetAfter: number // em horas
  progressiveDelay: boolean
  notifyUser: boolean
  notifyAdmin: boolean
}

// Tipos para verificação de força da senha
export interface PasswordStrength {
  score: number // 0-100
  level: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong'
  feedback: {
    warning?: string
    suggestions: string[]
  }
  checks: {
    length: boolean
    uppercase: boolean
    lowercase: boolean
    numbers: boolean
    symbols: boolean
    dictionary: boolean
    patterns: boolean
  }
  entropy: number
  crackTime: {
    onlineThrottling: string
    onlineNoThrottling: string
    offlineSlowHashing: string
    offlineFastHashing: string
  }
}

// Tipos para 2FA
export interface TwoFactorAuth {
  enabled: boolean
  method: 'totp' | 'sms' | 'email' | 'hardware'
  secret?: string
  qrCode?: string
  backupCodes: string[]
  verifiedAt?: string
}

export interface TwoFactorSetup {
  secret: string
  qrCode: string
  backupCodes: string[]
  manualEntryKey: string
}

// Tipos para alertas de segurança
export interface SecurityAlert {
  id: string
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  data: Record<string, any>
  status: 'active' | 'acknowledged' | 'resolved'
  createdAt: string
  acknowledgedAt?: string
  acknowledgedBy?: string
  resolvedAt?: string
  resolvedBy?: string
}

// Tipos para scan de vulnerabilidades
export interface VulnerabilityScan {
  id: string
  type: 'dependency' | 'code' | 'infrastructure' | 'configuration'
  status: 'pending' | 'running' | 'completed' | 'failed'
  startedAt: string
  completedAt?: string
  duration?: number
  results: {
    total: number
    critical: number
    high: number
    medium: number
    low: number
    info: number
  }
  vulnerabilities: Vulnerability[]
}

export interface Vulnerability {
  id: string
  cve?: string
  title: string
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  score: number
  vector: string
  component: string
  version: string
  fixedVersion?: string
  references: string[]
  exploitable: boolean
  patchAvailable: boolean
  status: 'open' | 'fixed' | 'ignored' | 'false-positive'
  createdAt: string
  updatedAt: string
}

// Tipos para configuração de IP whitelist
export interface IPWhitelist {
  enabled: boolean
  ranges: Array<{
    id: string
    cidr: string
    description: string
    enabled: boolean
    createdAt: string
  }>
  defaultAction: 'allow' | 'deny'
  logBlocked: boolean
}

// Tipos para rate limiting
export interface RateLimit {
  enabled: boolean
  rules: Array<{
    id: string
    name: string
    path: string
    method: string
    limit: number
    window: number // em segundos
    skipSuccessfulRequests: boolean
    skipFailedRequests: boolean
    keyGenerator: 'ip' | 'user' | 'custom'
    message: string
    enabled: boolean
  }>
  globalLimit: {
    enabled: boolean
    requests: number
    window: number
  }
}

// Tipos auxiliares
export type SecurityLevel = 'low' | 'medium' | 'high' | 'critical'
export type AuthMethod = 'password' | 'totp' | 'sms' | 'email' | 'hardware' | 'biometric'
export type EncryptionAlgorithm = 'AES-256' | 'AES-128' | 'ChaCha20' | 'RSA-2048' | 'RSA-4096'

// Tipos para atualizações
export interface SecuritySettingsUpdate {
  authentication?: Partial<AuthenticationSettings>
  authorization?: Partial<AuthorizationSettings>
  encryption?: Partial<EncryptionSettings>
  audit?: Partial<AuditSettings>
  compliance?: Partial<ComplianceSettings>
  monitoring?: Partial<SecurityMonitoringSettings>
  policies?: Partial<SecurityPolicies>
  alerts?: Partial<SecurityAlertSettings>
  backup?: Partial<SecurityBackupSettings>
}

// Tipos para exportação de eventos
export interface SecurityEventExport {
  events: SecurityEvent[]
  filters: {
    dateRange: {
      start: string
      end: string
    }
    types: SecurityEventType[]
    severity: SecurityLevel[]
    users: string[]
  }
  format: 'json' | 'csv' | 'pdf'
  metadata: {
    exportedAt: string
    exportedBy: string
    totalEvents: number
  }
}

// Tipos para métricas de segurança
export interface SecurityMetrics {
  events: {
    total: number
    byType: Record<SecurityEventType, number>
    bySeverity: Record<SecurityLevel, number>
    timeline: Array<{
      date: string
      count: number
    }>
  }
  authentication: {
    successRate: number
    failureRate: number
    twoFactorAdoption: number
    trustedDevices: number
  }
  vulnerabilities: {
    total: number
    bySeverity: Record<SecurityLevel, number>
    fixed: number
    open: number
  }
  compliance: {
    score: number
    frameworks: Record<string, number>
    gaps: number
  }
}