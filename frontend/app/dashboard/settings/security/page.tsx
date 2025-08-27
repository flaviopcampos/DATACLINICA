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
import {
  Shield,
  Key,
  Smartphone,
  Clock,
  AlertTriangle,
  Eye,
  Lock,
  Unlock,
  UserCheck,
  Activity,
  Globe,
  Wifi,
  WifiOff,
  ArrowLeft,
  Save,
  RotateCcw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Settings,
  History,
  Trash2,
  Download,
  RefreshCw,
  LogOut,
  Monitor,
  MapPin,
  Calendar,
  Users,
  Database,
  FileText,
  Bell,
  Mail,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';

interface SecuritySettings {
  // Autenticação
  twoFactorEnabled: boolean;
  twoFactorMethod: 'app' | 'sms' | 'email';
  passwordExpiry: number; // dias
  passwordComplexity: 'low' | 'medium' | 'high';
  loginAttempts: number;
  lockoutDuration: number; // minutos
  
  // Sessões
  sessionTimeout: number; // minutos
  maxConcurrentSessions: number;
  forceLogoutInactive: boolean;
  rememberDevice: boolean;
  deviceTrustDuration: number; // dias
  
  // Monitoramento
  loginNotifications: boolean;
  suspiciousActivityAlerts: boolean;
  newDeviceAlerts: boolean;
  locationTracking: boolean;
  auditLogging: boolean;
  
  // Políticas
  ipWhitelist: string[];
  allowedCountries: string[];
  blockVpn: boolean;
  requireSecureConnection: boolean;
  
  // Backup e Recuperação
  backupEncryption: boolean;
  recoveryEmail: string;
  recoveryPhone: string;
  emergencyContacts: string[];
}

interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'failed_login' | 'password_change' | 'device_added' | 'suspicious_activity';
  description: string;
  timestamp: string;
  ip: string;
  location: string;
  device: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'resolved' | 'investigating' | 'dismissed';
}

interface TrustedDevice {
  id: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  lastUsed: string;
  location: string;
  trusted: boolean;
  current: boolean;
}

const defaultSettings: SecuritySettings = {
  twoFactorEnabled: false,
  twoFactorMethod: 'app',
  passwordExpiry: 90,
  passwordComplexity: 'medium',
  loginAttempts: 5,
  lockoutDuration: 15,
  sessionTimeout: 60,
  maxConcurrentSessions: 3,
  forceLogoutInactive: true,
  rememberDevice: true,
  deviceTrustDuration: 30,
  loginNotifications: true,
  suspiciousActivityAlerts: true,
  newDeviceAlerts: true,
  locationTracking: true,
  auditLogging: true,
  ipWhitelist: [],
  allowedCountries: ['BR', 'US', 'CA'],
  blockVpn: false,
  requireSecureConnection: true,
  backupEncryption: true,
  recoveryEmail: '',
  recoveryPhone: '',
  emergencyContacts: []
};

const mockSecurityEvents: SecurityEvent[] = [
  {
    id: '1',
    type: 'login',
    description: 'Login bem-sucedido',
    timestamp: '2024-01-15 14:30:00',
    ip: '192.168.1.100',
    location: 'São Paulo, BR',
    device: 'Chrome/Windows',
    severity: 'low',
    status: 'resolved'
  },
  {
    id: '2',
    type: 'failed_login',
    description: 'Tentativa de login falhada',
    timestamp: '2024-01-15 13:45:00',
    ip: '203.0.113.1',
    location: 'Unknown',
    device: 'Unknown',
    severity: 'medium',
    status: 'investigating'
  },
  {
    id: '3',
    type: 'device_added',
    description: 'Novo dispositivo adicionado',
    timestamp: '2024-01-14 09:15:00',
    ip: '192.168.1.101',
    location: 'São Paulo, BR',
    device: 'Safari/iPhone',
    severity: 'low',
    status: 'resolved'
  }
];

const mockTrustedDevices: TrustedDevice[] = [
  {
    id: '1',
    name: 'Meu Computador',
    type: 'desktop',
    browser: 'Chrome 120',
    os: 'Windows 11',
    lastUsed: '2024-01-15 14:30:00',
    location: 'São Paulo, BR',
    trusted: true,
    current: true
  },
  {
    id: '2',
    name: 'iPhone Pessoal',
    type: 'mobile',
    browser: 'Safari 17',
    os: 'iOS 17',
    lastUsed: '2024-01-14 18:20:00',
    location: 'São Paulo, BR',
    trusted: true,
    current: false
  },
  {
    id: '3',
    name: 'Dispositivo Desconhecido',
    type: 'desktop',
    browser: 'Firefox 121',
    os: 'Ubuntu 22.04',
    lastUsed: '2024-01-13 10:45:00',
    location: 'Rio de Janeiro, BR',
    trusted: false,
    current: false
  }
];

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'low': return 'bg-green-100 text-green-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'high': return 'bg-orange-100 text-orange-800';
    case 'critical': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getEventIcon = (type: string) => {
  switch (type) {
    case 'login': return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'logout': return <LogOut className="h-4 w-4 text-blue-500" />;
    case 'failed_login': return <XCircle className="h-4 w-4 text-red-500" />;
    case 'password_change': return <Key className="h-4 w-4 text-orange-500" />;
    case 'device_added': return <Smartphone className="h-4 w-4 text-purple-500" />;
    case 'suspicious_activity': return <AlertTriangle className="h-4 w-4 text-red-500" />;
    default: return <Info className="h-4 w-4 text-gray-500" />;
  }
};

const getDeviceIcon = (type: string) => {
  switch (type) {
    case 'desktop': return <Monitor className="h-5 w-5" />;
    case 'mobile': return <Smartphone className="h-5 w-5" />;
    case 'tablet': return <Smartphone className="h-5 w-5" />;
    default: return <Monitor className="h-5 w-5" />;
  }
};

export default function SecuritySettingsPage() {
  const [settings, setSettings] = useState<SecuritySettings>(defaultSettings);
  const [securityEvents] = useState<SecurityEvent[]>(mockSecurityEvents);
  const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>(mockTrustedDevices);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const updateSetting = <K extends keyof SecuritySettings>(
    key: K,
    value: SecuritySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHasChanges(false);
      console.log('Configurações de segurança salvas:', settings);
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

  const handleRemoveDevice = (deviceId: string) => {
    if (confirm('Tem certeza que deseja remover este dispositivo?')) {
      setTrustedDevices(prev => prev.filter(device => device.id !== deviceId));
    }
  };

  const handleToggleDeviceTrust = (deviceId: string) => {
    setTrustedDevices(prev => prev.map(device => 
      device.id === deviceId 
        ? { ...device, trusted: !device.trusted }
        : device
    ));
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
              <Shield className="h-8 w-8 text-primary" />
              Configurações de Segurança
            </h1>
            <p className="text-muted-foreground mt-2">
              Configure políticas de segurança e monitoramento
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

      {/* Security Alert */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Suas configurações de segurança estão ativas. Última verificação: hoje às 14:30
        </AlertDescription>
      </Alert>

      {/* Security Tabs */}
      <Tabs defaultValue="authentication" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="authentication" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Autenticação
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Sessões
          </TabsTrigger>
          <TabsTrigger value="devices" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Dispositivos
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Monitoramento
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Eventos
          </TabsTrigger>
        </TabsList>

        {/* Authentication Tab */}
        <TabsContent value="authentication" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Two-Factor Authentication */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Autenticação de Dois Fatores
                </CardTitle>
                <CardDescription>
                  Adicione uma camada extra de segurança
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Habilitar 2FA</Label>
                    <p className="text-sm text-muted-foreground">
                      Requer código adicional no login
                    </p>
                  </div>
                  <Switch
                    checked={settings.twoFactorEnabled}
                    onCheckedChange={(checked) => updateSetting('twoFactorEnabled', checked)}
                  />
                </div>
                
                {settings.twoFactorEnabled && (
                  <div className="space-y-2">
                    <Label>Método de Verificação</Label>
                    <Select
                      value={settings.twoFactorMethod}
                      onValueChange={(value) => updateSetting('twoFactorMethod', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="app">App Autenticador</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="pt-2">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurar 2FA
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Password Policy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Política de Senhas
                </CardTitle>
                <CardDescription>
                  Configure requisitos de senha
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Complexidade da Senha</Label>
                  <Select
                    value={settings.passwordComplexity}
                    onValueChange={(value) => updateSetting('passwordComplexity', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa (6+ caracteres)</SelectItem>
                      <SelectItem value="medium">Média (8+ caracteres, números)</SelectItem>
                      <SelectItem value="high">Alta (12+ caracteres, símbolos)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Expiração da Senha</Label>
                    <span className="text-sm text-muted-foreground">{settings.passwordExpiry} dias</span>
                  </div>
                  <Slider
                    value={[settings.passwordExpiry]}
                    onValueChange={([value]) => updateSetting('passwordExpiry', value)}
                    min={30}
                    max={365}
                    step={30}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Login Protection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Proteção de Login
              </CardTitle>
              <CardDescription>
                Configure proteções contra ataques de força bruta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Tentativas de Login</Label>
                    <span className="text-sm text-muted-foreground">{settings.loginAttempts}</span>
                  </div>
                  <Slider
                    value={[settings.loginAttempts]}
                    onValueChange={([value]) => updateSetting('loginAttempts', value)}
                    min={3}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Duração do Bloqueio</Label>
                    <span className="text-sm text-muted-foreground">{settings.lockoutDuration} min</span>
                  </div>
                  <Slider
                    value={[settings.lockoutDuration]}
                    onValueChange={([value]) => updateSetting('lockoutDuration', value)}
                    min={5}
                    max={60}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Gerenciamento de Sessões
              </CardTitle>
              <CardDescription>
                Configure tempo limite e políticas de sessão
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Timeout da Sessão</Label>
                    <span className="text-sm text-muted-foreground">{settings.sessionTimeout} min</span>
                  </div>
                  <Slider
                    value={[settings.sessionTimeout]}
                    onValueChange={([value]) => updateSetting('sessionTimeout', value)}
                    min={15}
                    max={480}
                    step={15}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Sessões Simultâneas</Label>
                    <span className="text-sm text-muted-foreground">{settings.maxConcurrentSessions}</span>
                  </div>
                  <Slider
                    value={[settings.maxConcurrentSessions]}
                    onValueChange={([value]) => updateSetting('maxConcurrentSessions', value)}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Forçar Logout em Inatividade</Label>
                    <p className="text-sm text-muted-foreground">
                      Desconecta automaticamente usuários inativos
                    </p>
                  </div>
                  <Switch
                    checked={settings.forceLogoutInactive}
                    onCheckedChange={(checked) => updateSetting('forceLogoutInactive', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Lembrar Dispositivo</Label>
                    <p className="text-sm text-muted-foreground">
                      Permite que dispositivos sejam lembrados
                    </p>
                  </div>
                  <Switch
                    checked={settings.rememberDevice}
                    onCheckedChange={(checked) => updateSetting('rememberDevice', checked)}
                  />
                </div>
                
                {settings.rememberDevice && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Duração da Confiança</Label>
                      <span className="text-sm text-muted-foreground">{settings.deviceTrustDuration} dias</span>
                    </div>
                    <Slider
                      value={[settings.deviceTrustDuration]}
                      onValueChange={([value]) => updateSetting('deviceTrustDuration', value)}
                      min={1}
                      max={90}
                      step={1}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Devices Tab */}
        <TabsContent value="devices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Dispositivos Confiáveis
              </CardTitle>
              <CardDescription>
                Gerencie dispositivos que têm acesso à sua conta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trustedDevices.map((device) => (
                  <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-muted rounded-lg">
                        {getDeviceIcon(device.type)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{device.name}</h4>
                          {device.current && (
                            <Badge variant="secondary" className="text-xs">
                              Atual
                            </Badge>
                          )}
                          {device.trusted ? (
                            <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                              Confiável
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-xs">
                              Não Confiável
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {device.browser} • {device.os}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {device.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {device.lastUsed}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!device.current && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleDeviceTrust(device.id)}
                          >
                            {device.trusted ? (
                              <>
                                <Unlock className="h-4 w-4 mr-2" />
                                Remover Confiança
                              </>
                            ) : (
                              <>
                                <Lock className="h-4 w-4 mr-2" />
                                Confiar
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveDevice(device.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Monitoramento de Segurança
              </CardTitle>
              <CardDescription>
                Configure alertas e monitoramento de atividades
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Notification Settings */}
              <div className="space-y-4">
                <h4 className="font-medium">Notificações de Segurança</h4>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Notificações de Login</Label>
                      <p className="text-sm text-muted-foreground">
                        Receba alertas sobre novos logins
                      </p>
                    </div>
                    <Switch
                      checked={settings.loginNotifications}
                      onCheckedChange={(checked) => updateSetting('loginNotifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Alertas de Atividade Suspeita</Label>
                      <p className="text-sm text-muted-foreground">
                        Detecta comportamentos anômalos
                      </p>
                    </div>
                    <Switch
                      checked={settings.suspiciousActivityAlerts}
                      onCheckedChange={(checked) => updateSetting('suspiciousActivityAlerts', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Alertas de Novos Dispositivos</Label>
                      <p className="text-sm text-muted-foreground">
                        Notifica sobre dispositivos não reconhecidos
                      </p>
                    </div>
                    <Switch
                      checked={settings.newDeviceAlerts}
                      onCheckedChange={(checked) => updateSetting('newDeviceAlerts', checked)}
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Tracking Settings */}
              <div className="space-y-4">
                <h4 className="font-medium">Rastreamento</h4>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Rastreamento de Localização</Label>
                      <p className="text-sm text-muted-foreground">
                        Registra localização dos acessos
                      </p>
                    </div>
                    <Switch
                      checked={settings.locationTracking}
                      onCheckedChange={(checked) => updateSetting('locationTracking', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Log de Auditoria</Label>
                      <p className="text-sm text-muted-foreground">
                        Mantém registro detalhado de ações
                      </p>
                    </div>
                    <Switch
                      checked={settings.auditLogging}
                      onCheckedChange={(checked) => updateSetting('auditLogging', checked)}
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Access Control */}
              <div className="space-y-4">
                <h4 className="font-medium">Controle de Acesso</h4>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Bloquear VPN</Label>
                      <p className="text-sm text-muted-foreground">
                        Impede acesso através de VPNs
                      </p>
                    </div>
                    <Switch
                      checked={settings.blockVpn}
                      onCheckedChange={(checked) => updateSetting('blockVpn', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Exigir Conexão Segura</Label>
                      <p className="text-sm text-muted-foreground">
                        Força uso de HTTPS
                      </p>
                    </div>
                    <Switch
                      checked={settings.requireSecureConnection}
                      onCheckedChange={(checked) => updateSetting('requireSecureConnection', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Eventos de Segurança
                  </CardTitle>
                  <CardDescription>
                    Histórico de atividades e eventos de segurança
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-muted rounded-lg">
                        {getEventIcon(event.type)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{event.description}</h4>
                          <Badge className={getSeverityColor(event.severity)}>
                            {event.severity}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {event.timestamp}
                          </span>
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {event.ip}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Monitor className="h-3 w-3" />
                            {event.device}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {event.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}