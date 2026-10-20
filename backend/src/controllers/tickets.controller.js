const pool = require('../config/db');
const { cambiarEstadoTicket } = require('../services/ticketStateMachine');

// Nota: este controlador trabaja contra el esquema "estable" (01 + 02 en
// /sql). Si más adelante confirmas con tu supervisor los cambios de la
// migración 03 (ticket.id_contrato, prioridad por contrato), hay que
// actualizar create() para usar id_contrato + id_prioridad en vez de
// id_empresa + prioridad como texto.

function generarNumeroTicket() {
  // Esquema actual no trae un trigger para esto (a diferencia de
  // contratos.numero_contrato). Formato simple mientras no se defina
  // una nomenclatura oficial para tickets.
  return `TKT-${Date.now()}`;
}

async function listar(req, res, next) {
  try {
    const { rows } = await pool.query(`
      SELECT t.id_ticket, t.numero, t.prioridad, t.estado,
             t.fecha_hora_creacion, t.plazo_subsanar, t.fecha_vencimiento,
             e.razon_social AS empresa_nombre, u.nombre AS supervisor_nombre
      FROM ticket t
      JOIN empresas e ON e.id_empresa = t.id_empresa
      JOIN usuario u ON u.id_usuario = t.id_usuario
      ORDER BY t.fecha_hora_creacion DESC
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function obtener(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT t.*, e.razon_social AS empresa_nombre, u.nombre AS supervisor_nombre,
              o.descripcion, o.fecha AS observacion_fecha, o.foto, o.ubicacion
       FROM ticket t
       JOIN empresas e ON e.id_empresa = t.id_empresa
       JOIN usuario u ON u.id_usuario = t.id_usuario
       JOIN observaciones o ON o.id_observacion = t.id_observacion
       WHERE t.id_ticket = $1`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Ticket no encontrado' });

    const respuestas = await pool.query(
      `SELECT r.id_respuesta, r.comentario, r.foto, r.fecha, u.nombre AS usuario_nombre
       FROM respuesta r JOIN usuario u ON u.id_usuario = r.id_usuario
       WHERE r.id_ticket = $1 ORDER BY r.fecha`,
      [req.params.id]
    );

    res.json({ ...rows[0], respuestas: respuestas.rows });
  } catch (err) {
    next(err);
  }
}

// Crea la observación y el ticket en una sola transacción (son 1 a 1:
// si falla uno, no debe quedar el otro suelto).
async function crear(req, res, next) {
  const {
    id_empresa, id_usuario, prioridad,
    descripcion, foto, ubicacion,
    plazo_subsanar, fecha_vencimiento,
    id_usuario_creador, // quién registra la observación
  } = req.body;

  if (!id_empresa || !id_usuario || !prioridad || !descripcion || !fecha_vencimiento) {
    return res.status(400).json({
      error: 'id_empresa, id_usuario, prioridad, descripcion y fecha_vencimiento son obligatorios',
    });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const observacion = await client.query(
      `INSERT INTO observaciones (id_usuario, descripcion, foto, ubicacion)
       VALUES ($1,$2,$3,$4) RETURNING id_observacion`,
      [id_usuario_creador || id_usuario, descripcion, foto || null, ubicacion || null]
    );

    const ticket = await client.query(
      `INSERT INTO ticket
         (numero, id_empresa, id_usuario, id_observacion, prioridad, plazo_subsanar, fecha_vencimiento)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [
        generarNumeroTicket(),
        id_empresa,
        id_usuario,
        observacion.rows[0].id_observacion,
        prioridad,
        plazo_subsanar || null,
        fecha_vencimiento,
      ]
    );

    await client.query('COMMIT');
    res.status(201).json(ticket.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

async function cambiarEstado(req, res, next) {
  const { estado } = req.body;
  if (!estado) return res.status(400).json({ error: 'Falta el campo "estado"' });

  try {
    const resultado = await cambiarEstadoTicket(pool, req.params.id, estado);
    res.json(resultado);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

module.exports = { listar, obtener, crear, cambiarEstado };
