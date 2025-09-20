import React, { useState, useEffect } from 'react';
import './WaterSaturationMap.css';
import cicloImage from '../assets/images/ciclo.jpg';

const WaterSaturationMap = ({ onClose }) => {
  const [parcelData, setParcelData] = useState([]);

  // Datos de ejemplo para las parcelas (solo 3 parcelas)
  const initialData = [
    { id: 1, name: "Parcela 1", saturation: 85, row: 0, col: 0 },
    { id: 2, name: "Parcela 2", saturation: 45, row: 0, col: 1 },
    { id: 3, name: "Parcela 3", saturation: 70, row: 0, col: 2 }
  ];

  // Efecto para inicializar datos
  useEffect(() => {
    setParcelData(initialData.map(parcel => ({
      ...parcel,
      saturation: Math.round(parcel.saturation)
    })));

    // Simular actualización de datos en tiempo real
    const interval = setInterval(() => {
      setParcelData(prevData => 
        prevData.map(parcel => ({
          ...parcel,
          saturation: Math.min(100, Math.max(0, Math.round(parcel.saturation + (Math.random() * 10 - 5))))
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Función para obtener el color según la saturación
  const getColor = (saturation) => {
    if (saturation >= 80) return "#2e7d32";
    if (saturation >= 60) return "#66bb6a";
    if (saturation >= 40) return "#ffee58";
    if (saturation >= 20) return "#ffa726";
    return "#ef5350";
  };

  // Función para obtener el texto de estado
  const getStatusText = (saturation) => {
    if (saturation < 20) return "Muy Seco";
    if (saturation < 40) return "Seco";
    if (saturation < 60) return "Óptimo";
    if (saturation < 80) return "Húmedo";
    return "Muy Húmedo";
  };

  // Función para obtener la clase CSS según el estado
  const getStatusClass = (saturation) => {
    if (saturation < 20) return "very-dry";
    if (saturation < 40) return "dry";
    if (saturation < 60) return "optimal";
    if (saturation < 80) return "wet";
    return "very-wet";
  };

  // Función para renderizar una celda del heatmap
  const renderCell = (parcel) => {
    const saturation = Math.round(parcel.saturation);
    const color = getColor(saturation);

    return (
      <div
        key={parcel.id}
        className="heatmap-cell"
        style={{ backgroundColor: color }}
        title={`${parcel.name}: ${saturation}%`}
      >
        <div className="parcel-name">{parcel.name}</div>
        <div className="saturation-value">{saturation}%</div>
        <div className="status-text">{getStatusText(saturation)}</div>
      </div>
    );
  };

  return (
    <div 
      className="saturation-grid-container"
      style={{ backgroundImage: `url(${cicloImage})` }}
    >
      <div className="saturation-content">
        <div className="saturation-header">
          <h2>Mapa de Calor de Saturación de Agua</h2>
          <button className="back-button" onClick={onClose}>
            <i className="fa fa-arrow-left"></i> Regresar al Dashboard
          </button>
        </div>

        <div className="heatmap-container">
          <div className="heatmap-wrapper">
            <div className="heatmap-row">
              {parcelData.map(parcel => renderCell(parcel))}
            </div>
          </div>

          <div className="color-scale">
            <div className="scale-item">
              <div className="color-box" style={{ backgroundColor: "#ef5350" }}></div>
              <span>Muy Seco (0-20%)</span>
            </div>
            <div className="scale-item">
              <div className="color-box" style={{ backgroundColor: "#ffa726" }}></div>
              <span>Seco (20-40%)</span>
            </div>
            <div className="scale-item">
              <div className="color-box" style={{ backgroundColor: "#ffee58" }}></div>
              <span>Óptimo (40-60%)</span>
            </div>
            <div className="scale-item">
              <div className="color-box" style={{ backgroundColor: "#66bb6a" }}></div>
              <span>Húmedo (60-80%)</span>
            </div>
            <div className="scale-item">
              <div className="color-box" style={{ backgroundColor: "#2e7d32" }}></div>
              <span>Muy Húmedo (80-100%)</span>
            </div>
          </div>
        </div>

        <div className="parcels-list">
          <h3>Niveles de Saturación por Parcela</h3>
          <table>
            <thead>
              <tr>
                <th>Parcela</th>
                <th>Saturación</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {parcelData.map(parcel => (
                <tr key={parcel.id}>
                  <td>{parcel.name}</td>
                  <td>{Math.round(parcel.saturation)}%</td>
                  <td>
                    <span className={`status ${getStatusClass(parcel.saturation)}`}>
                      {getStatusText(parcel.saturation)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WaterSaturationMap;