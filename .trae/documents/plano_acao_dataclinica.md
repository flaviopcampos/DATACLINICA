# Plano de Ação - DataClínica
## Sistema de Gestão para Clínicas de Dependentes Químicos e Saúde Mental

---

## 1. Análise do Estado Atual do Sistema

### 1.1 Funcionalidades Já Implementadas ✅

O sistema DataClínica já possui uma base sólida com as seguintes funcionalidades:

**Gestão de Pacientes:**
- Cadastro completo de pacientes com dados pessoais
- Sistema de documentos do paciente
- Filtros avançados e busca
- Controle LGPD

**Prontuário Eletrônico:**
- Anamnese detalhada
- Exame físico estruturado
- Prescrições médicas digitais
- Documentos médicos (atestados, laudos)
- Diagnósticos CID-10

**Faturamento e Financeiro:**
- Sistema TISS completo
- Contas a pagar e receber
- Controle de convênios
- Transações financeiras

**Agendamento:**
- Sistema completo de consultas
- Controle de horários
- Salas de atendimento

**Controle de Acesso:**
- Sistema de usuários com roles
- Auditoria completa
- Logs de acesso

### 1.2 Funcionalidades Faltantes para Clínicas de Dependência Química ❌

**Críticas (Prioridade Alta):**
1. Sistema de Leitos e Quartos
2. Alocação de Pacientes a Leitos
3. Tipos de Pagamento Diferenciados (SUS, Plano, Particular)
4. Sistema de Diárias Variáveis por Tempo de Internação
5. Faturamento Automático por Dias de Internação
6. Controle Granular de Permissões por Usuário

**Importantes (Prioridade Média):**
7. Relatórios de Ocupação de Leitos
8. Previsão Orçamentária
9. Controle de Alta, Transferência e Óbito
10. Histórico de Internações

---

## 2. Funcionalidades Específicas a Implementar

### 2.1 Sistema de Leitos e Quartos

**Modelos Necessários:**

```python
class Room(Base):
    __tablename__ = "rooms"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False)
    room_number = Column(String(20), nullable=False)
    room_name = Column(String(100))
    department = Column(String(100))  # masculino, feminino, misto, isolamento
    room_type = Column(String(50))  # standard, suite, isolamento, observacao
    capacity = Column(Integer, default=1)  # número máximo de leitos
    floor = Column(String(10))
    description = Column(Text)
    amenities = Column(JSON)  # ar_condicionado, tv, banheiro_privativo
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    clinic = relationship("Clinic")
    beds = relationship("Bed", back_populates="room")

class Bed(Base):
    __tablename__ = "beds"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    bed_number = Column(String(20), nullable=False)
    bed_type = Column(String(50))  # standard, uti, observacao
    status = Column(String(50), default="available")  # available, occupied, maintenance, reserved, blocked
    current_patient_id = Column(Integer, ForeignKey("patients.id"))
    last_cleaning = Column(DateTime)
    maintenance_notes = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    clinic = relationship("Clinic")
    room = relationship("Room", back_populates="beds")
    current_patient = relationship("Patient")
    admissions = relationship("PatientAdmission", back_populates="bed")
```

### 2.2 Sistema de Internação

```python
class PatientAdmission(Base):
    __tablename__ = "patient_admissions"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    bed_id = Column(Integer, ForeignKey("beds.id"), nullable=False)
    admission_number = Column(String(50), unique=True, index=True)
    admission_date = Column(DateTime, nullable=False)
    discharge_date = Column(DateTime)
    admission_type = Column(String(50))  # voluntary, involuntary, judicial
    payment_type = Column(String(50), nullable=False)  # sus, insurance, private
    insurance_plan_id = Column(Integer, ForeignKey("insurance_plans.id"))
    daily_rate_config_id = Column(Integer, ForeignKey("daily_rate_configs.id"))
    status = Column(String(50), default="active")  # active, discharged, transferred, deceased
    discharge_reason = Column(String(100))  # medical_discharge, voluntary_discharge, transfer, death
    discharge_notes = Column(Text)
    total_days = Column(Integer, default=0)
    total_amount = Column(Numeric(15, 2), default=0)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    clinic = relationship("Clinic")
    patient = relationship("Patient")
    bed = relationship("Bed", back_populates="admissions")
    insurance_plan = relationship("InsurancePlan")
    daily_rate_config = relationship("DailyRateConfig")
    creator = relationship("User")
    billing_records = relationship("AdmissionBilling", back_populates="admission")
```

### 2.3 Sistema de Diárias Variáveis

```python
class DailyRateConfig(Base):
    __tablename__ = "daily_rate_configs"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False)
    config_name = Column(String(100), nullable=False)
    payment_type = Column(String(50), nullable=False)  # sus, insurance, private
    insurance_plan_id = Column(Integer, ForeignKey("insurance_plans.id"))  # null para SUS e particular
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    clinic = relationship("Clinic")
    insurance_plan = relationship("InsurancePlan")
    rate_tiers = relationship("DailyRateTier", back_populates="config")

class DailyRateTier(Base):
    __tablename__ = "daily_rate_tiers"
    
    id = Column(Integer, primary_key=True, index=True)
    config_id = Column(Integer, ForeignKey("daily_rate_configs.id"), nullable=False)
    tier_name = Column(String(100), nullable=False)  # "1-30 dias", "31-60 dias", etc.
    min_days = Column(Integer, nullable=False)  # 1, 31, 61, 91
    max_days = Column(Integer, nullable=False)  # 30, 60, 90, 120
    daily_rate = Column(Numeric(10, 2), nullable=False)
    description = Column(Text)
    
    # Relacionamentos
    config = relationship("DailyRateConfig", back_populates="rate_tiers")
```

### 2.4 Sistema de Faturamento por Internação

```python
class AdmissionBilling(Base):
    __tablename__ = "admission_billing"
    
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False)
    admission_id = Column(Integer, ForeignKey("patient_admissions.id"), nullable=False)
    billing_period_start = Column(Date, nullable=False)
    billing_period_end = Column(Date, nullable=False)
    days_in_period = Column(Integer, nullable=False)
    daily_rate_applied = Column(Numeric(10, 2), nullable=False)
    total_amount = Column(Numeric(15, 2), nullable=False)
    billing_status = Column(String(50), default="pending")  # pending, billed, paid, cancelled
    billing_date = Column(DateTime)
    payment_date = Column(DateTime)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    clinic = relationship("Clinic")
    admission = relationship("PatientAdmission", back_populates="billing_records")
```

### 2.5 Sistema de Permissões Granulares

```python
class UserPermission(Base):
    __tablename__ = "user_permissions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    module = Column(String(100), nullable=False)  # patients, admissions, billing, reports
    permission = Column(String(100), nullable=False)  # create, read, update, delete, export
    granted_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    granted_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relacionamentos
    user = relationship("User", foreign_keys=[user_id])
    granter = relationship("User", foreign_keys=[granted_by])

class ModuleAccess(Base):
    __tablename__ = "module_access"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    module_name = Column(String(100), nullable=False)
    can_access = Column(Boolean, default=False)
    can_create = Column(Boolean, default=False)
    can_edit = Column(Boolean, default=False)
    can_delete = Column(Boolean, default=False)
    can_export = Column(Boolean, default=False)
    configured_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    configured_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    user = relationship("User", foreign_keys=[user_id])
    configurator = relationship("User", foreign_keys=[configured_by])
```

---

## 3. Comparação com DataSigh

### 3.1 Funcionalidades do DataSigh Identificadas

**Já Implementadas no DataClínica:**
- ✅ Prontuário eletrônico inteligente
- ✅ Agendamento de consultas
- ✅ Controle de estoque e farmácia
- ✅ Faturamento e financeiro
- ✅ Relatórios e dashboards
- ✅ Integração com sistemas externos

**Faltantes no DataClínica:**
- ❌ Cálculo automático de risco cirúrgico e coronariano
- ❌ Integração com equipamentos de diagnóstico e imagem
- ❌ Transcrição automática de consultas
- ❌ Análise de dados clínicos com IA
- ❌ Integração bancária para cobrança automática
- ❌ Sistema PACS completo
- ❌ Aplicativo móvel para pacientes
- ❌ WhatsApp Business integrado

### 3.2 Funcionalidades Prioritárias a Implementar

**Prioridade Alta:**
1. Integração WhatsApp Business para comunicação
2. Aplicativo móvel básico para pacientes
3. Cálculo de riscos médicos automatizado

**Prioridade Média:**
4. Sistema PACS básico
5. Transcrição de consultas
6. Integração bancária

---

## 4. Cronograma de Implementação

### Fase 1 - Funcionalidades Críticas (4-6 semanas)

**Semana 1-2: Sistema de Leitos e Quartos**
- Criar modelos Room e Bed
- Implementar CRUD completo
- Interface de gestão de leitos
- Dashboard de ocupação em tempo real

**Semana 3-4: Sistema de Internação**
- Criar modelo PatientAdmission
- Implementar processo de internação
- Alocação automática de leitos
- Controle de status de internação

**Semana 5-6: Sistema de Diárias**
- Criar modelos DailyRateConfig e DailyRateTier
- Interface de configuração de diárias
- Cálculo automático baseado em tempo
- Integração com faturamento

### Fase 2 - Faturamento e Permissões (3-4 semanas)

**Semana 7-8: Faturamento por Internação**
- Criar modelo AdmissionBilling
- Cálculo automático de valores
- Relatórios de faturamento
- Integração com contas a receber

**Semana 9-10: Sistema de Permissões**
- Criar modelos UserPermission e ModuleAccess
- Interface de gestão de permissões
- Middleware de controle de acesso
- Restrição de cadastro de usuários apenas para admins

### Fase 3 - Funcionalidades do DataSigh (6-8 semanas)

**Semana 11-12: Integração WhatsApp**
- API WhatsApp Business
- Notificações automáticas
- Confirmação de consultas

**Semana 13-14: Aplicativo Móvel Básico**
- React Native ou PWA
- Consulta de prontuários
- Agendamentos

**Semana 15-16: Cálculos de Risco**
- Algoritmos de risco cirúrgico
- Risco coronariano
- Alertas automáticos

**Semana 17-18: Melhorias e Otimizações**
- Testes completos
- Otimização de performance
- Documentação

---

## 5. Estrutura Técnica Detalhada

### 5.1 Endpoints Necessários

**Gestão de Leitos:**
```
GET /api/rooms/ - Listar quartos
POST /api/rooms/ - Criar quarto
GET /api/beds/ - Listar leitos
POST /api/beds/ - Criar leito
PUT /api/beds/{id}/status - Alterar status do leito
GET /api/beds/occupancy - Relatório de ocupação
```

**Internações:**
```
POST /api/admissions/ - Criar internação
GET /api/admissions/ - Listar internações
PUT /api/admissions/{id}/discharge - Alta do paciente
GET /api/admissions/{id}/billing - Faturamento da internação
```

**Configuração de Diárias:**
```
GET /api/daily-rates/ - Listar configurações
POST /api/daily-rates/ - Criar configuração
PUT /api/daily-rates/{id} - Atualizar configuração
```

### 5.2 Interfaces Frontend

**Dashboard Principal:**
- Cards de ocupação de leitos
- Gráfico de taxa de ocupação
- Alertas de alta/transferência
- Resumo financeiro por tipo de pagamento

**Gestão de Leitos:**
- Grid visual de leitos por quarto
- Status colorido (ocupado, livre, manutenção)
- Ações rápidas (limpar, bloquear, manutenção)

**Processo de Internação:**
- Wizard de internação
- Seleção de leito disponível
- Configuração de diárias
- Documentos de internação

**Relatórios:**
- Ocupação por período
- Faturamento por tipo de pagamento
- Tempo médio de internação
- Previsão de receita

---

## 6. Considerações Técnicas

### 6.1 Performance
- Indexação adequada nas tabelas de internação
- Cache para cálculos de ocupação
- Paginação em listagens grandes

### 6.2 Segurança
- Criptografia de dados sensíveis
- Logs de auditoria para todas as ações
- Controle de acesso granular

### 6.3 Integrações
- API para sistemas externos
- Webhooks para notificações
- Backup automático de dados críticos

---

## 7. Métricas de Sucesso

### 7.1 Operacionais
- Taxa de ocupação de leitos > 80%
- Tempo médio de internação otimizado
- Redução de 50% no tempo de processo de alta

### 7.2 Financeiras
- Faturamento automático 100% preciso
- Redução de 30% em erros de cobrança
- Previsão orçamentária com 95% de precisão

### 7.3 Técnicas
- Tempo de resposta < 2 segundos
- Disponibilidade > 99.5%
- Zero perda de dados

---

## 8. Riscos e Mitigações

### 8.1 Riscos Técnicos
- **Complexidade de migração**: Implementar em ambiente de teste primeiro
- **Performance com muitos dados**: Otimização de queries e indexação
- **Integração com sistemas legados**: APIs bem documentadas

### 8.2 Riscos Operacionais
- **Resistência à mudança**: Treinamento adequado da equipe
- **Dados incorretos**: Validações rigorosas e auditoria
- **Falhas de sistema**: Backup e redundância

---

## 9. Conclusão

Este plano de ação fornece um roadmap completo para transformar o DataClínica em uma solução especializada para clínicas de dependentes químicos e saúde mental. A implementação em fases garante que as funcionalidades críticas sejam entregues primeiro, permitindo valor imediato para os usuários.

A comparação com DataSigh identificou oportunidades de diferenciação e melhorias que podem posicionar o DataClínica como uma solução superior no mercado específico de clínicas de reabilitação.

O cronograma de 18 semanas é realista e permite entregas incrementais, reduzindo riscos e permitindo feedback contínuo dos usuários finais.