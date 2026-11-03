# modules/consulta — consulta externa por enlace (sólo lectura)

Permite compartir la consulta de un ticket con personas que no tienen cuenta. El enlace no permite comentar, responder, adjuntar, cambiar estados ni dar conformidad.

## Endpoints

| Método y ruta | Acceso | Qué hace |
|---|---|---|
| `POST /api/consulta/tickets/:id/enlaces` | admin, director | Genera un enlace. Body opcional `dias_vigencia` (30 por defecto, máximo 365). El token se muestra una sola vez. |
| `GET /api/consulta/tickets/:id/enlaces` | admin, director | Lista los enlaces del ticket (sin token). |
| `DELETE /api/consulta/enlaces/:id` | admin, director | Revoca un enlace. |
| `GET /api/consulta/publica/:token` | público (sin sesión) | Devuelve sólo los antecedentes de consulta externa. |

## Qué se muestra

Número, estado, prioridad, empresa, área, contrato, fechas, observación, ubicación, respuestas (comentario y fecha, sin nombre del usuario interno) e historial (tipo, fecha y descripción). No se muestran fotografías ni datos de usuarios internos.

## Archivos

- [consulta.routes.js](consulta.routes.js): rutas privadas (con `autorizar`) y exporta `consultarPublica` para montarla antes de `exigirSesion` en [app.js](../../app.js).
- [consulta.controller.js](consulta.controller.js): genera el token, guarda sólo su SHA-256 (`consulta_externa.token_hash`), registra la actuación `ENLACE_CONSULTA` y responde la consulta pública con `Cache-Control: no-store`.

Tabla: `consulta_externa` (sql/06).

Volver al [README de módulos](../README.md).
