// frontend/src/pages/Dashboard.js
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import ModalProgramarRiego from "../components/ModalProgramarRiego";
import WaterSaturationMap from "../components/WaterSaturationMap";
import AdminParcelModal from "../components/AdminParcelModal";
import AdminReportsModal from "../components/AdminReportsModal";
import MapDesigner from "../components/MapDesigner";
import MapViewer from "../components/MapViewer";
import AdminUsersModal from "../components/AdminUsersModal";
import ParcelImagesModal from "../components/ParcelImagesModal";
import tomatoImage from '../assets/images/tomato.png';
import ParcelMap from "../components/ParcelMap";

const Dashboard = ({ updateAuthStatus }) => {
  const navigate = useNavigate();

  // El estado ahora se inicializa vacío. Se llenará con datos de la API.
  const [parcels, setParcels] = useState([]);
  const [allParcels, setAllParcels] = useState([]); // Todas las parcelas sin filtrar
  const [selectedParcelId, setSelectedParcelId] = useState(null);
  const [maps, setMaps] = useState([]);
  const [selectedMapId, setSelectedMapId] = useState(null); // null = "Todas las parcelas"
  
  const [isWatering, setIsWatering] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaturationModalOpen, setIsSaturationModalOpen] = useState(false);
  const [isHumidityDetecting, setIsHumidityDetecting] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const [userRole, setUserRole] = useState(1);
  const [adminModal, setAdminModal] = useState(null);
  const [showMapDesigner, setShowMapDesigner] = useState(false);
  const [showMapViewer, setShowMapViewer] = useState(false);
  const [showImagesModal, setShowImagesModal] = useState(false);
  
  const detectionIntervalRef = useRef(null);
  const detectionTimeoutRef = useRef(null);
  const latestHumidityRef = useRef(0);
  const executedSchedulesRef = useRef(new Set());

  const currentParcel = parcels.find(p => p.id === selectedParcelId);

  // URL base del backend
  const API_BASE_URL = "http://localhost:4000/api";

  // Función para cargar mapas del usuario
  const fetchMaps = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/maps`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMaps(data);
      }
    } catch (error) {
      console.error("Error al cargar mapas:", error);
    }
  };

  // Función para filtrar parcelas por mapa seleccionado
  const filterParcelsByMap = async (mapId) => {
    setSelectedMapId(mapId);
    
    if (!mapId) {
      // Mostrar todas las parcelas
      setParcels(allParcels);
      if (allParcels.length > 0) {
        setSelectedParcelId(allParcels[0].id);
      }
      return;
    }
    
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/maps/${mapId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.ok) {
        const mapData = await response.json();
        const mapParcels = mapData.parcels.map(p => ({
          id: p.id,
          name: p.name,
          humidity: p.humidity
        }));
        
        setParcels(mapParcels);
        if (mapParcels.length > 0) {
          setSelectedParcelId(mapParcels[0].id);
        }
      }
    } catch (error) {
      console.error("Error al filtrar parcelas por mapa:", error);
    }
  };

  // --- FUNCIÓN PARA OBTENER LAS PARCELAS DESDE LA API ---
  const fetchParcels = async () => {
    try {
      const token = localStorage.getItem("authToken");
      console.log("🔍 Iniciando fetchParcels...");
      console.log("🔑 Token disponible:", !!token);
      
      if (!token) {
        console.log("❌ No hay token, redirigiendo al login");
        navigate('/', { replace: true });
        return;
      }

      console.log("📡 Haciendo petición a:", `${API_BASE_URL}/parcels`);
      const response = await fetch(`${API_BASE_URL}/parcels`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log("📊 Respuesta del servidor:", response.status, response.statusText);

      if (!response.ok) {
        if (response.status === 404) {
          // Si no hay parcelas, inicializar con datos por defecto
          console.log("⚠️ No se encontraron parcelas (404), usando datos por defecto");
          const defaultParcels = [
            { id: 1, name: "Parcela #1", humidity: 19, user_id: 1 },
            { id: 2, name: "Parcela #2", humidity: 49, user_id: 1 },
            { id: 3, name: "Parcela #3", humidity: 34, user_id: 1 }
          ];
          setParcels(defaultParcels);
          setAllParcels(defaultParcels);
          if (defaultParcels.length > 0) {
            setSelectedParcelId(defaultParcels[0].id);
          }
          return;
        }
        throw new Error('Error al obtener las parcelas. Código de estado: ' + response.status);
      }

      const data = await response.json();
      console.log("✅ Datos recibidos del servidor:", data);
      setAllParcels(data); // Guardar todas las parcelas
      setParcels(data); // Mostrar todas inicialmente

      // Si hay parcelas y ninguna está seleccionada, selecciona la primera por defecto
      if (data.length > 0 && selectedParcelId === null) {
        console.log("🎯 Seleccionando primera parcela:", data[0].id);
        setSelectedParcelId(data[0].id);
      } else if (data.length === 0) {
        console.log("⚠️ No hay parcelas en la respuesta");
        // Si no hay parcelas, nos aseguramos de que no haya ninguna seleccionada
        setSelectedParcelId(null);
      }

    } catch (error) {
      console.error("❌ Error en fetchParcels:", error);
      // En caso de error, usar datos por defecto
      console.log("🔄 Usando datos por defecto debido al error");
      const defaultParcels = [
        { id: 1, name: "Parcela #1", humidity: 19, user_id: 1 },
        { id: 2, name: "Parcela #2", humidity: 49, user_id: 1 },
        { id: 3, name: "Parcela #3", humidity: 34, user_id: 1 }
      ];
      setParcels(defaultParcels);
      setAllParcels(defaultParcels);
      if (defaultParcels.length > 0) {
        setSelectedParcelId(defaultParcels[0].id);
      }
      setAlertMessage("Usando datos de demostración. El servidor no está disponible.");
      setAlertType("warning");
    }
  };

  // Carga inicial de datos y rol de usuario
  useEffect(() => {
    fetchParcels();
    fetchMaps(); // Cargar mapas también

    const rol = localStorage.getItem("userRol");
    if (rol) {
      setUserRole(parseInt(rol));
    }
  }, []);

  // Lógica para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRol");
    if (updateAuthStatus) {
      updateAuthStatus(false);
    }
    navigate("/", { replace: true });
  };
  
  // Limpieza de alertas y timers al cambiar de parcela
  useEffect(() => {
    setAlertMessage("");
    setAlertType("");
    setIsHumidityDetecting(false);
    
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
    if (detectionTimeoutRef.current) {
      clearTimeout(detectionTimeoutRef.current);
    }
  }, [selectedParcelId]);

  // Simulación de detección de humedad (versión profesional con animación)
  useEffect(() => {
    if (!isHumidityDetecting || !selectedParcelId) return;

    const selectedAtStart = parcels.find(p => p.id === selectedParcelId);
    const selectedName = selectedAtStart?.name || `Parcela ${selectedParcelId}`;

    // Generar la humedad final que se mostrará después de 10 segundos
    const finalHumidity = Math.floor(Math.random() * 100);
    latestHumidityRef.current = finalHumidity;

    // Auto detención tras 10 segundos - SOLO entonces actualizar la humedad
    detectionTimeoutRef.current = setTimeout(() => {
      setIsHumidityDetecting(false);
      
      // ACTUALIZAR LA HUMEDAD SOLO AL FINAL
      setParcels(currentParcels =>
        currentParcels.map(p =>
          p.id === selectedParcelId ? { ...p, humidity: finalHumidity } : p
        )
      );
      
      if (finalHumidity <= 35) {
        setAlertMessage("Parcela deshidratada, regar ahora.");
        setAlertType("warning");
      } else {
        setAlertMessage("Parcela hidratada, buen trabajo.");
        setAlertType("success");
      }
      
      // Registrar lectura al auto-detener
      try {
        const payload = {
          lectura: finalHumidity,
          fecha: new Date().toISOString(),
          ubicacion: selectedName,
          parcelaId: selectedParcelId
        };
        fetch(`${API_BASE_URL}/humedad/lecturas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => {});
      } catch (_) {}
    }, 10000);

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
      if (detectionTimeoutRef.current) {
        clearTimeout(detectionTimeoutRef.current);
      }
    };
  }, [isHumidityDetecting, selectedParcelId]);

  const handleDetectHumidity = () => {
    if (!currentParcel) return;
    setAlertMessage("");
    setAlertType("");
    setIsHumidityDetecting(true);
  };

  const handleStopHumidityDetection = () => {
    setIsHumidityDetecting(false);
    if (!currentParcel) return;
    const finalHumidity = currentParcel.humidity;
    if (finalHumidity <= 35) {
      setAlertMessage("Parcela deshidratada, regar ahora.");
      setAlertType("warning");
    } else {
      setAlertMessage("Parcela hidratada, buen trabajo.");
      setAlertType("success");
    }
    // Registrar lectura en backend
    try {
      const payload = {
        lectura: finalHumidity,
        fecha: new Date().toISOString(),
        ubicacion: currentParcel.name || `Parcela ${currentParcel.id}`,
        parcelaId: currentParcel.id
      };
      fetch(`${API_BASE_URL}/humedad/lecturas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});
    } catch (_) {
      // Silenciar errores de red para no afectar la UX
    }
  };

  const handleWaterPlants = () => {
    if (!currentParcel) return;
    setIsWatering(true);
    setTimeout(async () => {
      setIsWatering(false);
      const updatedHumidity = 90;
      
      try {
        // Actualizar humedad en la base de datos
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/parcels/${selectedParcelId}/humidity`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ humidity: updatedHumidity })
        });

        if (response.ok) {
          console.log(`💧 Humedad actualizada en parcela ${selectedParcelId}: ${updatedHumidity}%`);
        } else {
          console.error('Error al actualizar humedad en BD');
        }
      } catch (error) {
        console.error('Error al actualizar humedad:', error);
      }

      // Actualizamos la humedad localmente
      setParcels(currentParcels =>
        currentParcels.map(p =>
          p.id === selectedParcelId ? { ...p, humidity: updatedHumidity } : p
        )
      );
      setAlertMessage("Parcela hidratada, buen trabajo.");
      setAlertType("success");
    }, 5000);
  };


  // --- RIEGO PROGRAMADO EN TIEMPO REAL ---
  const calcularLitrosSegunHumedad = (humidity) => {
    const deficit = Math.max(0, 70 - (Number.isFinite(humidity) ? humidity : 0));
    return Math.min(50, Number((deficit * 0.5).toFixed(2)));
  };

  const calcularDuracionSegundos = (humidity) => {
    const deficit = Math.max(0, 70 - (Number.isFinite(humidity) ? humidity : 0));
    return Math.max(10, Math.min(300, Math.floor(deficit * 3))); // 10s a 5min
  };

  const parseFechaHora = (fechaStr, horaStr) => {
    const d = (fechaStr || '').slice(0,10);
    const h = (horaStr || '00:00:00');
    // Interpretar como hora local
    return new Date(`${d}T${h}`);
  };

  const triggerScheduledWatering = (parcelName, scheduleId, humidity, horaFin) => {
    const parcel = parcels.find(p => p.name === parcelName);
    if (!parcel) return;
    if (executedSchedulesRef.current.has(scheduleId)) return;
    executedSchedulesRef.current.add(scheduleId);

    // Calcular duración basada en hora fin programada
    const now = new Date();
    const endTime = parseFechaHora(now.toISOString().slice(0,10), horaFin);
    const durationMs = endTime.getTime() - now.getTime();
    const durationSec = Math.max(10, Math.min(300, Math.floor(durationMs / 1000)));
    
    const litros = calcularLitrosSegunHumedad(humidity ?? parcel.humidity ?? 0);

    setSelectedParcelId(parcel.id);
    setIsWatering(true);
    setTimeout(() => {
      setIsWatering(false);
      const increased = Math.min(100, Math.max(parcel.humidity ?? 0, 70));
      setParcels(curr => curr.map(p => p.id === parcel.id ? { ...p, humidity: increased } : p));
      setAlertMessage(`Riego programado completado en ${parcel.name}.`);
      setAlertType("success");
    }, durationSec * 1000);

    // Registrar consumo de agua
    try {
      fetch(`${API_BASE_URL}/agua/uso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parcelaId: parcel.id,
          parcelaNombre: parcel.name,
          litros,
          fecha: new Date().toISOString()
        })
      }).catch(() => {});
    } catch (_) {}
  };

  useEffect(() => {
    // Chequea cada 10s si hay riegos que deban iniciar ahora
    const interval = setInterval(async () => {
      try {
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, '0');
        const d = String(today.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${d}`;
        const res = await fetch(`${API_BASE_URL}/riego/historial?fechaInicio=${dateStr}&fechaFin=${dateStr}`);
        if (!res.ok) return;
        const rows = await res.json();
        const now = new Date();
        rows.forEach(r => {
          const start = parseFechaHora(r.fecha, r.hora_inicio);
          const end = parseFechaHora(r.fecha, r.hora_fin);
          if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
            const diffMs = now.getTime() - start.getTime();
            const endDiffMs = now.getTime() - end.getTime();
            
            // Iniciar riego si estamos en la ventana de inicio
            if (diffMs >= 0 && diffMs < 15000) { // ventana de 15s
              triggerScheduledWatering(r.parcela, r.id || `${r.fecha}-${r.hora_inicio}-${r.parcela}`, undefined, r.hora_fin);
            }
            // Detener riego si ya pasó la hora fin
            else if (endDiffMs > 0 && endDiffMs < 30000) { // ventana de 30s después de fin
              setIsWatering(false);
              setAlertMessage(`Riego programado finalizado en ${r.parcela}.`);
              setAlertType("info");
            }
          }
        });
      } catch (_) {}
    }, 10000);
    return () => clearInterval(interval);
  }, [API_BASE_URL, parcels]);
  
  // --- FUNCIÓN PARA AGREGAR PARCELA ---
  const handleAddParcel = async () => {
    const parcelName = prompt("Introduce el nombre de la nueva parcela:");
    if (parcelName) {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`${API_BASE_URL}/parcels`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ name: parcelName }),
        });

        if (!response.ok) {
          throw new Error('No se pudo crear la parcela.');
        }

        const newParcel = await response.json();
        setParcels(currentParcels => [...currentParcels, newParcel]);
        setAllParcels(currentAllParcels => [...currentAllParcels, newParcel]);
        setSelectedParcelId(newParcel.id);
        setAlertMessage("Parcela agregada correctamente.");
        setAlertType("success");

      } catch (error) {
        console.error("Error al agregar parcela:", error);
        // En caso de error, agregar parcela localmente
        const newParcel = {
          id: Date.now(), // ID temporal
          name: parcelName,
          humidity: 0,
          user_id: 1
        };
        setParcels(currentParcels => [...currentParcels, newParcel]);
        setAllParcels(currentAllParcels => [...currentAllParcels, newParcel]);
        setSelectedParcelId(newParcel.id);
        setAlertMessage("Parcela agregada localmente (modo demostración).");
        setAlertType("warning");
      }
    }
  };
  
  // --- FUNCIÓN PARA ELIMINAR PARCELA ---
  const handleDeleteParcel = async () => {
    if (!currentParcel) {
      alert("Por favor, selecciona una parcela para eliminar.");
      return;
    }
    
    const isConfirmed = window.confirm(`¿Estás seguro de que deseas eliminar la parcela "${currentParcel.name}"?`);
    if (isConfirmed) {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`${API_BASE_URL}/parcels/${selectedParcelId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('No se pudo eliminar la parcela.');
        }
        
        const newParcels = parcels.filter(p => p.id !== selectedParcelId);
        const newAllParcels = allParcels.filter(p => p.id !== selectedParcelId);
        setParcels(newParcels);
        setAllParcels(newAllParcels);
        setSelectedParcelId(newParcels.length > 0 ? newParcels[0].id : null);
        setAlertMessage("Parcela eliminada correctamente.");
        setAlertType("success");
      
      } catch (error) {
        console.error("Error al eliminar parcela:", error);
        // En caso de error, eliminar localmente
        const newParcels = parcels.filter(p => p.id !== selectedParcelId);
        const newAllParcels = allParcels.filter(p => p.id !== selectedParcelId);
        setParcels(newParcels);
        setAllParcels(newAllParcels);
        setSelectedParcelId(newParcels.length > 0 ? newParcels[0].id : null);
        setAlertMessage("Parcela eliminada localmente (modo demostración).");
        setAlertType("warning");
      }
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const openSaturationModal = () => setIsSaturationModalOpen(true);
  const closeSaturationModal = () => setIsSaturationModalOpen(false);
  const openAdminModal = (modalType) => setAdminModal(modalType);
  const closeAdminModal = () => setAdminModal(null);

  return (
    <div className="dashboard-container">
      <div 
        className="fullscreen-background"
        style={{ backgroundImage: `url(${tomatoImage})` }}
      >
        <div className="content-overlay">
          <button className="logout-button" onClick={handleLogout}>
            <i className="fa fa-sign-out"></i> Cerrar Sesión
          </button>

          <h1>Sistema de Riego Cultivo de Tomate - San Miguel Dueñas</h1>
          
          {/* Selector de Mapas */}
          <div className="map-selector-container">
            <label htmlFor="map-filter">
              <i className="fa fa-map"></i> Filtrar por Mapa:
            </label>
            <select 
              id="map-filter"
              className="map-selector"
              value={selectedMapId || ''}
              onChange={(e) => filterParcelsByMap(e.target.value || null)}
            >
              <option value="">📍 Todas las parcelas ({allParcels.length})</option>
              {maps.map(map => (
                <option key={map.id} value={map.id}>
                  🗺️ {map.map_name}
                </option>
              ))}
            </select>
            {selectedMapId && (
              <button 
                className="btn-clear-filter"
                onClick={() => filterParcelsByMap(null)}
                title="Ver todas las parcelas"
              >
                <i className="fa fa-times"></i> Limpiar filtro
              </button>
            )}
          </div>

          <ParcelMap
            parcels={parcels}
            selectedParcelId={selectedParcelId}
            onParcelSelect={setSelectedParcelId}
          />

          <div className="humidity-container">
            <h2>Humedad del suelo en {currentParcel?.name || 'N/A'}: {currentParcel?.humidity || 0}%</h2>
            {isHumidityDetecting && (
              <div className="detection-loading">
                <div className="sensor-animation">
                  <div className="sensor-waves">
                    <div className="wave wave-1"></div>
                    <div className="wave wave-2"></div>
                    <div className="wave wave-3"></div>
                  </div>
                  <div className="sensor-icon">
                    <i className="fa fa-podcast"></i>
                  </div>
                </div>
                <p className="detection-text">
                  <i className="fa fa-spinner fa-pulse"></i> Analizando sensor de humedad del suelo...
                </p>
                <div className="progress-bar-container">
                  <div className="progress-bar"></div>
                </div>
              </div>
            )}
          </div>

          {alertMessage && (
            <div className={`alert ${alertType === "warning" ? "alert-warning blinking" : alertType === "info" ? "alert-info" : "alert-success surprise"}`} style={{maxWidth: "100%"}}>
              <p>{alertMessage}</p>
            </div>
          )}
          
          <div className="buttons-container">
            <button 
              className="action-button transparent-button"
              onClick={isHumidityDetecting ? handleStopHumidityDetection : handleDetectHumidity}
              disabled={isWatering || !currentParcel}
            >
              {isHumidityDetecting ? 'Detener Detección' : 'Detectar Humedad Del Suelo'}
            </button>
            
            <button 
              className={`action-button transparent-button ${isWatering ? 'watering' : ''}`}
              onClick={handleWaterPlants}
              disabled={isWatering || isHumidityDetecting || !currentParcel}
            >
              {isWatering ? 'Regando...' : 'Regar según humedad'}
            </button>

            <button
              className="action-button transparent-button"
              onClick={openModal}
              disabled={isWatering || isHumidityDetecting || !currentParcel}
            >
              <i className="fa fa-tint"></i> Programar Riego
            </button>

            <button
              className="action-button transparent-button"
              onClick={openSaturationModal}
            >
              <i className="fa fa-fire"></i> Ver Saturación de Agua
            </button>

            <button
              className="action-button transparent-button"
              onClick={() => setShowImagesModal(true)}
              disabled={!currentParcel}
            >
              <i className="fa fa-camera"></i> Ver Fotos de {currentParcel?.name || 'Parcela'}
            </button>

          </div>

          {userRole === 2 && (
            <div className="admin-menu">
              <h3>Herramientas de Administración</h3>
              <div className="admin-buttons">
                <button 
                  className="action-button transparent-button"
                  onClick={handleAddParcel}
                >
                  <i className="fa fa-plus"></i> Agregar Parcela
                </button>
                <button 
                  className="action-button transparent-button"
                  onClick={handleDeleteParcel}
                >
                  <i className="fa fa-trash"></i> Eliminar Parcela
                </button>
                <button 
                  className="action-button transparent-button"
                  onClick={() => openAdminModal('reports')}
                >
                  <i className="fa fa-chart-bar"></i> Reportes de Riego
                </button>
                <button 
                  className="action-button transparent-button"
                  onClick={() => setShowMapDesigner(true)}
                >
                  <i className="fa fa-map"></i> Diseñar Mapa
                </button>
                <button 
                  className="action-button transparent-button"
                  onClick={() => setShowMapViewer(true)}
                >
                  <i className="fa fa-eye"></i> Ver Mapa de Parcelas
                </button>
                <button 
                  className="action-button transparent-button"
                  onClick={() => openAdminModal('users')}
                >
                  <i className="fa fa-users"></i> Gestionar Usuarios
                </button>
              </div>
            </div>
          )}

          {/* Sección para usuarios normales - funciones básicas + gestión de parcelas */}
          {userRole !== 2 && (
            <div className="user-menu">
              <h3>Funciones Disponibles</h3>
              <div className="user-buttons">
                <button 
                  className="action-button transparent-button"
                  onClick={handleAddParcel}
                >
                  <i className="fa fa-plus"></i> Agregar Parcela
                </button>
                <button 
                  className="action-button transparent-button"
                  onClick={handleDeleteParcel}
                >
                  <i className="fa fa-trash"></i> Eliminar Parcela
                </button>
                <button 
                  className="action-button transparent-button"
                  onClick={() => openAdminModal('reports')}
                >
                  <i className="fa fa-chart-bar"></i> Ver Reportes
                </button>
              </div>
            </div>
          )}
          
          {isWatering && (
            <div className="watering-indicator">
              <div className="watering-animation"></div>
              <p>Regando las plantas...</p>
            </div>
          )}
        </div>
      </div>

      <ModalProgramarRiego isOpen={isModalOpen} closeModal={closeModal} parcels={parcels} />
      
      {isSaturationModalOpen && (
        <div className="modal-overlay">
          <div className="saturation-modal">
            <div className="modal-header">
              <h2>Mapa de Saturación de Agua</h2>
              <button className="close-button" onClick={closeSaturationModal}>
                &times;
              </button>
            </div>
            <div className="modal-content">
              <WaterSaturationMap onClose={closeSaturationModal} parcels={parcels} />
            </div>
          </div>
        </div>
      )}

      {/* Modal de Imágenes */}
      <ParcelImagesModal
        isOpen={showImagesModal}
        closeModal={() => setShowImagesModal(false)}
        parcel={currentParcel}
      />

      {/* Modales de Administración */}
      {adminModal === 'reports' && (
        <AdminReportsModal 
          isOpen={true} 
          closeModal={closeAdminModal}
        />
      )}
      
      {/* Componentes de Mapas */}
      {showMapDesigner && (
        <MapDesigner 
          onClose={() => {
            setShowMapDesigner(false);
            // Refrescar parcelas y mapas después de cerrar el diseñador
            fetchParcels();
            fetchMaps();
          }}
          parcels={parcels}
        />
      )}
      
      {showMapViewer && (
        <MapViewer 
          onClose={() => {
            setShowMapViewer(false);
            // Refrescar mapas después de cerrar el visor
            fetchMaps();
          }}
          onMapDeleted={() => {
            // Cuando se elimina un mapa, también actualizar parcelas
            console.log('🗑️ Mapa eliminado, actualizando parcelas...');
            fetchParcels();
            fetchMaps();
          }}
        />
      )}
      
      {adminModal === 'users' && (
        <AdminUsersModal 
          isOpen={true} 
          closeModal={closeAdminModal}
        />
      )}

    </div>
  );
};

export default Dashboard;