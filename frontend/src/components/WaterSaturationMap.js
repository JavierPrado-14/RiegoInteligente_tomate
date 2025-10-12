import React, { useState, useEffect } from 'react';
import './WaterSaturationMap.css';
import cicloImage from '../assets/images/ciclo.jpg';

const WaterSaturationMap = ({ onClose, parcels = [] }) => {
  const [parcelData, setParcelData] = useState([]);
  const [litrosMap, setLitrosMap] = useState({});
  const [sensors, setSensors] = useState([]);
  const API_BASE_URL = "http://localhost:4000/api";

  // Datos de ejemplo para las parcelas (solo 3 parcelas)
  const initialData = [
    { id: 1, name: "Parcela 1", saturation: 85, row: 0, col: 0 },
    { id: 2, name: "Parcela 2", saturation: 45, row: 0, col: 1 },
    { id: 3, name: "Parcela 3", saturation: 70, row: 0, col: 2 }
  ];

  // Inicializa datos usando parcelas reales del dashboard
  useEffect(() => {
    const fromDashboard = parcels && parcels.length > 0
      ? parcels.map((p, idx) => ({ id: p.id, name: p.name, saturation: Math.round(p.humidity ?? 0), row: 0, col: idx }))
      : initialData;
    setParcelData(fromDashboard);
    const prefill = {};
    fromDashboard.forEach(p => { prefill[p.id] = calcularLitrosSegunHumedad(p.saturation); });
    setLitrosMap(prefill);
    
    // Cargar sensores
    fetchSensors();
    
    // Actualizar conectividad cada 5 segundos
    const interval = setInterval(() => {
      updateSensorConnectivity();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [parcels]);
  
  // Función para obtener sensores
  const fetchSensors = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/sensors`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSensors(data);
      }
    } catch (error) {
      console.error('Error al obtener sensores:', error);
    }
  };
  
  // Función para actualizar conectividad de sensores
  const updateSensorConnectivity = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/sensors/update-connectivity`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSensors(data);
      }
    } catch (error) {
      console.error('Error al actualizar sensores:', error);
    }
  };

  const handleLitrosChange = (parcelId, litros) => {
    setLitrosMap(prev => ({ ...prev, [parcelId]: litros }));
  };

  const registrarUsoAgua = async (parcel) => {
    const litros = parseFloat(litrosMap[parcel.id] ?? calcularLitrosSegunHumedad(parcel.saturation));
    if (!litros || litros <= 0) return;
    try {
      await fetch(`${API_BASE_URL}/agua/uso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parcelaId: parcel.id,
          parcelaNombre: parcel.name,
          litros,
          fecha: new Date().toISOString()
        })
      });
    } catch (e) {
      // noop
    }
  };

  const calcularLitrosSegunHumedad = (saturation) => {
    const deficit = Math.max(0, 70 - (Number.isFinite(saturation) ? saturation : 0));
    return Math.min(50, Number((deficit * 0.5).toFixed(2)));
  };

  const registrarTodosAutomatico = async () => {
    for (const parcel of parcelData) {
      const litros = calcularLitrosSegunHumedad(parcel.saturation);
      if (!litros || litros <= 0) continue; // omitir consumos de 0 L
      try {
        await fetch(`${API_BASE_URL}/agua/uso`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            parcelaId: parcel.id,
            parcelaNombre: parcel.name,
            litros,
            fecha: new Date().toISOString()
          })
        });
      } catch (_) {}
    }
  };

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
        <div style={{marginTop: 6}}>
          <input
            type="number"
            min="0"
            step="0.1"
            placeholder="Litros consumidos"
            value={litrosMap[parcel.id] || ''}
            onChange={(e) => handleLitrosChange(parcel.id, e.target.value)}
            style={{ width: '100%', padding: '4px 6px' }}
          />
          <button onClick={() => registrarUsoAgua(parcel)} style={{ marginTop: 6 }}>
            Registrar consumo
          </button>
        </div>
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
          <div style={{ marginTop: 12 }}>
            <button onClick={registrarTodosAutomatico}>Registrar todos (automático)</button>
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

        {/* Sección de Sensores */}
        <div className="sensors-section">
          <h3>
            <i className="fa fa-wifi"></i> Sensores de Humedad (Soil Moisture Sensor)
            <span className="realtime-badge">🔴 En Tiempo Real</span>
          </h3>
          
          {sensors.length === 0 ? (
            <div className="no-sensors">
              <p>No hay sensores configurados</p>
            </div>
          ) : (
            <div className="sensors-grid">
              {sensors.map(sensor => {
                const connectivityClass = 
                  sensor.connectivity_status === 'stable' ? 'connectivity-stable' :
                  sensor.connectivity_status === 'medium' ? 'connectivity-medium' :
                  'connectivity-low';
                
                const connectivityText = 
                  sensor.connectivity_status === 'stable' ? 'Estable' :
                  sensor.connectivity_status === 'medium' ? 'Media' :
                  'Baja';
                
                const connectivityIcon = 
                  sensor.connectivity_status === 'stable' ? '✅' :
                  sensor.connectivity_status === 'medium' ? '⚠️' :
                  '❌';
                
                return (
                  <div key={sensor.id} className={`sensor-card ${connectivityClass}`}>
                    <div className="sensor-header">
                      <h4>{sensor.sensor_name}</h4>
                      <span className="sensor-type">{sensor.sensor_type}</span>
                    </div>
                    
                    <div className="sensor-info">
                      <div className="info-row">
                        <span className="label">Parcela:</span>
                        <span className="value">{sensor.parcel_name}</span>
                      </div>
                      
                      <div className="info-row">
                        <span className="label">Humedad:</span>
                        <span className="value">{sensor.humidity}%</span>
                      </div>
                      
                      <div className="info-row">
                        <span className="label">Conectividad:</span>
                        <span className={`connectivity-badge ${connectivityClass}`}>
                          {connectivityIcon} {connectivityText}
                        </span>
                      </div>
                      
                      <div className="info-row">
                        <span className="label">Señal:</span>
                        <span className="value">
                          <div className="signal-bar-container">
                            <div 
                              className="signal-bar" 
                              style={{ width: `${sensor.signal_strength}%` }}
                            >
                              {sensor.signal_strength}%
                            </div>
                          </div>
                        </span>
                      </div>
                      
                      <div className="info-row">
                        <span className="label">Última lectura:</span>
                        <span className="value">
                          {new Date(sensor.last_reading).toLocaleTimeString('es-GT')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WaterSaturationMap;