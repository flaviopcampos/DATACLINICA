export interface Session {
  id: string;
  userId: number;
  deviceInfo: DeviceInfo;
  location: LocationInfo;
  status: SessionStatus;
  createdAt: string;
  lastActivity: string;
  expiresAt: string;
  ipAddress: string;
  userAgent: string;
  isCurrentSession: boolean;
  riskLevel: RiskLevel;
  securityScore: number;
  // Legacy fields for backward compatibility
  user_id?: string;
  device_info?: DeviceInfo;
  ip_address?: string;
  created_at?: string;
  last_activity?: string;
  expires_at?: string;
  is_current?: boolean;
  security_level?: SecurityLevel;
  session_token?: string;
}

export interface DeviceInfo {
  type: DeviceType;
  name: string;
  os: string;
  browser: string;
  isTrusted?: boolean;
  fingerprint?: string;
  // Legacy fields for backward compatibility
  is_trusted?: boolean;
}

export interface LocationInfo {
  country: string;
  region: string;
  city: string;
  latitude?: number;
  longitude?: number;
  isUsual?: boolean;
  // Legacy fields for backward compatibility
  is_usual?: boolean;
}

export interface SessionActivity {
  id: string;
  session_id: string;
  activity_type: ActivityType;
  description: string;
  ip_address: string;
  timestamp: string;
  details?: Record<string, any>;
}

export interface SessionSettings {
  id: string;
  user_id: string;
  max_concurrent_sessions: number;
  session_timeout_minutes: number;
  auto_logout_inactive_minutes: number;
  require_2fa_for_new_devices: boolean;
  notify_new_logins: boolean;
  notify_unusual_locations: boolean;
  block_suspicious_activity: boolean;
  trusted_devices_only: boolean;
  created_at: string;
  updated_at: string;
}

export interface SessionAlert {
  id: string;
  user_id: string;
  session_id: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface SessionFilters {
  status?: SessionStatus[];
  device_type?: DeviceType[];
  location?: string;
  date_range?: {
    start: string;
    end: string;
  };
  is_trusted?: boolean;
  security_level?: SecurityLevel[];
}

export interface SessionStats {
  total_active: number;
  total_today: number;
  total_this_week: number;
  total_this_month: number;
  by_device_type: Record<DeviceType, number>;
  by_location: Record<string, number>;
  suspicious_activities: number;
}

// Enums
export enum SessionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  TERMINATED = 'terminated',
  SUSPENDED = 'suspended'
}

export enum DeviceType {
  DESKTOP = 'desktop',
  MOBILE = 'mobile',
  TABLET = 'tablet',
  UNKNOWN = 'unknown'
}

export enum SecurityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ActivityType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  PAGE_VIEW = 'page_view',
  API_CALL = 'api_call',
  DOWNLOAD = 'download',
  UPLOAD = 'upload',
  SETTINGS_CHANGE = 'settings_change',
  PASSWORD_CHANGE = 'password_change',
  TWO_FA_SETUP = 'two_fa_setup',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity'
}

export enum AlertType {
  NEW_LOGIN = 'new_login',
  UNUSUAL_LOCATION = 'unusual_location',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  MULTIPLE_FAILED_ATTEMPTS = 'multiple_failed_attempts',
  SESSION_HIJACK_ATTEMPT = 'session_hijack_attempt',
  CONCURRENT_LIMIT_EXCEEDED = 'concurrent_limit_exceeded'
}

export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  DANGER = 'danger',
  CRITICAL = 'critical'
}

// Request/Response types
export interface CreateSessionRequest {
  device_info: Omit<DeviceInfo, 'is_trusted' | 'fingerprint'>;
  location?: Omit<LocationInfo, 'is_usual'>;
  remember_device?: boolean;
}

export interface UpdateSessionSettingsRequest {
  max_concurrent_sessions?: number;
  session_timeout_minutes?: number;
  auto_logout_inactive_minutes?: number;
  require_2fa_for_new_devices?: boolean;
  notify_new_logins?: boolean;
  notify_unusual_locations?: boolean;
  block_suspicious_activity?: boolean;
  trusted_devices_only?: boolean;
}

export interface TerminateSessionRequest {
  session_id: string;
  reason?: string;
}

export interface SessionsResponse {
  sessions: Session[];
  total: number;
  current_page: number;
  total_pages: number;
}

export interface SessionActivitiesResponse {
  activities: SessionActivity[];
  total: number;
  current_page: number;
  total_pages: number;
}

export interface SessionAlertsResponse {
  alerts: SessionAlert[];
  total: number;
  unread_count: number;
}