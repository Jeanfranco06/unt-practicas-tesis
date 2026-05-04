-- Script para corregir codificación de caracteres (UTF-8 mal interpretado)
-- Ejecutar después de verificar que PostgreSQL está en UTF8

-- =====================================================
-- CORREGIR FACULTADES
-- =====================================================
UPDATE facultad SET nombre = REPLACE(nombre, 'IngenierÃ\xada', 'Ingeniería') WHERE nombre LIKE '%IngenierÃ%';
UPDATE facultad SET nombre = REPLACE(nombre, 'TecnologÃ\xada', 'Tecnología') WHERE nombre LIKE '%TecnologÃ%';
UPDATE facultad SET nombre = REPLACE(nombre, 'EducaciÃ³n', 'Educación') WHERE nombre LIKE '%EducaciÃ³n%';
UPDATE facultad SET descripcion = REPLACE(descripcion, 'IngenierÃ\xada', 'Ingeniería') WHERE descripcion LIKE '%IngenierÃ%';
UPDATE facultad SET descripcion = REPLACE(descripcion, 'TecnologÃ\xada', 'Tecnología') WHERE descripcion LIKE '%TecnologÃ%';
UPDATE facultad SET descripcion = REPLACE(descripcion, 'EducaciÃ³n', 'Educación') WHERE descripcion LIKE '%EducaciÃ³n%';

-- =====================================================
-- CORREGIR CARRERAS
-- =====================================================
UPDATE carrera SET nombre = REPLACE(nombre, 'IngenierÃ\xada de Sistemas', 'Ingeniería de Sistemas') WHERE nombre LIKE '%IngenierÃ\xada de Sistemas%';
UPDATE carrera SET nombre = REPLACE(nombre, 'IngenierÃ\xada Civil', 'Ingeniería Civil') WHERE nombre LIKE '%IngenierÃ\xada Civil%';
UPDATE carrera SET nombre = REPLACE(nombre, 'IngenierÃ\xada ElectrÃ³nica', 'Ingeniería Electrónica') WHERE nombre LIKE '%IngenierÃ\xada Electr%';
UPDATE carrera SET nombre = REPLACE(nombre, 'IngenierÃ\xada', 'Ingeniería') WHERE nombre LIKE '%IngenierÃ\xada%';
UPDATE carrera SET nombre = REPLACE(nombre, 'ElectrÃ³nica', 'Electrónica') WHERE nombre LIKE '%ElectrÃ³nica%';
UPDATE carrera SET nombre = REPLACE(nombre, 'GestiÃ³n', 'Gestión') WHERE nombre LIKE '%GestiÃ³n%';
UPDATE carrera SET nombre = REPLACE(nombre, 'AdministraciÃ³n', 'Administración') WHERE nombre LIKE '%AdministraciÃ³n%';
UPDATE carrera SET nombre = REPLACE(nombre, 'MecÃ¡nica', 'Mecánica') WHERE nombre LIKE '%MecÃ¡nica%';
UPDATE carrera SET nombre = REPLACE(nombre, 'AutomÃ¡tica', 'Automática') WHERE nombre LIKE '%AutomÃ¡tica%';
UPDATE carrera SET nombre = REPLACE(nombre, 'QuÃ\xadmica', 'Química') WHERE nombre LIKE '%QuÃ\xadmica%';
UPDATE carrera SET nombre = REPLACE(nombre, 'MatemÃ¡tica', 'Matemática') WHERE nombre LIKE '%MatemÃ¡tica%';
UPDATE carrera SET nombre = REPLACE(nombre, 'EstadÃ\xadstica', 'Estadística') WHERE nombre LIKE '%EstadÃ\xadstica%';
UPDATE carrera SET nombre = REPLACE(nombre, 'ComputaciÃ³n', 'Computación') WHERE nombre LIKE '%ComputaciÃ³n%';
UPDATE carrera SET nombre = REPLACE(nombre, 'EducaciÃ³n', 'Educación') WHERE nombre LIKE '%EducaciÃ³n%';
UPDATE carrera SET nombre = REPLACE(nombre, 'CiÃ©ncia', 'Ciencia') WHERE nombre LIKE '%CiÃ©ncia%';
UPDATE carrera SET nombre = REPLACE(nombre, 'FÃ\xadsica', 'Física') WHERE nombre LIKE '%FÃ\xadsica%';

UPDATE carrera SET descripcion = REPLACE(descripcion, 'IngenierÃ\xada', 'Ingeniería') WHERE descripcion LIKE '%IngenierÃ\xada%';
UPDATE carrera SET descripcion = REPLACE(descripcion, 'ElectrÃ³nica', 'Electrónica') WHERE descripcion LIKE '%ElectrÃ³nica%';
UPDATE carrera SET descripcion = REPLACE(descripcion, 'ComputaciÃ³n', 'Computación') WHERE descripcion LIKE '%ComputaciÃ³n%';
UPDATE carrera SET descripcion = REPLACE(descripcion, 'EducaciÃ³n', 'Educación') WHERE descripcion LIKE '%EducaciÃ³n%';

-- =====================================================
-- CORREGIR USUARIOS
-- =====================================================
UPDATE usuario SET nombre = REPLACE(nombre, 'JosÃ©', 'José') WHERE nombre LIKE '%JosÃ©%';
UPDATE usuario SET nombre = REPLACE(nombre, 'MarÃ\xada', 'María') WHERE nombre LIKE '%MarÃ\xada%';
UPDATE usuario SET nombre = REPLACE(nombre, 'AndrÃ©s', 'Andrés') WHERE nombre LIKE '%AndrÃ©s%';
UPDATE usuario SET nombre = REPLACE(nombre, 'RaÃºl', 'Raúl') WHERE nombre LIKE '%RaÃºl%';
UPDATE usuario SET nombre = REPLACE(nombre, 'CÃ©sar', 'César') WHERE nombre LIKE '%CÃ©sar%';
UPDATE usuario SET nombre = REPLACE(nombre, 'MÃ¡ximo', 'Máximo') WHERE nombre LIKE '%MÃ¡ximo%';
UPDATE usuario SET nombre = REPLACE(nombre, 'MÃ\xadsimo', 'Mínimo') WHERE nombre LIKE '%MÃ\xadsimo%';

UPDATE usuario SET apellido_paterno = REPLACE(apellido_paterno, 'GarcÃ\xada', 'García') WHERE apellido_paterno LIKE '%GarcÃ\xada%';
UPDATE usuario SET apellido_paterno = REPLACE(apellido_paterno, 'GonzÃ¡lez', 'González') WHERE apellido_paterno LIKE '%GonzÃ¡lez%';
UPDATE usuario SET apellido_paterno = REPLACE(apellido_paterno, 'MÃ¡rquez', 'Márquez') WHERE apellido_paterno LIKE '%MÃ¡rquez%';
UPDATE usuario SET apellido_paterno = REPLACE(apellido_paterno, 'NÃºÃ±ez', 'Núñez') WHERE apellido_paterno LIKE '%NÃºÃ±ez%';
UPDATE usuario SET apellido_paterno = REPLACE(apellido_paterno, 'FernÃ¡ndez', 'Fernández') WHERE apellido_paterno LIKE '%FernÃ¡ndez%';
UPDATE usuario SET apellido_paterno = REPLACE(apellido_paterno, 'RodrÃ\xadguez', 'Rodríguez') WHERE apellido_paterno LIKE '%RodrÃ\xadguez%';
UPDATE usuario SET apellido_paterno = REPLACE(apellido_paterno, 'PÃ©rez', 'Pérez') WHERE apellido_paterno LIKE '%PÃ©rez%';
UPDATE usuario SET apellido_paterno = REPLACE(apellido_paterno, 'MÃ©ndez', 'Méndez') WHERE apellido_paterno LIKE '%MÃ©ndez%';
UPDATE usuario SET apellido_paterno = REPLACE(apellido_paterno, 'SÃ¡nchez', 'Sánchez') WHERE apellido_paterno LIKE '%SÃ¡nchez%';

UPDATE usuario SET apellido_materno = REPLACE(apellido_materno, 'GarcÃ\xada', 'García') WHERE apellido_materno LIKE '%GarcÃ\xada%';
UPDATE usuario SET apellido_materno = REPLACE(apellido_materno, 'GonzÃ¡lez', 'González') WHERE apellido_materno LIKE '%GonzÃ¡lez%';
UPDATE usuario SET apellido_materno = REPLACE(apellido_materno, 'MÃ¡rquez', 'Márquez') WHERE apellido_materno LIKE '%MÃ¡rquez%';
UPDATE usuario SET apellido_materno = REPLACE(apellido_materno, 'NÃºÃ±ez', 'Núñez') WHERE apellido_materno LIKE '%NÃºÃ±ez%';
UPDATE usuario SET apellido_materno = REPLACE(apellido_materno, 'FernÃ¡ndez', 'Fernández') WHERE apellido_materno LIKE '%FernÃ¡ndez%';
UPDATE usuario SET apellido_materno = REPLACE(apellido_materno, 'RodrÃ\xadguez', 'Rodríguez') WHERE apellido_materno LIKE '%RodrÃ\xadguez%';
UPDATE usuario SET apellido_materno = REPLACE(apellido_materno, 'PÃ©rez', 'Pérez') WHERE apellido_materno LIKE '%PÃ©rez%';
UPDATE usuario SET apellido_materno = REPLACE(apellido_materno, 'MÃ©ndez', 'Méndez') WHERE apellido_materno LIKE '%MÃ©ndez%';
UPDATE usuario SET apellido_materno = REPLACE(apellido_materno, 'SÃ¡nchez', 'Sánchez') WHERE apellido_materno LIKE '%SÃ¡nchez%';

-- =====================================================
-- CORREGIR ESTUDIANTES (escuela_profesional)
-- =====================================================
UPDATE estudiante SET escuela_profesional = REPLACE(escuela_profesional, 'Escuela de IngenierÃ\xada', 'Escuela de Ingeniería') WHERE escuela_profesional LIKE '%IngenierÃ\xada%';
UPDATE estudiante SET escuela_profesional = REPLACE(escuela_profesional, 'Escuela de IngenierÃ\xada de Sistemas', 'Escuela de Ingeniería de Sistemas') WHERE escuela_profesional LIKE '%IngenierÃ\xada de Sistemas%';
UPDATE estudiante SET escuela_profesional = REPLACE(escuela_profesional, 'IngenierÃ\xada', 'Ingeniería') WHERE escuela_profesional LIKE '%IngenierÃ\xada%';
UPDATE estudiante SET escuela_profesional = REPLACE(escuela_profesional, 'ElectrÃ³nica', 'Electrónica') WHERE escuela_profesional LIKE '%ElectrÃ³nica%';
UPDATE estudiante SET escuela_profesional = REPLACE(escuela_profesional, 'ComputaciÃ³n', 'Computación') WHERE escuela_profesional LIKE '%ComputaciÃ³n%';
UPDATE estudiante SET escuela_profesional = REPLACE(escuela_profesional, 'EducaciÃ³n', 'Educación') WHERE escuela_profesional LIKE '%EducaciÃ³n%';
UPDATE estudiante SET escuela_profesional = REPLACE(escuela_profesional, 'TecnologÃ\xada', 'Tecnología') WHERE escuela_profesional LIKE '%TecnologÃ\xada%';

-- =====================================================
-- CORREGIR EMPRESAS
-- =====================================================
UPDATE empresa SET razon_social = REPLACE(razon_social, 'TecnologÃ\xada', 'Tecnología') WHERE razon_social LIKE '%TecnologÃ\xada%';
UPDATE empresa SET nombre_comercial = REPLACE(nombre_comercial, 'TecnologÃ\xada', 'Tecnología') WHERE nombre_comercial LIKE '%TecnologÃ\xada%';

-- =====================================================
-- CORREGIR ROLES
-- =====================================================
UPDATE rol SET nombre = REPLACE(nombre, 'RepresentanteEmpresa', 'RepresentanteEmpresa') WHERE nombre LIKE '%Representante%';
UPDATE rol SET descripcion = REPLACE(descripcion, 'prÃ¡cticas', 'prácticas') WHERE descripcion LIKE '%prÃ¡cticas%';
UPDATE rol SET descripcion = REPLACE(descripcion, 'tesis', 'tesis') WHERE descripcion LIKE '%tesis%';

-- =====================================================
-- CORREGIR DOCENTES
-- =====================================================
UPDATE docente SET especialidad = REPLACE(especialidad, 'IngenierÃ\xada', 'Ingeniería') WHERE especialidad LIKE '%IngenierÃ\xada%';
UPDATE docente SET especialidad = REPLACE(especialidad, 'ComputaciÃ³n', 'Computación') WHERE especialidad LIKE '%ComputaciÃ³n%';
UPDATE docente SET especialidad = REPLACE(especialidad, 'ElectrÃ³nica', 'Electrónica') WHERE especialidad LIKE '%ElectrÃ³nica%';
UPDATE docente SET categoria = REPLACE(categoria, 'Asistente', 'Asistente') WHERE categoria LIKE '%Asistente%';
UPDATE docente SET dedicacion = REPLACE(dedicacion, 'Tiempo Completo', 'Tiempo Completo') WHERE dedicacion LIKE '%Tiempo%';

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- Verificar correcciones
SELECT 'Facultades:' as tabla, nombre FROM facultad;
SELECT 'Carreras:' as tabla, nombre FROM carrera;
SELECT 'Estudiantes:' as tabla, escuela_profesional FROM estudiante LIMIT 5;

