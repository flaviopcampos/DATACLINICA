'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Calendar,
  Clock,
  User,
  Plus,
  Edit,
  Trash2,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings
} from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Doctor, AppointmentAvailability, TimeSlot, AvailabilityRule } from '@/types/appointments';
import { cn } from '@/lib/utils';

interface AvailabilityGridProps {
  doctors: Doctor[];
  availability: AppointmentAvailability[];
  availabilityRules: AvailabilityRule[];
  selectedWeek: Date;
  onWeekChange: (date: Date) => void;
  onAvailabilityUpdate: (doctorId: string, date: string, slots: TimeSlot[]) => Promise<void>;
  onRuleCreate: (rule: Omit<AvailabilityRule, 'id'>) => Promise<void>;
  onRuleUpdate: (ruleId: string, rule: Partial<AvailabilityRule>) => Promise<void>;
  onRuleDelete: (ruleId: string) => Promise<void>;
  onRefresh: () => void;
  loading?: boolean;
  className?: string;
}

interface SlotEditDialogProps {
  doctor: Doctor;
  date: Date;
  slots: TimeSlot[];
  onSave: (slots: TimeSlot[]) => Promise<void>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface RuleDialogProps {
  doctors: Doctor[];
  rule?: AvailabilityRule;
  onSave: (rule: Omit<AvailabilityRule, 'id'> | AvailabilityRule) => Promise<void>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const timeSlots = [
  '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00', '20:30'
];

const weekDays = [
  { key: 'monday', label: 'Segunda' },
  { key: 'tuesday', label: 'Terça' },
  { key: 'wednesday', label: 'Quarta' },
  { key: 'thursday', label: 'Quinta' },
  { key: 'friday', label: 'Sexta' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' }
];

function SlotEditDialog({ doctor, date, slots, onSave, open, onOpenChange }: SlotEditDialogProps) {
  const [editingSlots, setEditingSlots] = useState<TimeSlot[]>(slots);
  const [newSlotStart, setNewSlotStart] = useState('');
  const [newSlotEnd, setNewSlotEnd] = useState('');

  const handleAddSlot = () => {
    if (newSlotStart && newSlotEnd) {
      const newSlot: TimeSlot = {
        id: `temp-${Date.now()}`,
        start_time: newSlotStart,
        end_time: newSlotEnd,
        is_available: true,
        appointment_id: null
      };
      setEditingSlots([...editingSlots, newSlot]);
      setNewSlotStart('');
      setNewSlotEnd('');
    }
  };

  const handleRemoveSlot = (slotId: string) => {
    setEditingSlots(editingSlots.filter(slot => slot.id !== slotId));
  };

  const handleToggleAvailability = (slotId: string) => {
    setEditingSlots(editingSlots.map(slot => 
      slot.id === slotId 
        ? { ...slot, is_available: !slot.is_available }
        : slot
    ));
  };

  const handleSave = async () => {
    await onSave(editingSlots);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Disponibilidade</DialogTitle>
          <DialogDescription>
            {doctor.name} - {format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Adicionar novo slot */}
          <div className="flex items-end space-x-2 p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <Label htmlFor="start-time">Início</Label>
              <Select value={newSlotStart} onValueChange={setNewSlotStart}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map(time => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="end-time">Fim</Label>
              <Select value={newSlotEnd} onValueChange={setNewSlotEnd}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map(time => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddSlot} disabled={!newSlotStart || !newSlotEnd}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Lista de slots */}
          <div className="space-y-2">
            {editingSlots.map(slot => (
              <div key={slot.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">
                      {slot.start_time} - {slot.end_time}
                    </span>
                  </div>
                  <Badge 
                    variant={slot.is_available ? "default" : "secondary"}
                    className={slot.is_available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                  >
                    {slot.is_available ? 'Disponível' : 'Indisponível'}
                  </Badge>
                  {slot.appointment_id && (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      Agendado
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleAvailability(slot.id)}
                    disabled={!!slot.appointment_id}
                  >
                    {slot.is_available ? (
                      <XCircle className="h-4 w-4" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveSlot(slot.id)}
                    disabled={!!slot.appointment_id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RuleDialog({ doctors, rule, onSave, open, onOpenChange }: RuleDialogProps) {
  const [formData, setFormData] = useState({
    doctor_id: rule?.doctor_id?.toString() || '',
    day_of_week: rule?.day_of_week || 'monday',
    start_time: rule?.start_time || '08:00',
    end_time: rule?.end_time || '17:00',
    is_active: rule?.is_active ?? true,
    break_start: rule?.break_start || '12:00',
    break_end: rule?.break_end || '13:00',
    slot_duration: rule?.slot_duration || 30
  });

  const handleSave = async () => {
    const ruleData = {
      ...formData,
      doctor_id: parseInt(formData.doctor_id),
      slot_duration: parseInt(formData.slot_duration.toString())
    };

    if (rule) {
      await onSave({ ...rule, ...ruleData });
    } else {
      await onSave(ruleData);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {rule ? 'Editar Regra' : 'Nova Regra de Disponibilidade'}
          </DialogTitle>
          <DialogDescription>
            Configure os horários padrão de atendimento
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="doctor">Médico</Label>
            <Select 
              value={formData.doctor_id} 
              onValueChange={(value) => setFormData({...formData, doctor_id: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um médico" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map(doctor => (
                  <SelectItem key={doctor.id} value={doctor.id?.toString() || ''}>
                    {doctor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="day">Dia da Semana</Label>
            <Select 
              value={formData.day_of_week} 
              onValueChange={(value) => setFormData({...formData, day_of_week: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {weekDays.map(day => (
                  <SelectItem key={day.key} value={day.key}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start">Início</Label>
              <Select 
                value={formData.start_time} 
                onValueChange={(value) => setFormData({...formData, start_time: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map(time => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="end">Fim</Label>
              <Select 
                value={formData.end_time} 
                onValueChange={(value) => setFormData({...formData, end_time: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map(time => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="break-start">Início do Intervalo</Label>
              <Select 
                value={formData.break_start} 
                onValueChange={(value) => setFormData({...formData, break_start: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map(time => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="break-end">Fim do Intervalo</Label>
              <Select 
                value={formData.break_end} 
                onValueChange={(value) => setFormData({...formData, break_end: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map(time => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="duration">Duração do Slot (minutos)</Label>
            <Input
              type="number"
              min="15"
              max="120"
              step="15"
              value={formData.slot_duration}
              onChange={(e) => setFormData({...formData, slot_duration: parseInt(e.target.value)})}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.is_active}
              onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
              className="h-4 w-4"
            />
            <Label htmlFor="active">Regra ativa</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            {rule ? 'Atualizar' : 'Criar'} Regra
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AvailabilityGrid({
  doctors,
  availability,
  availabilityRules,
  selectedWeek,
  onWeekChange,
  onAvailabilityUpdate,
  onRuleCreate,
  onRuleUpdate,
  onRuleDelete,
  onRefresh,
  loading = false,
  className
}: AvailabilityGridProps) {
  const [selectedDoctor, setSelectedDoctor] = useState<string>('all');
  const [editingSlot, setEditingSlot] = useState<{
    doctor: Doctor;
    date: Date;
    slots: TimeSlot[];
  } | null>(null);
  const [ruleDialog, setRuleDialog] = useState<{
    open: boolean;
    rule?: AvailabilityRule;
  }>({ open: false });

  const weekDates = useMemo(() => {
    const start = startOfWeek(selectedWeek, { weekStartsOn: 1 });
    const end = endOfWeek(selectedWeek, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [selectedWeek]);

  const filteredDoctors = useMemo(() => {
    return selectedDoctor === 'all' 
      ? doctors 
      : doctors.filter(doctor => doctor.id?.toString() === selectedDoctor);
  }, [doctors, selectedDoctor]);

  const getAvailabilityForDoctorAndDate = (doctorId: string, date: Date) => {
    return availability.find(avail => 
      avail.doctor_id?.toString() === doctorId && 
      isSameDay(parseISO(avail.date), date)
    );
  };

  const getRulesForDoctor = (doctorId: string) => {
    return availabilityRules.filter(rule => 
      rule.doctor_id?.toString() === doctorId && rule.is_active
    );
  };

  const handleSlotEdit = (doctor: Doctor, date: Date) => {
    const avail = getAvailabilityForDoctorAndDate(doctor.id?.toString() || '', date);
    setEditingSlot({
      doctor,
      date,
      slots: avail?.slots || []
    });
  };

  const handleSlotSave = async (slots: TimeSlot[]) => {
    if (editingSlot) {
      await onAvailabilityUpdate(
        editingSlot.doctor.id?.toString() || '',
        format(editingSlot.date, 'yyyy-MM-dd'),
        slots
      );
      setEditingSlot(null);
    }
  };

  const handleRuleSave = async (rule: Omit<AvailabilityRule, 'id'> | AvailabilityRule) => {
    if ('id' in rule) {
      await onRuleUpdate(rule.id, rule);
    } else {
      await onRuleCreate(rule);
    }
    setRuleDialog({ open: false });
  };

  const getSlotStatusColor = (avail: AppointmentAvailability | undefined) => {
    if (!avail || !avail.slots.length) return 'bg-gray-100';
    
    const availableSlots = avail.slots.filter(slot => slot.is_available);
    const occupiedSlots = avail.slots.filter(slot => !slot.is_available || slot.appointment_id);
    
    if (availableSlots.length === 0) return 'bg-red-100';
    if (occupiedSlots.length === 0) return 'bg-green-100';
    return 'bg-yellow-100';
  };

  const getSlotStatusText = (avail: AppointmentAvailability | undefined) => {
    if (!avail || !avail.slots.length) return 'Sem horários';
    
    const availableSlots = avail.slots.filter(slot => slot.is_available);
    const totalSlots = avail.slots.length;
    
    return `${availableSlots.length}/${totalSlots} disponíveis`;
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Grade de Disponibilidade</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
              >
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              </Button>
              <Dialog 
                open={ruleDialog.open} 
                onOpenChange={(open) => setRuleDialog({ open })}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Regras
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onWeekChange(addDays(selectedWeek, -7))}
              >
                ←
              </Button>
              <span className="font-medium">
                {format(weekDates[0], "dd 'de' MMM", { locale: ptBR })} - {format(weekDates[6], "dd 'de' MMM 'de' yyyy", { locale: ptBR })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onWeekChange(addDays(selectedWeek, 7))}
              >
                →
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os médicos</SelectItem>
                  {doctors.map(doctor => (
                    <SelectItem key={doctor.id} value={doctor.id?.toString() || ''}>
                      {doctor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Cabeçalho dos dias */}
              <div className="grid grid-cols-8 gap-2 mb-4">
                <div className="font-medium text-sm text-gray-500 p-2">
                  Médico
                </div>
                {weekDates.map(date => (
                  <div key={date.toISOString()} className="text-center p-2">
                    <div className="font-medium text-sm">
                      {format(date, 'EEE', { locale: ptBR })}
                    </div>
                    <div className="text-xs text-gray-500">
                      {format(date, 'dd/MM')}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Grid de disponibilidade */}
              <div className="space-y-2">
                {filteredDoctors.map(doctor => (
                  <div key={doctor.id} className="grid grid-cols-8 gap-2">
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="font-medium text-sm">{doctor.name}</div>
                          {doctor.specialty && (
                            <div className="text-xs text-gray-500">{doctor.specialty}</div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {weekDates.map(date => {
                      const avail = getAvailabilityForDoctorAndDate(doctor.id?.toString() || '', date);
                      const rules = getRulesForDoctor(doctor.id?.toString() || '');
                      const hasRules = rules.length > 0;
                      
                      return (
                        <TooltipProvider key={date.toISOString()}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={cn(
                                  "p-3 rounded-lg border-2 border-dashed cursor-pointer transition-colors",
                                  getSlotStatusColor(avail),
                                  "hover:border-blue-300"
                                )}
                                onClick={() => handleSlotEdit(doctor, date)}
                              >
                                <div className="text-center">
                                  <div className="text-xs font-medium">
                                    {getSlotStatusText(avail)}
                                  </div>
                                  {hasRules && (
                                    <div className="flex justify-center mt-1">
                                      <Settings className="h-3 w-3 text-blue-500" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="space-y-1">
                                <div className="font-medium">
                                  {doctor.name} - {format(date, "dd 'de' MMM", { locale: ptBR })}
                                </div>
                                <div className="text-sm">
                                  {getSlotStatusText(avail)}
                                </div>
                                {hasRules && (
                                  <div className="text-xs text-blue-600">
                                    {rules.length} regra(s) ativa(s)
                                  </div>
                                )}
                                <div className="text-xs text-gray-500">
                                  Clique para editar
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Legenda */}
          <div className="flex items-center justify-center space-x-6 mt-6 pt-4 border-t">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-100 border rounded"></div>
              <span className="text-sm text-gray-600">Totalmente disponível</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-100 border rounded"></div>
              <span className="text-sm text-gray-600">Parcialmente ocupado</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-100 border rounded"></div>
              <span className="text-sm text-gray-600">Totalmente ocupado</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-100 border rounded"></div>
              <span className="text-sm text-gray-600">Sem horários</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Dialog de edição de slots */}
      {editingSlot && (
        <SlotEditDialog
          doctor={editingSlot.doctor}
          date={editingSlot.date}
          slots={editingSlot.slots}
          onSave={handleSlotSave}
          open={!!editingSlot}
          onOpenChange={(open) => !open && setEditingSlot(null)}
        />
      )}
      
      {/* Dialog de regras */}
      <RuleDialog
        doctors={doctors}
        rule={ruleDialog.rule}
        onSave={handleRuleSave}
        open={ruleDialog.open}
        onOpenChange={(open) => setRuleDialog({ open })}
      />
    </div>
  );
}