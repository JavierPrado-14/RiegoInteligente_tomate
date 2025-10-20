/*
 * Sistema de Riego Inteligente - AgroIrrigate
 * Sensor de Humedad del Suelo con Arduino Uno R4 WiFi
 * 
 * Este código simula la integración de sensores IoT con el sistema AgroIrrigate.
 * Utiliza un sensor ultrasónico HC-SR04 para medir el nivel de agua en el tanque
 * y controla una válvula/bomba de riego basándose en la distancia medida.
 * 
 * Hardware Requerido:
 * - Arduino Uno R4 WiFi
 * - Sensor Ultrasónico HC-SR04
 * - Relé para control de bomba/válvula (conectado al pin 7)
 * - Módulo WiFi integrado (Arduino R4 WiFi)
 * 
 * Conexiones:
 * - Trigger Pin: Pin Digital 10
 * - Echo Pin: Pin Digital 11
 * - Relé/Bomba: Pin Digital 7
 * 
 * Funcionamiento:
 * - Mide la distancia del nivel de agua en el tanque
 * - Si la distancia es < 20cm (nivel bajo): Activa la bomba (pin 7 LOW)
 * - Si la distancia es > 20cm (nivel adecuado): Desactiva la bomba (pin 7 HIGH)
 * 
 * Integración con Backend:
 * Este código puede enviar datos al backend de AgroIrrigate mediante
 * peticiones HTTP POST al endpoint: http://backend-url:4000/api/humedad/registrar
 * 
 * Desarrollado por: Javier Prado
 * Proyecto: Seminario de Tecnologías de Información
 * Fecha: Octubre 2025
 */

// EAZYTRONIC.COM - Código base adaptado para AgroIrrigate

// ==================== CONFIGURACIÓN DE PINES ====================
const int trigPin = 10;        // Pin de disparo del sensor ultrasónico
const int echoPin = 11;        // Pin de eco del sensor ultrasónico
const int pumpRelayPin = 7;    // Pin de control del relé (bomba de riego)

// ==================== VARIABLES GLOBALES ====================
long duration;                 // Duración del pulso ultrasónico
int distanceCm;               // Distancia medida en centímetros
int distanceInch;             // Distancia medida en pulgadas
int humedadSimulada;          // Nivel de humedad simulado (0-100%)

// Umbral de distancia para activar la bomba
const int UMBRAL_DISTANCIA = 20;  // 20 cm

// ==================== CONFIGURACIÓN INICIAL ====================
void setup() {
  // Inicializar comunicación serial a 9600 baudios
  Serial.begin(9600);
  
  // Configurar pines del sensor ultrasónico
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  
  // Configurar pin del relé como salida
  pinMode(pumpRelayPin, OUTPUT);
  
  // Desactivar bomba inicialmente (relé en HIGH = apagado)
  digitalWrite(pumpRelayPin, HIGH);
  
  // Mensaje de inicio
  Serial.println("======================================");
  Serial.println("Sistema AgroIrrigate - Iniciando...");
  Serial.println("Sensor de Nivel de Agua - Arduino R4 WiFi");
  Serial.println("======================================");
  delay(2000);
}

// ==================== BUCLE PRINCIPAL ====================
void loop() {
  // -------- MEDICIÓN DE DISTANCIA --------
  
  // Limpiar el pin de disparo
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  
  // Enviar pulso de 10 microsegundos
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  
  // Leer el tiempo de respuesta del eco
  duration = pulseIn(echoPin, HIGH);
  
  // Calcular distancia en centímetros y pulgadas
  distanceCm = duration * 0.034 / 2;
  distanceInch = duration * 0.0133 / 2;
  
  // Simular nivel de humedad basado en la distancia
  // A menor distancia (más agua), mayor humedad
  if (distanceCm > 0 && distanceCm < 100) {
    humedadSimulada = map(distanceCm, 100, 0, 0, 100);
    humedadSimulada = constrain(humedadSimulada, 0, 100);
  } else {
    humedadSimulada = 50; // Valor por defecto
  }
  
  // -------- MOSTRAR DATOS EN MONITOR SERIAL --------
  Serial.println("\n--- Lectura del Sensor ---");
  Serial.print("Distancia: ");
  Serial.print(distanceCm);
  Serial.println(" cm");
  
  Serial.print("Humedad simulada: ");
  Serial.print(humedadSimulada);
  Serial.println(" %");
  
  // -------- CONTROL DE LA BOMBA DE RIEGO --------
  
  if (distanceCm < UMBRAL_DISTANCIA) {
    // Nivel de agua bajo: Activar bomba
    digitalWrite(pumpRelayPin, LOW);
    Serial.println("Estado: BOMBA ACTIVADA (Nivel bajo de agua)");
    Serial.println("⚠️ ALERTA: Nivel de agua crítico");
  } else if (distanceCm >= UMBRAL_DISTANCIA) {
    // Nivel de agua adecuado: Desactivar bomba
    digitalWrite(pumpRelayPin, HIGH);
    Serial.println("Estado: BOMBA DESACTIVADA (Nivel adecuado)");
    Serial.println("✅ Sistema funcionando normalmente");
  }
  
  // -------- SIMULACIÓN DE ENVÍO AL BACKEND --------
  Serial.println("\n[SIMULACIÓN] Enviando datos al backend...");
  Serial.println("POST http://localhost:4000/api/humedad/registrar");
  Serial.println("{");
  Serial.print("  \"lectura\": ");
  Serial.print(humedadSimulada);
  Serial.println(",");
  Serial.println("  \"fecha\": \"2025-10-20T10:30:00\",");
  Serial.println("  \"ubicacion\": \"Sensor Arduino R4 WiFi\",");
  Serial.println("  \"parcelaId\": 1");
  Serial.println("}");
  Serial.println("[SIMULACIÓN] Datos enviados exitosamente ✓");
  
  Serial.println("======================================\n");
  
  // Esperar 500ms antes de la próxima lectura
  delay(500);
}

/*
 * ==================== NOTAS DE INTEGRACIÓN ====================
 * 
 * Para integrar este código con el backend de AgroIrrigate:
 * 
 * 1. Configurar WiFi en Arduino R4:
 *    - Agregar librería WiFiS3.h
 *    - Conectar a la red WiFi local
 *    - Obtener dirección IP del backend
 * 
 * 2. Implementar peticiones HTTP:
 *    - Usar librería HTTPClient
 *    - Enviar datos en formato JSON
 *    - Incluir token de autenticación si es necesario
 * 
 * 3. Endpoint de destino:
 *    POST /api/humedad/registrar
 *    Body: {
 *      "lectura": [valor de humedad],
 *      "fecha": [timestamp],
 *      "ubicacion": "Sensor Arduino",
 *      "parcelaId": [ID de la parcela]
 *    }
 * 
 * 4. Manejo de errores:
 *    - Implementar reintentos en caso de fallo
 *    - Almacenar datos localmente si no hay conexión
 *    - Enviar datos pendientes cuando se restablezca la conexión
 * 
 * 5. Sensores adicionales sugeridos:
 *    - DHT22: Temperatura y humedad ambiental
 *    - Sensor de humedad del suelo capacitivo
 *    - Sensor de luz (LDR)
 *    - Sensor de pH del suelo
 * 
 * ==================== EJEMPLO DE CÓDIGO WiFi ====================
 * 
 * #include <WiFiS3.h>
 * #include <ArduinoHttpClient.h>
 * 
 * const char* ssid = "TU_WIFI";
 * const char* password = "TU_PASSWORD";
 * const char* serverName = "192.168.1.100";
 * const int serverPort = 4000;
 * 
 * WiFiClient wifi;
 * HttpClient client = HttpClient(wifi, serverName, serverPort);
 * 
 * void enviarDatos(int humedad) {
 *   String jsonData = "{\"lectura\":" + String(humedad) + 
 *                     ",\"fecha\":\"2025-10-20T10:30:00\"," +
 *                     "\"ubicacion\":\"Arduino R4\"," +
 *                     "\"parcelaId\":1}";
 *   
 *   client.beginRequest();
 *   client.post("/api/humedad/registrar");
 *   client.sendHeader("Content-Type", "application/json");
 *   client.sendHeader("Content-Length", jsonData.length());
 *   client.beginBody();
 *   client.print(jsonData);
 *   client.endRequest();
 *   
 *   int statusCode = client.responseStatusCode();
 *   String response = client.responseBody();
 *   
 *   Serial.print("Status: ");
 *   Serial.println(statusCode);
 *   Serial.print("Response: ");
 *   Serial.println(response);
 * }
 * 
 * ==================== FIN DE NOTAS ====================
 */

