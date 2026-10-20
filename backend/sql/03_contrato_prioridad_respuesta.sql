-- =====================================================================
-- Migración: prioridades por contrato, ticket ligado a contrato con
-- auto-asignación de empresa/supervisor, tabla respuesta, y nomenclatura
-- automática de número de contrato.
-- Ejecutar DESPUÉS de schema_postgres_supervisor.sql y
-- migracion_ficha_empresa_contrato.sql
-- =====================================================================

-- ---------- 1) Nomenclatura automática del número de contrato ----------
-- Formato propuesto: CTR-{AÑO}-{correlativo de 3 dígitos}  ej. CTR-2026-001
-- Si tu supervisor pide otro formato, solo hay que editar esta función.

ALTER TABLE contratos ADD COLUMN numero_contrato VARCHAR(30) UNIQUE;

CREATE SEQUENCE IF NOT EXISTS contratos_numero_seq START 1;

CREATE OR REPLACE FUNCTION fn_generar_numero_contrato() RETURNS TRIGGER AS $$
DECLARE
    anio        TEXT := to_char(now(), 'YYYY');
    correlativo TEXT;
BEGIN
    IF NEW.numero_contrato IS NULL THEN
        correlativo := lpad(nextval('contratos_numero_seq')::text, 3, '0');
        NEW.numero_contrato := 'CTR-' || anio || '-' || correlativo;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_numero_contrato
    BEFORE INSERT ON contratos
    FOR EACH ROW
    EXECUTE FUNCTION fn_generar_numero_contrato();

-- ---------- 2) Prioridades por contrato (Módulo de prioridades) ----------
-- Nombres fijos, pero los días hábiles varían según el contrato.
-- Se siembran automáticamente con valores por defecto al crear un contrato.

CREATE TABLE prioridad_contrato (
    id_prioridad_contrato  SERIAL PRIMARY KEY,
    id_contrato            INTEGER NOT NULL REFERENCES contratos(id_contratos) ON DELETE CASCADE,
    nombre_prioridad       VARCHAR(20) NOT NULL
                            CHECK (nombre_prioridad IN ('Urgente', 'Muy alta', 'Alta', 'Normal', 'Baja')),
    dias_habiles           INTEGER NOT NULL CHECK (dias_habiles > 0),
    UNIQUE (id_contrato, nombre_prioridad)
);

CREATE OR REPLACE FUNCTION fn_seed_prioridades_contrato() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO prioridad_contrato (id_contrato, nombre_prioridad, dias_habiles) VALUES
        (NEW.id_contratos, 'Urgente', 1),
        (NEW.id_contratos, 'Muy alta', 2),
        (NEW.id_contratos, 'Alta', 3),
        (NEW.id_contratos, 'Normal', 5),
        (NEW.id_contratos, 'Baja', 10);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_seed_prioridades
    AFTER INSERT ON contratos
    FOR EACH ROW
    EXECUTE FUNCTION fn_seed_prioridades_contrato();

-- ---------- 3) Ticket: se liga a un contrato y auto-asigna empresa/supervisor ----------

ALTER TABLE ticket
    ADD COLUMN id_contrato INTEGER REFERENCES contratos(id_contratos);

-- OJO: si ya tienes tickets cargados, actualízalos con su id_contrato
-- ANTES de la siguiente línea, o la restricción NOT NULL fallará.
ALTER TABLE ticket ALTER COLUMN id_contrato SET NOT NULL;

-- La columna `prioridad` (texto libre) se reemplaza por una FK a prioridad_contrato
ALTER TABLE ticket DROP COLUMN prioridad;
ALTER TABLE ticket ADD COLUMN id_prioridad INTEGER NOT NULL
    REFERENCES prioridad_contrato(id_prioridad_contrato);

-- Trigger: al insertar un ticket, toma id_contrato y completa automáticamente
-- id_empresa (siempre) e id_usuario/supervisor (solo si no se indicó uno manualmente).
CREATE OR REPLACE FUNCTION fn_autocompletar_ticket() RETURNS TRIGGER AS $$
DECLARE
    v_id_empresa    INTEGER;
    v_id_supervisor INTEGER;
BEGIN
    SELECT c.id_empresa, e.id_supervisor_contraparte
    INTO v_id_empresa, v_id_supervisor
    FROM contratos c
    JOIN empresas e ON e.id_empresa = c.id_empresa
    WHERE c.id_contratos = NEW.id_contrato;

    NEW.id_empresa := v_id_empresa;

    IF NEW.id_usuario IS NULL THEN
        NEW.id_usuario := v_id_supervisor;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_autocompletar_ticket
    BEFORE INSERT ON ticket
    FOR EACH ROW
    EXECUTE FUNCTION fn_autocompletar_ticket();

CREATE INDEX idx_ticket_contrato ON ticket(id_contrato);

-- ---------- 4) Respuesta asociada al ticket ----------
-- 1 ticket puede tener varias respuestas (cada ciclo de subsanación genera una).

CREATE TABLE respuesta (
    id_respuesta    SERIAL PRIMARY KEY,
    id_ticket       INTEGER NOT NULL REFERENCES ticket(id_ticket) ON DELETE CASCADE,
    id_usuario      INTEGER NOT NULL REFERENCES usuario(id_usuario),  -- quién responde
    comentario      TEXT NOT NULL,
    foto            VARCHAR(500),
    fecha           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_respuesta_ticket ON respuesta(id_ticket, fecha);

-- =====================================================================
-- Fin de la migración
-- =====================================================================
