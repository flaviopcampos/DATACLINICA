'use client'

import { useState, useEffect, useCallback } from 'react'

// Interface para medicamentos
interface Medication {
  id: string
  name: string
  activeIngredient: string
  dosage: string
  form: 'tablet' | 'capsule' | 'liquid' | 'injection' | 'cream' | 'drops' | 'inhaler' | 'patch'
  category: 'analgesic' | 'antibiotic' | 'antiviral' | 'cardiovascular' | 'diabetes' | 'respiratory' | 'neurological' | 'oncology' | 'other'
  manufacturer: string
  currentStock: number
  minStock: number
  maxStock: number
  unitCost: number
  totalValue: number
  expiryDate: string
  batchNumber: string
  location: string
  requiresPrescription: boolean
  isControlledSubstance: boolean
  controlledClass?: 'A1' | 'A2' | 'A3' | 'B1' | 'B2' | 'C1' | 'C2' | 'C3' | 'C4' | 'C5'
  therapeuticClass: string
  contraindications?: string[]
  sideEffects?: string[]
  interactions?: string[]
  storageConditions: string
  status: 'available' | 'low_stock' | 'out_of_stock' | 'expired' | 'recalled' | 'quarantine'
  lastUpdated: string
}

interface MedicationMovement {
  id: string
  medicationId: string
  medicationName: string
  type: 'entry' | 'exit' | 'transfer' | 'adjustment' | 'return' | 'disposal'
  quantity: number
  previousStock: number
  newStock: number
  reason: string
  location: string
  performedBy: string
  patientId?: string
  prescriptionId?: string
  timestamp: string
  batchNumber?: string
  expiryDate?: string
  cost?: number
}

interface MedicationAlert {
  id: string
  medicationId: string
  medicationName: string
  type: 'low_stock' | 'out_of_stock' | 'expiring' | 'expired' | 'recalled' | 'interaction'
  priority: 'low' | 'medium' | 'high' | 'critical'
  message: string
  createdAt: string
  isRead: boolean
  isResolved: boolean
}

interface MedicationStats {
  totalMedications: number
  totalValue: number
  lowStockCount: number
  outOfStockCount: number
  expiringCount: number
  expiredCount: number
  controlledCount: number
  prescriptionRequiredCount: number
  categoriesDistribution: Record<string, number>
  monthlyConsumption: number
  averageStockLevel: number
}

interface UseMedicationsReturn {
  // Estado
  medications: Medication[]
  stats: MedicationStats
  movements: MedicationMovement[]
  alerts: MedicationAlert[]
  loading: boolean
  error: string | null
  
  // Ações CRUD
  addMedication: (medication: Omit<Medication, 'id' | 'lastUpdated' | 'totalValue'>) => Promise<void>
  updateMedication: (id: string, updates: Partial<Medication>) => Promise<void>
  deleteMedication: (id: string) => Promise<void>
  
  // Gestão de estoque
  updateStock: (id: string, newStock: number, reason: string, batchNumber?: string) => Promise<void>
  dispenseMedication: (id: string, quantity: number, patientId: string, prescriptionId?: string) => Promise<void>
  receiveMedication: (id: string, quantity: number, batchNumber: string, expiryDate: string, cost?: number) => Promise<void>
  
  // Movimentações
  getMedicationMovements: (medicationId: string) => MedicationMovement[]
  addMovement: (movement: Omit<MedicationMovement, 'id' | 'timestamp'>) => Promise<void>
  
  // Alertas
  markAlertAsRead: (alertId: string) => Promise<void>
  markAlertAsResolved: (alertId: string) => Promise<void>
  dismissAlert: (alertId: string) => Promise<void>
  
  // Filtros e busca
  searchMedications: (query: string) => Medication[]
  filterByCategory: (category: Medication['category']) => Medication[]
  filterByStatus: (status: Medication['status']) => Medication[]
  filterByControlled: (controlled: boolean) => Medication[]
  filterByPrescription: (requiresPrescription: boolean) => Medication[]
  
  // Validações
  checkInteractions: (medicationIds: string[]) => string[]
  validatePrescription: (medicationId: string, patientId: string) => boolean
  
  // Utilitários
  refreshData: () => Promise<void>
  exportMedications: (format: 'csv' | 'excel' | 'pdf') => Promise<void>
  generateReport: (type: 'inventory' | 'consumption' | 'expiry' | 'controlled') => Promise<any>
}

// Mock data para demonstração
const mockMedications: Medication[] = [
  {
    id: '1',
    name: 'Paracetamol 500mg',
    activeIngredient: 'Paracetamol',
    dosage: '500mg',
    form: 'tablet',
    category: 'analgesic',
    manufacturer: 'EMS',
    currentStock: 150,
    minStock: 50,
    maxStock: 500,
    unitCost: 0.25,
    totalValue: 37.50,
    expiryDate: '2025-12-31',
    batchNumber: 'LT2024001',
    location: 'Farmácia Central - Prateleira A1',
    requiresPrescription: false,
    isControlledSubstance: false,
    therapeuticClass: 'Analgésico não opioide',
    contraindications: ['Hipersensibilidade ao paracetamol', 'Insuficiência hepática grave'],
    sideEffects: ['Náusea', 'Vômito', 'Reações alérgicas'],
    storageConditions: 'Temperatura ambiente (15-30°C), local seco',
    status: 'available',
    lastUpdated: '2024-01-20T10:30:00Z'
  },
  {
    id: '2',
    name: 'Morfina 10mg/ml',
    activeIngredient: 'Sulfato de Morfina',
    dosage: '10mg/ml',
    form: 'injection',
    category: 'analgesic',
    manufacturer: 'Cristália',
    currentStock: 25,
    minStock: 10,
    maxStock: 100,
    unitCost: 15.80,
    totalValue: 395.00,
    expiryDate: '2024-08-15',
    batchNumber: 'MF2024005',
    location: 'Farmácia Central - Cofre A1',
    requiresPrescription: true,
    isControlledSubstance: true,
    controlledClass: 'A1',
    therapeuticClass: 'Analgésico opioide',
    contraindications: ['Depressão respiratória', 'Íleo paralítico', 'Hipersensibilidade'],
    sideEffects: ['Depressão respiratória', 'Sedação', 'Constipação', 'Náusea'],
    interactions: ['Álcool', 'Benzodiazepínicos', 'Antidepressivos'],
    storageConditions: 'Temperatura ambiente, protegido da luz, cofre',
    status: 'available',
    lastUpdated: '2024-01-20T14:15:00Z'
  },
  {
    id: '3',
    name: 'Amoxicilina 500mg',
    activeIngredient: 'Amoxicilina',
    dosage: '500mg',
    form: 'capsule',
    category: 'antibiotic',
    manufacturer: 'Medley',
    currentStock: 8,
    minStock: 30,
    maxStock: 200,
    unitCost: 0.85,
    totalValue: 6.80,
    expiryDate: '2024-06-30',
    batchNumber: 'AM2024003',
    location: 'Farmácia Central - Prateleira B2',
    requiresPrescription: true,
    isControlledSubstance: false,
    therapeuticClass: 'Antibiótico beta-lactâmico',
    contraindications: ['Alergia à penicilina', 'Mononucleose'],
    sideEffects: ['Diarreia', 'Náusea', 'Reações alérgicas'],
    interactions: ['Anticoagulantes', 'Metotrexato'],
    storageConditions: 'Temperatura ambiente (15-30°C), local seco',
    status: 'low_stock',
    lastUpdated: '2024-01-20T16:45:00Z'
  }
]

const mockMovements: MedicationMovement[] = [
  {
    id: '1',
    medicationId: '1',
    medicationName: 'Paracetamol 500mg',
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
    medicationId: '3',
    medicationName: 'Amoxicilina 500mg',
    type: 'exit',
    quantity: 22,
    previousStock: 30,
    newStock: 8,
    reason: 'Dispensação para pacientes',
    location: 'Farmácia Central',
    performedBy: 'Maria Santos',
    patientId: 'PAT001',
    prescriptionId: 'PRES001',
    timestamp: '2024-01-20T14:15:00Z'
  }
]

const mockAlerts: MedicationAlert[] = [
  {
    id: '1',
    medicationId: '3',
    medicationName: 'Amoxicilina 500mg',
    type: 'low_stock',
    priority: 'high',
    message: 'Estoque abaixo do mínimo (8/30)',
    createdAt: '2024-01-20T16:45:00Z',
    isRead: false,
    isResolved: false
  },
  {
    id: '2',
    medicationId: '2',
    medicationName: 'Morfina 10mg/ml',
    type: 'expiring',
    priority: 'critical',
    message: 'Medicamento vence em 15 dias',
    createdAt: '2024-01-20T08:00:00Z',
    isRead: false,
    isResolved: false
  }
]

export function useMedications(): UseMedicationsReturn {
  const [medications, setMedications] = useState<Medication[]>(mockMedications)
  const [movements, setMovements] = useState<MedicationMovement[]>(mockMovements)
  const [alerts, setAlerts] = useState<MedicationAlert[]>(mockAlerts)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calcular estatísticas
  const stats: MedicationStats = {
    totalMedications: medications.length,
    totalValue: medications.reduce((sum, med) => sum + med.totalValue, 0),
    lowStockCount: medications.filter(med => med.status === 'low_stock').length,
    outOfStockCount: medications.filter(med => med.status === 'out_of_stock').length,
    expiringCount: medications.filter(med => {
      const expiry = new Date(med.expiryDate)
      const today = new Date()
      const diffTime = expiry.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays <= 30 && diffDays > 0
    }).length,
    expiredCount: medications.filter(med => med.status === 'expired').length,
    controlledCount: medications.filter(med => med.isControlledSubstance).length,
    prescriptionRequiredCount: medications.filter(med => med.requiresPrescription).length,
    categoriesDistribution: medications.reduce((acc, med) => {
      acc[med.category] = (acc[med.category] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    monthlyConsumption: 0, // Calculado baseado nas movimentações
    averageStockLevel: medications.length > 0 ? 
      medications.reduce((sum, med) => sum + (med.currentStock / med.maxStock), 0) / medications.length * 100 : 0
  }

  // Adicionar medicamento
  const addMedication = useCallback(async (newMedication: Omit<Medication, 'id' | 'lastUpdated' | 'totalValue'>) => {
    setLoading(true)
    setError(null)
    
    try {
      const medication: Medication = {
        ...newMedication,
        id: Date.now().toString(),
        totalValue: newMedication.currentStock * newMedication.unitCost,
        lastUpdated: new Date().toISOString()
      }
      
      setMedications(prev => [...prev, medication])
      
      // Adicionar movimento de entrada
      await addMovement({
        medicationId: medication.id,
        medicationName: medication.name,
        type: 'entry',
        quantity: medication.currentStock,
        previousStock: 0,
        newStock: medication.currentStock,
        reason: 'Medicamento adicionado ao inventário',
        location: medication.location,
        performedBy: 'Sistema',
        batchNumber: medication.batchNumber,
        expiryDate: medication.expiryDate,
        cost: medication.totalValue
      })
      
    } catch (err) {
      setError('Erro ao adicionar medicamento')
      console.error('Erro ao adicionar medicamento:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Atualizar medicamento
  const updateMedication = useCallback(async (id: string, updates: Partial<Medication>) => {
    setLoading(true)
    setError(null)
    
    try {
      setMedications(prev => prev.map(med => {
        if (med.id === id) {
          const updated = { ...med, ...updates, lastUpdated: new Date().toISOString() }
          // Recalcular valor total se estoque ou custo mudaram
          if (updates.currentStock !== undefined || updates.unitCost !== undefined) {
            updated.totalValue = updated.currentStock * updated.unitCost
          }
          return updated
        }
        return med
      }))
    } catch (err) {
      setError('Erro ao atualizar medicamento')
      console.error('Erro ao atualizar medicamento:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Deletar medicamento
  const deleteMedication = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      setMedications(prev => prev.filter(med => med.id !== id))
      setMovements(prev => prev.filter(movement => movement.medicationId !== id))
      setAlerts(prev => prev.filter(alert => alert.medicationId !== id))
    } catch (err) {
      setError('Erro ao deletar medicamento')
      console.error('Erro ao deletar medicamento:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Atualizar estoque
  const updateStock = useCallback(async (id: string, newStock: number, reason: string, batchNumber?: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const medication = medications.find(med => med.id === id)
      if (!medication) throw new Error('Medicamento não encontrado')
      
      const previousStock = medication.currentStock
      const quantity = newStock - previousStock
      const movementType: MedicationMovement['type'] = 
        quantity > 0 ? 'entry' : quantity < 0 ? 'exit' : 'adjustment'
      
      // Determinar novo status
      let newStatus: Medication['status'] = 'available'
      if (newStock === 0) {
        newStatus = 'out_of_stock'
      } else if (newStock <= medication.minStock) {
        newStatus = 'low_stock'
      }
      
      // Verificar se está vencido
      const expiry = new Date(medication.expiryDate)
      const today = new Date()
      if (expiry < today) {
        newStatus = 'expired'
      }
      
      // Atualizar medicamento
      await updateMedication(id, {
        currentStock: newStock,
        totalValue: newStock * medication.unitCost,
        status: newStatus
      })
      
      // Adicionar movimento
      await addMovement({
        medicationId: id,
        medicationName: medication.name,
        type: movementType,
        quantity: Math.abs(quantity),
        previousStock,
        newStock,
        reason,
        location: medication.location,
        performedBy: 'Sistema',
        batchNumber: batchNumber || medication.batchNumber
      })
      
    } catch (err) {
      setError('Erro ao atualizar estoque')
      console.error('Erro ao atualizar estoque:', err)
    } finally {
      setLoading(false)
    }
  }, [medications, updateMedication])

  // Dispensar medicamento
  const dispenseMedication = useCallback(async (id: string, quantity: number, patientId: string, prescriptionId?: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const medication = medications.find(med => med.id === id)
      if (!medication) throw new Error('Medicamento não encontrado')
      
      if (medication.currentStock < quantity) {
        throw new Error('Estoque insuficiente')
      }
      
      // Validar prescrição se necessário
      if (medication.requiresPrescription && !prescriptionId) {
        throw new Error('Prescrição obrigatória para este medicamento')
      }
      
      const newStock = medication.currentStock - quantity
      
      // Atualizar estoque
      await updateStock(id, newStock, `Dispensação para paciente ${patientId}`)
      
      // Adicionar movimento específico de dispensação
      await addMovement({
        medicationId: id,
        medicationName: medication.name,
        type: 'exit',
        quantity,
        previousStock: medication.currentStock,
        newStock,
        reason: 'Dispensação para paciente',
        location: medication.location,
        performedBy: 'Sistema',
        patientId,
        prescriptionId,
        batchNumber: medication.batchNumber
      })
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao dispensar medicamento')
      console.error('Erro ao dispensar medicamento:', err)
    } finally {
      setLoading(false)
    }
  }, [medications, updateStock])

  // Receber medicamento
  const receiveMedication = useCallback(async (id: string, quantity: number, batchNumber: string, expiryDate: string, cost?: number) => {
    setLoading(true)
    setError(null)
    
    try {
      const medication = medications.find(med => med.id === id)
      if (!medication) throw new Error('Medicamento não encontrado')
      
      const newStock = medication.currentStock + quantity
      const newCost = cost || medication.unitCost
      
      // Atualizar medicamento
      await updateMedication(id, {
        currentStock: newStock,
        totalValue: newStock * newCost,
        unitCost: newCost,
        batchNumber,
        expiryDate,
        status: 'available'
      })
      
      // Adicionar movimento
      await addMovement({
        medicationId: id,
        medicationName: medication.name,
        type: 'entry',
        quantity,
        previousStock: medication.currentStock,
        newStock,
        reason: 'Recebimento de estoque',
        location: medication.location,
        performedBy: 'Sistema',
        batchNumber,
        expiryDate,
        cost: cost ? quantity * cost : undefined
      })
      
    } catch (err) {
      setError('Erro ao receber medicamento')
      console.error('Erro ao receber medicamento:', err)
    } finally {
      setLoading(false)
    }
  }, [medications, updateMedication])

  // Obter movimentações de um medicamento
  const getMedicationMovements = useCallback((medicationId: string) => {
    return movements.filter(movement => movement.medicationId === medicationId)
  }, [movements])

  // Adicionar movimentação
  const addMovement = useCallback(async (newMovement: Omit<MedicationMovement, 'id' | 'timestamp'>) => {
    try {
      const movement: MedicationMovement = {
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

  // Buscar medicamentos
  const searchMedications = useCallback((query: string) => {
    if (!query.trim()) return medications
    
    const lowercaseQuery = query.toLowerCase()
    return medications.filter(med => 
      med.name.toLowerCase().includes(lowercaseQuery) ||
      med.activeIngredient.toLowerCase().includes(lowercaseQuery) ||
      med.manufacturer.toLowerCase().includes(lowercaseQuery) ||
      med.therapeuticClass.toLowerCase().includes(lowercaseQuery)
    )
  }, [medications])

  // Filtrar por categoria
  const filterByCategory = useCallback((category: Medication['category']) => {
    return medications.filter(med => med.category === category)
  }, [medications])

  // Filtrar por status
  const filterByStatus = useCallback((status: Medication['status']) => {
    return medications.filter(med => med.status === status)
  }, [medications])

  // Filtrar por controlados
  const filterByControlled = useCallback((controlled: boolean) => {
    return medications.filter(med => med.isControlledSubstance === controlled)
  }, [medications])

  // Filtrar por prescrição
  const filterByPrescription = useCallback((requiresPrescription: boolean) => {
    return medications.filter(med => med.requiresPrescription === requiresPrescription)
  }, [medications])

  // Verificar interações
  const checkInteractions = useCallback((medicationIds: string[]) => {
    const interactions: string[] = []
    
    // Lógica simplificada de verificação de interações
    // Em uma implementação real, isso seria mais complexo
    const selectedMedications = medications.filter(med => medicationIds.includes(med.id))
    
    selectedMedications.forEach(med1 => {
      selectedMedications.forEach(med2 => {
        if (med1.id !== med2.id && med1.interactions && med2.activeIngredient) {
          if (med1.interactions.some(interaction => 
            med2.activeIngredient.toLowerCase().includes(interaction.toLowerCase())
          )) {
            interactions.push(`Possível interação entre ${med1.name} e ${med2.name}`)
          }
        }
      })
    })
    
    return interactions
  }, [medications])

  // Validar prescrição
  const validatePrescription = useCallback((medicationId: string, patientId: string) => {
    const medication = medications.find(med => med.id === medicationId)
    if (!medication) return false
    
    // Lógica simplificada de validação
    // Em uma implementação real, verificaria prescrições válidas
    if (medication.requiresPrescription) {
      // Simular verificação de prescrição válida
      return patientId.length > 0
    }
    
    return true
  }, [medications])

  // Atualizar dados
  const refreshData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Simular chamada à API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Em uma implementação real, aqui faria as chamadas para a API
      // setMedications(await medicationsService.getMedications())
      // setMovements(await medicationsService.getMovements())
      // setAlerts(await medicationsService.getAlerts())
      
    } catch (err) {
      setError('Erro ao atualizar dados')
      console.error('Erro ao atualizar dados:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Exportar medicamentos
  const exportMedications = useCallback(async (format: 'csv' | 'excel' | 'pdf') => {
    setLoading(true)
    setError(null)
    
    try {
      // Simular exportação
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log(`Exportando medicamentos em formato ${format}`)
      
    } catch (err) {
      setError('Erro ao exportar medicamentos')
      console.error('Erro ao exportar medicamentos:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Gerar relatório
  const generateReport = useCallback(async (type: 'inventory' | 'consumption' | 'expiry' | 'controlled') => {
    setLoading(true)
    setError(null)
    
    try {
      // Simular geração de relatório
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      let reportData
      switch (type) {
        case 'inventory':
          reportData = { medications, stats }
          break
        case 'consumption':
          reportData = { movements: movements.filter(m => m.type === 'exit') }
          break
        case 'expiry':
          reportData = { 
            medications: medications.filter(med => {
              const expiry = new Date(med.expiryDate)
              const today = new Date()
              const diffTime = expiry.getTime() - today.getTime()
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
              return diffDays <= 90
            })
          }
          break
        case 'controlled':
          reportData = { 
            medications: medications.filter(med => med.isControlledSubstance),
            movements: movements.filter(m => {
              const med = medications.find(medication => medication.id === m.medicationId)
              return med?.isControlledSubstance
            })
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
  }, [medications, stats, movements])

  // Verificar alertas automaticamente
  useEffect(() => {
    const checkAlerts = () => {
      const newAlerts: MedicationAlert[] = []
      
      medications.forEach(med => {
        // Verificar estoque baixo
        if (med.currentStock <= med.minStock && med.status !== 'out_of_stock') {
          const existingAlert = alerts.find(alert => 
            alert.medicationId === med.id && 
            alert.type === 'low_stock' && 
            !alert.isResolved
          )
          
          if (!existingAlert) {
            newAlerts.push({
              id: `alert-${Date.now()}-${med.id}`,
              medicationId: med.id,
              medicationName: med.name,
              type: 'low_stock',
              priority: med.isControlledSubstance ? 'critical' : 'high',
              message: `Estoque abaixo do mínimo (${med.currentStock}/${med.minStock})`,
              createdAt: new Date().toISOString(),
              isRead: false,
              isResolved: false
            })
          }
        }
        
        // Verificar medicamentos vencendo
        const expiry = new Date(med.expiryDate)
        const today = new Date()
        const diffTime = expiry.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        
        if (diffDays <= 30 && diffDays > 0) {
          const existingAlert = alerts.find(alert => 
            alert.medicationId === med.id && 
            alert.type === 'expiring' && 
            !alert.isResolved
          )
          
          if (!existingAlert) {
            newAlerts.push({
              id: `alert-exp-${Date.now()}-${med.id}`,
              medicationId: med.id,
              medicationName: med.name,
              type: 'expiring',
              priority: diffDays <= 7 ? 'critical' : 'medium',
              message: `Medicamento vence em ${diffDays} dias`,
              createdAt: new Date().toISOString(),
              isRead: false,
              isResolved: false
            })
          }
        }
        
        // Verificar medicamentos vencidos
        if (diffDays <= 0 && med.status !== 'expired') {
          const existingAlert = alerts.find(alert => 
            alert.medicationId === med.id && 
            alert.type === 'expired' && 
            !alert.isResolved
          )
          
          if (!existingAlert) {
            newAlerts.push({
              id: `alert-expired-${Date.now()}-${med.id}`,
              medicationId: med.id,
              medicationName: med.name,
              type: 'expired',
              priority: 'critical',
              message: 'Medicamento vencido - remover do estoque',
              createdAt: new Date().toISOString(),
              isRead: false,
              isResolved: false
            })
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
  }, [medications, alerts])

  return {
    // Estado
    medications,
    stats,
    movements,
    alerts,
    loading,
    error,
    
    // Ações CRUD
    addMedication,
    updateMedication,
    deleteMedication,
    
    // Gestão de estoque
    updateStock,
    dispenseMedication,
    receiveMedication,
    
    // Movimentações
    getMedicationMovements,
    addMovement,
    
    // Alertas
    markAlertAsRead,
    markAlertAsResolved,
    dismissAlert,
    
    // Filtros e busca
    searchMedications,
    filterByCategory,
    filterByStatus,
    filterByControlled,
    filterByPrescription,
    
    // Validações
    checkInteractions,
    validatePrescription,
    
    // Utilitários
    refreshData,
    exportMedications,
    generateReport
  }
}