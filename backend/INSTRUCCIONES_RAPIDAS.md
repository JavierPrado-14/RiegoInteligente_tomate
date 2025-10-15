# 🚀 INSTRUCCIONES RÁPIDAS - Sistema de Alertas por Correo

## ✅ ¿Qué se hizo?

El sistema de alertas **cambió de SMS (Twilio) a Correo Electrónico (Gmail)**.

---

## 📋 PASOS PARA ACTIVAR (5 minutos)

### Paso 1: Obtener contraseña de Gmail

1. Ve a: https://myaccount.google.com/
2. **Seguridad** → Activa **Verificación en 2 pasos**
3. **Seguridad** → **Contraseñas de aplicaciones**
4. Selecciona **Correo** y **Otro dispositivo**
5. Nombre: `AgroIrrigate`
6. **Copiar** la contraseña de 16 caracteres

### Paso 2: Crear archivo config.env

En la carpeta `backend/`, crea un archivo llamado `config.env`:

```env
# Correo electrónico
GMAIL_USER=kennethprado140494@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=agroirrigate
DB_USER=postgres
DB_PASSWORD=1234

# JWT
JWT_SECRET=secreta

# Guatemala
COUNTRY_CODE=GT
DEFAULT_PHONE_PREFIX=+502
```

⚠️ **IMPORTANTE**: Reemplaza `xxxx xxxx xxxx xxxx` con tu contraseña real de Gmail.

### Paso 3: Instalar dependencias (ya hecho)

```bash
cd backend
npm install
```

### Paso 4: Probar el correo (ANTES de iniciar el servidor)

```bash
node test-email.js
```

Deberías ver:
```
✅ Configuración correcta
✅ Correo enviado exitosamente
🎉 ¡PRUEBA EXITOSA!
```

### Paso 5: Iniciar el servidor

```bash
node server.js
```

Deberías ver:
```
✅ Servidor corriendo en http://localhost:4000
✅ Servicio de correo configurado correctamente
📧 Iniciando monitor de alertas por correo electrónico...
```

---

## 🎯 ¿Cómo funciona ahora?

### Automático:
- Cada **2 minutos** el sistema verifica parcelas
- Si una parcela tiene **humedad < 20%**
- Envía un **correo automático** al dueño de la parcela

### Correo incluye:
- 🚨 Alerta visual
- 📊 Nivel de humedad actual
- 💧 Recomendaciones
- 🎨 Diseño profesional HTML

---

## 📁 Archivos nuevos creados

1. ✅ `services/emailService.js` - Servicio de correos
2. ✅ `CONFIGURACION_GMAIL.md` - Guía detallada
3. ✅ `MIGRACION_SMS_A_EMAIL.md` - Documentación completa
4. ✅ `INSTRUCCIONES_RAPIDAS.md` - Este archivo
5. ✅ `test-email.js` - Script de prueba
6. ✅ `.gitignore` - Protege config.env

---

## 🔄 Archivos modificados

1. ✅ `controllers/alertController.js` - Usa emails ahora
2. ✅ `services/alertMonitor.js` - Mensajes actualizados
3. ✅ `routes/alertRoutes.js` - Rutas de email
4. ✅ `server.js` - Verifica configuración al iniciar
5. ✅ `config.env.example` - Configuración de Gmail
6. ✅ `package.json` - Nodemailer instalado

---

## ⚠️ Solución de problemas

### ❌ Error: "Error en configuración de correo"

**Solución:**
- Verifica que `config.env` esté en `backend/`
- Verifica que `GMAIL_USER` y `GMAIL_APP_PASSWORD` sean correctos
- Verifica que tengas verificación en 2 pasos activada

### ❌ Los correos llegan a spam

**Solución:**
- Marca como "No es spam" la primera vez
- Agrega el correo a tus contactos

---

## 🎓 Para tu presentación

### Ventajas vs SMS:
- ✅ **GRATIS** (vs pagar por cada SMS)
- ✅ **500 correos/día** (suficiente para el proyecto)
- ✅ **Diseño profesional** (HTML vs texto plano)
- ✅ **Fácil de configurar** (solo Gmail)

---

## 📞 ¿Necesitas ayuda?

Lee los archivos de documentación:
1. `CONFIGURACION_GMAIL.md` - Paso a paso de Gmail
2. `MIGRACION_SMS_A_EMAIL.md` - Documentación completa

---

**🌾 Sistema de Riego Inteligente AgroIrrigate**
**🇬🇹 Guatemala**


