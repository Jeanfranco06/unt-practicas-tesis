# 🚀 GUÍA RÁPIDA - COMIENZA AQUÍ

## TU SISTEMA ESTÁ LISTO ✅

Tu aplicación **UNT Prácticas** está 100% preparada para desplegar en Google Cloud Run.

---

## 🎯 ELIGE TU RUTA

### OPCIÓN A: Cloud Build (RECOMENDADO PARA TI) ⭐
**Mejor para**: No tener que instalar nada local  
**Tiempo**: 20 minutos  

👉 **VE A**: `CLOUD_BUILD_GUIDE.md`

---

### OPCIÓN B: Google Cloud Console Manual
**Mejor para**: Control total paso a paso  
**Tiempo**: 30 minutos  

👉 **VE A**: `GCP_DEPLOYMENT_MANUAL.md`

---

### OPCIÓN C: Oracle Cloud (GRATIS - Sin Redis pago)
**Mejor para**: No gastar dinero  
**Tiempo**: 45 minutos  

👉 **VE A**: `ORACLE_QUICK_START.md`

---

## ⚡ COMANDOS RÁPIDOS

Si ya sabes qué hacer:

```powershell
# 1. Editar configuración
notepad .env.prod

# 2. Actualizar valores de GCP en .env.prod

# 3. Guardar cambios
git add .env.prod
git commit -m "config: Update GCP values"
git push origin main

# 4. Luego en Google Cloud Console:
# - Activar Cloud Build
# - Crear Cloud SQL
# - Crear Redis
# - Ejecutar compilación
```

---

## 📋 PRE-REQUISITOS

✓ Cuenta Google Cloud (crea una en: https://console.cloud.google.com)  
✓ Proyecto GCP creado  
✓ Tu repositorio GitHub conectado  

---

## 💰 COSTOS

- **Cloud Run**: $0/mes (gratuito)
- **Cloud SQL**: $0/mes (gratuito)
- **Redis**: $36/mes ⚠️
- **Total**: ~$36/mes

**Si no quieres gastar**: Usa Oracle Cloud (ver `ORACLE_QUICK_START.md`)

---

## 📚 DOCUMENTACIÓN DISPONIBLE

| Guía | Duración | Para Quién |
|------|----------|-----------|
| CLOUD_BUILD_GUIDE.md | 20 min | Novatos (RECOMENDADO) |
| GCP_DEPLOYMENT_MANUAL.md | 30 min | Usuarios gcloud CLI |
| EXECUTION_PLAN.md | 60 min | Paso a paso detallado |
| ORACLE_QUICK_START.md | 45 min | Quienes quieren gratis |
| GCP_QUICK_START.md | 15 min | Resumen ultrarrápido |
| SYSTEM_STATUS.md | 10 min | Ver estado actual |

---

## ⏱️ TIMELINE

```
AHORA (5 min):
  - Abre https://console.cloud.google.com
  - Selecciona tu proyecto

MINUTO 5-25 (20 min):
  - Sigue CLOUD_BUILD_GUIDE.md
  - Crea Cloud SQL y Redis

MINUTO 25-40 (15 min):
  - Actualiza .env.prod
  - Push a GitHub

MINUTO 40-65 (25 min):
  - Ejecuta Cloud Build
  - Espera a que compile y despliegue

LISTO: Tu app está en https://unt-frontend-prod-XXXXX.a.run.app 🎉
```

---

## ✅ DESPUÉS DEL DEPLOYMENT

1. Prueba tu app en el navegador
2. Revisa logs en Cloud Run
3. Configura dominio personalizado (opcional)
4. Monitorea en los primeros días

---

## 🆘 SI ALGO FALLA

1. Revisa logs en Cloud Run → Servicio → Logs
2. Verifica .env.prod tiene valores correctos
3. Confirma Cloud SQL y Redis están disponibles
4. Lee la sección "Troubleshooting" de la guía

---

## 🎓 SIGUIENTE PASO

**AHORA MISMO**: Abre `CLOUD_BUILD_GUIDE.md` y empieza desde "PASO 1"

Es lo más simple y funciona incluso sin instalar nada extra.

---

**¿Lista tu aplicación?** 🚀

Tiempo total: ~60 minutos  
Costo: $0-36/mes  
Complejidad: Baja-Media  
