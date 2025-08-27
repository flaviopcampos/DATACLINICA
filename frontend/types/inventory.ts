// Tipos base para o sistema de inventário e farmácia

// Categoria de Produto
export interface ProductCategory {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductCategoryCreate {
  name: string;
  description?: string;
}

// Produto
export interface Product {
  id: number;
  name: string;
  description?: string;
  category_id: number;
  category?: ProductCategory;
  sku: string;
  barcode?: string;
  unit_of_measure: string;
  minimum_stock_level: number;
  maximum_stock_level: number;
  reorder_point: number;
  unit_cost: number;
  selling_price: number;
  is_active: boolean;
  requires_prescription: boolean;
  controlled_substance: boolean;
  storage_conditions?: string;
  manufacturer?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductCreate {
  name: string;
  description?: string;
  category_id: number;
  sku: string;
  barcode?: string;
  unit_of_measure: string;
  minimum_stock_level: number;
  maximum_stock_level: number;
  reorder_point: number;
  unit_cost: number;
  selling_price: number;
  is_active?: boolean;
  requires_prescription?: boolean;
  controlled_substance?: boolean;
  storage_conditions?: string;
  manufacturer?: string;
}

export interface ProductUpdate {
  name?: string;
  description?: string;
  category_id?: number;
  sku?: string;
  barcode?: string;
  unit_of_measure?: string;
  minimum_stock_level?: number;
  maximum_stock_level?: number;
  reorder_point?: number;
  unit_cost?: number;
  selling_price?: number;
  is_active?: boolean;
  requires_prescription?: boolean;
  controlled_substance?: boolean;
  storage_conditions?: string;
  manufacturer?: string;
}

// Lote de Produto
export interface ProductBatch {
  id: number;
  product_id: number;
  product?: Product;
  batch_number: string;
  manufacturing_date: string;
  expiry_date: string;
  quantity_received: number;
  quantity_remaining: number;
  unit_cost: number;
  supplier_id?: number;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductBatchCreate {
  product_id: number;
  batch_number: string;
  manufacturing_date: string;
  expiry_date: string;
  quantity_received: number;
  unit_cost: number;
  supplier_id?: number;
  notes?: string;
}

export interface ProductBatchUpdate {
  batch_number?: string;
  manufacturing_date?: string;
  expiry_date?: string;
  quantity_received?: number;
  quantity_remaining?: number;
  unit_cost?: number;
  supplier_id?: number;
  notes?: string;
  is_active?: boolean;
}

// Movimentação de Estoque
export interface StockMovement {
  id: number;
  product_id: number;
  product?: Product;
  batch_id?: number;
  batch?: ProductBatch;
  movement_type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER' | 'EXPIRED' | 'DAMAGED';
  quantity: number;
  unit_cost?: number;
  reference_type?: 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'TRANSFER' | 'PRESCRIPTION' | 'RETURN';
  reference_id?: number;
  notes?: string;
  user_id: number;
  department_id?: number;
  created_at: string;
}

export interface StockMovementCreate {
  product_id: number;
  batch_id?: number;
  movement_type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER' | 'EXPIRED' | 'DAMAGED';
  quantity: number;
  unit_cost?: number;
  reference_type?: 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'TRANSFER' | 'PRESCRIPTION' | 'RETURN';
  reference_id?: number;
  notes?: string;
  department_id?: number;
}

// Inventário de Estoque
export interface StockInventory {
  id: number;
  product_id: number;
  product?: Product;
  batch_id?: number;
  batch?: ProductBatch;
  current_quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  last_movement_date?: string;
  department_id?: number;
  location?: string;
  updated_at: string;
}

export interface StockInventoryCreate {
  product_id: number;
  batch_id?: number;
  current_quantity: number;
  reserved_quantity?: number;
  department_id?: number;
  location?: string;
}

export interface StockInventoryUpdate {
  current_quantity?: number;
  reserved_quantity?: number;
  location?: string;
}

// Contagem de Inventário
export interface InventoryCount {
  id: number;
  inventory_id: number;
  inventory?: StockInventory;
  counted_quantity: number;
  system_quantity: number;
  variance: number;
  count_date: string;
  counted_by: number;
  notes?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
}

export interface InventoryCountCreate {
  inventory_id: number;
  counted_quantity: number;
  notes?: string;
}

// Ajuste de Estoque
export interface StockAdjustment {
  id: number;
  product_id: number;
  product?: Product;
  batch_id?: number;
  batch?: ProductBatch;
  adjustment_type: 'INCREASE' | 'DECREASE';
  quantity: number;
  reason: string;
  notes?: string;
  user_id: number;
  approved_by?: number;
  approved_at?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
}

export interface StockAdjustmentCreate {
  product_id: number;
  batch_id?: number;
  adjustment_type: 'INCREASE' | 'DECREASE';
  quantity: number;
  reason: string;
  notes?: string;
}

// Transferência de Estoque
export interface StockTransfer {
  id: number;
  from_department_id: number;
  to_department_id: number;
  transfer_date: string;
  status: 'PENDING' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  requested_by: number;
  approved_by?: number;
  completed_by?: number;
  created_at: string;
  items?: StockTransferItem[];
}

export interface StockTransferItem {
  id: number;
  transfer_id: number;
  product_id: number;
  product?: Product;
  batch_id?: number;
  batch?: ProductBatch;
  quantity_requested: number;
  quantity_transferred: number;
  notes?: string;
}

export interface StockTransferCreate {
  from_department_id: number;
  to_department_id: number;
  notes?: string;
  items: {
    product_id: number;
    batch_id?: number;
    quantity_requested: number;
    notes?: string;
  }[];
}

// Pedido de Compra
export interface PurchaseOrder {
  id: number;
  supplier_id: number;
  order_date: string;
  expected_delivery_date?: string;
  status: 'DRAFT' | 'SENT' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED';
  total_amount: number;
  notes?: string;
  created_by: number;
  approved_by?: number;
  created_at: string;
  items?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id: number;
  purchase_order_id: number;
  product_id: number;
  product?: Product;
  quantity_ordered: number;
  quantity_received: number;
  unit_cost: number;
  total_cost: number;
  notes?: string;
}

export interface PurchaseOrderCreate {
  supplier_id: number;
  expected_delivery_date?: string;
  notes?: string;
  items: {
    product_id: number;
    quantity_ordered: number;
    unit_cost: number;
    notes?: string;
  }[];
}

// Preço de Fornecedor
export interface SupplierProductPrice {
  id: number;
  supplier_id: number;
  product_id: number;
  product?: Product;
  unit_cost: number;
  minimum_order_quantity: number;
  lead_time_days: number;
  is_preferred: boolean;
  valid_from: string;
  valid_to?: string;
  created_at: string;
}

export interface SupplierProductPriceCreate {
  supplier_id: number;
  product_id: number;
  unit_cost: number;
  minimum_order_quantity: number;
  lead_time_days: number;
  is_preferred?: boolean;
  valid_from: string;
  valid_to?: string;
}

// Relatórios
export interface LowStockItem {
  product_id: number;
  product_name: string;
  current_stock: number;
  minimum_stock_level: number;
  reorder_point: number;
  category_name: string;
  days_until_stockout: number;
}

export interface ExpiringItem {
  product_id: number;
  product_name: string;
  batch_id: number;
  batch_number: string;
  expiry_date: string;
  quantity_remaining: number;
  days_until_expiry: number;
}

export interface StockMovementSummary {
  product_id: number;
  product_name: string;
  total_in: number;
  total_out: number;
  net_movement: number;
  movement_count: number;
}

export interface StockInventoryReport {
  product_id: number;
  product_name: string;
  category_name: string;
  current_quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  unit_cost: number;
  total_value: number;
  last_movement_date?: string;
}

export interface StockReportRequest {
  date_from?: string;
  date_to?: string;
  product_ids?: number[];
  category_ids?: number[];
  department_id?: number;
  movement_type?: string;
  include_inactive?: boolean;
}

// Filtros
export interface ProductFilters {
  search?: string;
  category_id?: number;
  is_active?: boolean;
  requires_prescription?: boolean;
  controlled_substance?: boolean;
  low_stock?: boolean;
  expiring_soon?: boolean;
}

export interface StockMovementFilters {
  product_id?: number;
  movement_type?: string;
  reference_type?: string;
  date_from?: string;
  date_to?: string;
  department_id?: number;
}

export interface InventoryFilters {
  product_id?: number;
  category_id?: number;
  department_id?: number;
  low_stock?: boolean;
  out_of_stock?: boolean;
}

// Tipos de resposta da API
export interface ProductsResponse {
  items: Product[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface StockMovementsResponse {
  items: StockMovement[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface InventoryResponse {
  items: StockInventory[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

// Dashboard Stats
export interface InventoryStats {
  total_products: number;
  active_products: number;
  low_stock_products: number;
  out_of_stock_products: number;
  expiring_products: number;
  total_inventory_value: number;
  recent_movements: number;
  pending_adjustments: number;
}