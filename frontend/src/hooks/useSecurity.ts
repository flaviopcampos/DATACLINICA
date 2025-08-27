import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { securityService, SecurityAnalysis, LocationRisk, DeviceRisk, SecurityEvent } from '@/services/securityService';
import { Session, SessionAlert, AlertType, AlertSeverity, DeviceInfo, LocationInfo } from '@/types/sessions';
import { toast } from 'sonner';

interface UseSecurityOptions {
  sessionId?: string;
  userId?: string;
  autoRefresh?: boolean;
  refetchInterval?: number;
}

export function useSecurity(options: UseSecurityOptions = {}) {
  const queryClient = useQueryClient();
  const { sessionId, userId, autoRefresh = false, refetchInterval = 30000 } = options;

  // Análise de segurança de sessão
  const sessionAnalysis = useQuery({
    queryKey: ['security', 'session-analysis', sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      const session = await queryClient.getQueryData<Session>(['sessions', sessionId]);
      if (!session) return null;
      return securityService.analyzeSession(session);
    },
    enabled: !!sessionId,
    refetchInterval: autoRefresh ? refetchInterval : false,
  });

  // Eventos de segurança
  const securityEvents = useQuery({
    queryKey: ['security', 'events', { sessionId, userId }],
    queryFn: () => securityService.getSecurityEvents({ sessionId, userId }),
    refetchInterval: autoRefresh ? refetchInterval : false,
  });

  // Configurações de segurança
  const securityConfig = useQuery({
    queryKey: ['security', 'config'],
    queryFn: () => securityService.getSecurityConfig(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Tentativas de login falhadas
  const failedAttempts = useQuery({
    queryKey: ['security', 'failed-attempts'],
    queryFn: async () => {
      // Obter IP atual do usuário
      const response = await fetch('https://api.ipify.org?format=json');
      const { ip } = await response.json();
      return securityService.checkFailedLoginAttempts(ip);
    },
    refetchInterval: autoRefresh ? refetchInterval : false,
  });

  // Mutação para analisar risco de localização
  const analyzeLocationRisk = useMutation({
    mutationFn: ({ location, userId }: { location: LocationInfo; userId: string }) =>
      securityService.analyzeLocationRisk(location, userId),
    onSuccess: (data: LocationRisk) => {
      if (data.isUnusual && data.riskLevel === 'high') {
        toast.warning('Localização incomum detectada', {
          description: `Login de uma localização ${data.distance}km distante das usuais.`,
        });
      }
    },
    onError: (error) => {
      console.error('Erro ao analisar risco de localização:', error);
      toast.error('Erro ao analisar localização');
    },
  });

  // Mutação para analisar risco de dispositivo
  const analyzeDeviceRisk = useMutation({
    mutationFn: ({ device, userId }: { device: DeviceInfo; userId: string }) =>
      securityService.analyzeDeviceRisk(device, userId),
    onSuccess: (data: DeviceRisk) => {
      if (data.isNew && data.riskLevel === 'high') {
        toast.warning('Novo dispositivo detectado', {
          description: 'Login de um dispositivo não reconhecido.',
        });
      }
    },
    onError: (error) => {
      console.error('Erro ao analisar risco de dispositivo:', error);
      toast.error('Erro ao analisar dispositivo');
    },
  });

  // Mutação para detectar atividade suspeita
  const detectSuspiciousActivity = useMutation({
    mutationFn: (sessionId: string) => securityService.detectSuspiciousActivity(sessionId),
    onSuccess: (isSuspicious: boolean, sessionId: string) => {
      if (isSuspicious) {
        toast.error('Atividade suspeita detectada', {
          description: 'Sessão marcada para revisão de segurança.',
        });
        // Invalidar queries relacionadas
        queryClient.invalidateQueries({ queryKey: ['security'] });
        queryClient.invalidateQueries({ queryKey: ['sessions'] });
      }
    },
    onError: (error) => {
      console.error('Erro ao detectar atividade suspeita:', error);
      toast.error('Erro na detecção de segurança');
    },
  });

  // Mutação para criar alerta de segurança
  const createSecurityAlert = useMutation({
    mutationFn: ({
      type,
      severity,
      message,
      metadata,
    }: {
      type: AlertType;
      severity: AlertSeverity;
      message: string;
      metadata?: Record<string, any>;
    }) => securityService.createSecurityAlert(type, severity, message, metadata),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', 'alerts'] });
      toast.success('Alerta de segurança criado');
    },
    onError: (error) => {
      console.error('Erro ao criar alerta:', error);
      toast.error('Erro ao criar alerta de segurança');
    },
  });

  // Mutação para bloquear sessão suspeita
  const blockSuspiciousSession = useMutation({
    mutationFn: ({ sessionId, reason }: { sessionId: string; reason: string }) =>
      securityService.blockSuspiciousSession(sessionId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['security'] });
      toast.success('Sessão bloqueada por segurança');
    },
    onError: (error) => {
      console.error('Erro ao bloquear sessão:', error);
      toast.error('Erro ao bloquear sessão');
    },
  });

  // Mutação para desbloquear sessão
  const unblockSession = useMutation({
    mutationFn: (sessionId: string) => securityService.unblockSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['security'] });
      toast.success('Sessão desbloqueada');
    },
    onError: (error) => {
      console.error('Erro ao desbloquear sessão:', error);
      toast.error('Erro ao desbloquear sessão');
    },
  });

  // Mutação para forçar logout de todas as sessões
  const forceLogoutAllSessions = useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      securityService.forceLogoutAllSessions(userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['security'] });
      toast.success('Logout forçado em todas as sessões');
    },
    onError: (error) => {
      console.error('Erro ao forçar logout:', error);
      toast.error('Erro ao forçar logout');
    },
  });

  // Mutação para registrar evento de segurança
  const logSecurityEvent = useMutation({
    mutationFn: ({
      type,
      severity,
      description,
      metadata,
      sessionId,
    }: {
      type: string;
      severity: AlertSeverity;
      description: string;
      metadata: Record<string, any>;
      sessionId: string;
    }) => securityService.logSecurityEvent(type, severity, description, metadata, sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security', 'events'] });
    },
    onError: (error) => {
      console.error('Erro ao registrar evento:', error);
    },
  });

  // Mutação para verificar IP na lista negra
  const checkBlacklistedIP = useMutation({
    mutationFn: (ip: string) => securityService.checkBlacklistedIP(ip),
    onError: (error) => {
      console.error('Erro ao verificar IP:', error);
    },
  });

  // Mutação para adicionar IP à lista negra
  const addToBlacklist = useMutation({
    mutationFn: ({ ip, reason }: { ip: string; reason: string }) =>
      securityService.addToBlacklist(ip, reason),
    onSuccess: () => {
      toast.success('IP adicionado à lista negra');
    },
    onError: (error) => {
      console.error('Erro ao adicionar à lista negra:', error);
      toast.error('Erro ao adicionar IP à lista negra');
    },
  });

  // Mutação para remover IP da lista negra
  const removeFromBlacklist = useMutation({
    mutationFn: (ip: string) => securityService.removeFromBlacklist(ip),
    onSuccess: () => {
      toast.success('IP removido da lista negra');
    },
    onError: (error) => {
      console.error('Erro ao remover da lista negra:', error);
      toast.error('Erro ao remover IP da lista negra');
    },
  });

  // Mutação para resetar tentativas falhadas
  const resetFailedAttempts = useMutation({
    mutationFn: (ip: string) => securityService.resetFailedLoginAttempts(ip),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security', 'failed-attempts'] });
      toast.success('Tentativas falhadas resetadas');
    },
    onError: (error) => {
      console.error('Erro ao resetar tentativas:', error);
      toast.error('Erro ao resetar tentativas');
    },
  });

  // Mutação para atualizar configurações de segurança
  const updateSecurityConfig = useMutation({
    mutationFn: (config: Parameters<typeof securityService.updateSecurityConfig>[0]) =>
      securityService.updateSecurityConfig(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security', 'config'] });
      toast.success('Configurações de segurança atualizadas');
    },
    onError: (error) => {
      console.error('Erro ao atualizar configurações:', error);
      toast.error('Erro ao atualizar configurações de segurança');
    },
  });

  // Função utilitária para verificar se uma sessão é suspeita
  const isSessionSuspicious = (session: Session): boolean => {
    if (!sessionAnalysis.data) return false;
    return sessionAnalysis.data.isSuspicious || sessionAnalysis.data.riskScore > 70;
  };

  // Função utilitária para obter nível de risco de uma sessão
  const getSessionRiskLevel = (session: Session): 'low' | 'medium' | 'high' => {
    if (!sessionAnalysis.data) return 'low';
    const score = sessionAnalysis.data.riskScore;
    if (score >= 80) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  };

  return {
    // Queries
    sessionAnalysis,
    securityEvents,
    securityConfig,
    failedAttempts,

    // Mutations
    analyzeLocationRisk,
    analyzeDeviceRisk,
    detectSuspiciousActivity,
    createSecurityAlert,
    blockSuspiciousSession,
    unblockSession,
    forceLogoutAllSessions,
    logSecurityEvent,
    checkBlacklistedIP,
    addToBlacklist,
    removeFromBlacklist,
    resetFailedAttempts,
    updateSecurityConfig,

    // Utilities
    isSessionSuspicious,
    getSessionRiskLevel,
  };
}