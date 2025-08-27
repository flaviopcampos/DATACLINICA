'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  AlertTriangle, 
  Calendar, 
  Package, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Trash2, 
  RefreshCw,
  Clock,
  MapPin,
  Building,
  User,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Info
} from 'lucide-react'
import { format, differenceInDays, isAfter, isBefore, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

type ExpirationStatus = 'expired' | 'expiring_soon' | 'expiring_warning' | 'valid'
type ItemType = 'medication' | 'equipment' | 'supply'
type ActionType = 'dispose' | 'return' | 'use_priority' | 'extend' | 'transfer'

interface ExpirationItem {
  id: string
  itemId: string
  itemName: string
  itemType: ItemType
  category: string
  
  // Stock info
  quantity: number
  unit: string
  unitCost: number
  totalValue: number
  
  // Batch/Lot info
  batchNumber: string
  lotNumber?: string
  manufacturingDate?: Date
  expirationDate: Date
  
  // Location
  location: string
  department: string
  
  // Status
  status: ExpirationStatus
  daysToExpiration: number
  
  // Additional info
  supplier: string
  criticality: 'low' | 'medium' | 'high' | 'critical'
  isControlled: boolean
  requiresSpecialDisposal: boolean
  
  // Actions taken
  lastChecked?: Date
  checkedBy?: string
  actionTaken?: ActionType
  actionDate?: Date
  actionBy?: string
  notes?: string
  
  createdAt: Date
  updatedAt: Date
}

interface ExpirationTrackerProps {
  items?: ExpirationItem[]
  onViewItem?: (item: ExpirationItem) => void
  onTakeAction?: (itemId: string, action: ActionType, notes?: string) => void
  onDisposeItem?: (itemId: string) => void
  loading?: boolean
  showFilters?: boolean
  showActions?: boolean
}

const statusConfig = {
  expired: {
    label: 'Vencido',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
    iconColor: 'text-red-600',
    priority: 4
  },
  expiring_soon: {
    label: 'Vencendo (≤7 dias)',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: AlertTriangle,
    iconColor: 'text-orange-600',
    priority: 3
  },
  expiring_warning: {
    label: 'Atenção (≤30 dias)',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: AlertCircle,
    iconColor: 'text-yellow-600',
    priority: 2
  },
  valid: {
    label: 'Válido',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle2,
    iconColor: 'text-green-600',
    priority: 1
  }
}

const itemTypeLabels = {
  medication: 'Medicamento',
  equipment: 'Equipamento',
  supply: 'Suprimento'
}

const criticalityConfig = {
  low: { label: 'Baixa', color: 'bg-blue-100 text-blue-800' },
  medium: { label: 'Média', color: 'bg-yellow-100 text-yellow-800' },
  high: { label: 'Alta', color: 'bg-orange-100 text-orange-800' },
  critical: { label: 'Crítica', color: 'bg-red-100 text-red-800' }
}

const actionLabels = {
  dispose: 'Descartar',
  return: 'Devolver',
  use_priority: 'Usar Prioritariamente',
  extend: 'Estender Validade',
  transfer: 'Transferir'
}

// Helper function to determine expiration status
const getExpirationStatus = (expirationDate: Date): ExpirationStatus => {
  const today = new Date()
  const daysToExpiration = differenceInDays(expirationDate, today)
  
  if (daysToExpiration < 0) return 'expired'
  if (daysToExpiration <= 7) return 'expiring_soon'
  if (daysToExpiration <= 30) return 'expiring_warning'
  return 'valid'
}

// Mock data
const mockItems: ExpirationItem[] = [
  {
    id: '1',
    itemId: 'MED001',
    itemName: 'Dipirona 500mg',
    itemType: 'medication',
    category: 'Analgésico',
    quantity: 50,
    unit: 'comprimido',
    unitCost: 0.50,
    totalValue: 25.00,
    batchNumber: 'LOT123456',
    lotNumber: 'L001',
    manufacturingDate: new Date('2023-06-15'),
    expirationDate: new Date('2024-02-15'),
    location: 'Farmácia - Prateleira A1',
    department: 'Farmácia',
    status: 'expired',
    daysToExpiration: -5,
    supplier: 'Farmacorp Ltda',
    criticality: 'medium',
    isControlled: false,
    requiresSpecialDisposal: false,
    lastChecked: new Date('2024-01-20'),
    checkedBy: 'Ana Costa',
    createdAt: new Date('2023-06-15'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '2',
    itemId: 'MED002',
    itemName: 'Antibiótico XYZ 250mg',
    itemType: 'medication',
    category: 'Antibiótico',
    quantity: 20,
    unit: 'frasco',
    unitCost: 15.00,
    totalValue: 300.00,
    batchNumber: 'LOT789012',
    manufacturingDate: new Date('2023-08-10'),
    expirationDate: new Date('2024-02-25'),
    location: 'Farmácia - Geladeira 1',
    department: 'Farmácia',
    status: 'expiring_soon',
    daysToExpiration: 5,
    supplier: 'MedSupply S.A.',
    criticality: 'high',
    isControlled: true,
    requiresSpecialDisposal: true,
    lastChecked: new Date('2024-01-18'),
    checkedBy: 'Roberto Santos',
    createdAt: new Date('2023-08-10'),
    updatedAt: new Date('2024-01-18')
  },
  {
    id: '3',
    itemId: 'SUP001',
    itemName: 'Luva Cirúrgica Estéril',
    itemType: 'supply',
    category: 'EPI',
    quantity: 100,
    unit: 'par',
    unitCost: 2.50,
    totalValue: 250.00,
    batchNumber: 'LOT345678',
    expirationDate: new Date('2024-03-15'),
    location: 'Almoxarifado - Prateleira B2',
    department: 'Centro Cirúrgico',
    status: 'expiring_warning',
    daysToExpiration: 25,
    supplier: 'Cirúrgica Brasil',
    criticality: 'medium',
    isControlled: false,
    requiresSpecialDisposal: false,
    createdAt: new Date('2023-09-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '4',
    itemId: 'EQP001',
    itemName: 'Eletrodo Descartável',
    itemType: 'equipment',
    category: 'Monitoramento',
    quantity: 200,
    unit: 'unidade',
    unitCost: 1.20,
    totalValue: 240.00,
    batchNumber: 'LOT901234',
    expirationDate: new Date('2024-12-31'),
    location: 'UTI - Armário 3',
    department: 'UTI',
    status: 'valid',
    daysToExpiration: 350,
    supplier: 'TechMed Equipamentos',
    criticality: 'low',
    isControlled: false,
    requiresSpecialDisposal: false,
    createdAt: new Date('2023-12-01'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: '5',
    itemId: 'MED003',
    itemName: 'Morfina 10mg/ml',
    itemType: 'medication',
    category: 'Analgésico Opioide',
    quantity: 10,
    unit: 'ampola',
    unitCost: 25.00,
    totalValue: 250.00,
    batchNumber: 'LOT567890',
    expirationDate: new Date('2024-02-28'),
    location: 'Farmácia - Cofre Controlados',
    department: 'Farmácia',
    status: 'expiring_soon',
    daysToExpiration: 8,
    supplier: 'Pharma Controlados',
    criticality: 'critical',
    isControlled: true,
    requiresSpecialDisposal: true,
    actionTaken: 'use_priority',
    actionDate: new Date('2024-01-19'),
    actionBy: 'Dr. Carlos Silva',
    notes: 'Priorizar uso na UTI',
    createdAt: new Date('2023-08-28'),
    updatedAt: new Date('2024-01-19')
  }
]

export default function ExpirationTracker({
  items = mockItems,
  onViewItem,
  onTakeAction,
  onDisposeItem,
  loading = false,
  showFilters = true,
  showActions = true
}: ExpirationTrackerProps) {
  const [filteredItems, setFilteredItems] = useState<ExpirationItem[]>(items)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<ExpirationStatus | 'all'>('all')
  const [selectedType, setSelectedType] = useState<ItemType | 'all'>('all')
  const [selectedCriticality, setSelectedCriticality] = useState<'low' | 'medium' | 'high' | 'critical' | 'all'>('all')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [showControlledOnly, setShowControlledOnly] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ExpirationItem | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showActionModal, setShowActionModal] = useState(false)
  const [selectedAction, setSelectedAction] = useState<ActionType>('dispose')
  const [actionNotes, setActionNotes] = useState('')

  // Update items with current expiration status
  useEffect(() => {
    const updatedItems = items.map(item => {
      const status = getExpirationStatus(item.expirationDate)
      const daysToExpiration = differenceInDays(item.expirationDate, new Date())
      return {
        ...item,
        status,
        daysToExpiration
      }
    })
    setFilteredItems(updatedItems)
  }, [items])

  useEffect(() => {
    let filtered = items.map(item => {
      const status = getExpirationStatus(item.expirationDate)
      const daysToExpiration = differenceInDays(item.expirationDate, new Date())
      return {
        ...item,
        status,
        daysToExpiration
      }
    })

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === selectedStatus)
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.itemType === selectedType)
    }

    // Criticality filter
    if (selectedCriticality !== 'all') {
      filtered = filtered.filter(item => item.criticality === selectedCriticality)
    }

    // Department filter
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(item => item.department === selectedDepartment)
    }

    // Controlled items filter
    if (showControlledOnly) {
      filtered = filtered.filter(item => item.isControlled)
    }

    // Sort by priority (expired first, then by days to expiration)
    filtered.sort((a, b) => {
      const priorityA = statusConfig[a.status].priority
      const priorityB = statusConfig[b.status].priority
      if (priorityA !== priorityB) {
        return priorityB - priorityA // Higher priority first
      }
      return a.daysToExpiration - b.daysToExpiration // Closer expiration first
    })

    setFilteredItems(filtered)
  }, [items, searchTerm, selectedStatus, selectedType, selectedCriticality, selectedDepartment, showControlledOnly])

  const handleViewDetails = (item: ExpirationItem) => {
    setSelectedItem(item)
    setShowDetails(true)
    onViewItem?.(item)
  }

  const handleTakeAction = (item: ExpirationItem) => {
    setSelectedItem(item)
    setShowActionModal(true)
  }

  const handleSubmitAction = () => {
    if (selectedItem) {
      onTakeAction?.(selectedItem.id, selectedAction, actionNotes)
      setShowActionModal(false)
      setActionNotes('')
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedStatus('all')
    setSelectedType('all')
    setSelectedCriticality('all')
    setSelectedDepartment('all')
    setShowControlledOnly(false)
  }

  // Calculate summary statistics
  const totalItems = filteredItems.length
  const expiredCount = filteredItems.filter(item => item.status === 'expired').length
  const expiringSoonCount = filteredItems.filter(item => item.status === 'expiring_soon').length
  const expiringWarningCount = filteredItems.filter(item => item.status === 'expiring_warning').length
  const totalValue = filteredItems.reduce((sum, item) => sum + item.totalValue, 0)
  const criticalItems = filteredItems.filter(item => item.criticality === 'critical').length

  // Get unique departments for filter
  const departments = Array.from(new Set(items.map(item => item.department)))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Rastreamento de Validade</h2>
          <p className="text-muted-foreground">
            Controle de itens próximos ao vencimento e vencidos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{totalItems}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vencidos</p>
                <p className="text-2xl font-bold text-red-600">{expiredCount}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vencendo</p>
                <p className="text-2xl font-bold text-orange-600">{expiringSoonCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Atenção</p>
                <p className="text-2xl font-bold text-yellow-600">{expiringWarningCount}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Críticos</p>
                <p className="text-2xl font-bold text-red-600">{criticalItems}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold">R$ {totalValue.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Item, lote, fornecedor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as ExpirationStatus | 'all')}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="all">Todos os status</option>
                  <option value="expired">Vencidos</option>
                  <option value="expiring_soon">Vencendo (≤7 dias)</option>
                  <option value="expiring_warning">Atenção (≤30 dias)</option>
                  <option value="valid">Válidos</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <select
                  id="type"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as ItemType | 'all')}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="all">Todos os tipos</option>
                  <option value="medication">Medicamentos</option>
                  <option value="equipment">Equipamentos</option>
                  <option value="supply">Suprimentos</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="criticality">Criticidade</Label>
                <select
                  id="criticality"
                  value={selectedCriticality}
                  onChange={(e) => setSelectedCriticality(e.target.value as 'low' | 'medium' | 'high' | 'critical' | 'all')}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="all">Todas</option>
                  <option value="critical">Crítica</option>
                  <option value="high">Alta</option>
                  <option value="medium">Média</option>
                  <option value="low">Baixa</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department">Departamento</Label>
                <select
                  id="department"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="all">Todos</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label>Filtros Especiais</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="controlled"
                    checked={showControlledOnly}
                    onChange={(e) => setShowControlledOnly(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="controlled" className="text-sm">
                    Apenas Controlados
                  </Label>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                {filteredItems.length} de {items.length} itens
              </p>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items List */}
      <Card>
        <CardHeader>
          <CardTitle>Itens por Validade</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">Nenhum item encontrado</p>
              <p className="text-muted-foreground">Tente ajustar os filtros de busca</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item) => {
                const statusInfo = statusConfig[item.status]
                const StatusIcon = statusInfo.icon
                const criticalityInfo = criticalityConfig[item.criticality]
                
                return (
                  <div
                    key={item.id}
                    className={cn(
                      "border rounded-lg p-4 hover:bg-muted/50 transition-colors",
                      item.status === 'expired' && "border-red-200 bg-red-50/50",
                      item.status === 'expiring_soon' && "border-orange-200 bg-orange-50/50"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={cn("p-2 rounded-lg", statusInfo.iconColor, "bg-muted")}>
                          <StatusIcon className="h-5 w-5" />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{item.itemName}</h4>
                            <Badge variant="outline">{item.itemId}</Badge>
                            <Badge className={statusInfo.color}>
                              {statusInfo.label}
                            </Badge>
                            <Badge className={criticalityInfo.color}>
                              {criticalityInfo.label}
                            </Badge>
                            {item.isControlled && (
                              <Badge variant="destructive">Controlado</Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Tipo:</span>
                              <span className="ml-1">{itemTypeLabels[item.itemType]}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Quantidade:</span>
                              <span className="ml-1">{item.quantity} {item.unit}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Lote:</span>
                              <span className="ml-1">{item.batchNumber}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Valor:</span>
                              <span className="ml-1 font-medium">R$ {item.totalValue.toFixed(2)}</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">Vencimento:</span>
                              <span className={cn(
                                "ml-1 font-medium",
                                item.status === 'expired' && "text-red-600",
                                item.status === 'expiring_soon' && "text-orange-600",
                                item.status === 'expiring_warning' && "text-yellow-600"
                              )}>
                                {format(item.expirationDate, 'dd/MM/yyyy', { locale: ptBR })}
                                {item.daysToExpiration >= 0 ? (
                                  <span className="text-muted-foreground ml-1">
                                    ({item.daysToExpiration} dias)
                                  </span>
                                ) : (
                                  <span className="text-red-600 ml-1">
                                    (vencido há {Math.abs(item.daysToExpiration)} dias)
                                  </span>
                                )}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">Local:</span>
                              <span className="ml-1">{item.location}</span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Building className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">Depto:</span>
                              <span className="ml-1">{item.department}</span>
                            </div>
                          </div>
                          
                          {item.actionTaken && (
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="h-3 w-3 text-green-600" />
                              <span className="text-muted-foreground">Ação:</span>
                              <span className="text-green-600 font-medium">
                                {actionLabels[item.actionTaken]}
                              </span>
                              {item.actionBy && (
                                <span className="text-muted-foreground">
                                  por {item.actionBy}
                                </span>
                              )}
                              {item.actionDate && (
                                <span className="text-muted-foreground">
                                  em {format(item.actionDate, 'dd/MM/yyyy', { locale: ptBR })}
                                </span>
                              )}
                            </div>
                          )}
                          
                          {item.notes && (
                            <p className="text-sm text-muted-foreground">
                              <Info className="h-3 w-3 inline mr-1" />
                              {item.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {showActions && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(item)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {!item.actionTaken && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTakeAction(item)}
                            >
                              Ação
                            </Button>
                          )}
                          {item.status === 'expired' && onDisposeItem && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => onDisposeItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Item Details Modal */}
      {showDetails && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Detalhes do Item</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(false)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Item</Label>
                  <p className="text-sm">{selectedItem.itemName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Código</Label>
                  <p className="text-sm">{selectedItem.itemId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Tipo</Label>
                  <p className="text-sm">{itemTypeLabels[selectedItem.itemType]}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Categoria</Label>
                  <p className="text-sm">{selectedItem.category}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Quantidade</Label>
                  <p className="text-sm">{selectedItem.quantity} {selectedItem.unit}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Valor Total</Label>
                  <p className="text-sm">R$ {selectedItem.totalValue.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Lote</Label>
                  <p className="text-sm">{selectedItem.batchNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Fornecedor</Label>
                  <p className="text-sm">{selectedItem.supplier}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Data de Vencimento</Label>
                  <p className="text-sm">
                    {format(selectedItem.expirationDate, 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className={statusConfig[selectedItem.status].color}>
                    {statusConfig[selectedItem.status].label}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Localização</Label>
                  <p className="text-sm">{selectedItem.location}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Departamento</Label>
                  <p className="text-sm">{selectedItem.department}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Criticidade</Label>
                  <Badge className={criticalityConfig[selectedItem.criticality].color}>
                    {criticalityConfig[selectedItem.criticality].label}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Controlado</Label>
                  <p className="text-sm">{selectedItem.isControlled ? 'Sim' : 'Não'}</p>
                </div>
              </div>
              
              {selectedItem.actionTaken && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-sm font-medium">Ação Tomada</Label>
                    <p className="text-sm">{actionLabels[selectedItem.actionTaken]}</p>
                    {selectedItem.actionBy && (
                      <p className="text-sm text-muted-foreground">Por: {selectedItem.actionBy}</p>
                    )}
                    {selectedItem.notes && (
                      <p className="text-sm text-muted-foreground">Obs: {selectedItem.notes}</p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action Modal */}
      {showActionModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Tomar Ação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Item</Label>
                <p className="text-sm">{selectedItem.itemName}</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="action">Ação</Label>
                <select
                  id="action"
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value as ActionType)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  {Object.entries(actionLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Descreva a ação tomada..."
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Button onClick={handleSubmitAction} className="flex-1">
                  Confirmar Ação
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowActionModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}