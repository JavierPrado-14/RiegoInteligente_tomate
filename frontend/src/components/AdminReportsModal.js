// frontend/src/components/AdminReportsModal.js
import React, { useState } from 'react';
import './AdminModals.css';

const AdminReportsModal = ({ isOpen, closeModal }) => {
  const [reportType, setReportType] = useState('riegos');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleGenerateReport = (e) => {
    e.preventDefault();
    // Lógica para generar el reporte
    console.log('Generando reporte:', { reportType, startDate, endDate });
    // Aquí se haría la llamada al backend para generar el reporte
    closeModal();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="admin-modal">
        <div className="modal-header">
          <h2>Generar Reportes de Riego</h2>
          <button className="close-button" onClick={closeModal}>
            &times;
          </button>
        </div>
        <div className="modal-content">
          <form onSubmit={handleGenerateReport}>
            <div className="form-group">
              <label htmlFor="reportType">Tipo de Reporte:</label>
              <select
                id="reportType"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="riegos">Riegos Programados</option>
                <option value="ejecutados">Riegos Ejecutados</option>
                <option value="consumo">Consumo de Agua</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="startDate">Fecha Inicio:</label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="endDate">Fecha Fin:</label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="modal-buttons">
              <button type="button" onClick={closeModal}>
                Cancelar
              </button>
              <button type="submit">
                Generar Reporte
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminReportsModal;