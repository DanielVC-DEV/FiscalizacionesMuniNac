const pool = require('../../core/config/db');
const { verificarPassword } = require('../../core/utils/passwords');
const { esEmailValido } = require('../../core/utils/validaciones');
const { crearSesion, cerrarSesion } = require('./sesiones');

// Roles que pueden entrar a la app. Las cuentas de supervisor de empresa
// existen en la base, pero no tienen acceso a este sistema.
const ROLES_CON_ACCESO = ['admin', 'director'];

// Las cuentas no se crean desde la app: el administrador las registra en la
// base de datos (usuario + rol_usuario). Aquí sólo se verifican.
async function login(req, res, next) {
  const { email, password } = req.body;

  if (!esEmailValido(email) || typeof password !== 'string' || password.length === 0) {
    return res.status(400).json({ error: 'Ingresa tu correo y contraseña' });
  }

  try {
    const { rows } = await pool.query(
      `SELECT u.id_usuario, u.nombre, u.email, u.id_empresa, u.password_hash, r.nombre AS rol
       FROM usuario u
       LEFT JOIN rol_usuario ru ON ru.id_usuario = u.id_usuario
       LEFT JOIN rol r ON r.id_rol = ru.id_rol
       WHERE u.email = $1`,
      [email.trim().toLowerCase()]
    );
    const usuario = rows[0];

    // Mismo mensaje para correo inexistente y contraseña errónea: no se revela qué cuentas existen.
    const credencialesOk = verificarPassword(password, usuario ? usuario.password_hash : null);
    if (!usuario || !credencialesOk) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    // Una cuenta sin rol, o con un rol sin acceso a la app, no se deja entrar.
    if (!usuario.rol) {
      return res.status(403).json({ error: 'Tu cuenta no tiene un rol asignado. Contacta al administrador.' });
    }
    if (!ROLES_CON_ACCESO.includes(usuario.rol)) {
      return res.status(403).json({ error: 'Tu rol no tiene acceso a esta aplicación.' });
    }

    const sesion = await crearSesion(usuario.id_usuario);
    res.json({
      token: sesion.token,
      expira_en: sesion.expiraEn,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        email: usuario.email,
        id_empresa: usuario.id_empresa,
        rol: usuario.rol,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    await cerrarSesion(req.token);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { login, logout };
