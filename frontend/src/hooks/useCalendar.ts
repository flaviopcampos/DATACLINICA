import { useState, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { appointmentsService } from '../services/appointmentsService';
import {
  CalendarEvent,
  CalendarView,
  CalendarFilters,
  UseCalendarOptions,
  Appointment
} from '../types/appointments';

const QUERY_KEYS = {
  calendarEvents: 'calendar-events',
  monthlyStats: 'monthly-stats'
} as const;

export function useCalendar(options: UseCalendarOptions = {}) {
  const {
    initialDate = new Date(),
    initialView = 'month',
    doctorId,
    clinicId,
    autoRefresh = false,
    refreshInterval = 30000 // 30 segundos
  } = options;

  const queryClient = useQueryClient();
  
  // Estados locais
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [view, setView] = useState<CalendarView['view']>(initialView);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filters, setFilters] = useState<CalendarFilters>({
    status: [],
    doctorIds: doctorId ? [doctorId] : [],
    clinicIds: clinicId ? [clinicId] : [],
    appointmentTypes: [],
    showCanceled: false,
    showCompleted: true
  });

  // Calcular range de datas baseado na view atual
  const dateRange = useMemo(() => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    switch (view) {
      case 'day':
        // Mesmo dia
        end.setDate(start.getDate());
        break;
      case 'week':
        // Início da semana (domingo)
        start.setDate(start.getDate() - start.getDay());
        end.setDate(start.getDate() + 6);
        break;
      case 'month':
        // Primeiro e último dia do mês
        start.setDate(1);
        end.setMonth(end.getMonth() + 1, 0);
        break;
      case 'year':
        // Primeiro e último dia do ano
        start.setMonth(0, 1);
        end.setMonth(11, 31);
        break;
    }

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  }, [currentDate, view]);

  // Query para eventos do calendário
  const {
    data: events,
    isLoading: isLoadingEvents,
    error: eventsError,
    refetch: refetchEvents
  } = useQuery({
    queryKey: [QUERY_KEYS.calendarEvents, dateRange, filters],
    queryFn: () => appointmentsService.getCalendarEvents({
      startDate: dateRange.start,
      endDate: dateRange.end,
      ...filters
    }),
    staleTime: autoRefresh ? refreshInterval : 5 * 60 * 1000,
    refetchInterval: autoRefresh ? refreshInterval : false,
    gcTime: 10 * 60 * 1000
  });

  // Query para estatísticas mensais
  const {
    data: monthlyStats,
    isLoading: isLoadingStats
  } = useQuery({
    queryKey: [QUERY_KEYS.monthlyStats, currentDate.getFullYear(), currentDate.getMonth(), filters],
    queryFn: () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      return appointmentsService.getMonthlyStats(year, month, filters);
    },
    enabled: view === 'month',
    staleTime: 10 * 60 * 1000
  });

  // Funções de navegação
  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const goToPrevious = useCallback(() => {
    const newDate = new Date(currentDate);
    
    switch (view) {
      case 'day':
        newDate.setDate(newDate.getDate() - 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() - 1);
        break;
    }
    
    setCurrentDate(newDate);
  }, [currentDate, view]);

  const goToNext = useCallback(() => {
    const newDate = new Date(currentDate);
    
    switch (view) {
      case 'day':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + 1);
        break;
    }
    
    setCurrentDate(newDate);
  }, [currentDate, view]);

  const goToDate = useCallback((date: Date) => {
    setCurrentDate(new Date(date));
  }, []);

  // Funções de filtro
  const updateFilters = useCallback((newFilters: Partial<CalendarFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      status: [],
      doctorIds: doctorId ? [doctorId] : [],
      clinicIds: clinicId ? [clinicId] : [],
      appointmentTypes: [],
      showCanceled: false,
      showCompleted: true
    });
  }, [doctorId, clinicId]);

  // Funções utilitárias
  const getEventsForDate = useCallback((date: Date): CalendarEvent[] => {
    if (!events) return [];
    
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => 
      event.start.startsWith(dateStr)
    );
  }, [events]);

  const getEventsForDateRange = useCallback((startDate: Date, endDate: Date): CalendarEvent[] => {
    if (!events) return [];
    
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];
    
    return events.filter(event => {
      const eventDate = event.start.split('T')[0];
      return eventDate >= start && eventDate <= end;
    });
  }, [events]);

  const hasEventsOnDate = useCallback((date: Date): boolean => {
    return getEventsForDate(date).length > 0;
  }, [getEventsForDate]);

  const getEventsByStatus = useCallback((status: string): CalendarEvent[] => {
    if (!events) return [];
    return events.filter(event => event.appointment.status === status);
  }, [events]);

  const getEventsByDoctor = useCallback((doctorId: number): CalendarEvent[] => {
    if (!events) return [];
    return events.filter(event => event.appointment.doctor_id === doctorId);
  }, [events]);

  // Função para obter dias da semana para a view de mês
  const getCalendarDays = useCallback(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: Date[] = [];
    const currentDay = new Date(startDate);
    
    // 6 semanas (42 dias) para cobrir todo o mês
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  }, [currentDate]);

  // Função para obter horários do dia para view de dia/semana
  const getTimeSlots = useCallback((interval: number = 30): string[] => {
    const slots: string[] = [];
    const startHour = 6; // 6:00 AM
    const endHour = 22; // 10:00 PM
    
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeStr);
      }
    }
    
    return slots;
  }, []);

  // Função para formatar título do calendário
  const getCalendarTitle = useCallback((): string => {
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
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        return `${weekStart.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} - ${weekEnd.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
      case 'month':
        options.year = 'numeric';
        options.month = 'long';
        break;
      case 'year':
        options.year = 'numeric';
        break;
    }
    
    return currentDate.toLocaleDateString('pt-BR', options);
  }, [currentDate, view]);

  // Função para refresh manual
  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ 
      queryKey: [QUERY_KEYS.calendarEvents] 
    });
    queryClient.invalidateQueries({ 
      queryKey: [QUERY_KEYS.monthlyStats] 
    });
  }, [queryClient]);

  // Função para selecionar data
  const selectDate = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedDate(null);
  }, []);

  return {
    // Estado atual
    currentDate,
    view,
    selectedDate,
    filters,
    dateRange,
    
    // Dados
    events: events || [],
    monthlyStats,
    
    // Estados de loading
    isLoadingEvents,
    isLoadingStats,
    isLoading: isLoadingEvents || isLoadingStats,
    
    // Erros
    eventsError,
    error: eventsError,
    
    // Navegação
    goToToday,
    goToPrevious,
    goToNext,
    goToDate,
    setView,
    
    // Filtros
    updateFilters,
    clearFilters,
    
    // Seleção
    selectDate,
    clearSelection,
    
    // Utilitários
    getEventsForDate,
    getEventsForDateRange,
    hasEventsOnDate,
    getEventsByStatus,
    getEventsByDoctor,
    getCalendarDays,
    getTimeSlots,
    getCalendarTitle,
    
    // Ações
    refresh,
    refetchEvents
  };
}

export default useCalendar;