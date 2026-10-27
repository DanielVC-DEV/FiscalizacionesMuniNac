# modules/supervisores — supervisores de empresa

Listado y alta de supervisores. Un supervisor pertenece a una empresa y aparece luego al crear contratos y tickets.

## Archivos

- [SupervisoresScreen.tsx](SupervisoresScreen.tsx): listado, formulario de alta (nombre, correo y empresa).
- [api.ts](api.ts): `supervisoresApi` (listar, crear) y el tipo `SupervisorApi`.

## Depende de

- [empresas/api.ts](../empresas/api.ts) (lista de empresas para el formulario).
- [core/ui](../../core/ui/README.md) y [core/theme](../../core/theme/README.md).
