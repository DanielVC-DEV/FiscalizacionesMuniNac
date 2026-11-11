-- Ejecutar después de 07_notificacion_respuesta.sql.
-- Todo contrato debe tener supervisor: el ticket lo hereda al crearse y a él
-- se le avisa por correo. El backend ya lo exige; esto lo garantiza en la base.

ALTER TABLE contratos
    ALTER COLUMN id_supervisor SET NOT NULL;
