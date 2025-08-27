// Componente container para renderização de gráficos

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ResponsiveContainer,
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
  ReferenceLine,
  ReferenceArea,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart
} from 'recharts';
import {
  MoreHorizontal,
  Download,
  Maximize2,
  Minimize2,
  RefreshCw,
  Settings,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Zap,
  Target
} from 'lucide-react';
import type {
  ChartData,
  ChartConfig,
  ChartType,
  ChartTheme,
  ChartSeries
} from '@/types/bi/dashboard';

export interface ChartContainerProps {
  data: ChartData[];
  config: ChartConfig;
  type?: ChartType;
  theme?: ChartTheme;
  title?: string;
  description?: string;
  height?: number;
  width?: string | number;
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  showControls?: boolean;
  showExport?: boolean;
  interactive?: boolean;
  animated?: boolean;
  loading?: boolean;
  error?: string | null;
  className?: string;
  onTypeChange?: (type: ChartType) => void;
  onExport?: (format: 'png' | 'svg' | 'pdf') => void;
  onRefresh?: () => void;
  onMaximize?: () => void;
  onConfigure?: () => void;
}

export interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  config: ChartConfig;
}

export interface ChartLegendProps {
  payload?: any[];
  config: ChartConfig;
}

// Color palettes
const colorPalettes = {
  default: [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00',
    '#0088fe', '#00c49f', '#ffbb28', '#ff8042', '#8dd1e1'
  ],
  clinical: [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
  ],
  financial: [
    '#059669', '#dc2626', '#d97706', '#7c3aed', '#0891b2',
    '#65a30d', '#c2410c', '#be185d', '#4338ca', '#0d9488'
  ],
  operational: [
    '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
    '#3b82f6', '#ef4444', '#06b6d4', '#84cc16', '#f97316'
  ]
};

// Utility functions
function formatValue(value: any, format?: string): string {
  if (value === null || value === undefined) return 'N/A';
  
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    case 'percentage':
      return `${(value * 100).toFixed(1)}%`;
    case 'decimal':
      return Number(value).toFixed(2);
    case 'integer':
      return Math.round(Number(value)).toString();
    default:
      return value.toLocaleString('pt-BR');
  }
}

function getChartIcon(type: ChartType) {
  const iconMap = {
    line: TrendingUp,
    area: Activity,
    bar: BarChart3,
    pie: PieChartIcon,
    scatter: Zap,
    radar: Target,
    composed: BarChart3
  };
  return iconMap[type] || BarChart3;
}

// Custom Tooltip Component
function CustomTooltip({ active, payload, label, config }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="bg-background border border-border rounded-lg shadow-lg p-3 min-w-[200px]">
      {label && (
        <p className="font-medium text-sm mb-2 text-foreground">
          {label}
        </p>
      )}
      <div className="space-y-1">
        {payload.map((entry, index) => {
          const series = config.series?.find(s => s.key === entry.dataKey);
          return (
            <div key={index} className="flex items-center justify-between space-x-3">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-muted-foreground">
                  {series?.name || entry.dataKey}
                </span>
              </div>
              <span className="text-sm font-medium text-foreground">
                {formatValue(entry.value, series?.format)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Custom Legend Component
function ChartLegend({ payload, config }: ChartLegendProps) {
  if (!payload || !payload.length) {
    return null;
  }

  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry, index) => {
        const series = config.series?.find(s => s.key === entry.dataKey);
        return (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-muted-foreground">
              {series?.name || entry.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Chart Type Selector
function ChartTypeSelector({ 
  currentType, 
  onTypeChange 
}: { 
  currentType: ChartType;
  onTypeChange: (type: ChartType) => void;
}) {
  const chartTypes: { type: ChartType; label: string; icon: any }[] = [
    { type: 'line', label: 'Linha', icon: TrendingUp },
    { type: 'area', label: 'Área', icon: Activity },
    { type: 'bar', label: 'Barras', icon: BarChart3 },
    { type: 'pie', label: 'Pizza', icon: PieChartIcon },
    { type: 'scatter', label: 'Dispersão', icon: Zap },
    { type: 'radar', label: 'Radar', icon: Target },
    { type: 'composed', label: 'Composto', icon: BarChart3 }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          {React.createElement(getChartIcon(currentType), { className: 'h-4 w-4 mr-2' })}
          {chartTypes.find(t => t.type === currentType)?.label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {chartTypes.map(({ type, label, icon: Icon }) => (
          <DropdownMenuItem
            key={type}
            onClick={() => onTypeChange(type)}
            className="flex items-center space-x-2"
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Chart Controls
function ChartControls({
  type,
  onTypeChange,
  onExport,
  onRefresh,
  onMaximize,
  onConfigure,
  showExport = true
}: {
  type: ChartType;
  onTypeChange?: (type: ChartType) => void;
  onExport?: (format: 'png' | 'svg' | 'pdf') => void;
  onRefresh?: () => void;
  onMaximize?: () => void;
  onConfigure?: () => void;
  showExport?: boolean;
}) {
  return (
    <div className="flex items-center space-x-2">
      {onTypeChange && (
        <ChartTypeSelector 
          currentType={type} 
          onTypeChange={onTypeChange} 
        />
      )}
      
      {onRefresh && (
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {showExport && onExport && (
            <>
              <DropdownMenuItem onClick={() => onExport('png')}>
                <Download className="h-4 w-4 mr-2" />
                Exportar PNG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport('svg')}>
                <Download className="h-4 w-4 mr-2" />
                Exportar SVG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport('pdf')}>
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </DropdownMenuItem>
            </>
          )}
          {onMaximize && (
            <DropdownMenuItem onClick={onMaximize}>
              <Maximize2 className="h-4 w-4 mr-2" />
              Maximizar
            </DropdownMenuItem>
          )}
          {onConfigure && (
            <DropdownMenuItem onClick={onConfigure}>
              <Settings className="h-4 w-4 mr-2" />
              Configurar
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Chart Renderer
function ChartRenderer({
  type,
  data,
  config,
  theme = 'default',
  showLegend = true,
  showGrid = true,
  showTooltip = true,
  animated = true
}: {
  type: ChartType;
  data: ChartData[];
  config: ChartConfig;
  theme?: ChartTheme;
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  animated?: boolean;
}) {
  const colors = colorPalettes[theme] || colorPalettes.default;
  
  const commonProps = {
    data,
    margin: { top: 5, right: 30, left: 20, bottom: 5 }
  };

  const renderSeries = (ChartComponent: any, seriesComponent: any) => {
    return config.series?.map((series, index) => {
      const SeriesComponent = seriesComponent;
      return (
        <SeriesComponent
          key={series.key}
          dataKey={series.key}
          stroke={colors[index % colors.length]}
          fill={colors[index % colors.length]}
          strokeWidth={2}
          name={series.name}
          {...(animated && { animationDuration: 1000 })}
        />
      );
    });
  };

  switch (type) {
    case 'line':
      return (
        <LineChart {...commonProps}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis 
            dataKey={config.xAxis?.key || 'x'} 
            tickFormatter={(value) => formatValue(value, config.xAxis?.format)}
          />
          <YAxis 
            tickFormatter={(value) => formatValue(value, config.yAxis?.format)}
          />
          {showTooltip && <Tooltip content={<CustomTooltip config={config} />} />}
          {showLegend && <Legend content={<ChartLegend config={config} />} />}
          {renderSeries(LineChart, Line)}
          {config.referenceLine && (
            <ReferenceLine 
              y={config.referenceLine.value} 
              stroke={config.referenceLine.color || '#ff0000'}
              strokeDasharray="5 5"
              label={config.referenceLine.label}
            />
          )}
        </LineChart>
      );

    case 'area':
      return (
        <AreaChart {...commonProps}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis 
            dataKey={config.xAxis?.key || 'x'} 
            tickFormatter={(value) => formatValue(value, config.xAxis?.format)}
          />
          <YAxis 
            tickFormatter={(value) => formatValue(value, config.yAxis?.format)}
          />
          {showTooltip && <Tooltip content={<CustomTooltip config={config} />} />}
          {showLegend && <Legend content={<ChartLegend config={config} />} />}
          {config.series?.map((series, index) => (
            <Area
              key={series.key}
              dataKey={series.key}
              stroke={colors[index % colors.length]}
              fill={colors[index % colors.length]}
              fillOpacity={0.6}
              name={series.name}
              {...(animated && { animationDuration: 1000 })}
            />
          ))}
        </AreaChart>
      );

    case 'bar':
      return (
        <BarChart {...commonProps}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis 
            dataKey={config.xAxis?.key || 'x'} 
            tickFormatter={(value) => formatValue(value, config.xAxis?.format)}
          />
          <YAxis 
            tickFormatter={(value) => formatValue(value, config.yAxis?.format)}
          />
          {showTooltip && <Tooltip content={<CustomTooltip config={config} />} />}
          {showLegend && <Legend content={<ChartLegend config={config} />} />}
          {renderSeries(BarChart, Bar)}
        </BarChart>
      );

    case 'pie':
      return (
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey={config.series?.[0]?.key || 'value'}
            {...(animated && { animationDuration: 1000 })}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          {showTooltip && <Tooltip content={<CustomTooltip config={config} />} />}
        </PieChart>
      );

    case 'scatter':
      return (
        <ScatterChart {...commonProps}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis 
            dataKey={config.xAxis?.key || 'x'} 
            type="number"
            tickFormatter={(value) => formatValue(value, config.xAxis?.format)}
          />
          <YAxis 
            dataKey={config.yAxis?.key || 'y'}
            type="number"
            tickFormatter={(value) => formatValue(value, config.yAxis?.format)}
          />
          {showTooltip && <Tooltip content={<CustomTooltip config={config} />} />}
          {showLegend && <Legend content={<ChartLegend config={config} />} />}
          {config.series?.map((series, index) => (
            <Scatter
              key={series.key}
              dataKey={series.key}
              fill={colors[index % colors.length]}
              name={series.name}
            />
          ))}
        </ScatterChart>
      );

    case 'radar':
      return (
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey={config.xAxis?.key || 'subject'} />
          <PolarRadiusAxis />
          {config.series?.map((series, index) => (
            <Radar
              key={series.key}
              name={series.name}
              dataKey={series.key}
              stroke={colors[index % colors.length]}
              fill={colors[index % colors.length]}
              fillOpacity={0.6}
            />
          ))}
          {showTooltip && <Tooltip />}
          {showLegend && <Legend />}
        </RadarChart>
      );

    case 'composed':
      return (
        <ComposedChart {...commonProps}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis 
            dataKey={config.xAxis?.key || 'x'} 
            tickFormatter={(value) => formatValue(value, config.xAxis?.format)}
          />
          <YAxis 
            tickFormatter={(value) => formatValue(value, config.yAxis?.format)}
          />
          {showTooltip && <Tooltip content={<CustomTooltip config={config} />} />}
          {showLegend && <Legend content={<ChartLegend config={config} />} />}
          {config.series?.map((series, index) => {
            const Component = series.type === 'line' ? Line : 
                            series.type === 'area' ? Area : Bar;
            return (
              <Component
                key={series.key}
                dataKey={series.key}
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                name={series.name}
                {...(animated && { animationDuration: 1000 })}
              />
            );
          })}
        </ComposedChart>
      );

    default:
      return null;
  }
}

// Main Chart Container Component
export function ChartContainer({
  data,
  config,
  type = 'line',
  theme = 'default',
  title,
  description,
  height = 300,
  width = '100%',
  showLegend = true,
  showGrid = true,
  showTooltip = true,
  showControls = true,
  showExport = true,
  interactive = true,
  animated = true,
  loading = false,
  error = null,
  className,
  onTypeChange,
  onExport,
  onRefresh,
  onMaximize,
  onConfigure
}: ChartContainerProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data;
  }, [data]);

  if (loading) {
    return (
      <Card className={cn('w-full', className)}>
        {(title || showControls) && (
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              {title && (
                <Skeleton className="h-6 w-48" />
              )}
              {description && (
                <Skeleton className="h-4 w-64" />
              )}
            </div>
            {showControls && (
              <Skeleton className="h-8 w-24" />
            )}
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-64 w-full" />
            <div className="flex justify-center space-x-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn('w-full border-destructive', className)}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center space-y-2">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-sm font-medium">Erro ao carregar gráfico</p>
            <p className="text-xs text-muted-foreground">{error}</p>
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar novamente
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center space-y-2">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-sm font-medium">Nenhum dado disponível</p>
            <p className="text-xs text-muted-foreground">
              Não há dados para exibir no gráfico
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full', className)}>
      {(title || description || showControls) && (
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            {title && (
              <CardTitle className="text-lg font-semibold">
                {title}
              </CardTitle>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {showControls && (
            <ChartControls
              type={type}
              onTypeChange={onTypeChange}
              onExport={onExport}
              onRefresh={onRefresh}
              onMaximize={onMaximize}
              onConfigure={onConfigure}
              showExport={showExport}
            />
          )}
        </CardHeader>
      )}
      
      <CardContent>
        <div style={{ width, height }}>
          <ResponsiveContainer width="100%" height="100%">
            <ChartRenderer
              type={type}
              data={chartData}
              config={config}
              theme={theme}
              showLegend={showLegend}
              showGrid={showGrid}
              showTooltip={showTooltip}
              animated={animated}
            />
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default ChartContainer;