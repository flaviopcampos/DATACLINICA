'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { sessionService } from '@/services/sessionService';
import type {
  SessionActivity,
  ActivityType
} from '@/types/sessions';

interface UseSessionActivityOptions {
  sessionId?: string;
  userId?: string;
  page?: number;
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
  realTimeUpdates?: boolean;
}

export function useSessionActivity(options: UseSessionActivityOptions = {}) {
  const {
    sessionId,
    userId,
    page = 1,
    limit = 20,
    autoRefresh = true,
    refreshInterval = 10000, // 10 seconds
    realTimeUpdates = false
  } = options;

  const queryClient = useQueryClient();
  const [realtimeActivities, setRealtimeActivities] = useState<SessionActivity[]>([]);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Get session activities
  const {
    data: activitiesData,
    isLoading: isLoadingActivities,
    error: activitiesError,
    refetch: refetchActivities
  } = useQuery({
    queryKey: ['session-activities', sessionId, userId, page, limit],
    queryFn: () => {
      if (sessionId) {
        return sessionService.getSessionActivities(sessionId, page, limit);
      } else if (userId) {
        return sessionService.getUserActivities(userId, page, limit);
      }
      throw new Error('Either sessionId or userId must be provided');
    },
    enabled: !!(sessionId || userId),
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 5000 // 5 seconds
  });

  // Log activity mutation
  const logActivityMutation = useMutation({
    mutationFn: ({ sessionId, activity }: { 
      sessionId: string; 
      activity: Omit<SessionActivity, 'id' | 'timestamp'> 
    }) => sessionService.logActivity(sessionId, activity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-activities'] });
    },
    onError: (error: any) => {
      console.error('Failed to log activity:', error);
    }
  });

  // Setup real-time updates
  useEffect(() => {
    if (realTimeUpdates && sessionId) {
      const setupRealtimeUpdates = async () => {
        try {
          const unsubscribe = await sessionService.subscribeToActivityUpdates(
            sessionId,
            (activity: SessionActivity) => {
              setRealtimeActivities(prev => [activity, ...prev.slice(0, 49)]); // Keep last 50
              
              // Show toast for important activities
              if (activity.activity_type === 'LOGIN' || 
                  activity.activity_type === 'SUSPICIOUS_ACTIVITY') {
                toast.info(`Nova atividade: ${activity.description}`);
              }
            }
          );
          unsubscribeRef.current = unsubscribe;
        } catch (error) {
          console.error('Failed to setup real-time updates:', error);
        }
      };

      setupRealtimeUpdates();
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [realTimeUpdates, sessionId]);

  // Helper functions
  const logActivity = useCallback((activity: Omit<SessionActivity, 'id' | 'timestamp'>) => {
    if (!sessionId) {
      console.warn('Cannot log activity without sessionId');
      return;
    }
    logActivityMutation.mutate({ sessionId, activity });
  }, [sessionId, logActivityMutation]);

  const logPageView = useCallback((page: string, details?: Record<string, any>) => {
    logActivity({
      session_id: sessionId || '',
      activity_type: ActivityType.PAGE_VIEW,
      description: `Visualizou página: ${page}`,
      ip_address: '', // Will be filled by backend
      details: { page, ...details }
    });
  }, [logActivity, sessionId]);

  const logApiCall = useCallback((endpoint: string, method: string, details?: Record<string, any>) => {
    logActivity({
      session_id: sessionId || '',
      activity_type: ActivityType.API_CALL,
      description: `${method.toUpperCase()} ${endpoint}`,
      ip_address: '', // Will be filled by backend
      details: { endpoint, method, ...details }
    });
  }, [logActivity, sessionId]);

  const logDownload = useCallback((fileName: string, fileType: string, details?: Record<string, any>) => {
    logActivity({
      session_id: sessionId || '',
      activity_type: ActivityType.DOWNLOAD,
      description: `Download: ${fileName}`,
      ip_address: '', // Will be filled by backend
      details: { fileName, fileType, ...details }
    });
  }, [logActivity, sessionId]);

  const logUpload = useCallback((fileName: string, fileType: string, details?: Record<string, any>) => {
    logActivity({
      session_id: sessionId || '',
      activity_type: ActivityType.UPLOAD,
      description: `Upload: ${fileName}`,
      ip_address: '', // Will be filled by backend
      details: { fileName, fileType, ...details }
    });
  }, [logActivity, sessionId]);

  const logSettingsChange = useCallback((setting: string, oldValue: any, newValue: any) => {
    logActivity({
      session_id: sessionId || '',
      activity_type: ActivityType.SETTINGS_CHANGE,
      description: `Alterou configuração: ${setting}`,
      ip_address: '', // Will be filled by backend
      details: { setting, oldValue, newValue }
    });
  }, [logActivity, sessionId]);

  const logSuspiciousActivity = useCallback((reason: string, details?: Record<string, any>) => {
    logActivity({
      session_id: sessionId || '',
      activity_type: ActivityType.SUSPICIOUS_ACTIVITY,
      description: `Atividade suspeita: ${reason}`,
      ip_address: '', // Will be filled by backend
      details: { reason, ...details }
    });
  }, [logActivity, sessionId]);

  const refresh = useCallback(() => {
    refetchActivities();
    queryClient.invalidateQueries({ queryKey: ['session-activities'] });
  }, [refetchActivities, queryClient]);

  const clearRealtimeActivities = useCallback(() => {
    setRealtimeActivities([]);
  }, []);

  // Combine server activities with real-time activities
  const allActivities = [
    ...realtimeActivities,
    ...(activitiesData?.activities || [])
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Remove duplicates based on ID
  const uniqueActivities = allActivities.filter((activity, index, self) => 
    index === self.findIndex(a => a.id === activity.id)
  );

  return {
    // Data
    activities: uniqueActivities,
    totalActivities: activitiesData?.total || 0,
    currentPage: activitiesData?.current_page || 1,
    totalPages: activitiesData?.total_pages || 1,
    realtimeActivities,

    // Loading states
    isLoading: isLoadingActivities,
    isLoggingActivity: logActivityMutation.isPending,

    // Error states
    error: activitiesError,

    // Actions
    logActivity,
    logPageView,
    logApiCall,
    logDownload,
    logUpload,
    logSettingsChange,
    logSuspiciousActivity,
    refresh,
    clearRealtimeActivities
  };
}

// Hook for automatic page view tracking
export function usePageViewTracking(sessionId?: string, pageName?: string) {
  const { logPageView } = useSessionActivity({ sessionId });

  useEffect(() => {
    if (sessionId && pageName) {
      logPageView(pageName, {
        timestamp: new Date().toISOString(),
        url: window.location.href
      });
    }
  }, [sessionId, pageName, logPageView]);
}

// Hook for automatic API call tracking
export function useApiCallTracking(sessionId?: string) {
  const { logApiCall } = useSessionActivity({ sessionId });

  const trackApiCall = useCallback((endpoint: string, method: string, details?: Record<string, any>) => {
    if (sessionId) {
      logApiCall(endpoint, method, details);
    }
  }, [sessionId, logApiCall]);

  return { trackApiCall };
}

export default useSessionActivity;