# 🚀 Referencia Rápida de Despliegue

## URLs de las Plataformas

| Plataforma | URL | Para qué sirve |
|------------|-----|----------------|
| **Supabase** | https://supabase.com | Base de datos PostgreSQL |
| **Render** | https://render.com | Backend (NestJS) |
| **Vercel** | https://vercel.com | Frontend (Next.js) |
| **UptimeRobot** | https://uptimerobot.com | Mantener backend despierto (gratis) |

---

## Orden de Despliegue

```
1. Supabase (DB) → Obtener DATABASE_URL
2. Render (Backend) → Usar DATABASE_URL, obtener BACKEND_URL
3. Vercel (Frontend) → Usar BACKEND_URL
4. Volver a Render → Actualizar FRONTEND_URL
5. UptimeRobot → Ping a BACKEND_URL cada 10 min
```

---

## Variables de Entorno - Plantilla

### Backend (Render)
```env
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://postgres:PASSWORD@db.PROJECT_ID.supabase.co:5432/postgres
JWT_SECRET=unt-jwt-secret-32caracteres-minimo
JWT_REFRESH_SECRET=unt-refresh-secret-32caracteres-minimo
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=https://TU_PROYECTO.vercel.app

# Opcional - Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password
```

### Frontend (Vercel)
```env
NEXT_PUBLIC_API_URL=https://TU_BACKEND.onrender.com
```

---

## Endpoints de Verificación

```bash
# Health check del backend
curl https://TU_BACKEND.onrender.com/api/health

# Verificar API responde
curl https://TU_BACKEND.onrender.com/api/users

# Verificar frontend carga
curl -I https://TU_FRONTEND.vercel.app
```

---

## Errores Comunes y Soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| `CORS error` | FRONTEND_URL incorrecta en Render | Actualizar con URL exacta de Vercel |
| `Cannot connect to database` | DATABASE_URL mal formada | Verificar password y project ID |
| `404 Not Found` | API prefix no configurado | Backend debe usar `/api` prefix |
| `Build failed` | Node version incompatible | En Render Settings cambiar a Node 20 |
| `Module not found` | Dependencias no instaladas | Re-deploy sin caché de build |
| `Cold start lento` | Backend en "sleep" | Configurar UptimeRobot ping cada 10min |

---

## Comandos Útiles

```bash
# Ver logs en Render (si tienes CLI instalada)
render logs --service unt-practicas-backend

# Probar backend local antes de deploy
cd backend
npm run build
npm run start:prod
# Luego probar: http://localhost:10000/api/health

# Probar frontend local
cd frontend
npm run build
npm start
# Luego probar: http://localhost:3000
```

---

## Límites del Plan Gratuito

| Plataforma | Límite | Qué pasa al superar |
|------------|--------|---------------------|
| **Render** | 512MB RAM, 0.1 CPU | Ralentización, posible crash |
| **Render** | Duerme tras 15min inactividad | Cold start de ~30s |
| **Vercel** | 100GB bandwidth/mes | Site pausado hasta mes siguiente |
| **Vercel** | 10s serverless timeout | Timeout en funciones largas |
| **Supabase** | 500MB storage | Necesita upgrade o limpieza |
| **Supabase** | 2GB transfer/mes | Conexiones rechazadas |

---

## Costos si Necesitas Upgrade

| Plataforma | Plan | Costo | Qué obtienes |
|------------|------|-------|--------------|
| Render | Starter | $7/mes | Siempre activo, 512MB RAM |
| Render | Pro | $25/mes | 2GB RAM, escalado automático |
| Vercel | Pro | $20/mes | 1TB bandwidth, funciones 60s |
| Supabase | Pro | $25/mes | 8GB storage, 100GB transfer |

**Para un sistema académico**: El plan gratuito es suficiente por 1-2 años.

---

## Checklist Post-Deploy

- [ ] Backend responde en `/api/health`
- [ ] Frontend carga sin errores 404
- [ ] Login funciona con credenciales de prueba
- [ ] Lista de estudiantes carga correctamente
- [ ] Puedes crear un pago de prueba
- [ ] No hay errores CORS en consola del navegador
- [ ] UptimeRobot configurado para keepalive
- [ ] (Opcional) Dominio personalizado configurado

---

## Soporte y Ayuda

| Problema | Dónde buscar ayuda |
|----------|-------------------|
| Error de código | Tu IDE, logs de Render/Vercel |
| Error de deploy | Documentación oficial de la plataforma |
| Error de base de datos | Supabase Discord o GitHub Discussions |
| Error general | Stack Overflow con tag de la plataforma |

---

## Comandos de Emergencia

```bash
# Redeploy forzado en Render
# Dashboard → Manual Deploy → Deploy latest commit

# Redeploy forzado en Vercel
# Dashboard → Redeploy → Use existing Build Cache (NO)

# Limpiar caché de Vercel
# Dashboard → Git → Disconnect → Reconnect → Deploy
```

---

**¿Todo listo?** Tu sistema debería estar en vivo en ~30 minutos siguiendo el paso a paso.
