'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Bed,
  CheckCircle,
  Clock,
  AlertTriangle,
  Wrench,
  Sparkles,
  Lock,
  Calendar,
  User,
  Edit3,
  RotateCcw,
  Play,
  Pause,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useBeds } from '@/hooks/useBeds';
import { toast } from 'sonner';

type BedStatus = 'available' | 'occupied' | 'maintenance' | 'cleaning' | 'reserved' | 'blocked';

interface BedStatusProps {
  bedId: string;
  currentStatus: BedStatus;
  lastUpdated?: Date;
  patientName?: string;
  patientId?: string;
  admissionDate?: Date;
  maintenanceReason?: string;
  cleaningType?: string;
  reservedFor?: string;
  reservationExpiry?: Date;
  blockReason?: string;
  className?: string;
  showActions?: boolean;
  onStatusChange?: (newStatus: BedStatus, details?: any) => void;
}

const statusConfig = {
  available: {
    label: 'Disponível',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
    description: 'Leito pronto para ocupação'
  },
  occupied: {
    label: 'Ocupado',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: User,
    description: 'Leito ocupado por paciente'
  },
  maintenance: {
    label: 'Manutenção',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: Wrench,
    description: 'Leito em manutenção'
  },
  cleaning: {
    label: 'Limpeza',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Sparkles,
    description: 'Leito em processo de limpeza'
  },
  reserved: {
    label: 'Reservado',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Calendar,
    description: 'Leito reservado'
  },
  blocked: {
    label: 'Bloqueado',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: Lock,
    description: 'Leito temporariamente indisponível'
  }
};

const statusTransitions = {
  available: ['occupied', 'maintenance', 'cleaning', 'reserved', 'blocked'],
  occupied: ['available', 'maintenance', 'cleaning'],
  maintenance: ['available', 'cleaning'],
  cleaning: ['available', 'maintenance'],
  reserved: ['available', 'occupied', 'maintenance', 'cleaning', 'blocked'],
  blocked: ['available', 'maintenance', 'cleaning']
};

const cleaningTypes = [
  { value: 'terminal', label: 'Limpeza Terminal' },
  { value: 'concurrent', label: 'Limpeza Concorrente' },
  { value: 'deep', label: 'Limpeza Profunda' },
  { value: 'disinfection', label: 'Desinfecção' }
];

const maintenanceTypes = [
  { value: 'preventive', label: 'Manutenção Preventiva' },
  { value: 'corrective', label: 'Manutenção Corretiva' },
  { value: 'equipment', label: 'Manutenção de Equipamentos' },
  { value: 'infrastructure', label: 'Manutenção de Infraestrutura' }
];

export function BedStatus({
  bedId,
  currentStatus,
  lastUpdated,
  patientName,
  patientId,
  admissionDate,
  maintenanceReason,
  cleaningType,
  reservedFor,
  reservationExpiry,
  blockReason,
  className,
  showActions = true,
  onStatusChange
}: BedStatusProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<BedStatus>(currentStatus);
  const [statusDetails, setStatusDetails] = useState({
    reason: '',
    notes: '',
    estimatedDuration: '',
    assignedTo: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    scheduledDate: '',
    scheduledTime: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const { updateBedStatus } = useBeds();
  const config = statusConfig[currentStatus];
  const Icon = config.icon;

  const availableTransitions = statusTransitions[currentStatus] || [];

  const handleStatusUpdate = async () => {
    if (selectedStatus === currentStatus) {
      setIsDialogOpen(false);
      return;
    }

    setIsUpdating(true);
    try {
      await updateBedStatus(bedId, {
        status: selectedStatus,
        ...statusDetails,
        updatedAt: new Date()
      });
      
      toast.success(`Status do leito atualizado para ${statusConfig[selectedStatus].label}`);
      onStatusChange?.(selectedStatus, statusDetails);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Erro ao atualizar status do leito:', error);
      toast.error('Erro ao atualizar status do leito');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusDuration = () => {
    if (!lastUpdated) return null;
    
    const now = new Date();
    const diffMs = now.getTime() - lastUpdated.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    }
    return `${diffMinutes}m`;
  };

  const getStatusDetails = () => {
    switch (currentStatus) {
      case 'occupied':
        return {
          primary: patientName || 'Paciente não identificado',
          secondary: admissionDate ? `Internado em ${format(admissionDate, 'dd/MM/yyyy HH:mm', { locale: ptBR })}` : null,
          tertiary: patientId ? `ID: ${patientId}` : null
        };
      case 'maintenance':
        return {
          primary: maintenanceReason || 'Manutenção em andamento',
          secondary: lastUpdated ? `Iniciado em ${format(lastUpdated, 'dd/MM/yyyy HH:mm', { locale: ptBR })}` : null,
          tertiary: getStatusDuration() ? `Duração: ${getStatusDuration()}` : null
        };
      case 'cleaning':
        return {
          primary: cleaningType || 'Limpeza em andamento',
          secondary: lastUpdated ? `Iniciado em ${format(lastUpdated, 'dd/MM/yyyy HH:mm', { locale: ptBR })}` : null,
          tertiary: getStatusDuration() ? `Duração: ${getStatusDuration()}` : null
        };
      case 'reserved':
        return {
          primary: reservedFor || 'Reservado',
          secondary: reservationExpiry ? `Expira em ${format(reservationExpiry, 'dd/MM/yyyy HH:mm', { locale: ptBR })}` : null,
          tertiary: lastUpdated ? `Reservado em ${format(lastUpdated, 'dd/MM/yyyy HH:mm', { locale: ptBR })}` : null
        };
      case 'blocked':
        return {
          primary: blockReason || 'Leito bloqueado',
          secondary: lastUpdated ? `Bloqueado em ${format(lastUpdated, 'dd/MM/yyyy HH:mm', { locale: ptBR })}` : null,
          tertiary: getStatusDuration() ? `Duração: ${getStatusDuration()}` : null
        };
      case 'available':
        return {
          primary: 'Pronto para ocupação',
          secondary: lastUpdated ? `Disponível desde ${format(lastUpdated, 'dd/MM/yyyy HH:mm', { locale: ptBR })}` : null,
          tertiary: getStatusDuration() ? `Há ${getStatusDuration()}` : null
        };
      default:
        return {
          primary: config.description,
          secondary: null,
          tertiary: null
        };
    }
  };

  const details = getStatusDetails();

  const renderStatusForm = () => {
    switch (selectedStatus) {
      case 'maintenance':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="maintenanceType">Tipo de Manutenção</Label>
              <Select onValueChange={(value) => setStatusDetails(prev => ({ ...prev, reason: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {maintenanceTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="assignedTo">Responsável</Label>
              <Input
                id="assignedTo"
                placeholder="Nome do responsável pela manutenção"
                value={statusDetails.assignedTo}
                onChange={(e) => setStatusDetails(prev => ({ ...prev, assignedTo: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="estimatedDuration">Duração Estimada</Label>
              <Input
                id="estimatedDuration"
                placeholder="Ex: 2 horas, 1 dia"
                value={statusDetails.estimatedDuration}
                onChange={(e) => setStatusDetails(prev => ({ ...prev, estimatedDuration: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                placeholder="Detalhes sobre a manutenção..."
                value={statusDetails.notes}
                onChange={(e) => setStatusDetails(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
        );
        
      case 'cleaning':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="cleaningType">Tipo de Limpeza</Label>
              <Select onValueChange={(value) => setStatusDetails(prev => ({ ...prev, reason: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {cleaningTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="assignedTo">Responsável</Label>
              <Input
                id="assignedTo"
                placeholder="Nome do responsável pela limpeza"
                value={statusDetails.assignedTo}
                onChange={(e) => setStatusDetails(prev => ({ ...prev, assignedTo: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="estimatedDuration">Duração Estimada</Label>
              <Input
                id="estimatedDuration"
                placeholder="Ex: 30 minutos, 1 hora"
                value={statusDetails.estimatedDuration}
                onChange={(e) => setStatusDetails(prev => ({ ...prev, estimatedDuration: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                placeholder="Detalhes sobre a limpeza..."
                value={statusDetails.notes}
                onChange={(e) => setStatusDetails(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
        );
        
      case 'reserved':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="reservedFor">Reservado para</Label>
              <Input
                id="reservedFor"
                placeholder="Nome do paciente ou procedimento"
                value={statusDetails.reason}
                onChange={(e) => setStatusDetails(prev => ({ ...prev, reason: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scheduledDate">Data</Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={statusDetails.scheduledDate}
                  onChange={(e) => setStatusDetails(prev => ({ ...prev, scheduledDate: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="scheduledTime">Horário</Label>
                <Input
                  id="scheduledTime"
                  type="time"
                  value={statusDetails.scheduledTime}
                  onChange={(e) => setStatusDetails(prev => ({ ...prev, scheduledTime: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                placeholder="Detalhes sobre a reserva..."
                value={statusDetails.notes}
                onChange={(e) => setStatusDetails(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
        );
        
      case 'blocked':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="blockReason">Motivo do Bloqueio</Label>
              <Input
                id="blockReason"
                placeholder="Motivo do bloqueio"
                value={statusDetails.reason}
                onChange={(e) => setStatusDetails(prev => ({ ...prev, reason: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="priority">Prioridade</Label>
              <Select 
                value={statusDetails.priority} 
                onValueChange={(value: 'low' | 'medium' | 'high') => 
                  setStatusDetails(prev => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="estimatedDuration">Duração Estimada</Label>
              <Input
                id="estimatedDuration"
                placeholder="Ex: 1 dia, indefinido"
                value={statusDetails.estimatedDuration}
                onChange={(e) => setStatusDetails(prev => ({ ...prev, estimatedDuration: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                placeholder="Detalhes sobre o bloqueio..."
                value={statusDetails.notes}
                onChange={(e) => setStatusDetails(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
        );
        
      default:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                placeholder="Observações sobre a mudança de status..."
                value={statusDetails.notes}
                onChange={(e) => setStatusDetails(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Badge 
          variant="outline" 
          className={cn("flex items-center space-x-2 px-3 py-1", config.color)}
        >
          <Icon className="h-4 w-4" />
          <span className="font-medium">{config.label}</span>
          {getStatusDuration() && (
            <>
              <span className="text-xs opacity-75">•</span>
              <span className="text-xs opacity-75">{getStatusDuration()}</span>
            </>
          )}
        </Badge>
        
        {showActions && availableTransitions.length > 0 && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Edit3 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Alterar Status do Leito</DialogTitle>
                <DialogDescription>
                  Selecione o novo status e forneça as informações necessárias.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="newStatus">Novo Status</Label>
                  <Select 
                    value={selectedStatus} 
                    onValueChange={(value: BedStatus) => setSelectedStatus(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={currentStatus}>
                        <div className="flex items-center space-x-2">
                          <Icon className="h-4 w-4" />
                          <span>{config.label} (Atual)</span>
                        </div>
                      </SelectItem>
                      {availableTransitions.map(status => {
                        const statusConf = statusConfig[status];
                        const StatusIcon = statusConf.icon;
                        return (
                          <SelectItem key={status} value={status}>
                            <div className="flex items-center space-x-2">
                              <StatusIcon className="h-4 w-4" />
                              <span>{statusConf.label}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedStatus !== currentStatus && renderStatusForm()}
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isUpdating}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleStatusUpdate}
                  disabled={isUpdating || selectedStatus === currentStatus}
                >
                  {isUpdating ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Atualizando...</span>
                    </div>
                  ) : (
                    'Atualizar Status'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      {/* Detalhes do Status */}
      <div className="text-sm space-y-1">
        {details.primary && (
          <div className="font-medium text-foreground">
            {details.primary}
          </div>
        )}
        {details.secondary && (
          <div className="text-muted-foreground">
            {details.secondary}
          </div>
        )}
        {details.tertiary && (
          <div className="text-xs text-muted-foreground">
            {details.tertiary}
          </div>
        )}
      </div>
      
      {/* Alertas e Indicadores */}
      {currentStatus === 'reserved' && reservationExpiry && new Date() > reservationExpiry && (
        <div className="flex items-center space-x-2 text-amber-600 text-xs">
          <AlertTriangle className="h-3 w-3" />
          <span>Reserva expirada</span>
        </div>
      )}
      
      {currentStatus === 'maintenance' && getStatusDuration() && (
        <div className="flex items-center space-x-2 text-orange-600 text-xs">
          <Clock className="h-3 w-3" />
          <span>Em manutenção há {getStatusDuration()}</span>
        </div>
      )}
      
      {currentStatus === 'cleaning' && getStatusDuration() && (
        <div className="flex items-center space-x-2 text-yellow-600 text-xs">
          <Sparkles className="h-3 w-3" />
          <span>Em limpeza há {getStatusDuration()}</span>
        </div>
      )}
    </div>
  );
}