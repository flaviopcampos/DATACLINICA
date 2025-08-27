// Tipos para o sistema de medicamentos

import type { BaseItem, StockInfo, ApiResponse, PaginatedResponse } from './inventory'

// === MEDICAMENTOS ===

export interface Medication extends BaseItem {
  // Informações farmacológicas
  activeIngredient: string
  concentration: string
  pharmaceuticalForm: 'tablet' | 'capsule' | 'syrup' | 'injection' | 'cream' | 'ointment' | 'drops' | 'spray' | 'patch' | 'suppository' | 'other'
  therapeuticClass: string
  atcCode?: string // Código ATC (Anatomical Therapeutic Chemical)
  
  // Informações regulatórias
  registrationNumber?: string // Registro na ANVISA
  isControlled: boolean
  controlledClass?: 'A1' | 'A2' | 'A3' | 'B1' | 'B2' | 'C1' | 'C2' | 'C3' | 'C4' | 'C5'
  requiresPrescription: boolean
  prescriptionType?: 'simple' | 'special' | 'controlled'
  
  // Informações de estoque
  stock: StockInfo & {
    batchTracking: boolean
    expiryTracking: boolean
    temperatureControlled: boolean
    storageConditions?: string
  }
  
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
  }
  
  // Informações clínicas
  indications?: string[]
  contraindications?: string[]
  sideEffects?: string[]
  interactions?: string[]
  dosage?: {
    adult?: string
    pediatric?: string
    elderly?: string
    renal?: string
    hepatic?: string
  }
  
  // Rastreabilidade
  batches?: MedicationBatch[]
  lastInventoryDate?: string
  nextInventoryDate?: string
  
  // Anexos
  attachments?: Array<{
    id: string
    name: string
    type: 'datasheet' | 'prescription_guide' | 'package_insert' | 'certificate' | 'photo' | 'other'
    url: string
    uploadedAt: string
  }>
}

// === LOTES ===

export interface MedicationBatch {
  id: string
  medicationId: string
  batchNumber: string
  manufacturingDate: string
  expiryDate: string
  quantity: number
  remainingQuantity: number
  cost: number
  supplier: string
  qualityControl?: {
    tested: boolean
    testDate?: string
    testResult?: 'approved' | 'rejected' | 'pending'
    testNotes?: string
  }
  storageLocation: string
  receivedDate: string
  status: 'active' | 'expired' | 'recalled' | 'quarantine'
  notes?: string
}

// === MOVIMENTAÇÕES ===

export interface MedicationMovement {
  id: string
  medicationId: string
  medicationName: string
  batchId?: string
  batchNumber?: string
  type: 'dispensing' | 'receiving' | 'transfer' | 'adjustment' | 'loss' | 'return' | 'disposal'
  quantity: number
  unit: string
  reason: string
  reference?: string // Número da prescrição, pedido, etc.
  
  // Localização
  fromLocation?: string
  toLocation?: string
  fromDepartment?: string
  toDepartment?: string
  
  // Informações financeiras
  unitCost?: number
  totalCost?: number
  
  // Informações da prescrição (para dispensação)
  prescription?: {
    id: string
    patientId: string
    patientName: string
    prescriberId: string
    prescriberName: string
    prescriptionDate: string
    dosage: string
    frequency: string
    duration: string
    instructions?: string
  }
  
  // Auditoria
  performedBy: string
  authorizedBy?: string
  timestamp: string
  notes?: string
}

// === ALERTAS ===

export interface MedicationAlert {
  id: string
  medicationId: string
  medicationName: string
  batchId?: string
  batchNumber?: string
  type: 'low_stock' | 'out_of_stock' | 'expiry_warning' | 'expired' | 'recall' | 'interaction' | 'controlled_audit' | 'temperature_breach'
  priority: 'low' | 'medium' | 'high' | 'critical'
  message: string
  details?: {
    currentStock?: number
    minStock?: number
    reorderPoint?: number
    expiryDate?: string
    daysToExpiry?: number
    batchNumber?: string
    location?: string
    department?: string
    temperature?: number
    interactionWith?: string
    recallReason?: string
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

// === ESTATÍSTICAS ===

export interface MedicationStats {
  totalMedications: number
  totalValue: number
  controlledMedications: number
  lowStockMedications: number
  outOfStockMedications: number
  expiredMedications: number
  expiringMedications: number
  recalledMedications: number
  activeAlerts: number
  criticalAlerts: number
  
  // Distribuição por classe terapêutica
  therapeuticClasses: Array<{
    name: string
    count: number
    value: number
    percentage: number
  }>
  
  // Distribuição por forma farmacêutica
  pharmaceuticalForms: Array<{
    name: string
    count: number
    percentage: number
  }>
  
  // Medicamentos controlados por classe
  controlledByClass: Array<{
    class: string
    count: number
    percentage: number
  }>
  
  // Top medicamentos por valor
  topByValue: Array<{
    id: string
    name: string
    therapeuticClass: string
    value: number
    quantity: number
  }>
  
  // Top medicamentos por dispensação
  topByDispensing: Array<{
    id: string
    name: string
    therapeuticClass: string
    dispensed: number
    period: string
  }>
  
  // Tendências mensais
  monthlyTrends: Array<{
    month: string
    totalValue: number
    dispensed: number
    received: number
    expired: number
  }>
  
  // Estatísticas de dispensação
  dispensingStats: {
    totalDispensed: number
    averageDaily: number
    averageWeekly: number
    averageMonthly: number
    peakDay: {
      date: string
      quantity: number
    }
  }
}

// === FILTROS ===

export interface MedicationFilters {
  search?: string
  activeIngredient?: string
  therapeuticClass?: string
  pharmaceuticalForm?: string
  controlledClass?: string
  department?: string
  location?: string
  status?: string
  criticality?: string
  supplier?: string
  manufacturer?: string
  isControlled?: boolean
  requiresPrescription?: boolean
  lowStock?: boolean
  outOfStock?: boolean
  expired?: boolean
  expiring?: boolean
  recalled?: boolean
  temperatureControlled?: boolean
  batchNumber?: string
  atcCode?: string
  registrationNumber?: string
  tags?: string[]
  minValue?: number
  maxValue?: number
  minStock?: number
  maxStock?: number
  expiryDateFrom?: string
  expiryDateTo?: string
  manufacturingDateFrom?: string
  manufacturingDateTo?: string
  createdAfter?: string
  createdBefore?: string
  lastUpdatedAfter?: string
  lastUpdatedBefore?: string
}

// === INTERAÇÕES MEDICAMENTOSAS ===

export interface DrugInteraction {
  id: string
  medication1Id: string
  medication1Name: string
  medication2Id: string
  medication2Name: string
  severity: 'minor' | 'moderate' | 'major' | 'contraindicated'
  mechanism: string
  clinicalEffect: string
  management: string
  references?: string[]
  lastUpdated: string
}

// === VALIDAÇÃO DE PRESCRIÇÃO ===

export interface PrescriptionValidation {
  isValid: boolean
  errors: Array<{
    type: 'dosage' | 'frequency' | 'duration' | 'interaction' | 'allergy' | 'contraindication' | 'age_restriction' | 'pregnancy' | 'renal' | 'hepatic'
    message: string
    severity: 'warning' | 'error' | 'critical'
  }>
  warnings: Array<{
    type: string
    message: string
  }>
  interactions: DrugInteraction[]
  recommendations?: string[]
}

// === RELATÓRIOS ===

export interface MedicationReport {
  id: string
  type: 'inventory' | 'dispensing' | 'controlled' | 'expiry' | 'interactions' | 'consumption' | 'cost_analysis'
  title: string
  description?: string
  filters: MedicationFilters
  generatedAt: string
  generatedBy: string
  format: 'pdf' | 'excel' | 'csv'
  downloadUrl?: string
  data?: any
}

// === TIPOS DE FORMULÁRIO ===

export interface MedicationForm {
  name: string
  description?: string
  activeIngredient: string
  concentration: string
  pharmaceuticalForm: string
  therapeuticClass: string
  atcCode?: string
  registrationNumber?: string
  isControlled: boolean
  controlledClass?: string
  requiresPrescription: boolean
  prescriptionType?: string
  
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
  
  // Configurações
  batchTracking: boolean
  expiryTracking: boolean
  temperatureControlled: boolean
  storageConditions?: string
  
  // Status
  status: string
  criticality: string
  supplierId?: string
  
  // Informações clínicas
  indications?: string[]
  contraindications?: string[]
  sideEffects?: string[]
  interactions?: string[]
  
  // Outros
  tags?: string[]
  notes?: string
}

export interface DispenseForm {
  medicationId: string
  batchId?: string
  quantity: number
  reason: string
  
  // Prescrição
  prescriptionId?: string
  patientId?: string
  patientName?: string
  prescriberId?: string
  prescriberName?: string
  dosage?: string
  frequency?: string
  duration?: string
  instructions?: string
  
  // Localização
  fromLocation?: string
  toLocation?: string
  fromDepartment?: string
  toDepartment?: string
  
  notes?: string
}

export interface BatchForm {
  medicationId: string
  batchNumber: string
  manufacturingDate: string
  expiryDate: string
  quantity: number
  cost: number
  supplier: string
  storageLocation: string
  notes?: string
}

// === BUSCA E SUGESTÕES ===

export interface MedicationSearchResult {
  medications: Medication[]
  total: number
  suggestions: string[]
  filters: {
    therapeuticClasses: Array<{ name: string; count: number }>
    pharmaceuticalForms: Array<{ name: string; count: number }>
    manufacturers: Array<{ name: string; count: number }>
    suppliers: Array<{ name: string; count: number }>
    controlledClasses: Array<{ name: string; count: number }>
  }
}

export interface MedicationSearchFilters extends MedicationFilters {
  sortBy?: 'name' | 'therapeuticClass' | 'stock' | 'value' | 'expiryDate' | 'lastUpdated'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// === CONFIGURAÇÕES ===

export interface MedicationSettings {
  defaultUnit: string
  defaultCurrency: string
  lowStockThreshold: number
  expiryWarningDays: number
  criticalExpiryDays: number
  autoReorderEnabled: boolean
  requirePrescriptionValidation: boolean
  checkDrugInteractions: boolean
  trackBatches: boolean
  trackTemperature: boolean
  emailNotifications: boolean
  smsNotifications: boolean
  controlledAuditFrequency: 'daily' | 'weekly' | 'monthly'
  requireApprovalForDispensing: boolean
  requireApprovalForAdjustments: boolean
  allowPartialDispensing: boolean
  maxDispenseQuantity?: number
}

// Re-exportar tipos base
export type { ApiResponse, PaginatedResponse } from './inventory'