'use client';

// Página de Relatórios do Sistema BI

import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  FileText,
  Plus,
  Play,
  Pause,
  Download,
  Upload,
  Calendar,
  Clock,
  Users,
  Settings,
  Filter,
  Search,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Copy,
  Share,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal,
  BarChart3,
  PieChart,
  LineChart,
  Table as TableIcon,
  Image,
  FileSpreadsheet,
  FilePdf
} from 'lucide-react';
import { toast } from 'sonner';

// Tipos
interface Report {
  id: string;
  name: string;
  description: string;
  category: string;
  type: 'table' | 'chart' | 'dashboard' | 'custom';
  status: 'draft' | 'active' | 'scheduled' | 'running' | 'completed' | 'failed';
  lastRun?: Date;
  nextRun?: Date;
  schedule?: {
    frequency: 'once' | 'daily' | 'weekly' | 'monthly';
    time: string;
    days?: number[];
  };
  parameters: ReportParameter[];
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv' | 'html';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ReportParameter {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect';
  required: boolean;
  defaultValue?: any;
  options?: { value: string; label: string }[];
}

interface ReportExecution {
  id: string;
  reportId: string;
  status: 'running' | 'completed' | 'failed';
  progress: number;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  parameters: Record<string, any>;
  output?: {
    format: string;
    size: number;
    url: string;
  };
  error?: string;
}

interface ReportFilters {
  category: string;
  status: string;
  type: string;
  search: string;
}

// Mock data
const mockReports: Report[] = [
  {
    id: '1',
    name: 'Relatório de Ocupação de Leitos',
    description: 'Análise detalhada da ocupação de leitos por departamento',
    category: 'Operacional',
    type: 'table',
    status: 'active',
    lastRun: new Date('2024-06-15T08:00:00'),
    nextRun: new Date('2024-06-16T08:00:00'),
    schedule: {
      frequency: 'daily',
      time: '08:00'
    },
    parameters: [
      {
        id: 'department',
        name: 'Departamento',
        type: 'select',
        required: false,
        options: [
          { value: 'all', label: 'Todos' },
          { value: 'icu', label: 'UTI' },
          { value: 'emergency', label: 'Emergência' }
        ]
      },
      {
        id: 'dateRange',
        name: 'Período',
        type: 'date',
        required: true
      }
    ],
    recipients: ['admin@hospital.com', 'gerencia@hospital.com'],
    format: 'pdf',
    createdBy: 'Admin',
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-06-15')
  },
  {
    id: '2',
    name: 'Dashboard Financeiro Mensal',
    description: 'Resumo financeiro com receitas, custos e margem',
    category: 'Financeiro',
    type: 'dashboard',
    status: 'scheduled',
    nextRun: new Date('2024-07-01T09:00:00'),
    schedule: {
      frequency: 'monthly',
      time: '09:00',
      days: [1]
    },
    parameters: [],
    recipients: ['cfo@hospital.com', 'financeiro@hospital.com'],
    format: 'pdf',
    createdBy: 'CFO',
    createdAt: new Date('2024-05-15'),
    updatedAt: new Date('2024-06-10')
  },
  {
    id: '3',
    name: 'Análise de Satisfação do Paciente',
    description: 'Métricas de satisfação e NPS por período',
    category: 'Qualidade',
    type: 'chart',
    status: 'completed',
    lastRun: new Date('2024-06-14T14:30:00'),
    parameters: [
      {
        id: 'period',
        name: 'Período',
        type: 'select',
        required: true,
        options: [
          { value: 'week', label: 'Última Semana' },
          { value: 'month', label: 'Último Mês' },
          { value: 'quarter', label: 'Último Trimestre' }
        ]
      }
    ],
    recipients: ['qualidade@hospital.com'],
    format: 'excel',
    createdBy: 'Qualidade',
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-06-14')
  }
];

const mockExecutions: ReportExecution[] = [
  {
    id: '1',
    reportId: '1',
    status: 'completed',
    progress: 100,
    startTime: new Date('2024-06-15T08:00:00'),
    endTime: new Date('2024-06-15T08:02:30'),
    duration: 150,
    parameters: { department: 'all', dateRange: '2024-06-14' },
    output: {
      format: 'pdf',
      size: 2048576,
      url: '/reports/ocupacao-leitos-20240615.pdf'
    }
  },
  {
    id: '2',
    reportId: '3',
    status: 'running',
    progress: 65,
    startTime: new Date('2024-06-15T14:30:00'),
    parameters: { period: 'month' }
  },
  {
    id: '3',
    reportId: '2',
    status: 'failed',
    progress: 0,
    startTime: new Date('2024-06-15T09:00:00'),
    endTime: new Date('2024-06-15T09:01:15'),
    duration: 75,
    parameters: {},
    error: 'Erro de conexão com a base de dados financeiros'
  }
];

const categories = [
  { value: 'all', label: 'Todas as Categorias' },
  { value: 'Operacional', label: 'Operacional' },
  { value: 'Financeiro', label: 'Financeiro' },
  { value: 'Qualidade', label: 'Qualidade' },
  { value: 'Recursos Humanos', label: 'Recursos Humanos' },
  { value: 'Clínico', label: 'Clínico' }
];

const reportTypes = [
  { value: 'all', label: 'Todos os Tipos' },
  { value: 'table', label: 'Tabela' },
  { value: 'chart', label: 'Gráfico' },
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'custom', label: 'Personalizado' }
];

const statusOptions = [
  { value: 'all', label: 'Todos os Status' },
  { value: 'draft', label: 'Rascunho' },
  { value: 'active', label: 'Ativo' },
  { value: 'scheduled', label: 'Agendado' },
  { value: 'running', label: 'Executando' },
  { value: 'completed', label: 'Concluído' },
  { value: 'failed', label: 'Falhou' }
];

export default function ReportsPage() {
  // Estados
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [executions, setExecutions] = useState<ReportExecution[]>(mockExecutions);
  const [filters, setFilters] = useState<ReportFilters>({
    category: 'all',
    status: 'all',
    type: 'all',
    search: ''
  });
  const [selectedTab, setSelectedTab] = useState('reports');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRunDialogOpen, setIsRunDialogOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Handlers
  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleCreateReport = () => {
    setIsCreateDialogOpen(true);
  };

  const handleRunReport = (report: Report) => {
    setSelectedReport(report);
    setIsRunDialogOpen(true);
  };

  const handleExecuteReport = () => {
    if (!selectedReport) return;
    
    const newExecution: ReportExecution = {
      id: Date.now().toString(),
      reportId: selectedReport.id,
      status: 'running',
      progress: 0,
      startTime: new Date(),
      parameters: {}
    };
    
    setExecutions(prev => [newExecution, ...prev]);
    setIsRunDialogOpen(false);
    toast.success('Relatório iniciado com sucesso!');
    
    // Simular progresso
    const interval = setInterval(() => {
      setExecutions(prev => prev.map(exec => {
        if (exec.id === newExecution.id && exec.status === 'running') {
          const newProgress = Math.min(exec.progress + 10, 100);
          if (newProgress === 100) {
            clearInterval(interval);
            return {
              ...exec,
              status: 'completed',
              progress: 100,
              endTime: new Date(),
              duration: Math.floor((Date.now() - exec.startTime.getTime()) / 1000),
              output: {
                format: selectedReport.format,
                size: Math.floor(Math.random() * 5000000) + 1000000,
                url: `/reports/${selectedReport.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${selectedReport.format}`
              }
            };
          }
          return { ...exec, progress: newProgress };
        }
        return exec;
      }));
    }, 500);
  };

  const handleDownloadReport = (execution: ReportExecution) => {
    if (execution.output) {
      toast.success('Download iniciado!');
    }
  };

  const handleRefreshData = async () => {
    setRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Dados atualizados com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar dados');
    } finally {
      setRefreshing(false);
    }
  };

  // Filtrar relatórios
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesCategory = filters.category === 'all' || report.category === filters.category;
      const matchesStatus = filters.status === 'all' || report.status === filters.status;
      const matchesType = filters.type === 'all' || report.type === filters.type;
      const matchesSearch = filters.search === '' || 
        report.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        report.description.toLowerCase().includes(filters.search.toLowerCase());
      
      return matchesCategory && matchesStatus && matchesType && matchesSearch;
    });
  }, [reports, filters]);

  // Estatísticas dos relatórios
  const reportStats = useMemo(() => {
    const total = reports.length;
    const active = reports.filter(r => r.status === 'active').length;
    const scheduled = reports.filter(r => r.status === 'scheduled').length;
    const running = executions.filter(e => e.status === 'running').length;
    
    return { total, active, scheduled, running };
  }, [reports, executions]);

  // Renderizar status
  const renderStatus = (status: string) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: Edit },
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      scheduled: { color: 'bg-blue-100 text-blue-800', icon: Calendar },
      running: { color: 'bg-yellow-100 text-yellow-800', icon: Play },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      failed: { color: 'bg-red-100 text-red-800', icon: XCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;
    
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Renderizar tipo de relatório
  const renderReportType = (type: string) => {
    const typeIcons = {
      table: TableIcon,
      chart: BarChart3,
      dashboard: PieChart,
      custom: Settings
    };
    
    const Icon = typeIcons[type as keyof typeof typeIcons] || FileText;
    
    return (
      <div className="flex items-center space-x-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="capitalize">{type}</span>
      </div>
    );
  };

  // Renderizar filtros
  const renderFilters = () => (
    <div className="flex items-center space-x-4 flex-wrap gap-4">
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar relatórios..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="w-64"
        />
      </div>
      
      <Select
        value={filters.category}
        onValueChange={(value) => handleFilterChange('category', value)}
      >
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {categories.map((cat) => (
            <SelectItem key={cat.value} value={cat.value}>
              {cat.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select
        value={filters.status}
        onValueChange={(value) => handleFilterChange('status', value)}
      >
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              {status.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select
        value={filters.type}
        onValueChange={(value) => handleFilterChange('type', value)}
      >
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {reportTypes.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">
            Geração, agendamento e distribuição de relatórios
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshData}
            disabled={refreshing}
          >
            <RefreshCw className={cn(
              'h-4 w-4',
              refreshing && 'animate-spin'
            )} />
            <span className="ml-2">Atualizar</span>
          </Button>
          <Button onClick={handleCreateReport}>
            <Plus className="h-4 w-4" />
            <span className="ml-2">Novo Relatório</span>
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{reportStats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold">{reportStats.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Agendados</p>
                <p className="text-2xl font-bold">{reportStats.scheduled}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Executando</p>
                <p className="text-2xl font-bold">{reportStats.running}</p>
              </div>
              <Play className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          {renderFilters()}
        </CardContent>
      </Card>

      {/* Tabs principais */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="executions">Execuções</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* Tab: Relatórios */}
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Relatórios</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Última Execução</TableHead>
                    <TableHead>Próxima Execução</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{report.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {report.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{report.category}</Badge>
                      </TableCell>
                      <TableCell>{renderReportType(report.type)}</TableCell>
                      <TableCell>{renderStatus(report.status)}</TableCell>
                      <TableCell>
                        {report.lastRun ? (
                          <div className="text-sm">
                            <p>{report.lastRun.toLocaleDateString('pt-BR')}</p>
                            <p className="text-muted-foreground">
                              {report.lastRun.toLocaleTimeString('pt-BR')}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {report.nextRun ? (
                          <div className="text-sm">
                            <p>{report.nextRun.toLocaleDateString('pt-BR')}</p>
                            <p className="text-muted-foreground">
                              {report.nextRun.toLocaleTimeString('pt-BR')}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleRunReport(report)}>
                              <Play className="h-4 w-4 mr-2" />
                              Executar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Execuções */}
        <TabsContent value="executions">
          <Card>
            <CardHeader>
              <CardTitle>Execuções Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {executions.map((execution) => {
                  const report = reports.find(r => r.id === execution.reportId);
                  return (
                    <div key={execution.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="space-y-1">
                          <h4 className="font-medium">{report?.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Iniciado em {execution.startTime.toLocaleString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {renderStatus(execution.status)}
                          {execution.status === 'completed' && execution.output && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadReport(execution)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {execution.status === 'running' && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progresso</span>
                            <span>{execution.progress}%</span>
                          </div>
                          <Progress value={execution.progress} />
                        </div>
                      )}
                      
                      {execution.status === 'completed' && execution.output && (
                        <div className="text-sm text-muted-foreground">
                          <p>Duração: {execution.duration}s</p>
                          <p>Tamanho: {(execution.output.size / 1024 / 1024).toFixed(2)} MB</p>
                          <p>Formato: {execution.output.format.toUpperCase()}</p>
                        </div>
                      )}
                      
                      {execution.status === 'failed' && execution.error && (
                        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                          {execution.error}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Templates */}
        <TabsContent value="templates">
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              Templates de Relatórios
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Gerencie templates reutilizáveis para criação de relatórios
            </p>
            <Button onClick={() => setSelectedTab('reports')}>
              Voltar aos Relatórios
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog: Executar Relatório */}
      <Dialog open={isRunDialogOpen} onOpenChange={setIsRunDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Executar Relatório</DialogTitle>
            <DialogDescription>
              Configure os parâmetros para executar o relatório "{selectedReport?.name}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedReport?.parameters.map((param) => (
              <div key={param.id} className="space-y-2">
                <Label htmlFor={param.id}>
                  {param.name}
                  {param.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                
                {param.type === 'select' && param.options ? (
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder={`Selecione ${param.name.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {param.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : param.type === 'date' ? (
                  <Input type="date" id={param.id} />
                ) : (
                  <Input
                    id={param.id}
                    type={param.type === 'number' ? 'number' : 'text'}
                    placeholder={`Digite ${param.name.toLowerCase()}`}
                  />
                )}
              </div>
            ))}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRunDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleExecuteReport}>
              <Play className="h-4 w-4 mr-2" />
              Executar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Criar Relatório */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Criar Novo Relatório</DialogTitle>
            <DialogDescription>
              Configure as informações básicas do novo relatório
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Relatório</Label>
                <Input id="name" placeholder="Digite o nome do relatório" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.slice(1).map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descreva o objetivo e conteúdo do relatório"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.slice(1).map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="format">Formato</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o formato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              setIsCreateDialogOpen(false);
              toast.success('Relatório criado com sucesso!');
            }}>
              Criar Relatório
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}