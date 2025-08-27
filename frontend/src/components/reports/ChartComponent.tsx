import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  Maximize2,
  RefreshCw,
  Settings,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { ChartConfig, ChartData } from '../../types/reports';

interface ChartComponentProps {
  title: string;
  description?: string;
  data: ChartData[];
  config: ChartConfig;
  loading?: boolean;
  error?: string;
  onExport?: (format: 'png' | 'svg' | 'pdf') => void;
  onRefresh?: () => void;
  onConfigure?: () => void;
  onExpand?: () => void;
  showControls?: boolean;
  height?: number;
  className?: string;
}

const COLORS = [
  '#3B82F6', // blue-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#EF4444', // red-500
  '#8B5CF6', // violet-500
  '#06B6D4', // cyan-500
  '#84CC16', // lime-500
  '#F97316', // orange-500
  '#EC4899', // pink-500
  '#6B7280'  // gray-500
];

function ChartComponent({
  title,
  description,
  data,
  config,
  loading = false,
  error,
  onExport,
  onRefresh,
  onConfigure,
  onExpand,
  showControls = true,
  height = 300,
  className = ''
}: ChartComponentProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Processar dados baseado no tipo de gráfico
    switch (config.type) {
      case 'pie':
        return data.map((item, index) => ({
          ...item,
          fill: COLORS[index % COLORS.length]
        }));
      default:
        return data;
    }
  }, [data, config.type]);

  const formatValue = (value: any, key?: string) => {
    if (typeof value !== 'number') return value;
    
    // Aplicar formatação baseada na configuração
    if (config.formatters && config.formatters[key || '']) {
      const formatter = config.formatters[key || ''];
      if (formatter.type === 'currency') {
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(value);
      } else if (formatter.type === 'percentage') {
        return `${value.toFixed(1)}%`;
      } else if (formatter.type === 'number') {
        return new Intl.NumberFormat('pt-BR').format(value);
      }
    }
    
    return value;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600">{entry.dataKey}:</span>
              <span className="font-medium">
                {formatValue(entry.value, entry.dataKey)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="flex items-center gap-2 text-gray-600">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Carregando dados...</span>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-red-600">
            <p className="font-medium mb-2">Erro ao carregar dados</p>
            <p className="text-sm text-gray-600">{error}</p>
            {onRefresh && (
              <Button size="sm" variant="outline" onClick={onRefresh} className="mt-3">
                <RefreshCw className="h-4 w-4 mr-1" />
                Tentar novamente
              </Button>
            )}
          </div>
        </div>
      );
    }

    if (!chartData || chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <p className="font-medium mb-2">Nenhum dado disponível</p>
            <p className="text-sm">Não há dados para exibir neste período</p>
          </div>
        </div>
      );
    }

    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (config.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey={config.xAxisKey || 'name'} 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
                tickFormatter={(value) => formatValue(value, config.yAxisKey)}
              />
              <Tooltip content={<CustomTooltip />} />
              {config.showLegend && <Legend />}
              {config.series?.map((series, index) => (
                <Bar 
                  key={series.key}
                  dataKey={series.key}
                  fill={series.color || COLORS[index % COLORS.length]}
                  name={series.name || series.key}
                  radius={[2, 2, 0, 0]}
                />
              )) || (
                <Bar 
                  dataKey={config.yAxisKey || 'value'}
                  fill={COLORS[0]}
                  radius={[2, 2, 0, 0]}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey={config.xAxisKey || 'name'} 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
                tickFormatter={(value) => formatValue(value, config.yAxisKey)}
              />
              <Tooltip content={<CustomTooltip />} />
              {config.showLegend && <Legend />}
              {config.series?.map((series, index) => (
                <Line 
                  key={series.key}
                  type="monotone"
                  dataKey={series.key}
                  stroke={series.color || COLORS[index % COLORS.length]}
                  name={series.name || series.key}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              )) || (
                <Line 
                  type="monotone"
                  dataKey={config.yAxisKey || 'value'}
                  stroke={COLORS[0]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey={config.xAxisKey || 'name'} 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
                tickFormatter={(value) => formatValue(value, config.yAxisKey)}
              />
              <Tooltip content={<CustomTooltip />} />
              {config.showLegend && <Legend />}
              {config.series?.map((series, index) => (
                <Area 
                  key={series.key}
                  type="monotone"
                  dataKey={series.key}
                  stackId="1"
                  stroke={series.color || COLORS[index % COLORS.length]}
                  fill={series.color || COLORS[index % COLORS.length]}
                  fillOpacity={0.6}
                  name={series.name || series.key}
                />
              )) || (
                <Area 
                  type="monotone"
                  dataKey={config.yAxisKey || 'value'}
                  stroke={COLORS[0]}
                  fill={COLORS[0]}
                  fillOpacity={0.6}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={Math.min(height * 0.35, 120)}
                fill="#8884d8"
                dataKey={config.yAxisKey || 'value'}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [formatValue(value, name), name]}
              />
              {config.showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-500">
            Tipo de gráfico não suportado: {config.type}
          </div>
        );
    }
  };

  // Calcular tendência se aplicável
  const getTrend = () => {
    if (!chartData || chartData.length < 2 || config.type === 'pie') return null;
    
    const valueKey = config.yAxisKey || 'value';
    const firstValue = chartData[0][valueKey];
    const lastValue = chartData[chartData.length - 1][valueKey];
    
    if (typeof firstValue !== 'number' || typeof lastValue !== 'number') return null;
    
    const change = ((lastValue - firstValue) / firstValue) * 100;
    
    if (Math.abs(change) < 0.1) {
      return {
        icon: <Minus className="h-4 w-4" />,
        text: 'Estável',
        color: 'text-gray-500'
      };
    } else if (change > 0) {
      return {
        icon: <TrendingUp className="h-4 w-4" />,
        text: `+${change.toFixed(1)}%`,
        color: 'text-green-600'
      };
    } else {
      return {
        icon: <TrendingDown className="h-4 w-4" />,
        text: `${change.toFixed(1)}%`,
        color: 'text-red-600'
      };
    }
  };

  const trend = getTrend();

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{title}</CardTitle>
              {trend && (
                <Badge variant="outline" className={`${trend.color} border-current`}>
                  {trend.icon}
                  <span className="ml-1">{trend.text}</span>
                </Badge>
              )}
            </div>
            {description && (
              <CardDescription className="mt-1">{description}</CardDescription>
            )}
          </div>
          
          {showControls && (
            <div className="flex gap-1">
              {onRefresh && (
                <Button size="sm" variant="ghost" onClick={onRefresh}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
              {onConfigure && (
                <Button size="sm" variant="ghost" onClick={onConfigure}>
                  <Settings className="h-4 w-4" />
                </Button>
              )}
              {onExpand && (
                <Button size="sm" variant="ghost" onClick={onExpand}>
                  <Maximize2 className="h-4 w-4" />
                </Button>
              )}
              {onExport && (
                <Button size="sm" variant="ghost" onClick={() => onExport('png')}>
                  <Download className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div style={{ height: height + 'px' }}>
          {renderChart()}
        </div>
      </CardContent>
    </Card>
  );
}

export default ChartComponent;