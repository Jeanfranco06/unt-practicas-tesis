# 🚀 Guía de Despliegue Paso a Paso

## Pre-requisitos
- Cuenta en GitHub con tu código subido
- Git instalado en tu máquina

---

## 📋 CHECKLIST ANTES DE EMPEZAR

- [ ] Tener el código en un repositorio GitHub
- [ ] Saber el nombre de tu usuario/org en GitHub
- [ ] Tener acceso a un correo electrónico para las cuentas

---

## PASO 1: Preparar el Repositorio (5 min)

### 1.1 Verifica que tienes estos archivos creados:
```
unt-practicas-tesis/
├── backend/
│   ├── render.yaml          ✅ (creado)
│   └── Procfile             ✅ (creado)
├── frontend/
│   └── vercel.json          ✅ (creado)
└── .github/workflows/
    └── deploy.yml           ✅ (creado)
```

### 1.2 Hacer commit de estos archivos:
```bash
cd d:\Proyects\unt-practicas-tesis
git add backend/render.yaml backend/Procfile frontend/vercel.json .github/workflows/deploy.yml
git commit -m "chore: add deployment configuration files"
git push origin main
```

---

## PASO 2: Crear Base de Datos en Supabase (10 min)

### 2.1 Registro
1. Abre https://supabase.com en tu navegador
2. Click en **"Start your project"**
3. Selecciona **"Continue with GitHub"**
4. Autoriza la aplicación

### 2.2 Crear Proyecto
1. Click en **"New project"**
2. Organization: Selecciona tu cuenta personal
3. Project name: `unt-practicas-tesis`
4. Database password: 
   - Click en **"Generate a password"** o escribe uno seguro
   - **GUARDA ESTA CONTRASEÑA** - la necesitarás
5. Region: `North America (North Virginia)` (us-east-1) - mejor para LATAM
6. Click **"Create new project"**

### 2.3 Obtener Connection String
Espera ~2 minutos a que se cree el proyecto, luego:

1. En el menú lateral, click en **Project Settings** (icono de engranaje abajo)
2. Click en **Database** en el menú
3. En **Connection string**, selecciona **URI** del menú desplegable
4. Copia la cadena que se ve así:
   ```
   postgresql://postgres:[PASSWORD]@db.xxxxxxxxxxxxxxxxxxxx.supabase.co:5432/postgres
   ```
5. **Guarda esta cadena en un archivo de texto temporal**

### 2.4 Ejecutar Esquema de Base de Datos

1. En el menú lateral, click en **SQL Editor**
2. Click en **"New query"**
3. Copia TODO el contenido del archivo `init-scripts/01-database-schema.sql`
4. Pega en el editor SQL
5. Click en **"Run"** (botón verde arriba a la derecha)
6. Espera a que termine (debería decir "Success" en verde)

### 2.5 Insertar Datos de Prueba (Opcional pero recomendado)

1. Crea otra query nueva
2. Copia el contenido de `init-scripts/03-test-data.sql`
3. Pega y ejecuta

**Resultado**: Tienes tu PostgreSQL lista en la nube con datos de ejemplo.

---

## PASO 3: Desplegar Backend en Render (15 min)

### 3.1 Registro en Render
1. Abre https://render.com
2. Click en **"Get Started for Free"**
3. Selecciona **"Continue with GitHub"**
4. Autoriza el acceso a tu repositorio `unt-practicas-tesis`

### 3.2 Crear Web Service

1. En el dashboard de Render, click en **"New"** (azul, arriba a la derecha)
2. Selecciona **"Web Service"**
3. Busca y selecciona tu repositorio `unt-practicas-tesis`
4. Click en **"Connect"**

### 3.3 Configurar el Servicio

Completa el formulario así:

| Campo | Valor |
|-------|-------|
| **Name** | `unt-practicas-backend` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start:prod` |
| **Plan** | `Free` |

Click en **"Advanced"** y agrega las variables de entorno:

**Variables de entorno obligatorias:**

```
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://postgres:TU_PASSWORD@db.TU_PROYECTO.supabase.co:5432/postgres
JWT_SECRET=unt-jwt-secret-muy-seguro-2024-32caracteres
JWT_REFRESH_SECRET=unt-refresh-secret-super-seguro-2024
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=https://unt-practicas.vercel.app
```

> ⚠️ **Reemplaza**: 
> - `TU_PASSWORD` con la contraseña de Supabase
> - `TU_PROYECTO` con el ID de tu proyecto (la parte que está entre `db.` y `.supabase.co`)

**Variables opcionales (para emails):**
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password-gmail
```

### 3.4 Crear el Servicio

1. Click en **"Create Web Service"**
2. Espera el build (~5 minutos)
3. Verás logs en tiempo real
4. Cuando diga **"Your service is live"**, copia la URL que aparece arriba
   - Se ve así: `https://unt-practicas-backend.onrender.com`
   - **GUARDA ESTA URL** - la necesitas para el frontend

### 3.5 Verificar que funciona

Abre en tu navegador:
```
https://unt-practicas-backend.onrender.com/api/health
```

Debería mostrar algo como:
```json
{"status":"ok","timestamp":"2024-..."}
```

---

## PASO 4: Desplegar Frontend en Vercel (10 min)

### 4.1 Registro en Vercel
1. Abre https://vercel.com
2. Click en **"Get Started"**
3. Selecciona **"Continue with GitHub"**
4. Autoriza el acceso

### 4.2 Importar Proyecto

1. En el dashboard, click en **"Add New..."** → **"Project"**
2. Busca tu repositorio `unt-practicas-tesis`
3. Click en **"Import"**

### 4.3 Configurar Proyecto

| Campo | Valor |
|-------|-------|
| **Project Name** | `unt-practicas` (o como quieras) |
| **Framework Preset** | `Next.js` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` (debería detectar automático) |
| **Output Directory** | `.next` (debería detectar automático) |

### 4.4 Variables de Entorno

Click en **"Environment Variables"** y agrega:

```
NEXT_PUBLIC_API_URL=https://unt-practicas-backend.onrender.com
```

> ⚠️ **Usa la URL que copiaste del paso 3.4**

### 4.5 Desplegar

1. Click en **"Deploy"**
2. Espera el build (~3 minutos)
3. Cuando termine, verás: **"Congratulations!"**
4. Click en el botón **"Go to Dashboard"**
5. Copia la URL del proyecto (se ve así: `https://unt-practicas.vercel.app`)

### 4.6 Actualizar CORS en Render

**IMPORTANTE**: Vuelve a Render para actualizar la URL del frontend:

1. En Render, ve a tu servicio `unt-practicas-backend`
2. Click en **"Environment"**
3. Edita la variable `FRONTEND_URL`
4. Coloca la URL real de Vercel: `https://unt-practicas.vercel.app`
5. Click en **"Save Changes"**
6. El servicio se reiniciará automáticamente

---

## PASO 5: Verificar Todo Funciona (5 min)

### 5.1 Prueba de conectividad

1. Abre tu frontend: `https://unt-practicas.vercel.app`
2. Debería cargar la página de login
3. Intenta loguearte con:
   - Email: `admin@unt.edu.pe` (o el usuario de prueba que hayas creado)
   - Password: el que corresponda

### 5.2 Si hay errores, verifica:

**Error de CORS (backend rechaza peticiones):**
```
- En Render, revisa que FRONTEND_URL tenga la URL exacta de Vercel
- Incluye https:// y sin slash al final
```

**Error "Cannot connect to database":**
```
- Revisa DATABASE_URL en Render
- Verifica que el password sea correcto
- En Supabase → Database → Connection pooling debe estar ON
```

**Error 404 en API:**
```
- El backend debería responder en /api/...
- Prueba: https://tu-backend.onrender.com/api/health
```

---

## PASO 6: Configuración Adicional (Opcional)

### 6.1 Dominio Personalizado

**En Vercel:**
1. Ve a tu proyecto → Settings → Domains
2. Agrega tu dominio: `app.tudominio.com`
3. Sigue las instrucciones DNS
4. Espera propagación DNS (~24-48 horas)

**En Render:**
1. Solo disponible en plan Starter ($7/mes)
2. Puedes usar el dominio gratuito de Render

### 6.2 SSL/HTTPS
- ✅ Vercel: Automático
- ✅ Render: Automático
- ✅ Supabase: Automático

Todo viene con HTTPS gratuito.

### 6.3 Backups Automáticos
- Supabase Free: Backups diarios automáticos (7 días retención)
- Para backups manuales: Supabase → Database → Backups

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### El backend se "duerme" y tarda en responder

**Problema**: Render Free duerme el servicio tras 15 min de inactividad.

**Solución - Ping cada 10 minutos:**

1. Ve a https://uptimerobot.com
2. Crea cuenta gratuita
3. Click **"Add New Monitor"**
4. Configura:
   - Monitor Type: HTTP(s)
   - Friendly Name: `UNT Backend Keepalive`
   - URL: `https://unt-practicas-backend.onrender.com/api/health`
   - Monitoring Interval: Every 10 minutes
5. Guarda

Esto mantendrá tu backend "despierto" sin costo.

### Error "Build failed" en Render

```bash
# Verificar que build funciona localmente:
cd backend
npm install
npm run build
```

Si funciona local pero no en Render, revisa:
- Versión de Node (debería usar 18 o 20)
- En Render Dashboard → Settings cambia Node version a `20`

### Error "Module not found" en Vercel

1. Ve a Vercel Dashboard → tu proyecto → Settings → General
2. Scroll a "Build & Development Settings"
3. Verifica que "Install Command" sea: `npm install`
4. Click "Redeploy" con "Use existing Build Cache" desmarcado

---

## 📊 RESUMEN FINAL

| Componente | URL | Estado |
|------------|-----|--------|
| Frontend | `https://unt-practicas.vercel.app` | ✅ En vivo |
| Backend | `https://unt-practicas-backend.onrender.com` | ✅ API REST |
| Database | `db.xxx.supabase.co` | ✅ PostgreSQL |

**Costo total: $0/mes** (con límites de uso gratuito)

**Limitaciones conocidas:**
- Backend tarda ~30s en "despertar" tras inactividad (usa UptimeRobot)
- 512MB RAM en backend (suficiente para el uso académico)
- 500MB de base de datos (ampliable en Supabase si crece)

---

## 🚀 SIGUIENTES MEJORAS

1. **CI/CD Automático**: Ya tienes el archivo `.github/workflows/deploy.yml`, solo necesitas configurar los secrets en GitHub

2. **Monitoreo**: Agrega Sentry (gratis) para errores en tiempo real

3. **Storage de archivos**: Usa Supabase Storage (1GB gratis) para subir documentos

4. **Emails**: Configura SendGrid (100 emails/día gratis) en lugar de Gmail

---

## ✅ CHECKLIST FINAL

Antes de considerar el despliegue completo, verifica:

- [ ] Backend accesible en `https://xxx.onrender.com/api/health`
- [ ] Frontend carga sin errores en `https://xxx.vercel.app`
- [ ] Login funciona con usuario de prueba
- [ ] Puedes ver lista de estudiantes/pagos
- [ ] CORS no da errores en consola del navegador

---

**¿Necesitas ayuda con algún paso específico?** Puedo crear videos/gifs o explicar más detalle.
