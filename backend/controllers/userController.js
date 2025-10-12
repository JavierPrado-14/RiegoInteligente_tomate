// backend/controllers/userController.js
const { Client } = require("pg");
const sqlConfig = require("../config/sqlConfig");
const bcrypt = require("bcryptjs");

// Obtener todos los usuarios
const getUsers = async (req, res) => {
  try {
    const client = new Client(sqlConfig);
    await client.connect();

    const result = await client.query(
      "SELECT id, nombre_usuario, correo, rol, telefono FROM agroirrigate.usuarios ORDER BY id"
    );

    res.json(result.rows);
    client.end();
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    res.status(500).json({ message: "Error al obtener usuarios", error: err.message });
  }
};

// Actualizar usuario
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { nombre_usuario, correo, rol, contrasena, telefono } = req.body;

  try {
    const client = new Client(sqlConfig);
    await client.connect();

    let query = "UPDATE agroirrigate.usuarios SET";
    const values = [];
    let paramCount = 1;

    if (nombre_usuario) {
      query += ` nombre_usuario = $${paramCount},`;
      values.push(nombre_usuario);
      paramCount++;
    }

    if (correo) {
      query += ` correo = $${paramCount},`;
      values.push(correo);
      paramCount++;
    }

    if (rol !== undefined) {
      query += ` rol = $${paramCount},`;
      values.push(rol);
      paramCount++;
    }

    if (contrasena) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(contrasena, salt);
      query += ` contrasena = $${paramCount},`;
      values.push(hashedPassword);
      paramCount++;
    }

    if (telefono) {
      query += ` telefono = $${paramCount},`;
      values.push(telefono);
      paramCount++;
    }

    // Eliminar la última coma
    query = query.slice(0, -1);

    query += ` WHERE id = $${paramCount} RETURNING id, nombre_usuario, correo, rol, telefono`;
    values.push(id);

    const result = await client.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ message: "Usuario actualizado con éxito", user: result.rows[0] });
    client.end();
  } catch (err) {
    console.error("Error al actualizar usuario:", err);
    res.status(500).json({ message: "Error al actualizar usuario", error: err.message });
  }
};

// Eliminar usuario
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const client = new Client(sqlConfig);
    await client.connect();

    const result = await client.query(
      "DELETE FROM agroirrigate.usuarios WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ message: "Usuario eliminado con éxito" });
    client.end();
  } catch (err) {
    console.error("Error al eliminar usuario:", err);
    res.status(500).json({ message: "Error al eliminar usuario", error: err.message });
  }
};

module.exports = { getUsers, updateUser, deleteUser };