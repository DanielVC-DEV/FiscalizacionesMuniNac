// Hash de contraseñas con scrypt (incluido en Node, sin dependencias externas).
// Formato guardado: scrypt$N$r$p$salt$hash — así los parámetros viajan con el
// hash y se pueden subir en el futuro sin romper las contraseñas existentes.

const { randomBytes, scryptSync, timingSafeEqual } = require('crypto');

const PARAMS = { N: 16384, r: 8, p: 1 };
const LARGO_CLAVE = 64;

function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, LARGO_CLAVE, PARAMS);
  return ['scrypt', PARAMS.N, PARAMS.r, PARAMS.p, salt.toString('hex'), hash.toString('hex')].join('$');
}

// Compara en tiempo constante. Si no hay hash guardado (usuario inexistente),
// igual calcula un scrypt para que la respuesta tarde lo mismo y no revele
// qué correos existen.
function verificarPassword(password, almacenado) {
  const partes = typeof almacenado === 'string' ? almacenado.split('$') : [];
  if (partes.length !== 6 || partes[0] !== 'scrypt') {
    scryptSync(String(password), 'relleno-sin-usuario', LARGO_CLAVE, PARAMS);
    return false;
  }

  const [, n, r, p, saltHex, hashHex] = partes;
  const esperado = Buffer.from(hashHex, 'hex');
  const calculado = scryptSync(password, Buffer.from(saltHex, 'hex'), esperado.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
  });

  return esperado.length === calculado.length && timingSafeEqual(esperado, calculado);
}

module.exports = { hashPassword, verificarPassword };
