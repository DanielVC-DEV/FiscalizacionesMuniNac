// Ejecuta una función dentro de una transacción de PostgreSQL. Si la función
// lanza un error, se revierte todo; si termina bien, se confirma.
//
// La función recibe la conexión (client) que debe usar para sus consultas.

async function enTransaccion(pool, funcion) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const resultado = await funcion(client);
    await client.query('COMMIT');
    return resultado;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { enTransaccion };
