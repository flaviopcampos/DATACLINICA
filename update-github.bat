@echo off
echo ========================================
echo    DATACLINICA - Atualizacao GitHub
echo ========================================
echo.

REM Verificar se estamos em um repositorio git
if not exist ".git" (
    echo ERRO: Este diretorio nao e um repositorio Git!
    echo Execute 'git init' primeiro ou navegue para o diretorio correto.
    pause
    exit /b 1
)

echo [1/5] Verificando status do repositorio...
git status
if %errorlevel% neq 0 (
    echo ERRO: Falha ao verificar status do Git!
    pause
    exit /b 1
)

echo.
echo [2/5] Adicionando todos os arquivos modificados e novos...
git add .
if %errorlevel% neq 0 (
    echo ERRO: Falha ao adicionar arquivos!
    pause
    exit /b 1
)

echo.
echo [3/5] Verificando arquivos adicionados...
git status --porcelain
if %errorlevel% neq 0 (
    echo ERRO: Falha ao verificar arquivos adicionados!
    pause
    exit /b 1
)

REM Verificar se ha arquivos para commit
for /f %%i in ('git status --porcelain ^| find /c /v ""') do set count=%%i
if %count%==0 (
    echo Nenhum arquivo modificado encontrado. Nada para atualizar.
    pause
    exit /b 0
)

echo.
echo [4/5] Criando commit com as atualizacoes...
set commit_message="Atualizacao completa do sistema DataClinica - %date% %time%"
git commit -m %commit_message%
if %errorlevel% neq 0 (
    echo ERRO: Falha ao criar commit!
    pause
    exit /b 1
)

echo.
echo [5/5] Enviando atualizacoes para o GitHub...
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
echo.
pause