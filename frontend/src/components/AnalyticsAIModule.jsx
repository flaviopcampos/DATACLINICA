import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from './ui/chart'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts'

const AnalyticsAIModule = ({ addNotification, token }) => {
  const [activeTab, setActiveTab] = useState('predictions')
  const [predictions, setPredictions] = useState([])
  const [patternAnalysis, setPatternAnalysis] = useState([])
  const [riskAssessments, setRiskAssessments] = useState([])
  const [aiInsights, setAiInsights] = useState([])
  const [loading, setLoading] = useState(false)

  // Estados para formulários
  const [newPrediction, setNewPrediction] = useState({
    patient_id: '',
    prediction_type: 'readmission',
    input_data: '',
    model_version: '1.0'
  })

  const [newRiskAssessment, setNewRiskAssessment] = useState({
    patient_id: '',
    risk_type: 'cardiovascular',
    assessment_data: '',
    severity_threshold: 'medium'
  })

  const [chartData, setChartData] = useState({
    predictions: [],
    riskDistribution: [],
    accuracyTrends: []
  })

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      switch (activeTab) {
        case 'predictions':
          await fetchPredictions()
          break
        case 'patterns':
          await fetchPatternAnalysis()
          break
        case 'risks':
          await fetchRiskAssessments()
          break
        case 'insights':
          await fetchAIInsights()
          break
      }
      await fetchChartData()
    } catch (error) {
      addNotification('Erro ao carregar dados de analytics', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchPredictions = async () => {
    const response = await fetch('http://localhost:8000/analytics-ai/predictions/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.ok) {
      const data = await response.json()
      setPredictions(data)
    }
  }

  const fetchPatternAnalysis = async () => {
    const response = await fetch('http://localhost:8000/analytics-ai/pattern-analysis/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.ok) {
      const data = await response.json()
      setPatternAnalysis(data)
    }
  }

  const fetchRiskAssessments = async () => {
    const response = await fetch('http://localhost:8000/analytics-ai/risk-assessments/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.ok) {
      const data = await response.json()
      setRiskAssessments(data)
    }
  }

  const fetchAIInsights = async () => {
    const response = await fetch('http://localhost:8000/analytics-ai/ai-insights/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.ok) {
      const data = await response.json()
      setAiInsights(data)
    }
  }

  const fetchChartData = async () => {
    try {
      // Buscar dados para gráficos
      const predictionTrendsResponse = await fetch('http://localhost:8000/analytics-ai/prediction-trends/', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      const riskDistributionResponse = await fetch('http://localhost:8000/analytics-ai/risk-distribution/', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      const accuracyResponse = await fetch('http://localhost:8000/analytics-ai/model-accuracy/', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (predictionTrendsResponse.ok && riskDistributionResponse.ok && accuracyResponse.ok) {
        const predictionTrends = await predictionTrendsResponse.json()
        const riskDistribution = await riskDistributionResponse.json()
        const accuracy = await accuracyResponse.json()
        
        setChartData({
          predictions: predictionTrends,
          riskDistribution: riskDistribution,
          accuracyTrends: accuracy
        })
      }
    } catch (error) {
      console.error('Erro ao buscar dados dos gráficos:', error)
    }
  }

  const handleCreatePrediction = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8000/analytics-ai/predictions/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newPrediction,
          input_data: JSON.parse(newPrediction.input_data || '{}')
        })
      })
      
      if (response.ok) {
        addNotification('Predição criada com sucesso!', 'success')
        setNewPrediction({
          patient_id: '',
          prediction_type: 'readmission',
          input_data: '',
          model_version: '1.0'
        })
        fetchPredictions()
      } else {
        addNotification('Erro ao criar predição', 'error')
      }
    } catch (error) {
      addNotification('Erro ao criar predição', 'error')
    }
  }

  const handleCreateRiskAssessment = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8000/analytics-ai/risk-assessments/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newRiskAssessment,
          assessment_data: JSON.parse(newRiskAssessment.assessment_data || '{}')
        })
      })
      
      if (response.ok) {
        addNotification('Avaliação de risco criada com sucesso!', 'success')
        setNewRiskAssessment({
          patient_id: '',
          risk_type: 'cardiovascular',
          assessment_data: '',
          severity_threshold: 'medium'
        })
        fetchRiskAssessments()
      } else {
        addNotification('Erro ao criar avaliação de risco', 'error')
      }
    } catch (error) {
      addNotification('Erro ao criar avaliação de risco', 'error')
    }
  }

  const runPatternAnalysis = async (patientId) => {
    try {
      const response = await fetch(`http://localhost:8000/analytics-ai/pattern-analysis/${patientId}/run`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        addNotification('Análise de padrões iniciada!', 'success')
        fetchPatternAnalysis()
      } else {
        addNotification('Erro ao executar análise de padrões', 'error')
      }
    } catch (error) {
      addNotification('Erro ao executar análise de padrões', 'error')
    }
  }

  const renderPredictions = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Nova Predição</CardTitle>
            <CardDescription>Criar uma nova predição usando IA</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreatePrediction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">ID do Paciente</label>
                <input
                  type="number"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newPrediction.patient_id}
                  onChange={(e) => setNewPrediction({...newPrediction, patient_id: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Predição</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newPrediction.prediction_type}
                  onChange={(e) => setNewPrediction({...newPrediction, prediction_type: e.target.value})}
                >
                  <option value="readmission">Readmissão</option>
                  <option value="mortality">Mortalidade</option>
                  <option value="length_of_stay">Tempo de Internação</option>
                  <option value="complications">Complicações</option>
                  <option value="treatment_response">Resposta ao Tratamento</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Dados de Entrada (JSON)</label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded"
                  rows="4"
                  placeholder='{"age": 65, "diagnosis": "diabetes", "vital_signs": {...}}'
                  value={newPrediction.input_data}
                  onChange={(e) => setNewPrediction({...newPrediction, input_data: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Versão do Modelo</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newPrediction.model_version}
                  onChange={(e) => setNewPrediction({...newPrediction, model_version: e.target.value})}
                >
                  <option value="1.0">v1.0 - Modelo Base</option>
                  <option value="1.1">v1.1 - Modelo Aprimorado</option>
                  <option value="2.0">v2.0 - Modelo Avançado</option>
                </select>
              </div>
              <button type="submit" className="btn-primary w-full">Gerar Predição</button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tendências de Predições</CardTitle>
            <CardDescription>Evolução das predições ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.predictions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line type="monotone" dataKey="readmission" stroke="#8884d8" name="Readmissão" />
                  <Line type="monotone" dataKey="mortality" stroke="#82ca9d" name="Mortalidade" />
                  <Line type="monotone" dataKey="complications" stroke="#ffc658" name="Complicações" />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Predições Recentes</CardTitle>
          <CardDescription>Últimas predições geradas pelo sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Paciente</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Tipo</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Resultado</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Confiança</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Data</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((prediction) => (
                  <tr key={prediction.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">{prediction.patient_name}</td>
                    <td className="border border-gray-300 px-4 py-2">{prediction.prediction_type}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        prediction.result === 'high_risk' ? 'bg-red-100 text-red-800' :
                        prediction.result === 'medium_risk' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {prediction.result}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{(prediction.confidence * 100).toFixed(1)}%</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {new Date(prediction.created_at).toLocaleString('pt-BR')}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="space-x-2">
                        <button className="btn-small btn-primary">Detalhes</button>
                        <button className="btn-small btn-secondary">Exportar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderPatterns = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Análise de Padrões</CardTitle>
          <CardDescription>Identificação de padrões em dados clínicos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex gap-4">
              <input
                type="number"
                placeholder="ID do Paciente"
                className="p-2 border border-gray-300 rounded"
                id="patternPatientId"
              />
              <button 
                className="btn-primary"
                onClick={() => {
                  const patientId = document.getElementById('patternPatientId').value
                  if (patientId) runPatternAnalysis(patientId)
                }}
              >
                Executar Análise
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patternAnalysis.map((pattern) => (
              <Card key={pattern.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{pattern.pattern_type}</CardTitle>
                  <CardDescription>Paciente: {pattern.patient_name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm"><strong>Padrão:</strong> {pattern.pattern_description}</p>
                    <p className="text-sm"><strong>Frequência:</strong> {pattern.frequency}</p>
                    <p className="text-sm"><strong>Significância:</strong> 
                      <span className={`ml-1 px-2 py-1 rounded text-xs ${
                        pattern.significance === 'high' ? 'bg-red-100 text-red-800' :
                        pattern.significance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {pattern.significance}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">{pattern.insights}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderRisks = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Nova Avaliação de Risco</CardTitle>
            <CardDescription>Avaliar riscos usando IA</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateRiskAssessment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">ID do Paciente</label>
                <input
                  type="number"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newRiskAssessment.patient_id}
                  onChange={(e) => setNewRiskAssessment({...newRiskAssessment, patient_id: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Risco</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newRiskAssessment.risk_type}
                  onChange={(e) => setNewRiskAssessment({...newRiskAssessment, risk_type: e.target.value})}
                >
                  <option value="cardiovascular">Cardiovascular</option>
                  <option value="diabetes">Diabetes</option>
                  <option value="infection">Infecção</option>
                  <option value="surgical">Cirúrgico</option>
                  <option value="medication">Medicamentoso</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Dados de Avaliação (JSON)</label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded"
                  rows="4"
                  placeholder='{"blood_pressure": "140/90", "cholesterol": 250, "smoking": true}'
                  value={newRiskAssessment.assessment_data}
                  onChange={(e) => setNewRiskAssessment({...newRiskAssessment, assessment_data: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Limiar de Severidade</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newRiskAssessment.severity_threshold}
                  onChange={(e) => setNewRiskAssessment({...newRiskAssessment, severity_threshold: e.target.value})}
                >
                  <option value="low">Baixo</option>
                  <option value="medium">Médio</option>
                  <option value="high">Alto</option>
                  <option value="critical">Crítico</option>
                </select>
              </div>
              <button type="submit" className="btn-primary w-full">Avaliar Risco</button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Riscos</CardTitle>
            <CardDescription>Distribuição dos níveis de risco</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.riskDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Avaliações de Risco Recentes</CardTitle>
          <CardDescription>Últimas avaliações realizadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Paciente</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Tipo de Risco</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Nível</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Score</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Data</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {riskAssessments.map((assessment) => (
                  <tr key={assessment.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">{assessment.patient_name}</td>
                    <td className="border border-gray-300 px-4 py-2">{assessment.risk_type}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        assessment.risk_level === 'critical' ? 'bg-red-100 text-red-800' :
                        assessment.risk_level === 'high' ? 'bg-orange-100 text-orange-800' :
                        assessment.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {assessment.risk_level}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{assessment.risk_score.toFixed(2)}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {new Date(assessment.created_at).toLocaleString('pt-BR')}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="space-x-2">
                        <button className="btn-small btn-primary">Ver Detalhes</button>
                        <button className="btn-small btn-secondary">Reavaliar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderInsights = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Precisão dos Modelos</CardTitle>
          <CardDescription>Evolução da precisão dos modelos de IA</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.accuracyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="model" />
                <YAxis domain={[0, 100]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="accuracy" fill="#8884d8" name="Precisão (%)" />
                <Bar dataKey="recall" fill="#82ca9d" name="Recall (%)" />
                <Bar dataKey="f1_score" fill="#ffc658" name="F1-Score (%)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {aiInsights.map((insight) => (
          <Card key={insight.id}>
            <CardHeader>
              <CardTitle className="text-lg">{insight.insight_type}</CardTitle>
              <CardDescription>Gerado em {new Date(insight.created_at).toLocaleDateString('pt-BR')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium">{insight.title}</p>
                <p className="text-sm text-gray-600">{insight.description}</p>
                <div className="flex justify-between items-center">
                  <span className={`px-2 py-1 rounded text-xs ${
                    insight.priority === 'high' ? 'bg-red-100 text-red-800' :
                    insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {insight.priority}
                  </span>
                  <span className="text-xs text-gray-500">Confiança: {(insight.confidence * 100).toFixed(0)}%</span>
                </div>
                {insight.recommendations && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-700">Recomendações:</p>
                    <ul className="text-xs text-gray-600 list-disc list-inside">
                      {insight.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  return (
    <div className="analytics-ai-module">
      <div className="module-header">
        <h2>Analytics e IA</h2>
        <p>Análises preditivas e insights baseados em inteligência artificial</p>
      </div>

      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'predictions' ? 'active' : ''}`}
          onClick={() => setActiveTab('predictions')}
        >
          Predições
        </button>
        <button 
          className={`tab-button ${activeTab === 'patterns' ? 'active' : ''}`}
          onClick={() => setActiveTab('patterns')}
        >
          Análise de Padrões
        </button>
        <button 
          className={`tab-button ${activeTab === 'risks' ? 'active' : ''}`}
          onClick={() => setActiveTab('risks')}
        >
          Avaliação de Riscos
        </button>
        <button 
          className={`tab-button ${activeTab === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveTab('insights')}
        >
          Insights de IA
        </button>
      </div>

      <div className="tab-content">
        {loading && <div className="loading-spinner">Carregando...</div>}
        {activeTab === 'predictions' && renderPredictions()}
        {activeTab === 'patterns' && renderPatterns()}
        {activeTab === 'risks' && renderRisks()}
        {activeTab === 'insights' && renderInsights()}
      </div>
    </div>
  )
}

export default AnalyticsAIModule