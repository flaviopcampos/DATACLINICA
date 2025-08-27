import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useSessions } from '@/hooks/useSessions';
import { 
  Settings, 
  Shield, 
  Clock, 
  Smartphone, 
  Bell, 
  Lock, 
  AlertTriangle,
  CheckCircle,
  Info,
  Save,
  RotateCcw
} from 'lucide-react';
import { SessionSettings as SessionSettingsType } from '@/types/sessions';
import { toast } from 'sonner';

function SessionSettings() {
  const { 
    sessionSettings: currentSettings, 
    isLoading,
    updateSettings,
    isUpdatingSettings 
  } = useSessions();

  const [settings, setSettings] = useState<SessionSettingsType>({
    id: '',
    user_id: '',
    max_concurrent_sessions: 5,
    session_timeout_minutes: 24 * 60,
    auto_logout_inactive_minutes: 2 * 60,
    require_2fa_for_new_devices: true,
    notify_new_logins: true,
    notify_unusual_locations: true,
    block_suspicious_activity: true,
    trusted_devices_only: false,
    created_at: '',
    updated_at: '',
    ...currentSettings
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleSettingChange = (key: keyof SessionSettingsType, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      updateSettings(settings);
      setHasChanges(false);
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    }
  };

  const handleReset = () => {
    if (currentSettings) {
      setSettings(currentSettings);
      setHasChanges(false);
    }
  };

  // getSecurityLevelDescription function removed - no longer needed

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações de Sessão</h1>
          <p className="text-muted-foreground">
            Configure como suas sessões são gerenciadas e protegidas
          </p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Resetar
            </Button>
          )}
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || isUpdatingSettings}
          >
            <Save className="h-4 w-4 mr-2" />
            {isUpdatingSettings ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      {hasChanges && (
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Você tem alterações não salvas. Clique em "Salvar" para aplicá-las.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Security Level card removed - securityLevel is not part of SessionSettings interface */}

        {/* Session Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Gerenciamento de Sessões
            </CardTitle>
            <CardDescription>
              Configure limites e timeouts para suas sessões
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Sessões Simultâneas Máximas</Label>
                <div className="space-y-2">
                  <Slider
                    value={[settings.max_concurrent_sessions]}
                    onValueChange={([value]: number[]) => handleSettingChange('max_concurrent_sessions', value)}
                    max={20}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>1</span>
                    <span className="font-medium">{settings.max_concurrent_sessions}</span>
                    <span>20</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Timeout de Sessão (horas)</Label>
                <div className="space-y-2">
                  <Slider
                    value={[Math.floor(settings.session_timeout_minutes / 60)]}
                    onValueChange={([value]: number[]) => handleSettingChange('session_timeout_minutes', value * 60)}
                    max={168} // 7 days
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>1h</span>
                    <span className="font-medium">{Math.floor(settings.session_timeout_minutes / 60)}h</span>
                    <span>7d</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Timeout de Inatividade (horas)</Label>
                <div className="space-y-2">
                  <Slider
                    value={[Math.floor(settings.auto_logout_inactive_minutes / 60)]}
                    onValueChange={([value]: number[]) => handleSettingChange('auto_logout_inactive_minutes', value * 60)}
                    max={24}
                    min={0.5}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>30m</span>
                    <span className="font-medium">{Math.floor(settings.auto_logout_inactive_minutes / 60)}h</span>
                    <span>24h</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Requer Reautenticação</Label>
                  <p className="text-sm text-muted-foreground">
                    Solicita senha periodicamente para ações sensíveis
                  </p>
                </div>
                <Switch
                  checked={settings.require_2fa_for_new_devices}
                  onCheckedChange={(checked) => handleSettingChange('require_2fa_for_new_devices', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Permitir Múltiplos Dispositivos</Label>
                  <p className="text-sm text-muted-foreground">
                    Permite login simultâneo em diferentes dispositivos
                  </p>
                </div>
                <Switch
                  checked={!settings.trusted_devices_only}
                  onCheckedChange={(checked) => handleSettingChange('trusted_devices_only', !checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Device Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Segurança de Dispositivos
            </CardTitle>
            <CardDescription>
              Configure como novos dispositivos são tratados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Apenas Dispositivos Confiáveis</Label>
                <p className="text-sm text-muted-foreground">
                  Bloqueia login de dispositivos não marcados como confiáveis
                </p>
              </div>
              <Switch
                checked={settings.trusted_devices_only}
                onCheckedChange={(checked) => handleSettingChange('trusted_devices_only', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Lembrar Dispositivos Confiáveis</Label>
                <p className="text-sm text-muted-foreground">
                  Mantém dispositivos marcados como confiáveis
                </p>
              </div>
              <Switch
                checked={settings.require_2fa_for_new_devices}
                onCheckedChange={(checked) => handleSettingChange('require_2fa_for_new_devices', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>2FA para Novos Dispositivos</Label>
                <p className="text-sm text-muted-foreground">
                  Exige autenticação de dois fatores em dispositivos novos
                </p>
              </div>
              <Switch
                checked={settings.require_2fa_for_new_devices}
                onCheckedChange={(checked) => handleSettingChange('require_2fa_for_new_devices', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Recursos de Segurança
            </CardTitle>
            <CardDescription>
              Configure detecção e resposta a atividades suspeitas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Segurança Baseada em Localização</Label>
                <p className="text-sm text-muted-foreground">
                  Detecta logins de localizações incomuns
                </p>
              </div>
              <Switch
                checked={settings.notify_unusual_locations}
                onCheckedChange={(checked) => handleSettingChange('notify_unusual_locations', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Detecção de Atividade Suspeita</Label>
                <p className="text-sm text-muted-foreground">
                  Monitora padrões de uso anômalos
                </p>
              </div>
              <Switch
                checked={settings.block_suspicious_activity}
                onCheckedChange={(checked) => handleSettingChange('block_suspicious_activity', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Logout Automático em Atividade Suspeita</Label>
                <p className="text-sm text-muted-foreground">
                  Encerra automaticamente sessões com atividade suspeita
                </p>
              </div>
              <Switch
                checked={settings.block_suspicious_activity}
                onCheckedChange={(checked) => handleSettingChange('block_suspicious_activity', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
            </CardTitle>
            <CardDescription>
              Configure quando e como ser notificado sobre atividades de sessão
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <h4 className="font-medium">Tipos de Notificação</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Novos Logins</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifica sobre novos logins
                    </p>
                  </div>
                  <Switch
                    checked={settings.notify_new_logins}
                    onCheckedChange={(checked) => handleSettingChange('notify_new_logins', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mudança de Localização</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifica sobre logins de novas localizações
                    </p>
                  </div>
                  <Switch
                    checked={settings.notify_unusual_locations}
                    onCheckedChange={(checked) => handleSettingChange('notify_unusual_locations', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Atividade Suspeita</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifica sobre atividades suspeitas
                    </p>
                  </div>
                  <Switch
                    checked={settings.block_suspicious_activity}
                    onCheckedChange={(checked) => handleSettingChange('block_suspicious_activity', checked)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Canais de Notificação</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações por Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações por email
                    </p>
                  </div>
                  <Switch
                    checked={settings.notify_new_logins}
                    onCheckedChange={(checked) => handleSettingChange('notify_new_logins', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações Push</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações push no navegador
                    </p>
                  </div>
                  <Switch
                    checked={settings.notify_unusual_locations}
                    onCheckedChange={(checked) => handleSettingChange('notify_unusual_locations', checked)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button (Fixed) */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            onClick={handleSave} 
            disabled={isUpdatingSettings}
            size="lg"
            className="shadow-lg"
          >
            <Save className="h-4 w-4 mr-2" />
            {isUpdatingSettings ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      )}
    </div>
  );
}

export default SessionSettings;