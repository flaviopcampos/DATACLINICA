'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Database,
  HardDrive,
  Cloud,
  Clock,
  Shield,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Settings,
  History,
  Trash2,
  Play,
  Pause,
  ArrowLeft,
  Save,
  RotateCcw,
  Calendar,
  FileText,
  Folder,
  Server,
  Wifi,
  WifiOff,
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertCircle,
  Timer,
  Zap,
  Archive,
  Lock,
  Unlock,
  Globe,
  MapPin,
  Users,
  Activity,
  BarChart3,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import Link from 'next/link';

interface BackupSettings {
  // Configurações Gerais
  autoBackupEnabled: boolean;
  backupFrequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  backupTime: string; // HH:MM
  backupDays: string[]; // ['monday', 'tuesday', ...]
  
  // Armazenamento
  storageType: 'local' | 'cloud' | 'hybrid';
  localPath: string;
  cloudProvider: 'aws' | 'google' | 'azure' | 'dropbox';
  cloudCredentials: {
    accessKey: string;
    secretKey: string;
    bucket: string;
    region: string;
  };
  
  // Retenção
  retentionPolicy: 'time' | 'count';
  retentionDays: number;
  retentionCount: number;
  compressBackups: boolean;
  encryptBackups: boolean;
  encryptionKey: string;
  
  // Dados para Backup
  includeDatabase: boolean;
  includeFiles: boolean;
  includeConfigurations: boolean;
  includeLogs: boolean;
  includeUserData: boolean;
  
  // Notificações
  notifyOnSuccess: boolean;
  notifyOnFailure: boolean;
  notificationEmail: string;
  notificationWebhook: string;
  
  // Verificação
  verifyIntegrity: boolean;
  testRestore: boolean;
  testRestoreFrequency: 'weekly' | 'monthly';
}

interface BackupJob {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'differential';
  status: 'running' | 'completed' | 'failed' | 'scheduled' | 'paused';
  startTime: string;
  endTime?: string;
  duration?: string;
  size: string;
  progress: number;
  filesCount: number;
  errorCount: number;
  location: string;
  nextRun?: string;
}

interface BackupHistory {
  id: string;
  date: string;
  type: 'full' | 'incremental' | 'differential';
  status: 'success' | 'failed' | 'partial';
  size: string;
  duration: string;
  filesCount: number;
  location: string;
  verified: boolean;
  canRestore: boolean;
}

const defaultSettings: BackupSettings = {
  autoBackupEnabled: true,
  backupFrequency: 'daily',
  backupTime: '02:00',
  backupDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  storageType: 'hybrid',
  localPath: '/backups',
  cloudProvider: 'aws',
  cloudCredentials: {
    accessKey: '',
    secretKey: '',
    bucket: '',
    region: 'us-east-1'
  },
  retentionPolicy: 'time',
  retentionDays: 30,
  retentionCount: 10,
  compressBackups: true,
  encryptBackups: true,
  encryptionKey: '',
  includeDatabase: true,
  includeFiles: true,
  includeConfigurations: true,
  includeLogs: false,
  includeUserData: true,
  notifyOnSuccess: false,
  notifyOnFailure: true,
  notificationEmail: '',
  notificationWebhook: '',
  verifyIntegrity: true,
  testRestore: true,
  testRestoreFrequency: 'monthly'
};

const mockBackupJobs: BackupJob[] = [
  {
    id: '1',
    name: 'Backup Completo Diário',
    type: 'full',
    status: 'completed',
    startTime: '2024-01-15 02:00:00',
    endTime: '2024-01-15 02:45:00',
    duration: '45m 23s',
    size: '2.3 GB',
    progress: 100,
    filesCount: 15420,
    errorCount: 0,
    location: 'AWS S3 / Local',
    nextRun: '2024-01-16 02:00:00'
  },
  {
    id: '2',
    name: 'Backup Incremental',
    type: 'incremental',
    status: 'running',
    startTime: '2024-01-15 14:30:00',
    duration: '12m 45s',
    size: '156 MB',
    progress: 75,
    filesCount: 1250,
    errorCount: 0,
    location: 'Local Storage'
  },
  {
    id: '3',
    name: 'Backup de Configurações',
    type: 'differential',
    status: 'scheduled',
    startTime: '2024-01-15 18:00:00',
    size: '0 MB',
    progress: 0,
    filesCount: 0,
    errorCount: 0,
    location: 'AWS S3',
    nextRun: '2024-01-15 18:00:00'
  }
];

const mockBackupHistory: BackupHistory[] = [
  {
    id: '1',
    date: '2024-01-15 02:00:00',
    type: 'full',
    status: 'success',
    size: '2.3 GB',
    duration: '45m 23s',
    filesCount: 15420,
    location: 'AWS S3 / Local',
    verified: true,
    canRestore: true
  },
  {
    id: '2',
    date: '2024-01-14 02:00:00',
    type: 'full',
    status: 'success',
    size: '2.2 GB',
    duration: '42m 15s',
    filesCount: 15380,
    location: 'AWS S3 / Local',
    verified: true,
    canRestore: true
  },
  {
    id: '3',
    date: '2024-01-13 14:30:00',
    type: 'incremental',
    status: 'failed',
    size: '0 MB',
    duration: '2m 10s',
    filesCount: 0,
    location: 'Local Storage',
    verified: false,
    canRestore: false
  },
  {
    id: '4',
    date: '2024-01-13 02:00:00',
    type: 'full',
    status: 'success',
    size: '2.1 GB',
    duration: '41m 30s',
    filesCount: 15200,
    location: 'AWS S3 / Local',
    verified: true,
    canRestore: true
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
    case 'success': return 'bg-green-100 text-green-800';
    case 'running': return 'bg-blue-100 text-blue-800';
    case 'failed': return 'bg-red-100 text-red-800';
    case 'scheduled': return 'bg-yellow-100 text-yellow-800';
    case 'paused': return 'bg-gray-100 text-gray-800';
    case 'partial': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
    case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'running': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
    case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
    case 'scheduled': return <Clock className="h-4 w-4 text-yellow-500" />;
    case 'paused': return <Pause className="h-4 w-4 text-gray-500" />;
    case 'partial': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    default: return <Info className="h-4 w-4 text-gray-500" />;
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'full': return <Database className="h-4 w-4" />;
    case 'incremental': return <TrendingUp className="h-4 w-4" />;
    case 'differential': return <TrendingDown className="h-4 w-4" />;
    default: return <Archive className="h-4 w-4" />;
  }
};

export default function BackupSettingsPage() {
  const [settings, setSettings] = useState<BackupSettings>(defaultSettings);
  const [backupJobs] = useState<BackupJob[]>(mockBackupJobs);
  const [backupHistory] = useState<BackupHistory[]>(mockBackupHistory);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const updateSetting = <K extends keyof BackupSettings>(
    key: K,
    value: BackupSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const updateCloudCredential = (key: keyof BackupSettings['cloudCredentials'], value: string) => {
    setSettings(prev => ({
      ...prev,
      cloudCredentials: {
        ...prev.cloudCredentials,
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHasChanges(false);
      console.log('Configurações de backup salvas:', settings);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (confirm('Tem certeza que deseja restaurar as configurações padrão?')) {
      setSettings(defaultSettings);
      setHasChanges(true);
    }
  };

  const handleRunBackup = (type: 'full' | 'incremental' | 'differential') => {
    console.log(`Executando backup ${type}...`);
    // Implementar lógica de backup
  };

  const handleRestoreBackup = (backupId: string) => {
    if (confirm('Tem certeza que deseja restaurar este backup? Esta ação não pode ser desfeita.')) {
      console.log(`Restaurando backup ${backupId}...`);
      // Implementar lógica de restauração
    }
  };

  const handleCopyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
    }
  };

  const calculateStorageUsage = () => {
    const totalSize = backupHistory.reduce((acc, backup) => {
      const sizeInMB = parseFloat(backup.size.replace(/[^0-9.]/g, '')) * 
        (backup.size.includes('GB') ? 1024 : 1);
      return acc + sizeInMB;
    }, 0);
    return (totalSize / 1024).toFixed(2); // GB
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/settings">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Database className="h-8 w-8 text-primary" />
              Configurações de Backup
            </h1>
            <p className="text-muted-foreground mt-2">
              Configure backup automático e políticas de retenção
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Restaurar Padrões
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Último Backup</p>
                <p className="font-semibold">Hoje às 02:00</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <HardDrive className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Armazenamento</p>
                <p className="font-semibold">{calculateStorageUsage()} GB</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Archive className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Backups</p>
                <p className="font-semibold">{backupHistory.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Próximo</p>
                <p className="font-semibold">Amanhã 02:00</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Backup Status Alert */}
      <Alert>
        <Database className="h-4 w-4" />
        <AlertDescription>
          Backup automático está ativo. Próximo backup completo agendado para amanhã às 02:00.
        </AlertDescription>
      </Alert>

      {/* Backup Tabs */}
      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
          <TabsTrigger value="jobs" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Jobs Ativos
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Histórico
          </TabsTrigger>
          <TabsTrigger value="storage" className="flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            Armazenamento
          </TabsTrigger>
          <TabsTrigger value="restore" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Restaurar
          </TabsTrigger>
        </TabsList>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Backup Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Agendamento
                </CardTitle>
                <CardDescription>
                  Configure quando os backups devem ser executados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Backup Automático</Label>
                    <p className="text-sm text-muted-foreground">
                      Executa backups automaticamente
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoBackupEnabled}
                    onCheckedChange={(checked) => updateSetting('autoBackupEnabled', checked)}
                  />
                </div>
                
                {settings.autoBackupEnabled && (
                  <>
                    <div className="space-y-2">
                      <Label>Frequência</Label>
                      <Select
                        value={settings.backupFrequency}
                        onValueChange={(value) => updateSetting('backupFrequency', value as any)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">A cada hora</SelectItem>
                          <SelectItem value="daily">Diariamente</SelectItem>
                          <SelectItem value="weekly">Semanalmente</SelectItem>
                          <SelectItem value="monthly">Mensalmente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Horário</Label>
                      <Input
                        type="time"
                        value={settings.backupTime}
                        onChange={(e) => updateSetting('backupTime', e.target.value)}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Storage Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  Armazenamento
                </CardTitle>
                <CardDescription>
                  Configure onde os backups serão armazenados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipo de Armazenamento</Label>
                  <RadioGroup
                    value={settings.storageType}
                    onValueChange={(value) => updateSetting('storageType', value as any)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="local" id="local" />
                      <Label htmlFor="local">Local apenas</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cloud" id="cloud" />
                      <Label htmlFor="cloud">Nuvem apenas</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hybrid" id="hybrid" />
                      <Label htmlFor="hybrid">Híbrido (Local + Nuvem)</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {(settings.storageType === 'local' || settings.storageType === 'hybrid') && (
                  <div className="space-y-2">
                    <Label>Caminho Local</Label>
                    <Input
                      value={settings.localPath}
                      onChange={(e) => updateSetting('localPath', e.target.value)}
                      placeholder="/caminho/para/backups"
                    />
                  </div>
                )}
                
                {(settings.storageType === 'cloud' || settings.storageType === 'hybrid') && (
                  <div className="space-y-2">
                    <Label>Provedor de Nuvem</Label>
                    <Select
                      value={settings.cloudProvider}
                      onValueChange={(value) => updateSetting('cloudProvider', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aws">Amazon S3</SelectItem>
                        <SelectItem value="google">Google Cloud Storage</SelectItem>
                        <SelectItem value="azure">Azure Blob Storage</SelectItem>
                        <SelectItem value="dropbox">Dropbox</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Cloud Credentials */}
          {(settings.storageType === 'cloud' || settings.storageType === 'hybrid') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="h-5 w-5" />
                  Credenciais da Nuvem
                </CardTitle>
                <CardDescription>
                  Configure as credenciais para acesso ao armazenamento na nuvem
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Access Key</Label>
                    <div className="relative">
                      <Input
                        type={showCredentials ? 'text' : 'password'}
                        value={settings.cloudCredentials.accessKey}
                        onChange={(e) => updateCloudCredential('accessKey', e.target.value)}
                        placeholder="Sua access key"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowCredentials(!showCredentials)}
                        >
                          {showCredentials ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyToClipboard(settings.cloudCredentials.accessKey, 'accessKey')}
                        >
                          {copiedField === 'accessKey' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Secret Key</Label>
                    <div className="relative">
                      <Input
                        type={showCredentials ? 'text' : 'password'}
                        value={settings.cloudCredentials.secretKey}
                        onChange={(e) => updateCloudCredential('secretKey', e.target.value)}
                        placeholder="Sua secret key"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyToClipboard(settings.cloudCredentials.secretKey, 'secretKey')}
                        >
                          {copiedField === 'secretKey' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Bucket/Container</Label>
                    <Input
                      value={settings.cloudCredentials.bucket}
                      onChange={(e) => updateCloudCredential('bucket', e.target.value)}
                      placeholder="Nome do bucket"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Região</Label>
                    <Input
                      value={settings.cloudCredentials.region}
                      onChange={(e) => updateCloudCredential('region', e.target.value)}
                      placeholder="us-east-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Retention Policy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                Política de Retenção
              </CardTitle>
              <CardDescription>
                Configure por quanto tempo os backups devem ser mantidos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Política de Retenção</Label>
                    <RadioGroup
                      value={settings.retentionPolicy}
                      onValueChange={(value) => updateSetting('retentionPolicy', value as any)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="time" id="time" />
                        <Label htmlFor="time">Por tempo</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="count" id="count" />
                        <Label htmlFor="count">Por quantidade</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  {settings.retentionPolicy === 'time' ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Manter por (dias)</Label>
                        <span className="text-sm text-muted-foreground">{settings.retentionDays}</span>
                      </div>
                      <Slider
                        value={[settings.retentionDays]}
                        onValueChange={([value]) => updateSetting('retentionDays', value)}
                        min={7}
                        max={365}
                        step={7}
                        className="w-full"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Manter quantidade</Label>
                        <span className="text-sm text-muted-foreground">{settings.retentionCount}</span>
                      </div>
                      <Slider
                        value={[settings.retentionCount]}
                        onValueChange={([value]) => updateSetting('retentionCount', value)}
                        min={5}
                        max={50}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Comprimir Backups</Label>
                      <p className="text-sm text-muted-foreground">
                        Reduz o tamanho dos arquivos
                      </p>
                    </div>
                    <Switch
                      checked={settings.compressBackups}
                      onCheckedChange={(checked) => updateSetting('compressBackups', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Criptografar Backups</Label>
                      <p className="text-sm text-muted-foreground">
                        Protege os dados com criptografia
                      </p>
                    </div>
                    <Switch
                      checked={settings.encryptBackups}
                      onCheckedChange={(checked) => updateSetting('encryptBackups', checked)}
                    />
                  </div>
                  
                  {settings.encryptBackups && (
                    <div className="space-y-2">
                      <Label>Chave de Criptografia</Label>
                      <div className="relative">
                        <Input
                          type="password"
                          value={settings.encryptionKey}
                          onChange={(e) => updateSetting('encryptionKey', e.target.value)}
                          placeholder="Chave de criptografia"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                          onClick={() => {
                            const key = Math.random().toString(36).substring(2, 15) + 
                                      Math.random().toString(36).substring(2, 15);
                            updateSetting('encryptionKey', key);
                          }}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Dados para Backup
              </CardTitle>
              <CardDescription>
                Selecione quais dados devem ser incluídos no backup
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="database"
                      checked={settings.includeDatabase}
                      onCheckedChange={(checked) => updateSetting('includeDatabase', !!checked)}
                    />
                    <Label htmlFor="database">Banco de Dados</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="files"
                      checked={settings.includeFiles}
                      onCheckedChange={(checked) => updateSetting('includeFiles', !!checked)}
                    />
                    <Label htmlFor="files">Arquivos do Sistema</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="configurations"
                      checked={settings.includeConfigurations}
                      onCheckedChange={(checked) => updateSetting('includeConfigurations', !!checked)}
                    />
                    <Label htmlFor="configurations">Configurações</Label>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="logs"
                      checked={settings.includeLogs}
                      onCheckedChange={(checked) => updateSetting('includeLogs', !!checked)}
                    />
                    <Label htmlFor="logs">Logs do Sistema</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="userdata"
                      checked={settings.includeUserData}
                      onCheckedChange={(checked) => updateSetting('includeUserData', !!checked)}
                    />
                    <Label htmlFor="userdata">Dados de Usuários</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Jobs Tab */}
        <TabsContent value="jobs" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Jobs de Backup Ativos</h3>
              <p className="text-sm text-muted-foreground">
                Monitore o progresso dos backups em execução
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleRunBackup('incremental')}>
                <Play className="h-4 w-4 mr-2" />
                Backup Incremental
              </Button>
              <Button onClick={() => handleRunBackup('full')}>
                <Database className="h-4 w-4 mr-2" />
                Backup Completo
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            {backupJobs.map((job) => (
              <Card key={job.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        {getTypeIcon(job.type)}
                      </div>
                      <div>
                        <h4 className="font-medium">{job.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {job.type.charAt(0).toUpperCase() + job.type.slice(1)} • {job.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(job.status)}>
                        {getStatusIcon(job.status)}
                        <span className="ml-1">{job.status}</span>
                      </Badge>
                    </div>
                  </div>
                  
                  {job.status === 'running' && (
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progresso</span>
                        <span>{job.progress}%</span>
                      </div>
                      <Progress value={job.progress} className="w-full" />
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Início</p>
                      <p className="font-medium">{job.startTime}</p>
                    </div>
                    {job.endTime && (
                      <div>
                        <p className="text-muted-foreground">Fim</p>
                        <p className="font-medium">{job.endTime}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-muted-foreground">Duração</p>
                      <p className="font-medium">{job.duration || 'Em andamento'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tamanho</p>
                      <p className="font-medium">{job.size}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Arquivos</p>
                      <p className="font-medium">{job.filesCount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Erros</p>
                      <p className="font-medium">{job.errorCount}</p>
                    </div>
                    {job.nextRun && (
                      <div>
                        <p className="text-muted-foreground">Próximo</p>
                        <p className="font-medium">{job.nextRun}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Histórico de Backups</h3>
              <p className="text-sm text-muted-foreground">
                Visualize todos os backups realizados
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar Relatório
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            {backupHistory.map((backup) => (
              <Card key={backup.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-muted rounded-lg">
                        {getTypeIcon(backup.type)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{backup.date}</h4>
                          <Badge className={getStatusColor(backup.status)}>
                            {getStatusIcon(backup.status)}
                            <span className="ml-1">{backup.status}</span>
                          </Badge>
                          <Badge variant="outline">
                            {backup.type}
                          </Badge>
                          {backup.verified && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verificado
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{backup.size}</span>
                          <span>{backup.duration}</span>
                          <span>{backup.filesCount.toLocaleString()} arquivos</span>
                          <span>{backup.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {backup.canRestore && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestoreBackup(backup.id)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Restaurar
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Storage Tab */}
        <TabsContent value="storage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Uso de Armazenamento
              </CardTitle>
              <CardDescription>
                Monitore o uso de espaço dos seus backups
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <HardDrive className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <p className="text-sm text-muted-foreground">Local</p>
                  <p className="text-2xl font-bold">1.2 GB</p>
                  <p className="text-xs text-muted-foreground">de 100 GB</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <Cloud className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="text-sm text-muted-foreground">Nuvem</p>
                  <p className="text-2xl font-bold">8.1 GB</p>
                  <p className="text-xs text-muted-foreground">de 1 TB</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <Archive className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">9.3 GB</p>
                  <p className="text-xs text-muted-foreground">{backupHistory.length} backups</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Armazenamento Local</span>
                    <span className="text-sm text-muted-foreground">1.2%</span>
                  </div>
                  <Progress value={1.2} className="w-full" />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Armazenamento na Nuvem</span>
                    <span className="text-sm text-muted-foreground">0.8%</span>
                  </div>
                  <Progress value={0.8} className="w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Restore Tab */}
        <TabsContent value="restore" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Restaurar Backup
              </CardTitle>
              <CardDescription>
                Restaure dados de backups anteriores
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Atenção:</strong> A restauração de backup substituirá os dados atuais. 
                  Certifique-se de fazer um backup atual antes de prosseguir.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <h4 className="font-medium">Backups Disponíveis para Restauração</h4>
                
                {backupHistory
                  .filter(backup => backup.canRestore)
                  .map((backup) => (
                    <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-muted rounded-lg">
                          {getTypeIcon(backup.type)}
                        </div>
                        <div>
                          <h5 className="font-medium">{backup.date}</h5>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline">{backup.type}</Badge>
                            <span>{backup.size}</span>
                            <span>{backup.filesCount.toLocaleString()} arquivos</span>
                            {backup.verified && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verificado
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => handleRestoreBackup(backup.id)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Restaurar
                      </Button>
                    </div>
                  ))
                }
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}