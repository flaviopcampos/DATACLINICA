import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card'

const TechnicalExtrasModule = ({ addNotification, token }) => {
  const [activeTab, setActiveTab] = useState('integrations')
  const [loading, setLoading] = useState(false)

  // Estados para Integrações Externas
  const [integrations, setIntegrations] = useState([])
  const [newIntegration, setNewIntegration] = useState({
    name: '',
    type: 'api',
    endpoint_url: '',
    auth_type: 'bearer',
    credentials: {},
    settings: {}
  })

  // Estados para Configuração de Tenant
  const [tenantConfig, setTenantConfig] = useState({
    company_name: '',
    logo_url: '',
    primary_color: '#3B82F6',
    secondary_color: '#10B981',
    timezone: 'America/Sao_Paulo',
    language: 'pt-BR',
    features: [],
    limits: {
      max_users: 100,
      max_patients: 10000,
      storage_gb: 50
    }
  })

  // Estados para Notificações do Sistema
  const [notifications, setNotifications] = useState([])

  // Estados para Feature Flags
  const [featureFlags, setFeatureFlags] = useState([])
  const [newFeatureFlag, setNewFeatureFlag] = useState({
    name: '',
    description: '',
    enabled: false,
    conditions: {}
  })

  // Estados para Métricas do Sistema
  const [systemMetrics, setSystemMetrics] = useState({
    cpu_usage: 0,
    memory_usage: 0,
    disk_usage: 0,
    active_users: 0,
    api_requests_per_minute: 0,
    database_connections: 0,
    response_time_avg: 0
  })
  const [metricsHistory, setMetricsHistory] = useState([])

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      switch (activeTab) {
        case 'integrations':
          await fetchIntegrations()
          break
        case 'tenant':
          await fetchTenantConfig()
          break
        case 'notifications':
          await fetchNotifications()
          break
        case 'features':
          await fetchFeatureFlags()
          break
        case 'metrics':
          await fetchSystemMetrics()
          await fetchMetricsDashboard()
          break
      }
    } catch (error) {
      addNotification('Erro ao carregar dados técnicos', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchIntegrations = async () => {
    const response = await fetch('http://localhost:8000/integrations/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.ok) {
      const data = await response.json()
      setIntegrations(data)
    }
  }

  const fetchTenantConfig = async () => {
    const response = await fetch('http://localhost:8000/tenant/configuration', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.ok) {
      const data = await response.json()
      setTenantConfig(data)
    }
  }

  const fetchNotifications = async () => {
    const response = await fetch('http://localhost:8000/notifications/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.ok) {
      const data = await response.json()
      setNotifications(data)
    }
  }

  const fetchFeatureFlags = async () => {
    const response = await fetch('http://localhost:8000/features/flags', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.ok) {
      const data = await response.json()
      setFeatureFlags(data)
    }
  }

  const fetchSystemMetrics = async () => {
    const response = await fetch('http://localhost:8000/admin/metrics', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.ok) {
      const data = await response.json()
      setSystemMetrics(data)
    }
  }

  const fetchMetricsDashboard = async () => {
    const response = await fetch('http://localhost:8000/admin/metrics/dashboard', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.ok) {
      const data = await response.json()
      setMetricsHistory(data.history || [])
    }
  }

  const createIntegration = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8000/integrations/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newIntegration)
      })
      
      if (response.ok) {
        addNotification('Integração criada com sucesso!', 'success')
        setNewIntegration({
          name: '',
          type: 'api',
          endpoint_url: '',
          auth_type: 'bearer',
          credentials: {},
          settings: {}
        })
        fetchIntegrations()
      } else {
        addNotification('Erro ao criar integração', 'error')
      }
    } catch (error) {
      addNotification('Erro ao criar integração', 'error')
    }
  }

  const syncIntegration = async (integrationId) => {
    try {
      const response = await fetch(`http://localhost:8000/integrations/${integrationId}/sync`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        addNotification('Sincronização iniciada!', 'success')
        fetchIntegrations()
      } else {
        addNotification('Erro ao sincronizar integração', 'error')
      }
    } catch (error) {
      addNotification('Erro ao sincronizar integração', 'error')
    }
  }

  const updateTenantConfig = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8000/tenant/configuration', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tenantConfig)
      })
      
      if (response.ok) {
        addNotification('Configuração atualizada com sucesso!', 'success')
      } else {
        addNotification('Erro ao atualizar configuração', 'error')
      }
    } catch (error) {
      addNotification('Erro ao atualizar configuração', 'error')
    }
  }

  const markNotificationAsRead = async (notificationId) => {
    try {
      const response = await fetch(`http://localhost:8000/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        addNotification('Notificação marcada como lida', 'success')
        fetchNotifications()
      } else {
        addNotification('Erro ao marcar notificação', 'error')
      }
    } catch (error) {
      addNotification('Erro ao marcar notificação', 'error')
    }
  }

  const checkFeatureFlag = async (flagName) => {
    try {
      const response = await fetch(`http://localhost:8000/features/flags/${flagName}/enabled`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        addNotification(`Feature '${flagName}' está ${data.enabled ? 'habilitada' : 'desabilitada'}`, 'info')
      }
    } catch (error) {
      addNotification('Erro ao verificar feature flag', 'error')
    }
  }

  const renderIntegrations = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Nova Integração Externa</CardTitle>
          <CardDescription>Configurar uma nova integração com sistema externo</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={createIntegration} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome da Integração</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newIntegration.name}
                  onChange={(e) => setNewIntegration({...newIntegration, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newIntegration.type}
                  onChange={(e) => setNewIntegration({...newIntegration, type: e.target.value})}
                >
                  <option value="api">API REST</option>
                  <option value="webhook">Webhook</option>
                  <option value="database">Banco de Dados</option>
                  <option value="file">Arquivo</option>
                  <option value="email">Email</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">URL do Endpoint</label>
              <input
                type="url"
                className="w-full p-2 border border-gray-300 rounded"
                value={newIntegration.endpoint_url}
                onChange={(e) => setNewIntegration({...newIntegration, endpoint_url: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de Autenticação</label>
              <select
                className="w-full p-2 border border-gray-300 rounded"
                value={newIntegration.auth_type}
                onChange={(e) => setNewIntegration({...newIntegration, auth_type: e.target.value})}
              >
                <option value="bearer">Bearer Token</option>
                <option value="basic">Basic Auth</option>
                <option value="api_key">API Key</option>
                <option value="oauth2">OAuth 2.0</option>
                <option value="none">Nenhuma</option>
              </select>
            </div>
            <button type="submit" className="btn-primary">Criar Integração</button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integrações Ativas</CardTitle>
          <CardDescription>Suas integrações configuradas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {integrations.map((integration) => (
              <div key={integration.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{integration.name}</h4>
                      <span className={`px-2 py-1 rounded text-xs ${
                        integration.status === 'active' ? 'bg-green-100 text-green-800' :
                        integration.status === 'error' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {integration.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      Tipo: {integration.type}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      Endpoint: {integration.endpoint_url}
                    </p>
                    <p className="text-sm text-gray-600">
                      Última sincronização: {integration.last_sync ? new Date(integration.last_sync).toLocaleString('pt-BR') : 'Nunca'}
                    </p>
                  </div>
                  <div className="space-x-2">
                    <button 
                      className="btn-small btn-primary"
                      onClick={() => syncIntegration(integration.id)}
                    >
                      Sincronizar
                    </button>
                    <button className="btn-small btn-secondary">
                      Configurar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderTenantConfig = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuração do Tenant</CardTitle>
          <CardDescription>Configurações gerais da organização</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={updateTenantConfig} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome da Empresa</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={tenantConfig.company_name}
                  onChange={(e) => setTenantConfig({...tenantConfig, company_name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URL do Logo</label>
                <input
                  type="url"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={tenantConfig.logo_url}
                  onChange={(e) => setTenantConfig({...tenantConfig, logo_url: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Cor Primária</label>
                <input
                  type="color"
                  className="w-full p-2 border border-gray-300 rounded h-10"
                  value={tenantConfig.primary_color}
                  onChange={(e) => setTenantConfig({...tenantConfig, primary_color: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cor Secundária</label>
                <input
                  type="color"
                  className="w-full p-2 border border-gray-300 rounded h-10"
                  value={tenantConfig.secondary_color}
                  onChange={(e) => setTenantConfig({...tenantConfig, secondary_color: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Fuso Horário</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded"
                  value={tenantConfig.timezone}
                  onChange={(e) => setTenantConfig({...tenantConfig, timezone: e.target.value})}
                >
                  <option value="America/Sao_Paulo">América/São Paulo</option>
                  <option value="America/New_York">América/Nova York</option>
                  <option value="Europe/London">Europa/Londres</option>
                  <option value="Asia/Tokyo">Ásia/Tóquio</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Idioma</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded"
                  value={tenantConfig.language}
                  onChange={(e) => setTenantConfig({...tenantConfig, language: e.target.value})}
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (US)</option>
                  <option value="es-ES">Español</option>
                  <option value="fr-FR">Français</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Limites do Sistema</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Máximo de Usuários</label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={tenantConfig.limits.max_users}
                    onChange={(e) => setTenantConfig({
                      ...tenantConfig,
                      limits: {...tenantConfig.limits, max_users: parseInt(e.target.value)}
                    })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Máximo de Pacientes</label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={tenantConfig.limits.max_patients}
                    onChange={(e) => setTenantConfig({
                      ...tenantConfig,
                      limits: {...tenantConfig.limits, max_patients: parseInt(e.target.value)}
                    })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Armazenamento (GB)</label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={tenantConfig.limits.storage_gb}
                    onChange={(e) => setTenantConfig({
                      ...tenantConfig,
                      limits: {...tenantConfig.limits, storage_gb: parseInt(e.target.value)}
                    })}
                  />
                </div>
              </div>
            </div>
            <button type="submit" className="btn-primary">Salvar Configurações</button>
          </form>
        </CardContent>
      </Card>
    </div>
  )

  const renderNotifications = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notificações do Sistema</CardTitle>
          <CardDescription>Notificações e alertas do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id} className={`p-4 border rounded-lg ${
                notification.is_read ? 'bg-gray-50' : 'bg-white border-blue-200'
              }`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{notification.title}</h4>
                      <span className={`px-2 py-1 rounded text-xs ${
                        notification.type === 'error' ? 'bg-red-100 text-red-800' :
                        notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        notification.type === 'success' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {notification.type}
                      </span>
                      {!notification.is_read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(notification.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    {!notification.is_read && (
                      <button 
                        className="btn-small btn-secondary"
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        Marcar como Lida
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderFeatureFlags = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Feature Flags</CardTitle>
          <CardDescription>Controle de funcionalidades do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {featureFlags.map((flag) => (
              <div key={flag.name} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{flag.name}</h4>
                      <span className={`px-2 py-1 rounded text-xs ${
                        flag.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {flag.enabled ? 'Habilitada' : 'Desabilitada'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{flag.description}</p>
                    <p className="text-xs text-gray-500">
                      Atualizada em: {new Date(flag.updated_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="space-x-2">
                    <button 
                      className="btn-small btn-secondary"
                      onClick={() => checkFeatureFlag(flag.name)}
                    >
                      Verificar Status
                    </button>
                    <button className="btn-small btn-primary">
                      Configurar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderMetrics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">{systemMetrics.cpu_usage}%</h3>
              <p className="text-sm text-gray-600">CPU</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">{systemMetrics.memory_usage}%</h3>
              <p className="text-sm text-gray-600">Memória</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">{systemMetrics.active_users}</h3>
              <p className="text-sm text-gray-600">Usuários Ativos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">{systemMetrics.response_time_avg}ms</h3>
              <p className="text-sm text-gray-600">Tempo de Resposta</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Métricas Detalhadas</CardTitle>
          <CardDescription>Informações detalhadas do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-4">Recursos do Sistema</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Uso de CPU:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{width: `${systemMetrics.cpu_usage}%`}}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{systemMetrics.cpu_usage}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Uso de Memória:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{width: `${systemMetrics.memory_usage}%`}}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{systemMetrics.memory_usage}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Uso de Disco:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-600 h-2 rounded-full" 
                        style={{width: `${systemMetrics.disk_usage}%`}}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{systemMetrics.disk_usage}%</span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-4">Atividade do Sistema</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Usuários Ativos:</span>
                  <span className="text-sm font-medium">{systemMetrics.active_users}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Requisições/min:</span>
                  <span className="text-sm font-medium">{systemMetrics.api_requests_per_minute}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Conexões DB:</span>
                  <span className="text-sm font-medium">{systemMetrics.database_connections}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tempo Resposta Médio:</span>
                  <span className="text-sm font-medium">{systemMetrics.response_time_avg}ms</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="technical-extras-module">
      <div className="module-header">
        <h2>Extras Técnicos</h2>
        <p>Configurações avançadas e monitoramento do sistema</p>
      </div>

      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'integrations' ? 'active' : ''}`}
          onClick={() => setActiveTab('integrations')}
        >
          Integrações
        </button>
        <button 
          className={`tab-button ${activeTab === 'tenant' ? 'active' : ''}`}
          onClick={() => setActiveTab('tenant')}
        >
          Configuração
        </button>
        <button 
          className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          Notificações
        </button>
        <button 
          className={`tab-button ${activeTab === 'features' ? 'active' : ''}`}
          onClick={() => setActiveTab('features')}
        >
          Feature Flags
        </button>
        <button 
          className={`tab-button ${activeTab === 'metrics' ? 'active' : ''}`}
          onClick={() => setActiveTab('metrics')}
        >
          Métricas
        </button>
      </div>

      <div className="tab-content">
        {loading && <div className="loading-spinner">Carregando...</div>}
        {activeTab === 'integrations' && renderIntegrations()}
        {activeTab === 'tenant' && renderTenantConfig()}
        {activeTab === 'notifications' && renderNotifications()}
        {activeTab === 'features' && renderFeatureFlags()}
        {activeTab === 'metrics' && renderMetrics()}
      </div>
    </div>
  )
}

export default TechnicalExtrasModule