'use client'

import { useState } from 'react'
import { 
  Wrench, 
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
  MapPin,
  Settings,
  CheckCircle,
  XCircle,
  Zap
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

interface Equipment {
  id: string
  name: string
  model: string
  manufacturer: string
  serialNumber: string
  category: string
  type: string
  department: string
  location: string
  responsible: string
  acquisitionDate: string
  warrantyExpiry: string
  acquisitionValue: number
  currentValue: number
  technicalSpecs: string
  certification: string
  riskClass: 'I' | 'II' | 'III' | 'IV'
  calibrationRequired: boolean
  calibrationDate?: string
  nextCalibration?: string
  maintenanceStatus: 'ok' | 'pending' | 'overdue'
  lastMaintenance?: string
  nextMaintenance?: string
  operationalStatus: 'operational' | 'maintenance' | 'broken' | 'retired'
  criticality: 'low' | 'medium' | 'high' | 'critical'
  lastUpdated: string
}

interface EquipmentListProps {
  equipment?: Equipment[]
  onAdd?: () => void
  onEdit?: (equipment: Equipment) => void
  onDelete?: (equipmentId: string) => void
  onView?: (equipment: Equipment) => void
  className?: string
}

const mockEquipment: Equipment[] = [
  {
    id: '1',
    name: 'Ventilador Pulmonar',
    model: 'Servo-i',
    manufacturer: 'Maquet',
    serialNumber: 'VP2024001',
    category: 'Equipamentos de Suporte à Vida',
    type: 'Ventilador',
    department: 'UTI',
    location: 'UTI - Leito 05',
    responsible: 'Dr. Carlos Silva',
    acquisitionDate: '2023-03-15',
    warrantyExpiry: '2026-03-15',
    acquisitionValue: 85000.00,
    currentValue: 75000.00,
    technicalSpecs: 'Volume corrente: 20-2000mL, PEEP: 0-50cmH2O',
    certification: 'ANVISA 80146170001',
    riskClass: 'III',
    calibrationRequired: true,
    calibrationDate: '2024-01-15',
    nextCalibration: '2024-07-15',
    maintenanceStatus: 'ok',
    lastMaintenance: '2024-01-10',
    nextMaintenance: '2024-04-10',
    operationalStatus: 'operational',
    criticality: 'critical',
    lastUpdated: '2024-01-20T10:30:00Z'
  },
  {
    id: '2',
    name: 'Monitor Multiparamétrico',
    model: 'IntelliVue MX450',
    manufacturer: 'Philips',
    serialNumber: 'MP2024002',
    category: 'Monitorização',
    type: 'Monitor',
    department: 'Cardiologia',
    location: 'Cardiologia - Sala 3',
    responsible: 'Enf. Maria Santos',
    acquisitionDate: '2023-08-20',
    warrantyExpiry: '2025-08-20',
    acquisitionValue: 25000.00,
    currentValue: 22000.00,
    technicalSpecs: 'ECG, SpO2, NIBP, Temp, Resp',
    certification: 'ANVISA 80146170002',
    riskClass: 'II',
    calibrationRequired: true,
    calibrationDate: '2024-01-20',
    nextCalibration: '2024-07-20',
    maintenanceStatus: 'pending',
    lastMaintenance: '2023-10-15',
    nextMaintenance: '2024-01-15',
    operationalStatus: 'operational',
    criticality: 'high',
    lastUpdated: '2024-01-19T14:15:00Z'
  },
  {
    id: '3',
    name: 'Desfibrilador',
    model: 'HeartStart MRx',
    manufacturer: 'Philips',
    serialNumber: 'DF2024003',
    category: 'Emergência',
    type: 'Desfibrilador',
    department: 'Emergência',
    location: 'Emergência - Sala de Trauma',
    responsible: 'Dr. Ana Costa',
    acquisitionDate: '2022-11-10',
    warrantyExpiry: '2025-11-10',
    acquisitionValue: 35000.00,
    currentValue: 28000.00,
    technicalSpecs: 'Energia: 1-200J, Modo manual/automático',
    certification: 'ANVISA 80146170003',
    riskClass: 'III',
    calibrationRequired: true,
    calibrationDate: '2023-12-01',
    nextCalibration: '2024-06-01',
    maintenanceStatus: 'overdue',
    lastMaintenance: '2023-08-20',
    nextMaintenance: '2023-11-20',
    operationalStatus: 'maintenance',
    criticality: 'critical',
    lastUpdated: '2024-01-18T09:45:00Z'
  }
]

function getMaintenanceStatus(status: string, nextMaintenance?: string) {
  if (status === 'overdue') return { status: 'overdue', color: 'bg-red-500', label: 'Atrasada' }
  if (status === 'pending') return { status: 'pending', color: 'bg-orange-500', label: 'Pendente' }
  return { status: 'ok', color: 'bg-green-500', label: 'Em Dia' }
}

function getOperationalStatus(status: string) {
  switch (status) {
    case 'operational': return { status: 'operational', color: 'bg-green-500', label: 'Operacional' }
    case 'maintenance': return { status: 'maintenance', color: 'bg-orange-500', label: 'Manutenção' }
    case 'broken': return { status: 'broken', color: 'bg-red-500', label: 'Quebrado' }
    case 'retired': return { status: 'retired', color: 'bg-gray-500', label: 'Aposentado' }
    default: return { status: 'unknown', color: 'bg-gray-500', label: 'Desconhecido' }
  }
}

function getCriticalityStatus(criticality: string) {
  switch (criticality) {
    case 'critical': return { status: 'critical', color: 'bg-red-500', label: 'Crítico' }
    case 'high': return { status: 'high', color: 'bg-orange-500', label: 'Alto' }
    case 'medium': return { status: 'medium', color: 'bg-yellow-500', label: 'Médio' }
    case 'low': return { status: 'low', color: 'bg-green-500', label: 'Baixo' }
    default: return { status: 'unknown', color: 'bg-gray-500', label: 'Desconhecido' }
  }
}

function getCalibrationStatus(calibrationRequired: boolean, nextCalibration?: string) {
  if (!calibrationRequired) return { status: 'not_required', color: 'bg-gray-500', label: 'Não Requerida' }
  
  if (!nextCalibration) return { status: 'unknown', color: 'bg-gray-500', label: 'Indefinida' }
  
  const today = new Date()
  const calibration = new Date(nextCalibration)
  const daysUntilCalibration = Math.ceil((calibration.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysUntilCalibration < 0) return { status: 'overdue', color: 'bg-red-500', label: 'Vencida' }
  if (daysUntilCalibration <= 30) return { status: 'due_soon', color: 'bg-orange-500', label: 'Vencendo' }
  return { status: 'ok', color: 'bg-green-500', label: 'Em Dia' }
}

export function EquipmentList({ 
  equipment = mockEquipment, 
  onAdd, 
  onEdit, 
  onDelete, 
  onView,
  className 
}: EquipmentListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')

  const categories = Array.from(new Set(equipment.map(eq => eq.category)))
  const departments = Array.from(new Set(equipment.map(eq => eq.department)))

  const filteredEquipment = equipment.filter(eq => {
    const matchesSearch = 
      eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || eq.category === selectedCategory
    const matchesDepartment = selectedDepartment === 'all' || eq.department === selectedDepartment
    
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'operational' && eq.operationalStatus === 'operational') ||
      (selectedStatus === 'maintenance' && eq.operationalStatus === 'maintenance') ||
      (selectedStatus === 'calibration_due' && eq.calibrationRequired && getCalibrationStatus(eq.calibrationRequired, eq.nextCalibration).status === 'due_soon') ||
      (selectedStatus === 'maintenance_due' && eq.maintenanceStatus === 'pending') ||
      (selectedStatus === 'critical' && eq.criticality === 'critical')
    
    return matchesSearch && matchesCategory && matchesDepartment && matchesStatus
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEquipment(filteredEquipment.map(eq => eq.id))
    } else {
      setSelectedEquipment([])
    }
  }

  const handleSelectEquipment = (equipmentId: string, checked: boolean) => {
    if (checked) {
      setSelectedEquipment(prev => [...prev, equipmentId])
    } else {
      setSelectedEquipment(prev => prev.filter(id => id !== equipmentId))
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Equipamentos</h2>
          <p className="text-muted-foreground">
            {filteredEquipment.length} de {equipment.length} equipamentos
          </p>
        </div>
        <Button onClick={onAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Equipamento
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nome, modelo, série..."
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
              <Label>Departamento</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Departamentos</SelectItem>
                  {departments.map(department => (
                    <SelectItem key={department} value={department}>{department}</SelectItem>
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
                  <SelectItem value="operational">Operacional</SelectItem>
                  <SelectItem value="maintenance">Em Manutenção</SelectItem>
                  <SelectItem value="calibration_due">Calibração Vencendo</SelectItem>
                  <SelectItem value="maintenance_due">Manutenção Pendente</SelectItem>
                  <SelectItem value="critical">Críticos</SelectItem>
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
      {selectedEquipment.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedEquipment.length} equipamento(s) selecionado(s)
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Exportar Selecionados
                </Button>
                <Button variant="outline" size="sm">
                  Agendar Manutenção
                </Button>
                <Button variant="destructive" size="sm">
                  Excluir Selecionados
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Equipment List */}
      {viewMode === 'table' ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedEquipment.length === filteredEquipment.length && filteredEquipment.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedEquipment(filteredEquipment.map(eq => eq.id))
                      } else {
                        setSelectedEquipment([])
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Equipamento</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Manutenção</TableHead>
                <TableHead>Calibração</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEquipment.map((equipment) => (
                <TableRow key={equipment.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedEquipment.includes(equipment.id)}
                      onCheckedChange={(checked) => handleSelectEquipment(equipment.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{equipment.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {equipment.manufacturer} - {equipment.model}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        S/N: {equipment.serialNumber}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{equipment.category}</Badge>
                  </TableCell>
                  <TableCell>{equipment.department}</TableCell>
                  <TableCell>
                    <Badge className={getOperationalStatus(equipment.operationalStatus).className}>
                      {getOperationalStatus(equipment.operationalStatus).label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getMaintenanceStatus(equipment.maintenanceStatus).className}>
                      {getMaintenanceStatus(equipment.maintenanceStatus).label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getCalibrationStatus(equipment.calibrationStatus).className}>
                      {getCalibrationStatus(equipment.calibrationStatus).label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      R$ {equipment.acquisitionValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView?.(equipment)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit?.(equipment)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Calendar className="mr-2 h-4 w-4" />
                          Agendar Manutenção
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="mr-2 h-4 w-4" />
                          Calibrar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => onDelete?.(equipment.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipment.map((equipment) => (
            <Card key={equipment.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{equipment.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {equipment.manufacturer} - {equipment.model}
                    </p>
                  </div>
                  <Checkbox
                    checked={selectedEquipment.includes(equipment.id)}
                    onCheckedChange={(checked) => handleSelectEquipment(equipment.id, checked as boolean)}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Categoria:</span>
                    <div><Badge variant="outline">{equipment.category}</Badge></div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Departamento:</span>
                    <div>{equipment.department}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Série:</span>
                    <div>{equipment.serialNumber}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Localização:</span>
                    <div>{equipment.location}</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge className={getOperationalStatus(equipment.operationalStatus).className}>
                      {getOperationalStatus(equipment.operationalStatus).label}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Manutenção:</span>
                    <Badge className={getMaintenanceStatus(equipment.maintenanceStatus).className}>
                      {getMaintenanceStatus(equipment.maintenanceStatus).label}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Calibração:</span>
                    <Badge className={getCalibrationStatus(equipment.calibrationStatus).className}>
                      {getCalibrationStatus(equipment.calibrationStatus).label}
                    </Badge>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium">Valor:</span>
                    <span className="font-semibold">
                      R$ {equipment.acquisitionValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => onView?.(equipment)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onEdit?.(equipment)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Calendar className="mr-2 h-4 w-4" />
                          Agendar Manutenção
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="mr-2 h-4 w-4" />
                          Calibrar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => onDelete?.(equipment.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredEquipment.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum equipamento encontrado</h3>
            <p className="text-muted-foreground text-center mb-4">
              Não há equipamentos que correspondam aos filtros selecionados.
            </p>
            <Button onClick={() => {
              setSearchTerm('')
              setSelectedCategory('all')
              setSelectedDepartment('all')
              setSelectedStatus('all')
            }}>
              Limpar Filtros
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default EquipmentList