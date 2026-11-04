# modules/tickets — tickets, historial, respuestas y archivos

## Endpoints

| Método y ruta | Quién | Qué hace |
|---|---|---|
| `GET /api/tickets` | todos (alcance por rol) | Listado con filtros: número, empresa, área, supervisor, creador, estado (CSV), prioridad, rangos de creación, vencimiento y cierre. |
| `POST /api/tickets` | admin, director | Crea observación y ticket en una transacción. Plazo y vencimiento se calculan en el servidor. |
| `GET /api/tickets/:id` | todos (alcance por rol) | Detalle: ticket, contrato con órdenes de compra, respuestas e historial. El supervisor de empresa no ve las actuaciones internas (`NOTIFICACION`, `RECORDATORIO`, `ENLACE_CONSULTA`), porque incluyen correos de destinatarios. |
| `PATCH /api/tickets/:id/estado` | admin, director | Cambio genérico de estado. No acepta `SUBSANADO_CONFORME` ni `CERRADO`. |
| `POST /api/tickets/:id/solicitar-subsanacion` | admin, director | Ticket `RESPONDIDO` → `REQUIERE_NUEVA_SUBSANACION` con comentario obligatorio. Notifica. |
| `POST /api/tickets/:id/conformidad` | admin, director | `RESPONDIDO` → `SUBSANADO_CONFORME`. Registra quién dio la conformidad, cuándo y comentario. |
| `POST /api/tickets/:id/cerrar` | admin, director | `SUBSANADO_CONFORME` → `CERRADO`. Registra quién cerró y comentario final. |
| `POST /api/tickets/:id/reabrir` | admin, director | `CERRADO` → `ABIERTO`, con motivo obligatorio. El historial se conserva. |
| `GET /api/tickets/:idTicket/respuestas` | todos (alcance por rol) | Respuestas de la empresa. |
| `POST /api/tickets/:idTicket/respuestas` | todos (alcance por rol) | Registra la respuesta y pasa el ticket a `RESPONDIDO`. |
| `GET /api/tickets/archivos/:idArchivo` | todos (alcance por rol) | Descarga una fotografía del ticket. |

El alcance por rol está en [ticketAcceso.js](ticketAcceso.js): el supervisor de empresa sólo ve y responde tickets de su empresa; un ticket fuera de su alcance responde 404.

## Archivos

- [tickets.routes.js](tickets.routes.js): declara las URL, los verbos y la autorización (`soloMunicipal`).
- [tickets.controller.js](tickets.controller.js): listado, detalle, creación, cambios de estado, conformidad, cierre y reapertura.
  - `crear`: el creador sale de la sesión (no del cuerpo). El plazo viene de `prioridad_contrato.dias_habiles` y el vencimiento se calcula con `sumarDiasHabiles` y los feriados. Guarda ubicación completa y fotos. Notifica después de confirmar la transacción.
- [respuestas.controller.js](respuestas.controller.js): la respuesta, su actuación y el paso a `RESPONDIDO` van en una sola transacción. Si el ticket no puede pasar a `RESPONDIDO`, la respuesta queda guardada y se devuelve un `aviso`; después se notifica por correo al creador municipal y a los destinatarios configurados.
- [archivos.controller.js](archivos.controller.js): entrega el archivo sólo si el usuario puede ver el ticket.
- [ticketStateMachine.js](ticketStateMachine.js): `ESTADOS`, `TRANSICIONES_PERMITIDAS`, `transicionar` (dentro de una transacción ya abierta), `cambiarEstadoTicket` (abre su propia transacción) y `marcarTicketsVencidos` (lo usa el mantenimiento diario). Cada transición escribe su actuación.
- [actuaciones.js](actuaciones.js): `registrarActuacion`, `obtenerHistorial` y `TIPOS_SOLO_MUNICIPALES` (actuaciones que no se muestran a empresas ni en la consulta externa). El historial (`ticket_actuacion`) es append-only: un trigger en la base impide editarlo o borrarlo.
- [fotos.js](fotos.js): `validarFotos` y `registrarFotos`. Cada foto se guarda en disco y queda en `archivo` ligada a su actuación.
- [ticketFiltros.js](ticketFiltros.js): `SELECT_TICKETS` (consulta base compartida con reportes y notificaciones) y `construirFiltros` (filtros parametrizados).
- [ticketAcceso.js](ticketAcceso.js): `puedeVerTicket`, `esMunicipal` y `ROLES_GESTION`.

## Transiciones permitidas

- ABIERTO → RESPONDIDO, VENCIDO
- RESPONDIDO → SUBSANADO_CONFORME, REQUIERE_NUEVA_SUBSANACION
- REQUIERE_NUEVA_SUBSANACION → RESPONDIDO, VENCIDO
- VENCIDO → RESPONDIDO
- SUBSANADO_CONFORME → CERRADO
- CERRADO → ABIERTO (reapertura)

Nota: el informe describe `RESPONDIDO` como "revisada, con aspectos pendientes" y `ABIERTO` como "respuesta pendiente de revisión". La máquina actual usa `RESPONDIDO` como "respuesta recibida, pendiente de revisión". Ver la nota en [CLAUDE.md](../../../../CLAUDE.md) de pendientes.

## Tablas

`ticket`, `observaciones`, `respuesta`, `ticket_actuacion`, `archivo`, `contratos`, `empresas`, `area`, `usuario`, `prioridad_contrato`, `feriado`, `notificacion`.

Requiere las migraciones [sql/03](../../../sql/03_contrato_prioridad_respuesta.sql) (respuesta y prioridades), [sql/06](../../../sql/06_fiscalizacion.sql) (historial, archivos y conformidad) y [sql/07](../../../sql/07_notificacion_respuesta.sql) (tipo de notificación por respuesta).
