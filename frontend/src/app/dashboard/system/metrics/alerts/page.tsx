'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  BellOff,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  Filter,
  Info,
  Mail,
  MessageSquare,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Trash2,
  User,
  Zap,
  ChevronDown,
  ChevronRight,
  Calendar,
  Shield,
  Activity,
  Server,
  Database,
  Globe,
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  Users,
  TrendingUp,
  AlertOctagon,
  Loader2,
  Edit,
  Copy,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Componentes
import { AlertsPanel } from '@/components/AlertsPanel'

// Hooks
import { useSystemAlerts } from '@/hooks/useSystemAlerts'

interface SystemAlert {
  id: string
  title: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'active' | 'acknowledged' | 'resolved' | 'suppressed'
  category: string
  source: string
  condition: string
  currentValue: number
  threshold: number
  unit: string
  createdAt: string
  updatedAt: string
  acknowledgedBy?: string
  acknowledgedAt?: string
  resolvedBy?: string
  resolvedAt?: string
  suppressedUntil?: string
  metadata?: Record<string, any>
  actions?: Array<{
    id: string
    name: string
    type: 'webhook' | 'email' | 'sms' | 'slack'
    config: Record<string, any>
  }>
}

interface AlertRule {
  id: string
  name: string
  description: string
  enabled: boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: string
  source: string
  metric: string
  condition: 'gt' | 'lt' | 'eq' | 'ne' | 'gte' | 'lte'
  threshold: number
  unit: string
  duration: number // em segundos
  cooldown: number // em segundos
  actions: string[]
  createdAt: string
  updatedAt: string
  lastTriggered?: string
  triggerCount: number
}

interface AlertStats {
  total: number
  active: number
  acknowledged: number
  resolved: number
  suppressed: number
  bySeverity: Record<string, number>
  byCategory: Record<string, number>
  bySource: Record<string, number>
  recentTrends: {
    last24h: number
    last7d: number
    last30d: number
  }
}

function AlertStatsCard({ stats }: { stats: AlertStats }) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white'
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return AlertOctagon
      case 'high': return AlertCircle
      case 'medium': return AlertTriangle
      case 'low': return Info
      default: return Activity
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <span>Estatísticas de Alertas</span>
        </CardTitle>
        <CardDescription>
          Resumo dos alertas nas últimas 24 horas
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{stats.active}</div>
            <div className="text-sm text-gray-600">Ativos</div>
          </div>
          
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{stats.acknowledged}</div>
            <div className="text-sm text-gray-600">Reconhecidos</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
            <div className="text-sm text-gray-600">Resolvidos</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">{stats.suppressed}</div>
            <div className="text-sm text-gray-600">Suprimidos</div>
          </div>
        </div>
        
        {/* Distribuição por severidade */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-gray-700">Distribuição por Severidade</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(stats.bySeverity).map(([severity, count]) => {
              const SeverityIcon = getSeverityIcon(severity)
              
              return (
                <div key={severity} className={cn('p-2 rounded-lg text-center', getSeverityColor(severity))}>
                  <SeverityIcon className="h-4 w-4 mx-auto mb-1" />
                  <div className="text-sm font-medium">{count}</div>
                  <div className="text-xs opacity-75">{severity.toUpperCase()}</div>
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Tendências */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">{stats.recentTrends.last24h}</div>
            <div className="text-xs text-gray-600">Últimas 24h</div>
          </div>
          
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">{stats.recentTrends.last7d}</div>
            <div className="text-xs text-gray-600">Últimos 7 dias</div>
          </div>
          
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">{stats.recentTrends.last30d}</div>
            <div className="text-xs text-gray-600">Últimos 30 dias</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function AlertCard({ alert, onAcknowledge, onResolve, onSuppress, onEdit }: {
  alert: SystemAlert
  onAcknowledge: (id: string) => void
  onResolve: (id: string) => void
  onSuppress: (id: string, duration: number) => void
  onEdit: (id: string) => void
}) {
  const [showDetails, setShowDetails] = useState(false)
  const [suppressDuration, setSuppressDuration] = useState(60)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50'
      case 'high': return 'border-red-300 bg-red-50'
      case 'medium': return 'border-yellow-300 bg-yellow-50'
      case 'low': return 'border-blue-300 bg-blue-50'
      default: return 'border-gray-300 bg-gray-50'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800'
      case 'acknowledged': return 'bg-yellow-100 text-yellow-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'suppressed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return AlertOctagon
      case 'high': return AlertCircle
      case 'medium': return AlertTriangle
      case 'low': return Info
      default: return Activity
    }
  }

  const SeverityIcon = getSeverityIcon(alert.severity)

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR')
  }

  const getConditionText = (condition: string) => {
    switch (condition) {
      case 'gt': return '>'
      case 'lt': return '<'
      case 'gte': return '≥'
      case 'lte': return '≤'
      case 'eq': return '='
      case 'ne': return '≠'
      default: return condition
    }
  }

  return (
    <Card className={cn('border-2', getSeverityColor(alert.severity))}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <SeverityIcon className="h-5 w-5 mt-0.5 text-gray-600" />
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Badge className={cn('text-xs', getSeverityColor(alert.severity).replace('border-', 'bg-').replace('bg-', 'bg-').replace('-50', '-100').replace('-300', '-200'))}>
                  {alert.severity.toUpperCase()}
                </Badge>
                
                <Badge className={cn('text-xs', getStatusColor(alert.status))}>
                  {alert.status.toUpperCase()}
                </Badge>
                
                <Badge variant="outline" className="text-xs">
                  {alert.category}
                </Badge>
                
                <Badge variant="outline" className="text-xs">
                  {alert.source}
                </Badge>
              </div>
              
              <div className="text-lg font-semibold mb-2">
                {alert.title}
              </div>
              
              <div className="text-sm text-gray-700 mb-3">
                {alert.message}
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                <span>
                  <strong>Condição:</strong> {alert.condition} {getConditionText(alert.condition)} {alert.threshold}{alert.unit}
                </span>
                
                <span>
                  <strong>Valor Atual:</strong> {alert.currentValue}{alert.unit}
                </span>
                
                <span>
                  <strong>Criado:</strong> {formatTimestamp(alert.createdAt)}
                </span>
              </div>
              
              {showDetails && (
                <div className="mt-4 space-y-4">
                  {/* Informações de reconhecimento */}
                  {alert.acknowledgedBy && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <div className="text-sm">
                        <strong>Reconhecido por:</strong> {alert.acknowledgedBy}
                      </div>
                      <div className="text-xs text-gray-600">
                        {formatTimestamp(alert.acknowledgedAt!)}
                      </div>
                    </div>
                  )}
                  
                  {/* Informações de resolução */}
                  {alert.resolvedBy && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded">
                      <div className="text-sm">
                        <strong>Resolvido por:</strong> {alert.resolvedBy}
                      </div>
                      <div className="text-xs text-gray-600">
                        {formatTimestamp(alert.resolvedAt!)}
                      </div>
                    </div>
                  )}
                  
                  {/* Informações de supressão */}
                  {alert.suppressedUntil && (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                      <div className="text-sm">
                        <strong>Suprimido até:</strong> {formatTimestamp(alert.suppressedUntil)}
                      </div>
                    </div>
                  )}
                  
                  {/* Metadados */}
                  {alert.metadata && Object.keys(alert.metadata).length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium mb-2">Metadados:</h5>
                      <div className="bg-gray-50 p-3 rounded text-xs">
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(alert.metadata, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                  
                  {/* Ações configuradas */}
                  {alert.actions && alert.actions.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium mb-2">Ações Configuradas:</h5>
                      <div className="space-y-2">
                        {alert.actions.map((action) => (
                          <div key={action.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                            <Badge variant="outline" className="text-xs">
                              {action.type}
                            </Badge>
                            <span className="text-sm">{action.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(alert.id)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Ações */}
        {alert.status === 'active' && (
          <div className="flex items-center space-x-2 mt-4 pt-4 border-t">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAcknowledge(alert.id)}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Reconhecer
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => onResolve(alert.id)}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Resolver
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Pause className="h-4 w-4 mr-2" />
                  Suprimir
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Suprimir Alerta</DialogTitle>
                  <DialogDescription>
                    Por quanto tempo deseja suprimir este alerta?
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="duration">Duração (minutos)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={suppressDuration}
                      onChange={(e) => setSuppressDuration(parseInt(e.target.value))}
                      min={1}
                      max={1440}
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button
                      onClick={() => onSuppress(alert.id, suppressDuration)}
                    >
                      Suprimir
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function AlertRulesCard({ rules, onCreateRule, onEditRule, onToggleRule, onDeleteRule }: {
  rules: AlertRule[]
  onCreateRule: () => void
  onEditRule: (id: string) => void
  onToggleRule: (id: string) => void
  onDeleteRule: (id: string) => void
}) {
  const [filter, setFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const filteredRules = rules.filter(rule => {
    const matchesName = rule.name.toLowerCase().includes(filter.toLowerCase())
    const matchesCategory = !categoryFilter || rule.category === categoryFilter
    return matchesName && matchesCategory
  })

  const categories = Array.from(new Set(rules.map(r => r.category)))

  const getConditionText = (condition: string) => {
    switch (condition) {
      case 'gt': return '>'
      case 'lt': return '<'
      case 'gte': return '≥'
      case 'lte': return '≤'
      case 'eq': return '='
      case 'ne': return '≠'
      default: return condition
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Regras de Alerta</span>
            <Badge variant="secondary">{rules.length}</Badge>
          </CardTitle>
          
          <Button onClick={onCreateRule}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Regra
          </Button>
        </div>
        
        <div className="flex items-center space-x-4 mt-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar regras..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
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
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {filteredRules.map((rule) => (
            <div key={rule.id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={() => onToggleRule(rule.id)}
                  />
                  
                  <div>
                    <div className="font-medium">{rule.name}</div>
                    <div className="text-sm text-gray-600">{rule.description}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge className={cn('text-xs', getSeverityColor(rule.severity))}>
                    {rule.severity.toUpperCase()}
                  </Badge>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditRule(rule.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteRule(rule.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Métrica</div>
                  <div className="font-medium">{rule.metric}</div>
                </div>
                
                <div>
                  <div className="text-gray-600">Condição</div>
                  <div className="font-medium">
                    {getConditionText(rule.condition)} {rule.threshold}{rule.unit}
                  </div>
                </div>
                
                <div>
                  <div className="text-gray-600">Duração</div>
                  <div className="font-medium">{rule.duration}s</div>
                </div>
                
                <div>
                  <div className="text-gray-600">Disparos</div>
                  <div className="font-medium">{rule.triggerCount}</div>
                </div>
              </div>
              
              {rule.lastTriggered && (
                <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                  Último disparo: {new Date(rule.lastTriggered).toLocaleString('pt-BR')}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function AlertsPage() {
  const [activeTab, setActiveTab] = useState('alerts')
  const [isRealTime, setIsRealTime] = useState(true)
  const [filters, setFilters] = useState({
    severity: '',
    status: '',
    category: '',
    source: '',
    search: ''
  })
  
  // Hook de alertas
  const {
    alerts,
    rules,
    stats,
    isLoading,
    error,
    refreshAlerts,
    acknowledgeAlert,
    resolveAlert,
    suppressAlert,
    createRule,
    updateRule,
    deleteRule,
    toggleRule
  } = useSystemAlerts({
    filters,
    autoRefresh: isRealTime,
    refreshInterval: 5000
  })

  // Mock data - em produção, viria do hook
  const mockStats: AlertStats = {
    total: 156,
    active: 23,
    acknowledged: 8,
    resolved: 120,
    suppressed: 5,
    bySeverity: {
      critical: 3,
      high: 8,
      medium: 15,
      low: 130
    },
    byCategory: {
      performance: 45,
      security: 32,
      system: 28,
      network: 25,
      database: 26
    },
    bySource: {
      'system-monitor': 65,
      'security-scanner': 32,
      'performance-monitor': 28,
      'network-monitor': 31
    },
    recentTrends: {
      last24h: 23,
      last7d: 89,
      last30d: 156
    }
  }

  const mockAlerts: SystemAlert[] = [
    {
      id: '1',
      title: 'High CPU Usage',
      message: 'CPU usage has exceeded 85% for more than 5 minutes',
      severity: 'high',
      status: 'active',
      category: 'performance',
      source: 'system-monitor',
      condition: 'cpu_usage',
      currentValue: 87.5,
      threshold: 85,
      unit: '%',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        hostname: 'web-server-01',
        process: 'node',
        pid: 1234
      }
    },
    {
      id: '2',
      title: 'Database Connection Failed',
      message: 'Unable to connect to primary database',
      severity: 'critical',
      status: 'acknowledged',
      category: 'database',
      source: 'database-monitor',
      condition: 'connection_status',
      currentValue: 0,
      threshold: 1,
      unit: '',
      createdAt: new Date(Date.now() - 300000).toISOString(),
      updatedAt: new Date(Date.now() - 60000).toISOString(),
      acknowledgedBy: 'admin@dataclinica.com',
      acknowledgedAt: new Date(Date.now() - 60000).toISOString()
    },
    {
      id: '3',
      title: 'Memory Usage Warning',
      message: 'Memory usage is approaching critical levels',
      severity: 'medium',
      status: 'active',
      category: 'performance',
      source: 'system-monitor',
      condition: 'memory_usage',
      currentValue: 78,
      threshold: 80,
      unit: '%',
      createdAt: new Date(Date.now() - 600000).toISOString(),
      updatedAt: new Date(Date.now() - 600000).toISOString()
    }
  ]

  const mockRules: AlertRule[] = [
    {
      id: '1',
      name: 'High CPU Usage',
      description: 'Alert when CPU usage exceeds 85%',
      enabled: true,
      severity: 'high',
      category: 'performance',
      source: 'system-monitor',
      metric: 'cpu_usage',
      condition: 'gt',
      threshold: 85,
      unit: '%',
      duration: 300,
      cooldown: 600,
      actions: ['email', 'slack'],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      lastTriggered: new Date().toISOString(),
      triggerCount: 15
    },
    {
      id: '2',
      name: 'Database Connection',
      description: 'Alert when database connection fails',
      enabled: true,
      severity: 'critical',
      category: 'database',
      source: 'database-monitor',
      metric: 'connection_status',
      condition: 'eq',
      threshold: 0,
      unit: '',
      duration: 60,
      cooldown: 300,
      actions: ['email', 'sms', 'slack'],
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date(Date.now() - 172800000).toISOString(),
      lastTriggered: new Date(Date.now() - 300000).toISOString(),
      triggerCount: 3
    }
  ]

  const handleAcknowledgeAlert = (alertId: string) => {
    acknowledgeAlert(alertId)
  }

  const handleResolveAlert = (alertId: string) => {
    resolveAlert(alertId)
  }

  const handleSuppressAlert = (alertId: string, duration: number) => {
    suppressAlert(alertId, duration)
  }

  const handleEditAlert = (alertId: string) => {
    // Implementar edição de alerta
    console.log('Edit alert:', alertId)
  }

  const handleCreateRule = () => {
    // Implementar criação de regra
    console.log('Create rule')
  }

  const handleEditRule = (ruleId: string) => {
    // Implementar edição de regra
    console.log('Edit rule:', ruleId)
  }

  const handleToggleRule = (ruleId: string) => {
    toggleRule(ruleId)
  }

  const handleDeleteRule = (ruleId: string) => {
    if (confirm('Tem certeza que deseja deletar esta regra?')) {
      deleteRule(ruleId)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alertas do Sistema</h1>
          <p className="text-muted-foreground">
            Gerenciamento e configuração de alertas em tempo real
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
          
          <Button onClick={refreshAlerts} disabled={isLoading}>
            <RefreshCw className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <AlertStatsCard stats={mockStats} />

      {/* Abas */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="alerts">Alertas Ativos</TabsTrigger>
          <TabsTrigger value="rules">Regras de Alerta</TabsTrigger>
        </TabsList>
        
        <TabsContent value="alerts" className="space-y-6">
          <AlertsPanel />
          
          {/* Lista de alertas customizada */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Alertas Detalhados</span>
                {isRealTime && (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm text-green-600">Ao Vivo</span>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              {isLoading && mockAlerts.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Carregando alertas...</span>
                </div>
              ) : mockAlerts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-4" />
                  <p>Nenhum alerta encontrado</p>
                  <p className="text-sm">O sistema está funcionando normalmente</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {mockAlerts.map((alert) => (
                    <AlertCard
                      key={alert.id}
                      alert={alert}
                      onAcknowledge={handleAcknowledgeAlert}
                      onResolve={handleResolveAlert}
                      onSuppress={handleSuppressAlert}
                      onEdit={handleEditAlert}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="rules" className="space-y-6">
          <AlertRulesCard
            rules={mockRules}
            onCreateRule={handleCreateRule}
            onEditRule={handleEditRule}
            onToggleRule={handleToggleRule}
            onDeleteRule={handleDeleteRule}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}