// backend/controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Client } = require("pg");
const sqlConfig = require("../config/sqlConfig");

// Función para registrar un nuevo usuario
const registerUser = async (req, res) => {
  const { nombre_usuario, contrasena, correo, telefono, rol = 1 } = req.body; // Rol por defecto: 1 (usuario)

  try {
    // Validar formato de teléfono si se proporciona
    if (telefono && !/^\+[1-9]\d{1,14}$/.test(telefono)) {
      return res.status(400).json({ 
        message: "Formato de teléfono inválido. Use formato internacional (ej: +50212345678)" 
      });
    }

    // Cifrar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contrasena, salt);

    // Crear una nueva instancia de Client (cliente de PostgreSQL)
    const client = new Client(sqlConfig);
    await client.connect();

    // Insertar el nuevo usuario en la base de datos (incluyendo el rol y teléfono)
    const query = "INSERT INTO agroirrigate.usuarios (nombre_usuario, contrasena, correo, telefono, rol) VALUES ($1, $2, $3, $4, $5) RETURNING id, nombre_usuario, correo, telefono, rol";
    const values = [nombre_usuario, hashedPassword, correo, telefono || null, rol];
    
    // Realizamos la consulta de inserción
    const result = await client.query(query, values);
    const newUser = result.rows[0];

    // Respuesta exitosa con datos del usuario
    res.status(201).json({ 
      message: "Usuario registrado con éxito",
      user: {
        id: newUser.id,
        nombre_usuario: newUser.nombre_usuario,
        correo: newUser.correo,
        telefono: newUser.telefono,
        rol: newUser.rol
      }
    });

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

    // Responder con el token, el rol y el userId en formato JSON
    res.json({ 
      token,
      userId: user.id,
      rol: user.rol 
    });

    client.end();
  } catch (err) {
    console.error("Error al iniciar sesión", err);
    res.status(500).json({ message: "Error al iniciar sesión", error: err.message });
  }
};

module.exports = { registerUser, loginUser };