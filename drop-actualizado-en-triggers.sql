-- Eliminar todos los triggers y la función que intentan usar actualizado_en
-- ============================================================

-- 1. Eliminar triggers
DROP TRIGGER IF EXISTS trg_usuario_actualizado ON usuario;
DROP TRIGGER IF EXISTS trg_convenio_actualizado ON convenio;
DROP TRIGGER IF EXISTS trg_oferta_practica_actualizado ON oferta_practica;
DROP TRIGGER IF EXISTS trg_practica_actualizado ON practica;
DROP TRIGGER IF EXISTS trg_proyecto_tesis_actualizado ON proyecto_tesis;

-- 2. Eliminar la función
DROP FUNCTION IF EXISTS actualizar_actualizado_en();

-- 3. Verificar que todo se haya eliminado
SELECT 
    tgname AS trigger_name,
    tgrelid::regclass AS table_name
FROM pg_trigger
WHERE tgname LIKE '%actualizado%';

SELECT 
    proname AS function_name
FROM pg_proc
WHERE proname = 'actualizar_actualizado_en';
