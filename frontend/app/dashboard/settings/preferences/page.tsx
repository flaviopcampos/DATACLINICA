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
import {
  Settings,
  Palette,
  Globe,
  Clock,
  Layout,
  Eye,
  Volume2,
  Keyboard,
  Mouse,
  Monitor,
  Smartphone,
  Calendar,
  FileText,
  Bell,
  Shield,
  Database,
  ArrowLeft,
  Save,
  RotateCcw,
  Download,
  Upload,
  Sun,
  Moon,
  Laptop,
  Zap,
  Users,
  Activity,
  BarChart3,
  Filter,
  Search,
  Grid,
  List,
  Table
} from 'lucide-react';
import Link from 'next/link';

interface SystemPreferences {
  // Aparência
  theme: 'light' | 'dark' | 'system';
  colorScheme: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  fontSize: number;
  compactMode: boolean;
  sidebarCollapsed: boolean;
  showAnimations: boolean;
  
  // Idioma e Região
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  currency: string;
  numberFormat: string;
  
  // Interface
  defaultView: 'grid' | 'list' | 'table';
  itemsPerPage: number;
  showTooltips: boolean;
  autoSave: boolean;
  confirmActions: boolean;
  keyboardShortcuts: boolean;
  
  // Dashboard
  dashboardLayout: 'default' | 'compact' | 'detailed';
  showQuickStats: boolean;
  showRecentActivity: boolean;
  showNotifications: boolean;
  refreshInterval: number;
  
  // Notificações
  soundEnabled: boolean;
  soundVolume: number;
  desktopNotifications: boolean;
  emailDigest: 'none' | 'daily' | 'weekly';
  
  // Acessibilidade
  highContrast: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  
  // Avançado
  debugMode: boolean;
  performanceMode: boolean;
  cacheEnabled: boolean;
  offlineMode: boolean;
}

const defaultPreferences: SystemPreferences = {
  theme: 'system',
  colorScheme: 'blue',
  fontSize: 14,
  compactMode: false,
  sidebarCollapsed: false,
  showAnimations: true,
  language: 'pt-BR',
  timezone: 'America/Sao_Paulo',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
  currency: 'BRL',
  numberFormat: 'pt-BR',
  defaultView: 'grid',
  itemsPerPage: 20,
  showTooltips: true,
  autoSave: true,
  confirmActions: true,
  keyboardShortcuts: true,
  dashboardLayout: 'default',
  showQuickStats: true,
  showRecentActivity: true,
  showNotifications: true,
  refreshInterval: 30,
  soundEnabled: true,
  soundVolume: 50,
  desktopNotifications: true,
  emailDigest: 'daily',
  highContrast: false,
  reducedMotion: false,
  screenReader: false,
  keyboardNavigation: false,
  debugMode: false,
  performanceMode: false,
  cacheEnabled: true,
  offlineMode: false
};

const languages = [
  { value: 'pt-BR', label: 'Português (Brasil)' },
  { value: 'en-US', label: 'English (US)' },
  { value: 'es-ES', label: 'Español' },
  { value: 'fr-FR', label: 'Français' },
  { value: 'de-DE', label: 'Deutsch' }
];

const timezones = [
  { value: 'America/Sao_Paulo', label: 'São Paulo (UTC-3)' },
  { value: 'America/New_York', label: 'New York (UTC-5)' },
  { value: 'Europe/London', label: 'London (UTC+0)' },
  { value: 'Europe/Paris', label: 'Paris (UTC+1)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (UTC+9)' }
];

const colorSchemes = [
  { value: 'blue', label: 'Azul', color: 'bg-blue-500' },
  { value: 'green', label: 'Verde', color: 'bg-green-500' },
  { value: 'purple', label: 'Roxo', color: 'bg-purple-500' },
  { value: 'orange', label: 'Laranja', color: 'bg-orange-500' },
  { value: 'red', label: 'Vermelho', color: 'bg-red-500' }
];

export default function PreferencesPage() {
  const [preferences, setPreferences] = useState<SystemPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const updatePreference = <K extends keyof SystemPreferences>(
    key: K,
    value: SystemPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHasChanges(false);
      console.log('Preferências salvas:', preferences);
    } catch (error) {
      console.error('Erro ao salvar preferências:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (confirm('Tem certeza que deseja restaurar as configurações padrão?')) {
      setPreferences(defaultPreferences);
      setHasChanges(true);
    }
  };

  const exportPreferences = () => {
    const dataStr = JSON.stringify(preferences, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dataclinica-preferences.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importPreferences = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          setPreferences({ ...defaultPreferences, ...imported });
          setHasChanges(true);
        } catch (error) {
          console.error('Erro ao importar preferências:', error);
          alert('Erro ao importar arquivo de preferências');
        }
      };
      reader.readAsText(file);
    }
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
              <Settings className="h-8 w-8 text-primary" />
              Preferências do Sistema
            </h1>
            <p className="text-muted-foreground mt-2">
              Personalize a interface e comportamento do sistema
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

      {/* Preferences Tabs */}
      <Tabs defaultValue="appearance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Aparência
          </TabsTrigger>
          <TabsTrigger value="language" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Idioma
          </TabsTrigger>
          <TabsTrigger value="interface" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Interface
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="accessibility" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Acessibilidade
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Avançado
          </TabsTrigger>
        </TabsList>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Aparência
              </CardTitle>
              <CardDescription>
                Configure o tema, cores e visual do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme */}
              <div className="space-y-3">
                <Label>Tema</Label>
                <RadioGroup
                  value={preferences.theme}
                  onValueChange={(value) => updatePreference('theme', value as any)}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="light" />
                    <Label htmlFor="light" className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Claro
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="dark" />
                    <Label htmlFor="dark" className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Escuro
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="system" id="system" />
                    <Label htmlFor="system" className="flex items-center gap-2">
                      <Laptop className="h-4 w-4" />
                      Sistema
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              {/* Color Scheme */}
              <div className="space-y-3">
                <Label>Esquema de Cores</Label>
                <div className="grid grid-cols-5 gap-3">
                  {colorSchemes.map((scheme) => (
                    <button
                      key={scheme.value}
                      onClick={() => updatePreference('colorScheme', scheme.value as any)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        preferences.colorScheme === scheme.value
                          ? 'border-primary'
                          : 'border-border hover:border-muted-foreground'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full ${scheme.color} mx-auto mb-2`} />
                      <p className="text-xs font-medium">{scheme.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Font Size */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Tamanho da Fonte</Label>
                  <span className="text-sm text-muted-foreground">{preferences.fontSize}px</span>
                </div>
                <Slider
                  value={[preferences.fontSize]}
                  onValueChange={([value]) => updatePreference('fontSize', value)}
                  min={12}
                  max={20}
                  step={1}
                  className="w-full"
                />
              </div>

              <Separator />

              {/* Visual Options */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modo Compacto</Label>
                    <p className="text-sm text-muted-foreground">
                      Reduz o espaçamento entre elementos
                    </p>
                  </div>
                  <Switch
                    checked={preferences.compactMode}
                    onCheckedChange={(checked) => updatePreference('compactMode', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Sidebar Recolhida</Label>
                    <p className="text-sm text-muted-foreground">
                      Inicia com a barra lateral recolhida
                    </p>
                  </div>
                  <Switch
                    checked={preferences.sidebarCollapsed}
                    onCheckedChange={(checked) => updatePreference('sidebarCollapsed', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Animações</Label>
                    <p className="text-sm text-muted-foreground">
                      Exibe animações e transições
                    </p>
                  </div>
                  <Switch
                    checked={preferences.showAnimations}
                    onCheckedChange={(checked) => updatePreference('showAnimations', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Language Tab */}
        <TabsContent value="language" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Idioma e Região
              </CardTitle>
              <CardDescription>
                Configure idioma, fuso horário e formatos regionais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Language */}
                <div className="space-y-2">
                  <Label>Idioma</Label>
                  <Select
                    value={preferences.language}
                    onValueChange={(value) => updatePreference('language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Timezone */}
                <div className="space-y-2">
                  <Label>Fuso Horário</Label>
                  <Select
                    value={preferences.timezone}
                    onValueChange={(value) => updatePreference('timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Format */}
                <div className="space-y-2">
                  <Label>Formato de Data</Label>
                  <Select
                    value={preferences.dateFormat}
                    onValueChange={(value) => updatePreference('dateFormat', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Time Format */}
                <div className="space-y-2">
                  <Label>Formato de Hora</Label>
                  <Select
                    value={preferences.timeFormat}
                    onValueChange={(value) => updatePreference('timeFormat', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">24 horas (14:30)</SelectItem>
                      <SelectItem value="12h">12 horas (2:30 PM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Currency */}
                <div className="space-y-2">
                  <Label>Moeda</Label>
                  <Select
                    value={preferences.currency}
                    onValueChange={(value) => updatePreference('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRL">Real (R$)</SelectItem>
                      <SelectItem value="USD">Dólar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Number Format */}
                <div className="space-y-2">
                  <Label>Formato de Números</Label>
                  <Select
                    value={preferences.numberFormat}
                    onValueChange={(value) => updatePreference('numberFormat', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">1.234,56</SelectItem>
                      <SelectItem value="en-US">1,234.56</SelectItem>
                      <SelectItem value="de-DE">1.234,56</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Interface Tab */}
        <TabsContent value="interface" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                Interface
              </CardTitle>
              <CardDescription>
                Configure comportamento e visualização da interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Default View */}
                <div className="space-y-2">
                  <Label>Visualização Padrão</Label>
                  <Select
                    value={preferences.defaultView}
                    onValueChange={(value) => updatePreference('defaultView', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">
                        <div className="flex items-center gap-2">
                          <Grid className="h-4 w-4" />
                          Grade
                        </div>
                      </SelectItem>
                      <SelectItem value="list">
                        <div className="flex items-center gap-2">
                          <List className="h-4 w-4" />
                          Lista
                        </div>
                      </SelectItem>
                      <SelectItem value="table">
                        <div className="flex items-center gap-2">
                          <Table className="h-4 w-4" />
                          Tabela
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Items Per Page */}
                <div className="space-y-2">
                  <Label>Itens por Página</Label>
                  <Select
                    value={preferences.itemsPerPage.toString()}
                    onValueChange={(value) => updatePreference('itemsPerPage', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Interface Options */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mostrar Tooltips</Label>
                    <p className="text-sm text-muted-foreground">
                      Exibe dicas ao passar o mouse sobre elementos
                    </p>
                  </div>
                  <Switch
                    checked={preferences.showTooltips}
                    onCheckedChange={(checked) => updatePreference('showTooltips', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Salvamento Automático</Label>
                    <p className="text-sm text-muted-foreground">
                      Salva alterações automaticamente
                    </p>
                  </div>
                  <Switch
                    checked={preferences.autoSave}
                    onCheckedChange={(checked) => updatePreference('autoSave', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Confirmar Ações</Label>
                    <p className="text-sm text-muted-foreground">
                      Solicita confirmação para ações importantes
                    </p>
                  </div>
                  <Switch
                    checked={preferences.confirmActions}
                    onCheckedChange={(checked) => updatePreference('confirmActions', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Atalhos de Teclado</Label>
                    <p className="text-sm text-muted-foreground">
                      Habilita atalhos de teclado
                    </p>
                  </div>
                  <Switch
                    checked={preferences.keyboardShortcuts}
                    onCheckedChange={(checked) => updatePreference('keyboardShortcuts', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Dashboard
              </CardTitle>
              <CardDescription>
                Configure a aparência e comportamento do dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dashboard Layout */}
              <div className="space-y-3">
                <Label>Layout do Dashboard</Label>
                <RadioGroup
                  value={preferences.dashboardLayout}
                  onValueChange={(value) => updatePreference('dashboardLayout', value as any)}
                  className="grid grid-cols-3 gap-4"
                >
                  <div className="flex items-center space-x-2 border rounded-lg p-4">
                    <RadioGroupItem value="default" id="default-layout" />
                    <Label htmlFor="default-layout" className="flex-1">
                      <div className="font-medium">Padrão</div>
                      <div className="text-xs text-muted-foreground">Layout equilibrado</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4">
                    <RadioGroupItem value="compact" id="compact-layout" />
                    <Label htmlFor="compact-layout" className="flex-1">
                      <div className="font-medium">Compacto</div>
                      <div className="text-xs text-muted-foreground">Mais informações</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4">
                    <RadioGroupItem value="detailed" id="detailed-layout" />
                    <Label htmlFor="detailed-layout" className="flex-1">
                      <div className="font-medium">Detalhado</div>
                      <div className="text-xs text-muted-foreground">Mais espaçamento</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              {/* Dashboard Options */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Estatísticas Rápidas</Label>
                    <p className="text-sm text-muted-foreground">
                      Exibe cards com estatísticas principais
                    </p>
                  </div>
                  <Switch
                    checked={preferences.showQuickStats}
                    onCheckedChange={(checked) => updatePreference('showQuickStats', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Atividade Recente</Label>
                    <p className="text-sm text-muted-foreground">
                      Mostra atividades recentes do sistema
                    </p>
                  </div>
                  <Switch
                    checked={preferences.showRecentActivity}
                    onCheckedChange={(checked) => updatePreference('showRecentActivity', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações no Dashboard</Label>
                    <p className="text-sm text-muted-foreground">
                      Exibe notificações importantes
                    </p>
                  </div>
                  <Switch
                    checked={preferences.showNotifications}
                    onCheckedChange={(checked) => updatePreference('showNotifications', checked)}
                  />
                </div>
              </div>

              <Separator />

              {/* Refresh Interval */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Intervalo de Atualização</Label>
                  <span className="text-sm text-muted-foreground">{preferences.refreshInterval}s</span>
                </div>
                <Slider
                  value={[preferences.refreshInterval]}
                  onValueChange={([value]) => updatePreference('refreshInterval', value)}
                  min={10}
                  max={300}
                  step={10}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accessibility Tab */}
        <TabsContent value="accessibility" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Acessibilidade
              </CardTitle>
              <CardDescription>
                Configure opções de acessibilidade e usabilidade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Sound Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Sons Habilitados</Label>
                    <p className="text-sm text-muted-foreground">
                      Reproduz sons para notificações e alertas
                    </p>
                  </div>
                  <Switch
                    checked={preferences.soundEnabled}
                    onCheckedChange={(checked) => updatePreference('soundEnabled', checked)}
                  />
                </div>
                
                {preferences.soundEnabled && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Volume do Som</Label>
                      <span className="text-sm text-muted-foreground">{preferences.soundVolume}%</span>
                    </div>
                    <Slider
                      value={[preferences.soundVolume]}
                      onValueChange={([value]) => updatePreference('soundVolume', value)}
                      min={0}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>
                )}
              </div>

              <Separator />

              {/* Accessibility Options */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alto Contraste</Label>
                    <p className="text-sm text-muted-foreground">
                      Aumenta o contraste para melhor visibilidade
                    </p>
                  </div>
                  <Switch
                    checked={preferences.highContrast}
                    onCheckedChange={(checked) => updatePreference('highContrast', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Movimento Reduzido</Label>
                    <p className="text-sm text-muted-foreground">
                      Reduz animações e movimentos
                    </p>
                  </div>
                  <Switch
                    checked={preferences.reducedMotion}
                    onCheckedChange={(checked) => updatePreference('reducedMotion', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Suporte a Leitor de Tela</Label>
                    <p className="text-sm text-muted-foreground">
                      Otimiza para leitores de tela
                    </p>
                  </div>
                  <Switch
                    checked={preferences.screenReader}
                    onCheckedChange={(checked) => updatePreference('screenReader', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Navegação por Teclado</Label>
                    <p className="text-sm text-muted-foreground">
                      Melhora a navegação usando apenas o teclado
                    </p>
                  </div>
                  <Switch
                    checked={preferences.keyboardNavigation}
                    onCheckedChange={(checked) => updatePreference('keyboardNavigation', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Configurações Avançadas
              </CardTitle>
              <CardDescription>
                Opções avançadas para usuários experientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Advanced Options */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modo Debug</Label>
                    <p className="text-sm text-muted-foreground">
                      Exibe informações de debug no console
                    </p>
                  </div>
                  <Switch
                    checked={preferences.debugMode}
                    onCheckedChange={(checked) => updatePreference('debugMode', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modo Performance</Label>
                    <p className="text-sm text-muted-foreground">
                      Otimiza para melhor performance
                    </p>
                  </div>
                  <Switch
                    checked={preferences.performanceMode}
                    onCheckedChange={(checked) => updatePreference('performanceMode', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Cache Habilitado</Label>
                    <p className="text-sm text-muted-foreground">
                      Utiliza cache para melhor performance
                    </p>
                  </div>
                  <Switch
                    checked={preferences.cacheEnabled}
                    onCheckedChange={(checked) => updatePreference('cacheEnabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modo Offline</Label>
                    <p className="text-sm text-muted-foreground">
                      Permite uso básico sem conexão
                    </p>
                  </div>
                  <Switch
                    checked={preferences.offlineMode}
                    onCheckedChange={(checked) => updatePreference('offlineMode', checked)}
                  />
                </div>
              </div>

              <Separator />

              {/* Import/Export */}
              <div className="space-y-4">
                <h4 className="font-medium">Backup de Preferências</h4>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={exportPreferences}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Preferências
                  </Button>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".json"
                      onChange={importPreferences}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Importar Preferências
                    </Button>
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