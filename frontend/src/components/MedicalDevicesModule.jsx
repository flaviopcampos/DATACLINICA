import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card'

const MedicalDevicesModule = ({ addNotification, token }) => {
  const [activeTab, setActiveTab] = useState('devices')
  const [devices, setDevices] = useState([])
  const [deviceReadings, setDeviceReadings] = useState([])
  const [deviceAlerts, setDeviceAlerts] = useState([])
  const [deviceMaintenance, setDeviceMaintenance] = useState([])
  const [loading, setLoading] = useState(false)

  // Estados para formulários
  const [newDevice, setNewDevice] = useState({
    name: '',
    device_type: 'monitor',
    manufacturer: '',
    model: '',
    serial_number: '',
    location: '',
    status: 'active'
  })

  const [newReading, setNewReading] = useState({
    device_id: '',
    patient_id: '',
    reading_type: 'vital_signs',
    value: '',
    unit: '',
    notes: ''
  })

  const [newAlert, setNewAlert] = useState({
    device_id: '',
    alert_type: 'malfunction',
    severity: 'medium',
    message: '',
    threshold_value: ''
  })

  const [newMaintenance, setNewMaintenance] = useState({
    device_id: '',
    maintenance_type: 'preventive',
    scheduled_date: '',
    description: '',
    technician_id: ''
  })

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      switch (activeTab) {
        case 'devices':
          await fetchDevices()
          break
        case 'readings':
          await fetchDeviceReadings()
          break
        case 'alerts':
          await fetchDeviceAlerts()
          break
        case 'maintenance':
          await fetchDeviceMaintenance()
          break
      }
    } catch (error) {
      addNotification('Erro ao carregar dados de dispositivos médicos', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchDevices = async () => {
    const response = await fetch('http://localhost:8000/medical-devices/devices/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.ok) {
      const data = await response.json()
      setDevices(data)
    }
  }

  const fetchDeviceReadings = async () => {
    const response = await fetch('http://localhost:8000/medical-devices/readings/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.ok) {
      const data = await response.json()
      setDeviceReadings(data)
    }
  }

  const fetchDeviceAlerts = async () => {
    const response = await fetch('http://localhost:8000/medical-devices/alerts/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.ok) {
      const data = await response.json()
      setDeviceAlerts(data)
    }
  }

  const fetchDeviceMaintenance = async () => {
    const response = await fetch('http://localhost:8000/medical-devices/maintenance/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.ok) {
      const data = await response.json()
      setDeviceMaintenance(data)
    }
  }

  const handleCreateDevice = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8000/medical-devices/devices/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newDevice)
      })
      
      if (response.ok) {
        addNotification('Dispositivo médico cadastrado com sucesso!', 'success')
        setNewDevice({
          name: '',
          device_type: 'monitor',
          manufacturer: '',
          model: '',
          serial_number: '',
          location: '',
          status: 'active'
        })
        fetchDevices()
      } else {
        addNotification('Erro ao cadastrar dispositivo médico', 'error')
      }
    } catch (error) {
      addNotification('Erro ao cadastrar dispositivo médico', 'error')
    }
  }

  const handleCreateReading = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8000/medical-devices/readings/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newReading,
          value: parseFloat(newReading.value)
        })
      })
      
      if (response.ok) {
        addNotification('Leitura registrada com sucesso!', 'success')
        setNewReading({
          device_id: '',
          patient_id: '',
          reading_type: 'vital_signs',
          value: '',
          unit: '',
          notes: ''
        })
        fetchDeviceReadings()
      } else {
        addNotification('Erro ao registrar leitura', 'error')
      }
    } catch (error) {
      addNotification('Erro ao registrar leitura', 'error')
    }
  }

  const handleCreateAlert = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8000/medical-devices/alerts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newAlert,
          threshold_value: newAlert.threshold_value ? parseFloat(newAlert.threshold_value) : null
        })
      })
      
      if (response.ok) {
        addNotification('Alerta criado com sucesso!', 'success')
        setNewAlert({
          device_id: '',
          alert_type: 'malfunction',
          severity: 'medium',
          message: '',
          threshold_value: ''
        })
        fetchDeviceAlerts()
      } else {
        addNotification('Erro ao criar alerta', 'error')
      }
    } catch (error) {
      addNotification('Erro ao criar alerta', 'error')
    }
  }

  const handleCreateMaintenance = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8000/medical-devices/maintenance/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newMaintenance)
      })
      
      if (response.ok) {
        addNotification('Manutenção agendada com sucesso!', 'success')
        setNewMaintenance({
          device_id: '',
          maintenance_type: 'preventive',
          scheduled_date: '',
          description: '',
          technician_id: ''
        })
        fetchDeviceMaintenance()
      } else {
        addNotification('Erro ao agendar manutenção', 'error')
      }
    } catch (error) {
      addNotification('Erro ao agendar manutenção', 'error')
    }
  }

  const updateDeviceStatus = async (deviceId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:8000/medical-devices/devices/${deviceId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (response.ok) {
        addNotification('Status do dispositivo atualizado!', 'success')
        fetchDevices()
      } else {
        addNotification('Erro ao atualizar status', 'error')
      }
    } catch (error) {
      addNotification('Erro ao atualizar status', 'error')
    }
  }

  const acknowledgeAlert = async (alertId) => {
    try {
      const response = await fetch(`http://localhost:8000/medical-devices/alerts/${alertId}/acknowledge`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        addNotification('Alerta reconhecido!', 'success')
        fetchDeviceAlerts()
      } else {
        addNotification('Erro ao reconhecer alerta', 'error')
      }
    } catch (error) {
      addNotification('Erro ao reconhecer alerta', 'error')
    }
  }

  const renderDevices = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Novo Dispositivo Médico</CardTitle>
          <CardDescription>Cadastrar um novo dispositivo médico</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateDevice} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome do Dispositivo</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newDevice.name}
                  onChange={(e) => setNewDevice({...newDevice, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Dispositivo</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newDevice.device_type}
                  onChange={(e) => setNewDevice({...newDevice, device_type: e.target.value})}
                >
                  <option value="monitor">Monitor</option>
                  <option value="ventilator">Ventilador</option>
                  <option value="infusion_pump">Bomba de Infusão</option>
                  <option value="defibrillator">Desfibrilador</option>
                  <option value="ultrasound">Ultrassom</option>
                  <option value="xray">Raio-X</option>
                  <option value="ct_scan">Tomografia</option>
                  <option value="mri">Ressonância Magnética</option>
                  <option value="other">Outro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fabricante</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newDevice.manufacturer}
                  onChange={(e) => setNewDevice({...newDevice, manufacturer: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Modelo</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newDevice.model}
                  onChange={(e) => setNewDevice({...newDevice, model: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Número de Série</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newDevice.serial_number}
                  onChange={(e) => setNewDevice({...newDevice, serial_number: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Localização</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Ex: UTI - Leito 5"
                  value={newDevice.location}
                  onChange={(e) => setNewDevice({...newDevice, location: e.target.value})}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn-primary">Cadastrar Dispositivo</button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dispositivos Médicos</CardTitle>
          <CardDescription>Lista de dispositivos cadastrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Nome</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Tipo</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Fabricante</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Modelo</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Localização</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((device) => (
                  <tr key={device.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">{device.name}</td>
                    <td className="border border-gray-300 px-4 py-2">{device.device_type}</td>
                    <td className="border border-gray-300 px-4 py-2">{device.manufacturer}</td>
                    <td className="border border-gray-300 px-4 py-2">{device.model}</td>
                    <td className="border border-gray-300 px-4 py-2">{device.location}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        device.status === 'active' ? 'bg-green-100 text-green-800' :
                        device.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                        device.status === 'inactive' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {device.status}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="space-x-2">
                        <select
                          className="text-xs p-1 border rounded"
                          value={device.status}
                          onChange={(e) => updateDeviceStatus(device.id, e.target.value)}
                        >
                          <option value="active">Ativo</option>
                          <option value="maintenance">Manutenção</option>
                          <option value="inactive">Inativo</option>
                          <option value="retired">Aposentado</option>
                        </select>
                        <button className="btn-small btn-primary">Detalhes</button>
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

  const renderReadings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Nova Leitura</CardTitle>
          <CardDescription>Registrar uma nova leitura de dispositivo</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateReading} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">ID do Dispositivo</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newReading.device_id}
                  onChange={(e) => setNewReading({...newReading, device_id: e.target.value})}
                  required
                >
                  <option value="">Selecione um dispositivo</option>
                  {devices.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.name} - {device.location}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ID do Paciente</label>
                <input
                  type="number"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newReading.patient_id}
                  onChange={(e) => setNewReading({...newReading, patient_id: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Leitura</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newReading.reading_type}
                  onChange={(e) => setNewReading({...newReading, reading_type: e.target.value})}
                >
                  <option value="vital_signs">Sinais Vitais</option>
                  <option value="blood_pressure">Pressão Arterial</option>
                  <option value="heart_rate">Frequência Cardíaca</option>
                  <option value="temperature">Temperatura</option>
                  <option value="oxygen_saturation">Saturação de Oxigênio</option>
                  <option value="glucose">Glicemia</option>
                  <option value="other">Outro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Valor</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newReading.value}
                  onChange={(e) => setNewReading({...newReading, value: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Unidade</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Ex: mmHg, bpm, °C"
                  value={newReading.unit}
                  onChange={(e) => setNewReading({...newReading, unit: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Observações</label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded"
                  rows="2"
                  value={newReading.notes}
                  onChange={(e) => setNewReading({...newReading, notes: e.target.value})}
                />
              </div>
            </div>
            <button type="submit" className="btn-primary">Registrar Leitura</button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Leituras Recentes</CardTitle>
          <CardDescription>Últimas leituras registradas pelos dispositivos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Dispositivo</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Paciente</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Tipo</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Valor</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Data/Hora</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {deviceReadings.map((reading) => (
                  <tr key={reading.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">{reading.device_name}</td>
                    <td className="border border-gray-300 px-4 py-2">{reading.patient_name}</td>
                    <td className="border border-gray-300 px-4 py-2">{reading.reading_type}</td>
                    <td className="border border-gray-300 px-4 py-2">{reading.value} {reading.unit}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {new Date(reading.timestamp).toLocaleString('pt-BR')}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="space-x-2">
                        <button className="btn-small btn-primary">Ver Histórico</button>
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

  const renderAlerts = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Novo Alerta</CardTitle>
          <CardDescription>Criar um novo alerta para dispositivo</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateAlert} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">ID do Dispositivo</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newAlert.device_id}
                  onChange={(e) => setNewAlert({...newAlert, device_id: e.target.value})}
                  required
                >
                  <option value="">Selecione um dispositivo</option>
                  {devices.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.name} - {device.location}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Alerta</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newAlert.alert_type}
                  onChange={(e) => setNewAlert({...newAlert, alert_type: e.target.value})}
                >
                  <option value="malfunction">Mau Funcionamento</option>
                  <option value="maintenance_due">Manutenção Vencida</option>
                  <option value="calibration_needed">Calibração Necessária</option>
                  <option value="battery_low">Bateria Baixa</option>
                  <option value="threshold_exceeded">Limite Excedido</option>
                  <option value="connection_lost">Conexão Perdida</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Severidade</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newAlert.severity}
                  onChange={(e) => setNewAlert({...newAlert, severity: e.target.value})}
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                  <option value="critical">Crítica</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Valor Limite (opcional)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newAlert.threshold_value}
                  onChange={(e) => setNewAlert({...newAlert, threshold_value: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mensagem do Alerta</label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded"
                rows="3"
                value={newAlert.message}
                onChange={(e) => setNewAlert({...newAlert, message: e.target.value})}
                required
              />
            </div>
            <button type="submit" className="btn-primary">Criar Alerta</button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alertas Ativos</CardTitle>
          <CardDescription>Alertas pendentes de dispositivos médicos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deviceAlerts.map((alert) => (
              <div key={alert.id} className={`p-4 border rounded-lg ${
                alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
                alert.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                'border-blue-500 bg-blue-50'
              }`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{alert.device_name}</h4>
                      <span className={`px-2 py-1 rounded text-xs ${
                        alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {alert.severity}
                      </span>
                      <span className="text-xs text-gray-500">{alert.alert_type}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(alert.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!alert.acknowledged && (
                      <button 
                        className="btn-small btn-primary"
                        onClick={() => acknowledgeAlert(alert.id)}
                      >
                        Reconhecer
                      </button>
                    )}
                    <button className="btn-small btn-secondary">Detalhes</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderMaintenance = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Agendar Manutenção</CardTitle>
          <CardDescription>Agendar manutenção para dispositivo médico</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateMaintenance} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">ID do Dispositivo</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newMaintenance.device_id}
                  onChange={(e) => setNewMaintenance({...newMaintenance, device_id: e.target.value})}
                  required
                >
                  <option value="">Selecione um dispositivo</option>
                  {devices.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.name} - {device.location}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Manutenção</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newMaintenance.maintenance_type}
                  onChange={(e) => setNewMaintenance({...newMaintenance, maintenance_type: e.target.value})}
                >
                  <option value="preventive">Preventiva</option>
                  <option value="corrective">Corretiva</option>
                  <option value="calibration">Calibração</option>
                  <option value="inspection">Inspeção</option>
                  <option value="cleaning">Limpeza</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Data Agendada</label>
                <input
                  type="datetime-local"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newMaintenance.scheduled_date}
                  onChange={(e) => setNewMaintenance({...newMaintenance, scheduled_date: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ID do Técnico</label>
                <input
                  type="number"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newMaintenance.technician_id}
                  onChange={(e) => setNewMaintenance({...newMaintenance, technician_id: e.target.value})}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descrição</label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded"
                rows="3"
                value={newMaintenance.description}
                onChange={(e) => setNewMaintenance({...newMaintenance, description: e.target.value})}
                required
              />
            </div>
            <button type="submit" className="btn-primary">Agendar Manutenção</button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manutenções Agendadas</CardTitle>
          <CardDescription>Cronograma de manutenções</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Dispositivo</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Tipo</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Data Agendada</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Técnico</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {deviceMaintenance.map((maintenance) => (
                  <tr key={maintenance.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">{maintenance.device_name}</td>
                    <td className="border border-gray-300 px-4 py-2">{maintenance.maintenance_type}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {new Date(maintenance.scheduled_date).toLocaleString('pt-BR')}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{maintenance.technician_name}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        maintenance.status === 'completed' ? 'bg-green-100 text-green-800' :
                        maintenance.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        maintenance.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {maintenance.status}
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

  return (
    <div className="medical-devices-module">
      <div className="module-header">
        <h2>Dispositivos Médicos</h2>
        <p>Gerenciamento de equipamentos médicos e monitoramento</p>
      </div>

      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'devices' ? 'active' : ''}`}
          onClick={() => setActiveTab('devices')}
        >
          Dispositivos
        </button>
        <button 
          className={`tab-button ${activeTab === 'readings' ? 'active' : ''}`}
          onClick={() => setActiveTab('readings')}
        >
          Leituras
        </button>
        <button 
          className={`tab-button ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          Alertas
        </button>
        <button 
          className={`tab-button ${activeTab === 'maintenance' ? 'active' : ''}`}
          onClick={() => setActiveTab('maintenance')}
        >
          Manutenção
        </button>
      </div>

      <div className="tab-content">
        {loading && <div className="loading-spinner">Carregando...</div>}
        {activeTab === 'devices' && renderDevices()}
        {activeTab === 'readings' && renderReadings()}
        {activeTab === 'alerts' && renderAlerts()}
        {activeTab === 'maintenance' && renderMaintenance()}
      </div>
    </div>
  )
}

export default MedicalDevicesModule