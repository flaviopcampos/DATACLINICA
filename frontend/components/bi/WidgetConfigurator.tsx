'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Palette, 
  BarChart3, 
  PieChart, 
  LineChart, 
  TrendingUp,
  Eye,
  EyeOff,
  Save,
  X,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Interfaces
interface WidgetConfiguratorProps {
  isOpen: boolean;
  onClose: () => void;
  widget?: WidgetConfig;
  onSave: (config: WidgetConfig) => void;
  availableDataSources?: DataSource[];
  availableMetrics?: Metric[];
}

interface WidgetConfig {
  id: string;
  title: string;
  description?: string;
  type: WidgetType;
  size: WidgetSize;
  dataSource?: string;
  metrics?: string[];
  filters?: FilterConfig[];
  appearance: AppearanceConfig;
  behavior: BehaviorConfig;
  isVisible: boolean;
  refreshInterval?: number;
}

interface DataSource {
  id: string;
  name: string;
  description?: string;
  type: 'database' | 'api' | 'file' | 'realtime';
  status: 'active' | 'inactive' | 'error';
}

interface Metric {
  id: string;
  name: string;
  description?: string;
  type: 'number' | 'percentage' | 'currency' | 'duration';
  category: string;
}

interface FilterConfig {
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between';
  value: any;
  label?: string;
}

interface AppearanceConfig {
  theme: 'light' | 'dark' | 'auto';
  colorScheme: string;
  showTitle: boolean;
  showBorder: boolean;
  borderRadius: 'none' | 'sm' | 'md' | 'lg';
  backgroundColor?: string;
  textColor?: string;
}

interface BehaviorConfig {
  autoRefresh: boolean;
  refreshInterval: number;
  showTooltips: boolean;
  enableInteraction: boolean;
  showLegend: boolean;
  animationEnabled: boolean;
}

type WidgetType = 'metric' | 'chart' | 'table' | 'kpi' | 'gauge' | 'map' | 'text';
type WidgetSize = 'small' | 'medium' | 'large' | 'xlarge';

// Dados mock
const mockDataSources: DataSource[] = [
  { id: 'patients', name: 'Pacientes', type: 'database', status: 'active' },
  { id: 'appointments', name: 'Agendamentos', type: 'database', status: 'active' },
  { id: 'billing', name: 'Faturamento', type: 'database', status: 'active' },
  { id: 'beds', name: 'Leitos', type: 'realtime', status: 'active' },
];

const mockMetrics: Metric[] = [
  { id: 'total_patients', name: 'Total de Pacientes', type: 'number', category: 'Pacientes' },
  { id: 'revenue', name: 'Receita', type: 'currency', category: 'Financeiro' },
  { id: 'occupancy_rate', name: 'Taxa de Ocupação', type: 'percentage', category: 'Leitos' },
  { id: 'avg_wait_time', name: 'Tempo Médio de Espera', type: 'duration', category: 'Atendimento' },
];

const widgetTypes = [
  { value: 'metric', label: 'Métrica', icon: TrendingUp },
  { value: 'chart', label: 'Gráfico', icon: BarChart3 },
  { value: 'kpi', label: 'KPI', icon: PieChart },
  { value: 'gauge', label: 'Medidor', icon: LineChart },
];

const widgetSizes = [
  { value: 'small', label: 'Pequeno', description: '1x1' },
  { value: 'medium', label: 'Médio', description: '2x1' },
  { value: 'large', label: 'Grande', description: '2x2' },
  { value: 'xlarge', label: 'Extra Grande', description: '3x2' },
];

const colorSchemes = [
  { value: 'blue', label: 'Azul', color: 'bg-blue-500' },
  { value: 'green', label: 'Verde', color: 'bg-green-500' },
  { value: 'purple', label: 'Roxo', color: 'bg-purple-500' },
  { value: 'orange', label: 'Laranja', color: 'bg-orange-500' },
  { value: 'red', label: 'Vermelho', color: 'bg-red-500' },
];

// Componente principal
export default function WidgetConfigurator({
  isOpen,
  onClose,
  widget,
  onSave,
  availableDataSources = mockDataSources,
  availableMetrics = mockMetrics
}: WidgetConfiguratorProps) {
  const [config, setConfig] = useState<WidgetConfig>({
    id: widget?.id || '',
    title: widget?.title || '',
    description: widget?.description || '',
    type: widget?.type || 'metric',
    size: widget?.size || 'medium',
    dataSource: widget?.dataSource || '',
    metrics: widget?.metrics || [],
    filters: widget?.filters || [],
    appearance: widget?.appearance || {
      theme: 'light',
      colorScheme: 'blue',
      showTitle: true,
      showBorder: true,
      borderRadius: 'md'
    },
    behavior: widget?.behavior || {
      autoRefresh: false,
      refreshInterval: 30,
      showTooltips: true,
      enableInteraction: true,
      showLegend: true,
      animationEnabled: true
    },
    isVisible: widget?.isVisible ?? true,
    refreshInterval: widget?.refreshInterval || 30
  });

  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    if (widget) {
      setConfig({
        id: widget.id,
        title: widget.title,
        description: widget.description || '',
        type: widget.type,
        size: widget.size,
        dataSource: widget.dataSource || '',
        metrics: widget.metrics || [],
        filters: widget.filters || [],
        appearance: widget.appearance,
        behavior: widget.behavior,
        isVisible: widget.isVisible,
        refreshInterval: widget.refreshInterval || 30
      });
    }
  }, [widget]);

  const handleSave = useCallback(() => {
    onSave(config);
    onClose();
  }, [config, onSave, onClose]);

  const updateConfig = useCallback((updates: Partial<WidgetConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const updateAppearance = useCallback((updates: Partial<AppearanceConfig>) => {
    setConfig(prev => ({
      ...prev,
      appearance: { ...prev.appearance, ...updates }
    }));
  }, []);

  const updateBehavior = useCallback((updates: Partial<BehaviorConfig>) => {
    setConfig(prev => ({
      ...prev,
      behavior: { ...prev.behavior, ...updates }
    }));
  }, []);

  const toggleMetric = useCallback((metricId: string) => {
    setConfig(prev => ({
      ...prev,
      metrics: prev.metrics?.includes(metricId)
        ? prev.metrics.filter(id => id !== metricId)
        : [...(prev.metrics || []), metricId]
    }));
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {widget ? 'Configurar Widget' : 'Novo Widget'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="data">Dados</TabsTrigger>
            <TabsTrigger value="appearance">Aparência</TabsTrigger>
            <TabsTrigger value="behavior">Comportamento</TabsTrigger>
          </TabsList>

          {/* Aba Geral */}
          <TabsContent value="general" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={config.title}
                  onChange={(e) => updateConfig({ title: e.target.value })}
                  placeholder="Digite o título do widget"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select value={config.type} onValueChange={(value: WidgetType) => updateConfig({ type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {widgetTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={config.description}
                onChange={(e) => updateConfig({ description: e.target.value })}
                placeholder="Descrição opcional do widget"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Tamanho</Label>
              <div className="grid grid-cols-2 gap-2">
                {widgetSizes.map((size) => (
                  <Card
                    key={size.value}
                    className={cn(
                      'cursor-pointer transition-colors',
                      config.size === size.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'hover:border-gray-300'
                    )}
                    onClick={() => updateConfig({ size: size.value as WidgetSize })}
                  >
                    <CardContent className="p-3">
                      <div className="font-medium">{size.label}</div>
                      <div className="text-sm text-gray-500">{size.description}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Visibilidade</Label>
                <p className="text-sm text-gray-500">Widget visível no dashboard</p>
              </div>
              <Switch
                checked={config.isVisible}
                onCheckedChange={(checked) => updateConfig({ isVisible: checked })}
              />
            </div>
          </TabsContent>

          {/* Aba Dados */}
          <TabsContent value="data" className="space-y-4">
            <div className="space-y-2">
              <Label>Fonte de Dados</Label>
              <Select value={config.dataSource} onValueChange={(value) => updateConfig({ dataSource: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma fonte de dados" />
                </SelectTrigger>
                <SelectContent>
                  {availableDataSources.map((source) => (
                    <SelectItem key={source.id} value={source.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{source.name}</span>
                        <Badge variant={source.status === 'active' ? 'default' : 'secondary'}>
                          {source.status}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Métricas</Label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {availableMetrics.map((metric) => (
                  <Card
                    key={metric.id}
                    className={cn(
                      'cursor-pointer transition-colors',
                      config.metrics?.includes(metric.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'hover:border-gray-300'
                    )}
                    onClick={() => toggleMetric(metric.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{metric.name}</div>
                          <div className="text-xs text-gray-500">{metric.category}</div>
                        </div>
                        {config.metrics?.includes(metric.id) && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Aba Aparência */}
          <TabsContent value="appearance" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tema</Label>
                <Select value={config.appearance.theme} onValueChange={(value: 'light' | 'dark' | 'auto') => updateAppearance({ theme: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Escuro</SelectItem>
                    <SelectItem value="auto">Automático</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Esquema de Cores</Label>
                <div className="flex gap-2">
                  {colorSchemes.map((scheme) => (
                    <button
                      key={scheme.value}
                      className={cn(
                        'w-8 h-8 rounded-full border-2 transition-all',
                        scheme.color,
                        config.appearance.colorScheme === scheme.value
                          ? 'border-gray-800 scale-110'
                          : 'border-gray-300 hover:scale-105'
                      )}
                      onClick={() => updateAppearance({ colorScheme: scheme.value })}
                      title={scheme.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Mostrar Título</Label>
                  <p className="text-sm text-gray-500">Exibir título do widget</p>
                </div>
                <Switch
                  checked={config.appearance.showTitle}
                  onCheckedChange={(checked) => updateAppearance({ showTitle: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Mostrar Borda</Label>
                  <p className="text-sm text-gray-500">Exibir borda ao redor do widget</p>
                </div>
                <Switch
                  checked={config.appearance.showBorder}
                  onCheckedChange={(checked) => updateAppearance({ showBorder: checked })}
                />
              </div>
            </div>
          </TabsContent>

          {/* Aba Comportamento */}
          <TabsContent value="behavior" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Atualização Automática</Label>
                <p className="text-sm text-gray-500">Atualizar dados automaticamente</p>
              </div>
              <Switch
                checked={config.behavior.autoRefresh}
                onCheckedChange={(checked) => updateBehavior({ autoRefresh: checked })}
              />
            </div>

            {config.behavior.autoRefresh && (
              <div className="space-y-2">
                <Label htmlFor="refreshInterval">Intervalo de Atualização (segundos)</Label>
                <Input
                  id="refreshInterval"
                  type="number"
                  min="5"
                  max="3600"
                  value={config.behavior.refreshInterval}
                  onChange={(e) => updateBehavior({ refreshInterval: parseInt(e.target.value) || 30 })}
                />
              </div>
            )}

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Mostrar Tooltips</Label>
                  <p className="text-sm text-gray-500">Exibir dicas ao passar o mouse</p>
                </div>
                <Switch
                  checked={config.behavior.showTooltips}
                  onCheckedChange={(checked) => updateBehavior({ showTooltips: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Interação Habilitada</Label>
                  <p className="text-sm text-gray-500">Permitir cliques e interações</p>
                </div>
                <Switch
                  checked={config.behavior.enableInteraction}
                  onCheckedChange={(checked) => updateBehavior({ enableInteraction: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Mostrar Legenda</Label>
                  <p className="text-sm text-gray-500">Exibir legenda em gráficos</p>
                </div>
                <Switch
                  checked={config.behavior.showLegend}
                  onCheckedChange={(checked) => updateBehavior({ showLegend: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Animações</Label>
                  <p className="text-sm text-gray-500">Habilitar animações</p>
                </div>
                <Switch
                  checked={config.behavior.animationEnabled}
                  onCheckedChange={(checked) => updateBehavior({ animationEnabled: checked })}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Salvar Configurações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Exportar tipos
export type {
  WidgetConfiguratorProps,
  WidgetConfig,
  DataSource,
  Metric,
  FilterConfig,
  AppearanceConfig,
  BehaviorConfig,
  WidgetType,
  WidgetSize
};