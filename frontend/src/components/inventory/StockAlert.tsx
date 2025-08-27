'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertTriangle,
  Clock,
  Package,
  TrendingDown,
  CheckCircle,
  X,
  Eye,
  Settings
} from 'lucide-react'

interface StockAlertItem {
  id: string
  itemId: string
  itemName: string
  category: string
  type: 'low_stock' | 'out_of_stock' | 'expiring' | 'expired' | 'maintenance_due' | 'calibration_due'
  priority: 'low' | 'medium' | 'high' | 'critical'
  message: string
  currentStock?: number
  minimumStock?: number
  expiryDate?: string
  daysUntilExpiry?: number
  location?: string
  createdAt: string
  isRead: boolean
  isResolved: boolean
}

interface StockAlertProps {
  alerts: StockAlertItem[]
  onMarkAsRead?: (alertId: string) => void
  onMarkAsResolved?: (alertId: string) => void
  onViewItem?: (itemId: string) => void
  onDismiss?: (alertId: string) => void
  className?: string
}

// Mock data para demonstração
const mockAlerts: StockAlertItem[] = [
  {
    id: '1',
    itemId: 'med-001',
    itemName: 'Dipirona 500mg',
    category: 'Medicamentos',
    type: 'low_stock',
    priority: 'high',
    message: 'Estoque baixo: apenas 15 unidades restantes',
    currentStock: 15,
    minimumStock: 50,
    location: 'Farmácia Central',
    createdAt: '2024-01-15T10:30:00Z',
    isRead: false,
    isResolved: false
  },
  {
    id: '2',
    itemId: 'med-002',
    itemName: 'Paracetamol 750mg',
    category: 'Medicamentos',
    type: 'expiring',
    priority: 'medium',
    message: 'Medicamento vencendo em 7 dias',
    expiryDate: '2024-01-22',
    daysUntilExpiry: 7,
    location: 'Farmácia Central',
    createdAt: '2024-01-15T08:15:00Z',
    isRead: true,
    isResolved: false
  },
  {
    id: '3',
    itemId: 'eq-001',
    itemName: 'Monitor Cardíaco MC-300',
    category: 'Equipamentos',
    type: 'calibration_due',
    priority: 'critical',
    message: 'Calibração vencida há 5 dias',
    location: 'UTI - Leito 3',
    createdAt: '2024-01-10T14:20:00Z',
    isRead: false,
    isResolved: false
  }
]

const getAlertIcon = (type: StockAlertItem['type']) => {
  switch (type) {
    case 'low_stock':
    case 'out_of_stock':
      return <TrendingDown className="h-4 w-4" />
    case 'expiring':
    case 'expired':
      return <Clock className="h-4 w-4" />
    case 'maintenance_due':
    case 'calibration_due':
      return <Settings className="h-4 w-4" />
    default:
      return <AlertTriangle className="h-4 w-4" />
  }
}

const getPriorityColor = (priority: StockAlertItem['priority']) => {
  switch (priority) {
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'high':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'low':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getTypeLabel = (type: StockAlertItem['type']) => {
  switch (type) {
    case 'low_stock':
      return 'Estoque Baixo'
    case 'out_of_stock':
      return 'Sem Estoque'
    case 'expiring':
      return 'Vencendo'
    case 'expired':
      return 'Vencido'
    case 'maintenance_due':
      return 'Manutenção Pendente'
    case 'calibration_due':
      return 'Calibração Pendente'
    default:
      return 'Alerta'
  }
}

function StockAlert({ 
  alerts = mockAlerts, 
  onMarkAsRead, 
  onMarkAsResolved, 
  onViewItem, 
  onDismiss,
  className = '' 
}: StockAlertProps) {
  const unreadAlerts = alerts.filter(alert => !alert.isRead)
  const unresolvedAlerts = alerts.filter(alert => !alert.isResolved)
  const criticalAlerts = alerts.filter(alert => alert.priority === 'critical')

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Total de Alertas</p>
                <p className="text-2xl font-bold">{alerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">Críticos</p>
                <p className="text-2xl font-bold text-red-600">{criticalAlerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Não Lidos</p>
                <p className="text-2xl font-bold text-blue-600">{unreadAlerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Não Resolvidos</p>
                <p className="text-2xl font-bold text-green-600">{unresolvedAlerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas Ativos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum alerta ativo</h3>
              <p className="text-muted-foreground">
                Todos os itens estão dentro dos parâmetros normais.
              </p>
            </div>
          ) : (
            alerts.map((alert) => (
              <Alert 
                key={alert.id} 
                className={`${getPriorityColor(alert.priority)} ${!alert.isRead ? 'border-l-4' : ''}`}
              >
                <div className="flex items-start justify-between w-full">
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {getTypeLabel(alert.type)}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getPriorityColor(alert.priority)}`}
                        >
                          {alert.priority.toUpperCase()}
                        </Badge>
                        {!alert.isRead && (
                          <Badge variant="secondary" className="text-xs">
                            Novo
                          </Badge>
                        )}
                      </div>
                      
                      <div>
                        <h4 className="font-semibold">{alert.itemName}</h4>
                        <p className="text-sm text-muted-foreground">{alert.category}</p>
                      </div>
                      
                      <AlertDescription className="text-sm">
                        {alert.message}
                      </AlertDescription>
                      
                      {alert.location && (
                        <p className="text-xs text-muted-foreground">
                          📍 {alert.location}
                        </p>
                      )}
                      
                      <p className="text-xs text-muted-foreground">
                        {new Date(alert.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {onViewItem && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onViewItem(alert.itemId)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {!alert.isRead && onMarkAsRead && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onMarkAsRead(alert.id)}
                      >
                        Marcar como Lido
                      </Button>
                    )}
                    
                    {!alert.isResolved && onMarkAsResolved && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onMarkAsResolved(alert.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Resolver
                      </Button>
                    )}
                    
                    {onDismiss && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onDismiss(alert.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Alert>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default StockAlert