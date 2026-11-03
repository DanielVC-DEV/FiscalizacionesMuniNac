const express = require('express');
const cors = require('cors');

const catalogosRoutes = require('./modules/catalogos/catalogos.routes');
const empresasRoutes = require('./modules/empresas/empresas.routes');
const contratosRoutes = require('./modules/contratos/contratos.routes');
const usuariosRoutes = require('./modules/usuarios/usuarios.routes');
const ticketsRoutes = require('./modules/tickets/tickets.routes');
const supervisoresRoutes = require('./modules/supervisores/supervisores.routes');
const feriadosRoutes = require('./modules/feriados/feriados.routes');
const notificacionesRoutes = require('./modules/notificaciones/notificaciones.routes');
const consultaRoutes = require('./modules/consulta/consulta.routes');
const reportesRoutes = require('./modules/reportes/reportes.routes');
const authRoutes = require('./modules/auth/auth.routes');
const exigirSesion = require('./modules/auth/autenticacion.middleware');
const autorizar = require('./modules/auth/autorizacion.middleware');
const errorHandler = require('./core/middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' })); // fotos en base64 pueden pesar

app.get('/health', (req, res) => res.json({ ok: true }));

// Login es público, y también la consulta externa por enlace (sólo lectura).
// Desde aquí, todo /api exige token de sesión.
app.use('/api/auth', authRoutes);
app.get('/api/consulta/publica/:token', consultaRoutes.consultarPublica);
app.use('/api', exigirSesion);

// Gestión de cuentas y supervisores: sólo administrador (todas las operaciones).
app.use('/api/usuarios', autorizar('admin'));
app.use('/api/supervisores', autorizar('admin'));

app.use('/api', catalogosRoutes);
app.use('/api/empresas', empresasRoutes);
app.use('/api/contratos', contratosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/supervisores', supervisoresRoutes);
app.use('/api/feriados', feriadosRoutes);
app.use('/api/notificaciones', notificacionesRoutes);
app.use('/api/consulta', consultaRoutes.router);
app.use('/api/reportes', reportesRoutes);

app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
app.use(errorHandler);

module.exports = app;
