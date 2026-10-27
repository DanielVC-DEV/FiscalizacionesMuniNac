# core — piezas compartidas

Código reutilizable por todos los módulos. No contiene lógica de una funcionalidad concreta.

## Subcarpetas

| Carpeta | Contenido | README |
|---|---|---|
| [api/](api/README.md) | Cliente HTTP base (`client.ts`). | [api/README.md](api/README.md) |
| [theme/](theme/README.md) | Paleta oficial, radios y sombras (`colors.ts`). | [theme/README.md](theme/README.md) |
| [ui/](ui/README.md) | Componentes visuales reutilizables. | [ui/README.md](ui/README.md) |
| [utils/](utils/README.md) | Fechas, días hábiles, formato de montos y validación de RUT. | [utils/README.md](utils/README.md) |

## Reglas

- Un componente de `ui/` no conoce la API ni los tipos de un módulo.
- Las utilidades son funciones puras (no hacen llamadas de red ni leen estado global).
