import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AppointmentsService } from '@/services/appointmentsService';
import type {
  Appointment,
  CreateAppointmentData,
  UpdateAppointmentData,
  AppointmentFilters
} from '@/types/appointments';

// Hook principal para gerenciar agendamentos
export function useAppointments(filters?: AppointmentFilters) {
  const queryClient = useQueryClient();

  // Query para buscar agendamentos
  const {
    data: appointments = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['appointments', filters],
    queryFn: () => AppointmentsService.getAppointments(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Mutation para criar agendamento
  const createAppointmentMutation = useMutation({
    mutationFn: (data: CreateAppointmentData) => AppointmentsService.createAppointment(data),
    onSuccess: (newAppointment) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['doctor-availability'] });
      queryClient.invalidateQueries({ queryKey: ['appointment-stats'] });
      toast.success('Agendamento criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar agendamento');
    }
  });

  // Mutation para atualizar agendamento
  const updateAppointmentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAppointmentData }) => 
      AppointmentsService.updateAppointment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['doctor-availability'] });
      toast.success('Agendamento atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar agendamento');
    }
  });

  // Mutation para cancelar agendamento
  const cancelAppointmentMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => 
      AppointmentsService.cancelAppointment(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['doctor-availability'] });
      queryClient.invalidateQueries({ queryKey: ['waiting-list'] });
      toast.success('Agendamento cancelado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao cancelar agendamento');
    }
  });

  // Mutation para confirmar agendamento
  const confirmAppointmentMutation = useMutation({
    mutationFn: (id: string) => AppointmentsService.confirmAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Agendamento confirmado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao confirmar agendamento');
    }
  });

  // Mutation para reagendar
  const rescheduleAppointmentMutation = useMutation({
    mutationFn: ({ id, newDate, newTime }: { id: string; newDate: string; newTime: string }) => 
      AppointmentsService.rescheduleAppointment(id, newDate, newTime),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['doctor-availability'] });
      toast.success('Agendamento reagendado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao reagendar agendamento');
    }
  });

  return {
    // Data
    appointments,
    isLoading,
    error,
    
    // Actions
    refetch,
    createAppointment: createAppointmentMutation.mutate,
    updateAppointment: updateAppointmentMutation.mutate,
    cancelAppointment: cancelAppointmentMutation.mutate,
    confirmAppointment: confirmAppointmentMutation.mutate,
    rescheduleAppointment: rescheduleAppointmentMutation.mutate,
    
    // Loading states
    isCreating: createAppointmentMutation.isPending,
    isUpdating: updateAppointmentMutation.isPending,
    isCanceling: cancelAppointmentMutation.isPending,
    isConfirming: confirmAppointmentMutation.isPending,
    isRescheduling: rescheduleAppointmentMutation.isPending,
  };
}

// Hook para buscar um agendamento específico
export function useAppointment(id: string) {
  return useQuery({
    queryKey: ['appointment', id],
    queryFn: () => AppointmentsService.getAppointment(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para agendamentos de hoje
export function useTodayAppointments() {
  return useQuery({
    queryKey: ['appointments', 'today'],
    queryFn: () => AppointmentsService.getTodayAppointments(),
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 5 * 60 * 1000, // Atualiza a cada 5 minutos
  });
}

// Hook para próximos agendamentos
export function useUpcomingAppointments(limit: number = 10) {
  return useQuery({
    queryKey: ['appointments', 'upcoming', limit],
    queryFn: () => AppointmentsService.getUpcomingAppointments(limit),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

// Hook para buscar agendamentos
export function useSearchAppointments(query: string) {
  return useQuery({
    queryKey: ['appointments', 'search', query],
    queryFn: () => AppointmentsService.searchAppointments(query),
    enabled: query.length >= 2,
    staleTime: 30 * 1000, // 30 segundos
  });
}

// Hook para estatísticas de agendamentos
export function useAppointmentStats(filters?: {
  date_from?: string;
  date_to?: string;
  doctor_id?: string;
}) {
  return useQuery({
    queryKey: ['appointment-stats', filters],
    queryFn: () => AppointmentsService.getAppointmentStats(filters),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para agendamentos por intervalo de datas
export function useAppointmentsByDateRange(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['appointments', 'range', startDate, endDate],
    queryFn: () => AppointmentsService.getAppointmentsByDateRange(startDate, endDate),
    enabled: !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000,
  });
}