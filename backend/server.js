// backend/server.js
const express = require("express");
const { Client } = require("pg"); // Asegúrate de usar el cliente de PostgreSQL
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const authRoutes = require("./routes/authRoutes"); // Importamos las rutas de autenticación
const riegoRoutes = require("./routes/riegoRoutes"); // Importamos las rutas de riego

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Usar CORS para permitir solicitudes desde el frontend
app.use(cors()); // Habilitar CORS
app.use(express.json()); // Middleware para analizar el cuerpo de las solicitudes JSON

// Usar las rutas de autenticación
app.use("/api/auth", authRoutes);
// Usar las rutas de riego
app.use("/api/riego", riegoRoutes);

// Configuración de la conexión a PostgreSQL
const client = new Client({
  user: 'postgres',  // Tu usuario de PostgreSQL
  host: 'localhost',
  database: 'agroirrigate', // Nombre correcto de la base de datos en minúsculas
  password: '1234',
  port: 5432,
});

// Conectar a PostgreSQL
client.connect()
  .then(() => console.log("Conectado a PostgreSQL"))
  .catch(err => console.error("Error de conexión con PostgreSQL", err));

// Ruta para interactuar con la base de datos (por ejemplo, una prueba)
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// Inicializar el socket.io para emitir datos de humedad en tiempo real
io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado");

  setInterval(() => {
    const humidity = Math.floor(Math.random() * 100); // Simulando datos de humedad
    socket.emit("humidityUpdate", humidity); // Emitir el valor de humedad a todos los clientes conectados
  }, 2000);

  socket.on("disconnect", () => {
    console.log("Cliente desconectado");
  });
});

// Iniciar el servidor
server.listen(4000, () => {
  console.log("Servidor corriendo en el puerto 4000");
});
