import React, { useState, useEffect } from 'react'

const AdvancedStockManagementModule = ({ addNotification, token }) => {
  const [activeTab, setActiveTab] = useState('supplier-prices')
  const [supplierPrices, setSupplierPrices] = useState([])
  const [departmentLevels, setDepartmentLevels] = useState([])
  const [categoryAlerts, setCategoryAlerts] = useState([])
  const [automaticReorders, setAutomaticReorders] = useState([])
  const [loading, setLoading] = useState(false)

  // Estados para formulários
  const [newSupplierPrice, setNewSupplierPrice] = useState({
    supplier_id: '',
    product_id: '',
    price: '',
    minimum_quantity: '',
    delivery_time_days: ''
  })

  const [newDepartmentLevel, setNewDepartmentLevel] = useState({
    department_id: '',
    product_id: '',
    minimum_level: '',
    maximum_level: '',
    reorder_point: ''
  })

  const [newCategoryAlert, setNewCategoryAlert] = useState({
    category_id: '',
    alert_type: 'low_stock',
    threshold_value: '',
    notification_emails: ''
  })

  const [newAutomaticReorder, setNewAutomaticReorder] = useState({
    product_id: '',
    supplier_id: '',
    trigger_level: '',
    reorder_quantity: '',
    is_active: true
  })

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      switch (activeTab) {
        case 'supplier-prices':
          await fetchSupplierPrices()
          break
        case 'department-levels':
          await fetchDepartmentLevels()
          break
        case 'category-alerts':
          await fetchCategoryAlerts()
          break
        case 'automatic-reorders':
          await fetchAutomaticReorders()
          break
      }
    } catch (error) {
      addNotification('Erro ao carregar dados', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchSupplierPrices = async () => {
    const response = await fetch('http://localhost:8000/supplier-product-prices/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.ok) {
      const data = await response.json()
      setSupplierPrices(data)
    }
  }

  const fetchDepartmentLevels = async () => {
    const response = await fetch('http://localhost:8000/department-stock-levels/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.ok) {
      const data = await response.json()
      setDepartmentLevels(data)
    }
  }

  const fetchCategoryAlerts = async () => {
    const response = await fetch('http://localhost:8000/category-alerts/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.ok) {
      const data = await response.json()
      setCategoryAlerts(data)
    }
  }

  const fetchAutomaticReorders = async () => {
    const response = await fetch('http://localhost:8000/automatic-reorders/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.ok) {
      const data = await response.json()
      setAutomaticReorders(data)
    }
  }

  const handleCreateSupplierPrice = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8000/supplier-product-prices/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newSupplierPrice)
      })
      
      if (response.ok) {
        addNotification('Preço de fornecedor criado com sucesso!', 'success')
        setNewSupplierPrice({
          supplier_id: '',
          product_id: '',
          price: '',
          minimum_quantity: '',
          delivery_time_days: ''
        })
        fetchSupplierPrices()
      } else {
        addNotification('Erro ao criar preço de fornecedor', 'error')
      }
    } catch (error) {
      addNotification('Erro ao criar preço de fornecedor', 'error')
    }
  }

  const handleCreateDepartmentLevel = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8000/department-stock-levels/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newDepartmentLevel)
      })
      
      if (response.ok) {
        addNotification('Nível de estoque por departamento criado com sucesso!', 'success')
        setNewDepartmentLevel({
          department_id: '',
          product_id: '',
          minimum_level: '',
          maximum_level: '',
          reorder_point: ''
        })
        fetchDepartmentLevels()
      } else {
        addNotification('Erro ao criar nível de estoque', 'error')
      }
    } catch (error) {
      addNotification('Erro ao criar nível de estoque', 'error')
    }
  }

  const handleCreateCategoryAlert = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8000/category-alerts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newCategoryAlert)
      })
      
      if (response.ok) {
        addNotification('Alerta de categoria criado com sucesso!', 'success')
        setNewCategoryAlert({
          category_id: '',
          alert_type: 'low_stock',
          threshold_value: '',
          notification_emails: ''
        })
        fetchCategoryAlerts()
      } else {
        addNotification('Erro ao criar alerta de categoria', 'error')
      }
    } catch (error) {
      addNotification('Erro ao criar alerta de categoria', 'error')
    }
  }

  const handleCreateAutomaticReorder = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8000/automatic-reorders/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newAutomaticReorder)
      })
      
      if (response.ok) {
        addNotification('Regra de reposição automática criada com sucesso!', 'success')
        setNewAutomaticReorder({
          product_id: '',
          supplier_id: '',
          trigger_level: '',
          reorder_quantity: '',
          is_active: true
        })
        fetchAutomaticReorders()
      } else {
        addNotification('Erro ao criar regra de reposição', 'error')
      }
    } catch (error) {
      addNotification('Erro ao criar regra de reposição', 'error')
    }
  }

  const processAutomaticReorder = async (reorderId) => {
    try {
      const response = await fetch(`http://localhost:8000/automatic-reorders/${reorderId}/process`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        addNotification('Reposição automática processada com sucesso!', 'success')
        fetchAutomaticReorders()
      } else {
        addNotification('Erro ao processar reposição automática', 'error')
      }
    } catch (error) {
      addNotification('Erro ao processar reposição automática', 'error')
    }
  }

  const renderSupplierPrices = () => (
    <div className="tab-content">
      <h3>📊 Preços por Fornecedor</h3>
      
      <form onSubmit={handleCreateSupplierPrice} className="form-section">
        <h4>Novo Preço de Fornecedor</h4>
        <div className="form-grid">
          <input
            type="text"
            placeholder="ID do Fornecedor"
            value={newSupplierPrice.supplier_id}
            onChange={(e) => setNewSupplierPrice({...newSupplierPrice, supplier_id: e.target.value})}
            required
          />
          <input
            type="text"
            placeholder="ID do Produto"
            value={newSupplierPrice.product_id}
            onChange={(e) => setNewSupplierPrice({...newSupplierPrice, product_id: e.target.value})}
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="Preço"
            value={newSupplierPrice.price}
            onChange={(e) => setNewSupplierPrice({...newSupplierPrice, price: e.target.value})}
            required
          />
          <input
            type="number"
            placeholder="Quantidade Mínima"
            value={newSupplierPrice.minimum_quantity}
            onChange={(e) => setNewSupplierPrice({...newSupplierPrice, minimum_quantity: e.target.value})}
          />
          <input
            type="number"
            placeholder="Prazo de Entrega (dias)"
            value={newSupplierPrice.delivery_time_days}
            onChange={(e) => setNewSupplierPrice({...newSupplierPrice, delivery_time_days: e.target.value})}
          />
        </div>
        <button type="submit" className="btn-primary">Criar Preço</button>
      </form>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Fornecedor</th>
              <th>Produto</th>
              <th>Preço</th>
              <th>Qtd. Mínima</th>
              <th>Prazo Entrega</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {supplierPrices.map((price) => (
              <tr key={price.id}>
                <td>{price.supplier_id}</td>
                <td>{price.product_id}</td>
                <td>R$ {price.price}</td>
                <td>{price.minimum_quantity}</td>
                <td>{price.delivery_time_days} dias</td>
                <td>
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

  const renderDepartmentLevels = () => (
    <div className="tab-content">
      <h3>🏢 Níveis por Departamento</h3>
      
      <form onSubmit={handleCreateDepartmentLevel} className="form-section">
        <h4>Novo Nível de Estoque</h4>
        <div className="form-grid">
          <input
            type="text"
            placeholder="ID do Departamento"
            value={newDepartmentLevel.department_id}
            onChange={(e) => setNewDepartmentLevel({...newDepartmentLevel, department_id: e.target.value})}
            required
          />
          <input
            type="text"
            placeholder="ID do Produto"
            value={newDepartmentLevel.product_id}
            onChange={(e) => setNewDepartmentLevel({...newDepartmentLevel, product_id: e.target.value})}
            required
          />
          <input
            type="number"
            placeholder="Nível Mínimo"
            value={newDepartmentLevel.minimum_level}
            onChange={(e) => setNewDepartmentLevel({...newDepartmentLevel, minimum_level: e.target.value})}
            required
          />
          <input
            type="number"
            placeholder="Nível Máximo"
            value={newDepartmentLevel.maximum_level}
            onChange={(e) => setNewDepartmentLevel({...newDepartmentLevel, maximum_level: e.target.value})}
            required
          />
          <input
            type="number"
            placeholder="Ponto de Reposição"
            value={newDepartmentLevel.reorder_point}
            onChange={(e) => setNewDepartmentLevel({...newDepartmentLevel, reorder_point: e.target.value})}
            required
          />
        </div>
        <button type="submit" className="btn-primary">Criar Nível</button>
      </form>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Departamento</th>
              <th>Produto</th>
              <th>Nível Mín.</th>
              <th>Nível Máx.</th>
              <th>Ponto Reposição</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {departmentLevels.map((level) => (
              <tr key={level.id}>
                <td>{level.department_id}</td>
                <td>{level.product_id}</td>
                <td>{level.minimum_level}</td>
                <td>{level.maximum_level}</td>
                <td>{level.reorder_point}</td>
                <td>
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

  const renderCategoryAlerts = () => (
    <div className="tab-content">
      <h3>🚨 Alertas por Categoria</h3>
      
      <form onSubmit={handleCreateCategoryAlert} className="form-section">
        <h4>Novo Alerta de Categoria</h4>
        <div className="form-grid">
          <input
            type="text"
            placeholder="ID da Categoria"
            value={newCategoryAlert.category_id}
            onChange={(e) => setNewCategoryAlert({...newCategoryAlert, category_id: e.target.value})}
            required
          />
          <select
            value={newCategoryAlert.alert_type}
            onChange={(e) => setNewCategoryAlert({...newCategoryAlert, alert_type: e.target.value})}
            required
          >
            <option value="low_stock">Estoque Baixo</option>
            <option value="expiry_warning">Aviso de Vencimento</option>
            <option value="overstock">Excesso de Estoque</option>
          </select>
          <input
            type="number"
            placeholder="Valor do Limite"
            value={newCategoryAlert.threshold_value}
            onChange={(e) => setNewCategoryAlert({...newCategoryAlert, threshold_value: e.target.value})}
            required
          />
          <input
            type="email"
            placeholder="E-mails para Notificação"
            value={newCategoryAlert.notification_emails}
            onChange={(e) => setNewCategoryAlert({...newCategoryAlert, notification_emails: e.target.value})}
          />
        </div>
        <button type="submit" className="btn-primary">Criar Alerta</button>
      </form>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Categoria</th>
              <th>Tipo de Alerta</th>
              <th>Limite</th>
              <th>E-mails</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {categoryAlerts.map((alert) => (
              <tr key={alert.id}>
                <td>{alert.category_id}</td>
                <td>{alert.alert_type}</td>
                <td>{alert.threshold_value}</td>
                <td>{alert.notification_emails}</td>
                <td>
                  <span className={`status-badge ${alert.is_active ? 'status-success' : 'status-warning'}`}>
                    {alert.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td>
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

  const renderAutomaticReorders = () => (
    <div className="tab-content">
      <h3>🔄 Reposição Automática</h3>
      
      <form onSubmit={handleCreateAutomaticReorder} className="form-section">
        <h4>Nova Regra de Reposição</h4>
        <div className="form-grid">
          <input
            type="text"
            placeholder="ID do Produto"
            value={newAutomaticReorder.product_id}
            onChange={(e) => setNewAutomaticReorder({...newAutomaticReorder, product_id: e.target.value})}
            required
          />
          <input
            type="text"
            placeholder="ID do Fornecedor"
            value={newAutomaticReorder.supplier_id}
            onChange={(e) => setNewAutomaticReorder({...newAutomaticReorder, supplier_id: e.target.value})}
            required
          />
          <input
            type="number"
            placeholder="Nível de Disparo"
            value={newAutomaticReorder.trigger_level}
            onChange={(e) => setNewAutomaticReorder({...newAutomaticReorder, trigger_level: e.target.value})}
            required
          />
          <input
            type="number"
            placeholder="Quantidade de Reposição"
            value={newAutomaticReorder.reorder_quantity}
            onChange={(e) => setNewAutomaticReorder({...newAutomaticReorder, reorder_quantity: e.target.value})}
            required
          />
          <label>
            <input
              type="checkbox"
              checked={newAutomaticReorder.is_active}
              onChange={(e) => setNewAutomaticReorder({...newAutomaticReorder, is_active: e.target.checked})}
            />
            Ativo
          </label>
        </div>
        <button type="submit" className="btn-primary">Criar Regra</button>
      </form>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Fornecedor</th>
              <th>Nível Disparo</th>
              <th>Qtd. Reposição</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {automaticReorders.map((reorder) => (
              <tr key={reorder.id}>
                <td>{reorder.product_id}</td>
                <td>{reorder.supplier_id}</td>
                <td>{reorder.trigger_level}</td>
                <td>{reorder.reorder_quantity}</td>
                <td>
                  <span className={`status-badge ${reorder.is_active ? 'status-success' : 'status-warning'}`}>
                    {reorder.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td>
                  <button 
                    className="btn-small btn-primary"
                    onClick={() => processAutomaticReorder(reorder.id)}
                  >
                    Processar
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

  return (
    <div className="advanced-stock-module">
      <div className="module-header">
        <h2>📦 Gestão Avançada de Estoque</h2>
        <p>Controle avançado de preços, níveis e reposição automática</p>
      </div>

      <div className="module-tabs">
        <button 
          className={`tab-button ${activeTab === 'supplier-prices' ? 'active' : ''}`}
          onClick={() => setActiveTab('supplier-prices')}
        >
          Preços por Fornecedor
        </button>
        <button 
          className={`tab-button ${activeTab === 'department-levels' ? 'active' : ''}`}
          onClick={() => setActiveTab('department-levels')}
        >
          Níveis por Departamento
        </button>
        <button 
          className={`tab-button ${activeTab === 'category-alerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('category-alerts')}
        >
          Alertas por Categoria
        </button>
        <button 
          className={`tab-button ${activeTab === 'automatic-reorders' ? 'active' : ''}`}
          onClick={() => setActiveTab('automatic-reorders')}
        >
          Reposição Automática
        </button>
      </div>

      <div className="module-content">
        {loading ? (
          <div className="loading-spinner">Carregando...</div>
        ) : (
          <>
            {activeTab === 'supplier-prices' && renderSupplierPrices()}
            {activeTab === 'department-levels' && renderDepartmentLevels()}
            {activeTab === 'category-alerts' && renderCategoryAlerts()}
            {activeTab === 'automatic-reorders' && renderAutomaticReorders()}
          </>
        )}
      </div>
    </div>
  )
}

export default AdvancedStockManagementModule