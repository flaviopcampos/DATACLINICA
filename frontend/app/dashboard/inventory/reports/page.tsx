'use client'

import { useState } from 'react'
import { Download, Filter, Calendar, TrendingUp, TrendingDown, Package, DollarSign, AlertTriangle, BarChart3, PieChart, FileText, Eye, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'

interface StockReport {
  category: string
  totalItems: number
  totalValue: number
  lowStockItems: number
  expiredItems: number
  nearExpiryItems: number
  averageRotation: number
}

interface MovementReport {
  id: string
  item: string
  category: string
  type: 'entrada' | 'saida' | 'transferencia' | 'ajuste'
  quantity: number
  date: string
  user: string
  department: string
  cost: number
}

interface CostAnalysis {
  period: string
  totalCost: number
  acquisitionCost: number
  maintenanceCost: number
  wasteCost: number
  savings: number
  costPerCategory: { category: string; cost: number; percentage: number }[]
}

interface SupplierReport {
  supplier: string
  totalOrders: number
  totalValue: number
  averageDeliveryTime: number
  onTimeDelivery: number
  qualityRating: number
  lastOrder: string
}

const mockStockReports: StockReport[] = [
  {
    category: 'Medicamentos',
    totalItems: 450,
    totalValue: 125000.00,
    lowStockItems: 25,
    expiredItems: 8,
    nearExpiryItems: 15,
    averageRotation: 2.5
  },
  {
    category: 'Equipamentos',
    totalItems: 180,
    totalValue: 850000.00,
    lowStockItems: 12,
    expiredItems: 2,
    nearExpiryItems: 5,
    averageRotation: 0.8
  },
  {
    category: 'Suprimentos',
    totalItems: 320,
    totalValue: 45000.00,
    lowStockItems: 35,
    expiredItems: 12,
    nearExpiryItems: 28,
    averageRotation: 4.2
  }
]

const mockMovements: MovementReport[] = [
  {
    id: '1',
    item: 'Dipirona 500mg',
    category: 'Medicamentos',
    type: 'entrada',
    quantity: 100,
    date: '2024-01-20',
    user: 'Ana Silva',
    department: 'Farmácia',
    cost: 1250.00
  },
  {
    id: '2',
    item: 'Monitor Cardíaco',
    category: 'Equipamentos',
    type: 'saida',
    quantity: 1,
    date: '2024-01-19',
    user: 'João Santos',
    department: 'UTI',
    cost: 15000.00
  }
]

const mockCostAnalysis: CostAnalysis = {
  period: 'Janeiro 2024',
  totalCost: 285000.00,
  acquisitionCost: 220000.00,
  maintenanceCost: 35000.00,
  wasteCost: 15000.00,
  savings: 25000.00,
  costPerCategory: [
    { category: 'Medicamentos', cost: 125000.00, percentage: 43.9 },
    { category: 'Equipamentos', cost: 120000.00, percentage: 42.1 },
    { category: 'Suprimentos', cost: 40000.00, percentage: 14.0 }
  ]
}

const mockSupplierReports: SupplierReport[] = [
  {
    supplier: 'MedSupply Brasil',
    totalOrders: 25,
    totalValue: 125000.00,
    averageDeliveryTime: 3.2,
    onTimeDelivery: 92,
    qualityRating: 4.8,
    lastOrder: '2024-01-18'
  },
  {
    supplier: 'Equipamentos Hospitalares Ltda',
    totalOrders: 12,
    totalValue: 180000.00,
    averageDeliveryTime: 5.1,
    onTimeDelivery: 87,
    qualityRating: 4.5,
    lastOrder: '2024-01-15'
  }
]

function getMovementTypeColor(type: MovementReport['type']) {
  switch (type) {
    case 'entrada': return 'bg-green-100 text-green-800'
    case 'saida': return 'bg-red-100 text-red-800'
    case 'transferencia': return 'bg-blue-100 text-blue-800'
    case 'ajuste': return 'bg-yellow-100 text-yellow-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function getMovementTypeIcon(type: MovementReport['type']) {
  switch (type) {
    case 'entrada': return <TrendingUp className="h-4 w-4" />
    case 'saida': return <TrendingDown className="h-4 w-4" />
    case 'transferencia': return <Package className="h-4 w-4" />
    case 'ajuste': return <AlertTriangle className="h-4 w-4" />
    default: return <Package className="h-4 w-4" />
  }
}

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDepartment, setSelectedDepartment] = useState('all')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios de Inventário</h1>
          <p className="text-muted-foreground">Análises e relatórios detalhados do inventário médico</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Gerar Relatório
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros de Relatório</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Período</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Última Semana</SelectItem>
                  <SelectItem value="month">Último Mês</SelectItem>
                  <SelectItem value="quarter">Último Trimestre</SelectItem>
                  <SelectItem value="year">Último Ano</SelectItem>
                  <SelectItem value="custom">Período Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  <SelectItem value="medicamentos">Medicamentos</SelectItem>
                  <SelectItem value="equipamentos">Equipamentos</SelectItem>
                  <SelectItem value="suprimentos">Suprimentos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Departamento</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os departamentos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Departamentos</SelectItem>
                  <SelectItem value="farmacia">Farmácia</SelectItem>
                  <SelectItem value="uti">UTI</SelectItem>
                  <SelectItem value="emergencia">Emergência</SelectItem>
                  <SelectItem value="cirurgia">Cirurgia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Data Personalizada</Label>
              <DatePicker />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Tabs */}
      <Tabs defaultValue="stock" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="stock">Estoque</TabsTrigger>
          <TabsTrigger value="movements">Movimentações</TabsTrigger>
          <TabsTrigger value="costs">Custos</TabsTrigger>
          <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
        </TabsList>

        {/* Stock Report */}
        <TabsContent value="stock" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockStockReports.reduce((sum, report) => sum + report.totalItems, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Distribuídos em {mockStockReports.length} categorias
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {mockStockReports.reduce((sum, report) => sum + report.totalValue, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Valor total do inventário
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {mockStockReports.reduce((sum, report) => sum + report.lowStockItems, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Itens com estoque baixo
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Itens Vencidos</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {mockStockReports.reduce((sum, report) => sum + report.expiredItems, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Itens com validade vencida
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Relatório de Estoque por Categoria</CardTitle>
              <CardDescription>
                Análise detalhada do estoque por categoria de produtos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Total de Itens</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead>Estoque Baixo</TableHead>
                      <TableHead>Vencidos</TableHead>
                      <TableHead>Próx. Vencimento</TableHead>
                      <TableHead>Rotatividade Média</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockStockReports.map((report) => {
                      const lowStockPercentage = (report.lowStockItems / report.totalItems) * 100
                      const expiredPercentage = (report.expiredItems / report.totalItems) * 100
                      
                      return (
                        <TableRow key={report.category}>
                          <TableCell className="font-medium">{report.category}</TableCell>
                          <TableCell>{report.totalItems}</TableCell>
                          <TableCell>R$ {report.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={report.lowStockItems > 0 ? 'text-yellow-600' : 'text-green-600'}>
                                {report.lowStockItems}
                              </span>
                              <Progress value={lowStockPercentage} className="w-16 h-2" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={report.expiredItems > 0 ? 'text-red-600' : 'text-green-600'}>
                              {report.expiredItems}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={report.nearExpiryItems > 0 ? 'text-orange-600' : 'text-green-600'}>
                              {report.nearExpiryItems}
                            </span>
                          </TableCell>
                          <TableCell>{report.averageRotation.toFixed(1)}x</TableCell>
                          <TableCell>
                            <Badge className={
                              expiredPercentage > 5 ? 'bg-red-100 text-red-800' :
                              lowStockPercentage > 10 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }>
                              {
                                expiredPercentage > 5 ? 'Crítico' :
                                lowStockPercentage > 10 ? 'Atenção' :
                                'Normal'
                              }
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Movements Report */}
        <TabsContent value="movements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Movimentações</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,247</div>
                <p className="text-xs text-muted-foreground">
                  +12% em relação ao mês anterior
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Entradas</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">485</div>
                <p className="text-xs text-muted-foreground">
                  Itens recebidos no período
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saídas</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">672</div>
                <p className="text-xs text-muted-foreground">
                  Itens consumidos no período
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transferências</CardTitle>
                <Package className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">90</div>
                <p className="text-xs text-muted-foreground">
                  Entre departamentos
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Histórico de Movimentações</CardTitle>
              <CardDescription>
                Registro detalhado das movimentações de estoque
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Departamento</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Custo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockMovements.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell>{new Date(movement.date).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell className="font-medium">{movement.item}</TableCell>
                        <TableCell>{movement.category}</TableCell>
                        <TableCell>
                          <Badge className={getMovementTypeColor(movement.type)}>
                            {getMovementTypeIcon(movement.type)}
                            <span className="ml-1 capitalize">{movement.type}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>{movement.quantity}</TableCell>
                        <TableCell>{movement.department}</TableCell>
                        <TableCell>{movement.user}</TableCell>
                        <TableCell>R$ {movement.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cost Analysis */}
        <TabsContent value="costs" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {mockCostAnalysis.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">
                  {mockCostAnalysis.period}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aquisições</CardTitle>
                <Package className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  R$ {mockCostAnalysis.acquisitionCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">
                  {((mockCostAnalysis.acquisitionCost / mockCostAnalysis.totalCost) * 100).toFixed(1)}% do total
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Manutenção</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  R$ {mockCostAnalysis.maintenanceCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">
                  {((mockCostAnalysis.maintenanceCost / mockCostAnalysis.totalCost) * 100).toFixed(1)}% do total
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Desperdício</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  R$ {mockCostAnalysis.wasteCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">
                  {((mockCostAnalysis.wasteCost / mockCostAnalysis.totalCost) * 100).toFixed(1)}% do total
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Economia</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  R$ {mockCostAnalysis.savings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Economia obtida no período
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Custos por Categoria</CardTitle>
                <CardDescription>
                  Análise percentual dos custos por categoria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCostAnalysis.costPerCategory.map((item) => (
                    <div key={item.category} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{item.category}</span>
                        <span>R$ {item.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({item.percentage}%)</span>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Análise de Tendências</CardTitle>
                <CardDescription>
                  Comparativo com períodos anteriores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-green-800">Redução de Custos</p>
                      <p className="text-sm text-green-600">Em relação ao mês anterior</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">-8.5%</p>
                      <p className="text-sm text-green-600">R$ 24.500</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-blue-800">Eficiência de Estoque</p>
                      <p className="text-sm text-blue-600">Rotatividade melhorada</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">+12%</p>
                      <p className="text-sm text-blue-600">Mais eficiente</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <div>
                      <p className="font-medium text-orange-800">Desperdício</p>
                      <p className="text-sm text-orange-600">Itens vencidos/perdidos</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-orange-600">-3.2%</p>
                      <p className="text-sm text-orange-600">Redução</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Suppliers Report */}
        <TabsContent value="suppliers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Desempenho de Fornecedores</CardTitle>
              <CardDescription>
                Análise de performance e qualidade dos fornecedores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead>Total de Pedidos</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead>Tempo Médio Entrega</TableHead>
                      <TableHead>Entrega no Prazo</TableHead>
                      <TableHead>Avaliação Qualidade</TableHead>
                      <TableHead>Último Pedido</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockSupplierReports.map((supplier) => (
                      <TableRow key={supplier.supplier}>
                        <TableCell className="font-medium">{supplier.supplier}</TableCell>
                        <TableCell>{supplier.totalOrders}</TableCell>
                        <TableCell>R$ {supplier.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell>{supplier.averageDeliveryTime} dias</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={supplier.onTimeDelivery >= 90 ? 'text-green-600' : supplier.onTimeDelivery >= 80 ? 'text-yellow-600' : 'text-red-600'}>
                              {supplier.onTimeDelivery}%
                            </span>
                            <Progress value={supplier.onTimeDelivery} className="w-16 h-2" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500">★</span>
                            <span>{supplier.qualityRating.toFixed(1)}</span>
                          </div>
                        </TableCell>
                        <TableCell>{new Date(supplier.lastOrder).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>
                          <Badge className={
                            supplier.qualityRating >= 4.5 && supplier.onTimeDelivery >= 90 ? 'bg-green-100 text-green-800' :
                            supplier.qualityRating >= 4.0 && supplier.onTimeDelivery >= 80 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {
                              supplier.qualityRating >= 4.5 && supplier.onTimeDelivery >= 90 ? 'Excelente' :
                              supplier.qualityRating >= 4.0 && supplier.onTimeDelivery >= 80 ? 'Bom' :
                              'Atenção'
                            }
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Indicadores de Performance</CardTitle>
                <CardDescription>
                  KPIs principais do inventário médico
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Taxa de Rotatividade</span>
                      <span className="font-medium">2.8x/mês</span>
                    </div>
                    <Progress value={70} className="h-2" />
                    <p className="text-xs text-muted-foreground">Meta: 3.0x/mês</p>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Acuracidade do Estoque</span>
                      <span className="font-medium text-green-600">96.5%</span>
                    </div>
                    <Progress value={96.5} className="h-2" />
                    <p className="text-xs text-muted-foreground">Meta: 95%</p>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Disponibilidade de Itens</span>
                      <span className="font-medium text-green-600">98.2%</span>
                    </div>
                    <Progress value={98.2} className="h-2" />
                    <p className="text-xs text-muted-foreground">Meta: 97%</p>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Redução de Desperdício</span>
                      <span className="font-medium text-orange-600">3.2%</span>
                    </div>
                    <Progress value={68} className="h-2" />
                    <p className="text-xs text-muted-foreground">Meta: &lt;2%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alertas e Recomendações</CardTitle>
                <CardDescription>
                  Insights baseados em dados do inventário
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800">Estoque Baixo Detectado</p>
                      <p className="text-sm text-yellow-600">25 itens estão abaixo do nível mínimo recomendado</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-800">Oportunidade de Economia</p>
                      <p className="text-sm text-blue-600">Consolidar pedidos pode reduzir custos em 8%</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <Package className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800">Performance Excelente</p>
                      <p className="text-sm text-green-600">Rotatividade de medicamentos 15% acima da meta</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-800">Ação Necessária</p>
                      <p className="text-sm text-red-600">8 itens vencidos precisam ser removidos do estoque</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}