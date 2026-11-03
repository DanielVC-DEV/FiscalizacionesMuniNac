-- Registra también las notificaciones enviadas cuando la empresa responde
-- una solicitud de subsanación.

ALTER TABLE notificacion
    DROP CONSTRAINT notificacion_tipo_check;

ALTER TABLE notificacion
    ADD CONSTRAINT notificacion_tipo_check
    CHECK (tipo IN ('CREACION', 'SOLICITUD', 'RESPUESTA', 'RECORDATORIO', 'VENCIMIENTO'));
