// Almacenamiento de archivos (fotografías) en disco, dentro de backend/uploads.
// En la base sólo se guarda la ruta relativa a esa carpeta (tabla "archivo").

const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..', '..', '..', 'uploads');

const TIPOS_IMAGEN = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const MAX_IMAGENES_POR_ACTUACION = 10;

// Acepta sólo imágenes en data URL base64 (lo que envía la app al adjuntar fotos).
function leerDataUrl(valor) {
  const coincidencia = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(valor || '');
  if (!coincidencia) return null;
  return { tipoMime: coincidencia[1], buffer: Buffer.from(coincidencia[2], 'base64') };
}

// Guarda una imagen del ticket y devuelve { ruta, tipo_mime }.
async function guardarImagen(idTicket, dataUrl) {
  const imagen = leerDataUrl(dataUrl);
  if (!imagen) {
    const err = new Error('Formato de foto no válido: se aceptan JPEG, PNG o WEBP en base64.');
    err.status = 400;
    throw err;
  }

  const carpeta = path.join('tickets', String(idTicket));
  await fs.mkdir(path.join(RAIZ, carpeta), { recursive: true });

  const nombre = `${crypto.randomUUID()}.${TIPOS_IMAGEN[imagen.tipoMime]}`;
  const ruta = path.join(carpeta, nombre).replace(/\\/g, '/');
  await fs.writeFile(path.join(RAIZ, ruta), imagen.buffer);

  return { ruta, tipo_mime: imagen.tipoMime };
}

async function borrarArchivo(ruta) {
  await fs.rm(path.join(RAIZ, ruta), { force: true });
}

// Ruta absoluta de un archivo guardado. Rechaza rutas que salgan de uploads/.
function rutaAbsoluta(ruta) {
  const absoluta = path.resolve(RAIZ, ruta);
  if (!absoluta.startsWith(RAIZ + path.sep)) return null;
  return absoluta;
}

module.exports = {
  guardarImagen,
  borrarArchivo,
  rutaAbsoluta,
  MAX_IMAGENES_POR_ACTUACION,
};
