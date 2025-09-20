// frontend/src/components/AdminUsersModal.js
import React, { useState } from 'react';
import './AdminModals.css';

const AdminUsersModal = ({ isOpen, closeModal }) => {
  const [users, setUsers] = useState([
    { id: 1, username: 'usuario1', email: 'usuario1@example.com', role: 1 },
    { id: 2, username: 'admin1', email: 'admin1@example.com', role: 2 }
  ]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', role: 1 });

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({ username: user.username, email: user.email, role: user.role });
    setEditMode(true);
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    // Lógica para guardar los cambios del usuario
    console.log('Guardando usuario:', formData);
    // Aquí se haría la llamada al backend para actualizar el usuario
    setEditMode(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = (userId) => {
    // Lógica para eliminar usuario
    console.log('Eliminando usuario:', userId);
    // Aquí se haría la llamada al backend para eliminar el usuario
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="admin-modal">
        <div className="modal-header">
          <h2>Gestión de Usuarios</h2>
          <button className="close-button" onClick={closeModal}>
            &times;
          </button>
        </div>
        <div className="modal-content">
          {!editMode ? (
            <div>
              <h3>Lista de Usuarios</h3>
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{user.role === 1 ? 'Usuario' : 'Administrador'}</td>
                      <td>
                        <button onClick={() => handleEditUser(user)}>Editar</button>
                        <button onClick={() => handleDeleteUser(user.id)}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <form onSubmit={handleSaveUser}>
              <h3>Editando Usuario: {selectedUser.username}</h3>
              <div className="form-group">
                <label htmlFor="username">Nombre de Usuario:</label>
                <input
                  type="text"
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="role">Rol:</label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: parseInt(e.target.value)})}
                >
                  <option value={1}>Usuario</option>
                  <option value={2}>Administrador</option>
                </select>
              </div>
              <div className="modal-buttons">
                <button type="button" onClick={() => setEditMode(false)}>
                  Cancelar
                </button>
                <button type="submit">
                  Guardar Cambios
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsersModal;