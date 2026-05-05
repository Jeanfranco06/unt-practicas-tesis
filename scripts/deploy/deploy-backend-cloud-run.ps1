#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Cloud Run Deployment Script for UNT Backend
.DESCRIPTION
    Construye y despliega la aplicación backend a Google Cloud Run con toda la configuración necesaria
.PARAMETER Project
    GCP Project ID (default: unt-practicas)
.PARAMETER Region
    Cloud Run Region (default: us-central1)
.PARAMETER SkipBuild
    Salta la fase de build y solo deploya
#>

param(
    [string]$Project = "unt-practicas",
    [string]$Region = "us-central1",
    [switch]$SkipBuild = $false,
    [switch]$SkipDeploy = $false
)

# Configuración
$ServiceName = "unt-backend-prod"
$ImageName = "gcr.io/$Project/backend:prod"
$DBPassword = 'G7$kP9!vR2@xZq8!LmW4&uTnY6sA1dFh'
$JwtSecret = 'a1e9e99adb52a369ce6461033a98a60bd2d5b2253e830187a704a33048f7abe12590d5de802eaed0ba5608c7e5ab304e6029bdeb1b82d8a74cb68839cad006c6'
$JwtRefreshSecret = 'e0970899e60af683aa543e00b2ff4758779f0e1758785dce1a2fcba19e5008890dadcd742925f4a12cf074a333b7432ac5c7f4858a63f5dcadd8a1e447fd50af'

# Colores
$Green = [System.ConsoleColor]::Green
$Red = [System.ConsoleColor]::Red
$Yellow = [System.ConsoleColor]::Yellow
$Blue = [System.ConsoleColor]::Blue

function Write-Success {
    param([string]$Message)
    Write-Host $Message -ForegroundColor $Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "ERROR: $Message" -ForegroundColor $Red
}

function Write-Info {
    param([string]$Message)
    Write-Host $Message -ForegroundColor $Yellow
}

function Write-Step {
    param([string]$Message)
    Write-Host "`n[*] $Message" -ForegroundColor $Blue
}

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "backend/Dockerfile.prod")) {
    Write-Error "No se encontró backend/Dockerfile.prod. Por favor ejecuta desde la raíz del proyecto"
    exit 1
}

# Paso 1: Build
if (-not $SkipBuild) {
    Write-Step "Construyendo imagen con Cloud Build..."
    Write-Info "Proyecto: $Project"
    Write-Info "Imagen: $ImageName"
    
    gcloud builds submit backend `
        --tag $ImageName `
        --project $Project `
        --timeout 1800s
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Build falló"
        exit 1
    }
    Write-Success "✅ Build exitoso"
} else {
    Write-Info "⏭️  Saltando build (--SkipBuild especificado)"
}

# Paso 2: Deploy
if (-not $SkipDeploy) {
    Write-Step "Desplegando a Cloud Run..."
    Write-Info "Servicio: $ServiceName"
    Write-Info "Región: $Region"
    
    # Construir vars de entorno como string
    # NOTA: PORT es establecido automáticamente por Cloud Run (no incluir)
    $EnvVars = @(
        "NODE_ENV=production",
        "BACKEND_PORT=8080",
        "DB_HOST=127.0.0.1",
        "DB_PORT=5432",
        "DB_USER=unt_produc_user",
        "DB_PASSWORD=$DBPassword",
        "DB_NAME=unt_practicas_tesis_prod",
        "CLOUD_SQL_INSTANCE=$Project`:us-central1:unt-postgres-prod",
        "JWT_SECRET=$JwtSecret",
        "JWT_REFRESH_SECRET=$JwtRefreshSecret",
        "JWT_EXPIRES_IN=1h",
        "JWT_REFRESH_EXPIRES_IN=7d",
        "FRONTEND_URL=https://yourdomain.com"
    ) -join ","
    
    Write-Info "Configurando variables de entorno..."
    
    gcloud run deploy $ServiceName `
        --image $ImageName `
        --region $Region `
        --project $Project `
        --platform managed `
        --allow-unauthenticated `
        --cpu 2 `
        --memory 1Gi `
        --timeout 600 `
        --max-instances 100 `
        --min-instances 1 `
        --set-env-vars $EnvVars
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Deployment falló"
        exit 1
    }
    Write-Success "✅ Deployment exitoso"
    
    # Obtener URL del servicio
    Write-Step "Obteniendo URL del servicio..."
    $ServiceUrl = gcloud run services describe $ServiceName `
        --region $Region `
        --project $Project `
        --format "value(status.url)"
    
    Write-Success "✅ Servicio disponible en: $ServiceUrl"
    
    # Verificar health
    Write-Step "Verificando health endpoint..."
    Start-Sleep -Seconds 5
    
    try {
        $HealthCheck = Invoke-RestMethod -Uri "$ServiceUrl/api/health" -ErrorAction SilentlyContinue
        Write-Success "✅ Health Check OK: $($HealthCheck | ConvertTo-Json)"
    } catch {
        Write-Info "⚠️  Health check aún no disponible (puede tardar algunos segundos más)"
    }
    
} else {
    Write-Info "⏭️  Saltando deploy (--SkipDeploy especificado)"
}

Write-Success "`n✅ Script completado exitosamente`n"

# Mostrar próximos pasos
Write-Step "Próximos pasos:"
Write-Info @"
1. Ver logs en tiempo real:
   gcloud run logs read $ServiceName --region $Region --tail=100

2. Ver estado del servicio:
   gcloud run services describe $ServiceName --region $Region

3. Revisar métricas en Cloud Console:
   https://console.cloud.google.com/run?project=$Project

4. Verificar salud de la aplicación:
   curl {ServiceUrl}/api/health
"@
