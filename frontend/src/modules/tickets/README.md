# modules/tickets — creación de tickets

Registro y subsanación de tickets de fiscalización: formulario inicial, seguimiento de respuestas y revisión municipal. El plazo y la fecha de vencimiento se calculan con los días hábiles de la prioridad del contrato.

## Archivos

- [CrearTicketScreen.tsx](CrearTicketScreen.tsx): pantalla del formulario, validaciones, ubicación GPS y envío.
- [TicketDetalleScreen.tsx](TicketDetalleScreen.tsx): detalle e historial del ticket; permite responder (con fotos), solicitar nueva subsanación, dar conformidad, cerrar y reabrir según el rol y estado; conformidad, cierre y reapertura piden confirmación. Admin y director pueden enviar una respuesta para probar el flujo; la respuesta operativa corresponde al supervisor de empresa.
- [api.ts](api.ts): `ticketsApi` para listar, crear, consultar detalle, responder, revisar y cerrar; tipos de respuestas e historial.
- [store.ts](store.ts): store en memoria de tickets (`cargarTickets`, `useTickets`, `addTicket`).
- [types.ts](types.ts): `Prioridad`, `PRIORIDADES`, `DIAS_PLAZO_POR_PRIORIDAD`, `EstadoTicket` y la interfaz `Ticket`.
- [components/FotosField.tsx](components/FotosField.tsx): captura de fotos (cámara o galería) con miniaturas; las guarda en base64 para enviarlas al servidor.

Ver también [components/README.md](components/README.md).

## Depende de

- [contratos/store.ts](../contratos/store.ts) (`useContratos`, `cargarContratos`, `contratoLabel`) y [contratos/api.ts](../contratos/api.ts) (`contratosApi.obtener` para las prioridades).
- [core/utils/businessDays.ts](../../core/utils/businessDays.ts)
- [core/ui](../../core/ui/README.md) y [core/theme](../../core/theme/README.md)

## Pendiente conocido

- Las fotos del historial se muestran sólo como conteo; falta una vista que las descargue con la sesión (`GET /api/tickets/archivos/:id` exige token).
- La cámara y la ubicación en navegador dependen de `expo-image-picker` y `expo-location` y requieren HTTPS (o localhost); no se probaron con dispositivo real.
