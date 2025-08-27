'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Calendar,
  Clock,
  Users,
  Bed,
  AlertTriangle,
  CheckCircle,
  Download,
  RefreshCw
} from 'lucide-react';
import { useBedOccupancy } from '@/hooks/useBedOccupancy';
import { cn } from '@/lib/utils';

interface OccupancyChartProps {
  departmentId?: string;
  period?: '24h' | '7d' | '30d' | '90d';
  className?: string;
}

type ChartType = 'line' | 'area' | 'bar' | 'pie';
type MetricType = 'occupancy' | 'admissions' | 'discharges' | 'transfers';

const COLORS = {
  occupied: '#3b82f6',
  available: '#10b981',
  maintenance: '#f59e0b',
  cleaning: '#8b5cf6',
  reserved: '#eab308',
  blocked: '#ef4444'
};

const periodOptions = [
  { value: '24h', label: 'Últimas 24h' },
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
  { value: '90d', label: 'Últimos 90 dias' }
];

const chartTypeOptions = [
  { value: 'line', label: 'Linha' },
  { value: 'area', label: 'Área' },
  { value: 'bar', label: 'Barras' },
  { value: 'pie', label: 'Pizza' }
];

const metricOptions = [
  { value: 'occupancy', label: 'Taxa de Ocupação' },
  { value: 'admissions', label: 'Internações' },
  { value: 'discharges', label: 'Altas' },
  { value: 'transfers', label: 'Transferências' }
];

export function OccupancyChart({ 
  departmentId, 
  period = '7d', 
  className 
}: OccupancyChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  const [chartType, setChartType] = useState<ChartType>('line');
  const [metricType, setMetricType] = useState<MetricType>('occupancy');
  
  const { 
    data: occupancyData, 
    isLoading, 
    refetch 
  } = useBedOccupancy({
    departmentId,
    period: selectedPeriod
  });

  // Dados mockados para demonstração
  const mockTimeSeriesData = [
    { time: '00:00', occupied: 85, available: 15, admissions: 2, discharges: 1, transfers: 0 },
    { time: '04:00', occupied: 82, available: 18, admissions: 1, discharges: 2, transfers: 1 },
    { time: '08:00', occupied: 88, available: 12, admissions: 5, discharges: 1, transfers: 2 },
    { time: '12:00', occupied: 92, available: 8, admissions: 3, discharges: 0, transfers: 1 },
    { time: '16:00', occupied: 89, available: 11, admissions: 2, discharges: 3, transfers: 0 },
    { time: '20:00', occupied: 87, available: 13, admissions: 1, discharges: 2, transfers: 1 }
  ];

  const mockStatusData = [
    { name: 'Ocupados', value: 87, color: COLORS.occupied },
    { name: 'Disponíveis', value: 13, color: COLORS.available },
    { name: 'Manutenção', value: 3, color: COLORS.maintenance },
    { name: 'Limpeza', value: 2, color: COLORS.cleaning }
  ];

  const currentOccupancy = occupancyData?.currentOccupancy || 87;
  const previousOccupancy = occupancyData?.previousOccupancy || 82;
  const trend = currentOccupancy > previousOccupancy ? 'up' : 'down';
  const trendPercentage = Math.abs(((currentOccupancy - previousOccupancy) / previousOccupancy) * 100);

  const formatTooltip = (value: any, name: string) => {
    if (metricType === 'occupancy') {
      return [`${value}%`, name];
    }
    return [value, name];
  };

  const renderChart = () => {
    const data = mockTimeSeriesData;
    
    switch (chartType) {
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
              domain={metricType === 'occupancy' ? [0, 100] : [0, 'dataMax']}
            />
            <Tooltip 
              formatter={formatTooltip}
              labelStyle={{ color: '#374151' }}
              contentStyle={{ 
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Legend />
            {metricType === 'occupancy' && (
              <>
                <Line 
                  type="monotone" 
                  dataKey="occupied" 
                  stroke={COLORS.occupied} 
                  strokeWidth={2}
                  name="Taxa de Ocupação"
                  dot={{ fill: COLORS.occupied, strokeWidth: 2, r: 4 }}
                />
              </>
            )}
            {metricType === 'admissions' && (
              <Line 
                type="monotone" 
                dataKey="admissions" 
                stroke={COLORS.occupied} 
                strokeWidth={2}
                name="Internações"
                dot={{ fill: COLORS.occupied, strokeWidth: 2, r: 4 }}
              />
            )}
            {metricType === 'discharges' && (
              <Line 
                type="monotone" 
                dataKey="discharges" 
                stroke={COLORS.available} 
                strokeWidth={2}
                name="Altas"
                dot={{ fill: COLORS.available, strokeWidth: 2, r: 4 }}
              />
            )}
            {metricType === 'transfers' && (
              <Line 
                type="monotone" 
                dataKey="transfers" 
                stroke={COLORS.maintenance} 
                strokeWidth={2}
                name="Transferências"
                dot={{ fill: COLORS.maintenance, strokeWidth: 2, r: 4 }}
              />
            )}
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="time" tick={{ fontSize: 12 }} />
            <YAxis 
              tick={{ fontSize: 12 }}
              domain={metricType === 'occupancy' ? [0, 100] : [0, 'dataMax']}
            />
            <Tooltip formatter={formatTooltip} />
            <Legend />
            {metricType === 'occupancy' && (
              <>
                <Area 
                  type="monotone" 
                  dataKey="occupied" 
                  stackId="1"
                  stroke={COLORS.occupied} 
                  fill={COLORS.occupied}
                  fillOpacity={0.6}
                  name="Ocupados"
                />
                <Area 
                  type="monotone" 
                  dataKey="available" 
                  stackId="1"
                  stroke={COLORS.available} 
                  fill={COLORS.available}
                  fillOpacity={0.6}
                  name="Disponíveis"
                />
              </>
            )}
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="time" tick={{ fontSize: 12 }} />
            <YAxis 
              tick={{ fontSize: 12 }}
              domain={metricType === 'occupancy' ? [0, 100] : [0, 'dataMax']}
            />
            <Tooltip formatter={formatTooltip} />
            <Legend />
            <Bar 
              dataKey={metricType} 
              fill={COLORS.occupied}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={mockStatusData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {mockStatusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Ocupação</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold">{currentOccupancy}%</p>
                  <Badge 
                    variant={trend === 'up' ? 'destructive' : 'default'}
                    className="text-xs"
                  >
                    {trend === 'up' ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {trendPercentage.toFixed(1)}%
                  </Badge>
                </div>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Leitos Ocupados</p>
                <p className="text-2xl font-bold">87</p>
                <p className="text-xs text-muted-foreground">de 100 leitos</p>
              </div>
              <Bed className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Internações Hoje</p>
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-muted-foreground">+3 vs ontem</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Altas Hoje</p>
                <p className="text-2xl font-bold">8</p>
                <p className="text-xs text-muted-foreground">-1 vs ontem</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico principal */}
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <CardTitle className="text-lg font-semibold">Análise de Ocupação</CardTitle>
              <p className="text-sm text-muted-foreground">
                Visualização detalhada da ocupação de leitos
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={metricType} onValueChange={(value: MetricType) => setMetricType(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {metricOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={chartType} onValueChange={(value: ChartType) => setChartType(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {chartTypeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periodOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
                <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              </Button>

              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-80">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {renderChart()}
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alertas e insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center">
              <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
              Alertas de Capacidade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div>
                <p className="font-medium text-orange-900">Alta Ocupação - UTI</p>
                <p className="text-sm text-orange-700">95% de ocupação (19/20 leitos)</p>
              </div>
              <Badge variant="destructive">Crítico</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div>
                <p className="font-medium text-yellow-900">Capacidade Reduzida - Enfermaria</p>
                <p className="text-sm text-yellow-700">3 leitos em manutenção</p>
              </div>
              <Badge variant="secondary">Atenção</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center">
              <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
              Insights e Tendências
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="font-medium text-blue-900">Pico de Ocupação</p>
              <p className="text-sm text-blue-700">
                Maior ocupação entre 12h-16h (92%)
              </p>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="font-medium text-green-900">Rotatividade Eficiente</p>
              <p className="text-sm text-green-700">
                Tempo médio de internação: 3.2 dias
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}