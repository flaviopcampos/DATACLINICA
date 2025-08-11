import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { AlertCircle, Users, UserPlus, Clock, CheckCircle, XCircle } from 'lucide-react'

const CompanionsVisitorsModule = ({ addNotification, token }) => {
  // Estados principais
  const [companions, setCompanions] = useState([])
  const [visitors, setVisitors] = useState([])
  const [visitationSchedules, setVisitationSchedules] = useState([])
  const [visitorEntries, setVisitorEntries] = useState([])
  const [visitorStats, setVisitorStats] = useState({})
  const [activeTab, setActiveTab] = useState('companions')
  const [loading, setLoading] = useState(false)

  // Estados para modais
  const [showCompanionForm, setShowCompanionForm] = useState(false)
  const [showVisitorForm, setShowVisitorForm] = useState(false)
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [selectedCompanion, setSelectedCompanion] = useState(null)
  const [selectedVisitor, setSelectedVisitor] = useState(null)

  // Estados para formulários
  const [newCompanion, setNewCompanion] = useState({
    patient_id: '',
    name: '',
    relationship: '',
    cpf: '',
    phone: '',
    email: '',
    is_primary: false,
    can_receive_info: true,
    emergency_contact: false
  })

  const [newVisitor, setNewVisitor] = useState({
    name: '',
    cpf: '',
    phone: '',
    relationship: '',
    patient_id: '',
    visit_purpose: '',
    authorized_by: ''
  })

  const [newSchedule, setNewSchedule] = useState({
    department: '',
    day_of_week: '',
    start_time: '',
    end_time: '',
    max_visitors: 2,
    special_rules: ''
  })

  // Carregar dados iniciais
  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    setLoading(true)
    try {
      switch (activeTab) {
        case 'companions':
          await loadCompanions()
          break
        case 'visitors':
          await loadVisitors()
          break
        case 'schedules':
          await loadVisitationSchedules()
          break
        case 'entries':
          await loadVisitorEntries()
          break
        case 'stats':
          await loadVisitorStats()
          break
      }
    } catch (error) {
      addNotification({
        type: 'error',
        message: `Erro ao carregar dados: ${error.message}`
      })
    } finally {
      setLoading(false)
    }
  }

  const loadCompanions = async () => {
    const response = await fetch('http://localhost:8000/companions-visitors/companions/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await response.json()
    setCompanions(data)
  }

  const loadVisitors = async () => {
    const response = await fetch('http://localhost:8000/companions-visitors/visitors/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await response.json()
    setVisitors(data)
  }

  const loadVisitationSchedules = async () => {
    const response = await fetch('http://localhost:8000/companions-visitors/schedules/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await response.json()
    setVisitationSchedules(data)
  }

  const loadVisitorEntries = async () => {
    const response = await fetch('http://localhost:8000/companions-visitors/entries/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await response.json()
    setVisitorEntries(data)
  }

  const loadVisitorStats = async () => {
    const response = await fetch('http://localhost:8000/companions-visitors/stats/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await response.json()
    setVisitorStats(data)
  }

  // Funções para criar registros
  const handleCreateCompanion = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8000/companions-visitors/companions/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newCompanion)
      })

      if (response.ok) {
        addNotification({
          type: 'success',
          message: 'Acompanhante cadastrado com sucesso!'
        })
        setNewCompanion({
          patient_id: '',
          name: '',
          relationship: '',
          cpf: '',
          phone: '',
          email: '',
          is_primary: false,
          can_receive_info: true,
          emergency_contact: false
        })
        setShowCompanionForm(false)
        loadCompanions()
      }
    } catch (error) {
      addNotification({
        type: 'error',
        message: `Erro ao cadastrar acompanhante: ${error.message}`
      })
    }
  }

  const handleCreateVisitor = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8000/companions-visitors/visitors/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newVisitor)
      })

      if (response.ok) {
        addNotification({
          type: 'success',
          message: 'Visitante cadastrado com sucesso!'
        })
        setNewVisitor({
          name: '',
          cpf: '',
          phone: '',
          relationship: '',
          patient_id: '',
          visit_purpose: '',
          authorized_by: ''
        })
        setShowVisitorForm(false)
        loadVisitors()
      }
    } catch (error) {
      addNotification({
        type: 'error',
        message: `Erro ao cadastrar visitante: ${error.message}`
      })
    }
  }

  const handleCreateSchedule = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8000/companions-visitors/schedules/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newSchedule)
      })

      if (response.ok) {
        addNotification({
          type: 'success',
          message: 'Horário de visitação criado com sucesso!'
        })
        setNewSchedule({
          department: '',
          day_of_week: '',
          start_time: '',
          end_time: '',
          max_visitors: 2,
          special_rules: ''
        })
        setShowScheduleForm(false)
        loadVisitationSchedules()
      }
    } catch (error) {
      addNotification({
        type: 'error',
        message: `Erro ao criar horário: ${error.message}`
      })
    }
  }

  const handleVisitorEntry = async (visitorId, action) => {
    try {
      const response = await fetch(`http://localhost:8000/companions-visitors/visitors/${visitorId}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        addNotification({
          type: 'success',
          message: `${action === 'entry' ? 'Entrada' : 'Saída'} registrada com sucesso!`
        })
        loadVisitorEntries()
      }
    } catch (error) {
      addNotification({
        type: 'error',
        message: `Erro ao registrar ${action}: ${error.message}`
      })
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Ativo' },
      inactive: { color: 'bg-gray-100 text-gray-800', label: 'Inativo' },
      inside: { color: 'bg-blue-100 text-blue-800', label: 'Dentro' },
      outside: { color: 'bg-yellow-100 text-yellow-800', label: 'Fora' },
      authorized: { color: 'bg-green-100 text-green-800', label: 'Autorizado' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendente' },
      denied: { color: 'bg-red-100 text-red-800', label: 'Negado' }
    }

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status }
    return <Badge className={config.color}>{config.label}</Badge>
  }

  return (
    <div className="companions-visitors-module p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">👥 Acompanhantes e Visitantes</h1>
        <p className="text-gray-600">Gerencie acompanhantes de pacientes e controle de visitação</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="companions">Acompanhantes</TabsTrigger>
          <TabsTrigger value="visitors">Visitantes</TabsTrigger>
          <TabsTrigger value="schedules">Horários</TabsTrigger>
          <TabsTrigger value="entries">Entradas/Saídas</TabsTrigger>
          <TabsTrigger value="stats">Estatísticas</TabsTrigger>
        </TabsList>

        {/* Tab Acompanhantes */}
        <TabsContent value="companions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Acompanhantes Cadastrados</h2>
            <Dialog open={showCompanionForm} onOpenChange={setShowCompanionForm}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Novo Acompanhante
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Cadastrar Acompanhante</DialogTitle>
                  <DialogDescription>
                    Cadastre um novo acompanhante para o paciente
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateCompanion} className="space-y-4">
                  <div>
                    <Label htmlFor="patient_id">ID do Paciente</Label>
                    <Input
                      id="patient_id"
                      value={newCompanion.patient_id}
                      onChange={(e) => setNewCompanion({...newCompanion, patient_id: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={newCompanion.name}
                      onChange={(e) => setNewCompanion({...newCompanion, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="relationship">Parentesco</Label>
                    <Select value={newCompanion.relationship} onValueChange={(value) => setNewCompanion({...newCompanion, relationship: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o parentesco" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="spouse">Cônjuge</SelectItem>
                        <SelectItem value="parent">Pai/Mãe</SelectItem>
                        <SelectItem value="child">Filho(a)</SelectItem>
                        <SelectItem value="sibling">Irmão(ã)</SelectItem>
                        <SelectItem value="friend">Amigo(a)</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      value={newCompanion.cpf}
                      onChange={(e) => setNewCompanion({...newCompanion, cpf: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={newCompanion.phone}
                      onChange={(e) => setNewCompanion({...newCompanion, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newCompanion.email}
                      onChange={(e) => setNewCompanion({...newCompanion, email: e.target.value})}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_primary"
                      checked={newCompanion.is_primary}
                      onChange={(e) => setNewCompanion({...newCompanion, is_primary: e.target.checked})}
                    />
                    <Label htmlFor="is_primary">Acompanhante Principal</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="emergency_contact"
                      checked={newCompanion.emergency_contact}
                      onChange={(e) => setNewCompanion({...newCompanion, emergency_contact: e.target.checked})}
                    />
                    <Label htmlFor="emergency_contact">Contato de Emergência</Label>
                  </div>
                  <Button type="submit" className="w-full">Cadastrar Acompanhante</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {companions.map((companion) => (
              <Card key={companion.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{companion.name}</h3>
                      <p className="text-sm text-gray-600">Paciente: {companion.patient_name}</p>
                      <p className="text-sm text-gray-600">Parentesco: {companion.relationship}</p>
                      <p className="text-sm text-gray-600">CPF: {companion.cpf}</p>
                      <p className="text-sm text-gray-600">Telefone: {companion.phone}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      {getStatusBadge(companion.status)}
                      {companion.is_primary && <Badge className="bg-blue-100 text-blue-800">Principal</Badge>}
                      {companion.emergency_contact && <Badge className="bg-red-100 text-red-800">Emergência</Badge>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab Visitantes */}
        <TabsContent value="visitors" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Visitantes Autorizados</h2>
            <Dialog open={showVisitorForm} onOpenChange={setShowVisitorForm}>
              <DialogTrigger asChild>
                <Button>
                  <Users className="w-4 h-4 mr-2" />
                  Novo Visitante
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Autorizar Visitante</DialogTitle>
                  <DialogDescription>
                    Autorize um novo visitante para o paciente
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateVisitor} className="space-y-4">
                  <div>
                    <Label htmlFor="visitor_name">Nome do Visitante</Label>
                    <Input
                      id="visitor_name"
                      value={newVisitor.name}
                      onChange={(e) => setNewVisitor({...newVisitor, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="visitor_cpf">CPF</Label>
                    <Input
                      id="visitor_cpf"
                      value={newVisitor.cpf}
                      onChange={(e) => setNewVisitor({...newVisitor, cpf: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="visitor_phone">Telefone</Label>
                    <Input
                      id="visitor_phone"
                      value={newVisitor.phone}
                      onChange={(e) => setNewVisitor({...newVisitor, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="visitor_relationship">Parentesco</Label>
                    <Select value={newVisitor.relationship} onValueChange={(value) => setNewVisitor({...newVisitor, relationship: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o parentesco" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="family">Familiar</SelectItem>
                        <SelectItem value="friend">Amigo(a)</SelectItem>
                        <SelectItem value="colleague">Colega</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="visitor_patient_id">ID do Paciente</Label>
                    <Input
                      id="visitor_patient_id"
                      value={newVisitor.patient_id}
                      onChange={(e) => setNewVisitor({...newVisitor, patient_id: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="visit_purpose">Motivo da Visita</Label>
                    <Textarea
                      id="visit_purpose"
                      value={newVisitor.visit_purpose}
                      onChange={(e) => setNewVisitor({...newVisitor, visit_purpose: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="authorized_by">Autorizado por</Label>
                    <Input
                      id="authorized_by"
                      value={newVisitor.authorized_by}
                      onChange={(e) => setNewVisitor({...newVisitor, authorized_by: e.target.value})}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">Autorizar Visitante</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {visitors.map((visitor) => (
              <Card key={visitor.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{visitor.name}</h3>
                      <p className="text-sm text-gray-600">Paciente: {visitor.patient_name}</p>
                      <p className="text-sm text-gray-600">CPF: {visitor.cpf}</p>
                      <p className="text-sm text-gray-600">Parentesco: {visitor.relationship}</p>
                      <p className="text-sm text-gray-600">Autorizado por: {visitor.authorized_by}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      {getStatusBadge(visitor.status)}
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleVisitorEntry(visitor.id, 'entry')}
                          disabled={visitor.status === 'inside'}
                        >
                          Entrada
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVisitorEntry(visitor.id, 'exit')}
                          disabled={visitor.status === 'outside'}
                        >
                          Saída
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab Horários de Visitação */}
        <TabsContent value="schedules" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Horários de Visitação</h2>
            <Dialog open={showScheduleForm} onOpenChange={setShowScheduleForm}>
              <DialogTrigger asChild>
                <Button>
                  <Clock className="w-4 h-4 mr-2" />
                  Novo Horário
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Criar Horário de Visitação</DialogTitle>
                  <DialogDescription>
                    Configure um novo horário de visitação
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateSchedule} className="space-y-4">
                  <div>
                    <Label htmlFor="department">Departamento</Label>
                    <Select value={newSchedule.department} onValueChange={(value) => setNewSchedule({...newSchedule, department: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o departamento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="emergency">Emergência</SelectItem>
                        <SelectItem value="icu">UTI</SelectItem>
                        <SelectItem value="general">Enfermaria Geral</SelectItem>
                        <SelectItem value="pediatrics">Pediatria</SelectItem>
                        <SelectItem value="maternity">Maternidade</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="day_of_week">Dia da Semana</Label>
                    <Select value={newSchedule.day_of_week} onValueChange={(value) => setNewSchedule({...newSchedule, day_of_week: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o dia" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monday">Segunda-feira</SelectItem>
                        <SelectItem value="tuesday">Terça-feira</SelectItem>
                        <SelectItem value="wednesday">Quarta-feira</SelectItem>
                        <SelectItem value="thursday">Quinta-feira</SelectItem>
                        <SelectItem value="friday">Sexta-feira</SelectItem>
                        <SelectItem value="saturday">Sábado</SelectItem>
                        <SelectItem value="sunday">Domingo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="start_time">Horário de Início</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={newSchedule.start_time}
                      onChange={(e) => setNewSchedule({...newSchedule, start_time: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_time">Horário de Término</Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={newSchedule.end_time}
                      onChange={(e) => setNewSchedule({...newSchedule, end_time: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_visitors">Máximo de Visitantes</Label>
                    <Input
                      id="max_visitors"
                      type="number"
                      min="1"
                      max="10"
                      value={newSchedule.max_visitors}
                      onChange={(e) => setNewSchedule({...newSchedule, max_visitors: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="special_rules">Regras Especiais</Label>
                    <Textarea
                      id="special_rules"
                      value={newSchedule.special_rules}
                      onChange={(e) => setNewSchedule({...newSchedule, special_rules: e.target.value})}
                      placeholder="Ex: Apenas familiares diretos, máximo 30 minutos..."
                    />
                  </div>
                  <Button type="submit" className="w-full">Criar Horário</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {visitationSchedules.map((schedule) => (
              <Card key={schedule.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{schedule.department}</h3>
                      <p className="text-sm text-gray-600">{schedule.day_of_week}</p>
                      <p className="text-sm text-gray-600">
                        {schedule.start_time} - {schedule.end_time}
                      </p>
                      <p className="text-sm text-gray-600">
                        Máximo: {schedule.max_visitors} visitantes
                      </p>
                      {schedule.special_rules && (
                        <p className="text-sm text-gray-500 mt-2">
                          Regras: {schedule.special_rules}
                        </p>
                      )}
                    </div>
                    <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab Entradas e Saídas */}
        <TabsContent value="entries" className="space-y-4">
          <h2 className="text-xl font-semibold">Registro de Entradas e Saídas</h2>
          
          <div className="grid gap-4">
            {visitorEntries.map((entry) => (
              <Card key={entry.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{entry.visitor_name}</h3>
                      <p className="text-sm text-gray-600">Paciente: {entry.patient_name}</p>
                      <p className="text-sm text-gray-600">
                        {entry.entry_type === 'entry' ? 'Entrada' : 'Saída'}: {new Date(entry.timestamp).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {entry.entry_type === 'entry' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      {getStatusBadge(entry.entry_type === 'entry' ? 'inside' : 'outside')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab Estatísticas */}
        <TabsContent value="stats" className="space-y-4">
          <h2 className="text-xl font-semibold">Estatísticas de Visitação</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total de Acompanhantes</p>
                    <p className="text-2xl font-bold">{visitorStats.total_companions || 0}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Visitantes Autorizados</p>
                    <p className="text-2xl font-bold">{visitorStats.total_visitors || 0}</p>
                  </div>
                  <UserPlus className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Visitantes Hoje</p>
                    <p className="text-2xl font-bold">{visitorStats.visitors_today || 0}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Visitantes Ativos</p>
                    <p className="text-2xl font-bold">{visitorStats.active_visitors || 0}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default CompanionsVisitorsModule