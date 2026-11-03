// Feriados cargados por el administrador. Los usan los cálculos de días hábiles.

async function cargarFeriados(client) {
  const { rows } = await client.query("SELECT to_char(fecha, 'YYYY-MM-DD') AS fecha FROM feriado");
  return new Set(rows.map((fila) => fila.fecha));
}

module.exports = { cargarFeriados };
