# 🌐 Guía Completa de Deployment en la Nube

## 📋 Índice

1. [Preparación Inicial](#preparación-inicial)
2. [Diferencias Local vs Cloud](#diferencias-local-vs-cloud)
3. [Plataformas Cloud Soportadas](#plataformas-cloud-soportadas)
4. [Deployment por Plataforma](#deployment-por-plataforma)
5. [Monitoreo y Mantenimiento](#monitoreo-y-mantenimiento)
6. [Troubleshooting](#troubleshooting)

---

## 🚀 Preparación Inicial

### Paso 1: Ejecutar Script de Preparación

**Windows:**
```powershell
.\scripts\prepare-cloud-deployment.bat
```

**Linux/macOS:**
```bash
chmod +x scripts/prepare-cloud-deployment.sh
./scripts/prepare-cloud-deployment.sh
```

### Paso 2: Configurar Variables de Entorno de Producción

El script crea un archivo `.env.prod` basado en `.env.prod.example`. **ESTE ES MÁS IMPORTANTE QUE TODO:**

```bash
# Copiar el archivo ejemplo
cp .env.prod.example .env.prod

# EDITAR Y CAMBIAR TODOS LOS VALORES:
nano .env.prod
# O en Windows:
notepad .env.prod
```

**Variables críticas que DEBES cambiar:**
- `DB_PASSWORD` - Contraseña super fuerte (mínimo 32 caracteres)
- `JWT_SECRET` - Llave secreta única (mínimo 32 caracteres, caracteres aleatorios)
- `JWT_REFRESH_SECRET` - Otra llave secreta diferente
- `REDIS_PASSWORD` - Contraseña para Redis
- `API_URL` - URL del dominio del API en producción
- `FRONTEND_URL` - URL del dominio del frontend

### Paso 3: Preparar Certificados SSL/TLS

```bash
# Crear directorio para certificados
mkdir -p nginx/ssl

# Opción A: Usar Let's Encrypt (Recomendado)
# Esto se hace típicamente en el servidor después del deployment

# Opción B: Generar self-signed para testing (NO USAR EN PRODUCCIÓN)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem
```

### Paso 4: Verificar Estructura de Archivos

Después de ejecutar el script, deberías tener:

```
unt-practicas-tesis/
├── docker-compose.prod.yml       ✓ Configuración de producción
├── .env.prod                      ✓ Variables secretas (NO COMMITAR)
├── .env.prod.example              ✓ Template para referencias
├── backend/
│   ├── Dockerfile.prod            ✓ Build optimizado para producción
│   └── ...
├── frontend/
│   ├── Dockerfile.prod            ✓ Build optimizado para producción
│   └── ...
├── nginx/
│   ├── nginx.conf                 ✓ Configuración del proxy inverso
│   ├── ssl/                       ✓ Certificados (si aplica)
│   └── conf.d/
└── scripts/
    └── deploy/
        ├── aws-deploy.sh
        ├── gcp-deploy.sh
        ├── azure-deploy.sh
        └── digitalocean-deploy.sh
```

---

## 🔄 Diferencias Local vs Cloud

| Aspecto | Local | Cloud |
|---------|-------|-------|
| **Docker Compose** | `docker-compose.yml` | `docker-compose.prod.yml` |
| **Secretos** | `.env` (desarrollo) | `.env.prod` (NUNCA commitar) |
| **Base Datos** | Container local (puerto 5433) | Servicio administrado (RDS/Cloud SQL/etc) |
| **Redis** | Container local (puerto 6379) | Servicio administrado (ElastiCache/Memorystore/etc) |
| **Reverse Proxy** | Nginx (opcional en local) | Nginx (REQUERIDO) |
| **Certificados SSL** | Auto-generados/ignorados | Let's Encrypt / comercial |
| **Logs** | stdout / archivos locales | Centralizados (CloudWatch/Stackdriver/etc) |
| **Backups DB** | Manual / desarrollador | Automático / diario |
| **Escalado** | No necesario | Horizontal (load balancers) |

**Punto crítico:** El `.env.prod` NO debe estar en Git. Úsalo localmente o via secrets management.

---

## 🌥️ Plataformas Cloud Soportadas

### 1. AWS (Amazon Web Services)
- **Mejor para:** Escalabilidad, opciones avanzadas
- **Servicios:** ECS, RDS, ElastiCache, ALB
- **Complejidad:** Media-Alta

### 2. Google Cloud Platform (GCP)
- **Mejor para:** Facilidad de uso, integraciones Google
- **Servicios:** Cloud Run, Cloud SQL, Memorystore
- **Complejidad:** Baja-Media

### 3. Azure
- **Mejor para:** Integración Microsoft, empresas
- **Servicios:** App Service, Azure Database, Azure Cache
- **Complejidad:** Media

### 4. DigitalOcean
- **Mejor para:** Startups, costos predecibles
- **Servicios:** App Platform, Managed Databases
- **Complejidad:** Baja

### 5. Heroku (Deprecado, pero aún funciona)
- **Mejor para:** Prototipos rápidos
- **Servicios:** Dyos, Postgres, Redis add-ons
- **Complejidad:** Muy Baja

---

## 🚀 Deployment por Plataforma

### A. Google Cloud Run (Recomendado para empezar)

**Ventajas:** Simple, serverless, costo bajo para comenzar

#### 1. Instalación previa
```bash
# Instalar gcloud CLI
# https://cloud.google.com/sdk/docs/install

# Autenticar
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

#### 2. Preparar el deployment
```bash
# Crear un proyecto en GCP si no existe
gcloud projects create unt-practicas --name="UNT Prácticas y Tesis"
gcloud config set project unt-practicas

# Habilitar APIs necesarias
gcloud services enable run.googleapis.com sql.googleapis.com \
    memorystore.googleapis.com containerregistry.googleapis.com
```

#### 3. Crear base de datos administrada
```bash
# Crear instancia Cloud SQL
gcloud sql instances create unt-postgres-prod \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=us-central1

# Crear base de datos
gcloud sql databases create unt_practicas_tesis \
    --instance=unt-postgres-prod

# Crear usuario
gcloud sql users create unt_prod_user \
    --instance=unt-postgres-prod \
    --password
```

#### 4. Crear Memorystore Redis
```bash
gcloud redis instances create unt-redis-prod \
    --size=2 \
    --region=us-central1 \
    --tier=basic
```

#### 5. Actualizar .env.prod con credenciales cloud
```bash
# Obtener host de Cloud SQL (IP privada o pública)
gcloud sql instances describe unt-postgres-prod

# Obtener host de Redis
gcloud redis instances describe unt-redis-prod

# Actualizar .env.prod con estos valores
nano .env.prod
```

#### 6. Desplegar con Cloud Run
```bash
# Backend
gcloud run deploy unt-backend-prod \
    --source backend \
    --platform managed \
    --region us-central1 \
    --dockerfile Dockerfile.prod \
    --env-vars-file .env.prod \
    --memory 1Gi \
    --cpu 2 \
    --timeout 3600 \
    --allow-unauthenticated

# Frontend
gcloud run deploy unt-frontend-prod \
    --source frontend \
    --platform managed \
    --region us-central1 \
    --dockerfile Dockerfile.prod \
    --env-vars-file .env.prod \
    --memory 512Mi \
    --cpu 1 \
    --allow-unauthenticated
```

#### 7. Configurar dominio personalizado
```bash
# Mapear dominio a Cloud Run
gcloud run services update-traffic unt-backend-prod --to-latest
gcloud run services update-traffic unt-frontend-prod --to-latest

# Ver URLs
gcloud run services describe unt-backend-prod
gcloud run services describe unt-frontend-prod
```

---

### B. AWS ECS (Elastic Container Service)

#### 1. Instalación previa
```bash
# Instalar AWS CLI
# https://aws.amazon.com/cli/

# Configurar credenciales
aws configure
```

#### 2. Crear repositorio ECR
```bash
# Crear registro para images
aws ecr create-repository --repository-name unt-backend --region us-east-1
aws ecr create-repository --repository-name unt-frontend --region us-east-1

# Obtener login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
```

#### 3. Build y push de imágenes
```bash
# Backend
docker build -f backend/Dockerfile.prod \
    -t YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/unt-backend:latest \
    backend/

docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/unt-backend:latest

# Frontend
docker build -f frontend/Dockerfile.prod \
    -t YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/unt-frontend:latest \
    frontend/

docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/unt-frontend:latest
```

#### 4. Crear RDS Database
```bash
# Crear instancia PostgreSQL RDS
aws rds create-db-instance \
    --db-instance-identifier unt-postgres-prod \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --engine-version 15 \
    --master-username unt_prod_user \
    --master-user-password YOUR_STRONG_PASSWORD \
    --allocated-storage 20 \
    --storage-type gp2 \
    --backup-retention-period 30 \
    --multi-az
```

#### 5. Crear ECS Cluster
```bash
# Crear cluster
aws ecs create-cluster --cluster-name unt-practicas-cluster

# Crear task definition (archivo JSON)
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json
```

#### 6. Crear servicio ECS
```bash
aws ecs create-service \
    --cluster unt-practicas-cluster \
    --service-name unt-app-service \
    --task-definition unt-app:1 \
    --desired-count 2 \
    --launch-type FARGATE
```

---

### C. DigitalOcean App Platform (Más simple)

#### 1. Setup
```bash
# Instalar doctl CLI
# https://docs.digitalocean.com/reference/doctl/

doctl auth init
```

#### 2. Crear app.yaml
```yaml
name: unt-practicas-tesis

services:
- name: backend
  github:
    branch: main
    repo: YOUR_ORG/unt-practicas-tesis
  build_command: npm run build
  run_command: npm run start:prod
  source_dir: backend
  envs:
  - key: NODE_ENV
    scope: RUN_AND_BUILD_TIME
    value: production
  - key: DB_HOST
    scope: RUN_AND_BUILD_TIME
    value: ${db.hostname}
  - key: REDIS_URL
    scope: RUN_AND_BUILD_TIME
    value: redis://${redis.hostname}:6379
  http_port: 3000
  health_check:
    http_path: /health

- name: frontend
  github:
    branch: main
    repo: YOUR_ORG/unt-practicas-tesis
  build_command: npm run build
  run_command: npm run start
  source_dir: frontend
  envs:
  - key: NODE_ENV
    scope: RUN_AND_BUILD_TIME
    value: production
  - key: NEXT_PUBLIC_API_URL
    scope: RUN_AND_BUILD_TIME
    value: https://${backend.ondigitalocean.app}
  http_port: 3000

databases:
- name: db
  engine: PG
  version: "15"
  production: true

- name: redis
  engine: REDIS
  version: "7"
  production: true

domains:
- domain: yourdomain.com
  type: PRIMARY
  routes:
  - path: /api
    service: backend
  - path: /
    service: frontend
```

#### 3. Deploy
```bash
# Crear la app
doctl apps create --spec app.yaml

# O actualizar si ya existe
doctl apps update YOUR_APP_ID --spec app.yaml

# Ver estado
doctl apps list
doctl apps get YOUR_APP_ID
```

---

## 📊 Monitoreo y Mantenimiento

### Logs

**Google Cloud Run:**
```bash
gcloud run services logs read unt-backend-prod --region us-central1 --limit 50
```

**AWS CloudWatch:**
```bash
aws logs tail /ecs/unt-app-service --follow
```

**DigitalOcean:**
```bash
# Ver en Dashboard o:
doctl apps logs list YOUR_APP_ID
```

### Alertas

Configurar alertas para:
- Errores en logs (5xx)
- CPU > 80%
- Memoria > 85%
- Base de datos sin respuesta
- Redis sin respuesta

### Backups

**Automatizar backups de BD:**

```bash
# AWS RDS (automático, configurable)
aws rds modify-db-instance \
    --db-instance-identifier unt-postgres-prod \
    --backup-retention-period 30

# Google Cloud SQL (automático)
gcloud sql backups create \
    --instance unt-postgres-prod \
    --description "Daily backup"
```

### Escalado

Para manejar más usuarios:

1. **Aumentar recursos:**
   - CPU/Memoria del backend
   - Conexiones a BD
   - Redis memory

2. **Agregar réplicas:**
   - Cloud Run: Aumentar min/max instances
   - ECS: Aumentar desired count
   - App Platform: Increase instance count

3. **CDN para frontend:**
   - Usar CloudFront (AWS)
   - Cloud CDN (GCP)
   - Azure CDN

---

## 🔍 Troubleshooting

### Problema: Errores de conexión a BD

```bash
# Verificar que la BD está corriendo
# GCP:
gcloud sql instances describe unt-postgres-prod

# Verificar credenciales en .env.prod
grep DB_ .env.prod

# Conectarse directamente a la BD para debug
psql -h DBHOST -U unt_prod_user -d unt_practicas_tesis
```

### Problema: Redis no responde

```bash
# Verificar Redis está corriendo
# GCP:
gcloud redis instances describe unt-redis-prod

# Limpiar cache y reiniciar backend
gcloud run services update unt-backend-prod --update-env-vars REDIS_RESET=true
```

### Problema: Frontend no conecta al API

```bash
# Verificar URL del API en .env.prod
grep NEXT_PUBLIC_API_URL .env.prod

# Verificar CORS en backend
# Backend debe aceptar requests desde FRONTEND_URL

# Verificar certificados SSL
curl -I https://api.yourdomain.com/health
```

### Problema: Base de datos llena

```bash
# GCP Cloud SQL
gcloud sql instances patch unt-postgres-prod --backup-configuration-enabled=true

# Aumentar storage
aws rds modify-db-instance --db-instance-identifier unt-postgres-prod \
    --allocated-storage 100 --apply-immediately
```

---

## 📋 Checklist de Deploy

- [ ] `.env.prod` creado y con valores seguros
- [ ] Certificados SSL/TLS configurados
- [ ] Base de datos cloud creada y accesible
- [ ] Redis/Cache configurado
- [ ] Imágenes Docker creadas con Dockerfile.prod
- [ ] Imágenes subidas al registro (ECR, GCR, etc)
- [ ] Variables de entorno configuradas en plataforma cloud
- [ ] Health checks configurados
- [ ] Logs centralizados configurados
- [ ] Alertas configuradas
- [ ] Backups automatizados
- [ ] Dominio personalizado mapeado
- [ ] SSL/HTTPS verificado
- [ ] CORS configurado correctamente
- [ ] Test de login exitoso

---

## 🔐 Seguridad

1. **Secretos seguros:**
   - Usar AWS Secrets Manager / GCP Secret Manager
   - Nunca comitear `.env.prod`
   - Rotar secretos cada 90 días

2. **Base de datos:**
   - Backups automáticos diarios
   - Encriptación en tránsito (SSL)
   - Encriptación en reposo
   - Restricción de IP si es posible

3. **Red:**
   - WAF (Web Application Firewall)
   - Rate limiting en Nginx
   - DDoS protection

4. **Certificados:**
   - Let's Encrypt (auto-renovación)
   - Monitorear expiración

---

## 💰 Estimación de Costos

### Google Cloud (USD/mes)
- Cloud SQL (db-f1-micro): ~$10
- Cloud Run (backend): ~$5-20
- Cloud Run (frontend): ~$2-10
- Memorystore Redis: ~$10
- Total: ~$27-50

### AWS (USD/mes)
- RDS (db.t3.micro): ~$25
- ECS Fargate: ~$20-40
- ElastiCache (cache.t3.micro): ~$15
- Total: ~$60-80

### DigitalOcean (USD/mes)
- App Platform (2 containers): ~$12-50
- Managed Database: ~$12
- Redis: ~$12
- Total: ~$36-74

---

## 📚 Recursos Útiles

- [Google Cloud Run Docs](https://cloud.google.com/run/docs)
- [AWS ECS Docs](https://docs.aws.amazon.com/ecs/)
- [Azure App Service Docs](https://learn.microsoft.com/en-us/azure/app-service/)
- [DigitalOcean App Platform](https://www.digitalocean.com/products/app-platform)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [NGINX Documentation](https://nginx.org/en/docs/)
