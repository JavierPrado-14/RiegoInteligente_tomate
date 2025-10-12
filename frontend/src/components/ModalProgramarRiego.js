// frontend/src/components/ModalProgramarRiego.js
import React from "react";
import ProgramarRiego from "./ProgramarRiego"; // El componente que ya tenemos para programar riego

const ModalProgramarRiego = ({ isOpen, closeModal, parcels = [] }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <h2>Programar Riego</h2>
        <ProgramarRiego parcels={parcels} />
        <button className="close-btn" onClick={closeModal}>
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default ModalProgramarRiego;
