const { randomBytes } = require('crypto');
const pool = require('../../core/config/db');
const { esIdValido, textoValido } = require('../../core/utils/validaciones');

async function listar(req, res, next) {
  try {
    const { rows } = await pool.query(`
      SELECT u.id_usuario, u.nombre, u.email, u.id_empresa, e.razon_social AS empresa_nombre
      FROM usuario u
      JOIN rol_usuario ru ON ru.id_usuario = u.id_usuario
      JOIN rol r ON r.id_rol = ru.id_rol
      LEFT JOIN empresas e ON e.id_empresa = u.id_empresa
      WHERE r.nombre = 'supervisor_empresa'
      ORDER BY u.nombre
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// Crea un usuario con rol supervisor_empresa ligado a una empresa. El
// supervisor sólo sirve para asignarlo a los contratos y tickets; no inicia
// sesión, así que password_hash recibe un valor aleatorio que nadie conoce.
async function crear(req, res, next) {
  const { nombre, email, id_empresa } = req.body;

  if (!textoValido(nombre, 150) || !textoValido(email, 150)) {
    return res.status(400).json({ error: 'nombre y email son obligatorios (máximo 150 caracteres)' });
  }
  if (!esIdValido(id_empresa)) return res.status(400).json({ error: 'id_empresa es obligatorio y debe ser válido' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const usuario = await client.query(
      `INSERT INTO usuario (nombre, email, password_hash, id_empresa)
       VALUES ($1,$2,$3,$4)
       RETURNING id_usuario, nombre, email, id_empresa`,
      [nombre.trim(), email.trim(), randomBytes(32).toString('hex'), id_empresa]
    );

    await client.query(
      `INSERT INTO rol_usuario (id_rol, id_usuario)
       SELECT id_rol, $1 FROM rol WHERE nombre = 'supervisor_empresa'`,
      [usuario.rows[0].id_usuario]
    );

    await client.query('COMMIT');
    res.status(201).json(usuario.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un usuario con ese email' });
    }
    if (err.code === '23503') {
      return res.status(400).json({ error: 'La empresa indicada no existe' });
    }
    next(err);
  } finally {
    client.release();
  }
}

module.exports = { listar, crear };
