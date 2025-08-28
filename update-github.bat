@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo    SCRIPT DE ATUALIZAÇÃO COMPLETA DO GITHUB
echo ========================================
echo.
echo ATENÇÃO: Este script irá:
echo 1. Fazer backup dos arquivos importantes
echo 2. Remover TODOS os arquivos do repositório remoto
echo 3. Reenviar todos os arquivos atuais
echo 4. Fazer push forçado para o GitHub
echo.
echo IMPORTANTE: Certifique-se de que:
echo - Você tem acesso de escrita ao repositório
echo - Todos os arquivos importantes estão salvos localmente
echo - Você tem certeza de que quer continuar
echo.
set /p confirm="Deseja continuar? (S/N): "
if /i not "%confirm%"=="S" (
    echo Operação cancelada pelo usuário.
    pause
    exit /b 1
)

echo.
echo [1/8] Verificando se estamos em um repositório Git...
if not exist ".git" (
    echo ERRO: Este diretório não é um repositório Git!
    echo Execute 'git init' primeiro ou navegue até o diretório correto.
    pause
    exit /b 1
)

echo [2/8] Verificando status do repositório...
git status
if errorlevel 1 (
    echo ERRO: Falha ao verificar status do Git!
    pause
    exit /b 1
)

echo.
echo [3/8] Criando backup local dos arquivos importantes...
if not exist "backup" mkdir backup
if exist "frontend" xcopy "frontend" "backup\frontend\" /E /I /Y >nul
if exist "backend" xcopy "backend" "backup\backend\" /E /I /Y >nul
if exist "supabase" xcopy "supabase" "backup\supabase\" /E /I /Y >nul
if exist "*.md" copy "*.md" "backup\" >nul 2>&1
if exist "*.json" copy "*.json" "backup\" >nul 2>&1
if exist "*.js" copy "*.js" "backup\" >nul 2>&1
if exist "*.env*" copy "*.env*" "backup\" >nul 2>&1
echo Backup criado na pasta 'backup'

echo.
echo [4/8] Removendo todos os arquivos do repositório remoto...
git rm -r --cached .
if errorlevel 1 (
    echo AVISO: Alguns arquivos podem não estar no índice Git
)

echo.
echo [5/8] Fazendo commit da remoção...
git add -A
git commit -m "Remove all files for complete repository refresh"
if errorlevel 1 (
    echo AVISO: Nenhuma mudança para commit ou erro no commit
)

echo.
echo [6/8] Adicionando todos os arquivos atuais...
:: Primeiro, vamos garantir que o .gitignore está correto
if not exist ".gitignore" (
    echo node_modules/ > .gitignore
    echo .env >> .gitignore
    echo .env.local >> .gitignore
    echo .next/ >> .gitignore
    echo dist/ >> .gitignore
    echo build/ >> .gitignore
    echo __pycache__/ >> .gitignore
    echo *.pyc >> .gitignore
    echo .DS_Store >> .gitignore
    echo Thumbs.db >> .gitignore
    echo backup/ >> .gitignore
)

git add .
if errorlevel 1 (
    echo ERRO: Falha ao adicionar arquivos!
    pause
    exit /b 1
)

echo.
echo [7/8] Fazendo commit com todos os arquivos...
git commit -m "Complete repository refresh - DataClinica project ready for deployment"
if errorlevel 1 (
    echo ERRO: Falha no commit!
    pause
    exit /b 1
)

echo.
echo [8/8] Fazendo push forçado para o GitHub...
echo ATENÇÃO: Fazendo push forçado. Isso irá sobrescrever o histórico remoto!
set /p final_confirm="Confirma o push forçado? (S/N): "
if /i not "%final_confirm%"=="S" (
    echo Push cancelado. Os commits locais foram mantidos.
    pause
    exit /b 1
)

git push --force-with-lease origin main
if errorlevel 1 (
    echo Tentando push forçado simples...
    git push --force origin main
    if errorlevel 1 (
        echo ERRO: Falha no push! Verifique:
        echo - Conexão com internet
        echo - Permissões do repositório
        echo - Nome da branch (pode ser 'master' ao invés de 'main')
        echo.
        echo Tentando push para branch master...
        git push --force origin master
        if errorlevel 1 (
            echo ERRO: Falha no push para ambas as branches!
            pause
            exit /b 1
        )
    )
)

echo.
echo ========================================
echo    ATUALIZAÇÃO CONCLUÍDA COM SUCESSO!
echo ========================================
echo.
echo Resumo das operações realizadas:
echo ✓ Backup criado na pasta 'backup'
echo ✓ Todos os arquivos removidos do repositório remoto
echo ✓ Todos os arquivos atuais adicionados novamente
echo ✓ Push forçado realizado com sucesso
echo.
echo O repositório GitHub foi completamente atualizado!
echo Backup dos arquivos mantido em: backup/
echo.
echo Verificando status final...
git status
echo.
echo Últimos commits:
git log --oneline -5
echo.
pause