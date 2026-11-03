// Consulta externa por enlace: solo lectura, sin cuenta. Un usuario municipal
// genera el enlace; quien lo recibe ve sólo los antecedentes definidos aquí.
//
// El token se entrega una sola vez; en la base sólo se guarda su SHA-256.

const crypto = require('crypto');
const pool = require('../../core/config/db');
const { esIdValido } = require('../../core/utils/validaciones');
const { registrarActuacion, obtenerHistorial, TIPOS_ACTUACION } = require('../tickets/actuaciones');
const { SELECT_TICKETS } = require('../tickets/ticketFiltros');

const DIAS_VIGENCIA_POR_DEFECTO = 30;
const MAX_DIAS_VIGENCIA = 365;
const FORMATO_TOKEN = /^[A-Za-z0-9_-]{43}$/;

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function crearEnlace(req, res, next) {
  const { id } = req.params;
  const dias = req.body.dias_vigencia ?? DIAS_VIGENCIA_POR_DEFECTO;
  if (!esIdValido(id)) return res.status(400).json({ error: 'ID de ticket inválido' });
  if (!Number.isInteger(dias) || dias < 1 || dias > MAX_DIAS_VIGENCIA) {
    return res.status(400).json({ error: `dias_vigencia debe ser un entero entre 1 y ${MAX_DIAS_VIGENCIA}` });
  }

  try {
    const ticket = await pool.query('SELECT 1 FROM ticket WHERE id_ticket = $1', [id]);
    if (ticket.rows.length === 0) return res.status(404).json({ error: 'Ticket no encontrado' });

    const token = crypto.randomBytes(32).toString('base64url');
    const { rows } = await pool.query(
      `INSERT INTO consulta_externa (id_ticket, token_hash, creado_por, expira_en)
       VALUES ($1, $2, $3, now() + make_interval(days => $4))
       RETURNING id_consulta, creada_en, expira_en`,
      [id, hashToken(token), req.usuario.id_usuario, dias]
    );

    await registrarActuacion(pool, {
      idTicket: id,
      tipo: TIPOS_ACTUACION.ENLACE_CONSULTA,
      idUsuario: req.usuario.id_usuario,
      descripcion: `Enlace de consulta externa generado (vigencia ${dias} día(s))`,
    });

    res.status(201).json({
      ...rows[0],
      // El token sólo se muestra en esta respuesta. Quien tenga el enlace puede consultar el ticket.
      token,
      ruta: `/api/consulta/publica/${token}`,
    });
  } catch (err) {
    next(err);
  }
}

async function listarEnlaces(req, res, next) {
  const { id } = req.params;
  if (!esIdValido(id)) return res.status(400).json({ error: 'ID de ticket inválido' });
  try {
    const { rows } = await pool.query(
      `SELECT id_consulta, creada_en, expira_en, revocada_en
       FROM consulta_externa WHERE id_ticket = $1 ORDER BY creada_en DESC`,
      [id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function revocarEnlace(req, res, next) {
  const { id } = req.params;
  if (!esIdValido(id)) return res.status(400).json({ error: 'ID de enlace inválido' });
  try {
    const { rows } = await pool.query(
      `UPDATE consulta_externa SET revocada_en = COALESCE(revocada_en, now())
       WHERE id_consulta = $1
       RETURNING id_consulta, id_ticket, revocada_en`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Enlace no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// Ruta pública: no pasa por exigirSesion (ver app.js). Responde sólo con los
// campos de consulta externa; nunca con nombres de usuarios internos.
async function consultarPublica(req, res, next) {
  const { token } = req.params;
  if (!FORMATO_TOKEN.test(token)) return res.status(404).json({ error: 'Enlace no válido o vencido' });

  try {
    const enlace = await pool.query(
      `SELECT id_ticket FROM consulta_externa
       WHERE token_hash = $1 AND revocada_en IS NULL AND expira_en > now()`,
      [hashToken(token)]
    );
    if (enlace.rows.length === 0) return res.status(404).json({ error: 'Enlace no válido o vencido' });

    const { rows } = await pool.query(`${SELECT_TICKETS} WHERE t.id_ticket = $1`, [enlace.rows[0].id_ticket]);
    const ticket = rows[0];

    const respuestas = await pool.query(
      `SELECT r.comentario, r.fecha, u.nombre AS usuario_nombre
       FROM respuesta r JOIN usuario u ON u.id_usuario = r.id_usuario
       WHERE r.id_ticket = $1 ORDER BY r.fecha`,
      [ticket.id_ticket]
    );
    const historial = (await obtenerHistorial(pool, ticket.id_ticket))
      .map(({ tipo, fecha, descripcion }) => ({ tipo, fecha, descripcion }));

    res.set('Cache-Control', 'no-store');
    res.json({
      numero: ticket.numero,
      estado: ticket.estado,
      prioridad: ticket.prioridad,
      empresa_nombre: ticket.empresa_nombre,
      area_nombre: ticket.area_nombre,
      contrato_nombre: ticket.contrato_nombre,
      fecha_creacion: ticket.fecha_hora_creacion,
      fecha_vencimiento: ticket.fecha_vencimiento,
      fecha_cierre: ticket.fecha_cierre,
      descripcion: ticket.descripcion,
      ubicacion: { direccion: ticket.direccion, sector: ticket.sector, referencia: ticket.referencia },
      respuestas: respuestas.rows,
      historial,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { crearEnlace, listarEnlaces, revocarEnlace, consultarPublica };
