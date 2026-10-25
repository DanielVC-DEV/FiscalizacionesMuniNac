// =====================================================================
// Rutas de Contratos
// =====================================================================
// Un router de Express es básicamente una tabla: "si llega esta URL con
// este verbo HTTP, ejecuta esta función del controlador". Este router
// se monta en app.js con el prefijo /api/contratos, así que la ruta
// real de, por ejemplo, router.get('/') termina siendo GET /api/contratos.
// =====================================================================

const router = require('express').Router();
const ctrl = require('./contratos.controller');
const ordenesCtrl = require('./ordenesCompra.controller');
const prioridadesCtrl = require('./prioridades.controller');

// CRUD básico de contratos
router.get('/', ctrl.listar);          // GET    /api/contratos
router.get('/:id', ctrl.obtener);      // GET    /api/contratos/5
router.post('/', ctrl.crear);          // POST   /api/contratos
router.put('/:id', ctrl.actualizar);   // PUT    /api/contratos/5
router.delete('/:id', ctrl.eliminar);  // DELETE /api/contratos/5

// Sub-recursos de un contrato
router.post('/:id/ordenes-compra', ordenesCtrl.agregarOrdenCompra); // POST /api/contratos/5/ordenes-compra

// Prioridades (requiere sql/03). Nota: esta ruta va ANTES que '/:id'
// quedaría mal interpretada si no, pero como usa un path distinto
// ('/prioridades/:idPrioridad') no hay conflicto con '/:id' de arriba.
router.patch('/prioridades/:idPrioridad', prioridadesCtrl.actualizarPrioridad); // PATCH /api/contratos/prioridades/3

module.exports = router;
