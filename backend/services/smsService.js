// backend/services/smsService.js
const twilio = require('twilio');
const { Client } = require('pg');
const sqlConfig = require('../config/sqlConfig');

// Configuración de Twilio (debes obtener estos valores de tu cuenta de Twilio)
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || 'your_auth_token_here';
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || '+1234567890';

// Inicializar cliente de Twilio
const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

/**
 * Envía una alerta SMS cuando una parcela está muy seca
 * @param {number} userId - ID del usuario propietario de la parcela
 * @param {string} parcelaName - Nombre de la parcela
 * @param {number} humidity - Nivel de humedad actual
 */
const sendDryParcelAlert = async (userId, parcelaName, humidity) => {
  try {
    // Obtener información del usuario incluyendo el teléfono
    const dbClient = new Client(sqlConfig);
    await dbClient.connect();

    const userResult = await dbClient.query(
      'SELECT nombre_usuario, telefono FROM agroirrigate.usuarios WHERE id = $1',
      [userId]
    );

    await dbClient.end();

    if (userResult.rows.length === 0) {
      console.log(`Usuario con ID ${userId} no encontrado`);
      return { success: false, message: 'Usuario no encontrado' };
    }

    const user = userResult.rows[0];

    // Verificar si el usuario tiene número de teléfono configurado
    if (!user.telefono) {
      console.log(`Usuario ${user.nombre_usuario} no tiene número de teléfono configurado`);
      return { success: false, message: 'Usuario no tiene teléfono configurado' };
    }

    // Crear mensaje personalizado para Guatemala
    const message = `🚨 ALERTA DE RIEGO 🚨\n\n` +
                   `Hola ${user.nombre_usuario},\n\n` +
                   `Tu parcela "${parcelaName}" está muy seca (${humidity}% humedad).\n\n` +
                   `¡Es momento de regar para mantener tus plantas saludables!\n\n` +
                   `🌱 Sistema de Riego Inteligente\n` +
                   `🇬🇹 Guatemala`;

    // Enviar SMS usando Twilio
    const messageResult = await client.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to: user.telefono
    });

    console.log(`SMS enviado exitosamente a ${user.telefono}. SID: ${messageResult.sid}`);
    
    return { 
      success: true, 
      message: 'SMS enviado exitosamente',
      sid: messageResult.sid
    };

  } catch (error) {
    console.error('Error al enviar SMS:', error);
    return { 
      success: false, 
      message: 'Error al enviar SMS',
      error: error.message 
    };
  }
};

/**
 * Envía una alerta SMS personalizada
 * @param {string} phoneNumber - Número de teléfono destino
 * @param {string} message - Mensaje a enviar
 */
const sendCustomSMS = async (phoneNumber, message) => {
  try {
    const messageResult = await client.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    console.log(`SMS personalizado enviado a ${phoneNumber}. SID: ${messageResult.sid}`);
    
    return { 
      success: true, 
      message: 'SMS enviado exitosamente',
      sid: messageResult.sid
    };

  } catch (error) {
    console.error('Error al enviar SMS personalizado:', error);
    return { 
      success: false, 
      message: 'Error al enviar SMS',
      error: error.message 
    };
  }
};

/**
 * Verifica si un número de teléfono es válido
 * @param {string} phoneNumber - Número de teléfono a verificar
 */
const validatePhoneNumber = (phoneNumber) => {
  // Formato básico: debe empezar con + y tener 10-15 dígitos
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber);
};

module.exports = {
  sendDryParcelAlert,
  sendCustomSMS,
  validatePhoneNumber
};
