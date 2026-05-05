#!/bin/sh
# Entrypoint script para backend con Cloud SQL Proxy support

set -e

# Log de inicio
echo "🚀 Starting UNT Backend Application..."

# Variables
MAX_RETRIES=30
RETRY_INTERVAL=1
PORT=${PORT:-8080}

# Función para verificar conexión a base de datos
wait_for_db() {
    RETRIES=0
    while [ $RETRIES -lt $MAX_RETRIES ]; do
        if nc -z localhost 5432 2>/dev/null; then
            echo "✓ Database connection available"
            return 0
        fi
        RETRIES=$((RETRIES + 1))
        echo "Waiting for database... (attempt $RETRIES/$MAX_RETRIES)"
        sleep $RETRY_INTERVAL
    done
    echo "❌ Database connection failed after $MAX_RETRIES attempts"
    return 1
}

# Función para esperar a que el servidor esté listo
wait_for_server() {
    RETRIES=0
    while [ $RETRIES -lt 30 ]; do
        if curl -sf http://localhost:$PORT/api/health > /dev/null 2>&1; then
            echo "✓ Server is healthy"
            return 0
        fi
        RETRIES=$((RETRIES + 1))
        sleep 1
    done
    return 1
}

# Iniciar Cloud SQL Proxy si está configurado
if [ ! -z "$CLOUD_SQL_INSTANCE" ]; then
    echo "🔗 Starting Cloud SQL Proxy for: $CLOUD_SQL_INSTANCE"
    
    # Iniciar proxy en background (sin flags de IP que no existen en versiones antiguas)
    /cloud-sql-proxy "$CLOUD_SQL_INSTANCE" &
    
    PROXY_PID=$!
    echo "✓ Cloud SQL Proxy started (PID: $PROXY_PID)"
    
    # Esperar a que la base de datos esté lista
    wait_for_db || exit 1
else
    echo "⚠️  CLOUD_SQL_INSTANCE no configurado - asumiendo conexión local"
fi

# Mostrar configuración
echo "📡 Backend Configuration:"
echo "   - PORT: $PORT"
echo "   - NODE_ENV: ${NODE_ENV:-production}"
echo "   - DB_HOST: ${DB_HOST:-127.0.0.1}"
echo "   - DB_PORT: ${DB_PORT:-5432}"
echo "   - DB_NAME: ${DB_NAME}"

# Ejecutar la aplicación directamente
exec npm run start:prod
