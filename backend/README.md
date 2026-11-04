# backend — API REST (Express + PostgreSQL)

Servidor que expone la API `/api/*` usada por la app móvil. Está organizado en `src/core/` (piezas compartidas) y `src/modules/` (un módulo por recurso).

## Estructura

| Carpeta / archivo | Qué contiene | README |
|---|---|---|
| [src/app.js](src/app.js) | Configura Express, CORS, JSON, rutas, manejo de errores y la web de empresas en `/empresa` (sirve `frontend/dist` si existe). | [src/README.md](src/README.md) |
| [src/server.js](src/server.js) | Carga `.env` y levanta el servidor en `PORT` (3000 por defecto). | [src/README.md](src/README.md) |
| [src/core/](src/core/README.md) | Conexión a PostgreSQL y middleware de errores. | [src/core/README.md](src/core/README.md) |
| [src/modules/](src/modules/README.md) | Rutas, controladores y servicios de cada recurso. | [src/modules/README.md](src/modules/README.md) |
| [sql/](sql/README.md) | Scripts de esquema y migraciones de la base de datos. | [sql/README.md](sql/README.md) |

Comandos: `npm start` (producción) y `npm run dev` (con `--watch`).

Seguridad en [src/app.js](src/app.js): cabeceras con `helmet` (sin CSP, porque el build web de Expo usa scripts en línea) y límite de 10 intentos de login por IP cada 15 minutos (`express-rate-limit`). Detrás de un proxy inverso con HTTPS, define `TRUST_PROXY=1` en `.env` para que el límite use la IP real del cliente.

Convención: las rutas se declaran en `*.routes.js`, la lógica en `*.controller.js` y las reglas de negocio reutilizables en servicios dentro del módulo.
