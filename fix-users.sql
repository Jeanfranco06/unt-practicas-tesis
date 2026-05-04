-- =====================================================
-- SCRIPT PARA COMPLETAR PERFILES DE USUARIOS EXISTENTES
-- Ejecutar en PostgreSQL para arreglar los 4 usuarios
-- =====================================================

-- 1. ESTUDIANTE: jjean20@unt.edu.pe
-- Crear perfil de estudiante
INSERT INTO estudiante (usuario_id, codigo_universitario, anio_ingreso, escuela_profesional, creditos_aprobados, activo)
SELECT 
    u.id,
    '2023010150',  -- Código universitario (ajústalo según necesites)
    2023,          -- Año de ingreso
    'Ingeniería de Sistemas',  -- Escuela profesional
    120,           -- Créditos aprobados (aproximado)
    true
FROM usuario u
WHERE u.email = 'jjean20@unt.edu.pe'
AND NOT EXISTS (SELECT 1 FROM estudiante e WHERE e.usuario_id = u.id);

-- 2. COORDINADOR: jusanfer@unt.edu.pe  
-- El coordinador solo necesita el rol, no requiere tabla adicional
-- Verificar que el rol sea correcto
UPDATE usuario SET rol = 'Coordinador' WHERE email = 'jusanfer@unt.edu.pe';

-- 3. ASESOR: rosantic@unt.edu.pe
-- El asesor solo necesita el rol, no requiere tabla adicional
UPDATE usuario SET rol = 'Asesor' WHERE email = 'rosantic@unt.edu.pe';

-- 4. REPRESENTANTE DE EMPRESA: hardtech@unt.edu.pe
-- Opción A: Si la empresa ya existe, actualizar el representante
-- UPDATE empresa SET representante_usuario_id = (SELECT id FROM usuario WHERE email = 'hardtech@unt.edu.pe') 
-- WHERE ruc = 'RUC_DE_LA_EMPRESA';

-- Opción B: Crear nueva empresa y asociar al representante
INSERT INTO empresa (ruc, razon_social, nombre_comercial, direccion, telefono, email_contacto, representante_nombre, activo)
SELECT 
    '20601234567',              -- RUC (cambiar por el real)
    'HardTech Solutions S.A.C.', -- Razón social
    'HardTech',                  -- Nombre comercial
    'Av. Los Pinos 123, Trujillo', -- Dirección
    '+51 44 123456',             -- Teléfono
    'contacto@hardtech.pe',      -- Email de contacto
    CONCAT(u.nombre, ' ', u.apellido_paterno, ' ', u.apellido_materno), -- Nombre del representante
    true                         -- Activo
FROM usuario u
WHERE u.email = 'hardtech@unt.edu.pe'
AND NOT EXISTS (SELECT 1 FROM empresa e WHERE e.ruc = '20601234567');

-- Si la tabla empresa tiene campo representante_usuario_id, descomenta y usa esto:
-- UPDATE empresa 
-- SET representante_usuario_id = (SELECT id FROM usuario WHERE email = 'hardtech@unt.edu.pe')
-- WHERE ruc = '20601234567';

-- Verificar los cambios
SELECT 
    u.id,
    u.email,
    u.nombre,
    u.apellido_paterno,
    u.rol,
    u.activo,
    CASE 
        WHEN u.rol = 'Estudiante' THEN (SELECT e.codigo_universitario FROM estudiante e WHERE e.usuario_id = u.id)
        ELSE NULL
    END as codigo_estudiante
FROM usuario u
WHERE u.email IN (
    'jjean20@unt.edu.pe',
    'hardtech@unt.edu.pe', 
    'jusanfer@unt.edu.pe',
    'rosantic@unt.edu.pe'
);
