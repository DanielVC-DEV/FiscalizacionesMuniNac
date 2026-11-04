// Historial del ticket: registra cada actuación y la devuelve en orden.
// La tabla "ticket_actuacion" es append-only (ver sql/06): aquí sólo se inserta
// y se consulta, nunca se actualiza ni se borra.

const TIPOS_ACTUACION = Object.freeze({
  CREACION: 'CREACION',
  RESPUESTA: 'RESPUESTA',
  OBSERVACION: 'OBSERVACION',
  SOLICITUD_SUBSANACION: 'SOLICITUD_SUBSANACION',
  CAMBIO_ESTADO: 'CAMBIO_ESTADO',
  NOTIFICACION: 'NOTIFICACION',
  RECORDATORIO: 'RECORDATORIO',
  VENCIMIENTO: 'VENCIMIENTO',
  CONFORMIDAD: 'CONFORMIDAD',
  CIERRE: 'CIERRE',
  REAPERTURA: 'REAPERTURA',
  ENLACE_CONSULTA: 'ENLACE_CONSULTA',
});

// Actuaciones internas: sus descripciones incluyen correos de destinatarios o gestión municipal.
// No se muestran a empresas ni a quien consulta por enlace.
const TIPOS_SOLO_MUNICIPALES = Object.freeze([
  TIPOS_ACTUACION.NOTIFICACION,
  TIPOS_ACTUACION.RECORDATORIO,
  TIPOS_ACTUACION.ENLACE_CONSULTA,
]);

// `client` debe ser una conexión dentro de una transacción, para que la
// actuación quede guardada junto con el cambio que describe.
async function registrarActuacion(client, { idTicket, tipo, idUsuario = null, descripcion = null, datos = null }) {
  const { rows } = await client.query(
    `INSERT INTO ticket_actuacion (id_ticket, tipo, id_usuario, descripcion, datos)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id_actuacion, fecha`,
    [idTicket, tipo, idUsuario, descripcion, datos ? JSON.stringify(datos) : null]
  );
  return rows[0];
}

async function obtenerHistorial(pool, idTicket) {
  const { rows } = await pool.query(
    `SELECT ta.id_actuacion, ta.tipo, ta.fecha, ta.descripcion, ta.datos,
            u.nombre AS usuario_nombre,
            COALESCE((
              SELECT json_agg(json_build_object('id_archivo', a.id_archivo, 'tipo_mime', a.tipo_mime)
                              ORDER BY a.id_archivo)
              FROM archivo a WHERE a.id_actuacion = ta.id_actuacion
            ), '[]'::json) AS archivos
     FROM ticket_actuacion ta
     LEFT JOIN usuario u ON u.id_usuario = ta.id_usuario
     WHERE ta.id_ticket = $1
     ORDER BY ta.fecha, ta.id_actuacion`,
    [idTicket]
  );
  return rows;
}

module.exports = { TIPOS_ACTUACION, TIPOS_SOLO_MUNICIPALES, registrarActuacion, obtenerHistorial };
