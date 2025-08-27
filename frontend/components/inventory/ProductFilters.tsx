'use client';

import { useState } from 'react';
import { Filter, X, Search, Package, Calendar, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { ProductFilters as ProductFiltersType, ProductCategory } from '@/types/inventory';
import { cn } from '@/lib/utils';

interface ProductFiltersProps {
  filters: ProductFiltersType;
  onFiltersChange: (filters: ProductFiltersType) => void;
  categories?: ProductCategory[];
  onClearFilters?: () => void;
  className?: string;
}

const stockStatusOptions = [
  { value: 'all', label: 'Todos os produtos', icon: Package },
  { value: 'low_stock', label: 'Estoque baixo', icon: AlertTriangle },
  { value: 'out_of_stock', label: 'Sem estoque', icon: X },
  { value: 'expiring_soon', label: 'Vencendo em breve', icon: Calendar },
];

export function ProductFilters({
  filters,
  onFiltersChange,
  categories = [],
  onClearFilters,
  className,
}: ProductFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState<ProductFiltersType>(filters);

  const handleFilterChange = (key: keyof ProductFiltersType, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: ProductFiltersType = {
      search: '',
      category_id: undefined,
      min_stock: undefined,
      max_stock: undefined,
      is_active: undefined,
      low_stock_only: false,
      expiring_soon: false,
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    onClearFilters?.();
  };

  const hasActiveFilters = Object.values(localFilters).some(value => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.length > 0;
    if (typeof value === 'number') return value > 0;
    return value !== undefined && value !== null;
  });

  const activeFiltersCount = Object.entries(localFilters).filter(([key, value]) => {
    if (key === 'search' && value) return true;
    if (key === 'category_id' && value) return true;
    if (key === 'min_stock' && typeof value === 'number' && value > 0) return true;
    if (key === 'max_stock' && typeof value === 'number' && value > 0) return true;
    if (key === 'is_active' && typeof value === 'boolean') return true;
    if (key === 'low_stock_only' && value) return true;
    if (key === 'expiring_soon' && value) return true;
    return false;
  }).length;

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? 'Menos filtros' : 'Mais filtros'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar produtos por nome, código ou descrição..."
            value={localFilters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Quick Status Filters */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Status do Estoque</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {stockStatusOptions.map((option) => {
              const Icon = option.icon;
              let isActive = false;
              
              if (option.value === 'low_stock') isActive = localFilters.low_stock_only || false;
              else if (option.value === 'expiring_soon') isActive = localFilters.expiring_soon || false;
              else if (option.value === 'out_of_stock') isActive = localFilters.max_stock === 0;
              else if (option.value === 'all') isActive = !localFilters.low_stock_only && !localFilters.expiring_soon && localFilters.max_stock !== 0;

              return (
                <button
                  key={option.value}
                  onClick={() => {
                    if (option.value === 'low_stock') {
                      handleFilterChange('low_stock_only', !localFilters.low_stock_only);
                      handleFilterChange('expiring_soon', false);
                      handleFilterChange('max_stock', undefined);
                    } else if (option.value === 'expiring_soon') {
                      handleFilterChange('expiring_soon', !localFilters.expiring_soon);
                      handleFilterChange('low_stock_only', false);
                      handleFilterChange('max_stock', undefined);
                    } else if (option.value === 'out_of_stock') {
                      handleFilterChange('max_stock', localFilters.max_stock === 0 ? undefined : 0);
                      handleFilterChange('low_stock_only', false);
                      handleFilterChange('expiring_soon', false);
                    } else {
                      handleFilterChange('low_stock_only', false);
                      handleFilterChange('expiring_soon', false);
                      handleFilterChange('max_stock', undefined);
                    }
                  }}
                  className={cn(
                    'flex flex-col items-center gap-1 p-3 border rounded-lg transition-all text-xs',
                    isActive
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  )}
                >
                  <Icon className={cn('h-4 w-4', isActive ? 'text-blue-600' : 'text-gray-500')} />
                  <span className="font-medium">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {isExpanded && (
          <>
            <Separator />
            
            {/* Category Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Categoria</Label>
              <Select
                value={localFilters.category_id || ''}
                onValueChange={(value) => handleFilterChange('category_id', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Stock Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Estoque Mínimo</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={localFilters.min_stock || ''}
                  onChange={(e) => handleFilterChange('min_stock', e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Estoque Máximo</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="∞"
                  value={localFilters.max_stock || ''}
                  onChange={(e) => handleFilterChange('max_stock', e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Status do Produto</Label>
                <p className="text-xs text-gray-500">
                  Mostrar apenas produtos ativos
                </p>
              </div>
              <Switch
                checked={localFilters.is_active === true}
                onCheckedChange={(checked) => handleFilterChange('is_active', checked ? true : undefined)}
              />
            </div>

            {/* Advanced Toggles */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Apenas Estoque Baixo</Label>
                  <p className="text-xs text-gray-500">
                    Produtos abaixo do estoque mínimo
                  </p>
                </div>
                <Switch
                  checked={localFilters.low_stock_only || false}
                  onCheckedChange={(checked) => handleFilterChange('low_stock_only', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Vencendo em Breve</Label>
                  <p className="text-xs text-gray-500">
                    Produtos com validade próxima
                  </p>
                </div>
                <Switch
                  checked={localFilters.expiring_soon || false}
                  onCheckedChange={(checked) => handleFilterChange('expiring_soon', checked)}
                />
              </div>
            </div>
          </>
        )}

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label className="text-sm font-medium">Filtros Ativos</Label>
              <div className="flex flex-wrap gap-2">
                {localFilters.search && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Search className="h-3 w-3" />
                    Busca: {localFilters.search}
                    <button
                      onClick={() => handleFilterChange('search', '')}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {localFilters.category_id && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    Categoria: {categories.find(c => c.id === localFilters.category_id)?.name || 'Desconhecida'}
                    <button
                      onClick={() => handleFilterChange('category_id', undefined)}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {localFilters.low_stock_only && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Estoque Baixo
                    <button
                      onClick={() => handleFilterChange('low_stock_only', false)}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {localFilters.expiring_soon && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Vencendo em Breve
                    <button
                      onClick={() => handleFilterChange('expiring_soon', false)}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}