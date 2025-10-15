// backend/config/sqlConfig.js

const sqlConfig = {
  user: 'postgres', // Tu usuario de PostgreSQL
  host: 'localhost', // El host (localhost en este caso)
  database: 'agroirrigate', // Nombre de la base de datos en minúsculas
  password: '1234', // Tu contraseña de PostgreSQL
  port: 5432, // Puerto de PostgreSQL
  timezone: 'America/Guatemala', // Configurar zona horaria de Guatemala
  options: '-c timezone=America/Guatemala' // Opción adicional para asegurar zona horaria
};

module.exports = sqlConfig;
