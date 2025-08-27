'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import {
  Filter,
  Search,
  Calendar,
  Clock,
  TrendingUp,
  BarChart3,
  Activity,
  Cpu,
  HardDrive,
  Network,
  Users,
  Database,
  Server,
  Globe,
  Zap,
  AlertTriangle,
  CheckCircle,
  X,
  RotateCcw,
  Settings,
  Eye,
  EyeOff,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, subDays, subHours, subMinutes } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface MetricSource {
  id: string
  name: string
  category: 'system' | 'application' | 'business' | 'custom'
  type: 'counter' | 'gauge' | 'histogram' | 'summary'
  unit: string
  description?: string
  tags?: string[]
  isActive: boolean
}

interface TimeRange {
  start: Date
  end: Date
  preset?: 'last5m' | 'last15m' | 'last1h' | 'last6h' | 'last24h' | 'last7d' | 'last30d' | 'custom'
}

interface MetricsFilterConfig {
  sources: string[]
  categories: string[]
  types: string[]
  timeRange: TimeRange
  refreshInterval: number // em segundos
  aggregation: 'avg' | 'sum' | 'min' | 'max' | 'count'
  groupBy: string[]
  search: string
  showInactive: boolean
  customFilters: {
    key: string
    operator: 'equals' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte'
    value: string
  }[]
  thresholds: {
    warning: number
    critical: number
  }
}

interface MetricsFilterProps {
  availableSources: MetricSource[]
  config: MetricsFilterConfig
  onConfigChange: (config: MetricsFilterConfig) => void
  isLoading?: boolean
  className?: string
}

const TIME_PRESETS = [
  { value: 'last5m', label: 'Últimos 5 minutos', duration: 5 * 60 * 1000 },
  { value: 'last15m', label: 'Últimos 15 minutos', duration: 15 * 60 * 1000 },
  { value: 'last1h', label: 'Última hora', duration: 60 * 60 * 1000 },
  { value: 'last6h', label: 'Últimas 6 horas', duration: 6 * 60 * 60 * 1000 },
  { value: 'last24h', label: 'Últimas 24 horas', duration: 24 * 60 * 60 * 1000 },
  { value: 'last7d', label: 'Últimos 7 dias', duration: 7 * 24 * 60 * 60 * 1000 },
  { value: 'last30d', label: 'Últimos 30 dias', duration: 30 * 24 * 60 * 60 * 1000 },
  { value: 'custom', label: 'Personalizado', duration: 0 }
] as const

const REFRESH_INTERVALS = [
  { value: 0, label: 'Manual' },
  { value: 5, label: '5 segundos' },
  { value: 10, label: '10 segundos' },
  { value: 30, label: '30 segundos' },
  { value: 60, label: '1 minuto' },
  { value: 300, label: '5 minutos' },
  { value: 900, label: '15 minutos' }
]

const AGGREGATION_OPTIONS = [
  { value: 'avg', label: 'Média', icon: TrendingUp },
  { value: 'sum', label: 'Soma', icon: Plus },
  { value: 'min', label: 'Mínimo', icon: ChevronDown },
  { value: 'max', label: 'Máximo', icon: ChevronUp },
  { value: 'count', label: 'Contagem', icon: BarChart3 }
]

const CATEGORY_ICONS = {
  system: Server,
  application: Globe,
  business: Users,
  custom: Settings
}

const TYPE_ICONS = {
  counter: Plus,
  gauge: Activity,
  histogram: BarChart3,
  summary: TrendingUp
}

function SourceCard({ 
  source, 
  isSelected, 
  onToggle 
}: { 
  source: MetricSource
  isSelected: boolean
  onToggle: () => void
}) {
  const CategoryIcon = CATEGORY_ICONS[source.category]
  const TypeIcon = TYPE_ICONS[source.type]
  
  return (
    <Card 
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md',
        isSelected && 'ring-2 ring-blue-500 bg-blue-50',
        !source.isActive && 'opacity-60'
      )}
      onClick={onToggle}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <Checkbox checked={isSelected} readOnly />
              <CategoryIcon className="h-4 w-4 text-gray-500" />
              <TypeIcon className="h-4 w-4 text-gray-500" />
              {!source.isActive && (
                <Badge variant="secondary" className="text-xs">
                  Inativo
                </Badge>
              )}
            </div>
            
            <h4 className="font-medium text-sm truncate">{source.name}</h4>
            
            {source.description && (
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                {source.description}
              </p>
            )}
            
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {source.category}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {source.type}
              </Badge>
              {source.unit && (
                <Badge variant="outline" className="text-xs">
                  {source.unit}
                </Badge>
              )}
            </div>
            
            {source.tags && source.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {source.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {source.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{source.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CustomFilterRow({
  filter,
  onUpdate,
  onRemove
}: {
  filter: { key: string; operator: string; value: string }
  onUpdate: (filter: { key: string; operator: string; value: string }) => void
  onRemove: () => void
}) {
  return (
    <div className="flex items-center space-x-2">
      <Input
        placeholder="Campo"
        value={filter.key}
        onChange={(e) => onUpdate({ ...filter, key: e.target.value })}
        className="flex-1"
      />
      
      <Select
        value={filter.operator}
        onValueChange={(value) => onUpdate({ ...filter, operator: value })}
      >
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="equals">Igual</SelectItem>
          <SelectItem value="contains">Contém</SelectItem>
          <SelectItem value="gt">Maior que</SelectItem>
          <SelectItem value="lt">Menor que</SelectItem>
          <SelectItem value="gte">Maior ou igual</SelectItem>
          <SelectItem value="lte">Menor ou igual</SelectItem>
        </SelectContent>
      </Select>
      
      <Input
        placeholder="Valor"
        value={filter.value}
        onChange={(e) => onUpdate({ ...filter, value: e.target.value })}
        className="flex-1"
      />
      
      <Button
        variant="outline"
        size="sm"
        onClick={onRemove}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function MetricsFilter({
  availableSources,
  config,
  onConfigChange,
  isLoading = false,
  className
}: MetricsFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])

  const categories = Array.from(new Set(availableSources.map(s => s.category)))
  const types = Array.from(new Set(availableSources.map(s => s.type)))

  const filteredSources = availableSources.filter(source => {
    // Filtro de busca
    if (searchTerm && !source.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !source.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    
    // Filtro de categoria
    if (selectedCategories.length > 0 && !selectedCategories.includes(source.category)) {
      return false
    }
    
    // Filtro de tipo
    if (selectedTypes.length > 0 && !selectedTypes.includes(source.type)) {
      return false
    }
    
    // Filtro de ativo/inativo
    if (!config.showInactive && !source.isActive) {
      return false
    }
    
    return true
  })

  const handleTimePresetChange = (preset: string) => {
    const now = new Date()
    let start: Date
    
    switch (preset) {
      case 'last5m':
        start = subMinutes(now, 5)
        break
      case 'last15m':
        start = subMinutes(now, 15)
        break
      case 'last1h':
        start = subHours(now, 1)
        break
      case 'last6h':
        start = subHours(now, 6)
        break
      case 'last24h':
        start = subDays(now, 1)
        break
      case 'last7d':
        start = subDays(now, 7)
        break
      case 'last30d':
        start = subDays(now, 30)
        break
      default:
        return
    }
    
    onConfigChange({
      ...config,
      timeRange: {
        start,
        end: now,
        preset: preset as any
      }
    })
  }

  const handleSourceToggle = (sourceId: string) => {
    const newSources = config.sources.includes(sourceId)
      ? config.sources.filter(id => id !== sourceId)
      : [...config.sources, sourceId]
    
    onConfigChange({
      ...config,
      sources: newSources
    })
  }

  const handleCustomFilterAdd = () => {
    onConfigChange({
      ...config,
      customFilters: [
        ...config.customFilters,
        { key: '', operator: 'equals', value: '' }
      ]
    })
  }

  const handleCustomFilterUpdate = (index: number, filter: { key: string; operator: string; value: string }) => {
    const newFilters = [...config.customFilters]
    newFilters[index] = filter
    
    onConfigChange({
      ...config,
      customFilters: newFilters
    })
  }

  const handleCustomFilterRemove = (index: number) => {
    onConfigChange({
      ...config,
      customFilters: config.customFilters.filter((_, i) => i !== index)
    })
  }

  const resetFilters = () => {
    onConfigChange({
      sources: [],
      categories: [],
      types: [],
      timeRange: {
        start: subHours(new Date(), 1),
        end: new Date(),
        preset: 'last1h'
      },
      refreshInterval: 30,
      aggregation: 'avg',
      groupBy: [],
      search: '',
      showInactive: false,
      customFilters: [],
      thresholds: {
        warning: 80,
        critical: 95
      }
    })
    setSearchTerm('')
    setSelectedCategories([])
    setSelectedTypes([])
  }

  const selectedSourcesCount = config.sources.length
  const totalSourcesCount = filteredSources.length

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filtros de Métricas</span>
            </CardTitle>
            <CardDescription>
              {selectedSourcesCount} de {totalSourcesCount} fontes selecionadas
            </CardDescription>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={resetFilters}
              disabled={isLoading}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Limpar
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Configurações básicas - sempre visíveis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Período de tempo */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Período</Label>
            <Select
              value={config.timeRange.preset || 'custom'}
              onValueChange={handleTimePresetChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_PRESETS.map(preset => (
                  <SelectItem key={preset.value} value={preset.value}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Intervalo de atualização */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Atualização</Label>
            <Select
              value={config.refreshInterval.toString()}
              onValueChange={(value) => onConfigChange({
                ...config,
                refreshInterval: parseInt(value)
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REFRESH_INTERVALS.map(interval => (
                  <SelectItem key={interval.value} value={interval.value.toString()}>
                    {interval.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Agregação */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Agregação</Label>
            <Select
              value={config.aggregation}
              onValueChange={(value) => onConfigChange({
                ...config,
                aggregation: value as any
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AGGREGATION_OPTIONS.map(option => {
                  const Icon = option.icon
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4" />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Configurações avançadas - expansíveis */}
        {isExpanded && (
          <div className="space-y-6 border-t pt-6">
            {/* Busca e filtros de fonte */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Fontes de Métricas</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.showInactive}
                    onCheckedChange={(checked) => onConfigChange({
                      ...config,
                      showInactive: checked
                    })}
                  />
                  <Label className="text-sm">Mostrar inativas</Label>
                </div>
              </div>
              
              {/* Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar fontes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Filtros rápidos */}
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <Label className="text-sm">Categorias:</Label>
                  {categories.map(category => {
                    const Icon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]
                    const isSelected = selectedCategories.includes(category)
                    
                    return (
                      <Button
                        key={category}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedCategories(prev => prev.filter(c => c !== category))
                          } else {
                            setSelectedCategories(prev => [...prev, category])
                          }
                        }}
                      >
                        <Icon className="h-4 w-4 mr-1" />
                        {category}
                      </Button>
                    )
                  })}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Label className="text-sm">Tipos:</Label>
                  {types.map(type => {
                    const Icon = TYPE_ICONS[type as keyof typeof TYPE_ICONS]
                    const isSelected = selectedTypes.includes(type)
                    
                    return (
                      <Button
                        key={type}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedTypes(prev => prev.filter(t => t !== type))
                          } else {
                            setSelectedTypes(prev => [...prev, type])
                          }
                        }}
                      >
                        <Icon className="h-4 w-4 mr-1" />
                        {type}
                      </Button>
                    )
                  })}
                </div>
              </div>
            </div>
            
            {/* Lista de fontes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Fontes Disponíveis ({filteredSources.length})
                </Label>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const allIds = filteredSources.map(s => s.id)
                      onConfigChange({
                        ...config,
                        sources: allIds
                      })
                    }}
                  >
                    Selecionar Todos
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onConfigChange({
                      ...config,
                      sources: []
                    })}
                  >
                    Limpar Seleção
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {filteredSources.map(source => (
                  <SourceCard
                    key={source.id}
                    source={source}
                    isSelected={config.sources.includes(source.id)}
                    onToggle={() => handleSourceToggle(source.id)}
                  />
                ))}
              </div>
            </div>
            
            {/* Filtros customizados */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Filtros Customizados</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCustomFilterAdd}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar Filtro
                </Button>
              </div>
              
              {config.customFilters.length > 0 && (
                <div className="space-y-2">
                  {config.customFilters.map((filter, index) => (
                    <CustomFilterRow
                      key={index}
                      filter={filter}
                      onUpdate={(updatedFilter) => handleCustomFilterUpdate(index, updatedFilter)}
                      onRemove={() => handleCustomFilterRemove(index)}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {/* Thresholds */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Limites de Alerta</Label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Aviso ({config.thresholds.warning}%)</Label>
                  <Slider
                    value={[config.thresholds.warning]}
                    onValueChange={([value]) => onConfigChange({
                      ...config,
                      thresholds: {
                        ...config.thresholds,
                        warning: value
                      }
                    })}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Crítico ({config.thresholds.critical}%)</Label>
                  <Slider
                    value={[config.thresholds.critical]}
                    onValueChange={([value]) => onConfigChange({
                      ...config,
                      thresholds: {
                        ...config.thresholds,
                        critical: value
                      }
                    })}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default MetricsFilter