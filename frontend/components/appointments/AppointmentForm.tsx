'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  CalendarIcon,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Appointment, Doctor, Patient, AppointmentType, TimeSlot } from '@/types/appointments';
import TimeSlotPicker from './TimeSlotPicker';
import { cn } from '@/lib/utils';

const appointmentFormSchema = z.object({
  patient_id: z.string().min(1, 'Selecione um paciente'),
  doctor_id: z.string().min(1, 'Selecione um médico'),
  appointment_date: z.date({
    required_error: 'Selecione uma data',
  }),
  appointment_time: z.string().min(1, 'Selecione um horário'),
  type: z.enum(['consultation', 'follow_up', 'procedure', 'emergency', 'routine_checkup', 'specialist_consultation']),
  duration: z.number().min(15, 'Duração mínima de 15 minutos').max(240, 'Duração máxima de 4 horas'),
  notes: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  send_reminder: z.boolean().default(true),
  reminder_method: z.enum(['email', 'sms', 'both']).default('email'),
});

type AppointmentFormData = z.infer<typeof appointmentFormSchema>;

interface AppointmentFormProps {
  appointment?: Appointment;
  doctors: Doctor[];
  patients: Patient[];
  availableSlots: TimeSlot[];
  onSubmit: (data: AppointmentFormData) => Promise<void>;
  onCancel: () => void;
  onSlotsRefresh?: (doctorId: string, date: Date) => void;
  loading?: boolean;
  className?: string;
}

const appointmentTypes = [
  { value: 'consultation', label: 'Consulta', duration: 30, color: 'bg-blue-100 text-blue-800' },
  { value: 'follow_up', label: 'Retorno', duration: 20, color: 'bg-green-100 text-green-800' },
  { value: 'procedure', label: 'Procedimento', duration: 60, color: 'bg-purple-100 text-purple-800' },
  { value: 'emergency', label: 'Emergência', duration: 45, color: 'bg-red-100 text-red-800' },
  { value: 'routine_checkup', label: 'Check-up', duration: 40, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'specialist_consultation', label: 'Especialista', duration: 50, color: 'bg-indigo-100 text-indigo-800' }
];

const priorityOptions = [
  { value: 'low', label: 'Baixa', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Média', color: 'bg-blue-100 text-blue-800' },
  { value: 'high', label: 'Alta', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgente', color: 'bg-red-100 text-red-800' }
];

const reminderMethods = [
  { value: 'email', label: 'E-mail' },
  { value: 'sms', label: 'SMS' },
  { value: 'both', label: 'E-mail e SMS' }
];

export function AppointmentForm({
  appointment,
  doctors,
  patients,
  availableSlots,
  onSubmit,
  onCancel,
  onSlotsRefresh,
  loading = false,
  className
}: AppointmentFormProps) {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | undefined>(
    appointment ? doctors.find(d => d.id === appointment.doctor_id) : undefined
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    appointment ? new Date(appointment.appointment_date) : undefined
  );
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | undefined>();
  const [showTimeSlots, setShowTimeSlots] = useState(false);

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      patient_id: appointment?.patient_id?.toString() || '',
      doctor_id: appointment?.doctor_id?.toString() || '',
      appointment_date: appointment ? new Date(appointment.appointment_date) : undefined,
      appointment_time: appointment?.appointment_time || '',
      type: appointment?.type || 'consultation',
      duration: appointment?.duration || 30,
      notes: appointment?.notes || '',
      priority: appointment?.priority || 'medium',
      send_reminder: true,
      reminder_method: 'email',
    },
  });

  const watchedType = form.watch('type');
  const watchedDoctorId = form.watch('doctor_id');
  const watchedDate = form.watch('appointment_date');

  // Atualizar duração quando o tipo muda
  useEffect(() => {
    const type = appointmentTypes.find(t => t.value === watchedType);
    if (type) {
      form.setValue('duration', type.duration);
    }
  }, [watchedType, form]);

  // Atualizar médico selecionado
  useEffect(() => {
    if (watchedDoctorId) {
      const doctor = doctors.find(d => d.id?.toString() === watchedDoctorId);
      setSelectedDoctor(doctor);
      
      // Refresh slots quando médico ou data mudam
      if (doctor && watchedDate && onSlotsRefresh) {
        onSlotsRefresh(watchedDoctorId, watchedDate);
      }
    }
  }, [watchedDoctorId, watchedDate, doctors, onSlotsRefresh]);

  // Atualizar data selecionada
  useEffect(() => {
    setSelectedDate(watchedDate);
    if (watchedDate && selectedDoctor && onSlotsRefresh) {
      onSlotsRefresh(selectedDoctor.id?.toString() || '', watchedDate);
    }
  }, [watchedDate, selectedDoctor, onSlotsRefresh]);

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    form.setValue('appointment_time', slot.start_time);
    setShowTimeSlots(false);
  };

  const handleSubmit = async (data: AppointmentFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
    }
  };

  const isEditing = !!appointment;
  const canSelectTimeSlots = selectedDoctor && selectedDate;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5" />
          <span>{isEditing ? 'Editar Agendamento' : 'Novo Agendamento'}</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Informações do Paciente */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Informações do Paciente</span>
              </h3>
              
              <FormField
                control={form.control}
                name="patient_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paciente *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um paciente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patients.map(patient => (
                          <SelectItem key={patient.id} value={patient.id?.toString() || ''}>
                            <div className="flex flex-col">
                              <span className="font-medium">{patient.name}</span>
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                {patient.phone && (
                                  <div className="flex items-center space-x-1">
                                    <Phone className="h-3 w-3" />
                                    <span>{patient.phone}</span>
                                  </div>
                                )}
                                {patient.email && (
                                  <div className="flex items-center space-x-1">
                                    <Mail className="h-3 w-3" />
                                    <span>{patient.email}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Informações do Médico */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Informações do Médico</span>
              </h3>
              
              <FormField
                control={form.control}
                name="doctor_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Médico *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um médico" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {doctors.map(doctor => (
                          <SelectItem key={doctor.id} value={doctor.id?.toString() || ''}>
                            <div className="flex flex-col">
                              <span className="font-medium">{doctor.name}</span>
                              {doctor.specialty && (
                                <span className="text-xs text-gray-500">{doctor.specialty}</span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Informações do Agendamento */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4" />
                <span>Informações do Agendamento</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Consulta *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridade</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {priorityOptions.map(priority => (
                            <SelectItem key={priority.value} value={priority.value}>
                              <Badge variant="outline" className={cn('text-xs', priority.color)}>
                                {priority.label}
                              </Badge>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="appointment_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data do Agendamento *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duração (minutos)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="15"
                          max="240"
                          step="5"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Duração em minutos (15-240)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Seleção de Horário */}
              {canSelectTimeSlots && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <FormLabel>Horário *</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowTimeSlots(!showTimeSlots)}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      {showTimeSlots ? 'Ocultar horários' : 'Selecionar horário'}
                    </Button>
                  </div>
                  
                  {form.watch('appointment_time') && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2 text-green-800">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-medium">Horário selecionado:</span>
                        <span>{form.watch('appointment_time')}</span>
                      </div>
                    </div>
                  )}
                  
                  {showTimeSlots && (
                    <TimeSlotPicker
                      selectedDate={selectedDate!}
                      selectedDoctor={selectedDoctor}
                      appointmentType={form.watch('type')}
                      duration={form.watch('duration')}
                      availableSlots={availableSlots}
                      selectedSlot={selectedSlot}
                      onSlotSelect={handleSlotSelect}
                      onRefresh={() => {
                        if (selectedDoctor && selectedDate && onSlotsRefresh) {
                          onSlotsRefresh(selectedDoctor.id?.toString() || '', selectedDate);
                        }
                      }}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Observações e Lembretes */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Observações e Lembretes</span>
              </h3>
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Observações adicionais sobre o agendamento..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="send_reminder"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enviar Lembrete</FormLabel>
                        <FormDescription>
                          Enviar lembrete automático para o paciente
                        </FormDescription>
                      </div>
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                {form.watch('send_reminder') && (
                  <FormField
                    control={form.control}
                    name="reminder_method"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Método de Lembrete</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {reminderMethods.map(method => (
                              <SelectItem key={method.value} value={method.value}>
                                {method.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancelar
              </Button>
              
              <Button
                type="submit"
                disabled={loading || !form.formState.isValid}
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isEditing ? 'Atualizar Agendamento' : 'Criar Agendamento'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}