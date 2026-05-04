# Script para desarrollo local
# UNT Prácticas y Tesis - Sistema Normalizado
# PowerShell Script

Write-Host "🔧 Configurando entorno de desarrollo local..." -ForegroundColor Green

# Verificar si Node.js está instalado
try {
    $nodeVersion = node --version
    $majorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($majorVersion -lt 18) {
        Write-Host "❌ Se requiere Node.js 18 o superior. Versión actual: $nodeVersion" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no está instalado. Por favor, instala Node.js 18+ primero." -ForegroundColor Red
    exit 1
}

# Verificar si PostgreSQL está instalado (opcional para desarrollo local)
try {
    $psqlVersion = psql --version
    Write-Host "✅ PostgreSQL encontrado: $psqlVersion" -ForegroundColor Green
    $useLocalDB = $true
} catch {
    Write-Host "⚠️  PostgreSQL no encontrado. Se usará Docker para la base de datos." -ForegroundColor Yellow
    $useLocalDB = $false
}

# Instalar dependencias del backend
Write-Host "📦 Instalando dependencias del backend..." -ForegroundColor Yellow
Set-Location backend
if (-not (Test-Path "node_modules")) {
    npm install
}

# Copiar archivo .env si no existe
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "📝 Archivo .env creado para el backend" -ForegroundColor Green
}

# Volver al directorio principal
Set-Location ..

# Instalar dependencias del frontend
Write-Host "📦 Instalando dependencias del frontend..." -ForegroundColor Yellow
Set-Location frontend
if (-not (Test-Path "node_modules")) {
    npm install
}

# Copiar archivo .env.local si no existe
if (-not (Test-Path ".env.local")) {
    Copy-Item ".env.example" ".env.local"
    Write-Host "📝 Archivo .env.local creado para el frontend" -ForegroundColor Green
}

# Volver al directorio principal
Set-Location ..

# Configurar base de datos
if ($useLocalDB) {
    Write-Host "🗄️  Configurando base de datos local..." -ForegroundColor Yellow
    $setupLocalDB = Read-Host "¿Deseas configurar la base de datos local? (s/N)"
    if ($setupLocalDB -eq 's' -or $setupLocalDB -eq 'S') {
        Write-Host "Por favor, crea una base de datos llamada 'unt_practicas_tesis' en PostgreSQL" -ForegroundColor Cyan
        Write-Host "Luego ejecuta los scripts en init-scripts/ en orden:" -ForegroundColor Cyan
        Write-Host "  1. 01-init.sql" -ForegroundColor Cyan
        Write-Host "  2. 02-migration-normalized.sql" -ForegroundColor Cyan
        Write-Host "  3. 03-test-data.sql" -ForegroundColor Cyan
    }
} else {
    Write-Host "🐳 Iniciando base de datos con Docker..." -ForegroundColor Yellow
    docker-compose up -d postgres
    Start-Sleep -Seconds 10
}

# Crear scripts de desarrollo
Write-Host "📝 Creando scripts de desarrollo..." -ForegroundColor Yellow

# Asegurar que el directorio scripts existe
if (-not (Test-Path "scripts")) {
    New-Item -ItemType Directory -Path "scripts" | Out-Null
}

# Script para iniciar backend
$startBackendScript = @"
#!/bin/bash
echo "🚀 Iniciando backend..."
cd backend
npm run start:dev
"@
$startBackendScript | Out-File -FilePath "scripts/start-backend.sh" -Encoding utf8

# Script para iniciar frontend
$startFrontendScript = @"
#!/bin/bash
echo "🚀 Iniciando frontend..."
cd frontend
npm run dev
"@
$startFrontendScript | Out-File -FilePath "scripts/start-frontend.sh" -Encoding utf8

# Script para iniciar todo
$startAllScript = @"
#!/bin/bash
echo "🚀 Iniciando todos los servicios..."

# Iniciar backend en segundo plano
echo "Iniciando backend..."
cd backend
npm run start:dev &
BACKEND_PID=`$!
cd ..

# Esperar un momento
sleep 5

# Iniciar frontend en segundo plano
echo "Iniciando frontend..."
cd frontend
npm run dev &
FRONTEND_PID=`$!
cd ..

echo "✅ Servicios iniciados:"
echo "   - Backend: http://localhost:3000 (PID: `$BACKEND_PID)"
echo "   - Frontend: http://localhost:3001 (PID: `$FRONTEND_PID)"
echo ""
echo "Para detener los servicios, usa: kill `$BACKEND_PID `$FRONTEND_PID"
echo "O presiona Ctrl+C para detener este script y los servicios"

# Esperar señal de interrupción
trap "echo '🛑 Deteniendo servicios...'; kill `$BACKEND_PID `$FRONTEND_PID; exit" INT
wait
"@
$startAllScript | Out-File -FilePath "scripts/start-all.sh" -Encoding utf8

# Crear scripts para PowerShell
$startBackendPS = @"
# Script para iniciar backend
Write-Host "🚀 Iniciando backend..." -ForegroundColor Green
Set-Location backend
npm run start:dev
"@
$startBackendPS | Out-File -FilePath "scripts/start-backend.ps1" -Encoding utf8

$startFrontendPS = @"
# Script para iniciar frontend
Write-Host "🚀 Iniciando frontend..." -ForegroundColor Green
Set-Location frontend
npm run dev
"@
$startFrontendPS | Out-File -FilePath "scripts/start-frontend.ps1" -Encoding utf8

Write-Host ""
Write-Host "✅ Entorno de desarrollo configurado exitosamente!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Para empezar a desarrollar:" -ForegroundColor Cyan
Write-Host "   - Iniciar backend: .\scripts\start-backend.ps1" -ForegroundColor White
Write-Host "   - Iniciar frontend: .\scripts\start-frontend.ps1" -ForegroundColor White
Write-Host "   - Iniciar todo: .\scripts\start-all.sh" -ForegroundColor White
Write-Host ""
Write-Host "🌐 URLs de desarrollo:" -ForegroundColor Cyan
Write-Host "   - Frontend: http://localhost:3001" -ForegroundColor White
Write-Host "   - Backend API: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "📝 Archivos de configuración creados:" -ForegroundColor Cyan
Write-Host "   - backend\.env" -ForegroundColor White
Write-Host "   - frontend\.env.local" -ForegroundColor White
Write-Host ""
Write-Host "🔐 Credenciales de prueba (contraseña: password123):" -ForegroundColor Cyan
Write-Host "   - Admin: admin@unt.edu.pe" -ForegroundColor White
Write-Host "   - Estudiante: estudiante1@unt.edu.pe" -ForegroundColor White
Write-Host "   - Ver todas en DOCKER_SETUP.md" -ForegroundColor White

# Preguntar si desea abrir el editor de código
$openEditor = Read-Host "¿Deseas abrir VS Code? (S/n)"
if ($openEditor -eq '' -or $openEditor -eq 's' -or $openEditor -eq 'S') {
    try {
        code .
        Write-Host "📝 VS Code abierto" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  No se pudo abrir VS Code automáticamente" -ForegroundColor Yellow
    }
}
