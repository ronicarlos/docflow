# DocFlow - Script de Setup Automatizado
# Este script configura todo o ambiente necessário para o DocFlow

param(
    [switch]$SkipDocker,
    [switch]$Help
)

if ($Help) {
    Write-Host "DocFlow Setup Script" -ForegroundColor Green
    Write-Host ""
    Write-Host "Uso: .\setup-project.ps1 [opções]"
    Write-Host ""
    Write-Host "Opções:"
    Write-Host "  -SkipDocker     Pular configuração do Docker"
    Write-Host "  -Help           Mostrar esta ajuda"
    Write-Host ""
    Write-Host "Exemplo:"
    Write-Host "  .\setup-project.ps1"
    exit 0
}

function Write-Step {
    param([string]$Message)
    Write-Host "🚀 $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

function Wait-ForService {
    param(
        [string]$ServiceName,
        [string]$Host,
        [int]$Port,
        [int]$TimeoutSeconds = 60
    )
    
    Write-Host "Aguardando $ServiceName estar disponível em $Host`:$Port..."
    $timeout = (Get-Date).AddSeconds($TimeoutSeconds)
    
    do {
        try {
            $connection = New-Object System.Net.Sockets.TcpClient($Host, $Port)
            $connection.Close()
            Write-Success "$ServiceName está disponível!"
            return $true
        }
        catch {
            Start-Sleep -Seconds 2
        }
    } while ((Get-Date) -lt $timeout)
    
    Write-Error "Timeout aguardando $ServiceName"
    return $false
}

# Verificar pré-requisitos
Write-Step "Verificando pré-requisitos..."

$prerequisites = @(
    @{Name="Node.js"; Command="node"; Version="--version"}
    @{Name="npm"; Command="npm"; Version="--version"}
)

if (-not $SkipDocker) {
    $prerequisites += @{Name="Docker"; Command="docker"; Version="--version"}
    $prerequisites += @{Name="Docker Compose"; Command="docker-compose"; Version="--version"}
}

$missingPrereqs = @()
foreach ($prereq in $prerequisites) {
    if (Test-Command $prereq.Command) {
        $version = & $prereq.Command $prereq.Version 2>$null
        Write-Success "$($prereq.Name) encontrado: $version"
    } else {
        $missingPrereqs += $prereq.Name
        Write-Error "$($prereq.Name) não encontrado"
    }
}

if ($missingPrereqs.Count -gt 0) {
    Write-Error "Pré-requisitos faltando: $($missingPrereqs -join ', ')"
    Write-Host "Por favor, instale os pré-requisitos e execute o script novamente."
    exit 1
}

# Verificar se estamos no diretório correto
if (-not (Test-Path "package.json")) {
    Write-Error "package.json não encontrado. Execute o script no diretório raiz do projeto."
    exit 1
}

Write-Success "Todos os pré-requisitos encontrados!"

# Instalar dependências
Write-Step "Instalando dependências do Node.js..."
try {
    npm install
    Write-Success "Dependências instaladas com sucesso!"
} catch {
    Write-Error "Erro ao instalar dependências: $_"
    exit 1
}

# Configurar arquivo .env
Write-Step "Configurando arquivo .env..."
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Success "Arquivo .env criado a partir do .env.example"
        Write-Warning "Por favor, edite o arquivo .env com suas configurações antes de continuar."
        
        # Se MongoUrl foi fornecido, atualizar no .env
        if ($MongoUrl) {
            $envContent = Get-Content ".env"
            $envContent = $envContent -replace 'MONGODB_URL=".*"', "MONGODB_URL=`"$MongoUrl`""
            Set-Content ".env" $envContent
            Write-Success "URL do MongoDB configurada no .env"
        }
    } else {
        Write-Error "Arquivo .env.example não encontrado"
        exit 1
    }
} else {
    Write-Success "Arquivo .env já existe"
}

# Configurar Docker (se não for pulado)
if (-not $SkipDocker) {
    Write-Step "Configurando ambiente Docker..."
    
    # Verificar se já existe container rodando
    $existingContainer = docker ps -q -f name=docflow_postgres 2>$null
    if ($existingContainer) {
        Write-Warning "Container PostgreSQL já está rodando"
    } else {
        try {
            Write-Host "Iniciando containers Docker..."
            docker-compose up -d postgres
            Write-Success "Container PostgreSQL iniciado!"
            
            # Aguardar PostgreSQL estar disponível
            if (-not (Wait-ForService "PostgreSQL" "localhost" 5432)) {
                Write-Error "PostgreSQL não ficou disponível no tempo esperado"
                exit 1
            }
        } catch {
            Write-Error "Erro ao iniciar containers Docker: $_"
            exit 1
        }
    }
} else {
    Write-Warning "Configuração do Docker pulada. Certifique-se de que o PostgreSQL está rodando."
}

# Configurar Prisma
Write-Step "Configurando Prisma..."
try {
    Write-Host "Gerando cliente Prisma..."
    npm run db:generate
    Write-Success "Cliente Prisma gerado!"
    
    Write-Host "Aplicando schema ao banco..."
    npm run db:push
    Write-Success "Schema aplicado ao banco!"
    
    Write-Host "Populando banco com dados iniciais..."
    npm run db:seed
    Write-Success "Dados iniciais inseridos!"
} catch {
    Write-Error "Erro na configuração do Prisma: $_"
    exit 1
}

# Verificar se tudo está funcionando
Write-Step "Verificando configuração..."

try {
    # Testar conexão com banco
    Write-Host "Testando conexão com banco de dados..."
    $testResult = npx prisma db execute --stdin <<< "SELECT 1;" 2>$null
    Write-Success "Conexão com banco de dados OK!"
} catch {
    Write-Warning "Não foi possível verificar a conexão com o banco"
}

# Resumo final
Write-Host ""
Write-Host "🎉 Setup do DocFlow concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Edite o arquivo .env com suas configurações específicas"
Write-Host "2. Execute 'npm run dev' para iniciar o servidor de desenvolvimento"
Write-Host "3. Acesse http://localhost:3000 para ver a aplicação"
Write-Host "4. Use 'npm run db:studio' para gerenciar o banco via interface web"
Write-Host ""

if (-not $SkipDocker) {
    Write-Host "Serviços Docker disponíveis:" -ForegroundColor Yellow
    Write-Host "- PostgreSQL: localhost:5432"
    Write-Host "- PgAdmin: http://localhost:5050 (admin@docflow.com / admin123)"
    Write-Host ""
}

Write-Host "Comandos úteis:" -ForegroundColor Yellow
Write-Host "- npm run dev          # Iniciar desenvolvimento"
Write-Host "- npm run db:studio    # Interface do banco"
Write-Host "- docker-compose logs  # Ver logs dos containers"
Write-Host "- npm run build        # Build para produção"
Write-Host ""

Write-Host "Para mais informações, consulte README-MIGRATION.md" -ForegroundColor Cyan
Write-Host ""
Write-Success "Projeto DocFlow pronto para desenvolvimento!"