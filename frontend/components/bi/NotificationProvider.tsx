'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  X,
  AlertCircle,
  Zap
} from 'lucide-react';
import { AlertNotification, AlertSeverity } from '@/types/bi/alerts';
import { useAlerts } from '@/hooks/bi/useAlerts';

interface NotificationContextType {
  showNotification: (notification: AlertNotification) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: React.ReactNode;
}

const severityConfig = {
  low: {
    icon: Info,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  medium: {
    icon: AlertCircle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  high: {
    icon: AlertTriangle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  critical: {
    icon: Zap,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  }
};

function NotificationToast({ 
  notification, 
  onMarkAsRead 
}: {
  notification: AlertNotification;
  onMarkAsRead: (id: string) => void;
}) {
  const config = severityConfig[notification.severity];
  const Icon = config.icon;
  
  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border ${config.bgColor} ${config.borderColor} max-w-md`}>
      <div className={`p-2 rounded-full ${config.color}`}>
        <Icon className="h-4 w-4" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-medium text-sm text-gray-900">
            {notification.title}
          </h4>
          <button
            onClick={() => onMarkAsRead(notification.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <p className="text-sm text-gray-700 mb-2">
          {notification.message}
        </p>
        
        <div className="flex items-center justify-between">
          <span className={`text-xs font-medium px-2 py-1 rounded ${config.color} ${config.bgColor}`}>
            {notification.severity.toUpperCase()}
          </span>
          
          <button
            onClick={() => onMarkAsRead(notification.id)}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            Marcar como lida
          </button>
        </div>
      </div>
    </div>
  );
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [isEnabled, setIsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastNotificationId, setLastNotificationId] = useState<string | null>(null);
  
  const { notifications, markAsRead } = useAlerts();
  
  // Função para reproduzir som de notificação
  const playNotificationSound = useCallback((severity: AlertSeverity) => {
    if (!soundEnabled) return;
    
    try {
      // Criar diferentes tons baseados na severidade
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Configurar frequência baseada na severidade
      const frequencies = {
        low: 440,      // A4
        medium: 523,   // C5
        high: 659,     // E5
        critical: 880  // A5
      };
      
      oscillator.frequency.setValueAtTime(frequencies[severity], audioContext.currentTime);
      oscillator.type = severity === 'critical' ? 'sawtooth' : 'sine';
      
      // Configurar volume baseado na severidade
      const volumes = {
        low: 0.1,
        medium: 0.2,
        high: 0.3,
        critical: 0.4
      };
      
      gainNode.gain.setValueAtTime(volumes[severity], audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      
      // Para alertas críticos, tocar duas vezes
      if (severity === 'critical') {
        setTimeout(() => {
          const oscillator2 = audioContext.createOscillator();
          const gainNode2 = audioContext.createGain();
          
          oscillator2.connect(gainNode2);
          gainNode2.connect(audioContext.destination);
          
          oscillator2.frequency.setValueAtTime(frequencies[severity], audioContext.currentTime);
          oscillator2.type = 'sawtooth';
          
          gainNode2.gain.setValueAtTime(volumes[severity], audioContext.currentTime);
          gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
          
          oscillator2.start(audioContext.currentTime);
          oscillator2.stop(audioContext.currentTime + 0.5);
        }, 600);
      }
    } catch (error) {
      console.warn('Não foi possível reproduzir som de notificação:', error);
    }
  }, [soundEnabled]);
  
  // Função para mostrar notificação
  const showNotification = useCallback((notification: AlertNotification) => {
    if (!isEnabled) return;
    
    // Reproduzir som
    playNotificationSound(notification.severity);
    
    // Mostrar toast personalizado
    const toastId = toast.custom(
      <NotificationToast 
        notification={notification} 
        onMarkAsRead={(id) => {
          markAsRead(id);
          toast.dismiss(toastId);
        }}
      />,
      {
        duration: notification.severity === 'critical' ? 10000 : 
                 notification.severity === 'high' ? 7000 : 
                 notification.severity === 'medium' ? 5000 : 4000,
        position: 'top-right'
      }
    );
    
    // Notificação do navegador (se permitida)
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.severity === 'critical'
      });
      
      browserNotification.onclick = () => {
        window.focus();
        browserNotification.close();
        markAsRead(notification.id);
      };
      
      // Auto-fechar após um tempo
      setTimeout(() => {
        browserNotification.close();
      }, notification.severity === 'critical' ? 10000 : 5000);
    }
  }, [isEnabled, playNotificationSound, markAsRead]);
  
  // Função para mostrar toast simples
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const icons = {
      success: CheckCircle,
      error: AlertTriangle,
      warning: AlertCircle,
      info: Info
    };
    
    const colors = {
      success: 'text-green-600',
      error: 'text-red-600',
      warning: 'text-yellow-600',
      info: 'text-blue-600'
    };
    
    const Icon = icons[type];
    
    toast.custom(
      <div className="flex items-center gap-3 p-4 bg-white rounded-lg border shadow-lg">
        <Icon className={`h-5 w-5 ${colors[type]}`} />
        <span className="text-sm text-gray-900">{message}</span>
      </div>,
      {
        duration: 3000,
        position: 'bottom-right'
      }
    );
  }, []);
  
  // Monitorar novas notificações
  useEffect(() => {
    if (notifications.length === 0) return;
    
    // Pegar a notificação mais recente que ainda não foi processada
    const latestNotification = notifications
      .filter(n => !n.isRead)
      .sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime())[0];
    
    if (latestNotification && latestNotification.id !== lastNotificationId) {
      setLastNotificationId(latestNotification.id);
      showNotification(latestNotification);
    }
  }, [notifications, lastNotificationId, showNotification]);
  
  // Solicitar permissão para notificações do navegador
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);
  
  const contextValue: NotificationContextType = {
    showNotification,
    showToast,
    isEnabled,
    setEnabled: setIsEnabled,
    soundEnabled,
    setSoundEnabled
  };
  
  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications deve ser usado dentro de um NotificationProvider');
  }
  return context;
}

export default NotificationProvider;