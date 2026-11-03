# modules/feriados — feriados para días hábiles

Los plazos de subsanación se cuentan en días hábiles (informe, sección 8). Esta tabla es la que el cálculo consulta para saltarse los feriados.

## Archivos

- [feriados.routes.js](feriados.routes.js): `GET /api/feriados` (admin, director), `POST /api/feriados` y `DELETE /api/feriados/:fecha` (sólo admin).
- [feriados.controller.js](feriados.controller.js): listado, alta o corrección (upsert por fecha) y eliminación.
- [feriados.service.js](feriados.service.js): `cargarFeriados(client)`, que devuelve un `Set` con las fechas `aaaa-mm-dd`. Lo usa el alta de tickets.

Tabla: `feriado` (sql/06). Sin feriados cargados, sólo se saltan sábados y domingos.

Volver al [README de módulos](../README.md).
