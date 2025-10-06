// backend/routes/humedadRoutes.js
const express = require('express');
const { registrarLectura } = require('../controllers/humedadController');
const router = express.Router();

// Registrar lectura de humedad
router.post('/lecturas', registrarLectura);

module.exports = router;


