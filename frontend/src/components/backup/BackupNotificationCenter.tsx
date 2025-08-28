import React, { useState } from 'react';
import { Bell, X, Check, Trash2, Settings, Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useBackupNotifications } from '../../hooks/useBackupNotifications';
import {
  NotificationType,
  NotificationPriority,
  NotificationStatus,
  BackupNotification,
  RestoreNotification
} from '../../types/notifications';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BackupNotificationCenterProps {
  userId?: string;
  clinicId?: string;
  className?: string;
}

function BackupNotificationCenter({ userId, clinicId, className }: BackupNotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updateFilters,
    refresh,
    hasUnreadNotifications
  } = useBackupNotifications({
    userId,
    clinicId,
    enableRealTime: true,
    autoRefresh: true
  });

  // Filtrar notificações baseado nos filtros selecionados
  const filteredNotifications = notifications.filter(notification => {
    if (filterType !== 'all' && notification.type !== filterType) return false;
    if (filterPriority !== 'all' && notification.priority !== filterPriority) return false;
    if (filterStatus !== 'all' && notification.status !== filterStatus) return false;
    return true;
  });

  const handleNotificationClick = (notification: BackupNotification | RestoreNotification) => {
    if (notification.status !== NotificationStatus.READ) {
      markAsRead([notification.id]);
    }
  };

  const handleSelectNotification = (notificationId: number, checked: boolean) => {
    if (checked) {
      setSelectedNotifications(prev => [...prev, notificationId]);
    } else {
      setSelectedNotifications(prev => prev.filter(id => id !== notificationId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    } else {
      setSelectedNotifications([]);
    }
  };

  const handleMarkSelectedAsRead = () => {
    if (selectedNotifications.length > 0) {
      markAsRead(selectedNotifications);
      setSelectedNotifications([]);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedNotifications.length > 0) {
      deleteNotification(selectedNotifications);
      setSelectedNotifications([]);
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
        return 'outline';
    }
  };

  const getTypeLabel = (type: NotificationType) => {
    const labels = {
      [NotificationType.BACKUP_STARTED]: 'Backup Iniciado',
      [NotificationType.BACKUP_COMPLETED]: 'Backup Concluído',
      [NotificationType.BACKUP_FAILED]: 'Backup Falhou',
      [NotificationType.BACKUP_SCHEDULED]: 'Backup Agendado',
      [NotificationType.BACKUP_VERIFICATION_FAILED]: 'Verificação Falhou',
      [NotificationType.STORAGE_SPACE_LOW]: 'Espaço Baixo',
      [NotificationType.BACKUP_CLEANUP]: 'Limpeza de Backup',
      [NotificationType.RESTORE_STARTED]: 'Restauração Iniciada',
      [NotificationType.RESTORE_COMPLETED]: 'Restauração Concluída',
      [NotificationType.RESTORE_FAILED]: 'Restauração Falhou'
    };
    return labels[type] || type;
  };

  const getPriorityLabel = (priority: NotificationPriority) => {
    const labels = {
      [NotificationPriority.HIGH]: 'Alta',
      [NotificationPriority.MEDIUM]: 'Média',
      [NotificationPriority.LOW]: 'Baixa'
    };
    return labels[priority] || priority;
  };

  const applyFilters = () => {
    const filters: any = {};
    
    if (filterType !== 'all') {
      filters.types = [filterType];
    }
    
    if (filterPriority !== 'all') {
      filters.priorities = [filterPriority];
    }
    
    if (filterStatus !== 'all') {
      filters.statuses = [filterStatus];
    }
    
    updateFilters(filters);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilterType('all');
    setFilterPriority('all');
    setFilterStatus('all');
    updateFilters({});
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`relative ${className}`}
        >
          <Bell className="h-4 w-4" />
          {hasUnreadNotifications() && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações de Backup
              {!isConnected && (
                <Badge variant="outline" className="text-xs">
                  Desconectado
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        {showFilters && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Filtros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs">Tipo</Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value={NotificationType.BACKUP_STARTED}>Backup Iniciado</SelectItem>
                      <SelectItem value={NotificationType.BACKUP_COMPLETED}>Backup Concluído</SelectItem>
                      <SelectItem value={NotificationType.BACKUP_FAILED}>Backup Falhou</SelectItem>
                      <SelectItem value={NotificationType.RESTORE_STARTED}>Restauração Iniciada</SelectItem>
                      <SelectItem value={NotificationType.RESTORE_COMPLETED}>Restauração Concluída</SelectItem>
                      <SelectItem value={NotificationType.RESTORE_FAILED}>Restauração Falhou</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-xs">Prioridade</Label>
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value={NotificationPriority.HIGH}>Alta</SelectItem>
                      <SelectItem value={NotificationPriority.MEDIUM}>Média</SelectItem>
                      <SelectItem value={NotificationPriority.LOW}>Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-xs">Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value={NotificationStatus.PENDING}>Pendente</SelectItem>
                      <SelectItem value={NotificationStatus.SENT}>Enviado</SelectItem>
                      <SelectItem value={NotificationStatus.READ}>Lido</SelectItem>
                      <SelectItem value={NotificationStatus.FAILED}>Falhou</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button size="sm" onClick={applyFilters}>
                  Aplicar Filtros
                </Button>
                <Button size="sm" variant="outline" onClick={clearFilters}>
                  Limpar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {filteredNotifications.length > 0 && (
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedNotifications.length === filteredNotifications.length}
                onCheckedChange={handleSelectAll}
              />
              <Label className="text-sm">
                {selectedNotifications.length > 0 
                  ? `${selectedNotifications.length} selecionada(s)`
                  : 'Selecionar todas'
                }
              </Label>
            </div>
            
            {selectedNotifications.length > 0 && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleMarkSelectedAsRead}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Marcar como Lida
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDeleteSelected}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Excluir
                </Button>
              </div>
            )}
          </div>
        )}
        
        {hasUnreadNotifications() && (
          <div className="flex justify-end">
            <Button size="sm" variant="outline" onClick={markAllAsRead}>
              <Check className="h-4 w-4 mr-1" />
              Marcar Todas como Lidas
            </Button>
          </div>
        )}
        
        <ScrollArea className="h-96">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Carregando notificações...</span>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma notificação encontrada</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredNotifications.map((notification, index) => (
                <div key={notification.id}>
                  <Card 
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                      notification.status !== NotificationStatus.read ? 'border-l-4 border-l-primary' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedNotifications.includes(notification.id)}
                          onCheckedChange={(checked) => 
                            handleSelectNotification(notification.id, checked as boolean)
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className={`font-medium ${
                              notification.status !== NotificationStatus.read ? 'font-semibold' : ''
                            }`}>
                              {notification.title}
                            </h4>
                            
                            <div className="flex items-center gap-2">
                              <Badge variant={getPriorityColor(notification.priority)} className="text-xs">
                                {getPriorityLabel(notification.priority)}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {getTypeLabel(notification.type)}
                              </Badge>
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                              {formatDistanceToNow(new Date(notification.createdAt), {
                                addSuffix: true,
                                locale: ptBR
                              })}
                            </span>
                            
                            {notification.status !== NotificationStatus.read && (
                              <Badge variant="secondary" className="text-xs">
                                Nova
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {index < filteredNotifications.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default BackupNotificationCenter;