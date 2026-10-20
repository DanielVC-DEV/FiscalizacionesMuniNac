-- =====================================================================
-- Migración: campos de "Información de la empresa" e "Información del
-- contrato" pedidos por el cliente/supervisor.
-- Ejecutar DESPUÉS de schema_postgres_supervisor.sql
-- =====================================================================

-- ---------- Empresas ----------
-- "nombre" pasa a llamarse "razon_social" para que coincida con el formulario.

ALTER TABLE empresas RENAME COLUMN nombre TO razon_social;

ALTER TABLE empresas
    ADD COLUMN direccion_comercial         VARCHAR(255),
    ADD COLUMN direccion_base_nacimiento   VARCHAR(255),

    -- Administrador de contrato / Jefe zonal: dato de contacto de texto,
    -- NO está vinculado a una cuenta de usuario del sistema.
    ADD COLUMN administrador_contrato_nombre    VARCHAR(150),
    ADD COLUMN administrador_contrato_email     VARCHAR(150),
    ADD COLUMN administrador_contrato_telefono  VARCHAR(30),

    -- Supervisor (contraparte local): SÍ es un usuario con login existente
    -- (rol supervisor_empresa). Se referencia, no se duplica nombre/correo/
    -- teléfono (esos datos ya viven en la tabla `usuario`).
    ADD COLUMN id_supervisor_contraparte INTEGER REFERENCES usuario(id_usuario);

CREATE INDEX idx_empresas_supervisor_contraparte ON empresas(id_supervisor_contraparte);

COMMENT ON COLUMN empresas.id_supervisor_contraparte IS
    'FK a usuario.id_usuario (debe tener rol supervisor_empresa). '
    'Nombre/correo/teléfono del supervisor se consultan desde usuario, no se repiten aquí.';

-- ---------- Contratos ----------

ALTER TABLE contratos
    ADD COLUMN id_licitacion       VARCHAR(50),
    ADD COLUMN vigencia            VARCHAR(50),   -- ej. "36 meses"
    ADD COLUMN monto_actualizado   NUMERIC(14,2) CHECK (monto_actualizado >= 0);

COMMENT ON COLUMN contratos.monto_actualizado IS
    'Monto vigente del contrato. Se sobreescribe directamente al reajustarse '
    '(IPC o modificación de contrato) — no se guarda historial de versiones anteriores.';

-- =====================================================================
-- Fin de la migración
-- =====================================================================
