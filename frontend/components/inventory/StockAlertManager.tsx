'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AlertTriangle, 
  Package, 
  Calendar, 
  ShoppingCart, 
  Eye, 
  X,
  Bell,
  Settings,
  Plus
} from 'lucide-react';
import { LowStockItem, ExpiringItem } from '@/types/inventory';
import { formatDistanceToNow, format, isAfter, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface StockAlertManagerProps {
  lowStockItems: LowStockItem[];
  expiringItems: ExpiringItem[];
  isLoading?: boolean;
  onCreatePurchaseOrder?: (productId: string) => void;
  onDismissAlert?: (alertId: string, type: 'low_stock' | 'expiring') => void;
  onUpdateStockLimits?: (productId: string, minStock: number, maxStock: number) => void;
}

interface AlertSettings {
  lowStockEnabled: boolean;
  expiringEnabled: boolean;
  expiringDays: number;
  emailNotifications: boolean;
  systemNotifications: boolean;
}

export function StockAlertManager({
  lowStockItems,
  expiringItems,
  isLoading = false,
  onCreatePurchaseOrder,
  onDismissAlert,
  onUpdateStockLimits
}: StockAlertManagerProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [newMinStock, setNewMinStock] = useState('');
  const [newMaxStock, setNewMaxStock] = useState('');
  const [alertSettings, setAlertSettings] = useState<AlertSettings>({
    lowStockEnabled: true,
    expiringEnabled: true,
    expiringDays: 30,
    emailNotifications: true,
    systemNotifications: true
  });

  const getUrgencyLevel = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry <= 7) return 'critical';
    if (daysUntilExpiry <= 30) return 'warning';
    return 'info';
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const handleUpdateStockLimits = () => {
    if (selectedProduct && newMinStock && newMaxStock && onUpdateStockLimits) {
      onUpdateStockLimits(selectedProduct, parseInt(newMinStock), parseInt(newMaxStock));
      setSelectedProduct(null);
      setNewMinStock('');
      setNewMaxStock('');
    }
  };

  const totalAlerts = lowStockItems.length + expiringItems.length;
  const criticalAlerts = expiringItems.filter(item => getUrgencyLevel(item.expiry_date) === 'critical').length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alertas de Estoque
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com resumo */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Alertas de Estoque
              {totalAlerts > 0 && (
                <Badge variant={criticalAlerts > 0 ? "destructive" : "secondary"}>
                  {totalAlerts}
                </Badge>
              )}
            </CardTitle>
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Configurações de Alertas</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Alertas de estoque baixo</Label>
                    <input
                      type="checkbox"
                      checked={alertSettings.lowStockEnabled}
                      onChange={(e) => setAlertSettings(prev => ({ ...prev, lowStockEnabled: e.target.checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Alertas de vencimento</Label>
                    <input
                      type="checkbox"
                      checked={alertSettings.expiringEnabled}
                      onChange={(e) => setAlertSettings(prev => ({ ...prev, expiringEnabled: e.target.checked }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Dias para alerta de vencimento</Label>
                    <Input
                      type="number"
                      value={alertSettings.expiringDays}
                      onChange={(e) => setAlertSettings(prev => ({ ...prev, expiringDays: parseInt(e.target.value) }))}
                      min="1"
                      max="365"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Notificações por email</Label>
                    <input
                      type="checkbox"
                      checked={alertSettings.emailNotifications}
                      onChange={(e) => setAlertSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        {totalAlerts === 0 ? (
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum alerta ativo no momento</p>
              <p className="text-sm">Todos os produtos estão com estoque adequado</p>
            </div>
          </CardContent>
        ) : (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                <Package className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold text-orange-600">{lowStockItems.length}</div>
                <div className="text-sm text-orange-700">Estoque Baixo</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-red-600" />
                <div className="text-2xl font-bold text-red-600">{expiringItems.length}</div>
                <div className="text-sm text-red-700">Próximos ao Vencimento</div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Alertas de Estoque Baixo */}
      {lowStockItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <Package className="h-5 w-5" />
              Produtos com Estoque Baixo ({lowStockItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockItems.map((item) => (
                <Alert key={item.product_id} className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-orange-800">{item.product_name}</h4>
                        <p className="text-sm text-orange-700">Código: {item.product_code}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-orange-700 border-orange-300">
                          Estoque: {item.current_stock}
                        </Badge>
                        <Badge variant="outline" className="text-orange-700 border-orange-300">
                          Mínimo: {item.min_stock}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      {onCreatePurchaseOrder && (
                        <Button 
                          size="sm" 
                          onClick={() => onCreatePurchaseOrder(item.product_id)}
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Criar Pedido
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedProduct(item.product_id)}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Ajustar Limites
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Produto
                      </Button>
                      {onDismissAlert && (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => onDismissAlert(item.product_id, 'low_stock')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alertas de Vencimento */}
      {expiringItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Calendar className="h-5 w-5" />
              Produtos Próximos ao Vencimento ({expiringItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expiringItems.map((item) => {
                const urgency = getUrgencyLevel(item.expiry_date);
                const urgencyColor = getUrgencyColor(urgency);
                
                return (
                  <Alert key={`${item.product_id}-${item.batch_number}`} className={`border-red-200 ${urgencyColor}`}>
                    <Calendar className="h-4 w-4" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{item.product_name}</h4>
                          <p className="text-sm opacity-75">Lote: {item.batch_number}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={urgencyColor}>
                            {urgency === 'critical' ? 'Crítico' : urgency === 'warning' ? 'Atenção' : 'Informativo'}
                          </Badge>
                          <Badge variant="outline">
                            Qtd: {item.quantity}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm opacity-75 mb-3">
                        Vence em: {formatDistanceToNow(new Date(item.expiry_date), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })} ({format(new Date(item.expiry_date), 'dd/MM/yyyy')})
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Lote
                        </Button>
                        <Button size="sm" variant="outline">
                          <Package className="h-4 w-4 mr-1" />
                          Movimentar
                        </Button>
                        {onDismissAlert && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => onDismissAlert(`${item.product_id}-${item.batch_number}`, 'expiring')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Alert>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog para ajustar limites de estoque */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajustar Limites de Estoque</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="min-stock">Estoque Mínimo</Label>
              <Input
                id="min-stock"
                type="number"
                value={newMinStock}
                onChange={(e) => setNewMinStock(e.target.value)}
                placeholder="Digite o estoque mínimo"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-stock">Estoque Máximo</Label>
              <Input
                id="max-stock"
                type="number"
                value={newMaxStock}
                onChange={(e) => setNewMaxStock(e.target.value)}
                placeholder="Digite o estoque máximo"
                min="0"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedProduct(null)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateStockLimits}>
                Salvar Alterações
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}