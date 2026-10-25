# core/theme — tema visual

Colores, radios, espacios y sombras de la app. Es la única fuente de colores: no se escriben códigos hex en las pantallas.

## Archivos

- [colors.ts](colors.ts)
  - `COLORS`: colores oficiales del informe (azul, rojo, verde, amarillo), sus variantes y los neutros.
  - `COLOR_ESTADO`: color, fondo suave, color oscuro y etiqueta por estado de ticket (sección 13 del informe) más `VENCIDO`.
  - `RADIOS`, `ESPACIOS`, `SOMBRA`.

## Quién lo usa

Todos los componentes de [ui/](../ui/README.md) y todas las pantallas de `modules/`.
