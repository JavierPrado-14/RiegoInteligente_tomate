// backend/controllers/regarController.js
const { Client } = require("pg");
const sqlConfig = require("../config/sqlConfig"); // Configuración de PostgreSQL

// Función para programar un riego
const programarRiego = async (req, res) => {
  const { fecha, horaInicio, horaFin, parcela } = req.body;

  try {
    // Conectar a PostgreSQL
    const client = new Client(sqlConfig);
    await client.connect();

    // Insertar la programación de riego en la base de datos
    const query = `
      INSERT INTO AgroIrrigate.ProgramacionRiego (fecha, hora_inicio, hora_fin, parcela)
      VALUES ($1, $2, $3, $4)
    `;
    const values = [fecha, horaInicio, horaFin, parcela];

    await client.query(query, values);

    // Responder con éxito
    res.status(201).json({ message: "Riego programado con éxito" });

    client.end();
  } catch (err) {
    console.error("Error al programar el riego:", err);
    res.status(500).json({ message: "Error al programar el riego", error: err.message });
  }
};

module.exports = { programarRiego };
