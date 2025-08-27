import React from 'react';
import { Calendar, Clock, User, Phone, MapPin, FileText, Edit, Trash2, CheckCircle, XCircle, Play, Square } from 'lucide-react';
import { Appointment, AppointmentStatus } from '../../types/appointments';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface AppointmentCardProps {
  appointment: Appointment;
  variant?: 'default' | 'compact' | 'detailed';
  showActions?: boolean;
  onEdit?: (appointment: Appointment) => void;
  onView?: (appointment: Appointment) => void;
  onCancel?: (appointment: Appointment) => void;
  onConfirm?: (appointment: Appointment) => void;
  onStart?: (appointment: Appointment) => void;
  onComplete?: (appointment: Appointment) => void;
  onDelete?: (appointment: Appointment) => void;
  className?: string;
}

function AppointmentCard({
  appointment,
  variant = 'default',
  showActions = true,
  onEdit,
  onView,
  onCancel,
  onConfirm,
  onStart,
  onComplete,
  onDelete,
  className
}: AppointmentCardProps) {
  const getStatusConfig = (status: AppointmentStatus) => {
    const configs = {
      scheduled: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        text: 'Agendado',
        icon: Calendar
      },
      confirmed: {
        color: 'bg-green-100 text-green-800 border-green-200',
        text: 'Confirmado',
        icon: CheckCircle
      },
      in_progress: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        text: 'Em Andamento',
        icon: Play
      },
      completed: {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        text: 'Concluído',
        icon: CheckCircle
      },
      cancelled: {
        color: 'bg-red-100 text-red-800 border-red-200',
        text: 'Cancelado',
        icon: XCircle
      },
      no_show: {
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        text: 'Faltou',
        icon: XCircle
      }
    };
    return configs[status] || configs.scheduled;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      weekday: date.toLocaleDateString('pt-BR', { weekday: 'short' })
    };
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h${mins > 0 ? ` ${mins}min` : ''}`;
    }
    return `${mins}min`;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const canConfirm = appointment.status === 'scheduled';
  const canStart = appointment.status === 'confirmed';
  const canComplete = appointment.status === 'in_progress';
  const canCancel = ['scheduled', 'confirmed'].includes(appointment.status);
  const canEdit = ['scheduled', 'confirmed'].includes(appointment.status);

  const statusConfig = getStatusConfig(appointment.status);
  const dateInfo = formatDate(appointment.appointment_date);
  const StatusIcon = statusConfig.icon;

  if (variant === 'compact') {
    return (
      <Card className={cn('hover:shadow-md transition-shadow', className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={appointment.patient?.avatar} />
                <AvatarFallback className="text-xs">
                  {getInitials(appointment.patient?.name || 'P')}
                </AvatarFallback>
              </Avatar>
              
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm truncate">
                  {appointment.patient?.name || 'Paciente não informado'}
                </p>
                <p className="text-xs text-gray-500">
                  {dateInfo.time} • {appointment.doctor?.name || 'Médico não informado'}
                </p>
              </div>
            </div>
            
            <Badge className={cn('text-xs', statusConfig.color)}>
              {statusConfig.text}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={appointment.patient?.avatar} />
              <AvatarFallback>
                {getInitials(appointment.patient?.name || 'P')}
              </AvatarFallback>
            </Avatar>
            
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-lg truncate">
                {appointment.patient?.name || 'Paciente não informado'}
              </h3>
              <p className="text-sm text-gray-600">
                {appointment.doctor?.name || 'Médico não informado'}
              </p>
              {appointment.doctor?.specialty && (
                <p className="text-xs text-gray-500">
                  {appointment.doctor.specialty}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge className={cn('flex items-center space-x-1', statusConfig.color)}>
              <StatusIcon className="h-3 w-3" />
              <span>{statusConfig.text}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Informações de Data e Hora */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>{dateInfo.date} ({dateInfo.weekday})</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="h-4 w-4 text-gray-400" />
            <span>
              {dateInfo.time}
              {appointment.duration && (
                <span className="text-gray-500 ml-1">
                  • {formatDuration(appointment.duration)}
                </span>
              )}
            </span>
          </div>
        </div>
        
        {/* Informações Adicionais */}
        {variant === 'detailed' && (
          <div className="space-y-3">
            {appointment.patient?.phone && (
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{appointment.patient.phone}</span>
              </div>
            )}
            
            {appointment.room && (
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>Sala {appointment.room.name}</span>
              </div>
            )}
            
            {appointment.appointment_type && (
              <div className="flex items-center space-x-2 text-sm">
                <User className="h-4 w-4 text-gray-400" />
                <span>{appointment.appointment_type.name}</span>
                {appointment.appointment_type.duration && (
                  <span className="text-gray-500">
                    ({formatDuration(appointment.appointment_type.duration)})
                  </span>
                )}
              </div>
            )}
            
            {appointment.notes && (
              <div className="flex items-start space-x-2 text-sm">
                <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                <span className="text-gray-600">{appointment.notes}</span>
              </div>
            )}
            
            {appointment.price && (
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm text-gray-600">Valor:</span>
                <span className="font-semibold text-green-600">
                  R$ {appointment.price.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        )}
        
        {/* Ações */}
        {showActions && (
          <div className="flex items-center justify-end space-x-2 pt-3 border-t">
            <TooltipProvider>
              {canConfirm && onConfirm && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onConfirm(appointment)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Confirmar agendamento</p>
                  </TooltipContent>
                </Tooltip>
              )}
              
              {canStart && onStart && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onStart(appointment)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Iniciar consulta</p>
                  </TooltipContent>
                </Tooltip>
              )}
              
              {canComplete && onComplete && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onComplete(appointment)}
                      className="text-purple-600 hover:text-purple-700"
                    >
                      <Square className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Finalizar consulta</p>
                  </TooltipContent>
                </Tooltip>
              )}
              
              {canEdit && onEdit && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(appointment)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Editar agendamento</p>
                  </TooltipContent>
                </Tooltip>
              )}
              
              {canCancel && onCancel && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCancel(appointment)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Cancelar agendamento</p>
                  </TooltipContent>
                </Tooltip>
              )}
              
              {onDelete && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(appointment)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Excluir agendamento</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </TooltipProvider>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AppointmentCard;