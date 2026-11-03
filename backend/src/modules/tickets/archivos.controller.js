// Descarga de fotografías y antecedentes. Respeta el alcance del ticket:
// si el usuario no puede ver el ticket, el archivo responde como inexistente.

const pool = require('../../core/config/db');
const { rutaAbsoluta } = require('../../core/utils/archivos');
const { esIdValido } = require('../../core/utils/validaciones');
const { puedeVerTicket } = require('./ticketAcceso');

async function descargar(req, res, next) {
  if (!esIdValido(req.params.idArchivo)) return res.status(400).json({ error: 'ID de archivo inválido' });
  try {
    const { rows } = await pool.query(
      `SELECT a.ruta, a.tipo_mime, t.id_empresa
       FROM archivo a JOIN ticket t ON t.id_ticket = a.id_ticket
       WHERE a.id_archivo = $1`,
      [req.params.idArchivo]
    );
    const archivo = rows[0];
    if (!archivo || !puedeVerTicket(req.usuario, archivo)) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    const absoluta = rutaAbsoluta(archivo.ruta);
    if (!absoluta) return res.status(404).json({ error: 'Archivo no encontrado' });

    res.type(archivo.tipo_mime);
    res.sendFile(absoluta, (err) => {
      if (err && !res.headersSent) next(err);
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { descargar };
