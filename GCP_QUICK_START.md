# ⚡ Google Cloud Run - Quick Start (15 minutos)

## 🎯 Resumen Ultra Rápido

### Paso 1: Setup Inicial (5 min)
```bash
# 1. Instalar gcloud si no está
# https://cloud.google.com/sdk/docs/install

# 2. Autenticarse
gcloud auth login

# 3. Configurar proyecto
gcloud config set project YOUR_PROJECT_ID

# 4. Habilitar APIs
gcloud services enable run.googleapis.com sqladmin.googleapis.com redis.googleapis.com
```

### Paso 2: Crear BD y Cache (5 min)
```bash
# Crear PostgreSQL
gcloud sql instances create unt-postgres-prod \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=us-central1

# Crear Redis
gcloud redis instances create unt-redis-prod \
    --size=2 \
    --region=us-central1 \
    --tier=basic

# Obtener IPs
gcloud sql instances describe unt-postgres-prod --format="value(ipAddresses[0].ipAddress)"
gcloud redis instances describe unt-redis-prod --region=us-central1 --format="value(host)"
```

### Paso 3: Deploy (5 min)
```bash
# Backend
gcloud run deploy unt-backend-prod \
    --source backend \
    --region us-central1 \
    --platform managed \
    --dockerfile Dockerfile.prod \
    --memory 1Gi \
    --allow-unauthenticated \
    --env-vars-file .env.prod

# Frontend
gcloud run deploy unt-frontend-prod \
    --source frontend \
    --region us-central1 \
    --platform managed \
    --dockerfile Dockerfile.prod \
    --memory 512Mi \
    --allow-unauthenticated \
    --env-vars-file .env.prod
```

## ✅ Verificar

```bash
# Backend
curl https://unt-backend-prod-XXXXX.a.run.app/health

# Frontend
curl https://unt-frontend-prod-XXXXX.a.run.app

# Ver logs
gcloud run services logs read unt-backend-prod --limit 50
```

## 📖 Guía Detallada

→ [GCP_CLOUD_RUN_GUIDE.md](GCP_CLOUD_RUN_GUIDE.md)

## 💰 Costo

- $300 créditos iniciales (90 días)
- Estimado: $15-40/mes después
- Cloud Run: pay-per-use
- Cloud SQL: ~$10/mes
- Redis: ~$5-10/mes
