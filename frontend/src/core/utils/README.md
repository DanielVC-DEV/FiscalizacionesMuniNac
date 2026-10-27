# core/utils — utilidades puras

Funciones sin efectos secundarios. No llaman a la API ni tocan estado.

## Archivos

- [fechas.ts](fechas.ts): `MESES`, `esBisiesto`, `diasEnMes`, `parsearFecha` (`dd/mm/aaaa` → `Date`), `formatearDDMMAAAA`, `esFechaPasada` (para el estado VENCIDO derivado), `hoyComoTexto`, `diferenciaEnDias` y `fechaDesdeApi` (ISO de la API → `dd/mm/aaaa`).
- [businessDays.ts](businessDays.ts): `sumarDiasHabiles` (salta sábados y domingos; **no** descuenta feriados) y `formatearFecha`.
- [formato.ts](formato.ts): `formatearMonto` para pesos chilenos, sin `Intl`.
- [rut.ts](rut.ts): `normalizarRut` valida un RUT chileno (dígito verificador) y lo devuelve como `12.345.678-5`, o `null` si no es válido. Misma lógica que `backend/src/core/utils/validaciones.js`.
