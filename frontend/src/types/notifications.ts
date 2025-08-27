export interface NotificationSettings {
  id: string
  general: GeneralNotificationSettings
  channels: NotificationChannels
  types: NotificationTypes
  preferences: NotificationPreferences
  templates: NotificationTemplate[]
  createdAt: string
  updatedAt: string
}

export interface GeneralNotificationSettings {
  enabled: boolean
  defaultChannel: NotificationChannelType
  batchNotifications: boolean
  batchInterval: number // em minutos
  quietHours: {
    enabled: boolean
    start: string // HH:mm
    end: string // HH:mm
    timezone: string
  }
  rateLimiting: {
    enabled: boolean
    maxPerHour: number
    maxPerDay: number
  }
  retryPolicy: {
    enabled: boolean
    maxRetries: number
    backoffStrategy: 'linear' | 'exponential'
    initialDelay: number // em segundos
  }
}

export interface NotificationChannels {
  email: EmailChannelSettings
  sms: SMSChannelSettings
  push: PushChannelSettings
  webhook: WebhookChannelSettings
  slack: SlackChannelSettings
  discord: DiscordChannelSettings
  telegram: TelegramChannelSettings
  inApp: InAppChannelSettings
}

export interface EmailChannelSettings {
  enabled: boolean
  provider: 'smtp' | 'sendgrid' | 'mailgun' | 'ses' | 'postmark'
  config: {
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
  }
  templates: {
    header: string
    footer: string
    styles: string
  }
  attachments: {
    enabled: boolean
    maxSize: number // em MB
    allowedTypes: string[]
  }
}

export interface SMSChannelSettings {
  enabled: boolean
  provider: 'twilio' | 'nexmo' | 'aws-sns' | 'messagebird'
  config: {
    accountSid?: string
    authToken?: string
    apiKey?: string
    from: string
  }
  shortLinks: boolean
  deliveryReports: boolean
}

export interface PushChannelSettings {
  enabled: boolean
  provider: 'fcm' | 'apns' | 'web-push'
  config: {
    serverKey?: string
    vapidKeys?: {
      publicKey: string
      privateKey: string
    }
    apnsCertificate?: string
    apnsKey?: string
    bundleId?: string
  }
  badge: boolean
  sound: boolean
  vibration: boolean
}

export interface WebhookChannelSettings {
  enabled: boolean
  endpoints: Array<{
    id: string
    name: string
    url: string
    method: 'POST' | 'PUT' | 'PATCH'
    headers: Record<string, string>
    authentication: {
      type: 'none' | 'basic' | 'bearer' | 'api-key'
      credentials: Record<string, string>
    }
    retries: number
    timeout: number // em segundos
    enabled: boolean
  }>
  signature: {
    enabled: boolean
    secret: string
    algorithm: 'sha256' | 'sha512'
  }
}

export interface SlackChannelSettings {
  enabled: boolean
  webhookUrl: string
  channel: string
  username: string
  iconEmoji?: string
  iconUrl?: string
  mentionUsers: string[]
  threadReplies: boolean
}

export interface DiscordChannelSettings {
  enabled: boolean
  webhookUrl: string
  username: string
  avatarUrl?: string
  mentionRoles: string[]
  embedColor: string
}

export interface TelegramChannelSettings {
  enabled: boolean
  botToken: string
  chatId: string
  parseMode: 'HTML' | 'Markdown' | 'MarkdownV2'
  disablePreview: boolean
}

export interface InAppChannelSettings {
  enabled: boolean
  showBadge: boolean
  autoMarkRead: boolean
  autoMarkReadDelay: number // em segundos
  maxNotifications: number
  groupSimilar: boolean
  sound: {
    enabled: boolean
    file?: string
  }
}

export interface NotificationTypes {
  system: SystemNotificationTypes
  user: UserNotificationTypes
  security: SecurityNotificationTypes
  business: BusinessNotificationTypes
}

export interface SystemNotificationTypes {
  serverDown: NotificationTypeConfig
  serverUp: NotificationTypeConfig
  highCpuUsage: NotificationTypeConfig
  highMemoryUsage: NotificationTypeConfig
  diskSpaceLow: NotificationTypeConfig
  backupCompleted: NotificationTypeConfig
  backupFailed: NotificationTypeConfig
  updateAvailable: NotificationTypeConfig
  maintenanceScheduled: NotificationTypeConfig
  errorRateHigh: NotificationTypeConfig
}

export interface UserNotificationTypes {
  welcome: NotificationTypeConfig
  passwordChanged: NotificationTypeConfig
  emailChanged: NotificationTypeConfig
  profileUpdated: NotificationTypeConfig
  accountLocked: NotificationTypeConfig
  loginFromNewDevice: NotificationTypeConfig
  subscriptionExpiring: NotificationTypeConfig
  subscriptionRenewed: NotificationTypeConfig
}

export interface SecurityNotificationTypes {
  suspiciousActivity: NotificationTypeConfig
  failedLoginAttempts: NotificationTypeConfig
  newDeviceLogin: NotificationTypeConfig
  passwordResetRequest: NotificationTypeConfig
  twoFactorEnabled: NotificationTypeConfig
  twoFactorDisabled: NotificationTypeConfig
  apiKeyCreated: NotificationTypeConfig
  apiKeyRevoked: NotificationTypeConfig
}

export interface BusinessNotificationTypes {
  newOrder: NotificationTypeConfig
  orderCancelled: NotificationTypeConfig
  paymentReceived: NotificationTypeConfig
  paymentFailed: NotificationTypeConfig
  invoiceGenerated: NotificationTypeConfig
  invoiceOverdue: NotificationTypeConfig
  customerRegistered: NotificationTypeConfig
  supportTicketCreated: NotificationTypeConfig
}

export interface NotificationTypeConfig {
  enabled: boolean
  channels: NotificationChannelType[]
  priority: 'low' | 'normal' | 'high' | 'urgent'
  template: string
  conditions?: Array<{
    field: string
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains'
    value: any
  }>
  throttling?: {
    enabled: boolean
    interval: number // em minutos
    maxCount: number
  }
  escalation?: {
    enabled: boolean
    delay: number // em minutos
    channels: NotificationChannelType[]
    recipients: string[]
  }
}

export interface NotificationPreferences {
  userId?: string
  email: {
    enabled: boolean
    frequency: 'immediate' | 'hourly' | 'daily' | 'weekly'
    types: string[]
  }
  sms: {
    enabled: boolean
    types: string[]
  }
  push: {
    enabled: boolean
    types: string[]
  }
  inApp: {
    enabled: boolean
    types: string[]
  }
  quietHours: {
    enabled: boolean
    start: string
    end: string
    timezone: string
  }
  language: string
  timezone: string
}

export interface NotificationTemplate {
  id: string
  name: string
  description?: string
  type: string
  channel: NotificationChannelType
  subject?: string
  content: string
  variables: Array<{
    name: string
    description: string
    type: 'string' | 'number' | 'boolean' | 'date' | 'object'
    required: boolean
    defaultValue?: any
  }>
  metadata: {
    createdAt: string
    updatedAt: string
    createdBy: string
    version: number
  }
  isDefault: boolean
  isActive: boolean
}

export interface NotificationHistory {
  id: string
  type: string
  channel: NotificationChannelType
  recipient: string
  subject?: string
  content: string
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced'
  error?: string
  metadata: {
    templateId?: string
    variables?: Record<string, any>
    priority: 'low' | 'normal' | 'high' | 'urgent'
    retryCount: number
    deliveredAt?: string
    readAt?: string
    clickedAt?: string
  }
  createdAt: string
  updatedAt: string
}

export interface NotificationStatistics {
  total: {
    sent: number
    delivered: number
    failed: number
    pending: number
  }
  byChannel: Record<NotificationChannelType, {
    sent: number
    delivered: number
    failed: number
    deliveryRate: number
  }>
  byType: Record<string, {
    sent: number
    delivered: number
    failed: number
  }>
  timeline: Array<{
    date: string
    sent: number
    delivered: number
    failed: number
  }>
  performance: {
    averageDeliveryTime: number // em segundos
    deliveryRate: number // porcentagem
    bounceRate: number // porcentagem
    clickRate: number // porcentagem
  }
}

export interface NotificationQueue {
  id: string
  type: string
  channel: NotificationChannelType
  recipient: string
  payload: {
    subject?: string
    content: string
    variables?: Record<string, any>
    templateId?: string
  }
  priority: 'low' | 'normal' | 'high' | 'urgent'
  scheduledAt?: string
  attempts: number
  maxAttempts: number
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled'
  error?: string
  createdAt: string
  updatedAt: string
}

export interface NotificationEvent {
  id: string
  type: string
  source: string
  data: Record<string, any>
  recipients: Array<{
    type: 'user' | 'role' | 'email' | 'phone'
    value: string
  }>
  channels: NotificationChannelType[]
  priority: 'low' | 'normal' | 'high' | 'urgent'
  scheduledAt?: string
  metadata: Record<string, any>
  createdAt: string
}

export interface NotificationRule {
  id: string
  name: string
  description?: string
  enabled: boolean
  trigger: {
    event: string
    conditions: Array<{
      field: string
      operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'regex'
      value: any
    }>
  }
  actions: Array<{
    type: 'send_notification' | 'create_ticket' | 'call_webhook' | 'escalate'
    config: Record<string, any>
  }>
  throttling?: {
    enabled: boolean
    interval: number // em minutos
    maxCount: number
  }
  schedule?: {
    enabled: boolean
    timezone: string
    allowedDays: number[] // 0-6 (domingo-sábado)
    allowedHours: {
      start: string // HH:mm
      end: string // HH:mm
    }
  }
  metadata: {
    createdAt: string
    updatedAt: string
    createdBy: string
    lastTriggered?: string
    triggerCount: number
  }
}

// Tipos auxiliares
export type NotificationChannelType = 
  | 'email' 
  | 'sms' 
  | 'push' 
  | 'webhook' 
  | 'slack' 
  | 'discord' 
  | 'telegram' 
  | 'inApp'

export type NotificationStatus = 
  | 'pending' 
  | 'sent' 
  | 'delivered' 
  | 'failed' 
  | 'bounced' 
  | 'cancelled'

export type NotificationPriority = 
  | 'low' 
  | 'normal' 
  | 'high' 
  | 'urgent'

// Tipos para atualizações
export interface NotificationSettingsUpdate {
  general?: Partial<GeneralNotificationSettings>
  channels?: Partial<NotificationChannels>
  types?: Partial<NotificationTypes>
  preferences?: Partial<NotificationPreferences>
}

export interface NotificationChannelTest {
  channel: NotificationChannelType
  recipient: string
  message: string
  subject?: string
}

export interface NotificationPermission {
  channel: NotificationChannelType
  granted: boolean
  requested: boolean
  canRequest: boolean
}

// Tipos para exportação/importação
export interface NotificationExport {
  settings: NotificationSettings
  templates: NotificationTemplate[]
  rules: NotificationRule[]
  metadata: {
    exportedAt: string
    exportedBy: string
    version: string
  }
}

export interface NotificationImport {
  settings?: Partial<NotificationSettings>
  templates?: NotificationTemplate[]
  rules?: NotificationRule[]
  overwrite: boolean
}

// Tipos para webhooks
export interface WebhookPayload {
  event: string
  data: Record<string, any>
  timestamp: string
  signature?: string
}

export interface WebhookResponse {
  success: boolean
  status: number
  response?: any
  error?: string
  duration: number
}

// Tipos para métricas
export interface NotificationMetrics {
  deliveryRate: number
  bounceRate: number
  clickRate: number
  unsubscribeRate: number
  averageDeliveryTime: number
  totalSent: number
  totalDelivered: number
  totalFailed: number
}

// Tipos específicos para backup e restore
export interface BackupNotification {
  id: string
  type: 'backup_started' | 'backup_completed' | 'backup_failed' | 'backup_progress'
  backupId: string
  title: string
  message: string
  status: NotificationStatus
  priority: NotificationPriority
  data?: {
    progress?: number
    size?: number
    duration?: number
    error?: string
  }
  createdAt: string
  readAt?: string
}

export interface RestoreNotification {
  id: string
  type: 'restore_started' | 'restore_completed' | 'restore_failed' | 'restore_progress'
  restoreId: string
  title: string
  message: string
  status: NotificationStatus
  priority: NotificationPriority
  data?: {
    progress?: number
    backupId?: string
    duration?: number
    error?: string
  }
  createdAt: string
  readAt?: string
}