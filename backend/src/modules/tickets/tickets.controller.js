const pool = require('../../core/config/db');
const { enTransaccion } = require('../../core/utils/transaccion');
const { borrarArchivo } = require('../../core/utils/archivos');
const { hoyEnChile, sumarDiasHabiles } = require('../../core/utils/diasHabiles');
const { esIdValido, textoValido, textoOpcional } = require('../../core/utils/validaciones');
const { cargarFeriados } = require('../feriados/feriados.service');
const { notificarTicket } = require('../notificaciones/notificaciones.service');
const {
  ESTADOS, ESTADOS_RESERVADOS, transicionar, cambiarEstadoTicket,
} = require('./ticketStateMachine');
const {
  TIPOS_ACTUACION, TIPOS_SOLO_MUNICIPALES, registrarActuacion, obtenerHistorial,
} = require('./actuaciones');
const { SELECT_TICKETS, construirFiltros } = require('./ticketFiltros');
const { puedeVerTicket, esMunicipal } = require('./ticketAcceso');
const { validarFotos, registrarFotos } = require('./fotos');

function responderError(res, next, err) {
  if (err.status) return res.status(err.status).json({ error: err.message });
  next(err);
}

// Quita los archivos ya escritos en disco cuando la transacción que los
// referenciaba falla.
async function limpiarArchivos(rutas) {
  await Promise.all(rutas.map((ruta) => borrarArchivo(ruta).catch(() => {})));
}

// Valida la ubicación: todo es opcional (la falta de geolocalización no impide
// crear el ticket), pero las coordenadas van en pareja y dentro de rango.
function validarUbicacion({ ubicacion, direccion, sector, referencia, latitud, longitud }) {
  if (!textoOpcional(ubicacion, 255) || !textoOpcional(direccion, 255) ||
      !textoOpcional(sector, 150) || !textoOpcional(referencia, 255)) {
    return 'La ubicación supera el largo permitido';
  }
  const hayLatitud = latitud !== undefined && latitud !== null;
  const hayLongitud = longitud !== undefined && longitud !== null;
  if (hayLatitud !== hayLongitud) return 'Debes indicar latitud y longitud juntas';
  if (hayLatitud && !(Number.isFinite(latitud) && Math.abs(latitud) <= 90)) return 'Latitud fuera de rango';
  if (hayLongitud && !(Number.isFinite(longitud) && Math.abs(longitud) <= 180)) return 'Longitud fuera de rango';
  return null;
}

async function listar(req, res, next) {
  let filtros;
  try {
    filtros = construirFiltros(req.query, req.usuario);
  } catch (err) {
    return responderError(res, next, err);
  }
  try {
    const { rows } = await pool.query(
      `${SELECT_TICKETS} ${filtros.where} ORDER BY t.fecha_hora_creacion DESC`,
      filtros.params
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function obtener(req, res, next) {
  if (!esIdValido(req.params.id)) return res.status(400).json({ error: 'ID de ticket inválido' });
  try {
    const { rows } = await pool.query(`${SELECT_TICKETS} WHERE t.id_ticket = $1`, [req.params.id]);
    // Un ticket fuera del alcance del usuario responde igual que uno inexistente.
    if (rows.length === 0 || !puedeVerTicket(req.usuario, rows[0])) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }
    const ticket = rows[0];

    const contrato = await pool.query(
      `SELECT c.fecha_inicio, c.fecha_termino, c.dia_respuesta,
              COALESCE((SELECT json_agg(json_build_object(
                'id_compra', o.id_compra, 'monto', o.monto, 'fecha_compra', o.fecha_compra
              ) ORDER BY o.fecha_compra)
              FROM orden_de_compra o WHERE o.id_contratos = c.id_contratos), '[]'::json) AS ordenes_compra
       FROM contratos c WHERE c.id_contratos = $1`,
      [ticket.id_contrato]
    );

    const respuestas = await pool.query(
      `SELECT r.id_respuesta, r.comentario, r.foto, r.fecha, u.nombre AS usuario_nombre
       FROM respuesta r JOIN usuario u ON u.id_usuario = r.id_usuario
       WHERE r.id_ticket = $1 ORDER BY r.fecha`,
      [req.params.id]
    );

    // La empresa no ve las actuaciones internas (avisos con correos de destinatarios).
    const historial = (await obtenerHistorial(pool, req.params.id))
      .filter(({ tipo }) => esMunicipal(req.usuario) || !TIPOS_SOLO_MUNICIPALES.includes(tipo));

    res.json({
      ...ticket,
      contrato: contrato.rows[0],
      respuestas: respuestas.rows,
      historial,
    });
  } catch (err) {
    next(err);
  }
}

// Crea la observación y el ticket en una sola transacción. El creador sale de
// la sesión (no del cuerpo), el plazo y el vencimiento se calculan aquí con los
// días hábiles de la prioridad y los feriados cargados.
async function crear(req, res, next) {
  const {
    id_contrato, id_prioridad, descripcion, fotos,
    ubicacion, direccion, sector, referencia, latitud, longitud,
  } = req.body;

  if (!esIdValido(id_contrato) || !esIdValido(id_prioridad)) {
    return res.status(400).json({ error: 'id_contrato e id_prioridad son obligatorios y deben ser válidos' });
  }
  if (!textoValido(descripcion, 5000)) {
    return res.status(400).json({ error: 'La descripción es obligatoria (máximo 5000 caracteres)' });
  }
  const errorUbicacion = validarUbicacion(req.body);
  if (errorUbicacion) return res.status(400).json({ error: errorUbicacion });
  const errorFotos = validarFotos(fotos);
  if (errorFotos) return res.status(400).json({ error: errorFotos });

  const rutasGuardadas = [];
  try {
    const ticket = await enTransaccion(pool, async (client) => {
      const contrato = await client.query(
        'SELECT id_supervisor FROM contratos WHERE id_contratos = $1',
        [id_contrato]
      );
      if (contrato.rows.length === 0) {
        const err = new Error('Contrato no encontrado');
        err.status = 404;
        throw err;
      }
      const idSupervisor = contrato.rows[0].id_supervisor;
      if (!idSupervisor) {
        const err = new Error('El contrato no tiene un supervisor asignado');
        err.status = 400;
        throw err;
      }

      // La prioridad tiene que ser de ESTE contrato: sus días hábiles son los que definen el plazo.
      const prioridad = await client.query(
        'SELECT dias_habiles FROM prioridad_contrato WHERE id_prioridad_contrato = $1 AND id_contrato = $2',
        [id_prioridad, id_contrato]
      );
      if (prioridad.rows.length === 0) {
        const err = new Error('La prioridad indicada no pertenece a este contrato');
        err.status = 400;
        throw err;
      }
      const plazo = prioridad.rows[0].dias_habiles;

      const feriados = await cargarFeriados(client);
      const fechaVencimiento = sumarDiasHabiles(hoyEnChile(), plazo, feriados);

      const idCreador = req.usuario.id_usuario;
      const observacion = await client.query(
        `INSERT INTO observaciones (id_usuario, descripcion, ubicacion, direccion, sector, referencia, latitud, longitud)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id_observacion`,
        [idCreador, descripcion.trim(), ubicacion || null, direccion || null, sector || null,
          referencia || null, latitud ?? null, longitud ?? null]
      );

      const insercion = await client.query(
        `INSERT INTO ticket
           (numero, id_contrato, id_usuario, id_creador, id_observacion, id_prioridad, plazo_subsanar, fecha_vencimiento)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         RETURNING *`,
        [
          `TKT-${Date.now()}`,
          id_contrato,
          idSupervisor,
          idCreador,
          observacion.rows[0].id_observacion,
          id_prioridad,
          plazo,
          fechaVencimiento,
        ]
      );
      const nuevo = insercion.rows[0];

      const actuacion = await registrarActuacion(client, {
        idTicket: nuevo.id_ticket,
        tipo: TIPOS_ACTUACION.CREACION,
        idUsuario: idCreador,
        descripcion: 'Ticket creado',
        datos: { fecha_vencimiento: fechaVencimiento, plazo_dias_habiles: plazo },
      });

      rutasGuardadas.push(...await registrarFotos(client, {
        idTicket: nuevo.id_ticket,
        idActuacion: actuacion.id_actuacion,
        idUsuario: idCreador,
        fotos,
      }));

      return nuevo;
    });

    // El aviso va fuera de la transacción: un fallo de correo no debe deshacer el ticket.
    notificarTicket(pool, ticket.id_ticket, 'CREACION')
      .catch((err) => console.error('No se pudo notificar el ticket creado:', err));

    res.status(201).json(ticket);
  } catch (err) {
    await limpiarArchivos(rutasGuardadas);
    responderError(res, next, err);
  }
}

// Cambio genérico de estado. Conformidad, cierre y reapertura tienen sus propios
// endpoints, que dejan trazabilidad de quién y cuándo.
async function cambiarEstado(req, res, next) {
  const { estado, comentario } = req.body;
  if (!esIdValido(req.params.id)) return res.status(400).json({ error: 'ID de ticket inválido' });
  if (!estado) return res.status(400).json({ error: 'Falta el campo "estado"' });
  if (!Object.values(ESTADOS).includes(estado)) {
    return res.status(400).json({ error: `Estado no válido: "${estado}"` });
  }
  if (ESTADOS_RESERVADOS.includes(estado)) {
    return res.status(400).json({
      error: `Para pasar a ${estado} usa la acción correspondiente (conformidad, cierre o reapertura).`,
    });
  }
  if (comentario !== undefined && comentario !== null && !textoOpcional(comentario, 5000)) {
    return res.status(400).json({ error: 'El comentario supera el largo permitido (5000 caracteres)' });
  }

  try {
    const resultado = await cambiarEstadoTicket(pool, req.params.id, estado, {
      idUsuario: req.usuario.id_usuario,
      comentario: comentario || null,
    });
    res.json(resultado);
  } catch (err) {
    responderError(res, next, err);
  }
}

// La respuesta no sea suficiente: el ticket sigue abierto y se pide una nueva subsanación.
async function solicitarSubsanacion(req, res, next) {
  const { comentario } = req.body;
  if (!esIdValido(req.params.id)) return res.status(400).json({ error: 'ID de ticket inválido' });
  if (!textoValido(comentario, 5000)) {
    return res.status(400).json({ error: 'Debes indicar qué debe subsanar la empresa (máximo 5000 caracteres)' });
  }

  try {
    const resultado = await enTransaccion(pool, (client) => transicionar(
      client, req.params.id, ESTADOS.REQUIERE_NUEVA_SUBSANACION,
      {
        idUsuario: req.usuario.id_usuario,
        tipo: TIPOS_ACTUACION.SOLICITUD_SUBSANACION,
        comentario: comentario.trim(),
      }
    ));
    notificarTicket(pool, req.params.id, 'SOLICITUD', { comentario: comentario.trim() })
      .catch((err) => console.error('No se pudo notificar la solicitud de subsanación:', err));
    res.json(resultado);
  } catch (err) {
    responderError(res, next, err);
  }
}

// Conformidad: el usuario municipal revisa la respuesta y declara la observación subsanada.
async function darConformidad(req, res, next) {
  const { comentario } = req.body;
  if (!esIdValido(req.params.id)) return res.status(400).json({ error: 'ID de ticket inválido' });
  if (comentario !== undefined && comentario !== null && !textoOpcional(comentario, 5000)) {
    return res.status(400).json({ error: 'El comentario supera el largo permitido (5000 caracteres)' });
  }

  try {
    const resultado = await enTransaccion(pool, async (client) => {
      const cambio = await transicionar(client, req.params.id, ESTADOS.SUBSANADO_CONFORME, {
        idUsuario: req.usuario.id_usuario,
        tipo: TIPOS_ACTUACION.CONFORMIDAD,
        comentario: comentario || null,
      });
      await client.query(
        `UPDATE ticket
         SET conformidad_por = $2, conformidad_fecha = now(), comentario_conformidad = $3
         WHERE id_ticket = $1`,
        [req.params.id, req.usuario.id_usuario, comentario || null]
      );
      return cambio;
    });
    res.json(resultado);
  } catch (err) {
    responderError(res, next, err);
  }
}

// Cierre expreso: sólo desde SUBSANADO_CONFORME.
async function cerrar(req, res, next) {
  const { comentario } = req.body;
  if (!esIdValido(req.params.id)) return res.status(400).json({ error: 'ID de ticket inválido' });
  if (comentario !== undefined && comentario !== null && !textoOpcional(comentario, 5000)) {
    return res.status(400).json({ error: 'El comentario supera el largo permitido (5000 caracteres)' });
  }

  try {
    const resultado = await enTransaccion(pool, async (client) => {
      const cambio = await transicionar(client, req.params.id, ESTADOS.CERRADO, {
        idUsuario: req.usuario.id_usuario,
        tipo: TIPOS_ACTUACION.CIERRE,
        comentario: comentario || null,
      });
      await client.query(
        `UPDATE ticket
         SET cerrado_por = $2, fecha_cierre = now(), comentario_cierre = $3
         WHERE id_ticket = $1`,
        [req.params.id, req.usuario.id_usuario, comentario || null]
      );
      return cambio;
    });
    res.json(resultado);
  } catch (err) {
    responderError(res, next, err);
  }
}

// Reapertura de un ticket cerrado. El historial anterior se conserva; los datos
// de conformidad y cierre vigentes se limpian porque ya no aplican.
async function reabrir(req, res, next) {
  const { comentario } = req.body;
  if (!esIdValido(req.params.id)) return res.status(400).json({ error: 'ID de ticket inválido' });
  if (!textoValido(comentario, 5000)) {
    return res.status(400).json({ error: 'Debes indicar el motivo de la reapertura' });
  }

  try {
    const resultado = await enTransaccion(pool, async (client) => {
      const cambio = await transicionar(client, req.params.id, ESTADOS.ABIERTO, {
        idUsuario: req.usuario.id_usuario,
        tipo: TIPOS_ACTUACION.REAPERTURA,
        comentario: comentario.trim(),
      });
      await client.query(
        `UPDATE ticket
         SET cerrado_por = NULL, fecha_cierre = NULL, comentario_cierre = NULL,
             conformidad_por = NULL, conformidad_fecha = NULL, comentario_conformidad = NULL
         WHERE id_ticket = $1`,
        [req.params.id]
      );
      return cambio;
    });
    res.json(resultado);
  } catch (err) {
    responderError(res, next, err);
  }
}

module.exports = {
  listar, obtener, crear, cambiarEstado,
  solicitarSubsanacion, darConformidad, cerrar, reabrir,
};
