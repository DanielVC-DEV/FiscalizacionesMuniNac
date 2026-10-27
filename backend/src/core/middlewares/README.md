# backend/src/core/middlewares

- [errorHandler.js](errorHandler.js): middleware de cuatro parámetros que registra el error y responde JSON `{ error }`. Traduce códigos de PostgreSQL: 23505 → 409, 23503 / 23514 / 22P02 / 22001 / 22007 / 22008 / 22003 → 400. Usa `err.status` cuando existe y 500 si no.

Volver al [README de core](../README.md).
