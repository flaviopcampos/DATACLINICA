// Tipos para o Sistema de Faturamento

// Enums
export enum InvoiceStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
  PARTIALLY_PAID = 'partially_paid'
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled'
}

export enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PIX = 'pix',
  BANK_TRANSFER = 'bank_transfer',
  CHECK = 'check',
  INSURANCE = 'insurance'
}

export enum InvoiceType {
  CONSULTATION = 'consultation',
  PROCEDURE = 'procedure',
  HOSPITALIZATION = 'hospitalization',
  MEDICATION = 'medication',
  EXAM = 'exam',
  OTHER = 'other'
}

// Interfaces principais
export interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  doctorId?: string;
  doctorName?: string;
  appointmentId?: string;
  type: InvoiceType;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  items: InvoiceItem[];
  subtotal: number;
  discountAmount: number;
  discountPercentage: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  notes?: string;
  paymentTerms?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  serviceCode?: string;
  category: string;
  notes?: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  reference?: string;
  paymentDate: string;
  processedDate?: string;
  notes?: string;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  processedBy?: string;
}

export interface PaymentPlan {
  id: string;
  invoiceId: string;
  totalAmount: number;
  installments: PaymentInstallment[];
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface PaymentInstallment {
  id: string;
  paymentPlanId: string;
  installmentNumber: number;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue';
  paymentId?: string;
}

// Estatísticas e Relatórios
export interface BillingStats {
  totalRevenue: number;
  monthlyRevenue: number;
  pendingAmount: number;
  overdueAmount: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  averageInvoiceValue: number;
  collectionRate: number;
  paymentMethodBreakdown: PaymentMethodStats[];
  revenueByMonth: MonthlyRevenue[];
}

export interface PaymentMethodStats {
  method: PaymentMethod;
  count: number;
  totalAmount: number;
  percentage: number;
}

export interface MonthlyRevenue {
  month: string;
  year: number;
  revenue: number;
  invoiceCount: number;
  averageValue: number;
}

export interface OverdueReport {
  totalOverdue: number;
  overdueCount: number;
  overdueInvoices: OverdueInvoice[];
  agingBrackets: AgingBracket[];
}

export interface OverdueInvoice {
  id: string;
  invoiceNumber: string;
  patientName: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
  lastContactDate?: string;
}

export interface AgingBracket {
  range: string; // '0-30', '31-60', '61-90', '90+'
  count: number;
  totalAmount: number;
  percentage: number;
}

// Formulários
export interface CreateInvoiceForm {
  patientId: string;
  doctorId?: string;
  appointmentId?: string;
  type: InvoiceType;
  dueDate: string;
  items: CreateInvoiceItemForm[];
  discountPercentage: number;
  discountAmount: number;
  notes?: string;
  paymentTerms?: string;
}

export interface CreateInvoiceItemForm {
  description: string;
  quantity: number;
  unitPrice: number;
  serviceCode?: string;
  category: string;
  notes?: string;
}

export interface UpdateInvoiceForm {
  type?: InvoiceType;
  dueDate?: string;
  items?: UpdateInvoiceItemForm[];
  discountPercentage?: number;
  discountAmount?: number;
  notes?: string;
  paymentTerms?: string;
  status?: InvoiceStatus;
}

export interface UpdateInvoiceItemForm {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  serviceCode?: string;
  category: string;
  notes?: string;
}

export interface CreatePaymentForm {
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  paymentDate: string;
  transactionId?: string;
  reference?: string;
  notes?: string;
}

export interface CreatePaymentPlanForm {
  invoiceId: string;
  installmentCount: number;
  firstDueDate: string;
  installmentAmount?: number; // Se não fornecido, divide igualmente
}

// Filtros e Busca
export interface InvoiceFilters {
  status?: InvoiceStatus[];
  type?: InvoiceType[];
  patientId?: string;
  doctorId?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  search?: string;
}

export interface PaymentFilters {
  status?: PaymentStatus[];
  method?: PaymentMethod[];
  patientId?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  search?: string;
}

// Requests para API
export interface CreateInvoiceRequest {
  patientId: string;
  doctorId?: string;
  appointmentId?: string;
  type: InvoiceType;
  dueDate: string;
  items: CreateInvoiceItemRequest[];
  discountPercentage?: number;
  discountAmount?: number;
  notes?: string;
  paymentTerms?: string;
}

export interface CreateInvoiceItemRequest {
  description: string;
  quantity: number;
  unitPrice: number;
  serviceCode?: string;
  category: string;
  notes?: string;
}

export interface UpdateInvoiceRequest {
  type?: InvoiceType;
  dueDate?: string;
  items?: UpdateInvoiceItemRequest[];
  discountPercentage?: number;
  discountAmount?: number;
  notes?: string;
  paymentTerms?: string;
  status?: InvoiceStatus;
}

export interface UpdateInvoiceItemRequest {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  serviceCode?: string;
  category: string;
  notes?: string;
}

export interface CreatePaymentRequest {
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  paymentDate: string;
  transactionId?: string;
  reference?: string;
  notes?: string;
}

export interface CreatePaymentPlanRequest {
  invoiceId: string;
  installmentCount: number;
  firstDueDate: string;
  installmentAmount?: number;
}

// Responses da API
export interface InvoiceListResponse {
  invoices: Invoice[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaymentListResponse {
  payments: Payment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BillingStatsResponse {
  stats: BillingStats;
  period: {
    from: string;
    to: string;
  };
}

export interface OverdueReportResponse {
  report: OverdueReport;
  generatedAt: string;
}

// Utilitários
export interface InvoicePDFOptions {
  includePaymentHistory: boolean;
  includeNotes: boolean;
  watermark?: string;
  language: 'pt' | 'en';
}

export interface BulkInvoiceAction {
  invoiceIds: string[];
  action: 'mark_paid' | 'mark_overdue' | 'send_reminder' | 'cancel';
  notes?: string;
}

// Configurações
export interface BillingSettings {
  defaultPaymentTerms: string;
  defaultDueDays: number;
  taxRate: number;
  invoicePrefix: string;
  invoiceNumberFormat: string;
  reminderDays: number[];
  overdueThresholdDays: number;
  allowPartialPayments: boolean;
  requirePaymentMethod: boolean;
}

// Tipos para componentes
export interface InvoiceCardProps {
  invoice: Invoice;
  onView?: (invoice: Invoice) => void;
  onEdit?: (invoice: Invoice) => void;
  onDelete?: (invoice: Invoice) => void;
  onMarkPaid?: (invoice: Invoice) => void;
  showActions?: boolean;
}

export interface PaymentFormProps {
  invoiceId: string;
  maxAmount: number;
  onSubmit: (payment: CreatePaymentForm) => void;
  onCancel: () => void;
  loading?: boolean;
}

export interface BillingStatsProps {
  stats: BillingStats;
  loading?: boolean;
  period?: {
    from: string;
    to: string;
  };
}

export interface InvoiceFormProps {
  invoice?: Invoice;
  onSubmit: (data: CreateInvoiceForm | UpdateInvoiceForm) => void;
  onCancel: () => void;
  loading?: boolean;
  mode: 'create' | 'edit';
}

export interface PaymentHistoryProps {
  invoiceId: string;
  payments: Payment[];
  loading?: boolean;
  onRefresh?: () => void;
}