import React, { useState } from 'react';
import { Shield, AlertTriangle, Eye, Lock, Unlock, Ban, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useSecurity } from '@/hooks/useSecurity';
import { useSessions } from '@/hooks/useSessions';
import { SecurityAlerts } from './SecurityAlerts';
import { AlertSeverity } from '@/types/sessions';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SecurityDashboardProps {
  userId: string;
  className?: string;
}

export function SecurityDashboard({ userId, className }: SecurityDashboardProps) {
  const [selectedTab, setSelectedTab] = useState('overview');
  const { sessions } = useSessions();
  const {
    securityEvents,
    securityConfig,
    failedAttempts,
    forceLogoutAllSessions,
    updateSecurityConfig,
    getSessionRiskLevel,
  } = useSecurity({ userId, autoRefresh: true });

  const handleForceLogoutAll = async () => {
    try {
      await forceLogoutAllSessions.mutateAsync({
        userId,
        reason: 'Logout forçado por medida de segurança',
      });
    } catch (error) {
      console.error('Erro ao forçar logout:', error);
    }
  };

  const getSecurityScore = (): number => {
    if (!sessions.data || !securityConfig.data) return 0;
    
    let score = 100;
    const activeSessions = sessions.data.filter(s => s.isActive);
    
    // Penalizar por muitas sessões ativas
    if (activeSessions.length > securityConfig.data.maxConcurrentSessions) {
      score -= 20;
    }
    
    // Penalizar por sessões de alto risco
    const highRiskSessions = activeSessions.filter(s => getSessionRiskLevel(s) === 'high');
    score -= highRiskSessions.length * 15;
    
    // Penalizar por tentativas falhadas recentes
    if (failedAttempts.data && failedAttempts.data.count > 0) {
      score -= failedAttempts.data.count * 5;
    }
    
    // Bonificar por 2FA ativo
    if (securityConfig.data.requireTwoFactor) {
      score += 10;
    }
    
    return Math.max(0, Math.min(100, score));
  };

  const getSecurityLevel = (score: number): { level: string; color: string; icon: React.ReactNode } => {
    if (score >= 80) {
      return {
        level: 'Excelente',
        color: 'text-green-600',
        icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      };
    } else if (score >= 60) {
      return {
        level: 'Bom',
        color: 'text-blue-600',
        icon: <Shield className="h-5 w-5 text-blue-600" />,
      };
    } else if (score >= 40) {
      return {
        level: 'Regular',
        color: 'text-yellow-600',
        icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
      };
    } else {
      return {
        level: 'Crítico',
        color: 'text-red-600',
        icon: <AlertTriangle className="h-5 w-5 text-red-600" />,
      };
    }
  };

  const securityScore = getSecurityScore();
  const securityLevel = getSecurityLevel(securityScore);
  const activeSessions = sessions.data?.filter(s => s.isActive) || [];
  const recentEvents = securityEvents.data?.slice(0, 5) || [];

  return (
    <div className={className}>
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="sessions">Sessões</TabsTrigger>
          <TabsTrigger value="events">Eventos</TabsTrigger>
          <TabsTrigger value="config">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Score de Segurança */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {securityLevel.icon}
                Score de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{securityScore}/100</span>
                  <Badge variant={securityScore >= 80 ? 'default' : securityScore >= 60 ? 'secondary' : 'destructive'}>
                    {securityLevel.level}
                  </Badge>
                </div>
                <Progress value={securityScore} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  Baseado em sessões ativas, tentativas de login e configurações de segurança.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Sessões Ativas</p>
                    <p className="text-2xl font-bold">{activeSessions.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium">Eventos Recentes</p>
                    <p className="text-2xl font-bold">{recentEvents.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Ban className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="text-sm font-medium">Tentativas Falhadas</p>
                    <p className="text-2xl font-bold">{failedAttempts.data?.count || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alertas de Segurança */}
          <SecurityAlerts />

          {/* Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Ações de Segurança</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleForceLogoutAll}
                  disabled={forceLogoutAllSessions.isPending}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Forçar Logout em Todas as Sessões
                </Button>
                <Button variant="outline" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Ativar 2FA
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Sessões</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeSessions.map((session) => {
                  const riskLevel = getSessionRiskLevel(session);
                  return (
                    <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{session.deviceInfo.name}</span>
                          <Badge
                            variant={
                              riskLevel === 'high'
                                ? 'destructive'
                                : riskLevel === 'medium'
                                ? 'secondary'
                                : 'default'
                            }
                          >
                            {riskLevel === 'high' ? 'Alto Risco' : riskLevel === 'medium' ? 'Médio Risco' : 'Baixo Risco'}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {session.locationInfo.city}, {session.locationInfo.country} • {session.ipAddress}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(session.lastActivity), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Eventos de Segurança Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <AlertTriangle className="h-4 w-4 mt-0.5 text-yellow-600" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{event.type}</span>
                        <Badge
                          variant={
                            event.severity === AlertSeverity.CRITICAL || event.severity === AlertSeverity.HIGH
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {event.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(event.timestamp), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                {recentEvents.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum evento de segurança recente.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Segurança</CardTitle>
            </CardHeader>
            <CardContent>
              {securityConfig.data && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Máximo de Tentativas Falhadas</label>
                      <p className="text-2xl font-bold">{securityConfig.data.maxFailedAttempts}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Duração do Bloqueio (min)</label>
                      <p className="text-2xl font-bold">{securityConfig.data.lockoutDuration}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Timeout de Sessão (min)</label>
                      <p className="text-2xl font-bold">{securityConfig.data.sessionTimeout}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sessões Simultâneas</label>
                      <p className="text-2xl font-bold">{securityConfig.data.maxConcurrentSessions}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {securityConfig.data.requireTwoFactor ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      )}
                      <span className="text-sm">
                        Autenticação de Dois Fatores: {securityConfig.data.requireTwoFactor ? 'Ativa' : 'Inativa'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}