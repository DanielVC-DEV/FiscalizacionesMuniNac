# modules/notificaciones — correos, destinatarios y recordatorios

Avisos sobre tickets: al crearlo, al solicitar una nueva subsanación, al recibir la respuesta de la empresa y recordatorios o vencimientos de los pendientes.

## Destinatarios

Cada aviso va al supervisor responsable del ticket o, para una respuesta de subsanación, al creador municipal del ticket, además de los destinatarios activos configurados por el administrador. Cada envío queda en la tabla `notificacion` con su estado (`ENVIADA`, `FALLIDA` o `SIN_CONFIGURAR`) y en el historial del ticket.

## Archivos

- [notificaciones.routes.js](notificaciones.routes.js): `GET/POST /api/notificaciones/destinatarios`, `PATCH/DELETE /api/notificaciones/destinatarios/:id` y `POST /api/notificaciones/mantenimiento`. Todo es sólo para admin.
- [notificaciones.controller.js](notificaciones.controller.js): administración de destinatarios y disparo manual del mantenimiento.
- [notificaciones.service.js](notificaciones.service.js): `notificarTicket(pool, idTicket, tipo)` arma el correo, envía y registra. Incluye avisos `RESPUESTA`; `destinatariosDelTicket` quita duplicados por correo.
- [mantenimiento.js](mantenimiento.js): `ejecutarMantenimiento` marca como `VENCIDO` los tickets con plazo vencido y avisa de los pendientes, como máximo un aviso por ticket y día. `iniciarMantenimiento` lo programa desde [server.js](../../server.js).

## Configuración (variables de entorno)

| Variable | Uso |
|---|---|
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE` | Servidor de correo. Sin `SMTP_HOST` los avisos quedan como `SIN_CONFIGURAR` y no fallan. |
| `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Credenciales y remitente. |
| `APP_URL` | Enlace de acceso que aparece en los correos. |
| `MANTENIMIENTO_ACTIVO` | `false` desactiva el mantenimiento automático. |
| `MANTENIMIENTO_CADA_HORAS` | Frecuencia del mantenimiento (6 por defecto). |

Usa [core/utils/correo.js](../../core/utils/README.md) para enviar. Tablas: `destinatario_notificacion`, `notificacion` (sql/06).

Volver al [README de módulos](../README.md).
