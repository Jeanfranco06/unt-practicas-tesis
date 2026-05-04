# PLAN DE EJECUCIÓN PARA DEPLOYMENT EN GOOGLE CLOUD RUN

## Estado Actual ✓

Todo está preparado para desplegar tu aplicación en Google Cloud Run:

- ✓ Dockerfiles de producción (Backend y Frontend)
- ✓ Docker Compose para testing local
- ✓ Archivos de configuración completados
- ✓ Scripts de automation listos
- ✓ Documentación disponible
- ✓ Código en GitHub sincronizado

---

## PASOS A SEGUIR (En Orden)

### FASE 1: Instalar Google Cloud SDK (5-10 min)

**[1] Descargar Google Cloud SDK**
- Ir a: https://cloud.google.com/sdk/docs/install
- Descargar versión para Windows
- Ejecutar instalador: `GoogleCloudSDKInstaller.exe`
- Aceptar términos y dejar configuración por defecto
- Reinicia tu terminal después

**[2] Verificar instalación**
```powershell
gcloud --version
```
Debería mostrar algo como: `Google Cloud SDK 487.0.0`

---

### FASE 2: Configurar Google Cloud (10-15 min)

**[3] Iniciar sesión**
```powershell
gcloud auth login
```
Se abrirá un navegador. Inicia sesión con tu cuenta de Google.

**[4] Crear proyecto en GCP** (si no tienes uno)
- Ir a: https://console.cloud.google.com/projectcreate
- Nombre: `unt-practicas` (o el que prefieras)
- Click "Crear"
- Esperar a que se cree (unos 30 segundos)

**[5] Configurar proyecto en gcloud**
```powershell
# Reemplaza TU_PROJECT_ID con tu proyecto
gcloud config set project TU_PROJECT_ID

# Verificar
gcloud config get-value project
```

**[6] Habilitar APIs necesarias**
```powershell
gcloud services enable run.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable redis.googleapis.com
gcloud services enable container.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```
Esto puede tardar 1-2 minutos.

---

### FASE 3: Crear Servicios Administrados (15-20 min)

**[7] Crear Cloud SQL (PostgreSQL)**

```powershell
# Reemplaza ROOT_PASSWORD con contraseña segura
gcloud sql instances create unt-postgres-prod `
    --database-version=POSTGRES_15 `
    --tier=db-f1-micro `
    --region=us-central1 `
    --root-password=TU_PASSWORD_SEGURA_AQUI
```

Esto puede tardar 2-3 minutos. Espera a que termine.

**[8] Crear usuario de base de datos**

```powershell
# Reemplaza con la contraseña que quieras para el usuario
gcloud sql users create unt_prod_user `
    --instance=unt-postgres-prod `
    --password=DB_USER_PASSWORD_AQUI
```

**[9] Crear base de datos**

```powershell
gcloud sql databases create unt_practicas_tesis_prod `
    --instance=unt-postgres-prod
```

**[10] Crear Redis (Memorystore)**

```powershell
gcloud redis instances create unt-redis-prod `
    --size=2 `
    --region=us-central1 `
    --redis-version=7.0 `
    --tier=basic
```

Esto puede tardar 3-5 minutos. Este es el paso más lento.

---

### FASE 4: Configurar Aplicación (5 min)

**[11] Obtener valores de GCP**

```powershell
# IP de Cloud SQL (cópiala)
$sqlIP = gcloud sql instances describe unt-postgres-prod --format="value(ipAddresses[0].ipAddress)"
Write-Host "Cloud SQL IP: $sqlIP"

# Host de Redis (cópialo)
$redisHost = gcloud redis instances describe unt-redis-prod --region=us-central1 --format="value(host)"
Write-Host "Redis Host: $redisHost"
```

**[12] Editar archivo `.env.prod`**

Abre el archivo `d:\Proyects\unt-practicas-tesis\.env.prod` en tu editor favorito.

Reemplaza estos valores:

```
# BASE DE DATOS
DB_HOST=<PEGA_LA_IP_DE_CLOUD_SQL_AQUI>
DB_PORT=5432
DB_USER=unt_prod_user
DB_PASSWORD=<LA_PASSWORD_QUE_PUSISTE_ARRIBA>
DB_NAME=unt_practicas_tesis_prod

# REDIS
REDIS_URL=redis://<PEGA_REDIS_HOST_AQUI>:6379
REDIS_PASSWORD=default

# JWT SECRETS (Genera valores aleatorios nuevos)
JWT_SECRET=AQU1_GENERA_STRING_ALEATORIO_DE_32_CARACTERES_MINIMO
JWT_REFRESH_SECRET=OTRO_STRING_ALEATORIO_DIFERENTE_32_CARACTERES

# URLs (después del primer deploy actualiza con URLs reales)
API_URL=https://unt-backend-prod.a.run.app
FRONTEND_URL=https://unt-frontend-prod.a.run.app
NEXT_PUBLIC_API_URL=https://unt-backend-prod.a.run.app
```

Para generar secrets aleatorios seguros, usa:
```powershell
# PowerShell
$bytes = New-Object byte[] 32
$random = [Security.Cryptography.RNGCryptoServiceProvider]::new()
$random.GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

---

### FASE 5: Desplegar en Google Cloud Run (10-15 min)

**[13] Desplegar Backend**

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

Esto tardará 3-5 minutos. Espera a que termine sin cancelar.

Cuando termine, verás algo como:
```
Service [unt-backend-prod] revision [unt-backend-prod-00001-xxx] has been deployed
Service URL: https://unt-backend-prod-xxxxx.a.run.app
```

**Copia esa URL**.

**[14] Actualizar .env.prod con URL del Backend**

Abre `.env.prod` y actualiza:
```
API_URL=https://unt-backend-prod-xxxxx.a.run.app
NEXT_PUBLIC_API_URL=https://unt-backend-prod-xxxxx.a.run.app
```

**[15] Desplegar Frontend**

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

Esto tardará 3-5 minutos.

Cuando termine, verás:
```
Service URL: https://unt-frontend-prod-xxxxx.a.run.app
```

---

### FASE 6: Verificación (5 min)

**[16] Verificar servicios desplegados**

```powershell
# Ver todos los servicios
gcloud run services list

# Ver URL exacta del backend
gcloud run services describe unt-backend-prod --region us-central1 --format='value(status.url)'

# Ver URL exacta del frontend
gcloud run services describe unt-frontend-prod --region us-central1 --format='value(status.url)'
```

**[17] Probar conectividad**

```powershell
# Probar backend (reemplaza con tu URL)
curl https://unt-backend-prod-XXXXX.a.run.app/health

# O en PowerShell
Invoke-WebRequest https://unt-backend-prod-XXXXX.a.run.app/health
```

**[18] Ver logs**

```powershell
# Últimos 50 logs
gcloud run services logs read unt-backend-prod --region us-central1 --limit 50

# Monitorear en tiempo real (Ctrl+C para salir)
gcloud run services logs read unt-backend-prod --region us-central1 --follow
```

---

## SOLUCIÓN RÁPIDA (Si algo falla)

### Error: Cloud SQL no conecta
```powershell
# Permitir conexiones externas
gcloud sql instances patch unt-postgres-prod `
    --require-ssl=false `
    --allowed-networks=0.0.0.0/0
```

### Error: Redis timeout
```powershell
# Verificar que Redis está corriendo
gcloud redis instances describe unt-redis-prod --region us-central1
```

### Error: npm install falla en Docker
- Ya está solucionado (Dockerfile.prod usa `npm ci --unsafe-perm`)

### Ver errores completos
```powershell
gcloud run services logs read unt-backend-prod --region us-central1 --limit 100
```

---

## AUTOMATIZAR TODO (Opcional)

Si tienes WSL o Git Bash instalado:

```bash
# En WSL/Git Bash
bash scripts/deploy/deploy-gcp.sh
```

Este script ejecuta todos los pasos automáticamente si ya tienes gcloud configurado.

---

## COSTOS ESTIMADOS

### Google Cloud Run (Gratuito)
- 2M solicitudes/mes gratis
- 400,000 GB-segundos gratis

### Cloud SQL (db-f1-micro)
- Incluido en Always Free Tier
- ✓ GRATUITO

### Memorystore Redis (2GB)
- $0.05/GB/hora = ~$36/mes
- ⚠️ NO GRATUITO (considera Oracle Cloud si quieres gratis)

### TOTAL ESTIMADO
- $35-40/mes por Redis
- O $0 si usas Oracle Cloud

---

## ALTERNATIVA: Oracle Cloud (TOTALMENTE GRATIS)

Si no quieres pagar por Redis, considera Oracle Cloud:

Ver: `ORACLE_QUICK_START.md`

Beneficios:
- Totalmente gratis (Always Free Tier)
- Sin límite de tiempo
- Incluye 2 VMs, MySQL, Load Balancer, 200GB storage

---

## PRÓXIMOS PASOS AVANZADOS (Opcional)

1. **Mapear dominio personalizado**
   ```powershell
   gcloud run services update unt-frontend-prod `
       --region us-central1 `
       --platform managed `
       --set-cloudsql-instances=PROJECT:us-central1:unt-postgres-prod
   ```

2. **Configurar CI/CD con Cloud Build**
   Ver: `cloudbuild.yaml` en el repositorio

3. **Habilitar CORS si hay problemas**
   Editar backend para permitir tu dominio frontend

4. **Configurar SSL personalizado**
   Google Cloud Run proporciona HTTPS automático

---

## CHECKLIST DE COMPLETITUD

### Pre-Deployment ✓
- [x] Dockerfiles de producción listos
- [x] Variables de entorno configuradas
- [x] Código en GitHub

### Deployment
- [ ] Google Cloud SDK instalado
- [ ] Autenticado en Google Cloud
- [ ] Proyecto creado y configurado
- [ ] APIs habilitadas
- [ ] Cloud SQL creado
- [ ] Redis creado
- [ ] .env.prod completo con valores reales
- [ ] Backend desplegado
- [ ] Frontend desplegado
- [ ] Servicios verificados y accesibles

### Post-Deployment
- [ ] Monitorear logs
- [ ] Probar endpoints
- [ ] Configurar dominio (opcional)
- [ ] Configurar backups

---

## TIEMPO TOTAL ESTIMADO

| Fase | Tiempo |
|------|--------|
| Instalar SDK | 5-10 min |
| Configurar GCP | 10-15 min |
| Crear servicios | 15-20 min |
| Configurar app | 5 min |
| Desplegar | 10-15 min |
| Verificar | 5 min |
| **TOTAL** | **~60 minutos** |

---

## ¿NECESITAS AYUDA?

Si algo no funciona:

1. Revisa los logs: `gcloud run services logs read unt-backend-prod --region us-central1`
2. Verifica .env.prod esté correcto
3. Asegúrate que Cloud SQL y Redis estén disponibles
4. Reinicia los servicios en Google Cloud Console

¡Éxito con tu deployment! 🚀
