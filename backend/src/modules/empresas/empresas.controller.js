const pool = require('../../core/config/db');
const {
  normalizarRut, esIdValido, textoValido, textoOpcional,
} = require('../../core/utils/validaciones');

async function listar(req, res, next) {
  try {
    const { rows } = await pool.query(`
      SELECT e.id_empresa, e.razon_social, e.rut, e.direccion_comercial,
             e.direccion_base_nacimiento, e.administrador_contrato_nombre,
             e.administrador_contrato_email, e.administrador_contrato_telefono,
             e.id_area, a.nombre AS area_nombre,
             e.id_supervisor_contraparte, u.nombre AS supervisor_nombre, u.email AS supervisor_email
      FROM empresas e
      JOIN area a ON a.id_area = e.id_area
      LEFT JOIN usuario u ON u.id_usuario = e.id_supervisor_contraparte
      ORDER BY e.razon_social
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function obtener(req, res, next) {
  if (!esIdValido(req.params.id)) return res.status(400).json({ error: 'ID de empresa inválido' });
  try {
    const { rows } = await pool.query(
      `SELECT e.*, a.nombre AS area_nombre, u.nombre AS supervisor_nombre
       FROM empresas e
       JOIN area a ON a.id_area = e.id_area
       LEFT JOIN usuario u ON u.id_usuario = e.id_supervisor_contraparte
       WHERE e.id_empresa = $1`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Empresa no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function crear(req, res, next) {
  const {
    razon_social, rut, id_area,
    direccion_comercial, direccion_base_nacimiento,
    administrador_contrato_nombre, administrador_contrato_email, administrador_contrato_telefono,
  } = req.body;

  if (!textoValido(razon_social, 200)) {
    return res.status(400).json({ error: 'La razón social es obligatoria (máximo 200 caracteres)' });
  }

  // El RUT se valida con dígito verificador y se guarda siempre en el mismo formato.
  const rutNormalizado = normalizarRut(rut);
  if (!rutNormalizado) {
    return res.status(400).json({ error: 'El RUT no es válido. Revisa el número y el dígito verificador.' });
  }

  if (!esIdValido(id_area)) {
    return res.status(400).json({ error: 'El área indicada no es válida' });
  }

  if (
    !textoOpcional(direccion_comercial, 255) ||
    !textoOpcional(direccion_base_nacimiento, 255) ||
    !textoOpcional(administrador_contrato_nombre, 150) ||
    !textoOpcional(administrador_contrato_email, 150) ||
    !textoOpcional(administrador_contrato_telefono, 30)
  ) {
    return res.status(400).json({ error: 'Uno de los campos de contacto o dirección supera el largo permitido' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO empresas
         (razon_social, rut, id_area, direccion_comercial, direccion_base_nacimiento,
          administrador_contrato_nombre, administrador_contrato_email, administrador_contrato_telefono)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [razon_social.trim(), rutNormalizado, id_area, direccion_comercial || null, direccion_base_nacimiento || null,
       administrador_contrato_nombre || null, administrador_contrato_email || null, administrador_contrato_telefono || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Ya existe una empresa registrada con ese RUT' });
    }
    next(err);
  }
}

// Asigna (o cambia) el supervisor/contraparte local de una empresa.
// Solo deja elegir entre usuarios que ya pertenecen a esa empresa y
// tienen rol supervisor_empresa.
async function asignarSupervisorContraparte(req, res, next) {
  const { id } = req.params;
  const { id_usuario } = req.body;

  if (!esIdValido(id) || !esIdValido(id_usuario)) {
    return res.status(400).json({ error: 'ID de empresa o de usuario inválido' });
  }

  try {
    const check = await pool.query(
      `SELECT u.id_usuario
       FROM usuario u
       JOIN rol_usuario ru ON ru.id_usuario = u.id_usuario
       JOIN rol r ON r.id_rol = ru.id_rol
       WHERE u.id_usuario = $1 AND u.id_empresa = $2 AND r.nombre = 'supervisor_empresa'`,
      [id_usuario, id]
    );
    if (check.rows.length === 0) {
      return res.status(400).json({
        error: 'El usuario indicado no pertenece a esta empresa o no tiene rol supervisor_empresa',
      });
    }

    const { rows } = await pool.query(
      'UPDATE empresas SET id_supervisor_contraparte = $1 WHERE id_empresa = $2 RETURNING *',
      [id_usuario, id]
    );
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// Lista los usuarios con rol supervisor_empresa de una empresa (para el
// selector de "supervisor contraparte" y para CrearTicketScreen).
async function listarSupervisores(req, res, next) {
  if (!esIdValido(req.params.id)) return res.status(400).json({ error: 'ID de empresa inválido' });
  try {
    const { rows } = await pool.query(
      `SELECT u.id_usuario, u.nombre, u.email
       FROM usuario u
       JOIN rol_usuario ru ON ru.id_usuario = u.id_usuario
       JOIN rol r ON r.id_rol = ru.id_rol
       WHERE u.id_empresa = $1 AND r.nombre = 'supervisor_empresa'
       ORDER BY u.nombre`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, obtener, crear, asignarSupervisorContraparte, listarSupervisores };
