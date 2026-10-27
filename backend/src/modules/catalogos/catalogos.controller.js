const pool = require('../../core/config/db');
const { textoValido } = require('../../core/utils/validaciones');

async function listarAreas(req, res, next) {
  try {
    const { rows } = await pool.query('SELECT id_area, nombre FROM area ORDER BY nombre');
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function crearArea(req, res, next) {
  const nombre = typeof req.body.nombre === 'string' ? req.body.nombre.trim() : '';
  if (!textoValido(nombre, 150)) {
    return res.status(400).json({ error: 'nombre es obligatorio (máximo 150 caracteres)' });
  }

  try {
    const { rows } = await pool.query(
      'INSERT INTO area (nombre) VALUES ($1) RETURNING id_area, nombre',
      [nombre]
    );
    res.status(201).json(rows[0]);
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

module.exports = { listarAreas, crearArea, listarRoles };
