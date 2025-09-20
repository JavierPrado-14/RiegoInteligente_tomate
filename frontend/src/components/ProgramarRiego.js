// frontend/src/components/ProgramarRiego.js
import React, { useState } from "react";
import "./ProgramarRiego.css"; // Archivo CSS para estilos específicos

const ProgramarRiego = () => {
  const [fecha, setFecha] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [parcela, setParcela] = useState("Parcela #1");
  const [mensaje, setMensaje] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMensaje("");

    const riegoData = { fecha, horaInicio, horaFin, parcela };

    try {
      // Enviar los datos al backend
      const response = await fetch("http://localhost:4000/api/riego/programar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(riegoData),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMensaje({ text: data.message, type: "success" });
        // Limpiar el formulario
        setFecha("");
        setHoraInicio("");
        setHoraFin("");
        setParcela("Parcela #1");
      } else {
        setMensaje({ text: data.message || "Error al programar riego", type: "error" });
      }
    } catch (err) {
      setMensaje({ text: "Error al conectar con el servidor", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="programar-riego-container">
      <h2 className="programar-title">Programar Riego Automático</h2>
      <p className="programar-subtitle">Configure el horario de riego para sus parcelas</p>
      
      <form onSubmit={handleSubmit} className="riego-form">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Parcela:</label>
            <select 
              value={parcela} 
              onChange={(e) => setParcela(e.target.value)}
              className="form-select"
            >
              <option value="Parcela #1">Parcela #1</option>
              <option value="Parcela #2">Parcela #2</option>
              <option value="Parcela #3">Parcela #3</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Fecha:</label>
            <input 
              type="date" 
              value={fecha} 
              onChange={(e) => setFecha(e.target.value)} 
              className="form-input"
              required 
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Hora de inicio:</label>
            <input 
              type="time" 
              value={horaInicio} 
              onChange={(e) => setHoraInicio(e.target.value)} 
              className="form-input"
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Hora de finalización:</label>
            <input 
              type="time" 
              value={horaFin} 
              onChange={(e) => setHoraFin(e.target.value)} 
              className="form-input"
              required 
            />
          </div>
        </div>

        <button 
          type="submit" 
          className={`submit-button ${isSubmitting ? 'submitting' : ''}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Programando...' : 'Programar Riego'}
          {isSubmitting && <div className="button-spinner"></div>}
        </button>
      </form>
      
      {mensaje && (
        <div className={`message ${mensaje.type === 'success' ? 'success-message' : 'error-message'}`}>
          {mensaje.text}
        </div>
      )}
    </div>
  );
};

export default ProgramarRiego;