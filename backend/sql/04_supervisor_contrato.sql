-- Ejecutar después de 03_contrato_prioridad_respuesta.sql.
-- El supervisor queda asignado al contrato y se deriva desde allí al crear tickets.

ALTER TABLE contratos
    ADD COLUMN id_supervisor INTEGER REFERENCES usuario(id_usuario);

-- Conserva la asignación previa a nivel de empresa para contratos existentes.
UPDATE contratos c
SET id_supervisor = e.id_supervisor_contraparte
FROM empresas e
WHERE e.id_empresa = c.id_empresa
  AND e.id_supervisor_contraparte IS NOT NULL;

CREATE OR REPLACE FUNCTION fn_autocompletar_ticket() RETURNS TRIGGER AS $$
DECLARE
    v_id_empresa    INTEGER;
    v_id_supervisor INTEGER;
BEGIN
    SELECT c.id_empresa, c.id_supervisor
    INTO v_id_empresa, v_id_supervisor
    FROM contratos c
    WHERE c.id_contratos = NEW.id_contrato;

    NEW.id_empresa := v_id_empresa;
    NEW.id_usuario := v_id_supervisor;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON COLUMN contratos.id_supervisor IS
    'Supervisor asignado al contrato; se usa automáticamente al crear sus tickets.';
