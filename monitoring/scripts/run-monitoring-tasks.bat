@echo off
REM Script para automatizar tarefas de monitoramento do DataClinica
REM Uso: run-monitoring-tasks.bat [init|backup|restore|health|all]

setlocal enabledelayedexpansion

REM Definir diretório base
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

REM Verificar se Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Python não encontrado. Instale Python 3.7+ e tente novamente.
    exit /b 1
)

REM Verificar se as dependências estão instaladas
if not exist "venv" (
    echo Criando ambiente virtual Python...
    python -m venv venv
    call venv\Scripts\activate.bat
    echo Instalando dependências...
    pip install -r requirements.txt
) else (
    call venv\Scripts\activate.bat
)

REM Processar argumentos
set TASK=%1
if "%TASK%"=="" set TASK=health

echo ========================================
echo   DataClinica Monitoring Tasks
echo ========================================
echo.

if "%TASK%"=="init" goto :init
if "%TASK%"=="backup" goto :backup
if "%TASK%"=="restore" goto :restore
if "%TASK%"=="health" goto :health
if "%TASK%"=="all" goto :all

echo Uso: %0 [init^|backup^|restore^|health^|all]
echo.
echo Tarefas disponíveis:
echo   init    - Inicializar configuração do monitoramento
echo   backup  - Fazer backup do sistema de monitoramento
echo   restore - Restaurar sistema a partir de backup
echo   health  - Verificar saúde do sistema
echo   all     - Executar todas as tarefas (exceto restore)
echo.
goto :end

:init
echo [%date% %time%] Iniciando configuração do monitoramento...
python init-monitoring.py
if errorlevel 1 (
    echo ERRO: Falha na inicialização
    goto :error
)
echo [%date% %time%] Configuração concluída com sucesso!
goto :end

:backup
echo [%date% %time%] Iniciando backup do sistema...
python backup-monitoring.py
if errorlevel 1 (
    echo ERRO: Falha no backup
    goto :error
)
echo [%date% %time%] Backup concluído com sucesso!
goto :end

:restore
echo [%date% %time%] Iniciando restauração do sistema...
echo ATENÇÃO: Esta operação irá sobrescrever as configurações atuais.
set /p CONFIRM=Deseja continuar? (s/N): 
if /i not "%CONFIRM%"=="s" (
    echo Operação cancelada.
    goto :end
)
python restore-monitoring.py
if errorlevel 1 (
    echo ERRO: Falha na restauração
    goto :error
)
echo [%date% %time%] Restauração concluída com sucesso!
goto :end

:health
echo [%date% %time%] Verificando saúde do sistema...
python health-check.py
if errorlevel 1 (
    echo AVISO: Problemas detectados no sistema
    goto :warning
)
echo [%date% %time%] Sistema funcionando corretamente!
goto :end

:all
echo [%date% %time%] Executando todas as tarefas de manutenção...
echo.
echo 1/3 - Verificando saúde do sistema...
python health-check.py
echo.
echo 2/3 - Fazendo backup...
python backup-monitoring.py
echo.
echo 3/3 - Verificação final...
python health-check.py --quiet
echo.
echo [%date% %time%] Todas as tarefas concluídas!
goto :end

:error
echo.
echo ========================================
echo   ERRO: Operação falhou!
echo ========================================
echo Verifique os logs acima para mais detalhes.
exit /b 1

:warning
echo.
echo ========================================
echo   AVISO: Problemas detectados
echo ========================================
echo Verifique o relatório de saúde para mais detalhes.
exit /b 2

:end
echo.
echo ========================================
echo   Operação concluída
echo ========================================
deactivate
pause