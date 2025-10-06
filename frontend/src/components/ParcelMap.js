// frontend/src/components/ParcelMap.js
import React from 'react';
import './ParcelMap.css';

// Función para determinar el color según la humedad
const getHumidityColor = (humidity) => {
  if (humidity <= 35) return '#e74c3c'; // Rojo (seco)
  if (humidity <= 70) return '#f1c40f'; // Amarillo (húmedo)
  return '#3498db'; // Azul (saturado)
};

const ParcelMap = ({ parcels, selectedParcelId, onParcelSelect }) => {
  return (
    <div className="parcel-map-container">
      {parcels.map((parcel) => (
        <div
          key={parcel.id}
          className={`parcel-block ${parcel.id === selectedParcelId ? 'selected' : ''}`}
          onClick={() => onParcelSelect(parcel.id)}
        >
          <div className="parcel-name">{parcel.name}</div>
          <div className="parcel-humidity">
            <div
              className="humidity-bar"
              style={{
                width: `${parcel.humidity}%`,
                backgroundColor: getHumidityColor(parcel.humidity),
              }}
            ></div>
          </div>
          <div className="parcel-percentage">{parcel.humidity}%</div>
        </div>
      ))}
    </div>
  );
};

export default ParcelMap;