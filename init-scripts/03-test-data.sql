-- =====================================================
-- DATOS DE PRUEBA - UNT Prácticas y Tesis
-- Sistema Normalizado - Versión Completa para Demo
-- Actualizado para pruebas: 9, 10 y 11 de Mayo 2026
-- (Sábado, Domingo y Lunes)
-- =====================================================
-- IMPORTANTE: Ejecutar este script DESPUÉS de 00-init-complete.sql
-- =====================================================
-- GUÍA DE FECHAS USADAS EN ESTE ARCHIVO
--   "hoy"         = 2026-05-09 (Sábado)
--   "mañana"      = 2026-05-10 (Domingo)
--   "pasado"      = 2026-05-11 (Lunes)
--   Prácticas activas   → iniciaron hace ~2 meses (mar 2026), sin fecha fin
--   Ofertas publicadas  → postulación ABIERTA ahora mismo (vence 10-11 mayo)
--   Oferta "cerrando"   → vence hoy 09-05 → ideal para probar como RepresentanteEmpresa
--   Seguimiento horas   → semana actual: 04-09 may 2026
--   Entregables tesis   → vencimientos: 09, 10 y 11 may 2026 (urgentes)
--   Sustentación        → programada para 2026-05-11 (Lunes)
--   Notificaciones      → emitidas hoy y ayer
-- =====================================================

\c unt_practicas_tesis

SET client_encoding = 'UTF8';

-- =====================================================
-- 1. ROLES
-- =====================================================
-- Truncar y reinsertar roles con IDs exactos para garantizar consistencia
TRUNCATE TABLE rol CASCADE;
INSERT INTO rol (id, nombre, descripcion, activo, creado_en) VALUES
(1, 'Administrador',        'Administrador del sistema con acceso total',      true, CURRENT_TIMESTAMP),
(2, 'Coordinador',          'Coordinador de facultad o escuela',               true, CURRENT_TIMESTAMP),
(3, 'Asesor',               'Asesor de prácticas o tesis',                     true, CURRENT_TIMESTAMP),
(4, 'Estudiante',           'Estudiante del sistema',                          true, CURRENT_TIMESTAMP),
(5, 'RepresentanteEmpresa', 'Representante de empresa convenio',               true, CURRENT_TIMESTAMP),
(6, 'Secretaria',           'Secretaria - Gestiona pagos y tramites',          true, CURRENT_TIMESTAMP);

-- =====================================================
-- 2. FACULTADES
-- =====================================================
INSERT INTO facultad (nombre, codigo, descripcion, activo, creado_en) VALUES
('Facultad de Ingeniería',              'FI',  'Facultad de Ingeniería de la UNT',              true, CURRENT_TIMESTAMP),
('Facultad de Ciencias y Tecnología',   'FCT', 'Facultad de Ciencias y Tecnología de la UNT',   true, CURRENT_TIMESTAMP),
('Facultad de Educación y Humanidades', 'FEH', 'Facultad de Educación y Humanidades de la UNT', true, CURRENT_TIMESTAMP);

-- =====================================================
-- 3. CARRERAS
-- =====================================================
INSERT INTO carrera (facultad_id, nombre, codigo, descripcion, activo, creado_en) VALUES
(1, 'Ingeniería de Sistemas',     'IS',  'Carrera de Ingeniería de Sistemas Computacionales', true, CURRENT_TIMESTAMP),
(1, 'Ingeniería Civil',           'IC',  'Carrera de Ingeniería Civil',                       true, CURRENT_TIMESTAMP),
(1, 'Ingeniería Electrónica',     'IE',  'Carrera de Ingeniería Electrónica',                 true, CURRENT_TIMESTAMP),
(2, 'Ciencias de la Computación', 'CC',  'Carrera de Ciencias de la Computación',             true, CURRENT_TIMESTAMP),
(2, 'Estadística',                'EST', 'Carrera de Estadística',                            true, CURRENT_TIMESTAMP),
(3, 'Educación Primaria',         'EP',  'Carrera de Educación Primaria',                     true, CURRENT_TIMESTAMP),
(3, 'Educación Inicial',          'EI',  'Carrera de Educación Inicial',                      true, CURRENT_TIMESTAMP);

-- =====================================================
-- 4. USUARIOS (contraseña: "123456")
-- Hash bcrypt: $2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui
-- =====================================================
INSERT INTO usuario (email, email_recuperacion, contrasena_hash, nombre, apellido_paterno, apellido_materno, activo, creado_en, actualizado_en) VALUES
-- ── Administrador (id=1) ──
('admin@unt.edu.pe', 'admin.personal@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Administrador', 'Sistema', 'UNT', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- ── Coordinadores (id=2..6) ──
('coordinador.fi@unt.edu.pe',  'rosa.vargas.personal@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Rosa', 'Vargas', 'Mendoza', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('coordinador.fct@unt.edu.pe', 'luis.Torres.personal@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Luis', 'Torres', 'Quispe', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('coordinador.feh@unt.edu.pe', 'ana.ramos.personal@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Ana', 'Ramos', 'Salinas', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('coordinador.is@unt.edu.pe',  'miguel.flores.personal@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Miguel', 'Flores', 'Castillo', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('coordinador.cc@unt.edu.pe',  'patricia.leon.personal@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Patricia', 'León', 'Reyes', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- ── Asesores (id=7..11) ──
('jorge.chavez@unt.edu.pe',    'jorge.chavez.personal@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Jorge', 'Chávez', 'Herrera', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('carmen.diaz@unt.edu.pe',     'carmen.diaz.personal@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Carmen', 'Díaz', 'Morales', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('roberto.silva@unt.edu.pe',   'roberto.silva.personal@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Roberto', 'Silva', 'Gutiérrez', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('lucia.paredes@unt.edu.pe',   'lucia.paredes.personal@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Lucía', 'Paredes', 'Vega', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('hector.moya@unt.edu.pe',     'hector.moya.personal@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Héctor', 'Moya', 'Ramírez', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- ── Estudiantes (id=12..21) ──
('202310001@estudiante.unt.edu.pe', 'juan.perez.recovery@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Juan', 'Pérez', 'García', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('202310002@estudiante.unt.edu.pe', 'maria.lopez.recovery@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'María', 'López', 'Martínez', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('202310003@estudiante.unt.edu.pe', 'carlos.rodriguez.recovery@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Carlos', 'Rodríguez', 'Sánchez', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('202110004@estudiante.unt.edu.pe', 'sofia.gutierrez.recovery@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Sofía', 'Gutiérrez', 'Núñez', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('202210005@estudiante.unt.edu.pe', 'andres.morales.recovery@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Andrés', 'Morales', 'Torres', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('202210006@estudiante.unt.edu.pe', 'gabriela.herrera.recovery@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Gabriela', 'Herrera', 'Castro', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('202110007@estudiante.unt.edu.pe', 'diego.rios.recovery@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Diego', 'Ríos', 'Vásquez', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('202310008@estudiante.unt.edu.pe', 'valeria.mendoza.recovery@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Valeria', 'Mendoza', 'Chávez', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('202210009@estudiante.unt.edu.pe', 'fernando.soto.recovery@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Fernando', 'Soto', 'Alva', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('202110010@estudiante.unt.edu.pe', 'camila.fuentes.recovery@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Camila', 'Fuentes', 'Pariona', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- ── Representantes de empresa (id=22..26) ──
('rep.techcorp@techcorp.pe',    'rep.techcorp.personal@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Ricardo', 'Castañeda', 'Lara', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('rep.innovate@innovateperu.pe', 'rep.innovate.personal@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Stephanie', 'Quispe', 'Neyra', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('rep.datasolutions@datasol.pe', 'rep.datasol.personal@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Martín', 'Espinoza', 'Cárdenas', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('rep.globaltech@globaltech.pe', 'rep.globaltech.personal@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Sandra', 'Villanueva', 'Pinto', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('rep.nexus@nexusdigital.pe',    'rep.nexus.personal@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Álvaro', 'Cueva', 'Medina', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- ── Secretaria (id=27) ──
('secretaria@unt.edu.pe', 'secretaria.personal@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'María Elena', 'Sánchez', 'Vargas', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- =====================================================
-- 5. ASIGNACIÓN DE ROLES
-- =====================================================
INSERT INTO usuario_rol (usuario_id, rol_id) VALUES
-- Administrador
(1,  1),
-- Coordinadores
(2,  2), (3,  2), (4,  2), (5,  2), (6,  2),
-- Asesores
(7,  3), (8,  3), (9,  3), (10, 3), (11, 3),
-- Estudiantes
(12, 4), (13, 4), (14, 4), (15, 4), (16, 4),
(17, 4), (18, 4), (19, 4), (20, 4), (21, 4),
-- Representantes
(22, 5), (23, 5), (24, 5), (25, 5), (26, 5),
-- Secretaria
(27, 6);

-- =====================================================
-- 6. PERFILES DOCENTES (Coordinadores y Asesores)
-- =====================================================
-- carrera_id: 1=IS, 2=IC, 3=IE, 4=CC, 5=EST, 6=EP, 7=EI
INSERT INTO docente (usuario_id, carrera_id, especialidad, categoria, dedicacion, oficina, telefono) VALUES
-- Coordinadores
(2,  1, 'Sistemas de Información',          'Principal',  'Tiempo Completo', 'OF-101', '044-201001'),
(3,  4, 'Inteligencia Artificial',          'Asociado',   'Tiempo Completo', 'OF-205', '044-201002'),
(4,  6, 'Gestión Educativa',                'Asociado',   'Tiempo Completo', 'OF-310', '044-201003'),
(5,  1, 'Ingeniería de Software',           'Principal',  'Tiempo Completo', 'OF-102', '044-201004'),
(6,  4, 'Bases de Datos',                   'Asociado',   'Tiempo Completo', 'OF-206', '044-201005'),
-- Asesores
(7,  1, 'Desarrollo Web y Móvil',           'Asistente',  'Tiempo Completo', 'OF-110', '044-201011'),
(8,  4, 'Ciencia de Datos',                 'Asociado',   'Medio Tiempo',    'OF-211', '044-201012'),
(9,  2, 'Estructuras y Construcción',       'Asistente',  'Tiempo Completo', 'OF-320', '044-201013'),
(10, 1, 'Redes y Seguridad Informática',    'Auxiliar',   'Tiempo Completo', 'OF-111', '044-201014'),
(11, 3, 'Electrónica de Potencia',          'Asistente',  'Medio Tiempo',    'OF-405', '044-201015');

-- =====================================================
-- 7. PERFILES DE ESTUDIANTES
-- =====================================================
INSERT INTO estudiante (usuario_id, codigo_universitario, carrera_id, escuela_profesional, anio_ingreso, creditos_aprobados, promedio_general, activo) VALUES
(12, '202310001', 1, 'Ingeniería de Sistemas',     2023, 60,  15.50, true),
(13, '202310002', 4, 'Ciencias de la Computación', 2023, 55,  14.80, true),
(14, '202310003', 1, 'Ingeniería de Sistemas',     2023, 62,  16.20, true),
(15, '202110004', 1, 'Ingeniería de Sistemas',     2021, 180, 17.10, true),
(16, '202210005', 4, 'Ciencias de la Computación', 2022, 130, 15.90, true),
(17, '202210006', 2, 'Ingeniería Civil',            2022, 125, 14.30, true),
(18, '202110007', 1, 'Ingeniería de Sistemas',     2021, 185, 16.80, true),
(19, '202310008', 4, 'Ciencias de la Computación', 2023, 58,  13.50, true),
(20, '202210009', 3, 'Ingeniería Electrónica',      2022, 120, 15.20, true),
(21, '202110010', 1, 'Ingeniería de Sistemas',     2021, 188, 18.00, true);

-- =====================================================
-- 8. EMPRESAS
-- =====================================================
INSERT INTO empresa (ruc, razon_social, nombre_comercial, direccion, telefono, email_contacto, activo, creado_en) VALUES
('20123456781', 'TechCorp Perú S.A.C.',           'TechCorp',      'Av. Larco 1234, Trujillo',          '044-301001', 'contacto@techcorp.pe',      true, CURRENT_TIMESTAMP),
('20123456782', 'Innovate Perú S.R.L.',            'InnovatePeru',  'Jr. Pizarro 456, Trujillo',         '044-301002', 'contacto@innovateperu.pe',  true, CURRENT_TIMESTAMP),
('20123456783', 'Data Solutions S.A.C.',           'DataSol',       'Av. España 789, Trujillo',          '044-301003', 'contacto@datasol.pe',       true, CURRENT_TIMESTAMP),
('20123456784', 'Global Tech S.A.',                'GlobalTech',    'Av. Mansiche 321, Trujillo',        '044-301004', 'contacto@globaltech.pe',    true, CURRENT_TIMESTAMP),
('20123456785', 'Nexus Digital Perú E.I.R.L.',     'NexusDigital',  'Calle Las Flores 654, Trujillo',    '044-301005', 'contacto@nexusdigital.pe',  true, CURRENT_TIMESTAMP);

-- =====================================================
-- 9. REPRESENTANTES DE EMPRESA
-- =====================================================
INSERT INTO representante_empresa (empresa_id, usuario_id, cargo, departamento, telefono_directo, es_principal) VALUES
(1, 22, 'Gerente de RRHH',          'Recursos Humanos',    '044-301101', true),
(2, 23, 'Coordinadora de Prácticas','Gestión del Talento', '044-301102', true),
(3, 24, 'Jefe de Operaciones',       'Operaciones',         '044-301103', true),
(4, 25, 'Directora Comercial',       'Comercial',           '044-301104', true),
(5, 26, 'CEO / Fundador',            'Dirección',           '044-301105', true);

-- =====================================================
-- 10. CONVENIOS
-- =====================================================
INSERT INTO convenio (empresa_id, tipo, numero_convenio, fecha_inicio, fecha_vencimiento, estado, objeto, condiciones, renovable, creado_en) VALUES
-- Vigente y amplio (usado por TechCorp)
(1, 'marco',     'CONV-UNT-2023-001', '2023-03-01', '2027-03-01', 'vigente',
 'Convenio marco para prácticas pre-profesionales en desarrollo de software.',
 'Mínimo 4 horas diarias. Supervisor designado por la empresa.', true, CURRENT_TIMESTAMP),

-- Vencido (InnovatePeru) → útil para que Coordinador vea alertas de renovación
(2, 'marco',     'CONV-UNT-2023-002', '2023-06-15', '2025-06-15', 'vencido',
 'Convenio marco para prácticas en áreas de innovación y transformación digital.',
 'Mínimo 6 horas diarias. Informe mensual obligatorio.', true, CURRENT_TIMESTAMP),

-- Vigente (DataSol)
(3, 'especifico','CONV-UNT-2024-003', '2024-01-10', '2026-12-31', 'vigente',
 'Convenio específico para prácticas en ciencia de datos e inteligencia artificial.',
 'Modalidad híbrida. Remuneración mínima S/. 800.', false, CURRENT_TIMESTAMP),

-- Vigente (GlobalTech)
(4, 'marco',     'CONV-UNT-2024-004', '2024-04-01', '2027-04-01', 'vigente',
 'Convenio marco para prácticas en ingeniería de sistemas y redes.',
 'Presencial. Seguro ESSALUD cubierto por empresa.', true, CURRENT_TIMESTAMP),

-- Vigente (NexusDigital)
(5, 'especifico','CONV-UNT-2025-005', '2025-01-20', '2026-12-31', 'vigente',
 'Convenio específico para prácticas en diseño UX/UI y desarrollo frontend.',
 '100% remoto. Horario flexible.', false, CURRENT_TIMESTAMP);

-- =====================================================
-- 11. OFERTAS DE PRÁCTICA
-- =====================================================
-- ESTRATEGIA DE FECHAS PARA DEMO:
--
-- oferta 1 (Backend)     → CERRADA  (histórico 2025)
-- oferta 2 (DataSol)     → CERRADA  (histórico 2025)
-- oferta 3 (Frontend)    → PUBLICADA, postulación VENCE HOY 09-may-2026
--                          → Rep. TechCorp puede ver postulaciones y aprobar/rechazar
--                          → Estudiantes ven oferta a punto de cerrar
-- oferta 4 (Redes)       → PUBLICADA, postulación VENCE MAÑANA 10-may-2026
-- oferta 5 (UX/UI)       → PUBLICADA, postulación VENCE PASADO 11-may-2026
-- oferta 6 (Marketing)   → BORRADOR  → Coordinador/Rep. puede publicar
-- =====================================================
INSERT INTO oferta_practica (empresa_id, convenio_id, titulo, descripcion, requisitos,
    fecha_inicio_postulacion, fecha_fin_postulacion,
    fecha_inicio_practica,   fecha_fin_practica,
    cupos, estado, creado_en) VALUES

-- oferta 1: cerrada (histórico)
(1, 1,
 'Practicante en Desarrollo Backend Node.js',
 'Desarrollarás APIs REST usando Node.js y Express. Trabajarás en equipo ágil bajo metodología Scrum.',
 'Conocimientos en JavaScript, Node.js básico, SQL. Promedio mínimo 14.',
 '2025-03-01', '2025-03-31', '2025-04-15', '2025-10-15',
 3, 'cerrada', '2025-02-28'),

-- oferta 2: cerrada (histórico)
(3, 3,
 'Practicante en Ciencia de Datos',
 'Analizarás datasets reales usando Python, pandas y visualización con Power BI.',
 'Conocimientos en Python y estadística básica. Promedio mínimo 15.',
 '2025-06-01', '2025-06-30', '2025-07-15', '2026-01-15',
 2, 'cerrada', '2025-05-30'),

-- oferta 3: publicada — postulación VENCE HOY (09-may-2026) ← clave para demo
(1, 1,
 'Practicante en Desarrollo Frontend React',
 'Construirás interfaces modernas con React 18 y TailwindCSS integrando con APIs REST. '
 'Trabajarás en el equipo de producto junto a diseñadores UX y desarrolladores backend.',
 'Conocimientos en HTML, CSS, JavaScript, React básico. Promedio mínimo 14.',
 '2026-04-20', '2026-05-09', '2026-06-01', '2026-11-30',
 4, 'publicada', '2026-04-18'),

-- oferta 4: publicada — postulación VENCE MAÑANA (10-may-2026)
(4, 4,
 'Practicante en Administración de Redes y Seguridad',
 'Configurarás y monitorearás infraestructura de red. Apoyo en ethical hacking básico y análisis de vulnerabilidades.',
 'Conocimientos en redes TCP/IP, Linux básico. Promedio mínimo 14.',
 '2026-04-25', '2026-05-10', '2026-06-10', '2026-12-10',
 2, 'publicada', '2026-04-23'),

-- oferta 5: publicada — postulación VENCE PASADO MAÑANA (11-may-2026)
(5, 5,
 'Practicante en Diseño UX/UI',
 'Diseñarás wireframes y prototipos interactivos. Realizarás pruebas de usabilidad con usuarios reales. Trabajo 100% remoto.',
 'Conocimientos en Figma o Adobe XD. Portafolio deseable. Promedio mínimo 13.',
 '2026-04-28', '2026-05-11', '2026-06-15', '2026-12-15',
 2, 'publicada', '2026-04-25'),

-- oferta 6: borrador — para que Coordinador/Rep. la complete y publique
(2, NULL,
 'Practicante en Marketing Digital',
 'Apoyarás en campañas de redes sociales y email marketing.',
 'Conocimientos básicos en marketing. Promedio mínimo 13.',
 '2026-05-20', '2026-06-15', '2026-07-01', '2026-12-31',
 3, 'borrador', '2026-05-08');

-- =====================================================
-- 12. POSTULACIONES
-- =====================================================
-- estudiante_id (fila en tabla estudiante):
--   1=Juan(IS), 2=María(CC), 3=Carlos(IS), 4=Sofía(IS),
--   5=Andrés(CC), 6=Gabriela(IC), 7=Diego(IS), 8=Valeria(CC),
--   9=Fernando(IE), 10=Camila(IS)
-- oferta_id: 1=Backend(cerrada), 2=DataSol(cerrada),
--            3=Frontend(vence hoy), 4=Redes(vence mañana), 5=UX(vence pasado), 6=borrador
INSERT INTO postulacion (oferta_id, estudiante_id, cv_url, carta_presentacion, estado,
    fecha_postulacion, fecha_revision, revisado_por) VALUES

-- ── Oferta 1 (Backend, CERRADA — histórico 2025) ──
(1, 4,
 'https://docs.unt.edu.pe/cv/sofia_gutierrez.pdf',
 'Tengo experiencia en proyectos universitarios con Node.js y me interesa crecer en backend.',
 'aprobado', '2025-03-10', '2025-04-01', 22),

(1, 7,
 'https://docs.unt.edu.pe/cv/diego_rios.pdf',
 'Desarrollé una API REST en mi proyecto de curso. Quiero aplicar mis habilidades profesionalmente.',
 'aprobado', '2025-03-12', '2025-04-01', 22),

(1, 10,
 'https://docs.unt.edu.pe/cv/camila_fuentes.pdf',
 'Cuento con sólidos conocimientos en JavaScript y Express. Soy proactiva y trabajo bien en equipo.',
 'rechazado', '2025-03-20', '2025-04-01', 22),

-- ── Oferta 2 (DataSol, CERRADA — histórico 2025) ──
(2, 5,
 'https://docs.unt.edu.pe/cv/andres_morales.pdf',
 'He trabajado con pandas y matplotlib en cursos de estadística. Me apasiona el análisis de datos.',
 'aprobado', '2025-06-10', '2025-07-01', 24),

(2, 8,
 'https://docs.unt.edu.pe/cv/valeria_mendoza.pdf',
 'Cuento con proyectos de machine learning básico en Python.',
 'rechazado', '2025-06-15', '2025-07-01', 24),

-- ── Oferta 3 (Frontend, VENCE HOY 09-may-2026) ──
-- Juan: aprobado → tiene práctica activa
(3, 1,
 'https://docs.unt.edu.pe/cv/juan_perez.pdf',
 'He desarrollado aplicaciones con React en mis proyectos de facultad y me interesa el frontend.',
 'aprobado', '2026-04-22', '2026-04-30', 22),

-- Carlos: preseleccionado → pendiente de decisión final (ideal para demostrar flujo Rep.)
(3, 3,
 'https://docs.unt.edu.pe/cv/carlos_rodriguez.pdf',
 'Cuento con un proyecto de React con hooks y Context API. Quiero seguir creciendo.',
 'preseleccionado', '2026-04-24', '2026-05-05', 22),

-- María: postulada sin revisar aún → llegó hoy mismo
(3, 2,
 'https://docs.unt.edu.pe/cv/maria_lopez.pdf',
 'Tengo bases sólidas en JavaScript y React. Mi promedio refleja mi compromiso académico.',
 'postulado', '2026-05-09', NULL, NULL),

-- ── Oferta 4 (Redes, VENCE MAÑANA 10-may-2026) ──
-- Fernando: aprobado → tiene práctica activa
(4, 9,
 'https://docs.unt.edu.pe/cv/fernando_soto.pdf',
 'He cursado redes de computadoras y configurado routers en laboratorio. Me interesa la seguridad.',
 'aprobado', '2026-04-27', '2026-05-06', 25),

-- Diego: postulado ayer → pendiente de revisión
(4, 7,
 'https://docs.unt.edu.pe/cv/diego_rios2.pdf',
 'Tengo conocimientos en Linux y redes básicas. Me gustaría especializarme en ciberseguridad.',
 'postulado', '2026-05-08', NULL, NULL),

-- ── Oferta 5 (UX/UI, VENCE PASADO 11-may-2026) ──
-- Gabriela: aprobada → tiene práctica activa
(5, 6,
 'https://docs.unt.edu.pe/cv/gabriela_herrera.pdf',
 'He diseñado prototipos en Figma para proyectos de clase. Me apasiona la experiencia de usuario.',
 'aprobado', '2026-04-30', '2026-05-07', 26);

-- =====================================================
-- 13. PRÁCTICAS
-- =====================================================
-- Prácticas históricas (finalizadas en 2025)
-- Prácticas activas: iniciaron en 2026 y siguen en curso
-- asesor_academico_id = usuario_id de docentes:
--   7=Jorge(IS), 8=Carmen(CC/DS), 9=Roberto(IC), 10=Lucía(IS/redes), 11=Héctor(IE)
INSERT INTO practica (postulacion_id, estudiante_id, empresa_id, asesor_empresa_nombre, cargo_supervisor, email_supervisor,
    telefono_supervisor, fecha_inicio, fecha_fin, horas_semanales, estado,
    asesor_academico_id, calificacion_final, observaciones_finales, creado_en) VALUES

-- práctica 1: FINALIZADA Sofía (postulacion 1, oferta 1-Backend, TechCorp, 2025)
(1, 4, 1, 'Ing. Roberto Paredes', 'Tech Lead', 'r.paredes@techcorp.pe', '044-301201',
 '2025-04-15', '2025-10-15', 30, 'finalizada', 7, 17.50,
 'Excelente desempeño. Entregó todos los módulos a tiempo y con calidad profesional.',
 '2025-04-14'),

-- práctica 2: FINALIZADA Diego (postulacion 2, oferta 1-Backend, TechCorp, 2025)
(2, 7, 1, 'Ing. Roberto Paredes', 'Tech Lead', 'r.paredes@techcorp.pe', '044-301201',
 '2025-04-15', '2025-10-15', 30, 'finalizada', 7, 16.00,
 'Buen desempeño general. Requirió orientación en las primeras semanas.',
 '2025-04-14'),

-- práctica 3: FINALIZADA Andrés (postulacion 4, oferta 2-DataSol, 2025)
(4, 5, 3, 'Lic. Paola Chávez', 'Data Analyst Senior', 'p.chavez@datasol.pe', '044-301301',
 '2025-07-15', '2026-01-15', 24, 'finalizada', 8, 18.00,
 'Destacado. Desarrolló un dashboard de ventas que fue adoptado por el equipo.',
 '2025-07-14'),

-- práctica 4: ACTIVA Juan (postulacion 6, oferta 3-Frontend, TechCorp)
--   Inicio: 2026-03-02 → lleva ~10 semanas → horas_completadas realistas
(6, 1, 1, 'Ing. Karla Mendoza', 'Frontend Lead', 'k.mendoza@techcorp.pe', '044-301202',
 '2026-03-02', NULL, 30, 'activa', 7, NULL, NULL,
 '2026-02-28'),

-- práctica 5: ACTIVA Fernando (postulacion 9, oferta 4-Redes, GlobalTech)
--   Inicio: 2026-03-09 → lleva ~9 semanas
(9, 9, 4, 'Ing. César Rojas', 'Infraestructura Senior', 'c.rojas@globaltech.pe', '044-301401',
 '2026-03-09', NULL, 28, 'activa', 10, NULL, NULL,
 '2026-03-07'),

-- práctica 6: ACTIVA Gabriela (postulacion 11, oferta 5-UX, NexusDigital)
--   Inicio: 2026-03-16 → lleva ~8 semanas
(11, 6, 5, 'Dis. Laura Vega', 'UX Lead', 'l.vega@nexusdigital.pe', '044-301501',
 '2026-03-16', NULL, 24, 'activa', 8, NULL, NULL,
 '2026-03-14');

-- =====================================================
-- 14. SEGUIMIENTO DE HORAS (semana del 04 al 09 de mayo 2026)
-- =====================================================
-- PROPÓSITO DEL DEMO:
--   Lunes-Miércoles (04-06 may): aprobados empresa y asesor → historial limpio
--   Jueves (07 may):              aprobado empresa, PENDIENTE asesor → Asesor puede aprobar hoy
--   Viernes (08 may):             PENDIENTE empresa y asesor → Rep. y Asesor aprueban hoy/mañana
--   Sábado (09 may / HOY):        recién registrado, sin aprobaciones → acción inmediata
-- =====================================================

-- practica_id 4 = Juan (activa, Frontend, TechCorp, asesor=Jorge id=7)
INSERT INTO seguimiento_horas (practica_id, fecha_trabajada, horas, descripcion_actividad,
    aprobado_empresa, aprobado_asesor) VALUES
(4, '2026-05-04', 6, 'Implementación del módulo de perfil de usuario con carga de avatar.',                         true,  true),
(4, '2026-05-05', 6, 'Integración de librería de gráficos Recharts en el dashboard de estadísticas.',              true,  true),
(4, '2026-05-06', 6, 'Corrección de bugs reportados en la revisión de sprint. Merge de 3 PRs.',                    true,  true),
(4, '2026-05-07', 6, 'Desarrollo de componente de tabla con exportación a CSV.',                                   true,  false),  -- Asesor pendiente
(4, '2026-05-08', 6, 'Reunión de planificación sprint 6 y estimación de tickets con el equipo.',                   false, false),  -- Ambos pendientes
(4, '2026-05-09', 6, 'Inicio de módulo de notificaciones push con WebSockets. Configuración inicial.',             false, false);  -- HOY - recién registrado

-- practica_id 5 = Fernando (activa, Redes, GlobalTech, asesor=Lucía id=10)
INSERT INTO seguimiento_horas (practica_id, fecha_trabajada, horas, descripcion_actividad,
    aprobado_empresa, aprobado_asesor) VALUES
(5, '2026-05-04', 7, 'Monitoreo de rendimiento de red con Grafana y alertas automatizadas.',                       true,  true),
(5, '2026-05-05', 7, 'Configuración de firewall pfSense para segmentación de redes internas.',                     true,  true),
(5, '2026-05-06', 7, 'Elaboración del reporte semanal de incidencias y disponibilidad del servicio.',              true,  true),
(5, '2026-05-07', 7, 'Escaneo de vulnerabilidades con Nessus en servidores de producción.',                        true,  false),  -- Asesor pendiente
(5, '2026-05-08', 7, 'Apoyo en la migración de servidores al nuevo rack del datacenter.',                          false, false),  -- Ambos pendientes
(5, '2026-05-09', 7, 'Documentación de la topología de red actualizada tras la migración.',                        false, false);  -- HOY

-- practica_id 6 = Gabriela (activa, UX/UI, NexusDigital, asesor=Carmen id=8)
INSERT INTO seguimiento_horas (practica_id, fecha_trabajada, horas, descripcion_actividad,
    aprobado_empresa, aprobado_asesor) VALUES
(6, '2026-05-04', 6, 'Diseño de pantallas de onboarding para la aplicación móvil (6 pantallas).',                 true,  true),
(6, '2026-05-05', 6, 'Revisión de heurísticas de usabilidad sobre los flujos de pago existentes.',                 true,  true),
(6, '2026-05-06', 6, 'Prototipado interactivo en Figma del flujo de checkout rediseñado.',                         true,  true),
(6, '2026-05-07', 6, 'Sesión de pruebas con 4 usuarios reales y registro de hallazgos.',                           true,  false),  -- Asesor pendiente
(6, '2026-05-08', 6, 'Análisis de resultados de las pruebas de usabilidad y propuesta de mejoras.',               false, false),  -- Ambos pendientes
(6, '2026-05-09', 6, 'Presentación interna de mejoras al equipo de producto.',                                     false, false);  -- HOY

-- =====================================================
-- 15. INFORMES DE PRÁCTICA
-- =====================================================
INSERT INTO informe_practica (practica_id, tipo, titulo, contenido_resumen,
    documento_url, fecha_entrega, estado, comentario_asesor) VALUES

-- Sofía (practica 1, finalizada) — parcial y final
(1, 'parcial',
 'Informe Parcial - Desarrollo Backend TechCorp',
 'Durante los primeros 3 meses implementé 5 endpoints REST para el módulo de usuarios y autenticación. Se utilizó JWT para seguridad.',
 'https://docs.unt.edu.pe/informes/sofia_parcial.pdf',
 '2025-07-15', 'aprobado',
 'Excelente avance. Demuestra dominio técnico sólido. Continuar con buenas prácticas.'),

(1, 'final',
 'Informe Final - Desarrollo Backend TechCorp',
 'Concluí el desarrollo del módulo de gestión de pedidos y su integración con pasarela de pagos. El sistema está en producción.',
 'https://docs.unt.edu.pe/informes/sofia_final.pdf',
 '2025-10-10', 'aprobado',
 'Trabajo sobresaliente. El sistema implementado tiene impacto real en la empresa. Felicitaciones.'),

-- Diego (practica 2, finalizada) — parcial y final
(2, 'parcial',
 'Informe Parcial - Desarrollo Backend TechCorp',
 'Implementé el módulo de catálogo de productos con CRUD completo y filtros de búsqueda.',
 'https://docs.unt.edu.pe/informes/diego_parcial.pdf',
 '2025-07-15', 'observado',
 'El informe es aceptable pero le falta mayor detalle técnico. Por favor reenviar con las secciones de arquitectura.'),

(2, 'final',
 'Informe Final - Desarrollo Backend TechCorp',
 'Finalicé el módulo de reportes con exportación a PDF y Excel. Se incorporaron las observaciones del informe parcial.',
 'https://docs.unt.edu.pe/informes/diego_final.pdf',
 '2025-10-12', 'aprobado',
 'Buen informe final. Notoria mejora respecto al parcial.'),

-- Andrés (practica 3, finalizada) — parcial y final
(3, 'parcial',
 'Informe Parcial - Ciencia de Datos DataSol',
 'Realicé limpieza y análisis exploratorio de 3 datasets de ventas. Construí visualizaciones con matplotlib y seaborn.',
 'https://docs.unt.edu.pe/informes/andres_parcial.pdf',
 '2025-10-01', 'aprobado',
 'Excelente trabajo de análisis. Las visualizaciones son claras y el análisis estadístico es correcto.'),

(3, 'final',
 'Informe Final - Ciencia de Datos DataSol',
 'Construí un dashboard interactivo con Power BI que integra 5 fuentes de datos y se actualiza automáticamente cada hora.',
 'https://docs.unt.edu.pe/informes/andres_final.pdf',
 '2026-01-10', 'aprobado',
 'Trabajo excepcional. El dashboard ya es usado por el equipo directivo de la empresa. Calificación máxima.'),

-- Juan (practica 4 activa) — informe parcial PENDIENTE de revisión
--   Vencía el 2026-05-08 (ayer) → el asesor lo tiene que revisar HOY
(4, 'parcial',
 'Informe Parcial - Desarrollo Frontend TechCorp',
 'En los primeros 2 meses implementé el sistema de autenticación, dashboard principal y módulo de gestión de usuarios con React 18 y TailwindCSS.',
 'https://docs.unt.edu.pe/informes/juan_parcial.pdf',
 '2026-05-08', 'pendiente',
 NULL);

-- =====================================================
-- 16. EVALUACIONES FINALES DE PRÁCTICA
-- =====================================================
INSERT INTO evaluacion_final_practica (practica_id, calificacion_empresa, calificacion_asesor,
    retroalimentacion, fecha_evaluacion, apto) VALUES
-- Sofía (practica 1)
(1, 18, 17,
 'Practicante sobresaliente. Tomó iniciativa, propuso mejoras y entregó con calidad. Recomendamos para contratación.',
 '2025-10-16', true),
-- Diego (practica 2)
(2, 16, 16,
 'Buen desempeño con mejora progresiva. Alcanzó los objetivos propuestos satisfactoriamente.',
 '2025-10-16', true),
-- Andrés (practica 3)
(3, 19, 17,
 'Rendimiento excepcional. El dashboard que construyó se sigue usando en producción. Altamente recomendado.',
 '2026-01-16', true);

-- =====================================================
-- 17. PROYECTOS DE TESIS
-- =====================================================
INSERT INTO proyecto_tesis (estudiante_id, titulo, resumen, area_conocimiento, palabras_clave,
    estado, fecha_registro, fecha_aprobacion, aprobado_por) VALUES

-- proyecto 1: aprobado (Sofía) → en desarrollo con entregables urgentes
(4,
 'Sistema de Gestión de Prácticas Pre-Profesionales con Seguimiento en Tiempo Real',
 'Desarrollo de una plataforma web que automatice el proceso de registro, asignación y seguimiento de prácticas pre-profesionales en universidades nacionales, integrando notificaciones en tiempo real.',
 'Ingeniería de Software',
 'prácticas profesionales, seguimiento, notificaciones, Node.js, React',
 'aprobado', '2025-11-01', '2025-12-15', 1),

-- proyecto 2: en desarrollo (Diego)
(7,
 'Implementación de un Sistema de Detección de Intrusiones en Redes LAN usando Machine Learning',
 'Diseño e implementación de un IDS basado en algoritmos de Machine Learning para detectar ataques en redes LAN universitarias, con evaluación de rendimiento en tiempo real.',
 'Redes y Seguridad',
 'IDS, machine learning, redes, ciberseguridad, anomalías',
 'en_desarrollo', '2025-09-15', '2025-11-01', 1),

-- proyecto 3: propuesto (Andrés) → Coordinador debe aprobar esta semana
(5,
 'Dashboard Predictivo de Rendimiento Académico usando Técnicas de Minería de Datos',
 'Aplicación de técnicas de minería de datos y modelos predictivos para anticipar el rendimiento académico de estudiantes universitarios y recomendar intervenciones oportunas.',
 'Ciencia de Datos',
 'minería de datos, predicción, rendimiento académico, python, scikit-learn',
 'propuesto', '2026-04-20', NULL, NULL),

-- proyecto 4: en registro (Juan) → recién enviado
(1,
 'Arquitectura de Microservicios para Plataformas Educativas en la Nube',
 'Diseño e implementación de una arquitectura de microservicios escalable para plataformas educativas, evaluando patrones de resiliencia y rendimiento bajo carga.',
 'Ingeniería de Software',
 'microservicios, cloud, Docker, Kubernetes, educación',
 'en_registro', '2026-05-07', NULL, NULL),

-- proyecto 5: culminado (Camila) — sustentación ya realizada
(10,
 'Evaluación de Frameworks Frontend Modernos: React vs Vue vs Angular en Aplicaciones Empresariales',
 'Estudio comparativo de los principales frameworks frontend evaluando rendimiento, mantenibilidad, curva de aprendizaje y ecosistema para aplicaciones de escala empresarial.',
 'Ingeniería de Software',
 'React, Vue, Angular, frontend, rendimiento, comparativa',
 'culminado', '2025-03-10', '2025-05-01', 1);

-- =====================================================
-- 18. TESIS
-- =====================================================
INSERT INTO tesis (proyecto_id, estudiante_id, titulo, resumen, area_conocimiento,
    estado, fecha_registro, fecha_aprobacion, fecha_sustentacion, nota_final, resultado_sustentacion) VALUES

-- tesis 1 (Sofía): aprobada, en desarrollo activo
(1, 4,
 'Sistema de Gestión de Prácticas Pre-Profesionales con Seguimiento en Tiempo Real',
 'Desarrollo de una plataforma web que automatice el proceso de registro, asignación y seguimiento de prácticas pre-profesionales en universidades nacionales.',
 'Ingeniería de Software',
 'aprobado', '2025-11-01', '2025-12-15', NULL, NULL, NULL),

-- tesis 2 (Diego): en desarrollo — sustentación programada para LUNES 11-may-2026
(2, 7,
 'Implementación de un Sistema de Detección de Intrusiones en Redes LAN usando Machine Learning',
 'Diseño e implementación de un IDS basado en Machine Learning para redes LAN universitarias.',
 'Redes y Seguridad',
 'en_revision', '2025-09-15', '2025-11-01', '2026-05-11', NULL, NULL),

-- tesis 3 (Camila): culminada con nota
(5, 10,
 'Evaluación de Frameworks Frontend Modernos: React vs Vue vs Angular en Aplicaciones Empresariales',
 'Estudio comparativo de frameworks frontend evaluando rendimiento, mantenibilidad y ecosistema.',
 'Ingeniería de Software',
 'culminado', '2025-03-10', '2025-05-01', '2025-11-15', 18.50, 'aprobado');

-- =====================================================
-- 19. ASIGNACIONES DE ASESOR A TESIS
-- =====================================================
-- docente_id (fila en tabla docente):
--   1=Rosa(coord,IS), 2=Luis(coord,CC), 3=Ana(coord,EP), 4=Miguel(coord,IS), 5=Patricia(coord,CC)
--   6=Jorge(asesor,IS), 7=Carmen(asesor,CC), 8=Roberto(asesor,IC)
--   9=Lucía(asesor,IS), 10=Héctor(asesor,IE)
INSERT INTO asesor_tesis (tesis_id, docente_id, tipo_asignacion, rol_jurado,
    fecha_asignacion, activo, observaciones) VALUES

-- Tesis 1 (Sofía): Asesor + Jurado
(1, 6,  'asesor',  NULL,         '2025-12-16', true, 'Asesor principal. Reuniones quincenales.'),
(1, 7,  'jurado',  'presidente', '2025-12-20', true, 'Presidirá el jurado al término del desarrollo.'),
(1, 4,  'jurado',  'secretario', '2025-12-20', true, NULL),
(1, 5,  'jurado',  'vocal',      '2025-12-20', true, NULL),

-- Tesis 2 (Diego): Asesor + Jurado — sustentación el LUNES 11-may-2026
(2, 10, 'asesor',  NULL,         '2025-11-05', true, 'Asesor de redes y seguridad. Revisiones mensuales.'),
(2, 9,  'jurado',  'presidente', '2025-11-10', true, 'Presidirá la sustentación del lunes 11/05.'),
(2, 6,  'jurado',  'secretario', '2025-11-10', true, NULL),
(2, 3,  'jurado',  'vocal',      '2025-11-10', true, NULL),

-- Tesis 3 (Camila, culminada)
(3, 7,  'asesor',  NULL,         '2025-05-05', true, 'Excelente trabajo. Sustentación exitosa.'),
(3, 1,  'jurado',  'presidente', '2025-05-10', true, NULL),
(3, 2,  'jurado',  'secretario', '2025-05-10', true, NULL),
(3, 8,  'jurado',  'vocal',      '2025-05-10', true, NULL);

-- =====================================================
-- 20. ENTREGABLES DE TESIS
-- =====================================================
-- ESTRATEGIA DE FECHAS:
--   Tesis 1 (Sofía):  entregable 3 vence HOY (09-may), entregable 4 el LUNES (11-may)
--   Tesis 2 (Diego):  entregable 4 vence MAÑANA (10-may) — urgente antes de sustentación
--   Tesis 3 (Camila): todos cerrados (histórico 2025)
INSERT INTO entregable_tesis_mejorado (tesis_id, nombre, descripcion,
    fecha_limite, obligatorio, orden, activo) VALUES

-- Tesis 1 (Sofía)
(1, 'Plan de Tesis',
 'Documento con objetivos, hipótesis y cronograma.',
 '2026-01-31', true, 1, true),

(1, 'Marco Teórico',
 'Revisión de literatura y estado del arte.',
 '2026-03-31', true, 2, true),

(1, 'Diseño del Sistema',
 'Diagramas UML, arquitectura y modelo de datos. ENTREGA HOY.',
 '2026-05-09', true, 3, true),   -- vence HOY 09-may

(1, 'Implementación y Pruebas',
 'Código fuente, manual de usuario y pruebas funcionales.',
 '2026-05-11', true, 4, true),   -- vence LUNES 11-may

(1, 'Borrador Final',
 'Documento completo de tesis para revisión del asesor.',
 '2026-08-29', true, 5, true),

-- Tesis 2 (Diego)
(2, 'Plan de Tesis',
 'Documento con objetivos, hipótesis y cronograma.',
 '2025-12-15', true, 1, true),

(2, 'Marco Teórico',
 'Revisión de IDS, ML y seguridad de redes.',
 '2026-02-28', true, 2, true),

(2, 'Diseño del Sistema',
 'Arquitectura del IDS y selección de algoritmos.',
 '2026-04-30', true, 3, true),

(2, 'Dataset, Entrenamiento y Documento Final',
 'Dataset etiquetado, modelo ML entrenado y tesis final. Previo a sustentación del lunes 11/05.',
 '2026-05-10', true, 4, true),   -- vence MAÑANA 10-may (día antes de sustentación)

-- Tesis 3 (Camila, culminada)
(3, 'Plan de Tesis',
 'Documento inicial.',
 '2025-04-15', true, 1, true),

(3, 'Marco Teórico',
 'Revisión de frameworks y criterios de comparación.',
 '2025-06-30', true, 2, true),

(3, 'Experimentos',
 'Resultados de benchmarks y comparativas.',
 '2025-09-30', true, 3, true),

(3, 'Tesis Final',
 'Documento final revisado y aprobado.',
 '2025-11-01', true, 4, true);

-- =====================================================
-- 21. ENTREGAS DE TESIS
-- =====================================================
INSERT INTO entrega_tesis_mejorada (entregable_id, estudiante_id, titulo_entrega,
    documento_url, comentario, fecha_entrega, estado,
    retroalimentacion_asesor, fecha_revision, revisado_por) VALUES

-- Sofía (entregables 1 y 2 aprobados; entregable 3 entregado hoy, sin revisar)
(1, 4,
 'Plan de Tesis v1.0',
 'https://docs.unt.edu.pe/tesis/sofia_plan.pdf',
 'Primer borrador del plan. Incluye cronograma de 12 meses.',
 '2026-01-28', 'aprobado',
 'Plan bien estructurado. Los objetivos son claros y alcanzables. Cronograma realista. Aprobado.',
 '2026-02-05', 6),

(2, 4,
 'Marco Teórico - Capítulos 1 al 3',
 'https://docs.unt.edu.pe/tesis/sofia_marco.pdf',
 'Marco teórico con 45 referencias bibliográficas actualizadas.',
 '2026-03-28', 'aprobado',
 'Excelente revisión de literatura. Bien citado y organizado. Sin observaciones.',
 '2026-04-10', 6),

-- Entregable 3 (Diseño) entregado HOY justo antes del vencimiento → asesor debe revisar
(3, 4,
 'Diseño del Sistema - Arquitectura y UML',
 'https://docs.unt.edu.pe/tesis/sofia_diseno.pdf',
 'Incluye diagrama de clases, casos de uso, modelo entidad-relación y arquitectura en capas.',
 '2026-05-09', 'entregado',
 NULL, NULL, NULL),

-- Diego (entregables 1, 2, 3 aprobados; entregable 4 enviado ayer)
-- Nota: La versión v1 del marco teórico fue observada, pero aquí solo incluimos la versión aprobada (v2)
(6, 7,
 'Plan de Tesis - IDS con ML',
 'https://docs.unt.edu.pe/tesis/diego_plan.pdf',
 'Plan completo con metodología CRISP-DM adaptada al proyecto.',
 '2025-12-12', 'aprobado',
 'Buen plan. Ajustar el alcance del dataset en el cronograma. Segunda versión aceptada.',
 '2025-12-20', 10),

(7, 7,
 'Marco Teórico - Redes y ML v2 (corregido)',
 'https://docs.unt.edu.pe/tesis/diego_marco_v2.pdf',
 'Versión corregida con sección ampliada de algoritmos y 15 referencias adicionales. (Primera versión fue observada y reenviada el 20/03)',
 '2026-03-20', 'aprobado',
 'Correcciones aceptadas. Marco teórico aprobado.',
 '2026-03-28', 10),

(8, 7,
 'Diseño del IDS - Arquitectura y Selección de Algoritmos',
 'https://docs.unt.edu.pe/tesis/diego_diseno.pdf',
 'Arquitectura del IDS con Random Forest y SVM. Justificación de selección de features.',
 '2026-04-28', 'aprobado',
 'Diseño sólido y bien justificado. Listo para la fase de implementación.',
 '2026-05-05', 10),

-- Entregable 4 (documento final) enviado ayer → asesor/jurado deben aprobar antes de lunes
(9, 7,
 'Tesis Final + Modelo Entrenado - Previo a Sustentación',
 'https://docs.unt.edu.pe/tesis/diego_final.pdf',
 'Tesis completa de 98 páginas y modelo entrenado con 94.7% de accuracy. Lista para sustentación del 11/05.',
 '2026-05-08', 'revisando',
 NULL, NULL, NULL),

-- Camila (todos aprobados, tesis culminada)
(10, 10,
 'Plan de Tesis - Comparativa Frameworks',
 'https://docs.unt.edu.pe/tesis/camila_plan.pdf',
 'Plan detallado con criterios de evaluación y metodología.',
 '2025-04-10', 'aprobado',
 'Plan aprobado. Muy bien definidos los criterios de comparación.',
 '2025-04-20', 7),

(11, 10,
 'Marco Teórico - Ecosistema Frontend',
 'https://docs.unt.edu.pe/tesis/camila_marco.pdf',
 'Revisión exhaustiva del ecosistema React, Vue y Angular 2018-2025.',
 '2025-06-28', 'aprobado',
 'Excelente cobertura bibliográfica. Sin observaciones.',
 '2025-07-10', 7),

(12, 10,
 'Resultados de Benchmarks y Comparativas',
 'https://docs.unt.edu.pe/tesis/camila_exp.pdf',
 'Benchmarks de rendimiento, tamaño de bundle y tiempo de carga en 10 escenarios.',
 '2025-09-25', 'aprobado',
 'Resultados sólidos y bien justificados estadísticamente. Aprobado.',
 '2025-10-05', 7),

(13, 10,
 'Tesis Final Completa',
 'https://docs.unt.edu.pe/tesis/camila_final.pdf',
 'Documento final de 120 páginas con todos los capítulos, conclusiones y recomendaciones.',
 '2025-10-30', 'aprobado',
 'Tesis de excelente calidad. Lista para sustentación. Felicitaciones.',
 '2025-11-08', 7);

-- =====================================================
-- 22. ACTA DE SUSTENTACIÓN (Camila — ya realizada)
-- =====================================================
-- La sustentación de Diego (proyecto_id=2) aún no tiene acta: es el LUNES 11-may.
-- El Coordinador/Secretaria la creará tras el acto. Aquí solo la de Camila.
INSERT INTO acta_sustentacion (proyecto_id, fecha_sustentacion, hora_inicio, hora_fin,
    lugar, nota_final, resultado, url_acta_firmada, creado_en) VALUES
(5, '2025-11-15', '10:00', '12:00',
 'Sala de Conferencias A - Facultad de Ingeniería',
 18.50, 'aprobado',
 'https://docs.unt.edu.pe/actas/camila_acta_sustentacion.pdf',
 '2025-11-15');

-- =====================================================
-- 23. PAGOS (módulo Secretaria)
-- =====================================================
-- Varios estudiantes con pagos en distintos estados para probar el rol Secretaria
-- El trigger auto-genera codigo_pago, así que no lo incluimos.
-- concepto_id: ver inserts en init-complete.sql
--   1=MAT-001(Matrícula Regular 350), 2=MAT-002(Matrícula Ext 450)
--   3=TRA-001(Constancia 20), 4=TRA-002(Cert. Alumno 25)
--   5=TRA-003(Dup. Carnet 30), 6=EXT-001(Prácticas 50), 7=EXT-002(Tesis 150)
--   8=OTR-001(Otros)
INSERT INTO pago (estudiante_id, concepto_id, monto, estado, metodo_pago,
    referencia_pago, fecha_pago, fecha_vencimiento,
    comprobante_url, registrado_por) VALUES

-- Juan: pagó tramite de prácticas (completado)
(1, 6, 50.00, 'completado', 'yape',
 'YPE-20260301-001', '2026-03-01 09:15:00', '2026-03-15',
 'https://docs.unt.edu.pe/pagos/juan_practicas.pdf', 27),

-- Juan: tramite de tesis pendiente → Secretaria puede aprobar HOY
(1, 7, 150.00, 'pendiente', NULL,
 NULL, NULL, '2026-05-09',
 NULL, 27),

-- María: matrícula pendiente → vence mañana 10-may
(2, 1, 350.00, 'pendiente', NULL,
 NULL, NULL, '2026-05-10',
 NULL, 27),

-- Carlos: matrícula completada
(3, 1, 350.00, 'completado', 'deposito',
 'BCP-20260210-4421', '2026-02-10 11:30:00', '2026-02-20',
 'https://docs.unt.edu.pe/pagos/carlos_matricula.pdf', 27),

-- Sofía: tramite tesis (completado) + constancia solicitada HOY
(4, 7, 150.00, 'completado', 'transferencia',
 'IBK-20260102-9901', '2026-01-02 14:00:00', '2026-01-15',
 'https://docs.unt.edu.pe/pagos/sofia_tesis.pdf', 27),

(4, 3, 20.00, 'procesando', 'efectivo',
 NULL, '2026-05-09 08:30:00', '2026-05-09',
 NULL, 27),

-- Andrés: pago tesis completado
(5, 7, 150.00, 'completado', 'yape',
 'YPE-20260120-330', '2026-01-20 10:00:00', '2026-01-31',
 'https://docs.unt.edu.pe/pagos/andres_tesis.pdf', 27),

-- Diego: pago constancia pendiente vence LUNES 11-may (día de su sustentación)
(7, 3, 20.00, 'pendiente', NULL,
 NULL, NULL, '2026-05-11',
 NULL, 27),

-- Camila: matrícula + todos completados
(10, 1, 350.00, 'completado', 'tarjeta',
 'VISA-20260305-7712', '2026-03-05 16:20:00', '2026-03-15',
 'https://docs.unt.edu.pe/pagos/camila_matricula.pdf', 27),

-- Valeria: matrícula rechazada (referencia inválida) → Secretaria debe gestionar
(8, 1, 350.00, 'rechazado', 'deposito',
 'BCP-INVALIDO-9999', '2026-04-01 09:00:00', '2026-04-10',
 NULL, 27);

-- =====================================================
-- 24. NOTIFICACIONES
-- =====================================================
-- Fechas ancladas a hoy (09-may) y ayer (08-may) para máxima relevancia en demo
INSERT INTO notificacion (usuario_id, tipo, titulo, mensaje, leido, creado_en,
    entidad_referenciada, id_referenciado) VALUES

-- ── Juan (id=12) ──
(12, 'advertencia', 'Informe Parcial Entregado — Pendiente de Revisión',
 'Tu informe parcial de prácticas fue entregado ayer. El asesor Jorge Chávez lo revisará pronto.',
 false, '2026-05-09 08:00:00', 'informe', 7),

(12, 'advertencia', 'Horas del 07 y 08 may pendientes de aprobación del asesor',
 'Tienes 2 registros de horas sin aprobación del asesor. El registro del 09/05 está pendiente de empresa y asesor.',
 false, '2026-05-09 08:05:00', 'practica', 4),

(12, 'advertencia', 'Pago de Trámite de Tesis — Vence HOY',
 'Tu pago por Trámite de Tesis (S/. 150.00) vence hoy 09/05/2026. Acércate a Secretaría para completarlo.',
 false, '2026-05-09 07:00:00', 'practica', 4),

(12, 'info', 'Oferta Frontend vence hoy — Postulación de María aún sin revisar',
 'La oferta "Practicante en Desarrollo Frontend React" cierra hoy. Hay una postulación nueva sin revisar.',
 true, '2026-05-08 17:00:00', 'practica', 4),

-- ── Sofía (id=15) ──
(15, 'advertencia', 'Entregable Diseño del Sistema — Vence HOY 09/05',
 'El entregable "Diseño del Sistema" de tu tesis vence hoy. Ya lo enviaste; espera la revisión del asesor.',
 false, '2026-05-09 07:00:00', 'entrega_tesis', 3),

(15, 'advertencia', 'Entregable Implementación y Pruebas — Vence el Lunes 11/05',
 'El entregable "Implementación y Pruebas" de tu tesis vence el lunes 11/05/2026. Prepara tu entrega.',
 false, '2026-05-09 07:01:00', 'entrega_tesis', 4),

(15, 'exito', 'Marco Teórico Aprobado',
 'Tu entrega "Marco Teórico - Capítulos 1 al 3" fue aprobada por el asesor Jorge Chávez. Sin observaciones.',
 true, '2026-04-10 11:00:00', 'entrega_tesis', 2),

-- ── Diego (id=18) ──
(18, 'advertencia', 'Tesis Final en Revisión — Sustentación el Lunes 11/05',
 'Tu documento final está siendo revisado. La sustentación es el lunes 11/05/2026 a las 09:00 am. Sala de Grados.',
 false, '2026-05-09 07:30:00', 'entrega_tesis', 8),

(18, 'advertencia', 'Entregable "Dataset y Tesis Final" vence MAÑANA 10/05',
 'El entregable 4 de tu tesis vence mañana 10/05 antes de tu sustentación del lunes. Asegúrate de tenerlo aprobado.',
 false, '2026-05-09 07:31:00', 'entrega_tesis', 9),

(18, 'info', 'Constancia de Estudios — Pago pendiente vence el 11/05',
 'Tu pago por Constancia de Estudios vence el lunes 11/05 (día de tu sustentación). Págalo antes.',
 false, '2026-05-09 08:00:00', 'practica', 2),

-- ── Andrés (id=16) ──
(16, 'info', 'Propuesta de Tesis Recibida — En Evaluación',
 'Tu propuesta de tesis está siendo evaluada por el coordinador Miguel Flores. Recibirás respuesta esta semana.',
 false, '2026-04-21 10:00:00', 'practica', 3),

-- ── María (id=13) — postulación reciente ──
(13, 'info', 'Postulación Enviada — Oferta Frontend React',
 'Tu postulación a "Practicante en Desarrollo Frontend React" fue enviada hoy. La oferta cierra esta tarde.',
 false, '2026-05-09 09:30:00', 'practica', 4),

(13, 'advertencia', 'Matrícula Pendiente — Vence Mañana 10/05',
 'Tu pago de Matrícula Regular (S/. 350.00) vence mañana 10/05/2026. Acércate a Secretaría hoy.',
 false, '2026-05-09 07:00:00', 'practica', 4),

-- ── Carlos (id=14) — preseleccionado ──
(14, 'exito', 'Preseleccionado para Practicante Frontend React',
 'Fuiste preseleccionado para la oferta "Practicante en Desarrollo Frontend React" en TechCorp. Pendiente decisión final.',
 false, '2026-05-05 15:00:00', 'practica', 4),

-- ── Camila (id=21) ──
(21, 'exito', '¡Tesis Aprobada con Distinción!',
 'Obtuviste 18.5 en tu sustentación de tesis realizada el 15/11/2025. ¡Felicitaciones por tu excelente trabajo!',
 true, '2025-11-15 16:00:00', 'practica', 3),

-- ── Coordinador FI (Rosa, usuario_id=2) ──
(2, 'info', 'Nueva Propuesta de Tesis para Revisar',
 'El estudiante Andrés Morales ha enviado una propuesta de tesis el 20/04/2026. Pendiente de revisión.',
 false, '2026-04-20 10:01:00', 'practica', 3),

(2, 'info', 'Propuesta de Tesis en Registro — Juan Pérez',
 'Juan Pérez registró una propuesta de tesis el 07/05/2026. Pendiente de evaluación inicial.',
 false, '2026-05-07 11:00:00', 'practica', 4),

(2, 'advertencia', 'Convenio CONV-UNT-2023-002 (InnovatePeru) VENCIDO',
 'El convenio con InnovatePeru venció el 15/06/2025. Es necesario renovarlo o iniciar nuevo proceso.',
 false, '2026-05-09 07:00:00', 'convenio', 2),

(2, 'advertencia', 'Oferta "Frontend React" cierra HOY — 1 postulación sin revisar',
 'La oferta de TechCorp cierra hoy 09/05. María López postulo esta mañana y aún no fue revisada.',
 false, '2026-05-09 09:35:00', 'practica', 3),

-- ── Asesor Jorge Chávez (usuario_id=7) ──
(7, 'advertencia', 'Informe Parcial de Juan Pérez — Pendiente de Revisión',
 'El informe parcial de Juan Pérez (practica Frontend TechCorp) fue entregado ayer. Vencía el 08/05/2026.',
 false, '2026-05-09 07:00:00', 'informe', 7),

(7, 'advertencia', '3 Registros de Horas Pendientes de Aprobación — Juan Pérez',
 'Los registros de horas del 07, 08 y 09/05 de Juan Pérez están pendientes de tu aprobación.',
 false, '2026-05-09 08:00:00', 'practica', 4),

(7, 'info', 'Entregable "Diseño del Sistema" recibido — Sofía Gutiérrez',
 'Sofía Gutiérrez entregó el diseño de su sistema de tesis hoy 09/05. Requiere tu revisión.',
 false, '2026-05-09 09:00:00', 'entrega_tesis', 3),

-- ── Asesor Héctor Moya (usuario_id=11, asesor de Diego para tesis) ──
(11, 'advertencia', 'Tesis Final de Diego Ríos — En Revisión (Sustentación el 11/05)',
 'Diego Ríos envió su tesis final ayer (08/05). Debes aprobarla antes del lunes 11/05 para la sustentación.',
 false, '2026-05-09 07:30:00', 'entrega_tesis', 8),

-- ── Rep. TechCorp — Ricardo (usuario_id=22) ──
(22, 'advertencia', 'Oferta "Frontend React" cierra HOY — Aprobar/Rechazar Postulaciones',
 'La oferta cierra hoy 09/05. Carlos Rodríguez está preseleccionado y María López postuló esta mañana. Define el cupo final.',
 false, '2026-05-09 07:00:00', 'practica', 3),

(22, 'advertencia', '3 Registros de Horas de Juan Pérez pendientes de tu aprobación',
 'Los registros del 07, 08 y 09/05 de Juan Pérez (practicante Frontend) requieren tu aprobación.',
 false, '2026-05-09 08:00:00', 'practica', 4),

-- ── Rep. GlobalTech — Sandra (usuario_id=25) ──
(25, 'advertencia', 'Oferta "Redes y Seguridad" cierra MAÑANA — Diego Ríos sin revisar',
 'La oferta cierra mañana 10/05. Diego Ríos postuló ayer y aún no fue revisado. Tienes 1 cupo disponible.',
 false, '2026-05-09 08:30:00', 'practica', 4),

(25, 'advertencia', '3 Registros de Horas de Fernando Soto pendientes de aprobación',
 'Los registros del 07, 08 y 09/05 de Fernando Soto están pendientes de tu aprobación.',
 false, '2026-05-09 08:00:00', 'practica', 5),

-- ── Rep. NexusDigital — Álvaro (usuario_id=26) ──
(26, 'advertencia', '3 Registros de Horas de Gabriela Herrera pendientes de aprobación',
 'Los registros del 07, 08 y 09/05 de Gabriela Herrera (practicante UX) están pendientes de tu aprobación.',
 false, '2026-05-09 08:00:00', 'practica', 6),

-- ── Secretaria — María Elena (usuario_id=27) ──
(27, 'advertencia', '3 Pagos Pendientes que vencen hoy o mañana',
 'Juan Pérez (Tesis, S/.150 - vence hoy), María López (Matrícula, S/.350 - vence mañana 10/05), Diego Ríos (Constancia, S/.20 - vence 11/05).',
 false, '2026-05-09 07:00:00', 'practica', 4),

(27, 'error', 'Pago Rechazado — Valeria Mendoza (referencia inválida)',
 'El pago de matrícula de Valeria Mendoza fue rechazado por referencia bancaria inválida. Requiere gestión.',
 false, '2026-05-09 09:00:00', 'practica', 4);

COMMIT;

-- =====================================================
-- SINCRONIZACIÓN: Actualizar practica con datos de postulacion
-- =====================================================
SELECT sync_practica_from_postulacion();

DO $$
BEGIN
    RAISE NOTICE '>> Sincronización completada.';
    RAISE NOTICE '   practica.estudiante_id y empresa_id actualizados desde postulacion.';
END $$;

-- =====================================================
-- RESUMEN FINAL
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ Datos de prueba (demo 09-11 mayo 2026) cargados exitosamente';
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '📅 AGENDA DE EVENTOS CRÍTICOS PARA EL DEMO';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '';
    RAISE NOTICE '── SÁBADO 09/05 (HOY) ──────────────────────────────────';
    RAISE NOTICE '  • Oferta Frontend TechCorp cierra hoy (postulación de María sin revisar)';
    RAISE NOTICE '  • Entregable tesis Sofía "Diseño del Sistema" vence hoy (ya enviado)';
    RAISE NOTICE '  • Pago de tesis Juan Pérez vence hoy (S/.150 pendiente)';
    RAISE NOTICE '  • Registros de horas 07/08/09 may pendientes (3 prácticas activas)';
    RAISE NOTICE '  • Informe parcial Juan Pérez pendiente de revisión del asesor';
    RAISE NOTICE '  • Pago rechazado Valeria Mendoza — requiere gestión Secretaria';
    RAISE NOTICE '';
    RAISE NOTICE '── DOMINGO 10/05 (MAÑANA) ──────────────────────────────';
    RAISE NOTICE '  • Oferta Redes GlobalTech cierra mañana (Diego Ríos postulado)';
    RAISE NOTICE '  • Entregable 4 tesis Diego "Tesis Final" vence mañana (ya enviado, revisando)';
    RAISE NOTICE '  • Pago matrícula María López vence mañana (S/.350 pendiente)';
    RAISE NOTICE '';
    RAISE NOTICE '── LUNES 11/05 (PASADO MAÑANA) ─────────────────────────';
    RAISE NOTICE '  • SUSTENTACIÓN de tesis de Diego Ríos — 09:00 am, Sala de Grados';
    RAISE NOTICE '  • Entregable tesis Sofía "Implementación y Pruebas" vence este día';
    RAISE NOTICE '  • Oferta UX/UI NexusDigital cierra este día';
    RAISE NOTICE '  • Pago constancia Diego Ríos vence este día (S/.20 pendiente)';
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '🔐 CREDENCIALES (contraseña: 123456)';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '';
    RAISE NOTICE '  [ADMINISTRADOR]';
    RAISE NOTICE '  admin@unt.edu.pe';
    RAISE NOTICE '';
    RAISE NOTICE '  [COORDINADORES]';
    RAISE NOTICE '  coordinador.fi@unt.edu.pe   → Rosa Vargas (FI)  — tiene alertas urgentes HOY';
    RAISE NOTICE '  coordinador.fct@unt.edu.pe  → Luis Torres (FCT)';
    RAISE NOTICE '  coordinador.feh@unt.edu.pe  → Ana Ramos (FEH)';
    RAISE NOTICE '  coordinador.is@unt.edu.pe   → Miguel Flores (IS) — propuesta Andrés pendiente';
    RAISE NOTICE '  coordinador.cc@unt.edu.pe   → Patricia León (CC)';
    RAISE NOTICE '';
    RAISE NOTICE '  [ASESORES]';
    RAISE NOTICE '  jorge.chavez@unt.edu.pe    → Jorge Chávez  — revisar informe+horas Juan HOY';
    RAISE NOTICE '  carmen.diaz@unt.edu.pe     → Carmen Díaz   — horas de Gabriela pendientes';
    RAISE NOTICE '  roberto.silva@unt.edu.pe   → Roberto Silva';
    RAISE NOTICE '  lucia.paredes@unt.edu.pe   → Lucía Paredes — horas de Fernando pendientes';
    RAISE NOTICE '  hector.moya@unt.edu.pe     → Héctor Moya   — aprobar tesis Diego (sust.11/05)';
    RAISE NOTICE '';
    RAISE NOTICE '  [ESTUDIANTES]';
    RAISE NOTICE '  202310001@estudiante.unt.edu.pe → Juan Pérez    (práctica activa + tesis en registro)';
    RAISE NOTICE '  202310002@estudiante.unt.edu.pe → María López   (postulada hoy — oferta cierra hoy)';
    RAISE NOTICE '  202310003@estudiante.unt.edu.pe → Carlos Rodríg.(preseleccionado — espera decisión)';
    RAISE NOTICE '  202110004@estudiante.unt.edu.pe → Sofía Gutié.  (práctica finalizada + tesis activa)';
    RAISE NOTICE '  202210005@estudiante.unt.edu.pe → Andrés Morales(práctica finalizada + tesis propuesta)';
    RAISE NOTICE '  202210006@estudiante.unt.edu.pe → Gabriela Herr.(práctica activa UX)';
    RAISE NOTICE '  202110007@estudiante.unt.edu.pe → Diego Ríos    (práctica finaliz.+sustentación 11/05)';
    RAISE NOTICE '  202310008@estudiante.unt.edu.pe → Valeria Mendoza(postulación rechazada — pago rechaz.)';
    RAISE NOTICE '  202210009@estudiante.unt.edu.pe → Fernando Soto (práctica activa Redes)';
    RAISE NOTICE '  202110010@estudiante.unt.edu.pe → Camila Fuentes(tesis culminada — caso de éxito)';
    RAISE NOTICE '';
    RAISE NOTICE '  [REPRESENTANTES DE EMPRESA]';
    RAISE NOTICE '  rep.techcorp@techcorp.pe       → Ricardo Castañeda (TechCorp)   — oferta cierra HOY';
    RAISE NOTICE '  rep.innovate@innovateperu.pe   → Stephanie Quispe  (InnovatePeru)— convenio vencido';
    RAISE NOTICE '  rep.datasolutions@datasol.pe   → Martín Espinoza   (DataSol)';
    RAISE NOTICE '  rep.globaltech@globaltech.pe   → Sandra Villanueva (GlobalTech)  — oferta cierra mañana';
    RAISE NOTICE '  rep.nexus@nexusdigital.pe      → Álvaro Cueva      (NexusDigital)— horas pendientes';
    RAISE NOTICE '';
    RAISE NOTICE '  [SECRETARIA]';
    RAISE NOTICE '  secretaria@unt.edu.pe  → María Elena Sánchez — 3 pagos urgentes + 1 pago rechazado';
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;
