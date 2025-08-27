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
import { SettingsCard, SettingsSection, SettingsItem, SettingsGroup } from './SettingsCard';
import {
  Palette,
  Globe,
  Monitor,
  Layout,
  Eye,
  Volume2,
  Keyboard,
  Mouse,
  Accessibility,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Save,
  RotateCcw,
  Sun,
  Moon,
  Laptop,
  Type,
  Zap,
  Clock,
  Calendar,
  MapPin,
  Languages,
  Gauge
} from 'lucide-react';

export interface SystemPreferences {
  // Aparência
  appearance: {
    theme: 'light' | 'dark' | 'system';
    colorScheme: 'blue' | 'green' | 'purple' | 'orange' | 'red';
    fontSize: 'small' | 'medium' | 'large' | 'extra-large';
    fontFamily: 'system' | 'inter' | 'roboto' | 'open-sans';
    compactMode: boolean;
    animations: boolean;
    reducedMotion: boolean;
    highContrast: boolean;
  };
  
  // Idioma e Região
  localization: {
    language: string;
    region: string;
    timezone: string;
    dateFormat: 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd';
    timeFormat: '12h' | '24h';
    currency: string;
    numberFormat: 'decimal' | 'comma';
    firstDayOfWeek: 'sunday' | 'monday';
  };
  
  // Interface
  interface: {
    sidebarCollapsed: boolean;
    showBreadcrumbs: boolean;
    showTooltips: boolean;
    autoSave: boolean;
    autoSaveInterval: number; // segundos
    confirmActions: boolean;
    showKeyboardShortcuts: boolean;
    densityMode: 'comfortable' | 'compact' | 'spacious';
  };
  
  // Dashboard
  dashboard: {
    defaultView: 'overview' | 'patients' | 'appointments' | 'reports';
    refreshInterval: number; // segundos
    showWelcomeMessage: boolean;
    showQuickActions: boolean;
    showRecentActivity: boolean;
    showStatistics: boolean;
    maxRecentItems: number;
    autoRefresh: boolean;
  };
  
  // Acessibilidade
  accessibility: {
    screenReader: boolean;
    keyboardNavigation: boolean;
    focusIndicators: boolean;
    skipLinks: boolean;
    altTextImages: boolean;
    captionVideos: boolean;
    audioDescriptions: boolean;
    colorBlindSupport: boolean;
  };
  
  // Avançado
  advanced: {
    debugMode: boolean;
    performanceMode: boolean;
    cacheEnabled: boolean;
    offlineMode: boolean;
    dataCompression: boolean;
    telemetryEnabled: boolean;
    errorReporting: boolean;
    betaFeatures: boolean;
    developerTools: boolean;
  };
}

interface SystemPreferencesProps {
  preferences: SystemPreferences;
  onPreferencesChange: (preferences: SystemPreferences) => void;
  onSave?: () => void;
  onReset?: () => void;
  onImport?: (file: File) => void;
  onExport?: () => void;
  isLoading?: boolean;
  isDirty?: boolean;
}

const defaultPreferences: SystemPreferences = {
  appearance: {
    theme: 'system',
    colorScheme: 'blue',
    fontSize: 'medium',
    fontFamily: 'system',
    compactMode: false,
    animations: true,
    reducedMotion: false,
    highContrast: false
  },
  localization: {
    language: 'pt-BR',
    region: 'BR',
    timezone: 'America/Sao_Paulo',
    dateFormat: 'dd/mm/yyyy',
    timeFormat: '24h',
    currency: 'BRL',
    numberFormat: 'decimal',
    firstDayOfWeek: 'monday'
  },
  interface: {
    sidebarCollapsed: false,
    showBreadcrumbs: true,
    showTooltips: true,
    autoSave: true,
    autoSaveInterval: 30,
    confirmActions: true,
    showKeyboardShortcuts: true,
    densityMode: 'comfortable'
  },
  dashboard: {
    defaultView: 'overview',
    refreshInterval: 300, // 5 minutos
    showWelcomeMessage: true,
    showQuickActions: true,
    showRecentActivity: true,
    showStatistics: true,
    maxRecentItems: 10,
    autoRefresh: true
  },
  accessibility: {
    screenReader: false,
    keyboardNavigation: true,
    focusIndicators: true,
    skipLinks: false,
    altTextImages: true,
    captionVideos: false,
    audioDescriptions: false,
    colorBlindSupport: false
  },
  advanced: {
    debugMode: false,
    performanceMode: false,
    cacheEnabled: true,
    offlineMode: false,
    dataCompression: true,
    telemetryEnabled: true,
    errorReporting: true,
    betaFeatures: false,
    developerTools: false
  }
};

const themeIcons = {
  light: Sun,
  dark: Moon,
  system: Laptop
};

const colorSchemes = {
  blue: { name: 'Azul', color: 'bg-blue-500' },
  green: { name: 'Verde', color: 'bg-green-500' },
  purple: { name: 'Roxo', color: 'bg-purple-500' },
  orange: { name: 'Laranja', color: 'bg-orange-500' },
  red: { name: 'Vermelho', color: 'bg-red-500' }
};

const languages = {
  'pt-BR': 'Português (Brasil)',
  'en-US': 'English (US)',
  'es-ES': 'Español (España)',
  'fr-FR': 'Français (France)',
  'de-DE': 'Deutsch (Deutschland)',
  'it-IT': 'Italiano (Italia)'
};

const timezones = {
  'America/Sao_Paulo': 'São Paulo (UTC-3)',
  'America/New_York': 'New York (UTC-5)',
  'Europe/London': 'London (UTC+0)',
  'Europe/Paris': 'Paris (UTC+1)',
  'Asia/Tokyo': 'Tokyo (UTC+9)',
  'Australia/Sydney': 'Sydney (UTC+10)'
};

export function SystemPreferences({
  preferences,
  onPreferencesChange,
  onSave,
  onReset,
  onImport,
  onExport,
  isLoading = false,
  isDirty = false
}: SystemPreferencesProps) {
  const [importFile, setImportFile] = useState<File | null>(null);

  const updatePreference = <T extends keyof SystemPreferences>(
    section: T,
    key: keyof SystemPreferences[T],
    value: any
  ) => {
    onPreferencesChange({
      ...preferences,
      [section]: {
        ...preferences[section],
        [key]: value
      }
    });
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onImport) {
      setImportFile(file);
      onImport(file);
    }
  };

  const formatInterval = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}min`;
    return `${Math.floor(seconds / 3600)}h`;
  };

  return (
    <div className="space-y-6">
      {/* Ações Rápidas */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Preferências do Sistema</h2>
          <p className="text-muted-foreground">Personalize a interface e comportamento do sistema</p>
        </div>
        <div className="flex items-center gap-2">
          {onImport && (
            <div>
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
                id="import-preferences"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('import-preferences')?.click()}
                disabled={isLoading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Importar
              </Button>
            </div>
          )}
          {onExport && (
            <Button
              variant="outline"
              onClick={onExport}
              disabled={isLoading}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
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

      <Tabs defaultValue="appearance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="appearance">Aparência</TabsTrigger>
          <TabsTrigger value="localization">Idioma</TabsTrigger>
          <TabsTrigger value="interface">Interface</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="accessibility">Acessibilidade</TabsTrigger>
          <TabsTrigger value="advanced">Avançado</TabsTrigger>
        </TabsList>

        {/* Aparência */}
        <TabsContent value="appearance" className="space-y-6">
          <SettingsGroup title="Tema e Cores" description="Personalize a aparência visual do sistema">
            <SettingsCard
              title="Tema"
              description="Escolha entre tema claro, escuro ou automático"
              icon={Palette}
            >
              <SettingsSection>
                <SettingsItem label="Tema" description="Aparência geral da interface">
                  <div className="flex gap-2">
                    {(['light', 'dark', 'system'] as const).map((theme) => {
                      const Icon = themeIcons[theme];
                      return (
                        <Button
                          key={theme}
                          variant={preferences.appearance.theme === theme ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updatePreference('appearance', 'theme', theme)}
                          disabled={isLoading}
                        >
                          <Icon className="h-4 w-4 mr-2" />
                          {theme === 'light' ? 'Claro' : theme === 'dark' ? 'Escuro' : 'Sistema'}
                        </Button>
                      );
                    })}
                  </div>
                </SettingsItem>
                
                <SettingsItem label="Esquema de Cores" description="Cor principal da interface">
                  <div className="flex gap-2">
                    {Object.entries(colorSchemes).map(([key, scheme]) => (
                      <Button
                        key={key}
                        variant={preferences.appearance.colorScheme === key ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updatePreference('appearance', 'colorScheme', key)}
                        disabled={isLoading}
                        className="flex items-center gap-2"
                      >
                        <div className={`w-3 h-3 rounded-full ${scheme.color}`} />
                        {scheme.name}
                      </Button>
                    ))}
                  </div>
                </SettingsItem>
              </SettingsSection>
            </SettingsCard>
            
            <SettingsCard
              title="Tipografia"
              description="Configure fontes e tamanhos de texto"
              icon={Type}
            >
              <SettingsSection>
                <div className="grid grid-cols-2 gap-4">
                  <SettingsItem label="Tamanho da Fonte" description="Tamanho base do texto">
                    <Select
                      value={preferences.appearance.fontSize}
                      onValueChange={(value) => updatePreference('appearance', 'fontSize', value as any)}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Pequeno</SelectItem>
                        <SelectItem value="medium">Médio</SelectItem>
                        <SelectItem value="large">Grande</SelectItem>
                        <SelectItem value="extra-large">Extra Grande</SelectItem>
                      </SelectContent>
                    </Select>
                  </SettingsItem>
                  
                  <SettingsItem label="Família da Fonte" description="Tipo de fonte utilizada">
                    <Select
                      value={preferences.appearance.fontFamily}
                      onValueChange={(value) => updatePreference('appearance', 'fontFamily', value as any)}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system">Sistema</SelectItem>
                        <SelectItem value="inter">Inter</SelectItem>
                        <SelectItem value="roboto">Roboto</SelectItem>
                        <SelectItem value="open-sans">Open Sans</SelectItem>
                      </SelectContent>
                    </Select>
                  </SettingsItem>
                </div>
              </SettingsSection>
            </SettingsCard>
            
            <SettingsCard
              title="Comportamento Visual"
              description="Configure animações e efeitos visuais"
              icon={Eye}
            >
              <SettingsSection>
                <div className="grid grid-cols-2 gap-4">
                  <SettingsItem label="Modo Compacto" description="Interface mais densa">
                    <Switch
                      checked={preferences.appearance.compactMode}
                      onCheckedChange={(checked) => updatePreference('appearance', 'compactMode', checked)}
                      disabled={isLoading}
                    />
                  </SettingsItem>
                  
                  <SettingsItem label="Animações" description="Efeitos de transição">
                    <Switch
                      checked={preferences.appearance.animations}
                      onCheckedChange={(checked) => updatePreference('appearance', 'animations', checked)}
                      disabled={isLoading}
                    />
                  </SettingsItem>
                  
                  <SettingsItem label="Movimento Reduzido" description="Menos animações para acessibilidade">
                    <Switch
                      checked={preferences.appearance.reducedMotion}
                      onCheckedChange={(checked) => updatePreference('appearance', 'reducedMotion', checked)}
                      disabled={isLoading}
                    />
                  </SettingsItem>
                  
                  <SettingsItem label="Alto Contraste" description="Cores mais contrastantes">
                    <Switch
                      checked={preferences.appearance.highContrast}
                      onCheckedChange={(checked) => updatePreference('appearance', 'highContrast', checked)}
                      disabled={isLoading}
                    />
                  </SettingsItem>
                </div>
              </SettingsSection>
            </SettingsCard>
          </SettingsGroup>
        </TabsContent>

        {/* Idioma e Região */}
        <TabsContent value="localization" className="space-y-6">
          <SettingsGroup title="Localização" description="Configure idioma, região e formatos">
            <SettingsCard
              title="Idioma e Região"
              description="Defina o idioma da interface e configurações regionais"
              icon={Languages}
            >
              <SettingsSection>
                <div className="grid grid-cols-2 gap-4">
                  <SettingsItem label="Idioma" description="Idioma da interface">
                    <Select
                      value={preferences.localization.language}
                      onValueChange={(value) => updatePreference('localization', 'language', value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(languages).map(([code, name]) => (
                          <SelectItem key={code} value={code}>{name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </SettingsItem>
                  
                  <SettingsItem label="Fuso Horário" description="Fuso horário local">
                    <Select
                      value={preferences.localization.timezone}
                      onValueChange={(value) => updatePreference('localization', 'timezone', value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(timezones).map(([code, name]) => (
                          <SelectItem key={code} value={code}>{name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </SettingsItem>
                </div>
              </SettingsSection>
            </SettingsCard>
            
            <SettingsCard
              title="Formatos"
              description="Configure formatos de data, hora e números"
              icon={Calendar}
            >
              <SettingsSection>
                <div className="grid grid-cols-2 gap-4">
                  <SettingsItem label="Formato de Data" description="Como as datas são exibidas">
                    <Select
                      value={preferences.localization.dateFormat}
                      onValueChange={(value) => updatePreference('localization', 'dateFormat', value as any)}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dd/mm/yyyy">DD/MM/AAAA</SelectItem>
                        <SelectItem value="mm/dd/yyyy">MM/DD/AAAA</SelectItem>
                        <SelectItem value="yyyy-mm-dd">AAAA-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </SettingsItem>
                  
                  <SettingsItem label="Formato de Hora" description="12h ou 24h">
                    <Select
                      value={preferences.localization.timeFormat}
                      onValueChange={(value) => updatePreference('localization', 'timeFormat', value as any)}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12h">12h</SelectItem>
                        <SelectItem value="24h">24h</SelectItem>
                      </SelectContent>
                    </Select>
                  </SettingsItem>
                  
                  <SettingsItem label="Moeda" description="Moeda padrão">
                    <Select
                      value={preferences.localization.currency}
                      onValueChange={(value) => updatePreference('localization', 'currency', value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BRL">BRL</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </SettingsItem>
                  
                  <SettingsItem label="Primeiro Dia da Semana" description="Início da semana no calendário">
                    <Select
                      value={preferences.localization.firstDayOfWeek}
                      onValueChange={(value) => updatePreference('localization', 'firstDayOfWeek', value as any)}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sunday">Domingo</SelectItem>
                        <SelectItem value="monday">Segunda</SelectItem>
                      </SelectContent>
                    </Select>
                  </SettingsItem>
                </div>
              </SettingsSection>
            </SettingsCard>
          </SettingsGroup>
        </TabsContent>

        {/* Interface */}
        <TabsContent value="interface" className="space-y-6">
          <SettingsGroup title="Comportamento da Interface" description="Configure como a interface se comporta">
            <SettingsCard
              title="Layout"
              description="Configurações de layout e navegação"
              icon={Layout}
            >
              <SettingsSection>
                <div className="grid grid-cols-2 gap-4">
                  <SettingsItem label="Sidebar Recolhida" description="Manter sidebar minimizada">
                    <Switch
                      checked={preferences.interface.sidebarCollapsed}
                      onCheckedChange={(checked) => updatePreference('interface', 'sidebarCollapsed', checked)}
                      disabled={isLoading}
                    />
                  </SettingsItem>
                  
                  <SettingsItem label="Mostrar Breadcrumbs" description="Exibir navegação estrutural">
                    <Switch
                      checked={preferences.interface.showBreadcrumbs}
                      onCheckedChange={(checked) => updatePreference('interface', 'showBreadcrumbs', checked)}
                      disabled={isLoading}
                    />
                  </SettingsItem>
                  
                  <SettingsItem label="Mostrar Tooltips" description="Dicas ao passar o mouse">
                    <Switch
                      checked={preferences.interface.showTooltips}
                      onCheckedChange={(checked) => updatePreference('interface', 'showTooltips', checked)}
                      disabled={isLoading}
                    />
                  </SettingsItem>
                  
                  <SettingsItem label="Atalhos de Teclado" description="Mostrar atalhos nas dicas">
                    <Switch
                      checked={preferences.interface.showKeyboardShortcuts}
                      onCheckedChange={(checked) => updatePreference('interface', 'showKeyboardShortcuts', checked)}
                      disabled={isLoading}
                    />
                  </SettingsItem>
                </div>
                
                <SettingsItem label="Densidade" description="Espaçamento entre elementos">
                  <Select
                    value={preferences.interface.densityMode}
                    onValueChange={(value) => updatePreference('interface', 'densityMode', value as any)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compacto</SelectItem>
                      <SelectItem value="comfortable">Confortável</SelectItem>
                      <SelectItem value="spacious">Espaçoso</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingsItem>
              </SettingsSection>
            </SettingsCard>
            
            <SettingsCard
              title="Salvamento Automático"
              description="Configure o salvamento automático de dados"
              icon={Save}
              status={preferences.interface.autoSave ? 'active' : 'inactive'}
              statusText={preferences.interface.autoSave ? 'Ativo' : 'Inativo'}
              headerAction={
                <Switch
                  checked={preferences.interface.autoSave}
                  onCheckedChange={(checked) => updatePreference('interface', 'autoSave', checked)}
                  disabled={isLoading}
                />
              }
            >
              {preferences.interface.autoSave && (
                <SettingsSection>
                  <SettingsItem label="Intervalo" description={`Salvar a cada ${formatInterval(preferences.interface.autoSaveInterval)}`}>
                    <div className="w-48">
                      <Slider
                        value={[preferences.interface.autoSaveInterval]}
                        onValueChange={([value]) => updatePreference('interface', 'autoSaveInterval', value)}
                        min={10}
                        max={300}
                        step={10}
                        disabled={isLoading}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>10s</span>
                        <span>5min</span>
                      </div>
                    </div>
                  </SettingsItem>
                </SettingsSection>
              )}
            </SettingsCard>
            
            <SettingsCard
              title="Confirmações"
              description="Configure quando solicitar confirmação"
              icon={AlertTriangle}
            >
              <SettingsSection>
                <SettingsItem label="Confirmar Ações" description="Solicitar confirmação para ações importantes">
                  <Switch
                    checked={preferences.interface.confirmActions}
                    onCheckedChange={(checked) => updatePreference('interface', 'confirmActions', checked)}
                    disabled={isLoading}
                  />
                </SettingsItem>
              </SettingsSection>
            </SettingsCard>
          </SettingsGroup>
        </TabsContent>

        {/* Dashboard */}
        <TabsContent value="dashboard" className="space-y-6">
          <SettingsGroup title="Configurações do Dashboard" description="Personalize a página inicial">
            <SettingsCard
              title="Visualização Padrão"
              description="Página exibida ao fazer login"
              icon={Monitor}
            >
              <SettingsSection>
                <SettingsItem label="Página Inicial" description="Primeira página após o login">
                  <Select
                    value={preferences.dashboard.defaultView}
                    onValueChange={(value) => updatePreference('dashboard', 'defaultView', value as any)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="overview">Visão Geral</SelectItem>
                      <SelectItem value="patients">Pacientes</SelectItem>
                      <SelectItem value="appointments">Agendamentos</SelectItem>
                      <SelectItem value="reports">Relatórios</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingsItem>
              </SettingsSection>
            </SettingsCard>
            
            <SettingsCard
              title="Atualização Automática"
              description="Configure a atualização automática dos dados"
              icon={RefreshCw}
              status={preferences.dashboard.autoRefresh ? 'active' : 'inactive'}
              statusText={preferences.dashboard.autoRefresh ? 'Ativo' : 'Inativo'}
              headerAction={
                <Switch
                  checked={preferences.dashboard.autoRefresh}
                  onCheckedChange={(checked) => updatePreference('dashboard', 'autoRefresh', checked)}
                  disabled={isLoading}
                />
              }
            >
              {preferences.dashboard.autoRefresh && (
                <SettingsSection>
                  <SettingsItem label="Intervalo" description={`Atualizar a cada ${formatInterval(preferences.dashboard.refreshInterval)}`}>
                    <div className="w-48">
                      <Slider
                        value={[preferences.dashboard.refreshInterval]}
                        onValueChange={([value]) => updatePreference('dashboard', 'refreshInterval', value)}
                        min={60}
                        max={1800}
                        step={60}
                        disabled={isLoading}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>1min</span>
                        <span>30min</span>
                      </div>
                    </div>
                  </SettingsItem>
                </SettingsSection>
              )}
            </SettingsCard>
            
            <SettingsCard
              title="Elementos do Dashboard"
              description="Escolha quais elementos exibir"
              icon={Layout}
            >
              <SettingsSection>
                <div className="grid grid-cols-2 gap-4">
                  <SettingsItem label="Mensagem de Boas-vindas" description="Saudação personalizada">
                    <Switch
                      checked={preferences.dashboard.showWelcomeMessage}
                      onCheckedChange={(checked) => updatePreference('dashboard', 'showWelcomeMessage', checked)}
                      disabled={isLoading}
                    />
                  </SettingsItem>
                  
                  <SettingsItem label="Ações Rápidas" description="Botões de acesso rápido">
                    <Switch
                      checked={preferences.dashboard.showQuickActions}
                      onCheckedChange={(checked) => updatePreference('dashboard', 'showQuickActions', checked)}
                      disabled={isLoading}
                    />
                  </SettingsItem>
                  
                  <SettingsItem label="Atividade Recente" description="Lista de atividades recentes">
                    <Switch
                      checked={preferences.dashboard.showRecentActivity}
                      onCheckedChange={(checked) => updatePreference('dashboard', 'showRecentActivity', checked)}
                      disabled={isLoading}
                    />
                  </SettingsItem>
                  
                  <SettingsItem label="Estatísticas" description="Gráficos e métricas">
                    <Switch
                      checked={preferences.dashboard.showStatistics}
                      onCheckedChange={(checked) => updatePreference('dashboard', 'showStatistics', checked)}
                      disabled={isLoading}
                    />
                  </SettingsItem>
                </div>
                
                {preferences.dashboard.showRecentActivity && (
                  <SettingsItem label="Itens Recentes" description="Número máximo de itens na lista">
                    <Select
                      value={preferences.dashboard.maxRecentItems.toString()}
                      onValueChange={(value) => updatePreference('dashboard', 'maxRecentItems', parseInt(value))}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[5, 10, 15, 20, 25].map(count => (
                          <SelectItem key={count} value={count.toString()}>{count}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </SettingsItem>
                )}
              </SettingsSection>
            </SettingsCard>
          </SettingsGroup>
        </TabsContent>

        {/* Acessibilidade */}
        <TabsContent value="accessibility" className="space-y-6">
          <SettingsGroup title="Recursos de Acessibilidade" description="Configure recursos para melhor acessibilidade">
            <SettingsCard
              title="Navegação"
              description="Recursos de navegação assistiva"
              icon={Keyboard}
            >
              <SettingsSection>
                <div className="grid grid-cols-2 gap-4">
                  <SettingsItem label="Leitor de Tela" description="Otimizações para leitores de tela">
                    <Switch
                      checked={preferences.accessibility.screenReader}
                      onCheckedChange={(checked) => updatePreference('accessibility', 'screenReader', checked)}
                      disabled={isLoading}
                    />
                  </SettingsItem>
                  
                  <SettingsItem label="Navegação por Teclado" description="Suporte completo ao teclado">
                    <Switch
                      checked={preferences.accessibility.keyboardNavigation}
                      onCheckedChange={(checked) => updatePreference('accessibility', 'keyboardNavigation', checked)}
                      disabled={isLoading}
                    />
                  </SettingsItem>
                  
                  <SettingsItem label="Indicadores de Foco" description="Destacar elemento focado">
                    <Switch
                      checked={preferences.accessibility.focusIndicators}
                      onCheckedChange={(checked) => updatePreference('accessibility', 'focusIndicators', checked)}
                      disabled={isLoading}
                    />
                  </SettingsItem>
                  
                  <SettingsItem label="Links de Pular" description="Links para pular seções">
                    <Switch
                      checked={preferences.accessibility.skipLinks}
                      onCheckedChange={(checked) => updatePreference('accessibility', 'skipLinks', checked)}
                      disabled={isLoading}
                    />
                  </SettingsItem>
                </div>
              </SettingsSection>
            </SettingsCard>
            
            <SettingsCard
              title="Conteúdo Multimídia"
              description="Recursos para conteúdo visual e auditivo"
              icon={Volume2}
            >
              <SettingsSection>
                <div className="grid grid-cols-2 gap-4">
                  <SettingsItem label="Texto Alternativo" description="Descrições para imagens">
                    <Switch
                      checked={preferences.accessibility.altTextImages}
                      onCheckedChange={(checked) => updatePreference('accessibility', 'altTextImages', checked)}
                      disabled={isLoading}
                    />
                  </SettingsItem>
                  
                  <SettingsItem label="Legendas em Vídeos" description="Legendas automáticas">
                    <Switch
                      checked={preferences.accessibility.captionVideos}
                      onCheckedChange={(checked) => updatePreference('accessibility', 'captionVideos', checked)}
                      disabled={isLoading}
                    />
                  </SettingsItem>
                  
                  <SettingsItem label="Audiodescrição" description="Descrição narrada de elementos visuais">
                    <Switch
                      checked={preferences.accessibility.audioDescriptions}
                      onCheckedChange={(checked) => updatePreference('accessibility', 'audioDescriptions', checked)}
                      disabled={isLoading}
                    />
                  </SettingsItem>
                  
                  <SettingsItem label="Suporte a Daltonismo" description="Ajustes para deficiência de cores">
                    <Switch
                      checked={preferences.accessibility.colorBlindSupport}
                      onCheckedChange={(checked) => updatePreference('accessibility', 'colorBlindSupport', checked)}
                      disabled={isLoading}
                    />
                  </SettingsItem>
                </div>
              </SettingsSection>
            </SettingsCard>
          </SettingsGroup>
        </TabsContent>

        {/* Avançado */}
        <TabsContent value="advanced" className="space-y-6">
          <SettingsGroup title="Configurações Avançadas" description="Opções para usuários avançados">
            <SettingsCard
              title="Desenvolvimento"
              description="Ferramentas para desenvolvedores"
              icon={Settings}
            >
              <SettingsSection>
                <div className="grid grid-cols-2 gap-4">
                  <SettingsItem label="Modo Debug" description="Informações de depuração">
                    <Switch
                      checked={preferences.advanced.debugMode}
                      onCheckedChange={(checked) => updatePreference('advanced', 'debugMode', checked)}
                      disabled={isLoading}
                    />
                  </SettingsItem>
                  
                  <SettingsItem label="Ferramentas de Desenvolvedor" description="Console e inspetor">
                    <Switch
                      checked={preferences.advanced.developerTools}
                      onCheckedChange={(checked) => updatePreference('advanced', 'developerTools', checked)}
                      disabled={isLoading}
                    />
                  </SettingsItem>
                  
                  <SettingsItem label="Recursos Beta" description="Funcionalidades experimentais">
                    <Switch
                      checked={preferences.advanced.betaFeatures}
                      onCheckedChange={(checked) => updatePreference('advanced', 'betaFeatures', checked)}
                      disabled={isLoading}
                    />
                  </SettingsItem>
                </div>
              </SettingsSection>
            </SettingsCard>
            
            <SettingsCard
              title="Performance"
              description="Otimizações de desempenho"
              icon={Zap}
            >
              <SettingsSection>
                <div className="grid grid-cols-2 gap-4">
                  <SettingsItem label="Modo Performance" description="Otimizações para velocidade">
                    <Switch
                      checked={preferences.advanced.performanceMode}
                      onCheckedChange={(checked) => updatePreference('advanced', 'performanceMode', checked)}
                      disabled={isLoading}
                    />
                  </SettingsItem>
                  
                  <SettingsItem label="Cache Habilitado" description="Cache local de dados">
                    <Switch
                      checked={preferences.advanced.cacheEnabled}
                      onCheckedChange={(checked) => updatePreference('advanced', 'cacheEnabled', checked)}
                      disabled={isLoading}
                    />
                  </SettingsItem>
                  
                  <SettingsItem label="Compressão de Dados" description="Reduzir uso de banda">
                    <Switch
                      checked={preferences.advanced.dataCompression}
                      onCheckedChange={(checked) => updatePreference('advanced', 'dataCompression', checked)}
                      disabled={isLoading}
                    />
                  </SettingsItem>
                  
                  <SettingsItem label="Modo Offline" description="Funcionalidade sem internet">
                    <Switch
                      checked={preferences.advanced.offlineMode}
                      onCheckedChange={(checked) => updatePreference('advanced', 'offlineMode', checked)}
                      disabled={isLoading}
                    />
                  </SettingsItem>
                </div>
              </SettingsSection>
            </SettingsCard>
            
            <SettingsCard
              title="Privacidade"
              description="Configurações de privacidade e telemetria"
              icon={Eye}
            >
              <SettingsSection>
                <div className="grid grid-cols-2 gap-4">
                  <SettingsItem label="Telemetria" description="Enviar dados de uso anônimos">
                    <Switch
                      checked={preferences.advanced.telemetryEnabled}
                      onCheckedChange={(checked) => updatePreference('advanced', 'telemetryEnabled', checked)}
                      disabled={isLoading}
                    />
                  </SettingsItem>
                  
                  <SettingsItem label="Relatório de Erros" description="Enviar relatórios de erro">
                    <Switch
                      checked={preferences.advanced.errorReporting}
                      onCheckedChange={(checked) => updatePreference('advanced', 'errorReporting', checked)}
                      disabled={isLoading}
                    />
                  </SettingsItem>
                </div>
              </SettingsSection>
            </SettingsCard>
          </SettingsGroup>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export { defaultPreferences as defaultSystemPreferences };
export type { SystemPreferences };