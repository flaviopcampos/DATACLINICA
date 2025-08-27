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
  Pill,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Clock,
  Package,
  Barcode,
  FileText,
  Download,
  Upload,
  Eye,
  Calendar,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Activity
} from 'lucide-react'

// Mock data para demonstração
const medicationsData = [
  {
    id: 1,
    name: 'Paracetamol',
    genericName: 'Acetaminofeno',
    dosage: '500mg',
    form: 'Comprimido',
    manufacturer: 'Farmácia ABC',
    batch: 'PAR2024A',
    expiryDate: '2025-06-15',
    quantity: 150,
    minStock: 50,
    maxStock: 300,
    unitCost: 0.25,
    totalValue: 37.50,
    location: 'A1-B2',
    category: 'Analgésico',
    prescription: true,
    controlled: false,
    status: 'Ativo',
    lastMovement: '2024-01-15',
    supplier: 'Distribuidora Médica Ltda'
  },
  {
    id: 2,
    name: 'Dipirona',
    genericName: 'Metamizol',
    dosage: '500mg',
    form: 'Comprimido',
    manufacturer: 'Laboratório XYZ',
    batch: 'DIP2024B',
    expiryDate: '2024-03-20',
    quantity: 25,
    minStock: 50,
    maxStock: 200,
    unitCost: 0.18,
    totalValue: 4.50,
    location: 'A1-B3',
    category: 'Analgésico',
    prescription: false,
    controlled: false,
    status: 'Estoque Baixo',
    lastMovement: '2024-01-14',
    supplier: 'Farmácia Central'
  },
  {
    id: 3,
    name: 'Amoxicilina',
    genericName: 'Amoxicilina',
    dosage: '500mg',
    form: 'Cápsula',
    manufacturer: 'Antibióticos SA',
    batch: 'AMX2024C',
    expiryDate: '2024-02-10',
    quantity: 80,
    minStock: 30,
    maxStock: 150,
    unitCost: 0.45,
    totalValue: 36.00,
    location: 'B2-C1',
    category: 'Antibiótico',
    prescription: true,
    controlled: false,
    status: 'Vencendo',
    lastMovement: '2024-01-13',
    supplier: 'Medicamentos Brasil'
  },
  {
    id: 4,
    name: 'Morfina',
    genericName: 'Sulfato de Morfina',
    dosage: '10mg',
    form: 'Ampola',
    manufacturer: 'Controlados Ltda',
    batch: 'MOR2024D',
    expiryDate: '2025-12-31',
    quantity: 15,
    minStock: 10,
    maxStock: 50,
    unitCost: 12.50,
    totalValue: 187.50,
    location: 'COFRE-A1',
    category: 'Analgésico Opioide',
    prescription: true,
    controlled: true,
    status: 'Ativo',
    lastMovement: '2024-01-12',
    supplier: 'Farmácia Hospitalar'
  }
]

const categories = [
  'Analgésico',
  'Antibiótico',
  'Anti-inflamatório',
  'Antialérgico',
  'Cardiovascular',
  'Neurológico',
  'Gastrointestinal',
  'Respiratório',
  'Endócrino',
  'Dermatológico'
]

const forms = [
  'Comprimido',
  'Cápsula',
  'Xarope',
  'Suspensão',
  'Ampola',
  'Frasco',
  'Pomada',
  'Creme',
  'Gel',
  'Spray'
]

export default function MedicationsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedMedication, setSelectedMedication] = useState(null)
  const [activeTab, setActiveTab] = useState('list')

  const filteredMedications = medicationsData.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         med.genericName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || med.category === selectedCategory
    const matchesStatus = selectedStatus === 'all' || med.status === selectedStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'Ativo': return 'bg-green-100 text-green-800'
      case 'Estoque Baixo': return 'bg-red-100 text-red-800'
      case 'Vencendo': return 'bg-orange-100 text-orange-800'
      case 'Vencido': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStockLevel = (current, min, max) => {
    if (current <= min) return { level: 'Baixo', color: 'text-red-600', progress: 25 }
    if (current >= max) return { level: 'Alto', color: 'text-orange-600', progress: 100 }
    return { level: 'Normal', color: 'text-green-600', progress: (current / max) * 100 }
  }

  const MedicationForm = ({ medication, onClose }) => {
    const [formData, setFormData] = useState({
      name: medication?.name || '',
      genericName: medication?.genericName || '',
      dosage: medication?.dosage || '',
      form: medication?.form || '',
      manufacturer: medication?.manufacturer || '',
      category: medication?.category || '',
      quantity: medication?.quantity || '',
      minStock: medication?.minStock || '',
      maxStock: medication?.maxStock || '',
      unitCost: medication?.unitCost || '',
      location: medication?.location || '',
      batch: medication?.batch || '',
      expiryDate: medication?.expiryDate || '',
      supplier: medication?.supplier || '',
      prescription: medication?.prescription || false,
      controlled: medication?.controlled || false,
      description: medication?.description || ''
    })

    return (
      <div className="space-y-4 max-h-96 overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nome Comercial *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Ex: Paracetamol"
            />
          </div>
          <div>
            <Label htmlFor="genericName">Nome Genérico</Label>
            <Input
              id="genericName"
              value={formData.genericName}
              onChange={(e) => setFormData({...formData, genericName: e.target.value})}
              placeholder="Ex: Acetaminofeno"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="dosage">Dosagem *</Label>
            <Input
              id="dosage"
              value={formData.dosage}
              onChange={(e) => setFormData({...formData, dosage: e.target.value})}
              placeholder="Ex: 500mg"
            />
          </div>
          <div>
            <Label htmlFor="form">Forma Farmacêutica *</Label>
            <Select value={formData.form} onValueChange={(value) => setFormData({...formData, form: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {forms.map(form => (
                  <SelectItem key={form} value={form}>{form}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
        </div>

        <div className="grid grid-cols-2 gap-4">
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
            <Label htmlFor="supplier">Fornecedor</Label>
            <Input
              id="supplier"
              value={formData.supplier}
              onChange={(e) => setFormData({...formData, supplier: e.target.value})}
              placeholder="Nome do fornecedor"
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div>
            <Label htmlFor="quantity">Quantidade *</Label>
            <Input
              id="quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: e.target.value})}
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

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="batch">Lote</Label>
            <Input
              id="batch"
              value={formData.batch}
              onChange={(e) => setFormData({...formData, batch: e.target.value})}
              placeholder="Número do lote"
            />
          </div>
          <div>
            <Label htmlFor="expiryDate">Data de Validade</Label>
            <Input
              id="expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="location">Localização</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              placeholder="Ex: A1-B2"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="prescription"
              checked={formData.prescription}
              onChange={(e) => setFormData({...formData, prescription: e.target.checked})}
              className="rounded"
            />
            <Label htmlFor="prescription">Requer Prescrição</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="controlled"
              checked={formData.controlled}
              onChange={(e) => setFormData({...formData, controlled: e.target.checked})}
              className="rounded"
            />
            <Label htmlFor="controlled">Medicamento Controlado</Label>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Descrição/Observações</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Informações adicionais sobre o medicamento"
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
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Medicamentos</h1>
          <p className="text-gray-600 mt-1">
            Controle completo do estoque de medicamentos
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
                Novo Medicamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Medicamento</DialogTitle>
                <DialogDescription>
                  Preencha as informações do medicamento para adicionar ao estoque
                </DialogDescription>
              </DialogHeader>
              <MedicationForm onClose={() => setIsAddDialogOpen(false)} />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setIsAddDialogOpen(false)}>
                  Salvar Medicamento
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Medicamentos</p>
                <p className="text-2xl font-bold">{medicationsData.length}</p>
              </div>
              <Pill className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Estoque Baixo</p>
                <p className="text-2xl font-bold text-red-600">
                  {medicationsData.filter(m => m.status === 'Estoque Baixo').length}
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
                <p className="text-sm text-gray-600">Vencendo</p>
                <p className="text-2xl font-bold text-orange-600">
                  {medicationsData.filter(m => m.status === 'Vencendo').length}
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
                <p className="text-2xl font-bold">R$ {medicationsData.reduce((sum, m) => sum + m.totalValue, 0).toFixed(2)}</p>
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
                  placeholder="Buscar medicamentos..."
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
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Estoque Baixo">Estoque Baixo</SelectItem>
                <SelectItem value="Vencendo">Vencendo</SelectItem>
                <SelectItem value="Vencido">Vencido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Conteúdo */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Lista de Medicamentos</TabsTrigger>
          <TabsTrigger value="categories">Por Categoria</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Medicamentos ({filteredMedications.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medicamento</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Estoque</TableHead>
                      <TableHead>Validade</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMedications.map((medication) => {
                      const stockInfo = getStockLevel(medication.quantity, medication.minStock, medication.maxStock)
                      return (
                        <TableRow key={medication.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{medication.name}</p>
                              <p className="text-sm text-gray-600">
                                {medication.genericName} • {medication.dosage} • {medication.form}
                              </p>
                              <div className="flex gap-1 mt-1">
                                {medication.prescription && (
                                  <Badge variant="outline" className="text-xs">Prescrição</Badge>
                                )}
                                {medication.controlled && (
                                  <Badge variant="destructive" className="text-xs">Controlado</Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{medication.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className={`font-medium ${stockInfo.color}`}>
                                {medication.quantity} unidades
                              </p>
                              <Progress value={stockInfo.progress} className="h-1 mt-1" />
                              <p className="text-xs text-gray-600 mt-1">
                                Min: {medication.minStock} • Max: {medication.maxStock}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">{medication.expiryDate}</p>
                              <p className="text-xs text-gray-600">Lote: {medication.batch}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{medication.location}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(medication.status)}>
                              {medication.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">R$ {medication.totalValue.toFixed(2)}</p>
                              <p className="text-xs text-gray-600">Unit: R$ {medication.unitCost.toFixed(2)}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedMedication(medication)
                                  setIsEditDialogOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Barcode className="h-4 w-4" />
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
              const categoryMeds = medicationsData.filter(m => m.category === category)
              const totalValue = categoryMeds.reduce((sum, m) => sum + m.totalValue, 0)
              const lowStockCount = categoryMeds.filter(m => m.status === 'Estoque Baixo').length
              
              return (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="text-lg">{category}</CardTitle>
                    <CardDescription>{categoryMeds.length} medicamentos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Valor Total:</span>
                        <span className="font-medium">R$ {totalValue.toFixed(2)}</span>
                      </div>
                      {lowStockCount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Estoque Baixo:</span>
                          <span className="font-medium text-red-600">{lowStockCount} itens</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="alerts">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Estoque Baixo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {medicationsData.filter(m => m.status === 'Estoque Baixo').map(medication => (
                    <div key={medication.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{medication.name}</p>
                        <p className="text-xs text-gray-600">{medication.dosage} • {medication.form}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-red-600">
                          {medication.quantity}/{medication.minStock}
                        </p>
                        <Button size="sm" variant="outline" className="mt-1">
                          Repor
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  Vencendo em Breve
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {medicationsData.filter(m => m.status === 'Vencendo').map(medication => (
                    <div key={medication.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{medication.name}</p>
                        <p className="text-xs text-gray-600">Lote: {medication.batch}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-orange-600">
                          {medication.expiryDate}
                        </p>
                        <Button size="sm" variant="outline" className="mt-1">
                          Verificar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Editar Medicamento</DialogTitle>
            <DialogDescription>
              Atualize as informações do medicamento
            </DialogDescription>
          </DialogHeader>
          {selectedMedication && (
            <MedicationForm 
              medication={selectedMedication} 
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