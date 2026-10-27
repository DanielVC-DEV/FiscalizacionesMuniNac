# backend/src/core — piezas compartidas

- [config/db.js](config/db.js): pool de conexiones a PostgreSQL (`DATABASE_URL`). Ver [config/README.md](config/README.md).
- [middlewares/errorHandler.js](middlewares/errorHandler.js): traduce errores de PostgreSQL (23505, 23503, 23514, y formato/largo 22P02, 22001, 22007, 22008, 22003) a respuestas 400/409 legibles y el resto a 500. Ver [middlewares/README.md](middlewares/README.md).
- [utils/validaciones.js](utils/validaciones.js): validaciones compartidas (RUT, IDs, fechas, montos, textos). Ver [utils/README.md](utils/README.md).

Nada aquí conoce un recurso concreto.
