// backend/routes/aguaRoutes.js
const express = require('express');
const { registrarUsoAgua, getConsumoAgua } = require('../controllers/aguaController');
const router = express.Router();

router.post('/uso', registrarUsoAgua);
router.get('/consumo', getConsumoAgua);

module.exports = router;


