# 🐳 Configuración Docker - UNT Prácticas y Tesis

## 📋 Requisitos Previos

1. **Docker Desktop** instalado y en ejecución
2. **Git** para clonar el repositorio
3. **Mínimo 4GB RAM** recomendado para Docker

## 🚀 Inicio Rápido

### Opción 1: Usar Scripts Automáticos (Recomendado)

**Para Windows (PowerShell):**
```powershell
# Ejecutar como Administrador
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\scripts\setup-docker.ps1
```

**Para Linux/macOS:**
```bash
# Dar permisos de ejecución
chmod +x scripts/setup-docker.sh
./scripts/setup-docker.sh
```

### Opción 2: Configuración Manual

1. **Clonar el repositorio:**
```bash
git clone <repository-url>
cd unt-practicas-tesis
```

2. **Configurar variables de entorno:**
```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env.local
```

3. **Levantar los contenedores:**
```bash
docker-compose up --build -d
```

4. **Verificar estado:**
```bash
docker-compose ps
```

## 🌐 Acceso a la Aplicación

- **Frontend:** http://localhost:3001
- **Backend API:** http://localhost:3000
- **Base de Datos:** localhost:5433

## 🔐 Credenciales de Prueba

**Contraseña para todos los usuarios:** `password123`

| Rol | Email | Permisos |
|-----|-------|----------|
| Administrador | admin@unt.edu.pe | Acceso completo |
| Coordinador FI | coordinador.fi@unt.edu.pe | Gestión de facultad |
| Coordinador FCT | coordinador.fct@unt.edu.pe | Gestión de facultad |
| Asesor 1 | asesor1@unt.edu.pe | Asesoramiento de tesis |
| Asesor 2 | asesor2@unt.edu.pe | Asesoramiento de prácticas |
| Estudiante 1 | estudiante1@unt.edu.pe | Acceso de estudiante |
| Estudiante 2 | estudiante2@unt.edu.pe | Acceso de estudiante |
| Estudiante 3 | estudiante3@unt.edu.pe | Acceso de estudiante |
| Rep. TechCorp | rep.empresa1@techcorp.pe | Gestión de empresa |
| Rep. Innovate | rep.empresa2@innovate.pe | Gestión de empresa |

## 📁 Estructura del Proyecto

```
unt-practicas-tesis/
├── backend/                 # API NestJS
│   ├── src/
│   ├── Dockerfile
│   └── .env.example
├── frontend/               # Next.js Frontend
│   ├── src/
│   ├── Dockerfile
│   └── .env.example
├── init-scripts/          # Scripts de base de datos
│   ├── 01-init.sql        # Estructura inicial
│   ├── 02-migration-normalized.sql  # Migración normalizada
│   └── 03-test-data.sql   # Datos de prueba
├── scripts/               # Scripts de automatización
│   ├── setup-docker.sh    # Linux/macOS
│   └── setup-docker.ps1   # Windows PowerShell
├── docker-compose.yml     # Configuración Docker
└── DOCKER_SETUP.md       # Este archivo
```

## 🛠️ Comandos Útiles

### Gestión de Contenedores
```bash
# Iniciar todos los servicios
docker-compose up -d

# Detener todos los servicios
docker-compose down

# Reiniciar servicios
docker-compose restart

# Ver logs en tiempo real
docker-compose logs -f [servicio]

# Ver estado de los contenedores
docker-compose ps

# Limpiar todo (incluyendo volúmenes)
docker-compose down -v
docker volume prune -f
```

### Base de Datos
```bash
# Acceder a PostgreSQL
docker-compose exec postgres psql -U postgres -d unt_practicas_tesis

# Ver logs de la base de datos
docker-compose logs postgres

# Respaldar base de datos
docker-compose exec postgres pg_dump -U postgres unt_practicas_tesis > backup.sql

# Restaurar base de datos
docker-compose exec -T postgres psql -U postgres unt_practicas_tesis < backup.sql
```

### Desarrollo
```bash
# Reconstruir imágenes
docker-compose build

# Ejecutar en modo desarrollo con volúmenes
docker-compose up --build

# Limpiar caché de Docker
docker system prune -a
```

## 🔧 Configuración Avanzada

### Variables de Entorno

**Backend (.env):**
```env
# Base de Datos
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=unt_practicas_tesis

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Personalización de la Base de Datos

1. **Modificar scripts en `init-scripts/`**
2. **Recrear volúmenes:**
```bash
docker-compose down -v
docker-compose up --build
```

### Cambiar Contraseñas

1. **Editar `docker-compose.yml`**
2. **Actualizar variables de entorno**
3. **Recrear contenedores:**
```bash
docker-compose down
docker-compose up --build
```

## 🚨 Solución de Problemas

### Problemas Comunes

**1. Puerto en uso:**
```bash
# Ver qué usa el puerto
netstat -ano | findstr :3000
# Cambiar puerto en docker-compose.yml
```

**2. Permisos en Linux/macOS:**
```bash
# Fix permisos de Docker
sudo chown -R $USER:$USER .
sudo usermod -aG docker $USER
```

**3. Contenedor no inicia:**
```bash
# Ver logs detallados
docker-compose logs [nombre-servicio]

# Reconstruir imagen
docker-compose build [nombre-servicio]
```

**4. Base de datos no responde:**
```bash
# Verificar健康检查
docker-compose exec postgres pg_isready -U postgres

# Reiniciar solo la base de datos
docker-compose restart postgres
```

### Depuración

**Acceder a contenedor:**
```bash
# Backend
docker-compose exec backend sh

# Frontend
docker-compose exec frontend sh

# Base de datos
docker-compose exec postgres bash
```

**Verificar configuración:**
```bash
# Ver variables de entorno
docker-compose exec backend env

# Ver configuración de PostgreSQL
docker-compose exec postgres cat /var/lib/postgresql/data/postgresql.conf
```

## 📊 Monitoreo

### Recursos del Sistema
```bash
# Ver uso de recursos
docker stats

# Ver tamaño de volúmenes
docker volume ls
docker system df
```

### Logs
```bash
# Logs de todos los servicios
docker-compose logs

# Logs específicos con timestamps
docker-compose logs -t --tail=100 [servicio]

# Guardar logs en archivo
docker-compose logs > logs/docker.log
```

## 🔄 Actualización del Sistema

### Actualizar Código
```bash
# Pull de cambios
git pull origin main

# Reconstruir y reiniciar
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Migraciones de Base de Datos
```bash
# Agregar nuevo script de migración
# Ejemplo: 04-new-migration.sql

# Recrear base de datos (cuidado: pierde datos)
docker-compose down -v
docker-compose up --build
```

## 📞 Soporte

Si encuentras problemas:

1. **Verifica los logs:** `docker-compose logs`
2. **Revisa la configuración:** Variables de entorno y puertos
3. **Limpia y reconstruye:** `docker-compose down -v && docker-compose up --build`
4. **Consulta la documentación:** [Wiki del Proyecto]

## ⚠️ Notas Importantes

- **No usar en producción** sin configurar correctamente las contraseñas
- **Los datos persisten** en volúmenes Docker
- **Los scripts SQL** se ejecutan automáticamente al crear la base de datos
- **Para desarrollo** se recomienda usar volúmenes para código fuente
