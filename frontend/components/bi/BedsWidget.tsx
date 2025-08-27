import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { CustomChart } from './CustomChart';
import {
  useBedMetrics,
  useBedOccupancyTrends,
  useDepartmentBedAnalytics,
  useBedTypeAnalytics,
  useBedAlerts
} from '@/hooks/bi/useBedsBI';
import {
  Bed,
  Building,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  RefreshCw,
  Activity,
  DollarSign,
  Clock,
  BarChart3
} from 'lucide-react';

interface BedsWidgetProps {
  variant: 'metrics' | 'trends' | 'departments' | 'bedTypes' | 'alerts' | 'summary';
  filters?: any;
  className?: string;
  showRefresh?: boolean;
  onRefresh?: () => void;
}

export function BedsWidget({
  variant,
  filters,
  className = '',
  showRefresh = false,
  onRefresh
}: BedsWidgetProps) {
  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useBedMetrics(filters);
  const { data: trends, isLoading: trendsLoading, refetch: refetchTrends } = useBedOccupancyTrends(filters);
  const { data: departmentAnalytics, isLoading: departmentLoading, refetch: refetchDepartment } = useDepartmentBedAnalytics(filters);
  const { data: bedTypeAnalytics, isLoading: bedTypeLoading, refetch: refetchBedType } = useBedTypeAnalytics(filters);
  const { alerts, isLoading: alertsLoading } = useBedAlerts(filters);

  const handleRefresh = () => {
    switch (variant) {
      case 'metrics':
      case 'summary':
        refetchMetrics();
        break;
      case 'trends':
        refetchTrends();
        break;
      case 'departments':
        refetchDepartment();
        break;
      case 'bedTypes':
        refetchBedType();
        break;
      case 'alerts':
        // Alerts são atualizados automaticamente
        break;
    }
    onRefresh?.();
  };

  const renderMetrics = () => {
    if (metricsLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      );
    }

    if (!metrics) return <div>Nenhum dado disponível</div>;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Bed className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Total de Leitos</span>
            </div>
            <div className="text-2xl font-bold">{metrics.totalBeds}</div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Ocupados</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{metrics.occupiedBeds}</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Taxa de Ocupação</span>
            <span className="font-medium">{metrics.occupancyRate.toFixed(1)}%</span>
          </div>
          <Progress value={metrics.occupancyRate} className="h-2" />
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Disponíveis</span>
            <Badge variant="outline" className="text-green-600">
              {metrics.availableBeds}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Manutenção</span>
            <Badge variant="outline" className="text-yellow-600">
              {metrics.maintenanceBeds}
            </Badge>
          </div>
        </div>
      </div>
    );
  };

  const renderTrends = () => {
    if (trendsLoading) {
      return <Skeleton className="h-64 w-full" />;
    }

    if (!trends || trends.length === 0) {
      return <div>Nenhum dado de tendência disponível</div>;
    }

    const chartData = trends.map(trend => ({
      date: new Date(trend.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      'Taxa de Ocupação': trend.occupancyRate,
      'Admissões': trend.admissions,
      'Altas': trend.discharges
    }));

    return (
      <CustomChart
        data={chartData}
        type="line"
        xAxisKey="date"
        yAxisKeys={['Taxa de Ocupação', 'Admissões', 'Altas']}
        colors={['#3b82f6', '#10b981', '#f59e0b']}
        height={250}
      />
    );
  };

  const renderDepartments = () => {
    if (departmentLoading) {
      return (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      );
    }

    if (!departmentAnalytics || departmentAnalytics.length === 0) {
      return <div>Nenhum dado de departamento disponível</div>;
    }

    return (
      <div className="space-y-3">
        {departmentAnalytics.map(dept => (
          <div key={dept.departmentId} className="border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Building className="h-4 w-4 text-blue-500" />
                <span className="font-medium">{dept.departmentName}</span>
              </div>
              <Badge variant={dept.occupancyRate > 85 ? 'destructive' : 'secondary'}>
                {dept.occupancyRate.toFixed(1)}%
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
              <div>Leitos: {dept.occupiedBeds}/{dept.totalBeds}</div>
              <div>Permanência: {dept.averageStayDuration.toFixed(1)}d</div>
              <div>Receita: R$ {dept.revenue.toLocaleString()}</div>
            </div>
            <Progress value={dept.occupancyRate} className="h-1 mt-2" />
          </div>
        ))}
      </div>
    );
  };

  const renderBedTypes = () => {
    if (bedTypeLoading) {
      return <Skeleton className="h-64 w-full" />;
    }

    if (!bedTypeAnalytics || bedTypeAnalytics.length === 0) {
      return <div>Nenhum dado de tipos de leito disponível</div>;
    }

    const chartData = bedTypeAnalytics.map(type => ({
      name: type.bedType,
      'Taxa de Ocupação': type.occupancyRate,
      'Receita': type.revenue / 1000, // Em milhares
      'Demanda': type.demandRate
    }));

    return (
      <CustomChart
        data={chartData}
        type="bar"
        xAxisKey="name"
        yAxisKeys={['Taxa de Ocupação', 'Receita', 'Demanda']}
        colors={['#3b82f6', '#10b981', '#f59e0b']}
        height={250}
      />
    );
  };

  const renderAlerts = () => {
    if (alertsLoading) {
      return <Skeleton className="h-32 w-full" />;
    }

    if (!alerts || alerts.length === 0) {
      return (
        <div className="flex items-center justify-center h-32 text-muted-foreground">
          <div className="text-center">
            <Activity className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p>Nenhum alerta ativo</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {alerts.slice(0, 3).map(alert => (
          <Alert key={alert.id} variant={alert.type === 'error' ? 'destructive' : 'default'}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{alert.title}</div>
                  <div className="text-sm text-muted-foreground">{alert.message}</div>
                </div>
                <Badge variant={alert.priority === 'high' ? 'destructive' : 'secondary'}>
                  {alert.priority === 'high' ? 'Alta' : alert.priority === 'medium' ? 'Média' : 'Baixa'}
                </Badge>
              </div>
            </AlertDescription>
          </Alert>
        ))}
      </div>
    );
  };

  const renderSummary = () => {
    if (metricsLoading) {
      return <Skeleton className="h-48 w-full" />;
    }

    if (!metrics) return <div>Nenhum dado disponível</div>;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{metrics.occupancyRate.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">Taxa de Ocupação</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{metrics.availableBeds}</div>
            <div className="text-sm text-muted-foreground">Leitos Disponíveis</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-orange-500" />
            <div>
              <div className="font-medium">{metrics.averageStayDuration.toFixed(1)} dias</div>
              <div className="text-xs text-muted-foreground">Permanência Média</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-green-500" />
            <div>
              <div className="font-medium">R$ {metrics.revenuePerBed.toFixed(0)}</div>
              <div className="text-xs text-muted-foreground">Receita por Leito</div>
            </div>
          </div>
        </div>
        
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-sm">
            <span>Status dos Leitos</span>
            <div className="flex space-x-2">
              <Badge variant="outline" className="text-green-600">
                {metrics.availableBeds} Livres
              </Badge>
              <Badge variant="outline" className="text-red-600">
                {metrics.occupiedBeds} Ocupados
              </Badge>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getTitle = () => {
    switch (variant) {
      case 'metrics': return 'Métricas de Leitos';
      case 'trends': return 'Tendências de Ocupação';
      case 'departments': return 'Análise por Departamento';
      case 'bedTypes': return 'Análise por Tipo de Leito';
      case 'alerts': return 'Alertas de Leitos';
      case 'summary': return 'Resumo de Leitos';
      default: return 'Leitos';
    }
  };

  const getDescription = () => {
    switch (variant) {
      case 'metrics': return 'Indicadores principais de ocupação';
      case 'trends': return 'Evolução da ocupação ao longo do tempo';
      case 'departments': return 'Performance por departamento';
      case 'bedTypes': return 'Análise por categoria de leito';
      case 'alerts': return 'Alertas e notificações importantes';
      case 'summary': return 'Visão geral do sistema de leitos';
      default: return '';
    }
  };

  const renderContent = () => {
    switch (variant) {
      case 'metrics': return renderMetrics();
      case 'trends': return renderTrends();
      case 'departments': return renderDepartments();
      case 'bedTypes': return renderBedTypes();
      case 'alerts': return renderAlerts();
      case 'summary': return renderSummary();
      default: return <div>Variante não suportada</div>;
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-medium">{getTitle()}</CardTitle>
          <CardDescription className="text-sm">{getDescription()}</CardDescription>
        </div>
        {showRefresh && (
          <Button variant="ghost" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}