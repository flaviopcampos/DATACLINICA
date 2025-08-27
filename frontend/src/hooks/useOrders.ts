import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

// Types
export interface OrderItem {
  id: string
  itemId: string
  itemCode: string
  itemName: string
  itemType: 'medication' | 'equipment' | 'supply'
  category: string
  description?: string
  
  // Quantities
  quantityOrdered: number
  quantityReceived: number
  quantityPending: number
  quantityRejected: number
  
  // Pricing
  unitPrice: number
  totalPrice: number
  discountPercent: number
  discountAmount: number
  taxPercent: number
  taxAmount: number
  finalPrice: number
  
  // Specifications
  specifications?: string
  brand?: string
  model?: string
  
  // Delivery
  expectedDeliveryDate?: Date
  actualDeliveryDate?: Date
  
  // Quality control
  qualityChecked: boolean
  qualityApproved: boolean
  qualityNotes?: string
  
  // Batch information
  batchNumber?: string
  lotNumber?: string
  expirationDate?: Date
  manufacturingDate?: Date
  
  // Status
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'received' | 'rejected' | 'cancelled'
  
  // Notes
  notes?: string
  rejectionReason?: string
  
  // Metadata
  createdAt: Date
  lastUpdated: Date
}

export interface Order {
  id: string
  orderNumber: string
  title: string
  description?: string
  
  // Status and priority
  status: 'draft' | 'pending_approval' | 'approved' | 'sent' | 'confirmed' | 'partially_received' | 'completed' | 'cancelled' | 'rejected'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  
  // Supplier information
  supplierId: string
  supplierName: string
  supplierContact: string
  supplierEmail: string
  supplierPhone: string
  supplierAddress: string
  
  // Requesting information
  requestedBy: string
  requestedByName: string
  requestingDepartment: string
  
  // Approval workflow
  approvedBy?: string
  approvedByName?: string
  approvalDate?: Date
  approvalNotes?: string
  
  rejectedBy?: string
  rejectedByName?: string
  rejectionDate?: Date
  rejectionReason?: string
  
  // Delivery information
  deliveryAddress: string
  deliveryDepartment: string
  deliveryContact: string
  deliveryInstructions?: string
  
  expectedDeliveryDate?: Date
  actualDeliveryDate?: Date
  
  // Financial information
  subtotal: number
  discountPercent: number
  discountAmount: number
  taxPercent: number
  taxAmount: number
  shippingCost: number
  totalAmount: number
  
  currency: string
  paymentTerms: string
  paymentMethod: string
  
  // Items
  items: OrderItem[]
  
  // Tracking
  trackingNumber?: string
  shippingMethod?: string
  
  // Documents
  attachments?: {
    id: string
    name: string
    type: string
    url: string
    uploadedAt: Date
    uploadedBy: string
  }[]
  
  // Communication
  communications?: {
    id: string
    type: 'email' | 'phone' | 'meeting' | 'note'
    subject: string
    content: string
    direction: 'inbound' | 'outbound'
    contactPerson: string
    createdAt: Date
    createdBy: string
  }[]
  
  // History
  statusHistory: {
    status: Order['status']
    changedAt: Date
    changedBy: string
    changedByName: string
    notes?: string
  }[]
  
  // Dates
  createdAt: Date
  lastUpdated: Date
  sentDate?: Date
  confirmedDate?: Date
  completedDate?: Date
  cancelledDate?: Date
  
  // Contract information
  contractNumber?: string
  contractStartDate?: Date
  contractEndDate?: Date
  
  // Quality and compliance
  requiresQualityCheck: boolean
  qualityCheckCompleted: boolean
  qualityCheckDate?: Date
  qualityCheckBy?: string
  qualityNotes?: string
  
  // Recurring orders
  isRecurring: boolean
  recurringPattern?: 'weekly' | 'monthly' | 'quarterly' | 'annually'
  nextOrderDate?: Date
  
  // Tags and categories
  tags?: string[]
  category?: string
  
  // Custom fields
  customFields?: Record<string, any>
}

export interface OrderFilters {
  search?: string
  status?: 'all' | Order['status']
  priority?: 'all' | Order['priority']
  supplierId?: string
  requestingDepartment?: string
  deliveryDepartment?: string
  requestedBy?: string
  approvedBy?: string
  category?: string
  
  // Date filters
  createdFrom?: Date
  createdTo?: Date
  expectedDeliveryFrom?: Date
  expectedDeliveryTo?: Date
  
  // Amount filters
  minAmount?: number
  maxAmount?: number
  
  // Status filters
  pendingApproval?: boolean
  overdue?: boolean
  recentlyCompleted?: boolean
  
  // Item filters
  itemType?: 'all' | OrderItem['itemType']
  hasQualityIssues?: boolean
  
  // Time-based filters
  today?: boolean
  thisWeek?: boolean
  thisMonth?: boolean
  
  // Tags
  tags?: string[]
  excludeTags?: string[]
}

export interface OrderStats {
  totalOrders: number
  draftOrders: number
  pendingApprovalOrders: number
  approvedOrders: number
  sentOrders: number
  confirmedOrders: number
  partiallyReceivedOrders: number
  completedOrders: number
  cancelledOrders: number
  rejectedOrders: number
  
  // By priority
  lowPriorityOrders: number
  mediumPriorityOrders: number
  highPriorityOrders: number
  urgentOrders: number
  
  // Financial
  totalOrderValue: number
  averageOrderValue: number
  pendingOrderValue: number
  completedOrderValue: number
  
  // Performance metrics
  averageProcessingTime: number // days
  averageDeliveryTime: number // days
  onTimeDeliveryRate: number // percentage
  orderAccuracyRate: number // percentage
  
  // Time-based
  todayOrders: number
  weekOrders: number
  monthOrders: number
  overdueOrders: number
  
  // Supplier metrics
  topSuppliers: {
    supplierId: string
    supplierName: string
    orderCount: number
    totalValue: number
  }[]
  
  // Department metrics
  departmentStats: {
    department: string
    orderCount: number
    totalValue: number
  }[]
  
  // Trends
  orderTrends: {
    period: string
    orderCount: number
    totalValue: number
    completedCount: number
  }[]
}

export interface UseOrdersOptions {
  autoRefresh?: boolean
  refreshInterval?: number
  defaultFilters?: OrderFilters
  enableNotifications?: boolean
}

export interface UseOrdersReturn {
  // Data
  orders: Order[]
  allOrders: Order[]
  filteredOrders: Order[]
  stats: OrderStats
  
  // State
  loading: boolean
  refreshing: boolean
  error: string | null
  
  // Filters and pagination
  filters: OrderFilters
  sortBy: string
  sortOrder: 'asc' | 'desc'
  currentPage: number
  totalPages: number
  itemsPerPage: number
  
  // Actions
  setFilters: (filters: Partial<OrderFilters>) => void
  clearFilters: () => void
  setSorting: (field: string, order?: 'asc' | 'desc') => void
  setPage: (page: number) => void
  setItemsPerPage: (items: number) => void
  refresh: () => Promise<void>
  
  // CRUD operations
  createOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'lastUpdated' | 'statusHistory'>) => Promise<string | null>
  getOrder: (id: string) => Order | null
  updateOrder: (id: string, updates: Partial<Order>) => Promise<boolean>
  deleteOrder: (id: string) => Promise<boolean>
  duplicateOrder: (id: string) => Promise<string | null>
  
  // Status operations
  submitForApproval: (id: string) => Promise<boolean>
  approveOrder: (id: string, approvedBy: string, notes?: string) => Promise<boolean>
  rejectOrder: (id: string, rejectedBy: string, reason: string) => Promise<boolean>
  sendOrder: (id: string) => Promise<boolean>
  confirmOrder: (id: string, trackingNumber?: string) => Promise<boolean>
  receiveOrder: (id: string, receivedItems: { itemId: string; quantityReceived: number; qualityApproved: boolean; notes?: string }[]) => Promise<boolean>
  completeOrder: (id: string) => Promise<boolean>
  cancelOrder: (id: string, reason: string) => Promise<boolean>
  
  // Item operations
  addOrderItem: (orderId: string, item: Omit<OrderItem, 'id' | 'createdAt' | 'lastUpdated'>) => Promise<boolean>
  updateOrderItem: (orderId: string, itemId: string, updates: Partial<OrderItem>) => Promise<boolean>
  removeOrderItem: (orderId: string, itemId: string) => Promise<boolean>
  
  // Communication
  addCommunication: (orderId: string, communication: Omit<Order['communications'][0], 'id' | 'createdAt'>) => Promise<boolean>
  
  // Documents
  addAttachment: (orderId: string, attachment: Omit<Order['attachments'][0], 'id' | 'uploadedAt'>) => Promise<boolean>
  removeAttachment: (orderId: string, attachmentId: string) => Promise<boolean>
  
  // Bulk operations
  bulkUpdateStatus: (ids: string[], status: Order['status'], notes?: string) => Promise<boolean>
  bulkApprove: (ids: string[], approvedBy: string, notes?: string) => Promise<boolean>
  bulkCancel: (ids: string[], reason: string) => Promise<boolean>
  
  // Utility functions
  calculateOrderTotal: (items: OrderItem[], discountPercent?: number, taxPercent?: number, shippingCost?: number) => number
  generateOrderNumber: () => string
  exportData: (format?: 'csv' | 'excel' | 'pdf') => any[]
  
  // Search and filter helpers
  searchOrders: (query: string) => void
  getOrdersByStatus: (status: Order['status']) => Order[]
  getOrdersBySupplier: (supplierId: string) => Order[]
  getOrdersByDepartment: (department: string) => Order[]
  getPendingOrders: () => Order[]
  getOverdueOrders: () => Order[]
  getUrgentOrders: () => Order[]
  getRecentOrders: (days?: number) => Order[]
}

// Mock data
const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    title: 'Pedido Mensal - Medicamentos Básicos',
    description: 'Reposição mensal de medicamentos de alta rotatividade',
    status: 'confirmed',
    priority: 'high',
    
    supplierId: 'sup001',
    supplierName: 'Farmácia Distribuidora ABC',
    supplierContact: 'João Silva',
    supplierEmail: 'joao@farmabc.com',
    supplierPhone: '(11) 3333-4444',
    supplierAddress: 'Rua das Flores, 123 - São Paulo/SP',
    
    requestedBy: 'user003',
    requestedByName: 'Ana Costa',
    requestingDepartment: 'Farmácia',
    
    approvedBy: 'user001',
    approvedByName: 'Dr. Carlos Silva',
    approvalDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    approvalNotes: 'Aprovado conforme necessidade mensal',
    
    deliveryAddress: 'Hospital Central - Recebimento',
    deliveryDepartment: 'Farmácia',
    deliveryContact: 'Ana Costa',
    deliveryInstructions: 'Entregar no horário comercial, setor de recebimento',
    
    expectedDeliveryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
    
    subtotal: 15000.00,
    discountPercent: 5,
    discountAmount: 750.00,
    taxPercent: 10,
    taxAmount: 1425.00,
    shippingCost: 200.00,
    totalAmount: 15875.00,
    
    currency: 'BRL',
    paymentTerms: '30 dias',
    paymentMethod: 'Transferência bancária',
    
    trackingNumber: 'TRK123456789',
    shippingMethod: 'Transportadora Express',
    
    items: [
      {
        id: 'item1',
        itemId: 'med001',
        itemCode: 'MED001',
        itemName: 'Dipirona 500mg',
        itemType: 'medication',
        category: 'Analgésicos',
        quantityOrdered: 1000,
        quantityReceived: 0,
        quantityPending: 1000,
        quantityRejected: 0,
        unitPrice: 2.50,
        totalPrice: 2500.00,
        discountPercent: 5,
        discountAmount: 125.00,
        taxPercent: 10,
        taxAmount: 237.50,
        finalPrice: 2612.50,
        expectedDeliveryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
        qualityChecked: false,
        qualityApproved: false,
        status: 'confirmed',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)
      },
      {
        id: 'item2',
        itemId: 'med002',
        itemCode: 'MED002',
        itemName: 'Paracetamol 750mg',
        itemType: 'medication',
        category: 'Analgésicos',
        quantityOrdered: 500,
        quantityReceived: 0,
        quantityPending: 500,
        quantityRejected: 0,
        unitPrice: 1.80,
        totalPrice: 900.00,
        discountPercent: 5,
        discountAmount: 45.00,
        taxPercent: 10,
        taxAmount: 85.50,
        finalPrice: 940.50,
        expectedDeliveryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
        qualityChecked: false,
        qualityApproved: false,
        status: 'confirmed',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)
      }
    ],
    
    statusHistory: [
      {
        status: 'draft',
        changedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        changedBy: 'user003',
        changedByName: 'Ana Costa',
        notes: 'Pedido criado'
      },
      {
        status: 'pending_approval',
        changedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        changedBy: 'user003',
        changedByName: 'Ana Costa',
        notes: 'Enviado para aprovação'
      },
      {
        status: 'approved',
        changedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        changedBy: 'user001',
        changedByName: 'Dr. Carlos Silva',
        notes: 'Aprovado conforme necessidade mensal'
      },
      {
        status: 'sent',
        changedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
        changedBy: 'user003',
        changedByName: 'Ana Costa',
        notes: 'Pedido enviado ao fornecedor'
      },
      {
        status: 'confirmed',
        changedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
        changedBy: 'system',
        changedByName: 'Sistema',
        notes: 'Confirmado pelo fornecedor'
      }
    ],
    
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 12),
    sentDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    confirmedDate: new Date(Date.now() - 1000 * 60 * 60 * 12),
    
    requiresQualityCheck: true,
    qualityCheckCompleted: false,
    
    isRecurring: true,
    recurringPattern: 'monthly',
    nextOrderDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    
    tags: ['medicamentos', 'mensal', 'alta_rotatividade'],
    category: 'Medicamentos Básicos'
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    title: 'Equipamentos UTI - Monitores',
    description: 'Aquisição de monitores cardíacos para UTI',
    status: 'pending_approval',
    priority: 'urgent',
    
    supplierId: 'sup002',
    supplierName: 'MedTech Equipamentos',
    supplierContact: 'Maria Santos',
    supplierEmail: 'maria@medtech.com',
    supplierPhone: '(11) 5555-6666',
    supplierAddress: 'Av. Paulista, 1000 - São Paulo/SP',
    
    requestedBy: 'user006',
    requestedByName: 'Carlos Mendes',
    requestingDepartment: 'UTI',
    
    deliveryAddress: 'Hospital Central - UTI',
    deliveryDepartment: 'UTI',
    deliveryContact: 'Carlos Mendes',
    deliveryInstructions: 'Coordenar instalação com equipe técnica',
    
    expectedDeliveryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15),
    
    subtotal: 45000.00,
    discountPercent: 8,
    discountAmount: 3600.00,
    taxPercent: 12,
    taxAmount: 4968.00,
    shippingCost: 500.00,
    totalAmount: 46868.00,
    
    currency: 'BRL',
    paymentTerms: '45 dias',
    paymentMethod: 'Boleto bancário',
    
    items: [
      {
        id: 'item3',
        itemId: 'equ001',
        itemCode: 'EQU001',
        itemName: 'Monitor Cardíaco Multiparâmetros',
        itemType: 'equipment',
        category: 'Equipamentos de Monitoramento',
        description: 'Monitor com ECG, SpO2, NIBP, temperatura',
        brand: 'Philips',
        model: 'IntelliVue MX450',
        quantityOrdered: 3,
        quantityReceived: 0,
        quantityPending: 3,
        quantityRejected: 0,
        unitPrice: 15000.00,
        totalPrice: 45000.00,
        discountPercent: 8,
        discountAmount: 3600.00,
        taxPercent: 12,
        taxAmount: 4968.00,
        finalPrice: 46368.00,
        expectedDeliveryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15),
        qualityChecked: false,
        qualityApproved: false,
        status: 'pending',
        specifications: 'Tela 15", bateria 4h, certificação ANVISA',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
        lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1)
      }
    ],
    
    statusHistory: [
      {
        status: 'draft',
        changedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
        changedBy: 'user006',
        changedByName: 'Carlos Mendes',
        notes: 'Pedido criado para substituição de equipamentos'
      },
      {
        status: 'pending_approval',
        changedAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
        changedBy: 'user006',
        changedByName: 'Carlos Mendes',
        notes: 'Enviado para aprovação da diretoria'
      }
    ],
    
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 6),
    
    requiresQualityCheck: true,
    qualityCheckCompleted: false,
    
    isRecurring: false,
    
    tags: ['equipamentos', 'uti', 'urgente'],
    category: 'Equipamentos Médicos'
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-003',
    title: 'Suprimentos Cirúrgicos',
    description: 'Reposição de materiais para centro cirúrgico',
    status: 'completed',
    priority: 'medium',
    
    supplierId: 'sup003',
    supplierName: 'Cirúrgica Materiais',
    supplierContact: 'Pedro Oliveira',
    supplierEmail: 'pedro@cirurgica.com',
    supplierPhone: '(11) 7777-8888',
    supplierAddress: 'Rua da Saúde, 456 - São Paulo/SP',
    
    requestedBy: 'user005',
    requestedByName: 'Fernanda Lima',
    requestingDepartment: 'Centro Cirúrgico',
    
    approvedBy: 'user002',
    approvedByName: 'Dra. Maria Santos',
    approvalDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    approvalNotes: 'Aprovado para reposição de estoque',
    
    deliveryAddress: 'Hospital Central - Centro Cirúrgico',
    deliveryDepartment: 'Centro Cirúrgico',
    deliveryContact: 'Fernanda Lima',
    
    expectedDeliveryDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    actualDeliveryDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    
    subtotal: 8500.00,
    discountPercent: 3,
    discountAmount: 255.00,
    taxPercent: 10,
    taxAmount: 824.50,
    shippingCost: 150.00,
    totalAmount: 9219.50,
    
    currency: 'BRL',
    paymentTerms: '30 dias',
    paymentMethod: 'Transferência bancária',
    
    trackingNumber: 'TRK987654321',
    shippingMethod: 'Entrega própria',
    
    items: [
      {
        id: 'item4',
        itemId: 'sup001',
        itemCode: 'SUP001',
        itemName: 'Luvas Cirúrgicas Estéreis',
        itemType: 'supply',
        category: 'Material Cirúrgico',
        quantityOrdered: 500,
        quantityReceived: 500,
        quantityPending: 0,
        quantityRejected: 0,
        unitPrice: 12.00,
        totalPrice: 6000.00,
        discountPercent: 3,
        discountAmount: 180.00,
        taxPercent: 10,
        taxAmount: 582.00,
        finalPrice: 6402.00,
        actualDeliveryDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
        qualityChecked: true,
        qualityApproved: true,
        qualityNotes: 'Qualidade conforme especificação',
        batchNumber: 'LUV2024001',
        lotNumber: 'L240201',
        expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 2),
        status: 'received',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8),
        lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1)
      },
      {
        id: 'item5',
        itemId: 'sup002',
        itemCode: 'SUP002',
        itemName: 'Máscaras Cirúrgicas',
        itemType: 'supply',
        category: 'Material Cirúrgico',
        quantityOrdered: 200,
        quantityReceived: 200,
        quantityPending: 0,
        quantityRejected: 0,
        unitPrice: 12.50,
        totalPrice: 2500.00,
        discountPercent: 3,
        discountAmount: 75.00,
        taxPercent: 10,
        taxAmount: 242.50,
        finalPrice: 2667.50,
        actualDeliveryDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
        qualityChecked: true,
        qualityApproved: true,
        qualityNotes: 'Qualidade aprovada',
        batchNumber: 'MAS2024001',
        lotNumber: 'M240201',
        expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 3),
        status: 'received',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8),
        lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1)
      }
    ],
    
    statusHistory: [
      {
        status: 'draft',
        changedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8),
        changedBy: 'user005',
        changedByName: 'Fernanda Lima',
        notes: 'Pedido criado'
      },
      {
        status: 'pending_approval',
        changedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8),
        changedBy: 'user005',
        changedByName: 'Fernanda Lima',
        notes: 'Enviado para aprovação'
      },
      {
        status: 'approved',
        changedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        changedBy: 'user002',
        changedByName: 'Dra. Maria Santos',
        notes: 'Aprovado para reposição de estoque'
      },
      {
        status: 'sent',
        changedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6),
        changedBy: 'user005',
        changedByName: 'Fernanda Lima',
        notes: 'Pedido enviado'
      },
      {
        status: 'confirmed',
        changedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
        changedBy: 'system',
        changedByName: 'Sistema',
        notes: 'Confirmado pelo fornecedor'
      },
      {
        status: 'partially_received',
        changedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        changedBy: 'user005',
        changedByName: 'Fernanda Lima',
        notes: 'Recebimento parcial'
      },
      {
        status: 'completed',
        changedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
        changedBy: 'user005',
        changedByName: 'Fernanda Lima',
        notes: 'Pedido completamente recebido'
      }
    ],
    
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8),
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    sentDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6),
    confirmedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    completedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    
    requiresQualityCheck: true,
    qualityCheckCompleted: true,
    qualityCheckDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    qualityCheckBy: 'user005',
    qualityNotes: 'Todos os itens aprovados na inspeção de qualidade',
    
    isRecurring: false,
    
    tags: ['suprimentos', 'cirurgia', 'concluido'],
    category: 'Suprimentos Cirúrgicos'
  }
]

export function useOrders(options: UseOrdersOptions = {}): UseOrdersReturn {
  const {
    autoRefresh = true,
    refreshInterval = 300000, // 5 minutes
    defaultFilters = {},
    enableNotifications = true
  } = options

  // State
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Filters and search
  const [filters, setFiltersState] = useState<OrderFilters>(defaultFilters)
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)

  // Initialize data
  useEffect(() => {
    loadOrders()
  }, [])

  // Auto refresh
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refresh()
      }, refreshInterval)
      
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  // Load orders
  const loadOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setOrders(mockOrders)
    } catch (err) {
      setError('Erro ao carregar pedidos')
      console.error('Error loading orders:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort orders
  const filteredOrders = orders
    .filter(order => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        if (!order.orderNumber.toLowerCase().includes(searchLower) &&
            !order.title.toLowerCase().includes(searchLower) &&
            !order.description?.toLowerCase().includes(searchLower) &&
            !order.supplierName.toLowerCase().includes(searchLower) &&
            !order.requestedByName.toLowerCase().includes(searchLower) &&
            !order.requestingDepartment.toLowerCase().includes(searchLower) &&
            !order.deliveryDepartment.toLowerCase().includes(searchLower) &&
            !(order.tags?.some(tag => tag.toLowerCase().includes(searchLower))) &&
            !order.items.some(item => 
              item.itemName.toLowerCase().includes(searchLower) ||
              item.itemCode.toLowerCase().includes(searchLower)
            )) {
          return false
        }
      }
      
      if (filters.status && filters.status !== 'all' && order.status !== filters.status) return false
      if (filters.priority && filters.priority !== 'all' && order.priority !== filters.priority) return false
      if (filters.supplierId && order.supplierId !== filters.supplierId) return false
      if (filters.requestingDepartment && order.requestingDepartment !== filters.requestingDepartment) return false
      if (filters.deliveryDepartment && order.deliveryDepartment !== filters.deliveryDepartment) return false
      if (filters.requestedBy && order.requestedBy !== filters.requestedBy) return false
      if (filters.approvedBy && order.approvedBy !== filters.approvedBy) return false
      if (filters.category && order.category !== filters.category) return false
      
      if (filters.createdFrom && order.createdAt < filters.createdFrom) return false
      if (filters.createdTo && order.createdAt > filters.createdTo) return false
      if (filters.expectedDeliveryFrom && (!order.expectedDeliveryDate || order.expectedDeliveryDate < filters.expectedDeliveryFrom)) return false
      if (filters.expectedDeliveryTo && (!order.expectedDeliveryDate || order.expectedDeliveryDate > filters.expectedDeliveryTo)) return false
      
      if (filters.minAmount && order.totalAmount < filters.minAmount) return false
      if (filters.maxAmount && order.totalAmount > filters.maxAmount) return false
      
      if (filters.pendingApproval && order.status !== 'pending_approval') return false
      if (filters.recentlyCompleted && (order.status !== 'completed' || !order.completedDate || order.completedDate < new Date(Date.now() - 1000 * 60 * 60 * 24 * 7))) return false
      
      if (filters.overdue) {
        if (!order.expectedDeliveryDate || order.expectedDeliveryDate > new Date() || order.status === 'completed' || order.status === 'cancelled') {
          return false
        }
      }
      
      if (filters.itemType && filters.itemType !== 'all') {
        if (!order.items.some(item => item.itemType === filters.itemType)) {
          return false
        }
      }
      
      if (filters.hasQualityIssues) {
        if (!order.items.some(item => item.qualityChecked && !item.qualityApproved)) {
          return false
        }
      }
      
      if (filters.today) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        
        if (order.createdAt < today || order.createdAt >= tomorrow) {
          return false
        }
      }
      
      if (filters.thisWeek) {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        if (order.createdAt < weekAgo) return false
      }
      
      if (filters.thisMonth) {
        const monthAgo = new Date()
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        if (order.createdAt < monthAgo) return false
      }
      
      if (filters.tags && filters.tags.length > 0) {
        if (!order.tags || !filters.tags.some(tag => order.tags!.includes(tag))) {
          return false
        }
      }
      
      if (filters.excludeTags && filters.excludeTags.length > 0) {
        if (order.tags && filters.excludeTags.some(tag => order.tags!.includes(tag))) {
          return false
        }
      }
      
      return true
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy as keyof Order]
      let bValue: any = b[sortBy as keyof Order]
      
      if (aValue instanceof Date && bValue instanceof Date) {
        aValue = aValue.getTime()
        bValue = bValue.getTime()
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

  // Calculate stats
  const stats: OrderStats = {
    totalOrders: orders.length,
    draftOrders: orders.filter(o => o.status === 'draft').length,
    pendingApprovalOrders: orders.filter(o => o.status === 'pending_approval').length,
    approvedOrders: orders.filter(o => o.status === 'approved').length,
    sentOrders: orders.filter(o => o.status === 'sent').length,
    confirmedOrders: orders.filter(o => o.status === 'confirmed').length,
    partiallyReceivedOrders: orders.filter(o => o.status === 'partially_received').length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
    rejectedOrders: orders.filter(o => o.status === 'rejected').length,
    
    // By priority
    lowPriorityOrders: orders.filter(o => o.priority === 'low').length,
    mediumPriorityOrders: orders.filter(o => o.priority === 'medium').length,
    highPriorityOrders: orders.filter(o => o.priority === 'high').length,
    urgentOrders: orders.filter(o => o.priority === 'urgent').length,
    
    // Financial
    totalOrderValue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
    averageOrderValue: orders.reduce((sum, o) => sum + o.totalAmount, 0) / Math.max(1, orders.length),
    pendingOrderValue: orders.filter(o => ['pending_approval', 'approved', 'sent', 'confirmed'].includes(o.status)).reduce((sum, o) => sum + o.totalAmount, 0),
    completedOrderValue: orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.totalAmount, 0),
    
    // Performance metrics
    averageProcessingTime: orders
      .filter(o => o.completedDate && o.createdAt)
      .reduce((sum, o) => {
        const processingTime = (o.completedDate!.getTime() - o.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        return sum + processingTime
      }, 0) / Math.max(1, orders.filter(o => o.completedDate).length),
    
    averageDeliveryTime: orders
      .filter(o => o.actualDeliveryDate && o.sentDate)
      .reduce((sum, o) => {
        const deliveryTime = (o.actualDeliveryDate!.getTime() - o.sentDate!.getTime()) / (1000 * 60 * 60 * 24)
        return sum + deliveryTime
      }, 0) / Math.max(1, orders.filter(o => o.actualDeliveryDate && o.sentDate).length),
    
    onTimeDeliveryRate: (() => {
      const deliveredOrders = orders.filter(o => o.actualDeliveryDate && o.expectedDeliveryDate)
      const onTimeOrders = deliveredOrders.filter(o => o.actualDeliveryDate! <= o.expectedDeliveryDate!)
      return deliveredOrders.length > 0 ? (onTimeOrders.length / deliveredOrders.length) * 100 : 0
    })(),
    
    orderAccuracyRate: (() => {
      const completedOrders = orders.filter(o => o.status === 'completed')
      const accurateOrders = completedOrders.filter(o => 
        o.items.every(item => item.quantityReceived === item.quantityOrdered && item.qualityApproved)
      )
      return completedOrders.length > 0 ? (accurateOrders.length / completedOrders.length) * 100 : 0
    })(),
    
    // Time-based
    todayOrders: orders.filter(o => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      return o.createdAt >= today && o.createdAt < tomorrow
    }).length,
    
    weekOrders: orders.filter(o => {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return o.createdAt >= weekAgo
    }).length,
    
    monthOrders: orders.filter(o => {
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      return o.createdAt >= monthAgo
    }).length,
    
    overdueOrders: orders.filter(o => 
      o.expectedDeliveryDate && 
      o.expectedDeliveryDate < new Date() && 
      !['completed', 'cancelled'].includes(o.status)
    ).length,
    
    // Supplier metrics
    topSuppliers: (() => {
      const supplierStats = orders.reduce((acc, order) => {
        if (!acc[order.supplierId]) {
          acc[order.supplierId] = {
            supplierId: order.supplierId,
            supplierName: order.supplierName,
            orderCount: 0,
            totalValue: 0
          }
        }
        acc[order.supplierId].orderCount++
        acc[order.supplierId].totalValue += order.totalAmount
        return acc
      }, {} as Record<string, any>)
      
      return Object.values(supplierStats)
        .sort((a: any, b: any) => b.totalValue - a.totalValue)
        .slice(0, 5)
    })(),
    
    // Department metrics
    departmentStats: (() => {
      const deptStats = orders.reduce((acc, order) => {
        if (!acc[order.requestingDepartment]) {
          acc[order.requestingDepartment] = {
            department: order.requestingDepartment,
            orderCount: 0,
            totalValue: 0
          }
        }
        acc[order.requestingDepartment].orderCount++
        acc[order.requestingDepartment].totalValue += order.totalAmount
        return acc
      }, {} as Record<string, any>)
      
      return Object.values(deptStats)
        .sort((a: any, b: any) => b.totalValue - a.totalValue)
    })(),
    
    // Trends
    orderTrends: [
      {
        period: 'Hoje',
        orderCount: orders.filter(o => {
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          return o.createdAt >= today
        }).length,
        totalValue: orders.filter(o => {
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          return o.createdAt >= today
        }).reduce((sum, o) => sum + o.totalAmount, 0),
        completedCount: orders.filter(o => {
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          return o.completedDate && o.completedDate >= today
        }).length
      },
      {
        period: 'Esta Semana',
        orderCount: orders.filter(o => {
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return o.createdAt >= weekAgo
        }).length,
        totalValue: orders.filter(o => {
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return o.createdAt >= weekAgo
        }).reduce((sum, o) => sum + o.totalAmount, 0),
        completedCount: orders.filter(o => {
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return o.completedDate && o.completedDate >= weekAgo
        }).length
      },
      {
        period: 'Este Mês',
        orderCount: orders.filter(o => {
          const monthAgo = new Date()
          monthAgo.setMonth(monthAgo.getMonth() - 1)
          return o.createdAt >= monthAgo
        }).length,
        totalValue: orders.filter(o => {
          const monthAgo = new Date()
          monthAgo.setMonth(monthAgo.getMonth() - 1)
          return o.createdAt >= monthAgo
        }).reduce((sum, o) => sum + o.totalAmount, 0),
        completedCount: orders.filter(o => {
          const monthAgo = new Date()
          monthAgo.setMonth(monthAgo.getMonth() - 1)
          return o.completedDate && o.completedDate >= monthAgo
        }).length
      }
    ]
  }

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Functions
  const setFilters = useCallback((newFilters: Partial<OrderFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }))
    setCurrentPage(1)
  }, [])

  const clearFilters = useCallback(() => {
    setFiltersState(defaultFilters)
    setCurrentPage(1)
  }, [defaultFilters])

  const setSorting = useCallback((field: string, order?: 'asc' | 'desc') => {
    setSortBy(field)
    setSortOrder(order || (sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc'))
  }, [sortBy, sortOrder])

  const setPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }, [totalPages])

  const refresh = useCallback(async () => {
    setRefreshing(true)
    await loadOrders()
    setRefreshing(false)
    toast.success('Pedidos atualizados')
  }, [])

  // CRUD Operations
  const createOrder = useCallback(async (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'lastUpdated' | 'statusHistory'>): Promise<string | null> => {
    try {
      const newOrder: Order = {
        ...orderData,
        id: Date.now().toString(),
        orderNumber: generateOrderNumber(),
        createdAt: new Date(),
        lastUpdated: new Date(),
        statusHistory: [{
          status: orderData.status,
          changedAt: new Date(),
          changedBy: orderData.requestedBy,
          changedByName: orderData.requestedByName,
          notes: 'Pedido criado'
        }]
      }
      
      setOrders(prev => [newOrder, ...prev])
      toast.success('Pedido criado com sucesso')
      return newOrder.id
    } catch (err) {
      toast.error('Erro ao criar pedido')
      console.error('Error creating order:', err)
      return null
    }
  }, [])

  const getOrder = useCallback((id: string): Order | null => {
    return orders.find(order => order.id === id) || null
  }, [orders])

  // Item Operations
  const addOrderItem = useCallback(async (orderId: string, item: Omit<OrderItem, 'id' | 'createdAt' | 'lastUpdated'>): Promise<boolean> => {
    try {
      const newItem: OrderItem = {
        ...item,
        id: `item_${Date.now()}`,
        createdAt: new Date(),
        lastUpdated: new Date()
      }
      
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              items: [...order.items, newItem],
              totalAmount: order.totalAmount + (item.unitPrice * item.quantityOrdered),
              lastUpdated: new Date()
            }
          : order
      ))
      
      toast.success('Item adicionado ao pedido')
      return true
    } catch (err) {
      toast.error('Erro ao adicionar item')
      console.error('Error adding order item:', err)
      return false
    }
  }, [orders])

  const updateOrderItem = useCallback(async (orderId: string, itemId: string, updates: Partial<OrderItem>): Promise<boolean> => {
    try {
      setOrders(prev => prev.map(order => {
        if (order.id !== orderId) return order
        
        const updatedItems = order.items.map(item => 
          item.id === itemId 
            ? { ...item, ...updates, lastUpdated: new Date() }
            : item
        )
        
        const totalAmount = updatedItems.reduce((sum, item) => 
          sum + (item.unitPrice * item.quantityOrdered), 0
        )
        
        return {
          ...order,
          items: updatedItems,
          totalAmount,
          lastUpdated: new Date()
        }
      }))
      
      toast.success('Item atualizado')
      return true
    } catch (err) {
      toast.error('Erro ao atualizar item')
      console.error('Error updating order item:', err)
      return false
    }
  }, [orders])

  const removeOrderItem = useCallback(async (orderId: string, itemId: string): Promise<boolean> => {
    try {
      setOrders(prev => prev.map(order => {
        if (order.id !== orderId) return order
        
        const updatedItems = order.items.filter(item => item.id !== itemId)
        const totalAmount = updatedItems.reduce((sum, item) => 
          sum + (item.unitPrice * item.quantityOrdered), 0
        )
        
        return {
          ...order,
          items: updatedItems,
          totalAmount,
          lastUpdated: new Date()
        }
      }))
      
      toast.success('Item removido do pedido')
      return true
    } catch (err) {
      toast.error('Erro ao remover item')
      console.error('Error removing order item:', err)
      return false
    }
  }, [orders])

  // Communication
  const addOrderNote = useCallback(async (orderId: string, note: string, isInternal: boolean = false): Promise<boolean> => {
    try {
      const newNote = {
        id: `note_${Date.now()}`,
        content: note,
        createdAt: new Date(),
        createdBy: 'current-user',
        createdByName: 'Current User',
        isInternal
      }
      
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              notes: [...(order.notes || []), newNote],
              lastUpdated: new Date()
            }
          : order
      ))
      
      toast.success('Nota adicionada')
      return true
    } catch (err) {
      toast.error('Erro ao adicionar nota')
      console.error('Error adding order note:', err)
      return false
    }
  }, [orders])

  const sendMessage = useCallback(async (orderId: string, message: string, recipient: string): Promise<boolean> => {
    try {
      // Simulate sending message to supplier/department
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const messageRecord = {
        id: `msg_${Date.now()}`,
        content: message,
        sentAt: new Date(),
        sentBy: 'current-user',
        sentByName: 'Current User',
        recipient,
        type: 'outbound' as const
      }
      
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              communications: [...(order.communications || []), messageRecord],
              lastUpdated: new Date()
            }
          : order
      ))
      
      toast.success('Mensagem enviada')
      return true
    } catch (err) {
      toast.error('Erro ao enviar mensagem')
      console.error('Error sending message:', err)
      return false
    }
  }, [orders])

  // Attachments
  const addAttachment = useCallback(async (orderId: string, file: File): Promise<boolean> => {
    try {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const attachment = {
        id: `att_${Date.now()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file), // In real app, this would be the uploaded file URL
        uploadedAt: new Date(),
        uploadedBy: 'current-user',
        uploadedByName: 'Current User'
      }
      
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              attachments: [...(order.attachments || []), attachment],
              lastUpdated: new Date()
            }
          : order
      ))
      
      toast.success('Anexo adicionado')
      return true
    } catch (err) {
      toast.error('Erro ao adicionar anexo')
      console.error('Error adding attachment:', err)
      return false
    }
  }, [orders])

  const removeAttachment = useCallback(async (orderId: string, attachmentId: string): Promise<boolean> => {
    try {
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              attachments: (order.attachments || []).filter(att => att.id !== attachmentId),
              lastUpdated: new Date()
            }
          : order
      ))
      
      toast.success('Anexo removido')
      return true
    } catch (err) {
      toast.error('Erro ao remover anexo')
      console.error('Error removing attachment:', err)
      return false
    }
  }, [orders])

  // Bulk Operations
  const bulkUpdateStatus = useCallback(async (orderIds: string[], status: Order['status']): Promise<boolean> => {
    try {
      const statusEntry = {
        status,
        changedAt: new Date(),
        changedBy: 'system',
        changedByName: 'Sistema',
        notes: `Status atualizado em massa para: ${status}`
      }
      
      setOrders(prev => prev.map(order => 
        orderIds.includes(order.id)
          ? { 
              ...order, 
              status,
              lastUpdated: new Date(),
              statusHistory: [...order.statusHistory, statusEntry]
            }
          : order
      ))
      
      toast.success(`${orderIds.length} pedidos atualizados`)
      return true
    } catch (err) {
      toast.error('Erro na atualização em massa')
      console.error('Error bulk updating orders:', err)
      return false
    }
  }, [orders])

  const bulkDelete = useCallback(async (orderIds: string[]): Promise<boolean> => {
    try {
      setOrders(prev => prev.filter(order => !orderIds.includes(order.id)))
      toast.success(`${orderIds.length} pedidos removidos`)
      return true
    } catch (err) {
      toast.error('Erro na remoção em massa')
      console.error('Error bulk deleting orders:', err)
      return false
    }
  }, [orders])

  // Utility Functions
  const exportOrders = useCallback(async (format: 'csv' | 'excel' | 'pdf', orderIds?: string[]): Promise<boolean> => {
    try {
      const ordersToExport = orderIds 
        ? orders.filter(order => orderIds.includes(order.id))
        : filteredOrders
      
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const filename = `pedidos_${new Date().toISOString().split('T')[0]}.${format}`
      toast.success(`Relatório exportado: ${filename}`)
      return true
    } catch (err) {
      toast.error('Erro ao exportar dados')
      console.error('Error exporting orders:', err)
      return false
    }
  }, [orders, filteredOrders])

  const importOrders = useCallback(async (file: File): Promise<boolean> => {
    try {
      // Simulate import
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // In real implementation, parse file and create orders
      toast.success('Pedidos importados com sucesso')
      await loadOrders() // Reload data
      return true
    } catch (err) {
      toast.error('Erro ao importar dados')
      console.error('Error importing orders:', err)
      return false
    }
  }, [loadOrders])

  // Search and Filter Helpers
  const searchOrders = useCallback((query: string) => {
    return orders.filter(order => 
      order.orderNumber.toLowerCase().includes(query.toLowerCase()) ||
      order.supplierName.toLowerCase().includes(query.toLowerCase()) ||
      order.department.toLowerCase().includes(query.toLowerCase()) ||
      order.items.some(item => 
        item.itemName.toLowerCase().includes(query.toLowerCase()) ||
        item.itemCode.toLowerCase().includes(query.toLowerCase())
      )
    )
  }, [orders])

  const getOrdersBySupplier = useCallback((supplierId: string) => {
    return orders.filter(order => order.supplierId === supplierId)
  }, [orders])

  const getOrdersByDepartment = useCallback((department: string) => {
    return orders.filter(order => order.department === department)
  }, [orders])

  const getOrdersByStatus = useCallback((status: Order['status']) => {
    return orders.filter(order => order.status === status)
  }, [orders])

  const getOrdersByPriority = useCallback((priority: Order['priority']) => {
    return orders.filter(order => order.priority === priority)
  }, [orders])

  const getOrdersByDateRange = useCallback((startDate: Date, endDate: Date) => {
    return orders.filter(order => {
      const orderDate = new Date(order.orderDate)
      return orderDate >= startDate && orderDate <= endDate
    })
  }, [orders])

  const getOverdueOrders = useCallback(() => {
    const now = new Date()
    return orders.filter(order => {
      if (!order.expectedDeliveryDate) return false
      return new Date(order.expectedDeliveryDate) < now && 
             !['completed', 'cancelled'].includes(order.status)
    })
  }, [orders])

  const getHighValueOrders = useCallback((threshold: number = 10000) => {
    return orders.filter(order => order.totalAmount >= threshold)
  }, [orders])

  return {
    // State
    orders: filteredOrders,
    loading,
    stats,
    filters,
    sortBy,
    sortOrder,
    currentPage,
    totalPages,
    totalItems: filteredOrders.length,

    // Actions
    loadOrders,
    setFilters,
    clearFilters,
    setSortBy,
    setSortOrder,
    setCurrentPage,
    refreshData,

    // CRUD Operations
    createOrder,
    getOrder,
    updateOrder,
    deleteOrder,
    duplicateOrder,

    // Status Operations
    submitForApproval,
    approveOrder,
    rejectOrder,
    sendOrder,
    confirmOrder,
    receiveOrder,
    completeOrder,
    cancelOrder,

    // Item Operations
    addOrderItem,
    updateOrderItem,
    removeOrderItem,

    // Communication
    addOrderNote,
    sendMessage,

    // Attachments
    addAttachment,
    removeAttachment,

    // Bulk Operations
    bulkUpdateStatus,
    bulkDelete,

    // Utility Functions
    exportOrders,
    importOrders,

    // Search and Filter Helpers
    searchOrders,
    getOrdersBySupplier,
    getOrdersByDepartment,
    getOrdersByStatus,
    getOrdersByPriority,
    getOrdersByDateRange,
    getOverdueOrders,
    getHighValueOrders
  }
}

export default useOrders

  const updateOrder = useCallback(async (id: string, updates: Partial<Order>): Promise<boolean> => {
    try {
      setOrders(prev => prev.map(order => 
        order.id === id 
          ? { ...order, ...updates, lastUpdated: new Date() }
          : order
      ))
      
      toast.success('Pedido atualizado')
      return true
    } catch (err) {
      toast.error('Erro ao atualizar pedido')
      console.error('Error updating order:', err)
      return false
    }
  }, [])

  const deleteOrder = useCallback(async (id: string): Promise<boolean> => {
    try {
      setOrders(prev => prev.filter(order => order.id !== id))
      toast.success('Pedido removido')
      return true
    } catch (err) {
      toast.error('Erro ao remover pedido')
      console.error('Error deleting order:', err)
      return false
    }
  }, [])

  const duplicateOrder = useCallback(async (id: string): Promise<string | null> => {
    try {
      const originalOrder = orders.find(order => order.id === id)
      if (!originalOrder) {
        toast.error('Pedido não encontrado')
        return null
      }
      
      const duplicatedOrder: Order = {
        ...originalOrder,
        id: Date.now().toString(),
        orderNumber: generateOrderNumber(),
        title: `${originalOrder.title} (Cópia)`,
        status: 'draft',
        createdAt: new Date(),
        lastUpdated: new Date(),
        statusHistory: [{
          status: 'draft',
          changedAt: new Date(),
          changedBy: originalOrder.requestedBy,
          changedByName: originalOrder.requestedByName,
          notes: 'Pedido duplicado'
        }],
        // Reset dates and approval info
        approvedBy: undefined,
        approvedByName: undefined,
        approvalDate: undefined,
        approvalNotes: undefined,
        rejectedBy: undefined,
        rejectedByName: undefined,
        rejectionDate: undefined,
        rejectionReason: undefined,
        sentDate: undefined,
        confirmedDate: undefined,
        completedDate: undefined,
        cancelledDate: undefined,
        actualDeliveryDate: undefined,
        trackingNumber: undefined,
        // Reset item statuses
        items: originalOrder.items.map(item => ({
          ...item,
          id: `${Date.now()}-${item.id}`,
          quantityReceived: 0,
          quantityPending: item.quantityOrdered,
          quantityRejected: 0,
          status: 'pending',
          qualityChecked: false,
          qualityApproved: false,
          qualityNotes: undefined,
          actualDeliveryDate: undefined,
          batchNumber: undefined,
          lotNumber: undefined,
          createdAt: new Date(),
          lastUpdated: new Date()
        }))
      }
      
      setOrders(prev => [duplicatedOrder, ...prev])
      toast.success('Pedido duplicado com sucesso')
      return duplicatedOrder.id
    } catch (err) {
      toast.error('Erro ao duplicar pedido')
      console.error('Error duplicating order:', err)
      return null
    }
  }, [orders])

  // Status Operations
  const submitForApproval = useCallback(async (id: string): Promise<boolean> => {
    try {
      const order = orders.find(o => o.id === id)
      if (!order) return false
      
      const statusEntry = {
        status: 'pending_approval' as const,
        changedAt: new Date(),
        changedBy: order.requestedBy,
        changedByName: order.requestedByName,
        notes: 'Enviado para aprovação'
      }
      
      setOrders(prev => prev.map(o => 
        o.id === id 
          ? { 
              ...o, 
              status: 'pending_approval',
              lastUpdated: new Date(),
              statusHistory: [...o.statusHistory, statusEntry]
            }
          : o
      ))
      
      toast.success('Pedido enviado para aprovação')
      return true
    } catch (err) {
      toast.error('Erro ao enviar para aprovação')
      console.error('Error submitting for approval:', err)
      return false
    }
  }, [orders])

  const approveOrder = useCallback(async (id: string, approvedBy: string, notes?: string): Promise<boolean> => {
    try {
      const statusEntry = {
        status: 'approved' as const,
        changedAt: new Date(),
        changedBy: approvedBy,
        changedByName: 'Current User', // Would come from user context
        notes: notes || 'Pedido aprovado'
      }
      
      setOrders(prev => prev.map(order => 
        order.id === id 
          ? { 
              ...order, 
              status: 'approved',
              approvedBy,
              approvedByName: 'Current User',
              approvalDate: new Date(),
              approvalNotes: notes,
              lastUpdated: new Date(),
              statusHistory: [...order.statusHistory, statusEntry]
            }
          : order
      ))
      
      toast.success('Pedido aprovado')
      return true
    } catch (err) {
      toast.error('Erro ao aprovar pedido')
      console.error('Error approving order:', err)
      return false
    }
  }, [orders])

  const rejectOrder = useCallback(async (id: string, rejectedBy: string, reason: string): Promise<boolean> => {
    try {
      const statusEntry = {
        status: 'rejected' as const,
        changedAt: new Date(),
        changedBy: rejectedBy,
        changedByName: 'Current User',
        notes: `Pedido rejeitado: ${reason}`
      }
      
      setOrders(prev => prev.map(order => 
        order.id === id 
          ? { 
              ...order, 
              status: 'rejected',
              rejectedBy,
              rejectedByName: 'Current User',
              rejectionDate: new Date(),
              rejectionReason: reason,
              lastUpdated: new Date(),
              statusHistory: [...order.statusHistory, statusEntry]
            }
          : order
      ))
      
      toast.success('Pedido rejeitado')
      return true
    } catch (err) {
      toast.error('Erro ao rejeitar pedido')
      console.error('Error rejecting order:', err)
      return false
    }
  }, [orders])

  const sendOrder = useCallback(async (id: string): Promise<boolean> => {
    try {
      const statusEntry = {
        status: 'sent' as const,
        changedAt: new Date(),
        changedBy: 'system',
        changedByName: 'Sistema',
        notes: 'Pedido enviado ao fornecedor'
      }
      
      setOrders(prev => prev.map(order => 
        order.id === id 
          ? { 
              ...order, 
              status: 'sent',
              sentDate: new Date(),
              lastUpdated: new Date(),
              statusHistory: [...order.statusHistory, statusEntry]
            }
          : order
      ))
      
      toast.success('Pedido enviado ao fornecedor')
      return true
    } catch (err) {
      toast.error('Erro ao enviar pedido')
      console.error('Error sending order:', err)
      return false
    }
  }, [orders])

  const confirmOrder = useCallback(async (id: string, trackingNumber?: string): Promise<boolean> => {
    try {
      const statusEntry = {
        status: 'confirmed' as const,
        changedAt: new Date(),
        changedBy: 'system',
        changedByName: 'Sistema',
        notes: trackingNumber ? `Pedido confirmado - Rastreamento: ${trackingNumber}` : 'Pedido confirmado pelo fornecedor'
      }
      
      setOrders(prev => prev.map(order => 
        order.id === id 
          ? { 
              ...order, 
              status: 'confirmed',
              confirmedDate: new Date(),
              trackingNumber,
              lastUpdated: new Date(),
              statusHistory: [...order.statusHistory, statusEntry]
            }
          : order
      ))
      
      toast.success('Pedido confirmado')
      return true
    } catch (err) {
      toast.error('Erro ao confirmar pedido')
      console.error('Error confirming order:', err)
      return false
    }
  }, [orders])

  const receiveOrder = useCallback(async (id: string, receivedItems: { itemId: string; quantityReceived: number; qualityApproved: boolean; notes?: string }[]): Promise<boolean> => {
    try {
      setOrders(prev => prev.map(order => {
        if (order.id !== id) return order
        
        const updatedItems = order.items.map(item => {
          const receivedItem = receivedItems.find(ri => ri.itemId === item.id)
          if (!receivedItem) return item
          
          return {
            ...item,
            quantityReceived: receivedItem.quantityReceived,
            quantityPending: item.quantityOrdered - receivedItem.quantityReceived,
            qualityChecked: true,
            qualityApproved: receivedItem.qualityApproved,
            qualityNotes: receivedItem.notes,
            actualDeliveryDate: new Date(),
            status: receivedItem.quantityReceived === item.quantityOrdered ? 'received' : 'partially_received' as any,
            lastUpdated: new Date()
          }
        })
        
        const allItemsReceived = updatedItems.every(item => item.quantityReceived === item.quantityOrdered)
        const newStatus = allItemsReceived ? 'completed' : 'partially_received'
        
        const statusEntry = {
          status: newStatus as const,
          changedAt: new Date(),
          changedBy: 'system',
          changedByName: 'Sistema',
          notes: allItemsReceived ? 'Todos os itens recebidos' : 'Recebimento parcial'
        }
        
        return {
          ...order,
          status: newStatus,
          items: updatedItems,
          actualDeliveryDate: new Date(),
          completedDate: allItemsReceived ? new Date() : undefined,
          lastUpdated: new Date(),
          statusHistory: [...order.statusHistory, statusEntry]
        }
      }))
      
      toast.success('Recebimento registrado')
      return true
    } catch (err) {
      toast.error('Erro ao registrar recebimento')
      console.error('Error receiving order:', err)
      return false
    }
  }, [orders])

  const completeOrder = useCallback(async (id: string): Promise<boolean> => {
    try {
      const statusEntry = {
        status: 'completed' as const,
        changedAt: new Date(),
        changedBy: 'system',
        changedByName: 'Sistema',
        notes: 'Pedido completado'
      }
      
      setOrders(prev => prev.map(order => 
        order.id === id 
          ? { 
              ...order, 
              status: 'completed',
              completedDate: new Date(),
              lastUpdated: new Date(),
              statusHistory: [...order.statusHistory, statusEntry]
            }
          : order
      ))
      
      toast.success('Pedido completado')
      return true
    } catch (err) {
      toast.error('Erro ao completar pedido')
      console.error('Error completing order:', err)
      return false
    }
  }, [orders])

  const cancelOrder = useCallback(async (id: string, reason: string): Promise<boolean> => {
    try {
      const statusEntry = {
        status: 'cancelled' as const,
        changedAt: new Date(),
        changedBy: 'system',
        changedByName: 'Sistema',
        notes: `Pedido cancelado: ${reason}`
      }
      
      setOrders(prev => prev.map(order => 
        order.id === id 
          ? { 
              ...order, 
              status: 'cancelled',
              cancelledDate: new Date(),
              lastUpdated: new Date(),
              statusHistory: [...order.statusHistory, statusEntry]
            }
          : order
      ))
      
      toast.success('Pedido cancelado')
      return true
    } catch (err) {
      toast.error('Erro ao cancelar pedido')
      console.error('Error cancelling order:', err)
      return false
    }
  }, [orders])