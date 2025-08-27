'use client'

import React, { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { Pagination } from '@/components/ui/pagination'
import { MovementForm } from './MovementForm'
import { useStockMovements } from '@/hooks/useStockMovements'
import { useProducts } from '../../src/hooks/useProducts'
import type { StockMovement, MovementType } from '@/types/inventory'
import {
  Plus,
  Search,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Package,
  Calendar,
  User,
} from 'lucide-react'

interface StockMovementManagerProps {
  className?: string
}

interface MovementFilters {
  productId?: string
  type?: MovementType | 'all'
  dateFrom?: string
  dateTo?: string
  userId?: string
  search?: string
}

const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  in: 'Entrada',
  out: 'Saída',
  adjustment: 'Ajuste',
}

const MOVEMENT_TYPE_COLORS: Record<MovementType, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  in: 'default',
  out: 'destructive',
  adjustment: 'secondary',
}

const MOVEMENT_TYPE_ICONS: Record<MovementType, React.ComponentType<any>> = {
  in: TrendingUp,
  out: TrendingDown,
  adjustment: RotateCcw,
}

export function StockMovementManager({ className }: StockMovementManagerProps) {
  const [activeTab, setActiveTab] = useState('movements')
  const [showNewMovementDialog, setShowNewMovementDialog] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  const [filters, setFilters] = useState<MovementFilters>({
    type: 'all',
  })

  const {
    movements,
    movementStats,
    isLoading: movementsLoading,
    error: movementsError,
    createMovement,
    exportMovements,
    isCreating,
    isExporting,
  } = useStockMovements({
    page: currentPage,
    limit: pageSize,
    ...filters,
  })

  const { products, isLoading: productsLoading } = useProducts({
    page: 1,
    limit: 1000, // Para o select de produtos
  })

  const handleFiltersChange = (newFilters: Partial<MovementFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({ type: 'all' })
    setCurrentPage(1)
  }

  const hasActiveFilters = () => {
    return (
      filters.productId ||
      (filters.type && filters.type !== 'all') ||
      filters.dateFrom ||
      filters.dateTo ||
      filters.userId ||
      filters.search
    )
  }

  const handleCreateMovement = async (data: any) => {
    try {
      await createMovement(data)
      setShowNewMovementDialog(false)
    } catch (error) {
      console.error('Erro ao criar movimentação:', error)
    }
  }

  const handleExportMovements = async () => {
    try {
      await exportMovements(filters)
    } catch (error) {
      console.error('Erro ao exportar movimentações:', error)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  if (movementsError) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Erro ao carregar movimentações: {movementsError.message}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-6">
          <TabsList>
            <TabsTrigger value="movements">Movimentações</TabsTrigger>
            <TabsTrigger value="stats">Estatísticas</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={hasActiveFilters() ? 'border-blue-500 text-blue-600' : ''}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              {hasActiveFilters() && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                  !
                </Badge>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportMovements}
              disabled={isExporting}
            >
              {isExporting ? (
                <LoadingSpinner className="h-4 w-4 mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Exportar
            </Button>

            <Dialog open={showNewMovementDialog} onOpenChange={setShowNewMovementDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Movimentação
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Nova Movimentação de Estoque</DialogTitle>
                  <DialogDescription>
                    Registre uma nova movimentação de entrada, saída ou ajuste de estoque.
                  </DialogDescription>
                </DialogHeader>
                <MovementForm
                  onSubmit={handleCreateMovement}
                  onCancel={() => setShowNewMovementDialog(false)}
                  isLoading={isCreating}
                  products={products?.data || []}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filtros */}
        {showFilters && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Buscar</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por produto, documento..."
                      value={filters.search || ''}
                      onChange={(e) => handleFiltersChange({ search: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Produto</label>
                  <Select
                    value={filters.productId || 'all'}
                    onValueChange={(value) => 
                      handleFiltersChange({ productId: value === 'all' ? undefined : value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os produtos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os produtos</SelectItem>
                      {products?.data?.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Tipo</label>
                  <Select
                    value={filters.type || 'all'}
                    onValueChange={(value) => 
                      handleFiltersChange({ type: value === 'all' ? undefined : value as MovementType })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="in">Entrada</SelectItem>
                      <SelectItem value="out">Saída</SelectItem>
                      <SelectItem value="adjustment">Ajuste</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Data Inicial</label>
                  <Input
                    type="date"
                    value={filters.dateFrom || ''}
                    onChange={(e) => handleFiltersChange({ dateFrom: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Data Final</label>
                  <Input
                    type="date"
                    value={filters.dateTo || ''}
                    onChange={(e) => handleFiltersChange({ dateTo: e.target.value })}
                  />
                </div>
              </div>

              {hasActiveFilters() && (
                <div className="flex justify-end mt-4">
                  <Button variant="outline" onClick={clearFilters}>
                    Limpar Filtros
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <TabsContent value="movements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Movimentações de Estoque</CardTitle>
              <CardDescription>
                Histórico completo de todas as movimentações de estoque
              </CardDescription>
            </CardHeader>
            <CardContent>
              {movementsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner className="h-8 w-8" />
                </div>
              ) : !movements?.data?.length ? (
                <EmptyState
                  icon={Package}
                  title="Nenhuma movimentação encontrada"
                  description="Não há movimentações de estoque registradas com os filtros aplicados."
                  action={
                    <Button onClick={() => setShowNewMovementDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Movimentação
                    </Button>
                  }
                />
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Produto</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead className="text-right">Quantidade</TableHead>
                          <TableHead className="text-right">Valor Unit.</TableHead>
                          <TableHead className="text-right">Valor Total</TableHead>
                          <TableHead>Documento</TableHead>
                          <TableHead>Usuário</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {movements.data.map((movement) => {
                          const Icon = MOVEMENT_TYPE_ICONS[movement.type]
                          return (
                            <TableRow key={movement.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm">
                                    {format(new Date(movement.created_at), 'dd/MM/yyyy HH:mm', {
                                      locale: ptBR,
                                    })}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{movement.product.name}</div>
                                  <div className="text-sm text-gray-500">
                                    Código: {movement.product.code}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={MOVEMENT_TYPE_COLORS[movement.type]}
                                  className="flex items-center gap-1 w-fit"
                                >
                                  <Icon className="h-3 w-3" />
                                  {MOVEMENT_TYPE_LABELS[movement.type]}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {movement.type === 'out' ? '-' : '+'}
                                {movement.quantity} {movement.product.unit}
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {movement.unit_cost ? formatCurrency(movement.unit_cost) : '-'}
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {movement.total_cost ? formatCurrency(movement.total_cost) : '-'}
                              </TableCell>
                              <TableCell>
                                {movement.reference_document || '-'}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm">{movement.user?.name || 'Sistema'}</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {movements.pagination && (
                    <div className="flex justify-center mt-6">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={movements.pagination.pages}
                        onPageChange={setCurrentPage}
                      />
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Movimentações</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {movementStats?.total_movements || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Últimos 30 dias
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Entradas</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {movementStats?.total_in || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Valor: {formatCurrency(movementStats?.total_in_value || 0)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saídas</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {movementStats?.total_out || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Valor: {formatCurrency(movementStats?.total_out_value || 0)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ajustes</CardTitle>
                <RotateCcw className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {movementStats?.total_adjustments || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Últimos 30 dias
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de movimentações por período seria implementado aqui */}
          <Card>
            <CardHeader>
              <CardTitle>Movimentações por Período</CardTitle>
              <CardDescription>
                Gráfico de movimentações dos últimos 30 dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-500">
                Gráfico de movimentações será implementado em breve
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}