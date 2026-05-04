# 🚀 Google Cloud Run - Guía Completa

## 📋 Pre-requisitos

✅ Necesitas:
- Cuenta Google Cloud con billing habilitado (prueba $300)
- `gcloud` CLI instalado
- Proyecto en GitHub (público o con acceso)
- `docker` instalado localmente

## 🎯 Paso 1: Configurar Google Cloud CLI

### 1.1: Instalar gcloud

**Windows:**
```powershell
# Descargar installer desde:
# https://cloud.google.com/sdk/docs/install

# O usar Chocolatey:
choco install google-cloud-sdk
```

**Linux/Mac:**
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

### 1.2: Autenticarse

```bash
# Login
gcloud auth login

# Seleccionar proyecto
gcloud projects list
gcloud config set project YOUR_PROJECT_ID
```

### 1.3: Habilitar APIs

```bash
# Habilitar Cloud Run
gcloud services enable run.googleapis.com

# Habilitar Cloud SQL
gcloud services enable sqladmin.googleapis.com

# Habilitar Memorystore
gcloud services enable redis.googleapis.com

# Habilitar Container Registry
gcloud services enable containerregistry.googleapis.com

# Habilitar Cloud Build
gcloud services enable cloudbuild.googleapis.com
```

---

## 🗄️ Paso 2: Crear Base de Datos (Cloud SQL)

### 2.1: Crear instancia PostgreSQL

```bash
# Crear instancia
gcloud sql instances create unt-postgres-prod \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=us-central1 \
    --backup \
    --backup-start-time=03:00

# Esperar 2-3 minutos hasta que esté lista
# Verificar estado:
gcloud sql instances describe unt-postgres-prod
```

### 2.2: Obtener IP y configurar acceso

```bash
# Obtener IP pública (si la necesitas)
gcloud sql instances describe unt-postgres-prod --format="value(ipAddresses[0].ipAddress)"

# Crear usuario
gcloud sql users create unt_prod_user \
    --instance=unt-postgres-prod \
    --password

# Crear base de datos
gcloud sql databases create unt_practicas_tesis \
    --instance=unt-postgres-prod

# Darle permisos
gcloud sql users set-password unt_prod_user \
    --instance=unt-postgres-prod \
    --password="TU_CONTRASEÑA_SUPER_SEGURA"
```

### 2.3: Verificar conectividad

```bash
# Obtener IP
DB_IP=$(gcloud sql instances describe unt-postgres-prod \
    --format="value(ipAddresses[0].ipAddress)")

echo "DB IP: $DB_IP"

# Agregar IP de Cloud Run a IP Whitelist (después)
```

---

## 🔴 Paso 3: Crear Redis (Memorystore)

### 3.1: Crear instancia Redis

```bash
# Crear Redis
gcloud redis instances create unt-redis-prod \
    --size=2 \
    --region=us-central1 \
    --redis-version=7.0 \
    --tier=basic

# Esperar a que esté ready
gcloud redis instances describe unt-redis-prod --region=us-central1
```

### 3.2: Obtener detalles de conexión

```bash
# Obtener host y port
gcloud redis instances describe unt-redis-prod \
    --region=us-central1 \
    --format="value(host, port)"
```

---

## 🐳 Paso 4: Preparar y Verificar Dockerfiles

### 4.1: Verificar archivos existen

```bash
# Verificar Dockerfiles.prod existen
ls -la backend/Dockerfile.prod
ls -la frontend/Dockerfile.prod

# Verificar docker-compose.prod.yml
ls -la docker-compose.prod.yml
```

### 4.2: Testear builds localmente (Opcional pero recomendado)

```bash
# Backend
docker build -f backend/Dockerfile.prod \
    -t unt-backend-local:latest \
    --build-arg NODE_ENV=production \
    ./backend

# Frontend
docker build -f frontend/Dockerfile.prod \
    -t unt-frontend-local:latest \
    --build-arg NODE_ENV=production \
    --build-arg NEXT_PUBLIC_API_URL=http://localhost:3000 \
    ./frontend

# Probar si ambos builds funcionan sin errores
docker images | grep unt
```

---

## 📝 Paso 5: Configurar Variables de Entorno

### 5.1: Actualizar .env.prod con valores GCP

```bash
# Editar .env.prod
nano .env.prod

# Cambiar estos valores CON TUS DATOS GCP:
DB_HOST=<IP-DE-CLOUD-SQL>
DB_USER=unt_prod_user
DB_PASSWORD=<LA-QUE-GENERASTE>
DB_PORT=5432
DB_NAME=unt_practicas_tesis

REDIS_URL=redis://<REDIS-HOST>:6379
REDIS_PASSWORD=<SI-TIENE>

API_URL=https://unt-backend-prod-XXXX.a.run.app
FRONTEND_URL=https://unt-frontend-prod-XXXX.a.run.app

JWT_SECRET=<MANTÉN-EL-ACTUAL-O-GENERA-UNO-NUEVO>
JWT_REFRESH_SECRET=<OTRO-SECRETO-SEGURO>
```

### 5.2: Guardar .env.prod SEGURO

```bash
# NUNCA comitear .env.prod
# Ya está en .gitignore

# Guardar en lugar seguro:
# - 1Password
# - LastPass
# - Google Secret Manager (mejor)
```

---

## ☁️ Paso 6: Push a GitHub y Configurar Cloud Build

### 6.1: Push del código

```bash
# Verificar que todo está listo
git status

# NO debe mostrar .env.prod
git add .
git commit -m "Prepare for Google Cloud Run deployment"
git push origin main
```

### 6.2: Conectar GitHub a Cloud Build

```bash
# Opción 1: Via Console UI
# 1. Ir a https://console.cloud.google.com/cloud-build/repositories
# 2. Conectar repositorio GitHub
# 3. Autorizar acceso

# Opción 2: Via CLI
gcloud builds connect --repository-name=tu-repo --repository-owner=tu-usuario
```

---

## 🚀 Paso 7: Crear Secrets en Secret Manager

### 7.1: Crear secretos en GCP

```bash
# Backend secrets
echo -n "GCP_PROJECT_ID" | gcloud secrets create backend-db-host --data-file=-
echo -n "unt_prod_user" | gcloud secrets create backend-db-user --data-file=-
echo -n "TU_PASSWORD" | gcloud secrets create backend-db-password --data-file=-

# Frontend secrets
echo -n "https://unt-backend-prod-XXX.a.run.app" | gcloud secrets create frontend-api-url --data-file=-
```

---

## 🎬 Paso 8: Deploy a Cloud Run (Opción Simple)

### 8.1: Deploy Backend Directamente

```bash
# Build y deploy en un comando
gcloud run deploy unt-backend-prod \
    --source backend \
    --region us-central1 \
    --platform managed \
    --dockerfile Dockerfile.prod \
    --memory 1Gi \
    --cpu 2 \
    --timeout 3600 \
    --allow-unauthenticated \
    --env-vars-file .env.prod
```

### 8.2: Deploy Frontend

```bash
gcloud run deploy unt-frontend-prod \
    --source frontend \
    --region us-central1 \
    --platform managed \
    --dockerfile Dockerfile.prod \
    --memory 512Mi \
    --cpu 1 \
    --allow-unauthenticated \
    --env-vars-file .env.prod
```

---

## 🔗 Paso 9: Obtener URLs y Configurar Dominio

### 9.1: Obtener URLs de Cloud Run

```bash
# Backend URL
gcloud run services describe unt-backend-prod \
    --region us-central1 \
    --format="value(status.url)"

# Frontend URL
gcloud run services describe unt-frontend-prod \
    --region us-central1 \
    --format="value(status.url)"
```

### 9.2: Mapear dominio personalizado

```bash
# Opción 1: Usar dominio GCP
gcloud run domain-mappings create \
    --service=unt-backend-prod \
    --domain=api.tudominio.com \
    --region=us-central1

# Opción 2: En Cloud Run Console
# Ir a Cloud Run → Nombre servicio → Gestionar dominios personalizados
```

---

## 📊 Paso 10: Verificación

### 10.1: Probar endpoints

```bash
# Backend health check
curl https://unt-backend-prod-XXX.a.run.app/health

# Frontend
curl https://unt-frontend-prod-XXX.a.run.app

# Con dominio personalizado:
curl https://api.tudominio.com/health
curl https://tudominio.com
```

### 10.2: Ver logs

```bash
# Backend logs
gcloud run services logs read unt-backend-prod \
    --region us-central1 \
    --limit 50

# Frontend logs
gcloud run services logs read unt-frontend-prod \
    --region us-central1 \
    --limit 50

# O en tiempo real:
gcloud run services logs read unt-backend-prod \
    --region us-central1 \
    --follow
```

---

## 🔐 Paso 11: Configurar CORS y Security

### 11.1: Permitir requests desde frontend

En tu backend (`src/main.ts`):

```typescript
app.enableCors({
  origin: [
    'https://unt-frontend-prod-XXX.a.run.app',
    'https://tudominio.com',
    'http://localhost:3001' // Desarrollo
  ],
  credentials: true,
});
```

### 11.2: Configurar headers de seguridad

Ya está en `nginx.conf`, pero si usas Cloud Run directamente:

En backend (`src/main.ts`):
```typescript
// Agregar security headers
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});
```

---

## 🔄 Paso 12: Setup de CI/CD Automático (Opcional)

### 12.1: Usar Cloud Build automatizado

```yaml
# El archivo cloudbuild.yaml ya está creado
# Simplemente hacer push para que Cloud Build depliegue automáticamente
```

### 12.2: Verifica que se dispara automáticamente

```bash
# Ver builds
gcloud builds list

# Ver logs de build específico
gcloud builds log BUILD_ID
```

---

## 📊 Costo Estimado

| Servicio | Free Tier | Estimado/mes |
|----------|-----------|--------------|
| Cloud Run | 2M requests/mes | $0-20 |
| Cloud SQL db.f1-micro | 1 instancia | ~$10 |
| Memorystore Redis | 1GB | ~$5-10 |
| **TOTAL** | | **$15-40/mes** |

Con $300 créditos iniciales = ~8-20 meses gratis

---

## 🆘 Troubleshooting

### Error: "Cannot find .env.prod"

```bash
# Crear desde template
cp .env.prod.example .env.prod

# Editar valores
nano .env.prod
```

### Error: "Permission denied for project"

```bash
# Verificar usuario autenticado
gcloud auth list

# Re-autenticar si es necesario
gcloud auth login
```

### Error: "Cloud SQL connection refused"

```bash
# Verificar que Cloud SQL está corriendo
gcloud sql instances describe unt-postgres-prod

# Verificar firewall (agregar IP de Cloud Run)
gcloud sql instances patch unt-postgres-prod \
    --allowed-networks=CLOUD_RUN_IP
```

### Error: "Redis connection refused"

```bash
# Verificar Redis está corriendo
gcloud redis instances describe unt-redis-prod \
    --region=us-central1

# Verificar que es accesible desde Cloud Run
# (debe estar en misma VPC o permitir acceso)
```

---

## ✅ Checklist Final

- [ ] gcloud CLI instalado y autenticado
- [ ] APIs habilitadas (Cloud Run, SQL, Redis)
- [ ] Cloud SQL PostgreSQL creada
- [ ] Redis Memorystore creada
- [ ] .env.prod configurado con valores GCP
- [ ] .env.prod en .gitignore (no commiteado)
- [ ] Dockerfiles.prod verificados
- [ ] Código pusheado a GitHub
- [ ] GitHub conectado a Cloud Build
- [ ] Cloud Run deployments funcionales
- [ ] URLs obtenidas y verificadas
- [ ] Dominio personalizado mapeado (opcional)
- [ ] CORS configurado
- [ ] Health checks pasando
- [ ] Logs sin errores

---

## 🎉 ¡Listo!

Tu app está en producción en Google Cloud Run. Ahora:

1. Monitor logs regularmente
2. Configura alertas
3. Planifica backups de BD
4. Configura auto-scaling si es necesario

**Documentación oficial:** https://cloud.google.com/run/docs
