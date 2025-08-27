import { Order, OrderItem, OrderFilters, OrderStats } from '../hooks/useOrders'

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

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

// Orders Service
export class OrdersService {
  // Get all orders with filters and pagination
  static async getOrders(
    filters?: OrderFilters,
    page: number = 1,
    limit: number = 20,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
  ): Promise<ApiResponse<PaginatedResponse<Order>>> {
    const params = new URLSearchParams()
    
    if (filters) {
      if (filters.search) params.append('search', filters.search)
      if (filters.status) params.append('status', filters.status)
      if (filters.priority) params.append('priority', filters.priority)
      if (filters.supplierId) params.append('supplierId', filters.supplierId)
      if (filters.requestingDepartment) params.append('requestingDepartment', filters.requestingDepartment)
      if (filters.deliveryDepartment) params.append('deliveryDepartment', filters.deliveryDepartment)
      if (filters.category) params.append('category', filters.category)
      if (filters.requestedBy) params.append('requestedBy', filters.requestedBy)
      if (filters.approvedBy) params.append('approvedBy', filters.approvedBy)
      if (filters.createdFrom) params.append('createdFrom', filters.createdFrom.toISOString())
      if (filters.createdTo) params.append('createdTo', filters.createdTo.toISOString())
      if (filters.expectedDeliveryFrom) params.append('expectedDeliveryFrom', filters.expectedDeliveryFrom.toISOString())
      if (filters.expectedDeliveryTo) params.append('expectedDeliveryTo', filters.expectedDeliveryTo.toISOString())
      if (filters.minAmount !== undefined) params.append('minAmount', filters.minAmount.toString())
      if (filters.maxAmount !== undefined) params.append('maxAmount', filters.maxAmount.toString())
      if (filters.pendingApproval !== undefined) params.append('pendingApproval', filters.pendingApproval.toString())
      if (filters.overdue !== undefined) params.append('overdue', filters.overdue.toString())
      if (filters.recentlyCompleted !== undefined) params.append('recentlyCompleted', filters.recentlyCompleted.toString())
      if (filters.itemType && filters.itemType !== 'all') params.append('itemType', filters.itemType)
      if (filters.hasQualityIssues !== undefined) params.append('hasQualityIssues', filters.hasQualityIssues.toString())
      if (filters.today !== undefined) params.append('today', filters.today.toString())
      if (filters.thisWeek !== undefined) params.append('thisWeek', filters.thisWeek.toString())
      if (filters.thisMonth !== undefined) params.append('thisMonth', filters.thisMonth.toString())
      if (filters.tags?.length) params.append('tags', filters.tags.join(','))
      if (filters.excludeTags?.length) params.append('excludeTags', filters.excludeTags.join(','))
    }
    
    params.append('page', page.toString())
    params.append('limit', limit.toString())
    
    if (sortBy) params.append('sortBy', sortBy)
    if (sortOrder) params.append('sortOrder', sortOrder)

    return apiClient.get<PaginatedResponse<Order>>(`/orders?${params.toString()}`)
  }

  // Get single order by ID
  static async getOrder(id: string): Promise<ApiResponse<Order>> {
    return apiClient.get<Order>(`/orders/${id}`)
  }

  // Create new order
  static async createOrder(order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'lastUpdated' | 'statusHistory'>): Promise<ApiResponse<Order>> {
    return apiClient.post<Order>('/orders', order)
  }

  // Update order
  static async updateOrder(id: string, updates: Partial<Order>): Promise<ApiResponse<Order>> {
    return apiClient.put<Order>(`/orders/${id}`, updates)
  }

  // Delete order
  static async deleteOrder(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/orders/${id}`)
  }

  // Duplicate order
  static async duplicateOrder(id: string): Promise<ApiResponse<Order>> {
    return apiClient.post<Order>(`/orders/${id}/duplicate`)
  }

  // Status operations
  static async submitForApproval(id: string, notes?: string): Promise<ApiResponse<Order>> {
    return apiClient.post<Order>(`/orders/${id}/submit`, { notes })
  }

  static async approveOrder(id: string, approvedBy: string, notes?: string): Promise<ApiResponse<Order>> {
    return apiClient.post<Order>(`/orders/${id}/approve`, {
      approvedBy,
      notes
    })
  }

  static async rejectOrder(id: string, rejectedBy: string, reason: string): Promise<ApiResponse<Order>> {
    return apiClient.post<Order>(`/orders/${id}/reject`, {
      rejectedBy,
      reason
    })
  }

  static async sendOrder(id: string, trackingNumber?: string): Promise<ApiResponse<Order>> {
    return apiClient.post<Order>(`/orders/${id}/send`, { trackingNumber })
  }

  static async confirmOrder(id: string, confirmedBy: string, trackingNumber?: string): Promise<ApiResponse<Order>> {
    return apiClient.post<Order>(`/orders/${id}/confirm`, {
      confirmedBy,
      trackingNumber
    })
  }

  static async receiveOrder(
    id: string,
    receivedBy: string,
    receivedItems?: Array<{
      itemId: string
      quantityReceived: number
      qualityCheck?: 'pass' | 'fail' | 'conditional'
      notes?: string
    }>
  ): Promise<ApiResponse<Order>> {
    return apiClient.post<Order>(`/orders/${id}/receive`, {
      receivedBy,
      receivedItems
    })
  }

  static async completeOrder(id: string, completedBy: string): Promise<ApiResponse<Order>> {
    return apiClient.post<Order>(`/orders/${id}/complete`, { completedBy })
  }

  static async cancelOrder(id: string, cancelledBy: string, reason: string): Promise<ApiResponse<Order>> {
    return apiClient.post<Order>(`/orders/${id}/cancel`, {
      cancelledBy,
      reason
    })
  }

  // Item operations
  static async addOrderItem(orderId: string, item: Omit<OrderItem, 'id'>): Promise<ApiResponse<Order>> {
    return apiClient.post<Order>(`/orders/${orderId}/items`, item)
  }

  static async updateOrderItem(orderId: string, itemId: string, updates: Partial<OrderItem>): Promise<ApiResponse<Order>> {
    return apiClient.put<Order>(`/orders/${orderId}/items/${itemId}`, updates)
  }

  static async removeOrderItem(orderId: string, itemId: string): Promise<ApiResponse<Order>> {
    return apiClient.delete<Order>(`/orders/${orderId}/items/${itemId}`)
  }

  // Communication
  static async addNote(orderId: string, note: string, addedBy: string): Promise<ApiResponse<Order>> {
    return apiClient.post<Order>(`/orders/${orderId}/notes`, {
      note,
      addedBy
    })
  }

  static async sendMessage(
    orderId: string,
    message: string,
    sentBy: string,
    recipient: string,
    type: 'internal' | 'supplier' | 'department'
  ): Promise<ApiResponse<any>> {
    return apiClient.post<any>(`/orders/${orderId}/messages`, {
      message,
      sentBy,
      recipient,
      type
    })
  }

  static async getMessages(orderId: string): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(`/orders/${orderId}/messages`)
  }

  // Attachments
  static async addAttachment(orderId: string, file: File, description?: string): Promise<ApiResponse<Order>> {
    const formData = new FormData()
    formData.append('file', file)
    if (description) formData.append('description', description)

    try {
      const token = localStorage.getItem('authToken')
      const headers: HeadersInit = {}
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/attachments`, {
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
      console.error('Attachment Error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add attachment'
      }
    }
  }

  static async removeAttachment(orderId: string, attachmentId: string): Promise<ApiResponse<Order>> {
    return apiClient.delete<Order>(`/orders/${orderId}/attachments/${attachmentId}`)
  }

  static async downloadAttachment(orderId: string, attachmentId: string): Promise<ApiResponse<{ url: string; filename: string }>> {
    return apiClient.get<{ url: string; filename: string }>(`/orders/${orderId}/attachments/${attachmentId}/download`)
  }

  // Bulk operations
  static async bulkUpdateStatus(
    orderIds: string[],
    status: string,
    updatedBy: string,
    notes?: string
  ): Promise<ApiResponse<Order[]>> {
    return apiClient.patch<Order[]>('/orders/bulk-status', {
      orderIds,
      status,
      updatedBy,
      notes
    })
  }

  static async bulkDelete(orderIds: string[]): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/orders/bulk-delete', {
      orderIds
    })
  }

  static async bulkApprove(
    orderIds: string[],
    approvedBy: string,
    notes?: string
  ): Promise<ApiResponse<Order[]>> {
    return apiClient.patch<Order[]>('/orders/bulk-approve', {
      orderIds,
      approvedBy,
      notes
    })
  }

  static async bulkCancel(
    orderIds: string[],
    cancelledBy: string,
    reason: string
  ): Promise<ApiResponse<Order[]>> {
    return apiClient.patch<Order[]>('/orders/bulk-cancel', {
      orderIds,
      cancelledBy,
      reason
    })
  }

  // Statistics and analytics
  static async getStats(filters?: OrderFilters): Promise<ApiResponse<OrderStats>> {
    const params = new URLSearchParams()
    
    if (filters) {
      if (filters.status) params.append('status', filters.status)
      if (filters.supplierId) params.append('supplierId', filters.supplierId)
      if (filters.requestingDepartment) params.append('requestingDepartment', filters.requestingDepartment)
      if (filters.deliveryDepartment) params.append('deliveryDepartment', filters.deliveryDepartment)
      if (filters.createdFrom) params.append('createdFrom', filters.createdFrom.toISOString())
      if (filters.createdTo) params.append('createdTo', filters.createdTo.toISOString())
    }

    return apiClient.get<OrderStats>(`/orders/stats?${params.toString()}`)
  }

  static async getPendingOrders(): Promise<ApiResponse<Order[]>> {
    return apiClient.get<Order[]>('/orders/pending')
  }

  static async getOverdueOrders(): Promise<ApiResponse<Order[]>> {
    return apiClient.get<Order[]>('/orders/overdue')
  }

  static async getUrgentOrders(): Promise<ApiResponse<Order[]>> {
    return apiClient.get<Order[]>('/orders/urgent')
  }

  static async getHighValueOrders(threshold?: number): Promise<ApiResponse<Order[]>> {
    const params = threshold ? `?threshold=${threshold}` : ''
    return apiClient.get<Order[]>(`/orders/high-value${params}`)
  }

  static async getRecentOrders(days: number = 7): Promise<ApiResponse<Order[]>> {
    return apiClient.get<Order[]>(`/orders/recent?days=${days}`)
  }

  // Suppliers and departments
  static async getSuppliers(): Promise<ApiResponse<string[]>> {
    return apiClient.get<string[]>('/orders/suppliers')
  }

  static async getDepartments(): Promise<ApiResponse<string[]>> {
    return apiClient.get<string[]>('/orders/departments')
  }

  static async getCategories(): Promise<ApiResponse<string[]>> {
    return apiClient.get<string[]>('/orders/categories')
  }

  // Search and filters
  static async searchOrders(query: string, limit: number = 10): Promise<ApiResponse<Order[]>> {
    return apiClient.get<Order[]>(`/orders/search?q=${encodeURIComponent(query)}&limit=${limit}`)
  }

  static async getOrdersBySupplier(supplier: string): Promise<ApiResponse<Order[]>> {
    return apiClient.get<Order[]>(`/orders/supplier/${encodeURIComponent(supplier)}`)
  }

  static async getOrdersByDepartment(department: string): Promise<ApiResponse<Order[]>> {
    return apiClient.get<Order[]>(`/orders/department/${encodeURIComponent(department)}`)
  }

  static async getOrdersByStatus(status: string): Promise<ApiResponse<Order[]>> {
    return apiClient.get<Order[]>(`/orders/status/${encodeURIComponent(status)}`)
  }

  static async getOrdersByPriority(priority: string): Promise<ApiResponse<Order[]>> {
    return apiClient.get<Order[]>(`/orders/priority/${encodeURIComponent(priority)}`)
  }

  static async getOrdersByDateRange(startDate: Date, endDate: Date): Promise<ApiResponse<Order[]>> {
    const params = new URLSearchParams()
    params.append('startDate', startDate.toISOString())
    params.append('endDate', endDate.toISOString())

    return apiClient.get<Order[]>(`/orders/date-range?${params.toString()}`)
  }

  // Auto-reorder
  static async createAutoReorder(
    itemId: string,
    itemType: 'medication' | 'equipment' | 'supply',
    quantity: number,
    supplier: string,
    department: string,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
  ): Promise<ApiResponse<Order>> {
    return apiClient.post<Order>('/orders/auto-reorder', {
      itemId,
      itemType,
      quantity,
      supplier,
      department,
      priority
    })
  }

  static async getAutoReorderSuggestions(): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>('/orders/auto-reorder/suggestions')
  }

  // Purchase requisitions
  static async createPurchaseRequisition(
    items: Array<{
      itemId: string
      itemType: 'medication' | 'equipment' | 'supply'
      quantity: number
      estimatedCost?: number
      justification?: string
    }>,
    department: string,
    requestedBy: string,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
    notes?: string
  ): Promise<ApiResponse<Order>> {
    return apiClient.post<Order>('/orders/purchase-requisition', {
      items,
      department,
      requestedBy,
      priority,
      notes
    })
  }

  static async convertRequisitionToOrder(requisitionId: string, supplier: string): Promise<ApiResponse<Order>> {
    return apiClient.post<Order>(`/orders/requisition/${requisitionId}/convert`, {
      supplier
    })
  }

  // Delivery tracking
  static async updateDeliveryStatus(
    orderId: string,
    status: string,
    trackingNumber?: string,
    estimatedDelivery?: Date,
    notes?: string
  ): Promise<ApiResponse<Order>> {
    return apiClient.patch<Order>(`/orders/${orderId}/delivery`, {
      status,
      trackingNumber,
      estimatedDelivery: estimatedDelivery?.toISOString(),
      notes
    })
  }

  static async getDeliveryTracking(orderId: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`/orders/${orderId}/delivery-tracking`)
  }

  // Import/Export
  static async exportOrders(
    format: 'csv' | 'excel' | 'pdf',
    filters?: OrderFilters,
    orderIds?: string[]
  ): Promise<ApiResponse<{ url: string; filename: string }>> {
    const body: any = { format }
    if (filters) body.filters = filters
    if (orderIds) body.orderIds = orderIds

    return apiClient.post<{ url: string; filename: string }>('/orders/export', body)
  }

  static async importOrders(file: File): Promise<ApiResponse<{ imported: number; errors: string[] }>> {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const token = localStorage.getItem('authToken')
      const headers: HeadersInit = {}
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE_URL}/orders/import`, {
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

  // Approval workflow
  static async getApprovalWorkflow(orderId: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`/orders/${orderId}/approval-workflow`)
  }

  static async updateApprovalWorkflow(
    orderId: string,
    workflowData: {
      approvers: string[]
      requiredApprovals: number
      escalationRules?: any
    }
  ): Promise<ApiResponse<Order>> {
    return apiClient.put<Order>(`/orders/${orderId}/approval-workflow`, workflowData)
  }

  // Budget and cost control
  static async checkBudgetAvailability(
    department: string,
    amount: number,
    category?: string
  ): Promise<ApiResponse<{ available: boolean; remaining: number; details: any }>> {
    return apiClient.post<{ available: boolean; remaining: number; details: any }>('/orders/budget-check', {
      department,
      amount,
      category
    })
  }

  static async getBudgetSummary(
    department?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ApiResponse<any>> {
    const params = new URLSearchParams()
    if (department) params.append('department', department)
    if (startDate) params.append('startDate', startDate.toISOString())
    if (endDate) params.append('endDate', endDate.toISOString())

    return apiClient.get<any>(`/orders/budget-summary?${params.toString()}`)
  }

  // Audit and history
  static async getOrderHistory(orderId: string): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(`/orders/${orderId}/history`)
  }

  static async getAuditLog(
    startDate?: Date,
    endDate?: Date,
    orderId?: string,
    action?: string
  ): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate.toISOString())
    if (endDate) params.append('endDate', endDate.toISOString())
    if (orderId) params.append('orderId', orderId)
    if (action) params.append('action', action)

    return apiClient.get<any[]>(`/orders/audit?${params.toString()}`)
  }

  // Validation and utilities
  static async validateOrder(order: Partial<Order>): Promise<ApiResponse<{ valid: boolean; errors: string[] }>> {
    return apiClient.post<{ valid: boolean; errors: string[] }>('/orders/validate', order)
  }

  static async generateOrderNumber(department?: string): Promise<ApiResponse<{ orderNumber: string }>> {
    const params = department ? `?department=${encodeURIComponent(department)}` : ''
    return apiClient.get<{ orderNumber: string }>(`/orders/generate-number${params}`)
  }

  // Templates
  static async getOrderTemplates(): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>('/orders/templates')
  }

  static async createOrderFromTemplate(templateId: string, customizations?: any): Promise<ApiResponse<Order>> {
    return apiClient.post<Order>(`/orders/templates/${templateId}/create`, customizations)
  }

  static async saveAsTemplate(
    orderId: string,
    templateName: string,
    description?: string
  ): Promise<ApiResponse<any>> {
    return apiClient.post<any>(`/orders/${orderId}/save-template`, {
      templateName,
      description
    })
  }
}

export default OrdersService