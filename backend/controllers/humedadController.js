// backend/controllers/humedadController.js
const { Client } = require("pg");
const sqlConfig = require("../config/sqlConfig");

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
    await client.query(ensureLecturasSQL);
    // Asegurar columna opcional parcela_id para vincular con parcelas
    await client.query('ALTER TABLE agroirrigate.lecturashumedad ADD COLUMN IF NOT EXISTS parcela_id INTEGER');

    const insertSQL = `
      INSERT INTO agroirrigate.lecturashumedad (lectura, fecha, ubicacion, parcela_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id, lectura, fecha, ubicacion, parcela_id
    `;
    const values = [lectura, fecha, ubicacion, parcelaId ?? null];
    const result = await client.query(insertSQL, values);

    res.status(201).json(result.rows[0]);
    await client.end();
  } catch (err) {
    console.error('Error al registrar lectura de humedad:', err);
    res.status(500).json({ message: 'Error al registrar lectura', error: err.message });
  }
};

module.exports = { registrarLectura };


