# backend/src

- [app.js](app.js): crea la app de Express. Monta cada módulo bajo su prefijo (`/api`, `/api/empresas`, `/api/contratos`, `/api/usuarios`, `/api/tickets`), agrega `/health` y responde 404 para rutas desconocidas.
- [server.js](server.js): punto de entrada. Carga `dotenv` y ejecuta `app.listen`.

Las carpetas de código están en [core/](core/README.md) y [modules/](modules/README.md).
