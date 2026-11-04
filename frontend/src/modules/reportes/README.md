# modules/reportes — indicadores y reporte PDF

Pantalla de indicadores de gestión (sólo admin y director) y descarga del reporte PDF. Los datos vienen del backend ([modules/reportes](../../../../backend/src/modules/reportes/README.md)), con filtro por periodo de creación (este mes, este trimestre o todo).

## Archivos

- [IndicadoresScreen.tsx](IndicadoresScreen.tsx): tarjetas por estado, tiempos promedio de respuesta y de cierre, y el botón de PDF. El PDF sólo se descarga desde la web; en el celular se avisa dónde obtenerlo.
- [api.ts](api.ts): `reportesApi.indicadores(filtros)` y `reportesApi.descargarPdf(filtros)` (pide el PDF con la sesión y lo entrega como archivo del navegador), más los tipos `IndicadoresApi` y `FiltrosReporte`.

## Depende de

- [core/api](../../core/api/README.md) (`API_BASE_URL`, `cabeceraAutorizacion`, `request`), [core/ui](../../core/ui/README.md) y [core/theme](../../core/theme/README.md).
