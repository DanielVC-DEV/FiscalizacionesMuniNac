const pool = require('../../core/config/db');
const { esFechaISO, textoValido } = require('../../core/utils/validaciones');

async function listar(req, res, next) {
  try {
    const { rows } = await pool.query(
      "SELECT to_char(fecha, 'YYYY-MM-DD') AS fecha, descripcion FROM feriado ORDER BY fecha"
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// Alta o corrección: si la fecha ya existe, se actualiza la descripción.
async function guardar(req, res, next) {
  const { fecha, descripcion } = req.body;
  if (!esFechaISO(fecha)) return res.status(400).json({ error: 'La fecha no es válida (formato aaaa-mm-dd)' });
  if (!textoValido(descripcion, 150)) {
    return res.status(400).json({ error: 'La descripción es obligatoria (máximo 150 caracteres)' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO feriado (fecha, descripcion) VALUES ($1, $2)
       ON CONFLICT (fecha) DO UPDATE SET descripcion = EXCLUDED.descripcion
       RETURNING to_char(fecha, 'YYYY-MM-DD') AS fecha, descripcion`,
      [fecha, descripcion.trim()]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function eliminar(req, res, next) {
  const { fecha } = req.params;
  if (!esFechaISO(fecha)) return res.status(400).json({ error: 'La fecha no es válida (formato aaaa-mm-dd)' });
  try {
    const resultado = await pool.query('DELETE FROM feriado WHERE fecha = $1', [fecha]);
    if (resultado.rowCount === 0) return res.status(404).json({ error: 'Feriado no encontrado' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, guardar, eliminar };
