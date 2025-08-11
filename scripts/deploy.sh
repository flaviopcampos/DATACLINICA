#!/bin/bash

# =============================================================================
# Script de Deploy Automatizado - DataClinica
# Suporte para ambientes: development, staging, production
# =============================================================================

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações padrão
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DEFAULT_ENVIRONMENT="staging"
DEFAULT_VERSION="latest"
DRY_RUN=false
VERBOSE=false
SKIP_TESTS=false
SKIP_BACKUP=false
FORCE_DEPLOY=false

# Função para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"
}

# Função para mostrar ajuda
show_help() {
    cat << EOF
Script de Deploy Automatizado - DataClinica

USO:
    $0 [OPÇÕES] [AMBIENTE]

AMBIENTES:
    development     Deploy local para desenvolvimento
    staging         Deploy para ambiente de staging
    production      Deploy para ambiente de produção

OPÇÕES:
    -v, --version VERSION    Versão a ser deployada (default: latest)
    -d, --dry-run           Simular deploy sem executar
    --verbose               Output detalhado
    --skip-tests            Pular execução de testes
    --skip-backup           Pular backup do banco (produção)
    --force                 Forçar deploy mesmo com falhas
    -h, --help              Mostrar esta ajuda

EXEMPLOS:
    $0 staging                          # Deploy staging com versão latest
    $0 production --version v1.2.3      # Deploy produção com versão específica
    $0 staging --dry-run                # Simular deploy staging
    $0 production --skip-backup --force # Deploy produção sem backup

VARIÁVEIS DE AMBIENTE:
    AWS_PROFILE                 Perfil AWS a ser usado
    DOCKER_REGISTRY            Registry Docker (default: dataclinica)
    SLACK_WEBHOOK_URL           URL do webhook Slack para notificações
    DB_BACKUP_S3_BUCKET         Bucket S3 para backups
    ROLLBACK_ON_FAILURE         Rollback automático em caso de falha (true/false)

EOF
}

# Função para validar pré-requisitos
validate_prerequisites() {
    log "Validando pré-requisitos..."
    
    local missing_tools=()
    
    # Verificar ferramentas necessárias
    command -v docker >/dev/null 2>&1 || missing_tools+=("docker")
    command -v docker-compose >/dev/null 2>&1 || missing_tools+=("docker-compose")
    command -v aws >/dev/null 2>&1 || missing_tools+=("aws")
    command -v jq >/dev/null 2>&1 || missing_tools+=("jq")
    
    if [[ ${#missing_tools[@]} -gt 0 ]]; then
        log_error "Ferramentas necessárias não encontradas: ${missing_tools[*]}"
        log "Instale as ferramentas necessárias e tente novamente."
        exit 1
    fi
    
    # Verificar credenciais AWS
    if [[ "$ENVIRONMENT" != "development" ]]; then
        if ! aws sts get-caller-identity >/dev/null 2>&1; then
            log_error "Credenciais AWS não configuradas ou inválidas"
            log "Configure as credenciais AWS e tente novamente."
            exit 1
        fi
    fi
    
    # Verificar se está no diretório correto
    if [[ ! -f "$PROJECT_ROOT/docker-compose.yml" ]]; then
        log_error "Arquivo docker-compose.yml não encontrado em $PROJECT_ROOT"
        exit 1
    fi
    
    log_success "Pré-requisitos validados"
}

# Função para carregar configurações do ambiente
load_environment_config() {
    log "Carregando configurações para ambiente: $ENVIRONMENT"
    
    # Arquivo de configuração do ambiente
    local env_file="$PROJECT_ROOT/.env.$ENVIRONMENT"
    
    if [[ -f "$env_file" ]]; then
        set -a  # Automatically export all variables
        source "$env_file"
        set +a
        log_success "Configurações carregadas de $env_file"
    else
        log_warning "Arquivo de configuração $env_file não encontrado"
    fi
    
    # Configurações específicas por ambiente
    case "$ENVIRONMENT" in
        "development")
            DOCKER_REGISTRY=${DOCKER_REGISTRY:-"dataclinica"}
            COMPOSE_FILE="docker-compose.yml:docker-compose.dev.yml"
            HEALTH_CHECK_URL="http://localhost:8000/health"
            ;;
        "staging")
            DOCKER_REGISTRY=${DOCKER_REGISTRY:-"dataclinica"}
            COMPOSE_FILE="docker-compose.yml:docker-compose.staging.yml"
            HEALTH_CHECK_URL="https://staging.dataclinica.com.br/health"
            ECS_CLUSTER="dataclinica-staging"
            ECS_SERVICE="dataclinica-staging-service"
            ;;
        "production")
            DOCKER_REGISTRY=${DOCKER_REGISTRY:-"dataclinica"}
            COMPOSE_FILE="docker-compose.yml:docker-compose.prod.yml"
            HEALTH_CHECK_URL="https://dataclinica.com.br/health"
            ECS_CLUSTER="dataclinica-production"
            ECS_SERVICE="dataclinica-production-service"
            ;;
        *)
            log_error "Ambiente inválido: $ENVIRONMENT"
            exit 1
            ;;
    esac
    
    export DOCKER_REGISTRY COMPOSE_FILE HEALTH_CHECK_URL
    export ECS_CLUSTER ECS_SERVICE
}

# Função para executar testes
run_tests() {
    if [[ "$SKIP_TESTS" == "true" ]]; then
        log_warning "Pulando execução de testes"
        return 0
    fi
    
    log "Executando testes..."
    
    cd "$PROJECT_ROOT"
    
    # Testes do backend
    log "Executando testes do backend..."
    if ! make test-backend; then
        log_error "Testes do backend falharam"
        return 1
    fi
    
    # Testes do frontend
    log "Executando testes do frontend..."
    if ! make test-frontend; then
        log_error "Testes do frontend falharam"
        return 1
    fi
    
    # Testes de integração (apenas para staging/production)
    if [[ "$ENVIRONMENT" != "development" ]]; then
        log "Executando testes de integração..."
        if ! make test-e2e; then
            log_error "Testes de integração falharam"
            return 1
        fi
    fi
    
    log_success "Todos os testes passaram"
}

# Função para fazer backup do banco de dados
backup_database() {
    if [[ "$SKIP_BACKUP" == "true" ]] || [[ "$ENVIRONMENT" == "development" ]]; then
        log_warning "Pulando backup do banco de dados"
        return 0
    fi
    
    log "Fazendo backup do banco de dados..."
    
    local backup_timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_file="dataclinica_backup_${ENVIRONMENT}_${backup_timestamp}.sql"
    local s3_bucket=${DB_BACKUP_S3_BUCKET:-"dataclinica-backups"}
    
    # Fazer backup usando make
    if ! make backup BACKUP_FILE="$backup_file"; then
        log_error "Falha ao fazer backup do banco de dados"
        return 1
    fi
    
    # Upload para S3
    if command -v aws >/dev/null 2>&1; then
        log "Enviando backup para S3..."
        if aws s3 cp "$backup_file" "s3://$s3_bucket/database/$ENVIRONMENT/"; then
            log_success "Backup enviado para S3: s3://$s3_bucket/database/$ENVIRONMENT/$backup_file"
            rm -f "$backup_file"
        else
            log_warning "Falha ao enviar backup para S3, mantendo arquivo local: $backup_file"
        fi
    fi
    
    log_success "Backup do banco de dados concluído"
}

# Função para build das imagens Docker
build_images() {
    log "Fazendo build das imagens Docker..."
    
    cd "$PROJECT_ROOT"
    
    # Definir tags
    local backend_tag="$DOCKER_REGISTRY/dataclinica-backend:$VERSION"
    local frontend_tag="$DOCKER_REGISTRY/dataclinica-frontend:$VERSION"
    
    # Build do backend
    log "Build da imagem do backend: $backend_tag"
    if ! docker build -t "$backend_tag" -f backend/Dockerfile backend/; then
        log_error "Falha no build da imagem do backend"
        return 1
    fi
    
    # Build do frontend
    log "Build da imagem do frontend: $frontend_tag"
    if ! docker build -t "$frontend_tag" -f frontend/Dockerfile.prod frontend/; then
        log_error "Falha no build da imagem do frontend"
        return 1
    fi
    
    # Push das imagens (apenas para staging/production)
    if [[ "$ENVIRONMENT" != "development" ]]; then
        log "Fazendo push das imagens..."
        
        if ! docker push "$backend_tag"; then
            log_error "Falha no push da imagem do backend"
            return 1
        fi
        
        if ! docker push "$frontend_tag"; then
            log_error "Falha no push da imagem do frontend"
            return 1
        fi
    fi
    
    log_success "Build das imagens concluído"
}

# Função para deploy local (development)
deploy_local() {
    log "Iniciando deploy local..."
    
    cd "$PROJECT_ROOT"
    
    # Parar containers existentes
    docker-compose down
    
    # Iniciar containers
    if ! docker-compose up -d; then
        log_error "Falha ao iniciar containers"
        return 1
    fi
    
    # Aguardar serviços ficarem prontos
    log "Aguardando serviços ficarem prontos..."
    sleep 30
    
    # Executar migrações
    if ! make migrate; then
        log_error "Falha ao executar migrações"
        return 1
    fi
    
    log_success "Deploy local concluído"
}

# Função para deploy no ECS (staging/production)
deploy_ecs() {
    log "Iniciando deploy no ECS..."
    
    # Atualizar serviço ECS
    log "Atualizando serviço ECS: $ECS_SERVICE no cluster: $ECS_CLUSTER"
    
    if ! aws ecs update-service \
        --cluster "$ECS_CLUSTER" \
        --service "$ECS_SERVICE" \
        --force-new-deployment \
        --query 'service.serviceName' \
        --output text; then
        log_error "Falha ao atualizar serviço ECS"
        return 1
    fi
    
    # Aguardar deploy estabilizar
    log "Aguardando deploy estabilizar..."
    
    if ! aws ecs wait services-stable \
        --cluster "$ECS_CLUSTER" \
        --services "$ECS_SERVICE"; then
        log_error "Deploy não estabilizou no tempo esperado"
        return 1
    fi
    
    log_success "Deploy no ECS concluído"
}

# Função para executar health check
health_check() {
    log "Executando health check..."
    
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        log "Tentativa $attempt/$max_attempts: $HEALTH_CHECK_URL"
        
        if curl -f -s "$HEALTH_CHECK_URL" >/dev/null 2>&1; then
            log_success "Health check passou"
            return 0
        fi
        
        sleep 10
        ((attempt++))
    done
    
    log_error "Health check falhou após $max_attempts tentativas"
    return 1
}

# Função para executar smoke tests
run_smoke_tests() {
    log "Executando smoke tests..."
    
    cd "$PROJECT_ROOT"
    
    # Configurar URL do ambiente
    export TARGET_URL="$HEALTH_CHECK_URL"
    
    # Executar smoke tests
    if command -v artillery >/dev/null 2>&1; then
        if ! artillery run tests/smoke/smoke-tests.yml; then
            log_error "Smoke tests falharam"
            return 1
        fi
    else
        log_warning "Artillery não encontrado, pulando smoke tests"
    fi
    
    log_success "Smoke tests concluídos"
}

# Função para rollback
rollback() {
    log_warning "Iniciando rollback..."
    
    if [[ "$ENVIRONMENT" == "development" ]]; then
        log "Restaurando containers anteriores..."
        docker-compose down
        # Aqui você poderia restaurar uma versão anterior
        log_warning "Rollback local não implementado completamente"
    else
        log "Fazendo rollback do serviço ECS..."
        # Aqui você implementaria a lógica de rollback do ECS
        log_warning "Rollback ECS não implementado completamente"
    fi
}

# Função para enviar notificações
send_notifications() {
    local status="$1"
    local message="$2"
    
    # Notificação Slack
    if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        local color="good"
        local emoji="✅"
        
        if [[ "$status" == "failure" ]]; then
            color="danger"
            emoji="❌"
        elif [[ "$status" == "warning" ]]; then
            color="warning"
            emoji="⚠️"
        fi
        
        local payload=$(cat << EOF
{
    "attachments": [
        {
            "color": "$color",
            "title": "$emoji Deploy DataClinica - $ENVIRONMENT",
            "text": "$message",
            "fields": [
                {
                    "title": "Ambiente",
                    "value": "$ENVIRONMENT",
                    "short": true
                },
                {
                    "title": "Versão",
                    "value": "$VERSION",
                    "short": true
                },
                {
                    "title": "Usuário",
                    "value": "$(whoami)",
                    "short": true
                },
                {
                    "title": "Timestamp",
                    "value": "$(date)",
                    "short": true
                }
            ]
        }
    ]
}
EOF
        )
        
        curl -X POST -H 'Content-type: application/json' \
            --data "$payload" \
            "$SLACK_WEBHOOK_URL" >/dev/null 2>&1 || true
    fi
}

# Função principal de deploy
main_deploy() {
    local start_time=$(date +%s)
    
    log "🚀 Iniciando deploy do DataClinica"
    log "Ambiente: $ENVIRONMENT"
    log "Versão: $VERSION"
    log "Dry Run: $DRY_RUN"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_warning "MODO DRY RUN - Nenhuma alteração será feita"
        return 0
    fi
    
    # Executar etapas do deploy
    local steps=(
        "validate_prerequisites"
        "load_environment_config"
        "run_tests"
        "backup_database"
        "build_images"
    )
    
    # Adicionar etapa de deploy específica do ambiente
    if [[ "$ENVIRONMENT" == "development" ]]; then
        steps+=("deploy_local")
    else
        steps+=("deploy_ecs")
    fi
    
    steps+=("health_check" "run_smoke_tests")
    
    # Executar cada etapa
    for step in "${steps[@]}"; do
        log "Executando: $step"
        
        if ! "$step"; then
            log_error "Falha na etapa: $step"
            
            if [[ "${ROLLBACK_ON_FAILURE:-false}" == "true" ]] && [[ "$FORCE_DEPLOY" != "true" ]]; then
                rollback
            fi
            
            send_notifications "failure" "Deploy falhou na etapa: $step"
            exit 1
        fi
        
        log_success "Etapa concluída: $step"
    done
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    log_success "🎉 Deploy concluído com sucesso em ${duration}s"
    send_notifications "success" "Deploy concluído com sucesso em ${duration}s"
}

# Parse dos argumentos da linha de comando
while [[ $# -gt 0 ]]; do
    case $1 in
        -v|--version)
            VERSION="$2"
            shift 2
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            set -x
            shift
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --skip-backup)
            SKIP_BACKUP=true
            shift
            ;;
        --force)
            FORCE_DEPLOY=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        development|staging|production)
            ENVIRONMENT="$1"
            shift
            ;;
        *)
            log_error "Opção desconhecida: $1"
            show_help
            exit 1
            ;;
    esac
done

# Definir valores padrão
ENVIRONMENT=${ENVIRONMENT:-$DEFAULT_ENVIRONMENT}
VERSION=${VERSION:-$DEFAULT_VERSION}

# Executar deploy
main_deploy