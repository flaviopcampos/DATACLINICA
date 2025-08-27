'use client'

import { useState, useEffect, useCallback } from 'react'

// Interface para suprimentos
interface Supply {
  id: string
  name: string
  description?: string
  category: 'consumable' | 'disposable' | 'reusable' | 'implant' | 'prosthetic' | 'orthotic' | 'other'
  subcategory?: string
  brand?: string
  manufacturer?: string
  model?: string
  partNumber?: string
  barcode?: string
  currentStock: number
  minStock: number
  maxStock: number
  unit: 'unit' | 'box' | 'pack' | 'bottle' | 'tube' | 'roll' | 'sheet' | 'meter' | 'liter' | 'kg' | 'gram'
  unitCost: number
  totalValue: number
  supplier?: string
  location: string
  department: string
  expiryDate?: string
  batchNumber?: string
  sterile: boolean
  singleUse: boolean
  requiresPrescription: boolean
  controlledSubstance: boolean
  hazardous: boolean
  storageConditions?: string
  temperature?: {
    min: number
    max: number
    unit: 'celsius' | 'fahrenheit'
  }
  humidity?: {
    min: number
    max: number
  }
  status: 'available' | 'low_stock' | 'out_of_stock' | 'expired' | 'recalled' | 'quarantine'
  criticality: 'low' | 'medium' | 'high' | 'critical'
  lastRestocked?: string
  lastUsed?: string
  usageFrequency: 'daily' | 'weekly' | 'monthly' | 'occasional' | 'rare'
  notes?: string
  attachments?: string[]
  createdAt: string
  lastUpdated: string
}

interface SupplyMovement {
  id: string
  supplyId: string
  supplyName: string
  type: 'receipt' | 'consumption' | 'transfer' | 'adjustment' | 'return' | 'disposal' | 'expiry'
  quantity: number
  unit: string
  fromLocation?: string
  toLocation?: string
  reason: string
  performedBy: string
  cost?: number
  batchNumber?: string
  expiryDate?: string
  notes?: string
  timestamp: string
  attachments?: string[]
}

interface SupplyAlert {
  id: string
  supplyId: string
  supplyName: string
  type: 'low_stock' | 'out_of_stock' | 'expiring' | 'expired' | 'recall' | 'temperature_breach' | 'quality_issue'
  priority: 'low' | 'medium' | 'high' | 'critical'
  message: string
  threshold?: number
  currentValue?: number
  dueDate?: string
  createdAt: string
  isRead: boolean
  isResolved: boolean
}

interface SupplyOrder {
  id: string
  supplyId: string
  supplyName: string
  quantity: number
  unit: string
  unitCost: number
  totalCost: number
  supplier: string
  orderDate: string
  expectedDelivery?: string
  actualDelivery?: string
  status: 'pending' | 'ordered' | 'shipped' | 'delivered' | 'cancelled'
  notes?: string
}

interface SupplyStats {
  totalSupplies: number
  totalValue: number
  availableCount: number
  lowStockCount: number
  outOfStockCount: number
  expiredCount: number
  expiringCount: number
  criticalCount: number
  categoriesDistribution: Record<string, number>
  departmentsDistribution: Record<string, number>
  consumptionRate: number
  turnoverRate: number
  stockAccuracy: number
}

interface UseSuppliesReturn {
  // Estado
  supplies: Supply[]
  stats: SupplyStats
  movements: SupplyMovement[]
  alerts: SupplyAlert[]
  orders: SupplyOrder[]
  loading: boolean
  error: string | null
  
  // Ações CRUD
  addSupply: (supply: Omit<Supply, 'id' | 'totalValue' | 'status' | 'createdAt' | 'lastUpdated'>) => Promise<void>
  updateSupply: (id: string, updates: Partial<Supply>) => Promise<void>
  deleteSupply: (id: string) => Promise<void>
  
  // Gestão de estoque
  updateStock: (id: string, quantity: number, reason: string, type: 'receipt' | 'consumption' | 'adjustment') => Promise<void>
  consumeSupply: (id: string, quantity: number, reason: string) => Promise<void>
  receiveSupply: (id: string, quantity: number, batchNumber?: string, expiryDate?: string) => Promise<void>
  transferSupply: (id: string, quantity: number, fromLocation: string, toLocation: string, reason: string) => Promise<void>
  
  // Movimentações
  getSupplyMovements: (supplyId: string) => SupplyMovement[]
  addMovement: (movement: Omit<SupplyMovement, 'id' | 'timestamp'>) => Promise<void>
  
  // Alertas
  markAlertAsRead: (alertId: string) => Promise<void>
  markAlertAsResolved: (alertId: string) => Promise<void>
  dismissAlert: (alertId: string) => Promise<void>
  
  // Pedidos
  createOrder: (order: Omit<SupplyOrder, 'id' | 'orderDate' | 'status'>) => Promise<void>
  updateOrderStatus: (orderId: string, status: SupplyOrder['status']) => Promise<void>
  receiveOrder: (orderId: string, actualDelivery: string) => Promise<void>
  
  // Filtros e busca
  searchSupplies: (query: string) => Supply[]
  filterByCategory: (category: Supply['category']) => Supply[]
  filterByDepartment: (department: string) => Supply[]
  filterByStatus: (status: Supply['status']) => Supply[]
  filterByCriticality: (criticality: Supply['criticality']) => Supply[]
  filterByExpiry: (days: number) => Supply[]
  
  // Relatórios
  getConsumptionReport: (startDate: string, endDate: string) => SupplyMovement[]
  getExpiryReport: (days?: number) => Supply[]
  getLowStockReport: () => Supply[]
  getUsageAnalytics: (supplyId: string) => any
  
  // Utilitários
  refreshData: () => Promise<void>
  exportSupplies: (format: 'csv' | 'excel' | 'pdf') => Promise<void>
  generateReport: (type: 'inventory' | 'consumption' | 'expiry' | 'orders') => Promise<any>
  calculateReorderPoint: (supplyId: string) => number
  predictStockout: (supplyId: string) => { date: string; confidence: number } | null
}

// Mock data para demonstração
const mockSupplies: Supply[] = [
  {
    id: '1',
    name: 'Seringa Descartável 10ml',
    description: 'Seringa descartável estéril com agulha',
    category: 'disposable',
    subcategory: 'Seringas',
    brand: 'BD',
    manufacturer: 'Becton Dickinson',
    model: 'BD-10ML',
    partNumber: 'BD309604',
    barcode: '7891234567890',
    currentStock: 150,
    minStock: 50,
    maxStock: 500,
    unit: 'unit',
    unitCost: 2.50,
    totalValue: 375.00,
    supplier: 'MedSupply Ltda',
    location: 'Almoxarifado - Prateleira A1',
    department: 'Enfermagem',
    expiryDate: '2025-12-31',
    batchNumber: 'BD240115',
    sterile: true,
    singleUse: true,
    requiresPrescription: false,
    controlledSubstance: false,
    hazardous: false,
    storageConditions: 'Temperatura ambiente, local seco',
    temperature: {
      min: 15,
      max: 30,
      unit: 'celsius'
    },
    humidity: {
      min: 30,
      max: 70
    },
    status: 'available',
    criticality: 'high',
    lastRestocked: '2024-01-15T10:00:00Z',
    lastUsed: '2024-01-20T14:30:00Z',
    usageFrequency: 'daily',
    notes: 'Item de alto consumo',
    createdAt: '2024-01-01T00:00:00Z',
    lastUpdated: '2024-01-20T16:00:00Z'
  },
  {
    id: '2',
    name: 'Luvas Cirúrgicas Estéreis',
    description: 'Luvas cirúrgicas de látex estéreis',
    category: 'disposable',
    subcategory: 'EPIs',
    brand: 'Sempermed',
    manufacturer: 'Sempermed Brasil',
    model: 'Supreme',
    partNumber: 'SMP-7.5',
    barcode: '7891234567891',
    currentStock: 25,
    minStock: 50,
    maxStock: 200,
    unit: 'box',
    unitCost: 45.00,
    totalValue: 1125.00,
    supplier: 'Cirúrgica São Paulo',
    location: 'Almoxarifado - Prateleira B2',
    department: 'Centro Cirúrgico',
    expiryDate: '2026-06-30',
    batchNumber: 'SMP240201',
    sterile: true,
    singleUse: true,
    requiresPrescription: false,
    controlledSubstance: false,
    hazardous: false,
    storageConditions: 'Local seco, protegido da luz',
    temperature: {
      min: 10,
      max: 25,
      unit: 'celsius'
    },
    humidity: {
      min: 20,
      max: 60
    },
    status: 'low_stock',
    criticality: 'critical',
    lastRestocked: '2024-01-10T08:00:00Z',
    lastUsed: '2024-01-20T09:15:00Z',
    usageFrequency: 'daily',
    notes: 'Estoque baixo - solicitar reposição urgente',
    createdAt: '2024-01-01T00:00:00Z',
    lastUpdated: '2024-01-20T16:00:00Z'
  },
  {
    id: '3',
    name: 'Cateter Venoso Central',
    description: 'Cateter venoso central triplo lúmen',
    category: 'implant',
    subcategory: 'Cateteres',
    brand: 'Arrow',
    manufacturer: 'Arrow International',
    model: 'Triple Lumen',
    partNumber: 'ARW-7FR-20CM',
    barcode: '7891234567892',
    currentStock: 8,
    minStock: 5,
    maxStock: 20,
    unit: 'unit',
    unitCost: 180.00,
    totalValue: 1440.00,
    supplier: 'Vascular Tech',
    location: 'UTI - Armário de Materiais',
    department: 'UTI',
    expiryDate: '2027-03-15',
    batchNumber: 'ARW240105',
    sterile: true,
    singleUse: true,
    requiresPrescription: true,
    controlledSubstance: false,
    hazardous: false,
    storageConditions: 'Temperatura controlada, estéril',
    temperature: {
      min: 2,
      max: 8,
      unit: 'celsius'
    },
    humidity: {
      min: 40,
      max: 60
    },
    status: 'available',
    criticality: 'critical',
    lastRestocked: '2024-01-05T12:00:00Z',
    lastUsed: '2024-01-18T16:45:00Z',
    usageFrequency: 'weekly',
    notes: 'Material de alto custo - controle rigoroso',
    createdAt: '2024-01-01T00:00:00Z',
    lastUpdated: '2024-01-20T16:00:00Z'
  }
]

const mockMovements: SupplyMovement[] = [
  {
    id: '1',
    supplyId: '1',
    supplyName: 'Seringa Descartável 10ml',
    type: 'consumption',
    quantity: 10,
    unit: 'unit',
    toLocation: 'UTI - Leito 01',
    reason: 'Administração de medicamentos',
    performedBy: 'Enfermeira Maria',
    batchNumber: 'BD240115',
    timestamp: '2024-01-20T14:30:00Z'
  },
  {
    id: '2',
    supplyId: '2',
    supplyName: 'Luvas Cirúrgicas Estéreis',
    type: 'consumption',
    quantity: 2,
    unit: 'box',
    toLocation: 'Centro Cirúrgico - Sala 1',
    reason: 'Procedimento cirúrgico',
    performedBy: 'Dr. João Santos',
    batchNumber: 'SMP240201',
    timestamp: '2024-01-20T09:15:00Z'
  }
]

const mockAlerts: SupplyAlert[] = [
  {
    id: '1',
    supplyId: '2',
    supplyName: 'Luvas Cirúrgicas Estéreis',
    type: 'low_stock',
    priority: 'critical',
    message: 'Estoque abaixo do mínimo (25/50)',
    threshold: 50,
    currentValue: 25,
    createdAt: '2024-01-20T16:00:00Z',
    isRead: false,
    isResolved: false
  }
]

const mockOrders: SupplyOrder[] = [
  {
    id: '1',
    supplyId: '2',
    supplyName: 'Luvas Cirúrgicas Estéreis',
    quantity: 100,
    unit: 'box',
    unitCost: 45.00,
    totalCost: 4500.00,
    supplier: 'Cirúrgica São Paulo',
    orderDate: '2024-01-20T17:00:00Z',
    expectedDelivery: '2024-01-25T00:00:00Z',
    status: 'ordered',
    notes: 'Pedido urgente devido ao estoque baixo'
  }
]

export function useSupplies(): UseSuppliesReturn {
  const [supplies, setSupplies] = useState<Supply[]>(mockSupplies)
  const [movements, setMovements] = useState<SupplyMovement[]>(mockMovements)
  const [alerts, setAlerts] = useState<SupplyAlert[]>(mockAlerts)
  const [orders, setOrders] = useState<SupplyOrder[]>(mockOrders)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calcular estatísticas
  const stats: SupplyStats = {
    totalSupplies: supplies.length,
    totalValue: supplies.reduce((sum, supply) => sum + supply.totalValue, 0),
    availableCount: supplies.filter(supply => supply.status === 'available').length,
    lowStockCount: supplies.filter(supply => supply.status === 'low_stock').length,
    outOfStockCount: supplies.filter(supply => supply.status === 'out_of_stock').length,
    expiredCount: supplies.filter(supply => supply.status === 'expired').length,
    expiringCount: supplies.filter(supply => {
      if (!supply.expiryDate) return false
      const expiry = new Date(supply.expiryDate)
      const today = new Date()
      const diffTime = expiry.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays <= 30 && diffDays > 0
    }).length,
    criticalCount: supplies.filter(supply => supply.criticality === 'critical').length,
    categoriesDistribution: supplies.reduce((acc, supply) => {
      acc[supply.category] = (acc[supply.category] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    departmentsDistribution: supplies.reduce((acc, supply) => {
      acc[supply.department] = (acc[supply.department] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    consumptionRate: movements.filter(m => m.type === 'consumption').length,
    turnoverRate: supplies.length > 0 ? 
      movements.filter(m => m.type === 'consumption').length / supplies.length : 0,
    stockAccuracy: 95.5 // Simulado
  }

  // Adicionar suprimento
  const addSupply = useCallback(async (newSupply: Omit<Supply, 'id' | 'totalValue' | 'status' | 'createdAt' | 'lastUpdated'>) => {
    setLoading(true)
    setError(null)
    
    try {
      const supply: Supply = {
        ...newSupply,
        id: Date.now().toString(),
        totalValue: newSupply.currentStock * newSupply.unitCost,
        status: newSupply.currentStock <= newSupply.minStock ? 'low_stock' : 'available',
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      }
      
      setSupplies(prev => [...prev, supply])
      
      // Adicionar movimento de entrada inicial
      await addMovement({
        supplyId: supply.id,
        supplyName: supply.name,
        type: 'receipt',
        quantity: supply.currentStock,
        unit: supply.unit,
        toLocation: supply.location,
        reason: 'Cadastro inicial do suprimento',
        performedBy: 'Sistema',
        cost: supply.totalValue,
        batchNumber: supply.batchNumber,
        expiryDate: supply.expiryDate
      })
      
    } catch (err) {
      setError('Erro ao adicionar suprimento')
      console.error('Erro ao adicionar suprimento:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Atualizar suprimento
  const updateSupply = useCallback(async (id: string, updates: Partial<Supply>) => {
    setLoading(true)
    setError(null)
    
    try {
      setSupplies(prev => prev.map(supply => {
        if (supply.id === id) {
          const updated = { ...supply, ...updates, lastUpdated: new Date().toISOString() }
          
          // Recalcular valor total se necessário
          if (updates.currentStock !== undefined || updates.unitCost !== undefined) {
            updated.totalValue = updated.currentStock * updated.unitCost
          }
          
          // Atualizar status baseado no estoque
          if (updates.currentStock !== undefined) {
            if (updated.currentStock <= 0) {
              updated.status = 'out_of_stock'
            } else if (updated.currentStock <= updated.minStock) {
              updated.status = 'low_stock'
            } else {
              updated.status = 'available'
            }
          }
          
          // Verificar se está vencido
          if (updated.expiryDate) {
            const expiry = new Date(updated.expiryDate)
            const today = new Date()
            if (expiry < today) {
              updated.status = 'expired'
            }
          }
          
          return updated
        }
        return supply
      }))
    } catch (err) {
      setError('Erro ao atualizar suprimento')
      console.error('Erro ao atualizar suprimento:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Deletar suprimento
  const deleteSupply = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      setSupplies(prev => prev.filter(supply => supply.id !== id))
      setMovements(prev => prev.filter(movement => movement.supplyId !== id))
      setAlerts(prev => prev.filter(alert => alert.supplyId !== id))
      setOrders(prev => prev.filter(order => order.supplyId !== id))
    } catch (err) {
      setError('Erro ao deletar suprimento')
      console.error('Erro ao deletar suprimento:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Atualizar estoque
  const updateStock = useCallback(async (id: string, quantity: number, reason: string, type: 'receipt' | 'consumption' | 'adjustment') => {
    setLoading(true)
    setError(null)
    
    try {
      const supply = supplies.find(s => s.id === id)
      if (!supply) throw new Error('Suprimento não encontrado')
      
      let newStock = supply.currentStock
      
      switch (type) {
        case 'receipt':
          newStock += quantity
          break
        case 'consumption':
          newStock -= quantity
          break
        case 'adjustment':
          newStock = quantity // Ajuste absoluto
          break
      }
      
      if (newStock < 0) {
        throw new Error('Estoque não pode ser negativo')
      }
      
      await updateSupply(id, { 
        currentStock: newStock,
        lastUsed: type === 'consumption' ? new Date().toISOString() : supply.lastUsed,
        lastRestocked: type === 'receipt' ? new Date().toISOString() : supply.lastRestocked
      })
      
      // Adicionar movimento
      await addMovement({
        supplyId: id,
        supplyName: supply.name,
        type,
        quantity: Math.abs(quantity),
        unit: supply.unit,
        reason,
        performedBy: 'Sistema',
        cost: type === 'receipt' ? quantity * supply.unitCost : undefined
      })
      
    } catch (err) {
      setError('Erro ao atualizar estoque')
      console.error('Erro ao atualizar estoque:', err)
    } finally {
      setLoading(false)
    }
  }, [supplies, updateSupply])

  // Consumir suprimento
  const consumeSupply = useCallback(async (id: string, quantity: number, reason: string) => {
    await updateStock(id, quantity, reason, 'consumption')
  }, [updateStock])

  // Receber suprimento
  const receiveSupply = useCallback(async (id: string, quantity: number, batchNumber?: string, expiryDate?: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const updates: Partial<Supply> = {}
      if (batchNumber) updates.batchNumber = batchNumber
      if (expiryDate) updates.expiryDate = expiryDate
      
      if (Object.keys(updates).length > 0) {
        await updateSupply(id, updates)
      }
      
      await updateStock(id, quantity, 'Recebimento de estoque', 'receipt')
      
    } catch (err) {
      setError('Erro ao receber suprimento')
      console.error('Erro ao receber suprimento:', err)
    } finally {
      setLoading(false)
    }
  }, [updateSupply, updateStock])

  // Transferir suprimento
  const transferSupply = useCallback(async (id: string, quantity: number, fromLocation: string, toLocation: string, reason: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const supply = supplies.find(s => s.id === id)
      if (!supply) throw new Error('Suprimento não encontrado')
      
      if (supply.currentStock < quantity) {
        throw new Error('Quantidade insuficiente em estoque')
      }
      
      // Adicionar movimento de transferência
      await addMovement({
        supplyId: id,
        supplyName: supply.name,
        type: 'transfer',
        quantity,
        unit: supply.unit,
        fromLocation,
        toLocation,
        reason,
        performedBy: 'Sistema'
      })
      
      // Atualizar localização se necessário
      if (supply.location === fromLocation) {
        await updateSupply(id, { location: toLocation })
      }
      
    } catch (err) {
      setError('Erro ao transferir suprimento')
      console.error('Erro ao transferir suprimento:', err)
    } finally {
      setLoading(false)
    }
  }, [supplies, updateSupply])

  // Obter movimentações de um suprimento
  const getSupplyMovements = useCallback((supplyId: string) => {
    return movements.filter(movement => movement.supplyId === supplyId)
  }, [movements])

  // Adicionar movimentação
  const addMovement = useCallback(async (newMovement: Omit<SupplyMovement, 'id' | 'timestamp'>) => {
    try {
      const movement: SupplyMovement = {
        ...newMovement,
        id: Date.now().toString(),
        timestamp: new Date().toISOString()
      }
      
      setMovements(prev => [movement, ...prev])
    } catch (err) {
      console.error('Erro ao adicionar movimentação:', err)
    }
  }, [])

  // Marcar alerta como lido
  const markAlertAsRead = useCallback(async (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ))
  }, [])

  // Marcar alerta como resolvido
  const markAlertAsResolved = useCallback(async (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isResolved: true, isRead: true } : alert
    ))
  }, [])

  // Dispensar alerta
  const dismissAlert = useCallback(async (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId))
  }, [])

  // Criar pedido
  const createOrder = useCallback(async (newOrder: Omit<SupplyOrder, 'id' | 'orderDate' | 'status'>) => {
    setLoading(true)
    setError(null)
    
    try {
      const order: SupplyOrder = {
        ...newOrder,
        id: Date.now().toString(),
        orderDate: new Date().toISOString(),
        status: 'pending'
      }
      
      setOrders(prev => [order, ...prev])
      
    } catch (err) {
      setError('Erro ao criar pedido')
      console.error('Erro ao criar pedido:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Atualizar status do pedido
  const updateOrderStatus = useCallback(async (orderId: string, status: SupplyOrder['status']) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status } : order
    ))
  }, [])

  // Receber pedido
  const receiveOrder = useCallback(async (orderId: string, actualDelivery: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const order = orders.find(o => o.id === orderId)
      if (!order) throw new Error('Pedido não encontrado')
      
      // Atualizar status do pedido
      await updateOrderStatus(orderId, 'delivered')
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, actualDelivery } : o
      ))
      
      // Adicionar ao estoque
      await receiveSupply(order.supplyId, order.quantity)
      
    } catch (err) {
      setError('Erro ao receber pedido')
      console.error('Erro ao receber pedido:', err)
    } finally {
      setLoading(false)
    }
  }, [orders, updateOrderStatus, receiveSupply])

  // Buscar suprimentos
  const searchSupplies = useCallback((query: string) => {
    if (!query.trim()) return supplies
    
    const lowercaseQuery = query.toLowerCase()
    return supplies.filter(supply => 
      supply.name.toLowerCase().includes(lowercaseQuery) ||
      supply.description?.toLowerCase().includes(lowercaseQuery) ||
      supply.brand?.toLowerCase().includes(lowercaseQuery) ||
      supply.manufacturer?.toLowerCase().includes(lowercaseQuery) ||
      supply.partNumber?.toLowerCase().includes(lowercaseQuery) ||
      supply.barcode?.toLowerCase().includes(lowercaseQuery)
    )
  }, [supplies])

  // Filtrar por categoria
  const filterByCategory = useCallback((category: Supply['category']) => {
    return supplies.filter(supply => supply.category === category)
  }, [supplies])

  // Filtrar por departamento
  const filterByDepartment = useCallback((department: string) => {
    return supplies.filter(supply => supply.department === department)
  }, [supplies])

  // Filtrar por status
  const filterByStatus = useCallback((status: Supply['status']) => {
    return supplies.filter(supply => supply.status === status)
  }, [supplies])

  // Filtrar por criticidade
  const filterByCriticality = useCallback((criticality: Supply['criticality']) => {
    return supplies.filter(supply => supply.criticality === criticality)
  }, [supplies])

  // Filtrar por validade
  const filterByExpiry = useCallback((days: number) => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + days)
    
    return supplies.filter(supply => {
      if (!supply.expiryDate) return false
      const expiry = new Date(supply.expiryDate)
      return expiry <= futureDate
    })
  }, [supplies])

  // Relatório de consumo
  const getConsumptionReport = useCallback((startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    return movements.filter(movement => {
      const movementDate = new Date(movement.timestamp)
      return movement.type === 'consumption' && 
             movementDate >= start && 
             movementDate <= end
    })
  }, [movements])

  // Relatório de validade
  const getExpiryReport = useCallback((days: number = 30) => {
    return filterByExpiry(days)
  }, [filterByExpiry])

  // Relatório de estoque baixo
  const getLowStockReport = useCallback(() => {
    return supplies.filter(supply => 
      supply.status === 'low_stock' || supply.status === 'out_of_stock'
    )
  }, [supplies])

  // Análise de uso
  const getUsageAnalytics = useCallback((supplyId: string) => {
    const supply = supplies.find(s => s.id === supplyId)
    if (!supply) return null
    
    const supplyMovements = getSupplyMovements(supplyId)
    const consumptionMovements = supplyMovements.filter(m => m.type === 'consumption')
    
    const totalConsumed = consumptionMovements.reduce((sum, m) => sum + m.quantity, 0)
    const averageConsumption = consumptionMovements.length > 0 ? 
      totalConsumed / consumptionMovements.length : 0
    
    return {
      supply,
      totalConsumed,
      averageConsumption,
      consumptionFrequency: consumptionMovements.length,
      lastConsumption: consumptionMovements[0]?.timestamp,
      projectedStockout: calculateReorderPoint(supplyId)
    }
  }, [supplies, getSupplyMovements])

  // Calcular ponto de reposição
  const calculateReorderPoint = useCallback((supplyId: string) => {
    const supply = supplies.find(s => s.id === supplyId)
    if (!supply) return 0
    
    const supplyMovements = getSupplyMovements(supplyId)
    const consumptionMovements = supplyMovements.filter(m => m.type === 'consumption')
    
    if (consumptionMovements.length === 0) return supply.minStock
    
    // Calcular consumo médio diário
    const totalConsumed = consumptionMovements.reduce((sum, m) => sum + m.quantity, 0)
    const daysOfData = consumptionMovements.length > 1 ? 
      Math.ceil((new Date(consumptionMovements[0].timestamp).getTime() - 
                new Date(consumptionMovements[consumptionMovements.length - 1].timestamp).getTime()) / 
               (1000 * 60 * 60 * 24)) : 1
    
    const dailyConsumption = totalConsumed / daysOfData
    
    // Ponto de reposição = consumo médio diário × lead time + estoque de segurança
    const leadTimeDays = 7 // Assumindo 7 dias de lead time
    const safetyStock = supply.minStock
    
    return Math.ceil(dailyConsumption * leadTimeDays + safetyStock)
  }, [supplies, getSupplyMovements])

  // Prever falta de estoque
  const predictStockout = useCallback((supplyId: string) => {
    const supply = supplies.find(s => s.id === supplyId)
    if (!supply) return null
    
    const supplyMovements = getSupplyMovements(supplyId)
    const consumptionMovements = supplyMovements.filter(m => m.type === 'consumption')
    
    if (consumptionMovements.length < 3) return null // Dados insuficientes
    
    // Calcular consumo médio diário
    const totalConsumed = consumptionMovements.reduce((sum, m) => sum + m.quantity, 0)
    const daysOfData = Math.ceil((new Date(consumptionMovements[0].timestamp).getTime() - 
                                 new Date(consumptionMovements[consumptionMovements.length - 1].timestamp).getTime()) / 
                                (1000 * 60 * 60 * 24))
    
    const dailyConsumption = totalConsumed / daysOfData
    
    if (dailyConsumption <= 0) return null
    
    const daysUntilStockout = supply.currentStock / dailyConsumption
    const stockoutDate = new Date()
    stockoutDate.setDate(stockoutDate.getDate() + Math.floor(daysUntilStockout))
    
    // Calcular confiança baseada na consistência do consumo
    const consumptionVariance = consumptionMovements.reduce((sum, m) => {
      const deviation = m.quantity - (totalConsumed / consumptionMovements.length)
      return sum + (deviation * deviation)
    }, 0) / consumptionMovements.length
    
    const confidence = Math.max(0.3, Math.min(0.95, 1 - (consumptionVariance / (dailyConsumption * dailyConsumption))))
    
    return {
      date: stockoutDate.toISOString(),
      confidence: Math.round(confidence * 100) / 100
    }
  }, [supplies, getSupplyMovements])

  // Atualizar dados
  const refreshData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Simular chamada à API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Em uma implementação real, aqui faria as chamadas para a API
      // setSupplies(await suppliesService.getSupplies())
      // setMovements(await suppliesService.getMovements())
      // setAlerts(await suppliesService.getAlerts())
      // setOrders(await suppliesService.getOrders())
      
    } catch (err) {
      setError('Erro ao atualizar dados')
      console.error('Erro ao atualizar dados:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Exportar suprimentos
  const exportSupplies = useCallback(async (format: 'csv' | 'excel' | 'pdf') => {
    setLoading(true)
    setError(null)
    
    try {
      // Simular exportação
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log(`Exportando suprimentos em formato ${format}`)
      
    } catch (err) {
      setError('Erro ao exportar suprimentos')
      console.error('Erro ao exportar suprimentos:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Gerar relatório
  const generateReport = useCallback(async (type: 'inventory' | 'consumption' | 'expiry' | 'orders') => {
    setLoading(true)
    setError(null)
    
    try {
      // Simular geração de relatório
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      let reportData
      switch (type) {
        case 'inventory':
          reportData = { supplies, stats }
          break
        case 'consumption':
          reportData = { 
            movements: movements.filter(m => m.type === 'consumption'),
            totalConsumption: movements.filter(m => m.type === 'consumption')
              .reduce((sum, m) => sum + (m.cost || 0), 0)
          }
          break
        case 'expiry':
          reportData = { 
            expiringSupplies: getExpiryReport(30),
            expiredSupplies: supplies.filter(s => s.status === 'expired')
          }
          break
        case 'orders':
          reportData = { 
            orders,
            totalOrderValue: orders.reduce((sum, o) => sum + o.totalCost, 0)
          }
          break
        default:
          reportData = {}
      }
      
      return reportData
      
    } catch (err) {
      setError('Erro ao gerar relatório')
      console.error('Erro ao gerar relatório:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [supplies, stats, movements, orders, getExpiryReport])

  // Verificar alertas automaticamente
  useEffect(() => {
    const checkAlerts = () => {
      const newAlerts: SupplyAlert[] = []
      const today = new Date()
      
      supplies.forEach(supply => {
        // Verificar estoque baixo
        if (supply.currentStock <= supply.minStock && supply.status !== 'out_of_stock') {
          const existingAlert = alerts.find(alert => 
            alert.supplyId === supply.id && 
            alert.type === 'low_stock' && 
            !alert.isResolved
          )
          
          if (!existingAlert) {
            newAlerts.push({
              id: `alert-stock-${Date.now()}-${supply.id}`,
              supplyId: supply.id,
              supplyName: supply.name,
              type: supply.currentStock === 0 ? 'out_of_stock' : 'low_stock',
              priority: supply.criticality === 'critical' ? 'critical' : 'high',
              message: supply.currentStock === 0 ? 
                'Estoque esgotado' : 
                `Estoque baixo (${supply.currentStock}/${supply.minStock})`,
              threshold: supply.minStock,
              currentValue: supply.currentStock,
              createdAt: new Date().toISOString(),
              isRead: false,
              isResolved: false
            })
          }
        }
        
        // Verificar validade
        if (supply.expiryDate) {
          const expiry = new Date(supply.expiryDate)
          const diffTime = expiry.getTime() - today.getTime()
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          
          if (diffDays <= 0 && supply.status !== 'expired') {
            // Item vencido
            const existingAlert = alerts.find(alert => 
              alert.supplyId === supply.id && 
              alert.type === 'expired' && 
              !alert.isResolved
            )
            
            if (!existingAlert) {
              newAlerts.push({
                id: `alert-expired-${Date.now()}-${supply.id}`,
                supplyId: supply.id,
                supplyName: supply.name,
                type: 'expired',
                priority: 'critical',
                message: `Item vencido há ${Math.abs(diffDays)} dias`,
                dueDate: supply.expiryDate,
                createdAt: new Date().toISOString(),
                isRead: false,
                isResolved: false
              })
            }
          } else if (diffDays <= 30 && diffDays > 0) {
            // Item vencendo
            const existingAlert = alerts.find(alert => 
              alert.supplyId === supply.id && 
              alert.type === 'expiring' && 
              !alert.isResolved
            )
            
            if (!existingAlert) {
              newAlerts.push({
                id: `alert-expiring-${Date.now()}-${supply.id}`,
                supplyId: supply.id,
                supplyName: supply.name,
                type: 'expiring',
                priority: diffDays <= 7 ? 'high' : 'medium',
                message: `Vence em ${diffDays} dias`,
                dueDate: supply.expiryDate,
                createdAt: new Date().toISOString(),
                isRead: false,
                isResolved: false
              })
            }
          }
        }
      })
      
      if (newAlerts.length > 0) {
        setAlerts(prev => [...newAlerts, ...prev])
      }
    }
    
    // Verificar alertas a cada 5 minutos
    const interval = setInterval(checkAlerts, 5 * 60 * 1000)
    
    // Verificar imediatamente
    checkAlerts()
    
    return () => clearInterval(interval)
  }, [supplies, alerts])

  return {
    // Estado
    supplies,
    stats,
    movements,
    alerts,
    orders,
    loading,
    error,
    
    // Ações CRUD
    addSupply,
    updateSupply,
    deleteSupply,
    
    // Gestão de estoque
    updateStock,
    consumeSupply,
    receiveSupply,
    transferSupply,
    
    // Movimentações
    getSupplyMovements,
    addMovement,
    
    // Alertas
    markAlertAsRead,
    markAlertAsResolved,
    dismissAlert,
    
    // Pedidos
    createOrder,
    updateOrderStatus,
    receiveOrder,
    
    // Filtros e busca
    searchSupplies,
    filterByCategory,
    filterByDepartment,
    filterByStatus,
    filterByCriticality,
    filterByExpiry,
    
    // Relatórios
    getConsumptionReport,
    getExpiryReport,
    getLowStockReport,
    getUsageAnalytics,
    
    // Utilitários
    refreshData,
    exportSupplies,
    generateReport,
    calculateReorderPoint,
    predictStockout
  }
}