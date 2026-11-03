// Alcance de cada rol sobre los tickets.
//   * admin y director: ven todos los tickets.
//   * supervisor_empresa: sólo los tickets de su propia empresa (usuario.id_empresa).

const ROLES_MUNICIPALES = ['admin', 'director'];

// Roles que pueden crear, dar conformidad, cerrar, reabrir y cambiar estados.
const ROLES_GESTION = ROLES_MUNICIPALES;

function esMunicipal(usuario) {
  return ROLES_MUNICIPALES.includes(usuario.rol);
}

function puedeVerTicket(usuario, ticket) {
  if (esMunicipal(usuario)) return true;
  return (
    usuario.rol === 'supervisor_empresa' &&
    usuario.id_empresa !== null &&
    Number(usuario.id_empresa) === Number(ticket.id_empresa)
  );
}

module.exports = { ROLES_GESTION, esMunicipal, puedeVerTicket };
