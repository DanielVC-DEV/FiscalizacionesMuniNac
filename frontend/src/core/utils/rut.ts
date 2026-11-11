// Validación y formato de RUT chileno (módulo 11). Es la misma lógica que
// backend/src/core/utils/validaciones.js: el backend siempre vuelve a validar.

// Quita puntos, guiones y espacios, y pasa la K a mayúscula.
function limpiarRut(valor: string): string {
  return valor.replace(/[.\s-]/g, '').toUpperCase();
}

function calcularDigitoVerificador(cuerpo: string): string {
  let suma = 0;
  let multiplicador = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  const resto = 11 - (suma % 11);
  if (resto === 11) return '0';
  if (resto === 10) return 'K';
  return String(resto);
}

// Da formato 12.345.678-5 mientras la persona escribe, sin validar el dígito
// verificador. Acepta con o sin puntos y guion; descarta lo que no sea número
// (la K sólo vale como último carácter) y corta en 8 dígitos más el verificador.
export function formatearRutMientrasEscribe(valor: string): string {
  const limpio = limpiarRut(valor).replace(/[^0-9K]/g, '');
  // Una K antes del final no puede ser parte del número: se descarta.
  const normal = limpio.replace(/K(?=.)/g, '').slice(0, 9);
  if (normal.length <= 1) return normal;

  const cuerpo = normal.slice(0, -1);
  const dv = normal.slice(-1);
  const conPuntos = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${conPuntos}-${dv}`;
}

// Devuelve el RUT en formato 12.345.678-5, o null si no es válido.
export function normalizarRut(valor: string): string | null {
  const coincidencia = /^(\d{7,8})([0-9K])$/.exec(limpiarRut(valor));
  if (!coincidencia) return null;

  const [, cuerpo, dv] = coincidencia;
  if (calcularDigitoVerificador(cuerpo) !== dv) return null;

  const conPuntos = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${conPuntos}-${dv}`;
}
