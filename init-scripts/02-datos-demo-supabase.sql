-- =====================================================
-- DATOS DE DEMO — UNT Prácticas y Tesis
-- Versión Supabase — Actualizado: 10 y 11 de Mayo 2026
-- (Domingo 10/05 = HOY  |  Lunes 11/05 = MAÑANA)
-- =====================================================
-- PREREQUISITO: ejecutar primero 01-schema-supabase.sql
-- =====================================================
-- CAMBIOS RESPECTO AL ORIGINAL:
--   • Eliminados comandos \c  (no aplica en SQL Editor de Supabase)
--   • Eliminado COMMIT final  (auto-commit en Supabase)
--   • Secuencias reseteadas con setval() para garantizar IDs exactos
--     cuando se insertan IDs fijos con TRUNCATE/INSERT
--   • Fechas "hoy" movidas a 2026-05-10 (domingo) y
--     "mañana" a 2026-05-11 (lunes)
--   • Seguimiento de horas: semana 04-10 may (hoy=domingo → registro HOY)
--   • Notificaciones actualizadas a fechas del 10 y 11 may
--   • Nueva postulación de María llega HOY domingo 10/05
--   • Oferta Frontend (id=3) cierra HOY 10/05 (era 09/05)
--   • Oferta Redes    (id=4) cierra MAÑANA 11/05 (era 10/05)
--   • Oferta UX/UI    (id=5) cierra PASADO 12/05 (era 11/05)
--   • Sustentación Diego movida a MAÑANA 11/05 (se mantiene lunes)
--   • Pago vencimiento Juan: HOY 10/05
--   • Pago vencimiento María: MAÑANA 11/05
-- =====================================================

SET client_encoding = 'UTF8';

-- =====================================================
-- 1. ROLES  (TRUNCATE cascada limpia todo, luego reinsertamos)
-- =====================================================
TRUNCATE TABLE rol CASCADE;

-- Resetear secuencia para garantizar IDs 1-6
SELECT setval('rol_id_seq', 1, false);

INSERT INTO rol (id, nombre, descripcion, activo, creado_en) VALUES
(1, 'Administrador',        'Administrador del sistema con acceso total',    true, CURRENT_TIMESTAMP),
(2, 'Coordinador',          'Coordinador de facultad o escuela',             true, CURRENT_TIMESTAMP),
(3, 'Asesor',               'Asesor de practicas o tesis',                   true, CURRENT_TIMESTAMP),
(4, 'Estudiante',           'Estudiante del sistema',                        true, CURRENT_TIMESTAMP),
(5, 'RepresentanteEmpresa', 'Representante de empresa convenio',             true, CURRENT_TIMESTAMP),
(6, 'Secretaria',           'Secretaria - Gestiona pagos y tramites',        true, CURRENT_TIMESTAMP);

-- Ajustar secuencia al máximo insertado
SELECT setval('rol_id_seq', 6);

-- =====================================================
-- 2. FACULTADES
-- =====================================================
INSERT INTO facultad (nombre, codigo, descripcion, activo, creado_en) VALUES
('Facultad de Ingenieria',              'FI',  'Facultad de Ingenieria de la UNT',              true, CURRENT_TIMESTAMP),
('Facultad de Ciencias y Tecnologia',   'FCT', 'Facultad de Ciencias y Tecnologia de la UNT',   true, CURRENT_TIMESTAMP),
('Facultad de Educacion y Humanidades', 'FEH', 'Facultad de Educacion y Humanidades de la UNT', true, CURRENT_TIMESTAMP);

-- =====================================================
-- 3. CARRERAS
-- =====================================================
INSERT INTO carrera (facultad_id, nombre, codigo, descripcion, activo, creado_en) VALUES
(1, 'Ingenieria de Sistemas',     'IS',  'Carrera de Ingenieria de Sistemas Computacionales', true, CURRENT_TIMESTAMP),
(1, 'Ingenieria Civil',           'IC',  'Carrera de Ingenieria Civil',                       true, CURRENT_TIMESTAMP),
(1, 'Ingenieria Electronica',     'IE',  'Carrera de Ingenieria Electronica',                 true, CURRENT_TIMESTAMP),
(2, 'Ciencias de la Computacion', 'CC',  'Carrera de Ciencias de la Computacion',             true, CURRENT_TIMESTAMP),
(2, 'Estadistica',                'EST', 'Carrera de Estadistica',                            true, CURRENT_TIMESTAMP),
(3, 'Educacion Primaria',         'EP',  'Carrera de Educacion Primaria',                     true, CURRENT_TIMESTAMP),
(3, 'Educacion Inicial',          'EI',  'Carrera de Educacion Inicial',                      true, CURRENT_TIMESTAMP);

-- =====================================================
-- 4. USUARIOS  (contraseña: "123456")
-- Hash bcrypt: $2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui
-- IDs esperados: 1=Admin, 2-6=Coords, 7-11=Asesores,
--                12-21=Estudiantes, 22-26=Reps, 27=Secretaria
-- =====================================================
INSERT INTO usuario (email, email_recuperacion, contrasena_hash,
    nombre, apellido_paterno, apellido_materno,
    activo, creado_en, actualizado_en) VALUES
-- Administrador (id=1)
('admin@unt.edu.pe', 'admin.personal@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Administrador','Sistema','UNT', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Coordinadores (id=2..6)
('coordinador.fi@unt.edu.pe',  'rosa.vargas.personal@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Rosa','Vargas','Mendoza', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('coordinador.fct@unt.edu.pe', 'luis.torres.personal@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Luis','Torres','Quispe', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('coordinador.feh@unt.edu.pe', 'ana.ramos.personal@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Ana','Ramos','Salinas', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('coordinador.is@unt.edu.pe',  'miguel.flores.personal@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Miguel','Flores','Castillo', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('coordinador.cc@unt.edu.pe',  'patricia.leon.personal@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Patricia','Leon','Reyes', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Asesores (id=7..11)
('jorge.chavez@unt.edu.pe',    'jorge.chavez.personal@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Jorge','Chavez','Herrera', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('carmen.diaz@unt.edu.pe',     'carmen.diaz.personal@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Carmen','Diaz','Morales', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('roberto.silva@unt.edu.pe',   'roberto.silva.personal@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Roberto','Silva','Gutierrez', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('lucia.paredes@unt.edu.pe',   'lucia.paredes.personal@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Lucia','Paredes','Vega', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('hector.moya@unt.edu.pe',     'hector.moya.personal@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Hector','Moya','Ramirez', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Estudiantes (id=12..21)
('202310001@estudiante.unt.edu.pe', 'juan.perez.recovery@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Juan','Perez','Garcia', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('202310002@estudiante.unt.edu.pe', 'maria.lopez.recovery@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Maria','Lopez','Martinez', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('202310003@estudiante.unt.edu.pe', 'carlos.rodriguez.recovery@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Carlos','Rodriguez','Sanchez', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('202110004@estudiante.unt.edu.pe', 'sofia.gutierrez.recovery@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Sofia','Gutierrez','Nunez', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('202210005@estudiante.unt.edu.pe', 'andres.morales.recovery@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Andres','Morales','Torres', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('202210006@estudiante.unt.edu.pe', 'gabriela.herrera.recovery@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Gabriela','Herrera','Castro', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('202110007@estudiante.unt.edu.pe', 'diego.rios.recovery@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Diego','Rios','Vasquez', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('202310008@estudiante.unt.edu.pe', 'valeria.mendoza.recovery@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Valeria','Mendoza','Chavez', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('202210009@estudiante.unt.edu.pe', 'fernando.soto.recovery@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Fernando','Soto','Alva', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('202110010@estudiante.unt.edu.pe', 'camila.fuentes.recovery@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Camila','Fuentes','Pariona', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Representantes empresa (id=22..26)
('rep.techcorp@techcorp.pe',    'rep.techcorp.personal@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Ricardo','Castaneda','Lara', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('rep.innovate@innovateperu.pe', 'rep.innovate.personal@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Stephanie','Quispe','Neyra', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('rep.datasolutions@datasol.pe', 'rep.datasol.personal@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Martin','Espinoza','Cardenas', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('rep.globaltech@globaltech.pe', 'rep.globaltech.personal@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Sandra','Villanueva','Pinto', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('rep.nexus@nexusdigital.pe',    'rep.nexus.personal@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Alvaro','Cueva','Medina', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Secretaria (id=27)
('secretaria@unt.edu.pe', 'secretaria.personal@gmail.com',
 '$2b$10$ff.AswGfT/py41ydCvcijOBskqa7M/1yQYXfW6ZGlCeqN87ITf0Ui',
 'Maria Elena','Sanchez','Vargas', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- =====================================================
-- 5. ASIGNACIÓN DE ROLES
-- =====================================================
INSERT INTO usuario_rol (usuario_id, rol_id) VALUES
(1,  1),                                              -- Admin
(2,  2),(3,  2),(4,  2),(5,  2),(6,  2),             -- Coordinadores
(7,  3),(8,  3),(9,  3),(10, 3),(11, 3),             -- Asesores
(12, 4),(13, 4),(14, 4),(15, 4),(16, 4),             -- Estudiantes
(17, 4),(18, 4),(19, 4),(20, 4),(21, 4),
(22, 5),(23, 5),(24, 5),(25, 5),(26, 5),             -- Representantes
(27, 6);                                              -- Secretaria

-- =====================================================
-- 6. DOCENTES  (carrera_id: 1=IS 2=IC 3=IE 4=CC 5=EST 6=EP 7=EI)
-- =====================================================
INSERT INTO docente (usuario_id, carrera_id, especialidad, categoria, dedicacion, oficina, telefono) VALUES
-- Coordinadores → docente.id 1..5
(2,  1, 'Sistemas de Informacion',       'Principal', 'Tiempo Completo', 'OF-101', '044-201001'),
(3,  4, 'Inteligencia Artificial',       'Asociado',  'Tiempo Completo', 'OF-205', '044-201002'),
(4,  6, 'Gestion Educativa',             'Asociado',  'Tiempo Completo', 'OF-310', '044-201003'),
(5,  1, 'Ingenieria de Software',        'Principal', 'Tiempo Completo', 'OF-102', '044-201004'),
(6,  4, 'Bases de Datos',                'Asociado',  'Tiempo Completo', 'OF-206', '044-201005'),
-- Asesores → docente.id 6..10
(7,  1, 'Desarrollo Web y Movil',        'Asistente', 'Tiempo Completo', 'OF-110', '044-201011'),
(8,  4, 'Ciencia de Datos',              'Asociado',  'Medio Tiempo',    'OF-211', '044-201012'),
(9,  2, 'Estructuras y Construccion',    'Asistente', 'Tiempo Completo', 'OF-320', '044-201013'),
(10, 1, 'Redes y Seguridad Informatica', 'Auxiliar',  'Tiempo Completo', 'OF-111', '044-201014'),
(11, 3, 'Electronica de Potencia',       'Asistente', 'Medio Tiempo',    'OF-405', '044-201015');

-- =====================================================
-- 7. ESTUDIANTES
-- =====================================================
INSERT INTO estudiante (usuario_id, codigo_universitario, carrera_id, escuela_profesional,
    anio_ingreso, creditos_aprobados, promedio_general, activo) VALUES
(12, '202310001', 1, 'Ingenieria de Sistemas',     2023,  60, 15.50, true),
(13, '202310002', 4, 'Ciencias de la Computacion', 2023,  55, 14.80, true),
(14, '202310003', 1, 'Ingenieria de Sistemas',     2023,  62, 16.20, true),
(15, '202110004', 1, 'Ingenieria de Sistemas',     2021, 180, 17.10, true),
(16, '202210005', 4, 'Ciencias de la Computacion', 2022, 130, 15.90, true),
(17, '202210006', 2, 'Ingenieria Civil',            2022, 125, 14.30, true),
(18, '202110007', 1, 'Ingenieria de Sistemas',     2021, 185, 16.80, true),
(19, '202310008', 4, 'Ciencias de la Computacion', 2023,  58, 13.50, true),
(20, '202210009', 3, 'Ingenieria Electronica',      2022, 120, 15.20, true),
(21, '202110010', 1, 'Ingenieria de Sistemas',     2021, 188, 18.00, true);

-- =====================================================
-- 8. EMPRESAS
-- =====================================================
INSERT INTO empresa (ruc, razon_social, nombre_comercial, direccion, telefono, email_contacto, activo, creado_en) VALUES
('20123456781', 'TechCorp Peru S.A.C.',        'TechCorp',    'Av. Larco 1234, Trujillo',       '044-301001', 'contacto@techcorp.pe',     true, CURRENT_TIMESTAMP),
('20123456782', 'Innovate Peru S.R.L.',         'InnovatePeru','Jr. Pizarro 456, Trujillo',      '044-301002', 'contacto@innovateperu.pe', true, CURRENT_TIMESTAMP),
('20123456783', 'Data Solutions S.A.C.',        'DataSol',     'Av. Espana 789, Trujillo',       '044-301003', 'contacto@datasol.pe',      true, CURRENT_TIMESTAMP),
('20123456784', 'Global Tech S.A.',             'GlobalTech',  'Av. Mansiche 321, Trujillo',     '044-301004', 'contacto@globaltech.pe',   true, CURRENT_TIMESTAMP),
('20123456785', 'Nexus Digital Peru E.I.R.L.',  'NexusDigital','Calle Las Flores 654, Trujillo', '044-301005', 'contacto@nexusdigital.pe', true, CURRENT_TIMESTAMP);

-- =====================================================
-- 9. REPRESENTANTES DE EMPRESA
-- =====================================================
INSERT INTO representante_empresa (empresa_id, usuario_id, cargo, departamento, telefono_directo, es_principal) VALUES
(1, 22, 'Gerente de RRHH',          'Recursos Humanos',   '044-301101', true),
(2, 23, 'Coordinadora de Practicas','Gestion del Talento','044-301102', true),
(3, 24, 'Jefe de Operaciones',       'Operaciones',        '044-301103', true),
(4, 25, 'Directora Comercial',       'Comercial',          '044-301104', true),
(5, 26, 'CEO / Fundador',            'Direccion',          '044-301105', true);

-- =====================================================
-- 10. CONVENIOS
-- =====================================================
INSERT INTO convenio (empresa_id, tipo, numero_convenio, fecha_inicio, fecha_vencimiento,
    estado, objeto, condiciones, renovable, creado_en) VALUES
(1, 'marco',     'CONV-UNT-2023-001', '2023-03-01', '2027-03-01', 'vigente',
 'Convenio marco para practicas pre-profesionales en desarrollo de software.',
 'Minimo 4 horas diarias. Supervisor designado por la empresa.', true, CURRENT_TIMESTAMP),

(2, 'marco',     'CONV-UNT-2023-002', '2023-06-15', '2025-06-15', 'vencido',
 'Convenio marco para practicas en innovacion y transformacion digital.',
 'Minimo 6 horas diarias. Informe mensual obligatorio.', true, CURRENT_TIMESTAMP),

(3, 'especifico','CONV-UNT-2024-003', '2024-01-10', '2026-12-31', 'vigente',
 'Convenio especifico para practicas en ciencia de datos e inteligencia artificial.',
 'Modalidad hibrida. Remuneracion minima S/. 800.', false, CURRENT_TIMESTAMP),

(4, 'marco',     'CONV-UNT-2024-004', '2024-04-01', '2027-04-01', 'vigente',
 'Convenio marco para practicas en ingenieria de sistemas y redes.',
 'Presencial. Seguro ESSALUD cubierto por empresa.', true, CURRENT_TIMESTAMP),

(5, 'especifico','CONV-UNT-2025-005', '2025-01-20', '2026-12-31', 'vigente',
 'Convenio especifico para practicas en diseno UX/UI y desarrollo frontend.',
 '100% remoto. Horario flexible.', false, CURRENT_TIMESTAMP);

-- =====================================================
-- 11. OFERTAS DE PRÁCTICA
-- =====================================================
-- FECHAS ANCLADAS A HOY = 2026-05-10 (domingo)
--
--  oferta 1 → CERRADA  (histórico 2025)
--  oferta 2 → CERRADA  (histórico 2025)
--  oferta 3 → PUBLICADA, postulacion cierra HOY     10-may-2026  ← accion urgente
--  oferta 4 → PUBLICADA, postulacion cierra MAÑANA  11-may-2026
--  oferta 5 → PUBLICADA, postulacion cierra PASADO  12-may-2026
--  oferta 6 → BORRADOR   (para publicar en demo)
-- =====================================================
INSERT INTO oferta_practica (empresa_id, convenio_id, titulo, descripcion, requisitos,
    fecha_inicio_postulacion, fecha_fin_postulacion,
    fecha_inicio_practica,   fecha_fin_practica,
    cupos, estado, creado_en) VALUES

-- oferta 1: cerrada (histórico 2025)
(1, 1,
 'Practicante en Desarrollo Backend Node.js',
 'Desarrollaras APIs REST usando Node.js y Express. Equipo agil bajo Scrum.',
 'Conocimientos en JavaScript, Node.js basico, SQL. Promedio minimo 14.',
 '2025-03-01','2025-03-31','2025-04-15','2025-10-15',
 3, 'cerrada','2025-02-28'),

-- oferta 2: cerrada (histórico 2025)
(3, 3,
 'Practicante en Ciencia de Datos',
 'Analizaras datasets reales con Python, pandas y Power BI.',
 'Conocimientos en Python y estadistica basica. Promedio minimo 15.',
 '2025-06-01','2025-06-30','2025-07-15','2026-01-15',
 2, 'cerrada','2025-05-30'),

-- oferta 3: publicada — VENCE HOY 10-may-2026
(1, 1,
 'Practicante en Desarrollo Frontend React',
 'Construiras interfaces modernas con React 18 y TailwindCSS integrando APIs REST. '
 'Trabajaras en el equipo de producto junto a disenadores UX y desarrolladores backend.',
 'Conocimientos en HTML, CSS, JavaScript, React basico. Promedio minimo 14.',
 '2026-04-20','2026-05-10','2026-06-01','2026-11-30',
 4, 'publicada','2026-04-18'),

-- oferta 4: publicada — VENCE MAÑANA 11-may-2026
(4, 4,
 'Practicante en Administracion de Redes y Seguridad',
 'Configuracion y monitoreo de infraestructura de red. Apoyo en ethical hacking basico.',
 'Conocimientos en redes TCP/IP, Linux basico. Promedio minimo 14.',
 '2026-04-25','2026-05-11','2026-06-10','2026-12-10',
 2, 'publicada','2026-04-23'),

-- oferta 5: publicada — VENCE PASADO MAÑANA 12-may-2026
(5, 5,
 'Practicante en Diseno UX/UI',
 'Disenara wireframes y prototipos interactivos. Pruebas de usabilidad con usuarios reales. Trabajo 100% remoto.',
 'Conocimientos en Figma o Adobe XD. Portafolio deseable. Promedio minimo 13.',
 '2026-04-28','2026-05-12','2026-06-15','2026-12-15',
 2, 'publicada','2026-04-25'),

-- oferta 6: borrador (para completar y publicar durante demo)
(2, NULL,
 'Practicante en Marketing Digital',
 'Apoyo en campanas de redes sociales y email marketing.',
 'Conocimientos basicos en marketing. Promedio minimo 13.',
 '2026-05-20','2026-06-15','2026-07-01','2026-12-31',
 3, 'borrador','2026-05-09');

-- =====================================================
-- 12. POSTULACIONES
-- =====================================================
-- estudiante.id (fila en tabla estudiante):
--   1=Juan(IS) 2=Maria(CC) 3=Carlos(IS) 4=Sofia(IS) 5=Andres(CC)
--   6=Gabriela(IC) 7=Diego(IS) 8=Valeria(CC) 9=Fernando(IE) 10=Camila(IS)
INSERT INTO postulacion (oferta_id, estudiante_id, cv_url, carta_presentacion,
    estado, fecha_postulacion, fecha_revision, revisado_por) VALUES

-- Oferta 1 (Backend, CERRADA — 2025)
(1, 4, 'https://docs.unt.edu.pe/cv/sofia_gutierrez.pdf',
 'Tengo experiencia en proyectos universitarios con Node.js y me interesa crecer en backend.',
 'aprobado','2025-03-10','2025-04-01',22),

(1, 7, 'https://docs.unt.edu.pe/cv/diego_rios.pdf',
 'Desarrolle una API REST en mi proyecto de curso. Quiero aplicar mis habilidades.',
 'aprobado','2025-03-12','2025-04-01',22),

(1, 10, 'https://docs.unt.edu.pe/cv/camila_fuentes.pdf',
 'Cuento con solidos conocimientos en JavaScript y Express. Soy proactiva.',
 'rechazado','2025-03-20','2025-04-01',22),

-- Oferta 2 (DataSol, CERRADA — 2025)
(2, 5, 'https://docs.unt.edu.pe/cv/andres_morales.pdf',
 'He trabajado con pandas y matplotlib en cursos de estadistica.',
 'aprobado','2025-06-10','2025-07-01',24),

(2, 8, 'https://docs.unt.edu.pe/cv/valeria_mendoza.pdf',
 'Cuento con proyectos de machine learning basico en Python.',
 'rechazado','2025-06-15','2025-07-01',24),

-- Oferta 3 (Frontend, VENCE HOY 10-may-2026)
-- Juan aprobado → tiene practica activa
(3, 1, 'https://docs.unt.edu.pe/cv/juan_perez.pdf',
 'He desarrollado aplicaciones con React en mis proyectos de facultad.',
 'aprobado','2026-04-22','2026-04-30',22),

-- Carlos preseleccionado → Rep. define cupo hoy
(3, 3, 'https://docs.unt.edu.pe/cv/carlos_rodriguez.pdf',
 'Cuento con un proyecto de React con hooks y Context API. Quiero seguir creciendo.',
 'preseleccionado','2026-04-24','2026-05-05',22),

-- Maria postulada HOY (domingo 10/05) → accion urgente para Rep.
(3, 2, 'https://docs.unt.edu.pe/cv/maria_lopez.pdf',
 'Tengo bases solidas en JavaScript y React. Mi promedio refleja mi compromiso.',
 'postulado','2026-05-10',NULL,NULL),

-- Oferta 4 (Redes, VENCE MAÑANA 11-may-2026)
-- Fernando aprobado → practica activa
(4, 9, 'https://docs.unt.edu.pe/cv/fernando_soto.pdf',
 'He cursado redes de computadoras y configurado routers en laboratorio.',
 'aprobado','2026-04-27','2026-05-06',25),

-- Diego postulado hoy (domingo) → Rep. GlobalTech revisa mañana antes del cierre
(4, 7, 'https://docs.unt.edu.pe/cv/diego_rios2.pdf',
 'Tengo conocimientos en Linux y redes basicas. Me gustaria especializarme en ciberseguridad.',
 'postulado','2026-05-10',NULL,NULL),

-- Oferta 5 (UX/UI, VENCE 12-may-2026)
-- Gabriela aprobada → practica activa
(5, 6, 'https://docs.unt.edu.pe/cv/gabriela_herrera.pdf',
 'He disenado prototipos en Figma para proyectos de clase.',
 'aprobado','2026-04-30','2026-05-07',26);

-- =====================================================
-- 13. PRÁCTICAS
-- =====================================================
-- asesor_academico_id = usuario_id del docente
--   7=Jorge(IS) 8=Carmen(CC) 9=Roberto(IC) 10=Lucia(IS/redes) 11=Hector(IE)
INSERT INTO practica (postulacion_id, estudiante_id, empresa_id,
    asesor_empresa_nombre, cargo_supervisor, email_supervisor, telefono_supervisor,
    fecha_inicio, fecha_fin, horas_semanales, estado,
    asesor_academico_id, calificacion_final, observaciones_finales, creado_en) VALUES

-- practica 1: FINALIZADA — Sofia (postulacion 1, Backend TechCorp 2025)
(1, 4, 1, 'Ing. Roberto Paredes','Tech Lead','r.paredes@techcorp.pe','044-301201',
 '2025-04-15','2025-10-15', 30, 'finalizada', 7, 17.50,
 'Excelente desempeno. Entrego todos los modulos a tiempo y con calidad profesional.',
 '2025-04-14'),

-- practica 2: FINALIZADA — Diego (postulacion 2, Backend TechCorp 2025)
(2, 7, 1, 'Ing. Roberto Paredes','Tech Lead','r.paredes@techcorp.pe','044-301201',
 '2025-04-15','2025-10-15', 30, 'finalizada', 7, 16.00,
 'Buen desempeno general. Requirio orientacion en las primeras semanas.',
 '2025-04-14'),

-- practica 3: FINALIZADA — Andres (postulacion 4, DataSol 2025)
(4, 5, 3, 'Lic. Paola Chavez','Data Analyst Senior','p.chavez@datasol.pe','044-301301',
 '2025-07-15','2026-01-15', 24, 'finalizada', 8, 18.00,
 'Destacado. Desarrollo un dashboard de ventas adoptado por el equipo.',
 '2025-07-14'),

-- practica 4: ACTIVA — Juan (postulacion 6, Frontend TechCorp)
--   inicio: 2026-03-02 → ~10 semanas activo
(6, 1, 1, 'Ing. Karla Mendoza','Frontend Lead','k.mendoza@techcorp.pe','044-301202',
 '2026-03-02', NULL, 30, 'activa', 7, NULL, NULL,
 '2026-02-28'),

-- practica 5: ACTIVA — Fernando (postulacion 9, Redes GlobalTech)
(9, 9, 4, 'Ing. Cesar Rojas','Infraestructura Senior','c.rojas@globaltech.pe','044-301401',
 '2026-03-09', NULL, 28, 'activa', 10, NULL, NULL,
 '2026-03-07'),

-- practica 6: ACTIVA — Gabriela (postulacion 11, UX NexusDigital)
(11, 6, 5, 'Dis. Laura Vega','UX Lead','l.vega@nexusdigital.pe','044-301501',
 '2026-03-16', NULL, 24, 'activa', 8, NULL, NULL,
 '2026-03-14');

-- =====================================================
-- 14. SEGUIMIENTO DE HORAS (semana 04–10 may 2026)
-- =====================================================
-- LÓGICA DEL DEMO:
--   Lun-Mié (04-06): aprobados empresa Y asesor → historial limpio
--   Jue (07):         empresa OK, asesor PENDIENTE → asesor aprueba hoy
--   Vie (08):         PENDIENTE empresa y asesor   → accion Rep. + Asesor
--   Sáb (09):         PENDIENTE empresa y asesor   → accion pendiente
--   Dom (10/HOY):     recién registrado, sin aprobaciones → urgente

-- practica 4 = Juan (activa, Frontend TechCorp, asesor=Jorge usuario_id=7)
INSERT INTO seguimiento_horas (practica_id, fecha_trabajada, horas,
    descripcion_actividad, aprobado_empresa, aprobado_asesor) VALUES
(4,'2026-05-04',6,'Implementacion del modulo de perfil de usuario con carga de avatar.',                    true, true),
(4,'2026-05-05',6,'Integracion de libreria de graficos Recharts en el dashboard de estadisticas.',         true, true),
(4,'2026-05-06',6,'Correccion de bugs reportados en la revision de sprint. Merge de 3 PRs.',              true, true),
(4,'2026-05-07',6,'Desarrollo de componente de tabla con exportacion a CSV.',                             true, false),   -- asesor pendiente
(4,'2026-05-08',6,'Reunion de planificacion sprint 6 y estimacion de tickets con el equipo.',             false,false),   -- ambos pendientes
(4,'2026-05-09',6,'Inicio de modulo de notificaciones push con WebSockets. Configuracion inicial.',       false,false),   -- sábado pendiente
(4,'2026-05-10',6,'Revision de diseno responsivo en móvil y correccion de estilos Tailwind. (HOY DOM)',   false,false);   -- HOY domingo

-- practica 5 = Fernando (activa, Redes GlobalTech, asesor=Lucia usuario_id=10)
INSERT INTO seguimiento_horas (practica_id, fecha_trabajada, horas,
    descripcion_actividad, aprobado_empresa, aprobado_asesor) VALUES
(5,'2026-05-04',7,'Monitoreo de rendimiento de red con Grafana y alertas automatizadas.',                  true, true),
(5,'2026-05-05',7,'Configuracion de firewall pfSense para segmentacion de redes internas.',                true, true),
(5,'2026-05-06',7,'Elaboracion del reporte semanal de incidencias y disponibilidad del servicio.',         true, true),
(5,'2026-05-07',7,'Escaneo de vulnerabilidades con Nessus en servidores de produccion.',                   true, false),
(5,'2026-05-08',7,'Apoyo en la migracion de servidores al nuevo rack del datacenter.',                    false,false),
(5,'2026-05-09',7,'Documentacion de la topologia de red actualizada tras la migracion.',                  false,false),
(5,'2026-05-10',7,'Verificacion de conectividad post-migracion y pruebas de failover. (HOY DOM)',         false,false);

-- practica 6 = Gabriela (activa, UX NexusDigital, asesor=Carmen usuario_id=8)
INSERT INTO seguimiento_horas (practica_id, fecha_trabajada, horas,
    descripcion_actividad, aprobado_empresa, aprobado_asesor) VALUES
(6,'2026-05-04',6,'Diseno de pantallas de onboarding para la aplicacion movil (6 pantallas).',            true, true),
(6,'2026-05-05',6,'Revision de heuristicas de usabilidad sobre los flujos de pago existentes.',            true, true),
(6,'2026-05-06',6,'Prototipado interactivo en Figma del flujo de checkout redisenado.',                    true, true),
(6,'2026-05-07',6,'Sesion de pruebas con 4 usuarios reales y registro de hallazgos.',                     true, false),
(6,'2026-05-08',6,'Analisis de resultados de pruebas de usabilidad y propuesta de mejoras.',              false,false),
(6,'2026-05-09',6,'Presentacion interna de mejoras al equipo de producto.',                               false,false),
(6,'2026-05-10',6,'Iteracion de prototipos de alta fidelidad post-feedback del equipo. (HOY DOM)',        false,false);

-- =====================================================
-- 15. INFORMES DE PRÁCTICA
-- =====================================================
INSERT INTO informe_practica (practica_id, tipo, titulo, contenido_resumen,
    documento_url, fecha_entrega, estado, comentario_asesor) VALUES

-- Sofia (practica 1, finalizada)
(1,'parcial','Informe Parcial - Desarrollo Backend TechCorp',
 'Durante los primeros 3 meses implemente 5 endpoints REST para el modulo de usuarios y autenticacion con JWT.',
 'https://docs.unt.edu.pe/informes/sofia_parcial.pdf',
 '2025-07-15','aprobado',
 'Excelente avance. Demuestra dominio tecnico solido.'),

(1,'final','Informe Final - Desarrollo Backend TechCorp',
 'Concluí el desarrollo del modulo de gestion de pedidos con integracion a pasarela de pagos en produccion.',
 'https://docs.unt.edu.pe/informes/sofia_final.pdf',
 '2025-10-10','aprobado',
 'Trabajo sobresaliente. El sistema implementado tiene impacto real. Felicitaciones.'),

-- Diego (practica 2, finalizada)
(2,'parcial','Informe Parcial - Desarrollo Backend TechCorp',
 'Implemente el modulo de catalogo de productos con CRUD completo y filtros de busqueda.',
 'https://docs.unt.edu.pe/informes/diego_parcial.pdf',
 '2025-07-15','observado',
 'Informe aceptable pero le falta detalle tecnico. Reenviar con seccion de arquitectura.'),

(2,'final','Informe Final - Desarrollo Backend TechCorp',
 'Finalice el modulo de reportes con exportacion a PDF y Excel, incorporando observaciones del parcial.',
 'https://docs.unt.edu.pe/informes/diego_final.pdf',
 '2025-10-12','aprobado',
 'Buen informe final. Notoria mejora respecto al parcial.'),

-- Andres (practica 3, finalizada)
(3,'parcial','Informe Parcial - Ciencia de Datos DataSol',
 'Realice limpieza y analisis exploratorio de 3 datasets de ventas con matplotlib y seaborn.',
 'https://docs.unt.edu.pe/informes/andres_parcial.pdf',
 '2025-10-01','aprobado',
 'Excelente trabajo de analisis. Las visualizaciones son claras y el analisis estadistico es correcto.'),

(3,'final','Informe Final - Ciencia de Datos DataSol',
 'Construi un dashboard interactivo con Power BI que integra 5 fuentes de datos con actualizacion horaria.',
 'https://docs.unt.edu.pe/informes/andres_final.pdf',
 '2026-01-10','aprobado',
 'Trabajo excepcional. El dashboard ya es usado por el equipo directivo. Calificacion maxima.'),

-- Juan (practica 4 activa) — informe parcial entregado AYER (09/05), PENDIENTE de revision
--   Asesor Jorge debe revisar HOY domingo
(4,'parcial','Informe Parcial - Desarrollo Frontend TechCorp',
 'En los primeros 2 meses implemente el sistema de autenticacion, dashboard principal y modulo de usuarios con React 18.',
 'https://docs.unt.edu.pe/informes/juan_parcial.pdf',
 '2026-05-09','pendiente',
 NULL);

-- =====================================================
-- 16. EVALUACIONES FINALES DE PRÁCTICA
-- =====================================================
INSERT INTO evaluacion_final_practica (practica_id, calificacion_empresa,
    calificacion_asesor, retroalimentacion, fecha_evaluacion, apto) VALUES
(1, 18, 17,
 'Practicante sobresaliente. Tomo iniciativa y entrego con calidad. Recomendamos para contratacion.',
 '2025-10-16', true),
(2, 16, 16,
 'Buen desempeno con mejora progresiva. Alcanzo los objetivos satisfactoriamente.',
 '2025-10-16', true),
(3, 19, 17,
 'Rendimiento excepcional. El dashboard sigue en uso en produccion. Altamente recomendado.',
 '2026-01-16', true);

-- =====================================================
-- 17. PROYECTOS DE TESIS
-- =====================================================
-- aprobado_por = docente.id (Miguel Flores coord.IS → docente.id=4)
INSERT INTO proyecto_tesis (estudiante_id, titulo, resumen, area_conocimiento,
    palabras_clave, estado, fecha_registro, fecha_aprobacion, aprobado_por) VALUES

-- proyecto 1: aprobado (Sofia) → tesis activa con entregables urgentes
(4,
 'Sistema de Gestion de Practicas Pre-Profesionales con Seguimiento en Tiempo Real',
 'Plataforma web que automatiza registro, asignacion y seguimiento de practicas pre-profesionales con notificaciones en tiempo real.',
 'Ingenieria de Software',
 'practicas profesionales, seguimiento, notificaciones, Node.js, React',
 'aprobado','2025-11-01','2025-12-15',4),

-- proyecto 2: en desarrollo (Diego) → sustentacion MAÑANA 11-may
(7,
 'Implementacion de un Sistema de Deteccion de Intrusiones en Redes LAN usando Machine Learning',
 'Diseno e implementacion de un IDS basado en ML para detectar ataques en redes LAN universitarias con evaluacion en tiempo real.',
 'Redes y Seguridad',
 'IDS, machine learning, redes, ciberseguridad, anomalias',
 'en_desarrollo','2025-09-15','2025-11-01',4),

-- proyecto 3: propuesto (Andres) → Coordinador aprueba esta semana
(5,
 'Dashboard Predictivo de Rendimiento Academico usando Tecnicas de Mineria de Datos',
 'Aplicacion de mineria de datos y modelos predictivos para anticipar rendimiento academico y recomendar intervenciones oportunas.',
 'Ciencia de Datos',
 'mineria de datos, prediccion, rendimiento academico, python, scikit-learn',
 'propuesto','2026-04-20',NULL,NULL),

-- proyecto 4: en registro (Juan) → recien enviado
(1,
 'Arquitectura de Microservicios para Plataformas Educativas en la Nube',
 'Diseno e implementacion de arquitectura de microservicios escalable para plataformas educativas con patrones de resiliencia.',
 'Ingenieria de Software',
 'microservicios, cloud, Docker, Kubernetes, educacion',
 'en_registro','2026-05-07',NULL,NULL),

-- proyecto 5: culminado (Camila) → caso de exito completo
(10,
 'Evaluacion de Frameworks Frontend Modernos: React vs Vue vs Angular en Aplicaciones Empresariales',
 'Estudio comparativo evaluando rendimiento, mantenibilidad, curva de aprendizaje y ecosistema de los principales frameworks frontend.',
 'Ingenieria de Software',
 'React, Vue, Angular, frontend, rendimiento, comparativa',
 'culminado','2025-03-10','2025-05-01',4);

-- =====================================================
-- 18. TESIS
-- =====================================================
INSERT INTO tesis (proyecto_id, estudiante_id, titulo, resumen, area_conocimiento,
    estado, fecha_registro, fecha_aprobacion, fecha_sustentacion, nota_final, resultado_sustentacion) VALUES

-- tesis 1 (Sofia): aprobada, en desarrollo activo
(1, 4,
 'Sistema de Gestion de Practicas Pre-Profesionales con Seguimiento en Tiempo Real',
 'Plataforma web que automatiza registro, asignacion y seguimiento de practicas pre-profesionales.',
 'Ingenieria de Software',
 'aprobado','2025-11-01','2025-12-15', NULL, NULL, NULL),

-- tesis 2 (Diego): en revision — sustentacion MAÑANA 11-may-2026
(2, 7,
 'Implementacion de un Sistema de Deteccion de Intrusiones en Redes LAN usando Machine Learning',
 'Diseno e implementacion de un IDS basado en ML para redes LAN universitarias.',
 'Redes y Seguridad',
 'en_revision','2025-09-15','2025-11-01','2026-05-11', NULL, NULL),

-- tesis 3 (Camila): culminada con nota
(5, 10,
 'Evaluacion de Frameworks Frontend Modernos: React vs Vue vs Angular en Aplicaciones Empresariales',
 'Estudio comparativo de frameworks frontend evaluando rendimiento, mantenibilidad y ecosistema.',
 'Ingenieria de Software',
 'culminado','2025-03-10','2025-05-01','2025-11-15', 18.50, 'aprobado');

-- =====================================================
-- 19. ASIGNACIONES DE ASESOR A TESIS
-- =====================================================
-- docente.id: 1=Rosa(coord) 2=Luis(coord) 3=Ana(coord) 4=Miguel(coord) 5=Patricia(coord)
--             6=Jorge(asesor) 7=Carmen(asesor) 8=Roberto(asesor) 9=Lucia(asesor) 10=Hector(asesor)
INSERT INTO asesor_tesis (tesis_id, docente_id, tipo_asignacion, rol_jurado,
    fecha_asignacion, activo, observaciones) VALUES

-- Tesis 1 (Sofia): asesor + jurado
(1,  6, 'asesor',  NULL,         '2025-12-16', true, 'Asesor principal. Reuniones quincenales.'),
(1,  7, 'jurado',  'presidente', '2025-12-20', true, 'Presidira el jurado al termino del desarrollo.'),
(1,  4, 'jurado',  'secretario', '2025-12-20', true, NULL),
(1,  5, 'jurado',  'vocal',      '2025-12-20', true, NULL),

-- Tesis 2 (Diego): asesor + jurado — sustentacion MAÑANA 11/05
(2, 10, 'asesor',  NULL,         '2025-11-05', true, 'Asesor de redes y seguridad. Revisiones mensuales.'),
(2,  9, 'jurado',  'presidente', '2025-11-10', true, 'Presidira la sustentacion del lunes 11/05.'),
(2,  6, 'jurado',  'secretario', '2025-11-10', true, NULL),
(2,  3, 'jurado',  'vocal',      '2025-11-10', true, NULL),

-- Tesis 3 (Camila, culminada)
(3,  7, 'asesor',  NULL,         '2025-05-05', true, 'Excelente trabajo. Sustentacion exitosa.'),
(3,  1, 'jurado',  'presidente', '2025-05-10', true, NULL),
(3,  2, 'jurado',  'secretario', '2025-05-10', true, NULL),
(3,  8, 'jurado',  'vocal',      '2025-05-10', true, NULL);

-- =====================================================
-- 20. ENTREGABLES DE TESIS
-- =====================================================
-- Tesis 1 (Sofia): entregable 3 ya vencio (09/05 ayer) — entregado y en revisión
--                  entregable 4 vence HOY 10/05
-- Tesis 2 (Diego): entregable 4 vence HOY 10/05 (dia antes de sustentacion mañana)
-- Tesis 3 (Camila): todos cerrados (histórico 2025)
INSERT INTO entregable_tesis_mejorado (tesis_id, nombre, descripcion,
    fecha_limite, obligatorio, orden, activo) VALUES

-- Tesis 1 (Sofia)
(1,'Plan de Tesis',
 'Documento con objetivos, hipotesis y cronograma.',
 '2026-01-31', true, 1, true),
(1,'Marco Teorico',
 'Revision de literatura y estado del arte.',
 '2026-03-31', true, 2, true),
(1,'Diseno del Sistema',
 'Diagramas UML, arquitectura y modelo de datos. Vencio ayer 09/05.',
 '2026-05-09', true, 3, true),                    -- vencio ayer, entregado a tiempo
(1,'Implementacion y Pruebas',
 'Codigo fuente, manual de usuario y pruebas funcionales. VENCE HOY 10/05.',
 '2026-05-10', true, 4, true),                    -- vence HOY domingo
(1,'Borrador Final',
 'Documento completo de tesis para revision del asesor.',
 '2026-08-29', true, 5, true),

-- Tesis 2 (Diego)
(2,'Plan de Tesis',
 'Documento con objetivos, hipotesis y cronograma.',
 '2025-12-15', true, 1, true),
(2,'Marco Teorico',
 'Revision de IDS, ML y seguridad de redes.',
 '2026-02-28', true, 2, true),
(2,'Diseno del Sistema',
 'Arquitectura del IDS y seleccion de algoritmos.',
 '2026-04-30', true, 3, true),
(2,'Dataset, Entrenamiento y Documento Final',
 'Dataset etiquetado, modelo ML entrenado y tesis final. VENCE HOY 10/05 (antes de sustentacion manana 11/05).',
 '2026-05-10', true, 4, true),                    -- vence HOY

-- Tesis 3 (Camila, culminada)
(3,'Plan de Tesis',        'Documento inicial.',                          '2025-04-15', true, 1, true),
(3,'Marco Teorico',        'Revision de frameworks y criterios.',         '2025-06-30', true, 2, true),
(3,'Experimentos',         'Resultados de benchmarks y comparativas.',    '2025-09-30', true, 3, true),
(3,'Tesis Final',          'Documento final revisado y aprobado.',        '2025-11-01', true, 4, true);

-- =====================================================
-- 21. ENTREGAS DE TESIS
-- =====================================================
INSERT INTO entrega_tesis_mejorada (entregable_id, estudiante_id, titulo_entrega,
    documento_url, comentario, fecha_entrega, estado,
    retroalimentacion_asesor, fecha_revision, revisado_por) VALUES

-- Sofia: entregables 1 y 2 aprobados
(1, 4, 'Plan de Tesis v1.0',
 'https://docs.unt.edu.pe/tesis/sofia_plan.pdf',
 'Primer borrador del plan. Incluye cronograma de 12 meses.',
 '2026-01-28','aprobado',
 'Plan bien estructurado. Objetivos claros y alcanzables. Cronograma realista. Aprobado.',
 '2026-02-05', 6),

(2, 4, 'Marco Teorico - Capitulos 1 al 3',
 'https://docs.unt.edu.pe/tesis/sofia_marco.pdf',
 'Marco teorico con 45 referencias bibliograficas actualizadas.',
 '2026-03-28','aprobado',
 'Excelente revision de literatura. Bien citado y organizado. Sin observaciones.',
 '2026-04-10', 6),

-- Entregable 3 (Diseno) entregado AYER antes del vencimiento (09/05) → asesor revisa HOY
(3, 4, 'Diseno del Sistema - Arquitectura y UML',
 'https://docs.unt.edu.pe/tesis/sofia_diseno.pdf',
 'Incluye diagrama de clases, casos de uso, modelo entidad-relacion y arquitectura en capas.',
 '2026-05-09','entregado',
 NULL, NULL, NULL),

-- Entregable 4 (Implementacion) aun NO enviado → Sofia debe entregarlo HOY 10/05
-- (no hay fila de entrega para entregable_id=4, ese es el punto de accion HOY)

-- Diego: entregables 1, 2, 3 aprobados
(6, 7, 'Plan de Tesis - IDS con ML',
 'https://docs.unt.edu.pe/tesis/diego_plan.pdf',
 'Plan completo con metodologia CRISP-DM adaptada al proyecto.',
 '2025-12-12','aprobado',
 'Buen plan. Ajustar el alcance del dataset en el cronograma. Segunda version aceptada.',
 '2025-12-20', 10),

(7, 7, 'Marco Teorico - Redes y ML v2 (corregido)',
 'https://docs.unt.edu.pe/tesis/diego_marco_v2.pdf',
 'Version corregida con seccion ampliada de algoritmos y 15 referencias adicionales.',
 '2026-03-20','aprobado',
 'Correcciones aceptadas. Marco teorico aprobado.',
 '2026-03-28', 10),

(8, 7, 'Diseno del IDS - Arquitectura y Seleccion de Algoritmos',
 'https://docs.unt.edu.pe/tesis/diego_diseno.pdf',
 'Arquitectura del IDS con Random Forest y SVM. Justificacion de seleccion de features.',
 '2026-04-28','aprobado',
 'Diseno solido y bien justificado. Listo para implementacion.',
 '2026-05-05', 10),

-- Entregable 4 (tesis final) enviado AYER → asesor/jurado aprueban HOY antes de sustentacion manana
(9, 7, 'Tesis Final + Modelo Entrenado - Previo a Sustentacion',
 'https://docs.unt.edu.pe/tesis/diego_final.pdf',
 'Tesis completa de 98 paginas y modelo entrenado con 94.7% de accuracy. Lista para sustentacion del 11/05.',
 '2026-05-09','revisando',
 NULL, NULL, NULL),

-- Camila: todos aprobados
(10, 10, 'Plan de Tesis - Comparativa Frameworks',
 'https://docs.unt.edu.pe/tesis/camila_plan.pdf',
 'Plan detallado con criterios de evaluacion y metodologia.',
 '2025-04-10','aprobado',
 'Plan aprobado. Muy bien definidos los criterios de comparacion.',
 '2025-04-20', 7),

(11, 10, 'Marco Teorico - Ecosistema Frontend',
 'https://docs.unt.edu.pe/tesis/camila_marco.pdf',
 'Revision exhaustiva del ecosistema React, Vue y Angular 2018-2025.',
 '2025-06-28','aprobado',
 'Excelente cobertura bibliografica. Sin observaciones.',
 '2025-07-10', 7),

(12, 10, 'Resultados de Benchmarks y Comparativas',
 'https://docs.unt.edu.pe/tesis/camila_exp.pdf',
 'Benchmarks de rendimiento, tamano de bundle y tiempo de carga en 10 escenarios.',
 '2025-09-25','aprobado',
 'Resultados solidos y bien justificados estadisticamente. Aprobado.',
 '2025-10-05', 7),

(13, 10, 'Tesis Final Completa',
 'https://docs.unt.edu.pe/tesis/camila_final.pdf',
 'Documento final de 120 paginas con todos los capitulos, conclusiones y recomendaciones.',
 '2025-10-30','aprobado',
 'Tesis de excelente calidad. Lista para sustentacion. Felicitaciones.',
 '2025-11-08', 7);

-- =====================================================
-- 22. ACTA DE SUSTENTACIÓN (solo Camila — ya realizada)
-- La de Diego se crea MAÑANA 11/05 tras el acto
-- =====================================================
INSERT INTO acta_sustentacion (proyecto_id, fecha_sustentacion, hora_inicio, hora_fin,
    lugar, nota_final, resultado, url_acta_firmada, creado_en) VALUES
(5,'2025-11-15','10:00','12:00',
 'Sala de Conferencias A - Facultad de Ingenieria',
 18.50,'aprobado',
 'https://docs.unt.edu.pe/actas/camila_acta_sustentacion.pdf',
 '2025-11-15');

-- =====================================================
-- 23. PAGOS (módulo Secretaria)
-- =====================================================
-- concepto_id (de concepto_pago): 1=MAT-001(350) 2=MAT-002(450)
--   3=TRA-001(constancia 20) 4=TRA-002(cert 25) 5=TRA-003(carnet 30)
--   6=EXT-001(practicas 50) 7=EXT-002(tesis 150) 8=OTR-001
-- El trigger auto-genera codigo_pago → NO incluir en INSERT
INSERT INTO pago (estudiante_id, concepto_id, monto, estado, metodo_pago,
    referencia_pago, fecha_pago, fecha_vencimiento,
    comprobante_url, registrado_por) VALUES

-- Juan: tramite practicas completado (histórico)
(1, 6, 50.00, 'completado','yape',
 'YPE-20260301-001','2026-03-01 09:15:00','2026-03-15',
 'https://docs.unt.edu.pe/pagos/juan_practicas.pdf', 27),

-- Juan: tramite tesis pendiente — VENCE HOY 10/05
(1, 7, 150.00,'pendiente', NULL,
 NULL, NULL,'2026-05-10',
 NULL, 27),

-- Maria: matricula pendiente — VENCE MAÑANA 11/05
(2, 1, 350.00,'pendiente', NULL,
 NULL, NULL,'2026-05-11',
 NULL, 27),

-- Carlos: matricula completada
(3, 1, 350.00,'completado','deposito',
 'BCP-20260210-4421','2026-02-10 11:30:00','2026-02-20',
 'https://docs.unt.edu.pe/pagos/carlos_matricula.pdf', 27),

-- Sofia: tramite tesis completado
(4, 7, 150.00,'completado','transferencia',
 'IBK-20260102-9901','2026-01-02 14:00:00','2026-01-15',
 'https://docs.unt.edu.pe/pagos/sofia_tesis.pdf', 27),

-- Sofia: constancia procesando HOY
(4, 3, 20.00,'procesando','efectivo',
 NULL,'2026-05-10 08:30:00','2026-05-10',
 NULL, 27),

-- Andres: tesis completado
(5, 7, 150.00,'completado','yape',
 'YPE-20260120-330','2026-01-20 10:00:00','2026-01-31',
 'https://docs.unt.edu.pe/pagos/andres_tesis.pdf', 27),

-- Diego: constancia pendiente — VENCE MAÑANA 11/05 (dia de su sustentacion)
(7, 3, 20.00,'pendiente',NULL,
 NULL, NULL,'2026-05-11',
 NULL, 27),

-- Camila: matricula completada
(10, 1, 350.00,'completado','tarjeta',
 'VISA-20260305-7712','2026-03-05 16:20:00','2026-03-15',
 'https://docs.unt.edu.pe/pagos/camila_matricula.pdf', 27),

-- Valeria: matricula RECHAZADA (referencia invalida) → Secretaria debe gestionar
(8, 1, 350.00,'rechazado','deposito',
 'BCP-INVALIDO-9999','2026-04-01 09:00:00','2026-04-10',
 NULL, 27);

-- =====================================================
-- 24. NOTIFICACIONES
-- =====================================================
-- "HOY"   = 2026-05-10 (domingo)
-- "AYER"  = 2026-05-09 (sábado)
-- "MAÑANA"= 2026-05-11 (lunes) → sustentacion Diego
INSERT INTO notificacion (usuario_id, tipo, titulo, mensaje,
    leido, creado_en, entidad_referenciada, id_referenciado) VALUES

-- ── Juan (usuario_id=12) ──────────────────────────────────────────────
(12,'advertencia','Informe Parcial Pendiente de Revision',
 'Tu informe parcial de practicas fue entregado ayer. El asesor Jorge Chavez lo revisara hoy.',
 false,'2026-05-10 08:00:00','informe',7),

(12,'advertencia','4 Registros de Horas Pendientes de Aprobacion',
 'Los registros del 07, 08, 09 y 10/05 estan pendientes de aprobacion del asesor y/o empresa.',
 false,'2026-05-10 08:05:00','practica',4),

(12,'advertencia','Pago de Tramite de Tesis — Vence HOY 10/05',
 'Tu pago por Tramite de Tesis (S/. 150.00) vence hoy domingo 10/05. Coordina con Secretaria.',
 false,'2026-05-10 07:00:00','practica',4),

(12,'advertencia','Entregable Implementacion y Pruebas — Vence HOY 10/05',
 'El entregable Implementacion y Pruebas de tu tesis vence hoy. Debes entregar el documento antes de medianoche.',
 false,'2026-05-10 07:01:00','entrega_tesis',4),

(12,'info','Oferta Frontend cierra HOY — Tu postulacion fue aprobada',
 'La oferta Practicante Frontend React cierra hoy. Tu postulacion ya fue aprobada y tu practica esta activa.',
 true,'2026-05-09 17:00:00','practica',4),

-- ── Sofia (usuario_id=15) ─────────────────────────────────────────────
(15,'advertencia','Entregable Diseno del Sistema — En Revision (vencio ayer)',
 'Entregaste el Diseno del Sistema ayer antes de la fecha limite. El asesor Jorge lo revisara hoy.',
 false,'2026-05-10 07:00:00','entrega_tesis',3),

(15,'advertencia','Entregable Implementacion y Pruebas — Vence HOY 10/05',
 'El entregable Implementacion y Pruebas de tu tesis vence HOY 10/05/2026. Sube el documento antes de medianoche.',
 false,'2026-05-10 07:01:00','entrega_tesis',4),

(15,'exito','Marco Teorico Aprobado',
 'Tu entrega Marco Teorico - Capitulos 1 al 3 fue aprobada por el asesor Jorge Chavez. Sin observaciones.',
 true,'2026-04-10 11:00:00','entrega_tesis',2),

-- ── Diego (usuario_id=18) ─────────────────────────────────────────────
(18,'advertencia','URGENTE: Tesis Final en Revision — Sustentacion MAÑANA 11/05',
 'Tu documento final esta siendo revisado por el asesor. La sustentacion es MANANA lunes 11/05 a las 09:00 am. Sala de Grados.',
 false,'2026-05-10 07:30:00','entrega_tesis',8),

(18,'advertencia','Entregable Dataset y Tesis Final — Vence HOY 10/05',
 'El entregable 4 de tu tesis vence HOY 10/05. Ya lo enviaste ayer. El asesor debe aprobarlo antes de manana.',
 false,'2026-05-10 07:31:00','entrega_tesis',9),

(18,'info','Constancia de Estudios — Pago pendiente vence MANANA 11/05',
 'Tu pago por Constancia de Estudios (S/. 20) vence manana 11/05, el mismo dia de tu sustentacion. Pagalo hoy.',
 false,'2026-05-10 08:00:00','practica',2),

-- ── Andres (usuario_id=16) ────────────────────────────────────────────
(16,'info','Propuesta de Tesis Recibida — En Evaluacion',
 'Tu propuesta de tesis esta siendo evaluada por el coordinador Miguel Flores. Respuesta esperada esta semana.',
 false,'2026-04-21 10:00:00','practica',3),

-- ── Maria (usuario_id=13) ─────────────────────────────────────────────
(13,'advertencia','Postulacion Enviada — Oferta Frontend React CIERRA HOY',
 'Tu postulacion a Practicante Frontend React fue enviada hoy. La oferta cierra hoy mismo. Espera respuesta del representante.',
 false,'2026-05-10 09:30:00','practica',4),

(13,'advertencia','Matricula Pendiente — Vence MANANA 11/05',
 'Tu pago de Matricula Regular (S/. 350.00) vence manana 11/05/2026. Acercate a Secretaria hoy o manana temprano.',
 false,'2026-05-10 07:00:00','practica',4),

-- ── Carlos (usuario_id=14) ────────────────────────────────────────────
(14,'exito','Preseleccionado para Practicante Frontend React',
 'Fuiste preseleccionado para la oferta en TechCorp. La oferta cierra HOY. El representante define el cupo final hoy.',
 false,'2026-05-05 15:00:00','practica',4),

-- ── Camila (usuario_id=21) ────────────────────────────────────────────
(21,'exito','Tesis Aprobada con Distincion',
 'Obtuviste 18.5 en tu sustentacion del 15/11/2025. Felicitaciones por tu excelente trabajo.',
 true,'2025-11-15 16:00:00','practica',3),

-- ── Coordinador Rosa (usuario_id=2) ───────────────────────────────────
(2,'info','Nueva Propuesta de Tesis para Revisar — Andres Morales',
 'Andres Morales envio una propuesta de tesis el 20/04. Pendiente de revision y aprobacion.',
 false,'2026-04-20 10:01:00','practica',3),

(2,'info','Propuesta de Tesis en Registro — Juan Perez',
 'Juan Perez registro una propuesta de tesis el 07/05. Pendiente de evaluacion inicial.',
 false,'2026-05-07 11:00:00','practica',4),

(2,'advertencia','Convenio CONV-UNT-2023-002 (InnovatePeru) VENCIDO',
 'El convenio con InnovatePeru vencio el 15/06/2025. Es necesario renovarlo o iniciar nuevo proceso.',
 false,'2026-05-10 07:00:00','convenio',2),

(2,'advertencia','Oferta Frontend React cierra HOY — 1 postulacion sin revisar',
 'La oferta de TechCorp cierra hoy 10/05. Maria Lopez postulo esta manana y aun no fue revisada.',
 false,'2026-05-10 09:35:00','practica',3),

-- ── Asesor Jorge Chavez (usuario_id=7) ────────────────────────────────
(7,'advertencia','Informe Parcial de Juan Perez — Revisar HOY',
 'El informe parcial de Juan Perez (practica Frontend TechCorp) fue entregado ayer. Por favor revisarlo hoy.',
 false,'2026-05-10 07:00:00','informe',7),

(7,'advertencia','4 Registros de Horas Pendientes — Juan Perez',
 'Los registros del 07, 08, 09 y 10/05 de Juan Perez estan pendientes de tu aprobacion como asesor.',
 false,'2026-05-10 08:00:00','practica',4),

(7,'info','Entregable Diseno del Sistema Recibido — Sofia Gutierrez',
 'Sofia Gutierrez entrego el diseno de su tesis ayer. Requiere tu revision para que pueda continuar con el entregable 4.',
 false,'2026-05-10 07:30:00','entrega_tesis',3),

-- ── Asesor Hector Moya (usuario_id=11) ────────────────────────────────
(11,'advertencia','URGENTE: Tesis Final de Diego Rios — Aprobar HOY (Sustentacion MANANA)',
 'Diego Rios envio su tesis final ayer. Debes aprobarla HOY domingo antes de la sustentacion del lunes 11/05 a las 09:00 am.',
 false,'2026-05-10 07:30:00','entrega_tesis',8),

-- ── Rep. TechCorp — Ricardo (usuario_id=22) ───────────────────────────
(22,'advertencia','Oferta Frontend React CIERRA HOY — Aprobar/Rechazar Postulaciones',
 'La oferta cierra hoy 10/05. Carlos Rodriguez esta preseleccionado y Maria Lopez postulo esta manana. Define el cupo final.',
 false,'2026-05-10 07:00:00','practica',3),

(22,'advertencia','4 Registros de Horas de Juan Perez Pendientes de Aprobacion',
 'Los registros del 07, 08, 09 y 10/05 de Juan Perez (practicante Frontend) requieren tu aprobacion.',
 false,'2026-05-10 08:00:00','practica',4),

-- ── Rep. GlobalTech — Sandra (usuario_id=25) ──────────────────────────
(25,'advertencia','Oferta Redes y Seguridad cierra MANANA 11/05 — Diego Rios sin revisar',
 'La oferta cierra manana 11/05. Diego Rios postulo HOY y aun no fue revisado. Tienes 1 cupo disponible.',
 false,'2026-05-10 10:00:00','practica',4),

(25,'advertencia','4 Registros de Horas de Fernando Soto Pendientes',
 'Los registros del 07, 08, 09 y 10/05 de Fernando Soto estan pendientes de tu aprobacion.',
 false,'2026-05-10 08:00:00','practica',5),

-- ── Rep. NexusDigital — Alvaro (usuario_id=26) ────────────────────────
(26,'advertencia','4 Registros de Horas de Gabriela Herrera Pendientes',
 'Los registros del 07, 08, 09 y 10/05 de Gabriela Herrera (practicante UX) estan pendientes de tu aprobacion.',
 false,'2026-05-10 08:00:00','practica',6),

-- ── Secretaria — Maria Elena (usuario_id=27) ──────────────────────────
(27,'advertencia','3 Pagos Urgentes — HOY y MANANA',
 'Juan Perez (Tesis S/.150 vence HOY 10/05), Maria Lopez (Matricula S/.350 vence man. 11/05), Diego Rios (Constancia S/.20 vence man. 11/05).',
 false,'2026-05-10 07:00:00','practica',4),

(27,'error','Pago Rechazado — Valeria Mendoza (referencia invalida)',
 'El pago de matricula de Valeria Mendoza fue rechazado por referencia bancaria invalida. Requiere gestion urgente.',
 false,'2026-05-10 09:00:00','practica',4);

-- =====================================================
-- SINCRONIZAR practica.estudiante_id y empresa_id
-- =====================================================
SELECT sync_practica_from_postulacion();

-- =====================================================
-- RESUMEN FINAL
-- =====================================================
DO $$
DECLARE
    v_usuarios   INTEGER;
    v_practicas  INTEGER;
    v_tesis      INTEGER;
    v_pagos      INTEGER;
    v_notifs     INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_usuarios  FROM usuario;
    SELECT COUNT(*) INTO v_practicas FROM practica;
    SELECT COUNT(*) INTO v_tesis     FROM tesis;
    SELECT COUNT(*) INTO v_pagos     FROM pago;
    SELECT COUNT(*) INTO v_notifs    FROM notificacion;

    RAISE NOTICE '';
    RAISE NOTICE '✅ Datos de demo cargados exitosamente en Supabase';
    RAISE NOTICE '   Usuarios: %  | Practicas: %  | Tesis: %  | Pagos: %  | Notifs: %',
        v_usuarios, v_practicas, v_tesis, v_pagos, v_notifs;
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '📅 AGENDA — DOMINGO 10/05 (HOY) y LUNES 11/05 (MANANA)';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '';
    RAISE NOTICE '── DOMINGO 10/05 (HOY) ─────────────────────────────────';
    RAISE NOTICE '  • Oferta Frontend TechCorp CIERRA HOY (Maria postulo esta manana)';
    RAISE NOTICE '  • Entregable tesis Sofia Implementacion-Pruebas vence HOY';
    RAISE NOTICE '  • Entregable tesis Diego Tesis-Final vence HOY (sust. manana)';
    RAISE NOTICE '  • Pago tramite tesis Juan Perez vence HOY (S/.150)';
    RAISE NOTICE '  • Constancia Sofia en estado procesando HOY';
    RAISE NOTICE '  • Registros horas 07-10/05 pendientes (3 practicas activas)';
    RAISE NOTICE '  • Informe parcial Juan entregado AYER → revisar HOY';
    RAISE NOTICE '  • Tesis Diego entregada AYER → asesor aprueba HOY';
    RAISE NOTICE '  • Pago rechazado Valeria Mendoza — gestion urgente';
    RAISE NOTICE '';
    RAISE NOTICE '── LUNES 11/05 (MANANA) ────────────────────────────────';
    RAISE NOTICE '  • SUSTENTACION de tesis de Diego Rios — 09:00 am, Sala de Grados';
    RAISE NOTICE '  • Oferta Redes GlobalTech cierra (Diego Rios postulado hoy)';
    RAISE NOTICE '  • Pago matricula Maria Lopez vence (S/.350)';
    RAISE NOTICE '  • Pago constancia Diego Rios vence (S/.20)';
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '🔐 CREDENCIALES — contrasena: 123456';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '';
    RAISE NOTICE '  [ADMINISTRADOR]   admin@unt.edu.pe';
    RAISE NOTICE '';
    RAISE NOTICE '  [COORDINADORES]';
    RAISE NOTICE '  coordinador.fi@unt.edu.pe   Rosa Vargas     — alertas urgentes HOY';
    RAISE NOTICE '  coordinador.is@unt.edu.pe   Miguel Flores   — propuesta Andres pendiente';
    RAISE NOTICE '  coordinador.fct@unt.edu.pe  Luis Torres';
    RAISE NOTICE '  coordinador.feh@unt.edu.pe  Ana Ramos';
    RAISE NOTICE '  coordinador.cc@unt.edu.pe   Patricia Leon';
    RAISE NOTICE '';
    RAISE NOTICE '  [ASESORES]';
    RAISE NOTICE '  jorge.chavez@unt.edu.pe     Jorge Chavez    — informe+horas Juan pendientes HOY';
    RAISE NOTICE '  hector.moya@unt.edu.pe      Hector Moya     — aprobar tesis Diego HOY';
    RAISE NOTICE '  lucia.paredes@unt.edu.pe    Lucia Paredes   — horas Fernando pendientes';
    RAISE NOTICE '  carmen.diaz@unt.edu.pe      Carmen Diaz     — horas Gabriela pendientes';
    RAISE NOTICE '  roberto.silva@unt.edu.pe    Roberto Silva';
    RAISE NOTICE '';
    RAISE NOTICE '  [ESTUDIANTES]';
    RAISE NOTICE '  202310001@estudiante.unt.edu.pe  Juan Perez     practica activa + tesis en registro';
    RAISE NOTICE '  202310002@estudiante.unt.edu.pe  Maria Lopez    postulo HOY — oferta cierra HOY';
    RAISE NOTICE '  202310003@estudiante.unt.edu.pe  Carlos Rodr.   preseleccionado — decision hoy';
    RAISE NOTICE '  202110004@estudiante.unt.edu.pe  Sofia Gutie.   practica finaliz + tesis activa';
    RAISE NOTICE '  202210005@estudiante.unt.edu.pe  Andres Morales practica finaliz + tesis propuesta';
    RAISE NOTICE '  202210006@estudiante.unt.edu.pe  Gabriela Herr. practica activa UX';
    RAISE NOTICE '  202110007@estudiante.unt.edu.pe  Diego Rios     sustentacion MANANA 11/05';
    RAISE NOTICE '  202310008@estudiante.unt.edu.pe  Valeria Mendoza pago rechazado — sin practica';
    RAISE NOTICE '  202210009@estudiante.unt.edu.pe  Fernando Soto  practica activa Redes';
    RAISE NOTICE '  202110010@estudiante.unt.edu.pe  Camila Fuentes caso de exito completo';
    RAISE NOTICE '';
    RAISE NOTICE '  [REPRESENTANTES]';
    RAISE NOTICE '  rep.techcorp@techcorp.pe       Ricardo Castaneda  — oferta cierra HOY';
    RAISE NOTICE '  rep.globaltech@globaltech.pe   Sandra Villanueva  — oferta cierra MANANA';
    RAISE NOTICE '  rep.nexus@nexusdigital.pe      Alvaro Cueva       — horas pendientes';
    RAISE NOTICE '  rep.innovate@innovateperu.pe   Stephanie Quispe   — convenio vencido';
    RAISE NOTICE '  rep.datasolutions@datasol.pe   Martin Espinoza';
    RAISE NOTICE '';
    RAISE NOTICE '  [SECRETARIA]';
    RAISE NOTICE '  secretaria@unt.edu.pe  Maria Elena Sanchez — 3 pagos urgentes + 1 rechazado';
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;
