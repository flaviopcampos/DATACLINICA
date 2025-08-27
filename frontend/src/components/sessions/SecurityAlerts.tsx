import React from 'react';
import { AlertTriangle, Shield, MapPin, Clock, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSessions } from '@/hooks/useSessions';
import { SessionAlert, AlertSeverity, AlertType } from '@/types/sessions';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SecurityAlertsProps {
  className?: string;
}

const getSeverityColor = (severity: AlertSeverity) => {
  switch (severity) {
    case AlertSeverity.CRITICAL:
      return 'destructive';
    case AlertSeverity.HIGH:
      return 'destructive';
    case AlertSeverity.MEDIUM:
      return 'default';
    case AlertSeverity.LOW:
      return 'secondary';
    default:
      return 'secondary';
  }
};

const getAlertIcon = (type: AlertType) => {
  switch (type) {
    case AlertType.SUSPICIOUS_LOGIN:
      return <AlertTriangle className="h-4 w-4" />;
    case AlertType.NEW_DEVICE:
      return <Shield className="h-4 w-4" />;
    case AlertType.UNUSUAL_LOCATION:
      return <MapPin className="h-4 w-4" />;
    case AlertType.SESSION_TIMEOUT:
      return <Clock className="h-4 w-4" />;
    case AlertType.MULTIPLE_SESSIONS:
      return <Shield className="h-4 w-4" />;
    case AlertType.SECURITY_BREACH:
      return <AlertTriangle className="h-4 w-4" />;
    default:
      return <AlertTriangle className="h-4 w-4" />;
  }
};

const getAlertTitle = (type: AlertType) => {
  switch (type) {
    case AlertType.SUSPICIOUS_LOGIN:
      return 'Login Suspeito';
    case AlertType.NEW_DEVICE:
      return 'Novo Dispositivo';
    case AlertType.UNUSUAL_LOCATION:
      return 'Localização Incomum';
    case AlertType.SESSION_TIMEOUT:
      return 'Sessão Expirada';
    case AlertType.MULTIPLE_SESSIONS:
      return 'Múltiplas Sessões';
    case AlertType.SECURITY_BREACH:
      return 'Violação de Segurança';
    default:
      return 'Alerta de Segurança';
  }
};

export function SecurityAlerts({ className }: SecurityAlertsProps) {
  const { alerts, dismissAlert, markAlertAsRead } = useSessions();

  const handleDismissAlert = async (alertId: string) => {
    try {
      await dismissAlert.mutateAsync(alertId);
    } catch (error) {
      console.error('Erro ao dispensar alerta:', error);
    }
  };

  const handleMarkAsRead = async (alertId: string) => {
    try {
      await markAlertAsRead.mutateAsync(alertId);
    } catch (error) {
      console.error('Erro ao marcar alerta como lido:', error);
    }
  };

  if (!alerts.data || alerts.data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Alertas de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhum alerta de segurança no momento.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Alertas de Segurança
          <Badge variant="destructive" className="ml-auto">
            {alerts.data.filter(alert => !alert.isRead).length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.data.map((alert: SessionAlert) => (
          <Alert
            key={alert.id}
            className={`relative ${
              !alert.isRead ? 'border-l-4 border-l-primary' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getAlertIcon(alert.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm">
                    {getAlertTitle(alert.type)}
                  </h4>
                  <Badge variant={getSeverityColor(alert.severity)} size="sm">
                    {alert.severity}
                  </Badge>
                </div>
                <AlertDescription className="text-sm mb-2">
                  {alert.message}
                </AlertDescription>
                {alert.metadata && (
                  <div className="text-xs text-muted-foreground space-y-1">
                    {alert.metadata.ip && (
                      <div>IP: {alert.metadata.ip}</div>
                    )}
                    {alert.metadata.location && (
                      <div>
                        Localização: {alert.metadata.location.city}, {alert.metadata.location.country}
                      </div>
                    )}
                    {alert.metadata.device && (
                      <div>Dispositivo: {alert.metadata.device}</div>
                    )}
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-2">
                  {formatDistanceToNow(new Date(alert.createdAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {!alert.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMarkAsRead(alert.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Shield className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDismissAlert(alert.id)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
}