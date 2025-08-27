'use client';

import { AlertTriangle, Calendar, Package, X, Eye, ShoppingCart } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { LowStockItem, ExpiringItem } from '@/types/inventory';
import { cn } from '@/lib/utils';

interface StockAlertProps {
  lowStockItems?: LowStockItem[];
  expiringItems?: ExpiringItem[];
  onViewProduct?: (productId: string) => void;
  onCreatePurchaseOrder?: (productId: string) => void;
  onDismiss?: () => void;
  className?: string;
}

export function StockAlert({
  lowStockItems = [],
  expiringItems = [],
  onViewProduct,
  onCreatePurchaseOrder,
  onDismiss,
  className,
}: StockAlertProps) {
  const hasLowStock = lowStockItems.length > 0;
  const hasExpiring = expiringItems.length > 0;
  const hasAlerts = hasLowStock || hasExpiring;

  if (!hasAlerts) {
    return null;
  }

  const formatDaysUntilExpiry = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Vencido';
    if (diffDays === 0) return 'Vence hoje';
    if (diffDays === 1) return 'Vence amanhã';
    return `${diffDays} dias`;
  };

  const getExpiryUrgency = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'expired';
    if (diffDays <= 7) return 'critical';
    if (diffDays <= 30) return 'warning';
    return 'normal';
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Low Stock Alert */}
      {hasLowStock && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <div className="flex items-center justify-between">
              <div>
                <strong>{lowStockItems.length} produtos</strong> com estoque baixo precisam de reposição.
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="link" 
                  size="sm" 
                  className="p-0 h-auto text-orange-600 hover:text-orange-700"
                >
                  Ver todos
                </Button>
                {onDismiss && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0 text-orange-600 hover:text-orange-700"
                    onClick={onDismiss}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Expiring Items Alert */}
      {hasExpiring && (
        <Alert className="border-red-200 bg-red-50">
          <Calendar className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="flex items-center justify-between">
              <div>
                <strong>{expiringItems.length} produtos</strong> vencem nos próximos 30 dias.
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="link" 
                  size="sm" 
                  className="p-0 h-auto text-red-600 hover:text-red-700"
                >
                  Ver todos
                </Button>
                {onDismiss && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                    onClick={onDismiss}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Detailed Alert Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Low Stock Details */}
        {hasLowStock && (
          <Card className="border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-orange-800 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Estoque Baixo ({lowStockItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {lowStockItems.slice(0, 5).map((item, index) => (
                  <div key={`${item.product_id}-${index}`} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.product_name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">
                          Atual: {item.current_stock} {item.unit}
                        </span>
                        <span className="text-xs text-orange-600">
                          Mín: {item.minimum_stock} {item.unit}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      {onViewProduct && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() => onViewProduct(item.product_id)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      )}
                      {onCreatePurchaseOrder && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-orange-600 hover:text-orange-700"
                          onClick={() => onCreatePurchaseOrder(item.product_id)}
                        >
                          <ShoppingCart className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                
                {lowStockItems.length > 5 && (
                  <div className="text-center pt-2">
                    <Button variant="link" size="sm" className="text-orange-600">
                      Ver mais {lowStockItems.length - 5} produtos
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Expiring Items Details */}
        {hasExpiring && (
          <Card className="border-red-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-800 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Próximos ao Vencimento ({expiringItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {expiringItems.slice(0, 5).map((item, index) => {
                  const urgency = getExpiryUrgency(item.expiry_date);
                  const daysText = formatDaysUntilExpiry(item.expiry_date);
                  
                  return (
                    <div key={`${item.product_id}-${item.batch_id}-${index}`} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.product_name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">
                            Lote: {item.batch_number}
                          </span>
                          <span className="text-xs text-gray-500">
                            Qtd: {item.quantity} {item.unit}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <Badge 
                          variant={urgency === 'expired' || urgency === 'critical' ? 'destructive' : 'secondary'}
                          className={cn(
                            'text-xs',
                            urgency === 'expired' && 'bg-red-600',
                            urgency === 'critical' && 'bg-red-500',
                            urgency === 'warning' && 'bg-orange-500 text-white'
                          )}
                        >
                          {daysText}
                        </Badge>
                        {onViewProduct && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                            onClick={() => onViewProduct(item.product_id)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {expiringItems.length > 5 && (
                  <div className="text-center pt-2">
                    <Button variant="link" size="sm" className="text-red-600">
                      Ver mais {expiringItems.length - 5} produtos
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Package className="h-4 w-4" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" className="text-xs">
              <ShoppingCart className="h-3 w-3 mr-1" />
              Criar Pedido de Compra
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              <Package className="h-3 w-3 mr-1" />
              Ajustar Estoque
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Configurar Alertas
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}