@echo off
REM Script para preparar Oracle Cloud VM (Windows PowerShell)
REM Este script se ejecuta EN LA VM de Oracle Cloud

echo.
echo ===================================================================
echo UNT Practicas - Oracle Cloud Always Free Deployment
echo ===================================================================
echo.

REM Los comandos deben ejecutarse en la terminal de la VM
REM Opción 1: Copiar y pegar línea por línea

echo Instrucciones para Oracle Cloud VM:
echo.
echo 1. SSH a tu VM:
echo    ssh -i tu-clave.key ubuntu@tu-ip-publica
echo.
echo 2. Ejecutar en la VM:
echo.
echo # Actualizar sistema
sudo apt-get update ^&^& sudo apt-get upgrade -y
echo.
echo # Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu
newgrp docker
echo.
echo # Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
echo.
echo # Instalar Git y otras tools
sudo apt-get install git certbot python3-certbot-nginx nginx -y
echo.
echo # Clonar repositorio
cd /home/ubuntu
git clone ^<TU-REPO^> app
cd app
echo.
echo # Copiar template .env.prod
cp .env.prod.example .env.prod
nano .env.prod  ^(editar valores^)
echo.
echo # Levantar aplicación
docker-compose -f docker-compose.prod.yml up -d
echo.
echo # Verificar que funciona
docker ps
echo.

REM Mostrar resumen
echo ===================================================================
echo RESUMEN - PASOS EN LA VM ORACLE:
echo ===================================================================
echo.
echo Opción A (Automático - recomendado):
echo   curl https://raw.githubusercontent.com/tu-repo/oracle-deploy.sh | bash
echo.
echo Opción B (Manual - copiar y pegar cada línea en la VM)
echo   Ver instrucciones arriba
echo.
echo ===================================================================
pause
