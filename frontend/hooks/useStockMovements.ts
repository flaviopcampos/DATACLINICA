import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { stockMovementService } from '@/services/inventoryService'
import type { 
  StockMovement, 
  CreateStockMovementData, 
  MovementType,
  PaginatedResponse 
} from '@/types/inventory'

interface UseStockMovementsParams {
  page?: number
  limit?: number
  productId?: string
  type?: MovementType
  dateFrom?: string
  dateTo?: string
  userId?: string
  search?: string
}

interface MovementStats {
  total_movements: number
  total_in: number
  total_out: number
  total_adjustments: number
  total_in_value: number
  total_out_value: number
  movements_by_day: Array<{
    date: string
    in: number
    out: number
    adjustments: number
  }>
}

export function useStockMovements(params: UseStockMovementsParams = {}) {
  const queryClient = useQueryClient()

  // Query para buscar movimentações
  const {
    data: movements,
    isLoading,
    error,
    refetch,
  } = useQuery<PaginatedResponse<StockMovement>>(
    ['stock-movements', params],
    () => stockMovementService.getAll(params),
    {
      keepPreviousData: true,
      staleTime: 30000, // 30 segundos
      onError: (error: any) => {
        console.error('Erro ao buscar movimentações:', error)
        toast.error('Erro ao carregar movimentações de estoque')
      },
    }
  )

  // Query para estatísticas de movimentações
  const {
    data: movementStats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery<MovementStats>(
    ['movement-stats', params.productId, params.dateFrom, params.dateTo],
    () => stockMovementService.getStats({
      productId: params.productId,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
    }),
    {
      staleTime: 60000, // 1 minuto
      onError: (error: any) => {
        console.error('Erro ao buscar estatísticas:', error)
      },
    }
  )

  // Mutation para criar movimentação
  const createMovementMutation = useMutation(
    (data: CreateStockMovementData) => stockMovementService.create(data),
    {
      onSuccess: (newMovement) => {
        // Invalidar queries relacionadas
        queryClient.invalidateQueries(['stock-movements'])
        queryClient.invalidateQueries(['movement-stats'])
        queryClient.invalidateQueries(['products'])
        queryClient.invalidateQueries(['inventory-stats'])
        queryClient.invalidateQueries(['low-stock-items'])
        
        toast.success('Movimentação registrada com sucesso!')
      },
      onError: (error: any) => {
        console.error('Erro ao criar movimentação:', error)
        toast.error(
          error.response?.data?.message || 
          'Erro ao registrar movimentação'
        )
      },
    }
  )

  // Mutation para exportar movimentações
  const exportMovementsMutation = useMutation(
    (filters: UseStockMovementsParams) => stockMovementService.export(filters),
    {
      onSuccess: (blob, filters) => {
        // Criar URL do blob e fazer download
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        
        // Gerar nome do arquivo com data atual
        const now = new Date()
        const dateStr = now.toISOString().split('T')[0]
        link.download = `movimentacoes-estoque-${dateStr}.xlsx`
        
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        toast.success('Relatório exportado com sucesso!')
      },
      onError: (error: any) => {
        console.error('Erro ao exportar movimentações:', error)
        toast.error(
          error.response?.data?.message || 
          'Erro ao exportar relatório'
        )
      },
    }
  )

  // Mutation para ajuste rápido de estoque
  const quickAdjustmentMutation = useMutation(
    ({ productId, quantity, reason }: { 
      productId: string
      quantity: number
      reason: string 
    }) => stockMovementService.create({
      product_id: productId,
      type: 'adjustment',
      quantity: Math.abs(quantity),
      notes: reason,
      movement_date: new Date().toISOString(),
    }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['stock-movements'])
        queryClient.invalidateQueries(['movement-stats'])
        queryClient.invalidateQueries(['products'])
        queryClient.invalidateQueries(['inventory-stats'])
        
        toast.success('Ajuste de estoque realizado com sucesso!')
      },
      onError: (error: any) => {
        console.error('Erro ao ajustar estoque:', error)
        toast.error(
          error.response?.data?.message || 
          'Erro ao ajustar estoque'
        )
      },
    }
  )

  return {
    // Dados
    movements,
    movementStats,
    
    // Estados de loading
    isLoading,
    statsLoading,
    isCreating: createMovementMutation.isLoading,
    isExporting: exportMovementsMutation.isLoading,
    isAdjusting: quickAdjustmentMutation.isLoading,
    
    // Estados de erro
    error,
    statsError,
    createError: createMovementMutation.error,
    exportError: exportMovementsMutation.error,
    adjustError: quickAdjustmentMutation.error,
    
    // Funções
    createMovement: createMovementMutation.mutateAsync,
    exportMovements: exportMovementsMutation.mutateAsync,
    quickAdjustment: quickAdjustmentMutation.mutateAsync,
    refetch,
    
    // Estados de sucesso
    isCreateSuccess: createMovementMutation.isSuccess,
    isExportSuccess: exportMovementsMutation.isSuccess,
    isAdjustSuccess: quickAdjustmentMutation.isSuccess,
  }
}

// Hook para movimentações recentes (dashboard)
export function useRecentMovements(limit: number = 10) {
  return useQuery<StockMovement[]>(
    ['recent-movements', limit],
    () => inventoryService.getRecentMovements(limit),
    {
      staleTime: 30000, // 30 segundos
      onError: (error: any) => {
        console.error('Erro ao buscar movimentações recentes:', error)
      },
    }
  )
}

// Hook para movimentações de um produto específico
export function useProductMovements(productId: string, limit: number = 20) {
  return useQuery<StockMovement[]>(
    ['product-movements', productId, limit],
    () => inventoryService.getProductMovements(productId, limit),
    {
      enabled: !!productId,
      staleTime: 30000,
      onError: (error: any) => {
        console.error('Erro ao buscar movimentações do produto:', error)
      },
    }
  )
}

// Hook para validação de movimentação
export function useValidateMovement() {
  return useMutation(
    (data: CreateStockMovementData) => inventoryService.validateStockMovement(data),
    {
      onError: (error: any) => {
        console.error('Erro na validação:', error)
      },
    }
  )
}