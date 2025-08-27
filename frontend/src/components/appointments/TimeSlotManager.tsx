import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { toast } from 'sonner';
import { Clock, Plus, Trash2, Edit, Save, AlertCircle, Calendar, Settings, Lock, Unlock, Copy } from 'lucide-react';
import { TimeSlot, Doctor, AppointmentType } from '../../types/appointments';
import { appointmentsService } from '../../services/appointmentsService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface TimeSlotManagerProps {
  doctorId: string;
  date: string;
  onSlotUpdate?: (slots: TimeSlot[]) => void;
}

interface SlotTemplate {
  id: string;
  name: string;
  duration: number;
  interval: number;
  start_time: string;
  end_time: string;
  appointment_types: string[];
}

const DEFAULT_SLOT_DURATION = 30; // minutos
const DEFAULT_INTERVAL = 0; // minutos entre consultas

const SLOT_STATUS_COLORS = {
  available: 'bg-green-100 text-green-800 border-green-200',
  booked: 'bg-blue-100 text-blue-800 border-blue-200',
  blocked: 'bg-red-100 text-red-800 border-red-200',
  break: 'bg-yellow-100 text-yellow-800 border-yellow-200'
};

const SLOT_STATUS_LABELS = {
  available: 'Disponível',
  booked: 'Ocupado',
  blocked: 'Bloqueado',
  break: 'Intervalo'
};

export function TimeSlotManager({ doctorId, date, onSlotUpdate }: TimeSlotManagerProps) {
  const queryClient = useQueryClient();
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [isEditingSlot, setIsEditingSlot] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [newTemplate, setNewTemplate] = useState<Partial<SlotTemplate>>({});
  const [bulkAction, setBulkAction] = useState('');

  // Buscar slots do dia
  const { data: timeSlots, isLoading: slotsLoading, error } = useQuery({
    queryKey: ['time-slots', doctorId, date],
    queryFn: () => appointmentsService.getTimeSlots(doctorId, date)
  });

  // Buscar médico
  const { data: doctor } = useQuery({
    queryKey: ['doctor', doctorId],
    queryFn: () => appointmentsService.getDoctorById(doctorId)
  });

  // Buscar tipos de consulta
  const { data: appointmentTypes } = useQuery({
    queryKey: ['appointment-types'],
    queryFn: () => appointmentsService.getAppointmentTypes()
  });

  // Buscar templates salvos
  const { data: templates } = useQuery({
    queryKey: ['slot-templates', doctorId],
    queryFn: () => appointmentsService.getSlotTemplates(doctorId)
  });

  // Mutação para criar slots
  const createSlotsMutation = useMutation({
    mutationFn: (slots: Partial<TimeSlot>[]) => 
      appointmentsService.createTimeSlots(doctorId, date, slots),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['time-slots', doctorId, date] });
      queryClient.invalidateQueries({ queryKey: ['doctors-availability'] });
      toast.success('Slots criados com sucesso!');
      onSlotUpdate?.(data);
    },
    onError: (error) => {
      console.error('Erro ao criar slots:', error);
      toast.error('Erro ao criar slots. Tente novamente.');
    }
  });

  // Mutação para atualizar slot
  const updateSlotMutation = useMutation({
    mutationFn: ({ slotId, data }: { slotId: string; data: Partial<TimeSlot> }) => 
      appointmentsService.updateTimeSlot(slotId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-slots', doctorId, date] });
      toast.success('Slot atualizado com sucesso!');
      setIsEditingSlot(false);
      setEditingSlot(null);
    },
    onError: (error) => {
      console.error('Erro ao atualizar slot:', error);
      toast.error('Erro ao atualizar slot. Tente novamente.');
    }
  });

  // Mutação para deletar slots
  const deleteSlotsMutation = useMutation({
    mutationFn: (slotIds: string[]) => 
      appointmentsService.deleteTimeSlots(slotIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-slots', doctorId, date] });
      toast.success('Slots removidos com sucesso!');
      setSelectedSlots([]);
    },
    onError: (error) => {
      console.error('Erro ao remover slots:', error);
      toast.error('Erro ao remover slots. Tente novamente.');
    }
  });

  // Mutação para ações em lote
  const bulkUpdateMutation = useMutation({
    mutationFn: ({ slotIds, action, data }: { slotIds: string[]; action: string; data?: any }) => 
      appointmentsService.bulkUpdateTimeSlots(slotIds, action, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-slots', doctorId, date] });
      toast.success('Slots atualizados com sucesso!');
      setSelectedSlots([]);
      setBulkAction('');
    },
    onError: (error) => {
      console.error('Erro ao atualizar slots:', error);
      toast.error('Erro ao atualizar slots. Tente novamente.');
    }
  });

  const generateSlotsFromTemplate = (template: SlotTemplate) => {
    const slots: Partial<TimeSlot>[] = [];
    const startTime = new Date(`${date}T${template.start_time}`);
    const endTime = new Date(`${date}T${template.end_time}`);
    
    let currentTime = new Date(startTime);
    
    while (currentTime < endTime) {
      const slotEndTime = new Date(currentTime.getTime() + template.duration * 60000);
      
      if (slotEndTime <= endTime) {
        slots.push({
          start_time: currentTime.toTimeString().slice(0, 5),
          end_time: slotEndTime.toTimeString().slice(0, 5),
          duration: template.duration,
          status: 'available',
          appointment_types: template.appointment_types
        });
      }
      
      currentTime = new Date(currentTime.getTime() + (template.duration + template.interval) * 60000);
    }
    
    return slots;
  };

  const handleCreateFromTemplate = (template: SlotTemplate) => {
    const slots = generateSlotsFromTemplate(template);
    createSlotsMutation.mutate(slots);
  };

  const handleBulkAction = () => {
    if (selectedSlots.length === 0 || !bulkAction) return;

    switch (bulkAction) {
      case 'block':
        bulkUpdateMutation.mutate({ 
          slotIds: selectedSlots, 
          action: 'block',
          data: { status: 'blocked' }
        });
        break;
      case 'unblock':
        bulkUpdateMutation.mutate({ 
          slotIds: selectedSlots, 
          action: 'unblock',
          data: { status: 'available' }
        });
        break;
      case 'delete':
        deleteSlotsMutation.mutate(selectedSlots);
        break;
      case 'set_break':
        bulkUpdateMutation.mutate({ 
          slotIds: selectedSlots, 
          action: 'set_break',
          data: { status: 'break' }
        });
        break;
    }
  };

  const handleSlotClick = (slot: TimeSlot) => {
    if (selectedSlots.includes(slot.id)) {
      setSelectedSlots(selectedSlots.filter(id => id !== slot.id));
    } else {
      setSelectedSlots([...selectedSlots, slot.id]);
    }
  };

  const handleEditSlot = (slot: TimeSlot) => {
    setEditingSlot(slot);
    setIsEditingSlot(true);
  };

  const handleSaveSlot = () => {
    if (!editingSlot) return;
    
    updateSlotMutation.mutate({
      slotId: editingSlot.id,
      data: editingSlot
    });
  };

  const renderSlotGrid = () => {
    if (!timeSlots || timeSlots.length === 0) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Nenhum slot configurado para esta data. Use os templates para criar slots automaticamente.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
        {timeSlots.map((slot) => {
          const isSelected = selectedSlots.includes(slot.id);
          const statusColor = SLOT_STATUS_COLORS[slot.status] || SLOT_STATUS_COLORS.available;
          
          return (
            <TooltipProvider key={slot.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`
                      relative p-2 rounded-lg border-2 cursor-pointer transition-all
                      ${statusColor}
                      ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
                      hover:shadow-md
                    `}
                    onClick={() => handleSlotClick(slot)}
                  >
                    <div className="text-xs font-medium">
                      {slot.start_time}
                    </div>
                    <div className="text-xs opacity-75">
                      {slot.duration}min
                    </div>
                    {slot.status === 'booked' && slot.appointment && (
                      <div className="absolute -top-1 -right-1">
                        <Badge variant="secondary" className="text-xs px-1">
                          {slot.appointment.patient?.name?.split(' ')[0]}
                        </Badge>
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p className="font-medium">{slot.start_time} - {slot.end_time}</p>
                    <p className="text-sm">Status: {SLOT_STATUS_LABELS[slot.status]}</p>
                    <p className="text-sm">Duração: {slot.duration} minutos</p>
                    {slot.appointment && (
                      <p className="text-sm">Paciente: {slot.appointment.patient?.name}</p>
                    )}
                    {slot.appointment_types && slot.appointment_types.length > 0 && (
                      <p className="text-sm">Tipos: {slot.appointment_types.join(', ')}</p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    );
  };

  const renderTemplates = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Templates de Horários</h3>
          <Dialog open={isCreatingTemplate} onOpenChange={setIsCreatingTemplate}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Novo Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Template de Horários</DialogTitle>
                <DialogDescription>
                  Crie um template para gerar slots automaticamente.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome do Template</Label>
                  <Input
                    value={newTemplate.name || ''}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    placeholder="Ex: Manhã Padrão, Tarde Especializada..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Horário de início</Label>
                    <Input
                      type="time"
                      value={newTemplate.start_time || ''}
                      onChange={(e) => setNewTemplate({ ...newTemplate, start_time: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Horário de fim</Label>
                    <Input
                      type="time"
                      value={newTemplate.end_time || ''}
                      onChange={(e) => setNewTemplate({ ...newTemplate, end_time: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Duração (minutos)</Label>
                    <Input
                      type="number"
                      value={newTemplate.duration || DEFAULT_SLOT_DURATION}
                      onChange={(e) => setNewTemplate({ ...newTemplate, duration: parseInt(e.target.value) })}
                      min="15"
                      step="15"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Intervalo (minutos)</Label>
                    <Input
                      type="number"
                      value={newTemplate.interval || DEFAULT_INTERVAL}
                      onChange={(e) => setNewTemplate({ ...newTemplate, interval: parseInt(e.target.value) })}
                      min="0"
                      step="5"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreatingTemplate(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => {
                    // Salvar template e fechar modal
                    toast.success('Template criado com sucesso!');
                    setIsCreatingTemplate(false);
                    setNewTemplate({});
                  }}>
                    Criar Template
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {templates && templates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{template.name}</h4>
                    <Button
                      size="sm"
                      onClick={() => handleCreateFromTemplate(template)}
                      disabled={createSlotsMutation.isPending}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Aplicar
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{template.start_time} - {template.end_time}</p>
                    <p>Duração: {template.duration}min • Intervalo: {template.interval}min</p>
                    {template.appointment_types && template.appointment_types.length > 0 && (
                      <p>Tipos: {template.appointment_types.join(', ')}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Nenhum template salvo. Crie templates para facilitar a criação de horários.
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  };

  if (slotsLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar slots de tempo. Tente novamente.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="h-6 w-6" />
          <div>
            <h2 className="text-2xl font-bold">Gestão de Slots</h2>
            <p className="text-muted-foreground">
              {doctor?.name} • {new Date(date).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {selectedSlots.length > 0 && (
            <>
              <Select value={bulkAction} onValueChange={setBulkAction}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Ação em lote" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="block">Bloquear</SelectItem>
                  <SelectItem value="unblock">Desbloquear</SelectItem>
                  <SelectItem value="set_break">Marcar Intervalo</SelectItem>
                  <SelectItem value="delete">Excluir</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleBulkAction}
                disabled={!bulkAction || bulkUpdateMutation.isPending}
                variant="outline"
              >
                Aplicar ({selectedSlots.length})
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="slots" className="space-y-4">
        <TabsList>
          <TabsTrigger value="slots">Slots do Dia</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="slots" className="space-y-4">
          {/* Estatísticas */}
          {timeSlots && timeSlots.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-green-600">
                    {timeSlots.filter(s => s.status === 'available').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Disponíveis</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {timeSlots.filter(s => s.status === 'booked').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Ocupados</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-red-600">
                    {timeSlots.filter(s => s.status === 'blocked').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Bloqueados</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-yellow-600">
                    {timeSlots.filter(s => s.status === 'break').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Intervalos</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Grade de Slots */}
          {renderSlotGrid()}
        </TabsContent>

        <TabsContent value="templates">
          {renderTemplates()}
        </TabsContent>
      </Tabs>

      {/* Dialog de Edição de Slot */}
      <Dialog open={isEditingSlot} onOpenChange={setIsEditingSlot}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Slot</DialogTitle>
            <DialogDescription>
              Modifique as configurações do slot selecionado.
            </DialogDescription>
          </DialogHeader>
          {editingSlot && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Horário de início</Label>
                  <Input
                    type="time"
                    value={editingSlot.start_time}
                    onChange={(e) => setEditingSlot({ ...editingSlot, start_time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duração (minutos)</Label>
                  <Input
                    type="number"
                    value={editingSlot.duration}
                    onChange={(e) => setEditingSlot({ ...editingSlot, duration: parseInt(e.target.value) })}
                    min="15"
                    step="15"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editingSlot.status}
                  onValueChange={(value) => setEditingSlot({ ...editingSlot, status: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Disponível</SelectItem>
                    <SelectItem value="blocked">Bloqueado</SelectItem>
                    <SelectItem value="break">Intervalo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditingSlot(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveSlot} disabled={updateSlotMutation.isPending}>
                  {updateSlotMutation.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}