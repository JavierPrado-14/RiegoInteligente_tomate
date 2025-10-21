// frontend/src/components/SimulationModal.js
import React, { useState, useEffect } from 'react';
import './SimulationModal.css';
import IrrigationSystem from './IrrigationSystem';
import SensorNetwork from './SensorNetwork';
import WaterFlowAnimation from './WaterFlowAnimation';

const SimulationModal = ({ isOpen, onClose, parcels, sensors = [] }) => {
  const [activeTab, setActiveTab] = useState('irrigation');
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [waterLevel, setWaterLevel] = useState(85);
  const [systemStatus, setSystemStatus] = useState('idle'); // idle, watering, alert, maintenance
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [valveStates, setValveStates] = useState({});
  const [flowData, setFlowData] = useState({});

  // Inicializar estados de válvulas para cada parcela
  useEffect(() => {
    const initialValveStates = {};
    parcels.forEach(parcel => {
      initialValveStates[parcel.id] = {
        isOpen: false,
        flowRate: 0,
        lastOpened: null
      };
    });
    setValveStates(initialValveStates);
  }, [parcels]);

  // Simular datos de flujo en tiempo real
  useEffect(() => {
    if (!isSimulationRunning) return;

    const interval = setInterval(() => {
      setFlowData(prev => ({
        ...prev,
        timestamp: new Date().toISOString(),
        pressure: 2.5 + Math.random() * 0.5,
        totalFlow: Object.values(valveStates).reduce((sum, valve) => sum + valve.flowRate, 0),
        activeValves: Object.values(valveStates).filter(valve => valve.isOpen).length
      }));
    }, 1000 / simulationSpeed);

    return () => clearInterval(interval);
  }, [isSimulationRunning, simulationSpeed, valveStates]);

  // Control automático basado en humedad
  useEffect(() => {
    if (!isSimulationRunning) return;

    const autoControlInterval = setInterval(() => {
      parcels.forEach(parcel => {
        const valve = valveStates[parcel.id];
        if (!valve) return;

        // Si la humedad es muy baja (< 20%), abrir válvula automáticamente
        if (parcel.humidity < 20 && !valve.isOpen) {
          console.log(`🚨 Humedad crítica en ${parcel.name} (${parcel.humidity}%) - Abriendo válvula automáticamente`);
          handleValveControl(parcel.id, 'open');
        }
        // Si la humedad es adecuada (> 70%), cerrar válvula automáticamente
        else if (parcel.humidity > 70 && valve.isOpen) {
          console.log(`✅ Humedad óptima en ${parcel.name} (${parcel.humidity}%) - Cerrando válvula automáticamente`);
          handleValveControl(parcel.id, 'close');
        }
      });
    }, 5000 / simulationSpeed); // Verificar cada 5 segundos

    return () => clearInterval(autoControlInterval);
  }, [isSimulationRunning, simulationSpeed, parcels, valveStates]);

  const handleStartSimulation = () => {
    setIsSimulationRunning(true);
    setSystemStatus('watering');
  };

  const handleStopSimulation = () => {
    setIsSimulationRunning(false);
    setSystemStatus('idle');
    // Cerrar todas las válvulas
    const closedValves = {};
    Object.keys(valveStates).forEach(parcelId => {
      closedValves[parcelId] = { ...valveStates[parcelId], isOpen: false, flowRate: 0 };
    });
    setValveStates(closedValves);
  };

  const handleValveControl = async (parcelId, action) => {
    if (!isSimulationRunning) return;

    setValveStates(prev => {
      const newStates = { ...prev };
      const valve = newStates[parcelId];
      
      if (action === 'open') {
        valve.isOpen = true;
        valve.flowRate = 15 + Math.random() * 10; // 15-25 L/min
        valve.lastOpened = new Date().toISOString();
        setSystemStatus('watering');
        
        // Simular control real de válvula solenoide
        simulateValveControl(parcelId, 'open');
      } else if (action === 'close') {
        valve.isOpen = false;
        valve.flowRate = 0;
        // Verificar si todas las válvulas están cerradas
        const allClosed = Object.values(newStates).every(v => !v.isOpen);
        if (allClosed) setSystemStatus('idle');
        
        // Simular control real de válvula solenoide
        simulateValveControl(parcelId, 'close');
      }
      
      return newStates;
    });
  };

  // Simular control de válvula solenoide real
  const simulateValveControl = async (parcelId, action) => {
    try {
      const token = localStorage.getItem("authToken");
      const API_BASE_URL = "http://localhost:4000/api";
      
      // Enviar comando al Arduino/sistema de control
      const response = await fetch(`${API_BASE_URL}/sensors/valve-control`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          parcelId: parcelId,
          action: action, // 'open' o 'close'
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        console.log(`✅ Válvula ${action} para parcela ${parcelId} - Comando enviado al Arduino`);
      } else {
        console.log(`⚠️ Simulando control de válvula (servidor no disponible)`);
      }
    } catch (error) {
      console.log(`⚠️ Simulando control de válvula (error de red):`, error.message);
    }
  };

  const handleParcelSelect = (parcel) => {
    setSelectedParcel(parcel);
  };

  const getSystemStatusColor = () => {
    switch (systemStatus) {
      case 'idle': return '#4CAF50';
      case 'watering': return '#2196F3';
      case 'alert': return '#FF9800';
      case 'maintenance': return '#9E9E9E';
      default: return '#4CAF50';
    }
  };

  const getSystemStatusText = () => {
    switch (systemStatus) {
      case 'idle': return 'Sistema en Reposo';
      case 'watering': return 'Regando Parcelas';
      case 'alert': return 'Alerta del Sistema';
      case 'maintenance': return 'Mantenimiento';
      default: return 'Desconocido';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="simulation-modal-overlay">
      <div className="simulation-modal">
        <div className="simulation-header">
          <h2>🌊 Simulación del Sistema de Riego por Goteo</h2>
          <button className="close-button" onClick={onClose}>
            <i className="fa fa-times"></i>
          </button>
        </div>

        <div className="simulation-controls">
          <div className="control-group">
            <button 
              className={`control-btn ${isSimulationRunning ? 'stop' : 'start'}`}
              onClick={isSimulationRunning ? handleStopSimulation : handleStartSimulation}
            >
              <i className={`fa fa-${isSimulationRunning ? 'stop' : 'play'}`}></i>
              {isSimulationRunning ? 'Detener Simulación' : 'Iniciar Simulación'}
            </button>
            
            <div className="speed-control">
              <label>Velocidad:</label>
              <input 
                type="range" 
                min="0.5" 
                max="3" 
                step="0.5" 
                value={simulationSpeed}
                onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
                disabled={!isSimulationRunning}
              />
              <span>{simulationSpeed}x</span>
            </div>
          </div>

          <div className="system-status">
            <div 
              className="status-indicator"
              style={{ backgroundColor: getSystemStatusColor() }}
            ></div>
            <span className="status-text">{getSystemStatusText()}</span>
            {isSimulationRunning && (
              <div className="auto-control-indicator">
                <i className="fa fa-robot"></i>
                <span>Control Automático</span>
              </div>
            )}
          </div>
        </div>

        <div className="simulation-tabs">
          <button 
            className={`tab ${activeTab === 'irrigation' ? 'active' : ''}`}
            onClick={() => setActiveTab('irrigation')}
          >
            <i className="fa fa-tint"></i> Sistema de Riego
          </button>
          <button 
            className={`tab ${activeTab === 'sensors' ? 'active' : ''}`}
            onClick={() => setActiveTab('sensors')}
          >
            <i className="fa fa-podcast"></i> Red de Sensores
          </button>
          <button 
            className={`tab ${activeTab === 'flow' ? 'active' : ''}`}
            onClick={() => setActiveTab('flow')}
          >
            <i className="fa fa-water"></i> Flujo de Agua
          </button>
        </div>

        <div className="simulation-content">
          {activeTab === 'irrigation' && (
            <IrrigationSystem
              parcels={parcels}
              waterLevel={waterLevel}
              valveStates={valveStates}
              systemStatus={systemStatus}
              selectedParcel={selectedParcel}
              onParcelSelect={handleParcelSelect}
              onValveControl={handleValveControl}
              isSimulationRunning={isSimulationRunning}
            />
          )}
          
          {activeTab === 'sensors' && (
            <SensorNetwork
              parcels={parcels}
              sensors={sensors}
              isSimulationRunning={isSimulationRunning}
              simulationSpeed={simulationSpeed}
            />
          )}
          
          {activeTab === 'flow' && (
            <WaterFlowAnimation
              flowData={flowData}
              valveStates={valveStates}
              waterLevel={waterLevel}
              isSimulationRunning={isSimulationRunning}
            />
          )}
        </div>

        <div className="simulation-footer">
          <div className="water-level-indicator">
            <span>Nivel del Tanque:</span>
            <div className="water-level-bar">
              <div 
                className="water-level-fill"
                style={{ width: `${waterLevel}%` }}
              ></div>
            </div>
            <span>{waterLevel}%</span>
          </div>
          
          <div className="flow-stats">
            <div className="stat">
              <span className="stat-label">Flujo Total:</span>
              <span className="stat-value">{flowData.totalFlow?.toFixed(1) || 0} L/min</span>
            </div>
            <div className="stat">
              <span className="stat-label">Válvulas Activas:</span>
              <span className="stat-value">{flowData.activeValves || 0}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Presión:</span>
              <span className="stat-value">{flowData.pressure?.toFixed(1) || 0} bar</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationModal;
