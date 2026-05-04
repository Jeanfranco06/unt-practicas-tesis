# 📖 Guía Paso a Paso: Oracle Cloud Always Free

## 🎯 Objetivo Final
Desplegar tu aplicación en **Oracle Cloud GRATIS SIEMPRE** (sin tarjeta de crédito requerida)

**Costo Total: $0**
**Tiempo Total: ~60 minutos**

---

## 📋 Pre-requisitos

✅ Necesitas:
- Cuenta Gmail o GitHub (para crear cuenta Oracle)
- Tu proyecto en GitHub (privado o público)
- Curiosidad y paciencia

❌ NO necesitas:
- Tarjeta de crédito (opcional)
- Conocimientos avanzados de Linux
- Experiencia con clouds

---

## 🚀 Proceso Completo

### PARTE 1: Crear Cuenta Oracle (5 minutos)

#### Paso 1.1: Registrarse en Oracle Cloud
1. Ir a: https://www.oracle.com/cloud/free/
2. Click en "Start for free"
3. Elegir método de registro (Google/GitHub/Email)
4. Llenar formulario
5. Verificar email
6. Completar registro

#### Paso 1.2: Configurar Cuenta
1. Login a Oracle Cloud Console
2. Ir a "Billing" → Configurar pago
   - ⚠️ Importante: Solo cargará si excedes límites free tier
   - No hay sorpresas automáticas
3. Crear VCN (Virtual Cloud Network)
   - Ir a "Networking" → "Virtual Cloud Networks"
   - Click "Start VCN Wizard"
   - Default settings
   - Create

---

### PARTE 2: Crear Máquina Virtual (10 minutos)

#### Paso 2.1: Crear VM
1. Ir a "Compute" → "Instances"
2. Click "Create Instance"
3. Configurar:
   ```
   Name: unt-app-prod
   Compartment: (default)
   Availability domain: (cualquiera)
   
   IMAGE:
   - Click "Change Image"
   - Buscar "Ubuntu"
   - Seleccionar "Ubuntu 22.04" (LTS)
   
   SHAPE:
   - Click "Change Shape"
   - Seleccionar "Compute" → "Ampere" (ARM)
   - Elegir: 4 OCPUs, 24GB memory (está dentro free tier)
   
   VCN: unt-vcn (la que creaste)
   Subnet: (default)
   Public IP: ASSIGN (importante)
   
   SSH KEY:
   - Opción 1: Generate key (Oracle genera, tú descargas)
   - Opción 2: Paste SSH key (si tienes una)
   
   4. Click "Create"
   ```

#### Paso 2.2: Esperar y Obtener Detalles
1. Esperar ~2 minutos a que la VM esté "Running"
2. Anotar:
   - **IP Pública** (necesitarás para SSH)
   - **User**: ubuntu

---

### PARTE 3: SSH a la VM (5 minutos)

#### Paso 3.1: Conectarse por SSH

**En Windows (PowerShell):**
```powershell
# Si descargaste key de Oracle
$key = "C:\ruta\a\clave.key"
ssh -i $key ubuntu@IP-PUBLICA

# Si usaste tu propia key
ssh -i "C:\ruta\a\tu-clave.pem" ubuntu@IP-PUBLICA
```

**En Mac/Linux:**
```bash
# Asegurar permisos
chmod 600 /ruta/a/clave.key

# Conectar
ssh -i /ruta/a/clave.key ubuntu@IP-PUBLICA
```

#### Paso 3.2: Primer Login
```
Are you sure you want to continue connecting? → Escribir: yes
```

**¡Listo! Ya estás en la VM Oracle.**

---

### PARTE 4: Instalar Docker (10 minutos)

Ejecuta esto en la VM (en la terminal SSH):

```bash
# 1. Actualizar sistema
sudo apt-get update && sudo apt-get upgrade -y

# 2. Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
rm get-docker.sh

# 3. Agregar usuario docker
sudo usermod -aG docker ubuntu
newgrp docker

# 4. Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 5. Verificar
docker --version
docker-compose --version
```

---

### PARTE 5: Clonar Tu Proyecto (5 minutos)

```bash
# Ir a directorio home
cd ~

# Clonar tu repo
git clone https://github.com/TU-USUARIO/unt-practicas-tesis.git app
cd app

# Verificar que están los archivos
ls -la docker-compose.prod.yml
ls -la .env.prod.example
```

---

### PARTE 6: Configurar Secretos (10 minutos) ⚠️ CRÍTICO

```bash
# Copiar template
cp .env.prod.example .env.prod

# Editar archivo
nano .env.prod
```

Cambiar estos valores (generar con: `openssl rand -base64 32`):

```env
# Valores CRÍTICOS - CAMBIAR TODOS:
DB_PASSWORD=CAMBIAR_A_32_CARACTERES_ALEATORIOS
JWT_SECRET=CAMBIAR_A_32_CARACTERES_ALEATORIOS
JWT_REFRESH_SECRET=CAMBIAR_A_32_CARACTERES_ALEATORIOS
REDIS_PASSWORD=CAMBIAR_A_32_CARACTERES_ALEATORIOS

# Valores a actualizar luego (cuando tengas dominio):
API_URL=http://IP-PUBLICA:3000
FRONTEND_URL=http://IP-PUBLICA:3001

# O si ya tienes dominio:
API_URL=https://api.tudominio.com
FRONTEND_URL=https://tudominio.com
```

**Cómo editar en nano:**
1. Cambiar valores
2. Presionar: `Ctrl+X`
3. Presionar: `Y`
4. Presionar: `Enter`

---

### PARTE 7: Levantar Aplicación (5 minutos)

```bash
# Desde directorio app
docker-compose -f docker-compose.prod.yml up -d

# Verificar que todo está corriendo
docker ps

# Ver logs
docker logs -f nombre-del-contenedor-backend
```

Debe mostrar algo como:
```
CONTAINER ID   IMAGE     COMMAND   CREATED        STATUS       PORTS
abc123...      backend   npm run   2 seconds ago   Up 2 seconds 3000/tcp
def456...      frontend  npm run   2 seconds ago   Up 2 seconds 3000/tcp
ghi789...      postgres  postgres  2 seconds ago   Up 2 seconds 5432/tcp
```

---

### PARTE 8: Obtener Dominio Gratis (5 minutos)

**Opción A: DuckDNS (Recomendado)**
1. Ir a: https://www.duckdns.org
2. Login con GitHub
3. Click "Add Domain"
4. Nombre: `miapp` (tu-dominio.duckdns.org)
5. Click "Add"
6. Apuntar IP:
   - Obtener IP de VM: `curl ifconfig.me`
   - En DuckDNS, pegar en campo "IPv4 address"
   - Click "Update"

**Opción B: FreeDNS**
1. Ir a: https://freedns.afraid.org
2. Crear cuenta
3. Agregar dominio
4. Apuntar a tu IP

**Opción C: No-IP**
1. Crear cuenta
2. Agregar dominio
3. Apuntar a tu IP

---

### PARTE 9: Configurar SSL (Let's Encrypt - Gratis) (10 minutos)

```bash
# Instalar Certbot
sudo apt-get install certbot python3-certbot-nginx -y

# Obtener certificado
sudo certbot certonly --standalone -d tu-dominio.duckdns.org

# Responder preguntas:
# Email: tu-email@ejemplo.com
# Accept terms: Y
# Share email: N

# Ver ubicación del certificado (importante):
# /etc/letsencrypt/live/tu-dominio.duckdns.org/
```

---

### PARTE 10: Configurar Nginx con SSL (10 minutos)

```bash
# Editar nginx.conf
nano nginx/nginx.conf

# Descomentar y actualizar estas secciones:
# - ssl_certificate
# - ssl_certificate_key
# - Cambiar puertos si es necesario

# Copiar nginx.conf a Nginx system (OPCIONAL)
# Mejor: usar volumen en docker-compose.prod.yml
```

O más fácil, actualiza `docker-compose.prod.yml`:

```yaml
nginx:
  volumes:
    - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    - ./nginx/ssl:/etc/nginx/ssl:ro
```

---

### PARTE 11: Reiniciar y Verificar (5 minutos)

```bash
# Reiniciar containers
docker-compose -f docker-compose.prod.yml restart

# Esperar 10 segundos
sleep 10

# Verificar que todo funciona
curl http://tu-dominio.duckdns.org
curl https://tu-dominio.duckdns.org  # Si SSL está configurado

# Ver logs
docker-compose -f docker-compose.prod.yml logs
```

---

## ✅ Checklist Final

- [ ] Cuenta Oracle creada
- [ ] VM Ubuntu 22.04 creada
- [ ] SSH funciona
- [ ] Docker instalado y funciona
- [ ] Proyecto clonado
- [ ] `.env.prod` configurado con secretos
- [ ] Docker Compose levantado
- [ ] Todos los containers corriendo
- [ ] Dominio gratis apuntando a IP
- [ ] SSL configurado (Let's Encrypt)
- [ ] Accedes a https://tu-dominio.duckdns.org
- [ ] Login funciona
- [ ] Navegación funciona

---

## 🆘 Troubleshooting

### Error: "connection refused" al SSH
```bash
# Verificar que VM está corriendo
# Verificar Security List (firewall) permite SSH (puerto 22)
```

### Error: "docker: command not found"
```bash
# Asegurar que saliste y re-entraste a la terminal
exit
ssh -i clave.key ubuntu@IP
```

### Error: "Permanent SSL certificate not found"
```bash
# Ejecutar nuevamente:
sudo certbot certonly --standalone -d tu-dominio.duckdns.org
```

### Error: "Containers no inician"
```bash
# Ver logs detallados
docker logs -f nombre-container
```

---

## 📊 Costo Real

| Item | Costo |
|------|-------|
| VM Ubuntu 4 OCPUs 24GB | $0 (free tier) |
| PostgreSQL | $0 (dentro de cuota) |
| Storage 10GB | $0 (free tier) |
| Traffic outbound | $0 (dentro límites) |
| **TOTAL MENSUAL** | **$0** |

**Garantizado SIEMPRE gratis**, no es trial.

---

## 🚀 Próximas Mejoras (Opcionales)

```bash
# 1. Configurar backups automáticos
# 2. Configurar monitoreo
# 3. Agregar second VM para redundancia
# 4. Configurar WAF (Web Application Firewall)
```

---

## 📞 ¿Preguntas?

Si algo no funciona:
1. Verifica que estés siguiendo paso a paso
2. Revisa los logs: `docker logs -f`
3. Verifica conectividad: `curl`
4. Reinicia containers: `docker-compose restart`

**¡Felicidades por desplegar tu app gratis en la nube!** 🎉
