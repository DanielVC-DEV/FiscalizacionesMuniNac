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

Volver al [README de core](../README.md).
