/**
 * ticketStateMachine.js
 *
 * Valida y aplica las transiciones de estado del ticket.
 *
 * Nota: el esquema actual (basado en el diagrama revisado por el
 * supervisor) no tiene una tabla de historial/auditoría separada —
 * solo existen `ticket.estado` y la tabla `respuesta` para las
 * respuestas del supervisor de empresa. Si más adelante necesitan
 * guardar quién hizo cada cambio de estado y cuándo, se puede agregar
 * una tabla `cambio_estado` sin tocar esta lógica.
 */

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
 * Cambia el estado de un ticket, validando la transición.
 * @param {import('pg').Pool} pool
 * @param {number} ticketId
 * @param {string} estadoNuevo
 */
async function cambiarEstadoTicket(pool, ticketId, estadoNuevo) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

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

    await client.query('UPDATE ticket SET estado = $1 WHERE id_ticket = $2', [
      estadoNuevo,
      ticketId,
    ]);

    await client.query('COMMIT');
    return { id_ticket: ticketId, estado_anterior: estadoActual, estado_nuevo: estadoNuevo };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Marca VENCIDO todo ticket cuyo plazo pasó y sigue en ABIERTO o
 * REQUIERE_NUEVA_SUBSANACION. Pensado para correr con un cron
 * (ej. node-cron, una vez al día).
 */
async function marcarTicketsVencidos(pool) {
  const { rows } = await pool.query(
    `SELECT id_ticket FROM ticket
     WHERE estado IN ($1, $2) AND fecha_vencimiento < CURRENT_DATE`,
    [ESTADOS.ABIERTO, ESTADOS.REQUIERE_NUEVA_SUBSANACION]
  );

  const resultados = [];
  for (const { id_ticket } of rows) {
    resultados.push(await cambiarEstadoTicket(pool, id_ticket, ESTADOS.VENCIDO));
  }
  return resultados;
}

module.exports = {
  ESTADOS,
  TRANSICIONES_PERMITIDAS,
  TransicionInvalidaError,
  esTransicionValida,
  cambiarEstadoTicket,
  marcarTicketsVencidos,
};
