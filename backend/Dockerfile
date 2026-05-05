# Etapa de construcción
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias para construcción
RUN npm ci

# Copiar código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM node:18-alpine AS production

WORKDIR /app

# Crear usuario no root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copiar package files
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production && npm cache clean --force

# Copiar código construido
COPY --from=builder /app/dist ./dist

# Crear directorios de upload necesarios (antes de cambiar a usuario nodejs)
RUN mkdir -p /app/upload/convenios /app/upload/cv && \
    chown -R nodejs:nodejs /app/upload && \
    chmod -R 755 /app/upload

# Cambiar al usuario no root
USER nodejs

# Exponer puerto
EXPOSE 3000

# Comando de inicio
CMD ["npm", "run", "start:prod"]
