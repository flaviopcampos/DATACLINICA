'use client';

import { useState } from 'react';
import { Search, Filter, Plus, Package, AlertTriangle, TrendingUp, TrendingDown, Calendar, FileText, Settings, Eye, MoreHorizontal, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  useInventoryStats, 
  useLowStockItems, 
  useExpiringItems,
  useStockMovements 
} from '@/hooks/useInventory';
import { InventoryStats, ProductManagement, StockAlertManager, StockMovementManager } from '@/components/inventory';
import { useStockAlerts } from '@/hooks/useStockAlerts';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Pagination } from '@/components/ui/pagination';

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Hooks
  const { data: stats, isLoading: statsLoading } = useInventoryStats();
  const { data: movementsData, isLoading: movementsLoading } = useStockMovements({
    page: 1,
    page_size: 10,
  });
  const {
    lowStockItems,
    expiringItems,
    alertStats,
    isLoading: alertsLoading,
    dismissAlert
  } = useStockAlerts();

  const movements = movementsData?.items || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Farmácia &amp; Estoque</h1>
          <p className="text-gray-600 mt-1">
            Gerencie produtos farmacêuticos, estoque e movimentações
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Relatórios
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Produto
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_products}</div>
              <p className="text-xs text-muted-foreground">produtos cadastrados</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {stats.total_stock_value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
              </div>
              <p className="text-xs text-muted-foreground">em estoque</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.low_stock_count || 0}</div>
              <p className="text-xs text-muted-foreground">produtos</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vencendo</CardTitle>
              <Calendar className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.expiring_count || 0}</div>
              <p className="text-xs text-muted-foreground">próximos 30 dias</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="alerts" className="relative">
            Alertas
            {alertStats.totalAlerts > 0 && (
              <Badge 
                variant={alertStats.criticalCount > 0 ? "destructive" : "secondary"} 
                className="ml-1 h-5 w-5 p-0 text-xs"
              >
                {alertStats.totalAlerts}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="movements">Movimentações</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Estatísticas do Inventário */}
          <InventoryStats 
            stats={stats} 
            isLoading={statsLoading} 
          />

          {/* Sistema de Alertas */}
          <StockAlertManager
            lowStockItems={lowStockItems}
            expiringItems={expiringItems}
            isLoading={alertsLoading}
            onDismissAlert={dismissAlert}
          />
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <ProductManagement />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <StockAlertManager
            lowStockItems={lowStockItems}
            expiringItems={expiringItems}
            isLoading={alertsLoading}
            onDismissAlert={dismissAlert}
          />
        </TabsContent>

        <TabsContent value="movements" className="space-y-6">
          <StockMovementManager />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios Disponíveis</CardTitle>
                <CardDescription>
                  Gere relatórios detalhados sobre seu inventário
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Relatório de Estoque
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Movimentações por Período
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Produtos com Estoque Baixo
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Produtos Próximos ao Vencimento
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>
                  Operações frequentes do inventário
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Entrada
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Package className="h-4 w-4 mr-2" />
                  Ajuste de Estoque
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Search className="h-4 w-4 mr-2" />
                  Contagem de Inventário
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Transferência entre Estoques
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}