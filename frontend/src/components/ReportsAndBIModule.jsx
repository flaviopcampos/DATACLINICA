import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from './ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

const ReportsAndBIModule = ({ addNotification, token }) => {
  const [activeTab, setActiveTab] = useState('performance-metrics')
  const [performanceMetrics, setPerformanceMetrics] = useState([])
  const [biAlerts, setBiAlerts] = useState([])
  const [executionHistory, setExecutionHistory] = useState([])
  const [dashboardData, setDashboardData] = useState({})
  const [loading, setLoading] = useState(false)

  const chartConfig = {
    patients: {
      label: "Pacientes",
      color: "hsl(var(--chart-1))",
    },
    revenue: {
      label: "Receita",
      color: "hsl(var(--chart-2))",
    },
    appointments: {
      label: "Consultas",
      color: "hsl(var(--chart-3))",
    },
    occupancy: {
      label: "Ocupação",
      color: "hsl(var(--chart-4))",
    }
  }

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      switch (activeTab) {
        case 'performance-metrics':
          await fetchPerformanceMetrics()
          break
        case 'bi-alerts':
          await fetchBIAlerts()
          break
        case 'execution-history':
          await fetchExecutionHistory()
          break
        case 'dashboard':
          await fetchDashboardData()
          break
      }
    } catch (error) {
      addNotification('Erro ao carregar dados dos relatórios', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchPerformanceMetrics = async () => {
    const response = await fetch('http://localhost:8000/reports/performance-metrics/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.ok) {
      const data = await response.json()
      setPerformanceMetrics(data)
    }
  }

  const fetchBIAlerts = async () => {
    const response = await fetch('http://localhost:8000/reports/bi-alerts/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.ok) {
      const data = await response.json()
      setBiAlerts(data)
    }
  }

  const fetchExecutionHistory = async () => {
    const response = await fetch('http://localhost:8000/reports/execution-history/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.ok) {
      const data = await response.json()
      setExecutionHistory(data)
    }
  }

  const fetchDashboardData = async () => {
    const response = await fetch('http://localhost:8000/reports/dashboard-summary/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.ok) {
      const data = await response.json()
      setDashboardData(data)
    }
  }

  const generateReport = async (reportType) => {
    try {
      const response = await fetch(`http://localhost:8000/reports/generate/${reportType}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        addNotification(`Relatório ${reportType} gerado com sucesso!`, 'success')
        fetchData()
      } else {
        addNotification('Erro ao gerar relatório', 'error')
      }
    } catch (error) {
      addNotification('Erro ao gerar relatório', 'error')
    }
  }

  const renderPerformanceMetrics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total de Pacientes</CardTitle>
            <CardDescription>Pacientes ativos no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.total_patients || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{dashboardData.new_patients_this_month || 0} este mês
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Consultas Hoje</CardTitle>
            <CardDescription>Agendamentos para hoje</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.appointments_today || 0}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.completed_today || 0} concluídas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Receita Mensal</CardTitle>
            <CardDescription>Faturamento do mês atual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {(dashboardData.monthly_revenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              +{dashboardData.revenue_growth || 0}% vs mês anterior
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Taxa de Ocupação</CardTitle>
            <CardDescription>Ocupação média dos leitos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.occupancy_rate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.available_beds || 0} leitos disponíveis
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Consultas por Mês</CardTitle>
            <CardDescription>Evolução mensal de consultas</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart data={performanceMetrics.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="appointments" fill="var(--color-appointments)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Receita por Mês</CardTitle>
            <CardDescription>Evolução da receita mensal</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <LineChart data={performanceMetrics.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderBIAlerts = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Alertas de Business Intelligence</h3>
        <button 
          className="btn-primary"
          onClick={() => generateReport('bi-alerts')}
        >
          Atualizar Alertas
        </button>
      </div>
      
      <div className="grid gap-4">
        {biAlerts.map((alert, index) => (
          <Card key={index} className={`border-l-4 ${
            alert.severity === 'high' ? 'border-l-red-500' :
            alert.severity === 'medium' ? 'border-l-yellow-500' :
            'border-l-blue-500'
          }`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {alert.title}
                <span className={`px-2 py-1 rounded text-xs ${
                  alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                  alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {alert.severity}
                </span>
              </CardTitle>
              <CardDescription>{alert.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{alert.message}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Gerado em: {new Date(alert.created_at).toLocaleString('pt-BR')}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderExecutionHistory = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Histórico de Execuções</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-4 py-2 text-left">Relatório</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Executado em</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Duração</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Usuário</th>
            </tr>
          </thead>
          <tbody>
            {executionHistory.map((execution, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">{execution.report_name}</td>
                <td className="border border-gray-300 px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    execution.status === 'completed' ? 'bg-green-100 text-green-800' :
                    execution.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {execution.status}
                  </span>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {new Date(execution.executed_at).toLocaleString('pt-BR')}
                </td>
                <td className="border border-gray-300 px-4 py-2">{execution.duration}s</td>
                <td className="border border-gray-300 px-4 py-2">{execution.user_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Dashboard Executivo</h3>
        <div className="space-x-2">
          <button 
            className="btn-secondary"
            onClick={() => generateReport('financial')}
          >
            Relatório Financeiro
          </button>
          <button 
            className="btn-secondary"
            onClick={() => generateReport('operational')}
          >
            Relatório Operacional
          </button>
          <button 
            className="btn-primary"
            onClick={() => generateReport('executive')}
          >
            Relatório Executivo
          </button>
        </div>
      </div>
      
      {renderPerformanceMetrics()}
    </div>
  )

  return (
    <div className="reports-bi-module">
      <div className="module-header">
        <h2>Relatórios e Business Intelligence</h2>
        <p>Análise de dados e métricas de performance da clínica</p>
      </div>

      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={`tab-button ${activeTab === 'performance-metrics' ? 'active' : ''}`}
          onClick={() => setActiveTab('performance-metrics')}
        >
          Métricas de Performance
        </button>
        <button 
          className={`tab-button ${activeTab === 'bi-alerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('bi-alerts')}
        >
          Alertas BI
        </button>
        <button 
          className={`tab-button ${activeTab === 'execution-history' ? 'active' : ''}`}
          onClick={() => setActiveTab('execution-history')}
        >
          Histórico
        </button>
      </div>

      <div className="tab-content">
        {loading && <div className="loading-spinner">Carregando...</div>}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'performance-metrics' && renderPerformanceMetrics()}
        {activeTab === 'bi-alerts' && renderBIAlerts()}
        {activeTab === 'execution-history' && renderExecutionHistory()}
      </div>
    </div>
  )
}

export default ReportsAndBIModule