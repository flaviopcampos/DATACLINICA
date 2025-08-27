'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Filter,
  Download
} from 'lucide-react'
import Link from 'next/link'

// Mock data para demonstração
const patients = [
  {
    id: 1,
    name: 'Maria Silva Santos',
    email: 'maria.silva@email.com',
    phone: '(11) 99999-9999',
    cpf: '123.456.789-00',
    birthDate: '1985-03-15',
    gender: 'Feminino',
    status: 'Ativo',
    lastVisit: '2024-01-15',
    nextAppointment: '2024-01-25'
  },
  {
    id: 2,
    name: 'João Carlos Oliveira',
    email: 'joao.carlos@email.com',
    phone: '(11) 88888-8888',
    cpf: '987.654.321-00',
    birthDate: '1978-07-22',
    gender: 'Masculino',
    status: 'Ativo',
    lastVisit: '2024-01-10',
    nextAppointment: null
  },
  {
    id: 3,
    name: 'Ana Paula Costa',
    email: 'ana.paula@email.com',
    phone: '(11) 77777-7777',
    cpf: '456.789.123-00',
    birthDate: '1992-11-08',
    gender: 'Feminino',
    status: 'Inativo',
    lastVisit: '2023-12-20',
    nextAppointment: null
  }
]

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredPatients, setFilteredPatients] = useState(patients)

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    const filtered = patients.filter(patient =>
      patient.name.toLowerCase().includes(term.toLowerCase()) ||
      patient.email.toLowerCase().includes(term.toLowerCase()) ||
      patient.cpf.includes(term)
    )
    setFilteredPatients(filtered)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Pacientes
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie todos os pacientes da clínica
          </p>
        </div>
        <Link href="/dashboard/patients/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo Paciente
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patients.length}</div>
            <p className="text-xs text-muted-foreground">Cadastrados no sistema</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patients.filter(p => p.status === 'Ativo').length}
            </div>
            <p className="text-xs text-muted-foreground">Com consultas recentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Este Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+20% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas Consultas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patients.filter(p => p.nextAppointment).length}
            </div>
            <p className="text-xs text-muted-foreground">Agendadas para esta semana</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="search"
                  placeholder="Buscar por nome, email ou CPF..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Idade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Última Consulta</TableHead>
                <TableHead>Próxima Consulta</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{patient.name}</div>
                      <div className="text-sm text-gray-500">{patient.cpf}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">{patient.email}</div>
                      <div className="text-sm text-gray-500">{patient.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>{calculateAge(patient.birthDate)} anos</div>
                      <div className="text-sm text-gray-500">{patient.gender}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={patient.status === 'Ativo' ? 'default' : 'secondary'}
                    >
                      {patient.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {patient.lastVisit ? formatDate(patient.lastVisit) : '-'}
                  </TableCell>
                  <TableCell>
                    {patient.nextAppointment ? (
                      <Badge variant="outline">
                        {formatDate(patient.nextAppointment)}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">Não agendada</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/patients/${patient.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            Visualizar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/patients/${patient.id}/edit`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}