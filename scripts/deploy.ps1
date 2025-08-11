<#
.SYNOPSIS
    Script de Deploy Automatizado - DataClinica
    Suporte para ambientes: development, staging, production

.DESCRIPTION
    Este script automatiza o processo de deploy do DataClinica para diferentes ambientes,
    incluindo testes, build de imagens Docker, backup de banco de dados e deploy.

.PARAMETER Environment
    Ambiente de destino: development, staging, production

.PARAMETER Version
    Versão a ser deployada (default: latest)

.PARAMETER DryRun
    Simular deploy sem executar alterações

.PARAMETER SkipTests
    Pular execução de testes

.PARAMETER SkipBackup
    Pular backup do banco de dados

.PARAMETER Force
    Forçar deploy mesmo com falhas

.PARAMETER Verbose
    Output detalhado

.EXAMPLE
    .\deploy.ps1 -Environment staging
    Deploy para staging com versão latest

.EXAMPLE
    .\deploy.ps1 -Environment production -Version "v1.2.3"
    Deploy para produção com versão específica

.EXAMPLE
    .\deploy.ps1 -Environment staging -DryRun
    Simular deploy para staging
#>

[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [ValidateSet("development", "staging", "production")]
    [string]$Environment = "staging",
    
    [Parameter()]
    [string]$Version = "latest",
    
    [Parameter()]
    [switch]$DryRun,
    
    [Parameter()]
    [switch]$SkipTests,
    
    [Parameter()]
    [switch]$SkipBackup,
    
    [Parameter()]
    [switch]$Force,
    
    [Parameter()]
    [switch]$Help
)

# Configurações globais
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Diretórios
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$LogFile = Join-Path $ProjectRoot "logs\deploy-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"

# Cores para output
$Colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Blue"
    Cyan = "Cyan"
    White = "White"
}

# Função para logging
function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "INFO",
        [string]$Color = "White"
    )
    
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogMessage = "[$Timestamp] [$Level] $Message"
    
    # Escrever no console com cor
    Write-Host $LogMessage -ForegroundColor $Color
    
    # Escrever no arquivo de log
    if (!(Test-Path (Split-Path $LogFile))) {
        New-Item -ItemType Directory -Path (Split-Path $LogFile) -Force | Out-Null
    }
    Add-Content -Path $LogFile -Value $LogMessage
}

function Write-LogSuccess {
    param([string]$Message)
    Write-Log "✅ $Message" "SUCCESS" $Colors.Green
}

function Write-LogWarning {
    param([string]$Message)
    Write-Log "⚠️ $Message" "WARNING" $Colors.Yellow
}

function Write-LogError {
    param([string]$Message)
    Write-Log "❌ $Message" "ERROR" $Colors.Red
}

function Write-LogInfo {
    param([string]$Message)
    Write-Log "ℹ️ $Message" "INFO" $Colors.Blue
}

# Função para mostrar ajuda
function Show-Help {
    Write-Host @"
Script de Deploy Automatizado - DataClinica

USO:
    .\deploy.ps1 [OPÇÕES] [AMBIENTE]

AMBIENTES:
    development     Deploy local para desenvolvimento
    staging         Deploy para ambiente de staging
    production      Deploy para ambiente de produção

OPÇÕES:
    -Version VERSION        Versão a ser deployada (default: latest)
    -DryRun                Simular deploy sem executar
    -SkipTests             Pular execução de testes
    -SkipBackup            Pular backup do banco (produção)
    -Force                 Forçar deploy mesmo com falhas
    -Verbose               Output detalhado
    -Help                  Mostrar esta ajuda

EXEMPLOS:
    .\deploy.ps1 staging                          # Deploy staging com versão latest
    .\deploy.ps1 production -Version v1.2.3      # Deploy produção com versão específica
    .\deploy.ps1 staging -DryRun                 # Simular deploy staging
    .\deploy.ps1 production -SkipBackup -Force   # Deploy produção sem backup

VARIÁVEIS DE AMBIENTE:
    AWS_PROFILE                 Perfil AWS a ser usado
    DOCKER_REGISTRY            Registry Docker (default: dataclinica)
    SLACK_WEBHOOK_URL           URL do webhook Slack para notificações
    DB_BACKUP_S3_BUCKET         Bucket S3 para backups
    ROLLBACK_ON_FAILURE         Rollback automático em caso de falha (true/false)

"@ -ForegroundColor $Colors.Cyan
}

# Função para validar pré-requisitos
function Test-Prerequisites {
    Write-LogInfo "Validando pré-requisitos..."
    
    $MissingTools = @()
    
    # Verificar ferramentas necessárias
    $RequiredTools = @("docker", "docker-compose", "aws", "make")
    
    foreach ($Tool in $RequiredTools) {
        if (!(Get-Command $Tool -ErrorAction SilentlyContinue)) {
            $MissingTools += $Tool
        }
    }
    
    if ($MissingTools.Count -gt 0) {
        Write-LogError "Ferramentas necessárias não encontradas: $($MissingTools -join ', ')"
        Write-LogError "Instale as ferramentas necessárias e tente novamente."
        throw "Pré-requisitos não atendidos"
    }
    
    # Verificar credenciais AWS (exceto para development)
    if ($Environment -ne "development") {
        try {
            aws sts get-caller-identity --output json | Out-Null
        }
        catch {
            Write-LogError "Credenciais AWS não configuradas ou inválidas"
            Write-LogError "Configure as credenciais AWS e tente novamente."
            throw "Credenciais AWS inválidas"
        }
    }
    
    # Verificar se está no diretório correto
    if (!(Test-Path (Join-Path $ProjectRoot "docker-compose.yml"))) {
        Write-LogError "Arquivo docker-compose.yml não encontrado em $ProjectRoot"
        throw "Diretório de projeto inválido"
    }
    
    Write-LogSuccess "Pré-requisitos validados"
}

# Função para carregar configurações do ambiente
function Initialize-EnvironmentConfig {
    Write-LogInfo "Carregando configurações para ambiente: $Environment"
    
    # Arquivo de configuração do ambiente
    $EnvFile = Join-Path $ProjectRoot ".env.$Environment"
    
    if (Test-Path $EnvFile) {
        Get-Content $EnvFile | ForEach-Object {
            if ($_ -match '^([^=]+)=(.*)$') {
                [Environment]::SetEnvironmentVariable($Matches[1], $Matches[2], "Process")
            }
        }
        Write-LogSuccess "Configurações carregadas de $EnvFile"
    }
    else {
        Write-LogWarning "Arquivo de configuração $EnvFile não encontrado"
    }
    
    # Configurações específicas por ambiente
    switch ($Environment) {
        "development" {
            $script:DockerRegistry = $env:DOCKER_REGISTRY ?? "dataclinica"
            $script:ComposeFile = "docker-compose.yml;docker-compose.dev.yml"
            $script:HealthCheckUrl = "http://localhost:8000/health"
        }
        "staging" {
            $script:DockerRegistry = $env:DOCKER_REGISTRY ?? "dataclinica"
            $script:ComposeFile = "docker-compose.yml;docker-compose.staging.yml"
            $script:HealthCheckUrl = "https://staging.dataclinica.com.br/health"
            $script:EcsCluster = "dataclinica-staging"
            $script:EcsService = "dataclinica-staging-service"
        }
        "production" {
            $script:DockerRegistry = $env:DOCKER_REGISTRY ?? "dataclinica"
            $script:ComposeFile = "docker-compose.yml;docker-compose.prod.yml"
            $script:HealthCheckUrl = "https://dataclinica.com.br/health"
            $script:EcsCluster = "dataclinica-production"
            $script:EcsService = "dataclinica-production-service"
        }
    }
    
    # Definir variáveis de ambiente
    $env:DOCKER_REGISTRY = $script:DockerRegistry
    $env:COMPOSE_FILE = $script:ComposeFile
}

# Função para executar testes
function Invoke-Tests {
    if ($SkipTests) {
        Write-LogWarning "Pulando execução de testes"
        return
    }
    
    Write-LogInfo "Executando testes..."
    
    Push-Location $ProjectRoot
    try {
        # Testes do backend
        Write-LogInfo "Executando testes do backend..."
        & make test-backend
        if ($LASTEXITCODE -ne 0) {
            throw "Testes do backend falharam"
        }
        
        # Testes do frontend
        Write-LogInfo "Executando testes do frontend..."
        & make test-frontend
        if ($LASTEXITCODE -ne 0) {
            throw "Testes do frontend falharam"
        }
        
        # Testes de integração (apenas para staging/production)
        if ($Environment -ne "development") {
            Write-LogInfo "Executando testes de integração..."
            & make test-e2e
            if ($LASTEXITCODE -ne 0) {
                throw "Testes de integração falharam"
            }
        }
        
        Write-LogSuccess "Todos os testes passaram"
    }
    finally {
        Pop-Location
    }
}

# Função para fazer backup do banco de dados
function Backup-Database {
    if ($SkipBackup -or $Environment -eq "development") {
        Write-LogWarning "Pulando backup do banco de dados"
        return
    }
    
    Write-LogInfo "Fazendo backup do banco de dados..."
    
    $BackupTimestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $BackupFile = "dataclinica_backup_${Environment}_${BackupTimestamp}.sql"
    $S3Bucket = $env:DB_BACKUP_S3_BUCKET ?? "dataclinica-backups"
    
    Push-Location $ProjectRoot
    try {
        # Fazer backup usando make
        $env:BACKUP_FILE = $BackupFile
        & make backup
        if ($LASTEXITCODE -ne 0) {
            throw "Falha ao fazer backup do banco de dados"
        }
        
        # Upload para S3
        if (Get-Command aws -ErrorAction SilentlyContinue) {
            Write-LogInfo "Enviando backup para S3..."
            & aws s3 cp $BackupFile "s3://$S3Bucket/database/$Environment/"
            if ($LASTEXITCODE -eq 0) {
                Write-LogSuccess "Backup enviado para S3: s3://$S3Bucket/database/$Environment/$BackupFile"
                Remove-Item $BackupFile -Force
            }
            else {
                Write-LogWarning "Falha ao enviar backup para S3, mantendo arquivo local: $BackupFile"
            }
        }
        
        Write-LogSuccess "Backup do banco de dados concluído"
    }
    finally {
        Pop-Location
    }
}

# Função para build das imagens Docker
function Build-DockerImages {
    Write-LogInfo "Fazendo build das imagens Docker..."
    
    Push-Location $ProjectRoot
    try {
        # Definir tags
        $BackendTag = "$script:DockerRegistry/dataclinica-backend:$Version"
        $FrontendTag = "$script:DockerRegistry/dataclinica-frontend:$Version"
        
        # Build do backend
        Write-LogInfo "Build da imagem do backend: $BackendTag"
        & docker build -t $BackendTag -f backend/Dockerfile backend/
        if ($LASTEXITCODE -ne 0) {
            throw "Falha no build da imagem do backend"
        }
        
        # Build do frontend
        Write-LogInfo "Build da imagem do frontend: $FrontendTag"
        & docker build -t $FrontendTag -f frontend/Dockerfile.prod frontend/
        if ($LASTEXITCODE -ne 0) {
            throw "Falha no build da imagem do frontend"
        }
        
        # Push das imagens (apenas para staging/production)
        if ($Environment -ne "development") {
            Write-LogInfo "Fazendo push das imagens..."
            
            & docker push $BackendTag
            if ($LASTEXITCODE -ne 0) {
                throw "Falha no push da imagem do backend"
            }
            
            & docker push $FrontendTag
            if ($LASTEXITCODE -ne 0) {
                throw "Falha no push da imagem do frontend"
            }
        }
        
        Write-LogSuccess "Build das imagens concluído"
    }
    finally {
        Pop-Location
    }
}

# Função para deploy local (development)
function Deploy-Local {
    Write-LogInfo "Iniciando deploy local..."
    
    Push-Location $ProjectRoot
    try {
        # Parar containers existentes
        & docker-compose down
        
        # Iniciar containers
        & docker-compose up -d
        if ($LASTEXITCODE -ne 0) {
            throw "Falha ao iniciar containers"
        }
        
        # Aguardar serviços ficarem prontos
        Write-LogInfo "Aguardando serviços ficarem prontos..."
        Start-Sleep -Seconds 30
        
        # Executar migrações
        & make migrate
        if ($LASTEXITCODE -ne 0) {
            throw "Falha ao executar migrações"
        }
        
        Write-LogSuccess "Deploy local concluído"
    }
    finally {
        Pop-Location
    }
}

# Função para deploy no ECS (staging/production)
function Deploy-ECS {
    Write-LogInfo "Iniciando deploy no ECS..."
    
    # Atualizar serviço ECS
    Write-LogInfo "Atualizando serviço ECS: $script:EcsService no cluster: $script:EcsCluster"
    
    $UpdateResult = & aws ecs update-service `
        --cluster $script:EcsCluster `
        --service $script:EcsService `
        --force-new-deployment `
        --query 'service.serviceName' `
        --output text
    
    if ($LASTEXITCODE -ne 0) {
        throw "Falha ao atualizar serviço ECS"
    }
    
    # Aguardar deploy estabilizar
    Write-LogInfo "Aguardando deploy estabilizar..."
    
    & aws ecs wait services-stable `
        --cluster $script:EcsCluster `
        --services $script:EcsService
    
    if ($LASTEXITCODE -ne 0) {
        throw "Deploy não estabilizou no tempo esperado"
    }
    
    Write-LogSuccess "Deploy no ECS concluído"
}

# Função para executar health check
function Test-HealthCheck {
    Write-LogInfo "Executando health check..."
    
    $MaxAttempts = 30
    $Attempt = 1
    
    while ($Attempt -le $MaxAttempts) {
        Write-LogInfo "Tentativa $Attempt/$MaxAttempts`: $script:HealthCheckUrl"
        
        try {
            $Response = Invoke-WebRequest -Uri $script:HealthCheckUrl -TimeoutSec 10 -UseBasicParsing
            if ($Response.StatusCode -eq 200) {
                Write-LogSuccess "Health check passou"
                return
            }
        }
        catch {
            # Continuar tentando
        }
        
        Start-Sleep -Seconds 10
        $Attempt++
    }
    
    throw "Health check falhou após $MaxAttempts tentativas"
}

# Função para executar smoke tests
function Invoke-SmokeTests {
    Write-LogInfo "Executando smoke tests..."
    
    Push-Location $ProjectRoot
    try {
        # Configurar URL do ambiente
        $env:TARGET_URL = $script:HealthCheckUrl
        
        # Executar smoke tests
        if (Get-Command artillery -ErrorAction SilentlyContinue) {
            & artillery run tests/smoke/smoke-tests.yml
            if ($LASTEXITCODE -ne 0) {
                throw "Smoke tests falharam"
            }
        }
        else {
            Write-LogWarning "Artillery não encontrado, pulando smoke tests"
        }
        
        Write-LogSuccess "Smoke tests concluídos"
    }
    finally {
        Pop-Location
    }
}

# Função para rollback
function Invoke-Rollback {
    Write-LogWarning "Iniciando rollback..."
    
    if ($Environment -eq "development") {
        Write-LogInfo "Restaurando containers anteriores..."
        Push-Location $ProjectRoot
        try {
            & docker-compose down
            # Aqui você poderia restaurar uma versão anterior
            Write-LogWarning "Rollback local não implementado completamente"
        }
        finally {
            Pop-Location
        }
    }
    else {
        Write-LogInfo "Fazendo rollback do serviço ECS..."
        # Aqui você implementaria a lógica de rollback do ECS
        Write-LogWarning "Rollback ECS não implementado completamente"
    }
}

# Função para enviar notificações
function Send-Notifications {
    param(
        [string]$Status,
        [string]$Message
    )
    
    # Notificação Slack
    if ($env:SLACK_WEBHOOK_URL) {
        $Color = "good"
        $Emoji = "✅"
        
        switch ($Status) {
            "failure" {
                $Color = "danger"
                $Emoji = "❌"
            }
            "warning" {
                $Color = "warning"
                $Emoji = "⚠️"
            }
        }
        
        $Payload = @{
            attachments = @(
                @{
                    color = $Color
                    title = "$Emoji Deploy DataClinica - $Environment"
                    text = $Message
                    fields = @(
                        @{
                            title = "Ambiente"
                            value = $Environment
                            short = $true
                        },
                        @{
                            title = "Versão"
                            value = $Version
                            short = $true
                        },
                        @{
                            title = "Usuário"
                            value = $env:USERNAME
                            short = $true
                        },
                        @{
                            title = "Timestamp"
                            value = (Get-Date).ToString()
                            short = $true
                        }
                    )
                }
            )
        } | ConvertTo-Json -Depth 10
        
        try {
            Invoke-RestMethod -Uri $env:SLACK_WEBHOOK_URL -Method Post -Body $Payload -ContentType "application/json" | Out-Null
        }
        catch {
            Write-LogWarning "Falha ao enviar notificação Slack: $($_.Exception.Message)"
        }
    }
}

# Função principal de deploy
function Start-Deploy {
    $StartTime = Get-Date
    
    Write-LogInfo "🚀 Iniciando deploy do DataClinica"
    Write-LogInfo "Ambiente: $Environment"
    Write-LogInfo "Versão: $Version"
    Write-LogInfo "Dry Run: $DryRun"
    Write-LogInfo "Log File: $LogFile"
    
    if ($DryRun) {
        Write-LogWarning "MODO DRY RUN - Nenhuma alteração será feita"
        return
    }
    
    # Definir etapas do deploy
    $Steps = @(
        @{ Name = "Test-Prerequisites"; Function = { Test-Prerequisites } },
        @{ Name = "Initialize-EnvironmentConfig"; Function = { Initialize-EnvironmentConfig } },
        @{ Name = "Invoke-Tests"; Function = { Invoke-Tests } },
        @{ Name = "Backup-Database"; Function = { Backup-Database } },
        @{ Name = "Build-DockerImages"; Function = { Build-DockerImages } }
    )
    
    # Adicionar etapa de deploy específica do ambiente
    if ($Environment -eq "development") {
        $Steps += @{ Name = "Deploy-Local"; Function = { Deploy-Local } }
    }
    else {
        $Steps += @{ Name = "Deploy-ECS"; Function = { Deploy-ECS } }
    }
    
    $Steps += @(
        @{ Name = "Test-HealthCheck"; Function = { Test-HealthCheck } },
        @{ Name = "Invoke-SmokeTests"; Function = { Invoke-SmokeTests } }
    )
    
    # Executar cada etapa
    foreach ($Step in $Steps) {
        Write-LogInfo "Executando: $($Step.Name)"
        
        try {
            & $Step.Function
            Write-LogSuccess "Etapa concluída: $($Step.Name)"
        }
        catch {
            Write-LogError "Falha na etapa: $($Step.Name) - $($_.Exception.Message)"
            
            if (($env:ROLLBACK_ON_FAILURE -eq "true") -and (-not $Force)) {
                Invoke-Rollback
            }
            
            Send-Notifications "failure" "Deploy falhou na etapa: $($Step.Name)"
            throw
        }
    }
    
    $EndTime = Get-Date
    $Duration = ($EndTime - $StartTime).TotalSeconds
    
    Write-LogSuccess "🎉 Deploy concluído com sucesso em $([math]::Round($Duration, 2))s"
    Send-Notifications "success" "Deploy concluído com sucesso em $([math]::Round($Duration, 2))s"
}

# Função principal
function Main {
    try {
        if ($Help) {
            Show-Help
            return
        }
        
        Start-Deploy
    }
    catch {
        Write-LogError "Deploy falhou: $($_.Exception.Message)"
        Write-LogError "Verifique o log em: $LogFile"
        exit 1
    }
}

# Executar função principal
Main