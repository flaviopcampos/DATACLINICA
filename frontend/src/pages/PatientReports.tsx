'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ChartComponent,
  FilterPanel,
  ExportButton,
  ReportCard
} from '../components/reports';
import {
  Users,
  User,
  Calendar,
  Activity,
  Heart,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  RefreshCw,
  Search,
  Filter,
  FileText,
  Clock,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  UserPlus,
  UserMinus
} from 'lucide-react';
import { useReports } from '@/hooks/useReports';
import { useCharts } from '@/hooks/useCharts';
import { exportToPDF, exportToExcel, exportToCSV, exportChartToPNG, ExportData, ExportOptions } from '@/utils/exportUtils';
import { ReportFilters, ChartConfig } from '../../types/unified-reports';
import { format as formatDate, subDays, startOfMonth, endOfMonth, differenceInYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F';
  phone: string;
  email: string;
  address: string;
  lastVisit: Date;
  totalVisits: number;
  status: 'active' | 'inactive' | 'critical';
  conditions: string[];
  avatar?: string;
}

function PatientReports() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
    type: 'patient'
  });
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);

  const {
    generatePatientReport,
    isGeneratingPatient,
    savedReports
  } = useReports();

  // Dados do relatório de pacientes (usando savedReports como base)
  const patientReportData = savedReports?.filter(report => report.report_type === 'clinical') || [];

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
      await generatePatientReport({
        startDate: filters.startDate,
        endDate: filters.endDate,
        includeStatistics: true,
        includeHistory: true
      });
    } catch (error) {
      toast.error('Erro ao gerar relatório de pacientes');
    }
  };

  const handleExport = async (format: 'pdf' | 'excel' | 'csv' | 'png') => {
    try {
      setIsExporting(true);
      
      const exportData: ExportData = {
          title: 'Relatório de Pacientes',
          subtitle: `Período: ${formatDate(filters.startDate, 'dd/MM/yyyy', { locale: ptBR })} - ${formatDate(filters.endDate, 'dd/MM/yyyy', { locale: ptBR })}`,
          data: patientReportData || [{ paciente: 'Sem dados', consultas: 0, procedimentos: 0 }],
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
          const chartElement = document.querySelector('.patient-chart');
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
      type: 'patient'
    });
  };

  // Configurações dos gráficos
  const ageDistributionChartConfig: ChartConfig = {
    type: 'bar',
    xAxisKey: 'ageGroup',
    yAxisKey: 'count',
    showLegend: true,
    formatters: {
      count: { type: 'number' }
    },
    series: [
      { key: 'count', name: 'Pacientes', color: '#3B82F6' }
    ]
  };

  const genderDistributionChartConfig: ChartConfig = {
    type: 'pie',
    yAxisKey: 'value',
    showLegend: true,
    formatters: {
      value: { type: 'number' }
    }
  };

  const visitsChartConfig: ChartConfig = {
    type: 'line',
    xAxisKey: 'month',
    yAxisKey: 'visits',
    showLegend: true,
    formatters: {
      visits: { type: 'number' }
    },
    series: [
      { key: 'visits', name: 'Consultas', color: '#10B981' },
      { key: 'newPatients', name: 'Novos Pacientes', color: '#F59E0B' }
    ]
  };

  const conditionsChartConfig: ChartConfig = {
    type: 'area',
    xAxisKey: 'condition',
    yAxisKey: 'count',
    showLegend: true,
    formatters: {
      count: { type: 'number' }
    },
    series: [
      { key: 'count', name: 'Casos', color: '#8B5CF6' }
    ]
  };

  // Dados mockados para demonstração
  const mockAgeDistributionData = [
    { ageGroup: '0-18', count: 145 },
    { ageGroup: '19-30', count: 298 },
    { ageGroup: '31-45', count: 387 },
    { ageGroup: '46-60', count: 456 },
    { ageGroup: '61-75', count: 324 },
    { ageGroup: '76+', count: 189 }
  ];

  const mockGenderDistributionData = [
    { name: 'Feminino', value: 1124 },
    { name: 'Masculino', value: 875 }
  ];

  const mockVisitsData = [
    { month: 'Jan', visits: 1245, newPatients: 89 },
    { month: 'Fev', visits: 1356, newPatients: 95 },
    { month: 'Mar', visits: 1489, newPatients: 112 },
    { month: 'Abr', visits: 1398, newPatients: 87 },
    { month: 'Mai', visits: 1567, newPatients: 124 },
    { month: 'Jun', visits: 1634, newPatients: 98 }
  ];

  const mockConditionsData = [
    { condition: 'Hipertensão', count: 234 },
    { condition: 'Diabetes', count: 189 },
    { condition: 'Obesidade', count: 156 },
    { condition: 'Ansiedade', count: 143 },
    { condition: 'Depressão', count: 98 },
    { condition: 'Outros', count: 287 }
  ];

  const mockPatients: Patient[] = [
    {
      id: '1',
      name: 'Maria Silva Santos',
      age: 45,
      gender: 'F',
      phone: '(11) 99999-9999',
      email: 'maria.silva@email.com',
      address: 'Rua das Flores, 123 - São Paulo/SP',
      lastVisit: subDays(new Date(), 5),
      totalVisits: 12,
      status: 'active',
      conditions: ['Hipertensão', 'Diabetes']
    },
    {
      id: '2',
      name: 'João Carlos Oliveira',
      age: 62,
      gender: 'M',
      phone: '(11) 88888-8888',
      email: 'joao.carlos@email.com',
      address: 'Av. Paulista, 456 - São Paulo/SP',
      lastVisit: subDays(new Date(), 2),
      totalVisits: 8,
      status: 'critical',
      conditions: ['Cardiopatia', 'Hipertensão']
    },
    {
      id: '3',
      name: 'Ana Paula Costa',
      age: 28,
      gender: 'F',
      phone: '(11) 77777-7777',
      email: 'ana.paula@email.com',
      address: 'Rua da Consolação, 789 - São Paulo/SP',
      lastVisit: subDays(new Date(), 15),
      totalVisits: 3,
      status: 'active',
      conditions: ['Ansiedade']
    }
  ];

  // KPIs de pacientes
  const patientKPIs = [
    {
      title: 'Total de Pacientes',
      value: '1.999',
      change: '+124',
      trend: 'up' as const,
      icon: <Users className="h-5 w-5" />,
      color: 'text-blue-600'
    },
    {
      title: 'Novos Pacientes',
      value: '98',
      change: '+12.5%',
      trend: 'up' as const,
      icon: <UserPlus className="h-5 w-5" />,
      color: 'text-green-600'
    },
    {
      title: 'Pacientes Ativos',
      value: '1.756',
      change: '+8.2%',
      trend: 'up' as const,
      icon: <Activity className="h-5 w-5" />,
      color: 'text-purple-600'
    },
    {
      title: 'Taxa de Retorno',
      value: '87.9%',
      change: '+2.1%',
      trend: 'up' as const,
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'text-orange-600'
    }
  ];

  // Filtrar pacientes baseado na busca
  const filteredPatients = mockPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  const getStatusColor = (status: Patient['status']) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'inactive': return 'text-gray-600 bg-gray-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusLabel = (status: Patient['status']) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'critical': return 'Crítico';
      default: return 'Desconhecido';
    }
  };

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
            <h1 className="text-3xl font-bold text-gray-900">Relatórios de Pacientes</h1>
            <p className="text-gray-600 mt-1">
              Análise de histórico, estatísticas e dados demográficos dos pacientes
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleGenerateReport} disabled={isGeneratingPatient}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isGeneratingPatient ? 'animate-spin' : ''}`} />
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
        loading={isGeneratingPatient}
        collapsed={filtersCollapsed}
        onToggleCollapse={() => setFiltersCollapsed(!filtersCollapsed)}
        availableTypes={[{ value: 'patient', label: 'Pacientes' }]}
        availableCategories={[
          { value: 'demographics', label: 'Demografia' },
          { value: 'history', label: 'Histórico' },
          { value: 'conditions', label: 'Condições' },
          { value: 'visits', label: 'Consultas' }
        ]}
      />

      {/* KPIs de Pacientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {patientKPIs.map((kpi, index) => (
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
              <div className="flex items-center mt-4">
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
          <TabsTrigger value="demographics">Demografia</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="patients">Lista de Pacientes</TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartComponent
              title="Distribuição por Idade"
              description="Número de pacientes por faixa etária"
              data={mockAgeDistributionData}
              config={ageDistributionChartConfig}
              loading={isLoadingDashboard}
              onRefresh={() => handleGenerateReport()}
              onExport={(format) => handleExport(format as 'pdf' | 'excel' | 'csv' | 'png')}
              height={350}
            />
            <ChartComponent
              title="Distribuição por Gênero"
              description="Proporção de pacientes por gênero"
              data={mockGenderDistributionData}
              config={genderDistributionChartConfig}
              loading={isLoadingDashboard}
              onRefresh={() => handleGenerateReport()}
              onExport={(format) => handleExport(format as 'pdf' | 'excel' | 'csv' | 'png')}
              height={350}
            />
          </div>
          
          <ChartComponent
            title="Evolução de Consultas"
            description="Número de consultas e novos pacientes por mês"
            data={mockVisitsData}
            config={visitsChartConfig}
            loading={isLoadingDashboard}
            onRefresh={() => handleGenerateReport()}
            onExport={(format) => handleExport(format as 'pdf' | 'excel' | 'csv' | 'png')}
            height={400}
          />
        </TabsContent>

        {/* Demografia */}
        <TabsContent value="demographics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartComponent
              title="Distribuição Etária Detalhada"
              description="Análise detalhada da distribuição de pacientes por idade"
              data={mockAgeDistributionData}
              config={ageDistributionChartConfig}
              loading={isLoadingDashboard}
              onRefresh={() => handleGenerateReport()}
              onExport={(format) => handleExport(format as 'pdf' | 'excel' | 'csv' | 'png')}
              height={400}
            />
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Estatísticas Demográficas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-blue-600">1.999</p>
                      <p className="text-sm text-gray-600">Total de Pacientes</p>
                    </div>
                    <div className="text-center p-4 bg-pink-50 rounded-lg">
                      <User className="h-8 w-8 text-pink-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-pink-600">56%</p>
                      <p className="text-sm text-gray-600">Pacientes Femininas</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">Faixas Etárias Principais</h4>
                    <div className="space-y-2">
                      {mockAgeDistributionData.slice(0, 3).map((age, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm">{age.ageGroup} anos</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{age.count}</span>
                            <Badge variant="outline" className="text-xs">
                              {Math.round((age.count / 1999) * 100)}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Histórico */}
        <TabsContent value="history" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartComponent
              title="Condições Mais Comuns"
              description="Principais condições médicas dos pacientes"
              data={mockConditionsData}
              config={conditionsChartConfig}
              loading={isLoadingDashboard}
              onRefresh={() => handleGenerateReport()}
              onExport={(format) => handleExport(format as 'pdf' | 'excel' | 'csv' | 'png')}
              height={400}
            />
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Análise de Condições</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockConditionsData.map((condition, index) => {
                    const percentage = (condition.count / mockConditionsData.reduce((sum, c) => sum + c.count, 0)) * 100;
                    
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{condition.condition}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{condition.count}</span>
                            <Badge variant="outline" className="text-xs">
                              {percentage.toFixed(1)}%
                            </Badge>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Lista de Pacientes */}
        <TabsContent value="patients" className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar pacientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {filteredPatients.map((patient) => (
                <Card 
                  key={patient.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedPatient?.id === patient.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedPatient(patient)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={patient.avatar} />
                        <AvatarFallback>
                          {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{patient.name}</h3>
                            <p className="text-sm text-gray-600">
                              {patient.age} anos • {patient.gender === 'M' ? 'Masculino' : 'Feminino'}
                            </p>
                          </div>
                          <Badge className={`text-xs ${getStatusColor(patient.status)}`}>
                            {patient.status === 'critical' && <AlertCircle className="h-3 w-3 mr-1" />}
                            {patient.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {getStatusLabel(patient.status)}
                          </Badge>
                        </div>
                        
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {patient.phone}
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {patient.email}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {patient.address}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Última visita: {formatDate(patient.lastVisit, 'dd/MM/yyyy', { locale: ptBR })}
                          </div>
                        </div>
                        
                        <div className="mt-3 flex items-center gap-4">
                          <span className="text-sm">
                            <strong>{patient.totalVisits}</strong> consultas
                          </span>
                          <div className="flex gap-1">
                            {patient.conditions.map((condition, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {condition}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Detalhes do Paciente Selecionado */}
            <div className="space-y-4">
              {selectedPatient ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Detalhes do Paciente</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <Avatar className="h-16 w-16 mx-auto mb-3">
                        <AvatarImage src={selectedPatient.avatar} />
                        <AvatarFallback className="text-lg">
                          {selectedPatient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-semibold">{selectedPatient.name}</h3>
                      <p className="text-sm text-gray-600">
                        {selectedPatient.age} anos • {selectedPatient.gender === 'M' ? 'Masculino' : 'Feminino'}
                      </p>
                    </div>
                    
                    <div className="space-y-3 pt-4 border-t">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Status
                        </label>
                        <Badge className={`mt-1 ${getStatusColor(selectedPatient.status)}`}>
                          {getStatusLabel(selectedPatient.status)}
                        </Badge>
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Total de Consultas
                        </label>
                        <p className="text-lg font-semibold">{selectedPatient.totalVisits}</p>
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Última Visita
                        </label>
                        <p className="text-sm">
                          {formatDate(selectedPatient.lastVisit, 'dd/MM/yyyy', { locale: ptBR })}
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Condições
                        </label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedPatient.conditions.map((condition, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {condition}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <Button className="w-full" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Ver Histórico Completo
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center text-gray-500">
                    <User className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Selecione um paciente para ver os detalhes</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PatientReports;