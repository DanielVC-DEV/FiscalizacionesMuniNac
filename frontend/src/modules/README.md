# modules — funcionalidades de negocio

Cada carpeta es un módulo independiente. Un módulo contiene sus pantallas, su cliente de API (`api.ts`), sus tipos (`types.ts`) y, si los necesita, su store en memoria (`store.ts`) y sus componentes propios (`components/`).

## Módulos

| Módulo | Qué hace | README |
|---|---|---|
| [menu](menu/README.md) | Menú principal con accesos a cada módulo. | [menu/README.md](menu/README.md) |
| [resumen](resumen/README.md) | Resumen de tickets por estado, con vencidos calculados. | [resumen/README.md](resumen/README.md) |
| [tickets](tickets/README.md) | Creación de tickets de fiscalización. | [tickets/README.md](tickets/README.md) |
| [contratos](contratos/README.md) | Listado, detalle y alta de contratos y órdenes de compra. | [contratos/README.md](contratos/README.md) |
| [empresas](empresas/README.md) | Listado y alta de empresas contratistas. | [empresas/README.md](empresas/README.md) |
| [areas](areas/README.md) | Listado y alta de áreas. | [areas/README.md](areas/README.md) |

## Dependencias entre módulos

- `tickets` usa `contratos` (lista de contratos, prioridades y supervisor).
- `contratos` usa `empresas` (lista de empresas y supervisores al crear un contrato).
- `empresas` usa `areas` (área de cada empresa).
- `resumen` usa `tickets` (store de tickets).
- Los demás módulos sólo dependen de [core/](../core/README.md).
