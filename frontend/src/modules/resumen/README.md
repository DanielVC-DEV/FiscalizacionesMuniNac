# modules/resumen — resumen de tickets

Muestra los tickets agrupados por estado, con indicadores de pendientes, vencidos y requieren nueva subsanación, y un buscador.

## Archivos

- [ResumenScreen.tsx](ResumenScreen.tsx): pantalla del celular: encabezado, barra con volver y el panel.
- [components/ResumenPanel.tsx](components/ResumenPanel.tsx): contenido del resumen. Calcula el estado VENCIDO a partir de la fecha de vencimiento (no es un estado guardado, sección 13 del informe) y recarga tickets al enfocar la pantalla. También es el panel de inicio del menú en la web (lo inyecta [navigation/AppNavigator.tsx](../../navigation/AppNavigator.tsx)).
- [components/Stat.tsx](components/Stat.tsx): tarjeta de indicador numérico.
- [components/FilaEstado.tsx](components/FilaEstado.tsx): acordeón por estado con la lista de tickets y acceso a su detalle.

Ver también [components/README.md](components/README.md).

## Depende de

- [tickets/store.ts](../tickets/store.ts) y [tickets/types.ts](../tickets/types.ts)
- [core/utils/fechas.ts](../../core/utils/fechas.ts) (`esFechaPasada`)
- [core/ui](../../core/ui/README.md) y [core/theme](../../core/theme/README.md)
