// Tipos para o sistema de suprimentos médicos

import type { BaseItem, StockInfo, ApiResponse, PaginatedResponse } from './inventory'

// === SUPRIMENTOS ===

export interface Supply extends BaseItem {
  // Informações básicas
  brand?: string
  model?: string
  partNumber?: string
  
  // Classificação
  category: 'consumable' | 'disposable' | 'reusable' | 'implant' | 'prosthetic' | 'orthotic' | 'surgical' | 'diagnostic' | 'therapeutic' | 'other'
  subcategory?: string
  medicalClass?: 'I' | 'II' | 'III' | 'IV' // Classificação ANVISA
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  
  // Informações de estoque
  stock: StockInfo & {
    batchTracking: boolean
    expiryTracking: boolean
    sterileTracking: boolean
    lotTracking: boolean
    temperatureControlled: boolean
    storageConditions?: string
  }
  
  // Especificações técnicas
  specifications?: {
    material?: string
    size?: string
    color?: string
    dimensions?: string
    weight?: string
    capacity?: string
    sterility?: 'sterile' | 'non_sterile'
    singleUse?: boolean
    reusable?: boolean
    maxReuses?: number
    sterilizationMethod?: string[]
    biocompatible?: boolean
    latexFree?: boolean
  }
  
  // Informações regulatórias
  registrationNumber?: string // Registro na ANVISA
  certifications?: Array<{
    type: 'CE' | 'FDA' | 'ANVISA' | 'ISO' | 'other'
    number: string
    issuer: string
    issueDate: string
    expiryDate?: string
    status: 'valid' | 'expired' | 'pending' | 'revoked'
  }>
  
  // Status e classificação
  status: 'active' | 'inactive' | 'discontinued' | 'pending' | 'recalled'
  criticality: 'low' | 'medium' | 'high' | 'critical'
  
  // Informações comerciais
  supplier?: {
    id: string
    name: string
    contact?: string
    email?: string
    phone?: string
    licenseNumber?: string
    leadTime?: number // dias
    minOrderQuantity?: number
  }
  
  // Uso clínico
  clinicalUse?: {
    indications?: string[]
    contraindications?: string[]
    precautions?: string[]
    compatibleWith?: string[]
    incompatibleWith?: string[]
    procedures?: string[]
    specialties?: string[]
  }
  
  // Rastreabilidade
  batches?: SupplyBatch[]
  lastInventoryDate?: string
  nextInventoryDate?: string
  
  // Consumo e reposição
  consumption?: {
    averageDaily?: number
    averageWeekly?: number
    averageMonthly?: number
    seasonal?: boolean
    peakPeriods?: string[]
    lowPeriods?: string[]
  }
  
  // Anexos
  attachments?: Array<{
    id: string
    name: string
    type: 'datasheet' | 'certificate' | 'manual' | 'photo' | 'specification' | 'other'
    url: string
    uploadedAt: string
  }>
}

// === LOTES DE SUPRIMENTOS ===

export interface SupplyBatch {
  id: string
  supplyId: string
  batchNumber: string
  lotNumber?: string
  manufacturingDate?: string
  expiryDate?: string
  sterilizationDate?: string
  sterilizationExpiry?: string
  quantity: number
  remainingQuantity: number
  cost: number
  supplier: string
  
  // Controle de qualidade
  qualityControl?: {
    tested: boolean
    testDate?: string
    testResult?: 'approved' | 'rejected' | 'pending'
    testNotes?: string
    inspector?: string
  }
  
  // Esterilização
  sterilization?: {
    method?: 'steam' | 'ethylene_oxide' | 'gamma' | 'electron_beam' | 'other'
    cycle?: string
    temperature?: string
    pressure?: string
    duration?: string
    validated: boolean
    certificate?: string
  }
  
  storageLocation: string
  receivedDate: string
  status: 'active' | 'expired' | 'recalled' | 'quarantine' | 'consumed'
  notes?: string
}

// === MOVIMENTAÇÕES DE SUPRIMENTOS ===

export interface SupplyMovement {
  id: string
  supplyId: string
  supplyName: string
  batchId?: string
  batchNumber?: string
  lotNumber?: string
  type: 'consumption' | 'receiving' | 'transfer' | 'adjustment' | 'loss' | 'return' | 'disposal' | 'sterilization'
  quantity: number
  unit: string
  reason: string
  reference?: string // Número do procedimento, cirurgia, etc.
  
  // Localização
  fromLocation?: string
  toLocation?: string
  fromDepartment?: string
  toDepartment?: string
  
  // Informações financeiras
  unitCost?: number
  totalCost?: number
  
  // Informações do procedimento (para consumo)
  procedure?: {
    id: string
    name: string
    patientId?: string
    patientName?: string
    physicianId?: string
    physicianName?: string
    procedureDate: string
    room?: string
    specialty?: string
  }
  
  // Esterilização
  sterilization?: {
    method: string
    cycle: string
    startTime: string
    endTime: string
    temperature?: string
    pressure?: string
    operator: string
    validated: boolean
  }
  
  // Auditoria
  performedBy: string
  authorizedBy?: string
  timestamp: string
  notes?: string
}

// === ALERTAS DE SUPRIMENTOS ===

export interface SupplyAlert {
  id: string
  supplyId: string
  supplyName: string
  batchId?: string
  batchNumber?: string
  lotNumber?: string
  type: 'low_stock' | 'out_of_stock' | 'expiry_warning' | 'expired' | 'sterility_expiry' | 'recall' | 'quality_issue' | 'temperature_breach' | 'reorder_point'
  priority: 'low' | 'medium' | 'high' | 'critical'
  message: string
  details?: {
    currentStock?: number
    minStock?: number
    reorderPoint?: number
    expiryDate?: string
    sterilityExpiry?: string
    daysToExpiry?: number
    batchNumber?: string
    lotNumber?: string
    location?: string
    department?: string
    temperature?: number
    recallReason?: string
    qualityIssue?: string
    estimatedUsage?: number
    leadTime?: number
  }
  isRead: boolean
  isResolved: boolean
  requiresAction: boolean
  createdAt: string
  readAt?: string
  resolvedAt?: string
  resolvedBy?: string
  dismissedAt?: string
  dismissedBy?: string
}

// === PEDIDOS DE SUPRIMENTOS ===

export interface SupplyOrder {
  id: string
  orderNumber: string
  supplierId: string
  supplierName: string
  status: 'draft' | 'pending' | 'approved' | 'ordered' | 'partial' | 'received' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  
  // Datas
  createdDate: string
  approvedDate?: string
  orderedDate?: string
  expectedDelivery?: string
  receivedDate?: string
  
  // Itens do pedido
  items: Array<{
    supplyId: string
    supplyName: string
    partNumber?: string
    quantityOrdered: number
    quantityReceived?: number
    unitPrice: number
    totalPrice: number
    unit: string
    specifications?: string
    notes?: string
  }>
  
  // Valores
  subtotal: number
  tax?: number
  shipping?: number
  discount?: number
  total: number
  
  // Informações de entrega
  deliveryAddress?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
    contact?: string
    phone?: string
  }
  
  // Responsáveis
  requestedBy: string
  approvedBy?: string
  receivedBy?: string
  
  // Observações
  notes?: string
  internalNotes?: string
  
  // Anexos
  attachments?: Array<{
    id: string
    name: string
    type: 'purchase_order' | 'quote' | 'invoice' | 'delivery_note' | 'certificate' | 'other'
    url: string
    uploadedAt: string
  }>
}

// === ESTATÍSTICAS DE SUPRIMENTOS ===

export interface SupplyStats {
  totalSupplies: number
  totalValue: number
  consumableSupplies: number
  reusableSupplies: number
  lowStockSupplies: number
  outOfStockSupplies: number
  expiredSupplies: number
  expiringSupplies: number
  recalledSupplies: number
  activeAlerts: number
  criticalAlerts: number
  
  // Distribuição por categoria
  categories: Array<{
    name: string
    count: number
    value: number
    percentage: number
    consumption: number
  }>
  
  // Distribuição por departamento
  departments: Array<{
    name: string
    count: number
    value: number
    percentage: number
    consumption: number
  }>
  
  // Distribuição por criticidade
  criticality: Array<{
    level: string
    count: number
    percentage: number
  }>
  
  // Top suprimentos por valor
  topByValue: Array<{
    id: string
    name: string
    category: string
    value: number
    quantity: number
    consumption: number
  }>
  
  // Top suprimentos por consumo
  topByConsumption: Array<{
    id: string
    name: string
    category: string
    consumed: number
    period: string
    trend: 'up' | 'down' | 'stable'
  }>
  
  // Tendências mensais
  monthlyTrends: Array<{
    month: string
    totalValue: number
    consumed: number
    received: number
    expired: number
    orders: number
    orderValue: number
  }>
  
  // Estatísticas de consumo
  consumptionStats: {
    totalConsumed: number
    averageDaily: number
    averageWeekly: number
    averageMonthly: number
    peakDay: {
      date: string
      quantity: number
    }
    seasonalTrends: Array<{
      period: string
      consumption: number
      trend: 'up' | 'down' | 'stable'
    }>
  }
  
  // Estatísticas de pedidos
  orderStats: {
    totalOrders: number
    totalOrderValue: number
    averageOrderValue: number
    averageLeadTime: number
    onTimeDelivery: number // percentual
    pendingOrders: number
    overdueOrders: number
  }
}

// === FILTROS ===

export interface SupplyFilters {
  search?: string
  category?: string
  subcategory?: string
  brand?: string
  manufacturer?: string
  supplier?: string
  department?: string
  location?: string
  status?: string
  criticality?: string
  medicalClass?: string
  riskLevel?: string
  sterility?: string
  singleUse?: boolean
  reusable?: boolean
  temperatureControlled?: boolean
  batchTracking?: boolean
  expiryTracking?: boolean
  sterileTracking?: boolean
  lowStock?: boolean
  outOfStock?: boolean
  expired?: boolean
  expiring?: boolean
  recalled?: boolean
  batchNumber?: string
  lotNumber?: string
  partNumber?: string
  registrationNumber?: string
  tags?: string[]
  minValue?: number
  maxValue?: number
  minStock?: number
  maxStock?: number
  expiryDateFrom?: string
  expiryDateTo?: string
  sterilityExpiryFrom?: string
  sterilityExpiryTo?: string
  manufacturingDateFrom?: string
  manufacturingDateTo?: string
  createdAfter?: string
  createdBefore?: string
  lastUpdatedAfter?: string
  lastUpdatedBefore?: string
}

// === RELATÓRIOS ===

export interface SupplyReport {
  id: string
  type: 'inventory' | 'consumption' | 'expiry' | 'usage_analysis' | 'cost_analysis' | 'orders' | 'waste' | 'compliance'
  title: string
  description?: string
  filters: SupplyFilters
  generatedAt: string
  generatedBy: string
  format: 'pdf' | 'excel' | 'csv'
  downloadUrl?: string
  data?: any
}

// === TIPOS DE FORMULÁRIO ===

export interface SupplyForm {
  name: string
  description?: string
  brand?: string
  model?: string
  partNumber?: string
  
  // Classificação
  category: string
  subcategory?: string
  medicalClass?: string
  riskLevel: string
  
  // Estoque
  currentStock: number
  minStock: number
  maxStock?: number
  reorderPoint: number
  reorderQuantity: number
  unit: string
  location: string
  department: string
  cost: number
  
  // Especificações
  specifications?: Record<string, string>
  
  // Configurações
  batchTracking: boolean
  expiryTracking: boolean
  sterileTracking: boolean
  lotTracking: boolean
  temperatureControlled: boolean
  storageConditions?: string
  
  // Informações regulatórias
  registrationNumber?: string
  
  // Status
  status: string
  criticality: string
  supplierId?: string
  
  // Uso clínico
  indications?: string[]
  contraindications?: string[]
  procedures?: string[]
  specialties?: string[]
  
  // Outros
  tags?: string[]
  notes?: string
}

export interface ConsumeForm {
  supplyId: string
  batchId?: string
  quantity: number
  reason: string
  
  // Procedimento
  procedureId?: string
  procedureName?: string
  patientId?: string
  patientName?: string
  physicianId?: string
  physicianName?: string
  room?: string
  specialty?: string
  
  // Localização
  fromLocation?: string
  toLocation?: string
  fromDepartment?: string
  toDepartment?: string
  
  notes?: string
}

export interface BatchForm {
  supplyId: string
  batchNumber: string
  lotNumber?: string
  manufacturingDate?: string
  expiryDate?: string
  sterilizationDate?: string
  sterilizationExpiry?: string
  quantity: number
  cost: number
  supplier: string
  storageLocation: string
  
  // Esterilização
  sterilizationMethod?: string
  sterilizationCycle?: string
  sterilizationValidated?: boolean
  
  notes?: string
}

export interface OrderForm {
  supplierId: string
  priority: string
  expectedDelivery?: string
  
  items: Array<{
    supplyId: string
    quantity: number
    unitPrice?: number
    specifications?: string
    notes?: string
  }>
  
  deliveryAddress?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
    contact?: string
    phone?: string
  }
  
  notes?: string
  internalNotes?: string
}

// === BUSCA E SUGESTÕES ===

export interface SupplySearchResult {
  supplies: Supply[]
  total: number
  suggestions: string[]
  filters: {
    categories: Array<{ name: string; count: number }>
    subcategories: Array<{ name: string; count: number }>
    brands: Array<{ name: string; count: number }>
    manufacturers: Array<{ name: string; count: number }>
    suppliers: Array<{ name: string; count: number }>
    departments: Array<{ name: string; count: number }>
    locations: Array<{ name: string; count: number }>
  }
}

export interface SupplySearchFilters extends SupplyFilters {
  sortBy?: 'name' | 'category' | 'brand' | 'stock' | 'value' | 'expiryDate' | 'consumption' | 'lastUpdated'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// === ANÁLISE DE USO ===

export interface UsageAnalysis {
  supplyId: string
  supplyName: string
  category: string
  period: {
    start: string
    end: string
  }
  
  // Consumo
  totalConsumed: number
  averageDaily: number
  averageWeekly: number
  averageMonthly: number
  
  // Tendências
  trend: 'increasing' | 'decreasing' | 'stable' | 'seasonal'
  trendPercentage: number
  seasonality: boolean
  
  // Picos e vales
  peakUsage: {
    date: string
    quantity: number
    reason?: string
  }
  lowUsage: {
    date: string
    quantity: number
    reason?: string
  }
  
  // Previsões
  forecast: Array<{
    period: string
    predictedConsumption: number
    confidence: number
  }>
  
  // Recomendações
  recommendations: Array<{
    type: 'reorder_point' | 'stock_level' | 'order_frequency' | 'supplier_change'
    message: string
    impact: 'low' | 'medium' | 'high'
    priority: 'low' | 'medium' | 'high'
  }>
}

// === CONFIGURAÇÕES ===

export interface SupplySettings {
  defaultUnit: string
  defaultCurrency: string
  lowStockThreshold: number
  expiryWarningDays: number
  criticalExpiryDays: number
  sterilityWarningDays: number
  autoReorderEnabled: boolean
  requireApprovalForOrders: boolean
  requireApprovalForConsumption: boolean
  trackBatches: boolean
  trackLots: boolean
  trackSterility: boolean
  trackTemperature: boolean
  emailNotifications: boolean
  smsNotifications: boolean
  qrCodeGeneration: boolean
  barcodeGeneration: boolean
  consumptionReportFrequency: 'daily' | 'weekly' | 'monthly'
  inventoryReportFrequency: 'weekly' | 'monthly' | 'quarterly'
  allowPartialConsumption: boolean
  requireProcedureReference: boolean
  enableUsageAnalysis: boolean
  forecastPeriod: number // meses
  seasonalityDetection: boolean
}

// Re-exportar tipos base
export type { ApiResponse, PaginatedResponse } from './inventory'