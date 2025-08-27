import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { billingService } from '@/services/billingService';
import { billingKeys } from './useBilling';
import type {
  Invoice,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  InvoiceFilters,
  BulkInvoiceAction,
  InvoicePDFOptions
} from '@/types/billing';

// Hook para listar faturas com filtros e paginação
export function useInvoices(
  page: number = 1,
  limit: number = 10,
  filters?: InvoiceFilters
) {
  return useQuery({
    queryKey: [...billingKeys.invoices(), 'list', page, limit, filters],
    queryFn: () => billingService.invoices.getInvoices(page, limit, filters),
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchOnWindowFocus: false
  });
}

// Hook para buscar fatura por ID
export function useInvoice(id: string) {
  return useQuery({
    queryKey: billingKeys.invoice(id),
    queryFn: () => billingService.invoices.getInvoice(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000 // 5 minutos
  });
}

// Hook para buscar faturas por paciente
export function useInvoicesByPatient(patientId: string) {
  return useQuery({
    queryKey: billingKeys.invoicesByPatient(patientId),
    queryFn: () => billingService.invoices.getInvoicesByPatient(patientId),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000
  });
}

// Hook para buscar faturas por agendamento
export function useInvoicesByAppointment(appointmentId: string) {
  return useQuery({
    queryKey: billingKeys.invoicesByAppointment(appointmentId),
    queryFn: () => billingService.invoices.getInvoicesByAppointment(appointmentId),
    enabled: !!appointmentId,
    staleTime: 5 * 60 * 1000
  });
}

// Hook para criar fatura
export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInvoiceRequest) => billingService.invoices.createInvoice(data),
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.invoices() });
      queryClient.invalidateQueries({ queryKey: billingKeys.stats() });
      if (invoice.patientId) {
        queryClient.invalidateQueries({ 
          queryKey: billingKeys.invoicesByPatient(invoice.patientId) 
        });
      }
      if (invoice.appointmentId) {
        queryClient.invalidateQueries({ 
          queryKey: billingKeys.invoicesByAppointment(invoice.appointmentId) 
        });
      }
      toast.success(`Fatura ${invoice.invoiceNumber} criada com sucesso!`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar fatura');
    }
  });
}

// Hook para atualizar fatura
export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInvoiceRequest }) =>
      billingService.invoices.updateInvoice(id, data),
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.invoices() });
      queryClient.invalidateQueries({ queryKey: billingKeys.invoice(invoice.id) });
      queryClient.invalidateQueries({ queryKey: billingKeys.stats() });
      if (invoice.patientId) {
        queryClient.invalidateQueries({ 
          queryKey: billingKeys.invoicesByPatient(invoice.patientId) 
        });
      }
      toast.success(`Fatura ${invoice.invoiceNumber} atualizada com sucesso!`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar fatura');
    }
  });
}

// Hook para deletar fatura
export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => billingService.invoices.deleteInvoice(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.invoices() });
      queryClient.removeQueries({ queryKey: billingKeys.invoice(id) });
      queryClient.invalidateQueries({ queryKey: billingKeys.stats() });
      toast.success('Fatura excluída com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao excluir fatura');
    }
  });
}

// Hook para marcar fatura como paga
export function useMarkInvoiceAsPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, paymentData }: { id: string; paymentData?: any }) =>
      billingService.invoices.markInvoiceAsPaid(id, paymentData),
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.invoices() });
      queryClient.invalidateQueries({ queryKey: billingKeys.invoice(invoice.id) });
      queryClient.invalidateQueries({ queryKey: billingKeys.payments() });
      queryClient.invalidateQueries({ queryKey: billingKeys.stats() });
      if (invoice.patientId) {
        queryClient.invalidateQueries({ 
          queryKey: billingKeys.invoicesByPatient(invoice.patientId) 
        });
      }
      toast.success(`Fatura ${invoice.invoiceNumber} marcada como paga!`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao marcar fatura como paga');
    }
  });
}

// Hook para cancelar fatura
export function useCancelInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      billingService.invoices.cancelInvoice(id, reason),
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.invoices() });
      queryClient.invalidateQueries({ queryKey: billingKeys.invoice(invoice.id) });
      queryClient.invalidateQueries({ queryKey: billingKeys.stats() });
      if (invoice.patientId) {
        queryClient.invalidateQueries({ 
          queryKey: billingKeys.invoicesByPatient(invoice.patientId) 
        });
      }
      toast.success(`Fatura ${invoice.invoiceNumber} cancelada com sucesso!`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao cancelar fatura');
    }
  });
}

// Hook para duplicar fatura
export function useDuplicateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => billingService.invoices.duplicateInvoice(id),
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.invoices() });
      queryClient.invalidateQueries({ queryKey: billingKeys.stats() });
      if (invoice.patientId) {
        queryClient.invalidateQueries({ 
          queryKey: billingKeys.invoicesByPatient(invoice.patientId) 
        });
      }
      toast.success(`Fatura ${invoice.invoiceNumber} duplicada com sucesso!`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao duplicar fatura');
    }
  });
}

// Hook para enviar fatura por email
export function useSendInvoiceEmail() {
  return useMutation({
    mutationFn: ({ id, email }: { id: string; email?: string }) =>
      billingService.invoices.sendInvoiceEmail(id, email),
    onSuccess: () => {
      toast.success('Fatura enviada por email com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao enviar fatura por email');
    }
  });
}

// Hook para gerar PDF da fatura
export function useGenerateInvoicePDF() {
  return useMutation({
    mutationFn: ({ id, options }: { id: string; options?: InvoicePDFOptions }) =>
      billingService.invoices.generateInvoicePDF(id, options),
    onSuccess: (blob, variables) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fatura-${variables.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('PDF da fatura gerado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao gerar PDF da fatura');
    }
  });
}

// Hook para ações em lote
export function useBulkInvoiceAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (action: BulkInvoiceAction) => billingService.invoices.bulkAction(action),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.invoices() });
      queryClient.invalidateQueries({ queryKey: billingKeys.stats() });
      
      const actionLabels = {
        mark_paid: 'marcadas como pagas',
        mark_overdue: 'marcadas como vencidas',
        send_reminder: 'enviadas por email',
        cancel: 'canceladas'
      };
      
      const label = actionLabels[variables.action] || 'processadas';
      toast.success(`${variables.invoiceIds.length} faturas ${label} com sucesso!`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao executar ação em lote');
    }
  });
}

// Hook consolidado para gerenciamento de faturas
export function useInvoiceManagement() {
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const deleteInvoice = useDeleteInvoice();
  const markAsPaid = useMarkInvoiceAsPaid();
  const cancelInvoice = useCancelInvoice();
  const duplicateInvoice = useDuplicateInvoice();
  const sendEmail = useSendInvoiceEmail();
  const generatePDF = useGenerateInvoicePDF();
  const bulkAction = useBulkInvoiceAction();

  return {
    // CRUD Operations
    createInvoice: createInvoice.mutate,
    isCreatingInvoice: createInvoice.isPending,
    
    updateInvoice: updateInvoice.mutate,
    isUpdatingInvoice: updateInvoice.isPending,
    
    deleteInvoice: deleteInvoice.mutate,
    isDeletingInvoice: deleteInvoice.isPending,

    // Status Operations
    markInvoiceAsPaid: markAsPaid.mutate,
    isMarkingAsPaid: markAsPaid.isPending,
    
    cancelInvoice: cancelInvoice.mutate,
    isCancellingInvoice: cancelInvoice.isPending,

    // Utility Operations
    duplicateInvoice: duplicateInvoice.mutate,
    isDuplicatingInvoice: duplicateInvoice.isPending,
    
    sendInvoiceEmail: sendEmail.mutate,
    isSendingEmail: sendEmail.isPending,
    
    generateInvoicePDF: generatePDF.mutate,
    isGeneratingPDF: generatePDF.isPending,

    // Bulk Operations
    executeBulkAction: bulkAction.mutate,
    isExecutingBulkAction: bulkAction.isPending
  };
}

// Hook para utilitários de faturas
export function useInvoiceUtils() {
  const queryClient = useQueryClient();

  const refreshInvoice = (id: string) => {
    queryClient.invalidateQueries({ queryKey: billingKeys.invoice(id) });
  };

  const refreshInvoicesList = () => {
    queryClient.invalidateQueries({ queryKey: billingKeys.invoices() });
  };

  const getInvoiceFromCache = (id: string): Invoice | undefined => {
    return queryClient.getQueryData(billingKeys.invoice(id));
  };

  const calculateInvoiceTotal = (items: any[]): number => {
    return items.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
  };

  const calculateDiscountedTotal = (subtotal: number, discountPercentage: number, discountAmount: number): number => {
    const percentageDiscount = subtotal * (discountPercentage / 100);
    return subtotal - percentageDiscount - discountAmount;
  };

  const isInvoiceOverdue = (invoice: Invoice): boolean => {
    if (invoice.status === 'paid' || invoice.status === 'cancelled') {
      return false;
    }
    return new Date(invoice.dueDate) < new Date();
  };

  const getInvoiceStatusLabel = (status: string): string => {
    const labels = {
      draft: 'Rascunho',
      pending: 'Pendente',
      paid: 'Pago',
      overdue: 'Vencido',
      cancelled: 'Cancelado',
      partially_paid: 'Parcialmente Pago'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getInvoiceTypeLabel = (type: string): string => {
    const labels = {
      consultation: 'Consulta',
      procedure: 'Procedimento',
      hospitalization: 'Internação',
      medication: 'Medicamento',
      exam: 'Exame',
      other: 'Outros'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const generateInvoiceNumber = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const timestamp = now.getTime().toString().slice(-6);
    return `FAT-${year}${month}-${timestamp}`;
  };

  return {
    refreshInvoice,
    refreshInvoicesList,
    getInvoiceFromCache,
    calculateInvoiceTotal,
    calculateDiscountedTotal,
    isInvoiceOverdue,
    getInvoiceStatusLabel,
    getInvoiceTypeLabel,
    generateInvoiceNumber
  };
}

export default {
  useInvoices,
  useInvoice,
  useInvoicesByPatient,
  useInvoicesByAppointment,
  useCreateInvoice,
  useUpdateInvoice,
  useDeleteInvoice,
  useMarkInvoiceAsPaid,
  useCancelInvoice,
  useDuplicateInvoice,
  useSendInvoiceEmail,
  useGenerateInvoicePDF,
  useBulkInvoiceAction,
  useInvoiceManagement,
  useInvoiceUtils
};