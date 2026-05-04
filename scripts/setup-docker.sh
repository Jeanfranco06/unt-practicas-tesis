#!/bin/bash

# Script para configurar y ejecutar el entorno Docker
# UNT Prácticas y Tesis - Sistema Normalizado

echo "🚀 Configurando entorno Docker para UNT Prácticas y Tesis..."

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor, instala Docker primero."
    exit 1
fi

# Verificar si Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Por favor, instala Docker Compose primero."
    exit 1
fi

# Crear directorios necesarios
echo "📁 Creando directorios necesarios..."
mkdir -p logs
mkdir -p backups

# Detener contenedores existentes
echo "🛑 Deteniendo contenedores existentes..."
docker-compose down

# Limpiar volúmenes antiguos (opcional)
read -p "¿Deseas limpiar los volúmenes de datos existentes? (s/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo "🧹 Limpiando volúmenes de datos..."
    docker-compose down -v
    docker volume prune -f
fi

# Construir y levantar contenedores
echo "🔨 Construyendo y levantando contenedores..."
docker-compose up --build -d

# Esperar a que la base de datos esté lista
echo "⏳ Esperando a que la base de datos esté lista..."
sleep 30

# Verificar el estado de los contenedores
echo "📊 Verificando estado de los contenedores..."
docker-compose ps

# Mostrar logs de la base de datos
echo "📋 Mostrando logs de la base de datos..."
docker-compose logs postgres

echo ""
echo "✅ Entorno Docker configurado exitosamente!"
echo ""
echo "🌐 URLs de acceso:"
echo "   - Frontend: http://localhost:3001"
echo "   - Backend API: http://localhost:3000"
echo "   - Base de datos: localhost:5433"
echo ""
echo "📝 Comandos útiles:"
echo "   - Ver logs: docker-compose logs -f [servicio]"
echo "   - Detener: docker-compose down"
echo "   - Reiniciar: docker-compose restart"
echo "   - Acceder a BD: docker-compose exec postgres psql -U postgres -d unt_practicas_tesis"
echo ""
echo "🔐 Credenciales de la base de datos:"
echo "   - Usuario: postgres"
echo "   - Contraseña: postgres"
echo "   - Base de datos: unt_practicas_tesis"
echo ""
echo "⚠️  IMPORTANTE: Cambia las contraseñas y JWT secrets en producción!"
