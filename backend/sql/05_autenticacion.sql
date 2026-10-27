-- =====================================================================
-- Autenticación: sesiones de acceso
-- Motor: PostgreSQL 14+
--
-- usuario.password_hash ya existe (01_schema.sql) y guarda un hash
-- scrypt, nunca la contraseña en claro.
--
-- Cada inicio de sesión crea una fila aquí. El token que recibe la app
-- es aleatorio; en la base sólo se guarda su SHA-256 (token_hash), así
-- una filtración de la tabla no permite usar las sesiones activas.
-- =====================================================================

CREATE TABLE sesion (
    id_sesion     SERIAL PRIMARY KEY,
    id_usuario    INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    token_hash    CHAR(64) NOT NULL UNIQUE,
    creada_en     TIMESTAMPTZ NOT NULL DEFAULT now(),
    expira_en     TIMESTAMPTZ NOT NULL,
    CHECK (expira_en > creada_en)
);

CREATE INDEX idx_sesion_usuario ON sesion(id_usuario);
CREATE INDEX idx_sesion_expira ON sesion(expira_en);

-- =====================================================================
-- Fin del script
-- =====================================================================
