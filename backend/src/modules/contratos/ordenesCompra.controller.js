// Órdenes de compra de un contrato (sección 21 del informe).

const pool = require('../../core/config/db');

// ---------------------------------------------------------------------
// Orden de compra de un contrato — POST /api/contratos/:id/ordenes-compra
// ---------------------------------------------------------------------
async function agregarOrdenCompra(req, res, next) {
  const { id } = req.params;
  const { monto, fecha_compra } = req.body;
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
