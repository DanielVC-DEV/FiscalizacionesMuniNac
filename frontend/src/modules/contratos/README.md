# modules/contratos — contratos y órdenes de compra

Listado de contratos con búsqueda, detalle de un contrato y formulario de alta (datos generales, día de respuesta calculado y órdenes de compra).

## Archivos

- [ContratosScreen.tsx](ContratosScreen.tsx): listado con buscador y botón "Nuevo contrato".
- [ContratoDetalleScreen.tsx](ContratoDetalleScreen.tsx): datos generales, órdenes de compra y sección de tickets asociados (pendiente, ver abajo).
- [CrearContratoScreen.tsx](CrearContratoScreen.tsx): formulario de alta. Calcula el día de respuesta a partir de las fechas y guarda contrato y órdenes.
- [api.ts](api.ts): `contratosApi` (listar, obtener, crear, agregar orden de compra) y el tipo `ContratoApi`.
- [store.ts](store.ts): store en memoria de contratos (`cargarContratos`, `useContratos`, `addContrato`) y `contratoLabel`, el texto con que se elige un contrato.
- [types.ts](types.ts): `Contrato` y `OrdenCompra`.
- [components/DatoFila.tsx](components/DatoFila.tsx): fila etiqueta/valor del detalle.
- [components/OrdenCompraBloque.tsx](components/OrdenCompraBloque.tsx): bloque editable de una orden de compra en el formulario.

Ver también [components/README.md](components/README.md).

## Depende de

- [empresas/api.ts](../empresas/api.ts) (empresas y supervisores al crear un contrato).
- [core/ui](../../core/ui/README.md), [core/utils/fechas.ts](../../core/utils/fechas.ts), [core/utils/formato.ts](../../core/utils/formato.ts).

## Pendiente conocido

- El detalle no muestra tickets asociados: el esquema todavía no vincula tickets a un contrato.
