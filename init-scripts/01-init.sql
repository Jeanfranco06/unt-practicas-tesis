-- =====================================================
-- SISTEMA DE GESTIÓN DE PRÁCTICAS Y TESIS - UNT
-- Script completo de creación de esquema PostgreSQL
-- =====================================================

-- Extensión para UUID si se requiere (opcional, pero recomendada)
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
-- TABLA: USUARIO
-- =====================================================
CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    contrasena_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100) NOT NULL,
    rol rol_usuario NOT NULL,
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE usuario IS 'Usuarios del sistema con roles y credenciales';
COMMENT ON COLUMN usuario.email IS 'Correo institucional o personal, utilizado como identificador único';
COMMENT ON COLUMN usuario.activo IS 'Permite deshabilitar usuarios sin eliminar registros históricos';

-- Índices para búsquedas frecuentes
CREATE INDEX idx_usuario_email ON usuario(email);
CREATE INDEX idx_usuario_rol ON usuario(rol);
CREATE INDEX idx_usuario_activo ON usuario(activo);

-- =====================================================
-- TABLA: ESTUDIANTE
-- =====================================================
CREATE TABLE estudiante (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL UNIQUE,
    codigo_universitario VARCHAR(20) NOT NULL UNIQUE,
    anio_ingreso INTEGER NOT NULL,
    escuela_profesional VARCHAR(100) NOT NULL,
    expediente_academico_url VARCHAR(500),
    promedio_general NUMERIC(4,2),
    creditos_aprobados INTEGER DEFAULT 0,
    CONSTRAINT fk_estudiante_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE RESTRICT,
    CONSTRAINT chk_anio_ingreso CHECK (anio_ingreso BETWEEN 1900 AND EXTRACT(YEAR FROM CURRENT_DATE))
);
COMMENT ON TABLE estudiante IS 'Datos específicos del estudiante, adicionales a la tabla usuario';
COMMENT ON COLUMN estudiante.codigo_universitario IS 'Código único asignado por la universidad';
COMMENT ON COLUMN estudiante.expediente_academico_url IS 'URL al documento de expediente en el sistema de almacenamiento';

CREATE INDEX idx_estudiante_codigo ON estudiante(codigo_universitario);
CREATE INDEX idx_estudiante_escuela ON estudiante(escuela_profesional);

-- =====================================================
-- TABLA: EMPRESA
-- =====================================================
CREATE TABLE empresa (
    id SERIAL PRIMARY KEY,
    ruc VARCHAR(11) NOT NULL UNIQUE,
    razon_social VARCHAR(200) NOT NULL,
    nombre_comercial VARCHAR(200),
    direccion TEXT,
    telefono VARCHAR(20),
    email_contacto VARCHAR(255),
    representante_nombre VARCHAR(200),
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE empresa IS 'Empresas que ofrecen prácticas preprofesionales';
COMMENT ON COLUMN empresa.ruc IS 'Número de RUC válido en Perú (11 dígitos)';

CREATE INDEX idx_empresa_ruc ON empresa(ruc);
CREATE INDEX idx_empresa_razon_social ON empresa(razon_social);

-- =====================================================
-- TABLA: CONVENIO
-- =====================================================
CREATE TABLE convenio (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL,
    tipo tipo_convenio NOT NULL,
    objeto_contrato TEXT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    estado estado_convenio DEFAULT 'vigente',
    documento_url VARCHAR(500),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_convenio_empresa FOREIGN KEY (empresa_id) REFERENCES empresa(id) ON DELETE CASCADE,
    CONSTRAINT chk_fechas_convenio CHECK (fecha_vencimiento >= fecha_inicio)
);
COMMENT ON TABLE convenio IS 'Convenios marco y específicos con empresas';
COMMENT ON COLUMN convenio.estado IS 'Vigente, vencido o renovado';

CREATE INDEX idx_convenio_empresa ON convenio(empresa_id);
CREATE INDEX idx_convenio_fecha_vencimiento ON convenio(fecha_vencimiento) WHERE estado = 'vigente';
CREATE INDEX idx_convenio_estado ON convenio(estado);

-- =====================================================
-- TABLA: OFERTA_PRACTICA
-- =====================================================
CREATE TABLE oferta_practica (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL,
    convenio_id INTEGER,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    requisitos TEXT NOT NULL,
    fecha_inicio_postulacion DATE NOT NULL,
    fecha_fin_postulacion DATE NOT NULL,
    fecha_inicio_practica DATE NOT NULL,
    fecha_fin_practica DATE NOT NULL,
    cupos INTEGER NOT NULL,
    estado estado_oferta DEFAULT 'borrador',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_oferta_empresa FOREIGN KEY (empresa_id) REFERENCES empresa(id) ON DELETE CASCADE,
    CONSTRAINT fk_oferta_convenio FOREIGN KEY (convenio_id) REFERENCES convenio(id) ON DELETE SET NULL,
    CONSTRAINT chk_fechas_oferta CHECK (
        fecha_fin_postulacion >= fecha_inicio_postulacion AND
        fecha_inicio_practica >= fecha_fin_postulacion AND
        fecha_fin_practica >= fecha_inicio_practica
    ),
    CONSTRAINT chk_cupos CHECK (cupos > 0)
);
COMMENT ON TABLE oferta_practica IS 'Ofertas de prácticas publicadas por empresas';
COMMENT ON COLUMN oferta_practica.convenio_id IS 'Opcional: si la oferta se rige por un convenio específico';

CREATE INDEX idx_oferta_empresa ON oferta_practica(empresa_id);
CREATE INDEX idx_oferta_fechas ON oferta_practica(fecha_inicio_postulacion, fecha_fin_postulacion);
CREATE INDEX idx_oferta_estado ON oferta_practica(estado);

-- =====================================================
-- TABLA: POSTULACION
-- =====================================================
CREATE TABLE postulacion (
    id SERIAL PRIMARY KEY,
    oferta_id INTEGER NOT NULL,
    estudiante_id INTEGER NOT NULL,
    documento_cv_url VARCHAR(500),
    carta_presentacion TEXT,
    estado estado_postulacion DEFAULT 'postulado',
    fecha_postulacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_revision TIMESTAMP,
    revisado_por INTEGER,
    CONSTRAINT fk_postulacion_oferta FOREIGN KEY (oferta_id) REFERENCES oferta_practica(id) ON DELETE CASCADE,
    CONSTRAINT fk_postulacion_estudiante FOREIGN KEY (estudiante_id) REFERENCES estudiante(id) ON DELETE CASCADE,
    CONSTRAINT fk_postulacion_revisor FOREIGN KEY (revisado_por) REFERENCES usuario(id) ON DELETE SET NULL,
    CONSTRAINT unique_postulacion_estudiante_oferta UNIQUE (estudiante_id, oferta_id)
);
COMMENT ON TABLE postulacion IS 'Postulación de un estudiante a una oferta de práctica';
COMMENT ON COLUMN postulacion.revisado_por IS 'Coordinador que revisó la postulación';

CREATE INDEX idx_postulacion_oferta ON postulacion(oferta_id);
CREATE INDEX idx_postulacion_estudiante ON postulacion(estudiante_id);
CREATE INDEX idx_postulacion_estado ON postulacion(estado);
CREATE INDEX idx_postulacion_fecha ON postulacion(fecha_postulacion);

-- =====================================================
-- TABLA: PRACTICA
-- =====================================================
CREATE TABLE practica (
    id SERIAL PRIMARY KEY,
    postulacion_id INTEGER NOT NULL UNIQUE,
    estudiante_id INTEGER NOT NULL,
    empresa_id INTEGER NOT NULL,
    asesor_academico_id INTEGER NOT NULL,
    asesor_empresa_nombre VARCHAR(200) NOT NULL,
    horas_totales_requeridas INTEGER NOT NULL,
    horas_completadas INTEGER DEFAULT 0,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado estado_practica DEFAULT 'pendiente_asignacion',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_practica_postulacion FOREIGN KEY (postulacion_id) REFERENCES postulacion(id) ON DELETE RESTRICT,
    CONSTRAINT fk_practica_estudiante FOREIGN KEY (estudiante_id) REFERENCES estudiante(id) ON DELETE RESTRICT,
    CONSTRAINT fk_practica_empresa FOREIGN KEY (empresa_id) REFERENCES empresa(id) ON DELETE RESTRICT,
    CONSTRAINT fk_practica_asesor FOREIGN KEY (asesor_academico_id) REFERENCES usuario(id) ON DELETE RESTRICT,
    CONSTRAINT chk_horas CHECK (horas_totales_requeridas > 0 AND horas_completadas >= 0 AND horas_completadas <= horas_totales_requeridas),
    CONSTRAINT chk_fechas_practica CHECK (fecha_fin >= fecha_inicio)
);
COMMENT ON TABLE practica IS 'Práctica activa generada a partir de una postulación aprobada';
COMMENT ON COLUMN practica.asesor_academico_id IS 'Docente asignado como asesor de la práctica';
COMMENT ON COLUMN practica.asesor_empresa_nombre IS 'Nombre del contacto en la empresa que supervisa';

CREATE INDEX idx_practica_estudiante ON practica(estudiante_id);
CREATE INDEX idx_practica_asesor ON practica(asesor_academico_id);
CREATE INDEX idx_practica_estado ON practica(estado);
CREATE INDEX idx_practica_fechas ON practica(fecha_inicio, fecha_fin);

-- =====================================================
-- TABLA: SEGUIMIENTO_HORAS
-- =====================================================
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
    CONSTRAINT chk_horas_seguimiento CHECK (horas > 0 AND horas <= 12)  -- máx 12 horas por día
);
COMMENT ON TABLE seguimiento_horas IS 'Registro diario o semanal de horas de práctica';
COMMENT ON COLUMN seguimiento_horas.aprobado_empresa IS 'Aprobación por el representante de la empresa';
COMMENT ON COLUMN seguimiento_horas.aprobado_asesor IS 'Aprobación por el asesor académico';

CREATE INDEX idx_seguimiento_practica ON seguimiento_horas(practica_id);
CREATE INDEX idx_seguimiento_fecha ON seguimiento_horas(fecha_trabajada);
CREATE INDEX idx_seguimiento_aprobacion ON seguimiento_horas(aprobado_empresa, aprobado_asesor);

-- =====================================================
-- TABLA: INFORME_PRACTICA
-- =====================================================
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
    CONSTRAINT unique_informe_tipo_practica UNIQUE (practica_id, tipo)
);
COMMENT ON TABLE informe_practica IS 'Informes parcial y final de la práctica';

CREATE INDEX idx_informe_practica ON informe_practica(practica_id);
CREATE INDEX idx_informe_estado ON informe_practica(estado);

-- =====================================================
-- TABLA: EVALUACION_FINAL_PRACTICA
-- =====================================================
CREATE TABLE evaluacion_final_practica (
    id SERIAL PRIMARY KEY,
    practica_id INTEGER NOT NULL UNIQUE,
    calificacion_empresa INTEGER NOT NULL,
    calificacion_asesor INTEGER NOT NULL,
    retroalimentacion TEXT,
    fecha_evaluacion DATE NOT NULL DEFAULT CURRENT_DATE,
    apto BOOLEAN NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_evaluacion_practica FOREIGN KEY (practica_id) REFERENCES practica(id) ON DELETE CASCADE,
    CONSTRAINT chk_calificacion CHECK (calificacion_empresa BETWEEN 1 AND 5 AND calificacion_asesor BETWEEN 1 AND 5)
);
COMMENT ON TABLE evaluacion_final_practica IS 'Evaluación final de la práctica por ambas partes';

-- =====================================================
-- TABLA: PROYECTO_TESIS
-- =====================================================
CREATE TABLE proyecto_tesis (
    id SERIAL PRIMARY KEY,
    estudiante_id INTEGER NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    resumen TEXT NOT NULL,
    area_conocimiento VARCHAR(100) NOT NULL,
    estado estado_proyecto_tesis DEFAULT 'en_registro',
    fecha_registro DATE DEFAULT CURRENT_DATE,
    fecha_aprobacion DATE,
    CONSTRAINT fk_proyecto_estudiante FOREIGN KEY (estudiante_id) REFERENCES estudiante(id) ON DELETE CASCADE
);
COMMENT ON TABLE proyecto_tesis IS 'Proyecto de tesis registrado por el estudiante';
COMMENT ON COLUMN proyecto_tesis.fecha_aprobacion IS 'Fecha en que el proyecto fue aprobado por la facultad';

CREATE INDEX idx_proyecto_estudiante ON proyecto_tesis(estudiante_id);
CREATE INDEX idx_proyecto_estado ON proyecto_tesis(estado);
CREATE INDEX idx_proyecto_area ON proyecto_tesis(area_conocimiento);

-- =====================================================
-- TABLA: ASIGNACION_TESIS
-- =====================================================
CREATE TABLE asignacion_tesis (
    id SERIAL PRIMARY KEY,
    proyecto_id INTEGER NOT NULL,
    docente_id INTEGER NOT NULL,
    tipo tipo_asignacion_tesis NOT NULL,
    rol_especifico rol_jurado,  -- Solo para tipo = 'jurado'
    fecha_asignacion DATE DEFAULT CURRENT_DATE,
    activo BOOLEAN DEFAULT true,
    CONSTRAINT fk_asignacion_proyecto FOREIGN KEY (proyecto_id) REFERENCES proyecto_tesis(id) ON DELETE CASCADE,
    CONSTRAINT fk_asignacion_docente FOREIGN KEY (docente_id) REFERENCES usuario(id) ON DELETE RESTRICT,
    CONSTRAINT unique_asignacion_docente_proyecto UNIQUE (proyecto_id, docente_id, tipo)
);
COMMENT ON TABLE asignacion_tesis IS 'Asignación de asesor o jurado a un proyecto de tesis';
COMMENT ON COLUMN asignacion_tesis.rol_especifico IS 'Presidente, secretario o vocal solo cuando tipo=jurado';

CREATE INDEX idx_asignacion_proyecto ON asignacion_tesis(proyecto_id);
CREATE INDEX idx_asignacion_docente ON asignacion_tesis(docente_id);
CREATE INDEX idx_asignacion_activo ON asignacion_tesis(activo) WHERE activo = true;

-- =====================================================
-- TABLA: ENTREGABLE_TESIS
-- =====================================================
CREATE TABLE entregable_tesis (
    id SERIAL PRIMARY KEY,
    proyecto_id INTEGER NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    fecha_limite DATE NOT NULL,
    orden INTEGER NOT NULL,
    documento_referencia_url VARCHAR(500),
    CONSTRAINT fk_entregable_proyecto FOREIGN KEY (proyecto_id) REFERENCES proyecto_tesis(id) ON DELETE CASCADE,
    CONSTRAINT unique_orden_entregable UNIQUE (proyecto_id, orden)
);
COMMENT ON TABLE entregable_tesis IS 'Entregables definidos para el desarrollo de la tesis (capítulos, avances, etc.)';

CREATE INDEX idx_entregable_proyecto ON entregable_tesis(proyecto_id);
CREATE INDEX idx_entregable_fecha_limite ON entregable_tesis(fecha_limite);

-- =====================================================
-- TABLA: ENTREGA_TESIS
-- =====================================================
CREATE TABLE entrega_tesis (
    id SERIAL PRIMARY KEY,
    entregable_id INTEGER NOT NULL,
    estudiante_id INTEGER NOT NULL,
    titulo_entrega VARCHAR(200) NOT NULL,
    documento_url VARCHAR(500) NOT NULL,
    comentario TEXT,
    fecha_entrega DATE NOT NULL DEFAULT CURRENT_DATE,
    estado estado_entrega_tesis DEFAULT 'entregado',
    retroalimentacion_docente TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_entrega_entregable FOREIGN KEY (entregable_id) REFERENCES entregable_tesis(id) ON DELETE CASCADE,
    CONSTRAINT fk_entrega_estudiante FOREIGN KEY (estudiante_id) REFERENCES estudiante(id) ON DELETE CASCADE,
    CONSTRAINT unique_entrega_entregable_estudiante UNIQUE (entregable_id, estudiante_id)
);
COMMENT ON TABLE entrega_tesis IS 'Entrega realizada por el estudiante de un entregable específico';

CREATE INDEX idx_entrega_entregable ON entrega_tesis(entregable_id);
CREATE INDEX idx_entrega_estudiante ON entrega_tesis(estudiante_id);
CREATE INDEX idx_entrega_estado ON entrega_tesis(estado);

-- =====================================================
-- TABLA: ACTA_SUSTENTACION
-- =====================================================
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
    CONSTRAINT fk_acta_proyecto FOREIGN KEY (proyecto_id) REFERENCES proyecto_tesis(id) ON DELETE CASCADE,
    CONSTRAINT chk_nota_sustentacion CHECK (nota_final BETWEEN 0 AND 20)
);
COMMENT ON TABLE acta_sustentacion IS 'Acta de sustentación de tesis';

CREATE INDEX idx_acta_proyecto ON acta_sustentacion(proyecto_id);
CREATE INDEX idx_acta_fecha ON acta_sustentacion(fecha_sustentacion);

-- =====================================================
-- TABLA: NOTIFICACION
-- =====================================================
CREATE TABLE notificacion (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo tipo_notificacion DEFAULT 'info',
    leido BOOLEAN DEFAULT false,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notificacion_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
);
COMMENT ON TABLE notificacion IS 'Notificaciones internas para los usuarios';

CREATE INDEX idx_notificacion_usuario ON notificacion(usuario_id);
CREATE INDEX idx_notificacion_leido ON notificacion(leido) WHERE leido = false;
CREATE INDEX idx_notificacion_creado ON notificacion(creado_en DESC);

-- =====================================================
-- TABLA: ARCHIVO_ADJUNTO (polimórfica)
-- =====================================================
CREATE TABLE archivo_adjunto (
    id SERIAL PRIMARY KEY,
    entidad_id INTEGER NOT NULL,
    entidad_tipo entidad_adjunto NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    url_storage VARCHAR(500) NOT NULL,
    tamano_bytes INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    subido_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE archivo_adjunto IS 'Almacenamiento polimórfico de archivos adjuntos a diferentes entidades';
COMMENT ON COLUMN archivo_adjunto.entidad_tipo IS 'Tipo de entidad asociada: practica, informe, entrega_tesis, acta, convenio';

CREATE INDEX idx_adjunto_entidad ON archivo_adjunto(entidad_tipo, entidad_id);

-- =====================================================
-- TABLA: AUDITORIA
-- =====================================================
CREATE TABLE auditoria (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER,
    accion VARCHAR(100) NOT NULL,
    entidad_afectada VARCHAR(100) NOT NULL,
    entidad_id INTEGER NOT NULL,
    datos_previos JSONB,
    datos_nuevos JSONB,
    ip_origen INET,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_auditoria_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE SET NULL
);
COMMENT ON TABLE auditoria IS 'Registro de auditoría para trazabilidad de cambios críticos';

CREATE INDEX idx_auditoria_usuario ON auditoria(usuario_id);
CREATE INDEX idx_auditoria_entidad ON auditoria(entidad_afectada, entidad_id);
CREATE INDEX idx_auditoria_creado ON auditoria(creado_en DESC);

-- =====================================================
-- FUNCIÓN para actualizar automáticamente 'actualizado_en'
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a la tabla usuario
CREATE TRIGGER trigger_usuario_updated
    BEFORE UPDATE ON usuario
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMENTARIOS ADICIONALES SOBRE CONSTRAINTS
-- =====================================================
COMMENT ON CONSTRAINT unique_postulacion_estudiante_oferta ON postulacion IS 'Un estudiante solo puede postular una vez por oferta';
COMMENT ON CONSTRAINT unique_informe_tipo_practica ON informe_practica IS 'Solo un informe parcial y un informe final por práctica';
COMMENT ON CONSTRAINT unique_entrega_entregable_estudiante ON entrega_tesis IS 'Un estudiante solo puede entregar una vez por entregable';