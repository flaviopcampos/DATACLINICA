import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertTriangle,
  Calendar,
  Clock,
  RefreshCw,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Settings,
  Users,
  ArrowRight,
  AlertCircle,
  Zap,
  History,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { useAppointments } from '@/hooks/useAppointments';
import { useAvailability } from '@/hooks/useAvailability';
import {
  ScheduleConflict,
  RescheduleRequest,
  Appointment,
  AppointmentUpdate
} from '@/types/appointments';

interface ConflictManagerProps {
  clinicId?: number;
  doctorId?: number;
}

interface ConflictResolution {
  id: number;
  conflict_id: number;
  resolution_type: 'reschedule' | 'cancel' | 'override' | 'split';
  new_datetime?: string;
  reason: string;
  auto_resolved: boolean;
  resolved_by: string;
  resolved_at: string;
}

interface AutoRescheduleSettings {
  enabled: boolean;
  max_attempts: number;
  time_window_hours: number;
  priority_rules: {
    emergency_first: boolean;
    returning_patients: boolean;
    vip_patients: boolean;
  };
  notification_settings: {
    notify_patient: boolean;
    notify_doctor: boolean;
    advance_notice_hours: number;
  };
}

function ConflictManager({ clinicId, doctorId }: ConflictManagerProps) {
  const [activeTab, setActiveTab] = useState('conflicts');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConflicts, setSelectedConflicts] = useState<number[]>([]);
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [selectedConflict, setSelectedConflict] = useState<ScheduleConflict | null>(null);
  const [autoRescheduleSettings, setAutoRescheduleSettings] = useState<AutoRescheduleSettings>({
    enabled: true,
    max_attempts: 3,
    time_window_hours: 48,
    priority_rules: {
      emergency_first: true,
      returning_patients: true,
      vip_patients: false
    },
    notification_settings: {
      notify_patient: true,
      notify_doctor: true,
      advance_notice_hours: 24
    }
  });

  const queryClient = useQueryClient();

  // Mock data para conflitos (seria substituído por hooks reais)
  const conflicts: ScheduleConflict[] = [
    {
      id: 1,
      type: 'double_booking',
      severity: 'high',
      appointments: [
        {
          id: 101,
          patient_id: 1,
          doctor_id: 1,
          datetime: '2024-01-15T10:00:00',
          duration: 30,
          status: 'scheduled',
          type: 'consultation',
          patient: { id: 1, name: 'João Silva', phone: '(11) 99999-9999' },
          doctor: { id: 1, name: 'Dr. Maria Santos', specialty: 'Cardiologia' }
        },
        {
          id: 102,
          patient_id: 2,
          doctor_id: 1,
          datetime: '2024-01-15T10:00:00',
          duration: 30,
          status: 'scheduled',
          type: 'consultation',
          patient: { id: 2, name: 'Ana Costa', phone: '(11) 88888-8888' },
          doctor: { id: 1, name: 'Dr. Maria Santos', specialty: 'Cardiologia' }
        }
      ],
      description: 'Dois agendamentos no mesmo horário',
      detected_at: '2024-01-14T15:30:00',
      resolved: false
    },
    {
      id: 2,
      type: 'unavailable_doctor',
      severity: 'medium',
      appointments: [
        {
          id: 103,
          patient_id: 3,
          doctor_id: 2,
          datetime: '2024-01-16T14:00:00',
          duration: 45,
          status: 'scheduled',
          type: 'consultation',
          patient: { id: 3, name: 'Carlos Oliveira', phone: '(11) 77777-7777' },
          doctor: { id: 2, name: 'Dr. Pedro Lima', specialty: 'Ortopedia' }
        }
      ],
      description: 'Médico não disponível no horário agendado',
      detected_at: '2024-01-14T16:00:00',
      resolved: false
    }
  ];

  // Mock data para solicitações de reagendamento
  const rescheduleRequests: RescheduleRequest[] = [
    {
      id: 1,
      appointment_id: 101,
      requested_by: 'patient',
      current_datetime: '2024-01-15T10:00:00',
      requested_datetime: '2024-01-16T10:00:00',
      reason: 'Conflito de horário',
      status: 'pending',
      created_at: '2024-01-14T14:00:00',
      appointment: {
        id: 101,
        patient_id: 1,
        doctor_id: 1,
        datetime: '2024-01-15T10:00:00',
        duration: 30,
        status: 'scheduled',
        type: 'consultation',
        patient: { id: 1, name: 'João Silva', phone: '(11) 99999-9999' },
        doctor: { id: 1, name: 'Dr. Maria Santos', specialty: 'Cardiologia' }
      }
    }
  ];

  // Mock data para resoluções
  const resolutions: ConflictResolution[] = [
    {
      id: 1,
      conflict_id: 1,
      resolution_type: 'reschedule',
      new_datetime: '2024-01-15T11:00:00',
      reason: 'Reagendamento automático para próximo horário disponível',
      auto_resolved: true,
      resolved_by: 'Sistema',
      resolved_at: '2024-01-14T15:35:00'
    }
  ];

  // Filtrar conflitos por termo de busca
  const filteredConflicts = conflicts.filter(conflict =>
    conflict.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conflict.appointments.some(apt => 
      apt.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.doctor?.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Filtrar solicitações de reagendamento
  const filteredRescheduleRequests = rescheduleRequests.filter(request =>
    request.appointment?.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.appointment?.doctor?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Função para obter cor da severidade
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Função para obter ícone do tipo de conflito
  const getConflictIcon = (type: string) => {
    switch (type) {
      case 'double_booking':
        return <Users className="h-4 w-4" />;
      case 'unavailable_doctor':
        return <XCircle className="h-4 w-4" />;
      case 'room_conflict':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Função para resolver conflito automaticamente
  const autoResolveConflict = useCallback(async (conflictId: number) => {
    try {
      // Aqui seria chamada a API para resolver automaticamente
      toast.success('Conflito resolvido automaticamente');
      queryClient.invalidateQueries({ queryKey: ['conflicts'] });
    } catch (error) {
      toast.error('Erro ao resolver conflito automaticamente');
    }
  }, [queryClient]);

  // Função para resolver conflito manualmente
  const resolveConflictManually = useCallback(async (resolution: Partial<ConflictResolution>) => {
    try {
      // Aqui seria chamada a API para resolver manualmente
      toast.success('Conflito resolvido com sucesso');
      setIsResolveDialogOpen(false);
      setSelectedConflict(null);
      queryClient.invalidateQueries({ queryKey: ['conflicts'] });
    } catch (error) {
      toast.error('Erro ao resolver conflito');
    }
  }, [queryClient]);

  // Função para aprovar/rejeitar reagendamento
  const handleRescheduleRequest = useCallback(async (requestId: number, action: 'approve' | 'reject', reason?: string) => {
    try {
      // Aqui seria chamada a API para aprovar/rejeitar
      toast.success(`Solicitação ${action === 'approve' ? 'aprovada' : 'rejeitada'} com sucesso`);
      queryClient.invalidateQueries({ queryKey: ['reschedule-requests'] });
    } catch (error) {
      toast.error('Erro ao processar solicitação');
    }
  }, [queryClient]);

  // Componente para resolver conflito
  const ResolveConflictDialog = () => {
    const [resolutionData, setResolutionData] = useState({
      resolution_type: 'reschedule' as const,
      new_datetime: '',
      reason: ''
    });

    const handleResolve = () => {
      if (!selectedConflict) return;
      
      resolveConflictManually({
        conflict_id: selectedConflict.id,
        ...resolutionData,
        auto_resolved: false,
        resolved_by: 'Usuário', // Seria obtido do contexto de autenticação
        resolved_at: new Date().toISOString()
      });
    };

    return (
      <Dialog open={isResolveDialogOpen} onOpenChange={setIsResolveDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Resolver Conflito</DialogTitle>
            <DialogDescription>
              Escolha como resolver este conflito de agendamento
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resolution-type">Tipo de Resolução</Label>
              <Select
                value={resolutionData.resolution_type}
                onValueChange={(value: any) => 
                  setResolutionData(prev => ({ ...prev, resolution_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reschedule">Reagendar</SelectItem>
                  <SelectItem value="cancel">Cancelar</SelectItem>
                  <SelectItem value="override">Sobrescrever</SelectItem>
                  <SelectItem value="split">Dividir Horário</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {resolutionData.resolution_type === 'reschedule' && (
              <div className="space-y-2">
                <Label htmlFor="new-datetime">Nova Data/Hora</Label>
                <Input
                  id="new-datetime"
                  type="datetime-local"
                  value={resolutionData.new_datetime}
                  onChange={(e) => 
                    setResolutionData(prev => ({ ...prev, new_datetime: e.target.value }))
                  }
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo</Label>
              <Textarea
                id="reason"
                placeholder="Descreva o motivo da resolução..."
                value={resolutionData.reason}
                onChange={(e) => 
                  setResolutionData(prev => ({ ...prev, reason: e.target.value }))
                }
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResolveDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleResolve}>
              Resolver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // Componente para configurações de reagendamento automático
  const AutoRescheduleSettingsDialog = () => {
    const handleSaveSettings = () => {
      // Aqui seria chamada a API para salvar as configurações
      toast.success('Configurações salvas com sucesso');
      setIsSettingsDialogOpen(false);
    };

    return (
      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Configurações de Reagendamento Automático</DialogTitle>
            <DialogDescription>
              Configure como o sistema deve lidar com conflitos automaticamente
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-enabled">Reagendamento Automático</Label>
                <p className="text-sm text-muted-foreground">
                  Permitir que o sistema resolva conflitos automaticamente
                </p>
              </div>
              <Switch
                id="auto-enabled"
                checked={autoRescheduleSettings.enabled}
                onCheckedChange={(checked) => 
                  setAutoRescheduleSettings(prev => ({ ...prev, enabled: checked }))
                }
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max-attempts">Máximo de Tentativas</Label>
                <Input
                  id="max-attempts"
                  type="number"
                  min="1"
                  max="10"
                  value={autoRescheduleSettings.max_attempts}
                  onChange={(e) => 
                    setAutoRescheduleSettings(prev => ({ 
                      ...prev, 
                      max_attempts: parseInt(e.target.value) 
                    }))
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time-window">Janela de Tempo (horas)</Label>
                <Input
                  id="time-window"
                  type="number"
                  min="1"
                  max="168"
                  value={autoRescheduleSettings.time_window_hours}
                  onChange={(e) => 
                    setAutoRescheduleSettings(prev => ({ 
                      ...prev, 
                      time_window_hours: parseInt(e.target.value) 
                    }))
                  }
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <Label>Regras de Prioridade</Label>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="emergency-first">Emergências Primeiro</Label>
                <Switch
                  id="emergency-first"
                  checked={autoRescheduleSettings.priority_rules.emergency_first}
                  onCheckedChange={(checked) => 
                    setAutoRescheduleSettings(prev => ({ 
                      ...prev, 
                      priority_rules: { ...prev.priority_rules, emergency_first: checked }
                    }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="returning-patients">Pacientes Retornantes</Label>
                <Switch
                  id="returning-patients"
                  checked={autoRescheduleSettings.priority_rules.returning_patients}
                  onCheckedChange={(checked) => 
                    setAutoRescheduleSettings(prev => ({ 
                      ...prev, 
                      priority_rules: { ...prev.priority_rules, returning_patients: checked }
                    }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="vip-patients">Pacientes VIP</Label>
                <Switch
                  id="vip-patients"
                  checked={autoRescheduleSettings.priority_rules.vip_patients}
                  onCheckedChange={(checked) => 
                    setAutoRescheduleSettings(prev => ({ 
                      ...prev, 
                      priority_rules: { ...prev.priority_rules, vip_patients: checked }
                    }))
                  }
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <Label>Configurações de Notificação</Label>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="notify-patient">Notificar Paciente</Label>
                <Switch
                  id="notify-patient"
                  checked={autoRescheduleSettings.notification_settings.notify_patient}
                  onCheckedChange={(checked) => 
                    setAutoRescheduleSettings(prev => ({ 
                      ...prev, 
                      notification_settings: { ...prev.notification_settings, notify_patient: checked }
                    }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="notify-doctor">Notificar Médico</Label>
                <Switch
                  id="notify-doctor"
                  checked={autoRescheduleSettings.notification_settings.notify_doctor}
                  onCheckedChange={(checked) => 
                    setAutoRescheduleSettings(prev => ({ 
                      ...prev, 
                      notification_settings: { ...prev.notification_settings, notify_doctor: checked }
                    }))
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="advance-notice">Aviso Antecipado (horas)</Label>
                <Input
                  id="advance-notice"
                  type="number"
                  min="1"
                  max="72"
                  value={autoRescheduleSettings.notification_settings.advance_notice_hours}
                  onChange={(e) => 
                    setAutoRescheduleSettings(prev => ({ 
                      ...prev, 
                      notification_settings: { 
                        ...prev.notification_settings, 
                        advance_notice_hours: parseInt(e.target.value) 
                      }
                    }))
                  }
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveSettings}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestão de Conflitos</h2>
          <p className="text-muted-foreground">
            Gerencie conflitos de agendamento e solicitações de reagendamento
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSettingsDialogOpen(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conflitos Ativos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conflicts.filter(c => !c.resolved).length}</div>
            <p className="text-xs text-muted-foreground">
              Requerem atenção
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reagendamentos</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rescheduleRequests.filter(r => r.status === 'pending').length}</div>
            <p className="text-xs text-muted-foreground">
              Solicitações pendentes
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto-Resolvidos</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolutions.filter(r => r.auto_resolved).length}</div>
            <p className="text-xs text-muted-foreground">
              Hoje
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">95%</div>
            <p className="text-xs text-muted-foreground">
              Resolução automática
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="conflicts" className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Conflitos</span>
            <Badge variant="destructive" className="ml-2">
              {conflicts.filter(c => !c.resolved).length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="reschedule-requests" className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Reagendamentos</span>
            <Badge variant="secondary" className="ml-2">
              {rescheduleRequests.filter(r => r.status === 'pending').length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <History className="h-4 w-4" />
            <span>Histórico</span>
          </TabsTrigger>
        </TabsList>

        {/* Aba de Conflitos */}
        <TabsContent value="conflicts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Conflitos de Agendamento</CardTitle>
                  <CardDescription>
                    Conflitos detectados que requerem resolução
                  </CardDescription>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar conflitos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Severidade</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Agendamentos</TableHead>
                    <TableHead>Detectado em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConflicts.map((conflict) => (
                    <TableRow key={conflict.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getConflictIcon(conflict.type)}
                          <span className="capitalize">{conflict.type.replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(conflict.severity)}>
                          {conflict.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {conflict.description}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {conflict.appointments.map((apt, index) => (
                            <div key={apt.id} className="text-sm">
                              <span className="font-medium">{apt.patient?.name}</span>
                              <span className="text-muted-foreground ml-2">
                                {new Date(apt.datetime).toLocaleString('pt-BR')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(conflict.detected_at).toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => autoResolveConflict(conflict.id)}
                          >
                            <Zap className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedConflict(conflict);
                              setIsResolveDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredConflicts.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Nenhum conflito encontrado
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Solicitações de Reagendamento */}
        <TabsContent value="reschedule-requests" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Solicitações de Reagendamento</CardTitle>
                  <CardDescription>
                    Solicitações pendentes de reagendamento
                  </CardDescription>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar solicitações..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Médico</TableHead>
                    <TableHead>Data Atual</TableHead>
                    <TableHead>Data Solicitada</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRescheduleRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.appointment?.patient?.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {request.appointment?.patient?.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.appointment?.doctor?.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {request.appointment?.doctor?.specialty}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(request.current_datetime).toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        {new Date(request.requested_datetime).toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {request.reason}
                      </TableCell>
                      <TableCell>
                        <Badge variant={request.status === 'pending' ? 'secondary' : 'default'}>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {request.status === 'pending' && (
                          <div className="flex items-center space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRescheduleRequest(request.id, 'approve')}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRescheduleRequest(request.id, 'reject')}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredRescheduleRequests.length === 0 && (
                <div className="text-center py-8">
                  <RefreshCw className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Nenhuma solicitação encontrada
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Histórico */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Resoluções</CardTitle>
              <CardDescription>
                Histórico de conflitos resolvidos e reagendamentos
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Conflito</TableHead>
                    <TableHead>Resolução</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Resolvido por</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Automático</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resolutions.map((resolution) => (
                    <TableRow key={resolution.id}>
                      <TableCell>#{resolution.conflict_id}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {resolution.resolution_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {resolution.reason}
                      </TableCell>
                      <TableCell>{resolution.resolved_by}</TableCell>
                      <TableCell>
                        {new Date(resolution.resolved_at).toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        {resolution.auto_resolved ? (
                          <Badge className="bg-green-100 text-green-800">
                            <Zap className="h-3 w-3 mr-1" />
                            Sim
                          </Badge>
                        ) : (
                          <Badge variant="outline">Manual</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {resolutions.length === 0 && (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Nenhuma resolução no histórico
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <ResolveConflictDialog />
      <AutoRescheduleSettingsDialog />
    </div>
  );
}

export default ConflictManager;