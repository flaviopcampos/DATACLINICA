import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { scheduleBlocksService } from '@/services/scheduleBlocksService';
import type {
  ScheduleBlock,
  ScheduleBlockCreate,
  ScheduleBlockUpdate,
  ScheduleBlockFilters,
  ScheduleBlocksResponse,
  ScheduleBlockStats,
  ScheduleBlockValidation,
  ScheduleBlockTemplate,
  ScheduleBlockTemplateCreate
} from '@/types/medical';

// ============================================================================
// SCHEDULE BLOCKS HOOK
// ============================================================================

export interface UseScheduleBlocksOptions {
  filters?: ScheduleBlockFilters;
  autoFetch?: boolean;
  onSuccess?: (data: ScheduleBlocksResponse) => void;
  onError?: (error: Error) => void;
}

export interface UseScheduleBlocksReturn {
  blocks: ScheduleBlock[];
  loading: boolean;
  error: string | null;
  total: number;
  refetch: () => Promise<void>;
  createBlock: (data: ScheduleBlockCreate) => Promise<ScheduleBlock | null>;
  updateBlock: (id: string, data: Partial<ScheduleBlockUpdate>) => Promise<ScheduleBlock | null>;
  deleteBlock: (id: string) => Promise<boolean>;
  validateBlock: (data: ScheduleBlockCreate | ScheduleBlockUpdate) => Promise<ScheduleBlockValidation | null>;
}

export function useScheduleBlocks(options: UseScheduleBlocksOptions = {}): UseScheduleBlocksReturn {
  const { filters = {}, autoFetch = true, onSuccess, onError } = options;
  
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchBlocks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await scheduleBlocksService.getScheduleBlocks(filters);
      
      setBlocks(response.data);
      setTotal(response.total);
      
      onSuccess?.(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar bloqueios';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters, onSuccess, onError]);

  const createBlock = useCallback(async (data: ScheduleBlockCreate): Promise<ScheduleBlock | null> => {
    try {
      setLoading(true);
      const newBlock = await scheduleBlocksService.createScheduleBlock(data);
      
      // Atualizar lista local
      setBlocks(prev => [...prev, newBlock]);
      setTotal(prev => prev + 1);
      
      toast.success('Bloqueio criado com sucesso!');
      return newBlock;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar bloqueio';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBlock = useCallback(async (id: string, data: Partial<ScheduleBlockUpdate>): Promise<ScheduleBlock | null> => {
    try {
      setLoading(true);
      const updatedBlock = await scheduleBlocksService.updateScheduleBlock(id, data);
      
      // Atualizar lista local
      setBlocks(prev => prev.map(block => 
        block.id === id ? updatedBlock : block
      ));
      
      toast.success('Bloqueio atualizado com sucesso!');
      return updatedBlock;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar bloqueio';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteBlock = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      await scheduleBlocksService.deleteScheduleBlock(id);
      
      // Remover da lista local
      setBlocks(prev => prev.filter(block => block.id !== id));
      setTotal(prev => prev - 1);
      
      toast.success('Bloqueio removido com sucesso!');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover bloqueio';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const validateBlock = useCallback(async (data: ScheduleBlockCreate | ScheduleBlockUpdate): Promise<ScheduleBlockValidation | null> => {
    try {
      return await scheduleBlocksService.validateScheduleBlock(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro na validação';
      toast.error(errorMessage);
      return null;
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchBlocks();
    }
  }, [fetchBlocks, autoFetch]);

  return {
    blocks,
    loading,
    error,
    total,
    refetch: fetchBlocks,
    createBlock,
    updateBlock,
    deleteBlock,
    validateBlock
  };
}

// ============================================================================
// SCHEDULE BLOCK TEMPLATES HOOK
// ============================================================================

export interface UseScheduleBlockTemplatesReturn {
  templates: ScheduleBlockTemplate[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createTemplate: (data: ScheduleBlockTemplateCreate) => Promise<ScheduleBlockTemplate | null>;
  createBlockFromTemplate: (templateId: string, doctorId: string, startDate: string, endDate?: string) => Promise<ScheduleBlock | null>;
}

export function useScheduleBlockTemplates(): UseScheduleBlockTemplatesReturn {
  const [templates, setTemplates] = useState<ScheduleBlockTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await scheduleBlocksService.getScheduleBlockTemplates();
      setTemplates(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar templates';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTemplate = useCallback(async (data: ScheduleBlockTemplateCreate): Promise<ScheduleBlockTemplate | null> => {
    try {
      setLoading(true);
      const newTemplate = await scheduleBlocksService.createScheduleBlockTemplate(data);
      
      setTemplates(prev => [...prev, newTemplate]);
      toast.success('Template criado com sucesso!');
      return newTemplate;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar template';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createBlockFromTemplate = useCallback(async (
    templateId: string, 
    doctorId: string, 
    startDate: string, 
    endDate?: string
  ): Promise<ScheduleBlock | null> => {
    try {
      setLoading(true);
      const newBlock = await scheduleBlocksService.createBlockFromTemplate(
        templateId, 
        doctorId, 
        startDate, 
        endDate
      );
      
      toast.success('Bloqueio criado a partir do template!');
      return newBlock;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar bloqueio do template';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return {
    templates,
    loading,
    error,
    refetch: fetchTemplates,
    createTemplate,
    createBlockFromTemplate
  };
}

// ============================================================================
// SCHEDULE BLOCK STATS HOOK
// ============================================================================

export interface UseScheduleBlockStatsOptions {
  doctorId?: string;
  autoFetch?: boolean;
}

export interface UseScheduleBlockStatsReturn {
  stats: ScheduleBlockStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useScheduleBlockStats(options: UseScheduleBlockStatsOptions = {}): UseScheduleBlockStatsReturn {
  const { doctorId, autoFetch = true } = options;
  
  const [stats, setStats] = useState<ScheduleBlockStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await scheduleBlocksService.getScheduleBlockStats(doctorId);
      setStats(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar estatísticas';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    if (autoFetch) {
      fetchStats();
    }
  }, [fetchStats, autoFetch]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
}

// ============================================================================
// DOCTOR BLOCKED DATES HOOK
// ============================================================================

export interface UseDoctorBlockedDatesOptions {
  doctorId: string;
  startDate: string;
  endDate: string;
  autoFetch?: boolean;
}

export interface UseDoctorBlockedDatesReturn {
  blockedDates: string[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDoctorBlockedDates(options: UseDoctorBlockedDatesOptions): UseDoctorBlockedDatesReturn {
  const { doctorId, startDate, endDate, autoFetch = true } = options;
  
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBlockedDates = useCallback(async () => {
    if (!doctorId || !startDate || !endDate) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const dates = await scheduleBlocksService.getDoctorBlockedDates(
        doctorId, 
        startDate, 
        endDate
      );
      setBlockedDates(dates);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar datas bloqueadas';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [doctorId, startDate, endDate]);

  useEffect(() => {
    if (autoFetch) {
      fetchBlockedDates();
    }
  }, [fetchBlockedDates, autoFetch]);

  return {
    blockedDates,
    loading,
    error,
    refetch: fetchBlockedDates
  };
}

// ============================================================================
// SCHEDULE BLOCK BY ID HOOK
// ============================================================================

export interface UseScheduleBlockOptions {
  id: string;
  autoFetch?: boolean;
}

export interface UseScheduleBlockReturn {
  block: ScheduleBlock | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useScheduleBlock(options: UseScheduleBlockOptions): UseScheduleBlockReturn {
  const { id, autoFetch = true } = options;
  
  const [block, setBlock] = useState<ScheduleBlock | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBlock = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await scheduleBlocksService.getScheduleBlockById(id);
      setBlock(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar bloqueio';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (autoFetch) {
      fetchBlock();
    }
  }, [fetchBlock, autoFetch]);

  return {
    block,
    loading,
    error,
    refetch: fetchBlock
  };
}