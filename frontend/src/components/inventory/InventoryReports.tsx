'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts'
import { 
  FileText, 
  Download, 
  Filter, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Users, 
  Building, 
  Truck,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Activity,
  Target,
  Zap
} from 'lucide-react'
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

type ReportType = 'consumption' | 'movements' | 'suppliers' | 'expiration' | 'costs' | 'performance'
type ReportPeriod = '7d' | '30d' | '90d' | '6m' | '1y' | 'custom'
type ExportFormat = 'pdf' | 'excel' | 'csv'

interface ReportFilters {
  period: ReportPeriod
  startDate?: Date
  endDate?: Date
  reportType: ReportType
  category?: string
  department?: string
  supplier?: string
  itemType?: 'medication' | 'equipment' | 'supply' | 'all'
}

interface ConsumptionData {
  category: string
  consumed: number
  value: number
  percentage: number
  items: {
    name: string
    consumed: number
    value: number
    unit: string
  }[]
}

interface MovementData {
  date: string
  entries: number
  exits: number
  adjustments: number
  transfers: number
  value: number
}

interface SupplierPerformance {
  id: string
  name: string
  orders: number
  delivered: number
  onTime: number
  avgDeliveryTime: number
  totalValue: number
  rating: number
  issues: number
}

interface ExpirationData {
  date: string
  expired: number
  expiring: number
  value: number
}

interface CostData {
  month: string
  medications: number
  equipment: number
  supplies: number
  total: number
}

interface PerformanceMetrics {
  stockTurnover: number
  avgLeadTime: number
  stockAccuracy: number
  fillRate: number
  costVariance: number
  wastePercentage: number
}

interface InventoryReportsProps {
  onExport?: (format: ExportFormat, reportType: ReportType, filters: ReportFilters) => void
  loading?: boolean
}

const reportTypeLabels = {
  consumption: 'Consumo por Categoria',
  movements: 'Movimentações de Estoque',
  suppliers: 'Performance de Fornecedores',
  expiration: 'Análise de Validade',
  costs: 'Análise de Custos',
  performance: 'Indicadores de Performance'
}

const periodLabels = {
  '7d': 'Últimos 7 dias',
  '30d': 'Últimos 30 dias',
  '90d': 'Últimos 90 dias',
  '6m': 'Últimos 6 meses',
  '1y': 'Último ano',
  'custom': 'Período personalizado'
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

// Mock data
const mockConsumptionData: ConsumptionData[] = [
  {
    category: 'Analgésicos',
    consumed: 1250,
    value: 15600.50,
    percentage: 35.2,
    items: [
      { name: 'Dipirona 500mg', consumed: 800, value: 400.00, unit: 'comprimido' },
      { name: 'Paracetamol 750mg', consumed: 450, value: 675.00, unit: 'comprimido' }
    ]
  },
  {
    category: 'Antibióticos',
    consumed: 890,
    value: 22400.75,
    percentage: 25.1,
    items: [
      { name: 'Amoxicilina 500mg', consumed: 600, value: 1800.00, unit: 'cápsula' },
      { name: 'Azitromicina 500mg', consumed: 290, value: 2900.00, unit: 'comprimido' }
    ]
  },
  {
    category: 'Material Cirúrgico',
    consumed: 2100,
    value: 8950.25,
    percentage: 20.3,
    items: [
      { name: 'Luva Cirúrgica', consumed: 1500, value: 3750.00, unit: 'par' },
      { name: 'Seringa 10ml', consumed: 600, value: 720.00, unit: 'unidade' }
    ]
  },
  {
    category: 'Equipamentos',
    consumed: 45,
    value: 125000.00,
    percentage: 19.4,
    items: [
      { name: 'Monitor Cardíaco', consumed: 2, value: 30000.00, unit: 'unidade' },
      { name: 'Desfibrilador', consumed: 1, value: 45000.00, unit: 'unidade' }
    ]
  }
]

const mockMovementData: MovementData[] = [
  { date: '2024-01-01', entries: 150, exits: 120, adjustments: 5, transfers: 8, value: 25000 },
  { date: '2024-01-02', entries: 180, exits: 140, adjustments: 3, transfers: 12, value: 28000 },
  { date: '2024-01-03', entries: 120, exits: 160, adjustments: 7, transfers: 6, value: 22000 },
  { date: '2024-01-04', entries: 200, exits: 180, adjustments: 2, transfers: 15, value: 32000 },
  { date: '2024-01-05', entries: 160, exits: 150, adjustments: 4, transfers: 10, value: 26000 },
  { date: '2024-01-06', entries: 140, exits: 130, adjustments: 6, transfers: 8, value: 24000 },
  { date: '2024-01-07', entries: 190, exits: 170, adjustments: 3, transfers: 14, value: 30000 }
]

const mockSupplierPerformance: SupplierPerformance[] = [
  {
    id: '1',
    name: 'Farmacorp Ltda',
    orders: 45,
    delivered: 42,
    onTime: 38,
    avgDeliveryTime: 4.2,
    totalValue: 125000.50,
    rating: 4.5,
    issues: 2
  },
  {
    id: '2',
    name: 'MedSupply S.A.',
    orders: 38,
    delivered: 37,
    onTime: 35,
    avgDeliveryTime: 3.8,
    totalValue: 98500.75,
    rating: 4.8,
    issues: 1
  },
  {
    id: '3',
    name: 'Cirúrgica Brasil',
    orders: 52,
    delivered: 48,
    onTime: 42,
    avgDeliveryTime: 5.1,
    totalValue: 156000.25,
    rating: 4.2,
    issues: 4
  }
]

const mockExpirationData: ExpirationData[] = [
  { date: '2024-01', expired: 12, expiring: 25, value: 8500 },
  { date: '2024-02', expired: 8, expiring: 18, value: 6200 },
  { date: '2024-03', expired: 15, expiring: 32, value: 11800 },
  { date: '2024-04', expired: 6, expiring: 22, value: 4900 },
  { date: '2024-05', expired: 10, expiring: 28, value: 7600 },
  { date: '2024-06', expired: 18, expiring: 35, value: 13200 }
]

const mockCostData: CostData[] = [
  { month: 'Jan', medications: 45000, equipment: 125000, supplies: 28000, total: 198000 },
  { month: 'Fev', medications: 52000, equipment: 98000, supplies: 32000, total: 182000 },
  { month: 'Mar', medications: 48000, equipment: 156000, supplies: 35000, total: 239000 },
  { month: 'Abr', medications: 55000, equipment: 87000, supplies: 29000, total: 171000 },
  { month: 'Mai', medications: 49000, equipment: 134000, supplies: 31000, total: 214000 },
  { month: 'Jun', medications: 58000, equipment: 112000, supplies: 38000, total: 208000 }
]

const mockPerformanceMetrics: PerformanceMetrics = {
  stockTurnover: 8.5,
  avgLeadTime: 4.2,
  stockAccuracy: 96.8,
  fillRate: 94.2,
  costVariance: -2.1,
  wastePercentage: 1.8
}

export default function InventoryReports({
  onExport,
  loading = false
}: InventoryReportsProps) {
  const [filters, setFilters] = useState<ReportFilters>({
    period: '30d',
    reportType: 'consumption',
    itemType: 'all'
  })
  
  const [showFilters, setShowFilters] = useState(false)
  const [consumptionData, setConsumptionData] = useState<ConsumptionData[]>(mockConsumptionData)
  const [movementData, setMovementData] = useState<MovementData[]>(mockMovementData)
  const [supplierData, setSupplierData] = useState<SupplierPerformance[]>(mockSupplierPerformance)
  const [expirationData, setExpirationData] = useState<ExpirationData[]>(mockExpirationData)
  const [costData, setCostData] = useState<CostData[]>(mockCostData)
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>(mockPerformanceMetrics)

  const handleFilterChange = (field: keyof ReportFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleExport = (format: ExportFormat) => {
    onExport?.(format, filters.reportType, filters)
  }

  const getPeriodDates = () => {
    const now = new Date()
    switch (filters.period) {
      case '7d':
        return { start: subDays(now, 7), end: now }
      case '30d':
        return { start: subDays(now, 30), end: now }
      case '90d':
        return { start: subDays(now, 90), end: now }
      case '6m':
        return { start: subMonths(now, 6), end: now }
      case '1y':
        return { start: subMonths(now, 12), end: now }
      case 'custom':
        return { start: filters.startDate || subDays(now, 30), end: filters.endDate || now }
      default:
        return { start: subDays(now, 30), end: now }
    }
  }

  const renderConsumptionReport = () => {
    const pieData = consumptionData.map(item => ({
      name: item.category,
      value: item.percentage,
      consumed: item.consumed,
      valueAmount: item.value
    }))

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Consumido</p>
                  <p className="text-2xl font-bold">
                    {consumptionData.reduce((sum, item) => sum + item.consumed, 0).toLocaleString()}
                  </p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                  <p className="text-2xl font-bold">
                    R$ {consumptionData.reduce((sum, item) => sum + item.value, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Categorias</p>
                  <p className="text-2xl font-bold">{consumptionData.length}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Itens Únicos</p>
                  <p className="text-2xl font-bold">
                    {consumptionData.reduce((sum, item) => sum + item.items.length, 0)}
                  </p>
                </div>
                <Target className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Consumo por Categoria (%)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`${value.toFixed(1)}%`, 'Percentual']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Items */}
          <Card>
            <CardHeader>
              <CardTitle>Itens Mais Consumidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {consumptionData.flatMap(category => 
                  category.items.map(item => ({ ...item, category: category.category }))
                )
                .sort((a, b) => b.consumed - a.consumed)
                .slice(0, 8)
                .map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{item.consumed.toLocaleString()} {item.unit}</p>
                      <p className="text-sm text-muted-foreground">
                        R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const renderMovementReport = () => {
    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Entradas</p>
                  <p className="text-2xl font-bold text-green-600">
                    {movementData.reduce((sum, item) => sum + item.entries, 0).toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Saídas</p>
                  <p className="text-2xl font-bold text-red-600">
                    {movementData.reduce((sum, item) => sum + item.exits, 0).toLocaleString()}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ajustes</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {movementData.reduce((sum, item) => sum + item.adjustments, 0)}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Transferências</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {movementData.reduce((sum, item) => sum + item.transfers, 0)}
                  </p>
                </div>
                <Truck className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Movement Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Movimentações por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={movementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => format(new Date(value), 'dd/MM')}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => format(new Date(value), 'dd/MM/yyyy')}
                />
                <Legend />
                <Bar dataKey="entries" fill="#10B981" name="Entradas" />
                <Bar dataKey="exits" fill="#EF4444" name="Saídas" />
                <Bar dataKey="adjustments" fill="#F59E0B" name="Ajustes" />
                <Bar dataKey="transfers" fill="#3B82F6" name="Transferências" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderSupplierReport = () => {
    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fornecedores Ativos</p>
                  <p className="text-2xl font-bold">{supplierData.length}</p>
                </div>
                <Building className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Pedidos</p>
                  <p className="text-2xl font-bold">
                    {supplierData.reduce((sum, supplier) => sum + supplier.orders, 0)}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Taxa de Entrega</p>
                  <p className="text-2xl font-bold">
                    {(
                      (supplierData.reduce((sum, supplier) => sum + supplier.delivered, 0) /
                      supplierData.reduce((sum, supplier) => sum + supplier.orders, 0)) * 100
                    ).toFixed(1)}%
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tempo Médio</p>
                  <p className="text-2xl font-bold">
                    {(
                      supplierData.reduce((sum, supplier) => sum + supplier.avgDeliveryTime, 0) /
                      supplierData.length
                    ).toFixed(1)} dias
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Supplier Performance Table */}
        <Card>
          <CardHeader>
            <CardTitle>Performance dos Fornecedores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Fornecedor</th>
                    <th className="text-center p-2">Pedidos</th>
                    <th className="text-center p-2">Entregues</th>
                    <th className="text-center p-2">No Prazo</th>
                    <th className="text-center p-2">Tempo Médio</th>
                    <th className="text-center p-2">Valor Total</th>
                    <th className="text-center p-2">Avaliação</th>
                    <th className="text-center p-2">Problemas</th>
                  </tr>
                </thead>
                <tbody>
                  {supplierData.map((supplier) => {
                    const deliveryRate = (supplier.delivered / supplier.orders) * 100
                    const onTimeRate = (supplier.onTime / supplier.delivered) * 100
                    
                    return (
                      <tr key={supplier.id} className="border-b hover:bg-muted/50">
                        <td className="p-2">
                          <div>
                            <p className="font-medium">{supplier.name}</p>
                            <p className="text-sm text-muted-foreground">ID: {supplier.id}</p>
                          </div>
                        </td>
                        <td className="text-center p-2">{supplier.orders}</td>
                        <td className="text-center p-2">
                          <div>
                            <p>{supplier.delivered}</p>
                            <Badge 
                              variant={deliveryRate >= 95 ? 'default' : deliveryRate >= 90 ? 'secondary' : 'destructive'}
                              className="text-xs"
                            >
                              {deliveryRate.toFixed(1)}%
                            </Badge>
                          </div>
                        </td>
                        <td className="text-center p-2">
                          <div>
                            <p>{supplier.onTime}</p>
                            <Badge 
                              variant={onTimeRate >= 90 ? 'default' : onTimeRate >= 80 ? 'secondary' : 'destructive'}
                              className="text-xs"
                            >
                              {onTimeRate.toFixed(1)}%
                            </Badge>
                          </div>
                        </td>
                        <td className="text-center p-2">
                          <Badge 
                            variant={supplier.avgDeliveryTime <= 3 ? 'default' : supplier.avgDeliveryTime <= 5 ? 'secondary' : 'destructive'}
                          >
                            {supplier.avgDeliveryTime.toFixed(1)} dias
                          </Badge>
                        </td>
                        <td className="text-center p-2">
                          R$ {supplier.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="text-center p-2">
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-yellow-500">★</span>
                            <span>{supplier.rating.toFixed(1)}</span>
                          </div>
                        </td>
                        <td className="text-center p-2">
                          <Badge 
                            variant={supplier.issues === 0 ? 'default' : supplier.issues <= 2 ? 'secondary' : 'destructive'}
                          >
                            {supplier.issues}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderExpirationReport = () => {
    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Itens Vencidos</p>
                  <p className="text-2xl font-bold text-red-600">
                    {expirationData.reduce((sum, item) => sum + item.expired, 0)}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Vencendo em Breve</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {expirationData.reduce((sum, item) => sum + item.expiring, 0)}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Perda Total</p>
                  <p className="text-2xl font-bold text-red-600">
                    R$ {expirationData.reduce((sum, item) => sum + item.value, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Taxa de Perda</p>
                  <p className="text-2xl font-bold text-orange-600">2.3%</p>
                </div>
                <TrendingDown className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expiration Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tendência de Vencimentos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={expirationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="expired" 
                  stackId="1" 
                  stroke="#EF4444" 
                  fill="#EF4444" 
                  name="Vencidos"
                />
                <Area 
                  type="monotone" 
                  dataKey="expiring" 
                  stackId="1" 
                  stroke="#F59E0B" 
                  fill="#F59E0B" 
                  name="Vencendo"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderCostReport = () => {
    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Custo Total</p>
                  <p className="text-2xl font-bold">
                    R$ {costData.reduce((sum, item) => sum + item.total, 0).toLocaleString('pt-BR')}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Medicamentos</p>
                  <p className="text-2xl font-bold">
                    R$ {costData.reduce((sum, item) => sum + item.medications, 0).toLocaleString('pt-BR')}
                  </p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Equipamentos</p>
                  <p className="text-2xl font-bold">
                    R$ {costData.reduce((sum, item) => sum + item.equipment, 0).toLocaleString('pt-BR')}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Suprimentos</p>
                  <p className="text-2xl font-bold">
                    R$ {costData.reduce((sum, item) => sum + item.supplies, 0).toLocaleString('pt-BR')}
                  </p>
                </div>
                <Package className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cost Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução de Custos por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={costData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: any) => [`R$ ${value.toLocaleString('pt-BR')}`, '']} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="medications" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Medicamentos"
                />
                <Line 
                  type="monotone" 
                  dataKey="equipment" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  name="Equipamentos"
                />
                <Line 
                  type="monotone" 
                  dataKey="supplies" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  name="Suprimentos"
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  name="Total"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderPerformanceReport = () => {
    const metrics = [
      {
        label: 'Giro de Estoque',
        value: performanceMetrics.stockTurnover,
        unit: 'x/ano',
        target: 10,
        icon: Activity,
        color: 'text-blue-600'
      },
      {
        label: 'Lead Time Médio',
        value: performanceMetrics.avgLeadTime,
        unit: 'dias',
        target: 3,
        icon: Clock,
        color: 'text-orange-600'
      },
      {
        label: 'Acurácia do Estoque',
        value: performanceMetrics.stockAccuracy,
        unit: '%',
        target: 98,
        icon: Target,
        color: 'text-green-600'
      },
      {
        label: 'Taxa de Atendimento',
        value: performanceMetrics.fillRate,
        unit: '%',
        target: 95,
        icon: CheckCircle2,
        color: 'text-green-600'
      },
      {
        label: 'Variação de Custo',
        value: performanceMetrics.costVariance,
        unit: '%',
        target: 0,
        icon: TrendingDown,
        color: 'text-red-600'
      },
      {
        label: 'Percentual de Desperdício',
        value: performanceMetrics.wastePercentage,
        unit: '%',
        target: 1,
        icon: AlertTriangle,
        color: 'text-orange-600'
      }
    ]

    return (
      <div className="space-y-6">
        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric, index) => {
            const isGood = metric.unit === '%' 
              ? (metric.label.includes('Variação') || metric.label.includes('Desperdício') 
                  ? metric.value <= metric.target 
                  : metric.value >= metric.target)
              : metric.label.includes('Lead Time')
                ? metric.value <= metric.target
                : metric.value >= metric.target
            
            const Icon = metric.icon
            
            return (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={cn("h-6 w-6", metric.color)} />
                    <Badge variant={isGood ? 'default' : 'destructive'}>
                      {isGood ? 'Dentro da Meta' : 'Fora da Meta'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                    <p className="text-2xl font-bold">
                      {metric.value.toFixed(1)}{metric.unit}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Meta: {metric.target}{metric.unit}
                    </p>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={cn(
                          "h-2 rounded-full transition-all",
                          isGood ? "bg-green-500" : "bg-red-500"
                        )}
                        style={{ 
                          width: `${Math.min(100, Math.abs(metric.value / metric.target) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo de Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-green-600">Pontos Fortes</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Alta acurácia do estoque (96.8%)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Boa taxa de atendimento (94.2%)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Baixo percentual de desperdício (1.8%)</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium text-red-600">Pontos de Melhoria</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm">Giro de estoque abaixo da meta (8.5x vs 10x)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm">Lead time acima do ideal (4.2 vs 3 dias)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm">Variação negativa de custos (-2.1%)</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderReport = () => {
    switch (filters.reportType) {
      case 'consumption':
        return renderConsumptionReport()
      case 'movements':
        return renderMovementReport()
      case 'suppliers':
        return renderSupplierReport()
      case 'expiration':
        return renderExpirationReport()
      case 'costs':
        return renderCostReport()
      case 'performance':
        return renderPerformanceReport()
      default:
        return renderConsumptionReport()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Relatórios de Inventário</h2>
          <p className="text-muted-foreground">
            Análises e insights sobre o desempenho do inventário
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('pdf')}
              disabled={loading}
            >
              <Download className="h-4 w-4 mr-1" />
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('excel')}
              disabled={loading}
            >
              <Download className="h-4 w-4 mr-1" />
              Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('csv')}
              disabled={loading}
            >
              <Download className="h-4 w-4 mr-1" />
              CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Relatório</Label>
                <select
                  value={filters.reportType}
                  onChange={(e) => handleFilterChange('reportType', e.target.value as ReportType)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  {Object.entries(reportTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label>Período</Label>
                <select
                  value={filters.period}
                  onChange={(e) => handleFilterChange('period', e.target.value as ReportPeriod)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  {Object.entries(periodLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              
              {filters.period === 'custom' && (
                <>
                  <div className="space-y-2">
                    <Label>Data Inicial</Label>
                    <Input
                      type="date"
                      value={filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : ''}
                      onChange={(e) => handleFilterChange('startDate', e.target.value ? new Date(e.target.value) : undefined)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Data Final</Label>
                    <Input
                      type="date"
                      value={filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : ''}
                      onChange={(e) => handleFilterChange('endDate', e.target.value ? new Date(e.target.value) : undefined)}
                    />
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <Label>Tipo de Item</Label>
                <select
                  value={filters.itemType}
                  onChange={(e) => handleFilterChange('itemType', e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="all">Todos</option>
                  <option value="medication">Medicamentos</option>
                  <option value="equipment">Equipamentos</option>
                  <option value="supply">Suprimentos</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Report Content */}
      {renderReport()}
    </div>
  )
}