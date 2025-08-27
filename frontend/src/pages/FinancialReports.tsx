'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChartComponent,
  FilterPanel,
  ExportButton,
  ReportCard
} from '../components/reports';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  LineChart,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import { useReports } from '@/hooks/useReports';
import { useCharts } from '@/hooks/useCharts';
import { exportToPDF, exportToExcel, exportToCSV, exportChartToPNG, ExportData, ExportOptions } from '@/utils/exportUtils';
import { ReportFilters, ChartConfig } from '../../types/unified-reports';
import { format as formatDate, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

function FinancialReports() {
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
    type: 'financial'
  });
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);

  const {
    generateFinancialReport,
    isGeneratingFinancial,
    savedReports
  } = useReports();

  const {
    dashboardData,
    financialKPIs: chartFinancialKPIs,
    cashFlowProjection,
    isLoadingDashboard
  } = useCharts();

  // Dados do relatório financeiro (usando savedReports como base)
  const financialReportData = savedReports?.filter(report => report.report_type === 'financial') || [];

  const [isExporting, setIsExporting] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    handleGenerateReport();
  }, [filters]);

  const handleGenerateReport = async () => {
    try {
      await generateFinancialReport({
        startDate: filters.startDate,
        endDate: filters.endDate,
        includeProjections: true,
        includeComparisons: true
      });
    } catch (error) {
      toast.error('Erro ao gerar relatório financeiro');
    }
  };

  const handleExport = async (format: 'pdf' | 'excel' | 'csv' | 'png') => {
    try {
      setIsExporting(true);
      
      const exportData: ExportData = {
          title: 'Relatório Financeiro',
          subtitle: `Período: ${formatDate(filters.startDate, 'dd/MM/yyyy', { locale: ptBR })} - ${formatDate(filters.endDate, 'dd/MM/yyyy', { locale: ptBR })}`,
          data: financialReportData || [{ periodo: 'Sem dados', receita: 0, despesa: 0, lucro: 0 }],
        metadata: {
          generatedAt: new Date(),
          period: `${formatDate(filters.startDate, 'dd/MM/yyyy', { locale: ptBR })} - ${formatDate(filters.endDate, 'dd/MM/yyyy', { locale: ptBR })}`
        },
        filters
      };
      
      const exportOptions: ExportOptions = {
        format,
        includeFilters: true,
        includeSummary: true,
        includeCharts: format === 'pdf'
      };
      
      switch (format) {
        case 'pdf':
          await exportToPDF(exportData, exportOptions);
          break;
        case 'excel':
          await exportToExcel(exportData, exportOptions);
          break;
        case 'csv':
          await exportToCSV(exportData, exportOptions);
          break;
        case 'png':
          const chartElement = document.querySelector('.financial-chart');
          if (chartElement) {
            await exportChartToPNG(chartElement as HTMLElement, exportOptions);
          }
          break;
      }
      toast.success(`Relatório exportado em ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Erro ao exportar relatório');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFiltersChange = (newFilters: ReportFilters) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    handleGenerateReport();
    toast.success('Filtros aplicados com sucesso');
  };

  const handleClearFilters = () => {
    setFilters({
      startDate: startOfMonth(new Date()),
      endDate: endOfMonth(new Date()),
      type: 'financial'
    });
  };

  // Configurações dos gráficos
  const revenueChartConfig: ChartConfig = {
    type: 'bar',
    xAxisKey: 'month',
    yAxisKey: 'revenue',
    showLegend: true,
    formatters: {
      revenue: { type: 'currency' }
    },
    series: [
      { key: 'revenue', name: 'Receita', color: '#10B981' },
      { key: 'target', name: 'Meta', color: '#6B7280' }
    ]
  };

  const expenseChartConfig: ChartConfig = {
    type: 'area',
    xAxisKey: 'category',
    yAxisKey: 'amount',
    showLegend: true,
    formatters: {
      amount: { type: 'currency' }
    },
    series: [
      { key: 'amount', name: 'Valor', color: '#EF4444' }
    ]
  };

  const cashFlowChartConfig: ChartConfig = {
    type: 'line',
    xAxisKey: 'date',
    yAxisKey: 'balance',
    showLegend: true,
    formatters: {
      balance: { type: 'currency' },
      inflow: { type: 'currency' },
      outflow: { type: 'currency' }
    },
    series: [
      { key: 'balance', name: 'Saldo', color: '#3B82F6' },
      { key: 'inflow', name: 'Entradas', color: '#10B981' },
      { key: 'outflow', name: 'Saídas', color: '#EF4444' }
    ]
  };

  const profitabilityChartConfig: ChartConfig = {
    type: 'pie',
    yAxisKey: 'value',
    showLegend: true,
    formatters: {
      value: { type: 'currency' }
    }
  };

  // Dados mockados para demonstração
  const mockRevenueData = [
    { month: 'Jan', revenue: 150000, target: 140000 },
    { month: 'Fev', revenue: 165000, target: 150000 },
    { month: 'Mar', revenue: 180000, target: 160000 },
    { month: 'Abr', revenue: 175000, target: 170000 },
    { month: 'Mai', revenue: 190000, target: 180000 },
    { month: 'Jun', revenue: 205000, target: 190000 }
  ];

  const mockExpenseData = [
    { category: 'Pessoal', amount: 85000 },
    { category: 'Medicamentos', amount: 45000 },
    { category: 'Equipamentos', amount: 25000 },
    { category: 'Infraestrutura', amount: 20000 },
    { category: 'Outros', amount: 15000 }
  ];

  const mockCashFlowData = [
    { date: '01/06', balance: 250000, inflow: 45000, outflow: 35000 },
    { date: '08/06', balance: 260000, inflow: 50000, outflow: 40000 },
    { date: '15/06', balance: 275000, inflow: 55000, outflow: 40000 },
    { date: '22/06', balance: 285000, inflow: 48000, outflow: 38000 },
    { date: '29/06', balance: 295000, inflow: 52000, outflow: 42000 }
  ];

  const mockProfitabilityData = [
    { name: 'Consultas', value: 120000 },
    { name: 'Cirurgias', value: 85000 },
    { name: 'Exames', value: 65000 },
    { name: 'Internações', value: 95000 },
    { name: 'Outros', value: 35000 }
  ];

  // KPIs financeiros
  const mockFinancialKPIs = [
    {
      title: 'Receita Total',
      value: 'R$ 1.165.000',
      change: '+12.5%',
      trend: 'up' as const,
      icon: <DollarSign className="h-5 w-5" />,
      color: 'text-green-600'
    },
    {
      title: 'Despesas Totais',
      value: 'R$ 865.000',
      change: '+8.2%',
      trend: 'up' as const,
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'text-red-600'
    },
    {
      title: 'Lucro Líquido',
      value: 'R$ 300.000',
      change: '+25.8%',
      trend: 'up' as const,
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'text-green-600'
    },
    {
      title: 'Margem de Lucro',
      value: '25.8%',
      change: '+2.1pp',
      trend: 'up' as const,
      icon: <BarChart3 className="h-5 w-5" />,
      color: 'text-blue-600'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/reports">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Relatórios Financeiros</h1>
            <p className="text-gray-600 mt-1">
              Análise detalhada de receitas, despesas e fluxo de caixa
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleGenerateReport} disabled={isGeneratingFinancial}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isGeneratingFinancial ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <ExportButton
            onExport={handleExport}
            loading={isExporting}
            availableFormats={['pdf', 'excel', 'csv']}
            defaultFormat="pdf"
          />
        </div>
      </div>

      {/* Filtros */}
      <FilterPanel
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        loading={isGeneratingFinancial}
        collapsed={filtersCollapsed}
        onToggleCollapse={() => setFiltersCollapsed(!filtersCollapsed)}
        availableTypes={[{ value: 'financial', label: 'Financeiro' }]}
        availableCategories={[
          { value: 'revenue', label: 'Receitas' },
          { value: 'expenses', label: 'Despesas' },
          { value: 'billing', label: 'Faturamento' },
          { value: 'cash-flow', label: 'Fluxo de Caixa' }
        ]}
      />

      {/* KPIs Financeiros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockFinancialKPIs.map((kpi, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</p>
                </div>
                <div className={`p-2 rounded-lg bg-gray-50`}>
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <Badge 
                  variant={kpi.trend === 'up' ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +5.2%
                </Badge>
                <span className="text-xs text-gray-500 ml-2">vs. período anterior</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Abas de Relatórios */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="revenue">Receitas</TabsTrigger>
          <TabsTrigger value="expenses">Despesas</TabsTrigger>
          <TabsTrigger value="cash-flow">Fluxo de Caixa</TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartComponent
              title="Receitas vs Meta"
              description="Comparação entre receitas realizadas e metas estabelecidas"
              data={mockRevenueData}
              config={revenueChartConfig}
              loading={isLoadingDashboard}
              onRefresh={() => handleGenerateReport()}
              onExport={(format) => handleExport(format as 'pdf' | 'excel' | 'csv' | 'png')}
              height={350}
            />
            <ChartComponent
              title="Distribuição de Receitas"
              description="Receitas por tipo de serviço"
              data={mockProfitabilityData}
              config={profitabilityChartConfig}
              loading={isLoadingDashboard}
              onRefresh={() => handleGenerateReport()}
              onExport={(format) => handleExport(format as 'pdf' | 'excel' | 'csv' | 'png')}
              height={350}
            />
          </div>
          
          <ChartComponent
            title="Fluxo de Caixa"
            description="Evolução do saldo, entradas e saídas ao longo do tempo"
            data={mockCashFlowData}
            config={cashFlowChartConfig}
            loading={isLoadingDashboard}
            onRefresh={() => handleGenerateReport()}
            onExport={(format) => handleExport(format as 'pdf' | 'excel' | 'csv' | 'png')}
            height={400}
          />
        </TabsContent>

        {/* Receitas */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ChartComponent
                title="Evolução das Receitas"
                description="Receitas mensais comparadas com as metas"
                data={mockRevenueData}
                config={revenueChartConfig}
                loading={isLoadingDashboard}
                onRefresh={() => handleGenerateReport()}
                onExport={(format) => handleExport(format as 'pdf' | 'excel' | 'csv' | 'png')}
                height={400}
              />
            </div>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resumo de Receitas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Receita do Mês</span>
                    <span className="font-semibold">R$ 205.000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Meta do Mês</span>
                    <span className="font-semibold">R$ 190.000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Variação</span>
                    <Badge variant="default" className="text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +7.9%
                    </Badge>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Acumulado no Ano</span>
                      <span className="font-semibold">R$ 1.165.000</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Serviços</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockProfitabilityData.slice(0, 3).map((service, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{service.name}</span>
                      <span className="font-semibold">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(service.value)}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Despesas */}
        <TabsContent value="expenses" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartComponent
              title="Despesas por Categoria"
              description="Distribuição das despesas por categoria"
              data={mockExpenseData}
              config={expenseChartConfig}
              loading={isLoadingDashboard}
              onRefresh={() => handleGenerateReport()}
              onExport={(format) => handleExport(format as 'pdf' | 'excel' | 'csv' | 'png')}
              height={400}
            />
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Análise de Despesas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockExpenseData.map((expense, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{expense.category}</span>
                        <span className="text-sm font-semibold">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(expense.amount)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full" 
                          style={{ 
                            width: `${(expense.amount / Math.max(...mockExpenseData.map(e => e.amount))) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Fluxo de Caixa */}
        <TabsContent value="cash-flow" className="space-y-6">
          <ChartComponent
            title="Fluxo de Caixa Detalhado"
            description="Análise detalhada do fluxo de caixa com projeções"
            data={mockCashFlowData}
            config={cashFlowChartConfig}
            loading={isLoadingDashboard}
            onRefresh={() => handleGenerateReport()}
            onExport={(format) => handleExport(format as 'pdf' | 'excel' | 'csv' | 'png')}
            height={450}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Saldo Atual</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">R$ 295.000</p>
                  </div>
                  <div className="p-2 rounded-lg bg-green-50">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Entradas do Mês</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">R$ 250.000</p>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-50">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Saídas do Mês</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">R$ 195.000</p>
                  </div>
                  <div className="p-2 rounded-lg bg-red-50">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default FinancialReports;