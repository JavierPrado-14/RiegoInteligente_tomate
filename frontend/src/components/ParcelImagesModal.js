// frontend/src/components/ParcelImagesModal.js
import React, { useState, useEffect } from 'react';
import './ParcelImagesModal.css';

const ParcelImagesModal = ({ isOpen, closeModal, parcel }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (isOpen && parcel) {
      fetchImages();
    }
  }, [isOpen, parcel]);

  const fetchImages = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:4000/api/images/parcel/${parcel.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setImages(data.images);
      }
    } catch (error) {
      console.error('Error al cargar imágenes:', error);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Por favor selecciona una imagen');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('description', description);

      const response = await fetch(`http://localhost:4000/api/images/upload/${parcel.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al subir imagen');
      }

      alert('✅ Imagen subida exitosamente');
      
      // Limpiar formulario
      setSelectedFile(null);
      setDescription('');
      setPreviewUrl(null);
      
      // Recargar imágenes
      await fetchImages();

    } catch (error) {
      console.error('Error al subir imagen:', error);
      alert('Error al subir imagen: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (imageId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta imagen?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:4000/api/images/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar imagen');
      }

      alert('Imagen eliminada exitosamente');
      await fetchImages();

    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      alert('Error al eliminar imagen: ' + error.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-images-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <i className="fa fa-camera"></i> Fotos de {parcel?.name}
          </h2>
          <button className="btn-close-modal" onClick={closeModal}>
            <i className="fa fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          {/* Sección de subida */}
          <div className="upload-section">
            <h3><i className="fa fa-upload"></i> Subir Nueva Foto</h3>
            
            <div className="upload-form">
              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="image-file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="file-input"
                />
                <label htmlFor="image-file" className="file-label">
                  <i className="fa fa-image"></i> Seleccionar Imagen
                </label>
                {selectedFile && (
                  <span className="file-name">{selectedFile.name}</span>
                )}
              </div>

              {previewUrl && (
                <div className="preview-container">
                  <img src={previewUrl} alt="Preview" className="preview-image" />
                </div>
              )}

              <textarea
                placeholder="Descripción (opcional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="description-input"
                rows="3"
              />

              <button
                onClick={handleUpload}
                disabled={!selectedFile || loading}
                className="btn-upload"
              >
                {loading ? (
                  <>
                    <i className="fa fa-spinner fa-spin"></i> Subiendo...
                  </>
                ) : (
                  <>
                    <i className="fa fa-cloud-upload"></i> Subir Foto
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Galería de imágenes */}
          <div className="gallery-section">
            <h3>
              <i className="fa fa-images"></i> Galería ({images.length} {images.length === 1 ? 'foto' : 'fotos'})
            </h3>

            {images.length === 0 ? (
              <div className="no-images">
                <i className="fa fa-image"></i>
                <p>No hay fotos guardadas para esta parcela</p>
                <p className="hint">Sube tu primera foto usando el formulario arriba</p>
              </div>
            ) : (
              <div className="images-grid">
                {images.map(image => (
                  <div key={image.id} className="image-card">
                    <div 
                      className="image-thumbnail"
                      onClick={() => setSelectedImage(image)}
                    >
                      <img 
                        src={`http://localhost:4000${image.image_url}`} 
                        alt={image.image_name}
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="%23ddd" width="200" height="200"/><text fill="%23999" x="50%" y="50%" text-anchor="middle" dy=".3em">Imagen no disponible</text></svg>';
                        }}
                      />
                      <div className="image-overlay">
                        <i className="fa fa-search-plus"></i> Ver
                      </div>
                    </div>
                    
                    <div className="image-info">
                      <div className="image-meta">
                        <span className="image-date">
                          <i className="fa fa-calendar"></i>{' '}
                          {new Date(image.uploaded_at).toLocaleDateString('es-GT')}
                        </span>
                        <span className="image-size">
                          {(image.file_size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      
                      {image.description && (
                        <p className="image-description">{image.description}</p>
                      )}
                      
                      <button
                        className="btn-delete-image"
                        onClick={() => handleDelete(image.id)}
                      >
                        <i className="fa fa-trash"></i> Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal para ver imagen en grande */}
        {selectedImage && (
          <div className="lightbox-overlay" onClick={() => setSelectedImage(null)}>
            <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
              <button 
                className="lightbox-close"
                onClick={() => setSelectedImage(null)}
              >
                <i className="fa fa-times"></i>
              </button>
              <img 
                src={`http://localhost:4000${selectedImage.image_url}`} 
                alt={selectedImage.image_name}
                className="lightbox-image"
              />
              <div className="lightbox-info">
                <h3>{selectedImage.image_name}</h3>
                {selectedImage.description && <p>{selectedImage.description}</p>}
                <span className="lightbox-date">
                  {new Date(selectedImage.uploaded_at).toLocaleString('es-GT')}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParcelImagesModal;

