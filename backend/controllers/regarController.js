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

  // Insertar la programación de riego en la base de datos (esquema agroirrigate)
  const query = `
      INSERT INTO agroirrigate.programacionriego (fecha, hora_inicio, hora_fin, parcela)
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
 
// Obtener historial de riegos con filtros opcionales
const getHistorialRiego = async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;

  // Normaliza fechas: acepta "DD/MM/YYYY" o "YYYY-MM-DD"
  const normalizeDate = (s) => {
    if (!s || typeof s !== 'string') return undefined;
    const trimmed = s.trim();
    if (!trimmed) return undefined;
    if (trimmed.includes('/')) {
      // DD/MM/YYYY -> YYYY-MM-DD
      const [dd, mm, yyyy] = trimmed.split('/');
      if (dd && mm && yyyy) {
        return `${yyyy.padStart(4,'0')}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}`;
      }
      return undefined;
    }
    // Asumir ya es YYYY-MM-DD
    return trimmed;
  };

  const start = normalizeDate(fechaInicio);
  const end = normalizeDate(fechaFin);

  try {
    const client = new Client(sqlConfig);
    await client.connect();

    const filtros = [];
    const valores = [];
    let idx = 1;

    if (start) {
      filtros.push(`fecha >= $${idx++}::date`);
      valores.push(start);
    }
    if (end) {
      filtros.push(`fecha <= $${idx++}::date`);
      valores.push(end);
    }

    const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';
    const query = `
      SELECT id, fecha, hora_inicio, hora_fin, parcela
      FROM agroirrigate.programacionriego
      ${where}
      ORDER BY fecha ASC, hora_inicio ASC
    `;

    const result = await client.query(query, valores);
    res.json(result.rows);
    client.end();
  } catch (err) {
    console.error('Error al obtener historial de riego:', err);
    res.status(500).json({ message: 'Error al obtener historial de riego', error: err.message });
  }
};

module.exports = { programarRiego, getHistorialRiego };
