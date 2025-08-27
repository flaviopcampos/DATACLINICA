'use client';

// Página de Analytics Avançado do Sistema BI

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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Brain,
  Target,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  Users,
  DollarSign,
  Bed,
  Heart,
  Stethoscope,
  FileText,
  Download,
  RefreshCw,
  Filter,
  Settings,
  ArrowUp,
  ArrowDown,
  Minus,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import { toast } from 'sonner';

// Importar componentes de BI
import { CustomChart } from '@/components/bi/CustomChart';
import { MetricCard } from '@/components/bi/MetricCard';
import { KPIIndicator } from '@/components/bi/KPIIndicator';

// Importar hooks de BI
import { useMetrics } from '@/hooks/bi/useMetrics';
import { useKPIs } from '@/hooks/bi/useKPIs';

// Tipos
interface PredictionData {
  period: string;
  predicted: number;
  confidence: number;
  actual?: number;
}

interface AnomalyData {
  id: string;
  metric: string;
  value: number;
  expected: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  description: string;
}

interface InsightData {
  id: string;
  title: string;
  description: string;
  type: 'opportunity' | 'risk' | 'trend' | 'anomaly';
  impact: 'low' | 'medium' | 'high';
  confidence: number;
  actionable: boolean;
  recommendations: string[];
  metrics: string[];
}

interface AnalyticsFilters {
  timeframe: 'week' | 'month' | 'quarter' | 'year';
  department: string;
  analysisType: 'predictive' | 'diagnostic' | 'prescriptive' | 'descriptive';
  confidence: number;
}

// Mock data para demonstração
const mockPredictions: PredictionData[] = [
  { period: 'Jul 2024', predicted: 1450, confidence: 85, actual: 1420 },
  { period: 'Ago 2024', predicted: 1380, confidence: 82, actual: 1350 },
  { period: 'Set 2024', predicted: 1520, confidence: 78 },
  { period: 'Out 2024', predicted: 1480, confidence: 75 },
  { period: 'Nov 2024', predicted: 1600, confidence: 72 },
  { period: 'Dez 2024', predicted: 1550, confidence: 70 }
];

const mockAnomalies: AnomalyData[] = [
  {
    id: '1',
    metric: 'Taxa de Ocupação UTI',
    value: 45,
    expected: 85,
    deviation: -47,
    severity: 'critical',
    timestamp: new Date('2024-06-15T14:30:00'),
    description: 'Taxa de ocupação significativamente abaixo do esperado'
  },
  {
    id: '2',
    metric: 'Tempo de Espera Emergência',
    value: 180,
    expected: 45,
    deviation: 300,
    severity: 'high',
    timestamp: new Date('2024-06-15T16:45:00'),
    description: 'Tempo de espera muito acima da média histórica'
  },
  {
    id: '3',
    metric: 'Satisfação do Paciente',
    value: 3.2,
    expected: 4.5,
    deviation: -29,
    severity: 'medium',
    timestamp: new Date('2024-06-15T10:15:00'),
    description: 'Queda na satisfação dos pacientes'
  }
];

const mockInsights: InsightData[] = [
  {
    id: '1',
    title: 'Oportunidade de Otimização de Leitos',
    description: 'Análise preditiva indica possibilidade de redistribuição de leitos entre departamentos para aumentar ocupação em 12%',
    type: 'opportunity',
    impact: 'high',
    confidence: 87,
    actionable: true,
    recommendations: [
      'Redistribuir 15 leitos da Pediatria para UTI',
      'Implementar sistema de reserva dinâmica',
      'Criar protocolo de transferência entre departamentos'
    ],
    metrics: ['Taxa de Ocupação', 'Tempo de Permanência', 'Lista de Espera']
  },
  {
    id: '2',
    title: 'Risco de Sobrecarga no Pronto Socorro',
    description: 'Modelo preditivo indica aumento de 35% na demanda do PS nos próximos 30 dias',
    type: 'risk',
    impact: 'high',
    confidence: 92,
    actionable: true,
    recommendations: [
      'Aumentar equipe de plantão em 20%',
      'Implementar triagem avançada',
      'Preparar leitos de observação adicionais'
    ],
    metrics: ['Atendimentos PS', 'Tempo de Espera', 'Taxa de Ocupação']
  },
  {
    id: '3',
    title: 'Tendência de Melhoria na Satisfação',
    description: 'Implementação de novos protocolos de atendimento mostra tendência positiva consistente',
    type: 'trend',
    impact: 'medium',
    confidence: 78,
    actionable: false,
    recommendations: [
      'Manter protocolos atuais',
      'Expandir treinamento para outras áreas',
      'Monitorar continuamente'
    ],
    metrics: ['Satisfação do Paciente', 'NPS', 'Reclamações']
  }
];

const mockTrendData = [
  { name: 'Jan', pacientes: 1200, receita: 2400000, ocupacao: 85, satisfacao: 4.2 },
  { name: 'Fev', pacientes: 1350, receita: 2650000, ocupacao: 88, satisfacao: 4.3 },
  { name: 'Mar', pacientes: 1180, receita: 2300000, ocupacao: 82, satisfacao: 4.1 },
  { name: 'Abr', pacientes: 1420, receita: 2800000, ocupacao: 91, satisfacao: 4.4 },
  { name: 'Mai', pacientes: 1380, receita: 2750000, ocupacao: 89, satisfacao: 4.6 },
  { name: 'Jun', pacientes: 1247, receita: 2850000, ocupacao: 87, satisfacao: 4.5 }
];

const departments = [
  { value: 'all', label: 'Todos os Departamentos' },
  { value: 'emergency', label: 'Emergência' },
  { value: 'icu', label: 'UTI' },
  { value: 'surgery', label: 'Cirurgia' },
  { value: 'cardiology', label: 'Cardiologia' },
  { value: 'pediatrics', label: 'Pediatria' }
];

const analysisTypes = [
  { value: 'predictive', label: 'Análise Preditiva' },
  { value: 'diagnostic', label: 'Análise Diagnóstica' },
  { value: 'prescriptive', label: 'Análise Prescritiva' },
  { value: 'descriptive', label: 'Análise Descritiva' }
];

export default function AnalyticsPage() {
  // Estados
  const [filters, setFilters] = useState<AnalyticsFilters>({
    timeframe: 'month',
    department: 'all',
    analysisType: 'predictive',
    confidence: 75
  });
  const [selectedTab, setSelectedTab] = useState('predictions');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);

  // Hooks
  const { metrics, isLoading: metricsLoading } = useMetrics();
  const { kpis, isLoading: kpisLoading } = useKPIs();

  // Handlers
  const handleFilterChange = (key: keyof AnalyticsFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleRefreshData = async () => {
    setRefreshing(true);
    try {
      // Simular atualização de dados
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Análises atualizadas com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar análises');
    } finally {
      setRefreshing(false);
    }
  };

  const handleExportAnalysis = () => {
    toast.success('Relatório de análise exportado!');
  };

  // Métricas de resumo das análises
  const analyticsSummary = useMemo(() => [
    {
      id: 'predictions',
      name: 'Previsões Ativas',
      value: mockPredictions.length,
      icon: Brain,
      color: 'blue',
      description: 'Modelos preditivos em execução'
    },
    {
      id: 'anomalies',
      name: 'Anomalias Detectadas',
      value: mockAnomalies.length,
      icon: AlertCircle,
      color: 'red',
      description: 'Desvios significativos identificados'
    },
    {
      id: 'insights',
      name: 'Insights Gerados',
      value: mockInsights.length,
      icon: Zap,
      color: 'yellow',
      description: 'Recomendações baseadas em dados'
    },
    {
      id: 'accuracy',
      name: 'Precisão Média',
      value: 84.5,
      icon: Target,
      color: 'green',
      description: 'Precisão dos modelos preditivos',
      format: 'percentage'
    }
  ], []);

  // Renderizar filtros
  const renderFilters = () => (
    <div className="flex items-center space-x-4 flex-wrap gap-4">
      <div className="flex items-center space-x-2">
        <Label>Período:</Label>
        <Select
          value={filters.timeframe}
          onValueChange={(value) => handleFilterChange('timeframe', value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Semana</SelectItem>
            <SelectItem value="month">Mês</SelectItem>
            <SelectItem value="quarter">Trimestre</SelectItem>
            <SelectItem value="year">Ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Label>Departamento:</Label>
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

      <div className="flex items-center space-x-2">
        <Label>Tipo de Análise:</Label>
        <Select
          value={filters.analysisType}
          onValueChange={(value) => handleFilterChange('analysisType', value)}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {analysisTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Label>Confiança Mín.:</Label>
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            min="0"
            max="100"
            value={filters.confidence}
            onChange={(e) => handleFilterChange('confidence', parseInt(e.target.value))}
            className="w-20"
          />
          <span className="text-sm text-muted-foreground">%</span>
        </div>
      </div>
    </div>
  );

  // Renderizar anomalias
  const renderAnomalies = () => (
    <div className="space-y-4">
      {mockAnomalies.map((anomaly) => {
        const severityColors = {
          low: 'border-blue-200 bg-blue-50',
          medium: 'border-yellow-200 bg-yellow-50',
          high: 'border-orange-200 bg-orange-50',
          critical: 'border-red-200 bg-red-50'
        };

        const severityIcons = {
          low: <AlertCircle className="h-4 w-4 text-blue-500" />,
          medium: <AlertCircle className="h-4 w-4 text-yellow-500" />,
          high: <AlertCircle className="h-4 w-4 text-orange-500" />,
          critical: <AlertCircle className="h-4 w-4 text-red-500" />
        };

        return (
          <div
            key={anomaly.id}
            className={cn(
              'p-4 rounded-lg border',
              severityColors[anomaly.severity]
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                {severityIcons[anomaly.severity]}
                <div className="space-y-1">
                  <h4 className="font-medium text-sm">{anomaly.metric}</h4>
                  <p className="text-sm text-muted-foreground">{anomaly.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>Valor: {anomaly.value}</span>
                    <span>Esperado: {anomaly.expected}</span>
                    <span>Desvio: {anomaly.deviation > 0 ? '+' : ''}{anomaly.deviation}%</span>
                    <span>{anomaly.timestamp.toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              </div>
              <Badge variant={anomaly.severity === 'critical' ? 'destructive' : 'secondary'}>
                {anomaly.severity.toUpperCase()}
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );

  // Renderizar insights
  const renderInsights = () => (
    <div className="space-y-4">
      {mockInsights.map((insight) => {
        const typeColors = {
          opportunity: 'border-green-200 bg-green-50',
          risk: 'border-red-200 bg-red-50',
          trend: 'border-blue-200 bg-blue-50',
          anomaly: 'border-yellow-200 bg-yellow-50'
        };

        const typeIcons = {
          opportunity: <TrendingUp className="h-4 w-4 text-green-500" />,
          risk: <AlertCircle className="h-4 w-4 text-red-500" />,
          trend: <LineChart className="h-4 w-4 text-blue-500" />,
          anomaly: <AlertCircle className="h-4 w-4 text-yellow-500" />
        };

        const impactColors = {
          low: 'bg-gray-100 text-gray-800',
          medium: 'bg-yellow-100 text-yellow-800',
          high: 'bg-red-100 text-red-800'
        };

        return (
          <Card key={insight.id} className={cn(typeColors[insight.type])}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {typeIcons[insight.type]}
                  <div className="space-y-1">
                    <CardTitle className="text-base">{insight.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={impactColors[insight.impact]}>
                    {insight.impact.toUpperCase()}
                  </Badge>
                  <Badge variant="outline">
                    {insight.confidence}% confiança
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h5 className="font-medium text-sm mb-2">Recomendações:</h5>
                  <ul className="space-y-1">
                    {insight.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start space-x-2">
                        <span className="text-xs mt-1">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-sm mb-2">Métricas Relacionadas:</h5>
                  <div className="flex flex-wrap gap-1">
                    {insight.metrics.map((metric, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {metric}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Analytics Avançado</h1>
          <p className="text-muted-foreground">
            Análises preditivas, detecção de anomalias e insights inteligentes
          </p>
        </div>
        <div className="flex items-center space-x-2">
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
          <Button variant="outline" size="sm" onClick={handleExportAnalysis}>
            <Download className="h-4 w-4" />
            <span className="ml-2">Exportar</span>
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          {renderFilters()}
        </CardContent>
      </Card>

      {/* Resumo das Análises */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {analyticsSummary.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {item.name}
                    </p>
                    <p className="text-2xl font-bold">
                      {item.format === 'percentage' ? `${item.value}%` : item.value}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <Icon className={cn(
                    'h-8 w-8',
                    item.color === 'blue' && 'text-blue-500',
                    item.color === 'red' && 'text-red-500',
                    item.color === 'yellow' && 'text-yellow-500',
                    item.color === 'green' && 'text-green-500'
                  )} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs principais */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="predictions">Previsões</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalias</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
        </TabsList>

        {/* Tab: Previsões */}
        <TabsContent value="predictions" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <CustomChart
              data={mockPredictions}
              config={{
                showGrid: true,
                showLegend: true,
                animation: true,
                responsive: true
              }}
              type="line"
              title="Previsão de Pacientes"
              description="Modelo preditivo para os próximos 6 meses"
              series={[
                {
                  id: 'predicted',
                  name: 'Previsto',
                  dataKey: 'predicted',
                  type: 'line',
                  color: '#3b82f6',
                  visible: true
                },
                {
                  id: 'actual',
                  name: 'Real',
                  dataKey: 'actual',
                  type: 'line',
                  color: '#10b981',
                  visible: true
                }
              ]}
              xAxis={{ dataKey: 'period', label: 'Período' }}
              yAxis={{ label: 'Número de Pacientes' }}
              height={300}
            />

            <Card>
              <CardHeader>
                <CardTitle>Confiança das Previsões</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPredictions.map((pred, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{pred.period}</span>
                        <span>{pred.confidence}%</span>
                      </div>
                      <Progress value={pred.confidence} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Anomalias */}
        <TabsContent value="anomalies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span>Anomalias Detectadas</span>
                <Badge variant="secondary">{mockAnomalies.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderAnomalies()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Insights */}
        <TabsContent value="insights" className="space-y-6">
          {renderInsights()}
        </TabsContent>

        {/* Tab: Tendências */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <CustomChart
              data={mockTrendData}
              config={{
                showGrid: true,
                showLegend: true,
                animation: true,
                responsive: true
              }}
              type="line"
              title="Tendências Históricas"
              description="Evolução das principais métricas"
              series={[
                {
                  id: 'pacientes',
                  name: 'Pacientes',
                  dataKey: 'pacientes',
                  type: 'line',
                  color: '#3b82f6',
                  visible: true
                },
                {
                  id: 'ocupacao',
                  name: 'Ocupação (%)',
                  dataKey: 'ocupacao',
                  type: 'line',
                  color: '#f59e0b',
                  visible: true
                }
              ]}
              xAxis={{ dataKey: 'name', label: 'Mês' }}
              yAxis={{ label: 'Valores' }}
              height={300}
            />

            <CustomChart
              data={mockTrendData}
              config={{
                showGrid: true,
                showLegend: true,
                animation: true,
                responsive: true
              }}
              type="area"
              title="Receita e Satisfação"
              description="Correlação entre receita e satisfação"
              series={[
                {
                  id: 'receita',
                  name: 'Receita (M)',
                  dataKey: 'receita',
                  type: 'area',
                  color: '#10b981',
                  visible: true
                },
                {
                  id: 'satisfacao',
                  name: 'Satisfação',
                  dataKey: 'satisfacao',
                  type: 'line',
                  color: '#ec4899',
                  visible: true
                }
              ]}
              xAxis={{ dataKey: 'name', label: 'Mês' }}
              yAxis={{ label: 'Valores' }}
              height={300}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}