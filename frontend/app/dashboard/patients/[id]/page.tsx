'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  Edit,
  Calendar,
  Phone,
  Mail,
  MapPin,
  User,
  FileText,
  Clock,
  Activity,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'

// Mock data - em produção viria da API
const patientData = {
  id: 1,
  name: 'Maria Silva Santos',
  email: 'maria.silva@email.com',
  phone: '(11) 99999-9999',
  cpf: '123.456.789-00',
  rg: '12.345.678-9',
  birthDate: '1985-03-15',
  gender: 'Feminino',
  maritalStatus: 'Casada',
  profession: 'Professora',
  status: 'Ativo',
  registrationDate: '2023-01-15',
  lastVisit: '2024-01-15',
  nextAppointment: '2024-01-25',
  emergencyContact: {
    name: 'João Silva Santos',
    phone: '(11) 88888-8888'
  },
  address: {
    zipCode: '01234-567',
    street: 'Rua das Flores, 123',
    number: '123',
    complement: 'Apto 45',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP'
  },
  medicalInfo: {
    allergies: 'Alergia a penicilina e frutos do mar',
    medications: 'Losartana 50mg - 1x ao dia\nOmeprazol 20mg - 1x ao dia',
    medicalHistory: 'Hipertensão arterial controlada desde 2020. Histórico familiar de diabetes.',
    observations: 'Paciente colaborativa, comparece regularmente às consultas.'
  }
}

// Mock data para consultas
const appointments = [
  {
    id: 1,
    date: '2024-01-25',
    time: '14:30',
    type: 'Consulta de Rotina',
    doctor: 'Dr. João Cardiologista',
    status: 'Agendada',
    notes: 'Consulta de acompanhamento'
  },
  {
    id: 2,
    date: '2024-01-15',
    time: '10:00',
    type: 'Consulta de Rotina',
    doctor: 'Dr. João Cardiologista',
    status: 'Realizada',
    notes: 'Pressão arterial controlada. Manter medicação atual.'
  },
  {
    id: 3,
    date: '2023-12-20',
    time: '15:15',
    type: 'Exames',
    doctor: 'Dr. João Cardiologista',
    status: 'Realizada',
    notes: 'Solicitados exames de rotina: hemograma, glicemia, colesterol.'
  }
]

// Mock data para exames
const exams = [
  {
    id: 1,
    name: 'Hemograma Completo',
    date: '2024-01-10',
    result: 'Normal',
    status: 'Concluído',
    doctor: 'Dr. João Cardiologista'
  },
  {
    id: 2,
    name: 'Glicemia de Jejum',
    date: '2024-01-10',
    result: '95 mg/dL',
    status: 'Concluído',
    doctor: 'Dr. João Cardiologista'
  },
  {
    id: 3,
    name: 'Eletrocardiograma',
    date: '2024-01-05',
    result: 'Ritmo sinusal normal',
    status: 'Concluído',
    doctor: 'Dr. João Cardiologista'
  }
]

export default function PatientDetailsPage({ params }: { params: { id: string } | null }) {
  const router = useRouter()
  if (!params) {
    return <div>Parâmetros inválidos</div>;
  }
  const patientId = parseInt(params.id)

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Agendada':
        return 'bg-blue-100 text-blue-800'
      case 'Realizada':
        return 'bg-green-100 text-green-800'
      case 'Cancelada':
        return 'bg-red-100 text-red-800'
      case 'Concluído':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/patients">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {patientData.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {calculateAge(patientData.birthDate)} anos • {patientData.gender} • {patientData.profession}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Agendar Consulta
          </Button>
          <Link href={`/dashboard/patients/${patientId}/edit`}>
            <Button>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </Link>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge variant={patientData.status === 'Ativo' ? 'default' : 'secondary'}>
                  {patientData.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Última Consulta</p>
                <p className="font-semibold">{formatDate(patientData.lastVisit)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Próxima Consulta</p>
                <p className="font-semibold">{formatDate(patientData.nextAppointment)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Consultas</p>
                <p className="font-semibold">{appointments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs com informações detalhadas */}
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
          <TabsTrigger value="appointments">Consultas</TabsTrigger>
          <TabsTrigger value="exams">Exames</TabsTrigger>
          <TabsTrigger value="medical">Informações Médicas</TabsTrigger>
        </TabsList>

        {/* Dados Pessoais */}
        <TabsContent value="personal" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">CPF</p>
                    <p className="font-semibold">{patientData.cpf}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">RG</p>
                    <p className="font-semibold">{patientData.rg}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Data de Nascimento</p>
                    <p className="font-semibold">{formatDate(patientData.birthDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estado Civil</p>
                    <p className="font-semibold">{patientData.maritalStatus}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Data de Cadastro</p>
                    <p className="font-semibold">{formatDate(patientData.registrationDate)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contato */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold">{patientData.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Telefone</p>
                      <p className="font-semibold">{patientData.phone}</p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Contato de Emergência</p>
                    <p className="font-semibold">{patientData.emergencyContact.name}</p>
                    <p className="text-sm text-gray-600">{patientData.emergencyContact.phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Endereço */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Endereço
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">CEP</p>
                    <p className="font-semibold">{patientData.address.zipCode}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Endereço</p>
                    <p className="font-semibold">
                      {patientData.address.street}, {patientData.address.number}
                      {patientData.address.complement && ` - ${patientData.address.complement}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Bairro</p>
                    <p className="font-semibold">{patientData.address.neighborhood}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Cidade</p>
                    <p className="font-semibold">{patientData.address.city}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estado</p>
                    <p className="font-semibold">{patientData.address.state}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Consultas */}
        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Consultas</CardTitle>
              <CardDescription>
                Todas as consultas realizadas e agendadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Calendar className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold">{appointment.type}</p>
                          <p className="text-sm text-gray-600">
                            {formatDate(appointment.date)} às {appointment.time}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </div>
                    <div className="ml-11">
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Médico:</strong> {appointment.doctor}
                      </p>
                      {appointment.notes && (
                        <p className="text-sm text-gray-600">
                          <strong>Observações:</strong> {appointment.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exames */}
        <TabsContent value="exams" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Exames</CardTitle>
              <CardDescription>
                Todos os exames realizados pelo paciente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {exams.map((exam) => (
                  <div key={exam.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <FileText className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold">{exam.name}</p>
                          <p className="text-sm text-gray-600">
                            {formatDate(exam.date)}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(exam.status)}>
                        {exam.status}
                      </Badge>
                    </div>
                    <div className="ml-11">
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Médico:</strong> {exam.doctor}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Resultado:</strong> {exam.result}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Informações Médicas */}
        <TabsContent value="medical" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Alergias */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Alergias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {patientData.medicalInfo.allergies || 'Nenhuma alergia conhecida'}
                </p>
              </CardContent>
            </Card>

            {/* Medicamentos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Medicamentos em Uso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {patientData.medicalInfo.medications ? (
                    patientData.medicalInfo.medications.split('\n').map((med, index) => (
                      <p key={index} className="text-sm">{med}</p>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Nenhum medicamento em uso</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Histórico Médico */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Histórico Médico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {patientData.medicalInfo.medicalHistory || 'Nenhum histórico médico registrado'}
                </p>
              </CardContent>
            </Card>

            {/* Observações */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {patientData.medicalInfo.observations || 'Nenhuma observação registrada'}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}