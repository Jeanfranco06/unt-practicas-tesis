# 🚀 Guía Rápida: Deploy en la Nube

## ⭐ OPCIÓN GRATIS (Recomendada para Estudiantes)

### Oracle Cloud Always Free - $0 SIEMPRE

**Tiempo: 30 minutos | Costo: $0 FOREVER**

```bash
# 1. Crear cuenta: https://www.oracle.com/cloud/free
# 2. Crear VM Ubuntu 22.04
# 3. SSH a VM:
ssh -i tu-clave.key ubuntu@IP-PUBLICA

# 4. En la VM ejecutar esto:
git clone https://github.com/TU-USUARIO/unt-practicas-tesis.git app && cd app && \
curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh && rm get-docker.sh && \
sudo usermod -aG docker ubuntu && newgrp docker && \
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && \
sudo chmod +x /usr/local/bin/docker-compose && \
cp .env.prod.example .env.prod && \
nano .env.prod  # Cambiar secretos

# 5. Editar .env.prod (cambiar DB_PASSWORD, JWT_SECRET, etc)
# 6. Levantar:
docker-compose -f docker-compose.prod.yml up -d

# 7. Verificar:
docker ps
curl http://localhost:3001
```

✅ **[Ver guía detallada Oracle](ORACLE_CLOUD_STEP_BY_STEP.md)**

---

## 📋 Otras Opciones (Con Trial/Créditos)

### Opción B: Google Cloud Run ($300 créditos / 90 días)

**Tiempo: 10-15 minutos | Costo: $0 primeros 90 días**

```bash
# Setup (5 min)
gcloud auth login
gcloud config set project unt-practicas

# Deploy (10 min)
./scripts/deploy/gcp-deploy.sh
```

**OPCIÓN B: DigitalOcean App Platform**
```bash
# 1. Pushear código a GitHub
git push origin main

# 2. Ir a https://cloud.digitalocean.com/apps
# 3. Conectar repo
# 4. Seleccionar branch main
# 5. Dejar configuración por defecto
# 6. Hacer click Deploy
```

**OPCIÓN C: AWS ECS**
```bash
./scripts/deploy/aws-deploy.sh
```

### Paso 5: Verificar deployment ✓
```bash
# Hacer curl al health endpoint
curl https://api.TUDOMAIN.COM/health
curl https://TUDOMAIN.COM

# Ver logs
gcloud run services logs read unt-backend-prod --limit 50
```

---

## 🎯 Lo Más Importante

### ⚠️ NUNCA hagas esto:
```bash
# ❌ NO comitear .env.prod
git add .env.prod  # MALO
git commit -m "Add env file"

# ❌ NO cambiar docker-compose.yml para producción
# Usar docker-compose.prod.yml en su lugar

# ❌ NO usar las mismas contraseñas de desarrollo
# Generar nuevas contraseñas aleatorias largas
```

### ✅ SIEMPRE hace esto:
```bash
# ✓ Guardar .env.prod en un lugar seguro (gestor de contraseñas)
# ✓ Hacer backup del .env.prod actual antes de cambios
# ✓ Verificar que todos los secretos son diferentes y largos
# ✓ Testear en local primero antes de deployar

# Generar contraseñas seguras
openssl rand -base64 32
```

---

## 🚀 Comparación Rápida de Plataformas

| Criterio | Google Cloud Run | DigitalOcean | AWS ECS |
|----------|-----------------|--------------|---------|
| **Facilidad** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **Costo** | $$ | $$ | $$$ |
| **Escalabilidad** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Mantenimiento** | Bajo | Bajo | Medio |
| **Para comenzar** | ✓✓✓ | ✓✓✓✓✓ | ✓ |

---

## 📞 Obtener Ayuda

Si tienes problemas:

1. **Revisar los logs:**
   ```bash
   gcloud run services logs read unt-backend-prod --limit 100
   ```

2. **Verificar configuración:**
   ```bash
   gcloud run services describe unt-backend-prod
   ```

3. **Leer guía completa:**
   - [CLOUD_DEPLOYMENT_GUIDE.md](CLOUD_DEPLOYMENT_GUIDE.md)

4. **Testing local:**
   ```bash
   docker-compose -f docker-compose.prod.yml up
   ```

---

## 🔗 URLs después del deploy

- **Frontend:** https://TUDOMAIN.COM
- **API:** https://api.TUDOMAIN.COM
- **Health check:** https://api.TUDOMAIN.COM/health
- **Base de datos:** No expuesta públicamente (privada)

---

## 📋 Paso siguiente

Después de desplegar exitosamente:

1. ✓ Configurar dominio personalizado
2. ✓ Renovación automática de certificados SSL
3. ✓ Configurar monitoreo y alertas
4. ✓ Setup de backups automáticos
5. ✓ Documentar tu ambiente específico

**Leer:** [CLOUD_DEPLOYMENT_GUIDE.md](CLOUD_DEPLOYMENT_GUIDE.md) para detalles completos.
