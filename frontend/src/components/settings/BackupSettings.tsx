'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { SettingsCard, SettingsSection, SettingsItem, SettingsGroup } from './SettingsCard';
import {
  HardDrive,
  Cloud,
  Shield,
  Clock,
  Database,
  FileText,
  Settings,
  Users,
  Activity,
  Download,
  Upload,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Eye,
  Calendar,
  Server,
  Key,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Archive,
  FolderOpen,
  Save,
  RefreshCw
} from 'lucide-react';

export interface BackupSettings {
  // Configurações Automáticas
  automatic: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string; // HH:MM format
    dayOfWeek?: number; // 0-6 (Sunday-Saturday) for weekly
    dayOfMonth?: number; // 1-31 for monthly
    maxConcurrent: number;
    retryAttempts: number;
    retryDelay: number; // minutes
  };
  
  // Armazenamento
  storage: {
    type: 'local' | 'cloud' | 'hybrid';
    localPath: string;
    cloudProvider?: 'aws' | 'google' | 'azure' | 'dropbox';
    cloudCredentials?: {
      accessKey?: string;
      secretKey?: string;
      bucket?: string;
      region?: string;
      endpoint?: string;
    };
    encryption: boolean;
    encryptionKey?: string;
    compression: boolean;
    compressionLevel: number; // 1-9
  };
  
  // Política de Retenção
  retention: {
    type: 'time' | 'count';
    timeValue?: number; // days
    countValue?: number; // number of backups
    deleteOldBackups: boolean;
    archiveBeforeDelete: boolean;
    archivePath?: string;
  };
  
  // Seleção de Dados
  dataSelection: {
    database: boolean;
    files: boolean;
    configurations: boolean;
    logs: boolean;
    userUploads: boolean;
    customPaths: string[];
    excludePaths: string[];
    includeSystemFiles: boolean;
  };
  
  // Notificações
  notifications: {
    onSuccess: boolean;
    onFailure: boolean;
    onWarning: boolean;
    emailRecipients: string[];
    webhookUrl?: string;
    slackChannel?: string;
  };
  
  // Monitoramento
  monitoring: {
    enableMetrics: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
    maxLogSize: number; // MB
    logRetention: number; // days
    healthChecks: boolean;
    alertThresholds: {
      failureRate: number; // percentage
      duration: number; // minutes
      storageUsage: number; // percentage
    };
  };
}

export interface BackupJob {
  id: string;
  type: 'manual' | 'scheduled';
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  duration?: number; // seconds
  size?: number; // bytes
  progress: number; // 0-100
  currentStep: string;
  totalSteps: number;
  completedSteps: number;
  error?: string;
  warnings: string[];
}

export interface BackupHistory {
  id: string;
  timestamp: Date;
  type: 'full' | 'incremental' | 'differential';
  status: 'success' | 'failed' | 'partial';
  size: number; // bytes
  duration: number; // seconds
  location: string;
  checksum: string;
  compressed: boolean;
  encrypted: boolean;
  dataTypes: string[];
  error?: string;
  warnings: string[];
}

export interface StorageUsage {
  total: number; // bytes
  used: number; // bytes
  available: number; // bytes
  backupCount: number;
  oldestBackup?: Date;
  newestBackup?: Date;
  averageSize: number; // bytes
  growthRate: number; // bytes per day
}

interface BackupSettingsProps {
  settings: BackupSettings;
  onSettingsChange: (settings: BackupSettings) => void;
  activeJobs?: BackupJob[];
  history?: BackupHistory[];
  storageUsage?: StorageUsage;
  onStartBackup?: (type: 'full' | 'incremental') => void;
  onCancelJob?: (jobId: string) => void;
  onDeleteBackup?: (backupId: string) => void;
  onRestoreBackup?: (backupId: string) => void;
  onTestConnection?: () => void;
  onSave?: () => void;
  onReset?: () => void;
  isLoading?: boolean;
  isDirty?: boolean;
}

const defaultBackupSettings: BackupSettings = {
  automatic: {
    enabled: true,
    frequency: 'daily',
    time: '02:00',
    maxConcurrent: 2,
    retryAttempts: 3,
    retryDelay: 15
  },
  storage: {
    type: 'local',
    localPath: '/var/backups/dataclinica',
    encryption: true,
    compression: true,
    compressionLevel: 6
  },
  retention: {
    type: 'time',
    timeValue: 30,
    deleteOldBackups: true,
    archiveBeforeDelete: false
  },
  dataSelection: {
    database: true,
    files: true,
    configurations: true,
    logs: false,
    userUploads: true,
    customPaths: [],
    excludePaths: ['/tmp', '/cache'],
    includeSystemFiles: false
  },
  notifications: {
    onSuccess: false,
    onFailure: true,
    onWarning: true,
    emailRecipients: []
  },
  monitoring: {
    enableMetrics: true,
    logLevel: 'info',
    maxLogSize: 100,
    logRetention: 7,
    healthChecks: true,
    alertThresholds: {
      failureRate: 10,
      duration: 120,
      storageUsage: 85
    }
  }
};

const cloudProviders = {
  aws: { name: 'Amazon S3', icon: Cloud },
  google: { name: 'Google Cloud Storage', icon: Cloud },
  azure: { name: 'Azure Blob Storage', icon: Cloud },
  dropbox: { name: 'Dropbox', icon: Cloud }
};

const frequencyOptions = {
  daily: 'Diário',
  weekly: 'Semanal',
  monthly: 'Mensal'
};

const statusColors = {
  running: 'bg-blue-500',
  completed: 'bg-green-500',
  failed: 'bg-red-500',
  cancelled: 'bg-gray-500',
  success: 'bg-green-500',
  partial: 'bg-yellow-500'
};

const statusIcons = {
  running: Loader2,
  completed: CheckCircle,
  failed: XCircle,
  cancelled: XCircle,
  success: CheckCircle,
  partial: AlertTriangle
};

export function BackupSettings({
  settings,
  onSettingsChange,
  activeJobs = [],
  history = [],
  storageUsage,
  onStartBackup,
  onCancelJob,
  onDeleteBackup,
  onRestoreBackup,
  onTestConnection,
  onSave,
  onReset,
  isLoading = false,
  isDirty = false
}: BackupSettingsProps) {
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);
  const [showCredentials, setShowCredentials] = useState(false);

  const updateSetting = <T extends keyof BackupSettings>(
    section: T,
    key: keyof BackupSettings[T],
    value: any
  ) => {
    onSettingsChange({
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value
      }
    });
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}min ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}min`;
  };

  const getStorageUsagePercentage = () => {
    if (!storageUsage) return 0;
    return (storageUsage.used / storageUsage.total) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Header com Ações */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Configurações de Backup</h2>
          <p className="text-muted-foreground">Configure backup automático e políticas de retenção</p>
        </div>
        <div className="flex items-center gap-2">
          {onStartBackup && (
            <>
              <Button
                variant="outline"
                onClick={() => onStartBackup('incremental')}
                disabled={isLoading || activeJobs.length > 0}
              >
                <Zap className="h-4 w-4 mr-2" />
                Backup Incremental
              </Button>
              <Button
                onClick={() => onStartBackup('full')}
                disabled={isLoading || activeJobs.length > 0}
              >
                <Database className="h-4 w-4 mr-2" />
                Backup Completo
              </Button>
            </>
          )}
          {onReset && (
            <Button
              variant="outline"
              onClick={onReset}
              disabled={isLoading}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restaurar Padrões
            </Button>
          )}
          {onSave && (
            <Button
              onClick={onSave}
              disabled={isLoading || !isDirty}
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          )}
        </div>
      </div>

      {/* Jobs Ativos */}
      {activeJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Jobs Ativos ({activeJobs.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeJobs.map((job) => {
              const StatusIcon = statusIcons[job.status];
              return (
                <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <StatusIcon className={`h-5 w-5 ${job.status === 'running' ? 'animate-spin' : ''}`} />
                    <div>
                      <div className="font-medium">{job.type === 'manual' ? 'Manual' : 'Agendado'}</div>
                      <div className="text-sm text-muted-foreground">{job.currentStep}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">{job.progress}%</div>
                      <div className="text-xs text-muted-foreground">
                        {job.completedSteps}/{job.totalSteps} etapas
                      </div>
                    </div>
                    <Progress value={job.progress} className="w-24" />
                    {job.status === 'running' && onCancelJob && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onCancelJob(job.id)}
                      >
                        <Pause className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="automatic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="automatic">Automático</TabsTrigger>
          <TabsTrigger value="storage">Armazenamento</TabsTrigger>
          <TabsTrigger value="data">Dados</TabsTrigger>
          <TabsTrigger value="retention">Retenção</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        {/* Backup Automático */}
        <TabsContent value="automatic" className="space-y-6">
          <SettingsGroup title="Backup Automático" description="Configure agendamento e execução automática">
            <SettingsCard
              title="Agendamento"
              description="Configure quando os backups devem ser executados"
              icon={Clock}
              status={settings.automatic.enabled ? 'active' : 'inactive'}
              statusText={settings.automatic.enabled ? 'Ativo' : 'Inativo'}
              headerAction={
                <Switch
                  checked={settings.automatic.enabled}
                  onCheckedChange={(checked) => updateSetting('automatic', 'enabled', checked)}
                  disabled={isLoading}
                />
              }
            >
              {settings.automatic.enabled && (
                <SettingsSection>
                  <div className="grid grid-cols-2 gap-4">
                    <SettingsItem label="Frequência" description="Com que frequência executar">
                      <Select
                        value={settings.automatic.frequency}
                        onValueChange={(value) => updateSetting('automatic', 'frequency', value as any)}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(frequencyOptions).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </SettingsItem>
                    
                    <SettingsItem label="Horário" description="Hora de execução">
                      <Input
                        type="time"
                        value={settings.automatic.time}
                        onChange={(e) => updateSetting('automatic', 'time', e.target.value)}
                        disabled={isLoading}
                        className="w-32"
                      />
                    </SettingsItem>
                  </div>
                  
                  {settings.automatic.frequency === 'weekly' && (
                    <SettingsItem label="Dia da Semana" description="Qual dia da semana executar">
                      <Select
                        value={settings.automatic.dayOfWeek?.toString() || '1'}
                        onValueChange={(value) => updateSetting('automatic', 'dayOfWeek', parseInt(value))}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Domingo</SelectItem>
                          <SelectItem value="1">Segunda</SelectItem>
                          <SelectItem value="2">Terça</SelectItem>
                          <SelectItem value="3">Quarta</SelectItem>
                          <SelectItem value="4">Quinta</SelectItem>
                          <SelectItem value="5">Sexta</SelectItem>
                          <SelectItem value="6">Sábado</SelectItem>
                        </SelectContent>
                      </Select>
                    </SettingsItem>
                  )}
                  
                  {settings.automatic.frequency === 'monthly' && (
                    <SettingsItem label="Dia do Mês" description="Qual dia do mês executar">
                      <Select
                        value={settings.automatic.dayOfMonth?.toString() || '1'}
                        onValueChange={(value) => updateSetting('automatic', 'dayOfMonth', parseInt(value))}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                            <SelectItem key={day} value={day.toString()}>{day}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </SettingsItem>
                  )}
                </SettingsSection>
              )}
            </SettingsCard>
            
            <SettingsCard
              title="Execução"
              description="Configure como os backups são executados"
              icon={Settings}
            >
              <SettingsSection>
                <div className="grid grid-cols-2 gap-4">
                  <SettingsItem label="Jobs Simultâneos" description="Máximo de backups simultâneos">
                    <Select
                      value={settings.automatic.maxConcurrent.toString()}
                      onValueChange={(value) => updateSetting('automatic', 'maxConcurrent', parseInt(value))}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map(count => (
                          <SelectItem key={count} value={count.toString()}>{count}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </SettingsItem>
                  
                  <SettingsItem label="Tentativas" description="Tentativas em caso de falha">
                    <Select
                      value={settings.automatic.retryAttempts.toString()}
                      onValueChange={(value) => updateSetting('automatic', 'retryAttempts', parseInt(value))}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 5, 10].map(count => (
                          <SelectItem key={count} value={count.toString()}>{count}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </SettingsItem>
                </div>
                
                <SettingsItem label="Intervalo entre Tentativas" description={`Aguardar ${settings.automatic.retryDelay} minutos entre tentativas`}>
                  <div className="w-48">
                    <Slider
                      value={[settings.automatic.retryDelay]}
                      onValueChange={([value]) => updateSetting('automatic', 'retryDelay', value)}
                      min={5}
                      max={60}
                      step={5}
                      disabled={isLoading}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>5min</span>
                      <span>1h</span>
                    </div>
                  </div>
                </SettingsItem>
              </SettingsSection>
            </SettingsCard>
          </SettingsGroup>
        </TabsContent>

        {/* Armazenamento */}
        <TabsContent value="storage" className="space-y-6">
          <SettingsGroup title="Configurações de Armazenamento" description="Configure onde e como os backups são armazenados">
            {/* Uso de Armazenamento */}
            {storageUsage && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HardDrive className="h-5 w-5" />
                    Uso de Armazenamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Usado: {formatBytes(storageUsage.used)}</span>
                      <span>Total: {formatBytes(storageUsage.total)}</span>
                    </div>
                    <Progress value={getStorageUsagePercentage()} className="h-2" />
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="font-medium">{storageUsage.backupCount}</div>
                        <div className="text-muted-foreground">Backups</div>
                      </div>
                      <div>
                        <div className="font-medium">{formatBytes(storageUsage.averageSize)}</div>
                        <div className="text-muted-foreground">Tamanho Médio</div>
                      </div>
                      <div>
                        <div className="font-medium">{formatBytes(storageUsage.growthRate)}</div>
                        <div className="text-muted-foreground">Crescimento/dia</div>
                      </div>
                      <div>
                        <div className="font-medium">{formatBytes(storageUsage.available)}</div>
                        <div className="text-muted-foreground">Disponível</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <SettingsCard
              title="Tipo de Armazenamento"
              description="Escolha onde armazenar os backups"
              icon={Server}
            >
              <SettingsSection>
                <SettingsItem label="Tipo" description="Local, nuvem ou híbrido">
                  <div className="flex gap-2">
                    {(['local', 'cloud', 'hybrid'] as const).map((type) => (
                      <Button
                        key={type}
                        variant={settings.storage.type === type ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateSetting('storage', 'type', type)}
                        disabled={isLoading}
                      >
                        {type === 'local' ? 'Local' : type === 'cloud' ? 'Nuvem' : 'Híbrido'}
                      </Button>
                    ))}
                  </div>
                </SettingsItem>
                
                {(settings.storage.type === 'local' || settings.storage.type === 'hybrid') && (
                  <SettingsItem label="Caminho Local" description="Diretório para armazenar backups">
                    <Input
                      value={settings.storage.localPath}
                      onChange={(e) => updateSetting('storage', 'localPath', e.target.value)}
                      disabled={isLoading}
                      placeholder="/var/backups/dataclinica"
                    />
                  </SettingsItem>
                )}
              </SettingsSection>
            </SettingsCard>
            
            {(settings.storage.type === 'cloud' || settings.storage.type === 'hybrid') && (
              <SettingsCard
                title="Configurações da Nuvem"
                description="Configure o provedor de nuvem"
                icon={Cloud}
                headerAction={
                  onTestConnection && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onTestConnection}
                      disabled={isLoading}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Testar Conexão
                    </Button>
                  )
                }
              >
                <SettingsSection>
                  <SettingsItem label="Provedor" description="Serviço de nuvem">
                    <Select
                      value={settings.storage.cloudProvider || ''}
                      onValueChange={(value) => updateSetting('storage', 'cloudProvider', value as any)}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Selecione um provedor" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(cloudProviders).map(([key, provider]) => (
                          <SelectItem key={key} value={key}>{provider.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </SettingsItem>
                  
                  {settings.storage.cloudProvider && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Credenciais</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowCredentials(!showCredentials)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {showCredentials ? 'Ocultar' : 'Mostrar'}
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Access Key</Label>
                          <Input
                            type={showCredentials ? 'text' : 'password'}
                            value={settings.storage.cloudCredentials?.accessKey || ''}
                            onChange={(e) => updateSetting('storage', 'cloudCredentials', {
                              ...settings.storage.cloudCredentials,
                              accessKey: e.target.value
                            })}
                            disabled={isLoading}
                            placeholder="Chave de acesso"
                          />
                        </div>
                        
                        <div>
                          <Label>Secret Key</Label>
                          <Input
                            type={showCredentials ? 'text' : 'password'}
                            value={settings.storage.cloudCredentials?.secretKey || ''}
                            onChange={(e) => updateSetting('storage', 'cloudCredentials', {
                              ...settings.storage.cloudCredentials,
                              secretKey: e.target.value
                            })}
                            disabled={isLoading}
                            placeholder="Chave secreta"
                          />
                        </div>
                        
                        <div>
                          <Label>Bucket/Container</Label>
                          <Input
                            value={settings.storage.cloudCredentials?.bucket || ''}
                            onChange={(e) => updateSetting('storage', 'cloudCredentials', {
                              ...settings.storage.cloudCredentials,
                              bucket: e.target.value
                            })}
                            disabled={isLoading}
                            placeholder="Nome do bucket"
                          />
                        </div>
                        
                        <div>
                          <Label>Região</Label>
                          <Input
                            value={settings.storage.cloudCredentials?.region || ''}
                            onChange={(e) => updateSetting('storage', 'cloudCredentials', {
                              ...settings.storage.cloudCredentials,
                              region: e.target.value
                            })}
                            disabled={isLoading}
                            placeholder="us-east-1"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </SettingsSection>
              </SettingsCard>
            )}
            
            <SettingsCard
              title="Segurança e Compressão"
              description="Configure criptografia e compressão"
              icon={Shield}
            >
              <SettingsSection>
                <div className="grid grid-cols-2 gap-4">
                  <SettingsItem label="Criptografia" description="Criptografar backups">
                    <Switch
                      checked={settings.storage.encryption}
                      onCheckedChange={(checked) => updateSetting('storage', 'encryption', checked)}
                      disabled={isLoading}
                    />
                  </SettingsItem>
                  
                  <SettingsItem label="Compressão" description="Comprimir backups">
                    <Switch
                      checked={settings.storage.compression}
                      onCheckedChange={(checked) => updateSetting('storage', 'compression', checked)}
                      disabled={isLoading}
                    />
                  </SettingsItem>
                </div>
                
                {settings.storage.encryption && (
                  <SettingsItem label="Chave de Criptografia" description="Chave para criptografar backups">
                    <Input
                      type={showCredentials ? 'text' : 'password'}
                      value={settings.storage.encryptionKey || ''}
                      onChange={(e) => updateSetting('storage', 'encryptionKey', e.target.value)}
                      disabled={isLoading}
                      placeholder="Chave de criptografia"
                    />
                  </SettingsItem>
                )}
                
                {settings.storage.compression && (
                  <SettingsItem label="Nível de Compressão" description={`Nível ${settings.storage.compressionLevel} (1=rápido, 9=máximo)`}>
                    <div className="w-48">
                      <Slider
                        value={[settings.storage.compressionLevel]}
                        onValueChange={([value]) => updateSetting('storage', 'compressionLevel', value)}
                        min={1}
                        max={9}
                        step={1}
                        disabled={isLoading}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Rápido</span>
                        <span>Máximo</span>
                      </div>
                    </div>
                  </SettingsItem>
                )}
              </SettingsSection>
            </SettingsCard>
          </SettingsGroup>
        </TabsContent>

        {/* Seleção de Dados */}
        <TabsContent value="data" className="space-y-6">
          <SettingsGroup title="Seleção de Dados" description="Escolha quais dados incluir nos backups">
            <SettingsCard
              title="Tipos de Dados"
              description="Selecione os tipos de dados para backup"
              icon={Database}
            >
              <SettingsSection>
                <div className="grid grid-cols-2 gap-4">
                  <SettingsItem label="Banco de Dados" description="Dados do banco principal">
                    <Switch
                      checked={settings.dataSelection.database}
                      onCheckedChange={(checked) => updateSetting('dataSelection', 'database', checked)}
                      disabled={isLoading}
                    />
                  </SettingsItem>
                  
                  <SettingsItem label="Arquivos" description="Arquivos do sistema">
                    <Switch
                      checked={settings.dataSelection.files}
                      onCheckedChange={(checked) => updateSetting('dataSelection', 'files', checked)}
                      disabled={isLoading}
                    />
                  </SettingsItem>
                  
                  <SettingsItem label="Configurações" description="Arquivos de configuração">
                    <Switch
                      checked={settings.dataSelection.configurations}
                      onCheckedChange={(checked) => updateSetting('dataSelection', 'configurations', checked)}
                      disabled={isLoading}
                    />
                  </SettingsItem>
                  
                  <SettingsItem label="Logs" description="Arquivos de log">
                    <Switch
                      checked={settings.dataSelection.logs}
                      onCheckedChange={(checked) => updateSetting('dataSelection', 'logs', checked)}
                      disabled={isLoading}
                    />
                  </SettingsItem>
                  
                  <SettingsItem label="Uploads de Usuários" description="Arquivos enviados pelos usuários">
                    <Switch
                      checked={settings.dataSelection.userUploads}
                      onCheckedChange={(checked) => updateSetting('dataSelection', 'userUploads', checked)}
                      disabled={isLoading}
                    />
                  </SettingsItem>
                  
                  <SettingsItem label="Arquivos de Sistema" description="Arquivos do sistema operacional">
                    <Switch
                      checked={settings.dataSelection.includeSystemFiles}
                      onCheckedChange={(checked) => updateSetting('dataSelection', 'includeSystemFiles', checked)}
                      disabled={isLoading}
                    />
                  </SettingsItem>
                </div>
              </SettingsSection>
            </SettingsCard>
            
            <SettingsCard
              title="Caminhos Personalizados"
              description="Adicione caminhos específicos para incluir ou excluir"
              icon={FolderOpen}
            >
              <SettingsSection>
                <SettingsItem label="Incluir Caminhos" description="Caminhos adicionais para backup">
                  <Textarea
                    value={settings.dataSelection.customPaths.join('\n')}
                    onChange={(e) => updateSetting('dataSelection', 'customPaths', e.target.value.split('\n').filter(Boolean))}
                    disabled={isLoading}
                    placeholder="/caminho/personalizado1\n/caminho/personalizado2"
                    rows={3}
                  />
                </SettingsItem>
                
                <SettingsItem label="Excluir Caminhos" description="Caminhos para ignorar no backup">
                  <Textarea
                    value={settings.dataSelection.excludePaths.join('\n')}
                    onChange={(e) => updateSetting('dataSelection', 'excludePaths', e.target.value.split('\n').filter(Boolean))}
                    disabled={isLoading}
                    placeholder="/tmp\n/cache\n*.log"
                    rows={3}
                  />
                </SettingsItem>
              </SettingsSection>
            </SettingsCard>
          </SettingsGroup>
        </TabsContent>

        {/* Política de Retenção */}
        <TabsContent value="retention" className="space-y-6">
          <SettingsGroup title="Política de Retenção" description="Configure por quanto tempo manter os backups">
            <SettingsCard
              title="Retenção"
              description="Defina por quanto tempo manter os backups"
              icon={Archive}
            >
              <SettingsSection>
                <SettingsItem label="Tipo de Retenção" description="Por tempo ou quantidade">
                  <div className="flex gap-2">
                    {(['time', 'count'] as const).map((type) => (
                      <Button
                        key={type}
                        variant={settings.retention.type === type ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateSetting('retention', 'type', type)}
                        disabled={isLoading}
                      >
                        {type === 'time' ? 'Por Tempo' : 'Por Quantidade'}
                      </Button>
                    ))}
                  </div>
                </SettingsItem>
                
                {settings.retention.type === 'time' ? (
                  <SettingsItem label="Manter por" description="Número de dias para manter">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={settings.retention.timeValue || 30}
                        onChange={(e) => updateSetting('retention', 'timeValue', parseInt(e.target.value))}
                        disabled={isLoading}
                        min={1}
                        max={365}
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground">dias</span>
                    </div>
                  </SettingsItem>
                ) : (
                  <SettingsItem label="Manter" description="Número de backups para manter">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={settings.retention.countValue || 10}
                        onChange={(e) => updateSetting('retention', 'countValue', parseInt(e.target.value))}
                        disabled={isLoading}
                        min={1}
                        max={100}
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground">backups</span>
                    </div>
                  </SettingsItem>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <SettingsItem label="Deletar Automaticamente" description="Remover backups antigos">
                    <Switch
                      checked={settings.retention.deleteOldBackups}
                      onCheckedChange={(checked) => updateSetting('retention', 'deleteOldBackups', checked)}
                      disabled={isLoading}
                    />
                  </SettingsItem>
                  
                  <SettingsItem label="Arquivar Antes de Deletar" description="Mover para arquivo antes de deletar">
                    <Switch
                      checked={settings.retention.archiveBeforeDelete}
                      onCheckedChange={(checked) => updateSetting('retention', 'archiveBeforeDelete', checked)}
                      disabled={isLoading}
                    />
                  </SettingsItem>
                </div>
                
                {settings.retention.archiveBeforeDelete && (
                  <SettingsItem label="Caminho do Arquivo" description="Onde armazenar backups arquivados">
                    <Input
                      value={settings.retention.archivePath || ''}
                      onChange={(e) => updateSetting('retention', 'archivePath', e.target.value)}
                      disabled={isLoading}
                      placeholder="/var/archives/dataclinica"
                    />
                  </SettingsItem>
                )}
              </SettingsSection>
            </SettingsCard>
          </SettingsGroup>
        </TabsContent>

        {/* Monitoramento */}
        <TabsContent value="monitoring" className="space-y-6">
          <SettingsGroup title="Monitoramento e Alertas" description="Configure monitoramento e notificações">
            <SettingsCard
              title="Notificações"
              description="Configure quando receber notificações"
              icon={Bell}
            >
              <SettingsSection>
                <div className="grid grid-cols-3 gap-4">
                  <SettingsItem label="Sucesso" description="Backup concluído com sucesso">
                    <Switch
                      checked={settings.notifications.onSuccess}
                      onCheckedChange={(checked) => updateSetting('notifications', 'onSuccess', checked)}
                      disabled={isLoading}
                    />
                  </SettingsItem>
                  
                  <SettingsItem label="Falha" description="Backup falhou">
                    <Switch
                      checked={settings.notifications.onFailure}
                      onCheckedChange={(checked) => updateSetting('notifications', 'onFailure', checked)}
                      disabled={isLoading}
                    />
                  </SettingsItem>
                  
                  <SettingsItem label="Aviso" description="Backup com avisos">
                    <Switch
                      checked={settings.notifications.onWarning}
                      onCheckedChange={(checked) => updateSetting('notifications', 'onWarning', checked)}
                      disabled={isLoading}
                    />
                  </SettingsItem>
                </div>
                
                <SettingsItem label="Destinatários de Email" description="Emails para receber notificações">
                  <Textarea
                    value={settings.notifications.emailRecipients.join('\n')}
                    onChange={(e) => updateSetting('notifications', 'emailRecipients', e.target.value.split('\n').filter(Boolean))}
                    disabled={isLoading}
                    placeholder="admin@dataclinica.com\nbackup@dataclinica.com"
                    rows={3}
                  />
                </SettingsItem>
                
                <div className="grid grid-cols-2 gap-4">
                  <SettingsItem label="Webhook URL" description="URL para notificações webhook">
                    <Input
                      value={settings.notifications.webhookUrl || ''}
                      onChange={(e) => updateSetting('notifications', 'webhookUrl', e.target.value)}
                      disabled={isLoading}
                      placeholder="https://hooks.slack.com/..."
                    />
                  </SettingsItem>
                  
                  <SettingsItem label="Canal Slack" description="Canal para notificações Slack">
                    <Input
                      value={settings.notifications.slackChannel || ''}
                      onChange={(e) => updateSetting('notifications', 'slackChannel', e.target.value)}
                      disabled={isLoading}
                      placeholder="#backups"
                    />
                  </SettingsItem>
                </div>
              </SettingsSection>
            </SettingsCard>
            
            <SettingsCard
              title="Logs e Métricas"
              description="Configure logging e coleta de métricas"
              icon={Activity}
              status={settings.monitoring.enableMetrics ? 'active' : 'inactive'}
              statusText={settings.monitoring.enableMetrics ? 'Ativo' : 'Inativo'}
              headerAction={
                <Switch
                  checked={settings.monitoring.enableMetrics}
                  onCheckedChange={(checked) => updateSetting('monitoring', 'enableMetrics', checked)}
                  disabled={isLoading}
                />
              }
            >
              <SettingsSection>
                <div className="grid grid-cols-2 gap-4">
                  <SettingsItem label="Nível de Log" description="Detalhamento dos logs">
                    <Select
                      value={settings.monitoring.logLevel}
                      onValueChange={(value) => updateSetting('monitoring', 'logLevel', value as any)}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="warn">Warning</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="debug">Debug</SelectItem>
                      </SelectContent>
                    </Select>
                  </SettingsItem>
                  
                  <SettingsItem label="Tamanho Máximo" description="Tamanho máximo dos logs">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={settings.monitoring.maxLogSize}
                        onChange={(e) => updateSetting('monitoring', 'maxLogSize', parseInt(e.target.value))}
                        disabled={isLoading}
                        min={10}
                        max={1000}
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground">MB</span>
                    </div>
                  </SettingsItem>
                  
                  <SettingsItem label="Retenção de Logs" description="Por quantos dias manter logs">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={settings.monitoring.logRetention}
                        onChange={(e) => updateSetting('monitoring', 'logRetention', parseInt(e.target.value))}
                        disabled={isLoading}
                        min={1}
                        max={365}
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground">dias</span>
                    </div>
                  </SettingsItem>
                  
                  <SettingsItem label="Health Checks" description="Verificações de saúde">
                    <Switch
                      checked={settings.monitoring.healthChecks}
                      onCheckedChange={(checked) => updateSetting('monitoring', 'healthChecks', checked)}
                      disabled={isLoading}
                    />
                  </SettingsItem>
                </div>
              </SettingsSection>
            </SettingsCard>
            
            <SettingsCard
              title="Limites de Alerta"
              description="Configure quando disparar alertas"
              icon={AlertTriangle}
            >
              <SettingsSection>
                <div className="grid grid-cols-3 gap-4">
                  <SettingsItem label="Taxa de Falha" description="Percentual de falhas para alertar">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={settings.monitoring.alertThresholds.failureRate}
                        onChange={(e) => updateSetting('monitoring', 'alertThresholds', {
                          ...settings.monitoring.alertThresholds,
                          failureRate: parseInt(e.target.value)
                        })}
                        disabled={isLoading}
                        min={1}
                        max={100}
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  </SettingsItem>
                  
                  <SettingsItem label="Duração" description="Tempo máximo de backup">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={settings.monitoring.alertThresholds.duration}
                        onChange={(e) => updateSetting('monitoring', 'alertThresholds', {
                          ...settings.monitoring.alertThresholds,
                          duration: parseInt(e.target.value)
                        })}
                        disabled={isLoading}
                        min={30}
                        max={1440}
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground">min</span>
                    </div>
                  </SettingsItem>
                  
                  <SettingsItem label="Uso de Armazenamento" description="Percentual de uso para alertar">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={settings.monitoring.alertThresholds.storageUsage}
                        onChange={(e) => updateSetting('monitoring', 'alertThresholds', {
                          ...settings.monitoring.alertThresholds,
                          storageUsage: parseInt(e.target.value)
                        })}
                        disabled={isLoading}
                        min={50}
                        max={95}
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  </SettingsItem>
                </div>
              </SettingsSection>
            </SettingsCard>
          </SettingsGroup>
        </TabsContent>

        {/* Histórico */}
        <TabsContent value="history" className="space-y-6">
          <SettingsGroup title="Histórico de Backups" description="Visualize e gerencie backups anteriores">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Histórico de Backups ({history.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum backup encontrado</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.slice(0, 10).map((backup) => {
                      const StatusIcon = statusIcons[backup.status];
                      return (
                        <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <StatusIcon className="h-5 w-5" />
                            <div>
                              <div className="font-medium">
                                {backup.type === 'full' ? 'Completo' : backup.type === 'incremental' ? 'Incremental' : 'Diferencial'}
                                <Badge variant="outline" className="ml-2">
                                  {backup.status === 'success' ? 'Sucesso' : backup.status === 'failed' ? 'Falha' : 'Parcial'}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {backup.timestamp.toLocaleString()} • {formatBytes(backup.size)} • {formatDuration(backup.duration)}
                              </div>
                              {backup.dataTypes.length > 0 && (
                                <div className="flex gap-1 mt-1">
                                  {backup.dataTypes.map(type => (
                                    <Badge key={type} variant="secondary" className="text-xs">{type}</Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {onRestoreBackup && backup.status === 'success' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onRestoreBackup(backup.id)}
                                disabled={isLoading}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Restaurar
                              </Button>
                            )}
                            {onDeleteBackup && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onDeleteBackup(backup.id)}
                                disabled={isLoading}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    
                    {history.length > 10 && (
                      <div className="text-center pt-4">
                        <Button variant="outline">
                          Ver Mais ({history.length - 10} restantes)
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </SettingsGroup>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export { defaultBackupSettings };
export type { BackupSettings, BackupJob, BackupHistory, StorageUsage };