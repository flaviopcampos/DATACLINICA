'use client'

import { useState, useEffect, useCallback } from 'react'

// Interfaces para os dados do inventário
interface InventoryItem {
  id: string
  name: string
  category: 'medications' | 'equipment' | 'supplies'
  currentStock: number
  minStock: number
  maxStock: number
  unitCost: number
  totalValue: number
  location: string
  expiryDate?: string
  status: 'available' | 'low_stock' | 'out_of_stock' | 'expired' | 'recalled'
  lastUpdated: string
}

interface InventoryStats {
  totalItems: number
  totalValue: number
  lowStockItems: number
  outOfStockItems: number
  expiringItems: number
  expiredItems: number
  categoriesCount: {
    medications: number
    equipment: number
    supplies: number
  }
  monthlyConsumption: number
  averageStockLevel: number
}

interface InventoryMovement {
  id: string
  itemId: string
  itemName: string
  type: 'entry' | 'exit' | 'transfer' | 'adjustment' | 'return'
  quantity: number
  previousStock: number
  newStock: number
  reason: string
  location: string
  performedBy: string
  timestamp: string
  batchNumber?: string
  expiryDate?: string
  cost?: number
}

interface InventoryAlert {
  id: string
  itemId: string
  itemName: string
  type: 'low_stock' | 'out_of_stock' | 'expiring' | 'expired' | 'maintenance' | 'calibration'
  priority: 'low' | 'medium' | 'high' | 'critical'
  message: string
  createdAt: string
  isRead: boolean
  isResolved: boolean
}

interface UseInventoryReturn {
  // Estado
  items: InventoryItem[]
  stats: InventoryStats
  movements: InventoryMovement[]
  alerts: InventoryAlert[]
  loading: boolean
  error: string | null
  
  // Ações para itens
  addItem: (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => Promise<void>
  updateItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  updateStock: (id: string, newStock: number, reason: string) => Promise<void>
  
  // Ações para movimentações
  addMovement: (movement: Omit<InventoryMovement, 'id' | 'timestamp'>) => Promise<void>
  getItemMovements: (itemId: string) => InventoryMovement[]
  
  // Ações para alertas
  markAlertAsRead: (alertId: string) => Promise<void>
  markAlertAsResolved: (alertId: string) => Promise<void>
  dismissAlert: (alertId: string) => Promise<void>
  
  // Filtros e busca
  searchItems: (query: string) => InventoryItem[]
  filterByCategory: (category: InventoryItem['category']) => InventoryItem[]
  filterByStatus: (status: InventoryItem['status']) => InventoryItem[]
  
  // Utilitários
  refreshData: () => Promise<void>
  exportData: (format: 'csv' | 'excel' | 'pdf') => Promise<void>
  generateReport: (type: 'stock' | 'movements' | 'alerts') => Promise<any>
}

// Mock data para demonstração
const mockItems: InventoryItem[] = [
  {
    id: '1',
    name: 'Paracetamol 500mg',
    category: 'medications',
    currentStock: 150,
    minStock: 50,
    maxStock: 500,
    unitCost: 0.25,
    totalValue: 37.50,
    location: 'Farmácia Central',
    expiryDate: '2025-12-31',
    status: 'available',
    lastUpdated: '2024-01-20T10:30:00Z'
  },
  {
    id: '2',
    name: 'Monitor Cardíaco',
    category: 'equipment',
    currentStock: 2,
    minStock: 1,
    maxStock: 5,
    unitCost: 15000.00,
    totalValue: 30000.00,
    location: 'UTI',
    status: 'available',
    lastUpdated: '2024-01-20T14:15:00Z'
  },
  {
    id: '3',
    name: 'Luvas Descartáveis',
    category: 'supplies',
    currentStock: 25,
    minStock: 100,
    maxStock: 1000,
    unitCost: 0.85,
    totalValue: 21.25,
    location: 'Almoxarifado',
    status: 'low_stock',
    lastUpdated: '2024-01-20T16:45:00Z'
  }
]

const mockMovements: InventoryMovement[] = [
  {
    id: '1',
    itemId: '1',
    itemName: 'Paracetamol 500mg',
    type: 'entry',
    quantity: 100,
    previousStock: 50,
    newStock: 150,
    reason: 'Reposição de estoque',
    location: 'Farmácia Central',
    performedBy: 'João Silva',
    timestamp: '2024-01-20T10:30:00Z',
    batchNumber: 'LT2024001',
    expiryDate: '2025-12-31',
    cost: 25.00
  },
  {
    id: '2',
    itemId: '3',
    itemName: 'Luvas Descartáveis',
    type: 'exit',
    quantity: 75,
    previousStock: 100,
    newStock: 25,
    reason: 'Consumo UTI',
    location: 'UTI',
    performedBy: 'Maria Santos',
    timestamp: '2024-01-20T14:15:00Z'
  }
]

const mockAlerts: InventoryAlert[] = [
  {
    id: '1',
    itemId: '3',
    itemName: 'Luvas Descartáveis',
    type: 'low_stock',
    priority: 'high',
    message: 'Estoque abaixo do mínimo (25/100)',
    createdAt: '2024-01-20T16:45:00Z',
    isRead: false,
    isResolved: false
  }
]

export function useInventory(): UseInventoryReturn {
  const [items, setItems] = useState<InventoryItem[]>(mockItems)
  const [movements, setMovements] = useState<InventoryMovement[]>(mockMovements)
  const [alerts, setAlerts] = useState<InventoryAlert[]>(mockAlerts)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calcular estatísticas
  const stats: InventoryStats = {
    totalItems: items.length,
    totalValue: items.reduce((sum, item) => sum + item.totalValue, 0),
    lowStockItems: items.filter(item => item.status === 'low_stock').length,
    outOfStockItems: items.filter(item => item.status === 'out_of_stock').length,
    expiringItems: items.filter(item => {
      if (!item.expiryDate) return false
      const expiry = new Date(item.expiryDate)
      const today = new Date()
      const diffTime = expiry.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays <= 30 && diffDays > 0
    }).length,
    expiredItems: items.filter(item => item.status === 'expired').length,
    categoriesCount: {
      medications: items.filter(item => item.category === 'medications').length,
      equipment: items.filter(item => item.category === 'equipment').length,
      supplies: items.filter(item => item.category === 'supplies').length
    },
    monthlyConsumption: 0, // Calculado baseado nas movimentações
    averageStockLevel: items.length > 0 ? 
      items.reduce((sum, item) => sum + (item.currentStock / item.maxStock), 0) / items.length * 100 : 0
  }

  // Adicionar item
  const addItem = useCallback(async (newItem: Omit<InventoryItem, 'id' | 'lastUpdated'>) => {
    setLoading(true)
    setError(null)
    
    try {
      const item: InventoryItem = {
        ...newItem,
        id: Date.now().toString(),
        lastUpdated: new Date().toISOString()
      }
      
      setItems(prev => [...prev, item])
      
      // Adicionar movimento de entrada
      await addMovement({
        itemId: item.id,
        itemName: item.name,
        type: 'entry',
        quantity: item.currentStock,
        previousStock: 0,
        newStock: item.currentStock,
        reason: 'Item adicionado ao inventário',
        location: item.location,
        performedBy: 'Sistema'
      })
      
    } catch (err) {
      setError('Erro ao adicionar item')
      console.error('Erro ao adicionar item:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Atualizar item
  const updateItem = useCallback(async (id: string, updates: Partial<InventoryItem>) => {
    setLoading(true)
    setError(null)
    
    try {
      setItems(prev => prev.map(item => 
        item.id === id 
          ? { ...item, ...updates, lastUpdated: new Date().toISOString() }
          : item
      ))
    } catch (err) {
      setError('Erro ao atualizar item')
      console.error('Erro ao atualizar item:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Deletar item
  const deleteItem = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      setItems(prev => prev.filter(item => item.id !== id))
      setMovements(prev => prev.filter(movement => movement.itemId !== id))
      setAlerts(prev => prev.filter(alert => alert.itemId !== id))
    } catch (err) {
      setError('Erro ao deletar item')
      console.error('Erro ao deletar item:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Atualizar estoque
  const updateStock = useCallback(async (id: string, newStock: number, reason: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const item = items.find(i => i.id === id)
      if (!item) throw new Error('Item não encontrado')
      
      const previousStock = item.currentStock
      const quantity = newStock - previousStock
      const movementType: InventoryMovement['type'] = 
        quantity > 0 ? 'entry' : quantity < 0 ? 'exit' : 'adjustment'
      
      // Determinar novo status
      let newStatus: InventoryItem['status'] = 'available'
      if (newStock === 0) {
        newStatus = 'out_of_stock'
      } else if (newStock <= item.minStock) {
        newStatus = 'low_stock'
      }
      
      // Atualizar item
      await updateItem(id, {
        currentStock: newStock,
        totalValue: newStock * item.unitCost,
        status: newStatus
      })
      
      // Adicionar movimento
      await addMovement({
        itemId: id,
        itemName: item.name,
        type: movementType,
        quantity: Math.abs(quantity),
        previousStock,
        newStock,
        reason,
        location: item.location,
        performedBy: 'Sistema'
      })
      
      // Criar alerta se necessário
      if (newStatus === 'low_stock' || newStatus === 'out_of_stock') {
        const alert: InventoryAlert = {
          id: Date.now().toString(),
          itemId: id,
          itemName: item.name,
          type: newStatus === 'out_of_stock' ? 'out_of_stock' : 'low_stock',
          priority: newStatus === 'out_of_stock' ? 'critical' : 'high',
          message: newStatus === 'out_of_stock' 
            ? 'Item sem estoque' 
            : `Estoque abaixo do mínimo (${newStock}/${item.minStock})`,
          createdAt: new Date().toISOString(),
          isRead: false,
          isResolved: false
        }
        setAlerts(prev => [...prev, alert])
      }
      
    } catch (err) {
      setError('Erro ao atualizar estoque')
      console.error('Erro ao atualizar estoque:', err)
    } finally {
      setLoading(false)
    }
  }, [items, updateItem])

  // Adicionar movimentação
  const addMovement = useCallback(async (newMovement: Omit<InventoryMovement, 'id' | 'timestamp'>) => {
    try {
      const movement: InventoryMovement = {
        ...newMovement,
        id: Date.now().toString(),
        timestamp: new Date().toISOString()
      }
      
      setMovements(prev => [movement, ...prev])
    } catch (err) {
      console.error('Erro ao adicionar movimentação:', err)
    }
  }, [])

  // Obter movimentações de um item
  const getItemMovements = useCallback((itemId: string) => {
    return movements.filter(movement => movement.itemId === itemId)
  }, [movements])

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

  // Buscar itens
  const searchItems = useCallback((query: string) => {
    if (!query.trim()) return items
    
    const lowercaseQuery = query.toLowerCase()
    return items.filter(item => 
      item.name.toLowerCase().includes(lowercaseQuery) ||
      item.location.toLowerCase().includes(lowercaseQuery)
    )
  }, [items])

  // Filtrar por categoria
  const filterByCategory = useCallback((category: InventoryItem['category']) => {
    return items.filter(item => item.category === category)
  }, [items])

  // Filtrar por status
  const filterByStatus = useCallback((status: InventoryItem['status']) => {
    return items.filter(item => item.status === status)
  }, [items])

  // Atualizar dados
  const refreshData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Simular chamada à API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Em uma implementação real, aqui faria as chamadas para a API
      // setItems(await inventoryService.getItems())
      // setMovements(await inventoryService.getMovements())
      // setAlerts(await inventoryService.getAlerts())
      
    } catch (err) {
      setError('Erro ao atualizar dados')
      console.error('Erro ao atualizar dados:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Exportar dados
  const exportData = useCallback(async (format: 'csv' | 'excel' | 'pdf') => {
    setLoading(true)
    setError(null)
    
    try {
      // Simular exportação
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Em uma implementação real, aqui geraria o arquivo
      console.log(`Exportando dados em formato ${format}`)
      
    } catch (err) {
      setError('Erro ao exportar dados')
      console.error('Erro ao exportar dados:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Gerar relatório
  const generateReport = useCallback(async (type: 'stock' | 'movements' | 'alerts') => {
    setLoading(true)
    setError(null)
    
    try {
      // Simular geração de relatório
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      let reportData
      switch (type) {
        case 'stock':
          reportData = { items, stats }
          break
        case 'movements':
          reportData = { movements }
          break
        case 'alerts':
          reportData = { alerts }
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
  }, [items, stats, movements, alerts])

  // Verificar alertas automaticamente
  useEffect(() => {
    const checkAlerts = () => {
      const newAlerts: InventoryAlert[] = []
      
      items.forEach(item => {
        // Verificar estoque baixo
        if (item.currentStock <= item.minStock && item.status !== 'out_of_stock') {
          const existingAlert = alerts.find(alert => 
            alert.itemId === item.id && 
            alert.type === 'low_stock' && 
            !alert.isResolved
          )
          
          if (!existingAlert) {
            newAlerts.push({
              id: `alert-${Date.now()}-${item.id}`,
              itemId: item.id,
              itemName: item.name,
              type: 'low_stock',
              priority: 'high',
              message: `Estoque abaixo do mínimo (${item.currentStock}/${item.minStock})`,
              createdAt: new Date().toISOString(),
              isRead: false,
              isResolved: false
            })
          }
        }
        
        // Verificar itens vencendo
        if (item.expiryDate) {
          const expiry = new Date(item.expiryDate)
          const today = new Date()
          const diffTime = expiry.getTime() - today.getTime()
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          
          if (diffDays <= 30 && diffDays > 0) {
            const existingAlert = alerts.find(alert => 
              alert.itemId === item.id && 
              alert.type === 'expiring' && 
              !alert.isResolved
            )
            
            if (!existingAlert) {
              newAlerts.push({
                id: `alert-exp-${Date.now()}-${item.id}`,
                itemId: item.id,
                itemName: item.name,
                type: 'expiring',
                priority: diffDays <= 7 ? 'critical' : 'medium',
                message: `Item vence em ${diffDays} dias`,
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
  }, [items, alerts])

  return {
    // Estado
    items,
    stats,
    movements,
    alerts,
    loading,
    error,
    
    // Ações para itens
    addItem,
    updateItem,
    deleteItem,
    updateStock,
    
    // Ações para movimentações
    addMovement,
    getItemMovements,
    
    // Ações para alertas
    markAlertAsRead,
    markAlertAsResolved,
    dismissAlert,
    
    // Filtros e busca
    searchItems,
    filterByCategory,
    filterByStatus,
    
    // Utilitários
    refreshData,
    exportData,
    generateReport
  }
}