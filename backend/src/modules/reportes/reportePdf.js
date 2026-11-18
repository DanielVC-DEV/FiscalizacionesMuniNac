// Dibuja el reporte PDF con pdfkit: periodo, indicadores, listado de tickets
// y, por ticket, su detalle con el historial de actuaciones.

const PDFDocument = require('pdfkit');

const ETIQUETAS_TIPO = {
  CREACION: 'Creación del ticket',
  RESPUESTA: 'Respuesta de la empresa',
  OBSERVACION: 'Observación',
  SOLICITUD_SUBSANACION: 'Solicitud de subsanación',
  CAMBIO_ESTADO: 'Cambio de estado',
  NOTIFICACION: 'Notificación',
  RECORDATORIO: 'Recordatorio',
  VENCIMIENTO: 'Vencimiento',
  CONFORMIDAD: 'Conformidad',
  CIERRE: 'Cierre',
  REAPERTURA: 'Reapertura',
  ENLACE_CONSULTA: 'Enlace de consulta externa',
};

function fecha(valor) {
  if (!valor) return '-';
  return new Date(valor).toLocaleString('es-CL', { timeZone: 'America/Santiago' });
}

function dibujarTitulo(doc, texto) {
  doc.moveDown(0.8).fontSize(13).fillColor('#01497c').text(texto).fillColor('#000');
  doc.moveDown(0.2);
}

function dibujarLinea(doc, etiqueta, valor) {
  doc.fontSize(10).font('Helvetica-Bold').text(`${etiqueta}: `, { continued: true })
    .font('Helvetica').text(valor ?? '-');
}

const AZUL = '#01497c';
const ESTADOS_GRAFICO = [
  { campo: 'abiertos', etiqueta: 'Abiertos', color: '#01497c' },
  { campo: 'pendientes_revision', etiqueta: 'Pendientes de revisión', color: '#8a8704' },
  { campo: 'requieren_nueva_subsanacion', etiqueta: 'Nueva subsanación', color: '#c25b00' },
  { campo: 'vencidos', etiqueta: 'Vencidos', color: '#7c0101' },
  { campo: 'subsanados_conforme', etiqueta: 'Subsanados conforme', color: '#017c15' },
  { campo: 'cerrados', etiqueta: 'Cerrados', color: '#5b6570' },
];

function asegurarEspacio(doc, alto) {
  if (doc.y + alto > doc.page.height - doc.page.margins.bottom) doc.addPage();
}

// Tarjetas con las cifras principales, en una fila de tres.
function dibujarTarjetas(doc, ind) {
  const tarjetas = [
    ['Total de tickets', ind.total, AZUL],
    ['Pendientes de revisión', ind.pendientes_revision, '#8a8704'],
    ['Vencidos', ind.vencidos, '#7c0101'],
  ];
  const ancho = (doc.page.width - doc.page.margins.left - doc.page.margins.right - 20) / 3;
  asegurarEspacio(doc, 60);
  const y = doc.y;
  tarjetas.forEach(([etiqueta, valor, color], i) => {
    const x = doc.page.margins.left + i * (ancho + 10);
    doc.roundedRect(x, y, ancho, 52, 6).fill(color);
    doc.fillColor('#fff').font('Helvetica-Bold').fontSize(20).text(String(valor), x + 10, y + 8, { width: ancho - 20, lineBreak: false });
    doc.font('Helvetica').fontSize(9).text(etiqueta, x + 10, y + 34, { width: ancho - 20, lineBreak: false });
  });
  doc.fillColor('#000');
  doc.x = doc.page.margins.left;
  doc.y = y + 62;
}

// Barras horizontales: etiqueta, barra proporcional al máximo y el valor.
function dibujarBarras(doc, filas, maximo) {
  const izq = doc.page.margins.left;
  const anchoEtiqueta = 150;
  const anchoMax = doc.page.width - doc.page.margins.left - doc.page.margins.right - anchoEtiqueta - 40;
  for (const fila of filas) {
    asegurarEspacio(doc, 18);
    const y = doc.y;
    doc.font('Helvetica').fontSize(9).fillColor('#1c2126')
      .text(fila.etiqueta, izq, y + 2, { width: anchoEtiqueta - 6, lineBreak: false, ellipsis: true });
    const largo = maximo ? Math.max((fila.valor / maximo) * anchoMax, fila.valor ? 2 : 0) : 0;
    doc.rect(izq + anchoEtiqueta, y, anchoMax, 12).fill('#eceef1');
    if (largo) doc.rect(izq + anchoEtiqueta, y, largo, 12).fill(fila.color);
    doc.fillColor('#1c2126').font('Helvetica-Bold')
      .text(String(fila.valor), izq + anchoEtiqueta + anchoMax + 6, y + 2, { lineBreak: false });
    doc.y = y + 16;
    if (fila.detalle) {
      doc.font('Helvetica').fontSize(7).fillColor('#5b6570').text(fila.detalle, izq + anchoEtiqueta, doc.y - 3, { lineBreak: false });
      doc.y += 8;
    }
  }
  doc.fillColor('#000');
  doc.x = izq;
}

// Dos barras por mes: creados (azul) y cerrados (verde).
function dibujarBarraDoble(doc, mes, creados, cerrados, maximo) {
  const izq = doc.page.margins.left;
  const anchoMax = doc.page.width - doc.page.margins.left - doc.page.margins.right - 110;
  asegurarEspacio(doc, 28);
  const y = doc.y;
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#1c2126').text(mes, izq, y + 4, { lineBreak: false });
  [[creados, AZUL, 0], [cerrados, '#017c15', 12]].forEach(([valor, color, dy]) => {
    const largo = Math.max((valor / maximo) * anchoMax, valor ? 2 : 0);
    if (largo) doc.rect(izq + 70, y + dy, largo, 10).fill(color);
    doc.fillColor('#1c2126').font('Helvetica').fontSize(8)
      .text(String(valor), izq + 76 + largo, y + dy + 1, { lineBreak: false });
  });
  doc.y = y + 28;
  doc.x = izq;
}

function escribirReportePdf(res, { filtros, indicadores, detalle }) {
  const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });
  doc.pipe(res);

  doc.fontSize(18).fillColor('#01497c').text('Reporte de tickets de fiscalización').fillColor('#000');
  doc.fontSize(10).font('Helvetica').text(`Generado: ${fecha(new Date())}`);

  dibujarTitulo(doc, 'Periodo y filtros');
  dibujarLinea(doc, 'Creados desde', filtros.creada_desde);
  dibujarLinea(doc, 'Creados hasta', filtros.creada_hasta);
  dibujarLinea(doc, 'Estado', filtros.estado);
  dibujarLinea(doc, 'Prioridad', filtros.prioridad);

  dibujarTitulo(doc, 'Resumen de gestión');
  dibujarTarjetas(doc, indicadores);
  dibujarTitulo(doc, 'Tickets por estado');
  dibujarBarras(doc, ESTADOS_GRAFICO.map((e) => ({
    etiqueta: e.etiqueta, valor: indicadores[e.campo], color: e.color,
  })), indicadores.total);

  dibujarTitulo(doc, 'Cumplimiento y tiempos');
  const pct = (a, b) => (b ? `${Math.round((a / b) * 100)}%` : '-');
  dibujarLinea(doc, 'Respuestas dentro del plazo', `${pct(indicadores.respuestas_en_plazo, indicadores.respuestas_con_dato)} (${indicadores.respuestas_en_plazo} de ${indicadores.respuestas_con_dato})`);
  dibujarLinea(doc, 'Tickets vencidos', pct(indicadores.vencidos, indicadores.total));
  dibujarLinea(doc, 'Tickets resueltos (conforme o cerrados)', pct(indicadores.subsanados_conforme + indicadores.cerrados, indicadores.total));
  dibujarLinea(doc, 'Tiempo promedio de respuesta', indicadores.tiempo_promedio_respuesta_dias ? `${indicadores.tiempo_promedio_respuesta_dias} días` : '-');
  dibujarLinea(doc, 'Tiempo promedio de cierre', indicadores.tiempo_promedio_cierre_dias ? `${indicadores.tiempo_promedio_cierre_dias} días` : '-');

  if (indicadores.por_mes.length) {
    dibujarTitulo(doc, 'Evolución mensual (azul: creados, verde: cerrados)');
    const maximo = Math.max(...indicadores.por_mes.map((m) => m.creados), 1);
    for (const m of indicadores.por_mes) {
      dibujarBarraDoble(doc, m.mes, m.creados, m.cerrados, maximo);
    }
  }
  for (const [titulo, filasGrafico] of [
    ['Tickets por empresa', indicadores.por_empresa],
    ['Tickets por área', indicadores.por_area],
    ['Tickets por prioridad', indicadores.por_prioridad],
  ]) {
    if (!filasGrafico.length) continue;
    dibujarTitulo(doc, titulo);
    dibujarBarras(doc, filasGrafico.map((f) => ({
      etiqueta: f.nombre, valor: f.total, color: AZUL, detalle: `${f.resueltos} resueltos, ${f.vencidos} vencidos`,
    })), Math.max(...filasGrafico.map((f) => f.total), 1));
  }

  dibujarTitulo(doc, 'Listado de tickets');
  for (const { ticket } of detalle) {
    doc.fontSize(9).font('Helvetica').text(
      `${ticket.numero} | ${ticket.empresa_nombre} | ${ticket.area_nombre} | ${ticket.estado} | ` +
      `${ticket.prioridad} | vence ${ticket.fecha_vencimiento} | cierre ${fecha(ticket.fecha_cierre)}`
    );
  }

  for (const { ticket, historial } of detalle) {
    doc.addPage();
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#01497c').text(ticket.numero).fillColor('#000');
    doc.font('Helvetica');
    dibujarLinea(doc, 'Empresa', `${ticket.empresa_nombre} (${ticket.empresa_rut})`);
    dibujarLinea(doc, 'Área', ticket.area_nombre);
    dibujarLinea(doc, 'Contrato', ticket.contrato_nombre);
    dibujarLinea(doc, 'Supervisor', ticket.supervisor_nombre);
    dibujarLinea(doc, 'Creado por', ticket.creador_nombre);
    dibujarLinea(doc, 'Prioridad', `${ticket.prioridad} (${ticket.plazo_subsanar} día(s) hábiles)`);
    dibujarLinea(doc, 'Estado', ticket.estado);
    dibujarLinea(doc, 'Fecha de creación', fecha(ticket.fecha_hora_creacion));
    dibujarLinea(doc, 'Fecha de vencimiento', ticket.fecha_vencimiento);
    dibujarLinea(doc, 'Fecha de cierre', fecha(ticket.fecha_cierre));
    dibujarLinea(doc, 'Ubicación', [ticket.direccion, ticket.sector, ticket.referencia].filter(Boolean).join(' - ') || '-');
    if (ticket.latitud !== null) dibujarLinea(doc, 'Coordenadas', `${ticket.latitud}, ${ticket.longitud}`);

    dibujarTitulo(doc, 'Observación');
    doc.fontSize(10).font('Helvetica').text(ticket.descripcion);

    dibujarTitulo(doc, 'Historial de actuaciones');
    if (historial.length === 0) doc.fontSize(10).text('Sin actuaciones registradas.');
    for (const actuacion of historial) {
      const fotos = actuacion.archivos.length ? ` (${actuacion.archivos.length} foto(s))` : '';
      const autor = actuacion.usuario_nombre || 'Sistema';
      doc.fontSize(9).font('Helvetica-Bold')
        .text(`${fecha(actuacion.fecha)} - ${ETIQUETAS_TIPO[actuacion.tipo] || actuacion.tipo}${fotos}`, { continued: false })
        .font('Helvetica').text(`Usuario: ${autor}`);
      if (actuacion.descripcion) doc.text(actuacion.descripcion);
      doc.moveDown(0.4);
    }
  }

  doc.end();
}

module.exports = { escribirReportePdf };
