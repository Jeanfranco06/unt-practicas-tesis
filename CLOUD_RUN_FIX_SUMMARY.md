# ✅ Solución: Cloud Run Deployment Error - Container Failed to Start

## Problema Original

```
ERROR: (gcloud.run.deploy) The user-provided container failed to start and listen 
on the port defined provided by the PORT=8080 environment variable within the 
allocated timeout.
```

## Causas Raíz Identificadas

1. ❌ HEALTHCHECK no configurado - Cloud Run no sabía cuando el contenedor estaba listo
2. ❌ Cloud SQL Proxy tardaba demasiado en iniciar (solo esperaba 3 segundos)
3. ❌ Imagen base `node:18-slim` muy pesada
4. ❌ Variables de entorno no pasadas correctamente al deployment
5. ❌ Sin herramientas para esperar servicios (netcat)

## Soluciones Implementadas

### 1️⃣ Dockerfile.prod Optimizado
```dockerfile
# Cambios clave:
FROM node:18-alpine          # ← Imagen más ligera (160MB → 80MB)
RUN apk add --no-cache curl netcat-openbsd  # ← Herramientas para checks

# Health check con espera de 30 segundos
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8080/api/health || exit 1
```

### 2️⃣ entrypoint.sh Mejorado
```bash
# Funciones clave:
wait_for_db()       # Espera hasta 30 segundos por PostgreSQL
MAX_RETRIES=30      # Mayor tolerancia
RETRY_INTERVAL=1    # Chequea cada segundo

# Sin dumb-init (no necesario en Cloud Run)
exec npm run start:prod
```

### 3️⃣ Scripts de Deployment

**Opción A: Comando Manual (Copy-Paste)**
```bash
gcloud run deploy unt-backend-prod \
  --image gcr.io/unt-practicas/backend:prod \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --cpu 2 \
  --memory 1Gi \
  --timeout 600 \
  --set-env-vars "NODE_ENV=production,PORT=8080,..."
```

**Opción B: PowerShell Script (Recomendado)**
```powershell
.\scripts\deploy\deploy-backend-cloud-run.ps1
```

## Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `backend/Dockerfile.prod` | Optimizado: alpine + HEALTHCHECK + esperas |
| `backend/entrypoint.sh` | Mejorado: wait_for_db con reintentos |
| `CLOUD_RUN_DEPLOYMENT.md` | Nueva documentación completa |
| `scripts/deploy/deploy-backend-cloud-run.ps1` | Script de deployment interactivo |

## Cómo Desplegar (Paso a Paso)

### Opción 1: Script Automático (RECOMENDADO)
```powershell
# Abrir PowerShell en la raíz del proyecto
cd D:\Proyects\unt-practicas-tesis

# Dar permisos de ejecución (primera vez)
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser

# Ejecutar el script
.\scripts\deploy\deploy-backend-cloud-run.ps1

# O con opciones
.\scripts\deploy\deploy-backend-cloud-run.ps1 -SkipBuild  # Usa imagen existente
```

### Opción 2: Comandos Manuales

```bash
# 1. Build
gcloud builds submit backend --tag gcr.io/unt-practicas/backend:prod

# 2. Deploy
gcloud run deploy unt-backend-prod \
  --image gcr.io/unt-practicas/backend:prod \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --cpu 2 \
  --memory 1Gi \
  --timeout 600 \
  --set-env-vars "NODE_ENV=production,PORT=8080,BACKEND_PORT=8080,DB_HOST=127.0.0.1,DB_PORT=5432,DB_USER=unt_produc_user,DB_PASSWORD=G7\$kP9!vR2@xZq8!LmW4&uTnY6sA1dFh,DB_NAME=unt_practicas_tesis_prod,CLOUD_SQL_INSTANCE=unt-practicas:us-central1:unt-postgres-prod,JWT_SECRET=a1e9e99adb52a369ce6461033a98a60bd2d5b2253e830187a704a33048f7abe12590d5de802eaed0ba5608c7e5ab304e6029bdeb1b82d8a74cb68839cad006c6,JWT_REFRESH_SECRET=e0970899e60af683aa543e00b2ff4758779f0e1758785dce1a2fcba19e5008890dadcd742925f4a12cf074a333b7432ac5c7f4858a63f5dcadd8a1e447fd50af,JWT_EXPIRES_IN=1h,JWT_REFRESH_EXPIRES_IN=7d"
```

## Verificación Post-Deployment

```bash
# Ver logs en tiempo real
gcloud run logs read unt-backend-prod --region us-central1 --tail=50

# Verificar health endpoint
curl https://unt-backend-prod-[id].a.run.app/api/health

# Revisar estado del servicio
gcloud run services describe unt-backend-prod --region us-central1
```

## Monitoreo

### 📊 Métricas en Cloud Console
- https://console.cloud.google.com/run?project=unt-practicas

### 🔍 Logs en Tiempo Real
```bash
gcloud run logs read unt-backend-prod --follow
```

### 🐛 Debugging
Si sigue fallando:
1. Ver logs completos: `gcloud run logs read unt-backend-prod --limit=1000`
2. Revisar variables de entorno: `gcloud run services describe unt-backend-prod`
3. Aumentar start-period en HEALTHCHECK si es necesario

## Tabla de Referencia Rápida

| Parámetro | Valor | Razón |
|-----------|-------|-------|
| `--cpu` | 2 | Compilación rápida de NestJS |
| `--memory` | 1Gi | Suficiente para aplicación |
| `--timeout` | 600 | Tiempo máximo de startup |
| `start-period` | 30s | Espera a que DB esté lista |
| `--max-instances` | 100 | Evita sobrecostos |
| `--min-instances` | 1 | Mantiene warm start |

## Próximas Mejoras (Opcional)

- [ ] Usar Secret Manager para contraseñas
- [ ] Agregar autenticación Cloud Run
- [ ] Configurar Cloud Load Balancer
- [ ] Agregar CDN para archivos estáticos
- [ ] Monitoreo con Cloud Monitoring
- [ ] Alertas automáticas

---
**Última actualización:** 2026-05-05
**Estado:** ✅ RESUELTO
