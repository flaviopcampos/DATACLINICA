import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  Calendar,
  TrendingUp,
  Activity,
  Clock,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon
} from 'lucide-react';
import { BedStatus, BedStatusHistory } from '@/types/beds';

interface StatusHistoryChartProps {
  data: BedStatusHistory[];
  bedId?: string;
  timeRange?: '7d' | '30d' | '90d' | '1y';
  onTimeRangeChange?: (range: '7d' | '30d' | '90d' | '1y') => void;
  chartType?: 'bar' | 'line' | 'pie';
  onChartTypeChange?: (type: 'bar' | 'line' | 'pie') => void;
  className?: string;
}

const statusConfig = {
  AVAILABLE: {
    label: 'Disponível',
    color: '#10b981',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800'
  },
  OCCUPIED: {
    label: 'Ocupado',
    color: '#ef4444',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800'
  },
  MAINTENANCE: {
    label: 'Manutenção',
    color: '#f59e0b',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800'
  },
  BLOCKED: {
    label: 'Bloqueado',
    color: '#6b7280',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800'
  },
  CLEANING: {
    label: 'Limpeza',
    color: '#3b82f6',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800'
  }
};

const timeRangeLabels = {
  '7d': '7 dias',
  '30d': '30 dias',
  '90d': '90 dias',
  '1y': '1 ano'
};

export default function StatusHistoryChart({
  data,
  bedId,
  timeRange = '30d',
  onTimeRangeChange,
  chartType = 'bar',
  onChartTypeChange,
  className = ''
}: StatusHistoryChartProps) {
  // Processar dados para diferentes tipos de gráfico
  const processDataForBarChart = () => {
    const statusCounts: Record<string, number> = {};
    const statusDurations: Record<string, number> = {};
    
    data.forEach((entry) => {
      const status = entry.status;
      statusCounts[status] = (statusCounts[status] || 0) + 1;
      
      if (entry.duration_hours) {
        statusDurations[status] = (statusDurations[status] || 0) + entry.duration_hours;
      }
    });
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      status: statusConfig[status as BedStatus]?.label || status,
      count,
      duration: Math.round((statusDurations[status] || 0) / count), // Duração média
      color: statusConfig[status as BedStatus]?.color || '#6b7280'
    }));
  };
  
  const processDataForLineChart = () => {
    // Agrupar por data
    const dateGroups: Record<string, Record<string, number>> = {};
    
    data.forEach((entry) => {
      const date = new Date(entry.changed_at).toLocaleDateString('pt-BR');
      if (!dateGroups[date]) {
        dateGroups[date] = {};
      }
      dateGroups[date][entry.status] = (dateGroups[date][entry.status] || 0) + 1;
    });
    
    return Object.entries(dateGroups)
      .map(([date, statuses]) => ({
        date,
        ...statuses,
        total: Object.values(statuses).reduce((sum, count) => sum + count, 0)
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };
  
  const processDataForPieChart = () => {
    const statusCounts: Record<string, number> = {};
    
    data.forEach((entry) => {
      statusCounts[entry.status] = (statusCounts[entry.status] || 0) + 1;
    });
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: statusConfig[status as BedStatus]?.label || status,
      value: count,
      color: statusConfig[status as BedStatus]?.color || '#6b7280'
    }));
  };
  
  const barData = processDataForBarChart();
  const lineData = processDataForLineChart();
  const pieData = processDataForPieChart();
  
  const formatTooltip = (value: any, name: string, props: any) => {
    if (chartType === 'bar') {
      if (name === 'count') {
        return [`${value} alterações`, 'Quantidade'];
      }
      if (name === 'duration') {
        return [`${value}h`, 'Duração Média'];
      }
    }
    return [value, name];
  };
  
  const getTotalChanges = () => data.length;
  const getAverageDuration = () => {
    const totalDuration = data.reduce((sum, entry) => sum + (entry.duration_hours || 0), 0);
    return Math.round(totalDuration / data.length);
  };
  
  const getMostFrequentStatus = () => {
    const statusCounts: Record<string, number> = {};
    data.forEach((entry) => {
      statusCounts[entry.status] = (statusCounts[entry.status] || 0) + 1;
    });
    
    const mostFrequent = Object.entries(statusCounts)
      .sort(([,a], [,b]) => b - a)[0];
    
    return mostFrequent ? {
      status: mostFrequent[0] as BedStatus,
      count: mostFrequent[1]
    } : null;
  };
  
  const mostFrequentStatus = getMostFrequentStatus();
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Controles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Histórico de Status
            {bedId && <span className="ml-2 text-muted-foreground">- Leito {bedId}</span>}
          </h3>
          <p className="text-sm text-muted-foreground">
            Análise das mudanças de status ao longo do tempo
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Seletor de Período */}
          {onTimeRangeChange && (
            <div className="flex items-center gap-1">
              {Object.entries(timeRangeLabels).map(([value, label]) => (
                <Button
                  key={value}
                  variant={timeRange === value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onTimeRangeChange(value as any)}
                >
                  {label}
                </Button>
              ))}
            </div>
          )}
          
          {/* Seletor de Tipo de Gráfico */}
          {onChartTypeChange && (
            <div className="flex items-center gap-1">
              <Button
                variant={chartType === 'bar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChartTypeChange('bar')}
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === 'line' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChartTypeChange('line')}
              >
                <LineChartIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === 'pie' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChartTypeChange('pie')}
              >
                <PieChartIcon className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Estatísticas Resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Activity className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <p className="text-2xl font-bold">{getTotalChanges()}</p>
                <p className="text-xs text-muted-foreground">Total de Alterações</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <p className="text-2xl font-bold">{getAverageDuration()}h</p>
                <p className="text-xs text-muted-foreground">Duração Média</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-orange-600 mr-2" />
              <div>
                {mostFrequentStatus && (
                  <>
                    <p className="text-lg font-bold">
                      {statusConfig[mostFrequentStatus.status]?.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Status Mais Frequente ({mostFrequentStatus.count}x)
                    </p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Gráfico Principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            {chartType === 'bar' && <BarChart3 className="h-5 w-5 mr-2" />}
            {chartType === 'line' && <LineChartIcon className="h-5 w-5 mr-2" />}
            {chartType === 'pie' && <PieChartIcon className="h-5 w-5 mr-2" />}
            
            {chartType === 'bar' && 'Distribuição por Status'}
            {chartType === 'line' && 'Evolução Temporal'}
            {chartType === 'pie' && 'Proporção de Status'}
          </CardTitle>
          <CardDescription>
            {chartType === 'bar' && 'Quantidade e duração média por status'}
            {chartType === 'line' && 'Mudanças de status ao longo do tempo'}
            {chartType === 'pie' && 'Distribuição percentual dos status'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' && (
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip formatter={formatTooltip} />
                  <Bar dataKey="count" fill="#3b82f6" name="count" />
                </BarChart>
              )}
              
              {chartType === 'line' && (
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Total de Alterações"
                  />
                  {Object.keys(statusConfig).map((status) => (
                    <Line
                      key={status}
                      type="monotone"
                      dataKey={status}
                      stroke={statusConfig[status as BedStatus].color}
                      strokeWidth={1}
                      name={statusConfig[status as BedStatus].label}
                    />
                  ))}
                </LineChart>
              )}
              
              {chartType === 'pie' && (
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Histórico Detalhado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Histórico Detalhado
          </CardTitle>
          <CardDescription>
            Últimas alterações de status registradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {data
              .sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime())
              .slice(0, 20)
              .map((entry, index) => {
                const statusInfo = statusConfig[entry.status];
                
                return (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <Badge className={`${statusInfo.bgColor} ${statusInfo.textColor}`}>
                        {statusInfo.label}
                      </Badge>
                      
                      <div>
                        <p className="font-medium">
                          {new Date(entry.changed_at).toLocaleString('pt-BR')}
                        </p>
                        {entry.changed_by && (
                          <p className="text-sm text-muted-foreground">
                            Alterado por: {entry.changed_by}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {entry.duration_hours && (
                        <p className="text-sm font-medium">
                          {entry.duration_hours}h
                        </p>
                      )}
                      {entry.reason && (
                        <p className="text-xs text-muted-foreground max-w-32 truncate">
                          {entry.reason}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            }
            
            {data.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum histórico de status encontrado</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}