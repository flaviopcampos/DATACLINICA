'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Bed, 
  Users, 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  Settings,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import { useBeds, useBedsStats, useBedsByStatus } from '@/hooks/useBeds';
import { useBedOccupancy } from '@/src/hooks/useBedOccupancy';
import { BedStatus } from '@/types/beds';
import { BedList } from './BedList';
import { OccupancyChart } from './OccupancyChart';
import { BedCard } from './BedCard';

interface BedsDashboardProps {
  departmentId?: string;
  className?: string;
}

export function BedsDashboard({ departmentId, className }: BedsDashboardProps) {
  const [selectedDepartment, setSelectedDepartment] = useState<string>(departmentId || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BedStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Hooks para dados
  const { data: bedsStats, isLoading: isLoadingStats } = useBedsStats({
    departmentId: selectedDepartment !== 'all' ? selectedDepartment : undefined
  });
  
  const { data: occupancyData, isLoading: isLoadingOccupancy } = useBedOccupancy({
    departmentId: selectedDepartment !== 'all' ? selectedDepartment : undefined
  });

  const { data: availableBeds } = useBedsByStatus('available');
  const { data: occupiedBeds } = useBedsByStatus('occupied');
  const { data: maintenanceBeds } = useBedsByStatus('maintenance');
  const { data: cleaningBeds } = useBedsByStatus('cleaning');

  const { beds, isLoading: isLoadingBeds, refetch } = useBeds({
    departmentId: selectedDepartment !== 'all' ? selectedDepartment : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    search: searchTerm || undefined
  });

  // Estatísticas resumidas
  const totalBeds = bedsStats?.totalBeds || 0;
  const occupancyRate = bedsStats?.occupancyRate || 0;
  const availableCount = availableBeds?.length || 0;
  const occupiedCount = occupiedBeds?.length || 0;
  const maintenanceCount = maintenanceBeds?.length || 0;
  const cleaningCount = cleaningBeds?.length || 0;

  const handleRefresh = () => {
    refetch();
  };

  if (isLoadingStats || isLoadingOccupancy || isLoadingBeds) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando dashboard...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard de Leitos</h1>
          <p className="text-muted-foreground">
            Visão geral da ocupação e status dos leitos hospitalares
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar leitos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Departamentos</SelectItem>
                <SelectItem value="uti">UTI</SelectItem>
                <SelectItem value="enfermaria">Enfermaria</SelectItem>
                <SelectItem value="emergencia">Emergência</SelectItem>
                <SelectItem value="cirurgia">Cirurgia</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as BedStatus | 'all')}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="available">Disponível</SelectItem>
                <SelectItem value="occupied">Ocupado</SelectItem>
                <SelectItem value="maintenance">Manutenção</SelectItem>
                <SelectItem value="cleaning">Limpeza</SelectItem>
                <SelectItem value="reserved">Reservado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leitos</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBeds}</div>
            <p className="text-xs text-muted-foreground">
              Capacidade total do hospital
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Ocupação</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupancyRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {occupancyRate > 85 ? (
                <span className="text-red-600">Ocupação alta</span>
              ) : occupancyRate > 70 ? (
                <span className="text-yellow-600">Ocupação moderada</span>
              ) : (
                <span className="text-green-600">Ocupação baixa</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leitos Disponíveis</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{availableCount}</div>
            <p className="text-xs text-muted-foreground">
              Prontos para ocupação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leitos Ocupados</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{occupiedCount}</div>
            <p className="text-xs text-muted-foreground">
              Com pacientes internados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cards de Status Especiais */}
      {(maintenanceCount > 0 || cleaningCount > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {maintenanceCount > 0 && (
            <Card className="border-orange-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Em Manutenção</CardTitle>
                <Settings className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{maintenanceCount}</div>
                <p className="text-xs text-muted-foreground">
                  Leitos temporariamente indisponíveis
                </p>
              </CardContent>
            </Card>
          )}

          {cleaningCount > 0 && (
            <Card className="border-purple-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Em Limpeza</CardTitle>
                <Activity className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{cleaningCount}</div>
                <p className="text-xs text-muted-foreground">
                  Processo de higienização
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Gráfico de Ocupação */}
      <Card>
        <CardHeader>
          <CardTitle>Ocupação ao Longo do Tempo</CardTitle>
          <CardDescription>
            Histórico de ocupação dos leitos nas últimas 24 horas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OccupancyChart data={occupancyData} />
        </CardContent>
      </Card>

      {/* Lista/Grid de Leitos */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Leitos</CardTitle>
              <CardDescription>
                {beds.length} leitos encontrados
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                Lista
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'list' ? (
            <BedList beds={beds} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {beds.map((bed) => (
                <BedCard key={bed.id} bed={bed} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}