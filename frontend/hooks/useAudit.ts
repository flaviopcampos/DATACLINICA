import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  UserAudit,
  UserAuditCreate,
  UserFilters,
  AUDIT_ACTIONS,
  RESOURCE_TYPES
} from '../types/users';
import { userService } from '../services/userService';

// Query keys
export const auditKeys = {
  all: ['audit'] as const,
  lists: () => [...auditKeys.all, 'list'] as const,
  list: (filters: UserFilters) => [...auditKeys.lists(), filters] as const,
  details: () => [...auditKeys.all, 'detail'] as const,
  detail: (id: number) => [...auditKeys.details(), id] as const,
  user: (userId: number) => [...auditKeys.all, 'user', userId] as const,
  userList: (userId: number, filters: UserFilters) => [...auditKeys.user(userId), filters] as const,
  resource: (resourceType: string, resourceId: number) => [
    ...auditKeys.all, 'resource', resourceType, resourceId
  ] as const,
  action: (action: string) => [...auditKeys.all, 'action', action] as const,
  dateRange: (startDate: string, endDate: string) => [
    ...auditKeys.all, 'dateRange', startDate, endDate
  ] as const,
};

// Hook for getting audit logs with filters
export function useAuditLogs(filters: UserFilters = {}) {
  return useQuery({
    queryKey: auditKeys.list(filters),
    queryFn: () => userService.getAuditLogs(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    keepPreviousData: true,
  });
}

// Hook for getting a single audit log
export function useAuditLog(id: number, enabled = true) {
  return useQuery({
    queryKey: auditKeys.detail(id),
    queryFn: () => userService.getAuditLogById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Hook for getting audit logs by user
export function useUserAuditLogs(userId: number, filters: UserFilters = {}, enabled = true) {
  return useQuery({
    queryKey: auditKeys.userList(userId, filters),
    queryFn: () => userService.getAuditLogs({ ...filters, user_id: userId }),
    enabled: enabled && !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    keepPreviousData: true,
  });
}

// Hook for getting audit logs by resource
export function useResourceAuditLogs(
  resourceType: string,
  resourceId: number,
  enabled = true
) {
  return useQuery({
    queryKey: auditKeys.resource(resourceType, resourceId),
    queryFn: () => userService.getAuditLogs({ 
      resource_type: resourceType,
      resource_id: resourceId 
    }),
    enabled: enabled && !!resourceType && !!resourceId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for getting audit logs by action
export function useActionAuditLogs(action: string, enabled = true) {
  return useQuery({
    queryKey: auditKeys.action(action),
    queryFn: () => userService.getAuditLogs({ action }),
    enabled: enabled && !!action,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for getting audit logs by date range
export function useDateRangeAuditLogs(
  startDate: string,
  endDate: string,
  enabled = true
) {
  return useQuery({
    queryKey: auditKeys.dateRange(startDate, endDate),
    queryFn: () => userService.getAuditLogs({ 
      start_date: startDate,
      end_date: endDate 
    }),
    enabled: enabled && !!startDate && !!endDate,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for creating audit log (usually done automatically by backend)
export function useCreateAuditLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (auditData: UserAuditCreate) => userService.createAuditLog(auditData),
    onSuccess: (newAudit) => {
      // Invalidate all audit queries to refresh the data
      queryClient.invalidateQueries({ queryKey: auditKeys.all });
      
      // Add the new audit to the cache
      queryClient.setQueryData(auditKeys.detail(newAudit.id), newAudit);
      
      toast.success('Log de auditoria criado com sucesso!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Erro ao criar log de auditoria';
      toast.error(message);
    },
  });
}

// Hook for audit statistics
export function useAuditStatistics(filters: UserFilters = {}) {
  return useQuery({
    queryKey: [...auditKeys.all, 'statistics', filters],
    queryFn: async () => {
      const auditLogs = await userService.getAuditLogs(filters);
      
      // Calculate statistics
      const totalLogs = auditLogs.total || 0;
      const logs = auditLogs.items || [];
      
      // Group by action
      const actionStats = logs.reduce((acc: Record<string, number>, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1;
        return acc;
      }, {});
      
      // Group by user
      const userStats = logs.reduce((acc: Record<string, number>, log) => {
        const userName = log.user?.full_name || log.user?.username || 'Usuário desconhecido';
        acc[userName] = (acc[userName] || 0) + 1;
        return acc;
      }, {});
      
      // Group by resource type
      const resourceStats = logs.reduce((acc: Record<string, number>, log) => {
        if (log.resource_type) {
          acc[log.resource_type] = (acc[log.resource_type] || 0) + 1;
        }
        return acc;
      }, {});
      
      // Group by date (last 7 days)
      const dateStats = logs.reduce((acc: Record<string, number>, log) => {
        const date = new Date(log.created_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});
      
      return {
        totalLogs,
        actionStats,
        userStats,
        resourceStats,
        dateStats,
        mostActiveUser: Object.entries(userStats).sort(([,a], [,b]) => b - a)[0]?.[0],
        mostCommonAction: Object.entries(actionStats).sort(([,a], [,b]) => b - a)[0]?.[0],
        mostAffectedResource: Object.entries(resourceStats).sort(([,a], [,b]) => b - a)[0]?.[0],
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Hook for audit utilities
export function useAuditUtils() {
  const queryClient = useQueryClient();

  // Format action display name
  const formatActionName = (action: string) => {
    const actionMap: Record<string, string> = {
      [AUDIT_ACTIONS.CREATE]: 'Criação',
      [AUDIT_ACTIONS.UPDATE]: 'Atualização',
      [AUDIT_ACTIONS.DELETE]: 'Exclusão',
      [AUDIT_ACTIONS.LOGIN]: 'Login',
      [AUDIT_ACTIONS.LOGOUT]: 'Logout',
      [AUDIT_ACTIONS.PASSWORD_CHANGE]: 'Alteração de Senha',
      [AUDIT_ACTIONS.PASSWORD_RESET]: 'Reset de Senha',
      [AUDIT_ACTIONS.ROLE_ASSIGN]: 'Atribuição de Perfil',
      [AUDIT_ACTIONS.ROLE_REMOVE]: 'Remoção de Perfil',
      [AUDIT_ACTIONS.PERMISSION_GRANT]: 'Concessão de Permissão',
      [AUDIT_ACTIONS.PERMISSION_REVOKE]: 'Revogação de Permissão',
      [AUDIT_ACTIONS.ACCOUNT_LOCK]: 'Bloqueio de Conta',
      [AUDIT_ACTIONS.ACCOUNT_UNLOCK]: 'Desbloqueio de Conta',
      [AUDIT_ACTIONS.SESSION_END]: 'Encerramento de Sessão',
      [AUDIT_ACTIONS.EXPORT]: 'Exportação',
      [AUDIT_ACTIONS.IMPORT]: 'Importação',
      [AUDIT_ACTIONS.VIEW]: 'Visualização',
      [AUDIT_ACTIONS.SEARCH]: 'Pesquisa',
    };
    
    return actionMap[action] || action;
  };

  // Format resource type display name
  const formatResourceTypeName = (resourceType: string) => {
    const resourceMap: Record<string, string> = {
      [RESOURCE_TYPES.USER]: 'Usuário',
      [RESOURCE_TYPES.ROLE]: 'Perfil',
      [RESOURCE_TYPES.PERMISSION]: 'Permissão',
      [RESOURCE_TYPES.MODULE]: 'Módulo',
      [RESOURCE_TYPES.PATIENT]: 'Paciente',
      [RESOURCE_TYPES.APPOINTMENT]: 'Consulta',
      [RESOURCE_TYPES.PRESCRIPTION]: 'Prescrição',
      [RESOURCE_TYPES.INVENTORY]: 'Estoque',
      [RESOURCE_TYPES.REPORT]: 'Relatório',
      [RESOURCE_TYPES.SYSTEM]: 'Sistema',
    };
    
    return resourceMap[resourceType] || resourceType;
  };

  // Get action color for UI
  const getActionColor = (action: string) => {
    const colorMap: Record<string, string> = {
      [AUDIT_ACTIONS.CREATE]: 'text-green-600',
      [AUDIT_ACTIONS.UPDATE]: 'text-blue-600',
      [AUDIT_ACTIONS.DELETE]: 'text-red-600',
      [AUDIT_ACTIONS.LOGIN]: 'text-green-500',
      [AUDIT_ACTIONS.LOGOUT]: 'text-gray-500',
      [AUDIT_ACTIONS.PASSWORD_CHANGE]: 'text-yellow-600',
      [AUDIT_ACTIONS.PASSWORD_RESET]: 'text-orange-600',
      [AUDIT_ACTIONS.ROLE_ASSIGN]: 'text-purple-600',
      [AUDIT_ACTIONS.ROLE_REMOVE]: 'text-red-500',
      [AUDIT_ACTIONS.PERMISSION_GRANT]: 'text-green-700',
      [AUDIT_ACTIONS.PERMISSION_REVOKE]: 'text-red-700',
      [AUDIT_ACTIONS.ACCOUNT_LOCK]: 'text-red-800',
      [AUDIT_ACTIONS.ACCOUNT_UNLOCK]: 'text-green-800',
      [AUDIT_ACTIONS.SESSION_END]: 'text-gray-600',
      [AUDIT_ACTIONS.EXPORT]: 'text-indigo-600',
      [AUDIT_ACTIONS.IMPORT]: 'text-cyan-600',
      [AUDIT_ACTIONS.VIEW]: 'text-gray-400',
      [AUDIT_ACTIONS.SEARCH]: 'text-gray-400',
    };
    
    return colorMap[action] || 'text-gray-600';
  };

  // Get action icon for UI
  const getActionIcon = (action: string) => {
    const iconMap: Record<string, string> = {
      [AUDIT_ACTIONS.CREATE]: 'Plus',
      [AUDIT_ACTIONS.UPDATE]: 'Edit',
      [AUDIT_ACTIONS.DELETE]: 'Trash2',
      [AUDIT_ACTIONS.LOGIN]: 'LogIn',
      [AUDIT_ACTIONS.LOGOUT]: 'LogOut',
      [AUDIT_ACTIONS.PASSWORD_CHANGE]: 'Key',
      [AUDIT_ACTIONS.PASSWORD_RESET]: 'RotateCcw',
      [AUDIT_ACTIONS.ROLE_ASSIGN]: 'UserPlus',
      [AUDIT_ACTIONS.ROLE_REMOVE]: 'UserMinus',
      [AUDIT_ACTIONS.PERMISSION_GRANT]: 'Shield',
      [AUDIT_ACTIONS.PERMISSION_REVOKE]: 'ShieldOff',
      [AUDIT_ACTIONS.ACCOUNT_LOCK]: 'Lock',
      [AUDIT_ACTIONS.ACCOUNT_UNLOCK]: 'Unlock',
      [AUDIT_ACTIONS.SESSION_END]: 'Power',
      [AUDIT_ACTIONS.EXPORT]: 'Download',
      [AUDIT_ACTIONS.IMPORT]: 'Upload',
      [AUDIT_ACTIONS.VIEW]: 'Eye',
      [AUDIT_ACTIONS.SEARCH]: 'Search',
    };
    
    return iconMap[action] || 'Activity';
  };

  // Format audit log description
  const formatAuditDescription = (audit: UserAudit) => {
    const actionName = formatActionName(audit.action);
    const resourceName = audit.resource_type ? formatResourceTypeName(audit.resource_type) : null;
    const userName = audit.user?.full_name || audit.user?.username || 'Usuário desconhecido';
    
    let description = `${userName} realizou ${actionName.toLowerCase()}`;
    
    if (resourceName && audit.resource_id) {
      description += ` em ${resourceName} (ID: ${audit.resource_id})`;
    } else if (resourceName) {
      description += ` de ${resourceName}`;
    }
    
    if (audit.details) {
      description += ` - ${audit.details}`;
    }
    
    return description;
  };

  // Check if audit log is recent (within last hour)
  const isRecentAudit = (audit: UserAudit) => {
    const auditTime = new Date(audit.created_at).getTime();
    const now = new Date().getTime();
    const oneHour = 60 * 60 * 1000;
    
    return (now - auditTime) < oneHour;
  };

  // Group audit logs by date
  const groupAuditsByDate = (audits: UserAudit[]) => {
    return audits.reduce((acc: Record<string, UserAudit[]>, audit) => {
      const date = new Date(audit.created_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(audit);
      return acc;
    }, {});
  };

  // Filter audits by severity (based on action type)
  const filterAuditsBySeverity = (audits: UserAudit[], severity: 'low' | 'medium' | 'high') => {
    const severityMap = {
      high: [AUDIT_ACTIONS.DELETE, AUDIT_ACTIONS.ACCOUNT_LOCK, AUDIT_ACTIONS.PERMISSION_REVOKE],
      medium: [AUDIT_ACTIONS.UPDATE, AUDIT_ACTIONS.ROLE_ASSIGN, AUDIT_ACTIONS.ROLE_REMOVE, AUDIT_ACTIONS.PASSWORD_RESET],
      low: [AUDIT_ACTIONS.CREATE, AUDIT_ACTIONS.VIEW, AUDIT_ACTIONS.SEARCH, AUDIT_ACTIONS.LOGIN, AUDIT_ACTIONS.LOGOUT]
    };
    
    return audits.filter(audit => severityMap[severity].includes(audit.action));
  };

  return {
    formatActionName,
    formatResourceTypeName,
    getActionColor,
    getActionIcon,
    formatAuditDescription,
    isRecentAudit,
    groupAuditsByDate,
    filterAuditsBySeverity,
  };
}

// Hook for audit management with common operations
export function useAuditManagement() {
  const createAuditLog = useCreateAuditLog();

  // Log user action (helper function)
  const logUserAction = async (
    action: string,
    resourceType?: string,
    resourceId?: number,
    details?: string
  ) => {
    try {
      await createAuditLog.mutateAsync({
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        details,
        ip_address: '', // Will be filled by backend
        user_agent: navigator.userAgent,
      });
    } catch (error) {
      console.error('Failed to log user action:', error);
    }
  };

  return {
    createAuditLog,
    logUserAction,
    isLoading: createAuditLog.isPending,
  };
}

export default {
  useAuditLogs,
  useAuditLog,
  useUserAuditLogs,
  useResourceAuditLogs,
  useActionAuditLogs,
  useDateRangeAuditLogs,
  useCreateAuditLog,
  useAuditStatistics,
  useAuditUtils,
  useAuditManagement,
  auditKeys,
};