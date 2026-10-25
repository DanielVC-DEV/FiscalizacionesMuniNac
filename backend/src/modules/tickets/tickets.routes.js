const router = require('express').Router();
const ctrl = require('./tickets.controller');
const respuestasCtrl = require('./respuestas.controller');

router.get('/', ctrl.listar);
router.get('/:id', ctrl.obtener);
router.post('/', ctrl.crear);
router.patch('/:id/estado', ctrl.cambiarEstado);

// Requieren sql/03 (tabla respuesta)
router.get('/:idTicket/respuestas', respuestasCtrl.listarPorTicket);
router.post('/:idTicket/respuestas', respuestasCtrl.crear);

module.exports = router;
