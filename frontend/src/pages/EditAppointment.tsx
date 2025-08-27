'use client';

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, AlertTriangle } from 'lucide-react';
import { AppointmentForm } from '@/components/appointments/AppointmentForm';
import { useAppointments, useAppointment } from '@/hooks/useAppointments';
import { useDoctors } from '@/hooks/useDoctors';
import { usePatients } from '@/hooks/usePatients';
import { toast } from 'sonner';
import { Appointment, AppointmentUpdate } from '@/types/appointments';
import { Link } from 'react-router-dom';

interface EditAppointmentProps {
  appointmentId?: string;
}

export default function EditAppointment({ appointmentId }: EditAppointmentProps) {
  const params = useParams();
  const navigate = useNavigate();
  const id = appointmentId || (params?.id as string);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Hooks
  const { updateAppointment } = useAppointments();
  const { data: doctors, isLoading: doctorsLoading } = useDoctors();
  const { data: patients, isLoading: patientsLoading } = usePatients();
  const { data: appointment, isLoading: appointmentLoading, error } = useAppointment(id || '');

  const handleSubmit = async (data: AppointmentUpdate) => {
    setIsSubmitting(true);
    try {
      await updateAppointment({
        id,
        data
      });
      toast.success('Agendamento atualizado com sucesso!');
      navigate(`/appointments/${id}`);
    } catch (error: any) {
      console.error('Erro ao atualizar agendamento:', error);
      toast.error(error?.message || 'Erro ao atualizar agendamento');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const isLoading = doctorsLoading || patientsLoading || appointmentLoading;
  const canEdit = appointment && ['scheduled', 'confirmed'].includes(appointment.status);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="max-w-4xl">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !appointment) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Agendamento não encontrado
            </h3>
            <p className="text-gray-500 mb-4">
              O agendamento que você está tentando editar não existe ou foi removido.
            </p>
            <Link to="/appointments">
              <Button>
                Ver todos os agendamentos
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Cannot edit state
  if (!canEdit) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Agendamento não pode ser editado
            </h3>
            <p className="text-gray-500 mb-4">
              Este agendamento não pode ser editado devido ao seu status atual: {appointment.status}.
              Apenas agendamentos com status "Agendado" ou "Confirmado" podem ser editados.
            </p>
            <div className="flex space-x-2">
              <Link to={`/appointments/${id}`}>
                <Button variant="outline">
                  Ver Detalhes
                </Button>
              </Link>
              <Link to="/appointments">
                <Button>
                  Ver todos os agendamentos
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Editar Agendamento
            </h1>
            <p className="text-muted-foreground">
              Agendamento #{appointment.id} - {appointment.patient?.name || 'Paciente não identificado'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Edit className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      {/* Formulário */}
      <div className="max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Edit className="h-5 w-5 mr-2" />
              Informações do Agendamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AppointmentForm
              appointment={appointment}
              doctors={doctors?.data?.map(d => ({ id: d.id.toString(), name: d.full_name, crm: d.professional_license, specialty: d.specialty })) || []}
              patients={patients?.data?.map(p => ({ id: p.id.toString(), name: p.full_name, phone: p.phone, email: p.email })) || []}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              loading={isSubmitting}
              mode="edit"
            />
          </CardContent>
        </Card>
      </div>

      {/* Informações importantes */}
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle className="text-lg">Informações Importantes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Alterações na data ou horário podem afetar a disponibilidade do médico</p>
            <p>• O paciente será notificado automaticamente sobre as alterações</p>
            <p>• Verifique se não há conflitos com outros agendamentos</p>
            <p>• Mudanças significativas podem requerer nova confirmação do paciente</p>
            <p>• O histórico de alterações será mantido para auditoria</p>
          </div>
        </CardContent>
      </Card>

      {/* Status atual */}
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle className="text-lg">Status Atual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <label className="font-medium text-gray-500">Status:</label>
              <p className="mt-1">
                {appointment.status === 'scheduled' && 'Agendado'}
                {appointment.status === 'confirmed' && 'Confirmado'}
                {appointment.status === 'in_progress' && 'Em andamento'}
                {appointment.status === 'completed' && 'Concluído'}
                {appointment.status === 'cancelled' && 'Cancelado'}
                {appointment.status === 'no_show' && 'Faltou'}
              </p>
            </div>
            <div>
              <label className="font-medium text-gray-500">Criado em:</label>
              <p className="mt-1">
                {new Date(appointment.created_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            {appointment.updated_at && (
              <div>
                <label className="font-medium text-gray-500">Última atualização:</label>
                <p className="mt-1">
                  {new Date(appointment.updated_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}