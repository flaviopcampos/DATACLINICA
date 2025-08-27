import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  productService,
  productCategoryService,
  productBatchService,
  stockInventoryService,
  stockMovementService,
  stockAdjustmentService,
  stockTransferService,
  purchaseOrderService,
  inventoryCountService,
  supplierPriceService,
  inventoryReportService,
  inventoryStatsService
} from '@/services/inventoryService';
import type {
  Product,
  ProductCreate,
  ProductUpdate,
  ProductFilters,
  ProductCategory,
  ProductCategoryCreate,
  ProductBatch,
  ProductBatchCreate,
  ProductBatchUpdate,
  StockInventory,
  StockInventoryCreate,
  StockInventoryUpdate,
  InventoryFilters,
  StockMovement,
  StockMovementCreate,
  StockMovementFilters,
  StockAdjustment,
  StockAdjustmentCreate,
  StockTransfer,
  StockTransferCreate,
  PurchaseOrder,
  PurchaseOrderCreate,
  InventoryCount,
  InventoryCountCreate,
  SupplierProductPrice,
  SupplierProductPriceCreate,
  StockReportRequest
} from '@/types/inventory';

// Query keys
export const inventoryKeys = {
  all: ['inventory'] as const,
  
  // Products
  products: () => [...inventoryKeys.all, 'products'] as const,
  productsList: (filters: ProductFilters) => [...inventoryKeys.products(), 'list', { filters }] as const,
  product: (id: number) => [...inventoryKeys.products(), 'detail', id] as const,
  productSearch: (query: string) => [...inventoryKeys.products(), 'search', query] as const,
  
  // Categories
  categories: () => [...inventoryKeys.all, 'categories'] as const,
  category: (id: number) => [...inventoryKeys.categories(), id] as const,
  
  // Batches
  batches: () => [...inventoryKeys.all, 'batches'] as const,
  productBatches: (productId: number) => [...inventoryKeys.batches(), 'product', productId] as const,
  batch: (id: number) => [...inventoryKeys.batches(), 'detail', id] as const,
  
  // Stock Inventory
  stockInventory: () => [...inventoryKeys.all, 'stock'] as const,
  stockInventoryList: (filters: InventoryFilters) => [...inventoryKeys.stockInventory(), 'list', { filters }] as const,
  stockInventoryDetail: (id: number) => [...inventoryKeys.stockInventory(), 'detail', id] as const,
  
  // Stock Movements
  stockMovements: () => [...inventoryKeys.all, 'movements'] as const,
  stockMovementsList: (filters: StockMovementFilters) => [...inventoryKeys.stockMovements(), 'list', { filters }] as const,
  productMovements: (productId: number) => [...inventoryKeys.stockMovements(), 'product', productId] as const,
  
  // Stock Adjustments
  stockAdjustments: () => [...inventoryKeys.all, 'adjustments'] as const,
  stockAdjustmentsList: (params?: any) => [...inventoryKeys.stockAdjustments(), 'list', params] as const,
  stockAdjustment: (id: number) => [...inventoryKeys.stockAdjustments(), 'detail', id] as const,
  
  // Stock Transfers
  stockTransfers: () => [...inventoryKeys.all, 'transfers'] as const,
  stockTransfersList: (params?: any) => [...inventoryKeys.stockTransfers(), 'list', params] as const,
  stockTransfer: (id: number) => [...inventoryKeys.stockTransfers(), 'detail', id] as const,
  
  // Purchase Orders
  purchaseOrders: () => [...inventoryKeys.all, 'purchase-orders'] as const,
  purchaseOrdersList: (params?: any) => [...inventoryKeys.purchaseOrders(), 'list', params] as const,
  purchaseOrder: (id: number) => [...inventoryKeys.purchaseOrders(), 'detail', id] as const,
  
  // Inventory Counts
  inventoryCounts: () => [...inventoryKeys.all, 'counts'] as const,
  inventoryCountsList: (params?: any) => [...inventoryKeys.inventoryCounts(), 'list', params] as const,
  inventoryCount: (id: number) => [...inventoryKeys.inventoryCounts(), 'detail', id] as const,
  
  // Supplier Prices
  supplierPrices: (productId: number) => [...inventoryKeys.all, 'supplier-prices', productId] as const,
  
  // Reports
  reports: () => [...inventoryKeys.all, 'reports'] as const,
  lowStockItems: () => [...inventoryKeys.reports(), 'low-stock'] as const,
  expiringItems: (days?: number) => [...inventoryKeys.reports(), 'expiring', { days }] as const,
  inventoryReport: (inventoryId: number) => [...inventoryKeys.reports(), 'inventory', inventoryId] as const,
  stockSummary: (params?: StockReportRequest) => [...inventoryKeys.reports(), 'stock-summary', params] as const,
  movementSummary: (params?: any) => [...inventoryKeys.reports(), 'movement-summary', params] as const,
  
  // Stats
  stats: () => [...inventoryKeys.all, 'stats'] as const,
};

// ============ PRODUCTS HOOKS ============

// Hook para listar produtos
export function useProducts(params?: {
  page?: number;
  per_page?: number;
  filters?: ProductFilters;
}) {
  return useQuery({
    queryKey: inventoryKeys.productsList(params?.filters || {}),
    queryFn: () => productService.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para obter produto por ID
export function useProduct(id: number) {
  return useQuery({
    queryKey: inventoryKeys.product(id),
    queryFn: () => productService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para buscar produtos (autocomplete)
export function useProductSearch(query: string) {
  return useQuery({
    queryKey: inventoryKeys.productSearch(query),
    queryFn: () => productService.search(query),
    enabled: query.length >= 2,
    staleTime: 30 * 60 * 1000, // 30 minutos
  });
}

// Hook para criar produto
export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ProductCreate) => productService.create(data),
    onSuccess: (newProduct) => {
      // Invalidar listas de produtos
      queryClient.invalidateQueries({ queryKey: inventoryKeys.products() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stats() });
      
      toast.success('Produto criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao criar produto');
    },
  });
}

// Hook para atualizar produto
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductUpdate }) => 
      productService.update(id, data),
    onSuccess: (updatedProduct) => {
      // Atualizar cache específico
      queryClient.setQueryData(
        inventoryKeys.product(updatedProduct.id),
        updatedProduct
      );
      
      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: inventoryKeys.products() });
      
      toast.success('Produto atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar produto');
    },
  });
}

// Hook para deletar produto
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => productService.delete(id),
    onSuccess: (_, deletedId) => {
      // Remover do cache
      queryClient.removeQueries({ queryKey: inventoryKeys.product(deletedId) });
      
      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: inventoryKeys.products() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stats() });
      
      toast.success('Produto excluído com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao excluir produto');
    },
  });
}

// ============ CATEGORIES HOOKS ============

// Hook para listar categorias
export function useProductCategories() {
  return useQuery({
    queryKey: inventoryKeys.categories(),
    queryFn: () => productCategoryService.getAll(),
    staleTime: 30 * 60 * 1000, // 30 minutos
  });
}

// Hook para obter categoria por ID
export function useProductCategory(id: number) {
  return useQuery({
    queryKey: inventoryKeys.category(id),
    queryFn: () => productCategoryService.getById(id),
    enabled: !!id,
    staleTime: 30 * 60 * 1000,
  });
}

// Hook para criar categoria
export function useCreateProductCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ProductCategoryCreate) => productCategoryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.categories() });
      toast.success('Categoria criada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao criar categoria');
    },
  });
}

// Hook para atualizar categoria
export function useUpdateProductCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductCategoryCreate }) => 
      productCategoryService.update(id, data),
    onSuccess: (updatedCategory) => {
      queryClient.setQueryData(
        inventoryKeys.category(updatedCategory.id),
        updatedCategory
      );
      queryClient.invalidateQueries({ queryKey: inventoryKeys.categories() });
      toast.success('Categoria atualizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar categoria');
    },
  });
}

// Hook para deletar categoria
export function useDeleteProductCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => productCategoryService.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: inventoryKeys.category(deletedId) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.categories() });
      toast.success('Categoria excluída com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao excluir categoria');
    },
  });
}

// ============ BATCHES HOOKS ============

// Hook para listar lotes por produto
export function useProductBatches(productId: number) {
  return useQuery({
    queryKey: inventoryKeys.productBatches(productId),
    queryFn: () => productBatchService.getByProduct(productId),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para obter lote por ID
export function useProductBatch(id: number) {
  return useQuery({
    queryKey: inventoryKeys.batch(id),
    queryFn: () => productBatchService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para criar lote
export function useCreateProductBatch() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ProductBatchCreate) => productBatchService.create(data),
    onSuccess: (newBatch) => {
      queryClient.invalidateQueries({ 
        queryKey: inventoryKeys.productBatches(newBatch.product_id) 
      });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockInventory() });
      toast.success('Lote criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao criar lote');
    },
  });
}

// Hook para atualizar lote
export function useUpdateProductBatch() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductBatchUpdate }) => 
      productBatchService.update(id, data),
    onSuccess: (updatedBatch) => {
      queryClient.setQueryData(
        inventoryKeys.batch(updatedBatch.id),
        updatedBatch
      );
      queryClient.invalidateQueries({ 
        queryKey: inventoryKeys.productBatches(updatedBatch.product_id) 
      });
      toast.success('Lote atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar lote');
    },
  });
}

// Hook para deletar lote
export function useDeleteProductBatch() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => productBatchService.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: inventoryKeys.batch(deletedId) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.batches() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockInventory() });
      toast.success('Lote excluído com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao excluir lote');
    },
  });
}

// ============ STOCK INVENTORY HOOKS ============

// Hook para listar inventários
export function useStockInventory(params?: {
  page?: number;
  per_page?: number;
  filters?: InventoryFilters;
}) {
  return useQuery({
    queryKey: inventoryKeys.stockInventoryList(params?.filters || {}),
    queryFn: () => stockInventoryService.getAll(params),
    staleTime: 2 * 60 * 1000, // 2 minutos (dados mais dinâmicos)
  });
}

// Hook para obter inventário por ID
export function useStockInventoryDetail(id: number) {
  return useQuery({
    queryKey: inventoryKeys.stockInventoryDetail(id),
    queryFn: () => stockInventoryService.getById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

// Hook para criar inventário
export function useCreateStockInventory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: StockInventoryCreate) => stockInventoryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockInventory() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stats() });
      toast.success('Inventário criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao criar inventário');
    },
  });
}

// Hook para atualizar inventário
export function useUpdateStockInventory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: StockInventoryUpdate }) => 
      stockInventoryService.update(id, data),
    onSuccess: (updatedInventory) => {
      queryClient.setQueryData(
        inventoryKeys.stockInventoryDetail(updatedInventory.id),
        updatedInventory
      );
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockInventory() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stats() });
      toast.success('Inventário atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar inventário');
    },
  });
}

// ============ STOCK MOVEMENTS HOOKS ============

// Hook para listar movimentações
export function useStockMovements(params?: {
  page?: number;
  per_page?: number;
  filters?: StockMovementFilters;
}) {
  return useQuery({
    queryKey: inventoryKeys.stockMovementsList(params?.filters || {}),
    queryFn: () => stockMovementService.getAll(params),
    staleTime: 1 * 60 * 1000, // 1 minuto (dados muito dinâmicos)
  });
}

// Hook para movimentações por produto
export function useProductStockMovements(productId: number, params?: {
  page?: number;
  per_page?: number;
  date_from?: string;
  date_to?: string;
}) {
  return useQuery({
    queryKey: inventoryKeys.productMovements(productId),
    queryFn: () => stockMovementService.getByProduct(productId, params),
    enabled: !!productId,
    staleTime: 1 * 60 * 1000,
  });
}

// Hook para criar movimentação
export function useCreateStockMovement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: StockMovementCreate) => stockMovementService.create(data),
    onSuccess: (newMovement) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockMovements() });
      queryClient.invalidateQueries({ 
        queryKey: inventoryKeys.productMovements(newMovement.product_id) 
      });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockInventory() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stats() });
      toast.success('Movimentação registrada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao registrar movimentação');
    },
  });
}

// ============ REPORTS HOOKS ============

// Hook para produtos com estoque baixo
export function useLowStockItems() {
  return useQuery({
    queryKey: inventoryKeys.lowStockItems(),
    queryFn: () => inventoryReportService.getLowStockItems(),
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para produtos próximos ao vencimento
export function useExpiringItems(days?: number) {
  return useQuery({
    queryKey: inventoryKeys.expiringItems(days),
    queryFn: () => inventoryReportService.getExpiringItems(days),
    staleTime: 10 * 60 * 1000,
  });
}

// Hook para resumo de estoque
export function useStockSummary(params?: StockReportRequest) {
  return useQuery({
    queryKey: inventoryKeys.stockSummary(params),
    queryFn: () => inventoryReportService.getStockSummary(params),
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para resumo de movimentações
export function useMovementSummary(params?: {
  date_from?: string;
  date_to?: string;
  product_ids?: number[];
}) {
  return useQuery({
    queryKey: inventoryKeys.movementSummary(params),
    queryFn: () => inventoryReportService.getMovementSummary(params),
    staleTime: 5 * 60 * 1000,
  });
}

// ============ STATS HOOKS ============

// Hook para estatísticas do dashboard
export function useInventoryStats() {
  return useQuery({
    queryKey: inventoryKeys.stats(),
    queryFn: () => inventoryStatsService.getDashboardStats(),
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 5 * 60 * 1000, // Refetch a cada 5 minutos
  });
}