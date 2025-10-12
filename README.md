# 🌱 Sistema de Riego Inteligente - AgroIrrigate

## Sistema de Gestión de Cultivos de Tomate con Alertas SMS y Sensores IoT

---

## ✅ Características Principales

### **📱 Alertas SMS Automáticas**
- Monitor automático cada 2 minutos
- SMS cuando humedad < 20%
- Twilio integrado
- Mensajes personalizados en español

### **👥 Multi-Usuario**
- Registro con teléfono incluido
- Cada usuario ve solo sus parcelas
- Privacidad y seguridad garantizada
- Sistema multi-tenant

### **🗺️ Diseñador de Mapas**
- Crear mapas de parcelas visualmente
- Posicionar parcelas arrastrando
- Guardar en base de datos
- Parcelas aparecen automáticamente en Dashboard

### **📡 Sensores IoT Simulados**
- Soil Moisture Sensor por parcela
- 3 niveles: Estable / Media / Baja
- Actualización en tiempo real (cada 5 seg)
- Visualización profesional

### **🎯 Filtrado Inteligente**
- Selector de mapas en Dashboard
- Ver todas las parcelas o filtrar por mapa
- Actualización automática

---

## 🚀 Inicio Rápido

### **1. Iniciar Backend:**
```bash
cd backend
npm install
npm start
```

### **2. Iniciar Frontend:**
```bash
cd frontend
npm install --legacy-peer-deps
npm start
```

### **3. Acceder:**
```
Frontend: http://localhost:3000
Backend: http://localhost:4000
```

---

## ⚙️ Configuración

### **Base de Datos (PostgreSQL)**

Ejecutar migraciones:
```bash
cd backend
node scripts/run_migration.js          # Columna telefono
node scripts/run_sensors_migration.js  # Tabla sensors
node scripts/run_maps_migration.js     # Tablas maps y map_parcels
```

### **Twilio (SMS)**

Editar `backend/config.env`:
```env
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+12293748189
```

**Limitaciones cuenta Trial:**
- Máximo 9 SMS/día
- Solo números verificados
- Actualiza a cuenta de pago para uso ilimitado

---

## 📊 Estructura del Proyecto

### **Backend:**
```
backend/
├── controllers/
│   ├── authController.js      # Login/Registro
│   ├── parcelController.js    # Parcelas
│   ├── alertController.js     # Alertas SMS
│   ├── sensorController.js    # Sensores IoT
│   └── mapController.js        # Mapas
├── services/
│   ├── smsService.js          # Twilio
│   └── alertMonitor.js        # Monitor automático
├── routes/                     # API endpoints
├── migrations/                 # SQL scripts
└── config.env                  # Credenciales
```

### **Frontend:**
```
frontend/
├── src/
│   ├── components/
│   │   ├── Login.js           # Login/Registro con teléfono
│   │   ├── MapDesigner.js     # Diseñar mapas
│   │   ├── MapViewer.js       # Ver mapas guardados
│   │   ├── WaterSaturationMap.js # Ver sensores
│   │   └── ProgramarRiego.js  # Programar riego
│   └── pages/
│       └── Dashboard.js       # Dashboard principal
```

---

## 🔄 Flujo de Trabajo

### **1. Registro:**
```
Usuario completa formulario
├─ Nombre, email, contraseña
├─ Teléfono (+502XXXXXXXX)
└─ Sistema guarda en BD
```

### **2. Diseñar Mapa:**
```
Dashboard → "Diseñar Mapa"
├─ Agregar parcelas
├─ Posicionar en mapa
├─ Guardar
└─ Sistema crea:
    ├─ Parcelas en BD
    ├─ Sensores automáticos
    └─ Posiciones guardadas
```

### **3. Dashboard:**
```
Selector de Mapas
├─ "Todas las parcelas" → Todas
├─ "Cuadra 1" → Solo 2 parcelas
└─ "Cuadra 2" → Solo 3 parcelas

Funciones disponibles:
├─ Detectar Humedad
├─ Regar según humedad
├─ Programar Riego
└─ Ver Saturación (sensores)
```

### **4. Alertas Automáticas:**
```
Monitor cada 2 minutos
├─ Detecta humedad < 20%
├─ Identifica usuario con teléfono
└─ Envía SMS automáticamente
```

---

## 📱 Formato de Teléfono

**Guatemala (+502):**
- ✅ Correcto: `+50212345678`
- ❌ Incorrecto: `12345678` o `50212345678`

---

## 🗄️ Base de Datos

### **Tablas Principales:**
- `usuarios` - Usuarios con teléfono
- `parcels` - Parcelas de cultivo
- `sensors` - Sensores IoT
- `maps` - Mapas de diseño
- `map_parcels` - Posiciones en mapas

---

## 📡 API Endpoints

### **Autenticación:**
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login

### **Parcelas:**
- `GET /api/parcels` - Obtener parcelas del usuario
- `POST /api/parcels` - Crear parcela
- `DELETE /api/parcels/:id` - Eliminar parcela

### **Sensores:**
- `GET /api/sensors` - Obtener sensores
- `POST /api/sensors/update-connectivity` - Actualizar conectividad

### **Mapas:**
- `GET /api/maps` - Listar mapas
- `POST /api/maps` - Guardar mapa
- `GET /api/maps/:id` - Ver mapa específico
- `DELETE /api/maps/:id` - Eliminar mapa

### **Alertas:**
- `GET /api/alerts/phone/:userId` - Obtener teléfono
- `PUT /api/alerts/phone/:userId` - Actualizar teléfono

---

## 🎯 Estado del Sistema

| Característica | Estado |
|----------------|--------|
| Alertas SMS | ✅ Funcionando |
| Monitor automático | ✅ Cada 2 minutos |
| Multi-usuario | ✅ Implementado |
| Sensores IoT | ✅ Tiempo real |
| Diseño de mapas | ✅ Integrado |
| Filtrado por mapa | ✅ Disponible |

---

## 💡 Notas Importantes

### **Cuenta Trial de Twilio:**
- Límite: 9 SMS/día
- Se reinicia cada 24 horas
- Para producción: actualizar a cuenta de pago

### **Sensores:**
- Simulados por software
- Conectividad aleatoria
- Actualización cada 5 segundos
- Para sensores reales: integrar hardware

---

## 🆘 Soporte

### **Verificar Sistema:**
```bash
# Backend
curl http://localhost:4000/

# Logs del monitor
# Ver consola del backend
```

### **Problemas Comunes:**

1. **No recibo SMS:**
   - Verificar número en Twilio
   - Revisar créditos de cuenta
   - Esperar 1-5 minutos (demora del operador)

2. **No veo parcelas:**
   - Verificar que estás logueado
   - Refrescar navegador
   - Revisar filtro de mapas

3. **Sensores no se actualizan:**
   - Esperar 5 segundos
   - Verificar conexión a internet
   - Refrescar página

---

## 📦 Dependencias Principales

### **Backend:**
- Express.js
- PostgreSQL (pg)
- Twilio
- JWT
- bcryptjs

### **Frontend:**
- React 19
- React Router
- Font Awesome
- Socket.io-client

---

## 🎉 Sistema Completado

**Estado:** 100% Funcional

**Funcionalidades:**
- ✅ Registro/Login con teléfono
- ✅ Diseño de mapas interactivo
- ✅ Sensores en tiempo real
- ✅ Alertas SMS automáticas
- ✅ Multi-usuario
- ✅ Filtrado por mapa
- ✅ Programación de riego
- ✅ Detección de humedad

---

**🌱 Desarrollado para el cultivo inteligente de tomate en Guatemala 🇬🇹**
