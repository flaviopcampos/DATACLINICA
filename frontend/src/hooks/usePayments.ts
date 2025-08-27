import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { billingService } from '@/services/billingService';
import { billingKeys } from './useBilling';
import type {
  Payment,
  CreatePaymentRequest,
  UpdatePaymentRequest,
  PaymentFilters
} from '@/types/billing';

// Hook para listar pagamentos com filtros e paginação
export function usePayments(
  page: number = 1,
  limit: number = 10,
  filters?: PaymentFilters
) {
  return useQuery({
    queryKey: [...billingKeys.payments(), 'list', page, limit, filters],
    queryFn: () => billingService.payments.getPayments(page, limit, filters),
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchOnWindowFocus: false
  });
}

// Hook para buscar pagamento por ID
export function usePayment(id: string) {
  return useQuery({
    queryKey: billingKeys.payment(id),
    queryFn: () => billingService.payments.getPayment(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000 // 5 minutos
  });
}

// Hook para buscar pagamentos por fatura
export function usePaymentsByInvoice(invoiceId: string) {
  return useQuery({
    queryKey: billingKeys.paymentsByInvoice(invoiceId),
    queryFn: () => billingService.payments.getPaymentsByInvoice(invoiceId),
    enabled: !!invoiceId,
    staleTime: 5 * 60 * 1000
  });
}

// Hook para buscar pagamentos por paciente
export function usePaymentsByPatient(patientId: string) {
  return useQuery({
    queryKey: billingKeys.paymentsByPatient(patientId),
    queryFn: () => billingService.payments.getPaymentsByPatient(patientId),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000
  });
}

// Hook para criar pagamento
export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePaymentRequest) => billingService.payments.createPayment(data),
    onSuccess: (payment) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.payments() });
      queryClient.invalidateQueries({ queryKey: billingKeys.stats() });
      if (payment.invoiceId) {
        queryClient.invalidateQueries({ 
          queryKey: billingKeys.paymentsByInvoice(payment.invoiceId) 
        });
        queryClient.invalidateQueries({ 
          queryKey: billingKeys.invoice(payment.invoiceId) 
        });
      }
      if (payment.patientId) {
        queryClient.invalidateQueries({ 
          queryKey: billingKeys.paymentsByPatient(payment.patientId) 
        });
      }
      toast.success(`Pagamento de ${payment.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} registrado com sucesso!`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao registrar pagamento');
    }
  });
}

// Hook para atualizar pagamento
export function useUpdatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePaymentRequest }) =>
      billingService.payments.updatePayment(id, data),
    onSuccess: (payment) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.payments() });
      queryClient.invalidateQueries({ queryKey: billingKeys.payment(payment.id) });
      queryClient.invalidateQueries({ queryKey: billingKeys.stats() });
      if (payment.invoiceId) {
        queryClient.invalidateQueries({ 
          queryKey: billingKeys.paymentsByInvoice(payment.invoiceId) 
        });
        queryClient.invalidateQueries({ 
          queryKey: billingKeys.invoice(payment.invoiceId) 
        });
      }
      if (payment.patientId) {
        queryClient.invalidateQueries({ 
          queryKey: billingKeys.paymentsByPatient(payment.patientId) 
        });
      }
      toast.success('Pagamento atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar pagamento');
    }
  });
}

// Hook para deletar pagamento
export function useDeletePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => billingService.payments.deletePayment(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.payments() });
      queryClient.removeQueries({ queryKey: billingKeys.payment(id) });
      queryClient.invalidateQueries({ queryKey: billingKeys.stats() });
      toast.success('Pagamento excluído com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao excluir pagamento');
    }
  });
}

// Hook para confirmar pagamento
export function useConfirmPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => billingService.payments.confirmPayment(id),
    onSuccess: (payment) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.payments() });
      queryClient.invalidateQueries({ queryKey: billingKeys.payment(payment.id) });
      queryClient.invalidateQueries({ queryKey: billingKeys.stats() });
      if (payment.invoiceId) {
        queryClient.invalidateQueries({ 
          queryKey: billingKeys.paymentsByInvoice(payment.invoiceId) 
        });
        queryClient.invalidateQueries({ 
          queryKey: billingKeys.invoice(payment.invoiceId) 
        });
      }
      toast.success('Pagamento confirmado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao confirmar pagamento');
    }
  });
}

// Hook para cancelar pagamento
export function useCancelPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      billingService.payments.cancelPayment(id, reason),
    onSuccess: (payment) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.payments() });
      queryClient.invalidateQueries({ queryKey: billingKeys.payment(payment.id) });
      queryClient.invalidateQueries({ queryKey: billingKeys.stats() });
      if (payment.invoiceId) {
        queryClient.invalidateQueries({ 
          queryKey: billingKeys.paymentsByInvoice(payment.invoiceId) 
        });
        queryClient.invalidateQueries({ 
          queryKey: billingKeys.invoice(payment.invoiceId) 
        });
      }
      toast.success('Pagamento cancelado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao cancelar pagamento');
    }
  });
}

// Hook para estornar pagamento
export function useRefundPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, amount, reason }: { id: string; amount?: number; reason?: string }) =>
      billingService.payments.refundPayment(id, amount, reason),
    onSuccess: (payment) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.payments() });
      queryClient.invalidateQueries({ queryKey: billingKeys.payment(payment.id) });
      queryClient.invalidateQueries({ queryKey: billingKeys.stats() });
      if (payment.invoiceId) {
        queryClient.invalidateQueries({ 
          queryKey: billingKeys.paymentsByInvoice(payment.invoiceId) 
        });
        queryClient.invalidateQueries({ 
          queryKey: billingKeys.invoice(payment.invoiceId) 
        });
      }
      toast.success('Estorno processado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao processar estorno');
    }
  });
}

// Hook para gerar recibo de pagamento
export function useGeneratePaymentReceipt() {
  return useMutation({
    mutationFn: (id: string) => billingService.payments.generateReceipt(id),
    onSuccess: (blob, id) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `recibo-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Recibo gerado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao gerar recibo');
    }
  });
}

// Hook consolidado para gerenciamento de pagamentos
export function usePaymentManagement() {
  const createPayment = useCreatePayment();
  const updatePayment = useUpdatePayment();
  const deletePayment = useDeletePayment();
  const confirmPayment = useConfirmPayment();
  const cancelPayment = useCancelPayment();
  const refundPayment = useRefundPayment();
  const generateReceipt = useGeneratePaymentReceipt();

  return {
    // CRUD Operations
    createPayment: createPayment.mutate,
    isCreatingPayment: createPayment.isPending,
    
    updatePayment: updatePayment.mutate,
    isUpdatingPayment: updatePayment.isPending,
    
    deletePayment: deletePayment.mutate,
    isDeletingPayment: deletePayment.isPending,

    // Status Operations
    confirmPayment: confirmPayment.mutate,
    isConfirmingPayment: confirmPayment.isPending,
    
    cancelPayment: cancelPayment.mutate,
    isCancellingPayment: cancelPayment.isPending,
    
    refundPayment: refundPayment.mutate,
    isRefundingPayment: refundPayment.isPending,

    // Utility Operations
    generatePaymentReceipt: generateReceipt.mutate,
    isGeneratingReceipt: generateReceipt.isPending
  };
}

// Hook para utilitários de pagamentos
export function usePaymentUtils() {
  const queryClient = useQueryClient();

  const refreshPayment = (id: string) => {
    queryClient.invalidateQueries({ queryKey: billingKeys.payment(id) });
  };

  const refreshPaymentsList = () => {
    queryClient.invalidateQueries({ queryKey: billingKeys.payments() });
  };

  const getPaymentFromCache = (id: string): Payment | undefined => {
    return queryClient.getQueryData(billingKeys.payment(id));
  };

  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatPaymentDate = (date: string): string => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getPaymentStatusLabel = (status: string): string => {
    const labels = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      cancelled: 'Cancelado',
      refunded: 'Estornado',
      failed: 'Falhou'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getPaymentStatusColor = (status: string): string => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-50',
      confirmed: 'text-green-600 bg-green-50',
      cancelled: 'text-red-600 bg-red-50',
      refunded: 'text-purple-600 bg-purple-50',
      failed: 'text-red-600 bg-red-50'
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-50';
  };

  const getPaymentMethodLabel = (method: string): string => {
    const labels = {
      cash: 'Dinheiro',
      credit_card: 'Cartão de Crédito',
      debit_card: 'Cartão de Débito',
      bank_transfer: 'Transferência Bancária',
      pix: 'PIX',
      check: 'Cheque',
      insurance: 'Convênio',
      installment: 'Parcelado'
    };
    return labels[method as keyof typeof labels] || method;
  };

  const calculateTotalPaid = (payments: Payment[]): number => {
    return payments
      .filter(payment => payment.status === 'confirmed')
      .reduce((total, payment) => total + payment.amount, 0);
  };

  const calculatePendingAmount = (payments: Payment[]): number => {
    return payments
      .filter(payment => payment.status === 'pending')
      .reduce((total, payment) => total + payment.amount, 0);
  };

  const isPaymentOverdue = (payment: Payment): boolean => {
    if (payment.status === 'confirmed' || payment.status === 'cancelled') {
      return false;
    }
    return payment.dueDate ? new Date(payment.dueDate) < new Date() : false;
  };

  const generatePaymentReference = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const timestamp = now.getTime().toString().slice(-4);
    return `PAG-${year}${month}${day}-${timestamp}`;
  };

  return {
    refreshPayment,
    refreshPaymentsList,
    getPaymentFromCache,
    formatCurrency,
    formatPaymentDate,
    getPaymentStatusLabel,
    getPaymentStatusColor,
    getPaymentMethodLabel,
    calculateTotalPaid,
    calculatePendingAmount,
    isPaymentOverdue,
    generatePaymentReference
  };
}

export default {
  usePayments,
  usePayment,
  usePaymentsByInvoice,
  usePaymentsByPatient,
  useCreatePayment,
  useUpdatePayment,
  useDeletePayment,
  useConfirmPayment,
  useCancelPayment,
  useRefundPayment,
  useGeneratePaymentReceipt,
  usePaymentManagement,
  usePaymentUtils
};