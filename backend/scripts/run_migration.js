// backend/scripts/run_migration.js
const { Client } = require('pg');
const sqlConfig = require('../config/sqlConfig');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const client = new Client(sqlConfig);
  
  try {
    console.log('🔗 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conectado exitosamente');

    // Leer el archivo de migración
    const migrationPath = path.join(__dirname, '..', 'migrations', 'add_telefono_column.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Ejecutando migración...');
    console.log('SQL:', migrationSQL);
    
    // Ejecutar la migración
    await client.query(migrationSQL);
    
    console.log('✅ Migración ejecutada exitosamente');
    console.log('📱 Columna "telefono" agregada a la tabla usuarios');
    
    // Verificar que la columna se agregó correctamente
    const checkResult = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_schema = 'agroirrigate' 
      AND table_name = 'usuarios' 
      AND column_name = 'telefono'
    `);
    
    if (checkResult.rows.length > 0) {
      console.log('✅ Verificación exitosa - Columna telefono existe');
      console.log('Detalles:', checkResult.rows[0]);
    } else {
      console.log('❌ Error: Columna telefono no encontrada');
    }
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    
    if (error.message.includes('already exists')) {
      console.log('ℹ️ La columna telefono ya existe - esto es normal');
    } else {
      throw error;
    }
  } finally {
    await client.end();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar la migración
runMigration()
  .then(() => {
    console.log('🎉 Migración completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
