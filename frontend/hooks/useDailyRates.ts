import { useState, useEffect, useCallback } from 'react';
import { DailyRateConfig, DailyRateConfigForm, PaymentType } from '@/types/beds';

// Mock data para desenvolvimento
const mockDailyRates: DailyRateConfig[] = [
  {
    id: '1',
    payment_type: 'PRIVATE',
    bed_type: 'STANDARD',
    base_rate: 350.00,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    tiers: [
      {
        id: '1',
        config_id: '1',
        min_days: 1,
        max_days: 30,
        rate: 350.00,
        discount_percentage: 0,
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        config_id: '1',
        min_days: 31,
        max_days: 60,
        rate: 315.00,
        discount_percentage: 10,
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '3',
        config_id: '1',
        min_days: 61,
        max_days: 90,
        rate: 280.00,
        discount_percentage: 20,
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '4',
        config_id: '1',
        min_days: 91,
        rate: 245.00,
        discount_percentage: 30,
        created_at: '2024-01-01T00:00:00Z'
      }
    ]
  },
  {
    id: '2',
    payment_type: 'INSURANCE',
    bed_type: 'STANDARD',
    base_rate: 280.00,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    tiers: [
      {
        id: '5',
        config_id: '2',
        min_days: 1,
        max_days: 30,
        rate: 280.00,
        discount_percentage: 0,
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '6',
        config_id: '2',
        min_days: 31,
        max_days: 60,
        rate: 252.00,
        discount_percentage: 10,
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '7',
        config_id: '2',
        min_days: 61,
        rate: 224.00,
        discount_percentage: 20,
        created_at: '2024-01-01T00:00:00Z'
      }
    ]
  },
  {
    id: '3',
    payment_type: 'SUS',
    bed_type: 'STANDARD',
    base_rate: 180.00,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    tiers: [
      {
        id: '8',
        config_id: '3',
        min_days: 1,
        rate: 180.00,
        discount_percentage: 0,
        created_at: '2024-01-01T00:00:00Z'
      }
    ]
  },
  {
    id: '4',
    payment_type: 'PRIVATE',
    bed_type: 'ICU',
    base_rate: 800.00,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    tiers: [
      {
        id: '9',
        config_id: '4',
        min_days: 1,
        max_days: 15,
        rate: 800.00,
        discount_percentage: 0,
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '10',
        config_id: '4',
        min_days: 16,
        max_days: 30,
        rate: 720.00,
        discount_percentage: 10,
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '11',
        config_id: '4',
        min_days: 31,
        rate: 640.00,
        discount_percentage: 20,
        created_at: '2024-01-01T00:00:00Z'
      }
    ]
  }
];

export interface UseDailyRatesReturn {
  configs: DailyRateConfig[];
  isLoading: boolean;
  error: string | null;
  createConfig: (data: DailyRateConfigForm) => Promise<void>;
  updateConfig: (id: string, data: DailyRateConfigForm) => Promise<void>;
  deleteConfig: (id: string) => Promise<void>;
  calculateRate: (paymentType: PaymentType, bedType: string, days: number) => number;
  simulateCalculation: (paymentType: PaymentType, bedType: string, days: number) => {
    dailyRate: number;
    totalAmount: number;
    discountPercentage: number;
    discountAmount: number;
    tier?: string;
  };
  refetch: () => void;
}

export function useDailyRates(): UseDailyRatesReturn {
  const [configs, setConfigs] = useState<DailyRateConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfigs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // TODO: Substituir por chamada real da API
      // const response = await fetch('/api/daily-rates');
      // const data = await response.json();
      
      setConfigs(mockDailyRates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar configurações de diárias');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createConfig = useCallback(async (data: DailyRateConfigForm) => {
    try {
      // TODO: Substituir por chamada real da API
      // const response = await fetch('/api/daily-rates', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });
      // const newConfig = await response.json();
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newConfig: DailyRateConfig = {
        id: Date.now().toString(),
        payment_type: data.payment_type,
        bed_type: data.bed_type,
        base_rate: data.base_rate,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tiers: data.tiers.map((tier, index) => ({
          id: `${Date.now()}_${index}`,
          config_id: Date.now().toString(),
          min_days: tier.min_days,
          max_days: tier.max_days,
          rate: tier.rate,
          discount_percentage: tier.discount_percentage,
          created_at: new Date().toISOString()
        }))
      };
      
      setConfigs(prevConfigs => [...prevConfigs, newConfig]);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao criar configuração de diária');
    }
  }, []);

  const updateConfig = useCallback(async (id: string, data: DailyRateConfigForm) => {
    try {
      // TODO: Substituir por chamada real da API
      // await fetch(`/api/daily-rates/${id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setConfigs(prevConfigs => 
        prevConfigs.map(config => 
          config.id === id 
            ? {
                ...config,
                payment_type: data.payment_type,
                bed_type: data.bed_type,
                base_rate: data.base_rate,
                updated_at: new Date().toISOString(),
                tiers: data.tiers.map((tier, index) => ({
                  id: config.tiers?.[index]?.id || `${Date.now()}_${index}`,
                  config_id: id,
                  min_days: tier.min_days,
                  max_days: tier.max_days,
                  rate: tier.rate,
                  discount_percentage: tier.discount_percentage,
                  created_at: config.tiers?.[index]?.created_at || new Date().toISOString()
                }))
              }
            : config
        )
      );
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao atualizar configuração de diária');
    }
  }, []);

  const deleteConfig = useCallback(async (id: string) => {
    try {
      // TODO: Substituir por chamada real da API
      // await fetch(`/api/daily-rates/${id}`, { method: 'DELETE' });
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setConfigs(prevConfigs => prevConfigs.filter(config => config.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao excluir configuração de diária');
    }
  }, []);

  const calculateRate = useCallback((paymentType: PaymentType, bedType: string, days: number): number => {
    const config = configs.find(c => 
      c.payment_type === paymentType && 
      c.bed_type === bedType && 
      c.is_active
    );
    
    if (!config || !config.tiers) {
      return 0;
    }
    
    // Encontrar a faixa apropriada
    const tier = config.tiers.find(t => {
      if (t.max_days) {
        return days >= t.min_days && days <= t.max_days;
      } else {
        return days >= t.min_days;
      }
    });
    
    return tier ? tier.rate : config.base_rate;
  }, [configs]);

  const simulateCalculation = useCallback((paymentType: PaymentType, bedType: string, days: number) => {
    const config = configs.find(c => 
      c.payment_type === paymentType && 
      c.bed_type === bedType && 
      c.is_active
    );
    
    if (!config || !config.tiers) {
      return {
        dailyRate: 0,
        totalAmount: 0,
        discountPercentage: 0,
        discountAmount: 0
      };
    }
    
    // Encontrar a faixa apropriada
    const tier = config.tiers.find(t => {
      if (t.max_days) {
        return days >= t.min_days && days <= t.max_days;
      } else {
        return days >= t.min_days;
      }
    });
    
    const dailyRate = tier ? tier.rate : config.base_rate;
    const discountPercentage = tier?.discount_percentage || 0;
    const baseAmount = config.base_rate * days;
    const totalAmount = dailyRate * days;
    const discountAmount = baseAmount - totalAmount;
    
    let tierDescription = '';
    if (tier) {
      if (tier.max_days) {
        tierDescription = `${tier.min_days}-${tier.max_days} dias`;
      } else {
        tierDescription = `${tier.min_days}+ dias`;
      }
    }
    
    return {
      dailyRate,
      totalAmount,
      discountPercentage,
      discountAmount,
      tier: tierDescription
    };
  }, [configs]);

  const refetch = useCallback(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  return {
    configs,
    isLoading,
    error,
    createConfig,
    updateConfig,
    deleteConfig,
    calculateRate,
    simulateCalculation,
    refetch
  };
}