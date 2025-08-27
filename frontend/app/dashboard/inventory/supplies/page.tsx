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
  Package,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Clock,
  Boxes,
  ShoppingCart,
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
  TrendingUp,
  TrendingDown,
  BarChart3,
  Zap,
  Shield
} from 'lucide-react'

// Mock data para demonstração
const suppliesData = [
  {
    id: 1,
    name: 'Luvas Descartáveis',
    description: 'Luvas de procedimento em látex, tamanho M',
    category: 'EPI',
    subcategory: 'Proteção Individual',
    brand: 'Supermax',
    model: 'Latex Powder Free',
    unit: 'Caixa (100 unidades)',
    currentStock: 45,
    minStock: 20,
    maxStock: 100,
    reorderPoint: 25,
    unitCost: 25.90,
    totalValue: 1165.50,
    supplier: 'MedSupply Ltda',
    supplierCode: 'SUP001',
    barcode: '7891234567890',
    location: 'Almoxarifado A - Prateleira 3',
    expirationDate: '2025-06-15',
    batchNumber: 'LT240315',
    acquisitionDate: '2024-01-15',
    lastMovement: '2024-01-20',
    movementType: 'Saída',
    movementQuantity: 5,
    status: 'Normal',
    criticality: 'Alta',
    consumptionRate: 8.5, // unidades por dia
    leadTime: 7, // dias
    autoReorder: true,
    sterile: false,
    controlled: false,
    temperature: 'Ambiente',
    humidity: 'Normal'
  },
  {
    id: 2,
    name: 'Seringas 10ml',
    description: 'Seringas descartáveis de 10ml com agulha',
    category: 'Descartáveis',
    subcategory: 'Injeção',
    brand: 'BD',
    model: 'Plastipak',
    unit: 'Pacote (50 unidades)',
    currentStock: 12,
    minStock: 15,
    maxStock: 80,
    reorderPoint: 18,
    unitCost: 45.80,
    totalValue: 549.60,
    supplier: 'Hospitalar Brasil',
    supplierCode: 'SUP002',
    barcode: '7891234567891',
    location: 'Almoxarifado B - Gaveta 5',
    expirationDate: '2026-03-20',
    batchNumber: 'SR240220',
    acquisitionDate: '2024-01-10',
    lastMovement: '2024-01-18',
    movementType: 'Saída',
    movementQuantity: 3,
    status: 'Baixo',
    criticality: 'Crítica',
    consumptionRate: 2.3,
    leadTime: 5,
    autoReorder: true,
    sterile: true,
    controlled: false,
    temperature: 'Ambiente',
    humidity: 'Seco'
  },
  {
    id: 3,
    name: 'Gaze Estéril 7.5x7.5cm',
    description: 'Compressa de gaze estéril para curativos',
    category: 'Curativos',
    subcategory: 'Compressas',
    brand: 'Cremer',
    model: 'Estéril Individual',
    unit: 'Pacote (25 unidades)',
    currentStock: 85,
    minStock: 30,
    maxStock: 150,
    reorderPoint: 40,
    unitCost: 12.50,
    totalValue: 1062.50,
    supplier: 'Distribuidora Médica',
    supplierCode: 'SUP003',
    barcode: '7891234567892',
    location: 'Almoxarifado A - Prateleira 1',
    expirationDate: '2025-12-10',
    batchNumber: 'GZ241210',
    acquisitionDate: '2023-12-15',
    lastMovement: '2024-01-19',
    movementType: 'Entrada',
    movementQuantity: 20,
    status: 'Normal',
    criticality: 'Média',
    consumptionRate: 5.2,
    leadTime: 3,
    autoReorder: false,
    sterile: true,
    controlled: false,
    temperature: 'Ambiente',
    humidity: 'Seco'
  },
  {
    id: 4,
    name: 'Álcool 70% - 1L',
    description: 'Álcool etílico hidratado 70% para antissepsia',
    category: 'Antissépticos',
    subcategory: 'Soluções',
    brand: 'Rioquímica',
    model: 'Hospitalar',
    unit: 'Frasco (1000ml)',
    currentStock: 28,
    minStock: 25,
    maxStock: 100,
    reorderPoint: 30,
    unitCost: 8.90,
    totalValue: 249.20,
    supplier: 'Química Hospitalar',
    supplierCode: 'SUP004',
    barcode: '7891234567893',
    location: 'Almoxarifado C - Armário 2',
    expirationDate: '2025-08-30',
    batchNumber: 'AL240830',
    acquisitionDate: '2024-01-05',
    lastMovement: '2024-01-17',
    movementType: 'Saída',
    movementQuantity: 2,
    status: 'Normal',
    criticality: 'Alta',
    consumptionRate: 1.8,
    leadTime: 2,
    autoReorder: true,
    sterile: false,
    controlled: false,
    temperature: 'Ambiente',
    humidity: 'Normal'
  },
  {
    id: 5,
    name: 'Cateter Venoso 22G',
    description: 'Cateter venoso periférico 22G com mandril',
    category: 'Acesso Vascular',
    subcategory: 'Cateteres',
    brand: 'Nipro',
    model: 'Surflo',
    unit: 'Unidade',
    currentStock: 8,
    minStock: 20,
    maxStock: 100,
    reorderPoint: 25,
    unitCost: 3.45,
    totalValue: 27.60,
    supplier: 'MedTech Solutions',
    supplierCode: 'SUP005',
    barcode: '7891234567894',
    location: 'Almoxarifado B - Gaveta 3',
    expirationDate: '2026-09-15',
    batchNumber: 'CT240915',
    acquisitionDate: '2024-01-08',
    lastMovement: '2024-01-21',
    movementType: 'Saída',
    movementQuantity: 12,
    status: 'Crítico',
    criticality: 'Crítica',
    consumptionRate: 4.2,
    leadTime: 10,
    autoReorder: true,
    sterile: true,
    controlled: false,
    temperature: 'Ambiente',
    humidity: 'Seco'
  }
]

const categories = [
  'EPI',
  'Descartáveis',
  'Curativos',
  'Antissépticos',
  'Acesso Vascular',
  'Medicamentos Tópicos',
  'Material Cirúrgico',
  'Diagnóstico',
  'Higiene',
  'Outros'
]

const suppliers = [
  'MedSupply Ltda',
  'Hospitalar Brasil',
  'Distribuidora Médica',
  'Química Hospitalar',
  'MedTech Solutions',
  'Cirúrgica Nacional',
  'Farmácia Hospitalar',
  'Suprimentos Médicos'
]

const locations = [
  'Almoxarifado A',
  'Almoxarifado B',
  'Almoxarifado C',
  'Farmácia Central',
  'UTI - Estoque',
  'CC - Estoque',
  'PS - Estoque',
  'Enfermaria - Estoque'
]

export default function SuppliesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedSupplier, setSelectedSupplier] = useState('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedSupply, setSelectedSupply] = useState(null)
  const [activeTab, setActiveTab] = useState('list')

  const filteredSupplies = suppliesData.filter(supply => {
    const matchesSearch = supply.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supply.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supply.barcode.includes(searchTerm)
    const matchesCategory = selectedCategory === 'all' || supply.category === selectedCategory
    const matchesStatus = selectedStatus === 'all' || supply.status === selectedStatus
    const matchesSupplier = selectedSupplier === 'all' || supply.supplier === selectedSupplier
    return matchesSearch && matchesCategory && matchesStatus && matchesSupplier
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'Normal': return 'bg-green-100 text-green-800'
      case 'Baixo': return 'bg-yellow-100 text-yellow-800'
      case 'Crítico': return 'bg-red-100 text-red-800'
      case 'Vencido': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCriticalityColor = (criticality) => {
    switch (criticality) {
      case 'Crítica': return 'text-red-600'
      case 'Alta': return 'text-orange-600'
      case 'Média': return 'text-yellow-600'
      case 'Baixa': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getStockPercentage = (current, max) => {
    return (current / max) * 100
  }

  const getDaysUntilExpiration = (expirationDate) => {
    const today = new Date()
    const expiry = new Date(expirationDate)
    const diffTime = expiry - today
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const SupplyForm = ({ supply, onClose }) => {
    const [formData, setFormData] = useState({
      name: supply?.name || '',
      description: supply?.description || '',
      category: supply?.category || '',
      subcategory: supply?.subcategory || '',
      brand: supply?.brand || '',
      model: supply?.model || '',
      unit: supply?.unit || '',
      currentStock: supply?.currentStock || '',
      minStock: supply?.minStock || '',
      maxStock: supply?.maxStock || '',
      reorderPoint: supply?.reorderPoint || '',
      unitCost: supply?.unitCost || '',
      supplier: supply?.supplier || '',
      supplierCode: supply?.supplierCode || '',
      barcode: supply?.barcode || '',
      location: supply?.location || '',
      expirationDate: supply?.expirationDate || '',
      batchNumber: supply?.batchNumber || '',
      criticality: supply?.criticality || 'Média',
      autoReorder: supply?.autoReorder || false,
      sterile: supply?.sterile || false,
      controlled: supply?.controlled || false,
      temperature: supply?.temperature || 'Ambiente',
      humidity: supply?.humidity || 'Normal'
    })

    return (
      <div className="space-y-4 max-h-96 overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nome do Suprimento *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Ex: Luvas Descartáveis"
            />
          </div>
          <div>
            <Label htmlFor="barcode">Código de Barras</Label>
            <Input
              id="barcode"
              value={formData.barcode}
              onChange={(e) => setFormData({...formData, barcode: e.target.value})}
              placeholder="Código de barras"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Descrição detalhada do suprimento"
            rows={2}
          />
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
            <Label htmlFor="subcategory">Subcategoria</Label>
            <Input
              id="subcategory"
              value={formData.subcategory}
              onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
              placeholder="Subcategoria"
            />
          </div>
          <div>
            <Label htmlFor="brand">Marca</Label>
            <Input
              id="brand"
              value={formData.brand}
              onChange={(e) => setFormData({...formData, brand: e.target.value})}
              placeholder="Marca do produto"
            />
          </div>
          <div>
            <Label htmlFor="model">Modelo</Label>
            <Input
              id="model"
              value={formData.model}
              onChange={(e) => setFormData({...formData, model: e.target.value})}
              placeholder="Modelo do produto"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="unit">Unidade de Medida *</Label>
            <Input
              id="unit"
              value={formData.unit}
              onChange={(e) => setFormData({...formData, unit: e.target.value})}
              placeholder="Ex: Caixa (100 unidades)"
            />
          </div>
          <div>
            <Label htmlFor="supplier">Fornecedor</Label>
            <Select value={formData.supplier} onValueChange={(value) => setFormData({...formData, supplier: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map(supplier => (
                  <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="supplierCode">Código do Fornecedor</Label>
            <Input
              id="supplierCode"
              value={formData.supplierCode}
              onChange={(e) => setFormData({...formData, supplierCode: e.target.value})}
              placeholder="Código no fornecedor"
            />
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4">
          <div>
            <Label htmlFor="currentStock">Estoque Atual</Label>
            <Input
              id="currentStock"
              type="number"
              value={formData.currentStock}
              onChange={(e) => setFormData({...formData, currentStock: e.target.value})}
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="minStock">Estoque Mínimo</Label>
            <Input
              id="minStock"
              type="number"
              value={formData.minStock}
              onChange={(e) => setFormData({...formData, minStock: e.target.value})}
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="maxStock">Estoque Máximo</Label>
            <Input
              id="maxStock"
              type="number"
              value={formData.maxStock}
              onChange={(e) => setFormData({...formData, maxStock: e.target.value})}
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="reorderPoint">Ponto de Reposição</Label>
            <Input
              id="reorderPoint"
              type="number"
              value={formData.reorderPoint}
              onChange={(e) => setFormData({...formData, reorderPoint: e.target.value})}
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="unitCost">Custo Unitário</Label>
            <Input
              id="unitCost"
              type="number"
              step="0.01"
              value={formData.unitCost}
              onChange={(e) => setFormData({...formData, unitCost: e.target.value})}
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div>
            <Label htmlFor="location">Localização</Label>
            <Select value={formData.location} onValueChange={(value) => setFormData({...formData, location: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {locations.map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="expirationDate">Data de Validade</Label>
            <Input
              id="expirationDate"
              type="date"
              value={formData.expirationDate}
              onChange={(e) => setFormData({...formData, expirationDate: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="batchNumber">Número do Lote</Label>
            <Input
              id="batchNumber"
              value={formData.batchNumber}
              onChange={(e) => setFormData({...formData, batchNumber: e.target.value})}
              placeholder="Lote do produto"
            />
          </div>
          <div>
            <Label htmlFor="criticality">Criticidade</Label>
            <Select value={formData.criticality} onValueChange={(value) => setFormData({...formData, criticality: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Crítica">Crítica</SelectItem>
                <SelectItem value="Alta">Alta</SelectItem>
                <SelectItem value="Média">Média</SelectItem>
                <SelectItem value="Baixa">Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="temperature">Temperatura de Armazenamento</Label>
            <Select value={formData.temperature} onValueChange={(value) => setFormData({...formData, temperature: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ambiente">Ambiente (15-25°C)</SelectItem>
                <SelectItem value="Refrigerado">Refrigerado (2-8°C)</SelectItem>
                <SelectItem value="Congelado">Congelado (-20°C)</SelectItem>
                <SelectItem value="Controlado">Controlado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="humidity">Umidade</Label>
            <Select value={formData.humidity} onValueChange={(value) => setFormData({...formData, humidity: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Normal">Normal</SelectItem>
                <SelectItem value="Seco">Seco (&lt;60%)</SelectItem>
                <SelectItem value="Controlado">Controlado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2 pt-6">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="sterile"
                checked={formData.sterile}
                onChange={(e) => setFormData({...formData, sterile: e.target.checked})}
                className="rounded"
              />
              <Label htmlFor="sterile">Estéril</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="controlled"
                checked={formData.controlled}
                onChange={(e) => setFormData({...formData, controlled: e.target.checked})}
                className="rounded"
              />
              <Label htmlFor="controlled">Controlado</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoReorder"
                checked={formData.autoReorder}
                onChange={(e) => setFormData({...formData, autoReorder: e.target.checked})}
                className="rounded"
              />
              <Label htmlFor="autoReorder">Reposição Automática</Label>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Suprimentos</h1>
          <p className="text-gray-600 mt-1">
            Controle de materiais, consumíveis e insumos hospitalares
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
                Novo Suprimento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Suprimento</DialogTitle>
                <DialogDescription>
                  Preencha as informações do suprimento para adicionar ao inventário
                </DialogDescription>
              </DialogHeader>
              <SupplyForm onClose={() => setIsAddDialogOpen(false)} />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setIsAddDialogOpen(false)}>
                  Salvar Suprimento
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Itens</p>
                <p className="text-2xl font-bold">{suppliesData.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Estoque Normal</p>
                <p className="text-2xl font-bold text-green-600">
                  {suppliesData.filter(s => s.status === 'Normal').length}
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
                <p className="text-sm text-gray-600">Estoque Baixo</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {suppliesData.filter(s => s.status === 'Baixo').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Estoque Crítico</p>
                <p className="text-2xl font-bold text-red-600">
                  {suppliesData.filter(s => s.status === 'Crítico').length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vencendo</p>
                <p className="text-2xl font-bold text-orange-600">
                  {suppliesData.filter(s => getDaysUntilExpiration(s.expirationDate) <= 30).length}
                </p>
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
                <p className="text-2xl font-bold">R$ {suppliesData.reduce((sum, s) => sum + s.totalValue, 0).toLocaleString()}</p>
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
                  placeholder="Buscar suprimentos..."
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
            <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Fornecedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Fornecedores</SelectItem>
                {suppliers.map(supplier => (
                  <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="Normal">Normal</SelectItem>
                <SelectItem value="Baixo">Baixo</SelectItem>
                <SelectItem value="Crítico">Crítico</SelectItem>
                <SelectItem value="Vencido">Vencido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Conteúdo */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Lista de Suprimentos</TabsTrigger>
          <TabsTrigger value="categories">Por Categoria</TabsTrigger>
          <TabsTrigger value="expiration">Validade</TabsTrigger>
          <TabsTrigger value="movements">Movimentações</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Suprimentos ({filteredSupplies.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Suprimento</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Estoque</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Validade</TableHead>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSupplies.map((supply) => {
                      const stockPercentage = getStockPercentage(supply.currentStock, supply.maxStock)
                      const daysUntilExpiration = getDaysUntilExpiration(supply.expirationDate)
                      return (
                        <TableRow key={supply.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{supply.name}</p>
                              <p className="text-sm text-gray-600">{supply.description}</p>
                              <p className="text-xs text-gray-500">
                                {supply.brand} • {supply.model} • {supply.unit}
                              </p>
                              <div className="flex gap-1 mt-1">
                                {supply.sterile && (
                                  <Badge variant="outline" className="text-xs">Estéril</Badge>
                                )}
                                {supply.controlled && (
                                  <Badge variant="destructive" className="text-xs">Controlado</Badge>
                                )}
                                {supply.autoReorder && (
                                  <Badge variant="secondary" className="text-xs">Auto-Reposição</Badge>
                                )}
                                <Badge className={`text-xs ${getCriticalityColor(supply.criticality)}`} variant="outline">
                                  {supply.criticality}
                                </Badge>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <Badge variant="secondary">{supply.category}</Badge>
                              <p className="text-xs text-gray-600 mt-1">{supply.subcategory}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {supply.currentStock} / {supply.maxStock}
                              </p>
                              <Progress value={stockPercentage} className="h-1 mt-1" />
                              <p className="text-xs text-gray-600 mt-1">
                                Min: {supply.minStock} • Reposição: {supply.reorderPoint}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(supply.status)}>
                              {supply.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">{supply.expirationDate}</p>
                              <p className={`text-xs ${
                                daysUntilExpiration <= 30 ? 'text-red-600' :
                                daysUntilExpiration <= 90 ? 'text-yellow-600' : 'text-green-600'
                              }`}>
                                {daysUntilExpiration > 0 ? `${daysUntilExpiration} dias` : 'Vencido'}
                              </p>
                              <p className="text-xs text-gray-500">Lote: {supply.batchNumber}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium">{supply.supplier}</p>
                              <p className="text-xs text-gray-600">{supply.supplierCode}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">R$ {supply.totalValue.toLocaleString()}</p>
                              <p className="text-xs text-gray-600">
                                Unit: R$ {supply.unitCost.toFixed(2)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedSupply(supply)
                                  setIsEditDialogOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <ShoppingCart className="h-4 w-4" />
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

        <TabsContent value="categories">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(category => {
              const categorySupplies = suppliesData.filter(s => s.category === category)
              const lowStockCount = categorySupplies.filter(s => s.status === 'Baixo' || s.status === 'Crítico').length
              const totalValue = categorySupplies.reduce((sum, s) => sum + s.totalValue, 0)
              
              return (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Boxes className="h-5 w-5" />
                      {category}
                    </CardTitle>
                    <CardDescription>{categorySupplies.length} itens</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Estoque Baixo:</span>
                        <span className={`font-medium ${lowStockCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {lowStockCount}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Valor Total:</span>
                        <span className="font-medium">R$ {totalValue.toLocaleString()}</span>
                      </div>
                      <div className="mt-3">
                        <h4 className="text-sm font-medium mb-2">Principais Itens:</h4>
                        <div className="space-y-1">
                          {categorySupplies.slice(0, 3).map(supply => (
                            <div key={supply.id} className="text-xs text-gray-600 flex justify-between">
                              <span>{supply.name}</span>
                              <Badge className={getStatusColor(supply.status)} variant="outline">
                                {supply.status}
                              </Badge>
                            </div>
                          ))}
                          {categorySupplies.length > 3 && (
                            <p className="text-xs text-gray-500">+{categorySupplies.length - 3} mais...</p>
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

        <TabsContent value="expiration">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Vencendo em 30 dias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {suppliesData.filter(s => {
                    const days = getDaysUntilExpiration(s.expirationDate)
                    return days <= 30 && days > 0
                  }).map(supply => {
                    const days = getDaysUntilExpiration(supply.expirationDate)
                    return (
                      <div key={supply.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{supply.name}</p>
                          <p className="text-xs text-gray-600">{supply.location}</p>
                          <p className="text-xs text-red-600">{days} dias restantes</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{supply.currentStock} {supply.unit}</p>
                          <p className="text-xs text-gray-600">Lote: {supply.batchNumber}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  Vencendo em 90 dias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {suppliesData.filter(s => {
                    const days = getDaysUntilExpiration(s.expirationDate)
                    return days <= 90 && days > 30
                  }).map(supply => {
                    const days = getDaysUntilExpiration(supply.expirationDate)
                    return (
                      <div key={supply.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{supply.name}</p>
                          <p className="text-xs text-gray-600">{supply.location}</p>
                          <p className="text-xs text-yellow-600">{days} dias restantes</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{supply.currentStock} {supply.unit}</p>
                          <p className="text-xs text-gray-600">Lote: {supply.batchNumber}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="movements">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                Movimentações Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {suppliesData.map(supply => (
                  <div key={supply.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        supply.movementType === 'Entrada' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {supply.movementType === 'Entrada' ? (
                          <TrendingUp className={`h-4 w-4 ${
                            supply.movementType === 'Entrada' ? 'text-green-600' : 'text-red-600'
                          }`} />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{supply.name}</p>
                        <p className="text-xs text-gray-600">
                          {supply.movementType} • {supply.lastMovement}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium text-sm ${
                        supply.movementType === 'Entrada' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {supply.movementType === 'Entrada' ? '+' : '-'}{supply.movementQuantity}
                      </p>
                      <p className="text-xs text-gray-600">Estoque: {supply.currentStock}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Editar Suprimento</DialogTitle>
            <DialogDescription>
              Atualize as informações do suprimento
            </DialogDescription>
          </DialogHeader>
          {selectedSupply && (
            <SupplyForm 
              supply={selectedSupply} 
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