# Makefile para DataClinica - Sistema SaaS de Gestão Clínica
# Comandos para desenvolvimento, build, deploy e manutenção

.PHONY: help install dev build test clean deploy docker-build docker-up docker-down logs backup setup info
.DEFAULT_GOAL := help

# Variáveis
PROJECT_NAME := dataclinica
DOCKER_COMPOSE := docker-compose
DOCKER := docker
PYTHON := python
NPM := npm
TERRAFORM := terraform
DOCKER_REGISTRY := dataclinica.azurecr.io
VERSION := $(shell git describe --tags --always --dirty 2>/dev/null || echo "dev")
ENV := development

# Cores para output
RED := \033[31m
GREEN := \033[32m
YELLOW := \033[33m
BLUE := \033[34m
MAGENTA := \033[35m
CYAN := \033[36m
WHITE := \033[37m
RESET := \033[0m

# =============================================================================
# HELP E INFORMAÇÕES
# =============================================================================

help: ## Mostra esta ajuda
	@echo "$(CYAN)DataClinica - Sistema SaaS de Gestão Clínica$(RESET)"
	@echo "$(YELLOW)Comandos disponíveis:$(RESET)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(RESET) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(YELLOW)Exemplos de uso:$(RESET)"
	@echo "  make setup           # Configuração inicial"
	@echo "  make dev             # Ambiente de desenvolvimento"
	@echo "  make test            # Executar testes"
	@echo "  make deploy ENV=prod # Deploy para produção"

info: ## Mostra informações do projeto
	@echo "$(CYAN)Informações do Projeto$(RESET)"
	@echo "Nome: $(PROJECT_NAME)"
	@echo "Versão: $(VERSION)"
	@echo "Ambiente: $(ENV)"
	@echo "Registry: $(DOCKER_REGISTRY)"
	@echo "Git Branch: $(shell git branch --show-current 2>/dev/null || echo 'unknown')"
	@echo "Git Commit: $(shell git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"

# =============================================================================
# CONFIGURAÇÃO E SETUP
# =============================================================================

setup: ## Configuração inicial do projeto
	@echo "$(YELLOW)Configurando ambiente inicial...$(RESET)"
	@if not exist ".env" copy ".env.example" ".env"
	@echo "$(GREEN)Arquivo .env criado. Configure as variáveis necessárias.$(RESET)"
	@$(DOCKER) --version || (echo "$(RED)Docker não encontrado. Instale o Docker primeiro.$(RESET)" && exit 1)
	@$(DOCKER_COMPOSE) --version || (echo "$(RED)Docker Compose não encontrado.$(RESET)" && exit 1)
	@echo "$(GREEN)Setup concluído!$(RESET)"

setup-dev: ## Configuração para desenvolvimento
	@echo "$(YELLOW)Configurando ambiente de desenvolvimento...$(RESET)"
	@if not exist ".env.dev" copy ".env.example" ".env.dev"
	@$(DOCKER_COMPOSE) -f docker-compose.dev.yml pull
	@$(DOCKER_COMPOSE) -f docker-compose.dev.yml build
	@echo "$(GREEN)Ambiente de desenvolvimento configurado!$(RESET)"

# =============================================================================
# INSTALAÇÃO
# =============================================================================

# Instalação
install: ## Instalar todas as dependências
	@echo "$(BLUE)Instalando dependências...$(RESET)"
	@echo "$(YELLOW)Backend (Python)...$(RESET)"
	cd backend && pip install -r requirements.txt
	@echo "$(YELLOW)Frontend (Node.js)...$(RESET)"
	cd frontend && $(NPM) install
	@echo "$(GREEN)Dependências instaladas com sucesso!$(RESET)"

install-backend: ## Instalar dependências do backend
	@echo "$(BLUE)Instalando dependências do backend...$(RESET)"
	cd backend && pip install -r requirements.txt
	@echo "$(GREEN)Backend instalado com sucesso!$(RESET)"

install-frontend: ## Instalar dependências do frontend
	@echo "$(BLUE)Instalando dependências do frontend...$(RESET)"
	cd frontend && $(NPM) install
	@echo "$(GREEN)Frontend instalado com sucesso!$(RESET)"

# Desenvolvimento
dev: ## Iniciar ambiente de desenvolvimento completo
	@echo "$(BLUE)Iniciando ambiente de desenvolvimento...$(RESET)"
	$(DOCKER_COMPOSE) up -d postgres redis
	@echo "$(YELLOW)Aguardando serviços ficarem prontos...$(RESET)"
	@sleep 10
	@echo "$(YELLOW)Executando migrações...$(RESET)"
	$(MAKE) migrate
	@echo "$(YELLOW)Iniciando aplicação...$(RESET)"
	$(DOCKER_COMPOSE) up backend frontend

dev-backend: ## Iniciar apenas o backend
	@echo "$(BLUE)Iniciando backend...$(RESET)"
	$(DOCKER_COMPOSE) up -d postgres redis
	@sleep 5
	$(MAKE) migrate
	cd backend && uvicorn main:app --host 0.0.0.0 --port 8000 --reload

dev-frontend: ## Iniciar apenas o frontend
	@echo "$(BLUE)Iniciando frontend...$(RESET)"
	cd frontend && $(NPM) start

dev-tools: ## Iniciar ferramentas de desenvolvimento (Adminer, Mailhog)
	@echo "$(BLUE)Iniciando ferramentas de desenvolvimento...$(RESET)"
	$(DOCKER_COMPOSE) --profile tools up -d
	@echo "$(GREEN)Ferramentas disponíveis:$(RESET)"
	@echo "  Adminer (DB): http://localhost:8080"
	@echo "  Mailhog: http://localhost:8025"

# Docker
docker-build: ## Build das imagens Docker
	@echo "$(BLUE)Building imagens Docker...$(RESET)"
	$(DOCKER_COMPOSE) build
	@echo "$(GREEN)Imagens construídas com sucesso!$(RESET)"

docker-up: ## Subir todos os serviços Docker
	@echo "$(BLUE)Subindo serviços Docker...$(RESET)"
	$(DOCKER_COMPOSE) up -d
	@echo "$(GREEN)Serviços iniciados!$(RESET)"
	@echo "$(YELLOW)Aplicação disponível em: http://localhost:3000$(RESET)"
	@echo "$(YELLOW)API disponível em: http://localhost:8000$(RESET)"

docker-down: ## Parar todos os serviços Docker
	@echo "$(BLUE)Parando serviços Docker...$(RESET)"
	$(DOCKER_COMPOSE) down
	@echo "$(GREEN)Serviços parados!$(RESET)"

docker-restart: ## Reiniciar serviços Docker
	@echo "$(BLUE)Reiniciando serviços Docker...$(RESET)"
	$(DOCKER_COMPOSE) restart
	@echo "$(GREEN)Serviços reiniciados!$(RESET)"

docker-clean: ## Limpar containers, volumes e imagens não utilizados
	@echo "$(BLUE)Limpando Docker...$(RESET)"
	$(DOCKER) system prune -f
	$(DOCKER) volume prune -f
	@echo "$(GREEN)Limpeza concluída!$(RESET)"

# Banco de dados
migrate: ## Executar migrações do banco de dados
	@echo "$(BLUE)Executando migrações...$(RESET)"
	cd backend && alembic upgrade head
	@echo "$(GREEN)Migrações executadas!$(RESET)"

migrate-create: ## Criar nova migração (uso: make migrate-create MESSAGE="descrição")
	@echo "$(BLUE)Criando nova migração...$(RESET)"
	cd backend && alembic revision --autogenerate -m "$(MESSAGE)"
	@echo "$(GREEN)Migração criada!$(RESET)"

migrate-rollback: ## Reverter última migração
	@echo "$(BLUE)Revertendo migração...$(RESET)"
	cd backend && alembic downgrade -1
	@echo "$(GREEN)Migração revertida!$(RESET)"

db-reset: ## Resetar banco de dados (CUIDADO: apaga todos os dados)
	@echo "$(RED)ATENÇÃO: Isso irá apagar todos os dados!$(RESET)"
	@read -p "Tem certeza? (y/N): " confirm && [ "$$confirm" = "y" ]
	$(DOCKER_COMPOSE) down -v
	$(DOCKER_COMPOSE) up -d postgres
	@sleep 10
	$(MAKE) migrate
	@echo "$(GREEN)Banco resetado!$(RESET)"

db-seed: ## Popular banco com dados de exemplo
	@echo "$(BLUE)Populando banco com dados de exemplo...$(RESET)"
	cd backend && $(PYTHON) scripts/seed_data.py
	@echo "$(GREEN)Dados de exemplo inseridos!$(RESET)"

# Testes
test: ## Executar todos os testes
	@echo "$(BLUE)Executando testes...$(RESET)"
	$(MAKE) test-backend
	$(MAKE) test-frontend
	@echo "$(GREEN)Todos os testes executados!$(RESET)"

test-backend: ## Executar testes do backend
	@echo "$(BLUE)Executando testes do backend...$(RESET)"
	cd backend && $(PYTHON) -m pytest tests/ -v --cov=. --cov-report=html
	@echo "$(GREEN)Testes do backend concluídos!$(RESET)"

test-frontend: ## Executar testes do frontend
	@echo "$(BLUE)Executando testes do frontend...$(RESET)"
	cd frontend && $(NPM) test -- --coverage --watchAll=false
	@echo "$(GREEN)Testes do frontend concluídos!$(RESET)"

test-e2e: ## Executar testes end-to-end
	@echo "$(BLUE)Executando testes E2E...$(RESET)"
	cd frontend && $(NPM) run test:e2e
	@echo "$(GREEN)Testes E2E concluídos!$(RESET)"

# Build
build: ## Build da aplicação para produção
	@echo "$(BLUE)Building aplicação...$(RESET)"
	$(MAKE) build-backend
	$(MAKE) build-frontend
	@echo "$(GREEN)Build concluído!$(RESET)"

build-backend: ## Build do backend
	@echo "$(BLUE)Building backend...$(RESET)"
	$(DOCKER) build -t $(PROJECT_NAME)/backend:latest ./backend
	@echo "$(GREEN)Backend build concluído!$(RESET)"

build-frontend: ## Build do frontend
	@echo "$(BLUE)Building frontend...$(RESET)"
	cd frontend && $(NPM) run build
	$(DOCKER) build -t $(PROJECT_NAME)/frontend:latest ./frontend
	@echo "$(GREEN)Frontend build concluído!$(RESET)"

# Qualidade de código
lint: ## Executar linting em todo o código
	@echo "$(BLUE)Executando linting...$(RESET)"
	$(MAKE) lint-backend
	$(MAKE) lint-frontend
	@echo "$(GREEN)Linting concluído!$(RESET)"

lint-backend: ## Linting do backend
	@echo "$(BLUE)Linting backend...$(RESET)"
	cd backend && flake8 . --max-line-length=88 --extend-ignore=E203,W503
	cd backend && black . --check
	cd backend && isort . --check-only
	@echo "$(GREEN)Linting backend concluído!$(RESET)"

lint-frontend: ## Linting do frontend
	@echo "$(BLUE)Linting frontend...$(RESET)"
	cd frontend && $(NPM) run lint
	@echo "$(GREEN)Linting frontend concluído!$(RESET)"

format: ## Formatar código automaticamente
	@echo "$(BLUE)Formatando código...$(RESET)"
	cd backend && black . && isort .
	cd frontend && $(NPM) run format
	@echo "$(GREEN)Código formatado!$(RESET)"

security: ## Verificações de segurança
	@echo "$(BLUE)Executando verificações de segurança...$(RESET)"
	cd backend && bandit -r . || echo "$(YELLOW)Bandit não instalado$(RESET)"
	cd frontend && $(NPM) audit
	@echo "$(GREEN)Verificações de segurança concluídas!$(RESET)"

# =============================================================================
# INFRAESTRUTURA
# =============================================================================

infra-init: ## Inicializar Terraform
	@echo "$(BLUE)Inicializando Terraform...$(RESET)"
	cd infrastructure && $(TERRAFORM) init
	@echo "$(GREEN)Terraform inicializado!$(RESET)"

infra-plan: ## Planejar infraestrutura
	@echo "$(BLUE)Planejando infraestrutura...$(RESET)"
	cd infrastructure && $(TERRAFORM) plan -var-file="environments/$(ENV).tfvars"

infra-apply: ## Aplicar infraestrutura
	@echo "$(BLUE)Aplicando infraestrutura...$(RESET)"
	cd infrastructure && $(TERRAFORM) apply -var-file="environments/$(ENV).tfvars"
	@echo "$(GREEN)Infraestrutura aplicada!$(RESET)"

infra-destroy: ## Destruir infraestrutura
	@echo "$(RED)ATENÇÃO: Isso irá destruir toda a infraestrutura!$(RESET)"
	@pause
	cd infrastructure && $(TERRAFORM) destroy -var-file="environments/$(ENV).tfvars"

# =============================================================================
# DEPLOY
# =============================================================================

deploy-staging: ## Deploy para staging
	@echo "$(BLUE)Deploy para staging...$(RESET)"
	$(MAKE) build
	$(DOCKER_COMPOSE) -f docker-compose.staging.yml up -d
	@echo "$(GREEN)Deploy para staging concluído!$(RESET)"

deploy-production: ## Deploy para produção
	@echo "$(RED)ATENÇÃO: Deploy para produção!$(RESET)"
	@pause
	$(MAKE) build
	$(DOCKER_COMPOSE) -f docker-compose.prod.yml up -d
	$(MAKE) health
	@echo "$(GREEN)Deploy para produção concluído!$(RESET)"

# =============================================================================
# MONITORAMENTO
# =============================================================================

health: ## Verificar saúde dos serviços
	@echo "$(BLUE)Verificando saúde dos serviços...$(RESET)"
	@curl -f http://localhost:8000/api/health || echo "$(RED)Backend não está respondendo$(RESET)"
	@curl -f http://localhost:3000 || echo "$(RED)Frontend não está respondendo$(RESET)"
	@echo "$(GREEN)Verificação concluída!$(RESET)"

status: ## Status dos containers
	@echo "$(CYAN)Status dos containers:$(RESET)"
	@$(DOCKER_COMPOSE) ps

logs: ## Logs dos serviços
	@$(DOCKER_COMPOSE) logs -f --tail=100

logs-backend: ## Logs do backend
	@$(DOCKER_COMPOSE) logs -f backend

logs-frontend: ## Logs do frontend
	@$(DOCKER_COMPOSE) logs -f frontend

logs-db: ## Logs do banco
	@$(DOCKER_COMPOSE) logs -f postgres

metrics: ## Métricas dos containers
	@$(DOCKER) stats

# =============================================================================
# BACKUP
# =============================================================================

backup: ## Backup do banco de dados
	@echo "$(BLUE)Criando backup...$(RESET)"
	@if not exist "backups" mkdir backups
	@$(DOCKER_COMPOSE) exec postgres pg_dump -U dataclinica dataclinica > backups/backup_$(shell powershell -Command "Get-Date -Format 'yyyyMMdd_HHmmss'").sql
	@echo "$(GREEN)Backup criado!$(RESET)"

restore: ## Restaurar backup (BACKUP_FILE=arquivo)
	@echo "$(BLUE)Restaurando backup...$(RESET)"
	@if "$(BACKUP_FILE)" == "" (echo "$(RED)Especifique BACKUP_FILE=arquivo$(RESET)" && exit 1)
	@$(DOCKER_COMPOSE) exec -T postgres psql -U dataclinica dataclinica < $(BACKUP_FILE)
	@echo "$(GREEN)Backup restaurado!$(RESET)"

# =============================================================================
# UTILITÁRIOS
# =============================================================================

shell-backend: ## Shell do backend
	@$(DOCKER_COMPOSE) exec backend bash

shell-frontend: ## Shell do frontend
	@$(DOCKER_COMPOSE) exec frontend sh

shell-db: ## Shell do banco
	@$(DOCKER_COMPOSE) exec postgres psql -U dataclinica dataclinica

clean: ## Limpeza geral
	@echo "$(BLUE)Limpando sistema...$(RESET)"
	@$(DOCKER) system prune -f
	@$(DOCKER) volume prune -f
	@echo "$(GREEN)Limpeza concluída!$(RESET)"

clean-all: ## Limpeza completa
	@echo "$(RED)ATENÇÃO: Limpeza completa!$(RESET)"
	@pause
	@$(DOCKER) system prune -a -f
	@$(DOCKER) volume prune -f
	@echo "$(GREEN)Limpeza completa concluída!$(RESET)"

# =============================================================================
# RELEASE
# =============================================================================

release: ## Criar nova release
	@echo "$(BLUE)Criando release...$(RESET)"
	@git tag -a v$(VERSION) -m "Release v$(VERSION)"
	@git push origin v$(VERSION)
	@echo "$(GREEN)Release v$(VERSION) criada!$(RESET)"

changelog: ## Gerar changelog
	@echo "$(BLUE)Gerando changelog...$(RESET)"
	@git log --oneline --decorate --graph > CHANGELOG.md
	@echo "$(GREEN)Changelog gerado!$(RESET)"

# =============================================================================
# CONFIGURAÇÕES ESPECÍFICAS DO WINDOWS
# =============================================================================

# Usar PowerShell no Windows
ifeq ($(OS),Windows_NT)
    SHELL := powershell.exe
    .SHELLFLAGS := -NoProfile -Command
endif

# Carregar variáveis do .env se existir
ifneq (,$(wildcard ./.env))
    include .env
    export
endif

format: ## Formatar código automaticamente
	@echo "$(BLUE)Formatando código...$(RESET)"
	$(MAKE) format-backend
	$(MAKE) format-frontend
	@echo "$(GREEN)Formatação concluída!$(RESET)"

format-backend: ## Formatar código do backend
	@echo "$(BLUE)Formatando backend...$(RESET)"
	cd backend && black .
	cd backend && isort .
	@echo "$(GREEN)Backend formatado!$(RESET)"

format-frontend: ## Formatar código do frontend
	@echo "$(BLUE)Formatando frontend...$(RESET)"
	cd frontend && $(NPM) run format
	@echo "$(GREEN)Frontend formatado!$(RESET)"

# Logs
logs: ## Ver logs de todos os serviços
	$(DOCKER_COMPOSE) logs -f

logs-backend: ## Ver logs do backend
	$(DOCKER_COMPOSE) logs -f backend

logs-frontend: ## Ver logs do frontend
	$(DOCKER_COMPOSE) logs -f frontend

logs-db: ## Ver logs do banco de dados
	$(DOCKER_COMPOSE) logs -f postgres

logs-redis: ## Ver logs do Redis
	$(DOCKER_COMPOSE) logs -f redis

# Backup
backup: ## Criar backup do banco de dados
	@echo "$(BLUE)Criando backup...$(RESET)"
	$(PYTHON) scripts/backup.py
	@echo "$(GREEN)Backup criado!$(RESET)"

restore: ## Restaurar backup (uso: make restore BACKUP_FILE=caminho/para/backup.sql)
	@echo "$(BLUE)Restaurando backup...$(RESET)"
	@if [ -z "$(BACKUP_FILE)" ]; then echo "$(RED)Erro: BACKUP_FILE não especificado$(RESET)"; exit 1; fi
	$(DOCKER_COMPOSE) exec -T postgres psql -U dataclinica_user -d dataclinica < $(BACKUP_FILE)
	@echo "$(GREEN)Backup restaurado!$(RESET)"

# Infraestrutura
infra-init: ## Inicializar Terraform
	@echo "$(BLUE)Inicializando Terraform...$(RESET)"
	cd terraform && $(TERRAFORM) init
	@echo "$(GREEN)Terraform inicializado!$(RESET)"

infra-plan: ## Planejar mudanças na infraestrutura
	@echo "$(BLUE)Planejando infraestrutura...$(RESET)"
	cd terraform && $(TERRAFORM) plan

infra-apply: ## Aplicar mudanças na infraestrutura
	@echo "$(BLUE)Aplicando infraestrutura...$(RESET)"
	cd terraform && $(TERRAFORM) apply
	@echo "$(GREEN)Infraestrutura aplicada!$(RESET)"

infra-destroy: ## Destruir infraestrutura (CUIDADO!)
	@echo "$(RED)ATENÇÃO: Isso irá destruir toda a infraestrutura!$(RESET)"
	@read -p "Tem certeza? (y/N): " confirm && [ "$$confirm" = "y" ]
	cd terraform && $(TERRAFORM) destroy
	@echo "$(GREEN)Infraestrutura destruída!$(RESET)"

# Deploy
deploy-staging: ## Deploy para ambiente de staging
	@echo "$(BLUE)Deploy para staging...$(RESET)"
	$(MAKE) test
	$(MAKE) build
	# Adicionar comandos específicos de deploy para staging
	@echo "$(GREEN)Deploy para staging concluído!$(RESET)"

deploy-production: ## Deploy para produção
	@echo "$(BLUE)Deploy para produção...$(RESET)"
	@echo "$(RED)ATENÇÃO: Deploy para produção!$(RESET)"
	@read -p "Tem certeza? (y/N): " confirm && [ "$$confirm" = "y" ]
	$(MAKE) test
	$(MAKE) build
	# Adicionar comandos específicos de deploy para produção
	@echo "$(GREEN)Deploy para produção concluído!$(RESET)"

# Monitoramento
health: ## Verificar saúde da aplicação
	@echo "$(BLUE)Verificando saúde da aplicação...$(RESET)"
	$(PYTHON) scripts/health_monitor.py

status: ## Status dos serviços
	@echo "$(BLUE)Status dos serviços:$(RESET)"
	$(DOCKER_COMPOSE) ps

stats: ## Estatísticas dos containers
	@echo "$(BLUE)Estatísticas dos containers:$(RESET)"
	$(DOCKER) stats --no-stream

# Limpeza
clean: ## Limpar arquivos temporários e cache
	@echo "$(BLUE)Limpando arquivos temporários...$(RESET)"
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	find . -type d -name ".pytest_cache" -delete
	find . -type f -name ".coverage" -delete
	cd frontend && rm -rf build/ dist/ node_modules/.cache/
	@echo "$(GREEN)Limpeza concluída!$(RESET)"

clean-all: ## Limpeza completa (inclui Docker)
	@echo "$(BLUE)Limpeza completa...$(RESET)"
	$(MAKE) clean
	$(MAKE) docker-clean
	@echo "$(GREEN)Limpeza completa concluída!$(RESET)"

# Utilitários
shell-backend: ## Abrir shell no container do backend
	$(DOCKER_COMPOSE) exec backend /bin/bash

shell-frontend: ## Abrir shell no container do frontend
	$(DOCKER_COMPOSE) exec frontend /bin/bash

shell-db: ## Abrir shell no banco de dados
	$(DOCKER_COMPOSE) exec postgres psql -U dataclinica_user -d dataclinica

shell-redis: ## Abrir shell no Redis
	$(DOCKER_COMPOSE) exec redis redis-cli

# Configuração
setup: ## Configuração inicial do projeto
	@echo "$(BLUE)Configuração inicial do DataClinica...$(RESET)"
	@echo "$(YELLOW)1. Instalando dependências...$(RESET)"
	$(MAKE) install
	@echo "$(YELLOW)2. Copiando arquivos de configuração...$(RESET)"
	cp .env.example .env
	cp terraform/terraform.tfvars.example terraform/terraform.tfvars
	@echo "$(YELLOW)3. Iniciando serviços...$(RESET)"
	$(MAKE) docker-up
	@echo "$(YELLOW)4. Executando migrações...$(RESET)"
	sleep 15
	$(MAKE) migrate
	@echo "$(YELLOW)5. Populando dados de exemplo...$(RESET)"
	$(MAKE) db-seed
	@echo "$(GREEN)Configuração inicial concluída!$(RESET)"
	@echo "$(CYAN)Aplicação disponível em: http://localhost:3000$(RESET)"
	@echo "$(CYAN)API disponível em: http://localhost:8000$(RESET)"
	@echo "$(CYAN)Documentação da API: http://localhost:8000/docs$(RESET)"

info: ## Informações do projeto
	@echo "$(CYAN)DataClinica - Sistema de Gestão Clínica$(RESET)"
	@echo ""
	@echo "$(YELLOW)URLs importantes:$(RESET)"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Backend API: http://localhost:8000"
	@echo "  Documentação API: http://localhost:8000/docs"
	@echo "  Adminer (DB): http://localhost:8080"
	@echo "  Mailhog: http://localhost:8025"
	@echo ""
	@echo "$(YELLOW)Tecnologias:$(RESET)"
	@echo "  Backend: FastAPI + PostgreSQL + Redis"
	@echo "  Frontend: React + Material-UI"
	@echo "  Infraestrutura: Docker + AWS + Terraform"
	@echo ""
	@echo "$(YELLOW)Para começar:$(RESET)"
	@echo "  make setup    # Configuração inicial"
	@echo "  make dev      # Ambiente de desenvolvimento"
	@echo "  make help     # Ver todos os comandos"

# Default target
.DEFAULT_GOAL := help