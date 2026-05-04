# Diagrama de Arquitectura: Local vs Cloud

## 🏠 Arquitectura LOCAL (Sin cambios)

```
┌─────────────────────────────────────────────────────┐
│            DESARROLLO LOCAL                         │
│    (docker-compose.yml - SIN CAMBIOS)               │
└─────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────┐
    │      Tu Computadora (Docker Desktop)        │
    │                                             │
    │  ┌──────────────────────────────────────┐  │
    │  │  Frontend (Next.js)                  │  │
    │  │  http://localhost:3001               │  │
    │  └──────────────────────────────────────┘  │
    │           ↓                                 │
    │  ┌──────────────────────────────────────┐  │
    │  │  Backend (NestJS)                    │  │
    │  │  http://localhost:3000               │  │
    │  └──────────────────────────────────────┘  │
    │           ↓                                 │
    │  ┌──────────────────────────────────────┐  │
    │  │  PostgreSQL                          │  │
    │  │  localhost:5433                      │  │
    │  │  (Volumen: postgres_data)            │  │
    │  └──────────────────────────────────────┘  │
    │                                             │
    │  ┌──────────────────────────────────────┐  │
    │  │  Redis (Cache)                       │  │
    │  │  localhost:6379                      │  │
    │  │  (Volumen: redis_data)               │  │
    │  └──────────────────────────────────────┘  │
    │                                             │
    └─────────────────────────────────────────────┘
```

---

## ☁️ Arquitectura CLOUD (Nuevos archivos - Production Ready)

```
┌──────────────────────────────────────────────────────────────────┐
│                    PRODUCCIÓN EN NUBE                            │
│       (docker-compose.prod.yml - NUEVO ARCHIVO)                 │
└──────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│  DOMINIO PERSONALIZADO: tudominio.com                             │
│                     ↓                                              │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │           NGINX (Reverse Proxy)                           │  │
│  │    - SSL/TLS Termination                                 │  │
│  │    - Rate Limiting (100req/s API)                        │  │
│  │    - Compresión Gzip                                      │  │
│  │    - Headers de Seguridad                                │  │
│  │    - Load Balancing                                       │  │
│  │    - Cache Static Files                                   │  │
│  └────────────────────────────────────────────────────────────┘  │
│       ↙                          ↘                                │
│  ┌──────────────────┐    ┌──────────────────┐                   │
│  │   Frontend       │    │  Backend API     │                   │
│  │  (Next.js)       │    │  (NestJS)        │                   │
│  │  :3000           │    │  :3000           │                   │
│  │  n replicas      │    │  n replicas      │                   │
│  │  auto-scaling    │    │  auto-scaling    │                   │
│  └──────────────────┘    └──────────────────┘                   │
│       ↓                          ↓                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         PostgreSQL (Managed Database)                    │   │
│  │    - Cloud SQL / RDS / Azure Database                    │   │
│  │    - Backups automáticos (diarios)                       │   │
│  │    - Encriptación en reposo                              │   │
│  │    - Replicación para HA                                 │   │
│  │    - Monitoring automático                               │   │
│  └──────────────────────────────────────────────────────────┘   │
│       ↓                                                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         Redis (Managed Cache)                            │   │
│  │    - ElastiCache / Memorystore / Redis Cloud             │   │
│  │    - Auto-failover                                       │   │
│  │    - Persistence                                         │   │
│  │    - Replication                                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  MONITOREO & LOGGING                                     │   │
│  │    - CloudWatch / Stackdriver / Application Insights     │   │
│  │    - Alertas automáticas                                 │   │
│  │    - Dashboards                                          │   │
│  │    - Auditoría                                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo de Deployment

```
Local Development
       ↓
┌──────────────────────────────────┐
│ 1. git push origin main           │
│    (Lo que está en GitHub)        │
└──────────────────────────────────┘
       ↓
┌──────────────────────────────────────────────────┐
│ 2. Plataforma Cloud detecta cambios              │
│    (Cloud Build / GitHub Actions / Webhook)      │
└──────────────────────────────────────────────────┘
       ↓
┌──────────────────────────────────────────────────┐
│ 3. Build Dockerfiles.prod                        │
│    - Backend con Dockerfile.prod                 │
│    - Frontend con Dockerfile.prod                │
└──────────────────────────────────────────────────┘
       ↓
┌──────────────────────────────────────────────────┐
│ 4. Push a Registro (ECR/GCR/ACR)                │
│    - Versioning de imágenes                      │
│    - Caching de layers                           │
└──────────────────────────────────────────────────┘
       ↓
┌──────────────────────────────────────────────────┐
│ 5. Deploy en Cloud Run/ECS/App Platform         │
│    - Usar .env.prod (variables secretas)         │
│    - Conectar a BD administrada                  │
│    - Conectar a Cache administrado               │
└──────────────────────────────────────────────────┘
       ↓
┌──────────────────────────────────────────────────┐
│ 6. Health Checks                                 │
│    - /health endpoint responde 200 OK            │
│    - BD accesible                                │
│    - Cache accesible                             │
└──────────────────────────────────────────────────┘
       ↓
✓ PRODUCTION LIVE
  - Monitorear logs
  - Alertas activas
  - Backups corriendo
```

---

## 📁 Estructura de Archivos Creados

```
unt-practicas-tesis/
│
├── 📄 CLOUD_DEPLOYMENT_GUIDE.md          ← Guía completa (550+ líneas)
├── 📄 QUICK_CLOUD_START.md               ← Guía rápida (5 pasos)
├── 📄 CLOUD_DEPLOYMENT_CHECKLIST.md      ← Checklist completo
│
├── 📋 docker-compose.prod.yml            ← Docker para production
├── 📋 .env.prod.example                  ← Template de variables
│
├── 📂 backend/
│   └── 📄 Dockerfile.prod                ← Build optimizado backend
│
├── 📂 frontend/
│   └── 📄 Dockerfile.prod                ← Build optimizado frontend
│
├── 📂 nginx/
│   ├── 📋 nginx.conf                     ← Reverse proxy & SSL
│   └── 📂 ssl/                           ← Certificados (si aplica)
│
├── 📂 scripts/
│   ├── 📄 prepare-cloud-deployment.sh    ← Setup inicial (Linux/Mac)
│   ├── 📄 prepare-cloud-deployment.bat   ← Setup inicial (Windows)
│   ├── 📄 validate-cloud-deployment.sh   ← Validación (Linux/Mac)
│   ├── 📄 validate-cloud-deployment.bat  ← Validación (Windows)
│   └── 📂 deploy/
│       ├── 📄 gcp-deploy.sh              ← Deploy Google Cloud
│       ├── 📄 aws-deploy.sh              ← Deploy AWS
│       ├── 📄 azure-deploy.sh            ← Deploy Azure
│       └── 📄 digitalocean-deploy.sh     ← Deploy DigitalOcean
│
└── [Sin cambios]
    ├── docker-compose.yml                ← Local (SIN CAMBIOS)
    ├── backend/Dockerfile                ← Local (SIN CAMBIOS)
    ├── frontend/Dockerfile               ← Local (SIN CAMBIOS)
    └── ...resto del proyecto
```

---

## 🚀 Flujo de Usuario (Paso a Paso)

```
Usuario final
       ↓
1️⃣  Leer QUICK_CLOUD_START.md
       ↓
2️⃣  Ejecutar prepare-cloud-deployment script
       ↓
3️⃣  Editar .env.prod con valores secretos
       ↓
4️⃣  Ejecutar validate-cloud-deployment script
       ↓
5️⃣  Elegir plataforma cloud (GCP/AWS/DigitalOcean/Azure)
       ↓
6️⃣  Seguir instrucciones específicas en CLOUD_DEPLOYMENT_GUIDE.md
       ↓
7️⃣  Ejecutar script de deployment (gcp-deploy.sh, etc)
       ↓
8️⃣  Configurar dominio personalizado
       ↓
9️⃣  Configurar SSL/TLS automático
       ↓
🔟  Verificar que todo funciona
       ↓
✅  PRODUCTION LIVE
       ↓
Monitorear & Mantener
```

---

## 🔐 Flujo de Secretos (Seguridad)

```
Desarrollo (Local)
       ↓
.env con valores de testing
(Está en .gitignore)
       ↓
       
Producción (Cloud)
       ↓
.env.prod con valores SEGUROS
(NUNCA se comitea a Git)
       ↓
Opciones de almacenamiento seguro:
  • AWS Secrets Manager
  • Google Secret Manager
  • Azure Key Vault
  • 1Password / LastPass
  • Gestor de contraseñas empresarial
```

---

## 💻 Comandos Clave

```bash
# LOCAL (sin cambios)
docker-compose up -d                    # Levantar desarrollo local
docker-compose down                     # Bajar desarrollo local

# PREPARACIÓN CLOUD
./scripts/prepare-cloud-deployment.sh   # Preparar para cloud
./scripts/validate-cloud-deployment.sh  # Validar antes de deploy

# DEPLOYMENT
gcloud run deploy unt-backend-prod --source backend ...   # GCP
doctl apps create --spec app.yaml                        # DigitalOcean

# VERIFICACIÓN
curl https://api.tudominio.com/health  # Verificar backend
curl https://tudominio.com             # Verificar frontend
```

---

## ⚙️ Variables de Entorno Críticas

### Local (.env)
```
DB_HOST=postgres              ← Container local
DB_PORT=5432
REDIS_URL=redis://redis       ← Container local
```

### Production (.env.prod)
```
DB_HOST=prod-db.region.rds.amazonaws.com    ← Base de datos administrada
DB_PASSWORD=SUPER_SECRET_32_CHARS_MIN       ← DIFERENTE cada env
JWT_SECRET=OTRO_SECRET_SUPER_LARGO          ← CAMBIAR
REDIS_URL=prod-redis.region.cache.cloud     ← Cache administrado
API_URL=https://api.tudominio.com           ← Dominio real
```

---

## 📊 Resumen de Cambios

| Aspecto | Local | Cloud |
|---------|-------|-------|
| Archivo config | docker-compose.yml | docker-compose.prod.yml |
| Archivo de variables | .env | .env.prod |
| BD | Container local | Managed Database (RDS/Cloud SQL/etc) |
| Cache | Container local | Managed Cache (ElastiCache/Memorystore/etc) |
| Reverse Proxy | Opcional | REQUERIDO (Nginx) |
| Escalado | Manual | Automático |
| Backups BD | Manual | Automático (diario) |
| Logs | Stdout local | Centralizados en cloud |
| Certificados | Auto-generados | Let's Encrypt automático |
| Costo | $0 | Según uso (~$30-80/mes) |
| Disponibilidad | 99% (mientras esté tu PC) | 99.95%+ (SLA cloud) |
