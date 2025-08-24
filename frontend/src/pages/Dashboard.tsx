import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Users,
  Calendar,
  FileText,
  Activity,
  TrendingUp,
  Clock,
  UserPlus,
  CalendarPlus,
} from 'lucide-react'

interface DashboardStats {
  totalPatients: number
  todayAppointments: number
  pendingReports: number
  monthlyRevenue: number
}

interface DashboardProps {
  stats: DashboardStats
  onNavigate: (page: string) => void
}

function Dashboard({ stats, onNavigate }: DashboardProps) {
  const quickActions = [
    {
      title: 'Novo Paciente',
      description: 'Cadastrar novo paciente',
      icon: UserPlus,
      action: () => onNavigate('patients'),
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      title: 'Agendar Consulta',
      description: 'Nova consulta',
      icon: CalendarPlus,
      action: () => onNavigate('appointments'),
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      title: 'Relatórios',
      description: 'Ver relatórios',
      icon: FileText,
      action: () => onNavigate('reports'),
      color: 'bg-purple-500 hover:bg-purple-600',
    },
  ]

  const recentAppointments = [
    {
      id: 1,
      patient: 'Maria Silva',
      time: '09:00',
      type: 'Consulta',
      status: 'Confirmado',
    },
    {
      id: 2,
      patient: 'João Santos',
      time: '10:30',
      type: 'Retorno',
      status: 'Aguardando',
    },
    {
      id: 3,
      patient: 'Ana Costa',
      time: '14:00',
      type: 'Exame',
      status: 'Confirmado',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Visão geral do sistema médico
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total de Pacientes
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stats.totalPatients}
            </div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Consultas Hoje
            </CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stats.todayAppointments}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center mt-1">
              <Clock className="h-3 w-3 mr-1" />
              3 pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Relatórios Pendentes
            </CardTitle>
            <FileText className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stats.pendingReports}
            </div>
            <p className="text-xs text-orange-600 flex items-center mt-1">
              <Activity className="h-3 w-3 mr-1" />
              Requer atenção
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Receita Mensal
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              R$ {stats.monthlyRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8% vs mês anterior
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesso rápido às funcionalidades principais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <Button
                  key={index}
                  onClick={action.action}
                  className={`w-full justify-start h-12 ${action.color} text-white`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">{action.title}</div>
                    <div className="text-xs opacity-90">{action.description}</div>
                  </div>
                </Button>
              )
            })}
          </CardContent>
        </Card>

        {/* Recent Appointments */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Consultas de Hoje</CardTitle>
            <CardDescription>
              Próximas consultas agendadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                      <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {appointment.patient}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {appointment.type} - {appointment.time}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        appointment.status === 'Confirmado'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onNavigate('appointments')}
              >
                Ver Todas as Consultas
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard