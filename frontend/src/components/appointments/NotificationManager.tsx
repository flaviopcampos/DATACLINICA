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
  Bell,
  BellRing,
  Clock,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Search,
  Settings,
  Trash2,
  Users,
  AlertCircle,
  CheckCircle,
  XCircle,
  Send,
  Filter,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useWaitingList } from '@/hooks/useNotifications';
import {
  AppointmentNotification,
  NotificationSettings,
  WaitingListEntry,
  NotificationFilters
} from '@/types/appointments';

interface NotificationManagerProps {
  userId?: number;
  clinicId?: number;
  doctorId?: number;
}

function NotificationManager({ userId, clinicId, doctorId }: NotificationManagerProps) {
  const [activeTab, setActiveTab] = useState('notifications');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCreateNotificationOpen, setIsCreateNotificationOpen] = useState(false);
  const [isAddToWaitingListOpen, setIsAddToWaitingListOpen] = useState(false);

  // Hooks para notificações
  const {
    notifications,
    settings,
    stats,
    unreadCount,
    filters,
    isLoading: isLoadingNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updateSettings,
    sendNotification,
    updateFilters,
    clearFilters,
    testNotification,
    refresh
  } = useNotifications({ userId, clinicId });

  // Hook para lista de espera
  const {
    waitingList,
    isLoading: isLoadingWaitingList,
    addToWaitingList,
    removeFromWaitingList,
    notifyAvailability,
    isAdding,
    isRemoving,
    isNotifying
  } = useWaitingList({ doctor_id: doctorId?.toString() });

  // Filtrar notificações por termo de busca
  const filteredNotifications = notifications.filter(notification =>
    notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtrar lista de espera por termo de busca
  const filteredWaitingList = waitingList.filter(entry =>
    entry.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.doctor?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Função para obter ícone do tipo de notificação
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reminder':
        return <Clock className="h-4 w-4" />;
      case 'confirmation':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancellation':
        return <XCircle className="h-4 w-4" />;
      case 'rescheduling':
        return <RefreshCw className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  // Função para obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Função para obter cor da prioridade
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Componente para configurações de notificação
  const NotificationSettingsDialog = () => {
    const [localSettings, setLocalSettings] = useState<NotificationSettings>({
      email_enabled: settings?.email_enabled || false,
      sms_enabled: settings?.sms_enabled || false,
      whatsapp_enabled: settings?.whatsapp_enabled || false,
      push_enabled: settings?.push_enabled || true,
      reminder_times: settings?.reminder_times || [24, 2],
      auto_confirm: settings?.auto_confirm || false,
      auto_cancel_time: settings?.auto_cancel_time || 24
    });

    const handleSaveSettings = () => {
      updateSettings(localSettings);
      setIsSettingsOpen(false);
    };

    return (
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Configurações de Notificação</DialogTitle>
            <DialogDescription>
              Configure como e quando receber notificações
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Canais de Notificação</Label>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <Label htmlFor="email">Email</Label>
                </div>
                <Switch
                  id="email"
                  checked={localSettings.email_enabled}
                  onCheckedChange={(checked) => 
                    setLocalSettings(prev => ({ ...prev, email_enabled: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <Label htmlFor="sms">SMS</Label>
                </div>
                <Switch
                  id="sms"
                  checked={localSettings.sms_enabled}
                  onCheckedChange={(checked) => 
                    setLocalSettings(prev => ({ ...prev, sms_enabled: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4" />
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                </div>
                <Switch
                  id="whatsapp"
                  checked={localSettings.whatsapp_enabled}
                  onCheckedChange={(checked) => 
                    setLocalSettings(prev => ({ ...prev, whatsapp_enabled: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="h-4 w-4" />
                  <Label htmlFor="push">Push</Label>
                </div>
                <Switch
                  id="push"
                  checked={localSettings.push_enabled}
                  onCheckedChange={(checked) => 
                    setLocalSettings(prev => ({ ...prev, push_enabled: checked }))
                  }
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reminder-times">Horários de Lembrete (horas antes)</Label>
              <Input
                id="reminder-times"
                placeholder="24, 2, 1"
                value={localSettings.reminder_times.join(', ')}
                onChange={(e) => {
                  const times = e.target.value.split(',').map(t => parseInt(t.trim())).filter(t => !isNaN(t));
                  setLocalSettings(prev => ({ ...prev, reminder_times: times }));
                }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-confirm">Confirmação Automática</Label>
              <Switch
                id="auto-confirm"
                checked={localSettings.auto_confirm}
                onCheckedChange={(checked) => 
                  setLocalSettings(prev => ({ ...prev, auto_confirm: checked }))
                }
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="auto-cancel">Cancelamento Automático (horas)</Label>
              <Input
                id="auto-cancel"
                type="number"
                value={localSettings.auto_cancel_time}
                onChange={(e) => 
                  setLocalSettings(prev => ({ ...prev, auto_cancel_time: parseInt(e.target.value) }))
                }
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
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

  // Componente para criar nova notificação
  const CreateNotificationDialog = () => {
    const [notificationData, setNotificationData] = useState({
      type: 'reminder' as const,
      recipient: 'patient' as const,
      method: 'email' as const,
      message: '',
      scheduled_for: ''
    });

    const handleCreateNotification = () => {
      sendNotification({
        ...notificationData,
        appointment_id: 0 // Seria passado como prop ou selecionado
      });
      setIsCreateNotificationOpen(false);
      setNotificationData({
        type: 'reminder',
        recipient: 'patient',
        method: 'email',
        message: '',
        scheduled_for: ''
      });
    };

    return (
      <Dialog open={isCreateNotificationOpen} onOpenChange={setIsCreateNotificationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Notificação</DialogTitle>
            <DialogDescription>
              Criar uma nova notificação manual
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={notificationData.type}
                  onValueChange={(value: any) => 
                    setNotificationData(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reminder">Lembrete</SelectItem>
                    <SelectItem value="confirmation">Confirmação</SelectItem>
                    <SelectItem value="cancellation">Cancelamento</SelectItem>
                    <SelectItem value="rescheduling">Reagendamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="recipient">Destinatário</Label>
                <Select
                  value={notificationData.recipient}
                  onValueChange={(value: any) => 
                    setNotificationData(prev => ({ ...prev, recipient: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patient">Paciente</SelectItem>
                    <SelectItem value="doctor">Médico</SelectItem>
                    <SelectItem value="both">Ambos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="method">Método</Label>
                <Select
                  value={notificationData.method}
                  onValueChange={(value: any) => 
                    setNotificationData(prev => ({ ...prev, method: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="push">Push</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="scheduled">Agendar Para</Label>
                <Input
                  id="scheduled"
                  type="datetime-local"
                  value={notificationData.scheduled_for}
                  onChange={(e) => 
                    setNotificationData(prev => ({ ...prev, scheduled_for: e.target.value }))
                  }
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Mensagem</Label>
              <Textarea
                id="message"
                placeholder="Digite a mensagem da notificação..."
                value={notificationData.message}
                onChange={(e) => 
                  setNotificationData(prev => ({ ...prev, message: e.target.value }))
                }
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateNotificationOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateNotification}>
              <Send className="h-4 w-4 mr-2" />
              Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // Componente para adicionar à lista de espera
  const AddToWaitingListDialog = () => {
    const [waitingListData, setWaitingListData] = useState({
      patient_id: '',
      doctor_id: doctorId?.toString() || '',
      preferred_date: '',
      preferred_time: '',
      priority: 'medium' as const,
      notes: ''
    });

    const handleAddToWaitingList = () => {
      addToWaitingList({
        ...waitingListData,
        appointment_type: 'consultation' // Valor padrão
      });
      setIsAddToWaitingListOpen(false);
      setWaitingListData({
        patient_id: '',
        doctor_id: doctorId?.toString() || '',
        preferred_date: '',
        preferred_time: '',
        priority: 'medium',
        notes: ''
      });
    };

    return (
      <Dialog open={isAddToWaitingListOpen} onOpenChange={setIsAddToWaitingListOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar à Lista de Espera</DialogTitle>
            <DialogDescription>
              Adicionar paciente à lista de espera para agendamento
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patient">Paciente ID</Label>
                <Input
                  id="patient"
                  placeholder="ID do paciente"
                  value={waitingListData.patient_id}
                  onChange={(e) => 
                    setWaitingListData(prev => ({ ...prev, patient_id: e.target.value }))
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="doctor">Médico ID</Label>
                <Input
                  id="doctor"
                  placeholder="ID do médico"
                  value={waitingListData.doctor_id}
                  onChange={(e) => 
                    setWaitingListData(prev => ({ ...prev, doctor_id: e.target.value }))
                  }
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preferred-date">Data Preferida</Label>
                <Input
                  id="preferred-date"
                  type="date"
                  value={waitingListData.preferred_date}
                  onChange={(e) => 
                    setWaitingListData(prev => ({ ...prev, preferred_date: e.target.value }))
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="preferred-time">Horário Preferido</Label>
                <Input
                  id="preferred-time"
                  type="time"
                  value={waitingListData.preferred_time}
                  onChange={(e) => 
                    setWaitingListData(prev => ({ ...prev, preferred_time: e.target.value }))
                  }
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select
                value={waitingListData.priority}
                onValueChange={(value: any) => 
                  setWaitingListData(prev => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                placeholder="Observações adicionais..."
                value={waitingListData.notes}
                onChange={(e) => 
                  setWaitingListData(prev => ({ ...prev, notes: e.target.value }))
                }
                rows={2}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddToWaitingListOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddToWaitingList} disabled={isAdding}>
              {isAdding ? 'Adicionando...' : 'Adicionar'}
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
          <h2 className="text-2xl font-bold tracking-tight">Notificações e Lista de Espera</h2>
          <p className="text-muted-foreground">
            Gerencie notificações automáticas e lista de espera de pacientes
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => testNotification()}
          >
            <Bell className="h-4 w-4 mr-2" />
            Testar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                Notificações enviadas
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">
                Aguardando envio
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enviadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.sent}</div>
              <p className="text-xs text-muted-foreground">
                Entregues com sucesso
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Falharam</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.failed}</div>
              <p className="text-xs text-muted-foreground">
                Erro no envio
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <BellRing className="h-4 w-4" />
            <span>Notificações</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="waiting-list" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Lista de Espera</span>
            <Badge variant="secondary" className="ml-2">
              {waitingList.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Aba de Notificações */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Notificações</CardTitle>
                  <CardDescription>
                    Gerencie todas as notificações do sistema
                  </CardDescription>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar notificações..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros
                  </Button>
                  
                  <Button
                    size="sm"
                    onClick={() => setIsCreateNotificationOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Ações em lote */}
              {selectedNotifications.length > 0 && (
                <div className="flex items-center space-x-2 mb-4 p-3 bg-muted rounded-lg">
                  <span className="text-sm">
                    {selectedNotifications.length} selecionada(s)
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => markAsRead(selectedNotifications)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Marcar como Lida
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteNotification(selectedNotifications)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              )}
              
              {/* Tabela de notificações */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.length === filteredNotifications.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedNotifications(filteredNotifications.map(n => n.id));
                          } else {
                            setSelectedNotifications([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Destinatário</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Mensagem</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Agendado</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNotifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedNotifications.includes(notification.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedNotifications(prev => [...prev, notification.id]);
                            } else {
                              setSelectedNotifications(prev => prev.filter(id => id !== notification.id));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getNotificationIcon(notification.type)}
                          <span className="capitalize">{notification.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{notification.recipient}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {notification.method}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {notification.message}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(notification.status)}>
                          {notification.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(notification.scheduled_for).toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsRead([notification.id])}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteNotification([notification.id])}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredNotifications.length === 0 && (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Nenhuma notificação encontrada
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Lista de Espera */}
        <TabsContent value="waiting-list" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Lista de Espera</CardTitle>
                  <CardDescription>
                    Gerencie pacientes aguardando agendamento
                  </CardDescription>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar pacientes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => setIsAddToWaitingListOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Médico</TableHead>
                    <TableHead>Data Preferida</TableHead>
                    <TableHead>Horário</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWaitingList.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{entry.patient?.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {entry.patient?.phone || entry.patient?.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{entry.doctor?.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {entry.doctor?.specialty}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {entry.preferred_date ? 
                          new Date(entry.preferred_date).toLocaleDateString('pt-BR') : 
                          'Qualquer data'
                        }
                      </TableCell>
                      <TableCell>
                        {entry.preferred_time || 'Qualquer horário'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(entry.priority)}>
                          {entry.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(entry.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => notifyAvailability(entry.id.toString())}
                            disabled={isNotifying}
                          >
                            <Bell className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFromWaitingList(entry.id.toString())}
                            disabled={isRemoving}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredWaitingList.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Nenhum paciente na lista de espera
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <NotificationSettingsDialog />
      <CreateNotificationDialog />
      <AddToWaitingListDialog />
    </div>
  );
}

export default NotificationManager;