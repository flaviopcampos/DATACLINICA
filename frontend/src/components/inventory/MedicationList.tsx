'use client'

import { useState } from 'react'
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  Clock, 
  Eye,
  MoreHorizontal,
  Calendar,
  MapPin
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface Medication {
  id: string
  name: string
  activeIngredient: string
  dosage: string
  form: string
  category: string
  manufacturer: string
  barcode: string
  currentStock: number
  minStock: number
  maxStock: number
  unitCost: number
  totalValue: number
  expiryDate: string
  batchNumber: string
  location: string
  prescriptionRequired: boolean
  controlledSubstance: boolean
  status: 'active' | 'inactive' | 'discontinued'
  lastUpdated: string
}

interface MedicationListProps {
  medications?: Medication[]
  onAdd?: () => void
  onEdit?: (medication: Medication) => void
  onDelete?: (medicationId: string) => void
  onView?: (medication: Medication) => void
  className?: string
}

const mockMedications: Medication[] = [
  {
    id: '1',
    name: 'Dipirona Sódica',
    activeIngredient: 'Dipirona Sódica',
    dosage: '500mg',
    form: 'Comprimido',
    category: 'Analgésicos',
    manufacturer: 'EMS',
    barcode: '7891234567890',
    currentStock: 150,
    minStock: 50,
    maxStock: 500,
    unitCost: 0.25,
    totalValue: 37.50,
    expiryDate: '2025-06-15',
    batchNumber: 'DIP2024001',
    location: 'A1-B2-C3',
    prescriptionRequired: false,
    controlledSubstance: false,
    status: 'active',
    lastUpdated: '2024-01-20T10:30:00Z'
  },
  {
    id: '2',
    name: 'Amoxicilina',
    activeIngredient: 'Amoxicilina',
    dosage: '500mg',
    form: 'Cápsula',
    category: 'Antibióticos',
    manufacturer: 'Medley',
    barcode: '7891234567891',
    currentStock: 25,
    minStock: 30,
    maxStock: 200,
    unitCost: 1.50,
    totalValue: 37.50,
    expiryDate: '2024-03-20',
    batchNumber: 'AMX2024002',
    location: 'A2-B1-C4',
    prescriptionRequired: true,
    controlledSubstance: false,
    status: 'active',
    lastUpdated: '2024-01-19T14:15:00Z'
  },
  {
    id: '3',
    name: 'Paracetamol',
    activeIngredient: 'Paracetamol',
    dosage: '750mg',
    form: 'Comprimido',
    category: 'Analgésicos',
    manufacturer: 'Sanofi',
    barcode: '7891234567892',
    currentStock: 80,
    minStock: 40,
    maxStock: 300,
    unitCost: 0.35,
    totalValue: 28.00,
    expiryDate: '2024-12-10',
    batchNumber: 'PAR2024003',
    location: 'A1-B3-C1',
    prescriptionRequired: false,
    controlledSubstance: false,
    status: 'active',
    lastUpdated: '2024-01-18T09:45:00Z'
  },
  {
    id: '4',
    name: 'Morfina',
    activeIngredient: 'Sulfato de Morfina',
    dosage: '10mg',
    form: 'Ampola',
    category: 'Analgésicos Opioides',
    manufacturer: 'Cristália',
    barcode: '7891234567893',
    currentStock: 12,
    minStock: 10,
    maxStock: 50,
    unitCost: 15.00,
    totalValue: 180.00,
    expiryDate: '2025-08-30',
    batchNumber: 'MOR2024004',
    location: 'COFRE-A1',
    prescriptionRequired: true,
    controlledSubstance: true,
    status: 'active',
    lastUpdated: '2024-01-17T16:20:00Z'
  },
  {
    id: '5',
    name: 'Insulina NPH',
    activeIngredient: 'Insulina Humana NPH',
    dosage: '100UI/mL',
    form: 'Frasco',
    category: 'Antidiabéticos',
    manufacturer: 'Novo Nordisk',
    barcode: '7891234567894',
    currentStock: 8,
    minStock: 15,
    maxStock: 60,
    unitCost: 45.00,
    totalValue: 360.00,
    expiryDate: '2024-02-28',
    batchNumber: 'INS2024005',
    location: 'GELADEIRA-B2',
    prescriptionRequired: true,
    controlledSubstance: false,
    status: 'active',
    lastUpdated: '2024-01-16T11:10:00Z'
  }
]

function getStockStatus(current: number, min: number, max: number) {
  if (current <= min * 0.5) return { status: 'critical', color: 'bg-red-500', label: 'Crítico' }
  if (current <= min) return { status: 'low', color: 'bg-orange-500', label: 'Baixo' }
  if (current >= max * 0.9) return { status: 'high', color: 'bg-blue-500', label: 'Alto' }
  return { status: 'normal', color: 'bg-green-500', label: 'Normal' }
}

function getExpiryStatus(expiryDate: string) {
  const today = new Date()
  const expiry = new Date(expiryDate)
  const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysUntilExpiry < 0) return { status: 'expired', color: 'bg-red-500', label: 'Vencido' }
  if (daysUntilExpiry <= 30) return { status: 'expiring', color: 'bg-orange-500', label: 'Vencendo' }
  if (daysUntilExpiry <= 90) return { status: 'warning', color: 'bg-yellow-500', label: 'Atenção' }
  return { status: 'good', color: 'bg-green-500', label: 'OK' }
}

export function MedicationList({ 
  medications = mockMedications, 
  onAdd, 
  onEdit, 
  onDelete, 
  onView,
  className 
}: MedicationListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedMedications, setSelectedMedications] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')

  const categories = Array.from(new Set(medications.map(med => med.category)))

  const filteredMedications = medications.filter(medication => {
    const matchesSearch = 
      medication.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medication.activeIngredient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medication.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || medication.category === selectedCategory
    
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'low_stock' && medication.currentStock <= medication.minStock) ||
      (selectedStatus === 'expiring' && getExpiryStatus(medication.expiryDate).status === 'expiring') ||
      (selectedStatus === 'controlled' && medication.controlledSubstance) ||
      (selectedStatus === 'prescription' && medication.prescriptionRequired)
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMedications(filteredMedications.map(med => med.id))
    } else {
      setSelectedMedications([])
    }
  }

  const handleSelectMedication = (medicationId: string, checked: boolean) => {
    if (checked) {
      setSelectedMedications(prev => [...prev, medicationId])
    } else {
      setSelectedMedications(prev => prev.filter(id => id !== medicationId))
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Medicamentos</h2>
          <p className="text-muted-foreground">
            {filteredMedications.length} de {medications.length} medicamentos
          </p>
        </div>
        <Button onClick={onAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Medicamento
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nome, princípio ativo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="low_stock">Estoque Baixo</SelectItem>
                  <SelectItem value="expiring">Vencendo</SelectItem>
                  <SelectItem value="controlled">Controlados</SelectItem>
                  <SelectItem value="prescription">Prescrição</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Visualização</Label>
              <Select value={viewMode} onValueChange={(value: 'table' | 'cards') => setViewMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="table">Tabela</SelectItem>
                  <SelectItem value="cards">Cards</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedMedications.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedMedications.length} medicamento(s) selecionado(s)
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Exportar Selecionados
                </Button>
                <Button variant="outline" size="sm">
                  Atualizar Estoque
                </Button>
                <Button variant="destructive" size="sm">
                  Excluir Selecionados
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medications List */}
      {viewMode === 'table' ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedMedications.length === filteredMedications.length && filteredMedications.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Medicamento</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMedications.map((medication) => {
                  const stockStatus = getStockStatus(medication.currentStock, medication.minStock, medication.maxStock)
                  const expiryStatus = getExpiryStatus(medication.expiryDate)
                  
                  return (
                    <TableRow key={medication.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedMedications.includes(medication.id)}
                          onCheckedChange={(checked) => handleSelectMedication(medication.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{medication.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {medication.dosage} - {medication.form}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {medication.manufacturer}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{medication.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${stockStatus.color}`} />
                            <span className="font-medium">{medication.currentStock}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Min: {medication.minStock} | Max: {medication.maxStock}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${expiryStatus.color}`} />
                            <span className="text-sm">
                              {new Date(medication.expiryDate).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Lote: {medication.batchNumber}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            R$ {medication.totalValue.toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Unit: R$ {medication.unitCost.toFixed(2)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {medication.prescriptionRequired && (
                            <Badge variant="secondary" className="text-xs">
                              Prescrição
                            </Badge>
                          )}
                          {medication.controlledSubstance && (
                            <Badge variant="destructive" className="text-xs">
                              Controlado
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onView?.(medication)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit?.(medication)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onDelete?.(medication.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMedications.map((medication) => {
            const stockStatus = getStockStatus(medication.currentStock, medication.minStock, medication.maxStock)
            const expiryStatus = getExpiryStatus(medication.expiryDate)
            
            return (
              <Card key={medication.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{medication.name}</CardTitle>
                      <CardDescription>
                        {medication.dosage} - {medication.form}
                      </CardDescription>
                    </div>
                    <Checkbox
                      checked={selectedMedications.includes(medication.id)}
                      onCheckedChange={(checked) => handleSelectMedication(medication.id, checked as boolean)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Categoria</div>
                      <Badge variant="outline" className="mt-1">{medication.category}</Badge>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Fabricante</div>
                      <div className="font-medium">{medication.manufacturer}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Estoque</div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`w-2 h-2 rounded-full ${stockStatus.color}`} />
                        <span className="font-medium">{medication.currentStock}</span>
                        <span className="text-muted-foreground">/ {medication.maxStock}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Validade</div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`w-2 h-2 rounded-full ${expiryStatus.color}`} />
                        <span className="text-sm">
                          {new Date(medication.expiryDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Valor Total</div>
                      <div className="font-medium">R$ {medication.totalValue.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Localização</div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="text-xs">{medication.location}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {medication.prescriptionRequired && (
                      <Badge variant="secondary" className="text-xs">
                        Prescrição
                      </Badge>
                    )}
                    {medication.controlledSubstance && (
                      <Badge variant="destructive" className="text-xs">
                        Controlado
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => onView?.(medication)}>
                      <Eye className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onEdit?.(medication)}>
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {filteredMedications.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum medicamento encontrado</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default MedicationList