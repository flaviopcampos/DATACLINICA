'use client';

import { useState, useMemo } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Activity,
  Eye,
  Download,
  Upload,
  Settings,
  AlertTriangle,
  LogIn,
  LogOut,
  Globe,
  RefreshCw,
  Filter,
  Clock,
  Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSessionActivity } from '@/hooks/useSessionActivity';
import type { SessionActivity as SessionActivityType, ActivityType } from '@/types/sessions';

interface SessionActivityProps {
  sessionId?: string;
  userId?: string;
  maxHeight?: string;
  showFilters?: boolean;
  realTimeUpdates?: boolean;
  autoRefresh?: boolean;
  className?: string;
}

interface ActivityFilters {
  search: string;
  activityType: ActivityType | 'all';
  dateRange: 'today' | 'week' | 'month' | 'all';
}

function getActivityIcon(activityType: ActivityType) {
  switch (activityType) {
    case ActivityType.LOGIN:
      return LogIn;
    case ActivityType.LOGOUT:
      return LogOut;
    case ActivityType.PAGE_VIEW:
      return Eye;
    case ActivityType.API_CALL:
      return Globe;
    case ActivityType.DOWNLOAD:
      return Download;
    case ActivityType.UPLOAD:
      return Upload;
    case ActivityType.SETTINGS_CHANGE:
      return Settings;
    case ActivityType.SUSPICIOUS_ACTIVITY:
      return AlertTriangle;
    default:
      return Activity;
  }
}

function getActivityColor(activityType: ActivityType) {
  switch (activityType) {
    case ActivityType.LOGIN:
      return 'text-green-600 bg-green-100';
    case ActivityType.LOGOUT:
      return 'text-gray-600 bg-gray-100';
    case ActivityType.PAGE_VIEW:
      return 'text-blue-600 bg-blue-100';
    case ActivityType.API_CALL:
      return 'text-purple-600 bg-purple-100';
    case ActivityType.DOWNLOAD:
      return 'text-indigo-600 bg-indigo-100';
    case ActivityType.UPLOAD:
      return 'text-orange-600 bg-orange-100';
    case ActivityType.SETTINGS_CHANGE:
      return 'text-yellow-600 bg-yellow-100';
    case ActivityType.SUSPICIOUS_ACTIVITY:
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

function getActivityTypeText(activityType: ActivityType) {
  switch (activityType) {
    case ActivityType.LOGIN:
      return 'Login';
    case ActivityType.LOGOUT:
      return 'Logout';
    case ActivityType.PAGE_VIEW:
      return 'Visualização';
    case ActivityType.API_CALL:
      return 'API';
    case ActivityType.DOWNLOAD:
      return 'Download';
    case ActivityType.UPLOAD:
      return 'Upload';
    case ActivityType.SETTINGS_CHANGE:
      return 'Configuração';
    case ActivityType.SUSPICIOUS_ACTIVITY:
      return 'Suspeita';
    default:
      return 'Atividade';
  }
}

export function SessionActivity({
  sessionId,
  userId,
  maxHeight = '400px',
  showFilters = true,
  realTimeUpdates = false,
  autoRefresh = true,
  className = ''
}: SessionActivityProps) {
  const [filters, setFilters] = useState<ActivityFilters>({
    search: '',
    activityType: 'all',
    dateRange: 'today'
  });

  const {
    activities,
    totalActivities,
    isLoading,
    error,
    refresh
  } = useSessionActivity({
    sessionId,
    userId,
    autoRefresh,
    realTimeUpdates
  });

  // Filter activities based on current filters
  const filteredActivities = useMemo(() => {
    if (!activities) return [];

    return activities.filter(activity => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          activity.description.toLowerCase().includes(searchLower) ||
          activity.ip_address.includes(searchLower) ||
          JSON.stringify(activity.details || {}).toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Activity type filter
      if (filters.activityType !== 'all' && activity.activity_type !== filters.activityType) {
        return false;
      }

      // Date range filter
      const activityDate = new Date(activity.timestamp);
      const now = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          if (activityDate < today) return false;
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (activityDate < weekAgo) return false;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (activityDate < monthAgo) return false;
          break;
        case 'all':
        default:
          break;
      }

      return true;
    });
  }, [activities, filters]);

  const clearFilters = () => {
    setFilters({
      search: '',
      activityType: 'all',
      dateRange: 'today'
    });
  };

  const formatActivityTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
    } else {
      return format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR });
    }
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>Erro ao carregar atividades</p>
            <Button onClick={refresh} variant="outline" size="sm" className="mt-2">
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Atividade Recente</span>
              {isLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {totalActivities} atividades • {filteredActivities.length} filtradas
            </p>
          </div>
          
          <Button
            onClick={refresh}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Filters */}
        {showFilters && (
          <div className="mb-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar atividades..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
              
              {/* Activity Type */}
              <Select
                value={filters.activityType}
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  activityType: value as ActivityType | 'all' 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de Atividade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Atividades</SelectItem>
                  <SelectItem value={ActivityType.LOGIN}>Login</SelectItem>
                  <SelectItem value={ActivityType.LOGOUT}>Logout</SelectItem>
                  <SelectItem value={ActivityType.PAGE_VIEW}>Visualizações</SelectItem>
                  <SelectItem value={ActivityType.API_CALL}>Chamadas API</SelectItem>
                  <SelectItem value={ActivityType.DOWNLOAD}>Downloads</SelectItem>
                  <SelectItem value={ActivityType.UPLOAD}>Uploads</SelectItem>
                  <SelectItem value={ActivityType.SETTINGS_CHANGE}>Configurações</SelectItem>
                  <SelectItem value={ActivityType.SUSPICIOUS_ACTIVITY}>Suspeitas</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Date Range */}
              <Select
                value={filters.dateRange}
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  dateRange: value as 'today' | 'week' | 'month' | 'all' 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Última Semana</SelectItem>
                  <SelectItem value="month">Último Mês</SelectItem>
                  <SelectItem value="all">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Clear Filters */}
            {(filters.search || filters.activityType !== 'all' || filters.dateRange !== 'today') && (
              <Button
                onClick={clearFilters}
                variant="ghost"
                size="sm"
                className="text-gray-600"
              >
                <Filter className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
            )}
          </div>
        )}
        
        {/* Activities List */}
        <ScrollArea style={{ height: maxHeight }}>
          <div className="space-y-3">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-3 w-16" />
                </div>
              ))
            ) : filteredActivities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma atividade encontrada</p>
                {(filters.search || filters.activityType !== 'all' || filters.dateRange !== 'today') && (
                  <Button
                    onClick={clearFilters}
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                  >
                    Limpar Filtros
                  </Button>
                )}
              </div>
            ) : (
              filteredActivities.map((activity) => {
                const ActivityIcon = getActivityIcon(activity.activity_type);
                const colorClass = getActivityColor(activity.activity_type);
                
                return (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div className={`p-2 rounded-full ${colorClass}`}>
                      <ActivityIcon className="h-4 w-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {getActivityTypeText(activity.activity_type)}
                        </Badge>
                        {activity.activity_type === ActivityType.SUSPICIOUS_ACTIVITY && (
                          <Badge variant="outline" className="text-xs bg-red-100 text-red-800 border-red-200">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Suspeita
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-900 mb-1">
                        {activity.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatActivityTime(activity.timestamp)}</span>
                        </span>
                        
                        {activity.ip_address && (
                          <span className="font-mono">
                            {activity.ip_address}
                          </span>
                        )}
                        
                        {activity.details && Object.keys(activity.details).length > 0 && (
                          <span className="text-blue-600 cursor-pointer hover:underline"
                                title={JSON.stringify(activity.details, null, 2)}>
                            Ver Detalhes
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default SessionActivity;