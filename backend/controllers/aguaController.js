// backend/controllers/aguaController.js
const { Client } = require("pg");
const sqlConfig = require("../config/sqlConfig");

const ensureUsoAguaSQL = `
  CREATE SCHEMA IF NOT EXISTS agroirrigate;
  CREATE TABLE IF NOT EXISTS agroirrigate.uso_agua (
    id SERIAL PRIMARY KEY,
    parcela_id INTEGER NOT NULL,
    parcela_nombre VARCHAR(255) NOT NULL,
    litros NUMERIC(10,2) NOT NULL,
    fecha TIMESTAMP WITHOUT TIME ZONE NOT NULL
  );
`;

const registrarUsoAgua = async (req, res) => {
  const { parcelaId, parcelaNombre, litros, fecha } = req.body;

  if (!parcelaId || !parcelaNombre || typeof litros !== 'number' || litros <= 0) {
    return res.status(400).json({ message: 'Datos inválidos' });
  }
  const fechaVal = fecha || new Date().toISOString();

  try {
    const client = new Client(sqlConfig);
    await client.connect();
    await client.query(ensureUsoAguaSQL);

    const insertSQL = `
      INSERT INTO agroirrigate.uso_agua (parcela_id, parcela_nombre, litros, fecha)
      VALUES ($1, $2, $3, $4)
      RETURNING id, parcela_id, parcela_nombre, litros, fecha
    `;
    const values = [parcelaId, parcelaNombre, litros, fechaVal];
    const result = await client.query(insertSQL, values);
    res.status(201).json(result.rows[0]);
    await client.end();
  } catch (err) {
    console.error('Error al registrar uso de agua:', err);
    res.status(500).json({ message: 'Error al registrar uso de agua', error: err.message });
  }
};

module.exports = { registrarUsoAgua };


