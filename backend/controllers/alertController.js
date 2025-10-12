// backend/controllers/alertController.js
const { Client } = require('pg');
const sqlConfig = require('../config/sqlConfig');
const { sendDryParcelAlert, sendCustomSMS, validatePhoneNumber } = require('../services/smsService');

/**
 * Verifica las parcelas secas y envía alertas automáticas (versión interna)
 */
const checkAndSendDryParcelAlertsInternal = async () => {
  try {
    const client = new Client(sqlConfig);
    await client.connect();

    // Buscar parcelas con humedad menor al 20% (muy secas)
    const result = await client.query(`
      SELECT p.id, p.name, p.humidity, p.user_id, u.nombre_usuario, u.telefono
      FROM agroirrigate.parcels p
      INNER JOIN agroirrigate.usuarios u ON p.user_id = u.id
      WHERE p.humidity < 20 AND u.telefono IS NOT NULL
    `);

    await client.end();

    const alerts = [];
    
    for (const parcela of result.rows) {
      console.log(`Enviando alerta para parcela ${parcela.name} (${parcela.humidity}%)`);
      
      const alertResult = await sendDryParcelAlert(
        parcela.user_id,
        parcela.name,
        parcela.humidity
      );
      
      alerts.push({
        parcela: parcela.name,
        usuario: parcela.nombre_usuario,
        telefono: parcela.telefono,
        humedad: parcela.humidity,
        ...alertResult
      });
    }

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
      SELECT p.id, p.name, p.humidity, p.user_id, u.nombre_usuario, u.telefono
      FROM agroirrigate.parcels p
      INNER JOIN agroirrigate.usuarios u ON p.user_id = u.id
      WHERE p.id = $1
    `, [parcelaId]);

    await client.end();

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Parcela no encontrada' });
    }

    const parcela = result.rows[0];

    if (!parcela.telefono) {
      return res.status(400).json({ 
        message: 'El propietario de esta parcela no tiene número de teléfono configurado' 
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
        message: 'Alerta enviada exitosamente',
        parcela: parcela.name,
        telefono: parcela.telefono,
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
 * Actualiza el número de teléfono de un usuario
 */
const updateUserPhone = async (req, res) => {
  const { userId } = req.params;
  const { telefono } = req.body;

  // Validar formato del teléfono
  if (!validatePhoneNumber(telefono)) {
    return res.status(400).json({ 
      message: 'Formato de teléfono inválido. Use el formato internacional (+1234567890)' 
    });
  }

  try {
    const client = new Client(sqlConfig);
    await client.connect();

    const result = await client.query(
      'UPDATE agroirrigate.usuarios SET telefono = $1 WHERE id = $2 RETURNING id, nombre_usuario, telefono',
      [telefono, userId]
    );

    await client.end();

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({
      message: 'Número de teléfono actualizado exitosamente',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Error al actualizar teléfono:', error);
    res.status(500).json({ 
      message: 'Error al actualizar teléfono',
      error: error.message 
    });
  }
};

/**
 * Obtiene el número de teléfono de un usuario
 */
const getUserPhone = async (req, res) => {
  const { userId } = req.params;

  try {
    const client = new Client(sqlConfig);
    await client.connect();

    const result = await client.query(
      'SELECT id, nombre_usuario, telefono FROM agroirrigate.usuarios WHERE id = $1',
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
    console.error('Error al obtener teléfono:', error);
    res.status(500).json({ 
      message: 'Error al obtener teléfono',
      error: error.message 
    });
  }
};

module.exports = {
  checkAndSendDryParcelAlerts,
  checkAndSendDryParcelAlertsInternal,
  sendManualAlert,
  updateUserPhone,
  getUserPhone
};
