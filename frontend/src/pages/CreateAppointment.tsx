import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, Clock, User, ArrowLeft, Save, X, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import AppointmentForm from '../components/appointments/AppointmentForm';
import TimeSlotPicker from '../components/appointments/TimeSlotPicker';
import { useAppointments } from '@/hooks/useAppointments';
import useAvailability from '@/hooks/useAvailability';
import { useDoctors } from '@/hooks/useDoctors';
import { usePatients } from '@/hooks/usePatients';
import { AppointmentCreate, Doctor, Patient, TimeSlot } from '@/types/appointments';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CreateAppointmentProps {
  className?: string;
}

function CreateAppointment({ className }: CreateAppointmentProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createAppointment, isCreating } = useAppointments();
  const { data: doctors, isLoading: doctorsLoading } = useDoctors();
  const { data: patients, isLoading: patientsLoading } = usePatients();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [appointmentData, setAppointmentData] = useState<Partial<AppointmentCreate>>({});
  
  const { validateAppointment } = useAvailability({
    doctor_id: appointmentData.doctor_id ? parseInt(appointmentData.doctor_id.toString()) : 0,
    date: appointmentData.appointment_date ? new Date(appointmentData.appointment_date).toISOString().split('T')[0] : '',
    procedure_id: undefined
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  
  // Pré-preenchimento com parâmetros da URL
  useEffect(() => {
    const patientId = searchParams.get('patientId');
    const doctorId = searchParams.get('doctorId');
    const date = searchParams.get('date');
    const time = searchParams.get('time');
    
    if (patientId || doctorId || date || time) {
      setAppointmentData((prev: any) => ({
        ...prev,
        ...(patientId && { patient_id: parseInt(patientId) }),
        ...(doctorId && { doctor_id: parseInt(doctorId) }),
        ...(date && time && { appointment_date: `${date}T${time}` })
      }));
    }
  }, [searchParams]);
  
  const steps = [
    {
      id: 1,
      title: 'Informações Básicas',
      description: 'Paciente, médico e tipo de consulta',
      icon: User
    },
    {
      id: 2,
      title: 'Data e Horário',
      description: 'Selecione a data e horário disponível',
      icon: Calendar
    },
    {
      id: 3,
      title: 'Detalhes',
      description: 'Informações adicionais e confirmação',
      icon: CheckCircle
    }
  ];
  
  const handleStepChange = (step: number) => {
    if (step < currentStep || validateCurrentStep()) {
      setCurrentStep(step);
    }
  };
  
  const validateCurrentStep = (): boolean => {
    const errors: string[] = [];
    
    switch (currentStep) {
      case 1:
        if (!appointmentData.patient_id) errors.push('Selecione um paciente');
        if (!appointmentData.doctor_id) errors.push('Selecione um médico');
        if (!appointmentData.appointment_type) errors.push('Selecione o tipo de consulta');
        break;
        
      case 2:
        if (!appointmentData.appointment_date) errors.push('Selecione uma data');
        if (!selectedTimeSlot) errors.push('Selecione um horário');
        break;
        
      case 3:
        // Validações finais serão feitas no envio
        break;
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };
  
  const handleNext = async () => {
    if (!validateCurrentStep()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    
    if (currentStep === 2 && appointmentData.doctor_id && selectedTimeSlot) {
      // Validar disponibilidade antes de prosseguir
      setIsValidating(true);
      try {
        const validation = await validateAppointment({
          doctorId: appointmentData.doctor_id.toString(),
          startTime: selectedTimeSlot.time,
          duration: selectedTimeSlot.duration || 30
        });
        
        if (!validation.isValid) {
          toast.error(validation.message || 'Horário não disponível');
          setValidationErrors([validation.message || 'Horário não disponível']);
          return;
        }
      } catch (error) {
        toast.error('Erro ao validar disponibilidade');
        return;
      } finally {
        setIsValidating(false);
      }
    }
    
    setCurrentStep(prev => Math.min(prev + 1, steps.length));
  };
  
  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
  
  const handleFormChange = (data: Partial<AppointmentCreate>) => {
    setAppointmentData((prev: any) => ({ ...prev, ...data }));
    setValidationErrors([]);
  };
  
  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot);
    setAppointmentData((prev: any) => ({
      ...prev,
      start_time: timeSlot.time,
      duration: timeSlot.duration || 30
    }));
    setValidationErrors([]);
  };
  
  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    
    if (!selectedTimeSlot) {
      toast.error('Selecione um horário');
      return;
    }
    
    const finalData: AppointmentCreate = {
      ...appointmentData as AppointmentCreate,
      appointment_date: selectedTimeSlot.time,
      duration: selectedTimeSlot.duration || 30,
      status: 'agendado',
      payment_status: 'pending'
    };
    
    try {
      await createAppointment(finalData);
      toast.success('Agendamento criado com sucesso!');
      navigate('/appointments');
    } catch (error) {
      toast.error('Erro ao criar agendamento');
    }
  };
  
  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <AppointmentForm
            appointment={null}
            doctors={doctors?.data?.map(d => ({ id: d.id.toString(), name: d.full_name, crm: d.professional_license, specialty: d.specialty })) || []}
            patients={patients?.data?.map(p => ({ id: p.id.toString(), name: p.full_name, phone: p.phone, email: p.email })) || []}
            onSubmit={async (data: any) => {
              handleFormChange(data);
            }}
            onCancel={() => navigate('/appointments')}
            loading={isCreating}
            mode="create"
          />
        );
        
      case 2:
        return (
          <div className="space-y-6">
            {appointmentData.doctor_id ? (
              <TimeSlotPicker
                doctorId={appointmentData.doctor_id.toString()}
                selectedDate={appointmentData.appointment_date ? new Date(appointmentData.appointment_date) : undefined}
                selectedSlot={selectedTimeSlot}
                onSlotSelect={handleTimeSlotSelect}
                duration={appointmentData.duration || 30}
                appointmentType={appointmentData.appointment_type}
              />
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Selecione um médico na etapa anterior para visualizar os horários disponíveis.
                </AlertDescription>
              </Alert>
            )}
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <AppointmentForm
              appointment={null}
              doctors={doctors?.data?.map(d => ({ id: d.id.toString(), name: d.full_name, crm: d.professional_license, specialty: d.specialty })) || []}
              patients={patients?.data?.map(p => ({ id: p.id.toString(), name: p.full_name, phone: p.phone, email: p.email })) || []}
              onSubmit={async (data: any) => {
                handleFormChange(data);
              }}
              onCancel={() => navigate('/appointments')}
              loading={isCreating}
              mode="create"
            />
            
            <Separator />
            
            {/* Resumo do agendamento */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumo do Agendamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Informações Básicas</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Paciente:</span>
                        <span className="font-medium">{appointmentData.patient_id || 'Não selecionado'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Médico:</span>
                        <span className="font-medium">{appointmentData.doctor_id || 'Não selecionado'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tipo:</span>
                        <span className="font-medium">{appointmentData.appointment_type || 'Não definido'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Data e Horário</h4>
                    <div className="space-y-2 text-sm">
                      {selectedTimeSlot ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Data:</span>
                            <span className="font-medium">
                              {appointmentData.appointment_date ? new Date(appointmentData.appointment_date).toLocaleDateString('pt-BR') : 'Não selecionada'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Horário:</span>
                            <span className="font-medium">
                              {selectedTimeSlot.time}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Duração:</span>
                            <span className="font-medium">{selectedTimeSlot.duration || 30} min</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-gray-500 italic">Horário não selecionado</div>
                      )}
                    </div>
                  </div>
                </div>
                
                {appointmentData.notes && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Observações</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {appointmentData.notes}
                    </p>
                  </div>
                )}
                
                {appointmentData.price && (
                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="text-lg font-medium text-gray-900">Total:</span>
                    <span className="text-2xl font-bold text-green-600">
                      R$ {appointmentData.price.toFixed(2)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className={cn('min-h-screen bg-gray-50', className)}>
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Cabeçalho */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/appointments')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Novo Agendamento
          </h1>
          <p className="text-gray-600">
            Preencha as informações para criar um novo agendamento
          </p>
        </div>
        
        {/* Indicador de progresso */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                const isClickable = currentStep >= step.id || isCompleted;
                
                return (
                  <React.Fragment key={step.id}>
                    <div
                      className={cn(
                        'flex flex-col items-center space-y-2 cursor-pointer transition-all',
                        isClickable && 'hover:opacity-80',
                        !isClickable && 'cursor-not-allowed opacity-50'
                      )}
                      onClick={() => isClickable && handleStepChange(step.id)}
                    >
                      <div className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all',
                        isActive && 'bg-blue-600 border-blue-600 text-white',
                        isCompleted && 'bg-green-600 border-green-600 text-white',
                        !isActive && !isCompleted && 'bg-white border-gray-300 text-gray-400'
                      )}>
                        <Icon className="h-5 w-5" />
                      </div>
                      
                      <div className="text-center">
                        <div className={cn(
                          'text-sm font-medium',
                          isActive && 'text-blue-600',
                          isCompleted && 'text-green-600',
                          !isActive && !isCompleted && 'text-gray-500'
                        )}>
                          {step.title}
                        </div>
                        <div className="text-xs text-gray-500 max-w-24">
                          {step.description}
                        </div>
                      </div>
                    </div>
                    
                    {index < steps.length - 1 && (
                      <div className={cn(
                        'flex-1 h-0.5 mx-4 transition-all',
                        currentStep > step.id ? 'bg-green-600' : 'bg-gray-300'
                      )} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        {/* Erros de validação */}
        {validationErrors.length > 0 && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Conteúdo da etapa atual */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Etapa {currentStep}: {steps[currentStep - 1]?.title}</span>
              {isValidating && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getStepContent()}
          </CardContent>
        </Card>
        
        {/* Botões de navegação */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => navigate('/appointments')}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            
            {currentStep < steps.length ? (
              <Button
                onClick={handleNext}
                disabled={isValidating}
              >
                Próximo
                <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isCreating || isValidating}
                className="bg-green-600 hover:bg-green-700"
              >
                {isCreating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Criar Agendamento
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateAppointment;