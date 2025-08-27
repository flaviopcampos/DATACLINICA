'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Plus,
  Filter,
  Grid3X3,
  List,
  CalendarDays
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Appointment, CalendarEvent, CalendarViewType } from '@/types/appointments';
import { AppointmentCard } from './AppointmentCard';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
  appointments: Appointment[];
  currentDate: Date;
  viewType: CalendarViewType;
  selectedDate?: Date;
  selectedAppointment?: Appointment;
  onDateChange: (date: Date) => void;
  onViewTypeChange: (viewType: CalendarViewType) => void;
  onDateSelect: (date: Date) => void;
  onAppointmentSelect: (appointment: Appointment) => void;
  onCreateAppointment?: (date: Date, time?: string) => void;
  onEditAppointment?: (appointment: Appointment) => void;
  onCancelAppointment?: (appointment: Appointment) => void;
  onConfirmAppointment?: (appointment: Appointment) => void;
  onRescheduleAppointment?: (appointment: Appointment) => void;
  loading?: boolean;
  className?: string;
}

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
  confirmed: 'bg-green-100 text-green-800 border-green-200',
  in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  no_show: 'bg-orange-100 text-orange-800 border-orange-200',
  rescheduled: 'bg-purple-100 text-purple-800 border-purple-200'
};

const viewTypeOptions = [
  { value: 'month', label: 'Mês', icon: Grid3X3 },
  { value: 'week', label: 'Semana', icon: CalendarDays },
  { value: 'day', label: 'Dia', icon: Calendar },
  { value: 'agenda', label: 'Agenda', icon: List }
];

export function CalendarView({
  appointments,
  currentDate,
  viewType,
  selectedDate,
  selectedAppointment,
  onDateChange,
  onViewTypeChange,
  onDateSelect,
  onAppointmentSelect,
  onCreateAppointment,
  onEditAppointment,
  onCancelAppointment,
  onConfirmAppointment,
  onRescheduleAppointment,
  loading = false,
  className
}: CalendarViewProps) {
  const [showFilters, setShowFilters] = useState(false);

  // Navegação
  const navigatePrevious = () => {
    switch (viewType) {
      case 'month':
        onDateChange(subMonths(currentDate, 1));
        break;
      case 'week':
        onDateChange(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));
        break;
      case 'day':
        onDateChange(new Date(currentDate.getTime() - 24 * 60 * 60 * 1000));
        break;
    }
  };

  const navigateNext = () => {
    switch (viewType) {
      case 'month':
        onDateChange(addMonths(currentDate, 1));
        break;
      case 'week':
        onDateChange(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000));
        break;
      case 'day':
        onDateChange(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000));
        break;
    }
  };

  const navigateToday = () => {
    onDateChange(new Date());
  };

  // Filtrar agendamentos por data
  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(appointment => 
      isSameDay(new Date(appointment.appointment_date), date)
    );
  };

  // Renderizar cabeçalho
  const renderHeader = () => {
    let title = '';
    switch (viewType) {
      case 'month':
        title = format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });
        break;
      case 'week':
        const weekStart = startOfWeek(currentDate, { locale: ptBR });
        const weekEnd = endOfWeek(currentDate, { locale: ptBR });
        title = `${format(weekStart, 'dd MMM', { locale: ptBR })} - ${format(weekEnd, 'dd MMM yyyy', { locale: ptBR })}`;
        break;
      case 'day':
        title = format(currentDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
        break;
      case 'agenda':
        title = 'Agenda de Agendamentos';
        break;
    }

    return (
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <CardTitle className="text-xl font-semibold capitalize">
              {title}
            </CardTitle>
            
            {viewType !== 'agenda' && (
              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={navigatePrevious}
                  disabled={loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={navigateToday}
                  disabled={loading}
                >
                  Hoje
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={navigateNext}
                  disabled={loading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Select value={viewType} onValueChange={(value: CalendarViewType) => onViewTypeChange(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {viewTypeOptions.map(option => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4" />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
            
            {onCreateAppointment && (
              <Button
                size="sm"
                onClick={() => onCreateAppointment(selectedDate || currentDate)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Agendamento
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
    );
  };

  // Renderizar visualização mensal
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { locale: ptBR });
    const calendarEnd = endOfWeek(monthEnd, { locale: ptBR });
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

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
          {days.map(day => {
            const dayAppointments = getAppointmentsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isDayToday = isToday(day);
            
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  'min-h-[120px] p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors',
                  !isCurrentMonth && 'bg-gray-50 text-gray-400',
                  isSelected && 'ring-2 ring-blue-500 bg-blue-50',
                  isDayToday && 'bg-blue-100 border-blue-300'
                )}
                onClick={() => onDateSelect(day)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={cn(
                    'text-sm font-medium',
                    isDayToday && 'text-blue-600 font-bold'
                  )}>
                    {format(day, 'd')}
                  </span>
                  
                  {dayAppointments.length > 0 && (
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      {dayAppointments.length}
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-1">
                  {dayAppointments.slice(0, 3).map(appointment => (
                    <div
                      key={appointment.id}
                      className={cn(
                        'text-xs p-1 rounded truncate cursor-pointer',
                        statusColors[appointment.status]
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAppointmentSelect(appointment);
                      }}
                    >
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{appointment.appointment_time}</span>
                      </div>
                      <div className="truncate">
                        {appointment.patient?.name || 'Paciente'}
                      </div>
                    </div>
                  ))}
                  
                  {dayAppointments.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayAppointments.length - 3} mais
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

  // Renderizar visualização de agenda
  const renderAgendaView = () => {
    const sortedAppointments = [...appointments].sort((a, b) => {
      const dateA = new Date(`${a.appointment_date}T${a.appointment_time}`);
      const dateB = new Date(`${b.appointment_date}T${b.appointment_time}`);
      return dateA.getTime() - dateB.getTime();
    });

    if (sortedAppointments.length === 0) {
      return (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum agendamento encontrado</h3>
          <p className="text-gray-500">Não há agendamentos para o período selecionado.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {sortedAppointments.map(appointment => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            onEdit={onEditAppointment}
            onCancel={onCancelAppointment}
            onConfirm={onConfirmAppointment}
            onReschedule={onRescheduleAppointment}
            className="cursor-pointer"
            onClick={() => onAppointmentSelect(appointment)}
          />
        ))}
      </div>
    );
  };

  // Renderizar conteúdo baseado no tipo de visualização
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    switch (viewType) {
      case 'month':
        return renderMonthView();
      case 'week':
        // TODO: Implementar visualização semanal
        return <div className="text-center py-12 text-gray-500">Visualização semanal em desenvolvimento</div>;
      case 'day':
        // TODO: Implementar visualização diária
        return <div className="text-center py-12 text-gray-500">Visualização diária em desenvolvimento</div>;
      case 'agenda':
        return renderAgendaView();
      default:
        return renderMonthView();
    }
  };

  return (
    <Card className={cn('w-full', className)}>
      {renderHeader()}
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}