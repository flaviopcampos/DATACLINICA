'use client'

import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar as CalendarIcon, Filter, X, Search, Users, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ActionType, SeverityLevel, EventCategory, AuditFilters as AuditFiltersType } from '@/types/audit'
import { cn } from '@/lib/utils'

interface AuditFiltersProps {
  filters: AuditFiltersType
  onFiltersChange: (filters: AuditFiltersType) => void
  onReset: () => void
  className?: string
  showPresets?: boolean
}

interface FilterPreset {
  id: string
  name: string
  description: string
  filters: Partial<AuditFiltersType>
}

const FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'security-events',
    name: 'Eventos de Segurança',
    description: 'Login, logout e tentativas de acesso',
    filters: {
      action: ['LOGIN', 'LOGOUT', 'ACCESS'],
      severity: ['HIGH', 'CRITICAL']
    }
  },
  {
    id: 'data-changes',
    name: 'Alterações de Dados',
    description: 'Criação, atualização e exclusão de registros',
    filters: {
      action: ['CREATE', 'UPDATE', 'DELETE']
    }
  },
  {
    id: 'critical-events',
    name: 'Eventos Críticos',
    description: 'Apenas eventos de severidade crítica',
    filters: {
      severity: ['CRITICAL']
    }
  },
  {
    id: 'recent-activity',
    name: 'Atividade Recente',
    description: 'Últimas 24 horas',
    filters: {
      dateFrom: new Date(Date.now() - 24 * 60 * 60 * 1000),
      dateTo: new Date()
    }
  }
]

const MOCK_USERS = [
  { id: '1', name: 'Dr. João Silva', email: 'joao.silva@dataclinica.com' },
  { id: '2', name: 'Dra. Maria Santos', email: 'maria.santos@dataclinica.com' },
  { id: '3', name: 'Admin Sistema', email: 'admin@dataclinica.com' },
  { id: '4', name: 'Enfermeira Ana', email: 'ana.enfermeira@dataclinica.com' },
  { id: '5', name: 'Recepcionista Carlos', email: 'carlos.recepcao@dataclinica.com' }
]

function AuditFilters({ 
  filters, 
  onFiltersChange, 
  onReset, 
  className,
  showPresets = true 
}: AuditFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [resourceSearch, setResourceSearch] = useState('')

  const filteredUsers = MOCK_USERS.filter(user => 
    user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearch.toLowerCase())
  )

  const handleFilterChange = (key: keyof AuditFiltersType, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const handleArrayFilterChange = (key: keyof AuditFiltersType, value: string, checked: boolean) => {
    const currentArray = (filters[key] as string[]) || []
    let newArray: string[]
    
    if (checked) {
      newArray = [...currentArray, value]
    } else {
      newArray = currentArray.filter(item => item !== value)
    }
    
    handleFilterChange(key, newArray.length > 0 ? newArray : undefined)
  }

  const applyPreset = (preset: FilterPreset) => {
    onFiltersChange({
      ...filters,
      ...preset.filters
    })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.userId?.length) count++
    if (filters.action?.length) count++
    if (filters.severity?.length) count++
    if (filters.category?.length) count++
    if (filters.resource) count++
    if (filters.dateFrom || filters.dateTo) count++
    if (filters.ipAddress) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div className={cn('space-y-4', className)}>
      {/* Botão de Filtros */}
      <div className="flex items-center justify-between">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              Filtros Avançados
              {activeFiltersCount > 0 && (
                <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-0" align="start">
            <Card className="border-0 shadow-none">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Filtros Avançados</CardTitle>
                    <CardDescription>
                      Configure os filtros para refinar sua busca
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ScrollArea className="h-96">
                  <div className="space-y-4 pr-4">
                    {/* Busca Geral */}
                    <div className="space-y-2">
                      <Label>Busca Geral</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Buscar em descrições, recursos..."
                          value={filters.search || ''}
                          onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Período */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Período
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs text-gray-600">De</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {filters.dateFrom ? format(filters.dateFrom, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecionar'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={filters.dateFrom}
                                onSelect={(date) => handleFilterChange('dateFrom', date)}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Até</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {filters.dateTo ? format(filters.dateTo, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecionar'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={filters.dateTo}
                                onSelect={(date) => handleFilterChange('dateTo', date)}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Usuários */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Usuários
                      </Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Buscar usuários..."
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <div className="max-h-32 overflow-y-auto space-y-2">
                        {filteredUsers.map((user) => (
                          <div key={user.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`user-${user.id}`}
                              checked={(filters.userId || []).includes(user.id)}
                              onCheckedChange={(checked) => 
                                handleArrayFilterChange('userId', user.id, checked as boolean)
                              }
                            />
                            <Label htmlFor={`user-${user.id}`} className="text-sm flex-1 cursor-pointer">
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-xs text-gray-500">{user.email}</div>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Ações */}
                    <div className="space-y-2">
                      <Label>Ações</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.values(ActionType).map((action) => (
                          <div key={action} className="flex items-center space-x-2">
                            <Checkbox
                              id={`action-${action}`}
                              checked={(filters.action || []).includes(action)}
                              onCheckedChange={(checked) => 
                                handleArrayFilterChange('action', action, checked as boolean)
                              }
                            />
                            <Label htmlFor={`action-${action}`} className="text-sm cursor-pointer">
                              {action}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Severidade */}
                    <div className="space-y-2">
                      <Label>Severidade</Label>
                      <div className="space-y-2">
                        {Object.values(SeverityLevel).map((severity) => (
                          <div key={severity} className="flex items-center space-x-2">
                            <Checkbox
                              id={`severity-${severity}`}
                              checked={(filters.severity || []).includes(severity)}
                              onCheckedChange={(checked) => 
                                handleArrayFilterChange('severity', severity, checked as boolean)
                              }
                            />
                            <Label htmlFor={`severity-${severity}`} className="text-sm cursor-pointer">
                              {severity}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Categoria */}
                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <div className="space-y-2">
                        {Object.values(EventCategory).map((category) => (
                          <div key={category} className="flex items-center space-x-2">
                            <Checkbox
                              id={`category-${category}`}
                              checked={(filters.category || []).includes(category)}
                              onCheckedChange={(checked) => 
                                handleArrayFilterChange('category', category, checked as boolean)
                              }
                            />
                            <Label htmlFor={`category-${category}`} className="text-sm cursor-pointer">
                              {category}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Recurso */}
                    <div className="space-y-2">
                      <Label>Recurso</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Nome do recurso..."
                          value={filters.resource || ''}
                          onChange={(e) => handleFilterChange('resource', e.target.value || undefined)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Endereço IP */}
                    <div className="space-y-2">
                      <Label>Endereço IP</Label>
                      <Input
                        placeholder="192.168.1.1"
                        value={filters.ipAddress || ''}
                        onChange={(e) => handleFilterChange('ipAddress', e.target.value || undefined)}
                      />
                    </div>
                  </div>
                </ScrollArea>

                {/* Ações */}
                <div className="flex justify-between pt-4 border-t">
                  <Button variant="outline" onClick={onReset}>
                    Limpar Filtros
                  </Button>
                  <Button onClick={() => setIsOpen(false)}>
                    Aplicar Filtros
                  </Button>
                </div>
              </CardContent>
            </Card>
          </PopoverContent>
        </Popover>

        {/* Botão de Reset */}
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <X className="h-4 w-4 mr-1" />
            Limpar ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Presets de Filtros */}
      {showPresets && (
        <div className="flex flex-wrap gap-2">
          {FILTER_PRESETS.map((preset) => (
            <Button
              key={preset.id}
              variant="outline"
              size="sm"
              onClick={() => applyPreset(preset)}
              className="text-xs"
            >
              {preset.name}
            </Button>
          ))}
        </div>
      )}

      {/* Filtros Ativos */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Busca: {filters.search}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleFilterChange('search', undefined)}
              />
            </Badge>
          )}
          {filters.userId?.map((userId) => {
            const user = MOCK_USERS.find(u => u.id === userId)
            return (
              <Badge key={userId} variant="secondary" className="gap-1">
                Usuário: {user?.name || userId}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleArrayFilterChange('userId', userId, false)}
                />
              </Badge>
            )
          })}
          {filters.action?.map((action) => (
            <Badge key={action} variant="secondary" className="gap-1">
              Ação: {action}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleArrayFilterChange('action', action, false)}
              />
            </Badge>
          ))}
          {filters.severity?.map((severity) => (
            <Badge key={severity} variant="secondary" className="gap-1">
              Severidade: {severity}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleArrayFilterChange('severity', severity, false)}
              />
            </Badge>
          ))}
          {filters.category?.map((category) => (
            <Badge key={category} variant="secondary" className="gap-1">
              Categoria: {category}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleArrayFilterChange('category', category, false)}
              />
            </Badge>
          ))}
          {filters.resource && (
            <Badge variant="secondary" className="gap-1">
              Recurso: {filters.resource}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleFilterChange('resource', undefined)}
              />
            </Badge>
          )}
          {filters.ipAddress && (
            <Badge variant="secondary" className="gap-1">
              IP: {filters.ipAddress}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleFilterChange('ipAddress', undefined)}
              />
            </Badge>
          )}
          {(filters.dateFrom || filters.dateTo) && (
            <Badge variant="secondary" className="gap-1">
              Período: {filters.dateFrom ? format(filters.dateFrom, 'dd/MM', { locale: ptBR }) : '...'} - {filters.dateTo ? format(filters.dateTo, 'dd/MM', { locale: ptBR }) : '...'}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => {
                  handleFilterChange('dateFrom', undefined)
                  handleFilterChange('dateTo', undefined)
                }}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}

export default AuditFilters