import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import {
  Bed,
  User,
  Calendar,
  MoreVertical,
  UserCheck,
  UserX,
  Settings,
  Wrench,
  Ban,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { Bed as BedType, BedStatus } from '@/types/beds';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BedCardProps {
  bed: BedType;
  onStatusChange: (bedId: string, status: BedStatus) => void;
  onAssignPatient?: (bedId: string) => void;
  onViewHistory?: (bedId: string) => void;
  className?: string;
}

const statusConfig = {
  AVAILABLE: {
    color: 'bg-green-100 border-green-200 text-green-800',
    icon: CheckCircle,
    iconColor: 'text-green-600',
    label: 'Disponível'
  },
  OCCUPIED: {
    color: 'bg-red-100 border-red-200 text-red-800',
    icon: User,
    iconColor: 'text-red-600',
    label: 'Ocupado'
  },
  MAINTENANCE: {
    color: 'bg-yellow-100 border-yellow-200 text-yellow-800',
    icon: Wrench,
    iconColor: 'text-yellow-600',
    label: 'Manutenção'
  },
  BLOCKED: {
    color: 'bg-gray-100 border-gray-200 text-gray-800',
    icon: Ban,
    iconColor: 'text-gray-600',
    label: 'Bloqueado'
  },
  CLEANING: {
    color: 'bg-blue-100 border-blue-200 text-blue-800',
    icon: Settings,
    iconColor: 'text-blue-600',
    label: 'Limpeza'
  }
};

export default function BedCard({ 
  bed, 
  onStatusChange, 
  onAssignPatient, 
  onViewHistory,
  className = '' 
}: BedCardProps) {
  const config = statusConfig[bed.status];
  const StatusIcon = config.icon;

  const handleStatusChange = (newStatus: BedStatus) => {
    onStatusChange(bed.id, newStatus);
    toast.success(`Status do leito ${bed.number} alterado para ${statusConfig[newStatus].label}`);
  };

  const handleAssignPatient = () => {
    if (onAssignPatient) {
      onAssignPatient(bed.id);
    }
  };

  const handleViewHistory = () => {
    if (onViewHistory) {
      onViewHistory(bed.id);
    }
  };

  const getQuickActions = () => {
    const actions = [];
    
    if (bed.status === 'AVAILABLE') {
      actions.push(
        <DropdownMenuItem key="assign" onClick={handleAssignPatient}>
          <UserCheck className="h-4 w-4 mr-2" />
          Internar Paciente
        </DropdownMenuItem>
      );
    }
    
    if (bed.status === 'OCCUPIED') {
      actions.push(
        <DropdownMenuItem key="discharge" onClick={() => handleStatusChange('CLEANING')}>
          <UserX className="h-4 w-4 mr-2" />
          Dar Alta
        </DropdownMenuItem>
      );
    }
    
    if (bed.status === 'CLEANING') {
      actions.push(
        <DropdownMenuItem key="available" onClick={() => handleStatusChange('AVAILABLE')}>
          <CheckCircle className="h-4 w-4 mr-2" />
          Marcar como Disponível
        </DropdownMenuItem>
      );
    }
    
    if (bed.status !== 'MAINTENANCE') {
      actions.push(
        <DropdownMenuItem key="maintenance" onClick={() => handleStatusChange('MAINTENANCE')}>
          <Wrench className="h-4 w-4 mr-2" />
          Enviar para Manutenção
        </DropdownMenuItem>
      );
    }
    
    if (bed.status !== 'BLOCKED') {
      actions.push(
        <DropdownMenuItem key="block" onClick={() => handleStatusChange('BLOCKED')}>
          <Ban className="h-4 w-4 mr-2" />
          Bloquear Leito
        </DropdownMenuItem>
      );
    }
    
    if (bed.status === 'MAINTENANCE' || bed.status === 'BLOCKED') {
      actions.push(
        <DropdownMenuItem key="unblock" onClick={() => handleStatusChange('AVAILABLE')}>
          <CheckCircle className="h-4 w-4 mr-2" />
          Liberar Leito
        </DropdownMenuItem>
      );
    }
    
    return actions;
  };

  return (
    <Card className={`${config.color} border-2 transition-all duration-200 hover:shadow-md ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg bg-white/50`}>
              <Bed className={`h-5 w-5 ${config.iconColor}`} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Leito {bed.number}</h3>
              <p className="text-sm opacity-75">{bed.room.name}</p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {getQuickActions()}
              {onViewHistory && (
                <DropdownMenuItem onClick={handleViewHistory}>
                  <Clock className="h-4 w-4 mr-2" />
                  Ver Histórico
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="bg-white/50">
              <StatusIcon className={`h-3 w-3 mr-1 ${config.iconColor}`} />
              {config.label}
            </Badge>
            <span className="text-xs opacity-75">
              {bed.bed_type === 'STANDARD' ? 'Padrão' :
               bed.bed_type === 'ICU' ? 'UTI' :
               bed.bed_type === 'SEMI_ICU' ? 'Semi-UTI' : 'Isolamento'}
            </span>
          </div>

          {bed.current_patient && (
            <div className="bg-white/30 rounded-lg p-2 mt-2">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {bed.current_patient.name}
                  </p>
                  <p className="text-xs opacity-75">
                    Desde {format(new Date(bed.current_patient.admission_date), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {bed.status === 'MAINTENANCE' && bed.maintenance_reason && (
            <div className="bg-white/30 rounded-lg p-2 mt-2">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 mt-0.5" />
                <div>
                  <p className="text-xs font-medium">Motivo da Manutenção:</p>
                  <p className="text-xs opacity-75">{bed.maintenance_reason}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs opacity-75 pt-2 border-t border-white/20">
            <span>Depto: {bed.room.department.name}</span>
            <span>Andar: {bed.room.floor}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}