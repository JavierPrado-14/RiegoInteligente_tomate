// frontend/src/pages/Dashboard.js
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import ModalProgramarRiego from "../components/ModalProgramarRiego";
import WaterSaturationMap from "../components/WaterSaturationMap";
import AdminParcelModal from "../components/AdminParcelModal";
import AdminReportsModal from "../components/AdminReportsModal";
import AdminMapDesignModal from "../components/AdminMapDesignModal";
import AdminUsersModal from "../components/AdminUsersModal";
import tomatoImage from '../assets/images/tomato.png';

const Dashboard = ({ updateAuthStatus }) => {
  const navigate = useNavigate();
  const [humidity, setHumidity] = useState(0);
  const [selectedParcel, setSelectedParcel] = useState("Parcela #1");
  const [isWatering, setIsWatering] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaturationModalOpen, setIsSaturationModalOpen] = useState(false);
  const [isHumidityDetecting, setIsHumidityDetecting] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const [userRole, setUserRole] = useState(1);
  const [adminModal, setAdminModal] = useState(null);
  const detectionIntervalRef = useRef(null);
  const detectionTimeoutRef = useRef(null);
  const humidityRef = useRef(0);

  // Obtener el rol al cargar el componente
  useEffect(() => {
    const rol = localStorage.getItem("userRol");
    if (rol) {
      setUserRole(parseInt(rol));
    }
  }, []);

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRol");
    
    if (updateAuthStatus) {
      updateAuthStatus(false);
    }
    
    navigate("/", { replace: true });
  };

  // Actualizar la ref cuando cambia la humedad
  useEffect(() => {
    humidityRef.current = humidity;
  }, [humidity]);

  // Resetear valores al cambiar de parcela
  useEffect(() => {
    setHumidity(0);
    humidityRef.current = 0;
    setAlertMessage("");
    setAlertType("");
    setIsHumidityDetecting(false);
    
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
    if (detectionTimeoutRef.current) {
      clearTimeout(detectionTimeoutRef.current);
    }
  }, [selectedParcel]);

  // Simulación de detección de humedad
  useEffect(() => {
    if (isHumidityDetecting) {
      detectionIntervalRef.current = setInterval(() => {
        const humedadParcela = Math.floor(Math.random() * 100);
        setHumidity(humedadParcela);
      }, 2000);

      detectionTimeoutRef.current = setTimeout(() => {
        setIsHumidityDetecting(false);
        clearInterval(detectionIntervalRef.current);
        
        const currentHumidity = humidityRef.current;

        if (currentHumidity <= 35) {
          setAlertMessage("Parcela deshidratada, regar ahora.");
          setAlertType("warning");
        } else {
          setAlertMessage("Parcela hidratada, buen trabajo.");
          setAlertType("success");
        }
      }, 20000);
    }

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
      if (detectionTimeoutRef.current) {
        clearTimeout(detectionTimeoutRef.current);
      }
    };
  }, [isHumidityDetecting]);

  // Iniciar la detección de humedad
  const handleDetectHumidity = () => {
    setAlertMessage("");
    setAlertType("");
    setIsHumidityDetecting(true);
  };

  // Detener la detección de humedad manualmente
  const handleStopHumidityDetection = () => {
    setIsHumidityDetecting(false);
    
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
    if (detectionTimeoutRef.current) {
      clearTimeout(detectionTimeoutRef.current);
    }
    
    if (humidityRef.current <= 35) {
      setAlertMessage("Parcela deshidratada, regar ahora.");
      setAlertType("warning");
    } else {
      setAlertMessage("Parcela hidratada, buen trabajo.");
      setAlertType("success");
    }
  };

  // Iniciar el riego
  const handleWaterPlants = () => {
    setIsWatering(true);
    
    setTimeout(() => {
      setIsWatering(false);
      setAlertMessage("Parcela hidratada, buen trabajo.");
      setAlertType("success");
    }, 5000);
  };

  // Abrir modal de programar riego
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Cerrar modal de programar riego
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Abrir modal de saturación de agua
  const openSaturationModal = () => {
    setIsSaturationModalOpen(true);
  };

  // Cerrar modal de saturación de agua
  const closeSaturationModal = () => {
    setIsSaturationModalOpen(false);
  };

  // Funciones para modales de administración
  const openAdminModal = (modalType) => {
    setAdminModal(modalType);
  };

  const closeAdminModal = () => {
    setAdminModal(null);
  };

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

          <h1>Aplicación de Riego</h1>

          <div className="parcel-selector">
            <label>Seleccionar Parcela:</label>
            <select 
              value={selectedParcel} 
              onChange={(e) => setSelectedParcel(e.target.value)} 
              className="parcel-select"
            >
              <option value="Parcela #1">Parcela #1</option>
              <option value="Parcela #2">Parcela #2</option>
              <option value="Parcela #3">Parcela #3</option>
            </select>
          </div>

          <div className="humidity-container">
            <h2>Humedad del suelo en {selectedParcel}: {humidity}%</h2>
            {isHumidityDetecting && (
              <div className="detection-info">
                <p>Detectando humedad... (20 segundos)</p>
              </div>
            )}
          </div>

          {alertMessage && (
            <div className={`alert ${alertType === "warning" ? "alert-warning blinking" : "alert-success surprise"}`} style={{maxWidth: "100%"}}>
              <p>{alertMessage}</p>
            </div>
          )}
          
          <div className="buttons-container">
            <button 
              className="action-button transparent-button"
              onClick={isHumidityDetecting ? handleStopHumidityDetection : handleDetectHumidity}
              disabled={isWatering}
            >
              {isHumidityDetecting ? 'Detener Detección' : 'Detectar Humedad Del Suelo'}
            </button>
            
            <button 
              className={`action-button transparent-button ${isWatering ? 'watering' : ''}`}
              onClick={handleWaterPlants}
              disabled={isWatering || isHumidityDetecting}
            >
              {isWatering ? 'Regando...' : 'Regar según humedad'}
            </button>

            <button
              className="action-button transparent-button"
              onClick={openModal}
              disabled={isWatering || isHumidityDetecting}
            >
              <i className="fa fa-tint"></i> Programar Riego
            </button>

            <button
              className="action-button transparent-button"
              onClick={openSaturationModal}
            >
              <i className="fa fa-fire"></i> Ver Saturación de Agua
            </button>
          </div>

          {userRole === 2 && (
            <div className="admin-menu">
              <h3>Herramientas de Administración</h3>
              <div className="admin-buttons">
                <button 
                  className="action-button transparent-button"
                  onClick={() => openAdminModal('addParcel')}
                >
                  <i className="fa fa-plus"></i> Agregar Parcela
                </button>
                <button 
                  className="action-button transparent-button"
                  onClick={() => openAdminModal('deleteParcel')}
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
                  onClick={() => openAdminModal('mapDesign')}
                >
                  <i className="fa fa-map"></i> Diseñar Mapa
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
          
          {isWatering && (
            <div className="watering-indicator">
              <div className="watering-animation"></div>
              <p>Regando las plantas...</p>
            </div>
          )}
        </div>
      </div>

      <ModalProgramarRiego isOpen={isModalOpen} closeModal={closeModal} />
      
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
              <WaterSaturationMap onClose={closeSaturationModal} />
            </div>
          </div>
        </div>
      )}

      {/* Modales de Administración */}
      {adminModal === 'addParcel' && (
        <AdminParcelModal 
          isOpen={true} 
          closeModal={closeAdminModal} 
          action="add"
        />
      )}
      
      {adminModal === 'deleteParcel' && (
        <AdminParcelModal 
          isOpen={true} 
          closeModal={closeAdminModal} 
          action="delete"
        />
      )}
      
      {adminModal === 'reports' && (
        <AdminReportsModal 
          isOpen={true} 
          closeModal={closeAdminModal}
        />
      )}
      
      {adminModal === 'mapDesign' && (
        <AdminMapDesignModal 
          isOpen={true} 
          closeModal={closeAdminModal}
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