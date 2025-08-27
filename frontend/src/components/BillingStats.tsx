import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  CreditCard,
  FileText,
  Users,
  MoreHorizontal,
  Download,
  RefreshCw,
  Eye,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import type { BillingStats, OverdueReport } from '@/types/billing';
import { useBillingStats, useOverdueReport } from '@/hooks/useBilling';

interface BillingStatsProps {
  period?: 'today' | 'week' | 'month' | 'quarter' | 'year';
  onPeriodChange?: (period: 'today' | 'week' | 'month' | 'quarter' | 'year') => void;
  onExportReport?: () => void;
  onViewDetails?: (type: string) => void;
  className?: string;
}

function BillingStats({
  period = 'month',
  onPeriodChange,
  onExportReport,
  onViewDetails,
  className = ''
}: BillingStatsProps) {
  const { data: stats, isLoading: isLoadingStats, refetch: refetchStats } = useBillingStats(period);
  const { data: overdueReport, isLoading: isLoadingOverdue } = useOverdueReport();

  const isLoading = isLoadingStats || isLoadingOverdue;

  // Funções de utilidade
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getPeriodLabel = (period: string) => {
    const labels = {
      today: 'Hoje',
      week: 'Esta Semana',
      month: 'Este Mês',
      quarter: 'Este Trimestre',
      year: 'Este Ano'
    };
    return labels[period as keyof typeof labels] || period;
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-gray-400" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  const getCollectionRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCollectionRateVariant = (rate: number) => {
    if (rate >= 90) return 'default';
    if (rate >= 70) return 'secondary';
    return 'destructive';
  };

  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2 mt-2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Não foi possível carregar as estatísticas</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => refetchStats()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header com controles */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Estatísticas de Faturamento</h2>
          <p className="text-muted-foreground">
            Período: {getPeriodLabel(period)}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                {getPeriodLabel(period)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Período</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onPeriodChange?.('today')}>
                Hoje
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPeriodChange?.('week')}>
                Esta Semana
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPeriodChange?.('month')}>
                Este Mês
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPeriodChange?.('quarter')}>
                Este Trimestre
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPeriodChange?.('year')}>
                Este Ano
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" size="sm" onClick={() => refetchStats()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onExportReport}>
                <Download className="h-4 w-4 mr-2" />
                Exportar Relatório
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewDetails?.('revenue')}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Detalhes de Receita
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewDetails?.('collection')}>
                <PieChart className="h-4 w-4 mr-2" />
                Análise de Cobrança
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Cards de estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Receita Total */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {getTrendIcon(stats.revenueTrend)}
              <span className={getTrendColor(stats.revenueTrend)}>
                {formatPercentage(Math.abs(stats.revenueTrend))} vs período anterior
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Faturas Emitidas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturas Emitidas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInvoices.toLocaleString()}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {getTrendIcon(stats.invoicesTrend)}
              <span className={getTrendColor(stats.invoicesTrend)}>
                {formatPercentage(Math.abs(stats.invoicesTrend))} vs período anterior
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Pagamentos Recebidos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagamentos Recebidos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalPayments)}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {getTrendIcon(stats.paymentsTrend)}
              <span className={getTrendColor(stats.paymentsTrend)}>
                {formatPercentage(Math.abs(stats.paymentsTrend))} vs período anterior
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Valor Pendente */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Pendente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(stats.pendingAmount)}
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <span>{stats.pendingInvoices} faturas pendentes</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cards de métricas secundárias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Taxa de Cobrança */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Cobrança</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">
                {formatPercentage(stats.collectionRate)}
              </div>
              <Badge variant={getCollectionRateVariant(stats.collectionRate)}>
                {stats.collectionRate >= 90 ? 'Excelente' : 
                 stats.collectionRate >= 70 ? 'Bom' : 'Atenção'}
              </Badge>
            </div>
            <Progress value={stats.collectionRate} className="mt-2" />
          </CardContent>
        </Card>

        {/* Valor Médio por Fatura */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Médio</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.averageInvoiceValue)}</div>
            <p className="text-xs text-muted-foreground">
              Por fatura emitida
            </p>
          </CardContent>
        </Card>

        {/* Clientes Ativos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCustomers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Com faturas no período
            </p>
          </CardContent>
        </Card>

        {/* Faturas Vencidas */}
        <Card className="border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Faturas Vencidas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats.overdueAmount)}
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{stats.overdueInvoices} faturas</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-auto p-0 text-red-600 hover:text-red-700"
                onClick={() => onViewDetails?.('overdue')}
              >
                <Eye className="h-3 w-3 mr-1" />
                Ver detalhes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Relatório de Inadimplência */}
      {overdueReport && overdueReport.totalOverdueAmount > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              <span>Relatório de Inadimplência</span>
            </CardTitle>
            <CardDescription>
              Análise detalhada das faturas em atraso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(overdueReport.totalOverdueAmount)}
                </div>
                <p className="text-sm text-muted-foreground">Valor Total em Atraso</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {overdueReport.totalOverdueInvoices}
                </div>
                <p className="text-sm text-muted-foreground">Faturas em Atraso</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {Math.round(overdueReport.averageDaysOverdue)}
                </div>
                <p className="text-sm text-muted-foreground">Dias Médios de Atraso</p>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-3">
              <h4 className="font-medium">Distribuição por Período de Atraso:</h4>
              {overdueReport.overdueRanges.map((range, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{range.range}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">
                      {range.count} faturas
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({formatCurrency(range.amount)})
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onViewDetails?.('overdue')}
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver Relatório Completo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Distribuição por Método de Pagamento */}
      {stats.paymentMethods && stats.paymentMethods.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>Métodos de Pagamento</span>
            </CardTitle>
            <CardDescription>
              Distribuição dos pagamentos por método
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.paymentMethods.map((method, index) => {
                const percentage = (method.amount / stats.totalPayments) * 100;
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-primary" style={{
                        backgroundColor: `hsl(${index * 45}, 70%, 50%)`
                      }} />
                      <span className="text-sm font-medium">{method.method}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{formatPercentage(percentage)}</span>
                      <span className="text-sm text-muted-foreground">
                        ({formatCurrency(method.amount)})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default BillingStats;