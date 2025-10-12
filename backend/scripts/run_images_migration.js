// backend/scripts/run_images_migration.js
const { Client } = require('pg');
const sqlConfig = require('../config/sqlConfig');
const fs = require('fs');
const path = require('path');

async function runImagesMigration() {
  const client = new Client(sqlConfig);
  
  try {
    console.log('🔗 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conectado exitosamente\n');

    // Leer el archivo de migración
    const migrationPath = path.join(__dirname, '..', 'migrations', 'add_images_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Ejecutando migración de imágenes...\n');
    
    // Ejecutar la migración
    await client.query(migrationSQL);
    
    console.log('✅ Tabla de imágenes creada exitosamente\n');
    
    // Verificar que la tabla se creó correctamente
    const checkResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'agroirrigate' 
      AND table_name = 'parcel_images'
      ORDER BY ordinal_position
    `);
    
    if (checkResult.rows.length > 0) {
      console.log('✅ Verificación exitosa - Tabla parcel_images creada');
      console.log('\n📋 Columnas de la tabla:');
      checkResult.rows.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type}`);
      });
    } else {
      console.log('❌ Error: Tabla parcel_images no encontrada');
    }
    
    console.log('\n📁 Sistema de imágenes listo para usar');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    
    if (error.message.includes('already exists')) {
      console.log('\nℹ️ La tabla parcel_images ya existe - esto es normal');
    } else {
      throw error;
    }
  } finally {
    await client.end();
    console.log('\n🔌 Conexión cerrada');
  }
}

// Ejecutar la migración
runImagesMigration()
  .then(() => {
    console.log('\n🎉 Migración de imágenes completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });

