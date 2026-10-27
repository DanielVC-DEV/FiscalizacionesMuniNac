// Restringe una ruta a ciertos roles. Debe ir después de exigirSesion, que es
// quien deja el usuario en req.usuario. Ejemplo: autorizar('admin').

function autorizar(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) return res.status(401).json({ error: 'Debes iniciar sesión para continuar' });

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'Tu rol no tiene permiso para realizar esta acción' });
    }
    next();
  };
}

module.exports = autorizar;
