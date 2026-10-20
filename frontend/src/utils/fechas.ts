// Utilidades para manejar fechas como fecha (día/mes/año), no como texto
// libre, y para validar que sean coherentes (día válido según el mes y el
// año, por ejemplo que febrero no tenga 30 días).

export const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export function esBisiesto(anio: number): boolean {
  return (anio % 4 === 0 && anio % 100 !== 0) || anio % 400 === 0;
}

// mes: 1-12
export function diasEnMes(mes: number, anio: number): number {
  const dias = [31, esBisiesto(anio) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return dias[mes - 1] ?? 31;
}

// Convierte "dd/mm/aaaa" a Date, o null si el texto no es una fecha
// completa y válida (día fuera de rango para ese mes/año, etc.).
export function parsearFecha(texto: string): Date | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto.trim());
  if (!match) return null;
  const dia = Number(match[1]);
  const mes = Number(match[2]);
  const anio = Number(match[3]);
  if (mes < 1 || mes > 12) return null;
  if (dia < 1 || dia > diasEnMes(mes, anio)) return null;
  return new Date(anio, mes - 1, dia);
}

export function formatearDDMMAAAA(dia: number, mes: number, anio: number): string {
  return `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${anio}`;
}

// true si "dd/mm/aaaa" ya pasó (es anterior a hoy). Sirve para marcar un
// ticket como vencido sin guardar "VENCIDO" como si fuera un estado
// propio (sección 13 del informe: el vencimiento se calcula, no se
// declara).
export function esFechaPasada(texto: string): boolean {
  const fecha = parsearFecha(texto);
  if (!fecha) return false;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return fecha.getTime() < hoy.getTime();
}

// Fecha de hoy como "dd/mm/aaaa", para el botón "Usar fecha actual".
export function hoyComoTexto(): string {
  const hoy = new Date();
  return formatearDDMMAAAA(hoy.getDate(), hoy.getMonth() + 1, hoy.getFullYear());
}

// Diferencia en días de calendario entre dos fechas (se asume que "hasta"
// es posterior a "desde"). Se usa para calcular el "día de respuesta a
// ticket" del contrato automáticamente a partir de la fecha de inicio y
// de término, en vez de que la persona lo cuente a mano.
export function diferenciaEnDias(desde: Date, hasta: Date): number {
  const unDiaMs = 24 * 60 * 60 * 1000;
  const a = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate());
  const b = new Date(hasta.getFullYear(), hasta.getMonth(), hasta.getDate());
  return Math.round((b.getTime() - a.getTime()) / unDiaMs);
}
