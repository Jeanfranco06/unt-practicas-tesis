@echo off
REM Script para preparar el deployment en diferentes plataformas cloud
REM Este script ayuda a crear la estructura necesaria para desplegar en la nube

setlocal enabledelayedexpansion

REM Colores (solo Windows 10+)
set "BLUE=[94m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "NC=[0m"

echo.
echo ===================================================================
echo UNT Practicas y Tesis - Cloud Deployment Preparation
echo ===================================================================
echo.

REM 1. Validar que estamos en el directorio correcto
if not exist "docker-compose.yml" (
    echo [ERROR] No se encontro docker-compose.yml
    echo Ejecuta este script desde la raiz del proyecto
    exit /b 1
)

REM 2. Crear directorios necesarios
echo [INFO] Creando estructura de directorios...
if not exist "nginx\conf.d" mkdir nginx\conf.d
if not exist "nginx\ssl" mkdir nginx\ssl
if not exist "scripts\deploy" mkdir scripts\deploy
if not exist "scripts\cloud" mkdir scripts\cloud

REM 3. Crear archivo .env de producción
echo [INFO] Creando archivo de configuracion de produccion...
if not exist ".env.prod" (
    copy ".env.prod.example" ".env.prod" >nul
    echo [ADVERTENCIA] Archivo .env.prod creado. DEBES actualizar los valores secretos
) else (
    echo [OK] .env.prod ya existe
)

REM 4. Validar Dockerfiles de producción
echo [INFO] Validando Dockerfiles de produccion...
if exist "backend\Dockerfile.prod" if exist "frontend\Dockerfile.prod" (
    echo [OK] Dockerfiles de produccion encontrados
) else (
    echo [ERROR] Falta algun Dockerfile.prod
    exit /b 1
)

REM 5. Validar configuración de producción
echo [INFO] Validando configuracion de produccion...
if exist "docker-compose.prod.yml" (
    echo [OK] docker-compose.prod.yml encontrado
) else (
    echo [ERROR] Falta docker-compose.prod.yml
    exit /b 1
)

echo.
echo ===================================================================
echo Preparacion completada!
echo ===================================================================
echo.
echo Proximos pasos:
echo 1. Actualiza los valores secretos en .env.prod
echo 2. Lee la guia CLOUD_DEPLOYMENT_GUIDE.md
echo 3. Sigue las instrucciones para tu plataforma cloud
echo.
