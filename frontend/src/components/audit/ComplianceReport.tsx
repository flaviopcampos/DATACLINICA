'use client'

import React, { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Shield,
  FileText,
  Download,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  Plus,
  RefreshCw,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  Users,
  Database,
  Lock,
  Zap,
} from 'lucide-react'
import {
  ComplianceReport as ComplianceReportType,
  ComplianceStandard,
  AuditStatus,
  Recommendation
} from '@/types/audit'
import { useCompliance } from '@/hooks/useCompliance'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ComplianceReportProps {
  className?: string
  reportId?: string
  standard?: ComplianceStandard
  showActions?: boolean
  embedded?: boolean
}

type ViewMode = 'overview' | 'sections' | 'recommendations' | 'timeline'

function ComplianceReport({ 
  className,
  reportId,
  standard,
  showActions = true,
  embedded = false
}: ComplianceReportProps) {
  const [selectedReport, setSelectedReport] = useState<ComplianceReportType | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('overview')
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isGenerateOpen, setIsGenerateOpen] = useState(false)
  const [newReportStandard, setNewReportStandard] = useState<ComplianceStandard>('LGPD')
  const [newReportName, setNewReportName] = useState('')
  const [newReportDescription, setNewReportDescription] = useState('')
  const [filterStandard, setFilterStandard] = useState<ComplianceStandard | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<AuditStatus | 'all'>('all')

  const {
    reports,
    isLoading,
    generateReport,
    exportReport,
    updateRequirement,
    addRecommendation,
    refetch
  } = useCompliance()

  const getStatusIcon = (status: AuditStatus) => {
    switch (status) {
      case 'COMPLIANT':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'NON_COMPLIANT':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'PARTIALLY_COMPLIANT':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'PENDING':
        return <Clock className="h-4 w-4 text-blue-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: AuditStatus) => {
    switch (status) {
      case 'COMPLIANT':
        return 'bg-green-100 text-green-800'
      case 'NON_COMPLIANT':
        return 'bg-red-100 text-red-800'
      case 'PARTIALLY_COMPLIANT':
        return 'bg-yellow-100 text-yellow-800'
      case 'PENDING':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStandardIcon = (standard: ComplianceStandard) => {
    switch (standard) {
      case 'LGPD':
        return <Shield className="h-4 w-4" />
      case 'HIPAA':
        return <Lock className="h-4 w-4" />
      case 'GDPR':
        return <Database className="h-4 w-4" />
      case 'SOX':
        return <FileText className="h-4 w-4" />
      default:
        return <Shield className="h-4 w-4" />
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
      case 'alta':
        return <TrendingUp className="h-4 w-4 text-red-500" />
      case 'medium':
      case 'média':
        return <Minus className="h-4 w-4 text-yellow-500" />
      case 'low':
      case 'baixa':
        return <TrendingDown className="h-4 w-4 text-green-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const filteredReports = React.useMemo(() => {
    if (!reports) return []

    let filtered = reports

    if (reportId) {
      filtered = filtered.filter(report => report.id === reportId)
    }

    if (standard) {
      filtered = filtered.filter(report => report.standard === standard)
    }

    if (filterStandard !== 'all') {
      filtered = filtered.filter(report => report.standard === filterStandard)
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(report => report.overallStatus === filterStatus)
    }

    return filtered.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
  }, [reports, reportId, standard, filterStandard, filterStatus])

  const handleViewDetails = (report: ComplianceReportType) => {
    setSelectedReport(report)
    setIsDetailsOpen(true)
  }

  const handleGenerateReport = async () => {
    if (!newReportName.trim()) {
      toast.error('Nome do relatório é obrigatório')
      return
    }

    try {
      await generateReport.mutateAsync({
        standard: newReportStandard,
        name: newReportName,
        description: newReportDescription,
        includeRecommendations: true,
        includeTimeline: true
      })
      toast.success('Relatório gerado com sucesso')
      setIsGenerateOpen(false)
      setNewReportName('')
      setNewReportDescription('')
    } catch (error) {
      toast.error('Erro ao gerar relatório')
    }
  }

  const handleExportReport = async (report: ComplianceReportType, format: 'pdf' | 'excel' | 'csv') => {
    try {
      await exportReport.mutateAsync({
        reportId: report.id,
        format,
        includeCharts: true,
        includeRecommendations: true
      })
      toast.success(`Relatório exportado em ${format.toUpperCase()}`)
    } catch (error) {
      toast.error('Erro ao exportar relatório')
    }
  }

  const calculateComplianceScore = (report: ComplianceReportType) => {
    const totalSections = report.sections.length
    const compliantSections = report.sections.filter(s => s.status === 'COMPLIANT').length
    const partialSections = report.sections.filter(s => s.status === 'PARTIALLY_COMPLIANT').length
    
    return Math.round(((compliantSections + partialSections * 0.5) / totalSections) * 100)
  }

  const getComplianceScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (embedded && filteredReports.length === 1) {
    const report = filteredReports[0]
    const complianceScore = calculateComplianceScore(report)

    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStandardIcon(report.standard)}
              <div>
                <CardTitle className="text-lg">{report.name}</CardTitle>
                <CardDescription>{report.description}</CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className={cn('text-2xl font-bold', getComplianceScoreColor(complianceScore))}>
                {complianceScore}%
              </div>
              <Badge className={getStatusColor(report.overallStatus)}>
                {report.overallStatus}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Conformidade Geral</span>
                <span>{complianceScore}%</span>
              </div>
              <Progress value={complianceScore} className="h-2" />
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {report.sections.filter(s => s.status === 'COMPLIANT').length}
                </div>
                <div className="text-xs text-gray-500">Conformes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {report.sections.filter(s => s.status === 'PARTIALLY_COMPLIANT').length}
                </div>
                <div className="text-xs text-gray-500">Parciais</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {report.sections.filter(s => s.status === 'NON_COMPLIANT').length}
                </div>
                <div className="text-xs text-gray-500">Não Conformes</div>
              </div>
            </div>
            
            {showActions && (
              <div className="flex gap-2">
                <Button onClick={() => handleViewDetails(report)} variant="outline" size="sm">
                  <Eye className="h-4 w-4" />
                  Ver Detalhes
                </Button>
                <Button onClick={() => handleExportReport(report, 'pdf')} variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                  Exportar
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Cabeçalho */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Relatórios de Conformidade
              </CardTitle>
              <CardDescription>
                Monitoramento de conformidade com regulamentações
              </CardDescription>
            </div>
            {showActions && (
              <div className="flex items-center gap-2">
                <Button onClick={() => refetch()} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button onClick={() => setIsGenerateOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Gerar Relatório
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        
        {/* Filtros */}
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <Select value={filterStandard} onValueChange={(value) => setFilterStandard(value as ComplianceStandard | 'all')}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os padrões</SelectItem>
                  <SelectItem value="LGPD">LGPD</SelectItem>
                  <SelectItem value="HIPAA">HIPAA</SelectItem>
                  <SelectItem value="GDPR">GDPR</SelectItem>
                  <SelectItem value="SOX">SOX</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as AuditStatus | 'all')}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="COMPLIANT">Conforme</SelectItem>
                <SelectItem value="PARTIALLY_COMPLIANT">Parcialmente</SelectItem>
                <SelectItem value="NON_COMPLIANT">Não Conforme</SelectItem>
                <SelectItem value="PENDING">Pendente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Relatórios */}
      {isLoading ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-gray-500">
              <Activity className="h-8 w-8 mx-auto mb-2 animate-spin" />
              <p>Carregando relatórios...</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredReports.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-gray-500">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhum relatório encontrado</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredReports.map((report) => {
            const complianceScore = calculateComplianceScore(report)
            
            return (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                        {getStandardIcon(report.standard)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-lg">{report.name}</CardTitle>
                          <Badge variant="outline">{report.standard}</Badge>
                          <Badge className={getStatusColor(report.overallStatus)}>
                            {report.overallStatus}
                          </Badge>
                        </div>
                        <CardDescription>{report.description}</CardDescription>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{format(new Date(report.generatedAt), 'dd/MM/yyyy', { locale: ptBR })}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{report.generatedBy}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={cn('text-3xl font-bold mb-1', getComplianceScoreColor(complianceScore))}>
                        {complianceScore}%
                      </div>
                      <div className="text-sm text-gray-500">Conformidade</div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Barra de Progresso */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progresso Geral</span>
                        <span>{complianceScore}%</span>
                      </div>
                      <Progress value={complianceScore} className="h-2" />
                    </div>
                    
                    {/* Estatísticas */}
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-xl font-bold text-green-600">
                          {report.sections.filter(s => s.status === 'COMPLIANT').length}
                        </div>
                        <div className="text-xs text-gray-500">Conformes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-yellow-600">
                          {report.sections.filter(s => s.status === 'PARTIALLY_COMPLIANT').length}
                        </div>
                        <div className="text-xs text-gray-500">Parciais</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-red-600">
                          {report.sections.filter(s => s.status === 'NON_COMPLIANT').length}
                        </div>
                        <div className="text-xs text-gray-500">Não Conformes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-blue-600">
                          {report.recommendations.length}
                        </div>
                        <div className="text-xs text-gray-500">Recomendações</div>
                      </div>
                    </div>
                    
                    {/* Ações */}
                    {showActions && (
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex gap-2">
                          <Button onClick={() => handleViewDetails(report)} variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                            Ver Detalhes
                          </Button>
                          <Button onClick={() => handleExportReport(report, 'pdf')} variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                            PDF
                          </Button>
                          <Button onClick={() => handleExportReport(report, 'excel')} variant="outline" size="sm">
                            <BarChart3 className="h-4 w-4" />
                            Excel
                          </Button>
                        </div>
                        
                        <div className="text-sm text-gray-500">
                          Última atualização: {format(new Date(report.lastUpdated), 'dd/MM HH:mm', { locale: ptBR })}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal de Detalhes */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedReport && getStandardIcon(selectedReport.standard)}
              {selectedReport?.name}
            </DialogTitle>
            <DialogDescription>
              Detalhes completos do relatório de conformidade
            </DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)} className="flex-1">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="sections">Seções</TabsTrigger>
                <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>
              
              <ScrollArea className="h-[500px] mt-4">
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Padrão</label>
                      <p className="flex items-center gap-2">
                        {getStandardIcon(selectedReport.standard)}
                        {selectedReport.standard}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Status Geral</label>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(selectedReport.overallStatus)}
                        <Badge className={getStatusColor(selectedReport.overallStatus)}>
                          {selectedReport.overallStatus}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Gerado em</label>
                      <p>{format(new Date(selectedReport.generatedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Gerado por</label>
                      <p>{selectedReport.generatedBy}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Descrição</label>
                    <p className="mt-1">{selectedReport.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedReport.sections.filter(s => s.status === 'COMPLIANT').length}
                      </div>
                      <div className="text-sm text-gray-600">Conformes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {selectedReport.sections.filter(s => s.status === 'PARTIALLY_COMPLIANT').length}
                      </div>
                      <div className="text-sm text-gray-600">Parciais</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {selectedReport.sections.filter(s => s.status === 'NON_COMPLIANT').length}
                      </div>
                      <div className="text-sm text-gray-600">Não Conformes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedReport.recommendations.length}
                      </div>
                      <div className="text-sm text-gray-600">Recomendações</div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="sections" className="space-y-4">
                  {selectedReport.sections.map((section, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{section.name}</CardTitle>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(section.status)}
                            <Badge className={getStatusColor(section.status)}>
                              {section.status}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-3">{section.description}</p>
                        <div className="space-y-2">
                          {section.requirements.map((req, reqIndex) => (
                            <div key={reqIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="text-sm">{req.description}</span>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(req.status)}
                                <span className="text-xs text-gray-500">{req.evidence}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
                
                <TabsContent value="recommendations" className="space-y-4">
                  {selectedReport.recommendations.map((rec, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{rec.title}</CardTitle>
                          <div className="flex items-center gap-2">
                            {getPriorityIcon(rec.priority)}
                            <Badge variant="outline">{rec.priority}</Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <label className="font-medium text-gray-600">Categoria</label>
                            <p>{rec.category}</p>
                          </div>
                          <div>
                            <label className="font-medium text-gray-600">Impacto</label>
                            <p>{rec.impact}</p>
                          </div>
                          <div>
                            <label className="font-medium text-gray-600">Esforço</label>
                            <p>{rec.effort}</p>
                          </div>
                          <div>
                            <label className="font-medium text-gray-600">Status</label>
                            <Badge className={getStatusColor(rec.status as AuditStatus)}>
                              {rec.status}
                            </Badge>
                          </div>
                        </div>
                        {rec.actionItems && rec.actionItems.length > 0 && (
                          <div className="mt-3">
                            <label className="font-medium text-gray-600">Ações</label>
                            <ul className="mt-1 space-y-1">
                              {rec.actionItems.map((action, actionIndex) => (
                                <li key={actionIndex} className="text-sm text-gray-600 flex items-center gap-2">
                                  <div className="h-1 w-1 bg-gray-400 rounded-full" />
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
                
                <TabsContent value="timeline" className="space-y-4">
                  <div className="text-center text-gray-500 py-8">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Timeline de conformidade em desenvolvimento</p>
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Geração de Relatório */}
      <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerar Novo Relatório</DialogTitle>
            <DialogDescription>
              Configure os parâmetros para gerar um novo relatório de conformidade
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="reportStandard">Padrão de Conformidade</Label>
              <Select value={newReportStandard} onValueChange={(value) => setNewReportStandard(value as ComplianceStandard)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LGPD">LGPD - Lei Geral de Proteção de Dados</SelectItem>
                  <SelectItem value="HIPAA">HIPAA - Health Insurance Portability</SelectItem>
                  <SelectItem value="GDPR">GDPR - General Data Protection Regulation</SelectItem>
                  <SelectItem value="SOX">SOX - Sarbanes-Oxley Act</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="reportName">Nome do Relatório</Label>
              <Input
                id="reportName"
                value={newReportName}
                onChange={(e) => setNewReportName(e.target.value)}
                placeholder="Ex: Auditoria LGPD Q1 2024"
              />
            </div>
            
            <div>
              <Label htmlFor="reportDescription">Descrição</Label>
              <Textarea
                id="reportDescription"
                value={newReportDescription}
                onChange={(e) => setNewReportDescription(e.target.value)}
                placeholder="Descreva o escopo e objetivos deste relatório..."
                rows={3}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsGenerateOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleGenerateReport} disabled={generateReport.isPending}>
                {generateReport.isPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Gerar Relatório
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ComplianceReport