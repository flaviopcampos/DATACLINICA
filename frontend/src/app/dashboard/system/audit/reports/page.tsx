'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  FileText, 
  Download, 
  Plus,
  Search,
  Filter,
  Calendar as CalendarIcon,
  Clock,
  User,
  BarChart3,
  Settings,
  Eye,
  Trash2,
  RefreshCw,
  Archive
} from 'lucide-react'
import { AuditExport } from '@/components/audit/AuditExport'
import { useAudit } from '@/hooks/useAudit'
import { useCompliance } from '@/hooks/useCompliance'
import { ComplianceStandard, AuditStatus } from '@/types/audit'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ReportTemplate {
  id: string
  name: string
  description: string
  type: 'audit' | 'security' | 'compliance'
  standard?: ComplianceStandard
  fields: string[]
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
    enabled: boolean
  }
}

interface GeneratedReport {
  id: string
  title: string
  type: 'audit' | 'security' | 'compliance'
  standard?: ComplianceStandard
  status: 'generating' | 'completed' | 'failed'
  createdAt: string
  createdBy: string
  size: string
  downloadUrl?: string
  description: string
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('generated')
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'audit' | 'security' | 'compliance'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'generating' | 'completed' | 'failed'>('all')
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newReportData, setNewReportData] = useState({
    title: '',
    description: '',
    type: 'audit' as 'audit' | 'security' | 'compliance',
    standard: 'lgpd' as ComplianceStandard,
    includeMetrics: true,
    includeRecommendations: true,
    dateRange: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to: new Date()
    }
  })

  const { statistics } = useAudit()
  const { reports, generateReport } = useCompliance()

  // Mock data para relatórios gerados
  const generatedReports: GeneratedReport[] = [
    {
      id: '1',
      title: 'Relatório de Auditoria Mensal - Janeiro 2024',
      type: 'audit',
      status: 'completed',
      createdAt: '2024-01-31T10:30:00Z',
      createdBy: 'admin@dataclinica.com',
      size: '2.4 MB',
      downloadUrl: '/reports/audit-jan-2024.pdf',
      description: 'Relatório completo de auditoria incluindo logs de sistema, eventos de segurança e métricas de conformidade.'
    },
    {
      id: '2',
      title: 'Relatório LGPD - Trimestre Q4 2023',
      type: 'compliance',
      standard: 'lgpd',
      status: 'completed',
      createdAt: '2024-01-15T14:20:00Z',
      createdBy: 'compliance@dataclinica.com',
      size: '1.8 MB',
      downloadUrl: '/reports/lgpd-q4-2023.pdf',
      description: 'Análise de conformidade LGPD com recomendações e plano de ação.'
    },
    {
      id: '3',
      title: 'Relatório de Segurança - Incidentes Janeiro',
      type: 'security',
      status: 'generating',
      createdAt: '2024-02-01T09:15:00Z',
      createdBy: 'security@dataclinica.com',
      size: 'Processando...',
      description: 'Análise detalhada de eventos de segurança e incidentes do mês de janeiro.'
    }
  ]

  // Mock data para templates
  const reportTemplates: ReportTemplate[] = [
    {
      id: '1',
      name: 'Relatório de Auditoria Completo',
      description: 'Template padrão para relatórios de auditoria incluindo todos os logs e métricas',
      type: 'audit',
      fields: ['logs', 'metrics', 'users', 'timeline', 'recommendations'],
      schedule: { frequency: 'monthly', enabled: true }
    },
    {
      id: '2',
      name: 'Relatório LGPD',
      description: 'Template específico para conformidade LGPD',
      type: 'compliance',
      standard: 'lgpd',
      fields: ['compliance_score', 'requirements', 'gaps', 'recommendations'],
      schedule: { frequency: 'quarterly', enabled: true }
    },
    {
      id: '3',
      name: 'Relatório de Incidentes de Segurança',
      description: 'Template para análise de eventos e incidentes de segurança',
      type: 'security',
      fields: ['security_events', 'alerts', 'threats', 'blocked_ips'],
      schedule: { frequency: 'weekly', enabled: false }
    }
  ]

  const filteredReports = generatedReports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || report.type === typeFilter
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter
    
    return matchesSearch && matchesType && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'generating': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'failed': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluído'
      case 'generating': return 'Gerando'
      case 'failed': return 'Falhou'
      default: return 'Desconhecido'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'audit': return 'bg-blue-100 text-blue-800'
      case 'security': return 'bg-red-100 text-red-800'
      case 'compliance': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'audit': return 'Auditoria'
      case 'security': return 'Segurança'
      case 'compliance': return 'Compliance'
      default: return 'Desconhecido'
    }
  }

  const handleCreateReport = async () => {
    try {
      if (newReportData.type === 'compliance') {
        await generateReport({
          standard: newReportData.standard,
          title: newReportData.title,
          description: newReportData.description,
          includeRecommendations: newReportData.includeRecommendations,
          includeMetrics: newReportData.includeMetrics
        })
      }
      setIsCreateDialogOpen(false)
      // Reset form
      setNewReportData({
        title: '',
        description: '',
        type: 'audit',
        standard: 'lgpd',
        includeMetrics: true,
        includeRecommendations: true,
        dateRange: {
          from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          to: new Date()
        }
      })
    } catch (error) {
      console.error('Erro ao criar relatório:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios de Auditoria</h1>
          <p className="text-muted-foreground">
            Geração, visualização e gerenciamento de relatórios de auditoria
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Relatório
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Relatório</DialogTitle>
                <DialogDescription>
                  Configure os parâmetros para gerar um novo relatório de auditoria
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título do Relatório</Label>
                    <Input
                      id="title"
                      value={newReportData.title}
                      onChange={(e) => setNewReportData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ex: Relatório Mensal de Auditoria"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo de Relatório</Label>
                    <Select 
                      value={newReportData.type} 
                      onValueChange={(value: 'audit' | 'security' | 'compliance') => 
                        setNewReportData(prev => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="audit">Auditoria</SelectItem>
                        <SelectItem value="security">Segurança</SelectItem>
                        <SelectItem value="compliance">Compliance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {newReportData.type === 'compliance' && (
                  <div className="space-y-2">
                    <Label htmlFor="standard">Padrão de Compliance</Label>
                    <Select 
                      value={newReportData.standard} 
                      onValueChange={(value: ComplianceStandard) => 
                        setNewReportData(prev => ({ ...prev, standard: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lgpd">LGPD</SelectItem>
                        <SelectItem value="hipaa">HIPAA</SelectItem>
                        <SelectItem value="iso27001">ISO 27001</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={newReportData.description}
                    onChange={(e) => setNewReportData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva o objetivo e escopo do relatório..."
                    rows={3}
                  />
                </div>
                
                <div className="space-y-3">
                  <Label>Opções do Relatório</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="metrics"
                        checked={newReportData.includeMetrics}
                        onCheckedChange={(checked) => 
                          setNewReportData(prev => ({ ...prev, includeMetrics: !!checked }))
                        }
                      />
                      <Label htmlFor="metrics">Incluir métricas e estatísticas</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="recommendations"
                        checked={newReportData.includeRecommendations}
                        onCheckedChange={(checked) => 
                          setNewReportData(prev => ({ ...prev, includeRecommendations: !!checked }))
                        }
                      />
                      <Label htmlFor="recommendations">Incluir recomendações</Label>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateReport}>
                    Gerar Relatório
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generated">Relatórios Gerados</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="scheduled">Agendados</TabsTrigger>
          <TabsTrigger value="export">Exportação</TabsTrigger>
        </TabsList>

        <TabsContent value="generated" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar relatórios..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={typeFilter} onValueChange={(value: 'all' | 'audit' | 'security' | 'compliance') => setTypeFilter(value)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="audit">Auditoria</SelectItem>
                    <SelectItem value="security">Segurança</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(value: 'all' | 'generating' | 'completed' | 'failed') => setStatusFilter(value)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="completed">Concluídos</SelectItem>
                    <SelectItem value="generating">Gerando</SelectItem>
                    <SelectItem value="failed">Falharam</SelectItem>
                  </SelectContent>
                </Select>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Data'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Relatórios */}
          <div className="space-y-4">
            {filteredReports.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Nenhum relatório encontrado com os filtros aplicados.
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredReports.map((report) => (
                <Card key={report.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{report.title}</h3>
                          <Badge className={getTypeColor(report.type)}>
                            {getTypeText(report.type)}
                          </Badge>
                          <Badge className={getStatusColor(report.status)} variant="outline">
                            {getStatusText(report.status)}
                          </Badge>
                          {report.standard && (
                            <Badge variant="secondary">
                              {report.standard.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {report.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(report.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {report.createdBy}
                          </div>
                          <div className="flex items-center gap-1">
                            <BarChart3 className="h-3 w-3" />
                            {report.size}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          Visualizar
                        </Button>
                        {report.status === 'completed' && report.downloadUrl && (
                          <Button variant="outline" size="sm">
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Archive className="h-3 w-3 mr-1" />
                          Arquivar
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-3 w-3 mr-1" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reportTemplates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {template.name}
                  </CardTitle>
                  <CardDescription>
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className={getTypeColor(template.type)}>
                      {getTypeText(template.type)}
                    </Badge>
                    {template.standard && (
                      <Badge variant="secondary">
                        {template.standard.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Campos Incluídos:</Label>
                    <div className="flex flex-wrap gap-1">
                      {template.fields.map((field, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {template.schedule && (
                    <div className="flex items-center justify-between text-sm">
                      <span>Agendamento:</span>
                      <Badge variant={template.schedule.enabled ? 'default' : 'secondary'}>
                        {template.schedule.enabled ? template.schedule.frequency : 'Desabilitado'}
                      </Badge>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      Usar Template
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scheduled">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Agendados</CardTitle>
              <CardDescription>
                Configuração e gerenciamento de relatórios automáticos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4" />
                <p>Funcionalidade de agendamento será implementada em breve.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export">
          <AuditExport />
        </TabsContent>
      </Tabs>
    </div>
  )
}