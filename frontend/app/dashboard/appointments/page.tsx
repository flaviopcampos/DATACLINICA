'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Calendar,
  Clock,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  User,
  Phone,
  CalendarDays,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

// Mock data para consultas
const mockAppointments = [
  {
    id: '1',
    patient: {
      id: '1',
      name: 'Maria Silva Santos',
      phone: '(11) 99999-9999'
    },
    date: '2024-01-15',
    time: '09:00',
    type: 'Consulta',
    status: 'Agendada',
    doctor: 'Dr. João Oliveira',
    specialty: 'Clínico Geral',
    duration: 30,
    notes: 'Consulta de rotina'
  },
  {
    id: '2',
    patient: {
      id: '2',
      name: 'João Santos Silva',
      phone: '(11) 88888-8888'
    },
    date: '2024-01-15',
    time: '10:30',
    type: 'Retorno',
    status: 'Confirmada',
    doctor: 'Dra. Ana Costa',
    specialty: 'Cardiologia',
    duration: 45,
    notes: 'Acompanhamento pós-cirúrgico'
  },
  {
    id: '3',
    patient: {
      id: '3',
      name: 'Ana Costa Lima',
      phone: '(11) 77777-7777'
    },
    date: '2024-01-15',
    time: '14:00',
    type: 'Exame',
    status: 'Concluída',
    doctor: 'Dr. Carlos Mendes',
    specialty: 'Dermatologia',
    duration: 60,
    notes: 'Biópsia de pele'
  },
  {
    id: '4',
    patient: {
      id: '4',
      name: 'Pedro Oliveira',
      phone: '(11) 66666-6666'
    },
    date: '2024-01-16',
    time: '08:30',
    type: 'Consulta',
    status: 'Cancelada',
    doctor: 'Dra. Mariana Souza',
    specialty: 'Pediatria',
    duration: 30,
    notes: 'Paciente cancelou por motivos pessoais'
  },
  {
    id: '5',
    patient: {
      id: '5',
      name: 'Lucia Fernandes',
      phone: '(11) 55555-5555'
    },
    date: '2024-01-16',
    time: '15:30',
    type: 'Retorno',
    status: 'Agendada',
    doctor: 'Dr. Roberto Lima',
    specialty: 'Ortopedia',
    duration: 30,
    notes: 'Avaliação de recuperação'
  }
]

const getStatusBadge = (status: string) => {
  const statusConfig = {
    'Agendada': { variant: 'secondary' as const, icon: Calendar },
    'Confirmada': { variant: 'default' as const, icon: CheckCircle },
    'Concluída': { variant: 'default' as const, icon: CheckCircle },
    'Cancelada': { variant: 'destructive' as const, icon: XCircle },
    'Faltou': { variant: 'destructive' as const, icon: AlertCircle }
  }
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['Agendada']
  const Icon = config.icon
  
  // Aplicar className específica para status 'Concluída'
  const className = status === 'Concluída' ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''
  
  return (
    <Badge variant={config.variant} className={className}>
      <Icon className="w-3 h-3 mr-1" />
      {status}
    </Badge>
  )
}

const getTypeBadge = (type: string) => {
  const typeConfig = {
    'Consulta': 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    'Retorno': 'bg-purple-100 text-purple-800 hover:bg-purple-200',
    'Exame': 'bg-orange-100 text-orange-800 hover:bg-orange-200',
    'Emergência': 'bg-red-100 text-red-800 hover:bg-red-200'
  }
  
  return (
    <Badge variant="secondary" className={typeConfig[type as keyof typeof typeConfig]}>
      {type}
    </Badge>
  )
}

export default function AppointmentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')

  // Filtrar consultas
  const filteredAppointments = mockAppointments.filter(appointment => {
    const matchesSearch = appointment.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter
    const matchesType = typeFilter === 'all' || appointment.type === typeFilter
    
    let matchesDate = true
    if (dateFilter === 'today') {
      const today = new Date().toISOString().split('T')[0]
      matchesDate = appointment.date === today
    } else if (dateFilter === 'week') {
      const today = new Date()
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      const appointmentDate = new Date(appointment.date)
      matchesDate = appointmentDate >= today && appointmentDate <= weekFromNow
    }
    
    return matchesSearch && matchesStatus && matchesType && matchesDate
  })

  // Estatísticas
  const stats = {
    total: mockAppointments.length,
    today: mockAppointments.filter(apt => {
      const today = new Date().toISOString().split('T')[0]
      return apt.date === today
    }).length,
    confirmed: mockAppointments.filter(apt => apt.status === 'Confirmada').length,
    completed: mockAppointments.filter(apt => apt.status === 'Concluída').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Consultas
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie todas as consultas e agendamentos
          </p>
        </div>
        <Link href="/dashboard/appointments/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nova Consulta
          </Button>
        </Link>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Consultas
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Todas as consultas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Hoje
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today}</div>
            <p className="text-xs text-muted-foreground">
              Consultas de hoje
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Confirmadas
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmed}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando atendimento
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Concluídas
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              Atendimentos finalizados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Use os filtros para encontrar consultas específicas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por paciente, médico ou especialidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="Agendada">Agendada</SelectItem>
                <SelectItem value="Confirmada">Confirmada</SelectItem>
                <SelectItem value="Concluída">Concluída</SelectItem>
                <SelectItem value="Cancelada">Cancelada</SelectItem>
                <SelectItem value="Faltou">Faltou</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="Consulta">Consulta</SelectItem>
                <SelectItem value="Retorno">Retorno</SelectItem>
                <SelectItem value="Exame">Exame</SelectItem>
                <SelectItem value="Emergência">Emergência</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Períodos</SelectItem>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Esta Semana</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Consultas */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Consultas</CardTitle>
          <CardDescription>
            {filteredAppointments.length} consulta(s) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Médico</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{appointment.patient.name}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {appointment.patient.phone}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="font-medium">
                            {new Date(appointment.date).toLocaleDateString('pt-BR')}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {appointment.time}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getTypeBadge(appointment.type)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{appointment.doctor}</div>
                        <div className="text-sm text-gray-500">{appointment.specialty}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(appointment.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {appointment.duration}min
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/appointments/${appointment.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              Visualizar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/appointments/${appointment.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredAppointments.length === 0 && (
            <div className="text-center py-8">
              <CalendarDays className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                Nenhuma consulta encontrada
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Tente ajustar os filtros ou criar uma nova consulta.
              </p>
              <div className="mt-6">
                <Link href="/dashboard/appointments/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Consulta
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}