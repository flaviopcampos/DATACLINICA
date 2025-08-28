import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, User } from 'lucide-react';
import { CalendarView as CalendarViewType, CalendarEvent, TimeSlot } from '../../types/appointments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '../../lib/utils';

interface CalendarViewProps {
  view: CalendarViewType;
  currentDate: Date;
  events: CalendarEvent[];
  timeSlots?: TimeSlot[];
  onDateChange: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onTimeSlotClick?: (slot: TimeSlot) => void;
  onCreateEvent?: (date: Date, time?: string) => void;
  isLoading?: boolean;
  className?: string;
}

function CalendarView({
  view,
  currentDate,
  events,
  timeSlots = [],
  onDateChange,
  onEventClick,
  onTimeSlotClick,
  onCreateEvent,
  isLoading = false,
  className
}: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Utilitários de data
  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return { days, firstDay, lastDay };
  };

  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  const getHourSlots = () => {
    const slots = [];
    for (let hour = 7; hour <= 19; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return formatDate(date1) === formatDate(date2);
  };

  const isToday = (date: Date) => {
    return isSameDay(date, new Date());
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = formatDate(date);
    return events.filter(event => event.date === dateStr);
  };

  const getEventsForDateTime = (date: Date, time: string) => {
    const dateStr = formatDate(date);
    return events.filter(event => 
      event.date === dateStr && 
      event.startTime <= time && 
      event.endTime > time
    );
  };

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      completed: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      no_show: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Navegação
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    onDateChange(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    onDateChange(newDate);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    if (view !== 'day') {
      onDateChange(date);
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    if (onEventClick) {
      onEventClick(event);
    }
  };

  const handleTimeSlotClick = (date: Date, time: string) => {
    if (onCreateEvent) {
      onCreateEvent(date, time);
    }
  };

  // Renderização por tipo de visualização
  const renderMonthView = () => {
    const { days, firstDay, lastDay } = getMonthDays(currentDate);
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return (
      <div className="space-y-4">
        {/* Cabeçalho dos dias da semana */}
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        
        {/* Grade do calendário */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = day >= firstDay && day <= lastDay;
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isTodayDate = isToday(day);
            
            return (
              <div
                key={index}
                className={cn(
                  'min-h-[100px] p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors',
                  !isCurrentMonth && 'bg-gray-50 text-gray-400',
                  isSelected && 'bg-blue-50 border-blue-300',
                  isTodayDate && 'bg-blue-100 border-blue-400'
                )}
                onClick={() => handleDateClick(day)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={cn(
                    'text-sm font-medium',
                    isTodayDate && 'text-blue-600'
                  )}>
                    {day.getDate()}
                  </span>
                  
                  {dayEvents.length > 0 && (
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      {dayEvents.length}
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event, eventIndex) => (
                    <div
                      key={eventIndex}
                      className={cn(
                        'text-xs p-1 rounded truncate cursor-pointer hover:opacity-80',
                        getStatusColor(event.status)
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(event);
                      }}
                    >
                      {event.startTime} {event.title}
                    </div>
                  ))}
                  
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayEvents.length - 3} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays(currentDate);
    const hourSlots = getHourSlots();

    return (
      <div className="space-y-4">
        {/* Cabeçalho da semana */}
        <div className="grid grid-cols-8 gap-1">
          <div className="p-2"></div>
          {weekDays.map((day, index) => {
            const isTodayDate = isToday(day);
            return (
              <div
                key={index}
                className={cn(
                  'p-2 text-center border border-gray-200 rounded cursor-pointer hover:bg-gray-50',
                  isTodayDate && 'bg-blue-100 border-blue-400'
                )}
                onClick={() => handleDateClick(day)}
              >
                <div className={cn(
                  'text-sm font-medium',
                  isTodayDate && 'text-blue-600'
                )}>
                  {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                </div>
                <div className={cn(
                  'text-lg font-bold',
                  isTodayDate && 'text-blue-600'
                )}>
                  {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Grade de horários */}
        <div className="grid grid-cols-8 gap-1 max-h-[600px] overflow-y-auto">
          {hourSlots.map((time, timeIndex) => (
            <React.Fragment key={timeIndex}>
              <div className="p-2 text-xs text-gray-500 text-right border-r">
                {time}
              </div>
              
              {weekDays.map((day, dayIndex) => {
                const dayTimeEvents = getEventsForDateTime(day, time);
                
                return (
                  <div
                    key={`${timeIndex}-${dayIndex}`}
                    className="min-h-[40px] p-1 border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleTimeSlotClick(day, time)}
                  >
                    {dayTimeEvents.map((event, eventIndex) => (
                      <div
                        key={eventIndex}
                        className={cn(
                          'text-xs p-1 rounded mb-1 truncate cursor-pointer hover:opacity-80',
                          getStatusColor(event.status)
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event);
                        }}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const hourSlots = getHourSlots();
    const dayEvents = getEventsForDate(currentDate);

    return (
      <div className="space-y-4">
        {/* Cabeçalho do dia */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CalendarIcon className="h-5 w-5" />
                <span>
                  {currentDate.toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              
              <Badge variant="secondary">
                {dayEvents.length} agendamentos
              </Badge>
            </CardTitle>
          </CardHeader>
        </Card>
        
        {/* Grade de horários do dia */}
        <div className="space-y-1 max-h-[600px] overflow-y-auto">
          {hourSlots.map((time, index) => {
            const timeEvents = getEventsForDateTime(currentDate, time);
            
            return (
              <div
                key={index}
                className="flex items-center space-x-4 p-2 border border-gray-100 rounded hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleTimeSlotClick(currentDate, time)}
              >
                <div className="w-16 text-sm text-gray-500 text-right">
                  {time}
                </div>
                
                <div className="flex-1 min-h-[40px] flex items-center">
                  {timeEvents.length > 0 ? (
                    <div className="space-y-1 w-full">
                      {timeEvents.map((event, eventIndex) => (
                        <div
                          key={eventIndex}
                          className={cn(
                            'p-2 rounded cursor-pointer hover:opacity-80 flex items-center justify-between',
                            getStatusColor(event.status)
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEventClick(event);
                          }}
                        >
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4" />
                            <span className="font-medium">{event.title}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1 text-xs">
                            <Clock className="h-3 w-3" />
                            <span>{event.startTime} - {event.endTime}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full h-10 text-gray-400 hover:text-gray-600">
                      <Plus className="h-4 w-4 mr-1" />
                      <span className="text-sm">Clique para agendar</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando calendário...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={goToPrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <h2 className="text-xl font-semibold min-w-[200px] text-center">
              {view === 'month' && currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              {view === 'week' && `Semana de ${getWeekDays(currentDate)[0].toLocaleDateString('pt-BR')}`}
              {view === 'day' && currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h2>
            
            <Button variant="outline" size="sm" onClick={goToNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDateChange(new Date())}
                  >
                    Hoje
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ir para hoje</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {view === 'month' && renderMonthView()}
        {view === 'week' && renderWeekView()}
        {view === 'day' && renderDayView()}
      </CardContent>
    </Card>
  );
}

export default CalendarView;