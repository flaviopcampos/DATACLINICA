import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  SessionCard,
  ActiveSessionsList,
  SessionActivity, 
  SessionFilters,
  SessionFiltersState
} from '@/components/sessions';
import type { SessionFilters as SessionFiltersType } from '@/types/sessions';
import { useSessions } from '@/hooks/useSessions';
import { useSessionActivity } from '@/hooks/useSessionActivity';
import { Shield, Activity, Settings, AlertTriangle, Smartphone, Monitor, Globe } from 'lucide-react';
import { SessionStats } from '@/types/sessions';

function Sessions() {
  const [filters, setFilters] = useState<SessionFiltersState>({
    search: '',
    deviceTypes: [],
    statuses: [],
    securityLevels: [],
    countries: [],
    cities: [],
    dateRange: 'all',
    showCurrentSession: true,
    showSuspiciousOnly: false
  });

  // Convert SessionFiltersState to SessionFilters for the API
  const convertFilters = (uiFilters: SessionFiltersState): SessionFiltersType => {
    return {
      status: uiFilters.statuses.length > 0 ? uiFilters.statuses : undefined,
      device_type: uiFilters.deviceTypes.length > 0 ? uiFilters.deviceTypes : undefined,
      security_level: uiFilters.securityLevels.length > 0 ? uiFilters.securityLevels : undefined,
      is_trusted: undefined, // Can be added later if needed
      location: uiFilters.countries.length > 0 ? uiFilters.countries[0] : undefined,
      date_range: uiFilters.dateRange !== 'all' ? {
        start: getDateRangeStart(uiFilters.dateRange),
        end: new Date().toISOString()
      } : undefined
    };
  };

  const getDateRangeStart = (range: string): string => {
    const now = new Date();
    switch (range) {
      case 'today':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return weekAgo.toISOString();
      case 'month':
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        return monthAgo.toISOString();
      default:
        return new Date(0).toISOString();
    }
  };

  const { 
    sessions, 
    isLoading: sessionsLoading, 
    error: sessionsError,
    refresh: refetchSessions
  } = useSessions({ filters: convertFilters(filters) });

  const {
    activities,
    isLoading: activitiesLoading,
    error: activitiesError
  } = useSessionActivity({ limit: 50 });

  const {
    sessionStats: stats,
    isLoadingStats: statsLoading
  } = useSessions();

  const handleRefresh = () => {
    refetchSessions();
  };

  const renderStatsCards = (stats: SessionStats) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sessões Ativas</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeSessions}</div>
          <p className="text-xs text-muted-foreground">
            {stats.activeSessions > stats.maxConcurrentSessions * 0.8 && (
              <span className="text-orange-600">Próximo ao limite</span>
            )}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Dispositivos</CardTitle>
          <Smartphone className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.uniqueDevices}</div>
          <div className="flex gap-1 mt-1">
            <Badge variant="outline" className="text-xs">
              <Monitor className="h-3 w-3 mr-1" />
              {stats.deviceBreakdown.desktop}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Smartphone className="h-3 w-3 mr-1" />
              {stats.deviceBreakdown.mobile}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Localizações</CardTitle>
          <Globe className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.uniqueLocations}</div>
          <p className="text-xs text-muted-foreground">
            {stats.suspicious_activities > 0 && (
              <span className="text-orange-600 text-sm">
                {stats.suspicious_activities} suspeitas
              </span>
            )}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Segurança</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            85%
          </div>
          <div className="flex items-center gap-1 mt-1">
            {stats.suspicious_activities > 0 && (
              <span className="text-red-600 text-sm ml-2">
                <AlertTriangle className="h-4 w-4 inline mr-1" />
                {stats.suspicious_activities} alertas
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (sessionsError || activitiesError) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar dados das sessões. Tente novamente.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Sessões</h1>
          <p className="text-muted-foreground">
            Monitore e gerencie suas sessões ativas e histórico de atividades
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            Atualizar
          </Button>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {!statsLoading && stats && renderStatsCards(stats)}

      {/* Security Alerts */}
      {stats?.securityAlerts > 0 && (
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Você tem {stats.securityAlerts} alerta(s) de segurança pendente(s). 
            Verifique suas sessões ativas.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs defaultValue="sessions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sessions">Sessões Ativas</TabsTrigger>
          <TabsTrigger value="activity">Atividade Recente</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
              <CardDescription>
                Filtre suas sessões por dispositivo, localização e outros critérios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SessionFilters 
                filters={filters} 
                onFiltersChange={setFilters}
                compact={true}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sessões Ativas</CardTitle>
              <CardDescription>
                {sessions?.length || 0} sessão(ões) ativa(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActiveSessionsList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
              <CardDescription>
                Histórico das últimas atividades em suas sessões
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SessionActivity 
                showFilters={true}
                autoRefresh={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Sessions;