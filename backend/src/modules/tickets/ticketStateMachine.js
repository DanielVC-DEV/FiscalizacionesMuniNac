/**
 * ticketStateMachine.js
 *
 * Valida y aplica las transiciones de estado del ticket. Cada transición
 * se registra en el historial (ticket_actuacion) dentro de la misma
 * transacción, así no puede cambiar el estado sin dejar constancia.
 */

const { registrarActuacion, TIPOS_ACTUACION } = require('./actuaciones');

const ESTADOS = Object.freeze({
  ABIERTO: 'ABIERTO',
  RESPONDIDO: 'RESPONDIDO',
  REQUIERE_NUEVA_SUBSANACION: 'REQUIERE_NUEVA_SUBSANACION',
  VENCIDO: 'VENCIDO',
  SUBSANADO_CONFORME: 'SUBSANADO_CONFORME',
  CERRADO: 'CERRADO',
});

const TRANSICIONES_PERMITIDAS = {
  [ESTADOS.ABIERTO]: [ESTADOS.RESPONDIDO, ESTADOS.VENCIDO],
  [ESTADOS.RESPONDIDO]: [ESTADOS.SUBSANADO_CONFORME, ESTADOS.REQUIERE_NUEVA_SUBSANACION],
  [ESTADOS.REQUIERE_NUEVA_SUBSANACION]: [ESTADOS.RESPONDIDO, ESTADOS.VENCIDO],
  [ESTADOS.VENCIDO]: [ESTADOS.RESPONDIDO],
  [ESTADOS.SUBSANADO_CONFORME]: [ESTADOS.CERRADO],
  [ESTADOS.CERRADO]: [ESTADOS.ABIERTO], // reapertura
};

// Estados que sólo se alcanzan con su acción propia (conformidad, cierre,
// reapertura o solicitud de subsanación): el cambio genérico no los acepta.
const ESTADOS_RESERVADOS = Object.freeze([ESTADOS.SUBSANADO_CONFORME, ESTADOS.CERRADO]);

class TransicionInvalidaError extends Error {
  constructor(estadoActual, estadoNuevo) {
    super(`No se puede pasar de "${estadoActual}" a "${estadoNuevo}".`);
    this.name = 'TransicionInvalidaError';
    this.status = 400;
  }
}

function esTransicionValida(estadoActual, estadoNuevo) {
  return (TRANSICIONES_PERMITIDAS[estadoActual] || []).includes(estadoNuevo);
}

/**
 * Aplica una transición dentro de una transacción ya abierta por el llamador.
 * Bloquea la fila del ticket, valida la transición, actualiza el estado y
 * registra la actuación.
 */
async function transicionar(client, ticketId, estadoNuevo, {
  idUsuario = null,
  tipo = TIPOS_ACTUACION.CAMBIO_ESTADO,
  comentario = null,
} = {}) {
  const { rows } = await client.query(
    'SELECT estado FROM ticket WHERE id_ticket = $1 FOR UPDATE',
    [ticketId]
  );
  if (rows.length === 0) {
    const err = new Error(`Ticket ${ticketId} no existe.`);
    err.status = 404;
    throw err;
  }
  const estadoActual = rows[0].estado;

  if (!esTransicionValida(estadoActual, estadoNuevo)) {
    throw new TransicionInvalidaError(estadoActual, estadoNuevo);
  }

  await client.query('UPDATE ticket SET estado = $1 WHERE id_ticket = $2', [estadoNuevo, ticketId]);

  await registrarActuacion(client, {
    idTicket: ticketId,
    tipo,
    idUsuario,
    descripcion: comentario,
    datos: { estado_anterior: estadoActual, estado_nuevo: estadoNuevo },
  });

  return { id_ticket: ticketId, estado_anterior: estadoActual, estado_nuevo: estadoNuevo };
}

/**
 * Cambia el estado de un ticket en su propia transacción.
 */
async function cambiarEstadoTicket(pool, ticketId, estadoNuevo, opciones) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const resultado = await transicionar(client, ticketId, estadoNuevo, opciones);
    await client.query('COMMIT');
    return resultado;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Marca VENCIDO todo ticket cuyo plazo pasó y sigue en ABIERTO o
 * REQUIERE_NUEVA_SUBSANACION. Lo ejecuta el mantenimiento diario
 * (modules/notificaciones/mantenimiento.js).
 */
async function marcarTicketsVencidos(pool, hoyISO) {
  const { rows } = await pool.query(
    `SELECT id_ticket FROM ticket
     WHERE estado IN ($1, $2) AND fecha_vencimiento < $3`,
    [ESTADOS.ABIERTO, ESTADOS.REQUIERE_NUEVA_SUBSANACION, hoyISO]
  );

  const resultados = [];
  for (const { id_ticket } of rows) {
    resultados.push(await cambiarEstadoTicket(pool, id_ticket, ESTADOS.VENCIDO, {
      tipo: TIPOS_ACTUACION.VENCIMIENTO,
      comentario: 'Plazo de subsanación vencido.',
    }));
  }
  return resultados;
}

module.exports = {
  ESTADOS,
  ESTADOS_RESERVADOS,
  TRANSICIONES_PERMITIDAS,
  TransicionInvalidaError,
  esTransicionValida,
  transicionar,
  cambiarEstadoTicket,
  marcarTicketsVencidos,
};
