// Tipos para sistema de Autenticação 2FA

export enum TwoFactorStatus {
  DISABLED = 'disabled',
  ENABLED = 'enabled',
  PENDING_SETUP = 'pending_setup'
}

export enum TwoFactorMethod {
  TOTP = 'totp', // Time-based One-Time Password (Google Authenticator, etc.)
  SMS = 'sms',
  EMAIL = 'email'
}

export enum AuthLogAction {
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILED = 'login_failed',
  TWO_FACTOR_SETUP = 'two_factor_setup',
  TWO_FACTOR_DISABLED = 'two_factor_disabled',
  BACKUP_CODE_USED = 'backup_code_used',
  DEVICE_TRUSTED = 'device_trusted',
  DEVICE_REMOVED = 'device_removed'
}

export interface TwoFactorConfig {
  id: string
  user_id: string
  status: TwoFactorStatus
  method: TwoFactorMethod
  secret?: string // Para TOTP
  phone?: string // Para SMS
  email?: string // Para Email
  backup_codes: BackupCode[]
  created_at: string
  updated_at: string
  last_used_at?: string
}

export interface BackupCode {
  id: string
  code: string
  used: boolean
  used_at?: string
  created_at: string
}

export interface TrustedDevice {
  id: string
  user_id: string
  device_name: string
  device_fingerprint: string
  ip_address: string
  user_agent: string
  location?: string
  trusted_at: string
  expires_at: string
  last_used_at?: string
  is_active: boolean
}

export interface AuthLog {
  id: string
  user_id: string
  action: AuthLogAction
  ip_address: string
  user_agent: string
  location?: string
  device_fingerprint?: string
  success: boolean
  error_message?: string
  metadata?: Record<string, any>
  created_at: string
}

export interface TwoFactorSetupRequest {
  method: TwoFactorMethod
  phone?: string
  email?: string
}

export interface TwoFactorSetupResponse {
  secret: string
  qr_code_url: string
  backup_codes: string[]
  manual_entry_key: string
}

export interface TwoFactorVerifyRequest {
  code: string
  backup_code?: boolean
  trust_device?: boolean
  device_name?: string
}

export interface TwoFactorVerifyResponse {
  success: boolean
  token?: string
  trusted_device_token?: string
  message?: string
}

export interface TwoFactorDisableRequest {
  password: string
  code?: string
}

export interface TwoFactorStats {
  total_users_with_2fa: number
  active_2fa_sessions: number
  backup_codes_used_today: number
  failed_attempts_today: number
  trusted_devices_count: number
}

// Tipos para componentes
export interface TwoFactorSetupProps {
  onComplete?: (config: TwoFactorConfig) => void
  onCancel?: () => void
}

export interface TwoFactorVerifyProps {
  onSuccess?: (response: TwoFactorVerifyResponse) => void
  onError?: (error: string) => void
  allowBackupCode?: boolean
  allowTrustDevice?: boolean
}

export interface TwoFactorManagementProps {
  config: TwoFactorConfig
  trustedDevices: TrustedDevice[]
  authLogs: AuthLog[]
  onConfigUpdate?: (config: TwoFactorConfig) => void
}

// Tipos para hooks
export interface Use2FAReturn {
  config: TwoFactorConfig | null
  trustedDevices: TrustedDevice[]
  authLogs: AuthLog[]
  stats: TwoFactorStats | null
  isLoading: boolean
  error: string | null
  setupTwoFactor: (request: TwoFactorSetupRequest) => Promise<TwoFactorSetupResponse>
  verifyTwoFactor: (request: TwoFactorVerifyRequest) => Promise<TwoFactorVerifyResponse>
  disableTwoFactor: (request: TwoFactorDisableRequest) => Promise<void>
  regenerateBackupCodes: () => Promise<string[]>
  removeTrustedDevice: (deviceId: string) => Promise<void>
  refreshConfig: () => Promise<void>
}

export interface TwoFactorContextValue extends Use2FAReturn {
  isSetupRequired: boolean
  isVerificationRequired: boolean
}