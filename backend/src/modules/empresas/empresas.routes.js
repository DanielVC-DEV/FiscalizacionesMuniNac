const router = require('express').Router();
const ctrl = require('./empresas.controller');
const autorizar = require('../auth/autorizacion.middleware');

// Consultar empresas es sólo para usuarios municipales; crearlas y asignarles supervisor es sólo del administrador.
const soloAdmin = autorizar('admin');
const soloMunicipal = autorizar('admin', 'director');

router.get('/', soloMunicipal, ctrl.listar);
router.get('/:id', soloMunicipal, ctrl.obtener);
router.post('/', soloAdmin, ctrl.crear);
router.get('/:id/supervisores', soloMunicipal, ctrl.listarSupervisores);
router.patch('/:id/supervisor-contraparte', soloAdmin, ctrl.asignarSupervisorContraparte);

module.exports = router;
