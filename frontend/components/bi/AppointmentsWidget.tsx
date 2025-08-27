import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Calendar,
  Clock,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Star,
  RefreshCw
} from 'lucide-react';
import {
  useAppointmentMetrics,
  useAppointmentTrends,
  useDoctorPerformance,
  useAppointmentAlerts
} from '@/hooks/bi/useAppointmentsBI';
import { CustomChart } from './CustomChart';
import type { AppointmentFilters } from '@/types/appointments';
import type { ChartData } from '@/types/bi/metrics';

interface AppointmentsWidgetProps {
  filters?: AppointmentFilters;
  variant?: 'metrics' | 'trends' | 'doctors' | 'alerts' | 'summary';
  className?: string;
  showRefresh?: boolean;
  onRefresh?: () => void;
}

// Widget de métricas principais
function MetricsWidget({ filters, className, showRefresh, onRefresh }: AppointmentsWidgetProps) {
  const { data: metrics, isLoading, error, refetch } = useAppointmentMetrics(filters);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Erro ao carregar métricas de agendamentos. Tente novamente.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) return null;

  const handleRefresh = () => {
    refetch();
    onRefresh?.();
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg font-medium">Métricas de Agendamentos</CardTitle>
          <CardDescription>Visão geral dos agendamentos</CardDescription>
        </div>
        {showRefresh && (
          <Button variant="ghost" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Total</span>
            </div>
            <div className="text-2xl font-bold">{metrics.totalAppointments}</div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Realizados</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{metrics.completedAppointments}</div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-muted-foreground">Faltas</span>
            </div>
            <div className="text-2xl font-bold text-red-600">{metrics.noShowAppointments}</div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Satisfação</span>
            </div>
            <div className="text-2xl font-bold">{metrics.patientSatisfaction.toFixed(1)}</div>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Taxa de Ocupação</span>
            <span className="font-medium">{metrics.occupancyRate.toFixed(1)}%</span>
          </div>
          <Progress value={metrics.occupancyRate} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}

// Widget de tendências
function TrendsWidget({ filters, className }: AppointmentsWidgetProps) {
  const { data: trends, isLoading, error } = useAppointmentTrends('daily', filters);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !trends) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Erro ao carregar tendências de agendamentos.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const chartData: ChartData = {
    labels: trends.dailyData.map(d => d.date),
    datasets: [
      {
        label: 'Agendamentos',
        data: trends.dailyData.map(d => d.appointments),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      },
      {
        label: 'Realizados',
        data: trends.dailyData.map(d => d.completed),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4
      }
    ]
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Tendências de Agendamentos</CardTitle>
        <CardDescription>Evolução diária dos agendamentos</CardDescription>
      </CardHeader>
      <CardContent>
        <CustomChart
          type="line"
          data={chartData}
          height={300}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top' as const,
              },
            },
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          }}
        />
      </CardContent>
    </Card>
  );
}

// Widget de performance dos médicos
function DoctorsWidget({ filters, className }: AppointmentsWidgetProps) {
  const { data: doctors, isLoading, error } = useDoctorPerformance(filters);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-2 w-full" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !doctors) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Erro ao carregar performance dos médicos.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Performance dos Médicos</CardTitle>
        <CardDescription>Top médicos por agendamentos realizados</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {doctors.slice(0, 5).map((doctor, index) => (
            <div key={doctor.doctorId} className="flex items-center space-x-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold">
                {index + 1}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{doctor.doctorName}</p>
                  <Badge variant="secondary">{doctor.totalAppointments}</Badge>
                </div>
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <span>Taxa: {doctor.completionRate.toFixed(1)}%</span>
                  <span>Satisfação: {doctor.averageRating.toFixed(1)}</span>
                </div>
                <Progress value={doctor.completionRate} className="h-1" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Widget de alertas
function AlertsWidget({ filters, className }: AppointmentsWidgetProps) {
  const alerts = useAppointmentAlerts(filters);

  if (!alerts.length) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Alertas</CardTitle>
          <CardDescription>Nenhum alerta no momento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <CheckCircle className="h-8 w-8 mr-2" />
            <span>Tudo funcionando normalmente</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Alertas</CardTitle>
        <CardDescription>{alerts.length} alerta(s) ativo(s)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <Alert key={alert.id} className={`border-l-4 ${
              alert.type === 'critical' ? 'border-l-red-500' :
              alert.type === 'warning' ? 'border-l-yellow-500' :
              'border-l-blue-500'
            }`}>
              <AlertTriangle className={`h-4 w-4 ${
                alert.type === 'critical' ? 'text-red-500' :
                alert.type === 'warning' ? 'text-yellow-500' :
                'text-blue-500'
              }`} />
              <div>
                <div className="font-medium">{alert.title}</div>
                <AlertDescription className="mt-1">
                  {alert.message}
                </AlertDescription>
              </div>
            </Alert>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Widget resumo
function SummaryWidget({ filters, className }: AppointmentsWidgetProps) {
  const { data: metrics, isLoading } = useAppointmentMetrics(filters);
  const alerts = useAppointmentAlerts(filters);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!metrics) return null;

  const completionRate = (metrics.completedAppointments / metrics.totalAppointments) * 100;
  const noShowRate = (metrics.noShowAppointments / metrics.totalAppointments) * 100;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Resumo de Agendamentos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{metrics.totalAppointments}</div>
            <div className="text-sm text-muted-foreground">Total de Agendamentos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{completionRate.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">Taxa de Conclusão</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Ocupação</span>
            <span className={`font-medium ${
              metrics.occupancyRate >= 80 ? 'text-green-600' :
              metrics.occupancyRate >= 60 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {metrics.occupancyRate.toFixed(1)}%
            </span>
          </div>
          <Progress value={metrics.occupancyRate} className="h-2" />
        </div>
        
        {alerts.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center space-x-2 text-yellow-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">
                {alerts.length} alerta(s) requer(em) atenção
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Componente principal
export function AppointmentsWidget(props: AppointmentsWidgetProps) {
  const { variant = 'summary' } = props;

  switch (variant) {
    case 'metrics':
      return <MetricsWidget {...props} />;
    case 'trends':
      return <TrendsWidget {...props} />;
    case 'doctors':
      return <DoctorsWidget {...props} />;
    case 'alerts':
      return <AlertsWidget {...props} />;
    case 'summary':
    default:
      return <SummaryWidget {...props} />;
  }
}

export default AppointmentsWidget;