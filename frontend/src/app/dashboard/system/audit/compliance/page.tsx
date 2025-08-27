'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Shield, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Download,
  Plus,
  Search,
  Filter,
  Calendar,
  BarChart3,
  Settings,
  RefreshCw
} from 'lucide-react'
import { ComplianceReport } from '@/components/audit/ComplianceReport'
import { useCompliance } from '@/hooks/useCompliance'
import { ComplianceStandard, AuditStatus } from '@/types/audit'

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [standardFilter, setStandardFilter] = useState<ComplianceStandard | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<AuditStatus | 'all'>('all')
  
  const { reports, templates, isLoading, generateReport, refetch } = useCompliance()

  const filteredReports = reports?.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStandard = standardFilter === 'all' || report.standard === standardFilter
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter
    
    return matchesSearch && matchesStandard && matchesStatus
  }) || []

  const activeReports = reports?.filter(report => report.status === 'active').length || 0
  const completedReports = reports?.filter(report => report.status === 'completed').length || 0
  const pendingReports = reports?.filter(report => report.status === 'pending').length || 0
  const averageScore = reports?.length > 0 
    ? Math.round(reports.reduce((acc, report) => acc + report.score, 0) / reports.length)
    : 0

  const complianceMetrics = [
    {
      title: 'Relatórios Ativos',
      value: activeReports,
      description: 'Em monitoramento',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Conformidade Média',
      value: `${averageScore}%`,
      description: 'Pontuação geral',
      icon: BarChart3,
      color: averageScore >= 90 ? 'text-green-600' : averageScore >= 70 ? 'text-yellow-600' : 'text-red-600',
      bgColor: averageScore >= 90 ? 'bg-green-50' : averageScore >= 70 ? 'bg-yellow-50' : 'bg-red-50',
      borderColor: averageScore >= 90 ? 'border-green-200' : averageScore >= 70 ? 'border-yellow-200' : 'border-red-200'
    },
    {
      title: 'Relatórios Concluídos',
      value: completedReports,
      description: 'Este mês',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Pendências',
      value: pendingReports,
      description: 'Requerem ação',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    }
  ]

  const lgpdCompliance = {
    score: 92,
    requirements: [
      { name: 'Consentimento', status: 'compliant', score: 95 },
      { name: 'Direitos do Titular', status: 'compliant', score: 90 },
      { name: 'Segurança de Dados', status: 'partial', score: 85 },
      { name: 'Relatório de Impacto', status: 'compliant', score: 98 },
      { name: 'DPO Designado', status: 'compliant', score: 100 }
    ]
  }

  const hipaaCompliance = {
    score: 88,
    requirements: [
      { name: 'Salvaguardas Administrativas', status: 'compliant', score: 92 },
      { name: 'Salvaguardas Físicas', status: 'compliant', score: 90 },
      { name: 'Salvaguardas Técnicas', status: 'partial', score: 82 },
      { name: 'Políticas e Procedimentos', status: 'compliant', score: 95 },
      { name: 'Treinamento', status: 'partial', score: 78 }
    ]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800 border-green-200'
      case 'partial': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'non-compliant': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'compliant': return 'Conforme'
      case 'partial': return 'Parcial'
      case 'non-compliant': return 'Não Conforme'
      default: return 'Desconhecido'
    }
  }

  const handleGenerateReport = async (standard: ComplianceStandard) => {
    try {
      await generateReport({
        standard,
        title: `Relatório ${standard.toUpperCase()} - ${new Date().toLocaleDateString('pt-BR')}`,
        description: `Relatório automático de conformidade ${standard.toUpperCase()}`,
        includeRecommendations: true,
        includeMetrics: true
      })
    } catch (error) {
      console.error('Erro ao gerar relatório:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Conformidade e Compliance</h1>
          <p className="text-muted-foreground">
            Monitoramento de conformidade LGPD, HIPAA e outros padrões regulatórios
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleGenerateReport('lgpd')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Relatório
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>

      {/* Alertas de Conformidade */}
      {pendingReports > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>{pendingReports} relatórios</strong> pendentes requerem sua atenção.
          </AlertDescription>
        </Alert>
      )}

      {/* Métricas de Compliance */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {complianceMetrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <Card key={index} className={`${metric.bgColor} ${metric.borderColor}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${metric.color}`}>
                  {metric.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="lgpd">LGPD</TabsTrigger>
          <TabsTrigger value="hipaa">HIPAA</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Status LGPD */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  LGPD - Lei Geral de Proteção de Dados
                </CardTitle>
                <CardDescription>
                  Conformidade com a legislação brasileira
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Pontuação Geral</span>
                  <span className="text-2xl font-bold text-green-600">{lgpdCompliance.score}%</span>
                </div>
                <Progress value={lgpdCompliance.score} className="h-2" />
                <div className="space-y-2">
                  {lgpdCompliance.requirements.map((req, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span>{req.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{req.score}%</span>
                        <Badge className={getStatusColor(req.status)} variant="outline">
                          {getStatusText(req.status)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Status HIPAA */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  HIPAA - Health Insurance Portability
                </CardTitle>
                <CardDescription>
                  Conformidade com padrões de saúde americanos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Pontuação Geral</span>
                  <span className="text-2xl font-bold text-yellow-600">{hipaaCompliance.score}%</span>
                </div>
                <Progress value={hipaaCompliance.score} className="h-2" />
                <div className="space-y-2">
                  {hipaaCompliance.requirements.map((req, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span>{req.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{req.score}%</span>
                        <Badge className={getStatusColor(req.status)} variant="outline">
                          {getStatusText(req.status)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ações Recomendadas */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Recomendadas</CardTitle>
              <CardDescription>
                Melhorias sugeridas para aumentar a conformidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium text-yellow-800">Atualizar Políticas de Segurança</div>
                    <div className="text-sm text-yellow-600 mt-1">
                      As políticas de segurança técnica precisam ser revisadas para atender aos requisitos HIPAA.
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Revisar
                  </Button>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium text-blue-800">Documentar Processos de Consentimento</div>
                    <div className="text-sm text-blue-600 mt-1">
                      Melhorar a documentação dos processos de obtenção de consentimento LGPD.
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Documentar
                  </Button>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium text-green-800">Implementar Treinamento Adicional</div>
                    <div className="text-sm text-green-600 mt-1">
                      Expandir o programa de treinamento para cobrir novos requisitos regulatórios.
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Agendar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lgpd">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detalhamento LGPD</CardTitle>
                <CardDescription>
                  Análise detalhada da conformidade com a Lei Geral de Proteção de Dados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {lgpdCompliance.requirements.map((req, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{req.name}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{req.score}%</span>
                          <Badge className={getStatusColor(req.status)}>
                            {getStatusText(req.status)}
                          </Badge>
                        </div>
                      </div>
                      <Progress value={req.score} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="hipaa">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detalhamento HIPAA</CardTitle>
                <CardDescription>
                  Análise detalhada da conformidade com os padrões HIPAA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {hipaaCompliance.requirements.map((req, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{req.name}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{req.score}%</span>
                          <Badge className={getStatusColor(req.status)}>
                            {getStatusText(req.status)}
                          </Badge>
                        </div>
                      </div>
                      <Progress value={req.score} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros de Relatórios
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
                <Select value={standardFilter} onValueChange={(value: ComplianceStandard | 'all') => setStandardFilter(value)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Padrão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="lgpd">LGPD</SelectItem>
                    <SelectItem value="hipaa">HIPAA</SelectItem>
                    <SelectItem value="iso27001">ISO 27001</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(value: AuditStatus | 'all') => setStatusFilter(value)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="completed">Concluídos</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <ComplianceReport />
        </TabsContent>
      </Tabs>
    </div>
  )
}