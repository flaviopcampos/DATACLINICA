'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryReportService } from '@/services/inventoryService';
import { LowStockItem, ExpiringItem } from '@/types/inventory';
import { toast } from 'sonner';

interface AlertSettings {
  lowStockEnabled: boolean;
  expiringEnabled: boolean;
  expiringDays: number;
  emailNotifications: boolean;
  systemNotifications: boolean;
}

interface DismissedAlert {
  id: string;
  type: 'low_stock' | 'expiring';
  dismissedAt: Date;
  expiresAt: Date;
}

export function useStockAlerts() {
  const queryClient = useQueryClient();
  const [dismissedAlerts, setDismissedAlerts] = useState<DismissedAlert[]>([]);
  const [alertSettings, setAlertSettings] = useState<AlertSettings>({
    lowStockEnabled: true,
    expiringEnabled: true,
    expiringDays: 30,
    emailNotifications: true,
    systemNotifications: true
  });

  // Carregar configurações do localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('stockAlertSettings');
    if (savedSettings) {
      setAlertSettings(JSON.parse(savedSettings));
    }

    const savedDismissed = localStorage.getItem('dismissedStockAlerts');
    if (savedDismissed) {
      const parsed = JSON.parse(savedDismissed);
      // Filtrar alertas expirados
      const validAlerts = parsed.filter((alert: DismissedAlert) => 
        new Date(alert.expiresAt) > new Date()
      );
      setDismissedAlerts(validAlerts);
    }
  }, []);

  // Salvar configurações no localStorage
  useEffect(() => {
    localStorage.setItem('stockAlertSettings', JSON.stringify(alertSettings));
  }, [alertSettings]);

  // Salvar alertas dispensados no localStorage
  useEffect(() => {
    localStorage.setItem('dismissedStockAlerts', JSON.stringify(dismissedAlerts));
  }, [dismissedAlerts]);

  // Query para itens com estoque baixo
  const {
    data: lowStockItems = [],
    isLoading: isLoadingLowStock,
    error: lowStockError
  } = useQuery({
    queryKey: ['lowStockItems'],
    queryFn: inventoryReportService.getLowStockItems,
    enabled: alertSettings.lowStockEnabled,
    refetchInterval: 5 * 60 * 1000, // Refetch a cada 5 minutos
  });

  // Query para itens próximos ao vencimento
  const {
    data: expiringItems = [],
    isLoading: isLoadingExpiring,
    error: expiringError
  } = useQuery({
    queryKey: ['expiringItems', alertSettings.expiringDays],
    queryFn: () => inventoryReportService.getExpiringItems(alertSettings.expiringDays),
    enabled: alertSettings.expiringEnabled,
    refetchInterval: 5 * 60 * 1000, // Refetch a cada 5 minutos
  });

  // Removido mutations problemáticas que não existem no serviço

  // Filtrar alertas não dispensados
  const activeLowStockItems = lowStockItems.filter(item => 
    !dismissedAlerts.some(alert => 
      alert.id === item.product_id && 
      alert.type === 'low_stock' &&
      new Date(alert.expiresAt) > new Date()
    )
  );

  const activeExpiringItems = expiringItems.filter(item => 
    !dismissedAlerts.some(alert => 
      alert.id === `${item.product_id}-${item.batch_number}` && 
      alert.type === 'expiring' &&
      new Date(alert.expiresAt) > new Date()
    )
  );

  // Função para dispensar alerta
  const dismissAlert = (alertId: string, type: 'low_stock' | 'expiring') => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (24 * 60 * 60 * 1000)); // Expira em 24 horas
    
    const newDismissedAlert: DismissedAlert = {
      id: alertId,
      type,
      dismissedAt: now,
      expiresAt
    };

    setDismissedAlerts(prev => [...prev, newDismissedAlert]);
    toast.success('Alerta dispensado por 24 horas');
  };

  // Funções removidas pois dependiam de métodos inexistentes no serviço

  // Função para atualizar configurações
  const updateAlertSettings = (newSettings: Partial<AlertSettings>) => {
    setAlertSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Calcular estatísticas de alertas
  const alertStats = {
    totalAlerts: activeLowStockItems.length + activeExpiringItems.length,
    lowStockCount: activeLowStockItems.length,
    expiringCount: activeExpiringItems.length,
    criticalCount: activeExpiringItems.filter(item => {
      const expiry = new Date(item.expiry_date);
      const now = new Date();
      const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 7;
    }).length,
    dismissedCount: dismissedAlerts.filter(alert => 
      new Date(alert.expiresAt) > new Date()
    ).length
  };

  // Notificações do sistema
  useEffect(() => {
    if (!alertSettings.systemNotifications) return;

    const newCriticalAlerts = activeExpiringItems.filter(item => {
      const expiry = new Date(item.expiry_date);
      const now = new Date();
      const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 3; // Alertas críticos para produtos que vencem em 3 dias
    });

    if (newCriticalAlerts.length > 0) {
      newCriticalAlerts.forEach(item => {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Alerta Crítico de Vencimento', {
            body: `${item.product_name} (Lote: ${item.batch_number}) vence em breve!`,
            icon: '/favicon.ico',
            tag: `expiring-${item.product_id}-${item.batch_number}`
          });
        }
      });
    }
  }, [activeExpiringItems, alertSettings.systemNotifications]);

  // Solicitar permissão para notificações
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success('Notificações ativadas com sucesso!');
      }
    }
  };

  return {
    // Dados
    lowStockItems: activeLowStockItems,
    expiringItems: activeExpiringItems,
    alertStats,
    alertSettings,
    dismissedAlerts,
    
    // Estados de carregamento
    isLoading: isLoadingLowStock || isLoadingExpiring,
    isLoadingLowStock,
    isLoadingExpiring,
    
    // Erros
    error: lowStockError || expiringError,
    lowStockError,
    expiringError,
    
    // Ações
    dismissAlert,
    updateAlertSettings,
    requestNotificationPermission,
    
    // Funções utilitárias
    refreshAlerts: () => {
      queryClient.invalidateQueries({ queryKey: ['lowStockItems'] });
      queryClient.invalidateQueries({ queryKey: ['expiringItems'] });
    }
  };
}