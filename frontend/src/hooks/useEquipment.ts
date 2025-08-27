'use client'

import { useState, useEffect, useCallback } from 'react'

// Interface para equipamentos
interface Equipment {
  id: string
  name: string
  model: string
  manufacturer: string
  serialNumber: string
  category: 'diagnostic' | 'therapeutic' | 'monitoring' | 'surgical' | 'laboratory' | 'imaging' | 'life_support' | 'other'
  department: string
  location: string
  acquisitionDate: string
  warrantyExpiry?: string
  acquisitionCost: number
  currentValue: number
  depreciationRate: number
  technicalSpecs: Record<string, any>
  certification?: string
  riskClass: 'I' | 'IIa' | 'IIb' | 'III'
  calibrationRequired: boolean
  calibrationInterval?: number // em meses
  lastCalibration?: string
  nextCalibration?: string
  calibrationStatus: 'valid' | 'due' | 'overdue' | 'not_required'
  maintenanceRequired: boolean
  maintenanceInterval?: number // em meses
  lastMaintenance?: string
  nextMaintenance?: string
  maintenanceStatus: 'up_to_date' | 'due' | 'overdue' | 'not_required'
  operationalStatus: 'operational' | 'maintenance' | 'repair' | 'out_of_service' | 'retired'
  criticality: 'low' | 'medium' | 'high' | 'critical'
  supplier?: string
  purchaseOrder?: string
  notes?: string
  attachments?: string[]
  lastUpdated: string
}

interface EquipmentMovement {
  id: string
  equipmentId: string
  equipmentName: string
  type: 'acquisition' | 'transfer' | 'maintenance' | 'calibration' | 'repair' | 'retirement' | 'disposal'
  fromLocation?: string
  toLocation?: string
  reason: string
  performedBy: string
  cost?: number
  notes?: string
  timestamp: string
  attachments?: string[]
}

interface EquipmentAlert {
  id: string
  equipmentId: string
  equipmentName: string
  type: 'calibration_due' | 'maintenance_due' | 'warranty_expiring' | 'malfunction' | 'recall' | 'certification_expiring'
  priority: 'low' | 'medium' | 'high' | 'critical'
  message: string
  dueDate?: string
  createdAt: string
  isRead: boolean
  isResolved: boolean
}

interface MaintenanceRecord {
  id: string
  equipmentId: string
  type: 'preventive' | 'corrective' | 'calibration' | 'inspection'
  description: string
  performedBy: string
  company?: string
  cost: number
  startDate: string
  endDate?: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  notes?: string
  attachments?: string[]
  nextMaintenanceDate?: string
}

interface EquipmentStats {
  totalEquipment: number
  totalValue: number
  operationalCount: number
  maintenanceCount: number
  repairCount: number
  outOfServiceCount: number
  calibrationDueCount: number
  maintenanceDueCount: number
  warrantyExpiringCount: number
  categoriesDistribution: Record<string, number>
  departmentsDistribution: Record<string, number>
  averageAge: number
  utilizationRate: number
}

interface UseEquipmentReturn {
  // Estado
  equipment: Equipment[]
  stats: EquipmentStats
  movements: EquipmentMovement[]
  alerts: EquipmentAlert[]
  maintenanceRecords: MaintenanceRecord[]
  loading: boolean
  error: string | null
  
  // Ações CRUD
  addEquipment: (equipment: Omit<Equipment, 'id' | 'lastUpdated' | 'currentValue'>) => Promise<void>
  updateEquipment: (id: string, updates: Partial<Equipment>) => Promise<void>
  deleteEquipment: (id: string) => Promise<void>
  
  // Gestão de status
  updateOperationalStatus: (id: string, status: Equipment['operationalStatus'], reason: string) => Promise<void>
  transferEquipment: (id: string, newLocation: string, newDepartment: string, reason: string) => Promise<void>
  
  // Manutenção e calibração
  scheduleMaintenance: (equipmentId: string, maintenance: Omit<MaintenanceRecord, 'id' | 'equipmentId'>) => Promise<void>
  completeMaintenance: (maintenanceId: string, notes?: string, attachments?: string[]) => Promise<void>
  recordCalibration: (equipmentId: string, calibrationDate: string, nextDate: string, notes?: string) => Promise<void>
  
  // Movimentações
  getEquipmentMovements: (equipmentId: string) => EquipmentMovement[]
  addMovement: (movement: Omit<EquipmentMovement, 'id' | 'timestamp'>) => Promise<void>
  
  // Alertas
  markAlertAsRead: (alertId: string) => Promise<void>
  markAlertAsResolved: (alertId: string) => Promise<void>
  dismissAlert: (alertId: string) => Promise<void>
  
  // Filtros e busca
  searchEquipment: (query: string) => Equipment[]
  filterByCategory: (category: Equipment['category']) => Equipment[]
  filterByDepartment: (department: string) => Equipment[]
  filterByStatus: (status: Equipment['operationalStatus']) => Equipment[]
  filterByCriticality: (criticality: Equipment['criticality']) => Equipment[]
  
  // Relatórios
  getMaintenanceHistory: (equipmentId: string) => MaintenanceRecord[]
  getUpcomingMaintenance: (days?: number) => MaintenanceRecord[]
  getCalibrationSchedule: (days?: number) => Equipment[]
  
  // Utilitários
  refreshData: () => Promise<void>
  exportEquipment: (format: 'csv' | 'excel' | 'pdf') => Promise<void>
  generateReport: (type: 'inventory' | 'maintenance' | 'calibration' | 'utilization') => Promise<any>
}

// Mock data para demonstração
const mockEquipment: Equipment[] = [
  {
    id: '1',
    name: 'Monitor Cardíaco',
    model: 'MC-2000',
    manufacturer: 'Philips',
    serialNumber: 'PH2024001',
    category: 'monitoring',
    department: 'UTI',
    location: 'UTI - Leito 01',
    acquisitionDate: '2023-01-15',
    warrantyExpiry: '2026-01-15',
    acquisitionCost: 15000.00,
    currentValue: 12000.00,
    depreciationRate: 10,
    technicalSpecs: {
      voltage: '110-220V',
      frequency: '50-60Hz',
      channels: 12,
      display: '15 polegadas'
    },
    certification: 'ANVISA 123456789',
    riskClass: 'IIb',
    calibrationRequired: true,
    calibrationInterval: 12,
    lastCalibration: '2024-01-15',
    nextCalibration: '2025-01-15',
    calibrationStatus: 'valid',
    maintenanceRequired: true,
    maintenanceInterval: 6,
    lastMaintenance: '2024-07-15',
    nextMaintenance: '2025-01-15',
    maintenanceStatus: 'due',
    operationalStatus: 'operational',
    criticality: 'critical',
    supplier: 'MedTech Ltda',
    purchaseOrder: 'PO-2023-001',
    notes: 'Equipamento em perfeito estado',
    lastUpdated: '2024-01-20T10:30:00Z'
  },
  {
    id: '2',
    name: 'Ventilador Pulmonar',
    model: 'VP-3000',
    manufacturer: 'Dräger',
    serialNumber: 'DR2024002',
    category: 'life_support',
    department: 'UTI',
    location: 'UTI - Leito 05',
    acquisitionDate: '2023-03-20',
    warrantyExpiry: '2026-03-20',
    acquisitionCost: 45000.00,
    currentValue: 38000.00,
    depreciationRate: 8,
    technicalSpecs: {
      voltage: '220V',
      modes: ['VCV', 'PCV', 'SIMV', 'CPAP'],
      flowRange: '0.5-180 L/min',
      pressureRange: '0-100 cmH2O'
    },
    certification: 'ANVISA 987654321',
    riskClass: 'III',
    calibrationRequired: true,
    calibrationInterval: 6,
    lastCalibration: '2024-10-15',
    nextCalibration: '2025-04-15',
    calibrationStatus: 'valid',
    maintenanceRequired: true,
    maintenanceInterval: 3,
    lastMaintenance: '2024-10-15',
    nextMaintenance: '2025-01-15',
    maintenanceStatus: 'due',
    operationalStatus: 'operational',
    criticality: 'critical',
    supplier: 'Respirar Equipamentos',
    purchaseOrder: 'PO-2023-003',
    lastUpdated: '2024-01-20T14:15:00Z'
  },
  {
    id: '3',
    name: 'Desfibrilador',
    model: 'DF-1500',
    manufacturer: 'Zoll',
    serialNumber: 'ZL2024003',
    category: 'therapeutic',
    department: 'Emergência',
    location: 'Sala de Emergência 1',
    acquisitionDate: '2022-06-10',
    warrantyExpiry: '2025-06-10',
    acquisitionCost: 25000.00,
    currentValue: 18000.00,
    depreciationRate: 12,
    technicalSpecs: {
      voltage: '110-220V',
      energy: '1-360J',
      waveform: 'Bifásica',
      battery: 'Li-ion 4h'
    },
    certification: 'ANVISA 456789123',
    riskClass: 'III',
    calibrationRequired: true,
    calibrationInterval: 12,
    lastCalibration: '2023-12-10',
    nextCalibration: '2024-12-10',
    calibrationStatus: 'overdue',
    maintenanceRequired: true,
    maintenanceInterval: 6,
    lastMaintenance: '2024-06-10',
    nextMaintenance: '2024-12-10',
    maintenanceStatus: 'overdue',
    operationalStatus: 'maintenance',
    criticality: 'critical',
    supplier: 'CardioTech',
    purchaseOrder: 'PO-2022-015',
    notes: 'Necessita calibração urgente',
    lastUpdated: '2024-01-20T16:45:00Z'
  }
]

const mockMovements: EquipmentMovement[] = [
  {
    id: '1',
    equipmentId: '1',
    equipmentName: 'Monitor Cardíaco',
    type: 'transfer',
    fromLocation: 'Almoxarifado',
    toLocation: 'UTI - Leito 01',
    reason: 'Instalação em novo leito',
    performedBy: 'João Silva',
    timestamp: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    equipmentId: '3',
    equipmentName: 'Desfibrilador',
    type: 'maintenance',
    reason: 'Manutenção preventiva programada',
    performedBy: 'TechMed Assistência',
    cost: 800.00,
    timestamp: '2024-01-10T14:00:00Z'
  }
]

const mockAlerts: EquipmentAlert[] = [
  {
    id: '1',
    equipmentId: '3',
    equipmentName: 'Desfibrilador',
    type: 'calibration_due',
    priority: 'critical',
    message: 'Calibração vencida há 40 dias',
    dueDate: '2024-12-10',
    createdAt: '2024-01-20T08:00:00Z',
    isRead: false,
    isResolved: false
  },
  {
    id: '2',
    equipmentId: '1',
    equipmentName: 'Monitor Cardíaco',
    type: 'maintenance_due',
    priority: 'high',
    message: 'Manutenção preventiva vence em 5 dias',
    dueDate: '2025-01-15',
    createdAt: '2024-01-20T08:00:00Z',
    isRead: false,
    isResolved: false
  }
]

const mockMaintenanceRecords: MaintenanceRecord[] = [
  {
    id: '1',
    equipmentId: '1',
    type: 'preventive',
    description: 'Manutenção preventiva semestral',
    performedBy: 'João Silva',
    company: 'TechMed Assistência',
    cost: 500.00,
    startDate: '2024-07-15',
    endDate: '2024-07-15',
    status: 'completed',
    notes: 'Todos os componentes verificados e funcionando normalmente',
    nextMaintenanceDate: '2025-01-15'
  },
  {
    id: '2',
    equipmentId: '2',
    type: 'calibration',
    description: 'Calibração semestral do ventilador',
    performedBy: 'Maria Santos',
    company: 'Respirar Equipamentos',
    cost: 1200.00,
    startDate: '2024-10-15',
    endDate: '2024-10-15',
    status: 'completed',
    notes: 'Calibração realizada conforme normas técnicas',
    nextMaintenanceDate: '2025-04-15'
  }
]

export function useEquipment(): UseEquipmentReturn {
  const [equipment, setEquipment] = useState<Equipment[]>(mockEquipment)
  const [movements, setMovements] = useState<EquipmentMovement[]>(mockMovements)
  const [alerts, setAlerts] = useState<EquipmentAlert[]>(mockAlerts)
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(mockMaintenanceRecords)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calcular estatísticas
  const stats: EquipmentStats = {
    totalEquipment: equipment.length,
    totalValue: equipment.reduce((sum, eq) => sum + eq.currentValue, 0),
    operationalCount: equipment.filter(eq => eq.operationalStatus === 'operational').length,
    maintenanceCount: equipment.filter(eq => eq.operationalStatus === 'maintenance').length,
    repairCount: equipment.filter(eq => eq.operationalStatus === 'repair').length,
    outOfServiceCount: equipment.filter(eq => eq.operationalStatus === 'out_of_service').length,
    calibrationDueCount: equipment.filter(eq => eq.calibrationStatus === 'due' || eq.calibrationStatus === 'overdue').length,
    maintenanceDueCount: equipment.filter(eq => eq.maintenanceStatus === 'due' || eq.maintenanceStatus === 'overdue').length,
    warrantyExpiringCount: equipment.filter(eq => {
      if (!eq.warrantyExpiry) return false
      const expiry = new Date(eq.warrantyExpiry)
      const today = new Date()
      const diffTime = expiry.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays <= 90 && diffDays > 0
    }).length,
    categoriesDistribution: equipment.reduce((acc, eq) => {
      acc[eq.category] = (acc[eq.category] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    departmentsDistribution: equipment.reduce((acc, eq) => {
      acc[eq.department] = (acc[eq.department] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    averageAge: equipment.length > 0 ? 
      equipment.reduce((sum, eq) => {
        const acquisitionDate = new Date(eq.acquisitionDate)
        const today = new Date()
        const ageInYears = (today.getTime() - acquisitionDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
        return sum + ageInYears
      }, 0) / equipment.length : 0,
    utilizationRate: equipment.filter(eq => eq.operationalStatus === 'operational').length / equipment.length * 100
  }

  // Adicionar equipamento
  const addEquipment = useCallback(async (newEquipment: Omit<Equipment, 'id' | 'lastUpdated' | 'currentValue'>) => {
    setLoading(true)
    setError(null)
    
    try {
      const equipment: Equipment = {
        ...newEquipment,
        id: Date.now().toString(),
        currentValue: newEquipment.acquisitionCost, // Valor inicial igual ao custo de aquisição
        lastUpdated: new Date().toISOString()
      }
      
      setEquipment(prev => [...prev, equipment])
      
      // Adicionar movimento de aquisição
      await addMovement({
        equipmentId: equipment.id,
        equipmentName: equipment.name,
        type: 'acquisition',
        toLocation: equipment.location,
        reason: 'Aquisição de novo equipamento',
        performedBy: 'Sistema',
        cost: equipment.acquisitionCost
      })
      
    } catch (err) {
      setError('Erro ao adicionar equipamento')
      console.error('Erro ao adicionar equipamento:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Atualizar equipamento
  const updateEquipment = useCallback(async (id: string, updates: Partial<Equipment>) => {
    setLoading(true)
    setError(null)
    
    try {
      setEquipment(prev => prev.map(eq => {
        if (eq.id === id) {
          const updated = { ...eq, ...updates, lastUpdated: new Date().toISOString() }
          
          // Recalcular valor atual se necessário
          if (updates.acquisitionCost !== undefined || updates.depreciationRate !== undefined) {
            const acquisitionDate = new Date(updated.acquisitionDate)
            const today = new Date()
            const ageInYears = (today.getTime() - acquisitionDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
            const depreciationAmount = updated.acquisitionCost * (updated.depreciationRate / 100) * ageInYears
            updated.currentValue = Math.max(0, updated.acquisitionCost - depreciationAmount)
          }
          
          return updated
        }
        return eq
      }))
    } catch (err) {
      setError('Erro ao atualizar equipamento')
      console.error('Erro ao atualizar equipamento:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Deletar equipamento
  const deleteEquipment = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      setEquipment(prev => prev.filter(eq => eq.id !== id))
      setMovements(prev => prev.filter(movement => movement.equipmentId !== id))
      setAlerts(prev => prev.filter(alert => alert.equipmentId !== id))
      setMaintenanceRecords(prev => prev.filter(record => record.equipmentId !== id))
    } catch (err) {
      setError('Erro ao deletar equipamento')
      console.error('Erro ao deletar equipamento:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Atualizar status operacional
  const updateOperationalStatus = useCallback(async (id: string, status: Equipment['operationalStatus'], reason: string) => {
    setLoading(true)
    setError(null)
    
    try {
      await updateEquipment(id, { operationalStatus: status })
      
      // Adicionar movimento
      const eq = equipment.find(e => e.id === id)
      if (eq) {
        await addMovement({
          equipmentId: id,
          equipmentName: eq.name,
          type: status === 'maintenance' ? 'maintenance' : status === 'repair' ? 'repair' : 'transfer',
          reason,
          performedBy: 'Sistema'
        })
      }
      
    } catch (err) {
      setError('Erro ao atualizar status')
      console.error('Erro ao atualizar status:', err)
    } finally {
      setLoading(false)
    }
  }, [equipment, updateEquipment])

  // Transferir equipamento
  const transferEquipment = useCallback(async (id: string, newLocation: string, newDepartment: string, reason: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const eq = equipment.find(e => e.id === id)
      if (!eq) throw new Error('Equipamento não encontrado')
      
      const oldLocation = eq.location
      const oldDepartment = eq.department
      
      await updateEquipment(id, {
        location: newLocation,
        department: newDepartment
      })
      
      // Adicionar movimento de transferência
      await addMovement({
        equipmentId: id,
        equipmentName: eq.name,
        type: 'transfer',
        fromLocation: `${oldDepartment} - ${oldLocation}`,
        toLocation: `${newDepartment} - ${newLocation}`,
        reason,
        performedBy: 'Sistema'
      })
      
    } catch (err) {
      setError('Erro ao transferir equipamento')
      console.error('Erro ao transferir equipamento:', err)
    } finally {
      setLoading(false)
    }
  }, [equipment, updateEquipment])

  // Agendar manutenção
  const scheduleMaintenance = useCallback(async (equipmentId: string, maintenance: Omit<MaintenanceRecord, 'id' | 'equipmentId'>) => {
    setLoading(true)
    setError(null)
    
    try {
      const newMaintenance: MaintenanceRecord = {
        ...maintenance,
        id: Date.now().toString(),
        equipmentId
      }
      
      setMaintenanceRecords(prev => [...prev, newMaintenance])
      
      // Se a manutenção está iniciando, atualizar status do equipamento
      if (maintenance.status === 'in_progress') {
        await updateOperationalStatus(equipmentId, 'maintenance', 'Manutenção em andamento')
      }
      
    } catch (err) {
      setError('Erro ao agendar manutenção')
      console.error('Erro ao agendar manutenção:', err)
    } finally {
      setLoading(false)
    }
  }, [updateOperationalStatus])

  // Completar manutenção
  const completeMaintenance = useCallback(async (maintenanceId: string, notes?: string, attachments?: string[]) => {
    setLoading(true)
    setError(null)
    
    try {
      const maintenance = maintenanceRecords.find(m => m.id === maintenanceId)
      if (!maintenance) throw new Error('Registro de manutenção não encontrado')
      
      // Atualizar registro de manutenção
      setMaintenanceRecords(prev => prev.map(m => 
        m.id === maintenanceId 
          ? { 
              ...m, 
              status: 'completed', 
              endDate: new Date().toISOString(),
              notes: notes || m.notes,
              attachments: attachments || m.attachments
            }
          : m
      ))
      
      // Atualizar equipamento
      const today = new Date().toISOString()
      const nextMaintenanceDate = maintenance.nextMaintenanceDate
      
      const updates: Partial<Equipment> = {
        operationalStatus: 'operational',
        lastMaintenance: today,
        maintenanceStatus: 'up_to_date'
      }
      
      if (nextMaintenanceDate) {
        updates.nextMaintenance = nextMaintenanceDate
      }
      
      if (maintenance.type === 'calibration') {
        updates.lastCalibration = today
        updates.calibrationStatus = 'valid'
        if (nextMaintenanceDate) {
          updates.nextCalibration = nextMaintenanceDate
        }
      }
      
      await updateEquipment(maintenance.equipmentId, updates)
      
      // Adicionar movimento
      const eq = equipment.find(e => e.id === maintenance.equipmentId)
      if (eq) {
        await addMovement({
          equipmentId: maintenance.equipmentId,
          equipmentName: eq.name,
          type: maintenance.type === 'calibration' ? 'calibration' : 'maintenance',
          reason: `${maintenance.type} concluída: ${maintenance.description}`,
          performedBy: maintenance.performedBy,
          cost: maintenance.cost
        })
      }
      
    } catch (err) {
      setError('Erro ao completar manutenção')
      console.error('Erro ao completar manutenção:', err)
    } finally {
      setLoading(false)
    }
  }, [maintenanceRecords, equipment, updateEquipment])

  // Registrar calibração
  const recordCalibration = useCallback(async (equipmentId: string, calibrationDate: string, nextDate: string, notes?: string) => {
    setLoading(true)
    setError(null)
    
    try {
      await updateEquipment(equipmentId, {
        lastCalibration: calibrationDate,
        nextCalibration: nextDate,
        calibrationStatus: 'valid'
      })
      
      // Criar registro de manutenção para a calibração
      await scheduleMaintenance(equipmentId, {
        type: 'calibration',
        description: 'Calibração realizada',
        performedBy: 'Sistema',
        cost: 0,
        startDate: calibrationDate,
        endDate: calibrationDate,
        status: 'completed',
        notes,
        nextMaintenanceDate: nextDate
      })
      
    } catch (err) {
      setError('Erro ao registrar calibração')
      console.error('Erro ao registrar calibração:', err)
    } finally {
      setLoading(false)
    }
  }, [updateEquipment, scheduleMaintenance])

  // Obter movimentações de um equipamento
  const getEquipmentMovements = useCallback((equipmentId: string) => {
    return movements.filter(movement => movement.equipmentId === equipmentId)
  }, [movements])

  // Adicionar movimentação
  const addMovement = useCallback(async (newMovement: Omit<EquipmentMovement, 'id' | 'timestamp'>) => {
    try {
      const movement: EquipmentMovement = {
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

  // Buscar equipamentos
  const searchEquipment = useCallback((query: string) => {
    if (!query.trim()) return equipment
    
    const lowercaseQuery = query.toLowerCase()
    return equipment.filter(eq => 
      eq.name.toLowerCase().includes(lowercaseQuery) ||
      eq.model.toLowerCase().includes(lowercaseQuery) ||
      eq.manufacturer.toLowerCase().includes(lowercaseQuery) ||
      eq.serialNumber.toLowerCase().includes(lowercaseQuery) ||
      eq.location.toLowerCase().includes(lowercaseQuery)
    )
  }, [equipment])

  // Filtrar por categoria
  const filterByCategory = useCallback((category: Equipment['category']) => {
    return equipment.filter(eq => eq.category === category)
  }, [equipment])

  // Filtrar por departamento
  const filterByDepartment = useCallback((department: string) => {
    return equipment.filter(eq => eq.department === department)
  }, [equipment])

  // Filtrar por status
  const filterByStatus = useCallback((status: Equipment['operationalStatus']) => {
    return equipment.filter(eq => eq.operationalStatus === status)
  }, [equipment])

  // Filtrar por criticidade
  const filterByCriticality = useCallback((criticality: Equipment['criticality']) => {
    return equipment.filter(eq => eq.criticality === criticality)
  }, [equipment])

  // Obter histórico de manutenção
  const getMaintenanceHistory = useCallback((equipmentId: string) => {
    return maintenanceRecords.filter(record => record.equipmentId === equipmentId)
  }, [maintenanceRecords])

  // Obter próximas manutenções
  const getUpcomingMaintenance = useCallback((days: number = 30) => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + days)
    
    return maintenanceRecords.filter(record => {
      if (record.status !== 'scheduled') return false
      const startDate = new Date(record.startDate)
      return startDate <= futureDate
    })
  }, [maintenanceRecords])

  // Obter cronograma de calibração
  const getCalibrationSchedule = useCallback((days: number = 30) => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + days)
    
    return equipment.filter(eq => {
      if (!eq.nextCalibration) return false
      const calibrationDate = new Date(eq.nextCalibration)
      return calibrationDate <= futureDate
    })
  }, [equipment])

  // Atualizar dados
  const refreshData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Simular chamada à API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Em uma implementação real, aqui faria as chamadas para a API
      // setEquipment(await equipmentService.getEquipment())
      // setMovements(await equipmentService.getMovements())
      // setAlerts(await equipmentService.getAlerts())
      // setMaintenanceRecords(await equipmentService.getMaintenanceRecords())
      
    } catch (err) {
      setError('Erro ao atualizar dados')
      console.error('Erro ao atualizar dados:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Exportar equipamentos
  const exportEquipment = useCallback(async (format: 'csv' | 'excel' | 'pdf') => {
    setLoading(true)
    setError(null)
    
    try {
      // Simular exportação
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log(`Exportando equipamentos em formato ${format}`)
      
    } catch (err) {
      setError('Erro ao exportar equipamentos')
      console.error('Erro ao exportar equipamentos:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Gerar relatório
  const generateReport = useCallback(async (type: 'inventory' | 'maintenance' | 'calibration' | 'utilization') => {
    setLoading(true)
    setError(null)
    
    try {
      // Simular geração de relatório
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      let reportData
      switch (type) {
        case 'inventory':
          reportData = { equipment, stats }
          break
        case 'maintenance':
          reportData = { maintenanceRecords, upcomingMaintenance: getUpcomingMaintenance() }
          break
        case 'calibration':
          reportData = { calibrationSchedule: getCalibrationSchedule() }
          break
        case 'utilization':
          reportData = { 
            equipment,
            utilizationStats: {
              operational: stats.operationalCount,
              maintenance: stats.maintenanceCount,
              repair: stats.repairCount,
              outOfService: stats.outOfServiceCount
            }
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
  }, [equipment, stats, maintenanceRecords, getUpcomingMaintenance, getCalibrationSchedule])

  // Verificar alertas automaticamente
  useEffect(() => {
    const checkAlerts = () => {
      const newAlerts: EquipmentAlert[] = []
      const today = new Date()
      
      equipment.forEach(eq => {
        // Verificar calibração vencida/vencendo
        if (eq.calibrationRequired && eq.nextCalibration) {
          const calibrationDate = new Date(eq.nextCalibration)
          const diffTime = calibrationDate.getTime() - today.getTime()
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          
          if (diffDays <= 0 && eq.calibrationStatus !== 'overdue') {
            // Calibração vencida
            const existingAlert = alerts.find(alert => 
              alert.equipmentId === eq.id && 
              alert.type === 'calibration_due' && 
              !alert.isResolved
            )
            
            if (!existingAlert) {
              newAlerts.push({
                id: `alert-cal-${Date.now()}-${eq.id}`,
                equipmentId: eq.id,
                equipmentName: eq.name,
                type: 'calibration_due',
                priority: 'critical',
                message: `Calibração vencida há ${Math.abs(diffDays)} dias`,
                dueDate: eq.nextCalibration,
                createdAt: new Date().toISOString(),
                isRead: false,
                isResolved: false
              })
            }
          } else if (diffDays <= 7 && diffDays > 0) {
            // Calibração vencendo
            const existingAlert = alerts.find(alert => 
              alert.equipmentId === eq.id && 
              alert.type === 'calibration_due' && 
              !alert.isResolved
            )
            
            if (!existingAlert) {
              newAlerts.push({
                id: `alert-cal-due-${Date.now()}-${eq.id}`,
                equipmentId: eq.id,
                equipmentName: eq.name,
                type: 'calibration_due',
                priority: 'high',
                message: `Calibração vence em ${diffDays} dias`,
                dueDate: eq.nextCalibration,
                createdAt: new Date().toISOString(),
                isRead: false,
                isResolved: false
              })
            }
          }
        }
        
        // Verificar manutenção vencida/vencendo
        if (eq.maintenanceRequired && eq.nextMaintenance) {
          const maintenanceDate = new Date(eq.nextMaintenance)
          const diffTime = maintenanceDate.getTime() - today.getTime()
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          
          if (diffDays <= 0 && eq.maintenanceStatus !== 'overdue') {
            // Manutenção vencida
            const existingAlert = alerts.find(alert => 
              alert.equipmentId === eq.id && 
              alert.type === 'maintenance_due' && 
              !alert.isResolved
            )
            
            if (!existingAlert) {
              newAlerts.push({
                id: `alert-maint-${Date.now()}-${eq.id}`,
                equipmentId: eq.id,
                equipmentName: eq.name,
                type: 'maintenance_due',
                priority: eq.criticality === 'critical' ? 'critical' : 'high',
                message: `Manutenção vencida há ${Math.abs(diffDays)} dias`,
                dueDate: eq.nextMaintenance,
                createdAt: new Date().toISOString(),
                isRead: false,
                isResolved: false
              })
            }
          } else if (diffDays <= 7 && diffDays > 0) {
            // Manutenção vencendo
            const existingAlert = alerts.find(alert => 
              alert.equipmentId === eq.id && 
              alert.type === 'maintenance_due' && 
              !alert.isResolved
            )
            
            if (!existingAlert) {
              newAlerts.push({
                id: `alert-maint-due-${Date.now()}-${eq.id}`,
                equipmentId: eq.id,
                equipmentName: eq.name,
                type: 'maintenance_due',
                priority: eq.criticality === 'critical' ? 'high' : 'medium',
                message: `Manutenção vence em ${diffDays} dias`,
                dueDate: eq.nextMaintenance,
                createdAt: new Date().toISOString(),
                isRead: false,
                isResolved: false
              })
            }
          }
        }
        
        // Verificar garantia vencendo
        if (eq.warrantyExpiry) {
          const warrantyDate = new Date(eq.warrantyExpiry)
          const diffTime = warrantyDate.getTime() - today.getTime()
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          
          if (diffDays <= 90 && diffDays > 0) {
            const existingAlert = alerts.find(alert => 
              alert.equipmentId === eq.id && 
              alert.type === 'warranty_expiring' && 
              !alert.isResolved
            )
            
            if (!existingAlert) {
              newAlerts.push({
                id: `alert-warranty-${Date.now()}-${eq.id}`,
                equipmentId: eq.id,
                equipmentName: eq.name,
                type: 'warranty_expiring',
                priority: diffDays <= 30 ? 'high' : 'medium',
                message: `Garantia vence em ${diffDays} dias`,
                dueDate: eq.warrantyExpiry,
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
  }, [equipment, alerts])

  return {
    // Estado
    equipment,
    stats,
    movements,
    alerts,
    maintenanceRecords,
    loading,
    error,
    
    // Ações CRUD
    addEquipment,
    updateEquipment,
    deleteEquipment,
    
    // Gestão de status
    updateOperationalStatus,
    transferEquipment,
    
    // Manutenção e calibração
    scheduleMaintenance,
    completeMaintenance,
    recordCalibration,
    
    // Movimentações
    getEquipmentMovements,
    addMovement,
    
    // Alertas
    markAlertAsRead,
    markAlertAsResolved,
    dismissAlert,
    
    // Filtros e busca
    searchEquipment,
    filterByCategory,
    filterByDepartment,
    filterByStatus,
    filterByCriticality,
    
    // Relatórios
    getMaintenanceHistory,
    getUpcomingMaintenance,
    getCalibrationSchedule,
    
    // Utilitários
    refreshData,
    exportEquipment,
    generateReport
  }
}