import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { appointmentsService } from '../services/appointmentsService';
import {
  Appointment,
  AppointmentCreate,
  AppointmentUpdate,
  AppointmentFilters,
  AppointmentsResponse,
  UseAppointmentsOptions
} from '../types/appointments';

const QUERY_KEYS = {
  appointments: 'appointments',
  appointment: 'appointment',
  stats: 'appointment-stats',
  calendar: 'appointment-calendar'
} as const;

export function useAppointments(options: UseAppointmentsOptions = {}) {
  const {
    filters,
    page = 1,
    per_page = 20,
    auto_refresh = false,
    refresh_interval = 30000
  } = options;

  const queryClient = useQueryClient();

  // Query para listar agendamentos
  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: [QUERY_KEYS.appointments, filters, page, per_page],
    queryFn: () => appointmentsService.getAppointments(filters, page, per_page),
    refetchInterval: auto_refresh ? refresh_interval : false,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  // Mutation para criar agendamento
  const createMutation = useMutation({
    mutationFn: (appointment: AppointmentCreate) => 
      appointmentsService.createAppointment(appointment),
    onSuccess: (newAppointment) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.appointments] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.stats] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.calendar] });
      
      // Adicionar o novo agendamento ao cache
      queryClient.setQueryData(
        [QUERY_KEYS.appointment, newAppointment.id],
        newAppointment
      );
      
      toast.success('Agendamento criado com sucesso!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Erro ao criar agendamento';
      toast.error(message);
    }
  });

  // Mutation para atualizar agendamento
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AppointmentUpdate> }) =>
      appointmentsService.updateAppointment(id, data),
    onSuccess: (updatedAppointment) => {
      // Atualizar cache específico
      queryClient.setQueryData(
        [QUERY_KEYS.appointment, updatedAppointment.id],
        updatedAppointment
      );
      
      // Invalidar lista de agendamentos
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.appointments] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.calendar] });
      
      toast.success('Agendamento atualizado com sucesso!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Erro ao atualizar agendamento';
      toast.error(message);
    }
  });

  // Mutation para cancelar agendamento
  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      appointmentsService.cancelAppointment(id, reason),
    onSuccess: (cancelledAppointment) => {
      queryClient.setQueryData(
        [QUERY_KEYS.appointment, cancelledAppointment.id],
        cancelledAppointment
      );
      
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.appointments] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.stats] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.calendar] });
      
      toast.success('Agendamento cancelado com sucesso!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Erro ao cancelar agendamento';
      toast.error(message);
    }
  });

  // Mutation para confirmar agendamento
  const confirmMutation = useMutation({
    mutationFn: (id: number) => appointmentsService.confirmAppointment(id),
    onSuccess: (confirmedAppointment) => {
      queryClient.setQueryData(
        [QUERY_KEYS.appointment, confirmedAppointment.id],
        confirmedAppointment
      );
      
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.appointments] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.calendar] });
      
      toast.success('Agendamento confirmado com sucesso!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Erro ao confirmar agendamento';
      toast.error(message);
    }
  });

  // Mutation para iniciar consulta
  const startMutation = useMutation({
    mutationFn: (id: number) => appointmentsService.startAppointment(id),
    onSuccess: (startedAppointment) => {
      queryClient.setQueryData(
        [QUERY_KEYS.appointment, startedAppointment.id],
        startedAppointment
      );
      
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.appointments] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.calendar] });
      
      toast.success('Consulta iniciada!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Erro ao iniciar consulta';
      toast.error(message);
    }
  });

  // Mutation para finalizar consulta
  const completeMutation = useMutation({
    mutationFn: (id: number) => appointmentsService.completeAppointment(id),
    onSuccess: (completedAppointment) => {
      queryClient.setQueryData(
        [QUERY_KEYS.appointment, completedAppointment.id],
        completedAppointment
      );
      
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.appointments] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.stats] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.calendar] });
      
      toast.success('Consulta finalizada com sucesso!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Erro ao finalizar consulta';
      toast.error(message);
    }
  });

  // Mutation para marcar como faltou
  const noShowMutation = useMutation({
    mutationFn: (id: number) => appointmentsService.markNoShow(id),
    onSuccess: (noShowAppointment) => {
      queryClient.setQueryData(
        [QUERY_KEYS.appointment, noShowAppointment.id],
        noShowAppointment
      );
      
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.appointments] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.stats] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.calendar] });
      
      toast.success('Agendamento marcado como falta!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Erro ao marcar falta';
      toast.error(message);
    }
  });

  // Mutation para deletar agendamento
  const deleteMutation = useMutation({
    mutationFn: (id: number) => appointmentsService.deleteAppointment(id),
    onSuccess: (_, deletedId) => {
      // Remover do cache
      queryClient.removeQueries({ queryKey: [QUERY_KEYS.appointment, deletedId] });
      
      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.appointments] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.stats] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.calendar] });
      
      toast.success('Agendamento excluído com sucesso!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Erro ao excluir agendamento';
      toast.error(message);
    }
  });

  // Função para buscar agendamentos
  const searchAppointments = async (query: string, searchFilters?: AppointmentFilters) => {
    try {
      const results = await appointmentsService.searchAppointments(query, searchFilters);
      return results;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Erro na busca';
      toast.error(message);
      throw error;
    }
  };

  // Função para exportar agendamentos
  const exportAppointments = async (options: any) => {
    try {
      const blob = await appointmentsService.exportAppointments(options);
      
      // Criar URL para download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `agendamentos_${new Date().toISOString().split('T')[0]}.${options.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Relatório exportado com sucesso!');
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Erro ao exportar relatório';
      toast.error(message);
    }
  };

  // Função para atualizar filtros
  const updateFilters = (newFilters: AppointmentFilters) => {
    queryClient.invalidateQueries({ 
      queryKey: [QUERY_KEYS.appointments, newFilters, page, per_page] 
    });
  };

  // Função para refresh manual
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.appointments] });
  };

  return {
    // Data
    appointments: data?.appointments || [],
    total: data?.total || 0,
    totalPages: data?.total_pages || 0,
    currentPage: page,
    perPage: per_page,
    
    // Loading states
    isLoading,
    isFetching,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isCancelling: cancelMutation.isPending,
    isConfirming: confirmMutation.isPending,
    isStarting: startMutation.isPending,
    isCompleting: completeMutation.isPending,
    isMarkingNoShow: noShowMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Error states
    error,
    createError: createMutation.error,
    updateError: updateMutation.error,
    
    // Actions
    createAppointment: createMutation.mutate,
    updateAppointment: (id: number, data: Partial<AppointmentUpdate>) => 
      updateMutation.mutate({ id, data }),
    cancelAppointment: (id: number, reason?: string) => 
      cancelMutation.mutate({ id, reason }),
    confirmAppointment: confirmMutation.mutate,
    startAppointment: startMutation.mutate,
    completeAppointment: completeMutation.mutate,
    markNoShow: noShowMutation.mutate,
    deleteAppointment: deleteMutation.mutate,
    
    // Utility functions
    searchAppointments,
    exportAppointments,
    updateFilters,
    refresh,
    refetch
  };
}

export default useAppointments;