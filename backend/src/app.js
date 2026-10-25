const express = require('express');
const cors = require('cors');

const catalogosRoutes = require('./modules/catalogos/catalogos.routes');
const empresasRoutes = require('./modules/empresas/empresas.routes');
const contratosRoutes = require('./modules/contratos/contratos.routes');
const usuariosRoutes = require('./modules/usuarios/usuarios.routes');
const ticketsRoutes = require('./modules/tickets/tickets.routes');
const errorHandler = require('./core/middlewares/errorHandler');

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
