# modules/supervisores — supervisores de empresa

Alta y listado de usuarios con rol `supervisor_empresa`. Un supervisor queda ligado a una empresa y después se asigna a los contratos y tickets.

## Archivos

- [supervisores.routes.js](supervisores.routes.js): `GET /api/supervisores`, `POST /api/supervisores`.
- [supervisores.controller.js](supervisores.controller.js):
  - `listar`: supervisores con el nombre de su empresa.
  - `crear`: exige `nombre`, `email` e `id_empresa`. Crea el usuario y su rol en una transacción. El supervisor no inicia sesión, así que su `password_hash` es aleatorio.

Tablas: `usuario`, `rol_usuario`, `rol`, `empresas`.
