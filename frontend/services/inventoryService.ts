import api from './api';
import type {
  Product,
  ProductCreate,
  ProductUpdate,
  ProductsResponse,
  ProductFilters,
  ProductCategory,
  ProductCategoryCreate,
  ProductBatch,
  ProductBatchCreate,
  ProductBatchUpdate,
  StockInventory,
  StockInventoryCreate,
  StockInventoryUpdate,
  InventoryResponse,
  InventoryFilters,
  StockMovement,
  StockMovementCreate,
  StockMovementsResponse,
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
  LowStockItem,
  ExpiringItem,
  StockMovementSummary,
  StockInventoryReport,
  StockReportRequest,
  InventoryStats
} from '@/types/inventory';

// Serviço para Produtos
export const productService = {
  // Listar produtos
  async getAll(params?: {
    page?: number;
    per_page?: number;
    filters?: ProductFilters;
  }): Promise<ProductsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString());
    if (params?.filters?.search) searchParams.append('search', params.filters.search);
    if (params?.filters?.category_id) searchParams.append('category_id', params.filters.category_id.toString());
    if (params?.filters?.is_active !== undefined) searchParams.append('is_active', params.filters.is_active.toString());
    if (params?.filters?.requires_prescription !== undefined) searchParams.append('requires_prescription', params.filters.requires_prescription.toString());
    if (params?.filters?.controlled_substance !== undefined) searchParams.append('controlled_substance', params.filters.controlled_substance.toString());
    if (params?.filters?.low_stock !== undefined) searchParams.append('low_stock', params.filters.low_stock.toString());
    if (params?.filters?.expiring_soon !== undefined) searchParams.append('expiring_soon', params.filters.expiring_soon.toString());
    
    const response = await api.get(`/pharmacy/products/?${searchParams.toString()}`);
    return response.data;
  },

  // Obter produto por ID
  async getById(id: number): Promise<Product> {
    const response = await api.get(`/pharmacy/products/${id}`);
    return response.data;
  },

  // Criar produto
  async create(data: ProductCreate): Promise<Product> {
    const response = await api.post('/pharmacy/products/', data);
    return response.data;
  },

  // Atualizar produto
  async update(id: number, data: ProductUpdate): Promise<Product> {
    const response = await api.put(`/pharmacy/products/${id}`, data);
    return response.data;
  },

  // Deletar produto
  async delete(id: number): Promise<void> {
    await api.delete(`/pharmacy/products/${id}`);
  },

  // Buscar produtos (autocomplete)
  async search(query: string): Promise<Product[]> {
    const response = await api.get(`/pharmacy/products/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }
};

// Serviço para Categorias de Produto
export const productCategoryService = {
  // Listar categorias
  async getAll(): Promise<ProductCategory[]> {
    const response = await api.get('/pharmacy/categories/');
    return response.data;
  },

  // Obter categoria por ID
  async getById(id: number): Promise<ProductCategory> {
    const response = await api.get(`/pharmacy/categories/${id}`);
    return response.data;
  },

  // Criar categoria
  async create(data: ProductCategoryCreate): Promise<ProductCategory> {
    const response = await api.post('/pharmacy/categories/', data);
    return response.data;
  },

  // Atualizar categoria
  async update(id: number, data: ProductCategoryCreate): Promise<ProductCategory> {
    const response = await api.put(`/pharmacy/categories/${id}`, data);
    return response.data;
  },

  // Deletar categoria
  async delete(id: number): Promise<void> {
    await api.delete(`/pharmacy/categories/${id}`);
  }
};

// Serviço para Lotes de Produto
export const productBatchService = {
  // Listar lotes por produto
  async getByProduct(productId: number): Promise<ProductBatch[]> {
    const response = await api.get(`/pharmacy/products/${productId}/batches`);
    return response.data;
  },

  // Obter lote por ID
  async getById(id: number): Promise<ProductBatch> {
    const response = await api.get(`/pharmacy/batches/${id}`);
    return response.data;
  },

  // Criar lote
  async create(data: ProductBatchCreate): Promise<ProductBatch> {
    const response = await api.post('/pharmacy/batches/', data);
    return response.data;
  },

  // Atualizar lote
  async update(id: number, data: ProductBatchUpdate): Promise<ProductBatch> {
    const response = await api.put(`/pharmacy/batches/${id}`, data);
    return response.data;
  },

  // Deletar lote
  async delete(id: number): Promise<void> {
    await api.delete(`/pharmacy/batches/${id}`);
  }
};

// Serviço para Inventário de Estoque
export const stockInventoryService = {
  // Listar inventários
  async getAll(params?: {
    page?: number;
    per_page?: number;
    filters?: InventoryFilters;
  }): Promise<InventoryResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString());
    if (params?.filters?.product_id) searchParams.append('product_id', params.filters.product_id.toString());
    if (params?.filters?.category_id) searchParams.append('category_id', params.filters.category_id.toString());
    if (params?.filters?.department_id) searchParams.append('department_id', params.filters.department_id.toString());
    if (params?.filters?.low_stock !== undefined) searchParams.append('low_stock', params.filters.low_stock.toString());
    if (params?.filters?.out_of_stock !== undefined) searchParams.append('out_of_stock', params.filters.out_of_stock.toString());
    
    const response = await api.get(`/pharmacy/inventories/?${searchParams.toString()}`);
    return response.data;
  },

  // Obter inventário por ID
  async getById(id: number): Promise<StockInventory> {
    const response = await api.get(`/pharmacy/inventories/${id}`);
    return response.data;
  },

  // Criar inventário
  async create(data: StockInventoryCreate): Promise<StockInventory> {
    const response = await api.post('/pharmacy/inventories/', data);
    return response.data;
  },

  // Atualizar inventário
  async update(id: number, data: StockInventoryUpdate): Promise<StockInventory> {
    const response = await api.put(`/pharmacy/inventories/${id}`, data);
    return response.data;
  },

  // Deletar inventário
  async delete(id: number): Promise<void> {
    await api.delete(`/pharmacy/inventories/${id}`);
  }
};

// Serviço para Movimentações de Estoque
export const stockMovementService = {
  // Listar movimentações
  async getAll(params?: {
    page?: number;
    per_page?: number;
    filters?: StockMovementFilters;
  }): Promise<StockMovementsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString());
    if (params?.filters?.product_id) searchParams.append('product_id', params.filters.product_id.toString());
    if (params?.filters?.movement_type) searchParams.append('movement_type', params.filters.movement_type);
    if (params?.filters?.reference_type) searchParams.append('reference_type', params.filters.reference_type);
    if (params?.filters?.date_from) searchParams.append('date_from', params.filters.date_from);
    if (params?.filters?.date_to) searchParams.append('date_to', params.filters.date_to);
    if (params?.filters?.department_id) searchParams.append('department_id', params.filters.department_id.toString());
    
    const response = await api.get(`/pharmacy/stock-movements/?${searchParams.toString()}`);
    return response.data;
  },

  // Obter movimentação por ID
  async getById(id: number): Promise<StockMovement> {
    const response = await api.get(`/pharmacy/stock-movements/${id}`);
    return response.data;
  },

  // Criar movimentação
  async create(data: StockMovementCreate): Promise<StockMovement> {
    const response = await api.post('/pharmacy/stock-movements/', data);
    return response.data;
  },

  // Obter movimentações por produto
  async getByProduct(productId: number, params?: {
    page?: number;
    per_page?: number;
    date_from?: string;
    date_to?: string;
  }): Promise<StockMovementsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString());
    if (params?.date_from) searchParams.append('date_from', params.date_from);
    if (params?.date_to) searchParams.append('date_to', params.date_to);
    
    const response = await api.get(`/pharmacy/products/${productId}/movements?${searchParams.toString()}`);
    return response.data;
  },

  // Obter estatísticas de movimentações
  async getStats(params?: {
    date_from?: string;
    date_to?: string;
    product_id?: number;
  }): Promise<{
    total_movements: number;
    total_in: number;
    total_out: number;
    total_adjustments: number;
  }> {
    const searchParams = new URLSearchParams();
    
    if (params?.date_from) searchParams.append('date_from', params.date_from);
    if (params?.date_to) searchParams.append('date_to', params.date_to);
    if (params?.product_id) searchParams.append('product_id', params.product_id.toString());
    
    const response = await api.get(`/pharmacy/stock-movements/stats?${searchParams.toString()}`);
    return response.data;
  },

  // Exportar movimentações
  async export(params?: {
    format?: 'csv' | 'excel' | 'pdf';
    filters?: StockMovementFilters;
  }): Promise<Blob> {
    const searchParams = new URLSearchParams();
    
    if (params?.format) searchParams.append('format', params.format);
    if (params?.filters?.product_id) searchParams.append('product_id', params.filters.product_id.toString());
    if (params?.filters?.movement_type) searchParams.append('movement_type', params.filters.movement_type);
    if (params?.filters?.reference_type) searchParams.append('reference_type', params.filters.reference_type);
    if (params?.filters?.date_from) searchParams.append('date_from', params.filters.date_from);
    if (params?.filters?.date_to) searchParams.append('date_to', params.filters.date_to);
    if (params?.filters?.department_id) searchParams.append('department_id', params.filters.department_id.toString());
    
    const response = await api.get(`/pharmacy/stock-movements/export?${searchParams.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Ajuste rápido de estoque
  async quickAdjustment(data: {
    product_id: number;
    quantity: number;
    reason: string;
    notes?: string;
  }): Promise<StockMovement> {
    const response = await api.post('/pharmacy/stock-movements/quick-adjustment', data);
    return response.data;
  }
};

// Serviço para Ajustes de Estoque
export const stockAdjustmentService = {
  // Listar ajustes
  async getAll(params?: {
    page?: number;
    per_page?: number;
    status?: string;
  }): Promise<{ items: StockAdjustment[]; total: number; page: number; per_page: number; pages: number }> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString());
    if (params?.status) searchParams.append('status', params.status);
    
    const response = await api.get(`/pharmacy/stock-adjustments/?${searchParams.toString()}`);
    return response.data;
  },

  // Obter ajuste por ID
  async getById(id: number): Promise<StockAdjustment> {
    const response = await api.get(`/pharmacy/stock-adjustments/${id}`);
    return response.data;
  },

  // Criar ajuste
  async create(data: StockAdjustmentCreate): Promise<StockAdjustment> {
    const response = await api.post('/pharmacy/stock-adjustments/', data);
    return response.data;
  },

  // Aprovar ajuste
  async approve(id: number): Promise<StockAdjustment> {
    const response = await api.post(`/pharmacy/stock-adjustments/${id}/approve`);
    return response.data;
  },

  // Rejeitar ajuste
  async reject(id: number, reason?: string): Promise<StockAdjustment> {
    const response = await api.post(`/pharmacy/stock-adjustments/${id}/reject`, { reason });
    return response.data;
  }
};

// Serviço para Transferências de Estoque
export const stockTransferService = {
  // Listar transferências
  async getAll(params?: {
    page?: number;
    per_page?: number;
    status?: string;
  }): Promise<{ items: StockTransfer[]; total: number; page: number; per_page: number; pages: number }> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString());
    if (params?.status) searchParams.append('status', params.status);
    
    const response = await api.get(`/pharmacy/stock-transfers/?${searchParams.toString()}`);
    return response.data;
  },

  // Obter transferência por ID
  async getById(id: number): Promise<StockTransfer> {
    const response = await api.get(`/pharmacy/stock-transfers/${id}`);
    return response.data;
  },

  // Criar transferência
  async create(data: StockTransferCreate): Promise<StockTransfer> {
    const response = await api.post('/pharmacy/stock-transfers/', data);
    return response.data;
  },

  // Aprovar transferência
  async approve(id: number): Promise<StockTransfer> {
    const response = await api.post(`/pharmacy/stock-transfers/${id}/approve`);
    return response.data;
  },

  // Completar transferência
  async complete(id: number): Promise<StockTransfer> {
    const response = await api.post(`/pharmacy/stock-transfers/${id}/complete`);
    return response.data;
  },

  // Cancelar transferência
  async cancel(id: number, reason?: string): Promise<StockTransfer> {
    const response = await api.post(`/pharmacy/stock-transfers/${id}/cancel`, { reason });
    return response.data;
  }
};

// Serviço para Pedidos de Compra
export const purchaseOrderService = {
  // Listar pedidos
  async getAll(params?: {
    page?: number;
    per_page?: number;
    status?: string;
  }): Promise<{ items: PurchaseOrder[]; total: number; page: number; per_page: number; pages: number }> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString());
    if (params?.status) searchParams.append('status', params.status);
    
    const response = await api.get(`/pharmacy/purchase-orders/?${searchParams.toString()}`);
    return response.data;
  },

  // Obter pedido por ID
  async getById(id: number): Promise<PurchaseOrder> {
    const response = await api.get(`/pharmacy/purchase-orders/${id}`);
    return response.data;
  },

  // Criar pedido
  async create(data: PurchaseOrderCreate): Promise<PurchaseOrder> {
    const response = await api.post('/pharmacy/purchase-orders/', data);
    return response.data;
  }
};

// Serviço para Contagens de Inventário
export const inventoryCountService = {
  // Listar contagens
  async getAll(params?: {
    page?: number;
    per_page?: number;
    status?: string;
  }): Promise<{ items: InventoryCount[]; total: number; page: number; per_page: number; pages: number }> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString());
    if (params?.status) searchParams.append('status', params.status);
    
    const response = await api.get(`/pharmacy/inventory-counts/?${searchParams.toString()}`);
    return response.data;
  },

  // Obter contagem por ID
  async getById(id: number): Promise<InventoryCount> {
    const response = await api.get(`/pharmacy/inventory-counts/${id}`);
    return response.data;
  },

  // Criar contagem
  async create(data: InventoryCountCreate): Promise<InventoryCount> {
    const response = await api.post('/pharmacy/inventory-counts/', data);
    return response.data;
  }
};

// Serviço para Preços de Fornecedor
export const supplierPriceService = {
  // Listar preços por produto
  async getByProduct(productId: number): Promise<SupplierProductPrice[]> {
    const response = await api.get(`/pharmacy/products/${productId}/supplier-prices`);
    return response.data;
  },

  // Criar preço de fornecedor
  async create(data: SupplierProductPriceCreate): Promise<SupplierProductPrice> {
    const response = await api.post('/pharmacy/supplier-prices/', data);
    return response.data;
  }
};

// Serviço para Relatórios
export const inventoryReportService = {
  // Relatório de inventário
  async getInventoryReport(inventoryId: number): Promise<StockInventoryReport[]> {
    const response = await api.get(`/pharmacy/reports/inventory-report/${inventoryId}`);
    return response.data;
  },

  // Resumo de estoque
  async getStockSummary(params?: StockReportRequest): Promise<StockInventoryReport[]> {
    const searchParams = new URLSearchParams();
    
    if (params?.date_from) searchParams.append('date_from', params.date_from);
    if (params?.date_to) searchParams.append('date_to', params.date_to);
    if (params?.product_ids?.length) {
      params.product_ids.forEach(id => searchParams.append('product_ids', id.toString()));
    }
    if (params?.category_ids?.length) {
      params.category_ids.forEach(id => searchParams.append('category_ids', id.toString()));
    }
    if (params?.department_id) searchParams.append('department_id', params.department_id.toString());
    if (params?.include_inactive !== undefined) searchParams.append('include_inactive', params.include_inactive.toString());
    
    const response = await api.get(`/pharmacy/reports/stock-summary?${searchParams.toString()}`);
    return response.data;
  },

  // Produtos com estoque baixo
  async getLowStockItems(): Promise<LowStockItem[]> {
    const response = await api.get('/pharmacy/reports/low-stock');
    return response.data;
  },

  // Produtos próximos ao vencimento
  async getExpiringItems(days?: number): Promise<ExpiringItem[]> {
    const searchParams = new URLSearchParams();
    if (days) searchParams.append('days', days.toString());
    
    const response = await api.get(`/pharmacy/reports/expiring-items?${searchParams.toString()}`);
    return response.data;
  },

  // Resumo de movimentações
  async getMovementSummary(params?: {
    date_from?: string;
    date_to?: string;
    product_ids?: number[];
  }): Promise<StockMovementSummary[]> {
    const searchParams = new URLSearchParams();
    
    if (params?.date_from) searchParams.append('date_from', params.date_from);
    if (params?.date_to) searchParams.append('date_to', params.date_to);
    if (params?.product_ids?.length) {
      params.product_ids.forEach(id => searchParams.append('product_ids', id.toString()));
    }
    
    const response = await api.get(`/pharmacy/reports/movement-summary?${searchParams.toString()}`);
    return response.data;
  }
};

// Serviço para Dashboard/Estatísticas
export const inventoryStatsService = {
  // Obter estatísticas do dashboard
  async getDashboardStats(): Promise<InventoryStats> {
    const response = await api.get('/pharmacy/dashboard/stats');
    return response.data;
  }
};