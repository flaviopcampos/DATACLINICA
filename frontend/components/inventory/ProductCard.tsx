'use client';

import { useState } from 'react';
import { MoreHorizontal, Package, AlertTriangle, Calendar, Edit, Trash2, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Product } from '@/types/inventory';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onViewStock?: (product: Product) => void;
  onViewMovements?: (product: Product) => void;
  className?: string;
}

export function ProductCard({
  product,
  onEdit,
  onDelete,
  onViewStock,
  onViewMovements,
  className,
}: ProductCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isLowStock = product.current_stock !== undefined && 
    product.minimum_stock !== undefined && 
    product.current_stock <= product.minimum_stock;

  const isExpiringSoon = product.batches?.some(batch => {
    if (!batch.expiry_date) return false;
    const expiryDate = new Date(batch.expiry_date);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiryDate <= thirtyDaysFromNow;
  });

  const getStockStatus = () => {
    if (isLowStock) return { label: 'Estoque Baixo', variant: 'destructive' as const };
    if (product.current_stock === 0) return { label: 'Sem Estoque', variant: 'destructive' as const };
    return { label: 'Em Estoque', variant: 'default' as const };
  };

  const stockStatus = getStockStatus();

  return (
    <Card className={cn(
      'hover:shadow-md transition-all duration-200 group relative',
      isLowStock && 'border-orange-200 bg-orange-50/30',
      product.current_stock === 0 && 'border-red-200 bg-red-50/30',
      className
    )}>
      {/* Status Indicators */}
      <div className="absolute top-2 right-2 flex gap-1">
        {isLowStock && (
          <div className="w-2 h-2 bg-orange-500 rounded-full" title="Estoque baixo" />
        )}
        {isExpiringSoon && (
          <div className="w-2 h-2 bg-red-500 rounded-full" title="Produto vencendo" />
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-medium line-clamp-2 group-hover:text-blue-600 transition-colors">
              {product.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">Código: {product.code}</span>
              {!product.is_active && (
                <Badge variant="secondary" className="text-xs">
                  Inativo
                </Badge>
              )}
            </div>
          </div>
          
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(product)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Produto
                </DropdownMenuItem>
              )}
              {onViewStock && (
                <DropdownMenuItem onClick={() => onViewStock(product)}>
                  <Package className="h-4 w-4 mr-2" />
                  Gerenciar Estoque
                </DropdownMenuItem>
              )}
              {onViewMovements && (
                <DropdownMenuItem onClick={() => onViewMovements(product)}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Ver Movimentações
                </DropdownMenuItem>
              )}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDelete(product)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Category */}
        {product.category && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Categoria:</span>
            <Badge variant="outline" className="text-xs">
              {product.category.name}
            </Badge>
          </div>
        )}

        {/* Stock Information */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Estoque Atual:</span>
            <div className="flex items-center gap-2">
              <span className={cn(
                'text-sm font-medium',
                isLowStock ? 'text-orange-600' : 
                product.current_stock === 0 ? 'text-red-600' : 'text-gray-900'
              )}>
                {product.current_stock || 0} {product.unit}
              </span>
              <Badge variant={stockStatus.variant} className="text-xs">
                {stockStatus.label}
              </Badge>
            </div>
          </div>

          {product.minimum_stock !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Estoque Mínimo:</span>
              <span className="text-xs text-gray-600">
                {product.minimum_stock} {product.unit}
              </span>
            </div>
          )}
        </div>

        {/* Price Information */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Preço Unitário:</span>
          <span className="text-sm font-medium text-green-600">
            R$ {product.unit_price?.toLocaleString('pt-BR', { 
              minimumFractionDigits: 2,
              maximumFractionDigits: 2 
            }) || '0,00'}
          </span>
        </div>

        {/* Total Value */}
        {product.current_stock && product.unit_price && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Valor Total:</span>
            <span className="text-sm font-medium text-blue-600">
              R$ {(product.current_stock * product.unit_price).toLocaleString('pt-BR', { 
                minimumFractionDigits: 2,
                maximumFractionDigits: 2 
              })}
            </span>
          </div>
        )}

        {/* Alerts */}
        {(isLowStock || isExpiringSoon) && (
          <div className="pt-2 border-t space-y-1">
            {isLowStock && (
              <div className="flex items-center gap-2 text-orange-600">
                <AlertTriangle className="h-3 w-3" />
                <span className="text-xs">Estoque baixo - reabastecer</span>
              </div>
            )}
            {isExpiringSoon && (
              <div className="flex items-center gap-2 text-red-600">
                <Calendar className="h-3 w-3" />
                <span className="text-xs">Lotes próximos ao vencimento</span>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1 text-xs"
            onClick={() => onEdit?.(product)}
          >
            <Edit className="h-3 w-3 mr-1" />
            Editar
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1 text-xs"
            onClick={() => onViewStock?.(product)}
          >
            <Package className="h-3 w-3 mr-1" />
            Estoque
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}