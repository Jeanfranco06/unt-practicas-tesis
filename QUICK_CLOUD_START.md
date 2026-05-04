# Guía Rápida: 5 Pasos para Deploy en la Nube

## ⚡ Quick Start (30 minutos)

### Paso 1: Preparar ambiente local ✓
```bash
# Clonar repo
git clone <repo-url>
cd unt-practicas-tesis

# Verificar que todo funciona localmente
docker-compose up -d
# Visitar http://localhost:3001
# Login con admin@unt.edu.pe / password123
```

### Paso 2: Ejecutar script de preparación ✓
```bash
# Windows
.\scripts\prepare-cloud-deployment.bat

# Linux/Mac
chmod +x scripts/prepare-cloud-deployment.sh
./scripts/prepare-cloud-deployment.sh
```

### Paso 3: Configurar secretos ✓
```bash
# Editar archivo .env.prod
nano .env.prod  # o notepad en Windows

# CAMBIAR ESTOS VALORES (mínimo 32 caracteres cada uno):
DB_PASSWORD=CAMBIAR_A_CONTRASEÑA_FUERTE
JWT_SECRET=CAMBIAR_A_SECRETO_ALEATORIO_LARGO
JWT_REFRESH_SECRET=CAMBIAR_A_OTRO_SECRETO_ALEATORIO
REDIS_PASSWORD=CAMBIAR_A_CONTRASEÑA_FUERTE
API_URL=https://api.TUDOMAIN.COM
FRONTEND_URL=https://TUDOMAIN.COM
```

### Paso 4: Elegir plataforma cloud y configurar ✓

**OPCIÓN A: Google Cloud Run (Recomendado para empezar)**
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
