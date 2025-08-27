import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, Clock, User, FileText, Phone, Mail, MapPin, AlertCircle, Save, X } from 'lucide-react';
import { Appointment, AppointmentCreate, AppointmentUpdate, TimeSlot } from '../../types/appointments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import TimeSlotPicker from './TimeSlotPicker';
import { cn } from '@/lib/utils';

// Schema de validação
const appointmentSchema = z.object({
  patient_id: z.string().min(1, 'Paciente é obrigatório'),
  doctor_id: z.string().min(1, 'Médico é obrigatório'),
  appointment_date: z.string().min(1, 'Data é obrigatória'),
  start_time: z.string().min(1, 'Horário é obrigatório'),
  duration: z.number().min(15, 'Duração mínima de 15 minutos').max(240, 'Duração máxima de 4 horas'),
  appointment_type: z.string().min(1, 'Tipo de consulta é obrigatório'),
  specialty: z.string().optional(),
  room_id: z.string().optional(),
  notes: z.string().optional(),
  price: z.number().min(0, 'Preço deve ser positivo').optional(),
  insurance_id: z.string().optional(),
  is_telemedicine: z.boolean().default(false),
  send_reminder: z.boolean().default(true),
  reminder_time: z.number().default(24), // horas antes
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  recurring: z.boolean().default(false),
  recurring_pattern: z.string().optional(),
  recurring_end_date: z.string().optional()
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface AppointmentFormProps {
  appointment?: Appointment;
  onSubmit: (data: AppointmentCreate | AppointmentUpdate) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  mode?: 'create' | 'edit';
  className?: string;
  doctors?: Array<{ id: string; name: string; specialty?: string; crm?: string }>;
  patients?: Array<{ id: string; name: string; phone?: string; email?: string }>;
}

// Mock data - em produção viria da API
const mockPatients = [
  { id: '1', name: 'João Silva', phone: '(11) 99999-9999', email: 'joao@email.com' },
  { id: '2', name: 'Maria Santos', phone: '(11) 88888-8888', email: 'maria@email.com' },
  { id: '3', name: 'Pedro Costa', phone: '(11) 77777-7777', email: 'pedro@email.com' }
];

const mockDoctors = [
  { id: '1', name: 'Dr. Carlos Oliveira', specialty: 'Cardiologia', crm: '12345' },
  { id: '2', name: 'Dra. Ana Paula', specialty: 'Dermatologia', crm: '67890' },
  { id: '3', name: 'Dr. Roberto Lima', specialty: 'Ortopedia', crm: '54321' }
];



const mockRooms = [
  { id: '1', name: 'Consultório 1', type: 'consultation' },
  { id: '2', name: 'Consultório 2', type: 'consultation' },
  { id: '3', name: 'Sala de Exames', type: 'examination' }
];

const appointmentTypes = [
  { value: 'consultation', label: 'Consulta' },
  { value: 'followup', label: 'Retorno' },
  { value: 'examination', label: 'Exame' },
  { value: 'procedure', label: 'Procedimento' },
  { value: 'emergency', label: 'Emergência' }
];

const specialties = [
  'Cardiologia', 'Dermatologia', 'Ortopedia', 'Pediatria', 'Ginecologia',
  'Neurologia', 'Psiquiatria', 'Oftalmologia', 'Otorrinolaringologia'
];

const priorities = [
  { value: 'low', label: 'Baixa', color: 'bg-gray-100 text-gray-800' },
  { value: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-800' },
  { value: 'high', label: 'Alta', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'urgent', label: 'Urgente', color: 'bg-red-100 text-red-800' }
];

function AppointmentForm({
  appointment,
  onSubmit,
  onCancel,
  loading = false,
  mode = 'create',
  className,
  doctors,
  patients
}: AppointmentFormProps) {
  // Use props data if provided, otherwise use mock data
  const availablePatients = patients || mockPatients;
  const availableDoctors = doctors || mockDoctors;
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [showTimeSlotPicker, setShowTimeSlotPicker] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<{ id: string; name: string; phone?: string; email?: string } | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<{ id: string; name: string; specialty?: string; crm?: string } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    reset
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      duration: 30,
      appointment_type: 'consultation',
      priority: 'normal',
      is_telemedicine: false,
      send_reminder: true,
      reminder_time: 24,
      recurring: false
    }
  });

  const watchedValues = watch();
  const isTelemedicine = watch('is_telemedicine');
  const isRecurring = watch('recurring');
  const appointmentDate = watch('appointment_date');
  const doctorId = watch('doctor_id');

  // Preencher formulário se estiver editando
  useEffect(() => {
    if (appointment && mode === 'edit') {
      reset({
        patient_id: appointment.patient_id,
        doctor_id: appointment.doctor_id,
        appointment_date: appointment.appointment_date.split('T')[0],
        start_time: appointment.start_time,
        duration: appointment.duration || 30,
        appointment_type: appointment.appointment_type,
        specialty: appointment.specialty,
        room_id: appointment.room_id,
        notes: appointment.notes,
        price: appointment.price,
        insurance_id: appointment.insurance_id,
        is_telemedicine: appointment.is_telemedicine || false,
        send_reminder: true,
        reminder_time: 24,
        priority: appointment.priority || 'normal',
        recurring: false
      });
    }
  }, [appointment, mode, reset]);

  // Atualizar dados do paciente selecionado
  useEffect(() => {
    const patientId = watchedValues.patient_id;
    if (patientId) {
      const patient = availablePatients.find(p => p.id === patientId);
      setSelectedPatient(patient);
    }
  }, [watchedValues.patient_id, availablePatients]);

  // Atualizar dados do médico selecionado
  useEffect(() => {
    const doctorId = watchedValues.doctor_id;
    if (doctorId) {
      const doctor = availableDoctors.find(d => d.id === doctorId);
      setSelectedDoctor(doctor);
      if (doctor?.specialty) {
        setValue('specialty', doctor.specialty);
      }
    }
  }, [watchedValues.doctor_id, setValue, availableDoctors]);

  // Mostrar seletor de horário quando data e médico estiverem selecionados
  useEffect(() => {
    if (appointmentDate && doctorId) {
      setShowTimeSlotPicker(true);
    } else {
      setShowTimeSlotPicker(false);
    }
  }, [appointmentDate, doctorId]);

  const handleTimeSlotSelect = (slot: TimeSlot) => {
    setSelectedTimeSlot(slot);
    setValue('start_time', slot.time);
    
    // Usar duração do slot se disponível
    if (slot.duration) {
      setValue('duration', slot.duration);
    }
  };

  const onFormSubmit = async (data: AppointmentFormData) => {
    try {
      const formattedData = {
        ...data,
        appointment_date: `${data.appointment_date}T${data.start_time}:00`,
        end_time: calculateEndTime(data.start_time, data.duration)
      };

      await onSubmit(formattedData as AppointmentCreate | AppointmentUpdate);
      toast.success(mode === 'create' ? 'Agendamento criado com sucesso!' : 'Agendamento atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar agendamento. Tente novamente.');
    }
  };

  const calculateEndTime = (startTime: string, duration: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const start = new Date();
    start.setHours(hours, minutes, 0, 0);
    start.setMinutes(start.getMinutes() + duration);
    
    return `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = priorities.find(p => p.value === priority);
    return (
      <Badge variant="outline" className={priorityConfig?.color}>
        {priorityConfig?.label}
      </Badge>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>
              {mode === 'create' ? 'Novo Agendamento' : 'Editar Agendamento'}
            </span>
          </div>
          
          {appointment && (
            <Badge variant="outline">
              #{appointment.id}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Informações do Paciente */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <h3 className="text-lg font-medium">Informações do Paciente</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patient_id">Paciente *</Label>
                <Select
                  value={watchedValues.patient_id}
                  onValueChange={(value) => setValue('patient_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePatients.map(patient => (
                      <SelectItem key={patient.id} value={patient.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{patient.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {patient.phone} • {patient.email}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.patient_id && (
                  <p className="text-sm text-red-600">{errors.patient_id.message}</p>
                )}
              </div>
              
              {selectedPatient && (
                <div className="space-y-2">
                  <Label>Contato</Label>
                  <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="h-3 w-3" />
                      <span>{selectedPatient.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="h-3 w-3" />
                      <span>{selectedPatient.email}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <Separator />
          
          {/* Informações do Médico */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <h3 className="text-lg font-medium">Informações do Médico</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="doctor_id">Médico *</Label>
                <Select
                  value={watchedValues.doctor_id}
                  onValueChange={(value) => setValue('doctor_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o médico" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDoctors.map(doctor => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        <div>
                          <div className="font-medium">{doctor.name}</div>
                          <div className="text-sm text-gray-500">{doctor.specialty} - CRM {doctor.crm}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.doctor_id && (
                  <p className="text-sm text-red-600">{errors.doctor_id.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="specialty">Especialidade</Label>
                <Select
                  value={watchedValues.specialty}
                  onValueChange={(value) => setValue('specialty', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a especialidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map(specialty => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Data e Horário */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <h3 className="text-lg font-medium">Data e Horário</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="appointment_date">Data *</Label>
                <Input
                  type="date"
                  {...register('appointment_date')}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.appointment_date && (
                  <p className="text-sm text-red-600">{errors.appointment_date.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="start_time">Horário *</Label>
                <Input
                  type="time"
                  {...register('start_time')}
                  readOnly={showTimeSlotPicker}
                />
                {errors.start_time && (
                  <p className="text-sm text-red-600">{errors.start_time.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration">Duração (min) *</Label>
                <Select
                  value={watchedValues.duration?.toString()}
                  onValueChange={(value) => setValue('duration', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="90">1h 30min</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                  </SelectContent>
                </Select>
                {errors.duration && (
                  <p className="text-sm text-red-600">{errors.duration.message}</p>
                )}
              </div>
            </div>
            
            {/* Seletor de horário */}
            {showTimeSlotPicker && appointmentDate && doctorId && (
              <TimeSlotPicker
                date={new Date(appointmentDate)}
                doctorId={doctorId}
                selectedSlot={selectedTimeSlot}
                onSlotSelect={handleTimeSlotSelect}
                duration={watchedValues.duration}
              />
            )}
          </div>
          
          <Separator />
          
          {/* Detalhes da Consulta */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <h3 className="text-lg font-medium">Detalhes da Consulta</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="appointment_type">Tipo de Consulta *</Label>
                <Select
                  value={watchedValues.appointment_type}
                  onValueChange={(value) => setValue('appointment_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {appointmentTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.appointment_type && (
                  <p className="text-sm text-red-600">{errors.appointment_type.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select
                  value={watchedValues.priority}
                  onValueChange={(value) => setValue('priority', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map(priority => (
                      <SelectItem key={priority.value} value={priority.value}>
                        <div className="flex items-center space-x-2">
                          <span>{priority.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!isTelemedicine && (
                <div className="space-y-2">
                  <Label htmlFor="room_id">Sala/Consultório</Label>
                  <Select
                    value={watchedValues.room_id}
                    onValueChange={(value) => setValue('room_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a sala" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockRooms.map(room => (
                        <SelectItem key={room.id} value={room.id}>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-3 w-3" />
                            <span>{room.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="price">Valor (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  {...register('price', { valueAsNumber: true })}
                />
                {errors.price && (
                  <p className="text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                placeholder="Observações sobre o agendamento..."
                {...register('notes')}
                rows={3}
              />
            </div>
          </div>
          
          <Separator />
          
          {/* Configurações Avançadas */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Configurações</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Telemedicina</Label>
                  <p className="text-sm text-gray-600">Consulta será realizada online</p>
                </div>
                <Switch
                  checked={isTelemedicine}
                  onCheckedChange={(checked) => setValue('is_telemedicine', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enviar Lembrete</Label>
                  <p className="text-sm text-gray-600">Notificar paciente sobre o agendamento</p>
                </div>
                <Switch
                  checked={watchedValues.send_reminder}
                  onCheckedChange={(checked) => setValue('send_reminder', checked)}
                />
              </div>
              
              {watchedValues.send_reminder && (
                <div className="space-y-2 ml-6">
                  <Label htmlFor="reminder_time">Lembrar com antecedência (horas)</Label>
                  <Select
                    value={watchedValues.reminder_time?.toString()}
                    onValueChange={(value) => setValue('reminder_time', parseInt(value))}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hora</SelectItem>
                      <SelectItem value="2">2 horas</SelectItem>
                      <SelectItem value="4">4 horas</SelectItem>
                      <SelectItem value="12">12 horas</SelectItem>
                      <SelectItem value="24">24 horas</SelectItem>
                      <SelectItem value="48">48 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Agendamento Recorrente</Label>
                  <p className="text-sm text-gray-600">Repetir este agendamento</p>
                </div>
                <Switch
                  checked={isRecurring}
                  onCheckedChange={(checked) => setValue('recurring', checked)}
                />
              </div>
              
              {isRecurring && (
                <div className="space-y-4 ml-6">
                  <div className="space-y-2">
                    <Label htmlFor="recurring_pattern">Padrão de Recorrência</Label>
                    <Select
                      value={watchedValues.recurring_pattern}
                      onValueChange={(value) => setValue('recurring_pattern', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o padrão" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Diário</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="biweekly">Quinzenal</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="recurring_end_date">Data Final</Label>
                    <Input
                      type="date"
                      {...register('recurring_end_date')}
                      min={appointmentDate}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Resumo */}
          {selectedTimeSlot && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Resumo do Agendamento:</p>
                  <div className="text-sm space-y-1">
                    <p><strong>Paciente:</strong> {selectedPatient?.name}</p>
                    <p><strong>Médico:</strong> {selectedDoctor?.name}</p>
                    <p><strong>Data:</strong> {new Date(appointmentDate).toLocaleDateString('pt-BR')}</p>
                    <p><strong>Horário:</strong> {selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}</p>
                    <p><strong>Duração:</strong> {watchedValues.duration} minutos</p>
                    <p><strong>Tipo:</strong> {appointmentTypes.find(t => t.value === watchedValues.appointment_type)?.label}</p>
                    <p><strong>Prioridade:</strong> {getPriorityBadge(watchedValues.priority)}</p>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Botões de Ação */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            
            <Button
              type="submit"
              disabled={!isValid || loading}
              className="min-w-[120px]"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Salvando...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Save className="h-4 w-4" />
                  <span>{mode === 'create' ? 'Criar Agendamento' : 'Salvar Alterações'}</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default AppointmentForm;
export { AppointmentForm };