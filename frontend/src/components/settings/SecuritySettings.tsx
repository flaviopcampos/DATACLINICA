'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { SettingsCard, SettingsSection, SettingsItem, SettingsGroup } from './SettingsCard';
import {
  Shield,
  Key,
  Smartphone,
  Lock,
  Eye,
  EyeOff,
  Clock,
  Users,
  Monitor,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Settings,
  Trash2,
  RefreshCw,
  Download,
  Upload,
  Activity,
  Globe,
  Wifi,
  MapPin,
  Calendar,
  User,
  Mail,
  Phone
} from 'lucide-react';

export interface SecuritySettings {
  // Autenticação
  twoFactorEnabled: boolean;
  twoFactorMethod: 'app' | 'sms' | 'email';
  backupCodes: string[];
  
  // Política de Senha
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
    preventReuse: number;
    maxAge: number; // dias
  };
  
  // Proteção de Login
  loginProtection: {
    maxAttempts: number;
    lockoutDuration: number; // minutos
    captchaEnabled: boolean;
    ipWhitelistEnabled: boolean;
    ipWhitelist: string[];
    geoBlockingEnabled: boolean;
    allowedCountries: string[];
  };
  
  // Gerenciamento de Sessões
  sessionManagement: {
    timeout: number; // minutos
    maxSessions: number;
    logoutInactive: boolean;
    inactivityTimeout: number; // minutos
    rememberDevice: boolean;
    deviceTrustDuration: number; // dias
  };
  
  // Monitoramento
  monitoring: {
    loginNotifications: boolean;
    suspiciousActivityAlerts: boolean;
    newDeviceAlerts: boolean;
    locationChangeAlerts: boolean;
    adminActionAlerts: boolean;
    dataAccessAlerts: boolean;
  };
  
  // Controle de Acesso
  accessControl: {
    roleBasedAccess: boolean;
    permissionInheritance: boolean;
    temporaryAccess: boolean;
    accessReviewEnabled: boolean;
    accessReviewInterval: number; // dias
  };
  
  // Auditoria
  audit: {
    enabled: boolean;
    logLevel: 'basic' | 'detailed' | 'verbose';
    retentionDays: number;
    realTimeAlerts: boolean;
    exportEnabled: boolean;
  };
}

interface TrustedDevice {
  id: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  location: string;
  lastUsed: Date;
  trusted: boolean;
  fingerprint: string;
}

interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'failed_login' | 'password_change' | 'device_added' | 'suspicious_activity';
  description: string;
  timestamp: Date;
  ipAddress: string;
  location: string;
  device: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

interface SecuritySettingsProps {
  settings: SecuritySettings;
  onSettingsChange: (settings: SecuritySettings) => void;
  trustedDevices?: TrustedDevice[];
  securityEvents?: SecurityEvent[];
  onDeviceRemove?: (deviceId: string) => void;
  onEventResolve?: (eventId: string) => void;
  onGenerateBackupCodes?: () => void;
  onExportAuditLog?: () => void;
  isLoading?: boolean;
}

const defaultSettings: SecuritySettings = {
  twoFactorEnabled: false,
  twoFactorMethod: 'app',
  backupCodes: [],
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: false,
    preventReuse: 5,
    maxAge: 90
  },
  loginProtection: {
    maxAttempts: 5,
    lockoutDuration: 15,
    captchaEnabled: true,
    ipWhitelistEnabled: false,
    ipWhitelist: [],
    geoBlockingEnabled: false,
    allowedCountries: []
  },
  sessionManagement: {
    timeout: 480, // 8 horas
    maxSessions: 3,
    logoutInactive: true,
    inactivityTimeout: 30,
    rememberDevice: true,
    deviceTrustDuration: 30
  },
  monitoring: {
    loginNotifications: true,
    suspiciousActivityAlerts: true,
    newDeviceAlerts: true,
    locationChangeAlerts: false,
    adminActionAlerts: true,
    dataAccessAlerts: false
  },
  accessControl: {
    roleBasedAccess: true,
    permissionInheritance: true,
    temporaryAccess: false,
    accessReviewEnabled: false,
    accessReviewInterval: 90
  },
  audit: {
    enabled: true,
    logLevel: 'detailed',
    retentionDays: 365,
    realTimeAlerts: true,
    exportEnabled: true
  }
};

const severityColors = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
};

const eventTypeLabels = {
  login: 'Login',
  logout: 'Logout',
  failed_login: 'Falha no Login',
  password_change: 'Alteração de Senha',
  device_added: 'Dispositivo Adicionado',
  suspicious_activity: 'Atividade Suspeita'
};

export function SecuritySettings({
  settings,
  onSettingsChange,
  trustedDevices = [],
  securityEvents = [],
  onDeviceRemove,
  onEventResolve,
  onGenerateBackupCodes,
  onExportAuditLog,
  isLoading = false
}: SecuritySettingsProps) {
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [newIpAddress, setNewIpAddress] = useState('');

  const updateSetting = <K extends keyof SecuritySettings>(
    key: K,
    value: SecuritySettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const updateNestedSetting = <T extends keyof SecuritySettings>(
    section: T,
    key: keyof SecuritySettings[T],
    value: any
  ) => {
    updateSetting(section, {
      ...settings[section],
      [key]: value
    });
  };

  const addIpToWhitelist = () => {
    if (newIpAddress && !settings.loginProtection.ipWhitelist.includes(newIpAddress)) {
      updateNestedSetting('loginProtection', 'ipWhitelist', [
        ...settings.loginProtection.ipWhitelist,
        newIpAddress
      ]);
      setNewIpAddress('');
    }
  };

  const removeIpFromWhitelist = (ip: string) => {
    updateNestedSetting('loginProtection', 'ipWhitelist',
      settings.loginProtection.ipWhitelist.filter(item => item !== ip)
    );
  };

  const getPasswordStrength = () => {
    let strength = 0;
    const policy = settings.passwordPolicy;
    
    if (policy.minLength >= 8) strength += 20;
    if (policy.requireUppercase) strength += 20;
    if (policy.requireLowercase) strength += 20;
    if (policy.requireNumbers) strength += 20;
    if (policy.requireSymbols) strength += 20;
    
    return strength;
  };

  const formatLastUsed = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor(diff / 60000);

    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    return `${days}d atrás`;
  };

  return (
    <Tabs defaultValue="authentication" className="space-y-6">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="authentication">Autenticação</TabsTrigger>
        <TabsTrigger value="sessions">Sessões</TabsTrigger>
        <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
        <TabsTrigger value="devices">Dispositivos</TabsTrigger>
        <TabsTrigger value="events">Eventos</TabsTrigger>
      </TabsList>

      {/* Autenticação */}
      <TabsContent value="authentication" className="space-y-6">
        <SettingsGroup title="Autenticação de Dois Fatores" description="Configure a autenticação de dois fatores para maior segurança">
          <SettingsCard
            title="2FA"
            description="Ative a autenticação de dois fatores"
            icon={Shield}
            status={settings.twoFactorEnabled ? 'active' : 'inactive'}
            statusText={settings.twoFactorEnabled ? 'Ativo' : 'Inativo'}
            headerAction={
              <Switch
                checked={settings.twoFactorEnabled}
                onCheckedChange={(checked) => updateSetting('twoFactorEnabled', checked)}
                disabled={isLoading}
              />
            }
          >
            {settings.twoFactorEnabled && (
              <SettingsSection>
                <SettingsItem label="Método" description="Escolha como receber códigos de verificação">
                  <Select
                    value={settings.twoFactorMethod}
                    onValueChange={(value) => updateSetting('twoFactorMethod', value as any)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="app">App Autenticador</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingsItem>
                
                <SettingsItem label="Códigos de Backup" description="Códigos para usar quando não tiver acesso ao método principal">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowBackupCodes(!showBackupCodes)}
                    >
                      {showBackupCodes ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                      {showBackupCodes ? 'Ocultar' : 'Mostrar'} Códigos
                    </Button>
                    {onGenerateBackupCodes && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onGenerateBackupCodes}
                        disabled={isLoading}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Gerar Novos
                      </Button>
                    )}
                  </div>
                  {showBackupCodes && settings.backupCodes.length > 0 && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                        {settings.backupCodes.map((code, index) => (
                          <div key={index} className="p-2 bg-white rounded border">
                            {code}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </SettingsItem>
              </SettingsSection>
            )}
          </SettingsCard>
        </SettingsGroup>

        <SettingsGroup title="Política de Senha" description="Configure os requisitos de senha">
          <SettingsCard
            title="Requisitos de Senha"
            description="Defina os critérios de segurança para senhas"
            icon={Key}
          >
            <SettingsSection>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <Label>Força da Política</Label>
                  <span className="text-sm text-muted-foreground">{getPasswordStrength()}%</span>
                </div>
                <Progress value={getPasswordStrength()} className="h-2" />
              </div>
              
              <SettingsItem label="Comprimento Mínimo" description="Número mínimo de caracteres">
                <Select
                  value={settings.passwordPolicy.minLength.toString()}
                  onValueChange={(value) => updateNestedSetting('passwordPolicy', 'minLength', parseInt(value))}
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[6, 8, 10, 12, 14, 16].map(length => (
                      <SelectItem key={length} value={length.toString()}>{length}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </SettingsItem>
              
              <div className="grid grid-cols-2 gap-4">
                <SettingsItem label="Maiúsculas" description="Exigir letras maiúsculas">
                  <Switch
                    checked={settings.passwordPolicy.requireUppercase}
                    onCheckedChange={(checked) => updateNestedSetting('passwordPolicy', 'requireUppercase', checked)}
                    disabled={isLoading}
                  />
                </SettingsItem>
                
                <SettingsItem label="Minúsculas" description="Exigir letras minúsculas">
                  <Switch
                    checked={settings.passwordPolicy.requireLowercase}
                    onCheckedChange={(checked) => updateNestedSetting('passwordPolicy', 'requireLowercase', checked)}
                    disabled={isLoading}
                  />
                </SettingsItem>
                
                <SettingsItem label="Números" description="Exigir números">
                  <Switch
                    checked={settings.passwordPolicy.requireNumbers}
                    onCheckedChange={(checked) => updateNestedSetting('passwordPolicy', 'requireNumbers', checked)}
                    disabled={isLoading}
                  />
                </SettingsItem>
                
                <SettingsItem label="Símbolos" description="Exigir caracteres especiais">
                  <Switch
                    checked={settings.passwordPolicy.requireSymbols}
                    onCheckedChange={(checked) => updateNestedSetting('passwordPolicy', 'requireSymbols', checked)}
                    disabled={isLoading}
                  />
                </SettingsItem>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <SettingsItem label="Prevenir Reutilização" description="Últimas senhas a lembrar">
                  <Select
                    value={settings.passwordPolicy.preventReuse.toString()}
                    onValueChange={(value) => updateNestedSetting('passwordPolicy', 'preventReuse', parseInt(value))}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 3, 5, 10, 15, 20].map(count => (
                        <SelectItem key={count} value={count.toString()}>{count}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </SettingsItem>
                
                <SettingsItem label="Expiração (dias)" description="Forçar alteração após">
                  <Select
                    value={settings.passwordPolicy.maxAge.toString()}
                    onValueChange={(value) => updateNestedSetting('passwordPolicy', 'maxAge', parseInt(value))}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 dias</SelectItem>
                      <SelectItem value="60">60 dias</SelectItem>
                      <SelectItem value="90">90 dias</SelectItem>
                      <SelectItem value="180">180 dias</SelectItem>
                      <SelectItem value="365">1 ano</SelectItem>
                      <SelectItem value="0">Nunca</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingsItem>
              </div>
            </SettingsSection>
          </SettingsCard>
        </SettingsGroup>

        <SettingsGroup title="Proteção de Login" description="Configure proteções contra ataques de força bruta">
          <SettingsCard
            title="Tentativas de Login"
            description="Limite tentativas de login falhadas"
            icon={Lock}
          >
            <SettingsSection>
              <div className="grid grid-cols-2 gap-4">
                <SettingsItem label="Máximo de Tentativas" description="Tentativas antes do bloqueio">
                  <Select
                    value={settings.loginProtection.maxAttempts.toString()}
                    onValueChange={(value) => updateNestedSetting('loginProtection', 'maxAttempts', parseInt(value))}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[3, 5, 10, 15, 20].map(attempts => (
                        <SelectItem key={attempts} value={attempts.toString()}>{attempts}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </SettingsItem>
                
                <SettingsItem label="Duração do Bloqueio" description="Minutos de bloqueio">
                  <Select
                    value={settings.loginProtection.lockoutDuration.toString()}
                    onValueChange={(value) => updateNestedSetting('loginProtection', 'lockoutDuration', parseInt(value))}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 min</SelectItem>
                      <SelectItem value="15">15 min</SelectItem>
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="60">1 hora</SelectItem>
                      <SelectItem value="1440">24 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingsItem>
              </div>
              
              <SettingsItem label="CAPTCHA" description="Exigir CAPTCHA após tentativas falhadas">
                <Switch
                  checked={settings.loginProtection.captchaEnabled}
                  onCheckedChange={(checked) => updateNestedSetting('loginProtection', 'captchaEnabled', checked)}
                  disabled={isLoading}
                />
              </SettingsItem>
            </SettingsSection>
          </SettingsCard>
          
          <SettingsCard
            title="Lista Branca de IPs"
            description="Permita apenas IPs específicos"
            icon={Globe}
            status={settings.loginProtection.ipWhitelistEnabled ? 'active' : 'inactive'}
            statusText={settings.loginProtection.ipWhitelistEnabled ? 'Ativo' : 'Inativo'}
            headerAction={
              <Switch
                checked={settings.loginProtection.ipWhitelistEnabled}
                onCheckedChange={(checked) => updateNestedSetting('loginProtection', 'ipWhitelistEnabled', checked)}
                disabled={isLoading}
              />
            }
          >
            {settings.loginProtection.ipWhitelistEnabled && (
              <SettingsSection>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="192.168.1.1"
                      value={newIpAddress}
                      onChange={(e) => setNewIpAddress(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addIpToWhitelist()}
                    />
                    <Button onClick={addIpToWhitelist} disabled={!newIpAddress || isLoading}>
                      Adicionar
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {settings.loginProtection.ipWhitelist.map((ip, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="font-mono text-sm">{ip}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeIpFromWhitelist(ip)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </SettingsSection>
            )}
          </SettingsCard>
        </SettingsGroup>
      </TabsContent>

      {/* Sessões */}
      <TabsContent value="sessions" className="space-y-6">
        <SettingsGroup title="Gerenciamento de Sessões" description="Configure como as sessões de usuário são gerenciadas">
          <SettingsCard
            title="Configurações de Sessão"
            description="Defina limites e comportamentos de sessão"
            icon={Clock}
          >
            <SettingsSection>
              <div className="grid grid-cols-2 gap-4">
                <SettingsItem label="Timeout (minutos)" description="Duração máxima da sessão">
                  <Select
                    value={settings.sessionManagement.timeout.toString()}
                    onValueChange={(value) => updateNestedSetting('sessionManagement', 'timeout', parseInt(value))}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="60">1 hora</SelectItem>
                      <SelectItem value="120">2 horas</SelectItem>
                      <SelectItem value="240">4 horas</SelectItem>
                      <SelectItem value="480">8 horas</SelectItem>
                      <SelectItem value="1440">24 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingsItem>
                
                <SettingsItem label="Sessões Simultâneas" description="Máximo de sessões ativas">
                  <Select
                    value={settings.sessionManagement.maxSessions.toString()}
                    onValueChange={(value) => updateNestedSetting('sessionManagement', 'maxSessions', parseInt(value))}
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
              
              <SettingsItem label="Logout por Inatividade" description="Fazer logout automaticamente quando inativo">
                <Switch
                  checked={settings.sessionManagement.logoutInactive}
                  onCheckedChange={(checked) => updateNestedSetting('sessionManagement', 'logoutInactive', checked)}
                  disabled={isLoading}
                />
              </SettingsItem>
              
              {settings.sessionManagement.logoutInactive && (
                <SettingsItem label="Timeout de Inatividade" description="Minutos de inatividade antes do logout">
                  <Select
                    value={settings.sessionManagement.inactivityTimeout.toString()}
                    onValueChange={(value) => updateNestedSetting('sessionManagement', 'inactivityTimeout', parseInt(value))}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 min</SelectItem>
                      <SelectItem value="10">10 min</SelectItem>
                      <SelectItem value="15">15 min</SelectItem>
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="60">1 hora</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingsItem>
              )}
              
              <SettingsItem label="Lembrar Dispositivo" description="Permitir que dispositivos sejam marcados como confiáveis">
                <Switch
                  checked={settings.sessionManagement.rememberDevice}
                  onCheckedChange={(checked) => updateNestedSetting('sessionManagement', 'rememberDevice', checked)}
                  disabled={isLoading}
                />
              </SettingsItem>
              
              {settings.sessionManagement.rememberDevice && (
                <SettingsItem label="Duração da Confiança" description="Dias para lembrar do dispositivo">
                  <Select
                    value={settings.sessionManagement.deviceTrustDuration.toString()}
                    onValueChange={(value) => updateNestedSetting('sessionManagement', 'deviceTrustDuration', parseInt(value))}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 dias</SelectItem>
                      <SelectItem value="14">14 dias</SelectItem>
                      <SelectItem value="30">30 dias</SelectItem>
                      <SelectItem value="60">60 dias</SelectItem>
                      <SelectItem value="90">90 dias</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingsItem>
              )}
            </SettingsSection>
          </SettingsCard>
        </SettingsGroup>
      </TabsContent>

      {/* Monitoramento */}
      <TabsContent value="monitoring" className="space-y-6">
        <SettingsGroup title="Alertas de Segurança" description="Configure quando receber alertas de segurança">
          <SettingsCard
            title="Notificações de Segurança"
            description="Escolha quais eventos devem gerar alertas"
            icon={AlertTriangle}
          >
            <SettingsSection>
              <div className="grid grid-cols-2 gap-4">
                <SettingsItem label="Notificações de Login" description="Alertar sobre novos logins">
                  <Switch
                    checked={settings.monitoring.loginNotifications}
                    onCheckedChange={(checked) => updateNestedSetting('monitoring', 'loginNotifications', checked)}
                    disabled={isLoading}
                  />
                </SettingsItem>
                
                <SettingsItem label="Atividade Suspeita" description="Alertar sobre comportamento anômalo">
                  <Switch
                    checked={settings.monitoring.suspiciousActivityAlerts}
                    onCheckedChange={(checked) => updateNestedSetting('monitoring', 'suspiciousActivityAlerts', checked)}
                    disabled={isLoading}
                  />
                </SettingsItem>
                
                <SettingsItem label="Novos Dispositivos" description="Alertar sobre dispositivos não reconhecidos">
                  <Switch
                    checked={settings.monitoring.newDeviceAlerts}
                    onCheckedChange={(checked) => updateNestedSetting('monitoring', 'newDeviceAlerts', checked)}
                    disabled={isLoading}
                  />
                </SettingsItem>
                
                <SettingsItem label="Mudança de Localização" description="Alertar sobre logins de locais diferentes">
                  <Switch
                    checked={settings.monitoring.locationChangeAlerts}
                    onCheckedChange={(checked) => updateNestedSetting('monitoring', 'locationChangeAlerts', checked)}
                    disabled={isLoading}
                  />
                </SettingsItem>
                
                <SettingsItem label="Ações Administrativas" description="Alertar sobre ações de administradores">
                  <Switch
                    checked={settings.monitoring.adminActionAlerts}
                    onCheckedChange={(checked) => updateNestedSetting('monitoring', 'adminActionAlerts', checked)}
                    disabled={isLoading}
                  />
                </SettingsItem>
                
                <SettingsItem label="Acesso a Dados" description="Alertar sobre acesso a dados sensíveis">
                  <Switch
                    checked={settings.monitoring.dataAccessAlerts}
                    onCheckedChange={(checked) => updateNestedSetting('monitoring', 'dataAccessAlerts', checked)}
                    disabled={isLoading}
                  />
                </SettingsItem>
              </div>
            </SettingsSection>
          </SettingsCard>
        </SettingsGroup>
        
        <SettingsGroup title="Auditoria" description="Configure o sistema de auditoria">
          <SettingsCard
            title="Log de Auditoria"
            description="Registre e monitore atividades do sistema"
            icon={Activity}
            status={settings.audit.enabled ? 'active' : 'inactive'}
            statusText={settings.audit.enabled ? 'Ativo' : 'Inativo'}
            headerAction={
              <Switch
                checked={settings.audit.enabled}
                onCheckedChange={(checked) => updateNestedSetting('audit', 'enabled', checked)}
                disabled={isLoading}
              />
            }
          >
            {settings.audit.enabled && (
              <SettingsSection>
                <div className="grid grid-cols-2 gap-4">
                  <SettingsItem label="Nível de Log" description="Detalhamento dos logs">
                    <Select
                      value={settings.audit.logLevel}
                      onValueChange={(value) => updateNestedSetting('audit', 'logLevel', value as any)}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Básico</SelectItem>
                        <SelectItem value="detailed">Detalhado</SelectItem>
                        <SelectItem value="verbose">Verboso</SelectItem>
                      </SelectContent>
                    </Select>
                  </SettingsItem>
                  
                  <SettingsItem label="Retenção (dias)" description="Por quanto tempo manter os logs">
                    <Select
                      value={settings.audit.retentionDays.toString()}
                      onValueChange={(value) => updateNestedSetting('audit', 'retentionDays', parseInt(value))}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 dias</SelectItem>
                        <SelectItem value="90">90 dias</SelectItem>
                        <SelectItem value="180">180 dias</SelectItem>
                        <SelectItem value="365">1 ano</SelectItem>
                        <SelectItem value="1095">3 anos</SelectItem>
                      </SelectContent>
                    </Select>
                  </SettingsItem>
                </div>
                
                <SettingsItem label="Alertas em Tempo Real" description="Receber alertas imediatos sobre eventos críticos">
                  <Switch
                    checked={settings.audit.realTimeAlerts}
                    onCheckedChange={(checked) => updateNestedSetting('audit', 'realTimeAlerts', checked)}
                    disabled={isLoading}
                  />
                </SettingsItem>
                
                <SettingsItem label="Exportação Habilitada" description="Permitir exportação de logs de auditoria">
                  <Switch
                    checked={settings.audit.exportEnabled}
                    onCheckedChange={(checked) => updateNestedSetting('audit', 'exportEnabled', checked)}
                    disabled={isLoading}
                  />
                </SettingsItem>
                
                {settings.audit.exportEnabled && onExportAuditLog && (
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      onClick={onExportAuditLog}
                      disabled={isLoading}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Exportar Logs
                    </Button>
                  </div>
                )}
              </SettingsSection>
            )}
          </SettingsCard>
        </SettingsGroup>
      </TabsContent>

      {/* Dispositivos */}
      <TabsContent value="devices" className="space-y-6">
        <SettingsGroup title="Dispositivos Confiáveis" description="Gerencie dispositivos que têm acesso ao sistema">
          <div className="space-y-4">
            {trustedDevices.map((device) => (
              <Card key={device.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <Monitor className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium">{device.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {device.browser} • {device.os} • {device.location}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Último uso: {formatLastUsed(device.lastUsed)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={device.trusted ? 'default' : 'secondary'}>
                        {device.trusted ? 'Confiável' : 'Não Confiável'}
                      </Badge>
                      {onDeviceRemove && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeviceRemove(device.id)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {trustedDevices.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum dispositivo confiável encontrado</p>
              </div>
            )}
          </div>
        </SettingsGroup>
      </TabsContent>

      {/* Eventos */}
      <TabsContent value="events" className="space-y-6">
        <SettingsGroup title="Eventos de Segurança" description="Monitore eventos de segurança recentes">
          <div className="space-y-4">
            {securityEvents.map((event) => (
              <Card key={event.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        event.severity === 'critical' ? 'bg-red-100 text-red-600' :
                        event.severity === 'high' ? 'bg-orange-100 text-orange-600' :
                        event.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{eventTypeLabels[event.type]}</span>
                          <Badge className={`text-xs ${severityColors[event.severity]}`}>
                            {event.severity.toUpperCase()}
                          </Badge>
                          {event.resolved && (
                            <Badge variant="outline" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Resolvido
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                        <div className="text-xs text-muted-foreground">
                          {event.timestamp.toLocaleString()} • {event.ipAddress} • {event.location} • {event.device}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!event.resolved && onEventResolve && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEventResolve(event.id)}
                          disabled={isLoading}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Resolver
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {securityEvents.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum evento de segurança encontrado</p>
              </div>
            )}
          </div>
        </SettingsGroup>
      </TabsContent>
    </Tabs>
  );
}

export { defaultSettings as defaultSecuritySettings };
export type { TrustedDevice, SecurityEvent };