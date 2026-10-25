const router = require('express').Router();
const ctrl = require('./usuarios.controller');

router.get('/', ctrl.listar);
router.post('/', ctrl.crear);

module.exports = router;
