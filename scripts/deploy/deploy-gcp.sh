#!/bin/bash

# Script de Deployment Automatico a Google Cloud Run
# Ejecutar con: bash deploy-gcp.sh

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  UNT Prácticas - Google Cloud Run Automatic Deployment        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# 1. Verificar que gcloud está instalado
info "Verificando gcloud CLI..."
if ! command -v gcloud &> /dev/null; then
    error "gcloud CLI no está instalado. Descárgalo de: https://cloud.google.com/sdk/docs/install"
fi
success "gcloud CLI encontrado"
echo ""

# 2. Verificar autenticación
info "Verificando autenticación..."
auth=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null || true)
if [ -z "$auth" ]; then
    error "No estás autenticado en Google Cloud. Ejecuta: gcloud auth login"
fi
success "Autenticado como: $auth"
echo ""

# 3. Obtener proyecto
info "Obteniendo proyecto configurado..."
project=$(gcloud config get-value project 2>/dev/null || true)
if [ -z "$project" ]; then
    error "No hay proyecto configurado. Ejecuta: gcloud config set project TU_PROJECT_ID"
fi
success "Proyecto: $project"
echo ""

# 4. Verificar que Cloud SQL existe
info "Obteniendo datos de Cloud SQL..."
sql_instance=$(gcloud sql instances describe unt-postgres-prod --format="value(ipAddresses[0].ipAddress)" 2>/dev/null || true)
if [ -z "$sql_instance" ]; then
    error "Cloud SQL 'unt-postgres-prod' no existe. Crea primero: gcloud sql instances create unt-postgres-prod --database-version=POSTGRES_15 --tier=db-f1-micro --region=us-central1"
fi
success "Cloud SQL IP: $sql_instance"
echo ""

# 5. Verificar que Redis existe
info "Obteniendo datos de Redis..."
redis_host=$(gcloud redis instances describe unt-redis-prod --region=us-central1 --format="value(host)" 2>/dev/null || true)
if [ -z "$redis_host" ]; then
    error "Redis 'unt-redis-prod' no existe. Crea primero: gcloud redis instances create unt-redis-prod --size=2 --region=us-central1"
fi
redis_port=$(gcloud redis instances describe unt-redis-prod --region=us-central1 --format="value(port)" 2>/dev/null || true)
success "Redis Host: ${redis_host}:${redis_port}"
echo ""

# 6. Actualizar .env.prod
info "Actualizando .env.prod con valores de GCP..."

backend_url="https://unt-backend-prod.a.run.app"
frontend_url="https://unt-frontend-prod.a.run.app"

# Crear backup
cp .env.prod .env.prod.backup

# Actualizar valores
sed -i "s/DB_HOST=.*/DB_HOST=$sql_instance/" .env.prod
sed -i "s/REDIS_URL=.*/REDIS_URL=redis:\/\/${redis_host}:${redis_port}/" .env.prod
sed -i "s|API_URL=.*|API_URL=$backend_url|" .env.prod
sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=$frontend_url|" .env.prod
sed -i "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=$backend_url|" .env.prod

success ".env.prod actualizado"
echo ""

# 7. Deploy Backend
info "Desplegando Backend en Cloud Run..."
warning "Esto puede tardar 3-5 minutos..."

gcloud run deploy unt-backend-prod \
    --source backend \
    --region us-central1 \
    --platform managed \
    --dockerfile Dockerfile.prod \
    --memory 1Gi \
    --cpu 2 \
    --timeout 3600 \
    --allow-unauthenticated \
    --env-vars-file .env.prod \
    --quiet || error "Error al desplegar Backend"

success "Backend desplegado exitosamente"
echo ""

# 8. Deploy Frontend
info "Desplegando Frontend en Cloud Run..."
warning "Esto puede tardar 3-5 minutos..."

gcloud run deploy unt-frontend-prod \
    --source frontend \
    --region us-central1 \
    --platform managed \
    --dockerfile Dockerfile.prod \
    --memory 512Mi \
    --cpu 1 \
    --allow-unauthenticated \
    --env-vars-file .env.prod \
    --quiet || error "Error al desplegar Frontend"

success "Frontend desplegado exitosamente"
echo ""

# Obtener URLs finales
echo "════════════════════════════════════════════════════════════════"
success "DEPLOYMENT COMPLETADO EXITOSAMENTE"
echo "════════════════════════════════════════════════════════════════"
echo ""

backend_final=$(gcloud run services describe unt-backend-prod --region us-central1 --format='value(status.url)')
frontend_final=$(gcloud run services describe unt-frontend-prod --region us-central1 --format='value(status.url)')

info "URLs de acceso:"
echo "  Backend:  $backend_final"
echo "  Frontend: $frontend_final"
echo ""

info "Para monitorear logs:"
echo "  gcloud run services logs read unt-backend-prod --region us-central1 --follow"
echo ""

success "Tu aplicación está en producción!"
