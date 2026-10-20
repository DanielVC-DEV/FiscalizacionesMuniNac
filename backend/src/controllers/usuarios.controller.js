const pool = require('../config/db');

async function listar(req, res, next) {
  try {
    const { rows } = await pool.query(`
      SELECT u.id_usuario, u.nombre, u.email, u.id_empresa, r.nombre AS rol
      FROM usuario u
      LEFT JOIN rol_usuario ru ON ru.id_usuario = u.id_usuario
      LEFT JOIN rol r ON r.id_rol = ru.id_rol
      ORDER BY u.nombre
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// Crea el usuario y le asigna el rol en una sola transacción, porque en
// este modelo un usuario sin fila en rol_usuario no sirve de nada.
async function crear(req, res, next) {
  const { nombre, email, password_hash, id_empresa, id_rol } = req.body;

  if (!nombre || !email || !password_hash || !id_rol) {
    return res.status(400).json({ error: 'nombre, email, password_hash e id_rol son obligatorios' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const usuario = await client.query(
      'INSERT INTO usuario (nombre, email, password_hash, id_empresa) VALUES ($1,$2,$3,$4) RETURNING id_usuario, nombre, email, id_empresa',
      [nombre, email, password_hash, id_empresa || null]
    );

    await client.query(
      'INSERT INTO rol_usuario (id_rol, id_usuario) VALUES ($1,$2)',
      [id_rol, usuario.rows[0].id_usuario]
    );

    await client.query('COMMIT');
    res.status(201).json(usuario.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

module.exports = { listar, crear };
