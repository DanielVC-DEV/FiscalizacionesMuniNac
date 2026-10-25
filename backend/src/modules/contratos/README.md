# modules/contratos — contratos, órdenes de compra y prioridades

## Archivos

- [contratos.routes.js](contratos.routes.js): `GET /api/contratos`, `GET /api/contratos/:id`, `POST /api/contratos`, `PUT /api/contratos/:id`, `DELETE /api/contratos/:id`, `POST /api/contratos/:id/ordenes-compra`, `PATCH /api/contratos/prioridades/:idPrioridad`.
- [contratos.controller.js](contratos.controller.js): CRUD de contratos. `crear` valida que el supervisor pertenezca a la empresa con rol `supervisor_empresa`. `eliminar` devuelve 400 si hay tickets que lo referencian.
- [ordenesCompra.controller.js](ordenesCompra.controller.js): `agregarOrdenCompra`.
- [prioridades.controller.js](prioridades.controller.js): `actualizarPrioridad`. Sólo cambia `dias_habiles`; los cinco nombres de prioridad los crea un trigger de la base de datos.

Tablas: `contratos`, `orden_de_compra`, `prioridad_contrato`, `empresas`, `usuario`, `rol_usuario`, `rol`.

Requiere [sql/03](../../../sql/03_contrato_prioridad_respuesta.sql) para prioridades y [sql/04](../../../sql/04_supervisor_contrato.sql) para el supervisor del contrato.
