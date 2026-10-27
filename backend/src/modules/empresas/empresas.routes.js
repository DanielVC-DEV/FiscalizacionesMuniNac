const router = require('express').Router();
const ctrl = require('./empresas.controller');
const autorizar = require('../auth/autorizacion.middleware');

// Consultar empresas es para todos los roles; crearlas y asignarles supervisor es sólo del administrador.
const soloAdmin = autorizar('admin');

router.get('/', ctrl.listar);
router.get('/:id', ctrl.obtener);
router.post('/', soloAdmin, ctrl.crear);
router.get('/:id/supervisores', ctrl.listarSupervisores);
router.patch('/:id/supervisor-contraparte', soloAdmin, ctrl.asignarSupervisorContraparte);

module.exports = router;
