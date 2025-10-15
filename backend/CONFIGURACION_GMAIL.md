# 📧 Configuración de Gmail para Alertas por Correo Electrónico

## ⚙️ Pasos para configurar Gmail con contraseña de aplicación

### 1️⃣ Activar la verificación en dos pasos

1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. En el menú lateral, haz clic en **Seguridad**
3. Busca la sección **Cómo inicias sesión en Google**
4. Haz clic en **Verificación en dos pasos**
5. Sigue las instrucciones para activarla (si no está activada)

### 2️⃣ Generar una contraseña de aplicación

1. Una vez activada la verificación en dos pasos, regresa a **Seguridad**
2. Busca la sección **Cómo inicias sesión en Google**
3. Haz clic en **Contraseñas de aplicaciones**
   - Si no ves esta opción, asegúrate de que la verificación en dos pasos esté activada
4. En "Selecciona la aplicación", elige **Correo**
5. En "Selecciona el dispositivo", elige **Otro (nombre personalizado)**
6. Escribe un nombre como: `AgroIrrigate Backend`
7. Haz clic en **Generar**
8. Google te mostrará una contraseña de 16 caracteres

### 3️⃣ Copiar la contraseña

- **IMPORTANTE**: Copia esta contraseña inmediatamente
- Formato: `xxxx xxxx xxxx xxxx` (16 caracteres con espacios)
- Puedes usar la contraseña con o sin espacios en el archivo `.env`

### 4️⃣ Configurar en el proyecto

1. Crea un archivo llamado `config.env` en la carpeta `backend/` (si no existe)
2. Copia el contenido de `config.env.example`
3. Reemplaza los valores:

```env
GMAIL_USER=kennethprado140494@gmail.com
GMAIL_APP_PASSWORD=tu_contraseña_de_16_caracteres
```

**Ejemplo real:**
```env
GMAIL_USER=kennethprado140494@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
```

### 5️⃣ Verificar configuración

1. Reinicia el servidor backend
2. Deberías ver en la consola:
   ```
   ✅ Servicio de correo configurado correctamente
   ```

3. Si ves un error, verifica:
   - ✅ Que la contraseña sea correcta (16 caracteres)
   - ✅ Que el correo sea correcto
   - ✅ Que la verificación en dos pasos esté activada
   - ✅ Que el archivo `config.env` esté en la carpeta `backend/`

### 6️⃣ Probar el envío de correos

Para probar que funciona, puedes:
- Crear una parcela y bajar su humedad a menos del 20%
- El sistema automáticamente enviará un correo a tu cuenta

## 🔒 Seguridad

- ⚠️ **NUNCA** compartas tu contraseña de aplicación
- ⚠️ **NUNCA** subas el archivo `config.env` a GitHub
- ✅ El archivo `config.env` ya está en `.gitignore`
- ✅ Solo comparte `config.env.example` (sin datos reales)

## ❓ Preguntas frecuentes

### ¿Por qué no puedo usar mi contraseña normal de Gmail?

Google desactivó el acceso de aplicaciones menos seguras. Ahora debes usar contraseñas de aplicación para mayor seguridad.

### ¿Puedo revocar la contraseña de aplicación?

Sí, en cualquier momento desde https://myaccount.google.com/apppasswords

### ¿Cuántos correos puedo enviar?

Gmail permite hasta 500 correos por día con cuentas gratuitas.

### Los correos llegan a spam, ¿qué hago?

1. Marca el correo como "No es spam"
2. Agrega el correo del sistema a tus contactos
3. Esto mejorará la entrega futura

## 📝 Notas adicionales

- El correo configurado: `kennethprado140494@gmail.com`
- El sistema verifica parcelas cada 2 minutos
- Solo envía alertas si la humedad es menor al 20%
- Los usuarios deben tener correo registrado en la base de datos

## ✅ Checklist de configuración

- [ ] Verificación en dos pasos activada
- [ ] Contraseña de aplicación generada
- [ ] Archivo `config.env` creado
- [ ] Variables `GMAIL_USER` y `GMAIL_APP_PASSWORD` configuradas
- [ ] Servidor reiniciado
- [ ] Mensaje de confirmación en consola

---

**🌾 Sistema de Riego Inteligente AgroIrrigate**
**🇬🇹 Guatemala**


