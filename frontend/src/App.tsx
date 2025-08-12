import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarFooter, 
  SidebarNav, 
  SidebarNavItem,
  SidebarTrigger 
} from '@/components/ui/sidebar'
import { 
  Users, 
  Calendar, 
  FileText, 
  Settings, 
  BarChart3, 
  Stethoscope, 
  Shield, 
  Package, 
  Video,
  Brain,
  Monitor,
  UserPlus,
  LogOut,
  Building2
} from 'lucide-react'

// Tipos
interface User {
  id: string
  email: string
  full_name: string
  role: string
}

interface Clinic {
  id: string
  name: string
  cnpj: string
}

// Componente de Login
const LoginForm = ({ onLogin }: { onLogin: (token: string) => void }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('username', username)
      formData.append('password', password)

      const response = await fetch('http://localhost:8000/token', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        onLogin(data.access_token)
      } else {
        setError('Credenciais inválidas')
      }
    } catch (err) {
      setError('Erro de conexão com o servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">DataClínica</CardTitle>
          <CardDescription className="text-center">
            Sistema de Gestão Clínica Profissional
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Email</Label>
              <Input
                id="username"
                type="email"
                placeholder="seu@email.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente do Dashboard Principal
const Dashboard = ({ user, onLogout }: { user: User; onLogout: () => void }) => {
  const [activeModule, setActiveModule] = useState('dashboard')

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'patients', label: 'Pacientes', icon: Users },
    { id: 'appointments', label: 'Consultas', icon: Calendar },
    { id: 'medical-records', label: 'Prontuários', icon: FileText },
    { id: 'telemedicine', label: 'Telemedicina', icon: Video },
    { id: 'stock', label: 'Estoque', icon: Package },
    { id: 'devices', label: 'Dispositivos', icon: Monitor },
    { id: 'ai-analytics', label: 'IA & Analytics', icon: Brain },
    { id: 'companions', label: 'Acompanhantes', icon: UserPlus },
    { id: 'security', label: 'Segurança LGPD', icon: Shield },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ]

  const renderContent = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardContent />
      case 'patients':
        return <PatientsModule />
      case 'appointments':
        return <AppointmentsModule />
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Módulo em Desenvolvimento</h3>
              <p className="text-muted-foreground">
                O módulo {navigationItems.find(item => item.id === activeModule)?.label} está sendo desenvolvido.
              </p>
            </div>
          </div>
        )
    }
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2">
              <Building2 className="h-6 w-6 text-primary" />
              <span className="font-semibold text-lg">DataClínica</span>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarNav>
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <SidebarNavItem
                    key={item.id}
                    isActive={activeModule === item.id}
                    onClick={() => setActiveModule(item.id)}
                    className="cursor-pointer"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </SidebarNavItem>
                )
              })}
            </SidebarNav>
          </SidebarContent>
          
          <SidebarFooter>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground px-3">
                <p className="font-medium">{user.full_name}</p>
                <p className="text-xs">{user.email}</p>
                <p className="text-xs capitalize">{user.role}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onLogout}
                className="w-full justify-start"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="dataclinica-header h-16 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-xl font-semibold">
                {navigationItems.find(item => item.id === activeModule)?.label || 'Dashboard'}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Bem-vindo, {user.full_name}
              </span>
            </div>
          </header>
          
          <main className="flex-1 overflow-auto p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

// Componente do Dashboard
const DashboardContent = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+12% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">8 pendentes, 15 concluídas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 45.231</div>
            <p className="text-xs text-muted-foreground">+8% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfação</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.5%</div>
            <p className="text-xs text-muted-foreground">Baseado em 156 avaliações</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Próximas Consultas</CardTitle>
            <CardDescription>Consultas agendadas para hoje</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Paciente {i}</p>
                    <p className="text-sm text-muted-foreground">Dr. Silva - {9 + i}:00</p>
                  </div>
                  <Button size="sm" variant="outline">Ver Detalhes</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>Últimas ações no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                'Novo paciente cadastrado',
                'Consulta finalizada - Dr. Silva',
                'Exame laboratorial recebido',
                'Prescrição médica emitida'
              ].map((activity, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-sm">{activity}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Módulo de Pacientes
const PatientsModule = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciamento de Pacientes</h2>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Novo Paciente
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Lista de Pacientes</CardTitle>
          <CardDescription>Gerencie todos os pacientes cadastrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Módulo em Desenvolvimento</h3>
            <p className="text-muted-foreground">
              O módulo completo de gerenciamento de pacientes está sendo desenvolvido.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Módulo de Consultas
const AppointmentsModule = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Agenda de Consultas</h2>
        <Button>
          <Calendar className="h-4 w-4 mr-2" />
          Nova Consulta
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Calendário de Consultas</CardTitle>
          <CardDescription>Visualize e gerencie todas as consultas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Módulo em Desenvolvimento</h3>
            <p className="text-muted-foreground">
              O sistema de agendamento de consultas está sendo desenvolvido.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente Principal da Aplicação
function App() {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      setToken(savedToken)
      fetchUserData(savedToken)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUserData = async (authToken: string) => {
    try {
      const response = await fetch('http://localhost:8000/users/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        localStorage.removeItem('token')
        setToken(null)
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error)
      localStorage.removeItem('token')
      setToken(null)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (newToken: string) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    fetchUserData(newToken)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-12 w-12 mx-auto text-primary mb-4 animate-pulse" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!token || !user) {
    return <LoginForm onLogin={handleLogin} />
  }

  return <Dashboard user={user} onLogout={handleLogout} />
}

export default App
