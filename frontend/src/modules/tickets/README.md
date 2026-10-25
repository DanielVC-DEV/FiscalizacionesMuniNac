# modules/tickets — creación de tickets

Formulario para registrar una fiscalización: contrato, prioridad, observación, fotos y ubicación. El plazo y la fecha de vencimiento se calculan con los días hábiles de la prioridad del contrato.

## Archivos

- [CrearTicketScreen.tsx](CrearTicketScreen.tsx): pantalla del formulario, validaciones, ubicación GPS y envío.
- [api.ts](api.ts): `ticketsApi` (listar y crear) y el tipo `TicketApi`.
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
