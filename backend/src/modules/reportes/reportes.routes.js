const router = require('express').Router();
const ctrl = require('./reportes.controller');
const autorizar = require('../auth/autorizacion.middleware');

// Indicadores y reportes: sólo usuarios municipales.
const soloMunicipal = autorizar('admin', 'director');

router.get('/indicadores', soloMunicipal, ctrl.indicadores);
router.get('/pdf', soloMunicipal, ctrl.reportePdf);

module.exports = router;
