import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  SessionActivity,
  TerminateSessionModal 
} from '@/components/sessions';
import { useSessions } from '@/hooks/useSessions';
import { useSessionActivity } from '@/hooks/useSessionActivity';
import { 
  ArrowLeft, 
  Shield, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Globe, 
  MapPin, 
  Clock, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Wifi,
  Lock,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import { Session, DeviceType, SessionStatus, SecurityLevel } from '@/types/sessions';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function SessionDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showTerminateModal, setShowTerminateModal] = useState(false);

  const { 
    data: sessions, 
    isLoading: sessionsLoading,
    error: sessionsError
  } = useSessions();

  const {
    activities,
    isLoading: activitiesLoading
  } = useSessionActivity({ 
    sessionId: id,
    limit: 100 
  });

  const session = sessions?.find((s: Session) => s.id === id);

  const getDeviceIcon = (deviceType: DeviceType) => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'tablet': return <Tablet className="h-4 w-4" />;
      case 'desktop': return <Monitor className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: SessionStatus) => {
    const variants: Record<SessionStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactElement }> = {
      [SessionStatus.ACTIVE]: { variant: 'default' as const, icon: <CheckCircle className="h-3 w-3" /> },
      [SessionStatus.SUSPENDED]: { variant: 'secondary' as const, icon: <Clock className="h-3 w-3" /> },
      [SessionStatus.EXPIRED]: { variant: 'destructive' as const, icon: <XCircle className="h-3 w-3" /> },
      [SessionStatus.TERMINATED]: { variant: 'outline' as const, icon: <XCircle className="h-3 w-3" /> }
    };

    const config = variants[status];
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {status === SessionStatus.ACTIVE ? 'Ativa' : 
         status === SessionStatus.SUSPENDED ? 'Suspensa' :
         status === SessionStatus.EXPIRED ? 'Expirada' : 'Encerrada'}
      </Badge>
    );
  };

  const getSecurityLevelBadge = (level: SecurityLevel) => {
    const variants: Record<SecurityLevel, { variant: 'destructive' | 'secondary' | 'default', text: string }> = {
      low: { variant: 'destructive' as const, text: 'Baixo' },
      medium: { variant: 'secondary' as const, text: 'Médio' },
      high: { variant: 'default' as const, text: 'Alto' },
      critical: { variant: 'destructive' as const, text: 'Crítico' }
    };

    const config = variants[level];
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Shield className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const calculateSessionDuration = (session: Session) => {
    const start = new Date(session.createdAt);
    const end = session.lastActivity ? new Date(session.lastActivity) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getSecurityScore = (session: Session) => {
    // Use securityScore if available, otherwise calculate
    if (session.securityScore) {
      return session.securityScore;
    }
    
    let score = 100;
    
    // Penalizar por localização suspeita
    if (session.location?.isUsual === false) score -= 30;
    
    // Penalizar por dispositivo não confiável
    if (!session.deviceInfo?.isTrusted) score -= 20;
    
    // Penalizar por nível de risco alto
    if (session.riskLevel === 'high') score -= 25;
    else if (session.riskLevel === 'medium') score -= 10;
    
    // Penalizar por inatividade prolongada
    if (session.lastActivity) {
      const inactiveHours = (Date.now() - new Date(session.lastActivity).getTime()) / (1000 * 60 * 60);
      if (inactiveHours > 24) score -= 15;
      else if (inactiveHours > 12) score -= 10;
    }
    
    return Math.max(0, score);
  };

  if (sessionsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (sessionsError || !session) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {sessionsError ? 'Erro ao carregar sessão.' : 'Sessão não encontrada.'}
          </AlertDescription>
        </Alert>
        <Button 
          variant="outline" 
          onClick={() => navigate('/sessions')}
          className="mt-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Sessões
        </Button>
      </div>
    );
  }

  const securityScore = getSecurityScore(session);

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/sessions')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Detalhes da Sessão</h1>
            <p className="text-muted-foreground">
              {session.deviceInfo.name} • {session.location?.city}, {session.location?.country}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {session.status === SessionStatus.ACTIVE && (
            <Button 
              variant="destructive"
              onClick={() => setShowTerminateModal(true)}
            >
              Encerrar Sessão
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Session Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getDeviceIcon(session.deviceInfo.type)}
                Informações da Sessão
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    {getStatusBadge(session.status)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Duração</label>
                  <p className="mt-1 font-medium">{calculateSessionDuration(session)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Criada em</label>
                  <p className="mt-1">
                    {format(new Date(session.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Última atividade</label>
                  <p className="mt-1">
                    {session.lastActivity ? 
                      formatDistanceToNow(new Date(session.lastActivity), { 
                        addSuffix: true, 
                        locale: ptBR 
                      }) : 'Nunca'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Device Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getDeviceIcon(session.deviceInfo.type)}
                Dispositivo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nome</label>
                  <p className="mt-1 font-medium">{session.deviceInfo.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                  <p className="mt-1 capitalize">{session.deviceInfo.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Sistema Operacional</label>
                  <p className="mt-1">{session.deviceInfo.os}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Navegador</label>
                  <p className="mt-1">{session.deviceInfo.browser}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {session.deviceInfo.isTrusted ? (
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Dispositivo Confiável
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Dispositivo Não Confiável
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Location Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Localização
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">IP</label>
                  <p className="mt-1 font-mono">{session.ipAddress}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">País</label>
                  <p className="mt-1">{session.location?.country}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Cidade</label>
                  <p className="mt-1">{session.location?.city}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Região</label>
                  <p className="mt-1">{session.location?.region}</p>
                </div>
              </div>
              {session.location?.isUsual === false && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Esta localização não é usual para este usuário.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Security Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Pontuação de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">{securityScore}%</div>
                <Progress value={securityScore} className="mb-2" />
                <p className="text-sm text-muted-foreground">
                  {securityScore >= 80 ? 'Excelente' :
                   securityScore >= 60 ? 'Boa' :
                   securityScore >= 40 ? 'Regular' : 'Baixa'}
                </p>
              </div>
              <div className="space-y-2">
                {getSecurityLevelBadge(session.riskLevel as unknown as SecurityLevel)}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {session.status === 'active' && (
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={() => setShowTerminateModal(true)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Encerrar Sessão
                </Button>
              )}
              <Button variant="outline" className="w-full">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Reportar como Suspeita
              </Button>
              {!session.deviceInfo.isTrusted && (
                <Button variant="outline" className="w-full">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Marcar como Confiável
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Session Activity */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Atividade da Sessão
          </CardTitle>
          <CardDescription>
            Histórico detalhado das atividades desta sessão
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SessionActivity 
            sessionId={id}

            showFilters={false}
          />
        </CardContent>
      </Card>

      {/* Terminate Session Modal */}
      <TerminateSessionModal
        isOpen={showTerminateModal}
        onClose={() => setShowTerminateModal(false)}
        sessions={session ? [session] : []}
        mode="single"
        onConfirm={async (sessionIds: string[], reportSuspicious?: boolean) => {
          // Implementar lógica de encerramento
          setShowTerminateModal(false);
        }}
      />
    </div>
  );
}

export default SessionDetails;