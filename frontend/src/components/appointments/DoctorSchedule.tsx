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
import { toast } from 'sonner';
import { Clock, Plus, Trash2, Copy, Save, AlertCircle, Calendar, User } from 'lucide-react';
import { Doctor, DoctorSchedule as DoctorScheduleType, WorkingHours, ScheduleException } from '../../types/appointments';
import { appointmentsService } from '../../services/appointmentsService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface DoctorScheduleProps {
  doctorId: string;
  onScheduleUpdate?: (schedule: DoctorScheduleType) => void;
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Segunda-feira', short: 'Seg' },
  { key: 'tuesday', label: 'Terça-feira', short: 'Ter' },
  { key: 'wednesday', label: 'Quarta-feira', short: 'Qua' },
  { key: 'thursday', label: 'Quinta-feira', short: 'Qui' },
  { key: 'friday', label: 'Sexta-feira', short: 'Sex' },
  { key: 'saturday', label: 'Sábado', short: 'Sáb' },
  { key: 'sunday', label: 'Domingo', short: 'Dom' }
];

const DEFAULT_WORKING_HOURS: WorkingHours = {
  start_time: '08:00',
  end_time: '18:00',
  break_start: '12:00',
  break_end: '13:00',
  is_working: true
};

export function DoctorSchedule({ doctorId, onScheduleUpdate }: DoctorScheduleProps) {
  const queryClient = useQueryClient();
  const [selectedDay, setSelectedDay] = useState('monday');
  const [isEditingException, setIsEditingException] = useState(false);
  const [newException, setNewException] = useState<Partial<ScheduleException>>({});
  const [copyFromDay, setCopyFromDay] = useState('');

  // Buscar dados do médico
  const { data: doctor, isLoading: doctorLoading } = useQuery({
    queryKey: ['doctor', doctorId],
    queryFn: () => appointmentsService.getDoctorById(doctorId)
  });

  // Buscar horários do médico
  const { data: schedule, isLoading: scheduleLoading, error } = useQuery({
    queryKey: ['doctor-schedule', doctorId],
    queryFn: () => appointmentsService.getDoctorSchedule(doctorId)
  });

  // Estado local para edição
  const [localSchedule, setLocalSchedule] = useState<DoctorScheduleType | null>(null);

  useEffect(() => {
    if (schedule) {
      setLocalSchedule(schedule);
    }
  }, [schedule]);

  // Mutação para salvar horários
  const saveScheduleMutation = useMutation({
    mutationFn: (scheduleData: DoctorScheduleType) => 
      appointmentsService.updateDoctorSchedule(doctorId, scheduleData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['doctor-schedule', doctorId] });
      queryClient.invalidateQueries({ queryKey: ['doctors-availability'] });
      toast.success('Horários salvos com sucesso!');
      onScheduleUpdate?.(data);
    },
    onError: (error) => {
      console.error('Erro ao salvar horários:', error);
      toast.error('Erro ao salvar horários. Tente novamente.');
    }
  });

  // Mutação para criar exceção
  const createExceptionMutation = useMutation({
    mutationFn: (exception: ScheduleException) => 
      appointmentsService.createScheduleException(doctorId, exception),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-schedule', doctorId] });
      toast.success('Exceção criada com sucesso!');
      setIsEditingException(false);
      setNewException({});
    },
    onError: (error) => {
      console.error('Erro ao criar exceção:', error);
      toast.error('Erro ao criar exceção. Tente novamente.');
    }
  });

  // Mutação para deletar exceção
  const deleteExceptionMutation = useMutation({
    mutationFn: (exceptionId: string) => 
      appointmentsService.deleteScheduleException(exceptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-schedule', doctorId] });
      toast.success('Exceção removida com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao remover exceção:', error);
      toast.error('Erro ao remover exceção. Tente novamente.');
    }
  });

  const handleWorkingHoursChange = (day: string, field: keyof WorkingHours, value: any) => {
    if (!localSchedule) return;

    setLocalSchedule({
      ...localSchedule,
      working_hours: {
        ...localSchedule.working_hours,
        [day]: {
          ...localSchedule.working_hours[day],
          [field]: value
        }
      }
    });
  };

  const handleCopySchedule = (fromDay: string, toDay: string) => {
    if (!localSchedule || !localSchedule.working_hours[fromDay]) return;

    const sourceSchedule = localSchedule.working_hours[fromDay];
    handleWorkingHoursChange(toDay, 'start_time', sourceSchedule.start_time);
    handleWorkingHoursChange(toDay, 'end_time', sourceSchedule.end_time);
    handleWorkingHoursChange(toDay, 'break_start', sourceSchedule.break_start);
    handleWorkingHoursChange(toDay, 'break_end', sourceSchedule.break_end);
    handleWorkingHoursChange(toDay, 'is_working', sourceSchedule.is_working);
    
    toast.success(`Horários copiados de ${DAYS_OF_WEEK.find(d => d.key === fromDay)?.label} para ${DAYS_OF_WEEK.find(d => d.key === toDay)?.label}`);
  };

  const handleSaveSchedule = () => {
    if (!localSchedule) return;
    saveScheduleMutation.mutate(localSchedule);
  };

  const handleCreateException = () => {
    if (!newException.date || !newException.type) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const exception: ScheduleException = {
      id: Date.now().toString(),
      doctor_id: doctorId,
      date: newException.date!,
      type: newException.type!,
      start_time: newException.start_time,
      end_time: newException.end_time,
      reason: newException.reason,
      created_at: new Date().toISOString()
    };

    createExceptionMutation.mutate(exception);
  };

  const renderWorkingHoursForm = (day: string) => {
    const daySchedule = localSchedule?.working_hours[day] || DEFAULT_WORKING_HOURS;
    const dayInfo = DAYS_OF_WEEK.find(d => d.key === day);

    return (
      <Card key={day} className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{dayInfo?.label}</CardTitle>
              <Badge variant={daySchedule.is_working ? 'default' : 'secondary'}>
                {daySchedule.is_working ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Select value={copyFromDay} onValueChange={setCopyFromDay}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Copiar de..." />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.filter(d => d.key !== day).map(d => (
                    <SelectItem key={d.key} value={d.key}>{d.short}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (copyFromDay) {
                    handleCopySchedule(copyFromDay, day);
                    setCopyFromDay('');
                  }
                }}
                disabled={!copyFromDay}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={daySchedule.is_working}
              onCheckedChange={(checked) => handleWorkingHoursChange(day, 'is_working', checked)}
            />
            <Label>Dia de trabalho</Label>
          </div>

          {daySchedule.is_working && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Início do expediente</Label>
                <Input
                  type="time"
                  value={daySchedule.start_time}
                  onChange={(e) => handleWorkingHoursChange(day, 'start_time', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Fim do expediente</Label>
                <Input
                  type="time"
                  value={daySchedule.end_time}
                  onChange={(e) => handleWorkingHoursChange(day, 'end_time', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Início do intervalo</Label>
                <Input
                  type="time"
                  value={daySchedule.break_start || ''}
                  onChange={(e) => handleWorkingHoursChange(day, 'break_start', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Fim do intervalo</Label>
                <Input
                  type="time"
                  value={daySchedule.break_end || ''}
                  onChange={(e) => handleWorkingHoursChange(day, 'break_end', e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderExceptions = () => {
    const exceptions = localSchedule?.exceptions || [];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Exceções de Horário</h3>
          <Dialog open={isEditingException} onOpenChange={setIsEditingException}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nova Exceção
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Exceção de Horário</DialogTitle>
                <DialogDescription>
                  Defina um horário especial ou bloqueio para uma data específica.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input
                    type="date"
                    value={newException.date || ''}
                    onChange={(e) => setNewException({ ...newException, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={newException.type || ''}
                    onValueChange={(value) => setNewException({ ...newException, type: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unavailable">Indisponível</SelectItem>
                      <SelectItem value="custom_hours">Horário Personalizado</SelectItem>
                      <SelectItem value="holiday">Feriado</SelectItem>
                      <SelectItem value="vacation">Férias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {newException.type === 'custom_hours' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Horário de início</Label>
                      <Input
                        type="time"
                        value={newException.start_time || ''}
                        onChange={(e) => setNewException({ ...newException, start_time: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Horário de fim</Label>
                      <Input
                        type="time"
                        value={newException.end_time || ''}
                        onChange={(e) => setNewException({ ...newException, end_time: e.target.value })}
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Motivo (opcional)</Label>
                  <Input
                    value={newException.reason || ''}
                    onChange={(e) => setNewException({ ...newException, reason: e.target.value })}
                    placeholder="Ex: Congresso médico, consulta externa..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditingException(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateException} disabled={createExceptionMutation.isPending}>
                    {createExceptionMutation.isPending ? 'Criando...' : 'Criar Exceção'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {exceptions.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Nenhuma exceção de horário configurada.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-2">
            {exceptions.map((exception) => (
              <Card key={exception.id}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {new Date(exception.date).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {exception.type === 'unavailable' && 'Indisponível'}
                          {exception.type === 'custom_hours' && `${exception.start_time} - ${exception.end_time}`}
                          {exception.type === 'holiday' && 'Feriado'}
                          {exception.type === 'vacation' && 'Férias'}
                          {exception.reason && ` • ${exception.reason}`}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteExceptionMutation.mutate(exception.id)}
                      disabled={deleteExceptionMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (doctorLoading || scheduleLoading) {
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
          Erro ao carregar horários do médico. Tente novamente.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <User className="h-6 w-6" />
          <div>
            <h2 className="text-2xl font-bold">Horários de Trabalho</h2>
            <p className="text-muted-foreground">
              {doctor?.name} • {doctor?.specialty}
            </p>
          </div>
        </div>
        <Button onClick={handleSaveSchedule} disabled={saveScheduleMutation.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {saveScheduleMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>

      <Tabs defaultValue="schedule" className="space-y-4">
        <TabsList>
          <TabsTrigger value="schedule">Horários Semanais</TabsTrigger>
          <TabsTrigger value="exceptions">Exceções</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-4">
          <div className="grid gap-4">
            {DAYS_OF_WEEK.map(day => renderWorkingHoursForm(day.key))}
          </div>
        </TabsContent>

        <TabsContent value="exceptions">
          {renderExceptions()}
        </TabsContent>
      </Tabs>
    </div>
  );
}