# modules/empresas — empresas contratistas

## Archivos

- [empresas.routes.js](empresas.routes.js): `GET /api/empresas`, `GET /api/empresas/:id`, `POST /api/empresas`, `GET /api/empresas/:id/supervisores`, `PATCH /api/empresas/:id/supervisor-contraparte`.
- [empresas.controller.js](empresas.controller.js):
  - `listar` y `obtener`: incluyen el área y el supervisor contraparte.
  - `crear`: exige `razon_social`, `rut` e `id_area`.
  - `listarSupervisores`: usuarios de la empresa con rol `supervisor_empresa`.
  - `asignarSupervisorContraparte`: sólo acepta un usuario de la misma empresa con ese rol.

Tablas: `empresas`, `area`, `usuario`, `rol_usuario`, `rol`.
