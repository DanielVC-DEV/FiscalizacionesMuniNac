# modules/reportes — indicadores y reporte PDF

Indicadores de gestión y reporte PDF de los tickets, con los mismos filtros del listado de tickets. Sólo para admin y director.

## Endpoints

| Método y ruta | Qué devuelve |
|---|---|
| `GET /api/reportes/indicadores` | Totales por estado, pendientes de revisión, tiempo promedio de respuesta y de cierre (en días). |
| `GET /api/reportes/pdf` | PDF con periodo y filtros, indicadores, listado de tickets y detalle de cada uno con su historial. |

Filtros (query string): `numero`, `id_empresa`, `id_area`, `id_supervisor`, `id_creador`, `estado` (CSV), `prioridad`, `creada_desde`, `creada_hasta`, `vence_desde`, `vence_hasta`, `cerrada_desde`, `cerrada_hasta`.

## Definiciones

- **Pendientes de revisión**: tickets en `RESPONDIDO` (respuesta recibida, falta la revisión municipal).
- **Tiempo promedio de respuesta**: desde la creación hasta la primera actuación de tipo `RESPUESTA`.
- **Tiempo promedio de cierre**: desde la creación hasta `fecha_cierre`, sólo para tickets cerrados.

## Archivos

- [reportes.routes.js](reportes.routes.js): declara las dos rutas y la autorización.
- [reportes.controller.js](reportes.controller.js): calcula los indicadores en SQL (`FILTER`) sobre `SELECT_TICKETS` de [tickets/ticketFiltros.js](../tickets/ticketFiltros.js) y arma el detalle.
- [reportePdf.js](reportePdf.js): dibuja el PDF con pdfkit. Lista las fotos por cantidad; no las incrusta.

Volver al [README de módulos](../README.md).
