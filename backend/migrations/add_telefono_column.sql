-- Migración para agregar columna de teléfono a la tabla usuarios
-- Ejecutar este script en PostgreSQL

-- Agregar columna de teléfono a la tabla usuarios
ALTER TABLE AgroIrrigate.Usuarios 
ADD COLUMN telefono VARCHAR(15);

-- Agregar comentario a la columna
COMMENT ON COLUMN AgroIrrigate.Usuarios.telefono IS 'Número de teléfono para alertas SMS';

-- Crear índice para búsquedas rápidas
CREATE INDEX idx_usuarios_telefono ON AgroIrrigate.Usuarios(telefono) WHERE telefono IS NOT NULL;

-- Insertar algunos números de ejemplo para testing (opcional)
-- UPDATE AgroIrrigate.Usuarios SET telefono = '+1234567890' WHERE id = 1;
-- UPDATE AgroIrrigate.Usuarios SET telefono = '+0987654321' WHERE id = 2;
