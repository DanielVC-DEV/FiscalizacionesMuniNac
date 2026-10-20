-- =====================================================================
-- Esquema de base de datos
-- Plataforma de Gestión de Tickets de Fiscalización de Contratos
-- Basado en el modelo revisado por el supervisor (draw.io)
-- Motor: PostgreSQL 14+
--
-- Nota: los nombres de columna se pasaron a snake_case en minúsculas
-- (convención estándar en PostgreSQL). Equivalencia con el diagrama:
--   ID_Area -> id_area, ID_Empresa -> id_empresa, etc.
--
-- Única columna agregada que NO estaba en tu diagrama: `estado` en
-- Ticket, necesaria para el flujo de estados (ABIERTO, RESPONDIDO, etc.).
-- Si tu supervisor prefiere no incluirla todavía, bórrala sin problema.
-- =====================================================================

-- ---------- Area ----------

CREATE TABLE area (
    id_area     SERIAL PRIMARY KEY,
    nombre      VARCHAR(150) NOT NULL UNIQUE
);

-- ---------- Empresas ----------

CREATE TABLE empresas (
    id_empresa  SERIAL PRIMARY KEY,
    rut         VARCHAR(15) NOT NULL UNIQUE,
    nombre      VARCHAR(200) NOT NULL,
    id_area     INTEGER NOT NULL REFERENCES area(id_area)
);

CREATE INDEX idx_empresas_area ON empresas(id_area);

-- ---------- Contratos ----------

CREATE TABLE contratos (
    id_contratos    SERIAL PRIMARY KEY,
    nombre          VARCHAR(200) NOT NULL,
    id_empresa      INTEGER NOT NULL REFERENCES empresas(id_empresa),
    fecha_inicio    DATE NOT NULL,
    fecha_termino   DATE NOT NULL,
    dia_respuesta   INTEGER,  -- días para que la empresa responda (según contrato)
    CHECK (fecha_termino >= fecha_inicio)
);

CREATE INDEX idx_contratos_empresa ON contratos(id_empresa);

-- ---------- Orden de compra ----------

CREATE TABLE orden_de_compra (
    id_compra       SERIAL PRIMARY KEY,
    id_contratos    INTEGER NOT NULL REFERENCES contratos(id_contratos) ON DELETE CASCADE,
    monto           NUMERIC(14,2) NOT NULL CHECK (monto >= 0),
    fecha_compra    DATE NOT NULL
);

CREATE INDEX idx_oc_contrato ON orden_de_compra(id_contratos);

-- ---------- Rol ----------

CREATE TABLE rol (
    id_rol      SERIAL PRIMARY KEY,
    nombre      VARCHAR(50) NOT NULL UNIQUE  -- 'admin', 'director', 'supervisor_empresa'
);

INSERT INTO rol (nombre) VALUES ('admin'), ('director'), ('supervisor_empresa');

-- ---------- Usuario ----------
-- password_hash agregado: no estaba en tu captura, pero es indispensable
-- para el login. Si manejan autenticación externa (ej. SSO municipal),
-- puedes quitarla.

CREATE TABLE usuario (
    id_usuario      SERIAL PRIMARY KEY,
    nombre          VARCHAR(150) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    id_empresa      INTEGER REFERENCES empresas(id_empresa)  -- solo si es supervisor de una empresa
);

CREATE INDEX idx_usuario_empresa ON usuario(id_empresa);

-- ---------- Rol_Usuario ----------
-- UNIQUE(id_usuario): confirmado contigo que es 1 a 1 (un usuario = un rol a la vez).

CREATE TABLE rol_usuario (
    id_rol_usuario  SERIAL PRIMARY KEY,
    id_rol          INTEGER NOT NULL REFERENCES rol(id_rol),
    id_usuario      INTEGER NOT NULL UNIQUE REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

-- ---------- Observaciones ----------
-- Se crea una sola vez por ticket (confirmado): 1 ticket = 1 observación.

CREATE TABLE observaciones (
    id_observacion  SERIAL PRIMARY KEY,
    id_usuario      INTEGER NOT NULL REFERENCES usuario(id_usuario),
    descripcion     TEXT NOT NULL,
    fecha           TIMESTAMPTZ NOT NULL DEFAULT now(),
    foto            VARCHAR(500),   -- URL o path de la fotografía
    ubicacion       VARCHAR(255)
);

CREATE INDEX idx_observaciones_usuario ON observaciones(id_usuario);

-- ---------- Ticket ----------

CREATE TYPE estado_ticket AS ENUM (
    'ABIERTO',
    'RESPONDIDO',
    'REQUIERE_NUEVA_SUBSANACION',
    'VENCIDO',
    'SUBSANADO_CONFORME',
    'CERRADO'
);

CREATE TABLE ticket (
    id_ticket               SERIAL PRIMARY KEY,
    numero                  VARCHAR(30) NOT NULL UNIQUE,
    id_empresa               INTEGER NOT NULL REFERENCES empresas(id_empresa),
    id_usuario                INTEGER NOT NULL REFERENCES usuario(id_usuario),
    id_observacion            INTEGER NOT NULL UNIQUE REFERENCES observaciones(id_observacion),  -- 1:1

    prioridad                VARCHAR(20) NOT NULL DEFAULT 'Normal'
                              CHECK (prioridad IN ('Urgente', 'Muy alta', 'Alta', 'Normal', 'Baja')),

    estado                   estado_ticket NOT NULL DEFAULT 'ABIERTO',  -- agregado (ver nota arriba)

    fecha_hora_creacion       TIMESTAMPTZ NOT NULL DEFAULT now(),
    plazo_subsanar            INTEGER,     -- días hábiles de plazo
    fecha_vencimiento         DATE NOT NULL
);

CREATE INDEX idx_ticket_empresa ON ticket(id_empresa);
CREATE INDEX idx_ticket_usuario ON ticket(id_usuario);
CREATE INDEX idx_ticket_estado ON ticket(estado);
CREATE INDEX idx_ticket_vencimiento ON ticket(fecha_vencimiento);

-- =====================================================================
-- Fin del esquema
-- =====================================================================
