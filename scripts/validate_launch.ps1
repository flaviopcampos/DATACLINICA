<#
.SYNOPSIS
    Script de Validacao Final para Lancamento - DataClinica
    Executa todas as verificacoes necessarias antes do deploy em producao

.DESCRIPTION
    Este script executa uma bateria completa de testes e validacoes para
    garantir que o sistema esta pronto para lancamento em producao.

.PARAMETER Environment
    Ambiente a ser validado: development, staging, production

.PARAMETER SkipInfrastructure
    Pular validacao de infraestrutura

.PARAMETER SkipSecurity
    Pular validacao de seguranca

.EXAMPLE
    .\validate_launch.ps1 -Environment staging
    Validar ambiente de staging

.EXAMPLE
    .\validate_launch.ps1 -Environment production
    Validar producao
#>

[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [ValidateSet("development", "staging", "production")]
    [string]$Environment = "staging",
    
    [Parameter()]
    [switch]$SkipInfrastructure,
    
    [Parameter()]
    [switch]$SkipSecurity
)

# Configuracoes
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Cores para output
$Colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Blue"
    Cyan = "Cyan"
    White = "White"
}

# Contadores
$TestsPassed = 0
$TestsFailed = 0
$TestsSkipped = 0

# Funcao para logging
function Write-TestResult {
    param(
        [string]$TestName,
        [bool]$Passed,
        [string]$Message = "",
        [bool]$Skipped = $false
    )
    
    if ($Skipped) {
        Write-Host "[SKIP] $TestName" -ForegroundColor $Colors.Yellow
        if ($Message) { Write-Host "    $Message" -ForegroundColor $Colors.Yellow }
        $script:TestsSkipped++
    }
    elseif ($Passed) {
        Write-Host "[PASS] $TestName" -ForegroundColor $Colors.Green
        if ($Message) { Write-Host "    $Message" -ForegroundColor $Colors.Green }
        $script:TestsPassed++
    }
    else {
        Write-Host "[FAIL] $TestName" -ForegroundColor $Colors.Red
        if ($Message) { Write-Host "    $Message" -ForegroundColor $Colors.Red }
        $script:TestsFailed++
    }
}

function Write-Section {
    param([string]$Title)
    Write-Host "`n--- $Title ---" -ForegroundColor $Colors.Cyan
}

# Funcao para testar conectividade
function Test-Connectivity {
    param([string]$Url, [int]$TimeoutSeconds = 10)
    
    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec $TimeoutSeconds -UseBasicParsing
        return $response.StatusCode -eq 200
    }
    catch {
        return $false
    }
}

# Funcao para testar Docker
function Test-DockerService {
    param([string]$ServiceName)
    
    try {
        $result = docker ps --filter "name=$ServiceName" --format "{{.Status}}"
        return $result -like "*Up*"
    }
    catch {
        return $false
    }
}

# Inicio da validacao
Write-Host "DataClinica - Validacao de Lancamento" -ForegroundColor $Colors.Cyan
Write-Host "Ambiente: $Environment" -ForegroundColor $Colors.Blue
Write-Host "Data: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" -ForegroundColor $Colors.Blue
Write-Host ""

# 1. Validacao de Infraestrutura
Write-Section "Infraestrutura"

if (-not $SkipInfrastructure) {
    # Docker
    try {
        docker --version | Out-Null
        Write-TestResult "Docker instalado" $true "$(docker --version)"
    }
    catch {
        Write-TestResult "Docker instalado" $false "Docker nao encontrado"
    }
    
    # Docker Compose
    try {
        docker-compose --version | Out-Null
        Write-TestResult "Docker Compose instalado" $true "$(docker-compose --version)"
    }
    catch {
        Write-TestResult "Docker Compose instalado" $false "Docker Compose nao encontrado"
    }
    
    # PostgreSQL Container
    $postgresRunning = Test-DockerService "dataclinica_postgres"
    Write-TestResult "PostgreSQL Container" $postgresRunning $(if ($postgresRunning) { "Rodando e saudavel" } else { "Nao encontrado ou parado" })
    
    # Redis Container
    $redisRunning = Test-DockerService "dataclinica_redis"
    Write-TestResult "Redis Container" $redisRunning $(if ($redisRunning) { "Rodando e saudavel" } else { "Nao encontrado ou parado" })
    
    # Verificar arquivos de configuracao
    $envExists = Test-Path ".env"
    Write-TestResult "Arquivo .env" $envExists $(if ($envExists) { "Configurado" } else { "Nao encontrado" })
    
    $dockerComposeExists = Test-Path "docker-compose.yml"
    Write-TestResult "Docker Compose Config" $dockerComposeExists $(if ($dockerComposeExists) { "Encontrado" } else { "Nao encontrado" })
    
    $dockerComposeProdExists = Test-Path "docker-compose.prod.yml"
    Write-TestResult "Docker Compose Producao" $dockerComposeProdExists $(if ($dockerComposeProdExists) { "Configurado" } else { "Nao encontrado" })
}
else {
    Write-TestResult "Validacao de Infraestrutura" $false "" $true
}

# 2. Validacao de APIs
Write-Section "APIs e Conectividade"

# URLs baseadas no ambiente
$BaseUrls = @{
    "development" = "http://localhost:8000"
    "staging" = "https://staging.dataclinica.com.br"
    "production" = "https://dataclinica.com.br"
}

$BaseUrl = $BaseUrls[$Environment]

# Health Check
$healthUrl = "$BaseUrl/health"
$healthOk = Test-Connectivity $healthUrl
Write-TestResult "Health Check" $healthOk $(if ($healthOk) { "$healthUrl respondendo" } else { "$healthUrl nao responde" })

# API Health
$apiHealthUrl = "$BaseUrl/api/health"
$apiHealthOk = Test-Connectivity $apiHealthUrl
Write-TestResult "API Health Check" $apiHealthOk $(if ($apiHealthOk) { "$apiHealthUrl respondendo" } else { "$apiHealthUrl nao responde" })

# Frontend (se nao for apenas API)
if ($Environment -eq "development") {
    $frontendUrl = "http://localhost:3000"
    $frontendOk = Test-Connectivity $frontendUrl
    Write-TestResult "Frontend" $frontendOk $(if ($frontendOk) { "$frontendUrl respondendo" } else { "$frontendUrl nao responde" })
}

# 3. Validacao de Seguranca
Write-Section "Seguranca"

if (-not $SkipSecurity) {
    # HTTPS (para staging e producao)
    if ($Environment -ne "development") {
        $httpsUrl = $BaseUrl.Replace("http://", "https://")
        $httpsOk = Test-Connectivity $httpsUrl
        Write-TestResult "HTTPS Habilitado" $httpsOk $(if ($httpsOk) { "SSL/TLS funcionando" } else { "HTTPS nao disponivel" })
    }
    
    # Verificar se variaveis sensiveis nao estao com valores padrao
    if (Test-Path ".env") {
        $envContent = Get-Content ".env" -Raw
        
        $secretKeyDefault = $envContent -match "SECRET_KEY=dev-secret-key"
        Write-TestResult "Secret Key Segura" (-not $secretKeyDefault) $(if ($secretKeyDefault) { "Usando chave padrao (INSEGURO)" } else { "Chave personalizada" })
        
        $jwtKeyDefault = $envContent -match "JWT_SECRET_KEY=dev-jwt-secret"
        Write-TestResult "JWT Key Segura" (-not $jwtKeyDefault) $(if ($jwtKeyDefault) { "Usando chave padrao (INSEGURO)" } else { "Chave personalizada" })
    }
    
    # Verificar configuracoes de producao
    if ($Environment -eq "production") {
        if (Test-Path ".env") {
            $envContent = Get-Content ".env" -Raw
            
            $debugDisabled = $envContent -match "DEBUG=false"
            Write-TestResult "Debug Desabilitado" $debugDisabled $(if ($debugDisabled) { "Debug desabilitado" } else { "Debug ainda habilitado (INSEGURO)" })
            
            $corsRestricted = $envContent -notmatch "CORS_ORIGINS=.*localhost"
            Write-TestResult "CORS Restrito" $corsRestricted $(if ($corsRestricted) { "CORS configurado para producao" } else { "CORS permite localhost (INSEGURO)" })
        }
    }
}
else {
    Write-TestResult "Validacao de Seguranca" $false "" $true
}

# 4. Validacao de Banco de Dados
Write-Section "Banco de Dados"

# Testar conexao com PostgreSQL (se container estiver rodando)
if (Test-DockerService "dataclinica_postgres") {
    try {
        # Testar conexao basica
        $pgTest = docker exec dataclinica_postgres pg_isready -U dataclinica_user -d dataclinica
        $pgOk = $LASTEXITCODE -eq 0
        Write-TestResult "Conexao PostgreSQL" $pgOk $(if ($pgOk) { "Banco acessivel" } else { "Erro de conexao" })
        
        # Verificar se ha tabelas (migracoes executadas)
        if ($pgOk) {
            $tableCount = docker exec dataclinica_postgres psql -U dataclinica_user -d dataclinica -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"
            $tablesExist = [int]$tableCount.Trim() -gt 0
            Write-TestResult "Migracoes Executadas" $tablesExist $(if ($tablesExist) { "$($tableCount.Trim()) tabelas encontradas" } else { "Nenhuma tabela encontrada" })
        }
    }
    catch {
        Write-TestResult "Conexao PostgreSQL" $false "Erro ao testar conexao"
    }
}
else {
    Write-TestResult "PostgreSQL" $false "Container nao esta rodando"
}

# 5. Validacao de Arquivos Criticos
Write-Section "Arquivos e Configuracoes"

$criticalFiles = @(
    @{Path="README.md"; Name="Documentacao Principal"},
    @{Path="DEPLOY.md"; Name="Guia de Deploy"},
    @{Path="LAUNCH_CHECKLIST.md"; Name="Checklist de Lancamento"},
    @{Path="backend/requirements.txt"; Name="Dependencias Backend"},
    @{Path="frontend/package.json"; Name="Dependencias Frontend"},
    @{Path="scripts/deploy.ps1"; Name="Script de Deploy PowerShell"},
    @{Path="scripts/deploy.sh"; Name="Script de Deploy Bash"},
    @{Path="monitoring/docker-compose.monitoring.yml"; Name="Configuracao Monitoramento"}
)

foreach ($file in $criticalFiles) {
    $exists = Test-Path $file.Path
    Write-TestResult $file.Name $exists $(if ($exists) { "Encontrado" } else { "Nao encontrado" })
}

# 6. Resumo Final
Write-Section "Resumo da Validacao"

$totalTests = $TestsPassed + $TestsFailed + $TestsSkipped
$successRate = if ($totalTests -gt 0) { [math]::Round(($TestsPassed / $totalTests) * 100, 1) } else { 0 }

Write-Host "Resultados:" -ForegroundColor $Colors.Blue
Write-Host "   Passou: $TestsPassed" -ForegroundColor $Colors.Green
Write-Host "   Falhou: $TestsFailed" -ForegroundColor $Colors.Red
Write-Host "   Pulou: $TestsSkipped" -ForegroundColor $Colors.Yellow
Write-Host "   Taxa de Sucesso: $successRate%" -ForegroundColor $Colors.Blue

# Determinar status final
if ($TestsFailed -eq 0) {
    Write-Host "VALIDACAO CONCLUIDA COM SUCESSO!" -ForegroundColor $Colors.Green
    Write-Host "Sistema pronto para lancamento em $Environment" -ForegroundColor $Colors.Green
    exit 0
}
elseif ($TestsFailed -le 2 -and $successRate -ge 80) {
    Write-Host "VALIDACAO CONCLUIDA COM AVISOS" -ForegroundColor $Colors.Yellow
    Write-Host "Corrija os problemas identificados antes do lancamento" -ForegroundColor $Colors.Yellow
    exit 1
}
else {
    Write-Host "VALIDACAO FALHOU" -ForegroundColor $Colors.Red
    Write-Host "Sistema NAO esta pronto para lancamento" -ForegroundColor $Colors.Red
    Write-Host "Corrija os problemas criticos antes de prosseguir" -ForegroundColor $Colors.Red
    exit 2
}