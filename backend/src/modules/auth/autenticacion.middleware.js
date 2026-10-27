// Exige un token de sesión válido en el encabezado "Authorization: Bearer <token>".
// Si es válido, deja el usuario en req.usuario para los controladores.

const { usuarioDeToken } = require('./sesiones');

async function exigirSesion(req, res, next) {
  const encabezado = req.get('Authorization') || '';
  const token = encabezado.startsWith('Bearer ') ? encabezado.slice(7).trim() : '';

  if (!token) return res.status(401).json({ error: 'Debes iniciar sesión para continuar' });

  try {
    const usuario = await usuarioDeToken(token);
    if (!usuario) return res.status(401).json({ error: 'Tu sesión venció. Vuelve a iniciar sesión.' });

    req.usuario = usuario;
    req.token = token;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = exigirSesion;
