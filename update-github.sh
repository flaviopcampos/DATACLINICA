#!/bin/bash

# Script de Atualização Completa do GitHub
# Para sistemas Unix/Linux/macOS

set -e  # Parar em caso de erro

echo "========================================"
echo "   SCRIPT DE ATUALIZAÇÃO COMPLETA DO GITHUB"
echo "========================================"
echo
echo "ATENÇÃO: Este script irá:"
echo "1. Fazer backup dos arquivos importantes"
echo "2. Remover TODOS os arquivos do repositório remoto"
echo "3. Reenviar todos os arquivos atuais"
echo "4. Fazer push forçado para o GitHub"
echo
echo "IMPORTANTE: Certifique-se de que:"
echo "- Você tem acesso de escrita ao repositório"
echo "- Todos os arquivos importantes estão salvos localmente"
echo "- Você tem certeza de que quer continuar"
echo
read -p "Deseja continuar? (s/N): " confirm
if [[ ! "$confirm" =~ ^[Ss]$ ]]; then
    echo "Operação cancelada pelo usuário."
    exit 1
fi

echo
echo "[1/8] Verificando se estamos em um repositório Git..."
if [ ! -d ".git" ]; then
    echo "ERRO: Este diretório não é um repositório Git!"
    echo "Execute 'git init' primeiro ou navegue até o diretório correto."
    exit 1
fi

echo "[2/8] Verificando status do repositório..."
if ! git status; then
    echo "ERRO: Falha ao verificar status do Git!"
    exit 1
fi

echo
echo "[3/8] Criando backup local dos arquivos importantes..."
mkdir -p backup
if [ -d "frontend" ]; then
    cp -r frontend backup/ 2>/dev/null || true
fi
if [ -d "backend" ]; then
    cp -r backend backup/ 2>/dev/null || true
fi
if [ -d "supabase" ]; then
    cp -r supabase backup/ 2>/dev/null || true
fi
cp *.md backup/ 2>/dev/null || true
cp *.json backup/ 2>/dev/null || true
cp *.js backup/ 2>/dev/null || true
cp .env* backup/ 2>/dev/null || true
echo "Backup criado na pasta 'backup'"

echo
echo "[4/8] Removendo todos os arquivos do repositório remoto..."
git rm -r --cached . || echo "AVISO: Alguns arquivos podem não estar no índice Git"

echo
echo "[5/8] Fazendo commit da remoção..."
git add -A
git commit -m "Remove all files for complete repository refresh" || echo "AVISO: Nenhuma mudança para commit ou erro no commit"

echo
echo "[6/8] Adicionando todos os arquivos atuais..."
# Primeiro, vamos garantir que o .gitignore está correto
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << EOF
node_modules/
.env
.env.local
.next/
dist/
build/
__pycache__/
*.pyc
.DS_Store
Thumbs.db
backup/
EOF
fi

if ! git add .; then
    echo "ERRO: Falha ao adicionar arquivos!"
    exit 1
fi

echo
echo "[7/8] Fazendo commit com todos os arquivos..."
if ! git commit -m "Complete repository refresh - DataClinica project ready for deployment"; then
    echo "ERRO: Falha no commit!"
    exit 1
fi

echo
echo "[8/8] Fazendo push forçado para o GitHub..."
echo "ATENÇÃO: Fazendo push forçado. Isso irá sobrescrever o histórico remoto!"
read -p "Confirma o push forçado? (s/N): " final_confirm
if [[ ! "$final_confirm" =~ ^[Ss]$ ]]; then
    echo "Push cancelado. Os commits locais foram mantidos."
    exit 1
fi

if ! git push --force-with-lease origin main; then
    echo "Tentando push forçado simples..."
    if ! git push --force origin main; then
        echo "ERRO: Falha no push! Tentando branch master..."
        if ! git push --force origin master; then
            echo "ERRO: Falha no push para ambas as branches!"
            echo "Verifique:"
            echo "- Conexão com internet"
            echo "- Permissões do repositório"
            echo "- Nome da branch correta"
            exit 1
        fi
    fi
fi

echo
echo "========================================"
echo "   ATUALIZAÇÃO CONCLUÍDA COM SUCESSO!"
echo "========================================"
echo
echo "Resumo das operações realizadas:"
echo "✓ Backup criado na pasta 'backup'"
echo "✓ Todos os arquivos removidos do repositório remoto"
echo "✓ Todos os arquivos atuais adicionados novamente"
echo "✓ Push forçado realizado com sucesso"
echo
echo "O repositório GitHub foi completamente atualizado!"
echo "Backup dos arquivos mantido em: backup/"
echo
echo "Verificando status final..."
git status
echo
echo "Últimos commits:"
git log --oneline -5
echo