'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  MapPin,
  Clock,
  Shield,
  X
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Session, DeviceType, SessionStatus } from '@/types/sessions';

interface TerminateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (sessionIds: string[], reportSuspicious?: boolean) => Promise<void>;
  session?: Session;
  sessions?: Session[];
  mode: 'single' | 'multiple' | 'all-others';
  isLoading?: boolean;
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
      return Globe;
  }
}

function getDeviceTypeText(deviceType: DeviceType) {
  switch (deviceType) {
    case DeviceType.DESKTOP:
      return 'Desktop';
    case DeviceType.MOBILE:
      return 'Mobile';
    case DeviceType.TABLET:
      return 'Tablet';
    default:
      return 'Desconhecido';
  }
}

function getStatusColor(status: SessionStatus) {
  switch (status) {
    case SessionStatus.ACTIVE:
      return 'bg-green-100 text-green-800';
    case SessionStatus.INACTIVE:
      return 'bg-yellow-100 text-yellow-800';
    case SessionStatus.EXPIRED:
      return 'bg-red-100 text-red-800';
    case SessionStatus.TERMINATED:
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
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
      return 'Desconhecido';
  }
}

export function TerminateSessionModal({
  isOpen,
  onClose,
  session,
  sessions = [],
  mode,
  onConfirm,
  isLoading = false
}: TerminateSessionModalProps) {
  const [reportSuspicious, setReportSuspicious] = useState(false);
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);

  const handleConfirm = async () => {
    let sessionIds: string[] = [];
    
    switch (mode) {
      case 'single':
        if (session) {
          sessionIds = [session.id];
        }
        break;
      case 'multiple':
        sessionIds = selectedSessions;
        break;
      case 'all-others':
        sessionIds = sessions
          .filter(s => !s.is_current)
          .map(s => s.id);
        break;
    }
    
    if (sessionIds.length > 0) {
      await onConfirm(sessionIds, reportSuspicious);
    }
  };

  const handleSessionToggle = (sessionId: string, checked: boolean) => {
    if (checked) {
      setSelectedSessions(prev => [...prev, sessionId]);
    } else {
      setSelectedSessions(prev => prev.filter(id => id !== sessionId));
    }
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'single':
        return 'Encerrar Sessão';
      case 'multiple':
        return 'Encerrar Sessões Selecionadas';
      case 'all-others':
        return 'Encerrar Todas as Outras Sessões';
      default:
        return 'Encerrar Sessão';
    }
  };

  const getModalDescription = () => {
    switch (mode) {
      case 'single':
        return 'Tem certeza de que deseja encerrar esta sessão? O usuário será desconectado imediatamente.';
      case 'multiple':
        return `Tem certeza de que deseja encerrar ${selectedSessions.length} sessões selecionadas? Os usuários serão desconectados imediatamente.`;
      case 'all-others':
        const otherSessions = sessions.filter(s => !s.is_current);
        return `Tem certeza de que deseja encerrar todas as outras ${otherSessions.length} sessões? Você permanecerá conectado apenas na sessão atual.`;
      default:
        return 'Esta ação não pode ser desfeita.';
    }
  };

  const getSessionsToShow = () => {
    switch (mode) {
      case 'single':
        return session ? [session] : [];
      case 'multiple':
        return sessions.filter(s => selectedSessions.includes(s.id));
      case 'all-others':
        return sessions.filter(s => !s.is_current);
      default:
        return [];
    }
  };

  const sessionsToShow = getSessionsToShow();
  const canConfirm = mode === 'single' ? !!session : 
                    mode === 'multiple' ? selectedSessions.length > 0 :
                    sessions.filter(s => !s.isCurrentSession).length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span>{getModalTitle()}</span>
          </DialogTitle>
          <DialogDescription className="text-base">
            {getModalDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Multiple sessions selection */}
          {mode === 'multiple' && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-900">
                Selecione as sessões para encerrar:
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {sessions.filter(s => !s.isCurrentSession).map((sessionItem) => {
                  const DeviceIcon = getDeviceIcon(sessionItem.deviceInfo.type);
                  const isSelected = selectedSessions.includes(sessionItem.id);
                  
                  return (
                    <div
                      key={sessionItem.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleSessionToggle(sessionItem.id, !isSelected)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => 
                          handleSessionToggle(sessionItem.id, checked as boolean)
                        }
                      />
                      
                      <div className="flex items-center space-x-2 flex-1">
                        <DeviceIcon className="h-4 w-4 text-gray-600" />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm">
                              {sessionItem.deviceInfo.name || getDeviceTypeText(sessionItem.deviceInfo.type)}
                            </span>
                            <Badge variant="outline" className={getStatusColor(sessionItem.status)}>
                              {getStatusText(sessionItem.status)}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {sessionItem.ipAddress} • {sessionItem.location.city}, {sessionItem.location.country}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sessions details */}
          {sessionsToShow.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-900">
                {mode === 'single' ? 'Detalhes da Sessão:' : 
                 mode === 'all-others' ? 'Sessões que serão encerradas:' :
                 'Sessões selecionadas:'}
              </h4>
              
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {sessionsToShow.map((sessionItem) => {
                  const DeviceIcon = getDeviceIcon(sessionItem.deviceInfo.type);
                  
                  return (
                    <div key={sessionItem.id} className="p-4 rounded-lg border bg-gray-50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <DeviceIcon className="h-5 w-5 text-gray-600" />
                          <div>
                            <h5 className="font-medium text-sm">
                              {sessionItem.deviceInfo.name || getDeviceTypeText(sessionItem.deviceInfo.type)}
                            </h5>
                            <p className="text-xs text-gray-500">
                              {sessionItem.deviceInfo.os} • {sessionItem.deviceInfo.browser}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className={getStatusColor(sessionItem.status)}>
                            {getStatusText(sessionItem.status)}
                          </Badge>
                          {sessionItem.isCurrentSession && (
                            <Badge variant="outline" className="bg-blue-100 text-blue-800">
                              Atual
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="flex items-center space-x-2">
                          <Globe className="h-3 w-3 text-gray-400" />
                          <span>{sessionItem.ipAddress}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span>{sessionItem.location.city}, {sessionItem.location.country}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span>
                            {formatDistanceToNow(new Date(sessionItem.lastActivity), {
                              addSuffix: true,
                              locale: ptBR
                            })}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Shield className="h-3 w-3 text-gray-400" />
                          <span>Nível {sessionItem.riskLevel}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <Separator />

          {/* Report suspicious activity option */}
          <div className="flex items-start space-x-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
            <Checkbox
              id="report-suspicious"
              checked={reportSuspicious}
              onCheckedChange={setReportSuspicious}
            />
            <div className="flex-1">
              <label
                htmlFor="report-suspicious"
                className="text-sm font-medium text-yellow-800 cursor-pointer"
              >
                Reportar como atividade suspeita
              </label>
              <p className="text-xs text-yellow-700 mt-1">
                Marque esta opção se você suspeita que esta(s) sessão(ões) podem ter sido comprometidas.
                Isso criará um alerta de segurança e pode acionar medidas adicionais de proteção.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!canConfirm || isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span>Encerrando...</span>
              </div>
            ) : (
              'Encerrar Sessão'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TerminateSessionModal;