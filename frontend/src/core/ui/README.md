# core/ui — componentes reutilizables

Componentes visuales compartidos. Son genéricos: reciben datos y callbacks por props.

## Archivos

| Archivo | Para qué sirve |
|---|---|
| [Button.tsx](Button.tsx) | Botón con variantes `primario`, `secundario`, `suave` y `punteado`, con estado de carga. |
| [Card.tsx](Card.tsx) | Contenedor blanco con borde suave. |
| [DateField.tsx](DateField.tsx) | Selector de fecha en tres partes (día, mes, año) que devuelve `dd/mm/aaaa`. |
| [EstadoBadge.tsx](EstadoBadge.tsx) | Insignia de color por estado de ticket. |
| [avisos.ts](avisos.ts) | `avisar(titulo, mensaje)` y `confirmar(titulo, mensaje)`: avisos y confirmaciones que funcionan en celular (`Alert`) y en navegador (`window.alert/confirm`), donde `Alert.alert` no hace nada. Todas las pantallas usan estos en vez de `Alert`. |
| [MarcoWeb.tsx](MarcoWeb.tsx) | Sólo en navegador: hace que la app ocupe toda la ventana, como una página web. En el celular no hace nada. Se usa en [App.tsx](../../../App.tsx). |
| [anchoWeb.ts](anchoWeb.ts) | `CONTENIDO_WEB`: estilo que centra el contenido de formularios y listados con un ancho máximo (`ANCHO_CONTENIDO_WEB`, 1280 px) en la web, dejando margen a los lados. En el celular no cambia nada. Se aplica en el `contentContainerStyle` de cada pantalla. |
| [Header.tsx](Header.tsx) | Barra de marca con logo y nombre de la municipalidad. Acepta `derecha` (contenido opcional a la derecha). La sesión la arma [SesionHeader](../../modules/auth/components/SesionHeader.tsx). |
| [SeccionLabel.tsx](SeccionLabel.tsx) | Título de subsección con marca azul. |
| [SelectField.tsx](SelectField.tsx) | Campo de selección que abre una hoja con opciones. |
| [TarjetaSeccion.tsx](TarjetaSeccion.tsx) | `TarjetaSeccion`: tarjeta con título, descripción y línea divisoria para agrupar los campos de un formulario. `FilaCampos`: pone sus hijos en columnas iguales desde 720 px de ancho y uno bajo otro en el celular. |
| [TopBar.tsx](TopBar.tsx) | Barra de título con botón volver. |

## Dependencias

- Colores y radios: [core/theme](../theme/README.md).
- `DateField` usa [core/utils/fechas.ts](../utils/fechas.ts).
