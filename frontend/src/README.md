# src — código de la app móvil

Código fuente de la app (Expo / React Native). Está dividido en tres capas:

| Carpeta | Qué contiene | README |
|---|---|---|
| [core/](core/README.md) | Piezas compartidas sin lógica de negocio: cliente HTTP, tema, componentes de UI y utilidades. | [core/README.md](core/README.md) |
| [navigation/](navigation/README.md) | Registro de pantallas y rutas (React Navigation). | [navigation/README.md](navigation/README.md) |
| [modules/](modules/README.md) | Un módulo por funcionalidad de negocio. Cada uno contiene sus pantallas, su API, sus tipos y su estado. | [modules/README.md](modules/README.md) |

Regla de dependencias:

- `core/` no importa de `modules/` ni de `navigation/`.
- `modules/<X>` puede importar de `core/` y, si lo necesita, de otro módulo a través de sus archivos públicos (`api.ts`, `store.ts`, `types.ts`).
- `navigation/` importa las pantallas de `modules/`. Nadie importa de `navigation/` salvo `App.tsx`.

La raíz de la app (`../App.tsx`, `../index.ts`) está documentada en el [CLAUDE.md del repositorio](../../CLAUDE.md).
