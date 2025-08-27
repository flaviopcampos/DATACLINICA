'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  Trash2,
  Eye,
  Package,
  AlertTriangle,
  Calendar,
  MapPin,
  Barcode,
  Grid3X3,
  List,
  RefreshCw
} from 'lucide-react'

interface Supply {
  id: string
  name: string
  description: string
  category: string
  subcategory: string
  brand: string
  model?: string
  partNumber?: string
  barcode?: string
  currentStock: number
  minStock: number
  maxStock: number
  unitCost: number
  totalValue: number
  unit: string
  location: string
  shelf?: string
  expiryDate?: string
  batchNumber?: string
  supplier: string
  lastRestocked: string
  isDisposable: boolean
  isSterile: boolean
  requiresRefrigeration: boolean
  status: 'available' | 'low_stock' | 'out_of_stock' | 'expired' | 'recalled'
  criticality: 'low' | 'medium' | 'high' | 'critical'
  usageRate: number // unidades por mês
  lastUpdated: string
}

interface SupplyListProps {
  supplies?: Supply[]
  onAdd?: () => void
  onEdit?: (supply: Supply) => void
  onDelete?: (supplyId: string) => void
  onView?: (supply: Supply) => void
  onUpdateStock?: (supplyId: string, newStock: number) => void
  className?: string
}

// Mock data para demonstração
const mockSupplies: Supply[] = [
  {
    id: '1',
    name: 'Luvas Descartáveis Nitrilo',
    description: 'Luvas descartáveis de nitrilo, sem pó, tamanho M',
    category: 'EPI',
    subcategory: 'Luvas',
    brand: 'MedGlove',
    model: 'Nitrilo Pro',
    partNumber: 'MG-NIT-M-100',
    barcode: '7891234567890',
    currentStock: 150,
    minStock: 50,
    maxStock: 500,
    unitCost: 0.85,
    totalValue: 127.50,
    unit: 'unidade',
    location: 'Almoxarifado Central',
    shelf: 'A-15-B',
    expiryDate: '2025-12-31',
    batchNumber: 'LT2024001',
    supplier: 'Suprimentos Médicos SA',
    lastRestocked: '2024-01-15',
    isDisposable: true,
    isSterile: false,
    requiresRefrigeration: false,
    status: 'available',
    criticality: 'high',
    usageRate: 200,
    lastUpdated: '2024-01-20T10:30:00Z'
  },
  {
    id: '2',
    name: 'Seringas Descartáveis 10ml',
    description: 'Seringas descartáveis estéreis com agulha 21G',
    category: 'Material de Consumo',
    subcategory: 'Seringas',
    brand: 'SyringeMax',
    model: 'Sterile 10ml',
    partNumber: 'SM-10ML-21G',
    barcode: '7891234567891',
    currentStock: 25,
    minStock: 100,
    maxStock: 1000,
    unitCost: 1.20,
    totalValue: 30.00,
    unit: 'unidade',
    location: 'Farmácia Central',
    shelf: 'B-08-C',
    expiryDate: '2026-06-30',
    batchNumber: 'SR2024002',
    supplier: 'MedEquip Equipamentos',
    lastRestocked: '2024-01-10',
    isDisposable: true,
    isSterile: true,
    requiresRefrigeration: false,
    status: 'low_stock',
    criticality: 'critical',
    usageRate: 150,
    lastUpdated: '2024-01-20T14:15:00Z'
  },
  {
    id: '3',
    name: 'Gaze Estéril 7.5x7.5cm',
    description: 'Compressa de gaze estéril para curativos',
    category: 'Material de Consumo',
    subcategory: 'Curativos',
    brand: 'GazeMed',
    model: 'Sterile Compress',
    partNumber: 'GM-75x75-ST',
    barcode: '7891234567892',
    currentStock: 0,
    minStock: 200,
    maxStock: 2000,
    unitCost: 0.45,
    totalValue: 0.00,
    unit: 'unidade',
    location: 'Centro Cirúrgico',
    shelf: 'C-12-A',
    expiryDate: '2025-09-30',
    batchNumber: 'GZ2024003',
    supplier: 'BioSupply Distribuidora',
    lastRestocked: '2023-12-20',
    isDisposable: true,
    isSterile: true,
    requiresRefrigeration: false,
    status: 'out_of_stock',
    criticality: 'critical',
    usageRate: 300,
    lastUpdated: '2024-01-20T16:45:00Z'
  }
]

function SupplyList({ 
  supplies = mockSupplies, 
  onAdd, 
  onEdit, 
  onDelete, 
  onView, 
  onUpdateStock,
  className = '' 
}: SupplyListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [criticalityFilter, setCriticalityFilter] = useState('')
  const [selectedSupplies, setSelectedSupplies] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')

  // Filtrar suprimentos
  const filteredSupplies = supplies.filter(supply => {
    const matchesSearch = supply.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supply.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supply.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supply.partNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supply.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = !categoryFilter || supply.category === categoryFilter
    const matchesStatus = !statusFilter || supply.status === statusFilter
    const matchesCriticality = !criticalityFilter || supply.criticality === criticalityFilter
    
    return matchesSearch && matchesCategory && matchesStatus && matchesCriticality
  })

  // Obter categorias únicas
  const categories = Array.from(new Set(supplies.map(supply => supply.category)))

  // Funções auxiliares
  const getStatusColor = (status: Supply['status']) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800'
      case 'out_of_stock':
        return 'bg-red-100 text-red-800'
      case 'expired':
        return 'bg-purple-100 text-purple-800'
      case 'recalled':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCriticalityColor = (criticality: Supply['criticality']) => {
    switch (criticality) {
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: Supply['status']) => {
    switch (status) {
      case 'available':
        return 'Disponível'
      case 'low_stock':
        return 'Estoque Baixo'
      case 'out_of_stock':
        return 'Sem Estoque'
      case 'expired':
        return 'Vencido'
      case 'recalled':
        return 'Recolhido'
      default:
        return status
    }
  }

  const getCriticalityLabel = (criticality: Supply['criticality']) => {
    switch (criticality) {
      case 'critical':
        return 'Crítico'
      case 'high':
        return 'Alto'
      case 'medium':
        return 'Médio'
      case 'low':
        return 'Baixo'
      default:
        return criticality
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSupplies(filteredSupplies.map(supply => supply.id))
    } else {
      setSelectedSupplies([])
    }
  }

  const handleSelectSupply = (supplyId: string, checked: boolean) => {
    if (checked) {
      setSelectedSupplies([...selectedSupplies, supplyId])
    } else {
      setSelectedSupplies(selectedSupplies.filter(id => id !== supplyId))
    }
  }

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const today = new Date()
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 30 && diffDays > 0
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Suprimentos Médicos</h2>
          <p className="text-muted-foreground">
            {filteredSupplies.length} de {supplies.length} suprimentos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={onAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Suprimento
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, descrição, marca, código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="available">Disponível</SelectItem>
                  <SelectItem value="low_stock">Estoque Baixo</SelectItem>
                  <SelectItem value="out_of_stock">Sem Estoque</SelectItem>
                  <SelectItem value="expired">Vencido</SelectItem>
                  <SelectItem value="recalled">Recolhido</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={criticalityFilter} onValueChange={setCriticalityFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Criticidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  <SelectItem value="critical">Crítico</SelectItem>
                  <SelectItem value="high">Alto</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="low">Baixo</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="rounded-r-none"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                  className="rounded-l-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedSupplies.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedSupplies.length} suprimento(s) selecionado(s)
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Selecionados
                </Button>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar Estoque
                </Button>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Selecionados
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content */}
      {viewMode === 'table' ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="p-4 w-12">
                      <Checkbox
                        checked={selectedSupplies.length === filteredSupplies.length && filteredSupplies.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="p-4 font-medium">Suprimento</th>
                    <th className="p-4 font-medium">Categoria</th>
                    <th className="p-4 font-medium">Estoque</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Criticidade</th>
                    <th className="p-4 font-medium">Localização</th>
                    <th className="p-4 font-medium">Validade</th>
                    <th className="p-4 font-medium">Valor</th>
                    <th className="p-4 font-medium w-32">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSupplies.map((supply) => (
                    <tr key={supply.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <Checkbox
                          checked={selectedSupplies.includes(supply.id)}
                          onCheckedChange={(checked) => handleSelectSupply(supply.id, checked as boolean)}
                        />
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="font-medium">{supply.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {supply.brand} {supply.model && `- ${supply.model}`}
                          </div>
                          {supply.partNumber && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Barcode className="h-3 w-3" />
                              {supply.partNumber}
                            </div>
                          )}
                          <div className="flex gap-2 mt-1">
                            {supply.isDisposable && (
                              <Badge variant="outline" className="text-xs">Descartável</Badge>
                            )}
                            {supply.isSterile && (
                              <Badge variant="outline" className="text-xs">Estéril</Badge>
                            )}
                            {supply.requiresRefrigeration && (
                              <Badge variant="outline" className="text-xs">Refrigeração</Badge>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{supply.category}</div>
                          <div className="text-sm text-muted-foreground">{supply.subcategory}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="font-medium">
                            {supply.currentStock} {supply.unit}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Min: {supply.minStock} | Max: {supply.maxStock}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                supply.currentStock <= supply.minStock 
                                  ? 'bg-red-500' 
                                  : supply.currentStock <= supply.minStock * 1.5 
                                    ? 'bg-yellow-500' 
                                    : 'bg-green-500'
                              }`}
                              style={{ 
                                width: `${Math.min((supply.currentStock / supply.maxStock) * 100, 100)}%` 
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={getStatusColor(supply.status)}>
                          {getStatusLabel(supply.status)}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge className={getCriticalityColor(supply.criticality)}>
                          {getCriticalityLabel(supply.criticality)}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3" />
                            {supply.location}
                          </div>
                          {supply.shelf && (
                            <div className="text-xs text-muted-foreground">
                              Prateleira: {supply.shelf}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        {supply.expiryDate ? (
                          <div className="space-y-1">
                            <div className={`text-sm ${
                              isExpiringSoon(supply.expiryDate) ? 'text-orange-600 font-medium' : ''
                            }`}>
                              {new Date(supply.expiryDate).toLocaleDateString('pt-BR')}
                            </div>
                            {isExpiringSoon(supply.expiryDate) && (
                              <div className="flex items-center gap-1 text-xs text-orange-600">
                                <AlertTriangle className="h-3 w-3" />
                                Vencendo
                              </div>
                            )}
                            {supply.batchNumber && (
                              <div className="text-xs text-muted-foreground">
                                Lote: {supply.batchNumber}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">N/A</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="font-medium">
                            R$ {supply.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Unit: R$ {supply.unitCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => onView?.(supply)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => onEdit?.(supply)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => onDelete?.(supply.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSupplies.map((supply) => (
            <Card key={supply.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{supply.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {supply.brand} {supply.model && `- ${supply.model}`}
                    </p>
                  </div>
                  <Checkbox
                    checked={selectedSupplies.includes(supply.id)}
                    onCheckedChange={(checked) => handleSelectSupply(supply.id, checked as boolean)}
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge className={getStatusColor(supply.status)}>
                    {getStatusLabel(supply.status)}
                  </Badge>
                  <Badge className={getCriticalityColor(supply.criticality)}>
                    {getCriticalityLabel(supply.criticality)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Categoria:</span>
                    <div className="font-medium">{supply.category}</div>
                    <div className="text-xs text-muted-foreground">{supply.subcategory}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Estoque:</span>
                    <div className="font-medium">
                      {supply.currentStock} {supply.unit}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Min: {supply.minStock}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Nível do Estoque</span>
                    <span className="text-xs">
                      {Math.round((supply.currentStock / supply.maxStock) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        supply.currentStock <= supply.minStock 
                          ? 'bg-red-500' 
                          : supply.currentStock <= supply.minStock * 1.5 
                            ? 'bg-yellow-500' 
                            : 'bg-green-500'
                      }`}
                      style={{ 
                        width: `${Math.min((supply.currentStock / supply.maxStock) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Localização:</span>
                    <div className="font-medium flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {supply.location}
                    </div>
                    {supply.shelf && (
                      <div className="text-xs text-muted-foreground">
                        {supply.shelf}
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Valor Total:</span>
                    <div className="font-medium">
                      R$ {supply.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      R$ {supply.unitCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/un
                    </div>
                  </div>
                </div>
                
                {supply.expiryDate && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Validade:</span>
                    <div className={`font-medium flex items-center gap-1 ${
                      isExpiringSoon(supply.expiryDate) ? 'text-orange-600' : ''
                    }`}>
                      <Calendar className="h-3 w-3" />
                      {new Date(supply.expiryDate).toLocaleDateString('pt-BR')}
                      {isExpiringSoon(supply.expiryDate) && (
                        <AlertTriangle className="h-3 w-3" />
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2 mt-4">
                  {supply.isDisposable && (
                    <Badge variant="outline" className="text-xs">Descartável</Badge>
                  )}
                  {supply.isSterile && (
                    <Badge variant="outline" className="text-xs">Estéril</Badge>
                  )}
                  {supply.requiresRefrigeration && (
                    <Badge variant="outline" className="text-xs">Refrigeração</Badge>
                  )}
                </div>
                
                <div className="flex justify-between pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onView?.(supply)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                  <div className="flex gap-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onEdit?.(supply)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onDelete?.(supply.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredSupplies.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum suprimento encontrado</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm || categoryFilter || statusFilter || criticalityFilter
                ? 'Tente ajustar os filtros para encontrar suprimentos.'
                : 'Comece adicionando suprimentos ao seu inventário.'}
            </p>
            {onAdd && (
              <Button onClick={onAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Suprimento
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default SupplyList