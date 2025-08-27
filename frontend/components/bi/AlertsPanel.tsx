'use client';

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Bell, 
  CheckCircle, 
  Clock, 
  Filter, 
  MoreHorizontal,
  X,
  AlertCircle,
  Info,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAlerts } from '@/hooks/bi/useAlerts';
import { AlertNotification, AlertSeverity, AlertType, AlertsFilters } from '@/types/bi/alerts';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AlertsPanelProps {
  className?: string;
  maxHeight?: string;
  showFilters?: boolean;
  showStats?: boolean;
}

const severityConfig = {
  low: {
    icon: Info,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    bgColor: 'bg-blue-50'
  },
  medium: {
    icon: AlertCircle,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    bgColor: 'bg-yellow-50'
  },
  high: {
    icon: AlertTriangle,
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    bgColor: 'bg-orange-50'
  },
  critical: {
    icon: Zap,
    color: 'bg-red-100 text-red-800 border-red-200',
    bgColor: 'bg-red-50'
  }
};

const typeLabels = {
  bed_occupancy: 'Ocupação de Leitos',
  billing_overdue: 'Faturamento em Atraso',
  appointment_cancelled: 'Agendamentos Cancelados',
  patient_inactive: 'Pacientes Inativos',
  revenue_drop: 'Queda de Receita',
  system_performance: 'Performance do Sistema',
  custom: 'Personalizado'
};

function AlertItem({ 
  notification, 
  onMarkAsRead, 
  onMarkAsResolved 
}: {
  notification: AlertNotification;
  onMarkAsRead: (id: string) => void;
  onMarkAsResolved: (id: string) => void;
}) {
  const config = severityConfig[notification.severity];
  const Icon = config.icon;
  
  return (
    <div 
      className={`p-4 border rounded-lg transition-all hover:shadow-sm ${
        notification.isRead ? 'bg-gray-50' : config.bgColor
      } ${
        notification.isResolved ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className={`p-2 rounded-full ${config.color}`}>
            <Icon className="h-4 w-4" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className={`font-medium text-sm ${
                notification.isRead ? 'text-gray-700' : 'text-gray-900'
              }`}>
                {notification.title}
              </h4>
              
              <Badge 
                variant="outline" 
                className={`text-xs ${config.color}`}
              >
                {notification.severity.toUpperCase()}
              </Badge>
              
              {!notification.isRead && (
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
              )}
            </div>
            
            <p className={`text-sm mb-2 ${
              notification.isRead ? 'text-gray-600' : 'text-gray-700'
            }`}>
              {notification.message}
            </p>
            
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(notification.triggeredAt, {
                  addSuffix: true,
                  locale: ptBR
                })}
              </span>
              
              <Badge variant="secondary" className="text-xs">
                {typeLabels[notification.type]}
              </Badge>
              
              {notification.isResolved && (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  Resolvido
                </span>
              )}
            </div>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!notification.isRead && (
              <DropdownMenuItem onClick={() => onMarkAsRead(notification.id)}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Marcar como lida
              </DropdownMenuItem>
            )}
            
            {!notification.isResolved && (
              <DropdownMenuItem onClick={() => onMarkAsResolved(notification.id)}>
                <X className="h-4 w-4 mr-2" />
                Marcar como resolvida
              </DropdownMenuItem>
            )}
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem className="text-gray-500">
              <Info className="h-4 w-4 mr-2" />
              Ver detalhes
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function AlertsFilters({ 
  onFiltersChange 
}: {
  onFiltersChange: (filters: AlertsFilters | null) => void;
}) {
  const [severity, setSeverity] = useState<AlertSeverity[]>([]);
  const [type, setType] = useState<AlertType[]>([]);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [showUnresolvedOnly, setShowUnresolvedOnly] = useState(false);
  
  const applyFilters = () => {
    const filters: AlertsFilters = {};
    
    if (severity.length > 0) filters.severity = severity;
    if (type.length > 0) filters.type = type;
    if (showUnreadOnly) filters.isRead = false;
    if (showUnresolvedOnly) filters.isResolved = false;
    
    onFiltersChange(Object.keys(filters).length > 0 ? filters : null);
  };
  
  const clearFilters = () => {
    setSeverity([]);
    setType([]);
    setShowUnreadOnly(false);
    setShowUnresolvedOnly(false);
    onFiltersChange(null);
  };
  
  React.useEffect(() => {
    applyFilters();
  }, [severity, type, showUnreadOnly, showUnresolvedOnly]);
  
  return (
    <div className="space-y-4 p-4 border-b">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">Filtros</h3>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Limpar
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-gray-700 mb-2 block">
            Severidade
          </label>
          <Select
            value={severity.join(',')}
            onValueChange={(value) => setSeverity(value ? value.split(',') as AlertSeverity[] : [])}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="critical">Crítica</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="low">Baixa</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-xs font-medium text-gray-700 mb-2 block">
            Tipo
          </label>
          <Select
            value={type.join(',')}
            onValueChange={(value) => setType(value ? value.split(',') as AlertType[] : [])}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bed_occupancy">Ocupação de Leitos</SelectItem>
              <SelectItem value="billing_overdue">Faturamento</SelectItem>
              <SelectItem value="appointment_cancelled">Agendamentos</SelectItem>
              <SelectItem value="patient_inactive">Pacientes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="unread"
            checked={showUnreadOnly}
            onCheckedChange={setShowUnreadOnly}
          />
          <label htmlFor="unread" className="text-xs text-gray-700">
            Apenas não lidas
          </label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="unresolved"
            checked={showUnresolvedOnly}
            onCheckedChange={setShowUnresolvedOnly}
          />
          <label htmlFor="unresolved" className="text-xs text-gray-700">
            Apenas não resolvidas
          </label>
        </div>
      </div>
    </div>
  );
}

export function AlertsPanel({ 
  className = '',
  maxHeight = '600px',
  showFilters = true,
  showStats = true
}: AlertsPanelProps) {
  const {
    notifications,
    stats,
    isLoading,
    error,
    markAsRead,
    markAsResolved,
    markAllAsRead,
    applyFilters,
    clearFilters
  } = useAlerts();
  
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  
  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>{error}</p>
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
            <CardTitle className="text-lg">Alertas</CardTitle>
            {stats && stats.unread > 0 && (
              <Badge variant="destructive" className="text-xs">
                {stats.unread}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {showFilters && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              >
                <Filter className="h-4 w-4" />
              </Button>
            )}
            
            {stats && stats.unread > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </div>
        
        {showStats && stats && (
          <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
            <span>Total: {stats.total}</span>
            <span>Não lidas: {stats.unread}</span>
            <span>Não resolvidas: {stats.unresolved}</span>
          </div>
        )}
      </CardHeader>
      
      {showFiltersPanel && (
        <AlertsFilters onFiltersChange={applyFilters} />
      )}
      
      <CardContent className="p-0">
        <ScrollArea style={{ maxHeight }}>
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum alerta encontrado</p>
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {notifications.map((notification) => (
                <AlertItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onMarkAsResolved={markAsResolved}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default AlertsPanel;