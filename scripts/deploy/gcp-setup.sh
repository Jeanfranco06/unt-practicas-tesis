#!/bin/bash

# Script de Setup Automático para Google Cloud Run
# Este script automatiza la mayoría de pasos de configuración

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}UNT Prácticas - Google Cloud Run Setup${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}\n"

# Verificar que gcloud está instalado
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}✗ Error: gcloud CLI no está instalado${NC}"
    echo "Descárgalo de: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Verificar que docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Error: Docker no está instalado${NC}"
    exit 1
fi

# Paso 1: Autenticación
echo -e "${BLUE}[1/8] Autenticación con Google Cloud...${NC}"
gcloud auth login
echo -e "${GREEN}✓ Autenticado${NC}\n"

# Paso 2: Seleccionar/crear proyecto
echo -e "${BLUE}[2/8] Configurando proyecto...${NC}"
read -p "Ingresa PROJECT_ID de GCP (o Enter para crear uno nuevo): " PROJECT_ID

if [ -z "$PROJECT_ID" ]; then
    read -p "Nombre del nuevo proyecto: " NEW_PROJECT_NAME
    PROJECT_ID=$(echo $NEW_PROJECT_NAME | tr ' ' '-' | tr '[:upper:]' '[:lower:'])-$(date +%s)
    gcloud projects create $PROJECT_ID --name="$NEW_PROJECT_NAME"
fi

gcloud config set project $PROJECT_ID
echo -e "${GREEN}✓ Proyecto: $PROJECT_ID${NC}\n"

# Paso 3: Habilitar APIs
echo -e "${BLUE}[3/8] Habilitando APIs necesarias...${NC}"
gcloud services enable run.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable redis.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable compute.googleapis.com
echo -e "${GREEN}✓ APIs habilitadas${NC}\n"

# Paso 4: Crear Cloud SQL
echo -e "${BLUE}[4/8] Creando Cloud SQL PostgreSQL...${NC}"
gcloud sql instances create unt-postgres-prod \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=us-central1 \
    --backup \
    --no-backup-start-time \
    --enable-bin-log \
    --quiet || echo -e "${YELLOW}⚠️  Instancia Cloud SQL podría ya existir${NC}"

sleep 5

# Crear BD
gcloud sql databases create unt_practicas_tesis \
    --instance=unt-postgres-prod \
    --quiet || echo -e "${YELLOW}⚠️  BD podría ya existir${NC}"

# Crear usuario
read -sp "Contraseña para unt_prod_user: " DB_PASSWORD
gcloud sql users create unt_prod_user \
    --instance=unt-postgres-prod \
    --password="$DB_PASSWORD" \
    --quiet || echo -e "${YELLOW}⚠️  Usuario podría ya existir${NC}"

DB_IP=$(gcloud sql instances describe unt-postgres-prod \
    --format="value(ipAddresses[0].ipAddress)")
echo -e "${GREEN}✓ Cloud SQL creado - IP: $DB_IP${NC}\n"

# Paso 5: Crear Redis
echo -e "${BLUE}[5/8] Creando Memorystore Redis...${NC}"
gcloud redis instances create unt-redis-prod \
    --size=2 \
    --region=us-central1 \
    --redis-version=7.0 \
    --tier=basic \
    --quiet || echo -e "${YELLOW}⚠️  Redis podría ya existir${NC}"

sleep 5

REDIS_HOST=$(gcloud redis instances describe unt-redis-prod \
    --region=us-central1 \
    --format="value(host)")
REDIS_PORT=$(gcloud redis instances describe unt-redis-prod \
    --region=us-central1 \
    --format="value(port)")

echo -e "${GREEN}✓ Redis creado - Host: $REDIS_HOST:$REDIS_PORT${NC}\n"

# Paso 6: Preparar .env.prod
echo -e "${BLUE}[6/8] Preparando .env.prod...${NC}"
if [ ! -f ".env.prod" ]; then
    cp .env.prod.example .env.prod
fi

# Actualizar valores en .env.prod
read -p "URL del API (ej: https://api.tudominio.com o Enter para generar): " API_URL
if [ -z "$API_URL" ]; then
    API_URL="https://unt-backend-prod.a.run.app"
fi

read -p "URL del Frontend (ej: https://tudominio.com o Enter para generar): " FRONTEND_URL
if [ -z "$FRONTEND_URL" ]; then
    FRONTEND_URL="https://unt-frontend-prod.a.run.app"
fi

# Actualizar .env.prod (simple replacement)
sed -i.bak "s|^DB_HOST=.*|DB_HOST=$DB_IP|" .env.prod
sed -i.bak "s|^DB_PASSWORD=.*|DB_PASSWORD=$DB_PASSWORD|" .env.prod
sed -i.bak "s|^REDIS_URL=.*|REDIS_URL=redis://$REDIS_HOST:$REDIS_PORT|" .env.prod
sed -i.bak "s|^API_URL=.*|API_URL=$API_URL|" .env.prod
sed -i.bak "s|^FRONTEND_URL=.*|FRONTEND_URL=$FRONTEND_URL|" .env.prod
sed -i.bak "s|^NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=$API_URL|" .env.prod

echo -e "${GREEN}✓ .env.prod actualizado${NC}\n"

# Paso 7: Conectar GitHub (si existe repo)
echo -e "${BLUE}[7/8] Configurando Cloud Build (Opcional)...${NC}"
read -p "¿Conectar repositorio GitHub para CI/CD? (y/n): " CONNECT_GITHUB

if [ "$CONNECT_GITHUB" = "y" ]; then
    read -p "Usuario de GitHub: " GITHUB_USER
    read -p "Nombre del repositorio: " REPO_NAME
    
    gcloud builds connect --repository-name=$REPO_NAME --repository-owner=$GITHUB_USER
    echo -e "${GREEN}✓ GitHub conectado a Cloud Build${NC}"
else
    echo -e "${YELLOW}⚠️  Cloud Build manual - necesitarás hacer deploy manual${NC}"
fi

echo ""

# Paso 8: Mostrar resumen
echo -e "${BLUE}[8/8] Resumen de Configuración${NC}"
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo "Google Cloud Run Setup Completado"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo "Información importante:"
echo ""
echo -e "  ${BLUE}Proyecto:${NC} $PROJECT_ID"
echo -e "  ${BLUE}Región:${NC} us-central1"
echo -e "  ${BLUE}Cloud SQL IP:${NC} $DB_IP"
echo -e "  ${BLUE}Redis Host:${NC} $REDIS_HOST:$REDIS_PORT"
echo -e "  ${BLUE}API URL:${NC} $API_URL"
echo -e "  ${BLUE}Frontend URL:${NC} $FRONTEND_URL"
echo ""

echo -e "${YELLOW}Próximos pasos:${NC}"
echo ""
echo "1. Guardar .env.prod en lugar SEGURO (1Password, etc)"
echo "   NO comitear a Git (ya en .gitignore)"
echo ""
echo "2. Deploy Backend:"
echo "   gcloud run deploy unt-backend-prod \\"
echo "     --source backend \\"
echo "     --region us-central1 \\"
echo "     --dockerfile Dockerfile.prod \\"
echo "     --env-vars-file .env.prod"
echo ""
echo "3. Deploy Frontend:"
echo "   gcloud run deploy unt-frontend-prod \\"
echo "     --source frontend \\"
echo "     --region us-central1 \\"
echo "     --dockerfile Dockerfile.prod \\"
echo "     --env-vars-file .env.prod"
echo ""
echo "4. Configurar dominio personalizado (opcional):"
echo "   Cloud Console → Cloud Run → Servicio → Mapear dominio personalizado"
echo ""
echo -e "${GREEN}✓ ¡Setup completado! Ahora a desplegar.${NC}"
