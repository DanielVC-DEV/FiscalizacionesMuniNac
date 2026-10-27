// Servicio de sesiones: crea, valida y cierra tokens de acceso. Sólo el
// hash SHA-256 del token se guarda en la tabla "sesion".

const crypto = require('crypto');
const pool = require('../../core/config/db');

const DURACION_HORAS = 8;

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Devuelve el token en claro (sólo se entrega una vez, al iniciar sesión).
async function crearSesion(idUsuario) {
  const token = crypto.randomBytes(32).toString('base64url');
  const expiraEn = new Date(Date.now() + DURACION_HORAS * 60 * 60 * 1000);

  await pool.query(
    'INSERT INTO sesion (id_usuario, token_hash, expira_en) VALUES ($1, $2, $3)',
    [idUsuario, hashToken(token), expiraEn]
  );

  return { token, expiraEn };
}

// Devuelve el usuario dueño de un token vigente, o null si el token no existe
// o venció. Limpia de paso las sesiones vencidas.
async function usuarioDeToken(token) {
  const { rows } = await pool.query(
    `SELECT u.id_usuario, u.nombre, u.email, u.id_empresa, r.nombre AS rol
     FROM sesion s
     JOIN usuario u ON u.id_usuario = s.id_usuario
     LEFT JOIN rol_usuario ru ON ru.id_usuario = u.id_usuario
     LEFT JOIN rol r ON r.id_rol = ru.id_rol
     WHERE s.token_hash = $1 AND s.expira_en > now()`,
    [hashToken(token)]
  );

  pool.query('DELETE FROM sesion WHERE expira_en <= now()').catch(() => {});

  return rows[0] || null;
}

async function cerrarSesion(token) {
  await pool.query('DELETE FROM sesion WHERE token_hash = $1', [hashToken(token)]);
}

module.exports = { crearSesion, usuarioDeToken, cerrarSesion };
