# modules/notificaciones — destinatarios de avisos por correo

Pantalla para que el administrador gestione los correos que reciben los avisos de tickets (además del supervisor responsable de cada ticket). El envío lo hace el backend ([modules/notificaciones](../../../../backend/src/modules/notificaciones/README.md)).

## Archivos

- [DestinatariosScreen.tsx](DestinatariosScreen.tsx): lista, alta, activar o desactivar y eliminar destinatarios. Sólo se registra la ruta para el rol `admin`.
- [api.ts](api.ts): `notificacionesApi` (listar, crear, cambiar activo y eliminar) y el tipo `DestinatarioApi`.

## Depende de

- [core/api](../../core/api/README.md), [core/ui](../../core/ui/README.md) (incluye `avisos`) y [core/theme](../../core/theme/README.md).
