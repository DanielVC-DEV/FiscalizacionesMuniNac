const router = require('express').Router();
const ctrl = require('./catalogos.controller');

router.get('/areas', ctrl.listarAreas);
router.post('/areas', ctrl.crearArea);
router.get('/roles', ctrl.listarRoles);

module.exports = router;
