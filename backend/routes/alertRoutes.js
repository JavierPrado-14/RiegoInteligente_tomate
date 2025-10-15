// backend/routes/alertRoutes.js
const express = require('express');
const router = express.Router();
const { 
  checkAndSendDryParcelAlerts,
  sendManualAlert,
  updateUserEmail,
  getUserEmail
} = require('../controllers/alertController');
const { auth } = require('../middleware/auth');

// Ruta para verificar y enviar alertas automáticas por correo (endpoint interno)
router.post('/check-dry-parcels', checkAndSendDryParcelAlerts);

// Ruta para enviar alerta manual a una parcela específica (requiere autenticación)
router.post('/send/:parcelaId', auth, sendManualAlert);

// Ruta para actualizar correo electrónico del usuario (requiere autenticación)
router.put('/email/:userId', auth, updateUserEmail);

// Ruta para obtener información del usuario incluyendo correo (requiere autenticación)
router.get('/email/:userId', auth, getUserEmail);

module.exports = router;
