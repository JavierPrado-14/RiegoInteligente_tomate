// frontend/src/components/Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import loginImage from '../assets/images/login.jpg';

const Login = ({ updateAuthStatus }) => {
  const [nombre_usuario, setNombreUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [correo, setCorreo] = useState("");
  const [rol, setRol] = useState(1); // Por defecto usuario normal
  const [isLogin, setIsLogin] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // Función para manejar el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();

    const url = isLogin ? "http://localhost:4000/api/auth/login" : "http://localhost:4000/api/auth/register";
    const body = isLogin
      ? { nombre_usuario, contrasena }
      : { nombre_usuario, contrasena, correo, rol };

    // Enviar solicitud al backend
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.token) {
          // Si el inicio de sesión es exitoso, guarda el token y el rol
          localStorage.setItem("authToken", data.token);
          localStorage.setItem("userRol", data.rol); // Guardar el rol
          
          // Actualizar el estado de autenticación
          updateAuthStatus(true);
          
          // Redirigir al dashboard
          navigate("/dashboard", { replace: true });
        } else {
          setErrorMessage("Error: " + (data.message || "Token no recibido"));
        }
      })
      .catch((err) => {
        setErrorMessage("Error: " + err.message);
      });
  };

  return (
    <div 
      className="login-container"
      style={{ backgroundImage: `url(${loginImage})` }}
    >
      <div className="login-form">
        <h2>{isLogin ? "Iniciar sesión" : "Registrarse"}</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="nombre_usuario">Nombre de usuario:</label>
            <input
              type="text"
              id="nombre_usuario"
              value={nombre_usuario}
              onChange={(e) => setNombreUsuario(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="contrasena">Contraseña:</label>
            <input
              type="password"
              id="contrasena"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
            />
          </div>
          {!isLogin && (
            <>
              <div>
                <label htmlFor="correo">Correo electrónico:</label>
                <input
                  type="email"
                  id="correo"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="rol">Tipo de usuario:</label>
                <select
                  id="rol"
                  value={rol}
                  onChange={(e) => setRol(parseInt(e.target.value))}
                  required
                >
                  <option value={1}>Usuario Normal</option>
                  <option value={2}>Administrador</option>
                </select>
              </div>
            </>
          )}
          <button type="submit">{isLogin ? "Iniciar sesión" : "Registrarse"}</button>
          {errorMessage && <p className="error">{errorMessage}</p>}
        </form>
        <button className="toggle-form-btn" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "¿No tienes cuenta? Regístrate aquí" : "¿Ya tienes cuenta? Inicia sesión"}
        </button>
      </div>
    </div>
  );
};

export default Login;