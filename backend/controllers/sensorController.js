// backend/controllers/sensorController.js
const { Client } = require('pg');
const sqlConfig = require('../config/sqlConfig');

/**
 * Obtiene todos los sensores del usuario autenticado
 */
const getSensors = async (req, res) => {
  try {
    const client = new Client(sqlConfig);
    await client.connect();
    
    const userId = req.user.userId;
    
    // Obtener sensores de las parcelas del usuario
    const result = await client.query(`
      SELECT s.*, p.name as parcel_name, p.humidity
      FROM agroirrigate.sensors s
      INNER JOIN agroirrigate.parcels p ON s.parcel_id = p.id
      WHERE p.user_id = $1 AND s.is_active = true
      ORDER BY s.id ASC
    `, [userId]);
    
    await client.end();
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener sensores:', error);
    res.status(500).json({ 
      message: 'Error al obtener sensores',
      error: error.message 
    });
  }
};

/**
 * Simula actualización de conectividad en tiempo real
 */
const updateSensorConnectivity = async (req, res) => {
  try {
    const client = new Client(sqlConfig);
    await client.connect();
    
    const userId = req.user.userId;
    
    // Obtener sensores del usuario
    const sensorsResult = await client.query(`
      SELECT s.id, s.parcel_id, s.connectivity_status, s.signal_strength
      FROM agroirrigate.sensors s
      INNER JOIN agroirrigate.parcels p ON s.parcel_id = p.id
      WHERE p.user_id = $1 AND s.is_active = true
    `, [userId]);
    
    // Simular cambios aleatorios en la conectividad
    for (const sensor of sensorsResult.rows) {
      // 70% de probabilidad de mantener el estado, 30% de cambiar
      const shouldChange = Math.random() < 0.3;
      
      if (shouldChange) {
        const connectivityOptions = ['stable', 'medium', 'low'];
        const currentIndex = connectivityOptions.indexOf(sensor.connectivity_status);
        
        // Cambio gradual (no de stable a low directamente)
        let newStatus = sensor.connectivity_status;
        const change = Math.random() < 0.5 ? -1 : 1;
        const newIndex = Math.max(0, Math.min(2, currentIndex + change));
        newStatus = connectivityOptions[newIndex];
        
        // Calcular nueva fuerza de señal según el estado
        let newSignal = sensor.signal_strength;
        if (newStatus === 'stable') {
          newSignal = 85 + Math.floor(Math.random() * 15); // 85-100%
        } else if (newStatus === 'medium') {
          newSignal = 50 + Math.floor(Math.random() * 35); // 50-85%
        } else {
          newSignal = 20 + Math.floor(Math.random() * 30); // 20-50%
        }
        
        await client.query(`
          UPDATE agroirrigate.sensors 
          SET connectivity_status = $1, 
              signal_strength = $2,
              last_reading = CURRENT_TIMESTAMP
          WHERE id = $3
        `, [newStatus, newSignal, sensor.id]);
      }
    }
    
    // Obtener sensores actualizados
    const updatedResult = await client.query(`
      SELECT s.*, p.name as parcel_name, p.humidity
      FROM agroirrigate.sensors s
      INNER JOIN agroirrigate.parcels p ON s.parcel_id = p.id
      WHERE p.user_id = $1 AND s.is_active = true
      ORDER BY s.id ASC
    `, [userId]);
    
    await client.end();
    
    res.json(updatedResult.rows);
  } catch (error) {
    console.error('Error al actualizar conectividad de sensores:', error);
    res.status(500).json({ 
      message: 'Error al actualizar sensores',
      error: error.message 
    });
  }
};

/**
 * Crea un sensor para una parcela específica
 */
const createSensor = async (req, res) => {
  try {
    const client = new Client(sqlConfig);
    await client.connect();
    
    const { parcel_id } = req.body;
    const userId = req.user.userId;
    
    // Verificar que la parcela pertenece al usuario
    const parcelCheck = await client.query(`
      SELECT id, name FROM agroirrigate.parcels 
      WHERE id = $1 AND user_id = $2
    `, [parcel_id, userId]);
    
    if (parcelCheck.rows.length === 0) {
      await client.end();
      return res.status(403).json({ 
        message: 'No tienes permisos para crear un sensor en esta parcela' 
      });
    }
    
    const parcel = parcelCheck.rows[0];
    
    // Crear sensor con estado inicial aleatorio
    const connectivityOptions = ['stable', 'medium', 'low'];
    const randomConnectivity = connectivityOptions[Math.floor(Math.random() * connectivityOptions.length)];
    const signalStrength = randomConnectivity === 'stable' ? 90 :
                          randomConnectivity === 'medium' ? 65 : 35;
    
    const result = await client.query(`
      INSERT INTO agroirrigate.sensors 
      (parcel_id, sensor_name, connectivity_status, signal_strength)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [parcel_id, `Soil Moisture Sensor - ${parcel.name}`, randomConnectivity, signalStrength]);
    
    await client.end();
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear sensor:', error);
    res.status(500).json({ 
      message: 'Error al crear sensor',
      error: error.message 
    });
  }
};

module.exports = {
  getSensors,
  updateSensorConnectivity,
  createSensor
};

