#!/bin/sh
# Entrypoint script para backend con Cloud SQL Proxy support

set -e

# Log de inicio
echo "🚀 Starting UNT Backend Application..."

# Verificar si tenemos CLOUD_SQL_INSTANCE configurado
if [ ! -z "$CLOUD_SQL_INSTANCE" ]; then
  echo "🔗 Starting Cloud SQL Proxy for: $CLOUD_SQL_INSTANCE"
  
  # Iniciar Cloud SQL Proxy en background
  /cloud-sql-proxy \
    -ip_address_types=PRIVATE \
    "$CLOUD_SQL_INSTANCE" &
  
  PROXY_PID=$!
  echo "✓ Cloud SQL Proxy started (PID: $PROXY_PID)"
  
  # Esperar a que el proxy esté listo
  sleep 3
else
  echo "⚠️  CLOUD_SQL_INSTANCE no configurado - asumiendo conexión local"
fi

# Mostrar configuración
echo "📡 Backend Configuration:"
echo "   - PORT: ${PORT:-8080}"
echo "   - NODE_ENV: ${NODE_ENV:-production}"
echo "   - DB_HOST: ${DB_HOST}"
echo "   - DB_NAME: ${DB_NAME}"

# Ejecutar la aplicación con dumb-init para manejo correcto de señales
exec dumb-init npm run start:prod
