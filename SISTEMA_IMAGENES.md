# 📷 Sistema de Gestión de Imágenes por Parcela

## ✅ IMPLEMENTACIÓN COMPLETADA

Se ha implementado exitosamente un sistema completo de gestión de imágenes para las parcelas del sistema RiegoInteligente_tomate.

---

## 🎯 Funcionalidades Implementadas

### 1. **Base de Datos**
- ✅ Tabla `parcel_images` creada en PostgreSQL
- ✅ Relación con tabla `parcels` (clave foránea)
- ✅ Almacena metadata: URL, nombre, descripción, tamaño, tipo MIME
- ✅ Índices para búsquedas rápidas

### 2. **Backend (API)**
- ✅ Controlador `imageController.js` con 3 funciones principales:
  - Subir imagen
  - Obtener imágenes de parcela
  - Eliminar imagen
- ✅ Middleware `multer` para manejo de archivos
- ✅ Validación de tipos de archivo (JPEG, PNG, GIF, WEBP)
- ✅ Límite de tamaño: 5 MB por imagen
- ✅ Protección por autenticación JWT
- ✅ Verificación de permisos (usuario solo ve sus parcelas)
- ✅ Rutas RESTful en `/api/images`
- ✅ Archivos servidos como estáticos en `/uploads`

### 3. **Frontend (React)**
- ✅ Componente `ParcelImagesModal.js` completamente funcional
- ✅ Interfaz profesional y moderna con CSS personalizado
- ✅ Funciones implementadas:
  - Vista previa de imagen antes de subir
  - Subida de imágenes con barra de progreso
  - Galería con grid responsivo
  - Lightbox para ver imágenes en tamaño completo
  - Descripción opcional para cada imagen
  - Eliminación de imágenes con confirmación
  - Visualización de metadata (fecha, tamaño)
- ✅ Integración con Dashboard
- ✅ Botón "Ver Fotos de {Parcela}" en acciones principales

---

## 📁 Estructura de Archivos

### Backend
```
backend/
├── controllers/
│   └── imageController.js        # Lógica de negocio para imágenes
├── routes/
│   └── imageRoutes.js            # Endpoints de la API
├── migrations/
│   └── add_images_table.sql      # Script SQL para crear tabla
├── scripts/
│   └── run_images_migration.js   # Ejecutor de migración
└── uploads/
    └── parcels/                  # Imágenes de parcelas (no en Git)
        └── .gitkeep
```

### Frontend
```
frontend/
└── src/
    └── components/
        ├── ParcelImagesModal.js   # Componente React
        └── ParcelImagesModal.css  # Estilos
```

---

## 🗄️ Estructura de la Base de Datos

### Tabla: `parcel_images`

| Columna      | Tipo         | Descripción                                |
|--------------|--------------|--------------------------------------------|
| id           | SERIAL       | ID único (PK)                              |
| parcel_id    | INTEGER      | ID de la parcela (FK)                      |
| image_url    | TEXT         | Ruta del archivo                           |
| image_name   | VARCHAR(255) | Nombre original del archivo                |
| description  | TEXT         | Descripción opcional                       |
| uploaded_at  | TIMESTAMP    | Fecha de subida (automática)               |
| file_size    | INTEGER      | Tamaño en bytes                            |
| mime_type    | VARCHAR(50)  | Tipo MIME (image/jpeg, image/png, etc.)    |

**Índices:**
- `idx_parcel_images_parcel` en `parcel_id`
- `idx_parcel_images_date` en `uploaded_at DESC`

---

## 🔌 API Endpoints

### 1. Subir Imagen
**POST** `/api/images/upload/:parcelId`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Body (FormData):**
- `image`: Archivo de imagen (required)
- `description`: Descripción (optional)

**Respuesta:**
```json
{
  "message": "Imagen subida exitosamente",
  "image": {
    "id": 1,
    "parcel_id": 1,
    "image_url": "/uploads/parcels/parcel-1699999999999-123456789.jpg",
    "image_name": "tomate_foto.jpg",
    "description": "Tomate en etapa de crecimiento",
    "uploaded_at": "2025-10-12T21:40:00.000Z",
    "file_size": 245678,
    "mime_type": "image/jpeg"
  }
}
```

### 2. Obtener Imágenes de una Parcela
**GET** `/api/images/parcel/:parcelId`

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "parcel": {
    "id": 1,
    "name": "Parcela #1"
  },
  "images": [
    {
      "id": 1,
      "image_url": "/uploads/parcels/parcel-1699999999999-123456789.jpg",
      "image_name": "tomate_foto.jpg",
      "description": "Tomate en etapa de crecimiento",
      "uploaded_at": "2025-10-12T21:40:00.000Z",
      "file_size": 245678,
      "mime_type": "image/jpeg"
    }
  ]
}
```

### 3. Eliminar Imagen
**DELETE** `/api/images/:imageId`

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "message": "Imagen eliminada exitosamente"
}
```

---

## 🚀 Cómo Usar

### Para Desarrolladores

1. **Ejecutar migración de base de datos:**
   ```bash
   cd backend
   node scripts/run_images_migration.js
   ```

2. **Verificar que la dependencia multer esté instalada:**
   ```bash
   npm install multer
   ```

3. **Reiniciar el servidor backend:**
   ```bash
   npm start
   ```

4. **El frontend ya está integrado**, solo recargar la página

### Para Usuarios

1. **Acceder al Dashboard**

2. **Seleccionar una parcela** del selector dropdown

3. **Hacer clic en "Ver Fotos de {Parcela}"**

4. **En el modal:**
   - Hacer clic en "Seleccionar Imagen"
   - Elegir una foto desde tu dispositivo
   - (Opcional) Agregar una descripción
   - Hacer clic en "Subir Foto"

5. **Ver la galería:**
   - Ver todas las fotos en grid
   - Hacer clic en una foto para verla en tamaño completo
   - Eliminar fotos con el botón rojo

---

## 🎨 Características de UI/UX

### 🌈 Diseño Moderno
- Gradientes atractivos en sección de subida
- Cards con hover effects
- Animaciones suaves
- Icons de FontAwesome
- Diseño responsive

### 📱 Responsive
- Grid adaptativo (3 columnas en desktop, 1 en móvil)
- Imágenes optimizadas para diferentes tamaños
- Touch-friendly en dispositivos móviles

### 🔒 Seguridad
- Solo el dueño de la parcela puede ver/subir/eliminar fotos
- Validación de tipos de archivo en frontend y backend
- Límite de tamaño de archivo (5 MB)
- Protección JWT en todas las rutas

### 🖼️ Lightbox
- Ver imágenes en tamaño completo
- Fondo oscuro para mejor visualización
- Metadata visible (nombre, descripción, fecha)
- Cerrar con botón o clic fuera

---

## 📊 Validaciones Implementadas

### Backend
- ✅ Tipo de archivo permitido: JPEG, JPG, PNG, GIF, WEBP
- ✅ Tamaño máximo: 5 MB
- ✅ Usuario autenticado
- ✅ Parcela pertenece al usuario
- ✅ Imagen existe antes de eliminar
- ✅ Permisos para eliminar

### Frontend
- ✅ Input type="file" con accept="image/*"
- ✅ Preview antes de subir
- ✅ Confirmación antes de eliminar
- ✅ Validación de parcela seleccionada
- ✅ Manejo de errores con mensajes amigables

---

## 🔧 Configuración Técnica

### Multer Storage
```javascript
destination: backend/uploads/parcels/
filename: parcel-{timestamp}-{random}.{ext}
```

### Filtro de Archivos
```javascript
Permitidos: /jpeg|jpg|png|gif|webp/
Rechazados: PDF, DOC, ZIP, etc.
```

### Límites
```javascript
fileSize: 5 * 1024 * 1024  // 5 MB
```

---

## 🌟 Mejoras Futuras (Opcionales)

1. **Compresión Automática**
   - Reducir tamaño sin perder calidad
   - Implementar con sharp o jimp

2. **Almacenamiento en la Nube**
   - AWS S3
   - Cloudinary
   - Google Cloud Storage

3. **Múltiples Imágenes a la Vez**
   - Upload múltiple
   - Drag & drop

4. **Edición de Imágenes**
   - Crop
   - Rotate
   - Filters

5. **Categorías de Imágenes**
   - Por etapa de crecimiento
   - Por tipo de problema detectado
   - Por fecha de cultivo

---

## 📋 Checklist de Implementación

- [x] Crear tabla en base de datos
- [x] Instalar multer
- [x] Crear controlador de imágenes
- [x] Crear rutas API
- [x] Integrar rutas en server.js
- [x] Configurar carpeta uploads como estática
- [x] Crear componente React
- [x] Crear estilos CSS
- [x] Integrar en Dashboard
- [x] Agregar botón de acción
- [x] Actualizar .gitignore
- [x] Crear .gitkeep en uploads
- [x] Probar funcionalidad completa

---

## 🎉 SISTEMA LISTO PARA USAR

El sistema de gestión de imágenes está completamente implementado y funcional.

**Características principales:**
- 📷 Subida de fotos por parcela
- 🖼️ Galería visual
- 🔍 Lightbox profesional
- 🗑️ Eliminación segura
- 🔒 Protección por usuario
- 📱 100% responsive
- ⚡ Rendimiento optimizado

**¡Ahora cada parcela puede tener su propio álbum de fotos para seguimiento visual del cultivo!** 🌱📸

