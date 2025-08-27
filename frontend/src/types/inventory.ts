// Tipos para o sistema de inventário médico

// === TIPOS BASE ===

export interface BaseItem {
  id: string
  name: string
  description?: string
  category: string
  subcategory?: string
  brand?: string
  manufacturer?: string
  model?: string
  serialNumber?: string
  barcode?: string
  qrCode?: string
  tags?: string[]
  notes?: string
  createdAt: string
  lastUpdated: string
  createdBy: string
  lastUpdatedBy: string
}

export interface StockInfo {
  currentStock: number
  minStock: number
  maxStock: number
  reorderPoint: number
  reorderQuantity: number
  unit: string
  location: string
  department: string
  cost: number
  totalValue: number
}

export interface InventoryItem extends BaseItem {
  stock: StockInfo
  status: 'active' | 'inactive' | 'discontinued' | 'pending'
  criticality: 'low' | 'medium' | 'high' | 'critical'
  supplier?: {
    id: string
    name: string
    contact?: string
    email?: string
    phone?: string
  }
  lastInventoryDate?: string
  nextInventoryDate?: string
  attachments?: Array<{
    id: string
    name: string
    type: string
    url: string
    uploadedAt: string
  }>
}

// === MOVIMENTAÇÕES ===

export interface InventoryMovement {
  id: string
  itemId: string
  itemName: string
  type: 'in' | 'out' | 'transfer' | 'adjustment' | 'loss' | 'return'
  quantity: number
  unit: string
  reason: string
  reference?: string // Número do pedido, transferência, etc.
  fromLocation?: string
  toLocation?: string
  fromDepartment?: string
  toDepartment?: string
  cost?: number
  totalCost?: number
  batchNumber?: string
  expiryDate?: string
  performedBy: string
  authorizedBy?: string
  timestamp: string
  notes?: string
}

// === ALERTAS ===

export interface InventoryAlert {
  id: string
  itemId: string
  itemName: string
  type: 'low_stock' | 'out_of_stock' | 'expiry_warning' | 'expired' | 'reorder_point' | 'overstock'
  priority: 'low' | 'medium' | 'high' | 'critical'
  message: string
  details?: {
    currentStock?: number
    minStock?: number
    reorderPoint?: number
    expiryDate?: string
    daysToExpiry?: number
    location?: string
    department?: string
  }
  isRead: boolean
  isResolved: boolean
  createdAt: string
  readAt?: string
  resolvedAt?: string
  resolvedBy?: string
  dismissedAt?: string
  dismissedBy?: string
}

// === ESTATÍSTICAS ===

export interface InventoryStats {
  totalItems: number
  totalValue: number
  lowStockItems: number
  outOfStockItems: number
  expiredItems: number
  expiringItems: number
  activeAlerts: number
  criticalAlerts: number
  categories: Array<{
    name: string
    count: number
    value: number
    percentage: number
  }>
  departments: Array<{
    name: string
    count: number
    value: number
    percentage: number
  }>
  topItems: Array<{
    id: string
    name: string
    category: string
    value: number
    quantity: number
  }>
  recentMovements: InventoryMovement[]
  monthlyTrends: Array<{
    month: string
    totalValue: number
    movements: number
    additions: number
    consumptions: number
  }>
}

// === FILTROS ===

export interface InventoryFilters {
  search?: string
  category?: string
  subcategory?: string
  department?: string
  location?: string
  status?: string
  criticality?: string
  supplier?: string
  brand?: string
  manufacturer?: string
  lowStock?: boolean
  outOfStock?: boolean
  expired?: boolean
  expiring?: boolean
  tags?: string[]
  minValue?: number
  maxValue?: number
  minStock?: number
  maxStock?: number
  createdAfter?: string
  createdBefore?: string
  lastUpdatedAfter?: string
  lastUpdatedBefore?: string
}

// === RELATÓRIOS ===

export interface InventoryReport {
  id: string
  type: 'inventory' | 'movements' | 'low_stock' | 'expiry' | 'valuation' | 'consumption'
  title: string
  description?: string
  filters: InventoryFilters
  generatedAt: string
  generatedBy: string
  format: 'pdf' | 'excel' | 'csv'
  downloadUrl?: string
  data?: any
}

// === CONFIGURAÇÕES ===

export interface InventorySettings {
  defaultUnit: string
  defaultCurrency: string
  lowStockThreshold: number
  expiryWarningDays: number
  criticalExpiryDays: number
  autoReorderEnabled: boolean
  emailNotifications: boolean
  smsNotifications: boolean
  inventoryFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually'
  requireApprovalForAdjustments: boolean
  requireApprovalForTransfers: boolean
  allowNegativeStock: boolean
  trackBatches: boolean
  trackExpiryDates: boolean
  trackSerialNumbers: boolean
}

// === AUDITORIA ===

export interface InventoryAuditLog {
  id: string
  itemId?: string
  itemName?: string
  action: 'create' | 'update' | 'delete' | 'stock_adjustment' | 'transfer' | 'movement'
  changes: Array<{
    field: string
    oldValue: any
    newValue: any
  }>
  performedBy: string
  timestamp: string
  ipAddress?: string
  userAgent?: string
  reason?: string
  reference?: string
}

// === IMPORTAÇÃO/EXPORTAÇÃO ===

export interface ImportResult {
  totalRows: number
  successfulImports: number
  failedImports: number
  warnings: number
  errors: Array<{
    row: number
    field?: string
    message: string
    severity: 'error' | 'warning'
  }>
  importedItems: string[]
  updatedItems: string[]
}

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf'
  includeImages: boolean
  includeAttachments: boolean
  includeMovements: boolean
  includeAlerts: boolean
  dateRange?: {
    start: string
    end: string
  }
  filters?: InventoryFilters
}

// === TIPOS DE RESPOSTA DA API ===

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
  errors?: Array<{
    field: string
    message: string
  }>
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// === TIPOS DE FORMULÁRIO ===

export interface InventoryItemForm {
  name: string
  description?: string
  category: string
  subcategory?: string
  brand?: string
  manufacturer?: string
  model?: string
  serialNumber?: string
  barcode?: string
  qrCode?: string
  currentStock: number
  minStock: number
  maxStock?: number
  reorderPoint: number
  reorderQuantity: number
  unit: string
  location: string
  department: string
  cost: number
  status: 'active' | 'inactive' | 'discontinued' | 'pending'
  criticality: 'low' | 'medium' | 'high' | 'critical'
  supplierId?: string
  tags?: string[]
  notes?: string
}

export interface MovementForm {
  itemId: string
  type: 'in' | 'out' | 'transfer' | 'adjustment' | 'loss' | 'return'
  quantity: number
  reason: string
  reference?: string
  fromLocation?: string
  toLocation?: string
  fromDepartment?: string
  toDepartment?: string
  cost?: number
  batchNumber?: string
  expiryDate?: string
  notes?: string
}

// === TIPOS DE DASHBOARD ===

export interface DashboardCard {
  id: string
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease'
    period: string
  }
  icon: string
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray'
  trend?: Array<{
    date: string
    value: number
  }>
}

export interface DashboardChart {
  id: string
  title: string
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area'
  data: any
  options?: any
}

// === TIPOS DE BUSCA ===

export interface SearchResult {
  items: InventoryItem[]
  total: number
  suggestions: string[]
  filters: {
    categories: Array<{ name: string; count: number }>
    departments: Array<{ name: string; count: number }>
    locations: Array<{ name: string; count: number }>
    brands: Array<{ name: string; count: number }>
    manufacturers: Array<{ name: string; count: number }>
  }
}

export interface SearchFilters extends InventoryFilters {
  sortBy?: 'name' | 'category' | 'stock' | 'value' | 'lastUpdated'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}