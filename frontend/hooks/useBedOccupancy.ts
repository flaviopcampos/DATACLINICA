import { useState, useEffect } from 'react';
import { BedOccupancyStats } from '@/types/beds';
import { bedService, dashboardService, handleApiError } from '@/services/bedService';

export function useBedOccupancy(departmentId?: string) {
  const [stats, setStats] = useState<BedOccupancyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Buscar estatísticas de ocupação
      const occupancyStats = await bedService.getOccupancyStats(departmentId);
      
      // Buscar tendências de ocupação
      const occupancyTrends = await dashboardService.getOccupancyTrends(30);
      
      // Buscar estatísticas por departamento
      const departmentStats = await dashboardService.getDepartmentStats();
      
      // Combinar os dados
      const combinedStats: BedOccupancyStats = {
        ...occupancyStats,
        occupancy_trends: occupancyTrends,
        department_stats: departmentStats
      };
      
      setStats(combinedStats);
    } catch (err) {
      setError(handleApiError(err));
      console.error('Erro ao buscar estatísticas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [departmentId]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
}