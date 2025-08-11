import React, { useState, useEffect } from 'react'

const SystemConfigurationModule = ({ addNotification, token }) => {
  const [activeTab, setActiveTab] = useState('integrations')
  const [integrations, setIntegrations] = useState([])
  const [tenantConfig, setTenantConfig] = useState({})
  const [notifications, setNotifications] = useState([])
  const [featureFlags, setFeatureFlags] = useState([])
  const [systemMetrics, setSystemMetrics] = useState({})
  const [loading, setLoading] = useState(false)

  // Estados para formulários
  const [newIntegration, setNewIntegration] = useState({
    name: '',
    integration_type: 'api',
    endpoint_url: '',
    api_key: '',
    configuration: '{}',
    is_active: true
  })

  const [configUpdate, setConfigUpdate] = useState({
    max_users: '',
    storage_limit_gb: '',
    features_enabled: '',
    custom_branding: '{}'
  })

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
        case 'tenant-config':
          await fetchTenantConfig()
          break
        case 'notifications':
          await fetchNotifications()
          break
        case 'feature-flags':
          await fetchFeatureFlags()
          break
        case 'metrics':
          await fetchSystemMetrics()
          break
      }
    } catch (error) {
      addNotification('Erro ao carregar dados', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchIntegrations = async () => {
    const response = await fetch('http://localhost:8000/external-integrations/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.ok) {
      const data = await response.json()
      setIntegrations(data)
    }
  }

  const fetchTenantConfig = async () => {
    const response = await fetch('http://localhost:8000/tenant-configuration/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.ok) {
      const data = await response.json()
      setTenantConfig(data)
      setConfigUpdate({
        max_users: data.max_users || '',
        storage_limit_gb: data.storage_limit_gb || '',
        features_enabled: data.features_enabled || '',
        custom_branding: JSON.stringify(data.custom_branding || {})
      })
    }
  }

  const fetchNotifications = async () => {
    const response = await fetch('http://localhost:8000/system-notifications/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.ok) {
      const data = await response.json()
      setNotifications(data)
    }
  }

  const fetchFeatureFlags = async () => {
    const response = await fetch('http://localhost:8000/feature-flags/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.ok) {
      const data = await response.json()
      setFeatureFlags(data)
    }
  }

  const fetchSystemMetrics = async () => {
    const response = await fetch('http://localhost:8000/system-metrics/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.ok) {
      const data = await response.json()
      setSystemMetrics(data)
    }
  }

  const handleCreateIntegration = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8000/external-integrations/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newIntegration,
          configuration: JSON.parse(newIntegration.configuration)
        })
      })
      
      if (response.ok) {
        addNotification('Integração criada com sucesso!', 'success')
        setNewIntegration({
          name: '',
          integration_type: 'api',
          endpoint_url: '',
          api_key: '',
          configuration: '{}',
          is_active: true
        })
        fetchIntegrations()
      } else {
        addNotification('Erro ao criar integração', 'error')
      }
    } catch (error) {
      addNotification('Erro ao criar integração', 'error')
    }
  }

  const handleSyncIntegration = async (integrationId) => {
    try {
      const response = await fetch(`http://localhost:8000/external-integrations/${integrationId}/sync`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        addNotification('Sincronização iniciada com sucesso!', 'success')
        fetchIntegrations()
      } else {
        addNotification('Erro ao iniciar sincronização', 'error')
      }
    } catch (error) {
      addNotification('Erro ao iniciar sincronização', 'error')
    }
  }

  const handleUpdateTenantConfig = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8000/tenant-configuration/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...configUpdate,
          custom_branding: JSON.parse(configUpdate.custom_branding)
        })
      })
      
      if (response.ok) {
        addNotification('Configuração atualizada com sucesso!', 'success')
        fetchTenantConfig()
      } else {
        addNotification('Erro ao atualizar configuração', 'error')
      }
    } catch (error) {
      addNotification('Erro ao atualizar configuração', 'error')
    }
  }

  const handleMarkNotificationAsRead = async (notificationId) => {
    try {
      const response = await fetch(`http://localhost:8000/system-notifications/${notificationId}/read`, {
        method: 'POST',
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

  const renderIntegrations = () => (
    <div className="tab-content">
      <h3>🔗 Integrações Externas</h3>
      
      <form onSubmit={handleCreateIntegration} className="form-section">
        <h4>Nova Integração</h4>
        <div className="form-grid">
          <input
            type="text"
            placeholder="Nome da Integração"
            value={newIntegration.name}
            onChange={(e) => setNewIntegration({...newIntegration, name: e.target.value})}
            required
          />
          <select
            value={newIntegration.integration_type}
            onChange={(e) => setNewIntegration({...newIntegration, integration_type: e.target.value})}
            required
          >
            <option value="api">API</option>
            <option value="webhook">Webhook</option>
            <option value="database">Database</option>
            <option value="file_transfer">Transferência de Arquivo</option>
          </select>
          <input
            type="url"
            placeholder="URL do Endpoint"
            value={newIntegration.endpoint_url}
            onChange={(e) => setNewIntegration({...newIntegration, endpoint_url: e.target.value})}
            required
          />
          <input
            type="text"
            placeholder="Chave da API"
            value={newIntegration.api_key}
            onChange={(e) => setNewIntegration({...newIntegration, api_key: e.target.value})}
          />
          <textarea
            placeholder="Configuração (JSON)"
            value={newIntegration.configuration}
            onChange={(e) => setNewIntegration({...newIntegration, configuration: e.target.value})}
            rows="3"
          />
          <label>
            <input
              type="checkbox"
              checked={newIntegration.is_active}
              onChange={(e) => setNewIntegration({...newIntegration, is_active: e.target.checked})}
            />
            Ativo
          </label>
        </div>
        <button type="submit" className="btn-primary">Criar Integração</button>
      </form>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Tipo</th>
              <th>Endpoint</th>
              <th>Status</th>
              <th>Última Sincronização</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {integrations.map((integration) => (
              <tr key={integration.id}>
                <td>{integration.name}</td>
                <td>{integration.integration_type}</td>
                <td>{integration.endpoint_url}</td>
                <td>
                  <span className={`status-badge ${integration.is_active ? 'status-success' : 'status-warning'}`}>
                    {integration.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td>{integration.last_sync_at ? new Date(integration.last_sync_at).toLocaleString() : 'Nunca'}</td>
                <td>
                  <button 
                    className="btn-small btn-primary"
                    onClick={() => handleSyncIntegration(integration.id)}
                  >
                    Sincronizar
                  </button>
                  <button className="btn-small btn-secondary">Editar</button>
                  <button className="btn-small btn-danger">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderTenantConfig = () => (
    <div className="tab-content">
      <h3>🏢 Configuração Multi-Tenant</h3>
      
      <form onSubmit={handleUpdateTenantConfig} className="form-section">
        <h4>Configurações do Tenant</h4>
        <div className="form-grid">
          <input
            type="number"
            placeholder="Máximo de Usuários"
            value={configUpdate.max_users}
            onChange={(e) => setConfigUpdate({...configUpdate, max_users: e.target.value})}
          />
          <input
            type="number"
            placeholder="Limite de Armazenamento (GB)"
            value={configUpdate.storage_limit_gb}
            onChange={(e) => setConfigUpdate({...configUpdate, storage_limit_gb: e.target.value})}
          />
          <input
            type="text"
            placeholder="Funcionalidades Habilitadas"
            value={configUpdate.features_enabled}
            onChange={(e) => setConfigUpdate({...configUpdate, features_enabled: e.target.value})}
          />
          <textarea
            placeholder="Branding Personalizado (JSON)"
            value={configUpdate.custom_branding}
            onChange={(e) => setConfigUpdate({...configUpdate, custom_branding: e.target.value})}
            rows="4"
          />
        </div>
        <button type="submit" className="btn-primary">Atualizar Configuração</button>
      </form>

      <div className="config-display">
        <h4>Configuração Atual</h4>
        <div className="config-grid">
          <div className="config-item">
            <strong>Máximo de Usuários:</strong> {tenantConfig.max_users || 'Não definido'}
          </div>
          <div className="config-item">
            <strong>Limite de Armazenamento:</strong> {tenantConfig.storage_limit_gb || 'Não definido'} GB
          </div>
          <div className="config-item">
            <strong>Funcionalidades:</strong> {tenantConfig.features_enabled || 'Não definido'}
          </div>
          <div className="config-item">
            <strong>Última Atualização:</strong> {tenantConfig.updated_at ? new Date(tenantConfig.updated_at).toLocaleString() : 'Nunca'}
          </div>
        </div>
      </div>
    </div>
  )

  const renderNotifications = () => (
    <div className="tab-content">
      <h3>🔔 Notificações do Sistema</h3>
      
      <div className="notifications-list">
        {notifications.map((notification) => (
          <div key={notification.id} className={`notification-card ${notification.is_read ? 'read' : 'unread'}`}>
            <div className="notification-header">
              <h4>{notification.title}</h4>
              <span className={`priority-badge priority-${notification.priority}`}>
                {notification.priority}
              </span>
            </div>
            <div className="notification-content">
              <p>{notification.message}</p>
              <div className="notification-meta">
                <span>Tipo: {notification.notification_type}</span>
                <span>Data: {new Date(notification.created_at).toLocaleString()}</span>
              </div>
            </div>
            <div className="notification-actions">
              {!notification.is_read && (
                <button 
                  className="btn-small btn-primary"
                  onClick={() => handleMarkNotificationAsRead(notification.id)}
                >
                  Marcar como Lida
                </button>
              )}
              <button className="btn-small btn-secondary">Detalhes</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderFeatureFlags = () => (
    <div className="tab-content">
      <h3>🚩 Feature Flags</h3>
      
      <div className="feature-flags-grid">
        {featureFlags.map((flag) => (
          <div key={flag.id} className="feature-flag-card">
            <div className="flag-header">
              <h4>{flag.flag_name}</h4>
              <span className={`status-badge ${flag.is_enabled ? 'status-success' : 'status-warning'}`}>
                {flag.is_enabled ? 'Habilitado' : 'Desabilitado'}
              </span>
            </div>
            <div className="flag-content">
              <p>{flag.description}</p>
              <div className="flag-meta">
                <span>Tipo: {flag.flag_type}</span>
                <span>Valor: {flag.flag_value}</span>
              </div>
            </div>
            <div className="flag-actions">
              <button className="btn-small btn-secondary">Editar</button>
              <button className={`btn-small ${flag.is_enabled ? 'btn-warning' : 'btn-success'}`}>
                {flag.is_enabled ? 'Desabilitar' : 'Habilitar'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderMetrics = () => (
    <div className="tab-content">
      <h3>📊 Métricas do Sistema</h3>
      
      <div className="metrics-dashboard">
        <div className="metrics-grid">
          <div className="metric-card">
            <h4>CPU</h4>
            <p className="metric-value">{systemMetrics.cpu_usage || 0}%</p>
            <div className="metric-trend">
              Tendência: {systemMetrics.cpu_trend || 'Estável'}
            </div>
          </div>
          <div className="metric-card">
            <h4>Memória</h4>
            <p className="metric-value">{systemMetrics.memory_usage || 0}%</p>
            <div className="metric-trend">
              Tendência: {systemMetrics.memory_trend || 'Estável'}
            </div>
          </div>
          <div className="metric-card">
            <h4>Disco</h4>
            <p className="metric-value">{systemMetrics.disk_usage || 0}%</p>
            <div className="metric-trend">
              Tendência: {systemMetrics.disk_trend || 'Estável'}
            </div>
          </div>
          <div className="metric-card">
            <h4>Rede</h4>
            <p className="metric-value">{systemMetrics.network_io || 0} MB/s</p>
            <div className="metric-trend">
              Tendência: {systemMetrics.network_trend || 'Estável'}
            </div>
          </div>
        </div>
        
        <div className="alerts-section">
          <h4>Alertas Ativos</h4>
          {systemMetrics.active_alerts && systemMetrics.active_alerts.length > 0 ? (
            <div className="alerts-list">
              {systemMetrics.active_alerts.map((alert, index) => (
                <div key={index} className="alert-item">
                  <span className="alert-severity">{alert.severity}</span>
                  <span className="alert-message">{alert.message}</span>
                  <span className="alert-time">{new Date(alert.timestamp).toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <p>Nenhum alerta ativo</p>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="system-config-module">
      <div className="module-header">
        <h2>🛠️ Configurações do Sistema</h2>
        <p>Gerenciamento de integrações, configurações e monitoramento</p>
      </div>

      <div className="module-tabs">
        <button 
          className={`tab-button ${activeTab === 'integrations' ? 'active' : ''}`}
          onClick={() => setActiveTab('integrations')}
        >
          Integrações
        </button>
        <button 
          className={`tab-button ${activeTab === 'tenant-config' ? 'active' : ''}`}
          onClick={() => setActiveTab('tenant-config')}
        >
          Configuração Tenant
        </button>
        <button 
          className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          Notificações
        </button>
        <button 
          className={`tab-button ${activeTab === 'feature-flags' ? 'active' : ''}`}
          onClick={() => setActiveTab('feature-flags')}
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

      <div className="module-content">
        {loading ? (
          <div className="loading-spinner">Carregando...</div>
        ) : (
          <>
            {activeTab === 'integrations' && renderIntegrations()}
            {activeTab === 'tenant-config' && renderTenantConfig()}
            {activeTab === 'notifications' && renderNotifications()}
            {activeTab === 'feature-flags' && renderFeatureFlags()}
            {activeTab === 'metrics' && renderMetrics()}
          </>
        )}
      </div>
    </div>
  )
}

export default SystemConfigurationModule