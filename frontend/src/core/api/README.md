# core/api — cliente HTTP

Cliente común para todas las llamadas al backend. Cada módulo define sus propios endpoints en `modules/<modulo>/api.ts` y usa `request` de aquí.

## Archivos

- [client.ts](client.ts): exporta `API_BASE_URL` (desde `EXPO_PUBLIC_API_URL`, por defecto `http://localhost:3000/api`) y `request<T>(path, init)`.
  - Envía `Accept: application/json` y `Content-Type` cuando hay cuerpo.
  - Devuelve `null` en respuestas 204.
  - Si la respuesta no es OK, lanza un `Error` con el mensaje `error` que envía el servidor.

## Quién lo usa

- [modules/areas/api.ts](../../modules/areas/api.ts)
- [modules/empresas/api.ts](../../modules/empresas/api.ts)
- [modules/contratos/api.ts](../../modules/contratos/api.ts)
- [modules/tickets/api.ts](../../modules/tickets/api.ts)
