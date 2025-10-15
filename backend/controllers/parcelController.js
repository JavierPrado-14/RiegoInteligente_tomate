// backend/controllers/parcelController.js
const { Client } = require("pg");
const sqlConfig = require("../config/sqlConfig");
const { getGuatemalaTimeISO } = require("../utils/timeHelper");

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
      
      // Obtener el userId del token JWT (viene de req.user gracias al middleware auth)
      const userId = req.user.userId;
      
      // Filtrar parcelas solo del usuario autenticado
      const result = await client.query(
        'SELECT * FROM agroirrigate.parcels WHERE user_id = $1 ORDER BY id ASC',
        [userId]
      );
      
      // Si el usuario no tiene parcelas, devolver array vacío (no crear por defecto)
      // Los usuarios pueden crear sus propias parcelas desde el frontend
      res.json(result.rows);
      
      await client.end();
    } catch (err) {
      console.error('Error al obtener parcelas:', err.message);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  },

  createParcel: async (req, res) => {
    // Todos los usuarios autenticados pueden crear parcelas
    
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'El nombre de la parcela es requerido' });
    }

    try {
      const client = new Client(sqlConfig);
      await client.connect();
      
      // Asegurar tabla
      await client.query(ensureParcelsTableSQL);
      
      // Iniciar transacción para crear parcela y sensor
      await client.query('BEGIN');
      
      // Crear parcela
      const result = await client.query(
        'INSERT INTO agroirrigate.parcels (name, user_id, humidity) VALUES ($1, $2, $3) RETURNING *',
        [name, req.user.userId, Math.floor(Math.random() * 50)]
      );
      
      const newParcel = result.rows[0];
      console.log(`🌱 Parcela "${name}" creada con ID: ${newParcel.id} por usuario ${req.user.userId}`);
      
      // Crear sensor automáticamente para la parcela
      const connectivityOptions = ['stable', 'medium', 'low'];
      const randomConnectivity = connectivityOptions[Math.floor(Math.random() * connectivityOptions.length)];
      const signalStrength = randomConnectivity === 'stable' ? 90 :
                            randomConnectivity === 'medium' ? 65 : 35;

      const sensorResult = await client.query(`
        INSERT INTO agroirrigate.sensors 
        (parcel_id, sensor_name, connectivity_status, signal_strength)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `, [newParcel.id, `Soil Moisture Sensor - ${name}`, randomConnectivity, signalStrength]);

      console.log(`📡 Sensor ID ${sensorResult.rows[0].id} creado automáticamente para "${name}" - Conectividad: ${randomConnectivity}`);
      
      // Confirmar transacción
      await client.query('COMMIT');
      
      // Incluir información del sensor en la respuesta
      const parcelWithSensor = {
        ...newParcel,
        sensor_id: sensorResult.rows[0].id,
        sensor_name: `Soil Moisture Sensor - ${name}`,
        connectivity_status: randomConnectivity
      };
      
      res.status(201).json(parcelWithSensor);
      await client.end();
    } catch (err) {
      console.error('Error al crear parcela:', err.message);
      
      // Rollback en caso de error
      try {
        const client = new Client(sqlConfig);
        await client.connect();
        await client.query('ROLLBACK');
        await client.end();
      } catch (rollbackErr) {
        console.error('Error en rollback:', rollbackErr.message);
      }
      
      res.status(500).json({ message: 'Error en el servidor' });
    }
  },

  deleteParcel: async (req, res) => {
    // Los usuarios solo pueden eliminar sus propias parcelas
    
    const { id } = req.params;
    const userId = req.user.userId;

    try {
      const client = new Client(sqlConfig);
      await client.connect();
      
      // Asegurar tabla
      await client.query(ensureParcelsTableSQL);
      
      // Solo eliminar si la parcela pertenece al usuario
      const result = await client.query(
        'DELETE FROM agroirrigate.parcels WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, userId]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Parcela no encontrada o no tienes permisos para eliminarla' });
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
      await client.query('BEGIN'); // Iniciar transacción
      
      const result = await client.query(
        'UPDATE agroirrigate.parcels SET humidity = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
        [humidity, id, req.user.userId]
      );

      if (result.rowCount === 0) {
        await client.query('ROLLBACK'); // Revertir si la parcela no se encuentra
        await client.end();
        return res.status(404).json({ message: 'Parcela no encontrada' });
      }

      // Actualizar la última lectura del sensor asociado a esta parcela con hora de Guatemala
      const guatemalaTime = getGuatemalaTimeISO();
      await client.query(
        `UPDATE agroirrigate.sensors 
         SET last_reading = $1 
         WHERE parcel_id = $2`,
        [guatemalaTime, id]
      );

      await client.query('COMMIT'); // Confirmar transacción
      console.log(`📊 Humedad actualizada para parcela ${id}: ${humidity}% - Sensor actualizado`);
      
      res.json(result.rows[0]); // Devolver la parcela actualizada
      await client.end();
    } catch (err) {
      try {
        await client.query('ROLLBACK'); // Revertir en caso de error
        await client.end();
      } catch (rollbackErr) {
        console.error('Error en rollback:', rollbackErr.message);
      }
      console.error('Error al actualizar humedad y sensor:', err.message);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  }
};

module.exports = parcelController;