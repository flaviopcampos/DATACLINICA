'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, RefreshCw, LogOut, AlertTriangle } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { SessionCard } from './SessionCard';
import { useSessions } from '@/hooks/useSessions';
import type { Session, DeviceType, SessionStatus } from '@/types/sessions';

interface ActiveSessionsListProps {
  userId?: string;
  showFilters?: boolean;
  showActions?: boolean;
  maxHeight?: string;
  className?: string;
}

interface SessionFilters {
  search: string;
  deviceType: DeviceType | 'all';
  status: SessionStatus | 'all';
  suspicious: 'all' | 'suspicious' | 'trusted';
  location: string;
}

export function ActiveSessionsList({
  userId,
  showFilters = true,
  showActions = true,
  maxHeight = '600px',
  className = ''
}: ActiveSessionsListProps) {
  const [filters, setFilters] = useState<SessionFilters>({
    search: '',
    deviceType: 'all',
    status: 'all',
    suspicious: 'all',
    location: ''
  });
  const [showTerminateAllDialog, setShowTerminateAllDialog] = useState(false);
  const [isTerminatingAll, setIsTerminatingAll] = useState(false);

  const {
    sessions,
    currentSession,
    isLoading,
    error,
    terminateSession,
    terminateAllOtherSessions,
    reportSuspiciousActivity,
    trustDevice,
    refresh
  } = useSessions({ userId });

  // Filter sessions based on current filters
  const filteredSessions = useMemo(() => {
    if (!sessions) return [];

    return sessions.filter(session => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          session.device_info.device_name?.toLowerCase().includes(searchLower) ||
          session.device_info.browser?.toLowerCase().includes(searchLower) ||
          session.device_info.os?.toLowerCase().includes(searchLower) ||
          session.location_info.city?.toLowerCase().includes(searchLower) ||
          session.location_info.country?.toLowerCase().includes(searchLower) ||
          session.ip_address.includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Device type filter
      if (filters.deviceType !== 'all' && session.device_info.device_type !== filters.deviceType) {
        return false;
      }

      // Status filter
      if (filters.status !== 'all' && session.status !== filters.status) {
        return false;
      }

      // Suspicious filter
      if (filters.suspicious === 'suspicious' && !session.is_suspicious) {
        return false;
      }
      if (filters.suspicious === 'trusted' && !session.device_info.is_trusted) {
        return false;
      }

      // Location filter
      if (filters.location) {
        const locationLower = filters.location.toLowerCase();
        const matchesLocation = 
          session.location_info.city?.toLowerCase().includes(locationLower) ||
          session.location_info.country?.toLowerCase().includes(locationLower);
        
        if (!matchesLocation) return false;
      }

      return true;
    });
  }, [sessions, filters]);

  const activeSessions = filteredSessions.filter(session => 
    session.status === SessionStatus.ACTIVE
  );
  const otherSessions = activeSessions.filter(session => 
    session.id !== currentSession?.id
  );
  const suspiciousSessions = filteredSessions.filter(session => session.is_suspicious);

  const handleTerminateSession = async (sessionId: string) => {
    try {
      await terminateSession.mutateAsync(sessionId);
    } catch (error) {
      console.error('Error terminating session:', error);
    }
  };

  const handleTerminateAllOther = async () => {
    setIsTerminatingAll(true);
    try {
      await terminateAllOtherSessions.mutateAsync();
      toast.success('Todas as outras sessões foram encerradas');
    } catch (error) {
      toast.error('Erro ao encerrar sessões');
    } finally {
      setIsTerminatingAll(false);
      setShowTerminateAllDialog(false);
    }
  };

  const handleReportSuspicious = async (sessionId: string) => {
    try {
      await reportSuspiciousActivity.mutateAsync({
        sessionId,
        reason: 'Reportado pelo usuário como atividade suspeita'
      });
      toast.success('Atividade suspeita reportada');
    } catch (error) {
      toast.error('Erro ao reportar atividade suspeita');
    }
  };

  const handleTrustDevice = async (sessionId: string) => {
    try {
      await trustDevice.mutateAsync(sessionId);
      toast.success('Dispositivo marcado como confiável');
    } catch (error) {
      toast.error('Erro ao marcar dispositivo como confiável');
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      deviceType: 'all',
      status: 'all',
      suspicious: 'all',
      location: ''
    });
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>Erro ao carregar sessões</p>
            <Button onClick={refresh} variant="outline" size="sm" className="mt-2">
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <span>Sessões Ativas</span>
                {isLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
              </CardTitle>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                <span>Total: {activeSessions.length}</span>
                {suspiciousSessions.length > 0 && (
                  <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {suspiciousSessions.length} Suspeitas
                  </Badge>
                )}
              </div>
            </div>
            
            {showActions && (
              <div className="flex items-center space-x-2">
                <Button
                  onClick={refresh}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
                
                {otherSessions.length > 0 && (
                  <Button
                    onClick={() => setShowTerminateAllDialog(true)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Encerrar Outras ({otherSessions.length})
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Filters */}
          {showFilters && (
            <div className="mb-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar sessões..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
                
                {/* Device Type */}
                <Select
                  value={filters.deviceType}
                  onValueChange={(value) => setFilters(prev => ({ 
                    ...prev, 
                    deviceType: value as DeviceType | 'all' 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de Dispositivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Dispositivos</SelectItem>
                    <SelectItem value={DeviceType.DESKTOP}>Desktop</SelectItem>
                    <SelectItem value={DeviceType.MOBILE}>Mobile</SelectItem>
                    <SelectItem value={DeviceType.TABLET}>Tablet</SelectItem>
                  </SelectContent>
                </Select>
                
                {/* Status */}
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters(prev => ({ 
                    ...prev, 
                    status: value as SessionStatus | 'all' 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value={SessionStatus.ACTIVE}>Ativa</SelectItem>
                    <SelectItem value={SessionStatus.INACTIVE}>Inativa</SelectItem>
                    <SelectItem value={SessionStatus.EXPIRED}>Expirada</SelectItem>
                  </SelectContent>
                </Select>
                
                {/* Security */}
                <Select
                  value={filters.suspicious}
                  onValueChange={(value) => setFilters(prev => ({ 
                    ...prev, 
                    suspicious: value as 'all' | 'suspicious' | 'trusted' 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Segurança" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="suspicious">Suspeitas</SelectItem>
                    <SelectItem value="trusted">Confiáveis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Clear Filters */}
              {(filters.search || filters.deviceType !== 'all' || filters.status !== 'all' || 
                filters.suspicious !== 'all' || filters.location) && (
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
          
          {/* Sessions List */}
          <div 
            className="space-y-4 overflow-y-auto"
            style={{ maxHeight }}
          >
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredSessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhuma sessão encontrada</p>
                {(filters.search || filters.deviceType !== 'all' || filters.status !== 'all' || 
                  filters.suspicious !== 'all') && (
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
              filteredSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  isCurrentSession={session.id === currentSession?.id}
                  onTerminate={showActions ? handleTerminateSession : undefined}
                  onReportSuspicious={showActions ? handleReportSuspicious : undefined}
                  onTrustDevice={showActions ? handleTrustDevice : undefined}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Terminate All Other Sessions Dialog */}
      <AlertDialog open={showTerminateAllDialog} onOpenChange={setShowTerminateAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Encerrar Todas as Outras Sessões</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja encerrar todas as outras sessões ativas? 
              Isso irá desconectar todos os outros dispositivos imediatamente.
              <br /><br />
              <strong>{otherSessions.length} sessões</strong> serão encerradas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleTerminateAllOther}
              disabled={isTerminatingAll}
              className="bg-red-600 hover:bg-red-700"
            >
              {isTerminatingAll ? 'Encerrando...' : 'Encerrar Todas'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ActiveSessionsList;