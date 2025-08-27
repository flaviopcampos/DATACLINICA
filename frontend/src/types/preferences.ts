export interface SystemPreferences {
  id: string
  userId?: string
  general: GeneralPreferences
  theme: ThemePreferences
  localization: LocalizationPreferences
  accessibility: AccessibilityPreferences
  privacy: PrivacyPreferences
  performance: PerformancePreferences
  notifications: NotificationPreferences
  shortcuts: ShortcutPreferences
  workspace: WorkspacePreferences
  createdAt: string
  updatedAt: string
  syncedAt?: string
}

export interface GeneralPreferences {
  autoSave: {
    enabled: boolean
    interval: number // em segundos
    maxVersions: number
  }
  confirmations: {
    deleteActions: boolean
    navigationAway: boolean
    formSubmission: boolean
    bulkOperations: boolean
  }
  defaultViews: {
    dashboard: string
    listView: 'grid' | 'list' | 'card'
    itemsPerPage: number
    sortBy: string
    sortOrder: 'asc' | 'desc'
  }
  session: {
    timeout: number // em minutos
    rememberMe: boolean
    multipleLogins: boolean
  }
  updates: {
    autoCheck: boolean
    autoInstall: boolean
    betaUpdates: boolean
    notifications: boolean
  }
}

export interface ThemePreferences {
  mode: 'light' | 'dark' | 'system' | 'auto'
  primaryColor: string
  accentColor: string
  fontFamily: string
  fontSize: 'small' | 'medium' | 'large' | 'extra-large'
  fontWeight: 'light' | 'normal' | 'medium' | 'bold'
  borderRadius: 'none' | 'small' | 'medium' | 'large'
  animations: {
    enabled: boolean
    speed: 'slow' | 'normal' | 'fast'
    reducedMotion: boolean
  }
  layout: {
    sidebar: 'collapsed' | 'expanded' | 'auto'
    density: 'compact' | 'comfortable' | 'spacious'
    maxWidth: number
  }
  customCSS?: string
  wallpaper?: {
    enabled: boolean
    url?: string
    opacity: number
    blur: number
  }
}

export interface LocalizationPreferences {
  language: string
  region: string
  timezone: string
  dateFormat: string
  timeFormat: '12h' | '24h'
  numberFormat: {
    decimal: string
    thousands: string
    currency: string
  }
  firstDayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6 // 0 = domingo
  calendar: {
    type: 'gregorian' | 'islamic' | 'hebrew' | 'chinese'
    showWeekNumbers: boolean
  }
  units: {
    temperature: 'celsius' | 'fahrenheit' | 'kelvin'
    distance: 'metric' | 'imperial'
    weight: 'metric' | 'imperial'
  }
}

export interface AccessibilityPreferences {
  screenReader: {
    enabled: boolean
    announceChanges: boolean
    verbosity: 'low' | 'medium' | 'high'
  }
  keyboard: {
    navigation: boolean
    shortcuts: boolean
    focusIndicator: boolean
    skipLinks: boolean
  }
  visual: {
    highContrast: boolean
    largeText: boolean
    reducedMotion: boolean
    colorBlindness: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'
  }
  motor: {
    stickyKeys: boolean
    slowKeys: boolean
    bounceKeys: boolean
    mouseKeys: boolean
  }
  cognitive: {
    simplifiedInterface: boolean
    extendedTimeouts: boolean
    confirmationDialogs: boolean
    autoComplete: boolean
  }
}

export interface PrivacyPreferences {
  analytics: {
    enabled: boolean
    anonymize: boolean
    shareUsageData: boolean
  }
  cookies: {
    essential: boolean
    functional: boolean
    analytics: boolean
    marketing: boolean
  }
  dataSharing: {
    thirdParty: boolean
    partners: boolean
    research: boolean
  }
  tracking: {
    location: boolean
    behavior: boolean
    crossSite: boolean
  }
  retention: {
    logs: number // em dias
    sessions: number // em dias
    backups: number // em dias
  }
}

export interface PerformancePreferences {
  caching: {
    enabled: boolean
    strategy: 'aggressive' | 'normal' | 'conservative'
    maxSize: number // em MB
  }
  loading: {
    lazyLoading: boolean
    preloading: boolean
    compression: boolean
  }
  sync: {
    realTime: boolean
    interval: number // em segundos
    batchSize: number
  }
  rendering: {
    fps: number
    quality: 'low' | 'medium' | 'high' | 'ultra'
    hardwareAcceleration: boolean
  }
  network: {
    timeout: number // em segundos
    retries: number
    compression: boolean
  }
}

export interface NotificationPreferences {
  desktop: {
    enabled: boolean
    sound: boolean
    badge: boolean
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  }
  email: {
    enabled: boolean
    frequency: 'immediate' | 'hourly' | 'daily' | 'weekly'
    digest: boolean
  }
  mobile: {
    push: boolean
    vibration: boolean
    sound: boolean
  }
  inApp: {
    enabled: boolean
    position: 'top' | 'bottom' | 'center'
    duration: number // em segundos
  }
  quietHours: {
    enabled: boolean
    start: string // HH:mm
    end: string // HH:mm
    timezone: string
  }
}

export interface ShortcutPreferences {
  enabled: boolean
  scheme: 'default' | 'vim' | 'emacs' | 'custom'
  customShortcuts: Array<{
    id: string
    name: string
    description: string
    keys: string[]
    action: string
    context: string
    enabled: boolean
  }>
  modifiers: {
    ctrl: boolean
    alt: boolean
    shift: boolean
    meta: boolean
  }
}

export interface WorkspacePreferences {
  layout: {
    panels: Array<{
      id: string
      position: 'left' | 'right' | 'top' | 'bottom' | 'center'
      size: number
      visible: boolean
      collapsed: boolean
    }>
    tabs: {
      position: 'top' | 'bottom' | 'left' | 'right'
      closable: boolean
      reorderable: boolean
    }
  }
  editor: {
    wordWrap: boolean
    lineNumbers: boolean
    minimap: boolean
    indentGuides: boolean
    whitespace: boolean
  }
  explorer: {
    showHidden: boolean
    sortBy: 'name' | 'type' | 'size' | 'modified'
    groupBy: 'none' | 'type' | 'folder'
  }
  terminal: {
    shell: string
    fontSize: number
    fontFamily: string
    cursorStyle: 'block' | 'line' | 'underline'
  }
}

// Tipos para temas personalizados
export interface CustomTheme {
  id: string
  name: string
  description?: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
    textSecondary: string
    border: string
    error: string
    warning: string
    success: string
    info: string
  }
  typography: {
    fontFamily: string
    fontSize: {
      xs: string
      sm: string
      base: string
      lg: string
      xl: string
      '2xl': string
      '3xl': string
    }
    fontWeight: {
      light: number
      normal: number
      medium: number
      bold: number
    }
    lineHeight: {
      tight: number
      normal: number
      relaxed: number
    }
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
    '2xl': string
  }
  borderRadius: {
    none: string
    sm: string
    md: string
    lg: string
    full: string
  }
  shadows: {
    sm: string
    md: string
    lg: string
    xl: string
  }
  isDefault: boolean
  isPublic: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

// Tipos para histórico de preferências
export interface PreferencesHistory {
  id: string
  userId: string
  changes: Array<{
    field: string
    oldValue: any
    newValue: any
    timestamp: string
  }>
  source: 'user' | 'system' | 'import' | 'sync'
  device?: {
    type: 'desktop' | 'mobile' | 'tablet'
    os: string
    browser: string
  }
  createdAt: string
}

// Tipos para sincronização
export interface PreferencesSync {
  enabled: boolean
  devices: Array<{
    id: string
    name: string
    type: 'desktop' | 'mobile' | 'tablet'
    lastSync: string
    status: 'synced' | 'pending' | 'conflict' | 'error'
  }>
  conflicts: Array<{
    field: string
    localValue: any
    remoteValue: any
    timestamp: string
    resolved: boolean
  }>
  strategy: 'merge' | 'overwrite' | 'manual'
}

// Tipos auxiliares
export type ThemeMode = 'light' | 'dark' | 'system' | 'auto'
export type FontSize = 'small' | 'medium' | 'large' | 'extra-large'
export type Density = 'compact' | 'comfortable' | 'spacious'
export type TimeFormat = '12h' | '24h'
export type SyncStrategy = 'merge' | 'overwrite' | 'manual'

// Tipos para atualizações
export interface SystemPreferencesUpdate {
  general?: Partial<GeneralPreferences>
  theme?: Partial<ThemePreferences>
  localization?: Partial<LocalizationPreferences>
  accessibility?: Partial<AccessibilityPreferences>
  privacy?: Partial<PrivacyPreferences>
  performance?: Partial<PerformancePreferences>
  notifications?: Partial<NotificationPreferences>
  shortcuts?: Partial<ShortcutPreferences>
  workspace?: Partial<WorkspacePreferences>
}

// Tipos para validação
export interface PreferencesValidation {
  field: string
  valid: boolean
  message?: string
  suggestions?: any[]
}

export interface PreferencesValidationResult {
  valid: boolean
  errors: PreferencesValidation[]
  warnings: PreferencesValidation[]
}

// Tipos para exportação/importação
export interface PreferencesExport {
  preferences: SystemPreferences
  themes: CustomTheme[]
  shortcuts: ShortcutPreferences
  metadata: {
    exportedAt: string
    exportedBy: string
    version: string
    device: {
      type: string
      os: string
      browser: string
    }
  }
}

export interface PreferencesImport {
  preferences?: Partial<SystemPreferences>
  themes?: CustomTheme[]
  shortcuts?: ShortcutPreferences
  overwrite: boolean
  merge: boolean
}

// Tipos para detecção automática
export interface BrowserSettings {
  language: string
  timezone: string
  colorScheme: 'light' | 'dark'
  reducedMotion: boolean
  highContrast: boolean
  cookiesEnabled: boolean
  localStorage: boolean
  sessionStorage: boolean
  webGL: boolean
  touchSupport: boolean
  screenSize: {
    width: number
    height: number
    pixelRatio: number
  }
}

// Tipos para idiomas disponíveis
export interface AvailableLanguage {
  code: string
  name: string
  nativeName: string
  region: string
  rtl: boolean
  completeness: number // porcentagem de tradução
  flag?: string
}

// Tipos para fusos horários
export interface AvailableTimezone {
  id: string
  name: string
  offset: string
  country: string
  region: string
  abbreviation: string
}

// Tipos para temas disponíveis
export interface AvailableTheme {
  id: string
  name: string
  description: string
  preview: string
  category: 'light' | 'dark' | 'colorful' | 'minimal'
  popularity: number
  isDefault: boolean
  isPremium: boolean
}

// Tipos para conflitos de sincronização
export interface SyncConflict {
  field: string
  localValue: any
  remoteValue: any
  localTimestamp: string
  remoteTimestamp: string
  resolution?: 'local' | 'remote' | 'merge' | 'manual'
}

export interface ConflictResolution {
  conflicts: Array<{
    field: string
    resolution: 'local' | 'remote' | 'merge' | 'custom'
    customValue?: any
  }>
  strategy: SyncStrategy
}

// Tipos para métricas de preferências
export interface PreferencesMetrics {
  totalUsers: number
  activeUsers: number
  themeDistribution: Record<string, number>
  languageDistribution: Record<string, number>
  featureUsage: Record<string, number>
  syncStatus: {
    synced: number
    pending: number
    conflicts: number
    errors: number
  }
}