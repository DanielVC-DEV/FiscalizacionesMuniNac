// Órdenes de compra de un contrato (sección 21 del informe).

const pool = require('../../core/config/db');
const { esIdValido, esMontoValido, esFechaISO } = require('../../core/utils/validaciones');

// ---------------------------------------------------------------------
// Orden de compra de un contrato — POST /api/contratos/:id/ordenes-compra
// ---------------------------------------------------------------------
async function agregarOrdenCompra(req, res, next) {
  const { id } = req.params;
  const { monto, fecha_compra } = req.body;

  if (!esIdValido(id)) return res.status(400).json({ error: 'ID de contrato inválido' });
  if (!esMontoValido(monto)) return res.status(400).json({ error: 'El monto debe ser un número mayor a 0' });
  if (!esFechaISO(fecha_compra)) return res.status(400).json({ error: 'La fecha de compra no es válida (formato aaaa-mm-dd)' });

  try {
    const { rows } = await pool.query(
      'INSERT INTO orden_de_compra (id_contratos, monto, fecha_compra) VALUES ($1,$2,$3) RETURNING *',
      [id, monto, fecha_compra]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}


module.exports = { agregarOrdenCompra };
