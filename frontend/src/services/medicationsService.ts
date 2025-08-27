// Serviço para gerenciar operações de medicamentos

// Tipos base
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface Medication {
  id: string
  name: string
  activeIngredient: string
  dosage: string
  form: 'tablet' | 'capsule' | 'liquid' | 'injection' | 'cream' | 'drops' | 'inhaler' | 'patch'
  category: 'analgesic' | 'antibiotic' | 'antiviral' | 'cardiovascular' | 'diabetes' | 'respiratory' | 'neurological' | 'other'
  manufacturer: string
  currentStock: number
  minStock: number
  maxStock: number
  unitCost: number
  totalValue: number
  expiryDate: string
  batchNumber: string
  location: string
  department: string
  requiresPrescription: boolean
  isControlled: boolean
  controlledClass?: 'A1' | 'A2' | 'A3' | 'B1' | 'B2' | 'C1' | 'C2'
  therapeuticClass: string
  contraindications?: string[]
  sideEffects?: string[]
  interactions?: string[]
  storageConditions: string
  status: 'available' | 'low_stock' | 'out_of_stock' | 'expired' | 'recalled'
  lastUpdated: string
}

interface MedicationMovement {
  id: string
  medicationId: string
  medicationName: string
  type: 'receipt' | 'dispensing' | 'return' | 'transfer' | 'adjustment' | 'disposal'
  quantity: number
  unit: string
  fromLocation?: string
  toLocation?: string
  patientId?: string
  patientName?: string
  prescriptionId?: string
  reason: string
  performedBy: string
  authorizedBy?: string
  cost?: number
  batchNumber?: string
  expiryDate?: string
  timestamp: string
}

interface MedicationAlert {
  id: string
  medicationId: string
  medicationName: string
  type: 'low_stock' | 'out_of_stock' | 'expiring' | 'expired' | 'recall' | 'interaction'
  priority: 'low' | 'medium' | 'high' | 'critical'
  message: string
  details?: {
    currentStock?: number
    minStock?: number
    expiryDate?: string
    daysUntilExpiry?: number
    interactionWith?: string[]
    recallInfo?: string
  }
  createdAt: string
  isRead: boolean
  isResolved: boolean
}

interface MedicationStats {
  totalMedications: number
  totalValue: number
  availableCount: number
  lowStockCount: number
  outOfStockCount: number
  expiringCount: number
  expiredCount: number
  controlledCount: number
  prescriptionRequiredCount: number
  categoriesDistribution: Record<string, number>
  formsDistribution: Record<string, number>
  departmentsDistribution: Record<string, number>
}

interface MedicationFilters {
  category?: string
  form?: string
  department?: string
  status?: string
  location?: string
  requiresPrescription?: boolean
  isControlled?: boolean
  controlledClass?: string
  therapeuticClass?: string
  manufacturer?: string
  expiringInDays?: number
  search?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

interface DrugInteraction {
  medicationId1: string
  medicationName1: string
  medicationId2: string
  medicationName2: string
  severity: 'minor' | 'moderate' | 'major' | 'contraindicated'
  description: string
  clinicalEffect: string
  management: string
}

interface PrescriptionValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
  interactions: DrugInteraction[]
  contraindications: string[]
  dosageRecommendations?: string[]
}

class MedicationsService {
  private baseUrl: string
  private apiKey?: string

  constructor(baseUrl: string = '/api', apiKey?: string) {
    this.baseUrl = baseUrl
    this.apiKey = apiKey
  }

  // Configurar headers padrão
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`
    }

    return headers
  }

  // Fazer requisição HTTP
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('API request failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      }
    }
  }

  // === OPERAÇÕES DE MEDICAMENTOS ===

  // Obter todos os medicamentos
  async getMedications(filters?: MedicationFilters): Promise<ApiResponse<PaginatedResponse<Medication>>> {
    const params = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
    }

    const queryString = params.toString()
    const endpoint = `/medications${queryString ? `?${queryString}` : ''}`
    
    return this.request<PaginatedResponse<Medication>>(endpoint)
  }

  // Obter medicamento por ID
  async getMedicationById(id: string): Promise<ApiResponse<Medication>> {
    return this.request<Medication>(`/medications/${id}`)
  }

  // Criar novo medicamento
  async createMedication(medication: Omit<Medication, 'id' | 'totalValue' | 'lastUpdated'>): Promise<ApiResponse<Medication>> {
    return this.request<Medication>('/medications', {
      method: 'POST',
      body: JSON.stringify(medication),
    })
  }

  // Atualizar medicamento
  async updateMedication(id: string, updates: Partial<Medication>): Promise<ApiResponse<Medication>> {
    return this.request<Medication>(`/medications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  // Deletar medicamento
  async deleteMedication(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/medications/${id}`, {
      method: 'DELETE',
    })
  }

  // === GESTÃO DE ESTOQUE ===

  // Atualizar estoque
  async updateStock(
    id: string,
    quantity: number,
    type: 'receipt' | 'dispensing' | 'adjustment',
    reason: string,
    batchNumber?: string,
    expiryDate?: string,
    location?: string
  ): Promise<ApiResponse<Medication>> {
    return this.request<Medication>(`/medications/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({
        quantity,
        type,
        reason,
        batchNumber,
        expiryDate,
        location,
      }),
    })
  }

  // Dispensar medicamento
  async dispenseMedication(
    id: string,
    quantity: number,
    patientId: string,
    prescriptionId?: string,
    authorizedBy?: string,
    notes?: string
  ): Promise<ApiResponse<MedicationMovement>> {
    return this.request<MedicationMovement>(`/medications/${id}/dispense`, {
      method: 'POST',
      body: JSON.stringify({
        quantity,
        patientId,
        prescriptionId,
        authorizedBy,
        notes,
      }),
    })
  }

  // Receber medicamento
  async receiveMedication(
    id: string,
    quantity: number,
    batchNumber: string,
    expiryDate: string,
    unitCost: number,
    supplierId?: string,
    invoiceNumber?: string
  ): Promise<ApiResponse<MedicationMovement>> {
    return this.request<MedicationMovement>(`/medications/${id}/receive`, {
      method: 'POST',
      body: JSON.stringify({
        quantity,
        batchNumber,
        expiryDate,
        unitCost,
        supplierId,
        invoiceNumber,
      }),
    })
  }

  // Transferir medicamento
  async transferMedication(
    id: string,
    quantity: number,
    fromLocation: string,
    toLocation: string,
    reason: string,
    authorizedBy?: string
  ): Promise<ApiResponse<MedicationMovement>> {
    return this.request<MedicationMovement>(`/medications/${id}/transfer`, {
      method: 'POST',
      body: JSON.stringify({
        quantity,
        fromLocation,
        toLocation,
        reason,
        authorizedBy,
      }),
    })
  }

  // === MOVIMENTAÇÕES ===

  // Obter movimentações
  async getMovements(
    medicationId?: string,
    patientId?: string,
    type?: string,
    startDate?: string,
    endDate?: string,
    page?: number,
    limit?: number
  ): Promise<ApiResponse<PaginatedResponse<MedicationMovement>>> {
    const params = new URLSearchParams()
    
    if (medicationId) params.append('medicationId', medicationId)
    if (patientId) params.append('patientId', patientId)
    if (type) params.append('type', type)
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    if (page) params.append('page', page.toString())
    if (limit) params.append('limit', limit.toString())

    const queryString = params.toString()
    const endpoint = `/medications/movements${queryString ? `?${queryString}` : ''}`
    
    return this.request<PaginatedResponse<MedicationMovement>>(endpoint)
  }

  // === ALERTAS ===

  // Obter alertas
  async getAlerts(
    medicationId?: string,
    type?: string,
    priority?: string,
    isRead?: boolean,
    isResolved?: boolean,
    page?: number,
    limit?: number
  ): Promise<ApiResponse<PaginatedResponse<MedicationAlert>>> {
    const params = new URLSearchParams()
    
    if (medicationId) params.append('medicationId', medicationId)
    if (type) params.append('type', type)
    if (priority) params.append('priority', priority)
    if (isRead !== undefined) params.append('isRead', isRead.toString())
    if (isResolved !== undefined) params.append('isResolved', isResolved.toString())
    if (page) params.append('page', page.toString())
    if (limit) params.append('limit', limit.toString())

    const queryString = params.toString()
    const endpoint = `/medications/alerts${queryString ? `?${queryString}` : ''}`
    
    return this.request<PaginatedResponse<MedicationAlert>>(endpoint)
  }

  // Marcar alerta como lido
  async markAlertAsRead(alertId: string): Promise<ApiResponse<MedicationAlert>> {
    return this.request<MedicationAlert>(`/medications/alerts/${alertId}/read`, {
      method: 'PATCH',
    })
  }

  // Marcar alerta como resolvido
  async markAlertAsResolved(alertId: string): Promise<ApiResponse<MedicationAlert>> {
    return this.request<MedicationAlert>(`/medications/alerts/${alertId}/resolve`, {
      method: 'PATCH',
    })
  }

  // === VALIDAÇÕES E INTERAÇÕES ===

  // Verificar interações medicamentosas
  async checkDrugInteractions(medicationIds: string[]): Promise<ApiResponse<DrugInteraction[]>> {
    return this.request<DrugInteraction[]>('/medications/interactions/check', {
      method: 'POST',
      body: JSON.stringify({ medicationIds }),
    })
  }

  // Validar prescrição
  async validatePrescription(
    medicationId: string,
    patientId: string,
    dosage: string,
    frequency: string,
    duration: string,
    otherMedications?: string[]
  ): Promise<ApiResponse<PrescriptionValidation>> {
    return this.request<PrescriptionValidation>('/medications/prescriptions/validate', {
      method: 'POST',
      body: JSON.stringify({
        medicationId,
        patientId,
        dosage,
        frequency,
        duration,
        otherMedications,
      }),
    })
  }

  // Obter interações de um medicamento
  async getMedicationInteractions(medicationId: string): Promise<ApiResponse<DrugInteraction[]>> {
    return this.request<DrugInteraction[]>(`/medications/${medicationId}/interactions`)
  }

  // === ESTATÍSTICAS ===

  // Obter estatísticas
  async getStats(
    category?: string,
    department?: string,
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<MedicationStats>> {
    const params = new URLSearchParams()
    
    if (category) params.append('category', category)
    if (department) params.append('department', department)
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)

    const queryString = params.toString()
    const endpoint = `/medications/stats${queryString ? `?${queryString}` : ''}`
    
    return this.request<MedicationStats>(endpoint)
  }

  // Obter consumo por período
  async getConsumptionStats(
    startDate: string,
    endDate: string,
    medicationId?: string,
    department?: string,
    groupBy?: 'day' | 'week' | 'month'
  ): Promise<ApiResponse<Array<{
    period: string
    medicationId: string
    medicationName: string
    quantity: number
    cost: number
  }>>> {
    const params = new URLSearchParams()
    params.append('startDate', startDate)
    params.append('endDate', endDate)
    
    if (medicationId) params.append('medicationId', medicationId)
    if (department) params.append('department', department)
    if (groupBy) params.append('groupBy', groupBy)

    const queryString = params.toString()
    const endpoint = `/medications/stats/consumption?${queryString}`
    
    return this.request(endpoint)
  }

  // === RELATÓRIOS ===

  // Gerar relatório de medicamentos
  async generateMedicationsReport(
    format: 'pdf' | 'excel' | 'csv',
    filters?: MedicationFilters
  ): Promise<ApiResponse<{ downloadUrl: string }>> {
    return this.request<{ downloadUrl: string }>('/medications/reports/inventory', {
      method: 'POST',
      body: JSON.stringify({ format, filters }),
    })
  }

  // Gerar relatório de dispensação
  async generateDispensingReport(
    format: 'pdf' | 'excel' | 'csv',
    startDate: string,
    endDate: string,
    medicationId?: string,
    patientId?: string,
    department?: string
  ): Promise<ApiResponse<{ downloadUrl: string }>> {
    return this.request<{ downloadUrl: string }>('/medications/reports/dispensing', {
      method: 'POST',
      body: JSON.stringify({
        format,
        startDate,
        endDate,
        medicationId,
        patientId,
        department,
      }),
    })
  }

  // Gerar relatório de medicamentos controlados
  async generateControlledMedicationsReport(
    format: 'pdf' | 'excel' | 'csv',
    startDate: string,
    endDate: string,
    controlledClass?: string
  ): Promise<ApiResponse<{ downloadUrl: string }>> {
    return this.request<{ downloadUrl: string }>('/medications/reports/controlled', {
      method: 'POST',
      body: JSON.stringify({
        format,
        startDate,
        endDate,
        controlledClass,
      }),
    })
  }

  // Gerar relatório de validade
  async generateExpiryReport(
    format: 'pdf' | 'excel' | 'csv',
    days: number = 30,
    category?: string,
    department?: string
  ): Promise<ApiResponse<{ downloadUrl: string }>> {
    return this.request<{ downloadUrl: string }>('/medications/reports/expiry', {
      method: 'POST',
      body: JSON.stringify({
        format,
        days,
        category,
        department,
      }),
    })
  }

  // === BUSCA E FILTROS ===

  // Buscar medicamentos
  async searchMedications(
    query: string,
    category?: string,
    form?: string,
    requiresPrescription?: boolean,
    isControlled?: boolean,
    limit?: number
  ): Promise<ApiResponse<Medication[]>> {
    const params = new URLSearchParams()
    params.append('q', query)
    
    if (category) params.append('category', category)
    if (form) params.append('form', form)
    if (requiresPrescription !== undefined) params.append('requiresPrescription', requiresPrescription.toString())
    if (isControlled !== undefined) params.append('isControlled', isControlled.toString())
    if (limit) params.append('limit', limit.toString())

    const queryString = params.toString()
    const endpoint = `/medications/search?${queryString}`
    
    return this.request<Medication[]>(endpoint)
  }

  // Obter categorias
  async getCategories(): Promise<ApiResponse<string[]>> {
    return this.request<string[]>('/medications/categories')
  }

  // Obter formas farmacêuticas
  async getForms(): Promise<ApiResponse<string[]>> {
    return this.request<string[]>('/medications/forms')
  }

  // Obter classes terapêuticas
  async getTherapeuticClasses(): Promise<ApiResponse<string[]>> {
    return this.request<string[]>('/medications/therapeutic-classes')
  }

  // Obter fabricantes
  async getManufacturers(): Promise<ApiResponse<string[]>> {
    return this.request<string[]>('/medications/manufacturers')
  }

  // === LOTES E VALIDADE ===

  // Obter lotes de um medicamento
  async getMedicationBatches(medicationId: string): Promise<ApiResponse<Array<{
    batchNumber: string
    expiryDate: string
    quantity: number
    location: string
    receivedDate: string
  }>>> {
    return this.request(`/medications/${medicationId}/batches`)
  }

  // Obter medicamentos vencendo
  async getExpiringMedications(
    days: number = 30,
    department?: string,
    category?: string
  ): Promise<ApiResponse<Array<Medication & {
    daysUntilExpiry: number
    batchesExpiring: Array<{
      batchNumber: string
      expiryDate: string
      quantity: number
    }>
  }>>> {
    const params = new URLSearchParams()
    params.append('days', days.toString())
    
    if (department) params.append('department', department)
    if (category) params.append('category', category)

    const queryString = params.toString()
    const endpoint = `/medications/expiring?${queryString}`
    
    return this.request(endpoint)
  }

  // === IMPORTAÇÃO/EXPORTAÇÃO ===

  // Exportar medicamentos
  async exportMedications(
    format: 'csv' | 'excel',
    filters?: MedicationFilters
  ): Promise<ApiResponse<{ downloadUrl: string }>> {
    return this.request<{ downloadUrl: string }>('/medications/export', {
      method: 'POST',
      body: JSON.stringify({ format, filters }),
    })
  }

  // Importar medicamentos
  async importMedications(
    file: File,
    options?: {
      updateExisting?: boolean
      skipErrors?: boolean
      dryRun?: boolean
    }
  ): Promise<ApiResponse<{ 
    imported: number
    updated: number
    errors: Array<{ row: number; error: string }>
  }>> {
    const formData = new FormData()
    formData.append('file', file)
    
    if (options) {
      formData.append('options', JSON.stringify(options))
    }

    return this.request<{
      imported: number
      updated: number
      errors: Array<{ row: number; error: string }>
    }>('/medications/import', {
      method: 'POST',
      body: formData,
      headers: {}, // Não definir Content-Type para FormData
    })
  }
}

// Instância singleton do serviço
const medicationsService = new MedicationsService()

export default medicationsService
export { MedicationsService }
export type {
  Medication,
  MedicationMovement,
  MedicationAlert,
  MedicationStats,
  MedicationFilters,
  DrugInteraction,
  PrescriptionValidation,
  ApiResponse,
  PaginatedResponse,
}