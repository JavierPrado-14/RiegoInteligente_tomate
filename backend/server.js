// backend/server.js
require('dotenv').config({ path: './config.env' });
const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);

// Configuración de CORS para Socket.io
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware básico
app.use(cors());
app.use(express.json());

// Importar y usar rutas - SIN el paquete 'router' problemático
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/riego", require("./routes/riegoRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/humedad", require("./routes/humedadRoutes"));
app.use("/api/agua", require("./routes/aguaRoutes"));

// Rutas de parcelas
app.use("/api/parcels", require("./routes/parcelRoutes"));
app.use("/api/alerts", require("./routes/alertRoutes"));
app.use("/api/sensors", require("./routes/sensorRoutes"));
app.use("/api/maps", require("./routes/mapRoutes"));

// Ruta de prueba simple
app.get("/", (req, res) => {
  res.json({ 
    message: "Servidor de AgroIrrigate funcionando correctamente",
    status: "OK"
  });
});

// Configuración de Socket.io
io.on("connection", (socket) => {
  console.log("Cliente conectado a Socket.io");
  
  socket.on("disconnect", () => {
    console.log("Cliente desconectado de Socket.io");
  });
});

// Puerto
const PORT = 4000;

server.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  
  // Iniciar monitor de alertas SMS
  const { startAlertMonitor } = require('./services/alertMonitor');
  startAlertMonitor();
});