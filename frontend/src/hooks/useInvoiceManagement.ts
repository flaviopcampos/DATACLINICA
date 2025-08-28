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

// Hook principal para gerenciamento de faturas
export function useInvoiceManagement() {
  const queryClient = useQueryClient();

  // Buscar faturas com filtros
  const getInvoices = (page: number = 1, limit: number = 10, filters?: InvoiceFilters) => {
    return useQuery({
      queryKey: [...billingKeys.invoices(), 'list', page, limit, filters],
      queryFn: () => billingService.invoices.getInvoices(page, limit, filters),
      staleTime: 2 * 60 * 1000, // 2 minutos
      refetchOnWindowFocus: false
    });
  };

  // Criar nova fatura
  const createInvoice = useMutation({
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

  // Atualizar fatura existente
  const updateInvoice = useMutation({
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

  // Deletar fatura
  const deleteInvoice = useMutation({
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

  // Marcar fatura como paga
  const markAsPaid = useMutation({
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

  // Cancelar fatura
  const cancelInvoice = useMutation({
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

  // Gerar PDF da fatura
  const generatePDF = useMutation({
    mutationFn: ({ id, options }: { id: string; options?: InvoicePDFOptions }) =>
      billingService.invoices.generateInvoicePDF(id, options),
    onSuccess: () => {
      toast.success('PDF da fatura gerado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao gerar PDF da fatura');
    }
  });

  // Enviar fatura por email
  const sendEmail = useMutation({
    mutationFn: ({ id, email, message }: { id: string; email: string; message?: string }) =>
      billingService.invoices.sendInvoiceEmail(id, email, message),
    onSuccess: () => {
      toast.success('Fatura enviada por email com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao enviar fatura por email');
    }
  });

  // Ações em lote
  const bulkAction = useMutation({
    mutationFn: ({ action, invoiceIds }: { action: BulkInvoiceAction; invoiceIds: string[] }) =>
      billingService.invoices.bulkInvoiceAction(action, invoiceIds),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.invoices() });
      queryClient.invalidateQueries({ queryKey: billingKeys.stats() });
      toast.success(`Ação em lote executada com sucesso! ${result.processed} faturas processadas.`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao executar ação em lote');
    }
  });

  return {
    // Queries
    getInvoices,
    
    // Mutations
    createInvoice,
    updateInvoice,
    deleteInvoice,
    markAsPaid,
    cancelInvoice,
    generatePDF,
    sendEmail,
    bulkAction,
    
    // Loading states
    isCreating: createInvoice.isPending,
    isUpdating: updateInvoice.isPending,
    isDeleting: deleteInvoice.isPending,
    isMarkingAsPaid: markAsPaid.isPending,
    isCanceling: cancelInvoice.isPending,
    isGeneratingPDF: generatePDF.isPending,
    isSendingEmail: sendEmail.isPending,
    isBulkProcessing: bulkAction.isPending
  };
}

export default useInvoiceManagement;