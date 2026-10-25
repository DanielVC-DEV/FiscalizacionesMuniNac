# core/ui — componentes reutilizables

Componentes visuales compartidos. Son genéricos: reciben datos y callbacks por props.

## Archivos

| Archivo | Para qué sirve |
|---|---|
| [Button.tsx](Button.tsx) | Botón con variantes `primario`, `secundario`, `suave` y `punteado`, con estado de carga. |
| [Card.tsx](Card.tsx) | Contenedor blanco con borde suave. |
| [DateField.tsx](DateField.tsx) | Selector de fecha en tres partes (día, mes, año) que devuelve `dd/mm/aaaa`. |
| [EstadoBadge.tsx](EstadoBadge.tsx) | Insignia de color por estado de ticket. |
| [Header.tsx](Header.tsx) | Barra de marca con logo y nombre de la municipalidad. |
| [SeccionLabel.tsx](SeccionLabel.tsx) | Título de subsección con marca azul. |
| [SelectField.tsx](SelectField.tsx) | Campo de selección que abre una hoja con opciones. |
| [TopBar.tsx](TopBar.tsx) | Barra de título con botón volver. |

## Dependencias

- Colores y radios: [core/theme](../theme/README.md).
- `DateField` usa [core/utils/fechas.ts](../utils/fechas.ts).
