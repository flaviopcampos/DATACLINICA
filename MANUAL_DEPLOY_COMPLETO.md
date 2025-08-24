# 🚀 Manual Completo de Deploy - DataClínica

> Guia definitivo para deploy do sistema DataClínica - Do desenvolvimento à produção

## 📋 Índice

- [Visão Geral do Sistema](#visão-geral-do-sistema)
- [Pré-requisitos e Preparação](#pré-requisitos-e-preparação)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Deploy Local (Desenvolvimento)](#deploy-local-desenvolvimento)
- [Deploy em Staging](#deploy-em-staging)
- [Deploy em Produção](#deploy-em-produção)
- [Configurações Avançadas](#configurações-avançadas)
- [Monitoramento e Manutenção](#monitoramento-e-manutenção)
- [Backup e Recuperação](#backup-e-recuperação)
- [Segurança e Compliance](#segurança-e-compliance)
- [Troubleshooting Avançado](#troubleshooting-avançado)
- [Otimização de Performance](#otimização-de-performance)
- [Escalabilidade](#escalabilidade)
- [Migração e Atualizações](#migração-e-atualizações)

## 🏗️ Visão Geral do Sistema

### Arquitetura do DataClínica

O DataClínica é um sistema SaaS completo de gestão clínica com arquitetura moderna:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Banco de      │
│   (React)       │◄──►│   (FastAPI)     │◄──►│   Dados         │
│   Port: 3000    │    │   Port: 8000    │    │   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │     Cache       │    │   File Storage  │
│   (Nginx/ALB)   │    │    (Redis)      │    │   (AWS S3/Local)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Componentes Principais

1. **Frontend (React + TypeScript)**
   - Interface de usuário moderna e responsiva
   - PWA (Progressive Web App) com suporte offline
   - Autenticação JWT com refresh tokens
   - Gerenciamento de estado com Redux/Context API

2. **Backend (FastAPI + Python)**
   - API RESTful com documentação automática
   - Autenticação e autorização robusta
   - Sistema multi-tenant (SaaS)
   - Integração com APIs externas (Memed, ClickSign, etc.)

3. **Banco de Dados (PostgreSQL)**
   - Dados estruturados com relacionamentos complexos
   - Suporte a JSON para dados flexíveis
   - Backup automático e replicação
   - Índices otimizados para performance

4. **Cache (Redis)**
   - Cache de sessões e dados frequentes
   - Rate limiting e throttling
   - Pub/Sub para notificações em tempo real

## 🔧 Pré-requisitos e Preparação

### Ferramentas Necessárias

#### Para Desenvolvimento Local

```bash
# 1. Docker e Docker Compose
# Windows: https://docs.docker.com/desktop/windows/
# Verificar instalação:
docker --version
docker-compose --version

# 2. Git
# Windows: https://git-scm.com/download/win
git --version

# 3. Node.js (versão 16 ou superior)
# Windows: https://nodejs.org/
node --version
npm --version

# 4. Python (versão 3.9 ou superior)
# Windows: https://www.python.org/downloads/
python --version
pip --version

# 5. Make (opcional, mas recomendado)
# Windows: choco install make
# Ou usar PowerShell equivalents
make --version
```

#### Para Deploy em Produção

```bash
# 1. AWS CLI
# Windows: https://aws.amazon.com/cli/
aws --version

# 2. Terraform
# Windows: choco install terraform
terraform --version

# 3. kubectl (para Kubernetes)
# Windows: choco install kubernetes-cli
kubectl version --client
```

### Contas e Credenciais Necessárias

#### Obrigatórias
- **Conta AWS** (para produção)
- **Domínio registrado** (ex: dataclinica.com)
- **Email SMTP** (Gmail, SendGrid, AWS SES)

#### Opcionais (APIs Externas)
- **Memed** (prescrições médicas)
- **ClickSign** (assinatura digital)
- **Sentry** (monitoramento de erros)
- **Slack** (notificações)

### Estrutura de Diretórios

```
dataclinica/
├── backend/                 # API FastAPI
│   ├── app/                # Código da aplicação
│   ├── alembic/            # Migrações do banco
│   ├── tests/              # Testes automatizados
│   ├── requirements.txt    # Dependências Python
│   └── Dockerfile         # Imagem Docker
├── frontend/               # Aplicação React
│   ├── src/               # Código fonte
│   ├── public/            # Arquivos estáticos
│   ├── package.json       # Dependências Node.js
│   └── Dockerfile         # Imagem Docker
├── terraform/              # Infraestrutura como código
│   ├── modules/           # Módulos reutilizáveis
│   ├── environments/      # Configurações por ambiente
│   └── main.tf           # Configuração principal
├── scripts/               # Scripts de automação
├── docs/                  # Documentação
├── docker-compose.yml     # Orquestração local
├── Makefile              # Comandos automatizados
├── .env.example          # Exemplo de configuração
└── README.md             # Documentação básica
```

## ⚙️ Configuração do Ambiente

### 1. Clone e Configuração Inicial

```bash
# 1. Clonar o repositório
git clone https://github.com/seu-usuario/dataclinica.git
cd dataclinica

# 2. Configuração automática (recomendado)
make setup

# 3. Ou configuração manual
cp .env.example .env
cp terraform/terraform.tfvars.example terraform/terraform.tfvars
```

### 2. Configuração do Arquivo .env

#### Configurações Básicas

```bash
# .env - Configurações essenciais

# Ambiente
ENVIRONMENT=development
DEBUG=true
APP_NAME=DataClinica
APP_VERSION=1.0.0

# URLs
APP_URL=http://localhost:3000
API_URL=http://localhost:8000

# Banco de Dados
DATABASE_URL=postgresql://dataclinica:dataclinica123@localhost:5432/dataclinica

# Redis
REDIS_URL=redis://localhost:6379/0

# Segurança (IMPORTANTE: Gerar chaves fortes)
SECRET_KEY=sua-chave-secreta-muito-forte-aqui-min-32-chars
JWT_SECRET_KEY=sua-chave-jwt-muito-forte-aqui-min-32-chars
```

#### Gerando Chaves Seguras

```bash
# Python
python -c "import secrets; print('SECRET_KEY=' + secrets.token_urlsafe(32))"
python -c "import secrets; print('JWT_SECRET_KEY=' + secrets.token_urlsafe(32))"

# PowerShell
[System.Web.Security.Membership]::GeneratePassword(32, 8)

# Online (use apenas para desenvolvimento)
# https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx
```

#### Configurações de Email

```bash
# Gmail (recomendado para desenvolvimento)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=seu-email@gmail.com
SMTP_PASSWORD=sua-senha-de-app  # Não a senha normal!
SMTP_USE_TLS=true
EMAIL_FROM=noreply@dataclinica.com

# Como configurar senha de app no Gmail:
# 1. Ativar 2FA na conta Google
# 2. Ir em "Senhas de app" nas configurações
# 3. Gerar senha específica para o DataClínica
```

## 💻 Deploy Local (Desenvolvimento)

### Método 1: Usando Make (Recomendado)

```bash
# Configuração inicial completa
make setup

# Iniciar ambiente de desenvolvimento
make dev

# Em terminais separados, você pode executar:
make dev-backend    # Apenas backend
make dev-frontend   # Apenas frontend
make dev-tools      # Ferramentas (Adminer, Mailhog)

# Verificar status
make status
make health

# Ver logs
make logs           # Todos os serviços
make logs-backend   # Apenas backend
make logs-frontend  # Apenas frontend
```

### Método 2: Docker Compose Manual

```bash
# 1. Construir imagens
docker-compose build

# 2. Iniciar serviços de infraestrutura
docker-compose up -d postgres redis

# 3. Aguardar serviços ficarem prontos
echo "Aguardando PostgreSQL..."
while ! docker-compose exec postgres pg_isready -U dataclinica_user; do
  sleep 2
done

echo "Aguardando Redis..."
while ! docker-compose exec redis redis-cli ping; do
  sleep 2
done

# 4. Executar migrações
docker-compose exec backend alembic upgrade head

# 5. Popular dados de exemplo (opcional)
docker-compose exec backend python scripts/seed_data.py

# 6. Iniciar aplicação
docker-compose up backend frontend

# 7. Verificar logs
docker-compose logs -f
```

### Método 3: Desenvolvimento Nativo (Sem Docker)

#### Preparação do Ambiente

```bash
# 1. Instalar PostgreSQL localmente
# Windows: https://www.postgresql.org/download/windows/
# Criar banco:
psql -U postgres
CREATE DATABASE dataclinica;
CREATE USER dataclinica WITH PASSWORD 'dataclinica123';
GRANT ALL PRIVILEGES ON DATABASE dataclinica TO dataclinica;

# 2. Instalar Redis localmente
# Windows: https://github.com/microsoftarchive/redis/releases
# Ou usar Docker apenas para Redis:
docker run -d -p 6379:6379 redis:7-alpine
```

#### Backend

```bash
cd backend

# 1. Criar ambiente virtual
python -m venv venv

# 2. Ativar ambiente virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# 3. Instalar dependências
pip install -r requirements.txt

# 4. Executar migrações
alembic upgrade head

# 5. Popular dados (opcional)
python scripts/seed_data.py

# 6. Iniciar servidor
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend

```bash
# Em novo terminal
cd frontend

# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento
npm start

# Ou para build de produção:
npm run build
npm run serve
```

### URLs de Desenvolvimento

| Serviço | URL | Descrição |
|---------|-----|----------|
| Frontend | http://localhost:3000 | Interface principal |
| Backend API | http://localhost:8000 | API REST |
| Documentação API | http://localhost:8000/docs | Swagger UI |
| Redoc | http://localhost:8000/redoc | Documentação alternativa |
| Adminer | http://localhost:8080 | Administração do banco |
| Mailhog | http://localhost:8025 | Captura de emails |
| Redis Commander | http://localhost:8081 | Interface do Redis |

### Verificação da Instalação

```bash
# 1. Verificar saúde dos serviços
curl http://localhost:8000/api/health
curl http://localhost:8000/api/health/db
curl http://localhost:8000/api/health/redis

# 2. Testar autenticação
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dataclinica.com","password":"admin123"}'

# 3. Verificar frontend
curl -I http://localhost:3000

# 4. Verificar banco de dados
docker-compose exec postgres psql -U dataclinica_user -d dataclinica -c "SELECT COUNT(*) FROM users;"
```

## 🎭 Deploy em Staging

### Configuração do Ambiente de Staging

```bash
# 1. Criar arquivo de configuração específico
cp .env.example .env.staging

# 2. Editar configurações para staging
# .env.staging
ENVIRONMENT=staging
DEBUG=false
APP_URL=https://staging.dataclinica.com
API_URL=https://api-staging.dataclinica.com

# Banco de dados dedicado
DATABASE_URL=postgresql://user:pass@staging-db.amazonaws.com:5432/dataclinica_staging

# Redis dedicado
REDIS_URL=redis://staging-redis.amazonaws.com:6379/0
```

### Deploy para Staging

```bash
# 1. Build das imagens
docker-compose -f docker-compose.staging.yml build

# 2. Deploy
docker-compose -f docker-compose.staging.yml up -d

# 3. Executar migrações
docker-compose -f docker-compose.staging.yml exec backend alembic upgrade head

# 4. Verificar saúde
make health

# 5. Executar testes de integração
make test-e2e
```

## 🚀 Deploy em Produção

### Preparação da Infraestrutura AWS

#### 1. Configuração Inicial da AWS

```bash
# 1. Configurar credenciais
aws configure
# AWS Access Key ID: [sua-access-key]
# AWS Secret Access Key: [sua-secret-key]
# Default region name: us-east-1
# Default output format: json

# 2. Verificar configuração
aws sts get-caller-identity
aws ec2 describe-regions
```

#### 2. Certificado SSL

```bash
# 1. Solicitar certificado no AWS Certificate Manager
aws acm request-certificate \
  --domain-name dataclinica.com \
  --subject-alternative-names "*.dataclinica.com" \
  --validation-method DNS

# 2. Verificar status
aws acm list-certificates

# 3. Configurar DNS para validação
# Adicionar registros CNAME fornecidos pelo ACM no seu provedor de DNS
```

#### 3. Deploy da Infraestrutura com Terraform

```bash
# 1. Inicializar Terraform
cd terraform
terraform init

# 2. Planejar mudanças
terraform plan -var-file="environments/production.tfvars"

# 3. Aplicar infraestrutura
terraform apply -var-file="environments/production.tfvars"

# 4. Obter outputs importantes
terraform output
```

### Configuração de Produção

#### 1. Variáveis de Ambiente de Produção

```bash
# .env.production
ENVIRONMENT=production
DEBUG=false
APP_URL=https://dataclinica.com
API_URL=https://api.dataclinica.com

# Banco de dados RDS
DATABASE_URL=postgresql://admin:senha-forte@dataclinica-prod.cluster-xyz.us-east-1.rds.amazonaws.com:5432/dataclinica

# Redis ElastiCache
REDIS_URL=redis://dataclinica-prod.abc123.cache.amazonaws.com:6379/0

# Chaves de segurança (MUITO IMPORTANTES)
SECRET_KEY=chave-super-secreta-de-producao-64-caracteres-minimo
JWT_SECRET_KEY=chave-jwt-super-secreta-de-producao-64-caracteres-minimo

# AWS S3
AWS_S3_BUCKET=dataclinica-prod-files
AWS_CLOUDFRONT_DOMAIN=d123456789.cloudfront.net

# Email SES
SMTP_SERVER=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USERNAME=sua-ses-username
SMTP_PASSWORD=sua-ses-password

# Monitoramento
SENTRY_DSN=https://abc123@o123456.ingest.sentry.io/123456

# APIs externas (produção)
MEMED_API_KEY=chave-producao-memed
MEMED_SANDBOX=false
CLICKSIGN_API_KEY=chave-producao-clicksign
CLICKSIGN_SANDBOX=false
```

## 🔧 Configurações Avançadas

### SSL/TLS e Segurança

#### Configuração do Nginx

```nginx
# nginx/production.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    access_log /var/log/nginx/access.log main;
    
    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 100M;
    
    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/javascript application/xml+rss application/json;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;
    
    # Upstream servers
    upstream backend {
        least_conn;
        server backend:8000 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }
    
    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name dataclinica.com www.dataclinica.com api.dataclinica.com;
        return 301 https://$server_name$request_uri;
    }
    
    # Frontend
    server {
        listen 443 ssl http2;
        server_name dataclinica.com www.dataclinica.com;
        
        # SSL
        ssl_certificate /etc/ssl/certs/dataclinica.crt;
        ssl_certificate_key /etc/ssl/private/dataclinica.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;
        
        # Root
        root /usr/share/nginx/html;
        index index.html;
        
        # Static files
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # SPA routing
        location / {
            try_files $uri $uri/ /index.html;
        }
        
        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
    
    # API Backend
    server {
        listen 443 ssl http2;
        server_name api.dataclinica.com;
        
        # SSL (same as above)
        ssl_certificate /etc/ssl/certs/dataclinica.crt;
        ssl_certificate_key /etc/ssl/private/dataclinica.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;
        
        # API routes
        location / {
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Timeouts
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
            
            # Buffering
            proxy_buffering on;
            proxy_buffer_size 4k;
            proxy_buffers 8 4k;
        }
        
        # Login endpoint (more restrictive)
        location /api/auth/login {
            limit_req zone=login burst=5 nodelay;
            
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # Health check
        location /api/health {
            access_log off;
            proxy_pass http://backend;
        }
    }
}
```

## 📊 Monitoramento e Manutenção

### Health Checks

```bash
# Script de verificação de saúde
#!/bin/bash
# scripts/health-check.sh

set -e

echo "🏥 Verificando saúde do sistema..."

# Verificar API
echo "Verificando API..."
if curl -f -s http://localhost:8000/api/health > /dev/null; then
    echo "✅ API está funcionando"
else
    echo "❌ API não está respondendo"
    exit 1
fi

# Verificar banco de dados
echo "Verificando banco de dados..."
if curl -f -s http://localhost:8000/api/health/db > /dev/null; then
    echo "✅ Banco de dados está funcionando"
else
    echo "❌ Banco de dados não está respondendo"
    exit 1
fi

# Verificar Redis
echo "Verificando Redis..."
if curl -f -s http://localhost:8000/api/health/redis > /dev/null; then
    echo "✅ Redis está funcionando"
else
    echo "❌ Redis não está respondendo"
    exit 1
fi

# Verificar frontend
echo "Verificando frontend..."
if curl -f -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend está funcionando"
else
    echo "❌ Frontend não está respondendo"
    exit 1
fi

echo "✅ Todos os serviços estão funcionando!"
```

### Logs e Debugging

```bash
# Ver logs em tempo real
docker-compose logs -f

# Logs específicos
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
docker-compose logs -f redis

# Logs com timestamp
docker-compose logs -f -t

# Últimas 100 linhas
docker-compose logs --tail=100

# Salvar logs em arquivo
docker-compose logs > logs_$(date +%Y%m%d_%H%M%S).txt
```

## 🔒 Backup e Recuperação

### Backup Automático

```bash
#!/bin/bash
# scripts/backup.sh

set -e

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_BACKUP="$BACKUP_DIR/db_backup_$DATE.sql"
REDIS_BACKUP="$BACKUP_DIR/redis_backup_$DATE.rdb"

echo "🔄 Iniciando backup..."

# Criar diretório de backup
mkdir -p $BACKUP_DIR

# Backup do PostgreSQL
echo "Fazendo backup do banco de dados..."
docker-compose exec -T postgres pg_dump -U dataclinica_user dataclinica > $DB_BACKUP
gzip $DB_BACKUP

# Backup do Redis
echo "Fazendo backup do Redis..."
docker-compose exec redis redis-cli BGSAVE
docker cp $(docker-compose ps -q redis):/data/dump.rdb $REDIS_BACKUP
gzip $REDIS_BACKUP

# Limpar backups antigos (manter últimos 7 dias)
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "✅ Backup concluído!"
echo "Arquivos salvos em: $BACKUP_DIR"
ls -la $BACKUP_DIR
```

### Restauração

```bash
#!/bin/bash
# scripts/restore.sh

if [ -z "$1" ]; then
    echo "Uso: $0 <arquivo_backup>"
    exit 1
fi

BACKUP_FILE=$1

echo "🔄 Restaurando backup: $BACKUP_FILE"

# Parar aplicação
docker-compose stop backend frontend

# Restaurar banco
if [[ $BACKUP_FILE == *"db_backup"* ]]; then
    echo "Restaurando banco de dados..."
    gunzip -c $BACKUP_FILE | docker-compose exec -T postgres psql -U dataclinica_user -d dataclinica
fi

# Restaurar Redis
if [[ $BACKUP_FILE == *"redis_backup"* ]]; then
    echo "Restaurando Redis..."
    docker-compose stop redis
    gunzip -c $BACKUP_FILE > /tmp/dump.rdb
    docker cp /tmp/dump.rdb $(docker-compose ps -q redis):/data/dump.rdb
    docker-compose start redis
fi

# Reiniciar aplicação
docker-compose start backend frontend

echo "✅ Restauração concluída!"
```

## 🛠️ Troubleshooting Avançado

### Problemas Comuns

#### 1. Erro de Conexão com Banco

```bash
# Verificar se PostgreSQL está rodando
docker-compose ps postgres

# Verificar logs do PostgreSQL
docker-compose logs postgres

# Testar conexão
docker-compose exec postgres psql -U dataclinica_user -d dataclinica -c "SELECT 1;"

# Verificar configurações de rede
docker network ls
docker network inspect dataclinica_default
```

#### 2. Erro de Memória

```bash
# Verificar uso de memória
docker stats

# Aumentar limite de memória no docker-compose.yml
services:
  backend:
    mem_limit: 1g
    memswap_limit: 1g
```

#### 3. Erro de Permissão

```bash
# Verificar permissões dos volumes
ls -la volumes/

# Corrigir permissões
sudo chown -R $USER:$USER volumes/
sudo chmod -R 755 volumes/
```

#### 4. Porta já em uso

```bash
# Verificar portas em uso
netstat -tulpn | grep :8000

# Matar processo na porta
sudo kill -9 $(sudo lsof -t -i:8000)

# Ou usar porta diferente
export API_PORT=8001
docker-compose up
```

### Scripts de Diagnóstico

```bash
#!/bin/bash
# scripts/diagnose.sh

echo "🔍 Diagnóstico do Sistema DataClínica"
echo "====================================="

# Informações do sistema
echo "Sistema Operacional:"
uname -a

echo "\nVersão do Docker:"
docker --version
docker-compose --version

echo "\nStatus dos containers:"
docker-compose ps

echo "\nUso de recursos:"
docker stats --no-stream

echo "\nEspaço em disco:"
df -h

echo "\nMemória:"
free -h

echo "\nProcessos:"
ps aux | grep -E '(python|node|postgres|redis)' | grep -v grep

echo "\nPortas em uso:"
netstat -tulpn | grep -E ':(3000|8000|5432|6379)'

echo "\nLogs recentes (últimas 10 linhas):"
docker-compose logs --tail=10

echo "\n✅ Diagnóstico concluído!"
```

## ⚡ Otimização de Performance

### Configurações de Banco

```sql
-- Otimizações PostgreSQL
-- postgresql.conf

# Memória
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB

# Checkpoint
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100

# Conexões
max_connections = 200

# Logging
log_statement = 'all'
log_duration = on
log_min_duration_statement = 1000
```

### Cache Redis

```python
# backend/cache.py
import redis
import json
from functools import wraps
from typing import Any, Optional

redis_client = redis.from_url(os.getenv('REDIS_URL'))

def cache_result(expiration: int = 3600):
    """Decorator para cache de resultados"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Gerar chave do cache
            cache_key = f"{func.__name__}:{hash(str(args) + str(kwargs))}"
            
            # Tentar obter do cache
            cached = redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
            
            # Executar função e cachear resultado
            result = func(*args, **kwargs)
            redis_client.setex(
                cache_key, 
                expiration, 
                json.dumps(result, default=str)
            )
            
            return result
        return wrapper
    return decorator

# Exemplo de uso
@cache_result(expiration=1800)  # 30 minutos
def get_user_appointments(user_id: int):
    # Consulta pesada no banco
    pass
```

### Índices do Banco

```sql
-- Índices importantes para performance

-- Usuários
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_users_active ON users(is_active) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_users_clinic ON users(clinic_id);

-- Agendamentos
CREATE INDEX CONCURRENTLY idx_appointments_date ON appointments(appointment_date);
CREATE INDEX CONCURRENTLY idx_appointments_patient ON appointments(patient_id);
CREATE INDEX CONCURRENTLY idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX CONCURRENTLY idx_appointments_status ON appointments(status);

-- Pacientes
CREATE INDEX CONCURRENTLY idx_patients_cpf ON patients(cpf);
CREATE INDEX CONCURRENTLY idx_patients_name ON patients USING gin(to_tsvector('portuguese', name));
CREATE INDEX CONCURRENTLY idx_patients_clinic ON patients(clinic_id);

-- Transações financeiras
CREATE INDEX CONCURRENTLY idx_transactions_date ON financial_transactions(transaction_date);
CREATE INDEX CONCURRENTLY idx_transactions_type ON financial_transactions(transaction_type);
CREATE INDEX CONCURRENTLY idx_transactions_clinic ON financial_transactions(clinic_id);

-- Produtos (farmácia)
CREATE INDEX CONCURRENTLY idx_products_code ON products(code);
CREATE INDEX CONCURRENTLY idx_products_name ON products USING gin(to_tsvector('portuguese', name));
CREATE INDEX CONCURRENTLY idx_products_category ON products(category_id);

-- Estoque
CREATE INDEX CONCURRENTLY idx_stock_product ON stock_movements(product_id);
CREATE INDEX CONCURRENTLY idx_stock_date ON stock_movements(movement_date);
CREATE INDEX CONCURRENTLY idx_stock_type ON stock_movements(movement_type);
```

## 📈 Escalabilidade

### Load Balancer

```nginx
# nginx/load-balancer.conf
upstream backend_servers {
    least_conn;
    server backend1:8000 weight=3 max_fails=3 fail_timeout=30s;
    server backend2:8000 weight=3 max_fails=3 fail_timeout=30s;
    server backend3:8000 weight=2 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

server {
    listen 80;
    
    location / {
        proxy_pass http://backend_servers;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Health check
        proxy_next_upstream error timeout invalid_header http_500 http_502 http_503 http_504;
        proxy_connect_timeout 5s;
        proxy_send_timeout 10s;
        proxy_read_timeout 10s;
    }
}
```

### Docker Swarm

```yaml
# docker-compose.swarm.yml
version: '3.8'

services:
  backend:
    image: dataclinica/backend:latest
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
        order: start-first
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
    networks:
      - dataclinica-network
    environment:
      - ENVIRONMENT=production
    secrets:
      - database_url
      - secret_key

  frontend:
    image: dataclinica/frontend:latest
    deploy:
      replicas: 2
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
      resources:
        limits:
          cpus: '0.25'
          memory: 256M
    networks:
      - dataclinica-network
    ports:
      - "3000:80"

  nginx:
    image: nginx:alpine
    deploy:
      replicas: 1
      placement:
        constraints:
          - node.role == manager
    ports:
      - "80:80"
      - "443:443"
    networks:
      - dataclinica-network
    configs:
      - source: nginx_config
        target: /etc/nginx/nginx.conf

networks:
  dataclinica-network:
    driver: overlay
    attachable: true

secrets:
  database_url:
    external: true
  secret_key:
    external: true

configs:
  nginx_config:
    external: true
```

### Auto Scaling (AWS)

```json
{
  "family": "dataclinica-prod",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "dataclinica/backend:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/dataclinica",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

## 🔄 Migração e Atualizações

### Estratégia Blue-Green

```bash
#!/bin/bash
# scripts/blue-green-deploy.sh

set -e

CURRENT_ENV=$(docker-compose ps | grep backend | wc -l)
NEW_VERSION=$1

if [ -z "$NEW_VERSION" ]; then
    echo "Uso: $0 <nova_versao>"
    exit 1
fi

echo "🔄 Iniciando deploy Blue-Green para versão $NEW_VERSION"

# 1. Build da nova versão
echo "📦 Building nova versão..."
docker build -t dataclinica/backend:$NEW_VERSION ./backend
docker build -t dataclinica/frontend:$NEW_VERSION ./frontend

# 2. Deploy do ambiente Green
echo "🟢 Deploying ambiente Green..."
export COMPOSE_PROJECT_NAME=dataclinica-green
export BACKEND_IMAGE=dataclinica/backend:$NEW_VERSION
export FRONTEND_IMAGE=dataclinica/frontend:$NEW_VERSION
export API_PORT=8001
export WEB_PORT=3001

docker-compose -f docker-compose.green.yml up -d

# 3. Aguardar ambiente ficar pronto
echo "⏳ Aguardando ambiente Green..."
sleep 30

# 4. Executar testes de saúde
echo "🏥 Testando ambiente Green..."
if curl -f http://localhost:8001/api/health; then
    echo "✅ Ambiente Green está saudável"
else
    echo "❌ Ambiente Green falhou nos testes"
    docker-compose -f docker-compose.green.yml down
    exit 1
fi

# 5. Executar testes de integração
echo "🧪 Executando testes de integração..."
if npm run test:e2e -- --baseUrl=http://localhost:3001; then
    echo "✅ Testes de integração passaram"
else
    echo "❌ Testes de integração falharam"
    docker-compose -f docker-compose.green.yml down
    exit 1
fi

# 6. Trocar tráfego (Blue -> Green)
echo "🔄 Trocando tráfego..."
# Atualizar load balancer ou DNS
# Aguardar propagação
sleep 60

# 7. Parar ambiente Blue
echo "🔵 Parando ambiente Blue..."
export COMPOSE_PROJECT_NAME=dataclinica-blue
docker-compose down

# 8. Renomear Green para Blue
echo "🏷️ Renomeando ambientes..."
export COMPOSE_PROJECT_NAME=dataclinica-blue
export API_PORT=8000
export WEB_PORT=3000
docker-compose -f docker-compose.yml up -d

# 9. Limpar ambiente Green
export COMPOSE_PROJECT_NAME=dataclinica-green
docker-compose -f docker-compose.green.yml down

echo "✅ Deploy Blue-Green concluído com sucesso!"
```

### Rollback

```bash
#!/bin/bash
# scripts/rollback.sh

set -e

PREVIOUS_VERSION=$1

if [ -z "$PREVIOUS_VERSION" ]; then
    echo "Uso: $0 <versao_anterior>"
    exit 1
fi

echo "🔙 Iniciando rollback para versão $PREVIOUS_VERSION"

# 1. Parar versão atual
echo "⏹️ Parando versão atual..."
docker-compose down

# 2. Restaurar versão anterior
echo "🔄 Restaurando versão anterior..."
export BACKEND_IMAGE=dataclinica/backend:$PREVIOUS_VERSION
export FRONTEND_IMAGE=dataclinica/frontend:$PREVIOUS_VERSION

docker-compose up -d

# 3. Verificar saúde
echo "🏥 Verificando saúde..."
sleep 30

if curl -f http://localhost:8000/api/health; then
    echo "✅ Rollback concluído com sucesso!"
else
    echo "❌ Rollback falhou!"
    exit 1
fi
```

## 📞 Suporte e Contato

### Informações de Suporte

- **Documentação**: https://docs.dataclinica.com
- **Issues**: https://github.com/dataclinica/dataclinica/issues
- **Email**: suporte@dataclinica.com
- **Slack**: #dataclinica-support

### Logs Importantes

```bash
# Localização dos logs
/var/log/dataclinica/
├── application.log      # Logs da aplicação
├── access.log          # Logs de acesso
├── error.log           # Logs de erro
├── database.log        # Logs do banco
├── backup.log          # Logs de backup
└── deploy.log          # Logs de deploy
```

### Checklist de Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados criado e migrado
- [ ] Redis configurado
- [ ] SSL/TLS configurado
- [ ] DNS configurado
- [ ] Backup configurado
- [ ] Monitoramento configurado
- [ ] Testes de saúde passando
- [ ] Testes de integração passando
- [ ] Documentação atualizada

---

**DataClínica** - Sistema de Gestão Clínica Completo

*Este manual foi criado para facilitar o deploy e manutenção do sistema. Para dúvidas ou sugestões, entre em contato com a equipe de desenvolvimento.*