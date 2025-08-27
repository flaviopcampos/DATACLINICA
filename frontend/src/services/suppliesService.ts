// Serviço para gerenciar operações de suprimentos médicos

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

interface Supply {
  id: string
  name: string
  description?: string
  category: 'medical_devices' | 'consumables' | 'pharmaceuticals' | 'surgical' | 'diagnostic' | 'protective' | 'cleaning' | 'office' | 'other'
  subcategory?: string
  brand?: string
  manufacturer?: string
  supplier?: string
  sku?: string
  barcode?: string
  unit: 'unit' | 'box' | 'pack' | 'bottle' | 'vial' | 'tube' | 'roll' | 'sheet' | 'kg' | 'g' | 'ml' | 'l'
  unitCost: number
  currentStock: number
  minStock: number
  maxStock: number
  reorderPoint: number
  reorderQuantity: number
  location: string
  department: string
  expiryDate?: string
  batchNumber?: string
  sterile: boolean
  controlled: boolean
  requiresPrescription: boolean
  storageConditions?: {
    temperature?: {
      min: number
      max: number
      unit: 'celsius' | 'fahrenheit'
    }
    humidity?: {
      min: number
      max: number
    }
    lightSensitive?: boolean
    specialConditions?: string
  }
  status: 'active' | 'inactive' | 'discontinued' | 'recalled'
  criticality: 'low' | 'medium' | 'high' | 'critical'
  lastRestocked?: string
  lastUsed?: string
  averageConsumption?: number // por mês
  leadTime?: number // dias
  notes?: string
  attachments?: Array<{
    id: string
    name: string
    type: string
    url: string
    uploadedAt: string
  }>
  createdAt: string
  lastUpdated: string
}

interface SupplyMovement {
  id: string
  supplyId: string
  supplyName: string
  type: 'in' | 'out' | 'transfer' | 'adjustment' | 'waste' | 'return'
  quantity: number
  unit: string
  unitCost?: number
  totalCost?: number
  fromLocation?: string
  toLocation?: string
  fromDepartment?: string
  toDepartment?: string
  batchNumber?: string
  expiryDate?: string
  reason: string
  reference?: string // número do pedido, receita, etc.
  performedBy: string
  authorizedBy?: string
  patient?: {
    id: string
    name: string
    record: string
  }
  notes?: string
  timestamp: string
}

interface SupplyAlert {
  id: string
  supplyId: string
  supplyName: string
  type: 'low_stock' | 'out_of_stock' | 'expiring_soon' | 'expired' | 'reorder_point' | 'overstock' | 'recall'
  priority: 'low' | 'medium' | 'high' | 'critical'
  message: string
  details?: {
    currentStock?: number
    minStock?: number
    reorderPoint?: number
    expiryDate?: string
    daysToExpiry?: number
    batchNumber?: string
    recallInfo?: string
  }
  createdAt: string
  isRead: boolean
  isResolved: boolean
}

interface SupplyOrder {
  id: string
  orderNumber: string
  supplier: {
    id: string
    name: string
    contact?: string
    email?: string
    phone?: string
  }
  department: string
  requestedBy: string
  authorizedBy?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'draft' | 'pending' | 'approved' | 'ordered' | 'partial' | 'received' | 'cancelled'
  items: Array<{
    supplyId: string
    supplyName: string
    quantity: number
    unit: string
    unitCost: number
    totalCost: number
    received?: number
    notes?: string
  }>
  subtotal: number
  tax: number
  shipping: number
  total: number
  expectedDelivery?: string
  actualDelivery?: string
  notes?: string
  attachments?: Array<{
    id: string
    name: string
    type: string
    url: string
  }>
  createdAt: string
  lastUpdated: string
}

interface SupplyStats {
  totalSupplies: number
  totalValue: number
  activeSupplies: number
  lowStockCount: number
  outOfStockCount: number
  expiringCount: number
  expiredCount: number
  reorderPointCount: number
  categoriesDistribution: Record<string, number>
  departmentsDistribution: Record<string, number>
  criticalityDistribution: Record<string, number>
  consumptionTrends: Array<{
    period: string
    consumption: number
    cost: number
  }>
  topConsumed: Array<{
    supplyId: string
    supplyName: string
    quantity: number
    cost: number
  }>
}

interface SupplyFilters {
  category?: string
  subcategory?: string
  department?: string
  location?: string
  status?: string
  criticality?: string
  brand?: string
  manufacturer?: string
  supplier?: string
  sterile?: boolean
  controlled?: boolean
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstock'
  expiryStatus?: 'valid' | 'expiring_soon' | 'expired'
  search?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

class SuppliesService {
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

  // === OPERAÇÕES DE SUPRIMENTOS ===

  // Obter todos os suprimentos
  async getSupplies(filters?: SupplyFilters): Promise<ApiResponse<PaginatedResponse<Supply>>> {
    const params = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
    }

    const queryString = params.toString()
    const endpoint = `/supplies${queryString ? `?${queryString}` : ''}`
    
    return this.request<PaginatedResponse<Supply>>(endpoint)
  }

  // Obter suprimento por ID
  async getSupplyById(id: string): Promise<ApiResponse<Supply>> {
    return this.request<Supply>(`/supplies/${id}`)
  }

  // Criar novo suprimento
  async createSupply(supply: Omit<Supply, 'id' | 'createdAt' | 'lastUpdated'>): Promise<ApiResponse<Supply>> {
    return this.request<Supply>('/supplies', {
      method: 'POST',
      body: JSON.stringify(supply),
    })
  }

  // Atualizar suprimento
  async updateSupply(id: string, updates: Partial<Supply>): Promise<ApiResponse<Supply>> {
    return this.request<Supply>(`/supplies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  // Deletar suprimento
  async deleteSupply(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/supplies/${id}`, {
      method: 'DELETE',
    })
  }

  // === GESTÃO DE ESTOQUE ===

  // Atualizar estoque
  async updateStock(
    id: string,
    quantity: number,
    type: 'set' | 'add' | 'subtract',
    reason: string,
    batchNumber?: string,
    expiryDate?: string,
    unitCost?: number,
    reference?: string
  ): Promise<ApiResponse<Supply>> {
    return this.request<Supply>(`/supplies/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({
        quantity,
        type,
        reason,
        batchNumber,
        expiryDate,
        unitCost,
        reference,
      }),
    })
  }

  // Consumir suprimento
  async consumeSupply(
    id: string,
    quantity: number,
    department: string,
    performedBy: string,
    patient?: {
      id: string
      name: string
      record: string
    },
    notes?: string
  ): Promise<ApiResponse<SupplyMovement>> {
    return this.request<SupplyMovement>(`/supplies/${id}/consume`, {
      method: 'POST',
      body: JSON.stringify({
        quantity,
        department,
        performedBy,
        patient,
        notes,
      }),
    })
  }

  // Receber suprimento
  async receiveSupply(
    id: string,
    quantity: number,
    unitCost: number,
    batchNumber?: string,
    expiryDate?: string,
    supplier?: string,
    orderId?: string,
    notes?: string
  ): Promise<ApiResponse<SupplyMovement>> {
    return this.request<SupplyMovement>(`/supplies/${id}/receive`, {
      method: 'POST',
      body: JSON.stringify({
        quantity,
        unitCost,
        batchNumber,
        expiryDate,
        supplier,
        orderId,
        notes,
      }),
    })
  }

  // Transferir suprimento
  async transferSupply(
    id: string,
    quantity: number,
    fromLocation: string,
    toLocation: string,
    fromDepartment: string,
    toDepartment: string,
    reason: string,
    performedBy: string,
    authorizedBy?: string
  ): Promise<ApiResponse<SupplyMovement>> {
    return this.request<SupplyMovement>(`/supplies/${id}/transfer`, {
      method: 'POST',
      body: JSON.stringify({
        quantity,
        fromLocation,
        toLocation,
        fromDepartment,
        toDepartment,
        reason,
        performedBy,
        authorizedBy,
      }),
    })
  }

  // === MOVIMENTAÇÕES ===

  // Obter movimentações
  async getMovements(
    supplyId?: string,
    type?: string,
    department?: string,
    startDate?: string,
    endDate?: string,
    page?: number,
    limit?: number
  ): Promise<ApiResponse<PaginatedResponse<SupplyMovement>>> {
    const params = new URLSearchParams()
    
    if (supplyId) params.append('supplyId', supplyId)
    if (type) params.append('type', type)
    if (department) params.append('department', department)
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    if (page) params.append('page', page.toString())
    if (limit) params.append('limit', limit.toString())

    const queryString = params.toString()
    const endpoint = `/supplies/movements${queryString ? `?${queryString}` : ''}`
    
    return this.request<PaginatedResponse<SupplyMovement>>(endpoint)
  }

  // === ALERTAS ===

  // Obter alertas
  async getAlerts(
    supplyId?: string,
    type?: string,
    priority?: string,
    isRead?: boolean,
    isResolved?: boolean,
    page?: number,
    limit?: number
  ): Promise<ApiResponse<PaginatedResponse<SupplyAlert>>> {
    const params = new URLSearchParams()
    
    if (supplyId) params.append('supplyId', supplyId)
    if (type) params.append('type', type)
    if (priority) params.append('priority', priority)
    if (isRead !== undefined) params.append('isRead', isRead.toString())
    if (isResolved !== undefined) params.append('isResolved', isResolved.toString())
    if (page) params.append('page', page.toString())
    if (limit) params.append('limit', limit.toString())

    const queryString = params.toString()
    const endpoint = `/supplies/alerts${queryString ? `?${queryString}` : ''}`
    
    return this.request<PaginatedResponse<SupplyAlert>>(endpoint)
  }

  // Marcar alerta como lido
  async markAlertAsRead(alertId: string): Promise<ApiResponse<SupplyAlert>> {
    return this.request<SupplyAlert>(`/supplies/alerts/${alertId}/read`, {
      method: 'PATCH',
    })
  }

  // Marcar alerta como resolvido
  async markAlertAsResolved(alertId: string): Promise<ApiResponse<SupplyAlert>> {
    return this.request<SupplyAlert>(`/supplies/alerts/${alertId}/resolve`, {
      method: 'PATCH',
    })
  }

  // Dispensar alerta
  async dismissAlert(alertId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/supplies/alerts/${alertId}`, {
      method: 'DELETE',
    })
  }

  // === PEDIDOS ===

  // Obter pedidos
  async getOrders(
    status?: string,
    supplier?: string,
    department?: string,
    startDate?: string,
    endDate?: string,
    page?: number,
    limit?: number
  ): Promise<ApiResponse<PaginatedResponse<SupplyOrder>>> {
    const params = new URLSearchParams()
    
    if (status) params.append('status', status)
    if (supplier) params.append('supplier', supplier)
    if (department) params.append('department', department)
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    if (page) params.append('page', page.toString())
    if (limit) params.append('limit', limit.toString())

    const queryString = params.toString()
    const endpoint = `/supplies/orders${queryString ? `?${queryString}` : ''}`
    
    return this.request<PaginatedResponse<SupplyOrder>>(endpoint)
  }

  // Obter pedido por ID
  async getOrderById(id: string): Promise<ApiResponse<SupplyOrder>> {
    return this.request<SupplyOrder>(`/supplies/orders/${id}`)
  }

  // Criar pedido
  async createOrder(order: Omit<SupplyOrder, 'id' | 'orderNumber' | 'createdAt' | 'lastUpdated'>): Promise<ApiResponse<SupplyOrder>> {
    return this.request<SupplyOrder>('/supplies/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    })
  }

  // Atualizar pedido
  async updateOrder(id: string, updates: Partial<SupplyOrder>): Promise<ApiResponse<SupplyOrder>> {
    return this.request<SupplyOrder>(`/supplies/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  // Atualizar status do pedido
  async updateOrderStatus(
    id: string,
    status: SupplyOrder['status'],
    notes?: string
  ): Promise<ApiResponse<SupplyOrder>> {
    return this.request<SupplyOrder>(`/supplies/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    })
  }

  // Receber pedido
  async receiveOrder(
    id: string,
    items: Array<{
      supplyId: string
      receivedQuantity: number
      batchNumber?: string
      expiryDate?: string
      notes?: string
    }>,
    notes?: string
  ): Promise<ApiResponse<SupplyOrder>> {
    return this.request<SupplyOrder>(`/supplies/orders/${id}/receive`, {
      method: 'POST',
      body: JSON.stringify({ items, notes }),
    })
  }

  // === ESTATÍSTICAS ===

  // Obter estatísticas
  async getStats(
    category?: string,
    department?: string,
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<SupplyStats>> {
    const params = new URLSearchParams()
    
    if (category) params.append('category', category)
    if (department) params.append('department', department)
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)

    const queryString = params.toString()
    const endpoint = `/supplies/stats${queryString ? `?${queryString}` : ''}`
    
    return this.request<SupplyStats>(endpoint)
  }

  // === RELATÓRIOS ===

  // Relatório de consumo
  async getConsumptionReport(
    startDate: string,
    endDate: string,
    supplyId?: string,
    category?: string,
    department?: string,
    groupBy?: 'day' | 'week' | 'month'
  ): Promise<ApiResponse<Array<{
    period: string
    supplyId?: string
    supplyName?: string
    category?: string
    department?: string
    quantity: number
    cost: number
  }>>> {
    const params = new URLSearchParams()
    params.append('startDate', startDate)
    params.append('endDate', endDate)
    
    if (supplyId) params.append('supplyId', supplyId)
    if (category) params.append('category', category)
    if (department) params.append('department', department)
    if (groupBy) params.append('groupBy', groupBy)

    const queryString = params.toString()
    const endpoint = `/supplies/reports/consumption?${queryString}`
    
    return this.request(endpoint)
  }

  // Relatório de validade
  async getExpiryReport(
    days?: number,
    category?: string,
    department?: string,
    location?: string
  ): Promise<ApiResponse<Array<{
    supplyId: string
    supplyName: string
    category: string
    batchNumber?: string
    expiryDate: string
    daysToExpiry: number
    currentStock: number
    location: string
    department: string
  }>>> {
    const params = new URLSearchParams()
    
    if (days) params.append('days', days.toString())
    if (category) params.append('category', category)
    if (department) params.append('department', department)
    if (location) params.append('location', location)

    const queryString = params.toString()
    const endpoint = `/supplies/reports/expiry${queryString ? `?${queryString}` : ''}`
    
    return this.request(endpoint)
  }

  // Relatório de estoque baixo
  async getLowStockReport(
    category?: string,
    department?: string,
    criticality?: string
  ): Promise<ApiResponse<Array<{
    supplyId: string
    supplyName: string
    category: string
    currentStock: number
    minStock: number
    reorderPoint: number
    department: string
    location: string
    criticality: string
    daysUntilStockout?: number
  }>>> {
    const params = new URLSearchParams()
    
    if (category) params.append('category', category)
    if (department) params.append('department', department)
    if (criticality) params.append('criticality', criticality)

    const queryString = params.toString()
    const endpoint = `/supplies/reports/low-stock${queryString ? `?${queryString}` : ''}`
    
    return this.request(endpoint)
  }

  // Análise de uso
  async getUsageAnalysis(
    supplyId: string,
    startDate: string,
    endDate: string,
    groupBy?: 'day' | 'week' | 'month'
  ): Promise<ApiResponse<{
    supply: Supply
    totalConsumption: number
    averageDaily: number
    averageWeekly: number
    averageMonthly: number
    peakUsage: {
      date: string
      quantity: number
    }
    trends: Array<{
      period: string
      quantity: number
      cost: number
    }>
    departments: Array<{
      department: string
      quantity: number
      percentage: number
    }>
    predictions: {
      nextMonthConsumption: number
      stockoutDate?: string
      reorderSuggestion: {
        quantity: number
        date: string
      }
    }
  }>> {
    const params = new URLSearchParams()
    params.append('startDate', startDate)
    params.append('endDate', endDate)
    
    if (groupBy) params.append('groupBy', groupBy)

    const queryString = params.toString()
    const endpoint = `/supplies/${supplyId}/usage-analysis?${queryString}`
    
    return this.request(endpoint)
  }

  // Gerar relatório
  async generateReport(
    type: 'inventory' | 'consumption' | 'expiry' | 'low_stock' | 'orders',
    format: 'pdf' | 'excel' | 'csv',
    filters?: SupplyFilters & {
      startDate?: string
      endDate?: string
    }
  ): Promise<ApiResponse<{ downloadUrl: string }>> {
    return this.request<{ downloadUrl: string }>(`/supplies/reports/${type}`, {
      method: 'POST',
      body: JSON.stringify({ format, filters }),
    })
  }

  // === BUSCA E FILTROS ===

  // Buscar suprimentos
  async searchSupplies(
    query: string,
    category?: string,
    department?: string,
    status?: string,
    limit?: number
  ): Promise<ApiResponse<Supply[]>> {
    const params = new URLSearchParams()
    params.append('q', query)
    
    if (category) params.append('category', category)
    if (department) params.append('department', department)
    if (status) params.append('status', status)
    if (limit) params.append('limit', limit.toString())

    const queryString = params.toString()
    const endpoint = `/supplies/search?${queryString}`
    
    return this.request<Supply[]>(endpoint)
  }

  // Obter categorias
  async getCategories(): Promise<ApiResponse<string[]>> {
    return this.request<string[]>('/supplies/categories')
  }

  // Obter subcategorias
  async getSubcategories(category?: string): Promise<ApiResponse<string[]>> {
    const params = category ? `?category=${category}` : ''
    return this.request<string[]>(`/supplies/subcategories${params}`)
  }

  // Obter marcas
  async getBrands(): Promise<ApiResponse<string[]>> {
    return this.request<string[]>('/supplies/brands')
  }

  // Obter fabricantes
  async getManufacturers(): Promise<ApiResponse<string[]>> {
    return this.request<string[]>('/supplies/manufacturers')
  }

  // Obter fornecedores
  async getSuppliers(): Promise<ApiResponse<Array<{
    id: string
    name: string
    contact?: string
    email?: string
    phone?: string
  }>>> {
    return this.request('/supplies/suppliers')
  }

  // Obter departamentos
  async getDepartments(): Promise<ApiResponse<string[]>> {
    return this.request<string[]>('/supplies/departments')
  }

  // Obter localizações
  async getLocations(): Promise<ApiResponse<string[]>> {
    return this.request<string[]>('/supplies/locations')
  }

  // === UTILITÁRIOS ===

  // Calcular ponto de reposição
  async calculateReorderPoint(
    supplyId: string,
    leadTime?: number,
    safetyStock?: number
  ): Promise<ApiResponse<{
    reorderPoint: number
    reorderQuantity: number
    averageConsumption: number
    leadTime: number
    safetyStock: number
    calculation: {
      formula: string
      explanation: string
    }
  }>> {
    return this.request(`/supplies/${supplyId}/reorder-point`, {
      method: 'POST',
      body: JSON.stringify({ leadTime, safetyStock }),
    })
  }

  // Prever falta de estoque
  async predictStockout(
    supplyId: string,
    days?: number
  ): Promise<ApiResponse<{
    currentStock: number
    averageConsumption: number
    predictedStockoutDate?: string
    daysUntilStockout?: number
    recommendation: {
      action: 'reorder_now' | 'reorder_soon' | 'monitor' | 'no_action'
      message: string
      suggestedQuantity?: number
    }
  }>> {
    const params = days ? `?days=${days}` : ''
    return this.request(`/supplies/${supplyId}/predict-stockout${params}`)
  }

  // === ANEXOS ===

  // Upload de anexo
  async uploadAttachment(
    supplyId: string,
    file: File,
    type: 'datasheet' | 'certificate' | 'photo' | 'manual' | 'other'
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

    return this.request(`/supplies/${supplyId}/attachments`, {
      method: 'POST',
      body: formData,
      headers: {}, // Não definir Content-Type para FormData
    })
  }

  // Deletar anexo
  async deleteAttachment(
    supplyId: string,
    attachmentId: string
  ): Promise<ApiResponse<void>> {
    return this.request<void>(`/supplies/${supplyId}/attachments/${attachmentId}`, {
      method: 'DELETE',
    })
  }

  // === IMPORTAÇÃO/EXPORTAÇÃO ===

  // Exportar suprimentos
  async exportSupplies(
    format: 'csv' | 'excel',
    filters?: SupplyFilters
  ): Promise<ApiResponse<{ downloadUrl: string }>> {
    return this.request<{ downloadUrl: string }>('/supplies/export', {
      method: 'POST',
      body: JSON.stringify({ format, filters }),
    })
  }

  // Importar suprimentos
  async importSupplies(
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
    }>('/supplies/import', {
      method: 'POST',
      body: formData,
      headers: {}, // Não definir Content-Type para FormData
    })
  }

  // === CONFIGURAÇÕES ===

  // Obter configurações de alertas
  async getAlertSettings(): Promise<ApiResponse<{
    lowStockThreshold: number
    expiryWarningDays: number
    criticalExpiryDays: number
    autoReorderEnabled: boolean
    emailNotifications: boolean
    smsNotifications: boolean
  }>> {
    return this.request('/supplies/settings/alerts')
  }

  // Atualizar configurações de alertas
  async updateAlertSettings(settings: {
    lowStockThreshold?: number
    expiryWarningDays?: number
    criticalExpiryDays?: number
    autoReorderEnabled?: boolean
    emailNotifications?: boolean
    smsNotifications?: boolean
  }): Promise<ApiResponse<void>> {
    return this.request('/supplies/settings/alerts', {
      method: 'PUT',
      body: JSON.stringify(settings),
    })
  }
}

// Instância singleton do serviço
const suppliesService = new SuppliesService()

export default suppliesService
export { SuppliesService }
export type {
  Supply,
  SupplyMovement,
  SupplyAlert,
  SupplyOrder,
  SupplyStats,
  SupplyFilters,
  ApiResponse,
  PaginatedResponse,
}