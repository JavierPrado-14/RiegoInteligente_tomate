// backend/routes/sensorRoutes.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const sensorController = require('../controllers/sensorController');

// Obtener sensores del usuario autenticado
router.get('/', auth, sensorController.getSensors);

// Actualizar conectividad de sensores (simulación en tiempo real)
router.post('/update-connectivity', auth, sensorController.updateSensorConnectivity);

// Crear sensor para una parcela
router.post('/', auth, sensorController.createSensor);

module.exports = router;

