// backend/services/alertMonitor.js
const { checkAndSendDryParcelAlertsInternal } = require('../controllers/alertController');

// Configuración del monitor
const CHECK_INTERVAL = 2 * 60 * 1000; // Verificar cada 2 minutos
let monitorInterval = null;

/**
 * Inicia el monitor automático de alertas
 */
const startAlertMonitor = () => {
  console.log('🔔 Iniciando monitor de alertas SMS...');
  
  // Verificar inmediatamente al iniciar
  checkAndSendDryParcelAlertsInternal();
  
  // Configurar verificación periódica
  monitorInterval = setInterval(async () => {
    console.log('🔍 Verificando parcelas secas...');
    
    const result = await checkAndSendDryParcelAlertsInternal();
    
    if (result.success && result.alertsSent > 0) {
      console.log(`📱 Se enviaron ${result.alertsSent} alertas SMS`);
    } else {
      console.log('✅ Todas las parcelas tienen humedad adecuada');
    }
  }, CHECK_INTERVAL);
  
  console.log(`⏰ Monitor configurado para verificar cada ${CHECK_INTERVAL / 60000} minutos`);
};

/**
 * Detiene el monitor automático de alertas
 */
const stopAlertMonitor = () => {
  if (monitorInterval) {
    clearInterval(monitorInterval);
    monitorInterval = null;
    console.log('🛑 Monitor de alertas detenido');
  }
};

/**
 * Verifica manualmente las parcelas secas
 */
const checkDryParcelsNow = async () => {
  console.log('🔍 Verificación manual de parcelas secas...');
  return await checkAndSendDryParcelAlertsInternal();
};

module.exports = {
  startAlertMonitor,
  stopAlertMonitor,
  checkDryParcelsNow
};
