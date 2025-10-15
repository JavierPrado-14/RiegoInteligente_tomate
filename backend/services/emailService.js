// backend/services/emailService.js
const nodemailer = require('nodemailer');
const { Client } = require('pg');
const sqlConfig = require('../config/sqlConfig');

// Configuración de Gmail (usar variables de entorno en producción)
const GMAIL_USER = process.env.GMAIL_USER || 'kennethprado140494@gmail.com';
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || 'your_app_password_here';

// Crear transportador de nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD
  }
});

/**
 * Envía una alerta por correo cuando una parcela está muy seca
 * @param {number} userId - ID del usuario propietario de la parcela
 * @param {string} parcelaName - Nombre de la parcela
 * @param {number} humidity - Nivel de humedad actual
 */
const sendDryParcelAlert = async (userId, parcelaName, humidity) => {
  try {
    // Obtener información del usuario incluyendo el correo
    const dbClient = new Client(sqlConfig);
    await dbClient.connect();

    const userResult = await dbClient.query(
      'SELECT nombre_usuario, correo FROM agroirrigate.usuarios WHERE id = $1',
      [userId]
    );

    await dbClient.end();

    if (userResult.rows.length === 0) {
      console.log(`Usuario con ID ${userId} no encontrado`);
      return { success: false, message: 'Usuario no encontrado' };
    }

    const user = userResult.rows[0];

    // Verificar si el usuario tiene correo configurado
    if (!user.correo) {
      console.log(`Usuario ${user.nombre_usuario} no tiene correo configurado`);
      return { success: false, message: 'Usuario no tiene correo configurado' };
    }

    // Crear HTML del correo
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .alert-box { background: #fff3cd; border-left: 5px solid #ffc107; padding: 15px; margin: 20px 0; }
          .humidity-level { font-size: 36px; font-weight: bold; color: #dc3545; text-align: center; margin: 20px 0; }
          .cta-button { display: inline-block; padding: 12px 30px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
          .icon { font-size: 48px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="icon">🚨</div>
            <h1>Alerta de Riego</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${user.nombre_usuario}</strong>,</p>
            
            <div class="alert-box">
              <h2>⚠️ Tu parcela necesita atención</h2>
              <p>Tu parcela <strong>"${parcelaName}"</strong> está muy seca.</p>
            </div>
            
            <div class="humidity-level">
              ${humidity}% 💧
            </div>
            <p style="text-align: center; color: #666;">Nivel de humedad actual</p>
            
            <p>Es momento de regar para mantener tus plantas saludables. El nivel óptimo de humedad debe estar entre 40% y 70%.</p>
            
            <div style="text-align: center;">
              <p><strong>🌱 Recomendación:</strong> Programa un riego inmediato para tu parcela.</p>
            </div>
            
            <div class="footer">
              <p>🌾 Sistema de Riego Inteligente AgroIrrigate</p>
              <p>🇬🇹 Guatemala</p>
              <hr>
              <p style="font-size: 10px; color: #999;">
                Este es un mensaje automático. Por favor no respondas a este correo.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Crear versión de texto plano
    const textContent = `
🚨 ALERTA DE RIEGO 🚨

Hola ${user.nombre_usuario},

Tu parcela "${parcelaName}" está muy seca (${humidity}% humedad).

¡Es momento de regar para mantener tus plantas saludables!

Nivel óptimo: 40% - 70%
Nivel actual: ${humidity}%

🌱 Sistema de Riego Inteligente AgroIrrigate
🇬🇹 Guatemala
    `.trim();

    // Configurar opciones del correo
    const mailOptions = {
      from: `"🌾 AgroIrrigate" <${GMAIL_USER}>`,
      to: user.correo,
      subject: `🚨 Alerta: Parcela "${parcelaName}" necesita riego (${humidity}% humedad)`,
      text: textContent,
      html: htmlContent
    };

    // Enviar correo
    const info = await transporter.sendMail(mailOptions);

    console.log(`✉️ Correo enviado exitosamente a ${user.correo}. MessageID: ${info.messageId}`);
    
    return { 
      success: true, 
      message: 'Correo enviado exitosamente',
      messageId: info.messageId,
      email: user.correo
    };

  } catch (error) {
    console.error('Error al enviar correo:', error);
    return { 
      success: false, 
      message: 'Error al enviar correo',
      error: error.message 
    };
  }
};

/**
 * Envía un correo personalizado
 * @param {string} email - Correo electrónico destino
 * @param {string} subject - Asunto del correo
 * @param {string} message - Mensaje a enviar
 */
const sendCustomEmail = async (email, subject, message) => {
  try {
    const mailOptions = {
      from: `"🌾 AgroIrrigate" <${GMAIL_USER}>`,
      to: email,
      subject: subject,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #667eea;">🌾 AgroIrrigate</h2>
          <p>${message}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">Sistema de Riego Inteligente 🇬🇹 Guatemala</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`✉️ Correo personalizado enviado a ${email}. MessageID: ${info.messageId}`);
    
    return { 
      success: true, 
      message: 'Correo enviado exitosamente',
      messageId: info.messageId
    };

  } catch (error) {
    console.error('Error al enviar correo personalizado:', error);
    return { 
      success: false, 
      message: 'Error al enviar correo',
      error: error.message 
    };
  }
};

/**
 * Verifica si un correo electrónico es válido
 * @param {string} email - Correo electrónico a verificar
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Verifica la configuración del servicio de correo
 */
const verifyEmailService = async () => {
  try {
    await transporter.verify();
    console.log('✅ Servicio de correo configurado correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error en configuración de correo:', error.message);
    return false;
  }
};

module.exports = {
  sendDryParcelAlert,
  sendCustomEmail,
  validateEmail,
  verifyEmailService
};


