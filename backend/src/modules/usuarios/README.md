# modules/usuarios — usuarios

Listado de usuarios con su rol, y alta de usuario con su rol en una sola transacción.

## Archivos

- [usuarios.routes.js](usuarios.routes.js): `GET /api/usuarios`, `POST /api/usuarios`.
- [usuarios.controller.js](usuarios.controller.js): `listar` (une `rol_usuario` y `rol`) y `crear` (inserta en `usuario` y `rol_usuario` dentro de `BEGIN/COMMIT`).

Tablas: `usuario`, `rol_usuario`, `rol`.

Nota: el alta recibe `password_hash` ya calculado; el controlador no genera hashes.
