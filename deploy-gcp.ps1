# Script de Deployment Automático a Google Cloud Run
# Este script configura todo automáticamente y deploya

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║  UNT Prácticas - Google Cloud Run Automatic Deployment        ║" -ForegroundColor Blue
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""

# Verificar que gcloud está instalado
Write-Host "[1/8] Verificando gcloud CLI..." -ForegroundColor Cyan
if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-Host "✗ Error: gcloud CLI no está instalado" -ForegroundColor Red
    Write-Host "  Descárgalo de: https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ gcloud CLI encontrado" -ForegroundColor Green
Write-Host ""

# Verificar autenticación
Write-Host "[2/8] Verificando autenticación..." -ForegroundColor Cyan
$auth = gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>$null
if (-not $auth) {
    Write-Host "✗ No estás autenticado en Google Cloud" -ForegroundColor Red
    Write-Host "  Ejecuta: gcloud auth login" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Autenticado como: $auth" -ForegroundColor Green
Write-Host ""

# Obtener proyecto
Write-Host "[3/8] Obteniendo proyecto configurado..." -ForegroundColor Cyan
$project = gcloud config get-value project 2>$null
if (-not $project) {
    Write-Host "✗ No hay proyecto configurado" -ForegroundColor Red
    Write-Host "  Ejecuta: gcloud config set project TU_PROJECT_ID" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Proyecto: $project" -ForegroundColor Green
Write-Host ""

# Verificar que Cloud SQL existe
Write-Host "[4/8] Obteniendo datos de Cloud SQL..." -ForegroundColor Cyan
$sqlInstance = gcloud sql instances describe unt-postgres-prod --format="value(ipAddresses[0].ipAddress)" 2>$null
if (-not $sqlInstance) {
    Write-Host "✗ Cloud SQL 'unt-postgres-prod' no existe o no es accesible" -ForegroundColor Red
    Write-Host "  Crea primero en Google Cloud Console:" -ForegroundColor Yellow
    Write-Host "    gcloud sql instances create unt-postgres-prod --database-version=POSTGRES_15 --tier=db-f1-micro" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Cloud SQL IP: $sqlInstance" -ForegroundColor Green
Write-Host ""

# Verificar que Redis existe
Write-Host "[5/8] Obteniendo datos de Redis..." -ForegroundColor Cyan
$redisHost = gcloud redis instances describe unt-redis-prod --region=us-central1 --format="value(host)" 2>$null
if (-not $redisHost) {
    Write-Host "✗ Redis 'unt-redis-prod' no existe" -ForegroundColor Red
    Write-Host "  Crea primero: gcloud redis instances create unt-redis-prod --size=2 --region=us-central1" -ForegroundColor Yellow
    exit 1
}
$redisPort = gcloud redis instances describe unt-redis-prod --region=us-central1 --format="value(port)" 2>$null
Write-Host "✓ Redis Host: ${redisHost}:${redisPort}" -ForegroundColor Green
Write-Host ""

# Actualizar .env.prod
Write-Host "[6/8] Actualizando .env.prod con valores de GCP..." -ForegroundColor Cyan

# Generar URLs automáticas
$backendUrl = "https://unt-backend-prod.a.run.app"
$frontendUrl = "https://unt-frontend-prod.a.run.app"

# Leer archivo
$envFile = Get-Content .env.prod -Raw

# Reemplazar valores
$envFile = $envFile -replace 'DB_HOST=.*', "DB_HOST=$sqlInstance"
$envFile = $envFile -replace 'REDIS_URL=.*', "REDIS_URL=redis://${redisHost}:${redisPort}"
$envFile = $envFile -replace 'API_URL=.*', "API_URL=$backendUrl"
$envFile = $envFile -replace 'FRONTEND_URL=.*', "FRONTEND_URL=$frontendUrl"
$envFile = $envFile -replace 'NEXT_PUBLIC_API_URL=.*', "NEXT_PUBLIC_API_URL=$backendUrl"

# Guardar archivo
$envFile | Set-Content .env.prod -Encoding UTF8
Write-Host "✓ .env.prod actualizado" -ForegroundColor Green
Write-Host ""

# Deploy Backend
Write-Host "[7/8] Desplegando Backend en Cloud Run..." -ForegroundColor Cyan
Write-Host "  Esto puede tardar 3-5 minutos..." -ForegroundColor Yellow
gcloud run deploy unt-backend-prod `
    --source backend `
    --region us-central1 `
    --platform managed `
    --dockerfile Dockerfile.prod `
    --memory 1Gi `
    --cpu 2 `
    --timeout 3600 `
    --allow-unauthenticated `
    --env-vars-file .env.prod `
    --quiet 2>&1 | Tee-Object -Variable backendLog

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Error al desplegar Backend" -ForegroundColor Red
    Write-Host $backendLog -ForegroundColor Red
    exit 1
}
Write-Host "✓ Backend desplegado exitosamente" -ForegroundColor Green
Write-Host ""

# Deploy Frontend
Write-Host "[8/8] Desplegando Frontend en Cloud Run..." -ForegroundColor Cyan
Write-Host "  Esto puede tardar 3-5 minutos..." -ForegroundColor Yellow
gcloud run deploy unt-frontend-prod `
    --source frontend `
    --region us-central1 `
    --platform managed `
    --dockerfile Dockerfile.prod `
    --memory 512Mi `
    --cpu 1 `
    --allow-unauthenticated `
    --env-vars-file .env.prod `
    --quiet 2>&1 | Tee-Object -Variable frontendLog

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Error al desplegar Frontend" -ForegroundColor Red
    Write-Host $frontendLog -ForegroundColor Red
    exit 1
}
Write-Host "✓ Frontend desplegado exitosamente" -ForegroundColor Green
Write-Host ""

# Obtener URLs finales
Write-Host "═════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "✓ DEPLOYMENT COMPLETADO EXITOSAMENTE" -ForegroundColor Green
Write-Host "═════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

Write-Host "URLs de acceso:" -ForegroundColor Cyan
Write-Host "  Backend:  $(gcloud run services describe unt-backend-prod --region us-central1 --format='value(status.url)')" -ForegroundColor White
Write-Host "  Frontend: $(gcloud run services describe unt-frontend-prod --region us-central1 --format='value(status.url)')" -ForegroundColor White
Write-Host ""

Write-Host "Para monitorear logs:" -ForegroundColor Cyan
Write-Host "  gcloud run services logs read unt-backend-prod --region us-central1 --follow" -ForegroundColor White
Write-Host ""

Write-Host "✓ DEPLOYMENT COMPLETADO EXITOSAMENTE" -ForegroundColor Green
