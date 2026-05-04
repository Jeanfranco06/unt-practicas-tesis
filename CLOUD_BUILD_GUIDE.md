# DEPLOYMENT SIMPLIFICADO VIA GOOGLE CLOUD CONSOLE

## El Problema
Tu máquina tiene problemas con SSL/TLS para instalar gcloud CLI. Pero no es necesario - **Google Cloud Build puede hacer todo automáticamente** desde la consola web.

## La Solución: Cloud Build Automation

Google Cloud Build puede:
1. Detectar cambios en tu repositorio GitHub
2. Construir automáticamente los Docker images
3. Desplegar en Cloud Run sin necesidad de gcloud en tu PC

---

## PASOS PARA CONFIGURAR

### PASO 1: Ir a Google Cloud Console
1. Abre: https://console.cloud.google.com
2. Selecciona tu proyecto `unt-practicas` en la esquina superior

### PASO 2: Habilitar APIs Necesarias
1. Abre el menú (≡) → API y servicios → Biblioteca
2. Busca y habilita:
   - Cloud Run API
   - Cloud Build API
   - Cloud SQL Admin API
   - Memorystore for Redis API

### PASO 3: Conectar GitHub con Cloud Build
1. Ir a: Cloud Build → Configuración
2. Click en "CONECTAR REPOSITORIO"
3. Selecciona "GitHub"
4. Autoriza Google Cloud para acceder a tu GitHub
5. Selecciona tu repositorio: `unt-practicas-tesis`
6. Click "CONECTAR"

### PASO 4: Crear Cloud SQL (si no existe)
1. Ir a: SQL → Instancias
2. Click "CREAR INSTANCIA"
3. Selecciona "PostgreSQL"
4. Configuración:
   - Nombre: `unt-postgres-prod`
   - Versión: PostgreSQL 15
   - Tier: db-f1-micro
   - Región: us-central1
5. Click "CREAR INSTANCIA"

Espera 2-3 minutos a que se cree.

Luego crea usuario y base de datos:
```sql
-- En Cloud SQL Editor (SQL Admin → unt-postgres-prod → Conectar)
CREATE USER unt_prod_user WITH PASSWORD 'TU_PASSWORD_SEGURA';
CREATE DATABASE unt_practicas_tesis_prod OWNER unt_prod_user;
GRANT ALL PRIVILEGES ON DATABASE unt_practicas_tesis_prod TO unt_prod_user;
```

### PASO 5: Crear Redis (si no existe)
1. Ir a: Memorystore → Redis
2. Click "CREAR INSTANCIA"
3. Configuración:
   - Nombre: `unt-redis-prod`
   - Versión: 7.0
   - Capacidad: 2 GB
   - Región: us-central1
   - Tier: Basic
4. Click "CREAR"

Esto tardará 5-10 minutos.

### PASO 6: Configurar Variables de Entorno
1. Ir a: Cloud Build → Configuración de compilación
2. Click en "Crear compilación manual"
3. En la sección "Variables", agrega:
   - `_NEXT_PUBLIC_API_URL`: `https://unt-backend-prod.a.run.app`
   - `_POSTGRES_HOST`: IP de Cloud SQL
   - `_POSTGRES_PASSWORD`: Password del usuario
   - `_REDIS_HOST`: Host de Redis

### PASO 7: Crear archivo de secretos en Cloud Build
1. Ir a: Secret Manager
2. Crea secretos:
   - `db-password`
   - `jwt-secret`
   - `jwt-refresh-secret`
   - `redis-password`

### PASO 8: Actualizar .env.prod (localmente)
Edita `.env.prod` con valores reales:
```
DB_HOST=<IP_CLOUD_SQL>
DB_PORT=5432
DB_USER=unt_prod_user
DB_PASSWORD=TU_PASSWORD
DB_NAME=unt_practicas_tesis_prod

REDIS_URL=redis://<REDIS_HOST>:6379
REDIS_PASSWORD=default

JWT_SECRET=GENERA_ALEATORIO_32_CHARS
JWT_REFRESH_SECRET=GENERA_ALEATORIO_32_CHARS

API_URL=https://unt-backend-prod.a.run.app
FRONTEND_URL=https://unt-frontend-prod.a.run.app
NEXT_PUBLIC_API_URL=https://unt-backend-prod.a.run.app
```

### PASO 9: Hacer Push a GitHub
```powershell
cd D:\Proyects\unt-practicas-tesis
git add .env.prod
git commit -m "config: Update .env.prod with GCP values"
git push origin main
```

### PASO 10: Iniciar Compilación Manual
1. Ir a: Cloud Build → Historial de compilaciones
2. Click "CREAR COMPILACIÓN MANUAL"
3. Selecciona:
   - Repositorio: `unt-practicas-tesis`
   - Rama: `main`
   - Archivo de configuración: `cloudbuild.yaml`
4. Click "CREAR"

Esto tardará 10-15 minutos en construir y desplegar ambos servicios.

---

## ALTERNATIVA: Cloud Run UI Deployment

Si prefieres una alternativa aún más simple sin Cloud Build:

### Desplegar Backend directamente
1. Ir a: Cloud Run
2. Click "CREAR SERVICIO"
3. Configuración:
   - Nombre: `unt-backend-prod`
   - Región: us-central1
   - Selecciona "Implementar una revisión del código existente"
   - Fuente: Selecciona `https://github.com/Jeanfranco06/unt-practicas-tesis/tree/main`
   - Dockerfile: `backend/Dockerfile.prod`
   - Asignación de memoria: 1 GB
   - CPU: 2
4. Click "CREAR"

### Desplegar Frontend
1. Repetir para Frontend:
   - Nombre: `unt-frontend-prod`
   - Dockerfile: `frontend/Dockerfile.prod`
   - Memoria: 512 MB
   - CPU: 1

---

## VERIFICAR DEPLOYMENTS

Una vez que termine:

1. Ir a: Cloud Run → Servicios
2. Deberías ver:
   - ✓ unt-backend-prod (estado: RUNNING)
   - ✓ unt-frontend-prod (estado: RUNNING)

3. Click en cada servicio para ver:
   - URL del servicio
   - Logs
   - Métricas

### Probar Conectividad
1. Copia la URL del backend
2. En navegador: `https://unt-backend-prod-XXXXX.a.run.app/health`
3. Debería devolver: `{"status":"ok"}`

---

## COSTOS

- Cloud Run: Gratuito (primeros 2M requests/mes)
- Cloud SQL: Gratuito (db-f1-micro en Always Free Tier)
- Redis 2GB: ~$35/mes (NO GRATUITO)
- Cloud Build: Gratuito (primeros 120 minutos/mes)

**Total: $35-40/mes** (si usas el tier gratuito de GCP)

---

## MONITOREAR LOGS

1. Ir a: Cloud Run → Servicio → Logs
2. Verás logs en tiempo real
3. O usa:
```powershell
# Si tienes gcloud (después de resolverlo):
gcloud run services logs read unt-backend-prod --region us-central1 --follow
```

---

## TROUBLESHOOTING

### Error: "Build failed"
- Revisa logs en Cloud Build → Historial
- Verifica que .env.prod tiene valores correctos
- Comprueba que Cloud SQL y Redis están disponibles

### Error: "Cloud SQL connection refused"
- Ve a SQL Admin → unt-postgres-prod → Conexiones
- Habilita "Cloud Run"
- Desactiva "Requerir SSL"

### Error: "Redis timeout"
- Verifica que Redis está en la misma VPC
- En Cloud Run, configura "Cloud SQL Auth proxy"

---

## PRÓXIMOS PASOS

1. **Seguir pasos del 1 al 10** para activar Cloud Build
2. **Esperar** a que se complete la compilación (~15 minutos)
3. **Verificar** que ambos servicios están corriendo
4. **Probar** endpoints en navegador
5. **Monitorear** logs para errores

---

Si esto también falla, la opción final es usar **Oracle Cloud** (totalmente gratis):
Ver: `ORACLE_QUICK_START.md`

O puedes instalar Google Cloud SDK en una máquina con Linux/Mac donde SSL funciona correctamente.
