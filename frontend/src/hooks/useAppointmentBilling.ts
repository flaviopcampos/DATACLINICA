import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useInvoiceManagement } from './useInvoices';
import { AppointmentsService } from '@/services/appointmentsService';
import type { Appointment } from '@/types/appointments';
import type { Invoice, InvoiceCreate, InvoiceItem } from '@/types/billing';

// Hook para integração entre agendamentos e faturamento
export function useAppointmentBilling() {
  const queryClient = useQueryClient();
  const { createInvoice } = useInvoiceManagement();

  // Query para buscar agendamentos não faturados
  const {
    data: unbilledAppointments = [],
    isLoading: isLoadingUnbilled,
    refetch: refetchUnbilled
  } = useQuery({
    queryKey: ['appointments', 'unbilled'],
    queryFn: () => AppointmentsService.getUnbilledAppointments(),
    staleTime: 5 * 60 * 1000,
  });

  // Query para buscar agendamentos faturados
  const {
    data: billedAppointments = [],
    isLoading: isLoadingBilled,
    refetch: refetchBilled
  } = useQuery({
    queryKey: ['appointments', 'billed'],
    queryFn: () => AppointmentsService.getBilledAppointments(),
    staleTime: 5 * 60 * 1000,
  });

  // Mutation para gerar fatura a partir de agendamento
  const generateInvoiceFromAppointmentMutation = useMutation({
    mutationFn: async (appointment: Appointment) => {
      // Criar dados da fatura baseados no agendamento
      const invoiceData: InvoiceCreate = {
        patient_id: appointment.patient_id,
        doctor_id: appointment.doctor_id,
        appointment_id: appointment.id,
        invoice_type: 'consulta',
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 dias
        items: [
          {
            description: `${appointment.appointment_type || 'Consulta'} - ${appointment.doctor?.name}`,
            quantity: 1,
            unit_price: appointment.price || appointment.procedure?.price || 0,
            total: appointment.price || appointment.procedure?.price || 0,
            procedure_id: appointment.procedure_id,
          } as InvoiceItem
        ],
        subtotal: appointment.price || appointment.procedure?.price || 0,
        total_amount: appointment.price || appointment.procedure?.price || 0,
        notes: `Fatura gerada automaticamente para agendamento #${appointment.appointment_number}`,
        payment_terms: 'À vista ou parcelado conforme acordo',
      };

      // Criar a fatura
      const invoice = await createInvoice(invoiceData);
      
      // Atualizar o agendamento para marcar como faturado
      await AppointmentsService.markAsBilled(appointment.id.toString(), invoice.id);
      
      return { invoice, appointment };
    },
    onSuccess: ({ invoice, appointment }) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', 'unbilled'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', 'billed'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success(`Fatura #${invoice.invoice_number} gerada para agendamento #${appointment.appointment_number}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao gerar fatura do agendamento');
    }
  });

  // Mutation para gerar faturas em lote
  const generateBulkInvoicesMutation = useMutation({
    mutationFn: async (appointments: Appointment[]) => {
      const results = [];
      
      for (const appointment of appointments) {
        try {
          const invoiceData: InvoiceCreate = {
            patient_id: appointment.patient_id,
            doctor_id: appointment.doctor_id,
            appointment_id: appointment.id,
            invoice_type: 'consulta',
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            items: [
              {
                description: `${appointment.appointment_type || 'Consulta'} - ${appointment.doctor?.name}`,
                quantity: 1,
                unit_price: appointment.price || appointment.procedure?.price || 0,
                total: appointment.price || appointment.procedure?.price || 0,
                procedure_id: appointment.procedure_id,
              } as InvoiceItem
            ],
            subtotal: appointment.price || appointment.procedure?.price || 0,
            total_amount: appointment.price || appointment.procedure?.price || 0,
            notes: `Fatura gerada automaticamente para agendamento #${appointment.appointment_number}`,
            payment_terms: 'À vista ou parcelado conforme acordo',
          };

          const invoice = await createInvoice(invoiceData);
          await AppointmentsService.markAsBilled(appointment.id.toString(), invoice.id);
          
          results.push({ success: true, appointment, invoice });
        } catch (error) {
          results.push({ success: false, appointment, error });
        }
      }
      
      return results;
    },
    onSuccess: (results) => {
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', 'unbilled'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', 'billed'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      
      if (failed === 0) {
        toast.success(`${successful} faturas geradas com sucesso!`);
      } else {
        toast.warning(`${successful} faturas geradas, ${failed} falharam`);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao gerar faturas em lote');
    }
  });

  // Mutation para marcar agendamento como não faturável
  const markAsNonBillableMutation = useMutation({
    mutationFn: ({ appointmentId, reason }: { appointmentId: string; reason: string }) => 
      AppointmentsService.markAsNonBillable(appointmentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', 'unbilled'] });
      toast.success('Agendamento marcado como não faturável');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao marcar como não faturável');
    }
  });

  // Query para estatísticas de faturamento de agendamentos
  const {
    data: billingStats,
    isLoading: isLoadingStats
  } = useQuery({
    queryKey: ['appointment-billing-stats'],
    queryFn: () => AppointmentsService.getBillingStats(),
    staleTime: 10 * 60 * 1000,
  });

  // Função para verificar se um agendamento pode ser faturado
  const canBeBilled = (appointment: Appointment): boolean => {
    return (
      appointment.status === 'concluido' &&
      appointment.payment_status !== 'paid' &&
      (appointment.price || appointment.procedure?.price) &&
      (appointment.price || appointment.procedure?.price) > 0
    );
  };

  // Função para calcular valor total dos agendamentos não faturados
  const calculateUnbilledTotal = (): number => {
    return unbilledAppointments.reduce((total, appointment) => {
      const value = appointment.price || appointment.procedure?.price || 0;
      return total + value;
    }, 0);
  };

  return {
    // Data
    unbilledAppointments,
    billedAppointments,
    billingStats,
    
    // Loading states
    isLoadingUnbilled,
    isLoadingBilled,
    isLoadingStats,
    isGeneratingInvoice: generateInvoiceFromAppointmentMutation.isPending,
    isGeneratingBulk: generateBulkInvoicesMutation.isPending,
    isMarkingNonBillable: markAsNonBillableMutation.isPending,
    
    // Actions
    generateInvoiceFromAppointment: generateInvoiceFromAppointmentMutation.mutate,
    generateBulkInvoices: generateBulkInvoicesMutation.mutate,
    markAsNonBillable: markAsNonBillableMutation.mutate,
    refetchUnbilled,
    refetchBilled,
    
    // Utilities
    canBeBilled,
    calculateUnbilledTotal,
  };
}

// Hook para buscar fatura de um agendamento específico
export function useAppointmentInvoice(appointmentId: number) {
  return useQuery({
    queryKey: ['appointment-invoice', appointmentId],
    queryFn: () => AppointmentsService.getAppointmentInvoice(appointmentId),
    enabled: !!appointmentId,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para histórico de faturamento de um paciente
export function usePatientBillingHistory(patientId: number) {
  return useQuery({
    queryKey: ['patient-billing-history', patientId],
    queryFn: () => AppointmentsService.getPatientBillingHistory(patientId),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
}