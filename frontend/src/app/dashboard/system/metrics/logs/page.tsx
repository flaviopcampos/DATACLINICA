'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Download,
  Eye,
  EyeOff,
  Filter,
  Info,
  RefreshCw,
  Search,
  Server,
  Settings,
  Trash2,
  User,
  Zap,
  ChevronDown,
  ChevronRight,
  Calendar,
  FileText,
  Globe,
  Shield,
  Activity,
  Bug,
  AlertOctagon,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Componentes
import { SystemLogs } from '@/components/SystemLogs'

// Hooks
import { useSystemLogs } from '@/hooks/useSystemLogs'

interface LogEntry {
  id: string
  timestamp: string
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal'
  source: string
  category: string
  message: string
  metadata?: Record<string, any>
  stackTrace?: string
  userId?: string
  sessionId?: string
  requestId?: string
  ip?: string
  userAgent?: string
}

interface LogStats {
  total: number
  byLevel: Record<string, number>
  bySource: Record<string, number>
  byCategory: Record<string, number>
  recentErrors: number
  avgLogsPerMinute: number
}

interface LogFilter {
  level?: string
  source?: string
  category?: string
  dateFrom?: string
  dateTo?: string
  search?: string
  userId?: string
  sessionId?: string
  requestId?: string
}

function LogStatsCard({ stats }: { stats: LogStats }) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'fatal': return 'bg-red-600 text-white'
      case 'error': return 'bg-red-100 text-red-800'
      case 'warn': return 'bg-yellow-100 text-yellow-800'
      case 'info': return 'bg-blue-100 text-blue-800'
      case 'debug': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'fatal': return AlertOctagon
      case 'error': return AlertCircle
      case 'warn': return AlertTriangle
      case 'info': return Info
      case 'debug': return Bug
      default: return Activity
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center space-x-2">
          <Database className="h-5 w-5" />
          <span>Estatísticas de Logs</span>
        </CardTitle>
        <CardDescription>
          Resumo dos logs nas últimas 24 horas
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{stats.total.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total de Logs</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{stats.recentErrors}</div>
            <div className="text-sm text-gray-600">Erros Recentes</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.avgLogsPerMinute.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Logs/min</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{Object.keys(stats.bySource).length}</div>
            <div className="text-sm text-gray-600">Fontes Ativas</div>
          </div>
        </div>
        
        {/* Distribuição por nível */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-gray-700">Distribuição por Nível</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {Object.entries(stats.byLevel).map(([level, count]) => {
              const LevelIcon = getLevelIcon(level)
              
              return (
                <div key={level} className={cn('p-2 rounded-lg text-center', getLevelColor(level))}>
                  <LevelIcon className="h-4 w-4 mx-auto mb-1" />
                  <div className="text-sm font-medium">{count}</div>
                  <div className="text-xs opacity-75">{level.toUpperCase()}</div>
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Top fontes */}
        <div className="mt-6 space-y-3">
          <h4 className="font-medium text-sm text-gray-700">Top Fontes</h4>
          <div className="space-y-2">
            {Object.entries(stats.bySource)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([source, count]) => (
                <div key={source} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">{source}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))
            }
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function LogFiltersCard({ 
  filters, 
  onFiltersChange, 
  sources, 
  categories 
}: { 
  filters: LogFilter
  onFiltersChange: (filters: LogFilter) => void
  sources: string[]
  categories: string[]
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleFilterChange = (key: keyof LogFilter, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined
    })
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  const activeFiltersCount = Object.values(filters).filter(Boolean).length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount}</Badge>
            )}
          </CardTitle>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Busca */}
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Buscar nos logs..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Nível */}
            <div className="space-y-2">
              <Label htmlFor="level">Nível</Label>
              <Select value={filters.level || ''} onValueChange={(value) => handleFilterChange('level', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os níveis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os níveis</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warn">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="fatal">Fatal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Fonte */}
            <div className="space-y-2">
              <Label htmlFor="source">Fonte</Label>
              <Select value={filters.source || ''} onValueChange={(value) => handleFilterChange('source', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as fontes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as fontes</SelectItem>
                  {sources.map((source) => (
                    <SelectItem key={source} value={source}>{source}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Categoria */}
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={filters.category || ''} onValueChange={(value) => handleFilterChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Data de início */}
            <div className="space-y-2">
              <Label htmlFor="dateFrom">Data de Início</Label>
              <Input
                id="dateFrom"
                type="datetime-local"
                value={filters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>
            
            {/* Data de fim */}
            <div className="space-y-2">
              <Label htmlFor="dateTo">Data de Fim</Label>
              <Input
                id="dateTo"
                type="datetime-local"
                value={filters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>
            
            {/* User ID */}
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                placeholder="ID do usuário"
                value={filters.userId || ''}
                onChange={(e) => handleFilterChange('userId', e.target.value)}
              />
            </div>
            
            {/* Session ID */}
            <div className="space-y-2">
              <Label htmlFor="sessionId">Session ID</Label>
              <Input
                id="sessionId"
                placeholder="ID da sessão"
                value={filters.sessionId || ''}
                onChange={(e) => handleFilterChange('sessionId', e.target.value)}
              />
            </div>
            
            {/* Request ID */}
            <div className="space-y-2">
              <Label htmlFor="requestId">Request ID</Label>
              <Input
                id="requestId"
                placeholder="ID da requisição"
                value={filters.requestId || ''}
                onChange={(e) => handleFilterChange('requestId', e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button onClick={clearFilters} variant="outline">
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

function LogEntryCard({ log, onToggleDetails }: { log: LogEntry, onToggleDetails: (id: string) => void }) {
  const [showDetails, setShowDetails] = useState(false)

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'fatal': return 'bg-red-600 text-white'
      case 'error': return 'bg-red-100 text-red-800 border-red-200'
      case 'warn': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'debug': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'fatal': return AlertOctagon
      case 'error': return AlertCircle
      case 'warn': return AlertTriangle
      case 'info': return Info
      case 'debug': return Bug
      default: return Activity
    }
  }

  const LevelIcon = getLevelIcon(log.level)

  const handleToggleDetails = () => {
    setShowDetails(!showDetails)
    onToggleDetails(log.id)
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR')
  }

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <LevelIcon className="h-5 w-5 mt-0.5 text-gray-600" />
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Badge className={cn('text-xs', getLevelColor(log.level))}>
                  {log.level.toUpperCase()}
                </Badge>
                
                <Badge variant="outline" className="text-xs">
                  {log.source}
                </Badge>
                
                <Badge variant="outline" className="text-xs">
                  {log.category}
                </Badge>
                
                <span className="text-xs text-gray-500">
                  {formatTimestamp(log.timestamp)}
                </span>
              </div>
              
              <div className="text-sm font-medium mb-1">
                {log.message}
              </div>
              
              {(log.userId || log.sessionId || log.requestId) && (
                <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                  {log.userId && (
                    <span className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>User: {log.userId}</span>
                    </span>
                  )}
                  
                  {log.sessionId && (
                    <span className="flex items-center space-x-1">
                      <Globe className="h-3 w-3" />
                      <span>Session: {log.sessionId.substring(0, 8)}...</span>
                    </span>
                  )}
                  
                  {log.requestId && (
                    <span className="flex items-center space-x-1">
                      <Server className="h-3 w-3" />
                      <span>Request: {log.requestId.substring(0, 8)}...</span>
                    </span>
                  )}
                </div>
              )}
              
              {showDetails && (
                <div className="mt-4 space-y-4">
                  {/* Metadados */}
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium mb-2">Metadados:</h5>
                      <div className="bg-gray-50 p-3 rounded text-xs">
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                  
                  {/* Stack trace */}
                  {log.stackTrace && (
                    <div>
                      <h5 className="text-sm font-medium mb-2">Stack Trace:</h5>
                      <div className="bg-red-50 p-3 rounded text-xs font-mono">
                        <pre className="whitespace-pre-wrap text-red-800">
                          {log.stackTrace}
                        </pre>
                      </div>
                    </div>
                  )}
                  
                  {/* Informações adicionais */}
                  {(log.ip || log.userAgent) && (
                    <div>
                      <h5 className="text-sm font-medium mb-2">Informações da Requisição:</h5>
                      <div className="bg-gray-50 p-3 rounded text-xs space-y-1">
                        {log.ip && (
                          <div><strong>IP:</strong> {log.ip}</div>
                        )}
                        {log.userAgent && (
                          <div><strong>User Agent:</strong> {log.userAgent}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleDetails}
          >
            {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function LogsPage() {
  const [filters, setFilters] = useState<LogFilter>({})
  const [isRealTime, setIsRealTime] = useState(false)
  const [autoScroll, setAutoScroll] = useState(true)
  const [pageSize, setPageSize] = useState(50)
  
  // Hook de logs
  const {
    logs,
    stats,
    sources,
    categories,
    isLoading,
    error,
    hasMore,
    refreshLogs,
    loadMore,
    exportLogs,
    clearLogs
  } = useSystemLogs({
    filters,
    autoRefresh: isRealTime,
    refreshInterval: 5000,
    pageSize,
    autoScroll
  })

  // Mock data - em produção, viria do hook
  const mockStats: LogStats = {
    total: 15420,
    byLevel: {
      debug: 8500,
      info: 4200,
      warn: 1800,
      error: 850,
      fatal: 70
    },
    bySource: {
      'api-server': 6500,
      'web-server': 4200,
      'database': 2100,
      'auth-service': 1800,
      'notification-service': 820
    },
    byCategory: {
      'http': 5500,
      'database': 3200,
      'auth': 2800,
      'system': 2100,
      'security': 1820
    },
    recentErrors: 23,
    avgLogsPerMinute: 42.5
  }

  const mockSources = ['api-server', 'web-server', 'database', 'auth-service', 'notification-service']
  const mockCategories = ['http', 'database', 'auth', 'system', 'security']

  const mockLogs: LogEntry[] = [
    {
      id: '1',
      timestamp: new Date().toISOString(),
      level: 'error',
      source: 'api-server',
      category: 'http',
      message: 'Failed to connect to database',
      metadata: {
        endpoint: '/api/users',
        method: 'GET',
        statusCode: 500,
        duration: 5000
      },
      stackTrace: 'Error: Connection timeout\n    at Database.connect (/app/db.js:45:12)\n    at UserController.getUsers (/app/controllers/user.js:23:8)',
      userId: 'user_123',
      sessionId: 'sess_abc123def456',
      requestId: 'req_789xyz',
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 60000).toISOString(),
      level: 'warn',
      source: 'auth-service',
      category: 'auth',
      message: 'Multiple failed login attempts detected',
      metadata: {
        attempts: 5,
        timeWindow: '5m',
        blocked: true
      },
      userId: 'user_456',
      ip: '192.168.1.200'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 120000).toISOString(),
      level: 'info',
      source: 'web-server',
      category: 'http',
      message: 'User successfully logged in',
      metadata: {
        endpoint: '/auth/login',
        method: 'POST',
        statusCode: 200,
        duration: 150
      },
      userId: 'user_789',
      sessionId: 'sess_def456ghi789'
    }
  ]

  const handleToggleDetails = (logId: string) => {
    // Implementar lógica para expandir/contrair detalhes
    console.log('Toggle details for log:', logId)
  }

  const handleExportLogs = () => {
    exportLogs('csv', filters)
  }

  const handleClearLogs = () => {
    if (confirm('Tem certeza que deseja limpar todos os logs? Esta ação não pode ser desfeita.')) {
      clearLogs()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Logs do Sistema</h1>
          <p className="text-muted-foreground">
            Visualização e análise de logs em tempo real
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Controles */}
          <div className="flex items-center space-x-2">
            <Switch
              checked={isRealTime}
              onCheckedChange={setIsRealTime}
            />
            <Label className="text-sm">Tempo Real</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              checked={autoScroll}
              onCheckedChange={setAutoScroll}
            />
            <Label className="text-sm">Auto Scroll</Label>
          </div>
          
          <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(parseInt(value))}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="200">200</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={handleExportLogs} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          
          <Button onClick={refreshLogs} disabled={isLoading}>
            <RefreshCw className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <LogStatsCard stats={mockStats} />

      {/* Filtros */}
      <LogFiltersCard
        filters={filters}
        onFiltersChange={setFilters}
        sources={mockSources}
        categories={mockCategories}
      />

      {/* Lista de logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Logs Recentes</span>
              {isRealTime && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-green-600">Ao Vivo</span>
                </div>
              )}
            </CardTitle>
            
            <div className="flex items-center space-x-2">
              <Button onClick={handleClearLogs} variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Logs
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading && mockLogs.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Carregando logs...</span>
            </div>
          ) : mockLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4" />
              <p>Nenhum log encontrado</p>
              <p className="text-sm">Ajuste os filtros ou aguarde novos logs</p>
            </div>
          ) : (
            <div className="space-y-4">
              {mockLogs.map((log) => (
                <LogEntryCard
                  key={log.id}
                  log={log}
                  onToggleDetails={handleToggleDetails}
                />
              ))}
              
              {hasMore && (
                <div className="text-center pt-4">
                  <Button onClick={loadMore} variant="outline">
                    Carregar Mais
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}