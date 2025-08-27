'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Monitor,
  Smartphone,
  Tablet,
  MapPin,
  Clock,
  Shield,
  AlertTriangle,
  LogOut,
  MoreVertical,
  Wifi,
  Globe
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import type { Session, DeviceType, SessionStatus } from '@/types/sessions';

interface SessionCardProps {
  session: Session;
  isCurrentSession?: boolean;
  onTerminate?: (sessionId: string) => void;
  onViewDetails?: (sessionId: string) => void;
  onReportSuspicious?: (sessionId: string) => void;
  onTrustDevice?: (sessionId: string) => void;
  className?: string;
}

function getDeviceIcon(deviceType: DeviceType) {
  switch (deviceType) {
    case DeviceType.DESKTOP:
      return Monitor;
    case DeviceType.MOBILE:
      return Smartphone;
    case DeviceType.TABLET:
      return Tablet;
    default:
      return Monitor;
  }
}

function getStatusColor(status: SessionStatus) {
  switch (status) {
    case SessionStatus.ACTIVE:
      return 'bg-green-100 text-green-800 border-green-200';
    case SessionStatus.INACTIVE:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case SessionStatus.EXPIRED:
      return 'bg-red-100 text-red-800 border-red-200';
    case SessionStatus.TERMINATED:
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

function getStatusText(status: SessionStatus) {
  switch (status) {
    case SessionStatus.ACTIVE:
      return 'Ativa';
    case SessionStatus.INACTIVE:
      return 'Inativa';
    case SessionStatus.EXPIRED:
      return 'Expirada';
    case SessionStatus.TERMINATED:
      return 'Encerrada';
    default:
      return 'Desconhecida';
  }
}

export function SessionCard({
  session,
  isCurrentSession = false,
  onTerminate,
  onViewDetails,
  onReportSuspicious,
  onTrustDevice,
  className = ''
}: SessionCardProps) {
  const [showTerminateDialog, setShowTerminateDialog] = useState(false);
  const [isTerminating, setIsTerminating] = useState(false);

  const DeviceIcon = getDeviceIcon(session.device_info.device_type);
  const isActive = session.status === SessionStatus.ACTIVE;
  const isSuspicious = session.is_suspicious;

  const handleTerminate = async () => {
    if (!onTerminate) return;
    
    setIsTerminating(true);
    try {
      await onTerminate(session.id);
      toast.success('Sessão encerrada com sucesso');
    } catch (error) {
      toast.error('Erro ao encerrar sessão');
    } finally {
      setIsTerminating(false);
      setShowTerminateDialog(false);
    }
  };

  const formatLastActivity = (date: string) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: ptBR
    });
  };

  return (
    <>
      <Card className={`transition-all duration-200 hover:shadow-md ${
        isCurrentSession ? 'ring-2 ring-blue-500 bg-blue-50/50' : ''
      } ${isSuspicious ? 'border-red-200 bg-red-50/30' : ''} ${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
              }`}>
                <DeviceIcon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-gray-900 truncate">
                    {session.device_info.device_name || 'Dispositivo Desconhecido'}
                  </h3>
                  {isCurrentSession && (
                    <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                      Atual
                    </Badge>
                  )}
                  {isSuspicious && (
                    <Badge variant="outline" className="text-xs bg-red-100 text-red-800 border-red-200">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Suspeita
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {session.device_info.browser} • {session.device_info.os}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(session.status)}>
                {getStatusText(session.status)}
              </Badge>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onViewDetails && (
                    <DropdownMenuItem onClick={() => onViewDetails(session.id)}>
                      <Monitor className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </DropdownMenuItem>
                  )}
                  {onTrustDevice && !session.device_info.is_trusted && (
                    <DropdownMenuItem onClick={() => onTrustDevice(session.id)}>
                      <Shield className="h-4 w-4 mr-2" />
                      Confiar no Dispositivo
                    </DropdownMenuItem>
                  )}
                  {onReportSuspicious && (
                    <DropdownMenuItem onClick={() => onReportSuspicious(session.id)}>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Reportar como Suspeita
                    </DropdownMenuItem>
                  )}
                  {onTerminate && isActive && !isCurrentSession && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => setShowTerminateDialog(true)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Encerrar Sessão
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {/* Location Info */}
            <div className="flex items-center space-x-2 text-gray-600">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">
                {session.location_info.city}, {session.location_info.country}
              </span>
            </div>
            
            {/* IP Address */}
            <div className="flex items-center space-x-2 text-gray-600">
              <Globe className="h-4 w-4 flex-shrink-0" />
              <span className="font-mono text-xs">
                {session.ip_address}
              </span>
            </div>
            
            {/* Last Activity */}
            <div className="flex items-center space-x-2 text-gray-600">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span>
                {formatLastActivity(session.last_activity)}
              </span>
            </div>
            
            {/* Connection Type */}
            <div className="flex items-center space-x-2 text-gray-600">
              <Wifi className="h-4 w-4 flex-shrink-0" />
              <span>
                {session.device_info.connection_type || 'Desconhecido'}
              </span>
            </div>
          </div>
          
          {/* Security Level */}
          {session.security_level && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Nível de Segurança:</span>
                <Badge variant="outline" className={`text-xs ${
                  session.security_level === 'HIGH' ? 'bg-green-100 text-green-800 border-green-200' :
                  session.security_level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                  'bg-red-100 text-red-800 border-red-200'
                }`}>
                  {session.security_level === 'HIGH' ? 'Alto' :
                   session.security_level === 'MEDIUM' ? 'Médio' : 'Baixo'}
                </Badge>
              </div>
            </div>
          )}
          
          {/* Trusted Device Indicator */}
          {session.device_info.is_trusted && (
            <div className="mt-2 flex items-center space-x-2 text-green-600">
              <Shield className="h-4 w-4" />
              <span className="text-sm">Dispositivo Confiável</span>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Terminate Session Dialog */}
      <AlertDialog open={showTerminateDialog} onOpenChange={setShowTerminateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Encerrar Sessão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja encerrar esta sessão? Esta ação não pode ser desfeita e o usuário será desconectado imediatamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleTerminate}
              disabled={isTerminating}
              className="bg-red-600 hover:bg-red-700"
            >
              {isTerminating ? 'Encerrando...' : 'Encerrar Sessão'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default SessionCard;