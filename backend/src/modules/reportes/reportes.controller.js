// Indicadores de gestión y reporte PDF. Ambos usan los mismos filtros que el
// listado de tickets (periodo, empresa, área, estado, supervisor, creador...).

const pool = require('../../core/config/db');
const { SELECT_TICKETS, construirFiltros } = require('../tickets/ticketFiltros');
const { obtenerHistorial } = require('../tickets/actuaciones');
const { escribirReportePdf } = require('./reportePdf');

// Indicadores sobre los tickets filtrados. "Pendientes de revisión" son los
// tickets en RESPONDIDO: la empresa ya respondió y falta la revisión municipal.
async function calcularIndicadores(where, params) {
  const { rows } = await pool.query(
    `WITH base AS (
       SELECT b.*,
              (SELECT MIN(ta.fecha) FROM ticket_actuacion ta
               WHERE ta.id_ticket = b.id_ticket AND ta.tipo = 'RESPUESTA') AS primera_respuesta
       FROM (${SELECT_TICKETS} ${where}) b
     )
     SELECT
       COUNT(*)::int AS total,
       COUNT(*) FILTER (WHERE estado = 'ABIERTO')::int AS abiertos,
       COUNT(*) FILTER (WHERE estado = 'RESPONDIDO')::int AS respondidos,
       COUNT(*) FILTER (WHERE estado = 'RESPONDIDO')::int AS pendientes_revision,
       COUNT(*) FILTER (WHERE estado = 'REQUIERE_NUEVA_SUBSANACION')::int AS requieren_nueva_subsanacion,
       COUNT(*) FILTER (WHERE estado = 'VENCIDO')::int AS vencidos,
       COUNT(*) FILTER (WHERE estado = 'SUBSANADO_CONFORME')::int AS subsanados_conforme,
       COUNT(*) FILTER (WHERE estado = 'CERRADO')::int AS cerrados,
       ROUND(AVG(EXTRACT(EPOCH FROM (primera_respuesta - fecha_hora_creacion)) / 86400)
             FILTER (WHERE primera_respuesta IS NOT NULL), 2) AS tiempo_promedio_respuesta_dias,
       ROUND(AVG(EXTRACT(EPOCH FROM (fecha_cierre - fecha_hora_creacion)) / 86400)
             FILTER (WHERE fecha_cierre IS NOT NULL), 2) AS tiempo_promedio_cierre_dias
     FROM base`,
    params
  );
  return rows[0];
}

async function indicadores(req, res, next) {
  try {
    const { where, params } = construirFiltros(req.query, req.usuario);
    res.json(await calcularIndicadores(where, params));
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function reportePdf(req, res, next) {
  try {
    const { where, params } = construirFiltros(req.query, req.usuario);
    const [resumen, tickets] = await Promise.all([
      calcularIndicadores(where, params),
      pool.query(`${SELECT_TICKETS} ${where} ORDER BY t.fecha_hora_creacion`, params),
    ]);

    // El historial de cada ticket va en el detalle del reporte.
    const detalle = [];
    for (const ticket of tickets.rows) {
      detalle.push({ ticket, historial: await obtenerHistorial(pool, ticket.id_ticket) });
    }

    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', 'attachment; filename="reporte-tickets.pdf"');
    escribirReportePdf(res, {
      filtros: req.query,
      indicadores: resumen,
      detalle,
    });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

module.exports = { indicadores, reportePdf };
