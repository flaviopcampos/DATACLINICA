import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  AlertTriangle,
  Clock,
  Users,
  FileText,
  RefreshCw,
  Download
} from 'lucide-react';
import {
  useBillingMetrics,
  useBillingTrends,
  usePaymentAnalytics,
  useOverdueAnalytics,
  useBillingAlerts
} from '../../hooks/bi/useBillingBI';
import { CustomChart } from './CustomChart';
import type { WidgetConfig } from '../../types/bi/dashboard';

interface BillingWidgetProps {
  variant: 'metrics' | 'trends' | 'payments' | 'overdue' | 'alerts' | 'summary';
  period?: string;
  config?: WidgetConfig;
  onRefresh?: () => void;
  onExport?: () => void;
}

export function BillingWidget({ 
  variant, 
  period, 
  config, 
  onRefresh, 
  onExport 
}: BillingWidgetProps) {
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useBillingMetrics(period);
  const { data: trends, isLoading: trendsLoading } = useBillingTrends(period);
  const { data: payments, isLoading: paymentsLoading } = usePaymentAnalytics(period);
  const { data: overdue, isLoading: overdueLoading } = useOverdueAnalytics(period);
  const { alerts } = useBillingAlerts(period);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const renderMetricsVariant = () => {
    if (metricsLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      );
    }

    if (metricsError || !metrics) {
      return (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar métricas de faturamento
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Receita Total</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(metrics.totalRevenue)}
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Faturas Pagas</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {metrics.paidInvoices}/{metrics.totalInvoices}
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium">Taxa de Cobrança</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">
            {formatPercentage(metrics.paymentRate)}
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium">Taxa de Inadimplência</span>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {formatPercentage(metrics.overdueRate)}
          </p>
        </div>
      </div>
    );
  };

  const renderTrendsVariant = () => {
    if (trendsLoading) {
      return <Skeleton className="h-64 w-full" />;
    }

    if (!trends) {
      return (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar tendências de faturamento
          </AlertDescription>
        </Alert>
      );
    }

    const chartData = trends.revenueByMonth.map(item => ({
      name: new Date(item.month).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
      receita: item.revenue,
      faturas: item.invoices
    }));

    return (
      <div className="space-y-4">
        <CustomChart
          data={chartData}
          type="line"
          xKey="name"
          yKeys={['receita']}
          colors={['#10b981']}
          height={200}
        />
        <div className="grid grid-cols-3 gap-4 text-center">
          {trends.revenueByMonth.slice(-3).map((item, index) => (
            <div key={index} className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {new Date(item.month).toLocaleDateString('pt-BR', { month: 'short' })}
              </p>
              <p className="font-semibold">{formatCurrency(item.revenue)}</p>
              <p className="text-xs text-muted-foreground">{item.invoices} faturas</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPaymentsVariant = () => {
    if (paymentsLoading) {
      return <Skeleton className="h-48 w-full" />;
    }

    if (!payments) {
      return (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar análise de pagamentos
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Tempo Médio de Pagamento</span>
            </div>
            <p className="text-xl font-bold">{payments.averagePaymentTime.toFixed(1)} dias</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Taxa de Sucesso</span>
            </div>
            <p className="text-xl font-bold text-green-600">
              {formatPercentage(payments.paymentSuccessRate)}
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium">Métodos de Pagamento Mais Usados</h4>
          <div className="space-y-2">
            {payments.topPaymentMethods.slice(0, 3).map((method, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-sm">{method.method}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {formatPercentage(method.usage)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(method.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderOverdueVariant = () => {
    if (overdueLoading) {
      return <Skeleton className="h-48 w-full" />;
    }

    if (!overdue) {
      return (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar análise de inadimplência
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Valor em Atraso</span>
            </div>
            <p className="text-xl font-bold text-red-600">
              {formatCurrency(overdue.totalOverdueAmount)}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Faturas Vencidas</span>
            </div>
            <p className="text-xl font-bold text-orange-600">
              {overdue.overdueInvoicesCount}
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium">Inadimplência por Período</h4>
          <div className="space-y-2">
            {overdue.overdueByAgeGroup.map((group, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm">{group.ageGroup}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{group.count} faturas</span>
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(group.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderAlertsVariant = () => {
    if (alerts.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-sm text-muted-foreground">Nenhum alerta no momento</p>
          <p className="text-xs text-muted-foreground mt-1">Todas as métricas estão dentro dos parâmetros</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {alerts.slice(0, 5).map((alert) => (
          <Alert key={alert.id} className={`border-l-4 ${
            alert.type === 'error' ? 'border-l-red-500' :
            alert.type === 'warning' ? 'border-l-yellow-500' :
            'border-l-blue-500'
          }`}>
            <AlertTriangle className={`h-4 w-4 ${
              alert.type === 'error' ? 'text-red-500' :
              alert.type === 'warning' ? 'text-yellow-500' :
              'text-blue-500'
            }`} />
            <div>
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{alert.title}</h4>
                <Badge variant={alert.type === 'error' ? 'destructive' : 
                              alert.type === 'warning' ? 'secondary' : 'default'}>
                  {alert.type === 'error' ? 'Crítico' :
                   alert.type === 'warning' ? 'Atenção' : 'Info'}
                </Badge>
              </div>
              <AlertDescription className="mt-1">
                {alert.message}
              </AlertDescription>
            </div>
          </Alert>
        ))}
      </div>
    );
  };

  const renderSummaryVariant = () => {
    if (metricsLoading) {
      return <Skeleton className="h-32 w-full" />;
    }

    if (!metrics) {
      return (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar resumo de faturamento
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">{formatCurrency(metrics.monthlyRevenue)}</p>
            <p className="text-sm text-muted-foreground">Receita do Mês</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-green-600">+8.5%</p>
            <p className="text-xs text-muted-foreground">vs. mês anterior</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Taxa de Cobrança</span>
            <span className="font-medium">{formatPercentage(metrics.paymentRate)}</span>
          </div>
          <Progress value={metrics.paymentRate} className="h-2" />
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-bold">{metrics.totalInvoices}</p>
            <p className="text-xs text-muted-foreground">Total Faturas</p>
          </div>
          <div>
            <p className="text-lg font-bold text-green-600">{metrics.paidInvoices}</p>
            <p className="text-xs text-muted-foreground">Pagas</p>
          </div>
          <div>
            <p className="text-lg font-bold text-red-600">{metrics.overdueInvoices}</p>
            <p className="text-xs text-muted-foreground">Vencidas</p>
          </div>
        </div>
      </div>
    );
  };

  const getTitle = () => {
    switch (variant) {
      case 'metrics': return 'Métricas de Faturamento';
      case 'trends': return 'Tendências de Receita';
      case 'payments': return 'Análise de Pagamentos';
      case 'overdue': return 'Inadimplência';
      case 'alerts': return 'Alertas de Faturamento';
      case 'summary': return 'Resumo Financeiro';
      default: return 'Faturamento';
    }
  };

  const getDescription = () => {
    switch (variant) {
      case 'metrics': return 'Principais indicadores financeiros';
      case 'trends': return 'Evolução da receita ao longo do tempo';
      case 'payments': return 'Análise detalhada dos pagamentos';
      case 'overdue': return 'Monitoramento de faturas vencidas';
      case 'alerts': return 'Alertas baseados em métricas';
      case 'summary': return 'Visão geral do desempenho financeiro';
      default: return '';
    }
  };

  const renderContent = () => {
    switch (variant) {
      case 'metrics': return renderMetricsVariant();
      case 'trends': return renderTrendsVariant();
      case 'payments': return renderPaymentsVariant();
      case 'overdue': return renderOverdueVariant();
      case 'alerts': return renderAlertsVariant();
      case 'summary': return renderSummaryVariant();
      default: return null;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-medium">{getTitle()}</CardTitle>
          <CardDescription className="text-sm">{getDescription()}</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {alerts.length > 0 && variant !== 'alerts' && (
            <Badge variant="destructive" className="text-xs">
              {alerts.length}
            </Badge>
          )}
          {onRefresh && (
            <Button variant="ghost" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
          {onExport && (
            <Button variant="ghost" size="sm" onClick={onExport}>
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}