const router = require('express').Router();
const ctrl = require('./consulta.controller');
const autorizar = require('../auth/autorizacion.middleware');

// Gestión de enlaces: sólo usuarios municipales. La consulta pública está en
// consultaPublica (app.js la monta antes de exigirSesion).
const soloMunicipal = autorizar('admin', 'director');

router.get('/tickets/:id/enlaces', soloMunicipal, ctrl.listarEnlaces);
router.post('/tickets/:id/enlaces', soloMunicipal, ctrl.crearEnlace);
router.delete('/enlaces/:id', soloMunicipal, ctrl.revocarEnlace);

module.exports = { router, consultarPublica: ctrl.consultarPublica };
