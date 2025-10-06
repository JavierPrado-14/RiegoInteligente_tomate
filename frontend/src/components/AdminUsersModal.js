// frontend/src/components/AdminUsersModal.js
import React, { useEffect, useState } from 'react';
import './AdminModals.css';

const AdminUsersModal = ({ isOpen, closeModal }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', role: 1 });

  const API_BASE_URL = "http://localhost:4000/api";

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al listar usuarios');
      const data = await res.json();
      // Mapear campos a UI esperada
      const mapped = data.map(u => ({
        id: u.id,
        username: u.nombre_usuario,
        email: u.correo,
        role: u.rol
      }));
      setUsers(mapped);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({ username: user.username, email: user.email, role: user.role });
    setEditMode(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_BASE_URL}/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre_usuario: formData.username,
          correo: formData.email,
          rol: formData.role
        })
      });
      if (!res.ok) throw new Error('No se pudo actualizar el usuario');
      await fetchUsers();
      setEditMode(false);
      setSelectedUser(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('No se pudo eliminar el usuario');
      await fetchUsers();
    } catch (e) {
      console.error(e);
    }
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