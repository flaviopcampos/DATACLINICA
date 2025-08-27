'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
import { ArrowLeft, Save, User, Phone, Mail, MapPin, FileText } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

// Schema de validação (mesmo do cadastro)
const patientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF deve estar no formato 000.000.000-00'),
  rg: z.string().min(5, 'RG deve ter pelo menos 5 caracteres'),
  birthDate: z.string().min(1, 'Data de nascimento é obrigatória'),
  gender: z.enum(['Masculino', 'Feminino', 'Outro']),
  maritalStatus: z.enum(['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União Estável']),
  profession: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  emergencyContact: z.string().min(10, 'Contato de emergência é obrigatório'),
  emergencyName: z.string().min(2, 'Nome do contato de emergência é obrigatório'),
  zipCode: z.string().regex(/^\d{5}-\d{3}$/, 'CEP deve estar no formato 00000-000'),
  street: z.string().min(5, 'Endereço deve ter pelo menos 5 caracteres'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, 'Bairro é obrigatório'),
  city: z.string().min(2, 'Cidade é obrigatória'),
  state: z.string().min(2, 'Estado é obrigatório'),
  allergies: z.string().optional(),
  medications: z.string().optional(),
  medicalHistory: z.string().optional(),
  observations: z.string().optional(),
})

type PatientFormData = z.infer<typeof patientSchema>

// Mock data do paciente (em produção viria da API)
const mockPatientData: PatientFormData = {
  name: 'Maria Silva Santos',
  cpf: '123.456.789-00',
  rg: '12.345.678-9',
  birthDate: '1985-03-15',
  gender: 'Feminino',
  maritalStatus: 'Casado(a)',
  profession: 'Professora',
  email: 'maria.silva@email.com',
  phone: '(11) 99999-9999',
  emergencyName: 'João Silva Santos',
  emergencyContact: '(11) 88888-8888',
  zipCode: '01234-567',
  street: 'Rua das Flores',
  number: '123',
  complement: 'Apto 45',
  neighborhood: 'Centro',
  city: 'São Paulo',
  state: 'SP',
  allergies: 'Alergia a penicilina e frutos do mar',
  medications: 'Losartana 50mg - 1x ao dia\nOmeprazol 20mg - 1x ao dia',
  medicalHistory: 'Hipertensão arterial controlada desde 2020. Histórico familiar de diabetes.',
  observations: 'Paciente colaborativa, comparece regularmente às consultas.'
}

export default function EditPatientPage() {
  const params = useParams()
  const router = useRouter()
  const patientId = params?.id as string | undefined

  if (!params) {
    return <div>Parâmetros inválidos</div>;
  }
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)

  // Verificar se o ID do paciente existe
  if (!patientId) {
    router.push('/dashboard/patients')
    return null
  }
  
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema)
  })

  // Carregar dados do paciente
  useEffect(() => {
    const loadPatientData = async () => {
      try {
        // Simular carregamento da API
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Em produção, fazer chamada para API
        // const response = await api.get(`/patients/${patientId}`)
        // const patientData = response.data
        
        // Preencher formulário com dados existentes
        reset(mockPatientData)
      } catch (error) {
        toast.error('Erro ao carregar dados do paciente')
        router.push('/dashboard/patients')
      } finally {
        setIsLoadingData(false)
      }
    }

    loadPatientData()
  }, [patientId, reset, router])

  const onSubmit = async (data: PatientFormData) => {
    setIsLoading(true)
    try {
      // Aqui seria feita a chamada para a API
      console.log('Dados atualizados do paciente:', data)
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Paciente atualizado com sucesso!')
      router.push(`/dashboard/patients/${patientId}`)
    } catch (error) {
      toast.error('Erro ao atualizar paciente. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2')
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length === 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>Carregando dados do paciente...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/patients/${patientId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Editar Paciente
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Atualize as informações do paciente
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Dados Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Dados Pessoais
            </CardTitle>
            <CardDescription>
              Informações básicas do paciente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Digite o nome completo"
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  {...register('cpf')}
                  placeholder="000.000.000-00"
                  onChange={(e) => {
                    const formatted = formatCPF(e.target.value)
                    setValue('cpf', formatted)
                  }}
                  maxLength={14}
                />
                {errors.cpf && (
                  <p className="text-sm text-red-600">{errors.cpf.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rg">RG *</Label>
                <Input
                  id="rg"
                  {...register('rg')}
                  placeholder="Digite o RG"
                />
                {errors.rg && (
                  <p className="text-sm text-red-600">{errors.rg.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="birthDate">Data de Nascimento *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  {...register('birthDate')}
                />
                {errors.birthDate && (
                  <p className="text-sm text-red-600">{errors.birthDate.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gender">Gênero *</Label>
                <Select onValueChange={(value) => setValue('gender', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Feminino">Feminino</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-sm text-red-600">{errors.gender.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maritalStatus">Estado Civil *</Label>
                <Select onValueChange={(value) => setValue('maritalStatus', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estado civil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Solteiro(a)">Solteiro(a)</SelectItem>
                    <SelectItem value="Casado(a)">Casado(a)</SelectItem>
                    <SelectItem value="Divorciado(a)">Divorciado(a)</SelectItem>
                    <SelectItem value="Viúvo(a)">Viúvo(a)</SelectItem>
                    <SelectItem value="União Estável">União Estável</SelectItem>
                  </SelectContent>
                </Select>
                {errors.maritalStatus && (
                  <p className="text-sm text-red-600">{errors.maritalStatus.message}</p>
                )}
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="profession">Profissão</Label>
                <Input
                  id="profession"
                  {...register('profession')}
                  placeholder="Digite a profissão"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contato */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Informações de Contato
            </CardTitle>
            <CardDescription>
              Dados para comunicação com o paciente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="email@exemplo.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="(00) 00000-0000"
                  onChange={(e) => {
                    const formatted = formatPhone(e.target.value)
                    setValue('phone', formatted)
                  }}
                  maxLength={15}
                />
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emergencyName">Nome do Contato de Emergência *</Label>
                <Input
                  id="emergencyName"
                  {...register('emergencyName')}
                  placeholder="Nome do contato"
                />
                {errors.emergencyName && (
                  <p className="text-sm text-red-600">{errors.emergencyName.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Telefone de Emergência *</Label>
                <Input
                  id="emergencyContact"
                  {...register('emergencyContact')}
                  placeholder="(00) 00000-0000"
                  onChange={(e) => {
                    const formatted = formatPhone(e.target.value)
                    setValue('emergencyContact', formatted)
                  }}
                  maxLength={15}
                />
                {errors.emergencyContact && (
                  <p className="text-sm text-red-600">{errors.emergencyContact.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Endereço
            </CardTitle>
            <CardDescription>
              Informações de localização do paciente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zipCode">CEP *</Label>
                <Input
                  id="zipCode"
                  {...register('zipCode')}
                  placeholder="00000-000"
                  onChange={(e) => {
                    const formatted = formatCEP(e.target.value)
                    setValue('zipCode', formatted)
                  }}
                  maxLength={9}
                />
                {errors.zipCode && (
                  <p className="text-sm text-red-600">{errors.zipCode.message}</p>
                )}
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="street">Endereço *</Label>
                <Input
                  id="street"
                  {...register('street')}
                  placeholder="Rua, Avenida, etc."
                />
                {errors.street && (
                  <p className="text-sm text-red-600">{errors.street.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="number">Número *</Label>
                <Input
                  id="number"
                  {...register('number')}
                  placeholder="123"
                />
                {errors.number && (
                  <p className="text-sm text-red-600">{errors.number.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="complement">Complemento</Label>
                <Input
                  id="complement"
                  {...register('complement')}
                  placeholder="Apto, Bloco, etc."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="neighborhood">Bairro *</Label>
                <Input
                  id="neighborhood"
                  {...register('neighborhood')}
                  placeholder="Nome do bairro"
                />
                {errors.neighborhood && (
                  <p className="text-sm text-red-600">{errors.neighborhood.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city">Cidade *</Label>
                <Input
                  id="city"
                  {...register('city')}
                  placeholder="Nome da cidade"
                />
                {errors.city && (
                  <p className="text-sm text-red-600">{errors.city.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state">Estado *</Label>
                <Input
                  id="state"
                  {...register('state')}
                  placeholder="SP"
                  maxLength={2}
                />
                {errors.state && (
                  <p className="text-sm text-red-600">{errors.state.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações Médicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Informações Médicas
            </CardTitle>
            <CardDescription>
              Histórico médico e observações importantes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="allergies">Alergias</Label>
                <Textarea
                  id="allergies"
                  {...register('allergies')}
                  placeholder="Descreva alergias conhecidas"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="medications">Medicamentos em Uso</Label>
                <Textarea
                  id="medications"
                  {...register('medications')}
                  placeholder="Liste medicamentos atuais"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="medicalHistory">Histórico Médico</Label>
                <Textarea
                  id="medicalHistory"
                  {...register('medicalHistory')}
                  placeholder="Descreva histórico médico relevante"
                  rows={4}
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="observations">Observações</Label>
                <Textarea
                  id="observations"
                  {...register('observations')}
                  placeholder="Observações adicionais"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-4">
          <Link href={`/dashboard/patients/${patientId}`}>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Salvando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Salvar Alterações
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}