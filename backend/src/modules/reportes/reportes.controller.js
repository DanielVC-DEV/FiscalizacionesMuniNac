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

// Estadísticas para los gráficos: reparto por empresa, área y prioridad, evolución
// mensual y cumplimiento de plazo. "En plazo" = primera respuesta hasta el día de
// vencimiento (inclusive). Los nombres de columna son fijos; los valores van por $n.
async function calcularEstadisticas(where, params) {
  const base = `(${SELECT_TICKETS} ${where}) b`;
  const reparto = (columna) =>
    pool.query(
      `SELECT ${columna} AS nombre, COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE estado IN ('SUBSANADO_CONFORME','CERRADO'))::int AS resueltos,
              COUNT(*) FILTER (WHERE estado = 'VENCIDO')::int AS vencidos
       FROM ${base} GROUP BY 1 ORDER BY total DESC, nombre LIMIT 8`,
      params
    );
  const [empresa, area, prioridad, mes, plazo] = await Promise.all([
    reparto('empresa_nombre'),
    reparto('area_nombre'),
    reparto('prioridad'),
    pool.query(
      `SELECT to_char(date_trunc('month', fecha_hora_creacion AT TIME ZONE 'America/Santiago'), 'YYYY-MM') AS mes,
              COUNT(*)::int AS creados,
              COUNT(*) FILTER (WHERE fecha_cierre IS NOT NULL)::int AS cerrados
       FROM ${base} GROUP BY 1 ORDER BY 1 DESC LIMIT 6`,
      params
    ),
    pool.query(
      `SELECT COUNT(*)::int AS con_respuesta,
              COUNT(*) FILTER (WHERE primera_respuesta::date <= fecha_vencimiento)::int AS en_plazo
       FROM (SELECT b.*, (SELECT MIN(ta.fecha) FROM ticket_actuacion ta
                          WHERE ta.id_ticket = b.id_ticket AND ta.tipo = 'RESPUESTA') AS primera_respuesta
             FROM ${base}) x
       WHERE primera_respuesta IS NOT NULL`,
      params
    ),
  ]);
  return {
    por_empresa: empresa.rows,
    por_area: area.rows,
    por_prioridad: prioridad.rows,
    por_mes: mes.rows.reverse(),
    respuestas_con_dato: plazo.rows[0].con_respuesta,
    respuestas_en_plazo: plazo.rows[0].en_plazo,
  };
}

async function indicadores(req, res, next) {
  try {
    const { where, params } = construirFiltros(req.query, req.usuario);
    const [resumen, estadisticas] = await Promise.all([
      calcularIndicadores(where, params),
      calcularEstadisticas(where, params),
    ]);
    res.json({ ...resumen, ...estadisticas });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function reportePdf(req, res, next) {
  try {
    const { where, params } = construirFiltros(req.query, req.usuario);
    const [resumen, estadisticas, tickets] = await Promise.all([
      calcularIndicadores(where, params),
      calcularEstadisticas(where, params),
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
      indicadores: { ...resumen, ...estadisticas },
      detalle,
    });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

module.exports = { indicadores, reportePdf };
