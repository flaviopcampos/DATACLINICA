'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import {
  Package,
  Pill,
  Stethoscope,
  Bandage,
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Plus,
  FileText,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Activity
} from 'lucide-react'

// Mock data para demonstração
const inventoryStats = {
  totalItems: 1247,
  lowStock: 23,
  expiringSoon: 15,
  totalValue: 125000,
  monthlyConsumption: 8500,
  activeSuppliers: 12
}

const categoryStats = [
  {
    id: 'medications',
    name: 'Medicamentos',
    icon: Pill,
    total: 456,
    lowStock: 12,
    value: 85000,
    color: 'bg-blue-500',
    href: '/dashboard/inventory/medications'
  },
  {
    id: 'equipment',
    name: 'Equipamentos',
    icon: Stethoscope,
    total: 234,
    lowStock: 5,
    value: 35000,
    color: 'bg-green-500',
    href: '/dashboard/inventory/equipment'
  },
  {
    id: 'supplies',
    name: 'Suprimentos',
    icon: Bandage,
    total: 557,
    lowStock: 6,
    value: 5000,
    color: 'bg-purple-500',
    href: '/dashboard/inventory/supplies'
  }
]

const recentMovements = [
  {
    id: 1,
    item: 'Paracetamol 500mg',
    type: 'saída',
    quantity: 50,
    date: '2024-01-15',
    user: 'Dr. Silva',
    reason: 'Prescrição médica'
  },
  {
    id: 2,
    item: 'Seringa 10ml',
    type: 'entrada',
    quantity: 200,
    date: '2024-01-15',
    user: 'Farmácia Central',
    reason: 'Reposição de estoque'
  },
  {
    id: 3,
    item: 'Termômetro Digital',
    type: 'saída',
    quantity: 2,
    date: '2024-01-14',
    user: 'Enfermeira Ana',
    reason: 'Uso em consultório'
  }
]

const lowStockItems = [
  {
    id: 1,
    name: 'Dipirona 500mg',
    category: 'Medicamento',
    current: 15,
    minimum: 50,
    unit: 'comprimidos',
    supplier: 'Farmácia ABC'
  },
  {
    id: 2,
    name: 'Luvas Descartáveis',
    category: 'Suprimento',
    current: 25,
    minimum: 100,
    unit: 'pares',
    supplier: 'Medical Supply'
  },
  {
    id: 3,
    name: 'Álcool 70%',
    category: 'Suprimento',
    current: 8,
    minimum: 20,
    unit: 'litros',
    supplier: 'Química Ltda'
  }
]

const expiringItems = [
  {
    id: 1,
    name: 'Amoxicilina 500mg',
    category: 'Medicamento',
    quantity: 30,
    expiryDate: '2024-02-15',
    daysToExpiry: 15,
    batch: 'AMX2024A'
  },
  {
    id: 2,
    name: 'Soro Fisiológico',
    category: 'Medicamento',
    quantity: 45,
    expiryDate: '2024-02-20',
    daysToExpiry: 20,
    batch: 'SF2024B'
  }
]

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventário Médico</h1>
          <p className="text-gray-600 mt-1">
            Gerencie medicamentos, equipamentos e suprimentos médicos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Novo Item
          </Button>
        </div>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Itens</p>
                <p className="text-2xl font-bold">{inventoryStats.totalItems.toLocaleString()}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Estoque Baixo</p>
                <p className="text-2xl font-bold text-red-600">{inventoryStats.lowStock}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vencendo</p>
                <p className="text-2xl font-bold text-orange-600">{inventoryStats.expiringSoon}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold">R$ {inventoryStats.totalValue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Consumo Mensal</p>
                <p className="text-2xl font-bold">R$ {inventoryStats.monthlyConsumption.toLocaleString()}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Fornecedores</p>
                <p className="text-2xl font-bold">{inventoryStats.activeSuppliers}</p>
              </div>
              <Users className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categorias do Inventário */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categoryStats.map((category) => {
          const Icon = category.icon
          return (
            <Link key={category.id} href={category.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${category.color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        <CardDescription>{category.total} itens</CardDescription>
                      </div>
                    </div>
                    {category.lowStock > 0 && (
                      <Badge variant="destructive">{category.lowStock} baixo</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Valor Total:</span>
                      <span className="font-medium">R$ {category.value.toLocaleString()}</span>
                    </div>
                    <Progress 
                      value={((category.total - category.lowStock) / category.total) * 100} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Estoque adequado</span>
                      <span>{Math.round(((category.total - category.lowStock) / category.total) * 100)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Tabs de Conteúdo */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="movements">Movimentações</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Itens com Estoque Baixo */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Estoque Baixo
                  </CardTitle>
                  <Link href="/dashboard/inventory/alerts">
                    <Button variant="outline" size="sm">Ver Todos</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lowStockItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-600">{item.category} • {item.supplier}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-red-600">
                          {item.current}/{item.minimum} {item.unit}
                        </p>
                        <Progress 
                          value={(item.current / item.minimum) * 100} 
                          className="h-1 w-16 mt-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Itens Vencendo */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-500" />
                    Vencendo em Breve
                  </CardTitle>
                  <Link href="/dashboard/inventory/alerts">
                    <Button variant="outline" size="sm">Ver Todos</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expiringItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-600">{item.category} • Lote: {item.batch}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-orange-600">
                          {item.daysToExpiry} dias
                        </p>
                        <p className="text-xs text-gray-600">{item.expiryDate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="movements" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Movimentações Recentes</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Buscar movimentações..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Período
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentMovements.map((movement) => (
                  <div key={movement.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        movement.type === 'entrada' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {movement.type === 'entrada' ? (
                          <TrendingUp className={`h-4 w-4 ${
                            movement.type === 'entrada' ? 'text-green-600' : 'text-red-600'
                          }`} />
                        ) : (
                          <TrendingDown className={`h-4 w-4 ${
                            movement.type === 'entrada' ? 'text-green-600' : 'text-red-600'
                          }`} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{movement.item}</p>
                        <p className="text-sm text-gray-600">{movement.reason}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${
                        movement.type === 'entrada' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {movement.type === 'entrada' ? '+' : '-'}{movement.quantity}
                      </p>
                      <p className="text-sm text-gray-600">{movement.date} • {movement.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Central de Alertas</CardTitle>
              <CardDescription>
                Monitore alertas de estoque baixo, itens vencendo e outras notificações importantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Acesse a página de alertas para ver todos os avisos</p>
                <Link href="/dashboard/inventory/alerts">
                  <Button>Ver Alertas Completos</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios de Inventário</CardTitle>
              <CardDescription>
                Gere relatórios detalhados sobre consumo, custos e movimentações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link href="/dashboard/inventory/reports">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-blue-500" />
                        <div>
                          <p className="font-medium">Relatório de Consumo</p>
                          <p className="text-sm text-gray-600">Análise mensal de uso</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/dashboard/inventory/reports">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-8 w-8 text-green-500" />
                        <div>
                          <p className="font-medium">Relatório de Custos</p>
                          <p className="text-sm text-gray-600">Análise financeira</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/dashboard/inventory/reports">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Activity className="h-8 w-8 text-purple-500" />
                        <div>
                          <p className="font-medium">Relatório de Movimentações</p>
                          <p className="text-sm text-gray-600">Histórico detalhado</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/dashboard/inventory/medications">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <Pill className="h-6 w-6" />
                <span>Medicamentos</span>
              </Button>
            </Link>
            
            <Link href="/dashboard/inventory/equipment">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <Stethoscope className="h-6 w-6" />
                <span>Equipamentos</span>
              </Button>
            </Link>
            
            <Link href="/dashboard/inventory/supplies">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <Bandage className="h-6 w-6" />
                <span>Suprimentos</span>
              </Button>
            </Link>
            
            <Link href="/dashboard/inventory/orders">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <ShoppingCart className="h-6 w-6" />
                <span>Pedidos</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}