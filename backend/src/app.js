const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

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

// Detrás de un proxy inverso (HTTPS en el servidor) la IP real llega en X-Forwarded-For:
// se activa con TRUST_PROXY=1 en .env. Sin proxy se deja apagado para que no se pueda falsear.
if (process.env.TRUST_PROXY) app.set('trust proxy', Number(process.env.TRUST_PROXY) || 1);

// Cabeceras de seguridad. La política de contenido (CSP) queda desactivada porque
// el build web de Expo usa scripts en línea; el resto de las protecciones sí aplican.
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '10mb' })); // fotos en base64 pueden pesar

// Límite de intentos de login por IP para frenar adivinación de contraseñas.
const limitarLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de inicio de sesión. Intenta de nuevo en unos minutos.' },
});

app.get('/health', (req, res) => res.json({ ok: true }));

// Login es público, y también la consulta externa por enlace (sólo lectura).
// Desde aquí, todo /api exige token de sesión.
app.use('/api/auth/login', limitarLogin);
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

// Web para empresas contratistas: el build de frontend (npx expo export --platform web)
// se sirve en /empresa, en el mismo origen que la API. Si el build no existe, se omite.
const CARPETA_WEB = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(CARPETA_WEB)) {
  app.use('/empresa', express.static(CARPETA_WEB));
  app.get(/^\/empresa(\/.*)?$/, (req, res) => res.sendFile(path.join(CARPETA_WEB, 'index.html')));
}

app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
app.use(errorHandler);

module.exports = app;
