# modules/tickets — creación de tickets

Registro y subsanación de tickets de fiscalización: formulario inicial, seguimiento de respuestas y revisión municipal. El plazo y la fecha de vencimiento se calculan con los días hábiles de la prioridad del contrato.

## Archivos

- [CrearTicketScreen.tsx](CrearTicketScreen.tsx): pantalla del formulario, validaciones, ubicación GPS y envío.
- [TicketDetalleScreen.tsx](TicketDetalleScreen.tsx): detalle e historial del ticket; permite responder, solicitar nueva subsanación, dar conformidad y cerrar según el rol y estado. Admin y director pueden enviar una respuesta para probar el flujo; la respuesta operativa corresponde al supervisor de empresa.
- [api.ts](api.ts): `ticketsApi` para listar, crear, consultar detalle, responder, revisar y cerrar; tipos de respuestas e historial.
- [store.ts](store.ts): store en memoria de tickets (`cargarTickets`, `useTickets`, `addTicket`).
- [types.ts](types.ts): `Prioridad`, `PRIORIDADES`, `DIAS_PLAZO_POR_PRIORIDAD`, `EstadoTicket` y la interfaz `Ticket`.
- [components/FotosField.tsx](components/FotosField.tsx): captura de fotos (cámara o galería) con miniaturas.

Ver también [components/README.md](components/README.md).

## Depende de

- [contratos/store.ts](../contratos/store.ts) (`useContratos`, `cargarContratos`, `contratoLabel`) y [contratos/api.ts](../contratos/api.ts) (`contratosApi.obtener` para las prioridades).
- [core/utils/businessDays.ts](../../core/utils/businessDays.ts)
- [core/ui](../../core/ui/README.md) y [core/theme](../../core/theme/README.md)

## Pendiente conocido

- Las fotos no se envían al backend: el servidor todavía no admite carga de archivos.
