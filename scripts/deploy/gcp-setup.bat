@echo off
REM Script para setup automático en Google Cloud Run (Windows)
REM Este script verifica y prepara todo para desplegar a GCP

setlocal enabledelayedexpansion

echo.
echo ===================================================================
echo UNT Practicas - Google Cloud Run Setup (Windows)
echo ===================================================================
echo.

REM Verificar que gcloud está instalado
gcloud --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] gcloud CLI no esta instalado
    echo Descargalo de: https://cloud.google.com/sdk/docs/install
    pause
    exit /b 1
)

REM Verificar que docker está instalado
docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker no esta instalado
    pause
    exit /b 1
)

echo [OK] gcloud CLI instalado
echo [OK] Docker instalado
echo.

REM Paso 1: Autenticación
echo [INFO] Autenticacion con Google Cloud...
gcloud auth login
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] No se pudo autenticar
    pause
    exit /b 1
)
echo [OK] Autenticado
echo.

REM Paso 2: Configurar proyecto
echo [INFO] Selecciona proyecto...
gcloud config set project (sera interactivo)
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] No se pudo configurar proyecto
    pause
    exit /b 1
)
echo [OK] Proyecto configurado
echo.

REM Paso 3: Habilitar APIs
echo [INFO] Habilitando APIs...
gcloud services enable run.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable redis.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
echo [OK] APIs habilitadas
echo.

REM Paso 4: Verificar archivos
echo [INFO] Verificando archivos de configuracion...

if not exist ".env.prod.example" (
    echo [ERROR] No se encontro .env.prod.example
    pause
    exit /b 1
)

if not exist "backend\Dockerfile.prod" (
    echo [ERROR] No se encontro backend\Dockerfile.prod
    pause
    exit /b 1
)

if not exist "frontend\Dockerfile.prod" (
    echo [ERROR] No se encontro frontend\Dockerfile.prod
    pause
    exit /b 1
)

echo [OK] Todos los archivos encontrados
echo.

REM Paso 5: Crear .env.prod si no existe
if not exist ".env.prod" (
    echo [INFO] Creando .env.prod...
    copy ".env.prod.example" ".env.prod"
    echo [INFO] Edita .env.prod con tus valores:
    echo   - DB_HOST (IP de Cloud SQL)
    echo   - DB_PASSWORD
    echo   - JWT_SECRET
    echo   - REDIS_URL
    echo   - API_URL y FRONTEND_URL
    echo [ACCION REQUERIDA] Abre .env.prod y edita los valores
    pause
)

echo.
echo ===================================================================
echo Setup Completado!
echo ===================================================================
echo.
echo Proximos pasos:
echo.
echo 1. Ir a https://console.cloud.google.com
echo 2. Crear Cloud SQL PostgreSQL instance
echo 3. Crear Memorystore Redis instance
echo 4. Actualizar .env.prod con IPs/valores
echo 5. Desplegar con gcloud run deploy
echo.
echo Para guia detallada, ver: GCP_CLOUD_RUN_GUIDE.md
echo.
pause
