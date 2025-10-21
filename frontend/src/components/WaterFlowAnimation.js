// frontend/src/components/WaterFlowAnimation.js
import React, { useState, useEffect, useRef } from 'react';
import './WaterFlowAnimation.css';

const WaterFlowAnimation = ({ flowData, valveStates, waterLevel, isSimulationRunning }) => {
  const [animationData, setAnimationData] = useState({
    particles: [],
    flowPaths: [],
    pressureWaves: []
  });
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Crear partículas de agua
  const createWaterParticle = (x, y, velocity, size = 2) => ({
    id: Math.random().toString(36).substr(2, 9),
    x,
    y,
    velocityX: velocity.x,
    velocityY: velocity.y,
    size,
    opacity: 0.8,
    life: 1.0,
    color: '#4FC3F7'
  });

  // Crear ondas de presión
  const createPressureWave = (x, y, intensity) => ({
    id: Math.random().toString(36).substr(2, 9),
    x,
    y,
    radius: 0,
    maxRadius: 20 + intensity * 10,
    intensity,
    opacity: 0.6,
    life: 1.0
  });

  // Animar partículas y ondas
  useEffect(() => {
    if (!isSimulationRunning) return;

    const animate = () => {
      setAnimationData(prev => {
        const newData = { ...prev };

        // Actualizar partículas existentes
        newData.particles = newData.particles
          .map(particle => ({
            ...particle,
            x: particle.x + particle.velocityX,
            y: particle.y + particle.velocityY,
            life: particle.life - 0.02,
            opacity: particle.life * 0.8
          }))
          .filter(particle => particle.life > 0);

        // Actualizar ondas de presión
        newData.pressureWaves = newData.pressureWaves
          .map(wave => ({
            ...wave,
            radius: wave.radius + 2,
            life: wave.life - 0.01,
            opacity: wave.life * 0.6
          }))
          .filter(wave => wave.life > 0);

        // Crear nuevas partículas basadas en válvulas abiertas
        Object.entries(valveStates).forEach(([parcelId, valve]) => {
          if (valve.isOpen && valve.flowRate > 0) {
            // Crear partículas en la tubería principal
            if (Math.random() < 0.3) {
              newData.particles.push(createWaterParticle(
                100 + Math.random() * 200, // Posición X en tubería principal
                50, // Posición Y fija
                { x: 2 + Math.random() * 2, y: 0 }, // Velocidad hacia la derecha
                2 + Math.random() * 2
              ));
            }

            // Crear partículas en las cintas de riego
            if (Math.random() < 0.2) {
              const parcelIndex = Object.keys(valveStates).indexOf(parcelId);
              newData.particles.push(createWaterParticle(
                300 + parcelIndex * 150, // Posición X de la parcela
                200 + Math.random() * 50, // Posición Y variable
                { x: 1 + Math.random(), y: 1 + Math.random() }, // Velocidad variable
                1 + Math.random()
              ));
            }

            // Crear ondas de presión en válvulas
            if (Math.random() < 0.1) {
              const parcelIndex = Object.keys(valveStates).indexOf(parcelId);
              newData.pressureWaves.push(createPressureWave(
                300 + parcelIndex * 150,
                150,
                valve.flowRate / 25 // Intensidad basada en flujo
              ));
            }
          }
        });

        return newData;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isSimulationRunning, valveStates]);

  // Renderizar en canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dibujar tubería principal
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(50, 50);
      ctx.lineTo(400, 50);
      ctx.stroke();

      // Dibujar conexiones Tee
      Object.keys(valveStates).forEach((parcelId, index) => {
        const x = 100 + index * 100;
        const y = 50;
        
        // Línea vertical hacia abajo
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 100);
        ctx.stroke();

        // Cinta de riego horizontal
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x, y + 100);
        ctx.lineTo(x + 80, y + 100);
        ctx.stroke();
      });

      // Dibujar partículas de agua
      animationData.particles.forEach(particle => {
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Dibujar ondas de presión
      animationData.pressureWaves.forEach(wave => {
        ctx.save();
        ctx.globalAlpha = wave.opacity;
        ctx.strokeStyle = '#4FC3F7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      requestAnimationFrame(render);
    };

    render();
  }, [animationData, valveStates]);

  const getFlowIntensity = () => {
    const totalFlow = Object.values(valveStates).reduce((sum, valve) => sum + valve.flowRate, 0);
    return Math.min(100, (totalFlow / 50) * 100); // Normalizar a 0-100%
  };

  const getPressureColor = (pressure) => {
    if (pressure < 1.5) return '#F44336'; // Rojo - Baja presión
    if (pressure < 2.0) return '#FF9800'; // Naranja - Presión media
    if (pressure < 2.5) return '#4CAF50'; // Verde - Presión buena
    return '#2196F3'; // Azul - Presión óptima
  };

  return (
    <div className="water-flow-animation">
      <div className="flow-header">
        <h3>💧 Animación del Flujo de Agua</h3>
        <div className="flow-intensity">
          <span>Intensidad del Flujo:</span>
          <div className="intensity-bar">
            <div 
              className="intensity-fill"
              style={{ 
                width: `${getFlowIntensity()}%`,
                backgroundColor: getFlowIntensity() > 50 ? '#4CAF50' : '#FF9800'
              }}
            ></div>
          </div>
          <span>{getFlowIntensity().toFixed(1)}%</span>
        </div>
      </div>

      <div className="animation-container">
        <canvas 
          ref={canvasRef}
          className="flow-canvas"
        ></canvas>
        
        <div className="flow-overlay">
          <div className="system-diagram">
            {/* Tanque */}
            <div className="tank-indicator">
              <div className="tank-icon">🌊</div>
              <div className="tank-level">
                <div 
                  className="tank-fill"
                  style={{ height: `${waterLevel}%` }}
                ></div>
              </div>
              <span className="tank-label">Tanque {waterLevel.toFixed(0)}%</span>
            </div>

            {/* Tubería Principal */}
            <div className="main-pipe-indicator">
              <div className="pipe-icon">🔧</div>
              <div className="pipe-flow">
                {isSimulationRunning && Object.values(valveStates).some(v => v.isOpen) && (
                  <div className="flow-arrow">→</div>
                )}
              </div>
              <span className="pipe-label">Tubería Principal</span>
            </div>

            {/* Válvulas y Parcelas */}
            <div className="valves-container">
              {Object.entries(valveStates).map(([parcelId, valve], index) => (
                <div key={parcelId} className="valve-indicator">
                  <div className={`valve-icon ${valve.isOpen ? 'open' : 'closed'}`}>
                    {valve.isOpen ? '🔓' : '🔒'}
                  </div>
                  <div className="valve-flow">
                    {valve.isOpen && (
                      <div className="drip-indicator">
                        <div className="drip-drop">💧</div>
                        <div className="drip-drop">💧</div>
                        <div className="drip-drop">💧</div>
                      </div>
                    )}
                  </div>
                  <span className="valve-label">Parcela {index + 1}</span>
                  <span className="flow-rate">{valve.flowRate.toFixed(1)} L/min</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flow-metrics">
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon">💧</div>
            <div className="metric-content">
              <span className="metric-label">Flujo Total</span>
              <span className="metric-value">
                {flowData.totalFlow?.toFixed(1) || 0} L/min
              </span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">🔧</div>
            <div className="metric-content">
              <span className="metric-label">Presión</span>
              <span 
                className="metric-value"
                style={{ color: getPressureColor(flowData.pressure || 0) }}
              >
                {flowData.pressure?.toFixed(1) || 0} bar
              </span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">🚰</div>
            <div className="metric-content">
              <span className="metric-label">Válvulas Activas</span>
              <span className="metric-value">
                {flowData.activeValves || 0} / {Object.keys(valveStates).length}
              </span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">⏱️</div>
            <div className="metric-content">
              <span className="metric-label">Última Actualización</span>
              <span className="metric-value">
                {flowData.timestamp ? new Date(flowData.timestamp).toLocaleTimeString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flow-legend">
        <h4>Leyenda del Flujo</h4>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color flow-high"></div>
            <span>Flujo Alto (&gt;30 L/min)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color flow-medium"></div>
            <span>Flujo Medio (15-30 L/min)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color flow-low"></div>
            <span>Flujo Bajo (&lt;15 L/min)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color pressure-optimal"></div>
            <span>Presión Óptima (&gt;2.5 bar)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color pressure-low"></div>
            <span>Presión Baja (&lt;2.0 bar)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaterFlowAnimation;
