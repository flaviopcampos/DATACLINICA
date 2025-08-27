import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { billingService } from '@/services/billingService';
import type {
  Invoice,
  Payment,
  PaymentPlan,
  BillingStats,
  OverdueReport,
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

// Query Keys
export const billingKeys = {
  all: ['billing'] as const,
  invoices: () => [...billingKeys.all, 'invoices'] as const,
  invoice: (id: string) => [...billingKeys.invoices(), id] as const,
  invoicesByPatient: (patientId: string) => [...billingKeys.invoices(), 'patient', patientId] as const,
  invoicesByAppointment: (appointmentId: string) => [...billingKeys.invoices(), 'appointment', appointmentId] as const,
  payments: () => [...billingKeys.all, 'payments'] as const,
  payment: (id: string) => [...billingKeys.payments(), id] as const,
  paymentsByInvoice: (invoiceId: string) => [...billingKeys.payments(), 'invoice', invoiceId] as const,
  paymentsByPatient: (patientId: string) => [...billingKeys.payments(), 'patient', patientId] as const,
  paymentPlans: () => [...billingKeys.all, 'payment-plans'] as const,
  paymentPlan: (id: string) => [...billingKeys.paymentPlans(), id] as const,
  stats: () => [...billingKeys.all, 'stats'] as const,
  overdueReport: () => [...billingKeys.all, 'overdue-report'] as const,
  settings: () => [...billingKeys.all, 'settings'] as const
};

// Hook para estatísticas de faturamento
export function useBillingStats(dateFrom?: string, dateTo?: string) {
  return useQuery({
    queryKey: [...billingKeys.stats(), dateFrom, dateTo],
    queryFn: () => billingService.stats.getBillingStats(dateFrom, dateTo),
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false
  });
}

// Hook para relatório de inadimplência
export function useOverdueReport() {
  return useQuery({
    queryKey: billingKeys.overdueReport(),
    queryFn: () => billingService.stats.getOverdueReport(),
    staleTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false
  });
}

// Hook para configurações de faturamento
export function useBillingSettings() {
  return useQuery({
    queryKey: billingKeys.settings(),
    queryFn: () => billingService.settings.getSettings(),
    staleTime: 30 * 60 * 1000 // 30 minutos
  });
}

// Hook para atualizar configurações
export function useUpdateBillingSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: Partial<BillingSettings>) => 
      billingService.settings.updateSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.settings() });
      toast.success('Configurações atualizadas com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar configurações');
    }
  });
}

// Hook para exportar relatórios
export function useExportReport() {
  return useMutation({
    mutationFn: ({ reportType, dateFrom, dateTo }: {
      reportType: string;
      dateFrom?: string;
      dateTo?: string;
    }) => billingService.stats.exportReport(reportType, dateFrom, dateTo),
    onSuccess: (blob, variables) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-${variables.reportType}-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Relatório exportado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao exportar relatório');
    }
  });
}

// Hook para criar fatura a partir de agendamento
export function useCreateInvoiceFromAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appointmentId, items }: { appointmentId: string; items?: any[] }) =>
      billingService.integrations.createInvoiceFromAppointment(appointmentId, items),
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.invoices() });
      queryClient.invalidateQueries({ queryKey: billingKeys.stats() });
      toast.success(`Fatura ${invoice.invoiceNumber} criada com sucesso!`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar fatura');
    }
  });
}

// Hook para importar faturas
export function useImportInvoices() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, format }: { file: File; format: 'csv' | 'xlsx' }) =>
      billingService.integrations.importInvoices(file, format),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.invoices() });
      queryClient.invalidateQueries({ queryKey: billingKeys.stats() });
      toast.success(`${result.success} faturas importadas com sucesso!`);
      if (result.errors.length > 0) {
        toast.warning(`${result.errors.length} erros encontrados durante a importação`);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao importar faturas');
    }
  });
}

// Hook para exportar faturas
export function useExportInvoices() {
  return useMutation({
    mutationFn: ({ filters, format }: { filters?: InvoiceFilters; format?: 'csv' | 'xlsx' }) =>
      billingService.integrations.exportInvoices(filters, format),
    onSuccess: (blob, variables) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `faturas-${new Date().toISOString().split('T')[0]}.${variables.format || 'xlsx'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Faturas exportadas com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao exportar faturas');
    }
  });
}

// Hook consolidado para gerenciamento de faturamento
export function useBillingManagement() {
  const updateSettings = useUpdateBillingSettings();
  const exportReport = useExportReport();
  const createFromAppointment = useCreateInvoiceFromAppointment();
  const importInvoices = useImportInvoices();
  const exportInvoices = useExportInvoices();

  return {
    // Configurações
    updateSettings: updateSettings.mutate,
    isUpdatingSettings: updateSettings.isPending,

    // Relatórios
    exportReport: exportReport.mutate,
    isExportingReport: exportReport.isPending,

    // Integração com agendamentos
    createInvoiceFromAppointment: createFromAppointment.mutate,
    isCreatingFromAppointment: createFromAppointment.isPending,

    // Importação/Exportação
    importInvoices: importInvoices.mutate,
    isImportingInvoices: importInvoices.isPending,
    exportInvoices: exportInvoices.mutate,
    isExportingInvoices: exportInvoices.isPending
  };
}

// Hook para utilitários de faturamento
export function useBillingUtils() {
  const queryClient = useQueryClient();

  const refreshBillingData = () => {
    queryClient.invalidateQueries({ queryKey: billingKeys.all });
  };

  const refreshInvoices = () => {
    queryClient.invalidateQueries({ queryKey: billingKeys.invoices() });
  };

  const refreshPayments = () => {
    queryClient.invalidateQueries({ queryKey: billingKeys.payments() });
  };

  const refreshStats = () => {
    queryClient.invalidateQueries({ queryKey: billingKeys.stats() });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const calculateDaysOverdue = (dueDate: string): number => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getStatusColor = (status: string): string => {
    const colors = {
      draft: 'gray',
      pending: 'yellow',
      paid: 'green',
      overdue: 'red',
      cancelled: 'gray',
      partially_paid: 'blue'
    };
    return colors[status as keyof typeof colors] || 'gray';
  };

  const getPaymentMethodLabel = (method: string): string => {
    const labels = {
      cash: 'Dinheiro',
      credit_card: 'Cartão de Crédito',
      debit_card: 'Cartão de Débito',
      pix: 'PIX',
      bank_transfer: 'Transferência Bancária',
      check: 'Cheque',
      insurance: 'Convênio'
    };
    return labels[method as keyof typeof labels] || method;
  };

  return {
    refreshBillingData,
    refreshInvoices,
    refreshPayments,
    refreshStats,
    formatCurrency,
    formatDate,
    calculateDaysOverdue,
    getStatusColor,
    getPaymentMethodLabel
  };
}

export default {
  useBillingStats,
  useOverdueReport,
  useBillingSettings,
  useUpdateBillingSettings,
  useExportReport,
  useCreateInvoiceFromAppointment,
  useImportInvoices,
  useExportInvoices,
  useBillingManagement,
  useBillingUtils
};