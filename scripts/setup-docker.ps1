# Script para configurar y ejecutar el entorno Docker
# UNT Prácticas y Tesis - Sistema Normalizado
# PowerShell Script

Write-Host "🚀 Configurando entorno Docker para UNT Prácticas y Tesis..." -ForegroundColor Green

# Verificar si Docker está instalado
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker encontrado: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker no está instalado. Por favor, instala Docker Desktop primero." -ForegroundColor Red
    exit 1
}

# Verificar si Docker Compose está instalado
try {
    $composeVersion = docker-compose --version
    Write-Host "✅ Docker Compose encontrado: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose no está instalado. Por favor, instala Docker Compose primero." -ForegroundColor Red
    exit 1
}

# Crear directorios necesarios
Write-Host "📁 Creando directorios necesarios..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "logs" | Out-Null
New-Item -ItemType Directory -Force -Path "backups" | Out-Null

# Detener contenedores existentes
Write-Host "🛑 Deteniendo contenedores existentes..." -ForegroundColor Yellow
docker-compose down

# Preguntar si desea limpiar volúmenes
$cleanVolumes = Read-Host "¿Deseas limpiar los volúmenes de datos existentes? (s/N)"
if ($cleanVolumes -eq 's' -or $cleanVolumes -eq 'S') {
    Write-Host "🧹 Limpiando volúmenes de datos..." -ForegroundColor Yellow
    docker-compose down -v
    docker volume prune -f
}

# Construir y levantar contenedores
Write-Host "🔨 Construyendo y levantando contenedores..." -ForegroundColor Yellow
docker-compose up --build -d

# Esperar a que la base de datos esté lista
Write-Host "⏳ Esperando a que la base de datos esté lista..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Verificar el estado de los contenedores
Write-Host "📊 Verificando estado de los contenedores..." -ForegroundColor Yellow
docker-compose ps

# Mostrar logs de la base de datos
Write-Host "📋 Mostrando logs de la base de datos..." -ForegroundColor Yellow
docker-compose logs postgres

Write-Host ""
Write-Host "✅ Entorno Docker configurado exitosamente!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 URLs de acceso:" -ForegroundColor Cyan
Write-Host "   - Frontend: http://localhost:3001"
Write-Host "   - Backend API: http://localhost:3000"
Write-Host "   - Base de datos: localhost:5433"
Write-Host ""
Write-Host "📝 Comandos útiles:" -ForegroundColor Cyan
Write-Host "   - Ver logs: docker-compose logs -f [servicio]"
Write-Host "   - Detener: docker-compose down"
Write-Host "   - Reiniciar: docker-compose restart"
Write-Host "   - Acceder a BD: docker-compose exec postgres psql -U postgres -d unt_practicas_tesis"
Write-Host ""
Write-Host "🔐 Credenciales de la base de datos:" -ForegroundColor Cyan
Write-Host "   - Usuario: postgres"
Write-Host "   - Contraseña: postgres"
Write-Host "   - Base de datos: unt_practicas_tesis"
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Cambia las contraseñas y JWT secrets en producción!" -ForegroundColor Red

# Preguntar si desea abrir el navegador
$openBrowser = Read-Host "¿Deseas abrir el frontend en el navegador? (S/n)"
if ($openBrowser -eq '' -or $openBrowser -eq 's' -or $openBrowser -eq 'S') {
    Start-Process "http://localhost:3001"
}
