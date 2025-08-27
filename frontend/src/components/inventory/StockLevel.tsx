'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle, 
  CheckCircle2, 
  Package, 
  BarChart3, 
  Settings, 
  RefreshCw, 
  Target,
  Activity,
  Calendar,
  Clock,
  Zap,
  Shield,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

type StockStatus = 'optimal' | 'low' | 'critical' | 'out_of_stock' | 'overstocked'
type TrendDirection = 'up' | 'down' | 'stable'

interface StockLevel {
  id: string
  itemId: string
  itemName: string
  itemCode: string
  category: string
  currentStock: number
  minStock: number
  maxStock: number
  reorderPoint: number
  safetyStock: number
  unit: string
  location: string
  department: string
  supplier: string
  leadTime: number // days
  avgConsumption: number // per day
  lastRestocked: Date
  nextReorderDate?: Date
  status: StockStatus
  trend: TrendDirection
  trendPercentage: number
  daysOfStock: number
  turnoverRate: number
  cost: number
  totalValue: number
  autoReorder: boolean
  critical: boolean
  controlled: boolean
}

interface StockLevelProps {
  items?: StockLevel[]
  onUpdateStock?: (itemId: string, newStock: number) => void
  onSetReorderPoint?: (itemId: string, reorderPoint: number) => void
  onToggleAutoReorder?: (itemId: string, enabled: boolean) => void
  showTrends?: boolean
  showPredictions?: boolean
  allowQuickActions?: boolean
  className?: string
}

// Mock data
const mockStockLevels: StockLevel[] = [
  {
    id: '1',
    itemId: 'MED001',
    itemName: 'Dipirona 500mg',
    itemCode: '7891234567890',
    category: 'Analgésicos',
    currentStock: 150,
    minStock: 50,
    maxStock: 500,
    reorderPoint: 100,
    safetyStock: 25,
    unit: 'comprimido',
    location: 'A1-B2-C3',
    department: 'Farmácia',
    supplier: 'Fornecedor A',
    leadTime: 7,
    avgConsumption: 15,
    lastRestocked: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    nextReorderDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
    status: 'optimal',
    trend: 'down',
    trendPercentage: -12,
    daysOfStock: 10,
    turnoverRate: 2.4,
    cost: 0.25,
    totalValue: 37.50,
    autoReorder: true,
    critical: false,
    controlled: false
  },
  {
    id: '2',
    itemId: 'MED002',
    itemName: 'Paracetamol 750mg',
    itemCode: '7891234567891',
    category: 'Analgésicos',
    currentStock: 25,
    minStock: 50,
    maxStock: 300,
    reorderPoint: 75,
    safetyStock: 20,
    unit: 'comprimido',
    location: 'A1-B2-C4',
    department: 'Farmácia',
    supplier: 'Fornecedor B',
    leadTime: 5,
    avgConsumption: 20,
    lastRestocked: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    status: 'critical',
    trend: 'down',
    trendPercentage: -25,
    daysOfStock: 1.25,
    turnoverRate: 3.2,
    cost: 0.35,
    totalValue: 8.75,
    autoReorder: true,
    critical: true,
    controlled: false
  },
  {
    id: '3',
    itemId: 'MED003',
    itemName: 'Amoxicilina 500mg',
    itemCode: '7891234567892',
    category: 'Antibióticos',
    currentStock: 0,
    minStock: 30,
    maxStock: 200,
    reorderPoint: 50,
    safetyStock: 15,
    unit: 'cápsula',
    location: 'A2-B1-C2',
    department: 'Farmácia',
    supplier: 'Fornecedor C',
    leadTime: 10,
    avgConsumption: 8,
    lastRestocked: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
    status: 'out_of_stock',
    trend: 'down',
    trendPercentage: -100,
    daysOfStock: 0,
    turnoverRate: 1.8,
    cost: 0.80,
    totalValue: 0,
    autoReorder: false,
    critical: true,
    controlled: true
  },
  {
    id: '4',
    itemId: 'SUP001',
    itemName: 'Seringa 10ml',
    itemCode: '7891234567893',
    category: 'Suprimentos',
    currentStock: 800,
    minStock: 100,
    maxStock: 500,
    reorderPoint: 200,
    safetyStock: 50,
    unit: 'unidade',
    location: 'B1-A3-C1',
    department: 'Enfermagem',
    supplier: 'Fornecedor D',
    leadTime: 3,
    avgConsumption: 25,
    lastRestocked: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    status: 'overstocked',
    trend: 'up',
    trendPercentage: 60,
    daysOfStock: 32,
    turnoverRate: 0.8,
    cost: 1.20,
    totalValue: 960,
    autoReorder: false,
    critical: false,
    controlled: false
  },
  {
    id: '5',
    itemId: 'EQP001',
    itemName: 'Termômetro Digital',
    itemCode: '7891234567894',
    category: 'Equipamentos',
    currentStock: 12,
    minStock: 5,
    maxStock: 20,
    reorderPoint: 8,
    safetyStock: 2,
    unit: 'unidade',
    location: 'C1-A1-B2',
    department: 'Enfermagem',
    supplier: 'Fornecedor E',
    leadTime: 14,
    avgConsumption: 0.5,
    lastRestocked: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
    status: 'optimal',
    trend: 'stable',
    trendPercentage: 2,
    daysOfStock: 24,
    turnoverRate: 1.2,
    cost: 45.00,
    totalValue: 540,
    autoReorder: true,
    critical: false,
    controlled: false
  }
]

export default function StockLevel({
  items = mockStockLevels,
  onUpdateStock,
  onSetReorderPoint,
  onToggleAutoReorder,
  showTrends = true,
  showPredictions = true,
  allowQuickActions = true,
  className
}: StockLevelProps) {
  const [selectedItem, setSelectedItem] = useState<StockLevel | null>(null)
  const [filterStatus, setFilterStatus] = useState<StockStatus | 'all'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'status' | 'trend'>('status')

  // Calculate summary statistics
  const totalItems = items.length
  const criticalItems = items.filter(item => item.status === 'critical' || item.status === 'out_of_stock').length
  const lowStockItems = items.filter(item => item.status === 'low').length
  const overstockedItems = items.filter(item => item.status === 'overstocked').length
  const autoReorderItems = items.filter(item => item.autoReorder).length
  const totalValue = items.reduce((sum, item) => sum + item.totalValue, 0)

  // Filter and sort items
  const filteredItems = items
    .filter(item => filterStatus === 'all' || item.status === filterStatus)
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.itemName.localeCompare(b.itemName)
        case 'stock':
          return b.currentStock - a.currentStock
        case 'status':
          const statusOrder = { 'out_of_stock': 0, 'critical': 1, 'low': 2, 'optimal': 3, 'overstocked': 4 }
          return statusOrder[a.status] - statusOrder[b.status]
        case 'trend':
          return b.trendPercentage - a.trendPercentage
        default:
          return 0
      }
    })

  const getStatusColor = (status: StockStatus) => {
    switch (status) {
      case 'optimal':
        return 'text-green-600'
      case 'low':
        return 'text-yellow-600'
      case 'critical':
        return 'text-orange-600'
      case 'out_of_stock':
        return 'text-red-600'
      case 'overstocked':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusBadge = (status: StockStatus) => {
    switch (status) {
      case 'optimal':
        return <Badge variant="default" className="bg-green-600">Ótimo</Badge>
      case 'low':
        return <Badge variant="secondary">Baixo</Badge>
      case 'critical':
        return <Badge variant="destructive">Crítico</Badge>
      case 'out_of_stock':
        return <Badge variant="destructive">Sem Estoque</Badge>
      case 'overstocked':
        return <Badge variant="outline" className="border-blue-600 text-blue-600">Excesso</Badge>
      default:
        return <Badge variant="outline">Desconhecido</Badge>
    }
  }

  const getStockPercentage = (item: StockLevel) => {
    return Math.min(100, (item.currentStock / item.maxStock) * 100)
  }

  const getTrendIcon = (trend: TrendDirection, percentage: number) => {
    if (trend === 'up') {
      return <TrendingUp className={cn('h-4 w-4', percentage > 0 ? 'text-green-600' : 'text-red-600')} />
    } else if (trend === 'down') {
      return <TrendingDown className={cn('h-4 w-4', percentage < 0 ? 'text-red-600' : 'text-green-600')} />
    } else {
      return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Níveis de Estoque</h3>
          <p className="text-sm text-muted-foreground">
            Monitore e gerencie os níveis de estoque em tempo real
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Itens</p>
                <p className="text-2xl font-bold">{totalItems}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Críticos</p>
                <p className="text-2xl font-bold text-red-600">{criticalItems}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Estoque Baixo</p>
                <p className="text-2xl font-bold text-yellow-600">{lowStockItems}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Excesso</p>
                <p className="text-2xl font-bold text-blue-600">{overstockedItems}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Auto-Reposição</p>
                <p className="text-2xl font-bold text-green-600">{autoReorderItems}</p>
              </div>
              <Zap className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-lg font-bold">{formatCurrency(totalValue)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label>Status:</Label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as StockStatus | 'all')}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="all">Todos</option>
              <option value="optimal">Ótimo</option>
              <option value="low">Baixo</option>
              <option value="critical">Crítico</option>
              <option value="out_of_stock">Sem Estoque</option>
              <option value="overstocked">Excesso</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <Label>Ordenar por:</Label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'stock' | 'status' | 'trend')}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="status">Status</option>
              <option value="name">Nome</option>
              <option value="stock">Estoque</option>
              <option value="trend">Tendência</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stock Levels List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredItems.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                {/* Item Info */}
                <div className="lg:col-span-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.itemName}</h4>
                      <p className="text-sm text-muted-foreground">{item.category}</p>
                      <p className="text-xs text-muted-foreground font-mono">{item.itemCode}</p>
                    </div>
                    {item.critical && <Shield className="h-5 w-5 text-red-600" />}
                    {item.controlled && <AlertTriangle className="h-5 w-5 text-orange-600" />}
                  </div>
                </div>
                
                {/* Stock Level */}
                <div className="lg:col-span-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Estoque Atual</span>
                      {getStatusBadge(item.status)}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{item.currentStock} {item.unit}</span>
                        <span className="text-muted-foreground">{getStockPercentage(item).toFixed(0)}%</span>
                      </div>
                      <Progress value={getStockPercentage(item)} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Min: {item.minStock}</span>
                        <span>Reposição: {item.reorderPoint}</span>
                        <span>Max: {item.maxStock}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Trend and Predictions */}
                {showTrends && (
                  <div className="lg:col-span-2">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getTrendIcon(item.trend, item.trendPercentage)}
                        <span className={cn('text-sm font-medium', 
                          item.trendPercentage > 0 ? 'text-green-600' : 
                          item.trendPercentage < 0 ? 'text-red-600' : 'text-gray-600'
                        )}>
                          {item.trendPercentage > 0 ? '+' : ''}{item.trendPercentage}%
                        </span>
                      </div>
                      
                      {showPredictions && (
                        <div className="text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {item.daysOfStock} dias restantes
                          </div>
                          <div className="flex items-center gap-1">
                            <Activity className="h-3 w-3" />
                            Giro: {item.turnoverRate}x/ano
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Location and Supplier */}
                <div className="lg:col-span-2">
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="text-muted-foreground">Local:</span>
                      <span className="ml-1 font-mono">{item.location}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Depto:</span>
                      <span className="ml-1">{item.department}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Fornecedor:</span>
                      <span className="ml-1">{item.supplier}</span>
                    </div>
                  </div>
                </div>
                
                {/* Value and Auto-reorder */}
                <div className="lg:col-span-2">
                  <div className="space-y-2">
                    <div className="text-sm">
                      <div className="font-medium">{formatCurrency(item.totalValue)}</div>
                      <div className="text-muted-foreground">{formatCurrency(item.cost)}/{item.unit}</div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {item.autoReorder ? (
                        <Badge variant="default" className="bg-green-600">
                          <Zap className="h-3 w-3 mr-1" />
                          Auto
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          Manual
                        </Badge>
                      )}
                      
                      {item.nextReorderDate && (
                        <div className="text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {item.nextReorderDate.toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Quick Actions */}
              {allowQuickActions && (
                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedItem(item)}
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Ajustar Níveis
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onToggleAutoReorder?.(item.itemId, !item.autoReorder)}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      {item.autoReorder ? 'Desativar' : 'Ativar'} Auto-Reposição
                    </Button>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Última reposição: {item.lastRestocked.toLocaleDateString()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Nenhum item encontrado</h3>
            <p className="text-muted-foreground">
              Não há itens que correspondam aos filtros selecionados.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Level Adjustment Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Ajustar Níveis de Estoque</CardTitle>
              <p className="text-sm text-muted-foreground">{selectedItem.itemName}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Estoque Mínimo</Label>
                  <Input
                    type="number"
                    defaultValue={selectedItem.minStock}
                    min="0"
                  />
                </div>
                <div>
                  <Label>Estoque Máximo</Label>
                  <Input
                    type="number"
                    defaultValue={selectedItem.maxStock}
                    min="0"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Ponto de Reposição</Label>
                  <Input
                    type="number"
                    defaultValue={selectedItem.reorderPoint}
                    min="0"
                  />
                </div>
                <div>
                  <Label>Estoque de Segurança</Label>
                  <Input
                    type="number"
                    defaultValue={selectedItem.safetyStock}
                    min="0"
                  />
                </div>
              </div>
              
              <div>
                <Label>Lead Time (dias)</Label>
                <Input
                  type="number"
                  defaultValue={selectedItem.leadTime}
                  min="1"
                />
              </div>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Os novos níveis serão aplicados imediatamente e podem afetar os alertas automáticos.
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedItem(null)}
                >
                  Cancelar
                </Button>
                <Button onClick={() => setSelectedItem(null)}>
                  Salvar Alterações
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}