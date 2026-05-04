# ⚡ Oracle Cloud GRATIS - Guía Ultra Rápida (30 minutos)

## 🎯 En 4 Pasos

### PASO 1: Crear Cuenta Oracle (5 min)
```
1. https://www.oracle.com/cloud/free
2. Botón "Start for free"
3. Llenar datos
4. Verificar email
```

### PASO 2: Crear VM (5 min)
```
1. Compute → Instances → Create Instance
2. Image: Ubuntu 22.04
3. Shape: Ampere (free tier)
4. Public IP: Assign
5. Download SSH Key
6. Create
```

### PASO 3: Conectar y Setup (15 min)
```bash
# SSH a VM
ssh -i tu-clave.key ubuntu@IP-PUBLICA

# En la VM, ejecutar TODO esto de una vez:
sudo apt-get update && sudo apt-get upgrade -y && \
curl -fsSL https://get.docker.com -o get-docker.sh && \
sudo sh get-docker.sh && rm get-docker.sh && \
sudo usermod -aG docker ubuntu && newgrp docker && \
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && \
sudo chmod +x /usr/local/bin/docker-compose && \
sudo apt-get install git -y && \
cd ~ && \
git clone https://github.com/TU-USUARIO/unt-practicas-tesis.git app && \
cd app && \
cp .env.prod.example .env.prod
```

### PASO 4: Editar Config y Desplegar (5 min)
```bash
# Editar .env.prod
nano .env.prod

# Cambiar SOLO estos (generar con: openssl rand -base64 32):
# DB_PASSWORD=
# JWT_SECRET=
# JWT_REFRESH_SECRET=
# REDIS_PASSWORD=
# API_URL=http://IP-PUBLICA:3000
# FRONTEND_URL=http://IP-PUBLICA:3001

# Guardar: Ctrl+X → Y → Enter

# Levantar!
docker-compose -f docker-compose.prod.yml up -d

# Verificar
docker ps  # Ver containers corriendo
curl http://localhost:3001  # Probar frontend
```

**¡Listo! Tu app está en producción GRATIS** ✨

---

## 🔗 Dominio Gratis (Opcional)

Si quieres dominio personalizado:

```bash
# 1. Ir a https://www.duckdns.org
# 2. Crear dominio (ej: miapp.duckdns.org)
# 3. Obtener tu IP:
curl ifconfig.me

# 4. En DuckDNS pegar esa IP
# 5. Listo! Ahora acceder a:
https://miapp.duckdns.org
```

---

## 📊 Costo

**$0 SIEMPRE**

Oracle Cloud Always Free = gratis de verdad, no es trial.

---

## 🆘 No Funciona?

```bash
# Ver logs
docker logs -f nombre-container

# Todos los containers corriendo?
docker ps

# Reiniciar
docker-compose -f docker-compose.prod.yml restart
```

---

**Guía completa:** [ORACLE_CLOUD_STEP_BY_STEP.md](ORACLE_CLOUD_STEP_BY_STEP.md)
