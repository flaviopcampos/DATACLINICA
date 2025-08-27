'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bell,
  Mail,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  Settings,
  Volume2,
  VolumeX,
  Clock,
  Users,
  Calendar,
  FileText,
  Shield,
  Activity,
  Zap,
  ArrowLeft,
  Save,
  RotateCcw,
  TestTube
} from 'lucide-react';
import Link from 'next/link';

interface NotificationSettings {
  email: {
    enabled: boolean;
    appointments: boolean;
    reminders: boolean;
    reports: boolean;
    security: boolean;
    system: boolean;
    frequency: 'immediate' | 'daily' | 'weekly';
    address: string;
  };
  push: {
    enabled: boolean;
    appointments: boolean;
    emergencies: boolean;
    reminders: boolean;
    system: boolean;
    sound: boolean;
  };
  sms: {
    enabled: boolean;
    appointments: boolean;
    emergencies: boolean;
    reminders: boolean;
    phone: string;
  };
  system: {
    enabled: boolean;
    criticalAlerts: boolean;
    maintenanceAlerts: boolean;
    securityAlerts: boolean;
    performanceAlerts: boolean;
    sound: boolean;
    desktop: boolean;
  };
}

const defaultSettings: NotificationSettings = {
  email: {
    enabled: true,
    appointments: true,
    reminders: true,
    reports: false,
    security: true,
    system: false,
    frequency: 'immediate',
    address: 'admin@dataclinica.com'
  },
  push: {
    enabled: true,
    appointments: true,
    emergencies: true,
    reminders: true,
    system: false,
    sound: true
  },
  sms: {
    enabled: false,
    appointments: false,
    emergencies: true,
    reminders: false,
    phone: '+55 11 99999-9999'
  },
  system: {
    enabled: true,
    criticalAlerts: true,
    maintenanceAlerts: false,
    securityAlerts: true,
    performanceAlerts: false,
    sound: true,
    desktop: true
  }
};

export default function NotificationsPage() {
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [testNotification, setTestNotification] = useState<string | null>(null);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Configurações salvas:', settings);
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSettings(defaultSettings);
  };

  const handleTestNotification = async (type: string) => {
    setTestNotification(type);
    try {
      // Simular envio de notificação de teste
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(`Notificação de teste enviada: ${type}`);
    } catch (error) {
      console.error('Erro ao enviar notificação de teste:', error);
    } finally {
      setTestNotification(null);
    }
  };

  const updateEmailSettings = (key: keyof NotificationSettings['email'], value: any) => {
    setSettings(prev => ({
      ...prev,
      email: { ...prev.email, [key]: value }
    }));
  };

  const updatePushSettings = (key: keyof NotificationSettings['push'], value: any) => {
    setSettings(prev => ({
      ...prev,
      push: { ...prev.push, [key]: value }
    }));
  };

  const updateSmsSettings = (key: keyof NotificationSettings['sms'], value: any) => {
    setSettings(prev => ({
      ...prev,
      sms: { ...prev.sms, [key]: value }
    }));
  };

  const updateSystemSettings = (key: keyof NotificationSettings['system'], value: any) => {
    setSettings(prev => ({
      ...prev,
      system: { ...prev.system, [key]: value }
    }));
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
              <Bell className="h-8 w-8 text-primary" />
              Configurações de Notificações
            </h1>
            <p className="text-muted-foreground mt-2">
              Configure como e quando receber notificações do sistema
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Restaurar Padrão
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-lg font-bold">
                  {settings.email.enabled ? (
                    <span className="text-green-600">Ativo</span>
                  ) : (
                    <span className="text-gray-600">Inativo</span>
                  )}
                </p>
              </div>
              <Mail className={`h-6 w-6 ${settings.email.enabled ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Push</p>
                <p className="text-lg font-bold">
                  {settings.push.enabled ? (
                    <span className="text-green-600">Ativo</span>
                  ) : (
                    <span className="text-gray-600">Inativo</span>
                  )}
                </p>
              </div>
              <Smartphone className={`h-6 w-6 ${settings.push.enabled ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">SMS</p>
                <p className="text-lg font-bold">
                  {settings.sms.enabled ? (
                    <span className="text-green-600">Ativo</span>
                  ) : (
                    <span className="text-gray-600">Inativo</span>
                  )}
                </p>
              </div>
              <Smartphone className={`h-6 w-6 ${settings.sms.enabled ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sistema</p>
                <p className="text-lg font-bold">
                  {settings.system.enabled ? (
                    <span className="text-green-600">Ativo</span>
                  ) : (
                    <span className="text-gray-600">Inativo</span>
                  )}
                </p>
              </div>
              <AlertTriangle className={`h-6 w-6 ${settings.system.enabled ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notification Settings Tabs */}
      <Tabs defaultValue="email" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="push" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Push
          </TabsTrigger>
          <TabsTrigger value="sms" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            SMS
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Sistema
          </TabsTrigger>
        </TabsList>

        {/* Email Notifications */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Notificações por Email
                  </CardTitle>
                  <CardDescription>
                    Configure quando e como receber emails do sistema
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestNotification('email')}
                    disabled={testNotification === 'email'}
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    {testNotification === 'email' ? 'Enviando...' : 'Testar'}
                  </Button>
                  <Switch
                    checked={settings.email.enabled}
                    onCheckedChange={(checked) => updateEmailSettings('enabled', checked)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email-address">Endereço de Email</Label>
                  <Input
                    id="email-address"
                    type="email"
                    value={settings.email.address}
                    onChange={(e) => updateEmailSettings('address', e.target.value)}
                    disabled={!settings.email.enabled}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-frequency">Frequência</Label>
                  <Select
                    value={settings.email.frequency}
                    onValueChange={(value) => updateEmailSettings('frequency', value)}
                    disabled={!settings.email.enabled}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Imediato</SelectItem>
                      <SelectItem value="daily">Resumo Diário</SelectItem>
                      <SelectItem value="weekly">Resumo Semanal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Tipos de Notificação</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Agendamentos</p>
                        <p className="text-sm text-muted-foreground">Novos agendamentos e alterações</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.email.appointments}
                      onCheckedChange={(checked) => updateEmailSettings('appointments', checked)}
                      disabled={!settings.email.enabled}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Lembretes</p>
                        <p className="text-sm text-muted-foreground">Lembretes de consultas e tarefas</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.email.reminders}
                      onCheckedChange={(checked) => updateEmailSettings('reminders', checked)}
                      disabled={!settings.email.enabled}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Relatórios</p>
                        <p className="text-sm text-muted-foreground">Relatórios automáticos e análises</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.email.reports}
                      onCheckedChange={(checked) => updateEmailSettings('reports', checked)}
                      disabled={!settings.email.enabled}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Segurança</p>
                        <p className="text-sm text-muted-foreground">Alertas de segurança e login</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.email.security}
                      onCheckedChange={(checked) => updateEmailSettings('security', checked)}
                      disabled={!settings.email.enabled}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Sistema</p>
                        <p className="text-sm text-muted-foreground">Atualizações e manutenção</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.email.system}
                      onCheckedChange={(checked) => updateEmailSettings('system', checked)}
                      disabled={!settings.email.enabled}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Push Notifications */}
        <TabsContent value="push">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Notificações Push
                  </CardTitle>
                  <CardDescription>
                    Receba alertas em tempo real no navegador
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestNotification('push')}
                    disabled={testNotification === 'push'}
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    {testNotification === 'push' ? 'Enviando...' : 'Testar'}
                  </Button>
                  <Switch
                    checked={settings.push.enabled}
                    onCheckedChange={(checked) => updatePushSettings('enabled', checked)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Agendamentos</p>
                      <p className="text-sm text-muted-foreground">Novos agendamentos</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.push.appointments}
                    onCheckedChange={(checked) => updatePushSettings('appointments', checked)}
                    disabled={!settings.push.enabled}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Emergências</p>
                      <p className="text-sm text-muted-foreground">Alertas críticos</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.push.emergencies}
                    onCheckedChange={(checked) => updatePushSettings('emergencies', checked)}
                    disabled={!settings.push.enabled}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Lembretes</p>
                      <p className="text-sm text-muted-foreground">Lembretes de consultas</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.push.reminders}
                    onCheckedChange={(checked) => updatePushSettings('reminders', checked)}
                    disabled={!settings.push.enabled}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Sistema</p>
                      <p className="text-sm text-muted-foreground">Atualizações do sistema</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.push.system}
                    onCheckedChange={(checked) => updatePushSettings('system', checked)}
                    disabled={!settings.push.enabled}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {settings.push.sound ? (
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <VolumeX className="h-4 w-4 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium">Som das Notificações</p>
                    <p className="text-sm text-muted-foreground">Reproduzir som ao receber notificações</p>
                  </div>
                </div>
                <Switch
                  checked={settings.push.sound}
                  onCheckedChange={(checked) => updatePushSettings('sound', checked)}
                  disabled={!settings.push.enabled}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SMS Notifications */}
        <TabsContent value="sms">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Notificações por SMS
                  </CardTitle>
                  <CardDescription>
                    Receba alertas importantes via mensagem de texto
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestNotification('sms')}
                    disabled={testNotification === 'sms'}
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    {testNotification === 'sms' ? 'Enviando...' : 'Testar'}
                  </Button>
                  <Switch
                    checked={settings.sms.enabled}
                    onCheckedChange={(checked) => updateSmsSettings('enabled', checked)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="phone-number">Número de Telefone</Label>
                <Input
                  id="phone-number"
                  type="tel"
                  value={settings.sms.phone}
                  onChange={(e) => updateSmsSettings('phone', e.target.value)}
                  disabled={!settings.sms.enabled}
                  placeholder="+55 11 99999-9999"
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Tipos de Notificação SMS</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Agendamentos</p>
                        <p className="text-sm text-muted-foreground">Confirmações e lembretes de consultas</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.sms.appointments}
                      onCheckedChange={(checked) => updateSmsSettings('appointments', checked)}
                      disabled={!settings.sms.enabled}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Emergências</p>
                        <p className="text-sm text-muted-foreground">Alertas críticos e urgentes</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.sms.emergencies}
                      onCheckedChange={(checked) => updateSmsSettings('emergencies', checked)}
                      disabled={!settings.sms.enabled}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Lembretes</p>
                        <p className="text-sm text-muted-foreground">Lembretes de consultas próximas</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.sms.reminders}
                      onCheckedChange={(checked) => updateSmsSettings('reminders', checked)}
                      disabled={!settings.sms.enabled}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">Importante</p>
                    <p className="text-sm text-yellow-700">
                      As notificações por SMS podem gerar custos adicionais. 
                      Recomendamos usar apenas para alertas críticos.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Notifications */}
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Alertas do Sistema
                  </CardTitle>
                  <CardDescription>
                    Configure alertas críticos e de monitoramento
                  </CardDescription>
                </div>
                <Switch
                  checked={settings.system.enabled}
                  onCheckedChange={(checked) => updateSystemSettings('enabled', checked)}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <div>
                      <p className="font-medium">Alertas Críticos</p>
                      <p className="text-sm text-muted-foreground">Falhas do sistema e erros críticos</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.system.criticalAlerts}
                    onCheckedChange={(checked) => updateSystemSettings('criticalAlerts', checked)}
                    disabled={!settings.system.enabled}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Settings className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="font-medium">Manutenção</p>
                      <p className="text-sm text-muted-foreground">Atualizações e manutenção programada</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.system.maintenanceAlerts}
                    onCheckedChange={(checked) => updateSystemSettings('maintenanceAlerts', checked)}
                    disabled={!settings.system.enabled}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="font-medium">Segurança</p>
                      <p className="text-sm text-muted-foreground">Tentativas de login e violações</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.system.securityAlerts}
                    onCheckedChange={(checked) => updateSystemSettings('securityAlerts', checked)}
                    disabled={!settings.system.enabled}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Activity className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="font-medium">Performance</p>
                      <p className="text-sm text-muted-foreground">Alertas de performance e recursos</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.system.performanceAlerts}
                    onCheckedChange={(checked) => updateSystemSettings('performanceAlerts', checked)}
                    disabled={!settings.system.enabled}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Configurações de Exibição</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {settings.system.sound ? (
                        <Volume2 className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <VolumeX className="h-4 w-4 text-muted-foreground" />
                      )}
                      <div>
                        <p className="font-medium">Som dos Alertas</p>
                        <p className="text-sm text-muted-foreground">Reproduzir som para alertas</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.system.sound}
                      onCheckedChange={(checked) => updateSystemSettings('sound', checked)}
                      disabled={!settings.system.enabled}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Monitor className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Notificações Desktop</p>
                        <p className="text-sm text-muted-foreground">Mostrar na área de trabalho</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.system.desktop}
                      onCheckedChange={(checked) => updateSystemSettings('desktop', checked)}
                      disabled={!settings.system.enabled}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}