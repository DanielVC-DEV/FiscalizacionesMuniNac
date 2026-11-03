// Respuestas de la empresa dentro del ticket. Cada respuesta es una actuación
// independiente en el historial; no cierra ni declara subsanado el ticket.

const pool = require('../../core/config/db');
const { enTransaccion } = require('../../core/utils/transaccion');
const { borrarArchivo } = require('../../core/utils/archivos');
const { esIdValido, textoValido } = require('../../core/utils/validaciones');
const { transicionar, TransicionInvalidaError } = require('./ticketStateMachine');
const { TIPOS_ACTUACION, registrarActuacion } = require('./actuaciones');
const { validarFotos, registrarFotos } = require('./fotos');
const { puedeVerTicket } = require('./ticketAcceso');

async function listarPorTicket(req, res, next) {
  if (!esIdValido(req.params.idTicket)) return res.status(400).json({ error: 'ID de ticket inválido' });
  try {
    const ticket = await pool.query('SELECT id_empresa FROM ticket WHERE id_ticket = $1', [req.params.idTicket]);
    if (ticket.rows.length === 0 || !puedeVerTicket(req.usuario, ticket.rows[0])) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

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

// Registra la respuesta y, en la misma transacción, la actuación y el paso a
// RESPONDIDO (si el ticket está en un estado desde el que se puede pasar).
async function crear(req, res, next) {
  const { idTicket } = req.params;
  const { comentario, fotos } = req.body;

  if (!esIdValido(idTicket)) return res.status(400).json({ error: 'ID de ticket inválido' });
  if (!textoValido(comentario, 5000)) {
    return res.status(400).json({ error: 'El comentario es obligatorio (máximo 5000 caracteres)' });
  }
  const errorFotos = validarFotos(fotos);
  if (errorFotos) return res.status(400).json({ error: errorFotos });

  try {
    const ticket = await pool.query('SELECT id_empresa FROM ticket WHERE id_ticket = $1', [idTicket]);
    if (ticket.rows.length === 0 || !puedeVerTicket(req.usuario, ticket.rows[0])) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }
  } catch (err) {
    return next(err);
  }

  const idUsuario = req.usuario.id_usuario;
  const rutasGuardadas = [];
  let aviso = null;

  try {
    const respuesta = await enTransaccion(pool, async (client) => {
      const insercion = await client.query(
        `INSERT INTO respuesta (id_ticket, id_usuario, comentario)
         VALUES ($1,$2,$3) RETURNING *`,
        [idTicket, idUsuario, comentario.trim()]
      );

      const actuacion = await registrarActuacion(client, {
        idTicket,
        tipo: TIPOS_ACTUACION.RESPUESTA,
        idUsuario,
        descripcion: comentario.trim(),
      });

      rutasGuardadas.push(...await registrarFotos(client, {
        idTicket,
        idActuacion: actuacion.id_actuacion,
        idUsuario,
        fotos,
      }));

      // Si el ticket ya está en un estado sin paso a RESPONDIDO (ej. CERRADO),
      // la respuesta igual queda guardada y se avisa. La validación ocurre antes
      // de escribir, así que la transacción sigue sana.
      try {
        await transicionar(client, idTicket, 'RESPONDIDO', { idUsuario });
      } catch (errEstado) {
        if (!(errEstado instanceof TransicionInvalidaError)) throw errEstado;
        aviso = `Respuesta guardada, pero no se pudo actualizar el estado: ${errEstado.message}`;
      }

      return insercion.rows[0];
    });

    res.status(201).json(aviso ? { respuesta, aviso } : { respuesta });
  } catch (err) {
    await Promise.all(rutasGuardadas.map((ruta) => borrarArchivo(ruta).catch(() => {})));
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

module.exports = { listarPorTicket, crear };
