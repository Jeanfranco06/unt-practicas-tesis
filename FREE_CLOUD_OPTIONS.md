# 🆓 Cloud Deployment GRATIS - Opciones Reales 2026

## 🏆 Mejores Opciones Gratuitas

### 1. Oracle Cloud Always Free ⭐⭐⭐ (MEJOR OPCIÓN)
**Costo: $0 SIEMPRE**

✅ Lo que incluye:
- 2 máquinas virtuales Linux (4GB RAM, 2 CPUs cada una)
- 1 Base de datos PostgreSQL gratis (20GB)
- 10GB Object Storage
- 100GB Outbound bandwidth/mes
- Sin límite de tiempo
- Sin tarjeta de crédito (opcional)

**Tiempo de deployment: 30-45 minutos**

```bash
# 1. Crear cuenta en https://www.oracle.com/cloud/free
# 2. Crear 2 VMs Linux (Ubuntu 22.04)
# 3. Instalar Docker en ambas
# 4. Usar docker-compose.prod.yml
# 5. Usar dominio gratis (FreeDNS, etc)
```

**Pros:**
- Completamente gratis FOREVER
- Recursos suficientes para una app mediana
- Buena performance
- Confiable (Oracle enterprise)

**Contras:**
- Setup inicial más manual
- No es serverless (necesitas administrar VMs)
- Interface algo compleja

---

### 2. Google Cloud $300 créditos ⭐⭐ (RÁPIDO)
**Costo: $0 primeros 90 días + $300 créditos (no automático a pago)**

✅ Incluye:
- Cloud Run (serverless) - más de sobra con $300
- Cloud SQL (PostgreSQL) - gratis durante prueba
- Memorystore (Redis) - gratis durante prueba
- $300 créditos = ~3-4 meses de hosting

**Tiempo de deployment: 5-10 minutos**

```bash
# Scripts que ya preparé funcionan perfecto:
gcloud auth login
./scripts/deploy/gcp-deploy.sh
```

**Pros:**
- Setup fácil y rápido
- Muy escalable
- Documentación excelente

**Contras:**
- Gratuito solo 90 días
- Después requiere tarjeta de crédito
- Puede costar si sales del free tier

---

### 3. AWS Free Tier ⭐⭐ (CLÁSICO)
**Costo: $0 primeros 12 meses**

✅ Incluye:
- EC2 (máquina virtual) t2.micro
- RDS PostgreSQL db.t2.micro
- ElastiCache para Redis
- 1GB outbound data/mes

**Tiempo de deployment: 15-20 minutos**

```bash
# Scripts que preparé también funcionan:
./scripts/deploy/aws-deploy.sh
```

**Pros:**
- 12 meses gratis
- Muy popular, mucha documentación
- Buena performance

**Contras:**
- Solo 12 meses
- Después cuesta
- Setup más complejo

---

### 4. Microsoft Azure $200 créditos ⭐ (DESCUENTO)
**Costo: $0 primeros 30 días + $200 créditos**

✅ Incluye:
- App Service (web hosting)
- Azure Database for PostgreSQL
- Azure Cache for Redis

**Pros:**
- Buen descuento inicial
- Integración Microsoft

**Contras:**
- Solo 30 días de trial
- Después requiere pago

---

### 5. Fly.io + Render (COMBINADO)
**Costo: Mínimo $3-5/mes**

✅ Opción barata pero no gratis:
- Fly.io: Desde $3/mes
- Render: Tier gratuito (con limitaciones)

---

## 🎯 Mi Recomendación: ORACLE CLOUD ALWAYS FREE

### ¿Por qué Oracle?
1. **Completamente gratis SIEMPRE** (no es trial)
2. **Recursos buenos:** 2 VMs de 4GB RAM c/u
3. **BD PostgreSQL gratis** (el suyo necesita BD)
4. **Sin sorpresas de billing**

### Plan de Deployment Oracle (Paso a Paso)

#### Paso 1: Crear Cuenta Oracle (10 min)
```
1. Ir a https://www.oracle.com/cloud/free
2. Click "Start for free"
3. Crear cuenta (puedes usar GitHub para SSO)
4. Verificar email
5. Login a OCI Console
```

#### Paso 2: Crear 2 VMs Linux (15 min)

**VM 1: Backend & Database**
```
1. Ir a Compute → Instances
2. Click "Create Instance"
3. Image: Ubuntu 22.04 (Always Free eligible)
4. Shape: Ampere (ARM, gratis)
5. VCN: Create new
6. Public IP: Assign (importante)
7. Create
8. Descargar SSH key
```

**VM 2: Frontend (Opcional, puedes usar VM 1)**
- Repetir proceso

#### Paso 3: Instalar Docker (10 min)

```bash
# SSH a VM 1
ssh -i tu-clave.key ubuntu@IP-PUBLICA

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar
docker --version
docker-compose --version
```

#### Paso 4: Crear Base de Datos Oracle (5 min)

```
1. Database → MySQL Database Service (o PostgreSQL)
2. Click Create Database
3. Choose: Always Free MySQL 8.0
4. Configure:
   - Admin password (SEGURA)
   - Backup: Enabled
5. Create
6. Esperar 5-10 minutos
7. Obtener hostname para conexión
```

#### Paso 5: Subir Código a VM (5 min)

```bash
# En tu computadora
scp -i tu-clave.key -r . ubuntu@IP-PUBLICA:/home/ubuntu/app

# SSH a VM
ssh -i tu-clave.key ubuntu@IP-PUBLICA

# En VM
cd /home/ubuntu/app
```

#### Paso 6: Configurar Variables (3 min)

```bash
# En VM
nano .env.prod

# Cambiar:
DB_HOST=endpoint-de-oracle-db
DB_PASSWORD=la-que-estableciste
API_URL=http://IP-PUBLICA:3000   # O dominio
FRONTEND_URL=http://IP-PUBLICA:3001
```

#### Paso 7: Levantar con Docker Compose (5 min)

```bash
# En VM
docker-compose -f docker-compose.prod.yml up -d

# Verificar
docker ps
docker logs -f nombre-del-container
```

#### Paso 8: Obtener Dominio Gratis (5 min)

```
Opciones gratuitas:
1. FreeDNS.afraid.org - Subdominio gratis
2. Duckdns.org - Subdominio .duckdns.org gratis
3. No-IP.com - DDNS gratis

Ej: miapp.duckdns.org → IP-PUBLICA
```

#### Paso 9: Configurar SSL Gratis (5 min)

```bash
# En VM, instalar Certbot
sudo apt-get install certbot python3-certbot-nginx -y

# Obtener certificado Let's Encrypt (gratis)
sudo certbot certonly --standalone -d miapp.duckdns.org
# O manual con webroot
```

#### Paso 10: Actualizar Nginx (5 min)

```bash
# Tu nginx.conf ya está listo, solo agregar SSL
# Ver template completo abajo
```

---

## 🔧 Script Simplificado para Oracle

Voy a crear un script que automatiza TODO para Oracle:

```bash
#!/bin/bash

# Script para setup automático en Oracle Cloud Always Free

set -e

echo "=== Oracle Cloud Always Free Setup ==="

# 1. Actualizar sistema
sudo apt-get update && sudo apt-get upgrade -y

# 2. Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# 3. Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 4. Instalar Certbot (SSL)
sudo apt-get install certbot python3-certbot-nginx -y

# 5. Clonar repositorio
cd /home/ubuntu
git clone <TU-REPO> app
cd app

# 6. Crear .env.prod
cp .env.prod.example .env.prod

# 7. Editar .env.prod manualmente
echo "⚠️  EDITA .env.prod con tus valores:"
echo "   nano .env.prod"

# 8. Levantar app
docker-compose -f docker-compose.prod.yml up -d

# 9. Obtener certificado SSL
read -p "Ingresa tu dominio (ej: miapp.duckdns.org): " DOMAIN
sudo certbot certonly --nginx -d $DOMAIN

# 10. Aplicar SSL a nginx
# (nginx.conf ya está configurado para SSL)

echo "✓ ¡Setup completado!"
echo ""
echo "Próximos pasos:"
echo "1. Verifica que esté corriendo: docker ps"
echo "2. Accede a: https://$DOMAIN"
echo "3. Configura backups automáticos"
```

---

## 💾 Estimación de Costos Reales

| Opción | Mes 1-3 | Mes 4-12 | Después |
|--------|---------|---------|---------|
| **Oracle Always Free** | $0 | $0 | $0 |
| **Google Cloud** | $0 | $0 | ~$20-40 |
| **AWS Free Tier** | $0 | $0 | ~$30-50 |
| **Azure** | $0 | ~$10-20 | ~$20-40 |
| **Fly.io** | $3-5 | $3-5 | $3-5 |

**MEJOR: Oracle Cloud = $0 SIEMPRE**

---

## 🆘 Comparación Rápida

### Oracle Cloud (RECOMENDADO)
```
✅ Completamente gratis SIEMPRE
✅ Recursos buenos (2 VMs 4GB)
✅ BD PostgreSQL incluida
✅ Sin sorpresas
❌ Setup manual inicial
❌ Necesitas aprender VMs
```

### Google Cloud ($300)
```
✅ Setup fácil (5 min)
✅ Serverless (menos mantenimiento)
✅ 90 días + $300 créditos
❌ Después cuesta dinero
❌ Puedes pasarte de cuota accidentalmente
```

### AWS (12 meses)
```
✅ 12 meses gratis
✅ Buena documentación
❌ Solo 12 meses
❌ Setup más complejo
❌ Luego cuesta
```

---

## 📋 Decisión Final

**Para proyecto de estudiantes/tesis → ORACLE CLOUD ALWAYS FREE**

Razones:
1. **Gratis para siempre** (importante para estudiantes)
2. **Suficientes recursos** (más que lo necesario)
3. **BD administrada** (no necesitas mantener)
4. **Confiable** (Oracle es empresa seria)
5. **SLA 99.9%** (buena disponibilidad)

**Total a pagar: $0**

---

## 🚀 ¿Necesitas Ayuda?

¿Quieres que prepare un script completo de deploy para Oracle Cloud?

Puedo crear:
1. Script bash que automatiza TODO
2. Guía paso-a-paso visual
3. Dockerfile optimizado para ARM (Oracle usa Ampere)
4. Configuración de backups automáticos

¿Quieres que lo haga?
