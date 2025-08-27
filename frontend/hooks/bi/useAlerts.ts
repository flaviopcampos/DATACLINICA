'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  AlertRule, 
  AlertNotification, 
  AlertMetric, 
  AlertsFilters,
  AlertsStats,
  CreateAlertRuleRequest,
  UpdateAlertRuleRequest,
  AlertsState
} from '@/types/bi/alerts';
import { alertsService } from '@/services/bi/alertsService';

export interface UseAlertsReturn {
  // Estado
  rules: AlertRule[];
  notifications: AlertNotification[];
  metrics: AlertMetric[];
  stats: AlertsStats | null;
  isLoading: boolean;
  error: string | null;
  
  // Ações para regras
  createRule: (request: CreateAlertRuleRequest) => Promise<void>;
  updateRule: (request: UpdateAlertRuleRequest) => Promise<void>;
  deleteRule: (id: string) => Promise<void>;
  toggleRule: (id: string) => Promise<void>;
  
  // Ações para notificações
  markAsRead: (notificationId: string) => Promise<void>;
  markAsResolved: (notificationId: string, resolvedBy?: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  
  // Filtros e busca
  applyFilters: (filters: AlertsFilters) => void;
  clearFilters: () => void;
  
  // Refresh
  refresh: () => Promise<void>;
}

export function useAlerts(): UseAlertsReturn {
  const [state, setState] = useState<AlertsState>({
    rules: [],
    notifications: [],
    metrics: [],
    isLoading: true,
    error: null
  });
  
  const [stats, setStats] = useState<AlertsStats | null>(null);
  const [filters, setFilters] = useState<AlertsFilters | null>(null);
  const [allNotifications, setAllNotifications] = useState<AlertNotification[]>([]);

  // Carregar dados iniciais
  const loadData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const [rules, notifications, metrics, statsData] = await Promise.all([
        alertsService.getRules(),
        alertsService.getNotifications(),
        alertsService.getMetrics(),
        alertsService.getStats()
      ]);
      
      setAllNotifications(notifications);
      setStats(statsData);
      
      setState({
        rules,
        notifications: filters ? await alertsService.getNotifications(filters) : notifications,
        metrics,
        isLoading: false,
        error: null
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar alertas'
      }));
    }
  }, [filters]);

  // Configurar listener para notificações em tempo real
  useEffect(() => {
    const removeListener = alertsService.addListener((newNotifications) => {
      setAllNotifications(newNotifications);
      
      // Aplicar filtros se existirem
      if (filters) {
        alertsService.getNotifications(filters).then(filteredNotifications => {
          setState(prev => ({
            ...prev,
            notifications: filteredNotifications
          }));
        });
      } else {
        setState(prev => ({
          ...prev,
          notifications: newNotifications
        }));
      }
      
      // Atualizar estatísticas
      alertsService.getStats().then(setStats);
    });

    return removeListener;
  }, [filters]);

  // Carregar dados na inicialização
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Ações para regras
  const createRule = useCallback(async (request: CreateAlertRuleRequest) => {
    try {
      await alertsService.createRule(request);
      await loadData();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao criar regra'
      }));
      throw error;
    }
  }, [loadData]);

  const updateRule = useCallback(async (request: UpdateAlertRuleRequest) => {
    try {
      await alertsService.updateRule(request);
      await loadData();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao atualizar regra'
      }));
      throw error;
    }
  }, [loadData]);

  const deleteRule = useCallback(async (id: string) => {
    try {
      await alertsService.deleteRule(id);
      await loadData();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao excluir regra'
      }));
      throw error;
    }
  }, [loadData]);

  const toggleRule = useCallback(async (id: string) => {
    try {
      const rule = state.rules.find(r => r.id === id);
      if (!rule) throw new Error('Regra não encontrada');
      
      await alertsService.updateRule({
        id,
        isActive: !rule.isActive
      });
      
      await loadData();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao alterar status da regra'
      }));
      throw error;
    }
  }, [state.rules, loadData]);

  // Ações para notificações
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await alertsService.markAsRead(notificationId);
      // O listener já atualizará o estado
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao marcar como lida'
      }));
    }
  }, []);

  const markAsResolved = useCallback(async (notificationId: string, resolvedBy?: string) => {
    try {
      await alertsService.markAsResolved(notificationId, resolvedBy);
      // O listener já atualizará o estado
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao marcar como resolvida'
      }));
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const unreadNotifications = state.notifications.filter(n => !n.isRead);
      await Promise.all(
        unreadNotifications.map(n => alertsService.markAsRead(n.id))
      );
      // O listener já atualizará o estado
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao marcar todas como lidas'
      }));
    }
  }, [state.notifications]);

  // Filtros
  const applyFilters = useCallback((newFilters: AlertsFilters) => {
    setFilters(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(null);
  }, []);

  // Refresh
  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  return {
    // Estado
    rules: state.rules,
    notifications: state.notifications,
    metrics: state.metrics,
    stats,
    isLoading: state.isLoading,
    error: state.error,
    
    // Ações para regras
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
    
    // Ações para notificações
    markAsRead,
    markAsResolved,
    markAllAsRead,
    
    // Filtros
    applyFilters,
    clearFilters,
    
    // Refresh
    refresh
  };
}

// Hook específico para notificações não lidas
export function useUnreadAlerts() {
  const { notifications, stats, markAsRead, markAllAsRead } = useAlerts();
  
  const unreadNotifications = notifications.filter(n => !n.isRead);
  const unreadCount = stats?.unread || 0;
  
  return {
    notifications: unreadNotifications,
    count: unreadCount,
    markAsRead,
    markAllAsRead
  };
}

// Hook específico para alertas críticos
export function useCriticalAlerts() {
  const { notifications, stats } = useAlerts();
  
  const criticalNotifications = notifications.filter(
    n => n.severity === 'critical' && !n.isResolved
  );
  
  const criticalCount = criticalNotifications.length;
  
  return {
    notifications: criticalNotifications,
    count: criticalCount,
    hasCritical: criticalCount > 0
  };
}