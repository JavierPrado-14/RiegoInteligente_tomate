// backend/routes/imageRoutes.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const imageController = require('../controllers/imageController');

// Subir imagen para una parcela
router.post('/upload/:parcelId', auth, imageController.upload.single('image'), imageController.uploadParcelImage);

// Obtener imágenes de una parcela
router.get('/parcel/:parcelId', auth, imageController.getParcelImages);

// Eliminar una imagen
router.delete('/:imageId', auth, imageController.deleteParcelImage);

module.exports = router;

