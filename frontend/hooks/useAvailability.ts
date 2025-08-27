import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AppointmentsService } from '@/services/appointmentsService';
import type {
  AppointmentAvailability,
  DoctorSchedule,
  AvailabilityRule
} from '@/types/appointments';

// Hook para disponibilidade de médicos
export function useDoctorAvailability(doctorId: string, date: string) {
  return useQuery({
    queryKey: ['doctor-availability', doctorId, date],
    queryFn: () => AppointmentsService.getDoctorAvailability(doctorId, date),
    enabled: !!doctorId && !!date,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 10 * 60 * 1000, // Atualiza a cada 10 minutos
  });
}

// Exportação padrão para compatibilidade
const useAvailability = {
  useDoctorAvailability,
  useDoctorSchedule,
  useAvailableSlots,
  useAvailabilityManagement,
  useMultipleDoctorsAvailability,
  useAvailabilityConflicts,
  useRescheduleOptions,
  useAutoReschedule,
  useRealTimeAvailability,
  useOptimizedSlots
};

export default useAvailability;

// Hook para agenda completa do médico
export function useDoctorSchedule(doctorId: string, date: string) {
  return useQuery({
    queryKey: ['doctor-schedule', doctorId, date],
    queryFn: () => AppointmentsService.getDoctorSchedule(doctorId, date),
    enabled: !!doctorId && !!date,
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 5 * 60 * 1000, // Atualiza a cada 5 minutos
  });
}

// Hook para slots disponíveis
export function useAvailableSlots(
  doctorId: string, 
  date: string, 
  duration: number = 30
) {
  return useQuery({
    queryKey: ['available-slots', doctorId, date, duration],
    queryFn: () => AppointmentsService.getAvailableSlots(doctorId, date, duration),
    enabled: !!doctorId && !!date,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 3 * 60 * 1000, // Atualiza a cada 3 minutos
  });
}

// Hook para gerenciar regras de disponibilidade
export function useAvailabilityManagement(doctorId: string) {
  const queryClient = useQueryClient();

  // Mutation para definir disponibilidade
  const setAvailabilityMutation = useMutation({
    mutationFn: (rules: AvailabilityRule[]) => 
      AppointmentsService.setDoctorAvailability(doctorId, rules),
    onSuccess: () => {
      // Invalida todas as queries relacionadas à disponibilidade deste médico
      queryClient.invalidateQueries({ 
        queryKey: ['doctor-availability', doctorId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['doctor-schedule', doctorId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['available-slots', doctorId] 
      });
      toast.success('Disponibilidade atualizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar disponibilidade');
    }
  });

  return {
    setAvailability: setAvailabilityMutation.mutate,
    isSettingAvailability: setAvailabilityMutation.isPending,
  };
}

// Hook para múltiplos médicos em uma data
export function useMultipleDoctorsAvailability(
  doctorIds: string[], 
  date: string
) {
  const queries = doctorIds.map(doctorId => ({
    queryKey: ['doctor-availability', doctorId, date],
    queryFn: () => AppointmentsService.getDoctorAvailability(doctorId, date),
    enabled: !!doctorId && !!date,
    staleTime: 5 * 60 * 1000,
  }));

  // Usando Promise.all para buscar todas as disponibilidades
  return useQuery({
    queryKey: ['multiple-doctors-availability', doctorIds, date],
    queryFn: async () => {
      const results = await Promise.allSettled(
        doctorIds.map(doctorId => 
          AppointmentsService.getDoctorAvailability(doctorId, date)
        )
      );
      
      return results.map((result, index) => ({
        doctorId: doctorIds[index],
        availability: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason : null,
      }));
    },
    enabled: doctorIds.length > 0 && !!date,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para verificar conflitos de disponibilidade
export function useAvailabilityConflicts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentData: {
      doctor_id: string;
      appointment_date: string;
      appointment_time: string;
      duration: number;
    }) => {
      const conflicts = await AppointmentsService.checkConflicts(appointmentData);
      return conflicts;
    },
    onSuccess: (conflicts) => {
      if (conflicts.length > 0) {
        toast.warning(`${conflicts.length} conflito(s) detectado(s)`);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao verificar conflitos');
    }
  });
}

// Hook para sugestões de reagendamento
export function useRescheduleOptions(appointmentId: string) {
  return useQuery({
    queryKey: ['reschedule-options', appointmentId],
    queryFn: () => AppointmentsService.suggestRescheduleOptions(appointmentId),
    enabled: !!appointmentId,
    staleTime: 2 * 60 * 1000,
  });
}

// Hook para reagendamento automático
export function useAutoReschedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      appointmentId, 
      preferences 
    }: { 
      appointmentId: string; 
      preferences?: {
        preferred_dates?: string[];
        preferred_times?: string[];
        same_doctor?: boolean;
      }
    }) => AppointmentsService.autoReschedule(appointmentId, preferences),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['doctor-availability'] });
      queryClient.invalidateQueries({ queryKey: ['doctor-schedule'] });
      toast.success('Agendamento reagendado automaticamente!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro no reagendamento automático');
    }
  });
}

// Hook para verificar disponibilidade em tempo real
export function useRealTimeAvailability(
  doctorId: string, 
  date: string,
  intervalMs: number = 30000 // 30 segundos
) {
  return useQuery({
    queryKey: ['realtime-availability', doctorId, date],
    queryFn: () => AppointmentsService.getDoctorAvailability(doctorId, date),
    enabled: !!doctorId && !!date,
    staleTime: 0, // Sempre considera stale para forçar refetch
    refetchInterval: intervalMs,
    refetchIntervalInBackground: true,
  });
}

// Hook para otimização de slots
export function useOptimizedSlots(
  doctorId: string, 
  date: string, 
  appointmentType: string,
  duration: number = 30
) {
  return useQuery({
    queryKey: ['optimized-slots', doctorId, date, appointmentType, duration],
    queryFn: async () => {
      const availability = await AppointmentsService.getDoctorAvailability(doctorId, date);
      const slots = await AppointmentsService.getAvailableSlots(doctorId, date, duration);
      
      // Lógica para otimizar slots baseado no tipo de consulta
      return slots.filter(slot => {
        const slotTime = new Date(`${date}T${slot.start_time}`);
        const hour = slotTime.getHours();
        
        // Exemplo: consultas de emergência têm prioridade em qualquer horário
        if (appointmentType === 'emergency') return true;
        
        // Consultas de rotina preferencialmente pela manhã
        if (appointmentType === 'routine_checkup') {
          return hour >= 8 && hour <= 12;
        }
        
        // Consultas de especialista preferencialmente à tarde
        if (appointmentType === 'specialist_consultation') {
          return hour >= 14 && hour <= 18;
        }
        
        return true;
      });
    },
    enabled: !!doctorId && !!date && !!appointmentType,
    staleTime: 2 * 60 * 1000,
  });
}