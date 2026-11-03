-- =====================================================================
-- Migración 06: requerimientos de fiscalización
-- Ejecutar DESPUÉS de 05_autenticacion.sql.
--
-- Agrega:
--   * ubicación completa de la observación (dirección, sector, referencia, coordenadas)
--   * creador, conformidad y cierre del ticket con su trazabilidad
--   * historial de actuaciones (append-only: un trigger impide editarlo o borrarlo)
--   * archivos (fotografías) asociados a cada actuación
--   * feriados para el cálculo de días hábiles
--   * destinatarios de notificación y registro de envíos
--   * enlaces de consulta externa de solo lectura
-- =====================================================================

-- ---------- Ubicación de la observación ----------

ALTER TABLE observaciones
    ADD COLUMN direccion  VARCHAR(255),
    ADD COLUMN sector     VARCHAR(150),
    ADD COLUMN referencia VARCHAR(255),
    ADD COLUMN latitud    NUMERIC(9,6) CHECK (latitud BETWEEN -90 AND 90),
    ADD COLUMN longitud   NUMERIC(9,6) CHECK (longitud BETWEEN -180 AND 180);

-- ---------- Ticket: creador, conformidad y cierre ----------

ALTER TABLE ticket
    ADD COLUMN id_creador           INTEGER REFERENCES usuario(id_usuario),
    ADD COLUMN conformidad_por      INTEGER REFERENCES usuario(id_usuario),
    ADD COLUMN conformidad_fecha    TIMESTAMPTZ,
    ADD COLUMN comentario_conformidad TEXT,
    ADD COLUMN cerrado_por          INTEGER REFERENCES usuario(id_usuario),
    ADD COLUMN fecha_cierre         TIMESTAMPTZ,
    ADD COLUMN comentario_cierre    TEXT;

-- Los tickets anteriores a esta migración no guardaban al creador: se toma el
-- usuario de la observación, que sí era quien registraba la observación.
UPDATE ticket t
SET id_creador = o.id_usuario
FROM observaciones o
WHERE o.id_observacion = t.id_observacion
  AND t.id_creador IS NULL;

CREATE INDEX idx_ticket_creador ON ticket(id_creador);
CREATE INDEX idx_ticket_cierre ON ticket(fecha_cierre);

-- ---------- Historial de actuaciones ----------
-- Cada actuación es una fila independiente. El historial no se reemplaza ni
-- se borra: el trigger de abajo rechaza UPDATE y DELETE.

CREATE TABLE ticket_actuacion (
    id_actuacion  SERIAL PRIMARY KEY,
    id_ticket     INTEGER NOT NULL REFERENCES ticket(id_ticket),
    tipo          VARCHAR(40) NOT NULL CHECK (tipo IN (
                    'CREACION', 'RESPUESTA', 'OBSERVACION', 'SOLICITUD_SUBSANACION',
                    'CAMBIO_ESTADO', 'NOTIFICACION', 'RECORDATORIO', 'VENCIMIENTO',
                    'CONFORMIDAD', 'CIERRE', 'REAPERTURA', 'ENLACE_CONSULTA')),
    id_usuario    INTEGER REFERENCES usuario(id_usuario),  -- NULL = acción del sistema
    fecha         TIMESTAMPTZ NOT NULL DEFAULT now(),
    descripcion   TEXT,
    datos         JSONB
);

CREATE INDEX idx_actuacion_ticket ON ticket_actuacion(id_ticket, fecha);

CREATE OR REPLACE FUNCTION fn_historial_inmutable() RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'El historial del ticket no puede modificarse ni eliminarse';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_actuacion_inmutable
    BEFORE UPDATE OR DELETE ON ticket_actuacion
    FOR EACH ROW
    EXECUTE FUNCTION fn_historial_inmutable();

-- ---------- Archivos (fotografías y antecedentes) ----------
-- Los archivos se guardan en disco (backend/uploads); aquí sólo la ruta relativa.

CREATE TABLE archivo (
    id_archivo    SERIAL PRIMARY KEY,
    id_ticket     INTEGER NOT NULL REFERENCES ticket(id_ticket),
    id_actuacion  INTEGER REFERENCES ticket_actuacion(id_actuacion),
    id_usuario    INTEGER NOT NULL REFERENCES usuario(id_usuario),
    ruta          VARCHAR(500) NOT NULL,
    tipo_mime     VARCHAR(100) NOT NULL,
    fecha         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_archivo_ticket ON archivo(id_ticket);
CREATE INDEX idx_archivo_actuacion ON archivo(id_actuacion);

-- ---------- Feriados (días hábiles) ----------

CREATE TABLE feriado (
    fecha        DATE PRIMARY KEY,
    descripcion  VARCHAR(150) NOT NULL
);

-- ---------- Destinatarios de notificación y registro de envíos ----------

CREATE TABLE destinatario_notificacion (
    id_destinatario  SERIAL PRIMARY KEY,
    email            VARCHAR(150) NOT NULL UNIQUE CHECK (email LIKE '%@%'),
    nombre           VARCHAR(150),
    activo           BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE notificacion (
    id_notificacion  SERIAL PRIMARY KEY,
    id_ticket        INTEGER NOT NULL REFERENCES ticket(id_ticket),
    tipo             VARCHAR(20) NOT NULL CHECK (tipo IN ('CREACION', 'SOLICITUD', 'RECORDATORIO', 'VENCIMIENTO')),
    destinatario     VARCHAR(150) NOT NULL,
    asunto           VARCHAR(200) NOT NULL,
    estado           VARCHAR(20) NOT NULL CHECK (estado IN ('ENVIADA', 'FALLIDA', 'SIN_CONFIGURAR')),
    error            TEXT,
    fecha            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notificacion_ticket ON notificacion(id_ticket, tipo, fecha);

-- ---------- Consulta externa por enlace (sólo lectura) ----------
-- Igual que las sesiones: el token se entrega una vez y sólo se guarda su hash.

CREATE TABLE consulta_externa (
    id_consulta   SERIAL PRIMARY KEY,
    id_ticket     INTEGER NOT NULL REFERENCES ticket(id_ticket),
    token_hash    CHAR(64) NOT NULL UNIQUE,
    creado_por    INTEGER NOT NULL REFERENCES usuario(id_usuario),
    creada_en     TIMESTAMPTZ NOT NULL DEFAULT now(),
    expira_en     TIMESTAMPTZ NOT NULL,
    revocada_en   TIMESTAMPTZ,
    CHECK (expira_en > creada_en)
);

CREATE INDEX idx_consulta_ticket ON consulta_externa(id_ticket);

-- =====================================================================
-- Fin de la migración
-- =====================================================================
