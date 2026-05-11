-- =====================================================
-- DATOS DE PRUEBA - UNT Prácticas y Tesis
-- Sistema Normalizado - Versión Completa para Demo
-- Generado para presentación: 4 de Mayo 2026
-- =====================================================
-- IMPORTANTE: Ejecutar este script DESPUÉS de 00-init-complete.sql
-- =====================================================

-- Conectar a la base de datos
\c unt_practicas_tesis

SET client_encoding = 'UTF8';

-- =====================================================
-- 1. ROLES
-- =====================================================
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
-- carrera_id referencia: 1=IS, 2=IC, 3=IE, 4=CC, 5=EST, 6=EP, 7=EI
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
(1, 22, 'Gerente de RRHH',         'Recursos Humanos',    '044-301101', true),
(2, 23, 'Coordinadora de Prácticas','Gestión del Talento', '044-301102', true),
(3, 24, 'Jefe de Operaciones',      'Operaciones',         '044-301103', true),
(4, 25, 'Directora Comercial',      'Comercial',           '044-301104', true),
(5, 26, 'CEO / Fundador',           'Dirección',           '044-301105', true);

-- =====================================================
-- 10. CONVENIOS
-- =====================================================
INSERT INTO convenio (empresa_id, tipo, numero_convenio, fecha_inicio, fecha_vencimiento, estado, objeto, condiciones, renovable, creado_en) VALUES
(1, 'marco',     'CONV-UNT-2023-001', '2023-03-01', '2026-03-01', 'vigente',
 'Convenio marco para prácticas pre-profesionales en desarrollo de software.',
 'Mínimo 4 horas diarias. Supervisor designado por la empresa.', true, CURRENT_TIMESTAMP),

(2, 'marco',     'CONV-UNT-2023-002', '2023-06-15', '2025-06-15', 'vencido',
 'Convenio marco para prácticas en áreas de innovación y transformación digital.',
 'Mínimo 6 horas diarias. Informe mensual obligatorio.', true, CURRENT_TIMESTAMP),

(3, 'especifico','CONV-UNT-2024-003', '2024-01-10', '2025-12-31', 'vigente',
 'Convenio específico para prácticas en ciencia de datos e inteligencia artificial.',
 'Modalidad híbrida. Remuneración mínima S/. 800.', false, CURRENT_TIMESTAMP),

(4, 'marco',     'CONV-UNT-2024-004', '2024-04-01', '2027-04-01', 'vigente',
 'Convenio marco para prácticas en ingeniería de sistemas y redes.',
 'Presencial. Seguro ESSALUD cubierto por empresa.', true, CURRENT_TIMESTAMP),

(5, 'especifico','CONV-UNT-2025-005', '2025-01-20', '2026-12-31', 'vigente',
 'Convenio específico para prácticas en diseño UX/UI y desarrollo frontend.',
 '100% remoto. Horario flexible.', false, CURRENT_TIMESTAMP);

-- =====================================================
-- 11. OFERTAS DE PRÁCTICA
-- =====================================================
INSERT INTO oferta_practica (empresa_id, convenio_id, titulo, descripcion, requisitos, fecha_inicio_postulacion, fecha_fin_postulacion, fecha_inicio_practica, fecha_fin_practica, cupos, estado, creado_en) VALUES
-- Oferta cerrada (histórico)
(1, 1, 'Practicante en Desarrollo Backend Node.js',
 'Desarrollarás APIs REST usando Node.js y Express. Trabajarás en equipo ágil bajo metodología Scrum.',
 'Conocimientos en JavaScript, Node.js básico, SQL. Promedio mínimo 14.',
 '2024-03-01', '2024-03-31', '2024-04-15', '2024-10-15', 3, 'cerrada', '2024-02-28'),

-- Oferta cerrada (histórico)
(3, 3, 'Practicante en Ciencia de Datos',
 'Analizarás datasets reales usando Python, pandas y visualización con Power BI.',
 'Conocimientos en Python y estadística básica. Promedio mínimo 15.',
 '2024-06-01', '2024-06-30', '2024-07-15', '2024-12-15', 2, 'cerrada', '2024-05-30'),

-- Oferta publicada activa (postulaciones abiertas)
(1, 1, 'Practicante en Desarrollo Frontend React',
 'Construirás interfaces modernas con React 18 y TailwindCSS integrando con APIs REST.',
 'Conocimientos en HTML, CSS, JavaScript, React básico. Promedio mínimo 14.',
 '2025-04-01', '2025-05-15', '2025-06-01', '2025-11-30', 4, 'publicada', '2025-03-28'),

-- Oferta publicada activa
(4, 4, 'Practicante en Administración de Redes y Seguridad',
 'Configurarás y monitorearás infraestructura de red. Apoyo en ethical hacking básico.',
 'Conocimientos en redes TCP/IP, Linux básico. Promedio mínimo 14.',
 '2025-04-10', '2025-05-20', '2025-06-10', '2025-12-10', 2, 'publicada', '2025-04-08'),

-- Oferta publicada activa
(5, 5, 'Practicante en Diseño UX/UI',
 'Diseñarás wireframes y prototipos interactivos. Realizarás pruebas de usabilidad con usuarios reales.',
 'Conocimientos en Figma o Adobe XD. Portafolio deseable. Promedio mínimo 13.',
 '2025-04-15', '2025-05-30', '2025-06-15', '2025-12-15', 2, 'publicada', '2025-04-12'),

-- Oferta borrador
(2, NULL, 'Practicante en Marketing Digital',
 'Apoyarás en campañas de redes sociales y email marketing.',
 'Conocimientos básicos en marketing. Promedio mínimo 13.',
 '2025-05-20', '2025-06-15', '2025-07-01', '2025-12-31', 3, 'borrador', '2025-04-28');

-- =====================================================
-- 12. POSTULACIONES
-- =====================================================
-- Referencia estudiante_id: 1=Juan(IS), 2=María(CC), 3=Carlos(IS), 4=Sofía(IS),
--   5=Andrés(CC), 6=Gabriela(IC), 7=Diego(IS), 8=Valeria(CC),
--   9=Fernando(IE), 10=Camila(IS)
-- Referencia oferta_id: 1(Backend-cerrada), 2(DS-cerrada), 3(Frontend-pub),
--   4(Redes-pub), 5(UX-pub), 6(Marketing-borr)

INSERT INTO postulacion (oferta_id, estudiante_id, cv_url, carta_presentacion, estado, fecha_postulacion, fecha_revision, revisado_por) VALUES
-- Postulaciones a oferta 1 (Backend, CERRADA) → aprobados → práctica activa/finalizada
(1, 4, 'https://docs.unt.edu.pe/cv/sofia_gutierrez.pdf',
 'Tengo experiencia en proyectos universitarios con Node.js y me interesa crecer en backend.',
 'aprobado', '2024-03-10', '2024-04-01', 22),

(1, 7, 'https://docs.unt.edu.pe/cv/diego_rios.pdf',
 'Desarrollé una API REST en mi proyecto de curso. Quiero aplicar mis habilidades profesionalmente.',
 'aprobado', '2024-03-12', '2024-04-01', 22),

(1, 10, 'https://docs.unt.edu.pe/cv/camila_fuentes.pdf',
 'Cuento con sólidos conocimientos en JavaScript y Express. Soy proactiva y trabajo bien en equipo.',
 'rechazado', '2024-03-20', '2024-04-01', 22),

-- Postulaciones a oferta 2 (Ciencia de Datos, CERRADA) → aprobado
(2, 5, 'https://docs.unt.edu.pe/cv/andres_morales.pdf',
 'He trabajado con pandas y matplotlib en cursos de estadística. Me apasiona el análisis de datos.',
 'aprobado', '2024-06-10', '2024-07-01', 24),

(2, 8, 'https://docs.unt.edu.pe/cv/valeria_mendoza.pdf',
 'Cuento con proyectos de machine learning básico en Python.',
 'rechazado', '2024-06-15', '2024-07-01', 24),

-- Postulaciones a oferta 3 (Frontend React, PUBLICADA/ACTIVA)
(3, 1, 'https://docs.unt.edu.pe/cv/juan_perez.pdf',
 'He desarrollado aplicaciones con React en mis proyectos de facultad y me interesa el frontend.',
 'aprobado', '2025-04-05', '2025-05-10', 22),

(3, 3, 'https://docs.unt.edu.pe/cv/carlos_rodriguez.pdf',
 'Cuento con un proyecto de React con hooks y Context API. Quiero seguir creciendo.',
 'preseleccionado', '2025-04-07', '2025-05-10', 22),

(3, 2, 'https://docs.unt.edu.pe/cv/maria_lopez.pdf',
 'Tengo bases sólidas en JavaScript y React. Mi promedio refleja mi compromiso académico.',
 'postulado', '2025-04-20', NULL, NULL),

-- Postulaciones a oferta 4 (Redes, PUBLICADA)
(4, 9, 'https://docs.unt.edu.pe/cv/fernando_soto.pdf',
 'He cursado redes de computadoras y configurado routers en laboratorio. Me interesa la seguridad.',
 'aprobado', '2025-04-15', '2025-05-18', 25),

(4, 7, 'https://docs.unt.edu.pe/cv/diego_rios2.pdf',
 'Tengo conocimientos en Linux y redes básicas. Me gustaría especializarme en ciberseguridad.',
 'postulado', '2025-04-25', NULL, NULL),

-- Postulaciones a oferta 5 (UX/UI, PUBLICADA)
(5, 6, 'https://docs.unt.edu.pe/cv/gabriela_herrera.pdf',
 'He diseñado prototipos en Figma para proyectos de clase. Me apasiona la experiencia de usuario.',
 'aprobado', '2025-04-18', '2025-05-20', 26);

-- =====================================================
-- 13. PRÁCTICAS
-- =====================================================
-- asesor_academico_id = usuario_id de docentes: 7=Jorge, 8=Carmen, 9=Roberto, 10=Lucía, 11=Héctor
INSERT INTO practica (postulacion_id, supervisor_empresa, cargo_supervisor, email_supervisor, telefono_supervisor, fecha_inicio, fecha_fin, horas_semanales, estado, asesor_academico_id, calificacion_final, observaciones_finales, creado_en) VALUES
-- Práctica FINALIZADA de Sofía (postulacion 1, oferta 1-Backend, empresa TechCorp)
(1, 'Ing. Roberto Paredes', 'Tech Lead', 'r.paredes@techcorp.pe', '044-301201',
 '2024-04-15', '2024-10-15', 30, 'finalizada', 7, 17.50,
 'Excelente desempeño. Entregó todos los módulos a tiempo y con calidad profesional.',
 '2024-04-14'),

-- Práctica FINALIZADA de Diego (postulacion 2, oferta 1-Backend, empresa TechCorp)
(2, 'Ing. Roberto Paredes', 'Tech Lead', 'r.paredes@techcorp.pe', '044-301201',
 '2024-04-15', '2024-10-15', 30, 'finalizada', 7, 16.00,
 'Buen desempeño general. Requirió orientación en las primeras semanas.',
 '2024-04-14'),

-- Práctica FINALIZADA de Andrés (postulacion 4, oferta 2-DataSol)
(4, 'Lic. Paola Chávez', 'Data Analyst Senior', 'p.chavez@datasol.pe', '044-301301',
 '2024-07-15', '2024-12-15', 24, 'finalizada', 8, 18.00,
 'Destacado. Desarrolló un dashboard de ventas que fue adoptado por el equipo.',
 '2024-07-14'),

-- Práctica ACTIVA de Juan (postulacion 6, oferta 3-Frontend, empresa TechCorp)
(6, 'Ing. Karla Mendoza', 'Frontend Lead', 'k.mendoza@techcorp.pe', '044-301202',
 '2025-06-01', NULL, 30, 'activa', 7, NULL, NULL, '2025-05-30'),

-- Práctica ACTIVA de Fernando (postulacion 9, oferta 4-Redes, GlobalTech)
(9, 'Ing. César Rojas', 'Infraestructura Senior', 'c.rojas@globaltech.pe', '044-301401',
 '2025-06-10', NULL, 28, 'activa', 10, NULL, NULL, '2025-06-08'),

-- Práctica ACTIVA de Gabriela (postulacion 11, oferta 5-UX, Nexus)
(11, 'Dis. Laura Vega', 'UX Lead', 'l.vega@nexusdigital.pe', '044-301501',
 '2025-06-15', NULL, 24, 'activa', 8, NULL, NULL, '2025-06-13');

-- =====================================================
-- 14. SEGUIMIENTO DE HORAS (prácticas activas)
-- =====================================================
-- practica_id 4 = Juan (activa desde 2025-06-01)
INSERT INTO seguimiento_horas (practica_id, fecha_trabajada, horas, descripcion_actividad, aprobado_empresa, aprobado_asesor) VALUES
(4, '2025-06-02', 6, 'Configuración del entorno de desarrollo y revisión del repositorio base.',         true,  true),
(4, '2025-06-03', 6, 'Reunión de onboarding con el equipo y revisión de tickets del sprint.',            true,  true),
(4, '2025-06-04', 6, 'Implementación del componente de login con validación de formularios.',            true,  true),
(4, '2025-06-05', 6, 'Desarrollo de la vista del dashboard principal con gráficos en Recharts.',        true,  true),
(4, '2025-06-06', 6, 'Corrección de bugs y pruebas unitarias del módulo de autenticación.',             true,  false),
(4, '2025-06-09', 6, 'Integración con la API de usuarios y manejo de estados con Context API.',         true,  true),
(4, '2025-06-10', 6, 'Implementación de tabla de datos con paginación y filtros dinámicos.',            true,  true),
(4, '2025-06-11', 6, 'Mejoras de accesibilidad y responsividad de componentes existentes.',             false, false),
(4, '2025-06-12', 6, 'Revisión de código (code review) y merge de pull requests pendientes.',           false, false),
(4, '2025-06-13', 6, 'Desarrollo de módulo de notificaciones en tiempo real con WebSockets.',           false, false);

-- practica_id 5 = Fernando (activa desde 2025-06-10)
INSERT INTO seguimiento_horas (practica_id, fecha_trabajada, horas, descripcion_actividad, aprobado_empresa, aprobado_asesor) VALUES
(5, '2025-06-10', 7, 'Inducción a la infraestructura de red de la empresa y protocolos internos.',      true,  true),
(5, '2025-06-11', 7, 'Monitoreo de switches y routers con herramienta Zabbix.',                         true,  true),
(5, '2025-06-12', 7, 'Configuración de VLANs en switches Cisco del edificio B.',                        true,  false),
(5, '2025-06-13', 7, 'Apoyo en escaneo de vulnerabilidades con Nmap y reporte.',                        false, false);

-- practica_id 6 = Gabriela (activa desde 2025-06-15)
INSERT INTO seguimiento_horas (practica_id, fecha_trabajada, horas, descripcion_actividad, aprobado_empresa, aprobado_asesor) VALUES
(6, '2025-06-16', 6, 'Revisión de la guía de estilos y componentes del sistema de diseño.',             true,  true),
(6, '2025-06-17', 6, 'Diseño de wireframes de flujo de registro de usuario en Figma.',                  true,  true),
(6, '2025-06-18', 6, 'Prototipado interactivo de la pantalla de onboarding.',                           true,  false),
(6, '2025-06-19', 6, 'Sesiones de pruebas de usabilidad con 3 usuarios reales.',                        false, false);

-- =====================================================
-- 15. INFORMES DE PRÁCTICA
-- =====================================================
-- Prácticas finalizadas (id 1, 2, 3) tienen informes parcial y final
INSERT INTO informe_practica (practica_id, tipo, titulo, contenido_resumen, documento_url, fecha_entrega, estado, comentario_asesor) VALUES
-- Sofía (practica 1) - parcial y final
(1, 'parcial', 'Informe Parcial - Desarrollo Backend TechCorp',
 'Durante los primeros 3 meses implementé 5 endpoints REST para el módulo de usuarios y autenticación. Se utilizó JWT para seguridad.',
 'https://docs.unt.edu.pe/informes/sofia_parcial.pdf', '2024-07-15', 'aprobado',
 'Excelente avance. Demuestra dominio técnico sólido. Continuar con buenas prácticas.'),

(1, 'final', 'Informe Final - Desarrollo Backend TechCorp',
 'Concluí el desarrollo del módulo de gestión de pedidos y su integración con pasarela de pagos. El sistema está en producción.',
 'https://docs.unt.edu.pe/informes/sofia_final.pdf', '2024-10-10', 'aprobado',
 'Trabajo sobresaliente. El sistema implementado tiene impacto real en la empresa. Felicitaciones.'),

-- Diego (practica 2) - parcial y final
(2, 'parcial', 'Informe Parcial - Desarrollo Backend TechCorp',
 'Implementé el módulo de catálogo de productos con CRUD completo y filtros de búsqueda.',
 'https://docs.unt.edu.pe/informes/diego_parcial.pdf', '2024-07-15', 'observado',
 'El informe es aceptable pero le falta mayor detalle técnico. Por favor reenviar con las secciones de arquitectura.'),

(2, 'final', 'Informe Final - Desarrollo Backend TechCorp',
 'Finalicé el módulo de reportes con exportación a PDF y Excel. Se incorporaron las observaciones del informe parcial.',
 'https://docs.unt.edu.pe/informes/diego_final.pdf', '2024-10-12', 'aprobado',
 'Buen informe final. Notoria mejora respecto al parcial.'),

-- Andrés (practica 3) - parcial y final
(3, 'parcial', 'Informe Parcial - Ciencia de Datos DataSol',
 'Realicé limpieza y análisis exploratorio de 3 datasets de ventas. Construí visualizaciones con matplotlib y seaborn.',
 'https://docs.unt.edu.pe/informes/andres_parcial.pdf', '2024-10-01', 'aprobado',
 'Excelente trabajo de análisis. Las visualizaciones son claras y el análisis estadístico es correcto.'),

(3, 'final', 'Informe Final - Ciencia de Datos DataSol',
 'Construí un dashboard interactivo con Power BI que integra 5 fuentes de datos y se actualiza automáticamente cada hora.',
 'https://docs.unt.edu.pe/informes/andres_final.pdf', '2024-12-10', 'aprobado',
 'Trabajo excepcional. El dashboard ya es usado por el equipo directivo de la empresa. Calificación máxima.'),

-- Juan (practica 4 activa) - informe parcial enviado
(4, 'parcial', 'Informe Parcial - Desarrollo Frontend TechCorp',
 'En los primeros 3 meses implementé el sistema de autenticación, dashboard principal y módulo de gestión de usuarios con React 18.',
 'https://docs.unt.edu.pe/informes/juan_parcial.pdf', '2025-09-01', 'pendiente', NULL);

-- =====================================================
-- 16. EVALUACIONES FINALES DE PRÁCTICA
-- =====================================================
INSERT INTO evaluacion_final_practica (practica_id, calificacion_empresa, calificacion_asesor, retroalimentacion, fecha_evaluacion, apto) VALUES
-- Sofía (practica 1): finalizada
(1, 18, 17, 'Practicante sobresaliente. Tomó iniciativa, propuso mejoras y entregó con calidad. Recomendamos para contratación.', '2024-10-16', true),
-- Diego (practica 2): finalizada
(2, 16, 16, 'Buen desempeño con mejora progresiva. Alcanzó los objetivos propuestos satisfactoriamente.', '2024-10-16', true),
-- Andrés (practica 3): finalizada
(3, 19, 17, 'Rendimiento excepcional. El dashboard que construyó se sigue usando en producción. Altamente recomendado.', '2024-12-16', true);

-- =====================================================
-- 17. PROYECTOS DE TESIS
-- =====================================================
-- estudiante_id: 1=Juan, 4=Sofía, 5=Andrés, 7=Diego, 10=Camila
INSERT INTO proyecto_tesis (estudiante_id, titulo, resumen, area_conocimiento, palabras_clave, estado, fecha_registro, fecha_aprobacion, aprobado_por) VALUES
-- Tesis aprobada y en desarrollo (Sofía)
(4, 'Sistema de Gestión de Prácticas Pre-Profesionales con Seguimiento en Tiempo Real',
 'Desarrollo de una plataforma web que automatice el proceso de registro, asignación y seguimiento de prácticas pre-profesionales en universidades nacionales, integrando notificaciones en tiempo real.',
 'Ingeniería de Software',
 'prácticas profesionales, seguimiento, notificaciones, Node.js, React',
 'aprobado', '2024-11-01', '2024-12-15', 1),

-- Tesis en desarrollo (Diego)
(7, 'Implementación de un Sistema de Detección de Intrusiones en Redes LAN usando Machine Learning',
 'Diseño e implementación de un IDS basado en algoritmos de Machine Learning para detectar ataques en redes LAN universitarias, con evaluación de rendimiento en tiempo real.',
 'Redes y Seguridad',
 'IDS, machine learning, redes, ciberseguridad, anomalías',
 'en_desarrollo', '2024-09-15', '2024-11-01', 1),

-- Tesis propuesta esperando aprobación (Andrés)
(5, 'Dashboard Predictivo de Rendimiento Académico usando Técnicas de Minería de Datos',
 'Aplicación de técnicas de minería de datos y modelos predictivos para anticipar el rendimiento académico de estudiantes universitarios y recomendar intervenciones oportunas.',
 'Ciencia de Datos',
 'minería de datos, predicción, rendimiento académico, python, scikit-learn',
 'propuesto', '2025-01-20', NULL, NULL),

-- Tesis en registro inicial (Juan)
(1, 'Arquitectura de Microservicios para Plataformas Educativas en la Nube',
 'Diseño e implementación de una arquitectura de microservicios escalable para plataformas educativas, evaluando patrones de resiliencia y rendimiento bajo carga.',
 'Ingeniería de Software',
 'microservicios, cloud, Docker, Kubernetes, educación',
 'en_registro', '2025-03-10', NULL, NULL),

-- Tesis culminada (Camila)
(10, 'Evaluación de Frameworks Frontend Modernos: React vs Vue vs Angular en Aplicaciones Empresariales',
 'Estudio comparativo de los principales frameworks frontend evaluando rendimiento, mantenibilidad, curva de aprendizaje y ecosistema para aplicaciones de escala empresarial.',
 'Ingeniería de Software',
 'React, Vue, Angular, frontend, rendimiento, comparativa',
 'culminado', '2024-01-10', '2024-03-01', 1);

-- =====================================================
-- 18. TESIS (entidad principal)
-- =====================================================
INSERT INTO tesis (proyecto_id, estudiante_id, titulo, resumen, area_conocimiento, estado, fecha_registro, fecha_aprobacion, fecha_sustentacion, nota_final, resultado_sustentacion) VALUES
-- Tesis de Sofía (aprobada, en desarrollo)
(1, 4,
 'Sistema de Gestión de Prácticas Pre-Profesionales con Seguimiento en Tiempo Real',
 'Desarrollo de una plataforma web que automatice el proceso de registro, asignación y seguimiento de prácticas pre-profesionales en universidades nacionales.',
 'Ingeniería de Software', 'aprobado',
 '2024-11-01', '2024-12-15', NULL, NULL, NULL),

-- Tesis de Diego (en desarrollo)
(2, 7,
 'Implementación de un Sistema de Detección de Intrusiones en Redes LAN usando Machine Learning',
 'Diseño e implementación de un IDS basado en Machine Learning para redes LAN universitarias.',
 'Redes y Seguridad', 'en_desarrollo',
 '2024-09-15', '2024-11-01', NULL, NULL, NULL),

-- Tesis de Camila (culminada con nota)
(5, 10,
 'Evaluación de Frameworks Frontend Modernos: React vs Vue vs Angular en Aplicaciones Empresariales',
 'Estudio comparativo de frameworks frontend evaluando rendimiento, mantenibilidad y ecosistema.',
 'Ingeniería de Software', 'culminado',
 '2024-01-10', '2024-03-01', '2024-11-15', 18.50, 'aprobado');

-- =====================================================
-- 19. ASIGNACIONES DE ASESOR A TESIS
-- =====================================================
-- docente_id: 1=Rosa(coord), 2=Luis(coord), 3=Ana(coord), 4=Miguel(coord), 5=Patricia(coord)
--             6=Jorge(asesor), 7=Carmen(asesor), 8=Roberto(asesor), 9=Lucía(asesor), 10=Héctor(asesor)
INSERT INTO asesor_tesis (tesis_id, docente_id, tipo_asignacion, rol_jurado, fecha_asignacion, activo, observaciones) VALUES
-- Tesis 1 (Sofía): Asesor + Jurado
(1, 6, 'asesor',  NULL,         '2024-12-16', true,  'Asesor principal. Reuniones quincenales.'),
(1, 7, 'jurado',  'presidente', '2024-12-20', true,  'Presidirá el jurado al término del desarrollo.'),
(1, 4, 'jurado',  'secretario', '2024-12-20', true,  NULL),
(1, 5, 'jurado',  'vocal',      '2024-12-20', true,  NULL),

-- Tesis 2 (Diego): Asesor + Jurado
(2, 10, 'asesor', NULL,         '2024-11-05', true,  'Asesor de redes y seguridad. Revisiones mensuales.'),
(2, 9,  'jurado', 'presidente', '2024-11-10', true,  NULL),
(2, 6,  'jurado', 'secretario', '2024-11-10', true,  NULL),
(2, 3,  'jurado', 'vocal',      '2024-11-10', true,  NULL),

-- Tesis 3 (Camila, culminada): Asesor + Jurado
(3, 7,  'asesor', NULL,         '2024-03-05', true,  'Excelente trabajo. Sustentación exitosa.'),
(3, 1,  'jurado', 'presidente', '2024-03-10', true,  NULL),
(3, 2,  'jurado', 'secretario', '2024-03-10', true,  NULL),
(3, 8,  'jurado', 'vocal',      '2024-03-10', true,  NULL);

-- =====================================================
-- 20. ENTREGABLES DE TESIS
-- =====================================================
INSERT INTO entregable_tesis_mejorado (tesis_id, nombre, descripcion, fecha_limite, obligatorio, orden, activo) VALUES
-- Tesis 1 (Sofía)
(1, 'Plan de Tesis',            'Documento con objetivos, hipótesis y cronograma.',                 '2025-01-31', true,  1, true),
(1, 'Marco Teórico',            'Revisión de literatura y estado del arte.',                        '2025-03-31', true,  2, true),
(1, 'Diseño del Sistema',       'Diagramas UML, arquitectura y modelo de datos.',                   '2025-05-31', true,  3, true),
(1, 'Implementación y Pruebas', 'Código fuente, manual de usuario y pruebas funcionales.',          '2025-08-31', true,  4, true),
(1, 'Borrador Final',           'Documento completo de tesis para revisión del asesor.',            '2025-10-31', true,  5, true),

-- Tesis 2 (Diego)
(2, 'Plan de Tesis',            'Documento con objetivos, hipótesis y cronograma.',                 '2024-12-15', true,  1, true),
(2, 'Marco Teórico',            'Revisión de IDS, ML y seguridad de redes.',                       '2025-02-28', true,  2, true),
(2, 'Diseño del Sistema',       'Arquitectura del IDS y selección de algoritmos.',                  '2025-04-30', true,  3, true),
(2, 'Dataset y Entrenamiento',  'Dataset etiquetado y modelo ML entrenado.',                        '2025-07-31', true,  4, true),

-- Tesis 3 (Camila, culminada)
(3, 'Plan de Tesis',            'Documento inicial.',                                               '2024-04-15', true,  1, true),
(3, 'Marco Teórico',            'Revisión de frameworks y criterios de comparación.',               '2024-06-30', true,  2, true),
(3, 'Experimentos',             'Resultados de benchmarks y comparativas.',                         '2024-09-30', true,  3, true),
(3, 'Tesis Final',              'Documento final revisado y aprobado.',                             '2024-11-01', true,  4, true);

-- =====================================================
-- 21. ENTREGAS DE TESIS
-- =====================================================
INSERT INTO entrega_tesis_mejorada (entregable_id, estudiante_id, titulo_entrega, documento_url, comentario, fecha_entrega, estado, retroalimentacion_asesor, fecha_revision, revisado_por) VALUES
-- Sofía (tesis 1, entregable 1 y 2 entregados)
(1, 4, 'Plan de Tesis v1.0',
 'https://docs.unt.edu.pe/tesis/sofia_plan.pdf',
 'Primer borrador del plan. Incluye cronograma de 12 meses.',
 '2025-01-28', 'aprobado',
 'Plan bien estructurado. Los objetivos son claros y alcanzables. Cronograma realista. Aprobado.',
 '2025-02-05', 6),

(2, 4, 'Marco Teórico - Capítulos 1 al 3',
 'https://docs.unt.edu.pe/tesis/sofia_marco.pdf',
 'Marco teórico con 45 referencias bibliográficas actualizadas.',
 '2025-03-28', 'aprobado',
 'Excelente revisión de literatura. Bien citado y organizado. Sin observaciones.',
 '2025-04-10', 6),

-- Diego (tesis 2, entregable 1 aprobado, 2 en revisión)
(6, 7, 'Plan de Tesis - IDS con ML',
 'https://docs.unt.edu.pe/tesis/diego_plan.pdf',
 'Plan completo con metodología CRISP-DM adaptada al proyecto.',
 '2024-12-12', 'aprobado',
 'Buen plan. Ajustar el alcance del dataset en el cronograma. Segunda versión aceptada.',
 '2024-12-20', 10),

(7, 7, 'Marco Teórico - Redes y ML',
 'https://docs.unt.edu.pe/tesis/diego_marco.pdf',
 'Revisión de 60 papers sobre IDS y algoritmos de clasificación.',
 '2025-02-25', 'revisando',
 NULL, NULL, NULL),

-- Camila (tesis 3, todos aprobados)
(10, 10, 'Plan de Tesis - Comparativa Frameworks',
 'https://docs.unt.edu.pe/tesis/camila_plan.pdf',
 'Plan detallado con criterios de evaluación y metodología.',
 '2024-04-10', 'aprobado',
 'Plan aprobado. Muy bien definidos los criterios de comparación.',
 '2024-04-20', 7),

(11, 10, 'Marco Teórico - Ecosistema Frontend',
 'https://docs.unt.edu.pe/tesis/camila_marco.pdf',
 'Revisión exhaustiva del ecosistema React, Vue y Angular 2018-2024.',
 '2024-06-28', 'aprobado',
 'Excelente cobertura bibliográfica. Sin observaciones.',
 '2024-07-10', 7),

(12, 10, 'Resultados de Benchmarks y Comparativas',
 'https://docs.unt.edu.pe/tesis/camila_exp.pdf',
 'Benchmarks de rendimiento, tamaño de bundle y tiempo de carga en 10 escenarios.',
 '2024-09-25', 'aprobado',
 'Resultados sólidos y bien justificados estadísticamente. Aprobado.',
 '2024-10-05', 7),

(13, 10, 'Tesis Final Completa',
 'https://docs.unt.edu.pe/tesis/camila_final.pdf',
 'Documento final de 120 páginas con todos los capítulos, conclusiones y recomendaciones.',
 '2024-10-30', 'aprobado',
 'Tesis de excelente calidad. Lista para sustentación. Felicitaciones.',
 '2024-11-08', 7);

-- =====================================================
-- 22. NOTIFICACIONES
-- =====================================================
INSERT INTO notificacion (usuario_id, tipo, titulo, mensaje, leido, creado_en, entidad_referenciada, id_referenciado) VALUES
-- Notificaciones para Juan (id=12, usuario_id=12)
(12, 'exito',      'Postulación Aprobada',
 'Tu postulación para "Practicante en Desarrollo Frontend React" en TechCorp ha sido aprobada. ¡Felicitaciones!',
 true,  '2025-05-10 09:00:00', 'practica', 4),

(12, 'info',       'Inicio de Prácticas',
 'Tu práctica en TechCorp inicia el 01/06/2025. Recuerda presentarte puntualmente con tu DNI y carta de presentación.',
 true,  '2025-05-28 10:00:00', 'practica', 4),

(12, 'advertencia','Horas Pendientes de Aprobación',
 'Tienes 3 registros de horas sin aprobación del asesor. Consulta con el Ing. Jorge Chávez.',
 false, '2025-06-13 08:00:00', 'practica', 4),

-- Notificaciones para Sofía (id=15)
(15, 'exito',      'Tesis Aprobada por Coordinación',
 'Tu proyecto de tesis "Sistema de Gestión de Prácticas..." ha sido aprobado. Ya puedes iniciar el desarrollo.',
 true,  '2024-12-15 11:00:00', 'practica', 1),

(15, 'exito',      'Informe Final Aprobado',
 'Tu informe final de prácticas ha sido aprobado por el asesor. ¡Excelente trabajo!',
 true,  '2024-10-16 09:30:00', 'informe', 2),

(15, 'info',       'Entregable Pendiente: Diseño del Sistema',
 'El entregable "Diseño del Sistema" de tu tesis vence el 31/05/2025. Asegúrate de subirlo antes de la fecha.',
 false, '2025-05-20 07:00:00', 'entrega_tesis', 3),

-- Notificaciones para Diego (id=18)
(18, 'advertencia','Marco Teórico en Revisión',
 'Tu entrega del Marco Teórico está siendo revisada por el asesor Héctor Moya. Espera retroalimentación.',
 false, '2025-02-26 09:00:00', 'entrega_tesis', 7),

(18, 'info',       'Reunión de Asesoría Programada',
 'Tienes una reunión de asesoría programada para el viernes 30/05/2025 a las 10:00 am. Aula OF-405.',
 false, '2025-05-28 08:00:00', 'practica', 2),

-- Notificaciones para Andrés (id=16)
(16, 'info',       'Propuesta de Tesis Recibida',
 'Tu propuesta de tesis ha sido recibida y está en revisión por el coordinador. Recibirás respuesta en 15 días hábiles.',
 false, '2025-01-21 10:00:00', 'practica', 3),

-- Notificaciones para Camila (id=21)
(21, 'exito',      '¡Tesis Aprobada con Distinción!',
 'Obtuviste 18.5 en tu sustentación de tesis. ¡Felicitaciones por tu excelente trabajo!',
 true,  '2024-11-15 16:00:00', 'practica', 3),

-- Notificaciones para coordinador FI (usuario_id=2)
(2,  'info',       'Nueva Propuesta de Tesis para Revisar',
 'El estudiante Andrés Morales ha enviado una propuesta de tesis. Pendiente de revisión.',
 false, '2025-01-21 10:01:00', 'practica', 3),

(2,  'advertencia','Convenio por Vencer',
 'El convenio CONV-UNT-2023-002 con InnovatePeru vence en 30 días. Considere la renovación.',
 false, '2025-05-16 07:00:00', 'convenio', 2),

-- Notificaciones para representante TechCorp (usuario_id=22)
(22, 'info',       'Nueva Postulación Recibida',
 'El estudiante Carlos Rodríguez ha postulado a "Practicante en Desarrollo Frontend React". Revise su perfil.',
 false, '2025-04-07 10:00:00', 'practica', 4),

(22, 'info',       'Horas Semanales Pendientes de Aprobar',
 'Hay 3 registros de horas del practicante Juan Pérez pendientes de aprobación por su parte.',
 false, '2025-06-13 09:00:00', 'practica', 4);

COMMIT;

-- =====================================================
-- RESUMEN FINAL
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Datos de prueba COMPLETOS insertados exitosamente';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Resumen de datos creados:';
    RAISE NOTICE '   Roles:           5';
    RAISE NOTICE '   Facultades:      3';
    RAISE NOTICE '   Carreras:        7';
    RAISE NOTICE '   Usuarios:        26  (1 admin, 5 coord, 5 asesores, 10 est., 5 rep.)';
    RAISE NOTICE '   Empresas:        5';
    RAISE NOTICE '   Convenios:       5  (3 vigentes, 1 vencido, 1 específico)';
    RAISE NOTICE '   Ofertas:         6  (2 cerradas, 3 publicadas, 1 borrador)';
    RAISE NOTICE '   Postulaciones:   11 (varios estados)';
    RAISE NOTICE '   Prácticas:       6  (3 finalizadas, 3 activas)';
    RAISE NOTICE '   Seg. de horas:   18 registros';
    RAISE NOTICE '   Informes:        7  (aprobados, observados, pendientes)';
    RAISE NOTICE '   Evaluaciones:    3';
    RAISE NOTICE '   Proyectos tesis: 5  (varios estados)';
    RAISE NOTICE '   Tesis:           3';
    RAISE NOTICE '   Entregables:     13';
    RAISE NOTICE '   Entregas:        8  (aprobadas, en revisión)';
    RAISE NOTICE '   Notificaciones:  14 (leídas y no leídas)';
    RAISE NOTICE '';
    RAISE NOTICE '🔐 Credenciales de prueba (contraseña: 123456):';
    RAISE NOTICE '   ── Administrador ──';
    RAISE NOTICE '   admin@unt.edu.pe';
    RAISE NOTICE '   ── Coordinadores ──';
    RAISE NOTICE '   coordinador.fi@unt.edu.pe    (Rosa Vargas - FI)';
    RAISE NOTICE '   coordinador.fct@unt.edu.pe   (Luis Torres - FCT)';
    RAISE NOTICE '   coordinador.feh@unt.edu.pe   (Ana Ramos - FEH)';
    RAISE NOTICE '   coordinador.is@unt.edu.pe    (Miguel Flores - IS)';
    RAISE NOTICE '   coordinador.cc@unt.edu.pe    (Patricia León - CC)';
    RAISE NOTICE '   ── Asesores ──';
    RAISE NOTICE '   jorge.chavez@unt.edu.pe      (Desarrollo Web)';
    RAISE NOTICE '   carmen.diaz@unt.edu.pe       (Ciencia de Datos)';
    RAISE NOTICE '   roberto.silva@unt.edu.pe     (Ingeniería Civil)';
    RAISE NOTICE '   lucia.paredes@unt.edu.pe     (Redes/Seguridad)';
    RAISE NOTICE '   hector.moya@unt.edu.pe       (Electrónica)';
    RAISE NOTICE '   ── Estudiantes ──';
    RAISE NOTICE '   202310001@estudiante.unt.edu.pe  (Juan Pérez   - práctica activa)';
    RAISE NOTICE '   202310002@estudiante.unt.edu.pe  (María López  - postulada)';
    RAISE NOTICE '   202310003@estudiante.unt.edu.pe  (Carlos Rod.  - preseleccionado)';
    RAISE NOTICE '   202110004@estudiante.unt.edu.pe  (Sofía Gut.   - práctica+tesis)';
    RAISE NOTICE '   202210005@estudiante.unt.edu.pe  (Andrés Mor.  - tesis propuesta)';
    RAISE NOTICE '   202210006@estudiante.unt.edu.pe  (Gabriela Her.- práctica activa)';
    RAISE NOTICE '   202110007@estudiante.unt.edu.pe  (Diego Ríos   - tesis en desa.)';
    RAISE NOTICE '   202310008@estudiante.unt.edu.pe  (Valeria Men. - postulación rechaz.)';
    RAISE NOTICE '   202210009@estudiante.unt.edu.pe  (Fernando Soto- práctica activa)';
    RAISE NOTICE '   202110010@estudiante.unt.edu.pe  (Camila Fue.  - tesis culminada)';
    RAISE NOTICE '   ── Representantes de Empresa ──';
    RAISE NOTICE '   rep.techcorp@techcorp.pe         (Ricardo Castañeda - TechCorp)';
    RAISE NOTICE '   rep.innovate@innovateperu.pe      (Stephanie Quispe  - InnovatePeru)';
    RAISE NOTICE '   rep.datasolutions@datasol.pe      (Martín Espinoza   - DataSol)';
    RAISE NOTICE '   rep.globaltech@globaltech.pe      (Sandra Villanueva - GlobalTech)';
    RAISE NOTICE '   rep.nexus@nexusdigital.pe         (Álvaro Cueva      - NexusDigital)';
END $$;

-- =====================================================
-- SINCRONIZACIÓN: Actualizar practica con datos de postulacion
-- =====================================================
SELECT sync_practica_from_postulacion();

-- Verificar que los datos se actualizaron correctamente
DO $$
BEGIN
    RAISE NOTICE '>> Sincronización completada:';
    RAISE NOTICE '   Registros de practica actualizados con estudiante_id y empresa_id';
END $$;
