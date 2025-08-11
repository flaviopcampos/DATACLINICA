#!/bin/bash
# Script para automatizar tarefas de monitoramento do DataClinica
# Uso: ./run-monitoring-tasks.sh [init|backup|restore|health|all]

set -e

# Definir diretório base
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções de log
log_info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

log_success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] SUCCESS: $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

# Verificar se Python está instalado
if ! command -v python3 &> /dev/null; then
    log_error "Python 3 não encontrado. Instale Python 3.7+ e tente novamente."
    exit 1
fi

# Configurar ambiente virtual
if [ ! -d "venv" ]; then
    log_info "Criando ambiente virtual Python..."
    python3 -m venv venv
    source venv/bin/activate
    log_info "Instalando dependências..."
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# Processar argumentos
TASK=${1:-health}

echo "========================================"
echo "   DataClinica Monitoring Tasks"
echo "========================================"
echo

case "$TASK" in
    "init")
        log_info "Iniciando configuração do monitoramento..."
        if python3 init-monitoring.py; then
            log_success "Configuração concluída com sucesso!"
        else
            log_error "Falha na inicialização"
            exit 1
        fi
        ;;
    
    "backup")
        log_info "Iniciando backup do sistema..."
        if python3 backup-monitoring.py; then
            log_success "Backup concluído com sucesso!"
        else
            log_error "Falha no backup"
            exit 1
        fi
        ;;
    
    "restore")
        log_info "Iniciando restauração do sistema..."
        echo -e "${YELLOW}ATENÇÃO: Esta operação irá sobrescrever as configurações atuais.${NC}"
        read -p "Deseja continuar? (s/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Ss]$ ]]; then
            log_info "Operação cancelada."
            exit 0
        fi
        
        if python3 restore-monitoring.py; then
            log_success "Restauração concluída com sucesso!"
        else
            log_error "Falha na restauração"
            exit 1
        fi
        ;;
    
    "health")
        log_info "Verificando saúde do sistema..."
        if python3 health-check.py; then
            log_success "Sistema funcionando corretamente!"
        else
            log_warning "Problemas detectados no sistema"
            exit 2
        fi
        ;;
    
    "all")
        log_info "Executando todas as tarefas de manutenção..."
        echo
        
        log_info "1/3 - Verificando saúde do sistema..."
        python3 health-check.py
        echo
        
        log_info "2/3 - Fazendo backup..."
        python3 backup-monitoring.py
        echo
        
        log_info "3/3 - Verificação final..."
        python3 health-check.py --quiet
        echo
        
        log_success "Todas as tarefas concluídas!"
        ;;
    
    *)
        echo "Uso: $0 [init|backup|restore|health|all]"
        echo
        echo "Tarefas disponíveis:"
        echo "  init    - Inicializar configuração do monitoramento"
        echo "  backup  - Fazer backup do sistema de monitoramento"
        echo "  restore - Restaurar sistema a partir de backup"
        echo "  health  - Verificar saúde do sistema"
        echo "  all     - Executar todas as tarefas (exceto restore)"
        echo
        exit 1
        ;;
esac

echo
echo "========================================"
echo "   Operação concluída"
echo "========================================"

deactivate