// Tipos para o sistema de equipamentos médicos

import type { BaseItem, StockInfo, ApiResponse, PaginatedResponse } from './inventory'

// === EQUIPAMENTOS ===

export interface Equipment extends BaseItem {
  // Informações técnicas
  model: string
  serialNumber: string
  manufacturer: string
  manufacturingDate?: string
  acquisitionDate: string
  warrantyExpiry?: string
  
  // Classificação
  category: 'diagnostic' | 'therapeutic' | 'monitoring' | 'surgical' | 'laboratory' | 'imaging' | 'life_support' | 'mobility' | 'other'
  subcategory?: string
  medicalClass: 'I' | 'II' | 'III' | 'IV' // Classificação ANVISA
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  
  // Status operacional
  operationalStatus: 'operational' | 'maintenance' | 'repair' | 'calibration' | 'out_of_service' | 'decommissioned'
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'
  availability: 'available' | 'in_use' | 'reserved' | 'maintenance' | 'unavailable'
  
  // Localização e responsabilidade
  currentLocation: string
  department: string
  sector?: string
  room?: string
  responsiblePerson?: string
  assignedTo?: string
  
  // Informações financeiras
  acquisitionCost: number
  currentValue?: number
  depreciationRate?: number
  insuranceValue?: number
  maintenanceCost?: number
  
  // Especificações técnicas
  specifications?: {
    power?: string
    voltage?: string
    frequency?: string
    dimensions?: string
    weight?: string
    capacity?: string
    accuracy?: string
    resolution?: string
    operatingTemperature?: string
    humidity?: string
    connectivity?: string[]
    software?: string
    accessories?: string[]
  }
  
  // Manutenção e calibração
  maintenanceSchedule: {
    preventiveFrequency: number // em dias
    lastPreventiveMaintenance?: string
    nextPreventiveMaintenance: string
    calibrationFrequency?: number // em dias
    lastCalibration?: string
    nextCalibration?: string
    maintenanceProvider?: string
    calibrationProvider?: string
  }
  
  // Histórico de manutenção
  maintenanceHistory?: MaintenanceRecord[]
  
  // Certificações e regulamentações
  certifications?: Array<{
    type: 'CE' | 'FDA' | 'ANVISA' | 'ISO' | 'IEC' | 'other'
    number: string
    issuer: string
    issueDate: string
    expiryDate?: string
    status: 'valid' | 'expired' | 'pending' | 'revoked'
  }>
  
  // Fornecedor e suporte
  supplier?: {
    id: string
    name: string
    contact?: string
    email?: string
    phone?: string
    supportContract?: boolean
    contractExpiry?: string
  }
  
  // Documentação
  documentation?: Array<{
    id: string
    name: string
    type: 'manual' | 'certificate' | 'warranty' | 'maintenance_log' | 'calibration_cert' | 'photo' | 'other'
    url: string
    uploadedAt: string
  }>
  
  // Alertas e notificações
  alerts?: EquipmentAlert[]
  
  // Rastreabilidade
  qrCode?: string
  rfidTag?: string
  barcode?: string
  
  // Configurações de uso
  requiresTraining: boolean
  operatorCertificationRequired: boolean
  maxUsageHours?: number
  currentUsageHours?: number
  
  // Status e observações
  status: 'active' | 'inactive' | 'maintenance' | 'decommissioned'
  criticality: 'low' | 'medium' | 'high' | 'critical'
  notes?: string
  lastInspectionDate?: string
  nextInspectionDate?: string
}

// === REGISTROS DE MANUTENÇÃO ===

export interface MaintenanceRecord {
  id: string
  equipmentId: string
  equipmentName: string
  type: 'preventive' | 'corrective' | 'calibration' | 'inspection' | 'cleaning' | 'software_update'
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'overdue'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  
  // Datas
  scheduledDate: string
  startDate?: string
  completedDate?: string
  
  // Descrição do serviço
  description: string
  workPerformed?: string
  partsReplaced?: Array<{
    partName: string
    partNumber?: string
    quantity: number
    cost?: number
    supplier?: string
  }>
  
  // Responsáveis
  assignedTo?: string
  performedBy?: string
  supervisedBy?: string
  
  // Fornecedor externo
  externalProvider?: {
    name: string
    contact: string
    email?: string
    phone?: string
    serviceOrderNumber?: string
  }
  
  // Custos
  laborCost?: number
  partsCost?: number
  totalCost?: number
  
  // Resultados
  outcome: 'successful' | 'partial' | 'failed' | 'requires_followup'
  testResults?: string
  calibrationResults?: {
    beforeCalibration?: string
    afterCalibration?: string
    tolerance?: string
    passed: boolean
  }
  
  // Próximas ações
  nextMaintenanceDate?: string
  nextCalibrationDate?: string
  followUpRequired?: boolean
  followUpDescription?: string
  
  // Documentação
  attachments?: Array<{
    id: string
    name: string
    type: 'report' | 'certificate' | 'photo' | 'invoice' | 'other'
    url: string
    uploadedAt: string
  }>
  
  // Auditoria
  createdAt: string
  createdBy: string
  updatedAt?: string
  updatedBy?: string
  notes?: string
}

// === MOVIMENTAÇÕES DE EQUIPAMENTOS ===

export interface EquipmentMovement {
  id: string
  equipmentId: string
  equipmentName: string
  serialNumber: string
  type: 'transfer' | 'loan' | 'return' | 'maintenance' | 'repair' | 'calibration' | 'disposal' | 'assignment'
  
  // Localização
  fromLocation?: string
  toLocation?: string
  fromDepartment?: string
  toDepartment?: string
  fromRoom?: string
  toRoom?: string
  
  // Responsabilidade
  fromResponsible?: string
  toResponsible?: string
  assignedTo?: string
  
  // Detalhes da movimentação
  reason: string
  reference?: string // Número da ordem de serviço, solicitação, etc.
  expectedReturnDate?: string
  actualReturnDate?: string
  
  // Status
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled' | 'overdue'
  
  // Condição
  conditionBefore?: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'
  conditionAfter?: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'
  
  // Auditoria
  requestedBy: string
  authorizedBy?: string
  performedBy: string
  timestamp: string
  completedAt?: string
  notes?: string
  
  // Documentação
  attachments?: Array<{
    id: string
    name: string
    type: 'transfer_form' | 'condition_report' | 'photo' | 'other'
    url: string
    uploadedAt: string
  }>
}

// === ALERTAS DE EQUIPAMENTOS ===

export interface EquipmentAlert {
  id: string
  equipmentId: string
  equipmentName: string
  serialNumber: string
  type: 'maintenance_due' | 'calibration_due' | 'warranty_expiring' | 'certification_expiring' | 'malfunction' | 'overdue_maintenance' | 'usage_limit' | 'inspection_due'
  priority: 'low' | 'medium' | 'high' | 'critical'
  message: string
  details?: {
    dueDate?: string
    overdueDays?: number
    maintenanceType?: string
    location?: string
    department?: string
    responsiblePerson?: string
    estimatedCost?: number
    usageHours?: number
    maxUsageHours?: number
    certificationNumber?: string
    warrantyExpiry?: string
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
  actionTaken?: string
}

// === ESTATÍSTICAS DE EQUIPAMENTOS ===

export interface EquipmentStats {
  totalEquipment: number
  totalValue: number
  operationalEquipment: number
  maintenanceEquipment: number
  outOfServiceEquipment: number
  overdueMaintenanceEquipment: number
  expiringWarranties: number
  expiringCertifications: number
  activeAlerts: number
  criticalAlerts: number
  
  // Distribuição por categoria
  categories: Array<{
    name: string
    count: number
    value: number
    percentage: number
    operational: number
    maintenance: number
  }>
  
  // Distribuição por departamento
  departments: Array<{
    name: string
    count: number
    value: number
    percentage: number
    operational: number
    maintenance: number
  }>
  
  // Distribuição por condição
  conditions: Array<{
    condition: string
    count: number
    percentage: number
  }>
  
  // Distribuição por idade
  ageDistribution: Array<{
    range: string
    count: number
    percentage: number
    averageValue: number
  }>
  
  // Top equipamentos por valor
  topByValue: Array<{
    id: string
    name: string
    category: string
    value: number
    condition: string
    location: string
  }>
  
  // Equipamentos críticos
  criticalEquipment: Array<{
    id: string
    name: string
    category: string
    issue: string
    priority: string
    location: string
  }>
  
  // Custos de manutenção
  maintenanceCosts: {
    totalThisMonth: number
    totalThisYear: number
    averageMonthly: number
    preventiveCosts: number
    correctiveCosts: number
    externalCosts: number
    partsCosts: number
    laborCosts: number
  }
  
  // Tendências mensais
  monthlyTrends: Array<{
    month: string
    maintenanceCount: number
    maintenanceCost: number
    calibrationCount: number
    newEquipment: number
    decommissioned: number
  }>
  
  // Eficiência de manutenção
  maintenanceEfficiency: {
    averageDowntime: number // em horas
    preventiveRatio: number // % de manutenções preventivas
    onTimeCompletion: number // % de manutenções concluídas no prazo
    firstTimeFixRate: number // % de reparos bem-sucedidos na primeira tentativa
  }
}

// === FILTROS ===

export interface EquipmentFilters {
  search?: string
  category?: string
  subcategory?: string
  manufacturer?: string
  model?: string
  serialNumber?: string
  department?: string
  location?: string
  room?: string
  operationalStatus?: string
  condition?: string
  availability?: string
  medicalClass?: string
  riskLevel?: string
  responsiblePerson?: string
  assignedTo?: string
  supplier?: string
  maintenanceDue?: boolean
  calibrationDue?: boolean
  warrantyExpiring?: boolean
  certificationExpiring?: boolean
  requiresTraining?: boolean
  operatorCertificationRequired?: boolean
  tags?: string[]
  minValue?: number
  maxValue?: number
  acquisitionDateFrom?: string
  acquisitionDateTo?: string
  warrantyExpiryFrom?: string
  warrantyExpiryTo?: string
  lastMaintenanceFrom?: string
  lastMaintenanceTo?: string
  nextMaintenanceFrom?: string
  nextMaintenanceTo?: string
  createdAfter?: string
  createdBefore?: string
  lastUpdatedAfter?: string
  lastUpdatedBefore?: string
}

// === RELATÓRIOS ===

export interface EquipmentReport {
  id: string
  type: 'inventory' | 'maintenance' | 'calibration' | 'costs' | 'utilization' | 'compliance' | 'lifecycle'
  title: string
  description?: string
  filters: EquipmentFilters
  generatedAt: string
  generatedBy: string
  format: 'pdf' | 'excel' | 'csv'
  downloadUrl?: string
  data?: any
}

// === TIPOS DE FORMULÁRIO ===

export interface EquipmentForm {
  name: string
  description?: string
  model: string
  serialNumber: string
  manufacturer: string
  manufacturingDate?: string
  acquisitionDate: string
  warrantyExpiry?: string
  
  // Classificação
  category: string
  subcategory?: string
  medicalClass: string
  riskLevel: string
  
  // Localização
  currentLocation: string
  department: string
  sector?: string
  room?: string
  responsiblePerson?: string
  assignedTo?: string
  
  // Financeiro
  acquisitionCost: number
  currentValue?: number
  insuranceValue?: number
  
  // Manutenção
  preventiveFrequency: number
  nextPreventiveMaintenance: string
  calibrationFrequency?: number
  nextCalibration?: string
  maintenanceProvider?: string
  calibrationProvider?: string
  
  // Especificações
  specifications?: Record<string, string>
  
  // Configurações
  requiresTraining: boolean
  operatorCertificationRequired: boolean
  maxUsageHours?: number
  
  // Status
  operationalStatus: string
  condition: string
  availability: string
  status: string
  criticality: string
  
  // Fornecedor
  supplierId?: string
  
  // Outros
  tags?: string[]
  notes?: string
}

export interface MaintenanceForm {
  equipmentId: string
  type: string
  priority: string
  scheduledDate: string
  description: string
  assignedTo?: string
  externalProvider?: {
    name: string
    contact: string
    email?: string
    phone?: string
  }
  estimatedCost?: number
  notes?: string
}

export interface TransferForm {
  equipmentId: string
  reason: string
  toLocation: string
  toDepartment: string
  toRoom?: string
  toResponsible?: string
  assignedTo?: string
  expectedReturnDate?: string
  notes?: string
}

// === BUSCA E SUGESTÕES ===

export interface EquipmentSearchResult {
  equipment: Equipment[]
  total: number
  suggestions: string[]
  filters: {
    categories: Array<{ name: string; count: number }>
    manufacturers: Array<{ name: string; count: number }>
    departments: Array<{ name: string; count: number }>
    locations: Array<{ name: string; count: number }>
    suppliers: Array<{ name: string; count: number }>
    conditions: Array<{ name: string; count: number }>
  }
}

export interface EquipmentSearchFilters extends EquipmentFilters {
  sortBy?: 'name' | 'category' | 'manufacturer' | 'acquisitionDate' | 'value' | 'condition' | 'nextMaintenance'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// === CONFIGURAÇÕES ===

export interface EquipmentSettings {
  defaultCurrency: string
  maintenanceWarningDays: number
  calibrationWarningDays: number
  warrantyWarningDays: number
  certificationWarningDays: number
  autoScheduleMaintenance: boolean
  requireApprovalForTransfers: boolean
  requireApprovalForMaintenance: boolean
  trackUsageHours: boolean
  emailNotifications: boolean
  smsNotifications: boolean
  qrCodeGeneration: boolean
  rfidTracking: boolean
  barcodeTracking: boolean
  maintenanceReminderFrequency: 'daily' | 'weekly' | 'monthly'
  reportFrequency: 'weekly' | 'monthly' | 'quarterly'
  depreciationMethod: 'straight_line' | 'declining_balance' | 'units_of_production'
  defaultDepreciationRate: number
}

// Re-exportar tipos base
export type { ApiResponse, PaginatedResponse } from './inventory'