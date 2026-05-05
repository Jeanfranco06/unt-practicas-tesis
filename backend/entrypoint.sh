#!/bin/sh
# Entrypoint script para backend con Cloud SQL support

set -e

# Log de inicio
echo "🚀 Starting UNT Backend Application..."

# Mostrar configuración
PORT=${PORT:-8080}
echo "📡 Backend Configuration:"
echo "   - PORT: $PORT"
echo "   - NODE_ENV: ${NODE_ENV:-production}"
echo "   - CLOUD_SQL_INSTANCE: ${CLOUD_SQL_INSTANCE}"

# Si estamos en Cloud Run, Cloud SQL Proxy se inyecta automáticamente
# La conexión se hace a través del socket Unix: /cloudsql/INSTANCE_CONNECTION_NAME
# O a través de localhost:5432 si el proxy está corriendo

# Ejecutar la aplicación directamente
# NestJS se conectará automáticamente a la DB según las env vars
exec npm run start:prod
