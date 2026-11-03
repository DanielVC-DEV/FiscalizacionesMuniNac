// Guarda las fotografías de una actuación dentro de la transacción que la crea.
// Cada foto queda como fila en "archivo", ligada a la actuación, así el
// historial conserva todas las fotos sin reemplazar las anteriores.

const { guardarImagen, MAX_IMAGENES_POR_ACTUACION } = require('../../core/utils/archivos');

function validarFotos(fotos) {
  if (fotos === undefined || fotos === null) return null;
  if (!Array.isArray(fotos) || fotos.some((f) => typeof f !== 'string')) {
    return 'Las fotos deben enviarse como una lista de imágenes en base64';
  }
  if (fotos.length > MAX_IMAGENES_POR_ACTUACION) {
    return `Se pueden adjuntar hasta ${MAX_IMAGENES_POR_ACTUACION} fotos por actuación`;
  }
  return null;
}

/**
 * Guarda las fotos en disco y en la tabla "archivo". Devuelve las rutas
 * guardadas, para poder borrarlas si la transacción falla.
 */
async function registrarFotos(client, { idTicket, idActuacion, idUsuario, fotos }) {
  const guardadas = [];
  for (const dataUrl of fotos || []) {
    const { ruta, tipo_mime } = await guardarImagen(idTicket, dataUrl);
    guardadas.push(ruta);
    await client.query(
      `INSERT INTO archivo (id_ticket, id_actuacion, id_usuario, ruta, tipo_mime)
       VALUES ($1, $2, $3, $4, $5)`,
      [idTicket, idActuacion, idUsuario, ruta, tipo_mime]
    );
  }
  return guardadas;
}

module.exports = { validarFotos, registrarFotos };
