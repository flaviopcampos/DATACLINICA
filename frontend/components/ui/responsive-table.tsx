'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronRight, MoreVertical } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Column {
  key: string
  label: string
  className?: string
  render?: (value: any, row: any) => React.ReactNode
  sortable?: boolean
  hideOnMobile?: boolean
}

interface Action {
  label: string
  onClick: (row: any) => void
  variant?: 'default' | 'destructive'
  icon?: React.ComponentType<{ className?: string }>
}

interface ResponsiveTableProps {
  data: any[]
  columns: Column[]
  actions?: Action[]
  loading?: boolean
  emptyMessage?: string
  className?: string
  cardView?: boolean // Força visualização em cards mesmo no desktop
}

export function ResponsiveTable({
  data,
  columns,
  actions,
  loading = false,
  emptyMessage = 'Nenhum dado encontrado',
  className,
  cardView = false
}: ResponsiveTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleRowExpansion = (rowId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId)
    } else {
      newExpanded.add(rowId)
    }
    setExpandedRows(newExpanded)
  }

  const visibleColumns = columns.filter(col => !col.hideOnMobile)
  const hiddenColumns = columns.filter(col => col.hideOnMobile)

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    )
  }

  // Mobile/Card View
  const renderCardView = () => (
    <div className="space-y-4">
      {data.map((row, index) => {
        const rowId = row.id || index.toString()
        const isExpanded = expandedRows.has(rowId)
        
        return (
          <Card key={rowId} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {visibleColumns.slice(0, 2).map((column) => (
                    <div key={column.key} className="mb-1">
                      {column.key === visibleColumns[0].key && (
                        <CardTitle className="text-base">
                          {column.render ? column.render(row[column.key], row) : row[column.key]}
                        </CardTitle>
                      )}
                      {column.key === visibleColumns[1]?.key && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {column.render ? column.render(row[column.key], row) : row[column.key]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center space-x-2">
                  {hiddenColumns.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRowExpansion(rowId)}
                      aria-label={isExpanded ? 'Recolher detalhes' : 'Expandir detalhes'}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                  
                  {actions && actions.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" aria-label="Ações">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {actions.map((action, actionIndex) => (
                          <DropdownMenuItem
                            key={actionIndex}
                            onClick={() => action.onClick(row)}
                            className={cn(
                              action.variant === 'destructive' && 'text-red-600 dark:text-red-400'
                            )}
                          >
                            {action.icon && <action.icon className="w-4 h-4 mr-2" />}
                            {action.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            </CardHeader>
            
            {/* Campos visíveis adicionais */}
            {visibleColumns.slice(2).length > 0 && (
              <CardContent className="pt-0 pb-3">
                <div className="grid grid-cols-1 gap-2">
                  {visibleColumns.slice(2).map((column) => (
                    <div key={column.key} className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {column.label}:
                      </span>
                      <span className="text-sm">
                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
            
            {/* Campos ocultos expandíveis */}
            {isExpanded && hiddenColumns.length > 0 && (
              <CardContent className="pt-0 border-t">
                <div className="grid grid-cols-1 gap-2">
                  {hiddenColumns.map((column) => (
                    <div key={column.key} className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {column.label}:
                      </span>
                      <span className="text-sm">
                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        )
      })}
    </div>
  )

  // Desktop Table View
  const renderTableView = () => (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key} className={column.className}>
                {column.label}
              </TableHead>
            ))}
            {actions && actions.length > 0 && (
              <TableHead className="w-12">
                <span className="sr-only">Ações</span>
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => {
            const rowId = row.id || index.toString()
            return (
              <TableRow key={rowId}>
                {columns.map((column) => (
                  <TableCell key={column.key} className={column.className}>
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </TableCell>
                ))}
                {actions && actions.length > 0 && (
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" aria-label="Ações">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {actions.map((action, actionIndex) => (
                          <DropdownMenuItem
                            key={actionIndex}
                            onClick={() => action.onClick(row)}
                            className={cn(
                              action.variant === 'destructive' && 'text-red-600 dark:text-red-400'
                            )}
                          >
                            {action.icon && <action.icon className="w-4 h-4 mr-2" />}
                            {action.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <div className={className}>
      {/* Mobile view */}
      <div className={cn("lg:hidden", cardView && "lg:block")}>
        {renderCardView()}
      </div>
      
      {/* Desktop view */}
      {!cardView && (
        <div className="hidden lg:block">
          {renderTableView()}
        </div>
      )}
    </div>
  )
}

// Componente auxiliar para status badges
export function StatusBadge({ 
  status, 
  variant = 'default' 
}: { 
  status: string
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}) {
  return (
    <Badge variant={variant} className="capitalize">
      {status}
    </Badge>
  )
}

// Hook para configurações de tabela responsiva
export function useResponsiveTable() {
  const [view, setView] = useState<'table' | 'card'>('table')
  
  return {
    view,
    setView,
    isCardView: view === 'card'
  }
}