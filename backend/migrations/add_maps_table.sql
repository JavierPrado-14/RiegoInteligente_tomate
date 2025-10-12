-- Migración para crear tabla de mapas de parcelas
-- Ejecutar este script en PostgreSQL

-- Crear tabla de mapas
CREATE TABLE IF NOT EXISTS agroirrigate.maps (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  map_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES agroirrigate.usuarios(id) ON DELETE CASCADE
);

-- Crear tabla de parcelas del mapa (posiciones en el diseño)
CREATE TABLE IF NOT EXISTS agroirrigate.map_parcels (
  id SERIAL PRIMARY KEY,
  map_id INTEGER NOT NULL,
  parcel_id INTEGER NOT NULL,
  position_x INTEGER NOT NULL,
  position_y INTEGER NOT NULL,
  width INTEGER DEFAULT 120,
  height INTEGER DEFAULT 80,
  FOREIGN KEY (map_id) REFERENCES agroirrigate.maps(id) ON DELETE CASCADE,
  FOREIGN KEY (parcel_id) REFERENCES agroirrigate.parcels(id) ON DELETE CASCADE,
  UNIQUE(map_id, parcel_id)
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_maps_user ON agroirrigate.maps(user_id);
CREATE INDEX IF NOT EXISTS idx_map_parcels_map ON agroirrigate.map_parcels(map_id);
CREATE INDEX IF NOT EXISTS idx_map_parcels_parcel ON agroirrigate.map_parcels(parcel_id);

-- Agregar comentarios
COMMENT ON TABLE agroirrigate.maps IS 'Mapas de diseño de parcelas creados por los usuarios';
COMMENT ON TABLE agroirrigate.map_parcels IS 'Posiciones de las parcelas en los mapas de diseño';
COMMENT ON COLUMN agroirrigate.map_parcels.position_x IS 'Posición X en el mapa (píxeles)';
COMMENT ON COLUMN agroirrigate.map_parcels.position_y IS 'Posición Y en el mapa (píxeles)';

