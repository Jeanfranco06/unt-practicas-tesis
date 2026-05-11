# Despliegue Gratuito: Vercel + Render + Supabase

## Arquitectura
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│    Backend      │────▶│   Supabase      │
│   (Vercel)      │     │   (Render)      │     │  (PostgreSQL)   │
│   Gratis        │     │   Gratis        │     │   Gratis        │
└─────────────────┘     └─────────────────┘     └─────────────────┘
       │                         │
       │                         │
       └───── Dominio Vercel ────┘
       └───── URL Render.io ─────┘
```

## Paso 1: Preparar el Backend para Render

### 1.1 Crear archivo `backend/render.yaml`

```yaml
services:
  - type: web
    name: unt-practicas-backend
    env: node
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm run start:prod
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: DATABASE_URL
        sync: false  # La configurarás manualmente en el dashboard
      - key: JWT_SECRET
        generateValue: true
      - key: JWT_REFRESH_SECRET
        generateValue: true
      - key: FRONTEND_URL
        value: https://tu-app-vercel.vercel.app
```

### 1.2 Crear `backend/Procfile` (alternativa sin render.yaml)

```
web: npm run start:prod
```

### 1.3 Verificar que el backend escucha en el puerto dinámico

Edita `backend/src/main.ts` si es necesario:

```typescript
const PORT = process.env.PORT || 4000;
await app.listen(PORT);
console.log(`Server running on port ${PORT}`);
```

## Paso 2: Crear Base de Datos en Supabase

### 2.1 Registro
1. Ve a https://supabase.com
2. Crea cuenta con GitHub (más rápido)
3. Crea nuevo proyecto
   - Nombre: `unt-practicas-tesis`
   - Región: Selecciona la más cercana (us-east-1 para LATAM)
   - Plan: Free

### 2.2 Obtener credenciales
1. En el dashboard de Supabase, ve a **Project Settings** → **Database**
2. Copia la **Connection string** (URI)
   - Formato: `postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres`

### 2.3 Ejecutar migraciones

En el panel de Supabase:
1. Ve a **SQL Editor**
2. Crea una **New query**
3. Copia y pega el contenido de `init-scripts/01-database-schema.sql`
4. Ejecuta

O también puedes ejecutar manualmente:

```bash
# Localmente con la DB de Supabase
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres" -f init-scripts/01-database-schema.sql
```

## Paso 3: Desplegar Backend en Render

### 3.1 Conectar repositorio
1. Ve a https://render.com
2. Sign up con GitHub
3. Click **New** → **Web Service**
4. Conecta tu repo `unt-practicas-tesis`
5. Configura:
   - **Name**: `unt-practicas-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Plan**: Free

### 3.2 Configurar variables de entorno

En el dashboard de Render, ve a **Environment** y agrega:

```
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres
JWT_SECRET=tu-jwt-secret-muy-seguro-32-caracteres
JWT_REFRESH_SECRET=tu-refresh-secret-muy-seguro-32-caracteres
FRONTEND_URL=https://tu-frontend.vercel.app
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password
```

### 3.3 Obtener URL del backend

Una vez desplegado, Render te dará una URL como:
```
https://unt-practicas-backend.onrender.com
```

**Guarda esta URL** (la necesitarás para el frontend)

## Paso 4: Desplegar Frontend en Vercel

### 4.1 Crear archivo `frontend/vercel.json`

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "npm install",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_API_URL": "@next_public_api_url"
  }
}
```

### 4.2 Configurar variables en Vercel

1. Ve a https://vercel.com
2. Importa tu proyecto desde GitHub
3. Selecciona el directorio `frontend`
4. En **Environment Variables**, agrega:

```
NEXT_PUBLIC_API_URL=https://unt-practicas-backend.onrender.com
```

> **Nota**: Reemplaza con la URL real que te dio Render

5. Click **Deploy**

### 4.3 Actualizar CORS en backend

Una vez que tengas la URL de Vercel, actualiza en Render:

```
FRONTEND_URL=https://tu-app-123.vercel.app
```

## Paso 5: Configurar Dominio Personalizado (Opcional)

### Opción A: Vercel + Subdominio
1. En Vercel: **Settings** → **Domains**
2. Agrega: `app.tudominio.com`
3. Sigue las instrucciones DNS

### Opción B: Render Custom Domain (requiere plan Starter $7/mes)

## Resumen de Costos

| Servicio | Plan | Costo | Límites |
|----------|------|-------|---------|
| **Vercel** (Frontend) | Hobby/Free | **$0** | 100GB bandwidth, 10s serverless timeout |
| **Render** (Backend) | Free | **$0** | 512MB RAM, duerme tras 15min inactividad |
| **Supabase** (DB) | Free | **$0** | 500MB storage, 2GB transfer |
| **TOTAL** | | **$0/mes** | |

## Limitaciones del Plan Gratuito

### Render Free Tier:
- ⚠️ **Cold starts**: El backend tarda ~30s en iniciar tras inactividad
- ⚠️ **Se duerme tras 15 minutos** sin uso
- ⚠️ **512MB RAM** (suficiente para NestJS + TypeORM)

### Soluciones:
- Para evitar cold starts: Ping cada 10 minutos con cron job gratis (GitHub Actions o UptimeRobot)
- Para producción real: Upgrade a Starter ($7/mes) mantiene siempre activo

## Troubleshooting

### Error: "Cannot connect to database"
```
Verificar:
1. DATABASE_URL correcta en Render
2. Supabase permite conexiones externas (Project Settings → Database → Connection Pooling ON)
3. Firewall/IP allowlist en Supabase
```

### Error: "CORS blocked"
```
Asegurar que FRONTEND_URL en backend coincida EXACTAMENTE con la URL de Vercel
(incluyendo https:// y sin trailing slash)
```

### Error: "Build failed"
```
Verificar en render.yaml:
- buildCommand: npm install && npm run build
- startCommand: npm run start:prod
- El dist/ se genera correctamente
```

## Comandos Útiles

### Ver logs en Render:
```bash
# En el dashboard de Render → Logs
# O usa CLI:
render logs --service unt-practicas-backend
```

### Ejecutar migraciones manualmente:
```bash
# Desde tu PC local
npx typeorm migration:run -d dist/src/data-source.js
```

## Siguientes Pasos para Producción

1. **Monitoring**: Agregar LogRocket o Sentry (gratis tier)
2. **Backups**: Supabase hace backups automáticos diarios
3. **Emails**: Configurar SendGrid (gratis 100 emails/día) o seguir con Gmail
4. **Storage**: Para archivos, usar Supabase Storage (gratis 1GB)

## Scripts de Ayuda

### `package.json` raíz (opcional):

```json
{
  "scripts": {
    "deploy:frontend": "cd frontend && vercel --prod",
    "deploy:backend": "cd backend && render deploy",
    "db:migrate": "cd backend && npm run migration:run",
    "db:seed": "cd backend && npm run seed"
  }
}
```

---

## Alternativa 100% Gratuita (Todo en Render)

Si prefieres todo en una sola plataforma:

1. **Frontend**: Static Site en Render (gratis)
   - Build: `cd frontend && npm install && npm run build`
   - Publish: `frontend/dist` (necesitarás export static)
   
2. **Backend**: Web Service (gratis)

3. **Database**: PostgreSQL en Render (gratis 90 días, luego $7/mes)
   - O usa Supabase para DB perpetuamente gratis

**Ventaja**: Menos plataformas, todo en un dashboard
**Desventaja**: Frontend estático sin SSR de Next.js

---

¿Necesitas ayuda con algún paso específico?
