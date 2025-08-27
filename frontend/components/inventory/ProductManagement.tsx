'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, Package, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { ProductCard } from './ProductCard';
import { ProductFilters } from './ProductFilters';
import { ProductForm } from './ProductForm';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Pagination } from '@/components/ui/pagination';
import { useProducts, useProductCategories, useDeleteProduct } from '@/hooks/useInventory';
import { Product, ProductFilters as ProductFiltersType } from '@/types/inventory';
import { cn } from '@/lib/utils';

interface ProductManagementProps {
  className?: string;
}

export function ProductManagement({ className }: ProductManagementProps) {
  const [filters, setFilters] = useState<ProductFiltersType>({
    search: '',
    category_id: undefined,
    min_stock: undefined,
    max_stock: undefined,
    is_active: undefined,
    low_stock_only: false,
    expiring_soon: false,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const pageSize = 12;

  // Hooks
  const { data: productsData, isLoading: isLoadingProducts, error: productsError } = useProducts({
    ...filters,
    page: currentPage,
    page_size: pageSize,
  });

  const { data: categories = [] } = useProductCategories();
  const deleteProductMutation = useDeleteProduct();

  const products = productsData?.items || [];
  const totalPages = Math.ceil((productsData?.total || 0) / pageSize);

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProductMutation.mutateAsync(productId);
      toast.success('Produto excluído com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir produto');
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    toast.success('Produto criado com sucesso!');
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setSelectedProduct(null);
    toast.success('Produto atualizado com sucesso!');
  };

  const handleFiltersChange = (newFilters: ProductFiltersType) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      category_id: undefined,
      min_stock: undefined,
      max_stock: undefined,
      is_active: undefined,
      low_stock_only: false,
      expiring_soon: false,
    });
    setCurrentPage(1);
  };

  if (productsError) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-red-600 mb-2">Erro ao carregar produtos</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Produtos</h2>
          <p className="text-gray-600 mt-1">
            Gerencie o catálogo de produtos farmacêuticos
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Novo Produto</DialogTitle>
              </DialogHeader>
              <ProductForm
                categories={categories}
                onSuccess={handleCreateSuccess}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <ProductFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          categories={categories}
          onClearFilters={handleClearFilters}
        />
      )}

      {/* Quick Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar produtos..."
          value={filters.search || ''}
          onChange={(e) => handleFiltersChange({ ...filters, search: e.target.value })}
          className="pl-10"
        />
      </div>

      {/* Products Grid */}
      {isLoadingProducts ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Nenhum produto encontrado"
          description="Não há produtos que correspondam aos filtros aplicados."
          action={
            <Button onClick={handleClearFilters} variant="outline">
              Limpar filtros
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={() => handleEditProduct(product)}
                onDelete={() => handleDeleteProduct(product.id)}
                className="h-full"
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <ProductForm
              product={selectedProduct}
              categories={categories}
              onSuccess={handleEditSuccess}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedProduct(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {productsData?.total || 0}
              </div>
              <div className="text-sm text-gray-600">Total de Produtos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {products.filter(p => (p.current_stock || 0) > (p.minimum_stock || 0)).length}
              </div>
              <div className="text-sm text-gray-600">Com Estoque OK</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {products.filter(p => (p.current_stock || 0) <= (p.minimum_stock || 0) && (p.current_stock || 0) > 0).length}
              </div>
              <div className="text-sm text-gray-600">Estoque Baixo</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {products.filter(p => (p.current_stock || 0) === 0).length}
              </div>
              <div className="text-sm text-gray-600">Sem Estoque</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}