import { InventoryDocument } from './inventory'

// Order interfaces
export interface Order {
  id: string
  orderNumber: string
  type: OrderType
  status: OrderStatus
  priority: OrderPriority
  
  // Order details
  title: string
  description?: string
  department: string
  requestedBy: string
  approvedBy?: string
  
  // Dates
  requestDate: Date
  approvalDate?: Date
  orderDate?: Date
  expectedDeliveryDate?: Date
  actualDeliveryDate?: Date
  
  // Supplier information
  supplier: OrderSupplier
  
  // Items
  items: OrderItem[]
  
  // Financial information
  subtotal: number
  taxAmount: number
  shippingCost: number
  discountAmount: number
  totalAmount: number
  currency: string
  
  // Delivery information
  deliveryAddress: DeliveryAddress
  deliveryInstructions?: string
  trackingNumber?: string
  
  // Approval workflow
  approvalWorkflow?: ApprovalWorkflow
  
  // Budget information
  budgetCode?: string
  budgetYear?: number
  budgetRemaining?: number
  
  // Communication
  notes?: OrderNote[]
  messages?: OrderMessage[]
  
  // Attachments
  attachments?: InventoryDocument[]
  
  // Receiving information
  receivingRecords?: ReceivingRecord[]
  
  // Invoice information
  invoices?: OrderInvoice[]
  
  // Audit trail
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy?: string
}

// Order type enumeration
export type OrderType = 
  | 'purchase_order'
  | 'requisition'
  | 'emergency_order'
  | 'standing_order'
  | 'blanket_order'
  | 'contract_order'
  | 'consignment_order'
  | 'return_order'
  | 'transfer_order'

// Order status enumeration
export type OrderStatus = 
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'sent_to_supplier'
  | 'acknowledged'
  | 'in_production'
  | 'shipped'
  | 'partially_received'
  | 'received'
  | 'completed'
  | 'cancelled'
  | 'on_hold'

// Order priority enumeration
export type OrderPriority = 
  | 'low'
  | 'normal'
  | 'high'
  | 'urgent'
  | 'emergency'

// Order supplier interface
export interface OrderSupplier {
  id: string
  name: string
  code?: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  paymentTerms?: string
  deliveryTerms?: string
  contractNumber?: string
}

// Order item interface
export interface OrderItem {
  id: string
  itemId?: string // Reference to inventory item
  itemType: 'inventory' | 'medication' | 'equipment' | 'supply' | 'service' | 'other'
  
  // Item details
  name: string
  description?: string
  manufacturer?: string
  model?: string
  partNumber?: string
  catalogNumber?: string
  
  // Quantity and units
  quantityOrdered: number
  quantityReceived: number
  quantityBackordered: number
  quantityCancelled: number
  unit: string
  
  // Pricing
  unitPrice: number
  discountPercentage?: number
  discountAmount?: number
  lineTotal: number
  
  // Delivery
  expectedDeliveryDate?: Date
  actualDeliveryDate?: Date
  
  // Specifications
  specifications?: ItemSpecification[]
  
  // Status
  status: OrderItemStatus
  
  // Notes
  notes?: string
}

export type OrderItemStatus = 
  | 'pending'
  | 'ordered'
  | 'backordered'
  | 'shipped'
  | 'received'
  | 'cancelled'
  | 'returned'

export interface ItemSpecification {
  name: string
  value: string
  required: boolean
}

// Delivery address interface
export interface DeliveryAddress {
  name: string
  department?: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  phone?: string
  deliveryHours?: string
  specialInstructions?: string
}

// Approval workflow interface
export interface ApprovalWorkflow {
  steps: ApprovalStep[]
  currentStep: number
  completed: boolean
  bypassed?: boolean
  bypassReason?: string
}

export interface ApprovalStep {
  stepNumber: number
  approverRole: string
  approverId?: string
  approverName?: string
  required: boolean
  status: 'pending' | 'approved' | 'rejected' | 'skipped'
  approvalDate?: Date
  comments?: string
  delegatedTo?: string
}

// Order note interface
export interface OrderNote {
  id: string
  content: string
  type: 'general' | 'approval' | 'delivery' | 'quality' | 'financial' | 'other'
  visibility: 'internal' | 'supplier' | 'public'
  createdBy: string
  createdAt: Date
  attachments?: InventoryDocument[]
}

// Order message interface
export interface OrderMessage {
  id: string
  from: string
  to: string[]
  subject: string
  content: string
  messageType: 'email' | 'sms' | 'notification' | 'system'
  status: 'sent' | 'delivered' | 'read' | 'failed'
  sentAt: Date
  readAt?: Date
  attachments?: InventoryDocument[]
}

// Receiving record interface
export interface ReceivingRecord {
  id: string
  orderId: string
  receivingNumber: string
  receivedDate: Date
  receivedBy: string
  
  items: ReceivedItem[]
  
  // Quality inspection
  inspectionRequired: boolean
  inspectionCompleted?: boolean
  inspectedBy?: string
  inspectionDate?: Date
  inspectionResults?: InspectionResult[]
  
  // Documentation
  packingSlip?: string
  deliveryReceipt?: string
  attachments?: InventoryDocument[]
  
  // Status
  status: 'pending' | 'completed' | 'discrepancy' | 'rejected'
  discrepancies?: ReceivingDiscrepancy[]
  
  notes?: string
  createdAt: Date
}

export interface ReceivedItem {
  orderItemId: string
  quantityReceived: number
  condition: 'good' | 'damaged' | 'expired' | 'defective'
  batchNumber?: string
  lotNumber?: string
  expirationDate?: Date
  serialNumbers?: string[]
  location?: string
  notes?: string
}

export interface InspectionResult {
  parameter: string
  expected: string
  actual: string
  result: 'pass' | 'fail' | 'conditional'
  notes?: string
}

export interface ReceivingDiscrepancy {
  type: 'quantity' | 'quality' | 'specification' | 'damage' | 'missing' | 'extra'
  description: string
  severity: 'minor' | 'major' | 'critical'
  resolution: 'accept' | 'reject' | 'partial_accept' | 'return' | 'credit'
  resolutionNotes?: string
}

// Order invoice interface
export interface OrderInvoice {
  id: string
  orderId: string
  invoiceNumber: string
  invoiceDate: Date
  dueDate: Date
  
  supplier: OrderSupplier
  
  lineItems: InvoiceLineItem[]
  
  subtotal: number
  taxAmount: number
  shippingCost: number
  discountAmount: number
  totalAmount: number
  
  paymentTerms: string
  paymentStatus: 'pending' | 'paid' | 'overdue' | 'disputed' | 'cancelled'
  paymentDate?: Date
  paymentMethod?: string
  paymentReference?: string
  
  attachments?: InventoryDocument[]
  notes?: string
  
  createdAt: Date
  updatedAt: Date
}

export interface InvoiceLineItem {
  orderItemId: string
  description: string
  quantity: number
  unitPrice: number
  discountAmount?: number
  lineTotal: number
  taxAmount?: number
}

// Purchase requisition interface
export interface PurchaseRequisition {
  id: string
  requisitionNumber: string
  status: RequisitionStatus
  priority: OrderPriority
  
  // Requestor information
  requestedBy: string
  department: string
  costCenter?: string
  
  // Request details
  title: string
  description?: string
  justification: string
  requestDate: Date
  neededByDate: Date
  
  // Items
  items: RequisitionItem[]
  
  // Budget information
  budgetCode?: string
  estimatedTotal: number
  approvedAmount?: number
  
  // Approval
  approvalWorkflow?: ApprovalWorkflow
  
  // Conversion to order
  orderId?: string
  convertedAt?: Date
  convertedBy?: string
  
  // Attachments and notes
  attachments?: InventoryDocument[]
  notes?: string
  
  createdAt: Date
  updatedAt: Date
}

export type RequisitionStatus = 
  | 'draft'
  | 'submitted'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'converted_to_order'
  | 'cancelled'

export interface RequisitionItem {
  id: string
  itemId?: string
  itemType: 'inventory' | 'medication' | 'equipment' | 'supply' | 'service' | 'other'
  
  name: string
  description?: string
  manufacturer?: string
  model?: string
  partNumber?: string
  
  quantityRequested: number
  quantityApproved?: number
  unit: string
  
  estimatedUnitPrice?: number
  estimatedTotal?: number
  
  preferredSupplier?: string
  alternativeSuppliers?: string[]
  
  justification?: string
  specifications?: ItemSpecification[]
  
  status: 'pending' | 'approved' | 'rejected' | 'modified'
  notes?: string
}

// Order template interface
export interface OrderTemplate {
  id: string
  name: string
  description?: string
  type: OrderType
  department: string
  
  // Template items
  items: TemplateItem[]
  
  // Default values
  defaultSupplier?: OrderSupplier
  defaultDeliveryAddress?: DeliveryAddress
  defaultPaymentTerms?: string
  
  // Usage
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'as_needed'
  lastUsed?: Date
  usageCount: number
  
  // Access control
  createdBy: string
  sharedWith?: string[]
  isPublic: boolean
  
  createdAt: Date
  updatedAt: Date
}

export interface TemplateItem {
  itemId?: string
  itemType: 'inventory' | 'medication' | 'equipment' | 'supply' | 'service' | 'other'
  name: string
  description?: string
  defaultQuantity: number
  unit: string
  estimatedPrice?: number
  specifications?: ItemSpecification[]
  notes?: string
}

// Order analytics and reporting
export interface OrderAnalytics {
  period: {
    start: Date
    end: Date
  }
  
  summary: {
    totalOrders: number
    totalValue: number
    averageOrderValue: number
    onTimeDeliveryRate: number
    orderCycleTime: number
  }
  
  byStatus: Array<{
    status: OrderStatus
    count: number
    value: number
    percentage: number
  }>
  
  byDepartment: Array<{
    department: string
    orders: number
    value: number
    percentage: number
  }>
  
  bySupplier: Array<{
    supplier: string
    orders: number
    value: number
    onTimeRate: number
    qualityScore: number
  }>
  
  byCategory: Array<{
    category: string
    orders: number
    value: number
    items: number
  }>
  
  trends: Array<{
    date: Date
    orders: number
    value: number
    averageValue: number
  }>
  
  performance: {
    averageApprovalTime: number
    averageProcessingTime: number
    averageDeliveryTime: number
    emergencyOrderRate: number
    changeOrderRate: number
  }
  
  savings: {
    contractSavings: number
    volumeDiscounts: number
    earlyPaymentDiscounts: number
    totalSavings: number
  }
}

// Order statistics
export interface OrderStatistics {
  totalOrders: number
  pendingOrders: number
  approvedOrders: number
  completedOrders: number
  cancelledOrders: number
  
  totalValue: number
  averageOrderValue: number
  largestOrder: number
  smallestOrder: number
  
  byType: Array<{
    type: OrderType
    count: number
    value: number
    percentage: number
  }>
  
  byPriority: Array<{
    priority: OrderPriority
    count: number
    percentage: number
  }>
  
  byDepartment: Array<{
    department: string
    count: number
    value: number
  }>
  
  performance: {
    onTimeDeliveryRate: number
    averageCycleTime: number
    approvalTime: number
    processingTime: number
    deliveryTime: number
  }
  
  compliance: {
    budgetCompliance: number
    approvalCompliance: number
    documentationCompliance: number
  }
}

// Order filter options
export interface OrderFilter {
  search?: string
  type?: OrderType
  status?: OrderStatus
  priority?: OrderPriority
  department?: string
  supplier?: string
  requestedBy?: string
  approvedBy?: string
  
  dateRange?: {
    field: 'request' | 'approval' | 'order' | 'delivery'
    start?: Date
    end?: Date
  }
  
  amountRange?: {
    min?: number
    max?: number
  }
  
  budgetCode?: string
  
  hasDiscrepancies?: boolean
  overdue?: boolean
  emergencyOnly?: boolean
}