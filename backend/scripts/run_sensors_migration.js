// backend/scripts/run_sensors_migration.js
const { Client } = require('pg');
const sqlConfig = require('../config/sqlConfig');
const fs = require('fs');
const path = require('path');

async function runSensorsMigration() {
  const client = new Client(sqlConfig);
  
  try {
    console.log('🔗 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conectado exitosamente\n');

    // Leer el archivo de migración
    const migrationPath = path.join(__dirname, '..', 'migrations', 'add_sensors_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Ejecutando migración de sensores...\n');
    
    // Ejecutar la migración
    await client.query(migrationSQL);
    
    console.log('✅ Tabla de sensores creada exitosamente\n');
    
    // Verificar que la tabla se creó correctamente
    const checkResult = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_schema = 'agroirrigate' 
      AND table_name = 'sensors'
      ORDER BY ordinal_position
    `);
    
    if (checkResult.rows.length > 0) {
      console.log('✅ Verificación exitosa - Tabla sensors creada');
      console.log('\n📋 Columnas de la tabla:');
      checkResult.rows.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
      });
    } else {
      console.log('❌ Error: Tabla sensors no encontrada');
    }
    
    console.log('\n🌱 Creando sensores para parcelas existentes...');
    
    // Obtener parcelas existentes
    const parcelsResult = await client.query(`
      SELECT id, name, user_id 
      FROM agroirrigate.parcels 
      ORDER BY id
    `);
    
    if (parcelsResult.rows.length > 0) {
      console.log(`📦 Encontradas ${parcelsResult.rows.length} parcelas\n`);
      
      // Crear un sensor para cada parcela
      for (const parcel of parcelsResult.rows) {
        // Verificar si ya existe un sensor para esta parcela
        const existingSensor = await client.query(`
          SELECT id FROM agroirrigate.sensors WHERE parcel_id = $1
        `, [parcel.id]);
        
        if (existingSensor.rows.length === 0) {
          // Generar estado de conectividad aleatorio para simulación
          const connectivityOptions = ['stable', 'medium', 'low'];
          const randomConnectivity = connectivityOptions[Math.floor(Math.random() * connectivityOptions.length)];
          const signalStrength = randomConnectivity === 'stable' ? 85 + Math.floor(Math.random() * 15) :
                                randomConnectivity === 'medium' ? 50 + Math.floor(Math.random() * 35) :
                                20 + Math.floor(Math.random() * 30);
          
          await client.query(`
            INSERT INTO agroirrigate.sensors 
            (parcel_id, sensor_name, connectivity_status, signal_strength)
            VALUES ($1, $2, $3, $4)
          `, [parcel.id, `Soil Moisture Sensor - ${parcel.name}`, randomConnectivity, signalStrength]);
          
          const statusEmoji = randomConnectivity === 'stable' ? '✅' : 
                            randomConnectivity === 'medium' ? '⚠️' : '❌';
          console.log(`${statusEmoji} Sensor creado para ${parcel.name}: ${randomConnectivity} (${signalStrength}%)`);
        } else {
          console.log(`ℹ️ Sensor ya existe para ${parcel.name}`);
        }
      }
      
      console.log('\n✅ Sensores creados/verificados para todas las parcelas');
    } else {
      console.log('⚠️ No hay parcelas en el sistema');
    }
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    
    if (error.message.includes('already exists')) {
      console.log('\nℹ️ La tabla sensors ya existe - esto es normal');
    } else {
      throw error;
    }
  } finally {
    await client.end();
    console.log('\n🔌 Conexión cerrada');
  }
}

// Ejecutar la migración
runSensorsMigration()
  .then(() => {
    console.log('\n🎉 Migración de sensores completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });

