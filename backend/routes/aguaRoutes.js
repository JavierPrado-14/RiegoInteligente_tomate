// backend/routes/aguaRoutes.js
const express = require('express');
const { registrarUsoAgua } = require('../controllers/aguaController');
const router = express.Router();

router.post('/uso', registrarUsoAgua);

module.exports = router;


