# modules/tickets/components

- [FotosHistorial.tsx](FotosHistorial.tsx): miniaturas ampliables de las fotos de una actuación del historial. Las descarga con la sesión: en la web con `fetch` y un objeto local (`Image` no envía cabeceras en el navegador), en el celular con cabeceras en `Image`.
- [EnlacesConsulta.tsx](EnlacesConsulta.tsx): generar, listar y revocar enlaces de consulta externa de un ticket (sólo usuarios municipales). El enlace completo se muestra una sola vez, se puede abrir desde la pantalla y se copia al portapapeles cuando el navegador lo permite.
- [FotosField.tsx](FotosField.tsx): campo de fotografías. Exporta también la interfaz `Foto` (con `dataUrl` en base64) y `MAX_FOTOS`. Recibe `fotos` y `onChange` y gestiona los permisos de cámara y galería.

Volver al [README del módulo tickets](../README.md).
