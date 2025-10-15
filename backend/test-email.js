// backend/test-email.js
// Script de prueba para verificar el envío de correos

require('dotenv').config({ path: './config.env' });
const { sendDryParcelAlert, sendCustomEmail, verifyEmailService } = require('./services/emailService');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

console.log('\n' + '='.repeat(60));
console.log(`${colors.blue}📧 PRUEBA DE SERVICIO DE CORREO ELECTRÓNICO${colors.reset}`);
console.log('='.repeat(60) + '\n');

async function testEmailService() {
  try {
    // 1. Verificar configuración
    console.log(`${colors.yellow}1️⃣  Verificando configuración de Gmail...${colors.reset}`);
    const isConfigured = await verifyEmailService();
    
    if (!isConfigured) {
      console.log(`${colors.red}❌ Error: El servicio de correo NO está configurado correctamente${colors.reset}`);
      console.log(`\n${colors.yellow}Por favor, sigue estos pasos:${colors.reset}`);
      console.log('   1. Lee el archivo CONFIGURACION_GMAIL.md');
      console.log('   2. Crea el archivo config.env');
      console.log('   3. Agrega GMAIL_USER y GMAIL_APP_PASSWORD\n');
      process.exit(1);
    }
    
    console.log(`${colors.green}✅ Configuración correcta\n${colors.reset}`);
    
    // 2. Enviar correo de prueba personalizado
    console.log(`${colors.yellow}2️⃣  Enviando correo de prueba...${colors.reset}`);
    
    const testEmail = process.env.GMAIL_USER; // Se envía al mismo correo configurado
    const subject = '🌾 Prueba de Sistema AgroIrrigate';
    const message = `
¡Hola!

Este es un correo de prueba del Sistema de Riego Inteligente AgroIrrigate.

Si estás recibiendo este mensaje, significa que:
✅ El servicio de correo está configurado correctamente
✅ Nodemailer está funcionando
✅ Tu contraseña de aplicación de Gmail es válida

El sistema está listo para enviar alertas automáticas cuando las parcelas necesiten riego.

🌱 Siguiente paso: Prueba crear una parcela y ajustar su humedad a menos del 20% para recibir una alerta real.

¡Que tengas un excelente día!

---
Sistema de Riego Inteligente
🇬🇹 Guatemala
    `.trim();
    
    const result = await sendCustomEmail(testEmail, subject, message);
    
    if (result.success) {
      console.log(`${colors.green}✅ Correo enviado exitosamente${colors.reset}`);
      console.log(`   📨 Destinatario: ${testEmail}`);
      console.log(`   📧 MessageID: ${result.messageId}\n`);
      
      console.log(`${colors.blue}🎉 ¡PRUEBA EXITOSA!${colors.reset}`);
      console.log(`\n${colors.yellow}📬 Revisa tu bandeja de entrada:${colors.reset}`);
      console.log(`   Correo: ${testEmail}`);
      console.log(`   Asunto: ${subject}`);
      console.log(`\n${colors.yellow}⚠️  Si no lo ves:${colors.reset}`);
      console.log('   1. Revisa la carpeta de SPAM');
      console.log('   2. Marca como "No es spam"');
      console.log('   3. Agrega el correo a tus contactos\n');
      
    } else {
      console.log(`${colors.red}❌ Error al enviar correo:${colors.reset}`);
      console.log(`   ${result.error}\n`);
      process.exit(1);
    }
    
    // 3. Simular alerta de parcela seca
    console.log(`${colors.yellow}3️⃣  ¿Quieres probar el correo de alerta de parcela seca? (opcional)${colors.reset}`);
    console.log(`   Para esto, ejecuta desde la terminal:\n`);
    console.log(`   ${colors.blue}node test-email-alert.js${colors.reset}\n`);
    
  } catch (error) {
    console.log(`${colors.red}❌ Error inesperado:${colors.reset}`);
    console.error(error);
    process.exit(1);
  }
  
  console.log('='.repeat(60));
  console.log(`${colors.green}✅ Prueba completada${colors.reset}`);
  console.log('='.repeat(60) + '\n');
}

// Ejecutar prueba
testEmailService();


