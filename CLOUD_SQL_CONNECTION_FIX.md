# 🔴 ERROR: Container Timeout - Cloud SQL Connection Issue

## ❌ EL PROBLEMA REAL

Cloud Run intenta ejecutar tu contenedor, pero **la aplicación se está crasheando** al intentar conectar a Cloud SQL. El timeout ocurre porque:

1. **Cloud SQL no está permitiendo conexiones desde Cloud Run**
2. La aplicación intenta conectar a BD al iniciar
3. Se agota el timeout sin que la app escuche en puerto 8080
4. Cloud Run mata el contenedor

---

## 🔍 VERIFICACIÓN

Para confirmar, abre los logs de Cloud Run:
```
https://console.cloud.google.com/logs/viewer?project=unt-practicas&resource=cloud_run_revision/service_name/unt-backend-prod
```

Probablemente verás errores como:
```
Error: connect ECONNREFUSED xx.xx.xx.xx:5432
ENOTFOUND postgres
Error: getaddrinfo ENOTFOUND postgres
```

---

## ✅ SOLUCIONES

### OPCIÓN 1: Cloud SQL Auth Proxy (RECOMENDADO)

**Paso 1**: Instala Cloud SQL Auth Proxy en el contenedor

Edita `backend/Dockerfile.prod` y agrega después de las líneas de instalación:

```dockerfile
# Instalar Cloud SQL Proxy
RUN curl -o /cloud-sql-proxy https://dl.google.com/cloudsql/cloud_sql_proxy.linux.amd64 && \
    chmod +x /cloud-sql-proxy

# En la etapa de producción, también copia el proxy
COPY --from=builder /cloud-sql-proxy /cloud-sql-proxy
```

**Paso 2**: Crea un script de inicio `backend/entrypoint.sh`:

```bash
#!/bin/sh
set -e

# Iniciar Cloud SQL Proxy en background
if [ ! -z "$CLOUD_SQL_INSTANCE" ]; then
  echo "Starting Cloud SQL Proxy for $CLOUD_SQL_INSTANCE..."
  /cloud-sql-proxy -ip_address_types=PRIVATE "$CLOUD_SQL_INSTANCE" &
  PROXY_PID=$!
  sleep 2
fi

# Ejecutar la aplicación
exec dumb-init npm run start:prod
```

**Paso 3**: Actualiza el Dockerfile para usar el script:

```dockerfile
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
```

**Paso 4**: Actualiza variables en `.env.prod`:

```
# Old:
DB_HOST=<CLOUD_SQL_IP>

# New:
DB_HOST=127.0.0.1
CLOUD_SQL_INSTANCE=unt-practicas:us-central1:unt-postgres-prod
```

**Paso 5**: Deploy con la nueva variable:

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
    --env-vars-file .env.prod `
    --set-cloudsql-instances=unt-practicas:us-central1:unt-postgres-prod
```

---

### OPCIÓN 2: Permitir Tráfico Externo (MÁS SIMPLE)

**Paso 1**: Abre Cloud Console → Cloud SQL → unt-postgres-prod

**Paso 2**: Ve a "Conexiones" y configura:
- Desactiva "Requerir SSL"
- Agrega rango autorizado: `0.0.0.0/0` (abre a todo internet)

**Paso 3**: Obtén la IP pública de Cloud SQL:
```powershell
gcloud sql instances describe unt-postgres-prod --format="value(ipAddresses[0].ipAddress)"
```

**Paso 4**: Actualiza `.env.prod`:
```
DB_HOST=<LA_IP_QUE_OBTUVISTE>
DB_PORT=5432
```

**Paso 5**: Deploy normal:
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

---

## 🆚 COMPARACIÓN

| Aspecto | Opción 1 (Proxy) | Opción 2 (Abierto) |
|--------|-----------------|-------------------|
| Seguridad | ⭐⭐⭐⭐⭐ Excelente | ⭐⭐ Riesgoso |
| Complejidad | Media | Baja |
| Tiempo setup | 20 min | 5 min |
| IP expuesta | No | Sí |
| Costo | $0 | $0 |
| Recomendado | ✅ Sí | ⚠️ Solo test |

---

## 📋 CHECKLIST RÁPIDO

- [ ] ¿Verificaste los logs de Cloud Run?
- [ ] ¿Viste errores de conexión a BD?
- [ ] ¿Eliges Opción 1 (Proxy) o Opción 2 (Abierto)?
- [ ] ¿Actualizaste `.env.prod` con DB_HOST correcto?
- [ ] ¿Ejecutaste el comando de deploy?

---

## 🚀 PRÓXIMO PASO

**Elige la opción más simple por ahora** → Opción 2

Luego cuando todo funcione, puedes migrar a Opción 1 (más segura).

---

## ⚠️ IMPORTANTE

**NO deploys hasta:**
1. Resolver el problema de conexión a BD
2. Verificar en los logs que la app inicia correctamente
3. Confirmar que escucha en puerto 8080
