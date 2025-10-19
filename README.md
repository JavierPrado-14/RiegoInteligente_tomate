# 🌱 Sistema de Riego Inteligente - AgroIrrigate

## Sistema de Gestión de Cultivos de Tomate con Alertas por Correo Electrónico y Sensores IoT

Sistema web completo para la gestión inteligente de cultivos de tomate en Guatemala. Incluye monitoreo en tiempo real de humedad del suelo, alertas automáticas, programación de riego, gestión de parcelas con mapas interactivos, galería de imágenes y análisis de consumo de agua.

---

## 📋 Índice

- [Características Principales](#características-principales)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Instalación y Configuración](#instalación-y-configuración)
- [Funcionalidades Detalladas](#funcionalidades-detalladas)
- [API Endpoints](#api-endpoints)
- [Base de Datos](#base-de-datos)
- [Flujos de Trabajo](#flujos-de-trabajo)
- [Solución de Problemas](#solución-de-problemas)

---

## ✅ Características Principales

### **🔐 Autenticación y Gestión de Usuarios**
- Sistema completo de registro e inicio de sesión
- Autenticación mediante JWT (JSON Web Tokens)
- Roles de usuario (Administrador y Usuario)
- Gestión de perfiles con correo electrónico y teléfono
- Protección de rutas y endpoints
- Panel de administración de usuarios (solo admins)

### **📧 Alertas Automáticas por Correo Electrónico**
- Monitor automático cada 2 minutos
- Correo electrónico cuando humedad < 20%
- Servicio de Gmail integrado (nodemailer)
- Mensajes HTML profesionales con diseño responsive
- Prevención de spam (1 alerta por parcela cada 24 horas)
- Agrupación de alertas por usuario (varias parcelas en un solo correo)
- Historial de alertas enviadas

### **🗺️ Diseñador de Mapas Interactivo**
- Crear mapas de parcelas visualmente
- Interfaz drag-and-drop para posicionar parcelas
- Diseño personalizable (tamaño y posición)
- Guardar múltiples mapas por usuario
- Visualización de mapas guardados
- Filtrado de parcelas por mapa en Dashboard
- Eliminación de mapas con todas sus parcelas asociadas

### **🌾 Gestión Completa de Parcelas**
- Crear, editar y eliminar parcelas
- Asignación automática de sensores a cada parcela
- Monitoreo de humedad en tiempo real
- Visualización individual de cada parcela
- Galería de imágenes por parcela
- Historial de lecturas de humedad
- Filtrado por mapa

### **📡 Sensores IoT Simulados**
- Sensor de humedad del suelo por parcela
- 3 niveles de conectividad: Estable / Media / Baja
- Actualización en tiempo real (cada 5 segundos)
- Medición de fuerza de señal (0-100%)
- Registro de última lectura con timestamp
- Visualización profesional con indicadores de estado
- Mapa de saturación de agua con escala de colores

### **💧 Sistema de Riego Inteligente**
- Detección automática de humedad
- Riego manual según nivel de humedad detectado
- Programación de riego (fecha, hora inicio, hora fin)
- Historial de programaciones de riego
- Filtrado por fechas
- Cálculo de consumo de agua
- Estadísticas de uso por parcela

### **📸 Galería de Imágenes por Parcela**
- Subida de imágenes para cada parcela
- Almacenamiento local de archivos
- Descripción opcional para cada imagen
- Visualización en galería con modal
- Eliminación de imágenes
- Formatos soportados: JPEG, PNG, GIF, WEBP
- Límite de tamaño: 5MB por imagen

### **📊 Reportes y Análisis**
- Consumo de agua por parcela
- Gráficos de consumo diario
- Filtrado por rango de fechas
- Historial de lecturas de humedad
- Estadísticas de riego
- Exportación de datos

### **👥 Sistema Multi-Usuario**
- Cada usuario ve solo sus propias parcelas
- Privacidad y seguridad garantizada
- Sistema multi-tenant
- Gestión de usuarios por administrador
- Actualización de perfiles

---

## 🚀 Inicio Rápido

### **Requisitos Previos**
- Node.js (v14 o superior)
- PostgreSQL (v12 o superior)
- Cuenta de Gmail con contraseña de aplicación configurada
- npm o yarn

### **1. Clonar el Repositorio:**
```bash
git clone <repository-url>
cd RiegoInteligente_tomate
```

### **2. Configurar Base de Datos:**
```bash
# Crear base de datos PostgreSQL
psql -U postgres
CREATE DATABASE agroirrigate;
\q
```

### **3. Configurar Backend:**
```bash
cd backend
npm install

# Copiar archivo de configuración de ejemplo
cp config.env.example config.env

# Editar config.env con tus credenciales
# GMAIL_USER=tu_correo@gmail.com
# GMAIL_APP_PASSWORD=tu_contraseña_de_aplicación
# DB_PASSWORD=tu_contraseña_de_postgres
```

### **4. Probar Servicio de Correo (Opcional):**
```bash
node test-email.js
```

### **5. Iniciar Backend:**
```bash
node server.js
# o con nodemon para desarrollo:
npx nodemon server.js
```

### **6. Configurar e Iniciar Frontend:**
```bash
cd ../frontend
npm install --legacy-peer-deps
npm start
```

### **7. Acceder a la Aplicación:**
```
Frontend: http://localhost:3000
Backend API: http://localhost:4000
```

### **8. Crear Primer Usuario:**
- Acceder a http://localhost:3000
- Click en "Registrarse"
- Completar formulario con:
  - Nombre de usuario
  - Correo electrónico
  - Contraseña
  - Teléfono (formato: +502XXXXXXXX para Guatemala)

---

## 🛠️ Tecnologías Utilizadas

### **Backend:**
- **Node.js** - Entorno de ejecución JavaScript
- **Express.js** - Framework web para Node.js
- **PostgreSQL** - Base de datos relacional
- **pg** - Cliente PostgreSQL para Node.js
- **JWT (jsonwebtoken)** - Autenticación y autorización
- **bcryptjs** - Encriptación de contraseñas
- **nodemailer** - Servicio de envío de correos electrónicos
- **Socket.io** - Comunicación en tiempo real
- **Multer** - Manejo de archivos (subida de imágenes)
- **dotenv** - Gestión de variables de entorno
- **CORS** - Habilitación de Cross-Origin Resource Sharing

### **Frontend:**
- **React 19** - Biblioteca de interfaz de usuario
- **React Router DOM** - Enrutamiento para React
- **Font Awesome** - Iconos
- **D3 Scale** - Escalas para visualización de datos
- **React Heatmap Grid** - Mapas de calor para saturación de agua
- **React Tooltip** - Tooltips informativos
- **CSS3** - Estilos y animaciones

### **DevOps y Herramientas:**
- **Git** - Control de versiones
- **nodemon** - Reinicio automático del servidor en desarrollo

---

## 🏗️ Arquitectura del Sistema

### **Estructura del Proyecto:**
```
RiegoInteligente_tomate/
│
├── backend/
│   ├── config/
│   │   └── sqlConfig.js          # Configuración de PostgreSQL
│   ├── controllers/
│   │   ├── authController.js     # Autenticación y registro
│   │   ├── parcelController.js   # Gestión de parcelas
│   │   ├── sensorController.js   # Gestión de sensores IoT
│   │   ├── mapController.js      # Diseñador de mapas
│   │   ├── imageController.js    # Galería de imágenes
│   │   ├── alertController.js    # Sistema de alertas
│   │   ├── humedadController.js  # Lecturas de humedad
│   │   ├── regarController.js    # Programación de riego
│   │   ├── aguaController.js     # Consumo de agua
│   │   └── userController.js     # Gestión de usuarios
│   ├── middleware/
│   │   └── auth.js               # Middleware de autenticación JWT
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── parcelRoutes.js
│   │   ├── sensorRoutes.js
│   │   ├── mapRoutes.js
│   │   ├── imageRoutes.js
│   │   ├── alertRoutes.js
│   │   ├── humedadRoutes.js
│   │   ├── riegoRoutes.js
│   │   ├── aguaRoutes.js
│   │   └── userRoutes.js
│   ├── services/
│   │   ├── emailService.js       # Servicio de correos (Gmail)
│   │   └── alertMonitor.js       # Monitor automático de alertas
│   ├── utils/
│   │   └── timeHelper.js         # Manejo de zona horaria (Guatemala)
│   ├── uploads/
│   │   └── parcels/              # Imágenes de parcelas
│   ├── migrations/               # Scripts SQL para migraciones
│   ├── config.env                # Variables de entorno (no en Git)
│   ├── config.env.example        # Ejemplo de configuración
│   ├── server.js                 # Punto de entrada del servidor
│   ├── test-email.js             # Script de prueba de correo
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   │   └── images/           # Imágenes del proyecto
│   │   ├── components/
│   │   │   ├── Login.js          # Login y registro
│   │   │   ├── MapDesigner.js    # Diseñador de mapas
│   │   │   ├── MapViewer.js      # Visualizador de mapas
│   │   │   ├── ParcelMap.js      # Mapa visual de parcelas
│   │   │   ├── WaterSaturationMap.js  # Mapa de saturación
│   │   │   ├── ProgramarRiego.js # Programación de riego
│   │   │   ├── ParcelImagesModal.js   # Galería de imágenes
│   │   │   ├── AdminParcelModal.js    # Admin de parcelas
│   │   │   ├── AdminUsersModal.js     # Admin de usuarios
│   │   │   ├── AdminReportsModal.js   # Reportes y análisis
│   │   │   └── AdminMapDesignModal.js # Admin de mapas
│   │   ├── pages/
│   │   │   └── Dashboard.js      # Dashboard principal
│   │   ├── App.js                # Componente principal
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
│
└── README.md
```

### **Flujo de Datos:**
```
Usuario → Frontend (React) → API REST (Express) → PostgreSQL
                                      ↓
                              Servicios de Alertas
                                      ↓
                              Gmail (nodemailer)
```

---

## ⚙️ Configuración Detallada

### **1. Configuración de Gmail para Alertas**

Para enviar correos electrónicos automáticos, necesitas configurar una contraseña de aplicación de Gmail:

1. Ir a https://myaccount.google.com/
2. Activar **Verificación en 2 pasos** en Seguridad
3. Ir a **Contraseñas de aplicaciones**
4. Seleccionar **Correo** y **Otro dispositivo**
5. Nombre: `AgroIrrigate`
6. Copiar la contraseña de 16 caracteres generada

### **2. Archivo de Configuración (config.env)**

Crear archivo `backend/config.env` con el siguiente contenido:

```env
# Servicio de Correo Electrónico (Gmail)
GMAIL_USER=tu_correo@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx

# Base de Datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=agroirrigate
DB_USER=postgres
DB_PASSWORD=tu_contraseña

# Autenticación JWT
JWT_SECRET=clave_secreta_segura_aqui

# Configuración Regional (Guatemala)
COUNTRY_CODE=GT
DEFAULT_PHONE_PREFIX=+502
```

⚠️ **IMPORTANTE:** 
- Nunca subir `config.env` a Git (ya está en `.gitignore`)
- Usar contraseña de aplicación de Gmail, NO tu contraseña normal
- Cambiar `JWT_SECRET` por una clave segura y única

### **3. Base de Datos**

El sistema crea automáticamente el esquema y las tablas necesarias al iniciar. No es necesario ejecutar migraciones manualmente.

**Esquema:** `agroirrigate`

**Tablas creadas automáticamente:**
- `usuarios` - Información de usuarios
- `parcels` - Parcelas de cultivo
- `sensors` - Sensores IoT
- `maps` - Mapas de diseño
- `map_parcels` - Posiciones de parcelas en mapas
- `parcel_images` - Imágenes de parcelas
- `lecturashumedad` - Historial de lecturas de humedad
- `programacionriego` - Programaciones de riego
- `uso_agua` - Registro de consumo de agua
- `alert_history` - Historial de alertas enviadas

---

## 📚 Funcionalidades Detalladas

### **1. Autenticación y Usuarios**

#### Registro de Usuario
- Formulario con validación de campos
- Encriptación de contraseñas con bcryptjs
- Generación automática de token JWT
- Asignación de rol (1 = Usuario normal, 2 = Administrador)
- Validación de formato de correo electrónico
- Formato de teléfono para Guatemala (+502)

#### Inicio de Sesión
- Autenticación por correo y contraseña
- Generación de token JWT con expiración
- Almacenamiento seguro de token en localStorage
- Redirección automática al Dashboard
- Protección de rutas privadas

#### Gestión de Usuarios (Solo Administradores)
- Ver lista completa de usuarios
- Actualizar información de usuarios
- Cambiar roles y permisos
- Actualizar correos y teléfonos
- Eliminar usuarios (con precaución)

### **2. Gestión de Parcelas**

#### Crear Parcela
- Asignación automática al usuario autenticado
- Creación simultánea de sensor IoT asociado
- Valor inicial de humedad aleatorio (0-50%)
- Nombre personalizable
- Ubicación en mapa (si se crea desde diseñador)

#### Visualización de Parcelas
- Vista de lista con todas las parcelas del usuario
- Tarjetas informativas con datos clave
- Indicadores visuales de humedad (colores)
- Filtrado por mapa
- Selección de parcela para acciones

#### Actualización de Humedad
- Detección manual (botón "Detectar Humedad")
- Actualización automática cada 5 segundos en vista de saturación
- Registro de timestamp con hora de Guatemala
- Sincronización con sensor asociado
- Historial de lecturas

#### Galería de Imágenes por Parcela
- Subir múltiples imágenes por parcela
- Formatos: JPEG, PNG, GIF, WEBP
- Límite: 5MB por imagen
- Descripción opcional
- Vista de galería con modal ampliado
- Eliminación de imágenes

### **3. Sensores IoT**

#### Características de Sensores
- Sensor de humedad del suelo automático por parcela
- Tres niveles de conectividad:
  - **Estable:** 85-100% señal (verde)
  - **Media:** 50-85% señal (amarillo)
  - **Baja:** 20-50% señal (rojo)
- Simulación de cambios de conectividad en tiempo real
- Registro de última lectura con timestamp
- Nombre descriptivo automático

#### Visualización
- Mapa de saturación de agua con escala de colores
- Indicadores de estado de conectividad
- Información detallada por sensor
- Actualización automática cada 5 segundos

### **4. Diseñador de Mapas**

#### Crear Mapa
- Interfaz visual drag-and-drop
- Canvas interactivo para posicionar parcelas
- Agregar múltiples parcelas
- Redimensionar parcelas
- Asignar nombres únicos
- Guardar diseño completo

#### Funcionalidades del Diseñador
- Arrastrar parcelas en el canvas
- Visualización en tiempo real
- Creación automática de parcelas en BD
- Generación automática de sensores
- Guardado de posiciones (x, y, ancho, alto)

#### Gestión de Mapas
- Ver lista de mapas guardados
- Filtrar parcelas por mapa en Dashboard
- Visualizar diseño de mapa
- Eliminar mapa (elimina parcelas y sensores asociados)

### **5. Sistema de Riego**

#### Programación de Riego
- Seleccionar fecha futura
- Definir hora de inicio y fin
- Validación de horarios (fin > inicio)
- Asociar a parcela específica
- Guardado en base de datos
- Historial de programaciones

#### Riego Manual
- Botón "Regar" en cada parcela
- Incremento de humedad según estado actual
- Cálculo automático de litros de agua usados
- Registro en historial de uso de agua
- Actualización en tiempo real

#### Detección de Humedad
- Botón "Detectar Humedad"
- Simulación de lectura de sensor
- Actualización de valor en BD
- Registro de lectura con timestamp
- Visualización inmediata en interfaz

### **6. Sistema de Alertas**

#### Monitor Automático
- Ejecución cada 2 minutos (configurable)
- Verifica parcelas con humedad < 20%
- Agrupa parcelas por usuario
- Prevención de spam (1 alerta por parcela cada 24 horas)
- Registro en historial de alertas

#### Correos Electrónicos
- Diseño HTML responsive profesional
- Información detallada de la parcela
- Nivel de humedad actual con indicador visual
- Recomendaciones de riego
- Múltiples parcelas en un solo correo si aplica
- Asunto personalizado por usuario

#### Alertas Manuales
- Envío manual de alertas para parcelas específicas
- Personalización de mensaje
- Verificación de correo del usuario

### **7. Reportes y Análisis**

#### Consumo de Agua
- Registro de cada riego
- Cálculo automático de litros por parcela
- Gráficos de consumo diario
- Filtrado por rango de fechas
- Exportación de datos

#### Historial de Riego
- Ver programaciones pasadas y futuras
- Filtrado por fecha
- Información detallada (fecha, hora, parcela)
- Ordenamiento cronológico

#### Lecturas de Humedad
- Historial completo de lecturas
- Gráficos de tendencias
- Filtrado por parcela
- Filtrado por fecha
- Análisis de patrones

---

## 📡 API Endpoints

### **Autenticación** (`/api/auth`)
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/register` | Registrar nuevo usuario | No |
| POST | `/login` | Iniciar sesión | No |

**Ejemplo de Registro:**
```json
POST /api/auth/register
{
  "nombre_usuario": "Juan Pérez",
  "correo": "juan@example.com",
  "contrasena": "password123",
  "telefono": "+50212345678"
}
```

### **Parcelas** (`/api/parcels`)
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/` | Obtener parcelas del usuario | Requerida (JWT) |
| POST | `/` | Crear nueva parcela | Requerida (JWT) |
| PUT | `/:id/humidity` | Actualizar humedad de parcela | Requerida (JWT) |
| DELETE | `/:id` | Eliminar parcela | Requerida (JWT) |

**Ejemplo de Creación:**
```json
POST /api/parcels
Headers: { "Authorization": "Bearer <token>" }
{
  "name": "Parcela Norte"
}
```

### **Sensores IoT** (`/api/sensors`)
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/` | Obtener sensores del usuario | Requerida (JWT) |
| POST | `/` | Crear sensor para parcela | Requerida (JWT) |
| POST | `/update-connectivity` | Actualizar conectividad (simulación) | Requerida (JWT) |

### **Mapas** (`/api/maps`)
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/` | Listar mapas del usuario | Requerida (JWT) |
| POST | `/` | Guardar nuevo mapa con parcelas | Requerida (JWT) |
| GET | `/:id` | Obtener mapa específico con parcelas | Requerida (JWT) |
| DELETE | `/:id` | Eliminar mapa y parcelas asociadas | Requerida (JWT) |

**Ejemplo de Guardar Mapa:**
```json
POST /api/maps
Headers: { "Authorization": "Bearer <token>" }
{
  "mapName": "Cuadra 1",
  "parcels": [
    {
      "name": "Parcela A",
      "x": 100,
      "y": 50,
      "width": 150,
      "height": 100,
      "humidity": 45
    }
  ]
}
```

### **Imágenes** (`/api/images`)
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/upload/:parcelId` | Subir imagen para parcela | Requerida (JWT) |
| GET | `/parcel/:parcelId` | Obtener imágenes de parcela | Requerida (JWT) |
| DELETE | `/:imageId` | Eliminar imagen | Requerida (JWT) |

**Ejemplo de Subida:**
```
POST /api/images/upload/5
Headers: { "Authorization": "Bearer <token>" }
Content-Type: multipart/form-data
Body: 
  - image: [archivo]
  - description: "Foto del cultivo"
```

### **Alertas** (`/api/alerts`)
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/check` | Verificar y enviar alertas de parcelas secas | Requerida (JWT) |
| POST | `/manual/:parcelaId` | Enviar alerta manual | Requerida (JWT) |
| GET | `/phone/:userId` | Obtener correo y teléfono de usuario | Requerida (JWT) |
| PUT | `/phone/:userId` | Actualizar correo electrónico | Requerida (JWT) |

### **Humedad** (`/api/humedad`)
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/registrar` | Registrar lectura de humedad | Requerida (JWT) |

**Ejemplo:**
```json
POST /api/humedad/registrar
Headers: { "Authorization": "Bearer <token>" }
{
  "lectura": 35,
  "fecha": "2025-10-19T10:30:00",
  "ubicacion": "Parcela Norte",
  "parcelaId": 5
}
```

### **Riego** (`/api/riego`)
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/programar` | Programar riego | Requerida (JWT) |
| GET | `/historial` | Obtener historial de riego | Requerida (JWT) |

**Ejemplo de Programación:**
```json
POST /api/riego/programar
Headers: { "Authorization": "Bearer <token>" }
{
  "fecha": "2025-10-20",
  "horaInicio": "06:00",
  "horaFin": "08:00",
  "parcela": "Parcela Norte"
}
```

### **Consumo de Agua** (`/api/agua`)
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/registrar` | Registrar consumo de agua | Requerida (JWT) |
| GET | `/consumo` | Obtener consumo con filtros | Requerida (JWT) |

**Ejemplo de Consulta:**
```
GET /api/agua/consumo?fechaInicio=2025-10-01&fechaFin=2025-10-31
Headers: { "Authorization": "Bearer <token>" }
```

### **Usuarios** (`/api/users`)
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/` | Obtener todos los usuarios | Requerida (JWT - Admin) |
| PUT | `/:id` | Actualizar usuario | Requerida (JWT - Admin) |
| DELETE | `/:id` | Eliminar usuario | Requerida (JWT - Admin) |

---

## 🗄️ Base de Datos - Esquema Detallado

### **Esquema: agroirrigate**

#### Tabla: `usuarios`
```sql
CREATE TABLE agroirrigate.usuarios (
  id SERIAL PRIMARY KEY,
  nombre_usuario VARCHAR(255) NOT NULL,
  correo VARCHAR(255) UNIQUE NOT NULL,
  contrasena VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  rol INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
- **Campos clave:**
  - `id`: Identificador único
  - `rol`: 1 = Usuario, 2 = Administrador
  - `correo`: Para alertas automáticas
  - `telefono`: Formato +502XXXXXXXX

#### Tabla: `parcels`
```sql
CREATE TABLE agroirrigate.parcels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  user_id INTEGER NOT NULL REFERENCES usuarios(id),
  humidity INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabla: `sensors`
```sql
CREATE TABLE agroirrigate.sensors (
  id SERIAL PRIMARY KEY,
  parcel_id INTEGER REFERENCES parcels(id) ON DELETE CASCADE,
  sensor_name VARCHAR(255),
  connectivity_status VARCHAR(20) DEFAULT 'stable',
  signal_strength INTEGER DEFAULT 100,
  last_reading TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
- **connectivity_status:** 'stable', 'medium', 'low'
- **signal_strength:** 0-100%

#### Tabla: `maps`
```sql
CREATE TABLE agroirrigate.maps (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES usuarios(id),
  map_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabla: `map_parcels`
```sql
CREATE TABLE agroirrigate.map_parcels (
  id SERIAL PRIMARY KEY,
  map_id INTEGER REFERENCES maps(id) ON DELETE CASCADE,
  parcel_id INTEGER REFERENCES parcels(id) ON DELETE CASCADE,
  position_x INTEGER,
  position_y INTEGER,
  width INTEGER,
  height INTEGER
);
```

#### Tabla: `parcel_images`
```sql
CREATE TABLE agroirrigate.parcel_images (
  id SERIAL PRIMARY KEY,
  parcel_id INTEGER REFERENCES parcels(id) ON DELETE CASCADE,
  image_url VARCHAR(500),
  image_name VARCHAR(255),
  description TEXT,
  file_size INTEGER,
  mime_type VARCHAR(100),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabla: `lecturashumedad`
```sql
CREATE TABLE agroirrigate.lecturashumedad (
  id SERIAL PRIMARY KEY,
  lectura INTEGER NOT NULL,
  fecha TIMESTAMP NOT NULL,
  ubicacion VARCHAR(100) NOT NULL,
  parcela_id INTEGER REFERENCES parcels(id)
);
```

#### Tabla: `programacionriego`
```sql
CREATE TABLE agroirrigate.programacionriego (
  id SERIAL PRIMARY KEY,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  parcela VARCHAR(255) NOT NULL
);
```

#### Tabla: `uso_agua`
```sql
CREATE TABLE agroirrigate.uso_agua (
  id SERIAL PRIMARY KEY,
  parcela_id INTEGER NOT NULL,
  parcela_nombre VARCHAR(255) NOT NULL,
  litros NUMERIC(10,2) NOT NULL,
  fecha TIMESTAMP NOT NULL
);
```

#### Tabla: `alert_history`
```sql
CREATE TABLE agroirrigate.alert_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  parcel_id INTEGER NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  humidity_level INTEGER NOT NULL
);
```

---

## 🔄 Flujos de Trabajo del Usuario

### **1. Flujo de Registro y Login**
```
┌─────────────────┐
│ Pantalla Login  │
└────────┬────────┘
         │
    ┌────▼────┐
    │Register?│
    └─┬────┬──┘
  No │    │ Yes
     │    │
     │    └──► Formulario Registro
     │           ├─ Nombre
     │           ├─ Correo
     │           ├─ Contraseña
     │           └─ Teléfono
     │              │
     │              ▼
     │         Crear Usuario
     │         (Hash password)
     │              │
     └──────────────┤
                    ▼
              Generar JWT Token
                    │
                    ▼
              Guardar en localStorage
                    │
                    ▼
             Redirigir a Dashboard
```

### **2. Flujo de Creación de Parcelas con Mapa**
```
Dashboard
    │
    └─► Click "Diseñar Mapa"
           │
           ▼
    MapDesigner Modal
           │
           ├─► Agregar Parcela
           │   ├─ Ingresar nombre
           │   └─ Parcela aparece en canvas
           │
           ├─► Posicionar Parcela
           │   └─ Drag & Drop
           │
           ├─► Ajustar Tamaño
           │   └─ Resize en canvas
           │
           └─► Click "Guardar Mapa"
               │
               ▼
        POST /api/maps
               │
               ├─► Crear entrada en 'maps'
               ├─► Crear parcelas en 'parcels'
               ├─► Guardar posiciones en 'map_parcels'
               └─► Crear sensores en 'sensors'
                   │
                   ▼
            Parcelas disponibles
              en Dashboard
```

### **3. Flujo de Detección y Riego**
```
Dashboard
    │
    └─► Seleccionar Parcela
           │
           ├─► Click "Detectar Humedad"
           │      │
           │      ▼
           │   GET sensor reading
           │      │
           │      ▼
           │   POST /api/humedad/registrar
           │      │
           │      ▼
           │   PUT /api/parcels/:id/humidity
           │      │
           │      ▼
           │   Actualizar UI con nuevo %
           │
           ├─► Click "Regar"
           │      │
           │      ▼
           │   Calcular agua necesaria
           │   (basado en humedad actual)
           │      │
           │      ▼
           │   PUT /api/parcels/:id/humidity
           │   (aumentar humedad)
           │      │
           │      ▼
           │   POST /api/agua/registrar
           │   (guardar consumo)
           │      │
           │      ▼
           │   Actualizar UI
           │
           └─► Click "Programar Riego"
                  │
                  ▼
               Modal con formulario
                  │
                  ├─ Fecha
                  ├─ Hora Inicio
                  └─ Hora Fin
                     │
                     ▼
              POST /api/riego/programar
                     │
                     ▼
               Guardado en BD
```

### **4. Flujo de Alertas Automáticas**
```
Backend Server Start
        │
        ▼
startAlertMonitor()
        │
        ├─► Verificación inicial
        │
        └─► setInterval (cada 2 minutos)
               │
               ▼
        checkAndSendDryParcelAlertsInternal()
               │
               ▼
        SELECT parcelas WHERE humidity < 20%
        AND correo IS NOT NULL
        AND NOT EXISTS (alerta en últimas 24h)
               │
               ▼
        Agrupar por usuario
               │
               ├─► Usuario 1: [Parcela A (15%), Parcela B (18%)]
               ├─► Usuario 2: [Parcela C (12%)]
               └─► Usuario 3: [Parcela D (19%)]
                     │
                     ▼
              Para cada usuario:
                     │
                     ▼
            sendDryParcelAlert()
              o sendCustomEmail()
                     │
                     ├─► Crear HTML profesional
                     ├─► nodemailer → Gmail
                     └─► Registrar en alert_history
                           │
                           ▼
                    Usuario recibe correo
```

### **5. Flujo de Galería de Imágenes**
```
Dashboard → Seleccionar Parcela
              │
              └─► Click "Ver Galería"
                     │
                     ▼
              ParcelImagesModal
                     │
                     ├─► Mostrar imágenes existentes
                     │   (GET /api/images/parcel/:id)
                     │
                     ├─► Click "Subir Imagen"
                     │      │
                     │      ▼
                     │   Seleccionar archivo
                     │      │
                     │      ▼
                     │   POST /api/images/upload/:parcelId
                     │   (multipart/form-data)
                     │      │
                     │      ▼
                     │   Multer guarda en /uploads/parcels/
                     │      │
                     │      ▼
                     │   Registrar en BD
                     │      │
                     │      ▼
                     │   Actualizar galería
                     │
                     └─► Click en imagen
                            │
                            ▼
                         Modal ampliado
                            │
                            └─► Opción eliminar
                                   │
                                   ▼
                            DELETE /api/images/:id
                                   │
                                   ▼
                            Eliminar archivo físico
                                   │
                                   ▼
                            Eliminar de BD
```

---

## 🎯 Estado Actual del Sistema

| Módulo | Característica | Estado |
|--------|----------------|--------|
| **Autenticación** | Registro de usuarios | ✅ Completo |
| | Login con JWT | ✅ Completo |
| | Protección de rutas | ✅ Completo |
| | Roles de usuario | ✅ Completo |
| **Parcelas** | Crear/Eliminar parcelas | ✅ Completo |
| | Actualizar humedad | ✅ Completo |
| | Galería de imágenes | ✅ Completo |
| | Filtrado por mapa | ✅ Completo |
| **Sensores** | Creación automática | ✅ Completo |
| | Simulación IoT | ✅ Completo |
| | Mapa de saturación | ✅ Completo |
| | Actualización en tiempo real | ✅ Completo |
| **Mapas** | Diseñador visual | ✅ Completo |
| | Drag & Drop | ✅ Completo |
| | Múltiples mapas | ✅ Completo |
| | Eliminación en cascada | ✅ Completo |
| **Riego** | Detección de humedad | ✅ Completo |
| | Riego manual | ✅ Completo |
| | Programación de riego | ✅ Completo |
| | Historial de riego | ✅ Completo |
| **Alertas** | Monitor automático (2 min) | ✅ Completo |
| | Correos HTML | ✅ Completo |
| | Prevención de spam | ✅ Completo |
| | Agrupación por usuario | ✅ Completo |
| **Reportes** | Consumo de agua | ✅ Completo |
| | Historial de humedad | ✅ Completo |
| | Filtros por fecha | ✅ Completo |
| **Administración** | Gestión de usuarios | ✅ Completo |
| | Reportes avanzados | ✅ Completo |

---

## 💡 Notas Importantes

### **Sistema de Alertas por Correo Electrónico**
- **Ventajas:**
  - ✅ Completamente GRATIS (vs SMS pagados)
  - ✅ 500 correos/día con cuenta Gmail gratuita
  - ✅ Diseño HTML profesional y personalizable
  - ✅ Sin límites de números verificados
  - ✅ Fácil configuración (solo contraseña de aplicación)

- **Limitaciones:**
  - Requiere verificación en 2 pasos de Gmail
  - Posible demora de 1-2 minutos en entrega
  - Algunos proveedores pueden marcar como spam inicialmente

### **Sensores IoT**
- Actualmente simulados por software
- Conectividad aleatoria para simular condiciones reales
- Actualización cada 5 segundos
- Para integrar sensores reales:
  - Usar ESP32/Arduino con sensor de humedad
  - Conectar vía WiFi al backend
  - Implementar endpoint para recibir lecturas

### **Zona Horaria**
- Sistema configurado para Guatemala (GMT-6)
- Timestamps con hora local en lecturas y alertas
- Conversión automática en `utils/timeHelper.js`

### **Seguridad**
- Contraseñas encriptadas con bcryptjs
- Tokens JWT con expiración
- Middleware de autenticación en todas las rutas protegidas
- Validación de permisos por usuario
- Archivo `config.env` excluido de Git

---

## 🆘 Solución de Problemas

### **1. No se pueden enviar correos**
**Síntomas:** Error "Error en configuración de correo"

**Soluciones:**
```bash
# 1. Verificar archivo config.env
cat backend/config.env

# 2. Probar servicio de correo
cd backend
node test-email.js

# 3. Verificar credenciales de Gmail
# - Verificación en 2 pasos activada
# - Contraseña de aplicación (NO contraseña normal)
# - GMAIL_USER correcto
```

### **2. Error de conexión a base de datos**
**Síntomas:** "Error connecting to database"

**Soluciones:**
```bash
# 1. Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql
# o en Windows:
services.msc → PostgreSQL

# 2. Verificar credenciales en config.env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=agroirrigate
DB_USER=postgres
DB_PASSWORD=<tu_contraseña>

# 3. Crear base de datos si no existe
psql -U postgres
CREATE DATABASE agroirrigate;
\q
```

### **3. Error "Token inválido" o "Unauthorized"**
**Síntomas:** No se puede acceder al Dashboard

**Soluciones:**
```javascript
// 1. Limpiar localStorage
localStorage.clear();

// 2. Volver a hacer login

// 3. Verificar JWT_SECRET en config.env
// Debe ser el mismo en todas las instancias del servidor
```

### **4. Las parcelas no aparecen en el Dashboard**
**Soluciones:**
- Verificar que estás logueado correctamente
- Revisar selector de mapas (cambiar a "Todas las parcelas")
- Refrescar navegador (F5)
- Verificar en consola del navegador errores de API

### **5. Los sensores no se actualizan**
**Soluciones:**
- Esperar al menos 5 segundos
- Verificar conexión a internet
- Abrir consola del navegador para ver errores
- Verificar que el backend esté corriendo

### **6. Error al subir imágenes**
**Síntomas:** "Error al subir imagen"

**Soluciones:**
```bash
# 1. Verificar que existe la carpeta uploads/parcels
mkdir -p backend/uploads/parcels

# 2. Verificar permisos de escritura
chmod 755 backend/uploads/parcels

# 3. Verificar tamaño de imagen (máximo 5MB)

# 4. Verificar formato (JPEG, PNG, GIF, WEBP)
```

### **7. Frontend no se conecta al Backend**
**Síntomas:** Errores CORS o "Network Error"

**Soluciones:**
```bash
# 1. Verificar que el backend esté corriendo
curl http://localhost:4000/
# Debería devolver: {"message": "Servidor de AgroIrrigate funcionando..."}

# 2. Verificar proxy en frontend/package.json
"proxy": "http://localhost:4000"

# 3. Reiniciar ambos servidores
# Terminal 1:
cd backend && node server.js

# Terminal 2:
cd frontend && npm start
```

### **8. Error "Cannot find module"**
**Soluciones:**
```bash
# Backend
cd backend
rm -rf node_modules
npm install

# Frontend
cd frontend
rm -rf node_modules
npm install --legacy-peer-deps
```

---

## 📞 Recursos Adicionales

### **Documentación Interna**
- `backend/CONFIGURACION_GMAIL.md` - Configuración detallada de Gmail
- `backend/MIGRACION_SMS_A_EMAIL.md` - Documentación de migración
- `backend/INSTRUCCIONES_RAPIDAS.md` - Guía rápida de configuración
- `backend/config.env.example` - Ejemplo de configuración

### **APIs y Librerías Utilizadas**
- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [React Documentation](https://react.dev/)
- [JWT Documentation](https://jwt.io/)
- [Nodemailer Documentation](https://nodemailer.com/)

---

## 🎉 Sistema Completado - Estado 100% Funcional

### **Funcionalidades Implementadas:**
- ✅ Registro y autenticación de usuarios con JWT
- ✅ Gestión completa de parcelas (CRUD)
- ✅ Diseñador de mapas interactivo con drag & drop
- ✅ Sensores IoT simulados en tiempo real
- ✅ Sistema de alertas automáticas por correo electrónico
- ✅ Galería de imágenes por parcela
- ✅ Programación de riego con validaciones
- ✅ Detección y actualización de humedad
- ✅ Registro y análisis de consumo de agua
- ✅ Panel de administración de usuarios
- ✅ Reportes y gráficos de consumo
- ✅ Sistema multi-usuario con privacidad
- ✅ Filtrado de parcelas por mapa
- ✅ Historial de lecturas y alertas
- ✅ Protección de rutas y endpoints
- ✅ Manejo de zona horaria (Guatemala GMT-6)

### **Tecnologías Principales:**
- **Backend:** Node.js, Express.js, PostgreSQL, JWT, nodemailer
- **Frontend:** React 19, React Router, CSS3
- **DevOps:** Git, nodemon, dotenv

---

## 📊 Métricas del Proyecto

- **Total de Endpoints API:** 25+
- **Componentes React:** 15+
- **Tablas en Base de Datos:** 10
- **Controllers:** 10
- **Servicios:** 2 (Email, AlertMonitor)
- **Middleware:** 1 (Autenticación JWT)
- **Rutas Protegidas:** 90%

---

**🌱 Desarrollado para el cultivo inteligente de tomate en Guatemala 🇬🇹**

---

## 📄 Licencia

Este proyecto fue desarrollado como parte del Seminario de Tecnologías de Información.

---

## 👨‍💻 Autor

Javier Prado - Décimo Semestre
Seminario de Tecnologías de Información

---

*Última actualización: Octubre 2025*
