# ✅ COMANDO CORRECTO DE DEPLOYMENT - Cloud SQL Proxy

## 🎯 EL COMANDO

Ejecuta este comando en PowerShell (reemplaza `unt-practicas` con tu PROJECT_ID si es diferente):

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

## 📝 EXPLICACIÓN DEL COMANDO

| Parámetro | Significado |
|-----------|------------|
| `--source backend` | Construye Dockerfile desde carpeta `backend/` |
| `--region us-central1` | Región de Google Cloud |
| `--platform managed` | Cloud Run completamente gestionado |
| `--dockerfile Dockerfile.prod` | Usa archivo específico de producción |
| `--memory 1Gi` | 1GB de RAM para el contenedor |
| `--cpu 2` | 2 CPUs |
| `--timeout 3600` | Timeout de 1 hora para health checks |
| `--allow-unauthenticated` | Permite acceso sin API key |
| `--env-vars-file .env.prod` | Cargar variables de `.env.prod` |
| `--set-cloudsql-instances=...` | **CLAVE**: Vincula Cloud SQL Proxy |

---

## 🔑 LA PARTE CRÍTICA

```powershell
--set-cloudsql-instances=unt-practicas:us-central1:unt-postgres-prod
```

Este parámetro:
1. ✅ Crea Cloud SQL Proxy automáticamente
2. ✅ Lo conecta al servicio de Cloud Run
3. ✅ Permite que tu app use `DB_HOST=127.0.0.1`
4. ✅ Proporciona acceso seguro a Cloud SQL

---

## ⚠️ ANTES DE EJECUTAR

Verifica que:

1. **Tu PROJECT_ID**: 
   ```powershell
   gcloud config get-value project
   ```

2. **Cloud SQL existe**:
   ```powershell
   gcloud sql instances list
   ```
   Deberías ver: `unt-postgres-prod`

3. **Tienes `.env.prod` con valores correctos**:
   ```
   DB_HOST=127.0.0.1
   CLOUD_SQL_INSTANCE=unt-practicas:us-central1:unt-postgres-prod
   DB_USER=unt_produc_user
   DB_PASSWORD=<tu_password>
   ```

---

## 🚀 DESPUÉS DE EJECUTAR

El comando tardará **5-10 minutos**. Deberías ver:

```
Deploying container to Cloud Run service [unt-backend-prod]...
Building using Dockerfile and skipping uploading build context.
✓ Building and pushing image
✓ Creating or updating Cloud Run service
✓ Routing traffic
✓ Setting IAM Policy

Service [unt-backend-prod] revision [unt-backend-prod-00005-abc] has been deployed
Service URL: https://unt-backend-prod-xxxxx.a.run.app
```

---

## ✅ VERIFICACIÓN POST-DEPLOYMENT

1. **Ver service status**:
```powershell
gcloud run services describe unt-backend-prod --region us-central1
```

2. **Ver logs**:
```powershell
gcloud run services logs read unt-backend-prod --region us-central1 --limit 50
```

Deberías ver en los logs:
```
🚀 Backend running on port 8080
🔗 Starting Cloud SQL Proxy for: unt-practicas:us-central1:unt-postgres-prod
✓ Cloud SQL Proxy started
📡 Backend Configuration: ...
```

3. **Probar endpoint**:
```powershell
# Reemplaza con tu URL
$url = "https://unt-backend-prod-xxxxx.a.run.app/health"
Invoke-WebRequest $url
```

Debería devolver: `{"status":"ok"}`

---

## 🆘 SI FALLA

**Error: "timed out waiting for the service to become ready"**
- Revisa logs: `gcloud run services logs read unt-backend-prod --region us-central1 --limit 100`
- Busca errores de conexión a BD
- Verifica `.env.prod` tiene valores correctos

**Error: "Permission denied"**
- Asegúrate de tener permisos en Cloud SQL
- Verifica la contraseña es correcta

**Error: "connection refused"**
- Cloud SQL Proxy aún está iniciando
- Aumenta `--timeout 3600` a más tiempo

---

## 💡 DIFERENCIAS DEL NUEVO SETUP

### Antes (Fallaba):
```
Cloud Run → Intenta conectar a Cloud SQL IP
           → Timeout porque no puede conectar
           → Falla
```

### Ahora (Funciona):
```
Cloud Run → Inicia Cloud SQL Proxy
         → Proxy crea túnel seguro a Cloud SQL
         → App conecta a 127.0.0.1:5432
         → Cloud SQL Proxy enruta a Cloud SQL
         → ✅ Funciona
```

---

## 🎉 LISTO

El comando está listo. Solo cópialo y ejecuta en PowerShell.

Luego verifica que esté running correctamente en los logs.
