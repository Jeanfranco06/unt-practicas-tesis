-- =====================================================
-- SISTEMA DE GESTIÓN DE PRÁCTICAS Y TESIS - UNT
-- Schema Completo Consolidado - Versión 2.0
-- =====================================================
-- Este archivo contiene todo el esquema inicial + migraciones
-- Instrucciones de uso:
--   1. Ejecutar este archivo completo (incluye CREATE DATABASE)
--   2. Luego ejecutar 03-test-data.sql para datos de prueba
-- =====================================================

-- Crear base de datos si no existe (ejecutar conectado a postgres)
-- Usar template0 para evitar conflictos de collation con la BD template1
CREATE DATABASE unt_practicas_tesis
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Spanish_Spain.1252'
    LC_CTYPE = 'Spanish_Spain.1252'
    TEMPLATE = template0
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Conectar a la base de datos creada (usar \c en psql o conectarse directamente)
\c unt_practicas_tesis

SET client_encoding = 'UTF8';
SET server_encoding = 'UTF8';

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS (tipos enumerados)
-- =====================================================

CREATE TYPE rol_usuario AS ENUM ('Administrador', 'Coordinador', 'Asesor', 'Estudiante', 'RepresentanteEmpresa');
CREATE TYPE tipo_convenio AS ENUM ('marco', 'especifico');
CREATE TYPE estado_convenio AS ENUM ('vigente', 'vencido', 'renovado');
CREATE TYPE estado_oferta AS ENUM ('borrador', 'publicada', 'cerrada', 'cancelada');
CREATE TYPE estado_postulacion AS ENUM ('postulado', 'preseleccionado', 'rechazado', 'aprobado');
CREATE TYPE estado_practica AS ENUM ('pendiente_asignacion', 'activa', 'en_evaluacion', 'finalizada', 'cancelada');
CREATE TYPE practica_origen AS ENUM ('institucional', 'externa');
CREATE TYPE tipo_informe_practica AS ENUM ('parcial', 'final');
CREATE TYPE estado_informe AS ENUM ('pendiente', 'aprobado', 'observado');
CREATE TYPE estado_proyecto_tesis AS ENUM ('en_registro', 'propuesto', 'aprobado', 'en_desarrollo', 'en_revision', 'culminado', 'desaprobado');
CREATE TYPE tipo_asignacion_tesis AS ENUM ('asesor', 'jurado');
CREATE TYPE rol_jurado AS ENUM ('presidente', 'secretario', 'vocal');
CREATE TYPE estado_entrega_tesis AS ENUM ('entregado', 'revisando', 'aprobado', 'observado');
CREATE TYPE resultado_sustentacion AS ENUM ('aprobado', 'desaprobado');
CREATE TYPE tipo_notificacion AS ENUM ('info', 'exito', 'advertencia', 'error');
CREATE TYPE entidad_adjunto AS ENUM ('practica', 'informe', 'entrega_tesis', 'acta', 'convenio');

-- =====================================================
-- TABLAS CORE
-- =====================================================

CREATE TABLE rol (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE facultad (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL UNIQUE,
    codigo VARCHAR(10) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE carrera (
    id SERIAL PRIMARY KEY,
    facultad_id INTEGER NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    codigo VARCHAR(10) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_carrera_facultad FOREIGN KEY (facultad_id) REFERENCES facultad(id) ON DELETE RESTRICT,
    CONSTRAINT unique_carrera_facultad UNIQUE (facultad_id, codigo)
);

-- =====================================================
-- TABLA: USUARIO (con soporte para refresh_token y soft delete)
-- =====================================================
CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    email_recuperacion VARCHAR(255) NOT NULL,
    contrasena_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT true,
    refresh_token VARCHAR(255), -- Para renovación de sesiones segura
    refresh_token_expira TIMESTAMP,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    eliminado_en TIMESTAMP, -- Para soft delete
    eliminado BOOLEAN DEFAULT false
);

COMMENT ON TABLE usuario IS 'Usuarios del sistema con credenciales (roles separados)';
COMMENT ON COLUMN usuario.email IS 'Correo institucional generado automáticamente';
COMMENT ON COLUMN usuario.refresh_token IS 'Token para renovación de sesión segura';
COMMENT ON COLUMN usuario.eliminado IS 'Indica si el usuario fue eliminado lógicamente';

CREATE INDEX idx_usuario_email ON usuario(email);
CREATE INDEX idx_usuario_refresh_token ON usuario(refresh_token) WHERE refresh_token IS NOT NULL;
CREATE INDEX idx_usuario_eliminado ON usuario(eliminado) WHERE eliminado = false;

-- Tabla de roles de usuario (many-to-many)
CREATE TABLE usuario_rol (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    rol_id INTEGER NOT NULL,
    asignado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    asignado_por INTEGER,
    CONSTRAINT fk_usuario_rol_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,
    CONSTRAINT fk_usuario_rol_rol FOREIGN KEY (rol_id) REFERENCES rol(id) ON DELETE CASCADE,
    CONSTRAINT fk_usuario_rol_asignador FOREIGN KEY (asignado_por) REFERENCES usuario(id) ON DELETE SET NULL,
    CONSTRAINT unique_usuario_rol UNIQUE (usuario_id, rol_id)
);

-- =====================================================
-- TABLAS ESPECÍFICAS POR ROL
-- =====================================================

CREATE TABLE docente (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL UNIQUE,
    carrera_id INTEGER NOT NULL,
    especialidad VARCHAR(200),
    categoria VARCHAR(100),
    dedicacion VARCHAR(50),
    oficina VARCHAR(50),
    telefono VARCHAR(20),
    CONSTRAINT fk_docente_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,
    CONSTRAINT fk_docente_carrera FOREIGN KEY (carrera_id) REFERENCES carrera(id) ON DELETE RESTRICT
);

-- =====================================================
-- TABLA: ESTUDIANTE (con índice único en código)
-- =====================================================
CREATE TABLE estudiante (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL UNIQUE,
    codigo_universitario VARCHAR(20),
    anio_ingreso INTEGER NOT NULL,
    carrera_id INTEGER NOT NULL,
    escuela_profesional VARCHAR(100),
    expediente_academico_url VARCHAR(500),
    promedio_general NUMERIC(4,2),
    creditos_aprobados INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    CONSTRAINT fk_estudiante_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,
    CONSTRAINT fk_estudiante_carrera FOREIGN KEY (carrera_id) REFERENCES carrera(id) ON DELETE RESTRICT,
    CONSTRAINT chk_promedio CHECK (promedio_general IS NULL OR (promedio_general >= 0 AND promedio_general <= 20)),
    CONSTRAINT chk_anio CHECK (anio_ingreso > 1900 AND anio_ingreso <= 2100)
);

-- Índice único para código universitario
CREATE UNIQUE INDEX idx_estudiante_codigo_unico ON estudiante(codigo_universitario) WHERE codigo_universitario IS NOT NULL;

COMMENT ON TABLE estudiante IS 'Información académica específica de estudiantes';
COMMENT ON COLUMN estudiante.codigo_universitario IS 'Código único del estudiante - debe ser único en el sistema';

CREATE INDEX idx_estudiante_usuario ON estudiante(usuario_id);
CREATE INDEX idx_estudiante_carrera ON estudiante(carrera_id);

-- =====================================================
-- TABLA: EMPRESA
-- =====================================================
CREATE TABLE empresa (
    id SERIAL PRIMARY KEY,
    ruc VARCHAR(11) UNIQUE,
    razon_social VARCHAR(200) NOT NULL,
    nombre_comercial VARCHAR(200),
    direccion TEXT,
    telefono VARCHAR(20),
    email_contacto VARCHAR(255),
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE empresa IS 'Empresas colaboradoras en prácticas pre-profesionales';
COMMENT ON COLUMN empresa.ruc IS 'Registro Único de Contribuyentes (11 dígitos)';

CREATE INDEX idx_empresa_ruc ON empresa(ruc);
CREATE INDEX idx_empresa_activo ON empresa(activo);

CREATE TABLE representante_empresa (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL,
    usuario_id INTEGER NOT NULL UNIQUE,
    cargo VARCHAR(100),
    departamento VARCHAR(100),
    telefono_directo VARCHAR(20),
    es_principal BOOLEAN DEFAULT false,
    CONSTRAINT fk_representante_empresa FOREIGN KEY (empresa_id) REFERENCES empresa(id) ON DELETE CASCADE,
    CONSTRAINT fk_representante_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLAS DE PRÁCTICAS
-- =====================================================

CREATE TABLE convenio (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL,
    tipo tipo_convenio NOT NULL,
    numero_convenio VARCHAR(50) UNIQUE,
    fecha_inicio DATE NOT NULL,
    fecha_vencimiento DATE,
    estado estado_convenio DEFAULT 'vigente',
    objeto TEXT NOT NULL,
    condiciones TEXT,
    documento_url VARCHAR(500),
    renovable BOOLEAN DEFAULT false,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_convenio_empresa FOREIGN KEY (empresa_id) REFERENCES empresa(id) ON DELETE RESTRICT,
    CONSTRAINT chk_fechas_convenio CHECK (fecha_vencimiento IS NULL OR fecha_vencimiento > fecha_inicio)
);

COMMENT ON TABLE convenio IS 'Convenios marco y específicos con empresas';

CREATE INDEX idx_convenio_empresa ON convenio(empresa_id);
CREATE INDEX idx_convenio_estado ON convenio(estado);
CREATE INDEX idx_convenio_tipo ON convenio(tipo);

CREATE TABLE oferta_practica (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL,
    convenio_id INTEGER,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    requisitos TEXT,
    fecha_inicio_postulacion DATE NOT NULL,
    fecha_fin_postulacion DATE NOT NULL,
    fecha_inicio_practica DATE NOT NULL,
    fecha_fin_practica DATE NOT NULL,
    cupos INTEGER NOT NULL,
    horas_totales_requeridas INTEGER DEFAULT 400,
    estado estado_oferta DEFAULT 'borrador',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_oferta_empresa FOREIGN KEY (empresa_id) REFERENCES empresa(id) ON DELETE CASCADE,
    CONSTRAINT fk_oferta_convenio FOREIGN KEY (convenio_id) REFERENCES convenio(id) ON DELETE SET NULL,
    CONSTRAINT chk_cupos CHECK (cupos > 0),
    CONSTRAINT chk_fechas_postulacion CHECK (fecha_fin_postulacion > fecha_inicio_postulacion),
    CONSTRAINT chk_fechas_practica CHECK (fecha_fin_practica > fecha_inicio_practica)
);

CREATE INDEX idx_oferta_empresa ON oferta_practica(empresa_id);
CREATE INDEX idx_oferta_estado ON oferta_practica(estado);

CREATE TABLE postulacion (
    id SERIAL PRIMARY KEY,
    oferta_id INTEGER NOT NULL,
    estudiante_id INTEGER NOT NULL,
    cv_url VARCHAR(500),
    carta_presentacion TEXT,
    estado estado_postulacion DEFAULT 'postulado',
    fecha_postulacion DATE DEFAULT CURRENT_DATE,
    fecha_revision TIMESTAMP,
    revisado_por INTEGER,
    CONSTRAINT fk_postulacion_oferta FOREIGN KEY (oferta_id) REFERENCES oferta_practica(id) ON DELETE CASCADE,
    CONSTRAINT fk_postulacion_estudiante FOREIGN KEY (estudiante_id) REFERENCES estudiante(id) ON DELETE CASCADE,
    CONSTRAINT fk_postulacion_revisor FOREIGN KEY (revisado_por) REFERENCES usuario(id) ON DELETE SET NULL,
    CONSTRAINT unique_postulacion UNIQUE (oferta_id, estudiante_id)
);

CREATE INDEX idx_postulacion_oferta ON postulacion(oferta_id);
CREATE INDEX idx_postulacion_estudiante ON postulacion(estudiante_id);
CREATE INDEX idx_postulacion_estado ON postulacion(estado);

CREATE TABLE practica (
    id SERIAL PRIMARY KEY,
    postulacion_id INTEGER NOT NULL UNIQUE,
    estudiante_id INTEGER NOT NULL,
    empresa_id INTEGER NOT NULL,
    asesor_empresa_nombre VARCHAR(200),
    origen practica_origen DEFAULT 'institucional',
    cargo_supervisor VARCHAR(100),
    email_supervisor VARCHAR(100),
    telefono_supervisor VARCHAR(50),
    fecha_inicio DATE,
    fecha_fin DATE,
    horas_semanales INTEGER,
    horas_totales_requeridas INTEGER DEFAULT 400,
    horas_completadas INTEGER DEFAULT 0,
    estado estado_practica DEFAULT 'pendiente_asignacion',
    asesor_academico_id INTEGER,
    calificacion_final NUMERIC(4,2),
    observaciones_finales TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_practica_postulacion FOREIGN KEY (postulacion_id) REFERENCES postulacion(id) ON DELETE RESTRICT,
    CONSTRAINT fk_practica_estudiante FOREIGN KEY (estudiante_id) REFERENCES estudiante(id) ON DELETE RESTRICT,
    CONSTRAINT fk_practica_empresa FOREIGN KEY (empresa_id) REFERENCES empresa(id) ON DELETE RESTRICT,
    CONSTRAINT fk_practica_asesor FOREIGN KEY (asesor_academico_id) REFERENCES usuario(id) ON DELETE SET NULL,
    CONSTRAINT chk_horas_semanales CHECK (horas_semanales IS NULL OR (horas_semanales >= 20 AND horas_semanales <= 48)),
    CONSTRAINT chk_calificacion CHECK (calificacion_final IS NULL OR (calificacion_final >= 0 AND calificacion_final <= 20)),
    CONSTRAINT chk_fechas_practica CHECK (fecha_fin IS NULL OR fecha_fin > fecha_inicio)
);

CREATE INDEX idx_practica_postulacion ON practica(postulacion_id);
CREATE INDEX idx_practica_estudiante ON practica(estudiante_id);
CREATE INDEX idx_practica_empresa ON practica(empresa_id);
CREATE INDEX idx_practica_estado ON practica(estado);

CREATE TABLE seguimiento_horas (
    id SERIAL PRIMARY KEY,
    practica_id INTEGER NOT NULL,
    fecha_trabajada DATE NOT NULL,
    horas INTEGER NOT NULL,
    descripcion_actividad TEXT NOT NULL,
    evidencia_url VARCHAR(500),
    aprobado_empresa BOOLEAN DEFAULT false,
    aprobado_asesor BOOLEAN DEFAULT false,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_seguimiento_practica FOREIGN KEY (practica_id) REFERENCES practica(id) ON DELETE CASCADE,
    CONSTRAINT chk_horas_diarias CHECK (horas >= 1 AND horas <= 12),
    CONSTRAINT unique_seguimiento_fecha UNIQUE (practica_id, fecha_trabajada)
);

CREATE TABLE informe_practica (
    id SERIAL PRIMARY KEY,
    practica_id INTEGER NOT NULL,
    tipo tipo_informe_practica NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    contenido_resumen TEXT,
    documento_url VARCHAR(500),
    fecha_entrega DATE NOT NULL,
    estado estado_informe DEFAULT 'pendiente',
    comentario_asesor TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_informe_practica FOREIGN KEY (practica_id) REFERENCES practica(id) ON DELETE CASCADE,
    CONSTRAINT unique_informe_tipo UNIQUE (practica_id, tipo)
);

CREATE TABLE evaluacion_final_practica (
    id SERIAL PRIMARY KEY,
    practica_id INTEGER NOT NULL UNIQUE,
    calificacion_empresa INTEGER NOT NULL,
    calificacion_asesor INTEGER NOT NULL,
    retroalimentacion TEXT,
    fecha_evaluacion DATE DEFAULT CURRENT_DATE,
    apto BOOLEAN NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_evaluacion_practica FOREIGN KEY (practica_id) REFERENCES practica(id) ON DELETE CASCADE,
    CONSTRAINT chk_calif_empresa CHECK (calificacion_empresa >= 0 AND calificacion_empresa <= 20),
    CONSTRAINT chk_calif_asesor CHECK (calificacion_asesor >= 0 AND calificacion_asesor <= 20)
);

-- =====================================================
-- TABLAS DE TESIS
-- =====================================================

CREATE TABLE proyecto_tesis (
    id SERIAL PRIMARY KEY,
    estudiante_id INTEGER NOT NULL,
    titulo VARCHAR(300) NOT NULL,
    resumen TEXT NOT NULL,
    area_conocimiento VARCHAR(100) NOT NULL,
    palabras_clave TEXT,
    estado estado_proyecto_tesis DEFAULT 'en_registro',
    fecha_registro DATE DEFAULT CURRENT_DATE,
    fecha_aprobacion DATE,
    asesor_sugerido_id INTEGER,
    fecha_sugerencia_asesor TIMESTAMP,
    observaciones_coordinador TEXT,
    aprobado_por INTEGER,
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_proyecto_estudiante FOREIGN KEY (estudiante_id) REFERENCES estudiante(id) ON DELETE RESTRICT,
    CONSTRAINT fk_proyecto_aprobador FOREIGN KEY (aprobado_por) REFERENCES docente(id) ON DELETE SET NULL,
    CONSTRAINT fk_proyecto_asesor_sugerido FOREIGN KEY (asesor_sugerido_id) REFERENCES docente(id) ON DELETE SET NULL
);

CREATE TABLE tesis (
    id SERIAL PRIMARY KEY,
    proyecto_id INTEGER NOT NULL UNIQUE,
    estudiante_id INTEGER NOT NULL,
    titulo VARCHAR(300) NOT NULL,
    resumen TEXT NOT NULL,
    area_conocimiento VARCHAR(100) NOT NULL,
    estado estado_proyecto_tesis DEFAULT 'en_registro',
    fecha_registro DATE DEFAULT CURRENT_DATE,
    fecha_aprobacion DATE,
    fecha_sustentacion DATE,
    nota_final NUMERIC(5,2),
    resultado_sustentacion resultado_sustentacion,
    CONSTRAINT fk_tesis_proyecto FOREIGN KEY (proyecto_id) REFERENCES proyecto_tesis(id) ON DELETE CASCADE,
    CONSTRAINT fk_tesis_estudiante FOREIGN KEY (estudiante_id) REFERENCES estudiante(id) ON DELETE RESTRICT
);

CREATE TABLE asesor_tesis (
    id SERIAL PRIMARY KEY,
    tesis_id INTEGER NOT NULL,
    docente_id INTEGER NOT NULL,
    tipo_asignacion tipo_asignacion_tesis NOT NULL,
    rol_jurado rol_jurado,
    fecha_asignacion DATE DEFAULT CURRENT_DATE,
    activo BOOLEAN DEFAULT true,
    observaciones TEXT,
    CONSTRAINT fk_asesor_tesis FOREIGN KEY (tesis_id) REFERENCES tesis(id) ON DELETE CASCADE,
    CONSTRAINT fk_asesor_docente FOREIGN KEY (docente_id) REFERENCES docente(id) ON DELETE RESTRICT,
    CONSTRAINT chk_rol_jurado CHECK (
        (tipo_asignacion = 'asesor' AND rol_jurado IS NULL) OR
        (tipo_asignacion = 'jurado' AND rol_jurado IS NOT NULL)
    ),
    CONSTRAINT unique_asesor_tesis UNIQUE (tesis_id, docente_id)
);

CREATE TABLE entregable_tesis_mejorado (
    id SERIAL PRIMARY KEY,
    tesis_id INTEGER NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    fecha_limite DATE,
    obligatorio BOOLEAN DEFAULT true,
    orden INTEGER,
    documento_referencia_url VARCHAR(500),
    activo BOOLEAN DEFAULT true,
    CONSTRAINT fk_entregable_tesis FOREIGN KEY (tesis_id) REFERENCES tesis(id) ON DELETE CASCADE,
    CONSTRAINT unique_entregable_orden UNIQUE (tesis_id, orden)
);

CREATE TABLE entrega_tesis_mejorada (
    id SERIAL PRIMARY KEY,
    entregable_id INTEGER NOT NULL,
    estudiante_id INTEGER NOT NULL,
    titulo_entrega VARCHAR(200) NOT NULL,
    documento_url VARCHAR(500) NOT NULL,
    comentario TEXT,
    fecha_entrega DATE NOT NULL DEFAULT CURRENT_DATE,
    estado estado_entrega_tesis DEFAULT 'entregado',
    retroalimentacion_asesor TEXT,
    fecha_revision DATE,
    revisado_por INTEGER,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_entrega_entregable FOREIGN KEY (entregable_id) REFERENCES entregable_tesis_mejorado(id) ON DELETE CASCADE,
    CONSTRAINT fk_entrega_estudiante FOREIGN KEY (estudiante_id) REFERENCES estudiante(id) ON DELETE CASCADE,
    CONSTRAINT fk_entrega_revisor FOREIGN KEY (revisado_por) REFERENCES docente(id) ON DELETE SET NULL,
    CONSTRAINT unique_entrega_entregable_estudiante UNIQUE (entregable_id, estudiante_id)
);

CREATE TABLE acta_sustentacion (
    id SERIAL PRIMARY KEY,
    proyecto_id INTEGER NOT NULL UNIQUE,
    fecha_sustentacion DATE NOT NULL,
    hora_inicio VARCHAR(8) NOT NULL,
    hora_fin VARCHAR(8) NOT NULL,
    lugar VARCHAR(200) NOT NULL,
    nota_final NUMERIC(5,2) NOT NULL,
    resultado resultado_sustentacion NOT NULL,
    url_acta_firmada VARCHAR(500),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_acta_proyecto FOREIGN KEY (proyecto_id) REFERENCES proyecto_tesis(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLA: NOTIFICACIÓN
-- =====================================================
CREATE TABLE notificacion (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    tipo tipo_notificacion DEFAULT 'info',
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    leido BOOLEAN DEFAULT false,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archivada BOOLEAN DEFAULT false,
    prioridad VARCHAR(20) DEFAULT 'low',
    datos JSONB,
    entidad_referenciada VARCHAR(50),
    id_referenciado INTEGER,
    CONSTRAINT fk_notificacion_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
);

CREATE INDEX idx_notificacion_usuario ON notificacion(usuario_id);
CREATE INDEX idx_notificacion_leido ON notificacion(leido);
CREATE INDEX idx_notificacion_archivada ON notificacion(archivada);
CREATE INDEX idx_notificacion_creado_en ON notificacion(creado_en);

-- =====================================================
-- TABLA: ADJUNTO
-- =====================================================
CREATE TABLE adjunto (
    id SERIAL PRIMARY KEY,
    entidad entidad_adjunto NOT NULL,
    entidad_id INTEGER NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    tipo_mime VARCHAR(100),
    tamano_bytes INTEGER,
    ruta_archivo VARCHAR(500) NOT NULL,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subido_por INTEGER NOT NULL,
    CONSTRAINT fk_adjunto_usuario FOREIGN KEY (subido_por) REFERENCES usuario(id) ON DELETE RESTRICT
);

CREATE INDEX idx_adjunto_entidad ON adjunto(entidad, entidad_id);
CREATE INDEX idx_adjunto_usuario ON adjunto(subido_por);

-- =====================================================
-- TABLA: AUDITORÍA (Logs de operaciones críticas)
-- =====================================================
CREATE TABLE auditoria (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER,
    accion VARCHAR(50) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'
    entidad VARCHAR(50) NOT NULL, -- 'usuario', 'empresa', 'practica', etc.
    entidad_id INTEGER,
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE auditoria IS 'Registro de auditoría para operaciones críticas del sistema';

CREATE INDEX idx_auditoria_usuario ON auditoria(usuario_id);
CREATE INDEX idx_auditoria_entidad ON auditoria(entidad, entidad_id);
CREATE INDEX idx_auditoria_creado_en ON auditoria(creado_en);
CREATE INDEX idx_auditoria_accion ON auditoria(accion);

-- =====================================================
-- FUNCIONES AUXILIARES
-- =====================================================

-- Función para actualizar practica desde postulacion
CREATE OR REPLACE FUNCTION sync_practica_from_postulacion()
RETURNS void AS $$
BEGIN
    UPDATE practica p
    SET 
        estudiante_id = po.estudiante_id,
        empresa_id = of.empresa_id
    FROM postulacion po
    JOIN oferta_practica of ON of.id = po.oferta_id
    WHERE p.postulacion_id = po.id
      AND (p.estudiante_id IS NULL OR p.empresa_id IS NULL);
END;
$$ LANGUAGE plpgsql;

-- Función para normalizar texto
CREATE OR REPLACE FUNCTION normalize_text(texto TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(
        regexp_replace(
            regexp_replace(
                regexp_replace(
                    texto,
                    '[áàäâ]', 'a', 'g'
                ),
                '[éèëê]', 'e', 'g'
            ),
            '[íìïî]', 'i', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Función para generar email de estudiante
CREATE OR REPLACE FUNCTION generar_email_estudiante(codigo_universitario TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(codigo_universitario) || '@estudiante.unt.edu.pe';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- MENSAJE DE CONFIRMACIÓN
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Esquema completo creado exitosamente';
    RAISE NOTICE '📊 Tablas creadas: %', (
        SELECT count(*) FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
    );
END $$;

COMMIT;
