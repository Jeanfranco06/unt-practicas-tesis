#!/bin/bash
# Script de validación antes de desplegar a la nube

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}UNT Prácticas - Cloud Deployment Validation${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}\n"

ERRORS=0
WARNINGS=0

# Color para check/error
check() {
    echo -e "${GREEN}✓${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
    ((ERRORS++))
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

# 1. Verificar archivos críticos
echo -e "${BLUE}[1] Verificando archivos críticos...${NC}"

if [ -f "docker-compose.prod.yml" ]; then
    check "docker-compose.prod.yml existe"
else
    error "docker-compose.prod.yml NO ENCONTRADO"
fi

if [ -f ".env.prod.example" ]; then
    check ".env.prod.example existe"
else
    error ".env.prod.example NO ENCONTRADO"
fi

if [ -f "backend/Dockerfile.prod" ]; then
    check "backend/Dockerfile.prod existe"
else
    error "backend/Dockerfile.prod NO ENCONTRADO"
fi

if [ -f "frontend/Dockerfile.prod" ]; then
    check "frontend/Dockerfile.prod existe"
else
    error "frontend/Dockerfile.prod NO ENCONTRADO"
fi

echo ""

# 2. Verificar archivo .env.prod
echo -e "${BLUE}[2] Verificando configuración de producción...${NC}"

if [ -f ".env.prod" ]; then
    check ".env.prod existe"
    
    # Verificar que no contiene valores por defecto
    if grep -q "CHANGE_ME" .env.prod; then
        error ".env.prod contiene valores CHANGE_ME (deben editarse)"
    else
        check ".env.prod tiene valores personalizados"
    fi
    
    # Verificar credenciales
    if grep -q "^DB_PASSWORD=" .env.prod; then
        DB_PASS=$(grep "^DB_PASSWORD=" .env.prod | cut -d'=' -f2)
        if [ ${#DB_PASS} -lt 16 ]; then
            error "DB_PASSWORD es muy corta (${#DB_PASS} chars, mínimo 32)"
        else
            check "DB_PASSWORD tiene longitud adecuada"
        fi
    else
        error "DB_PASSWORD no está definido"
    fi
    
    if grep -q "^JWT_SECRET=" .env.prod; then
        check "JWT_SECRET está definido"
    else
        error "JWT_SECRET no está definido"
    fi
else
    error ".env.prod NO EXISTE"
    echo -e "${YELLOW}   Crear desde .env.prod.example y configurar secretos${NC}"
fi

echo ""

# 3. Verificar que .env.prod no está en git
echo -e "${BLUE}[3] Verificando seguridad de git...${NC}"

if git status | grep -q ".env.prod"; then
    error ".env.prod está staged en git (RIESGO DE SEGURIDAD)"
    echo -e "${YELLOW}   Ejecutar: git reset .env.prod${NC}"
else
    check ".env.prod no está en git"
fi

if grep -q ".env.prod" .gitignore 2>/dev/null; then
    check ".env.prod está en .gitignore"
else
    warning ".env.prod NO está en .gitignore (agregar manualmente)"
fi

echo ""

# 4. Verificar documentación
echo -e "${BLUE}[4] Verificando documentación...${NC}"

if [ -f "CLOUD_DEPLOYMENT_GUIDE.md" ]; then
    check "CLOUD_DEPLOYMENT_GUIDE.md existe"
else
    error "CLOUD_DEPLOYMENT_GUIDE.md NO ENCONTRADO"
fi

if [ -f "QUICK_CLOUD_START.md" ]; then
    check "QUICK_CLOUD_START.md existe"
else
    error "QUICK_CLOUD_START.md NO ENCONTRADO"
fi

echo ""

# 5. Verificar estructura de directorios
echo -e "${BLUE}[5] Verificando estructura de directorios...${NC}"

if [ -d "nginx" ]; then
    check "Directorio nginx existe"
    
    if [ -f "nginx/nginx.conf" ]; then
        check "nginx/nginx.conf existe"
    else
        warning "nginx/nginx.conf NO ENCONTRADO (crear si es necesario)"
    fi
else
    warning "Directorio nginx no existe (será creado por deploy scripts)"
fi

if [ -d "scripts/deploy" ]; then
    check "Directorio scripts/deploy existe"
else
    error "scripts/deploy NO ENCONTRADO"
fi

echo ""

# 6. Verificar dependencias
echo -e "${BLUE}[6] Verificando dependencias instaladas...${NC}"

if command -v docker &> /dev/null; then
    check "Docker instalado"
else
    warning "Docker NO instalado (necesario para builds)"
fi

if command -v docker-compose &> /dev/null; then
    check "Docker Compose instalado"
else
    warning "Docker Compose NO instalado"
fi

if command -v git &> /dev/null; then
    check "Git instalado"
else
    error "Git NO instalado (requerido)"
fi

echo ""

# 7. Verificar local deployment
echo -e "${BLUE}[7] Verificando que funciona localmente...${NC}"

if docker-compose ps 2>/dev/null | grep -q "Up"; then
    check "docker-compose local está corriendo"
else
    warning "docker-compose local NO está corriendo"
    echo -e "${YELLOW}   Ejecutar: docker-compose up -d${NC}"
    echo -e "${YELLOW}   Luego verificar: http://localhost:3001${NC}"
fi

echo ""

# 8. Verificar logs de aplicación
echo -e "${BLUE}[8] Verificando aplicación local...${NC}"

if curl -s http://localhost:3000/health &>/dev/null; then
    check "Backend local responde a requests"
else
    warning "Backend local NO responde (puede estar inactivo)"
fi

if curl -s http://localhost:3001 &>/dev/null | grep -q "html"; then
    check "Frontend local está accesible"
else
    warning "Frontend local NO responde"
fi

echo ""

# 9. Resumen
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}RESUMEN DE VALIDACIÓN${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}\n"

echo "Errores críticos: $ERRORS"
echo "Advertencias: $WARNINGS"

if [ $ERRORS -eq 0 ]; then
    echo -e "\n${GREEN}✓ ¡LISTO PARA DESPLEGAR EN LA NUBE!${NC}"
    echo ""
    echo "Próximos pasos:"
    echo "1. Elegir plataforma cloud (GCP, AWS, DigitalOcean, etc.)"
    echo "2. Seguir instrucciones en CLOUD_DEPLOYMENT_GUIDE.md"
    echo "3. Ejecutar script de deployment apropiado"
    exit 0
else
    echo -e "\n${RED}✗ FIX ERRORS ANTES DE DESPLEGAR${NC}"
    echo ""
    echo "Por favor corrige los errores arriba marcados con ✗"
    exit 1
fi
