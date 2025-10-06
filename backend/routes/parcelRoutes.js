// backend/routes/parcelRoutes.js
const express = require('express');

// Crear router usando Express directamente
const router = express.Router();

// Importar middleware y controlador
const { auth } = require('../middleware/auth');
const parcelController = require('../controllers/parcelController');

// Definir rutas
router.get('/', auth, (req, res) => {
  parcelController.getParcels(req, res);
});

router.post('/', auth, (req, res) => {
  parcelController.createParcel(req, res);
});

router.delete('/:id', auth, (req, res) => {
  parcelController.deleteParcel(req, res);
});

router.put('/:id/humidity', auth, (req, res) => {
  parcelController.updateParcelHumidity(req, res);
});

module.exports = router;