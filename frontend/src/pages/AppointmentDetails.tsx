import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, User, Phone, Mail, MapPin, FileText, 
  Edit, Trash2, ArrowLeft, Save, X, AlertCircle, CheckCircle,
  UserCheck, UserX, Play, Square, MoreHorizontal, History,
  MessageSquare, Bell, CreditCard, Printer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AppointmentForm from '../components/appointments/AppointmentForm';
import { useAppointments } from '../hooks/useAppointments';
import { Appointment, AppointmentUpdate } from '../types/appointments';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AppointmentDetailsProps {
  className?: string;
}

function AppointmentDetails({ className }: AppointmentDetailsProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    getAppointment, 
    updateAppointment, 
    cancelAppointment, 
    confirmAppointment,
    startAppointment,
    completeAppointment,
    markNoShow,
    deleteAppointment,
    isLoading,
    isUpdating
  } = useAppointments();
  
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [editData, setEditData] = useState<Partial<AppointmentUpdate>>({});
  
  useEffect(() => {
    if (id) {
      loadAppointment();
    }
  }, [id]);
  
  const loadAppointment = async () => {
    if (!id) return;
    
    try {
      const data = await getAppointment(id);
      setAppointment(data);
      setEditData(data);
    } catch (error) {
      toast.error('Erro ao carregar agendamento');
      navigate('/appointments');
    }
  };
  
  const handleSave = async () => {
    if (!appointment || !id) return;
    
    try {
      const updatedAppointment = await updateAppointment(id, editData as AppointmentUpdate);
      setAppointment(updatedAppointment);
      setIsEditing(false);
      toast.success('Agendamento atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar agendamento');
    }
  };
  
  const handleCancel = () => {
    setEditData(appointment || {});
    setIsEditing(false);
  };
  
  const handleStatusChange = async (action: string) => {
    if (!appointment || !id) return;
    
    try {
      let updatedAppointment: Appointment;
      
      switch (action) {
        case 'confirm':
          updatedAppointment = await confirmAppointment(id);
          toast.success('Agendamento confirmado!');
          break;
        case 'start':
          updatedAppointment = await startAppointment(id);
          toast.success('Consulta iniciada!');
          break;
        case 'complete':
          updatedAppointment = await completeAppointment(id);
          toast.success('Consulta finalizada!');
          break;
        case 'no-show':
          updatedAppointment = await markNoShow(id);
          toast.success('Marcado como falta!');
          break;
        case 'cancel':
          updatedAppointment = await cancelAppointment(id);
          toast.success('Agendamento cancelado!');
          setShowCancelDialog(false);
          break;
        default:
          return;
      }
      
      setAppointment(updatedAppointment);
    } catch (error) {
      toast.error('Erro ao atualizar status do agendamento');
    }
  };
  
  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await deleteAppointment(id);
      toast.success('Agendamento excluído com sucesso!');
      navigate('/appointments');
    } catch (error) {
      toast.error('Erro ao excluir agendamento');
    }
  };
  
  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-emerald-100 text-emerald-800',
      cancelled: 'bg-red-100 text-red-800',
      no_show: 'bg-gray-100 text-gray-800',
      rescheduled: 'bg-purple-100 text-purple-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };
  
  const getStatusText = (status: string) => {
    const texts = {
      scheduled: 'Agendado',
      confirmed: 'Confirmado',
      in_progress: 'Em Andamento',
      completed: 'Concluído',
      cancelled: 'Cancelado',
      no_show: 'Faltou',
      rescheduled: 'Reagendado'
    };
    return texts[status as keyof typeof texts] || status;
  };
  
  const getAvailableActions = () => {
    if (!appointment) return [];
    
    const actions = [];
    
    switch (appointment.status) {
      case 'scheduled':
        actions.push(
          { id: 'confirm', label: 'Confirmar', icon: CheckCircle, color: 'text-green-600' },
          { id: 'cancel', label: 'Cancelar', icon: X, color: 'text-red-600' }
        );
        break;
      case 'confirmed':
        actions.push(
          { id: 'start', label: 'Iniciar Consulta', icon: Play, color: 'text-blue-600' },
          { id: 'no-show', label: 'Marcar Falta', icon: UserX, color: 'text-gray-600' },
          { id: 'cancel', label: 'Cancelar', icon: X, color: 'text-red-600' }
        );
        break;
      case 'in_progress':
        actions.push(
          { id: 'complete', label: 'Finalizar', icon: Square, color: 'text-green-600' }
        );
        break;
    }
    
    return actions;
  };
  
  const formatDateTime = (date: Date | string) => {
    const d = new Date(date);
    return {
      date: d.toLocaleDateString('pt-BR'),
      time: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      weekday: d.toLocaleDateString('pt-BR', { weekday: 'long' })
    };
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando agendamento...</p>
        </div>
      </div>
    );
  }
  
  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Agendamento não encontrado</h2>
            <p className="text-gray-600 mb-4">O agendamento solicitado não existe ou foi removido.</p>
            <Button onClick={() => navigate('/appointments')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Agendamentos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const dateTime = formatDateTime(appointment.appointmentDate);
  const availableActions = getAvailableActions();
  
  return (
    <div className={cn('min-h-screen bg-gray-50', className)}>
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Cabeçalho */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/appointments')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            
            <div className="flex items-center space-x-2">
              {!isEditing && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => window.print()}>
                        <Printer className="h-4 w-4 mr-2" />
                        Imprimir
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Enviar SMS
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Bell className="h-4 w-4 mr-2" />
                        Configurar Lembrete
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
              
              {isEditing && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={isUpdating}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Salvar
                  </Button>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Agendamento #{appointment.id}
              </h1>
              <div className="flex items-center space-x-4">
                <Badge className={getStatusColor(appointment.status)}>
                  {getStatusText(appointment.status)}
                </Badge>
                <span className="text-gray-600">
                  {dateTime.weekday}, {dateTime.date} às {dateTime.time}
                </span>
              </div>
            </div>
            
            {availableActions.length > 0 && !isEditing && (
              <div className="flex items-center space-x-2">
                {availableActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={action.id}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (action.id === 'cancel') {
                          setShowCancelDialog(true);
                        } else {
                          handleStatusChange(action.id);
                        }
                      }}
                      className={action.color}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {action.label}
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna principal */}
          <div className="lg:col-span-2 space-y-6">
            {isEditing ? (
              <Card>
                <CardHeader>
                  <CardTitle>Editar Agendamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <AppointmentForm
                    initialData={editData}
                    onChange={setEditData}
                    showAdvancedFields={true}
                  />
                </CardContent>
              </Card>
            ) : (
              <Tabs defaultValue="details" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="details">Detalhes</TabsTrigger>
                  <TabsTrigger value="history">Histórico</TabsTrigger>
                  <TabsTrigger value="notes">Observações</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-6">
                  {/* Informações do paciente */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <User className="h-5 w-5" />
                        <span>Informações do Paciente</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={appointment.patient?.avatar} />
                          <AvatarFallback>
                            {appointment.patient?.name?.split(' ').map(n => n[0]).join('') || 'P'}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {appointment.patient?.name || 'Nome não informado'}
                          </h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Phone className="h-4 w-4" />
                              <span>{appointment.patient?.phone || 'Não informado'}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Mail className="h-4 w-4" />
                              <span>{appointment.patient?.email || 'Não informado'}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {appointment.patient?.birthDate ? 
                                  new Date(appointment.patient.birthDate).toLocaleDateString('pt-BR') : 
                                  'Não informado'
                                }
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600">
                              <MapPin className="h-4 w-4" />
                              <span>{appointment.patient?.address || 'Não informado'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Informações do médico */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <UserCheck className="h-5 w-5" />
                        <span>Informações do Médico</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={appointment.doctor?.avatar} />
                          <AvatarFallback>
                            {appointment.doctor?.name?.split(' ').map(n => n[0]).join('') || 'M'}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            Dr. {appointment.doctor?.name || 'Nome não informado'}
                          </h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="text-gray-600">
                              <span className="font-medium">Especialidade:</span>
                              <span className="ml-2">{appointment.doctor?.specialty || 'Não informado'}</span>
                            </div>
                            <div className="text-gray-600">
                              <span className="font-medium">CRM:</span>
                              <span className="ml-2">{appointment.doctor?.crm || 'Não informado'}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Phone className="h-4 w-4" />
                              <span>{appointment.doctor?.phone || 'Não informado'}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Mail className="h-4 w-4" />
                              <span>{appointment.doctor?.email || 'Não informado'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Detalhes da consulta */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Clock className="h-5 w-5" />
                        <span>Detalhes da Consulta</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <span className="text-sm font-medium text-gray-600">Tipo de Consulta</span>
                            <p className="text-gray-900">{appointment.appointmentType || 'Não especificado'}</p>
                          </div>
                          
                          <div>
                            <span className="text-sm font-medium text-gray-600">Duração</span>
                            <p className="text-gray-900">{appointment.duration || 30} minutos</p>
                          </div>
                          
                          <div>
                            <span className="text-sm font-medium text-gray-600">Prioridade</span>
                            <Badge variant={appointment.priority === 'high' ? 'destructive' : 'secondary'}>
                              {appointment.priority === 'high' ? 'Alta' : 
                               appointment.priority === 'medium' ? 'Média' : 'Baixa'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <span className="text-sm font-medium text-gray-600">Sala</span>
                            <p className="text-gray-900">{appointment.room || 'Não definida'}</p>
                          </div>
                          
                          <div>
                            <span className="text-sm font-medium text-gray-600">Valor</span>
                            <p className="text-gray-900 text-lg font-semibold text-green-600">
                              {appointment.price ? `R$ ${appointment.price.toFixed(2)}` : 'Não informado'}
                            </p>
                          </div>
                          
                          {appointment.isTelemedicine && (
                            <div>
                              <Badge className="bg-blue-100 text-blue-800">
                                Telemedicina
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="history">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <History className="h-5 w-5" />
                        <span>Histórico do Agendamento</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Agendamento criado</p>
                            <p className="text-xs text-gray-500">
                              {new Date(appointment.created_at || '').toLocaleString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        
                        {appointment.updated_at && appointment.updated_at !== appointment.created_at && (
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Última atualização</p>
                              <p className="text-xs text-gray-500">
                                {new Date(appointment.updated_at).toLocaleString('pt-BR')}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="notes">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <FileText className="h-5 w-5" />
                        <span>Observações</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {appointment.notes ? (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-gray-700 whitespace-pre-wrap">{appointment.notes}</p>
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">Nenhuma observação registrada.</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ações rápidas */}
            {!isEditing && availableActions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {availableActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <Button
                        key={action.id}
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => {
                          if (action.id === 'cancel') {
                            setShowCancelDialog(true);
                          } else {
                            handleStatusChange(action.id);
                          }
                        }}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {action.label}
                      </Button>
                    );
                  })}
                </CardContent>
              </Card>
            )}
            
            {/* Informações adicionais */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">ID do Agendamento</span>
                  <p className="text-gray-900 font-mono text-sm">{appointment.id}</p>
                </div>
                
                <Separator />
                
                <div>
                  <span className="text-sm font-medium text-gray-600">Criado em</span>
                  <p className="text-gray-900 text-sm">
                    {new Date(appointment.created_at || '').toLocaleString('pt-BR')}
                  </p>
                </div>
                
                {appointment.updated_at && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Atualizado em</span>
                    <p className="text-gray-900 text-sm">
                      {new Date(appointment.updated_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Dialog de confirmação de cancelamento */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Agendamento</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.
              </AlertDescription>
            </Alert>
            
            <div className="flex items-center justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowCancelDialog(false)}
              >
                Não, manter agendamento
              </Button>
              
              <Button
                variant="destructive"
                onClick={() => handleStatusChange('cancel')}
              >
                Sim, cancelar agendamento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Dialog de confirmação de exclusão */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Agendamento</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Atenção!</strong> Esta ação é irreversível. O agendamento será permanentemente excluído do sistema.
              </AlertDescription>
            </Alert>
            
            <div className="flex items-center justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancelar
              </Button>
              
              <Button
                variant="destructive"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Permanentemente
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AppointmentDetails;