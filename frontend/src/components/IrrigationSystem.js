// frontend/src/components/IrrigationSystem.js
import React, { useState, useEffect } from 'react';
import './IrrigationSystem.css';

const IrrigationSystem = ({ 
  parcels, 
  waterLevel, 
  valveStates, 
  systemStatus, 
  selectedParcel, 
  onParcelSelect, 
  onValveControl, 
  isSimulationRunning 
}) => {
  const [tankLevel, setTankLevel] = useState(waterLevel);
  const [mainValveOpen, setMainValveOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ok'); // ok, warning, blocked
  const [pressure, setPressure] = useState(2.5);

  // Simular consumo de agua del tanque
  useEffect(() => {
    if (!isSimulationRunning || !mainValveOpen) return;

    const interval = setInterval(() => {
      const activeValves = Object.values(valveStates).filter(valve => valve.isOpen);
      const totalFlow = activeValves.reduce((sum, valve) => sum + valve.flowRate, 0);
      
      // Consumir agua del tanque basado en el flujo total
      const consumption = (totalFlow * 0.1) / 60; // Convertir L/min a %/seg
      setTankLevel(prev => Math.max(0, prev - consumption));
      
      // Simular presión del sistema
      const basePressure = 2.5;
      const flowFactor = Math.min(1, totalFlow / 50); // Normalizar flujo
      setPressure(basePressure - (flowFactor * 0.5));
      
    }, 1000);

    return () => clearInterval(interval);
  }, [isSimulationRunning, mainValveOpen, valveStates]);

  // Controlar válvula principal
  const handleMainValveToggle = () => {
    if (!isSimulationRunning) return;
    setMainValveOpen(!mainValveOpen);
  };

  // Controlar válvulas individuales
  const handleValveToggle = (parcelId) => {
    if (!isSimulationRunning || !mainValveOpen) return;
    
    const valve = valveStates[parcelId];
    const action = valve.isOpen ? 'close' : 'open';
    onValveControl(parcelId, action);
  };

  // Obtener color de humedad
  const getHumidityColor = (humidity) => {
    if (humidity < 20) return '#ff4444'; // Rojo - Seco
    if (humidity < 40) return '#ffaa00'; // Naranja - Poco húmedo
    if (humidity < 60) return '#ffff00'; // Amarillo - Moderado
    if (humidity < 80) return '#88ff88'; // Verde claro - Húmedo
    return '#44ff44'; // Verde - Muy húmedo
  };

  // Obtener estado de la válvula
  const getValveStatus = (parcelId) => {
    const valve = valveStates[parcelId];
    if (!valve) return 'closed';
    return valve.isOpen ? 'open' : 'closed';
  };

  return (
    <div className="irrigation-system">
      <div className="system-title">
        <h3>🌊 Sistema de Riego por Goteo</h3>
        <div className="system-status-indicator">
          <div className={`status-dot ${systemStatus}`}></div>
          <span>{systemStatus === 'watering' ? 'Regando' : 'En Reposo'}</span>
        </div>
      </div>

      <div className="irrigation-diagram">
        {/* Tanque de Agua */}
        <div className="water-tank-container">
          <div className="water-tank">
            <div className="tank-structure">
              <div className="tank-body">
                <div 
                  className="water-level"
                  style={{ height: `${tankLevel}%` }}
                >
                  <div className="water-surface">
                    <div className="water-ripples"></div>
                  </div>
                </div>
                <div className="tank-label">TANQUE DE AGUA</div>
                <div className="tank-level-text">{tankLevel.toFixed(1)}%</div>
              </div>
              <div className="tank-support"></div>
            </div>
          </div>
          
          {/* Válvula Principal */}
          <div className="main-valve-container">
            <button 
              className={`main-valve ${mainValveOpen ? 'open' : 'closed'}`}
              onClick={handleMainValveToggle}
              disabled={!isSimulationRunning}
              title={mainValveOpen ? 'Cerrar Válvula Principal' : 'Abrir Válvula Principal'}
            >
              <i className="fa fa-cog"></i>
            </button>
            <span className="valve-label">Válvula Principal</span>
          </div>
        </div>

        {/* Tubería Principal */}
        <div className="main-pipe">
          <div className="pipe-segment main-segment">
            <div className="pipe-label">CAÑO ¾ PPP</div>
            {mainValveOpen && (
              <div className="water-flow main-flow">
                <div className="flow-particles"></div>
              </div>
            )}
          </div>
          
          {/* Filtro */}
          <div className="filter-container">
            <div className={`filter ${filterStatus}`}>
              <i className="fa fa-filter"></i>
            </div>
            <span className="filter-label">Filtro</span>
            <div className="filter-status">
              {filterStatus === 'ok' && <span className="status-ok">✓ OK</span>}
              {filterStatus === 'warning' && <span className="status-warning">⚠ Atención</span>}
              {filterStatus === 'blocked' && <span className="status-error">✗ Bloqueado</span>}
            </div>
          </div>
        </div>

        {/* Conexiones Tee */}
        <div className="tee-connections">
          {parcels.map((parcel, index) => (
            <div key={parcel.id} className="tee-connection">
              <div className="tee-joint">
                <div className="tee-pipe"></div>
                <div className="tee-branch"></div>
              </div>
              
              {/* Válvula Solenoide */}
              <div className="solenoid-valve-container">
                <button 
                  className={`solenoid-valve ${getValveStatus(parcel.id)}`}
                  onClick={() => handleValveToggle(parcel.id)}
                  disabled={!isSimulationRunning || !mainValveOpen}
                  title={`${getValveStatus(parcel.id) === 'open' ? 'Cerrar' : 'Abrir'} Válvula ${parcel.name}`}
                >
                  <i className="fa fa-power-off"></i>
                </button>
                <span className="valve-label">Solenoide</span>
              </div>

              {/* Cinta de Riego */}
              <div className="drip-tape">
                <div className="tape-segment">
                  {getValveStatus(parcel.id) === 'open' && mainValveOpen && (
                    <div className="water-flow drip-flow">
                      <div className="drip-drops"></div>
                    </div>
                  )}
                </div>
                <div className="tape-label">Cinta de Riego</div>
              </div>

              {/* Parcela */}
              <div 
                className={`parcel-plot ${selectedParcel?.id === parcel.id ? 'selected' : ''}`}
                onClick={() => onParcelSelect(parcel)}
                style={{ 
                  backgroundColor: getHumidityColor(parcel.humidity),
                  opacity: parcel.humidity < 20 ? 0.7 : 1
                }}
              >
                <div className="parcel-content">
                  <div className="parcel-name">{parcel.name}</div>
                  <div className="parcel-humidity">{parcel.humidity}%</div>
                  <div className="parcel-crops">
                    {parcel.humidity < 20 ? '🍅' : parcel.humidity < 40 ? '🥬' : '🌱'}
                  </div>
                  <div className="parcel-sensor">
                    <i className="fa fa-podcast"></i>
                  </div>
                </div>
                
                {/* Indicador de riego activo */}
                {getValveStatus(parcel.id) === 'open' && mainValveOpen && (
                  <div className="watering-indicator">
                    <i className="fa fa-tint"></i>
                    <span>Regando</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Panel de Control */}
      <div className="control-panel">
        <h4>Panel de Control</h4>
        <div className="control-grid">
          <div className="control-item">
            <span className="control-label">Presión del Sistema:</span>
            <span className="control-value">{pressure.toFixed(1)} bar</span>
          </div>
          <div className="control-item">
            <span className="control-label">Válvulas Abiertas:</span>
            <span className="control-value">
              {Object.values(valveStates).filter(v => v.isOpen).length} / {parcels.length}
            </span>
          </div>
          <div className="control-item">
            <span className="control-label">Flujo Total:</span>
            <span className="control-value">
              {Object.values(valveStates).reduce((sum, v) => sum + v.flowRate, 0).toFixed(1)} L/min
            </span>
          </div>
          <div className="control-item">
            <span className="control-label">Estado del Filtro:</span>
            <span className={`control-value filter-${filterStatus}`}>
              {filterStatus === 'ok' ? 'Normal' : filterStatus === 'warning' ? 'Atención' : 'Bloqueado'}
            </span>
          </div>
        </div>
      </div>

      {/* Leyenda */}
      <div className="system-legend">
        <h4>Leyenda del Sistema</h4>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color humidity-dry"></div>
            <span>Seco (&lt;20%)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color humidity-low"></div>
            <span>Poco Húmedo (20-40%)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color humidity-moderate"></div>
            <span>Moderado (40-60%)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color humidity-good"></div>
            <span>Húmedo (60-80%)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color humidity-optimal"></div>
            <span>Óptimo (&gt;80%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IrrigationSystem;
