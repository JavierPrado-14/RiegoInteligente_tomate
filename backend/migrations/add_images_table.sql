-- Migración para crear tabla de imágenes de parcelas
-- Ejecutar este script en PostgreSQL

-- Crear tabla de imágenes
CREATE TABLE IF NOT EXISTS agroirrigate.parcel_images (
  id SERIAL PRIMARY KEY,
  parcel_id INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  image_name VARCHAR(255),
  description TEXT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  file_size INTEGER,
  mime_type VARCHAR(50),
  FOREIGN KEY (parcel_id) REFERENCES agroirrigate.parcels(id) ON DELETE CASCADE
);

-- Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_parcel_images_parcel ON agroirrigate.parcel_images(parcel_id);
CREATE INDEX IF NOT EXISTS idx_parcel_images_date ON agroirrigate.parcel_images(uploaded_at DESC);

-- Agregar comentarios
COMMENT ON TABLE agroirrigate.parcel_images IS 'Imágenes asociadas a las parcelas para seguimiento visual';
COMMENT ON COLUMN agroirrigate.parcel_images.image_url IS 'Ruta o URL de la imagen almacenada';
COMMENT ON COLUMN agroirrigate.parcel_images.description IS 'Descripción o nota sobre la imagen';

