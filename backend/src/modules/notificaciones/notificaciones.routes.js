const router = require('express').Router();
const ctrl = require('./notificaciones.controller');
const autorizar = require('../auth/autorizacion.middleware');

// Toda la administración de notificaciones es sólo del administrador.
const soloAdmin = autorizar('admin');

router.get('/destinatarios', soloAdmin, ctrl.listarDestinatarios);
router.post('/destinatarios', soloAdmin, ctrl.crearDestinatario);
router.patch('/destinatarios/:id', soloAdmin, ctrl.actualizarDestinatario);
router.delete('/destinatarios/:id', soloAdmin, ctrl.eliminarDestinatario);

router.post('/mantenimiento', soloAdmin, ctrl.correrMantenimiento);

module.exports = router;
