// Mantenimiento periódico: marca los tickets vencidos y envía recordatorios
// de los que siguen pendientes. Corre cada cierto número de horas desde
// server.js; también se puede disparar a mano con POST /api/notificaciones/mantenimiento.
//
// Un ticket recibe como máximo un aviso de recordatorio o vencimiento por día.

const { hoyEnChile } = require('../../core/utils/diasHabiles');
const { marcarTicketsVencidos, ESTADOS } = require('../tickets/ticketStateMachine');
const { notificarTicket } = require('./notificaciones.service');

async function ejecutarMantenimiento(pool) {
  const hoy = hoyEnChile();

  const vencidos = await marcarTicketsVencidos(pool, hoy);

  const { rows } = await pool.query(
    `SELECT t.id_ticket, t.estado
     FROM ticket t
     WHERE t.estado IN ($1, $2, $3)
       AND NOT EXISTS (
         SELECT 1 FROM notificacion n
         WHERE n.id_ticket = t.id_ticket
           AND n.tipo IN ('RECORDATORIO', 'VENCIMIENTO')
           AND (n.fecha AT TIME ZONE 'America/Santiago')::date = $4::date
       )`,
    [ESTADOS.ABIERTO, ESTADOS.REQUIERE_NUEVA_SUBSANACION, ESTADOS.VENCIDO, hoy]
  );

  let avisos = 0;
  for (const ticket of rows) {
    const tipo = ticket.estado === ESTADOS.VENCIDO ? 'VENCIMIENTO' : 'RECORDATORIO';
    avisos += await notificarTicket(pool, ticket.id_ticket, tipo);
  }

  return { vencidos_marcados: vencidos.length, tickets_con_aviso: rows.length, avisos_enviados: avisos };
}

// Programa el mantenimiento. Devuelve la referencia al temporizador (o null si está desactivado).
function iniciarMantenimiento(pool) {
  if (process.env.MANTENIMIENTO_ACTIVO === 'false') return null;

  const horas = Number(process.env.MANTENIMIENTO_CADA_HORAS || 6);
  const intervalo = setInterval(() => {
    ejecutarMantenimiento(pool).catch((err) => console.error('Error en mantenimiento de tickets:', err));
  }, horas * 60 * 60 * 1000);
  intervalo.unref();
  return intervalo;
}

module.exports = { ejecutarMantenimiento, iniciarMantenimiento };
