import { api } from './api';
import type {
  Invoice,
  Payment,
  PaymentPlan,
  BillingStats,
  OverdueReport,
  InvoiceListResponse,
  PaymentListResponse,
  BillingStatsResponse,
  OverdueReportResponse,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  CreatePaymentRequest,
  CreatePaymentPlanRequest,
  InvoiceFilters,
  PaymentFilters,
  BulkInvoiceAction,
  BillingSettings,
  InvoicePDFOptions
} from '@/types/billing';

// Serviços de Faturas
export const invoiceService = {
  // Listar faturas com filtros e paginação
  async getInvoices(
    page: number = 1,
    limit: number = 10,
    filters?: InvoiceFilters
  ): Promise<InvoiceListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    if (filters) {
      if (filters.status?.length) {
        params.append('status', filters.status.join(','));
      }
      if (filters.type?.length) {
        params.append('type', filters.type.join(','));
      }
      if (filters.patientId) {
        params.append('patientId', filters.patientId);
      }
      if (filters.doctorId) {
        params.append('doctorId', filters.doctorId);
      }
      if (filters.dateFrom) {
        params.append('dateFrom', filters.dateFrom);
      }
      if (filters.dateTo) {
        params.append('dateTo', filters.dateTo);
      }
      if (filters.amountMin !== undefined) {
        params.append('amountMin', filters.amountMin.toString());
      }
      if (filters.amountMax !== undefined) {
        params.append('amountMax', filters.amountMax.toString());
      }
      if (filters.search) {
        params.append('search', filters.search);
      }
    }

    const response = await api.get(`/billing/invoices?${params}`);
    return response.data;
  },

  // Buscar fatura por ID
  async getInvoice(id: string): Promise<Invoice> {
    const response = await api.get(`/billing/invoices/${id}`);
    return response.data;
  },

  // Criar nova fatura
  async createInvoice(data: CreateInvoiceRequest): Promise<Invoice> {
    const response = await api.post('/billing/invoices', data);
    return response.data;
  },

  // Atualizar fatura
  async updateInvoice(id: string, data: UpdateInvoiceRequest): Promise<Invoice> {
    const response = await api.put(`/billing/invoices/${id}`, data);
    return response.data;
  },

  // Deletar fatura
  async deleteInvoice(id: string): Promise<void> {
    await api.delete(`/billing/invoices/${id}`);
  },

  // Marcar fatura como paga
  async markInvoiceAsPaid(id: string, paymentData?: CreatePaymentRequest): Promise<Invoice> {
    const response = await api.post(`/billing/invoices/${id}/mark-paid`, paymentData);
    return response.data;
  },

  // Cancelar fatura
  async cancelInvoice(id: string, reason?: string): Promise<Invoice> {
    const response = await api.post(`/billing/invoices/${id}/cancel`, { reason });
    return response.data;
  },

  // Duplicar fatura
  async duplicateInvoice(id: string): Promise<Invoice> {
    const response = await api.post(`/billing/invoices/${id}/duplicate`);
    return response.data;
  },

  // Enviar fatura por email
  async sendInvoiceEmail(id: string, email?: string): Promise<void> {
    await api.post(`/billing/invoices/${id}/send-email`, { email });
  },

  // Gerar PDF da fatura
  async generateInvoicePDF(id: string, options?: InvoicePDFOptions): Promise<Blob> {
    const response = await api.post(`/billing/invoices/${id}/pdf`, options, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Ações em lote
  async bulkAction(action: BulkInvoiceAction): Promise<void> {
    await api.post('/billing/invoices/bulk-action', action);
  },

  // Buscar faturas por paciente
  async getInvoicesByPatient(patientId: string): Promise<Invoice[]> {
    const response = await api.get(`/billing/invoices/patient/${patientId}`);
    return response.data;
  },

  // Buscar faturas por agendamento
  async getInvoicesByAppointment(appointmentId: string): Promise<Invoice[]> {
    const response = await api.get(`/billing/invoices/appointment/${appointmentId}`);
    return response.data;
  }
};

// Serviços de Pagamentos
export const paymentService = {
  // Listar pagamentos com filtros e paginação
  async getPayments(
    page: number = 1,
    limit: number = 10,
    filters?: PaymentFilters
  ): Promise<PaymentListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    if (filters) {
      if (filters.status?.length) {
        params.append('status', filters.status.join(','));
      }
      if (filters.method?.length) {
        params.append('method', filters.method.join(','));
      }
      if (filters.patientId) {
        params.append('patientId', filters.patientId);
      }
      if (filters.dateFrom) {
        params.append('dateFrom', filters.dateFrom);
      }
      if (filters.dateTo) {
        params.append('dateTo', filters.dateTo);
      }
      if (filters.amountMin !== undefined) {
        params.append('amountMin', filters.amountMin.toString());
      }
      if (filters.amountMax !== undefined) {
        params.append('amountMax', filters.amountMax.toString());
      }
    }

    const response = await api.get(`/billing/payments?${params}`);
    return response.data;
  },

  // Buscar pagamento por ID
  async getPayment(id: string): Promise<Payment> {
    const response = await api.get(`/billing/payments/${id}`);
    return response.data;
  },

  // Criar novo pagamento
  async createPayment(data: CreatePaymentRequest): Promise<Payment> {
    const response = await api.post('/billing/payments', data);
    return response.data;
  },

  // Atualizar pagamento
  async updatePayment(id: string, data: Partial<CreatePaymentRequest>): Promise<Payment> {
    const response = await api.put(`/billing/payments/${id}`, data);
    return response.data;
  },

  // Deletar pagamento
  async deletePayment(id: string): Promise<void> {
    await api.delete(`/billing/payments/${id}`);
  },

  // Confirmar pagamento
  async confirmPayment(id: string): Promise<Payment> {
    const response = await api.post(`/billing/payments/${id}/confirm`);
    return response.data;
  },

  // Cancelar pagamento
  async cancelPayment(id: string, reason?: string): Promise<Payment> {
    const response = await api.post(`/billing/payments/${id}/cancel`, { reason });
    return response.data;
  },

  // Estornar pagamento
  async refundPayment(id: string, amount?: number, reason?: string): Promise<Payment> {
    const response = await api.post(`/billing/payments/${id}/refund`, { amount, reason });
    return response.data;
  },

  // Buscar pagamentos por fatura
  async getPaymentsByInvoice(invoiceId: string): Promise<Payment[]> {
    const response = await api.get(`/billing/payments/invoice/${invoiceId}`);
    return response.data;
  },

  // Buscar pagamentos por paciente
  async getPaymentsByPatient(patientId: string): Promise<Payment[]> {
    const response = await api.get(`/billing/payments/patient/${patientId}`);
    return response.data;
  },

  // Gerar recibo de pagamento
  async generatePaymentReceipt(id: string): Promise<Blob> {
    const response = await api.get(`/billing/payments/${id}/receipt`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

// Serviços de Planos de Pagamento
export const paymentPlanService = {
  // Listar planos de pagamento
  async getPaymentPlans(invoiceId?: string): Promise<PaymentPlan[]> {
    const url = invoiceId 
      ? `/billing/payment-plans?invoiceId=${invoiceId}`
      : '/billing/payment-plans';
    const response = await api.get(url);
    return response.data;
  },

  // Buscar plano de pagamento por ID
  async getPaymentPlan(id: string): Promise<PaymentPlan> {
    const response = await api.get(`/billing/payment-plans/${id}`);
    return response.data;
  },

  // Criar plano de pagamento
  async createPaymentPlan(data: CreatePaymentPlanRequest): Promise<PaymentPlan> {
    const response = await api.post('/billing/payment-plans', data);
    return response.data;
  },

  // Atualizar plano de pagamento
  async updatePaymentPlan(id: string, data: Partial<CreatePaymentPlanRequest>): Promise<PaymentPlan> {
    const response = await api.put(`/billing/payment-plans/${id}`, data);
    return response.data;
  },

  // Cancelar plano de pagamento
  async cancelPaymentPlan(id: string, reason?: string): Promise<PaymentPlan> {
    const response = await api.post(`/billing/payment-plans/${id}/cancel`, { reason });
    return response.data;
  },

  // Pagar parcela
  async payInstallment(planId: string, installmentId: string, paymentData: CreatePaymentRequest): Promise<Payment> {
    const response = await api.post(`/billing/payment-plans/${planId}/installments/${installmentId}/pay`, paymentData);
    return response.data;
  }
};

// Serviços de Estatísticas e Relatórios
export const billingStatsService = {
  // Buscar estatísticas gerais
  async getBillingStats(dateFrom?: string, dateTo?: string): Promise<BillingStatsResponse> {
    const params = new URLSearchParams();
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);

    const response = await api.get(`/billing/stats?${params}`);
    return response.data;
  },

  // Relatório de inadimplência
  async getOverdueReport(): Promise<OverdueReportResponse> {
    const response = await api.get('/billing/reports/overdue');
    return response.data;
  },

  // Relatório de receita por período
  async getRevenueReport(dateFrom: string, dateTo: string, groupBy: 'day' | 'week' | 'month' = 'month') {
    const params = new URLSearchParams({
      dateFrom,
      dateTo,
      groupBy
    });

    const response = await api.get(`/billing/reports/revenue?${params}`);
    return response.data;
  },

  // Relatório de métodos de pagamento
  async getPaymentMethodReport(dateFrom?: string, dateTo?: string) {
    const params = new URLSearchParams();
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);

    const response = await api.get(`/billing/reports/payment-methods?${params}`);
    return response.data;
  },

  // Relatório de performance de cobrança
  async getCollectionReport(dateFrom?: string, dateTo?: string) {
    const params = new URLSearchParams();
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);

    const response = await api.get(`/billing/reports/collection?${params}`);
    return response.data;
  },

  // Exportar relatório em Excel
  async exportReport(reportType: string, dateFrom?: string, dateTo?: string): Promise<Blob> {
    const params = new URLSearchParams({ reportType });
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);

    const response = await api.get(`/billing/reports/export?${params}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

// Serviços de Configurações
export const billingSettingsService = {
  // Buscar configurações
  async getSettings(): Promise<BillingSettings> {
    const response = await api.get('/billing/settings');
    return response.data;
  },

  // Atualizar configurações
  async updateSettings(settings: Partial<BillingSettings>): Promise<BillingSettings> {
    const response = await api.put('/billing/settings', settings);
    return response.data;
  },

  // Resetar configurações para padrão
  async resetSettings(): Promise<BillingSettings> {
    const response = await api.post('/billing/settings/reset');
    return response.data;
  }
};

// Serviços de Integração
export const billingIntegrationService = {
  // Criar fatura a partir de agendamento
  async createInvoiceFromAppointment(appointmentId: string, items?: any[]): Promise<Invoice> {
    const response = await api.post(`/billing/integrations/appointment/${appointmentId}/invoice`, { items });
    return response.data;
  },

  // Sincronizar com sistema externo
  async syncWithExternalSystem(systemType: string, data: any): Promise<any> {
    const response = await api.post(`/billing/integrations/${systemType}/sync`, data);
    return response.data;
  },

  // Importar faturas de arquivo
  async importInvoices(file: File, format: 'csv' | 'xlsx'): Promise<{ success: number; errors: any[] }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);

    const response = await api.post('/billing/integrations/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Exportar faturas para arquivo
  async exportInvoices(filters?: InvoiceFilters, format: 'csv' | 'xlsx' = 'xlsx'): Promise<Blob> {
    const params = new URLSearchParams({ format });
    
    if (filters) {
      if (filters.status?.length) {
        params.append('status', filters.status.join(','));
      }
      if (filters.type?.length) {
        params.append('type', filters.type.join(','));
      }
      if (filters.patientId) {
        params.append('patientId', filters.patientId);
      }
      if (filters.doctorId) {
        params.append('doctorId', filters.doctorId);
      }
      if (filters.dateFrom) {
        params.append('dateFrom', filters.dateFrom);
      }
      if (filters.dateTo) {
        params.append('dateTo', filters.dateTo);
      }
      if (filters.amountMin !== undefined) {
        params.append('amountMin', filters.amountMin.toString());
      }
      if (filters.amountMax !== undefined) {
        params.append('amountMax', filters.amountMax.toString());
      }
      if (filters.search) {
        params.append('search', filters.search);
      }
    }
    
    const response = await api.get(`/billing/integrations/export?${params}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

// Serviço principal que agrupa todos os outros
export const billingService = {
  invoices: invoiceService,
  payments: paymentService,
  paymentPlans: paymentPlanService,
  stats: billingStatsService,
  settings: billingSettingsService,
  integrations: billingIntegrationService
};

export default billingService;