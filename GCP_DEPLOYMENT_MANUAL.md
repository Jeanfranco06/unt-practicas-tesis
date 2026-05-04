# INSTRUCCIONES PARA DESPLEGAR EN GOOGLE CLOUD RUN

## Paso 1: Instalar Google Cloud SDK

### En Windows (opción más recomendada):
1. Descarga el instalador desde: https://cloud.google.com/sdk/docs/install-gke-gcloud-cli-windows
2. Ejecuta: `GoogleCloudSDKInstaller.exe`
3. Sigue los pasos del instalador (instala Python 3.7+ si te lo pide)
4. Reinicia tu terminal/PowerShell después de instalar

### Verificar instalación:
```powershell
gcloud --version
```

---

## Paso 2: Autenticarse en Google Cloud

```powershell
gcloud auth login
```

Esto abrirá un navegador para que inicies sesión con tu cuenta de Google.

---

## Paso 3: Configurar proyecto

Si no tienes proyecto creado:
1. Ir a: https://console.cloud.google.com/projectcreate
2. Crear nuevo proyecto (ej: "unt-practicas")
3. Esperar a que se cree

Luego configurar en terminal:
```powershell
gcloud config set project TU_PROJECT_ID
```

---

## Paso 4: Habilitar APIs necesarias

```powershell
gcloud services enable run.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable redis.googleapis.com
gcloud services enable container.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

---

## Paso 5: Crear Cloud SQL (PostgreSQL)

### Opción A: Vía comando (recomendado)
```powershell
gcloud sql instances create unt-postgres-prod `
    --database-version=POSTGRES_15 `
    --tier=db-f1-micro `
    --region=us-central1 `
    --root-password=ROOT_PASSWORD_AQUI
```

### Opción B: Vía Console
1. Ir a: https://console.cloud.google.com/sql
2. Click "Crear instancia" → "Elegir PostgreSQL"
3. Nombre: unt-postgres-prod
4. Versión: PostgreSQL 15
5. Seleccionar región: us-central1
6. Seleccionar tier: db-f1-micro (gratuito)

### Crear usuario en BD:
```powershell
gcloud sql users create unt_prod_user `
    --instance=unt-postgres-prod `
    --password=DB_PASSWORD_AQUI
```

### Crear base de datos:
```powershell
gcloud sql databases create unt_practicas_tesis_prod `
    --instance=unt-postgres-prod
```

---

## Paso 6: Crear Redis (Memorystore)

### Opción A: Vía comando
```powershell
gcloud redis instances create unt-redis-prod `
    --size=2 `
    --region=us-central1 `
    --redis-version=7.0
```

### Opción B: Vía Console
1. Ir a: https://console.cloud.google.com/memorystore/redis
2. Click "Crear instancia"
3. Nombre: unt-redis-prod
4. Versión Redis: 7.0
5. Capacidad: 2GB (mínimo para Always Free Tier)
6. Región: us-central1
7. Tier: Basic (sin HA)
8. Crear

---

## Paso 7: Configurar .env.prod

Obter valores de GCP:
```powershell
# IP de Cloud SQL
gcloud sql instances describe unt-postgres-prod --format="value(ipAddresses[0].ipAddress)"

# Host de Redis
gcloud redis instances describe unt-redis-prod --region=us-central1 --format="value(host)"
```

Editar `.env.prod`:
```
# BASE DE DATOS
DB_HOST=<IP_DE_CLOUD_SQL>
DB_PORT=5432
DB_USER=unt_prod_user
DB_PASSWORD=<TU_PASSWORD_AQUI>
DB_NAME=unt_practicas_tesis_prod

# REDIS
REDIS_URL=redis://<REDIS_HOST>:6379
REDIS_PASSWORD=default

# JWT SECRETS (Genera valores aleatorios seguros)
JWT_SECRET=GENERA_UN_STRING_ALEATORIO_DE_32_CARACTERES
JWT_REFRESH_SECRET=GENERA_OTRO_STRING_ALEATORIO_DE_32_CARACTERES

# URLs (después del primer deploy, actualiza con URLs reales)
API_URL=https://unt-backend-prod.a.run.app
FRONTEND_URL=https://unt-frontend-prod.a.run.app
NEXT_PUBLIC_API_URL=https://unt-backend-prod.a.run.app
```

---

## Paso 8: Desplegar Backend

```powershell
gcloud run deploy unt-backend-prod `
    --source backend `
    --region us-central1 `
    --platform managed `
    --dockerfile Dockerfile.prod `
    --memory 1Gi `
    --cpu 2 `
    --timeout 3600 `
    --allow-unauthenticated `
    --env-vars-file .env.prod
```

Esto tardará 3-5 minutos. Anota la URL del servicio.

---

## Paso 9: Desplegar Frontend

```powershell
gcloud run deploy unt-frontend-prod `
    --source frontend `
    --region us-central1 `
    --platform managed `
    --dockerfile Dockerfile.prod `
    --memory 512Mi `
    --cpu 1 `
    --allow-unauthenticated `
    --env-vars-file .env.prod
```

---

## Paso 10: Verificar Deployments

```powershell
# Ver servicios desplegados
gcloud run services list

# Ver URL de backend
gcloud run services describe unt-backend-prod --region us-central1 --format='value(status.url)'

# Ver URL de frontend
gcloud run services describe unt-frontend-prod --region us-central1 --format='value(status.url)'

# Ver logs de backend
gcloud run services logs read unt-backend-prod --region us-central1 --limit 50

# Monitorear logs en tiempo real
gcloud run services logs read unt-backend-prod --region us-central1 --follow
```

---

## Troubleshooting

### Error: "Cloud SQL connection refused"
- Solución: Verificar que la IP del backend está autorizada en Cloud SQL
  ```powershell
  gcloud sql instances patch unt-postgres-prod `
      --require-ssl=false `
      --allowed-networks=0.0.0.0/0
  ```

### Error: "Redis connection timeout"
- Solución: Verificar que Cloud Run está en la misma VPC que Redis
- Ir a: Cloud SQL → unt-postgres-prod → Conexiones → Cloud SQL Auth proxy

### Error: "npm ERR! code E401 Unauthorized"
- Solución: Si tu código instalas paquetes privados, configura .npmrc

### Deploy muy lento
- Verificar logs: `gcloud run services logs read unt-backend-prod --region us-central1 --follow`
- Aumentar timeout en gcloud run deploy: `--timeout 3600`

---

## Costos

- Cloud Run: **Gratuito** para los primeros 2M de solicitudes/mes
- Cloud SQL (db-f1-micro): Gratuito con Always Free Tier
- Memorystore Redis: **$0.05/GB/hora** (~$35/mes) - ⚠️ NO GRATIS

**Total aproximado**: 
- Con Everything Free Tier (Oracle Cloud): **$0**
- Con GCP: **$25-40/mes** por Redis

---

## Alternativa: Usar Oracle Cloud (TOTALMENTE GRATIS)

Si quieres completamente gratis:
- Cloud Compute: 2 VMs Always Free
- MySQL Database: Always Free
- Load Balancer: Always Free
- Storage: 200GB Always Free

Ver archivo: `ORACLE_QUICK_START.md`

---

## Próximos Pasos

1. ✓ Instalar Google Cloud SDK
2. ✓ Autenticarse
3. ✓ Crear Cloud SQL
4. ✓ Crear Redis (o usar Oracle)
5. ✓ Desplegar Backend
6. ✓ Desplegar Frontend
7. Mapear dominio personalizado (opcional)
8. Configurar CI/CD con Cloud Build
