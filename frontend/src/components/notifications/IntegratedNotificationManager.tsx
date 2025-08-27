'use client';

import React, { useState, useMemo } from 'react';
import { Bell, Filter, Search, MoreVertical, Check, Trash2, RefreshCw, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useIntegratedNotifications } from '@/hooks/useIntegratedNotifications';
import {
  BaseNotification,
  NotificationType,
  NotificationPriority,
  NotificationStatus
} from '@/types/notifications';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface IntegratedNotificationManagerProps {
  userId?: number;
  clinicId?: number;
  className?: string;
  maxHeight?: string;
  showFilters?: boolean;
  showSearch?: boolean;
  showTabs?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface NotificationFilters {
  type?: NotificationType | 'all';
  priority?: NotificationPriority | 'all';
  status?: NotificationStatus | 'all';
  dateRange?: 'today' | 'week' | 'month' | 'all';
  search?: string;
}

export function IntegratedNotificationManager({
  userId,
  clinicId,
  className = '',
  maxHeight = '600px',
  showFilters = true,
  showSearch = true,
  showTabs = true,
  autoRefresh = true,
  refreshInterval = 30000
}: IntegratedNotificationManagerProps) {
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
  const [filters, setFilters] = useState<NotificationFilters>({
    type: 'all',
    priority: 'all',
    status: 'all',
    dateRange: 'all',
    search: ''
  });
  const [activeTab, setActiveTab] = useState('all');

  const {
    notifications,
    stats,
    unreadCount,
    isLoading,
    error,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
    getNotificationsByType,
    getNotificationsByPriority,
    getUnreadNotifications,
    getRecentNotifications
  } = useIntegratedNotifications({
    userId,
    clinicId,
    autoRefresh,
    refreshInterval,
    enableRealTime: true,
    maxNotifications: 200
  });

  // Filtrar notificações baseado nos filtros ativos
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Filtro por aba ativa
    if (activeTab !== 'all') {
      switch (activeTab) {
        case 'unread':
          filtered = getUnreadNotifications();
          break;
        case 'appointments':
          filtered = getNotificationsByType(NotificationType.APPOINTMENT_REMINDER)
            .concat(getNotificationsByType(NotificationType.APPOINTMENT_CONFIRMED))
            .concat(getNotificationsByType(NotificationType.APPOINTMENT_CANCELLED))
            .concat(getNotificationsByType(NotificationType.APPOINTMENT_RESCHEDULED));
          break;
        case 'backup':
          filtered = getNotificationsByType(NotificationType.BACKUP_STARTED)
            .concat(getNotificationsByType(NotificationType.BACKUP_COMPLETED))
            .concat(getNotificationsByType(NotificationType.BACKUP_FAILED))
            .concat(getNotificationsByType(NotificationType.RESTORE_STARTED))
            .concat(getNotificationsByType(NotificationType.RESTORE_COMPLETED))
            .concat(getNotificationsByType(NotificationType.RESTORE_FAILED));
          break;
        case 'system':
          filtered = getNotificationsByType(NotificationType.SYSTEM_NOTIFICATION)
            .concat(getNotificationsByType(NotificationType.SECURITY_ALERT));
          break;
      }
    }

    // Aplicar filtros adicionais
    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(n => n.type === filters.type);
    }

    if (filters.priority && filters.priority !== 'all') {
      filtered = filtered.filter(n => n.priority === filters.priority);
    }

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(n => n.status === filters.status);
    }

    if (filters.dateRange && filters.dateRange !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          cutoff.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoff.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoff.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(n => new Date(n.createdAt) >= cutoff);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchLower) ||
        n.message.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [notifications, activeTab, filters, getUnreadNotifications, getNotificationsByType]);

  const handleSelectNotification = (notificationId: number) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const handleMarkAsRead = async (notificationIds?: number[]) => {
    const ids = notificationIds || selectedNotifications;
    if (ids.length === 0) return;

    try {
      await markAsRead(ids);
      setSelectedNotifications([]);
      toast.success(`${ids.length} notificação(ões) marcada(s) como lida(s)`);
    } catch (error) {
      toast.error('Erro ao marcar notificações como lidas');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast.success('Todas as notificações foram marcadas como lidas');
    } catch (error) {
      toast.error('Erro ao marcar todas as notificações como lidas');
    }
  };

  const handleDeleteNotifications = async (notificationIds?: number[]) => {
    const ids = notificationIds || selectedNotifications;
    if (ids.length === 0) return;

    try {
      await deleteNotification(ids);
      setSelectedNotifications([]);
      toast.success(`${ids.length} notificação(ões) excluída(s)`);
    } catch (error) {
      toast.error('Erro ao excluir notificações');
    }
  };

  const handleRefresh = async () => {
    try {
      await refresh();
      toast.success('Notificações atualizadas');
    } catch (error) {
      toast.error('Erro ao atualizar notificações');
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.APPOINTMENT_REMINDER:
      case NotificationType.APPOINTMENT_CONFIRMED:
      case NotificationType.APPOINTMENT_CANCELLED:
      case NotificationType.APPOINTMENT_RESCHEDULED:
        return '📅';
      case NotificationType.BACKUP_STARTED:
      case NotificationType.BACKUP_COMPLETED:
      case NotificationType.BACKUP_FAILED:
        return '💾';
      case NotificationType.RESTORE_STARTED:
      case NotificationType.RESTORE_COMPLETED:
      case NotificationType.RESTORE_FAILED:
        return '🔄';
      case NotificationType.SECURITY_ALERT:
        return '🔒';
      default:
        return '🔔';
    }
  };

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case NotificationPriority.HIGH:
        return 'destructive';
      case NotificationPriority.MEDIUM:
        return 'default';
      case NotificationPriority.LOW:
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: NotificationStatus) => {
    switch (status) {
      case NotificationStatus.READ:
        return 'text-muted-foreground';
      case NotificationStatus.sent:
        return 'text-foreground';
      case NotificationStatus.failed:
        return 'text-destructive';
      default:
        return 'text-foreground';
    }
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <p>Erro ao carregar notificações</p>
            <Button onClick={handleRefresh} variant="outline" className="mt-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notificações</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <Button
              onClick={handleRefresh}
              variant="ghost"
              size="sm"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleMarkAllAsRead}>
                  <Check className="h-4 w-4 mr-2" />
                  Marcar Todas como Lidas
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-destructive">{stats.unread}</div>
            <div className="text-xs text-muted-foreground">Não Lidas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.byType.appointment}</div>
            <div className="text-xs text-muted-foreground">Consultas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.byType.backup + stats.byType.restore}</div>
            <div className="text-xs text-muted-foreground">Backup</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Filtros e Busca */}
        {(showFilters || showSearch) && (
          <div className="p-4 border-b space-y-4">
            {showSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar notificações..."
                  value={filters.search || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            )}

            {showFilters && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Select
                  value={filters.type || 'all'}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, type: value as NotificationType | 'all' }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Tipos</SelectItem>
                    <SelectItem value={NotificationType.APPOINTMENT_REMINDER}>Consultas</SelectItem>
                    <SelectItem value={NotificationType.BACKUP_STARTED}>Backup</SelectItem>
                    <SelectItem value={NotificationType.SYSTEM_NOTIFICATION}>Sistema</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.priority || 'all'}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value as NotificationPriority | 'all' }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value={NotificationPriority.HIGH}>Alta</SelectItem>
                    <SelectItem value={NotificationPriority.MEDIUM}>Média</SelectItem>
                    <SelectItem value={NotificationPriority.LOW}>Baixa</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.status || 'all'}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as NotificationStatus | 'all' }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value={NotificationStatus.sent}>Não Lidas</SelectItem>
                    <SelectItem value={NotificationStatus.read}>Lidas</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.dateRange || 'all'}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value as 'today' | 'week' | 'month' | 'all' }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="week">Última Semana</SelectItem>
                    <SelectItem value="month">Último Mês</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        {/* Abas */}
        {showTabs && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mx-4 mb-4">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="unread">
                Não Lidas
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-1 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="appointments">Consultas</TabsTrigger>
              <TabsTrigger value="backup">Backup</TabsTrigger>
              <TabsTrigger value="system">Sistema</TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {/* Ações em lote */}
        {selectedNotifications.length > 0 && (
          <div className="p-4 bg-muted/50 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedNotifications.length === filteredNotifications.length}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm">
                  {selectedNotifications.length} selecionada(s)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleMarkAsRead()}
                  variant="outline"
                  size="sm"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Marcar como Lidas
                </Button>
                <Button
                  onClick={() => handleDeleteNotifications()}
                  variant="outline"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Notificações */}
        <ScrollArea style={{ maxHeight }}>
          <div className="divide-y">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma notificação encontrada</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-muted/50 transition-colors ${
                    notification.status === NotificationStatus.read ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedNotifications.includes(notification.id)}
                      onCheckedChange={() => handleSelectNotification(notification.id)}
                    />
                    <div className="text-2xl">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`font-medium truncate ${getStatusColor(notification.status)}`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-2 ml-2">
                          <Badge variant={getPriorityColor(notification.priority)} className="text-xs">
                            {notification.priority === NotificationPriority.HIGH ? 'Alta' :
                             notification.priority === NotificationPriority.MEDIUM ? 'Média' : 'Baixa'}
                          </Badge>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                              locale: ptBR
                            })}
                          </span>
                        </div>
                      </div>
                      <p className={`text-sm truncate ${getStatusColor(notification.status)}`}>
                        {notification.message}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {notification.status !== NotificationStatus.read && (
                          <DropdownMenuItem onClick={() => handleMarkAsRead([notification.id])}>
                            <Check className="h-4 w-4 mr-2" />
                            Marcar como Lida
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleDeleteNotifications([notification.id])}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default IntegratedNotificationManager;