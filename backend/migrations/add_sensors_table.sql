-- Migración para crear tabla de sensores
-- Ejecutar este script en PostgreSQL

-- Crear tabla de sensores
CREATE TABLE IF NOT EXISTS agroirrigate.sensors (
  id SERIAL PRIMARY KEY,
  parcel_id INTEGER NOT NULL,
  sensor_name VARCHAR(100) NOT NULL DEFAULT 'Soil Moisture Sensor',
  sensor_type VARCHAR(50) NOT NULL DEFAULT 'humidity',
  connectivity_status VARCHAR(20) NOT NULL DEFAULT 'stable', -- stable, medium, low
  signal_strength INTEGER DEFAULT 100, -- 0-100
  last_reading TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  FOREIGN KEY (parcel_id) REFERENCES agroirrigate.parcels(id) ON DELETE CASCADE
);

-- Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_sensors_parcel ON agroirrigate.sensors(parcel_id);
CREATE INDEX IF NOT EXISTS idx_sensors_status ON agroirrigate.sensors(connectivity_status);
CREATE INDEX IF NOT EXISTS idx_sensors_active ON agroirrigate.sensors(is_active);

-- Agregar comentarios
COMMENT ON TABLE agroirrigate.sensors IS 'Sensores de humedad del suelo para las parcelas';
COMMENT ON COLUMN agroirrigate.sensors.connectivity_status IS 'Estado de conectividad: stable, medium, low';
COMMENT ON COLUMN agroirrigate.sensors.signal_strength IS 'Fuerza de señal del sensor (0-100)';

