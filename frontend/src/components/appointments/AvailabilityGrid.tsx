import React, { useState, useMemo } from 'react';
import { Calendar, Clock, User, Plus, Edit, Trash2, Save, X, AlertCircle, CheckCircle } from 'lucide-react';
import { DoctorAvailability, TimeSlot, AvailabilityPattern } from '../../types/appointments';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Alert, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

interface AvailabilityGridProps {
  doctorId: string;
  doctorName?: string;
  availability: DoctorAvailability[];
  onUpdateAvailability: (availability: DoctorAvailability[]) => Promise<void>;
  onCreatePattern?: (pattern: AvailabilityPattern) => Promise<void>;
  startDate?: Date;
  endDate?: Date;
  isLoading?: boolean;
  className?: string;
}

interface EditingSlot {
  date: string;
  slotIndex: number;
  slot: TimeSlot;
}

function AvailabilityGrid({
  doctorId,
  doctorName,
  availability,
  onUpdateAvailability,
  onCreatePattern,
  startDate = new Date(),
  endDate,
  isLoading = false,
  className
}: AvailabilityGridProps) {
  const [editingSlot, setEditingSlot] = useState<EditingSlot | null>(null);
  const [showPatternDialog, setShowPatternDialog] = useState(false);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [bulkEditMode, setBulkEditMode] = useState(false);

  // Gerar datas para a grade (próximas 2 semanas por padrão)
  const dateRange = useMemo(() => {
    const dates = [];
    const start = new Date(startDate);
    const end = endDate || new Date(start.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 dias
    
    const current = new Date(start);
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  }, [startDate, endDate]);

  // Horários padrão para a grade
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 7; hour <= 19; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  }, []);

  const getAvailabilityForDate = (date: Date): DoctorAvailability | undefined => {
    const dateStr = date.toISOString().split('T')[0];
    return availability.find(avail => avail.date === dateStr);
  };

  const getSlotForTime = (date: Date, time: string): TimeSlot | undefined => {
    const avail = getAvailabilityForDate(date);
    return avail?.timeSlots?.find(slot => slot.startTime === time);
  };

  const isSlotAvailable = (date: Date, time: string): boolean => {
    const slot = getSlotForTime(date, time);
    return slot?.isAvailable || false;
  };

  const isSlotBooked = (date: Date, time: string): boolean => {
    const slot = getSlotForTime(date, time);
    return slot?.isBooked || false;
  };

  const getSlotStatus = (date: Date, time: string): 'available' | 'unavailable' | 'booked' => {
    const slot = getSlotForTime(date, time);
    if (!slot) return 'unavailable';
    if (slot.isBooked) return 'booked';
    if (slot.isAvailable) return 'available';
    return 'unavailable';
  };

  const getSlotClassName = (date: Date, time: string) => {
    const status = getSlotStatus(date, time);
    const dateStr = date.toISOString().split('T')[0];
    const isSelected = selectedDates.includes(dateStr);
    
    const baseClasses = 'w-full h-8 text-xs border border-gray-200 cursor-pointer transition-all duration-200';
    
    const statusClasses = {
      available: 'bg-green-100 hover:bg-green-200 text-green-800',
      unavailable: 'bg-gray-50 hover:bg-gray-100 text-gray-400',
      booked: 'bg-red-100 text-red-800 cursor-not-allowed'
    };
    
    return cn(
      baseClasses,
      statusClasses[status],
      isSelected && bulkEditMode && 'ring-2 ring-blue-500'
    );
  };

  const handleSlotClick = (date: Date, time: string) => {
    if (bulkEditMode) {
      const dateStr = date.toISOString().split('T')[0];
      setSelectedDates(prev => 
        prev.includes(dateStr) 
          ? prev.filter(d => d !== dateStr)
          : [...prev, dateStr]
      );
      return;
    }

    const slot = getSlotForTime(date, time);
    if (slot?.isBooked) {
      toast.error('Este horário já está ocupado e não pode ser editado.');
      return;
    }

    const dateStr = date.toISOString().split('T')[0];
    const avail = getAvailabilityForDate(date);
    const slotIndex = avail?.timeSlots?.findIndex(s => s.startTime === time) || -1;
    
    if (slot && slotIndex >= 0) {
      setEditingSlot({ date: dateStr, slotIndex, slot });
    } else {
      // Criar novo slot
      const newSlot: TimeSlot = {
        id: `${dateStr}-${time}`,
        date: dateStr,
        startTime: time,
        endTime: calculateEndTime(time, 30),
        isAvailable: true,
        doctorId,
        duration: 30
      };
      
      toggleSlotAvailability(date, newSlot);
    }
  };

  const calculateEndTime = (startTime: string, duration: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const start = new Date();
    start.setHours(hours, minutes, 0, 0);
    start.setMinutes(start.getMinutes() + duration);
    
    return `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`;
  };

  const toggleSlotAvailability = async (date: Date, slot: TimeSlot) => {
    const dateStr = date.toISOString().split('T')[0];
    const updatedAvailability = [...availability];
    
    let dateAvailability = updatedAvailability.find(avail => avail.date === dateStr);
    
    if (!dateAvailability) {
      dateAvailability = {
        id: `${doctorId}-${dateStr}`,
        doctorId,
        date: dateStr,
        isAvailable: true,
        timeSlots: []
      };
      updatedAvailability.push(dateAvailability);
    }
    
    const existingSlotIndex = dateAvailability.timeSlots?.findIndex(s => s.startTime === slot.startTime) || -1;
    
    if (existingSlotIndex >= 0) {
      // Atualizar slot existente
      dateAvailability.timeSlots![existingSlotIndex] = {
        ...dateAvailability.timeSlots![existingSlotIndex],
        isAvailable: !dateAvailability.timeSlots![existingSlotIndex].isAvailable
      };
    } else {
      // Adicionar novo slot
      if (!dateAvailability.timeSlots) {
        dateAvailability.timeSlots = [];
      }
      dateAvailability.timeSlots.push(slot);
    }
    
    try {
      await onUpdateAvailability(updatedAvailability);
      toast.success('Disponibilidade atualizada com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar disponibilidade.');
    }
  };

  const handleBulkUpdate = async (isAvailable: boolean) => {
    const updatedAvailability = [...availability];
    
    selectedDates.forEach(dateStr => {
      let dateAvailability = updatedAvailability.find(avail => avail.date === dateStr);
      
      if (!dateAvailability) {
        dateAvailability = {
          id: `${doctorId}-${dateStr}`,
          doctorId,
          date: dateStr,
          isAvailable,
          timeSlots: []
        };
        updatedAvailability.push(dateAvailability);
      } else {
        dateAvailability.isAvailable = isAvailable;
      }
      
      // Atualizar todos os slots do dia
      if (dateAvailability.timeSlots) {
        dateAvailability.timeSlots.forEach(slot => {
          if (!slot.isBooked) {
            slot.isAvailable = isAvailable;
          }
        });
      }
    });
    
    try {
      await onUpdateAvailability(updatedAvailability);
      toast.success(`${selectedDates.length} dias atualizados com sucesso!`);
      setSelectedDates([]);
      setBulkEditMode(false);
    } catch (error) {
      toast.error('Erro ao atualizar disponibilidade em lote.');
    }
  };

  const saveEditingSlot = async () => {
    if (!editingSlot) return;
    
    const updatedAvailability = [...availability];
    const dateAvailability = updatedAvailability.find(avail => avail.date === editingSlot.date);
    
    if (dateAvailability && dateAvailability.timeSlots) {
      dateAvailability.timeSlots[editingSlot.slotIndex] = editingSlot.slot;
      
      try {
        await onUpdateAvailability(updatedAvailability);
        toast.success('Horário atualizado com sucesso!');
        setEditingSlot(null);
      } catch (error) {
        toast.error('Erro ao atualizar horário.');
      }
    }
  };

  const deleteSlot = async (date: Date, time: string) => {
    const dateStr = date.toISOString().split('T')[0];
    const updatedAvailability = [...availability];
    const dateAvailability = updatedAvailability.find(avail => avail.date === dateStr);
    
    if (dateAvailability && dateAvailability.timeSlots) {
      dateAvailability.timeSlots = dateAvailability.timeSlots.filter(slot => slot.startTime !== time);
      
      try {
        await onUpdateAvailability(updatedAvailability);
        toast.success('Horário removido com sucesso!');
      } catch (error) {
        toast.error('Erro ao remover horário.');
      }
    }
  };

  const getDateStats = (date: Date) => {
    const avail = getAvailabilityForDate(date);
    if (!avail || !avail.timeSlots) return { available: 0, booked: 0, total: 0 };
    
    const available = avail.timeSlots.filter(slot => slot.isAvailable && !slot.isBooked).length;
    const booked = avail.timeSlots.filter(slot => slot.isBooked).length;
    const total = avail.timeSlots.length;
    
    return { available, booked, total };
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando disponibilidade...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Cabeçalho */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Disponibilidade - {doctorName || 'Médico'}</span>
            </CardTitle>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={bulkEditMode ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setBulkEditMode(!bulkEditMode);
                  setSelectedDates([]);
                }}
              >
                {bulkEditMode ? 'Sair do Modo Lote' : 'Edição em Lote'}
              </Button>
              
              {onCreatePattern && (
                <Dialog open={showPatternDialog} onOpenChange={setShowPatternDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Padrão
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Criar Padrão de Disponibilidade</DialogTitle>
                    </DialogHeader>
                    {/* Conteúdo do diálogo seria implementado aqui */}
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* Controles de edição em lote */}
      {bulkEditMode && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Badge variant="secondary">
                  {selectedDates.length} dias selecionados
                </Badge>
                
                {selectedDates.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleBulkUpdate(true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marcar Disponível
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleBulkUpdate(false)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Marcar Indisponível
                    </Button>
                  </div>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDates([])}
              >
                Limpar Seleção
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Grade de disponibilidade */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Cabeçalho das datas */}
              <div className="grid grid-cols-[100px_1fr] border-b">
                <div className="p-3 bg-gray-50 border-r">
                  <span className="text-sm font-medium text-gray-600">Horário</span>
                </div>
                
                <div className={`grid grid-cols-${Math.min(dateRange.length, 7)} gap-0`}>
                  {dateRange.slice(0, 7).map((date, index) => {
                    const stats = getDateStats(date);
                    const isToday = date.toDateString() === new Date().toDateString();
                    const dateStr = date.toISOString().split('T')[0];
                    const isSelected = selectedDates.includes(dateStr);
                    
                    return (
                      <div
                        key={index}
                        className={cn(
                          'p-3 border-r border-gray-200 text-center cursor-pointer hover:bg-gray-50',
                          isToday && 'bg-blue-50',
                          isSelected && bulkEditMode && 'bg-blue-100 ring-2 ring-blue-500'
                        )}
                        onClick={() => bulkEditMode && handleSlotClick(date, '')}
                      >
                        <div className={cn(
                          'text-sm font-medium',
                          isToday && 'text-blue-600'
                        )}>
                          {date.toLocaleDateString('pt-BR', { weekday: 'short' })}
                        </div>
                        <div className={cn(
                          'text-lg font-bold',
                          isToday && 'text-blue-600'
                        )}>
                          {date.getDate()}
                        </div>
                        
                        {stats.total > 0 && (
                          <div className="mt-1 space-y-1">
                            <div className="text-xs text-green-600">
                              {stats.available} livre{stats.available !== 1 ? 's' : ''}
                            </div>
                            {stats.booked > 0 && (
                              <div className="text-xs text-red-600">
                                {stats.booked} ocupado{stats.booked !== 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Grade de horários */}
              <div className="max-h-[600px] overflow-y-auto">
                {timeSlots.map((time, timeIndex) => (
                  <div key={timeIndex} className="grid grid-cols-[100px_1fr] border-b border-gray-100">
                    <div className="p-2 bg-gray-50 border-r border-gray-200 flex items-center justify-center">
                      <span className="text-sm text-gray-600">{time}</span>
                    </div>
                    
                    <div className={`grid grid-cols-${Math.min(dateRange.length, 7)} gap-0`}>
                      {dateRange.slice(0, 7).map((date, dateIndex) => {
                        const slot = getSlotForTime(date, time);
                        const status = getSlotStatus(date, time);
                        
                        return (
                          <TooltipProvider key={dateIndex}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="relative border-r border-gray-200 h-10 flex items-center justify-center">
                                  <button
                                    className={getSlotClassName(date, time)}
                                    onClick={() => handleSlotClick(date, time)}
                                    disabled={status === 'booked'}
                                  >
                                    {status === 'available' && (
                                      <CheckCircle className="h-3 w-3 mx-auto" />
                                    )}
                                    {status === 'booked' && (
                                      <AlertCircle className="h-3 w-3 mx-auto" />
                                    )}
                                  </button>
                                  
                                  {slot && !slot.isBooked && (
                                    <div className="absolute -top-1 -right-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-4 w-4 p-0 hover:bg-red-100"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          deleteSlot(date, time);
                                        }}
                                      >
                                        <X className="h-2 w-2" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </TooltipTrigger>
                              
                              <TooltipContent>
                                <div className="text-center">
                                  <p className="font-medium">
                                    {date.toLocaleDateString('pt-BR')} - {time}
                                  </p>
                                  <p className="text-sm">
                                    {status === 'available' && 'Disponível'}
                                    {status === 'unavailable' && 'Indisponível'}
                                    {status === 'booked' && 'Ocupado'}
                                  </p>
                                  {slot?.duration && (
                                    <p className="text-xs text-gray-500">
                                      Duração: {slot.duration} min
                                    </p>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Legenda */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-100 border border-green-200 rounded flex items-center justify-center">
                <CheckCircle className="h-2 w-2 text-green-600" />
              </div>
              <span className="text-sm text-gray-600">Disponível</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded"></div>
              <span className="text-sm text-gray-600">Indisponível</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-100 border border-red-200 rounded flex items-center justify-center">
                <AlertCircle className="h-2 w-2 text-red-600" />
              </div>
              <span className="text-sm text-gray-600">Ocupado</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Dialog de edição de slot */}
      {editingSlot && (
        <Dialog open={!!editingSlot} onOpenChange={() => setEditingSlot(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Horário</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Horário Início</Label>
                  <Input
                    type="time"
                    value={editingSlot.slot.startTime}
                    onChange={(e) => setEditingSlot({
                      ...editingSlot,
                      slot: { ...editingSlot.slot, startTime: e.target.value }
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Duração (min)</Label>
                  <Select
                    value={editingSlot.slot.duration?.toString()}
                    onValueChange={(value) => setEditingSlot({
                      ...editingSlot,
                      slot: {
                        ...editingSlot.slot,
                        duration: parseInt(value),
                        endTime: calculateEndTime(editingSlot.slot.startTime, parseInt(value))
                      }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 min</SelectItem>
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="45">45 min</SelectItem>
                      <SelectItem value="60">60 min</SelectItem>
                      <SelectItem value="90">90 min</SelectItem>
                      <SelectItem value="120">120 min</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Label>Disponível</Label>
                <Switch
                  checked={editingSlot.slot.isAvailable}
                  onCheckedChange={(checked) => setEditingSlot({
                    ...editingSlot,
                    slot: { ...editingSlot.slot, isAvailable: checked }
                  })}
                />
              </div>
              
              <div className="flex items-center justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditingSlot(null)}
                >
                  Cancelar
                </Button>
                
                <Button onClick={saveEditingSlot}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default AvailabilityGrid;