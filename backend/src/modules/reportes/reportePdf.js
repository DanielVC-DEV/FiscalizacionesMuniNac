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

  dibujarTitulo(doc, 'Indicadores generales');
  const filas = [
    ['Total de tickets', indicadores.total],
    ['Abiertos', indicadores.abiertos],
    ['Respondidos / pendientes de revisión', indicadores.respondidos],
    ['Requieren nueva subsanación', indicadores.requieren_nueva_subsanacion],
    ['Vencidos', indicadores.vencidos],
    ['Subsanados conforme', indicadores.subsanados_conforme],
    ['Cerrados', indicadores.cerrados],
    ['Tiempo promedio de respuesta (días)', indicadores.tiempo_promedio_respuesta_dias ?? '-'],
    ['Tiempo promedio de cierre (días)', indicadores.tiempo_promedio_cierre_dias ?? '-'],
  ];
  for (const [etiqueta, valor] of filas) dibujarLinea(doc, etiqueta, valor);

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
