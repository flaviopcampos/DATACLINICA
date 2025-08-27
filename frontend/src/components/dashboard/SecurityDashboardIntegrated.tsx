/**
 * Dashboard de Segurança Integrado - DataClínica
 * 
 * Este componente consolida informações de segurança de todos os sistemas:
 * - Gestão de Sessões
 * - Sistema 2FA
 * - Auditoria
 * - Notificações
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Alert, AlertDescription } from '../ui/alert'
import { Progress } from '../ui/progress'
import {
  Shield,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Smartphone,
  Key,
  Bell,
  FileText,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'
import { useSessions } from '../../hooks/useSessions'
import { useSecurity } from '../../hooks/useSecurity'
import { useIntegration } from '../../hooks/useIntegration'
import { SecurityAlerts } from '../sessions/SecurityAlerts'
import { ActiveSessionsList } from '../sessions/ActiveSessionsList'
import { toast } from 'sonner'
import type { Session, SecurityAlert } from '../../types/session'

interface SecurityMetrics {
  totalSessions: number
  activeSessions: number
  blockedSessions: number
  suspiciousActivities: number
  securityScore: number
  twoFactorEnabled: boolean
  lastSecurityCheck: string
  criticalAlerts: number
  resolvedAlerts: number
}

interface AuditSummary {
  totalEvents: number
  securityEvents: number
  loginAttempts: number
  failedLogins: number
  lastAuditDate: string
}

interface NotificationSummary {
  totalNotifications: number
  unreadNotifications: number
  securityNotifications: number
  lastNotificationDate: string
}

export function SecurityDashboardIntegrated() {
  const [activeTab, setActiveTab] = useState('overview')
  const [timeRange, setTimeRange] = useState('24h')
  
  const { 
    sessions, 
    isLoading: isSessionsLoading,
    terminateAllOtherSessions,
    refreshSessions
  } = useSessions()
  
  const {
    securityEvents,
    securitySettings,
    analyzeSessionSecurity,
    forceLogoutAllSessions,
    isLoading: isSecurityLoading
  } = useSecurity()
  
  const {
    securityCheck,
    integrationData,
    handleSuspiciousActivity,
    sendSecurityNotification,
    isCheckingSecurityLoading
  } = useIntegration({ autoRefresh: true })

  // Estados locais para dados integrados
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics>({
    totalSessions: 0,
    activeSessions: 0,
    blockedSessions: 0,
    suspiciousActivities: 0,
    securityScore: 85,
    twoFactorEnabled: true,
    lastSecurityCheck: new Date().toISOString(),
    criticalAlerts: 0,
    resolvedAlerts: 0
  })
  
  const [auditSummary, setAuditSummary] = useState<AuditSummary>({
    totalEvents: 0,
    securityEvents: 0,
    loginAttempts: 0,
    failedLogins: 0,
    lastAuditDate: new Date().toISOString()
  })
  
  const [notificationSummary, setNotificationSummary] = useState<NotificationSummary>({
    totalNotifications: 0,
    unreadNotifications: 0,
    securityNotifications: 0,
    lastNotificationDate: new Date().toISOString()
  })

  // Calcular métricas de segurança
  useEffect(() => {
    if (sessions) {
      const activeSessions = sessions.filter(s => s.status === 'active').length
      const blockedSessions = sessions.filter(s => s.status === 'blocked').length
      const suspiciousCount = sessions.filter(s => s.riskLevel === 'high').length
      
      setSecurityMetrics(prev => ({
        ...prev,
        totalSessions: sessions.length,
        activeSessions,
        blockedSessions,
        suspiciousActivities: suspiciousCount,
        lastSecurityCheck: new Date().toISOString()
      }))
    }
  }, [sessions])

  // Calcular score de segurança
  const calculateSecurityScore = (): number => {
    let score = 100
    
    // Penalizar por sessões bloqueadas
    score -= securityMetrics.blockedSessions * 10
    
    // Penalizar por atividades suspeitas
    score -= securityMetrics.suspiciousActivities * 15
    
    // Penalizar por alertas críticos
    score -= securityMetrics.criticalAlerts * 20
    
    // Bonificar por 2FA ativo
    if (securityMetrics.twoFactorEnabled) {
      score += 10
    }
    
    return Math.max(0, Math.min(100, score))
  }

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreTrend = (score: number): React.ReactNode => {
    if (score >= 80) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (score >= 60) return <Minus className="h-4 w-4 text-yellow-600" />
    return <TrendingDown className="h-4 w-4 text-red-600" />
  }

  const handleForceLogoutAll = async () => {
    try {
      await forceLogoutAllSessions.mutateAsync()
      await refreshSessions()
      toast.success('Todas as sessões foram encerradas com sucesso')
    } catch (error) {
      toast.error('Erro ao encerrar todas as sessões')
    }
  }

  const handleRefreshSecurity = async () => {
    try {
      await refreshSessions()
      toast.success('Dados de segurança atualizados')
    } catch (error) {
      toast.error('Erro ao atualizar dados de segurança')
    }
  }

  const currentSecurityScore = calculateSecurityScore()
  const isLoading = isSessionsLoading || isSecurityLoading || isCheckingSecurityLoading

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard de Segurança</h1>
          <p className="text-muted-foreground">
            Visão consolidada da segurança do sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefreshSecurity}>
            <Activity className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="destructive" onClick={handleForceLogoutAll}>
            <XCircle className="h-4 w-4 mr-2" />
            Encerrar Todas as Sessões
          </Button>
        </div>
      </div>

      {/* Score de Segurança */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Score de Segurança
            {getScoreTrend(currentSecurityScore)}
          </CardTitle>
          <CardDescription>
            Avaliação geral da segurança do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Score Atual</span>
                <span className={`text-2xl font-bold ${getScoreColor(currentSecurityScore)}`}>
                  {currentSecurityScore}/100
                </span>
              </div>
              <Progress value={currentSecurityScore} className="h-2" />
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Última verificação</div>
              <div className="text-sm font-medium">
                {new Date(securityMetrics.lastSecurityCheck).toLocaleString('pt-BR')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div className="text-sm font-medium">Sessões Ativas</div>
            </div>
            <div className="text-2xl font-bold">{securityMetrics.activeSessions}</div>
            <div className="text-xs text-muted-foreground">
              de {securityMetrics.totalSessions} total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <div className="text-sm font-medium">Atividades Suspeitas</div>
            </div>
            <div className="text-2xl font-bold">{securityMetrics.suspiciousActivities}</div>
            <div className="text-xs text-muted-foreground">
              últimas 24h
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-green-600" />
              <div className="text-sm font-medium">2FA Status</div>
            </div>
            <div className="flex items-center gap-2">
              {securityMetrics.twoFactorEnabled ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span className="text-sm font-medium">
                {securityMetrics.twoFactorEnabled ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-purple-600" />
              <div className="text-sm font-medium">Alertas Críticos</div>
            </div>
            <div className="text-2xl font-bold">{securityMetrics.criticalAlerts}</div>
            <div className="text-xs text-muted-foreground">
              {securityMetrics.resolvedAlerts} resolvidos
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo Principal */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="sessions">Sessões</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="audit">Auditoria</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resumo de Auditoria */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Resumo de Auditoria
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Total de Eventos</span>
                  <span className="font-medium">{auditSummary.totalEvents}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Eventos de Segurança</span>
                  <span className="font-medium">{auditSummary.securityEvents}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Tentativas de Login</span>
                  <span className="font-medium">{auditSummary.loginAttempts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Logins Falharam</span>
                  <span className="font-medium text-red-600">{auditSummary.failedLogins}</span>
                </div>
              </CardContent>
            </Card>

            {/* Resumo de Notificações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Resumo de Notificações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Total de Notificações</span>
                  <span className="font-medium">{notificationSummary.totalNotifications}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Não Lidas</span>
                  <span className="font-medium">{notificationSummary.unreadNotifications}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Notificações de Segurança</span>
                  <span className="font-medium">{notificationSummary.securityNotifications}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Última: {new Date(notificationSummary.lastNotificationDate).toLocaleString('pt-BR')}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Sessões Ativas</CardTitle>
              <CardDescription>
                Gerencie todas as sessões ativas do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActiveSessionsList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Alertas de Segurança</CardTitle>
              <CardDescription>
                Monitore e gerencie alertas de segurança
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SecurityAlerts />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Auditoria</CardTitle>
              <CardDescription>
                Visualize eventos de auditoria e segurança
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Integração com sistema de auditoria em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Central de Notificações</CardTitle>
              <CardDescription>
                Gerencie preferências e histórico de notificações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Central de notificações em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SecurityDashboardIntegrated