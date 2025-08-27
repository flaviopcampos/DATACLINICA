'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Volume2, 
  VolumeX, 
  Smartphone, 
  Mail, 
  MessageSquare,
  Settings,
  TestTube
} from 'lucide-react';
import { useNotifications } from './NotificationProvider';
import { AlertSeverity } from '@/types/bi/alerts';

interface NotificationSettingsProps {
  className?: string;
}

export function NotificationSettings({ className }: NotificationSettingsProps) {
  const { 
    isEnabled, 
    setEnabled, 
    soundEnabled, 
    setSoundEnabled,
    showToast,
    showNotification
  } = useNotifications();
  
  // Função para testar notificação
  const testNotification = (severity: AlertSeverity) => {
    const testNotifications = {
      low: {
        id: `test-${Date.now()}`,
        title: 'Teste - Informação',
        message: 'Esta é uma notificação de teste com severidade baixa.',
        severity: 'low' as AlertSeverity,
        type: 'info' as const,
        triggeredAt: new Date().toISOString(),
        isRead: false,
        ruleId: 'test-rule',
        ruleName: 'Teste',
        actions: []
      },
      medium: {
        id: `test-${Date.now()}`,
        title: 'Teste - Atenção',
        message: 'Esta é uma notificação de teste com severidade média.',
        severity: 'medium' as AlertSeverity,
        type: 'warning' as const,
        triggeredAt: new Date().toISOString(),
        isRead: false,
        ruleId: 'test-rule',
        ruleName: 'Teste',
        actions: []
      },
      high: {
        id: `test-${Date.now()}`,
        title: 'Teste - Importante',
        message: 'Esta é uma notificação de teste com severidade alta.',
        severity: 'high' as AlertSeverity,
        type: 'warning' as const,
        triggeredAt: new Date().toISOString(),
        isRead: false,
        ruleId: 'test-rule',
        ruleName: 'Teste',
        actions: []
      },
      critical: {
        id: `test-${Date.now()}`,
        title: 'Teste - Crítico',
        message: 'Esta é uma notificação de teste com severidade crítica.',
        severity: 'critical' as AlertSeverity,
        type: 'error' as const,
        triggeredAt: new Date().toISOString(),
        isRead: false,
        ruleId: 'test-rule',
        ruleName: 'Teste',
        actions: []
      }
    };
    
    showNotification(testNotifications[severity]);
  };
  
  // Verificar permissão de notificação do navegador
  const browserNotificationStatus = 'Notification' in window ? Notification.permission : 'unsupported';
  
  const requestBrowserPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        showToast('Permissão para notificações concedida!', 'success');
      } else {
        showToast('Permissão para notificações negada.', 'error');
      }
    }
  };
  
  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações de Notificação
          </CardTitle>
          <CardDescription>
            Configure como você deseja receber alertas e notificações do sistema.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Configurações Gerais */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Configurações Gerais</h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-gray-500" />
                <div>
                  <Label htmlFor="notifications-enabled" className="text-sm font-medium">
                    Ativar Notificações
                  </Label>
                  <p className="text-xs text-gray-500">
                    Receber alertas e notificações do sistema
                  </p>
                </div>
              </div>
              <Switch
                id="notifications-enabled"
                checked={isEnabled}
                onCheckedChange={setEnabled}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {soundEnabled ? (
                  <Volume2 className="h-4 w-4 text-gray-500" />
                ) : (
                  <VolumeX className="h-4 w-4 text-gray-500" />
                )}
                <div>
                  <Label htmlFor="sound-enabled" className="text-sm font-medium">
                    Sons de Notificação
                  </Label>
                  <p className="text-xs text-gray-500">
                    Reproduzir sons quando receber alertas
                  </p>
                </div>
              </div>
              <Switch
                id="sound-enabled"
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
                disabled={!isEnabled}
              />
            </div>
          </div>
          
          <Separator />
          
          {/* Notificações do Navegador */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Notificações do Navegador</h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="h-4 w-4 text-gray-500" />
                <div>
                  <Label className="text-sm font-medium">
                    Notificações do Sistema
                  </Label>
                  <p className="text-xs text-gray-500">
                    Mostrar notificações mesmo quando a aba não estiver ativa
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={browserNotificationStatus === 'granted' ? 'default' : 
                          browserNotificationStatus === 'denied' ? 'destructive' : 'secondary'}
                >
                  {browserNotificationStatus === 'granted' ? 'Ativado' :
                   browserNotificationStatus === 'denied' ? 'Negado' :
                   browserNotificationStatus === 'default' ? 'Pendente' : 'Não Suportado'}
                </Badge>
                {browserNotificationStatus !== 'granted' && browserNotificationStatus !== 'unsupported' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={requestBrowserPermission}
                  >
                    Ativar
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Canais de Notificação (Futuro) */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Canais de Notificação</h3>
            <p className="text-xs text-gray-500 mb-4">
              Funcionalidades futuras para integração com outros sistemas.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg opacity-50">
                <Mail className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-400">Email</p>
                  <p className="text-xs text-gray-400">Em breve</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 border rounded-lg opacity-50">
                <MessageSquare className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-400">SMS</p>
                  <p className="text-xs text-gray-400">Em breve</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 border rounded-lg opacity-50">
                <Bell className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-400">Push</p>
                  <p className="text-xs text-gray-400">Em breve</p>
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Teste de Notificações */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              Testar Notificações
            </h3>
            <p className="text-xs text-gray-500">
              Teste diferentes tipos de notificação para verificar suas configurações.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => testNotification('low')}
                disabled={!isEnabled}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                Baixa
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => testNotification('medium')}
                disabled={!isEnabled}
                className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
              >
                Média
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => testNotification('high')}
                disabled={!isEnabled}
                className="text-orange-600 border-orange-200 hover:bg-orange-50"
              >
                Alta
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => testNotification('critical')}
                disabled={!isEnabled}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Crítica
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default NotificationSettings;