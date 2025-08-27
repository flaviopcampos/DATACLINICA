import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppointmentsService } from '@/services/appointmentsService';
import type { Appointment, CalendarEvent } from '@/types/appointments';

export type CalendarView = 'month' | 'week' | 'day' | 'agenda';

interface UseCalendarOptions {
  defaultView?: CalendarView;
  defaultDate?: Date;
  doctorId?: string;
}

// Hook principal para gerenciar o calendário
export function useCalendar(options: UseCalendarOptions = {}) {
  const {
    defaultView = 'month',
    defaultDate = new Date(),
    doctorId
  } = options;

  // Estados do calendário
  const [currentDate, setCurrentDate] = useState(defaultDate);
  const [view, setView] = useState<CalendarView>(defaultView);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Calcular intervalo de datas baseado na visualização atual
  const dateRange = useMemo(() => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    switch (view) {
      case 'day':
        // Mesmo dia
        break;
      case 'week':
        // Início da semana (domingo)
        start.setDate(currentDate.getDate() - currentDate.getDay());
        end.setDate(start.getDate() + 6);
        break;
      case 'month':
        // Primeiro e último dia do mês
        start.setDate(1);
        end.setMonth(currentDate.getMonth() + 1, 0);
        break;
      case 'agenda':
        // Próximos 30 dias
        end.setDate(currentDate.getDate() + 30);
        break;
    }

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  }, [currentDate, view]);

  // Query para buscar agendamentos do período
  const {
    data: appointments = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['calendar-appointments', dateRange.start, dateRange.end, doctorId],
    queryFn: () => AppointmentsService.getAppointmentsByDateRange(dateRange.start, dateRange.end),
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 5 * 60 * 1000, // Atualiza a cada 5 minutos
  });

  // Converter agendamentos para eventos do calendário
  const calendarEvents = useMemo((): CalendarEvent[] => {
    return appointments
      .filter(appointment => {
        // Filtrar por médico se especificado
        if (doctorId && appointment.doctor_id !== doctorId) {
          return false;
        }
        return true;
      })
      .map(appointment => {
        const startDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
        const endDateTime = new Date(startDateTime.getTime() + (appointment.duration * 60 * 1000));

        return {
          id: appointment.id,
          title: `${appointment.patient?.name || 'Paciente'} - ${appointment.type}`,
          start: startDateTime,
          end: endDateTime,
          resource: {
            status: appointment.status,
            type: appointment.type,
            doctorName: appointment.doctor?.name,
            patientName: appointment.patient?.name,
          },
          appointment
        };
      });
  }, [appointments, doctorId]);

  // Funções de navegação
  const goToNext = useCallback(() => {
    const newDate = new Date(currentDate);
    
    switch (view) {
      case 'day':
        newDate.setDate(currentDate.getDate() + 1);
        break;
      case 'week':
        newDate.setDate(currentDate.getDate() + 7);
        break;
      case 'month':
        newDate.setMonth(currentDate.getMonth() + 1);
        break;
      case 'agenda':
        newDate.setDate(currentDate.getDate() + 30);
        break;
    }
    
    setCurrentDate(newDate);
  }, [currentDate, view]);

  const goToPrevious = useCallback(() => {
    const newDate = new Date(currentDate);
    
    switch (view) {
      case 'day':
        newDate.setDate(currentDate.getDate() - 1);
        break;
      case 'week':
        newDate.setDate(currentDate.getDate() - 7);
        break;
      case 'month':
        newDate.setMonth(currentDate.getMonth() - 1);
        break;
      case 'agenda':
        newDate.setDate(currentDate.getDate() - 30);
        break;
    }
    
    setCurrentDate(newDate);
  }, [currentDate, view]);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const goToDate = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  // Função para selecionar um slot de tempo
  const selectSlot = useCallback((slotInfo: { start: Date; end: Date }) => {
    setSelectedDate(slotInfo.start);
    setSelectedAppointment(null);
  }, []);

  // Função para selecionar um evento/agendamento
  const selectEvent = useCallback((event: CalendarEvent) => {
    setSelectedAppointment(event.appointment);
    setSelectedDate(event.start);
  }, []);

  // Obter título da visualização atual
  const getViewTitle = useCallback(() => {
    const options: Intl.DateTimeFormatOptions = {};
    
    switch (view) {
      case 'day':
        options.weekday = 'long';
        options.year = 'numeric';
        options.month = 'long';
        options.day = 'numeric';
        break;
      case 'week':
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        return `${weekStart.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} - ${weekEnd.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
      case 'month':
        options.year = 'numeric';
        options.month = 'long';
        break;
      case 'agenda':
        return 'Agenda';
    }
    
    return currentDate.toLocaleDateString('pt-BR', options);
  }, [currentDate, view]);

  // Obter agendamentos de um dia específico
  const getAppointmentsForDate = useCallback((date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(appointment => 
      appointment.appointment_date === dateStr
    );
  }, [appointments]);

  // Verificar se uma data tem agendamentos
  const hasAppointments = useCallback((date: Date) => {
    return getAppointmentsForDate(date).length > 0;
  }, [getAppointmentsForDate]);

  // Obter estatísticas do período atual
  const periodStats = useMemo(() => {
    const total = appointments.length;
    const confirmed = appointments.filter(apt => apt.status === 'confirmed').length;
    const pending = appointments.filter(apt => apt.status === 'scheduled').length;
    const cancelled = appointments.filter(apt => apt.status === 'cancelled').length;
    const completed = appointments.filter(apt => apt.status === 'completed').length;

    return {
      total,
      confirmed,
      pending,
      cancelled,
      completed,
      confirmationRate: total > 0 ? (confirmed / total) * 100 : 0,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
    };
  }, [appointments]);

  return {
    // Estado atual
    currentDate,
    view,
    selectedDate,
    selectedAppointment,
    dateRange,
    
    // Dados
    appointments,
    calendarEvents,
    isLoading,
    error,
    periodStats,
    
    // Ações
    setView,
    goToNext,
    goToPrevious,
    goToToday,
    goToDate,
    selectSlot,
    selectEvent,
    refetch,
    
    // Utilitários
    getViewTitle,
    getAppointmentsForDate,
    hasAppointments,
    
    // Limpeza de seleção
    clearSelection: () => {
      setSelectedDate(null);
      setSelectedAppointment(null);
    }
  };
}

// Hook para calendário de um médico específico
export function useDoctorCalendar(doctorId: string, options: Omit<UseCalendarOptions, 'doctorId'> = {}) {
  return useCalendar({ ...options, doctorId });
}

// Hook para mini calendário (apenas navegação)
export function useMiniCalendar(defaultDate: Date = new Date()) {
  const [currentDate, setCurrentDate] = useState(defaultDate);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const goToNextMonth = useCallback(() => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + 1);
    setCurrentDate(newDate);
  }, [currentDate]);

  const goToPreviousMonth = useCallback(() => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() - 1);
    setCurrentDate(newDate);
  }, [currentDate]);

  const selectDate = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const getMonthTitle = useCallback(() => {
    return currentDate.toLocaleDateString('pt-BR', { 
      year: 'numeric', 
      month: 'long' 
    });
  }, [currentDate]);

  return {
    currentDate,
    selectedDate,
    goToNextMonth,
    goToPreviousMonth,
    selectDate,
    getMonthTitle,
    clearSelection: () => setSelectedDate(null)
  };
}