// backend/utils/timeHelper.js

/**
 * Obtiene la fecha y hora actual de Guatemala (GMT-6)
 * @returns {Date} Fecha y hora actual en zona horaria de Guatemala
 */
function getGuatemalaTime() {
  const now = new Date();
  // Crear fecha en zona horaria de Guatemala
  // Usamos toLocaleString para obtener la hora local y luego la convertimos
  const guatemalaTimeString = now.toLocaleString("en-US", {
    timeZone: "America/Guatemala",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
  
  // Convertir string a Date
  const [datePart, timePart] = guatemalaTimeString.split(", ");
  const [month, day, year] = datePart.split("/");
  const [hour, minute, second] = timePart.split(":");
  
  const guatemalaTime = new Date(year, month - 1, day, hour, minute, second);
  return guatemalaTime;
}

/**
 * Obtiene la fecha y hora actual de Guatemala como string ISO
 * @returns {string} Fecha y hora en formato ISO string
 */
function getGuatemalaTimeISO() {
  return getGuatemalaTime().toISOString();
}

/**
 * Formatea la fecha para mostrar en la interfaz
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} Fecha formateada para Guatemala
 */
function formatGuatemalaDate(date) {
  const guatemalaDate = new Date(date);
  return guatemalaDate.toLocaleString('es-GT', {
    dateStyle: 'short',
    timeStyle: 'medium',
    timeZone: 'America/Guatemala'
  });
}

/**
 * Obtiene la consulta SQL para usar la hora de Guatemala
 * @returns {string} Consulta SQL con hora de Guatemala
 */
function getGuatemalaTimeSQL() {
  // Usamos JavaScript para calcular la hora correcta
  const guatemalaTime = getGuatemalaTime();
  return guatemalaTime.toISOString();
}

module.exports = {
  getGuatemalaTime,
  getGuatemalaTimeISO,
  formatGuatemalaDate,
  getGuatemalaTimeSQL
};
