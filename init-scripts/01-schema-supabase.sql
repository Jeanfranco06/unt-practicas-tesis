-- =====================================================
-- SISTEMA DE GESTIÓN DE PRÁCTICAS Y TESIS - UNT
-- Schema Completo — Versión Supabase 2.0
-- =====================================================
-- INSTRUCCIONES:
--   1. Pegar y ejecutar este archivo en el SQL Editor de Supabase.
--   2. Luego ejecutar 02-datos-demo-supabase.sql
-- =====================================================
-- CAMBIOS RESPECTO AL ORIGINAL:
--   • Eliminado CREATE DATABASE (Supabase ya provee la BD)
--   • Eliminados comandos \c  (no aplica en SQL Editor)
--   • Eliminado COMMIT final (Supabase auto-commit por defecto)
--   • Agregado DROP ... IF EXISTS para poder re-ejecutar limpiamente
--   • Secuencias reseteadas explícitamente donde se insertan IDs fijos
-- =====================================================

SET client_encoding = 'UTF8';

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- LIMPIEZA PREVIA (permite re-ejecutar el script)
-- =====================================================
DROP TABLE IF EXISTS auditoria              CASCADE;
DROP TABLE IF EXISTS adjunto                CASCADE;
DROP TABLE IF EXISTS notificacion           CASCADE;
DROP TABLE IF EXISTS acta_sustentacion      CASCADE;
DROP TABLE IF EXISTS entrega_tesis_mejorada CASCADE;
DROP TABLE IF EXISTS entregable_tesis_mejorado CASCADE;
DROP TABLE IF EXISTS asesor_tesis           CASCADE;
DROP TABLE IF EXISTS tesis                  CASCADE;
DROP TABLE IF EXISTS proyecto_tesis         CASCADE;
DROP TABLE IF EXISTS evaluacion_final_practica CASCADE;
DROP TABLE IF EXISTS informe_practica       CASCADE;
DROP TABLE IF EXISTS seguimiento_horas      CASCADE;
DROP TABLE IF EXISTS practica               CASCADE;
DROP TABLE IF EXISTS postulacion            CASCADE;
DROP TABLE IF EXISTS oferta_practica        CASCADE;
DROP TABLE IF EXISTS convenio               CASCADE;
DROP TABLE IF EXISTS representante_empresa  CASCADE;
DROP TABLE IF EXISTS empresa                CASCADE;
DROP TABLE IF EXISTS pago_detalle           CASCADE;
DROP TABLE IF EXISTS historial_pago         CASCADE;
DROP TABLE IF EXISTS pago                   CASCADE;
DROP TABLE IF EXISTS concepto_pago          CASCADE;
DROP TABLE IF EXISTS estudiante             CASCADE;
DROP TABLE IF EXISTS docente                CASCADE;
DROP TABLE IF EXISTS usuario_rol            CASCADE;
DROP TABLE IF EXISTS usuario                CASCADE;
DROP TABLE IF EXISTS carrera                CASCADE;
DROP TABLE IF EXISTS facultad               CASCADE;
DROP TABLE IF EXISTS rol                    CASCADE;

-- =====================================================
-- ELIMINAR TIPOS ENUM (orden inverso de dependencias)
-- =====================================================
DROP TYPE IF EXISTS entidad_adjunto         CASCADE;
DROP TYPE IF EXISTS tipo_notificacion       CASCADE;
DROP TYPE IF EXISTS resultado_sustentacion  CASCADE;
DROP TYPE IF EXISTS estado_entrega_tesis    CASCADE;
DROP TYPE IF EXISTS rol_jurado              CASCADE;
DROP TYPE IF EXISTS tipo_asignacion_tesis   CASCADE;
DROP TYPE IF EXISTS estado_proyecto_tesis   CASCADE;
DROP TYPE IF EXISTS estado_informe          CASCADE;
DROP TYPE IF EXISTS tipo_informe_practica   CASCADE;
DROP TYPE IF EXISTS practica_origen         CASCADE;
DROP TYPE IF EXISTS estado_practica         CASCADE;
DROP TYPE IF EXISTS estado_postulacion      CASCADE;
DROP TYPE IF EXISTS estado_oferta           CASCADE;
DROP TYPE IF EXISTS estado_convenio         CASCADE;
DROP TYPE IF EXISTS tipo_convenio           CASCADE;
DROP TYPE IF EXISTS rol_usuario             CASCADE;
DROP TYPE IF EXISTS metodo_pago             CASCADE;
DROP TYPE IF EXISTS estado_pago             CASCADE;
DROP TYPE IF EXISTS tipo_pago               CASCADE;

-- =====================================================
-- ENUMS
-- =====================================================
CREATE TYPE rol_usuario         AS ENUM ('Administrador','Coordinador','Asesor','Estudiante','RepresentanteEmpresa','Secretaria');
CREATE TYPE tipo_convenio       AS ENUM ('marco','especifico');
CREATE TYPE estado_convenio     AS ENUM ('vigente','vencido','renovado');
CREATE TYPE estado_oferta       AS ENUM ('borrador','publicada','cerrada','cancelada');
CREATE TYPE estado_postulacion  AS ENUM ('postulado','preseleccionado','rechazado','aprobado');
CREATE TYPE estado_practica     AS ENUM ('pendiente_asignacion','activa','en_evaluacion','finalizada','cancelada');
CREATE TYPE practica_origen     AS ENUM ('institucional','externa');
CREATE TYPE tipo_informe_practica AS ENUM ('parcial','final');
CREATE TYPE estado_informe      AS ENUM ('pendiente','aprobado','observado');
CREATE TYPE estado_proyecto_tesis AS ENUM ('en_registro','propuesto','aprobado','en_desarrollo','en_revision','culminado','desaprobado');
CREATE TYPE tipo_asignacion_tesis AS ENUM ('asesor','jurado');
CREATE TYPE rol_jurado          AS ENUM ('presidente','secretario','vocal');
CREATE TYPE estado_entrega_tesis AS ENUM ('entregado','revisando','aprobado','observado');
CREATE TYPE resultado_sustentacion AS ENUM ('aprobado','desaprobado');
CREATE TYPE tipo_notificacion   AS ENUM ('info','exito','advertencia','error');
CREATE TYPE entidad_adjunto     AS ENUM ('practica','informe','entrega_tesis','acta','convenio');
CREATE TYPE tipo_pago           AS ENUM ('matricula','tramite','constancia','certificado','otro');
CREATE TYPE estado_pago         AS ENUM ('pendiente','procesando','completado','rechazado','reembolsado','cancelado');
CREATE TYPE metodo_pago         AS ENUM ('efectivo','deposito','transferencia','tarjeta','yape','plin','otro');

-- =====================================================
-- TABLAS CORE
-- =====================================================

CREATE TABLE rol (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(50)  NOT NULL UNIQUE,
    descripcion TEXT,
    activo      BOOLEAN      DEFAULT true,
    creado_en   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE facultad (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(200) NOT NULL UNIQUE,
    codigo      VARCHAR(10)  NOT NULL UNIQUE,
    descripcion TEXT,
    activo      BOOLEAN      DEFAULT true,
    creado_en   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE carrera (
    id          SERIAL PRIMARY KEY,
    facultad_id INTEGER      NOT NULL,
    nombre      VARCHAR(200) NOT NULL,
    codigo      VARCHAR(10)  NOT NULL,
    descripcion TEXT,
    activo      BOOLEAN      DEFAULT true,
    creado_en   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_carrera_facultad FOREIGN KEY (facultad_id) REFERENCES facultad(id) ON DELETE RESTRICT,
    CONSTRAINT unique_carrera_facultad UNIQUE (facultad_id, codigo)
);

-- =====================================================
-- TABLA: USUARIO
-- =====================================================
CREATE TABLE usuario (
    id                     SERIAL       PRIMARY KEY,
    email                  VARCHAR(255) NOT NULL UNIQUE,
    email_recuperacion     VARCHAR(255) NOT NULL,
    contrasena_hash        VARCHAR(255) NOT NULL,
    nombre                 VARCHAR(100) NOT NULL,
    apellido_paterno       VARCHAR(100) NOT NULL,
    apellido_materno       VARCHAR(100) NOT NULL,
    activo                 BOOLEAN      DEFAULT true,
    refresh_token          VARCHAR(255),
    refresh_token_expira   TIMESTAMP,
    creado_en              TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    actualizado_en         TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    eliminado_en           TIMESTAMP,
    eliminado              BOOLEAN      DEFAULT false
);

COMMENT ON TABLE  usuario                IS 'Usuarios del sistema con credenciales (roles separados)';
COMMENT ON COLUMN usuario.email          IS 'Correo institucional generado automaticamente';
COMMENT ON COLUMN usuario.refresh_token  IS 'Token para renovacion de sesion segura';
COMMENT ON COLUMN usuario.eliminado      IS 'Indica si el usuario fue eliminado logicamente';

CREATE INDEX idx_usuario_email         ON usuario(email);
CREATE INDEX idx_usuario_refresh_token ON usuario(refresh_token) WHERE refresh_token IS NOT NULL;
CREATE INDEX idx_usuario_eliminado     ON usuario(eliminado)      WHERE eliminado = false;

CREATE TABLE usuario_rol (
    id           SERIAL    PRIMARY KEY,
    usuario_id   INTEGER   NOT NULL,
    rol_id       INTEGER   NOT NULL,
    asignado_en  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    asignado_por INTEGER,
    CONSTRAINT fk_usuario_rol_usuario   FOREIGN KEY (usuario_id)   REFERENCES usuario(id) ON DELETE CASCADE,
    CONSTRAINT fk_usuario_rol_rol       FOREIGN KEY (rol_id)       REFERENCES rol(id)     ON DELETE CASCADE,
    CONSTRAINT fk_usuario_rol_asignador FOREIGN KEY (asignado_por) REFERENCES usuario(id) ON DELETE SET NULL,
    CONSTRAINT unique_usuario_rol       UNIQUE (usuario_id, rol_id)
);

-- =====================================================
-- TABLAS ESPECÍFICAS POR ROL
-- =====================================================

CREATE TABLE docente (
    id           SERIAL       PRIMARY KEY,
    usuario_id   INTEGER      NOT NULL UNIQUE,
    carrera_id   INTEGER      NOT NULL,
    especialidad VARCHAR(200),
    categoria    VARCHAR(100),
    dedicacion   VARCHAR(50),
    oficina      VARCHAR(50),
    telefono     VARCHAR(20),
    CONSTRAINT fk_docente_usuario  FOREIGN KEY (usuario_id)  REFERENCES usuario(id)  ON DELETE CASCADE,
    CONSTRAINT fk_docente_carrera  FOREIGN KEY (carrera_id)  REFERENCES carrera(id)  ON DELETE RESTRICT
);

CREATE TABLE estudiante (
    id                        SERIAL         PRIMARY KEY,
    usuario_id                INTEGER        NOT NULL UNIQUE,
    codigo_universitario      VARCHAR(20),
    anio_ingreso              INTEGER        NOT NULL,
    carrera_id                INTEGER        NOT NULL,
    escuela_profesional       VARCHAR(100),
    expediente_academico_url  VARCHAR(500),
    promedio_general          NUMERIC(4,2),
    creditos_aprobados        INTEGER        DEFAULT 0,
    activo                    BOOLEAN        DEFAULT true,
    CONSTRAINT fk_estudiante_usuario  FOREIGN KEY (usuario_id) REFERENCES usuario(id)  ON DELETE CASCADE,
    CONSTRAINT fk_estudiante_carrera  FOREIGN KEY (carrera_id) REFERENCES carrera(id)  ON DELETE RESTRICT,
    CONSTRAINT chk_promedio           CHECK (promedio_general IS NULL OR (promedio_general >= 0 AND promedio_general <= 20)),
    CONSTRAINT chk_anio               CHECK (anio_ingreso > 1900 AND anio_ingreso <= 2100)
);

CREATE UNIQUE INDEX idx_estudiante_codigo_unico ON estudiante(codigo_universitario)
    WHERE codigo_universitario IS NOT NULL;

COMMENT ON TABLE  estudiante                        IS 'Informacion academica especifica de estudiantes';
COMMENT ON COLUMN estudiante.codigo_universitario   IS 'Codigo unico del estudiante';

CREATE INDEX idx_estudiante_usuario ON estudiante(usuario_id);
CREATE INDEX idx_estudiante_carrera ON estudiante(carrera_id);

-- =====================================================
-- TABLA: EMPRESA
-- =====================================================
CREATE TABLE empresa (
    id              SERIAL       PRIMARY KEY,
    ruc             VARCHAR(11)  UNIQUE,
    razon_social    VARCHAR(200) NOT NULL,
    nombre_comercial VARCHAR(200),
    direccion       TEXT,
    telefono        VARCHAR(20),
    email_contacto  VARCHAR(255),
    activo          BOOLEAN      DEFAULT true,
    creado_en       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE  empresa     IS 'Empresas colaboradoras en practicas pre-profesionales';
COMMENT ON COLUMN empresa.ruc IS 'Registro Unico de Contribuyentes (11 digitos)';

CREATE INDEX idx_empresa_ruc    ON empresa(ruc);
CREATE INDEX idx_empresa_activo ON empresa(activo);

CREATE TABLE representante_empresa (
    id               SERIAL      PRIMARY KEY,
    empresa_id       INTEGER     NOT NULL,
    usuario_id       INTEGER     NOT NULL UNIQUE,
    cargo            VARCHAR(100),
    departamento     VARCHAR(100),
    telefono_directo VARCHAR(20),
    es_principal     BOOLEAN     DEFAULT false,
    CONSTRAINT fk_representante_empresa FOREIGN KEY (empresa_id)  REFERENCES empresa(id)  ON DELETE CASCADE,
    CONSTRAINT fk_representante_usuario FOREIGN KEY (usuario_id)  REFERENCES usuario(id)  ON DELETE CASCADE
);

-- =====================================================
-- TABLAS DE PRÁCTICAS
-- =====================================================

CREATE TABLE convenio (
    id               SERIAL        PRIMARY KEY,
    empresa_id       INTEGER       NOT NULL,
    tipo             tipo_convenio NOT NULL,
    numero_convenio  VARCHAR(50)   UNIQUE,
    fecha_inicio     DATE          NOT NULL,
    fecha_vencimiento DATE,
    estado           estado_convenio DEFAULT 'vigente',
    objeto           TEXT          NOT NULL,
    condiciones      TEXT,
    documento_url    VARCHAR(500),
    renovable        BOOLEAN       DEFAULT false,
    creado_en        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    actualizado_en   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_convenio_empresa    FOREIGN KEY (empresa_id) REFERENCES empresa(id) ON DELETE RESTRICT,
    CONSTRAINT chk_fechas_convenio    CHECK (fecha_vencimiento IS NULL OR fecha_vencimiento > fecha_inicio)
);

COMMENT ON TABLE convenio IS 'Convenios marco y especificos con empresas';

CREATE INDEX idx_convenio_empresa ON convenio(empresa_id);
CREATE INDEX idx_convenio_estado  ON convenio(estado);
CREATE INDEX idx_convenio_tipo    ON convenio(tipo);

CREATE TABLE oferta_practica (
    id                         SERIAL       PRIMARY KEY,
    empresa_id                 INTEGER      NOT NULL,
    convenio_id                INTEGER,
    titulo                     VARCHAR(200) NOT NULL,
    descripcion                TEXT,
    requisitos                 TEXT,
    fecha_inicio_postulacion   DATE         NOT NULL,
    fecha_fin_postulacion      DATE         NOT NULL,
    fecha_inicio_practica      DATE         NOT NULL,
    fecha_fin_practica         DATE         NOT NULL,
    cupos                      INTEGER      NOT NULL,
    horas_totales_requeridas   INTEGER      DEFAULT 400,
    estado                     estado_oferta DEFAULT 'borrador',
    creado_en                  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_oferta_empresa    FOREIGN KEY (empresa_id)  REFERENCES empresa(id)   ON DELETE CASCADE,
    CONSTRAINT fk_oferta_convenio   FOREIGN KEY (convenio_id) REFERENCES convenio(id)  ON DELETE SET NULL,
    CONSTRAINT chk_cupos            CHECK (cupos > 0),
    CONSTRAINT chk_fechas_postulacion CHECK (fecha_fin_postulacion > fecha_inicio_postulacion),
    CONSTRAINT chk_fechas_practica    CHECK (fecha_fin_practica > fecha_inicio_practica)
);

CREATE INDEX idx_oferta_empresa ON oferta_practica(empresa_id);
CREATE INDEX idx_oferta_estado  ON oferta_practica(estado);

CREATE TABLE postulacion (
    id                 SERIAL           PRIMARY KEY,
    oferta_id          INTEGER          NOT NULL,
    estudiante_id      INTEGER          NOT NULL,
    cv_url             VARCHAR(500),
    carta_presentacion TEXT,
    estado             estado_postulacion DEFAULT 'postulado',
    fecha_postulacion  DATE             DEFAULT CURRENT_DATE,
    fecha_revision     TIMESTAMP,
    revisado_por       INTEGER,
    CONSTRAINT fk_postulacion_oferta    FOREIGN KEY (oferta_id)     REFERENCES oferta_practica(id) ON DELETE CASCADE,
    CONSTRAINT fk_postulacion_estudiante FOREIGN KEY (estudiante_id) REFERENCES estudiante(id)      ON DELETE CASCADE,
    CONSTRAINT fk_postulacion_revisor   FOREIGN KEY (revisado_por)  REFERENCES usuario(id)         ON DELETE SET NULL,
    CONSTRAINT unique_postulacion       UNIQUE (oferta_id, estudiante_id)
);

CREATE INDEX idx_postulacion_oferta    ON postulacion(oferta_id);
CREATE INDEX idx_postulacion_estudiante ON postulacion(estudiante_id);
CREATE INDEX idx_postulacion_estado    ON postulacion(estado);

CREATE TABLE practica (
    id                       SERIAL          PRIMARY KEY,
    postulacion_id           INTEGER         NOT NULL UNIQUE,
    estudiante_id            INTEGER         NOT NULL,
    empresa_id               INTEGER         NOT NULL,
    asesor_empresa_nombre    VARCHAR(200),
    origen                   practica_origen DEFAULT 'institucional',
    cargo_supervisor         VARCHAR(100),
    email_supervisor         VARCHAR(100),
    telefono_supervisor      VARCHAR(50),
    fecha_inicio             DATE,
    fecha_fin                DATE,
    horas_semanales          INTEGER,
    horas_totales_requeridas INTEGER         DEFAULT 400,
    horas_completadas        INTEGER         DEFAULT 0,
    estado                   estado_practica DEFAULT 'pendiente_asignacion',
    asesor_academico_id      INTEGER,
    calificacion_final       NUMERIC(4,2),
    observaciones_finales    TEXT,
    creado_en                TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    actualizado_en           TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_practica_postulacion FOREIGN KEY (postulacion_id)      REFERENCES postulacion(id)  ON DELETE RESTRICT,
    CONSTRAINT fk_practica_estudiante  FOREIGN KEY (estudiante_id)        REFERENCES estudiante(id)   ON DELETE RESTRICT,
    CONSTRAINT fk_practica_empresa     FOREIGN KEY (empresa_id)           REFERENCES empresa(id)      ON DELETE RESTRICT,
    CONSTRAINT fk_practica_asesor      FOREIGN KEY (asesor_academico_id)  REFERENCES usuario(id)      ON DELETE SET NULL,
    CONSTRAINT chk_horas_semanales     CHECK (horas_semanales IS NULL OR (horas_semanales >= 20 AND horas_semanales <= 48)),
    CONSTRAINT chk_calificacion        CHECK (calificacion_final IS NULL  OR (calificacion_final >= 0 AND calificacion_final <= 20)),
    CONSTRAINT chk_fechas_practica     CHECK (fecha_fin IS NULL OR fecha_fin > fecha_inicio)
);

CREATE INDEX idx_practica_postulacion ON practica(postulacion_id);
CREATE INDEX idx_practica_estudiante  ON practica(estudiante_id);
CREATE INDEX idx_practica_empresa     ON practica(empresa_id);
CREATE INDEX idx_practica_estado      ON practica(estado);

CREATE TABLE seguimiento_horas (
    id                   SERIAL    PRIMARY KEY,
    practica_id          INTEGER   NOT NULL,
    fecha_trabajada      DATE      NOT NULL,
    horas                INTEGER   NOT NULL,
    descripcion_actividad TEXT     NOT NULL,
    evidencia_url        VARCHAR(500),
    aprobado_empresa     BOOLEAN   DEFAULT false,
    aprobado_asesor      BOOLEAN   DEFAULT false,
    creado_en            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_seguimiento_practica FOREIGN KEY (practica_id) REFERENCES practica(id) ON DELETE CASCADE,
    CONSTRAINT chk_horas_diarias       CHECK (horas >= 1 AND horas <= 12),
    CONSTRAINT unique_seguimiento_fecha UNIQUE (practica_id, fecha_trabajada)
);

CREATE TABLE informe_practica (
    id                SERIAL               PRIMARY KEY,
    practica_id       INTEGER              NOT NULL,
    tipo              tipo_informe_practica NOT NULL,
    titulo            VARCHAR(200)         NOT NULL,
    contenido_resumen TEXT,
    documento_url     VARCHAR(500),
    fecha_entrega     DATE                 NOT NULL,
    estado            estado_informe       DEFAULT 'pendiente',
    comentario_asesor TEXT,
    creado_en         TIMESTAMP            DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_informe_practica FOREIGN KEY (practica_id) REFERENCES practica(id) ON DELETE CASCADE,
    CONSTRAINT unique_informe_tipo UNIQUE (practica_id, tipo)
);

CREATE TABLE evaluacion_final_practica (
    id                   SERIAL    PRIMARY KEY,
    practica_id          INTEGER   NOT NULL UNIQUE,
    calificacion_empresa INTEGER   NOT NULL,
    calificacion_asesor  INTEGER   NOT NULL,
    retroalimentacion    TEXT,
    fecha_evaluacion     DATE      DEFAULT CURRENT_DATE,
    apto                 BOOLEAN   NOT NULL,
    creado_en            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_evaluacion_practica FOREIGN KEY (practica_id) REFERENCES practica(id) ON DELETE CASCADE,
    CONSTRAINT chk_calif_empresa      CHECK (calificacion_empresa >= 0 AND calificacion_empresa <= 20),
    CONSTRAINT chk_calif_asesor       CHECK (calificacion_asesor  >= 0 AND calificacion_asesor  <= 20)
);

-- =====================================================
-- TABLAS DE TESIS
-- =====================================================

CREATE TABLE proyecto_tesis (
    id                       SERIAL               PRIMARY KEY,
    estudiante_id            INTEGER              NOT NULL,
    titulo                   VARCHAR(300)         NOT NULL,
    resumen                  TEXT                 NOT NULL,
    area_conocimiento        VARCHAR(100)         NOT NULL,
    palabras_clave           TEXT,
    estado                   estado_proyecto_tesis DEFAULT 'en_registro',
    fecha_registro           DATE                 DEFAULT CURRENT_DATE,
    fecha_aprobacion         DATE,
    asesor_sugerido_id       INTEGER,
    fecha_sugerencia_asesor  TIMESTAMP,
    observaciones_coordinador TEXT,
    aprobado_por             INTEGER,
    activo                   BOOLEAN              DEFAULT true,
    creado_en                TIMESTAMP            DEFAULT CURRENT_TIMESTAMP,
    actualizado_en           TIMESTAMP            DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_proyecto_estudiante     FOREIGN KEY (estudiante_id)      REFERENCES estudiante(id) ON DELETE RESTRICT,
    CONSTRAINT fk_proyecto_aprobador      FOREIGN KEY (aprobado_por)        REFERENCES docente(id)    ON DELETE SET NULL,
    CONSTRAINT fk_proyecto_asesor_sugerido FOREIGN KEY (asesor_sugerido_id) REFERENCES docente(id)    ON DELETE SET NULL
);

CREATE TABLE tesis (
    id                     SERIAL               PRIMARY KEY,
    proyecto_id            INTEGER              NOT NULL UNIQUE,
    estudiante_id          INTEGER              NOT NULL,
    titulo                 VARCHAR(300)         NOT NULL,
    resumen                TEXT                 NOT NULL,
    area_conocimiento      VARCHAR(100)         NOT NULL,
    estado                 estado_proyecto_tesis DEFAULT 'en_registro',
    fecha_registro         DATE                 DEFAULT CURRENT_DATE,
    fecha_aprobacion       DATE,
    fecha_sustentacion     DATE,
    nota_final             NUMERIC(5,2),
    resultado_sustentacion resultado_sustentacion,
    CONSTRAINT fk_tesis_proyecto   FOREIGN KEY (proyecto_id)   REFERENCES proyecto_tesis(id) ON DELETE CASCADE,
    CONSTRAINT fk_tesis_estudiante FOREIGN KEY (estudiante_id) REFERENCES estudiante(id)     ON DELETE RESTRICT
);

CREATE TABLE asesor_tesis (
    id               SERIAL              PRIMARY KEY,
    tesis_id         INTEGER             NOT NULL,
    docente_id       INTEGER             NOT NULL,
    tipo_asignacion  tipo_asignacion_tesis NOT NULL,
    rol_jurado       rol_jurado,
    fecha_asignacion DATE                DEFAULT CURRENT_DATE,
    activo           BOOLEAN             DEFAULT true,
    observaciones    TEXT,
    CONSTRAINT fk_asesor_tesis   FOREIGN KEY (tesis_id)    REFERENCES tesis(id)    ON DELETE CASCADE,
    CONSTRAINT fk_asesor_docente FOREIGN KEY (docente_id)  REFERENCES docente(id)  ON DELETE RESTRICT,
    CONSTRAINT chk_rol_jurado    CHECK (
        (tipo_asignacion = 'asesor' AND rol_jurado IS NULL) OR
        (tipo_asignacion = 'jurado' AND rol_jurado IS NOT NULL)
    ),
    CONSTRAINT unique_asesor_tesis UNIQUE (tesis_id, docente_id)
);

CREATE TABLE entregable_tesis_mejorado (
    id                       SERIAL      PRIMARY KEY,
    tesis_id                 INTEGER     NOT NULL,
    nombre                   VARCHAR(200) NOT NULL,
    descripcion              TEXT,
    fecha_limite             DATE,
    obligatorio              BOOLEAN     DEFAULT true,
    orden                    INTEGER,
    documento_referencia_url VARCHAR(500),
    activo                   BOOLEAN     DEFAULT true,
    CONSTRAINT fk_entregable_tesis   FOREIGN KEY (tesis_id) REFERENCES tesis(id) ON DELETE CASCADE,
    CONSTRAINT unique_entregable_orden UNIQUE (tesis_id, orden)
);

CREATE TABLE entrega_tesis_mejorada (
    id                       SERIAL            PRIMARY KEY,
    entregable_id            INTEGER           NOT NULL,
    estudiante_id            INTEGER           NOT NULL,
    titulo_entrega           VARCHAR(200)      NOT NULL,
    documento_url            VARCHAR(500)      NOT NULL,
    comentario               TEXT,
    fecha_entrega            DATE              NOT NULL DEFAULT CURRENT_DATE,
    estado                   estado_entrega_tesis DEFAULT 'entregado',
    retroalimentacion_asesor TEXT,
    fecha_revision           DATE,
    revisado_por             INTEGER,
    creado_en                TIMESTAMP         DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_entrega_entregable  FOREIGN KEY (entregable_id) REFERENCES entregable_tesis_mejorado(id) ON DELETE CASCADE,
    CONSTRAINT fk_entrega_estudiante  FOREIGN KEY (estudiante_id) REFERENCES estudiante(id)                ON DELETE CASCADE,
    CONSTRAINT fk_entrega_revisor     FOREIGN KEY (revisado_por)  REFERENCES docente(id)                   ON DELETE SET NULL,
    CONSTRAINT unique_entrega_entregable_estudiante UNIQUE (entregable_id, estudiante_id)
);

CREATE TABLE acta_sustentacion (
    id                SERIAL               PRIMARY KEY,
    proyecto_id       INTEGER              NOT NULL UNIQUE,
    fecha_sustentacion DATE               NOT NULL,
    hora_inicio       VARCHAR(8)           NOT NULL,
    hora_fin          VARCHAR(8)           NOT NULL,
    lugar             VARCHAR(200)         NOT NULL,
    nota_final        NUMERIC(5,2)         NOT NULL,
    resultado         resultado_sustentacion NOT NULL,
    url_acta_firmada  VARCHAR(500),
    creado_en         TIMESTAMP            DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_acta_proyecto FOREIGN KEY (proyecto_id) REFERENCES proyecto_tesis(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLA: NOTIFICACIÓN
-- =====================================================
CREATE TABLE notificacion (
    id                    SERIAL           PRIMARY KEY,
    usuario_id            INTEGER          NOT NULL,
    tipo                  tipo_notificacion DEFAULT 'info',
    titulo                VARCHAR(200)     NOT NULL,
    mensaje               TEXT             NOT NULL,
    leido                 BOOLEAN          DEFAULT false,
    creado_en             TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
    archivada             BOOLEAN          DEFAULT false,
    prioridad             VARCHAR(20)      DEFAULT 'low',
    datos                 JSONB,
    entidad_referenciada  VARCHAR(50),
    id_referenciado       INTEGER,
    CONSTRAINT fk_notificacion_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
);

CREATE INDEX idx_notificacion_usuario   ON notificacion(usuario_id);
CREATE INDEX idx_notificacion_leido     ON notificacion(leido);
CREATE INDEX idx_notificacion_archivada ON notificacion(archivada);
CREATE INDEX idx_notificacion_creado_en ON notificacion(creado_en);

-- =====================================================
-- TABLA: ADJUNTO
-- =====================================================
CREATE TABLE adjunto (
    id             SERIAL         PRIMARY KEY,
    entidad        entidad_adjunto NOT NULL,
    entidad_id     INTEGER        NOT NULL,
    nombre_archivo VARCHAR(255)   NOT NULL,
    tipo_mime      VARCHAR(100),
    tamano_bytes   INTEGER,
    ruta_archivo   VARCHAR(500)   NOT NULL,
    fecha_subida   TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    subido_por     INTEGER        NOT NULL,
    CONSTRAINT fk_adjunto_usuario FOREIGN KEY (subido_por) REFERENCES usuario(id) ON DELETE RESTRICT
);

CREATE INDEX idx_adjunto_entidad ON adjunto(entidad, entidad_id);
CREATE INDEX idx_adjunto_usuario ON adjunto(subido_por);

-- =====================================================
-- TABLA: AUDITORÍA
-- =====================================================
CREATE TABLE auditoria (
    id                SERIAL    PRIMARY KEY,
    usuario_id        INTEGER,
    accion            VARCHAR(50) NOT NULL,
    entidad           VARCHAR(50) NOT NULL,
    entidad_id        INTEGER,
    datos_anteriores  JSONB,
    datos_nuevos      JSONB,
    ip_address        VARCHAR(45),
    user_agent        TEXT,
    creado_en         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE auditoria IS 'Registro de auditoria para operaciones criticas del sistema';

CREATE INDEX idx_auditoria_usuario    ON auditoria(usuario_id);
CREATE INDEX idx_auditoria_entidad    ON auditoria(entidad, entidad_id);
CREATE INDEX idx_auditoria_creado_en  ON auditoria(creado_en);
CREATE INDEX idx_auditoria_accion     ON auditoria(accion);

-- =====================================================
-- TABLAS DE PAGOS
-- =====================================================

CREATE TABLE concepto_pago (
    id                  SERIAL      PRIMARY KEY,
    codigo              VARCHAR(20) NOT NULL UNIQUE,
    nombre              VARCHAR(200) NOT NULL,
    descripcion         TEXT,
    tipo                tipo_pago   NOT NULL,
    monto               NUMERIC(10,2) NOT NULL,
    carrera_id          INTEGER,
    activo              BOOLEAN     DEFAULT true,
    requiere_aprobacion BOOLEAN     DEFAULT false,
    creado_en           TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    actualizado_en      TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_concepto_carrera FOREIGN KEY (carrera_id) REFERENCES carrera(id) ON DELETE SET NULL,
    CONSTRAINT chk_monto_concepto  CHECK (monto >= 0)
);

COMMENT ON TABLE concepto_pago IS 'Conceptos de pago configurables por la universidad';

CREATE TABLE pago (
    id                SERIAL        PRIMARY KEY,
    codigo_pago       VARCHAR(30)   NOT NULL UNIQUE,
    estudiante_id     INTEGER       NOT NULL,
    concepto_id       INTEGER       NOT NULL,
    monto             NUMERIC(10,2) NOT NULL,
    estado            estado_pago   DEFAULT 'pendiente',
    metodo_pago       metodo_pago,
    referencia_pago   VARCHAR(100),
    fecha_pago        TIMESTAMP,
    fecha_vencimiento DATE,
    comprobante_url   VARCHAR(500),
    observaciones     TEXT,
    registrado_por    INTEGER,
    aprobado_por      INTEGER,
    fecha_aprobacion  TIMESTAMP,
    motivo_rechazo    TEXT,
    datos_adicionales JSONB,
    creado_en         TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    actualizado_en    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pago_estudiante  FOREIGN KEY (estudiante_id)  REFERENCES estudiante(id)     ON DELETE RESTRICT,
    CONSTRAINT fk_pago_concepto    FOREIGN KEY (concepto_id)    REFERENCES concepto_pago(id)  ON DELETE RESTRICT,
    CONSTRAINT fk_pago_registrador FOREIGN KEY (registrado_por) REFERENCES usuario(id)        ON DELETE SET NULL,
    CONSTRAINT fk_pago_aprobador   FOREIGN KEY (aprobado_por)   REFERENCES usuario(id)        ON DELETE SET NULL,
    CONSTRAINT chk_monto_pago      CHECK (monto > 0)
);

COMMENT ON TABLE  pago             IS 'Registro de pagos realizados por estudiantes';
COMMENT ON COLUMN pago.codigo_pago IS 'Codigo unico generado automaticamente (ej: PAG-2026-000001)';

CREATE INDEX idx_pago_estudiante ON pago(estudiante_id);
CREATE INDEX idx_pago_estado     ON pago(estado);
CREATE INDEX idx_pago_fecha      ON pago(fecha_pago);
CREATE INDEX idx_pago_codigo     ON pago(codigo_pago);
CREATE INDEX idx_pago_concepto   ON pago(concepto_id);

CREATE TABLE historial_pago (
    id               SERIAL      PRIMARY KEY,
    pago_id          INTEGER     NOT NULL,
    estado_anterior  estado_pago,
    estado_nuevo     estado_pago NOT NULL,
    cambiado_por     INTEGER     NOT NULL,
    motivo           TEXT,
    ip_address       VARCHAR(45),
    creado_en        TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_historial_pago    FOREIGN KEY (pago_id)      REFERENCES pago(id)     ON DELETE CASCADE,
    CONSTRAINT fk_historial_usuario FOREIGN KEY (cambiado_por) REFERENCES usuario(id)  ON DELETE RESTRICT
);

CREATE INDEX idx_historial_pago  ON historial_pago(pago_id);
CREATE INDEX idx_historial_fecha ON historial_pago(creado_en);

CREATE TABLE pago_detalle (
    id              SERIAL        PRIMARY KEY,
    pago_id         INTEGER       NOT NULL,
    concepto_id     INTEGER       NOT NULL,
    cantidad        INTEGER       DEFAULT 1,
    precio_unitario NUMERIC(10,2) NOT NULL,
    subtotal        NUMERIC(10,2) NOT NULL,
    descuento       NUMERIC(10,2) DEFAULT 0,
    total           NUMERIC(10,2) NOT NULL,
    CONSTRAINT fk_detalle_pago    FOREIGN KEY (pago_id)     REFERENCES pago(id)          ON DELETE CASCADE,
    CONSTRAINT fk_detalle_concepto FOREIGN KEY (concepto_id) REFERENCES concepto_pago(id) ON DELETE RESTRICT,
    CONSTRAINT chk_cantidad        CHECK (cantidad > 0),
    CONSTRAINT chk_precios         CHECK (precio_unitario >= 0 AND subtotal >= 0 AND total >= 0)
);

-- =====================================================
-- FUNCIONES AUXILIARES
-- =====================================================

CREATE OR REPLACE FUNCTION sync_practica_from_postulacion()
RETURNS void AS $$
BEGIN
    UPDATE practica p
    SET
        estudiante_id = po.estudiante_id,
        empresa_id    = of.empresa_id
    FROM postulacion po
    JOIN oferta_practica of ON of.id = po.oferta_id
    WHERE p.postulacion_id = po.id
      AND (p.estudiante_id IS NULL OR p.empresa_id IS NULL);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION normalize_text(texto TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(
        regexp_replace(
            regexp_replace(
                regexp_replace(texto, '[áàäâ]', 'a', 'g'),
                '[éèëê]', 'e', 'g'),
            '[íìïî]', 'i', 'g')
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generar_email_estudiante(codigo_universitario TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(codigo_universitario) || '@estudiante.unt.edu.pe';
END;
$$ LANGUAGE plpgsql;

-- Función y trigger: auto-generar código de pago
CREATE OR REPLACE FUNCTION generar_codigo_pago()
RETURNS TRIGGER AS $$
DECLARE
    anio            TEXT;
    siguiente_numero INTEGER;
    nuevo_codigo     TEXT;
BEGIN
    anio := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;

    SELECT COALESCE(
        MAX(NULLIF(regexp_replace(codigo_pago, '^PAG-' || anio || '-', ''), ''))::INTEGER,
        0
    ) + 1
    INTO siguiente_numero
    FROM pago
    WHERE codigo_pago LIKE 'PAG-' || anio || '-%';

    nuevo_codigo     := 'PAG-' || anio || '-' || LPAD(siguiente_numero::TEXT, 6, '0');
    NEW.codigo_pago  := nuevo_codigo;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generar_codigo_pago
    BEFORE INSERT ON pago
    FOR EACH ROW
    EXECUTE FUNCTION generar_codigo_pago();

-- Función y trigger: historial de cambios de estado de pago
CREATE OR REPLACE FUNCTION registrar_historial_pago()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.estado IS DISTINCT FROM NEW.estado THEN
        INSERT INTO historial_pago (pago_id, estado_anterior, estado_nuevo, cambiado_por, motivo)
        VALUES (NEW.id, OLD.estado, NEW.estado, NEW.registrado_por, NEW.motivo_rechazo);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_historial_pago
    AFTER UPDATE OF estado ON pago
    FOR EACH ROW
    EXECUTE FUNCTION registrar_historial_pago();

-- =====================================================
-- DATOS BASE: CONCEPTOS DE PAGO
-- =====================================================
INSERT INTO concepto_pago (codigo, nombre, descripcion, tipo, monto, activo) VALUES
('MAT-001', 'Matricula Regular',                   'Pago de matricula para ciclo regular',    'matricula',  350.00, true),
('MAT-002', 'Matricula Extraordinaria',             'Pago de matricula extraordinaria',         'matricula',  450.00, true),
('TRA-001', 'Tramite de Constancia de Estudios',   'Constancia de estudios vigentes',          'constancia',  20.00, true),
('TRA-002', 'Tramite de Certificado Alumno Regular','Certificado de alumno regular',           'certificado', 25.00, true),
('TRA-003', 'Tramite de Duplicado de Carnet',      'Duplicado de carnet universitario',        'tramite',     30.00, true),
('EXT-001', 'Pago por Practicas Pre-profesionales','Gestion de practicas pre-profesionales',   'tramite',     50.00, true),
('EXT-002', 'Pago por Tramite de Tesis',           'Gestion de tramite de tesis',              'tramite',    150.00, true),
('OTR-001', 'Otros Conceptos',                     'Otros conceptos de pago',                  'otro',         0.00, true);

-- =====================================================
-- MENSAJE DE CONFIRMACIÓN
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Schema creado exitosamente en Supabase';
    RAISE NOTICE '   Siguiente paso: ejecutar 02-datos-demo-supabase.sql';
END $$;
