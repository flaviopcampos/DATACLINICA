'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { 
  Save, 
  X, 
  Package, 
  Settings, 
  Pill, 
  Calendar, 
  MapPin, 
  User, 
  DollarSign, 
  Truck, 
  AlertTriangle, 
  Shield, 
  Thermometer, 
  Droplets, 
  Barcode, 
  FileText, 
  Plus, 
  Minus, 
  Upload, 
  Camera, 
  QrCode
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

type ItemType = 'medication' | 'equipment' | 'supply'
type Criticality = 'low' | 'medium' | 'high' | 'critical'
type Status = 'active' | 'inactive' | 'discontinued'
type StorageCondition = 'room_temperature' | 'refrigerated' | 'frozen' | 'controlled'

interface InventoryItem {
  id?: string
  itemId?: string
  name: string
  description?: string
  type: ItemType
  category: string
  subcategory?: string
  brand?: string
  model?: string
  manufacturer?: string
  serialNumber?: string
  barcode?: string
  
  // Stock information
  currentStock: number
  minimumStock: number
  maximumStock: number
  reorderPoint: number
  unit: string
  
  // Location
  location: string
  department: string
  shelf?: string
  bin?: string
  
  // Financial
  unitCost: number
  totalValue?: number
  supplier?: string
  
  // Dates
  acquisitionDate?: Date
  expirationDate?: Date
  warrantyDate?: Date
  lastMaintenanceDate?: Date
  nextMaintenanceDate?: Date
  lastCalibrationDate?: Date
  nextCalibrationDate?: Date
  
  // Batch/Lot
  batchNumber?: string
  lotNumber?: string
  
  // Settings
  criticality: Criticality
  autoReorder: boolean
  leadTime: number
  status: Status
  
  // Storage conditions
  storageCondition?: StorageCondition
  temperatureMin?: number
  temperatureMax?: number
  humidityMin?: number
  humidityMax?: number
  
  // Medical specific
  activeIngredient?: string
  concentration?: string
  dosageForm?: string
  therapeuticClass?: string
  prescriptionRequired?: boolean
  controlledSubstance?: boolean
  
  // Equipment specific
  equipmentClass?: string
  riskClass?: 'I' | 'II' | 'III' | 'IV'
  certification?: string
  operationalStatus?: 'operational' | 'maintenance' | 'calibration' | 'out_of_service'
  responsible?: string
  
  // Supply specific
  sterile?: boolean
  singleUse?: boolean
  
  // Additional
  notes?: string
  specifications?: string
  attachments?: string[]
  
  createdAt?: Date
  updatedAt?: Date
  createdBy?: string
  updatedBy?: string
}

interface InventoryFormProps {
  item?: InventoryItem
  onSave: (item: InventoryItem) => void
  onCancel: () => void
  loading?: boolean
  mode?: 'create' | 'edit' | 'view'
}

const itemTypes = [
  { value: 'medication', label: 'Medicamento', icon: Pill },
  { value: 'equipment', label: 'Equipamento', icon: Settings },
  { value: 'supply', label: 'Suprimento', icon: Package }
]

const categories = {
  medication: [
    'Analgésico', 'Antibiótico', 'Anti-inflamatório', 'Antialérgico', 'Cardiovascular',
    'Neurológico', 'Endócrino', 'Gastrointestinal', 'Respiratório', 'Dermatológico',
    'Oftalmológico', 'Otorrinolaringológico', 'Urológico', 'Ginecológico', 'Pediátrico',
    'Geriátrico', 'Oncológico', 'Psiquiátrico', 'Anestésico', 'Contraste', 'Vacina', 'Soro'
  ],
  equipment: [
    'Diagnóstico', 'Monitoramento', 'Terapêutico', 'Cirúrgico', 'Laboratorial',
    'Radiológico', 'Ultrassom', 'Endoscópico', 'Anestésico', 'Ventilação',
    'Hemodiálise', 'Fisioterapia', 'Odontológico', 'Oftalmológico', 'Cardiológico',
    'Neurológico', 'Ortopédico', 'Ginecológico', 'Pediátrico', 'UTI', 'Emergência'
  ],
  supply: [
    'Material Médico', 'Curativo', 'EPI', 'Descartável', 'Esterilização',
    'Laboratório', 'Radiologia', 'Farmácia', 'Limpeza', 'Escritório',
    'Manutenção', 'Nutrição', 'Lavanderia', 'Segurança', 'Informática'
  ]
}

const departments = [
  'Emergência', 'UTI', 'Centro Cirúrgico', 'Internação', 'Ambulatório',
  'Laboratório', 'Radiologia', 'Farmácia', 'Fisioterapia', 'Nutrição',
  'Lavanderia', 'Manutenção', 'Administração', 'Almoxarifado', 'Recepção'
]

const units = [
  'unidade', 'caixa', 'pacote', 'frasco', 'ampola', 'comprimido', 'cápsula',
  'ml', 'litro', 'grama', 'kg', 'metro', 'par', 'conjunto', 'kit'
]

const suppliers = [
  'Roche', 'Pfizer', 'Novartis', 'Bayer', 'Sanofi', 'GSK', 'Merck',
  'Johnson & Johnson', 'Abbott', 'Medtronic', 'GE Healthcare', 'Philips',
  'Siemens', 'BD', 'Baxter', 'Fresenius', 'B.Braun', 'Cremer',
  'Eurofarma', 'EMS', 'Hypera', 'Cristália', 'Biolab', 'Aché'
]

export default function InventoryForm({
  item,
  onSave,
  onCancel,
  loading = false,
  mode = 'create'
}: InventoryFormProps) {
  const [formData, setFormData] = useState<InventoryItem>({
    name: '',
    type: 'supply',
    category: '',
    currentStock: 0,
    minimumStock: 0,
    maximumStock: 0,
    reorderPoint: 0,
    unit: 'unidade',
    location: '',
    department: '',
    unitCost: 0,
    criticality: 'medium',
    autoReorder: false,
    leadTime: 7,
    status: 'active',
    ...item
  })

  const [activeTab, setActiveTab] = useState('basic')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isReadOnly = mode === 'view'

  useEffect(() => {
    if (item) {
      setFormData({ ...formData, ...item })
    }
  }, [item])

  const handleInputChange = (field: keyof InventoryItem, value: any) => {
    if (isReadOnly) return
    
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }
    
    if (!formData.category.trim()) {
      newErrors.category = 'Categoria é obrigatória'
    }
    
    if (!formData.department.trim()) {
      newErrors.department = 'Departamento é obrigatório'
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Localização é obrigatória'
    }
    
    if (formData.minimumStock < 0) {
      newErrors.minimumStock = 'Estoque mínimo deve ser maior ou igual a 0'
    }
    
    if (formData.maximumStock <= formData.minimumStock) {
      newErrors.maximumStock = 'Estoque máximo deve ser maior que o mínimo'
    }
    
    if (formData.reorderPoint < formData.minimumStock) {
      newErrors.reorderPoint = 'Ponto de reposição deve ser maior ou igual ao estoque mínimo'
    }
    
    if (formData.unitCost < 0) {
      newErrors.unitCost = 'Custo unitário deve ser maior ou igual a 0'
    }
    
    if (formData.leadTime < 1) {
      newErrors.leadTime = 'Lead time deve ser maior que 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    // Calculate total value
    const itemWithTotal = {
      ...formData,
      totalValue: formData.currentStock * formData.unitCost,
      updatedAt: new Date()
    }

    onSave(itemWithTotal)
  }

  const tabs = [
    { id: 'basic', label: 'Básico', icon: Package },
    { id: 'stock', label: 'Estoque', icon: Package },
    { id: 'location', label: 'Localização', icon: MapPin },
    { id: 'financial', label: 'Financeiro', icon: DollarSign },
    { id: 'dates', label: 'Datas', icon: Calendar },
    { id: 'conditions', label: 'Armazenamento', icon: Thermometer },
    { id: 'additional', label: 'Adicional', icon: FileText }
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {mode === 'create' ? 'Novo Item' : mode === 'edit' ? 'Editar Item' : 'Visualizar Item'}
          </h2>
          <p className="text-muted-foreground">
            {mode === 'create' ? 'Adicione um novo item ao inventário' : 
             mode === 'edit' ? 'Edite as informações do item' : 
             'Visualize as informações do item'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          {!isReadOnly && (
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors",
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Basic Information */}
        {activeTab === 'basic' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Nome do item"
                    disabled={isReadOnly}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="itemId">Código do Item</Label>
                  <Input
                    id="itemId"
                    value={formData.itemId || ''}
                    onChange={(e) => handleInputChange('itemId', e.target.value)}
                    placeholder="Código único"
                    disabled={isReadOnly}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descrição detalhada do item"
                  disabled={isReadOnly}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo *</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value as ItemType)}
                    disabled={isReadOnly}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    {itemTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    disabled={isReadOnly}
                    className={cn(
                      "w-full px-3 py-2 border border-input bg-background rounded-md text-sm",
                      errors.category ? 'border-red-500' : ''
                    )}
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories[formData.type]?.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subcategory">Subcategoria</Label>
                  <Input
                    id="subcategory"
                    value={formData.subcategory || ''}
                    onChange={(e) => handleInputChange('subcategory', e.target.value)}
                    placeholder="Subcategoria"
                    disabled={isReadOnly}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Marca</Label>
                  <Input
                    id="brand"
                    value={formData.brand || ''}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    placeholder="Marca do produto"
                    disabled={isReadOnly}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="model">Modelo</Label>
                  <Input
                    id="model"
                    value={formData.model || ''}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                    placeholder="Modelo do produto"
                    disabled={isReadOnly}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Fabricante</Label>
                  <Input
                    id="manufacturer"
                    value={formData.manufacturer || ''}
                    onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                    placeholder="Fabricante"
                    disabled={isReadOnly}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serialNumber">Número de Série</Label>
                  <Input
                    id="serialNumber"
                    value={formData.serialNumber || ''}
                    onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                    placeholder="Número de série"
                    disabled={isReadOnly}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="barcode">Código de Barras</Label>
                  <div className="flex gap-2">
                    <Input
                      id="barcode"
                      value={formData.barcode || ''}
                      onChange={(e) => handleInputChange('barcode', e.target.value)}
                      placeholder="Código de barras"
                      disabled={isReadOnly}
                    />
                    {!isReadOnly && (
                      <Button type="button" variant="outline" size="sm">
                        <QrCode className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="criticality">Criticidade</Label>
                  <select
                    id="criticality"
                    value={formData.criticality}
                    onChange={(e) => handleInputChange('criticality', e.target.value as Criticality)}
                    disabled={isReadOnly}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                    <option value="critical">Crítica</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value as Status)}
                    disabled={isReadOnly}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                    <option value="discontinued">Descontinuado</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stock Information */}
        {activeTab === 'stock' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Informações de Estoque
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentStock">Estoque Atual</Label>
                  <Input
                    id="currentStock"
                    type="number"
                    value={formData.currentStock}
                    onChange={(e) => handleInputChange('currentStock', Number(e.target.value))}
                    placeholder="0"
                    disabled={isReadOnly}
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="unit">Unidade</Label>
                  <select
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => handleInputChange('unit', e.target.value)}
                    disabled={isReadOnly}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    {units.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minimumStock">Estoque Mínimo *</Label>
                  <Input
                    id="minimumStock"
                    type="number"
                    value={formData.minimumStock}
                    onChange={(e) => handleInputChange('minimumStock', Number(e.target.value))}
                    placeholder="0"
                    disabled={isReadOnly}
                    min="0"
                    step="0.01"
                    className={errors.minimumStock ? 'border-red-500' : ''}
                  />
                  {errors.minimumStock && <p className="text-sm text-red-500">{errors.minimumStock}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maximumStock">Estoque Máximo *</Label>
                  <Input
                    id="maximumStock"
                    type="number"
                    value={formData.maximumStock}
                    onChange={(e) => handleInputChange('maximumStock', Number(e.target.value))}
                    placeholder="0"
                    disabled={isReadOnly}
                    min="0"
                    step="0.01"
                    className={errors.maximumStock ? 'border-red-500' : ''}
                  />
                  {errors.maximumStock && <p className="text-sm text-red-500">{errors.maximumStock}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reorderPoint">Ponto de Reposição *</Label>
                  <Input
                    id="reorderPoint"
                    type="number"
                    value={formData.reorderPoint}
                    onChange={(e) => handleInputChange('reorderPoint', Number(e.target.value))}
                    placeholder="0"
                    disabled={isReadOnly}
                    min="0"
                    step="0.01"
                    className={errors.reorderPoint ? 'border-red-500' : ''}
                  />
                  {errors.reorderPoint && <p className="text-sm text-red-500">{errors.reorderPoint}</p>}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="batchNumber">Número do Lote</Label>
                  <Input
                    id="batchNumber"
                    value={formData.batchNumber || ''}
                    onChange={(e) => handleInputChange('batchNumber', e.target.value)}
                    placeholder="Número do lote"
                    disabled={isReadOnly}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lotNumber">Número do Lote (Alt)</Label>
                  <Input
                    id="lotNumber"
                    value={formData.lotNumber || ''}
                    onChange={(e) => handleInputChange('lotNumber', e.target.value)}
                    placeholder="Número alternativo do lote"
                    disabled={isReadOnly}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="autoReorder"
                  checked={formData.autoReorder}
                  onCheckedChange={(checked) => handleInputChange('autoReorder', checked)}
                  disabled={isReadOnly}
                />
                <Label htmlFor="autoReorder">Reposição Automática</Label>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="leadTime">Lead Time (dias) *</Label>
                <Input
                  id="leadTime"
                  type="number"
                  value={formData.leadTime}
                  onChange={(e) => handleInputChange('leadTime', Number(e.target.value))}
                  placeholder="7"
                  disabled={isReadOnly}
                  min="1"
                  className={errors.leadTime ? 'border-red-500' : ''}
                />
                {errors.leadTime && <p className="text-sm text-red-500">{errors.leadTime}</p>}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Location Information */}
        {activeTab === 'location' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Localização
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Departamento *</Label>
                  <select
                    id="department"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    disabled={isReadOnly}
                    className={cn(
                      "w-full px-3 py-2 border border-input bg-background rounded-md text-sm",
                      errors.department ? 'border-red-500' : ''
                    )}
                  >
                    <option value="">Selecione um departamento</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  {errors.department && <p className="text-sm text-red-500">{errors.department}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Localização *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Ex: Almoxarifado - Prateleira A1"
                    disabled={isReadOnly}
                    className={errors.location ? 'border-red-500' : ''}
                  />
                  {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shelf">Prateleira</Label>
                  <Input
                    id="shelf"
                    value={formData.shelf || ''}
                    onChange={(e) => handleInputChange('shelf', e.target.value)}
                    placeholder="Ex: A1, B2, C3"
                    disabled={isReadOnly}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bin">Compartimento</Label>
                  <Input
                    id="bin"
                    value={formData.bin || ''}
                    onChange={(e) => handleInputChange('bin', e.target.value)}
                    placeholder="Ex: 001, 002, 003"
                    disabled={isReadOnly}
                  />
                </div>
              </div>
              
              {formData.type === 'equipment' && (
                <div className="space-y-2">
                  <Label htmlFor="responsible">Responsável</Label>
                  <Input
                    id="responsible"
                    value={formData.responsible || ''}
                    onChange={(e) => handleInputChange('responsible', e.target.value)}
                    placeholder="Nome do responsável pelo equipamento"
                    disabled={isReadOnly}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Financial Information */}
        {activeTab === 'financial' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Informações Financeiras
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unitCost">Custo Unitário (R$) *</Label>
                  <Input
                    id="unitCost"
                    type="number"
                    value={formData.unitCost}
                    onChange={(e) => handleInputChange('unitCost', Number(e.target.value))}
                    placeholder="0.00"
                    disabled={isReadOnly}
                    min="0"
                    step="0.01"
                    className={errors.unitCost ? 'border-red-500' : ''}
                  />
                  {errors.unitCost && <p className="text-sm text-red-500">{errors.unitCost}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="totalValue">Valor Total (R$)</Label>
                  <Input
                    id="totalValue"
                    type="number"
                    value={(formData.currentStock * formData.unitCost).toFixed(2)}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Calculado automaticamente (Estoque × Custo Unitário)
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="supplier">Fornecedor</Label>
                <select
                  id="supplier"
                  value={formData.supplier || ''}
                  onChange={(e) => handleInputChange('supplier', e.target.value)}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="">Selecione um fornecedor</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier} value={supplier}>
                      {supplier}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dates */}
        {activeTab === 'dates' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Datas Importantes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="acquisitionDate">Data de Aquisição</Label>
                  <Input
                    id="acquisitionDate"
                    type="date"
                    value={formData.acquisitionDate ? format(formData.acquisitionDate, 'yyyy-MM-dd') : ''}
                    onChange={(e) => handleInputChange('acquisitionDate', e.target.value ? new Date(e.target.value) : undefined)}
                    disabled={isReadOnly}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expirationDate">Data de Validade</Label>
                  <Input
                    id="expirationDate"
                    type="date"
                    value={formData.expirationDate ? format(formData.expirationDate, 'yyyy-MM-dd') : ''}
                    onChange={(e) => handleInputChange('expirationDate', e.target.value ? new Date(e.target.value) : undefined)}
                    disabled={isReadOnly}
                  />
                </div>
              </div>
              
              {formData.type === 'equipment' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="warrantyDate">Data de Garantia</Label>
                      <Input
                        id="warrantyDate"
                        type="date"
                        value={formData.warrantyDate ? format(formData.warrantyDate, 'yyyy-MM-dd') : ''}
                        onChange={(e) => handleInputChange('warrantyDate', e.target.value ? new Date(e.target.value) : undefined)}
                        disabled={isReadOnly}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastMaintenanceDate">Última Manutenção</Label>
                      <Input
                        id="lastMaintenanceDate"
                        type="date"
                        value={formData.lastMaintenanceDate ? format(formData.lastMaintenanceDate, 'yyyy-MM-dd') : ''}
                        onChange={(e) => handleInputChange('lastMaintenanceDate', e.target.value ? new Date(e.target.value) : undefined)}
                        disabled={isReadOnly}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nextMaintenanceDate">Próxima Manutenção</Label>
                      <Input
                        id="nextMaintenanceDate"
                        type="date"
                        value={formData.nextMaintenanceDate ? format(formData.nextMaintenanceDate, 'yyyy-MM-dd') : ''}
                        onChange={(e) => handleInputChange('nextMaintenanceDate', e.target.value ? new Date(e.target.value) : undefined)}
                        disabled={isReadOnly}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastCalibrationDate">Última Calibração</Label>
                      <Input
                        id="lastCalibrationDate"
                        type="date"
                        value={formData.lastCalibrationDate ? format(formData.lastCalibrationDate, 'yyyy-MM-dd') : ''}
                        onChange={(e) => handleInputChange('lastCalibrationDate', e.target.value ? new Date(e.target.value) : undefined)}
                        disabled={isReadOnly}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nextCalibrationDate">Próxima Calibração</Label>
                    <Input
                      id="nextCalibrationDate"
                      type="date"
                      value={formData.nextCalibrationDate ? format(formData.nextCalibrationDate, 'yyyy-MM-dd') : ''}
                      onChange={(e) => handleInputChange('nextCalibrationDate', e.target.value ? new Date(e.target.value) : undefined)}
                      disabled={isReadOnly}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Storage Conditions */}
        {activeTab === 'conditions' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Thermometer className="h-5 w-5" />
                Condições de Armazenamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="storageCondition">Condição de Armazenamento</Label>
                <select
                  id="storageCondition"
                  value={formData.storageCondition || 'room_temperature'}
                  onChange={(e) => handleInputChange('storageCondition', e.target.value as StorageCondition)}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="room_temperature">Temperatura Ambiente</option>
                  <option value="refrigerated">Refrigerado (2-8°C)</option>
                  <option value="frozen">Congelado (-18°C)</option>
                  <option value="controlled">Controlada</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="temperatureMin">Temperatura Mínima (°C)</Label>
                  <Input
                    id="temperatureMin"
                    type="number"
                    value={formData.temperatureMin || ''}
                    onChange={(e) => handleInputChange('temperatureMin', e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Ex: 2"
                    disabled={isReadOnly}
                    step="0.1"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="temperatureMax">Temperatura Máxima (°C)</Label>
                  <Input
                    id="temperatureMax"
                    type="number"
                    value={formData.temperatureMax || ''}
                    onChange={(e) => handleInputChange('temperatureMax', e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Ex: 8"
                    disabled={isReadOnly}
                    step="0.1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="humidityMin">Umidade Mínima (%)</Label>
                  <Input
                    id="humidityMin"
                    type="number"
                    value={formData.humidityMin || ''}
                    onChange={(e) => handleInputChange('humidityMin', e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Ex: 30"
                    disabled={isReadOnly}
                    min="0"
                    max="100"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="humidityMax">Umidade Máxima (%)</Label>
                  <Input
                    id="humidityMax"
                    type="number"
                    value={formData.humidityMax || ''}
                    onChange={(e) => handleInputChange('humidityMax', e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Ex: 70"
                    disabled={isReadOnly}
                    min="0"
                    max="100"
                  />
                </div>
              </div>
              
              {formData.type === 'supply' && (
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="sterile"
                      checked={formData.sterile || false}
                      onCheckedChange={(checked) => handleInputChange('sterile', checked)}
                      disabled={isReadOnly}
                    />
                    <Label htmlFor="sterile">Item Estéril</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="singleUse"
                      checked={formData.singleUse || false}
                      onCheckedChange={(checked) => handleInputChange('singleUse', checked)}
                      disabled={isReadOnly}
                    />
                    <Label htmlFor="singleUse">Uso Único</Label>
                  </div>
                </div>
              )}
              
              {formData.type === 'medication' && (
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="prescriptionRequired"
                      checked={formData.prescriptionRequired || false}
                      onCheckedChange={(checked) => handleInputChange('prescriptionRequired', checked)}
                      disabled={isReadOnly}
                    />
                    <Label htmlFor="prescriptionRequired">Prescrição Obrigatória</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="controlledSubstance"
                      checked={formData.controlledSubstance || false}
                      onCheckedChange={(checked) => handleInputChange('controlledSubstance', checked)}
                      disabled={isReadOnly}
                    />
                    <Label htmlFor="controlledSubstance">Substância Controlada</Label>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Additional Information */}
        {activeTab === 'additional' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informações Adicionais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.type === 'medication' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="activeIngredient">Princípio Ativo</Label>
                      <Input
                        id="activeIngredient"
                        value={formData.activeIngredient || ''}
                        onChange={(e) => handleInputChange('activeIngredient', e.target.value)}
                        placeholder="Ex: Dipirona Sódica"
                        disabled={isReadOnly}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="concentration">Concentração</Label>
                      <Input
                        id="concentration"
                        value={formData.concentration || ''}
                        onChange={(e) => handleInputChange('concentration', e.target.value)}
                        placeholder="Ex: 500mg"
                        disabled={isReadOnly}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dosageForm">Forma Farmacêutica</Label>
                      <Input
                        id="dosageForm"
                        value={formData.dosageForm || ''}
                        onChange={(e) => handleInputChange('dosageForm', e.target.value)}
                        placeholder="Ex: Comprimido"
                        disabled={isReadOnly}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="therapeuticClass">Classe Terapêutica</Label>
                      <Input
                        id="therapeuticClass"
                        value={formData.therapeuticClass || ''}
                        onChange={(e) => handleInputChange('therapeuticClass', e.target.value)}
                        placeholder="Ex: Analgésico"
                        disabled={isReadOnly}
                      />
                    </div>
                  </div>
                </>
              )}
              
              {formData.type === 'equipment' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="equipmentClass">Classe do Equipamento</Label>
                      <Input
                        id="equipmentClass"
                        value={formData.equipmentClass || ''}
                        onChange={(e) => handleInputChange('equipmentClass', e.target.value)}
                        placeholder="Ex: Equipamento Médico"
                        disabled={isReadOnly}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="riskClass">Classe de Risco</Label>
                      <select
                        id="riskClass"
                        value={formData.riskClass || ''}
                        onChange={(e) => handleInputChange('riskClass', e.target.value)}
                        disabled={isReadOnly}
                        className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                      >
                        <option value="">Selecione a classe</option>
                        <option value="I">Classe I - Baixo Risco</option>
                        <option value="II">Classe II - Médio Risco</option>
                        <option value="III">Classe III - Alto Risco</option>
                        <option value="IV">Classe IV - Máximo Risco</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="certification">Certificação</Label>
                      <Input
                        id="certification"
                        value={formData.certification || ''}
                        onChange={(e) => handleInputChange('certification', e.target.value)}
                        placeholder="Ex: ANVISA, INMETRO"
                        disabled={isReadOnly}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="operationalStatus">Status Operacional</Label>
                      <select
                        id="operationalStatus"
                        value={formData.operationalStatus || 'operational'}
                        onChange={(e) => handleInputChange('operationalStatus', e.target.value)}
                        disabled={isReadOnly}
                        className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                      >
                        <option value="operational">Operacional</option>
                        <option value="maintenance">Em Manutenção</option>
                        <option value="calibration">Em Calibração</option>
                        <option value="out_of_service">Fora de Serviço</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="specifications">Especificações Técnicas</Label>
                <Textarea
                  id="specifications"
                  value={formData.specifications || ''}
                  onChange={(e) => handleInputChange('specifications', e.target.value)}
                  placeholder="Especificações técnicas detalhadas"
                  disabled={isReadOnly}
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Observações adicionais"
                  disabled={isReadOnly}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </form>
  )
}