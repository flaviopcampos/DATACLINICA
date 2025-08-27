import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Users,
  Calendar,
  DollarSign,
  Activity,
  TrendingUp,
  Clock,
  UserPlus,
  CalendarDays
} from 'lucide-react'

const stats = [
  {
    title: 'Total de Pacientes',
    value: '1,234',
    change: '+12%',
    changeType: 'positive' as const,
    icon: Users,
    description: 'Em relação ao mês passado'
  },
  {
    title: 'Consultas Hoje',
    value: '23',
    change: '+5',
    changeType: 'positive' as const,
    icon: Calendar,
    description: 'Agendadas para hoje'
  },
  {
    title: 'Receita Mensal',
    value: 'R$ 45.231',
    change: '+8%',
    changeType: 'positive' as const,
    icon: DollarSign,
    description: 'Faturamento do mês'
  },
  {
    title: 'Taxa de Ocupação',
    value: '87%',
    change: '-2%',
    changeType: 'negative' as const,
    icon: Activity,
    description: 'Média semanal'
  }
]

const recentAppointments = [
  {
    id: 1,
    patient: 'Maria Silva',
    time: '09:00',
    type: 'Consulta',
    status: 'confirmed'
  },
  {
    id: 2,
    patient: 'João Santos',
    time: '10:30',
    type: 'Retorno',
    status: 'confirmed'
  },
  {
    id: 3,
    patient: 'Ana Costa',
    time: '14:00',
    type: 'Exame',
    status: 'pending'
  },
  {
    id: 4,
    patient: 'Pedro Lima',
    time: '15:30',
    type: 'Consulta',
    status: 'confirmed'
  }
]

const recentActivities = [
  {
    id: 1,
    action: 'Novo paciente cadastrado',
    patient: 'Carlos Oliveira',
    time: '2 horas atrás',
    icon: UserPlus
  },
  {
    id: 2,
    action: 'Consulta finalizada',
    patient: 'Lucia Ferreira',
    time: '3 horas atrás',
    icon: Calendar
  },
  {
    id: 3,
    action: 'Agendamento confirmado',
    patient: 'Roberto Silva',
    time: '5 horas atrás',
    icon: CalendarDays
  }
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Bem-vindo de volta! Aqui está um resumo da sua clínica.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                  <Badge 
                    variant={stat.changeType === 'positive' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {stat.change}
                  </Badge>
                  <span>{stat.description}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Consultas de Hoje</span>
            </CardTitle>
            <CardDescription>
              Próximas consultas agendadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full">
                      <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {appointment.patient}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {appointment.time} - {appointment.type}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}
                  >
                    {appointment.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full">
                Ver todas as consultas
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Atividades Recentes</span>
            </CardTitle>
            <CardDescription>
              Últimas atividades na clínica
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const Icon = activity.icon
                return (
                  <div key={activity.id} className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full">
                      <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {activity.patient} • {activity.time}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full">
                Ver todas as atividades
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}