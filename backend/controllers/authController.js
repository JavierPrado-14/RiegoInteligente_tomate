// backend/controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Client } = require("pg");
const sqlConfig = require("../config/sqlConfig");

// Función para registrar un nuevo usuario
const registerUser = async (req, res) => {
  const { nombre_usuario, contrasena, correo, rol = 1 } = req.body; // Rol por defecto: 1 (usuario)

  try {
    // Cifrar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contrasena, salt);

    // Crear una nueva instancia de Client (cliente de PostgreSQL)
    const client = new Client(sqlConfig);
    await client.connect();

    // Insertar el nuevo usuario en la base de datos (incluyendo el rol)
    const query = "INSERT INTO AgroIrrigate.Usuarios (nombre_usuario, contrasena, correo, rol) VALUES ($1, $2, $3, $4)";
    const values = [nombre_usuario, hashedPassword, correo, rol];
    
    // Realizamos la consulta de inserción
    await client.query(query, values);

    // Respuesta exitosa
    res.status(201).json({ message: "Usuario registrado con éxito" });

    client.end();
  } catch (err) {
    console.error("Error al registrar usuario", err);
    res.status(500).json({ message: "Error al registrar usuario", error: err.message });
  }
};

// Función para iniciar sesión
const loginUser = async (req, res) => {
  const { nombre_usuario, contrasena } = req.body;

  try {
    // Crear una nueva instancia de Client y conectarse a la base de datos
    const client = new Client(sqlConfig);
    await client.connect();

    // Consultar al usuario en la base de datos
    const result = await client.query(
      "SELECT * FROM AgroIrrigate.Usuarios WHERE nombre_usuario = $1",
      [nombre_usuario]
    );

    const user = result.rows[0];

    // Verificar si el usuario existe
    if (!user) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    // Verificar la contraseña
    const isMatch = await bcrypt.compare(contrasena, user.contrasena);
    if (!isMatch) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    // Generar el JWT incluyendo el rol del usuario
    const token = jwt.sign({ 
      userId: user.id,
      rol: user.rol 
    }, "secreta", { expiresIn: "1h" });

    // Responder con el token y el rol en formato JSON
    res.json({ 
      token,
      rol: user.rol 
    });

    client.end();
  } catch (err) {
    console.error("Error al iniciar sesión", err);
    res.status(500).json({ message: "Error al iniciar sesión", error: err.message });
  }
};

module.exports = { registerUser, loginUser };