import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

// Types
export interface InventoryAlert {
  id: string
  type: 'low_stock' | 'high_stock' | 'expiring' | 'expired' | 'out_of_stock' | 'reorder_point' | 'quality_issue' | 'location_mismatch' | 'price_change' | 'supplier_issue'
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed' | 'snoozed'
  
  // Item information
  itemId: string
  itemCode: string
  itemName: string
  itemType: 'medication' | 'equipment' | 'supply'
  category: string
  
  // Alert details
  title: string
  message: string
  description?: string
  
  // Thresholds and values
  currentValue?: number
  thresholdValue?: number
  recommendedAction?: string
  
  // Location and department
  location: string
  department: string
  
  // Dates
  createdAt: Date
  triggeredAt: Date
  acknowledgedAt?: Date
  resolvedAt?: Date
  dismissedAt?: Date
  snoozedUntil?: Date
  expiresAt?: Date
  
  // Responsible users
  assignedTo?: string
  assignedToName?: string
  acknowledgedBy?: string
  acknowledgedByName?: string
  resolvedBy?: string
  resolvedByName?: string
  
  // Additional data
  metadata?: {
    batchNumber?: string
    lotNumber?: string
    expirationDate?: Date
    supplierName?: string
    lastOrderDate?: Date
    averageConsumption?: number
    daysUntilStockout?: number
    costImpact?: number
    affectedPatients?: number
    alternativeItems?: string[]
  }
  
  // Actions taken
  actions?: {
    id: string
    type: 'order_placed' | 'stock_adjusted' | 'item_moved' | 'supplier_contacted' | 'manual_check' | 'other'
    description: string
    performedBy: string
    performedByName: string
    performedAt: Date
    result?: string
  }[]
  
  // Notifications
  notificationsSent?: {
    type: 'email' | 'sms' | 'push' | 'system'
    recipient: string
    sentAt: Date
    delivered: boolean
  }[]
  
  // Recurrence
  isRecurring?: boolean
  recurringPattern?: 'daily' | 'weekly' | 'monthly'
  lastOccurrence?: Date
  nextOccurrence?: Date
  
  // Priority and urgency
  priority: number // 1-10 scale
  urgency: 'immediate' | 'within_hour' | 'within_day' | 'within_week' | 'when_possible'
  
  // Tags and categories
  tags?: string[]
  customFields?: Record<string, any>
}

export interface AlertFilters {
  search?: string
  type?: 'all' | InventoryAlert['type']
  severity?: 'all' | InventoryAlert['severity']
  status?: 'all' | InventoryAlert['status']
  itemType?: 'all' | InventoryAlert['itemType']
  department?: string
  location?: string
  assignedTo?: string
  category?: string
  
  // Date filters
  createdFrom?: Date
  createdTo?: Date
  triggeredFrom?: Date
  triggeredTo?: Date
  
  // Value filters
  priorityMin?: number
  priorityMax?: number
  
  // Status filters
  activeOnly?: boolean
  unacknowledged?: boolean
  unresolved?: boolean
  expiringSoon?: boolean
  highPriority?: boolean
  criticalOnly?: boolean
  
  // Time-based filters
  today?: boolean
  thisWeek?: boolean
  thisMonth?: boolean
  overdue?: boolean
  
  // Tags
  tags?: string[]
  excludeTags?: string[]
}

export interface AlertStats {
  totalAlerts: number
  activeAlerts: number
  acknowledgedAlerts: number
  resolvedAlerts: number
  dismissedAlerts: number
  snoozedAlerts: number
  
  // By severity
  lowSeverity: number
  mediumSeverity: number
  highSeverity: number
  criticalSeverity: number
  
  // By type
  lowStockAlerts: number
  highStockAlerts: number
  expiringAlerts: number
  expiredAlerts: number
  outOfStockAlerts: number
  reorderPointAlerts: number
  qualityIssueAlerts: number
  locationMismatchAlerts: number
  priceChangeAlerts: number
  supplierIssueAlerts: number
  
  // By item type
  medicationAlerts: number
  equipmentAlerts: number
  supplyAlerts: number
  
  // Time-based
  todayAlerts: number
  weekAlerts: number
  monthAlerts: number
  overdueAlerts: number
  
  // Performance metrics
  averageResolutionTime: number // hours
  averageAcknowledgmentTime: number // minutes
  alertTrends: {
    period: string
    count: number
    resolved: number
  }[]
  
  // Financial impact
  totalCostImpact: number
  averageCostPerAlert: number
  
  // Response metrics
  responseRate: number // percentage
  resolutionRate: number // percentage
}

export interface AlertRule {
  id: string
  name: string
  description: string
  enabled: boolean
  
  // Conditions
  itemType?: InventoryAlert['itemType']
  category?: string
  department?: string
  location?: string
  
  // Thresholds
  lowStockThreshold?: number
  highStockThreshold?: number
  expirationDays?: number
  reorderPoint?: number
  
  // Alert configuration
  alertType: InventoryAlert['type']
  severity: InventoryAlert['severity']
  priority: number
  urgency: InventoryAlert['urgency']
  
  // Notifications
  notifyUsers?: string[]
  notificationMethods?: ('email' | 'sms' | 'push' | 'system')[]
  
  // Timing
  checkFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly'
  snoozeOptions?: number[] // minutes
  autoResolve?: boolean
  autoResolveAfter?: number // hours
  
  // Actions
  autoActions?: {
    type: 'create_order' | 'adjust_stock' | 'notify_supplier' | 'move_item'
    parameters: Record<string, any>
  }[]
  
  createdAt: Date
  lastUpdated: Date
  createdBy: string
  lastTriggered?: Date
  triggerCount: number
}

export interface UseInventoryAlertsOptions {
  autoRefresh?: boolean
  refreshInterval?: number
  enableRealTimeUpdates?: boolean
  defaultFilters?: AlertFilters
  enableNotifications?: boolean
  soundEnabled?: boolean
}

export interface UseInventoryAlertsReturn {
  // Data
  alerts: InventoryAlert[]
  allAlerts: InventoryAlert[]
  filteredAlerts: InventoryAlert[]
  stats: AlertStats
  rules: AlertRule[]
  
  // State
  loading: boolean
  refreshing: boolean
  error: string | null
  
  // Filters and pagination
  filters: AlertFilters
  sortBy: string
  sortOrder: 'asc' | 'desc'
  currentPage: number
  totalPages: number
  itemsPerPage: number
  
  // Actions
  setFilters: (filters: Partial<AlertFilters>) => void
  clearFilters: () => void
  setSorting: (field: string, order?: 'asc' | 'desc') => void
  setPage: (page: number) => void
  setItemsPerPage: (items: number) => void
  refresh: () => Promise<void>
  
  // Alert operations
  acknowledgeAlert: (id: string, acknowledgedBy: string) => Promise<boolean>
  resolveAlert: (id: string, resolvedBy: string, resolution?: string) => Promise<boolean>
  dismissAlert: (id: string, reason?: string) => Promise<boolean>
  snoozeAlert: (id: string, minutes: number) => Promise<boolean>
  assignAlert: (id: string, assignedTo: string) => Promise<boolean>
  addAction: (alertId: string, action: Omit<InventoryAlert['actions'][0], 'id' | 'performedAt'>) => Promise<boolean>
  
  // Bulk operations
  bulkAcknowledge: (ids: string[], acknowledgedBy: string) => Promise<boolean>
  bulkResolve: (ids: string[], resolvedBy: string, resolution?: string) => Promise<boolean>
  bulkDismiss: (ids: string[], reason?: string) => Promise<boolean>
  bulkAssign: (ids: string[], assignedTo: string) => Promise<boolean>
  
  // Rule management
  createRule: (rule: Omit<AlertRule, 'id' | 'createdAt' | 'lastUpdated' | 'triggerCount'>) => Promise<boolean>
  updateRule: (id: string, updates: Partial<AlertRule>) => Promise<boolean>
  deleteRule: (id: string) => Promise<boolean>
  toggleRule: (id: string, enabled: boolean) => Promise<boolean>
  
  // Utility functions
  exportData: (format?: 'csv' | 'excel' | 'pdf') => any[]
  
  // Search and filter helpers
  searchAlerts: (query: string) => void
  getAlertsByType: (type: InventoryAlert['type']) => InventoryAlert[]
  getAlertsBySeverity: (severity: InventoryAlert['severity']) => InventoryAlert[]
  getAlertsByDepartment: (department: string) => InventoryAlert[]
  getActiveAlerts: () => InventoryAlert[]
  getCriticalAlerts: () => InventoryAlert[]
  getUnacknowledgedAlerts: () => InventoryAlert[]
  getOverdueAlerts: () => InventoryAlert[]
  getAlertsByItem: (itemId: string) => InventoryAlert[]
}

// Mock data
const mockAlerts: InventoryAlert[] = [
  {
    id: '1',
    type: 'low_stock',
    severity: 'high',
    status: 'active',
    itemId: 'med001',
    itemCode: 'MED001',
    itemName: 'Dipirona 500mg',
    itemType: 'medication',
    category: 'Analgésicos',
    title: 'Estoque Baixo - Dipirona 500mg',
    message: 'Estoque atual (15 unidades) está abaixo do ponto de reposição (50 unidades)',
    description: 'Medicamento com alta rotatividade. Recomenda-se pedido urgente para evitar ruptura.',
    currentValue: 15,
    thresholdValue: 50,
    recommendedAction: 'Realizar pedido de compra urgente - quantidade sugerida: 500 unidades',
    location: 'Farmácia Central - Prateleira A1',
    department: 'Farmácia',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    triggeredAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    priority: 8,
    urgency: 'within_day',
    metadata: {
      averageConsumption: 25,
      daysUntilStockout: 3,
      costImpact: 1250.00,
      affectedPatients: 15,
      alternativeItems: ['MED002', 'MED003']
    },
    tags: ['medicamento', 'alta_rotatividade', 'critico']
  },
  {
    id: '2',
    type: 'expiring',
    severity: 'medium',
    status: 'acknowledged',
    itemId: 'med002',
    itemCode: 'MED002',
    itemName: 'Insulina NPH',
    itemType: 'medication',
    category: 'Hormônios',
    title: 'Medicamento Próximo ao Vencimento',
    message: 'Lote INS2024001 vence em 15 dias (25 unidades)',
    description: 'Verificar possibilidade de uso prioritário ou transferência para outro setor.',
    currentValue: 15,
    thresholdValue: 30,
    recommendedAction: 'Priorizar dispensação ou considerar transferência',
    location: 'Farmácia Central - Geladeira 1',
    department: 'Farmácia',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
    triggeredAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
    acknowledgedAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
    acknowledgedBy: 'user003',
    acknowledgedByName: 'Ana Costa',
    assignedTo: 'user003',
    assignedToName: 'Ana Costa',
    priority: 6,
    urgency: 'within_week',
    metadata: {
      batchNumber: 'INS2024001',
      lotNumber: 'L240115',
      expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15),
      costImpact: 1125.00
    },
    actions: [
      {
        id: 'act1',
        type: 'manual_check',
        description: 'Verificação do lote e condições de armazenamento',
        performedBy: 'user003',
        performedByName: 'Ana Costa',
        performedAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
        result: 'Lote em boas condições, programada dispensação prioritária'
      }
    ],
    tags: ['medicamento', 'vencimento', 'controlado']
  },
  {
    id: '3',
    type: 'out_of_stock',
    severity: 'critical',
    status: 'active',
    itemId: 'sup001',
    itemCode: 'SUP001',
    itemName: 'Luvas Cirúrgicas Estéreis',
    itemType: 'supply',
    category: 'Material Cirúrgico',
    title: 'Item em Falta - Luvas Cirúrgicas',
    message: 'Estoque zerado. Cirurgias podem ser afetadas.',
    description: 'Item essencial para procedimentos cirúrgicos. Situação crítica.',
    currentValue: 0,
    thresholdValue: 100,
    recommendedAction: 'URGENTE: Contatar fornecedor para entrega emergencial',
    location: 'Centro Cirúrgico - Almoxarifado',
    department: 'Centro Cirúrgico',
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    triggeredAt: new Date(Date.now() - 1000 * 60 * 30),
    assignedTo: 'user005',
    assignedToName: 'Fernanda Lima',
    priority: 10,
    urgency: 'immediate',
    metadata: {
      averageConsumption: 50,
      daysUntilStockout: 0,
      costImpact: 2500.00,
      affectedPatients: 8,
      alternativeItems: ['SUP002']
    },
    notificationsSent: [
      {
        type: 'email',
        recipient: 'fernanda.lima@hospital.com',
        sentAt: new Date(Date.now() - 1000 * 60 * 25),
        delivered: true
      },
      {
        type: 'sms',
        recipient: '+5511999999999',
        sentAt: new Date(Date.now() - 1000 * 60 * 25),
        delivered: true
      }
    ],
    tags: ['suprimento', 'critico', 'cirurgia']
  },
  {
    id: '4',
    type: 'reorder_point',
    severity: 'medium',
    status: 'resolved',
    itemId: 'equ001',
    itemCode: 'EQU001',
    itemName: 'Monitor Cardíaco Portátil',
    itemType: 'equipment',
    category: 'Equipamentos de Monitoramento',
    title: 'Ponto de Reposição Atingido',
    message: 'Equipamento atingiu ponto de reposição para manutenção preventiva',
    description: 'Equipamento com 2000 horas de uso, próximo ao limite para manutenção.',
    currentValue: 2000,
    thresholdValue: 1800,
    recommendedAction: 'Agendar manutenção preventiva',
    location: 'UTI - Sala 1',
    department: 'UTI',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    triggeredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    acknowledgedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    acknowledgedBy: 'user006',
    acknowledgedByName: 'Carlos Mendes',
    resolvedBy: 'user006',
    resolvedByName: 'Carlos Mendes',
    assignedTo: 'user006',
    assignedToName: 'Carlos Mendes',
    priority: 5,
    urgency: 'within_week',
    metadata: {
      costImpact: 800.00
    },
    actions: [
      {
        id: 'act2',
        type: 'other',
        description: 'Manutenção preventiva agendada para próxima semana',
        performedBy: 'user006',
        performedByName: 'Carlos Mendes',
        performedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
        result: 'Manutenção agendada com empresa terceirizada'
      }
    ],
    tags: ['equipamento', 'manutencao', 'preventiva']
  },
  {
    id: '5',
    type: 'expired',
    severity: 'high',
    status: 'dismissed',
    itemId: 'med003',
    itemCode: 'MED003',
    itemName: 'Antibiótico Amoxicilina',
    itemType: 'medication',
    category: 'Antibióticos',
    title: 'Medicamento Vencido',
    message: 'Lote AMX2023015 venceu há 5 dias (8 unidades)',
    description: 'Medicamento vencido deve ser segregado e descartado conforme protocolo.',
    currentValue: 5,
    thresholdValue: 0,
    recommendedAction: 'Segregar e descartar conforme protocolo de medicamentos vencidos',
    location: 'Farmácia Central - Área de Quarentena',
    department: 'Farmácia',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    triggeredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    dismissedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    priority: 7,
    urgency: 'within_day',
    metadata: {
      batchNumber: 'AMX2023015',
      lotNumber: 'A231015',
      expirationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      costImpact: 240.00
    },
    actions: [
      {
        id: 'act3',
        type: 'item_moved',
        description: 'Medicamentos movidos para área de quarentena',
        performedBy: 'user003',
        performedByName: 'Ana Costa',
        performedAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
        result: 'Itens segregados aguardando descarte'
      }
    ],
    tags: ['medicamento', 'vencido', 'descarte']
  }
]

const mockRules: AlertRule[] = [
  {
    id: '1',
    name: 'Estoque Baixo - Medicamentos Críticos',
    description: 'Alerta quando medicamentos críticos atingem estoque baixo',
    enabled: true,
    itemType: 'medication',
    category: 'Críticos',
    lowStockThreshold: 20,
    alertType: 'low_stock',
    severity: 'high',
    priority: 8,
    urgency: 'within_day',
    notifyUsers: ['user001', 'user002', 'user003'],
    notificationMethods: ['email', 'sms', 'push'],
    checkFrequency: 'hourly',
    snoozeOptions: [30, 60, 120, 240],
    autoResolve: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    createdBy: 'user001',
    lastTriggered: new Date(Date.now() - 1000 * 60 * 60 * 2),
    triggerCount: 15
  },
  {
    id: '2',
    name: 'Medicamentos Próximos ao Vencimento',
    description: 'Alerta para medicamentos que vencem em 30 dias',
    enabled: true,
    itemType: 'medication',
    expirationDays: 30,
    alertType: 'expiring',
    severity: 'medium',
    priority: 6,
    urgency: 'within_week',
    notifyUsers: ['user003'],
    notificationMethods: ['email', 'system'],
    checkFrequency: 'daily',
    snoozeOptions: [60, 240, 480],
    autoResolve: true,
    autoResolveAfter: 72,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60),
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    createdBy: 'user002',
    lastTriggered: new Date(Date.now() - 1000 * 60 * 60 * 6),
    triggerCount: 8
  },
  {
    id: '3',
    name: 'Equipamentos - Manutenção Preventiva',
    description: 'Alerta para equipamentos que precisam de manutenção preventiva',
    enabled: true,
    itemType: 'equipment',
    department: 'UTI',
    reorderPoint: 1800,
    alertType: 'reorder_point',
    severity: 'medium',
    priority: 5,
    urgency: 'within_week',
    notifyUsers: ['user006'],
    notificationMethods: ['email'],
    checkFrequency: 'weekly',
    snoozeOptions: [240, 480, 1440],
    autoResolve: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90),
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20),
    createdBy: 'user001',
    lastTriggered: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    triggerCount: 3
  }
]

export function useInventoryAlerts(options: UseInventoryAlertsOptions = {}): UseInventoryAlertsReturn {
  const {
    autoRefresh = true,
    refreshInterval = 60000, // 1 minute
    enableRealTimeUpdates = true,
    defaultFilters = {},
    enableNotifications = true,
    soundEnabled = true
  } = options

  // State
  const [alerts, setAlerts] = useState<InventoryAlert[]>([])
  const [rules, setRules] = useState<AlertRule[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Filters and search
  const [filters, setFiltersState] = useState<AlertFilters>(defaultFilters)
  const [sortBy, setSortBy] = useState('priority')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)

  // Initialize data
  useEffect(() => {
    loadAlerts()
    loadRules()
  }, [])

  // Auto refresh
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refresh()
      }, refreshInterval)
      
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  // Load alerts
  const loadAlerts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setAlerts(mockAlerts)
    } catch (err) {
      setError('Erro ao carregar alertas')
      console.error('Error loading alerts:', err)
    } finally {
      setLoading(false)
    }
  }

  // Load rules
  const loadRules = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setRules(mockRules)
    } catch (err) {
      console.error('Error loading rules:', err)
    }
  }

  // Filter and sort alerts
  const filteredAlerts = alerts
    .filter(alert => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        if (!alert.title.toLowerCase().includes(searchLower) &&
            !alert.message.toLowerCase().includes(searchLower) &&
            !alert.itemName.toLowerCase().includes(searchLower) &&
            !alert.itemCode.toLowerCase().includes(searchLower) &&
            !alert.department.toLowerCase().includes(searchLower) &&
            !alert.location.toLowerCase().includes(searchLower) &&
            !(alert.description?.toLowerCase().includes(searchLower)) &&
            !(alert.tags?.some(tag => tag.toLowerCase().includes(searchLower)))) {
          return false
        }
      }
      
      if (filters.type && filters.type !== 'all' && alert.type !== filters.type) return false
      if (filters.severity && filters.severity !== 'all' && alert.severity !== filters.severity) return false
      if (filters.status && filters.status !== 'all' && alert.status !== filters.status) return false
      if (filters.itemType && filters.itemType !== 'all' && alert.itemType !== filters.itemType) return false
      if (filters.department && alert.department !== filters.department) return false
      if (filters.location && alert.location !== filters.location) return false
      if (filters.assignedTo && alert.assignedTo !== filters.assignedTo) return false
      if (filters.category && alert.category !== filters.category) return false
      
      if (filters.createdFrom && alert.createdAt < filters.createdFrom) return false
      if (filters.createdTo && alert.createdAt > filters.createdTo) return false
      if (filters.triggeredFrom && alert.triggeredAt < filters.triggeredFrom) return false
      if (filters.triggeredTo && alert.triggeredAt > filters.triggeredTo) return false
      
      if (filters.priorityMin && alert.priority < filters.priorityMin) return false
      if (filters.priorityMax && alert.priority > filters.priorityMax) return false
      
      if (filters.activeOnly && alert.status !== 'active') return false
      if (filters.unacknowledged && alert.acknowledgedAt) return false
      if (filters.unresolved && alert.resolvedAt) return false
      if (filters.criticalOnly && alert.severity !== 'critical') return false
      if (filters.highPriority && alert.priority < 7) return false
      
      if (filters.expiringSoon && alert.type !== 'expiring') return false
      
      if (filters.today) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        
        if (alert.createdAt < today || alert.createdAt >= tomorrow) {
          return false
        }
      }
      
      if (filters.thisWeek) {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        if (alert.createdAt < weekAgo) return false
      }
      
      if (filters.thisMonth) {
        const monthAgo = new Date()
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        if (alert.createdAt < monthAgo) return false
      }
      
      if (filters.overdue) {
        if (!alert.expiresAt || alert.expiresAt > new Date()) return false
      }
      
      if (filters.tags && filters.tags.length > 0) {
        if (!alert.tags || !filters.tags.some(tag => alert.tags!.includes(tag))) {
          return false
        }
      }
      
      if (filters.excludeTags && filters.excludeTags.length > 0) {
        if (alert.tags && filters.excludeTags.some(tag => alert.tags!.includes(tag))) {
          return false
        }
      }
      
      return true
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy as keyof InventoryAlert]
      let bValue: any = b[sortBy as keyof InventoryAlert]
      
      if (aValue instanceof Date && bValue instanceof Date) {
        aValue = aValue.getTime()
        bValue = bValue.getTime()
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

  // Calculate stats
  const stats: AlertStats = {
    totalAlerts: alerts.length,
    activeAlerts: alerts.filter(a => a.status === 'active').length,
    acknowledgedAlerts: alerts.filter(a => a.status === 'acknowledged').length,
    resolvedAlerts: alerts.filter(a => a.status === 'resolved').length,
    dismissedAlerts: alerts.filter(a => a.status === 'dismissed').length,
    snoozedAlerts: alerts.filter(a => a.status === 'snoozed').length,
    
    // By severity
    lowSeverity: alerts.filter(a => a.severity === 'low').length,
    mediumSeverity: alerts.filter(a => a.severity === 'medium').length,
    highSeverity: alerts.filter(a => a.severity === 'high').length,
    criticalSeverity: alerts.filter(a => a.severity === 'critical').length,
    
    // By type
    lowStockAlerts: alerts.filter(a => a.type === 'low_stock').length,
    highStockAlerts: alerts.filter(a => a.type === 'high_stock').length,
    expiringAlerts: alerts.filter(a => a.type === 'expiring').length,
    expiredAlerts: alerts.filter(a => a.type === 'expired').length,
    outOfStockAlerts: alerts.filter(a => a.type === 'out_of_stock').length,
    reorderPointAlerts: alerts.filter(a => a.type === 'reorder_point').length,
    qualityIssueAlerts: alerts.filter(a => a.type === 'quality_issue').length,
    locationMismatchAlerts: alerts.filter(a => a.type === 'location_mismatch').length,
    priceChangeAlerts: alerts.filter(a => a.type === 'price_change').length,
    supplierIssueAlerts: alerts.filter(a => a.type === 'supplier_issue').length,
    
    // By item type
    medicationAlerts: alerts.filter(a => a.itemType === 'medication').length,
    equipmentAlerts: alerts.filter(a => a.itemType === 'equipment').length,
    supplyAlerts: alerts.filter(a => a.itemType === 'supply').length,
    
    // Time-based
    todayAlerts: alerts.filter(a => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      return a.createdAt >= today && a.createdAt < tomorrow
    }).length,
    
    weekAlerts: alerts.filter(a => {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return a.createdAt >= weekAgo
    }).length,
    
    monthAlerts: alerts.filter(a => {
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      return a.createdAt >= monthAgo
    }).length,
    
    overdueAlerts: alerts.filter(a => a.expiresAt && a.expiresAt < new Date()).length,
    
    // Performance metrics
    averageResolutionTime: alerts
      .filter(a => a.resolvedAt && a.createdAt)
      .reduce((sum, a) => {
        const resolutionTime = (a.resolvedAt!.getTime() - a.createdAt.getTime()) / (1000 * 60 * 60)
        return sum + resolutionTime
      }, 0) / Math.max(1, alerts.filter(a => a.resolvedAt).length),
    
    averageAcknowledgmentTime: alerts
      .filter(a => a.acknowledgedAt && a.createdAt)
      .reduce((sum, a) => {
        const ackTime = (a.acknowledgedAt!.getTime() - a.createdAt.getTime()) / (1000 * 60)
        return sum + ackTime
      }, 0) / Math.max(1, alerts.filter(a => a.acknowledgedAt).length),
    
    alertTrends: [
      { period: 'Hoje', count: alerts.filter(a => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return a.createdAt >= today
      }).length, resolved: alerts.filter(a => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return a.resolvedAt && a.resolvedAt >= today
      }).length },
      { period: 'Esta Semana', count: alerts.filter(a => {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return a.createdAt >= weekAgo
      }).length, resolved: alerts.filter(a => {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return a.resolvedAt && a.resolvedAt >= weekAgo
      }).length },
      { period: 'Este Mês', count: alerts.filter(a => {
        const monthAgo = new Date()
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        return a.createdAt >= monthAgo
      }).length, resolved: alerts.filter(a => {
        const monthAgo = new Date()
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        return a.resolvedAt && a.resolvedAt >= monthAgo
      }).length }
    ],
    
    // Financial impact
    totalCostImpact: alerts.reduce((sum, a) => sum + (a.metadata?.costImpact || 0), 0),
    averageCostPerAlert: alerts.reduce((sum, a) => sum + (a.metadata?.costImpact || 0), 0) / Math.max(1, alerts.length),
    
    // Response metrics
    responseRate: (alerts.filter(a => a.acknowledgedAt).length / Math.max(1, alerts.length)) * 100,
    resolutionRate: (alerts.filter(a => a.resolvedAt).length / Math.max(1, alerts.length)) * 100
  }

  // Pagination
  const totalPages = Math.ceil(filteredAlerts.length / itemsPerPage)
  const paginatedAlerts = filteredAlerts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Functions
  const setFilters = useCallback((newFilters: Partial<AlertFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }))
    setCurrentPage(1)
  }, [])

  const clearFilters = useCallback(() => {
    setFiltersState(defaultFilters)
    setCurrentPage(1)
  }, [defaultFilters])

  const setSorting = useCallback((field: string, order?: 'asc' | 'desc') => {
    setSortBy(field)
    setSortOrder(order || (sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc'))
  }, [sortBy, sortOrder])

  const setPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }, [totalPages])

  const refresh = useCallback(async () => {
    setRefreshing(true)
    await loadAlerts()
    setRefreshing(false)
    toast.success('Alertas atualizados')
  }, [])

  // Alert Operations
  const acknowledgeAlert = useCallback(async (id: string, acknowledgedBy: string): Promise<boolean> => {
    try {
      setAlerts(prev => prev.map(alert => 
        alert.id === id 
          ? { 
              ...alert, 
              status: 'acknowledged',
              acknowledgedAt: new Date(),
              acknowledgedBy,
              acknowledgedByName: 'Current User' // Would come from user context
            }
          : alert
      ))
      
      toast.success('Alerta reconhecido')
      return true
    } catch (err) {
      toast.error('Erro ao reconhecer alerta')
      console.error('Error acknowledging alert:', err)
      return false
    }
  }, [])

  const resolveAlert = useCallback(async (id: string, resolvedBy: string, resolution?: string): Promise<boolean> => {
    try {
      setAlerts(prev => prev.map(alert => 
        alert.id === id 
          ? { 
              ...alert, 
              status: 'resolved',
              resolvedAt: new Date(),
              resolvedBy,
              resolvedByName: 'Current User',
              description: resolution ? `${alert.description || ''} | Resolução: ${resolution}` : alert.description
            }
          : alert
      ))
      
      toast.success('Alerta resolvido')
      return true
    } catch (err) {
      toast.error('Erro ao resolver alerta')
      console.error('Error resolving alert:', err)
      return false
    }
  }, [])

  const dismissAlert = useCallback(async (id: string, reason?: string): Promise<boolean> => {
    try {
      setAlerts(prev => prev.map(alert => 
        alert.id === id 
          ? { 
              ...alert, 
              status: 'dismissed',
              dismissedAt: new Date(),
              description: reason ? `${alert.description || ''} | Dispensado: ${reason}` : alert.description
            }
          : alert
      ))
      
      toast.success('Alerta dispensado')
      return true
    } catch (err) {
      toast.error('Erro ao dispensar alerta')
      console.error('Error dismissing alert:', err)
      return false
    }
  }, [])

  const snoozeAlert = useCallback(async (id: string, minutes: number): Promise<boolean> => {
    try {
      const snoozeUntil = new Date(Date.now() + minutes * 60 * 1000)
      
      setAlerts(prev => prev.map(alert => 
        alert.id === id 
          ? { 
              ...alert, 
              status: 'snoozed',
              snoozedUntil
            }
          : alert
      ))
      
      toast.success(`Alerta adiado por ${minutes} minutos`)
      return true
    } catch (err) {
      toast.error('Erro ao adiar alerta')
      console.error('Error snoozing alert:', err)
      return false
    }
  }, [])

  const assignAlert = useCallback(async (id: string, assignedTo: string): Promise<boolean> => {
    try {
      setAlerts(prev => prev.map(alert => 
        alert.id === id 
          ? { 
              ...alert, 
              assignedTo,
              assignedToName: 'Assigned User' // Would come from user lookup
            }
          : alert
      ))
      
      toast.success('Alerta atribuído')
      return true
    } catch (err) {
      toast.error('Erro ao atribuir alerta')
      console.error('Error assigning alert:', err)
      return false
    }
  }, [])

  const addAction = useCallback(async (alertId: string, action: Omit<InventoryAlert['actions'][0], 'id' | 'performedAt'>): Promise<boolean> => {
    try {
      const newAction = {
        ...action,
        id: Date.now().toString(),
        performedAt: new Date()
      }
      
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { 
              ...alert, 
              actions: [...(alert.actions || []), newAction]
            }
          : alert
      ))
      
      toast.success('Ação adicionada ao alerta')
      return true
    } catch (err) {
      toast.error('Erro ao adicionar ação')
      console.error('Error adding action:', err)
      return false
    }
  }, [])

  // Bulk Operations
  const bulkAcknowledge = useCallback(async (ids: string[], acknowledgedBy: string): Promise<boolean> => {
    try {
      setAlerts(prev => prev.map(alert => 
        ids.includes(alert.id) 
          ? { 
              ...alert, 
              status: 'acknowledged',
              acknowledgedAt: new Date(),
              acknowledgedBy,
              acknowledgedByName: 'Current User'
            }
          : alert
      ))
      
      toast.success(`${ids.length} alertas reconhecidos`)
      return true
    } catch (err) {
      toast.error('Erro no reconhecimento em massa')
      console.error('Error in bulk acknowledge:', err)
      return false
    }
  }, [])

  const bulkResolve = useCallback(async (ids: string[], resolvedBy: string, resolution?: string): Promise<boolean> => {
    try {
      setAlerts(prev => prev.map(alert => 
        ids.includes(alert.id) 
          ? { 
              ...alert, 
              status: 'resolved',
              resolvedAt: new Date(),
              resolvedBy,
              resolvedByName: 'Current User',
              description: resolution ? `${alert.description || ''} | Resolução em massa: ${resolution}` : alert.description
            }
          : alert
      ))
      
      toast.success(`${ids.length} alertas resolvidos`)
      return true
    } catch (err) {
      toast.error('Erro na resolução em massa')
      console.error('Error in bulk resolve:', err)
      return false
    }
  }, [])

  const bulkDismiss = useCallback(async (ids: string[], reason?: string): Promise<boolean> => {
    try {
      setAlerts(prev => prev.map(alert => 
        ids.includes(alert.id) 
          ? { 
              ...alert, 
              status: 'dismissed',
              dismissedAt: new Date(),
              description: reason ? `${alert.description || ''} | Dispensado em massa: ${reason}` : alert.description
            }
          : alert
      ))
      
      toast.success(`${ids.length} alertas dispensados`)
      return true
    } catch (err) {
      toast.error('Erro na dispensa em massa')
      console.error('Error in bulk dismiss:', err)
      return false
    }
  }, [])

  const bulkAssign = useCallback(async (ids: string[], assignedTo: string): Promise<boolean> => {
    try {
      setAlerts(prev => prev.map(alert => 
        ids.includes(alert.id) 
          ? { 
              ...alert, 
              assignedTo,
              assignedToName: 'Assigned User'
            }
          : alert
      ))
      
      toast.success(`${ids.length} alertas atribuídos`)
      return true
    } catch (err) {
      toast.error('Erro na atribuição em massa')
      console.error('Error in bulk assign:', err)
      return false
    }
  }, [])

  // Rule Management
  const createRule = useCallback(async (rule: Omit<AlertRule, 'id' | 'createdAt' | 'lastUpdated' | 'triggerCount'>): Promise<boolean> => {
    try {
      const newRule: AlertRule = {
        ...rule,
        id: Date.now().toString(),
        createdAt: new Date(),
        lastUpdated: new Date(),
        triggerCount: 0
      }
      
      setRules(prev => [newRule, ...prev])
      toast.success('Regra de alerta criada')
      return true
    } catch (err) {
      toast.error('Erro ao criar regra')
      console.error('Error creating rule:', err)
      return false
    }
  }, [])

  const updateRule = useCallback(async (id: string, updates: Partial<AlertRule>): Promise<boolean> => {
    try {
      setRules(prev => prev.map(rule => 
        rule.id === id 
          ? { ...rule, ...updates, lastUpdated: new Date() }
          : rule
      ))
      
      toast.success('Regra atualizada')
      return true
    } catch (err) {
      toast.error('Erro ao atualizar regra')
      console.error('Error updating rule:', err)
      return false
    }
  }, [])

  const deleteRule = useCallback(async (id: string): Promise<boolean> => {
    try {
      setRules(prev => prev.filter(rule => rule.id !== id))
      toast.success('Regra removida')
      return true
    } catch (err) {
      toast.error('Erro ao remover regra')
      console.error('Error deleting rule:', err)
      return false
    }
  }, [])

  const toggleRule = useCallback(async (id: string, enabled: boolean): Promise<boolean> => {
    try {
      setRules(prev => prev.map(rule => 
        rule.id === id 
          ? { ...rule, enabled, lastUpdated: new Date() }
          : rule
      ))
      
      toast.success(`Regra ${enabled ? 'ativada' : 'desativada'}`)
      return true
    } catch (err) {
      toast.error('Erro ao alterar status da regra')
      console.error('Error toggling rule:', err)
      return false
    }
  }, [])

  // Utility Functions
  const exportData = useCallback((format: 'csv' | 'excel' | 'pdf' = 'csv') => {
    try {
      const data = filteredAlerts.map(alert => ({
        ID: alert.id,
        Tipo: alert.type,
        Severidade: alert.severity,
        Status: alert.status,
        'Código do Item': alert.itemCode,
        'Nome do Item': alert.itemName,
        'Tipo do Item': alert.itemType,
        Categoria: alert.category,
        Título: alert.title,
        Mensagem: alert.message,
        Descrição: alert.description,
        'Valor Atual': alert.currentValue,
        'Valor Limite': alert.thresholdValue,
        'Ação Recomendada': alert.recommendedAction,
        Localização: alert.location,
        Departamento: alert.department,
        'Data de Criação': alert.createdAt.toLocaleDateString('pt-BR'),
        'Data de Ativação': alert.triggeredAt.toLocaleDateString('pt-BR'),
        'Data de Reconhecimento': alert.acknowledgedAt?.toLocaleDateString('pt-BR'),
        'Data de Resolução': alert.resolvedAt?.toLocaleDateString('pt-BR'),
        'Reconhecido Por': alert.acknowledgedByName,
        'Resolvido Por': alert.resolvedByName,
        'Atribuído Para': alert.assignedToName,
        Prioridade: alert.priority,
        Urgência: alert.urgency,
        Tags: alert.tags?.join(', '),
        'Impacto de Custo': alert.metadata?.costImpact,
        'Pacientes Afetados': alert.metadata?.affectedPatients,
        'Dias até Ruptura': alert.metadata?.daysUntilStockout
      }))
      
      console.log(`Exporting ${data.length} alerts in ${format} format:`, data)
      toast.success(`Dados exportados em formato ${format.toUpperCase()}`)
      
      return data
    } catch (err) {
      toast.error('Erro ao exportar dados')
      console.error('Error exporting data:', err)
      return []
    }
  }, [filteredAlerts])

  // Search and filter helpers
  const searchAlerts = useCallback((query: string) => {
    setFilters({ search: query })
  }, [setFilters])

  const getAlertsByType = useCallback((type: InventoryAlert['type']) => {
    return alerts.filter(alert => alert.type === type)
  }, [alerts])

  const getAlertsBySeverity = useCallback((severity: InventoryAlert['severity']) => {
    return alerts.filter(alert => alert.severity === severity)
  }, [alerts])

  const getAlertsByDepartment = useCallback((department: string) => {
    return alerts.filter(alert => alert.department === department)
  }, [alerts])

  const getActiveAlerts = useCallback(() => {
    return alerts.filter(alert => alert.status === 'active')
  }, [alerts])

  const getCriticalAlerts = useCallback(() => {
    return alerts.filter(alert => alert.severity === 'critical')
  }, [alerts])

  const getUnacknowledgedAlerts = useCallback(() => {
    return alerts.filter(alert => !alert.acknowledgedAt)
  }, [alerts])

  const getOverdueAlerts = useCallback(() => {
    return alerts.filter(alert => alert.expiresAt && alert.expiresAt < new Date())
  }, [alerts])

  const getAlertsByItem = useCallback((itemId: string) => {
    return alerts.filter(alert => alert.itemId === itemId)
  }, [alerts])

  return {
    // Data
    alerts: paginatedAlerts,
    allAlerts: alerts,
    filteredAlerts,
    stats,
    rules,
    
    // State
    loading,
    refreshing,
    error,
    
    // Filters and pagination
    filters,
    sortBy,
    sortOrder,
    currentPage,
    totalPages,
    itemsPerPage,
    
    // Actions
    setFilters,
    clearFilters,
    setSorting,
    setPage,
    setItemsPerPage,
    refresh,
    
    // Alert operations
    acknowledgeAlert,
    resolveAlert,
    dismissAlert,
    snoozeAlert,
    assignAlert,
    addAction,
    
    // Bulk operations
    bulkAcknowledge,
    bulkResolve,
    bulkDismiss,
    bulkAssign,
    
    // Rule management
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
    
    // Utility functions
    exportData,
    
    // Search and filter helpers
    searchAlerts,
    getAlertsByType,
    getAlertsBySeverity,
    getAlertsByDepartment,
    getActiveAlerts,
    getCriticalAlerts,
    getUnacknowledgedAlerts,
    getOverdueAlerts,
    getAlertsByItem
  }
}