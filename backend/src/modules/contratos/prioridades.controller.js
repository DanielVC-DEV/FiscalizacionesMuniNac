// Prioridades (plazos en días hábiles) configuradas por contrato.

const pool = require('../../core/config/db');
const { esIdValido, esEnteroPositivo } = require('../../core/utils/validaciones');

// ---------------------------------------------------------------------
// Prioridades por contrato (requiere sql/03) — PATCH /api/contratos/prioridades/:idPrioridad
// ---------------------------------------------------------------------
// Los 5 nombres de prioridad son fijos (Urgente, Muy alta, Alta,
// Normal, Baja) y ya se crearon solos al crear el contrato — acá solo
// se puede EDITAR cuántos días hábiles tiene cada una, no crear ni
// borrar prioridades nuevas.
async function actualizarPrioridad(req, res, next) {
  const { idPrioridad } = req.params;
  const { dias_habiles } = req.body;
  if (!esIdValido(idPrioridad)) return res.status(400).json({ error: 'ID de prioridad inválido' });
  if (!esEnteroPositivo(dias_habiles)) {
    return res.status(400).json({ error: 'dias_habiles debe ser un número entero mayor a 0' });
  }
  try {
    const { rows } = await pool.query(
      'UPDATE prioridad_contrato SET dias_habiles = $1 WHERE id_prioridad_contrato = $2 RETURNING *',
      [dias_habiles, idPrioridad]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Prioridad no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}



module.exports = { actualizarPrioridad };
