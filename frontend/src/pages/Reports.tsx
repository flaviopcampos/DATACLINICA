'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart3,
  FileText,
  TrendingUp,
  DollarSign,
  Users,
  Activity,
  Download,
  Plus,
  Search,
  Filter,
  Calendar,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useReports } from '@/hooks/useReports';
import { useCharts } from '@/hooks/useCharts';
import { useExport } from '@/hooks/useExport';
import { SavedReport, ReportFilters } from '@/types/reports';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function Reports() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReportType, setSelectedReportType] = useState<string>('all');
  const [dateRange, setDateRange] = useState({
    startDate: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });

  const {
    savedReports,
    reportTypes,
    popularReports,
    financialReport,
    operationalReport,
    patientReport,
    isLoadingReports,
    isGeneratingFinancial,
    isGeneratingOperational,
    isGeneratingPatient,
    generateFinancialReport,
    generateOperationalReport,
    generatePatientReport,
    createReport,
    deleteReport,
    searchReports
  } = useReports({ autoRefresh: true });

  const {
    financialKPIs,
    cashFlowProjection,
    isLoadingKPIs,
    isLoadingCashFlow,
    createKPIChart,
    createCashFlowChart
  } = useCharts({ autoRefresh: true });

  const {
    exportToPDF,
    exportToExcel,
    exportProgress,
    isExporting
  } = useExport();

  // Filtrar relatórios baseado na busca e tipo
  const filteredReports = savedReports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedReportType === 'all' || report.report_type === selectedReportType;
    return matchesSearch && matchesType;
  });

  // Gerar relatórios automáticos ao carregar a página
  useEffect(() => {
    const filters: ReportFilters = {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    };
    
    generateFinancialReport(filters);
    generateOperationalReport(filters);
    generatePatientReport(filters);
  }, [dateRange, generateFinancialReport, generateOperationalReport, generatePatientReport]);

  // Estatísticas do dashboard
  const dashboardStats = {
    totalReports: savedReports.length,
    recentExecutions: savedReports.filter(r => r.updated_at && 
      new Date(r.updated_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
    scheduledReports: savedReports.filter(r => r.is_scheduled).length,
    publicReports: savedReports.filter(r => r.is_public).length
  };

  const handleExportReport = (report: SavedReport, format: 'pdf' | 'xlsx') => {
    if (format === 'pdf') {
      exportToPDF(report.id, report.name);
    } else {
      exportToExcel(report.id, report.name);
    }
  };

  const handleDeleteReport = (reportId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este relatório?')) {
      deleteReport(reportId);
    }
  };

  const getReportStatusIcon = (report: SavedReport) => {
    if (report.updated_at) {
      const lastUpdate = new Date(report.updated_at);
      const now = new Date();
      const hoursDiff = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff < 24) {
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      } else if (hoursDiff < 168) { // 7 days
        return <Clock className="h-4 w-4 text-yellow-500" />;
      }
    }
    return <AlertTriangle className="h-4 w-4 text-red-500" />;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios Avançados</h1>
          <p className="text-gray-600 mt-1">
            Gerencie e visualize relatórios financeiros, operacionais e de pacientes
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => window.location.href = '/reports/new'} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Relatório
          </Button>
        </div>
      </div>

      {/* Progress Bar para Exportação */}
      {isExporting && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span>{exportProgress.currentStep}</span>
                  <span>{exportProgress.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${exportProgress.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Relatórios</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.totalReports}</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardStats.publicReports} públicos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Execuções Recentes</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.recentExecutions}</div>
                <p className="text-xs text-muted-foreground">
                  Últimos 7 dias
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Relatórios Agendados</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.scheduledReports}</div>
                <p className="text-xs text-muted-foreground">
                  Execução automática
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">KPIs Financeiros</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{financialKPIs.length}</div>
                <p className="text-xs text-muted-foreground">
                  Métricas ativas
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Reports */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Relatório Financeiro */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Relatório Financeiro
                </CardTitle>
                <CardDescription>
                  Receitas, despesas e faturamento do período
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isGeneratingFinancial ? (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Gerando relatório...
                  </div>
                ) : financialReport ? (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Receita Total:</span>
                      <span className="font-medium text-green-600">
                        R$ {financialReport.total_revenue?.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Despesas:</span>
                      <span className="font-medium text-red-600">
                        R$ {financialReport.total_expenses?.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-sm font-medium">Lucro Líquido:</span>
                      <span className="font-bold text-blue-600">
                        R$ {financialReport.net_profit?.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Nenhum dado disponível</p>
                )}
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => exportToPDF(1, 'relatorio_financeiro')}
                    disabled={!financialReport}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => exportToExcel(1, 'relatorio_financeiro')}
                    disabled={!financialReport}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Excel
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Relatório Operacional */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Relatório Operacional
                </CardTitle>
                <CardDescription>
                  Ocupação de leitos, prescrições e estoque
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isGeneratingOperational ? (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Gerando relatório...
                  </div>
                ) : operationalReport ? (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Taxa de Ocupação:</span>
                      <span className="font-medium">
                        {operationalReport.bed_occupancy_rate}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Prescrições:</span>
                      <span className="font-medium">
                        {operationalReport.prescription_count}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Alertas de Estoque:</span>
                      <span className="font-medium text-orange-600">
                        {operationalReport.inventory_turnover}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Nenhum dado disponível</p>
                )}
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => exportToPDF(2, 'relatorio_operacional')}
                    disabled={!operationalReport}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => exportToExcel(2, 'relatorio_operacional')}
                    disabled={!operationalReport}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Excel
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Relatório de Pacientes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Relatório de Pacientes
                </CardTitle>
                <CardDescription>
                  Histórico e estatísticas de pacientes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isGeneratingPatient ? (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Gerando relatório...
                  </div>
                ) : patientReport ? (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total de Pacientes:</span>
                      <span className="font-medium">
                        {patientReport.total_patients}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Novos Pacientes:</span>
                      <span className="font-medium text-green-600">
                        {patientReport.new_patients}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Consultas:</span>
                      <span className="font-medium">
                        {patientReport.total_patients}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Nenhum dado disponível</p>
                )}
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => exportToPDF(3, 'relatorio_pacientes')}
                    disabled={!patientReport}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => exportToExcel(3, 'relatorio_pacientes')}
                    disabled={!patientReport}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Excel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Popular Reports */}
          {popularReports.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Relatórios Populares</CardTitle>
                <CardDescription>
                  Os relatórios mais executados recentemente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {popularReports.slice(0, 6).map((report) => (
                    <div key={report.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{report.name}</h4>
                          <p className="text-xs text-gray-600 mt-1">
                            {report.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {report.report_type}
                            </Badge>
                            {getReportStatusIcon(report)}
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar relatórios..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Tipo de relatório" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    {reportTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-40"
                  />
                  <Input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-40"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reports List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {isLoadingReports ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredReports.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum relatório encontrado
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery || selectedReportType !== 'all' 
                    ? 'Tente ajustar os filtros de busca'
                    : 'Crie seu primeiro relatório para começar'
                  }
                </p>
                <Button onClick={() => window.location.href = '/reports/new'}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Relatório
                </Button>
              </div>
            ) : (
              filteredReports.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{report.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {report.description}
                        </CardDescription>
                      </div>
                      {getReportStatusIcon(report)}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">{report.report_type}</Badge>
                      {report.is_public && (
                        <Badge variant="outline">Público</Badge>
                      )}
                      {report.is_scheduled && (
                        <Badge variant="outline">Agendado</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {report.updated_at && (
                        <p className="text-sm text-gray-600">
                          Última atualização: {format(new Date(report.updated_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleExportReport(report, 'pdf')}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDeleteReport(report.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Financeiros Detalhados</CardTitle>
              <CardDescription>
                Análise completa da situação financeira da clínica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Conteúdo dos relatórios financeiros será implementado aqui.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics e Insights</CardTitle>
              <CardDescription>
                Análises avançadas e insights baseados em dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Conteúdo de analytics será implementado aqui.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Reports;