// backend/routes/alertRoutes.js
const express = require('express');
const router = express.Router();
const { 
  checkAndSendDryParcelAlerts,
  sendManualAlert,
  updateUserPhone,
  getUserPhone
} = require('../controllers/alertController');
const { auth } = require('../middleware/auth');

// Ruta para verificar y enviar alertas automáticas (endpoint interno)
router.post('/check-dry-parcels', checkAndSendDryParcelAlerts);

// Ruta para enviar alerta manual a una parcela específica (requiere autenticación)
router.post('/send/:parcelaId', auth, sendManualAlert);

// Ruta para actualizar número de teléfono del usuario (requiere autenticación)
router.put('/phone/:userId', auth, updateUserPhone);

// Ruta para obtener número de teléfono del usuario (requiere autenticación)
router.get('/phone/:userId', auth, getUserPhone);

module.exports = router;
