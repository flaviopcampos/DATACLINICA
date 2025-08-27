'use client';

// Página de Métricas do Sistema BI

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Filter,
  Search,
  RefreshCw,
  Settings,
  Download,
  Share,
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  Activity,
  Users,
  DollarSign,
  Bed,
  Heart,
  Zap,
  Award,
  AlertCircle,
  Info,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { toast } from 'sonner';
import { MetricCard } from '@/components/bi/MetricCard';
import { KPIIndicator } from '@/components/bi/KPIIndicator';
import { CustomChart } from '@/components/bi/CustomChart';
import { useMetrics } from '@/hooks/bi/useMetrics';
import { useKPIs } from '@/hooks/bi/useKPIs';

// Tipos
interface MetricFilter {
  category: string;
  department: string;
  period: string;
  status: string;
  search: string;
}

interface MetricComparison {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}

interface MetricAlert {
  id: string;
  metricId: string;
  type: 'warning' | 'critical' | 'info';
  message: string;
  threshold: number;
  currentValue: number;
  createdAt: Date;
  acknowledged: boolean;
}

// Mock data
const mockMetricAlerts: MetricAlert[] = [
  {
    id: '1',
    metricId: 'bed-occupancy',
    type: 'warning',
    message: 'Taxa de ocupação de leitos acima de 85%',
    threshold: 85,
    currentValue: 87.5,
    createdAt: new Date('2024-06-15T10:30:00'),
    acknowledged: false
  },
  {
    id: '2',
    metricId: 'patient-satisfaction',
    type: 'critical',
    message: 'NPS abaixo do limite mínimo',
    threshold: 70,
    currentValue: 65,
    createdAt: new Date('2024-06-15T09:15:00'),
    acknowledged: false
  },
  {
    id: '3',
    metricId: 'revenue',
    type: 'info',
    message: 'Meta mensal de receita atingida',
    threshold: 1000000,
    currentValue: 1050000,
    createdAt: new Date('2024-06-15T08:00:00'),
    acknowledged: true
  }
];

const categories = [
  { value: 'all', label: 'Todas as Categorias' },
  { value: 'operational', label: 'Operacional' },
  { value: 'financial', label: 'Financeiro' },
  { value: 'quality', label: 'Qualidade' },
  { value: 'clinical', label: 'Clínico' },
  { value: 'hr', label: 'Recursos Humanos' }
];

const departments = [
  { value: 'all', label: 'Todos os Departamentos' },
  { value: 'emergency', label: 'Emergência' },
  { value: 'icu', label: 'UTI' },
  { value: 'surgery', label: 'Cirurgia' },
  { value: 'cardiology', label: 'Cardiologia' },
  { value: 'pediatrics', label: 'Pediatria' }
];

const periods = [
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: 'Esta Semana' },
  { value: 'month', label: 'Este Mês' },
  { value: 'quarter', label: 'Este Trimestre' },
  { value: 'year', label: 'Este Ano' },
  { value: 'custom', label: 'Período Personalizado' }
];

const statusOptions = [
  { value: 'all', label: 'Todos os Status' },
  { value: 'normal', label: 'Normal' },
  { value: 'warning', label: 'Atenção' },
  { value: 'critical', label: 'Crítico' },
  { value: 'excellent', label: 'Excelente' }
];

export default function MetricsPage() {
  // Estados
  const [filters, setFilters] = useState<MetricFilter>({
    category: 'all',
    department: 'all',
    period: 'month',
    status: 'all',
    search: ''
  });
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<MetricAlert[]>(mockMetricAlerts);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'chart'>('cards');

  // Hooks
  const { metrics, isLoading: metricsLoading } = useMetrics();
  const { kpis, isLoading: kpisLoading } = useKPIs();

  // Handlers
  const handleFilterChange = (key: keyof MetricFilter, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleRefreshData = async () => {
    setRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Métricas atualizadas com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar métricas');
    } finally {
      setRefreshing(false);
    }
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
    toast.success('Alerta reconhecido');
  };

  const handleCreateMetric = () => {
    setIsCreateDialogOpen(true);
  };

  const handleExportMetrics = () => {
    toast.success('Exportação iniciada!');
  };

  // Dados simulados para métricas principais
  const mainMetrics = [
    {
      id: 'bed-occupancy',
      name: 'Taxa de Ocupação',
      description: 'Percentual de leitos ocupados',
      value: 87.5,
      unit: '%',
      target: 85,
      category: 'operational',
      status: 'warning' as const,
      trend: 'up' as const,
      change: 2.3,
      changePercent: 2.7,
      icon: Bed,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      data: [82, 84, 86, 85, 87, 89, 87.5],
      comparison: {
        current: 87.5,
        previous: 85.2,
        change: 2.3,
        changePercent: 2.7,
        trend: 'up' as const
      }
    },
    {
      id: 'revenue',
      name: 'Receita Mensal',
      description: 'Receita total do mês atual',
      value: 1050000,
      unit: 'R$',
      target: 1000000,
      category: 'financial',
      status: 'excellent' as const,
      trend: 'up' as const,
      change: 50000,
      changePercent: 5.0,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      data: [950000, 980000, 1020000, 990000, 1030000, 1080000, 1050000],
      comparison: {
        current: 1050000,
        previous: 1000000,
        change: 50000,
        changePercent: 5.0,
        trend: 'up' as const
      }
    },
    {
      id: 'patient-satisfaction',
      name: 'Satisfação do Paciente',
      description: 'NPS médio dos pacientes',
      value: 65,
      unit: '',
      target: 70,
      category: 'quality',
      status: 'critical' as const,
      trend: 'down' as const,
      change: -5,
      changePercent: -7.1,
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      data: [75, 73, 71, 68, 66, 63, 65],
      comparison: {
        current: 65,
        previous: 70,
        change: -5,
        changePercent: -7.1,
        trend: 'down' as const
      }
    },
    {
      id: 'avg-wait-time',
      name: 'Tempo Médio de Espera',
      description: 'Tempo médio de espera na emergência',
      value: 45,
      unit: 'min',
      target: 30,
      category: 'operational',
      status: 'warning' as const,
      trend: 'up' as const,
      change: 5,
      changePercent: 12.5,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      data: [35, 38, 42, 40, 43, 48, 45],
      comparison: {
        current: 45,
        previous: 40,
        change: 5,
        changePercent: 12.5,
        trend: 'up' as const
      }
    },
    {
      id: 'staff-efficiency',
      name: 'Eficiência da Equipe',
      description: 'Índice de eficiência operacional',
      value: 92,
      unit: '%',
      target: 90,
      category: 'hr',
      status: 'excellent' as const,
      trend: 'up' as const,
      change: 3,
      changePercent: 3.4,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      data: [88, 89, 91, 90, 92, 94, 92],
      comparison: {
        current: 92,
        previous: 89,
        change: 3,
        changePercent: 3.4,
        trend: 'up' as const
      }
    },
    {
      id: 'readmission-rate',
      name: 'Taxa de Readmissão',
      description: 'Percentual de readmissões em 30 dias',
      value: 8.2,
      unit: '%',
      target: 10,
      category: 'clinical',
      status: 'normal' as const,
      trend: 'down' as const,
      change: -1.3,
      changePercent: -13.7,
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      data: [12, 11, 10, 9.5, 9, 8.5, 8.2],
      comparison: {
        current: 8.2,
        previous: 9.5,
        change: -1.3,
        changePercent: -13.7,
        trend: 'down' as const
      }
    }
  ];

  // Filtrar métricas
  const filteredMetrics = useMemo(() => {
    return mainMetrics.filter(metric => {
      const matchesCategory = filters.category === 'all' || metric.category === filters.category;
      const matchesStatus = filters.status === 'all' || metric.status === filters.status;
      const matchesSearch = filters.search === '' || 
        metric.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        metric.description.toLowerCase().includes(filters.search.toLowerCase());
      
      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [mainMetrics, filters]);

  // Estatísticas dos alertas
  const alertStats = useMemo(() => {
    const total = alerts.length;
    const unacknowledged = alerts.filter(a => !a.acknowledged).length;
    const critical = alerts.filter(a => a.type === 'critical').length;
    const warning = alerts.filter(a => a.type === 'warning').length;
    
    return { total, unacknowledged, critical, warning };
  }, [alerts]);

  // Renderizar status da métrica
  const renderMetricStatus = (status: string) => {
    const statusConfig = {
      excellent: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      normal: { color: 'bg-blue-100 text-blue-800', icon: Info },
      warning: { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
      critical: { color: 'bg-red-100 text-red-800', icon: XCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;
    
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Renderizar tendência
  const renderTrend = (trend: string, change: number) => {
    const trendConfig = {
      up: { icon: ArrowUp, color: 'text-green-600' },
      down: { icon: ArrowDown, color: 'text-red-600' },
      stable: { icon: Minus, color: 'text-gray-600' }
    };
    
    const config = trendConfig[trend as keyof typeof trendConfig];
    if (!config) return null;
    
    const Icon = config.icon;
    
    return (
      <div className={cn('flex items-center space-x-1', config.color)}>
        <Icon className="h-4 w-4" />
        <span className="text-sm font-medium">
          {Math.abs(change).toFixed(1)}
        </span>
      </div>
    );
  };

  // Renderizar filtros
  const renderFilters = () => (
    <div className="flex items-center space-x-4 flex-wrap gap-4">
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar métricas..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="w-64"
        />
      </div>
      
      <Select
        value={filters.category}
        onValueChange={(value) => handleFilterChange('category', value)}
      >
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {categories.map((cat) => (
            <SelectItem key={cat.value} value={cat.value}>
              {cat.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
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
      
      <Select
        value={filters.status}
        onValueChange={(value) => handleFilterChange('status', value)}
      >
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              {status.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Métricas</h1>
          <p className="text-muted-foreground">
            Monitoramento e análise de indicadores de performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 border rounded-lg p-1">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <LineChart className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'chart' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('chart')}
            >
              <PieChart className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportMetrics}
          >
            <Download className="h-4 w-4" />
            <span className="ml-2">Exportar</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshData}
            disabled={refreshing}
          >
            <RefreshCw className={cn(
              'h-4 w-4',
              refreshing && 'animate-spin'
            )} />
            <span className="ml-2">Atualizar</span>
          </Button>
          <Button onClick={handleCreateMetric}>
            <Plus className="h-4 w-4" />
            <span className="ml-2">Nova Métrica</span>
          </Button>
        </div>
      </div>

      {/* Alertas */}
      {alertStats.unacknowledged > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-800">
                    {alertStats.unacknowledged} alerta(s) não reconhecido(s)
                  </p>
                  <p className="text-sm text-orange-600">
                    {alertStats.critical} crítico(s), {alertStats.warning} aviso(s)
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAlertDialogOpen(true)}
              >
                Ver Alertas
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          {renderFilters()}
        </CardContent>
      </Card>

      {/* Tabs principais */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="comparisons">Comparações</TabsTrigger>
          <TabsTrigger value="targets">Metas</TabsTrigger>
        </TabsList>

        {/* Tab: Visão Geral */}
        <TabsContent value="overview">
          {viewMode === 'cards' && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredMetrics.map((metric) => {
                const Icon = metric.icon;
                return (
                  <Card key={metric.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={cn(
                          'p-2 rounded-lg',
                          metric.bgColor
                        )}>
                          <Icon className={cn('h-6 w-6', metric.color)} />
                        </div>
                        {renderMetricStatus(metric.status)}
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg">{metric.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {metric.description}
                        </p>
                        
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-3xl font-bold">
                              {metric.unit === 'R$' 
                                ? `R$ ${(metric.value / 1000).toFixed(0)}k`
                                : `${metric.value}${metric.unit}`
                              }
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Meta: {metric.unit === 'R$' 
                                ? `R$ ${(metric.target / 1000).toFixed(0)}k`
                                : `${metric.target}${metric.unit}`
                              }
                            </p>
                          </div>
                          {renderTrend(metric.trend, metric.changePercent)}
                        </div>
                        
                        <div className="pt-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progresso da Meta</span>
                            <span>
                              {((metric.value / metric.target) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <Progress 
                            value={(metric.value / metric.target) * 100} 
                            className="h-2"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
          
          {viewMode === 'table' && (
            <Card>
              <CardHeader>
                <CardTitle>Tabela de Métricas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredMetrics.map((metric) => {
                    const Icon = metric.icon;
                    return (
                      <div key={metric.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={cn(
                            'p-2 rounded-lg',
                            metric.bgColor
                          )}>
                            <Icon className={cn('h-5 w-5', metric.color)} />
                          </div>
                          <div>
                            <h4 className="font-medium">{metric.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {metric.description}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-6">
                          <div className="text-right">
                            <p className="font-semibold">
                              {metric.unit === 'R$' 
                                ? `R$ ${(metric.value / 1000).toFixed(0)}k`
                                : `${metric.value}${metric.unit}`
                              }
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Meta: {metric.unit === 'R$' 
                                ? `R$ ${(metric.target / 1000).toFixed(0)}k`
                                : `${metric.target}${metric.unit}`
                              }
                            </p>
                          </div>
                          
                          {renderTrend(metric.trend, metric.changePercent)}
                          {renderMetricStatus(metric.status)}
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                Detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Settings className="h-4 w-4 mr-2" />
                                Configurar Alertas
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
          
          {viewMode === 'chart' && (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredMetrics.slice(0, 4).map((metric) => (
                <Card key={metric.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <metric.icon className={cn('h-5 w-5', metric.color)} />
                      <span>{metric.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CustomChart
                      data={metric.data.map((value, index) => ({
                        name: `Dia ${index + 1}`,
                        value
                      }))}
                      config={{
                        responsive: true,
                        maintainAspectRatio: false,
                        animation: { duration: 300 }
                      }}
                      type="line"
                      height={200}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab: Tendências */}
        <TabsContent value="trends">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tendências de Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <CustomChart
                  data={[
                    { name: 'Jan', ocupacao: 82, receita: 950, satisfacao: 75 },
                    { name: 'Fev', ocupacao: 84, receita: 980, satisfacao: 73 },
                    { name: 'Mar', ocupacao: 86, receita: 1020, satisfacao: 71 },
                    { name: 'Abr', ocupacao: 85, receita: 990, satisfacao: 68 },
                    { name: 'Mai', ocupacao: 87, receita: 1030, satisfacao: 66 },
                    { name: 'Jun', ocupacao: 89, receita: 1080, satisfacao: 63 }
                  ]}
                  config={{
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: { duration: 300 }
                  }}
                  type="line"
                  height={300}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Análise de Correlação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-12">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                      Análise de Correlação
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Análise das correlações entre métricas será exibida aqui
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Comparações */}
        <TabsContent value="comparisons">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Comparação Período Anterior</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {filteredMetrics.slice(0, 6).map((metric) => (
                    <div key={metric.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{metric.name}</h4>
                        {renderTrend(metric.trend, metric.changePercent)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Atual:</span>
                          <span className="font-medium">
                            {metric.unit === 'R$' 
                              ? `R$ ${(metric.value / 1000).toFixed(0)}k`
                              : `${metric.value}${metric.unit}`
                            }
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Anterior:</span>
                          <span>
                            {metric.unit === 'R$' 
                              ? `R$ ${((metric.value - metric.change) / 1000).toFixed(0)}k`
                              : `${(metric.value - metric.change).toFixed(1)}${metric.unit}`
                            }
                          </span>
                        </div>
                        <div className="flex justify-between text-sm font-medium">
                          <span>Variação:</span>
                          <span className={cn(
                            metric.trend === 'up' ? 'text-green-600' : 
                            metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                          )}>
                            {metric.changePercent > 0 ? '+' : ''}{metric.changePercent.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Metas */}
        <TabsContent value="targets">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Progresso das Metas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {filteredMetrics.map((metric) => {
                    const progress = (metric.value / metric.target) * 100;
                    const Icon = metric.icon;
                    
                    return (
                      <div key={metric.id} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={cn(
                              'p-2 rounded-lg',
                              metric.bgColor
                            )}>
                              <Icon className={cn('h-5 w-5', metric.color)} />
                            </div>
                            <div>
                              <h4 className="font-medium">{metric.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                Meta: {metric.unit === 'R$' 
                                  ? `R$ ${(metric.target / 1000).toFixed(0)}k`
                                  : `${metric.target}${metric.unit}`
                                }
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-semibold">
                              {metric.unit === 'R$' 
                                ? `R$ ${(metric.value / 1000).toFixed(0)}k`
                                : `${metric.value}${metric.unit}`
                              }
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {progress.toFixed(1)}% da meta
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <Progress value={progress} className="h-3" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>0</span>
                            <span>{metric.unit === 'R$' 
                              ? `R$ ${(metric.target / 1000).toFixed(0)}k`
                              : `${metric.target}${metric.unit}`
                            }</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog: Alertas */}
      <Dialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Alertas de Métricas</DialogTitle>
            <DialogDescription>
              Gerencie os alertas das suas métricas
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {alerts.map((alert) => {
              const metric = mainMetrics.find(m => m.id === alert.metricId);
              const alertConfig = {
                critical: { color: 'border-red-200 bg-red-50', icon: XCircle, iconColor: 'text-red-600' },
                warning: { color: 'border-orange-200 bg-orange-50', icon: AlertTriangle, iconColor: 'text-orange-600' },
                info: { color: 'border-blue-200 bg-blue-50', icon: Info, iconColor: 'text-blue-600' }
              };
              
              const config = alertConfig[alert.type];
              const Icon = config.icon;
              
              return (
                <div key={alert.id} className={cn(
                  'border rounded-lg p-4',
                  config.color,
                  alert.acknowledged && 'opacity-60'
                )}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <Icon className={cn('h-5 w-5 mt-0.5', config.iconColor)} />
                      <div className="space-y-1">
                        <h4 className="font-medium">{metric?.name}</h4>
                        <p className="text-sm">{alert.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {alert.createdAt.toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    
                    {!alert.acknowledged && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAcknowledgeAlert(alert.id)}
                      >
                        Reconhecer
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <DialogFooter>
            <Button onClick={() => setIsAlertDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Criar Métrica */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Criar Nova Métrica</DialogTitle>
            <DialogDescription>
              Configure uma nova métrica para monitoramento
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="metric-name">Nome da Métrica</Label>
                <Input id="metric-name" placeholder="Digite o nome da métrica" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metric-category">Categoria</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.slice(1).map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="metric-description">Descrição</Label>
              <Textarea
                id="metric-description"
                placeholder="Descreva o que esta métrica mede"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="metric-unit">Unidade</Label>
                <Input id="metric-unit" placeholder="%, R$, min, etc." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metric-target">Meta</Label>
                <Input id="metric-target" type="number" placeholder="Valor da meta" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metric-frequency">Frequência</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Frequência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Tempo Real</SelectItem>
                    <SelectItem value="hourly">Por Hora</SelectItem>
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              setIsCreateDialogOpen(false);
              toast.success('Métrica criada com sucesso!');
            }}>
              Criar Métrica
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}