'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  Calendar,
  DollarSign,
  Users,
  Bed,
  Settings,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import DragDropLayout from '@/components/bi/DragDropLayout';
import type { WidgetItem } from '@/components/bi/DragDropLayout';
import { AppointmentsWidget } from '@/components/bi/AppointmentsWidget';
import { BillingWidget } from '@/components/bi/BillingWidget';
import { BedsWidget } from '@/components/bi/BedsWidget';
import { DashboardWidget } from '@/components/bi/DashboardWidget';
import { MetricCard } from '@/components/bi/MetricCard';
import { KPIIndicator } from '@/components/bi/KPIIndicator';
import type { FilterDefinition, ActiveFilter } from '@/components/bi/DynamicFilters';
import { AppointmentStatus, AppointmentType } from '../../../types/appointments';
import { MetricType, MetricUnit } from '@/types/bi/metrics';

// Interface estendida para filtros do BI
interface ExtendedAppointmentFilters {
  doctor_id?: string;
  patient_id?: string;
  status?: AppointmentStatus | AppointmentStatus[];
  type?: AppointmentType;
  date_from?: string;
  date_to?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  doctorIds?: string[];
  specialty?: string;
}

// Configuração inicial dos widgets
const initialWidgets: WidgetItem[] = [{
      id: 'appointments-summary',
      title: 'Resumo de Agendamentos',
      type: 'metric',
      size: 'medium',
      position: { x: 0, y: 0 },
      isVisible: true,
    config: {
        id: 'appointments-summary',
        title: 'Resumo de Agendamentos',
        type: 'metric',
        description: 'Visão geral dos agendamentos',
        size: 'medium',
        isVisible: true,
        metrics: [],
      appearance: {
        theme: 'light',
        colorScheme: 'blue',
        showTitle: true,
        showBorder: true,
        borderRadius: 'md'
      },
      behavior: {
          autoRefresh: true,
          refreshInterval: 600000,
          showTooltips: true,
          enableInteraction: true,
          showLegend: true,
          animationEnabled: true
        }
    }
  },
  {
    id: 'appointments-trends',
    title: 'Tendências de Agendamentos',
    type: 'chart',
    size: 'medium',
    position: { x: 6, y: 0 },
    isVisible: true,
    config: {
      id: 'appointments-trends',
      title: 'Tendências de Agendamentos',
      type: 'chart',
      description: 'Evolução dos agendamentos ao longo do tempo',
      size: 'medium',
      isVisible: true,

      metrics: [],
      appearance: {
        theme: 'light',
        colorScheme: 'green',
        showTitle: true,
        showBorder: true,
        borderRadius: 'md'
      },
      behavior: {
          autoRefresh: true,
          refreshInterval: 600000,
          showTooltips: true,
          enableInteraction: true,
          showLegend: true,
          animationEnabled: true
        }
    }
  },
  {
      id: 'doctors-performance',
      title: 'Performance dos Médicos',
      type: 'table',
      size: 'medium',
      position: { x: 0, y: 4 },
      isVisible: true,
    config: {
        id: 'doctors-ranking',
        title: 'Ranking de Médicos',
        type: 'table',
        description: 'Ranking de médicos por performance',
        size: 'medium',
        isVisible: true,
        metrics: [],
      appearance: {
        theme: 'light',
        colorScheme: 'purple',
        showTitle: true,
        showBorder: true,
        borderRadius: 'md'
      },
      behavior: {
        autoRefresh: true,
        refreshInterval: 900000,
        showTooltips: true,
        enableInteraction: true,
        showLegend: false,
        animationEnabled: true
      }
    }
  },
  {
      id: 'appointments-alerts',
      title: 'Alertas de Agendamentos',
      type: 'metric',
      size: 'medium',
      position: { x: 4, y: 4 },
      isVisible: true,
    config: {
        id: 'appointments-alerts',
        title: 'Alertas de Agendamentos',
        type: 'metric',
        description: 'Alertas e notificações importantes',
        size: 'medium',
        isVisible: true,
      
      metrics: [],
      appearance: {
        theme: 'light',
        colorScheme: 'red',
        showTitle: true,
        showBorder: true,
        borderRadius: 'md'
      },
      behavior: {
        autoRefresh: true,
        refreshInterval: 60000,
        showTooltips: true,
        enableInteraction: true,
        showLegend: false,
        animationEnabled: true
      }
    }
  },
  {
      id: 'main-kpis',
      title: 'KPIs Principais',
      type: 'kpi',
      size: 'medium',
      position: { x: 8, y: 4 },
      isVisible: true,
    config: {
        id: 'main-kpis',
        title: 'KPIs Principais',
        type: 'kpi',
        description: 'Indicadores chave de performance',
        size: 'medium',
        isVisible: true,
      
      metrics: [],
      appearance: {
        theme: 'light',
        colorScheme: 'blue',
        showTitle: true,
        showBorder: true,
        borderRadius: 'md'
      },
      behavior: {
        autoRefresh: true,
        refreshInterval: 300000,
        showTooltips: true,
        enableInteraction: true,
        showLegend: false,
        animationEnabled: true
      }
    }
  }
];

// Filtros disponíveis
const availableFilters: FilterDefinition[] = [
  {
    id: 'dateRange',
    name: 'Período',
    type: 'daterange',
    field: 'dateRange',
    category: 'Tempo',
    required: false,
    options: []
  },
  {
    id: 'doctor',
    name: 'Médico',
    type: 'multiselect',
    field: 'doctorId',
    category: 'Recursos',
    required: false,
    options: [
      { value: 'dr-silva', label: 'Dr. Silva' },
      { value: 'dra-santos', label: 'Dra. Santos' },
      { value: 'dr-oliveira', label: 'Dr. Oliveira' }
    ]
  },
  {
    id: 'specialty',
    name: 'Especialidade',
    type: 'select',
    field: 'specialty',
    category: 'Recursos',
    required: false,
    options: [
      { value: 'cardiologia', label: 'Cardiologia' },
      { value: 'dermatologia', label: 'Dermatologia' },
      { value: 'pediatria', label: 'Pediatria' }
    ]
  },
  {
    id: 'status',
    name: 'Status',
    type: 'multiselect',
    field: 'status',
    category: 'Estado',
    required: false,
    options: [
      { value: 'scheduled', label: 'Agendado' },
      { value: 'completed', label: 'Realizado' },
      { value: 'cancelled', label: 'Cancelado' },
      { value: 'no-show', label: 'Falta' }
    ]
  },
  {
    id: 'department',
    name: 'Departamento',
    type: 'select',
    field: 'department',
    category: 'Recursos',
    required: false,
    options: [
      { value: 'uti', label: 'UTI' },
      { value: 'enfermaria', label: 'Enfermaria' },
      { value: 'cirurgia', label: 'Cirurgia' },
      { value: 'emergencia', label: 'Emergência' }
    ]
  },
  {
    id: 'bedType',
    name: 'Tipo de Leito',
    type: 'select',
    field: 'bedType',
    category: 'Recursos',
    required: false,
    options: [
      { value: 'standard', label: 'Padrão' },
      { value: 'icu', label: 'UTI' },
      { value: 'isolation', label: 'Isolamento' },
      { value: 'pediatric', label: 'Pediátrico' }
    ]
  }
];

export default function BIDashboard() {
  const [widgets, setWidgets] = useState<WidgetItem[]>(initialWidgets);
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Converter filtros ativos para filtros de agendamentos
  const appointmentFilters: ExtendedAppointmentFilters = React.useMemo(() => {
    const filters: ExtendedAppointmentFilters = {};
    
    activeFilters.forEach(filter => {
      switch (filter.id) {
        case 'dateRange':
          if (filter.value && typeof filter.value === 'object' && 'start' in filter.value) {
            filters.startDate = filter.value.start as string;
            filters.endDate = filter.value.end as string;
          }
          break;
        case 'doctor':
          if (Array.isArray(filter.value)) {
            filters.doctorIds = filter.value as string[];
          }
          break;
        case 'specialty':
          if (typeof filter.value === 'string') {
            filters.specialty = filter.value;
          }
          break;
        case 'status':
          if (Array.isArray(filter.value)) {
            filters.status = filter.value as AppointmentStatus[];
          }
          break;
      }
    });
    
    return filters;
  }, [activeFilters]);

  // Converter filtros ativos para filtros de faturamento
  const billingFilters = React.useMemo(() => {
    const filters: any = {};
    
    activeFilters.forEach(filter => {
      switch (filter.id) {
        case 'dateRange':
          if (filter.value && typeof filter.value === 'object' && 'start' in filter.value) {
            filters.startDate = filter.value.start as string;
            filters.endDate = filter.value.end as string;
          }
          break;
        case 'status':
          if (Array.isArray(filter.value)) {
            filters.status = filter.value as string[];
          }
          break;
      }
    });
    
    return filters;
  }, [activeFilters]);

  // Converter filtros ativos para filtros de leitos
  const bedsFilters = React.useMemo(() => {
    const filters: any = {};
    
    activeFilters.forEach(filter => {
      switch (filter.id) {
        case 'dateRange':
          if (filter.value && typeof filter.value === 'object' && 'start' in filter.value) {
            filters.startDate = filter.value.start as string;
            filters.endDate = filter.value.end as string;
          }
          break;
        case 'department':
          if (typeof filter.value === 'string') {
            filters.department = filter.value;
          }
          break;
        case 'bedType':
          if (typeof filter.value === 'string') {
            filters.bedType = filter.value;
          }
          break;
        case 'status':
          if (Array.isArray(filter.value)) {
            filters.status = filter.value as string[];
          }
          break;
      }
    });
    
    return filters;
  }, [activeFilters]);

  const handleWidgetsChange = (newWidgets: WidgetItem[]) => {
    setWidgets(newWidgets);
  };

  const handleFiltersChange = (newFilters: ActiveFilter[]) => {
    setActiveFilters(newFilters);
  };

  const handleToggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleRefreshAll = () => {
    // Implementar refresh de todos os widgets
    console.log('Refreshing all widgets...');
  };

  const handleExportData = () => {
    // Implementar exportação de dados
    console.log('Exporting dashboard data...');
  };

  // Renderizar widget customizado baseado no tipo
  const renderWidget = (widget: WidgetItem) => {
    const appointmentProps = {
      key: widget.id,
      className: "h-full",
      filters: appointmentFilters,
      showRefresh: true,
      onRefresh: () => console.log(`Refreshing widget ${widget.id}`)
    };

    const dashboardProps = {
      widget: widget as any,
      className: 'h-full'
    };

    const kpiProps = {
      kpi: widget as any,
      className: "h-full"
    };

    switch (widget.type) {
      case 'appointments':
        return (
          <AppointmentsWidget
            {...(appointmentProps as any)}
            variant="summary"
          />
        );
      case 'chart':
        if (widget.id === 'appointments-trends') {
          return (
            <AppointmentsWidget
              {...(appointmentProps as any)}
              variant="trends"
            />
          );
        }
        return (
          <DashboardWidget
            {...dashboardProps}
          />
        );
      case 'table':
        if (widget.id === 'doctors-performance') {
          return (
            <AppointmentsWidget
              {...(appointmentProps as any)}
              variant="doctors"
            />
          );
        }
        return (
          <DashboardWidget
            {...dashboardProps}
          />
        );
      case 'alerts':
        return (
          <AppointmentsWidget
            {...(appointmentProps as any)}
            variant="alerts"
          />
        );
      case 'kpi':
        return (
          <KPIIndicator
            {...kpiProps}
          />
        );
      default:
        return (
          <DashboardWidget
            {...dashboardProps}
          />
        );
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard BI</h2>
          <p className="text-muted-foreground">
            Análise inteligente dos dados da clínica
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleFilters}
            className="relative"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
            {activeFilters.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                {activeFilters.length}
              </Badge>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefreshAll}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button
            variant={isEditMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsEditMode(!isEditMode)}
          >
            <Settings className="h-4 w-4 mr-2" />
            {isEditMode ? 'Sair da Edição' : 'Editar'}
          </Button>
        </div>
      </div>

      {/* Tabs para diferentes seções */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="appointments" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Agendamentos</span>
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4" />
            <span>Financeiro</span>
          </TabsTrigger>
          <TabsTrigger value="patients" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Pacientes</span>
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center space-x-2">
            <Bed className="h-4 w-4" />
            <span>Recursos</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <DragDropLayout
            widgets={widgets}
            onWidgetsChange={handleWidgetsChange}
            filters={availableFilters}
            activeFilters={activeFilters}
            onFiltersChange={handleFiltersChange}
            showFilters={showFilters}
            onToggleFilters={handleToggleFilters}
            isEditMode={isEditMode}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AppointmentsWidget
              variant="metrics"
              filters={appointmentFilters as any}
              showRefresh
            />
            <AppointmentsWidget
              variant="alerts"
              filters={appointmentFilters as any}
              showRefresh
            />
            <AppointmentsWidget
              variant="summary"
              filters={appointmentFilters as any}
              showRefresh
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <AppointmentsWidget
              variant="trends"
              filters={appointmentFilters as any}
              showRefresh
            />
            <AppointmentsWidget
              variant="doctors"
              filters={appointmentFilters as any}
              showRefresh
            />
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <BillingWidget
              variant="metrics"
              period={billingFilters?.period}
            />
            <BillingWidget
              variant="alerts"
              period={billingFilters?.period}
            />
            <BillingWidget
              variant="summary"
              period={billingFilters?.period}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <BillingWidget
              variant="trends"
              period={billingFilters?.period}
            />
            <BillingWidget
              variant="payments"
              period={billingFilters?.period}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-1">
            <BillingWidget
              variant="overdue"
              period={billingFilters?.period}
            />
          </div>
        </TabsContent>

        <TabsContent value="patients">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Pacientes</CardTitle>
              <CardDescription>
                Métricas e análises de pacientes (em desenvolvimento)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Esta seção será implementada na próxima fase do projeto.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <BedsWidget
              variant="metrics"
              filters={bedsFilters}
              showRefresh
            />
            <BedsWidget
              variant="alerts"
              filters={bedsFilters}
              showRefresh
            />
            <BedsWidget
              variant="summary"
              filters={bedsFilters}
              showRefresh
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <BedsWidget
              variant="trends"
              filters={bedsFilters}
              showRefresh
            />
            <BedsWidget
              variant="departments"
              filters={bedsFilters}
              showRefresh
            />
          </div>
          <div className="grid gap-4 md:grid-cols-1">
            <BedsWidget
              variant="bedTypes"
              filters={bedsFilters}
              showRefresh
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}