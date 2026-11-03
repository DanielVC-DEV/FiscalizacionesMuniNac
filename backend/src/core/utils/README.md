# backend/src/core/utils — validaciones compartidas

Funciones puras (sin base de datos ni respuesta HTTP). Cada controlador decide qué responder cuando algo no pasa.

## Archivos

- [validaciones.js](validaciones.js):
  - `normalizarRut`: valida el RUT con dígito verificador (módulo 11) y lo devuelve en formato `12.345.678-5`, o `null` si no es válido.
  - `esIdValido`: ID entero positivo que cabe en INTEGER (sirve para parámetros de URL y campos del body).
  - `esEnteroPositivo`: número entero mayor a 0.
  - `esMontoValido`: monto numérico mayor a 0 dentro de NUMERIC(14,2).
  - `esFechaISO`: fecha `aaaa-mm-dd` que realmente existe.
  - `textoValido` / `textoOpcional`: texto obligatorio u opcional, con largo máximo.
  - `esEmailValido`: correo con forma `algo@dominio.ext` y máximo 150 caracteres.
  - `esPasswordValida`: 8 a 128 caracteres, con al menos una letra y un número.
- [passwords.js](passwords.js):
  - `hashPassword`: genera el hash scrypt (`scrypt$N$r$p$salt$hash`) con sal aleatoria.
  - `verificarPassword`: compara en tiempo constante. Sin hash guardado también calcula un scrypt, para que la respuesta tarde lo mismo.
- [diasHabiles.js](diasHabiles.js): `hoyEnChile` (fecha de hoy en America/Santiago) y `sumarDiasHabiles(desdeISO, dias, feriados)`, que cuenta desde el día siguiente saltando fines de semana y feriados. Trabaja en UTC.
- [correo.js](correo.js): `enviarCorreo` con nodemailer. Sin `SMTP_HOST` no falla: devuelve `configurado: false`.
- [archivos.js](archivos.js): `guardarImagen` (acepta data URL base64 de JPEG, PNG o WEBP), `borrarArchivo`, `rutaAbsoluta` (rechaza rutas fuera de `backend/uploads`) y `MAX_IMAGENES_POR_ACTUACION`.
- [transaccion.js](transaccion.js): `enTransaccion(pool, funcion)`: BEGIN, COMMIT o ROLLBACK alrededor de la función.

Volver al [README de core](../README.md).
