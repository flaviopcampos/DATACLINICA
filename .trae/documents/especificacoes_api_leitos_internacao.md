# Especificações de API - Sistema de Leitos e Internação
## DataClínica - Documentação Técnica Completa

---

## 1. Visão Geral da API

### 1.1 Base URL
```
Production: https://api.dataclinica.com.br/v1
Staging: https://staging-api.dataclinica.com.br/v1
Development: http://localhost:8000/api/v1
```

### 1.2 Autenticação
Todas as requisições devem incluir o token JWT no header:
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### 1.3 Códigos de Resposta Padrão
| Código | Descrição |
|--------|----------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 400 | Erro de validação |
| 401 | Não autorizado |
| 403 | Acesso negado |
| 404 | Recurso não encontrado |
| 422 | Erro de processamento |
| 500 | Erro interno do servidor |

---

## 2. Módulo de Departamentos

### 2.1 Listar Departamentos
```http
GET /departments
```

**Query Parameters:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|----------|
| skip | integer | Não | Número de registros para pular (default: 0) |
| limit | integer | Não | Limite de registros (default: 100, max: 1000) |
| is_active | boolean | Não | Filtrar por status ativo |

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "clinic_id": 1,
      "name": "Masculino",
      "code": "MASC",
      "description": "Departamento masculino",
      "capacity": 20,
      "floor": "1º Andar",
      "responsible_user_id": 5,
      "is_active": true,
      "created_at": "2024-01-15T10:00:00Z",
      "responsible": {
        "id": 5,
        "name": "Dr. João Silva",
        "email": "joao@dataclinica.com.br"
      },
      "rooms_count": 8,
      "beds_count": 20,
      "occupied_beds": 15
    }
  ],
  "total": 1,
  "skip": 0,
  "limit": 100
}
```

### 2.2 Criar Departamento
```http
POST /departments
```

**Request Body:**
```json
{
  "name": "Feminino",
  "code": "FEM",
  "description": "Departamento feminino",
  "capacity": 15,
  "floor": "2º Andar",
  "responsible_user_id": 6
}
```

**Response 201:**
```json
{
  "id": 2,
  "clinic_id": 1,
  "name": "Feminino",
  "code": "FEM",
  "description": "Departamento feminino",
  "capacity": 15,
  "floor": "2º Andar",
  "responsible_user_id": 6,
  "is_active": true,
  "created_at": "2024-01-15T14:30:00Z"
}
```

---

## 3. Módulo de Quartos

### 3.1 Listar Quartos
```http
GET /rooms
```

**Query Parameters:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|----------|
| department_id | integer | Não | Filtrar por departamento |
| room_type | string | Não | Filtrar por tipo (standard, suite, isolamento, uti) |
| has_available_beds | boolean | Não | Apenas quartos com leitos disponíveis |

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "clinic_id": 1,
      "department_id": 1,
      "room_number": "101",
      "room_name": "Quarto Azul",
      "room_type": "standard",
      "capacity": 2,
      "floor": "1º Andar",
      "area_m2": 25.5,
      "has_bathroom": true,
      "has_air_conditioning": true,
      "has_tv": false,
      "is_active": true,
      "department": {
        "id": 1,
        "name": "Masculino",
        "code": "MASC"
      },
      "beds": [
        {
          "id": 1,
          "bed_number": "101A",
          "status": "occupied"
        },
        {
          "id": 2,
          "bed_number": "101B",
          "status": "available"
        }
      ],
      "available_beds_count": 1,
      "occupied_beds_count": 1
    }
  ]
}
```

### 3.2 Criar Quarto
```http
POST /rooms
```

**Request Body:**
```json
{
  "department_id": 1,
  "room_number": "102",
  "room_name": "Quarto Verde",
  "room_type": "standard",
  "capacity": 1,
  "floor": "1º Andar",
  "area_m2": 20.0,
  "has_bathroom": true,
  "has_air_conditioning": false,
  "has_tv": true
}
```

---

## 4. Módulo de Leitos

### 4.1 Dashboard de Ocupação
```http
GET /beds/occupancy-dashboard
```

**Response 200:**
```json
{
  "total_beds": 50,
  "occupied_beds": 35,
  "available_beds": 12,
  "maintenance_beds": 2,
  "reserved_beds": 1,
  "occupancy_rate": 70.0,
  "departments_occupancy": [
    {
      "department_id": 1,
      "name": "Masculino",
      "total_beds": 20,
      "occupied_beds": 15,
      "available_beds": 4,
      "maintenance_beds": 1,
      "occupancy_rate": 75.0
    },
    {
      "department_id": 2,
      "name": "Feminino",
      "total_beds": 15,
      "occupied_beds": 10,
      "available_beds": 5,
      "maintenance_beds": 0,
      "occupancy_rate": 66.7
    }
  ],
  "occupancy_trend": [
    {
      "date": "2024-01-01",
      "occupancy_rate": 68.0
    },
    {
      "date": "2024-01-02",
      "occupancy_rate": 72.0
    }
  ]
}
```

### 4.2 Listar Leitos
```http
GET /beds
```

**Query Parameters:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|----------|
| department_id | integer | Não | Filtrar por departamento |
| room_id | integer | Não | Filtrar por quarto |
| status | string | Não | available, occupied, maintenance, reserved, blocked |
| bed_type | string | Não | standard, uti, isolamento, observacao |
| include_patient | boolean | Não | Incluir dados do paciente atual |

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "clinic_id": 1,
      "room_id": 1,
      "bed_number": "101A",
      "bed_code": "MASC-101-A",
      "bed_type": "standard",
      "bed_category": "masculino",
      "status": "occupied",
      "status_reason": "Paciente internado",
      "status_changed_at": "2024-01-10T08:00:00Z",
      "current_patient_id": 123,
      "current_admission_id": 456,
      "has_oxygen": false,
      "has_suction": false,
      "has_monitor": false,
      "is_active": true,
      "room": {
        "id": 1,
        "room_number": "101",
        "room_name": "Quarto Azul",
        "department": {
          "id": 1,
          "name": "Masculino",
          "code": "MASC"
        }
      },
      "current_patient": {
        "id": 123,
        "name": "João Santos",
        "cpf": "123.456.789-00"
      },
      "current_admission": {
        "id": 456,
        "admission_number": "ADM-2024-001",
        "admission_date": "2024-01-10T08:00:00Z",
        "days_admitted": 5
      }
    }
  ]
}
```

### 4.3 Buscar Leitos Disponíveis
```http
GET /beds/available
```

**Query Parameters:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|----------|
| department_id | integer | Não | Filtrar por departamento |
| bed_type | string | Não | Tipo de leito necessário |
| bed_category | string | Não | masculino, feminino, misto |
| has_oxygen | boolean | Não | Requer oxigênio |
| has_monitor | boolean | Não | Requer monitor |

**Response 200:**
```json
{
  "data": [
    {
      "id": 2,
      "bed_number": "101B",
      "bed_code": "MASC-101-B",
      "bed_type": "standard",
      "room": {
        "room_number": "101",
        "room_name": "Quarto Azul",
        "department": {
          "name": "Masculino"
        }
      },
      "equipment": {
        "has_oxygen": false,
        "has_suction": false,
        "has_monitor": false
      }
    }
  ],
  "total_available": 1
}
```

### 4.4 Atualizar Status do Leito
```http
PUT /beds/{bed_id}/status
```

**Request Body:**
```json
{
  "new_status": "maintenance",
  "reason": "Manutenção preventiva do ar condicionado",
  "expected_duration_hours": 4
}
```

**Response 200:**
```json
{
  "message": "Status do leito atualizado com sucesso",
  "bed": {
    "id": 1,
    "status": "maintenance",
    "status_reason": "Manutenção preventiva do ar condicionado",
    "status_changed_at": "2024-01-15T14:30:00Z",
    "status_changed_by": {
      "id": 10,
      "name": "Maria Enfermeira"
    }
  }
}
```

### 4.5 Histórico de Status do Leito
```http
GET /beds/{bed_id}/status-history
```

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "previous_status": "available",
      "new_status": "occupied",
      "reason": "Internação do paciente João Santos",
      "changed_by": {
        "id": 8,
        "name": "Dr. Carlos Medico"
      },
      "changed_at": "2024-01-10T08:00:00Z"
    },
    {
      "id": 2,
      "previous_status": "occupied",
      "new_status": "available",
      "reason": "Alta médica",
      "changed_by": {
        "id": 8,
        "name": "Dr. Carlos Medico"
      },
      "changed_at": "2024-01-08T16:30:00Z"
    }
  ]
}
```

---

## 5. Módulo de Configuração de Diárias

### 5.1 Listar Configurações de Diárias
```http
GET /daily-rate-configs
```

**Query Parameters:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|----------|
| payment_type | string | Não | sus, insurance, private |
| is_active | boolean | Não | Apenas configurações ativas |
| effective_date | date | Não | Data de vigência |

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "clinic_id": 1,
      "config_name": "Diárias Particulares 2024",
      "description": "Configuração de diárias para pacientes particulares",
      "payment_type": "private",
      "insurance_plan_id": null,
      "is_active": true,
      "effective_date": "2024-01-01",
      "expiry_date": "2024-12-31",
      "created_at": "2023-12-15T10:00:00Z",
      "rate_tiers": [
        {
          "id": 1,
          "tier_name": "1-30 dias",
          "tier_order": 1,
          "min_days": 1,
          "max_days": 30,
          "daily_rate": 250.00,
          "weekend_rate": 275.00,
          "holiday_rate": 300.00
        },
        {
          "id": 2,
          "tier_name": "31-60 dias",
          "tier_order": 2,
          "min_days": 31,
          "max_days": 60,
          "daily_rate": 200.00,
          "weekend_rate": 220.00,
          "holiday_rate": 240.00
        }
      ]
    }
  ]
}
```

### 5.2 Criar Configuração de Diárias
```http
POST /daily-rate-configs
```

**Request Body:**
```json
{
  "config_name": "Diárias SUS 2024",
  "description": "Configuração de diárias para pacientes do SUS",
  "payment_type": "sus",
  "effective_date": "2024-01-01",
  "expiry_date": "2024-12-31",
  "rate_tiers": [
    {
      "tier_name": "1-30 dias",
      "tier_order": 1,
      "min_days": 1,
      "max_days": 30,
      "daily_rate": 120.00,
      "includes_meals": true,
      "includes_medication": false
    },
    {
      "tier_name": "31-60 dias",
      "tier_order": 2,
      "min_days": 31,
      "max_days": 60,
      "daily_rate": 100.00,
      "includes_meals": true,
      "includes_medication": false
    }
  ]
}
```

### 5.3 Simular Cálculo de Diárias
```http
POST /daily-rate-configs/{config_id}/simulate
```

**Request Body:**
```json
{
  "admission_date": "2024-01-01",
  "discharge_date": "2024-02-15",
  "include_weekends": true,
  "include_holidays": true
}
```

**Response 200:**
```json
{
  "total_days": 45,
  "breakdown": [
    {
      "tier_name": "1-30 dias",
      "days": 30,
      "daily_rate": 250.00,
      "subtotal": 7500.00
    },
    {
      "tier_name": "31-60 dias",
      "days": 15,
      "daily_rate": 200.00,
      "subtotal": 3000.00
    }
  ],
  "total_amount": 10500.00,
  "average_daily_rate": 233.33
}
```

---

## 6. Módulo de Internações

### 6.1 Listar Internações
```http
GET /admissions
```

**Query Parameters:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|----------|
| status | string | Não | active, discharged, transferred, deceased |
| patient_id | integer | Não | Filtrar por paciente |
| bed_id | integer | Não | Filtrar por leito |
| admission_date_from | date | Não | Data de internação inicial |
| admission_date_to | date | Não | Data de internação final |
| payment_type | string | Não | sus, insurance, private |

**Response 200:**
```json
{
  "data": [
    {
      "id": 456,
      "clinic_id": 1,
      "patient_id": 123,
      "bed_id": 1,
      "admission_number": "ADM-2024-001",
      "admission_date": "2024-01-10T08:00:00Z",
      "expected_discharge_date": "2024-02-10T08:00:00Z",
      "actual_discharge_date": null,
      "admission_type": "voluntary",
      "admission_reason": "Dependência química - álcool",
      "payment_type": "private",
      "status": "active",
      "total_days": 5,
      "total_amount": 1250.00,
      "amount_paid": 0.00,
      "amount_pending": 1250.00,
      "patient": {
        "id": 123,
        "name": "João Santos",
        "cpf": "123.456.789-00",
        "birth_date": "1985-05-15"
      },
      "bed": {
        "id": 1,
        "bed_number": "101A",
        "bed_code": "MASC-101-A",
        "room": {
          "room_number": "101",
          "department": {
            "name": "Masculino"
          }
        }
      },
      "daily_rate_config": {
        "id": 1,
        "config_name": "Diárias Particulares 2024",
        "payment_type": "private"
      }
    }
  ]
}
```

### 6.2 Criar Internação
```http
POST /admissions
```

**Request Body:**
```json
{
  "patient_id": 123,
  "bed_id": 2,
  "admission_date": "2024-01-15T10:00:00Z",
  "expected_discharge_date": "2024-03-15T10:00:00Z",
  "admission_type": "voluntary",
  "admission_reason": "Dependência química - cocaína",
  "referring_doctor": "Dr. Ana Silva",
  "referring_institution": "Hospital São José",
  "payment_type": "insurance",
  "insurance_plan_id": 5,
  "insurance_authorization": "AUTH-2024-12345",
  "daily_rate_config_id": 2
}
```

**Response 201:**
```json
{
  "id": 457,
  "admission_number": "ADM-2024-002",
  "clinic_id": 1,
  "patient_id": 123,
  "bed_id": 2,
  "admission_date": "2024-01-15T10:00:00Z",
  "expected_discharge_date": "2024-03-15T10:00:00Z",
  "admission_type": "voluntary",
  "payment_type": "insurance",
  "status": "active",
  "created_at": "2024-01-15T10:00:00Z",
  "message": "Internação criada com sucesso. Leito 102A foi ocupado."
}
```

### 6.3 Dar Alta ao Paciente
```http
PUT /admissions/{admission_id}/discharge
```

**Request Body:**
```json
{
  "discharge_date": "2024-01-20T14:00:00Z",
  "discharge_type": "medical_discharge",
  "discharge_reason": "Tratamento concluído com sucesso",
  "discharge_destination": "Residência",
  "discharge_notes": "Paciente apresentou boa evolução durante o tratamento. Orientado sobre continuidade ambulatorial."
}
```

**Response 200:**
```json
{
  "message": "Alta realizada com sucesso",
  "admission": {
    "id": 456,
    "status": "discharged",
    "actual_discharge_date": "2024-01-20T14:00:00Z",
    "total_days": 10,
    "total_amount": 2500.00,
    "discharge_type": "medical_discharge"
  },
  "bed_status": {
    "bed_id": 1,
    "new_status": "available",
    "message": "Leito 101A liberado para nova internação"
  },
  "billing": {
    "final_billing_generated": true,
    "total_amount": 2500.00,
    "billing_id": 789
  }
}
```

### 6.4 Transferir Paciente de Leito
```http
POST /admissions/{admission_id}/transfer
```

**Request Body:**
```json
{
  "to_bed_id": 5,
  "transfer_reason": "Necessidade de isolamento",
  "notes": "Paciente apresentou sintomas que requerem isolamento preventivo"
}
```

**Response 200:**
```json
{
  "message": "Transferência realizada com sucesso",
  "transfer": {
    "id": 10,
    "admission_id": 456,
    "from_bed_id": 1,
    "to_bed_id": 5,
    "transfer_date": "2024-01-18T09:00:00Z",
    "transfer_reason": "Necessidade de isolamento"
  },
  "bed_changes": {
    "previous_bed": {
      "bed_id": 1,
      "new_status": "available"
    },
    "new_bed": {
      "bed_id": 5,
      "new_status": "occupied"
    }
  }
}
```

---

## 7. Módulo de Faturamento

### 7.1 Listar Faturamentos
```http
GET /admission-billing
```

**Query Parameters:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|----------|
| admission_id | integer | Não | Filtrar por internação |
| billing_status | string | Não | pending, billed, paid, cancelled |
| billing_date_from | date | Não | Data de faturamento inicial |
| billing_date_to | date | Não | Data de faturamento final |
| payment_type | string | Não | sus, insurance, private |

**Response 200:**
```json
{
  "data": [
    {
      "id": 789,
      "clinic_id": 1,
      "admission_id": 456,
      "billing_period_start": "2024-01-10",
      "billing_period_end": "2024-01-20",
      "days_in_period": 10,
      "daily_rate_applied": 250.00,
      "base_amount": 2500.00,
      "additional_charges": 0.00,
      "discounts": 0.00,
      "total_amount": 2500.00,
      "billing_status": "billed",
      "billing_date": "2024-01-20T16:00:00Z",
      "due_date": "2024-02-20",
      "payment_date": null,
      "admission": {
        "id": 456,
        "admission_number": "ADM-2024-001",
        "patient": {
          "name": "João Santos",
          "cpf": "123.456.789-00"
        }
      },
      "billing_items": [
        {
          "id": 1,
          "item_type": "daily_rate",
          "item_description": "Diária padrão (1-30 dias)",
          "quantity": 10,
          "unit_price": 250.00,
          "total_price": 2500.00
        }
      ]
    }
  ]
}
```

### 7.2 Gerar Faturamento Manual
```http
POST /admission-billing
```

**Request Body:**
```json
{
  "admission_id": 456,
  "billing_period_start": "2024-01-10",
  "billing_period_end": "2024-01-20",
  "additional_charges": 100.00,
  "discounts": 50.00,
  "notes": "Cobrança adicional por medicamentos especiais"
}
```

### 7.3 Registrar Pagamento
```http
PUT /admission-billing/{billing_id}/payment
```

**Request Body:**
```json
{
  "payment_date": "2024-01-25T10:00:00Z",
  "payment_method": "transfer",
  "payment_reference": "TED-123456789",
  "amount_paid": 2500.00,
  "notes": "Pagamento via transferência bancária"
}
```

**Response 200:**
```json
{
  "message": "Pagamento registrado com sucesso",
  "billing": {
    "id": 789,
    "billing_status": "paid",
    "payment_date": "2024-01-25T10:00:00Z",
    "amount_paid": 2500.00,
    "amount_pending": 0.00
  }
}
```

---

## 8. Módulo de Relatórios

### 8.1 Relatório de Ocupação
```http
GET /reports/occupancy
```

**Query Parameters:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|----------|
| start_date | date | Sim | Data inicial |
| end_date | date | Sim | Data final |
| department_id | integer | Não | Filtrar por departamento |
| group_by | string | Não | day, week, month |

**Response 200:**
```json
{
  "period": {
    "start_date": "2024-01-01",
    "end_date": "2024-01-31",
    "total_days": 31
  },
  "summary": {
    "average_occupancy_rate": 72.5,
    "peak_occupancy_rate": 95.0,
    "lowest_occupancy_rate": 45.0,
    "total_admissions": 25,
    "total_discharges": 23,
    "average_stay_days": 18.5
  },
  "daily_data": [
    {
      "date": "2024-01-01",
      "total_beds": 50,
      "occupied_beds": 35,
      "occupancy_rate": 70.0,
      "new_admissions": 2,
      "discharges": 1
    }
  ],
  "department_breakdown": [
    {
      "department_id": 1,
      "department_name": "Masculino",
      "average_occupancy_rate": 75.0,
      "total_admissions": 15
    }
  ]
}
```

### 8.2 Relatório Financeiro
```http
GET /reports/financial
```

**Query Parameters:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|----------|
| start_date | date | Sim | Data inicial |
| end_date | date | Sim | Data final |
| payment_type | string | Não | sus, insurance, private |
| group_by | string | Não | day, week, month |

**Response 200:**
```json
{
  "period": {
    "start_date": "2024-01-01",
    "end_date": "2024-01-31"
  },
  "summary": {
    "total_revenue": 125000.00,
    "total_billed": 130000.00,
    "total_paid": 120000.00,
    "total_pending": 10000.00,
    "average_daily_rate": 225.50,
    "total_patient_days": 578
  },
  "by_payment_type": [
    {
      "payment_type": "private",
      "total_revenue": 75000.00,
      "percentage": 60.0,
      "average_daily_rate": 250.00
    },
    {
      "payment_type": "insurance",
      "total_revenue": 35000.00,
      "percentage": 28.0,
      "average_daily_rate": 180.00
    },
    {
      "payment_type": "sus",
      "total_revenue": 15000.00,
      "percentage": 12.0,
      "average_daily_rate": 120.00
    }
  ],
  "monthly_trend": [
    {
      "month": "2024-01",
      "total_revenue": 125000.00,
      "occupancy_rate": 72.5
    }
  ]
}
```

---

## 9. Webhooks e Notificações

### 9.1 Configurar Webhook
```http
POST /webhooks
```

**Request Body:**
```json
{
  "url": "https://meusite.com.br/webhook/dataclinica",
  "events": ["admission.created", "admission.discharged", "bed.status_changed"],
  "secret": "meu_secret_webhook",
  "is_active": true
}
```

### 9.2 Eventos Disponíveis

| Evento | Descrição |
|--------|----------|
| `admission.created` | Nova internação criada |
| `admission.discharged` | Paciente recebeu alta |
| `admission.transferred` | Paciente transferido de leito |
| `bed.status_changed` | Status do leito alterado |
| `billing.generated` | Novo faturamento gerado |
| `billing.paid` | Faturamento pago |

### 9.3 Formato do Payload
```json
{
  "event": "admission.created",
  "timestamp": "2024-01-15T10:00:00Z",
  "clinic_id": 1,
  "data": {
    "admission": {
      "id": 457,
      "admission_number": "ADM-2024-002",
      "patient_id": 123,
      "bed_id": 2,
      "admission_date": "2024-01-15T10:00:00Z"
    }
  }
}
```

---

## 10. Códigos de Erro Específicos

### 10.1 Erros de Leitos
| Código | Mensagem | Descrição |
|--------|----------|----------|
| BED_001 | Leito não disponível | Tentativa de internar em leito ocupado |
| BED_002 | Leito em manutenção | Tentativa de usar leito em manutenção |
| BED_003 | Leito não encontrado | ID do leito inválido |
| BED_004 | Mudança de status inválida | Transição de status não permitida |

### 10.2 Erros de Internação
| Código | Mensagem | Descrição |
|--------|----------|----------|
| ADM_001 | Paciente já internado | Tentativa de internar paciente já ativo |
| ADM_002 | Configuração de diárias inválida | Config de diárias não encontrada |
| ADM_003 | Data de alta inválida | Data anterior à internação |
| ADM_004 | Autorização do plano requerida | Plano de saúde requer autorização |

### 10.3 Erros de Faturamento
| Código | Mensagem | Descrição |
|--------|----------|----------|
| BILL_001 | Período de faturamento inválido | Datas inconsistentes |
| BILL_002 | Faturamento já existe | Tentativa de duplicar faturamento |
| BILL_003 | Valor de pagamento inválido | Valor maior que o devido |

---

**Esta documentação de API fornece todas as especificações necessárias para implementar e integrar o sistema completo de leitos e internação do DataClínica, garantindo consistência e facilidade de desenvolvimento.**