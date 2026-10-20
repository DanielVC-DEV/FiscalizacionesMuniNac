const express = require('express');
const cors = require('cors');

const catalogosRoutes = require('./routes/catalogos.routes');
const empresasRoutes = require('./routes/empresas.routes');
const contratosRoutes = require('./routes/contratos.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const ticketsRoutes = require('./routes/tickets.routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' })); // fotos en base64 pueden pesar

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api', catalogosRoutes);
app.use('/api/empresas', empresasRoutes);
app.use('/api/contratos', contratosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/tickets', ticketsRoutes);

app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
app.use(errorHandler);

module.exports = app;
