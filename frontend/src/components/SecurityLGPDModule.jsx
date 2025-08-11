import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card'

const SecurityLGPDModule = ({ addNotification, token }) => {
  const [activeTab, setActiveTab] = useState('2fa')
  const [loading, setLoading] = useState(false)

  // Estados para 2FA
  const [twoFASetup, setTwoFASetup] = useState(null)
  const [verificationToken, setVerificationToken] = useState('')
  const [disablePassword, setDisablePassword] = useState('')

  // Estados para Sessões
  const [userSessions, setUserSessions] = useState([])

  // Estados para Chaves API
  const [apiKeys, setApiKeys] = useState([])
  const [newApiKey, setNewApiKey] = useState({
    name: '',
    permissions: [],
    expires_at: ''
  })

  // Estados para Logs de Auditoria
  const [auditLogs, setAuditLogs] = useState([])
  const [auditFilters, setAuditFilters] = useState({
    action_type: '',
    start_date: '',
    end_date: ''
  })

  // Estados para Consentimentos LGPD
  const [consentRecords, setConsentRecords] = useState([])
  const [newConsent, setNewConsent] = useState({
    patient_id: '',
    consent_type: 'data_processing',
    purpose: '',
    data_categories: []
  })

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      switch (activeTab) {
        case 'sessions':
          await fetchUserSessions()
          break
        case 'api-keys':
          await fetchApiKeys()
          break
        case 'audit':
          await fetchAuditLogs()
          break
        case 'lgpd':
          await fetchConsentRecords()
          break
      }
    } catch (error) {
      addNotification('Erro ao carregar dados de segurança', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserSessions = async () => {
    const response = await fetch('http://localhost:8000/auth/sessions/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.ok) {
      const data = await response.json()
      setUserSessions(data)
    }
  }

  const fetchApiKeys = async () => {
    const response = await fetch('http://localhost:8000/auth/api-keys/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.ok) {
      const data = await response.json()
      setApiKeys(data)
    }
  }

  const fetchAuditLogs = async () => {
    let url = 'http://localhost:8000/audit/logs/'
    const params = new URLSearchParams()
    
    if (auditFilters.action_type) params.append('action_type', auditFilters.action_type)
    if (auditFilters.start_date) params.append('start_date', auditFilters.start_date)
    if (auditFilters.end_date) params.append('end_date', auditFilters.end_date)
    
    if (params.toString()) url += `?${params.toString()}`

    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.ok) {
      const data = await response.json()
      setAuditLogs(data)
    }
  }

  const fetchConsentRecords = async () => {
    const response = await fetch('http://localhost:8000/lgpd/consent-records/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.ok) {
      const data = await response.json()
      setConsentRecords(data)
    }
  }

  const setup2FA = async () => {
    try {
      const response = await fetch('http://localhost:8000/auth/2fa/setup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setTwoFASetup(data)
        addNotification('2FA configurado! Escaneie o QR Code com seu app autenticador.', 'success')
      } else {
        addNotification('Erro ao configurar 2FA', 'error')
      }
    } catch (error) {
      addNotification('Erro ao configurar 2FA', 'error')
    }
  }

  const verify2FA = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8000/auth/2fa/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: verificationToken })
      })
      
      if (response.ok) {
        addNotification('2FA ativado com sucesso!', 'success')
        setTwoFASetup(null)
        setVerificationToken('')
      } else {
        addNotification('Token inválido', 'error')
      }
    } catch (error) {
      addNotification('Erro ao verificar 2FA', 'error')
    }
  }

  const disable2FA = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8000/auth/2fa/disable', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: disablePassword })
      })
      
      if (response.ok) {
        addNotification('2FA desativado com sucesso!', 'success')
        setDisablePassword('')
      } else {
        addNotification('Senha incorreta', 'error')
      }
    } catch (error) {
      addNotification('Erro ao desativar 2FA', 'error')
    }
  }

  const revokeSession = async (sessionId) => {
    try {
      const response = await fetch(`http://localhost:8000/auth/sessions/${sessionId}/revoke`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        addNotification('Sessão revogada com sucesso!', 'success')
        fetchUserSessions()
      } else {
        addNotification('Erro ao revogar sessão', 'error')
      }
    } catch (error) {
      addNotification('Erro ao revogar sessão', 'error')
    }
  }

  const createApiKey = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8000/auth/api-keys/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newApiKey)
      })
      
      if (response.ok) {
        const data = await response.json()
        addNotification('Chave API criada com sucesso!', 'success')
        setNewApiKey({ name: '', permissions: [], expires_at: '' })
        fetchApiKeys()
        
        // Mostrar a chave gerada (apenas uma vez)
        alert(`Chave API gerada: ${data.key}\n\nGuarde esta chave em local seguro, ela não será mostrada novamente!`)
      } else {
        addNotification('Erro ao criar chave API', 'error')
      }
    } catch (error) {
      addNotification('Erro ao criar chave API', 'error')
    }
  }

  const revokeApiKey = async (keyId) => {
    try {
      const response = await fetch(`http://localhost:8000/auth/api-keys/${keyId}/revoke`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        addNotification('Chave API revogada com sucesso!', 'success')
        fetchApiKeys()
      } else {
        addNotification('Erro ao revogar chave API', 'error')
      }
    } catch (error) {
      addNotification('Erro ao revogar chave API', 'error')
    }
  }

  const createConsentRecord = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8000/lgpd/consent-records/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newConsent)
      })
      
      if (response.ok) {
        addNotification('Registro de consentimento criado!', 'success')
        setNewConsent({
          patient_id: '',
          consent_type: 'data_processing',
          purpose: '',
          data_categories: []
        })
        fetchConsentRecords()
      } else {
        addNotification('Erro ao criar registro de consentimento', 'error')
      }
    } catch (error) {
      addNotification('Erro ao criar registro de consentimento', 'error')
    }
  }

  const render2FA = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Autenticação de Dois Fatores (2FA)</CardTitle>
          <CardDescription>Configure uma camada adicional de segurança para sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          {!twoFASetup ? (
            <div className="space-y-4">
              <button onClick={setup2FA} className="btn-primary">
                Configurar 2FA
              </button>
              
              <div className="mt-6">
                <h4 className="font-medium mb-2">Desativar 2FA</h4>
                <form onSubmit={disable2FA} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Senha Atual</label>
                    <input
                      type="password"
                      className="w-full p-2 border border-gray-300 rounded"
                      value={disablePassword}
                      onChange={(e) => setDisablePassword(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn-danger">
                    Desativar 2FA
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <h4 className="font-medium mb-4">Escaneie o QR Code</h4>
                <img src={twoFASetup.qr_code} alt="QR Code 2FA" className="mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-4">
                  Ou digite manualmente: <code className="bg-gray-100 px-2 py-1 rounded">{twoFASetup.manual_entry_key}</code>
                </p>
              </div>
              
              <form onSubmit={verify2FA} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Código de Verificação</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded text-center"
                    placeholder="000000"
                    maxLength="6"
                    value={verificationToken}
                    onChange={(e) => setVerificationToken(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn-primary w-full">
                  Verificar e Ativar 2FA
                </button>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const renderSessions = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sessões Ativas</CardTitle>
          <CardDescription>Gerencie suas sessões de login ativas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userSessions.map((session) => (
              <div key={session.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{session.device_info || 'Dispositivo Desconhecido'}</h4>
                      {session.is_current && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          Sessão Atual
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      IP: {session.ip_address}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      Último acesso: {new Date(session.last_activity).toLocaleString('pt-BR')}
                    </p>
                    <p className="text-sm text-gray-600">
                      Criada em: {new Date(session.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    {!session.is_current && (
                      <button 
                        className="btn-small btn-danger"
                        onClick={() => revokeSession(session.id)}
                      >
                        Revogar
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

  const renderApiKeys = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Nova Chave API</CardTitle>
          <CardDescription>Criar uma nova chave para integração com APIs</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={createApiKey} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome da Chave</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newApiKey.name}
                  onChange={(e) => setNewApiKey({...newApiKey, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Data de Expiração</label>
                <input
                  type="datetime-local"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newApiKey.expires_at}
                  onChange={(e) => setNewApiKey({...newApiKey, expires_at: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Permissões</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {['read', 'write', 'delete', 'admin'].map((permission) => (
                  <label key={permission} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={newApiKey.permissions.includes(permission)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewApiKey({
                            ...newApiKey,
                            permissions: [...newApiKey.permissions, permission]
                          })
                        } else {
                          setNewApiKey({
                            ...newApiKey,
                            permissions: newApiKey.permissions.filter(p => p !== permission)
                          })
                        }
                      }}
                    />
                    {permission}
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" className="btn-primary">Criar Chave API</button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Chaves API Ativas</CardTitle>
          <CardDescription>Suas chaves de API existentes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Nome</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Permissões</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Último Uso</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Expira em</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {apiKeys.map((key) => (
                  <tr key={key.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">{key.name}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {key.permissions.join(', ')}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {key.last_used ? new Date(key.last_used).toLocaleString('pt-BR') : 'Nunca'}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {key.expires_at ? new Date(key.expires_at).toLocaleString('pt-BR') : 'Nunca'}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <button 
                        className="btn-small btn-danger"
                        onClick={() => revokeApiKey(key.id)}
                      >
                        Revogar
                      </button>
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

  const renderAuditLogs = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Auditoria</CardTitle>
          <CardDescription>Filtrar logs de auditoria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de Ação</label>
              <select
                className="w-full p-2 border border-gray-300 rounded"
                value={auditFilters.action_type}
                onChange={(e) => setAuditFilters({...auditFilters, action_type: e.target.value})}
              >
                <option value="">Todos</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
                <option value="create">Criar</option>
                <option value="update">Atualizar</option>
                <option value="delete">Excluir</option>
                <option value="view">Visualizar</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data Início</label>
              <input
                type="date"
                className="w-full p-2 border border-gray-300 rounded"
                value={auditFilters.start_date}
                onChange={(e) => setAuditFilters({...auditFilters, start_date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data Fim</label>
              <input
                type="date"
                className="w-full p-2 border border-gray-300 rounded"
                value={auditFilters.end_date}
                onChange={(e) => setAuditFilters({...auditFilters, end_date: e.target.value})}
              />
            </div>
          </div>
          <button onClick={fetchAuditLogs} className="btn-primary mt-4">
            Aplicar Filtros
          </button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Logs de Auditoria</CardTitle>
          <CardDescription>Histórico de ações no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Data/Hora</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Usuário</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Ação</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Recurso</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">IP</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">
                      {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{log.user_email}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        log.action_type === 'delete' ? 'bg-red-100 text-red-800' :
                        log.action_type === 'create' ? 'bg-green-100 text-green-800' :
                        log.action_type === 'update' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {log.action_type}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{log.resource_type}</td>
                    <td className="border border-gray-300 px-4 py-2">{log.ip_address}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <button className="btn-small btn-secondary">Ver Detalhes</button>
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

  const renderLGPD = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Novo Registro de Consentimento</CardTitle>
          <CardDescription>Registrar consentimento LGPD do paciente</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={createConsentRecord} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">ID do Paciente</label>
                <input
                  type="number"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newConsent.patient_id}
                  onChange={(e) => setNewConsent({...newConsent, patient_id: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Consentimento</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newConsent.consent_type}
                  onChange={(e) => setNewConsent({...newConsent, consent_type: e.target.value})}
                >
                  <option value="data_processing">Processamento de Dados</option>
                  <option value="marketing">Marketing</option>
                  <option value="research">Pesquisa</option>
                  <option value="sharing">Compartilhamento</option>
                  <option value="storage">Armazenamento</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Finalidade</label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded"
                rows="3"
                value={newConsent.purpose}
                onChange={(e) => setNewConsent({...newConsent, purpose: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Categorias de Dados</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {['personal_data', 'health_data', 'financial_data', 'contact_data', 'biometric_data', 'location_data'].map((category) => (
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={newConsent.data_categories.includes(category)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewConsent({
                            ...newConsent,
                            data_categories: [...newConsent.data_categories, category]
                          })
                        } else {
                          setNewConsent({
                            ...newConsent,
                            data_categories: newConsent.data_categories.filter(c => c !== category)
                          })
                        }
                      }}
                    />
                    {category.replace('_', ' ')}
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" className="btn-primary">Registrar Consentimento</button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registros de Consentimento</CardTitle>
          <CardDescription>Histórico de consentimentos LGPD</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Paciente</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Tipo</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Data</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {consentRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">{record.patient_name}</td>
                    <td className="border border-gray-300 px-4 py-2">{record.consent_type}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        record.status === 'granted' ? 'bg-green-100 text-green-800' :
                        record.status === 'revoked' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {new Date(record.granted_at).toLocaleString('pt-BR')}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="space-x-2">
                        <button className="btn-small btn-secondary">Ver Detalhes</button>
                        {record.status === 'granted' && (
                          <button className="btn-small btn-danger">Revogar</button>
                        )}
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

  return (
    <div className="security-lgpd-module">
      <div className="module-header">
        <h2>Segurança e LGPD</h2>
        <p>Gerenciamento de segurança e conformidade com a LGPD</p>
      </div>

      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === '2fa' ? 'active' : ''}`}
          onClick={() => setActiveTab('2fa')}
        >
          2FA
        </button>
        <button 
          className={`tab-button ${activeTab === 'sessions' ? 'active' : ''}`}
          onClick={() => setActiveTab('sessions')}
        >
          Sessões
        </button>
        <button 
          className={`tab-button ${activeTab === 'api-keys' ? 'active' : ''}`}
          onClick={() => setActiveTab('api-keys')}
        >
          Chaves API
        </button>
        <button 
          className={`tab-button ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          Auditoria
        </button>
        <button 
          className={`tab-button ${activeTab === 'lgpd' ? 'active' : ''}`}
          onClick={() => setActiveTab('lgpd')}
        >
          LGPD
        </button>
      </div>

      <div className="tab-content">
        {loading && <div className="loading-spinner">Carregando...</div>}
        {activeTab === '2fa' && render2FA()}
        {activeTab === 'sessions' && renderSessions()}
        {activeTab === 'api-keys' && renderApiKeys()}
        {activeTab === 'audit' && renderAuditLogs()}
        {activeTab === 'lgpd' && renderLGPD()}
      </div>
    </div>
  )
}

export default SecurityLGPDModule