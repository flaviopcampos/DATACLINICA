'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Plus,
  Trash2,
  Save,
  X,
  Package,
  Calendar,
  User,
  Building2
} from 'lucide-react'

interface OrderItem {
  id: string
  name: string
  category: string
  quantity: number
  unitPrice: number
  totalPrice: number
  supplier?: string
  description?: string
}

interface Order {
  id?: string
  orderNumber?: string
  supplier: string
  department: string
  requestedBy: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  expectedDeliveryDate: string
  status?: 'draft' | 'pending' | 'approved' | 'sent' | 'delivered' | 'cancelled'
  items: OrderItem[]
  subtotal: number
  tax: number
  total: number
  notes?: string
  createdAt?: string
  updatedAt?: string
}

interface OrderFormProps {
  order?: Order
  onSave?: (order: Order) => void
  onCancel?: () => void
  className?: string
}

// Mock data para demonstração
const mockSuppliers = [
  'Farmácia Hospitalar Ltda',
  'MedEquip Equipamentos',
  'Suprimentos Médicos SA',
  'TechMed Soluções',
  'BioSupply Distribuidora'
]

const mockDepartments = [
  'Farmácia Central',
  'UTI',
  'Pronto Socorro',
  'Enfermaria',
  'Centro Cirúrgico',
  'Laboratório',
  'Radiologia'
]

const mockCategories = [
  'Medicamentos',
  'Equipamentos',
  'Suprimentos',
  'Materiais de Consumo',
  'EPI',
  'Instrumentos'
]

function OrderForm({ order, onSave, onCancel, className = '' }: OrderFormProps) {
  const [formData, setFormData] = useState<Order>(order || {
    supplier: '',
    department: '',
    requestedBy: '',
    priority: 'medium',
    expectedDeliveryDate: '',
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    notes: ''
  })

  const [newItem, setNewItem] = useState<Partial<OrderItem>>({
    name: '',
    category: '',
    quantity: 1,
    unitPrice: 0,
    supplier: '',
    description: ''
  })

  const addItem = () => {
    if (!newItem.name || !newItem.category || !newItem.quantity || !newItem.unitPrice) {
      return
    }

    const item: OrderItem = {
      id: Date.now().toString(),
      name: newItem.name!,
      category: newItem.category!,
      quantity: newItem.quantity!,
      unitPrice: newItem.unitPrice!,
      totalPrice: newItem.quantity! * newItem.unitPrice!,
      supplier: newItem.supplier,
      description: newItem.description
    }

    const updatedItems = [...formData.items, item]
    const subtotal = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0)
    const tax = subtotal * 0.1 // 10% de imposto
    const total = subtotal + tax

    setFormData({
      ...formData,
      items: updatedItems,
      subtotal,
      tax,
      total
    })

    setNewItem({
      name: '',
      category: '',
      quantity: 1,
      unitPrice: 0,
      supplier: '',
      description: ''
    })
  }

  const removeItem = (itemId: string) => {
    const updatedItems = formData.items.filter(item => item.id !== itemId)
    const subtotal = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0)
    const tax = subtotal * 0.1
    const total = subtotal + tax

    setFormData({
      ...formData,
      items: updatedItems,
      subtotal,
      tax,
      total
    })
  }

  const handleSave = () => {
    if (!formData.supplier || !formData.department || !formData.requestedBy || formData.items.length === 0) {
      return
    }

    const orderToSave: Order = {
      ...formData,
      orderNumber: formData.orderNumber || `PED-${Date.now()}`,
      status: formData.status || 'draft',
      createdAt: formData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    onSave?.(orderToSave)
  }

  const getPriorityColor = (priority: Order['priority']) => {
    switch (priority) {
      case 'urgent':
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

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {order ? 'Editar Pedido' : 'Novo Pedido'}
          </h2>
          {formData.orderNumber && (
            <p className="text-muted-foreground">#{formData.orderNumber}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Pedido
          </Button>
        </div>
      </div>

      {/* Order Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Informações do Pedido
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fornecedor *</Label>
              <Select 
                value={formData.supplier} 
                onValueChange={(value) => setFormData({ ...formData, supplier: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o fornecedor" />
                </SelectTrigger>
                <SelectContent>
                  {mockSuppliers.map(supplier => (
                    <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Departamento Solicitante *</Label>
              <Select 
                value={formData.department} 
                onValueChange={(value) => setFormData({ ...formData, department: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o departamento" />
                </SelectTrigger>
                <SelectContent>
                  {mockDepartments.map(department => (
                    <SelectItem key={department} value={department}>{department}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Solicitado por *</Label>
              <Input
                placeholder="Nome do solicitante"
                value={formData.requestedBy}
                onChange={(e) => setFormData({ ...formData, requestedBy: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value: Order['priority']) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Data de Entrega Esperada</Label>
              <Input
                type="date"
                value={formData.expectedDeliveryDate}
                onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Prioridade Atual</Label>
              <Badge className={getPriorityColor(formData.priority)}>
                {formData.priority.toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add New Item */}
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Item</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Nome do Item *</Label>
              <Input
                placeholder="Nome do produto"
                value={newItem.name || ''}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Select 
                value={newItem.category || ''} 
                onValueChange={(value) => setNewItem({ ...newItem, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {mockCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Quantidade *</Label>
              <Input
                type="number"
                min="1"
                placeholder="Qtd"
                value={newItem.quantity || ''}
                onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Preço Unitário *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="R$ 0,00"
                value={newItem.unitPrice || ''}
                onChange={(e) => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) || 0 })}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Fornecedor Específico</Label>
              <Input
                placeholder="Fornecedor (opcional)"
                value={newItem.supplier || ''}
                onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Total</Label>
              <Input
                readOnly
                value={`R$ ${((newItem.quantity || 0) * (newItem.unitPrice || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                className="bg-muted"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              placeholder="Descrição adicional do item (opcional)"
              value={newItem.description || ''}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              rows={2}
            />
          </div>
          
          <Button onClick={addItem} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Item ao Pedido
          </Button>
        </CardContent>
      </Card>

      {/* Items List */}
      {formData.items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Itens do Pedido ({formData.items.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.name}</span>
                      <Badge variant="outline">{item.category}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Qtd: {item.quantity} × R$ {item.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    {item.description && (
                      <div className="text-sm text-muted-foreground">{item.description}</div>
                    )}
                    {item.supplier && (
                      <div className="text-xs text-muted-foreground">Fornecedor: {item.supplier}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-semibold">
                        R$ {item.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeItem(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>R$ {formData.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Impostos (10%):</span>
                  <span>R$ {formData.tax.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>R$ {formData.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Observações</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Observações adicionais sobre o pedido (opcional)"
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default OrderForm