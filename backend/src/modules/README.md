# backend/src/modules — recursos de la API

Cada carpeta es un recurso con sus rutas y controladores. Las rutas se montan en [app.js](../app.js).

| Módulo | Prefijo | Archivos | README |
|---|---|---|---|
| catalogos | `/api/areas`, `/api/roles` | controller, routes | [catalogos/README.md](catalogos/README.md) |
| usuarios | `/api/usuarios` | controller, routes | [usuarios/README.md](usuarios/README.md) |
| empresas | `/api/empresas` | controller, routes | [empresas/README.md](empresas/README.md) |
| contratos | `/api/contratos` | controller, routes, órdenes de compra, prioridades | [contratos/README.md](contratos/README.md) |
| tickets | `/api/tickets` | controller, routes, respuestas, máquina de estados | [tickets/README.md](tickets/README.md) |

## Dependencias entre módulos

- `tickets` toma el supervisor y la prioridad desde el contrato (por SQL, al crear el ticket).
- `contratos` y `empresas` validan que el supervisor tenga rol `supervisor_empresa`.
- Todos usan [core/config/db.js](../core/config/README.md).
