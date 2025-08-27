'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Package, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Truck
} from 'lucide-react'
import Link from 'next/link'

interface InventoryStats {
  totalItems: number
  lowStockItems: number
  expiringItems: number
  totalValue: number
  monthlyConsumption: number
  suppliers: number
  categories: {
    medications: number
    equipment: number
    supplies: number
  }
  recentMovements: {
    entries: number
    exits: number
    transfers: number
  }
  alerts: {
    critical: number
    high: number
    medium: number
    low: number
  }
}

interface InventoryDashboardProps {
  stats: InventoryStats
  className?: string
}

const mockStats: InventoryStats = {
  totalItems: 2847,
  lowStockItems: 23,
  expiringItems: 12,
  totalValue: 485750.00,
  monthlyConsumption: 125300.00,
  suppliers: 45,
  categories: {
    medications: 1250,
    equipment: 387,
    supplies: 1210
  },
  recentMovements: {
    entries: 156,
    exits: 234,
    transfers: 45
  },
  alerts: {
    critical: 3,
    high: 8,
    medium: 15,
    low: 7
  }
}

export function InventoryDashboard({ stats = mockStats, className }: InventoryDashboardProps) {
  const lowStockPercentage = (stats.lowStockItems / stats.totalItems) * 100
  const expiringPercentage = (stats.expiringItems / stats.totalItems) * 100
  const totalAlerts = stats.alerts.critical + stats.alerts.high + stats.alerts.medium + stats.alerts.low

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">
              Distribuídos em {Object.keys(stats.categories).length} categorias
            </p>
          </CardContent>
        </Card>

        {/* Low Stock */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.lowStockItems}</div>
            <div className="flex items-center space-x-2">
              <Progress value={lowStockPercentage} className="flex-1 h-2" />
              <span className="text-xs text-muted-foreground">
                {lowStockPercentage.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Expiring Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Itens Vencendo</CardTitle>
            <Clock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.expiringItems}</div>
            <div className="flex items-center space-x-2">
              <Progress value={expiringPercentage} className="flex-1 h-2" />
              <span className="text-xs text-muted-foreground">
                {expiringPercentage.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Total Value */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Consumo mensal: R$ {stats.monthlyConsumption.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Categories and Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribuição por Categoria</CardTitle>
            <CardDescription>Quantidade de itens por categoria</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-sm font-medium">Medicamentos</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold">{stats.categories.medications}</span>
                  <Badge variant="secondary">
                    {((stats.categories.medications / stats.totalItems) * 100).toFixed(1)}%
                  </Badge>
                </div>
              </div>
              <Progress 
                value={(stats.categories.medications / stats.totalItems) * 100} 
                className="h-2" 
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-sm font-medium">Equipamentos</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold">{stats.categories.equipment}</span>
                  <Badge variant="secondary">
                    {((stats.categories.equipment / stats.totalItems) * 100).toFixed(1)}%
                  </Badge>
                </div>
              </div>
              <Progress 
                value={(stats.categories.equipment / stats.totalItems) * 100} 
                className="h-2" 
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full" />
                  <span className="text-sm font-medium">Suprimentos</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold">{stats.categories.supplies}</span>
                  <Badge variant="secondary">
                    {((stats.categories.supplies / stats.totalItems) * 100).toFixed(1)}%
                  </Badge>
                </div>
              </div>
              <Progress 
                value={(stats.categories.supplies / stats.totalItems) * 100} 
                className="h-2" 
              />
            </div>

            <div className="pt-4 space-y-2">
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard/inventory/medications">
                  Ver Medicamentos
                  <ArrowUpRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Movements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Movimentações Recentes</CardTitle>
            <CardDescription>Últimas 24 horas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                  <ArrowDownRight className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600">{stats.recentMovements.entries}</div>
                <div className="text-xs text-muted-foreground">Entradas</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mx-auto mb-2">
                  <ArrowUpRight className="h-6 w-6 text-red-600" />
                </div>
                <div className="text-2xl font-bold text-red-600">{stats.recentMovements.exits}</div>
                <div className="text-xs text-muted-foreground">Saídas</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600">{stats.recentMovements.transfers}</div>
                <div className="text-xs text-muted-foreground">Transferências</div>
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard/inventory/reports">
                  Ver Relatórios Completos
                  <ArrowUpRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Central de Alertas</CardTitle>
            <CardDescription>Status dos alertas ativos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <div>
                  <div className="text-lg font-bold text-red-600">{stats.alerts.critical}</div>
                  <div className="text-xs text-muted-foreground">Críticos</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-orange-500 rounded-full" />
                <div>
                  <div className="text-lg font-bold text-orange-600">{stats.alerts.high}</div>
                  <div className="text-xs text-muted-foreground">Alta</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <div>
                  <div className="text-lg font-bold text-yellow-600">{stats.alerts.medium}</div>
                  <div className="text-xs text-muted-foreground">Média</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <div>
                  <div className="text-lg font-bold text-blue-600">{stats.alerts.low}</div>
                  <div className="text-xs text-muted-foreground">Baixa</div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard/inventory/alerts">
                  Ver Todos os Alertas ({totalAlerts})
                  <ArrowUpRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ações Rápidas</CardTitle>
            <CardDescription>Acesso rápido às principais funcionalidades</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/inventory/medications">
                  <Package className="h-4 w-4 mr-2" />
                  Medicamentos
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/inventory/equipment">
                  <Activity className="h-4 w-4 mr-2" />
                  Equipamentos
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/inventory/supplies">
                  <Package className="h-4 w-4 mr-2" />
                  Suprimentos
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/inventory/orders">
                  <Truck className="h-4 w-4 mr-2" />
                  Pedidos
                </Link>
              </Button>
            </div>

            <div className="pt-2">
              <Button asChild className="w-full">
                <Link href="/dashboard/inventory/orders">
                  <Package className="h-4 w-4 mr-2" />
                  Novo Pedido
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fornecedores Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.suppliers}</div>
            <p className="text-xs text-muted-foreground">
              Parceiros cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consumo Mensal</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {stats.monthlyConsumption.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Média dos últimos 3 meses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Atualização</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date().toLocaleDateString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default InventoryDashboard