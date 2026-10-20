const pool = require('../config/db');

async function listarAreas(req, res, next) {
  try {
    const { rows } = await pool.query('SELECT id_area, nombre FROM area ORDER BY nombre');
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function listarRoles(req, res, next) {
  try {
    const { rows } = await pool.query('SELECT id_rol, nombre FROM rol ORDER BY id_rol');
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

module.exports = { listarAreas, listarRoles };
