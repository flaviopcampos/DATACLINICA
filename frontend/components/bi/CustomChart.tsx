// Componente para gráficos personalizados e configuráveis

import React, { useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Brush,
  ErrorBar
} from 'recharts';
import {
  Download,
  Settings,
  Maximize2,
  RefreshCw,
  Filter,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Zap,
  Target,
  Eye,
  EyeOff,
  Palette,
  Grid,
  MoreHorizontal,
  ChevronDown,
  Info,
  AlertTriangle
} from 'lucide-react';
import type {
  ChartData,
  ChartConfig,
  ChartType,
  ChartTheme,
  ChartSeries,
  ChartAxis,
  ChartLegend,
  ChartTooltip,
  ChartAnimation,
  ChartInteraction
} from '@/types/bi/charts';

export interface CustomChartProps {
  data: ChartData[];
  config: ChartConfig;
  type?: ChartType;
  title?: string;
  description?: string;
  series?: ChartSeries[];
  xAxis?: ChartAxis;
  yAxis?: ChartAxis;
  legend?: ChartLegend;
  tooltip?: ChartTooltip;
  theme?: ChartTheme;
  colors?: string[];
  animation?: ChartAnimation;
  interaction?: ChartInteraction;
  width?: number | string;
  height?: number | string;
  responsive?: boolean;
  showControls?: boolean;
  showExport?: boolean;
  showRefresh?: boolean;
  showMaximize?: boolean;
  showFilters?: boolean;
  showGrid?: boolean;
  showBrush?: boolean;
  showReferenceLine?: boolean;
  referenceLines?: Array<{
    value: number;
    label?: string;
    color?: string;
    strokeDasharray?: string;
  }>;
  referenceAreas?: Array<{
    x1: number | string;
    x2: number | string;
    y1?: number;
    y2?: number;
    fill?: string;
    label?: string;
  }>;
  className?: string;
  loading?: boolean;
  error?: string | null;
  onDataPointClick?: (data: any, index: number) => void;
  onLegendClick?: (dataKey: string, entry: any) => void;
  onBrushChange?: (brushData: any) => void;
  onExport?: (format: 'png' | 'svg' | 'pdf' | 'csv') => void;
  onRefresh?: () => void;
  onMaximize?: () => void;
  onConfigChange?: (config: Partial<ChartConfig>) => void;
}

export interface ChartControlsProps {
  type: ChartType;
  config: ChartConfig;
  series: ChartSeries[];
  showExport?: boolean;
  showRefresh?: boolean;
  showMaximize?: boolean;
  showFilters?: boolean;
  onTypeChange?: (type: ChartType) => void;
  onConfigChange?: (config: Partial<ChartConfig>) => void;
  onSeriesToggle?: (seriesId: string) => void;
  onExport?: (format: 'png' | 'svg' | 'pdf' | 'csv') => void;
  onRefresh?: () => void;
  onMaximize?: () => void;
}

export interface ChartLegendProps {
  series: ChartSeries[];
  colors: string[];
  onSeriesToggle?: (seriesId: string) => void;
  position?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  className?: string;
}

// Default color palettes
const COLOR_PALETTES = {
  default: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'],
  medical: ['#059669', '#dc2626', '#2563eb', '#7c3aed', '#db2777', '#ea580c', '#65a30d', '#0891b2'],
  professional: ['#1f2937', '#374151', '#4b5563', '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb', '#f3f4f6'],
  vibrant: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'],
  pastel: ['#a8e6cf', '#dcedc1', '#ffd3a5', '#ffa8a8', '#b4a7d6', '#d4a4eb', '#f8c8dc', '#c7ceea']
};

// Chart type configurations
const CHART_TYPES = {
  line: { icon: TrendingUp, label: 'Linha' },
  area: { icon: Activity, label: 'Área' },
  bar: { icon: BarChart3, label: 'Barras' },
  pie: { icon: PieChartIcon, label: 'Pizza' },
  scatter: { icon: Target, label: 'Dispersão' },
  radar: { icon: Zap, label: 'Radar' },
  composed: { icon: BarChart3, label: 'Composto' }
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
    case 'date':
      return new Date(value).toLocaleDateString('pt-BR');
    case 'datetime':
      return new Date(value).toLocaleString('pt-BR');
    default:
      return typeof value === 'number' ? value.toLocaleString('pt-BR') : String(value);
  }
}

function getColorPalette(theme: ChartTheme = 'default'): string[] {
  return COLOR_PALETTES[theme] || COLOR_PALETTES.default;
}

// Custom Tooltip Component
function CustomTooltip({ active, payload, label, config }: any) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-background border border-border rounded-lg shadow-lg p-3 min-w-[200px]">
      <p className="font-medium text-foreground mb-2">
        {formatValue(label, config?.xAxis?.format)}
      </p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center justify-between space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
          </div>
          <span className="font-medium text-foreground">
            {formatValue(entry.value, entry.format)}
          </span>
        </div>
      ))}
    </div>
  );
}

// Chart Controls Component
function ChartControls({
  type,
  config,
  series,
  showExport = true,
  showRefresh = true,
  showMaximize = true,
  showFilters = false,
  onTypeChange,
  onConfigChange,
  onSeriesToggle,
  onExport,
  onRefresh,
  onMaximize
}: ChartControlsProps) {
  return (
    <div className="flex items-center space-x-2">
      {/* Chart Type Selector */}
      <Select value={type} onValueChange={onTypeChange}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(CHART_TYPES).map(([key, { icon: Icon, label }]) => (
            <SelectItem key={key} value={key}>
              <div className="flex items-center space-x-2">
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Series Toggle */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Séries
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Mostrar/Ocultar Séries</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {series.map((serie) => (
            <DropdownMenuItem
              key={serie.id}
              onClick={() => onSeriesToggle?.(serie.id)}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: serie.color }}
                />
                <span>{serie.name}</span>
              </div>
              {serie.visible ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Export Options */}
      {showExport && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Exportar como</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onExport?.('png')}>
              Imagem PNG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport?.('svg')}>
              Vetor SVG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport?.('pdf')}>
              Documento PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport?.('csv')}>
              Dados CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Refresh Button */}
      {showRefresh && (
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      )}

      {/* Maximize Button */}
      {showMaximize && (
        <Button variant="outline" size="sm" onClick={onMaximize}>
          <Maximize2 className="h-4 w-4" />
        </Button>
      )}

      {/* Filters */}
      {showFilters && (
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4" />
        </Button>
      )}

      {/* Settings */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Configurações</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onConfigChange?.({ showGrid: !config.showGrid })}>
            <Grid className="h-4 w-4 mr-2" />
            {config.showGrid ? 'Ocultar' : 'Mostrar'} Grade
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onConfigChange?.({ showLegend: !config.showLegend })}>
            <Info className="h-4 w-4 mr-2" />
            {config.showLegend ? 'Ocultar' : 'Mostrar'} Legenda
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onConfigChange?.({ animation: !config.animation })}>
            <Zap className="h-4 w-4 mr-2" />
            {config.animation ? 'Desabilitar' : 'Habilitar'} Animação
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Chart Legend Component
function ChartLegendComponent({
  series,
  colors,
  onSeriesToggle,
  position = 'bottom',
  align = 'center',
  className
}: ChartLegendProps) {
  const positionClasses = {
    top: 'flex-col-reverse',
    bottom: 'flex-col',
    left: 'flex-row-reverse',
    right: 'flex-row'
  };

  const alignClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end'
  };

  return (
    <div className={cn(
      'flex flex-wrap gap-4 text-sm',
      alignClasses[align],
      className
    )}>
      {series.map((serie, index) => (
        <div
          key={serie.id}
          className={cn(
            'flex items-center space-x-2 cursor-pointer transition-opacity',
            !serie.visible && 'opacity-50'
          )}
          onClick={() => onSeriesToggle?.(serie.id)}
        >
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: serie.color || colors[index % colors.length] }}
          />
          <span className={cn(
            'text-muted-foreground hover:text-foreground transition-colors',
            !serie.visible && 'line-through'
          )}>
            {serie.name}
          </span>
        </div>
      ))}
    </div>
  );
}

// Main Custom Chart Component
export function CustomChart({
  data,
  config,
  type = 'line',
  title,
  description,
  series = [],
  xAxis,
  yAxis,
  legend,
  tooltip,
  theme = 'default',
  colors,
  animation,
  interaction,
  width = '100%',
  height = 400,
  responsive = true,
  showControls = true,
  showExport = true,
  showRefresh = true,
  showMaximize = true,
  showFilters = false,
  showGrid = true,
  showBrush = false,
  showReferenceLine = false,
  referenceLines = [],
  referenceAreas = [],
  className,
  loading = false,
  error = null,
  onDataPointClick,
  onLegendClick,
  onBrushChange,
  onExport,
  onRefresh,
  onMaximize,
  onConfigChange
}: CustomChartProps) {
  const [chartType, setChartType] = useState<ChartType>(type);
  const [chartConfig, setChartConfig] = useState<ChartConfig>(config);
  const [visibleSeries, setVisibleSeries] = useState<string[]>(
    series.map(s => s.id)
  );

  const colorPalette = useMemo(() => {
    return colors || getColorPalette(theme);
  }, [colors, theme]);

  const processedSeries = useMemo(() => {
    return series.map((serie, index) => ({
      ...serie,
      color: serie.color || colorPalette[index % colorPalette.length],
      visible: visibleSeries.includes(serie.id)
    }));
  }, [series, colorPalette, visibleSeries]);

  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data;
  }, [data]);

  const handleTypeChange = useCallback((newType: ChartType) => {
    setChartType(newType);
  }, []);

  const handleConfigChange = useCallback((newConfig: Partial<ChartConfig>) => {
    const updatedConfig = { ...chartConfig, ...newConfig };
    setChartConfig(updatedConfig);
    onConfigChange?.(updatedConfig);
  }, [chartConfig, onConfigChange]);

  const handleSeriesToggle = useCallback((seriesId: string) => {
    setVisibleSeries(prev => 
      prev.includes(seriesId) 
        ? prev.filter(id => id !== seriesId)
        : [...prev, seriesId]
    );
  }, []);

  const renderChart = () => {
    const commonProps = {
      data: filteredData,
      margin: { top: 20, right: 30, left: 20, bottom: 20 },
      onClick: onDataPointClick
    };

    const xAxisProps = {
      dataKey: xAxis?.dataKey || 'name',
      tick: { fontSize: 12 },
      tickFormatter: (value: any) => formatValue(value, xAxis?.format),
      ...(xAxis?.label && { label: { value: xAxis.label, position: 'insideBottom', offset: -10 } })
    };

    const yAxisProps = {
      tick: { fontSize: 12 },
      tickFormatter: (value: any) => formatValue(value, yAxis?.format),
      ...(yAxis?.label && { label: { value: yAxis.label, angle: -90, position: 'insideLeft' } })
    };

    const tooltipProps = {
      content: <CustomTooltip config={chartConfig} />,
      cursor: { strokeDasharray: '3 3' }
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip {...tooltipProps} />
            {chartConfig.showLegend && <Legend onClick={onLegendClick} />}
            {processedSeries.filter(s => s.visible).map((serie, index) => (
              <Line
                key={serie.id}
                type="monotone"
                dataKey={serie.dataKey}
                stroke={serie.color}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                animationDuration={animation?.duration || 1000}
                connectNulls={false}
              />
            ))}
            {referenceLines.map((line, index) => (
              <ReferenceLine
                key={index}
                y={line.value}
                stroke={line.color || '#666'}
                strokeDasharray={line.strokeDasharray || '5 5'}
                label={line.label}
              />
            ))}
            {referenceAreas.map((area, index) => (
              <ReferenceArea
                key={index}
                x1={area.x1}
                x2={area.x2}
                y1={area.y1}
                y2={area.y2}
                fill={area.fill || 'rgba(0,0,0,0.1)'}
                label={area.label}
              />
            ))}
            {showBrush && <Brush dataKey={xAxis?.dataKey || 'name'} height={30} onChange={onBrushChange} />}
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip {...tooltipProps} />
            {chartConfig.showLegend && <Legend onClick={onLegendClick} />}
            {processedSeries.filter(s => s.visible).map((serie, index) => (
              <Area
                key={serie.id}
                type="monotone"
                dataKey={serie.dataKey}
                stroke={serie.color}
                fill={serie.color}
                fillOpacity={0.3}
                strokeWidth={2}
                animationDuration={animation?.duration || 1000}
              />
            ))}
            {showBrush && <Brush dataKey={xAxis?.dataKey || 'name'} height={30} onChange={onBrushChange} />}
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip {...tooltipProps} />
            {chartConfig.showLegend && <Legend onClick={onLegendClick} />}
            {processedSeries.filter(s => s.visible).map((serie, index) => (
              <Bar
                key={serie.id}
                dataKey={serie.dataKey}
                fill={serie.color}
                radius={[2, 2, 0, 0]}
                animationDuration={animation?.duration || 1000}
              />
            ))}
            {showBrush && <Brush dataKey={xAxis?.dataKey || 'name'} height={30} onChange={onBrushChange} />}
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart {...commonProps}>
            <Tooltip {...tooltipProps} />
            {chartConfig.showLegend && <Legend onClick={onLegendClick} />}
            <Pie
              data={filteredData}
              cx="50%"
              cy="50%"
              outerRadius={120}
              fill="#8884d8"
              dataKey={processedSeries[0]?.dataKey || 'value'}
              animationDuration={animation?.duration || 1000}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {filteredData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colorPalette[index % colorPalette.length]} />
              ))}
            </Pie>
          </PieChart>
        );

      case 'scatter':
        return (
          <ScatterChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip {...tooltipProps} />
            {chartConfig.showLegend && <Legend onClick={onLegendClick} />}
            {processedSeries.filter(s => s.visible).map((serie, index) => (
              <Scatter
                key={serie.id}
                name={serie.name}
                data={filteredData}
                fill={serie.color}
                animationDuration={animation?.duration || 1000}
              />
            ))}
          </ScatterChart>
        );

      case 'radar':
        return (
          <RadarChart {...commonProps} cx="50%" cy="50%" outerRadius="80%">
            <PolarGrid />
            <PolarAngleAxis dataKey={xAxis?.dataKey || 'name'} />
            <PolarRadiusAxis />
            <Tooltip {...tooltipProps} />
            {chartConfig.showLegend && <Legend onClick={onLegendClick} />}
            {processedSeries.filter(s => s.visible).map((serie, index) => (
              <Radar
                key={serie.id}
                name={serie.name}
                dataKey={serie.dataKey}
                stroke={serie.color}
                fill={serie.color}
                fillOpacity={0.3}
                strokeWidth={2}
                animationDuration={animation?.duration || 1000}
              />
            ))}
          </RadarChart>
        );

      case 'composed':
        return (
          <ComposedChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip {...tooltipProps} />
            {chartConfig.showLegend && <Legend onClick={onLegendClick} />}
            {processedSeries.filter(s => s.visible).map((serie, index) => {
              switch (serie.type) {
                case 'bar':
                  return (
                    <Bar
                      key={serie.id}
                      dataKey={serie.dataKey}
                      fill={serie.color}
                      animationDuration={animation?.duration || 1000}
                    />
                  );
                case 'area':
                  return (
                    <Area
                      key={serie.id}
                      type="monotone"
                      dataKey={serie.dataKey}
                      stroke={serie.color}
                      fill={serie.color}
                      fillOpacity={0.3}
                      animationDuration={animation?.duration || 1000}
                    />
                  );
                default:
                  return (
                    <Line
                      key={serie.id}
                      type="monotone"
                      dataKey={serie.dataKey}
                      stroke={serie.color}
                      strokeWidth={2}
                      animationDuration={animation?.duration || 1000}
                    />
                  );
              }
            })}
            {showBrush && <Brush dataKey={xAxis?.dataKey || 'name'} height={30} onChange={onBrushChange} />}
          </ComposedChart>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-8 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full" style={{ height }} />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn('w-full border-destructive', className)}>
        <CardContent className="flex items-center justify-center" style={{ height }}>
          <div className="text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-destructive">Erro ao carregar gráfico</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            {onRefresh && (
              <Button variant="outline" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar novamente
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!filteredData || filteredData.length === 0) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          {(title || description) && (
            <div className="space-y-2">
              {title && <CardTitle>{title}</CardTitle>}
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          )}
          {showControls && (
            <ChartControls
              type={chartType}
              config={chartConfig}
              series={processedSeries}
              showExport={showExport}
              showRefresh={showRefresh}
              showMaximize={showMaximize}
              showFilters={showFilters}
              onTypeChange={handleTypeChange}
              onConfigChange={handleConfigChange}
              onSeriesToggle={handleSeriesToggle}
              onExport={onExport}
              onRefresh={onRefresh}
              onMaximize={onMaximize}
            />
          )}
        </CardHeader>
        <CardContent className="flex items-center justify-center" style={{ height }}>
          <div className="text-center space-y-4">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-muted-foreground">Nenhum dado disponível</h3>
              <p className="text-sm text-muted-foreground">Não há dados para exibir neste gráfico</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            {title && <CardTitle>{title}</CardTitle>}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {showControls && (
            <ChartControls
              type={chartType}
              config={chartConfig}
              series={processedSeries}
              showExport={showExport}
              showRefresh={showRefresh}
              showMaximize={showMaximize}
              showFilters={showFilters}
              onTypeChange={handleTypeChange}
              onConfigChange={handleConfigChange}
              onSeriesToggle={handleSeriesToggle}
              onExport={onExport}
              onRefresh={onRefresh}
              onMaximize={onMaximize}
            />
          )}
        </div>
        
        {/* Custom Legend */}
        {legend && legend.show && (
          <ChartLegendComponent
            series={processedSeries}
            colors={colorPalette}
            onSeriesToggle={handleSeriesToggle}
            position={legend.position}
            align={legend.align}
          />
        )}
      </CardHeader>
      
      <CardContent>
        <div style={{ width, height }}>
          {responsive ? (
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          ) : (
            renderChart()
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default CustomChart;