// Serviço para gerenciar operações de inventário

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

interface InventoryItem {
  id: string
  name: string
  description?: string
  category: 'medication' | 'equipment' | 'supply'
  subcategory?: string
  currentStock: number
  minStock: number
  maxStock: number
  unit: string
  unitCost: number
  totalValue: number
  location: string
  department: string
  status: 'available' | 'low_stock' | 'out_of_stock' | 'expired' | 'maintenance'
  lastUpdated: string
}

interface InventoryMovement {
  id: string
  itemId: string
  itemName: string
  type: 'receipt' | 'consumption' | 'transfer' | 'adjustment' | 'return'
  quantity: number
  unit: string
  fromLocation?: string
  toLocation?: string
  reason: string
  performedBy: string
  cost?: number
  timestamp: string
}

interface InventoryAlert {
  id: string
  itemId: string
  itemName: string
  type: 'low_stock' | 'out_of_stock' | 'expiring' | 'expired' | 'maintenance_due'
  priority: 'low' | 'medium' | 'high' | 'critical'
  message: string
  createdAt: string
  isRead: boolean
  isResolved: boolean
}

interface InventoryStats {
  totalItems: number
  totalValue: number
  availableCount: number
  lowStockCount: number
  outOfStockCount: number
  expiredCount: number
  categoriesDistribution: Record<string, number>
  departmentsDistribution: Record<string, number>
}

interface InventoryFilters {
  category?: string
  department?: string
  status?: string
  location?: string
  search?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

class InventoryService {
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

  // === OPERAÇÕES DE ITENS ===

  // Obter todos os itens do inventário
  async getItems(filters?: InventoryFilters): Promise<ApiResponse<PaginatedResponse<InventoryItem>>> {
    const params = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
    }

    const queryString = params.toString()
    const endpoint = `/inventory/items${queryString ? `?${queryString}` : ''}`
    
    return this.request<PaginatedResponse<InventoryItem>>(endpoint)
  }

  // Obter item por ID
  async getItemById(id: string): Promise<ApiResponse<InventoryItem>> {
    return this.request<InventoryItem>(`/inventory/items/${id}`)
  }

  // Criar novo item
  async createItem(item: Omit<InventoryItem, 'id' | 'totalValue' | 'lastUpdated'>): Promise<ApiResponse<InventoryItem>> {
    return this.request<InventoryItem>('/inventory/items', {
      method: 'POST',
      body: JSON.stringify(item),
    })
  }

  // Atualizar item
  async updateItem(id: string, updates: Partial<InventoryItem>): Promise<ApiResponse<InventoryItem>> {
    return this.request<InventoryItem>(`/inventory/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  // Deletar item
  async deleteItem(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/inventory/items/${id}`, {
      method: 'DELETE',
    })
  }

  // Atualizar estoque
  async updateStock(
    id: string,
    quantity: number,
    type: 'receipt' | 'consumption' | 'adjustment',
    reason: string,
    location?: string
  ): Promise<ApiResponse<InventoryItem>> {
    return this.request<InventoryItem>(`/inventory/items/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({
        quantity,
        type,
        reason,
        location,
      }),
    })
  }

  // Transferir item
  async transferItem(
    id: string,
    quantity: number,
    fromLocation: string,
    toLocation: string,
    reason: string
  ): Promise<ApiResponse<InventoryMovement>> {
    return this.request<InventoryMovement>(`/inventory/items/${id}/transfer`, {
      method: 'POST',
      body: JSON.stringify({
        quantity,
        fromLocation,
        toLocation,
        reason,
      }),
    })
  }

  // === MOVIMENTAÇÕES ===

  // Obter movimentações
  async getMovements(
    itemId?: string,
    startDate?: string,
    endDate?: string,
    type?: string,
    page?: number,
    limit?: number
  ): Promise<ApiResponse<PaginatedResponse<InventoryMovement>>> {
    const params = new URLSearchParams()
    
    if (itemId) params.append('itemId', itemId)
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    if (type) params.append('type', type)
    if (page) params.append('page', page.toString())
    if (limit) params.append('limit', limit.toString())

    const queryString = params.toString()
    const endpoint = `/inventory/movements${queryString ? `?${queryString}` : ''}`
    
    return this.request<PaginatedResponse<InventoryMovement>>(endpoint)
  }

  // Criar movimentação
  async createMovement(movement: Omit<InventoryMovement, 'id' | 'timestamp'>): Promise<ApiResponse<InventoryMovement>> {
    return this.request<InventoryMovement>('/inventory/movements', {
      method: 'POST',
      body: JSON.stringify(movement),
    })
  }

  // === ALERTAS ===

  // Obter alertas
  async getAlerts(
    isRead?: boolean,
    isResolved?: boolean,
    priority?: string,
    type?: string,
    page?: number,
    limit?: number
  ): Promise<ApiResponse<PaginatedResponse<InventoryAlert>>> {
    const params = new URLSearchParams()
    
    if (isRead !== undefined) params.append('isRead', isRead.toString())
    if (isResolved !== undefined) params.append('isResolved', isResolved.toString())
    if (priority) params.append('priority', priority)
    if (type) params.append('type', type)
    if (page) params.append('page', page.toString())
    if (limit) params.append('limit', limit.toString())

    const queryString = params.toString()
    const endpoint = `/inventory/alerts${queryString ? `?${queryString}` : ''}`
    
    return this.request<PaginatedResponse<InventoryAlert>>(endpoint)
  }

  // Marcar alerta como lido
  async markAlertAsRead(alertId: string): Promise<ApiResponse<InventoryAlert>> {
    return this.request<InventoryAlert>(`/inventory/alerts/${alertId}/read`, {
      method: 'PATCH',
    })
  }

  // Marcar alerta como resolvido
  async markAlertAsResolved(alertId: string): Promise<ApiResponse<InventoryAlert>> {
    return this.request<InventoryAlert>(`/inventory/alerts/${alertId}/resolve`, {
      method: 'PATCH',
    })
  }

  // Dispensar alerta
  async dismissAlert(alertId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/inventory/alerts/${alertId}`, {
      method: 'DELETE',
    })
  }

  // === ESTATÍSTICAS ===

  // Obter estatísticas do inventário
  async getStats(
    category?: string,
    department?: string,
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<InventoryStats>> {
    const params = new URLSearchParams()
    
    if (category) params.append('category', category)
    if (department) params.append('department', department)
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)

    const queryString = params.toString()
    const endpoint = `/inventory/stats${queryString ? `?${queryString}` : ''}`
    
    return this.request<InventoryStats>(endpoint)
  }

  // === RELATÓRIOS ===

  // Gerar relatório de inventário
  async generateInventoryReport(
    format: 'pdf' | 'excel' | 'csv',
    filters?: InventoryFilters
  ): Promise<ApiResponse<{ downloadUrl: string }>> {
    const params = new URLSearchParams()
    params.append('format', format)
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
    }

    return this.request<{ downloadUrl: string }>('/inventory/reports/inventory', {
      method: 'POST',
      body: JSON.stringify({ format, filters }),
    })
  }

  // Gerar relatório de movimentações
  async generateMovementsReport(
    format: 'pdf' | 'excel' | 'csv',
    startDate: string,
    endDate: string,
    itemId?: string,
    type?: string
  ): Promise<ApiResponse<{ downloadUrl: string }>> {
    return this.request<{ downloadUrl: string }>('/inventory/reports/movements', {
      method: 'POST',
      body: JSON.stringify({
        format,
        startDate,
        endDate,
        itemId,
        type,
      }),
    })
  }

  // Gerar relatório de estoque baixo
  async generateLowStockReport(
    format: 'pdf' | 'excel' | 'csv',
    category?: string,
    department?: string
  ): Promise<ApiResponse<{ downloadUrl: string }>> {
    return this.request<{ downloadUrl: string }>('/inventory/reports/low-stock', {
      method: 'POST',
      body: JSON.stringify({
        format,
        category,
        department,
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
    return this.request<{ downloadUrl: string }>('/inventory/reports/expiry', {
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

  // Buscar itens
  async searchItems(
    query: string,
    category?: string,
    department?: string,
    limit?: number
  ): Promise<ApiResponse<InventoryItem[]>> {
    const params = new URLSearchParams()
    params.append('q', query)
    
    if (category) params.append('category', category)
    if (department) params.append('department', department)
    if (limit) params.append('limit', limit.toString())

    const queryString = params.toString()
    const endpoint = `/inventory/search?${queryString}`
    
    return this.request<InventoryItem[]>(endpoint)
  }

  // Obter categorias
  async getCategories(): Promise<ApiResponse<string[]>> {
    return this.request<string[]>('/inventory/categories')
  }

  // Obter departamentos
  async getDepartments(): Promise<ApiResponse<string[]>> {
    return this.request<string[]>('/inventory/departments')
  }

  // Obter localizações
  async getLocations(): Promise<ApiResponse<string[]>> {
    return this.request<string[]>('/inventory/locations')
  }

  // === IMPORTAÇÃO/EXPORTAÇÃO ===

  // Exportar inventário
  async exportInventory(
    format: 'csv' | 'excel',
    filters?: InventoryFilters
  ): Promise<ApiResponse<{ downloadUrl: string }>> {
    return this.request<{ downloadUrl: string }>('/inventory/export', {
      method: 'POST',
      body: JSON.stringify({ format, filters }),
    })
  }

  // Importar inventário
  async importInventory(
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
    }>('/inventory/import', {
      method: 'POST',
      body: formData,
      headers: {}, // Não definir Content-Type para FormData
    })
  }

  // === AUDITORIA ===

  // Obter log de auditoria
  async getAuditLog(
    itemId?: string,
    action?: string,
    userId?: string,
    startDate?: string,
    endDate?: string,
    page?: number,
    limit?: number
  ): Promise<ApiResponse<PaginatedResponse<{
    id: string
    itemId: string
    itemName: string
    action: string
    userId: string
    userName: string
    changes: Record<string, any>
    timestamp: string
  }>>> {
    const params = new URLSearchParams()
    
    if (itemId) params.append('itemId', itemId)
    if (action) params.append('action', action)
    if (userId) params.append('userId', userId)
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    if (page) params.append('page', page.toString())
    if (limit) params.append('limit', limit.toString())

    const queryString = params.toString()
    const endpoint = `/inventory/audit${queryString ? `?${queryString}` : ''}`
    
    return this.request(endpoint)
  }

  // === CONFIGURAÇÕES ===

  // Obter configurações de alertas
  async getAlertSettings(): Promise<ApiResponse<{
    lowStockThreshold: number
    expiryWarningDays: number
    criticalItems: string[]
    notificationMethods: string[]
    autoReorderEnabled: boolean
  }>> {
    return this.request('/inventory/settings/alerts')
  }

  // Atualizar configurações de alertas
  async updateAlertSettings(settings: {
    lowStockThreshold?: number
    expiryWarningDays?: number
    criticalItems?: string[]
    notificationMethods?: string[]
    autoReorderEnabled?: boolean
  }): Promise<ApiResponse<void>> {
    return this.request('/inventory/settings/alerts', {
      method: 'PUT',
      body: JSON.stringify(settings),
    })
  }
}

// Instância singleton do serviço
const inventoryService = new InventoryService()

export default inventoryService
export { InventoryService }
export type {
  InventoryItem,
  InventoryMovement,
  InventoryAlert,
  InventoryStats,
  InventoryFilters,
  ApiResponse,
  PaginatedResponse,
}