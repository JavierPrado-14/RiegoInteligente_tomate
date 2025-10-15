// backend/controllers/alertController.js
const { Client } = require('pg');
const sqlConfig = require('../config/sqlConfig');
const { sendDryParcelAlert, sendCustomEmail, validateEmail } = require('../services/emailService');

/**
 * Verifica las parcelas secas y envía alertas automáticas (versión interna)
 * Agrupa parcelas por usuario y envía UN correo con todas sus parcelas secas
 */
const checkAndSendDryParcelAlertsInternal = async () => {
  try {
    const client = new Client(sqlConfig);
    await client.connect();

    // Crear tabla de alertas enviadas si no existe (para evitar spam)
    await client.query(`
      CREATE TABLE IF NOT EXISTS agroirrigate.alert_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        parcel_id INTEGER NOT NULL,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        humidity_level INTEGER NOT NULL
      )
    `);

    // Buscar parcelas con humedad menor al 20% (muy secas)
    // Solo enviar alerta si no se ha enviado en las últimas 24 horas
    const result = await client.query(`
      SELECT p.id, p.name, p.humidity, p.user_id, u.nombre_usuario, u.correo
      FROM agroirrigate.parcels p
      INNER JOIN agroirrigate.usuarios u ON p.user_id = u.id
      WHERE p.humidity < 20 
        AND u.correo IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM agroirrigate.alert_history ah
          WHERE ah.parcel_id = p.id
            AND ah.user_id = p.user_id
            AND ah.sent_at > NOW() - INTERVAL '24 hours'
        )
    `);

    if (result.rows.length === 0) {
      await client.end();
      return {
        success: true,
        alertsSent: 0,
        message: 'No hay nuevas alertas que enviar'
      };
    }

    // Agrupar parcelas por usuario
    const parcelasPorUsuario = {};
    
    result.rows.forEach(parcela => {
      if (!parcelasPorUsuario[parcela.user_id]) {
        parcelasPorUsuario[parcela.user_id] = {
          nombre_usuario: parcela.nombre_usuario,
          correo: parcela.correo,
          parcelas: []
        };
      }
      parcelasPorUsuario[parcela.user_id].parcelas.push({
        id: parcela.id,
        name: parcela.name,
        humidity: parcela.humidity
      });
    });

    const alerts = [];
    
    // Enviar UN correo por usuario con todas sus parcelas secas
    for (const userId in parcelasPorUsuario) {
      const userData = parcelasPorUsuario[userId];
      
      console.log(`📧 Enviando alerta a ${userData.nombre_usuario} (${userData.correo}) - ${userData.parcelas.length} parcela(s) seca(s)`);
      
      // Si es solo una parcela, enviar el correo individual
      if (userData.parcelas.length === 1) {
        const parcela = userData.parcelas[0];
        const alertResult = await sendDryParcelAlert(
          userId,
          parcela.name,
          parcela.humidity
        );
        
        if (alertResult.success) {
          // Registrar alerta enviada
          await client.query(
            'INSERT INTO agroirrigate.alert_history (user_id, parcel_id, humidity_level) VALUES ($1, $2, $3)',
            [userId, parcela.id, parcela.humidity]
          );
        }
        
        alerts.push({
          usuario: userData.nombre_usuario,
          email: userData.correo,
          parcelas: [parcela],
          ...alertResult
        });
      } else {
        // Múltiples parcelas: enviar correo agrupado
        const parcelasTexto = userData.parcelas.map(p => `- ${p.name}: ${p.humidity}%`).join('\n');
        
        const subject = `🚨 Alerta: ${userData.parcelas.length} parcelas necesitan riego`;
        const message = `
Hola ${userData.nombre_usuario},

Tienes ${userData.parcelas.length} parcelas que están muy secas y necesitan riego urgente:

${parcelasTexto}

Es momento de regar para mantener tus plantas saludables.

🌱 Sistema de Riego Inteligente AgroIrrigate
🇬🇹 Guatemala
        `.trim();
        
        const alertResult = await sendCustomEmail(userData.correo, subject, message);
        
        if (alertResult.success) {
          // Registrar alertas enviadas para todas las parcelas
          for (const parcela of userData.parcelas) {
            await client.query(
              'INSERT INTO agroirrigate.alert_history (user_id, parcel_id, humidity_level) VALUES ($1, $2, $3)',
              [userId, parcela.id, parcela.humidity]
            );
          }
        }
        
        alerts.push({
          usuario: userData.nombre_usuario,
          email: userData.correo,
          parcelas: userData.parcelas,
          ...alertResult
        });
      }
    }

    await client.end();

    return {
      success: true,
      alertsSent: alerts.length,
      alerts: alerts
    };

  } catch (error) {
    console.error('Error al verificar y enviar alertas:', error);
    return {
      success: false,
      message: 'Error al verificar alertas',
      error: error.message
    };
  }
};

/**
 * Verifica las parcelas secas y envía alertas automáticas (versión HTTP)
 */
const checkAndSendDryParcelAlerts = async (req, res) => {
  try {
    const result = await checkAndSendDryParcelAlertsInternal();
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error en endpoint de alertas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Envía una alerta manual para una parcela específica
 */
const sendManualAlert = async (req, res) => {
  const { parcelaId } = req.params;
  const { message } = req.body;

  try {
    const client = new Client(sqlConfig);
    await client.connect();

    // Obtener información de la parcela y su propietario
    const result = await client.query(`
      SELECT p.id, p.name, p.humidity, p.user_id, u.nombre_usuario, u.correo
      FROM agroirrigate.parcels p
      INNER JOIN agroirrigate.usuarios u ON p.user_id = u.id
      WHERE p.id = $1
    `, [parcelaId]);

    await client.end();

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Parcela no encontrada' });
    }

    const parcela = result.rows[0];

    if (!parcela.correo) {
      return res.status(400).json({ 
        message: 'El propietario de esta parcela no tiene correo electrónico configurado' 
      });
    }

    // Enviar alerta
    const alertResult = await sendDryParcelAlert(
      parcela.user_id,
      parcela.name,
      parcela.humidity
    );

    if (alertResult.success) {
      res.json({
        message: 'Alerta enviada exitosamente por correo',
        parcela: parcela.name,
        email: parcela.correo,
        humedad: parcela.humidity
      });
    } else {
      res.status(500).json({
        message: 'Error al enviar alerta',
        error: alertResult.message
      });
    }

  } catch (error) {
    console.error('Error al enviar alerta manual:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

/**
 * Actualiza el correo electrónico de un usuario
 */
const updateUserEmail = async (req, res) => {
  const { userId } = req.params;
  const { correo } = req.body;

  // Validar formato del correo
  if (!validateEmail(correo)) {
    return res.status(400).json({ 
      message: 'Formato de correo electrónico inválido' 
    });
  }

  try {
    const client = new Client(sqlConfig);
    await client.connect();

    const result = await client.query(
      'UPDATE agroirrigate.usuarios SET correo = $1 WHERE id = $2 RETURNING id, nombre_usuario, correo',
      [correo, userId]
    );

    await client.end();

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({
      message: 'Correo electrónico actualizado exitosamente',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Error al actualizar correo:', error);
    res.status(500).json({ 
      message: 'Error al actualizar correo',
      error: error.message 
    });
  }
};

/**
 * Obtiene el correo electrónico de un usuario
 */
const getUserEmail = async (req, res) => {
  const { userId } = req.params;

  try {
    const client = new Client(sqlConfig);
    await client.connect();

    const result = await client.query(
      'SELECT id, nombre_usuario, correo, telefono FROM agroirrigate.usuarios WHERE id = $1',
      [userId]
    );

    await client.end();

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Error al obtener información del usuario:', error);
    res.status(500).json({ 
      message: 'Error al obtener información del usuario',
      error: error.message 
    });
  }
};

module.exports = {
  checkAndSendDryParcelAlerts,
  checkAndSendDryParcelAlertsInternal,
  sendManualAlert,
  updateUserEmail,
  getUserEmail
};
