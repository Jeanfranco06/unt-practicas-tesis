# 🔧 CORRECCIÓN DE PUERTO - SOLUCIÓN AL ERROR DE CLOUD RUN

## ❌ PROBLEMA
El contenedor falla porque Cloud Run usa **PORT=8080** por defecto, pero la aplicación estaba esperando escuchar en puerto **3000**.

**Mensaje de error:**
```
ERROR: The user-provided container failed to start and listen on the port 
defined provided by the PORT=8080 environment variable within the allocated timeout.
```

---

## ✅ SOLUCIÓN IMPLEMENTADA

Se han actualizado los siguientes archivos:

1. **backend/src/main.ts** 
   - Cambio: Puerto default de `4000` → `8080`
   
2. **.env.prod.example**
   - Cambio: `PORT=3000` → `PORT=8080`
   - Cambio: `BACKEND_PORT=3000` → `BACKEND_PORT=8080`

3. **.env.prod**
   - Cambio: `PORT=3000` → `PORT=8080`
   - Cambio: `BACKEND_PORT=3000` → `BACKEND_PORT=8080`

**Cambios comiteados y pusheados a GitHub**

---

## 🚀 COMANDO PARA REDEPLOY

Ejecuta este comando en tu terminal PowerShell:

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

## 📝 EXPLICACIÓN

### ¿Por qué Cloud Run usa 8080?
- Es el puerto estándar en contenedores serverless
- Google Cloud Run usa `PORT=8080` como variable de entorno por defecto
- Tu aplicación debe escuchar en el puerto definido por esta variable

### Cambio en main.ts
**Antes:**
```typescript
const port = Number(process.env.PORT) || 4000;
```

**Después:**
```typescript
const port = Number(process.env.PORT) || 8080;
```

Ahora:
1. Si existe `PORT` en las variables de entorno → Usa ese valor
2. Si no existe → Usa `8080` (Cloud Run default)

---

## ✅ VERIFICACIÓN

Para verificar que el cambio funcionó después del deploy:

```powershell
# Ver logs
gcloud run services logs read unt-backend-prod --region us-central1 --limit 50

# Deberías ver algo como:
# 🚀 Backend running on http://localhost:8080
```

---

## 🔄 CUANDO REDEPLOY COMPLETE

1. Copia la URL que proporcione gcloud
2. Actualiza .env.prod con esa URL si es necesario
3. Redeploy el frontend si lo requiere

---

## 💡 NOTA PARA EL FUTURO

- **En desarrollo local**: Puede seguir usando puerto 3000 (en el docker-compose)
- **En Cloud Run**: SIEMPRE usa puerto 8080
- **En otros clouds**: Cada proveedor puede tener su estándar (AWS usa 8000, etc.)

---

## ⚠️ IMPORTANTE

El comando anterior:
- ✅ Usa tu código actualizado de GitHub
- ✅ Compila el Dockerfile.prod automáticamente
- ✅ Configura PORT=8080 correctamente
- ✅ Aplica todas las variables de .env.prod

**LISTO PARA EJECUTAR** ✓
