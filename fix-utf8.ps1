# Script para corregir encoding UTF-8 en PostgreSQL
# Requiere Docker y docker-compose

param(
    [switch]$ResetDB = $false,
    [switch]$Verify = $false
)

$ErrorActionPreference = "Stop"

# Colores para output
$Yellow = [System.ConsoleColor]::Yellow
$Green = [System.ConsoleColor]::Green
$Red = [System.ConsoleColor]::Red

function Write-Header {
    param([string]$Message)
    Write-Host "`n================================================" -ForegroundColor $Yellow
    Write-Host $Message -ForegroundColor $Yellow
    Write-Host "================================================`n" -ForegroundColor $Yellow
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor $Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor $Red
}

# Verificar que estamos en la carpeta correcta
if (-not (Test-Path "docker-compose.yml")) {
    Write-Error-Custom "docker-compose.yml no encontrado. Ejecuta este script desde la raíz del proyecto."
    exit 1
}

Write-Header "Corrección de Encoding UTF-8 para PostgreSQL"

# Opción 1: Reset de BD
if ($ResetDB) {
    Write-Host "Modo: RESET COMPLETO DE BASE DE DATOS" -ForegroundColor $Yellow
    Write-Host "Advertencia: Esto eliminará todos los datos existentes!" -ForegroundColor $Red
    $confirm = Read-Host "¿Estás seguro? (s/n)"
    
    if ($confirm -ne "s") {
        Write-Host "Cancelado." -ForegroundColor $Yellow
        exit 0
    }

    Write-Header "Paso 1: Deteniendo contenedores..."
    docker-compose down
    Write-Success "Contenedores detenidos"

    Write-Header "Paso 2: Eliminando volumen de datos..."
    $volumeName = "unt-practicas-tesis_postgres_data"
    $volumeExists = docker volume ls --filter name=$volumeName -q
    
    if ($volumeExists) {
        docker volume rm $volumeName
        Write-Success "Volumen eliminado"
    } else {
        Write-Host "Volumen no encontrado (podría ser normal)" -ForegroundColor $Yellow
    }

    Write-Header "Paso 3: Reconstruyendo e iniciando contenedores..."
    docker-compose up -d --build
    Write-Success "Contenedores iniciados"

    Write-Host "Esperando a que PostgreSQL esté listo..." -ForegroundColor $Yellow
    Start-Sleep -Seconds 15

    Write-Success "Base de datos reinicializada con UTF-8 correcto!"
    
} else {
    Write-Host "Modo: CORREGIR DATOS EXISTENTES" -ForegroundColor $Yellow
    
    Write-Header "Verificando que Docker y los contenedores estén corriendo..."
    
    try {
        $containerStatus = docker-compose ps -q postgres
        if (-not $containerStatus) {
            Write-Error-Custom "Los contenedores no están corriendo."
            Write-Host "Ejecuta: docker-compose up -d" -ForegroundColor $Yellow
            exit 1
        }
        Write-Success "Contenedores detectados"
    } catch {
        Write-Error-Custom "Error al verificar contenedores: $_"
        exit 1
    }

    Write-Header "Ejecutando script de corrección UTF-8..."
    
    try {
        $scriptPath = "./fix-utf8-complete.sql"
        if (-not (Test-Path $scriptPath)) {
            Write-Error-Custom "Archivo $scriptPath no encontrado."
            exit 1
        }

        # Ejecutar el script
        Get-Content $scriptPath | docker exec -i unt-practicas-tesis-postgres-1 psql -U postgres -d unt_practicas_tesis 2>&1 | Out-Host
        
        Write-Success "Script de corrección ejecutado"
    } catch {
        Write-Error-Custom "Error al ejecutar script: $_"
        exit 1
    }
}

# Verificar resultados
if ($Verify -or $ResetDB) {
    Write-Header "Verificando resultados..."
    
    try {
        Write-Host "Consultando carreras con encoding UTF-8:" -ForegroundColor $Yellow
        docker exec -i unt-practicas-tesis-postgres-1 psql -U postgres -d unt_practicas_tesis -c "SELECT nombre FROM carrera LIMIT 3;" 2>&1 | Out-Host
        
        Write-Host "`nConsultando facultades:" -ForegroundColor $Yellow
        docker exec -i unt-practicas-tesis-postgres-1 psql -U postgres -d unt_practicas_tesis -c "SELECT nombre FROM facultad LIMIT 3;" 2>&1 | Out-Host
        
        Write-Success "Verificación completada"
    } catch {
        Write-Error-Custom "Error al verificar: $_"
        exit 1
    }
}

Write-Header "¡Proceso completado exitosamente!"
Write-Host "Los caracteres especiales (tildes) ahora deben mostrarse correctamente." -ForegroundColor $Green
Write-Host "Ejemplo: 'Ingeniería de Sistemas' (no 'IngenierÃ­a de Sistemas')" -ForegroundColor $Green
