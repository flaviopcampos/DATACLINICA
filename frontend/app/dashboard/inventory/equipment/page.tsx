'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import {
  Stethoscope,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Clock,
  Package,
  Wrench,
  FileText,
  Download,
  Upload,
  Eye,
  Calendar,
  DollarSign,
  MapPin,
  Activity,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  Shield,
  Gauge
} from 'lucide-react'

// Mock data para demonstração
const equipmentData = [
  {
    id: 1,
    name: 'Desfibrilador DEA',
    model: 'LIFEPAK CR Plus',
    manufacturer: 'Physio-Control',
    serialNumber: 'DEA001234',
    category: 'Emergência',
    type: 'Portátil',
    acquisitionDate: '2023-01-15',
    warrantyExpiry: '2026-01-15',
    lastMaintenance: '2024-01-10',
    nextMaintenance: '2024-07-10',
    lastCalibration: '2024-01-10',
    nextCalibration: '2025-01-10',
    location: 'UTI - Sala 1',
    department: 'UTI',
    responsible: 'Dr. João Silva',
    status: 'Operacional',
    condition: 'Excelente',
    acquisitionValue: 15000.00,
    currentValue: 12000.00,
    maintenanceCost: 500.00,
    usageHours: 2450,
    maxUsageHours: 8760,
    powerSource: 'Bateria/Rede',
    voltage: '220V',
    frequency: '60Hz',
    weight: '2.5kg',
    dimensions: '30x25x15cm',
    certification: 'ANVISA 12345',
    riskClass: 'III',
    requiresCalibration: true,
    criticalEquipment: true
  },
  {
    id: 2,
    name: 'Monitor Multiparâmetros',
    model: 'IntelliVue MP70',
    manufacturer: 'Philips',
    serialNumber: 'MON567890',
    category: 'Monitoramento',
    type: 'Fixo',
    acquisitionDate: '2022-06-20',
    warrantyExpiry: '2025-06-20',
    lastMaintenance: '2023-12-15',
    nextMaintenance: '2024-06-15',
    lastCalibration: '2023-12-15',
    nextCalibration: '2024-12-15',
    location: 'UTI - Leito 3',
    department: 'UTI',
    responsible: 'Enf. Maria Santos',
    status: 'Manutenção',
    condition: 'Bom',
    acquisitionValue: 25000.00,
    currentValue: 18000.00,
    maintenanceCost: 800.00,
    usageHours: 6200,
    maxUsageHours: 8760,
    powerSource: 'Rede',
    voltage: '110V',
    frequency: '60Hz',
    weight: '8.2kg',
    dimensions: '35x30x20cm',
    certification: 'ANVISA 67890',
    riskClass: 'II',
    requiresCalibration: true,
    criticalEquipment: true
  },
  {
    id: 3,
    name: 'Bomba de Infusão',
    model: 'Alaris GP',
    manufacturer: 'BD',
    serialNumber: 'BOM112233',
    category: 'Infusão',
    type: 'Portátil',
    acquisitionDate: '2023-03-10',
    warrantyExpiry: '2026-03-10',
    lastMaintenance: '2024-01-05',
    nextMaintenance: '2024-07-05',
    lastCalibration: '2024-01-05',
    nextCalibration: '2025-01-05',
    location: 'Enfermaria - Ala B',
    department: 'Clínica Médica',
    responsible: 'Enf. Ana Costa',
    status: 'Operacional',
    condition: 'Bom',
    acquisitionValue: 8500.00,
    currentValue: 7200.00,
    maintenanceCost: 300.00,
    usageHours: 1800,
    maxUsageHours: 8760,
    powerSource: 'Bateria/Rede',
    voltage: '110V',
    frequency: '60Hz',
    weight: '3.8kg',
    dimensions: '25x20x15cm',
    certification: 'ANVISA 11223',
    riskClass: 'II',
    requiresCalibration: true,
    criticalEquipment: false
  },
  {
    id: 4,
    name: 'Ventilador Pulmonar',
    model: 'Servo-i',
    manufacturer: 'Maquet',
    serialNumber: 'VEN445566',
    category: 'Respiratório',
    type: 'Fixo',
    acquisitionDate: '2021-08-15',
    warrantyExpiry: '2024-08-15',
    lastMaintenance: '2023-11-20',
    nextMaintenance: '2024-02-20',
    lastCalibration: '2023-11-20',
    nextCalibration: '2024-11-20',
    location: 'UTI - Leito 1',
    department: 'UTI',
    responsible: 'Dr. Carlos Lima',
    status: 'Vencido',
    condition: 'Regular',
    acquisitionValue: 45000.00,
    currentValue: 30000.00,
    maintenanceCost: 1200.00,
    usageHours: 7800,
    maxUsageHours: 8760,
    powerSource: 'Rede',
    voltage: '220V',
    frequency: '60Hz',
    weight: '65kg',
    dimensions: '80x60x120cm',
    certification: 'ANVISA 44556',
    riskClass: 'III',
    requiresCalibration: true,
    criticalEquipment: true
  }
]

const categories = [
  'Emergência',
  'Monitoramento',
  'Infusão',
  'Respiratório',
  'Diagnóstico',
  'Cirúrgico',
  'Laboratório',
  'Radiologia',
  'Fisioterapia',
  'Outros'
]

const departments = [
  'UTI',
  'Pronto Socorro',
  'Centro Cirúrgico',
  'Clínica Médica',
  'Pediatria',
  'Cardiologia',
  'Laboratório',
  'Radiologia',
  'Fisioterapia',
  'Farmácia'
]

const riskClasses = ['I', 'II', 'III', 'IV']

export default function EquipmentPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState(null)
  const [activeTab, setActiveTab] = useState('list')

  const filteredEquipment = equipmentData.filter(eq => {
    const matchesSearch = eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         eq.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         eq.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || eq.category === selectedCategory
    const matchesStatus = selectedStatus === 'all' || eq.status === selectedStatus
    const matchesDepartment = selectedDepartment === 'all' || eq.department === selectedDepartment
    return matchesSearch && matchesCategory && matchesStatus && matchesDepartment
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'Operacional': return 'bg-green-100 text-green-800'
      case 'Manutenção': return 'bg-yellow-100 text-yellow-800'
      case 'Inativo': return 'bg-gray-100 text-gray-800'
      case 'Vencido': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'Excelente': return 'text-green-600'
      case 'Bom': return 'text-blue-600'
      case 'Regular': return 'text-yellow-600'
      case 'Ruim': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getUsagePercentage = (used, max) => {
    return (used / max) * 100
  }

  const EquipmentForm = ({ equipment, onClose }) => {
    const [formData, setFormData] = useState({
      name: equipment?.name || '',
      model: equipment?.model || '',
      manufacturer: equipment?.manufacturer || '',
      serialNumber: equipment?.serialNumber || '',
      category: equipment?.category || '',
      type: equipment?.type || 'Portátil',
      department: equipment?.department || '',
      location: equipment?.location || '',
      responsible: equipment?.responsible || '',
      acquisitionDate: equipment?.acquisitionDate || '',
      warrantyExpiry: equipment?.warrantyExpiry || '',
      acquisitionValue: equipment?.acquisitionValue || '',
      currentValue: equipment?.currentValue || '',
      powerSource: equipment?.powerSource || '',
      voltage: equipment?.voltage || '',
      frequency: equipment?.frequency || '',
      weight: equipment?.weight || '',
      dimensions: equipment?.dimensions || '',
      certification: equipment?.certification || '',
      riskClass: equipment?.riskClass || 'I',
      requiresCalibration: equipment?.requiresCalibration || false,
      criticalEquipment: equipment?.criticalEquipment || false,
      description: equipment?.description || ''
    })

    return (
      <div className="space-y-4 max-h-96 overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nome do Equipamento *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Ex: Desfibrilador DEA"
            />
          </div>
          <div>
            <Label htmlFor="model">Modelo</Label>
            <Input
              id="model"
              value={formData.model}
              onChange={(e) => setFormData({...formData, model: e.target.value})}
              placeholder="Ex: LIFEPAK CR Plus"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="manufacturer">Fabricante</Label>
            <Input
              id="manufacturer"
              value={formData.manufacturer}
              onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
              placeholder="Nome do fabricante"
            />
          </div>
          <div>
            <Label htmlFor="serialNumber">Número de Série *</Label>
            <Input
              id="serialNumber"
              value={formData.serialNumber}
              onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
              placeholder="Número de série único"
            />
          </div>
          <div>
            <Label htmlFor="certification">Certificação ANVISA</Label>
            <Input
              id="certification"
              value={formData.certification}
              onChange={(e) => setFormData({...formData, certification: e.target.value})}
              placeholder="Número da certificação"
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div>
            <Label htmlFor="category">Categoria *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="type">Tipo</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Portátil">Portátil</SelectItem>
                <SelectItem value="Fixo">Fixo</SelectItem>
                <SelectItem value="Móvel">Móvel</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="department">Departamento</Label>
            <Select value={formData.department} onValueChange={(value) => setFormData({...formData, department: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="riskClass">Classe de Risco</Label>
            <Select value={formData.riskClass} onValueChange={(value) => setFormData({...formData, riskClass: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {riskClasses.map(risk => (
                  <SelectItem key={risk} value={risk}>Classe {risk}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="location">Localização Atual</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              placeholder="Ex: UTI - Sala 1"
            />
          </div>
          <div>
            <Label htmlFor="responsible">Responsável</Label>
            <Input
              id="responsible"
              value={formData.responsible}
              onChange={(e) => setFormData({...formData, responsible: e.target.value})}
              placeholder="Nome do responsável"
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div>
            <Label htmlFor="acquisitionDate">Data de Aquisição</Label>
            <Input
              id="acquisitionDate"
              type="date"
              value={formData.acquisitionDate}
              onChange={(e) => setFormData({...formData, acquisitionDate: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="warrantyExpiry">Fim da Garantia</Label>
            <Input
              id="warrantyExpiry"
              type="date"
              value={formData.warrantyExpiry}
              onChange={(e) => setFormData({...formData, warrantyExpiry: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="acquisitionValue">Valor de Aquisição</Label>
            <Input
              id="acquisitionValue"
              type="number"
              step="0.01"
              value={formData.acquisitionValue}
              onChange={(e) => setFormData({...formData, acquisitionValue: e.target.value})}
              placeholder="0.00"
            />
          </div>
          <div>
            <Label htmlFor="currentValue">Valor Atual</Label>
            <Input
              id="currentValue"
              type="number"
              step="0.01"
              value={formData.currentValue}
              onChange={(e) => setFormData({...formData, currentValue: e.target.value})}
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div>
            <Label htmlFor="powerSource">Fonte de Energia</Label>
            <Input
              id="powerSource"
              value={formData.powerSource}
              onChange={(e) => setFormData({...formData, powerSource: e.target.value})}
              placeholder="Ex: Bateria/Rede"
            />
          </div>
          <div>
            <Label htmlFor="voltage">Voltagem</Label>
            <Input
              id="voltage"
              value={formData.voltage}
              onChange={(e) => setFormData({...formData, voltage: e.target.value})}
              placeholder="Ex: 220V"
            />
          </div>
          <div>
            <Label htmlFor="weight">Peso</Label>
            <Input
              id="weight"
              value={formData.weight}
              onChange={(e) => setFormData({...formData, weight: e.target.value})}
              placeholder="Ex: 2.5kg"
            />
          </div>
          <div>
            <Label htmlFor="dimensions">Dimensões</Label>
            <Input
              id="dimensions"
              value={formData.dimensions}
              onChange={(e) => setFormData({...formData, dimensions: e.target.value})}
              placeholder="Ex: 30x25x15cm"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="requiresCalibration"
              checked={formData.requiresCalibration}
              onChange={(e) => setFormData({...formData, requiresCalibration: e.target.checked})}
              className="rounded"
            />
            <Label htmlFor="requiresCalibration">Requer Calibração</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="criticalEquipment"
              checked={formData.criticalEquipment}
              onChange={(e) => setFormData({...formData, criticalEquipment: e.target.checked})}
              className="rounded"
            />
            <Label htmlFor="criticalEquipment">Equipamento Crítico</Label>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Descrição/Observações</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Informações adicionais sobre o equipamento"
            rows={3}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Equipamentos</h1>
          <p className="text-gray-600 mt-1">
            Controle completo de equipamentos médicos e hospitalares
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Novo Equipamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Equipamento</DialogTitle>
                <DialogDescription>
                  Preencha as informações do equipamento para adicionar ao inventário
                </DialogDescription>
              </DialogHeader>
              <EquipmentForm onClose={() => setIsAddDialogOpen(false)} />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setIsAddDialogOpen(false)}>
                  Salvar Equipamento
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Equipamentos</p>
                <p className="text-2xl font-bold">{equipmentData.length}</p>
              </div>
              <Stethoscope className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Operacionais</p>
                <p className="text-2xl font-bold text-green-600">
                  {equipmentData.filter(e => e.status === 'Operacional').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Em Manutenção</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {equipmentData.filter(e => e.status === 'Manutenção').length}
                </p>
              </div>
              <Wrench className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vencidos</p>
                <p className="text-2xl font-bold text-red-600">
                  {equipmentData.filter(e => e.status === 'Vencido').length}
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
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold">R$ {equipmentData.reduce((sum, e) => sum + e.currentValue, 0).toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar equipamentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Departamentos</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="Operacional">Operacional</SelectItem>
                <SelectItem value="Manutenção">Manutenção</SelectItem>
                <SelectItem value="Inativo">Inativo</SelectItem>
                <SelectItem value="Vencido">Vencido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Conteúdo */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Lista de Equipamentos</TabsTrigger>
          <TabsTrigger value="maintenance">Manutenção</TabsTrigger>
          <TabsTrigger value="calibration">Calibração</TabsTrigger>
          <TabsTrigger value="locations">Localização</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Equipamentos ({filteredEquipment.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Equipamento</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Condição</TableHead>
                      <TableHead>Uso</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEquipment.map((equipment) => {
                      const usagePercentage = getUsagePercentage(equipment.usageHours, equipment.maxUsageHours)
                      return (
                        <TableRow key={equipment.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{equipment.name}</p>
                              <p className="text-sm text-gray-600">
                                {equipment.model} • {equipment.manufacturer}
                              </p>
                              <p className="text-xs text-gray-500">S/N: {equipment.serialNumber}</p>
                              <div className="flex gap-1 mt-1">
                                {equipment.criticalEquipment && (
                                  <Badge variant="destructive" className="text-xs">Crítico</Badge>
                                )}
                                {equipment.requiresCalibration && (
                                  <Badge variant="outline" className="text-xs">Calibração</Badge>
                                )}
                                <Badge variant="secondary" className="text-xs">Classe {equipment.riskClass}</Badge>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{equipment.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium">{equipment.location}</p>
                              <p className="text-xs text-gray-600">{equipment.department}</p>
                              <p className="text-xs text-gray-500">{equipment.responsible}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(equipment.status)}>
                              {equipment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className={`font-medium ${getConditionColor(equipment.condition)}`}>
                              {equipment.condition}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium">
                                {equipment.usageHours}h / {equipment.maxUsageHours}h
                              </p>
                              <Progress value={usagePercentage} className="h-1 mt-1" />
                              <p className="text-xs text-gray-600 mt-1">
                                {usagePercentage.toFixed(1)}% utilizado
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">R$ {equipment.currentValue.toLocaleString()}</p>
                              <p className="text-xs text-gray-600">
                                Aquisição: R$ {equipment.acquisitionValue.toLocaleString()}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedEquipment(equipment)
                                  setIsEditDialogOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Wrench className="h-4 w-4" />
                              </Button>
                            </div>
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

        <TabsContent value="maintenance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-yellow-500" />
                  Manutenção Pendente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {equipmentData.filter(e => new Date(e.nextMaintenance) <= new Date()).map(equipment => (
                    <div key={equipment.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{equipment.name}</p>
                        <p className="text-xs text-gray-600">{equipment.location}</p>
                        <p className="text-xs text-yellow-600">Venceu: {equipment.nextMaintenance}</p>
                      </div>
                      <Button size="sm" variant="outline">
                        Agendar
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  Histórico de Manutenção
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {equipmentData.map(equipment => (
                    <div key={equipment.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{equipment.name}</p>
                        <p className="text-xs text-gray-600">Última: {equipment.lastMaintenance}</p>
                        <p className="text-xs text-blue-600">Custo: R$ {equipment.maintenanceCost.toFixed(2)}</p>
                      </div>
                      <Button size="sm" variant="outline">
                        Ver Detalhes
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calibration">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-orange-500" />
                  Calibração Pendente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {equipmentData.filter(e => e.requiresCalibration && new Date(e.nextCalibration) <= new Date()).map(equipment => (
                    <div key={equipment.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{equipment.name}</p>
                        <p className="text-xs text-gray-600">{equipment.location}</p>
                        <p className="text-xs text-orange-600">Vence: {equipment.nextCalibration}</p>
                      </div>
                      <Button size="sm" variant="outline">
                        Calibrar
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  Calibrações em Dia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {equipmentData.filter(e => e.requiresCalibration && new Date(e.nextCalibration) > new Date()).map(equipment => (
                    <div key={equipment.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{equipment.name}</p>
                        <p className="text-xs text-gray-600">Última: {equipment.lastCalibration}</p>
                        <p className="text-xs text-green-600">Próxima: {equipment.nextCalibration}</p>
                      </div>
                      <Button size="sm" variant="outline">
                        Certificado
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="locations">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map(department => {
              const deptEquipment = equipmentData.filter(e => e.department === department)
              const operationalCount = deptEquipment.filter(e => e.status === 'Operacional').length
              const totalValue = deptEquipment.reduce((sum, e) => sum + e.currentValue, 0)
              
              return (
                <Card key={department}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      {department}
                    </CardTitle>
                    <CardDescription>{deptEquipment.length} equipamentos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Operacionais:</span>
                        <span className="font-medium text-green-600">{operationalCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Valor Total:</span>
                        <span className="font-medium">R$ {totalValue.toLocaleString()}</span>
                      </div>
                      <div className="mt-3">
                        <h4 className="text-sm font-medium mb-2">Equipamentos:</h4>
                        <div className="space-y-1">
                          {deptEquipment.slice(0, 3).map(eq => (
                            <div key={eq.id} className="text-xs text-gray-600 flex justify-between">
                              <span>{eq.name}</span>
                              <Badge className={getStatusColor(eq.status)} variant="outline">
                                {eq.status}
                              </Badge>
                            </div>
                          ))}
                          {deptEquipment.length > 3 && (
                            <p className="text-xs text-gray-500">+{deptEquipment.length - 3} mais...</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Editar Equipamento</DialogTitle>
            <DialogDescription>
              Atualize as informações do equipamento
            </DialogDescription>
          </DialogHeader>
          {selectedEquipment && (
            <EquipmentForm 
              equipment={selectedEquipment} 
              onClose={() => setIsEditDialogOpen(false)} 
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setIsEditDialogOpen(false)}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}