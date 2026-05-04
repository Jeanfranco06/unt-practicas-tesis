#!/bin/bash

# Script para desarrollo local
# UNT Prácticas y Tesis - Sistema Normalizado

echo "🔧 Configurando entorno de desarrollo local..."

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor, instala Node.js 18+ primero."
    exit 1
fi

# Verificar versión de Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Se requiere Node.js 18 o superior. Versión actual: $(node -v)"
    exit 1
fi

# Verificar si PostgreSQL está instalado (opcional para desarrollo local)
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL encontrado"
    USE_LOCAL_DB=true
else
    echo "⚠️  PostgreSQL no encontrado. Se usará Docker para la base de datos."
    USE_LOCAL_DB=false
fi

# Instalar dependencias del backend
echo "📦 Instalando dependencias del backend..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
fi

# Copiar archivo .env si no existe
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "📝 Archivo .env creado para el backend"
fi

# Volver al directorio principal
cd ..

# Instalar dependencias del frontend
echo "📦 Instalando dependencias del frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
fi

# Copiar archivo .env.local si no existe
if [ ! -f ".env.local" ]; then
    cp .env.example .env.local
    echo "📝 Archivo .env.local creado para el frontend"
fi

# Volver al directorio principal
cd ..

# Configurar base de datos
if [ "$USE_LOCAL_DB" = true ]; then
    echo "🗄️  Configurando base de datos local..."
    read -p "¿Deseas configurar la base de datos local? (s/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        echo "Por favor, crea una base de datos llamada 'unt_practicas_tesis' en PostgreSQL"
        echo "Luego ejecuta los scripts en init-scripts/ en orden:"
        echo "  1. 01-init.sql"
        echo "  2. 02-migration-normalized.sql"
        echo "  3. 03-test-data.sql"
    fi
else
    echo "🐳 Iniciando base de datos con Docker..."
    docker-compose up -d postgres
    sleep 10
fi

# Crear scripts de desarrollo
echo "📝 Creando scripts de desarrollo..."

# Script para iniciar backend
cat > scripts/start-backend.sh << 'EOF'
#!/bin/bash
echo "🚀 Iniciando backend..."
cd backend
npm run start:dev
EOF
chmod +x scripts/start-backend.sh

# Script para iniciar frontend
cat > scripts/start-frontend.sh << 'EOF'
#!/bin/bash
echo "🚀 Iniciando frontend..."
cd frontend
npm run dev
EOF
chmod +x scripts/start-frontend.sh

# Script para iniciar todo
cat > scripts/start-all.sh << 'EOF'
#!/bin/bash
echo "🚀 Iniciando todos los servicios..."

# Iniciar backend en segundo plano
echo "Iniciando backend..."
cd backend
npm run start:dev &
BACKEND_PID=$!
cd ..

# Esperar un momento
sleep 5

# Iniciar frontend en segundo plano
echo "Iniciando frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "✅ Servicios iniciados:"
echo "   - Backend: http://localhost:3000 (PID: $BACKEND_PID)"
echo "   - Frontend: http://localhost:3001 (PID: $FRONTEND_PID)"
echo ""
echo "Para detener los servicios, usa: kill $BACKEND_PID $FRONTEND_PID"
echo "O presiona Ctrl+C para detener este script y los servicios"

# Esperar señal de interrupción
trap "echo '🛑 Deteniendo servicios...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
EOF
chmod +x scripts/start-all.sh

echo ""
echo "✅ Entorno de desarrollo configurado exitosamente!"
echo ""
echo "🚀 Para empezar a desarrollar:"
echo "   - Iniciar backend: ./scripts/start-backend.sh"
echo "   - Iniciar frontend: ./scripts/start-frontend.sh"
echo "   - Iniciar todo: ./scripts/start-all.sh"
echo ""
echo "🌐 URLs de desarrollo:"
echo "   - Frontend: http://localhost:3001"
echo "   - Backend API: http://localhost:3000"
echo ""
echo "📝 Archivos de configuración creados:"
echo "   - backend/.env"
echo "   - frontend/.env.local"
echo ""
echo "🔐 Credenciales de prueba (contraseña: password123):"
echo "   - Admin: admin@unt.edu.pe"
echo "   - Estudiante: estudiante1@unt.edu.pe"
echo "   - Ver todas en DOCKER_SETUP.md"
