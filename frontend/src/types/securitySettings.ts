export interface SecuritySettings {
  id: string;
  organizationId: string;
  
  // Autenticação
  authentication: AuthenticationSettings;
  
  // Gerenciamento de Sessões
  sessions: SessionSettings;
  
  // Monitoramento
  monitoring: MonitoringSettings;
  
  // Auditoria
  audit: AuditSettings;
  
  // Controle de Acesso
  accessControl: AccessControlSettings;
  
  updatedAt: string;
  updatedBy: string;
}

export interface AuthenticationSettings {
  // Two-Factor Authentication
  twoFactorEnabled: boolean;
  twoFactorRequired: boolean;
  twoFactorMethods: ('sms' | 'email' | 'authenticator' | 'backup_codes')[];
  
  // Política de Senha
  passwordPolicy: PasswordPolicy;
  
  // Proteção de Login
  loginProtection: LoginProtection;
  
  // OAuth/SSO
  ssoEnabled: boolean;
  ssoProviders: string[];
  ssoRequired: boolean;
}

export interface PasswordPolicy {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  forbidCommonPasswords: boolean;
  forbidPersonalInfo: boolean;
  passwordHistory: number;
  passwordExpiry: number; // days
  passwordExpiryWarning: number; // days
}

export interface LoginProtection {
  maxAttempts: number;
  lockoutDuration: number; // minutes
  progressiveLockout: boolean;
  captchaEnabled: boolean;
  captchaAfterAttempts: number;
  ipWhitelist: string[];
  geoBlocking: boolean;
  allowedCountries: string[];
  deviceTracking: boolean;
  suspiciousActivityDetection: boolean;
}

export interface SessionSettings {
  sessionTimeout: number; // minutes
  maxConcurrentSessions: number;
  idleTimeout: number; // minutes
  rememberDevice: boolean;
  rememberDeviceDuration: number; // days
  forceLogoutOnPasswordChange: boolean;
  sessionEncryption: boolean;
  secureSessionCookies: boolean;
}

export interface MonitoringSettings {
  // Alertas de Segurança
  securityAlerts: SecurityAlerts;
  
  // Rastreamento de Atividade
  activityTracking: ActivityTracking;
  
  // Detecção de Anomalias
  anomalyDetection: AnomalyDetection;
}

export interface SecurityAlerts {
  loginAlerts: boolean;
  failedLoginAlerts: boolean;
  newDeviceAlerts: boolean;
  locationChangeAlerts: boolean;
  privilegeEscalationAlerts: boolean;
  dataAccessAlerts: boolean;
  configurationChangeAlerts: boolean;
  alertChannels: ('email' | 'sms' | 'push' | 'webhook')[];
  alertRecipients: string[];
}

export interface ActivityTracking {
  trackLogins: boolean;
  trackPageViews: boolean;
  trackDataAccess: boolean;
  trackConfigChanges: boolean;
  trackFileUploads: boolean;
  trackApiCalls: boolean;
  retentionPeriod: number; // days
  realTimeMonitoring: boolean;
}

export interface AnomalyDetection {
  enabled: boolean;
  sensitivity: 'low' | 'medium' | 'high';
  learningPeriod: number; // days
  alertThreshold: number;
  autoBlock: boolean;
  whitelist: string[];
}

export interface AuditSettings {
  auditLevel: 'minimal' | 'standard' | 'comprehensive';
  auditRetention: number; // days
  realTimeAudit: boolean;
  auditEncryption: boolean;
  auditBackup: boolean;
  auditExport: boolean;
  complianceMode: boolean;
  complianceStandards: ('HIPAA' | 'GDPR' | 'SOX' | 'PCI-DSS')[];
}

export interface AccessControlSettings {
  roleBasedAccess: boolean;
  attributeBasedAccess: boolean;
  defaultRole: string;
  guestAccess: boolean;
  apiAccess: boolean;
  apiRateLimit: number;
  resourcePermissions: ResourcePermission[];
}

export interface ResourcePermission {
  resource: string;
  actions: string[];
  roles: string[];
  conditions?: AccessCondition[];
}

export interface AccessCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'in' | 'not_in';
  value: any;
}

export interface TrustedDevice {
  id: string;
  userId: string;
  deviceId: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  ipAddress: string;
  location: string;
  firstSeen: string;
  lastSeen: string;
  trusted: boolean;
  trustedAt?: string;
  fingerprint: string;
}

export interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'failed_login' | 'password_change' | 'permission_change' | 'data_access' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  userName?: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  description: string;
  metadata: Record<string, any>;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  notes?: string;
}

export interface SecurityReport {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  period: {
    start: string;
    end: string;
  };
  summary: {
    totalEvents: number;
    criticalEvents: number;
    failedLogins: number;
    newDevices: number;
    suspiciousActivities: number;
  };
  events: SecurityEvent[];
  recommendations: string[];
  generatedAt: string;
}

export interface SecurityAuditLog {
  id: string;
  action: string;
  resource: string;
  userId: string;
  userName: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  success: boolean;
  details: Record<string, any>;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface SecuritySettingsUpdateRequest {
  settings: Partial<SecuritySettings>;
  category?: string;
}

export interface SecuritySettingsResponse {
  success: boolean;
  data?: SecuritySettings;
  message?: string;
  errors?: Record<string, string>;
}

export interface SecurityEventResponse {
  success: boolean;
  data?: {
    events: SecurityEvent[];
    total: number;
    page: number;
    limit: number;
  };
  message?: string;
}

export interface TrustedDeviceResponse {
  success: boolean;
  data?: TrustedDevice[];
  message?: string;
}