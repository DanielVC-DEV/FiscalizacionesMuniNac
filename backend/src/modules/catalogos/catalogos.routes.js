const router = require('express').Router();
const ctrl = require('./catalogos.controller');
const autorizar = require('../auth/autorizacion.middleware');

router.get('/areas', ctrl.listarAreas);
router.post('/areas', autorizar('admin'), ctrl.crearArea);
router.get('/roles', ctrl.listarRoles);

module.exports = router;
