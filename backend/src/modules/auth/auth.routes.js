const router = require('express').Router();
const ctrl = require('./auth.controller');
const exigirSesion = require('./autenticacion.middleware');

router.post('/login', ctrl.login);
router.post('/logout', exigirSesion, ctrl.logout);

module.exports = router;
