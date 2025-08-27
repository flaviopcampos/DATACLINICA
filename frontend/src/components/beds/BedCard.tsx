'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Bed, 
  User, 
  Clock, 
  MapPin, 
  Settings, 
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity,
  Wrench,
  Sparkles,
  Calendar,
  Phone,
  FileText
} from 'lucide-react';
import { Bed as BedType, BedStatus } from '@/types/beds';
import { useBeds } from '@/hooks/useBeds';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface BedCardProps {
  bed: BedType;
  onSelect?: (bed: BedType) => void;
  onEdit?: (bed: BedType) => void;
  className?: string;
}

const statusConfig = {
  available: {
    label: 'Disponível',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
    iconColor: 'text-green-600'
  },
  occupied: {
    label: 'Ocupado',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: User,
    iconColor: 'text-blue-600'
  },
  maintenance: {
    label: 'Manutenção',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: Wrench,
    iconColor: 'text-orange-600'
  },
  cleaning: {
    label: 'Limpeza',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Sparkles,
    iconColor: 'text-purple-600'
  },
  reserved: {
    label: 'Reservado',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Calendar,
    iconColor: 'text-yellow-600'
  },
  blocked: {
    label: 'Bloqueado',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
    iconColor: 'text-red-600'
  }
};

export function BedCard({ bed, onSelect, onEdit, className }: BedCardProps) {
  const { updateBedStatus } = useBeds();
  
  const config = statusConfig[bed.status] || statusConfig.available;
  const StatusIcon = config.icon;

  const handleStatusChange = async (newStatus: BedStatus) => {
    try {
      await updateBedStatus({ 
        id: bed.id, 
        status: newStatus, 
        reason: `Status alterado para ${statusConfig[newStatus]?.label}` 
      });
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(bed);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOccupancyDuration = () => {
    if (bed.status !== 'occupied' || !bed.currentPatient?.admissionDate) {
      return null;
    }
    
    const admissionDate = new Date(bed.currentPatient.admissionDate);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - admissionDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else {
      const days = Math.floor(diffInHours / 24);
      const hours = diffInHours % 24;
      return `${days}d ${hours}h`;
    }
  };

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md",
        "border-l-4",
        config.color.includes('green') && "border-l-green-500",
        config.color.includes('blue') && "border-l-blue-500",
        config.color.includes('orange') && "border-l-orange-500",
        config.color.includes('purple') && "border-l-purple-500",
        config.color.includes('yellow') && "border-l-yellow-500",
        config.color.includes('red') && "border-l-red-500",
        className
      )}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bed className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg font-semibold">
              {bed.number}
            </CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={config.color}>
              <StatusIcon className={`h-3 w-3 mr-1 ${config.iconColor}`} />
              {config.label}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {bed.status !== 'available' && (
                  <DropdownMenuItem onClick={() => handleStatusChange('available')}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marcar como Disponível
                  </DropdownMenuItem>
                )}
                {bed.status !== 'maintenance' && (
                  <DropdownMenuItem onClick={() => handleStatusChange('maintenance')}>
                    <Wrench className="h-4 w-4 mr-2" />
                    Enviar para Manutenção
                  </DropdownMenuItem>
                )}
                {bed.status !== 'cleaning' && (
                  <DropdownMenuItem onClick={() => handleStatusChange('cleaning')}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Enviar para Limpeza
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEdit?.(bed)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Editar Leito
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className="h-4 w-4 mr-2" />
                  Ver Histórico
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Informações básicas */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Quarto:</span>
            <span className="font-medium">{bed.room?.number || 'N/A'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Tipo:</span>
            <span className="font-medium">{bed.type}</span>
          </div>
        </div>

        {/* Informações do paciente (se ocupado) */}
        {bed.status === 'occupied' && bed.currentPatient && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">
                  {bed.currentPatient.name}
                </span>
              </div>
              {getOccupancyDuration() && (
                <Badge variant="secondary" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {getOccupancyDuration()}
                </Badge>
              )}
            </div>
            <div className="text-xs text-blue-700 space-y-1">
              <div>Prontuário: {bed.currentPatient.medicalRecord}</div>
              {bed.currentPatient.admissionDate && (
                <div>Internação: {formatDate(bed.currentPatient.admissionDate)}</div>
              )}
              {bed.currentPatient.diagnosis && (
                <div>Diagnóstico: {bed.currentPatient.diagnosis}</div>
              )}
            </div>
          </div>
        )}

        {/* Informações de manutenção/limpeza */}
        {(bed.status === 'maintenance' || bed.status === 'cleaning') && bed.statusReason && (
          <div className={cn(
            "p-3 rounded-lg border",
            bed.status === 'maintenance' ? "bg-orange-50 border-orange-200" : "bg-purple-50 border-purple-200"
          )}>
            <div className="flex items-center space-x-2 mb-1">
              <StatusIcon className={cn(
                "h-4 w-4",
                bed.status === 'maintenance' ? "text-orange-600" : "text-purple-600"
              )} />
              <span className={cn(
                "font-medium text-sm",
                bed.status === 'maintenance' ? "text-orange-900" : "text-purple-900"
              )}>
                {config.label} em Andamento
              </span>
            </div>
            <div className={cn(
              "text-xs",
              bed.status === 'maintenance' ? "text-orange-700" : "text-purple-700"
            )}>
              {bed.statusReason}
            </div>
            {bed.statusUpdatedAt && (
              <div className={cn(
                "text-xs mt-1",
                bed.status === 'maintenance' ? "text-orange-600" : "text-purple-600"
              )}>
                Iniciado: {formatDate(bed.statusUpdatedAt)}
              </div>
            )}
          </div>
        )}

        {/* Equipamentos */}
        {bed.equipment && bed.equipment.length > 0 && (
          <div className="border-t pt-2">
            <div className="text-xs text-muted-foreground mb-1">Equipamentos:</div>
            <div className="flex flex-wrap gap-1">
              {bed.equipment.slice(0, 3).map((equipment, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {equipment.name}
                </Badge>
              ))}
              {bed.equipment.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{bed.equipment.length - 3} mais
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Última atualização */}
        <div className="text-xs text-muted-foreground border-t pt-2">
          Atualizado: {formatDate(bed.updatedAt)}
        </div>
      </CardContent>
    </Card>
  );
}