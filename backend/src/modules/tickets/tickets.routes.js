const router = require('express').Router();
const ctrl = require('./tickets.controller');
const respuestasCtrl = require('./respuestas.controller');
const archivosCtrl = require('./archivos.controller');
const autorizar = require('../auth/autorizacion.middleware');

// Crear y gestionar la fiscalización (estados, conformidad, cierre, reapertura)
// es sólo de usuarios municipales. El supervisor de empresa consulta y responde
// dentro de su alcance (ver ticketAcceso.js).
const soloMunicipal = autorizar('admin', 'director');

router.get('/', ctrl.listar);
router.post('/', soloMunicipal, ctrl.crear);

router.get('/archivos/:idArchivo', archivosCtrl.descargar);

router.get('/:id', ctrl.obtener);
router.patch('/:id/estado', soloMunicipal, ctrl.cambiarEstado);
router.post('/:id/solicitar-subsanacion', soloMunicipal, ctrl.solicitarSubsanacion);
router.post('/:id/conformidad', soloMunicipal, ctrl.darConformidad);
router.post('/:id/cerrar', soloMunicipal, ctrl.cerrar);
router.post('/:id/reabrir', soloMunicipal, ctrl.reabrir);

router.get('/:idTicket/respuestas', respuestasCtrl.listarPorTicket);
router.post('/:idTicket/respuestas', respuestasCtrl.crear);

module.exports = router;
