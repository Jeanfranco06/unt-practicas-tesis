# Corrección de Encoding UTF-8 - Guía de Ejecución

## Problema
Los caracteres especiales se muestran incorrectamente:
- "Ingeniería" → "IngenierÃ­a"
- "Perú" → "PerÃº"
- "María" → "MarÃ­a"

Esto ocurre porque los datos fueron insertados/almacenados con una codificación diferente a UTF-8, aunque se muestran como UTF-8.

## Soluciones

### Opción 1: Usar la Nueva Configuración (RECOMENDADO)
Si estás usando Docker, simplemente reconstruye los contenedores con la nueva configuración:

```bash
# Detener los contenedores
docker-compose down

# Eliminar el volumen de postgres para resetear la BD
docker volume rm unt-practicas-tesis_postgres_data

# Reconstruir y iniciar
docker-compose up -d --build
```

**Ventajas:**
- Limpia completamente el encoding
- La BD se inicializa correctamente con UTF-8 desde cero
- Los datos nuevos se guardarán correctamente

### Opción 2: Corregir BD Existente (SIN RESETEAR DATOS)
Si tienes datos importantes que no quieres perder:

```bash
# 1. Conectarse a la BD
docker exec -it unt-practicas-tesis-postgres-1 psql -U postgres -d unt_practicas_tesis

# 2. Ejecutar el script de corrección
# Copiar y ejecutar el contenido de fix-utf8-complete.sql

# O desde una terminal:
docker exec -it unt-practicas-tesis-postgres-1 psql -U postgres -d unt_practicas_tesis -f /docker-entrypoint-initdb.d/99-fix-utf8.sql
```

### Opción 3: Script PowerShell (Windows)
Crear un archivo `fix-utf8.ps1`:

```powershell
# Detener contenedores
docker-compose down

# Eliminar volumen
docker volume rm unt-practicas-tesis_postgres_data

# Reiniciar
docker-compose up -d --build

# Esperar a que PostgreSQL esté listo (10 segundos)
Start-Sleep -Seconds 10

# Verificar que los datos tienen UTF-8 correcto
docker exec unt-practicas-tesis-postgres-1 psql -U postgres -d unt_practicas_tesis -c "SELECT * FROM facultad LIMIT 1;"
```

Ejecutar:
```bash
.\fix-utf8.ps1
```

## Verificar que la Corrección Fue Exitosa

Ejecuta esta consulta en la BD:
```sql
-- Debe mostrar "Ingeniería de Sistemas" correctamente
SELECT * FROM carrera WHERE nombre LIKE '%Ingeniería%' LIMIT 5;

-- Debe mostrar facultades con acentos correctos
SELECT * FROM facultad LIMIT 3;

-- Debe mostrar usuarios con nombres acentuados
SELECT nombre, apellido_paterno FROM usuario WHERE nombre = 'María' OR apellido_paterno LIKE '%é%' LIMIT 5;
```

## Cambios Realizados

1. **docker-compose.yml**
   - Agregado `POSTGRES_INITDB_ARGS: "-E UTF8 --locale=es_ES.UTF-8"`
   - Agregado script de corrección `fix-utf8-complete.sql`

2. **init-scripts/01-init-normalized.sql**
   - Agregados comandos `SET client_encoding = 'UTF8'` y `SET server_encoding = 'UTF8'`

3. **init-scripts/03-test-data.sql**
   - Agregados comandos `SET client_encoding = 'UTF8'` y `SET server_encoding = 'UTF8'`

4. **fix-utf8-complete.sql** (NUEVO)
   - Script completo para corregir encoding en todas las tablas y campos de texto
   - Usa `convert_from(convert_to(..., 'ISO-8859-1'), 'UTF-8')` para reinterpretar caracteres mal codificados

## Causa Raíz
PostgreSQL se inicializó con una codificación por defecto incorrecta, probablemente `LATIN1` o similar. Cuando los datos UTF-8 se insertan en una BD con otra codificación, se almacenan incorrectamente.

## Preguntas Frecuentes

**P: ¿Perderé datos?**
R: No con la Opción 1 (resets DB limpiamente). Para la Opción 2 se intenta recuperar datos existentes.

**P: ¿Es permanente?**
R: Sí, con estos cambios PostgreSQL se inicializará correctamente con UTF-8 cada vez que se levante el contenedor.

**P: ¿Afecta el backend o frontend?**
R: No, estos son cambios de configuración de base de datos. El backend y frontend no necesitan cambios.
