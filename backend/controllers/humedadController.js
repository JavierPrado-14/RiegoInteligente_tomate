// backend/controllers/humedadController.js
const { Client } = require("pg");
const sqlConfig = require("../config/sqlConfig");
const { getGuatemalaTimeISO } = require("../utils/timeHelper");

// Crea esquema/tabla si no existen
const ensureLecturasSQL = `
  CREATE SCHEMA IF NOT EXISTS agroirrigate;
  CREATE TABLE IF NOT EXISTS agroirrigate.lecturashumedad (
    id SERIAL PRIMARY KEY,
    lectura INTEGER NOT NULL,
    fecha TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    ubicacion VARCHAR(100) NOT NULL
  );
`;

const registrarLectura = async (req, res) => {
  const { lectura, fecha, ubicacion, parcelaId } = req.body;

  if (typeof lectura !== 'number' || lectura < 0 || lectura > 100) {
    return res.status(400).json({ message: 'Lectura inválida (0-100)' });
  }
  if (!fecha || !ubicacion) {
    return res.status(400).json({ message: 'Fecha y ubicación son requeridas' });
  }

  try {
    const client = new Client(sqlConfig);
    await client.connect();
    await client.query('BEGIN'); // Iniciar transacción
    
    await client.query(ensureLecturasSQL);
    // Asegurar columna opcional parcela_id para vincular con parcelas
    await client.query('ALTER TABLE agroirrigate.lecturashumedad ADD COLUMN IF NOT EXISTS parcela_id INTEGER');

    // Usar la hora de Guatemala para la fecha
    const guatemalaTime = getGuatemalaTimeISO();
    
    const insertSQL = `
      INSERT INTO agroirrigate.lecturashumedad (lectura, fecha, ubicacion, parcela_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id, lectura, fecha, ubicacion, parcela_id
    `;
    const values = [lectura, guatemalaTime, ubicacion, parcelaId ?? null];
    const result = await client.query(insertSQL, values);

    // Si hay parcelaId, también actualizar el sensor asociado y la humedad de la parcela
    if (parcelaId) {
      // Actualizar sensor
      await client.query(
        `UPDATE agroirrigate.sensors 
         SET last_reading = $1
         WHERE parcel_id = $2`,
        [guatemalaTime, parcelaId]
      );
      console.log(`📊 Sensor actualizado para parcela ${parcelaId} con hora de Guatemala: ${guatemalaTime}`);
      
      // Actualizar humedad en la parcela
      await client.query(
        `UPDATE agroirrigate.parcels 
         SET humidity = $1
         WHERE id = $2`,
        [lectura, parcelaId]
      );
      console.log(`💧 Humedad actualizada en parcela ${parcelaId}: ${lectura}%`);
    }

    await client.query('COMMIT'); // Confirmar transacción
    res.status(201).json(result.rows[0]);
    await client.end();
  } catch (err) {
    try {
      await client.query('ROLLBACK'); // Revertir en caso de error
      await client.end();
    } catch (rollbackErr) {
      console.error('Error en rollback:', rollbackErr.message);
    }
    console.error('Error al registrar lectura de humedad:', err);
    res.status(500).json({ message: 'Error al registrar lectura', error: err.message });
  }
};

module.exports = { registrarLectura };


