import React, { useState, useEffect } from 'react';
import { Bell, Save, TestTube, Volume2, VolumeX, Mail, MessageSquare, Smartphone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useBackupNotifications } from '../../hooks/useBackupNotifications';
import {
  NotificationType,
  NotificationPriority,
  NotificationChannel,
  NotificationSettings
} from '../../types/notifications';

interface BackupNotificationSettingsProps {
  userId?: string;
  clinicId?: string;
  onSettingsChange?: (settings: NotificationSettings) => void;
}

function BackupNotificationSettings({ 
  userId, 
  clinicId, 
  onSettingsChange 
}: BackupNotificationSettingsProps) {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    channels: [NotificationChannel.IN_APP],
    priorities: [NotificationPriority.HIGH, NotificationPriority.MEDIUM],
    types: {
      [NotificationType.BACKUP_STARTED]: true,
      [NotificationType.BACKUP_COMPLETED]: true,
      [NotificationType.BACKUP_FAILED]: true,
      [NotificationType.BACKUP_SCHEDULED]: false,
      [NotificationType.BACKUP_VERIFICATION_FAILED]: true,
      [NotificationType.STORAGE_SPACE_LOW]: true,
      [NotificationType.BACKUP_CLEANUP]: false,
      [NotificationType.RESTORE_STARTED]: true,
      [NotificationType.RESTORE_COMPLETED]: true,
      [NotificationType.RESTORE_FAILED]: true
    },
    backup: {
      notifyOnStart: true,
      notifyOnComplete: true,
      notifyOnFailure: true,
      notifyOnScheduled: false,
      notifyOnVerificationFailure: true,
      notifyOnStorageSpaceLow: true,
      notifyOnCleanup: false,
      quietHours: {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00'
      },
      batchNotifications: false,
      maxNotificationsPerHour: 10
    },
    restore: {
      notifyOnStart: true,
      notifyOnComplete: true,
      notifyOnFailure: true,
      requireConfirmation: true,
      notifyOnProgress: false,
      progressUpdateInterval: 10
    },
    sound: {
      enabled: true,
      volume: 0.5,
      customSounds: {
        [NotificationType.BACKUP_COMPLETED]: 'success',
        [NotificationType.BACKUP_FAILED]: 'error',
        [NotificationType.RESTORE_COMPLETED]: 'success',
        [NotificationType.RESTORE_FAILED]: 'error'
      }
    },
    email: {
      address: '',
      enabled: false,
      dailyDigest: false,
      weeklyReport: true
    },
    sms: {
      phoneNumber: '',
      enabled: false,
      onlyHighPriority: true
    },
    webhook: {
      url: '',
      enabled: false,
      secret: '',
      retryAttempts: 3
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const {
    settings: currentSettings,
    updateSettings,
    testNotification,
    isLoading
  } = useBackupNotifications({ userId, clinicId });

  useEffect(() => {
    if (currentSettings) {
      setSettings(currentSettings);
    }
  }, [currentSettings]);

  const handleSettingChange = (path: string, value: any) => {
    const keys = path.split('.');
    const newSettings = { ...settings };
    
    let current: any = newSettings;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    setSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  const handleChannelToggle = (channel: NotificationChannel, enabled: boolean) => {
    const newChannels = enabled
      ? [...settings.channels, channel]
      : settings.channels.filter(c => c !== channel);
    
    handleSettingChange('channels', newChannels);
  };

  const handlePriorityToggle = (priority: NotificationPriority, enabled: boolean) => {
    const newPriorities = enabled
      ? [...settings.priorities, priority]
      : settings.priorities.filter(p => p !== priority);
    
    handleSettingChange('priorities', newPriorities);
  };

  const handleTypeToggle = (type: NotificationType, enabled: boolean) => {
    handleSettingChange(`types.${type}`, enabled);
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await updateSettings(settings);
      toast.success('Configurações de notificação salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar configurações de notificação');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestNotification = async () => {
    setIsTesting(true);
    try {
      await testNotification({
        type: NotificationType.BACKUP_COMPLETED,
        title: 'Teste de Notificação',
        message: 'Esta é uma notificação de teste do sistema de backup.',
        priority: NotificationPriority.MEDIUM
      });
      toast.success('Notificação de teste enviada!');
    } catch (error) {
      toast.error('Erro ao enviar notificação de teste');
    } finally {
      setIsTesting(false);
    }
  };

  const getTypeLabel = (type: NotificationType) => {
    const labels = {
      [NotificationType.BACKUP_STARTED]: 'Backup Iniciado',
      [NotificationType.BACKUP_COMPLETED]: 'Backup Concluído',
      [NotificationType.BACKUP_FAILED]: 'Backup Falhou',
      [NotificationType.BACKUP_SCHEDULED]: 'Backup Agendado',
      [NotificationType.BACKUP_VERIFICATION_FAILED]: 'Verificação Falhou',
      [NotificationType.STORAGE_SPACE_LOW]: 'Espaço de Armazenamento Baixo',
      [NotificationType.BACKUP_CLEANUP]: 'Limpeza de Backup',
      [NotificationType.RESTORE_STARTED]: 'Restauração Iniciada',
      [NotificationType.RESTORE_COMPLETED]: 'Restauração Concluída',
      [NotificationType.RESTORE_FAILED]: 'Restauração Falhou'
    };
    return labels[type] || type;
  };

  const getChannelIcon = (channel: NotificationChannel) => {
    switch (channel) {
      case NotificationChannel.EMAIL:
        return <Mail className="h-4 w-4" />;
      case NotificationChannel.SMS:
        return <Smartphone className="h-4 w-4" />;
      case NotificationChannel.WEBHOOK:
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getChannelLabel = (channel: NotificationChannel) => {
    const labels = {
      [NotificationChannel.IN_APP]: 'Notificações no App',
      [NotificationChannel.EMAIL]: 'Email',
      [NotificationChannel.SMS]: 'SMS',
      [NotificationChannel.WEBHOOK]: 'Webhook'
    };
    return labels[channel] || channel;
  };

  const getPriorityLabel = (priority: NotificationPriority) => {
    const labels = {
      [NotificationPriority.HIGH]: 'Alta',
      [NotificationPriority.MEDIUM]: 'Média',
      [NotificationPriority.LOW]: 'Baixa'
    };
    return labels[priority] || priority;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Carregando configurações...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Configurações Gerais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Configurações Gerais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Ativar Notificações</Label>
              <p className="text-sm text-muted-foreground">
                Habilitar ou desabilitar todas as notificações de backup
              </p>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(checked) => handleSettingChange('enabled', checked)}
            />
          </div>
          
          <Separator />
          
          <div>
            <Label className="text-base font-medium mb-3 block">Canais de Notificação</Label>
            <div className="grid grid-cols-2 gap-4">
              {Object.values(NotificationChannel).map((channel) => (
                <div key={channel} className="flex items-center space-x-2">
                  <Switch
                    checked={settings.channels.includes(channel)}
                    onCheckedChange={(checked) => handleChannelToggle(channel, checked)}
                  />
                  <div className="flex items-center gap-2">
                    {getChannelIcon(channel)}
                    <Label>{getChannelLabel(channel)}</Label>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div>
            <Label className="text-base font-medium mb-3 block">Prioridades de Notificação</Label>
            <div className="flex gap-4">
              {Object.values(NotificationPriority).map((priority) => (
                <div key={priority} className="flex items-center space-x-2">
                  <Switch
                    checked={settings.priorities.includes(priority)}
                    onCheckedChange={(checked) => handlePriorityToggle(priority, checked)}
                  />
                  <Label>{getPriorityLabel(priority)}</Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tipos de Notificação */}
      <Card>
        <CardHeader>
          <CardTitle>Tipos de Notificação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium mb-3 block">Notificações de Backup</Label>
              <div className="space-y-3">
                {[
                  NotificationType.BACKUP_STARTED,
                  NotificationType.BACKUP_COMPLETED,
                  NotificationType.BACKUP_FAILED,
                  NotificationType.BACKUP_SCHEDULED,
                  NotificationType.BACKUP_VERIFICATION_FAILED,
                  NotificationType.STORAGE_SPACE_LOW,
                  NotificationType.BACKUP_CLEANUP
                ].map((type) => (
                  <div key={type} className="flex items-center justify-between">
                    <Label>{getTypeLabel(type)}</Label>
                    <Switch
                      checked={settings.types[type] || false}
                      onCheckedChange={(checked) => handleTypeToggle(type, checked)}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <Label className="text-base font-medium mb-3 block">Notificações de Restauração</Label>
              <div className="space-y-3">
                {[
                  NotificationType.RESTORE_STARTED,
                  NotificationType.RESTORE_COMPLETED,
                  NotificationType.RESTORE_FAILED
                ].map((type) => (
                  <div key={type} className="flex items-center justify-between">
                    <Label>{getTypeLabel(type)}</Label>
                    <Switch
                      checked={settings.types[type] || false}
                      onCheckedChange={(checked) => handleTypeToggle(type, checked)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Som */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {settings.sound?.enabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            Configurações de Som
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Ativar Sons</Label>
            <Switch
              checked={settings.sound?.enabled || false}
              onCheckedChange={(checked) => handleSettingChange('sound.enabled', checked)}
            />
          </div>
          
          {settings.sound?.enabled && (
            <div>
              <Label>Volume ({Math.round((settings.sound?.volume || 0.5) * 100)}%)</Label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.sound?.volume || 0.5}
                onChange={(e) => handleSettingChange('sound.volume', parseFloat(e.target.value))}
                className="w-full mt-2"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configurações de Email */}
      {settings.channels.includes(NotificationChannel.EMAIL) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Configurações de Email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Endereço de Email</Label>
              <Input
                type="email"
                value={settings.email?.address || ''}
                onChange={(e) => handleSettingChange('email.address', e.target.value)}
                placeholder="seu@email.com"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Resumo Diário</Label>
              <Switch
                checked={settings.email?.dailyDigest || false}
                onCheckedChange={(checked) => handleSettingChange('email.dailyDigest', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Relatório Semanal</Label>
              <Switch
                checked={settings.email?.weeklyReport || false}
                onCheckedChange={(checked) => handleSettingChange('email.weeklyReport', checked)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Horário Silencioso */}
      <Card>
        <CardHeader>
          <CardTitle>Horário Silencioso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Ativar Horário Silencioso</Label>
              <p className="text-sm text-muted-foreground">
                Não enviar notificações durante o período especificado
              </p>
            </div>
            <Switch
              checked={settings.backup?.quietHours?.enabled || false}
              onCheckedChange={(checked) => handleSettingChange('backup.quietHours.enabled', checked)}
            />
          </div>
          
          {settings.backup?.quietHours?.enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Início</Label>
                <Input
                  type="time"
                  value={settings.backup?.quietHours?.startTime || '22:00'}
                  onChange={(e) => handleSettingChange('backup.quietHours.startTime', e.target.value)}
                />
              </div>
              <div>
                <Label>Fim</Label>
                <Input
                  type="time"
                  value={settings.backup?.quietHours?.endTime || '08:00'}
                  onChange={(e) => handleSettingChange('backup.quietHours.endTime', e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleTestNotification}
          disabled={isTesting || !settings.enabled}
        >
          <TestTube className="h-4 w-4 mr-2" />
          {isTesting ? 'Enviando...' : 'Testar Notificação'}
        </Button>
        
        <Button onClick={handleSaveSettings} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
}

export default BackupNotificationSettings;