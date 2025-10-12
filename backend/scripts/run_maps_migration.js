// backend/scripts/run_maps_migration.js
const { Client } = require('pg');
const sqlConfig = require('../config/sqlConfig');
const fs = require('fs');
const path = require('path');

async function runMapsMigration() {
  const client = new Client(sqlConfig);
  
  try {
    console.log('🔗 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conectado exitosamente\n');

    // Leer el archivo de migración
    const migrationPath = path.join(__dirname, '..', 'migrations', 'add_maps_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Ejecutando migración de mapas...\n');
    
    // Ejecutar la migración
    await client.query(migrationSQL);
    
    console.log('✅ Tablas de mapas creadas exitosamente\n');
    
    // Verificar tablas creadas
    const mapsCheck = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'agroirrigate' 
      AND table_name = 'maps'
      ORDER BY ordinal_position
    `);
    
    const mapParcelsCheck = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'agroirrigate' 
      AND table_name = 'map_parcels'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Tabla maps:');
    mapsCheck.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });
    
    console.log('\n📋 Tabla map_parcels:');
    mapParcelsCheck.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });
    
    console.log('\n✅ Sistema de mapas listo para usar');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    
    if (error.message.includes('already exists')) {
      console.log('\nℹ️ Las tablas ya existen - esto es normal');
    } else {
      throw error;
    }
  } finally {
    await client.end();
    console.log('\n🔌 Conexión cerrada');
  }
}

// Ejecutar la migración
runMapsMigration()
  .then(() => {
    console.log('\n🎉 Migración de mapas completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });

