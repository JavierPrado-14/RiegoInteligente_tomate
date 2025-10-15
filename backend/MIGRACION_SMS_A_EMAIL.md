# 📧 Migración de SMS a Correo Electrónico - Completada

## 🎯 Resumen de cambios

El sistema de alertas ha sido **migrado exitosamente** de SMS (Twilio) a **correo electrónico (Gmail)**.

---

## 📁 Archivos modificados

### ✅ Archivos nuevos creados:

1. **`backend/services/emailService.js`** ⭐ NUEVO
   - Servicio completo de envío de correos con Gmail
   - Funciones:
     - `sendDryParcelAlert()` - Envía alertas de parcelas secas
     - `sendCustomEmail()` - Envía correos personalizados
     - `validateEmail()` - Valida formato de email
     - `verifyEmailService()` - Verifica configuración de Gmail
   - Incluye plantillas HTML profesionales para los correos

2. **`backend/.gitignore`** ⭐ NUEVO
   - Protege el archivo `config.env` de ser subido a Git

3. **`backend/CONFIGURACION_GMAIL.md`** ⭐ NUEVO
   - Guía paso a paso para configurar Gmail

4. **`backend/MIGRACION_SMS_A_EMAIL.md`** ⭐ NUEVO
   - Este archivo - documentación de la migración

### ✏️ Archivos modificados:

5. **`backend/controllers/alertController.js`**
   - ❌ Eliminado: `smsService` y funciones relacionadas con SMS
   - ✅ Agregado: `emailService` y funciones de email
   - Cambios:
     - `sendDryParcelAlert()` ahora usa correos en lugar de SMS
     - Consultas SQL cambiadas de `telefono` a `correo`
     - `updateUserPhone()` → `updateUserEmail()`
     - `getUserPhone()` → `getUserEmail()`
     - `validatePhoneNumber()` → `validateEmail()`

6. **`backend/services/alertMonitor.js`**
   - Mensajes de consola actualizados de "SMS" a "correo electrónico"

7. **`backend/routes/alertRoutes.js`**
   - Rutas actualizadas:
     - `/api/alerts/phone/:userId` → `/api/alerts/email/:userId`
   - Funciones actualizadas en imports

8. **`backend/config.env.example`**
   - ❌ Eliminado: Credenciales de Twilio
   - ✅ Agregado: Configuración de Gmail (GMAIL_USER, GMAIL_APP_PASSWORD)
   - Incluye instrucciones detalladas

9. **`backend/server.js`**
   - Agregada verificación del servicio de email al iniciar
   - Comentarios actualizados

10. **`backend/package.json`** (automático)
    - ✅ Agregado: `nodemailer@^6.x.x`
    - ⚠️ Twilio sigue instalado (puedes eliminarlo con `npm uninstall twilio`)

---

## 🔄 Cambios en la base de datos

### ✅ NO se requieren migraciones

El sistema ya utilizaba el campo `correo` en la tabla `usuarios`:
- ✅ Campo `correo` - USADO para enviar alertas
- ℹ️ Campo `telefono` - MANTENIDO (como solicitaste)

---

## 🚀 Cómo usar el nuevo sistema

### 1. Configurar Gmail

Sigue las instrucciones en: `backend/CONFIGURACION_GMAIL.md`

**Resumen rápido:**
1. Activa verificación en 2 pasos en Gmail
2. Genera una contraseña de aplicación
3. Crea `backend/config.env` con:
   ```env
   GMAIL_USER=kennethprado140494@gmail.com
   GMAIL_APP_PASSWORD=tu_contraseña_de_16_caracteres
   ```

### 2. Instalar dependencias (ya hecho)

```bash
cd backend
npm install
```

### 3. Iniciar el servidor

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

## 📧 Flujo de alertas

### Automático (cada 2 minutos):

1. El sistema verifica parcelas con humedad < 20%
2. Busca usuarios con correo registrado
3. Envía un correo profesional con:
   - ⚠️ Alerta visual de la parcela
   - 📊 Nivel de humedad actual
   - 💧 Recomendaciones
   - 🎨 Diseño HTML profesional

### Manual:

```bash
POST /api/alerts/send/:parcelaId
```

---

## 🎨 Características del correo

### Plantilla profesional con:
- ✅ Diseño HTML responsive
- ✅ Colores y estilos atractivos
- ✅ Iconos y emojis
- ✅ Versión de texto plano alternativa
- ✅ Información clara y estructurada
- ✅ Footer con branding de AgroIrrigate 🇬🇹

### Ejemplo de asunto:
```
🚨 Alerta: Parcela "Mi Parcela" necesita riego (15% humedad)
```

---

## 🔧 APIs disponibles

### 1. Verificar y enviar alertas automáticas
```
POST /api/alerts/check-dry-parcels
```

### 2. Enviar alerta manual a una parcela
```
POST /api/alerts/send/:parcelaId
Headers: Authorization: Bearer <token>
```

### 3. Actualizar correo del usuario
```
PUT /api/alerts/email/:userId
Headers: Authorization: Bearer <token>
Body: { "correo": "nuevo@email.com" }
```

### 4. Obtener info del usuario
```
GET /api/alerts/email/:userId
Headers: Authorization: Bearer <token>
```

---

## ⚠️ Archivos a eliminar (opcional)

Si quieres limpiar completamente Twilio:

```bash
# 1. Desinstalar Twilio
npm uninstall twilio

# 2. Eliminar archivo antiguo
rm backend/services/smsService.js
```

**NOTA:** El archivo `smsService.js` todavía existe pero ya no se usa.

---

## ✅ Ventajas de la migración

| Característica | SMS (Twilio) | Email (Gmail) |
|----------------|--------------|---------------|
| **Costo** | 💰 $0.0079/SMS | ✅ GRATIS |
| **Límite diario** | Depende del plan | 500/día |
| **Diseño** | Solo texto | HTML profesional |
| **Configuración** | Compleja | Simple |
| **Dependencias** | Servicio externo pago | Cuenta Gmail |

---

## 🐛 Solución de problemas

### Error: "Error en configuración de correo"

**Solución:**
1. Verifica que `config.env` exista
2. Verifica las credenciales de Gmail
3. Asegúrate de tener verificación en 2 pasos activada
4. Genera una nueva contraseña de aplicación

### Los correos llegan a spam

**Solución:**
1. Marca como "No es spam" la primera vez
2. Agrega el correo a tus contactos
3. Las siguientes llegarán a la bandeja principal

### No se envían alertas

**Solución:**
1. Verifica que las parcelas tengan humedad < 20%
2. Verifica que los usuarios tengan correo en la BD
3. Revisa los logs del servidor

---

## 📊 Estado del proyecto

- ✅ Migración completada
- ✅ Sistema de correos funcionando
- ✅ Documentación creada
- ✅ Variables de entorno configuradas
- ✅ `.gitignore` actualizado
- ⚠️ Pendiente: Eliminar Twilio (opcional)
- ⚠️ Pendiente: Configurar contraseña de Gmail

---

## 👤 Configuración actual

**Correo del sistema:** `kennethprado140494@gmail.com`
**Verificación cada:** 2 minutos
**Umbral de alerta:** Humedad < 20%

---

## 📚 Archivos de documentación

1. `CONFIGURACION_GMAIL.md` - Guía de configuración de Gmail
2. `MIGRACION_SMS_A_EMAIL.md` - Este archivo
3. `config.env.example` - Ejemplo de configuración

---

**🌾 Sistema de Riego Inteligente AgroIrrigate**
**🇬🇹 Guatemala**

---

_Migración realizada el: Octubre 2025_
_Desarrollado para: Seminario de Tecnologías de Información_


