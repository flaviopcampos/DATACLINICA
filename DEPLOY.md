# 🚀 Guia de Deploy - DataClinica

> Guia completo para deploy do DataClinica em produção

## 📋 Índice

- [Pré-requisitos](#pré-requisitos)
- [Configuração Inicial](#configuração-inicial)
- [Deploy Local (Desenvolvimento)](#deploy-local-desenvolvimento)
- [Deploy AWS (Produção)](#deploy-aws-produção)
- [Deploy Alternativo (Render/Railway)](#deploy-alternativo)
- [Monitoramento](#monitoramento)
- [Backup e Recuperação](#backup-e-recuperação)
- [Troubleshooting](#troubleshooting)

## 🔧 Pré-requisitos

### Ferramentas Necessárias

```bash
# Instalar Docker
# Windows: https://docs.docker.com/desktop/windows/
# Linux: https://docs.docker.com/engine/install/
# macOS: https://docs.docker.com/desktop/mac/

# Instalar Docker Compose
docker-compose --version

# Instalar Terraform
# Windows: choco install terraform
# Linux: sudo apt-get install terraform
# macOS: brew install terraform
terraform --version

# Instalar AWS CLI
# Windows: https://aws.amazon.com/cli/
# Linux: sudo apt-get install awscli
# macOS: brew install awscli
aws --version

# Instalar Make (opcional, mas recomendado)
# Windows: choco install make
# Linux: sudo apt-get install make
# macOS: brew install make
make --version
```

### Contas e Credenciais

- **AWS Account**: Para deploy em produção
- **Domain**: Domínio registrado (opcional)
- **SSL Certificate**: Certificado SSL (Let's Encrypt ou AWS Certificate Manager)
- **Email SMTP**: Para envio de emails (Gmail, SendGrid, etc.)
- **APIs Externas**: Chaves para Memed, ClickSign, etc.

## ⚙️ Configuração Inicial

### 1. Clone e Configuração

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/dataclinica.git
cd dataclinica

# Configuração automática
make setup
```

### 2. Configuração Manual

```bash
# Copiar arquivos de configuração
cp .env.example .env
cp terraform/terraform.tfvars.example terraform/terraform.tfvars

# Editar configurações
# Windows
notepad .env
notepad terraform/terraform.tfvars

# Linux/macOS
nano .env
nano terraform/terraform.tfvars
```

### 3. Variáveis de Ambiente Essenciais

```bash
# .env - Configurações mínimas para desenvolvimento
ENVIRONMENT=development
DEBUG=true
DATABASE_URL=postgresql://dataclinica:dataclinica123@localhost:5432/dataclinica
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=sua-chave-secreta-forte-aqui
JWT_SECRET_KEY=sua-chave-jwt-forte-aqui
```

## 💻 Deploy Local (Desenvolvimento)

### Método 1: Usando Make (Recomendado)

```bash
# Configuração inicial completa
make setup

# Iniciar ambiente de desenvolvimento
make dev

# Verificar status
make health

# Ver logs
make logs
```

### Método 2: Docker Compose Manual

```bash
# Construir imagens
docker-compose build

# Iniciar serviços
docker-compose up -d

# Executar migrações
docker-compose exec backend alembic upgrade head

# Criar usuário admin
docker-compose exec backend python scripts/create_admin.py

# Verificar logs
docker-compose logs -f
```

### Método 3: Desenvolvimento Nativo

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Frontend (novo terminal)
cd frontend
npm install
npm start

# Banco de dados (Docker)
docker-compose up -d postgres redis
```

### URLs de Desenvolvimento

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Documentação API**: http://localhost:8000/docs
- **Adminer (DB)**: http://localhost:8080
- **Mailhog (Email)**: http://localhost:8025
- **Redis Commander**: http://localhost:8081

## ☁️ Deploy AWS (Produção)

### 1. Configuração AWS

```bash
# Configurar credenciais AWS
aws configure
# AWS Access Key ID: sua-access-key
# AWS Secret Access Key: sua-secret-key
# Default region: us-east-1
# Default output format: json

# Verificar configuração
aws sts get-caller-identity
```

### 2. Configuração Terraform

```bash
# Editar terraform/terraform.tfvars
cd terraform
cp terraform.tfvars.example terraform.tfvars

# Configurações essenciais
project_name = "dataclinica"
environment = "production"
aws_region = "us-east-1"
domain_name = "dataclinica.com"
ssl_certificate_arn = "arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012"

# Configurações de banco
db_instance_class = "db.t3.micro"  # Para desenvolvimento
# db_instance_class = "db.t3.small"   # Para produção pequena
# db_instance_class = "db.t3.medium"  # Para produção média

# Configurações de cache
redis_node_type = "cache.t3.micro"  # Para desenvolvimento
# redis_node_type = "cache.t3.small"   # Para produção
```

### 3. Deploy da Infraestrutura

```bash
# Método 1: Usando Make
make infra-init
make infra-plan
make infra-apply

# Método 2: Terraform manual
cd terraform
terraform init
terraform plan
terraform apply

# Verificar outputs
terraform output
```

### 4. Deploy da Aplicação

```bash
# Build das imagens
make build

# Deploy para produção
make deploy-production

# Verificar status
make health
```

### 5. Configuração de Domínio

```bash
# Obter DNS do Load Balancer
terraform output alb_dns_name

# Configurar DNS (exemplo com Route 53)
# dataclinica.com -> CNAME -> alb-dataclinica-123456789.us-east-1.elb.amazonaws.com
# api.dataclinica.com -> CNAME -> alb-dataclinica-123456789.us-east-1.elb.amazonaws.com
```

## 🌐 Deploy Alternativo

### Render.com

```bash
# 1. Conectar repositório no Render.com
# 2. Configurar variáveis de ambiente
# 3. Deploy automático via Git

# Configurações no Render
# Build Command: make build
# Start Command: make start-production
# Environment: production
```

### Railway.app

```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login e deploy
railway login
railway init
railway up

# 3. Configurar variáveis
railway variables set DATABASE_URL=postgresql://...
railway variables set REDIS_URL=redis://...
```

### DigitalOcean App Platform

```yaml
# .do/app.yaml
name: dataclinica
services:
- name: backend
  source_dir: backend
  github:
    repo: seu-usuario/dataclinica
    branch: main
  run_command: uvicorn main:app --host 0.0.0.0 --port 8000
  environment_slug: python
  instance_count: 1
  instance_size_slug: basic-xxs
  
- name: frontend
  source_dir: frontend
  github:
    repo: seu-usuario/dataclinica
    branch: main
  build_command: npm run build
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs

databases:
- name: postgres
  engine: PG
  version: "13"
  size: basic-xs
  
- name: redis
  engine: REDIS
  version: "6"
  size: basic-xs
```

## 📊 Monitoramento

### Health Checks

```bash
# Verificar saúde da aplicação
make health

# Verificar serviços específicos
curl http://localhost:8000/api/health
curl http://localhost:8000/api/health/db
curl http://localhost:8000/api/health/redis
```

### Logs

```bash
# Logs locais
make logs
make logs-backend
make logs-frontend

# Logs AWS (CloudWatch)
aws logs tail /aws/ecs/dataclinica --follow

# Logs específicos
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Métricas

```bash
# Script de monitoramento
python scripts/health_monitor.py

# Métricas AWS
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ServiceName,Value=dataclinica-backend \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-01T23:59:59Z \
  --period 3600 \
  --statistics Average
```

## 💾 Backup e Recuperação

### Backup Automático

```bash
# Configurar backup automático
python scripts/backup.py --config backup_config.json

# Backup manual
make backup

# Verificar backups
aws s3 ls s3://dataclinica-backups/
```

### Restauração

```bash
# Listar backups disponíveis
python scripts/backup.py --list

# Restaurar backup específico
make restore BACKUP_FILE=backup_2024-01-01_02-00-00.sql

# Restauração manual
psql -h localhost -U dataclinica -d dataclinica < backup.sql
```

### Disaster Recovery

```bash
# 1. Provisionar nova infraestrutura
cd terraform
terraform apply -var="environment=dr"

# 2. Restaurar dados
python scripts/backup.py --restore --backup-id latest

# 3. Atualizar DNS
# Apontar domínio para nova infraestrutura

# 4. Verificar funcionamento
make health
```

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Erro de Conexão com Banco

```bash
# Verificar se PostgreSQL está rodando
docker-compose ps postgres

# Verificar logs do banco
docker-compose logs postgres

# Testar conexão
psql -h localhost -U dataclinica -d dataclinica

# Recriar banco se necessário
docker-compose down
docker volume rm dataclinica_postgres_data
docker-compose up -d postgres
```

#### 2. Erro de Conexão com Redis

```bash
# Verificar se Redis está rodando
docker-compose ps redis

# Testar conexão
redis-cli -h localhost -p 6379 ping

# Limpar cache se necessário
redis-cli -h localhost -p 6379 flushall
```

#### 3. Problemas de Build

```bash
# Limpar cache do Docker
docker system prune -a

# Rebuild sem cache
docker-compose build --no-cache

# Verificar espaço em disco
df -h
docker system df
```

#### 4. Problemas de Permissão

```bash
# Linux/macOS - ajustar permissões
sudo chown -R $USER:$USER .
chmod +x scripts/*.py

# Windows - executar como administrador
# Abrir PowerShell como administrador
```

#### 5. Problemas de Rede

```bash
# Verificar portas em uso
netstat -tulpn | grep :8000
netstat -tulpn | grep :3000

# Verificar conectividade
curl -I http://localhost:8000/api/health
telnet localhost 5432
telnet localhost 6379
```

### Logs de Debug

```bash
# Ativar modo debug
export DEBUG=true
export LOG_LEVEL=DEBUG

# Logs detalhados
docker-compose logs -f --tail=100

# Logs específicos por serviço
docker-compose exec backend tail -f /var/log/dataclinica/app.log
```

### Performance

```bash
# Monitorar recursos
docker stats

# Verificar queries lentas
docker-compose exec postgres psql -U dataclinica -d dataclinica -c "
  SELECT query, mean_time, calls 
  FROM pg_stat_statements 
  ORDER BY mean_time DESC 
  LIMIT 10;
"

# Verificar cache hit ratio
redis-cli -h localhost -p 6379 info stats
```

## 📞 Suporte

### Contatos

- **Email**: suporte@dataclinica.com
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/dataclinica/issues)
- **Documentação**: [Wiki](https://github.com/seu-usuario/dataclinica/wiki)

### Recursos Úteis

- [Documentação FastAPI](https://fastapi.tiangolo.com/)
- [Documentação React](https://reactjs.org/docs/)
- [Documentação PostgreSQL](https://www.postgresql.org/docs/)
- [Documentação Redis](https://redis.io/documentation)
- [Documentação AWS](https://docs.aws.amazon.com/)
- [Documentação Terraform](https://www.terraform.io/docs/)
- [Documentação Docker](https://docs.docker.com/)

---

<div align="center">
  <p>🚀 Deploy com confiança - DataClinica</p>
  <p>© 2024 DataClinica - Todos os direitos reservados</p>
</div>