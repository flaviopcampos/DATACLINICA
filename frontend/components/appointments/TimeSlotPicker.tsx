'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Clock,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { format, addMinutes, isBefore, isAfter, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { TimeSlot, Doctor, AppointmentType } from '@/types/appointments';
import { cn } from '@/lib/utils';

interface TimeSlotPickerProps {
  selectedDate: Date;
  selectedDoctor?: Doctor;
  appointmentType?: AppointmentType;
  duration?: number;
  availableSlots: TimeSlot[];
  selectedSlot?: TimeSlot;
  onSlotSelect: (slot: TimeSlot) => void;
  onDoctorChange?: (doctor: Doctor) => void;
  onTypeChange?: (type: AppointmentType) => void;
  onDurationChange?: (duration: number) => void;
  onRefresh?: () => void;
  doctors?: Doctor[];
  loading?: boolean;
  error?: string;
  className?: string;
}

const appointmentTypes: { value: AppointmentType; label: string; duration: number; color: string }[] = [
  { value: 'consultation', label: 'Consulta', duration: 30, color: 'bg-blue-100 text-blue-800' },
  { value: 'follow_up', label: 'Retorno', duration: 20, color: 'bg-green-100 text-green-800' },
  { value: 'procedure', label: 'Procedimento', duration: 60, color: 'bg-purple-100 text-purple-800' },
  { value: 'emergency', label: 'Emergência', duration: 45, color: 'bg-red-100 text-red-800' },
  { value: 'routine_checkup', label: 'Check-up', duration: 40, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'specialist_consultation', label: 'Especialista', duration: 50, color: 'bg-indigo-100 text-indigo-800' }
];

const durationOptions = [15, 20, 30, 40, 45, 60, 90, 120];

export function TimeSlotPicker({
  selectedDate,
  selectedDoctor,
  appointmentType,
  duration = 30,
  availableSlots,
  selectedSlot,
  onSlotSelect,
  onDoctorChange,
  onTypeChange,
  onDurationChange,
  onRefresh,
  doctors = [],
  loading = false,
  error,
  className
}: TimeSlotPickerProps) {
  const [timeFilter, setTimeFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');
  const [showUnavailable, setShowUnavailable] = useState(false);

  // Filtrar slots por período do dia
  const filterSlotsByTime = (slots: TimeSlot[]) => {
    if (timeFilter === 'all') return slots;
    
    return slots.filter(slot => {
      const hour = parseInt(slot.start_time.split(':')[0]);
      switch (timeFilter) {
        case 'morning':
          return hour >= 6 && hour < 12;
        case 'afternoon':
          return hour >= 12 && hour < 18;
        case 'evening':
          return hour >= 18 && hour <= 23;
        default:
          return true;
      }
    });
  };

  // Filtrar slots disponíveis/indisponíveis
  const filterSlotsByAvailability = (slots: TimeSlot[]) => {
    if (showUnavailable) return slots;
    return slots.filter(slot => slot.is_available);
  };

  // Aplicar todos os filtros
  const filteredSlots = filterSlotsByAvailability(filterSlotsByTime(availableSlots));

  // Agrupar slots por período do dia
  const groupSlotsByPeriod = (slots: TimeSlot[]) => {
    const groups = {
      morning: slots.filter(slot => {
        const hour = parseInt(slot.start_time.split(':')[0]);
        return hour >= 6 && hour < 12;
      }),
      afternoon: slots.filter(slot => {
        const hour = parseInt(slot.start_time.split(':')[0]);
        return hour >= 12 && hour < 18;
      }),
      evening: slots.filter(slot => {
        const hour = parseInt(slot.start_time.split(':')[0]);
        return hour >= 18 && hour <= 23;
      })
    };
    
    return groups;
  };

  const slotGroups = groupSlotsByPeriod(filteredSlots);

  // Renderizar slot individual
  const renderSlot = (slot: TimeSlot) => {
    const isSelected = selectedSlot?.start_time === slot.start_time;
    const endTime = format(
      addMinutes(new Date(`2000-01-01T${slot.start_time}`), duration),
      'HH:mm'
    );

    return (
      <Button
        key={slot.start_time}
        variant={isSelected ? 'default' : slot.is_available ? 'outline' : 'ghost'}
        size="sm"
        className={cn(
          'h-auto p-3 flex flex-col items-center justify-center transition-all',
          isSelected && 'ring-2 ring-blue-500',
          !slot.is_available && 'opacity-50 cursor-not-allowed',
          slot.is_available && !isSelected && 'hover:bg-blue-50 hover:border-blue-300'
        )}
        onClick={() => slot.is_available && onSlotSelect(slot)}
        disabled={!slot.is_available || loading}
      >
        <div className="flex items-center space-x-1 text-sm font-medium">
          <Clock className="h-3 w-3" />
          <span>{slot.start_time}</span>
        </div>
        
        <div className="text-xs text-gray-500 mt-1">
          {slot.start_time} - {endTime}
        </div>
        
        {!slot.is_available && (
          <div className="flex items-center space-x-1 text-xs text-red-600 mt-1">
            <XCircle className="h-3 w-3" />
            <span>Ocupado</span>
          </div>
        )}
        
        {slot.is_available && slot.is_preferred && (
          <div className="flex items-center space-x-1 text-xs text-green-600 mt-1">
            <CheckCircle className="h-3 w-3" />
            <span>Recomendado</span>
          </div>
        )}
      </Button>
    );
  };

  // Renderizar grupo de slots
  const renderSlotGroup = (title: string, slots: TimeSlot[]) => {
    if (slots.length === 0) return null;

    return (
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
          <span>{title}</span>
          <Badge variant="secondary" className="text-xs">
            {slots.filter(s => s.is_available).length} disponíveis
          </Badge>
        </h4>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {slots.map(renderSlot)}
        </div>
      </div>
    );
  };

  // Renderizar filtros
  const renderFilters = () => (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Período:</span>
        <Select value={timeFilter} onValueChange={(value: any) => setTimeFilter(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="morning">Manhã</SelectItem>
            <SelectItem value="afternoon">Tarde</SelectItem>
            <SelectItem value="evening">Noite</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {doctors.length > 0 && onDoctorChange && (
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Médico:</span>
          <Select 
            value={selectedDoctor?.id?.toString()} 
            onValueChange={(value) => {
              const doctor = doctors.find(d => d.id?.toString() === value);
              if (doctor) onDoctorChange(doctor);
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Selecione um médico" />
            </SelectTrigger>
            <SelectContent>
              {doctors.map(doctor => (
                <SelectItem key={doctor.id} value={doctor.id?.toString() || ''}>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{doctor.name}</span>
                    {doctor.specialty && (
                      <span className="text-xs text-gray-500">({doctor.specialty})</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {onTypeChange && (
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Tipo:</span>
          <Select 
            value={appointmentType} 
            onValueChange={(value: AppointmentType) => {
              onTypeChange(value);
              const type = appointmentTypes.find(t => t.value === value);
              if (type && onDurationChange) {
                onDurationChange(type.duration);
              }
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Tipo de consulta" />
            </SelectTrigger>
            <SelectContent>
              {appointmentTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={cn('text-xs', type.color)}>
                      {type.label}
                    </Badge>
                    <span className="text-xs text-gray-500">({type.duration}min)</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {onDurationChange && (
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Duração:</span>
          <Select 
            value={duration.toString()} 
            onValueChange={(value) => onDurationChange(parseInt(value))}
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {durationOptions.map(dur => (
                <SelectItem key={dur} value={dur.toString()}>
                  {dur}min
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowUnavailable(!showUnavailable)}
        className={showUnavailable ? 'bg-gray-100' : ''}
      >
        {showUnavailable ? 'Ocultar indisponíveis' : 'Mostrar indisponíveis'}
      </Button>
      
      {onRefresh && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
        </Button>
      )}
    </div>
  );

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar horários</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            {onRefresh && (
              <Button onClick={onRefresh} disabled={loading}>
                <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
                Tentar novamente
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Horários Disponíveis</span>
          <Badge variant="outline">
            {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
          </Badge>
        </CardTitle>
        
        {selectedDoctor && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span>{selectedDoctor.name}</span>
            {selectedDoctor.specialty && (
              <Badge variant="secondary" className="text-xs">
                {selectedDoctor.specialty}
              </Badge>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {renderFilters()}
        
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-32" />
            <div className="grid grid-cols-6 gap-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          </div>
        ) : filteredSlots.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum horário disponível
            </h3>
            <p className="text-gray-500">
              Não há horários disponíveis para a data e filtros selecionados.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {renderSlotGroup('Manhã (06:00 - 12:00)', slotGroups.morning)}
            {renderSlotGroup('Tarde (12:00 - 18:00)', slotGroups.afternoon)}
            {renderSlotGroup('Noite (18:00 - 23:00)', slotGroups.evening)}
          </div>
        )}
        
        {selectedSlot && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2 text-blue-800">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">Horário selecionado:</span>
              <span>
                {selectedSlot.start_time} - {format(
                  addMinutes(new Date(`2000-01-01T${selectedSlot.start_time}`), duration),
                  'HH:mm'
                )}
              </span>
              <span className="text-sm">({duration} minutos)</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}