@echo off
chcp 65001
set PGCLIENTENCODING=UTF8

echo Recreando base de datos con UTF-8...

psql -h localhost -U postgres -c "DROP DATABASE IF EXISTS unt_practicas_tesis; CREATE DATABASE unt_practicas_tesis WITH ENCODING = 'UTF8' LC_COLLATE = 'es_ES.UTF-8' LC_CTYPE = 'es_ES.UTF-8' TEMPLATE = template0;"

echo.
echo Creando estructura de tablas...
psql -h localhost -U postgres -d unt_practicas_tesis -f init-scripts/01-init-normalized.sql

echo.
echo Insertando datos UTF-8 limpios...
psql -h localhost -U postgres -d unt_practicas_tesis -f init-scripts/04-init-clean-utf8.sql

echo.
echo Verificando datos...
psql -h localhost -U postgres -d unt_practicas_tesis -c "SELECT nombre FROM carrera;"

echo.
pause
