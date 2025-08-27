'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarInitials } from '@/components/ui/avatar';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Appointment } from '@/types/appointments';
import { cn } from '@/lib/utils';

interface AppointmentCardProps {
  appointment: Appointment;
  onEdit?: (appointment: Appointment) => void;
  onCancel?: (appointment: Appointment) => void;
  onConfirm?: (appointment: Appointment) => void;
  onReschedule?: (appointment: Appointment) => void;
  onDelete?: (appointment: Appointment) => void;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

const statusConfig = {
  scheduled: {
    label: 'Agendado',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Calendar
  },
  confirmed: {
    label: 'Confirmado',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle
  },
  in_progress: {
    label: 'Em Andamento',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock
  },
  completed: {
    label: 'Concluído',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: CheckCircle
  },
  cancelled: {
    label: 'Cancelado',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle
  },
  no_show: {
    label: 'Não Compareceu',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: AlertCircle
  },
  rescheduled: {
    label: 'Reagendado',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: RotateCcw
  }
};

const typeConfig = {
  consultation: 'Consulta',
  follow_up: 'Retorno',
  procedure: 'Procedimento',
  emergency: 'Emergência',
  routine_checkup: 'Check-up',
  specialist_consultation: 'Especialista'
};

export function AppointmentCard({
  appointment,
  onEdit,
  onCancel,
  onConfirm,
  onReschedule,
  onDelete,
  showActions = true,
  compact = false,
  className
}: AppointmentCardProps) {
  const status = statusConfig[appointment.status];
  const StatusIcon = status.icon;
  
  const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
  const endDateTime = new Date(appointmentDateTime.getTime() + (appointment.duration * 60 * 1000));
  
  const isUpcoming = appointmentDateTime > new Date();
  const isPast = appointmentDateTime < new Date();
  const isToday = format(appointmentDateTime, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  const getPatientInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const canEdit = ['scheduled', 'confirmed'].includes(appointment.status);
  const canCancel = ['scheduled', 'confirmed'].includes(appointment.status);
  const canConfirm = appointment.status === 'scheduled';
  const canReschedule = ['scheduled', 'confirmed'].includes(appointment.status);

  if (compact) {
    return (
      <Card className={cn('hover:shadow-md transition-shadow', className)}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {appointment.patient?.name ? getPatientInitials(appointment.patient.name) : 'P'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {appointment.patient?.name || 'Paciente não informado'}
                </p>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>
                    {format(appointmentDateTime, 'HH:mm', { locale: ptBR })}
                  </span>
                  <span>•</span>
                  <span>{appointment.duration}min</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={cn('text-xs', status.color)}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {status.label}
              </Badge>
              
              {showActions && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {canEdit && onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(appointment)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                    )}
                    {canConfirm && onConfirm && (
                      <DropdownMenuItem onClick={() => onConfirm(appointment)}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirmar
                      </DropdownMenuItem>
                    )}
                    {canReschedule && onReschedule && (
                      <DropdownMenuItem onClick={() => onReschedule(appointment)}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reagendar
                      </DropdownMenuItem>
                    )}
                    {canCancel && onCancel && (
                      <DropdownMenuItem onClick={() => onCancel(appointment)}>
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancelar
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem 
                        onClick={() => onDelete(appointment)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      'hover:shadow-lg transition-all duration-200',
      isToday && 'ring-2 ring-blue-200 bg-blue-50/30',
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback>
                {appointment.patient?.name ? getPatientInitials(appointment.patient.name) : 'P'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {appointment.patient?.name || 'Paciente não informado'}
              </h3>
              
              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                {appointment.patient?.phone && (
                  <div className="flex items-center space-x-1">
                    <Phone className="h-4 w-4" />
                    <span>{appointment.patient.phone}</span>
                  </div>
                )}
                {appointment.patient?.email && (
                  <div className="flex items-center space-x-1">
                    <Mail className="h-4 w-4" />
                    <span>{appointment.patient.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className={status.color}>
              <StatusIcon className="h-4 w-4 mr-1" />
              {status.label}
            </Badge>
            
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canEdit && onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(appointment)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                  )}
                  {canConfirm && onConfirm && (
                    <DropdownMenuItem onClick={() => onConfirm(appointment)}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirmar
                    </DropdownMenuItem>
                  )}
                  {canReschedule && onReschedule && (
                    <DropdownMenuItem onClick={() => onReschedule(appointment)}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reagendar
                    </DropdownMenuItem>
                  )}
                  {canCancel && onCancel && (
                    <DropdownMenuItem onClick={() => onCancel(appointment)}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancelar
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem 
                      onClick={() => onDelete(appointment)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Data:</span>
              <span>
                {format(appointmentDateTime, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Horário:</span>
              <span>
                {format(appointmentDateTime, 'HH:mm', { locale: ptBR })} - 
                {format(endDateTime, 'HH:mm', { locale: ptBR })}
              </span>
              <span className="text-gray-500">({appointment.duration}min)</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Médico:</span>
              <span>{appointment.doctor?.name || 'Não informado'}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <span className="font-medium">Tipo:</span>
              <Badge variant="secondary">
                {typeConfig[appointment.type] || appointment.type}
              </Badge>
            </div>
            
            {appointment.doctor?.specialty && (
              <div className="flex items-center space-x-2 text-sm">
                <span className="font-medium">Especialidade:</span>
                <span>{appointment.doctor.specialty}</span>
              </div>
            )}
            
            {appointment.notes && (
              <div className="text-sm">
                <span className="font-medium">Observações:</span>
                <p className="text-gray-600 mt-1">{appointment.notes}</p>
              </div>
            )}
          </div>
        </div>
        
        {isToday && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2 text-blue-800">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Agendamento de hoje</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}