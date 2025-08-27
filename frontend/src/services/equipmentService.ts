// Serviço para gerenciar operações de equipamentos médicos

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
  responsibleTechnician?: string
  notes?: string
  attachments?: Array<{
    id: string
    name: string
    type: string
    url: string
    uploadedAt: string
  }>
  lastUpdated: string
}

interface EquipmentMovement {
  id: string
  equipmentId: string
  equipmentName: string
  type: 'transfer' | 'maintenance' | 'repair' | 'calibration' | 'inspection' | 'retirement'
  fromLocation?: string
  toLocation?: string
  fromDepartment?: string
  toDepartment?: string
  reason: string
  performedBy: string
  authorizedBy?: string
  cost?: number
  startDate: string
  endDate?: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  notes?: string
  timestamp: string
}

interface EquipmentAlert {
  id: string
  equipmentId: string
  equipmentName: string
  type: 'calibration_due' | 'calibration_overdue' | 'maintenance_due' | 'maintenance_overdue' | 'warranty_expiring' | 'malfunction' | 'recall'
  priority: 'low' | 'medium' | 'high' | 'critical'
  message: string
  details?: {
    dueDate?: string
    daysOverdue?: number
    lastPerformed?: string
    nextScheduled?: string
    warrantyExpiry?: string
    malfunctionDescription?: string
    recallInfo?: string
  }
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
  partsReplaced?: Array<{
    name: string
    partNumber?: string
    quantity: number
    cost: number
  }>
  startDate: string
  endDate: string
  nextScheduled?: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  notes?: string
  attachments?: Array<{
    id: string
    name: string
    type: string
    url: string
  }>
  createdAt: string
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
  criticalityDistribution: Record<string, number>
  ageDistribution: Record<string, number>
}

interface EquipmentFilters {
  category?: string
  department?: string
  location?: string
  operationalStatus?: string
  calibrationStatus?: string
  maintenanceStatus?: string
  criticality?: string
  manufacturer?: string
  riskClass?: string
  warrantyStatus?: 'valid' | 'expiring' | 'expired'
  search?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

class EquipmentService {
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

  // === OPERAÇÕES DE EQUIPAMENTOS ===

  // Obter todos os equipamentos
  async getEquipment(filters?: EquipmentFilters): Promise<ApiResponse<PaginatedResponse<Equipment>>> {
    const params = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
    }

    const queryString = params.toString()
    const endpoint = `/equipment${queryString ? `?${queryString}` : ''}`
    
    return this.request<PaginatedResponse<Equipment>>(endpoint)
  }

  // Obter equipamento por ID
  async getEquipmentById(id: string): Promise<ApiResponse<Equipment>> {
    return this.request<Equipment>(`/equipment/${id}`)
  }

  // Criar novo equipamento
  async createEquipment(equipment: Omit<Equipment, 'id' | 'currentValue' | 'lastUpdated'>): Promise<ApiResponse<Equipment>> {
    return this.request<Equipment>('/equipment', {
      method: 'POST',
      body: JSON.stringify(equipment),
    })
  }

  // Atualizar equipamento
  async updateEquipment(id: string, updates: Partial<Equipment>): Promise<ApiResponse<Equipment>> {
    return this.request<Equipment>(`/equipment/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  // Deletar equipamento
  async deleteEquipment(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/equipment/${id}`, {
      method: 'DELETE',
    })
  }

  // === GESTÃO DE STATUS ===

  // Atualizar status operacional
  async updateOperationalStatus(
    id: string,
    status: Equipment['operationalStatus'],
    reason: string,
    notes?: string
  ): Promise<ApiResponse<Equipment>> {
    return this.request<Equipment>(`/equipment/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        operationalStatus: status,
        reason,
        notes,
      }),
    })
  }

  // Transferir equipamento
  async transferEquipment(
    id: string,
    toLocation: string,
    toDepartment: string,
    reason: string,
    authorizedBy?: string
  ): Promise<ApiResponse<EquipmentMovement>> {
    return this.request<EquipmentMovement>(`/equipment/${id}/transfer`, {
      method: 'POST',
      body: JSON.stringify({
        toLocation,
        toDepartment,
        reason,
        authorizedBy,
      }),
    })
  }

  // === MANUTENÇÃO ===

  // Agendar manutenção
  async scheduleMaintenance(
    equipmentId: string,
    type: MaintenanceRecord['type'],
    description: string,
    scheduledDate: string,
    performedBy: string,
    company?: string,
    estimatedCost?: number
  ): Promise<ApiResponse<MaintenanceRecord>> {
    return this.request<MaintenanceRecord>('/equipment/maintenance', {
      method: 'POST',
      body: JSON.stringify({
        equipmentId,
        type,
        description,
        scheduledDate,
        performedBy,
        company,
        estimatedCost,
      }),
    })
  }

  // Iniciar manutenção
  async startMaintenance(
    maintenanceId: string,
    notes?: string
  ): Promise<ApiResponse<MaintenanceRecord>> {
    return this.request<MaintenanceRecord>(`/equipment/maintenance/${maintenanceId}/start`, {
      method: 'PATCH',
      body: JSON.stringify({ notes }),
    })
  }

  // Concluir manutenção
  async completeMaintenance(
    maintenanceId: string,
    actualCost: number,
    partsReplaced?: MaintenanceRecord['partsReplaced'],
    nextScheduled?: string,
    notes?: string
  ): Promise<ApiResponse<MaintenanceRecord>> {
    return this.request<MaintenanceRecord>(`/equipment/maintenance/${maintenanceId}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({
        actualCost,
        partsReplaced,
        nextScheduled,
        notes,
      }),
    })
  }

  // Obter histórico de manutenção
  async getMaintenanceHistory(
    equipmentId?: string,
    type?: string,
    status?: string,
    startDate?: string,
    endDate?: string,
    page?: number,
    limit?: number
  ): Promise<ApiResponse<PaginatedResponse<MaintenanceRecord>>> {
    const params = new URLSearchParams()
    
    if (equipmentId) params.append('equipmentId', equipmentId)
    if (type) params.append('type', type)
    if (status) params.append('status', status)
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    if (page) params.append('page', page.toString())
    if (limit) params.append('limit', limit.toString())

    const queryString = params.toString()
    const endpoint = `/equipment/maintenance${queryString ? `?${queryString}` : ''}`
    
    return this.request<PaginatedResponse<MaintenanceRecord>>(endpoint)
  }

  // === CALIBRAÇÃO ===

  // Agendar calibração
  async scheduleCalibration(
    equipmentId: string,
    scheduledDate: string,
    performedBy: string,
    company?: string,
    estimatedCost?: number
  ): Promise<ApiResponse<MaintenanceRecord>> {
    return this.request<MaintenanceRecord>('/equipment/calibration', {
      method: 'POST',
      body: JSON.stringify({
        equipmentId,
        type: 'calibration',
        description: 'Calibração programada',
        scheduledDate,
        performedBy,
        company,
        estimatedCost,
      }),
    })
  }

  // Concluir calibração
  async completeCalibration(
    calibrationId: string,
    actualCost: number,
    nextCalibration: string,
    certificateNumber?: string,
    notes?: string
  ): Promise<ApiResponse<MaintenanceRecord>> {
    return this.request<MaintenanceRecord>(`/equipment/calibration/${calibrationId}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({
        actualCost,
        nextScheduled: nextCalibration,
        certificateNumber,
        notes,
      }),
    })
  }

  // === MOVIMENTAÇÕES ===

  // Obter movimentações
  async getMovements(
    equipmentId?: string,
    type?: string,
    status?: string,
    startDate?: string,
    endDate?: string,
    page?: number,
    limit?: number
  ): Promise<ApiResponse<PaginatedResponse<EquipmentMovement>>> {
    const params = new URLSearchParams()
    
    if (equipmentId) params.append('equipmentId', equipmentId)
    if (type) params.append('type', type)
    if (status) params.append('status', status)
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    if (page) params.append('page', page.toString())
    if (limit) params.append('limit', limit.toString())

    const queryString = params.toString()
    const endpoint = `/equipment/movements${queryString ? `?${queryString}` : ''}`
    
    return this.request<PaginatedResponse<EquipmentMovement>>(endpoint)
  }

  // === ALERTAS ===

  // Obter alertas
  async getAlerts(
    equipmentId?: string,
    type?: string,
    priority?: string,
    isRead?: boolean,
    isResolved?: boolean,
    page?: number,
    limit?: number
  ): Promise<ApiResponse<PaginatedResponse<EquipmentAlert>>> {
    const params = new URLSearchParams()
    
    if (equipmentId) params.append('equipmentId', equipmentId)
    if (type) params.append('type', type)
    if (priority) params.append('priority', priority)
    if (isRead !== undefined) params.append('isRead', isRead.toString())
    if (isResolved !== undefined) params.append('isResolved', isResolved.toString())
    if (page) params.append('page', page.toString())
    if (limit) params.append('limit', limit.toString())

    const queryString = params.toString()
    const endpoint = `/equipment/alerts${queryString ? `?${queryString}` : ''}`
    
    return this.request<PaginatedResponse<EquipmentAlert>>(endpoint)
  }

  // Marcar alerta como lido
  async markAlertAsRead(alertId: string): Promise<ApiResponse<EquipmentAlert>> {
    return this.request<EquipmentAlert>(`/equipment/alerts/${alertId}/read`, {
      method: 'PATCH',
    })
  }

  // Marcar alerta como resolvido
  async markAlertAsResolved(alertId: string): Promise<ApiResponse<EquipmentAlert>> {
    return this.request<EquipmentAlert>(`/equipment/alerts/${alertId}/resolve`, {
      method: 'PATCH',
    })
  }

  // === ESTATÍSTICAS ===

  // Obter estatísticas
  async getStats(
    category?: string,
    department?: string,
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<EquipmentStats>> {
    const params = new URLSearchParams()
    
    if (category) params.append('category', category)
    if (department) params.append('department', department)
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)

    const queryString = params.toString()
    const endpoint = `/equipment/stats${queryString ? `?${queryString}` : ''}`
    
    return this.request<EquipmentStats>(endpoint)
  }

  // Obter custos de manutenção
  async getMaintenanceCosts(
    startDate: string,
    endDate: string,
    equipmentId?: string,
    category?: string,
    type?: string,
    groupBy?: 'day' | 'week' | 'month'
  ): Promise<ApiResponse<Array<{
    period: string
    equipmentId?: string
    equipmentName?: string
    category?: string
    type: string
    cost: number
    count: number
  }>>> {
    const params = new URLSearchParams()
    params.append('startDate', startDate)
    params.append('endDate', endDate)
    
    if (equipmentId) params.append('equipmentId', equipmentId)
    if (category) params.append('category', category)
    if (type) params.append('type', type)
    if (groupBy) params.append('groupBy', groupBy)

    const queryString = params.toString()
    const endpoint = `/equipment/stats/maintenance-costs?${queryString}`
    
    return this.request(endpoint)
  }

  // === RELATÓRIOS ===

  // Gerar relatório de equipamentos
  async generateEquipmentReport(
    format: 'pdf' | 'excel' | 'csv',
    filters?: EquipmentFilters
  ): Promise<ApiResponse<{ downloadUrl: string }>> {
    return this.request<{ downloadUrl: string }>('/equipment/reports/inventory', {
      method: 'POST',
      body: JSON.stringify({ format, filters }),
    })
  }

  // Gerar relatório de manutenção
  async generateMaintenanceReport(
    format: 'pdf' | 'excel' | 'csv',
    startDate: string,
    endDate: string,
    equipmentId?: string,
    type?: string,
    status?: string
  ): Promise<ApiResponse<{ downloadUrl: string }>> {
    return this.request<{ downloadUrl: string }>('/equipment/reports/maintenance', {
      method: 'POST',
      body: JSON.stringify({
        format,
        startDate,
        endDate,
        equipmentId,
        type,
        status,
      }),
    })
  }

  // Gerar relatório de calibração
  async generateCalibrationReport(
    format: 'pdf' | 'excel' | 'csv',
    startDate: string,
    endDate: string,
    equipmentId?: string,
    status?: string
  ): Promise<ApiResponse<{ downloadUrl: string }>> {
    return this.request<{ downloadUrl: string }>('/equipment/reports/calibration', {
      method: 'POST',
      body: JSON.stringify({
        format,
        startDate,
        endDate,
        equipmentId,
        status,
      }),
    })
  }

  // === BUSCA E FILTROS ===

  // Buscar equipamentos
  async searchEquipment(
    query: string,
    category?: string,
    department?: string,
    operationalStatus?: string,
    limit?: number
  ): Promise<ApiResponse<Equipment[]>> {
    const params = new URLSearchParams()
    params.append('q', query)
    
    if (category) params.append('category', category)
    if (department) params.append('department', department)
    if (operationalStatus) params.append('operationalStatus', operationalStatus)
    if (limit) params.append('limit', limit.toString())

    const queryString = params.toString()
    const endpoint = `/equipment/search?${queryString}`
    
    return this.request<Equipment[]>(endpoint)
  }

  // Obter categorias
  async getCategories(): Promise<ApiResponse<string[]>> {
    return this.request<string[]>('/equipment/categories')
  }

  // Obter fabricantes
  async getManufacturers(): Promise<ApiResponse<string[]>> {
    return this.request<string[]>('/equipment/manufacturers')
  }

  // Obter departamentos
  async getDepartments(): Promise<ApiResponse<string[]>> {
    return this.request<string[]>('/equipment/departments')
  }

  // Obter localizações
  async getLocations(): Promise<ApiResponse<string[]>> {
    return this.request<string[]>('/equipment/locations')
  }

  // === ANEXOS ===

  // Upload de anexo
  async uploadAttachment(
    equipmentId: string,
    file: File,
    type: 'manual' | 'certificate' | 'warranty' | 'photo' | 'other'
  ): Promise<ApiResponse<{
    id: string
    name: string
    type: string
    url: string
    uploadedAt: string
  }>> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    return this.request(`/equipment/${equipmentId}/attachments`, {
      method: 'POST',
      body: formData,
      headers: {}, // Não definir Content-Type para FormData
    })
  }

  // Deletar anexo
  async deleteAttachment(
    equipmentId: string,
    attachmentId: string
  ): Promise<ApiResponse<void>> {
    return this.request<void>(`/equipment/${equipmentId}/attachments/${attachmentId}`, {
      method: 'DELETE',
    })
  }

  // === IMPORTAÇÃO/EXPORTAÇÃO ===

  // Exportar equipamentos
  async exportEquipment(
    format: 'csv' | 'excel',
    filters?: EquipmentFilters
  ): Promise<ApiResponse<{ downloadUrl: string }>> {
    return this.request<{ downloadUrl: string }>('/equipment/export', {
      method: 'POST',
      body: JSON.stringify({ format, filters }),
    })
  }

  // Importar equipamentos
  async importEquipment(
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
    }>('/equipment/import', {
      method: 'POST',
      body: formData,
      headers: {}, // Não definir Content-Type para FormData
    })
  }
}

// Instância singleton do serviço
const equipmentService = new EquipmentService()

export default equipmentService
export { EquipmentService }
export type {
  Equipment,
  EquipmentMovement,
  EquipmentAlert,
  MaintenanceRecord,
  EquipmentStats,
  EquipmentFilters,
  ApiResponse,
  PaginatedResponse,
}