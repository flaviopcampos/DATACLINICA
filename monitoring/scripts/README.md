# Scripts de Automação - DataClinica Monitoring

Este diretório contém scripts Python e shell para automatizar tarefas de monitoramento do sistema DataClinica.

## 📋 Índice

- [Scripts Disponíveis](#scripts-disponíveis)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [Exemplos](#exemplos)
- [Troubleshooting](#troubleshooting)

## 🔧 Scripts Disponíveis

### Scripts Python

| Script | Descrição | Uso Principal |
|--------|-----------|---------------|
| `init-monitoring.py` | Inicialização automática do ambiente | Primeira configuração |
| `backup-monitoring.py` | Backup completo do sistema | Manutenção regular |
| `restore-monitoring.py` | Restauração a partir de backups | Recuperação de desastres |
| `health-check.py` | Verificação de saúde contínua | Monitoramento proativo |

### Scripts Shell

| Script | Plataforma | Descrição |
|--------|------------|----------|
| `run-monitoring-tasks.bat` | Windows | Interface unificada para todas as tarefas |
| `run-monitoring-tasks.sh` | Linux/macOS | Interface unificada para todas as tarefas |

### Arquivos de Configuração

| Arquivo | Descrição |
|---------|----------|
| `requirements.txt` | Dependências Python necessárias |
| `.env.example` | Exemplo de configuração de ambiente |

## 🚀 Instalação

### Pré-requisitos

- Python 3.7 ou superior
- pip (gerenciador de pacotes Python)
- Docker e Docker Compose (para o sistema de monitoramento)

### Instalação das Dependências

```bash
# Navegar para o diretório de scripts
cd monitoring/scripts

# Criar ambiente virtual (recomendado)
python -m venv venv

# Ativar ambiente virtual
# Windows
venv\Scripts\activate
# Linux/macOS
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt
```

## ⚙️ Configuração

### Variáveis de Ambiente

1. Copie o arquivo de exemplo:
   ```bash
   cp .env.example .env
   ```

2. Edite o arquivo `.env` com suas configurações:
   ```bash
   # URLs dos serviços
   GRAFANA_URL=http://localhost:3000
   PROMETHEUS_URL=http://localhost:9090
   # ... outras configurações
   ```

### Configurações Principais

- **URLs dos Serviços**: Ajuste conforme sua instalação
- **Credenciais**: Configure usuário e senha do Grafana
- **Backup**: Defina diretório e política de retenção
- **Notificações**: Configure webhooks para Slack/Teams

## 📖 Uso

### Uso Individual dos Scripts

#### Inicialização
```bash
python init-monitoring.py
```

#### Backup
```bash
python backup-monitoring.py
```

#### Restauração
```bash
# Listar backups disponíveis
python restore-monitoring.py

# Restaurar backup específico
python restore-monitoring.py backup_file.tar.gz
```

#### Verificação de Saúde
```bash
# Verificação única
python health-check.py

# Monitoramento contínuo (a cada 5 minutos)
python health-check.py --interval 300

# Modo silencioso
python health-check.py --quiet
```

### Uso do Script Unificado

#### Windows
```cmd
# Executar tarefa específica
run-monitoring-tasks.bat init
run-monitoring-tasks.bat backup
run-monitoring-tasks.bat health

# Executar todas as tarefas
run-monitoring-tasks.bat all
```

#### Linux/macOS
```bash
# Tornar executável (primeira vez)
chmod +x run-monitoring-tasks.sh

# Executar tarefa específica
./run-monitoring-tasks.sh init
./run-monitoring-tasks.sh backup
./run-monitoring-tasks.sh health

# Executar todas as tarefas
./run-monitoring-tasks.sh all
```

## 💡 Exemplos

### Configuração Inicial Completa

```bash
# 1. Instalar dependências
cd monitoring/scripts
pip install -r requirements.txt

# 2. Configurar ambiente
cp .env.example .env
# Editar .env com suas configurações

# 3. Inicializar sistema
python init-monitoring.py

# 4. Verificar saúde
python health-check.py
```

### Rotina de Backup Diária

```bash
# Script para cron/task scheduler
#!/bin/bash
cd /path/to/monitoring/scripts
source venv/bin/activate
python backup-monitoring.py
python health-check.py --quiet
```

### Monitoramento Contínuo

```bash
# Executar em background
nohup python health-check.py --interval 300 --quiet > health.log 2>&1 &
```

### Recuperação de Desastre

```bash
# 1. Listar backups disponíveis
python restore-monitoring.py

# 2. Restaurar backup mais recente
python restore-monitoring.py monitoring_backup_20231201_120000.tar.gz

# 3. Reinicializar serviços
docker-compose -f ../docker-compose.monitoring.yml restart

# 4. Verificar saúde
python health-check.py
```

## 🔧 Troubleshooting

### Problemas Comuns

#### Erro de Conexão com Serviços
```bash
# Verificar se os serviços estão rodando
docker-compose -f ../docker-compose.monitoring.yml ps

# Verificar logs
docker-compose -f ../docker-compose.monitoring.yml logs grafana
```

#### Erro de Permissão
```bash
# Linux/macOS - ajustar permissões
chmod +x run-monitoring-tasks.sh

# Verificar propriedade dos arquivos
ls -la
```

#### Erro de Dependências Python
```bash
# Reinstalar dependências
pip install --upgrade -r requirements.txt

# Verificar versão do Python
python --version
```

#### Erro de Configuração
```bash
# Verificar arquivo .env
cat .env

# Testar conectividade
curl http://localhost:3000/api/health
```

### Logs e Debugging

#### Habilitar Logs Detalhados
```bash
# Definir nível de log
export LOG_LEVEL=DEBUG

# Ou no arquivo .env
LOG_LEVEL=DEBUG
VERBOSE_LOGGING=true
```

#### Verificar Logs dos Scripts
```bash
# Executar com output detalhado
python health-check.py --verbose

# Salvar logs em arquivo
python backup-monitoring.py > backup.log 2>&1
```

### Comandos Úteis

```bash
# Verificar status dos containers
docker ps | grep dataclinica

# Verificar uso de recursos
docker stats

# Verificar conectividade de rede
telnet localhost 3000

# Verificar espaço em disco
df -h

# Verificar processos Python
ps aux | grep python
```

## 📞 Suporte

Para problemas com os scripts:

1. Verifique os logs detalhados
2. Consulte a seção de troubleshooting
3. Verifique a configuração do ambiente
4. Entre em contato com a equipe de DevOps

## 🔄 Atualizações

Para atualizar os scripts:

```bash
# Fazer backup das configurações atuais
cp .env .env.backup

# Atualizar repositório
git pull origin main

# Atualizar dependências
pip install --upgrade -r requirements.txt

# Restaurar configurações
cp .env.backup .env
```

---

**DataClinica Monitoring Scripts v1.0**  
*Automação completa para monitoramento de aplicações de saúde*