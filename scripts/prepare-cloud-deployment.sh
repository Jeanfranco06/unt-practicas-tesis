#!/bin/bash

# Script para preparar el deployment en diferentes plataformas cloud
# Este script ayuda a crear la estructura necesaria para desplegar en la nube

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}UNT Prácticas y Tesis - Cloud Deployment Preparation${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

# 1. Validar que estamos en el directorio correcto
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}✗ Error: No se encontró docker-compose.yml${NC}"
    echo "   Ejecuta este script desde la raíz del proyecto"
    exit 1
fi

# 2. Crear directorios necesarios
echo -e "${BLUE}[1/5] Creando estructura de directorios...${NC}"
mkdir -p nginx/conf.d nginx/ssl scripts/deploy scripts/cloud

# 3. Crear archivo .env de producción
echo -e "${BLUE}[2/5] Creando archivo de configuración de producción...${NC}"
if [ ! -f ".env.prod" ]; then
    cp .env.prod.example .env.prod
    echo -e "${YELLOW}⚠ Archivo .env.prod creado. DEBES actualizar los valores secretos${NC}"
else
    echo -e "${GREEN}✓ .env.prod ya existe${NC}"
fi

# 4. Validar Dockerfiles de producción
echo -e "${BLUE}[3/5] Validando Dockerfiles de producción...${NC}"
if [ -f "backend/Dockerfile.prod" ] && [ -f "frontend/Dockerfile.prod" ]; then
    echo -e "${GREEN}✓ Dockerfiles de producción encontrados${NC}"
else
    echo -e "${RED}✗ Falta algún Dockerfile.prod${NC}"
    exit 1
fi

# 5. Crear archivo docker-compose.prod.yml
echo -e "${BLUE}[4/5] Validando configuración de producción...${NC}"
if [ -f "docker-compose.prod.yml" ]; then
    echo -e "${GREEN}✓ docker-compose.prod.yml encontrado${NC}"
else
    echo -e "${RED}✗ Falta docker-compose.prod.yml${NC}"
    exit 1
fi

# 6. Crear scripts de deployment
echo -e "${BLUE}[5/5] Creando scripts de deployment...${NC}"

# AWS deployment script
cat > scripts/deploy/aws-deploy.sh << 'EOF'
#!/bin/bash
# Script para desplegar en AWS ECS

set -e

echo "=== AWS ECS Deployment ==="

# Variables (cambiar según tu configuración)
AWS_REGION=${AWS_REGION:-us-east-1}
ECR_REGISTRY=${ECR_REGISTRY:-123456789.dkr.ecr.us-east-1.amazonaws.com}
CLUSTER_NAME=${CLUSTER_NAME:-unt-practicas-cluster}
SERVICE_NAME=${SERVICE_NAME:-unt-app-service}

# 1. Build y push de imágenes a ECR
echo "Building and pushing images to ECR..."
docker build -f backend/Dockerfile.prod -t $ECR_REGISTRY/unt-backend:latest backend/
docker build -f frontend/Dockerfile.prod -t $ECR_REGISTRY/unt-frontend:latest frontend/

docker push $ECR_REGISTRY/unt-backend:latest
docker push $ECR_REGISTRY/unt-frontend:latest

# 2. Actualizar ECS task definition (manual o con script)
echo "Update ECS task definition and deploy using AWS Console or AWS CLI"
echo "aws ecs update-service --cluster $CLUSTER_NAME --service $SERVICE_NAME --force-new-deployment"

echo "✓ Images pushed successfully!"
EOF

# Google Cloud deployment script
cat > scripts/deploy/gcp-deploy.sh << 'EOF'
#!/bin/bash
# Script para desplegar en Google Cloud Run

set -e

echo "=== Google Cloud Run Deployment ==="

# Variables
GCP_PROJECT=${GCP_PROJECT:-your-project-id}
GCP_REGION=${GCP_REGION:-us-central1}

# 1. Autenticar con Google Cloud
gcloud auth login
gcloud config set project $GCP_PROJECT

# 2. Build y deploy backend
echo "Deploying backend to Cloud Run..."
gcloud run deploy unt-backend \
    --source backend \
    --platform managed \
    --region $GCP_REGION \
    --dockerfile Dockerfile.prod \
    --set-env-vars-file .env.prod \
    --memory 1Gi \
    --cpu 1 \
    --allow-unauthenticated

# 3. Build y deploy frontend
echo "Deploying frontend to Cloud Run..."
gcloud run deploy unt-frontend \
    --source frontend \
    --platform managed \
    --region $GCP_REGION \
    --dockerfile Dockerfile.prod \
    --set-env-vars-file .env.prod \
    --memory 512Mi \
    --cpu 1 \
    --allow-unauthenticated

echo "✓ Deployment completed!"
EOF

# Azure deployment script
cat > scripts/deploy/azure-deploy.sh << 'EOF'
#!/bin/bash
# Script para desplegar en Azure Container Instances / App Service

set -e

echo "=== Azure Deployment ==="

# Variables
RESOURCE_GROUP=${RESOURCE_GROUP:-unt-practicas-rg}
REGISTRY_NAME=${REGISTRY_NAME:-untpracticas}
LOCATION=${LOCATION:-eastus}

# 1. Crear resource group (si no existe)
az group create --name $RESOURCE_GROUP --location $LOCATION

# 2. Crear Azure Container Registry (si no existe)
az acr create --resource-group $RESOURCE_GROUP \
    --name $REGISTRY_NAME --sku Basic

# 3. Build y push de imágenes
echo "Building and pushing images to ACR..."
az acr build --registry $REGISTRY_NAME --image unt-backend:latest backend/
az acr build --registry $REGISTRY_NAME --image unt-frontend:latest frontend/

# 4. Desplegar usando Docker Compose (opcional)
# O usar App Service / Container Instances

echo "✓ Images pushed to ACR successfully!"
EOF

# DigitalOcean deployment script
cat > scripts/deploy/digitalocean-deploy.sh << 'EOF'
#!/bin/bash
# Script para desplegar en DigitalOcean App Platform

set -e

echo "=== DigitalOcean App Platform Deployment ==="

# Variables
REGION=${REGION:-sfo}
APP_NAME=${APP_NAME:-unt-practicas}

# 1. Crear app.yaml para App Platform
cat > app.yaml << 'APPYAML'
name: unt-practicas-tesis
services:
- name: backend
  github:
    branch: main
    repo: your-username/unt-practicas-tesis
  build_command: npm run build
  run_command: npm run start:prod
  envs:
  - key: NODE_ENV
    value: production
  - key: DB_HOST
    scope: RUN_AND_BUILD_TIME
    value: ${db.hostname}
  http_port: 3000

- name: frontend
  github:
    branch: main
    repo: your-username/unt-practicas-tesis
  build_command: npm run build
  run_command: npm run start
  source_dir: frontend
  envs:
  - key: NODE_ENV
    value: production
  - key: NEXT_PUBLIC_API_URL
    value: https://${backend.ondigitalocean.app}
  http_port: 3000

databases:
- name: db
  engine: PG
  version: "15"

APPYAML

# 2. DeploySi tienes doctl instalado
# doctl apps create --spec app.yaml

echo "app.yaml creado. Sube a DigitalOcean App Platform via UI o con doctl"
echo "✓ Configuration ready!"
EOF

# Listar deployment scripts
chmod +x scripts/deploy/*.sh

echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Cloud deployment preparation completed!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"

echo -e "\n${YELLOW}Próximos pasos:${NC}"
echo "1. Actualiza los valores secretos en .env.prod"
echo "2. Lee la guía CLOUD_DEPLOYMENT_GUIDE.md"
echo "3. Elige tu plataforma cloud:"
echo "   • AWS: scripts/deploy/aws-deploy.sh"
echo "   • Google Cloud: scripts/deploy/gcp-deploy.sh"
echo "   • Azure: scripts/deploy/azure-deploy.sh"
echo "   • DigitalOcean: scripts/deploy/digitalocean-deploy.sh"
