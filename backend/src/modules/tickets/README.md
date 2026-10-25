# modules/tickets — tickets y respuestas

## Archivos

- [tickets.routes.js](tickets.routes.js): `GET /api/tickets`, `GET /api/tickets/:id`, `POST /api/tickets`, `PATCH /api/tickets/:id/estado`, `GET/POST /api/tickets/:idTicket/respuestas`.
- [tickets.controller.js](tickets.controller.js):
  - `crear`: inserta observación y ticket en una transacción. El ticket toma el supervisor del contrato. Número generado como `TKT-<timestamp>`.
  - `listar` y `obtener`: incluyen contrato, prioridad, empresa, supervisor y observación.
  - `cambiarEstado`: delega en la máquina de estados.
- [respuestas.controller.js](respuestas.controller.js): registra la respuesta y pasa el ticket a `RESPONDIDO`. Si la transición no es válida, guarda la respuesta y devuelve un `aviso`.
- [ticketStateMachine.js](ticketStateMachine.js): `ESTADOS`, `TRANSICIONES_PERMITIDAS`, `cambiarEstadoTicket` (con `SELECT ... FOR UPDATE`) y `marcarTicketsVencidos` (pensado para correr con un cron diario).

## Transiciones permitidas

- ABIERTO → RESPONDIDO, VENCIDO
- RESPONDIDO → SUBSANADO_CONFORME, REQUIERE_NUEVA_SUBSANACION
- REQUIERE_NUEVA_SUBSANACION → RESPONDIDO, VENCIDO
- VENCIDO → RESPONDIDO
- SUBSANADO_CONFORME → CERRADO
- CERRADO → ABIERTO (reapertura)

Tablas: `ticket`, `observaciones`, `respuesta`, `contratos`, `empresas`, `usuario`, `prioridad_contrato`.

Requiere [sql/03](../../../sql/03_contrato_prioridad_respuesta.sql) para la tabla `respuesta` y la prioridad por contrato.
