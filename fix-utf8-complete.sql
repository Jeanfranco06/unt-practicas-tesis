-- =====================================================
-- CORRECCIÓN COMPLETA DE ENCODING UTF-8
-- =====================================================
-- Script para corregir la codificación de caracteres en toda la base de datos
-- Ejecutar como superusuario en la BD unt_practicas_tesis

-- =====================================================
-- 1. CORREGIR CODIFICACIÓN DE LA BASE DE DATOS
-- =====================================================
-- Para verificar la codificación actual:
-- SELECT datname, pg_encoding_to_char(encoding) FROM pg_database WHERE datname = 'unt_practicas_tesis';

-- =====================================================
-- 2. CORREGIR DATOS EXISTENTES EN FACULTAD
-- =====================================================
UPDATE facultad SET nombre = convert_from(convert_to(nombre, 'ISO-8859-1'), 'UTF-8') 
WHERE nombre LIKE '%Ã%';

UPDATE facultad SET descripcion = convert_from(convert_to(descripcion, 'ISO-8859-1'), 'UTF-8') 
WHERE descripcion LIKE '%Ã%';

-- =====================================================
-- 3. CORREGIR DATOS EXISTENTES EN CARRERA
-- =====================================================
UPDATE carrera SET nombre = convert_from(convert_to(nombre, 'ISO-8859-1'), 'UTF-8') 
WHERE nombre LIKE '%Ã%';

UPDATE carrera SET descripcion = convert_from(convert_to(descripcion, 'ISO-8859-1'), 'UTF-8') 
WHERE descripcion LIKE '%Ã%';

-- =====================================================
-- 4. CORREGIR DATOS EXISTENTES EN USUARIO
-- =====================================================
UPDATE usuario SET nombre = convert_from(convert_to(nombre, 'ISO-8859-1'), 'UTF-8') 
WHERE nombre LIKE '%Ã%';

UPDATE usuario SET apellido_paterno = convert_from(convert_to(apellido_paterno, 'ISO-8859-1'), 'UTF-8') 
WHERE apellido_paterno LIKE '%Ã%';

UPDATE usuario SET apellido_materno = convert_from(convert_to(apellido_materno, 'ISO-8859-1'), 'UTF-8') 
WHERE apellido_materno LIKE '%Ã%';

-- =====================================================
-- 5. CORREGIR DOCENTE
-- =====================================================
UPDATE docente SET nombre = convert_from(convert_to(nombre, 'ISO-8859-1'), 'UTF-8') 
WHERE nombre LIKE '%Ã%';

UPDATE docente SET apellido_paterno = convert_from(convert_to(apellido_paterno, 'ISO-8859-1'), 'UTF-8') 
WHERE apellido_paterno LIKE '%Ã%';

UPDATE docente SET apellido_materno = convert_from(convert_to(apellido_materno, 'ISO-8859-1'), 'UTF-8') 
WHERE apellido_materno LIKE '%Ã%';

-- =====================================================
-- 6. CORREGIR EMPRESA
-- =====================================================
UPDATE empresa SET nombre = convert_from(convert_to(nombre, 'ISO-8859-1'), 'UTF-8') 
WHERE nombre LIKE '%Ã%';

UPDATE empresa SET descripcion = convert_from(convert_to(descripcion, 'ISO-8859-1'), 'UTF-8') 
WHERE descripcion LIKE '%Ã%';

UPDATE empresa SET direccion = convert_from(convert_to(direccion, 'ISO-8859-1'), 'UTF-8') 
WHERE direccion LIKE '%Ã%';

-- =====================================================
-- 7. CORREGIR PROYECTO TESIS
-- =====================================================
UPDATE proyecto_tesis SET titulo = convert_from(convert_to(titulo, 'ISO-8859-1'), 'UTF-8') 
WHERE titulo LIKE '%Ã%';

UPDATE proyecto_tesis SET descripcion = convert_from(convert_to(descripcion, 'ISO-8859-1'), 'UTF-8') 
WHERE descripcion LIKE '%Ã%';

-- =====================================================
-- 8. CORREGIR TESIS
-- =====================================================
UPDATE tesis SET titulo = convert_from(convert_to(titulo, 'ISO-8859-1'), 'UTF-8') 
WHERE titulo LIKE '%Ã%';

UPDATE tesis SET resumen = convert_from(convert_to(resumen, 'ISO-8859-1'), 'UTF-8') 
WHERE resumen LIKE '%Ã%';

-- =====================================================
-- 9. CORREGIR OFERTA PRACTICA
-- =====================================================
UPDATE oferta_practica SET titulo = convert_from(convert_to(titulo, 'ISO-8859-1'), 'UTF-8') 
WHERE titulo LIKE '%Ã%';

UPDATE oferta_practica SET descripcion = convert_from(convert_to(descripcion, 'ISO-8859-1'), 'UTF-8') 
WHERE descripcion LIKE '%Ã%';

UPDATE oferta_practica SET requisitos = convert_from(convert_to(requisitos, 'ISO-8859-1'), 'UTF-8') 
WHERE requisitos LIKE '%Ã%';

-- =====================================================
-- 10. CORREGIR NOTIFICACION
-- =====================================================
UPDATE notificacion SET titulo = convert_from(convert_to(titulo, 'ISO-8859-1'), 'UTF-8') 
WHERE titulo LIKE '%Ã%';

UPDATE notificacion SET contenido = convert_from(convert_to(contenido, 'ISO-8859-1'), 'UTF-8') 
WHERE contenido LIKE '%Ã%';

-- =====================================================
-- VERIFICAR RESULTADOS
-- =====================================================
-- Para verificar que la corrección fue exitosa, ejecutar:
-- SELECT * FROM facultad WHERE nombre LIKE '%Ingeniería%' LIMIT 5;
-- SELECT * FROM carrera WHERE nombre LIKE '%Ingeniería%' LIMIT 5;
-- SELECT * FROM usuario WHERE nombre LIKE '%É%' OR apellido_paterno LIKE '%É%' LIMIT 5;
