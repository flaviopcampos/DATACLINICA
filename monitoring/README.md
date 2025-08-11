# Sistema de Monitoramento DataClinica

Este diretório contém a configuração completa do sistema de monitoramento para o DataClinica, incluindo coleta de métricas, logs, tracing distribuído, alertas e visualização.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Componentes](#componentes)
- [Instalação e Configuração](#instalação-e-configuração)
- [Uso](#uso)
- [Dashboards](#dashboards)
- [Alertas](#alertas)
- [Troubleshooting](#troubleshooting)
- [Manutenção](#manutenção)

## 🎯 Visão Geral

O sistema de monitoramento do DataClinica é uma solução completa baseada em tecnologias open-source que fornece:

- **Coleta de Métricas**: Prometheus com exporters especializados
- **Visualização**: Grafana com dashboards customizados
- **Alertas**: Alertmanager com notificações multi-canal
- **Logs**: Loki + Promtail para agregação e análise
- **Tracing**: Jaeger para rastreamento distribuído
- **Proxy Reverso**: Traefik para roteamento e load balancing
- **Monitoramento de Infraestrutura**: Node Exporter, cAdvisor, exporters específicos

## 🏗️ Arquitetura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   DataClinica   │    │   Aplicações    │    │  Infraestrutura │
│   Frontend      │    │   Backend       │    │   (Servidores)  │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │       Traefik           │
                    │   (Proxy Reverso)       │
                    └────────────┬────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                       │                        │
┌───────▼───────┐    ┌─────────▼─────────┐    ┌─────────▼─────────┐
│   Prometheus   │    │     Grafana       │    │   Alertmanager    │
│   (Métricas)   │    │ (Visualização)    │    │    (Alertas)      │
└───────┬───────┘    └─────────┬─────────┘    └─────────┬─────────┘
        │                      │                        │
┌───────▼───────┐    ┌─────────▼─────────┐    ┌─────────▼─────────┐
│     Loki       │    │     Jaeger        │    │   Exporters       │
│    (Logs)      │    │   (Tracing)       │    │ (Node, cAdvisor)  │
└───────┬───────┘    └───────────────────┘    └───────────────────┘
        │
┌───────▼───────┐
│   Promtail     │
│ (Coleta Logs)  │
└───────────────┘
```

## 🔧 Componentes

### Core Monitoring

| Componente | Porta | Descrição |
|------------|-------|----------|
| **Prometheus** | 9090 | Coleta e armazenamento de métricas |
| **Grafana** | 3000 | Dashboards e visualização |
| **Alertmanager** | 9093 | Gerenciamento de alertas |
| **Loki** | 3100 | Agregação de logs |
| **Jaeger** | 16686 | Tracing distribuído |
| **Traefik** | 8080 | Proxy reverso e load balancer |

### Exporters

| Exporter | Porta | Descrição |
|----------|-------|----------|
| **Node Exporter** | 9100 | Métricas do sistema operacional |
| **cAdvisor** | 8080 | Métricas de containers |
| **Postgres Exporter** | 9187 | Métricas do PostgreSQL |
| **Redis Exporter** | 9121 | Métricas do Redis |
| **Nginx Exporter** | 9113 | Métricas do Nginx |
| **Blackbox Exporter** | 9115 | Monitoramento de endpoints |

### Utilitários

| Componente | Porta | Descrição |
|------------|-------|----------|
| **Promtail** | 9080 | Coleta de logs para Loki |
| **Grafana Image Renderer** | 8081 | Renderização de imagens |

## 🚀 Instalação e Configuração

### Pré-requisitos

- Docker e Docker Compose
- Pelo menos 4GB de RAM disponível
- 20GB de espaço em disco
- Portas 80, 443, 3000, 8080, 9090, 9093 disponíveis

### Instalação

1. **Clone o repositório e navegue até o diretório de monitoramento:**
   ```bash
   cd DATACLINICA/monitoring
   ```

2. **Configure as variáveis de ambiente:**
   ```bash
   cp .env.example .env
   # Edite o arquivo .env com suas configurações
   ```

3. **Inicie os serviços:**
   ```bash
   docker-compose -f docker-compose.monitoring.yml up -d
   ```

4. **Verifique se todos os serviços estão rodando:**
   ```bash
   docker-compose -f docker-compose.monitoring.yml ps
   ```

### Configuração Inicial

#### Configuração Automática
Utilize o script de inicialização para configurar automaticamente o ambiente:

```bash
cd monitoring/scripts
python init-monitoring.py
```

Este script irá:
- Aguardar a disponibilidade dos serviços
- Configurar datasources no Grafana
- Importar todos os dashboards
- Criar usuários e pastas organizacionais
- Configurar regras de alerta
- Verificar a saúde dos targets

#### Configuração Manual

##### Grafana
1. Acesse: http://localhost:3000
2. Login padrão: `admin` / `admin`
3. Altere a senha no primeiro acesso
4. Os dashboards serão provisionados automaticamente

##### Prometheus
1. Acesse: http://localhost:9090
2. Verifique os targets em Status > Targets
3. Todos devem estar "UP"

##### Alertmanager
1. Acesse: http://localhost:9093
2. Configure os receivers de notificação
3. Teste os alertas

## 📊 Dashboards

### Dashboards Principais

1. **DataClinica System Overview** (`dataclinica-system.json`) - Visão geral completa do sistema
2. **DataClinica Performance** (`dataclinica-performance.json`) - Métricas de performance e tempo de resposta
3. **DataClinica Alerts** (`dataclinica-alerts.json`) - Monitoramento de alertas e notificações
4. **DataClinica Logs** (`dataclinica-logs.json`) - Análise e visualização de logs
5. **DataClinica Security** (`dataclinica-security.json`) - Métricas de segurança e autenticação
6. **DataClinica Business** (`dataclinica-business.json`) - KPIs e métricas de negócio

### Dashboards por Categoria

#### Infraestrutura
- System Overview
- Container Monitoring
- Network Monitoring
- Storage Monitoring

#### Aplicação
- API Performance
- Frontend Monitoring
- Error Tracking
- User Experience

#### Banco de Dados
- PostgreSQL Overview
- Query Performance
- Connection Monitoring
- Backup Status

#### Segurança
- Authentication Monitoring
- Access Logs
- Security Events
- Compliance Dashboard

## 🚨 Alertas

### Categorias de Alertas

#### Críticos (Severidade: critical)
- Serviços indisponíveis
- Alto uso de recursos (>90%)
- Falhas de backup
- Problemas de segurança

#### Avisos (Severidade: warning)
- Alto uso de recursos (>80%)
- Queries lentas
- Muitas conexões
- Certificados expirando

#### Informativos (Severidade: info)
- Deployments
- Manutenções programadas
- Atualizações de sistema

### Canais de Notificação

- **Slack**: Alertas em tempo real
- **Email**: Resumos e alertas críticos
- **Microsoft Teams**: Notificações para equipes
- **Webhooks**: Integração com sistemas externos

## 🔍 Logs

### Fontes de Logs

- **Aplicação**: Logs do backend e frontend
- **Sistema**: Logs do sistema operacional
- **Containers**: Logs dos containers Docker
- **Nginx**: Logs de acesso e erro
- **PostgreSQL**: Logs do banco de dados
- **Auditoria**: Logs de auditoria da aplicação

### Consultas Úteis

```logql
# Logs de erro da aplicação
{job="dataclinica-backend"} |= "ERROR"

# Logs de acesso HTTP com status 5xx
{job="nginx"} | json | status >= 500

# Logs de queries lentas do PostgreSQL
{job="postgresql"} |= "slow query"

# Logs de autenticação
{job="dataclinica-backend"} |= "authentication"
```

## 🤖 Scripts de Automação

O sistema inclui scripts Python para automatizar tarefas de monitoramento:

### 1. Inicialização (`init-monitoring.py`)

Configura automaticamente o ambiente de monitoramento:

```bash
cd monitoring/scripts
python init-monitoring.py
```

**Funcionalidades:**
- Aguarda disponibilidade dos serviços
- Configura datasources (Prometheus, Loki, Jaeger)
- Importa dashboards automaticamente
- Cria pastas organizacionais no Grafana
- Configura usuários padrão (Viewer, Editor)
- Importa regras de alerta
- Verifica saúde dos targets
- Configura canais de notificação

### 2. Backup (`backup-monitoring.py`)

Realiza backup completo do sistema de monitoramento:

```bash
cd monitoring/scripts
python backup-monitoring.py
```

**Funcionalidades:**
- Backup de dashboards e datasources do Grafana
- Backup de configurações do Prometheus, Alertmanager e Loki
- Backup de arquivos Docker Compose
- Compactação em arquivo .tar.gz
- Limpeza automática de backups antigos
- Geração de arquivo de informações do backup

### 3. Restauração (`restore-monitoring.py`)

Restaura o sistema a partir de backups:

```bash
cd monitoring/scripts
python restore-monitoring.py [arquivo_backup.tar.gz]
```

**Funcionalidades:**
- Lista backups disponíveis
- Extrai arquivos de backup
- Restaura dashboards e datasources no Grafana
- Restaura configurações dos serviços
- Backup de segurança antes de sobrescrever
- Limpeza de arquivos temporários

### 4. Verificação de Saúde (`health-check.py`)

Monitora continuamente a saúde do sistema:

```bash
cd monitoring/scripts
python health-check.py [--interval 300] [--quiet]
```

**Funcionalidades:**
- Verifica saúde de todos os serviços HTTP
- Monitora status de containers Docker
- Verifica espaço em disco
- Gera relatórios em JSON e HTML
- Suporte a execução contínua
- Modo silencioso para automação
- Configuração via variáveis de ambiente

### 5. Script de Automação (`run-monitoring-tasks`)

Script unificado para executar todas as tarefas de monitoramento:

**Windows:**
```cmd
cd monitoring\scripts
run-monitoring-tasks.bat [init|backup|restore|health|all]
```

**Linux/macOS:**
```bash
cd monitoring/scripts
./run-monitoring-tasks.sh [init|backup|restore|health|all]
```

**Funcionalidades:**
- Configuração automática de ambiente virtual Python
- Instalação automática de dependências
- Interface unificada para todas as tarefas
- Logs coloridos e informativos
- Confirmação para operações destrutivas
- Tratamento de erros robusto

### Instalação de Dependências

Antes de usar os scripts, instale as dependências Python:

```bash
cd monitoring/scripts
pip install -r requirements.txt
```

Ou use o script de automação que fará isso automaticamente:

```bash
# Windows
run-monitoring-tasks.bat health

# Linux/macOS
./run-monitoring-tasks.sh health
```

### Variáveis de Ambiente

Configure as seguintes variáveis para os scripts:

```bash
# URLs dos serviços
GRAFANA_URL=http://localhost:3000
PROMETHEUS_URL=http://localhost:9090
ALERTMANAGER_URL=http://localhost:9093
LOKI_URL=http://localhost:3100
JAEGER_URL=http://localhost:16686

# Credenciais do Grafana
GRAFANA_USER=admin
GRAFANA_PASSWORD=admin

# Configurações de backup
BACKUP_RETENTION_DAYS=30
BACKUP_DIR=./backups

# Configurações de notificação
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
```

## 🔧 Troubleshooting

### Problemas Comuns

#### Prometheus não coleta métricas
1. Verifique se os exporters estão rodando
2. Confirme a configuração de targets
3. Verifique conectividade de rede

#### Grafana não mostra dados
1. Verifique a configuração do datasource
2. Confirme se o Prometheus está coletando dados
3. Verifique as queries dos dashboards

#### Alertas não são enviados
1. Verifique a configuração do Alertmanager
2. Teste os receivers
3. Confirme as regras de alerta

#### Logs não aparecem no Loki
1. Verifique se o Promtail está rodando
2. Confirme a configuração de scraping
3. Verifique conectividade com Loki

### Monitoramento de Saúde Contínuo

```bash
# Verificação única da saúde do sistema
cd monitoring/scripts
python health-check.py

# Monitoramento contínuo (verifica a cada 5 minutos)
python health-check.py --interval 300

# Modo silencioso para automação
python health-check.py --quiet --interval 600
```

### Comandos Úteis

```bash
# Verificar status dos serviços
docker-compose -f docker-compose.monitoring.yml ps

# Ver logs de um serviço específico
docker-compose -f docker-compose.monitoring.yml logs prometheus

# Reiniciar um serviço
docker-compose -f docker-compose.monitoring.yml restart grafana

# Verificar uso de recursos
docker stats

# Inicialização completa do ambiente
cd monitoring/scripts && python init-monitoring.py

# Backup rápido
cd monitoring/scripts && python backup-monitoring.py
```

## 🔄 Manutenção

### Tarefas Diárias
- [ ] Executar verificação de saúde: `python scripts/health-check.py`
- [ ] Verificar status de todos os serviços
- [ ] Revisar alertas ativos
- [ ] Monitorar uso de recursos

### Tarefas Semanais
- [ ] Executar backup: `python scripts/backup-monitoring.py`
- [ ] Revisar dashboards e métricas
- [ ] Verificar logs de erro
- [ ] Atualizar regras de alerta se necessário
- [ ] Testar procedimentos de restauração

### Tarefas Mensais
- [ ] Revisar e otimizar queries
- [ ] Limpar dados antigos
- [ ] Atualizar documentação
- [ ] Revisar políticas de retenção
- [ ] Verificar e limpar backups antigos

### Backup e Restore

#### Backup Automatizado (Recomendado)
```bash
# Backup completo do sistema de monitoramento
cd monitoring/scripts
python backup-monitoring.py

# O backup será salvo em: ./backups/monitoring_backup_YYYYMMDD_HHMMSS.tar.gz
```

#### Restore Automatizado (Recomendado)
```bash
# Restaurar a partir de um backup específico
cd monitoring/scripts
python restore-monitoring.py backup_file.tar.gz

# Ou listar backups disponíveis e escolher
python restore-monitoring.py
```

#### Backup Manual (Alternativo)
```bash
# Backup do Prometheus
docker exec prometheus tar czf - /prometheus > prometheus_backup.tar.gz

# Backup do Grafana
docker exec grafana tar czf - /var/lib/grafana > grafana_backup.tar.gz

# Backup das configurações
tar czf monitoring_config_backup.tar.gz .
```

#### Restore Manual (Alternativo)
```bash
# Restore do Prometheus
docker exec -i prometheus tar xzf - -C / < prometheus_backup.tar.gz

# Restore do Grafana
docker exec -i grafana tar xzf - -C / < grafana_backup.tar.gz
```

## 📚 Documentação Adicional

### Configurações dos Serviços
- [Configuração do Prometheus](./prometheus/README.md)
- [Dashboards do Grafana](./grafana/README.md)
- [Regras de Alerta](./rules/README.md)
- [Configuração do Loki](./loki/README.md)
- [Configuração do Jaeger](./jaeger/README.md)
- [Configuração do Traefik](./traefik/README.md)

### Scripts de Automação
- [`init-monitoring.py`](./scripts/init-monitoring.py) - Inicialização automática
- [`backup-monitoring.py`](./scripts/backup-monitoring.py) - Backup automatizado
- [`restore-monitoring.py`](./scripts/restore-monitoring.py) - Restauração de backups
- [`health-check.py`](./scripts/health-check.py) - Verificação de saúde
- [`run-monitoring-tasks.bat`](./scripts/run-monitoring-tasks.bat) - Script unificado (Windows)
- [`run-monitoring-tasks.sh`](./scripts/run-monitoring-tasks.sh) - Script unificado (Linux/macOS)

### Dashboards Disponíveis
- [`dataclinica-system.json`](./grafana/dashboards/dataclinica-system.json) - Visão geral do sistema
- [`dataclinica-performance.json`](./grafana/dashboards/dataclinica-performance.json) - Métricas de performance
- [`dataclinica-alerts.json`](./grafana/dashboards/dataclinica-alerts.json) - Monitoramento de alertas
- [`dataclinica-logs.json`](./grafana/dashboards/dataclinica-logs.json) - Análise de logs
- [`dataclinica-security.json`](./grafana/dashboards/dataclinica-security.json) - Métricas de segurança
- [`dataclinica-business.json`](./grafana/dashboards/dataclinica-business.json) - KPIs de negócio

### Arquivos de Configuração
- [`requirements.txt`](./scripts/requirements.txt) - Dependências Python
- [`.env.example`](./scripts/.env.example) - Exemplo de configuração de ambiente

## 🤝 Contribuição

Para contribuir com melhorias no sistema de monitoramento:

1. Crie uma branch para sua feature
2. Implemente as mudanças
3. Teste em ambiente de desenvolvimento
4. Documente as alterações
5. Abra um Pull Request

## 📞 Suporte

Para suporte técnico:
- **Email**: devops@dataclinica.com
- **Slack**: #monitoring
- **Documentação**: https://docs.dataclinica.com/monitoring

## 📄 Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

**DataClinica Monitoring Stack v1.0**  
*Monitoramento completo para aplicações de saúde*