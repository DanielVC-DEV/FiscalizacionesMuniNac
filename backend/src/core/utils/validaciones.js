// Validaciones compartidas por los controladores. Son funciones puras:
// no tocan la base de datos ni la respuesta HTTP. Cada controlador decide
// qué responder cuando algo no pasa.

const INT_MAX = 2147483647; // límite de INTEGER / SERIAL en PostgreSQL

// Quita puntos, guiones y espacios, y pasa la K a mayúscula.
function limpiarRut(valor) {
  return valor.replace(/[.\s-]/g, '').toUpperCase();
}

// Algoritmo módulo 11 del dígito verificador chileno.
function calcularDigitoVerificador(cuerpo) {
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
// Se usa para validar y, a la vez, para guardar siempre el mismo formato
// (así "12345678-5" y "12.345.678-5" no quedan como dos empresas distintas).
function normalizarRut(valor) {
  if (typeof valor !== 'string') return null;
  const coincidencia = /^(\d{7,8})([0-9K])$/.exec(limpiarRut(valor));
  if (!coincidencia) return null;

  const [, cuerpo, dv] = coincidencia;
  if (calcularDigitoVerificador(cuerpo) !== dv) return null;

  const conPuntos = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${conPuntos}-${dv}`;
}

// ID de un registro (viene de la URL o del body): entero positivo que cabe en INTEGER.
function esIdValido(valor) {
  return /^[1-9]\d{0,9}$/.test(String(valor)) && Number(valor) <= INT_MAX;
}

function esEnteroPositivo(valor) {
  return Number.isInteger(valor) && valor > 0 && valor <= INT_MAX;
}

// Monto en pesos: número finito, mayor que 0 y dentro de NUMERIC(14,2).
function esMontoValido(valor) {
  return typeof valor === 'number' && Number.isFinite(valor) && valor > 0 && valor < 1e12;
}

// Fecha en formato yyyy-mm-dd que realmente existe (rechaza 2026-02-30).
function esFechaISO(valor) {
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const fecha = new Date(`${valor}T00:00:00Z`);
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === valor;
}

// Texto obligatorio: no vacío después de quitar espacios y dentro del largo de la columna.
function textoValido(valor, maximo) {
  return typeof valor === 'string' && valor.trim().length > 0 && valor.trim().length <= maximo;
}

// Texto opcional: puede venir vacío o null; si viene, debe respetar el largo.
function textoOpcional(valor, maximo) {
  if (valor === undefined || valor === null || valor === '') return true;
  return typeof valor === 'string' && valor.length <= maximo;
}

// Correo con forma básica de dirección (algo@dominio.ext) y largo de la columna.
function esEmailValido(valor) {
  return typeof valor === 'string' && valor.length <= 150 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim());
}

// Contraseña: 8 a 128 caracteres, con al menos una letra y un número.
function esPasswordValida(valor) {
  return (
    typeof valor === 'string' &&
    valor.length >= 8 &&
    valor.length <= 128 &&
    /[A-Za-z]/.test(valor) &&
    /\d/.test(valor)
  );
}

module.exports = {
  normalizarRut,
  esIdValido,
  esEnteroPositivo,
  esMontoValido,
  esFechaISO,
  textoValido,
  textoOpcional,
  esEmailValido,
  esPasswordValida,
};
