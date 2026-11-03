const router = require('express').Router();
const ctrl = require('./feriados.controller');
const autorizar = require('../auth/autorizacion.middleware');

// Consultar feriados es para usuarios municipales; cargarlos es sólo del administrador.
router.get('/', autorizar('admin', 'director'), ctrl.listar);
router.post('/', autorizar('admin'), ctrl.guardar);
router.delete('/:fecha', autorizar('admin'), ctrl.eliminar);

module.exports = router;
