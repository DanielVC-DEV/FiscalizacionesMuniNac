module.exports = function errorHandler(err, req, res, next) {
  console.error(err);

  // Errores típicos de restricciones de PostgreSQL, traducidos a algo legible.
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Ya existe un registro con ese valor único.' });
  }
  if (err.code === '23503') {
    return res.status(400).json({ error: 'Referencia inválida: el id indicado no existe.' });
  }
  if (err.code === '23514') {
    return res.status(400).json({ error: 'Valor no permitido para uno de los campos (restricción CHECK).' });
  }

  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Error interno del servidor' });
};
