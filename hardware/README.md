# 🔌 Integración de Hardware - Arduino Uno R4 WiFi

## 📡 Sensores IoT para AgroIrrigate

Este directorio contiene el código de Arduino para la integración de sensores IoT con el sistema de Riego Inteligente AgroIrrigate.

---

## 🛠️ Hardware Utilizado

### **Arduino Uno R4 WiFi**
- Microcontrolador principal con conectividad WiFi integrada
- Voltaje de operación: 5V
- Conectividad: WiFi 802.11 b/g/n
- Pines digitales: 14 (de los cuales 6 pueden ser PWM)
- Pines analógicos: 6

### **Sensor Ultrasónico HC-SR04**
- Rango de medición: 2cm - 400cm
- Precisión: ±3mm
- Voltaje de operación: 5V DC
- Corriente de trabajo: 15mA
- Ángulo de medición: 15°

### **Módulo Relé (1 Canal)**
- Control de bomba de agua o válvula solenoide
- Voltaje: 5V
- Corriente máxima: 10A
- Tipo: Optoacoplado

---

## 🔗 Diagrama de Conexión

```
Arduino Uno R4 WiFi
┌─────────────────────────┐
│                         │
│  [10] ────────────► TRIG│───► Sensor HC-SR04
│  [11] ◄───────────  ECHO│◄─── Sensor HC-SR04
│                         │
│  [7]  ────────────► IN  │───► Relé → Bomba/Válvula
│                         │
│  [5V] ────────────► VCC │───► Alimentación sensores
│  [GND]────────────► GND │───► Tierra común
│                         │
│  WiFi Module Integrado  │
│  (Conecta a red local)  │
└─────────────────────────┘
```

### **Conexiones Detalladas:**

#### Sensor Ultrasónico HC-SR04:
| Sensor | Arduino |
|--------|---------|
| VCC    | 5V      |
| TRIG   | Pin 10  |
| ECHO   | Pin 11  |
| GND    | GND     |

#### Módulo Relé:
| Relé   | Arduino |
|--------|---------|
| VCC    | 5V      |
| IN     | Pin 7   |
| GND    | GND     |

#### Bomba/Válvula:
| Componente | Conexión |
|------------|----------|
| Terminal + | Relé COM |
| Terminal - | Relé NO  |

---

## 📂 Archivos

### `arduino/SensorHumedad_AgroIrrigate.ino`
- Código principal del Arduino
- Lectura de sensor ultrasónico
- Control de bomba/válvula
- Simulación de envío de datos al backend
- Comentarios detallados en español

---

## 🚀 Cómo Usar

### **1. Configuración del Hardware**

1. Conectar el sensor HC-SR04 según el diagrama
2. Conectar el módulo relé al pin 7
3. Conectar la bomba/válvula al relé
4. Alimentar el Arduino con cable USB o fuente externa

### **2. Cargar el Código**

1. Abrir Arduino IDE
2. Instalar soporte para Arduino Uno R4 WiFi:
   - Tools → Board Manager → Arduino UNO R4
3. Abrir el archivo `SensorHumedad_AgroIrrigate.ino`
4. Seleccionar la placa: Tools → Board → Arduino UNO R4 WiFi
5. Seleccionar el puerto COM correspondiente
6. Click en "Upload" (→)

### **3. Monitor Serial**

1. Abrir Monitor Serial: Tools → Serial Monitor
2. Configurar velocidad: 9600 baudios
3. Observar las lecturas en tiempo real

**Ejemplo de salida:**
```
======================================
Sistema AgroIrrigate - Iniciando...
Sensor de Nivel de Agua - Arduino R4 WiFi
======================================

--- Lectura del Sensor ---
Distancia: 15 cm
Humedad detectada: 85 %
Estado: BOMBA ACTIVADA (Nivel bajo de agua)
⚠️ ALERTA: Nivel de agua crítico

Enviando datos al backend...
POST http://localhost:4000/api/humedad/registrar
{
  "lectura": 85,
  "fecha": "2025-10-20T10:30:00",
  "ubicacion": "Sensor Arduino R4 WiFi",
  "parcelaId": 1
}
Datos enviados exitosamente ✓
======================================
```

---

## 🌐 Integración con Backend

### **Configuración WiFi (Para implementación real)**

Para conectar el Arduino al backend de AgroIrrigate:

```cpp
#include <WiFiS3.h>
#include <ArduinoHttpClient.h>

// Configuración WiFi
const char* ssid = "TU_RED_WIFI";
const char* password = "TU_PASSWORD";

// Configuración del servidor
const char* serverName = "192.168.1.100";  // IP del backend
const int serverPort = 4000;

WiFiClient wifi;
HttpClient client = HttpClient(wifi, serverName, serverPort);

void setup() {
  Serial.begin(9600);
  
  // Conectar a WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConectado a WiFi!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}
```

### **Envío de Datos HTTP POST**

```cpp
void enviarDatosBackend(int humedad, int parcelaId) {
  // Crear JSON
  String jsonData = "{";
  jsonData += "\"lectura\":" + String(humedad) + ",";
  jsonData += "\"fecha\":\"" + obtenerFechaActual() + "\",";
  jsonData += "\"ubicacion\":\"Arduino R4 WiFi - Sensor 1\",";
  jsonData += "\"parcelaId\":" + String(parcelaId);
  jsonData += "}";
  
  // Enviar petición POST
  client.beginRequest();
  client.post("/api/humedad/registrar");
  client.sendHeader("Content-Type", "application/json");
  client.sendHeader("Content-Length", jsonData.length());
  client.beginBody();
  client.print(jsonData);
  client.endRequest();
  
  // Leer respuesta
  int statusCode = client.responseStatusCode();
  String response = client.responseBody();
  
  if (statusCode == 201) {
    Serial.println("✓ Datos enviados correctamente");
  } else {
    Serial.println("✗ Error al enviar datos: " + String(statusCode));
  }
}
```

---

## 📊 Funcionalidad

### **1. Medición de Nivel de Agua**
- El sensor ultrasónico mide la distancia al nivel de agua
- Se actualiza cada 500ms
- Rango efectivo: 2-400 cm

### **2. Control Automático**
- **Distancia < 20cm:** Activa bomba (nivel bajo)
- **Distancia ≥ 20cm:** Desactiva bomba (nivel normal)

### **3. Detección de Humedad**
- Convierte distancia a porcentaje de humedad
- Rango: 0-100%
- Fórmula: `humedad = map(distancia, 100, 0, 0, 100)`

### **4. Comunicación Serial**
- Muestra lecturas en tiempo real
- Indica estado de la bomba
- Envía datos al backend

---

## 🔧 Sensores Adicionales Recomendados

### **1. Sensor de Humedad del Suelo (Capacitivo)**
- Más preciso que resistivo
- No se corroe
- Salida analógica (0-1023)
- **Conexión:** Pin A0

```cpp
const int humedadSueloPin = A0;
int lecturaHumedad = analogRead(humedadSueloPin);
int porcentaje = map(lecturaHumedad, 0, 1023, 0, 100);
```

### **2. Sensor DHT22 (Temperatura y Humedad Ambiental)**
- Temperatura: -40 a 80°C (±0.5°C)
- Humedad: 0-100% (±2%)
- **Conexión:** Pin Digital 2

```cpp
#include <DHT.h>
DHT dht(2, DHT22);

void setup() {
  dht.begin();
}

void loop() {
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();
}
```

### **3. Sensor de Luz (LDR)**
- Mide intensidad lumínica
- Útil para optimizar horarios de riego
- **Conexión:** Pin A1 con divisor de voltaje

```cpp
const int ldrPin = A1;
int luzAmbiente = analogRead(ldrPin);
```

### **4. Sensor de pH del Suelo**
- Rango: pH 3-10
- Salida analógica
- **Conexión:** Pin A2

---

## ⚙️ Configuración Avanzada

### **Calibración del Sensor Ultrasónico**

```cpp
// Valores de calibración
const int DISTANCIA_MINIMA = 2;   // cm
const int DISTANCIA_MAXIMA = 400; // cm

// Filtro de lecturas erróneas
if (distanceCm < DISTANCIA_MINIMA || distanceCm > DISTANCIA_MAXIMA) {
  Serial.println("⚠️ Lectura fuera de rango");
  return;
}
```

### **Promedio de Lecturas**

```cpp
const int NUM_LECTURAS = 5;
int lecturas[NUM_LECTURAS];
int indice = 0;

int promedioDistancia() {
  int suma = 0;
  for (int i = 0; i < NUM_LECTURAS; i++) {
    suma += lecturas[i];
  }
  return suma / NUM_LECTURAS;
}
```

---

## 🔋 Consideraciones de Energía

### **Consumo Aproximado:**
- Arduino R4 WiFi: ~80-200mA (con WiFi activo)
- Sensor HC-SR04: ~15mA
- Relé: ~15-30mA
- **Total:** ~110-245mA

### **Opciones de Alimentación:**
1. **USB:** 5V desde computadora o cargador USB
2. **Fuente Externa:** 7-12V DC a través de jack de alimentación
3. **Batería:** Panel solar + batería 12V con regulador

### **Modo de Bajo Consumo:**
```cpp
#include <ArduinoLowPower.h>

// Dormir por 60 segundos entre lecturas
LowPower.sleep(60000);
```

---

## 🐛 Solución de Problemas

### **Problema: Lecturas inconsistentes**
**Solución:**
- Verificar conexiones (cables sueltos)
- Limpiar sensor ultrasónico
- Implementar promedio de lecturas
- Aumentar `delay()` entre lecturas

### **Problema: Relé no activa**
**Solución:**
- Verificar voltaje del relé (5V)
- Comprobar conexión del pin 7
- Verificar lógica (LOW = activo / HIGH = inactivo)
- Medir voltaje en pin IN del relé

### **Problema: No se conecta a WiFi**
**Solución:**
- Verificar SSID y contraseña
- Comprobar router (banda 2.4 GHz)
- Aumentar tiempo de espera de conexión
- Verificar firmware del Arduino R4

---

## 📚 Recursos Adicionales

### **Documentación:**
- [Arduino Uno R4 WiFi Documentation](https://docs.arduino.cc/hardware/uno-r4-wifi)
- [HC-SR04 Datasheet](https://cdn.sparkfun.com/datasheets/Sensors/Proximity/HCSR04.pdf)
- [Arduino HTTPClient Library](https://www.arduino.cc/reference/en/libraries/httpclient/)

### **Bibliotecas Necesarias:**
```
WiFiS3 (incluida en Arduino R4)
ArduinoHttpClient
DHT sensor library (para DHT22)
ArduinoJson (para parsing JSON)
```

### **Instalación de Bibliotecas:**
1. Arduino IDE → Sketch → Include Library → Manage Libraries
2. Buscar nombre de la biblioteca
3. Click en "Install"

---

## 🎯 Próximos Pasos

1. ✅ **Código base implementado** (simulación)
2. ⏳ **Configurar WiFi** para conexión real
3. ⏳ **Implementar HTTP POST** al backend
4. ⏳ **Agregar sensores adicionales** (DHT22, humedad del suelo)
5. ⏳ **Implementar manejo de errores** y reintentos
6. ⏳ **Agregar autenticación** con token JWT
7. ⏳ **Optimizar consumo de energía**
8. ⏳ **Implementar OTA** (actualización remota de firmware)

---

## 👨‍💻 Desarrollado por

**Javier Prado**  
Décimo Semestre - Seminario de Tecnologías de Información  
Sistema de Riego Inteligente AgroIrrigate

---

*Última actualización: Octubre 2025*

