import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card'

const TelemedicineModule = ({ addNotification, token }) => {
  const [activeTab, setActiveTab] = useState('teleconsultations')
  const [teleconsultations, setTeleconsultations] = useState([])
  const [telemedicineRooms, setTelemedicineRooms] = useState([])
  const [remoteMonitoring, setRemoteMonitoring] = useState([])
  const [loading, setLoading] = useState(false)

  // Estados para formulários
  const [newTeleconsultation, setNewTeleconsultation] = useState({
    patient_id: '',
    doctor_id: '',
    scheduled_datetime: '',
    consultation_type: 'video',
    notes: ''
  })

  const [newRoom, setNewRoom] = useState({
    name: '',
    room_type: 'consultation',
    max_participants: 2,
    is_recording_enabled: false
  })

  const [newMonitoring, setNewMonitoring] = useState({
    patient_id: '',
    device_type: 'blood_pressure',
    monitoring_frequency: 'daily',
    alert_thresholds: ''
  })

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      switch (activeTab) {
        case 'teleconsultations':
          await fetchTeleconsultations()
          break
        case 'rooms':
          await fetchTelemedicineRooms()
          break
        case 'monitoring':
          await fetchRemoteMonitoring()
          break
      }
    } catch (error) {
      addNotification('Erro ao carregar dados de telemedicina', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchTeleconsultations = async () => {
    const response = await fetch('http://localhost:8000/telemedicine/teleconsultations/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.ok) {
      const data = await response.json()
      setTeleconsultations(data)
    }
  }

  const fetchTelemedicineRooms = async () => {
    const response = await fetch('http://localhost:8000/telemedicine/rooms/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.ok) {
      const data = await response.json()
      setTelemedicineRooms(data)
    }
  }

  const fetchRemoteMonitoring = async () => {
    const response = await fetch('http://localhost:8000/telemedicine/remote-monitoring/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.ok) {
      const data = await response.json()
      setRemoteMonitoring(data)
    }
  }

  const handleCreateTeleconsultation = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8000/telemedicine/teleconsultations/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newTeleconsultation)
      })
      
      if (response.ok) {
        addNotification('Teleconsulta criada com sucesso!', 'success')
        setNewTeleconsultation({
          patient_id: '',
          doctor_id: '',
          scheduled_datetime: '',
          consultation_type: 'video',
          notes: ''
        })
        fetchTeleconsultations()
      } else {
        addNotification('Erro ao criar teleconsulta', 'error')
      }
    } catch (error) {
      addNotification('Erro ao criar teleconsulta', 'error')
    }
  }

  const handleCreateRoom = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8000/telemedicine/rooms/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newRoom)
      })
      
      if (response.ok) {
        addNotification('Sala de telemedicina criada com sucesso!', 'success')
        setNewRoom({
          name: '',
          room_type: 'consultation',
          max_participants: 2,
          is_recording_enabled: false
        })
        fetchTelemedicineRooms()
      } else {
        addNotification('Erro ao criar sala', 'error')
      }
    } catch (error) {
      addNotification('Erro ao criar sala', 'error')
    }
  }

  const handleCreateMonitoring = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8000/telemedicine/remote-monitoring/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newMonitoring)
      })
      
      if (response.ok) {
        addNotification('Monitoramento remoto configurado com sucesso!', 'success')
        setNewMonitoring({
          patient_id: '',
          device_type: 'blood_pressure',
          monitoring_frequency: 'daily',
          alert_thresholds: ''
        })
        fetchRemoteMonitoring()
      } else {
        addNotification('Erro ao configurar monitoramento', 'error')
      }
    } catch (error) {
      addNotification('Erro ao configurar monitoramento', 'error')
    }
  }

  const joinRoom = async (roomId) => {
    try {
      const response = await fetch(`http://localhost:8000/telemedicine/rooms/${roomId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        addNotification('Entrando na sala...', 'success')
        // Aqui você pode integrar com uma biblioteca de videoconferência
        window.open(data.room_url, '_blank')
      } else {
        addNotification('Erro ao entrar na sala', 'error')
      }
    } catch (error) {
      addNotification('Erro ao entrar na sala', 'error')
    }
  }

  const renderTeleconsultations = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Nova Teleconsulta</CardTitle>
          <CardDescription>Agendar uma nova consulta por videoconferência</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateTeleconsultation} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">ID do Paciente</label>
                <input
                  type="number"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newTeleconsultation.patient_id}
                  onChange={(e) => setNewTeleconsultation({...newTeleconsultation, patient_id: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ID do Médico</label>
                <input
                  type="number"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newTeleconsultation.doctor_id}
                  onChange={(e) => setNewTeleconsultation({...newTeleconsultation, doctor_id: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Data e Hora</label>
                <input
                  type="datetime-local"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newTeleconsultation.scheduled_datetime}
                  onChange={(e) => setNewTeleconsultation({...newTeleconsultation, scheduled_datetime: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Consulta</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newTeleconsultation.consultation_type}
                  onChange={(e) => setNewTeleconsultation({...newTeleconsultation, consultation_type: e.target.value})}
                >
                  <option value="video">Videoconferência</option>
                  <option value="audio">Áudio apenas</option>
                  <option value="chat">Chat</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Observações</label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded"
                rows="3"
                value={newTeleconsultation.notes}
                onChange={(e) => setNewTeleconsultation({...newTeleconsultation, notes: e.target.value})}
              />
            </div>
            <button type="submit" className="btn-primary">Agendar Teleconsulta</button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Teleconsultas Agendadas</CardTitle>
          <CardDescription>Lista de consultas por videoconferência</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Paciente</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Médico</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Data/Hora</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Tipo</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {teleconsultations.map((consultation) => (
                  <tr key={consultation.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">{consultation.patient_name}</td>
                    <td className="border border-gray-300 px-4 py-2">{consultation.doctor_name}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {new Date(consultation.scheduled_datetime).toLocaleString('pt-BR')}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{consultation.consultation_type}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        consultation.status === 'completed' ? 'bg-green-100 text-green-800' :
                        consultation.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        consultation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {consultation.status}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="space-x-2">
                        <button className="btn-small btn-primary">Iniciar</button>
                        <button className="btn-small btn-secondary">Editar</button>
                        <button className="btn-small btn-danger">Cancelar</button>
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

  const renderRooms = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Nova Sala de Telemedicina</CardTitle>
          <CardDescription>Criar uma nova sala para consultas virtuais</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateRoom} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome da Sala</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({...newRoom, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Sala</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newRoom.room_type}
                  onChange={(e) => setNewRoom({...newRoom, room_type: e.target.value})}
                >
                  <option value="consultation">Consulta</option>
                  <option value="meeting">Reunião</option>
                  <option value="training">Treinamento</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Máximo de Participantes</label>
                <input
                  type="number"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newRoom.max_participants}
                  onChange={(e) => setNewRoom({...newRoom, max_participants: parseInt(e.target.value)})}
                  min="2"
                  max="50"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="recording"
                  className="mr-2"
                  checked={newRoom.is_recording_enabled}
                  onChange={(e) => setNewRoom({...newRoom, is_recording_enabled: e.target.checked})}
                />
                <label htmlFor="recording" className="text-sm font-medium">Habilitar Gravação</label>
              </div>
            </div>
            <button type="submit" className="btn-primary">Criar Sala</button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {telemedicineRooms.map((room) => (
          <Card key={room.id}>
            <CardHeader>
              <CardTitle>{room.name}</CardTitle>
              <CardDescription>Tipo: {room.room_type}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">Participantes: {room.current_participants}/{room.max_participants}</p>
                <p className="text-sm">Status: 
                  <span className={`ml-1 px-2 py-1 rounded text-xs ${
                    room.status === 'active' ? 'bg-green-100 text-green-800' :
                    room.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {room.status}
                  </span>
                </p>
                <div className="pt-2">
                  <button 
                    className="btn-primary w-full"
                    onClick={() => joinRoom(room.id)}
                    disabled={room.current_participants >= room.max_participants}
                  >
                    Entrar na Sala
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderMonitoring = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Novo Monitoramento Remoto</CardTitle>
          <CardDescription>Configurar monitoramento de sinais vitais</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateMonitoring} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">ID do Paciente</label>
                <input
                  type="number"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newMonitoring.patient_id}
                  onChange={(e) => setNewMonitoring({...newMonitoring, patient_id: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Dispositivo</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newMonitoring.device_type}
                  onChange={(e) => setNewMonitoring({...newMonitoring, device_type: e.target.value})}
                >
                  <option value="blood_pressure">Pressão Arterial</option>
                  <option value="heart_rate">Frequência Cardíaca</option>
                  <option value="glucose">Glicemia</option>
                  <option value="temperature">Temperatura</option>
                  <option value="oxygen_saturation">Saturação de Oxigênio</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Frequência de Monitoramento</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newMonitoring.monitoring_frequency}
                  onChange={(e) => setNewMonitoring({...newMonitoring, monitoring_frequency: e.target.value})}
                >
                  <option value="continuous">Contínuo</option>
                  <option value="hourly">A cada hora</option>
                  <option value="daily">Diário</option>
                  <option value="weekly">Semanal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Limites de Alerta</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Ex: min:120, max:180"
                  value={newMonitoring.alert_thresholds}
                  onChange={(e) => setNewMonitoring({...newMonitoring, alert_thresholds: e.target.value})}
                />
              </div>
            </div>
            <button type="submit" className="btn-primary">Configurar Monitoramento</button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monitoramentos Ativos</CardTitle>
          <CardDescription>Pacientes em monitoramento remoto</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Paciente</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Dispositivo</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Frequência</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Última Leitura</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {remoteMonitoring.map((monitoring) => (
                  <tr key={monitoring.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">{monitoring.patient_name}</td>
                    <td className="border border-gray-300 px-4 py-2">{monitoring.device_type}</td>
                    <td className="border border-gray-300 px-4 py-2">{monitoring.monitoring_frequency}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {monitoring.last_reading ? new Date(monitoring.last_reading).toLocaleString('pt-BR') : 'N/A'}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        monitoring.status === 'active' ? 'bg-green-100 text-green-800' :
                        monitoring.status === 'alert' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {monitoring.status}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="space-x-2">
                        <button className="btn-small btn-primary">Ver Dados</button>
                        <button className="btn-small btn-secondary">Configurar</button>
                        <button className="btn-small btn-danger">Parar</button>
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
    <div className="telemedicine-module">
      <div className="module-header">
        <h2>Telemedicina</h2>
        <p>Consultas virtuais e monitoramento remoto de pacientes</p>
      </div>

      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'teleconsultations' ? 'active' : ''}`}
          onClick={() => setActiveTab('teleconsultations')}
        >
          Teleconsultas
        </button>
        <button 
          className={`tab-button ${activeTab === 'rooms' ? 'active' : ''}`}
          onClick={() => setActiveTab('rooms')}
        >
          Salas Virtuais
        </button>
        <button 
          className={`tab-button ${activeTab === 'monitoring' ? 'active' : ''}`}
          onClick={() => setActiveTab('monitoring')}
        >
          Monitoramento Remoto
        </button>
      </div>

      <div className="tab-content">
        {loading && <div className="loading-spinner">Carregando...</div>}
        {activeTab === 'teleconsultations' && renderTeleconsultations()}
        {activeTab === 'rooms' && renderRooms()}
        {activeTab === 'monitoring' && renderMonitoring()}
      </div>
    </div>
  )
}

export default TelemedicineModule