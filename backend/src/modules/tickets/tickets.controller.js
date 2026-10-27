const pool = require('../../core/config/db');
const { cambiarEstadoTicket, ESTADOS } = require('./ticketStateMachine');
const {
  esIdValido, esFechaISO, esEnteroPositivo, textoValido, textoOpcional,
} = require('../../core/utils/validaciones');

function generarNumeroTicket() {
  // Esquema actual no trae un trigger para esto (a diferencia de
  // contratos.numero_contrato). Formato simple mientras no se defina
  // una nomenclatura oficial para tickets.
  return `TKT-${Date.now()}`;
}

async function listar(req, res, next) {
  try {
    // Une ticket con contrato, prioridad, empresa, supervisor y observación para evitar consultas adicionales desde la app.
    const { rows } = await pool.query(`
      SELECT t.id_ticket, t.numero, t.id_contrato, t.id_prioridad,
             p.nombre_prioridad AS prioridad, t.estado,
             t.fecha_hora_creacion, t.plazo_subsanar, t.fecha_vencimiento,
             c.nombre AS contrato_nombre, e.razon_social AS empresa_nombre,
             u.nombre AS supervisor_nombre,
             o.descripcion, o.foto, o.ubicacion
      FROM ticket t
      JOIN contratos c ON c.id_contratos = t.id_contrato
      JOIN prioridad_contrato p ON p.id_prioridad_contrato = t.id_prioridad
      JOIN empresas e ON e.id_empresa = t.id_empresa
      JOIN usuario u ON u.id_usuario = t.id_usuario
      JOIN observaciones o ON o.id_observacion = t.id_observacion
      ORDER BY t.fecha_hora_creacion DESC
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function obtener(req, res, next) {
  if (!esIdValido(req.params.id)) return res.status(400).json({ error: 'ID de ticket inválido' });
  try {
    // Recupera el ticket con su observación y etiquetas legibles para la vista de detalle.
    const { rows } = await pool.query(
      `SELECT t.*, p.nombre_prioridad AS prioridad,
              e.razon_social AS empresa_nombre, u.nombre AS supervisor_nombre,
              o.descripcion, o.fecha AS observacion_fecha, o.foto, o.ubicacion
       FROM ticket t
       JOIN prioridad_contrato p ON p.id_prioridad_contrato = t.id_prioridad
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
    id_contrato, id_prioridad,
    descripcion, foto, ubicacion,
    plazo_subsanar, fecha_vencimiento,
    id_usuario_creador, // quién registra la observación
  } = req.body;

  if (!esIdValido(id_contrato) || !esIdValido(id_prioridad)) {
    return res.status(400).json({ error: 'id_contrato e id_prioridad son obligatorios y deben ser válidos' });
  }
  if (!textoValido(descripcion, 5000)) {
    return res.status(400).json({ error: 'La descripción es obligatoria (máximo 5000 caracteres)' });
  }
  if (!esFechaISO(fecha_vencimiento)) {
    return res.status(400).json({ error: 'La fecha de vencimiento no es válida (formato aaaa-mm-dd)' });
  }
  if (plazo_subsanar !== undefined && plazo_subsanar !== null && !esEnteroPositivo(plazo_subsanar)) {
    return res.status(400).json({ error: 'plazo_subsanar debe ser un número entero mayor a 0' });
  }
  if (id_usuario_creador !== undefined && id_usuario_creador !== null && !esIdValido(id_usuario_creador)) {
    return res.status(400).json({ error: 'id_usuario_creador no es válido' });
  }
  if (!textoOpcional(ubicacion, 255) || !textoOpcional(foto, 500)) {
    return res.status(400).json({ error: 'La ubicación o la foto supera el largo permitido' });
  }

  const client = await pool.connect();
  try {
    const contrato = await client.query(
      'SELECT id_supervisor FROM contratos WHERE id_contratos = $1',
      [id_contrato]
    );
    if (contrato.rows.length === 0) {
      return res.status(404).json({ error: 'Contrato no encontrado' });
    }
    const idSupervisor = contrato.rows[0].id_supervisor;
    if (!idSupervisor) {
      return res.status(400).json({ error: 'El contrato no tiene un supervisor asignado' });
    }

    // La prioridad tiene que ser de ESTE contrato: sus días hábiles son los que definen el plazo.
    const prioridad = await client.query(
      'SELECT 1 FROM prioridad_contrato WHERE id_prioridad_contrato = $1 AND id_contrato = $2',
      [id_prioridad, id_contrato]
    );
    if (prioridad.rows.length === 0) {
      return res.status(400).json({ error: 'La prioridad indicada no pertenece a este contrato' });
    }

    // La observación y el ticket deben guardarse juntos: si uno falla, se revierten ambos.
    await client.query('BEGIN');

    // Registra el contenido y la ubicación antes de crear el ticket que la referencia.
    const observacion = await client.query(
      `INSERT INTO observaciones (id_usuario, descripcion, foto, ubicacion)
       VALUES ($1,$2,$3,$4) RETURNING id_observacion`,
      [id_usuario_creador || idSupervisor, descripcion.trim(), foto || null, ubicacion || null]
    );

    // PostgreSQL completa empresa y prioridad a partir de los IDs asociados al contrato.
    const ticket = await client.query(
      `INSERT INTO ticket
         (numero, id_contrato, id_usuario, id_observacion, id_prioridad, plazo_subsanar, fecha_vencimiento)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [
        generarNumeroTicket(),
        id_contrato,
        idSupervisor,
        observacion.rows[0].id_observacion,
        id_prioridad,
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
  // El servicio valida las transiciones permitidas antes de actualizar el estado.
  const { estado } = req.body;
  if (!esIdValido(req.params.id)) return res.status(400).json({ error: 'ID de ticket inválido' });
  if (!estado) return res.status(400).json({ error: 'Falta el campo "estado"' });
  // Un estado fuera del catálogo daría error de enum en PostgreSQL (500): se rechaza antes.
  if (!Object.values(ESTADOS).includes(estado)) {
    return res.status(400).json({ error: `Estado no válido: "${estado}"` });
  }

  try {
    const resultado = await cambiarEstadoTicket(pool, req.params.id, estado);
    res.json(resultado);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

module.exports = { listar, obtener, crear, cambiarEstado };
