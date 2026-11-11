// Envío de avisos sobre un ticket (creación, solicitud de subsanación y
// recordatorios). Cada intento queda registrado en la tabla "notificacion".
//
// Destinatarios: el supervisor de la empresa para avisos generales, o el
// creador municipal cuando llega una respuesta, más los contactos configurados.

const { enviarCorreo } = require('../../core/utils/correo');
const { SELECT_TICKETS } = require('../tickets/ticketFiltros');
const { registrarActuacion, TIPOS_ACTUACION } = require('../tickets/actuaciones');

const URL_APP = process.env.APP_URL || 'la plataforma de fiscalización';

async function destinatariosDelTicket(pool, idTicket, tipo) {
  const { rows } = await pool.query(
    `SELECT u.email, u.nombre
     FROM ticket t
     JOIN usuario u ON u.id_usuario = CASE WHEN $2 = 'RESPUESTA'
       THEN COALESCE(t.id_creador, t.id_usuario) ELSE t.id_usuario END
     WHERE t.id_ticket = $1
     UNION
     SELECT d.email, d.nombre
     FROM destinatario_notificacion d
     WHERE d.activo = true`,
    [idTicket, tipo]
  );
  // UNION ya quita duplicados exactos; se compara también en minúsculas.
  const vistos = new Set();
  return rows.filter((fila) => {
    const clave = fila.email.toLowerCase();
    if (vistos.has(clave)) return false;
    vistos.add(clave);
    return true;
  });
}

// La columna es DATE: pg la entrega como Date a medianoche local; se muestra sólo el día.
function formatearFecha(fecha) {
  if (!fecha) return 'No registrada';
  const valor = fecha instanceof Date ? fecha : new Date(fecha);
  return Number.isNaN(valor.getTime()) ? String(fecha) : valor.toLocaleDateString('es-CL');
}

function construirAviso(ticket, tipo, comentario) {
  const etiquetas = {
    CREACION: 'Nuevo ticket de fiscalización',
    SOLICITUD: 'Se solicita nueva subsanación',
    RESPUESTA: 'La empresa respondió al ticket',
    RECORDATORIO: 'Recordatorio de ticket pendiente',
    VENCIMIENTO: 'Ticket vencido',
  };
  const asunto = `${etiquetas[tipo]} ${ticket.numero}`;

  const lineas = [
    `Ticket: ${ticket.numero}`,
    `Empresa: ${ticket.empresa_nombre} (${ticket.empresa_rut})`,
    `Área: ${ticket.area_nombre}`,
    `Contrato: ${ticket.contrato_nombre}`,
    `Prioridad: ${ticket.prioridad} (${ticket.plazo_subsanar} día(s) hábiles)`,
    `Fecha de creación: ${new Date(ticket.fecha_hora_creacion).toLocaleString('es-CL')}`,
    `Fecha de vencimiento: ${formatearFecha(ticket.fecha_vencimiento)}`,
    `Estado: ${ticket.estado}`,
    `Ubicación: ${[ticket.direccion, ticket.sector, ticket.ubicacion].filter(Boolean).join(' - ') || 'No registrada'}`,
    '',
    'Observación:',
    ticket.descripcion,
  ];
  if (comentario) lineas.push('', 'Comentario:', comentario);
  lineas.push('', `Acceso al ticket: ${URL_APP}`);

  return { asunto, texto: lineas.join('\n') };
}

/**
 * Envía el aviso a todos los destinatarios del ticket y registra cada envío.
 * Devuelve la cantidad de destinatarios alcanzados (o intentados).
 */
async function notificarTicket(pool, idTicket, tipo, { comentario = null } = {}) {
  const { rows } = await pool.query(`${SELECT_TICKETS} WHERE t.id_ticket = $1`, [idTicket]);
  if (rows.length === 0) return 0;
  const ticket = rows[0];

  const { asunto, texto } = construirAviso(ticket, tipo, comentario);
  const destinatarios = await destinatariosDelTicket(pool, idTicket, tipo);

  for (const destinatario of destinatarios) {
    const resultado = await enviarCorreo({ para: destinatario.email, asunto, texto });
    const estado = !resultado.configurado ? 'SIN_CONFIGURAR' : resultado.enviado ? 'ENVIADA' : 'FALLIDA';

    await pool.query(
      `INSERT INTO notificacion (id_ticket, tipo, destinatario, asunto, estado, error)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [idTicket, tipo, destinatario.email, asunto, estado, resultado.motivo || null]
    );
  }

  if (destinatarios.length > 0) {
    await registrarActuacion(pool, {
      idTicket,
      tipo: TIPOS_ACTUACION.NOTIFICACION,
      descripcion: `${asunto}. Destinatarios: ${destinatarios.map((d) => d.email).join(', ')}`,
    });
  }

  return destinatarios.length;
}

module.exports = { notificarTicket, destinatariosDelTicket };
