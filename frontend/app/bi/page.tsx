'use client';

// Página principal do Dashboard de Business Intelligence

import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Activity,
  Calendar,
  Filter,
  Settings,
  Download,
  RefreshCw,
  Plus,
  Grid,
  List,
  Maximize2,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Heart,
  Bed,
  Stethoscope,
  FileText,
  PieChart,
  LineChart,
  MoreHorizontal,
  Bell,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';

// Importar tipos
import { MetricType, MetricUnit } from '@/types/bi/metrics';
import type { ExportOptions } from '@/services/bi/exportService';

// Importar componentes de BI
import { DashboardWidget } from '@/components/bi/DashboardWidget';
import { MetricCard } from '@/components/bi/MetricCard';
import { ChartContainer } from '@/components/bi/ChartContainer';
import { KPIIndicator } from '@/components/bi/KPIIndicator';
import { CustomChart } from '@/components/bi/CustomChart';
import { AlertsPanel } from '@/components/bi/AlertsPanel';
import { AlertConfiguration } from '@/components/bi/AlertConfiguration';
import { NotificationProvider } from '@/components/bi/NotificationProvider';
import { NotificationSettings } from '@/components/bi/NotificationSettings';
import { ExportDialog } from '@/components/bi/ExportDialog';

// Importar hooks de BI
import { useBI } from '@/hooks/bi/useBI';
import { useMetrics } from '@/hooks/bi/useMetrics';
import { useKPIs } from '@/hooks/bi/useKPIs';
import { useDashboardConfig } from '@/hooks/bi/useDashboardConfig';
import { useExport } from '@/hooks/bi/useExport';

// Tipos
interface DashboardFilters {
  period: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  department: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
}

// Mock data para demonstração
const mockDashboardData = {
  summary: {
    totalPatients: 1247,
    totalRevenue: 2850000,
    occupancyRate: 87.5,
    satisfaction: 4.6
  },
  trends: {
    patients: { value: 12, direction: 'up' as const },
    revenue: { value: 8.5, direction: 'up' as const },
    occupancy: { value: -2.1, direction: 'down' as const },
    satisfaction: { value: 0.3, direction: 'up' as const }
  },
  alerts: [
    {
      id: '1',
      type: 'warning' as const,
      title: 'Taxa de ocupação baixa',
      message: 'UTI com apenas 65% de ocupação',
      timestamp: new Date(),
      department: 'UTI'
    },
    {
      id: '2',
      type: 'critical' as const,
      title: 'Meta de receita não atingida',
      message: 'Receita mensal 15% abaixo da meta',
      timestamp: new Date(),
      department: 'Financeiro'
    }
  ]
};

const mockChartData = [
  { name: 'Jan', pacientes: 1200, receita: 2400000, ocupacao: 85 },
  { name: 'Fev', pacientes: 1350, receita: 2650000, ocupacao: 88 },
  { name: 'Mar', pacientes: 1180, receita: 2300000, ocupacao: 82 },
  { name: 'Abr', pacientes: 1420, receita: 2800000, ocupacao: 91 },
  { name: 'Mai', pacientes: 1380, receita: 2750000, ocupacao: 89 },
  { name: 'Jun', pacientes: 1247, receita: 2850000, ocupacao: 87 }
];

const departments = [
  { value: 'all', label: 'Todos os Departamentos' },
  { value: 'emergency', label: 'Emergência' },
  { value: 'icu', label: 'UTI' },
  { value: 'surgery', label: 'Cirurgia' },
  { value: 'cardiology', label: 'Cardiologia' },
  { value: 'pediatrics', label: 'Pediatria' },
  { value: 'oncology', label: 'Oncologia' }
];

const periods = [
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: 'Esta Semana' },
  { value: 'month', label: 'Este Mês' },
  { value: 'quarter', label: 'Este Trimestre' },
  { value: 'year', label: 'Este Ano' },
  { value: 'custom', label: 'Período Personalizado' }
];

function BIDashboardContent() {
  // Estados
  const [filters, setFilters] = useState<DashboardFilters>({
    period: 'month',
    department: 'all'
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  // Hooks de BI
  const {
    dashboard,
    isLoading: dashboardLoading,
    widgets,
    selectedWidget,
    filters: biFilters,
    activeFilters,
    layout,
    isEditMode: biEditMode,
    createDashboard,
    updateDashboard,
    deleteDashboard,
    addWidget,
    removeWidget,
    updateWidget,
    selectWidget,
    moveWidget,
    resizeWidget,
    applyFilter,
    removeFilter,
    clearFilters,
    toggleEditMode,
    refreshData
  } = useBI();

  const {
    metrics,
    isLoading: metricsLoading,
    clinicalMetrics,
    financialMetrics,
    operationalMetrics,
    createMetric,
    updateMetric,
    deleteMetric,
    refreshData: refreshMetrics
  } = useMetrics();

  const {
    kpis,
    isLoading: kpisLoading,
    clinicalKPIs,
    financialKPIs,
    operationalKPIs,
    staffKPIs,
    createKPI,
    updateKPI,
    deleteKPI,
    refreshData: refreshKPIs
  } = useKPIs();

  const {
    config,
    layout: configLayout,
    updateConfig,
    updateLayout,
    addWidget: addConfigWidget,
    removeWidget: removeConfigWidget
  } = useDashboardConfig();

  const {
    exportData,
    isExporting
  } = useExport();

  // Funções de exportação
  const exportMetrics = async (format: 'pdf' | 'excel', options?: ExportOptions) => {
    try {
      await exportData({
        type: 'metrics',
        data: metrics,
        format,
        ...options
      });
      toast.success('Métricas exportadas com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar métricas');
    }
  };

  const exportKPIs = async (format: 'pdf' | 'excel', options?: ExportOptions) => {
    try {
      await exportData({
        type: 'kpis',
        data: kpis,
        format,
        ...options
      });
      toast.success('KPIs exportados com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar KPIs');
    }
  };

  const exportAlerts = async (format: 'pdf' | 'excel', options?: ExportOptions) => {
    try {
      await exportData({
        type: 'alerts',
        data: mockDashboardData.alerts,
        format,
        ...options
      });
      toast.success('Alertas exportados com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar alertas');
    }
  };

  const exportDashboardData = async (format: 'pdf' | 'excel', options?: ExportOptions) => {
    try {
      await exportData({
        type: 'dashboard',
        data: { metrics, kpis, alerts: mockDashboardData.alerts },
        format,
        ...options
      });
      toast.success('Dashboard exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar dashboard');
    }
  };

  // Ações rápidas
  const quickActions: QuickAction[] = [
    {
      id: 'add-widget',
      label: 'Adicionar Widget',
      icon: Plus,
      action: () => handleAddWidget()
    },
    {
      id: 'export-dashboard',
      label: 'Exportar Dashboard',
      icon: Download,
      action: () => setExportDialogOpen(true)
    },
    {
      id: 'refresh-data',
      label: 'Atualizar Dados',
      icon: RefreshCw,
      action: () => handleRefreshData()
    },
    {
      id: 'toggle-edit',
      label: isEditMode ? 'Sair da Edição' : 'Editar Dashboard',
      icon: isEditMode ? Eye : Settings,
      action: () => setIsEditMode(!isEditMode),
      variant: isEditMode ? 'outline' : 'default'
    }
  ];

  // Handlers
  const handleFilterChange = (key: keyof DashboardFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleAddWidget = () => {
    // Implementar lógica para adicionar widget
    toast.success('Widget adicionado com sucesso!');
  };

  const handleExportDashboard = async () => {
    try {
      await exportDashboard?.('pdf');
      toast.success('Dashboard exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar dashboard');
    }
  };

  const handleRefreshData = async () => {
    setRefreshing(true);
    try {
      await refreshData?.();
      toast.success('Dados atualizados com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar dados');
    } finally {
      setRefreshing(false);
    }
  };

  const handleWidgetAction = (widgetId: string, action: string) => {
    switch (action) {
      case 'configure':
        toast.info(`Configurando widget ${widgetId}`);
        break;
      case 'duplicate':
        toast.success('Widget duplicado com sucesso!');
        break;
      case 'delete':
        removeWidget?.(widgetId);
        toast.success('Widget removido com sucesso!');
        break;
      default:
        break;
    }
  };

  // Métricas calculadas
  const summaryMetrics = useMemo(() => [
    {
      id: 'patients',
      name: 'Total de Pacientes',
      value: mockDashboardData.summary.totalPatients,
      trend: mockDashboardData.trends.patients,
      icon: Users,
      color: 'blue',
      format: 'integer'
    },
    {
      id: 'revenue',
      name: 'Receita Total',
      value: mockDashboardData.summary.totalRevenue,
      trend: mockDashboardData.trends.revenue,
      icon: DollarSign,
      color: 'green',
      format: 'currency'
    },
    {
      id: 'occupancy',
      name: 'Taxa de Ocupação',
      value: mockDashboardData.summary.occupancyRate,
      trend: mockDashboardData.trends.occupancy,
      icon: Bed,
      color: 'orange',
      format: 'percentage'
    },
    {
      id: 'satisfaction',
      name: 'Satisfação do Paciente',
      value: mockDashboardData.summary.satisfaction,
      trend: mockDashboardData.trends.satisfaction,
      icon: Heart,
      color: 'pink',
      format: 'decimal'
    }
  ], []);

  // Renderizar alertas
  const renderAlerts = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          <span>Alertas Ativos</span>
          <Badge variant="secondary">{mockDashboardData.alerts.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockDashboardData.alerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                'flex items-start space-x-3 p-3 rounded-lg border',
                alert.type === 'critical' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'
              )}
            >
              {alert.type === 'critical' ? (
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
              )}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{alert.title}</h4>
                  <Badge variant="outline" className="text-xs">
                    {alert.department}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{alert.message}</p>
                <p className="text-xs text-muted-foreground">
                  {alert.timestamp.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  // Renderizar filtros
  const renderFilters = () => (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <Label htmlFor="period">Período:</Label>
        <Select
          value={filters.period}
          onValueChange={(value) => handleFilterChange('period', value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {periods.map((period) => (
              <SelectItem key={period.value} value={period.value}>
                {period.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Label htmlFor="department">Departamento:</Label>
        <Select
          value={filters.department}
          onValueChange={(value) => handleFilterChange('department', value)}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept.value} value={dept.value}>
                {dept.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator orientation="vertical" className="h-6" />

      <div className="flex items-center space-x-2">
        <Button
          variant={viewMode === 'grid' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('grid')}
        >
          <Grid className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === 'list' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('list')}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  // Renderizar ações rápidas
  const renderQuickActions = () => (
    <div className="flex items-center space-x-2">
      {quickActions.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.id}
            variant={action.variant || 'outline'}
            size="sm"
            onClick={action.action}
            disabled={action.id === 'refresh-data' && refreshing}
          >
            <Icon className={cn(
              'h-4 w-4',
              action.id === 'refresh-data' && refreshing && 'animate-spin'
            )} />
            <span className="ml-2 hidden sm:inline">{action.label}</span>
          </Button>
        );
      })}
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard de BI</h1>
          <p className="text-muted-foreground">
            Análise completa de dados e métricas hospitalares
          </p>
        </div>
        {renderQuickActions()}
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          {renderFilters()}
        </CardContent>
      </Card>

      {/* Tabs principais */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="kpis">KPIs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        {/* Tab: Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          {/* Métricas de Resumo */}
          <div className={cn(
            'grid gap-6',
            viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1'
          )}>
            {summaryMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <MetricCard
                  key={metric.id}
                  metric={{
                    id: metric.id,
                    name: metric.name,
                    description: `Métrica de ${metric.name.toLowerCase()}`,
                    category: 'operational',
                    type: MetricType.COUNT,
                    format: metric.format,
                    unit: metric.format === 'currency' ? MetricUnit.BRL : metric.format === 'percentage' ? MetricUnit.PERCENTAGE : undefined,
                    target: metric.format === 'percentage' ? 90 : undefined,
                    thresholds: {
                      excellent: metric.format === 'percentage' ? 95 : undefined,
                      good: metric.format === 'percentage' ? 85 : undefined,
                      warning: metric.format === 'percentage' ? 75 : undefined,
                      critical: metric.format === 'percentage' ? 65 : undefined
                    },
                    createdAt: new Date(),
                    updatedAt: new Date()
                  }}
                  value={{
                    value: metric.value,
                    previous: metric.value * 0.95,
                    trend: {
                      direction: metric.trend.direction,
                      value: metric.trend.value,
                      period: 'mês anterior'
                    },
                    status: 'good',
                    lastUpdated: new Date()
                  }}
                  showTrend
                  showProgress={metric.format === 'percentage'}
                  animated
                />
              );
            })}
          </div>

          {/* Gráficos Principais */}
          <div className="grid gap-6 md:grid-cols-2">
            <CustomChart
              data={mockChartData}
              config={{
                showGrid: true,
                showLegend: true,
                animation: true,
                responsive: true
              }}
              type="line"
              title="Tendência de Pacientes"
              description="Evolução mensal do número de pacientes"
              series={[
                {
                  id: 'pacientes',
                  name: 'Pacientes',
                  dataKey: 'pacientes',
                  type: 'line',
                  color: '#3b82f6',
                  visible: true
                }
              ]}
              xAxis={{ dataKey: 'name', label: 'Mês' }}
              yAxis={{ label: 'Número de Pacientes' }}
              height={300}
            />

            <CustomChart
              data={mockChartData}
              config={{
                showGrid: true,
                showLegend: true,
                animation: true,
                responsive: true
              }}
              type="bar"
              title="Receita Mensal"
              description="Receita gerada por mês"
              series={[
                {
                  id: 'receita',
                  name: 'Receita',
                  dataKey: 'receita',
                  type: 'bar',
                  color: '#10b981',
                  visible: true
                }
              ]}
              xAxis={{ dataKey: 'name', label: 'Mês' }}
              yAxis={{ label: 'Receita (R$)', format: 'currency' }}
              height={300}
            />
          </div>

          {/* Alertas e Ocupação */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              {renderAlerts()}
            </div>
            <div>
              <CustomChart
                data={[
                  { name: 'Ocupado', value: mockDashboardData.summary.occupancyRate },
                  { name: 'Disponível', value: 100 - mockDashboardData.summary.occupancyRate }
                ]}
                config={{
                  showGrid: false,
                  showLegend: true,
                  animation: true,
                  responsive: true
                }}
                type="pie"
                title="Taxa de Ocupação"
                description="Distribuição atual dos leitos"
                series={[
                  {
                    id: 'ocupacao',
                    name: 'Ocupação',
                    dataKey: 'value',
                    type: 'pie',
                    visible: true
                  }
                ]}
                height={300}
              />
            </div>
          </div>
        </TabsContent>

        {/* Tab: Métricas */}
        <TabsContent value="metrics" className="space-y-6">
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              Métricas Detalhadas
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Visualização detalhada de todas as métricas do sistema
            </p>
            <Button onClick={() => setSelectedTab('overview')}>
              Voltar à Visão Geral
            </Button>
          </div>
        </TabsContent>

        {/* Tab: KPIs */}
        <TabsContent value="kpis" className="space-y-6">
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              Indicadores de Performance
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              KPIs estratégicos para tomada de decisão
            </p>
            <Button onClick={() => setSelectedTab('overview')}>
              Voltar à Visão Geral
            </Button>
          </div>
        </TabsContent>

        {/* Tab: Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="text-center py-12">
            <LineChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              Analytics Avançado
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Análises preditivas e insights avançados
            </p>
            <Button onClick={() => setSelectedTab('overview')}>
              Voltar à Visão Geral
            </Button>
          </div>
        </TabsContent>

        {/* Tab: Alertas */}
        <TabsContent value="alerts" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <AlertsPanel />
            </div>
            <div>
              <AlertConfiguration />
            </div>
          </div>
        </TabsContent>

        {/* Tab: Configurações */}
        <TabsContent value="settings" className="space-y-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Configurações do Sistema BI
              </h2>
              <p className="text-gray-600">
                Configure alertas, notificações e preferências do dashboard.
              </p>
            </div>
            
            <div className="grid gap-6 lg:grid-cols-2">
              <NotificationSettings />
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Configurações Gerais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-8">
                    <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                      Configurações adicionais em desenvolvimento
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Diálogo de Exportação */}
      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        onExport={async (type, format, options) => {
          try {
            switch (type) {
              case 'metrics':
                await exportMetrics(format, options);
                break;
              case 'kpis':
                await exportKPIs(format, options);
                break;
              case 'alerts':
                await exportAlerts(format, options);
                break;
              case 'dashboard':
                await exportDashboardData(format, options);
                break;
            }
            toast.success(`${type} exportado com sucesso!`);
            setExportDialogOpen(false);
          } catch (error) {
            toast.error(`Erro ao exportar ${type}`);
          }
        }}
        isExporting={isExporting}
      />
    </div>
  );
}

export default function BIDashboard() {
  return (
    <NotificationProvider>
      <BIDashboardContent />
    </NotificationProvider>
  );
}