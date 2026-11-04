# modules/catalogos — catálogos (áreas y roles)

Lectura y alta de áreas, y lectura de roles. La lectura es sólo para admin y director; el alta, sólo para admin.

## Archivos

- [catalogos.routes.js](catalogos.routes.js): `GET /api/areas`, `POST /api/areas`, `GET /api/roles`.
- [catalogos.controller.js](catalogos.controller.js): `listarAreas`, `crearArea` (valida `nombre`), `listarRoles`.

Tablas: `area`, `rol`.
