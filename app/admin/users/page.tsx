'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '../../hooks/useAuth';
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  type User,
} from '../../hooks/useUsers';
import AdminLayout from '../../components/AdminLayout';
import UserModal from '../../components/UserModal';
import ConfirmModal from '../../components/ConfirmModal';
import Toast from '../../components/Toast';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

export default function AdminUsers() {
  const { data: user } = useCurrentUser();
  const router = useRouter();
  const { data: users, isLoading } = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  const handleCreate = () => {
    setModalMode('create');
    setSelectedUser(null);
    setModalOpen(true);
  };

  const handleEdit = (userToEdit: User) => {
    setModalMode('edit');
    setSelectedUser(userToEdit);
    setModalOpen(true);
  };

  const handleSave = (userData: any) => {
    if (modalMode === 'create') {
      createUser.mutate(userData, {
        onSuccess: () => {
          setToast({
            message: '¡Usuario creado exitosamente!',
            type: 'success',
          });
          setModalOpen(false);
        },
        onError: (error: any) => {
          setToast({
            message:
              'Error al crear usuario: ' +
              (error.response?.data?.message || error.message),
            type: 'error',
          });
        },
      });
    } else if (selectedUser) {
      updateUser.mutate(
        { id: selectedUser.id, userData },
        {
          onSuccess: () => {
            setToast({
              message: '¡Usuario actualizado exitosamente!',
              type: 'success',
            });
            setModalOpen(false);
          },
          onError: (error: any) => {
            setToast({
              message:
                'Error al actualizar usuario: ' +
                (error.response?.data?.message || error.message),
              type: 'error',
            });
          },
        }
      );
    }
  };

  const handleDeleteClick = (userId: number) => {
    setUserToDelete(userId);
    setConfirmModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      deleteUser.mutate(userToDelete, {
        onSuccess: () => {
          setToast({
            message: '¡Usuario eliminado exitosamente!',
            type: 'success',
          });
          setConfirmModalOpen(false);
          setUserToDelete(null);
        },
        onError: (error: any) => {
          setToast({
            message:
              'Error al eliminar usuario: ' +
              (error.response?.data?.message || error.message),
            type: 'error',
          });
        },
      });
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <AdminLayout>
      <div className="admin-header">
        <h1>Gestión de Usuarios</h1>
        <p>Administra los usuarios del sistema</p>
      </div>

      <div className="admin-table-container">
        <div className="table-header">
          <h2>Todos los Usuarios</h2>
          <button className="btn-primary" onClick={handleCreate}>
            <AddIcon fontSize="small" />
            Nuevo
          </button>
        </div>
        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            Cargando...
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Fecha Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {!users || users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{ textAlign: 'center', padding: '2rem' }}
                    >
                      No hay usuarios
                    </td>
                  </tr>
                ) : (
                  users.map((userItem: User) => (
                    <tr key={userItem.id}>
                      <td data-label="ID">#{userItem.id}</td>
                      <td data-label="Nombre">{userItem.name}</td>
                      <td data-label="Email">{userItem.email}</td>
                      <td data-label="Rol">
                        <span
                          className={`status-badge ${
                            userItem.role === 'admin' ? 'aprobada' : 'pendiente'
                          }`}
                        >
                          {userItem.role}
                        </span>
                      </td>
                      <td data-label="Fecha">
                        {new Date(userItem.createdAt).toLocaleDateString()}
                      </td>
                      <td data-label="Acciones">
                        <div className="table-actions">
                          <button
                            className="btn-icon edit"
                            onClick={() => handleEdit(userItem)}
                            title="Editar"
                          >
                            <EditIcon />
                          </button>
                          <button
                            className="btn-icon delete"
                            onClick={() => handleDeleteClick(userItem.id)}
                            title="Eliminar"
                          >
                            <DeleteIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <UserModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        user={selectedUser}
        mode={modalMode}
      />

      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Usuario"
        message="¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </AdminLayout>
  );
}
