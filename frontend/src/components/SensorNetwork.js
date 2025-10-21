// frontend/src/components/SensorNetwork.js
import React, { useState, useEffect } from 'react';
import './SensorNetwork.css';

const SensorNetwork = ({ parcels, sensors, isSimulationRunning, simulationSpeed }) => {
  const [sensorData, setSensorData] = useState({});
  const [connectivityStatus, setConnectivityStatus] = useState({});
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [networkHealth, setNetworkHealth] = useState(100);

  // Simular datos de sensores en tiempo real
  useEffect(() => {
    if (!isSimulationRunning) return;

    const interval = setInterval(() => {
      const newSensorData = {};
      const newConnectivityStatus = {};
      let totalConnectivity = 0;

      parcels.forEach(parcel => {
        // Simular lectura de humedad con pequeñas variaciones
        const currentHumidity = sensorData[parcel.id]?.humidity || parcel.humidity || 0;
        const variation = (Math.random() - 0.5) * 2; // ±1%
        const newHumidity = Math.max(0, Math.min(100, currentHumidity + variation));
        
        // Simular temperatura ambiental
        const temperature = 20 + Math.random() * 15; // 20-35°C
        
        // Simular conectividad WiFi
        const baseConnectivity = 70 + Math.random() * 30; // 70-100%
        const connectivity = Math.max(20, Math.min(100, baseConnectivity + (Math.random() - 0.5) * 10));
        
        // Simular fuerza de señal
        const signalStrength = Math.max(0, Math.min(100, connectivity + (Math.random() - 0.5) * 20));
        
        // Simular batería del sensor
        const battery = Math.max(10, 100 - (Math.random() * 0.1)); // Decrece lentamente
        
        // Simular estado de conectividad
        let status = 'stable';
        if (connectivity < 50) status = 'low';
        else if (connectivity < 80) status = 'medium';
        
        newSensorData[parcel.id] = {
          humidity: newHumidity,
          temperature: temperature,
          connectivity: connectivity,
          signalStrength: signalStrength,
          battery: battery,
          lastReading: new Date().toISOString(),
          status: status
        };

        newConnectivityStatus[parcel.id] = {
          status: status,
          signalStrength: signalStrength,
          lastSeen: new Date().toISOString()
        };

        totalConnectivity += connectivity;
      });

      setSensorData(newSensorData);
      setConnectivityStatus(newConnectivityStatus);
      
      // Calcular salud general de la red
      const avgConnectivity = totalConnectivity / parcels.length;
      setNetworkHealth(avgConnectivity);

    }, 2000 / simulationSpeed); // Ajustar velocidad según simulación

    return () => clearInterval(interval);
  }, [isSimulationRunning, simulationSpeed, parcels, sensorData]);

  const getConnectivityColor = (status) => {
    switch (status) {
      case 'stable': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'low': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getConnectivityIcon = (status) => {
    switch (status) {
      case 'stable': return 'fa-wifi';
      case 'medium': return 'fa-wifi';
      case 'low': return 'fa-wifi';
      default: return 'fa-wifi';
    }
  };

  const getBatteryColor = (battery) => {
    if (battery > 60) return '#4CAF50';
    if (battery > 30) return '#FF9800';
    return '#F44336';
  };

  const getBatteryIcon = (battery) => {
    if (battery > 60) return 'fa-battery-full';
    if (battery > 30) return 'fa-battery-half';
    return 'fa-battery-quarter';
  };

  const getHumidityColor = (humidity) => {
    if (humidity < 20) return '#ff4444';
    if (humidity < 40) return '#ffaa00';
    if (humidity < 60) return '#ffff00';
    if (humidity < 80) return '#88ff88';
    return '#44ff44';
  };

  return (
    <div className="sensor-network">
      <div className="network-header">
        <h3>📡 Red de Sensores IoT</h3>
        <div className="network-health">
          <div className="health-indicator">
            <div 
              className="health-bar"
              style={{ 
                width: `${networkHealth}%`,
                backgroundColor: networkHealth > 80 ? '#4CAF50' : networkHealth > 60 ? '#FF9800' : '#F44336'
              }}
            ></div>
          </div>
          <span className="health-text">Salud de Red: {networkHealth.toFixed(1)}%</span>
        </div>
      </div>

      <div className="sensor-grid">
        {parcels.map((parcel, index) => {
          const data = sensorData[parcel.id] || {
            humidity: parcel.humidity || 0,
            temperature: 25,
            connectivity: 85,
            signalStrength: 90,
            battery: 95,
            lastReading: new Date().toISOString(),
            status: 'stable'
          };

          const connectivity = connectivityStatus[parcel.id] || {
            status: 'stable',
            signalStrength: 90,
            lastSeen: new Date().toISOString()
          };

          return (
            <div 
              key={parcel.id} 
              className={`sensor-card ${selectedSensor === parcel.id ? 'selected' : ''}`}
              onClick={() => setSelectedSensor(selectedSensor === parcel.id ? null : parcel.id)}
            >
              <div className="sensor-header">
                <div className="sensor-title">
                  <i className="fa fa-podcast"></i>
                  <span>{parcel.name}</span>
                </div>
                <div 
                  className={`connectivity-indicator ${connectivity.status}`}
                  style={{ backgroundColor: getConnectivityColor(connectivity.status) }}
                >
                  <i className={`fa ${getConnectivityIcon(connectivity.status)}`}></i>
                </div>
              </div>

              <div className="sensor-data">
                <div className="data-row">
                  <div className="data-item">
                    <i className="fa fa-tint"></i>
                    <span className="data-label">Humedad:</span>
                    <span 
                      className="data-value humidity-value"
                      style={{ color: getHumidityColor(data.humidity) }}
                    >
                      {data.humidity.toFixed(1)}%
                    </span>
                  </div>
                  <div className="data-item">
                    <i className="fa fa-thermometer-half"></i>
                    <span className="data-label">Temp:</span>
                    <span className="data-value">{data.temperature.toFixed(1)}°C</span>
                  </div>
                </div>

                <div className="data-row">
                  <div className="data-item">
                    <i className="fa fa-wifi"></i>
                    <span className="data-label">Señal:</span>
                    <span className="data-value">{data.signalStrength.toFixed(0)}%</span>
                  </div>
                  <div className="data-item">
                    <i className={`fa ${getBatteryIcon(data.battery)}`}></i>
                    <span className="data-label">Batería:</span>
                    <span 
                      className="data-value"
                      style={{ color: getBatteryColor(data.battery) }}
                    >
                      {data.battery.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="sensor-status">
                <div className="status-item">
                  <span className="status-label">Estado:</span>
                  <span className={`status-value ${connectivity.status}`}>
                    {connectivity.status === 'stable' ? 'Estable' : 
                     connectivity.status === 'medium' ? 'Media' : 'Baja'}
                  </span>
                </div>
                <div className="status-item">
                  <span className="status-label">Última lectura:</span>
                  <span className="status-value">
                    {new Date(data.lastReading).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Indicador de actividad */}
              {isSimulationRunning && (
                <div className="activity-indicator">
                  <div className="pulse-dot"></div>
                  <span>Transmitiendo</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Panel de Detalles del Sensor Seleccionado */}
      {selectedSensor && (
        <div className="sensor-details-panel">
          <div className="panel-header">
            <h4>Detalles del Sensor - {parcels.find(p => p.id === selectedSensor)?.name}</h4>
            <button 
              className="close-details"
              onClick={() => setSelectedSensor(null)}
            >
              <i className="fa fa-times"></i>
            </button>
          </div>
          
          <div className="panel-content">
            {(() => {
              const data = sensorData[selectedSensor];
              const connectivity = connectivityStatus[selectedSensor];
              
              if (!data) return <div>Cargando datos del sensor...</div>;

              return (
                <div className="detailed-data">
                  <div className="data-section">
                    <h5>Mediciones Ambientales</h5>
                    <div className="detailed-row">
                      <span>Humedad del Suelo:</span>
                      <span style={{ color: getHumidityColor(data.humidity) }}>
                        {data.humidity.toFixed(2)}%
                      </span>
                    </div>
                    <div className="detailed-row">
                      <span>Temperatura:</span>
                      <span>{data.temperature.toFixed(2)}°C</span>
                    </div>
                  </div>

                  <div className="data-section">
                    <h5>Conectividad</h5>
                    <div className="detailed-row">
                      <span>Fuerza de Señal:</span>
                      <span>{data.signalStrength.toFixed(1)}%</span>
                    </div>
                    <div className="detailed-row">
                      <span>Estado de Conexión:</span>
                      <span className={connectivity.status}>
                        {connectivity.status === 'stable' ? 'Estable' : 
                         connectivity.status === 'medium' ? 'Media' : 'Baja'}
                      </span>
                    </div>
                    <div className="detailed-row">
                      <span>Última Comunicación:</span>
                      <span>{new Date(connectivity.lastSeen).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="data-section">
                    <h5>Estado del Dispositivo</h5>
                    <div className="detailed-row">
                      <span>Nivel de Batería:</span>
                      <span style={{ color: getBatteryColor(data.battery) }}>
                        {data.battery.toFixed(1)}%
                      </span>
                    </div>
                    <div className="detailed-row">
                      <span>Última Lectura:</span>
                      <span>{new Date(data.lastReading).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Estadísticas de la Red */}
      <div className="network-stats">
        <h4>Estadísticas de la Red</h4>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Sensores Activos:</span>
            <span className="stat-value">{parcels.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Conectividad Promedio:</span>
            <span className="stat-value">{networkHealth.toFixed(1)}%</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Sensores Estables:</span>
            <span className="stat-value">
              {Object.values(connectivityStatus).filter(c => c.status === 'stable').length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Batería Promedio:</span>
            <span className="stat-value">
              {Object.values(sensorData).length > 0 
                ? (Object.values(sensorData).reduce((sum, s) => sum + s.battery, 0) / Object.values(sensorData).length).toFixed(1)
                : 0}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SensorNetwork;
