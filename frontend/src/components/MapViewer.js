import React, { useState, useEffect } from 'react';
import './MapViewer.css';

const MapViewer = ({ onClose }) => {
  const [savedMaps, setSavedMaps] = useState([]);
  const [selectedMap, setSelectedMap] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

  useEffect(() => {
    loadSavedMaps();
  }, []);

  const loadSavedMaps = () => {
    const maps = JSON.parse(localStorage.getItem('savedMaps') || '[]');
    setSavedMaps(maps);
  };

  const getHumidityColor = (humidity) => {
    if (humidity >= 80) return '#2e7d32';
    if (humidity >= 60) return '#66bb6a';
    if (humidity >= 40) return '#ffee58';
    if (humidity >= 20) return '#ffa726';
    return '#ef5350';
  };

  const getHumidityStatus = (humidity) => {
    if (humidity < 20) return 'Muy Seco';
    if (humidity < 40) return 'Seco';
    if (humidity < 60) return 'Óptimo';
    if (humidity < 80) return 'Húmedo';
    return 'Muy Húmedo';
  };

  const viewMap = (map) => {
    setSelectedMap(map);
    setViewMode('map');
  };

  const deleteMap = (mapName) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el mapa "${mapName}"?`)) {
      const updatedMaps = savedMaps.filter(map => map.name !== mapName);
      localStorage.setItem('savedMaps', JSON.stringify(updatedMaps));
      setSavedMaps(updatedMaps);
      if (selectedMap && selectedMap.name === mapName) {
        setSelectedMap(null);
        setViewMode('list');
      }
    }
  };

  const goBackToList = () => {
    setSelectedMap(null);
    setViewMode('list');
  };

  if (viewMode === 'map' && selectedMap) {
    return (
      <div className="map-viewer-container">
        <div className="map-viewer-header">
          <div className="header-left">
            <button className="btn-back" onClick={goBackToList}>
              <i className="fa fa-arrow-left"></i> Volver a Lista
            </button>
            <h2>{selectedMap.name}</h2>
          </div>
          <div className="header-right">
            <span className="map-info">
              {selectedMap.parcels.length} parcelas • 
              Creado: {new Date(selectedMap.createdAt).toLocaleDateString()}
            </span>
            <button className="btn-close" onClick={onClose}>
              <i className="fa fa-times"></i> Cerrar
            </button>
          </div>
        </div>

        <div className="map-viewer-content">
          <div className="map-display">
            <div className="map-canvas">
              {selectedMap.parcels.map(parcel => (
                <div
                  key={parcel.id}
                  className="map-parcel-view"
                  style={{
                    left: parcel.x,
                    top: parcel.y,
                    width: parcel.width,
                    height: parcel.height,
                    backgroundColor: parcel.color
                  }}
                >
                  <div className="parcel-content">
                    <div className="parcel-name">{parcel.name}</div>
                    <div className="parcel-humidity">{parcel.humidity}%</div>
                    <div className="parcel-status">{getHumidityStatus(parcel.humidity)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="map-details">
            <h3>Detalles del Mapa</h3>
            <div className="parcels-summary">
              <div className="summary-stats">
                <div className="stat-item">
                  <span className="stat-label">Total Parcelas:</span>
                  <span className="stat-value">{selectedMap.parcels.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Humedad Promedio:</span>
                  <span className="stat-value">
                    {Math.round(selectedMap.parcels.reduce((sum, p) => sum + p.humidity, 0) / selectedMap.parcels.length)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="parcels-table">
              <h4>Parcelas en el Mapa</h4>
              <table>
                <thead>
                  <tr>
                    <th>Parcela</th>
                    <th>Humedad</th>
                    <th>Estado</th>
                    <th>Posición</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedMap.parcels.map(parcel => (
                    <tr key={parcel.id}>
                      <td>{parcel.name}</td>
                      <td>{parcel.humidity}%</td>
                      <td>
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: parcel.color }}
                        >
                          {getHumidityStatus(parcel.humidity)}
                        </span>
                      </td>
                      <td>({Math.round(parcel.x)}, {Math.round(parcel.y)})</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="map-legend">
              <h4>Leyenda de Humedad</h4>
              <div className="legend-items">
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#ef5350' }}></div>
                  <span>Muy Seco (0-20%)</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#ffa726' }}></div>
                  <span>Seco (20-40%)</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#ffee58' }}></div>
                  <span>Óptimo (40-60%)</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#66bb6a' }}></div>
                  <span>Húmedo (60-80%)</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#2e7d32' }}></div>
                  <span>Muy Húmedo (80-100%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="map-viewer-container">
      <div className="map-viewer-header">
        <h2>Mapas de Parcelas Guardados</h2>
        <button className="btn-close" onClick={onClose}>
          <i className="fa fa-times"></i> Cerrar
        </button>
      </div>

      <div className="map-viewer-content">
        {savedMaps.length === 0 ? (
          <div className="empty-state">
            <i className="fa fa-map"></i>
            <h3>No hay mapas guardados</h3>
            <p>Usa el "Diseñar Mapa" para crear y guardar mapas de parcelas</p>
          </div>
        ) : (
          <div className="maps-grid">
            {savedMaps.map((map, index) => (
              <div key={index} className="map-card">
                <div className="map-card-header">
                  <h3>{map.name}</h3>
                  <div className="map-actions">
                    <button 
                      className="btn-view" 
                      onClick={() => viewMap(map)}
                      title="Ver mapa"
                    >
                      <i className="fa fa-eye"></i>
                    </button>
                    <button 
                      className="btn-delete" 
                      onClick={() => deleteMap(map.name)}
                      title="Eliminar mapa"
                    >
                      <i className="fa fa-trash"></i>
                    </button>
                  </div>
                </div>
                
                <div className="map-card-content">
                  <div className="map-preview">
                    {map.parcels.slice(0, 6).map(parcel => (
                      <div
                        key={parcel.id}
                        className="preview-parcel"
                        style={{
                          backgroundColor: parcel.color,
                          left: `${(parcel.x / 800) * 100}%`,
                          top: `${(parcel.y / 600) * 100}%`
                        }}
                        title={`${parcel.name} - ${parcel.humidity}%`}
                      ></div>
                    ))}
                    {map.parcels.length > 6 && (
                      <div className="more-parcels">
                        +{map.parcels.length - 6} más
                      </div>
                    )}
                  </div>
                  
                  <div className="map-info">
                    <div className="info-item">
                      <i className="fa fa-th"></i>
                      <span>{map.parcels.length} parcelas</span>
                    </div>
                    <div className="info-item">
                      <i className="fa fa-calendar"></i>
                      <span>{new Date(map.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="info-item">
                      <i className="fa fa-tint"></i>
                      <span>
                        {Math.round(map.parcels.reduce((sum, p) => sum + p.humidity, 0) / map.parcels.length)}% humedad promedio
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapViewer;
