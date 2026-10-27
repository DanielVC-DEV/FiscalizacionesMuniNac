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

// Devuelve el RUT en formato 12.345.678-5, o null si no es válido.
export function normalizarRut(valor: string): string | null {
  const coincidencia = /^(\d{7,8})([0-9K])$/.exec(limpiarRut(valor));
  if (!coincidencia) return null;

  const [, cuerpo, dv] = coincidencia;
  if (calcularDigitoVerificador(cuerpo) !== dv) return null;

  const conPuntos = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${conPuntos}-${dv}`;
}
