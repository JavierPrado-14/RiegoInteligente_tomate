// backend/routes/mapRoutes.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const mapController = require('../controllers/mapController');

// Guardar un mapa de diseño con parcelas
router.post('/', auth, mapController.saveMap);

// Obtener todos los mapas del usuario
router.get('/', auth, mapController.getMaps);

// Obtener un mapa específico con sus parcelas
router.get('/:id', auth, mapController.getMapById);

// Actualizar un mapa existente
router.put('/:id', auth, mapController.updateMap);

// Eliminar un mapa
router.delete('/:id', auth, mapController.deleteMap);

module.exports = router;

