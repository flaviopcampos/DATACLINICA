'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle,
  Calendar,
  MapPin,
  DollarSign,
  Eye,
  Download,
  Upload,
  Barcode,
  Clock,
  CheckCircle,
  XCircle,
  Thermometer,
  Droplets,
  Shield,
  Truck,
  Building,
  User,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'
import { format, differenceInDays, isBefore, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface Supply {
  id: string
  name: string
  description: string
  category: string
  subcategory: string
  brand?: string
  model?: string
  unit: string
  currentStock: number
  minimumStock: number
  maximumStock: number
  reorderPoint: number
  unitCost: number
  totalValue: number
  supplier: string
  supplierCode?: string
  barcode?: string
  location: string
  department: string
  expirationDate?: Date
  batchNumber?: string
  criticality: 'low' | 'medium' | 'high' | 'critical'
  autoReorder: boolean
  sterile: boolean
  controlled: boolean
  storageConditions: {
    temperature?: {
      min: number
      max: number
      unit: 'C' | 'F'
    }
    humidity?: {
      min: number
      max: number
    }
    lightProtection: boolean
    specialConditions?: string
  }
  lastMovement?: {
    type: 'in' | 'out'
    quantity: number
    date: Date
    reason: string
    user: string
  }
  averageConsumption?: {
    daily: number
    weekly: number
    monthly: number
  }
  leadTime: number // dias
  status: 'active' | 'inactive' | 'discontinued'
  notes?: string
  attachments?: string[]
  createdAt: Date
  updatedAt: Date
}

interface SuppliesListProps {
  supplies?: Supply[]
  onAdd?: (supply: Omit<Supply, 'id' | 'createdAt' | 'updatedAt'>) => void
  onEdit?: (id: string, supply: Partial<Supply>) => void
  onDelete?: (id: string) => void
  onView?: (supply: Supply) => void
  onReorder?: (id: string) => void
  loading?: boolean
}

const mockSupplies: Supply[] = [
  {
    id: '1',
    name: 'Luvas de Procedimento',
    description: 'Luvas descartáveis de nitrilo, sem pó, tamanho M',
    category: 'EPI',
    subcategory: 'Luvas',
    brand: 'Supermax',
    model: 'Nitrile Blue',
    unit: 'caixa',
    currentStock: 45,
    minimumStock: 20,
    maximumStock: 100,
    reorderPoint: 30,
    unitCost: 25.50,
    totalValue: 1147.50,
    supplier: 'MedSupply Ltda',
    supplierCode: 'MS-LUV-001',
    barcode: '7891234567890',
    location: 'Almoxarifado - Prateleira A1',
    department: 'Geral',
    expirationDate: new Date('2025-12-31'),
    batchNumber: 'LT240815',
    criticality: 'high',
    autoReorder: true,
    sterile: false,
    controlled: false,
    storageConditions: {
      temperature: { min: 15, max: 25, unit: 'C' },
      humidity: { min: 40, max: 60 },
      lightProtection: false,
      specialConditions: 'Manter em local seco'
    },
    lastMovement: {
      type: 'out',
      quantity: 5,
      date: new Date('2024-10-20'),
      reason: 'Consumo UTI',
      user: 'Enf. Maria Silva'
    },
    averageConsumption: {
      daily: 2.5,
      weekly: 17.5,
      monthly: 75
    },
    leadTime: 7,
    status: 'active',
    notes: 'Produto com boa aceitação da equipe',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    id: '2',
    name: 'Seringa Descartável 10ml',
    description: 'Seringa descartável estéril com agulha 25x7mm',
    category: 'Material Médico',
    subcategory: 'Seringas',
    brand: 'BD',
    model: 'Plastipak',
    unit: 'unidade',
    currentStock: 150,
    minimumStock: 100,
    maximumStock: 500,
    reorderPoint: 120,
    unitCost: 1.25,
    totalValue: 187.50,
    supplier: 'Becton Dickinson',
    supplierCode: 'BD-SER-10ML',
    barcode: '7891234567891',
    location: 'Almoxarifado - Prateleira B2',
    department: 'Enfermagem',
    expirationDate: new Date('2026-08-15'),
    batchNumber: 'SR240920',
    criticality: 'critical',
    autoReorder: true,
    sterile: true,
    controlled: false,
    storageConditions: {
      temperature: { min: 15, max: 30, unit: 'C' },
      humidity: { min: 30, max: 70 },
      lightProtection: false
    },
    lastMovement: {
      type: 'in',
      quantity: 50,
      date: new Date('2024-10-18'),
      reason: 'Reposição de estoque',
      user: 'João Santos'
    },
    averageConsumption: {
      daily: 8.5,
      weekly: 59.5,
      monthly: 255
    },
    leadTime: 5,
    status: 'active',
    notes: 'Item de alta rotatividade',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date()
  },
  {
    id: '3',
    name: 'Gaze Estéril 7,5x7,5cm',
    description: 'Compressa de gaze estéril, 100% algodão',
    category: 'Curativo',
    subcategory: 'Compressas',
    brand: 'Cremer',
    model: 'Estéril',
    unit: 'pacote',
    currentStock: 8,
    minimumStock: 15,
    maximumStock: 80,
    reorderPoint: 20,
    unitCost: 12.80,
    totalValue: 102.40,
    supplier: 'Cremer S.A.',
    supplierCode: 'CR-GAZ-75',
    barcode: '7891234567892',
    location: 'Almoxarifado - Prateleira C1',
    department: 'Centro Cirúrgico',
    expirationDate: new Date('2027-03-20'),
    batchNumber: 'GZ241005',
    criticality: 'medium',
    autoReorder: true,
    sterile: true,
    controlled: false,
    storageConditions: {
      temperature: { min: 10, max: 30, unit: 'C' },
      humidity: { min: 30, max: 60 },
      lightProtection: true,
      specialConditions: 'Proteger da umidade'
    },
    lastMovement: {
      type: 'out',
      quantity: 12,
      date: new Date('2024-10-19'),
      reason: 'Consumo CC',
      user: 'Enf. Ana Costa'
    },
    averageConsumption: {
      daily: 1.2,
      weekly: 8.4,
      monthly: 36
    },
    leadTime: 10,
    status: 'active',
    notes: 'Estoque baixo - solicitar reposição urgente',
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date()
  }
]

function getStockStatus(supply: Supply) {
  const stockPercentage = (supply.currentStock / supply.maximumStock) * 100
  
  if (supply.currentStock <= 0) {
    return { status: 'out', label: 'Sem Estoque', color: 'bg-red-100 text-red-800', icon: XCircle }
  }
  if (supply.currentStock <= supply.minimumStock) {
    return { status: 'low', label: 'Estoque Baixo', color: 'bg-red-100 text-red-800', icon: AlertTriangle }
  }
  if (supply.currentStock <= supply.reorderPoint) {
    return { status: 'reorder', label: 'Ponto de Reposição', color: 'bg-orange-100 text-orange-800', icon: TrendingDown }
  }
  if (stockPercentage >= 90) {
    return { status: 'high', label: 'Estoque Alto', color: 'bg-blue-100 text-blue-800', icon: TrendingUp }
  }
  return { status: 'normal', label: 'Estoque Normal', color: 'bg-green-100 text-green-800', icon: CheckCircle }
}

function getCriticalityInfo(criticality: Supply['criticality']) {
  const criticalityMap = {
    low: { label: 'Baixa', color: 'bg-gray-100 text-gray-800' },
    medium: { label: 'Média', color: 'bg-yellow-100 text-yellow-800' },
    high: { label: 'Alta', color: 'bg-orange-100 text-orange-800' },
    critical: { label: 'Crítica', color: 'bg-red-100 text-red-800' }
  }
  return criticalityMap[criticality]
}

function getExpirationStatus(expirationDate?: Date) {
  if (!expirationDate) return null
  
  const today = new Date()
  const daysUntilExpiration = differenceInDays(expirationDate, today)
  
  if (daysUntilExpiration < 0) {
    return { status: 'expired', label: 'Vencido', color: 'bg-red-100 text-red-800', days: Math.abs(daysUntilExpiration) }
  }
  if (daysUntilExpiration <= 30) {
    return { status: 'expiring', label: 'Vencendo', color: 'bg-orange-100 text-orange-800', days: daysUntilExpiration }
  }
  if (daysUntilExpiration <= 90) {
    return { status: 'warning', label: 'Atenção', color: 'bg-yellow-100 text-yellow-800', days: daysUntilExpiration }
  }
  return { status: 'ok', label: 'OK', color: 'bg-green-100 text-green-800', days: daysUntilExpiration }
}

function getDaysOfStock(supply: Supply) {
  if (!supply.averageConsumption?.daily || supply.averageConsumption.daily === 0) {
    return null
  }
  return Math.floor(supply.currentStock / supply.averageConsumption.daily)
}

export default function SuppliesList({
  supplies = mockSupplies,
  onAdd,
  onEdit,
  onDelete,
  onView,
  onReorder,
  loading = false
}: SuppliesListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [supplierFilter, setSupplierFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedSupply, setSelectedSupply] = useState<Supply | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  // Filter supplies
  const filteredSupplies = supplies.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.barcode?.includes(searchTerm) ||
                         item.supplierCode?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
    const matchesSupplier = supplierFilter === 'all' || item.supplier === supplierFilter
    
    let matchesStatus = true
    if (statusFilter !== 'all') {
      const stockStatus = getStockStatus(item)
      const expirationStatus = getExpirationStatus(item.expirationDate)
      
      switch (statusFilter) {
        case 'low-stock':
          matchesStatus = stockStatus.status === 'low' || stockStatus.status === 'out'
          break
        case 'reorder':
          matchesStatus = stockStatus.status === 'reorder'
          break
        case 'expiring':
          matchesStatus = expirationStatus?.status === 'expiring' || expirationStatus?.status === 'expired'
          break
        case 'critical':
          matchesStatus = item.criticality === 'critical'
          break
        case 'sterile':
          matchesStatus = item.sterile
          break
        case 'controlled':
          matchesStatus = item.controlled
          break
        case 'auto-reorder':
          matchesStatus = item.autoReorder
          break
        default:
          matchesStatus = true
      }
    }
    
    return matchesSearch && matchesCategory && matchesSupplier && matchesStatus
  })

  // Get unique categories and suppliers
  const categories = Array.from(new Set(supplies.map(s => s.category)))
  const suppliers = Array.from(new Set(supplies.map(s => s.supplier)))

  const handleViewSupply = (item: Supply) => {
    setSelectedSupply(item)
    setIsViewDialogOpen(true)
    onView?.(item)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Suprimentos Médicos</h2>
          <p className="text-muted-foreground">
            Gerencie materiais, consumíveis e insumos hospitalares
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Suprimento
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Itens</p>
                <p className="text-2xl font-bold">{supplies.length}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estoque Baixo</p>
                <p className="text-2xl font-bold text-red-600">
                  {supplies.filter(s => getStockStatus(s).status === 'low' || getStockStatus(s).status === 'out').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vencendo</p>
                <p className="text-2xl font-bold text-orange-600">
                  {supplies.filter(s => {
                    const expStatus = getExpirationStatus(s.expirationDate)
                    return expStatus?.status === 'expiring' || expStatus?.status === 'expired'
                  }).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Críticos</p>
                <p className="text-2xl font-bold text-red-600">
                  {supplies.filter(s => s.criticality === 'critical').length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold">
                  R$ {supplies.reduce((sum, s) => sum + s.totalValue, 0).toLocaleString('pt-BR')}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nome, código, lote..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="supplier">Fornecedor</Label>
              <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os fornecedores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os fornecedores</SelectItem>
                  {suppliers.map(supplier => (
                    <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="low-stock">Estoque Baixo</SelectItem>
                  <SelectItem value="reorder">Ponto de Reposição</SelectItem>
                  <SelectItem value="expiring">Vencendo</SelectItem>
                  <SelectItem value="critical">Críticos</SelectItem>
                  <SelectItem value="sterile">Estéreis</SelectItem>
                  <SelectItem value="controlled">Controlados</SelectItem>
                  <SelectItem value="auto-reorder">Reposição Automática</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Filtros Avançados
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando {filteredSupplies.length} de {supplies.length} suprimentos
        </p>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {supplies.filter(s => s.sterile).length} estéreis
          </Badge>
          <Badge variant="outline">
            {supplies.filter(s => s.controlled).length} controlados
          </Badge>
          <Badge variant="outline">
            {supplies.filter(s => s.autoReorder).length} reposição automática
          </Badge>
        </div>
      </div>

      {/* Supplies Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Suprimento</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Carregando suprimentos...
                  </TableCell>
                </TableRow>
              ) : filteredSupplies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Nenhum suprimento encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredSupplies.map((item) => {
                  const stockStatus = getStockStatus(item)
                  const criticalityInfo = getCriticalityInfo(item.criticality)
                  const expirationStatus = getExpirationStatus(item.expirationDate)
                  const daysOfStock = getDaysOfStock(item)
                  const StockIcon = stockStatus.icon
                  
                  return (
                    <TableRow key={item.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{item.name}</span>
                            <Badge className={cn("text-xs", criticalityInfo.color)}>
                              {criticalityInfo.label}
                            </Badge>
                            {item.sterile && (
                              <Badge variant="outline" className="text-xs">
                                <Shield className="h-3 w-3 mr-1" />
                                Estéril
                              </Badge>
                            )}
                            {item.controlled && (
                              <Badge variant="outline" className="text-xs">
                                Controlado
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {item.description}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{item.category} • {item.subcategory}</span>
                            {item.brand && <span>Marca: {item.brand}</span>}
                            {item.batchNumber && <span>Lote: {item.batchNumber}</span>}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <StockIcon className="h-4 w-4" />
                            <span className="font-medium">
                              {item.currentStock} {item.unit}
                            </span>
                            <Badge className={cn("text-xs", stockStatus.color)}>
                              {stockStatus.label}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Min: {item.minimumStock} • Max: {item.maximumStock}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Reposição: {item.reorderPoint} {item.unit}
                          </div>
                          {daysOfStock && (
                            <div className="text-xs text-muted-foreground">
                              {daysOfStock} dias de estoque
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          {item.expirationDate ? (
                            <>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                  {format(item.expirationDate, 'dd/MM/yyyy', { locale: ptBR })}
                                </span>
                              </div>
                              {expirationStatus && (
                                <>
                                  <Badge className={cn("text-xs", expirationStatus.color)}>
                                    {expirationStatus.label}
                                  </Badge>
                                  <div className="text-xs text-muted-foreground">
                                    {expirationStatus.status === 'expired' ? 
                                      `${expirationStatus.days} dias vencido` : 
                                      `${expirationStatus.days} dias`
                                    }
                                  </div>
                                </>
                              )}
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground">Sem validade</span>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{item.supplier}</span>
                          </div>
                          {item.supplierCode && (
                            <div className="text-sm text-muted-foreground">
                              Cód: {item.supplierCode}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            Lead time: {item.leadTime} dias
                          </div>
                          {item.autoReorder && (
                            <Badge variant="outline" className="text-xs">
                              Auto-reposição
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              R$ {item.totalValue.toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Unit: R$ {item.unitCost.toLocaleString('pt-BR')}
                          </div>
                          {item.averageConsumption && (
                            <div className="text-xs text-muted-foreground">
                              Consumo: {item.averageConsumption.monthly}/{item.unit}/mês
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewSupply(item)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit?.(item.id, item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onReorder?.(item.id)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Supply Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {selectedSupply?.name}
            </DialogTitle>
            <DialogDescription>
              Detalhes completos do suprimento médico
            </DialogDescription>
          </DialogHeader>
          
          {selectedSupply && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Nome</Label>
                    <p className="text-sm">{selectedSupply.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Descrição</Label>
                    <p className="text-sm">{selectedSupply.description}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Categoria</Label>
                    <p className="text-sm">{selectedSupply.category} • {selectedSupply.subcategory}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Marca/Modelo</Label>
                    <p className="text-sm">{selectedSupply.brand} {selectedSupply.model}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Unidade</Label>
                    <p className="text-sm">{selectedSupply.unit}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Criticidade</Label>
                    <Badge className={cn("text-xs", getCriticalityInfo(selectedSupply.criticality).color)}>
                      {getCriticalityInfo(selectedSupply.criticality).label}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Stock Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informações de Estoque</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Estoque Atual</Label>
                    <p className="text-sm font-bold">{selectedSupply.currentStock} {selectedSupply.unit}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Estoque Mínimo</Label>
                    <p className="text-sm">{selectedSupply.minimumStock} {selectedSupply.unit}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Estoque Máximo</Label>
                    <p className="text-sm">{selectedSupply.maximumStock} {selectedSupply.unit}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Ponto de Reposição</Label>
                    <p className="text-sm">{selectedSupply.reorderPoint} {selectedSupply.unit}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Localização</Label>
                    <p className="text-sm">{selectedSupply.location}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Departamento</Label>
                    <p className="text-sm">{selectedSupply.department}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informações Adicionais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Fornecedor</Label>
                    <p className="text-sm">{selectedSupply.supplier}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Código do Fornecedor</Label>
                    <p className="text-sm">{selectedSupply.supplierCode || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Código de Barras</Label>
                    <p className="text-sm font-mono">{selectedSupply.barcode || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Lead Time</Label>
                    <p className="text-sm">{selectedSupply.leadTime} dias</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Características</Label>
                    <div className="flex flex-wrap gap-1">
                      {selectedSupply.sterile && (
                        <Badge variant="outline" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          Estéril
                        </Badge>
                      )}
                      {selectedSupply.controlled && (
                        <Badge variant="outline" className="text-xs">
                          Controlado
                        </Badge>
                      )}
                      {selectedSupply.autoReorder && (
                        <Badge variant="outline" className="text-xs">
                          Auto-reposição
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}