// frontend/src/components/AdminMapDesignModal.js
import React, { useState } from 'react';
import './AdminModals.css';

const AdminMapDesignModal = ({ isOpen, closeModal }) => {
  const [rows, setRows] = useState(3);
  const [columns, setColumns] = useState(3);
  const [parcels, setParcels] = useState([]);

  const handleSaveDesign = (e) => {
    e.preventDefault();
    // Lógica para guardar el diseño del mapa
    console.log('Guardando diseño:', { rows, columns, parcels });
    // Aquí se haría la llamada al backend para guardar el diseño
    closeModal();
  };

  const addParcel = () => {
    // Lógica para agregar una parcela al diseño
    const newParcel = {
      id: parcels.length + 1,
      name: `Parcela ${parcels.length + 1}`,
      row: 0,
      column: 0,
      size: 100
    };
    setParcels([...parcels, newParcel]);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="admin-modal">
        <div className="modal-header">
          <h2>Diseñar Mapa de Parcelas</h2>
          <button className="close-button" onClick={closeModal}>
            &times;
          </button>
        </div>
        <div className="modal-content">
          <form onSubmit={handleSaveDesign}>
            <div className="form-group">
              <label htmlFor="rows">Número de Filas:</label>
              <input
                type="number"
                id="rows"
                value={rows}
                onChange={(e) => setRows(parseInt(e.target.value))}
                min="1"
                max="10"
              />
            </div>
            <div className="form-group">
              <label htmlFor="columns">Número de Columnas:</label>
              <input
                type="number"
                id="columns"
                value={columns}
                onChange={(e) => setColumns(parseInt(e.target.value))}
                min="1"
                max="10"
              />
            </div>
            <div className="form-group">
              <button type="button" onClick={addParcel}>
                Agregar Parcela
              </button>
            </div>
            <div className="modal-buttons">
              <button type="button" onClick={closeModal}>
                Cancelar
              </button>
              <button type="submit">
                Guardar Diseño
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminMapDesignModal;