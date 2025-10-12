// backend/controllers/imageController.js
const { Client } = require('pg');
const sqlConfig = require('../config/sqlConfig');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de multer para almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads', 'parcels');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'parcel-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtro para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (JPEG, PNG, GIF, WEBP)'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Límite de 5MB
});

/**
 * Subir imagen para una parcela
 */
const uploadParcelImage = async (req, res) => {
  const { parcelId } = req.params;
  const { description } = req.body;
  const userId = req.user.userId;
  
  if (!req.file) {
    return res.status(400).json({ message: 'No se proporcionó ninguna imagen' });
  }

  const client = new Client(sqlConfig);
  
  try {
    await client.connect();

    // Verificar que la parcela pertenece al usuario
    const parcelCheck = await client.query(`
      SELECT id, name FROM agroirrigate.parcels 
      WHERE id = $1 AND user_id = $2
    `, [parcelId, userId]);

    if (parcelCheck.rows.length === 0) {
      // Eliminar el archivo subido si la parcela no pertenece al usuario
      fs.unlinkSync(req.file.path);
      await client.end();
      return res.status(403).json({ 
        message: 'No tienes permisos para subir imágenes a esta parcela' 
      });
    }

    // Guardar información de la imagen en la base de datos
    const imageUrl = `/uploads/parcels/${req.file.filename}`;
    
    const result = await client.query(`
      INSERT INTO agroirrigate.parcel_images 
      (parcel_id, image_url, image_name, description, file_size, mime_type)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      parcelId, 
      imageUrl, 
      req.file.originalname, 
      description || null,
      req.file.size,
      req.file.mimetype
    ]);

    await client.end();

    console.log(`📷 Imagen subida para parcela ${parcelId}: ${req.file.filename}`);

    res.status(201).json({
      message: 'Imagen subida exitosamente',
      image: result.rows[0]
    });

  } catch (error) {
    // En caso de error, eliminar el archivo subido
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Error al subir imagen:', error);
    res.status(500).json({ 
      message: 'Error al subir imagen',
      error: error.message 
    });
  }
};

/**
 * Obtener todas las imágenes de una parcela
 */
const getParcelImages = async (req, res) => {
  const { parcelId } = req.params;
  const userId = req.user.userId;
  const client = new Client(sqlConfig);
  
  try {
    await client.connect();

    // Verificar que la parcela pertenece al usuario
    const parcelCheck = await client.query(`
      SELECT id, name FROM agroirrigate.parcels 
      WHERE id = $1 AND user_id = $2
    `, [parcelId, userId]);

    if (parcelCheck.rows.length === 0) {
      await client.end();
      return res.status(403).json({ 
        message: 'No tienes permisos para ver imágenes de esta parcela' 
      });
    }

    // Obtener todas las imágenes de la parcela
    const result = await client.query(`
      SELECT id, image_url, image_name, description, uploaded_at, file_size, mime_type
      FROM agroirrigate.parcel_images
      WHERE parcel_id = $1
      ORDER BY uploaded_at DESC
    `, [parcelId]);

    await client.end();

    res.json({
      parcel: parcelCheck.rows[0],
      images: result.rows
    });

  } catch (error) {
    console.error('Error al obtener imágenes:', error);
    res.status(500).json({ 
      message: 'Error al obtener imágenes',
      error: error.message 
    });
  }
};

/**
 * Eliminar una imagen
 */
const deleteParcelImage = async (req, res) => {
  const { imageId } = req.params;
  const userId = req.user.userId;
  const client = new Client(sqlConfig);
  
  try {
    await client.connect();

    // Obtener información de la imagen y verificar permisos
    const imageResult = await client.query(`
      SELECT pi.*, p.user_id
      FROM agroirrigate.parcel_images pi
      INNER JOIN agroirrigate.parcels p ON pi.parcel_id = p.id
      WHERE pi.id = $1
    `, [imageId]);

    if (imageResult.rows.length === 0) {
      await client.end();
      return res.status(404).json({ message: 'Imagen no encontrada' });
    }

    const image = imageResult.rows[0];

    if (image.user_id !== userId) {
      await client.end();
      return res.status(403).json({ 
        message: 'No tienes permisos para eliminar esta imagen' 
      });
    }

    // Eliminar de la base de datos
    await client.query(`
      DELETE FROM agroirrigate.parcel_images
      WHERE id = $1
    `, [imageId]);

    await client.end();

    // Eliminar archivo físico
    const filePath = path.join(__dirname, '..', image.image_url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Archivo eliminado: ${image.image_url}`);
    }

    res.json({ message: 'Imagen eliminada exitosamente' });

  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    res.status(500).json({ 
      message: 'Error al eliminar imagen',
      error: error.message 
    });
  }
};

module.exports = {
  upload,
  uploadParcelImage,
  getParcelImages,
  deleteParcelImage
};

