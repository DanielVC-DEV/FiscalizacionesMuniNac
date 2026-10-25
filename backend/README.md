# backend — API REST (Express + PostgreSQL)

Servidor que expone la API `/api/*` usada por la app móvil. Está organizado en `src/core/` (piezas compartidas) y `src/modules/` (un módulo por recurso).

## Estructura

| Carpeta / archivo | Qué contiene | README |
|---|---|---|
| [src/app.js](src/app.js) | Configura Express, CORS, JSON, rutas y manejo de errores. | [src/README.md](src/README.md) |
| [src/server.js](src/server.js) | Carga `.env` y levanta el servidor en `PORT` (3000 por defecto). | [src/README.md](src/README.md) |
| [src/core/](src/core/README.md) | Conexión a PostgreSQL y middleware de errores. | [src/core/README.md](src/core/README.md) |
| [src/modules/](src/modules/README.md) | Rutas, controladores y servicios de cada recurso. | [src/modules/README.md](src/modules/README.md) |
| [sql/](sql/README.md) | Scripts de esquema y migraciones de la base de datos. | [sql/README.md](sql/README.md) |

Comandos: `npm start` (producción) y `npm run dev` (con `--watch`).

Convención: las rutas se declaran en `*.routes.js`, la lógica en `*.controller.js` y las reglas de negocio reutilizables en servicios dentro del módulo.
