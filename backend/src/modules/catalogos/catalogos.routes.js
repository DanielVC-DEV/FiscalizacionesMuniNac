const router = require('express').Router();
const ctrl = require('./catalogos.controller');
const autorizar = require('../auth/autorizacion.middleware');

// Los catálogos son para usuarios municipales: la empresa no necesita áreas ni roles.
const soloMunicipal = autorizar('admin', 'director');

router.get('/areas', soloMunicipal, ctrl.listarAreas);
router.post('/areas', autorizar('admin'), ctrl.crearArea);
router.get('/roles', soloMunicipal, ctrl.listarRoles);

module.exports = router;
