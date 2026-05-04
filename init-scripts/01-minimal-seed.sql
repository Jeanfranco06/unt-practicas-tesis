-- =============================================================================
-- DATOS MÍNIMOS Y COHERENTES PARA SISTEMA DE PRÁCTICAS PREPROFESIONALES UNT
-- =============================================================================
-- 
-- INSTRUCCIONES IMPORTANTES:
-- 1. Este script debe ejecutarse DESPUÉS de que TypeORM cree las tablas
-- 2. Orden de inserción respeta dependencias de claves foráneas
-- 3. Contraseña para todos los usuarios de prueba: '123456'
-- 4. Hash generado con bcrypt (10 rounds): $2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8.LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Xuo5w6E9Wl7y
--    (Nota: El hash real debe generarse con el script generate-hash.js)
--
-- =============================================================================
\c unt_practicas_tesis

SET client_encoding = 'UTF8';
-- -----------------------------------------------------------------------------
-- 1. ROLES DEL SISTEMA
-- -----------------------------------------------------------------------------
-- Tabla: rol
-- Descripción: Roles base requeridos para el funcionamiento del sistema

INSERT INTO rol (nombre, descripcion, activo) VALUES
  ('Administrador', 'Acceso completo al sistema. Gestiona usuarios, empresas, facultades y configuración global.', true),
  ('Coordinador', 'Gestiona prácticas y tesis a nivel de facultad. Aprueba convenios y asigna asesores.', true),
  ('Asesor', 'Docente que supervisa y asesora prácticas preprofesionales y proyectos de tesis.', true),
  ('Estudiante', 'Usuario que realiza prácticas preprofesionales y desarrolla trabajo de tesis.', true),
  ('RepresentanteEmpresa', 'Representante de empresas colaboradoras. Publica ofertas de práctica.', true);

-- -----------------------------------------------------------------------------
-- 2. FACULTADES (Mínimo requerido)
-- -----------------------------------------------------------------------------
-- Tabla: facultad
-- Descripción: Al menos una facultad es necesaria para crear carreras

INSERT INTO facultad (nombre, codigo, descripcion, activo) VALUES
  ('Facultad de Ingeniería', 'FING', 'Facultad de Ingeniería de la Universidad Nacional de Trujillo. Incluye carreras de ingeniería de sistemas, civil, industrial y mecánica.', true);

-- -----------------------------------------------------------------------------
-- 3. CARRERAS (Mínimo requerido)
-- -----------------------------------------------------------------------------
-- Tabla: carrera
-- Descripción: Al menos una carrera es necesaria para crear estudiantes y docentes

INSERT INTO carrera (facultad_id, nombre, codigo, descripcion, activo) VALUES
  (1, 'Ingeniería de Sistemas', 'IS', 'Carrera profesional enfocada en el desarrollo de software, bases de datos, redes y gestión de sistemas de información.', true);

-- -----------------------------------------------------------------------------
-- 4. USUARIO ADMINISTRADOR (Completo y funcional)
-- -----------------------------------------------------------------------------
-- Tabla: usuario
-- Descripción: Usuario administrador principal para acceso inicial al sistema
-- 
-- CREDENCIALES DE ACCESO:
--   Email: admin@unt.edu.pe
--   Contraseña: 123456
--   Rol: Administrador
--
-- NOTA: El hash de contraseña debe generarse ejecutando:
--   node backend/generate-hash.js
-- El hash mostrado abajo es un placeholder - reemplazar con el hash real.

INSERT INTO usuario (
  email,
  email_recuperacion,
  contrasena_hash,
  nombre,
  apellido_paterno,
  apellido_materno,
  activo,
  eliminado
) VALUES (
  'admin@unt.edu.pe',
  'admin.recovery@unt.edu.pe',
  '$2b$10$k5Gs5aaa0rbN5q3YkJMTOuIDQS2vFV9WZL3i1jnXrPt9JtvWOANNK', -- Hash para '123456' (GENERAR NUEVO)
  'Luis',
  'Mendoza',
  'Vargas',
  true,
  false
);

-- -----------------------------------------------------------------------------
-- 5. ASIGNACIÓN DE ROL AL ADMINISTRADOR
-- -----------------------------------------------------------------------------
-- Tabla: usuario_rol
-- Descripción: Asigna el rol Administrador al usuario creado

INSERT INTO usuario_rol (usuario_id, rol_id) VALUES
  (1, 1); -- usuario_id=1 (admin) -> rol_id=1 (Administrador)

-- =============================================================================
-- VERIFICACIÓN DE DATOS INSERTADOS
-- =============================================================================

-- Verificar roles creados
-- SELECT * FROM rol WHERE activo = true;

-- Verificar facultad y carrera
-- SELECT f.nombre as facultad, c.nombre as carrera, c.codigo 
-- FROM facultad f 
-- JOIN carrera c ON c.facultad_id = f.id;

-- Verificar usuario administrador con sus roles
-- SELECT u.id, u.email, u.nombre, u.apellido_paterno, r.nombre as rol
-- FROM usuario u
-- JOIN usuario_rol ur ON ur.usuario_id = u.id
-- JOIN rol r ON r.id = ur.rol_id
-- WHERE u.email = 'admin@unt.edu.pe';

-- =============================================================================
-- FIN DEL SCRIPT
-- =============================================================================