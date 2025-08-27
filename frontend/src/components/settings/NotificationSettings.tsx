'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SettingsCard, SettingsSection, SettingsItem, SettingsGroup } from './SettingsCard';
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Volume2,
  VolumeX,
  Monitor,
  Clock,
  Shield,
  AlertTriangle,
  Info,
  CheckCircle,
  Settings,
  Send,
  TestTube,
  Zap
} from 'lucide-react';

export interface NotificationSettings {
  // Canais de Notificação
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  desktopEnabled: boolean;
  
  // Configurações de Email
  emailAddress: string;
  emailFrequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  emailTypes: {
    appointments: boolean;
    reminders: boolean;
    reports: boolean;
    security: boolean;
    system: boolean;
    emergencies: boolean;
  };
  
  // Configurações de SMS
  phoneNumber: string;
  smsTypes: {
    appointments: boolean;
    reminders: boolean;
    emergencies: boolean;
  };
  
  // Configurações Push
  pushTypes: {
    appointments: boolean;
    reminders: boolean;
    reports: boolean;
    security: boolean;
    system: boolean;
    emergencies: boolean;
  };
  
  // Configurações Desktop
  desktopSound: boolean;
  desktopBadge: boolean;
  desktopPreview: boolean;
  
  // Configurações de Horário
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  weekendNotifications: boolean;
  
  // Configurações Avançadas
  groupSimilar: boolean;
  autoMarkRead: boolean;
  retentionDays: number;
}

interface NotificationSettingsProps {
  settings: NotificationSettings;
  onSettingsChange: (settings: NotificationSettings) => void;
  onTest?: (channel: 'email' | 'sms' | 'push' | 'desktop') => void;
  isLoading?: boolean;
}

const defaultSettings: NotificationSettings = {
  emailEnabled: true,
  smsEnabled: false,
  pushEnabled: true,
  desktopEnabled: true,
  emailAddress: '',
  emailFrequency: 'immediate',
  emailTypes: {
    appointments: true,
    reminders: true,
    reports: false,
    security: true,
    system: false,
    emergencies: true
  },
  phoneNumber: '',
  smsTypes: {
    appointments: true,
    reminders: true,
    emergencies: true
  },
  pushTypes: {
    appointments: true,
    reminders: true,
    reports: false,
    security: true,
    system: false,
    emergencies: true
  },
  desktopSound: true,
  desktopBadge: true,
  desktopPreview: true,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  weekendNotifications: true,
  groupSimilar: true,
  autoMarkRead: false,
  retentionDays: 30
};

const notificationTypeLabels = {
  appointments: 'Agendamentos',
  reminders: 'Lembretes',
  reports: 'Relatórios',
  security: 'Segurança',
  system: 'Sistema',
  emergencies: 'Emergências'
};

const frequencyLabels = {
  immediate: 'Imediato',
  hourly: 'A cada hora',
  daily: 'Diariamente',
  weekly: 'Semanalmente'
};

export function NotificationSettings({
  settings,
  onSettingsChange,
  onTest,
  isLoading = false
}: NotificationSettingsProps) {
  const [testingChannel, setTestingChannel] = useState<string | null>(null);

  const updateSetting = <K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const updateEmailType = (type: keyof NotificationSettings['emailTypes'], enabled: boolean) => {
    updateSetting('emailTypes', {
      ...settings.emailTypes,
      [type]: enabled
    });
  };

  const updateSmsType = (type: keyof NotificationSettings['smsTypes'], enabled: boolean) => {
    updateSetting('smsTypes', {
      ...settings.smsTypes,
      [type]: enabled
    });
  };

  const updatePushType = (type: keyof NotificationSettings['pushTypes'], enabled: boolean) => {
    updateSetting('pushTypes', {
      ...settings.pushTypes,
      [type]: enabled
    });
  };

  const handleTest = async (channel: 'email' | 'sms' | 'push' | 'desktop') => {
    if (!onTest) return;
    
    setTestingChannel(channel);
    try {
      await onTest(channel);
    } finally {
      setTestingChannel(null);
    }
  };

  const getChannelStatus = (enabled: boolean) => {
    return enabled ? 'active' : 'inactive';
  };

  const getChannelStatusText = (enabled: boolean) => {
    return enabled ? 'Ativo' : 'Inativo';
  };

  return (
    <div className="space-y-6">
      {/* Canais de Notificação */}
      <SettingsGroup title="Canais de Notificação" description="Configure os canais pelos quais você deseja receber notificações">
        {/* Email */}
        <SettingsCard
          title="Email"
          description="Receba notificações por email"
          icon={Mail}
          status={getChannelStatus(settings.emailEnabled)}
          statusText={getChannelStatusText(settings.emailEnabled)}
          headerAction={
            <div className="flex items-center gap-2">
              {onTest && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTest('email')}
                  disabled={!settings.emailEnabled || testingChannel === 'email' || isLoading}
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  {testingChannel === 'email' ? 'Testando...' : 'Testar'}
                </Button>
              )}
              <Switch
                checked={settings.emailEnabled}
                onCheckedChange={(checked) => updateSetting('emailEnabled', checked)}
                disabled={isLoading}
              />
            </div>
          }
        >
          {settings.emailEnabled && (
            <SettingsSection>
              <SettingsItem label="Endereço de Email" description="Email para receber notificações">
                <Input
                  type="email"
                  value={settings.emailAddress}
                  onChange={(e) => updateSetting('emailAddress', e.target.value)}
                  placeholder="seu@email.com"
                  className="w-64"
                  disabled={isLoading}
                />
              </SettingsItem>
              
              <SettingsItem label="Frequência" description="Com que frequência agrupar notificações">
                <Select
                  value={settings.emailFrequency}
                  onValueChange={(value) => updateSetting('emailFrequency', value as any)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(frequencyLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </SettingsItem>
              
              <div className="space-y-3">
                <Label className="text-sm font-medium">Tipos de Notificação</Label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(settings.emailTypes).map(([type, enabled]) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`email-${type}`}
                        checked={enabled}
                        onCheckedChange={(checked) => updateEmailType(type as any, !!checked)}
                        disabled={isLoading}
                      />
                      <Label htmlFor={`email-${type}`} className="text-sm">
                        {notificationTypeLabels[type as keyof typeof notificationTypeLabels]}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </SettingsSection>
          )}
        </SettingsCard>

        {/* SMS */}
        <SettingsCard
          title="SMS"
          description="Receba notificações por mensagem de texto"
          icon={MessageSquare}
          status={getChannelStatus(settings.smsEnabled)}
          statusText={getChannelStatusText(settings.smsEnabled)}
          headerAction={
            <div className="flex items-center gap-2">
              {onTest && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTest('sms')}
                  disabled={!settings.smsEnabled || testingChannel === 'sms' || isLoading}
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  {testingChannel === 'sms' ? 'Testando...' : 'Testar'}
                </Button>
              )}
              <Switch
                checked={settings.smsEnabled}
                onCheckedChange={(checked) => updateSetting('smsEnabled', checked)}
                disabled={isLoading}
              />
            </div>
          }
        >
          {settings.smsEnabled && (
            <SettingsSection>
              <SettingsItem label="Número de Telefone" description="Número para receber SMS">
                <Input
                  type="tel"
                  value={settings.phoneNumber}
                  onChange={(e) => updateSetting('phoneNumber', e.target.value)}
                  placeholder="+55 11 99999-9999"
                  className="w-64"
                  disabled={isLoading}
                />
              </SettingsItem>
              
              <div className="space-y-3">
                <Label className="text-sm font-medium">Tipos de Notificação</Label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(settings.smsTypes).map(([type, enabled]) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`sms-${type}`}
                        checked={enabled}
                        onCheckedChange={(checked) => updateSmsType(type as any, !!checked)}
                        disabled={isLoading}
                      />
                      <Label htmlFor={`sms-${type}`} className="text-sm">
                        {notificationTypeLabels[type as keyof typeof notificationTypeLabels]}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </SettingsSection>
          )}
        </SettingsCard>

        {/* Push Notifications */}
        <SettingsCard
          title="Notificações Push"
          description="Receba notificações push no navegador"
          icon={Smartphone}
          status={getChannelStatus(settings.pushEnabled)}
          statusText={getChannelStatusText(settings.pushEnabled)}
          headerAction={
            <div className="flex items-center gap-2">
              {onTest && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTest('push')}
                  disabled={!settings.pushEnabled || testingChannel === 'push' || isLoading}
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  {testingChannel === 'push' ? 'Testando...' : 'Testar'}
                </Button>
              )}
              <Switch
                checked={settings.pushEnabled}
                onCheckedChange={(checked) => updateSetting('pushEnabled', checked)}
                disabled={isLoading}
              />
            </div>
          }
        >
          {settings.pushEnabled && (
            <SettingsSection>
              <div className="space-y-3">
                <Label className="text-sm font-medium">Tipos de Notificação</Label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(settings.pushTypes).map(([type, enabled]) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`push-${type}`}
                        checked={enabled}
                        onCheckedChange={(checked) => updatePushType(type as any, !!checked)}
                        disabled={isLoading}
                      />
                      <Label htmlFor={`push-${type}`} className="text-sm">
                        {notificationTypeLabels[type as keyof typeof notificationTypeLabels]}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </SettingsSection>
          )}
        </SettingsCard>

        {/* Desktop Notifications */}
        <SettingsCard
          title="Notificações Desktop"
          description="Configurações para notificações do sistema operacional"
          icon={Monitor}
          status={getChannelStatus(settings.desktopEnabled)}
          statusText={getChannelStatusText(settings.desktopEnabled)}
          headerAction={
            <div className="flex items-center gap-2">
              {onTest && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTest('desktop')}
                  disabled={!settings.desktopEnabled || testingChannel === 'desktop' || isLoading}
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  {testingChannel === 'desktop' ? 'Testando...' : 'Testar'}
                </Button>
              )}
              <Switch
                checked={settings.desktopEnabled}
                onCheckedChange={(checked) => updateSetting('desktopEnabled', checked)}
                disabled={isLoading}
              />
            </div>
          }
        >
          {settings.desktopEnabled && (
            <SettingsSection>
              <SettingsItem label="Som" description="Reproduzir som ao receber notificação">
                <Switch
                  checked={settings.desktopSound}
                  onCheckedChange={(checked) => updateSetting('desktopSound', checked)}
                  disabled={isLoading}
                />
              </SettingsItem>
              
              <SettingsItem label="Badge" description="Mostrar contador de notificações">
                <Switch
                  checked={settings.desktopBadge}
                  onCheckedChange={(checked) => updateSetting('desktopBadge', checked)}
                  disabled={isLoading}
                />
              </SettingsItem>
              
              <SettingsItem label="Prévia" description="Mostrar prévia do conteúdo">
                <Switch
                  checked={settings.desktopPreview}
                  onCheckedChange={(checked) => updateSetting('desktopPreview', checked)}
                  disabled={isLoading}
                />
              </SettingsItem>
            </SettingsSection>
          )}
        </SettingsCard>
      </SettingsGroup>

      {/* Configurações de Horário */}
      <SettingsGroup title="Configurações de Horário" description="Configure quando receber notificações">
        <SettingsCard
          title="Horário Silencioso"
          description="Defina um período para não receber notificações"
          icon={Clock}
          status={getChannelStatus(settings.quietHoursEnabled)}
          statusText={getChannelStatusText(settings.quietHoursEnabled)}
          headerAction={
            <Switch
              checked={settings.quietHoursEnabled}
              onCheckedChange={(checked) => updateSetting('quietHoursEnabled', checked)}
              disabled={isLoading}
            />
          }
        >
          {settings.quietHoursEnabled && (
            <SettingsSection>
              <div className="grid grid-cols-2 gap-4">
                <SettingsItem label="Início">
                  <Input
                    type="time"
                    value={settings.quietHoursStart}
                    onChange={(e) => updateSetting('quietHoursStart', e.target.value)}
                    disabled={isLoading}
                  />
                </SettingsItem>
                
                <SettingsItem label="Fim">
                  <Input
                    type="time"
                    value={settings.quietHoursEnd}
                    onChange={(e) => updateSetting('quietHoursEnd', e.target.value)}
                    disabled={isLoading}
                  />
                </SettingsItem>
              </div>
            </SettingsSection>
          )}
        </SettingsCard>
        
        <SettingsItem label="Notificações nos Fins de Semana" description="Receber notificações aos sábados e domingos">
          <Switch
            checked={settings.weekendNotifications}
            onCheckedChange={(checked) => updateSetting('weekendNotifications', checked)}
            disabled={isLoading}
          />
        </SettingsItem>
      </SettingsGroup>

      {/* Configurações Avançadas */}
      <SettingsGroup title="Configurações Avançadas" description="Opções avançadas de notificação">
        <SettingsItem label="Agrupar Similares" description="Agrupar notificações do mesmo tipo">
          <Switch
            checked={settings.groupSimilar}
            onCheckedChange={(checked) => updateSetting('groupSimilar', checked)}
            disabled={isLoading}
          />
        </SettingsItem>
        
        <SettingsItem label="Marcar como Lida Automaticamente" description="Marcar notificações como lidas após visualização">
          <Switch
            checked={settings.autoMarkRead}
            onCheckedChange={(checked) => updateSetting('autoMarkRead', checked)}
            disabled={isLoading}
          />
        </SettingsItem>
        
        <SettingsItem label="Retenção (dias)" description="Por quantos dias manter o histórico de notificações">
          <Select
            value={settings.retentionDays.toString()}
            onValueChange={(value) => updateSetting('retentionDays', parseInt(value))}
            disabled={isLoading}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 dias</SelectItem>
              <SelectItem value="15">15 dias</SelectItem>
              <SelectItem value="30">30 dias</SelectItem>
              <SelectItem value="60">60 dias</SelectItem>
              <SelectItem value="90">90 dias</SelectItem>
            </SelectContent>
          </Select>
        </SettingsItem>
      </SettingsGroup>

      {/* Alert de Permissões */}
      {settings.pushEnabled && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Para receber notificações push, você precisa permitir notificações no seu navegador.
            Clique no ícone de cadeado na barra de endereços para gerenciar permissões.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export { defaultSettings as defaultNotificationSettings };