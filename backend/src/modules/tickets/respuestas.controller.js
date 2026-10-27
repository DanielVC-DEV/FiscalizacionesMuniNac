// Requiere la tabla `respuesta`, creada en sql/03_contrato_prioridad_respuesta.sql
// (pendiente de confirmar con tu supervisor). Si todavía no la corriste,
// estos endpoints van a fallar con "relation respuesta does not exist".

const pool = require('../../core/config/db');
const { cambiarEstadoTicket } = require('./ticketStateMachine');
const { esIdValido, textoValido } = require('../../core/utils/validaciones');

async function listarPorTicket(req, res, next) {
  if (!esIdValido(req.params.idTicket)) return res.status(400).json({ error: 'ID de ticket inválido' });
  try {
    const { rows } = await pool.query(
      `SELECT r.id_respuesta, r.comentario, r.foto, r.fecha, u.nombre AS usuario_nombre
       FROM respuesta r JOIN usuario u ON u.id_usuario = r.id_usuario
       WHERE r.id_ticket = $1 ORDER BY r.fecha`,
      [req.params.idTicket]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// Registra la respuesta y, de paso, mueve el ticket a RESPONDIDO
// (si venía de ABIERTO, VENCIDO o REQUIERE_NUEVA_SUBSANACION).
async function crear(req, res, next) {
  const { idTicket } = req.params;
  const { id_usuario, comentario, foto } = req.body;

  if (!esIdValido(idTicket)) return res.status(400).json({ error: 'ID de ticket inválido' });
  if (!esIdValido(id_usuario)) return res.status(400).json({ error: 'id_usuario es obligatorio y debe ser válido' });
  if (!textoValido(comentario, 5000)) {
    return res.status(400).json({ error: 'El comentario es obligatorio (máximo 5000 caracteres)' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const respuesta = await client.query(
      `INSERT INTO respuesta (id_ticket, id_usuario, comentario, foto)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [idTicket, id_usuario, comentario.trim(), foto || null]
    );

    await client.query('COMMIT');

    // Fuera de la transacción de la respuesta: la máquina de estados
    // abre su propia transacción y valida si la transición es legal.
    try {
      await cambiarEstadoTicket(pool, idTicket, 'RESPONDIDO');
    } catch (errEstado) {
      // Si el ticket ya estaba en un estado desde el que no se puede pasar
      // a RESPONDIDO (ej. ya CERRADO), igual queda guardada la respuesta,
      // pero avisamos del problema de estado.
      return res.status(201).json({
        respuesta: respuesta.rows[0],
        aviso: `Respuesta guardada, pero no se pudo actualizar el estado: ${errEstado.message}`,
      });
    }

    res.status(201).json({ respuesta: respuesta.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

module.exports = { listarPorTicket, crear };
