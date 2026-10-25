# backend/src/core — piezas compartidas

- [config/db.js](config/db.js): pool de conexiones a PostgreSQL (`DATABASE_URL`). Ver [config/README.md](config/README.md).
- [middlewares/errorHandler.js](middlewares/errorHandler.js): traduce errores de PostgreSQL (23505, 23503, 23514) a respuestas 409/400 legibles y el resto a 500. Ver [middlewares/README.md](middlewares/README.md).

Nada aquí conoce un recurso concreto.
