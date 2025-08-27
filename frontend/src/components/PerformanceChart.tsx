'use client'

import { useState, useMemo } from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Brush
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  MemoryStick,
  Clock,
  Zap,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Maximize2,
  Minimize2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface DataPoint {
  timestamp: string
  value: number
  label?: string
  metadata?: Record<string, any>
}

interface MetricSeries {
  id: string
  name: string
  data: DataPoint[]
  color: string
  unit: string
  type?: 'line' | 'area' | 'bar'
  threshold?: {
    warning: number
    critical: number
  }
  visible?: boolean
}

interface PerformanceChartProps {
  title: string
  description?: string
  series: MetricSeries[]
  timeRange?: '1h' | '6h' | '24h' | '7d' | '30d'
  chartType?: 'line' | 'area' | 'bar' | 'mixed'
  height?: number
  showLegend?: boolean
  showGrid?: boolean
  showBrush?: boolean
  showThresholds?: boolean
  showTrend?: boolean
  isLoading?: boolean
  isRealTime?: boolean
  refreshInterval?: number
  onTimeRangeChange?: (range: string) => void
  onChartTypeChange?: (type: string) => void
  onRefresh?: () => void
  onToggleSeries?: (seriesId: string) => void
  className?: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-900 mb-2">
          {format(new Date(label || ''), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
        </p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center space-x-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600">{entry.name}:</span>
            <span className="font-medium text-gray-900">
              {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
              {entry.payload?.unit && ` ${entry.payload.unit}`}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

function formatXAxisTick(tickItem: string, timeRange: string) {
  const date = new Date(tickItem)
  
  switch (timeRange) {
    case '1h':
    case '6h':
      return format(date, 'HH:mm')
    case '24h':
      return format(date, 'HH:mm')
    case '7d':
      return format(date, 'dd/MM')
    case '30d':
      return format(date, 'dd/MM')
    default:
      return format(date, 'HH:mm')
  }
}

function formatYAxisTick(value: number, unit: string) {
  if (unit === '%') {
    return `${value}%`
  }
  if (unit === 'MB' || unit === 'GB') {
    if (value >= 1024) {
      return `${(value / 1024).toFixed(1)}GB`
    }
    return `${value}MB`
  }
  if (unit === 'ms') {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}s`
    }
    return `${value}ms`
  }
  return `${value}${unit}`
}

function calculateTrend(data: DataPoint[]): { direction: 'up' | 'down' | 'stable'; percentage: number } {
  if (data.length < 2) return { direction: 'stable', percentage: 0 }
  
  const recent = data.slice(-5).map(d => d.value)
  const older = data.slice(-10, -5).map(d => d.value)
  
  if (recent.length === 0 || older.length === 0) return { direction: 'stable', percentage: 0 }
  
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length
  
  const percentage = ((recentAvg - olderAvg) / olderAvg) * 100
  
  if (Math.abs(percentage) < 1) return { direction: 'stable', percentage: 0 }
  
  return {
    direction: percentage > 0 ? 'up' : 'down',
    percentage: Math.abs(percentage)
  }
}

function getMetricIcon(seriesId: string) {
  switch (seriesId.toLowerCase()) {
    case 'cpu':
      return <Cpu className="h-4 w-4" />
    case 'memory':
    case 'ram':
      return <MemoryStick className="h-4 w-4" />
    case 'disk':
    case 'storage':
      return <HardDrive className="h-4 w-4" />
    case 'network':
    case 'bandwidth':
      return <Wifi className="h-4 w-4" />
    case 'response_time':
    case 'latency':
      return <Clock className="h-4 w-4" />
    case 'throughput':
    case 'requests':
      return <Zap className="h-4 w-4" />
    case 'download':
      return <Download className="h-4 w-4" />
    case 'upload':
      return <Upload className="h-4 w-4" />
    default:
      return <Activity className="h-4 w-4" />
  }
}

export function PerformanceChart({
  title,
  description,
  series,
  timeRange = '24h',
  chartType = 'line',
  height = 400,
  showLegend = true,
  showGrid = true,
  showBrush = false,
  showThresholds = true,
  showTrend = true,
  isLoading = false,
  isRealTime = false,
  refreshInterval = 30000,
  onTimeRangeChange,
  onChartTypeChange,
  onRefresh,
  onToggleSeries,
  className
}: PerformanceChartProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedSeries, setSelectedSeries] = useState<string[]>(
    series.filter(s => s.visible !== false).map(s => s.id)
  )

  // Combinar dados de todas as séries por timestamp
  const combinedData = useMemo(() => {
    const dataMap = new Map<string, any>()
    
    series.forEach(serie => {
      if (!selectedSeries.includes(serie.id)) return
      
      serie.data.forEach(point => {
        const key = point.timestamp
        if (!dataMap.has(key)) {
          dataMap.set(key, { timestamp: key })
        }
        dataMap.get(key)![serie.id] = point.value
        dataMap.get(key)![`${serie.id}_unit`] = serie.unit
      })
    })
    
    return Array.from(dataMap.values()).sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
  }, [series, selectedSeries])

  // Calcular tendências para cada série
  const trends = useMemo(() => {
    const trendsMap = new Map<string, ReturnType<typeof calculateTrend>>()
    
    series.forEach(serie => {
      if (selectedSeries.includes(serie.id)) {
        trendsMap.set(serie.id, calculateTrend(serie.data))
      }
    })
    
    return trendsMap
  }, [series, selectedSeries])

  const visibleSeries = series.filter(s => selectedSeries.includes(s.id))

  const renderChart = () => {
    const commonProps = {
      data: combinedData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    }

    const xAxisProps = {
      dataKey: 'timestamp',
      tickFormatter: (value: string) => formatXAxisTick(value, timeRange),
      stroke: '#6b7280',
      fontSize: 12
    }

    const yAxisProps = {
      stroke: '#6b7280',
      fontSize: 12,
      tickFormatter: (value: number) => {
        const firstSeries = visibleSeries[0]
        return firstSeries ? formatYAxisTick(value, firstSeries.unit) : value.toString()
      }
    }

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            
            {visibleSeries.map(serie => (
              <Area
                key={serie.id}
                type="monotone"
                dataKey={serie.id}
                stroke={serie.color}
                fill={serie.color}
                fillOpacity={0.3}
                strokeWidth={2}
                name={serie.name}
              />
            ))}
            
            {showThresholds && visibleSeries.map(serie => (
              serie.threshold && [
                <ReferenceLine
                  key={`${serie.id}-warning`}
                  y={serie.threshold.warning}
                  stroke="#f59e0b"
                  strokeDasharray="5 5"
                  label={{ value: 'Aviso', position: 'right' }}
                />,
                <ReferenceLine
                  key={`${serie.id}-critical`}
                  y={serie.threshold.critical}
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  label={{ value: 'Crítico', position: 'right' }}
                />
              ]
            ))}
            
            {showBrush && <Brush dataKey="timestamp" height={30} stroke={visibleSeries[0]?.color} />}
          </AreaChart>
        )
        
      case 'bar':
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            
            {visibleSeries.map(serie => (
              <Bar
                key={serie.id}
                dataKey={serie.id}
                fill={serie.color}
                name={serie.name}
                radius={[2, 2, 0, 0]}
              />
            ))}
            
            {showBrush && <Brush dataKey="timestamp" height={30} stroke={visibleSeries[0]?.color} />}
          </BarChart>
        )
        
      case 'line':
      default:
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            
            {visibleSeries.map(serie => (
              <Line
                key={serie.id}
                type="monotone"
                dataKey={serie.id}
                stroke={serie.color}
                strokeWidth={2}
                dot={false}
                name={serie.name}
                connectNulls={false}
              />
            ))}
            
            {showThresholds && visibleSeries.map(serie => (
              serie.threshold && [
                <ReferenceLine
                  key={`${serie.id}-warning`}
                  y={serie.threshold.warning}
                  stroke="#f59e0b"
                  strokeDasharray="5 5"
                  label={{ value: 'Aviso', position: 'right' }}
                />,
                <ReferenceLine
                  key={`${serie.id}-critical`}
                  y={serie.threshold.critical}
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  label={{ value: 'Crítico', position: 'right' }}
                />
              ]
            ))}
            
            {showBrush && <Brush dataKey="timestamp" height={30} stroke={visibleSeries[0]?.color} />}
          </LineChart>
        )
    }
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>{title}</span>
            {isRealTime && (
              <Badge variant="outline" className="text-green-600 border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                Tempo Real
              </Badge>
            )}
          </CardTitle>
          {description && (
            <CardDescription>{description}</CardDescription>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Controles de série */}
          {series.length > 1 && (
            <div className="flex items-center space-x-1">
              {series.map(serie => {
                const trend = trends.get(serie.id)
                const isVisible = selectedSeries.includes(serie.id)
                
                return (
                  <Button
                    key={serie.id}
                    variant={isVisible ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (onToggleSeries) {
                        onToggleSeries(serie.id)
                      } else {
                        setSelectedSeries(prev => 
                          isVisible 
                            ? prev.filter(id => id !== serie.id)
                            : [...prev, serie.id]
                        )
                      }
                    }}
                    className="h-8 px-2"
                  >
                    <div className="flex items-center space-x-1">
                      {getMetricIcon(serie.id)}
                      <span className="text-xs">{serie.name}</span>
                      {showTrend && trend && isVisible && (
                        <div className="flex items-center space-x-1">
                          {trend.direction === 'up' ? (
                            <TrendingUp className="h-3 w-3 text-red-500" />
                          ) : trend.direction === 'down' ? (
                            <TrendingDown className="h-3 w-3 text-green-500" />
                          ) : null}
                          <span className="text-xs">
                            {trend.percentage.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </Button>
                )
              })}
            </div>
          )}
          
          {/* Seletor de período */}
          <Select value={timeRange} onValueChange={onTimeRangeChange}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1h</SelectItem>
              <SelectItem value="6h">6h</SelectItem>
              <SelectItem value="24h">24h</SelectItem>
              <SelectItem value="7d">7d</SelectItem>
              <SelectItem value="30d">30d</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Seletor de tipo de gráfico */}
          <Select value={chartType} onValueChange={onChartTypeChange}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Linha</SelectItem>
              <SelectItem value="area">Área</SelectItem>
              <SelectItem value="bar">Barra</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Botão de refresh */}
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            </Button>
          )}
          
          {/* Botão de expandir */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Estatísticas rápidas */}
          {showTrend && visibleSeries.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {visibleSeries.map(serie => {
                const trend = trends.get(serie.id)
                const latestValue = serie.data[serie.data.length - 1]?.value || 0
                
                return (
                  <div key={serie.id} className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      {getMetricIcon(serie.id)}
                      <span className="text-sm font-medium text-gray-600">{serie.name}</span>
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {latestValue.toFixed(1)}{serie.unit}
                    </div>
                    {trend && (
                      <div className="flex items-center justify-center space-x-1 text-xs">
                        {trend.direction === 'up' ? (
                          <TrendingUp className="h-3 w-3 text-red-500" />
                        ) : trend.direction === 'down' ? (
                          <TrendingDown className="h-3 w-3 text-green-500" />
                        ) : null}
                        <span className={cn(
                          trend.direction === 'up' ? 'text-red-600' :
                          trend.direction === 'down' ? 'text-green-600' :
                          'text-gray-600'
                        )}>
                          {trend.percentage.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
          
          {/* Gráfico principal */}
          <div className="relative">
            <ResponsiveContainer width="100%" height={isExpanded ? height * 1.5 : height}>
              {renderChart()}
            </ResponsiveContainer>
            
            {isLoading && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                <div className="flex items-center space-x-2 text-gray-600">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span className="text-sm font-medium">Carregando dados...</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Configurações adicionais */}
          {isExpanded && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-grid"
                    checked={showGrid}
                    onCheckedChange={() => {}}
                  />
                  <Label htmlFor="show-grid" className="text-sm">Grade</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-legend"
                    checked={showLegend}
                    onCheckedChange={() => {}}
                  />
                  <Label htmlFor="show-legend" className="text-sm">Legenda</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-thresholds"
                    checked={showThresholds}
                    onCheckedChange={() => {}}
                  />
                  <Label htmlFor="show-thresholds" className="text-sm">Limites</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-brush"
                    checked={showBrush}
                    onCheckedChange={() => {}}
                  />
                  <Label htmlFor="show-brush" className="text-sm">Navegação</Label>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default PerformanceChart