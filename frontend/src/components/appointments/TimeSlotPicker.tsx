import React, { useState, useMemo } from 'react';
import { Clock, Calendar, User, AlertCircle, CheckCircle } from 'lucide-react';
import { TimeSlot, DoctorAvailability } from '../../types/appointments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface TimeSlotPickerProps {
  date: Date;
  doctorId?: string;
  availability?: DoctorAvailability[];
  selectedSlot?: TimeSlot;
  onSlotSelect: (slot: TimeSlot) => void;
  duration?: number; // em minutos
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

function TimeSlotPicker({
  date,
  doctorId,
  availability = [],
  selectedSlot,
  onSlotSelect,
  duration = 30,
  isLoading = false,
  disabled = false,
  className
}: TimeSlotPickerProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'morning' | 'afternoon' | 'evening' | 'all'>('all');

  // Gerar slots de tempo baseado na disponibilidade
  const timeSlots = useMemo(() => {
    const slots: TimeSlot[] = [];
    const dateStr = date.toISOString().split('T')[0];
    
    // Horários padrão se não houver disponibilidade específica
    const defaultHours = {
      morning: { start: 7, end: 12 },
      afternoon: { start: 13, end: 18 },
      evening: { start: 19, end: 22 }
    };
    
    if (availability.length === 0) {
      // Usar horários padrão
      Object.entries(defaultHours).forEach(([period, { start, end }]) => {
        for (let hour = start; hour < end; hour++) {
          for (let minute = 0; minute < 60; minute += duration) {
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            const endTime = new Date(`${dateStr}T${time}`);
            endTime.setMinutes(endTime.getMinutes() + duration);
            const endTimeStr = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
            
            slots.push({
              id: `${dateStr}-${time}`,
              date: dateStr,
              startTime: time,
              endTime: endTimeStr,
              isAvailable: true,
              doctorId: doctorId || '',
              period: period as 'morning' | 'afternoon' | 'evening'
            });
          }
        }
      });
    } else {
      // Usar disponibilidade específica do médico
      availability.forEach(avail => {
        if (avail.date === dateStr && avail.isAvailable) {
          avail.timeSlots?.forEach(slot => {
            if (slot.isAvailable) {
              slots.push({
                ...slot,
                period: getPeriodFromTime(slot.startTime)
              });
            }
          });
        }
      });
    }
    
    return slots.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [date, availability, duration, doctorId]);

  const getPeriodFromTime = (time: string): 'morning' | 'afternoon' | 'evening' => {
    const hour = parseInt(time.split(':')[0]);
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  const getPeriodLabel = (period: string) => {
    const labels = {
      morning: 'Manhã',
      afternoon: 'Tarde',
      evening: 'Noite',
      all: 'Todos'
    };
    return labels[period as keyof typeof labels] || period;
  };

  const getPeriodIcon = (period: string) => {
    const icons = {
      morning: '🌅',
      afternoon: '☀️',
      evening: '🌙'
    };
    return icons[period as keyof typeof icons] || '';
  };

  const filteredSlots = useMemo(() => {
    if (selectedPeriod === 'all') return timeSlots;
    return timeSlots.filter(slot => slot.period === selectedPeriod);
  }, [timeSlots, selectedPeriod]);

  const availableSlots = filteredSlots.filter(slot => slot.isAvailable);
  const unavailableSlots = filteredSlots.filter(slot => !slot.isAvailable);

  const handleSlotClick = (slot: TimeSlot) => {
    if (disabled || !slot.isAvailable) return;
    onSlotSelect(slot);
  };

  const isSlotSelected = (slot: TimeSlot) => {
    return selectedSlot?.id === slot.id;
  };

  const getSlotStatus = (slot: TimeSlot) => {
    if (!slot.isAvailable) return 'unavailable';
    if (isSlotSelected(slot)) return 'selected';
    return 'available';
  };

  const getSlotClassName = (slot: TimeSlot) => {
    const status = getSlotStatus(slot);
    const baseClasses = 'p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer text-center';
    
    const statusClasses = {
      available: 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 bg-white',
      selected: 'border-blue-500 bg-blue-100 text-blue-700',
      unavailable: 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60'
    };
    
    return cn(baseClasses, statusClasses[status]);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando horários disponíveis...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Horários Disponíveis</span>
        </CardTitle>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>
            {date.toLocaleDateString('pt-BR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Filtros de período */}
        <div className="flex flex-wrap gap-2">
          {['all', 'morning', 'afternoon', 'evening'].map(period => {
            const isActive = selectedPeriod === period;
            return (
              <Button
                key={period}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod(period as any)}
                className="flex items-center space-x-1"
              >
                {period !== 'all' && (
                  <span className="text-sm">{getPeriodIcon(period)}</span>
                )}
                <span>{getPeriodLabel(period)}</span>
              </Button>
            );
          })}
        </div>
        
        {/* Estatísticas */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-600">
                {availableSlots.length} disponíveis
              </span>
            </div>
            
            <div className="flex items-center space-x-1">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-gray-600">
                {unavailableSlots.length} ocupados
              </span>
            </div>
          </div>
          
          {selectedSlot && (
            <Badge variant="secondary">
              Selecionado: {selectedSlot.startTime}
            </Badge>
          )}
        </div>
        
        {/* Lista de horários */}
        {filteredSlots.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Não há horários disponíveis para o período selecionado.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredSlots.map(slot => {
              const status = getSlotStatus(slot);
              
              return (
                <TooltipProvider key={slot.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={getSlotClassName(slot)}
                        onClick={() => handleSlotClick(slot)}
                      >
                        <div className="font-medium text-sm">
                          {slot.startTime}
                        </div>
                        
                        {slot.duration && (
                          <div className="text-xs text-gray-500 mt-1">
                            {slot.duration}min
                          </div>
                        )}
                        
                        {status === 'selected' && (
                          <CheckCircle className="h-4 w-4 mx-auto mt-1 text-blue-600" />
                        )}
                        
                        {status === 'unavailable' && (
                          <AlertCircle className="h-4 w-4 mx-auto mt-1 text-red-500" />
                        )}
                      </div>
                    </TooltipTrigger>
                    
                    <TooltipContent>
                      <div className="text-center">
                        <p className="font-medium">
                          {slot.startTime} - {slot.endTime}
                        </p>
                        
                        {slot.doctorName && (
                          <p className="text-sm text-gray-600">
                            Dr(a). {slot.doctorName}
                          </p>
                        )}
                        
                        <p className="text-xs text-gray-500">
                          {status === 'available' && 'Clique para selecionar'}
                          {status === 'selected' && 'Horário selecionado'}
                          {status === 'unavailable' && 'Horário ocupado'}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        )}
        
        {/* Legenda */}
        <div className="flex items-center justify-center space-x-6 pt-4 border-t">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded border-2 border-gray-200 bg-white"></div>
            <span className="text-sm text-gray-600">Disponível</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded border-2 border-blue-500 bg-blue-100"></div>
            <span className="text-sm text-gray-600">Selecionado</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded border-2 border-gray-100 bg-gray-50"></div>
            <span className="text-sm text-gray-600">Ocupado</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default TimeSlotPicker;