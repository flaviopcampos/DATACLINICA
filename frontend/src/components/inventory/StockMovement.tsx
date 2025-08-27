'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowUp, 
  ArrowDown, 
  Package, 
  Calendar, 
  User, 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

type MovementType = 'in' | 'out' | 'adjustment' | 'transfer' | 'return' | 'loss' | 'expired'
type MovementStatus = 'pending' | 'completed' | 'cancelled'
type MovementReason = 'purchase' | 'donation' | 'production' | 'consumption' | 'prescription' | 'maintenance' | 'calibration' | 'disposal' | 'theft' | 'damage' | 'expiration' | 'transfer' | 'return' | 'adjustment' | 'other'

interface StockMovement {
  id: string
  itemId: string
  itemName: string
  itemType: 'medication' | 'equipment' | 'supply'
  itemCategory: string
  type: MovementType
  reason: MovementReason
  quantity: number
  unit: string
  unitCost?: number
  totalCost?: number
  
  // Stock levels
  previousStock: number
  newStock: number
  
  // Location
  fromLocation?: string
  toLocation?: string
  fromDepartment?: string
  toDepartment?: string
  
  // Batch/Lot
  batchNumber?: string
  lotNumber?: string
  expirationDate?: Date
  
  // People
  requestedBy?: string
  authorizedBy?: string
  performedBy: string
  
  // Dates
  requestDate?: Date
  authorizedDate?: Date
  performedDate: Date
  
  // Status
  status: MovementStatus
  
  // Additional info
  notes?: string
  attachments?: string[]
  
  // References
  orderId?: string
  prescriptionId?: string
  maintenanceId?: string
  
  createdAt: Date
  updatedAt: Date
}

interface StockMovementProps {
  movements?: StockMovement[]
  onAddMovement?: () => void
  onEditMovement?: (movement: StockMovement) => void
  onDeleteMovement?: (movementId: string) => void
  onViewMovement?: (movement: StockMovement) => void
  loading?: boolean
  showFilters?: boolean
  showActions?: boolean
}

const movementTypes = [
  { value: 'in', label: 'Entrada', icon: ArrowUp, color: 'text-green-600' },
  { value: 'out', label: 'Saída', icon: ArrowDown, color: 'text-red-600' },
  { value: 'adjustment', label: 'Ajuste', icon: RefreshCw, color: 'text-blue-600' },
  { value: 'transfer', label: 'Transferência', icon: RotateCcw, color: 'text-purple-600' },
  { value: 'return', label: 'Devolução', icon: TrendingUp, color: 'text-orange-600' },
  { value: 'loss', label: 'Perda', icon: TrendingDown, color: 'text-red-600' },
  { value: 'expired', label: 'Vencido', icon: AlertCircle, color: 'text-yellow-600' }
]

const movementReasons = [
  { value: 'purchase', label: 'Compra' },
  { value: 'donation', label: 'Doação' },
  { value: 'production', label: 'Produção' },
  { value: 'consumption', label: 'Consumo' },
  { value: 'prescription', label: 'Prescrição' },
  { value: 'maintenance', label: 'Manutenção' },
  { value: 'calibration', label: 'Calibração' },
  { value: 'disposal', label: 'Descarte' },
  { value: 'theft', label: 'Furto' },
  { value: 'damage', label: 'Dano' },
  { value: 'expiration', label: 'Vencimento' },
  { value: 'transfer', label: 'Transferência' },
  { value: 'return', label: 'Devolução' },
  { value: 'adjustment', label: 'Ajuste' },
  { value: 'other', label: 'Outro' }
]

const statusOptions = [
  { value: 'pending', label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'completed', label: 'Concluído', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelado', color: 'bg-red-100 text-red-800' }
]

// Mock data
const mockMovements: StockMovement[] = [
  {
    id: '1',
    itemId: 'MED001',
    itemName: 'Dipirona 500mg',
    itemType: 'medication',
    itemCategory: 'Analgésico',
    type: 'in',
    reason: 'purchase',
    quantity: 100,
    unit: 'comprimido',
    unitCost: 0.50,
    totalCost: 50.00,
    previousStock: 50,
    newStock: 150,
    toLocation: 'Farmácia - Prateleira A1',
    toDepartment: 'Farmácia',
    batchNumber: 'LOT123456',
    expirationDate: new Date('2025-12-31'),
    performedBy: 'João Silva',
    authorizedBy: 'Maria Santos',
    performedDate: new Date('2024-01-15'),
    authorizedDate: new Date('2024-01-15'),
    status: 'completed',
    notes: 'Compra regular mensal',
    orderId: 'PED001',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    itemId: 'MED001',
    itemName: 'Dipirona 500mg',
    itemType: 'medication',
    itemCategory: 'Analgésico',
    type: 'out',
    reason: 'prescription',
    quantity: 20,
    unit: 'comprimido',
    previousStock: 150,
    newStock: 130,
    fromLocation: 'Farmácia - Prateleira A1',
    fromDepartment: 'Farmácia',
    batchNumber: 'LOT123456',
    performedBy: 'Ana Costa',
    performedDate: new Date('2024-01-16'),
    status: 'completed',
    notes: 'Dispensação para paciente João da Silva',
    prescriptionId: 'PRES001',
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16')
  },
  {
    id: '3',
    itemId: 'EQP001',
    itemName: 'Monitor Cardíaco MC-100',
    itemType: 'equipment',
    itemCategory: 'Monitoramento',
    type: 'transfer',
    reason: 'transfer',
    quantity: 1,
    unit: 'unidade',
    previousStock: 1,
    newStock: 1,
    fromLocation: 'UTI - Leito 1',
    toLocation: 'UTI - Leito 5',
    fromDepartment: 'UTI',
    toDepartment: 'UTI',
    performedBy: 'Carlos Oliveira',
    performedDate: new Date('2024-01-17'),
    status: 'completed',
    notes: 'Transferência entre leitos',
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-17')
  },
  {
    id: '4',
    itemId: 'SUP001',
    itemName: 'Luva Cirúrgica Estéril',
    itemType: 'supply',
    itemCategory: 'EPI',
    type: 'out',
    reason: 'consumption',
    quantity: 50,
    unit: 'par',
    previousStock: 200,
    newStock: 150,
    fromLocation: 'Almoxarifado - Prateleira B2',
    fromDepartment: 'Centro Cirúrgico',
    performedBy: 'Fernanda Lima',
    performedDate: new Date('2024-01-18'),
    status: 'completed',
    notes: 'Consumo durante cirurgias',
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18')
  },
  {
    id: '5',
    itemId: 'MED002',
    itemName: 'Antibiótico XYZ',
    itemType: 'medication',
    itemCategory: 'Antibiótico',
    type: 'loss',
    reason: 'expiration',
    quantity: 10,
    unit: 'frasco',
    previousStock: 25,
    newStock: 15,
    fromLocation: 'Farmácia - Geladeira 1',
    fromDepartment: 'Farmácia',
    batchNumber: 'LOT789012',
    expirationDate: new Date('2024-01-15'),
    performedBy: 'Roberto Santos',
    performedDate: new Date('2024-01-19'),
    status: 'completed',
    notes: 'Medicamento vencido - descarte conforme protocolo',
    createdAt: new Date('2024-01-19'),
    updatedAt: new Date('2024-01-19')
  }
]

export default function StockMovement({
  movements = mockMovements,
  onAddMovement,
  onEditMovement,
  onDeleteMovement,
  onViewMovement,
  loading = false,
  showFilters = true,
  showActions = true
}: StockMovementProps) {
  const [filteredMovements, setFilteredMovements] = useState<StockMovement[]>(movements)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<MovementType | 'all'>('all')
  const [selectedReason, setSelectedReason] = useState<MovementReason | 'all'>('all')
  const [selectedStatus, setSelectedStatus] = useState<MovementStatus | 'all'>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedMovement, setSelectedMovement] = useState<StockMovement | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    let filtered = movements

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(movement =>
        movement.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movement.itemId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movement.performedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movement.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(movement => movement.type === selectedType)
    }

    // Reason filter
    if (selectedReason !== 'all') {
      filtered = filtered.filter(movement => movement.reason === selectedReason)
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(movement => movement.status === selectedStatus)
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(movement => 
        movement.performedDate >= new Date(dateFrom)
      )
    }
    if (dateTo) {
      filtered = filtered.filter(movement => 
        movement.performedDate <= new Date(dateTo + 'T23:59:59')
      )
    }

    setFilteredMovements(filtered)
  }, [movements, searchTerm, selectedType, selectedReason, selectedStatus, dateFrom, dateTo])

  const getMovementTypeInfo = (type: MovementType) => {
    return movementTypes.find(t => t.value === type) || movementTypes[0]
  }

  const getReasonLabel = (reason: MovementReason) => {
    return movementReasons.find(r => r.value === reason)?.label || reason
  }

  const getStatusInfo = (status: MovementStatus) => {
    return statusOptions.find(s => s.value === status) || statusOptions[0]
  }

  const handleViewDetails = (movement: StockMovement) => {
    setSelectedMovement(movement)
    setShowDetails(true)
    onViewMovement?.(movement)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedType('all')
    setSelectedReason('all')
    setSelectedStatus('all')
    setDateFrom('')
    setDateTo('')
  }

  // Calculate summary statistics
  const totalMovements = filteredMovements.length
  const entriesCount = filteredMovements.filter(m => m.type === 'in').length
  const exitsCount = filteredMovements.filter(m => m.type === 'out').length
  const adjustmentsCount = filteredMovements.filter(m => m.type === 'adjustment').length
  const totalValue = filteredMovements.reduce((sum, m) => sum + (m.totalCost || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Movimentações de Estoque</h2>
          <p className="text-muted-foreground">
            Controle e histórico de todas as movimentações
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          {showActions && onAddMovement && (
            <Button onClick={onAddMovement}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Movimentação
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{totalMovements}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Entradas</p>
                <p className="text-2xl font-bold text-green-600">{entriesCount}</p>
              </div>
              <ArrowUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Saídas</p>
                <p className="text-2xl font-bold text-red-600">{exitsCount}</p>
              </div>
              <ArrowDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ajustes</p>
                <p className="text-2xl font-bold text-blue-600">{adjustmentsCount}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-blue-600" />
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
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
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
                    placeholder="Item, código, usuário..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <select
                  id="type"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as MovementType | 'all')}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="all">Todos os tipos</option>
                  {movementTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reason">Motivo</Label>
                <select
                  id="reason"
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value as MovementReason | 'all')}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="all">Todos os motivos</option>
                  {movementReasons.map((reason) => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as MovementStatus | 'all')}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="all">Todos os status</option>
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dateFrom">Data Inicial</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dateTo">Data Final</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                {filteredMovements.length} de {movements.length} movimentações
              </p>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Movements List */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Movimentações</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredMovements.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">Nenhuma movimentação encontrada</p>
              <p className="text-muted-foreground">Tente ajustar os filtros ou adicionar uma nova movimentação</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMovements.map((movement) => {
                const typeInfo = getMovementTypeInfo(movement.type)
                const statusInfo = getStatusInfo(movement.status)
                const TypeIcon = typeInfo.icon
                
                return (
                  <div
                    key={movement.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={cn("p-2 rounded-lg bg-muted", typeInfo.color)}>
                          <TypeIcon className="h-5 w-5" />
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{movement.itemName}</h4>
                            <Badge variant="outline">{movement.itemId}</Badge>
                            <Badge className={statusInfo.color}>
                              {statusInfo.label}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <TypeIcon className="h-3 w-3" />
                              {typeInfo.label} - {getReasonLabel(movement.reason)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Package className="h-3 w-3" />
                              {movement.quantity} {movement.unit}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {movement.performedBy}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(movement.performedDate, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-muted-foreground">
                              Estoque: {movement.previousStock} → {movement.newStock} {movement.unit}
                            </span>
                            {movement.totalCost && (
                              <span className="font-medium">
                                R$ {movement.totalCost.toFixed(2)}
                              </span>
                            )}
                          </div>
                          
                          {(movement.fromLocation || movement.toLocation) && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {movement.fromLocation && (
                                <span>De: {movement.fromLocation}</span>
                              )}
                              {movement.fromLocation && movement.toLocation && (
                                <span>→</span>
                              )}
                              {movement.toLocation && (
                                <span>Para: {movement.toLocation}</span>
                              )}
                            </div>
                          )}
                          
                          {movement.notes && (
                            <p className="text-sm text-muted-foreground">
                              {movement.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {showActions && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(movement)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {onEditMovement && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEditMovement(movement)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {onDeleteMovement && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteMovement(movement.id)}
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

      {/* Movement Details Modal */}
      {showDetails && selectedMovement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Detalhes da Movimentação</CardTitle>
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
                  <p className="text-sm">{selectedMovement.itemName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Código</Label>
                  <p className="text-sm">{selectedMovement.itemId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Tipo</Label>
                  <p className="text-sm">{getMovementTypeInfo(selectedMovement.type).label}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Motivo</Label>
                  <p className="text-sm">{getReasonLabel(selectedMovement.reason)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Quantidade</Label>
                  <p className="text-sm">{selectedMovement.quantity} {selectedMovement.unit}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className={getStatusInfo(selectedMovement.status).color}>
                    {getStatusInfo(selectedMovement.status).label}
                  </Badge>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Estoque Anterior</Label>
                  <p className="text-sm">{selectedMovement.previousStock} {selectedMovement.unit}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Novo Estoque</Label>
                  <p className="text-sm">{selectedMovement.newStock} {selectedMovement.unit}</p>
                </div>
              </div>
              
              {(selectedMovement.fromLocation || selectedMovement.toLocation) && (
                <>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    {selectedMovement.fromLocation && (
                      <div>
                        <Label className="text-sm font-medium">Localização Origem</Label>
                        <p className="text-sm">{selectedMovement.fromLocation}</p>
                      </div>
                    )}
                    {selectedMovement.toLocation && (
                      <div>
                        <Label className="text-sm font-medium">Localização Destino</Label>
                        <p className="text-sm">{selectedMovement.toLocation}</p>
                      </div>
                    )}
                  </div>
                </>
              )}
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Executado por</Label>
                  <p className="text-sm">{selectedMovement.performedBy}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Data/Hora</Label>
                  <p className="text-sm">
                    {format(selectedMovement.performedDate, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </p>
                </div>
                {selectedMovement.authorizedBy && (
                  <div>
                    <Label className="text-sm font-medium">Autorizado por</Label>
                    <p className="text-sm">{selectedMovement.authorizedBy}</p>
                  </div>
                )}
              </div>
              
              {selectedMovement.notes && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-sm font-medium">Observações</Label>
                    <p className="text-sm">{selectedMovement.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}