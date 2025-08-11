# Sistema de Gestão Financeira Avançada - DataClínica

## Visão Geral

Este documento descreve as funcionalidades avançadas de gestão financeira implementadas no sistema DataClínica, incluindo emissão de NFS-e, auditoria, backup automático e relatórios financeiros específicos para clínicas médicas.

## Novas Funcionalidades

### 1. Gestão Financeira Avançada

#### Modelos Implementados:
- **InvoiceNFS**: Gestão de Notas Fiscais de Serviço Eletrônicas
- **CostCenter**: Centros de custo para categorização de despesas
- **TaxConfiguration**: Configurações de impostos por cidade
- **BankAccount**: Contas bancárias da clínica
- **BankReconciliation**: Conciliação bancária automática
- **DoctorPayment**: Pagamentos e comissões de médicos
- **FinancialKPI**: Indicadores de performance financeira
- **Supplier**: Cadastro de fornecedores
- **AuditLog**: Trilha de auditoria completa

### 2. Emissão de NFS-e

#### Funcionalidades:
- Emissão automática de NFS-e para consultas
- Integração com APIs de prefeituras (São Paulo, Rio de Janeiro, Belo Horizonte, Curitiba, Porto Alegre)
- Geração de XML no padrão ABRASF
- Consulta de status de processamento
- Download de PDF das notas emitidas
- Cálculo automático de impostos (ISS, PIS, COFINS, CSLL, IR)

#### Endpoints:
```
POST /api/nfs-e/emit - Emitir NFS-e
GET /api/nfs-e/{invoice_id}/status - Consultar status
GET /api/nfs-e/{invoice_id}/pdf - Download do PDF
```

### 3. Relatórios Financeiros

#### DRE (Demonstração do Resultado do Exercício)
- Receita bruta e líquida
- Custos operacionais
- Despesas administrativas
- EBITDA, EBIT e lucro líquido
- Margem de lucro

#### Balanço Patrimonial
- Ativos circulantes e não circulantes
- Passivos circulantes e não circulantes
- Patrimônio líquido

#### Fluxo de Caixa
- Fluxos operacionais, de investimento e financiamento
- Projeções futuras baseadas em histórico
- Alertas de fluxo negativo

#### Endpoints:
```
GET /api/reports/dre - Demonstração do Resultado
GET /api/reports/balance-sheet - Balanço Patrimonial
GET /api/reports/cash-flow - Fluxo de Caixa
GET /api/dashboard/financial - Dashboard financeiro
```

### 4. KPIs Específicos para Clínicas

#### Indicadores Calculados:
- **Receita por paciente**: Receita média gerada por paciente
- **Ticket médio**: Valor médio por consulta/procedimento
- **Taxa de inadimplência**: Percentual de contas em atraso
- **Tempo médio de recebimento**: Dias entre faturamento e recebimento
- **Margem de lucro por convênio**: Rentabilidade por plano de saúde
- **Custo por atendimento**: Custo operacional por consulta
- **ROI por médico**: Retorno sobre investimento por profissional
- **Taxa de ocupação**: Percentual de agenda ocupada

#### Endpoint:
```
GET /api/financial/kpis?period_days=30 - KPIs do período
```

### 5. Sistema de Auditoria

#### Funcionalidades:
- Registro automático de todas as operações financeiras
- Trilha completa de alterações (antes/depois)
- Detecção de atividades suspeitas
- Relatórios de compliance
- Rastreamento por usuário, IP e timestamp

#### Endpoints:
```
GET /audit/trail - Trilha de auditoria
GET /audit/suspicious-activities - Atividades suspeitas
GET /compliance/check - Verificação de compliance
```

### 6. Sistema de Backup

#### Tipos de Backup:
- **Financial**: Dados financeiros dos últimos 12 meses
- **Full**: Backup completo comprimido
- **Database**: Backup do banco de dados

#### Funcionalidades:
- Backup automático agendado (diário, semanal, mensal)
- Compressão automática
- Limpeza de backups antigos
- Listagem de backups disponíveis

#### Endpoints:
```
POST /backup/create - Criar backup
GET /backup/list - Listar backups
POST /backup/schedule - Agendar backup automático
DELETE /backup/cleanup - Limpar backups antigos
```

### 7. Alertas Financeiros

#### Tipos de Alertas:
- Fluxo de caixa negativo
- Contas em atraso
- Metas não atingidas
- Gastos acima do orçamento
- Necessidade de backup

#### Endpoint:
```
GET /financial/alerts - Alertas financeiros
```

## Configuração

### 1. Variáveis de Ambiente

```env
# NFS-e Configuration
NFSE_ENVIRONMENT=sandbox  # sandbox ou production
NFSE_SAO_PAULO_USER=seu_usuario
NFSE_SAO_PAULO_PASSWORD=sua_senha
NFSE_RIO_JANEIRO_TOKEN=seu_token
# ... outras configurações por cidade

# Backup Configuration
BACKUP_DIRECTORY=./backups
BACKUP_RETENTION_DAYS=30

# Database Configuration
DATABASE_BACKUP_PATH=./db_backups
```

### 2. Executar Migrações

```bash
# Aplicar migração para criar as novas tabelas
python -m alembic upgrade head
```

### 3. Configurar Impostos

```python
# Exemplo de configuração de impostos para São Paulo
tax_config = {
    "city_code": "3550308",  # São Paulo
    "iss_rate": 5.0,
    "pis_rate": 0.65,
    "cofins_rate": 3.0,
    "csll_rate": 1.0,
    "ir_rate": 1.5
}
```

## Segurança e Compliance

### LGPD
- Todos os dados pessoais são tratados conforme LGPD
- Trilha de auditoria para demonstrar compliance
- Consentimento explícito para tratamento de dados

### Segurança Financeira
- Criptografia de dados sensíveis
- Autenticação obrigatória para operações financeiras
- Logs de auditoria imutáveis
- Backup automático para recuperação de desastres

### Controles Internos
- Segregação de funções por perfil de usuário
- Aprovação em múltiplas etapas para operações críticas
- Alertas automáticos para atividades suspeitas
- Relatórios de compliance automáticos

## Monitoramento e Alertas

### Alertas Automáticos
- Fluxo de caixa negativo projetado
- Contas a receber em atraso > 30 dias
- Gastos 20% acima do orçamento mensal
- Falha na emissão de NFS-e
- Backup não realizado há mais de 7 dias

### Dashboards
- Visão executiva com KPIs principais
- Gráficos de tendência financeira
- Comparativos mensais e anuais
- Análise por centro de custo
- Performance por médico/especialidade

## Suporte e Manutenção

### Logs do Sistema
- Todos os eventos são registrados
- Rotação automática de logs
- Alertas para erros críticos

### Backup e Recuperação
- Backup automático diário
- Teste de integridade dos backups
- Procedimento de recuperação documentado
- RTO (Recovery Time Objective): 4 horas
- RPO (Recovery Point Objective): 24 horas

## Próximas Funcionalidades

### Planejadas para Próximas Versões:
- Integração com bancos para conciliação automática
- BI (Business Intelligence) avançado
- Previsão de demanda usando ML
- Integração com sistemas de pagamento (PIX, cartões)
- App mobile para aprovações
- API para integração com sistemas contábeis
- Relatórios personalizáveis
- Workflow de aprovação configurável

---

**Versão**: 2.0.0  
**Data**: Janeiro 2024  
**Autor**: Equipe DataClínica  
**Contato**: suporte@dataclinica.com.br