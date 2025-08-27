import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { appointmentsService } from '../services/appointmentsService';
import {
  DoctorAvailability,
  AvailabilityResponse,
  TimeSlot,
  UseAvailabilityOptions,
  AppointmentValidation
} from '../types/appointments';

const QUERY_KEYS = {
  availability: 'doctor-availability',
  availableSlots: 'available-slots',
  validation: 'appointment-validation'
} as const;

export function useAvailability(options: UseAvailabilityOptions) {
  const { doctor_id, date, procedure_id } = options;
  const queryClient = useQueryClient();

  // Query para obter disponibilidade do médico
  const {
    data: availability,
    isLoading: isLoadingAvailability,
    error: availabilityError,
    refetch: refetchAvailability
  } = useQuery({
    queryKey: [QUERY_KEYS.availability, doctor_id, date],
    queryFn: () => appointmentsService.getDoctorAvailability(doctor_id, date),
    enabled: !!doctor_id && !!date,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });

  // Query para obter slots disponíveis
  const {
    data: availableSlots,
    isLoading: isLoadingSlots,
    error: slotsError,
    refetch: refetchSlots
  } = useQuery({
    queryKey: [QUERY_KEYS.availableSlots, doctor_id, date, procedure_id],
    queryFn: () => {
      const duration = procedure_id ? undefined : 30; // Duração padrão se não houver procedimento
      return appointmentsService.getAvailableSlots(doctor_id, date, duration, procedure_id);
    },
    enabled: !!doctor_id && !!date,
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 3 * 60 * 1000, // 3 minutos
  });

  // Mutation para atualizar disponibilidade do médico
  const updateAvailabilityMutation = useMutation({
    mutationFn: (availabilityData: Partial<DoctorAvailability>[]) =>
      appointmentsService.updateDoctorAvailability(doctor_id, availabilityData),
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.availability, doctor_id] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.availableSlots, doctor_id] 
      });
      
      toast.success('Disponibilidade atualizada com sucesso!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Erro ao atualizar disponibilidade';
      toast.error(message);
    }
  });

  // Função para validar agendamento
  const validateAppointment = async (appointmentData: any): Promise<AppointmentValidation> => {
    try {
      const validation = await appointmentsService.validateAppointment(appointmentData);
      return validation;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Erro na validação';
      toast.error(message);
      throw error;
    }
  };

  // Função para verificar conflitos
  const checkConflicts = async (
    doctorId: number,
    appointmentDate: string,
    startTime: string,
    duration: number,
    excludeAppointmentId?: number
  ): Promise<AppointmentValidation> => {
    try {
      const conflicts = await appointmentsService.checkConflicts(
        doctorId,
        appointmentDate,
        startTime,
        duration,
        excludeAppointmentId
      );
      return conflicts;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Erro ao verificar conflitos';
      toast.error(message);
      throw error;
    }
  };

  // Função para obter próximos slots disponíveis
  const getNextAvailableSlots = (currentDate: string, daysAhead = 7): Promise<TimeSlot[]> => {
    const promises: Promise<TimeSlot[]>[] = [];
    
    for (let i = 0; i < daysAhead; i++) {
      const checkDate = new Date(currentDate);
      checkDate.setDate(checkDate.getDate() + i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      promises.push(
        appointmentsService.getAvailableSlots(doctor_id, dateStr, 30, procedure_id)
      );
    }
    
    return Promise.all(promises).then(results => {
      return results.flat().filter(slot => slot.available);
    });
  };

  // Função para verificar se um horário específico está disponível
  const isTimeSlotAvailable = (time: string): boolean => {
    if (!availableSlots) return false;
    return availableSlots.some(slot => slot.time === time && slot.available);
  };

  // Função para obter slots por período do dia
  const getSlotsByPeriod = (period: 'morning' | 'afternoon' | 'evening'): TimeSlot[] => {
    if (!availableSlots) return [];
    
    const periodRanges = {
      morning: { start: '06:00', end: '12:00' },
      afternoon: { start: '12:00', end: '18:00' },
      evening: { start: '18:00', end: '23:59' }
    };
    
    const range = periodRanges[period];
    
    return availableSlots.filter(slot => {
      const slotTime = slot.time;
      return slotTime >= range.start && slotTime < range.end;
    });
  };

  // Função para obter estatísticas de disponibilidade
  const getAvailabilityStats = () => {
    if (!availableSlots) {
      return {
        total: 0,
        available: 0,
        booked: 0,
        availabilityRate: 0
      };
    }
    
    const total = availableSlots.length;
    const available = availableSlots.filter(slot => slot.available).length;
    const booked = total - available;
    const availabilityRate = total > 0 ? (available / total) * 100 : 0;
    
    return {
      total,
      available,
      booked,
      availabilityRate: Math.round(availabilityRate)
    };
  };

  // Função para sugerir horários alternativos
  const suggestAlternativeTimes = async (
    preferredTime: string,
    duration: number = 30,
    maxSuggestions: number = 5
  ): Promise<TimeSlot[]> => {
    if (!availableSlots) return [];
    
    const preferredHour = parseInt(preferredTime.split(':')[0]);
    const preferredMinute = parseInt(preferredTime.split(':')[1]);
    const preferredTotalMinutes = preferredHour * 60 + preferredMinute;
    
    // Filtrar slots disponíveis e calcular distância do horário preferido
    const availableSlotsWithDistance = availableSlots
      .filter(slot => slot.available && slot.duration >= duration)
      .map(slot => {
        const slotHour = parseInt(slot.time.split(':')[0]);
        const slotMinute = parseInt(slot.time.split(':')[1]);
        const slotTotalMinutes = slotHour * 60 + slotMinute;
        const distance = Math.abs(slotTotalMinutes - preferredTotalMinutes);
        
        return { ...slot, distance };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, maxSuggestions);
    
    return availableSlotsWithDistance;
  };

  // Função para refresh manual
  const refresh = () => {
    queryClient.invalidateQueries({ 
      queryKey: [QUERY_KEYS.availability, doctor_id] 
    });
    queryClient.invalidateQueries({ 
      queryKey: [QUERY_KEYS.availableSlots, doctor_id] 
    });
  };

  // Função para limpar cache de disponibilidade
  const clearCache = () => {
    queryClient.removeQueries({ 
      queryKey: [QUERY_KEYS.availability, doctor_id] 
    });
    queryClient.removeQueries({ 
      queryKey: [QUERY_KEYS.availableSlots, doctor_id] 
    });
  };

  return {
    // Data
    availability,
    availableSlots: availableSlots || [],
    
    // Loading states
    isLoadingAvailability,
    isLoadingSlots,
    isLoading: isLoadingAvailability || isLoadingSlots,
    isUpdatingAvailability: updateAvailabilityMutation.isPending,
    
    // Error states
    availabilityError,
    slotsError,
    error: availabilityError || slotsError,
    updateError: updateAvailabilityMutation.error,
    
    // Actions
    updateAvailability: updateAvailabilityMutation.mutate,
    validateAppointment,
    checkConflicts,
    
    // Utility functions
    getNextAvailableSlots,
    isTimeSlotAvailable,
    getSlotsByPeriod,
    getAvailabilityStats,
    suggestAlternativeTimes,
    refresh,
    clearCache,
    refetchAvailability,
    refetchSlots
  };
}

export default useAvailability;