import React, { useState, useEffect, useRef } from 'react';
import './MapDesigner.css';

const MapDesigner = ({ onClose, parcels = [] }) => {
  const [mapParcels, setMapParcels] = useState([]);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [mapName, setMapName] = useState('');
  const [showParcelForm, setShowParcelForm] = useState(false);
  const [newParcelName, setNewParcelName] = useState('');
  const [newParcelHumidity, setNewParcelHumidity] = useState(50);
  const mapRef = useRef(null);

  // Inicializar con parcelas existentes del dashboard
  useEffect(() => {
    if (parcels && parcels.length > 0) {
      const initialMapParcels = parcels.map((parcel, index) => ({
        id: parcel.id,
        name: parcel.name,
        humidity: parcel.humidity || 50,
        x: 100 + (index * 200),
        y: 100 + (index * 150),
        width: 120,
        height: 80,
        color: getHumidityColor(parcel.humidity || 50)
      }));
      setMapParcels(initialMapParcels);
    }
  }, [parcels]);

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

  const handleMouseDown = (e, parcel) => {
    e.preventDefault();
    setSelectedParcel(parcel);
    setIsDragging(true);
    
    const rect = mapRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - parcel.x;
    const offsetY = e.clientY - rect.top - parcel.y;
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !selectedParcel) return;
    
    const rect = mapRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragOffset.x;
    const newY = e.clientY - rect.top - dragOffset.y;
    
    // Mantener dentro de los límites del mapa
    const boundedX = Math.max(0, Math.min(newX, rect.width - selectedParcel.width));
    const boundedY = Math.max(0, Math.min(newY, rect.height - selectedParcel.height));
    
    setMapParcels(prev => prev.map(p => 
      p.id === selectedParcel.id 
        ? { ...p, x: boundedX, y: boundedY }
        : p
    ));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setSelectedParcel(null);
  };

  const addNewParcel = () => {
    if (!newParcelName.trim()) return;
    
    const newParcel = {
      id: Date.now(), // ID temporal
      name: newParcelName,
      humidity: newParcelHumidity,
      x: 50 + (mapParcels.length * 150),
      y: 50 + (mapParcels.length * 100),
      width: 120,
      height: 80,
      color: getHumidityColor(newParcelHumidity)
    };
    
    setMapParcels(prev => [...prev, newParcel]);
    setNewParcelName('');
    setNewParcelHumidity(50);
    setShowParcelForm(false);
  };

  const updateParcelHumidity = (parcelId, newHumidity) => {
    setMapParcels(prev => prev.map(p => 
      p.id === parcelId 
        ? { ...p, humidity: newHumidity, color: getHumidityColor(newHumidity) }
        : p
    ));
  };

  const deleteParcel = (parcelId) => {
    setMapParcels(prev => prev.filter(p => p.id !== parcelId));
  };

  const saveMap = async () => {
    if (!mapName.trim()) {
      alert('Por favor ingresa un nombre para el mapa');
      return;
    }
    
    if (mapParcels.length === 0) {
      alert('Agrega al menos una parcela al mapa antes de guardar');
      return;
    }
    
    try {
      const token = localStorage.getItem('authToken');
      
      const mapData = {
        mapName: mapName,
        parcels: mapParcels.map(p => ({
          name: p.name,
          humidity: p.humidity,
          x: p.x,
          y: p.y,
          width: p.width,
          height: p.height
        }))
      };
      
      const response = await fetch('http://localhost:4000/api/maps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(mapData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al guardar el mapa');
      }
      
      const result = await response.json();
      
      alert(`✅ Mapa "${mapName}" guardado exitosamente!\n\n` +
            `📍 ${result.map.parcels.length} parcelas creadas\n` +
            `📡 ${result.map.parcels.length} sensores configurados\n\n` +
            `Las parcelas ahora aparecerán en tu Dashboard`);
      
      setMapName('');
      setMapParcels([]);
      
    } catch (error) {
      console.error('Error al guardar mapa:', error);
      alert('Error al guardar el mapa: ' + error.message);
    }
  };

  const loadMap = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('http://localhost:4000/api/maps', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar mapas');
      }
      
      const maps = await response.json();
      
      if (maps.length === 0) {
        alert('No hay mapas guardados');
        return;
      }
      
      // Mostrar lista de mapas disponibles
      const mapsList = maps.map((m, idx) => 
        `${idx + 1}. ${m.map_name} (${new Date(m.created_at).toLocaleDateString('es-GT')})`
      ).join('\n');
      
      const selection = prompt(`Mapas disponibles:\n\n${mapsList}\n\nIngresa el número del mapa que deseas cargar:`);
      
      const index = parseInt(selection) - 1;
      if (index >= 0 && index < maps.length) {
        const selectedMap = maps[index];
        
        // Cargar detalles del mapa
        const detailResponse = await fetch(`http://localhost:4000/api/maps/${selectedMap.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!detailResponse.ok) {
          throw new Error('Error al cargar detalles del mapa');
        }
        
        const mapDetails = await detailResponse.json();
        
        // Cargar parcelas del mapa con sus posiciones
        const loadedParcels = mapDetails.parcels.map(p => ({
          id: p.id,
          name: p.name,
          humidity: p.humidity,
          x: p.x,
          y: p.y,
          width: p.width,
          height: p.height,
          color: getHumidityColor(p.humidity)
        }));
        
        setMapParcels(loadedParcels);
        setMapName(mapDetails.map_name);
        alert(`✅ Mapa "${mapDetails.map_name}" cargado con ${loadedParcels.length} parcelas`);
      } else {
        alert('Selección inválida');
      }
      
    } catch (error) {
      console.error('Error al cargar mapa:', error);
      alert('Error al cargar el mapa: ' + error.message);
    }
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e) => handleMouseMove(e);
    const handleGlobalMouseUp = () => handleMouseUp();
    
    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, selectedParcel, dragOffset]);

  return (
    <div className="map-designer-container">
      <div className="map-designer-header">
        <h2>Diseñador de Mapas de Parcelas</h2>
        <div className="header-buttons">
          <button className="btn-secondary" onClick={loadMap}>
            <i className="fa fa-folder-open"></i> Cargar Mapa
          </button>
          <button className="btn-primary" onClick={saveMap}>
            <i className="fa fa-save"></i> Guardar Mapa
          </button>
          <button className="btn-close" onClick={onClose}>
            <i className="fa fa-times"></i> Cerrar
          </button>
        </div>
      </div>

      <div className="map-designer-content">
        <div className="map-toolbar">
          <div className="toolbar-section">
            <h4>Nuevo Mapa</h4>
            <input
              type="text"
              placeholder="Nombre del mapa"
              value={mapName}
              onChange={(e) => setMapName(e.target.value)}
              className="map-name-input"
            />
          </div>
          
          <div className="toolbar-section">
            <h4>Agregar Parcela</h4>
            <button 
              className="btn-add" 
              onClick={() => setShowParcelForm(!showParcelForm)}
            >
              <i className="fa fa-plus"></i> Nueva Parcela
            </button>
          </div>

          {showParcelForm && (
            <div className="parcel-form">
              <input
                type="text"
                placeholder="Nombre de la parcela"
                value={newParcelName}
                onChange={(e) => setNewParcelName(e.target.value)}
              />
              <input
                type="number"
                min="0"
                max="100"
                placeholder="Humedad (%)"
                value={newParcelHumidity}
                onChange={(e) => setNewParcelHumidity(parseInt(e.target.value) || 0)}
              />
              <button onClick={addNewParcel} className="btn-confirm">
                <i className="fa fa-check"></i> Agregar
              </button>
              <button onClick={() => setShowParcelForm(false)} className="btn-cancel">
                <i className="fa fa-times"></i> Cancelar
              </button>
            </div>
          )}
        </div>

        <div className="map-canvas-container">
          <div 
            ref={mapRef}
            className="map-canvas"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {mapParcels.map(parcel => (
              <div
                key={parcel.id}
                className={`map-parcel ${selectedParcel?.id === parcel.id ? 'selected' : ''}`}
                style={{
                  left: parcel.x,
                  top: parcel.y,
                  width: parcel.width,
                  height: parcel.height,
                  backgroundColor: parcel.color
                }}
                onMouseDown={(e) => handleMouseDown(e, parcel)}
              >
                <div className="parcel-content">
                  <div className="parcel-name">{parcel.name}</div>
                  <div className="parcel-humidity">{parcel.humidity}%</div>
                  <div className="parcel-status">{getHumidityStatus(parcel.humidity)}</div>
                </div>
                
                <div className="parcel-controls">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={parcel.humidity}
                    onChange={(e) => updateParcelHumidity(parcel.id, parseInt(e.target.value) || 0)}
                    className="humidity-input"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteParcel(parcel.id);
                    }}
                    title="Eliminar parcela"
                  >
                    <i className="fa fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
            
            {mapParcels.length === 0 && (
              <div className="empty-map">
                <i className="fa fa-map"></i>
                <p>No hay parcelas en el mapa</p>
                <p>Agrega parcelas usando el botón "Nueva Parcela"</p>
              </div>
            )}
          </div>
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
  );
};

export default MapDesigner;
