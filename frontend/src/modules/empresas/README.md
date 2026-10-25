# modules/empresas — empresas contratistas

Listado de empresas y formulario de alta. El área es obligatoria y se elige de las áreas registradas.

## Archivos

- [EmpresasScreen.tsx](EmpresasScreen.tsx): listado, formulario de alta y enlace al módulo de áreas si no hay ninguna.
- [api.ts](api.ts): `empresasApi` (listar, crear, listar supervisores) y los tipos `EmpresaApi` y `SupervisorApi`.

## Depende de

- [areas/api.ts](../areas/api.ts) (lista de áreas).
- [core/ui](../../core/ui/README.md) y [core/theme](../../core/theme/README.md).
