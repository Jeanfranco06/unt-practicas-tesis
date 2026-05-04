# 📋 Checklist de Preparación para Cloud Deployment

## ✅ Pre-Deployment (Local)

### Configuración del Proyecto
- [ ] Clonar repositorio localmente
- [ ] Instalar Docker Desktop
- [ ] Instalar Docker Compose
- [ ] `docker-compose up -d` - Verificar que funciona localmente
- [ ] Acceder a http://localhost:3001
- [ ] Login exitoso con admin@unt.edu.pe / password123

### Preparación de Archivos
- [ ] Ejecutar script de preparación:
  - Windows: `.\scripts\prepare-cloud-deployment.bat`
  - Linux/Mac: `chmod +x scripts/prepare-cloud-deployment.sh && ./scripts/prepare-cloud-deployment.sh`

### Configuración de Secretos
- [ ] Copiar `.env.prod.example` a `.env.prod`
- [ ] **Cambiar TODOS estos valores** a strings aleatorios largos (mínimo 32 caracteres):
  - [ ] `DB_PASSWORD` - Nueva contraseña segura
  - [ ] `JWT_SECRET` - String aleatorio para JWT
  - [ ] `JWT_REFRESH_SECRET` - String aleatorio diferente
  - [ ] `REDIS_PASSWORD` - Contraseña para Redis
  - [ ] `API_URL` - Tu dominio API (ej: https://api.tudominio.com)
  - [ ] `FRONTEND_URL` - Tu dominio frontend (ej: https://tudominio.com)
- [ ] Agregar `.env.prod` a `.gitignore`
- [ ] Verificar que `.env.prod` NO está en git: `git status`
- [ ] **GUARDAR `.env.prod` en lugar seguro** (gestor de contraseñas)

### Validación
- [ ] Ejecutar validador:
  - Windows: `.\scripts\validate-cloud-deployment.bat`
  - Linux/Mac: `chmod +x scripts/validate-cloud-deployment.sh && ./scripts/validate-cloud-deployment.sh`
- [ ] Todos los checks verdes ✓

## 🌥️ Elegir Plataforma Cloud

### Opción 1: Google Cloud Run ⭐ (RECOMENDADO para empezar)
- [ ] Crear cuenta en [Google Cloud Console](https://console.cloud.google.com)
- [ ] Crear nuevo proyecto
- [ ] Instalar `gcloud` CLI
- [ ] `gcloud auth login`
- [ ] Seguir: [CLOUD_DEPLOYMENT_GUIDE.md](CLOUD_DEPLOYMENT_GUIDE.md) - Sección Google Cloud Run

### Opción 2: DigitalOcean ⭐ (MÁS FÁCIL)
- [ ] Crear cuenta en [DigitalOcean](https://www.digitalocean.com)
- [ ] Conectar cuenta GitHub
- [ ] Crear nueva App
- [ ] Seleccionar repositorio y branch main
- [ ] Seguir: [CLOUD_DEPLOYMENT_GUIDE.md](CLOUD_DEPLOYMENT_GUIDE.md) - Sección DigitalOcean

### Opción 3: AWS ECS
- [ ] Crear cuenta AWS
- [ ] Configurar AWS CLI
- [ ] Crear ECR repositories
- [ ] Crear RDS Database
- [ ] Seguir: [CLOUD_DEPLOYMENT_GUIDE.md](CLOUD_DEPLOYMENT_GUIDE.md) - Sección AWS ECS

### Opción 4: Azure
- [ ] Crear cuenta Azure
- [ ] Instalar Azure CLI
- [ ] Seguir: [CLOUD_DEPLOYMENT_GUIDE.md](CLOUD_DEPLOYMENT_GUIDE.md) - Sección Azure

## 🚀 Deployment

### Pre-Deploy Final
- [ ] Último commit de cambios: `git add . && git commit -m "Prepare for cloud deployment"`
- [ ] Push a GitHub: `git push origin main`
- [ ] Verificar que `.env.prod` NO está en el commit
- [ ] Hacer backup de `.env.prod` localmente
- [ ] Leer guía de la plataforma elegida en CLOUD_DEPLOYMENT_GUIDE.md

### Crear Infraestructura Cloud
- [ ] Base de datos PostgreSQL (administrada)
- [ ] Cache Redis (administrado)
- [ ] Configurar redes/VPCs si es necesario
- [ ] Crear registros de contenedores (ECR/GCR/etc)

### Deploy de Aplicación
- [ ] Build imágenes Docker con Dockerfile.prod
- [ ] Push imágenes a registro cloud
- [ ] Configurar variables de entorno en plataforma cloud
- [ ] Configurar health checks
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Verificar logs sin errores

### Configuración de Dominio
- [ ] Comprar dominio (Namecheap, GoDaddy, etc)
- [ ] Configurar DNS A records
- [ ] Configurar CNAME records si es necesario
- [ ] Mapear dominio a aplicación cloud
- [ ] Esperar propagación DNS (1-24 horas)

### SSL/TLS
- [ ] Certificado SSL automático (Let's Encrypt)
- [ ] Verificar HTTPS funciona
- [ ] Verificar certificado es válido: `curl -I https://tudominio.com`
- [ ] Redireccionamiento HTTP -> HTTPS configurado

## ✔️ Post-Deployment

### Verificación Funcional
- [ ] Acceder a https://tudominio.com
- [ ] Página carga correctamente
- [ ] Verificar CSS/JS se cargan (sin errores 404)
- [ ] Verificar api.tudominio.com/health responde
- [ ] Login exitoso con credenciales
- [ ] Navegación por la aplicación funciona
- [ ] Crear/editar/eliminar datos funciona
- [ ] Descargas (PDFs) funcionan
- [ ] Upload de archivos funciona

### Configurar Monitoreo
- [ ] Alertas por errores de aplicación
- [ ] Alertas por CPU alto (>80%)
- [ ] Alertas por memoria alta (>85%)
- [ ] Alertas por BD sin respuesta
- [ ] Alertas por Redis sin respuesta
- [ ] Dashboard de logs configurado
- [ ] Email de notificación configurado

### Seguridad
- [ ] Rotación de secretos programada (cada 90 días)
- [ ] Backups automáticos de BD (diario)
- [ ] WAF (Web Application Firewall) si aplica
- [ ] Rate limiting activo
- [ ] CORS configurado correctamente
- [ ] Headers de seguridad configurados (CSP, X-Frame, etc)
- [ ] Auditar logs regularmente

### Mantenimiento
- [ ] Configurar alertas de certificado SSL (renovación)
- [ ] Plan de escalado (si traffic aumenta)
- [ ] Documentar passwords/keys en gestor seguro
- [ ] Entrenar equipo en procedimientos
- [ ] Crear runbooks para incidentes comunes
- [ ] Planificar mantenimiento mensual

## 📞 Recursos de Consulta

- [CLOUD_DEPLOYMENT_GUIDE.md](CLOUD_DEPLOYMENT_GUIDE.md) - Guía completa por plataforma
- [QUICK_CLOUD_START.md](QUICK_CLOUD_START.md) - Guía rápida (5 pasos)
- [DOCKER_SETUP.md](DOCKER_SETUP.md) - Setup local

## 🆘 Si Algo Falla

1. **Revisar logs:**
   ```bash
   # GCP
   gcloud run services logs read unt-backend-prod --limit 100
   
   # AWS
   aws logs tail /ecs/unt-app-service --follow
   ```

2. **Verificar conectividad a BD:**
   ```bash
   # Conectarse a base de datos
   psql -h <db-host> -U unt_prod_user -d unt_practicas_tesis
   ```

3. **Verificar vars de entorno:**
   ```bash
   # Listar todas las variables
   gcloud run services describe unt-backend-prod
   ```

4. **Rollback (si es necesario):**
   ```bash
   # Volver a versión anterior
   gcloud run deploy unt-backend-prod --revision <previous-revision-id>
   ```

## 🎉 ¡Lo Lograste!

Felicidades por desplegar tu aplicación en la nube. Ahora:
- Monitorea la aplicación regularmente
- Recopila feedback de usuarios
- Planifica mejoras futuras
- Mantén documentación actualizada
- Mantén secretos seguros
