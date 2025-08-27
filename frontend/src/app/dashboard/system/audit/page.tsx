'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Shield, 
  Activity, 
  FileText, 
  AlertTriangle, 
  Users, 
  Database,
  Clock,
  TrendingUp,
  Download,
  Settings
} from 'lucide-react'
import { AuditLogViewer } from '@/components/audit/AuditLogViewer'
import { SecurityAlerts } from '@/components/audit/SecurityAlerts'
import { AuditTimeline } from '@/components/audit/AuditTimeline'
import { useAudit } from '@/hooks/useAudit'
import { useSecurityMonitor } from '@/hooks/useSecurityMonitor'
import { useCompliance } from '@/hooks/useCompliance'

export default function AuditPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const { statistics } = useAudit()
  const { metrics, alerts } = useSecurityMonitor()
  const { reports } = useCompliance()

  const criticalAlerts = alerts?.filter(alert => alert.severity === 'critical').length || 0
  const highAlerts = alerts?.filter(alert => alert.severity === 'high').length || 0
  const activeReports = reports?.filter(report => report.status === 'active').length || 0

  const overviewCards = [
    {
      title: 'Total de Logs',
      value: statistics?.totalLogs?.toLocaleString() || '0',
      description: 'Últimas 24 horas',
      icon: FileText,
      trend: '+12%',
      color: 'text-blue-600'
    },
    {
      title: 'Eventos de Segurança',
      value: metrics?.totalEvents?.toString() || '0',
      description: 'Eventos detectados hoje',
      icon: Shield,
      trend: '-5%',
      color: 'text-green-600'
    },
    {
      title: 'Alertas Críticos',
      value: criticalAlerts.toString(),
      description: 'Requerem atenção imediata',
      icon: AlertTriangle,
      trend: criticalAlerts > 0 ? 'Crítico' : 'Normal',
      color: criticalAlerts > 0 ? 'text-red-600' : 'text-green-600'
    },
    {
      title: 'Usuários Ativos',
      value: statistics?.activeUsers?.toString() || '0',
      description: 'Sessões ativas agora',
      icon: Users,
      trend: '+8%',
      color: 'text-purple-600'
    }
  ]

  const complianceScore = reports?.length > 0 
    ? Math.round(reports.reduce((acc, report) => acc + report.score, 0) / reports.length)
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sistema de Auditoria</h1>
          <p className="text-muted-foreground">
            Monitoramento de segurança, logs e conformidade em tempo real
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>

      {/* Alertas Críticos */}
      {criticalAlerts > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{criticalAlerts} alertas críticos</strong> detectados. 
            <Button variant="link" className="p-0 h-auto text-red-600 underline ml-1">
              Ver detalhes
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="logs">Logs de Auditoria</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Cards de Métricas */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {overviewCards.map((card, index) => {
              const Icon = card.icon
              return (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {card.title}
                    </CardTitle>
                    <Icon className={`h-4 w-4 ${card.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{card.value}</div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {card.description}
                      </p>
                      <Badge 
                        variant={card.trend.includes('-') || card.trend === 'Normal' ? 'secondary' : 'destructive'}
                        className="text-xs"
                      >
                        {card.trend}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Status de Conformidade */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Status de Conformidade
                </CardTitle>
                <CardDescription>
                  Pontuação geral de compliance LGPD/HIPAA
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Pontuação Geral</span>
                  <span className="text-2xl font-bold">{complianceScore}%</span>
                </div>
                <Progress value={complianceScore} className="h-2" />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium">LGPD</div>
                    <div className="text-muted-foreground">92% conforme</div>
                  </div>
                  <div>
                    <div className="font-medium">HIPAA</div>
                    <div className="text-muted-foreground">88% conforme</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Atividade Recente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Atividade Recente
                </CardTitle>
                <CardDescription>
                  Eventos mais recentes do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((_, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <div className="flex-1">
                        <div className="font-medium">Login de usuário</div>
                        <div className="text-muted-foreground">admin@dataclinica.com</div>
                      </div>
                      <div className="text-muted-foreground">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {index + 1}min
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Tendências */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Tendências de Segurança
              </CardTitle>
              <CardDescription>
                Análise de eventos de segurança nas últimas 24 horas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Gráfico de tendências será implementado aqui
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <AuditLogViewer />
        </TabsContent>

        <TabsContent value="security">
          <SecurityAlerts />
        </TabsContent>

        <TabsContent value="timeline">
          <AuditTimeline />
        </TabsContent>
      </Tabs>
    </div>
  )
}