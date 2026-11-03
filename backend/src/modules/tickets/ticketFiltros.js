// Consulta base de tickets y filtros de búsqueda. Lo usan el listado de
// tickets y los reportes, para que ambos filtren igual.
//
// Los valores siempre viajan como parámetros ($1, $2...); los nombres de
// columna salen de una lista fija en este archivo, nunca de la petición.

const { ESTADOS } = require('./ticketStateMachine');
const { esMunicipal } = require('./ticketAcceso');
const { esIdValido, esFechaISO } = require('../../core/utils/validaciones');

const PRIORIDADES = ['Urgente', 'Muy alta', 'Alta', 'Normal', 'Baja'];

const SELECT_TICKETS = `
  SELECT t.id_ticket, t.numero, t.estado, t.fecha_hora_creacion, t.fecha_vencimiento,
         t.fecha_cierre, t.plazo_subsanar, t.id_empresa, t.id_contrato,
         p.nombre_prioridad AS prioridad, c.nombre AS contrato_nombre,
         e.razon_social AS empresa_nombre, e.rut AS empresa_rut,
         e.id_area, a.nombre AS area_nombre,
         t.id_usuario AS id_supervisor, sup.nombre AS supervisor_nombre,
         t.id_creador, cr.nombre AS creador_nombre,
         t.conformidad_fecha, t.comentario_conformidad, uc.nombre AS conformidad_nombre,
         t.comentario_cierre, ucl.nombre AS cierre_nombre,
         o.descripcion, o.ubicacion, o.direccion, o.sector, o.referencia,
         o.latitud, o.longitud, o.foto, o.fecha AS observacion_fecha
  FROM ticket t
  JOIN contratos c ON c.id_contratos = t.id_contrato
  JOIN prioridad_contrato p ON p.id_prioridad_contrato = t.id_prioridad
  JOIN empresas e ON e.id_empresa = t.id_empresa
  JOIN area a ON a.id_area = e.id_area
  JOIN usuario sup ON sup.id_usuario = t.id_usuario
  LEFT JOIN usuario cr ON cr.id_usuario = t.id_creador
  LEFT JOIN usuario uc ON uc.id_usuario = t.conformidad_por
  LEFT JOIN usuario ucl ON ucl.id_usuario = t.cerrado_por
  JOIN observaciones o ON o.id_observacion = t.id_observacion
`;

function errorDeFiltro(mensaje) {
  const err = new Error(mensaje);
  err.status = 400;
  return err;
}

// Recibe la query string y el usuario que consulta. Devuelve { where, params }.
function construirFiltros(query, usuario) {
  const condiciones = [];
  const params = [];

  const agregar = (condicion, valor) => {
    params.push(valor);
    condiciones.push(condicion.replace('?', `$${params.length}`));
  };

  // Alcance por rol: un supervisor de empresa nunca ve tickets de otra empresa,
  // aunque pida otro id_empresa en la búsqueda.
  if (!esMunicipal(usuario)) {
    if (!usuario.id_empresa) condiciones.push('FALSE');
    else agregar('t.id_empresa = ?', usuario.id_empresa);
  }

  if (query.numero) {
    if (typeof query.numero !== 'string' || query.numero.length > 30) throw errorDeFiltro('Número de ticket no válido');
    agregar('t.numero ILIKE ?', `%${query.numero.trim()}%`);
  }
  if (query.id_empresa !== undefined) {
    if (!esIdValido(query.id_empresa)) throw errorDeFiltro('id_empresa no válido');
    if (esMunicipal(usuario)) agregar('t.id_empresa = ?', query.id_empresa);
  }
  if (query.id_area !== undefined) {
    if (!esIdValido(query.id_area)) throw errorDeFiltro('id_area no válido');
    agregar('e.id_area = ?', query.id_area);
  }
  if (query.id_supervisor !== undefined) {
    if (!esIdValido(query.id_supervisor)) throw errorDeFiltro('id_supervisor no válido');
    agregar('t.id_usuario = ?', query.id_supervisor);
  }
  if (query.id_creador !== undefined) {
    if (!esIdValido(query.id_creador)) throw errorDeFiltro('id_creador no válido');
    agregar('t.id_creador = ?', query.id_creador);
  }
  if (query.estado) {
    const estados = String(query.estado).split(',').map((e) => e.trim()).filter(Boolean);
    if (estados.length === 0 || estados.some((e) => !Object.values(ESTADOS).includes(e))) {
      throw errorDeFiltro('Estado no válido en el filtro');
    }
    params.push(estados);
    condiciones.push(`t.estado::text = ANY($${params.length}::text[])`);
  }
  if (query.prioridad) {
    if (!PRIORIDADES.includes(query.prioridad)) throw errorDeFiltro('Prioridad no válida');
    agregar('p.nombre_prioridad = ?', query.prioridad);
  }

  const rangos = [
    ['creada_desde', 't.fecha_hora_creacion::date >= ?'],
    ['creada_hasta', 't.fecha_hora_creacion::date <= ?'],
    ['vence_desde', 't.fecha_vencimiento >= ?'],
    ['vence_hasta', 't.fecha_vencimiento <= ?'],
    ['cerrada_desde', 't.fecha_cierre::date >= ?'],
    ['cerrada_hasta', 't.fecha_cierre::date <= ?'],
  ];
  for (const [clave, condicion] of rangos) {
    if (query[clave] === undefined || query[clave] === '') continue;
    if (!esFechaISO(query[clave])) throw errorDeFiltro(`${clave} no es una fecha válida (aaaa-mm-dd)`);
    agregar(condicion, query[clave]);
  }

  return {
    where: condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '',
    params,
  };
}

module.exports = { SELECT_TICKETS, PRIORIDADES, construirFiltros };
