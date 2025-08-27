'use client'

import { useState, useMemo, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  Clock,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Database,
  Server,
  User,
  Settings,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Eye,
  EyeOff
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface LogEntry {
  id: string
  timestamp: string
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal'
  message: string
  source: string
  category: string
  userId?: string
  sessionId?: string
  requestId?: string
  metadata?: Record<string, any>
  stackTrace?: string
  tags?: string[]
  duration?: number
  statusCode?: number
  method?: string
  path?: string
  userAgent?: string
  ip?: string
}

interface LogFilter {
  level?: string[]
  source?: string[]
  category?: string[]
  dateRange?: {
    start: string
    end: string
  }
  search?: string
  userId?: string
  tags?: string[]
}

interface SystemLogsProps {
  logs: LogEntry[]
  isLoading?: boolean
  isRealTime?: boolean
  totalCount?: number
  currentPage?: number
  pageSize?: number
  filter?: LogFilter
  availableSources?: string[]
  availableCategories?: string[]
  availableTags?: string[]
  onFilterChange?: (filter: LogFilter) => void
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  onRefresh?: () => void
  onExport?: (format: 'csv' | 'json' | 'txt') => void
  onLogClick?: (log: LogEntry) => void
  className?: string
}

function LogLevelBadge({ level }: { level: LogEntry['level'] }) {
  const config = {
    debug: { color: 'bg-gray-100 text-gray-800', icon: FileText },
    info: { color: 'bg-blue-100 text-blue-800', icon: Info },
    warn: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
    error: { color: 'bg-red-100 text-red-800', icon: XCircle },
    fatal: { color: 'bg-red-200 text-red-900', icon: AlertCircle }
  }
  
  const { color, icon: Icon } = config[level]
  
  return (
    <Badge className={cn('text-xs font-medium', color)}>
      <Icon className="h-3 w-3 mr-1" />
      {level.toUpperCase()}
    </Badge>
  )
}

function LogSourceIcon({ source }: { source: string }) {
  const getIcon = () => {
    switch (source.toLowerCase()) {
      case 'database':
      case 'db':
        return Database
      case 'server':
      case 'api':
        return Server
      case 'user':
      case 'auth':
        return User
      case 'system':
      case 'config':
        return Settings
      default:
        return FileText
    }
  }
  
  const Icon = getIcon()
  return <Icon className="h-4 w-4 text-gray-500" />
}

function LogEntryRow({ 
  log, 
  isExpanded, 
  onToggleExpand, 
  onCopy, 
  onClick 
}: { 
  log: LogEntry
  isExpanded: boolean
  onToggleExpand: () => void
  onCopy: (text: string) => void
  onClick?: () => void
}) {
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <div 
        className={cn(
          'p-4 hover:bg-gray-50 cursor-pointer transition-colors',
          isExpanded && 'bg-gray-50'
        )}
        onClick={onClick || onToggleExpand}
      >
        <div className="flex items-start justify-between space-x-4">
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            <LogSourceIcon source={log.source} />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <LogLevelBadge level={log.level} />
                <span className="text-xs text-gray-500">
                  {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                </span>
                <Badge variant="outline" className="text-xs">
                  {log.source}
                </Badge>
                {log.category && (
                  <Badge variant="outline" className="text-xs">
                    {log.category}
                  </Badge>
                )}
                {log.duration && (
                  <Badge variant="outline" className="text-xs">
                    {formatDuration(log.duration)}
                  </Badge>
                )}
                {log.statusCode && (
                  <Badge 
                    variant="outline" 
                    className={cn(
                      'text-xs',
                      log.statusCode >= 400 ? 'border-red-200 text-red-700' :
                      log.statusCode >= 300 ? 'border-yellow-200 text-yellow-700' :
                      'border-green-200 text-green-700'
                    )}
                  >
                    {log.statusCode}
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-gray-900 truncate">
                {log.message}
              </p>
              
              {log.method && log.path && (
                <p className="text-xs text-gray-500 mt-1">
                  {log.method} {log.path}
                </p>
              )}
              
              {log.tags && log.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {log.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onCopy(JSON.stringify(log, null, 2))
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onToggleExpand()
              }}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="px-4 pb-4 bg-gray-50 border-t">
          <div className="space-y-3">
            {/* Metadados */}
            {log.metadata && Object.keys(log.metadata).length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Metadados</h4>
                <div className="bg-white p-3 rounded border text-xs font-mono">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            )}
            
            {/* Stack trace */}
            {log.stackTrace && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Stack Trace</h4>
                <div className="bg-white p-3 rounded border text-xs font-mono">
                  <pre className="whitespace-pre-wrap text-red-600">
                    {log.stackTrace}
                  </pre>
                </div>
              </div>
            )}
            
            {/* Informações adicionais */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              {log.userId && (
                <div>
                  <span className="font-medium text-gray-600">Usuário:</span>
                  <p className="text-gray-900">{log.userId}</p>
                </div>
              )}
              
              {log.sessionId && (
                <div>
                  <span className="font-medium text-gray-600">Sessão:</span>
                  <p className="text-gray-900 font-mono">{log.sessionId}</p>
                </div>
              )}
              
              {log.requestId && (
                <div>
                  <span className="font-medium text-gray-600">Request ID:</span>
                  <p className="text-gray-900 font-mono">{log.requestId}</p>
                </div>
              )}
              
              {log.ip && (
                <div>
                  <span className="font-medium text-gray-600">IP:</span>
                  <p className="text-gray-900">{log.ip}</p>
                </div>
              )}
              
              {log.userAgent && (
                <div className="col-span-2 md:col-span-4">
                  <span className="font-medium text-gray-600">User Agent:</span>
                  <p className="text-gray-900 break-all">{log.userAgent}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function SystemLogs({
  logs,
  isLoading = false,
  isRealTime = false,
  totalCount = 0,
  currentPage = 1,
  pageSize = 50,
  filter = {},
  availableSources = [],
  availableCategories = [],
  availableTags = [],
  onFilterChange,
  onPageChange,
  onPageSizeChange,
  onRefresh,
  onExport,
  onLogClick,
  className
}: SystemLogsProps) {
  const [searchTerm, setSearchTerm] = useState(filter.search || '')
  const [selectedLevels, setSelectedLevels] = useState<string[]>(filter.level || [])
  const [selectedSources, setSelectedSources] = useState<string[]>(filter.source || [])
  const [selectedCategories, setSelectedCategories] = useState<string[]>(filter.category || [])
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [autoScroll, setAutoScroll] = useState(true)

  const levels = ['debug', 'info', 'warn', 'error', 'fatal']

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Filtro de busca
      if (searchTerm && !log.message.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      
      // Filtro de nível
      if (selectedLevels.length > 0 && !selectedLevels.includes(log.level)) {
        return false
      }
      
      // Filtro de fonte
      if (selectedSources.length > 0 && !selectedSources.includes(log.source)) {
        return false
      }
      
      // Filtro de categoria
      if (selectedCategories.length > 0 && !selectedCategories.includes(log.category)) {
        return false
      }
      
      return true
    })
  }, [logs, searchTerm, selectedLevels, selectedSources, selectedCategories])

  const handleFilterChange = useCallback(() => {
    if (onFilterChange) {
      onFilterChange({
        ...filter,
        search: searchTerm,
        level: selectedLevels,
        source: selectedSources,
        category: selectedCategories
      })
    }
  }, [searchTerm, selectedLevels, selectedSources, selectedCategories, filter, onFilterChange])

  const toggleLogExpansion = (logId: string) => {
    setExpandedLogs(prev => {
      const newSet = new Set(prev)
      if (newSet.has(logId)) {
        newSet.delete(logId)
      } else {
        newSet.add(logId)
      }
      return newSet
    })
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // Aqui você pode adicionar uma notificação de sucesso
    } catch (err) {
      console.error('Erro ao copiar:', err)
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedLevels([])
    setSelectedSources([])
    setSelectedCategories([])
    if (onFilterChange) {
      onFilterChange({})
    }
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Logs do Sistema</span>
              {isRealTime && (
                <Badge variant="outline" className="text-green-600 border-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                  Tempo Real
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {totalCount > 0 ? (
                `${filteredLogs.length} de ${totalCount} logs`
              ) : (
                'Nenhum log encontrado'
              )}
            </CardDescription>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Controles de auto-scroll */}
            {isRealTime && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-scroll"
                  checked={autoScroll}
                  onCheckedChange={setAutoScroll}
                />
                <Label htmlFor="auto-scroll" className="text-sm">Auto-scroll</Label>
              </div>
            )}
            
            {/* Botão de filtros */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-1" />
              Filtros
            </Button>
            
            {/* Botão de export */}
            {onExport && (
              <Select onValueChange={(format) => onExport(format as 'csv' | 'json' | 'txt')}>
                <SelectTrigger className="w-32">
                  <Download className="h-4 w-4 mr-1" />
                  <SelectValue placeholder="Exportar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="txt">TXT</SelectItem>
                </SelectContent>
              </Select>
            )}
            
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
          </div>
        </div>
        
        {/* Barra de busca */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleFilterChange}
          >
            Aplicar
          </Button>
          
          {(selectedLevels.length > 0 || selectedSources.length > 0 || selectedCategories.length > 0 || searchTerm) && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
            >
              Limpar
            </Button>
          )}
        </div>
        
        {/* Painel de filtros */}
        {showFilters && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Filtro de nível */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Nível</Label>
                <div className="space-y-2">
                  {levels.map(level => (
                    <div key={level} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`level-${level}`}
                        checked={selectedLevels.includes(level)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLevels(prev => [...prev, level])
                          } else {
                            setSelectedLevels(prev => prev.filter(l => l !== level))
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={`level-${level}`} className="text-sm">
                        <LogLevelBadge level={level as LogEntry['level']} />
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Filtro de fonte */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Fonte</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {availableSources.map(source => (
                    <div key={source} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`source-${source}`}
                        checked={selectedSources.includes(source)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSources(prev => [...prev, source])
                          } else {
                            setSelectedSources(prev => prev.filter(s => s !== source))
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={`source-${source}`} className="text-sm flex items-center space-x-1">
                        <LogSourceIcon source={source} />
                        <span>{source}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Filtro de categoria */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Categoria</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {availableCategories.map(category => (
                    <div key={category} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`category-${category}`}
                        checked={selectedCategories.includes(category)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCategories(prev => [...prev, category])
                          } else {
                            setSelectedCategories(prev => prev.filter(c => c !== category))
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={`category-${category}`} className="text-sm">
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Lista de logs */}
        <div className="divide-y divide-gray-200">
          {isLoading ? (
            <div className="p-8 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Carregando logs...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-8 w-8 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Nenhum log encontrado</p>
            </div>
          ) : (
            filteredLogs.map(log => (
              <LogEntryRow
                key={log.id}
                log={log}
                isExpanded={expandedLogs.has(log.id)}
                onToggleExpand={() => toggleLogExpansion(log.id)}
                onCopy={copyToClipboard}
                onClick={onLogClick ? () => onLogClick(log) : undefined}
              />
            ))
          )}
        </div>
        
        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Itens por página:</span>
              <Select 
                value={pageSize.toString()} 
                onValueChange={(value) => onPageSizeChange?.(parseInt(value))}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="200">200</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                Anterior
              </Button>
              
              <span className="text-sm text-gray-600">
                Página {currentPage} de {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default SystemLogs