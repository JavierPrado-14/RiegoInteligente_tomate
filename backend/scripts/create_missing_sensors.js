// backend/scripts/create_missing_sensors.js
const { Client } = require('pg');
const sqlConfig = require('../config/sqlConfig');

async function createMissingSensors() {
  const client = new Client(sqlConfig);
  
  try {
    console.log('🔗 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conectado exitosamente\n');

    // Buscar parcelas que no tienen sensores
    const parcelsWithoutSensors = await client.query(`
      SELECT p.id, p.name, p.user_id
      FROM agroirrigate.parcels p
      LEFT JOIN agroirrigate.sensors s ON p.id = s.parcel_id
      WHERE s.id IS NULL
      ORDER BY p.user_id, p.id
    `);

    if (parcelsWithoutSensors.rows.length === 0) {
      console.log('✅ Todas las parcelas ya tienen sensores');
      return;
    }

    console.log(`📋 Encontradas ${parcelsWithoutSensors.rows.length} parcelas sin sensores:`);
    parcelsWithoutSensors.rows.forEach(parcel => {
      console.log(`   - Parcela ID ${parcel.id}: "${parcel.name}" (Usuario ${parcel.user_id})`);
    });

    console.log('\n🔧 Creando sensores faltantes...\n');

    let createdCount = 0;

    for (const parcel of parcelsWithoutSensors.rows) {
      // Crear sensor con estado inicial aleatorio
      const connectivityOptions = ['stable', 'medium', 'low'];
      const randomConnectivity = connectivityOptions[Math.floor(Math.random() * connectivityOptions.length)];
      const signalStrength = randomConnectivity === 'stable' ? 90 :
                            randomConnectivity === 'medium' ? 65 : 35;

      const result = await client.query(`
        INSERT INTO agroirrigate.sensors 
        (parcel_id, sensor_name, sensor_type, connectivity_status, signal_strength, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `, [
        parcel.id, 
        `Soil Moisture Sensor - ${parcel.name}`, 
        'Soil Moisture',
        randomConnectivity, 
        signalStrength,
        true
      ]);

      console.log(`✅ Sensor ID ${result.rows[0].id} creado para "${parcel.name}" - Conectividad: ${randomConnectivity}`);
      createdCount++;
    }

    console.log(`\n🎉 Se crearon ${createdCount} sensores exitosamente`);
    
    // Verificar resultado final
    const finalCheck = await client.query(`
      SELECT COUNT(*) as total_parcels,
             (SELECT COUNT(*) FROM agroirrigate.sensors WHERE is_active = true) as total_sensors
      FROM agroirrigate.parcels
    `);

    console.log('\n📊 Resumen final:');
    console.log(`   - Total de parcelas: ${finalCheck.rows[0].total_parcels}`);
    console.log(`   - Total de sensores activos: ${finalCheck.rows[0].total_sensors}`);
    
    if (finalCheck.rows[0].total_parcels == finalCheck.rows[0].total_sensors) {
      console.log('✅ ¡Perfecto! Todas las parcelas tienen sensores');
    } else {
      console.log('⚠️ Aún hay parcelas sin sensores');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
    console.log('\n🔌 Conexión cerrada');
  }
}

// Ejecutar el script
createMissingSensors()
  .then(() => {
    console.log('\n🎉 Script completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
