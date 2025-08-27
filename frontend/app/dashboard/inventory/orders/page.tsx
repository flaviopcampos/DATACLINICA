'use client'

import { useState } from 'react'
import { Plus, Search, Filter, Download, Upload, Eye, Edit, Trash2, Package, Clock, CheckCircle, XCircle, AlertCircle, Calendar, DollarSign, User, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { DatePicker } from '@/components/ui/date-picker'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'

interface OrderItem {
  id: string
  name: string
  category: string
  quantity: number
  unitPrice: number
  totalPrice: number
  supplier: string
  description?: string
}

interface Order {
  id: string
  orderNumber: string
  supplier: string
  status: 'pending' | 'approved' | 'sent' | 'partial' | 'delivered' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  orderDate: string
  expectedDelivery: string
  deliveryDate?: string
  totalItems: number
  totalValue: number
  requestedBy: string
  approvedBy?: string
  department: string
  items: OrderItem[]
  notes?: string
  trackingNumber?: string
}

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'PED-2024-001',
    supplier: 'MedSupply Brasil',
    status: 'delivered',
    priority: 'medium',
    orderDate: '2024-01-15',
    expectedDelivery: '2024-01-20',
    deliveryDate: '2024-01-19',
    totalItems: 15,
    totalValue: 2850.00,
    requestedBy: 'Dr. Ana Silva',
    approvedBy: 'João Santos',
    department: 'Farmácia',
    trackingNumber: 'BR123456789',
    items: [
      { id: '1', name: 'Dipirona 500mg', category: 'Medicamentos', quantity: 100, unitPrice: 12.50, totalPrice: 1250.00, supplier: 'MedSupply Brasil' },
      { id: '2', name: 'Soro Fisiológico 500ml', category: 'Soluções', quantity: 50, unitPrice: 8.00, totalPrice: 400.00, supplier: 'MedSupply Brasil' }
    ],
    notes: 'Entrega urgente para reposição de estoque'
  },
  {
    id: '2',
    orderNumber: 'PED-2024-002',
    supplier: 'Equipamentos Hospitalares Ltda',
    status: 'sent',
    priority: 'high',
    orderDate: '2024-01-18',
    expectedDelivery: '2024-01-25',
    totalItems: 8,
    totalValue: 15750.00,
    requestedBy: 'Enf. Maria Costa',
    approvedBy: 'João Santos',
    department: 'UTI',
    trackingNumber: 'EQ987654321',
    items: [
      { id: '3', name: 'Monitor Multiparâmetros', category: 'Equipamentos', quantity: 2, unitPrice: 7500.00, totalPrice: 15000.00, supplier: 'Equipamentos Hospitalares Ltda' }
    ]
  }
]

const mockSuppliers = [
  'MedSupply Brasil',
  'Equipamentos Hospitalares Ltda',
  'Farmácia Central',
  'Suprimentos Médicos SA'
]

const mockDepartments = [
  'Farmácia',
  'UTI',
  'Emergência',
  'Cirurgia',
  'Pediatria',
  'Cardiologia'
]

function getStatusColor(status: Order['status']) {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800'
    case 'approved': return 'bg-blue-100 text-blue-800'
    case 'sent': return 'bg-purple-100 text-purple-800'
    case 'partial': return 'bg-orange-100 text-orange-800'
    case 'delivered': return 'bg-green-100 text-green-800'
    case 'cancelled': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function getStatusIcon(status: Order['status']) {
  switch (status) {
    case 'pending': return <Clock className="h-4 w-4" />
    case 'approved': return <CheckCircle className="h-4 w-4" />
    case 'sent': return <Package className="h-4 w-4" />
    case 'partial': return <AlertCircle className="h-4 w-4" />
    case 'delivered': return <CheckCircle className="h-4 w-4" />
    case 'cancelled': return <XCircle className="h-4 w-4" />
    default: return <Clock className="h-4 w-4" />
  }
}

function getPriorityColor(priority: Order['priority']) {
  switch (priority) {
    case 'low': return 'bg-gray-100 text-gray-800'
    case 'medium': return 'bg-blue-100 text-blue-800'
    case 'high': return 'bg-orange-100 text-orange-800'
    case 'urgent': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [supplierFilter, setSupplierFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.requestedBy.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    const matchesSupplier = supplierFilter === 'all' || order.supplier === supplierFilter
    const matchesPriority = priorityFilter === 'all' || order.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesSupplier && matchesPriority
  })

  const stats = {
    total: mockOrders.length,
    pending: mockOrders.filter(o => o.status === 'pending').length,
    approved: mockOrders.filter(o => o.status === 'approved').length,
    sent: mockOrders.filter(o => o.status === 'sent').length,
    delivered: mockOrders.filter(o => o.status === 'delivered').length,
    totalValue: mockOrders.reduce((sum, order) => sum + order.totalValue, 0),
    monthlyValue: mockOrders
      .filter(o => new Date(o.orderDate).getMonth() === new Date().getMonth())
      .reduce((sum, order) => sum + order.totalValue, 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pedidos e Compras</h1>
          <p className="text-muted-foreground">Gerencie pedidos, compras e fornecedores</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Novo Pedido
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Novo Pedido</DialogTitle>
                <DialogDescription>
                  Preencha as informações do pedido
                </DialogDescription>
              </DialogHeader>
              <CreateOrderForm onClose={() => setIsCreateDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enviados</CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.sent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entregues</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Mensal</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.monthlyValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por número, fornecedor ou solicitante..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="approved">Aprovado</SelectItem>
                <SelectItem value="sent">Enviado</SelectItem>
                <SelectItem value="partial">Parcial</SelectItem>
                <SelectItem value="delivered">Entregue</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={supplierFilter} onValueChange={setSupplierFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Fornecedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Fornecedores</SelectItem>
                {mockSuppliers.map(supplier => (
                  <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Pedidos</CardTitle>
          <CardDescription>
            {filteredOrders.length} pedido(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Data Pedido</TableHead>
                  <TableHead>Entrega Prevista</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Solicitante</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{order.supplier}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(order.priority)}>
                        <span className="capitalize">{order.priority}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(order.orderDate).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{new Date(order.expectedDelivery).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{order.totalItems}</TableCell>
                    <TableCell>R$ {order.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>{order.requestedBy}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order)
                            setIsViewDialogOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido</DialogTitle>
            <DialogDescription>
              Informações completas do pedido {selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && <OrderDetails order={selectedOrder} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CreateOrderForm({ onClose }: { onClose: () => void }) {
  const [orderItems, setOrderItems] = useState<Omit<OrderItem, 'id' | 'totalPrice'>[]>([])
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    quantity: 1,
    unitPrice: 0,
    supplier: '',
    description: ''
  })

  const addItem = () => {
    if (newItem.name && newItem.category && newItem.quantity > 0 && newItem.unitPrice > 0) {
      setOrderItems([...orderItems, { ...newItem }])
      setNewItem({
        name: '',
        category: '',
        quantity: 1,
        unitPrice: 0,
        supplier: '',
        description: ''
      })
    }
  }

  const removeItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index))
  }

  const totalValue = orderItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)

  return (
    <div className="space-y-6">
      {/* Order Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="supplier">Fornecedor *</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o fornecedor" />
            </SelectTrigger>
            <SelectContent>
              {mockSuppliers.map(supplier => (
                <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="department">Departamento *</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o departamento" />
            </SelectTrigger>
            <SelectContent>
              {mockDepartments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">Prioridade *</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Baixa</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="urgent">Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="expectedDelivery">Data de Entrega Esperada</Label>
          <DatePicker />
        </div>
      </div>

      <Separator />

      {/* Add Items */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Adicionar Itens</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="itemName">Nome do Item *</Label>
            <Input
              id="itemName"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              placeholder="Nome do item"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="itemCategory">Categoria *</Label>
            <Select value={newItem.category} onValueChange={(value) => setNewItem({ ...newItem, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="medicamentos">Medicamentos</SelectItem>
                <SelectItem value="equipamentos">Equipamentos</SelectItem>
                <SelectItem value="suprimentos">Suprimentos</SelectItem>
                <SelectItem value="materiais">Materiais</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="itemQuantity">Quantidade *</Label>
            <Input
              id="itemQuantity"
              type="number"
              min="1"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="itemPrice">Preço Unitário *</Label>
            <Input
              id="itemPrice"
              type="number"
              step="0.01"
              min="0"
              value={newItem.unitPrice}
              onChange={(e) => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="itemSupplier">Fornecedor</Label>
            <Input
              id="itemSupplier"
              value={newItem.supplier}
              onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })}
              placeholder="Fornecedor específico"
            />
          </div>
          <div className="space-y-2 flex items-end">
            <Button onClick={addItem} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Item
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="itemDescription">Descrição/Observações</Label>
          <Textarea
            id="itemDescription"
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            placeholder="Descrição adicional do item"
            rows={2}
          />
        </div>
      </div>

      {/* Items List */}
      {orderItems.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Itens do Pedido</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Qtd</TableHead>
                  <TableHead>Preço Unit.</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>R$ {item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell>R$ {(item.quantity * item.unitPrice).toFixed(2)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end">
            <div className="text-lg font-semibold">
              Total: R$ {totalValue.toFixed(2)}
            </div>
          </div>
        </div>
      )}

      <Separator />

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          placeholder="Observações gerais do pedido"
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button>
          Criar Pedido
        </Button>
      </div>
    </div>
  )
}

function OrderDetails({ order }: { order: Order }) {
  return (
    <div className="space-y-6">
      {/* Order Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Número do Pedido</Label>
            <p className="text-lg font-semibold">{order.orderNumber}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Fornecedor</Label>
            <p className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {order.supplier}
            </p>
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Status</Label>
            <Badge className={getStatusColor(order.status)}>
              {getStatusIcon(order.status)}
              <span className="ml-1 capitalize">{order.status}</span>
            </Badge>
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Prioridade</Label>
            <Badge className={getPriorityColor(order.priority)}>
              <span className="capitalize">{order.priority}</span>
            </Badge>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Solicitante</Label>
            <p className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {order.requestedBy}
            </p>
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Departamento</Label>
            <p>{order.department}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Data do Pedido</Label>
            <p className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date(order.orderDate).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Entrega Prevista</Label>
            <p className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date(order.expectedDelivery).toLocaleDateString('pt-BR')}
            </p>
          </div>
          {order.trackingNumber && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Código de Rastreamento</Label>
              <p className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                {order.trackingNumber}
              </p>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Order Items */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Itens do Pedido</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Preço Unitário</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Fornecedor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>R$ {item.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell>R$ {item.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell>{item.supplier}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-end">
          <div className="text-lg font-semibold">
            Total do Pedido: R$ {order.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {order.notes && (
        <>
          <Separator />
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Observações</Label>
            <p className="text-sm">{order.notes}</p>
          </div>
        </>
      )}
    </div>
  )
}