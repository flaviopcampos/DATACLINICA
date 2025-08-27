// Stock movement interfaces
export interface StockMovement {
  id: string
  movementNumber: string
  type: MovementType
  subType?: MovementSubType
  status: MovementStatus
  
  // Item information
  itemId: string
  itemType: 'inventory' | 'medication' | 'equipment' | 'supply'
  itemName: string
  itemCode?: string
  
  // Quantity information
  quantity: number
  unit: string
  unitCost?: number
  totalCost?: number
  
  // Location information
  fromLocation?: StockLocation
  toLocation?: StockLocation
  
  // Batch and lot information
  batchNumber?: string
  lotNumber?: string
  serialNumber?: string
  expirationDate?: Date
  
  // Movement details
  reason: MovementReason
  reasonCode?: string
  description?: string
  
  // Reference information
  referenceType?: ReferenceType
  referenceId?: string
  referenceNumber?: string
  
  // Personnel information
  performedBy: string
  authorizedBy?: string
  verifiedBy?: string
  
  // Dates
  movementDate: Date
  scheduledDate?: Date
  authorizedDate?: Date
  verifiedDate?: Date
  
  // Quality and compliance
  qualityCheck?: QualityCheck
  complianceCheck?: ComplianceCheck
  
  // Approval workflow
  approvalRequired: boolean
  approvalStatus?: ApprovalStatus
  approvedBy?: string
  approvedDate?: Date
  
  // Documentation
  attachments?: MovementDocument[]
  notes?: string
  
  // Audit trail
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy?: string
}

// Movement type enumeration
export type MovementType = 
  | 'inbound'
  | 'outbound'
  | 'transfer'
  | 'adjustment'
  | 'return'
  | 'disposal'
  | 'reservation'
  | 'release'
  | 'conversion'
  | 'cycle_count'

// Movement subtype enumeration
export type MovementSubType = 
  // Inbound subtypes
  | 'purchase_receipt'
  | 'donation_receipt'
  | 'transfer_receipt'
  | 'return_receipt'
  | 'production_receipt'
  | 'found_item'
  
  // Outbound subtypes
  | 'patient_consumption'
  | 'department_issue'
  | 'transfer_issue'
  | 'waste_disposal'
  | 'expired_disposal'
  | 'damaged_disposal'
  | 'theft_loss'
  | 'breakage_loss'
  
  // Transfer subtypes
  | 'location_transfer'
  | 'department_transfer'
  | 'facility_transfer'
  
  // Adjustment subtypes
  | 'positive_adjustment'
  | 'negative_adjustment'
  | 'recount_adjustment'
  | 'system_correction'
  
  // Return subtypes
  | 'supplier_return'
  | 'department_return'
  | 'patient_return'
  | 'recall_return'
  
  // Other subtypes
  | 'quarantine'
  | 'release_quarantine'
  | 'reserve'
  | 'unreserve'

// Movement status enumeration
export type MovementStatus = 
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rejected'
  | 'on_hold'
  | 'partially_completed'

// Movement reason enumeration
export type MovementReason = 
  | 'patient_care'
  | 'procedure'
  | 'surgery'
  | 'emergency'
  | 'maintenance'
  | 'training'
  | 'research'
  | 'quality_control'
  | 'expired'
  | 'damaged'
  | 'recalled'
  | 'obsolete'
  | 'theft'
  | 'loss'
  | 'found'
  | 'donation'
  | 'purchase'
  | 'transfer'
  | 'return'
  | 'adjustment'
  | 'cycle_count'
  | 'other'

// Reference type enumeration
export type ReferenceType = 
  | 'purchase_order'
  | 'work_order'
  | 'patient_order'
  | 'prescription'
  | 'procedure'
  | 'surgery'
  | 'transfer_order'
  | 'return_authorization'
  | 'disposal_order'
  | 'cycle_count'
  | 'adjustment_order'
  | 'reservation'
  | 'other'

// Approval status enumeration
export type ApprovalStatus = 
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'expired'

// Stock location interface
export interface StockLocation {
  id: string
  name: string
  code?: string
  type: LocationType
  department?: string
  facility?: string
  building?: string
  floor?: string
  room?: string
  zone?: string
  shelf?: string
  bin?: string
  coordinates?: {
    x?: number
    y?: number
    z?: number
  }
  capacity?: {
    volume?: number
    weight?: number
    units?: number
  }
  environmentalConditions?: {
    temperature?: {
      min: number
      max: number
      unit: 'celsius' | 'fahrenheit'
    }
    humidity?: {
      min: number
      max: number
    }
    controlled?: boolean
  }
}

export type LocationType = 
  | 'warehouse'
  | 'storage_room'
  | 'pharmacy'
  | 'department'
  | 'patient_room'
  | 'operating_room'
  | 'emergency_room'
  | 'icu'
  | 'laboratory'
  | 'radiology'
  | 'central_supply'
  | 'loading_dock'
  | 'quarantine'
  | 'disposal'
  | 'other'

// Quality check interface
export interface QualityCheck {
  required: boolean
  performed?: boolean
  performedBy?: string
  performedDate?: Date
  result?: 'pass' | 'fail' | 'conditional'
  parameters?: QualityParameter[]
  notes?: string
}

export interface QualityParameter {
  name: string
  expected: string
  actual: string
  result: 'pass' | 'fail'
  notes?: string
}

// Compliance check interface
export interface ComplianceCheck {
  required: boolean
  performed?: boolean
  performedBy?: string
  performedDate?: Date
  result?: 'compliant' | 'non_compliant' | 'conditional'
  regulations?: ComplianceRegulation[]
  notes?: string
}

export interface ComplianceRegulation {
  name: string
  requirement: string
  status: 'compliant' | 'non_compliant' | 'not_applicable'
  notes?: string
}

// Movement document interface
export interface MovementDocument {
  id: string
  name: string
  type: 'receipt' | 'invoice' | 'packing_slip' | 'certificate' | 'photo' | 'report' | 'other'
  url: string
  size: number
  mimeType: string
  uploadedBy: string
  uploadedAt: Date
}

// Stock transfer interface
export interface StockTransfer {
  id: string
  transferNumber: string
  type: TransferType
  status: TransferStatus
  priority: TransferPriority
  
  // Transfer details
  fromLocation: StockLocation
  toLocation: StockLocation
  requestedBy: string
  approvedBy?: string
  
  // Items
  items: TransferItem[]
  
  // Dates
  requestDate: Date
  approvalDate?: Date
  scheduledDate?: Date
  startDate?: Date
  completedDate?: Date
  
  // Shipping information
  shippingMethod?: string
  trackingNumber?: string
  carrier?: string
  
  // Documentation
  attachments?: MovementDocument[]
  notes?: string
  
  // Audit trail
  createdAt: Date
  updatedAt: Date
}

export type TransferType = 
  | 'internal'
  | 'external'
  | 'emergency'
  | 'routine'
  | 'bulk'

export type TransferStatus = 
  | 'requested'
  | 'approved'
  | 'rejected'
  | 'in_transit'
  | 'delivered'
  | 'completed'
  | 'cancelled'

export type TransferPriority = 
  | 'low'
  | 'normal'
  | 'high'
  | 'urgent'
  | 'emergency'

export interface TransferItem {
  id: string
  itemId: string
  itemName: string
  quantityRequested: number
  quantityApproved?: number
  quantityShipped?: number
  quantityReceived?: number
  unit: string
  batchNumber?: string
  lotNumber?: string
  expirationDate?: Date
  condition?: 'good' | 'damaged' | 'expired'
  notes?: string
}

// Stock adjustment interface
export interface StockAdjustment {
  id: string
  adjustmentNumber: string
  type: AdjustmentType
  status: AdjustmentStatus
  
  // Adjustment details
  itemId: string
  itemName: string
  location: StockLocation
  
  // Quantity information
  currentQuantity: number
  adjustedQuantity: number
  adjustmentQuantity: number // positive or negative
  unit: string
  
  // Reason and justification
  reason: AdjustmentReason
  reasonCode?: string
  justification: string
  
  // Personnel
  requestedBy: string
  approvedBy?: string
  performedBy?: string
  
  // Dates
  requestDate: Date
  approvalDate?: Date
  performedDate?: Date
  
  // Cost impact
  unitCost?: number
  totalCostImpact?: number
  
  // Batch information
  batchNumber?: string
  lotNumber?: string
  expirationDate?: Date
  
  // Documentation
  attachments?: MovementDocument[]
  notes?: string
  
  // Audit trail
  createdAt: Date
  updatedAt: Date
}

export type AdjustmentType = 
  | 'increase'
  | 'decrease'
  | 'correction'
  | 'write_off'
  | 'write_on'

export type AdjustmentStatus = 
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'cancelled'

export type AdjustmentReason = 
  | 'physical_count'
  | 'cycle_count'
  | 'damaged_goods'
  | 'expired_goods'
  | 'theft'
  | 'loss'
  | 'found_items'
  | 'system_error'
  | 'data_correction'
  | 'obsolete'
  | 'recalled'
  | 'other'

// Stock reservation interface
export interface StockReservation {
  id: string
  reservationNumber: string
  status: ReservationStatus
  
  // Item information
  itemId: string
  itemName: string
  location: StockLocation
  
  // Quantity
  quantityReserved: number
  quantityFulfilled: number
  quantityRemaining: number
  unit: string
  
  // Reservation details
  reservedFor: string // patient, procedure, department, etc.
  reservationType: ReservationType
  priority: ReservationPriority
  
  // Dates
  reservationDate: Date
  requiredDate: Date
  expirationDate?: Date
  fulfilledDate?: Date
  
  // Personnel
  reservedBy: string
  fulfilledBy?: string
  
  // Reference
  referenceType?: ReferenceType
  referenceId?: string
  referenceNumber?: string
  
  // Batch information
  batchNumber?: string
  lotNumber?: string
  
  notes?: string
  
  createdAt: Date
  updatedAt: Date
}

export type ReservationStatus = 
  | 'active'
  | 'fulfilled'
  | 'partially_fulfilled'
  | 'expired'
  | 'cancelled'

export type ReservationType = 
  | 'patient'
  | 'procedure'
  | 'surgery'
  | 'department'
  | 'emergency'
  | 'maintenance'
  | 'other'

export type ReservationPriority = 
  | 'low'
  | 'normal'
  | 'high'
  | 'urgent'
  | 'emergency'

// Stock count interface
export interface StockCount {
  id: string
  countNumber: string
  type: CountType
  status: CountStatus
  
  // Count details
  location?: StockLocation
  department?: string
  category?: string
  
  // Items
  items: CountItem[]
  
  // Personnel
  countedBy: string[]
  supervisedBy?: string
  verifiedBy?: string
  
  // Dates
  scheduledDate: Date
  startDate?: Date
  completedDate?: Date
  
  // Results
  totalItems: number
  itemsCounted: number
  discrepancies: number
  accuracy: number // percentage
  
  // Cost impact
  totalCostImpact?: number
  
  notes?: string
  
  createdAt: Date
  updatedAt: Date
}

export type CountType = 
  | 'full_inventory'
  | 'cycle_count'
  | 'spot_count'
  | 'location_count'
  | 'category_count'
  | 'abc_count'

export type CountStatus = 
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'on_hold'

export interface CountItem {
  id: string
  itemId: string
  itemName: string
  location: StockLocation
  
  // Quantities
  systemQuantity: number
  countedQuantity?: number
  discrepancy?: number
  
  // Details
  unit: string
  unitCost?: number
  batchNumber?: string
  lotNumber?: string
  expirationDate?: Date
  
  // Count information
  countedBy?: string
  countedAt?: Date
  recounted?: boolean
  recountedBy?: string
  recountedAt?: Date
  
  // Status
  status: 'pending' | 'counted' | 'recounted' | 'verified' | 'discrepancy'
  
  notes?: string
}

// Movement analytics
export interface MovementAnalytics {
  period: {
    start: Date
    end: Date
  }
  
  summary: {
    totalMovements: number
    inboundMovements: number
    outboundMovements: number
    transferMovements: number
    adjustmentMovements: number
  }
  
  byType: Array<{
    type: MovementType
    count: number
    percentage: number
  }>
  
  byReason: Array<{
    reason: MovementReason
    count: number
    percentage: number
  }>
  
  byDepartment: Array<{
    department: string
    inbound: number
    outbound: number
    net: number
  }>
  
  byLocation: Array<{
    location: string
    movements: number
    value: number
  }>
  
  trends: Array<{
    date: Date
    inbound: number
    outbound: number
    net: number
    value: number
  }>
  
  performance: {
    averageProcessingTime: number
    onTimeCompletionRate: number
    accuracyRate: number
    errorRate: number
  }
}

// Movement statistics
export interface MovementStatistics {
  totalMovements: number
  pendingMovements: number
  completedMovements: number
  cancelledMovements: number
  
  byType: Array<{
    type: MovementType
    count: number
    percentage: number
  }>
  
  byStatus: Array<{
    status: MovementStatus
    count: number
    percentage: number
  }>
  
  byLocation: Array<{
    location: string
    inbound: number
    outbound: number
    net: number
  }>
  
  performance: {
    averageProcessingTime: number
    completionRate: number
    accuracyRate: number
    errorRate: number
  }
  
  compliance: {
    approvalCompliance: number
    documentationCompliance: number
    qualityCheckCompliance: number
  }
}

// Movement filter options
export interface MovementFilter {
  search?: string
  type?: MovementType
  subType?: MovementSubType
  status?: MovementStatus
  reason?: MovementReason
  itemId?: string
  itemType?: 'inventory' | 'medication' | 'equipment' | 'supply'
  fromLocation?: string
  toLocation?: string
  department?: string
  performedBy?: string
  
  dateRange?: {
    field: 'movement' | 'scheduled' | 'created'
    start?: Date
    end?: Date
  }
  
  quantityRange?: {
    min?: number
    max?: number
  }
  
  costRange?: {
    min?: number
    max?: number
  }
  
  batchNumber?: string
  lotNumber?: string
  
  hasDiscrepancies?: boolean
  requiresApproval?: boolean
  pendingApproval?: boolean
}