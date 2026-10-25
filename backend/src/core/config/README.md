# backend/src/core/config

- [db.js](db.js): exporta un `Pool` de `pg` configurado con `DATABASE_URL`. Todos los módulos usan este pool; las transacciones piden un cliente con `pool.connect()`.

Volver al [README de core](../README.md).
