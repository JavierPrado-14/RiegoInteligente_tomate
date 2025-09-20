// frontend/src/components/AdminParcelModal.js
import React, { useState } from 'react';
import './AdminModals.css';

const AdminParcelModal = ({ isOpen, closeModal, action }) => {
  const [parcelName, setParcelName] = useState('');
  const [parcelSize, setParcelSize] = useState('');
  const [selectedParcel, setSelectedParcel] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Aquí iría la lógica para agregar o eliminar parcela
    // dependiendo del valor de 'action'
    
    if (action === 'add') {
      console.log('Agregando parcela:', { parcelName, parcelSize });
      // Lógica para agregar parcela
    } else if (action === 'delete') {
      console.log('Eliminando parcela:', selectedParcel);
      // Lógica para eliminar parcela
    }
    
    closeModal();
  };

  return (
    <div className="modal-overlay">
      <div className="admin-modal">
        <div className="modal-header">
          <h2>{action === 'add' ? 'Agregar Parcela' : 'Eliminar Parcela'}</h2>
          <button className="close-button" onClick={closeModal}>
            &times;
          </button>
        </div>
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            {action === 'add' ? (
              <>
                <div className="form-group">
                  <label htmlFor="parcelName">Nombre de la Parcela:</label>
                  <input
                    type="text"
                    id="parcelName"
                    value={parcelName}
                    onChange={(e) => setParcelName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="parcelSize">Tamaño (m²):</label>
                  <input
                    type="number"
                    id="parcelSize"
                    value={parcelSize}
                    onChange={(e) => setParcelSize(e.target.value)}
                    required
                  />
                </div>
              </>
            ) : (
              <div className="form-group">
                <label htmlFor="parcelSelect">Seleccionar Parcela a Eliminar:</label>
                <select
                  id="parcelSelect"
                  value={selectedParcel}
                  onChange={(e) => setSelectedParcel(e.target.value)}
                  required
                >
                  <option value="">Seleccione una parcela</option>
                  <option value="Parcela #1">Parcela #1</option>
                  <option value="Parcela #2">Parcela #2</option>
                  <option value="Parcela #3">Parcela #3</option>
                </select>
              </div>
            )}
            <div className="modal-buttons">
              <button type="button" onClick={closeModal}>
                Cancelar
              </button>
              <button type="submit">
                {action === 'add' ? 'Agregar' : 'Eliminar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminParcelModal;