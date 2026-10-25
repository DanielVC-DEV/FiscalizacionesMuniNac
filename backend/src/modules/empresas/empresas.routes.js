const router = require('express').Router();
const ctrl = require('./empresas.controller');

router.get('/', ctrl.listar);
router.get('/:id', ctrl.obtener);
router.post('/', ctrl.crear);
router.get('/:id/supervisores', ctrl.listarSupervisores);
router.patch('/:id/supervisor-contraparte', ctrl.asignarSupervisorContraparte);

module.exports = router;
