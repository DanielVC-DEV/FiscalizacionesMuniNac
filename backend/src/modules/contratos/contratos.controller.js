// =====================================================================
// CRUD de Contratos
// =====================================================================
// Cada función de acá abajo corresponde a un endpoint (ver
// contratos.routes.js, que es el que conecta cada función con
// un verbo HTTP + una URL).
//
// `pool` es la conexión a PostgreSQL (definida en config/db.js). Es un
// "pool de conexiones": en vez de abrir una conexión nueva por cada
// consulta (lento), mantiene varias abiertas y las reutiliza.
//
// Todas las consultas usan placeholders ($1, $2, ...) en vez de meter
// los valores directo en el string SQL. Esto es importante: evita SQL
// injection, porque la librería `pg` manda el valor por separado del
// comando SQL, nunca se interpreta como parte del código SQL.
// =====================================================================

const pool = require('../../core/config/db');
const {
  esIdValido, esFechaISO, esEnteroPositivo, textoValido, textoOpcional,
} = require('../../core/utils/validaciones');

// Valida los campos editables de un contrato (alta y edición comparten las mismas reglas).
// Devuelve el mensaje de error, o null si todo está bien.
function validarDatosContrato({
  nombre, fecha_inicio, fecha_termino, dia_respuesta, id_licitacion, vigencia, monto_actualizado,
}) {
  if (!textoValido(nombre, 200)) return 'El nombre del contrato es obligatorio (máximo 200 caracteres)';
  if (!esFechaISO(fecha_inicio)) return 'La fecha de inicio no es válida (formato aaaa-mm-dd)';
  if (!esFechaISO(fecha_termino)) return 'La fecha de término no es válida (formato aaaa-mm-dd)';
  if (fecha_termino < fecha_inicio) return 'La fecha de término debe ser igual o posterior a la fecha de inicio';
  if (dia_respuesta !== undefined && dia_respuesta !== null && !esEnteroPositivo(dia_respuesta)) {
    return 'El día de respuesta debe ser un número entero mayor a 0';
  }
  if (!textoOpcional(id_licitacion, 50) || !textoOpcional(vigencia, 50)) {
    return 'La licitación o la vigencia supera el largo permitido (máximo 50 caracteres)';
  }
  if (monto_actualizado !== undefined && monto_actualizado !== null &&
      !(typeof monto_actualizado === 'number' && Number.isFinite(monto_actualizado) && monto_actualizado >= 0)) {
    return 'El monto actualizado debe ser un número mayor o igual a 0';
  }
  return null;
}

// ---------------------------------------------------------------------
// READ (todos) — GET /api/contratos
// ---------------------------------------------------------------------
// Trae todos los contratos, con el nombre de la empresa ya resuelto
// (JOIN) para no tener que hacer una consulta aparte por cada fila
// desde el frontend.
async function listar(req, res, next) {
  try {
    // Incluye datos de empresa y agrupa órdenes para que el listado llegue listo para la interfaz.
    const { rows } = await pool.query(`
      SELECT c.id_contratos, c.nombre, c.id_licitacion, c.vigencia,
             c.fecha_inicio, c.fecha_termino, c.monto_actualizado, c.dia_respuesta,
             c.id_empresa, c.id_supervisor,
             e.razon_social AS empresa_nombre, e.rut AS empresa_rut,
             u.nombre AS supervisor_nombre, u.email AS supervisor_email,
             (SELECT COALESCE(json_agg(json_build_object(
                'id_compra', o.id_compra, 'monto', o.monto, 'fecha_compra', o.fecha_compra
              ) ORDER BY o.fecha_compra), '[]'::json)
          FROM orden_de_compra o WHERE o.id_contratos = c.id_contratos) AS ordenes_compra
      FROM contratos c
      JOIN empresas e ON e.id_empresa = c.id_empresa
      LEFT JOIN usuario u ON u.id_usuario = c.id_supervisor
      ORDER BY c.fecha_inicio DESC
    `);
    res.json(rows);
  } catch (err) {
    // next(err) pasa el error al middleware de errores (errorHandler.js)
    // en vez de manejarlo acá — así no repetimos el mismo try/catch
    // genérico en cada función.
    next(err);
  }
}

// ---------------------------------------------------------------------
// READ (uno) — GET /api/contratos/:id
// ---------------------------------------------------------------------
// req.params.id viene de la URL (ej. /api/contratos/7 -> id = "7").
// Además del contrato, trae sus órdenes de compra y (si ya corriste la
// migración 03) sus prioridades — así el frontend arma la pantalla de
// detalle con una sola llamada en vez de tres.
async function obtener(req, res, next) {
  const { id } = req.params;
  if (!esIdValido(id)) return res.status(400).json({ error: 'ID de contrato inválido' });
  try {
    const contrato = await pool.query(
      `SELECT c.*, e.razon_social AS empresa_nombre,
              u.nombre AS supervisor_nombre, u.email AS supervisor_email
       FROM contratos c
       JOIN empresas e ON e.id_empresa = c.id_empresa
       LEFT JOIN usuario u ON u.id_usuario = c.id_supervisor
       WHERE c.id_contratos = $1`,
      [id]
    );

    // Si no hay filas, el id no existe: respondemos 404 en vez de
    // devolver un objeto vacío (así el frontend sabe distinguir
    // "no existe" de "existe pero está vacío").
    if (contrato.rows.length === 0) {
      return res.status(404).json({ error: 'Contrato no encontrado' });
    }

    const ordenes = await pool.query(
      'SELECT id_compra, monto, fecha_compra FROM orden_de_compra WHERE id_contratos = $1 ORDER BY fecha_compra',
      [id]
    );

    // Esta consulta solo devuelve filas si corriste sql/03 (si no,
    // simplemente vuelve un array vacío — no revienta).
    const prioridades = await pool.query(
      'SELECT id_prioridad_contrato, nombre_prioridad, dias_habiles FROM prioridad_contrato WHERE id_contrato = $1 ORDER BY dias_habiles',
      [id]
    );

    res.json({
      ...contrato.rows[0],
      ordenes_compra: ordenes.rows,
      prioridades: prioridades.rows,
    });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------
// CREATE — POST /api/contratos
// ---------------------------------------------------------------------
// req.body es el JSON que mandó el frontend (gracias a express.json(),
// configurado en app.js, que lo parsea automáticamente).
//
// numero_contrato y las 5 filas de prioridad_contrato (si está la
// migración 03) se generan SOLOS mediante triggers en la base de
// datos — por eso no aparecen acá: no hay que insertarlos a mano.
async function crear(req, res, next) {
  const {
    nombre, id_empresa, fecha_inicio, fecha_termino,
    dia_respuesta, id_licitacion, vigencia, monto_actualizado, id_supervisor,
  } = req.body;

  // Validación mínima en el backend: NUNCA confíes solo en la
  // validación del frontend, porque cualquiera puede mandar un request
  // directo a la API sin pasar por la app.
  if (!esIdValido(id_empresa) || !esIdValido(id_supervisor)) {
    return res.status(400).json({ error: 'id_empresa e id_supervisor son obligatorios y deben ser válidos' });
  }

  const errorDatos = validarDatosContrato(req.body);
  if (errorDatos) return res.status(400).json({ error: errorDatos });

  try {
    const supervisor = await pool.query(
      `SELECT u.id_usuario
       FROM usuario u
       JOIN rol_usuario ru ON ru.id_usuario = u.id_usuario
       JOIN rol r ON r.id_rol = ru.id_rol
       WHERE u.id_usuario = $1 AND u.id_empresa = $2 AND r.nombre = 'supervisor_empresa'`,
      [id_supervisor, id_empresa]
    );
    if (supervisor.rows.length === 0) {
      return res.status(400).json({
        error: 'El supervisor debe pertenecer a la empresa y tener rol supervisor_empresa',
      });
    }

    // RETURNING * hace que PostgreSQL devuelva la fila recién creada
    // en la misma consulta — así no hay que hacer un SELECT aparte
    // después del INSERT.
    const { rows } = await pool.query(
      `INSERT INTO contratos
         (nombre, id_empresa, id_supervisor, fecha_inicio, fecha_termino, dia_respuesta, id_licitacion, vigencia, monto_actualizado)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [nombre, id_empresa, id_supervisor, fecha_inicio, fecha_termino, dia_respuesta, id_licitacion, vigencia, monto_actualizado]
    );

    // 201 = "Created". Es la convención REST para un POST que creó algo.
    res.status(201).json(rows[0]);
  } catch (err) {
    // Ej: si id_empresa no existe, PostgreSQL lanza un error de FK
    // (código 23503), que errorHandler.js ya traduce a un mensaje claro.
    next(err);
  }
}

// ---------------------------------------------------------------------
// UPDATE — PUT /api/contratos/:id
// ---------------------------------------------------------------------
// Reemplaza TODOS los campos editables del contrato con lo que venga
// en el body (por eso es PUT y no PATCH: PATCH sería para actualizar
// solo un campo suelto). El frontend tiene que mandar el objeto
// completo, no solo el campo que cambió.
async function actualizar(req, res, next) {
  const { id } = req.params;
  const {
    nombre, fecha_inicio, fecha_termino,
    dia_respuesta, id_licitacion, vigencia, monto_actualizado,
  } = req.body;

  if (!esIdValido(id)) return res.status(400).json({ error: 'ID de contrato inválido' });

  const errorDatos = validarDatosContrato(req.body);
  if (errorDatos) return res.status(400).json({ error: errorDatos });

  try {
    const { rows } = await pool.query(
      `UPDATE contratos
       SET nombre = $1, fecha_inicio = $2, fecha_termino = $3,
           dia_respuesta = $4, id_licitacion = $5, vigencia = $6, monto_actualizado = $7
       WHERE id_contratos = $8
       RETURNING *`,
      [nombre, fecha_inicio, fecha_termino, dia_respuesta, id_licitacion, vigencia, monto_actualizado, id]
    );

    // Si el UPDATE no afectó ninguna fila, es porque ese id no existe.
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Contrato no encontrado' });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------
// DELETE — DELETE /api/contratos/:id
// ---------------------------------------------------------------------
async function eliminar(req, res, next) {
  const { id } = req.params;
  if (!esIdValido(id)) return res.status(400).json({ error: 'ID de contrato inválido' });
  try {
    const { rows } = await pool.query(
      'DELETE FROM contratos WHERE id_contratos = $1 RETURNING id_contratos',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Contrato no encontrado' });
    }

    // 204 = "No Content": se borró bien, no hay nada que devolver.
    res.status(204).send();
  } catch (err) {
    // OJO: si el contrato tiene tickets asociados (columna
    // ticket.id_contrato, de la migración 03), PostgreSQL va a
    // rechazar el borrado con un error de FK (23503) — porque por
    // defecto no se permite borrar algo que otra tabla todavía está
    // referenciando. errorHandler.js lo traduce a un 400 legible.
    // Las órdenes de compra, en cambio, SÍ se borran solas (tienen
    // ON DELETE CASCADE en el esquema).
    next(err);
  }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
