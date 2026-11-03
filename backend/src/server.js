require('dotenv').config();
const app = require('./app');
const pool = require('./core/config/db');
const { iniciarMantenimiento } = require('./modules/notificaciones/mantenimiento');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Backend escuchando en http://localhost:${PORT}`);
  iniciarMantenimiento(pool);
});
