export interface BackupSettings {
  id: string;
  organizationId: string;
  
  // Backup Automático
  automatic: AutomaticBackupSettings;
  
  // Armazenamento
  storage: StorageSettings;
  
  // Política de Retenção
  retention: RetentionSettings;
  
  // Seleção de Dados
  dataSelection: DataSelectionSettings;
  
  // Notificações
  notifications: BackupNotificationSettings;
  
  // Monitoramento
  monitoring: BackupMonitoringSettings;
  
  updatedAt: string;
  updatedBy: string;
}

export interface AutomaticBackupSettings {
  enabled: boolean;
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  time: string; // HH:mm
  dayOfWeek?: number; // 0-6 (Sunday-Saturday)
  dayOfMonth?: number; // 1-31
  maxRetries: number;
  retryInterval: number; // minutes
  parallelBackups: boolean;
  maxParallelJobs: number;
}

export interface StorageSettings {
  type: 'local' | 'cloud' | 'hybrid';
  
  // Local Storage
  localPath?: string;
  localMaxSize?: number; // GB
  
  // Cloud Storage
  cloudProvider?: 'aws' | 'google' | 'azure' | 'dropbox' | 'custom';
  cloudCredentials?: CloudCredentials;
  
  // Encryption
  encryption: {
    enabled: boolean;
    algorithm: 'AES-256' | 'AES-128' | 'ChaCha20';
    keyRotation: boolean;
    keyRotationInterval: number; // days
  };
  
  // Compression
  compression: {
    enabled: boolean;
    algorithm: 'gzip' | 'bzip2' | 'lz4' | 'zstd';
    level: number; // 1-9
  };
}

export interface CloudCredentials {
  // AWS
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
  awsRegion?: string;
  awsBucket?: string;
  
  // Google Cloud
  googleProjectId?: string;
  googleKeyFile?: string;
  googleBucket?: string;
  
  // Azure
  azureAccountName?: string;
  azureAccountKey?: string;
  azureContainer?: string;
  
  // Dropbox
  dropboxAccessToken?: string;
  dropboxAppKey?: string;
  dropboxAppSecret?: string;
  
  // Custom
  customEndpoint?: string;
  customAccessKey?: string;
  customSecretKey?: string;
}

export interface RetentionSettings {
  policy: 'time' | 'count' | 'size';
  
  // Time-based retention
  retentionDays?: number;
  
  // Count-based retention
  maxBackups?: number;
  
  // Size-based retention
  maxTotalSize?: number; // GB
  
  // Advanced retention
  archiveOldBackups: boolean;
  archiveAfterDays?: number;
  deleteArchivedAfterDays?: number;
  
  // Lifecycle rules
  lifecycleRules: RetentionRule[];
}

export interface RetentionRule {
  id: string;
  name: string;
  condition: {
    age?: number; // days
    size?: number; // GB
    type?: string;
  };
  action: 'archive' | 'delete' | 'move';
  target?: string; // for move action
}

export interface DataSelectionSettings {
  database: {
    enabled: boolean;
    tables: string[];
    excludeTables: string[];
    includeSchema: boolean;
    includeData: boolean;
  };
  
  files: {
    enabled: boolean;
    paths: string[];
    excludePaths: string[];
    includeHidden: boolean;
    followSymlinks: boolean;
    maxFileSize: number; // MB
  };
  
  configurations: {
    enabled: boolean;
    includeSecrets: boolean;
    configPaths: string[];
  };
  
  logs: {
    enabled: boolean;
    logPaths: string[];
    maxLogAge: number; // days
  };
  
  userUploads: {
    enabled: boolean;
    uploadPaths: string[];
    includeTemporary: boolean;
  };
  
  customPaths: string[];
}

export interface BackupNotificationSettings {
  onSuccess: boolean;
  onFailure: boolean;
  onWarning: boolean;
  
  emailRecipients: string[];
  webhookUrl?: string;
  slackWebhook?: string;
  
  includeDetails: boolean;
  includeStatistics: boolean;
}

export interface BackupMonitoringSettings {
  healthChecks: boolean;
  healthCheckInterval: number; // minutes
  
  logging: {
    level: 'error' | 'warn' | 'info' | 'debug';
    maxLogSize: number; // MB
    logRetention: number; // days
  };
  
  alerts: {
    failureRateThreshold: number; // percentage
    durationThreshold: number; // minutes
    storageUsageThreshold: number; // percentage
  };
}

export interface BackupJob {
  id: string;
  type: 'full' | 'incremental' | 'differential' | 'manual';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: string;
  completedAt?: string;
  duration?: number; // seconds
  
  // Statistics
  stats: BackupJobStats;
  
  // Progress
  progress: {
    percentage: number;
    currentStep: string;
    totalSteps: number;
    completedSteps: number;
  };
  
  // Error information
  error?: string;
  warnings: string[];
  
  // Metadata
  triggeredBy: 'schedule' | 'manual' | 'api';
  userId?: string;
  settings: Partial<BackupSettings>;
}

export interface BackupJobStats {
  totalFiles: number;
  processedFiles: number;
  skippedFiles: number;
  failedFiles: number;
  totalSize: number; // bytes
  processedSize: number; // bytes
  compressedSize: number; // bytes
  compressionRatio: number;
  transferSpeed: number; // bytes/second
}

export interface BackupHistory {
  id: string;
  jobId: string;
  type: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  size: number; // bytes
  compressedSize: number; // bytes
  location: string;
  checksum: string;
  restorable: boolean;
  metadata: Record<string, any>;
}

export interface BackupRestore {
  id: string;
  backupId: string;
  type: 'full' | 'partial' | 'selective';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: string;
  completedAt?: string;
  duration?: number;
  
  // Restore options
  options: {
    overwrite: boolean;
    restorePath?: string;
    selectedItems?: string[];
    restorePermissions: boolean;
    restoreTimestamps: boolean;
  };
  
  // Progress
  progress: {
    percentage: number;
    currentItem: string;
    totalItems: number;
    completedItems: number;
  };
  
  // Results
  restoredFiles: number;
  skippedFiles: number;
  failedFiles: number;
  error?: string;
  warnings: string[];
}

export interface StorageUsage {
  total: number; // bytes
  used: number; // bytes
  available: number; // bytes
  percentage: number;
  
  byType: {
    database: number;
    files: number;
    logs: number;
    configurations: number;
    other: number;
  };
  
  byAge: {
    last24h: number;
    last7d: number;
    last30d: number;
    older: number;
  };
  
  trend: {
    daily: number; // bytes per day
    weekly: number; // bytes per week
    monthly: number; // bytes per month
  };
}

export interface BackupSettingsUpdateRequest {
  settings: Partial<BackupSettings>;
  category?: string;
}

export interface BackupSettingsResponse {
  success: boolean;
  data?: BackupSettings;
  message?: string;
  errors?: Record<string, string>;
}

export interface BackupJobResponse {
  success: boolean;
  data?: BackupJob;
  message?: string;
}

export interface BackupHistoryResponse {
  success: boolean;
  data?: {
    backups: BackupHistory[];
    total: number;
    page: number;
    limit: number;
  };
  message?: string;
}

export interface BackupRestoreResponse {
  success: boolean;
  data?: BackupRestore;
  message?: string;
}

export interface StorageUsageResponse {
  success: boolean;
  data?: StorageUsage;
  message?: string;
}