// backend/controllers/parcelController.js
const { Client } = require("pg");
const sqlConfig = require("../config/sqlConfig");

// SQL para crear el esquema y la tabla agroirrigate.parcels si no existen
const ensureParcelsTableSQL = `
  CREATE SCHEMA IF NOT EXISTS agroirrigate;
  CREATE TABLE IF NOT EXISTS agroirrigate.parcels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    user_id INTEGER NOT NULL,
    humidity INTEGER NOT NULL DEFAULT 0
  );
`;

const parcelController = {
  getParcels: async (req, res) => {
    try {
      const client = new Client(sqlConfig);
      await client.connect();
      
      // Asegurar tabla
      await client.query(ensureParcelsTableSQL);
      
      const result = await client.query(
        'SELECT * FROM agroirrigate.parcels WHERE user_id = $1 ORDER BY id ASC',
        [req.user.userId]
      );
      
      res.json(result.rows);
      await client.end();
    } catch (err) {
      console.error('Error al obtener parcelas:', err.message);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  },

  createParcel: async (req, res) => {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'El nombre de la parcela es requerido' });
    }

    try {
      const client = new Client(sqlConfig);
      await client.connect();
      
      // Asegurar tabla
      await client.query(ensureParcelsTableSQL);
      
      const result = await client.query(
        'INSERT INTO agroirrigate.parcels (name, user_id, humidity) VALUES ($1, $2, $3) RETURNING *',
        [name, req.user.userId, Math.floor(Math.random() * 50)]
      );
      
      res.status(201).json(result.rows[0]);
      await client.end();
    } catch (err) {
      console.error('Error al crear parcela:', err.message);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  },

  deleteParcel: async (req, res) => {
    const { id } = req.params;

    try {
      const client = new Client(sqlConfig);
      await client.connect();
      
      // Asegurar tabla
      await client.query(ensureParcelsTableSQL);
      
      const result = await client.query(
        'DELETE FROM agroirrigate.parcels WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, req.user.userId]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Parcela no encontrada' });
      }

      res.json({ message: 'Parcela eliminada correctamente' });
      await client.end();
    } catch (err) {
      console.error('Error al eliminar parcela:', err.message);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  },

  updateParcelHumidity: async (req, res) => {
    const { id } = req.params;
    const { humidity } = req.body;

    if (typeof humidity !== 'number' || humidity < 0 || humidity > 100) {
      return res.status(400).json({ message: 'Humedad inválida' });
    }

    try {
      const client = new Client(sqlConfig);
      await client.connect();
      
      const result = await client.query(
        'UPDATE agroirrigate.parcels SET humidity = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
        [humidity, id, req.user.userId]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Parcela no encontrada' });
      }

      res.json(result.rows[0]);
      await client.end();
    } catch (err) {
      console.error('Error al actualizar humedad:', err.message);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  }
};

module.exports = parcelController;