'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '../components/ui/progress';
import {
  ChartComponent,
  FilterPanel,
  ExportButton,
  ReportCard
} from '../components/reports';
import {
  Bed,
  Users,
  Package,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  RefreshCw,
  Calendar,
  FileText,
  Stethoscope,
  Pill,
  Heart,
  UserCheck
} from 'lucide-react';
import { useReports } from '@/hooks/useReports';
import { useCharts } from '@/hooks/useCharts';
import { exportToPDF, exportToExcel, exportToCSV, exportChartToPNG, ExportData, ExportOptions } from '@/utils/exportUtils';
import { ReportFilters, ChartConfig } from '../../types/unified-reports';
import { format as formatDate, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

function OperationalReports() {
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
    type: 'operational'
  });
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);

  const {
    generateOperationalReport,
    isGeneratingOperational,
    operationalReport
  } = useReports();

  const {
    dashboardData,
    isLoadingDashboard
  } = useCharts();

  const [isExporting, setIsExporting] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    handleGenerateReport();
  }, [filters]);

  const handleGenerateReport = async () => {
    try {
      await generateOperationalReport({
        startDate: filters.startDate,
        endDate: filters.endDate,
        includeOccupancy: true,
        includePrescriptions: true,
        includeInventory: true
      });
    } catch (error) {
      toast.error('Erro ao gerar relatório operacional');
    }
  };

  const handleExport = async (format: 'pdf' | 'excel' | 'csv' | 'png') => {
    try {
      setIsExporting(true);
      
      const exportData: ExportData = {
        title: 'Relatório Operacional',
        subtitle: `Período: ${formatDate(filters.startDate, 'dd/MM/yyyy', { locale: ptBR })} - ${formatDate(filters.endDate, 'dd/MM/yyyy', { locale: ptBR })}`,
        data: (operationalReport as unknown as any[]) || [{ periodo: 'Sem dados', ocupacao: 0, prescricoes: 0, satisfacao: 0 }],
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
          const chartElement = document.querySelector('.operational-chart');
          if (chartElement) {
            await exportChartToPNG(chartElement as HTMLElement, exportOptions);
          }
          break;
        default:
          toast.error('Formato não suportado');
          return;
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
      type: 'operational'
    });
  };

  // Configurações dos gráficos
  const occupancyChartConfig: ChartConfig = {
    type: 'line',
    xAxisKey: 'date',
    yAxisKey: 'occupancy',
    showLegend: true,
    formatters: {
      occupancy: { type: 'percentage' },
      capacity: { type: 'number' }
    },
    series: [
      { key: 'occupancy', name: 'Taxa de Ocupação', color: '#3B82F6' },
      { key: 'capacity', name: 'Capacidade', color: '#6B7280' }
    ]
  };

  const prescriptionsChartConfig: ChartConfig = {
    type: 'bar',
    xAxisKey: 'specialty',
    yAxisKey: 'count',
    showLegend: true,
    formatters: {
      count: { type: 'number' }
    },
    series: [
      { key: 'count', name: 'Prescrições', color: '#10B981' }
    ]
  };

  const inventoryChartConfig: ChartConfig = {
    type: 'area',
    xAxisKey: 'category',
    yAxisKey: 'stock',
    showLegend: true,
    formatters: {
      stock: { type: 'number' },
      minimum: { type: 'number' }
    },
    series: [
      { key: 'stock', name: 'Estoque Atual', color: '#8B5CF6' },
      { key: 'minimum', name: 'Estoque Mínimo', color: '#EF4444' }
    ]
  };

  const patientsFlowChartConfig: ChartConfig = {
    type: 'line',
    xAxisKey: 'hour',
    yAxisKey: 'patients',
    showLegend: true,
    formatters: {
      patients: { type: 'number' }
    },
    series: [
      { key: 'admissions', name: 'Admissões', color: '#10B981' },
      { key: 'discharges', name: 'Altas', color: '#F59E0B' },
      { key: 'transfers', name: 'Transferências', color: '#3B82F6' }
    ]
  };

  // Dados mockados para demonstração
  const mockOccupancyData = [
    { date: '01/06', occupancy: 85, capacity: 100 },
    { date: '02/06', occupancy: 88, capacity: 100 },
    { date: '03/06', occupancy: 92, capacity: 100 },
    { date: '04/06', occupancy: 87, capacity: 100 },
    { date: '05/06', occupancy: 90, capacity: 100 },
    { date: '06/06', occupancy: 94, capacity: 100 },
    { date: '07/06', occupancy: 89, capacity: 100 }
  ];

  const mockPrescriptionsData = [
    { specialty: 'Cardiologia', count: 145 },
    { specialty: 'Neurologia', count: 98 },
    { specialty: 'Ortopedia', count: 87 },
    { specialty: 'Pediatria', count: 76 },
    { specialty: 'Ginecologia', count: 65 },
    { specialty: 'Outros', count: 124 }
  ];

  const mockInventoryData = [
    { category: 'Medicamentos', stock: 850, minimum: 200 },
    { category: 'Materiais Cirúrgicos', stock: 320, minimum: 100 },
    { category: 'Equipamentos', stock: 45, minimum: 15 },
    { category: 'Descartáveis', stock: 1200, minimum: 300 },
    { category: 'Reagentes', stock: 180, minimum: 50 }
  ];

  const mockPatientsFlowData = [
    { hour: '08:00', admissions: 12, discharges: 8, transfers: 3 },
    { hour: '10:00', admissions: 18, discharges: 15, transfers: 5 },
    { hour: '12:00', admissions: 25, discharges: 20, transfers: 8 },
    { hour: '14:00', admissions: 22, discharges: 18, transfers: 6 },
    { hour: '16:00', admissions: 20, discharges: 25, transfers: 4 },
    { hour: '18:00', admissions: 15, discharges: 22, transfers: 7 }
  ];

  // KPIs operacionais
  const operationalKPIs = [
    {
      title: 'Taxa de Ocupação',
      value: '89%',
      change: '+3.2%',
      trend: 'up' as const,
      icon: <Bed className="h-5 w-5" />,
      color: 'text-blue-600',
      target: 85
    },
    {
      title: 'Tempo Médio de Internação',
      value: '4.2 dias',
      change: '-0.5 dias',
      trend: 'down' as const,
      icon: <Clock className="h-5 w-5" />,
      color: 'text-green-600',
      target: 4.5
    },
    {
      title: 'Prescrições/Dia',
      value: '595',
      change: '+12.8%',
      trend: 'up' as const,
      icon: <Pill className="h-5 w-5" />,
      color: 'text-purple-600',
      target: 550
    },
    {
      title: 'Satisfação do Paciente',
      value: '4.7/5',
      change: '+0.2',
      trend: 'up' as const,
      icon: <Heart className="h-5 w-5" />,
      color: 'text-red-600',
      target: 4.5
    }
  ];

  // Alertas operacionais
  const operationalAlerts = [
    {
      type: 'warning',
      title: 'Estoque Baixo',
      message: 'Medicamentos cardiovasculares abaixo do estoque mínimo',
      time: '2 horas atrás'
    },
    {
      type: 'info',
      title: 'Alta Ocupação',
      message: 'UTI com 95% de ocupação - considerar transferências',
      time: '4 horas atrás'
    },
    {
      type: 'success',
      title: 'Meta Atingida',
      message: 'Tempo médio de atendimento dentro da meta estabelecida',
      time: '6 horas atrás'
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
            <h1 className="text-3xl font-bold text-gray-900">Relatórios Operacionais</h1>
            <p className="text-gray-600 mt-1">
              Análise de ocupação, prescrições, estoque e fluxo de pacientes
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleGenerateReport} disabled={isGeneratingOperational}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isGeneratingOperational ? 'animate-spin' : ''}`} />
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
        loading={isGeneratingOperational}
        collapsed={filtersCollapsed}
        onToggleCollapse={() => setFiltersCollapsed(!filtersCollapsed)}
        availableTypes={[{ value: 'operational', label: 'Operacional' }]}
        availableCategories={[
          { value: 'occupancy', label: 'Ocupação' },
          { value: 'prescriptions', label: 'Prescrições' },
          { value: 'inventory', label: 'Estoque' },
          { value: 'patient-flow', label: 'Fluxo de Pacientes' }
        ]}
      />

      {/* KPIs Operacionais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {operationalKPIs.map((kpi, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</p>
                </div>
                <div className={`p-2 rounded-lg bg-gray-50 ${kpi.color}`}>
                  {kpi.icon}
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <Badge 
                  variant={kpi.trend === 'up' ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {kpi.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {kpi.change}
                </Badge>
                {kpi.target && (
                  <span className="text-xs text-gray-500">Meta: {kpi.target}</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alertas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Alertas Operacionais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {operationalAlerts.map((alert, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                <div className={`p-1 rounded-full ${
                  alert.type === 'warning' ? 'bg-orange-100' :
                  alert.type === 'info' ? 'bg-blue-100' : 'bg-green-100'
                }`}>
                  {alert.type === 'warning' && <AlertTriangle className="h-4 w-4 text-orange-600" />}
                  {alert.type === 'info' && <Activity className="h-4 w-4 text-blue-600" />}
                  {alert.type === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{alert.title}</p>
                  <p className="text-sm text-gray-600">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Abas de Relatórios */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="occupancy">Ocupação</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescrições</TabsTrigger>
          <TabsTrigger value="inventory">Estoque</TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartComponent
              title="Taxa de Ocupação"
              description="Evolução da taxa de ocupação dos leitos"
              data={mockOccupancyData}
              config={occupancyChartConfig}
              loading={isLoadingDashboard}
              onRefresh={() => handleGenerateReport()}
              onExport={(format) => handleExport(format as 'pdf' | 'excel' | 'csv' | 'png')}
              height={350}
            />
            <ChartComponent
              title="Prescrições por Especialidade"
              description="Distribuição de prescrições por área médica"
              data={mockPrescriptionsData}
              config={prescriptionsChartConfig}
              loading={isLoadingDashboard}
              onRefresh={() => handleGenerateReport()}
              onExport={(format) => handleExport(format as 'pdf' | 'excel' | 'csv' | 'png')}
              height={350}
            />
          </div>
          
          <ChartComponent
            title="Fluxo de Pacientes"
            description="Movimentação de pacientes ao longo do dia"
            data={mockPatientsFlowData}
            config={patientsFlowChartConfig}
            loading={isLoadingDashboard}
            onRefresh={() => handleGenerateReport()}
            onExport={(format) => handleExport(format as 'pdf' | 'excel' | 'csv' | 'png')}
            height={400}
          />
        </TabsContent>

        {/* Ocupação */}
        <TabsContent value="occupancy" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ChartComponent
                title="Taxa de Ocupação Detalhada"
                description="Análise detalhada da ocupação de leitos por período"
                data={mockOccupancyData}
                config={occupancyChartConfig}
                loading={isLoadingDashboard}
                onRefresh={() => handleGenerateReport()}
                onExport={(format) => handleExport(format as 'pdf' | 'excel' | 'csv' | 'png')}
                height={400}
              />
            </div>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ocupação por Setor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { sector: 'UTI', occupied: 18, total: 20, percentage: 90 },
                    { sector: 'Enfermaria', occupied: 45, total: 60, percentage: 75 },
                    { sector: 'Pediatria', occupied: 12, total: 15, percentage: 80 },
                    { sector: 'Maternidade', occupied: 8, total: 12, percentage: 67 }
                  ].map((sector, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{sector.sector}</span>
                        <span className="text-sm font-semibold">
                          {sector.occupied}/{sector.total}
                        </span>
                      </div>
                      <Progress value={sector.percentage} className="h-2" />
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">{sector.percentage}% ocupado</span>
                        <Badge 
                          variant={sector.percentage > 85 ? 'destructive' : sector.percentage > 70 ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {sector.percentage > 85 ? 'Alto' : sector.percentage > 70 ? 'Médio' : 'Baixo'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Prescrições */}
        <TabsContent value="prescriptions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartComponent
              title="Prescrições por Especialidade"
              description="Volume de prescrições por área médica"
              data={mockPrescriptionsData}
              config={prescriptionsChartConfig}
              loading={isLoadingDashboard}
              onRefresh={() => handleGenerateReport()}
              onExport={(format) => handleExport(format as 'pdf' | 'excel' | 'csv' | 'png')}
              height={400}
            />
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Análise de Prescrições</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Stethoscope className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-blue-600">595</p>
                      <p className="text-sm text-gray-600">Total Hoje</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <UserCheck className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-600">98%</p>
                      <p className="text-sm text-gray-600">Taxa de Adesão</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">Medicamentos Mais Prescritos</h4>
                    <div className="space-y-2">
                      {[
                        { name: 'Dipirona', count: 45 },
                        { name: 'Paracetamol', count: 38 },
                        { name: 'Omeprazol', count: 32 },
                        { name: 'Losartana', count: 28 }
                      ].map((med, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm">{med.name}</span>
                          <Badge variant="outline" className="text-xs">{med.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Estoque */}
        <TabsContent value="inventory" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartComponent
              title="Níveis de Estoque"
              description="Estoque atual vs. estoque mínimo por categoria"
              data={mockInventoryData}
              config={inventoryChartConfig}
              loading={isLoadingDashboard}
              onRefresh={() => handleGenerateReport()}
              onExport={(format) => handleExport(format as 'pdf' | 'excel' | 'csv' | 'png')}
              height={400}
            />
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Status do Estoque</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockInventoryData.map((item, index) => {
                    const percentage = (item.stock / (item.minimum * 3)) * 100;
                    const status = item.stock <= item.minimum ? 'critical' : 
                                 item.stock <= item.minimum * 1.5 ? 'warning' : 'good';
                    
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{item.category}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{item.stock}</span>
                            <Badge 
                              variant={status === 'critical' ? 'destructive' : 
                                     status === 'warning' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {status === 'critical' ? 'Crítico' : 
                               status === 'warning' ? 'Baixo' : 'OK'}
                            </Badge>
                          </div>
                        </div>
                        <Progress 
                          value={Math.min(percentage, 100)} 
                          className={`h-2 ${
                            status === 'critical' ? '[&>div]:bg-red-500' :
                            status === 'warning' ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'
                          }`}
                        />
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">Mín: {item.minimum}</span>
                          <span className="text-xs text-gray-500">
                            {Math.round((item.stock / item.minimum) * 100)}% do mínimo
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default OperationalReports;