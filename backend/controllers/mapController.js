// backend/controllers/mapController.js
const { Client } = require('pg');
const sqlConfig = require('../config/sqlConfig');

/**
 * Guardar un mapa de diseño con sus parcelas
 */
const saveMap = async (req, res) => {
  const { mapName, parcels } = req.body;
  const userId = req.user.userId;

  if (!mapName || !parcels || parcels.length === 0) {
    return res.status(400).json({ 
      message: 'Nombre del mapa y parcelas son requeridos' 
    });
  }

  const client = new Client(sqlConfig);
  
  try {
    await client.connect();
    await client.query('BEGIN');

    // 1. Crear o actualizar el mapa
    const mapResult = await client.query(`
      INSERT INTO agroirrigate.maps (user_id, map_name)
      VALUES ($1, $2)
      RETURNING id, map_name
    `, [userId, mapName]);

    const mapId = mapResult.rows[0].id;
    console.log(`📍 Mapa "${mapName}" creado con ID: ${mapId}`);

    // 2. Crear las parcelas en la base de datos y guardar sus posiciones
    const createdParcels = [];
    
    for (const parcel of parcels) {
      // Crear la parcela en la tabla parcels
      const parcelResult = await client.query(`
        INSERT INTO agroirrigate.parcels (name, user_id, humidity)
        VALUES ($1, $2, $3)
        RETURNING id, name, humidity
      `, [parcel.name, userId, parcel.humidity || 50]);

      const newParcel = parcelResult.rows[0];
      console.log(`🌱 Parcela "${parcel.name}" creada con ID: ${newParcel.id}`);

      // Guardar la posición de la parcela en el mapa
      await client.query(`
        INSERT INTO agroirrigate.map_parcels 
        (map_id, parcel_id, position_x, position_y, width, height)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [mapId, newParcel.id, parcel.x, parcel.y, parcel.width, parcel.height]);

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
      `, [newParcel.id, `Soil Moisture Sensor - ${parcel.name}`, randomConnectivity, signalStrength]);

      console.log(`📡 Sensor creado para "${parcel.name}" - Conectividad: ${randomConnectivity}`);

      createdParcels.push({
        ...newParcel,
        sensor_id: sensorResult.rows[0].id,
        position: { x: parcel.x, y: parcel.y },
        dimensions: { width: parcel.width, height: parcel.height }
      });
    }

    await client.query('COMMIT');
    await client.end();

    console.log(`✅ Mapa guardado con ${createdParcels.length} parcelas y sensores`);

    res.status(201).json({
      message: 'Mapa guardado exitosamente',
      map: {
        id: mapId,
        name: mapName,
        parcels: createdParcels
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    await client.end();
    console.error('Error al guardar mapa:', error);
    res.status(500).json({ 
      message: 'Error al guardar mapa',
      error: error.message 
    });
  }
};

/**
 * Obtener mapas del usuario
 */
const getMaps = async (req, res) => {
  const userId = req.user.userId;
  const client = new Client(sqlConfig);
  
  try {
    await client.connect();

    const result = await client.query(`
      SELECT id, map_name, created_at, updated_at
      FROM agroirrigate.maps
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [userId]);

    await client.end();
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener mapas:', error);
    res.status(500).json({ 
      message: 'Error al obtener mapas',
      error: error.message 
    });
  }
};

/**
 * Obtener un mapa específico con sus parcelas
 */
const getMapById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const client = new Client(sqlConfig);
  
  try {
    await client.connect();

    // Obtener información del mapa
    const mapResult = await client.query(`
      SELECT id, map_name, created_at, updated_at
      FROM agroirrigate.maps
      WHERE id = $1 AND user_id = $2
    `, [id, userId]);

    if (mapResult.rows.length === 0) {
      await client.end();
      return res.status(404).json({ message: 'Mapa no encontrado' });
    }

    const map = mapResult.rows[0];

    // Obtener parcelas del mapa con sus posiciones
    const parcelsResult = await client.query(`
      SELECT 
        p.id, p.name, p.humidity,
        mp.position_x, mp.position_y, mp.width, mp.height,
        s.id as sensor_id, s.sensor_name, s.connectivity_status, s.signal_strength
      FROM agroirrigate.map_parcels mp
      INNER JOIN agroirrigate.parcels p ON mp.parcel_id = p.id
      LEFT JOIN agroirrigate.sensors s ON s.parcel_id = p.id AND s.is_active = true
      WHERE mp.map_id = $1
      ORDER BY mp.id
    `, [id]);

    await client.end();

    res.json({
      ...map,
      parcels: parcelsResult.rows.map(p => ({
        id: p.id,
        name: p.name,
        humidity: p.humidity,
        x: p.position_x,
        y: p.position_y,
        width: p.width,
        height: p.height,
        sensor: p.sensor_id ? {
          id: p.sensor_id,
          name: p.sensor_name,
          connectivity: p.connectivity_status,
          signal: p.signal_strength
        } : null
      }))
    });
  } catch (error) {
    console.error('Error al obtener mapa:', error);
    res.status(500).json({ 
      message: 'Error al obtener mapa',
      error: error.message 
    });
  }
};

/**
 * Eliminar un mapa y sus parcelas asociadas
 */
const deleteMap = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const client = new Client(sqlConfig);
  
  try {
    await client.connect();
    await client.query('BEGIN');

    // 1. Obtener información del mapa para verificar permisos
    const mapResult = await client.query(`
      SELECT id, map_name
      FROM agroirrigate.maps
      WHERE id = $1 AND user_id = $2
    `, [id, userId]);

    if (mapResult.rows.length === 0) {
      await client.query('ROLLBACK');
      await client.end();
      return res.status(404).json({ 
        message: 'Mapa no encontrado o no tienes permisos' 
      });
    }

    const mapName = mapResult.rows[0].map_name;

    // 2. Obtener todas las parcelas asociadas al mapa
    const parcelsResult = await client.query(`
      SELECT p.id, p.name
      FROM agroirrigate.map_parcels mp
      INNER JOIN agroirrigate.parcels p ON mp.parcel_id = p.id
      WHERE mp.map_id = $1
    `, [id]);

    const parcelsToDelete = parcelsResult.rows;
    console.log(`🗑️ Eliminando mapa "${mapName}" (ID: ${id}) con ${parcelsToDelete.length} parcelas asociadas`);
    console.log(`📋 Parcelas a eliminar:`, parcelsToDelete.map(p => `${p.name} (ID: ${p.id})`));

    // 3. Eliminar sensores asociados a las parcelas del mapa
    for (const parcel of parcelsToDelete) {
      await client.query(`
        DELETE FROM agroirrigate.sensors 
        WHERE parcel_id = $1
      `, [parcel.id]);
      console.log(`📡 Sensor eliminado para parcela "${parcel.name}" (ID: ${parcel.id})`);
    }

    // 4. Eliminar las parcelas asociadas al mapa
    for (const parcel of parcelsToDelete) {
      await client.query(`
        DELETE FROM agroirrigate.parcels 
        WHERE id = $1
      `, [parcel.id]);
      console.log(`🌱 Parcela "${parcel.name}" (ID: ${parcel.id}) eliminada`);
    }

    // 5. Eliminar las relaciones del mapa (esto se hace automáticamente por CASCADE, pero por seguridad)
    await client.query(`
      DELETE FROM agroirrigate.map_parcels 
      WHERE map_id = $1
    `, [id]);

    // 6. Eliminar el mapa
    await client.query(`
      DELETE FROM agroirrigate.maps
      WHERE id = $1
    `, [id]);

    await client.query('COMMIT');
    await client.end();

    console.log(`✅ Mapa "${mapName}" y ${parcelsToDelete.length} parcelas eliminadas exitosamente`);

    res.json({ 
      message: `Mapa "${mapName}" y ${parcelsToDelete.length} parcelas eliminadas exitosamente`,
      deletedParcels: parcelsToDelete.length
    });
  } catch (error) {
    console.error('❌ Error al eliminar mapa:', error);
    console.error('❌ Stack trace:', error.stack);
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('❌ Error en rollback:', rollbackError);
    }
    await client.end();
    res.status(500).json({ 
      message: 'Error al eliminar mapa',
      error: error.message 
    });
  }
};

module.exports = {
  saveMap,
  getMaps,
  getMapById,
  deleteMap
};

