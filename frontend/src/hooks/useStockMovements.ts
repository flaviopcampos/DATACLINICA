import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

// Types
export interface StockMovement {
  id: string
  itemId: string
  itemCode: string
  itemName: string
  itemType: 'medication' | 'equipment' | 'supply'
  
  // Movement details
  type: 'in' | 'out' | 'adjustment' | 'transfer' | 'return' | 'loss' | 'expired' | 'damaged'
  reason: string
  reference?: string // Order number, prescription ID, etc.
  
  // Quantities
  quantity: number
  previousStock: number
  newStock: number
  
  // Location
  fromLocation?: string
  toLocation?: string
  currentLocation: string
  
  // Financial
  unitCost: number
  totalCost: number
  
  // Batch and expiration
  batchNumber?: string
  lotNumber?: string
  expirationDate?: Date
  
  // Responsible and approval
  responsible: string
  responsibleName: string
  approvedBy?: string
  approvedByName?: string
  approvalDate?: Date
  
  // Status and tracking
  status: 'pending' | 'approved' | 'completed' | 'cancelled' | 'rejected'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  
  // Dates
  movementDate: Date
  scheduledDate?: Date
  completedDate?: Date
  
  // Additional information
  department: string
  supplier?: string
  patient?: {
    id: string
    name: string
    record: string
  }
  prescription?: {
    id: string
    number: string
    doctor: string
  }
  notes?: string
  attachments?: string[]
  
  // Metadata
  createdAt: Date
  lastUpdated: Date
  createdBy: string
  lastUpdatedBy: string
}

export interface MovementFilters {
  search?: string
  itemType?: 'all' | StockMovement['itemType']
  type?: 'all' | StockMovement['type']
  status?: 'all' | StockMovement['status']
  priority?: 'all' | StockMovement['priority']
  department?: string
  responsible?: string
  supplier?: string
  dateFrom?: Date
  dateTo?: Date
  amountFrom?: number
  amountTo?: number
  hasReference?: boolean
  hasBatch?: boolean
  hasExpiration?: boolean
  pendingApproval?: boolean
  completedToday?: boolean
  thisWeek?: boolean
  thisMonth?: boolean
}

export interface MovementStats {
  totalMovements: number
  totalValue: number
  pendingMovements: number
  completedMovements: number
  cancelledMovements: number
  
  // By type
  inMovements: number
  outMovements: number
  adjustments: number
  transfers: number
  returns: number
  losses: number
  
  // By item type
  medicationMovements: number
  equipmentMovements: number
  supplyMovements: number
  
  // Financial
  inValue: number
  outValue: number
  adjustmentValue: number
  lossValue: number
  
  // Time-based
  todayMovements: number
  weekMovements: number
  monthMovements: number
  
  // Performance
  averageProcessingTime: number // hours
  pendingApprovals: number
}

export interface UseStockMovementsOptions {
  autoRefresh?: boolean
  refreshInterval?: number
  enableRealTimeUpdates?: boolean
  defaultFilters?: MovementFilters
}

export interface UseStockMovementsReturn {
  // Data
  movements: StockMovement[]
  allMovements: StockMovement[]
  filteredMovements: StockMovement[]
  stats: MovementStats
  
  // State
  loading: boolean
  refreshing: boolean
  error: string | null
  
  // Filters and pagination
  filters: MovementFilters
  sortBy: string
  sortOrder: 'asc' | 'desc'
  currentPage: number
  totalPages: number
  itemsPerPage: number
  
  // Actions
  setFilters: (filters: Partial<MovementFilters>) => void
  clearFilters: () => void
  setSorting: (field: string, order?: 'asc' | 'desc') => void
  setPage: (page: number) => void
  setItemsPerPage: (items: number) => void
  refresh: () => Promise<void>
  
  // CRUD operations
  getMovement: (id: string) => Promise<StockMovement | null>
  createMovement: (movementData: Omit<StockMovement, 'id' | 'createdAt' | 'lastUpdated' | 'status'>) => Promise<boolean>
  updateMovement: (id: string, updates: Partial<StockMovement>) => Promise<boolean>
  deleteMovement: (id: string) => Promise<boolean>
  
  // Movement operations
  approveMovement: (id: string, approvedBy: string) => Promise<boolean>
  rejectMovement: (id: string, reason: string, rejectedBy: string) => Promise<boolean>
  completeMovement: (id: string, completedBy: string) => Promise<boolean>
  cancelMovement: (id: string, reason: string, cancelledBy: string) => Promise<boolean>
  
  // Bulk operations
  bulkApprove: (ids: string[], approvedBy: string) => Promise<boolean>
  bulkComplete: (ids: string[], completedBy: string) => Promise<boolean>
  bulkCancel: (ids: string[], reason: string, cancelledBy: string) => Promise<boolean>
  
  // Utility functions
  exportData: (format?: 'csv' | 'excel' | 'pdf') => any[]
  importData: (data: any[]) => Promise<boolean>
  
  // Search and filter helpers
  searchMovements: (query: string) => void
  getMovementsByItem: (itemId: string) => StockMovement[]
  getMovementsByType: (type: StockMovement['type']) => StockMovement[]
  getMovementsByDepartment: (department: string) => StockMovement[]
  getPendingMovements: () => StockMovement[]
  getRecentMovements: (days?: number) => StockMovement[]
  getMovementsByDateRange: (from: Date, to: Date) => StockMovement[]
  getHighValueMovements: (minValue?: number) => StockMovement[]
}

// Mock data
const mockMovements: StockMovement[] = [
  {
    id: '1',
    itemId: 'med001',
    itemCode: 'MED001',
    itemName: 'Dipirona 500mg',
    itemType: 'medication',
    type: 'in',
    reason: 'Compra - Pedido #1234',
    reference: 'PED-1234',
    quantity: 100,
    previousStock: 50,
    newStock: 150,
    fromLocation: 'Fornecedor A',
    toLocation: 'Farmácia Central',
    currentLocation: 'Farmácia Central',
    unitCost: 2.50,
    totalCost: 250.00,
    batchNumber: 'LT2024001',
    lotNumber: 'L240101',
    expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
    responsible: 'user001',
    responsibleName: 'João Silva',
    approvedBy: 'user002',
    approvedByName: 'Maria Santos',
    approvalDate: new Date(Date.now() - 1000 * 60 * 60 * 2),
    status: 'completed',
    priority: 'medium',
    movementDate: new Date(Date.now() - 1000 * 60 * 60 * 24),
    scheduledDate: new Date(Date.now() - 1000 * 60 * 60 * 24),
    completedDate: new Date(Date.now() - 1000 * 60 * 60 * 23),
    department: 'Farmácia',
    supplier: 'Fornecedor A',
    notes: 'Entrega conforme pedido',
    attachments: ['nota_fiscal_1234.pdf'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 25),
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 23),
    createdBy: 'user001',
    lastUpdatedBy: 'user002'
  },
  {
    id: '2',
    itemId: 'med001',
    itemCode: 'MED001',
    itemName: 'Dipirona 500mg',
    itemType: 'medication',
    type: 'out',
    reason: 'Dispensação - Prescrição #5678',
    reference: 'PRESC-5678',
    quantity: 20,
    previousStock: 150,
    newStock: 130,
    fromLocation: 'Farmácia Central',
    toLocation: 'Enfermaria 1',
    currentLocation: 'Enfermaria 1',
    unitCost: 2.50,
    totalCost: 50.00,
    batchNumber: 'LT2024001',
    lotNumber: 'L240101',
    expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
    responsible: 'user003',
    responsibleName: 'Ana Costa',
    status: 'completed',
    priority: 'high',
    movementDate: new Date(Date.now() - 1000 * 60 * 60 * 12),
    completedDate: new Date(Date.now() - 1000 * 60 * 60 * 12),
    department: 'Enfermaria',
    patient: {
      id: 'pat001',
      name: 'Carlos Oliveira',
      record: '123456'
    },
    prescription: {
      id: 'presc001',
      number: 'PRESC-5678',
      doctor: 'Dr. Pedro Lima'
    },
    notes: 'Dispensação para paciente internado',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 13),
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 12),
    createdBy: 'user003',
    lastUpdatedBy: 'user003'
  },
  {
    id: '3',
    itemId: 'sup001',
    itemCode: 'SUP001',
    itemName: 'Luvas Cirúrgicas Estéreis',
    itemType: 'supply',
    type: 'adjustment',
    reason: 'Ajuste de inventário - Contagem física',
    quantity: -5,
    previousStock: 155,
    newStock: 150,
    currentLocation: 'Almoxarifado - Prateleira A1',
    unitCost: 2.50,
    totalCost: -12.50,
    responsible: 'user004',
    responsibleName: 'Roberto Alves',
    approvedBy: 'user002',
    approvedByName: 'Maria Santos',
    approvalDate: new Date(Date.now() - 1000 * 60 * 60 * 6),
    status: 'completed',
    priority: 'low',
    movementDate: new Date(Date.now() - 1000 * 60 * 60 * 8),
    completedDate: new Date(Date.now() - 1000 * 60 * 60 * 6),
    department: 'Almoxarifado',
    notes: 'Diferença encontrada na contagem física',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 9),
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 6),
    createdBy: 'user004',
    lastUpdatedBy: 'user002'
  },
  {
    id: '4',
    itemId: 'equ001',
    itemCode: 'EQU001',
    itemName: 'Monitor Cardíaco Portátil',
    itemType: 'equipment',
    type: 'transfer',
    reason: 'Transferência entre departamentos',
    quantity: 1,
    previousStock: 1,
    newStock: 1,
    fromLocation: 'UTI - Sala 1',
    toLocation: 'Emergência - Sala 2',
    currentLocation: 'Emergência - Sala 2',
    unitCost: 15000.00,
    totalCost: 0, // Transfer doesn't change value
    responsible: 'user005',
    responsibleName: 'Fernanda Lima',
    status: 'pending',
    priority: 'urgent',
    movementDate: new Date(),
    scheduledDate: new Date(Date.now() + 1000 * 60 * 60 * 2),
    department: 'Emergência',
    notes: 'Transferência urgente para atendimento de emergência',
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    lastUpdated: new Date(Date.now() - 1000 * 60 * 30),
    createdBy: 'user005',
    lastUpdatedBy: 'user005'
  },
  {
    id: '5',
    itemId: 'med002',
    itemCode: 'MED002',
    itemName: 'Insulina NPH',
    itemType: 'medication',
    type: 'loss',
    reason: 'Produto vencido - Descarte',
    quantity: 10,
    previousStock: 25,
    newStock: 15,
    currentLocation: 'Farmácia Central',
    unitCost: 45.00,
    totalCost: 450.00,
    batchNumber: 'INS2023012',
    lotNumber: 'I231201',
    expirationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
    responsible: 'user003',
    responsibleName: 'Ana Costa',
    approvedBy: 'user002',
    approvedByName: 'Maria Santos',
    approvalDate: new Date(Date.now() - 1000 * 60 * 60 * 4),
    status: 'completed',
    priority: 'medium',
    movementDate: new Date(Date.now() - 1000 * 60 * 60 * 6),
    completedDate: new Date(Date.now() - 1000 * 60 * 60 * 4),
    department: 'Farmácia',
    notes: 'Descarte conforme protocolo de medicamentos vencidos',
    attachments: ['termo_descarte_001.pdf'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 7),
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 4),
    createdBy: 'user003',
    lastUpdatedBy: 'user002'
  }
]

export function useStockMovements(options: UseStockMovementsOptions = {}): UseStockMovementsReturn {
  const {
    autoRefresh = false,
    refreshInterval = 30000,
    enableRealTimeUpdates = false,
    defaultFilters = {}
  } = options

  // State
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Filters and search
  const [filters, setFiltersState] = useState<MovementFilters>(defaultFilters)
  const [sortBy, setSortBy] = useState('movementDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)

  // Initialize data
  useEffect(() => {
    loadMovements()
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

  // Load movements
  const loadMovements = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setMovements(mockMovements)
    } catch (err) {
      setError('Erro ao carregar movimentações')
      console.error('Error loading movements:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort movements
  const filteredMovements = movements
    .filter(movement => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        if (!movement.itemName.toLowerCase().includes(searchLower) &&
            !movement.itemCode.toLowerCase().includes(searchLower) &&
            !movement.reason.toLowerCase().includes(searchLower) &&
            !movement.responsibleName.toLowerCase().includes(searchLower) &&
            !movement.department.toLowerCase().includes(searchLower) &&
            !(movement.reference?.toLowerCase().includes(searchLower)) &&
            !(movement.notes?.toLowerCase().includes(searchLower))) {
          return false
        }
      }
      
      if (filters.itemType && filters.itemType !== 'all' && movement.itemType !== filters.itemType) return false
      if (filters.type && filters.type !== 'all' && movement.type !== filters.type) return false
      if (filters.status && filters.status !== 'all' && movement.status !== filters.status) return false
      if (filters.priority && filters.priority !== 'all' && movement.priority !== filters.priority) return false
      if (filters.department && movement.department !== filters.department) return false
      if (filters.responsible && movement.responsible !== filters.responsible) return false
      if (filters.supplier && movement.supplier !== filters.supplier) return false
      
      if (filters.dateFrom && movement.movementDate < filters.dateFrom) return false
      if (filters.dateTo && movement.movementDate > filters.dateTo) return false
      
      if (filters.amountFrom && Math.abs(movement.totalCost) < filters.amountFrom) return false
      if (filters.amountTo && Math.abs(movement.totalCost) > filters.amountTo) return false
      
      if (filters.hasReference !== undefined) {
        const hasRef = Boolean(movement.reference)
        if (hasRef !== filters.hasReference) return false
      }
      
      if (filters.hasBatch !== undefined) {
        const hasBatch = Boolean(movement.batchNumber)
        if (hasBatch !== filters.hasBatch) return false
      }
      
      if (filters.hasExpiration !== undefined) {
        const hasExp = Boolean(movement.expirationDate)
        if (hasExp !== filters.hasExpiration) return false
      }
      
      if (filters.pendingApproval && movement.status !== 'pending') return false
      
      if (filters.completedToday) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        
        if (!movement.completedDate || 
            movement.completedDate < today || 
            movement.completedDate >= tomorrow) {
          return false
        }
      }
      
      if (filters.thisWeek) {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        if (movement.movementDate < weekAgo) return false
      }
      
      if (filters.thisMonth) {
        const monthAgo = new Date()
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        if (movement.movementDate < monthAgo) return false
      }
      
      return true
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy as keyof StockMovement]
      let bValue: any = b[sortBy as keyof StockMovement]
      
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
  const stats: MovementStats = {
    totalMovements: movements.length,
    totalValue: movements.reduce((sum, m) => sum + Math.abs(m.totalCost), 0),
    pendingMovements: movements.filter(m => m.status === 'pending').length,
    completedMovements: movements.filter(m => m.status === 'completed').length,
    cancelledMovements: movements.filter(m => m.status === 'cancelled').length,
    
    // By type
    inMovements: movements.filter(m => m.type === 'in').length,
    outMovements: movements.filter(m => m.type === 'out').length,
    adjustments: movements.filter(m => m.type === 'adjustment').length,
    transfers: movements.filter(m => m.type === 'transfer').length,
    returns: movements.filter(m => m.type === 'return').length,
    losses: movements.filter(m => m.type === 'loss' || m.type === 'expired' || m.type === 'damaged').length,
    
    // By item type
    medicationMovements: movements.filter(m => m.itemType === 'medication').length,
    equipmentMovements: movements.filter(m => m.itemType === 'equipment').length,
    supplyMovements: movements.filter(m => m.itemType === 'supply').length,
    
    // Financial
    inValue: movements.filter(m => m.type === 'in').reduce((sum, m) => sum + m.totalCost, 0),
    outValue: movements.filter(m => m.type === 'out').reduce((sum, m) => sum + Math.abs(m.totalCost), 0),
    adjustmentValue: movements.filter(m => m.type === 'adjustment').reduce((sum, m) => sum + Math.abs(m.totalCost), 0),
    lossValue: movements.filter(m => ['loss', 'expired', 'damaged'].includes(m.type)).reduce((sum, m) => sum + Math.abs(m.totalCost), 0),
    
    // Time-based
    todayMovements: movements.filter(m => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      return m.movementDate >= today && m.movementDate < tomorrow
    }).length,
    
    weekMovements: movements.filter(m => {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return m.movementDate >= weekAgo
    }).length,
    
    monthMovements: movements.filter(m => {
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      return m.movementDate >= monthAgo
    }).length,
    
    // Performance
    averageProcessingTime: movements
      .filter(m => m.completedDate && m.createdAt)
      .reduce((sum, m) => {
        const processingTime = (m.completedDate!.getTime() - m.createdAt.getTime()) / (1000 * 60 * 60)
        return sum + processingTime
      }, 0) / Math.max(1, movements.filter(m => m.completedDate).length),
    
    pendingApprovals: movements.filter(m => m.status === 'pending' && !m.approvedBy).length
  }

  // Pagination
  const totalPages = Math.ceil(filteredMovements.length / itemsPerPage)
  const paginatedMovements = filteredMovements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Functions
  const setFilters = useCallback((newFilters: Partial<MovementFilters>) => {
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
    await loadMovements()
    setRefreshing(false)
    toast.success('Movimentações atualizadas')
  }, [])

  // CRUD Operations
  const getMovement = useCallback(async (id: string): Promise<StockMovement | null> => {
    try {
      const movement = movements.find(m => m.id === id)
      return movement || null
    } catch (err) {
      console.error('Error getting movement:', err)
      return null
    }
  }, [movements])

  const createMovement = useCallback(async (movementData: Omit<StockMovement, 'id' | 'createdAt' | 'lastUpdated' | 'status'>): Promise<boolean> => {
    try {
      const newMovement: StockMovement = {
        ...movementData,
        id: Date.now().toString(),
        status: 'pending',
        createdAt: new Date(),
        lastUpdated: new Date()
      }
      
      setMovements(prev => [newMovement, ...prev])
      toast.success('Movimentação criada com sucesso')
      return true
    } catch (err) {
      toast.error('Erro ao criar movimentação')
      console.error('Error creating movement:', err)
      return false
    }
  }, [])

  const updateMovement = useCallback(async (id: string, updates: Partial<StockMovement>): Promise<boolean> => {
    try {
      setMovements(prev => prev.map(movement => 
        movement.id === id 
          ? { ...movement, ...updates, lastUpdated: new Date() }
          : movement
      ))
      
      toast.success('Movimentação atualizada com sucesso')
      return true
    } catch (err) {
      toast.error('Erro ao atualizar movimentação')
      console.error('Error updating movement:', err)
      return false
    }
  }, [])

  const deleteMovement = useCallback(async (id: string): Promise<boolean> => {
    try {
      setMovements(prev => prev.filter(movement => movement.id !== id))
      toast.success('Movimentação removida com sucesso')
      return true
    } catch (err) {
      toast.error('Erro ao remover movimentação')
      console.error('Error deleting movement:', err)
      return false
    }
  }, [])

  // Movement Operations
  const approveMovement = useCallback(async (id: string, approvedBy: string): Promise<boolean> => {
    try {
      setMovements(prev => prev.map(movement => 
        movement.id === id 
          ? { 
              ...movement, 
              status: 'approved',
              approvedBy,
              approvedByName: 'Current User', // Would come from user context
              approvalDate: new Date(),
              lastUpdated: new Date()
            }
          : movement
      ))
      
      toast.success('Movimentação aprovada com sucesso')
      return true
    } catch (err) {
      toast.error('Erro ao aprovar movimentação')
      console.error('Error approving movement:', err)
      return false
    }
  }, [])

  const rejectMovement = useCallback(async (id: string, reason: string, rejectedBy: string): Promise<boolean> => {
    try {
      setMovements(prev => prev.map(movement => 
        movement.id === id 
          ? { 
              ...movement, 
              status: 'rejected',
              notes: `${movement.notes || ''} | Rejeitado: ${reason}`,
              lastUpdated: new Date(),
              lastUpdatedBy: rejectedBy
            }
          : movement
      ))
      
      toast.success('Movimentação rejeitada')
      return true
    } catch (err) {
      toast.error('Erro ao rejeitar movimentação')
      console.error('Error rejecting movement:', err)
      return false
    }
  }, [])

  const completeMovement = useCallback(async (id: string, completedBy: string): Promise<boolean> => {
    try {
      setMovements(prev => prev.map(movement => 
        movement.id === id 
          ? { 
              ...movement, 
              status: 'completed',
              completedDate: new Date(),
              lastUpdated: new Date(),
              lastUpdatedBy: completedBy
            }
          : movement
      ))
      
      toast.success('Movimentação concluída com sucesso')
      return true
    } catch (err) {
      toast.error('Erro ao concluir movimentação')
      console.error('Error completing movement:', err)
      return false
    }
  }, [])

  const cancelMovement = useCallback(async (id: string, reason: string, cancelledBy: string): Promise<boolean> => {
    try {
      setMovements(prev => prev.map(movement => 
        movement.id === id 
          ? { 
              ...movement, 
              status: 'cancelled',
              notes: `${movement.notes || ''} | Cancelado: ${reason}`,
              lastUpdated: new Date(),
              lastUpdatedBy: cancelledBy
            }
          : movement
      ))
      
      toast.success('Movimentação cancelada')
      return true
    } catch (err) {
      toast.error('Erro ao cancelar movimentação')
      console.error('Error cancelling movement:', err)
      return false
    }
  }, [])

  // Bulk Operations
  const bulkApprove = useCallback(async (ids: string[], approvedBy: string): Promise<boolean> => {
    try {
      setMovements(prev => prev.map(movement => 
        ids.includes(movement.id) 
          ? { 
              ...movement, 
              status: 'approved',
              approvedBy,
              approvedByName: 'Current User',
              approvalDate: new Date(),
              lastUpdated: new Date()
            }
          : movement
      ))
      
      toast.success(`${ids.length} movimentações aprovadas`)
      return true
    } catch (err) {
      toast.error('Erro na aprovação em massa')
      console.error('Error in bulk approve:', err)
      return false
    }
  }, [])

  const bulkComplete = useCallback(async (ids: string[], completedBy: string): Promise<boolean> => {
    try {
      setMovements(prev => prev.map(movement => 
        ids.includes(movement.id) 
          ? { 
              ...movement, 
              status: 'completed',
              completedDate: new Date(),
              lastUpdated: new Date(),
              lastUpdatedBy: completedBy
            }
          : movement
      ))
      
      toast.success(`${ids.length} movimentações concluídas`)
      return true
    } catch (err) {
      toast.error('Erro na conclusão em massa')
      console.error('Error in bulk complete:', err)
      return false
    }
  }, [])

  const bulkCancel = useCallback(async (ids: string[], reason: string, cancelledBy: string): Promise<boolean> => {
    try {
      setMovements(prev => prev.map(movement => 
        ids.includes(movement.id) 
          ? { 
              ...movement, 
              status: 'cancelled',
              notes: `${movement.notes || ''} | Cancelado em massa: ${reason}`,
              lastUpdated: new Date(),
              lastUpdatedBy: cancelledBy
            }
          : movement
      ))
      
      toast.success(`${ids.length} movimentações canceladas`)
      return true
    } catch (err) {
      toast.error('Erro no cancelamento em massa')
      console.error('Error in bulk cancel:', err)
      return false
    }
  }, [])

  // Utility Functions
  const exportData = useCallback((format: 'csv' | 'excel' | 'pdf' = 'csv') => {
    try {
      const data = filteredMovements.map(movement => ({
        ID: movement.id,
        'Código do Item': movement.itemCode,
        'Nome do Item': movement.itemName,
        'Tipo do Item': movement.itemType,
        'Tipo de Movimentação': movement.type,
        Motivo: movement.reason,
        Referência: movement.reference,
        Quantidade: movement.quantity,
        'Estoque Anterior': movement.previousStock,
        'Novo Estoque': movement.newStock,
        'Localização Origem': movement.fromLocation,
        'Localização Destino': movement.toLocation,
        'Localização Atual': movement.currentLocation,
        'Custo Unitário': movement.unitCost,
        'Custo Total': movement.totalCost,
        'Número do Lote': movement.batchNumber,
        Lote: movement.lotNumber,
        'Data de Validade': movement.expirationDate?.toLocaleDateString('pt-BR'),
        Responsável: movement.responsibleName,
        'Aprovado Por': movement.approvedByName,
        'Data de Aprovação': movement.approvalDate?.toLocaleDateString('pt-BR'),
        Status: movement.status,
        Prioridade: movement.priority,
        'Data da Movimentação': movement.movementDate.toLocaleDateString('pt-BR'),
        'Data Agendada': movement.scheduledDate?.toLocaleDateString('pt-BR'),
        'Data de Conclusão': movement.completedDate?.toLocaleDateString('pt-BR'),
        Departamento: movement.department,
        Fornecedor: movement.supplier,
        'Paciente': movement.patient?.name,
        'Prescrição': movement.prescription?.number,
        Observações: movement.notes
      }))
      
      console.log(`Exporting ${data.length} movements in ${format} format:`, data)
      toast.success(`Dados exportados em formato ${format.toUpperCase()}`)
      
      return data
    } catch (err) {
      toast.error('Erro ao exportar dados')
      console.error('Error exporting data:', err)
      return []
    }
  }, [filteredMovements])

  const importData = useCallback(async (data: any[]): Promise<boolean> => {
    try {
      const processedData = data.map((item, index) => {
        if (!item.itemId || !item.type || !item.quantity) {
          throw new Error(`Movimentação na linha ${index + 1} está incompleta`)
        }
        
        return {
          id: Date.now().toString() + index,
          itemId: item.itemId,
          itemCode: item.itemCode || '',
          itemName: item.itemName || '',
          itemType: item.itemType || 'supply',
          type: item.type,
          reason: item.reason || '',
          reference: item.reference,
          quantity: Number(item.quantity),
          previousStock: Number(item.previousStock) || 0,
          newStock: Number(item.newStock) || 0,
          fromLocation: item.fromLocation,
          toLocation: item.toLocation,
          currentLocation: item.currentLocation || item.toLocation || '',
          unitCost: Number(item.unitCost) || 0,
          totalCost: Number(item.totalCost) || 0,
          batchNumber: item.batchNumber,
          lotNumber: item.lotNumber,
          expirationDate: item.expirationDate ? new Date(item.expirationDate) : undefined,
          responsible: item.responsible || 'import',
          responsibleName: item.responsibleName || 'Importação',
          status: item.status || 'pending',
          priority: item.priority || 'medium',
          movementDate: item.movementDate ? new Date(item.movementDate) : new Date(),
          scheduledDate: item.scheduledDate ? new Date(item.scheduledDate) : undefined,
          department: item.department || '',
          supplier: item.supplier,
          notes: item.notes,
          createdAt: new Date(),
          lastUpdated: new Date(),
          createdBy: 'import',
          lastUpdatedBy: 'import'
        } as StockMovement
      })
      
      setMovements(prev => [...processedData, ...prev])
      toast.success(`${processedData.length} movimentações importadas`)
      
      return true
    } catch (err) {
      toast.error(`Erro ao importar dados: ${err instanceof Error ? err.message : 'Erro desconhecido'}`)
      console.error('Error importing data:', err)
      return false
    }
  }, [])

  // Search and filter helpers
  const searchMovements = useCallback((query: string) => {
    setFilters({ search: query })
  }, [setFilters])

  const getMovementsByItem = useCallback((itemId: string) => {
    return movements.filter(movement => movement.itemId === itemId)
  }, [movements])

  const getMovementsByType = useCallback((type: StockMovement['type']) => {
    return movements.filter(movement => movement.type === type)
  }, [movements])

  const getMovementsByDepartment = useCallback((department: string) => {
    return movements.filter(movement => movement.department === department)
  }, [movements])

  const getPendingMovements = useCallback(() => {
    return movements.filter(movement => movement.status === 'pending')
  }, [movements])

  const getRecentMovements = useCallback((days: number = 7) => {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    return movements.filter(movement => movement.movementDate >= cutoffDate)
  }, [movements])

  const getMovementsByDateRange = useCallback((from: Date, to: Date) => {
    return movements.filter(movement => 
      movement.movementDate >= from && movement.movementDate <= to
    )
  }, [movements])

  const getHighValueMovements = useCallback((minValue: number = 1000) => {
    return movements.filter(movement => Math.abs(movement.totalCost) >= minValue)
  }, [movements])

  return {
    // Data
    movements: paginatedMovements,
    allMovements: movements,
    filteredMovements,
    stats,
    
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
    
    // CRUD operations
    getMovement,
    createMovement,
    updateMovement,
    deleteMovement,
    
    // Movement operations
    approveMovement,
    rejectMovement,
    completeMovement,
    cancelMovement,
    
    // Bulk operations
    bulkApprove,
    bulkComplete,
    bulkCancel,
    
    // Utility functions
    exportData,
    importData,
    
    // Search and filter helpers
    searchMovements,
    getMovementsByItem,
    getMovementsByType,
    getMovementsByDepartment,
    getPendingMovements,
    getRecentMovements,
    getMovementsByDateRange,
    getHighValueMovements
  }
}