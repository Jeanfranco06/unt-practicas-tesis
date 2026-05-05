# Cloud Run Deployment Fix

## Problema Resuelto

El contenedor fallaba al iniciar en Cloud Run con el error:
```
The user-provided container failed to start and listen on the port defined provided 
by the PORT=8080 environment variable within the allocated timeout.
```

## Cambios Realizados

### 1. **Dockerfile.prod Mejorado**
- ✅ Cambió de `node:18-slim` a `node:18-alpine` (imagen más ligera)
- ✅ Agregó `netcat-openbsd` para verificar conexiones de base de datos
- ✅ HEALTHCHECK configurado para que Cloud Run valide que el servidor está listo
- ✅ `start-period=30s` en HEALTHCHECK (tiempo para que se inicie)

### 2. **entrypoint.sh Mejorado**
- ✅ Función `wait_for_db()`: Espera hasta 30 segundos a que PostgreSQL esté disponible
- ✅ Mejor manejo de errores
- ✅ Logs descriptivos para debugging
- ✅ Sin `dumb-init` (no es necesario en Cloud Run)

### 3. **main.ts**
- ✅ Ya tiene configuración correcta de puerto (PORT env variable)
- ✅ Health endpoint en `/api/health` para el HEALTHCHECK

## Comando de Deployment Correcto

### Opción 1: Con Cloud SQL Proxy (Recomendado)

```bash
# Primero, construir la imagen
gcloud builds submit backend --config cloudbuild.yaml \
  --tag gcr.io/unt-practicas/backend:prod

# Luego, desplegar con todas las variables de entorno
gcloud run deploy unt-backend-prod \
  --image gcr.io/unt-practicas/backend:prod \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --cpu 2 \
  --memory 1Gi \
  --timeout 600 \
  --set-env-vars "NODE_ENV=production,\
BACKEND_PORT=8080,\
DB_HOST=127.0.0.1,\
DB_PORT=5432,\
DB_USER=unt_produc_user,\
DB_PASSWORD=G7\$kP9!vR2@xZq8!LmW4&uTnY6sA1dFh,\
DB_NAME=unt_practicas_tesis_prod,\
CLOUD_SQL_INSTANCE=unt-practicas:us-central1:unt-postgres-prod,\
JWT_SECRET=a1e9e99adb52a369ce6461033a98a60bd2d5b2253e830187a704a33048f7abe12590d5de802eaed0ba5608c7e5ab304e6029bdeb1b82d8a74cb68839cad006c6,\
JWT_REFRESH_SECRET=e0970899e60af683aa543e00b2ff4758779f0e1758785dce1a2fcba19e5008890dadcd742925f4a12cf074a333b7432ac5c7f4858a63f5dcadd8a1e447fd50af,\
JWT_EXPIRES_IN=1h,\
JWT_REFRESH_EXPIRES_IN=7d,\
FRONTEND_URL=https://yourdomain.com"
```

### Opción 2: Sin Cloud SQL Proxy (Conexión Directa)

Para esta opción, necesitarías autorizar la red de Cloud Run en Cloud SQL o usar UNIX sockets.

```bash
gcloud run deploy unt-backend-prod \
  --image gcr.io/unt-practicas/backend:prod \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --cpu 2 \
  --memory 1Gi \
  --timeout 600 \
  --set-env-vars "NODE_ENV=production,PORT=8080,DB_HOST=<IP_PUBLICA_CLOUD_SQL>,..." \
  --cloud-sql-instances=unt-practicas:us-central1:unt-postgres-prod
```

## PowerShell Script - Deploy Completo

Crea un archivo `deploy-backend-cloud-run.ps1`:

```powershell
#!/usr/bin/env pwsh

# Variables
$PROJECT_ID = "unt-practicas"
$SERVICE_NAME = "unt-backend-prod"
$REGION = "us-central1"
$IMAGE_NAME = "$($PROJECT_ID)/backend:prod"
$GCR_IMAGE = "gcr.io/$IMAGE_NAME"

# Colores para output
$Green = [System.ConsoleColor]::Green
$Red = [System.ConsoleColor]::Red
$Yellow = [System.ConsoleColor]::Yellow

Write-Host "🚀 Cloud Run Deployment Script for UNT Backend" -ForegroundColor $Green

# Paso 1: Construir imagen con Cloud Build
Write-Host "`n📦 Building Docker image with Cloud Build..." -ForegroundColor $Yellow
gcloud builds submit backend `
  --tag $GCR_IMAGE `
  --project $PROJECT_ID `
  --timeout 1800s

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor $Red
    exit 1
}
Write-Host "✅ Build successful" -ForegroundColor $Green

# Paso 2: Desplegar a Cloud Run
Write-Host "`n🚀 Deploying to Cloud Run..." -ForegroundColor $Yellow

gcloud run deploy $SERVICE_NAME `
  --image $GCR_IMAGE `
  --region $REGION `
  --project $PROJECT_ID `
  --platform managed `
  --allow-unauthenticated `
  --cpu 2 `
  --memory 1Gi `
  --timeout 600 `
  --set-env-vars `
    "NODE_ENV=production,PORT=8080,BACKEND_PORT=8080,DB_HOST=127.0.0.1,DB_PORT=5432,DB_USER=unt_produc_user,DB_PASSWORD=G7`$kP9!vR2@xZq8!LmW4&uTnY6sA1dFh,DB_NAME=unt_practicas_tesis_prod,CLOUD_SQL_INSTANCE=unt-practicas:us-central1:unt-postgres-prod,JWT_SECRET=a1e9e99adb52a369ce6461033a98a60bd2d5b2253e830187a704a33048f7abe12590d5de802eaed0ba5608c7e5ab304e6029bdeb1b82d8a74cb68839cad006c6,JWT_REFRESH_SECRET=e0970899e60af683aa543e00b2ff4758779f0e1758785dce1a2fcba19e5008890dadcd742925f4a12cf074a333b7432ac5c7f4858a63f5dcadd8a1e447fd50af,JWT_EXPIRES_IN=1h,JWT_REFRESH_EXPIRES_IN=7d,FRONTEND_URL=https://yourdomain.com"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed" -ForegroundColor $Red
    exit 1
}

Write-Host "✅ Deployment successful" -ForegroundColor $Green

# Paso 3: Verificar estado
Write-Host "`n📊 Service Status:" -ForegroundColor $Yellow
gcloud run services describe $SERVICE_NAME --region $REGION --project $PROJECT_ID

Write-Host "`n✅ Deployment completed successfully!" -ForegroundColor $Green
```

## Ejecución

```powershell
# Hacerlo ejecutable
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser -Force

# Ejecutar
.\deploy-backend-cloud-run.ps1
```

## Verificación

Después del deployment, verificar:

```bash
# Ver logs
gcloud run logs read unt-backend-prod --region us-central1

# Probar health endpoint
curl https://unt-backend-prod-[id].a.run.app/api/health

# Revisar metrics
gcloud run services describe unt-backend-prod --region us-central1
```

## Cambios Clave en la Solución

| Problema | Solución |
|----------|----------|
| Timeout corto | HEALTHCHECK con `start-period=30s` |
| Cloud SQL no estaba listo | Script espera hasta 30 segundos por DB |
| Variables de entorno faltantes | Pasadas explícitamente en deploy |
| Imagen pesada | Cambié a `node:18-alpine` |
| Sin health check | Agregué `/api/health` endpoint |

## Próximos Pasos

1. Actualizar `cloudbuild.yaml` si es necesario
2. Ejecutar el script de deployment
3. Monitorear logs en Cloud Console
4. Si hay problemas, revisar logs con: `gcloud run logs read unt-backend-prod --tail=100`
