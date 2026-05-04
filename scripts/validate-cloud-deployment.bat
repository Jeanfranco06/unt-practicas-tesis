@echo off
REM Script de validación antes de desplegar a la nube (Windows)

setlocal enabledelayedexpansion

echo.
echo ===================================================================
echo UNT Practicas - Cloud Deployment Validation
echo ===================================================================
echo.

set ERRORS=0
set WARNINGS=0

REM 1. Verificar archivos críticos
echo [INFO] Verificando archivos criticos...

if exist "docker-compose.prod.yml" (
    echo [OK] docker-compose.prod.yml existe
) else (
    echo [ERROR] docker-compose.prod.yml NO ENCONTRADO
    set /a ERRORS=%ERRORS%+1
)

if exist ".env.prod.example" (
    echo [OK] .env.prod.example existe
) else (
    echo [ERROR] .env.prod.example NO ENCONTRADO
    set /a ERRORS=%ERRORS%+1
)

if exist "backend\Dockerfile.prod" (
    echo [OK] backend\Dockerfile.prod existe
) else (
    echo [ERROR] backend\Dockerfile.prod NO ENCONTRADO
    set /a ERRORS=%ERRORS%+1
)

if exist "frontend\Dockerfile.prod" (
    echo [OK] frontend\Dockerfile.prod existe
) else (
    echo [ERROR] frontend\Dockerfile.prod NO ENCONTRADO
    set /a ERRORS=%ERRORS%+1
)

echo.

REM 2. Verificar archivo .env.prod
echo [INFO] Verificando configuracion de produccion...

if exist ".env.prod" (
    echo [OK] .env.prod existe
) else (
    echo [ERROR] .env.prod NO EXISTE
    echo [INFO] Crear desde .env.prod.example y configurar secretos
    set /a ERRORS=%ERRORS%+1
)

echo.

REM 3. Verificar documentación
echo [INFO] Verificando documentacion...

if exist "CLOUD_DEPLOYMENT_GUIDE.md" (
    echo [OK] CLOUD_DEPLOYMENT_GUIDE.md existe
) else (
    echo [ERROR] CLOUD_DEPLOYMENT_GUIDE.md NO ENCONTRADO
    set /a ERRORS=%ERRORS%+1
)

echo.

REM 4. Verificar estructura de directorios
echo [INFO] Verificando estructura de directorios...

if exist "nginx" (
    echo [OK] Directorio nginx existe
) else (
    echo [INFO] Directorio nginx sera creado por deploy scripts
)

if exist "scripts\deploy" (
    echo [OK] Directorio scripts\deploy existe
) else (
    echo [ERROR] scripts\deploy NO ENCONTRADO
    set /a ERRORS=%ERRORS%+1
)

echo.

REM 5. Resumen
echo ===================================================================
echo RESUMEN DE VALIDACION
echo ===================================================================
echo.

echo Errores criticos: %ERRORS%
echo.

if %ERRORS% equ 0 (
    echo [OK] LISTO PARA DESPLEGAR EN LA NUBE!
    echo.
    echo Proximos pasos:
    echo 1. Elegir plataforma cloud ^(GCP, AWS, DigitalOcean, etc.^)
    echo 2. Seguir instrucciones en CLOUD_DEPLOYMENT_GUIDE.md
    echo 3. Ejecutar script de deployment apropiado
) else (
    echo [ERROR] FIX ERRORS ANTES DE DESPLEGAR
    echo.
    echo Por favor corrige los errores arriba marcados con [ERROR]
)

echo.
