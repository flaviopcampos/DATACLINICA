#!/bin/bash

echo "========================================"
echo "    DATACLINICA - Atualizacao GitHub"
echo "========================================"
echo

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se estamos em um repositorio git
if [ ! -d ".git" ]; then
    echo -e "${RED}ERRO: Este diretorio nao e um repositorio Git!${NC}"
    echo "Execute 'git init' primeiro ou navegue para o diretorio correto."
    exit 1
fi

echo "[1/5] Verificando status do repositorio..."
git status
if [ $? -ne 0 ]; then
    echo -e "${RED}ERRO: Falha ao verificar status do Git!${NC}"
    exit 1
fi

echo
echo "[2/5] Adicionando todos os arquivos modificados e novos..."
git add .
if [ $? -ne 0 ]; then
    echo -e "${RED}ERRO: Falha ao adicionar arquivos!${NC}"
    exit 1
fi

echo
echo "[3/5] Verificando arquivos adicionados..."
git status --porcelain
if [ $? -ne 0 ]; then
    echo -e "${RED}ERRO: Falha ao verificar arquivos adicionados!${NC}"
    exit 1
fi

# Verificar se ha arquivos para commit
count=$(git status --porcelain | wc -l)
if [ $count -eq 0 ]; then
    echo -e "${YELLOW}Nenhum arquivo modificado encontrado. Nada para atualizar.${NC}"
    exit 0
fi

echo
echo "[4/5] Criando commit com as atualizacoes..."
commit_message="Atualizacao completa do sistema DataClinica - $(date '+%Y-%m-%d %H:%M:%S')"
git commit -m "$commit_message"
if [ $? -ne 0 ]; then
    echo -e "${RED}ERRO: Falha ao criar commit!${NC}"
    exit 1
fi

echo
echo "[5/5] Enviando atualizacoes para o GitHub..."
git push origin main
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}AVISO: Falha no push para 'main'. Tentando 'master'...${NC}"
    git push origin master
    if [ $? -ne 0 ]; then
        echo -e "${RED}ERRO: Falha ao enviar para o GitHub!${NC}"
        echo "Verifique sua conexao e credenciais."
        exit 1
    fi
fi

echo
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   SUCESSO! Arquivos atualizados no GitHub${NC}"
echo -e "${GREEN}========================================${NC}"
echo
echo "Resumo da operacao:"
echo "- Arquivos adicionados: $count"
echo "- Commit: $commit_message"
echo "- Branch: main/master"
echo