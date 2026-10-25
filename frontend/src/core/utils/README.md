# core/utils — utilidades puras

Funciones sin efectos secundarios. No llaman a la API ni tocan estado.

## Archivos

- [fechas.ts](fechas.ts): `MESES`, `esBisiesto`, `diasEnMes`, `parsearFecha` (`dd/mm/aaaa` → `Date`), `formatearDDMMAAAA`, `esFechaPasada` (para el estado VENCIDO derivado), `hoyComoTexto`, `diferenciaEnDias` y `fechaDesdeApi` (ISO de la API → `dd/mm/aaaa`).
- [businessDays.ts](businessDays.ts): `sumarDiasHabiles` (salta sábados y domingos; **no** descuenta feriados) y `formatearFecha`.
- [formato.ts](formato.ts): `formatearMonto` para pesos chilenos, sin `Intl`.
