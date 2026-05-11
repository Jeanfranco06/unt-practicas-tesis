# Etapa de construcción
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package files del frontend
COPY frontend/package*.json ./

# Instalar dependencias del frontend
RUN npm ci

# Copiar código fuente del frontend
COPY frontend/. .

# Copiar el archivo de tipos de tRPC y las dependencias necesarias
COPY backend/src/app.router.ts ../backend/src/app.router.ts
COPY backend/package*.json ../backend/

# Instalar solo las dependencias de tipo del backend (sin scripts post-install)
RUN cd ../backend && npm ci --ignore-scripts --omit=optional 2>/dev/null || npm install --ignore-scripts @trpc/server@^10.45.0 zod@^3.22.0

# Build-time env vars (NEXT_PUBLIC_* must be baked at build time)
ARG NEXT_PUBLIC_API_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM node:18-alpine AS production

WORKDIR /app

# Crear usuario no root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copiar package files desde el contexto correcto
COPY frontend/package*.json ./

# Instalar todas las dependencias (necesario para ejecutar next start)
RUN npm ci && npm cache clean --force

# Copiar código construido
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Cambiar al usuario no root
USER nodejs

# Exponer puerto
EXPOSE 3000

# Comando de inicio
CMD ["npm", "run", "start"]
