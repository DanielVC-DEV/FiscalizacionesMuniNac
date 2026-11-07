# modules/consulta — consulta externa de un ticket

Página pública de sólo lectura: quien recibe un enlace generado por un usuario municipal ve el estado y el historial de un ticket sin tener cuenta. En la web vive en `/empresa/consulta/<token>`; [App.tsx](../../../App.tsx) la detecta y la muestra sin pasar por el login ni la navegación.

## Archivos

- [ConsultaPublicaScreen.tsx](ConsultaPublicaScreen.tsx): la página pública. No muestra fotos ni nombres de usuarios internos (el backend ya los excluye).
- [api.ts](api.ts): `consultaApi` (`crearEnlace`, `listarEnlaces`, `revocarEnlace`, `consultarPublica`), `urlConsultaPublica(token)` (usa `EXPO_PUBLIC_APP_URL`, el origen web actual o el origen de la API) y los tipos `EnlaceApi`, `EnlaceCreadoApi` y `ConsultaPublicaApi`. `EXPO_PUBLIC_APP_URL` debe apuntar a una dirección accesible para quien recibe el enlace; en producción, el backend debe servir el build web en `/empresa`.

La gestión de enlaces (generar y revocar) está en el detalle del ticket: [tickets/components/EnlacesConsulta.tsx](../tickets/components/EnlacesConsulta.tsx). El token se muestra una sola vez al generarlo; en la base sólo se guarda su hash.

## Depende de

- [core/api](../../core/api/README.md), [core/ui](../../core/ui/README.md), [core/theme](../../core/theme/README.md) y [core/utils](../../core/utils/README.md).
