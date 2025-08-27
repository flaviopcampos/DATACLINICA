'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Calendar, Clock, User, Stethoscope, FileText } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

// Schema de validação
const appointmentSchema = z.object({
  patientId: z.string().min(1, 'Selecione um paciente'),
  date: z.string().min(1, 'Data é obrigatória'),
  time: z.string().min(1, 'Horário é obrigatório'),
  type: z.enum(['Consulta', 'Retorno', 'Exame', 'Emergência']),
  doctorId: z.string().min(1, 'Selecione um médico'),
  specialty: z.string().min(1, 'Especialidade é obrigatória'),
  duration: z.string().min(1, 'Duração é obrigatória'),
  priority: z.enum(['Baixa', 'Normal', 'Alta', 'Urgente']),
  notes: z.string().optional(),
  symptoms: z.string().optional(),
  reason: z.string().min(5, 'Motivo da consulta deve ter pelo menos 5 caracteres'),
})

type AppointmentFormData = z.infer<typeof appointmentSchema>

// Mock data para pacientes
const mockPatients = [
  { id: '1', name: 'Maria Silva Santos', phone: '(11) 99999-9999' },
  { id: '2', name: 'João Santos Silva', phone: '(11) 88888-8888' },
  { id: '3', name: 'Ana Costa Lima', phone: '(11) 77777-7777' },
  { id: '4', name: 'Pedro Oliveira', phone: '(11) 66666-6666' },
  { id: '5', name: 'Lucia Fernandes', phone: '(11) 55555-5555' },
]

// Mock data para médicos
const mockDoctors = [
  { id: '1', name: 'Dr. João Oliveira', specialty: 'Clínico Geral', crm: '12345-SP' },
  { id: '2', name: 'Dra. Ana Costa', specialty: 'Cardiologia', crm: '23456-SP' },
  { id: '3', name: 'Dr. Carlos Mendes', specialty: 'Dermatologia', crm: '34567-SP' },
  { id: '4', name: 'Dra. Mariana Souza', specialty: 'Pediatria', crm: '45678-SP' },
  { id: '5', name: 'Dr. Roberto Lima', specialty: 'Ortopedia', crm: '56789-SP' },
]

// Horários disponíveis
const availableTimes = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00'
]

export default function NewAppointmentPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<string>('')
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema)
  })

  const watchedDoctor = watch('doctorId')
  const watchedType = watch('type')

  // Atualizar especialidade quando médico for selecionado
  const handleDoctorChange = (doctorId: string) => {
    const doctor = mockDoctors.find(d => d.id === doctorId)
    if (doctor) {
      setValue('doctorId', doctorId)
      setValue('specialty', doctor.specialty)
      setSelectedDoctor(doctorId)
    }
  }

  // Definir duração padrão baseada no tipo
  const handleTypeChange = (type: string) => {
    setValue('type', type as any)
    
    // Duração padrão por tipo
    const defaultDurations = {
      'Consulta': '30',
      'Retorno': '20',
      'Exame': '45',
      'Emergência': '60'
    }
    
    setValue('duration', defaultDurations[type as keyof typeof defaultDurations] || '30')
  }

  const onSubmit = async (data: AppointmentFormData) => {
    setIsLoading(true)
    try {
      // Aqui seria feita a chamada para a API
      console.log('Nova consulta:', data)
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Consulta agendada com sucesso!')
      router.push('/dashboard/appointments')
    } catch (error) {
      toast.error('Erro ao agendar consulta. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  // Obter data mínima (hoje)
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/appointments">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Nova Consulta
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Agende uma nova consulta para o paciente
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informações do Paciente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Paciente
            </CardTitle>
            <CardDescription>
              Selecione o paciente para a consulta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="patientId">Paciente *</Label>
              <Select onValueChange={(value) => setValue('patientId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um paciente" />
                </SelectTrigger>
                <SelectContent>
                  {mockPatients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{patient.name}</span>
                        <span className="text-sm text-gray-500">{patient.phone}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.patientId && (
                <p className="text-sm text-red-600">{errors.patientId.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Data e Horário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Data e Horário
            </CardTitle>
            <CardDescription>
              Defina quando a consulta será realizada
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Data *</Label>
                <Input
                  id="date"
                  type="date"
                  min={today}
                  {...register('date')}
                />
                {errors.date && (
                  <p className="text-sm text-red-600">{errors.date.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time">Horário *</Label>
                <Select onValueChange={(value) => setValue('time', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o horário" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTimes.map((time) => (
                      <SelectItem key={time} value={time}>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {time}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.time && (
                  <p className="text-sm text-red-600">{errors.time.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tipo e Detalhes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Detalhes da Consulta
            </CardTitle>
            <CardDescription>
              Informações sobre o tipo e motivo da consulta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Consulta *</Label>
                <Select onValueChange={handleTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Consulta">Consulta</SelectItem>
                    <SelectItem value="Retorno">Retorno</SelectItem>
                    <SelectItem value="Exame">Exame</SelectItem>
                    <SelectItem value="Emergência">Emergência</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-red-600">{errors.type.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Prioridade *</Label>
                <Select onValueChange={(value) => setValue('priority', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Baixa">Baixa</SelectItem>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="Alta">Alta</SelectItem>
                    <SelectItem value="Urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
                {errors.priority && (
                  <p className="text-sm text-red-600">{errors.priority.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration">Duração (minutos) *</Label>
                <Select onValueChange={(value) => setValue('duration', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a duração" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="20">20 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="45">45 minutos</SelectItem>
                    <SelectItem value="60">60 minutos</SelectItem>
                    <SelectItem value="90">90 minutos</SelectItem>
                  </SelectContent>
                </Select>
                {errors.duration && (
                  <p className="text-sm text-red-600">{errors.duration.message}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo da Consulta *</Label>
              <Textarea
                id="reason"
                {...register('reason')}
                placeholder="Descreva o motivo da consulta"
                rows={3}
              />
              {errors.reason && (
                <p className="text-sm text-red-600">{errors.reason.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="symptoms">Sintomas</Label>
              <Textarea
                id="symptoms"
                {...register('symptoms')}
                placeholder="Descreva os sintomas apresentados (opcional)"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Médico */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5" />
              Médico Responsável
            </CardTitle>
            <CardDescription>
              Selecione o médico que realizará a consulta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="doctorId">Médico *</Label>
                <Select onValueChange={handleDoctorChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um médico" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockDoctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{doctor.name}</span>
                          <span className="text-sm text-gray-500">
                            {doctor.specialty} - CRM: {doctor.crm}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.doctorId && (
                  <p className="text-sm text-red-600">{errors.doctorId.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="specialty">Especialidade *</Label>
                <Input
                  id="specialty"
                  {...register('specialty')}
                  placeholder="Especialidade médica"
                  readOnly
                  className="bg-gray-50 dark:bg-gray-800"
                />
                {errors.specialty && (
                  <p className="text-sm text-red-600">{errors.specialty.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Observações */}
        <Card>
          <CardHeader>
            <CardTitle>Observações Adicionais</CardTitle>
            <CardDescription>
              Informações complementares sobre a consulta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="Observações adicionais (opcional)"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-4">
          <Link href="/dashboard/appointments">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Agendando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Agendar Consulta
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}