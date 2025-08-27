import { StockMovement } from '../hooks/useStockMovements'

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

// Additional types for stock operations
interface StockLevel {
  id: string
  itemId: string
  itemType: 'medication' | 'equipment' | 'supply'
  itemName: string
  currentStock: number
  reservedStock: number
  availableStock: number
  minimumStock: number
  maximumStock: number
  reorderPoint: number
  reorderQuantity: number
  location: string
  department: string
  lastUpdated: Date
  lastMovement?: StockMovement
}

interface StockAlert {
  id: string
  type: 'low_stock' | 'out_of_stock' | 'overstock' | 'expiring' | 'expired'
  severity: 'low' | 'medium' | 'high' | 'critical'
  itemId: string
  itemName: string
  itemType: 'medication' | 'equipment' | 'supply'
  currentStock: number
  threshold: number
  location: string
  department: string
  message: string
  createdAt: Date
  acknowledgedAt?: Date
  acknowledgedBy?: string
  resolvedAt?: Date
  resolvedBy?: string
}

interface StockTransfer {
  id: string
  fromLocation: string
  toLocation: string
  fromDepartment: string
  toDepartment: string
  items: Array<{
    itemId: string
    itemName: string
    itemType: 'medication' | 'equipment' | 'supply'
    quantity: number
    batchNumber?: string
    expirationDate?: Date
  }>
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled'
  requestedBy: string
  approvedBy?: string
  completedBy?: string
  requestedAt: Date
  approvedAt?: Date
  completedAt?: Date
  notes?: string
  trackingNumber?: string
}

interface StockAdjustment {
  id: string
  itemId: string
  itemName: string
  itemType: 'medication' | 'equipment' | 'supply'
  location: string
  department: string
  previousQuantity: number
  newQuantity: number
  adjustmentQuantity: number
  adjustmentType: 'increase' | 'decrease'
  reason: string
  adjustedBy: string
  adjustedAt: Date
  approvedBy?: string
  approvedAt?: Date
  notes?: string
  batchNumber?: string
  expirationDate?: Date
}

interface StockReservation {
  id: string
  itemId: string
  itemName: string
  itemType: 'medication' | 'equipment' | 'supply'
  quantity: number
  location: string
  department: string
  reservedBy: string
  reservedFor: string // patient ID, procedure ID, etc.
  reservationType: 'patient' | 'procedure' | 'maintenance' | 'other'
  reservedAt: Date
  expiresAt: Date
  status: 'active' | 'fulfilled' | 'expired' | 'cancelled'
  notes?: string
}

// API Response Types
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// HTTP Client with error handling
class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`
      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      }

      // Add authentication token if available
      const token = localStorage.getItem('authToken')
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        }
      }

      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message
      }
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

// Create API client instance
const apiClient = new ApiClient(API_BASE_URL)

// Stock Service
export class StockService {
  // Stock levels
  static async getStockLevels(
    itemType?: 'medication' | 'equipment' | 'supply',
    location?: string,
    department?: string,
    lowStockOnly?: boolean
  ): Promise<ApiResponse<StockLevel[]>> {
    const params = new URLSearchParams()
    if (itemType) params.append('itemType', itemType)
    if (location) params.append('location', location)
    if (department) params.append('department', department)
    if (lowStockOnly) params.append('lowStockOnly', 'true')

    return apiClient.get<StockLevel[]>(`/stock/levels?${params.toString()}`)
  }

  static async getStockLevel(itemId: string, location?: string): Promise<ApiResponse<StockLevel>> {
    const params = location ? `?location=${encodeURIComponent(location)}` : ''
    return apiClient.get<StockLevel>(`/stock/levels/${itemId}${params}`)
  }

  static async updateStockLevel(
    itemId: string,
    location: string,
    updates: {
      minimumStock?: number
      maximumStock?: number
      reorderPoint?: number
      reorderQuantity?: number
    }
  ): Promise<ApiResponse<StockLevel>> {
    return apiClient.patch<StockLevel>(`/stock/levels/${itemId}`, {
      location,
      ...updates
    })
  }

  // Stock movements
  static async getStockMovements(
    itemId?: string,
    itemType?: 'medication' | 'equipment' | 'supply',
    location?: string,
    department?: string,
    movementType?: string,
    startDate?: Date,
    endDate?: Date,
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<PaginatedResponse<StockMovement>>> {
    const params = new URLSearchParams()
    if (itemId) params.append('itemId', itemId)
    if (itemType) params.append('itemType', itemType)
    if (location) params.append('location', location)
    if (department) params.append('department', department)
    if (movementType) params.append('movementType', movementType)
    if (startDate) params.append('startDate', startDate.toISOString())
    if (endDate) params.append('endDate', endDate.toISOString())
    params.append('page', page.toString())
    params.append('limit', limit.toString())

    return apiClient.get<PaginatedResponse<StockMovement>>(`/stock/movements?${params.toString()}`)
  }

  static async createStockMovement(movement: Omit<StockMovement, 'id' | 'createdAt'>): Promise<ApiResponse<StockMovement>> {
    return apiClient.post<StockMovement>('/stock/movements', movement)
  }

  static async getStockMovement(id: string): Promise<ApiResponse<StockMovement>> {
    return apiClient.get<StockMovement>(`/stock/movements/${id}`)
  }

  static async updateStockMovement(id: string, updates: Partial<StockMovement>): Promise<ApiResponse<StockMovement>> {
    return apiClient.patch<StockMovement>(`/stock/movements/${id}`, updates)
  }

  static async deleteStockMovement(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/stock/movements/${id}`)
  }

  // Stock operations
  static async addStock(
    itemId: string,
    quantity: number,
    location: string,
    department: string,
    reason: string,
    performedBy: string,
    batchNumber?: string,
    expirationDate?: Date,
    lotNumber?: string,
    cost?: number,
    supplier?: string
  ): Promise<ApiResponse<StockMovement>> {
    return apiClient.post<StockMovement>('/stock/add', {
      itemId,
      quantity,
      location,
      department,
      reason,
      performedBy,
      batchNumber,
      expirationDate: expirationDate?.toISOString(),
      lotNumber,
      cost,
      supplier
    })
  }

  static async removeStock(
    itemId: string,
    quantity: number,
    location: string,
    department: string,
    reason: string,
    performedBy: string,
    batchNumber?: string,
    patientId?: string,
    procedureId?: string
  ): Promise<ApiResponse<StockMovement>> {
    return apiClient.post<StockMovement>('/stock/remove', {
      itemId,
      quantity,
      location,
      department,
      reason,
      performedBy,
      batchNumber,
      patientId,
      procedureId
    })
  }

  static async adjustStock(
    itemId: string,
    newQuantity: number,
    location: string,
    department: string,
    reason: string,
    performedBy: string,
    notes?: string
  ): Promise<ApiResponse<StockAdjustment>> {
    return apiClient.post<StockAdjustment>('/stock/adjust', {
      itemId,
      newQuantity,
      location,
      department,
      reason,
      performedBy,
      notes
    })
  }

  // Stock transfers
  static async createStockTransfer(
    transfer: Omit<StockTransfer, 'id' | 'status' | 'requestedAt'>
  ): Promise<ApiResponse<StockTransfer>> {
    return apiClient.post<StockTransfer>('/stock/transfers', transfer)
  }

  static async getStockTransfers(
    status?: string,
    fromLocation?: string,
    toLocation?: string,
    department?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ApiResponse<StockTransfer[]>> {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    if (fromLocation) params.append('fromLocation', fromLocation)
    if (toLocation) params.append('toLocation', toLocation)
    if (department) params.append('department', department)
    if (startDate) params.append('startDate', startDate.toISOString())
    if (endDate) params.append('endDate', endDate.toISOString())

    return apiClient.get<StockTransfer[]>(`/stock/transfers?${params.toString()}`)
  }

  static async getStockTransfer(id: string): Promise<ApiResponse<StockTransfer>> {
    return apiClient.get<StockTransfer>(`/stock/transfers/${id}`)
  }

  static async approveStockTransfer(id: string, approvedBy: string): Promise<ApiResponse<StockTransfer>> {
    return apiClient.post<StockTransfer>(`/stock/transfers/${id}/approve`, { approvedBy })
  }

  static async completeStockTransfer(id: string, completedBy: string): Promise<ApiResponse<StockTransfer>> {
    return apiClient.post<StockTransfer>(`/stock/transfers/${id}/complete`, { completedBy })
  }

  static async cancelStockTransfer(id: string, reason: string): Promise<ApiResponse<StockTransfer>> {
    return apiClient.post<StockTransfer>(`/stock/transfers/${id}/cancel`, { reason })
  }

  // Stock adjustments
  static async getStockAdjustments(
    itemId?: string,
    location?: string,
    department?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ApiResponse<StockAdjustment[]>> {
    const params = new URLSearchParams()
    if (itemId) params.append('itemId', itemId)
    if (location) params.append('location', location)
    if (department) params.append('department', department)
    if (startDate) params.append('startDate', startDate.toISOString())
    if (endDate) params.append('endDate', endDate.toISOString())

    return apiClient.get<StockAdjustment[]>(`/stock/adjustments?${params.toString()}`)
  }

  static async getStockAdjustment(id: string): Promise<ApiResponse<StockAdjustment>> {
    return apiClient.get<StockAdjustment>(`/stock/adjustments/${id}`)
  }

  static async approveStockAdjustment(id: string, approvedBy: string): Promise<ApiResponse<StockAdjustment>> {
    return apiClient.post<StockAdjustment>(`/stock/adjustments/${id}/approve`, { approvedBy })
  }

  // Stock reservations
  static async createStockReservation(
    reservation: Omit<StockReservation, 'id' | 'reservedAt' | 'status'>
  ): Promise<ApiResponse<StockReservation>> {
    return apiClient.post<StockReservation>('/stock/reservations', {
      ...reservation,
      expiresAt: reservation.expiresAt.toISOString()
    })
  }

  static async getStockReservations(
    itemId?: string,
    location?: string,
    department?: string,
    status?: string,
    reservedBy?: string
  ): Promise<ApiResponse<StockReservation[]>> {
    const params = new URLSearchParams()
    if (itemId) params.append('itemId', itemId)
    if (location) params.append('location', location)
    if (department) params.append('department', department)
    if (status) params.append('status', status)
    if (reservedBy) params.append('reservedBy', reservedBy)

    return apiClient.get<StockReservation[]>(`/stock/reservations?${params.toString()}`)
  }

  static async getStockReservation(id: string): Promise<ApiResponse<StockReservation>> {
    return apiClient.get<StockReservation>(`/stock/reservations/${id}`)
  }

  static async fulfillStockReservation(id: string): Promise<ApiResponse<StockReservation>> {
    return apiClient.post<StockReservation>(`/stock/reservations/${id}/fulfill`)
  }

  static async cancelStockReservation(id: string, reason?: string): Promise<ApiResponse<StockReservation>> {
    return apiClient.post<StockReservation>(`/stock/reservations/${id}/cancel`, { reason })
  }

  // Stock alerts
  static async getStockAlerts(
    type?: string,
    severity?: string,
    itemType?: 'medication' | 'equipment' | 'supply',
    location?: string,
    department?: string,
    acknowledged?: boolean
  ): Promise<ApiResponse<StockAlert[]>> {
    const params = new URLSearchParams()
    if (type) params.append('type', type)
    if (severity) params.append('severity', severity)
    if (itemType) params.append('itemType', itemType)
    if (location) params.append('location', location)
    if (department) params.append('department', department)
    if (acknowledged !== undefined) params.append('acknowledged', acknowledged.toString())

    return apiClient.get<StockAlert[]>(`/stock/alerts?${params.toString()}`)
  }

  static async acknowledgeStockAlert(id: string, acknowledgedBy: string): Promise<ApiResponse<StockAlert>> {
    return apiClient.post<StockAlert>(`/stock/alerts/${id}/acknowledge`, { acknowledgedBy })
  }

  static async resolveStockAlert(id: string, resolvedBy: string, notes?: string): Promise<ApiResponse<StockAlert>> {
    return apiClient.post<StockAlert>(`/stock/alerts/${id}/resolve`, { resolvedBy, notes })
  }

  // Stock counts and audits
  static async createStockCount(
    location: string,
    department: string,
    countedBy: string,
    items: Array<{
      itemId: string
      expectedQuantity: number
      actualQuantity: number
      batchNumber?: string
      expirationDate?: Date
      notes?: string
    }>
  ): Promise<ApiResponse<any>> {
    return apiClient.post<any>('/stock/counts', {
      location,
      department,
      countedBy,
      items: items.map(item => ({
        ...item,
        expirationDate: item.expirationDate?.toISOString()
      }))
    })
  }

  static async getStockCounts(
    location?: string,
    department?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams()
    if (location) params.append('location', location)
    if (department) params.append('department', department)
    if (startDate) params.append('startDate', startDate.toISOString())
    if (endDate) params.append('endDate', endDate.toISOString())

    return apiClient.get<any[]>(`/stock/counts?${params.toString()}`)
  }

  static async getStockDiscrepancies(
    location?: string,
    department?: string,
    threshold?: number
  ): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams()
    if (location) params.append('location', location)
    if (department) params.append('department', department)
    if (threshold) params.append('threshold', threshold.toString())

    return apiClient.get<any[]>(`/stock/discrepancies?${params.toString()}`)
  }

  // Batch and expiration tracking
  static async getBatches(
    itemId?: string,
    location?: string,
    expiringInDays?: number,
    expired?: boolean
  ): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams()
    if (itemId) params.append('itemId', itemId)
    if (location) params.append('location', location)
    if (expiringInDays) params.append('expiringInDays', expiringInDays.toString())
    if (expired !== undefined) params.append('expired', expired.toString())

    return apiClient.get<any[]>(`/stock/batches?${params.toString()}`)
  }

  static async updateBatchInfo(
    batchId: string,
    updates: {
      expirationDate?: Date
      quantity?: number
      notes?: string
    }
  ): Promise<ApiResponse<any>> {
    return apiClient.patch<any>(`/stock/batches/${batchId}`, {
      ...updates,
      expirationDate: updates.expirationDate?.toISOString()
    })
  }

  static async disposeBatch(
    batchId: string,
    reason: string,
    disposedBy: string,
    disposalMethod?: string
  ): Promise<ApiResponse<any>> {
    return apiClient.post<any>(`/stock/batches/${batchId}/dispose`, {
      reason,
      disposedBy,
      disposalMethod
    })
  }

  // Analytics and reporting
  static async getStockAnalytics(
    period: 'daily' | 'weekly' | 'monthly' | 'yearly',
    startDate?: Date,
    endDate?: Date,
    itemType?: 'medication' | 'equipment' | 'supply',
    location?: string,
    department?: string
  ): Promise<ApiResponse<any>> {
    const params = new URLSearchParams()
    params.append('period', period)
    if (startDate) params.append('startDate', startDate.toISOString())
    if (endDate) params.append('endDate', endDate.toISOString())
    if (itemType) params.append('itemType', itemType)
    if (location) params.append('location', location)
    if (department) params.append('department', department)

    return apiClient.get<any>(`/stock/analytics?${params.toString()}`)
  }

  static async getStockTurnoverReport(
    startDate: Date,
    endDate: Date,
    itemType?: 'medication' | 'equipment' | 'supply',
    location?: string
  ): Promise<ApiResponse<any>> {
    const params = new URLSearchParams()
    params.append('startDate', startDate.toISOString())
    params.append('endDate', endDate.toISOString())
    if (itemType) params.append('itemType', itemType)
    if (location) params.append('location', location)

    return apiClient.get<any>(`/stock/turnover-report?${params.toString()}`)
  }

  static async getStockValuationReport(
    date?: Date,
    location?: string,
    department?: string
  ): Promise<ApiResponse<any>> {
    const params = new URLSearchParams()
    if (date) params.append('date', date.toISOString())
    if (location) params.append('location', location)
    if (department) params.append('department', department)

    return apiClient.get<any>(`/stock/valuation-report?${params.toString()}`)
  }

  // Import/Export
  static async exportStockData(
    format: 'csv' | 'excel' | 'pdf',
    dataType: 'levels' | 'movements' | 'adjustments' | 'transfers',
    filters?: any
  ): Promise<ApiResponse<{ url: string; filename: string }>> {
    return apiClient.post<{ url: string; filename: string }>('/stock/export', {
      format,
      dataType,
      filters
    })
  }

  static async importStockData(
    file: File,
    dataType: 'levels' | 'movements' | 'adjustments'
  ): Promise<ApiResponse<{ imported: number; errors: string[] }>> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('dataType', dataType)

    try {
      const token = localStorage.getItem('authToken')
      const headers: HeadersInit = {}
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE_URL}/stock/import`, {
        method: 'POST',
        headers,
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message
      }
    } catch (error) {
      console.error('Import Error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Import failed'
      }
    }
  }

  // Locations and departments
  static async getLocations(): Promise<ApiResponse<string[]>> {
    return apiClient.get<string[]>('/stock/locations')
  }

  static async getDepartments(): Promise<ApiResponse<string[]>> {
    return apiClient.get<string[]>('/stock/departments')
  }

  // Validation and utilities
  static async validateStockOperation(
    operation: 'add' | 'remove' | 'adjust' | 'transfer',
    data: any
  ): Promise<ApiResponse<{ valid: boolean; errors: string[] }>> {
    return apiClient.post<{ valid: boolean; errors: string[] }>('/stock/validate', {
      operation,
      data
    })
  }

  static async getStockSummary(
    itemType?: 'medication' | 'equipment' | 'supply',
    location?: string,
    department?: string
  ): Promise<ApiResponse<any>> {
    const params = new URLSearchParams()
    if (itemType) params.append('itemType', itemType)
    if (location) params.append('location', location)
    if (department) params.append('department', department)

    return apiClient.get<any>(`/stock/summary?${params.toString()}`)
  }
}

export default StockService
export type {
  StockLevel,
  StockAlert,
  StockTransfer,
  StockAdjustment,
  StockReservation
}