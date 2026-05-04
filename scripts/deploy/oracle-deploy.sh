#!/bin/bash

# Script de Deployment Automático para Oracle Cloud Always Free
# Este script asume que ya tienes una VM Ubuntu 22.04 en Oracle Cloud
# Ejecución: ssh a VM, luego: curl -fsSL https://link-a-script | bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}UNT Prácticas - Oracle Cloud Always Free Deployment${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}\n"

# Verificar que somos root o podemos usar sudo
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}Este script debe ejecutarse con sudo${NC}"
   exit 1
fi

# Paso 1: Actualizar sistema
echo -e "${BLUE}[1/11] Actualizando sistema...${NC}"
apt-get update && apt-get upgrade -y -qq
echo -e "${GREEN}✓ Sistema actualizado${NC}\n"

# Paso 2: Instalar Docker
echo -e "${BLUE}[2/11] Instalando Docker...${NC}"
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh
echo -e "${GREEN}✓ Docker instalado${NC}\n"

# Paso 3: Configurar Docker para usuario ubuntu
echo -e "${BLUE}[3/11] Configurando permisos de Docker...${NC}"
usermod -aG docker ubuntu
echo -e "${GREEN}✓ Permisos configurados${NC}\n"

# Paso 4: Instalar Docker Compose
echo -e "${BLUE}[4/11] Instalando Docker Compose...${NC}"
COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep tag_name | cut -d'"' -f4)
curl -L "https://github.com/docker/compose/releases/download/$COMPOSE_VERSION/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
echo -e "${GREEN}✓ Docker Compose instalado${NC}\n"

# Paso 5: Instalar Git
echo -e "${BLUE}[5/11] Instalando Git...${NC}"
apt-get install git -y -qq
echo -e "${GREEN}✓ Git instalado${NC}\n"

# Paso 6: Instalar Certbot (para SSL)
echo -e "${BLUE}[6/11] Instalando Certbot (para SSL)...${NC}"
apt-get install certbot python3-certbot-nginx -y -qq
echo -e "${GREEN}✓ Certbot instalado${NC}\n"

# Paso 7: Instalar Nginx
echo -e "${BLUE}[7/11] Instalando Nginx...${NC}"
apt-get install nginx -y -qq
systemctl start nginx
systemctl enable nginx
echo -e "${GREEN}✓ Nginx instalado y habilitado${NC}\n"

# Paso 8: Clonar repositorio
echo -e "${BLUE}[8/11] Clonando repositorio...${NC}"
read -p "Ingresa la URL del repositorio GitHub: " REPO_URL
cd /home/ubuntu
sudo -u ubuntu git clone "$REPO_URL" app
cd app
echo -e "${GREEN}✓ Repositorio clonado${NC}\n"

# Paso 9: Preparar archivo .env.prod
echo -e "${BLUE}[9/11] Preparando configuración...${NC}"
if [ ! -f ".env.prod.example" ]; then
    echo -e "${RED}✗ Error: No se encontró .env.prod.example${NC}"
    exit 1
fi

cp .env.prod.example .env.prod
echo -e "${YELLOW}⚠️  Edita el archivo .env.prod con tus valores${NC}"
echo -e "${YELLOW}   nano .env.prod${NC}\n"
echo -e "${YELLOW}Valores CRÍTICOS a cambiar:${NC}"
echo "  - DB_PASSWORD (contraseña nueva)"
echo "  - JWT_SECRET (string aleatorio largo)"
echo "  - JWT_REFRESH_SECRET (otro string aleatorio)"
echo "  - REDIS_PASSWORD (contraseña)"
echo "  - API_URL (tu dominio, ej: https://api.miapp.com)"
echo "  - FRONTEND_URL (tu dominio, ej: https://miapp.com)"
echo ""
read -p "Presiona ENTER cuando hayas editado .env.prod..."
echo -e "${GREEN}✓ Configuración lista${NC}\n"

# Paso 10: Levantar aplicación con Docker Compose
echo -e "${BLUE}[10/11] Levantando aplicación...${NC}"
docker-compose -f docker-compose.prod.yml up -d
echo -e "${GREEN}✓ Aplicación levantada${NC}\n"

# Paso 11: Verificar que los containers están corriendo
echo -e "${BLUE}[11/11] Verificando estado...${NC}"
sleep 5
docker ps
echo -e "${GREEN}✓ Todos los containers corriendo${NC}\n"

# Post-installation
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ ¡INSTALACIÓN COMPLETADA!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}\n"

echo -e "${YELLOW}Próximos pasos:${NC}"
echo ""
echo "1. VERIFICAR QUE FUNCIONA:"
echo "   curl http://localhost:3001"
echo "   curl http://localhost:3000/health"
echo ""
echo "2. OBTENER DOMINIO GRATIS (elige uno):"
echo "   - DuckDNS: https://www.duckdns.org"
echo "   - FreeDNS: https://freedns.afraid.org"
echo "   - No-IP: https://www.noip.com"
echo ""
echo "3. CONFIGURAR SSL (Let's Encrypt - gratis):"
echo "   sudo certbot certonly --standalone -d tu-dominio.duckdns.org"
echo ""
echo "4. ACTUALIZAR nginx.conf CON SSL:"
echo "   nano nginx/nginx.conf"
echo "   (descomentar bloques SSL y actualizar rutas de certs)"
echo ""
echo "5. REINICIAR APLICACIÓN:"
echo "   docker-compose -f docker-compose.prod.yml restart"
echo ""
echo "6. CONFIGURAR DNS:"
echo "   Apuntar tu dominio a: $(hostname -I | awk '{print $1}')"
echo ""
echo "7. MONITOREAR LOGS:"
echo "   docker logs -f nombre-del-container"
echo ""
echo -e "${YELLOW}Ver logs detallados:${NC}"
docker-compose -f docker-compose.prod.yml logs -f backend
