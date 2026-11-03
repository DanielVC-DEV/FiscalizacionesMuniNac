// Administración de destinatarios de notificación y disparo manual del mantenimiento.

const pool = require('../../core/config/db');
const { esEmailValido, esIdValido, textoOpcional } = require('../../core/utils/validaciones');
const { ejecutarMantenimiento } = require('./mantenimiento');

async function listarDestinatarios(req, res, next) {
  try {
    const { rows } = await pool.query(
      'SELECT id_destinatario, email, nombre, activo FROM destinatario_notificacion ORDER BY email'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function crearDestinatario(req, res, next) {
  const { email, nombre } = req.body;
  if (!esEmailValido(email)) return res.status(400).json({ error: 'El correo no es válido' });
  if (!textoOpcional(nombre, 150)) return res.status(400).json({ error: 'El nombre supera 150 caracteres' });

  try {
    const { rows } = await pool.query(
      `INSERT INTO destinatario_notificacion (email, nombre) VALUES ($1, $2)
       RETURNING id_destinatario, email, nombre, activo`,
      [email.trim().toLowerCase(), nombre || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// Permite activar o desactivar un destinatario sin perder su registro.
async function actualizarDestinatario(req, res, next) {
  const { id } = req.params;
  const { activo, nombre } = req.body;
  if (!esIdValido(id)) return res.status(400).json({ error: 'ID de destinatario inválido' });
  if (activo !== undefined && typeof activo !== 'boolean') {
    return res.status(400).json({ error: 'activo debe ser verdadero o falso' });
  }
  if (!textoOpcional(nombre, 150)) return res.status(400).json({ error: 'El nombre supera 150 caracteres' });

  try {
    const { rows } = await pool.query(
      `UPDATE destinatario_notificacion
       SET activo = COALESCE($2, activo), nombre = COALESCE($3, nombre)
       WHERE id_destinatario = $1
       RETURNING id_destinatario, email, nombre, activo`,
      [id, activo ?? null, nombre ?? null]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Destinatario no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function eliminarDestinatario(req, res, next) {
  const { id } = req.params;
  if (!esIdValido(id)) return res.status(400).json({ error: 'ID de destinatario inválido' });
  try {
    const resultado = await pool.query('DELETE FROM destinatario_notificacion WHERE id_destinatario = $1', [id]);
    if (resultado.rowCount === 0) return res.status(404).json({ error: 'Destinatario no encontrado' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

async function correrMantenimiento(req, res, next) {
  try {
    res.json(await ejecutarMantenimiento(pool));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listarDestinatarios, crearDestinatario, actualizarDestinatario, eliminarDestinatario, correrMantenimiento,
};
