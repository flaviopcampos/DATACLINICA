@echo off
echo ========================================
echo    DATACLINICA - Atualizacao Segura GitHub
echo ========================================
echo.

REM Verificar se estamos em um repositorio git
if not exist ".git" (
    echo ERRO: Este diretorio nao e um repositorio Git!
    pause
    exit /b 1
)

echo [1/6] Verificando status do repositorio...
git status

echo.
echo [2/6] Adicionando arquivos essenciais (excluindo node_modules)...
git add .gitignore
git add *.md
git add *.json
git add *.js
git add *.ts
git add *.tsx
git add *.py
git add *.bat
git add *.sh
git add src/
git add api/
git add supabase/
git add frontend/src/
git add frontend/public/
git add frontend/*.json
git add frontend/*.js
git add frontend/*.ts
git add frontend/*.tsx
git add frontend/*.md
git add backend/*.py
git add backend/*.json
git add backend/*.md

echo.
echo [3/6] Verificando arquivos adicionados...
git status --porcelain

REM Verificar se ha arquivos para commit
for /f %%i in ('git status --porcelain ^| find /c /v ""') do set count=%%i
if %count%==0 (
    echo Nenhum arquivo modificado encontrado. Nada para atualizar.
    pause
    exit /b 0
)

echo.
echo [4/6] Criando commit com as atualizacoes...
set commit_message="Atualizacao sistema DataClinica (sem node_modules) - %date% %time%"
git commit -m %commit_message%
if %errorlevel% neq 0 (
    echo ERRO: Falha ao criar commit!
    pause
    exit /b 1
)

echo.
echo [5/6] Enviando atualizacoes para o GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo AVISO: Falha no push para 'main'. Tentando 'master'...
    git push origin master
    if %errorlevel% neq 0 (
        echo ERRO: Falha ao enviar para o GitHub!
        echo Verifique sua conexao e credenciais.
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo   SUCESSO! Arquivos atualizados no GitHub
echo ========================================
echo.
echo Resumo da operacao:
echo - Arquivos adicionados: %count%
echo - Commit: %commit_message%
echo - Branch: main/master
echo - Node_modules: EXC